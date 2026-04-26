-- Generated sandbox seed for AI Meeting Prep Coach
insert into ai_invention_requests (
  requested_by, system_name, system_slug, build_prompt, target_mode, status,
  frontend_path, backend_routes, supabase_tables, proof_summary, risk_notes,
  next_ai_action, next_human_action, is_public
) values (
  'ai-in-action-generator',
  'AI Meeting Prep Coach',
  'ai-meeting-prep-coach',
  'A sandbox coach that helps a user prepare for a meeting by clarifying purpose, agenda, questions, and follow-up actions.',
  'sandbox',
  'generated',
  '/ai-in-action#ai-meeting-prep-coach',
  '["/api/sandbox/generated?slug=ai-meeting-prep-coach"]'::jsonb,
  '["ai_invention_requests","ai_invention_runs","ai_invention_proofs"]'::jsonb,
  'Prove batch autopilot can generate, deploy, and validate a second generated sandbox route in the same batch.',
  'Sandbox-only until promoted. | No public publishing without approval. | No paid API activation without approval. | No confidential meeting details stored in generated public proof. | No secret values in code, issues, logs, or frontend.',
  'Deploy and validate generated sandbox route.',
  'Review generated proof before promotion.',
  true
)
on conflict (system_slug) do update set
  status = excluded.status,
  proof_summary = excluded.proof_summary,
  next_ai_action = excluded.next_ai_action,
  next_human_action = excluded.next_human_action;
