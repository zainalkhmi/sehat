import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { SupabaseConfig } from './types.ts';

declare const process: any;

let cachedClient: SupabaseClient | null = null;

export function isSupabaseConfigured(config?: SupabaseConfig): boolean {
  const url = config?.url || (typeof process !== 'undefined' && (process.env?.NEXT_PUBLIC_SUPABASE_URL || process.env?.EXPO_PUBLIC_SUPABASE_URL)) || '';
  const anonKey = config?.anonKey || (typeof process !== 'undefined' && (process.env?.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env?.EXPO_PUBLIC_SUPABASE_ANON_KEY)) || '';
  return Boolean(url && anonKey);
}

export function getOptionalSupabaseClient(config?: SupabaseConfig, storageAdapter?: any): SupabaseClient | null {
  if (!isSupabaseConfigured(config)) {
    return null;
  }
  try {
    return getSupabaseClient(config, storageAdapter);
  } catch {
    return null;
  }
}

export function getSupabaseClient(config?: SupabaseConfig, storageAdapter?: any): SupabaseClient {
  if (cachedClient) return cachedClient;

  const url = config?.url || (typeof process !== 'undefined' && (process.env?.NEXT_PUBLIC_SUPABASE_URL || process.env?.EXPO_PUBLIC_SUPABASE_URL)) || '';
  const anonKey = config?.anonKey || (typeof process !== 'undefined' && (process.env?.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env?.EXPO_PUBLIC_SUPABASE_ANON_KEY)) || '';

  if (!url || !anonKey) {
    throw new Error('Supabase URL and Anon Key must be configured.');
  }

  cachedClient = createClient(url, anonKey, {
    auth: {
      storage: storageAdapter,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
  });

  return cachedClient;
}

