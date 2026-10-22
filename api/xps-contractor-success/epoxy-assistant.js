import { randomUUID } from 'node:crypto';
import { insertRows } from '../_lib/supabaseAdmin.js';
import { asString } from '../_lib/validators.js';

const SYSTEM_PROMPT = `You are the XPS Epoxy AI Assistant for XPS Contractor Success.

Your job is to help flooring contractors and customers understand epoxy flooring systems, decorative concrete coatings, surface preparation, maintenance, sales conversations, troubleshooting paths, and next-step planning.

You are not a replacement for Xtreme Polishing Systems technical support, product technical data sheets, safety data sheets, manufacturer instructions, local codes, jobsite testing, or professional onsite judgment.

Always ask clarifying questions when jobsite conditions matter.

Never guarantee product performance, adhesion, cure times, warranty coverage, lead generation, certification, discounts, or job outcomes.

When discussing product use, remind the user to verify with the current product TDS/SDS and XPS technical support.

For moisture, structural cracks, contamination, coating failure, safety, or chemical exposure, recommend onsite inspection, testing, and manufacturer guidance.

Prefer practical contractor language. Give checklists, scripts, decision trees, and next steps.

Always route users toward Xtreme Polishing Systems for materials and product resources, XPS Xpress for ordering/support pathways, Concrete Polishing University for training, and XPS Contractor Success for business systems and customer-facing tools.`;

const providerConfigs = [
  ['vercel_gateway', 'AI_GATEWAY_API_KEY', 'AI_GATEWAY_BASE_URL', 'AI_GATEWAY_MODEL', 'https://ai-gateway.vercel.sh/v1', 'openai/gpt-4.1-mini'],
  ['groq', 'GROQ_API_KEY', 'GROQ_BASE_URL', 'GROQ_MODEL', 'https://api.groq.com/openai/v1', 'llama-3.3-70b-versatile'],
  ['openai', 'OPENAI_API_KEY', 'OPENAI_BASE_URL', 'OPENAI_MODEL', 'https://api.openai.com/v1', 'gpt-4.1-mini'],
];

function methodNotAllowed(res) { res.setHeader('Allow', 'POST'); return res.status(405).json({ ok:false, error:'Method not allowed.' }); }
function clean(value, limit = 6000) { return asString(value).trim().slice(0, limit); }
function classifyRisk(message) { const text = message.toLowerCase(); if (/(peel|failure|moisture|wet|contamination|chemical|crack|structural|warranty|cure|delamination|safety)/.test(text)) return 'high'; if (/(recommend|system|prep|primer|topcoat|flake|quartz|metallic|polyaspartic|garage)/.test(text)) return 'medium'; return 'low'; }
function leadSignal(message) { const text = message.toLowerCase(); if (/training/.test(text)) return 'training'; if (/discount/.test(text)) return 'contractor_discounts'; if (/lead/.test(text)) return 'lead_opportunities'; if (/brand|planner/.test(text)) return 'branded_planner'; if (/peel|failure|moisture|troubleshoot/.test(text)) return 'troubleshooting'; if (/quote|sales|expensive|follow/.test(text)) return 'sales_help'; if (/maintain|clean/.test(text)) return 'maintenance'; if (/product|material|order/.test(text)) return 'product_support'; return 'general'; }

function fallbackAnswer(message, riskLevel) {
  const highRisk = riskLevel === 'high' ? '\n\nBecause this may involve jobsite risk, coating failure, moisture, contamination, cure, safety, or warranty-sensitive conditions: collect photos, document prep, check temperature/humidity, verify the current product TDS/SDS, and contact XPS technical support before making final decisions.' : '';
  return `I can help you structure the epoxy planning conversation, but live AI model routing is not configured yet.\n\nPractical next step:\n1. Confirm the project type, substrate, traffic, exposure, timeline, and customer expectations.\n2. Identify whether the project is best suited for solid epoxy, flake epoxy, metallic epoxy, quartz epoxy, or a polyaspartic/topcoat pathway.\n3. Verify prep profile, moisture risk, primer needs, and topcoat requirements against current XPS product documentation.\n4. Use Xtreme Polishing Systems, XPS Xpress, and Concrete Polishing University resources for materials, ordering, and training support.\n\nUser question: ${message}${highRisk}`;
}

async function callConfiguredProvider({ message, mode, riskLevel, plannerContext, troubleshootingContext }) {
  for (const [name, keyName, baseName, modelName, defaultBase, defaultModel] of providerConfigs) {
    const apiKey = process.env[keyName];
    if (!apiKey) continue;
    const baseUrl = process.env[baseName] || defaultBase;
    const model = process.env[modelName] || defaultModel;
    const body = { model, temperature: 0.2, messages: [{ role: 'system', content: SYSTEM_PROMPT }, { role: 'user', content: JSON.stringify({ mode, riskLevel, message, plannerContext, troubleshootingContext }) }] };
    const response = await fetch(`${baseUrl.replace(/\/$/, '')}/chat/completions`, { method: 'POST', headers: { authorization: `Bearer ${apiKey}`, 'content-type': 'application/json' }, body: JSON.stringify(body) });
    const data = await response.json().catch(async () => ({ raw: await response.text() }));
    if (!response.ok) throw new Error(`${name}_failed:${data?.error?.message || response.status}`);
    const answer = data?.choices?.[0]?.message?.content;
    if (answer) return { answer, providerStatus: `${name}:${model}` };
  }
  return null;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return methodNotAllowed(res);
  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : req.body || {};
    const message = clean(body.message, 3000);
    if (!message) return res.status(400).json({ ok:false, error:'Message is required.' });
    const mode = clean(body.mode || 'Contractor Mode', 100);
    const risk_level = classifyRisk(message);
    const lead_signal = leadSignal(message);
    const session_id = clean(body.session_id, 100) || randomUUID();
    let provider_status = 'fallback:no_provider_configured';
    let answer = fallbackAnswer(message, risk_level);
    try {
      const provider = await callConfiguredProvider({ message, mode, riskLevel: risk_level, plannerContext: body.planner_context || {}, troubleshootingContext: body.troubleshooting_context || {} });
      if (provider) { answer = provider.answer; provider_status = provider.providerStatus; }
    } catch (providerError) {
      provider_status = `fallback:${providerError.message}`.slice(0, 500);
    }

    const sessionInsert = await insertRows('xps_epoxy_ai_sessions', { id: session_id, session_type: 'epoxy_floor_planner', lead_source: 'xps_epoxy_floor_planner', metadata: { mode } });
    const savedSession = !sessionInsert.error;
    const messagesInsert = await insertRows('xps_epoxy_ai_messages', [
      { session_id, role: 'user', content: message, mode, risk_level, lead_signal, provider_status, metadata: body.troubleshooting_context || {} },
      { session_id, role: 'assistant', content: answer, mode, risk_level, lead_signal, provider_status, metadata: body.planner_context || {} },
    ]);

    return res.status(200).json({ ok:true, answer, session_id, mode, risk_level, lead_signal, provider_status, saved: savedSession && !messagesInsert.error });
  } catch (error) {
    return res.status(500).json({ ok:false, error: error.message || 'Unexpected server error.' });
  }
}
