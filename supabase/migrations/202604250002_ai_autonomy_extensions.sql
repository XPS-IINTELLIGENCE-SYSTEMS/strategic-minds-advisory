-- AI in Action Labs autonomy extension schema
-- Adds agents, tool intelligence, discovery, lifecycle, notifications, and admin reviews.

create extension if not exists pgcrypto;

create table if not exists public.ai_agent_registry (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  name text not null unique,
  role text not null,
  capabilities jsonb not null default '[]'::jsonb,
  allowed_actions jsonb not null default '[]'::jsonb,
  restricted_actions jsonb not null default '[]'::jsonb,
  status text not null default 'ready',
  risk_level text not null default 'medium',
  last_run_at timestamptz,
  next_run_at timestamptz,
  is_public boolean not null default true
);

create table if not exists public.ai_agent_runs (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  agent_name text references public.ai_agent_registry(name) on update cascade on delete set null,
  run_type text not null,
  objective text not null,
  status text not null default 'queued',
  summary text,
  result jsonb not null default '{}'::jsonb,
  error_message text,
  started_at timestamptz,
  completed_at timestamptz,
  is_public boolean not null default true
);

create table if not exists public.ai_tool_registry (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  tool_name text not null,
  category text not null,
  use_case text,
  cost_notes text,
  integration_status text not null default 'watching',
  verification_status text not null default 'needs_verification',
  recommendation_status text not null default 'candidate',
  source_links jsonb not null default '[]'::jsonb,
  is_public boolean not null default true,
  unique(tool_name, category)
);

create table if not exists public.ai_tool_evaluations (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  tool_name text not null,
  evaluation_title text not null,
  score numeric,
  strengths jsonb not null default '[]'::jsonb,
  risks jsonb not null default '[]'::jsonb,
  cost_notes text,
  source_links jsonb not null default '[]'::jsonb,
  verified_at timestamptz,
  status text not null default 'draft',
  is_public boolean not null default true
);

create table if not exists public.ai_discovery_runs (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  topic text not null,
  objective text not null,
  status text not null default 'queued',
  confidence numeric,
  strategy_angle text,
  safety_notes text,
  source_receipts jsonb not null default '[]'::jsonb,
  next_action text,
  is_public boolean not null default true
);

create table if not exists public.ai_trend_signals (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  topic text not null,
  topic_family text not null,
  source_name text,
  source_url text,
  confidence numeric not null default 50,
  signal_summary text,
  strategy_angle text,
  safety_notes text,
  last_checked_at timestamptz,
  status text not null default 'watching',
  is_public boolean not null default true
);

create table if not exists public.ai_lab_lifecycle (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  lab_slug text references public.ai_labs(slug) on update cascade on delete set null,
  lifecycle_state text not null default 'idea',
  validation_status text not null default 'not_started',
  blocker text,
  next_ai_action text,
  next_human_action text,
  status text not null default 'active',
  is_public boolean not null default true
);

create table if not exists public.ai_validation_checks (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  lab_slug text references public.ai_labs(slug) on update cascade on delete set null,
  check_name text not null,
  check_type text not null,
  status text not null default 'pending',
  result_summary text,
  evidence jsonb not null default '[]'::jsonb,
  required_for_publish boolean not null default false,
  is_public boolean not null default true
);

create table if not exists public.ai_notifications (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  title text not null,
  message text not null,
  severity text not null default 'medium',
  notification_type text not null,
  channel text not null default 'supabase_log',
  status text not null default 'queued',
  related_issue_url text,
  related_run_id uuid,
  requires_admin_action boolean not null default false,
  is_public boolean not null default false
);

create table if not exists public.ai_admin_reviews (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  review_title text not null,
  item_type text not null,
  item_id uuid,
  risk_level text not null default 'medium',
  status text not null default 'pending',
  reason text not null,
  required_admin_action text,
  related_issue_url text,
  decision_notes text,
  decided_at timestamptz,
  decided_by text,
  is_public boolean not null default false
);

alter table public.ai_agent_registry enable row level security;
alter table public.ai_agent_runs enable row level security;
alter table public.ai_tool_registry enable row level security;
alter table public.ai_tool_evaluations enable row level security;
alter table public.ai_discovery_runs enable row level security;
alter table public.ai_trend_signals enable row level security;
alter table public.ai_lab_lifecycle enable row level security;
alter table public.ai_validation_checks enable row level security;
alter table public.ai_notifications enable row level security;
alter table public.ai_admin_reviews enable row level security;

