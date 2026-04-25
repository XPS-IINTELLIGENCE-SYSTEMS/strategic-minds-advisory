-- AI in Action Labs operating loop schema
-- Purpose: durable backend for controlled autonomous simulations, source receipts, media jobs, approvals, and visible AI work logs.

create extension if not exists pgcrypto;

create table if not exists public.ai_labs (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  slug text not null unique,
  title text not null,
  category text not null,
  mission text not null,
  audience text,
  risk_level text not null default 'medium',
  status text not null default 'active',
  public_summary text,
  is_public boolean not null default true
);

create table if not exists public.ai_schedules (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  lab_slug text references public.ai_labs(slug) on update cascade on delete set null,
  name text not null,
  cadence text not null,
  trigger_type text not null default 'cron',
  cron_expression text,
  run_prompt text not null,
  output_contract jsonb not null default '{}'::jsonb,
  status text not null default 'queued',
  last_run_at timestamptz,
  next_run_at timestamptz,
  is_public boolean not null default true
);

create table if not exists public.ai_schedule_runs (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  schedule_id uuid references public.ai_schedules(id) on delete set null,
  lab_slug text references public.ai_labs(slug) on update cascade on delete set null,
  run_type text not null default 'scheduled',
  status text not null default 'pending',
  started_at timestamptz,
  completed_at timestamptz,
  summary text,
  result jsonb not null default '{}'::jsonb,
  error_message text,
  is_public boolean not null default true
);

create table if not exists public.ai_runs (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  lab_slug text references public.ai_labs(slug) on update cascade on delete set null,
  title text not null,
  run_kind text not null,
  objective text not null,
  status text not null default 'logged',
  what_ai_did text,
  how_ai_did_it text,
  why_it_matters text,
  blocker text,
  next_action text,
  risk_level text not null default 'medium',
  evidence jsonb not null default '[]'::jsonb,
  is_public boolean not null default true
);

create table if not exists public.ai_source_receipts (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  lab_slug text references public.ai_labs(slug) on update cascade on delete set null,
  source_type text not null,
  title text not null,
  url text not null,
  retrieved_at timestamptz,
  verification_status text not null default 'pending',
  robots_status text not null default 'unknown',
  rate_limit_status text not null default 'unknown',
  snapshot_url text,
  quote_text text,
  notes text,
  is_public boolean not null default true
);

create table if not exists public.ai_strategy_simulations (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  lab_slug text references public.ai_labs(slug) on update cascade on delete set null,
  strategy_name text not null,
  strategy_family text not null,
  scenario_summary text not null,
  assumptions jsonb not null default '{}'::jsonb,
  metrics jsonb not null default '{}'::jsonb,
  p5_outcome text,
  p50_outcome text,
  p95_outcome text,
  risk_score numeric,
  interpretation text,
  disclaimer text not null default 'Scenario modeling only. Not a guarantee or financial advice.',
  status text not null default 'draft',
  is_public boolean not null default true
);

create table if not exists public.ai_interest_topics (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  topic text not null,
  topic_family text not null,
  audience_demand_reason text,
  content_angle text,
  monetization_angle text,
  safety_notes text,
  source_links jsonb not null default '[]'::jsonb,
  priority_score numeric not null default 50,
  status text not null default 'watching',
  is_public boolean not null default true
);

create table if not exists public.ai_avatar_personas (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  name text not null,
  role text not null,
  tone text not null,
  avatar_provider text not null default 'heygen',
  avatar_id text,
  voice_id text,
  allowed_topics jsonb not null default '[]'::jsonb,
  disallowed_claims jsonb not null default '[]'::jsonb,
  disclosure_language text not null default 'Educational AI-generated content. Not financial, legal, tax, or investment advice.',
  safety_notes text,
  status text not null default 'draft',
  is_public boolean not null default true
);

create table if not exists public.ai_media_jobs (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  lab_slug text references public.ai_labs(slug) on update cascade on delete set null,
  persona_id uuid references public.ai_avatar_personas(id) on delete set null,
  job_type text not null,
  title text not null,
  script_body text,
  thumbnail_prompt text,
  video_prompt text,
  provider text not null default 'heygen',
  provider_job_id text,
  output_url text,
  status text not null default 'draft',
  approval_status text not null default 'needs_review',
  source_receipts jsonb not null default '[]'::jsonb,
  is_public boolean not null default true
);

create table if not exists public.ai_approval_queue (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  item_type text not null,
  item_id uuid,
  title text not null,
  request_reason text not null,
  risk_level text not null default 'medium',
  status text not null default 'pending',
  approved_by text,
  approved_at timestamptz,
  decision_notes text,
  is_public boolean not null default false
);

create table if not exists public.ai_risk_flags (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  lab_slug text references public.ai_labs(slug) on update cascade on delete set null,
  flag_type text not null,
  severity text not null default 'medium',
  title text not null,
  description text,
  mitigation text,
  status text not null default 'open',
  is_public boolean not null default true
);

