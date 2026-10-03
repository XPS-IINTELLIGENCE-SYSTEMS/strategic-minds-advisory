# Strategic Minds Advisory runtime drift audit — 2026-10-03

## Decision

RETIRE the legacy AI in Action automation; PRESERVE its source and historical receipts. Keep the current `strategicmindsadvisory.com` binding to `Strategic-Minds/strategicminds`. Do not restore legacy routes or move the domain merely to make the old validator green.

VERIFIED ownership evidence: [AUTO_BUILDER Sync Contract](https://github.com/Strategic-Minds/strategicminds/blob/09dce126aaf21dd8b258f89feaf42ad8c1aa9b5d/docs/AUTO_BUILDER_SYNC.md), committed June 10 at 03:55:11 UTC, explicitly quarantines this repository and names `Strategic-Minds/strategicminds` as the clean target. It also requires preview mode and production approval. The audit could not recover the approval or alias-change event; current production alone does not establish approval.

## Timeline and exact configurations

All times below are UTC. On June 14, 06:38 UTC is 02:38 EDT and 10:23 UTC is 06:23 EDT.

| Evidence | Configuration / observation |
| --- | --- |
| June 10, `09dce126aaf21dd8b258f89feaf42ad8c1aa9b5d` in replacement repo | Explicit clean-target/quarantine contract precedes the domain transition. |
| June 12, 19:48:38 | First observed mismatched deployment was **created**, not necessarily aliased then: `dpl_4HUMDWDJPpVNMXvSiKy6XC1aGXxs`, project `prj_DfKbw4bxNrw6comaiOsdwHAQbrCP`, Next.js, `Strategic-Minds/strategicminds`, `main@c10dacc2f958f3c62a5d4fe796899838a6991e3e`. |
| June 13 | Stored reports still identify AI in Action and report 10/10. |
| June 14, 06:38:23.373 | **Last matching runtime sample**: `ops/validation-history/2026-06-14T06-38-23-373Z.json`, receipt commit `de5520d6ac951a785d58ea11de3309767548a4fc`. Health says `app=AI in Action Labs`, `service=ai-in-action-runtime`; report says operational, 10 passed. |
| June 14, 10:23:17.765 | **First mismatched runtime sample**: `ops/validation-history/2026-06-14T10-23-17-765Z.json`, receipt commit `38ba18c31d57f97a524df675d938d94d4f3a6c1e`. Health says `system=strategicminds-client-os`; nine routes 404. HTML embeds deployment `dpl_4HUMDWDJPpVNMXvSiKy6XC1aGXxs`. Vercel metadata independently resolves that ID to the replacement repository and SHA above. |
| June 17, 11:17:33 | Current aliased deployment created: `dpl_BwCwgFqLh381s7C9swamXoQWWzuV`, same Next.js project, `main@02873271f20322527f2b38295b48498ceea3dd14`, message `Tighten persistence readiness checks`. |
| June 18 | Client OS identity already present; this is continuation, not the first transition. |
| October 3, 14:38:07.044 | `d05e5849480ef5d14bae6e34bea1bc531a73cfa1` records degraded, 1 passed / 9 failed / 5 critical failures, with the June 17 deployment ID in 404 HTML. |
| October 3 audit | Vercel resolves both apex and www aliases to `dpl_BwCwgFqLh381s7C9swamXoQWWzuV`. Fresh apex health GET returns 200 and `strategicminds-client-os`. Legacy proof alias resolves to no deployment in Vercel and returns 404 over HTTP. |

VERIFIED transition interval: after the last matching June 14 sample and by the first mismatched June 14 sample. INFERRED: custom-domain alias reassignment exposed the already-created client OS deployment. The exact alias mutation timestamp, actor, and approval are COULD NOT VERIFY; creation time is not the binding-change time. Historical deployment alias arrays are current metadata, not a historical alias-event log.

### Last correct legacy source configuration

At receipt `de5520d6...`, `vercel.json` specifies Vite, `npm run build`, output `dist`, four crons, and a SPA rewrite that excludes `/api/`. Health identity is `AI in Action Labs` / `ai-in-action-runtime`. Latest preceding change to `api`, `src`, or `vercel.json` is `ab30d601514d0a2d9a6e6b7994042a319e76880d` (April 28, `fix: inline native agent loop function`). Its GitHub Vercel success status links to deployment `CEUFmMWq3aAT2SmUitMUjdSschvS` in project `strategic-minds-advisory`.

That deployment now returns 404 from Vercel lookup. It is a historical deployment candidate, **not a verified restorable last serving deployment**. The exact immutable deployment serving the final matching June 14 sample could not be recovered. Preserve the full receipt commit and source; do not promise a domain rollback to this deployment.

### Validation caveat

The old validator computes `ok = response.ok || semantic_ok`. June 14's last 10/10 report accepts `/api/orchestrator` HTTP 500; health is in `synthetic-fallback`, public Supabase configuration is missing, and CRON_SECRET is missing. October 3 health passes despite `semantic_ok=false` and the wrong identity. Thus “10/10 operational” proves the historical route contract was recognized, not complete functional or secure operation. Retirement does not certify either application end to end.

## Complete in-repository scheduled inventory before patch

The following seven GitHub schedules are all the `on.schedule` entries in this repository. Cron expressions are UTC; actual execution may be delayed.

| Workflow file under `.github/workflows/` | Schedule | Target / downstream effect |
| --- | --- | --- |
| `ai-in-action-validation-bridge.yml` | `*/30 * * * *` | Hardcoded apex; GETs health, model-router, system-verify, self-heal, agent-loop, task-dispatch, orchestrator, metrics, revenue, log-writer. Some GET handlers can write state. Also runs on main pushes and commits validation receipts. |
| `ai-in-action-health-check.yml` | `17 */6 * * *` | `AI_IN_ACTION_BASE_URL` secret override or stale legacy branch alias; health and platform-health cron. |
| `ai-in-action-cron-failover.yml` | `*/30 * * * *` | Same override/fallback; default platform-health, optional market-check, daily-summary, content-package or all. |
| `ai-in-action-next-pipeline.yml` | `23 */4 * * *` | Dispatches health plus four cron-failover runs in default full-safe mode. |
| `ai-in-action-scheduled-worker.yml` | `17 * * * *` | Supabase queue worker; route tasks use same override/fallback unless payload provides an absolute URL. Can write queue/proof/content state. Successful Actions run does not certify correct target identity. |
| `ai-skill-drill-coach-validate.yml` | `37 14 * * *` | Same override/fallback; health, /ai-in-action, sandbox status/coach, POST coach and platform-health. |
| `ai-invention-autopilot.yml` | `41 13 * * *` | Writes invention requests and creates issues. Intake configuration can dispatch Next Pipeline; no direct runtime request. GitHub-token push propagation is not assumed. |

| Legacy `vercel.json` cron | Schedule |
| --- | --- |
| `/api/self-heal` | `0 */6 * * *` |
| `/api/cron/platform-health` | `0 8 * * *` |
| `/api/cron/daily-summary` | `0 9 * * *` |
| `/api/cron/content-package` | `0 17 * * *` |

The legacy Vercel crons are declared source configuration; active scheduler registration could not be verified because the old project/deployment is unavailable. They do not become crons on the replacement project just because a domain moved. The replacement repository currently declares `/api/autobuilder/tick` hourly and `/api/cron/strategic-os` every five minutes; those belong to the current application and are excluded from retirement.

Additional direct callers without schedules: `ai-command-bridge.yml` (issue comment/manual, hardcoded apex); `verify-agent-loop.yml` (main push/manual, hardcoded apex); `manual-verification.yml` (manual, hardcoded apex); `validate-generated-invention.yml`, `ai-invention-batch-autopilot.yml`, `ai-invention-dynamic-batch-autopilot.yml` (manual, override/legacy alias). `vercel-production-deploy.yml` can publish legacy code on selected main pushes/manual dispatch, using an opaque project ID secret/variable. These are also gated to prevent accidental legacy calls or deployment while quarantined.

VERIFIED October 3 Actions failures: Health Check run `37136936777`, Cron Failover `37137193490`, Validation Bridge `37130296247`, Skill Drill Coach `37143074221`. Next Pipeline `37126181321` succeeds while all five dispatched child runs fail. Gmail in `strategicmindsadvisory@gmail.com` independently contains matching failure notifications for the first three. Queue Worker and Invention Autopilot still run successfully; both can write state, and the autopilot committed new invention requests as `7fd44eac...`. A successful worker job does not prove queue processing or mutation.

Re-fetched job logs confirm Health Check job `111243266232`, Cron Failover job `111244011324`, and Skill Drill Coach job `111261345184` actually use the obsolete `strategic-minds-advisory-git-main-strategic-minds-advisory.vercel.app` alias and fail with curl HTTP 404. Thus there are **two stale target classes**: the Validation Bridge's apex now serving the replacement application, and the deleted/unresolved legacy proof alias used by these jobs. A secret override is supported in source, but these observed runs used the fallback alias; no secret value was retrieved.

## Smallest safe retirement patch

1. Remove all seven legacy Actions schedules.
2. Add unconditional `if: ${{ false }}` at job level in the seven scheduled workflows, six additional direct caller workflows, and the production deploy bridge (14 jobs total). Retain their steps and manual input schemas for inspection. Preserve the previous Command Bridge condition in a comment. This blocks push, comment, indirect dispatch and manual execution of selected runtime jobs.
3. Empty the four legacy Vercel cron declarations. Preserve build settings, API source, UI, migrations, assets and validation history.
4. Leave the current application, its crons, domain/DNS and secrets untouched. Supabase migration and invention-generation workflows outside the listed boundary are not retired by this narrowly scoped patch; this is not full repository archival.

No new application code or new scheduler is introduced. No production deployment is performed. The disabled legacy deploy job prevents this patch from itself deploying through that bridge after merge. A separate Vercel Git integration could still auto-deploy main: check integration before merge; branch publication can create previews if an external integration exists.

## Activation, independent validation and rollback

Patch base: `7fd44eac0fda641dadd59887fde2220cfce08b63`. Branch: `audit/retire-legacy-ai-in-action-20261003`. Independent validation must inspect the diff, YAML semantics, all scheduled entries, all direct callers, runtime identity and preserved source/history; return PASS / FAIL / BLOCKED with commit evidence. A local patch pass is not a production-retirement pass.

After operator approval, re-fetch current main, resolve any bot-generated drift without overwriting receipts, merge the reviewed patch, and verify no legacy jobs execute on main. Check running/queued old-SHA jobs before activation; their cancellation requires separate live action. Do not deploy the legacy application just to remove its Vercel crons. If the legacy project still exists, approved control-plane cron deactivation should be done there without domain rebinding or new application release.

Rollback is a reviewed Git revert of the retirement commit, never a force reset. Revert only the selected workflow files and `vercel.json`; preserve newer receipts. Re-enabling schedules must require an approved dedicated legacy target, verified health identity, auth, endpoint contract and an independent functional canary. Blind revert would resume the known stale calls. This patch never changes the current domain binding, so no DNS/domain rollback is required. Capture `dpl_BwCwgFqLh381s7C9swamXoQWWzuV` and `02873271...` as the unchanged current-domain baseline.

## Evidence limits and next action

COULD NOT VERIFY: exact alias-change event/approval; final serving legacy deployment ID; secret override values (not read); old Vercel active cron registration; external n8n, Railway or other scheduler targets. Repository inventory is exhaustive for this checked-out source, not for disconnected external services. Vercel `get_project` fails input validation in the connector; old project/deployment lookup returns 404. Neither failure proves deletion.

INFERRED: this is an incomplete retirement after a documented migration, rather than nine missing shims in the current application's source. WORKAROUND: reviewed configuration retirement avoids resurrecting the quarantined application. NEXT ACTION: review and approve the retirement patch, then independently verify scheduler cessation. Do not reinterpret a skipped legacy workflow as a healthy production system.
