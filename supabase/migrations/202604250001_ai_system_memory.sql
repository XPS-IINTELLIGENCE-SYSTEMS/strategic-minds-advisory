-- AI in Action Labs system memory schema
-- Purpose: persistent AI state, decision logging, blockers, and repo registry for controlled autonomous work.

create extension if not exists pgcrypto;

create table if not exists public.ai_system_state (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  state_key text not null unique,
  state_title text not null,
  state_value text,
  state_json jsonb not null default '{}'::jsonb,
  visibility text not null default 'public',
  status text not null default 'active',
  is_public boolean not null default true
);

create table if not exists public.ai_memory_snapshots (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  snapshot_type text not null,
  title text not null,
  summary text not null,
  current_objective text,
  last_completed_action text,
  current_blocker text,
  next_human_action text,
  next_ai_action text,
  related_issue_url text,
  related_commit_sha text,
  metadata jsonb not null default '{}'::jsonb,
  is_public boolean not null default true
);

create table if not exists public.ai_decision_log (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  decision_title text not null,
  decision_type text not null,
  context text,
  options_considered jsonb not null default '[]'::jsonb,
  decision text not null,
  rationale text,
  risk_level text not null default 'medium',
  human_approval_required boolean not null default false,
  status text not null default 'active',
  is_public boolean not null default true
);

create table if not exists public.ai_blockers (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  blocker_title text not null,
  blocker_type text not null,
  description text,
  impact text,
  required_human_action text,
  required_ai_action text,
  status text not null default 'open',
  severity text not null default 'medium',
  related_issue_url text,
  is_public boolean not null default true
);

create table if not exists public.ai_repo_registry (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  repo_full_name text not null unique,
  repo_url text,
  classification text not null default 'unknown',
  purpose text,
  ai_use_decision text not null default 'triage_required',
  useful_assets jsonb not null default '[]'::jsonb,
  risks jsonb not null default '[]'::jsonb,
  production_linked boolean not null default false,
  supabase_linked boolean not null default false,
  vercel_linked boolean not null default false,
  status text not null default 'active',
  related_issue_url text,
  is_public boolean not null default true
);

alter table public.ai_system_state enable row level security;
alter table public.ai_memory_snapshots enable row level security;
alter table public.ai_decision_log enable row level security;
alter table public.ai_blockers enable row level security;
alter table public.ai_repo_registry enable row level security;

do $$ begin create policy "public_read_ai_system_state" on public.ai_system_state for select using (is_public = true); exception when duplicate_object then null; end $$;
do $$ begin create policy "public_read_ai_memory_snapshots" on public.ai_memory_snapshots for select using (is_public = true); exception when duplicate_object then null; end $$;
do $$ begin create policy "public_read_ai_decision_log" on public.ai_decision_log for select using (is_public = true); exception when duplicate_object then null; end $$;
do $$ begin create policy "public_read_ai_blockers" on public.ai_blockers for select using (is_public = true); exception when duplicate_object then null; end $$;
do $$ begin create policy "public_read_ai_repo_registry" on public.ai_repo_registry for select using (is_public = true); exception when duplicate_object then null; end $$;

create index if not exists idx_ai_memory_snapshots_created_at on public.ai_memory_snapshots(created_at desc);
create index if not exists idx_ai_decision_log_created_at on public.ai_decision_log(created_at desc);
create index if not exists idx_ai_blockers_status_severity on public.ai_blockers(status, severity);
create index if not exists idx_ai_repo_registry_classification on public.ai_repo_registry(classification, status);

insert into public.ai_system_state (state_key, state_title, state_value, state_json, status)
values
  ('current_objective', 'Current AI Objective', 'Build AI in Action Labs as a controlled autonomous teaching platform with Supabase backend, Vercel dashboard, GitHub issue tracking, source receipts, paper-trading simulation, digital-business simulations, and avatar media workflow.', '{"priority":"highest","human_visible":true}'::jsonb, 'active'),
  ('current_blocker', 'Current Blocker', 'Supabase migrations must be verified before dashboard can switch fully from fallback state to live Supabase data.', '{"blocker_type":"migration_verification","human_action_required":true}'::jsonb, 'active'),
  ('next_human_action', 'Next Human Action', 'Run or verify the GitHub Actions Supabase Database Migrations workflow, then confirm whether tables exist in Supabase.', '{"location":"GitHub Actions","workflow":"Supabase Database Migrations"}'::jsonb, 'active'),
  ('next_ai_action', 'Next AI Action', 'Continue implementing controlled backend and dashboard layers through GitHub commits while tracking all work as issues.', '{"safe_to_continue":true}'::jsonb, 'active'),
  ('operating_rule', 'Operating Rule', 'AI may observe, draft, simulate, build, log, explain, and propose continuously. Humans control secrets, high-risk writes, publishing, and financial-market claims.', '{"governance":"human_in_the_loop"}'::jsonb, 'active')
on conflict (state_key) do update set
  state_title = excluded.state_title,
  state_value = excluded.state_value,
  state_json = excluded.state_json,
  updated_at = now(),
  status = excluded.status;

