# @XPS-ADMIN-COMMAND

## Mission

@XPS-ADMIN-COMMAND is the active command board for AI in Action Labs.

The mission is to build a controlled, observable, 24/7 AI-in-action platform where AI can research, simulate, build, validate, explain, and document useful systems while humans observe, learn, and assist only when necessary.

The first flagship lab is the AI Paper Trading Lab: a $50,000 simulated paper-trading account that teaches market literacy, risk management, trade journaling, source verification, and no-fake-fill discipline.

The broader platform expands into paper trading, digital business building, AI automation agencies, faceless/avatar content channels, local lead generation, digital products, AI media production, source-backed wealth-building education, strategy simulations, low-cost startup systems, and open-source or low-cost workflows.

## Core Operating Principle

AI may operate continuously, but it must remain controlled.

AI can research, draft, build, simulate, document, create issues, create pull requests, write migrations, generate reports, generate content packages, explain decisions, identify blockers, and propose next actions.

Humans control secrets, passwords, API keys, Supabase service roles, production approvals, publishing approval, financial-market claims, irreversible actions, and real-money actions.

## System Spine

```text
GitHub -> source code, issues, PRs, migrations, docs, task ledger
GitHub Project -> visual command board
GitHub Actions -> Supabase migrations and automation checks
Vercel -> frontend deployment and serverless routes
Supabase -> backend database, auth, storage, state, logs, schedules
Groq -> AI inference through serverless routes
Google Drive -> operating docs and source-of-truth planning
Gmail -> email reports and human-readable output
GPT Scheduler -> teaching/reporting/content layer
```

## Board Purpose

This board tracks all AI in Action work across production, sandbox, and experiment repos.

Every work item should answer:

1. What is AI trying to build or learn?
2. What repo or system is affected?
3. What data/source proves the work?
4. What is the current status?
5. What is blocked?
6. What does the human need to do?
7. What is the next AI action?
8. What is the done definition?

## Recommended Board Statuses

1. Inbox
2. Triage
3. Selected for Build
4. Building
5. Needs Human Input
6. Validation
7. Ready to Deploy
8. Deployed
9. Monitoring
10. Blocked
11. Done

## Standard Labels

```text
ai-in-action
lab:paper-trading
lab:digital-business
lab:media-studio
supabase
vercel
github-actions
frontend
backend
content
source-receipts
human-input-needed
blocked
risk:high
risk:medium
risk:low
safe-to-build
needs-validation
deployed
```

## Work Item Template

```markdown
# Objective

What should AI build, simulate, validate, or explain?

# Repo / System

- Repo:
- App:
- Database:
- Deployment:
- Related docs:

# Current State

What exists now?

# Desired State

What should exist when done?

# Files / Tables / Routes Affected

- Files:
- Supabase tables:
- API routes:
- Vercel routes:
- Docs:

# Risk Level

Low / Medium / High

# Human Approval Required?

Yes / No

If yes, explain why.

# Validation Steps

- [ ] Code committed
- [ ] Vercel build passes
- [ ] Supabase migration applied
- [ ] Dashboard renders
- [ ] No secrets exposed
- [ ] No fake claims
- [ ] Human review complete if required

# Done Definition

What must be true before this is closed?

# Next AI Action

What should AI do next?
```

## AI in Action Safety Rules

### No fake proof

AI must not fabricate prices, trades, fills, screenshots, source links, user results, income claims, revenue claims, testimonials, deployment status, or database status.

If something cannot be verified, AI must say so directly.

### Paper trading rule

All trading content is educational and simulated unless a separate licensed, real-money system exists.

Required language:

```text
Educational paper-trading simulation only. Not financial advice. No guaranteed results. No real-money performance is claimed.
```

### Wealth-building rule

AI may teach strategies, simulations, workflows, and business models, but must not claim guaranteed wealth, guaranteed income, or personalized financial outcomes.

### Secret rule

Never place secrets in issues, PRs, comments, docs, code, emails, or ChatGPT messages.

Secrets belong only in GitHub Actions Secrets, Vercel Environment Variables, Supabase settings, and a password manager.

## Current Priority Stack

### Priority 1 - Supabase backend

- apply migrations
- verify tables
- seed AI operating-loop data
- connect dashboard panels to live Supabase reads

### Priority 2 - AI Operating Loop

- AI labs
- schedules
- runs
- source receipts
- strategy simulations
- avatar personas
- media jobs
- risk flags
- approval queue

### Priority 3 - Public Dashboard

- AI System Status
- AI Work Log
- Source Receipts
- Paper Trading Lab
- Digital Business Builder
- Avatar Media Studio
- Human Approval Queue

### Priority 4 - Content Engine

- email reports
- YouTube scripts
- short-form video scripts
- avatar video prompts
- thumbnail prompts
- newsletters
- social posts

### Priority 5 - Sandbox / Experiment Repos

Every new repo must be classified as production-linked, sandbox, experiment, template-source, reference-only, or deprecated.

## North Star

The board exists to make AI work visible.

The audience should be able to watch AI decide what to do, gather evidence, build systems, simulate outcomes, detect problems, avoid fake claims, explain the process, create useful educational content, and improve recursively.

The goal is controlled autonomy, visible work, truthful education, and human approval where needed.
