# Stack Triage — AI in Action Uploaded Systems

Date: 2026-04-25

## Files Reviewed

- `claw-template-main.zip`
- `Xps-scraper-main (2).zip`
- `infinity-experiments-main.zip`
- `infinity-tools-main (1)(1).zip`
- `infinity-discovery-main (1)(1).zip`
- `infinity-core-memory-main(1).zip`
- `infinity-kernel-main (1)(1).zip`

## Mission Filter

Use only what strengthens the AI in Action platform:

- controlled autonomy
- visible work logs
- source receipts
- Supabase-backed runtime state
- GitHub issue/PR tracking
- Vercel dashboard
- paper-trading simulation with no fake prices/fills
- digital business simulation
- avatar/content production
- cost-aware implementation
- human approval gates

Reject or hold anything that increases runaway autonomy, secret exposure, unsafe scraping, unnecessary infrastructure, paid lock-in, broad auto-merge, or production fragility.

## System Decisions

### 1. Xps-scraper-main

Decision: USE NOW, with safety modifications.

Useful assets:

- Express/TypeScript backend structure.
- Scrape/crawl routes.
- Browser and Playwright service concepts.
- Rate limiter pattern.
- Supabase service pattern.
- OpenAPI GPT Actions file.
- Scraper test structure.
- Frontend source-inspection UI concepts.

Do not use:

- Key harvester behavior for extracting API keys, JWTs, tokens, or secrets from pages.
- Aggressive scraping.
- Proxy/evasion behavior.
- Railway-first assumptions unless separately approved.
- Env sync workflow that could move secrets unsafely.

AI in Action adaptation:

- Rename concept from scraper to `Source Receipts Engine`.
- Fetch allowed sources conservatively.
- Respect robots/rate limits.
- Store only public proof metadata in Supabase.
- Never harvest or expose secrets.

Immediate use:

- Build `ai_source_receipts` writer route.
- Build source verification status model.
- Build source receipt dashboard.

### 2. claw-template-main

Decision: REFERENCE ONLY.

Useful assets:

- Basic React pages for dashboard, repositories, code editor, chat.
- Simple Node backend routing pattern.
- Auth/rate-limit middleware concepts.
- Docker docs and quickstart structure.

Concerns:

- Claims like zero failure guarantee are not acceptable for AI in Action.
- Stack is not aligned with current Vite/Supabase/Vercel direction.
- Auth and code editor are generic, not immediately needed.

AI in Action adaptation:

- Use only UI ideas for future Code/Repo Workbench.
- Do not import runtime.

### 3. infinity-experiments-main

Decision: USE LATER / SELECTIVE NOW.

Useful assets:

- Discover -> Generate -> Validate -> Deploy lifecycle.
- Seed idea manifest.
- Gap finder concept.
- Scaffolder concept.
- Governance file.
- Experiment docs.

Concerns:

- 110% protocol language is marketing-like and should not be used as a factual claim.
- Full autonomous project scaffolding should be gated.

AI in Action adaptation:

- Convert lifecycle into AI Lab state machine.
- Use seed idea registry for new lab ideas.
- Use validation gate before deployment.

Immediate use:

- Add `ai_lab_ideas` and `ai_experiment_lifecycle` later.
- Create issue for lifecycle/state-machine implementation.

### 4. infinity-tools-main

Decision: USE NOW as reference data and cost-intelligence source.

Useful assets:

- Tool categories with TOP, ALTERNATIVES, COST_ANALYSIS, INTEGRATION_NOTES.
- Scraping tools category.
- AI frameworks category.
- Agent frameworks category.
- Backend, automation, observability, security, UI/UX, app builders.

Concerns:

- Tool assessments may become stale and require current verification before public claims.
- Do not blindly publish old tool rankings as current market truth.

AI in Action adaptation:

- Create Tool Intelligence Lab.
- Use as starting taxonomy.
- Verify live before publishing recommendations.
- Store tool evaluations in Supabase with date/source/version.

Immediate use:

