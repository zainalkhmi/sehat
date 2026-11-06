import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { SupabaseConfig } from './types.ts';

declare const process: any;

let cachedClient: SupabaseClient | null = null;

export function getSupabaseClient(config?: SupabaseConfig, storageAdapter?: any): SupabaseClient {
  if (cachedClient) return cachedClient;

  const url = config?.url || process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.EXPO_PUBLIC_SUPABASE_URL || '';
  const anonKey = config?.anonKey || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';

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

