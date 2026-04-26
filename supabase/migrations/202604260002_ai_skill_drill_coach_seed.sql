-- AI Skill Drill Coach first sandbox proof seed

insert into public.ai_invention_requests (
  requested_by,
  system_name,
  system_slug,
  build_prompt,
  target_mode,
  status,
  frontend_path,
  backend_routes,
  github_issue_url,
  supabase_tables,
  proof_summary,
  risk_notes,
  next_ai_action,
  next_human_action,
  is_public
) values (
  'jeremy-benson',
  'AI Skill Drill Coach',
  'ai-skill-drill-coach',
  'Create an AI skill drill coach that teaches practical prompt engineering for small business automation with a frontend lesson panel, backend status route, Supabase proof records, and validation report.',
  'sandbox',
  'building',
  '/ai-in-action#ai-skill-drill-coach',
  '["/api/sandbox/skill-drill-coach", "/api/sandbox/status?slug=ai-skill-drill-coach"]'::jsonb,
  'https://github.com/XPS-IINTELLIGENCE-SYSTEMS/strategic-minds-advisory/issues/26',
  '["ai_invention_requests", "ai_invention_runs", "ai_invention_proofs"]'::jsonb,
  'First real sandbox invention request accepted. Frontend and backend proof implementation is in progress.',
  'Sandbox-only educational system. No public publishing, no paid API activation, no secret exposure.',
  'Implement frontend lesson panel, backend route, proof records, and validation report.',
  'Review proof after validation and decide whether to promote to a reusable invention-factory template.',
  true
) on conflict (system_slug) do update set
  status = excluded.status,
  frontend_path = excluded.frontend_path,
  backend_routes = excluded.backend_routes,
  github_issue_url = excluded.github_issue_url,
  proof_summary = excluded.proof_summary,
  risk_notes = excluded.risk_notes,
  next_ai_action = excluded.next_ai_action,
  next_human_action = excluded.next_human_action;

insert into public.ai_invention_runs (
  invention_slug,
  run_type,
  status,
  frontend_status,
  backend_status,
  supabase_status,
  vercel_status,
  validation_results,
  email_status,
  github_run_url,
  summary,
  is_public
) values (
  'ai-skill-drill-coach',
  'first_sandbox_build',
  'building',
  'panel_committed_pending_deploy',
  'route_committed_pending_deploy',
  'seed_records_committed_pending_migration',
  'pending_deploy_validation',
  '{"lesson":"Practical prompt engineering for small business automation","proof_issue":26,"intake_issue":27,"pipeline_issue":28}'::jsonb,
  'pending_or_logged',
  'https://github.com/XPS-IINTELLIGENCE-SYSTEMS/strategic-minds-advisory/actions/runs/24945406992',
  'First sandbox build package created for AI Skill Drill Coach.',
  true
);

insert into public.ai_invention_proofs (
  invention_slug,
  proof_type,
  title,
  url,
  status,
  evidence,
  notes,
  is_public
) values
(
  'ai-skill-drill-coach',
  'github_issue',
  'Sandbox work package created',
  'https://github.com/XPS-IINTELLIGENCE-SYSTEMS/strategic-minds-advisory/issues/26',
  'verified',
  '{"issue_number":26,"type":"sandbox_request"}'::jsonb,
  'GitHub issue #26 contains the structured sandbox request and proof checklist.',
  true
),
(
  'ai-skill-drill-coach',
  'intake_report',
  'Invention intake completed',
  'https://github.com/XPS-IINTELLIGENCE-SYSTEMS/strategic-minds-advisory/issues/27',
  'verified',
  '{"issue_number":27,"type":"intake_visibility"}'::jsonb,
  'GitHub issue #27 confirms the invention intake workflow completed.',
  true
),
(
  'ai-skill-drill-coach',
  'validation_pipeline',
  'Next pipeline dispatched',
  'https://github.com/XPS-IINTELLIGENCE-SYSTEMS/strategic-minds-advisory/issues/28',
  'verified',
  '{"issue_number":28,"type":"pipeline_report"}'::jsonb,
  'GitHub issue #28 confirms the next validation pipeline was dispatched.',
  true
);
