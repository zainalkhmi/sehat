import Constants from 'expo-constants';
import { BackendConfig, BackendType } from './types';

const extra = Constants.expoConfig?.extra || {};

const MEDPLUM_CONFIG = {
  baseUrl: process.env.EXPO_PUBLIC_MEDPLUM_BASE_URL || extra.medplum?.baseUrl || '',
  clientId: process.env.EXPO_PUBLIC_MEDPLUM_CLIENT_ID || extra.medplum?.clientId || '',
  projectId: process.env.EXPO_PUBLIC_MEDPLUM_PROJECT_ID || extra.medplum?.projectId || '',
};

const SUPABASE_CONFIG = {
  url: process.env.EXPO_PUBLIC_SUPABASE_URL || extra.supabase?.url || 'https://mock.supabase.co',
  anonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || extra.supabase?.anonKey || 'mock-anon-key',
};

const backendType: BackendType =
  (process.env.EXPO_PUBLIC_BACKEND_TYPE as BackendType) ||
  (extra.backendType as BackendType) ||
  'supabase';

export function getBackendConfig(): BackendConfig {
  if (backendType === 'supabase') {
    return {
      type: 'supabase',
      supabase: SUPABASE_CONFIG,
    };
  }

  if (backendType === 'medplum') {
    if (!MEDPLUM_CONFIG.baseUrl) {
      // Fallback gracefully to supabase or local if credentials missing
      return {
        type: 'supabase',
        supabase: SUPABASE_CONFIG,
      };
    }
    return {
      type: 'medplum',
      medplum: MEDPLUM_CONFIG,
    };
  }

  return { type: 'local' };
}
