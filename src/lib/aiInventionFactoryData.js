import { safeSelect } from '@/lib/supabaseClient';

const fallbackRequests = [
  {
    system_name: 'AI Invention Factory Sandbox',
    system_slug: 'ai-invention-factory-sandbox',
    status: 'fallback',
    frontend_path: '/ai-in-action',
    proof_summary: 'Fallback status until Supabase live reads are available.',
    next_ai_action: 'Validate sandbox APIs and live dashboard mode.',
    next_human_action: 'Add email provider key only if real email delivery is required.',
  },
];

const fallbackRuns = [
  {
    invention_slug: 'ai-invention-factory-sandbox',
    run_type: 'fallback_status',
    status: 'pending_validation',
    frontend_status: 'wired_in_repo',
    backend_status: 'routes_created',
    supabase_status: 'migration_required_or_pending_deploy',
    vercel_status: 'pending_runtime_validation',
    email_status: 'logged_or_not_configured',
    summary: 'Sandbox system has been created in repo and needs deployed runtime validation.',
  },
];

const fallbackProofs = [
  {
    invention_slug: 'ai-invention-factory-sandbox',
    proof_type: 'repo_commit',
    title: 'Sandbox schema, APIs, dashboard, and workflows committed',
    status: 'repo_proof',
    notes: 'Live Vercel/Supabase proof is the next validation step.',
  },
];

export async function loadAIInventionFactoryData() {
  const [requests, runs, proofs] = await Promise.all([
    safeSelect('ai_invention_requests', fallbackRequests),
    safeSelect('ai_invention_runs', fallbackRuns),
    safeSelect('ai_invention_proofs', fallbackProofs),
  ]);

  const results = [requests, runs, proofs];
  return {
    mode: results.some((r) => r.mode === 'live') ? 'live' : 'fallback',
    requests: requests.data?.length ? requests.data : fallbackRequests,
    runs: runs.data?.length ? runs.data : fallbackRuns,
    proofs: proofs.data?.length ? proofs.data : fallbackProofs,
    errors: results.map((r) => r.error).filter(Boolean),
  };
}
