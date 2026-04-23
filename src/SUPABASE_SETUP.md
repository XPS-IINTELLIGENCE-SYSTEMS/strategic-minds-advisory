# Complete Supabase Backend Setup Guide

## Overview

This document provides a comprehensive setup guide for deploying the full backend infrastructure on Supabase. The system includes:
- **14 Core Tables** for data management
- **15 PL/pgSQL Functions** for business logic
- **4 Edge Functions** for serverless operations
- **10 Cron Jobs** for automation
- **Row-Level Security (RLS)** for access control
- **Real-time Subscriptions** support

---

## Setup Steps

### 1. Create Supabase Project

```bash
# Install Supabase CLI
npm install -g supabase

# Initialize project
supabase init

# Login to Supabase
supabase login
```

### 2. Run Migrations

```bash
# Deploy migrations
supabase migration up

# Or run individually:
supabase migration up --file 001_initial_schema.sql
supabase migration up --file 002_functions_and_triggers.sql
supabase migration up --file 003_edge_functions.sql
supabase migration up --file 004_cron_jobs.sql
```

### 3. Deploy Edge Functions

```bash
# Deploy all functions
supabase functions deploy groq-chat
supabase functions deploy run-automation
supabase functions deploy sync-schema-to-supabase
supabase functions deploy github-webhook

# Set environment variables in Supabase dashboard:
# - GROQ_API_KEY
# - GITHUB_WEBHOOK_SECRET
# - GITHUB_TOKEN
# - VERCEL_API_KEY
```

### 4. Seed Initial Data

```bash
# Load seed data
psql [CONNECTION_STRING] < supabase/seed.sql
```

### 5. Configure Authentication

- Go to Supabase Dashboard > Authentication > Providers
- Enable Email provider (default enabled)
- Configure OAuth providers if needed:
  - GitHub (for code integrations)
  - Google (for workspace integrations)

### 6. Set Up Environment Variables

```bash
# Copy to .env.local
VITE_SUPABASE_URL=https://[project-id].supabase.co
VITE_SUPABASE_ANON_KEY=[anon-key]
SUPABASE_SERVICE_ROLE_KEY=[service-role-key]
GROQ_API_KEY=[groq-api-key]
GITHUB_TOKEN=[github-token]
GITHUB_WEBHOOK_SECRET=[webhook-secret]
VERCEL_API_KEY=[vercel-api-key]
```

---

## Architecture Overview

### Tables & Relationships

```
user_profiles ──┬─→ workspaces ──┬─→ workspace_members
               │                └─→ vision_ideas ──→ debate_history ──→ decision_tasks
               │                └─→ workflows
               │                └─→ investors
               │                └─→ team_members
               │                └─→ scraping_schedules
               │
               ├─→ content_items
               ├─→ automation_tasks
               ├─→ strategic_intelligence ──→ insight_comments
               ├─→ code_operations
               └─→ project_index
```

### Core Entities

| Table | Purpose | Key Fields |
|-------|---------|-----------|
| `user_profiles` | User accounts & preferences | id, email, role, workspace_id |
| `workspaces` | Team workspaces | id, name, owner_email |
| `vision_ideas` | Business ideas for analysis | id, title, status, business_model |
| `debate_history` | AI debate records | id, idea_id, messages, decision_made |
| `strategic_intelligence` | Market insights & signals | id, source_type, sentiment, impact_score |
| `workflows` | Automated trigger-action workflows | id, trigger_type, action_type |
| `investors` | Investor pipeline tracking | id, name, stage, status |
| `automation_tasks` | Scheduled automations | id, type, config, status |
| `scraping_jobs` | Web scraping jobs | id, urls, status, results |
| `content_items` | Generated content | id, title, body, content_type |
| `code_operations` | Code file changes | id, operation_type, target_path, status |
| `project_index` | Project metadata | id, file_structure, entity_schemas |
| `cron_automations` | Cron job definitions | id, name, cron_expression |
| `daily_digests` | Automated summaries | id, digest_date, summary |

---

## Functions Overview

### Business Logic Functions

1. **`create_workspace`** - Setup team workspace
2. **`create_or_update_project_index`** - Index codebase
3. **`add_strategic_intelligence`** - Log market signals
4. **`store_stress_test_result`** - Save simulation results
5. **`execute_workflow`** - Trigger workflow actions
6. **`convert_decision_to_tasks`** - Generate tasks from decisions
7. **`create_scraping_job`** - Queue web scraping
8. **`log_investor_contact`** - Track outreach activities
9. **`log_content_generation`** - Record content creation
10. **`generate_daily_digest`** - Create daily summaries
11. **`calculate_portfolio_risk`** - Aggregate risk scores
12. **`log_automation_execution`** - Track automation runs
13. **`schedule_cron_automation`** - Setup recurring tasks

### Triggers

- `handle_new_user` - Auto-create profile for new auth users
- `update_*_updated_at` - Auto-update timestamps on all tables

---

## Edge Functions

### groq-chat
- **Endpoint**: `POST /functions/v1/groq-chat`
- **Purpose**: LLM chat completions via Groq
- **Auth**: Required (Bearer token)
- **Request**:
  ```json
  {
    "messages": [{"role": "user", "content": "..."}],
    "systemPrompt": "..."
  }
  ```
