import { insertRows } from '../_lib/supabaseAdmin.js';
import { asBoolean, asString } from '../_lib/validators.js';

function methodNotAllowed(response) {
  response.setHeader('Allow', 'POST');
  response.status(405).json({ ok: false, error: 'Method not allowed.' });
}

function asArray(value) {
  if (!Array.isArray(value)) return [];
  return value.map((item) => asString(item).trim()).filter(Boolean).slice(0, 50);
}

function normalizeEmail(value) {
  return asString(value).trim().toLowerCase().slice(0, 254);
}

function required(value, label) {
  if (!value || String(value).trim().length === 0) return `${label} is required.`;
  return null;
}

function scoreLead(row) {
  let score = 0;
  if (row.wants_branded_planner === 'Yes') score += 3;
  if (row.interested_in_discounts === 'Yes') score += 2;
  if (row.interested_in_training === 'Yes') score += 2;
  if (row.interested_in_lead_opportunities === 'Yes') score += 2;
  if (row.currently_buys_from_xps === 'Yes') score += 3;
  if (row.systems_offered.includes('Polished Concrete')) score += 1;
  if (row.systems_offered.some((item) => item.includes('Epoxy'))) score += 1;
  if (row.primary_work_type.includes('Commercial')) score += 2;
  if (row.primary_work_type.includes('Government / Public Sector')) score += 2;
  if (['3–5 years', '5–10 years', '10+ years'].includes(row.years_in_business)) score += 1;
  if (row.website_or_social) score += 1;
  return score;
}

function scoreLabel(score) {
  if (score >= 11) return 'priority';
  if (score >= 7) return 'hot';
  if (score >= 4) return 'warm';
  return 'cold';
}

export default async function handler(request, response) {
  if (request.method !== 'POST') return methodNotAllowed(response);

  try {
    const body = typeof request.body === 'string' ? JSON.parse(request.body || '{}') : request.body || {};
    const consent = asBoolean(body.consent, false);
    if (!consent) return response.status(400).json({ ok: false, error: 'Consent is required.' });

    const row = {
      first_name: asString(body.first_name).trim(),
      last_name: asString(body.last_name).trim(),
      company_name: asString(body.company_name).trim(),
      phone: asString(body.phone).trim(),
      email: normalizeEmail(body.email),
      website_or_social: asString(body.website_or_social).trim(),
      city: asString(body.city).trim(),
      state: asString(body.state).trim(),
      service_area: asString(body.service_area).trim(),
      years_in_business: asString(body.years_in_business).trim(),
      primary_work_type: asArray(body.primary_work_type),
      currently_buys_from_xps: asString(body.currently_buys_from_xps).trim(),
      interested_in_discounts: asString(body.interested_in_discounts).trim(),
      interested_in_training: asString(body.interested_in_training).trim(),
      interested_in_lead_opportunities: asString(body.interested_in_lead_opportunities).trim(),
      wants_branded_planner: asString(body.wants_branded_planner).trim(),
      systems_offered: asArray(body.systems_offered),
      biggest_challenge: asString(body.biggest_challenge).trim(),
      consent: true,
      lead_source: asString(body.lead_source, 'xps_contractor_success_landing_page'),
      page_path: asString(body.page_path, '/xps-contractor-success-flooring-planner'),
      referrer: asString(body.referrer),
      lead_status: 'new_lead',
      submitted_at: new Date().toISOString(),
    };

    const requiredErrors = [
      required(row.first_name, 'First name'),
      required(row.last_name, 'Last name'),
      required(row.company_name, 'Company name'),
      required(row.phone, 'Phone'),
      required(row.email, 'Email'),
      required(row.city, 'City'),
      required(row.state, 'State'),
      required(row.years_in_business, 'Years in business'),
      required(row.currently_buys_from_xps, 'XPS buying status'),
      required(row.interested_in_discounts, 'Discount interest'),
      required(row.interested_in_training, 'Training interest'),
      required(row.interested_in_lead_opportunities, 'Lead opportunity interest'),
      required(row.wants_branded_planner, 'Branded planner interest'),
      required(row.biggest_challenge, 'Biggest challenge'),
    ].filter(Boolean);

    if (row.primary_work_type.length === 0) requiredErrors.push('Primary work type is required.');
    if (row.systems_offered.length === 0) requiredErrors.push('Systems offered is required.');

    if (requiredErrors.length > 0) {
      return response.status(400).json({ ok: false, error: requiredErrors[0], errors: requiredErrors });
    }

    row.priority_score = scoreLead(row);
    row.priority_label = scoreLabel(row.priority_score);

    const insert = await insertRows('xps_contractor_success_leads', row);
    if (insert.error) {
      return response.status(200).json({
        ok: false,
        mode: 'supabase-write-unavailable',
        error: insert.error,
        attempted_lead: {
          ...row,
          email: row.email ? '[redacted]' : '',
          phone: row.phone ? '[redacted]' : '',
        },
      });
    }

    return response.status(200).json({
      ok: true,
      mode: 'live',
      lead_status: row.lead_status,
      priority_score: row.priority_score,
      priority_label: row.priority_label,
    });
  } catch (error) {
    return response.status(500).json({ ok: false, error: error.message || 'Unexpected server error.' });
  }
}
