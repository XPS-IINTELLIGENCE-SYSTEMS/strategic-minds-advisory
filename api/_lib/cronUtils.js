import { insertRows } from './supabaseAdmin.js';

export function authorizeCron(request) {
  const expected = process.env.CRON_SECRET;
  if (!expected) return { ok: true, mode: 'unprotected-no-cron-secret' };
  const header = request.headers['x-cron-secret'] || request.headers.authorization;
  const token = String(header || '').replace(/^Bearer\s+/i, '');
  return { ok: token === expected, mode: 'protected' };
}

export function jsonResponse(response, status, payload) {
  response.status(status).json({
    ...payload,
    timestamp: new Date().toISOString(),
  });
}

export async function logScheduleRun({ labSlug, runType, status, startedAt, summary, result = {}, errorMessage = null }) {
  return insertRows('ai_schedule_runs', {
    lab_slug: labSlug,
    run_type: runType,
    status,
    started_at: startedAt,
    completed_at: new Date().toISOString(),
    summary,
    result,
    error_message: errorMessage,
    is_public: true,
  });
}

export async function logAiRun({ labSlug, title, runKind, objective, status = 'completed', whatAiDid, howAiDidIt, whyItMatters, blocker = null, nextAction = null, riskLevel = 'medium', evidence = [] }) {
  return insertRows('ai_runs', {
    lab_slug: labSlug,
    title,
    run_kind: runKind,
    objective,
    status,
    what_ai_did: whatAiDid,
    how_ai_did_it: howAiDidIt,
    why_it_matters: whyItMatters,
    blocker,
    next_action: nextAction,
    risk_level: riskLevel,
    evidence,
    is_public: true,
  });
}

export function envStatus() {
  const env = {
    supabase_public: Boolean(process.env.VITE_SUPABASE_URL && process.env.VITE_SUPABASE_ANON_KEY),
    supabase_url: Boolean(process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL),
    supabase_service_role: Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY),
    groq: Boolean(process.env.GROQ_API_KEY),
    finnhub: Boolean(process.env.FINNHUB_API_KEY),
    cron_secret: Boolean(process.env.CRON_SECRET),
    heygen: Boolean(process.env.HEYGEN_API_KEY),
  };

  return {
    env,
    mode: env.supabase_service_role && env.groq ? 'write-capable' : 'fallback-or-partial',
    missingForAutonomousWrites: ['supabase_url', 'supabase_service_role'].filter((key) => !env[key]),
    missingForAiGeneration: ['groq'].filter((key) => !env[key]),
  };
}
