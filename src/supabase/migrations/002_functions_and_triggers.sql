-- ============================================
-- SUPABASE FUNCTIONS & TRIGGERS
-- ============================================

-- ============================================
-- 1. USER PROFILE TRIGGER
-- ============================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.user_profiles (id, email, full_name, role)
  VALUES (new.id, new.email, new.raw_user_meta_data->>'full_name', 'user');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- 2. UPDATED_AT TRIGGERS
-- ============================================

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON public.user_profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_workspaces_updated_at
  BEFORE UPDATE ON public.workspaces
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_vision_ideas_updated_at
  BEFORE UPDATE ON public.vision_ideas
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_strategic_intelligence_updated_at
  BEFORE UPDATE ON public.strategic_intelligence
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_investors_updated_at
  BEFORE UPDATE ON public.investors
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_content_items_updated_at
  BEFORE UPDATE ON public.content_items
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_decision_tasks_updated_at
  BEFORE UPDATE ON public.decision_tasks
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================
-- 3. PROJECT INDEXING FUNCTION
-- ============================================

CREATE OR REPLACE FUNCTION public.create_or_update_project_index(
  p_user_email text,
  p_project_name text,
  p_vercel_project_id text,
  p_github_repo_url text
)
RETURNS json AS $$
DECLARE
  v_result json;
BEGIN
  INSERT INTO public.project_index (
    user_email, project_name, vercel_project_id, github_repo_url, last_indexed
  ) VALUES (
    p_user_email, p_project_name, p_vercel_project_id, p_github_repo_url, now()
  )
  ON CONFLICT (user_email, project_name) DO UPDATE
  SET vercel_project_id = p_vercel_project_id,
      github_repo_url = p_github_repo_url,
      last_indexed = now();

  SELECT row_to_json(row) INTO v_result
  FROM (
    SELECT id, project_name, last_indexed
    FROM public.project_index
    WHERE user_email = p_user_email AND project_name = p_project_name
    LIMIT 1
  ) row;

  RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 4. WORKSPACE CREATION FUNCTION
-- ============================================

CREATE OR REPLACE FUNCTION public.create_workspace(
  p_name text,
  p_owner_email text,
  p_description text DEFAULT NULL
)
RETURNS json AS $$
DECLARE
  v_workspace_id uuid;
  v_result json;
BEGIN
  INSERT INTO public.workspaces (name, owner_email, description)
  VALUES (p_name, p_owner_email, p_description)
  RETURNING id INTO v_workspace_id;

  INSERT INTO public.workspace_members (workspace_id, email, role)
  VALUES (v_workspace_id, p_owner_email, 'owner');

  UPDATE public.user_profiles
  SET workspace_id = v_workspace_id
  WHERE email = p_owner_email;

  SELECT row_to_json(row) INTO v_result
  FROM (
    SELECT id, name, owner_email, description, created_at
    FROM public.workspaces WHERE id = v_workspace_id
  ) row;

  RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 5. STRESS TEST AUTOMATION
-- ============================================

CREATE OR REPLACE FUNCTION public.store_stress_test_result(
  p_idea_id uuid,
  p_scenario_name text,
  p_outcome text,
  p_impact_score numeric,
  p_pivot_strategy text,
  p_result_data json
)
RETURNS json AS $$
DECLARE
  v_result json;
BEGIN
  INSERT INTO public.stress_test_results (
    idea_id, scenario_name, outcome, impact_score, pivot_strategy, result_data
  ) VALUES (
    p_idea_id, p_scenario_name, p_outcome, p_impact_score, p_pivot_strategy, p_result_data
  )
  RETURNING row_to_json(stress_test_results.*) INTO v_result;

  RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 6. INTELLIGENCE ANALYSIS FUNCTION
-- ============================================

