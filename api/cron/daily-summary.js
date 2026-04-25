import { generateGroqText } from '../_lib/groqClient.js';
import { authorizeCron, jsonResponse, logAiRun, logScheduleRun } from '../_lib/cronUtils.js';

function buildPrompt() {
  return `Create a daily AI in Action Labs summary for an educational platform. The platform includes paper-trading simulation, source receipts, digital business building, avatar media, and human approval gates. Do not invent live market prices, revenue, deployments, or completed work. Include: current objective, what AI did, what remains blocked, what humans should do, what AI should do next, and a concise teaching lesson.`;
}

export default async function handler(request, response) {
  const auth = authorizeCron(request);
  if (!auth.ok) return jsonResponse(response, 401, { ok: false, error: 'Unauthorized cron request.' });

  const startedAt = new Date().toISOString();
  const groq = await generateGroqText({
    system: 'You are the AI in Action Labs operating narrator. Be truthful, concise, source-aware, and explicit about unknowns.',
    user: buildPrompt(),
    temperature: 0.25,
    maxTokens: 1200,
  });

  const summary = groq.text || `Daily summary generated in fallback mode. Groq unavailable: ${groq.error || 'unknown error'}.`;
  const status = groq.error ? 'partial' : 'completed';

  const scheduleRun = await logScheduleRun({
    labSlug: 'digital-business-builder',
    runType: 'daily-summary',
    status,
    startedAt,
    summary,
    result: { groq_model: groq.model, groq_error: groq.error, auth_mode: auth.mode },
    errorMessage: groq.error,
  });

  const aiRun = await logAiRun({
    labSlug: 'digital-business-builder',
    title: 'Daily AI in Action operating summary',
    runKind: 'daily-summary',
    objective: 'Summarize the platform state and next actions for observers and operators.',
    status,
    whatAiDid: summary,
    howAiDidIt: 'Generated a scheduled educational operating summary using the server-side AI route and logged the result to Supabase when configured.',
    whyItMatters: 'This keeps the AI-in-action process visible even when no human is actively in chat.',
    blocker: groq.error || scheduleRun.error || null,
    nextAction: 'Review Supabase migration status and continue building source receipts, memory, discovery, and media pipelines.',
    riskLevel: 'low',
    evidence: [{ type: 'cron', route: '/api/cron/daily-summary', started_at: startedAt }],
  });

  return jsonResponse(response, 200, {
    ok: true,
    status,
    summary,
    errors: { groq: groq.error, schedule_run: scheduleRun.error, ai_run: aiRun.error },
  });
}
