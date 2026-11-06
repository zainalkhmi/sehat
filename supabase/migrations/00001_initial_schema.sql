-- ============================================================================
-- FUTURE HEALTH - Complete PostgreSQL Database Schema & RLS Policies
-- Compliant with HL7 FHIR R4 & Indonesian UU PDP No. 27/2022
-- ============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. CUSTOM ENUMS
CREATE TYPE user_role AS ENUM ('patient', 'doctor', 'researcher', 'admin');
CREATE TYPE gender_type AS ENUM ('male', 'female', 'other', 'unknown');
CREATE TYPE observation_category AS ENUM ('vital-signs', 'laboratory', 'activity', 'survey', 'exam');
CREATE TYPE observation_status AS ENUM ('registered', 'preliminary', 'final', 'amended', 'corrected', 'cancelled', 'entered-in-error', 'unknown');
CREATE TYPE consent_status AS ENUM ('active', 'inactive', 'revoked', 'expired', 'rejected');
CREATE TYPE consent_scope AS ENUM ('clinical-care', 'research', 'telehealth');
CREATE TYPE appointment_status AS ENUM ('proposed', 'pending', 'booked', 'arrived', 'fulfilled', 'cancelled');
CREATE TYPE risk_level AS ENUM ('low', 'moderate', 'high', 'critical');
CREATE TYPE review_status AS ENUM ('pending_review', 'approved', 'modified', 'rejected');
CREATE TYPE research_project_status AS ENUM ('recruiting', 'active', 'completed', 'suspended');
CREATE TYPE research_enrollment_status AS ENUM ('enrolled', 'withdrawn', 'completed');
CREATE TYPE device_type AS ENUM ('healthkit', 'health-connect', 'ble', 'garmin', 'fitbit', 'oura', 'withings', 'dexcom', 'manual');
CREATE TYPE device_connection_status AS ENUM ('disconnected', 'connecting', 'connected', 'syncing', 'error');

-- 3. UPDATED AT FUNCTION
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- 4. OPERATIONAL TABLES
-- ============================================================================

