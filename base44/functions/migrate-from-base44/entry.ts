// This function migrates all data from Base44 to Supabase
// Run once during initial setup
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_SERVICE_ROLE_KEY
);

// Entity tables that exist in Base44
const ENTITY_TABLES = [
  'SavedModel', 'StressTestResult', 'VisionIdea', 'DebateHistory', 'ProjectIndex',
  'CodeOperation', 'PromptLibrary', 'CronAutomation', 'ScrapingSchedule', 'PipelineRun',
  'ScrapingJob', 'StrategyPlaybook', 'KeywordAlert', 'DecisionTask', 'TeamMember',
  'ExternalDataSource', 'Portfolio', 'DailyDigest', 'Investor', 'InvestorContactLog',
  'InvestorMeeting', 'Workflow', 'StrategicIntelligence', 'InsightComment',
  'WorkspaceMember', 'Workspace', 'DataIngestionSource', 'CompetitorBenchmark',
  'IntelligenceSource', 'AgentTask', 'ContactInquiry', 'VisionLog', 'ChatMemory',
  'SocialIntelligence', 'AutomationTask', 'SimulationResult', 'ContentItem',
  'WorkflowJob', 'Booking'
];

export async function migrateFromBase44(req) {
  try {
    const results = {};

    for (const table of ENTITY_TABLES) {
      try {
        // Fetch from Base44 (placeholder - replace with actual Base44 client call)
        const base44Data = await fetchFromBase44(table);
        
        if (base44Data && base44Data.length > 0) {
          // Insert into Supabase
          const { error } = await supabase
            .from(table.toLowerCase())
            .insert(base44Data);
          
          results[table] = {
            status: error ? 'failed' : 'success',
            count: base44Data.length,
            error: error?.message,
          };
        } else {
          results[table] = { status: 'skipped', count: 0 };
        }
      } catch (err) {
        results[table] = { status: 'error', error: err.message };
      }
    }

    return new Response(JSON.stringify({ success: true, results }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

async function fetchFromBase44(table) {
  // TODO: Replace with actual Base44 client call
  // const { base44 } = await import('@/api/base44Client');
  // return await base44.entities[table].list();
  return [];
}