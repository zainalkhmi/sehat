import { describe, test } from 'node:test';
import assert from 'node:assert/strict';

import {
  HealthKitAdapter,
  HealthConnectAdapter,
  GenericBLEAdapter,
  DeviceManager,
  decodeSFloat,
  createMeasurementSignature,
  DeduplicationEngine,
  type HKRawSample,
  type HealthConnectRawRecord,
} from '../index.ts';

describe('Unified Device Adapter Architecture Suite', () => {
  const patientId = 'pt-wearable-101';

  test('Apple HealthKit Adapter maps vitals and handles cursor progression', async () => {
    const rawSamples: HKRawSample[] = [
      {
        uuid: 'hk-sample-01',
        startDate: '2026-11-04T08:00:00.000Z',
        endDate: '2026-11-04T08:00:00.000Z',
        quantityType: 'HKQuantityTypeIdentifierHeartRate',
        quantity: 72,
        unit: 'count/min',
        device: { name: 'Apple Watch Series 9' },
      },
      {
        uuid: 'hk-sample-02',
        startDate: '2026-11-04T08:15:00.000Z',
        endDate: '2026-11-04T08:15:00.000Z',
        quantityType: 'HKQuantityTypeIdentifierOxygenSaturation',
        quantity: 99,
        unit: '%',
        device: { name: 'Apple Watch Series 9' },
      },
      {
        uuid: 'hk-sample-03',
        startDate: '2026-11-04T08:30:00.000Z',
        endDate: '2026-11-04T08:30:00.000Z',
        quantityType: 'HKQuantityTypeIdentifierStepCount',
        quantity: 1250,
        unit: 'count',
        device: { name: 'iPhone 16 Pro' },
      },
    ];

    const adapter = new HealthKitAdapter(rawSamples);
    await adapter.connect();

    // First sync: retrieves all 3 samples
    const firstSync = await adapter.sync({ patientId });
    assert.strictEqual(firstSync.recordsSynced, 3);
    assert.strictEqual(firstSync.duplicatesSkipped, 0);
    assert.strictEqual(firstSync.observations.length, 3);
    assert.strictEqual(firstSync.newCursor, '2026-11-04T08:30:00.000Z');

    // Second sync with cursor: skips already synced records
    const secondSync = await adapter.sync({
      patientId,
      cursor: firstSync.newCursor,
    });
    assert.strictEqual(secondSync.recordsSynced, 0);
    assert.strictEqual(secondSync.observations.length, 0);

    // Multi-component Blood pressure mapping test
    const bpSample = {
      uuid: 'hk-bp-01',
      startDate: '2026-11-04T09:00:00.000Z',
      endDate: '2026-11-04T09:00:00.000Z',
      systolic: 118,
      diastolic: 76,
      device: { name: 'Omron Connect' },
    };
    const bpMeasurement = adapter.mapBloodPressure(bpSample, patientId);
    assert.strictEqual(bpMeasurement.loincCode, '85354-9');
    assert.strictEqual(bpMeasurement.components?.length, 2);
    assert.strictEqual(bpMeasurement.components?.[0].value, 118);
    assert.strictEqual(bpMeasurement.components?.[1].value, 76);
  });

  test('Google Health Connect Adapter transforms Android records accurately', async () => {
    const rawRecords: HealthConnectRawRecord[] = [
      {
        metadata: { id: 'hc-rec-01', dataOrigin: 'PixelWatch' },
        recordType: 'HeartRate',
        time: '2026-11-04T07:45:00.000Z',
        samples: [{ beatsPerMinute: 68, time: '2026-11-04T07:45:00.000Z' }],
      },
      {
        metadata: { id: 'hc-rec-02', dataOrigin: 'SamsungHealth' },
        recordType: 'Steps',
        time: '2026-11-04T08:00:00.000Z',
        count: 850,
      },
      {
        metadata: { id: 'hc-rec-03', dataOrigin: 'DexcomG7' },
        recordType: 'BloodGlucose',
        time: '2026-11-04T08:15:00.000Z',
        level: { inMilligramsPerDeciliter: 104 },
      },
    ];

    const adapter = new HealthConnectAdapter(rawRecords);
    await adapter.connect();

    const res = await adapter.sync({ patientId });
    assert.strictEqual(res.recordsSynced, 3);
    assert.strictEqual(res.duplicatesSkipped, 0);
    assert.strictEqual(res.observations[0].loincCode, '8867-4'); // Heart rate
    assert.strictEqual(res.observations[1].loincCode, '55423-8'); // Steps
    assert.strictEqual(res.observations[2].loincCode, '2339-0'); // Blood glucose
    assert.strictEqual(res.observations[2].valueNumeric, 104);
  });

  test('Generic BLE GATT Adapter decodes IEEE 11073 SFLOAT and standard GATT packets', async () => {
    const bleAdapter = new GenericBLEAdapter();
    await bleAdapter.connect('BLE-BEURER-BM85');

    // Test IEEE 11073-20601 SFLOAT decoding
    // Example: Exponent = 0 (0x0000), Mantissa = 120 (0x0078) -> SFLOAT 0x0078 = 120.0
    const sfloat120 = decodeSFloat(0x0078);
    assert.strictEqual(sfloat120, 120);

    // Exponent = -1 (0xF000), Mantissa = 365 (0x016D) -> SFLOAT 0xF16D = 36.5
    const sfloat36_5 = decodeSFloat(0xf16d);
    assert.strictEqual(Math.round(sfloat36_5 * 10) / 10, 36.5);

    // 1. Blood Pressure Packet (0x2A35):
    // Flags (0x00 = mmHg), Systolic=124 (0x007C), Diastolic=82 (0x0052)
    const bpPacket = new Uint8Array([0x00, 0x7c, 0x00, 0x52, 0x00, 0x62, 0x00]);
    const bpMeasurement = bleAdapter.parseBloodPressurePacket(bpPacket, patientId);

    assert.strictEqual(bpMeasurement.loincCode, '85354-9');
    assert.strictEqual(bpMeasurement.components?.[0].value, 124);
    assert.strictEqual(bpMeasurement.components?.[1].value, 82);
    assert.strictEqual(bpMeasurement.unit, 'mmHg');

    // 2. Pulse Oximeter Packet (0x2A5F):
    // SpO2 = 98 (0x0062)
    const spo2Packet = new Uint8Array([0x62, 0x00]);
    const spo2Measurement = bleAdapter.parsePulseOximeterPacket(spo2Packet, patientId);
    assert.strictEqual(spo2Measurement.loincCode, '59408-5');
    assert.strictEqual(spo2Measurement.valueNumeric, 98);
    assert.strictEqual(spo2Measurement.unit, '%');

    // 3. Heart Rate Packet (0x2A37):
    // Flags (0x00 = 8-bit), BPM = 76 (0x4C)
    const hrPacket = new Uint8Array([0x00, 0x4c]);
    const hrMeasurement = bleAdapter.parseHeartRatePacket(hrPacket, patientId);
    assert.strictEqual(hrMeasurement.loincCode, '8867-4');
    assert.strictEqual(hrMeasurement.valueNumeric, 76);

    // Sync all 3 parsed BLE measurements
    const bleSync = await bleAdapter.sync({ patientId });
    assert.strictEqual(bleSync.recordsSynced, 3);
    assert.strictEqual(bleSync.observations.length, 3);
  });

  test('Deduplication Engine isolates exact duplicate telemetry records', () => {
    const engine = new DeduplicationEngine();

    const sig1 = createMeasurementSignature(
      patientId,
      'healthkit',
      '8867-4',
      '2026-11-04T12:00:00.000Z',
      75
    );
    const sig2 = createMeasurementSignature(
      patientId,
      'healthkit',
      '8867-4',
      '2026-11-04T12:00:00.000Z',
      75
    );
    const sig3 = createMeasurementSignature(
      patientId,
      'healthkit',
      '8867-4',
      '2026-11-04T12:05:00.000Z',
      80
    );

    // Same readings produce identical signatures
    assert.strictEqual(sig1, sig2);
    assert.notStrictEqual(sig1, sig3);

    const m1 = {
      id: 'm1',
      patientId,
      loincCode: '8867-4',
      displayName: 'Heart Rate',
      measuredAt: '2026-11-04T12:00:00.000Z',
      valueNumeric: 75,
      unit: 'bpm',
      unitCode: '/min',
      source: 'healthkit' as const,
      deviceId: 'AppleWatch',
      signature: sig1,
    };

    const m2 = {
      id: 'm2',
      patientId,
      loincCode: '8867-4',
      displayName: 'Heart Rate',
      measuredAt: '2026-11-04T12:00:00.000Z',
      valueNumeric: 75,
      unit: 'bpm',
      unitCode: '/min',
      source: 'healthkit' as const,
      deviceId: 'AppleWatch',
      signature: sig2,
    };

    const { unique, duplicates } = engine.filterDuplicates([m1, m2]);
    assert.strictEqual(unique.length, 1);
    assert.strictEqual(duplicates.length, 1);
    assert.strictEqual(unique[0].id, 'm1');
    assert.strictEqual(duplicates[0].id, 'm2');
  });

  test('DeviceManager coordinates multiple connected sources in parallel', async () => {
    const manager = new DeviceManager();

    const hk = new HealthKitAdapter([
      {
        uuid: 'hk-1',
        startDate: '2026-11-04T10:00:00.000Z',
        endDate: '2026-11-04T10:00:00.000Z',
        quantityType: 'HKQuantityTypeIdentifierHeartRate',
        quantity: 70,
        unit: 'count/min',
      },
    ]);
    await hk.connect();

    const hc = new HealthConnectAdapter([
      {
        metadata: { id: 'hc-1', dataOrigin: 'Pixel' },
        recordType: 'Steps',
        time: '2026-11-04T10:00:00.000Z',
        count: 500,
      },
    ]);
    await hc.connect();

    manager.registerAdapter(hk);
    manager.registerAdapter(hc);

    const devices = await manager.getConnectedDevices(patientId);
    assert.strictEqual(devices.length, 2);
    assert.strictEqual(devices[0].status, 'connected');
    assert.strictEqual(devices[1].status, 'connected');

    const result = await manager.syncAll({ patientId });
    assert.strictEqual(result.totalSynced, 2);
    assert.strictEqual(result.observations.length, 2);
    assert.strictEqual(manager.getCursor('healthkit'), '2026-11-04T10:00:00.000Z');
    assert.strictEqual(manager.getCursor('health-connect'), '2026-11-04T10:00:00.000Z');
  });
});