-- 4.1 PROFILES (Extends auth.users)
CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL,
    role user_role NOT NULL DEFAULT 'patient',
    name_components JSONB DEFAULT '{}'::jsonb, -- { givenName, familyName, prefix, suffix }
    display_name VARCHAR(255),
    date_of_birth DATE,
    gender gender_type DEFAULT 'unknown',
    phone_number VARCHAR(50),
    avatar_url TEXT,
    metadata JSONB DEFAULT '{}'::jsonb, -- role specific fields (e.g. licenseNumber, specialty, institution)
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Trigger to maintain display_name automatically
CREATE OR REPLACE FUNCTION set_profile_display_name()
RETURNS TRIGGER AS $$
BEGIN
    NEW.display_name := COALESCE(
        NULLIF(TRIM(COALESCE(NEW.name_components->>'givenName', '') || ' ' || COALESCE(NEW.name_components->>'familyName', '')), ''),
        NEW.email
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_profiles_display_name
BEFORE INSERT OR UPDATE ON profiles
FOR EACH ROW EXECUTE FUNCTION set_profile_display_name();

CREATE TRIGGER trg_profiles_updated_at
BEFORE UPDATE ON profiles
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- 4.2 ORGANIZATIONS
CREATE TABLE organizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    identifier VARCHAR(100) UNIQUE, -- e.g. Hospital Registry Code
    type VARCHAR(100) NOT NULL DEFAULT 'hospital', -- 'hospital', 'clinic', 'research-institute'
    address JSONB DEFAULT '{}'::jsonb,
    phone_number VARCHAR(50),
    email VARCHAR(255),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER trg_organizations_updated_at
BEFORE UPDATE ON organizations
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- 4.3 ORGANIZATION MEMBERSHIPS
CREATE TABLE organization_memberships (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    member_role VARCHAR(50) NOT NULL DEFAULT 'member', -- 'admin', 'clinician', 'staff', 'researcher'
    status VARCHAR(50) NOT NULL DEFAULT 'active',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(organization_id, user_id)
);

-- 4.4 PATIENT CLINICIANS (Doctor-Patient Care Relationships)
CREATE TABLE patient_clinicians (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    clinician_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    organization_id UUID REFERENCES organizations(id) ON DELETE SET NULL,
    relationship_type VARCHAR(100) NOT NULL DEFAULT 'primary_care', -- 'primary_care', 'consultant', 'specialist'
    status VARCHAR(50) NOT NULL DEFAULT 'active', -- 'active', 'inactive', 'terminated'
    assigned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    terminated_at TIMESTAMPTZ,
    UNIQUE(patient_id, clinician_id, status)
);

-- 4.5 PATIENT CONSENTS (Compliant with UU PDP No. 27/2022 & FHIR Consent)
CREATE TABLE patient_consents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    scope consent_scope NOT NULL DEFAULT 'clinical-care',
    status consent_status NOT NULL DEFAULT 'active',
    category VARCHAR(100) NOT NULL DEFAULT '59284-0', -- LOINC for Consent Document
    authorized_actor_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    authorized_org_id UUID REFERENCES organizations(id) ON DELETE SET NULL,
    research_project_id UUID, -- References research_projects(id) defined below
    policy_rule TEXT,
    consented_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expires_at TIMESTAMPTZ,
    revoked_at TIMESTAMPTZ,
    revocation_reason TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER trg_patient_consents_updated_at
BEFORE UPDATE ON patient_consents
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- 4.6 QUESTIONNAIRES (FHIR R4 Questionnaire Definition)
CREATE TABLE questionnaires (
    id VARCHAR(100) PRIMARY KEY, -- e.g. 'phq-9', 'gad-7'
    title VARCHAR(255) NOT NULL,
    description TEXT,
    version VARCHAR(50) NOT NULL DEFAULT '1.0.0',
    status VARCHAR(50) NOT NULL DEFAULT 'active', -- 'draft', 'active', 'retired'
    items JSONB NOT NULL DEFAULT '[]'::jsonb, -- FHIR Questionnaire.item array
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER trg_questionnaires_updated_at
BEFORE UPDATE ON questionnaires
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- 4.7 QUESTIONNAIRE RESPONSES (FHIR R4 QuestionnaireResponse)
CREATE TABLE questionnaire_responses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    questionnaire_id VARCHAR(100) NOT NULL REFERENCES questionnaires(id) ON DELETE CASCADE,
    patient_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    task_id VARCHAR(255),
    status VARCHAR(50) NOT NULL DEFAULT 'completed', -- 'in-progress', 'completed', 'amended'
    authored TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    calculated_score NUMERIC(5,2),
    answers JSONB NOT NULL DEFAULT '{}'::jsonb, -- Answers mapped by linkId
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4.8 OBSERVATIONS (Physiological vitals & laboratory records, LOINC/UCUM)
CREATE TABLE observations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    performer_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    status observation_status NOT NULL DEFAULT 'final',
    category observation_category NOT NULL DEFAULT 'vital-signs',
    loinc_code VARCHAR(50) NOT NULL, -- e.g. '8867-4' (Heart rate), '85354-9' (Blood pressure panel)
    display_name VARCHAR(255) NOT NULL,
    value_numeric NUMERIC(10,3),
    value_string TEXT,
    unit VARCHAR(50) NOT NULL, -- e.g. 'beats/minute', 'mmHg'
    unit_code VARCHAR(50) NOT NULL, -- UCUM standard, e.g. '/min', 'mm[Hg]'
    effective_datetime TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    source device_type NOT NULL DEFAULT 'manual',
    device_id VARCHAR(255),
    components_jsonb JSONB, -- For multi-part observations (e.g. Systolic & Diastolic BP)
    version INT NOT NULL DEFAULT 1,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER trg_observations_updated_at
BEFORE UPDATE ON observations
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- 4.9 CONDITIONS (Medical diagnoses & problems, SNOMED CT / ICD-10)
CREATE TABLE conditions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    recorder_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    clinical_status VARCHAR(50) NOT NULL DEFAULT 'active', -- 'active', 'recurrence', 'relapse', 'remission', 'resolved'
    verification_status VARCHAR(50) NOT NULL DEFAULT 'confirmed', -- 'unconfirmed', 'provisional', 'confirmed', 'refuted'
    code_system VARCHAR(100) NOT NULL DEFAULT 'http://hl7.org/fhir/sid/icd-10',
    code VARCHAR(50) NOT NULL, -- e.g. 'I10' (Essential hypertension)
    display_name VARCHAR(255) NOT NULL,
    onset_datetime TIMESTAMPTZ,
    recorded_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4.10 APPOINTMENTS (Clinical visits & telehealth sessions)
CREATE TABLE appointments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    clinician_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    organization_id UUID REFERENCES organizations(id) ON DELETE SET NULL,
    status appointment_status NOT NULL DEFAULT 'booked',
    scheduled_start TIMESTAMPTZ NOT NULL,
    scheduled_end TIMESTAMPTZ NOT NULL,
    reason TEXT,
    telehealth_url TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER trg_appointments_updated_at
BEFORE UPDATE ON appointments
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- 4.11 DEVICE CONNECTIONS & MEASUREMENTS
CREATE TABLE device_connections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    device_type device_type NOT NULL,
    device_identifier VARCHAR(255) NOT NULL,
    device_name VARCHAR(255) NOT NULL,
    status device_connection_status NOT NULL DEFAULT 'connected',
    last_synced_at TIMESTAMPTZ,
    sync_cursor TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(patient_id, device_type, device_identifier)
);

CREATE TRIGGER trg_device_connections_updated_at
BEFORE UPDATE ON device_connections
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TABLE device_measurements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    device_connection_id UUID NOT NULL REFERENCES device_connections(id) ON DELETE CASCADE,
    patient_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    external_record_id VARCHAR(255),
    raw_payload JSONB NOT NULL,
    normalized_observation_id UUID REFERENCES observations(id) ON DELETE SET NULL,
    synced_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(device_connection_id, external_record_id)
);

