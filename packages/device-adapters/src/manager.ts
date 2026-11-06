/**
 * Future Health - Central Device Manager & Telemetry Orchestrator
 */

import type {
  DeviceAdapter,
  DeviceConnectionType,
  DeviceConnectionInfo,
  SyncOptions,
  SyncResult,
} from './types.ts';
import type { VitalSignObservation } from '@future-health/domain';

export class DeviceManager {
  private adapters = new Map<DeviceConnectionType, DeviceAdapter>();
  private cursors = new Map<DeviceConnectionType, string>();

  registerAdapter(adapter: DeviceAdapter): void {
    this.adapters.set(adapter.type, adapter);
  }

  getAdapter(type: DeviceConnectionType): DeviceAdapter | undefined {
    return this.adapters.get(type);
  }

  getRegisteredAdapters(): DeviceAdapter[] {
    return Array.from(this.adapters.values());
  }

  async getConnectedDevices(patientId: string): Promise<DeviceConnectionInfo[]> {
    const infos: DeviceConnectionInfo[] = [];

    for (const adapter of this.adapters.values()) {
      const status = await adapter.getConnectionStatus();
      infos.push({
        id: `dev-${adapter.type}-${patientId}`,
        patientId,
        deviceType: adapter.type,
        deviceId: `${adapter.type}-primary`,
        deviceName: adapter.name,
        status,
        syncCursor: this.cursors.get(adapter.type),
      });
    }

    return infos;
  }

  /**
   * Synchronizes telemetry from all active adapters in parallel
   */
  async syncAll(options: SyncOptions): Promise<{
    totalSynced: number;
    totalDuplicatesSkipped: number;
    observations: VitalSignObservation[];
    results: Record<DeviceConnectionType, SyncResult>;
  }> {
    let totalSynced = 0;
    let totalDuplicatesSkipped = 0;
    const allObservations: VitalSignObservation[] = [];
    const results: Record<string, SyncResult> = {};

    for (const [type, adapter] of this.adapters.entries()) {
      const status = await adapter.getConnectionStatus();
      if (status === 'disconnected') continue;

      const cursor = options.cursor || this.cursors.get(type);
      const res = await adapter.sync({
        ...options,
        cursor,
      });

      if (res.newCursor) {
        this.cursors.set(type, res.newCursor);
      }

      totalSynced += res.recordsSynced;
      totalDuplicatesSkipped += res.duplicatesSkipped;
      allObservations.push(...res.observations);
      results[type] = res;
    }

    return {
      totalSynced,
      totalDuplicatesSkipped,
      observations: allObservations,
      results: results as Record<DeviceConnectionType, SyncResult>,
    };
  }

  getCursor(type: DeviceConnectionType): string | undefined {
    return this.cursors.get(type);
  }

  setCursor(type: DeviceConnectionType, cursor: string): void {
    this.cursors.set(type, cursor);
  }
}

