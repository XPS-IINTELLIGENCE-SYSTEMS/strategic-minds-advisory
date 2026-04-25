# System Architecture

## Overview

AI in Action Labs uses a controlled, auditable architecture.

```text
User / GPT / Schedule
        ↓
GitHub Issues / Project Board
        ↓
GitHub Repo + Actions
        ↓
Supabase Database
        ↓
Vercel Dashboard
        ↓
Reports / Videos / Content
```

## GitHub

GitHub is the system ledger.

Stores source code, migrations, docs, issues, PRs, implementation history, experiment repos, sandbox repos, and templates.

Primary repo:

```text
XPS-IINTELLIGENCE-SYSTEMS/strategic-minds-advisory
```

Project board:

```text
@XPS-ADMIN-COMMAND
```

## Supabase

Supabase is the backend.

Used for auth, public dashboard state, source receipts, paper trading logs, AI runs, schedules, avatar personas, media jobs, strategy simulations, risk flags, and approval queue.

Primary table groups:

```text
paper_portfolio_snapshots
paper_trades
asset_price_checks
content_packages
source_links
platform_logs
ai_labs
ai_schedules
ai_schedule_runs
ai_runs
ai_source_receipts
ai_strategy_simulations
ai_interest_topics
ai_avatar_personas
ai_media_jobs
ai_approval_queue
ai_risk_flags
```

## Vercel

Vercel is the production frontend and serverless runtime.

Used for React/Vite deployment, public AI in Action dashboard, Groq API route, health route, future scheduled/cron routes, and source-safe serverless operations.

## Groq

Groq is used for fast AI generation through a server-side route.

Use cases include script generation, report writing, summarization, content package creation, lab narration, and AI persona output.

Private keys must stay server-side.

## Google Drive

Drive stores operating docs, strategy docs, content plans, long-form notes, system memory exports, and checklists.

Drive is useful for human-readable operations, but it is not the primary production database.

## Gmail

Gmail is used for setup checklists, report delivery, daily summaries, and human instructions.

Gmail is not the system of record.

## GPT Scheduler

GPT Scheduler is useful for recurring report prompts, education summaries, content prompts, reminders, and optimization reviews.

It should not be the only backend for guaranteed live data capture, guaranteed database writes, browser screenshots, production deployment control, or secrets management.

## Correct Backend Pattern

```text
Cron / scheduled backend
-> source validation
-> Supabase write
-> dashboard display
-> GPT explanation
-> content package
-> human review
```
