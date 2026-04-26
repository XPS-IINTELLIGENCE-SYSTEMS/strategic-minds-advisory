-- Generated sandbox seed for AI Opportunity Radar
insert into ai_invention_requests (
  requested_by, system_name, system_slug, build_prompt, target_mode, status,
  frontend_path, backend_routes, supabase_tables, proof_summary, risk_notes,
  next_ai_action, next_human_action, is_public
) values (
  'ai-in-action-generator',
  'AI Opportunity Radar',
  'ai-opportunity-radar',
  'A sandbox radar that explains how AI scans trends, pain points, and low-cost build paths to identify useful money-making opportunities.',
  'sandbox',
  'generated',
  '/ai-in-action#ai-opportunity-radar',
  '["/api/sandbox/generated?slug=ai-opportunity-radar"]'::jsonb,
  '["ai_invention_requests","ai_invention_runs","ai_invention_proofs"]'::jsonb,
  'Prove the profit operating system can generate an opportunity-analysis invention through the shared dynamic generated route.',
  'Sandbox-only until promoted. | No public publishing without approval. | No paid API activation without approval. | No secrets in code, issues, logs, or frontend.',
  'Deploy and validate generated sandbox route through shared dynamic API.',
  'Review generated proof before promotion.',
  true
)
on conflict (system_slug) do update set
  status = excluded.status,
  proof_summary = excluded.proof_summary,
  next_ai_action = excluded.next_ai_action,
  next_human_action = excluded.next_human_action;