CREATE OR REPLACE FUNCTION public.add_strategic_intelligence(
  p_user_email text,
  p_source_type text,
  p_title text,
  p_content text,
  p_sentiment text DEFAULT 'neutral',
  p_impact_score numeric DEFAULT 5
)
RETURNS json AS $$
DECLARE
  v_result json;
BEGIN
  INSERT INTO public.strategic_intelligence (
    user_email, source_type, title, content, sentiment, impact_score
  ) VALUES (
    p_user_email, p_source_type, p_title, p_content, p_sentiment, p_impact_score
  )
  RETURNING row_to_json(strategic_intelligence.*) INTO v_result;

  RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 7. WORKFLOW EXECUTION FUNCTION
-- ============================================

CREATE OR REPLACE FUNCTION public.execute_workflow(
  p_workflow_id uuid
)
RETURNS json AS $$
DECLARE
  v_workflow record;
  v_job_id uuid;
  v_result json;
BEGIN
  SELECT * INTO v_workflow FROM public.workflows WHERE id = p_workflow_id;

  IF v_workflow IS NULL THEN
    RETURN json_build_object('error', 'Workflow not found');
  END IF;

  INSERT INTO public.workflow_jobs (workflow_id, status)
  VALUES (p_workflow_id, 'running')
  RETURNING id INTO v_job_id;

  UPDATE public.workflows
  SET last_triggered = now(), execution_count = execution_count + 1
  WHERE id = p_workflow_id;

  SELECT row_to_json(row) INTO v_result
  FROM (
    SELECT v_job_id as job_id, 'running' as status, now() as started_at
  ) row;

  RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 8. DECISION TO TASKS CONVERTER
-- ============================================

CREATE OR REPLACE FUNCTION public.convert_decision_to_tasks(
  p_debate_id uuid,
  p_idea_id uuid,
  p_decision text,
  p_tasks json
)
RETURNS json AS $$
DECLARE
  v_result json;
BEGIN
  INSERT INTO public.decision_tasks (
    debate_id, idea_id, decision, tasks, status
  ) VALUES (
    p_debate_id, p_idea_id, p_decision, p_tasks, 'created'
  )
  RETURNING row_to_json(decision_tasks.*) INTO v_result;

  RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 9. SCRAPING JOB TRACKER
-- ============================================

CREATE OR REPLACE FUNCTION public.create_scraping_job(
  p_workspace_id uuid,
  p_user_email text,
  p_urls json
)
RETURNS json AS $$
DECLARE
  v_job_id text;
  v_result json;
BEGIN
  v_job_id := gen_random_uuid()::text;

  INSERT INTO public.scraping_jobs (
    workspace_id, user_email, job_id, urls, status, total_urls
  ) VALUES (
    p_workspace_id, p_user_email, v_job_id, p_urls, 'queued',
    json_array_length(p_urls)
  )
  RETURNING row_to_json(scraping_jobs.*) INTO v_result;

  RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 10. INVESTOR STATUS TRACKING
-- ============================================

CREATE OR REPLACE FUNCTION public.log_investor_contact(
  p_investor_id uuid,
  p_contact_type text,
  p_notes text,
  p_sentiment text DEFAULT 'neutral',
  p_outcome text DEFAULT NULL
)
RETURNS json AS $$
DECLARE
  v_result json;
BEGIN
  INSERT INTO public.investor_contact_logs (
    investor_id, contact_type, notes, sentiment, outcome
  ) VALUES (
    p_investor_id, p_contact_type, p_notes, p_sentiment, p_outcome
  )
  RETURNING row_to_json(investor_contact_logs.*) INTO v_result;

  UPDATE public.investors
  SET last_contact = now()
  WHERE id = p_investor_id;

  RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 11. CONTENT GENERATION LOGGER
-- ============================================

CREATE OR REPLACE FUNCTION public.log_content_generation(
  p_user_email text,
  p_title text,
  p_body text,
  p_content_type text,
  p_tone text DEFAULT NULL,
  p_length int DEFAULT NULL
)
RETURNS json AS $$
DECLARE
  v_result json;
