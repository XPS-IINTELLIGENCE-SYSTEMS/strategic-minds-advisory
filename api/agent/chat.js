import { aiCostPolicySnapshot, routeAiText } from '../_lib/ai-provider-router.js';

function safeJson(value, fallback = {}) {
  if (!value) return fallback;
  if (typeof value === 'object') return value;
  try { return JSON.parse(value); } catch { return fallback; }
}

function sanitizeMessage(value) {
  return String(value || '').slice(0, 4000).trim();
}

function inferSuggestedAction(message, providerResult) {
  const lower = String(message || '').toLowerCase();
  if (providerResult?.intent === 'browser_task_request' || lower.includes('browser') || lower.includes('form') || lower.includes('click') || lower.includes('scroll')) {
    return 'Create a browser task using /api/browser/task with mode=headful or headless, target_url, objective, and evidence requirements.';
  }
  if (providerResult?.intent === 'dashboard_status' || lower.includes('dashboard') || lower.includes('status')) {
    return 'Open /dashboard, confirm the sidebar and chat panel render, then validate API routes and proof logs.';
  }
  if (providerResult?.intent === 'content_draft' || lower.includes('content') || lower.includes('video') || lower.includes('post')) {
    return 'Create a draft-only content queue item and require approval before public publishing or high-cost media generation.';
  }
  return 'Route this into the safest next queue task, proof log, or GPT Plus handoff if budget/complexity exceeds limits.';
}

export default async function handler(request, response) {
  response.setHeader('Content-Type', 'application/json; charset=utf-8');
  response.setHeader('Cache-Control', 'no-store');

  if (request.method !== 'POST') {
    response.setHeader('Allow', 'POST');
    return response.status(405).json({ ok: false, error: 'Method not allowed.' });
  }

  const body = safeJson(request.body, {});
  const message = sanitizeMessage(body.message);
  const context = safeJson(body.context, {});

  if (!message) {
    return response.status(400).json({ ok: false, error: 'Missing message.' });
  }

  const startedAt = Date.now();
  const system = [
    'You are the AI In Action site and dashboard assistant.',
    'Be concise, safe, proof-first, cost-aware, and transparent.',
    'No public publishing, real-money trading, paid API activation, secret exposure, or unrestricted browser control without approval.',
    'Prefer deterministic queue tasks, browser task packets, validation reports, and GPT Plus handoffs when appropriate.',
  ].join(' ');

  const user = `Context: ${JSON.stringify(context || {}).slice(0, 2000)}\n\nUser: ${message}`;

  try {
    const result = await routeAiText({ system, user, preferredProvider: process.env.AI_TEXT_PROVIDER });
    return response.status(200).json({
      ok: true,
      mode: result.provider === 'synthetic' ? 'synthetic' : 'live',
      provider: result.provider,
      model: result.model,
      reply: result.text,
      intent: result.intent || null,
      suggested_action: inferSuggestedAction(message, result),
      usage: result.usage || null,
      provider_errors: result.provider_errors || undefined,
      cost_policy: aiCostPolicySnapshot(),
      elapsed_ms: Date.now() - startedAt,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return response.status(200).json({
      ok: true,
      mode: 'synthetic',
      provider: 'synthetic',
      model: 'synthetic-fallback',
      warning: 'Provider router failed; returned safety fallback.',
      error: error.message,
      reply: 'AI In Action is in synthetic fallback. I can still prepare queue actions, browser task packets, validation plans, and GPT Plus handoff prompts without AI API spend.',
      suggested_action: inferSuggestedAction(message, null),
      cost_policy: aiCostPolicySnapshot(),
      elapsed_ms: Date.now() - startedAt,
      timestamp: new Date().toISOString(),
    });
  }
}
