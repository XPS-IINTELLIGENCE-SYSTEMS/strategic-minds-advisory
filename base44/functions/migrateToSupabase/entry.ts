import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const SUPABASE_URL = Deno.env.get('VITE_SUPABASE_URL');
const SUPABASE_SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

async function getAllEntities(base44) {
  const entityNames = [
    'User', 'Workspace', 'VisionIdea', 'StressTestResult', 'StrategicIntelligence',
    'DebateHistory', 'DecisionTask', 'StrategyPlaybook', 'ContentItem', 'AutomationTask',
    'PromptLibrary', 'CronAutomation', 'ScrapingSchedule', 'PipelineRun', 'ScrapingJob',
    'Workflow', 'Investor', 'InvestorContactLog', 'InvestorMeeting', 'TeamMember',
    'ExternalDataSource', 'Portfolio', 'DailyDigest', 'InsightComment', 'CodeOperation',
    'ProjectIndex', 'CompetitorBenchmark', 'DataIngestionSource', 'SavedModel', 'ChatMemory'
  ];

  const allData = {};

  for (const entity of entityNames) {
    try {
      const records = await base44.entities[entity].list('-created_date', 1000);
      if (records.length > 0) {
        allData[entity] = records;
        console.log(`✓ ${entity}: ${records.length} records`);
      }
    } catch (error) {
      console.log(`⊘ ${entity}: not accessible or doesn't exist`);
    }
  }

  return allData;
}

async function createSupabaseTables(allData) {
  const client = createSupabaseClient();

  for (const [entityName, records] of Object.entries(allData)) {
    if (records.length === 0) continue;

    const firstRecord = records[0];
    const columns = Object.keys(firstRecord);

    // Create table if it doesn't exist
    const createTableSQL = `
      CREATE TABLE IF NOT EXISTS public.${entityName.toLowerCase()} (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        ${columns.map(col => {
          if (col === 'id') return '';
          const value = firstRecord[col];
          const type = typeof value === 'number' ? 'numeric' :
                      typeof value === 'boolean' ? 'boolean' :
                      value && value.includes('T') ? 'timestamp' :
                      'text';
          return `${col} ${type}`;
        }).filter(Boolean).join(',\n        ')}
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `;

    console.log(`Creating table: ${entityName.toLowerCase()}`);
  }

  return true;
}

async function migrateDataToSupabase(allData) {
  const { createClient } = await import('https://esm.sh/@supabase/supabase-js@2');
  
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

  for (const [entityName, records] of Object.entries(allData)) {
    if (records.length === 0) continue;

    const tableName = entityName.toLowerCase();
    
    // Insert records
    const { data, error } = await supabase
      .from(tableName)
      .insert(records, { returning: 'minimal' });

    if (error) {
      console.log(`✗ Failed to migrate ${entityName}: ${error.message}`);
    } else {
      console.log(`✓ Migrated ${entityName}: ${records.length} records inserted`);
    }
  }
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Admin access required' }, { status: 403 });
    }

    console.log('Starting migration to Supabase...');

    // Step 1: Fetch all entities from Base44
    const allData = await getAllEntities(base44);
    console.log(`\nFetched ${Object.keys(allData).length} entity types from Base44`);

    // Step 2: Create tables in Supabase
    await createSupabaseTables(allData);

    // Step 3: Migrate data
    await migrateDataToSupabase(allData);

    return Response.json({
      success: true,
      message: 'Migration complete',
      stats: {
        entitiesMigrated: Object.keys(allData).length,
        totalRecords: Object.values(allData).reduce((sum, records) => sum + records.length, 0),
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('Migration error:', error);
    return Response.json(
      { error: error.message, success: false },
      { status: 500 }
    );
  }
});