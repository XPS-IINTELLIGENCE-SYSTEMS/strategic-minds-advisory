create table if not exists public.ai_tasks (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  type text not null default 'system',
  status text not null default 'pending',
  priority integer not null default 1,
  payload jsonb not null default '{}'::jsonb,
  result jsonb,
  error text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.ai_execution_logs (
  id uuid primary key default gen_random_uuid(),
  event text not null,
  status text not null default 'ok',
  task_id uuid,
  action text,
  details jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.ai_system_events (
  id uuid primary key default gen_random_uuid(),
  source text not null default 'ai-in-action',
  event text not null,
  severity text not null default 'info',
  details jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.ai_revenue_events (
  id uuid primary key default gen_random_uuid(),
  source text not null default 'system',
  amount numeric,
  currency text default 'USD',
  status text not null default 'recorded',
  details jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.ai_content_queue (
  id uuid primary key default gen_random_uuid(),
  platform text,
  title text,
  content text,
  status text not null default 'draft',
  schedule_at timestamptz,
  details jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.ai_model_runs (
  id uuid primary key default gen_random_uuid(),
  provider text,
  model text,
  status text not null default 'ok',
  prompt_summary text,
  usage jsonb,
  result jsonb,
  error text,
  created_at timestamptz not null default now()
);

create table if not exists public.ai_guardrail_events (
  id uuid primary key default gen_random_uuid(),
  action text not null,
  status text not null,
  reason text,
  details jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists ai_tasks_status_priority_idx on public.ai_tasks (status, priority desc, created_at asc);
create index if not exists ai_execution_logs_created_at_idx on public.ai_execution_logs (created_at desc);
create index if not exists ai_system_events_created_at_idx on public.ai_system_events (created_at desc);
create index if not exists ai_content_queue_status_idx on public.ai_content_queue (status, schedule_at);
