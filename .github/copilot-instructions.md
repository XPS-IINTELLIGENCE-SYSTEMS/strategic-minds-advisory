# Copilot Instructions — AI in Action Labs

## Project Identity

This repository powers **AI in Action Labs**, a controlled autonomous AI education platform. The goal is to let viewers watch AI research, simulate, build, validate, explain, and package useful systems while humans control secrets, approvals, publishing, and high-risk actions.

## Primary Stack

- Frontend: React / Vite
- Deployment: Vercel
- Backend: Supabase
- AI route: Groq through server-side API routes
- Task ledger: GitHub Issues / PRs / Project board
- Docs: `/docs`
- Migrations: `/supabase/migrations`

## Non-Negotiable Rules

1. Do not commit secrets, API keys, tokens, passwords, service-role keys, or private credentials.
2. Do not fabricate prices, fills, trades, source links, screenshots, revenue, performance, or deployment status.
3. Do not represent paper trading as real-money performance.
4. Do not claim guaranteed wealth, guaranteed trading profits, or guaranteed business outcomes.
5. Do not import uploaded/template systems wholesale. Extract only useful, safe, stack-aligned pieces.
6. Prefer small, reviewable changes over giant rewrites.
7. Keep Supabase as the backend/source of runtime truth.
8. Keep GitHub Issues as the AI-readable task ledger.
9. Use Vercel-compatible serverless code. Do not add persistent local daemons unless explicitly approved.
10. Add human approval gates for publishing, destructive migrations, paid APIs, sensitive data, or risky claims.

## Current Mission

Implement a 24/7 controlled AI-in-action simulation and teaching platform with:

- AI Paper Trading Lab
- AI Digital Business Builder
- AI Avatar Media Studio
- Source Receipts Engine
- AI System Memory
- Tool Intelligence Registry
- AI Discovery Lab
- Cron/scheduled backend runs
- Deployment and dashboard validation monitor
- Human approval queue

## Existing Migrations

Review before modifying:

- `supabase/migrations/202604240001_ai_in_action_schema.sql`
- `supabase/migrations/202604240002_ai_operating_loop.sql`

Important existing tables include:

- `paper_portfolio_snapshots`
- `paper_trades`
- `asset_price_checks`
- `content_packages`
- `source_links`
- `platform_logs`
- `ai_labs`
- `ai_schedules`
- `ai_schedule_runs`
- `ai_runs`
- `ai_source_receipts`
- `ai_strategy_simulations`
- `ai_interest_topics`
- `ai_avatar_personas`
- `ai_media_jobs`
- `ai_approval_queue`
- `ai_risk_flags`

## Existing Frontend Files

Review before modifying:

- `src/pages/AIInActionLabs.jsx`
- `src/components/AIOperatingLoopPanel.jsx`
- `src/lib/aiOperatingLoopData.js`
- `src/lib/aiInActionData.js`
- `src/lib/supabaseClient.js`

## Existing Docs to Read First

- `docs/AI_IN_ACTION_CONTROL_PIPELINE.md`
- `docs/INFINITY_STACK_SELECTION_FOR_AI_IN_ACTION.md`
- `docs/TEMPLATES_MAIN_INGESTION_REPORT.md`
- `docs/ADVANCED_SYSTEMS_TRIAGE_DOC_EVOLUTION_AND_GITOPS.md`
- `docs/STACK_TRIAGE_2026_04_25.md`
- `docs/project-board/PROJECT_README.md`
- `docs/wiki/*`

## Uploaded System Decisions

Use these decisions when extracting patterns:

- `Xps-scraper-main`: USE NOW for safe Source Receipts Engine. Do not use key/token harvesting or evasion.
- `infinity-core-memory-main`: USE NOW for persistent AI system memory and rehydration concepts.
- `infinity-tools-main`: USE NOW for tool/cost intelligence taxonomy, with current verification before publishing.
- `infinity-experiments-main`: USE LATER / SELECTIVE for lifecycle state machine.
- `infinity-discovery-main`: USE LATER for public trend/source discovery only.
- `infinity-kernel-main`: SELECTIVE for taxonomy, guardrails, topology, and execution doctrine.
- `claw-template-main`: REFERENCE ONLY for UI ideas.

## Implementation Priorities

Follow GitHub Issues in order when possible:

1. Verify Supabase migrations.
2. Implement System Memory backend.
3. Implement Source Receipts Engine.
4. Implement Deployment and Dashboard Validation Monitor.
5. Implement Lab Lifecycle state machine.
6. Implement Tool Intelligence Registry.
7. Implement Discovery Lab.
8. Implement Avatar Media Studio / HeyGen-ready workflow.
9. Implement real cron automation.
10. Implement sandbox/experiment repo registry.

## Coding Standards

- Keep changes minimal and focused.
- Add fallback UI states for missing Supabase data.
- Do not break static fallback mode.
- Use `safeSelect` pattern for public reads where possible.
- Prefer explicit tables and clear JSONB fields over opaque blobs.
- Add RLS policies for public dashboard rows using `is_public = true`.
- Store operational errors as visible state, not hidden console-only failures.

## Financial Education Rules

All trading modules are educational and simulated.

Required wording:

> Educational paper-trading simulation only. Not financial advice. No guaranteed results. No real-money performance is claimed.

A simulated trade cannot be recorded unless it has:

- verified source price
- source URL
- timestamp
- entry price
- stop price
- target price
- position size
- thesis
- invalidation level
- risk amount

If a price cannot be verified, use:

> Price unavailable from verified source.

## Source Receipts Rules

The Source Receipts Engine may store:

- URL
- title
- source type
- retrieval timestamp
- verification status
- robots/rate-limit status
- quote text
- proof notes
- optional snapshot metadata

It must not store:

- API keys
- tokens
- JWTs
- passwords
- hidden secrets
- private user data
- scraped content that violates source terms

## PR Expectations

Every PR should include:

- summary
- files changed
- risk level
- validation steps
- screenshots or route notes when relevant
- Supabase migration notes if applicable
- no-secret confirmation
- no-fabrication confirmation

## Preferred Done Definition

A feature is done only when:

- code is committed
- migrations are versioned
- Vercel build status is known
- Supabase live/fallback behavior is clear
- dashboard has a visible state
- docs/issues are updated
- no secrets are exposed
- no fake claims are introduced
