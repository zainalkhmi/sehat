/**
 * Future Health - Unified Device Adapter Architecture Types
 */

import type { VitalSignObservation } from '@future-health/domain';

export type DeviceConnectionType =
  | 'healthkit'
  | 'health-connect'
  | 'ble'
  | 'garmin'
  | 'fitbit'
  | 'oura'
  | 'withings'
  | 'dexcom'
  | 'manual';

export type DeviceConnectionStatus =
  | 'disconnected'
  | 'connecting'
  | 'connected'
  | 'syncing'
  | 'error';

export interface DeviceMeasurement {
  id: string;
  patientId: string;
  loincCode: string;
  displayName: string;
  measuredAt: string; // ISO 8601
  valueNumeric?: number;
  valueString?: string;
  unit: string;
  unitCode: string;
  components?: Array<{
    code: string;
    displayName: string;
    value: number;
    unit: string;
  }>;
  source: DeviceConnectionType;
  deviceId: string;
  deviceName?: string;
  signature: string; // Deterministic deduplication hash
  rawPayload?: Record<string, any>;
}

export interface SyncOptions {
  patientId: string;
  startDate?: string;
  endDate?: string;
  cursor?: string;
  batchSize?: number;
  existingSignatures?: Set<string>;
}

export interface SyncResult {
  recordsSynced: number;
  duplicatesSkipped: number;
  observations: VitalSignObservation[];
  newCursor?: string;
  errors?: string[];
}

export interface DeviceConnectionInfo {
  id: string;
  patientId: string;
  deviceType: DeviceConnectionType;
  deviceId: string;
  deviceName: string;
  status: DeviceConnectionStatus;
  lastSyncedAt?: string;
  syncCursor?: string;
  batteryLevel?: number;
}

export interface DeviceAdapter {
  readonly type: DeviceConnectionType;
  readonly name: string;

  checkAvailability(): Promise<boolean>;
  requestPermissions(): Promise<boolean>;
  getConnectionStatus(): Promise<DeviceConnectionStatus>;
  connect(deviceId?: string): Promise<boolean>;
  sync(options: SyncOptions): Promise<SyncResult>;
  disconnect(): Promise<void>;
}

