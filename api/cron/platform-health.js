import { envStatus, authorizeCron, jsonResponse, logAiRun, logScheduleRun } from '../_lib/cronUtils.js';

export default async function handler(request, response) {
  const auth = authorizeCron(request);
  if (!auth.ok) return jsonResponse(response, 401, { ok: false, error: 'Unauthorized cron request.' });

  const startedAt = new Date().toISOString();
  const status = envStatus();
  const healthState = status.missingForAutonomousWrites.length === 0 ? 'completed' : 'partial';
  const summary = healthState === 'completed'
    ? 'Platform health check completed. Autonomous Supabase writes are configured.'
    : `Platform health check completed with missing autonomous-write requirements: ${status.missingForAutonomousWrites.join(', ') || 'none'}.`;

  const scheduleRun = await logScheduleRun({
    labSlug: 'digital-business-builder',
    runType: 'platform-health',
    status: healthState,
    startedAt,
    summary,
    result: { ...status, auth_mode: auth.mode },
    errorMessage: healthState === 'partial' ? summary : null,
  });

  const aiRun = await logAiRun({
    labSlug: 'digital-business-builder',
    title: 'Platform health check',
    runKind: 'platform-health',
    objective: 'Check whether the autonomous runtime has the environment needed to write logs and generate AI summaries.',
    status: healthState,
    whatAiDid: summary,
    howAiDidIt: 'Read server-side environment availability flags without exposing secret values.',
    whyItMatters: 'The audience and operator need to know whether the system is fully autonomous or running in fallback mode.',
    blocker: healthState === 'partial' ? summary : null,
    nextAction: healthState === 'partial' ? 'Add missing environment variables in Vercel/GitHub secrets, then redeploy.' : 'Continue scheduled AI in Action runs.',
    riskLevel: 'low',
    evidence: [{ type: 'cron', route: '/api/cron/platform-health', started_at: startedAt }],
  });

  return jsonResponse(response, 200, {
    ok: true,
    status: healthState,
    health: status,
    errors: { schedule_run: scheduleRun.error, ai_run: aiRun.error },
  });
}
