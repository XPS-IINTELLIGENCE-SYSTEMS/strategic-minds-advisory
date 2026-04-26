import { safeSelect } from '../../src/lib/supabaseClient.js';

const fallback = {
  request: {
    system_name: 'AI Invention Factory Sandbox',
    system_slug: 'ai-invention-factory-sandbox',
    status: 'fallback',
    frontend_path: '/ai-in-action',
    proof_summary: 'Fallback status. Supabase live read unavailable in this runtime.',
  },
  runs: [],
  proofs: [],
};

export default async function handler(request, response) {
  const slug = String(request.query?.slug || 'ai-invention-factory-sandbox');
  const [requests, runs, proofs] = await Promise.all([
    safeSelect('ai_invention_requests', [fallback.request]),
    safeSelect('ai_invention_runs', []),
    safeSelect('ai_invention_proofs', []),
  ]);

  const requestRow = (requests.data || []).find((item) => item.system_slug === slug) || requests.data?.[0] || fallback.request;
  const filteredRuns = (runs.data || []).filter((item) => item.invention_slug === slug).slice(0, 10);
  const filteredProofs = (proofs.data || []).filter((item) => item.invention_slug === slug).slice(0, 10);

  return response.status(200).json({
    ok: requests.mode === 'live',
    mode: requests.mode === 'live' ? 'live' : 'fallback',
    request: requestRow,
    runs: filteredRuns,
    proofs: filteredProofs,
    errors: [requests.error, runs.error, proofs.error].filter(Boolean),
    timestamp: new Date().toISOString(),
  });
}
