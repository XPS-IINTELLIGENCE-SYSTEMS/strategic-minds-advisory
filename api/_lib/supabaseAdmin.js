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

function normalizeError(error) {
  if (!error) return null;
  if (typeof error === 'string') return error;
  return error.message || error.details || JSON.stringify(error);
}

export async function selectRows(table, columns = '*', options = {}) {
  const { client, error } = getSupabaseAdmin();
  if (error) return { data: [], error, mode: 'fallback' };

  try {
    const selectColumns = Array.isArray(columns) && columns.length === 0 ? '*' : columns;
    let query = client.from(table).select(selectColumns);

    if (Array.isArray(options.eq) && options.eq.length === 2) {
      query = query.eq(options.eq[0], options.eq[1]);
    }

    if (options.order?.column) {
      query = query.order(options.order.column, { ascending: options.order.ascending ?? false });
    }

    if (Number.isFinite(options.limit)) {
      query = query.limit(options.limit);
    }

    const { data, error: selectError } = await query;
    return {
      data: Array.isArray(data) ? data : [],
      error: normalizeError(selectError),
      mode: selectError ? 'fallback' : 'live',
    };
  } catch (err) {
    return { data: [], error: normalizeError(err), mode: 'fallback' };
  }
}

export async function insertRows(table, rows) {
  const { client, error } = getSupabaseAdmin();
  if (error) return { data: null, error, mode: 'fallback' };

  try {
    const payload = Array.isArray(rows) ? rows : [rows];
    const { data, error: insertError } = await client.from(table).insert(payload).select('*');
    return { data, error: normalizeError(insertError), mode: insertError ? 'fallback' : 'live' };
  } catch (err) {
    return { data: null, error: normalizeError(err), mode: 'fallback' };
  }
}
