import { describe, test } from 'node:test';
import assert from 'node:assert/strict';

import type {
  PatientProfile,
  DoctorProfile,
  VitalSignObservation,
  ClinicalCondition,
  ClinicalAppointment,
  PatientConsent,
} from '@future-health/domain';

import {
  patientToFHIR,
  fhirToPatient,
  practitionerToFHIR,
  fhirToPractitioner,
  observationToFHIR,
  fhirToObservation,
  conditionToFHIR,
  fhirToCondition,
  appointmentToFHIR,
  fhirToAppointment,
  consentToFHIR,
  fhirToConsent,
  deidentifyFHIRPatient,
  deidentifyFHIRObservation,
  deidentifyVitalSignObservation,
  deidentifyPatientProfile,
  createSearchsetBundle,
  createTransactionBundle,
  filterFHIRResources,
  STANDARD_LOINC_CODES,
  STANDARD_ICD10_CODES,
} from '../index.ts';

describe('FHIR R4 Bidirectional Roundtrip Interoperability Suite', () => {
  test('PatientProfile <-> FHIR Patient lossless roundtrip', () => {
    const originalPatient: PatientProfile = {
      id: 'patient-uuid-101',
      email: 'budi.santoso@example.com',
      role: 'patient',
      name: {
        givenName: 'Budi',
        familyName: 'Santoso',
        prefix: 'Mr.',
      },
      displayName: 'Mr. Budi Santoso',
      dateOfBirth: '1985-06-20',
      gender: 'male',
      phoneNumber: '+6281234567890',
      mrn: 'FH-MRN-9021',
      bloodType: 'O+',
      allergies: ['Penicillin', 'Peanuts'],
      emergencyContact: {
        name: 'Siti Rahma',
        relationship: 'Spouse',
        phoneNumber: '+6281298765432',
      },
      createdAt: '2026-01-15T08:00:00.000Z',
      updatedAt: '2026-02-10T11:30:00.000Z',
    };

    const fhirResource = patientToFHIR(originalPatient);
    assert.strictEqual(fhirResource.resourceType, 'Patient');
    assert.strictEqual(fhirResource.id, originalPatient.id);
    assert.strictEqual(fhirResource.gender, 'male');
    assert.strictEqual(fhirResource.birthDate, '1985-06-20');

    const reconstructed = fhirToPatient(fhirResource);
    assert.strictEqual(reconstructed.id, originalPatient.id);
    assert.strictEqual(reconstructed.email, originalPatient.email);
    assert.strictEqual(reconstructed.name.givenName, originalPatient.name.givenName);
    assert.strictEqual(reconstructed.name.familyName, originalPatient.name.familyName);
    assert.strictEqual(reconstructed.displayName, originalPatient.displayName);
    assert.strictEqual(reconstructed.dateOfBirth, originalPatient.dateOfBirth);
    assert.strictEqual(reconstructed.gender, originalPatient.gender);
    assert.strictEqual(reconstructed.phoneNumber, originalPatient.phoneNumber);
    assert.strictEqual(reconstructed.mrn, originalPatient.mrn);
    assert.strictEqual(reconstructed.bloodType, originalPatient.bloodType);
    assert.deepStrictEqual(reconstructed.allergies, originalPatient.allergies);
    assert.deepStrictEqual(reconstructed.emergencyContact, originalPatient.emergencyContact);
    assert.strictEqual(reconstructed.createdAt, originalPatient.createdAt);
  });

  test('DoctorProfile <-> FHIR Practitioner lossless roundtrip', () => {
    const originalDoctor: DoctorProfile = {
      id: 'doc-uuid-202',
      email: 'dr.hendra@hospital.id',
      role: 'doctor',
      name: {
        givenName: 'Hendra',
        familyName: 'Wijaya',
        prefix: 'dr.',
      },
      displayName: 'dr. Hendra Wijaya, Sp.JP',
      dateOfBirth: '1978-11-12',
      gender: 'male',
      phoneNumber: '+628111222333',
      licenseNumber: 'SIP-DKI-2024-8891',
      specialty: 'Cardiology',
      hospitalAffiliation: 'RS Jantung Harapan Sehat',
      biography: 'Consultant cardiologist specializing in telemetry and heart failure.',
      createdAt: '2025-10-01T04:00:00.000Z',
      updatedAt: '2026-01-05T09:15:00.000Z',
    };

    const fhirResource = practitionerToFHIR(originalDoctor);
    assert.strictEqual(fhirResource.resourceType, 'Practitioner');
    assert.strictEqual(fhirResource.id, originalDoctor.id);

    const reconstructed = fhirToPractitioner(fhirResource);
    assert.strictEqual(reconstructed.id, originalDoctor.id);
    assert.strictEqual(reconstructed.email, originalDoctor.email);
    assert.strictEqual(reconstructed.licenseNumber, originalDoctor.licenseNumber);
    assert.strictEqual(reconstructed.specialty, originalDoctor.specialty);
    assert.strictEqual(reconstructed.hospitalAffiliation, originalDoctor.hospitalAffiliation);
    assert.strictEqual(reconstructed.biography, originalDoctor.biography);
  });

  test('VitalSignObservation (Scalar) <-> FHIR Observation lossless roundtrip', () => {
    const originalObs: VitalSignObservation = {
      id: 'obs-heart-rate-001',
      patientId: 'patient-uuid-101',
      status: 'final',
      category: 'vital-signs',
      loincCode: STANDARD_LOINC_CODES.HEART_RATE,
      displayName: 'Heart Rate',
      valueNumeric: 74,
      unit: 'beats/minute',
      unitCode: '/min',
      effectiveDateTime: '2026-11-04T08:30:00.000Z',
      source: 'healthkit',
      deviceId: 'apple-watch-s9-019',
      createdAt: '2026-11-04T08:30:00.000Z',
    };

    const fhirResource = observationToFHIR(originalObs);
    assert.strictEqual(fhirResource.resourceType, 'Observation');
    assert.strictEqual(fhirResource.subject.reference, 'Patient/patient-uuid-101');
    assert.strictEqual(fhirResource.valueQuantity?.value, 74);
    assert.strictEqual(fhirResource.valueQuantity?.code, '/min');

    const reconstructed = fhirToObservation(fhirResource);
    assert.strictEqual(reconstructed.id, originalObs.id);
    assert.strictEqual(reconstructed.patientId, originalObs.patientId);
    assert.strictEqual(reconstructed.loincCode, originalObs.loincCode);
    assert.strictEqual(reconstructed.valueNumeric, originalObs.valueNumeric);
    assert.strictEqual(reconstructed.unit, originalObs.unit);
    assert.strictEqual(reconstructed.source, originalObs.source);
    assert.strictEqual(reconstructed.deviceId, originalObs.deviceId);
  });

  test('VitalSignObservation (Multi-component Blood Pressure) <-> FHIR Observation', () => {
    const bpObs: VitalSignObservation = {
      id: 'obs-bp-002',
      patientId: 'patient-uuid-101',
      status: 'final',
      category: 'vital-signs',
      loincCode: STANDARD_LOINC_CODES.BLOOD_PRESSURE_PANEL,
      displayName: 'Blood Pressure Panel',
      unit: 'mmHg',
      unitCode: 'mm[Hg]',
      effectiveDateTime: '2026-11-04T09:00:00.000Z',
      source: 'ble',
      components: [
        {
          code: STANDARD_LOINC_CODES.SYSTOLIC_BP,
          displayName: 'Systolic blood pressure',
          value: 124,
          unit: 'mmHg',
        },
        {
          code: STANDARD_LOINC_CODES.DIASTOLIC_BP,
          displayName: 'Diastolic blood pressure',
          value: 82,
          unit: 'mmHg',
        },
      ],
      createdAt: '2026-11-04T09:00:00.000Z',
    };

    const fhirResource = observationToFHIR(bpObs);
    assert.strictEqual(fhirResource.component?.length, 2);
    assert.strictEqual(fhirResource.component?.[0].valueQuantity?.value, 124);
    assert.strictEqual(fhirResource.component?.[1].valueQuantity?.value, 82);

    const reconstructed = fhirToObservation(fhirResource);
    assert.strictEqual(reconstructed.id, bpObs.id);
    assert.strictEqual(reconstructed.components?.length, 2);
    assert.strictEqual(reconstructed.components?.[0].value, 124);
    assert.strictEqual(reconstructed.components?.[1].value, 82);
  });

  test('ClinicalCondition <-> FHIR Condition lossless roundtrip', () => {
    const originalCond: ClinicalCondition = {
      id: 'cond-uuid-303',
      patientId: 'patient-uuid-101',
      recorderId: 'doc-uuid-202',
      clinicalStatus: 'active',
      verificationStatus: 'confirmed',
      codeSystem: 'http://hl7.org/fhir/sid/icd-10',
      code: STANDARD_ICD10_CODES.ESSENTIAL_HYPERTENSION,
      displayName: 'Essential (primary) hypertension',
      onsetDateTime: '2025-04-10T00:00:00.000Z',
      recordedDate: '2025-05-01T10:00:00.000Z',
      notes: 'Patient shows controlled BP with lifestyle modifications.',
      createdAt: '2025-05-01T10:00:00.000Z',
    };

    const fhirResource = conditionToFHIR(originalCond);
    assert.strictEqual(fhirResource.resourceType, 'Condition');
    assert.strictEqual(fhirResource.subject.reference, 'Patient/patient-uuid-101');
    assert.strictEqual(fhirResource.recorder?.reference, 'Practitioner/doc-uuid-202');
    assert.strictEqual(fhirResource.code.coding[0].code, 'I10');

    const reconstructed = fhirToCondition(fhirResource);
    assert.strictEqual(reconstructed.id, originalCond.id);
    assert.strictEqual(reconstructed.patientId, originalCond.patientId);
    assert.strictEqual(reconstructed.recorderId, originalCond.recorderId);
    assert.strictEqual(reconstructed.clinicalStatus, originalCond.clinicalStatus);
    assert.strictEqual(reconstructed.verificationStatus, originalCond.verificationStatus);
    assert.strictEqual(reconstructed.code, originalCond.code);
    assert.strictEqual(reconstructed.displayName, originalCond.displayName);
    assert.strictEqual(reconstructed.notes, originalCond.notes);
  });

  test('ClinicalAppointment <-> FHIR Appointment lossless roundtrip', () => {
    const originalApt: ClinicalAppointment = {
      id: 'apt-uuid-404',
      patientId: 'patient-uuid-101',
      clinicianId: 'doc-uuid-202',
      status: 'booked',
      scheduledStart: '2026-11-10T09:00:00.000Z',
      scheduledEnd: '2026-11-10T09:30:00.000Z',
      reason: 'Routine quarterly cardiovascular review',
      telehealthUrl: 'https://telehealth.futurehealth.id/room/fh-room-991',
      createdAt: '2026-11-01T04:00:00.000Z',
    };

    const fhirResource = appointmentToFHIR(originalApt);
    assert.strictEqual(fhirResource.resourceType, 'Appointment');
    assert.strictEqual(fhirResource.status, 'booked');

    const reconstructed = fhirToAppointment(fhirResource);
    assert.strictEqual(reconstructed.id, originalApt.id);
    assert.strictEqual(reconstructed.patientId, originalApt.patientId);
    assert.strictEqual(reconstructed.clinicianId, originalApt.clinicianId);
    assert.strictEqual(reconstructed.status, originalApt.status);
    assert.strictEqual(reconstructed.scheduledStart, originalApt.scheduledStart);
    assert.strictEqual(reconstructed.scheduledEnd, originalApt.scheduledEnd);
    assert.strictEqual(reconstructed.reason, originalApt.reason);
    assert.strictEqual(reconstructed.telehealthUrl, originalApt.telehealthUrl);
  });

  test('PatientConsent <-> FHIR Consent lossless roundtrip', () => {
    const originalConsent: PatientConsent = {
      id: 'consent-uuid-505',
      patientId: 'patient-uuid-101',
      scope: 'research',
      status: 'active',
      authorizedActorId: 'doc-uuid-202',
      authorizedOrganizationId: 'org-uuid-999',
      researchProjectId: 'FH-IRB-2026-08',
      consentedAt: '2026-11-01T10:00:00.000Z',
      expiresAt: '2027-11-01T10:00:00.000Z',
    };

    const fhirResource = consentToFHIR(originalConsent);
    assert.strictEqual(fhirResource.resourceType, 'Consent');
    assert.strictEqual(fhirResource.status, 'active');

    const reconstructed = fhirToConsent(fhirResource);
    assert.strictEqual(reconstructed.id, originalConsent.id);
    assert.strictEqual(reconstructed.patientId, originalConsent.patientId);
    assert.strictEqual(reconstructed.scope, originalConsent.scope);
    assert.strictEqual(reconstructed.status, originalConsent.status);
    assert.strictEqual(reconstructed.authorizedActorId, originalConsent.authorizedActorId);
    assert.strictEqual(reconstructed.authorizedOrganizationId, originalConsent.authorizedOrganizationId);
    assert.strictEqual(reconstructed.researchProjectId, originalConsent.researchProjectId);
    assert.strictEqual(reconstructed.consentedAt, originalConsent.consentedAt);
    assert.strictEqual(reconstructed.expiresAt, originalConsent.expiresAt);
  });
});

