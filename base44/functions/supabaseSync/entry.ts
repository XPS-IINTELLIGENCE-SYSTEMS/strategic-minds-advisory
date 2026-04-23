import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

// Sync Base44 entities to Supabase via Edge Function
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
    const SUPABASE_SERVICE_ROLE = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE) {
      return Response.json(
        { error: 'Supabase not configured' },
        { status: 500 }
      );
    }

    const tables = [
      'SavedModel', 'StressTestResult', 'VisionIdea', 'DebateHistory', 
      'ProjectIndex', 'CodeOperation', 'PromptLibrary', 'CronAutomation',
      'ScrapingSchedule', 'PipelineRun', 'ScrapingJob', 'StrategyPlaybook',
      'KeywordAlert', 'DecisionTask', 'TeamMember', 'ExternalDataSource',
      'Portfolio', 'DailyDigest', 'Investor', 'InvestorContactLog',
      'InvestorMeeting', 'Workflow', 'StrategicIntelligence', 'InsightComment',
    ];

    const results = {};

    for (const table of tables) {
      try {
        // Fetch from Base44
        const base44Data = await base44.entities[table]?.list() || [];
        
        if (base44Data.length > 0) {
          // Insert into Supabase via REST API
          const response = await fetch(
            `${SUPABASE_URL}/rest/v1/${table.toLowerCase()}`,
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE}`,
              },
              body: JSON.stringify(base44Data),
            }
          );

          if (response.ok) {
            results[table] = { status: 'success', count: base44Data.length };
          } else {
            const error = await response.text();
            results[table] = { status: 'failed', error };
          }
        }
      } catch (err) {
        results[table] = { status: 'error', error: err.message };
      }
    }

    return Response.json({ success: true, results });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});