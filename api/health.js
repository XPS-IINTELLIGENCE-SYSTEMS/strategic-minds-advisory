export default function handler(request, response) {
  const env = {
    supabase_public: Boolean(process.env.VITE_SUPABASE_URL && process.env.VITE_SUPABASE_ANON_KEY),
    supabase_url: Boolean(process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL),
    supabase_service_role: Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY),
    groq: Boolean(process.env.GROQ_API_KEY || process.env.VITE_GROQ_API_KEY),
    finnhub: Boolean(process.env.FINNHUB_API_KEY),
    cron_secret: Boolean(process.env.CRON_SECRET),
  };

  const requiredForCronWrites = ['supabase_url', 'supabase_service_role', 'groq'];
  const missingRequiredForCronWrites = requiredForCronWrites.filter((key) => !env[key]);

  response.status(200).json({
    app: 'AI in Action Labs',
    service: 'ai-in-action-runtime',
    status: missingRequiredForCronWrites.length === 0 ? 'ok' : 'partial',
    mode: env.supabase_public ? 'supabase-ready' : 'synthetic-fallback',
    timestamp: new Date().toISOString(),
    connectors: {
      vercel: 'live',
      github: 'live',
      supabase_public: env.supabase_public ? 'configured' : 'missing-env',
      supabase_admin: env.supabase_service_role ? 'configured' : 'missing-service-role',
      groq: env.groq ? 'configured' : 'missing-env',
      finnhub: env.finnhub ? 'configured' : 'missing-env',
      cron_secret: env.cron_secret ? 'configured' : 'missing-env',
      base44: 'disabled',
    },
    runtime_env: env,
    missing_required_for_cron_writes: missingRequiredForCronWrites,
    data_state: 'migration-supported',
    notes: {
      groq: env.groq ? 'Groq runtime key is visible to Vercel.' : 'Groq runtime key is not visible to Vercel.',
      finnhub: env.finnhub ? 'Equity and ETF quote checks can use Finnhub.' : 'FINNHUB_API_KEY missing. Equity and ETF quote checks will be marked unavailable.',
      cron_secret: env.cron_secret ? 'Cron endpoint supports CRON_SECRET protection.' : 'CRON_SECRET missing. Vercel scheduled calls may still run, but manual endpoint protection is weaker.',
      supabase_admin: env.supabase_service_role ? 'Server-side Supabase writes are available.' : 'SUPABASE_SERVICE_ROLE_KEY missing. Cron route will not be able to write schedule runs or price receipts.',
    },
  });
}
