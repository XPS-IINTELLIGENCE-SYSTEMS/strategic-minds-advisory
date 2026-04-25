# Infinity Stack Selection for AI in Action Labs

## Source Reviewed

Uploaded archive: `infinity-stack-main.zip`

## Mission Fit

The archive is a large autonomous stack with agents, API services, scraper utilities, scheduler services, memory systems, financial/simulation modules, governance guardrails, taxonomies, and system-index files.

It should not be imported wholesale. It should be mined for controlled, observable, Supabase-backed AI-in-action capabilities.

## Decision

Accepted for selective extraction.

Rejected for wholesale import.

## Best Assets to Use Now

### 1. Scheduler Concept

Source patterns:

- `api/schedulerService.js`
- `api/scheduler.js`
- `api/admin.js`

Use in AI in Action:

- Do not rely on in-process `setInterval` inside Vercel for production cron.
- Use the job model as a design pattern for Supabase tables and Vercel Cron / GitHub Actions / Supabase scheduled functions.

Adaptation:

- `ai_schedules`
- `ai_schedule_runs`
- `run_status`
- `last_run_at`
- `next_run_at`
- `run_count`
- `failure_reason`

### 2. Proof Capture / Screenshot Concept

Source patterns:

- `api/screenshot.js`
- `api/snapshot.js`
- `api/render.js`
- `api/pdf.js`

Use in AI in Action:

- Create proof-oriented source receipts.
- Capture snapshots only where terms and robots rules allow it.
- Store proof metadata in Supabase and proof artifacts later in Supabase Storage.

Adaptation:

- `ai_source_receipts`
- fields: URL, title, source type, retrieved text, snapshot URL, verification status, robots status, crawl timestamp.

### 3. Robots and Rate-Limit Compliance

Source patterns:

- `api/robotsChecker.js`
- `api/rateLimiter.js`
- `api/proxyManager.js`

Use in AI in Action:

- This is critical for the scraping apps the user plans to upload.
- AI should not scrape aggressively or ignore robots and rate limits.

Adaptation:

- Add source-policy metadata per source.
- Log whether a source was fetched, skipped, blocked, rate-limited, or manually reviewed.

### 4. Guardrail System

Source pattern:

- `core/guardrails.py`

Use in AI in Action:

- Enforce no fake financial prices, no fake fills, no unsafe claims, no secret leakage, no guaranteed wealth claims.
- Require human approval for publishing, paid offers, real-money claims, account connection, or high-risk financial content.

Adaptation:

- `ai_approval_queue`
- `ai_risk_flags`
- `compliance_status`
- `claim_type`
- `human_approved_at`

### 5. Monte Carlo / Simulation Engine

Source patterns:

- `core/monte_carlo.py`
- `agents/simulation_orchestrator.py`
- `core/predictor.py`

Use in AI in Action:

- Simulate multiple possible outcomes for business ideas, paper-trading paths, content virality, and bottlenecks.
- Do not present simulations as predictions or guarantees.

Adaptation:

- `ai_strategy_simulations`
- fields: scenario name, parameters, p5/p50/p95, assumptions, risk score, interpretation, disclaimers.

### 6. Trend Detection / Strategy Synthesis

Source patterns:

- `agents/trend_detector.py`
- `agents/strategy_synthesizer.py`
- `agents/auto_recommend_director.py`
- `core/visionary.py`
- `core/financial_expert.py`

Use in AI in Action:

- Track topics people want to learn now.
- Convert public-interest signals into educational lab ideas.
- Rank top wealth-building and digital-business topics.

Adaptation:

- `ai_interest_topics`
- `ai_trend_signals`
- `ai_strategy_briefs`

Initial topic families:

1. paper trading and market literacy
2. AI automation agency
3. local lead generation
4. digital products
5. content monetization
6. affiliate systems
7. e-commerce validation
8. real estate deal analysis
9. high-income skill acquisition
10. business acquisition simulation
11. newsletter/media business
12. prompt/tool marketplace
13. AI avatar content channels
14. low-cost SaaS microtools
15. career upgrade systems
16. licensing and templates
17. YouTube faceless channels
18. data-driven niche selection
19. government grants/contracts education
20. personal finance and debt acceleration

### 7. Report Composer

Source pattern:

- `agents/report_composer.py`

Use in AI in Action:

- Turn runs into reports, emails, video scripts, newsletters, and public lessons.