insert into public.ai_memory_snapshots (
  snapshot_type,
  title,
  summary,
  current_objective,
  last_completed_action,
  current_blocker,
  next_human_action,
  next_ai_action,
  metadata
) values (
  'system_bootstrap',
  'AI in Action system memory initialized',
  'Persistent memory tables were added so the platform can show current objective, decisions, blockers, repo registry, and next actions.',
  'Build a controlled autonomous AI teaching platform for paper trading, business simulations, source receipts, and AI media.',
  'Added AI operating-loop schema, dashboard panel, project board docs, wiki docs, stack triage, and GitHub issue backlog.',
  'Supabase migration verification is still required for live data mode.',
  'Verify GitHub Actions migration workflow and Supabase tables.',
  'Build memory dashboard panel and source receipts route after migration verification.',
  '{"repo":"XPS-IINTELLIGENCE-SYSTEMS/strategic-minds-advisory","phase":"memory_backend"}'::jsonb
) on conflict do nothing;

insert into public.ai_decision_log (decision_title, decision_type, context, options_considered, decision, rationale, risk_level, human_approval_required)
values
  ('Use issues as writable project-board layer', 'architecture', 'GitHub connector exposes issue/PR/repo writes but not direct GitHub Projects v2 card/field writes.', '["Direct Project v2 API writes", "Issues as task ledger", "Manual board only"]'::jsonb, 'Use GitHub issues and PRs as the writable task ledger, with the Project board as the visual command board.', 'This gives AI a reliable write path while preserving project-board visibility.', 'low', false),
  ('Reject wholesale imports of advanced stacks', 'architecture', 'User has many advanced systems, but platform must avoid overcomplication.', '["Wholesale import", "Selective extraction", "Ignore all systems"]'::jsonb, 'Selectively extract only patterns that strengthen controlled AI in Action.', 'Avoids duplicate frameworks, unsafe autonomy, stale dependencies, and secret exposure.', 'medium', false),
  ('Keep paper trading simulation-only', 'compliance', 'The platform teaches wealth-building and trading topics.', '["Real-money trading", "Paper simulation", "Generic market commentary only"]'::jsonb, 'Operate paper-trading simulation only with source receipts and no fake fills.', 'Protects users and preserves educational integrity.', 'high', true)
on conflict do nothing;

insert into public.ai_blockers (blocker_title, blocker_type, description, impact, required_human_action, required_ai_action, status, severity, related_issue_url)
values
  ('Supabase migration verification pending', 'migration', 'The schema files exist in GitHub, but live Supabase table creation must be verified.', 'Dashboard may show fallback data until migrations are applied.', 'Run GitHub Actions Supabase migration workflow and confirm table presence.', 'Inspect workflow logs and repair migration errors if provided.', 'open', 'high', 'https://github.com/XPS-IINTELLIGENCE-SYSTEMS/strategic-minds-advisory/issues/2'),
  ('Direct Project v2 write actions unavailable in current connector', 'tooling', 'The current GitHub connector can write issues and PRs but not edit project board settings/fields directly.', 'AI uses issues as writable tracking layer while Project board visualizes them.', 'Use GitHub UI to auto-add issues or manually add items to Project 1.', 'Continue creating structured issues with labels and bodies.', 'open', 'medium', 'https://github.com/XPS-IINTELLIGENCE-SYSTEMS/strategic-minds-advisory/issues/1')
on conflict do nothing;

insert into public.ai_repo_registry (repo_full_name, repo_url, classification, purpose, ai_use_decision, useful_assets, risks, production_linked, supabase_linked, vercel_linked, related_issue_url)
values
  ('XPS-IINTELLIGENCE-SYSTEMS/strategic-minds-advisory', 'https://github.com/XPS-IINTELLIGENCE-SYSTEMS/strategic-minds-advisory', 'production-linked', 'Primary AI in Action Labs production app, docs, migrations, dashboard, and issue tracker.', 'USE NOW', '["Vite frontend","Vercel deployment","Supabase migrations","AI in Action docs","dashboard panels"]'::jsonb, '["production impact","secrets must remain external","financial education compliance"]'::jsonb, true, true, true, 'https://github.com/XPS-IINTELLIGENCE-SYSTEMS/strategic-minds-advisory/issues/1'),
  ('XPS-IINTELLIGENCE-SYSTEMS/proofloops', 'https://github.com/XPS-IINTELLIGENCE-SYSTEMS/proofloops', 'template-source', 'Template-rich Base44-origin app containing useful UI and workflow patterns.', 'REFERENCE ONLY / SELECTIVE EXTRACTION', '["automation builder","prompt library","source library","data explorer","content studio"]'::jsonb, '["Base44 lock-in","duplicate framework risk","stale dependency risk"]'::jsonb, false, false, false, null)
on conflict (repo_full_name) do update set
  repo_url = excluded.repo_url,
  classification = excluded.classification,
  purpose = excluded.purpose,
  ai_use_decision = excluded.ai_use_decision,
  useful_assets = excluded.useful_assets,
  risks = excluded.risks,
  production_linked = excluded.production_linked,
  supabase_linked = excluded.supabase_linked,
  vercel_linked = excluded.vercel_linked,
  status = excluded.status,
  related_issue_url = excluded.related_issue_url;
