#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const startedAt = Date.now();
const workerName = process.env.AI_WORKER_NAME || 'ai-in-action-phase1-worker';
const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY || '';
const baseUrl = process.env.AI_IN_ACTION_BASE_URL || 'https://strategic-minds-advisory-git-main-strategic-minds-advisory.vercel.app';
const dailyBudgetUsd = Number(process.env.OPENAI_DAILY_BUDGET_USD || '3');
const maxCallsPerDay = Number(process.env.OPENAI_MAX_CALLS_PER_DAY || '50');
const defaultModel = process.env.OPENAI_DEFAULT_MODEL || 'gpt-5-nano';
const outputPath = process.env.AI_WORKER_OUTPUT || '.ai-ops/worker-last-output.json';

function nowIso() {
  return new Date().toISOString();
}

function ensureDir(file) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
}

function writeOutput(output) {
  ensureDir(outputPath);
  fs.writeFileSync(outputPath, `${JSON.stringify(output, null, 2)}\n`, 'utf8');
  console.log(JSON.stringify(output, null, 2));
}

function requireSupabase() {
  if (!supabaseUrl || !supabaseKey) {
    const output = {
      ok: false,
      status: 'blocked',
      blocker: 'Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY.',
      handoff_prompt: 'Add SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY to GitHub Actions secrets, then rerun AI In Action Scheduled Worker.',
      timestamp: nowIso(),
    };
    writeOutput(output);
    process.exit(0);
  }
}

