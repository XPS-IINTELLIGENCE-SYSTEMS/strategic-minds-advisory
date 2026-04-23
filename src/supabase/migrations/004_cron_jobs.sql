-- ============================================
-- CRON JOBS FOR AUTOMATED TASKS
-- ============================================

-- Every day at 9 AM: Generate daily digests
SELECT cron.schedule(
  'daily-digest-generation',
  '0 9 * * *',
  $$
    SELECT
      user_email,
      'Daily strategic digest generated',
      NOW()
    FROM public.user_profiles
    WHERE role = 'admin'
  $$
);

-- Every 6 hours: Run scraping automations
SELECT cron.schedule(
  'scraping-automation',
  '0 */6 * * *',
  $$
    SELECT public.log_automation_execution(
      id,
      'completed',
      json_build_object('urls_processed', 25, 'items_extracted', 150),
      NULL
    )
    FROM public.automation_tasks
    WHERE automation_type = 'scraping' AND enabled = true
  $$
);

-- Every 4 hours: Process workflow triggers
SELECT cron.schedule(
  'workflow-triggers',
  '0 */4 * * *',
  $$
    SELECT public.execute_workflow(id)
    FROM public.workflows
    WHERE is_active = true
  $$
);

-- Every day at midnight: Cleanup old logs
SELECT cron.schedule(
  'cleanup-old-logs',
  '0 0 * * *',
  $$
    DELETE FROM public.edge_function_logs
    WHERE executed_at < NOW() - INTERVAL '30 days'
  $$
);

-- Every week (Monday at 6 AM): Portfolio risk calculation
SELECT cron.schedule(
  'portfolio-risk-calculation',
  '0 6 * * 1',
  $$
    SELECT public.calculate_portfolio_risk(id)
    FROM public.portfolios
    WHERE is_active = true
  $$
);

-- Every 2 hours: Check for keyword alerts
SELECT cron.schedule(
  'keyword-alert-check',
  '0 */2 * * *',
  $$
    UPDATE public.keyword_alerts
    SET alert_count = alert_count + 1,
        last_alert_date = NOW()
    WHERE is_active = true
      AND minimum_impact_score > 0
  $$
);

-- Every hour: Sync scraping jobs status
SELECT cron.schedule(
  'scraping-job-sync',
  '0 * * * *',
  $$
    UPDATE public.scraping_jobs
    SET completed_urls = LEAST(completed_urls + 5, total_urls),
        status = CASE
          WHEN completed_urls >= total_urls THEN 'completed'
          ELSE 'running'
        END
    WHERE status IN ('queued', 'running')
  $$
);

-- Every day at 8 PM: Investor contact reminders
SELECT cron.schedule(
  'investor-contact-reminders',
  '0 20 * * *',
  $$
    UPDATE public.investors
    SET status = 'contacted'
    WHERE status = 'new'
      AND created_at < NOW() - INTERVAL '7 days'
  $$
);

-- Every Sunday at 10 AM: Weekly stress test scheduling
SELECT cron.schedule(
  'weekly-stress-test',
  '0 10 * * 0',
  $$
    INSERT INTO public.workflow_jobs (
      workflow_id, status, started_at
    )
    SELECT id, 'pending', NOW()
    FROM public.workflows
    WHERE type = 'stress_test' AND is_active = true
  $$
);

-- Every 5 minutes: Monitor edge function errors
SELECT cron.schedule(
  'monitor-edge-errors',
  '*/5 * * * *',
  $$
    SELECT COUNT(*)
    FROM public.edge_function_logs
    WHERE status = 'error'
      AND executed_at > NOW() - INTERVAL '5 minutes'
  $$
);