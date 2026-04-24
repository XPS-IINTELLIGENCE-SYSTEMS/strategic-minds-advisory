export default async function handler(request, response) {
  const hasSupabase = Boolean(process.env.VITE_SUPABASE_URL && process.env.VITE_SUPABASE_ANON_KEY);
  const hasGroq = Boolean(process.env.GROQ_API_KEY || process.env.VITE_GROQ_API_KEY);

  response.status(200).json({
    app: 'AI in Action Labs',
    status: 'ok',
    mode: hasSupabase ? 'supabase-ready' : 'synthetic-fallback',
    connectors: {
      vercel: 'live',
      github: 'live',
      supabase: hasSupabase ? 'configured' : 'missing-env',
      groq: hasGroq ? 'configured' : 'missing-env',
      base44: 'disabled'
    },
    dataState: 'empty-migration-supported',
    timestamp: new Date().toISOString()
  });
}
