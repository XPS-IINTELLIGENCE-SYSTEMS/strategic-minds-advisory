import { insertRows } from './_lib/supabaseAdmin.js';
import { asBoolean, asString, validatePublicUrl } from './_lib/validators.js';

function methodNotAllowed(response) {
  response.setHeader('Allow', 'GET, POST');
  response.status(405).json({ ok: false, error: 'Method not allowed.' });
}

function fallbackReceipt() {
  return {
    id: 'fallback-source-receipt',
    lab_slug: 'paper-trading-lab',
    source_type: 'system_fallback',
    title: 'Source Receipts Engine pending Supabase configuration',
    url: 'https://github.com/XPS-IINTELLIGENCE-SYSTEMS/strategic-minds-advisory',
    retrieved_at: new Date().toISOString(),
    verification_status: 'fallback',
    robots_status: 'not_checked',
    rate_limit_status: 'not_checked',
    quote_text: 'Supabase write/read configuration is required for live source receipts.',
    notes: 'Fallback data only. No proof is being claimed.',
    is_public: true,
  };
}

export default async function handler(request, response) {
  if (request.method === 'GET') {
    return response.status(200).json({ ok: true, mode: 'fallback-info', receipts: [fallbackReceipt()] });
  }

  if (request.method !== 'POST') return methodNotAllowed(response);

  const body = typeof request.body === 'string' ? JSON.parse(request.body || '{}') : request.body || {};
  const urlCheck = validatePublicUrl(body.url);
  if (!urlCheck.ok) return response.status(400).json({ ok: false, error: urlCheck.error });

  const row = {
    lab_slug: asString(body.lab_slug, 'digital-business-builder'),
    source_type: asString(body.source_type, 'manual_source'),
    title: asString(body.title, 'Untitled source receipt'),
    url: urlCheck.url,
    retrieved_at: body.retrieved_at || new Date().toISOString(),
    verification_status: asString(body.verification_status, 'pending'),
    robots_status: asString(body.robots_status, 'unknown'),
    rate_limit_status: asString(body.rate_limit_status, 'unknown'),
    snapshot_url: body.snapshot_url ? asString(body.snapshot_url) : null,
    quote_text: asString(body.quote_text),
    notes: asString(body.notes, 'Source metadata logged. No credential harvesting or aggressive scraping performed.'),
    is_public: asBoolean(body.is_public, true),
  };

  const insert = await insertRows('ai_source_receipts', row);
  if (insert.error) {
    return response.status(200).json({ ok: false, mode: 'supabase-write-unavailable', error: insert.error, attempted_receipt: row });
  }

  return response.status(200).json({ ok: true, mode: 'live', receipt: insert.data?.[0] || row });
}
