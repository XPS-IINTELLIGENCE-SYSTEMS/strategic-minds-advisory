const readEnv = (key, fallback = '') => {
  try {
    return import.meta.env?.[key] || fallback;
  } catch {
    return fallback;
  }
};

export const runtimeConfig = {
  supabaseUrl: readEnv('VITE_SUPABASE_URL'),
  supabaseAnonKey: readEnv('VITE_SUPABASE_ANON_KEY'),
  groqApiKeyPresent: Boolean(readEnv('VITE_GROQ_API_KEY')),
  groqModel: readEnv('VITE_GROQ_MODEL', 'llama-3.3-70b-versatile'),
  appMode: readEnv('VITE_APP_MODE', 'local'),
  dataMode: readEnv('VITE_DATA_MODE', 'synthetic'),
};

export const runtimeStatus = {
  supabase: runtimeConfig.supabaseUrl && runtimeConfig.supabaseAnonKey ? 'configured' : 'missing_env',
  groq: runtimeConfig.groqApiKeyPresent ? 'configured' : 'missing_env',
  base44: 'disabled',
  fallback: 'enabled',
};

export function getRuntimeLabel() {
  if (runtimeStatus.supabase === 'configured') return 'supabase-ready';
  return 'local-synthetic';
}