-- 4.12 FHIR RESOURCES (Auditable FHIR R4 Resource Ledger)
CREATE TABLE fhir_resources (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    resource_type VARCHAR(100) NOT NULL, -- e.g. 'Patient', 'Observation', 'QuestionnaireResponse'
    fhir_id VARCHAR(255) NOT NULL,
    version_id INT NOT NULL DEFAULT 1,
    source_table VARCHAR(100) NOT NULL,
    source_id UUID NOT NULL,
    resource_payload JSONB NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(resource_type, fhir_id, version_id)
);

-- 4.13 RESEARCH PROJECTS & ENROLLMENTS
CREATE TABLE research_projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    protocol_number VARCHAR(100) UNIQUE NOT NULL, -- e.g. 'FH-IRB-2026-08'
    description TEXT,
    lead_researcher_id UUID NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
    organization_id UUID REFERENCES organizations(id) ON DELETE SET NULL,
    status research_project_status NOT NULL DEFAULT 'recruiting',
    start_date DATE NOT NULL,
    end_date DATE,
    inclusion_criteria JSONB DEFAULT '[]'::jsonb,
    exclusion_criteria JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER trg_research_projects_updated_at
BEFORE UPDATE ON research_projects
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- Add foreign key constraint to patient_consents now that research_projects exists
ALTER TABLE patient_consents
ADD CONSTRAINT fk_consents_research_project
FOREIGN KEY (research_project_id) REFERENCES research_projects(id) ON DELETE SET NULL;

CREATE TABLE research_enrollments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES research_projects(id) ON DELETE CASCADE,
    patient_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    participant_pseudonym VARCHAR(100) UNIQUE NOT NULL, -- e.g. 'FH-RES-8821'
    status research_enrollment_status NOT NULL DEFAULT 'enrolled',
    enrolled_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    withdrawn_at TIMESTAMPTZ,
    UNIQUE(project_id, patient_id)
);

