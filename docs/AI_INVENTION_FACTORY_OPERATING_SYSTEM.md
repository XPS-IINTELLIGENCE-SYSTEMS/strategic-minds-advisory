# AI Invention Factory Operating System

## Purpose

AI in Action should let the user describe any software, automation, education, business, media, research, trading-simulation, or workflow system in plain English. The platform then converts that idea into a controlled sandbox work package, validates it with GitHub-native tools, exposes proof through Supabase/Vercel/dashboard surfaces, and reports results.

This system is designed for safe invention, not unsafe unrestricted autonomy.

## Plain-English Intake Contract

The user may type requests such as:

- "Create a dashboard for local lead generation experiments."
- "Build a paper-trading lesson simulator with source receipts."
- "Make an AI content lab for avatar video experiments."
- "Create a customer onboarding workflow for a service business."
- "Build a system that teaches people how to validate business ideas."

The user does not need to use a rigid phrase.

## Standard Pipeline

1. Interpret the user's plain-English system request.
2. Create a structured invention file under `.ai-ops/inventions/`.
3. Let `AI Invention Intake` create a GitHub issue work package.
4. Build or update same-repo sandbox components first.
5. Add or update Supabase schema only if needed.
6. Add or update API routes only if needed.
7. Add dashboard proof and status visibility.
8. Run Supabase migrations if schema changed.
9. Run health and cron validation through `AI in Action Next Pipeline`.
10. Log proof to GitHub issues and Supabase tables.
11. Email report if `RESEND_API_KEY` is configured; otherwise log to Supabase notifications.
12. Require human approval before production promotion, paid APIs, new repo creation, or public publishing.

## Safe Build Scope

Default mode: same-repo sandbox.

Allowed by default:

- frontend sandbox components
- API routes
- Supabase migrations
- dashboard panels
- docs
- GitHub issues
- GitHub Actions validation
- Vercel deployment checks
- Supabase proof records
- email/log reports

Requires approval:

- new repository creation
- production promotion
- public publishing
- paid API activation
- destructive database operations
- real-money trading or financial account access
- sensitive-data ingestion

## Quality Standard

Every system should include:

- user-facing purpose
- frontend view or clear explanation why no frontend is needed
- backend route or clear explanation why no backend is needed
- Supabase table or clear explanation why no table is needed
- validation run
- proof record
- failure mode
- next AI action
- next human action
- safety notes

## Proof Standard

A system is not considered proven until there is evidence for:

- repository commit
- build or validation run
- route/API status if applicable
- Supabase write/read if applicable
- dashboard visibility if applicable
- Vercel deployment if applicable
- report logged or emailed

## Reporting Standard

Reports go to:

- strategicmindsadvisory@gmail.com
- j.xpsxpress@gmail.com

Email provider:

- Preferred: `RESEND_API_KEY`
- Optional: `REPORT_EMAIL_FROM`

If email is not configured, reports must be logged into Supabase notifications instead of silently failing.

## Autopilot Mode

`AI Invention Autopilot` may generate safe sandbox ideas and queue them through intake.

It may not:

- publish externally
- create paid charges
- create repos unless explicitly allowed later
- trade real money
- bypass approval gates
- expose secrets

## Operational Goal

The long-term target is a visible invention factory where AI can generate ideas, build them in a sandbox, validate them, show proof, learn from failures, and package the best systems for human approval.
