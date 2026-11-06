/**
 * Future Health - Bluetooth Low Energy (BLE) Generic GATT Adapter
 * Conforms to standard Bluetooth SIG GATT Profiles:
 *  - Blood Pressure Profile (GATT Service 0x1810, Characteristic 0x2A35)
 *  - Pulse Oximeter Profile (GATT Service 0x1822, Characteristic 0x2A5F)
 *  - Heart Rate Profile (GATT Service 0x180D, Characteristic 0x2A37)
 * Implements IEEE 11073-20601 SFLOAT 16-bit float binary decoding.
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

export const BLE_SERVICES = {
  BLOOD_PRESSURE: '0x1810',
  PULSE_OXIMETER: '0x1822',
  HEART_RATE: '0x180D',
} as const;

export const BLE_CHARACTERISTICS = {
  BLOOD_PRESSURE_MEASUREMENT: '0x2A35',
  PLX_CONTINUOUS_MEASUREMENT: '0x2A5F',
  HEART_RATE_MEASUREMENT: '0x2A37',
} as const;

/**
 * Decodes IEEE 11073-20601 16-bit SFLOAT
 * Format: 4-bit signed exponent, 12-bit signed mantissa
 */
export function decodeSFloat(raw16: number): number {
  if (raw16 === 0x07fe) return Number.POSITIVE_INFINITY;
  if (raw16 === 0x07ff || raw16 === 0x0800) return Number.NaN;
  if (raw16 === 0x0802) return Number.NEGATIVE_INFINITY;

  let mantissa = raw16 & 0x0fff;
  if (mantissa >= 0x0800) {
    mantissa = mantissa - 0x1000; // Sign extend 12-bit
  }

  let exponent = (raw16 >> 12) & 0x0f;
  if (exponent >= 0x08) {
    exponent = exponent - 0x10; // Sign extend 4-bit
  }

  return mantissa * Math.pow(10, exponent);
}

export class GenericBLEAdapter implements DeviceAdapter {
  readonly type = 'ble';
  readonly name = 'Bluetooth Medical Devices (GATT)';

  private status: DeviceConnectionStatus = 'disconnected';
  private connectedDeviceId: string | null = null;
  private deduplicationEngine = new DeduplicationEngine();
  private pendingMeasurements: DeviceMeasurement[] = [];

  async checkAvailability(): Promise<boolean> {
    return true;
  }

  async requestPermissions(): Promise<boolean> {
    return true;
  }

  async getConnectionStatus(): Promise<DeviceConnectionStatus> {
    return this.status;
  }

  async connect(deviceId: string = 'BLE-OMRON-BP-701'): Promise<boolean> {
    this.status = 'connected';
    this.connectedDeviceId = deviceId;
    return true;
  }

  async disconnect(): Promise<void> {
    this.status = 'disconnected';
    this.connectedDeviceId = null;
  }

  /**
   * Parse Blood Pressure Measurement characteristic (0x2A35) payload
   */
  parseBloodPressurePacket(data: Uint8Array, patientId: string): DeviceMeasurement {
    const flags = data[0];
    const isKPa = (flags & 0x01) !== 0;
    const unit = isKPa ? 'kPa' : 'mmHg';
    const unitCode = isKPa ? 'kPa' : 'mm[Hg]';

    const view = new DataView(data.buffer, data.byteOffset, data.byteLength);

    // Systolic SFLOAT (bytes 1-2)
    const rawSys = view.getUint16(1, true);
    const systolic = Math.round(decodeSFloat(rawSys));

    // Diastolic SFLOAT (bytes 3-4)
    const rawDia = view.getUint16(3, true);
    const diastolic = Math.round(decodeSFloat(rawDia));

    const components = [
      {
        code: '8480-6',
        displayName: 'Systolic blood pressure',
        value: systolic,
        unit,
      },
      {
        code: '8462-4',
        displayName: 'Diastolic blood pressure',
        value: diastolic,
        unit,
      },
    ];

    const measuredAt = new Date().toISOString();
    const signature = createMeasurementSignature(
      patientId,
      this.type,
      '85354-9',
      measuredAt,
      components
    );

    const measurement: DeviceMeasurement = {
      id: `ble-bp-${Date.now()}`,
      patientId,
      loincCode: '85354-9',
      displayName: 'Blood Pressure Panel',
      measuredAt,
      unit,
      unitCode,
      components,
      source: this.type,
      deviceId: this.connectedDeviceId || 'BLE-BloodPressure',
      signature,
    };

    this.pendingMeasurements.push(measurement);
    return measurement;
  }

  /**
   * Parse Heart Rate Measurement characteristic (0x2A37) payload
   */
  parseHeartRatePacket(data: Uint8Array, patientId: string): DeviceMeasurement {
    const flags = data[0];
    const is16Bit = (flags & 0x01) !== 0;

    const view = new DataView(data.buffer, data.byteOffset, data.byteLength);
    const bpm = is16Bit ? view.getUint16(1, true) : view.getUint8(1);

    const measuredAt = new Date().toISOString();
    const signature = createMeasurementSignature(
      patientId,
      this.type,
      '8867-4',
      measuredAt,
      bpm
    );

    const measurement: DeviceMeasurement = {
      id: `ble-hr-${Date.now()}`,
      patientId,
      loincCode: '8867-4',
      displayName: 'Heart Rate',
      measuredAt,
      valueNumeric: bpm,
      unit: 'beats/minute',
      unitCode: '/min',
      source: this.type,
      deviceId: this.connectedDeviceId || 'BLE-HeartRate',
      signature,
    };

    this.pendingMeasurements.push(measurement);
    return measurement;
  }

  /**
   * Parse Pulse Oximeter PLX continuous measurement (0x2A5F) payload
   */
  parsePulseOximeterPacket(data: Uint8Array, patientId: string): DeviceMeasurement {
    const view = new DataView(data.buffer, data.byteOffset, data.byteLength);
    // SpO2 SFLOAT (bytes 0-1)
    const rawSpO2 = view.getUint16(0, true);
    const spo2 = Math.round(decodeSFloat(rawSpO2));

    const measuredAt = new Date().toISOString();
    const signature = createMeasurementSignature(
      patientId,
      this.type,
      '59408-5',
      measuredAt,
      spo2
    );

    const measurement: DeviceMeasurement = {
      id: `ble-spo2-${Date.now()}`,
      patientId,
      loincCode: '59408-5',
      displayName: 'Oxygen Saturation',
      measuredAt,
      valueNumeric: spo2,
      unit: '%',
      unitCode: '%',
      source: this.type,
      deviceId: this.connectedDeviceId || 'BLE-PulseOximeter',
      signature,
    };

    this.pendingMeasurements.push(measurement);
    return measurement;
  }

  async sync(options: SyncOptions): Promise<SyncResult> {
    this.status = 'syncing';

    try {
      if (options.existingSignatures) {
        options.existingSignatures.forEach((s) => this.deduplicationEngine.register(s));
      }

      const { unique, duplicates } = this.deduplicationEngine.filterDuplicates(
        this.pendingMeasurements
      );
      const observations = unique.map(measurementToObservation);

      // Clear synced pending measurements
      this.pendingMeasurements = [];
      this.status = 'connected';

      return {
        recordsSynced: unique.length,
        duplicatesSkipped: duplicates.length,
        observations,
        newCursor: new Date().toISOString(),
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

  injectMeasurement(m: DeviceMeasurement): void {
    this.pendingMeasurements.push(m);
  }
}

