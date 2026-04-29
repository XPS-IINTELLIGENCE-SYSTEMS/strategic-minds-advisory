# Strategic Minds Full System Audit

## Status

Current state: command-driven semi-autonomous system with active GitHub, Vercel deployment, Supabase-admin capability, validation reporting, safety doctrine, task routing, cost governance, and source receipt design.

Not yet ready for full 24/7 autonomy because the Supabase task queue is not fully verified. Runtime validation shows `/api/orchestrator` is blocked by missing `public.ai_tasks` in the Supabase schema cache.

This audit intentionally avoids XPS Contractor Success implementation. Contractor Success remains a future business/vision track. Current priority is hardening AI in Action for autonomous invention implications through same-repo sandbox operation.

## Primary Operating Identity

`strategicmindsadvisory@gmail.com`

## Primary Repo

`XPS-IINTELLIGENCE-SYSTEMS/strategic-minds-advisory`

## Primary Runtime

Vercel project: `strategic-minds-advisory`

## Mission

Strategic Minds Advisory / AI in Action is the working invention factory, sandbox, validation engine, and command-driven build system.

The immediate mission is to harden AI in Action so it can safely receive plain-English invention requests, convert them into sandbox work packages, validate them through GitHub/Vercel/Supabase, log proof, escalate risk, and continue through controlled next actions.

## Current Architecture

```text
GPT / command / schedule
→ GitHub issues + repo files
→ Vercel API routes + cron
→ Supabase tasks/logs/source receipts/approval queues
→ validation reports
→ human approval gates
→ next action
```

## Connected Systems

### GPT

Role:
- Command interface
- Planning and reasoning layer
- Prompt handoff layer
- Human-readable explanation layer

Current status:
- Active command layer
- Should not be treated as the only production backend

### Google Drive

Role:
- Human-readable long-form docs
- Strategy docs
- Training assets
- Operating documents

Current status:
- Connected through the Strategic Minds identity
- Needs structured inventory/index before being treated as reliable system memory

### Gmail

Role:
- Reports
- Alerts
- Approval requests
- Setup notifications

Current status:
- Connected
- Should not store secrets or operate as backend state

### Calendar

Role:
- Operating cadence
- Review schedule
- Launch milestones

Current status:
- Connected
- No verified operating cadence yet

### Contacts

Role:
- Future CRM/contact layer

Current status:
- Connected
- Not currently a developed operating database

### GitHub

Role:
- Source control
- Issues
- PRs
- Docs
- Audit trail
- Validation history
- System memory

Current status:
- Connected
- Primary repo accessible
- Supporting XPS Intelligence repos accessible

### Vercel

Role:
- Frontend runtime
- Serverless API routes
- Cron jobs
- Deployment
- Production validation

Current status:
- Strategic Minds Advisory project exists
- Latest deployment is READY
- Build runs from GitHub source

### Supabase

Role:
- Task queue
- Execution logs
- Source receipts
- Approval queue
- Runtime state
- Memory layer

Current status:
- Server-side Supabase admin env appears configured
- Runtime schema is not fully verified
- `/api/orchestrator` currently fails because `public.ai_tasks` is missing from the schema cache

## Critical Files Audited

- `docs/AI_INVENTION_FACTORY_OPERATING_SYSTEM.md`
- `.ai-ops/prompt-library/task-routing.md`
- `.ai-ops/prompt-library/cost-governance.md`
- `.ai-ops/prompt-library/safety-policy.md`
- `docs/SOURCE_RECEIPTS_ENGINE.md`
- `docs/ADMIN_REVIEW_QUEUE.md`
- `docs/SUPABASE_MIGRATION_ADMIN_RUNBOOK.md`
- `docs/SUPABASE_MIGRATION_RESOLUTION_REPORT.md`
- `api/_lib/supabaseAdmin.js`
- `api/_lib/cronUtils.js`
- `api/_lib/validators.js`
- `api/orchestrator.js`
- `api-orchestrator-v2.js`
- `api/self-heal.js`
- `api-self-heal.js`
- `api/system-verify.js`
- `api-system-verify.js`
- `api/agent-loop.js`
- `api/task-dispatch.js`
- `api-task-dispatch.js`
- `api/model-router.js`
- `api-model-router.js`
- `api/source-receipts.js`
- `ops/latest-system-validation.json`

## Existing Strengths

1. Clear invention-factory doctrine exists.
2. Same-repo sandbox is the default safe build mode.
3. Task routing order exists: safety, budget, classification, template check, execution, validation, proof logging, next action.
4. Cost governance exists and favors low-cost execution.
5. Safety policy exists and gates public, paid, secret, destructive, social, and real-money actions.
6. Source receipts engine exists and rejects malformed/private/internal URLs.
7. Admin review queue doctrine exists.
8. Vercel deployment is live and buildable.
9. Groq runtime appears configured.
10. Supabase admin connection appears configured, though schema is blocked.

## Blocker Map