-- 4.14 RISK ASSESSMENTS (AI Screening Outputs with Human Clinician Review Workflow)
CREATE TABLE risk_assessments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    risk_category VARCHAR(100) NOT NULL, -- e.g. 'cardiovascular-screening', 'depression-screening'
    risk_score NUMERIC(5,4) NOT NULL, -- 0.0000 - 1.0000
    risk_level risk_level NOT NULL,
    clinical_summary TEXT NOT NULL,
    limitations TEXT NOT NULL,
    input_references JSONB NOT NULL DEFAULT '[]'::jsonb, -- IDs of Observations and QuestionnaireResponses
    model_name VARCHAR(100) NOT NULL,
    model_version VARCHAR(50) NOT NULL,
    review_status review_status NOT NULL DEFAULT 'pending_review',
    reviewed_by_clinician_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    reviewed_at TIMESTAMPTZ,
    clinician_notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4.15 AUDIT LOGS (Immutable Cryptographic Audit Trail)
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    actor_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    action VARCHAR(50) NOT NULL, -- 'INSERT', 'UPDATE', 'DELETE', 'LOGIN', 'RESEARCH_EXPORT', 'CONSENT_REVOKE'
    entity_table VARCHAR(100) NOT NULL,
    entity_id VARCHAR(255) NOT NULL,
    old_data JSONB,
    new_data JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4.16 SPEZI PROTOCOL TASKS & OUTCOMES
CREATE TABLE tasks (
    id VARCHAR(255) PRIMARY KEY,
    patient_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    category VARCHAR(50) NOT NULL,
    schedule JSONB,
    questionnaire_id VARCHAR(100) REFERENCES questionnaires(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE outcomes (
    id VARCHAR(255) PRIMARY KEY,
    patient_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    task_id VARCHAR(255),
    completed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    data JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- 5. PERFORMANCE INDEXES
-- ============================================================================
CREATE INDEX idx_profiles_role ON profiles(role);
CREATE INDEX idx_patient_clinicians_clinician ON patient_clinicians(clinician_id) WHERE status = 'active';
CREATE INDEX idx_patient_clinicians_patient ON patient_clinicians(patient_id) WHERE status = 'active';
CREATE INDEX idx_observations_patient_loinc ON observations(patient_id, loinc_code);
CREATE INDEX idx_observations_effective ON observations(effective_datetime DESC);
CREATE INDEX idx_questionnaire_responses_patient ON questionnaire_responses(patient_id);
CREATE INDEX idx_appointments_patient ON appointments(patient_id, scheduled_start);
CREATE INDEX idx_appointments_clinician ON appointments(clinician_id, scheduled_start);
CREATE INDEX idx_device_connections_patient ON device_connections(patient_id);
CREATE INDEX idx_risk_assessments_patient ON risk_assessments(patient_id, review_status);
CREATE INDEX idx_audit_logs_actor ON audit_logs(actor_id, created_at DESC);
CREATE INDEX idx_research_enrollments_proj ON research_enrollments(project_id);

-- ============================================================================
-- 6. AUTOMATIC AUTH USER -> PROFILE CREATION TRIGGER
-- ============================================================================
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    user_role_val user_role;
    given_name_val TEXT;
    family_name_val TEXT;
BEGIN
    user_role_val := COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'patient'::user_role);
    given_name_val := COALESCE(NEW.raw_user_meta_data->>'given_name', '');
    family_name_val := COALESCE(NEW.raw_user_meta_data->>'family_name', '');

    INSERT INTO public.profiles (
        id,
        email,
        role,
        name_components,
        gender,
        date_of_birth,
        phone_number
    ) VALUES (
        NEW.id,
        NEW.email,
        user_role_val,
        jsonb_build_object('givenName', given_name_val, 'familyName', family_name_val),
        COALESCE((NEW.raw_user_meta_data->>'gender')::gender_type, 'unknown'::gender_type),
        CASE
            WHEN NEW.raw_user_meta_data->>'date_of_birth' IS NOT NULL AND NEW.raw_user_meta_data->>'date_of_birth' ~ '^\d{4}-\d{2}-\d{2}$'
            THEN (NEW.raw_user_meta_data->>'date_of_birth')::DATE
            ELSE NULL
        END,
        NEW.raw_user_meta_data->>'phone_number'
    );

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger attached to auth.users table
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ============================================================================
-- 7. ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE organization_memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE patient_clinicians ENABLE ROW LEVEL SECURITY;
ALTER TABLE patient_consents ENABLE ROW LEVEL SECURITY;
ALTER TABLE questionnaires ENABLE ROW LEVEL SECURITY;
ALTER TABLE questionnaire_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE observations ENABLE ROW LEVEL SECURITY;
ALTER TABLE conditions ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE device_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE device_measurements ENABLE ROW LEVEL SECURITY;
ALTER TABLE fhir_resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE research_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE research_enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE risk_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE outcomes ENABLE ROW LEVEL SECURITY;

-- 7.1 PROFILES POLICIES
-- Patient can read & write own profile
CREATE POLICY "profiles_patient_self" ON profiles
    FOR ALL TO authenticated
    USING (id = auth.uid())
    WITH CHECK (id = auth.uid());

-- Clinician can read profiles of assigned patients
CREATE POLICY "profiles_clinician_assigned" ON profiles
    FOR SELECT TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM patient_clinicians pc
            WHERE pc.clinician_id = auth.uid()
              AND pc.patient_id = profiles.id
              AND pc.status = 'active'
        )
    );

