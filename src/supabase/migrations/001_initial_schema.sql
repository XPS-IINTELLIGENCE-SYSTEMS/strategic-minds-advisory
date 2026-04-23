-- ============================================
-- SUPABASE COMPLETE BACKEND MIGRATION
-- Strategic AI Platform - Full Schema
-- ============================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "http";
CREATE EXTENSION IF NOT EXISTS "pg_cron";

-- ============================================
-- 1. AUTHENTICATION & USERS
-- ============================================

-- Auth is handled by Supabase auth.users table
-- Create user profile extension
CREATE TABLE IF NOT EXISTS public.user_profiles (
  id uuid PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  email text NOT NULL UNIQUE,
  full_name text,
  role text DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  workspace_id uuid,
  avatar_url text,
  preferences jsonb DEFAULT '{}',
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- ============================================
-- 2. WORKSPACES & COLLABORATION
-- ============================================

CREATE TABLE IF NOT EXISTS public.workspaces (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  owner_email text NOT NULL,
  description text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.workspace_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id uuid NOT NULL REFERENCES public.workspaces ON DELETE CASCADE,
  email text NOT NULL,
  full_name text,
  role text DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'member', 'viewer')),
  joined_at timestamp with time zone DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.team_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id uuid NOT NULL REFERENCES public.workspaces ON DELETE CASCADE,
  email text NOT NULL,
  full_name text NOT NULL,
  role text CHECK (role IN ('engineer', 'designer', 'product', 'marketing', 'operations', 'lead', 'other')),
  skills text,
  capacity numeric DEFAULT 40,
  current_tasks int DEFAULT 0,
  created_at timestamp with time zone DEFAULT now()
);

-- ============================================
-- 3. ENTITIES & DATA MANAGEMENT
-- ============================================

CREATE TABLE IF NOT EXISTS public.project_index (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_email text NOT NULL,
  project_name text NOT NULL,
  file_structure jsonb,
  entity_schemas jsonb,
  function_list jsonb,
  dependencies jsonb,
  readme_content text,
  last_indexed timestamp with time zone,
  vercel_project_id text,
  github_repo_url text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.code_operations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_email text NOT NULL,
  operation_type text NOT NULL CHECK (operation_type IN ('create_file', 'modify_file', 'delete_file', 'create_entity', 'create_function', 'deploy_project')),
  target_path text NOT NULL,
  description text,
  content text,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed')),
  error_message text,
  vercel_deployment_url text,
  timestamp timestamp with time zone DEFAULT now(),
  natural_language_prompt text,
  created_at timestamp with time zone DEFAULT now()
);

-- ============================================
-- 4. VISION CORTEX & STRATEGIC IDEAS
-- ============================================

CREATE TABLE IF NOT EXISTS public.vision_ideas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_email text NOT NULL,
  title text NOT NULL,
  description text,
  business_model text,
  market_size numeric,
  target_audience text,
  key_risks jsonb,
  competitive_advantages text,
  revenue_model text,
  funding_stage text,
  status text DEFAULT 'draft' CHECK (status IN ('draft', 'analyzing', 'validated', 'pitching')),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.debate_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  idea_id uuid NOT NULL REFERENCES public.vision_ideas ON DELETE CASCADE,
  session_id text NOT NULL,
  title text NOT NULL,
  debate_round int,
  messages jsonb NOT NULL,
  conclusion text,
  decision_made text,
  debate_date timestamp with time zone,
  participants text,
  tags text,
  created_at timestamp with time zone DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.decision_tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  debate_id uuid NOT NULL REFERENCES public.debate_history ON DELETE CASCADE,
  idea_id uuid REFERENCES public.vision_ideas ON DELETE CASCADE,
  decision text NOT NULL,
  tasks jsonb NOT NULL,
  assigned_to text,
  pm_tool text DEFAULT 'none' CHECK (pm_tool IN ('jira', 'linear', 'asana', 'trello', 'none')),
  external_task_ids text,
  status text DEFAULT 'created' CHECK (status IN ('created', 'assigned', 'synced', 'completed')),
  created_date timestamp with time zone DEFAULT now(),
  synced_date timestamp with time zone,
  updated_at timestamp with time zone DEFAULT now()
);

-- ============================================
-- 5. STRESS TESTING & SIMULATION
-- ============================================