Adaptation:

- `ai_content_packages`
- `ai_media_assets`
- `ai_email_reports`

### 8. Memory and System Index

Source patterns:

- `.infinity/ACTIVE_MEMORY.md`
- `03_core-memory/*`
- `memory/rehydration.py`
- `memory/snapshot_builder.py`
- `99_system-index/*`

Use in AI in Action:

- Persistent memory must live in Supabase and GitHub docs, not only in chat memory.
- The dashboard should show what AI knows, what it did, what failed, and what humans need to do next.

Adaptation:

- `ai_system_state`
- `ai_run_memory`
- `ai_decision_log`
- `ai_blockers`

### 9. Taxonomies

Source patterns:

- `10_taxonomy/agent-taxonomy.json`
- `10_taxonomy/document-taxonomy.json`
- `10_taxonomy/governance-taxonomy.json`
- `10_taxonomy/industry-taxonomy.json`
- `10_taxonomy/system-type-taxonomy.json`

Use in AI in Action:

- Categorize labs, agents, content types, proof types, risk levels, and industry tracks.

Adaptation:

- seed taxonomy values into Supabase later.

## Use Later

### AI Provider / LLM Connectors

Source patterns:

- `core/llm_client.py`
- `core/llm_connectors.py`

Use later to design provider routing. Current production already has a Vercel Groq route.

### Repo Scanner and Workflow Analyzer

Source patterns:

- `core/repo_scanner.py`
- `core/workflow_analyzer.py`

Use later for platform self-audits and build-failure explanations.

### Browser Pool

Source pattern:

- `api/browserPool.js`

Use later only if deployed to an environment that supports long-running browser workers. Vercel serverless is usually not ideal for persistent browser pools.

## Reject / Hold for Now

Do not import now:

- auto-healer
- auto-merge orchestrator
- broad autonomy controller
- stealth scraping mode
- proxy manager for evasion
- local mesh systems
- PowerShell system indexers
- kernel rollback/snapshot scripts
- maximum-permission orchestration
- full Python agent runtime
- full Next.js stack if current app remains Vite

Reason:

These add complexity, risk, or incompatible runtime assumptions before the core AI in Action product is stable.

## HeyGen / AI Avatar Direction

The uploaded stack does not appear to include a ready HeyGen integration. The correct integration path is:

1. Use Supabase to store avatar personas, scripts, and media jobs.
2. Use a Vercel serverless route or external worker to submit approved scripts to HeyGen.
3. Store generated video URLs and metadata in Supabase.
4. Display videos and production status in the AI in Action dashboard.
5. Require human review before public publishing until compliance and brand style are mature.

Recommended persona model:

- credible mentor
- witty operator
- calm risk manager
- energetic builder
- skeptical validator
- creative media strategist

Each persona should have:

- name
- role
- tone
- allowed topics
- disallowed claims
- disclosure language
- voice ID
- avatar ID
- safety notes

## GPT Agent Builder / Workflows Direction

If GPT Agent Builder or workflow tools are available in the user’s account, integrate them as an operator-facing layer, not as the system of record.

Preferred role:

- Generate specs.
- Trigger GitHub issues.
- Draft scripts.
- Review reports.
- Explain results.

Do not use them as the only backend for cron, database writes, secrets, or live data capture.

## Target Platform Architecture

1. Cron / scheduled backend job runs.
2. Source validator checks public sources, robots policy, and rate limits.
3. Verified data is written to Supabase.
4. Simulation engine creates scenarios with assumptions and risk scores.
5. Strategy engine writes educational interpretation.
6. Report composer creates email/video/social packages.
7. Avatar job is queued for approved scripts.
8. Dashboard shows all work logs, source receipts, simulation outputs, and content jobs.
9. Human approves high-risk publishing and secrets.
10. System repeats continuously.

## Immediate Integration Decision

Add Supabase schema extension for:

- schedules
- schedule runs
- AI labs
- AI runs
- source receipts
- strategy simulations
- interest topics
- avatar personas
- media jobs
- approval queue
- risk flags

This gives the stack a durable backend without importing the entire archive.

## Final Verdict

Use this stack as the strongest source so far for:

- proof capture design
- source compliance design
- simulations
- trend detection
- strategy synthesis
- report composition
- system memory
- agent taxonomy
- controlled scheduling

Do not use it as a direct runtime import yet.
