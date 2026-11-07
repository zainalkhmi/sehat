-- ============================================================================
-- 00003_patient_medications.sql
-- Medication adherence, stock control, expiry tracking, and dosage control
-- Compliant with HL7 FHIR MedicationRequest & UU PDP No. 27/2022
-- ============================================================================

CREATE TABLE IF NOT EXISTS patient_medications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    prescribing_doctor_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    organization_id UUID REFERENCES organizations(id) ON DELETE SET NULL,
    name VARCHAR(255) NOT NULL,
    brand_name VARCHAR(255),
    strength VARCHAR(100) NOT NULL DEFAULT '5 mg',
    dosage_form VARCHAR(100) NOT NULL DEFAULT 'tablet', -- 'tablet', 'kapsul', 'sirup', 'injeksi'
    dose_per_intake NUMERIC NOT NULL DEFAULT 1, -- berapa butir/tablet yang diset harus diminum sekali minum
    dose_unit VARCHAR(50) NOT NULL DEFAULT 'tablet',
    frequency VARCHAR(100) NOT NULL DEFAULT '1x sehari',
    schedule_times JSONB NOT NULL DEFAULT '["08:00"]'::jsonb, -- e.g. ["08:00", "20:00"]
    instruction VARCHAR(100) NOT NULL DEFAULT 'after_meal', -- 'before_meal', 'after_meal', 'with_meal', 'bedtime'
    indication TEXT, -- e.g. 'Kontrol Tekanan Darah (Antihipertensi)'
    current_stock INTEGER NOT NULL DEFAULT 30, -- Sisa stok butir obat saat ini
    initial_stock INTEGER NOT NULL DEFAULT 30,
    minimum_stock_alert INTEGER NOT NULL DEFAULT 7, -- Ambang batas peringatan stok menipis
    expiry_date DATE NOT NULL, -- Tanggal kadaluarsa obat
    batch_number VARCHAR(100), -- Nomor batch pabrik
    status VARCHAR(50) NOT NULL DEFAULT 'active', -- 'active', 'completed', 'discontinued'
    color VARCHAR(20) DEFAULT '#007AFF',
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Index for efficient querying by patient and status
CREATE INDEX IF NOT EXISTS idx_patient_medications_patient ON patient_medications(patient_id, status);
CREATE INDEX IF NOT EXISTS idx_patient_medications_expiry ON patient_medications(expiry_date);

-- Table for logging medication intakes (Adherence logs)
CREATE TABLE IF NOT EXISTS medication_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    medication_id UUID NOT NULL REFERENCES patient_medications(id) ON DELETE CASCADE,
    patient_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    status VARCHAR(50) NOT NULL DEFAULT 'taken', -- 'taken', 'skipped', 'snoozed'
    dose_taken NUMERIC NOT NULL DEFAULT 1,
    scheduled_time TIMESTAMPTZ NOT NULL,
    taken_at TIMESTAMPTZ,
    skip_reason TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_medication_logs_med ON medication_logs(medication_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_medication_logs_patient ON medication_logs(patient_id, created_at DESC);

-- Automated Trigger to reduce current_stock when an intake is logged as 'taken'
CREATE OR REPLACE FUNCTION handle_medication_taken()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'taken' THEN
        UPDATE patient_medications
        SET current_stock = GREATEST(0, current_stock - COALESCE(NEW.dose_taken, 1)),
            updated_at = timezone('utc'::text, now())
        WHERE id = NEW.medication_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_medication_taken ON medication_logs;
CREATE TRIGGER trg_medication_taken
AFTER INSERT ON medication_logs
FOR EACH ROW
EXECUTE FUNCTION handle_medication_taken();

-- Enable RLS
ALTER TABLE patient_medications ENABLE ROW LEVEL SECURITY;
ALTER TABLE medication_logs ENABLE ROW LEVEL SECURITY;

-- Policies for patient_medications
CREATE POLICY "patient_medications_patient_all" ON patient_medications
FOR ALL TO authenticated
USING (auth.uid() = patient_id)
WITH CHECK (auth.uid() = patient_id);

CREATE POLICY "patient_medications_clinician_read" ON patient_medications
FOR SELECT TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM patient_clinicians pc
        WHERE pc.clinician_id = auth.uid()
          AND pc.patient_id = patient_medications.patient_id
          AND pc.status = 'active'
    )
);

CREATE POLICY "patient_medications_clinician_write" ON patient_medications
FOR ALL TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM patient_clinicians pc
        WHERE pc.clinician_id = auth.uid()
          AND pc.patient_id = patient_medications.patient_id
          AND pc.status = 'active'
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM patient_clinicians pc
        WHERE pc.clinician_id = auth.uid()
          AND pc.patient_id = patient_medications.patient_id
          AND pc.status = 'active'
    )
);

-- Policies for medication_logs
CREATE POLICY "medication_logs_patient_all" ON medication_logs
FOR ALL TO authenticated
USING (auth.uid() = patient_id)
WITH CHECK (auth.uid() = patient_id);

CREATE POLICY "medication_logs_clinician_select" ON medication_logs
FOR SELECT TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM patient_clinicians pc
        WHERE pc.clinician_id = auth.uid()
          AND pc.patient_id = medication_logs.patient_id
          AND pc.status = 'active'
    )
);