CREATE TABLE IF NOT EXISTS public.simulation_results (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_email text NOT NULL,
  title text NOT NULL,
  type text,
  variables jsonb,
  result jsonb NOT NULL,
  summary text,
  confidence numeric,
  created_at timestamp with time zone DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.stress_test_results (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  idea_id uuid REFERENCES public.vision_ideas ON DELETE CASCADE,
  scenario_name text NOT NULL,
  variables jsonb,
  outcome text,
  impact_score numeric,
  success_probability numeric,
  pivot_strategy text,
  result_data jsonb,
  created_at timestamp with time zone DEFAULT now()
);

-- ============================================
-- 6. MARKET INTELLIGENCE & DATA INGESTION
-- ============================================

CREATE TABLE IF NOT EXISTS public.strategic_intelligence (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_email text NOT NULL,
  source_type text,
  title text NOT NULL,
  content text,
  sentiment text DEFAULT 'neutral' CHECK (sentiment IN ('positive', 'neutral', 'negative')),
  impact_score numeric,
  related_domains text,
  extracted_signals jsonb,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.insight_comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  intelligence_id uuid NOT NULL REFERENCES public.strategic_intelligence ON DELETE CASCADE,
  user_email text NOT NULL,
  comment_text text NOT NULL,
  is_pinned boolean DEFAULT false,
  comment_date timestamp with time zone DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.data_ingestion_sources (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_email text NOT NULL,
  source_name text NOT NULL,
  source_type text,
  url text,
  api_key_encrypted text,
  config jsonb,
  sync_enabled boolean DEFAULT true,
  last_sync timestamp with time zone,
  next_sync timestamp with time zone,
  created_at timestamp with time zone DEFAULT now()
);

-- ============================================
-- 7. AUTOMATION & WORKFLOWS
-- ============================================

CREATE TABLE IF NOT EXISTS public.automation_tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_email text NOT NULL,
  name text NOT NULL,
  automation_type text NOT NULL,
  config jsonb,
  status text DEFAULT 'idle' CHECK (status IN ('idle', 'running', 'completed', 'failed')),
  enabled boolean DEFAULT true,
  last_run timestamp with time zone,
  result jsonb,
  created_at timestamp with time zone DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.workflows (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id uuid NOT NULL REFERENCES public.workspaces ON DELETE CASCADE,
  name text NOT NULL,
  trigger_type text NOT NULL CHECK (trigger_type IN ('competitive_threat', 'market_signal', 'idea_update', 'stress_test_result', 'scheduled')),
  trigger_conditions jsonb,
  action_type text NOT NULL CHECK (action_type IN ('run_stress_test', 'update_strategy', 'notify_team', 'generate_report', 'update_pitch')),
  action_config jsonb,
  is_active boolean DEFAULT true,
  last_triggered timestamp with time zone,
  execution_count int DEFAULT 0,
  created_at timestamp with time zone DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.workflow_jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workflow_id uuid NOT NULL REFERENCES public.workflows ON DELETE CASCADE,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'running', 'completed', 'failed')),
  started_at timestamp with time zone,
  completed_at timestamp with time zone,
  result jsonb,
  error_message text,
  created_at timestamp with time zone DEFAULT now()
);

-- ============================================
-- 8. INVESTOR & OUTREACH
-- ============================================

CREATE TABLE IF NOT EXISTS public.investors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id uuid NOT NULL REFERENCES public.workspaces ON DELETE CASCADE,
  name text NOT NULL,
  email text NOT NULL,
  company text NOT NULL,
  stage text CHECK (stage IN ('seed', 'series_a', 'series_b', 'growth', 'late_stage')),
  domains text,
  last_contact timestamp with time zone,
  status text DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'interested', 'pitching', 'invested', 'rejected')),
  notes text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.investor_contact_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  investor_id uuid NOT NULL REFERENCES public.investors ON DELETE CASCADE,
  contact_date timestamp with time zone DEFAULT now(),
  contact_type text NOT NULL CHECK (contact_type IN ('email', 'call', 'meeting', 'pitch', 'followup')),
  notes text,
  sentiment text DEFAULT 'neutral' CHECK (sentiment IN ('positive', 'neutral', 'negative')),
  outcome text,
  created_at timestamp with time zone DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.investor_meetings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  investor_id uuid NOT NULL REFERENCES public.investors ON DELETE CASCADE,
  workspace_id uuid NOT NULL REFERENCES public.workspaces ON DELETE CASCADE,
  scheduled_date timestamp with time zone NOT NULL,
  meeting_type text DEFAULT 'initial' CHECK (meeting_type IN ('initial', 'deep_dive', 'pitch', 'due_diligence')),
  prep_notes text,
  outcome text,
  google_calendar_event_id text,
  status text DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'completed', 'cancelled')),
  created_at timestamp with time zone DEFAULT now()
);

-- ============================================
-- 9. CONTENT & GENERATION
-- ============================================

