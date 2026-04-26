-- AI Invention Factory sandbox schema
-- Enables typed sandbox requests, validation runs, proof records, and reporting state.

create extension if not exists pgcrypto;

create table if not exists public.ai_invention_requests (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  requested_by text,
  system_name text not null,
  system_slug text not null unique,
  build_prompt text not null,
  target_mode text not null default 'sandbox',
  status text not null default 'queued',
  frontend_path text,
  backend_routes jsonb not null default '[]'::jsonb,
  github_issue_url text,
  github_run_url text,
  vercel_url text,
  supabase_tables jsonb not null default '[]'::jsonb,
  proof_summary text,
  risk_notes text,
  next_ai_action text,
  next_human_action text,
  is_public boolean not null default true
);

create table if not exists public.ai_invention_runs (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  invention_slug text references public.ai_invention_requests(system_slug) on update cascade on delete set null,
  run_type text not null,
  status text not null default 'queued',
  frontend_status text not null default 'not_checked',
  backend_status text not null default 'not_checked',
  supabase_status text not null default 'not_checked',
  vercel_status text not null default 'not_checked',
  source_receipts jsonb not null default '[]'::jsonb,
  validation_results jsonb not null default '{}'::jsonb,
  report_recipients jsonb not null default '["strategicmindsadvisory@gmail.com", "j.xpsxpress@gmail.com"]'::jsonb,
  email_status text not null default 'not_configured',
  github_run_url text,
  summary text,
  error_message text,
  is_public boolean not null default true
);

create table if not exists public.ai_invention_proofs (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  invention_slug text references public.ai_invention_requests(system_slug) on update cascade on delete set null,
  proof_type text not null,
  title text not null,
  url text,
  status text not null default 'pending',
  evidence jsonb not null default '{}'::jsonb,
  notes text,
  is_public boolean not null default true
);

alter table public.ai_invention_requests enable row level security;
alter table public.ai_invention_runs enable row level security;
alter table public.ai_invention_proofs enable row level security;

do $$ begin create policy "public_read_ai_invention_requests" on public.ai_invention_requests for select using (is_public = true); exception when duplicate_object then null; end $$;
do $$ begin create policy "public_read_ai_invention_runs" on public.ai_invention_runs for select using (is_public = true); exception when duplicate_object then null; end $$;
do $$ begin create policy "public_read_ai_invention_proofs" on public.ai_invention_proofs for select using (is_public = true); exception when duplicate_object then null; end $$;

create index if not exists idx_ai_invention_requests_status on public.ai_invention_requests(status, created_at desc);
create index if not exists idx_ai_invention_runs_slug_created on public.ai_invention_runs(invention_slug, created_at desc);
create index if not exists idx_ai_invention_proofs_slug_created on public.ai_invention_proofs(invention_slug, created_at desc);

insert into public.ai_invention_requests (
  requested_by,
  system_name,
  system_slug,
  build_prompt,
  target_mode,
  status,
  frontend_path,
  backend_routes,
  supabase_tables,
  proof_summary,
  risk_notes,
  next_ai_action,
  next_human_action
) values (
  'ai-in-action',
  'AI Invention Factory Sandbox',
  'ai-invention-factory-sandbox',
  'Build a command-driven sandbox that lets the user type build X system and produces frontend/backend/Supabase/Vercel validation proof.',
  'sandbox',
  'active',
  '/ai-in-action',
  '["/api/sandbox/request", "/api/sandbox/status"]'::jsonb,
  '["ai_invention_requests", "ai_invention_runs", "ai_invention_proofs"]'::jsonb,
  'Seed sandbox request created by migration.',
  'No public publishing, no new repo creation without admin approval, no secrets in frontend.',
  'Validate deployed API routes and dashboard visibility.',
  'Add optional email provider secret if real email delivery is required.'
) on conflict (system_slug) do update set
  status = excluded.status,
  frontend_path = excluded.frontend_path,
  backend_routes = excluded.backend_routes,
  supabase_tables = excluded.supabase_tables,
  next_ai_action = excluded.next_ai_action,
  next_human_action = excluded.next_human_action;
