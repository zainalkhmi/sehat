import type { PatientConsent } from '@future-health/domain';
import type { FHIRConsent, FHIRCodeableConcept } from '../types.ts';
import { FHIR_SYSTEMS, STANDARD_LOINC_CODES } from '../constants.ts';

/**
 * Bidirectional Mapper: PatientConsent <-> FHIR R4 Consent
 */
export function consentToFHIR(consent: PatientConsent): FHIRConsent {
  let fhirStatus: FHIRConsent['status'] = 'active';
  if (consent.status === 'revoked') {
    fhirStatus = 'rejected';
  } else if (consent.status === 'expired') {
    fhirStatus = 'inactive';
  }

  const scopeCoding: FHIRCodeableConcept = {
    coding: [
      {
        system: FHIR_SYSTEMS.CONSENT_SCOPE,
        code: consent.scope === 'research' ? 'research' : 'patient-privacy',
        display: consent.scope,
      },
    ],
    text: consent.scope,
  };

  const fhirConsent: FHIRConsent = {
    resourceType: 'Consent',
    id: consent.id,
    status: fhirStatus,
    scope: scopeCoding,
    category: [
      {
        coding: [
          {
            system: FHIR_SYSTEMS.LOINC,
            code: STANDARD_LOINC_CODES.CONSENT_DOCUMENT,
            display: 'Consent Document',
          },
        ],
      },
    ],
    patient: {
      reference: `Patient/${consent.patientId}`,
    },
    dateTime: consent.consentedAt,
    provision: {
      type: 'permit',
      period: {
        start: consent.consentedAt,
        end: consent.expiresAt,
      },
    },
  };

  if (consent.authorizedActorId && fhirConsent.provision) {
    fhirConsent.provision.actor = [
      {
        role: {
          coding: [
            {
              system: FHIR_SYSTEMS.V2_ACTOR_TYPE,
              code: 'PROV',
              display: 'Healthcare Provider',
            },
          ],
        },
        reference: {
          reference: `Practitioner/${consent.authorizedActorId}`,
        },
      },
    ];
  }

  if (consent.authorizedOrganizationId && fhirConsent.provision) {
    fhirConsent.provision.actor = fhirConsent.provision.actor || [];
    fhirConsent.provision.actor.push({
      role: {
        coding: [
          {
            system: FHIR_SYSTEMS.V2_ACTOR_TYPE,
            code: 'ORGP',
            display: 'Healthcare Organization',
          },
        ],
      },
      reference: {
        reference: `Organization/${consent.authorizedOrganizationId}`,
      },
    });
  }

  if (consent.researchProjectId) {
    fhirConsent.policyRule = {
      coding: [
        {
          system: `${FHIR_SYSTEMS.FUTURE_HEALTH_EXTENSIONS}/researchProject`,
          code: consent.researchProjectId,
          display: `Research Protocol: ${consent.researchProjectId}`,
        },
      ],
      text: consent.researchProjectId,
    };
  }

  return fhirConsent;
}

export function fhirToConsent(fhir: FHIRConsent): PatientConsent {
  const patientId = fhir.patient.reference?.replace(/^Patient\//, '') || '';

  let status: PatientConsent['status'] = 'active';
  if (fhir.status === 'rejected') {
    status = 'revoked';
  } else if (fhir.status === 'inactive') {
    status = 'expired';
  }

  const scopeText = fhir.scope.text || fhir.scope.coding[0]?.display;
  let scope: PatientConsent['scope'] = 'clinical-care';
  if (scopeText === 'research' || fhir.scope.coding[0]?.code === 'research') {
    scope = 'research';
  } else if (scopeText === 'telehealth') {
    scope = 'telehealth';
  }

  const actorPractitioner = fhir.provision?.actor?.find((a) =>
    a.reference.reference?.startsWith('Practitioner/')
  );
  const authorizedActorId = actorPractitioner?.reference.reference?.replace(/^Practitioner\//, '');

  const actorOrg = fhir.provision?.actor?.find((a) =>
    a.reference.reference?.startsWith('Organization/')
  );
  const authorizedOrganizationId = actorOrg?.reference.reference?.replace(/^Organization\//, '');

  const researchProjectId = fhir.policyRule?.coding?.[0]?.code || fhir.policyRule?.text;

  return {
    id: fhir.id,
    patientId,
    scope,
    status,
    authorizedActorId,
    authorizedOrganizationId,
    researchProjectId,
    consentedAt: fhir.dateTime,
    expiresAt: fhir.provision?.period?.end,
  };
}
