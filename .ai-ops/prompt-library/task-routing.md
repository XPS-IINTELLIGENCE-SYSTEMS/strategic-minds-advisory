# Task Routing

## Routing order

1. Safety check
2. Budget check
3. Task type classification
4. Deterministic template availability
5. API need decision
6. Execution
7. Validation
8. Proof logging
9. Next action

## Task type rules

### invention_build
Use when a request should create a sandbox system, manifest, seed, route, dashboard panel, or validation workflow.

Default path:
- use deterministic generator
- create manifest and migration
- validate through shared dynamic route
- create proof issue

### validation
Use when checking deployed routes, workflows, migrations, dashboard sections, or proof records.

Default path:
- run existing workflow if available
- use branch alias proof URL
- log pass/fail
- create proof/blocker issue

### content_draft
Use when creating written launch content, social drafts, scripts, newsletter, or recap.

Default path:
- draft only
- no public publishing
- add approval gate

### stripe_product_idea
Use when creating product concepts, pricing, landing copy, and Stripe setup notes.

Default path:
- create draft product record
- no Stripe activation without approval

### simulated_portfolio_update
Use only for paper/simulated portfolio updates.

Default path:
- label simulated
- no real trades
- log rationale and risk

### opportunity_scan
Use when identifying trends, market pain, and build opportunities.

Default path:
- use available internal data first
- create handoff if current web research is required and no connector/API is available

### social_asset_draft
Use for thumbnails, banners, image prompts, and visual concepts.

Default path:
- prompt/draft first
- cost-estimate generation
- approval gate before expensive generation or publishing

### video_script_draft
Use for YouTube/TikTok/Reels scripts.

Default path:
- script/storyboard only
- approval gate before generated video or upload

### image_prompt_draft
Use for prompts and visual specs.

Default path:
- create prompt and metadata
- approval gate before high-cost image generation

### dashboard_update
Use when updating public challenge dashboard, proof dashboard, or internal admin console.

Default path:
- update frontend from existing proof/ledger state
- validate build/deploy

### blocker_review
Use when a task failed or needs human/admin action.

Default path:
- summarize exact blocker
- propose safest next action
- create GitHub issue

### gpt_plus_handoff
Use when API budget/complexity is exceeded.

Default path:
- create exact copy/paste prompt
- include repo state, evidence, desired output, and next action
- stop worker
