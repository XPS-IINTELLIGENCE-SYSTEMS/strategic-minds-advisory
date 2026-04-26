-- AI In Action Phase 1 Autonomy Schema

create table if not exists ai_work_queue (
  id uuid primary key default gen_random_uuid(),
  task_type text not null,
  status text not null default 'queued',
  priority integer not null default 50,
  payload jsonb not null default '{}'::jsonb,
  result jsonb not null default '{}'::jsonb,
  approval_required boolean not null default false,
  safety_gate text,
  max_runtime_minutes integer not null default 30,
  attempt_count integer not null default 0,
  max_attempts integer not null default 3,
  scheduled_for timestamptz not null default now(),
  locked_at timestamptz,
  locked_by text,
  completed_at timestamptz,
  blocked_reason text,
  created_by text not null default 'ai-in-action',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint ai_work_queue_task_type_check check (task_type in ('invention_build','validation','content_draft','stripe_product_idea','simulated_portfolio_update','opportunity_scan','social_asset_draft','video_script_draft','image_prompt_draft','dashboard_update','blocker_review','gpt_plus_handoff')),
  constraint ai_work_queue_status_check check (status in ('queued','running','completed','blocked','failed','cancelled','needs_approval'))
);

create index if not exists idx_ai_work_queue_pick on ai_work_queue (status, scheduled_for, priority desc, created_at);
create index if not exists idx_ai_work_queue_type_status on ai_work_queue (task_type, status);

create table if not exists ai_worker_runs (
  id uuid primary key default gen_random_uuid(),
  worker_name text not null,
  run_source text not null default 'github-actions',
  status text not null default 'started',
  task_id uuid references ai_work_queue(id) on delete set null,
  started_at timestamptz not null default now(),
  finished_at timestamptz,
  duration_ms integer,
  summary text,
  details jsonb not null default '{}'::jsonb,
  github_run_url text,
  created_at timestamptz not null default now(),
  constraint ai_worker_runs_status_check check (status in ('started','completed','blocked','failed','budget_exceeded','safety_stopped'))
);

create table if not exists ai_cost_ledger (
  id uuid primary key default gen_random_uuid(),
  run_id uuid references ai_worker_runs(id) on delete set null,
  task_id uuid references ai_work_queue(id) on delete set null,
  provider text not null default 'openai',
  model text,
  usage_type text not null default 'api_call',
  input_tokens integer not null default 0,
  output_tokens integer not null default 0,
  estimated_cost_usd numeric(12,6) not null default 0,
  budget_month text not null default to_char(now(), 'YYYY-MM'),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists idx_ai_cost_ledger_month on ai_cost_ledger (budget_month, provider, created_at);

create table if not exists ai_proof_logs (
  id uuid primary key default gen_random_uuid(),
  task_id uuid references ai_work_queue(id) on delete set null,
  run_id uuid references ai_worker_runs(id) on delete set null,
  proof_type text not null,
  title text not null,
  status text not null default 'logged',
  url text,
  evidence jsonb not null default '{}'::jsonb,
  notes text,
  public_safe boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists ai_revenue_experiments (
  id uuid primary key default gen_random_uuid(),
  experiment_name text not null,
  status text not null default 'draft',
  hypothesis text,
  offer text,
  target_customer text,
  channel text,
  price_usd numeric(12,2),
  real_revenue_usd numeric(12,2) not null default 0,
  simulated_revenue_usd numeric(12,2) not null default 0,
  metrics jsonb not null default '{}'::jsonb,
  proof_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists ai_products (
  id uuid primary key default gen_random_uuid(),
  product_name text not null,
  slug text unique not null,
  status text not null default 'draft',
  target_customer text,
  problem_solved text,
  promise text,
  deliverables jsonb not null default '[]'::jsonb,
  price_min_usd numeric(12,2),
  price_max_usd numeric(12,2),
  stripe_notes text,
  landing_page_copy text,
  content_hooks jsonb not null default '[]'::jsonb,
  proof_requirements jsonb not null default '[]'::jsonb,
  approval_required boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists ai_content_queue (
  id uuid primary key default gen_random_uuid(),
  content_type text not null,
  status text not null default 'draft',
  title text,
  hook text,
  body text,
  asset_prompt text,
  related_task_id uuid references ai_work_queue(id) on delete set null,
  related_product_id uuid references ai_products(id) on delete set null,
  platform text,
  approval_required boolean not null default true,
  estimated_generation_cost_usd numeric(12,6) not null default 0,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists ai_approval_gates (
  id uuid primary key default gen_random_uuid(),
  gate_type text not null,
  status text not null default 'pending',
  title text not null,
  details jsonb not null default '{}'::jsonb,
  requested_by text not null default 'ai-in-action',
  approved_by text,
  approved_at timestamptz,
  expires_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists ai_simulated_accounts (
  id uuid primary key default gen_random_uuid(),
  account_name text not null,
  account_type text not null,
  currency text not null default 'USD',
  balance numeric(14,2) not null default 0,
  is_real_money boolean not null default false,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists ai_simulated_portfolio (
  id uuid primary key default gen_random_uuid(),
  account_id uuid references ai_simulated_accounts(id) on delete cascade,
  symbol text not null,
  asset_type text not null default 'equity',
  quantity numeric(18,6) not null default 0,
  average_cost numeric(14,4),
  last_price numeric(14,4),
  market_value numeric(14,2),
  unrealized_pnl numeric(14,2),
  thesis text,
  decision_log jsonb not null default '[]'::jsonb,
  updated_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create table if not exists ai_agent_decisions (
  id uuid primary key default gen_random_uuid(),
  agent_name text not null,
  task_id uuid references ai_work_queue(id) on delete set null,
  decision text not null,
  rationale text,
  confidence numeric(4,3),
  constraints jsonb not null default '[]'::jsonb,
  expected_outcome text,
  actual_outcome text,
  proof_url text,
  created_at timestamptz not null default now()
);

create table if not exists ai_agent_reflections (
  id uuid primary key default gen_random_uuid(),
  period_start timestamptz,
  period_end timestamptz,
  what_worked text,
  what_failed text,
  lessons text,
  next_actions jsonb not null default '[]'::jsonb,
  metrics jsonb not null default '{}'::jsonb,
  public_summary text,
  created_at timestamptz not null default now()
);
