import type { PatientProfile, PersonName } from '@future-health/domain';
import type { FHIRPatient, FHIRIdentifier, FHIRContactPoint, FHIRHumanName, FHIRExtension } from '../types.ts';
import { FHIR_SYSTEMS } from '../constants.ts';

/**
 * Bidirectional Mapper: PatientProfile <-> FHIR R4 Patient
 */
export function patientToFHIR(patient: PatientProfile): FHIRPatient {
  const identifiers: FHIRIdentifier[] = [
    {
      system: FHIR_SYSTEMS.FUTURE_HEALTH_PATIENT,
      value: patient.mrn || patient.id,
      use: 'official',
    },
  ];

  const telecom: FHIRContactPoint[] = [];
  if (patient.phoneNumber) {
    telecom.push({
      system: 'phone',
      value: patient.phoneNumber,
      use: 'mobile',
    });
  }
  if (patient.email) {
    telecom.push({
      system: 'email',
      value: patient.email,
    });
  }

  const name: FHIRHumanName[] = [
    {
      use: 'official',
      text: patient.displayName,
      family: patient.name?.familyName,
      given: patient.name?.givenName ? [patient.name.givenName] : undefined,
      prefix: patient.name?.prefix ? [patient.name.prefix] : undefined,
      suffix: patient.name?.suffix ? [patient.name.suffix] : undefined,
    },
  ];

  const extensions: FHIRExtension[] = [];
  if (patient.bloodType) {
    extensions.push({
      url: `${FHIR_SYSTEMS.FUTURE_HEALTH_EXTENSIONS}/bloodType`,
      valueString: patient.bloodType,
    });
  }
  if (patient.allergies && patient.allergies.length > 0) {
    extensions.push({
      url: `${FHIR_SYSTEMS.FUTURE_HEALTH_EXTENSIONS}/allergies`,
      valueString: JSON.stringify(patient.allergies),
    });
  }
  if (patient.createdAt) {
    extensions.push({
      url: `${FHIR_SYSTEMS.FUTURE_HEALTH_EXTENSIONS}/createdAt`,
      valueDateTime: patient.createdAt,
    });
  }
  if (patient.updatedAt) {
    extensions.push({
      url: `${FHIR_SYSTEMS.FUTURE_HEALTH_EXTENSIONS}/updatedAt`,
      valueDateTime: patient.updatedAt,
    });
  }

  const fhirPatient: FHIRPatient = {
    resourceType: 'Patient',
    id: patient.id,
    active: true,
    identifier: identifiers,
    name,
    telecom: telecom.length > 0 ? telecom : undefined,
    gender: patient.gender,
    birthDate: patient.dateOfBirth,
    extension: extensions.length > 0 ? extensions : undefined,
  };

  if (patient.emergencyContact) {
    fhirPatient.contact = [
      {
        relationship: [
          {
            coding: [
              {
                system: FHIR_SYSTEMS.V2_ACTOR_TYPE,
                code: 'C',
                display: patient.emergencyContact.relationship,
              },
            ],
            text: patient.emergencyContact.relationship,
          },
        ],
        name: {
          text: patient.emergencyContact.name,
        },
        telecom: [
          {
            system: 'phone',
            value: patient.emergencyContact.phoneNumber,
          },
        ],
      },
    ];
  }

  return fhirPatient;
}

export function fhirToPatient(fhir: FHIRPatient): PatientProfile {
  const primaryName = fhir.name?.[0];
  const givenName = primaryName?.given?.[0];
  const familyName = primaryName?.family;
  const prefix = primaryName?.prefix?.[0];
  const suffix = primaryName?.suffix?.[0];

  const nameComponents: PersonName = {
    givenName,
    familyName,
    prefix,
    suffix,
  };

  const displayName = primaryName?.text ||
    [prefix, givenName, familyName, suffix].filter(Boolean).join(' ') ||
    'Unknown Patient';

  const email = fhir.telecom?.find((t) => t.system === 'email')?.value || '';
  const phoneNumber = fhir.telecom?.find((t) => t.system === 'phone')?.value;

  const mrnIdentifier = fhir.identifier?.find(
    (id) => id.system === FHIR_SYSTEMS.FUTURE_HEALTH_PATIENT
  );
  const mrn = mrnIdentifier?.value;

  const bloodTypeExt = fhir.extension?.find(
    (e) => e.url === `${FHIR_SYSTEMS.FUTURE_HEALTH_EXTENSIONS}/bloodType`
  );
  const bloodType = bloodTypeExt?.valueString as PatientProfile['bloodType'];

  const allergiesExt = fhir.extension?.find(
    (e) => e.url === `${FHIR_SYSTEMS.FUTURE_HEALTH_EXTENSIONS}/allergies`
  );
  let allergies: string[] | undefined;
  if (allergiesExt?.valueString) {
    try {
      allergies = JSON.parse(allergiesExt.valueString);
    } catch {
      allergies = [allergiesExt.valueString];
    }
  }

  const createdAtExt = fhir.extension?.find(
    (e) => e.url === `${FHIR_SYSTEMS.FUTURE_HEALTH_EXTENSIONS}/createdAt`
  );
  const updatedAtExt = fhir.extension?.find(
    (e) => e.url === `${FHIR_SYSTEMS.FUTURE_HEALTH_EXTENSIONS}/updatedAt`
  );

  let emergencyContact: PatientProfile['emergencyContact'];
  if (fhir.contact?.[0]) {
    const contact = fhir.contact[0];
    emergencyContact = {
      name: contact.name?.text || '',
      relationship: contact.relationship?.[0]?.text || '',
      phoneNumber: contact.telecom?.find((t) => t.system === 'phone')?.value || '',
    };
  }

  return {
    id: fhir.id,
    email,
    role: 'patient',
    name: nameComponents,
    displayName,
    dateOfBirth: fhir.birthDate,
    gender: fhir.gender,
    phoneNumber,
    mrn,
    bloodType,
    allergies,
    emergencyContact,
    createdAt: createdAtExt?.valueDateTime || new Date().toISOString(),
    updatedAt: updatedAtExt?.valueDateTime || new Date().toISOString(),
  };
}
