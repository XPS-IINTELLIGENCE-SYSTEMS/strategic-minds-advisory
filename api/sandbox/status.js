import { selectRows } from '../_lib/supabaseAdmin.js';

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
    selectRows('ai_invention_requests', [fallback.request], { order: { column: 'created_at', ascending: false }, limit: 25 }),
    selectRows('ai_invention_runs', [], { eq: ['invention_slug', slug], order: { column: 'created_at', ascending: false }, limit: 10 }),
    selectRows('ai_invention_proofs', [], { eq: ['invention_slug', slug], order: { column: 'created_at', ascending: false }, limit: 10 }),
  ]);

  const requestRow = (requests.data || []).find((item) => item.system_slug === slug) || requests.data?.[0] || fallback.request;

  return response.status(200).json({
    ok: requests.mode === 'live',
    mode: requests.mode === 'live' ? 'live' : 'fallback',
    request: requestRow,
    runs: runs.data || [],
    proofs: proofs.data || [],
    errors: [requests.error, runs.error, proofs.error].filter(Boolean),
    timestamp: new Date().toISOString(),
  });
}
