import { insertRows } from '../_lib/supabaseAdmin.js';
import { asBoolean, asString } from '../_lib/validators.js';

function methodNotAllowed(res) { res.setHeader('Allow', 'POST'); return res.status(405).json({ ok:false, error:'Method not allowed.' }); }
function clean(value) { return asString(value).trim().slice(0, 2000); }
function score(row) { let n = 0; if (row.wants_follow_up) n += 2; if (row.interest_area === 'Technical troubleshooting') n += 3; if (row.interest_area === 'Product support') n += 2; if (row.interest_area === 'Training') n += 2; if (row.interest_area === 'Contractor discounts') n += 2; if (row.interest_area === 'Lead opportunities') n += 2; if (row.interest_area === 'Branded planner') n += 2; if (row.interest_area === 'Sales help') n += 1; if (row.email) n += 1; if (row.phone) n += 1; if (row.company_name) n += 1; return n; }

export default async function handler(req, res) {
  if (req.method !== 'POST') return methodNotAllowed(res);
  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : req.body || {};
    const consent = asBoolean(body.consent, false);
    if (!consent) return res.status(400).json({ ok:false, error:'Consent is required.' });
    const row = { name: clean(body.name), company_name: clean(body.company_name), email: clean(body.email).toLowerCase(), phone: clean(body.phone), state: clean(body.state), work_type: clean(body.work_type), interest_area: clean(body.interest_area), wants_follow_up: asBoolean(body.wants_follow_up, false), consent: true, notes: clean(body.notes), metadata: { source: 'xps_epoxy_floor_planner' } };
    row.priority_score = score(row);
    const insert = await insertRows('xps_epoxy_leads', row);
    if (insert.error) return res.status(200).json({ ok:false, mode:'supabase-write-unavailable', error: insert.error });
    return res.status(200).json({ ok:true, saved:true, priority_score: row.priority_score, mode: insert.mode });
  } catch (error) {
    return res.status(500).json({ ok:false, error: error.message || 'Unexpected server error.' });
  }
}
