# AI Invention Factory Generator

Purpose: turn a plain-English system idea into a standardized same-repo sandbox package.

## Current proof pattern

Every generated invention must create or update these surfaces:

- GitHub proof issue
- Supabase proof seed migration
- frontend panel
- backend API route
- validation workflow
- Vercel deploy bridge command
- validation proof issue

## Safety contract

- Sandbox-only until explicitly promoted.
- No public publishing without approval.
- No paid API activation without approval.
- No real-money trading.
- No secret values in code, issues, logs, or frontend.
- New repo creation is allowed only after same-repo proof is stable.

## Standard generated routes

- Frontend panel: `src/components/generated/<ComponentName>.jsx`
- API route: `api/sandbox/generated/<slug>.js`
- Supabase seed: `supabase/migrations/<timestamp>_<slug>_seed.sql`
- Manifest: `.ai-ops/inventions/<slug>.json`
- Validation workflow: `.github/workflows/validate-generated-<slug>.yml`

## Next use

The generator workflow receives a small JSON request and creates the scaffold package. A separate validation workflow proves the API route after Vercel deployment.
