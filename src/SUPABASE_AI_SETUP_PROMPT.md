# Supabase AI Setup Prompt

Copy and paste this into **Supabase AI Assistant** or **Claude/ChatGPT** with your Supabase dashboard open.

---

## The Prompt

```
You are helping me set up a complete PostgreSQL database schema in Supabase for a strategic consulting AI platform. I need comprehensive schema design with tables, relationships, RLS policies, and edge function setup.

## Context
- App: AI-powered strategic consulting platform
- Frontend: React (Vercel-deployed)
- Backend: Supabase PostgreSQL + Edge Functions
- Auth: Supabase Auth
- User Types: Individual users, workspace members, admins

## Core Entities to Create

### User & Workspace
- user_profiles (id, email, full_name, role, workspace_id, created_at, updated_at)
- workspaces (id, name, owner_email, description, created_at, updated_at)
- workspace_members (id, workspace_id, user_email, role, joined_at)

### Strategic Intelligence & Ideas
- vision_ideas (id, user_email, workspace_id, title, description, business_model, status, tags, created_at, updated_at)
- strategic_intelligence (id, user_email, workspace_id, title, content, source_type, sentiment, impact_score, tags, category, created_at, updated_at)
- intelligence_sources (id, workspace_id, source_type, source_name, connector_id, config (jsonb), sync_enabled, last_sync, items_synced, created_at)

### Analysis & Modeling
- stress_test_results (id, workspace_id, user_email, idea_id, scenario_name, variables (jsonb), results (jsonb), risk_score, timestamp)
- saved_models (id, workspace_id, user_email, name, model_type, config (jsonb), projections (jsonb), created_at, updated_at)
- simulation_results (id, workspace_id, user_email, simulation_type, variables (jsonb), outcomes (jsonb), created_at)

### Decision & Execution
- debate_history (id, idea_id, workspace_id, session_id, title, debate_round, messages (jsonb), conclusion, decision_made, participants (text), tags, debate_date, created_at)
- decision_tasks (id, debate_id, idea_id, workspace_id, decision, tasks (jsonb), assigned_to (text), pm_tool, external_task_ids (text), status, created_at, synced_date)
- strategy_playbooks (id, workspace_id, creator_email, title, description, pivot_strategy, implementation_steps (jsonb), expected_outcomes, success_metrics, applicable_domains, success_rate, times_applied, is_public, created_at, updated_at)

### Content & Knowledge
- content_items (id, workspace_id, creator_email, title, content_type, content (text), tone, status, created_at, updated_at)
- prompt_library (id, workspace_id, creator_email, title, category, content (text), use_cases (text), system_prompt (text), variables (jsonb), is_public, is_pinned, usage_count, created_at, updated_at)
- insight_comments (id, intelligence_id, user_email, comment_text, is_pinned, comment_date)

### Workflow & Automation
- workflows (id, workspace_id, creator_email, name, trigger_type, trigger_conditions (jsonb), action_type, action_config (jsonb), is_active, last_triggered, execution_count, created_at, updated_at)
- cron_automations (id, workspace_id, created_by, name, type, cron_expression, config (jsonb), is_active, last_run, next_run, run_count, last_status, created_at, updated_at)
- automation_tasks (id, workspace_id, user_email, automation_id, status, results (jsonb), created_at, completed_at)

### Investor & Business
- investors (id, workspace_id, name, email, company, stage, domains (text), last_contact, status, notes, created_at, updated_at)
- investor_contact_logs (id, investor_id, contact_date, contact_type, notes, sentiment, outcome)
- investor_meetings (id, investor_id, workspace_id, scheduled_date, meeting_type, prep_notes, outcome, google_calendar_event_id, status)

### Team & Portfolio
- team_members (id, workspace_id, email, full_name, role, skills (text), capacity, current_tasks, created_at, updated_at)
- portfolios (id, workspace_id, owner_email, name, description, model_ids (text), collective_risk_score, last_stress_test_date, is_active, created_at, updated_at)

### Reporting & Monitoring
- daily_digests (id, user_email, workspace_id, digest_date, summary, intelligence_count, voice_insights_count, stress_tests_run, critical_findings, recommendations, sent, created_at)
- keyword_alerts (id, user_email, workspace_id, model_id, model_name, keywords (text), minimum_impact_score, alert_method, is_active, last_alert_date, alert_count, created_at, updated_at)

## Requirements

1. **Tables**: Create all tables with appropriate types (UUID for IDs, JSONB for complex objects, TEXT for comma-separated values)
2. **Primary Keys**: All tables need UUID primary key with DEFAULT gen_random_uuid()
3. **Timestamps**: All tables need created_at and updated_at TIMESTAMP DEFAULT NOW()
4. **Indexes**: Create indexes on frequently queried fields (user_email, workspace_id, status, created_at)
5. **RLS (Row Level Security)**: 
   - Users can only see data from their workspace
   - Users can only see their own user_profiles
   - Admins can see everything
   - Workspace members inherit workspace permissions
6. **Relationships**: Set up foreign keys between:
   - All workspace-scoped tables → workspaces (workspace_id)
   - All user-owned tables → user_profiles (user_email)
   - Decision tasks → debates, ideas, workspaces
   - Investor meetings → investors
7. **Extensions**: Enable necessary extensions (uuid-ossp, if needed)

## Output Format

Please provide:
1. Complete SQL schema with CREATE TABLE statements
2. Index creation statements
3. RLS policy SQL for all tables
4. Foreign key constraints
5. Any necessary stored functions or triggers

Start by creating the table structure, then add indexes, then RLS policies.
```

