import type { DoctorProfile, PersonName } from '@future-health/domain';
import type { FHIRPractitioner, FHIRIdentifier, FHIRContactPoint, FHIRHumanName, FHIRExtension } from '../types.ts';
import { FHIR_SYSTEMS } from '../constants.ts';

/**
 * Bidirectional Mapper: DoctorProfile <-> FHIR R4 Practitioner
 */
export function practitionerToFHIR(doc: DoctorProfile): FHIRPractitioner {
  const identifiers: FHIRIdentifier[] = [
    {
      system: FHIR_SYSTEMS.FUTURE_HEALTH_PRACTITIONER,
      value: doc.licenseNumber || doc.id,
      use: 'official',
    },
  ];

  const telecom: FHIRContactPoint[] = [];
  if (doc.phoneNumber) {
    telecom.push({
      system: 'phone',
      value: doc.phoneNumber,
      use: 'work',
    });
  }
  if (doc.email) {
    telecom.push({
      system: 'email',
      value: doc.email,
      use: 'work',
    });
  }

  const name: FHIRHumanName[] = [
    {
      use: 'official',
      text: doc.displayName,
      family: doc.name?.familyName,
      given: doc.name?.givenName ? [doc.name.givenName] : undefined,
      prefix: doc.name?.prefix ? [doc.name.prefix] : ['dr.'],
      suffix: doc.name?.suffix ? [doc.name.suffix] : undefined,
    },
  ];

  const extensions: FHIRExtension[] = [];
  if (doc.hospitalAffiliation) {
    extensions.push({
      url: `${FHIR_SYSTEMS.FUTURE_HEALTH_EXTENSIONS}/hospitalAffiliation`,
      valueString: doc.hospitalAffiliation,
    });
  }
  if (doc.biography) {
    extensions.push({
      url: `${FHIR_SYSTEMS.FUTURE_HEALTH_EXTENSIONS}/biography`,
      valueString: doc.biography,
    });
  }
  if (doc.createdAt) {
    extensions.push({
      url: `${FHIR_SYSTEMS.FUTURE_HEALTH_EXTENSIONS}/createdAt`,
      valueDateTime: doc.createdAt,
    });
  }
  if (doc.updatedAt) {
    extensions.push({
      url: `${FHIR_SYSTEMS.FUTURE_HEALTH_EXTENSIONS}/updatedAt`,
      valueDateTime: doc.updatedAt,
    });
  }

  return {
    resourceType: 'Practitioner',
    id: doc.id,
    active: true,
    identifier: identifiers,
    name,
    telecom: telecom.length > 0 ? telecom : undefined,
    gender: doc.gender,
    birthDate: doc.dateOfBirth,
    qualification: [
      {
        code: {
          coding: [
            {
              system: FHIR_SYSTEMS.SNOMED_CT,
              code: '394802001',
              display: doc.specialty,
            },
          ],
          text: doc.specialty,
        },
        issuer: doc.hospitalAffiliation
          ? {
              display: doc.hospitalAffiliation,
            }
          : undefined,
      },
    ],
    extension: extensions.length > 0 ? extensions : undefined,
  };
}

export function fhirToPractitioner(fhir: FHIRPractitioner): DoctorProfile {
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
    'Unknown Doctor';

  const email = fhir.telecom?.find((t) => t.system === 'email')?.value || '';
  const phoneNumber = fhir.telecom?.find((t) => t.system === 'phone')?.value;

  const licenseIdentifier = fhir.identifier?.find(
    (id) => id.system === FHIR_SYSTEMS.FUTURE_HEALTH_PRACTITIONER
  );
  const licenseNumber = licenseIdentifier?.value || '';

  const specialty = fhir.qualification?.[0]?.code?.text ||
    fhir.qualification?.[0]?.code?.coding?.[0]?.display ||
    'General Practice';

  const hospitalAffiliationExt = fhir.extension?.find(
    (e) => e.url === `${FHIR_SYSTEMS.FUTURE_HEALTH_EXTENSIONS}/hospitalAffiliation`
  );
  const hospitalAffiliation = hospitalAffiliationExt?.valueString || fhir.qualification?.[0]?.issuer?.display;

  const biographyExt = fhir.extension?.find(
    (e) => e.url === `${FHIR_SYSTEMS.FUTURE_HEALTH_EXTENSIONS}/biography`
  );
  const biography = biographyExt?.valueString;

  const createdAtExt = fhir.extension?.find(
    (e) => e.url === `${FHIR_SYSTEMS.FUTURE_HEALTH_EXTENSIONS}/createdAt`
  );
  const updatedAtExt = fhir.extension?.find(
    (e) => e.url === `${FHIR_SYSTEMS.FUTURE_HEALTH_EXTENSIONS}/updatedAt`
  );

  return {
    id: fhir.id,
    email,
    role: 'doctor',
    name: nameComponents,
    displayName,
    dateOfBirth: fhir.birthDate,
    gender: fhir.gender,
    phoneNumber,
    licenseNumber,
    specialty,
    hospitalAffiliation,
    biography,
    createdAt: createdAtExt?.valueDateTime || new Date().toISOString(),
    updatedAt: updatedAtExt?.valueDateTime || new Date().toISOString(),
  };
}