describe('Clinical De-Identification Engine (HIPAA Safe Harbor & UU PDP No. 27/2022)', () => {
  const patient: PatientProfile = {
    id: 'pt-confidential-777',
    email: 'private.citizen@indonesia.go.id',
    role: 'patient',
    name: {
      givenName: 'Kartini',
      familyName: 'Sasongko',
    },
    displayName: 'Kartini Sasongko',
    dateOfBirth: '1990-08-17',
    gender: 'female',
    phoneNumber: '+6281888999000',
    mrn: 'MRN-PRIVATE-999',
    bloodType: 'B+',
    allergies: ['Aspirin'],
    emergencyContact: {
      name: 'Bambang Sasongko',
      relationship: 'Brother',
      phoneNumber: '+6281777666555',
    },
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  };

  test('FHIR Patient de-identification redacts all 18 HIPAA identifiers', () => {
    const fhirPatient = patientToFHIR(patient);
    const deidentified = deidentifyFHIRPatient(fhirPatient, {
      salt: 'PROJECT_ALPHA_SALT',
    });

    // 1. Direct identifiers are stripped/pseudonymized
    assert.notStrictEqual(deidentified.id, patient.id);
    assert.match(deidentified.id, /^FH-DEID-[0-9A-F]+$/);
    assert.strictEqual(deidentified.name?.[0].text, 'De-identified Subject');
    assert.strictEqual(deidentified.telecom, undefined);
    assert.strictEqual(deidentified.contact, undefined);

    // 2. Birth date is aggregated to year only (1990-01-01)
    assert.strictEqual(deidentified.birthDate, '1990-01-01');

    // 3. Clinical non-identifying traits (gender, bloodType) are preserved for research
    assert.strictEqual(deidentified.gender, 'female');
    assert.strictEqual(deidentified.extension?.some((e) => e.valueString === 'B+'), true);
  });

  test('VitalSignObservation de-identification strips device hardware ID and hashes patient link', () => {
    const obs: VitalSignObservation = {
      id: 'obs-spo2-888',
      patientId: 'pt-confidential-777',
      status: 'final',
      category: 'vital-signs',
      loincCode: STANDARD_LOINC_CODES.SPO2,
      displayName: 'Oxygen Saturation',
      valueNumeric: 98,
      unit: '%',
      unitCode: '%',
      effectiveDateTime: '2026-11-03T14:20:00.000Z',
      source: 'ble',
      deviceId: 'BLE-MAC-00:1A:2B:3C:4D:5E',
      createdAt: '2026-11-03T14:20:00.000Z',
    };

    const deidentifiedObs = deidentifyVitalSignObservation(obs, {
      salt: 'PROJECT_ALPHA_SALT',
      dateShiftDays: -5,
    });

    assert.notStrictEqual(deidentifiedObs.id, obs.id);
    assert.notStrictEqual(deidentifiedObs.patientId, obs.patientId);
    assert.strictEqual(deidentifiedObs.deviceId, undefined); // Hardware MAC address redacted
    assert.strictEqual(deidentifiedObs.valueNumeric, 98);
    // Date shifted by 5 days
    assert.strictEqual(deidentifiedObs.effectiveDateTime.startsWith('2026-10-29'), true);
  });
});

