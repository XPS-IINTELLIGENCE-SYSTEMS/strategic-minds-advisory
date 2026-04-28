# Strategic Minds Advisory

Strategic Minds Advisory is an AI-driven autonomous prediction, simulation, coding, building, consulting, and content-creation business.

AI in Action is the autonomous execution engine inside Strategic Minds Advisory. Its mission is to safely discover ideas, research opportunities, simulate outcomes, generate business plans, produce content, code products, deploy systems, validate production health, and improve revenue systems with minimal human intervention.

## Native Stack

- GitHub: source control, audit trail, workflows, change history
- Vercel: website hosting, serverless API functions, deployment, cron triggers
- Supabase: task queue, memory, execution logs, system events, content queue
- Vercel AI Gateway: primary AI provider router
- Groq: fast/low-cost model provider fallback
- OpenAI-compatible APIs: fallback reasoning and structured output provider

## Runtime Architecture

```text
Vercel Cron
→ /api/self-heal
→ /api/system-verify
→ /api/agent-loop
→ /api/task-dispatch
→ /api/orchestrator
→ /api/model-router
→ Supabase tasks/logs/events
→ GitHub/Vercel/Supabase native systems
```

## Core Endpoints

- `/api/health` — read-only warmup and health response
- `/api/system-verify` — verifies critical and noncritical runtime endpoints
- `/api/self-heal` — autonomous recovery controller called by cron
- `/api/agent-loop` — multi-step background execution trigger
- `/api/task-dispatch` — sequential task route executor
- `/api/orchestrator` — Supabase-backed task orchestrator
- `/api/model-router` — Vercel AI Gateway → Groq → OpenAI-compatible fallback router
- `/api/revenue` — revenue event placeholder/engine path
- `/api/metrics` — runtime metrics path
- `/api/log-writer` — execution log path

## Environment Variables

Server-side only:

```text
SUPABASE_URL
SUPABASE_SERVICE_ROLE_KEY
ORCHESTRATOR_SECRET
CRON_SECRET
AI_TASKS_TABLE=ai_tasks
AI_LOGS_TABLE=ai_execution_logs
ENABLE_ORCHESTRATOR_FROM_AGENT_LOOP=true
ENABLE_SELF_HEAL_ORCHESTRATOR=true
AI_PROVIDER=vercel_gateway
AI_GATEWAY_API_KEY
AI_GATEWAY_BASE_URL=https://ai-gateway.vercel.sh/v1
AI_GATEWAY_MODEL
GROQ_API_KEY
GROQ_BASE_URL=https://api.groq.com/openai/v1
GROQ_MODEL=llama-3.3-70b-versatile
OPENAI_API_KEY
OPENAI_BASE_URL=https://api.openai.com/v1
OPENAI_MODEL=gpt-4.1-mini
```

Frontend-safe only:

```text
VITE_SUPABASE_URL
VITE_SUPABASE_ANON_KEY
VITE_APP_MODE
VITE_DATA_MODE
```

Never expose service role keys, provider API keys, cron secrets, or orchestrator secrets in frontend code.

## Supabase Schema

Core migration:

```text
supabase/migrations/0001_ai_in_action_core.sql
```

Tables:

- `ai_tasks`
- `ai_execution_logs`
- `ai_system_events`
- `ai_revenue_events`
- `ai_content_queue`
- `ai_model_runs`
- `ai_guardrail_events`

## Base44 Migration Status

This project originated from a Base44 scaffold, but Strategic Minds Advisory is now being migrated to a native stack.

Rules:

- Do not delete useful Base44-origin capabilities.
- Remove external Base44 runtime dependencies.
- Preserve old interfaces through native adapters.
- Map entities to Supabase tables.
- Map functions to Vercel API routes.
- Map LLM calls to `/api/model-router` or `/api/orchestrator`.
- Map scheduled jobs to Vercel Cron or Supabase Cron.

Current native compatibility adapter:

```text
src/api/base44Client.js
```

## Safe Operation Rules

- Autonomous actions must be logged.
- Dangerous actions must be gated by secrets and guardrails.
- Health endpoints remain read-only.
- Financial, social, email, scraping, or outbound automation must be bounded and auditable.
- Failed verification creates tasks, not uncontrolled loops.
- Human escalation remains required for blocked or high-risk actions.

## Development

```bash
npm install
npm run dev
npm run build
```

## Deployment

Pushes to `main` trigger Vercel deployment. Vercel cron is configured in `vercel.json` and calls `/api/self-heal` every six hours.

## Roadmap

1. Complete Base44 external dependency removal.
2. Apply Supabase migration.
3. Enable Vercel AI Gateway and Groq provider keys.
4. Enable self-heal orchestrator flag after schema is live.
5. Add dashboard visibility for system health/tasks/logs.
6. Replace simulated revenue/content routes with real bounded business workflows.
7. Add social content queue integrations with platform-safe approval gates.
8. Add GitHub-native PR/code repair workflow bridge.