CREATE TABLE IF NOT EXISTS public.content_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_email text NOT NULL,
  title text NOT NULL,
  body text NOT NULL,
  content_type text,
  tone text,
  length int,
  status text DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.prompt_library (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id uuid NOT NULL REFERENCES public.workspaces ON DELETE CASCADE,
  creator_email text NOT NULL,
  title text NOT NULL,
  category text CHECK (category IN ('scraping', 'analysis', 'simulation', 'strategy', 'content', 'research')),
  content text NOT NULL,
  use_cases text,
  system_prompt text,
  variables jsonb,
  is_public boolean DEFAULT false,
  is_pinned boolean DEFAULT false,
  usage_count int DEFAULT 0,
  created_at timestamp with time zone DEFAULT now()
);

-- ============================================
-- 10. SCRAPING & PIPELINES
-- ============================================

CREATE TABLE IF NOT EXISTS public.scraping_schedules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id uuid NOT NULL REFERENCES public.workspaces ON DELETE CASCADE,
  user_email text NOT NULL,
  name text NOT NULL,
  urls jsonb NOT NULL,
  extraction_schema jsonb,
  frequency text DEFAULT 'daily' CHECK (frequency IN ('hourly', 'daily', 'weekly', 'monthly')),
  next_run timestamp with time zone,
  last_run timestamp with time zone,
  is_active boolean DEFAULT true,
  run_count int DEFAULT 0,
  created_at timestamp with time zone DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.scraping_jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id uuid NOT NULL REFERENCES public.workspaces ON DELETE CASCADE,
  user_email text NOT NULL,
  job_id text UNIQUE NOT NULL,
  urls jsonb NOT NULL,
  status text DEFAULT 'queued' CHECK (status IN ('queued', 'running', 'completed', 'failed')),
  started_at timestamp with time zone,
  completed_at timestamp with time zone,
  total_urls int,
  completed_urls int DEFAULT 0,
  results jsonb,
  created_at timestamp with time zone DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.pipeline_runs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id uuid NOT NULL REFERENCES public.workspaces ON DELETE CASCADE,
  user_email text NOT NULL,
  pipeline_id text NOT NULL,
  config jsonb NOT NULL,
  status text DEFAULT 'running' CHECK (status IN ('running', 'completed', 'failed')),
  started_at timestamp with time zone,
  completed_at timestamp with time zone,
  steps_completed int DEFAULT 0,
  results jsonb,
  created_at timestamp with time zone DEFAULT now()
);

-- ============================================
-- 11. STRATEGY & PLAYBOOKS
-- ============================================

CREATE TABLE IF NOT EXISTS public.strategy_playbooks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  creator_email text NOT NULL,
  source_scenario text,
  pivot_strategy text NOT NULL,
  implementation_steps jsonb,
  expected_outcomes text,
  success_metrics text,
  applicable_domains text,
  success_rate numeric,
  times_applied int DEFAULT 0,
  is_public boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now()
);

-- ============================================
-- 12. REAL-TIME MONITORING
-- ============================================

CREATE TABLE IF NOT EXISTS public.cron_automations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id uuid NOT NULL REFERENCES public.workspaces ON DELETE CASCADE,
  created_by text NOT NULL,
  name text NOT NULL,
  type text CHECK (type IN ('scraping', 'pipeline', 'simulation', 'report', 'alert')),
  cron_expression text NOT NULL,
  config jsonb,
  is_active boolean DEFAULT true,
  last_run timestamp with time zone,
  next_run timestamp with time zone,
  run_count int DEFAULT 0,
  last_status text DEFAULT 'pending' CHECK (last_status IN ('success', 'failed', 'pending')),
  created_at timestamp with time zone DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.daily_digests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_email text NOT NULL,
  digest_date date NOT NULL,
  summary text NOT NULL,
  intelligence_count int DEFAULT 0,
  voice_insights_count int DEFAULT 0,
  stress_tests_run int DEFAULT 0,
  critical_findings text,
  recommendations text,
  sent boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.keyword_alerts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_email text NOT NULL,
  model_id text,
  model_name text,
  keywords text NOT NULL,
  minimum_impact_score numeric DEFAULT 70,
  alert_method text DEFAULT 'email' CHECK (alert_method IN ('email', 'both')),
  is_active boolean DEFAULT true,
  last_alert_date timestamp with time zone,
  alert_count int DEFAULT 0,
  created_at timestamp with time zone DEFAULT now()
);

-- ============================================
-- 13. EXTERNAL INTEGRATIONS
-- ============================================

