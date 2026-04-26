-- Generated sandbox seed for AI Habit Drill Coach
insert into ai_invention_requests (
  requested_by, system_name, system_slug, build_prompt, target_mode, status,
  frontend_path, backend_routes, supabase_tables, proof_summary, risk_notes,
  next_ai_action, next_human_action, is_public
) values (
  'ai-in-action-generator',
  'AI Habit Drill Coach',
  'ai-habit-drill-coach',
  'A safe generated sandbox coach that teaches users how to build one repeatable daily skill habit with a tiny practice loop, checklist, and validation route.',
  'sandbox',
  'generated',
  '/ai-in-action#ai-habit-drill-coach',
  array['/api/sandbox/generated/ai-habit-drill-coach'],
  array['ai_invention_requests','ai_invention_runs','ai_invention_proofs'],
  'Prove the AI Invention Factory Generator can create a second sandbox invention package, deploy it, and validate the generated API route.',
  'Sandbox-only until promoted. | No public publishing without approval. | No paid API activation without approval. | No medical, legal, financial, or real-money claims. | No secret values in code, issues, logs, or frontend.',
  'Deploy and validate generated sandbox route.',
  'Review generated proof before promotion.',
  true
)
on conflict (system_slug) do update set
  status = excluded.status,
  proof_summary = excluded.proof_summary,
  next_ai_action = excluded.next_ai_action,
  next_human_action = excluded.next_human_action;
