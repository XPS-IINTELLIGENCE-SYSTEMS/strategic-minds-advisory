create table if not exists public.xps_contractor_success_leads (
  id uuid primary key default gen_random_uuid(),
  submitted_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  first_name text not null,
  last_name text not null,
  company_name text not null,
  phone text not null,
  email text not null,
  website_or_social text,
  city text not null,
  state text not null,
  service_area text,
  years_in_business text not null,
  primary_work_type text[] not null default '{}',
  systems_offered text[] not null default '{}',
  currently_buys_from_xps text not null,
  interested_in_discounts text not null,
  interested_in_training text not null,
  interested_in_lead_opportunities text not null,
  wants_branded_planner text not null,
  biggest_challenge text not null,
  consent boolean not null default false,
  lead_source text not null default 'xps_contractor_success_landing_page',
  page_path text,
  referrer text,
  lead_status text not null default 'new_lead',
  priority_score integer not null default 0,
  priority_label text not null default 'cold',
  last_contacted_at timestamptz,
  next_follow_up_at timestamptz,
  assigned_to text,
  notes text,
  constraint xps_contractor_success_leads_email_check check (position('@' in email) > 1),
  constraint xps_contractor_success_leads_priority_label_check check (priority_label in ('cold', 'warm', 'hot', 'priority'))
);

create index if not exists idx_xps_leads_submitted_at on public.xps_contractor_success_leads (submitted_at desc);
create index if not exists idx_xps_leads_email on public.xps_contractor_success_leads (email);
create index if not exists idx_xps_leads_status on public.xps_contractor_success_leads (lead_status);
create index if not exists idx_xps_leads_priority on public.xps_contractor_success_leads (priority_score desc, submitted_at desc);
create index if not exists idx_xps_leads_state on public.xps_contractor_success_leads (state);

alter table public.xps_contractor_success_leads enable row level security;

-- Public browser writes are intentionally not granted.
-- Lead capture writes go through the Vercel server-side API route using the service role key.
