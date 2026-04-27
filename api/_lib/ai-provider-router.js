const PROVIDERS = {
  VERCEL_GATEWAY: 'vercel_gateway',
  GROQ: 'groq',
  OPENAI: 'openai',
  SYNTHETIC: 'synthetic',
};

function normalizeMessages({ system, user }) {
  return [
    { role: 'system', content: system || 'You are AI In Action: concise, safe, proof-first, cost-aware, and transparent.' },
    { role: 'user', content: user || 'Explain AI In Action status.' },
  ];
}

function extractText(payload) {
  return payload?.choices?.[0]?.message?.content || payload?.output_text || '';
}

async function callChatCompletions({ endpoint, apiKey, model, messages, providerName }) {
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      messages,
      temperature: 0.3,
      max_tokens: Number(process.env.AI_MAX_OUTPUT_TOKENS || 700),
    }),
  });
  const payload = await response.json().catch(async () => ({ raw: await response.text().catch(() => '') }));
  if (!response.ok) {
    throw new Error(`${providerName} failed ${response.status}: ${JSON.stringify(payload).slice(0, 700)}`);
  }
  return {
    ok: true,
    provider: providerName,
    model,
    text: extractText(payload),
    usage: payload?.usage || null,
  };
}

async function tryVercelGateway(messages) {
  const apiKey = process.env.AI_GATEWAY_API_KEY || process.env.VERCEL_AI_GATEWAY_API_KEY;
  if (!apiKey) throw new Error('Vercel AI Gateway key missing.');
  const model = process.env.AI_GATEWAY_DEFAULT_MODEL || process.env.AI_GATEWAY_MODEL || 'openai/gpt-oss-20b';
  return callChatCompletions({
    endpoint: process.env.AI_GATEWAY_BASE_URL || 'https://ai-gateway.vercel.sh/v1/chat/completions',
    apiKey,
    model,
    messages,
    providerName: PROVIDERS.VERCEL_GATEWAY,
  });
}

async function tryGroq(messages) {
  const apiKey = process.env.GROQ_API_KEY || process.env.VITE_GROQ_API_KEY;
  if (!apiKey) throw new Error('Groq key missing.');
  const model = process.env.GROQ_DEFAULT_MODEL || process.env.GROQ_MODEL || 'llama-3.1-8b-instant';
  return callChatCompletions({
    endpoint: 'https://api.groq.com/openai/v1/chat/completions',
    apiKey,
    model,
    messages,
    providerName: PROVIDERS.GROQ,
  });
}

async function tryOpenAI(messages) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error('OpenAI key missing.');
  const model = process.env.OPENAI_DEFAULT_MODEL || 'gpt-5-nano';
  return callChatCompletions({
    endpoint: 'https://api.openai.com/v1/chat/completions',
    apiKey,
    model,
    messages,
    providerName: PROVIDERS.OPENAI,
  });
}

function syntheticReply(userText, errors = []) {
  const lower = String(userText || '').toLowerCase();
  let intent = 'general_ai_in_action';
  let text = 'AI In Action is in synthetic fallback mode. I can still route tasks, prepare validation plans, draft browser task packets, create proof summaries, and generate GPT Plus handoff prompts without AI API spend.';
  if (lower.includes('browser') || lower.includes('form') || lower.includes('scroll') || lower.includes('click')) {
    intent = 'browser_task_request';
    text = 'Prepare a browser task packet with target URL, objective, steps, evidence requirements, and approval gates. Execute through the external Playwright/headful worker, not from the public site.';
  } else if (lower.includes('dashboard') || lower.includes('status')) {
    intent = 'dashboard_status';
    text = 'Check the AI In Action dashboard for queue, proof, cost, products, content, simulated portfolio, blockers, and next action panels. If a panel is missing, queue a dashboard_update task.';
  } else if (lower.includes('content') || lower.includes('post') || lower.includes('video')) {
    intent = 'content_draft';
    text = 'Create draft-only challenge content. Keep image/video generation approval-gated and label simulations clearly.';
  }
  return {
    ok: true,
    provider: PROVIDERS.SYNTHETIC,
    model: 'synthetic-fallback',
    text,
    intent,
    usage: null,
    provider_errors: errors.map((error) => String(error.message || error).slice(0, 500)),
  };
}

export async function routeAiText({ system, user, preferredProvider } = {}) {
  const messages = normalizeMessages({ system, user });
  const provider = preferredProvider || process.env.AI_TEXT_PROVIDER || PROVIDERS.VERCEL_GATEWAY;
  const fallbackChain = provider === PROVIDERS.GROQ
    ? [tryGroq, tryVercelGateway, tryOpenAI]
    : provider === PROVIDERS.OPENAI
      ? [tryOpenAI, tryVercelGateway, tryGroq]
      : provider === PROVIDERS.SYNTHETIC
        ? []
        : [tryVercelGateway, tryGroq, tryOpenAI];

  const errors = [];
  for (const attempt of fallbackChain) {
    try {
      const result = await attempt(messages);
      if (result?.text) return result;
      errors.push(new Error(`${result?.provider || 'provider'} returned empty text.`));
    } catch (error) {
      errors.push(error);
    }
  }
  return syntheticReply(user, errors);
}

export function aiCostPolicySnapshot() {
  return {
    text_provider: process.env.AI_TEXT_PROVIDER || PROVIDERS.VERCEL_GATEWAY,
    gateway_model: process.env.AI_GATEWAY_DEFAULT_MODEL || process.env.AI_GATEWAY_MODEL || 'openai/gpt-oss-20b',
    groq_model: process.env.GROQ_DEFAULT_MODEL || process.env.GROQ_MODEL || 'llama-3.1-8b-instant',
    openai_model: process.env.OPENAI_DEFAULT_MODEL || 'gpt-5-nano',
    monthly_budget_usd: process.env.AI_MONTHLY_BUDGET_USD || '100',
    daily_budget_usd: process.env.AI_DAILY_BUDGET_USD || process.env.OPENAI_DAILY_BUDGET_USD || '3',
    max_calls_per_day: process.env.AI_MAX_CALLS_PER_DAY || process.env.OPENAI_MAX_CALLS_PER_DAY || '50',
    image_video_approval_required: process.env.AI_IMAGE_VIDEO_APPROVAL_REQUIRED !== 'false',
  };
}
