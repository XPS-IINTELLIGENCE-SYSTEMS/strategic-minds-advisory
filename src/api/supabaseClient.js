// This app uses Base44's built-in backend and doesn't require direct Supabase setup
// For data operations, use base44.entities instead

import { base44 } from './base44Client';

// Mock supabase object for compatibility
export const supabase = {
  from: (table) => ({
    select: () => ({
      eq: (field, value) => ({
        single: async () => ({ data: null, error: null }),
        limit: async () => ({ data: [], error: null }),
      }),
      limit: async () => ({ data: [], error: null }),
    }),
    insert: (data) => ({
      select: async () => ({ data, error: null }),
    }),
    update: (data) => ({
      eq: () => ({
        select: async () => ({ data, error: null }),
      }),
    }),
    delete: () => ({
      eq: async () => ({ error: null }),
    }),
  }),
  auth: {
    signUp: async (creds) => ({ data: null, error: null }),
    signInWithPassword: async (creds) => ({ data: null, error: null }),
    signOut: async () => ({ error: null }),
    getSession: async () => ({ data: null }),
    getUser: async () => ({ data: { user: null } }),
    onAuthStateChange: () => () => {},
  },
  functions: {
    invoke: async (fn, opts) => ({ data: null, error: null }),
  },
  storage: {
    from: () => ({
      upload: async () => ({ data: null, error: null }),
      getPublicUrl: () => ({ data: { publicUrl: null } }),
    }),
  },
};

// Compatibility wrapper for existing code that imports from supabaseClient
export const db = {
  auth: {
    signUp: (email, password) => base44.auth.signup(email, password),
    signIn: (email, password) => base44.auth.login(email, password),
    signOut: () => base44.auth.logout(),
    getSession: async () => {
      try {
        const user = await base44.auth.me();
        return user;
      } catch {
        return null;
      }
    },
    getUser: async () => {
      try {
        return await base44.auth.me();
      } catch {
        return null;
      }
    },
    onAuthStateChange: (callback) => {
      // Base44 doesn't expose auth state changes directly
      // Use polling or re-check on component mount
      return () => {};
    },
  },

  entities: {
    create: async (table, data) => {
      return await base44.entities[table].create(data);
    },
    read: async (table, id) => {
      const results = await base44.entities[table].filter({ id });
      return results[0] || null;
    },
    list: async (table, filters = {}, sort = null, limit = 1000) => {
      if (Object.keys(filters).length === 0) {
        return await base44.entities[table].list();
      }
      return await base44.entities[table].filter(filters);
    },
    update: async (table, id, data) => {
      return await base44.entities[table].update(id, data);
    },
    delete: async (table, id) => {
      return await base44.entities[table].delete(id);
    },
    filter: async (table, filters = {}, sort = null, limit = 1000) => {
      return await base44.entities[table].filter(filters);
    },
    bulkCreate: async (table, data) => {
      return await base44.entities[table].bulkCreate(data);
    },
    subscribe: (table, callback) => {
      return base44.entities[table].subscribe((event) => {
        callback({
          type: event.type,
          id: event.id,
          data: event.data,
        });
      });
    },
  },

  functions: {
    invoke: async (functionName, payload = {}) => {
      return await base44.functions.invoke(functionName, payload);
    },
  },

  storage: {
    upload: async (bucket, path, file) => {
      const result = await base44.integrations.Core.UploadFile({ file });
      return { file_url: result.file_url };
    },
    getPublicUrl: (bucket, path) => {
      return path;
    },
  },
};

export default db;