- Seed `ai_interest_topics` and later `ai_tool_registry`.
- Create issue for Tool Intelligence Registry.

### 5. infinity-discovery-main

Decision: USE LATER, controlled.

Useful assets:

- Universal discovery concept.
- Dockerized discovery-system.
- Setup docs mentioning Projects, Codespaces, Pages, self-hosted runners.
- Discovery/reporting focus.

Concerns:

- Broad “anyone, anything” discovery needs privacy and source-boundaries.
- Self-hosted runners and broad discovery can increase attack surface.

AI in Action adaptation:

- Use for public topic/trend/source discovery only.
- No personal-data scraping without explicit lawful basis and need.
- Use as a research lane for top human-interest topics.

Immediate use:

- Create issue for `AI Discovery Lab` but hold production integration.

### 6. infinity-core-memory-main

Decision: USE NOW.

Useful assets:

- Operator Context Contract.
- Memory snapshot system.
- Rehydration scripts.
- Active memory file.
- Context validation.
- Governance-first memory model.

AI in Action adaptation:

- Convert memory snapshots into Supabase tables and repo docs.
- Create persistent AI system memory:
  - current objective
  - last action
  - blockers
  - next human action
  - deployment state
  - migration state
  - repo registry

Immediate use:

- Add `ai_system_state`, `ai_memory_snapshots`, and `ai_decision_log` migration.
- Build dashboard panel for System Memory.

### 7. infinity-kernel-main

Decision: USE SELECTIVELY.

Useful assets:

- Boot invocation.
- Master invocation.
- Kernel manifest.
- System topology.
- State-machine registry.
- Tool registry.
- Governance taxonomy.
- Industry taxonomy.
- Economic policy.
- Execution guard concepts.
- Reflection engine concept.

Concerns:

- PowerShell-heavy runtime is not ideal for Vercel/Supabase app.
- Kernel rollback/snapshot scripts are local-system oriented.
- Do not import as runtime.

AI in Action adaptation:

- Extract taxonomy, state-machine, tool registry, and execution guard concepts.
- Store in Supabase as configuration, not as local scripts.

Immediate use:

- Create issue for Kernel Taxonomy Extraction.

## Priority Implementation Plan

### Phase 1 — Project Tracking

Create GitHub issues for all active lanes. GitHub Project board should auto-add or manually add these issues.

### Phase 2 — Memory Backend

Add Supabase migration for:

- `ai_system_state`
- `ai_memory_snapshots`
- `ai_decision_log`
- `ai_repo_registry`
- `ai_tool_registry`

### Phase 3 — Source Receipts Engine

Create Vercel/Supabase-safe source receipt route and dashboard panel.

Do not use key harvesting.

### Phase 4 — Lab Lifecycle

Implement AI Lab lifecycle states inspired by infinity-experiments:

```text
idea -> research -> design -> build -> validate -> human_review -> deploy -> monitor -> optimize
```

### Phase 5 — Tool Intelligence Registry

Use infinity-tools as a seed taxonomy, but verify claims before public publishing.

### Phase 6 — Discovery Lab

Use infinity-discovery ideas for public trends and sources only.

### Phase 7 — Avatar/Content Studio

Connect AI run logs, source receipts, and human review to media jobs.

## Final Classification

| System | Classification | Use |
|---|---|---|
| Xps-scraper | USE NOW | Source Receipts Engine, safe scraping patterns |
| claw-template | REFERENCE ONLY | Basic UI/chat/code editor inspiration |
| infinity-experiments | USE LATER / SELECTIVE | Lab lifecycle and seed ideas |
| infinity-tools | USE NOW | Tool registry and cost intelligence taxonomy |
| infinity-discovery | USE LATER | Public topic/source discovery |
| infinity-core-memory | USE NOW | Persistent AI memory and rehydration |
| infinity-kernel | SELECTIVE | Taxonomy, guardrails, system topology |

## Non-Negotiable Rule

AI in Action should maximize AI capability without sacrificing truth, safety, auditability, or human control over secrets and high-risk actions.
