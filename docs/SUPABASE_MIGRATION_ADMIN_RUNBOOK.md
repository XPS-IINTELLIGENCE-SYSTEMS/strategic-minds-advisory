# Supabase Migration Admin Runbook

## Overview

This document provides step-by-step instructions for Supabase administrators to diagnose and resolve migration issues in the AI in Action Labs platform.

## Prerequisites

- Access to Supabase project dashboard
- Access to GitHub repository
- `supabase-cli` installed locally (for manual repairs only)

---

## Scenario 1: Migration Workflow Verification Failed

### Symptoms

- GitHub Actions workflow exits with error: "Remote migration versions not found in local migrations directory"
- Or: "The following required tables are missing"

### Root Cause

- Remote database has migrations (`202604240002`, `202604250001`, `202604250002`) that don't exist in local git
- Migration history mismatch between remote Supabase and local repository
- Network or authentication failure during link/push

### Resolution

#### Step 1: Verify Local Migration Files

Run locally in the repository:

```bash
ls -la supabase/migrations/
```

You should see:
```
202604240001_ai_in_action_schema.sql
202604240002_ai_operating_loop.sql
202604250001_ai_system_memory.sql
202604250002_ai_autonomy_extensions.sql
```

If files are missing, run:
```bash
git pull origin main
```

#### Step 2: Verify Remote Migration History

In Supabase dashboard:
1. Navigate to **SQL Editor**
2. Run this query:
   ```sql
   SELECT * FROM _supabase_migrations ORDER BY executed_at DESC;
   ```
3. Check the `name` column for migration versions

#### Step 3: Re-Run Workflow with Credentials Check

1. Go to **GitHub Repository Settings → Secrets and variables → Actions**
2. Verify these secrets exist and are non-empty:
   - `SUPABASE_ACCESS_TOKEN` (service role or personal access token)
   - `SUPABASE_DB_PASSWORD` (postgres role password)
   - `SUPABASE_PROJECT_ID` (e.g., `abcdefg123`)

3. Go to **Actions tab → Supabase Database Migrations**
4. Click **Run workflow → Run workflow**

#### Step 4: Check Workflow Logs

1. Wait for the workflow to complete
2. Click into the failed run
3. Expand each step to see detailed output:
   - "Link Supabase project" - check for auth errors
   - "Preview pending migrations" - check for SQL syntax or permission errors
   - "Verify required tables exist" - lists missing tables if any

#### Step 5: Manual Verification (If Needed)

If the workflow succeeds but you want to manually verify:

```bash
# Link locally (requires credentials)
supabase link --project-ref YOUR_PROJECT_ID

# Check remote state
supabase migration list --remote

# Pull remote state to local
supabase db pull
```

---

## Scenario 2: Migration History Mismatch (Advanced)

### Symptoms

- Workflow logs show: "Remote migration versions not found in local migrations directory"
- Migration files exist locally but remote doesn't match

### Root Cause

- Migrations were applied to remote Supabase but local `_supabase_migrations` table has a different set
- Possibly caused by manual DB changes or out-of-order migration execution

### Resolution

⚠️ **WARNING: This is a destructive operation. Only proceed if you understand the implications.**

#### Step 1: Backup Remote State

1. In Supabase dashboard, go to **Backups**
2. Click **Create backup now**
3. Wait for backup to complete and note the backup ID

#### Step 2: Repair Migration History (Local)

```bash
# List current remote migrations
supabase link --project-ref YOUR_PROJECT_ID
supabase migration list --remote

# If remote has extra migrations (202604240002, 202604250001, 202604250002)
# but they are not reflected correctly, repair the history:
supabase migration repair --status reverted 202604240002 202604250001 202604250002

# Then sync local with remote
supabase db pull
```

#### Step 3: Commit Local Changes

```bash
git add supabase/migrations/
git commit -m "chore: sync migration state with remote database"
git push origin main
```

#### Step 4: Re-Run Workflow

1. Go to GitHub **Actions tab → Supabase Database Migrations → Run workflow**
2. Monitor logs to ensure tables are verified successfully

---

## Scenario 3: Table Verification Failed

### Symptoms