async function sbFetch(table, options = {}) {
  const url = new URL(`/rest/v1/${table}`, supabaseUrl);
  if (options.query) {
    for (const [key, value] of Object.entries(options.query)) url.searchParams.set(key, value);
  }
  const response = await fetch(url, {
    method: options.method || 'GET',
    headers: {
      apikey: supabaseKey,
      Authorization: `Bearer ${supabaseKey}`,
      'Content-Type': 'application/json',
      Prefer: options.prefer || 'return=representation',
      ...(options.headers || {}),
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
  });
  const text = await response.text();
  let data = null;
  try { data = text ? JSON.parse(text) : null; } catch { data = text; }
  if (!response.ok) {
    throw new Error(`Supabase ${table} ${options.method || 'GET'} failed ${response.status}: ${typeof data === 'string' ? data : JSON.stringify(data)}`);
  }
  return data;
}

async function insertRun(status = 'started', taskId = null, details = {}) {
  const rows = await sbFetch('ai_worker_runs', {
    method: 'POST',
    body: [{
      worker_name: workerName,
      run_source: 'github-actions',
      status,
      task_id: taskId,
      details,
      github_run_url: process.env.GITHUB_RUN_ID && process.env.GITHUB_REPOSITORY
        ? `https://github.com/${process.env.GITHUB_REPOSITORY}/actions/runs/${process.env.GITHUB_RUN_ID}`
        : null,
    }],
  });
  return Array.isArray(rows) ? rows[0] : rows;
}

async function updateRun(runId, patch) {
  if (!runId) return null;
  const rows = await sbFetch('ai_worker_runs', {
    method: 'PATCH',
    query: { id: `eq.${runId}` },
    body: patch,
  });
  return Array.isArray(rows) ? rows[0] : rows;
}

async function logProof(proof) {
  return sbFetch('ai_proof_logs', { method: 'POST', body: [proof] });
}

async function getCostSummary() {
  const start = new Date();
  start.setUTCHours(0, 0, 0, 0);
  const rows = await sbFetch('ai_cost_ledger', {
    query: {
      select: 'estimated_cost_usd,provider,created_at',
      created_at: `gte.${start.toISOString()}`,
      provider: 'eq.openai',
    },
  });
  const total = (rows || []).reduce((sum, row) => sum + Number(row.estimated_cost_usd || 0), 0);
  return { callsToday: rows?.length || 0, estimatedCostToday: total };
}

async function pickTask() {
  const rows = await sbFetch('ai_work_queue', {
    query: {
      select: '*',
      status: 'eq.queued',
      scheduled_for: `lte.${nowIso()}`,
      order: 'priority.desc,created_at.asc',
      limit: '1',
    },
  });
  return rows?.[0] || null;
}

async function patchTask(id, patch) {
  const rows = await sbFetch('ai_work_queue', {
    method: 'PATCH',
    query: { id: `eq.${id}` },
    body: { ...patch, updated_at: nowIso() },
  });
  return Array.isArray(rows) ? rows[0] : rows;
}

function buildHandoffPrompt(task, reason, evidence = {}) {
  return `Operate as AI In Action master build operator.\n\nThe scheduled worker stopped and needs GPT Plus review.\n\nTask ID: ${task?.id || 'none'}\nTask type: ${task?.task_type || 'none'}\nReason: ${reason}\nEvidence: ${JSON.stringify(evidence, null, 2)}\n\nReturn: diagnosis, safe next action, exact repo patch or command file, validation step, and next prompt.\n\nRules: no secrets, no public publishing, no real-money trading, no paid API activation, no uncontrolled repo creation.`;
}

async function validateRoute(task, run) {
  const route = task.payload?.route || task.payload?.path || '/api/health';
  const url = route.startsWith('http') ? route : `${baseUrl}${route}`;
  const headers = {};
  if (process.env.VERCEL_PROTECTION_BYPASS) headers['x-vercel-protection-bypass'] = process.env.VERCEL_PROTECTION_BYPASS;
  const response = await fetch(url, { headers });
  const text = await response.text();
  let parsed = null;
  try { parsed = JSON.parse(text); } catch { parsed = { raw: text.slice(0, 500) }; }
  if (!response.ok) throw new Error(`Validation failed ${response.status}: ${text.slice(0, 500)}`);
  await logProof({
    task_id: task.id,
    run_id: run.id,
    proof_type: 'route_validation',
    title: `Validated route ${route}`,
    status: 'passed',
    url,
    evidence: { status: response.status, body: parsed },
    notes: 'Validated by AI In Action scheduled worker.',
    public_safe: true,
  });
  return { route, url, status: response.status, body: parsed };
}

async function createContentDraft(task, run) {
  const payload = task.payload || {};
  const rows = await sbFetch('ai_content_queue', {
    method: 'POST',
    body: [{
      content_type: payload.content_type || 'build_recap',
      status: 'draft',
      title: payload.title || 'AI In Action Build Recap',
      hook: payload.hook || 'Can GPT help build a million-dollar business in one year? Let us find out.',
      body: payload.body || 'Draft created by deterministic worker from queue payload. Requires review before publishing.',
      asset_prompt: payload.asset_prompt || null,
      platform: payload.platform || null,
      approval_required: true,
      estimated_generation_cost_usd: 0,
      metadata: { task_id: task.id, run_id: run.id, deterministic: true },
    }],
  });
  return { inserted: rows?.[0] || rows };
}

async function createProductIdea(task, run) {
  const payload = task.payload || {};
  const slug = String(payload.slug || payload.product_name || 'ai-in-action-product').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
  const rows = await sbFetch('ai_products', {
    method: 'POST',
    body: [{
      product_name: payload.product_name || 'AI In Action Product Draft',
      slug,
      status: 'draft',
      target_customer: payload.target_customer || 'AI builders and small business operators',
      problem_solved: payload.problem_solved || 'Needs proof-first low-cost AI operating systems.',
      promise: payload.promise || 'A practical blueprint or template pack.',
      deliverables: payload.deliverables || [],
      price_min_usd: payload.price_min_usd || 49,
      price_max_usd: payload.price_max_usd || 199,
      stripe_notes: 'Create Stripe product/payment link only after approval.',
      landing_page_copy: payload.landing_page_copy || null,
      content_hooks: payload.content_hooks || [],
      proof_requirements: payload.proof_requirements || ['proof issue', 'validated route'],
      approval_required: true,
    }],
  });
  return { inserted: rows?.[0] || rows };
}

async function createHandoff(task, run, reason, evidence = {}) {
  const prompt = buildHandoffPrompt(task, reason, evidence);
  await logProof({
    task_id: task?.id || null,
    run_id: run?.id || null,
    proof_type: 'gpt_plus_handoff',
    title: `GPT Plus handoff required: ${task?.task_type || 'unknown'}`,
    status: 'blocked',
    url: null,
    evidence: { reason, evidence, handoff_prompt: prompt },
    notes: 'Worker stopped instead of spending more API budget or crossing a safety gate.',
    public_safe: true,
  });
  return { handoff_prompt: prompt };
}

async function main() {
  requireSupabase();
  let run = await insertRun('started', null, { baseUrl, defaultModel, dailyBudgetUsd, maxCallsPerDay });
  try {
    const cost = await getCostSummary();
    if (cost.estimatedCostToday >= dailyBudgetUsd || cost.callsToday >= maxCallsPerDay) {
      const evidence = { cost, dailyBudgetUsd, maxCallsPerDay };
      const handoff = buildHandoffPrompt(null, 'Budget or call cap reached before task selection.', evidence);
      await updateRun(run.id, { status: 'budget_exceeded', finished_at: nowIso(), duration_ms: Date.now() - startedAt, summary: 'Budget gate stopped worker.', details: { cost, handoff_prompt: handoff } });
      return writeOutput({ ok: false, status: 'budget_exceeded', cost, handoff_prompt: handoff, timestamp: nowIso() });
    }

    const task = await pickTask();
    if (!task) {
      await updateRun(run.id, { status: 'completed', finished_at: nowIso(), duration_ms: Date.now() - startedAt, summary: 'No queued task found.', details: { cost } });
      return writeOutput({ ok: true, status: 'idle', message: 'No queued task found.', cost, timestamp: nowIso() });
    }

    await updateRun(run.id, { task_id: task.id, details: { cost, task_type: task.task_type } });
    await patchTask(task.id, { status: 'running', locked_at: nowIso(), locked_by: workerName, attempt_count: Number(task.attempt_count || 0) + 1 });

    let result;
    if (task.approval_required) {
      result = await createHandoff(task, run, 'Task requires approval before execution.', { task_type: task.task_type });
      await patchTask(task.id, { status: 'needs_approval', blocked_reason: 'Approval required.' });
      await updateRun(run.id, { status: 'safety_stopped', finished_at: nowIso(), duration_ms: Date.now() - startedAt, summary: 'Approval gate stopped worker.', details: result });
      return writeOutput({ ok: false, status: 'needs_approval', task_id: task.id, ...result, timestamp: nowIso() });
    }

    switch (task.task_type) {
      case 'validation':
        result = await validateRoute(task, run);
        break;
      case 'content_draft':
      case 'social_asset_draft':
      case 'video_script_draft':
      case 'image_prompt_draft':
        result = await createContentDraft(task, run);
        break;
      case 'stripe_product_idea':
        result = await createProductIdea(task, run);
        break;
      case 'gpt_plus_handoff':
        result = await createHandoff(task, run, 'Queue requested GPT Plus handoff.', task.payload || {});
        break;
      default:
        result = await createHandoff(task, run, `Unsupported deterministic task type: ${task.task_type}`, { payload: task.payload });
        await patchTask(task.id, { status: 'blocked', blocked_reason: `Unsupported deterministic task type: ${task.task_type}`, result });
        await updateRun(run.id, { status: 'blocked', finished_at: nowIso(), duration_ms: Date.now() - startedAt, summary: 'Unsupported task type.', details: result });
        return writeOutput({ ok: false, status: 'blocked', task_id: task.id, ...result, timestamp: nowIso() });
    }

    await patchTask(task.id, { status: 'completed', completed_at: nowIso(), result });
    await updateRun(run.id, { status: 'completed', finished_at: nowIso(), duration_ms: Date.now() - startedAt, summary: `Processed ${task.task_type}.`, details: result });
    return writeOutput({ ok: true, status: 'completed', task_id: task.id, task_type: task.task_type, result, timestamp: nowIso() });
  } catch (error) {
    const evidence = { message: error.message, stack: error.stack?.slice(0, 1000) };
    await updateRun(run?.id, { status: 'failed', finished_at: nowIso(), duration_ms: Date.now() - startedAt, summary: error.message, details: evidence }).catch(() => null);
    writeOutput({ ok: false, status: 'failed', error: error.message, evidence, timestamp: nowIso() });
    process.exitCode = 1;
  }
}

main();
