import { createClient } from '@supabase/supabase-js';

export function getSupabaseAdmin() {
  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    return {
      client: null,
      error: 'Supabase admin is not configured. Required env vars: SUPABASE_URL or VITE_SUPABASE_URL, and SUPABASE_SERVICE_ROLE_KEY.',
    };
  }

  return {
    client: createClient(url, serviceRoleKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    }),
    error: null,
  };
}

export async function insertRows(table, rows) {
  const { client, error } = getSupabaseAdmin();
  if (error) return { data: null, error };
  const payload = Array.isArray(rows) ? rows : [rows];
  const { data, error: insertError } = await client.from(table).insert(payload).select('*');
  return { data, error: insertError?.message || null };
}
