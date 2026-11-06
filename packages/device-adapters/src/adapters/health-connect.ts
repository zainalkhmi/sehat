/**
 * Future Health - Android Health Connect Native Adapter
 */

import type {
  DeviceAdapter,
  DeviceConnectionStatus,
  DeviceMeasurement,
  SyncOptions,
  SyncResult,
} from '../types.ts';
import {
  createMeasurementSignature,
  DeduplicationEngine,
  measurementToObservation,
} from '../deduplication.ts';

const LOINC = {
  HEART_RATE: '8867-4',
  STEP_COUNT: '55423-8',
  SPO2: '59408-5',
  BLOOD_PRESSURE_PANEL: '85354-9',
  SYSTOLIC_BP: '8480-6',
  DIASTOLIC_BP: '8462-4',
  BLOOD_GLUCOSE: '2339-0',
} as const;

export interface HealthConnectRawRecord {
  metadata: {
    id: string;
    dataOrigin: string;
    clientRecordId?: string;
  };
  recordType: 'Steps' | 'HeartRate' | 'OxygenSaturation' | 'BloodPressure' | 'BloodGlucose';
  time: string; // ISO 8601
  count?: number; // Steps
  samples?: Array<{ beatsPerMinute: number; time: string }>; // HeartRate
  percentage?: number; // SpO2
  systolic?: { inMillimetersOfMercury: number }; // BP
  diastolic?: { inMillimetersOfMercury: number }; // BP
  level?: { inMilligramsPerDeciliter: number }; // Glucose
}

export class HealthConnectAdapter implements DeviceAdapter {
  readonly type = 'health-connect';
  readonly name = 'Google Health Connect';

  private status: DeviceConnectionStatus = 'disconnected';
  private deduplicationEngine = new DeduplicationEngine();
  private mockRecords: HealthConnectRawRecord[] = [];

  constructor(mockRecords?: HealthConnectRawRecord[]) {
    if (mockRecords) {
      this.mockRecords = mockRecords;
    }
  }

  async checkAvailability(): Promise<boolean> {
    return true;
  }

  async requestPermissions(): Promise<boolean> {
    this.status = 'connected';
    return true;
  }

  async getConnectionStatus(): Promise<DeviceConnectionStatus> {
    return this.status;
  }

  async connect(deviceId: string = 'health-connect-primary'): Promise<boolean> {
    this.status = 'connected';
    return true;
  }

  async disconnect(): Promise<void> {
    this.status = 'disconnected';
  }

  mapRecord(record: HealthConnectRawRecord, patientId: string): DeviceMeasurement | null {
    switch (record.recordType) {
      case 'Steps': {
        const steps = record.count ?? 0;
        const signature = createMeasurementSignature(
          patientId,
          this.type,
          LOINC.STEP_COUNT,
          record.time,
          steps
        );
        return {
          id: record.metadata.id,
          patientId,
          loincCode: LOINC.STEP_COUNT,
          displayName: 'Step Count',
          measuredAt: record.time,
          valueNumeric: steps,
          unit: 'steps',
          unitCode: '1',
          source: this.type,
          deviceId: record.metadata.dataOrigin || 'HealthConnect',
          signature,
        };
      }

      case 'HeartRate': {
        const bpm = record.samples?.[0]?.beatsPerMinute ?? 0;
        const sampleTime = record.samples?.[0]?.time || record.time;
        const signature = createMeasurementSignature(
          patientId,
          this.type,
          LOINC.HEART_RATE,
          sampleTime,
          bpm
        );
        return {
          id: record.metadata.id,
          patientId,
          loincCode: LOINC.HEART_RATE,
          displayName: 'Heart Rate',
          measuredAt: sampleTime,
          valueNumeric: bpm,
          unit: 'beats/minute',
          unitCode: '/min',
          source: this.type,
          deviceId: record.metadata.dataOrigin || 'HealthConnect',
          signature,
        };
      }

      case 'OxygenSaturation': {
        const pct = record.percentage ?? 0;
        const signature = createMeasurementSignature(
          patientId,
          this.type,
          LOINC.SPO2,
          record.time,
          pct
        );
        return {
          id: record.metadata.id,
          patientId,
          loincCode: LOINC.SPO2,
          displayName: 'Oxygen Saturation',
          measuredAt: record.time,
          valueNumeric: pct,
          unit: '%',
          unitCode: '%',
          source: this.type,
          deviceId: record.metadata.dataOrigin || 'HealthConnect',
          signature,
        };
      }

      case 'BloodPressure': {
        const sys = record.systolic?.inMillimetersOfMercury ?? 0;
        const dia = record.diastolic?.inMillimetersOfMercury ?? 0;
        const components = [
          {
            code: LOINC.SYSTOLIC_BP,
            displayName: 'Systolic blood pressure',
            value: sys,
            unit: 'mmHg',
          },
          {
            code: LOINC.DIASTOLIC_BP,
            displayName: 'Diastolic blood pressure',
            value: dia,
            unit: 'mmHg',
          },
        ];
        const signature = createMeasurementSignature(
          patientId,
          this.type,
          LOINC.BLOOD_PRESSURE_PANEL,
          record.time,
          components
        );
        return {
          id: record.metadata.id,
          patientId,
          loincCode: LOINC.BLOOD_PRESSURE_PANEL,
          displayName: 'Blood Pressure Panel',
          measuredAt: record.time,
          unit: 'mmHg',
          unitCode: 'mm[Hg]',
          components,
          source: this.type,
          deviceId: record.metadata.dataOrigin || 'HealthConnect',
          signature,
        };
      }

      case 'BloodGlucose': {
        const mgdl = record.level?.inMilligramsPerDeciliter ?? 0;
        const signature = createMeasurementSignature(
          patientId,
          this.type,
          LOINC.BLOOD_GLUCOSE,
          record.time,
          mgdl
        );
        return {
          id: record.metadata.id,
          patientId,
          loincCode: LOINC.BLOOD_GLUCOSE,
          displayName: 'Blood Glucose',
          measuredAt: record.time,
          valueNumeric: mgdl,
          unit: 'mg/dL',
          unitCode: 'mg/dL',
          source: this.type,
          deviceId: record.metadata.dataOrigin || 'HealthConnect',
          signature,
        };
      }

      default:
        return null;
    }
  }

  async sync(options: SyncOptions): Promise<SyncResult> {
    this.status = 'syncing';

    try {
      if (options.existingSignatures) {
        options.existingSignatures.forEach((s) => this.deduplicationEngine.register(s));
      }

      const cursorDate = options.cursor ? new Date(options.cursor) : new Date(0);
      const eligible = this.mockRecords.filter((r) => new Date(r.time) > cursorDate);

      const rawMeasurements: DeviceMeasurement[] = [];
      for (const rec of eligible) {
        const m = this.mapRecord(rec, options.patientId);
        if (m) rawMeasurements.push(m);
      }

      const { unique, duplicates } = this.deduplicationEngine.filterDuplicates(rawMeasurements);
      const observations = unique.map(measurementToObservation);

      const last = eligible[eligible.length - 1];
      const newCursor = last ? last.time : options.cursor;

      this.status = 'connected';
      return {
        recordsSynced: unique.length,
        duplicatesSkipped: duplicates.length,
        observations,
        newCursor,
      };
    } catch (err: any) {
      this.status = 'error';
      return {
        recordsSynced: 0,
        duplicatesSkipped: 0,
        observations: [],
        errors: [err.message],
      };
    }
  }

  setMockRecords(records: HealthConnectRawRecord[]): void {
    this.mockRecords = records;
  }
}

