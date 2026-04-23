import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient';

/**
 * Hook to fetch and subscribe to Supabase data
 * Usage: const { data, loading, error } = useSupabase('table_name', { filter: 'value' })
 */
export function useSupabase(table, filters = {}, autoFetch = true) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetch = useCallback(async () => {
    try {
      setLoading(true);
      let query = supabase.from(table).select('*');
      
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== null) query = query.eq(key, value);
      });

      const { data: result, error: err } = await query;
      if (err) throw err;
      setData(result);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [table, filters]);

  useEffect(() => {
    if (autoFetch) fetch();
  }, [fetch, autoFetch]);

  // Subscribe to realtime changes
  useEffect(() => {
    const subscription = supabase
      .from(table)
      .on('*', () => fetch())
      .subscribe();

    return () => subscription.unsubscribe();
  }, [table, fetch]);

  return { data, loading, error, refetch: fetch };
}

/**
 * Hook for Supabase mutations (create, update, delete)
 */
export function useSupabaseMutation(table) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const create = useCallback(async (data) => {
    try {
      setLoading(true);
      const { data: result, error: err } = await supabase
        .from(table)
        .insert([data])
        .select();
      if (err) throw err;
      return result?.[0];
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [table]);

  const update = useCallback(async (id, data) => {
    try {
      setLoading(true);
      const { data: result, error: err } = await supabase
        .from(table)
        .update(data)
        .eq('id', id)
        .select();
      if (err) throw err;
      return result?.[0];
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [table]);

  const delete_ = useCallback(async (id) => {
    try {
      setLoading(true);
      const { error: err } = await supabase
        .from(table)
        .delete()
        .eq('id', id);
      if (err) throw err;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [table]);

  return { create, update, delete: delete_, loading, error };
}