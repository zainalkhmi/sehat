# Future Health - Regulatory Compliance & Interoperability Mapping

## 1. Executive Summary

Future Health is architected from the ground up to achieve strict dual-compliance with:
1. **Indonesian Personal Data Protection Law (Undang-Undang No. 27 Tahun 2022 tentang Pelindungan Data Pribadi - UU PDP)**.
2. **HIPAA Safe Harbor Method (45 CFR § 164.514(b)(2))** for clinical de-identification and research.
3. **HL7 FHIR Release 4 (R4)** interoperability specifications required by the Indonesian Ministry of Health (Kemenkes) **SatuSehat** platform.

---

## 2. Indonesian UU PDP No. 27/2022 Statutory Mapping

| UU PDP Article | Statutory Requirement | Future Health Architectural Implementation | Verification Method |
| :--- | :--- | :--- | :--- |
| **Pasal 4 Ayat (2)** | Classification of Specific (Sensitive) Personal Data: Health data and biometric information require heightened security. | Health observations and biometric signals stored in isolated PostgreSQL tables with mandatory Row Level Security (RLS). Service role keys strictly isolated from mobile/web clients. | Automated RLS penetration test suite in `@future-health/auth`. |
| **Pasal 20 & 22** | Explicit Informed Consent: Data Controller must obtain valid, explicit consent for specific processing scopes. | `patient_consents` table models consent status (`active`, `revoked`, `expired`) and scope (`clinical-care`, `research`, `telehealth`). No data queried without active consent verification. | Consent enforcement test in `packages/supabase-adapter/src/__tests__/research.test.ts`. |
| **Pasal 28 & 31** | Data Subject Rights: Right of the patient to access and obtain a copy of their clinical and telemetry records. | Patient Portal `/dashboard/patient/observations` and `/dashboard/patient/profile` allows direct realtime access to all recorded observations and FHIR representations. | Patient observation UI tests and FHIR gateway `/fhir/Patient/:id` endpoint. |
| **Pasal 30 & 32** | Right to Revoke Consent & Data Erasure: Patient can revoke research consent at any time. | Revoking a consent record immediately breaks the SQL `JOIN` in `deidentified_research_observations`, instantaneously removing patient data from researcher views. | PostgreSQL view definition check and withdrawal integration test. |
| **Pasal 35 & 39** | Security of Personal Data: Duty to prevent unauthorized access through state-of-the-art encryption and pseudonymization. | All data encrypted at rest (AES-256) and in transit (TLS 1.3). Irreversible salted SHA-256 pseudonyms used for all research cohorts. | Audit trail verification and `packages/fhir/src/de-identification.ts`. |
| **Pasal 46** | Security Incident Notification: Obligation to notify authorities within $3 \times 24$ hours of a breach. | All database modifications and data exports are logged immutably in `audit_logs` with actor ID, IP address, user agent, and cryptographic checksums. | Audit ledger verification in `audit_logs` table. |

---

## 3. HIPAA Safe Harbor De-Identification Verification Matrix

Under 45 CFR § 164.514(b)(2), health information is not individually identifiable only if all 18 specified direct identifiers are purged:

| # | HIPAA Safe Harbor Direct Identifier | Future Health Redaction Mechanism | Code Implementation |
| :---: | :--- | :--- | :--- |
| 1 | **Names** | Completely purged. Replaced with constant `'De-identified Subject'` or pseudonym `'Subject XXXX'`. | `packages/fhir/src/de-identification.ts` |
| 2 | **Geographic subdivisions smaller than state** | Addresses, postal codes, and kelurahan/kecamatan are omitted. Only country/province retained. | `deidentifyPatientProfile()` |
| 3 | **All dates directly related to an individual** | Longitudinal timestamps shifted by deterministic pseudorandom participant offset ($-90$ to $+90$ days). Birth dates aggregated to year only (`YYYY-01-01`). Ages $\ge 89$ binned into `'89+'`. | `deidentified_research_observations` SQL view |
| 4 | **Telephone numbers** | Completely redacted (`telecom: undefined`). | `deidentifyFHIRPatient()` |
| 5 | **Fax numbers** | Completely redacted. | `deidentifyFHIRPatient()` |
| 6 | **Electronic mail addresses** | Omitted (`email: ''`). | `deidentifyPatientProfile()` |
| 7 | **Social Security Numbers / NIK** | Indonesian NIK or National ID completely excluded from research exports. | Database schema isolation |
| 8 | **Medical Record Numbers (MRN)** | Internal hospital MRN redacted; replaced with irreversible pseudonym `FH-RES-<hash>`. | `generatePseudonym()` |
| 9 | **Health plan beneficiary numbers** | Insurance / BPJS Kesehatan card numbers omitted from researcher views. | RLS policy view isolation |
| 10 | **Account numbers** | Excluded. | RLS policy view isolation |
| 11 | **Certificate / license numbers** | Clinician SIP numbers purged from de-identified observation records. | RLS policy view isolation |
| 12 | **Vehicle identifiers and serials** | Excluded. | Domain model exclusion |
| 13 | **Device identifiers and serial numbers** | BLE MAC addresses, HealthKit UUIDs, and hardware serials stripped from observations (`deviceId: undefined`). | `deidentifyVitalSignObservation()` |
| 14 | **Web Universal Resource Locators (URLs)** | Telehealth session links excluded. | View definition |
| 15 | **Internet Protocol (IP) addresses** | IP addresses logged in administrative `audit_logs` only; never exposed to researchers. | `audit_logs_admin_read` RLS policy |
| 16 | **Biometric identifiers (finger/voice)** | Excluded. | Domain model exclusion |
| 17 | **Full face photographic images** | Avatar URLs redacted (`avatarUrl: undefined`). | `deidentifyPatientProfile()` |
| 18 | **Any other unique identifying number** | All source database UUIDs replaced with deterministic non-reversible hashes. | `generatePseudonym()` |

---

## 4. HL7 FHIR R4 & SatuSehat Interoperability Matrix

Future Health standardizes all clinical telemetry and psychometric data against official international terminologies:

| Clinical Concept | FHIR Resource Type | Standard Terminology System | Standard Code & UCUM Unit |
| :--- | :--- | :--- | :--- |
| **Patient Demographics** | `Patient` | HL7 FHIR AdministrativeGender | `male` \| `female` \| `other` \| `unknown` |
| **Doctor / Attending** | `Practitioner` | Indonesian KKI / SIP | Indonesian Medical Council Registry |
| **Systolic Blood Pressure** | `Observation` (Component) | LOINC | `8480-6` (`mmHg`) |
| **Diastolic Blood Pressure** | `Observation` (Component) | LOINC | `8462-4` (`mmHg`) |
| **Blood Pressure Panel** | `Observation` | LOINC | `85354-9` (Systolic + Diastolic) |
| **Heart Rate / Pulse** | `Observation` | LOINC | `8867-4` (`/min`) |
| **Oxygen Saturation (SpO2)**| `Observation` | LOINC | `59408-5` (`%`) |
| **Body Temperature** | `Observation` | LOINC | `8310-5` (`Cel`) |
| **Blood Glucose** | `Observation` | LOINC | `2339-0` (`mg/dL`) |
| **Step Count** | `Observation` | LOINC | `55423-8` (`1`) |
| **PHQ-9 Depression Survey**| `QuestionnaireResponse` / `Observation` | LOINC | `44249-1` (Score `0 - 27`) |
| **GAD-7 Anxiety Survey** | `QuestionnaireResponse` / `Observation` | LOINC | `69737-5` (Score `0 - 21`) |
| **Clinical Diagnosis** | `Condition` | ICD-10 & SNOMED CT | e.g. `I10` (Essential Hypertension) |
| **Clinical Visit** | `Appointment` | HL7 FHIR AppointmentStatus | `booked` \| `arrived` \| `fulfilled` |
| **Research / Care Consent**| `Consent` | HL7 FHIR ConsentScope | `research` \| `clinical-care` |