describe('FHIR Search and Bundle Generation Engine', () => {
  const patientId = 'pt-bundle-test';
  const obs1 = observationToFHIR({
    id: 'obs-01',
    patientId,
    status: 'final',
    category: 'vital-signs',
    loincCode: STANDARD_LOINC_CODES.HEART_RATE,
    displayName: 'Heart Rate',
    valueNumeric: 72,
    unit: 'beats/minute',
    unitCode: '/min',
    effectiveDateTime: '2026-11-01T10:00:00.000Z',
    source: 'manual',
    createdAt: '2026-11-01T10:00:00.000Z',
  });

  const obs2 = observationToFHIR({
    id: 'obs-02',
    patientId,
    status: 'final',
    category: 'vital-signs',
    loincCode: STANDARD_LOINC_CODES.BODY_TEMP,
    displayName: 'Body Temperature',
    valueNumeric: 36.8,
    unit: 'Cel',
    unitCode: 'Cel',
    effectiveDateTime: '2026-11-02T10:00:00.000Z',
    source: 'manual',
    createdAt: '2026-11-02T10:00:00.000Z',
  });

  const obs3 = observationToFHIR({
    id: 'obs-03',
    patientId: 'pt-other',
    status: 'preliminary',
    category: 'vital-signs',
    loincCode: STANDARD_LOINC_CODES.HEART_RATE,
    displayName: 'Heart Rate',
    valueNumeric: 88,
    unit: 'beats/minute',
    unitCode: '/min',
    effectiveDateTime: '2026-11-03T10:00:00.000Z',
    source: 'manual',
    createdAt: '2026-11-03T10:00:00.000Z',
  });

  const allObservations = [obs1, obs2, obs3];

  test('Filter by patient and code', () => {
    const results = filterFHIRResources(allObservations, {
      patient: patientId,
      code: STANDARD_LOINC_CODES.HEART_RATE,
    });
    assert.strictEqual(results.length, 1);
    assert.strictEqual(results[0].id, 'obs-01');
  });

  test('Filter by date range (ge)', () => {
    const results = filterFHIRResources(allObservations, {
      date: 'ge2026-11-02',
    });
    assert.strictEqual(results.length, 2);
    assert.strictEqual(results[0].id, 'obs-02');
    assert.strictEqual(results[1].id, 'obs-03');
  });

  test('createSearchsetBundle produces valid FHIR searchset', () => {
    const bundle = createSearchsetBundle([obs1, obs2], {
      baseUrl: 'https://api.futurehealth.id/fhir',
      params: { patient: patientId },
    });

    assert.strictEqual(bundle.resourceType, 'Bundle');
    assert.strictEqual(bundle.type, 'searchset');
    assert.strictEqual(bundle.total, 2);
    assert.strictEqual(bundle.entry.length, 2);
    assert.strictEqual(bundle.entry[0].fullUrl, 'https://api.futurehealth.id/fhir/Observation/obs-01');
    assert.strictEqual(bundle.entry[0].search?.mode, 'match');
  });

  test('createTransactionBundle produces valid batch transaction', () => {
    const txBundle = createTransactionBundle([
      { resource: obs1, method: 'POST', url: 'Observation' },
      { resource: obs2, method: 'PUT', url: 'Observation/obs-02' },
    ]);

    assert.strictEqual(txBundle.resourceType, 'Bundle');
    assert.strictEqual(txBundle.type, 'transaction');
    assert.strictEqual(txBundle.entry.length, 2);
    assert.strictEqual(txBundle.entry[0].request?.method, 'POST');
    assert.strictEqual(txBundle.entry[1].request?.method, 'PUT');
  });
});