do $$ begin create policy "public_read_ai_agent_registry" on public.ai_agent_registry for select using (is_public = true); exception when duplicate_object then null; end $$;
do $$ begin create policy "public_read_ai_agent_runs" on public.ai_agent_runs for select using (is_public = true); exception when duplicate_object then null; end $$;
do $$ begin create policy "public_read_ai_tool_registry" on public.ai_tool_registry for select using (is_public = true); exception when duplicate_object then null; end $$;
do $$ begin create policy "public_read_ai_tool_evaluations" on public.ai_tool_evaluations for select using (is_public = true); exception when duplicate_object then null; end $$;
do $$ begin create policy "public_read_ai_discovery_runs" on public.ai_discovery_runs for select using (is_public = true); exception when duplicate_object then null; end $$;
do $$ begin create policy "public_read_ai_trend_signals" on public.ai_trend_signals for select using (is_public = true); exception when duplicate_object then null; end $$;
do $$ begin create policy "public_read_ai_lab_lifecycle" on public.ai_lab_lifecycle for select using (is_public = true); exception when duplicate_object then null; end $$;
do $$ begin create policy "public_read_ai_validation_checks" on public.ai_validation_checks for select using (is_public = true); exception when duplicate_object then null; end $$;

create index if not exists idx_ai_agent_runs_created_at on public.ai_agent_runs(created_at desc);
create index if not exists idx_ai_notifications_status_severity on public.ai_notifications(status, severity);
create index if not exists idx_ai_admin_reviews_status_risk on public.ai_admin_reviews(status, risk_level);
create index if not exists idx_ai_lab_lifecycle_state on public.ai_lab_lifecycle(lifecycle_state, status);

insert into public.ai_agent_registry (name, role, capabilities, allowed_actions, restricted_actions, status, risk_level)
values
  ('Operator Agent','Coordinates tasks, status, blockers, and next actions.','["route work","log status","summarize blockers"]'::jsonb,'["create issues","write logs","draft next actions"]'::jsonb,'["expose secrets","approve high-risk actions"]'::jsonb,'ready','medium'),
  ('Builder Agent','Creates code, docs, migrations, and dashboard components.','["code","docs","migrations","components"]'::jsonb,'["draft PRs","write files","propose migrations"]'::jsonb,'["destructive production writes","secret handling"]'::jsonb,'ready','medium'),
  ('Validator Agent','Checks builds, routes, sources, and claims.','["validate build","validate sources","flag claims"]'::jsonb,'["run checks","create validation logs"]'::jsonb,'["fabricate proof","suppress failures"]'::jsonb,'ready','medium'),
  ('Source Receipts Agent','Records source metadata and proof notes.','["source receipts","url validation","proof notes"]'::jsonb,'["log public source metadata"]'::jsonb,'["harvest credentials","aggressive scraping"]'::jsonb,'ready','high'),
  ('Paper Trading Agent','Runs paper-only market education simulations.','["paper trading","risk rules","price checks"]'::jsonb,'["simulate trades only with verified data"]'::jsonb,'["real-money trading","fake fills"]'::jsonb,'ready','high'),
  ('Digital Business Agent','Simulates low-cost digital business experiments.','["business experiments","validation","offer design"]'::jsonb,'["create simulated plans","log assumptions"]'::jsonb,'["guaranteed income claims"]'::jsonb,'ready','medium'),
  ('Media Agent','Creates scripts, thumbnails, shorts, and avatar-ready jobs.','["scripts","thumbnails","media jobs"]'::jsonb,'["draft content packages"]'::jsonb,'["public publish without approval"]'::jsonb,'ready','medium'),
  ('Risk Manager Agent','Flags unsafe claims, missing proof, and approval gates.','["risk flags","approval routing","compliance checks"]'::jsonb,'["open review items","block unsafe claims"]'::jsonb,'["ignore safety rules"]'::jsonb,'ready','high'),
  ('Tool Intelligence Agent','Evaluates tools, cost, and integration fit.','["tool registry","cost notes","alternatives"]'::jsonb,'["draft evaluations"]'::jsonb,'["publish stale rankings as current fact"]'::jsonb,'ready','medium'),
  ('Discovery Agent','Researches public topics and trends with source receipts.','["topic discovery","trend signals","strategy briefs"]'::jsonb,'["public-source research"]'::jsonb,'["personal data scraping","fake trend data"]'::jsonb,'ready','medium')