alter table public.ai_labs enable row level security;
alter table public.ai_schedules enable row level security;
alter table public.ai_schedule_runs enable row level security;
alter table public.ai_runs enable row level security;
alter table public.ai_source_receipts enable row level security;
alter table public.ai_strategy_simulations enable row level security;
alter table public.ai_interest_topics enable row level security;
alter table public.ai_avatar_personas enable row level security;
alter table public.ai_media_jobs enable row level security;
alter table public.ai_approval_queue enable row level security;
alter table public.ai_risk_flags enable row level security;

do $$ begin create policy "public_read_ai_labs" on public.ai_labs for select using (is_public = true); exception when duplicate_object then null; end $$;
do $$ begin create policy "public_read_ai_schedules" on public.ai_schedules for select using (is_public = true); exception when duplicate_object then null; end $$;
do $$ begin create policy "public_read_ai_schedule_runs" on public.ai_schedule_runs for select using (is_public = true); exception when duplicate_object then null; end $$;
do $$ begin create policy "public_read_ai_runs" on public.ai_runs for select using (is_public = true); exception when duplicate_object then null; end $$;
do $$ begin create policy "public_read_ai_source_receipts" on public.ai_source_receipts for select using (is_public = true); exception when duplicate_object then null; end $$;
do $$ begin create policy "public_read_ai_strategy_simulations" on public.ai_strategy_simulations for select using (is_public = true); exception when duplicate_object then null; end $$;
do $$ begin create policy "public_read_ai_interest_topics" on public.ai_interest_topics for select using (is_public = true); exception when duplicate_object then null; end $$;
do $$ begin create policy "public_read_ai_avatar_personas" on public.ai_avatar_personas for select using (is_public = true); exception when duplicate_object then null; end $$;
do $$ begin create policy "public_read_ai_media_jobs" on public.ai_media_jobs for select using (is_public = true); exception when duplicate_object then null; end $$;
do $$ begin create policy "public_read_ai_risk_flags" on public.ai_risk_flags for select using (is_public = true); exception when duplicate_object then null; end $$;

create index if not exists idx_ai_runs_created_at on public.ai_runs(created_at desc);
create index if not exists idx_ai_source_receipts_lab_created on public.ai_source_receipts(lab_slug, created_at desc);
create index if not exists idx_ai_schedule_runs_created_at on public.ai_schedule_runs(created_at desc);
create index if not exists idx_ai_media_jobs_status on public.ai_media_jobs(status, approval_status);

insert into public.ai_labs (slug, title, category, mission, audience, risk_level, status, public_summary)
values
  ('paper-trading-lab', 'AI Paper Trading Lab', 'financial-education', 'Simulate a paper-only trading account using verified source data, risk controls, and educational narration.', 'People who want to learn market process without fake performance claims.', 'high', 'active', 'Watch AI check sources, refuse bad data, model risk, and explain paper-trading decisions.'),
  ('digital-business-builder', 'AI Digital Business Builder', 'business-building', 'Simulate building low-cost digital businesses using public research, validation, workflows, content, and launch systems.', 'People who want to learn practical online business creation using AI tools.', 'medium', 'queued', 'Watch AI research, validate, build, document, launch, and explain digital business experiments.'),
  ('ai-media-studio', 'AI Avatar Media Studio', 'media-production', 'Turn AI run logs into educational scripts, avatar video jobs, image prompts, shorts, and newsletters.', 'Viewers who want engaging AI-generated education with transparent sourcing.', 'medium', 'queued', 'Watch AI convert work into videos, scripts, thumbnails, and social assets.')
on conflict (slug) do update set
  title = excluded.title,
  category = excluded.category,
  mission = excluded.mission,
  audience = excluded.audience,
  risk_level = excluded.risk_level,
  status = excluded.status,
  public_summary = excluded.public_summary;

insert into public.ai_schedules (lab_slug, name, cadence, trigger_type, cron_expression, run_prompt, output_contract, status)
values
  ('paper-trading-lab', '15-minute verified market check', 'Every 15 minutes', 'cron', '*/15 * * * *', 'Check verified source prices, log source receipts, apply no-fake-fill guardrails, and create a paper-trading education update.', '{"requires_source_links":true,"requires_no_fabrication":true,"requires_risk_section":true}'::jsonb, 'ready'),
  ('paper-trading-lab', 'Daily 9 AM market lesson', 'Daily 9:00 AM ET', 'cron', '0 9 * * *', 'Summarize latest verified paper-trading state, risk posture, lessons, and next watchlist.', '{"email_body_required":true,"dashboard_summary_required":true}'::jsonb, 'ready'),
  ('ai-media-studio', 'Daily AI content package', 'Daily 5:00 PM ET', 'cron', '0 17 * * *', 'Turn latest AI runs into YouTube, Shorts, Reels, LinkedIn, X, newsletter, thumbnail, and avatar-video prompts.', '{"requires_disclaimer":true,"requires_sources":true,"requires_human_review":true}'::jsonb, 'ready')
