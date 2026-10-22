create table if not exists public.ai_source_receipts (
  id uuid primary key default gen_random_uuid(),
  lab_slug text not null default 'ai-in-action',
  source_type text not null default 'manual_source',
  title text not null default 'Untitled source receipt',
  url text not null,
  retrieved_at timestamptz not null default now(),
  verification_status text not null default 'pending',
  robots_status text not null default 'unknown',
  rate_limit_status text not null default 'unknown',
  snapshot_url text,
  quote_text text,
  notes text,
  is_public boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.ai_approval_queue (
  id uuid primary key default gen_random_uuid(),
  lab_slug text not null default 'ai-in-action',
  action_type text not null,
  title text not null,
  description text,
  risk_level text not null default 'medium',
  status text not null default 'pending',
  requested_by text not null default 'ai-in-action',
  payload jsonb not null default '{}'::jsonb,
  decision text,
  decision_notes text,
  decided_by text,
  decided_at timestamptz,
  expires_at timestamptz,
  is_public boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.ai_admin_reviews (
  id uuid primary key default gen_random_uuid(),
  approval_id uuid,
  review_type text not null default 'manual_review',
  reviewer text,
  status text not null default 'pending',
  notes text,
  evidence jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint ai_admin_reviews_approval_fk
    foreign key (approval_id)
    references public.ai_approval_queue(id)
    on delete set null
);

create index if not exists ai_source_receipts_lab_slug_idx on public.ai_source_receipts (lab_slug, retrieved_at desc);
create index if not exists ai_source_receipts_url_idx on public.ai_source_receipts (url);
create index if not exists ai_source_receipts_verification_idx on public.ai_source_receipts (verification_status, retrieved_at desc);

create index if not exists ai_approval_queue_status_idx on public.ai_approval_queue (status, risk_level, created_at desc);
create index if not exists ai_approval_queue_lab_slug_idx on public.ai_approval_queue (lab_slug, created_at desc);

create index if not exists ai_admin_reviews_approval_idx on public.ai_admin_reviews (approval_id, created_at desc);
create index if not exists ai_admin_reviews_status_idx on public.ai_admin_reviews (status, created_at desc);
