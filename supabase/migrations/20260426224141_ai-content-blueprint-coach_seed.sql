-- Generated sandbox seed for AI Content Blueprint Coach
insert into ai_invention_requests (
  requested_by, system_name, system_slug, build_prompt, target_mode, status,
  frontend_path, backend_routes, supabase_tables, proof_summary, risk_notes,
  next_ai_action, next_human_action, is_public
) values (
  'ai-in-action-generator',
  'AI Content Blueprint Coach',
  'ai-content-blueprint-coach',
  'A sandbox coach that turns a validated system into a short video hook, lesson outline, thumbnail idea, and blueprint offer.',
  'sandbox',
  'generated',
  '/ai-in-action#ai-content-blueprint-coach',
  '["/api/sandbox/generated?slug=ai-content-blueprint-coach"]'::jsonb,
  '["ai_invention_requests","ai_invention_runs","ai_invention_proofs"]'::jsonb,
  'Prove the profit operating system can generate content strategy inventions through the shared dynamic generated route.',
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
