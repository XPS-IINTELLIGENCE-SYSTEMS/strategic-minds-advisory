// This app uses Base44's built-in backend
// Mock supabase object for backward compatibility

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
};

export const supabaseAuth = {
  signUp: (email, password) => supabase.auth.signUp({ email, password }),
  signIn: (email, password) => supabase.auth.signInWithPassword({ email, password }),
  signOut: () => supabase.auth.signOut(),
  getSession: () => supabase.auth.getSession(),
  onAuthStateChange: (callback) => supabase.auth.onAuthStateChange(callback),
};