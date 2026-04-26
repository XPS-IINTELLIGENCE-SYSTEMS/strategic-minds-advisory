# First Sandbox Test Preflight

## Current Readiness

The system is close to first controlled test readiness, but the first test should not be treated as successful until these checks pass.

## Proof Domain

Initial proof domain:

`https://strategicmindsadvisory.com`

This is the starting public proof surface. Later, once the system proves itself, the AI in Action brand/domain can be added as a separate public surface.

## Required Before First Test

1. Supabase migrations are current.
2. Vercel deployment is using latest main branch commits.
3. Health workflow uses `https://strategicmindsadvisory.com` by default, unless `AI_IN_ACTION_BASE_URL` overrides it.
4. `/api/health` returns JSON.
5. `/api/sandbox/status` returns JSON.
6. `/ai-in-action` renders without a white screen.
7. Sandbox request tables exist:
   - `ai_invention_requests`
   - `ai_invention_runs`
   - `ai_invention_proofs`
8. Reports are either emailed through configured email provider or logged to Supabase notifications.

## First Test Scope

Use a low-risk system request:

`Create an AI skill drill coach that teaches one useful skill with a frontend lesson panel, backend status route, Supabase proof records, and a validation report.`

## Success Criteria

- Invention intake issue is created.
- Sandbox request is recorded.
- Dashboard shows the request or fallback state clearly.
- Health check passes or gives a clear missing-config reason.
- No secrets are exposed.
- No public publishing occurs.
- A report is logged or emailed.

## Known Blocker To Check

Issue #23 shows health check failed. Most likely causes:

- Strategic Minds Advisory domain is not pointing to the latest Vercel deployment.
- Vercel production deployment has not caught up to latest main branch.
- `/api/health` is unreachable from GitHub Actions.
- `CRON_SECRET` mismatch if protection is enabled.
- `AI_IN_ACTION_BASE_URL` points elsewhere and overrides the default proof domain.

## Decision

Run the first sandbox test only after health and migration preflight pass. If health remains blocked, fix health before testing inventions.
