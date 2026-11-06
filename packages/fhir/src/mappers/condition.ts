import type { ClinicalCondition } from '@future-health/domain';
import type { FHIRCondition } from '../types.ts';
import { FHIR_SYSTEMS } from '../constants.ts';

/**
 * Bidirectional Mapper: ClinicalCondition <-> FHIR R4 Condition
 */
export function conditionToFHIR(cond: ClinicalCondition): FHIRCondition {
  const fhirCond: FHIRCondition = {
    resourceType: 'Condition',
    id: cond.id,
    clinicalStatus: {
      coding: [
        {
          system: FHIR_SYSTEMS.CONDITION_CLINICAL_STATUS,
          code: cond.clinicalStatus,
          display: cond.clinicalStatus,
        },
      ],
      text: cond.clinicalStatus,
    },
    verificationStatus: {
      coding: [
        {
          system: FHIR_SYSTEMS.CONDITION_VERIFICATION_STATUS,
          code: cond.verificationStatus,
          display: cond.verificationStatus,
        },
      ],
      text: cond.verificationStatus,
    },
    code: {
      coding: [
        {
          system: cond.codeSystem || FHIR_SYSTEMS.ICD10,
          code: cond.code,
          display: cond.displayName,
        },
      ],
      text: cond.displayName,
    },
    subject: {
      reference: `Patient/${cond.patientId}`,
    },
    onsetDateTime: cond.onsetDateTime,
    recordedDate: cond.recordedDate,
  };

  if (cond.recorderId) {
    fhirCond.recorder = {
      reference: `Practitioner/${cond.recorderId}`,
    };
  }

  if (cond.notes) {
    fhirCond.note = [{ text: cond.notes }];
  }

  return fhirCond;
}

export function fhirToCondition(fhir: FHIRCondition): ClinicalCondition {
  const patientId = fhir.subject.reference?.replace(/^Patient\//, '') || '';
  const recorderId = fhir.recorder?.reference?.replace(/^Practitioner\//, '');

  const clinicalStatus = (fhir.clinicalStatus.coding[0]?.code || 'active') as ClinicalCondition['clinicalStatus'];
  const verificationStatus = (fhir.verificationStatus?.coding[0]?.code || 'confirmed') as ClinicalCondition['verificationStatus'];

  const coding = fhir.code.coding[0];
  const codeSystem = coding?.system || FHIR_SYSTEMS.ICD10;
  const code = coding?.code || '';
  const displayName = fhir.code.text || coding?.display || 'Condition';

  const notes = fhir.note?.[0]?.text;

  return {
    id: fhir.id,
    patientId,
    recorderId,
    clinicalStatus,
    verificationStatus,
    codeSystem,
    code,
    displayName,
    onsetDateTime: fhir.onsetDateTime,
    recordedDate: fhir.recordedDate || new Date().toISOString(),
    notes,
    createdAt: fhir.recordedDate || new Date().toISOString(),
  };
}
