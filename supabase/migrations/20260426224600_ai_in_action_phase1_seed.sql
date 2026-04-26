-- AI In Action Phase 1 seed records

insert into ai_products (
  product_name, slug, status, target_customer, problem_solved, promise,
  deliverables, price_min_usd, price_max_usd, stripe_notes, landing_page_copy,
  content_hooks, proof_requirements, approval_required
) values
  (
    'AI In Action Starter Kit',
    'ai-in-action-starter-kit',
    'draft',
    'builders and small business operators',
    'They want a low-cost AI operating system but do not know how to connect GPT, GitHub, Vercel, Supabase, and Stripe.',
    'A practical starter blueprint for building a low-cost AI invention factory.',
    '["repo structure", "Supabase schema", "GitHub Actions workflows", "Vercel deployment guide", "prompt pack", "safety gates"]'::jsonb,
    49,
    199,
    'Create Stripe Payment Link after admin approval.',
    'Build your own AI In Action system with a low-cost stack and proof-first workflows.',
    '["Can GPT help build a million-dollar business?", "The $165/month AI stack", "System > hype"]'::jsonb,
    '["working dashboard", "validated route", "proof issue", "cost ledger"]'::jsonb,
    true
  ),
  (
    'White Unicorn AI Stack Blueprint',
    'white-unicorn-ai-stack-blueprint',
    'draft',
    'AI builders and creators',
    'They need a cheap alternative to expensive AI builder platforms.',
    'A blueprint for using GPT, GitHub, Vercel, Supabase, and Stripe as one operating stack.',
    '["architecture map", "cost controls", "agent hierarchy", "implementation checklist"]'::jsonb,
    29,
    99,
    'Create Stripe product after admin approval.',
    'The low-cost stack behind the AI In Action challenge.',
    '["I think I found the white-unicorn AI stack", "Cheap tools, serious system", "Why system beats hype"]'::jsonb,
    '["architecture doc", "budget caps", "sample queue"]'::jsonb,
    true
  ),
  (
    'AI Invention Factory Template Pack',
    'ai-invention-factory-template-pack',
    'draft',
    'automation builders',
    'They need repeatable templates to generate and validate AI systems.',
    'Templates for queue-driven invention builds, validation, proof logging, and handoff prompts.',
    '["invention templates", "validation templates", "GitHub issue templates", "content templates"]'::jsonb,
    99,
    299,
    'Bundle after MVP proof.',
    'Reusable templates for launching your own AI invention factory.',
    '["Stop rebuilding from scratch", "One queue, many systems", "Proof-first automation"]'::jsonb,
    '["two generated systems", "dynamic route validation", "batch proof issue"]'::jsonb,
    true
  )
on conflict (slug) do nothing;

insert into ai_simulated_accounts (account_name, account_type, balance, is_real_money, notes)
values
  ('AI In Action Simulated Cash', 'cash', 1000, false, 'Starting simulated operating cash for public challenge narratives.'),
  ('AI In Action Paper Portfolio', 'paper_trading', 1000, false, 'Paper/simulated portfolio only. No real-money trading.')
on conflict do nothing;

insert into ai_revenue_experiments (
  experiment_name, status, hypothesis, offer, target_customer, channel, price_usd, metrics
) values (
  'Million-Dollar GPT Challenge Starter Offer',
  'draft',
  'Public execution plus a reproducible low-cost AI stack can generate demand for starter kits and templates.',
  'AI In Action Starter Kit',
  'AI builders, small business operators, and creators who want cheap automation infrastructure.',
  'YouTube, TikTok, X, LinkedIn, newsletter',
  99,
  '{"target_run_rate_usd_per_month":83333,"initial_goal_usd_per_month":1000,"status":"prelaunch"}'::jsonb
);

insert into ai_content_queue (
  content_type, status, title, hook, body, asset_prompt, platform, approval_required, estimated_generation_cost_usd, metadata
) values
  (
    'youtube_long',
    'draft',
    'Can GPT Help Me Build a Million-Dollar Business in One Year?',
    'I think I found the white-unicorn AI stack: GPT, GitHub, Vercel, Supabase, and Stripe.',
    'Introduce the public challenge, the $165/month target stack, the rules, the proof dashboard, and the promise to show decisions, failures, costs, and reproducible blueprints.',
    'Cinematic dashboard thumbnail showing GPT connected to GitHub, Vercel, Supabase, and Stripe with the text CAN GPT BUILD $1M?',
    'YouTube',
    true,
    0,
    '{"series":"AI In Action Million-Dollar Challenge","public_publish_requires_approval":true}'::jsonb
  ),
  (
    'short_video_prompt',
    'draft',
    'The $165 AI Stack Challenge',
    'Most people ask AI for ideas. I am giving it infrastructure and measuring what it can actually build.',
    'Short vertical video concept: fast cuts of the stack, proof issues, deployments, simulated dashboard, and first product blueprint.',
    'Vertical 9:16 short video storyboard: AI command center, GitHub commits, Vercel deployment, Supabase queue, Stripe product draft, proof dashboard, dramatic but honest challenge tone.',
    'TikTok/Reels/Shorts',
    true,
    0,
    '{"requires_video_generation_approval":true}'::jsonb
  );

insert into ai_work_queue (task_type, status, priority, payload, approval_required, safety_gate, created_by)
values
  (
    'validation',
    'queued',
    95,
    '{"goal":"Validate shared dynamic generated route", "route":"/api/sandbox/generated?slug=ai-opportunity-radar", "proof_required":true}'::jsonb,
    false,
    null,
    'phase1-seed'
  ),
  (
    'dashboard_update',
    'queued',
    80,
    '{"goal":"Add public Million-Dollar Challenge dashboard sections", "sections":["cost", "proof", "systems", "products", "simulated wealth", "next action"]}'::jsonb,
    false,
    null,
    'phase1-seed'
  ),
  (
    'gpt_plus_handoff',
    'queued',
    60,
    '{"goal":"Prepare copy-paste handoff prompt when API budget is exceeded", "trigger":"budget_or_complexity_exceeded"}'::jsonb,
    false,
    null,
    'phase1-seed'
  );

insert into ai_agent_reflections (
  period_start, period_end, what_worked, what_failed, lessons, next_actions, public_summary
) values (
  now(),
  now(),
  'Dynamic route architecture reduces Vercel function count and preserves low-cost deployment.',
  'Old per-invention API files caused Vercel Hobby function-count failures.',
  'System architecture must favor one shared runtime route, deterministic templates, proof logs, approval gates, and budget caps.',
  '["Run dynamic batch proof", "Add scheduled worker", "Validate queue schema", "Build public challenge dashboard"]'::jsonb,
  'AI In Action is moving from prototype to durable low-cost autonomy with visible proof and constraints.'
);
