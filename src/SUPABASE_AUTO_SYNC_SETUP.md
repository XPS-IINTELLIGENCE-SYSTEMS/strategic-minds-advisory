# Automatic Base44 ↔ Supabase Sync Setup

## What This Does

Every time you create, update, or delete data in Base44, it automatically syncs to Supabase in real-time.

```
Base44 Entity Change
    ↓
Automation Triggered
    ↓
autoSyncToSupabase Function
    ↓
Supabase Table Updated
    ✓ Done
```

---

## Setup (3 Steps)

### Step 1: Verify Supabase Connected

You already have **Supabase** registered as an app user connector. Just make sure the user has authorized it:

1. Go to Dashboard → Settings
2. Look for **Supabase** connector
3. If not authorized, click **Connect** and authenticate with your Supabase account

### Step 2: Create Automations for Each Entity

For each entity you want to sync, create an automation:

```javascript
// Example: Sync VisionIdea entity

await base44.createAutomation({
  automation_type: 'entity',
  name: 'Sync VisionIdea to Supabase',
  function_name: 'autoSyncToSupabase',
  entity_name: 'VisionIdea',
  event_types: ['create', 'update', 'delete'],
  is_active: true,
});
```

**Quick Setup** — Run this in your browser console to create all automations at once:

```javascript
const ENTITIES_TO_SYNC = [
  'VisionIdea', 'StressTestResult', 'StrategicIntelligence', 'DebateHistory',
  'DecisionTask', 'StrategyPlaybook', 'ContentItem', 'AutomationTask',
  'PromptLibrary', 'Workflow', 'Investor', 'InvestorContactLog',
  'TeamMember', 'ExternalDataSource', 'Portfolio', 'DailyDigest'
];

async function createSyncAutomations() {
  for (const entity of ENTITIES_TO_SYNC) {
    try {
      const result = await base44.createAutomation({
        automation_type: 'entity',
        name: `Sync ${entity} to Supabase`,
        function_name: 'autoSyncToSupabase',
        entity_name: entity,
        event_types: ['create', 'update', 'delete'],
        is_active: true,
      });
      console.log(`✓ Created automation for ${entity}`);
    } catch (error) {
      console.log(`⊘ ${entity}: ${error.message}`);
    }
  }
  console.log('All sync automations created!');
}

createSyncAutomations();
```

### Step 3: Ensure Tables Exist in Supabase

Before syncing starts, create all tables in Supabase using the SQL migrations:

**Copy the full SQL schema** from `supabase/migrations/001_initial_schema.sql` into Supabase SQL Editor and run it.

---

## How It Works

**Real-time Sync Flow:**

```
You update a VisionIdea in Base44
    ↓
Base44 detects entity update
    ↓
Automation triggers → autoSyncToSupabase function
    ↓
Function gets Supabase connection for current user
    ↓
Function sends PATCH request to Supabase
    ↓
Supabase updates the row
    ✓ Data is now in Supabase
```

**What gets synced:**
- ✓ All fields from Base44 entity
- ✓ Timestamp of sync
- ✓ Event type (create/update/delete)
- ✓ Original Base44 ID preserved

---

## Verify It's Working

### Method 1: Dashboard

1. Go to Dashboard → Automations
2. Look for `Sync * to Supabase` automations
3. Check status = "active"

### Method 2: Supabase

1. Open Supabase Dashboard
2. Go to SQL Editor
3. Run a test query:
   ```sql
   SELECT COUNT(*) FROM vision_ideas;
   ```
4. Should show records synced from Base44

### Method 3: Console

Make a test record change:

```javascript
// Create a test vision idea
const idea = await base44.entities.VisionIdea.create({
  title: 'Test Sync',
  description: 'Testing automation',
  business_model: 'SaaS'
});

// It should auto-sync to Supabase within seconds
// Check Supabase dashboard to verify
```

---

## Troubleshooting

**"Supabase not connected"**
- Go to Settings and authorize the Supabase connector
- Make sure you're logged into the same Supabase account

**"Table doesn't exist"**
- Create the tables in Supabase using the SQL migrations first
- Table names must match (lowercase entity names)

**"Sync failing silently"**
- Check automation logs in Dashboard → Automations
- Check Supabase function logs for errors

**"Old records not syncing"**
- Automations only trigger on NEW changes, not past data
- Use `migrateToSupabase` function to import existing data first

---

## Advanced: Selective Sync

Only sync certain entities or fields:

```javascript
// Update automation with trigger conditions
await base44.updateAutomation(automationId, {
  trigger_conditions: {
    logic: 'and',
    conditions: [
      {
        field: 'data.status',
        operator: 'not_equals',
        value: 'draft'
      }
    ]
  }
});
```

This only syncs records where status is NOT "draft".

---

## Advanced: Sync Specific Workspace

```javascript
await base44.createAutomation({
  automation_type: 'entity',
  name: 'Sync VisionIdea to Supabase (Active Workspace)',
  function_name: 'autoSyncToSupabase',
  entity_name: 'VisionIdea',
  event_types: ['create', 'update'],
  trigger_conditions: {
    conditions: [
      {
        field: 'data.workspace_id',
        operator: 'equals',
        value: 'your-workspace-id'
      }
    ]
  }
});
```

---

## Summary

✅ **Automated Real-time Sync**
- Every Base44 change → Supabase
- No manual exports needed
- Data stays in sync automatically

✅ **Set and Forget**
- Create automations once
- They run forever
- Handle all CRUD operations

✅ **Hybrid Architecture**
- Use Base44 frontend + API
- Data synced to Supabase automatically
- Can gradually migrate to Supabase backend

Your data is now flowing → Supabase automatically! 🚀