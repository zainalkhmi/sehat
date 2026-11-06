/**
 * Future Health - Clinical De-Identification Engine
 * Compliant with:
 *  1. HIPAA Safe Harbor (45 CFR § 164.514(b)(2))
 *  2. Indonesian Personal Data Protection Law (UU PDP No. 27/2022)
 */

import type { FHIRPatient, FHIRObservation } from './types.ts';
import type { VitalSignObservation, PatientProfile } from '@future-health/domain';
import { FHIR_SYSTEMS } from './constants.ts';

export interface DeidentificationOptions {
  /** Consistent salt for pseudonymization */
  salt?: string;
  /** Days to shift timestamps (-30 to +30) */
  dateShiftDays?: number;
  /** Whether to retain birth year only */
  retainBirthYearOnly?: boolean;
}

/**
 * Generate deterministic pseudonym hash
 */
export function generatePseudonym(identifier: string, salt: string = 'FH_PDP_2026'): string {
  let hash = 0;
  const combined = `${salt}:${identifier}`;
  for (let i = 0; i < combined.length; i++) {
    const char = combined.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0; // Convert to 32bit integer
  }
  const hex = Math.abs(hash).toString(16).padStart(8, '0');
  return `FH-DEID-${hex.toUpperCase()}`;
}

/**
 * Shift an ISO date string by N days
 */
export function shiftDate(isoDateString: string, days: number = 0): string {
  if (days === 0) return isoDateString;
  const date = new Date(isoDateString);
  if (isNaN(date.getTime())) return isoDateString;
  date.setDate(date.getDate() + days);
  return date.toISOString();
}

/**
 * De-identify FHIR Patient resource according to HIPAA Safe Harbor & UU PDP No. 27/2022
 */
export function deidentifyFHIRPatient(
  patient: FHIRPatient,
  options: DeidentificationOptions = {}
): FHIRPatient {
  const salt = options.salt || 'FH_PDP_2026';
  const pseudonym = generatePseudonym(patient.id, salt);
  const shiftDays = options.dateShiftDays ?? 0;

  let birthDateDeid: string | undefined = undefined;
  if (patient.birthDate) {
    if (options.retainBirthYearOnly !== false) {
      // Retain only year (YYYY-01-01) per Safe Harbor
      const year = patient.birthDate.split('-')[0];
      birthDateDeid = `${year}-01-01`;
    } else {
      birthDateDeid = shiftDate(patient.birthDate, shiftDays).split('T')[0];
    }
  }

  return {
    resourceType: 'Patient',
    id: pseudonym,
    active: true,
    identifier: [
      {
        system: `${FHIR_SYSTEMS.FUTURE_HEALTH_PATIENT}/deidentified`,
        value: pseudonym,
        use: 'anonymous',
      },
    ],
    name: [
      {
        use: 'anonymous',
        text: 'De-identified Subject',
        family: 'Anonymous',
        given: ['Subject'],
      },
    ],
    // Redact all direct contact points (telecom, address, emergency contact)
    telecom: undefined,
    contact: undefined,
    gender: patient.gender,
    birthDate: birthDateDeid,
    extension: patient.extension?.filter(
      (e) => e.url.endsWith('/bloodType') // Retain clinical non-identifying extensions
    ),
  };
}

/**
 * De-identify FHIR Observation resource
 */
export function deidentifyFHIRObservation(
  obs: FHIRObservation,
  options: DeidentificationOptions = {}
): FHIRObservation {
  const salt = options.salt || 'FH_PDP_2026';
  const rawPatientId = obs.subject.reference?.replace(/^Patient\//, '') || '';
  const patientPseudonym = generatePseudonym(rawPatientId, salt);
  const obsPseudonym = generatePseudonym(obs.id, salt);
  const shiftDays = options.dateShiftDays ?? 0;

  return {
    resourceType: 'Observation',
    id: obsPseudonym,
    status: obs.status,
    category: obs.category,
    code: obs.code,
    subject: {
      reference: `Patient/${patientPseudonym}`,
      display: 'De-identified Subject',
    },
    // Redact performer identifiers
    performer: undefined,
    effectiveDateTime: shiftDate(obs.effectiveDateTime, shiftDays),
    valueQuantity: obs.valueQuantity,
    valueString: obs.valueString,
    component: obs.component,
    // Redact specific serial/hardware device reference
    device: obs.device ? { display: obs.device.display } : undefined,
  };
}

/**
 * De-identify domain VitalSignObservation for research cohort exports
 */
export function deidentifyVitalSignObservation(
  obs: VitalSignObservation,
  options: DeidentificationOptions = {}
): VitalSignObservation {
  const salt = options.salt || 'FH_PDP_2026';
  const shiftDays = options.dateShiftDays ?? 0;

  return {
    ...obs,
    id: generatePseudonym(obs.id, salt),
    patientId: generatePseudonym(obs.patientId, salt),
    deviceId: undefined, // Redact hardware identifier
    effectiveDateTime: shiftDate(obs.effectiveDateTime, shiftDays),
    createdAt: shiftDate(obs.createdAt, shiftDays),
  };
}

/**
 * De-identify domain PatientProfile
 */
export function deidentifyPatientProfile(
  patient: PatientProfile,
  options: DeidentificationOptions = {}
): PatientProfile {
  const salt = options.salt || 'FH_PDP_2026';
  const pseudonym = generatePseudonym(patient.id, salt);
  const shiftDays = options.dateShiftDays ?? 0;

  const yearOnly = patient.dateOfBirth ? `${patient.dateOfBirth.split('-')[0]}-01-01` : undefined;

  return {
    id: pseudonym,
    email: '',
    role: 'patient',
    name: {
      givenName: 'Subject',
      familyName: 'Anonymous',
    },
    displayName: `Subject ${pseudonym.slice(-4)}`,
    dateOfBirth: yearOnly,
    gender: patient.gender,
    phoneNumber: undefined,
    avatarUrl: undefined,
    mrn: undefined,
    bloodType: patient.bloodType,
    allergies: patient.allergies,
    emergencyContact: undefined,
    createdAt: shiftDate(patient.createdAt, shiftDays),
    updatedAt: shiftDate(patient.updatedAt, shiftDays),
  };
}
