import type { VitalSignObservation } from '@future-health/domain';
import type { FHIRObservation, FHIRObservationComponent } from '../types.ts';
import { FHIR_SYSTEMS } from '../constants.ts';

/**
 * Bidirectional Mapper: VitalSignObservation <-> FHIR R4 Observation
 */
export function observationToFHIR(obs: VitalSignObservation): FHIRObservation {
  const fhirObs: FHIRObservation = {
    resourceType: 'Observation',
    id: obs.id,
    status: obs.status,
    category: [
      {
        coding: [
          {
            system: FHIR_SYSTEMS.OBSERVATION_CATEGORY,
            code: obs.category,
            display: obs.category,
          },
        ],
      },
    ],
    code: {
      coding: [
        {
          system: FHIR_SYSTEMS.LOINC,
          code: obs.loincCode,
          display: obs.displayName,
        },
      ],
      text: obs.displayName,
    },
    subject: {
      reference: `Patient/${obs.patientId}`,
    },
    effectiveDateTime: obs.effectiveDateTime,
  };

  // Device / Source tracking
  if (obs.deviceId || obs.source) {
    fhirObs.device = {
      reference: obs.deviceId ? `Device/${obs.deviceId}` : undefined!,
      display: obs.source,
    };
  }

  // Value Quantity (scalar)
  if (obs.valueNumeric !== undefined) {
    fhirObs.valueQuantity = {
      value: obs.valueNumeric,
      unit: obs.unit,
      system: FHIR_SYSTEMS.UCUM,
      code: obs.unitCode,
    };
  }

  // Value String
  if (obs.valueString) {
    fhirObs.valueString = obs.valueString;
  }

  // Multi-component vitals (e.g. Systolic + Diastolic Blood Pressure)
  if (obs.components && obs.components.length > 0) {
    fhirObs.component = obs.components.map((comp): FHIRObservationComponent => ({
      code: {
        coding: [
          {
            system: FHIR_SYSTEMS.LOINC,
            code: comp.code,
            display: comp.displayName,
          },
        ],
        text: comp.displayName,
      },
      valueQuantity: {
        value: comp.value,
        unit: comp.unit,
        system: FHIR_SYSTEMS.UCUM,
        code: comp.unit,
      },
    }));
  }

  return fhirObs;
}

export function fhirToObservation(fhir: FHIRObservation): VitalSignObservation {
  const patientId = fhir.subject.reference?.replace(/^Patient\//, '') || '';
  const loincCode = fhir.code.coding[0]?.code || '';
  const displayName = fhir.code.text || fhir.code.coding[0]?.display || 'Observation';
  const category = (fhir.category?.[0]?.coding[0]?.code || 'vital-signs') as VitalSignObservation['category'];

  const source = (fhir.device?.display || 'manual') as VitalSignObservation['source'];
  const deviceId = fhir.device?.reference?.replace(/^Device\//, '');

  let components: VitalSignObservation['components'];
  if (fhir.component && fhir.component.length > 0) {
    components = fhir.component.map((comp) => ({
      code: comp.code.coding[0]?.code || '',
      displayName: comp.code.text || comp.code.coding[0]?.display || '',
      value: comp.valueQuantity?.value ?? 0,
      unit: comp.valueQuantity?.unit || '',
    }));
  }

  return {
    id: fhir.id,
    patientId,
    status: fhir.status as VitalSignObservation['status'],
    category,
    loincCode,
    displayName,
    valueNumeric: fhir.valueQuantity?.value,
    valueString: fhir.valueString,
    unit: fhir.valueQuantity?.unit || '',
    unitCode: fhir.valueQuantity?.code || '',
    effectiveDateTime: fhir.effectiveDateTime,
    source,
    deviceId,
    components,
    createdAt: fhir.issued || fhir.effectiveDateTime,
  };
}