- **Response**:
  ```json
  {
    "content": "...",
    "model": "llama-3.3-70b-versatile"
  }
  ```

### run-automation
- **Endpoint**: `POST /functions/v1/run-automation`
- **Purpose**: Execute automation tasks
- **Request**:
  ```json
  {
    "automationType": "scraping",
    "config": {...},
    "targetData": {...}
  }
  ```

### sync-schema-to-supabase
- **Endpoint**: `POST /functions/v1/sync-schema-to-supabase`
- **Purpose**: Create tables from entity schemas
- **Request**:
  ```json
  {
    "entityName": "Task",
    "schema": {...}
  }
  ```

### github-webhook
- **Endpoint**: `POST /functions/v1/github-webhook`
- **Purpose**: Receive GitHub push/PR events
- **Headers**: `x-hub-signature-256` (verified)

---

## Cron Jobs

All cron jobs run automatically on the schedule specified:

| Job | Schedule | Action |
|-----|----------|--------|
| `daily-digest-generation` | Daily 9 AM | Generate daily summaries |
| `scraping-automation` | Every 6 hours | Process web scraping tasks |
| `workflow-triggers` | Every 4 hours | Execute automated workflows |
| `cleanup-old-logs` | Daily midnight | Delete logs >30 days old |
| `portfolio-risk-calculation` | Weekly Monday 6 AM | Calculate portfolio risk |
| `keyword-alert-check` | Every 2 hours | Monitor keyword alerts |
| `scraping-job-sync` | Hourly | Update scraping job status |
| `investor-contact-reminders` | Daily 8 PM | Auto-update investor status |
| `weekly-stress-test` | Weekly Sunday 10 AM | Schedule stress tests |
| `monitor-edge-errors` | Every 5 minutes | Check for edge function errors |

---

## Row-Level Security (RLS) Policies

All tables use RLS to ensure users only access their own data:

- **User Profiles**: Users see own profile; admins see all
- **Workspaces**: Accessible to owner and workspace members
- **Vision Ideas**: Visible to workspace members
- **Strategic Intelligence**: Visible to workspace members
- **Content Items**: Users see own content
- **Code Operations**: Users see own operations
- **Investors**: Visible to workspace members

---

## Client-Side Integration

### Initialize Supabase Client

```typescript
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

// Sign up
const { data, error } = await supabase.auth.signUp({
  email: "user@example.com",
  password: "password"
});

// Login
const { data, error } = await supabase.auth.signInWithPassword({
  email: "user@example.com",
  password: "password"
});

// Call Edge Function
const { data, error } = await supabase.functions.invoke("groq-chat", {
  body: {
    messages: [...],
    systemPrompt: "..."
  }
});

// Real-time subscriptions
const subscription = supabase
  .from("vision_ideas")
  .on("*", (payload) => {
    console.log("Change received!", payload);
  })
  .subscribe();
```

---

## Monitoring & Troubleshooting

### Check Function Logs

```sql
SELECT * FROM public.edge_function_logs
WHERE executed_at > NOW() - INTERVAL '1 hour'
ORDER BY executed_at DESC;
```

### Check Automation Status

```sql
SELECT * FROM public.automation_tasks
WHERE last_run > NOW() - INTERVAL '24 hours'
ORDER BY last_run DESC;
```

### Monitor Cron Jobs

```sql
-- View pg_cron jobs
SELECT * FROM cron.job;

-- Check job logs
SELECT * FROM cron.job_run_details
ORDER BY start_time DESC LIMIT 20;
```

### Database Size

```sql
SELECT pg_size_pretty(pg_database_size('postgres'));
```

---

## Scaling Considerations

1. **Connection Pooling**: Enable PgBouncer for high concurrency
2. **Indexing**: Add additional indexes for frequently filtered columns
3. **Partitioning**: Partition large tables (`code_operations`, `edge_function_logs`) by date
4. **Caching**: Use Supabase caching for frequently accessed data
5. **Backups**: Enable automated daily backups in Supabase dashboard

---

## Security Best Practices

✅ **Implemented**:
- Row-Level Security (RLS) on all tables
- JWT authentication for Edge Functions
- GitHub webhook signature verification
- HTTPS for all requests
- Environment variables for sensitive keys

🔒 **Additional Recommendations**:
- Rotate API keys monthly
- Enable MFA for admin accounts
- Use service role key only in Edge Functions
- Audit logs for sensitive operations
- Rate limiting on public endpoints

---

## Migration & Deployment

```bash
# Local development
supabase start
supabase db pull  # Download remote schema
supabase db push  # Upload local schema

# Production deployment
supabase link --project-ref [project-id]
supabase migration push
supabase functions deploy --all

# Rollback
supabase db reset  # Local only
# For production, restore from backup
```

---

## Support & Documentation

- [Supabase Docs](https://supabase.com/docs)
- [PostgreSQL Docs](https://www.postgresql.org/docs/15/)
- [Deno Docs](https://deno.land/manual)
- [pg_cron Extension](https://github.com/citusdata/pg_cron)

---

**Last Updated**: April 2026  
**System Version**: 1.0.0 - Production Ready