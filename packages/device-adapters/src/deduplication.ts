/**
 * Future Health - Telemetry Deduplication and Signature Engine
 */

import type { DeviceMeasurement } from './types.ts';
import type { VitalSignObservation } from '@future-health/domain';

/**
 * Creates a deterministic, collision-resistant signature for an observation measurement
 */
export function createMeasurementSignature(
  patientId: string,
  source: string,
  loincCode: string,
  measuredAt: string,
  valueOrComponents: number | string | Array<{ code: string; value: number }>
): string {
  // Normalize timestamp to nearest second to avoid sub-millisecond clock jitter between sensors
  const date = new Date(measuredAt);
  const roundedIso = isNaN(date.getTime())
    ? measuredAt
    : new Date(Math.floor(date.getTime() / 1000) * 1000).toISOString();

  let valString = '';
  if (Array.isArray(valueOrComponents)) {
    valString = valueOrComponents
      .map((c) => `${c.code}:${c.value}`)
      .sort()
      .join('|');
  } else {
    valString = String(valueOrComponents);
  }

  const rawKey = `${patientId}::${source}::${loincCode}::${roundedIso}::${valString}`;

  // Simple, fast 32-bit hash representation
  let hash = 0;
  for (let i = 0; i < rawKey.length; i++) {
    const char = rawKey.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  const hex = Math.abs(hash).toString(16).padStart(8, '0');
  return `SIG-${hex.toUpperCase()}`;
}

export class DeduplicationEngine {
  private signatureCache = new Set<string>();

  constructor(initialSignatures?: string[]) {
    if (initialSignatures) {
      initialSignatures.forEach((sig) => this.signatureCache.add(sig));
    }
  }

  isDuplicate(signature: string): boolean {
    return this.signatureCache.has(signature);
  }

  register(signature: string): void {
    this.signatureCache.add(signature);
  }

  filterDuplicates(measurements: DeviceMeasurement[]): {
    unique: DeviceMeasurement[];
    duplicates: DeviceMeasurement[];
  } {
    const unique: DeviceMeasurement[] = [];
    const duplicates: DeviceMeasurement[] = [];

    for (const m of measurements) {
      if (this.isDuplicate(m.signature)) {
        duplicates.push(m);
      } else {
        this.register(m.signature);
        unique.push(m);
      }
    }

    return { unique, duplicates };
  }

  clear(): void {
    this.signatureCache.clear();
  }

  get size(): number {
    return this.signatureCache.size;
  }
}

/**
 * Converts a validated, deduplicated DeviceMeasurement into a canonical VitalSignObservation
 */
export function measurementToObservation(m: DeviceMeasurement): VitalSignObservation {
  return {
    id: m.id,
    patientId: m.patientId,
    status: 'final',
    category: 'vital-signs',
    loincCode: m.loincCode,
    displayName: m.displayName,
    valueNumeric: m.valueNumeric,
    valueString: m.valueString,
    unit: m.unit,
    unitCode: m.unitCode,
    effectiveDateTime: m.measuredAt,
    source: m.source as VitalSignObservation['source'],
    deviceId: m.deviceId,
    components: m.components,
    createdAt: new Date().toISOString(),
  };
}