| Blocker | Severity | Impact | Fix |
|---|---:|---|---|
| `public.ai_tasks` missing from Supabase schema cache | Critical | Orchestrator cannot run true task queue | Apply or repair Supabase migrations |
| `CRON_SECRET` missing | High | Manual endpoint protection weaker | Add Vercel env var |
| `ORCHESTRATOR_SECRET` may be unset | High | Orchestrator route less protected | Add Vercel env var |
| Vercel AI Gateway not configured | Medium | Preferred provider router unavailable | Use Groq first, add Gateway later |
| OpenAI runtime key not configured | Medium | Fallback reasoning unavailable in runtime | Add later only if ROI justifies |
| Source receipts table not verified | Medium | Proof logging may fall back | Verify `ai_source_receipts` |
| Admin review tables not verified | Medium | Human gate may be conceptual only | Verify `ai_approval_queue` and `ai_admin_reviews` |
| Google Drive not indexed | Medium | Human-readable assets are not reliable memory yet | Create Drive inventory/index |
| Calendar cadence missing | Low | No operating rhythm | Add cadence after autonomy backbone is stable |
| Contacts/CRM not developed | Low | No contact intelligence layer yet | Delay until product/customer track is active |

## Autonomy Readiness Scorecard

| Area | Score | Notes |
|---|---:|---|
| GitHub source control | 9/10 | Strong |
| Vercel deployment | 9/10 | Active and building |
| Vercel cron | 7/10 | Exists, needs secret hardening |
| Supabase admin | 6/10 | Configured but schema issue remains |
| Supabase task queue | 2/10 | `ai_tasks` blocker |
| Orchestrator | 4/10 | Code exists, blocked by DB |
| Self-heal | 6/10 | Good design, depends on tables |
| Agent loop | 5/10 | Safe inline mode works |
| Task dispatch | 4/10 | Simple sequential heartbeat |
| Model router | 6/10 | Groq available; Gateway/OpenAI missing |
| Source receipts | 7/10 | Good design, table verification needed |
| Admin review queue | 6/10 | Good doctrine, table/UI verification needed |
| Cost governance | 8/10 | Strong written controls |
| Safety governance | 8/10 | Strong written gates |
| Drive/Gmail operationalization | 5/10 | Connected, needs structure |
| 24/7 autonomy | 4/10 | Foundation exists, not fully proven |

## Supabase Repair Plan

1. Verify migration files exist:
   - `202604240001_ai_in_action_schema.sql`
   - `202604240002_ai_operating_loop.sql`
   - `202604250001_ai_system_memory.sql`
   - `202604250002_ai_autonomy_extensions.sql`

2. Verify GitHub Actions secrets:
   - `SUPABASE_ACCESS_TOKEN`
   - `SUPABASE_PROJECT_ID`
   - `SUPABASE_DB_PASSWORD`

3. Manually run:
   - GitHub Actions → Supabase Database Migrations → Run workflow

4. Verify required tables in Supabase SQL Editor:

   ```sql
   select table_name
   from information_schema.tables
   where table_schema = 'public'
   and table_name in (
     'ai_tasks',
     'ai_execution_logs',
     'ai_source_receipts',
     'ai_approval_queue',
     'ai_admin_reviews'
   )
   order by table_name;
   ```

5. If `ai_tasks` is missing, create a non-destructive repair migration.

6. Add Vercel environment variables:
   - `CRON_SECRET`
   - `ORCHESTRATOR_SECRET`

7. Redeploy.

8. Re-run `/api/system-verify`.

9. Confirm `/api/orchestrator` no longer fails.

## Human Approval Gates

Human approval required for:

- Secrets
- Paid tools
- Destructive migrations
- Real customer data
- Public claims
- Public publishing
- Financial/compliance claims
- Production deletes
- Irreversible changes
- Brand-risk decisions
- Production domain changes
- New repo creation

## Parallel Execution Rules

Allowed in parallel:

- Docs
- Strategy
- Audit artifacts
- GitHub issues
- Validation plans
- Frontend mockups
- Sandbox-only experiments

Not allowed in parallel without approval:

- Destructive migrations
- Secret changes
- Production domain changes
- Same-file edits from multiple branches
- Public publishing
- Paid API activation
- Production promotion

## Same-Repo Sandbox Rule

Default invention mode is same-repo sandbox. New inventions should first become:

1. A structured invention file under `.ai-ops/inventions/` or `.ai-ops/invention-queue/`.
2. A GitHub issue work package.
3. A docs or frontend sandbox component.
4. Optional API route only if needed.
5. Optional Supabase migration only if needed.
6. Validation report.
7. Source receipt or proof record.
8. Human approval before production promotion.

## AI in Action Hardening Next Build Path

Do not implement contractor success yet.

Priority sequence:

1. Verify Supabase migration files.
2. Repair/create `ai_tasks` and `ai_execution_logs`.
3. Add `CRON_SECRET` and `ORCHESTRATOR_SECRET` in Vercel.
4. Verify `ai_source_receipts`, `ai_approval_queue`, and `ai_admin_reviews`.
5. Rerun system validation.
6. Confirm orchestrator can seed and complete at least one safe task.
7. Add source receipt proof for validation result.
8. Create sandbox invention hardening tests.
9. Only then expand invention generation.

## Current GitHub Backlog References

- Issue #151: Audit Supabase migration files and confirm required AI in Action schema coverage
- Issue #152: Repair or create Supabase ai_tasks and ai_execution_logs tables for orchestrator autonomy
- Issue #153: Harden Vercel runtime with CRON_SECRET and ORCHESTRATOR_SECRET
- Issue #154: Verify source receipt and admin review Supabase tables
- Issue #155: Rerun Strategic Minds system validation after Supabase and Vercel hardening
- Issue #156: Create Strategic Minds Full System Audit documentation

## Next Recommended Action

Complete Issue #151 first, then Issue #152 and Issue #153. Do not expand autonomous invention generation until the task queue and route protection are verified.
