import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.warn('Supabase environment variables not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY');
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Unified API wrapper replacing base44
export const db = {
  // Auth methods
  auth: {
    signUp: (email, password) => supabase.auth.signUp({ email, password }),
    signIn: (email, password) => supabase.auth.signInWithPassword({ email, password }),
    signOut: () => supabase.auth.signOut(),
    getSession: async () => {
      const { data } = await supabase.auth.getSession();
      return data?.session?.user || null;
    },
    getUser: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      return user;
    },
    onAuthStateChange: (callback) => supabase.auth.onAuthStateChange(callback),
  },

  // Entity CRUD methods
  entities: {
    // Generic entity methods
    create: async (table, data) => {
      const { data: result, error } = await supabase
        .from(table)
        .insert([data])
        .select();
      if (error) throw error;
      return result?.[0];
    },
    read: async (table, id) => {
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .eq('id', id)
        .single();
      if (error) throw error;
      return data;
    },
    list: async (table, filters = {}, sort = null, limit = 1000) => {
      let query = supabase.from(table).select('*');
      
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== null) query = query.eq(key, value);
      });
      
      if (sort) {
        const [field, order] = Array.isArray(sort) ? sort : [sort, 'asc'];
        query = query.order(field, { ascending: order === 'asc' });
      }
      
      const { data, error } = await query.limit(limit);
      if (error) throw error;
      return data || [];
    },
    update: async (table, id, data) => {
      const { data: result, error } = await supabase
        .from(table)
        .update(data)
        .eq('id', id)
        .select();
      if (error) throw error;
      return result?.[0];
    },
    delete: async (table, id) => {
      const { error } = await supabase
        .from(table)
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    filter: async (table, filters = {}, sort = null, limit = 1000) => {
      return db.entities.list(table, filters, sort, limit);
    },
    bulkCreate: async (table, data) => {
      const { data: results, error } = await supabase
        .from(table)
        .insert(data)
        .select();
      if (error) throw error;
      return results || [];
    },
    subscribe: (table, callback) => {
      return supabase
        .from(table)
        .on('*', (payload) => {
          callback({
            type: payload.eventType.toLowerCase(),
            id: payload.new?.id || payload.old?.id,
            data: payload.new || payload.old,
          });
        })
        .subscribe();
    },
  },

  // Functions (call Supabase Edge Functions)
  functions: {
    invoke: async (functionName, payload = {}) => {
      const { data, error } = await supabase.functions.invoke(functionName, {
        body: payload,
      });
      if (error) throw error;
      return { data };
    },
  },

  // Storage methods
  storage: {
    upload: async (bucket, path, file) => {
      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(path, file);
      if (error) throw error;
      return { file_url: data?.path };
    },
    getPublicUrl: (bucket, path) => {
      const { data } = supabase.storage.from(bucket).getPublicUrl(path);
      return data?.publicUrl;
    },
  },
};

export default db;