CREATE TABLE IF NOT EXISTS public.external_data_sources (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_email text NOT NULL,
  source_type text CHECK (source_type IN ('slack', 'notion', 'trello', 'airtable', 'hubspot', 'custom')),
  source_name text NOT NULL,
  connector_id text NOT NULL,
  config jsonb,
  sync_enabled boolean DEFAULT true,
  last_sync timestamp with time zone,
  items_synced int DEFAULT 0,
  intelligence_domains text,
  created_at timestamp with time zone DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.portfolios (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  owner_email text NOT NULL,
  model_ids text,
  collective_risk_score numeric,
  last_stress_test_date timestamp with time zone,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now()
);

-- ============================================
-- 14. INDEXES FOR PERFORMANCE
-- ============================================

CREATE INDEX idx_user_profiles_email ON public.user_profiles(email);
CREATE INDEX idx_user_profiles_workspace ON public.user_profiles(workspace_id);
CREATE INDEX idx_workspace_members_workspace ON public.workspace_members(workspace_id);
CREATE INDEX idx_team_members_workspace ON public.team_members(workspace_id);
CREATE INDEX idx_vision_ideas_user ON public.vision_ideas(user_email);
CREATE INDEX idx_debate_history_idea ON public.debate_history(idea_id);
CREATE INDEX idx_strategic_intel_user ON public.strategic_intelligence(user_email);
CREATE INDEX idx_workflows_workspace ON public.workflows(workspace_id);
CREATE INDEX idx_investors_workspace ON public.investors(workspace_id);
CREATE INDEX idx_content_items_user ON public.content_items(user_email);
CREATE INDEX idx_scraping_jobs_workspace ON public.scraping_jobs(workspace_id);
CREATE INDEX idx_cron_automations_workspace ON public.cron_automations(workspace_id);
CREATE INDEX idx_code_operations_user ON public.code_operations(user_email);
CREATE INDEX idx_project_index_user ON public.project_index(user_email);

-- ============================================
-- 15. ROW LEVEL SECURITY (RLS)
-- ============================================

-- Enable RLS on all tables
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workspaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workspace_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vision_ideas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.debate_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.decision_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.strategic_intelligence ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.investors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workflows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scraping_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.code_operations ENABLE ROW LEVEL SECURITY;

-- User profiles - users see own profile, admins see all
CREATE POLICY "Users can read own profile" ON public.user_profiles
  FOR SELECT USING (auth.uid() = id OR auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Users can update own profile" ON public.user_profiles
  FOR UPDATE USING (auth.uid() = id);

-- Workspaces - owner and members can access
CREATE POLICY "Workspace access for members" ON public.workspaces
  FOR SELECT USING (
    owner_email = auth.jwt() ->> 'email' OR
    EXISTS (
      SELECT 1 FROM public.workspace_members
      WHERE workspace_id = public.workspaces.id
      AND email = auth.jwt() ->> 'email'
    )
  );

-- Vision ideas - user owns or workspace member
CREATE POLICY "Ideas visible to workspace members" ON public.vision_ideas
  FOR SELECT USING (
    user_email = auth.jwt() ->> 'email' OR
    EXISTS (
      SELECT 1 FROM public.workspaces w
      JOIN public.workspace_members wm ON w.id = wm.workspace_id
      WHERE wm.email = auth.jwt() ->> 'email'
    )
  );

-- Content items - user owns or public
CREATE POLICY "Users can read own content" ON public.content_items
  FOR SELECT USING (user_email = auth.jwt() ->> 'email');

-- Strategic intelligence - workspace visibility
CREATE POLICY "Intelligence visible to workspace" ON public.strategic_intelligence
  FOR SELECT USING (
    user_email = auth.jwt() ->> 'email' OR
    EXISTS (
      SELECT 1 FROM public.workspaces w
      JOIN public.workspace_members wm ON w.id = wm.workspace_id
      WHERE wm.email = auth.jwt() ->> 'email'
    )
  );

-- Code operations - user owns
CREATE POLICY "Users can read own operations" ON public.code_operations
  FOR SELECT USING (user_email = auth.jwt() ->> 'email');

-- Investors - workspace access
CREATE POLICY "Investors visible to workspace" ON public.investors
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.workspaces w
      JOIN public.workspace_members wm ON w.id = wm.workspace_id
      WHERE w.id = public.investors.workspace_id
      AND wm.email = auth.jwt() ->> 'email'
    )
  );

-- Workflows - workspace access
CREATE POLICY "Workflows visible to workspace" ON public.workflows
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.workspaces w
      JOIN public.workspace_members wm ON w.id = wm.workspace_id
      WHERE w.id = public.workflows.workspace_id
      AND wm.email = auth.jwt() ->> 'email'
    )
  );