create extension if not exists pgcrypto;

create table if not exists xps_contractors (
  id uuid primary key default gen_random_uuid(),
  company_name text not null,
  owner_name text,
  email text,
  phone text,
  tier text not null default 'Starter' check (tier in ('Starter','Member','Approved','Preferred','Elite')),
  score numeric not null default 0,
  jobs_rated integer not null default 0,
  avg_rating numeric not null default 0,
  purchase_volume_ytd numeric not null default 0,
  callback_count integer not null default 0,
  training_complete boolean not null default false,
  status text not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists xps_jobs (
  id uuid primary key default gen_random_uuid(),
  contractor_id uuid references xps_contractors(id) on delete set null,
  customer_name text,
  customer_email text,
  project_type text check (project_type in ('Residential','Commercial','Government')),
  system_installed text,
  square_feet numeric,
  completion_date date,
  status text not null default 'open',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists xps_walkthroughs (
  id uuid primary key default gen_random_uuid(),
  contractor_id uuid references xps_contractors(id) on delete set null,
  job_id uuid references xps_jobs(id) on delete set null,
  customer_name text not null,
  customer_email text,
  contractor_company text,
  project_type text,
  system_installed text,
  floor_accepted boolean not null default false,
  care_guide_delivered boolean not null default false,
  cleaning_package_explained boolean not null default false,
  communication_rating numeric check (communication_rating between 1 and 5),
  cleanliness_rating numeric check (cleanliness_rating between 1 and 5),
  overall_rating numeric check (overall_rating between 1 and 5),
  comments text,
  customer_signature text,
  created_at timestamptz not null default now()
);

create table if not exists xps_ratings (
  id uuid primary key default gen_random_uuid(),
  contractor_id uuid references xps_contractors(id) on delete cascade,
  job_id uuid references xps_jobs(id) on delete set null,
  quality_score numeric,
  communication_score numeric,
  documentation_score numeric,
  callback_flag boolean not null default false,
  overall_score numeric,
  created_at timestamptz not null default now()
);

create table if not exists xps_implementation_tasks (
  id uuid primary key default gen_random_uuid(),
  area text not null,
  task text not null,
  owner text,
  priority text default 'High',
  status text default 'Not Started',
  due_date date,
  stamp text,
  evidence_link text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists xps_tier_events (
  id uuid primary key default gen_random_uuid(),
  contractor_id uuid references xps_contractors(id) on delete cascade,
  old_tier text,
  new_tier text,
  reason text,
  approved_by text,
  created_at timestamptz not null default now()
);

create table if not exists xps_content_access (
  id uuid primary key default gen_random_uuid(),
  contractor_id uuid references xps_contractors(id) on delete cascade,
  access_level text,
  system_stamp text,
  granted_by text,
  expires_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists xps_response_log (
  id uuid primary key default gen_random_uuid(),
  person text,
  touchpoint text,
  response text,
  sentiment text,
  friction text,
  requested_change text,
  owner text,
  next_action text,
  resolved boolean default false,
  created_at timestamptz not null default now()
);

create table if not exists xps_signoffs (
  id uuid primary key default gen_random_uuid(),
  reviewer text not null,
  role text,
  decision text default 'Pending',
  comments text,
  requested_changes text,
  signoff_date date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table xps_contractors enable row level security;
alter table xps_jobs enable row level security;
alter table xps_walkthroughs enable row level security;
alter table xps_ratings enable row level security;
alter table xps_implementation_tasks enable row level security;
alter table xps_tier_events enable row level security;
alter table xps_content_access enable row level security;
alter table xps_response_log enable row level security;
alter table xps_signoffs enable row level security;

create policy "authenticated manage xps_contractors" on xps_contractors for all to authenticated using (true) with check (true);
create policy "authenticated manage xps_jobs" on xps_jobs for all to authenticated using (true) with check (true);
create policy "authenticated manage xps_walkthroughs" on xps_walkthroughs for all to authenticated using (true) with check (true);
create policy "authenticated manage xps_ratings" on xps_ratings for all to authenticated using (true) with check (true);
create policy "authenticated manage xps_implementation_tasks" on xps_implementation_tasks for all to authenticated using (true) with check (true);
create policy "authenticated manage xps_tier_events" on xps_tier_events for all to authenticated using (true) with check (true);
create policy "authenticated manage xps_content_access" on xps_content_access for all to authenticated using (true) with check (true);
create policy "authenticated manage xps_response_log" on xps_response_log for all to authenticated using (true) with check (true);
create policy "authenticated manage xps_signoffs" on xps_signoffs for all to authenticated using (true) with check (true);
