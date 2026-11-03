create table if not exists public.xps_epoxy_floor_planner_submissions (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  customer_name text,
  contractor_company text,
  email text,
  phone text,
  project_address text,
  state text,
  space_type text,
  square_footage text,
  current_floor_condition text,
  traffic_level text,
  exposure_notes text,
  design_preference text,
  budget_range text,
  timeline text,
  concerns text,
  favorite_system text,
  favorite_colors text,
  questions text,
  visualizer_scene_type text,
  visualizer_floor_system text,
  visualizer_palette text,
  visualizer_color_name text,
  visualizer_color_code text,
  visualizer_texture_type text,
  visualizer_sheen text,
  visualizer_notes text,
  planner_source text not null default 'xps_epoxy_floor_planner',
  metadata jsonb not null default '{}'
);

create table if not exists public.xps_epoxy_ai_sessions (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  session_type text,
  user_type text,
  company_name text,
  email text,
  phone text,
  state text,
  lead_source text not null default 'xps_epoxy_floor_planner',
  status text not null default 'active',
  metadata jsonb not null default '{}'
);

create table if not exists public.xps_epoxy_ai_messages (
  id uuid primary key default gen_random_uuid(),
  session_id uuid references public.xps_epoxy_ai_sessions(id) on delete cascade,
  created_at timestamptz not null default now(),
  role text not null,
  content text not null,
  mode text,
  risk_level text,
  lead_signal text,
  provider_status text,
  metadata jsonb not null default '{}'
);

create table if not exists public.xps_epoxy_leads (
  id uuid primary key default gen_random_uuid(),
  session_id uuid references public.xps_epoxy_ai_sessions(id) on delete set null,
  created_at timestamptz not null default now(),
  name text,
  company_name text,
  email text,
  phone text,
  state text,
  work_type text,
  interest_area text,
  wants_follow_up boolean not null default false,
  consent boolean not null default false,
  priority_score integer not null default 0,
  notes text,
  metadata jsonb not null default '{}'
);

create table if not exists public.xps_epoxy_ai_feedback (
  id uuid primary key default gen_random_uuid(),
  session_id uuid references public.xps_epoxy_ai_sessions(id) on delete cascade,
  message_id uuid references public.xps_epoxy_ai_messages(id) on delete cascade,
  created_at timestamptz not null default now(),
  rating integer,
  feedback text,
  metadata jsonb not null default '{}'
);

create table if not exists public.xps_epoxy_visualizer_selections (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  planner_submission_id uuid references public.xps_epoxy_floor_planner_submissions(id) on delete set null,
  session_id uuid references public.xps_epoxy_ai_sessions(id) on delete set null,
  scene_type text,
  floor_system text,
  palette text,
  color_name text,
  color_code text,
  texture_type text,
  sheen text,
  notes text,
  metadata jsonb not null default '{}'
);

create index if not exists idx_xps_epoxy_planner_created_at on public.xps_epoxy_floor_planner_submissions (created_at desc);
create index if not exists idx_xps_epoxy_planner_email on public.xps_epoxy_floor_planner_submissions (email);
create index if not exists idx_xps_epoxy_sessions_created_at on public.xps_epoxy_ai_sessions (created_at desc);
create index if not exists idx_xps_epoxy_sessions_email on public.xps_epoxy_ai_sessions (email);
create index if not exists idx_xps_epoxy_messages_session_id on public.xps_epoxy_ai_messages (session_id);
create index if not exists idx_xps_epoxy_messages_risk_level on public.xps_epoxy_ai_messages (risk_level);
create index if not exists idx_xps_epoxy_leads_email on public.xps_epoxy_leads (email);
create index if not exists idx_xps_epoxy_leads_interest_area on public.xps_epoxy_leads (interest_area);
create index if not exists idx_xps_epoxy_leads_priority_score on public.xps_epoxy_leads (priority_score desc);
create index if not exists idx_xps_epoxy_feedback_session_id on public.xps_epoxy_ai_feedback (session_id);
create index if not exists idx_xps_epoxy_visualizer_created_at on public.xps_epoxy_visualizer_selections (created_at desc);
create index if not exists idx_xps_epoxy_visualizer_floor_system on public.xps_epoxy_visualizer_selections (floor_system);
create index if not exists idx_xps_epoxy_visualizer_color_name on public.xps_epoxy_visualizer_selections (color_name);
create index if not exists idx_xps_epoxy_visualizer_scene_type on public.xps_epoxy_visualizer_selections (scene_type);

alter table public.xps_epoxy_floor_planner_submissions enable row level security;
alter table public.xps_epoxy_ai_sessions enable row level security;
alter table public.xps_epoxy_ai_messages enable row level security;
alter table public.xps_epoxy_leads enable row level security;
alter table public.xps_epoxy_ai_feedback enable row level security;
alter table public.xps_epoxy_visualizer_selections enable row level security;

-- Public browser access is intentionally not granted.
-- Writes are routed through Vercel server-side API handlers using the Supabase service role key.
