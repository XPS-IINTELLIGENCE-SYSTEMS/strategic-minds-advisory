import { createClient } from '@supabase/supabase-js';
import { runtimeConfig, runtimeStatus } from '@/lib/runtimeConfig';

let client = null;

export function getSupabaseClient() {
  if (runtimeStatus.supabase !== 'configured') return null;

  if (!client) {
    client = createClient(runtimeConfig.supabaseUrl, runtimeConfig.supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    });
  }

  return client;
}

export const supabase = getSupabaseClient();

export const supabaseAuth = {
  signUp: (email, password) => {
    const activeClient = getSupabaseClient();
    if (!activeClient) return Promise.resolve({ data: null, error: new Error('Supabase is not configured') });
    return activeClient.auth.signUp({ email, password });
  },
  signIn: (email, password) => {
    const activeClient = getSupabaseClient();
    if (!activeClient) return Promise.resolve({ data: null, error: new Error('Supabase is not configured') });
    return activeClient.auth.signInWithPassword({ email, password });
  },
  signOut: () => {
    const activeClient = getSupabaseClient();
    if (!activeClient) return Promise.resolve({ error: null });
    return activeClient.auth.signOut();
  },
  getSession: () => {
    const activeClient = getSupabaseClient();
    if (!activeClient) return Promise.resolve({ data: { session: null }, error: null });
    return activeClient.auth.getSession();
  },
  onAuthStateChange: (callback) => {
    const activeClient = getSupabaseClient();
    if (!activeClient) {
      return { data: { subscription: { unsubscribe: () => {} } } };
    }
    return activeClient.auth.onAuthStateChange(callback);
  },
};

export async function safeSelect(table, fallback = []) {
  const activeClient = getSupabaseClient();
  if (!activeClient) return { data: fallback, error: null, mode: 'synthetic' };

  try {
    const { data, error } = await activeClient.from(table).select('*');
    if (error) return { data: fallback, error, mode: 'fallback' };
    return { data: data || fallback, error: null, mode: 'live' };
  } catch (error) {
    return { data: fallback, error, mode: 'fallback' };
  }
}

export function getSupabaseMode() {
  return runtimeStatus.supabase;
}