on conflict do nothing;

insert into public.ai_interest_topics (topic, topic_family, audience_demand_reason, content_angle, monetization_angle, safety_notes, priority_score, status)
values
  ('Paper trading and market literacy', 'wealth-building', 'High interest in learning trading without risking real money.', 'Watch AI refuse bad data, define risk, and journal every decision.', 'Education products, newsletters, communities, dashboards.', 'No financial advice or guaranteed results.', 96, 'active'),
  ('AI automation agency', 'digital-business', 'Strong demand for low-cost service businesses built with AI workflows.', 'Show AI building offer, landing page, outreach, fulfillment, and QA.', 'Services, templates, retainers, courses.', 'Avoid income guarantees and fake client claims.', 94, 'watching'),
  ('Faceless YouTube and avatar channels', 'media-business', 'High public interest in AI video, avatars, scripts, and monetization.', 'Show the exact pipeline from idea to script to avatar video package.', 'Ads, sponsorships, affiliate, products.', 'Disclose AI-generated media and avoid deceptive impersonation.', 92, 'watching'),
  ('Local lead generation', 'digital-business', 'Appeals to beginners because startup cost can be low and results are measurable.', 'Show AI finding niches, creating pages, validating demand, and building outreach.', 'Lead sales, retainers, rev-share.', 'Avoid spam and respect platform rules.', 90, 'watching'),
  ('Digital product systems', 'creator-business', 'People want low-cost products with scalable distribution.', 'Show AI researching pain points, creating templates, and testing offers.', 'Templates, bundles, memberships.', 'Avoid fake testimonials and inflated outcomes.', 88, 'watching')
on conflict do nothing;

insert into public.ai_avatar_personas (name, role, tone, allowed_topics, disallowed_claims, safety_notes, status)
values
  ('The Risk Manager', 'Paper-trading safety and loss-prevention narrator', 'calm, blunt, precise, protective', '["paper trading","risk management","loss prevention","market process"]'::jsonb, '["guaranteed profits","personalized financial advice","fake fills"]'::jsonb, 'Must reinforce no fake prices, no fake fills, and paper-only simulation.', 'ready'),
  ('The Builder', 'Digital business systems educator', 'direct, optimistic, tactical, practical', '["business building","automation","low-cost tools","validation"]'::jsonb, '["guaranteed income","fake case studies","unverified claims"]'::jsonb, 'Must separate simulation from real revenue and require source-backed validation.', 'ready'),
  ('The Skeptic', 'Claim validator and bottleneck detector', 'witty, skeptical, evidence-first, concise', '["validation","source receipts","pitfalls","risk flags"]'::jsonb, '["unsupported claims","fake proof","hidden risks"]'::jsonb, 'Must call out weak evidence and require human review for risky publication.', 'ready'),
  ('The Creator', 'Viral education content strategist', 'engaging, human, sharp, story-driven', '["scripts","shorts","thumbnails","avatar videos","newsletters"]'::jsonb, '["deceptive media","false urgency","misleading results"]'::jsonb, 'Must keep disclosures and educational framing in content.', 'draft')
on conflict do nothing;

insert into public.ai_runs (lab_slug, title, run_kind, objective, status, what_ai_did, how_ai_did_it, why_it_matters, blocker, next_action, risk_level, evidence)
values
  ('paper-trading-lab', 'Operating loop initialized', 'system-build', 'Create backend tables and seed data for AI in Action public work logs.', 'completed', 'Added Supabase operating-loop schema for labs, schedules, runs, source receipts, simulations, topics, avatars, media jobs, approvals, and risk flags.', 'Used version-controlled SQL migration so the database can be applied through GitHub Actions and audited.', 'This creates the durable state layer needed for 24/7 controlled AI simulations.', 'Migration must be applied by GitHub Actions or Supabase SQL runner before data appears in production.', 'Run Supabase migration workflow and verify tables.', 'medium', '[{"type":"migration","path":"supabase/migrations/202604240002_ai_operating_loop.sql"}]'::jsonb)
on conflict do nothing;

insert into public.ai_risk_flags (lab_slug, flag_type, severity, title, description, mitigation, status)
values
  ('paper-trading-lab', 'financial-claims', 'high', 'No guaranteed wealth claims', 'The platform discusses aggressive wealth-building simulations, which can mislead if framed as expected results.', 'Require education-only disclaimer, paper-only trade language, source receipts, and no guarantee wording.', 'open'),
  ('paper-trading-lab', 'source-integrity', 'high', 'No fabricated prices or fills', 'Live market data may be unavailable or delayed.', 'If a price cannot be verified, write Price unavailable from verified source and do not create fills.', 'open'),
  ('ai-media-studio', 'ai-media-disclosure', 'medium', 'Avatar content must disclose AI generation', 'AI avatars and voices can appear human-like.', 'Use clear AI-generated educational disclosure and avoid impersonation.', 'open')
on conflict do nothing;