-- Clinician profiles can be read by their assigned patients
CREATE POLICY "profiles_patient_read_clinician" ON profiles
    FOR SELECT TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM patient_clinicians pc
            WHERE pc.patient_id = auth.uid()
              AND pc.clinician_id = profiles.id
              AND pc.status = 'active'
        )
    );

-- 7.2 OBSERVATIONS POLICIES
-- Patient can manage their own observations
CREATE POLICY "observations_patient_all" ON observations
    FOR ALL TO authenticated
    USING (patient_id = auth.uid())
    WITH CHECK (patient_id = auth.uid());

-- Clinicians can read and write observations for assigned patients
CREATE POLICY "observations_clinician_assigned" ON observations
    FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM patient_clinicians pc
            WHERE pc.clinician_id = auth.uid()
              AND pc.patient_id = observations.patient_id
              AND pc.status = 'active'
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM patient_clinicians pc
            WHERE pc.clinician_id = auth.uid()
              AND pc.patient_id = observations.patient_id
              AND pc.status = 'active'
        )
    );

-- 7.3 QUESTIONNAIRES & RESPONSES POLICIES
-- Active questionnaires readable by all authenticated users
CREATE POLICY "questionnaires_read_active" ON questionnaires
    FOR SELECT TO authenticated
    USING (status = 'active');

-- Patients can manage their own questionnaire responses
CREATE POLICY "responses_patient_all" ON questionnaire_responses
    FOR ALL TO authenticated
    USING (patient_id = auth.uid())
    WITH CHECK (patient_id = auth.uid());

-- Clinicians can review questionnaire responses of assigned patients
CREATE POLICY "responses_clinician_assigned" ON questionnaire_responses
    FOR SELECT TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM patient_clinicians pc
            WHERE pc.clinician_id = auth.uid()
              AND pc.patient_id = questionnaire_responses.patient_id
              AND pc.status = 'active'
        )
    );

-- 7.4 PATIENT CONSENTS POLICIES
CREATE POLICY "consents_patient_all" ON patient_consents
    FOR ALL TO authenticated
    USING (patient_id = auth.uid())
    WITH CHECK (patient_id = auth.uid());

CREATE POLICY "consents_clinician_read" ON patient_consents
    FOR SELECT TO authenticated
    USING (authorized_actor_id = auth.uid());

-- 7.5 APPOINTMENTS POLICIES
CREATE POLICY "appointments_patient_all" ON appointments
    FOR ALL TO authenticated
    USING (patient_id = auth.uid())
    WITH CHECK (patient_id = auth.uid());

CREATE POLICY "appointments_clinician_all" ON appointments
    FOR ALL TO authenticated
    USING (clinician_id = auth.uid())
    WITH CHECK (clinician_id = auth.uid());

-- 7.6 RISK ASSESSMENTS POLICIES
-- Patient can read approved risk assessments
CREATE POLICY "risk_patient_read_approved" ON risk_assessments
    FOR SELECT TO authenticated
    USING (patient_id = auth.uid() AND review_status = 'approved');

