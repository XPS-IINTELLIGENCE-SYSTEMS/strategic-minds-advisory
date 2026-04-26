import { insertRows } from '../_lib/supabaseAdmin.js';
import { sendSandboxReport } from '../_lib/emailReporter.js';

function slugify(value) {
  return String(value || 'untitled-system')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80) || 'untitled-system';
}

export default async function handler(request, response) {
  if (request.method !== 'POST') {
    response.setHeader('Allow', 'POST');
    return response.status(405).json({ ok: false, error: 'Method not allowed.' });
  }

  const body = typeof request.body === 'string' ? JSON.parse(request.body || '{}') : request.body || {};
  const systemName = String(body.system_name || body.name || '').trim();
  const buildPrompt = String(body.build_prompt || body.prompt || '').trim();

  if (!systemName || !buildPrompt) {
    return response.status(400).json({ ok: false, error: 'system_name and build_prompt are required.' });
  }

  const systemSlug = slugify(body.system_slug || systemName);
  const row = {
    requested_by: String(body.requested_by || 'ai-in-action'),
    system_name: systemName,
    system_slug: systemSlug,
    build_prompt: buildPrompt,
    target_mode: String(body.target_mode || 'sandbox'),
    status: 'queued',
    frontend_path: `/sandbox/${systemSlug}`,
    backend_routes: [`/api/sandbox/status?slug=${systemSlug}`],
    supabase_tables: ['ai_invention_requests', 'ai_invention_runs', 'ai_invention_proofs'],
    proof_summary: 'Sandbox request accepted. Build/validation pipeline should create proof records next.',
    risk_notes: 'Sandbox only. No public publishing, no real-money actions, no new repo creation without admin approval.',
    next_ai_action: 'Create or update frontend/backend sandbox artifacts and run validation.',
    next_human_action: 'Review generated proof and approve promotion only after validation.',
    is_public: true,
  };

  const insert = await insertRows('ai_invention_requests', row);
  const run = await insertRows('ai_invention_runs', {
    invention_slug: systemSlug,
    run_type: 'request_created',
    status: insert.error ? 'partial' : 'queued',
    frontend_status: 'planned',
    backend_status: 'planned',
    supabase_status: insert.error ? 'write_unavailable' : 'write_ok',
    vercel_status: 'pending_deployment',
    validation_results: { request: row, insert_error: insert.error || null },
    summary: `Sandbox request queued for ${systemName}.`,
    email_status: 'pending_or_logged',
    is_public: true,
  });

  const reportBody = [
    'AI Invention Factory Sandbox Request',
    '',
    `System: ${systemName}`,
    `Slug: ${systemSlug}`,
    `Prompt: ${buildPrompt}`,
    `Frontend path: /sandbox/${systemSlug}`,
    `Backend status route: /api/sandbox/status?slug=${systemSlug}`,
    '',
    'Current status:',
    `- Supabase write: ${insert.error ? 'unavailable' : 'queued'}`,
    `- Run record: ${run.error ? 'unavailable' : 'queued'}`,
    '',
    'Safety:',
    '- Sandbox only.',
    '- No public publishing without approval.',
    '- No secrets exposed.',
    '- No real-money action.',
  ].join('\n');

  const email = await sendSandboxReport({
    subject: `AI Invention Factory Sandbox Queued — ${systemName}`,
    body: reportBody,
    metadata: { severity: 'low' },
  });

  return response.status(200).json({
    ok: !insert.error,
    mode: insert.error ? 'supabase-write-unavailable' : 'queued',
    request: insert.data?.[0] || row,
    run: run.data?.[0] || null,
    email,
    error: insert.error || null,
  });
}
