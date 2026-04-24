-- AI in Action Labs Supabase schema
-- Purpose: public read model for the AI in Action platform while preserving write control through trusted server/scheduled workflows.

create extension if not exists pgcrypto;

create table if not exists public.paper_portfolio_snapshots (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  run_type text not null default 'manual',
  starting_value numeric not null default 50000,
  current_value numeric not null default 50000,
  cash_value numeric not null default 10000,
  allocation jsonb not null default '[]'::jsonb,
  equity_curve jsonb not null default '[]'::jsonb,
  risk_status text not null default 'normal',
  lesson text,
  source_summary text,
  is_public boolean not null default true
);

create table if not exists public.paper_trades (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  symbol text not null,
  asset_name text,
  trade_type text not null default 'paper',
  setup text,
  thesis text,
  entry_price numeric,
  stop_price numeric,
  target_price numeric,
  exit_price numeric,
  quantity numeric,
  position_value numeric,
  risk_amount numeric,
  pnl numeric,
  status text not null default 'watching',
  lesson text,
  source_links jsonb not null default '[]'::jsonb,
  is_public boolean not null default true
);

create table if not exists public.asset_price_checks (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  symbol text not null,
  asset_name text,
  exact_price numeric,
  price_text text,
  source_name text,
  source_url text,
  checked_at timestamptz not null default now(),
  verification_status text not null default 'verified',
  notes text,
  is_public boolean not null default true
);

create table if not exists public.content_packages (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  package_type text not null,
  title text not null,
  hook text,
  platform text,
  script_body text,
  thumbnail_prompt text,
  video_prompt text,
  source_links jsonb not null default '[]'::jsonb,
  compliance_note text not null default 'Educational content only. Paper trading examples are simulated and are not financial advice.',
  status text not null default 'draft',
  is_public boolean not null default true
);

create table if not exists public.source_links (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  source_type text not null,
  title text not null,
  url text not null,
  used_for text,
  verification_status text not null default 'linked',
  notes text,
  is_public boolean not null default true
);

create table if not exists public.platform_logs (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  log_type text not null,
  title text not null,
  message text,
  metadata jsonb not null default '{}'::jsonb,
  severity text not null default 'info',
  is_public boolean not null default true
);

alter table public.paper_portfolio_snapshots enable row level security;
alter table public.paper_trades enable row level security;
alter table public.asset_price_checks enable row level security;
alter table public.content_packages enable row level security;
alter table public.source_links enable row level security;
alter table public.platform_logs enable row level security;

do $$ begin
  create policy "public_read_paper_portfolio_snapshots" on public.paper_portfolio_snapshots for select using (is_public = true);
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "public_read_paper_trades" on public.paper_trades for select using (is_public = true);
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "public_read_asset_price_checks" on public.asset_price_checks for select using (is_public = true);
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "public_read_content_packages" on public.content_packages for select using (is_public = true);
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "public_read_source_links" on public.source_links for select using (is_public = true);
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "public_read_platform_logs" on public.platform_logs for select using (is_public = true);
exception when duplicate_object then null; end $$;

insert into public.paper_portfolio_snapshots (
  run_type,
  starting_value,
  current_value,
  cash_value,
  allocation,
  equity_curve,
  risk_status,
  lesson,
  source_summary
) values (
  'initial_seed',
  50000,
  50000,
  10000,
  '[{"symbol":"CASH","allocation":20,"value":10000},{"symbol":"SPY","allocation":18,"value":9000},{"symbol":"QQQ","allocation":14,"value":7000},{"symbol":"BTC","allocation":14,"value":7000},{"symbol":"ETH","allocation":10,"value":5000},{"symbol":"NVDA","allocation":10,"value":5000},{"symbol":"GLD","allocation":7,"value":3500},{"symbol":"TACTICAL","allocation":7,"value":3500}]'::jsonb,
  '[{"label":"Start","value":50000},{"label":"W1","value":50000},{"label":"W2","value":50000},{"label":"W3","value":50000},{"label":"W4","value":50000}]'::jsonb,
  'normal',
  'Initial paper-trading account state. Live prices must be verified before active decisions.',
  'Seed state only. Not live market data.'
) on conflict do nothing;

insert into public.platform_logs (log_type, title, message, metadata)
values (
  'system',
  'AI in Action Labs initialized',
  'Supabase schema created and seed paper portfolio added. Continue by wiring scheduled reports into these tables.',
  '{"base44":"disabled","supabase":"ready","groq":"configured_in_vercel"}'::jsonb
) on conflict do nothing;