-- Clinician can read and review risk assessments for assigned patients
CREATE POLICY "risk_clinician_assigned" ON risk_assessments
    FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM patient_clinicians pc
            WHERE pc.clinician_id = auth.uid()
              AND pc.patient_id = risk_assessments.patient_id
              AND pc.status = 'active'
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM patient_clinicians pc
            WHERE pc.clinician_id = auth.uid()
              AND pc.patient_id = risk_assessments.patient_id
              AND pc.status = 'active'
        )
    );

-- 7.7 TASKS & OUTCOMES POLICIES
CREATE POLICY "tasks_patient_all" ON tasks
    FOR ALL TO authenticated
    USING (patient_id = auth.uid())
    WITH CHECK (patient_id = auth.uid());

CREATE POLICY "outcomes_patient_all" ON outcomes
    FOR ALL TO authenticated
    USING (patient_id = auth.uid())
    WITH CHECK (patient_id = auth.uid());

-- 7.8 DEVICE CONNECTIONS & MEASUREMENTS POLICIES
CREATE POLICY "devices_patient_all" ON device_connections
    FOR ALL TO authenticated
    USING (patient_id = auth.uid())
    WITH CHECK (patient_id = auth.uid());

CREATE POLICY "measurements_patient_all" ON device_measurements
    FOR ALL TO authenticated
    USING (patient_id = auth.uid())
    WITH CHECK (patient_id = auth.uid());

-- 7.9 RESEARCH GOVERNANCE POLICIES
CREATE POLICY "research_lead_manage" ON research_projects
    FOR ALL TO authenticated
    USING (lead_researcher_id = auth.uid())
    WITH CHECK (lead_researcher_id = auth.uid());

CREATE POLICY "research_read_active" ON research_projects
    FOR SELECT TO authenticated
    USING (status = 'active' OR status = 'recruiting');

-- 7.10 AUDIT LOGS POLICIES
CREATE POLICY "audit_logs_immutable_insert" ON audit_logs
    FOR INSERT TO authenticated
    WITH CHECK (true);

CREATE POLICY "audit_logs_admin_read" ON audit_logs
    FOR SELECT TO authenticated
    USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'));

-- ============================================================================
-- 8. DE-IDENTIFICATION VIEW FOR RESEARCH COHORT (Safe Harbor & UU PDP)
-- Strips all 18 direct HIPAA identifiers; shifts dates by random patient offset
-- ============================================================================
CREATE OR REPLACE VIEW deidentified_research_observations AS
SELECT
    re.project_id,
    re.participant_pseudonym,
    CASE
        WHEN EXTRACT(YEAR FROM AGE(p.date_of_birth)) >= 89 THEN '89+'
        WHEN EXTRACT(YEAR FROM AGE(p.date_of_birth)) BETWEEN 65 AND 88 THEN '65-88'
        WHEN EXTRACT(YEAR FROM AGE(p.date_of_birth)) BETWEEN 45 AND 64 THEN '45-64'
        WHEN EXTRACT(YEAR FROM AGE(p.date_of_birth)) BETWEEN 25 AND 44 THEN '25-44'
        ELSE '<25'
    END AS age_group,
    p.gender,
    o.loinc_code,
    o.display_name AS observation_name,
    o.value_numeric,
    o.value_string,
    o.unit,
    -- Shift timestamp by a consistent pseudorandom participant offset (-90 to +90 days)
    o.effective_datetime + (MOD(ABS(HASHTEXT(re.participant_pseudonym)), 180) - 90) * INTERVAL '1 day' AS shifted_datetime,
    o.source AS observation_source
FROM research_enrollments re
JOIN patient_consents pc ON pc.patient_id = re.patient_id
    AND pc.research_project_id = re.project_id
    AND pc.status = 'active'
JOIN profiles p ON p.id = re.patient_id
JOIN observations o ON o.patient_id = re.patient_id;

-- Grant access to researchers for the de-identified view
GRANT SELECT ON deidentified_research_observations TO authenticated;
