/**
 * Future Health - Standard FHIR R4 URIs, Code Systems, and Terminology
 */

export const FHIR_SYSTEMS = {
  // International Standard Terminologies
  LOINC: 'http://loinc.org',
  SNOMED_CT: 'http://snomed.info/sct',
  ICD10: 'http://hl7.org/fhir/sid/icd-10',
  UCUM: 'http://unitsofmeasure.org',

  // HL7 Value Sets & Code Systems
  OBSERVATION_CATEGORY: 'http://terminology.hl7.org/CodeSystem/observation-category',
  CONDITION_CLINICAL_STATUS: 'http://terminology.hl7.org/CodeSystem/condition-clinical',
  CONDITION_VERIFICATION_STATUS: 'http://terminology.hl7.org/CodeSystem/condition-ver-status',
  CONSENT_SCOPE: 'http://terminology.hl7.org/CodeSystem/consentscope',
  CONSENT_CATEGORY: 'http://terminology.hl7.org/CodeSystem/consentcategorycodes',
  APPOINTMENT_STATUS: 'http://hl7.org/fhir/appointmentstatus',
  V2_ACTOR_TYPE: 'http://terminology.hl7.org/CodeSystem/v2-0203',

  // Future Health Internal System URIs
  FUTURE_HEALTH_PATIENT: 'https://futurehealth.id/patients',
  FUTURE_HEALTH_PRACTITIONER: 'https://futurehealth.id/practitioners',
  FUTURE_HEALTH_ORGANIZATION: 'https://futurehealth.id/organizations',
  FUTURE_HEALTH_EXTENSIONS: 'https://futurehealth.id/fhir/StructureDefinition',
} as const;

export const STANDARD_LOINC_CODES = {
  // Vitals & Panels
  BLOOD_PRESSURE_PANEL: '85354-9',
  SYSTOLIC_BP: '8480-6',
  DIASTOLIC_BP: '8462-4',
  HEART_RATE: '8867-4',
  BODY_TEMP: '8310-5',
  SPO2: '59408-5',
  BLOOD_GLUCOSE: '2339-0',
  BODY_WEIGHT: '29463-7',
  BODY_HEIGHT: '8302-2',
  STEP_COUNT: '55423-8',
  RESPIRATORY_RATE: '9279-1',

  // Clinical Survey & PROMs
  PHQ9: '44249-1',
  GAD7: '70274-6',
  CONSENT_DOCUMENT: '59284-0',
} as const;

export const STANDARD_ICD10_CODES = {
  ESSENTIAL_HYPERTENSION: 'I10',
  TYPE_2_DIABETES: 'E11.9',
  MAJOR_DEPRESSIVE_DISORDER: 'F32.9',
  GENERALIZED_ANXIETY_DISORDER: 'F41.1',
  CORONARY_ARTERY_DISEASE: 'I25.10',
  ASTHMA: 'J45.909',
} as const;

export const UCUM_UNITS = {
  BEATS_PER_MINUTE: { code: '/min', unit: 'beats/minute' },
  MM_HG: { code: 'mm[Hg]', unit: 'mmHg' },
  CELSIUS: { code: 'Cel', unit: 'Cel' },
  PERCENT: { code: '%', unit: '%' },
  MG_DL: { code: 'mg/dL', unit: 'mg/dL' },
  KILOGRAM: { code: 'kg', unit: 'kg' },
  CENTIMETER: { code: 'cm', unit: 'cm' },
  STEPS: { code: '1', unit: 'steps' },
} as const;