BEGIN
  INSERT INTO public.content_items (
    user_email, title, body, content_type, tone, length
  ) VALUES (
    p_user_email, p_title, p_body, p_content_type, p_tone, p_length
  )
  RETURNING row_to_json(content_items.*) INTO v_result;

  RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 12. DAILY DIGEST GENERATOR
-- ============================================

CREATE OR REPLACE FUNCTION public.generate_daily_digest(
  p_user_email text,
  p_summary text,
  p_critical_findings text DEFAULT NULL,
  p_recommendations text DEFAULT NULL
)
RETURNS json AS $$
DECLARE
  v_intel_count int;
  v_result json;
BEGIN
  SELECT COUNT(*) INTO v_intel_count
  FROM public.strategic_intelligence
  WHERE user_email = p_user_email
  AND DATE(created_at) = CURRENT_DATE;

  INSERT INTO public.daily_digests (
    user_email, digest_date, summary, intelligence_count,
    critical_findings, recommendations
  ) VALUES (
    p_user_email, CURRENT_DATE, p_summary, v_intel_count,
    p_critical_findings, p_recommendations
  )
  RETURNING row_to_json(daily_digests.*) INTO v_result;

  RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 13. PORTFOLIO RISK AGGREGATION
-- ============================================

CREATE OR REPLACE FUNCTION public.calculate_portfolio_risk(
  p_portfolio_id uuid
)
RETURNS numeric AS $$
DECLARE
  v_collective_risk numeric;
BEGIN
  SELECT AVG(impact_score)::numeric INTO v_collective_risk
  FROM (
    SELECT p.model_ids,
           (SELECT AVG(CAST(impact_score AS numeric))
            FROM public.stress_test_results
            WHERE idea_id::text = ANY(string_to_array(p.model_ids, ',')))
    FROM public.portfolios p
    WHERE p.id = p_portfolio_id
  ) t;

  UPDATE public.portfolios
  SET collective_risk_score = v_collective_risk,
      last_stress_test_date = now()
  WHERE id = p_portfolio_id;

  RETURN COALESCE(v_collective_risk, 0);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 14. AUTOMATION EXECUTION LOG
-- ============================================

CREATE OR REPLACE FUNCTION public.log_automation_execution(
  p_automation_id uuid,
  p_status text,
  p_result json DEFAULT NULL,
  p_error_message text DEFAULT NULL
)
RETURNS json AS $$
DECLARE
  v_automation record;
  v_result json;
BEGIN
  SELECT * INTO v_automation FROM public.automation_tasks WHERE id = p_automation_id;

  UPDATE public.automation_tasks
  SET status = p_status,
      result = p_result,
      last_run = now()
  WHERE id = p_automation_id;

  SELECT row_to_json(row) INTO v_result
  FROM (
    SELECT id, name, status, last_run, result
    FROM public.automation_tasks WHERE id = p_automation_id
  ) row;

  RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 15. CRON JOB SCHEDULER
-- ============================================

CREATE OR REPLACE FUNCTION public.schedule_cron_automation(
  p_workspace_id uuid,
  p_created_by text,
  p_name text,
  p_type text,
  p_cron_expression text,
  p_config json DEFAULT NULL
)
RETURNS json AS $$
DECLARE
  v_result json;
  v_cron_id uuid;
BEGIN
  INSERT INTO public.cron_automations (
    workspace_id, created_by, name, type, cron_expression, config
  ) VALUES (
    p_workspace_id, p_created_by, p_name, p_type, p_cron_expression, p_config
  )
  RETURNING id INTO v_cron_id;

  -- Schedule actual cron job (see pg_cron setup below)
  SELECT row_to_json(row) INTO v_result
  FROM (
    SELECT v_cron_id as id, p_name as name, p_cron_expression as schedule
  ) row;

  RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;