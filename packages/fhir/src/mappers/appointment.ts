import type { ClinicalAppointment } from '@future-health/domain';
import type { FHIRAppointment, FHIRExtension } from '../types.ts';
import { FHIR_SYSTEMS } from '../constants.ts';

/**
 * Bidirectional Mapper: ClinicalAppointment <-> FHIR R4 Appointment
 */
export function appointmentToFHIR(apt: ClinicalAppointment): FHIRAppointment {
  const extensions: FHIRExtension[] = [];
  if (apt.telehealthUrl) {
    extensions.push({
      url: `${FHIR_SYSTEMS.FUTURE_HEALTH_EXTENSIONS}/telehealthUrl`,
      valueString: apt.telehealthUrl,
    });
  }
  if (apt.createdAt) {
    extensions.push({
      url: `${FHIR_SYSTEMS.FUTURE_HEALTH_EXTENSIONS}/createdAt`,
      valueDateTime: apt.createdAt,
    });
  }

  return {
    resourceType: 'Appointment',
    id: apt.id,
    status: apt.status,
    description: apt.reason,
    start: apt.scheduledStart,
    end: apt.scheduledEnd,
    participant: [
      {
        actor: {
          reference: `Patient/${apt.patientId}`,
        },
        status: 'accepted',
      },
      {
        actor: {
          reference: `Practitioner/${apt.clinicianId}`,
        },
        status: 'accepted',
      },
    ],
    extension: extensions.length > 0 ? extensions : undefined,
  };
}

export function fhirToAppointment(fhir: FHIRAppointment): ClinicalAppointment {
  const patientParticipant = fhir.participant.find((p) =>
    p.actor.reference?.startsWith('Patient/')
  );
  const clinicianParticipant = fhir.participant.find((p) =>
    p.actor.reference?.startsWith('Practitioner/')
  );

  const patientId = patientParticipant?.actor.reference?.replace(/^Patient\//, '') || '';
  const clinicianId = clinicianParticipant?.actor.reference?.replace(/^Practitioner\//, '') || '';

  const telehealthExt = fhir.extension?.find(
    (e) => e.url === `${FHIR_SYSTEMS.FUTURE_HEALTH_EXTENSIONS}/telehealthUrl`
  );
  const createdAtExt = fhir.extension?.find(
    (e) => e.url === `${FHIR_SYSTEMS.FUTURE_HEALTH_EXTENSIONS}/createdAt`
  );

  return {
    id: fhir.id,
    patientId,
    clinicianId,
    status: fhir.status as ClinicalAppointment['status'],
    scheduledStart: fhir.start,
    scheduledEnd: fhir.end,
    reason: fhir.description,
    telehealthUrl: telehealthExt?.valueString,
    createdAt: createdAtExt?.valueDateTime || new Date().toISOString(),
  };
}
