# AI in Action Labs Control Pipeline

## Purpose

AI in Action Labs is designed to let humans watch AI perform useful work in public while humans approve secrets, review risks, and assist when necessary. The system should not depend on Base44 lock-in. The preferred production spine is GitHub, Vercel, Supabase, Groq, Google Drive, Gmail, and GPT scheduled tasks.

## Core Principle

Humans control secrets. AI controls repeatable work. GitHub records the work. Supabase stores operational data. Vercel displays the platform. GPT explains the work.

## Current Connected System

- GitHub stores source code, migrations, workflows, docs, and reusable templates.
- GitHub Actions applies Supabase database migrations when configured with repository secrets.
- Vercel deploys the React/Vite frontend from GitHub.
- Supabase stores backend tables for paper portfolio snapshots, trades, price checks, source links, content packages, and platform logs.
- Groq is available through a Vercel serverless route for AI generation.
- Google Drive stores master operating docs, content calendar, and report logs.
- Gmail sends reports and operating checklists.
- GPT scheduled tasks generate educational reports, content packages, and optimization reviews.

## Backend Role of Supabase

Supabase is the system of record for live platform state. It should hold facts and logs, not private keys.

Required tables:

- paper_portfolio_snapshots: portfolio state over time.
- paper_trades: simulated trade ledger.
- asset_price_checks: exact price checks and source links.
- content_packages: scripts, posts, thumbnails, and video prompts.
- source_links: validation URLs and proof references.
- platform_logs: system events, blockers, and status updates.

## Safe Secret Handling

Never put passwords, access tokens, service-role keys, or private API keys into ChatGPT, email, Google Docs, or committed files.

Use these locations only:

- GitHub Actions Secrets for migration automation.
- Vercel Environment Variables for runtime app configuration.
- Supabase Dashboard for Supabase-native settings.
- Password manager for human retrieval.

## Migration Automation

The repo includes:

- .github/workflows/supabase-migrations.yml
- supabase/migrations/202604240001_ai_in_action_schema.sql

Required GitHub repository secrets:

- SUPABASE_ACCESS_TOKEN
- SUPABASE_PROJECT_ID
- SUPABASE_DB_PASSWORD

When these are configured, pushing files under supabase/migrations should let GitHub Actions run Supabase CLI and apply the database migrations.

## Human-in-the-Loop Operating Model

The human should assist only at control points:

1. Add or rotate secrets.
2. Approve high-risk writes.
3. Review failed migrations.
4. Review deployment failures.
5. Confirm public claims and compliance language.
6. Decide whether content is ready to publish.

The AI can handle:

1. Writing migration files.
2. Writing app code.
3. Writing docs.
4. Generating reports.
5. Generating content packages.
6. Creating source logs.
7. Explaining failures.
8. Creating GitHub issues and implementation backlogs.

## Production Data Flow

1. A scheduled process checks live data sources.
2. The process writes exact prices, source links, and proof notes to Supabase.
3. The dashboard reads Supabase public rows.
4. GPT scheduled tasks generate email reports and social content from the latest state.
5. Humans review exceptions and publish selected outputs.

## GPT Scheduler Role

GPT scheduled tasks should be used as an education and content layer, not as the only production backend. They are useful for:

- report generation
- content package creation
- weekly recaps
- optimization reviews
- teaching narration

They are not reliable enough alone for:

- guaranteed live price capture
- browser screenshots every 15 minutes
- database migrations
- secret management
- full app deployment control

## Template Repo Extraction Plan

The proofloops repository is a rich Base44-origin app containing useful UI and operating concepts, including dashboards, automation builders, scraper dashboards, prompt libraries, content studios, source libraries, analytics hubs, and campaign simulation pages. These patterns should be extracted selectively into AI in Action Labs without reintroducing Base44 runtime lock-in.

Preferred extraction targets:

1. Automation Builder pattern.
2. Prompt Library pattern.
3. Sources Library pattern.
4. Data Explorer pattern.
5. Market Intelligence dashboard pattern.
6. Content Repurposer pattern.
7. Campaign Monitoring pattern.
8. Simulation pattern.

Extraction rule:

- Keep useful React components, layouts, naming patterns, and UX concepts.
- Replace Base44 SDK/API calls with Supabase/Groq/Vercel adapters.
- Preserve zero-key fallback behavior.
- Do not copy secrets or Base44-specific runtime dependencies.

## Next Implementation Backlog

1. Confirm GitHub Actions secrets are present.
2. Run Supabase migration workflow.
3. Verify Supabase tables exist.
4. Create a serverless writer endpoint for platform logs.
5. Create a serverless writer endpoint for price checks.
6. Wire dashboard reads to Supabase data adapter.
7. Add a public System Status panel.
8. Add a public Source Receipts panel.
9. Add AI Work Log page.
10. Extract reusable UI patterns from proofloops.
11. Add admin-only controls later if authentication is required.

## Compliance Rule for Paper Trading

All financial-market content must remain educational and simulated unless a licensed system and explicit user authorization are established. The platform must not claim guaranteed profits, real-money performance, or personalized investment advice. No fake prices, fills, screenshots, source links, entries, exits, or results are allowed.
