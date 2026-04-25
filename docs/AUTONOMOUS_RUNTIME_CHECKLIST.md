# AI in Action Runtime Checklist

## Purpose

This checklist describes the automation layer for AI in Action Labs. The platform should run scheduled education, source-checking, reporting, content-drafting, and dashboard logging with safe fallback behavior.

## Implemented Scheduled Routes

| Route | Cadence | Purpose |
|---|---:|---|
| `/api/cron/market-check` | every 15 minutes | Checks the market watchlist, logs source results, and creates a paper-trading education summary. |
| `/api/cron/platform-health` | every 30 minutes | Checks runtime readiness and logs platform health. |
| `/api/cron/daily-summary` | daily 9:00 | Creates a daily AI in Action operating summary. |
| `/api/cron/content-package` | daily 17:00 | Creates content package drafts and media-job entries for review. |

## Automation Surfaces

- Vercel Cron is configured in `vercel.json`.
- GitHub Actions failover is configured in `.github/workflows/ai-in-action-cron-failover.yml`.
- Runtime health is exposed through `/api/health`.
- Scheduled runs are stored in Supabase when server-side Supabase configuration is available.
- The dashboard falls back safely before live Supabase tables are available.

## Required Configuration Names

Use secure platform settings for real values. Do not commit real values.

Public browser reads:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

Server-side database writes:

- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

AI generation:

- `GROQ_API_KEY`
- `GROQ_MODEL`

Market data:

- `FINNHUB_API_KEY`

Cron route protection:

- `CRON_SECRET`

GitHub Actions failover:

- `AI_IN_ACTION_BASE_URL`
- `CRON_SECRET`

Future media generation:

- `HEYGEN_API_KEY`
- `HEYGEN_DEFAULT_AVATAR_ID`
- `HEYGEN_DEFAULT_VOICE_ID`

## Runtime Modes

### Fallback Mode

The app still renders. Scheduled routes return JSON. Missing services are reported directly. No unavailable data is invented.

### Write-Capable Mode

Server-side Supabase configuration is available and migrations are applied. Scheduled routes can write logs, source receipts, content packages, and run records.

### AI-Generation Mode

Groq configuration is available. Scheduled routes can create summaries, scripts, and education packages.

### Controlled Autonomy Mode

Scheduled triggers, Supabase writes, AI generation, market data checks, and dashboard logging are available. Human approval is still required for public publishing, paid service activation, account changes, and high-risk claims.

## Safety Rules

- Keep real configuration values in platform settings only.
- Keep trading content educational and simulated.
- If a price cannot be verified, write `Price unavailable from verified source.`
- Do not record simulated trades without a source-backed entry, stop, target, size, thesis, and invalidation level.
- Keep public content clear about simulation, uncertainty, and review status.
- Require review before public publishing.

## Operator Checklist

1. Apply Supabase migrations.
2. Verify tables exist.
3. Add Vercel environment variables.
4. Add GitHub Actions secrets.
5. Confirm `/api/health` status.
6. Confirm `/api/cron/platform-health` creates a run record.
7. Confirm `/ai-in-action` dashboard switches from fallback to live data mode.

## Next Build Sequence

1. Source Receipts Engine.
2. Discovery Lab schema and dashboard.
3. Tool Intelligence Registry.
4. Lab lifecycle state machine.
5. Approval Queue UI.
6. HeyGen-ready media job integration.
7. GitHub issue-to-dashboard sync.
8. Source-backed topic ranking and content calendar.
