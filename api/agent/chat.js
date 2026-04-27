const SYSTEM_MODES = {
  synthetic: 'synthetic',
  live: 'live',
  blocked: 'blocked',
};

function safeJson(value, fallback = {}) {
  if (!value) return fallback;
  if (typeof value === 'object') return value;
  try { return JSON.parse(value); } catch { return fallback; }
}

function sanitizeMessage(value) {
  return String(value || '').slice(0, 4000).trim();
}

function buildSyntheticReply(message) {
  const lower = message.toLowerCase();
  if (lower.includes('browser') || lower.includes('form') || lower.includes('click') || lower.includes('scroll')) {
    return {
      intent: 'browser_task_request',
      reply: 'I can prepare a browser task request with URL, objective, steps, evidence requirements, and approval gates. Browser execution should run in the external Playwright worker, not directly from the public site.',
      suggested_action: 'Create a browser task using /api/browser/task with mode=headful or headless, target_url, objective, and evidence requirements.',
    };
  }
  if (lower.includes('dashboard') || lower.includes('status')) {
    return {
      intent: 'dashboard_status',
      reply: 'The AI In Action dashboard should show costs, queue status, proof logs, products, content drafts, simulated account state, blockers, and next actions. If a panel is missing, queue a dashboard_update task.',
      suggested_action: 'Open /dashboard or /ai-in-action and validate visible panels.',
    };
  }
  return {
    intent: 'general_ai_in_action',
    reply: 'AI In Action is operating in safe assistant mode. I can route requests into invention builds, validation, content drafts, product blueprints, simulated portfolio updates, browser validation tasks, or GPT Plus handoff prompts.',
    suggested_action: 'Ask for a specific task, for example: validate the site, create a content draft, build a product blueprint, or prepare a browser evidence run.',
  };
}

async function callOpenAI(message, context) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return null;

  const model = process.env.OPENAI_DEFAULT_MODEL || 'gpt-5-nano';
  const response = await fetch('https://api.openai.com/v1/responses', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      input: [
        {
          role: 'system',
          content: 'You are the AI In Action site assistant. Be concise, safe, proof-first, cost-aware, and do not expose secrets. No public publishing, real-money trading, paid API activation, or unrestricted browser control without approval.',
        },
        {
          role: 'user',
          content: `Context: ${JSON.stringify(context || {}).slice(0, 2000)}\n\nUser: ${message}`,
        },
      ],
      max_output_tokens: 500,
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`OpenAI call failed ${response.status}: ${text.slice(0, 500)}`);
  }
  const data = await response.json();
  const text = data.output_text || data.output?.flatMap((item) => item.content || []).map((c) => c.text || '').join('\n') || '';
  return { model, text: text.trim(), raw_status: response.status };
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

  const apiEnabled = Boolean(process.env.OPENAI_API_KEY) && process.env.AI_AGENT_LIVE_MODE === 'true';
  const startedAt = Date.now();

  try {
    if (apiEnabled) {
      const live = await callOpenAI(message, context);
      if (live?.text) {
        return response.status(200).json({
          ok: true,
          mode: SYSTEM_MODES.live,
          reply: live.text,
          model: live.model,
          cost_policy: {
            default_model: process.env.OPENAI_DEFAULT_MODEL || 'gpt-5-nano',
            daily_budget_usd: process.env.OPENAI_DAILY_BUDGET_USD || '3',
            max_calls_per_day: process.env.OPENAI_MAX_CALLS_PER_DAY || '50',
          },
          elapsed_ms: Date.now() - startedAt,
          timestamp: new Date().toISOString(),
        });
      }
    }

    const synthetic = buildSyntheticReply(message);
    return response.status(200).json({
      ok: true,
      mode: SYSTEM_MODES.synthetic,
      ...synthetic,
      cost_policy: {
        live_api_enabled: apiEnabled,
        no_api_cost: true,
      },
      elapsed_ms: Date.now() - startedAt,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    const fallback = buildSyntheticReply(message);
    return response.status(200).json({
      ok: true,
      mode: SYSTEM_MODES.synthetic,
      warning: 'Live assistant failed; returned synthetic fallback.',
      error: error.message,
      ...fallback,
      elapsed_ms: Date.now() - startedAt,
      timestamp: new Date().toISOString(),
    });
  }
}
