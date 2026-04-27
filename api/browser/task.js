function safeJson(value, fallback = {}) {
  if (!value) return fallback;
  if (typeof value === 'object') return value;
  try { return JSON.parse(value); } catch { return fallback; }
}

function sanitize(value, max = 2000) {
  return String(value || '').trim().slice(0, max);
}

function classifyRisk(task) {
  const text = `${task.objective || ''} ${task.steps?.join(' ') || ''}`.toLowerCase();
  const blockedTerms = ['password', 'secret', 'token', 'credit card', 'bank login', 'bypass captcha', 'evade', 'scrape private'];
  const approvalTerms = ['submit', 'purchase', 'publish', 'post', 'delete', 'transfer', 'trade', 'payment', 'stripe launch'];
  if (blockedTerms.some((term) => text.includes(term))) return { status: 'blocked', reason: 'Task requests sensitive credential, evasion, or private-data behavior.' };
  if (approvalTerms.some((term) => text.includes(term))) return { status: 'needs_approval', reason: 'Task may perform a public, paid, destructive, or irreversible action.' };
  return { status: 'queued', reason: 'Safe to prepare for browser validation or evidence capture.' };
}

function normalizeTask(body) {
  const mode = ['headful', 'headless'].includes(body.mode) ? body.mode : 'headful';
  const targetUrl = sanitize(body.target_url || body.url, 1000);
  const objective = sanitize(body.objective, 2000);
  const steps = Array.isArray(body.steps) ? body.steps.map((step) => sanitize(step, 500)).filter(Boolean).slice(0, 20) : [];
  const evidence = Array.isArray(body.evidence) && body.evidence.length
    ? body.evidence.map((item) => sanitize(item, 200)).filter(Boolean).slice(0, 20)
    : ['screenshot', 'final_url', 'status', 'visible_text_summary', 'failure_reason'];

  return {
    task_id: `browser_${Date.now()}_${Math.random().toString(16).slice(2, 8)}`,
    mode,
    target_url: targetUrl,
    objective,
    steps,
    evidence,
    capabilities_requested: {
      navigate: true,
      click: Boolean(body.capabilities?.click ?? true),
      type: Boolean(body.capabilities?.type ?? true),
      scroll: Boolean(body.capabilities?.scroll ?? true),
      form_fill: Boolean(body.capabilities?.form_fill ?? true),
      screenshot: Boolean(body.capabilities?.screenshot ?? true),
      download: false,
      upload: false,
      payment: false,
      public_publish: false,
    },
    approval_required: false,
    created_at: new Date().toISOString(),
  };
}

export default async function handler(request, response) {
  response.setHeader('Content-Type', 'application/json; charset=utf-8');
  response.setHeader('Cache-Control', 'no-store');

  if (request.method !== 'POST') {
    response.setHeader('Allow', 'POST');
    return response.status(405).json({ ok: false, error: 'Method not allowed.' });
  }

  const body = safeJson(request.body, {});
  const task = normalizeTask(body);

  if (!task.target_url || !/^https?:\/\//.test(task.target_url)) {
    return response.status(400).json({ ok: false, error: 'Missing valid target_url.' });
  }
  if (!task.objective) {
    return response.status(400).json({ ok: false, error: 'Missing objective.' });
  }

  const risk = classifyRisk(task);
  const packet = {
    ...task,
    status: risk.status,
    approval_required: risk.status === 'needs_approval',
    blocked: risk.status === 'blocked',
    risk_reason: risk.reason,
    runtime_contract: {
      executor: 'external-playwright-worker',
      public_site_executes_browser: false,
      local_headful_supported: true,
      ci_headless_supported: true,
      save_evidence_packet: true,
      no_secret_capture: true,
    },
    output_contract: {
      save: ['url', 'timestamp', 'mode', 'screenshot_path', 'extracted_fields', 'pass_fail', 'failure_reason', 'manual_takeover_point'],
      report_to: ['ai_proof_logs', 'github_issue_if_blocked_or_failed'],
    },
  };

  return response.status(200).json({
    ok: risk.status !== 'blocked',
    mode: 'browser-task-planner',
    task: packet,
    message: risk.status === 'queued'
      ? 'Browser task packet prepared. Execute through the external Playwright/headful worker.'
      : risk.status === 'needs_approval'
        ? 'Browser task packet requires approval before execution.'
        : 'Browser task blocked by safety policy.',
    timestamp: new Date().toISOString(),
  });
}
