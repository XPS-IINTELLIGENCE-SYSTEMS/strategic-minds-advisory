import { fetchWatchlistPrices } from '../_lib/marketSources.js';
import { generateGroqText } from '../_lib/groqClient.js';
import { insertRows } from '../_lib/supabaseAdmin.js';

function authorized(request) {
  const expected = process.env.CRON_SECRET;
  if (!expected) return { ok: true, mode: 'unprotected-no-cron-secret' };
  const header = request.headers['x-cron-secret'] || request.headers.authorization;
  const token = String(header || '').replace(/^Bearer\s+/i, '');
  return { ok: token === expected, mode: 'protected' };
}

function buildEducationalPrompt(priceChecks) {
  return `Create an educational paper-trading market-check summary. Use only these source-check results. Do not invent prices, trades, fills, entries, exits, or results. If prices are unavailable, say so directly.\n\n${JSON.stringify(priceChecks, null, 2)}\n\nInclude: timestamp, exact prices checked, unavailable prices, risk posture, no-trade rule, market thesis, what AI did, how AI did it, why it matters, loss-prevention lesson, wealth-building lesson, top 5 tips, top 5 don'ts. Keep it concise.`;
}

export default async function handler(request, response) {
  const auth = authorized(request);
  if (!auth.ok) {
    return response.status(401).json({ ok: false, error: 'Unauthorized cron request.' });
  }

  const startedAt = new Date().toISOString();
  const priceChecks = await fetchWatchlistPrices();

  const assetRows = priceChecks.map((item) => ({
    symbol: item.symbol,
    asset_name: item.asset_name,
    exact_price: item.exact_price,
    price_text: item.price_text,
    source_name: item.source_name,
    source_url: item.source_url,
    checked_at: startedAt,
    verification_status: item.verification_status,
    notes: item.notes,
    is_public: true,
  }));

  const assetInsert = await insertRows('asset_price_checks', assetRows);

  const sourceReceiptRows = priceChecks.map((item) => ({
    lab_slug: 'paper-trading-lab',
    source_type: item.symbol === 'BTC' || item.symbol === 'ETH' ? 'crypto_price_api' : 'market_price_api',
    title: `${item.symbol} price check`,
    url: item.source_url || 'unavailable',
    retrieved_at: startedAt,
    verification_status: item.verification_status,
    robots_status: 'api_or_not_applicable',
    rate_limit_status: 'not_measured',
    quote_text: item.price_text,
    notes: item.notes,
    is_public: true,
  }));

  const receiptInsert = await insertRows('ai_source_receipts', sourceReceiptRows);

  const groq = await generateGroqText({
    system: 'You are an educational paper-trading narrator and risk manager. You never provide personalized financial advice, never guarantee results, and never fabricate prices, fills, or performance.',
    user: buildEducationalPrompt(priceChecks),
  });

  const verifiedCount = priceChecks.filter((item) => item.verification_status === 'verified').length;
  const summary = groq.text || `Market check completed. Verified prices: ${verifiedCount}/${priceChecks.length}. Groq summary unavailable: ${groq.error || 'unknown error'}.`;

  const runInsert = await insertRows('ai_schedule_runs', {
    lab_slug: 'paper-trading-lab',
    run_type: 'market-check',
    status: assetInsert.error || receiptInsert.error ? 'partial' : 'completed',
    started_at: startedAt,
    completed_at: new Date().toISOString(),
    summary,
    result: {
      prices: priceChecks,
      groq_model: groq.model,
      groq_error: groq.error,
      supabase_asset_insert_error: assetInsert.error,
      supabase_receipt_insert_error: receiptInsert.error,
      auth_mode: auth.mode,
    },
    error_message: assetInsert.error || receiptInsert.error || groq.error || null,
    is_public: true,
  });

  return response.status(200).json({
    ok: true,
    started_at: startedAt,
    verified_count: verifiedCount,
    total_count: priceChecks.length,
    prices: priceChecks,
    summary,
    errors: {
      asset_insert: assetInsert.error,
      receipt_insert: receiptInsert.error,
      run_insert: runInsert.error,
      groq: groq.error,
    },
  });
}