Workflow logs show:
```
ERROR: The following required tables are missing:
  - paper_trades
  - ai_labs
  - ...
```

### Root Cause

- Migrations were "pushed" but not actually applied to the remote database
- SQL syntax errors in migration files
- Insufficient database permissions
- Postgres role doesn't have CREATE permissions

### Resolution

#### Step 1: Check SQL Syntax Locally

```bash
supabase link --project-ref YOUR_PROJECT_ID
supabase db push --dry-run
```

Look for SQL errors in the output.

#### Step 2: Verify Database Permissions

In Supabase **SQL Editor**, run:

```sql
-- Check if postgres role can create tables
SELECT usecancreatdb, usecanrepl, usecreaterole FROM pg_user WHERE usename = 'postgres';
-- Should show: t | f | t
```

#### Step 3: Manual Table Verification

Run in Supabase **SQL Editor**:

```sql
-- Check all AI in Action tables
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name LIKE 'ai_%' OR table_name LIKE 'paper_%' OR table_name LIKE 'asset_%' OR table_name LIKE 'content_%' OR table_name LIKE 'source_%' OR table_name LIKE 'platform_%'
ORDER BY table_name;
```

#### Step 4: Apply Migrations Manually (If Needed)

If automated workflow fails:

```bash
# Ensure linked
supabase link --project-ref YOUR_PROJECT_ID

# Push each migration manually
supabase db push --auto-approve

# If that fails, apply SQL directly in Supabase SQL Editor
-- Open each migration file and copy the SQL content
-- Paste into Supabase SQL Editor and execute
```

---

## Scenario 4: "Incorrect Password" or Auth Failures

### Symptoms

Workflow logs show:
```
FATAL:  password authentication failed for user "postgres"
```

### Root Cause

- `SUPABASE_DB_PASSWORD` secret is incorrect or expired
- Postgres password was recently changed in Supabase
- Secrets not properly masked in workflow

### Resolution

#### Step 1: Reset Database Password

1. In Supabase dashboard, go to **Project Settings → Database**
2. Click **Reset database password**
3. Copy the new password
4. Update the `SUPABASE_DB_PASSWORD` secret in GitHub

#### Step 2: Verify Secret Update

1. Go to **GitHub Repository Settings → Secrets and variables → Actions**
2. Delete old `SUPABASE_DB_PASSWORD` secret
3. Create new secret with correct password
4. Re-run the workflow

---

## Appendix: Required Tables Checklist

All 32 tables must exist in the remote database for the platform to function correctly:

**Core Tables (Educational Paper Trading):**
- [ ] `paper_portfolio_snapshots`
- [ ] `paper_trades`
- [ ] `asset_price_checks`

**Content & Media:**
- [ ] `content_packages`
- [ ] `source_links`

**Logging & Monitoring:**
- [ ] `platform_logs`

**AI Operating Loop:**
- [ ] `ai_labs`
- [ ] `ai_schedules`
- [ ] `ai_schedule_runs`
- [ ] `ai_runs`
- [ ] `ai_source_receipts`
- [ ] `ai_strategy_simulations`
- [ ] `ai_interest_topics`
- [ ] `ai_avatar_personas`
- [ ] `ai_media_jobs`
- [ ] `ai_approval_queue`
- [ ] `ai_risk_flags`

**System Memory:**
- [ ] `ai_system_state`
- [ ] `ai_memory_snapshots`
- [ ] `ai_decision_log`
- [ ] `ai_blockers`
- [ ] `ai_repo_registry`

**Autonomy Extensions:**
- [ ] `ai_agent_registry`
- [ ] `ai_agent_runs`
- [ ] `ai_tool_registry`
- [ ] `ai_tool_evaluations`
- [ ] `ai_discovery_runs`
- [ ] `ai_trend_signals`
- [ ] `ai_lab_lifecycle`
- [ ] `ai_validation_checks`
- [ ] `ai_notifications`
- [ ] `ai_admin_reviews`

---

## Support

For additional help:
- Check [Supabase CLI documentation](https://supabase.com/docs/guides/cli)
- Review GitHub Actions logs for exact error messages
- Check Supabase project dashboard Status page for service disruptions