on conflict (name) do update set role = excluded.role, capabilities = excluded.capabilities, allowed_actions = excluded.allowed_actions, restricted_actions = excluded.restricted_actions, status = excluded.status, risk_level = excluded.risk_level;

insert into public.ai_tool_registry (tool_name, category, use_case, cost_notes, integration_status, verification_status, recommendation_status)
values
  ('Supabase','database/backend','Auth, Postgres, storage, logs, public dashboard state.','Use free/low-tier first; monitor storage and realtime usage.','integrated','configured_by_user','primary'),
  ('Vercel','hosting/deployment','Frontend deployment, serverless routes, cron.','Use included cron/serverless limits carefully.','integrated','configured_by_user','primary'),
  ('GitHub Actions','automation','Migration, health checks, failover scheduling.','Included with GitHub limits; avoid noisy schedules.','integrated','configured_by_user','primary'),
  ('Groq','ai-generation','Fast summaries, scripts, educational reports.','Use concise prompts and logging; avoid unnecessary calls.','integrated','configured_by_user','primary'),
  ('HeyGen','ai-video/avatar','Avatar videos after human review.','Paid API; requires approval before production publishing.','planned','needs_verification','candidate'),
  ('Finnhub','market-data','ETF/equity quote checks.','Optional; if missing, mark price unavailable.','optional','needs_key','candidate')
on conflict (tool_name, category) do update set use_case = excluded.use_case, cost_notes = excluded.cost_notes, integration_status = excluded.integration_status, verification_status = excluded.verification_status, recommendation_status = excluded.recommendation_status;

insert into public.ai_trend_signals (topic, topic_family, confidence, signal_summary, strategy_angle, safety_notes, status)
values
  ('Paper trading education','wealth-building',85,'High demand topic but must stay simulated and risk-aware.','Show AI refusing bad data and journaling process.','No financial advice or fake results.','watching'),
  ('AI automation agency','digital-business',82,'Strong interest in AI service businesses.','Simulate offer, outreach, fulfillment and QA.','No guaranteed income claims.','watching'),
  ('Faceless/avatar YouTube','media-business',80,'High creator interest in AI video workflows.','Show transparent script-to-avatar pipeline.','Disclose AI-generated media.','watching'),
  ('Local lead generation','digital-business',76,'Low-cost business model with clear validation steps.','Simulate niche selection and source-backed outreach.','Avoid spam and platform violations.','watching')
on conflict do nothing;

insert into public.ai_lab_lifecycle (lab_slug, lifecycle_state, validation_status, blocker, next_ai_action, next_human_action)
values
  ('paper-trading-lab','validate','pending_migration','Supabase migration verification required.','Implement source receipts dashboard and verify cron logs.','Run or verify Supabase migration workflow.'),
  ('digital-business-builder','design','in_progress',null,'Build discovery and lifecycle panels.','Approve any paid tool activation later.'),
  ('ai-media-studio','design','in_progress','HeyGen key and publishing approval required for live video generation.','Generate content package drafts and approval queue.','Approve avatar provider setup before publishing.')
on conflict do nothing;

insert into public.ai_admin_reviews (review_title, item_type, risk_level, status, reason, required_admin_action, related_issue_url)
values
  ('Approve public publishing policy','publishing','high','pending','AI media output can become public-facing and must be reviewed before external publishing.','Define and approve publishing rules before enabling automatic posting.',null),
  ('Verify Supabase migrations','database','high','pending','Dashboard live mode depends on migrated tables.','Run GitHub Actions migration workflow and confirm tables exist.','https://github.com/XPS-IINTELLIGENCE-SYSTEMS/strategic-minds-advisory/issues/2')
on conflict do nothing;

insert into public.ai_notifications (title, message, severity, notification_type, channel, status, requires_admin_action, related_issue_url)
values
  ('Supabase migration verification needed','Run the Supabase migration workflow and confirm tables exist.','high','blocker','supabase_log','queued',true,'https://github.com/XPS-IINTELLIGENCE-SYSTEMS/strategic-minds-advisory/issues/2')
on conflict do nothing;
