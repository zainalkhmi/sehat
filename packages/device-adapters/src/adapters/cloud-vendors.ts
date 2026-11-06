/**
 * Future Health - Cloud Vendor Adapters (Garmin, Fitbit, Dexcom, Oura)
 */

import type {
  DeviceAdapter,
  DeviceConnectionStatus,
  DeviceConnectionType,
  SyncOptions,
  SyncResult,
} from '../types.ts';
import { DeduplicationEngine } from '../deduplication.ts';

export interface CloudVendorCredentials {
  clientId: string;
  accessToken: string;
  refreshToken?: string;
  tokenExpiresAt?: string;
}

export abstract class BaseCloudVendorAdapter implements DeviceAdapter {
  abstract readonly type: DeviceConnectionType;
  abstract readonly name: string;

  protected status: DeviceConnectionStatus = 'disconnected';
  protected credentials?: CloudVendorCredentials;
  protected deduplicationEngine = new DeduplicationEngine();

  async checkAvailability(): Promise<boolean> {
    return true;
  }

  async requestPermissions(): Promise<boolean> {
    // In production web/mobile, initiates OAuth2 Authorization Code Flow with PKCE
    this.status = 'connected';
    return true;
  }

  async getConnectionStatus(): Promise<DeviceConnectionStatus> {
    return this.status;
  }

  async connect(deviceId?: string): Promise<boolean> {
    this.status = 'connected';
    return true;
  }

  async disconnect(): Promise<void> {
    this.credentials = undefined;
    this.status = 'disconnected';
  }

  abstract sync(options: SyncOptions): Promise<SyncResult>;
}

export class GarminAdapter extends BaseCloudVendorAdapter {
  readonly type = 'garmin';
  readonly name = 'Garmin Connect';

  async sync(options: SyncOptions): Promise<SyncResult> {
    this.status = 'connected';
    return {
      recordsSynced: 0,
      duplicatesSkipped: 0,
      observations: [],
      newCursor: new Date().toISOString(),
    };
  }
}

export class FitbitAdapter extends BaseCloudVendorAdapter {
  readonly type = 'fitbit';
  readonly name = 'Fitbit Web API';

  async sync(options: SyncOptions): Promise<SyncResult> {
    this.status = 'connected';
    return {
      recordsSynced: 0,
      duplicatesSkipped: 0,
      observations: [],
      newCursor: new Date().toISOString(),
    };
  }
}

export class DexcomAdapter extends BaseCloudVendorAdapter {
  readonly type = 'dexcom';
  readonly name = 'Dexcom Continuous Glucose Monitor (CGM)';

  async sync(options: SyncOptions): Promise<SyncResult> {
    this.status = 'connected';
    return {
      recordsSynced: 0,
      duplicatesSkipped: 0,
      observations: [],
      newCursor: new Date().toISOString(),
    };
  }
}

export class OuraAdapter extends BaseCloudVendorAdapter {
  readonly type = 'oura';
  readonly name = 'Oura Ring API';

  async sync(options: SyncOptions): Promise<SyncResult> {
    this.status = 'connected';
    return {
      recordsSynced: 0,
      duplicatesSkipped: 0,
      observations: [],
      newCursor: new Date().toISOString(),
    };
  }
}