---

## Alternative: Paste This Directly into Supabase SQL Editor

If you want to create everything at once, run this:

```sql
-- USER & WORKSPACE TABLES
CREATE TABLE IF NOT EXISTS public.user_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR NOT NULL UNIQUE,
  full_name VARCHAR,
  role VARCHAR DEFAULT 'user',
  workspace_id UUID,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.workspaces (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR NOT NULL,
  owner_email VARCHAR NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.workspace_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  user_email VARCHAR NOT NULL,
  role VARCHAR DEFAULT 'member',
  joined_at TIMESTAMP DEFAULT NOW()
);

-- STRATEGIC INTELLIGENCE TABLES
CREATE TABLE IF NOT EXISTS public.vision_ideas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_email VARCHAR NOT NULL,
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  title VARCHAR NOT NULL,
  description TEXT,
  business_model VARCHAR,
  status VARCHAR DEFAULT 'draft',
  tags TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.strategic_intelligence (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_email VARCHAR NOT NULL,
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  title VARCHAR NOT NULL,
  content TEXT,
  source_type VARCHAR,
  sentiment VARCHAR DEFAULT 'neutral',
  impact_score NUMERIC DEFAULT 50,
  tags TEXT,
  category VARCHAR,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.intelligence_sources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  source_type VARCHAR NOT NULL,
  source_name VARCHAR,
  connector_id VARCHAR,
  config JSONB,
  sync_enabled BOOLEAN DEFAULT true,
  last_sync TIMESTAMP,
  items_synced NUMERIC DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- ANALYSIS & MODELING TABLES
CREATE TABLE IF NOT EXISTS public.stress_test_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  user_email VARCHAR NOT NULL,
  idea_id UUID REFERENCES vision_ideas(id) ON DELETE CASCADE,
  scenario_name VARCHAR,
  variables JSONB,
  results JSONB,
  risk_score NUMERIC,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.saved_models (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  user_email VARCHAR NOT NULL,
  name VARCHAR NOT NULL,
  model_type VARCHAR,
  config JSONB,
  projections JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- DECISION & EXECUTION TABLES
CREATE TABLE IF NOT EXISTS public.debate_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  idea_id UUID REFERENCES vision_ideas(id) ON DELETE CASCADE,
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  session_id VARCHAR NOT NULL,
  title VARCHAR,
  debate_round NUMERIC,
  messages JSONB,
  conclusion TEXT,
  decision_made TEXT,
  participants TEXT,
  tags TEXT,
  debate_date TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.decision_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  debate_id UUID REFERENCES debate_history(id) ON DELETE CASCADE,
  idea_id UUID REFERENCES vision_ideas(id),
  workspace_id UUID REFERENCES workspaces(id),
  decision TEXT,
  tasks JSONB,
  assigned_to TEXT,
  pm_tool VARCHAR,
  external_task_ids TEXT,
  status VARCHAR DEFAULT 'created',
  created_at TIMESTAMP DEFAULT NOW(),
  synced_date TIMESTAMP
);

CREATE TABLE IF NOT EXISTS public.strategy_playbooks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  creator_email VARCHAR,
  title VARCHAR NOT NULL,
  description TEXT,
  pivot_strategy TEXT,
  implementation_steps JSONB,
  expected_outcomes TEXT,
  success_metrics TEXT,
  applicable_domains TEXT,
  success_rate NUMERIC,
  times_applied NUMERIC DEFAULT 0,
  is_public BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- CONTENT & KNOWLEDGE TABLES
CREATE TABLE IF NOT EXISTS public.content_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  creator_email VARCHAR,
  title VARCHAR,
  content_type VARCHAR,
  content TEXT,
  tone VARCHAR,
  status VARCHAR DEFAULT 'draft',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.prompt_library (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  creator_email VARCHAR,
  title VARCHAR NOT NULL,
  category VARCHAR,
  content TEXT NOT NULL,
  use_cases TEXT,
  system_prompt TEXT,
  variables JSONB,
  is_public BOOLEAN DEFAULT false,
  is_pinned BOOLEAN DEFAULT false,
  usage_count NUMERIC DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- WORKFLOW & AUTOMATION TABLES
CREATE TABLE IF NOT EXISTS public.workflows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  creator_email VARCHAR,
  name VARCHAR NOT NULL,
  trigger_type VARCHAR,
  trigger_conditions JSONB,
  action_type VARCHAR,
  action_config JSONB,
  is_active BOOLEAN DEFAULT true,
  last_triggered TIMESTAMP,
  execution_count NUMERIC DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.cron_automations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  created_by VARCHAR,
  name VARCHAR NOT NULL,
  type VARCHAR,
  cron_expression VARCHAR,
  config JSONB,
  is_active BOOLEAN DEFAULT true,
  last_run TIMESTAMP,
  next_run TIMESTAMP,
  run_count NUMERIC DEFAULT 0,
  last_status VARCHAR DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- INVESTOR & BUSINESS TABLES
CREATE TABLE IF NOT EXISTS public.investors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  name VARCHAR NOT NULL,
  email VARCHAR,
  company VARCHAR,
  stage VARCHAR,
  domains TEXT,
  last_contact TIMESTAMP,
  status VARCHAR DEFAULT 'new',
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.investor_meetings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  investor_id UUID REFERENCES investors(id) ON DELETE CASCADE,
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  scheduled_date TIMESTAMP,
  meeting_type VARCHAR DEFAULT 'initial',
  prep_notes TEXT,
  outcome TEXT,
  google_calendar_event_id VARCHAR,
  status VARCHAR DEFAULT 'scheduled',
  created_at TIMESTAMP DEFAULT NOW()
);

-- TEAM TABLES
CREATE TABLE IF NOT EXISTS public.team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  email VARCHAR NOT NULL,
  full_name VARCHAR NOT NULL,
  role VARCHAR,
  skills TEXT,
  capacity NUMERIC DEFAULT 40,
  current_tasks NUMERIC DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- REPORTING TABLES
CREATE TABLE IF NOT EXISTS public.daily_digests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_email VARCHAR NOT NULL,
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  digest_date DATE,
  summary TEXT,
  intelligence_count NUMERIC,
  voice_insights_count NUMERIC,
  stress_tests_run NUMERIC,
  critical_findings TEXT,
  recommendations TEXT,
  sent BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW()
);

-- CREATE INDEXES
CREATE INDEX idx_user_profiles_email ON user_profiles(email);
CREATE INDEX idx_user_profiles_workspace ON user_profiles(workspace_id);
CREATE INDEX idx_vision_ideas_workspace ON vision_ideas(workspace_id);
CREATE INDEX idx_vision_ideas_user ON vision_ideas(user_email);
CREATE INDEX idx_strategic_intelligence_workspace ON strategic_intelligence(workspace_id);
CREATE INDEX idx_strategic_intelligence_user ON strategic_intelligence(user_email);
CREATE INDEX idx_workflows_workspace ON workflows(workspace_id);
CREATE INDEX idx_investors_workspace ON investors(workspace_id);
CREATE INDEX idx_team_members_workspace ON team_members(workspace_id);
CREATE INDEX idx_daily_digests_user ON daily_digests(user_email);
CREATE INDEX idx_stress_test_results_workspace ON stress_test_results(workspace_id);

-- ENABLE RLS
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE workspaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE vision_ideas ENABLE ROW LEVEL SECURITY;
ALTER TABLE strategic_intelligence ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflows ENABLE ROW LEVEL SECURITY;
ALTER TABLE investors ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_digests ENABLE ROW LEVEL SECURITY;

-- RLS POLICIES
CREATE POLICY "Users can view their own profile" ON user_profiles
  FOR SELECT USING (auth.email() = email);

CREATE POLICY "Workspace members can view workspace data" ON vision_ideas
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM workspace_members 
      WHERE workspace_members.workspace_id = vision_ideas.workspace_id 
      AND workspace_members.user_email = auth.email()
    )
  );

CREATE POLICY "Users can insert into their workspace" ON vision_ideas
  FOR INSERT WITH CHECK (user_email = auth.email());

-- Add more RLS policies as needed...
```

---

## How to Use

**Option 1: Use Supabase AI (Recommended)**
1. Open your Supabase dashboard
2. Go to **AI Assistant** (if available in your plan)
3. Paste the prompt above
4. Let Supabase AI generate the SQL
5. Review and run in SQL Editor

**Option 2: Use the SQL Directly**
1. Copy the SQL schema above
2. Go to Supabase **SQL Editor**
3. Create a new query
4. Paste and run

**Option 3: Use Claude/ChatGPT**
1. Paste the prompt into Claude or ChatGPT
2. It will generate complete SQL
3. Copy the output to Supabase SQL Editor

---

## After Setup

Once tables are created:
1. ✅ Enable automatic sync: `autoSyncToSupabase` automations
2. ✅ Create initial user in `user_profiles`
3. ✅ Create workspace
4. ✅ Test with a sample record

Done! Everything is ready for Base44 → Supabase syncing.