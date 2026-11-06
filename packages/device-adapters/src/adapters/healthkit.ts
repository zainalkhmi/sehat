/**
 * Future Health - Apple HealthKit Native Adapter
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

// LOINC Terminology Codes
const LOINC = {
  HEART_RATE: '8867-4',
  STEP_COUNT: '55423-8',
  SPO2: '59408-5',
  BLOOD_PRESSURE_PANEL: '85354-9',
  SYSTOLIC_BP: '8480-6',
  DIASTOLIC_BP: '8462-4',
  BODY_TEMP: '8310-5',
  BLOOD_GLUCOSE: '2339-0',
} as const;

export interface HKRawSample {
  uuid: string;
  startDate: string;
  endDate: string;
  quantityType: string;
  quantity: number;
  unit: string;
  device?: {
    name?: string;
    model?: string;
    manufacturer?: string;
  };
  metadata?: Record<string, any>;
}

export interface HKRawBloodPressure {
  uuid: string;
  startDate: string;
  endDate: string;
  systolic: number;
  diastolic: number;
  device?: { name?: string };
}

export class HealthKitAdapter implements DeviceAdapter {
  readonly type = 'healthkit';
  readonly name = 'Apple Health';

  private status: DeviceConnectionStatus = 'disconnected';
  private deduplicationEngine = new DeduplicationEngine();
  private mockSamples: HKRawSample[] = [];

  constructor(mockSamples?: HKRawSample[]) {
    if (mockSamples) {
      this.mockSamples = mockSamples;
    }
  }

  async checkAvailability(): Promise<boolean> {
    // In real iOS runtime, checks Apple HealthKit capability
    return true;
  }

  async requestPermissions(): Promise<boolean> {
    this.status = 'connected';
    return true;
  }

  async getConnectionStatus(): Promise<DeviceConnectionStatus> {
    return this.status;
  }

  async connect(deviceId: string = 'apple-health-primary'): Promise<boolean> {
    this.status = 'connected';
    return true;
  }

  async disconnect(): Promise<void> {
    this.status = 'disconnected';
  }

  /**
   * Translates an Apple Health raw sample into a canonical DeviceMeasurement with deduplication signature
   */
  mapSample(sample: HKRawSample, patientId: string): DeviceMeasurement | null {
    let loincCode = '';
    let displayName = '';
    let unit = sample.unit;
    let unitCode = sample.unit;

    switch (sample.quantityType) {
      case 'HKQuantityTypeIdentifierHeartRate':
        loincCode = LOINC.HEART_RATE;
        displayName = 'Heart Rate';
        unit = 'beats/minute';
        unitCode = '/min';
        break;
      case 'HKQuantityTypeIdentifierStepCount':
        loincCode = LOINC.STEP_COUNT;
        displayName = 'Step Count';
        unit = 'steps';
        unitCode = '1';
        break;
      case 'HKQuantityTypeIdentifierOxygenSaturation':
        loincCode = LOINC.SPO2;
        displayName = 'Oxygen Saturation';
        unit = '%';
        unitCode = '%';
        break;
      case 'HKQuantityTypeIdentifierBodyTemperature':
        loincCode = LOINC.BODY_TEMP;
        displayName = 'Body Temperature';
        unit = 'Cel';
        unitCode = 'Cel';
        break;
      case 'HKQuantityTypeIdentifierBloodGlucose':
        loincCode = LOINC.BLOOD_GLUCOSE;
        displayName = 'Blood Glucose';
        unit = 'mg/dL';
        unitCode = 'mg/dL';
        break;
      default:
        return null;
    }

    const signature = createMeasurementSignature(
      patientId,
      this.type,
      loincCode,
      sample.startDate,
      sample.quantity
    );

    return {
      id: sample.uuid,
      patientId,
      loincCode,
      displayName,
      measuredAt: sample.startDate,
      valueNumeric: sample.quantity,
      unit,
      unitCode,
      source: this.type,
      deviceId: sample.device?.name || 'AppleWatch',
      deviceName: sample.device?.name || 'Apple Health',
      signature,
      rawPayload: sample.metadata,
    };
  }

  /**
   * Translates blood pressure correlation into multi-component measurement
   */
  mapBloodPressure(sample: HKRawBloodPressure, patientId: string): DeviceMeasurement {
    const components = [
      {
        code: LOINC.SYSTOLIC_BP,
        displayName: 'Systolic blood pressure',
        value: sample.systolic,
        unit: 'mmHg',
      },
      {
        code: LOINC.DIASTOLIC_BP,
        displayName: 'Diastolic blood pressure',
        value: sample.diastolic,
        unit: 'mmHg',
      },
    ];

    const signature = createMeasurementSignature(
      patientId,
      this.type,
      LOINC.BLOOD_PRESSURE_PANEL,
      sample.startDate,
      components
    );

    return {
      id: sample.uuid,
      patientId,
      loincCode: LOINC.BLOOD_PRESSURE_PANEL,
      displayName: 'Blood Pressure Panel',
      measuredAt: sample.startDate,
      unit: 'mmHg',
      unitCode: 'mm[Hg]',
      components,
      source: this.type,
      deviceId: sample.device?.name || 'AppleHealth-BP',
      signature,
    };
  }

  async sync(options: SyncOptions): Promise<SyncResult> {
    this.status = 'syncing';

    try {
      if (options.existingSignatures) {
        options.existingSignatures.forEach((s) => this.deduplicationEngine.register(s));
      }

      // Filter samples newer than cursor
      const cursorDate = options.cursor ? new Date(options.cursor) : new Date(0);
      const eligibleSamples = this.mockSamples.filter(
        (s) => new Date(s.startDate) > cursorDate
      );

      const rawMeasurements: DeviceMeasurement[] = [];
      for (const sample of eligibleSamples) {
        const m = this.mapSample(sample, options.patientId);
        if (m) rawMeasurements.push(m);
      }

      // Deduplicate
      const { unique, duplicates } = this.deduplicationEngine.filterDuplicates(rawMeasurements);
      const observations = unique.map(measurementToObservation);

      // Latest cursor
      const latestSample = eligibleSamples[eligibleSamples.length - 1];
      const newCursor = latestSample ? latestSample.startDate : options.cursor;

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
        errors: [err.message || 'Sync failed'],
      };
    }
  }

  setMockSamples(samples: HKRawSample[]): void {
    this.mockSamples = samples;
  }
}

