# Complete Migration Guide: Base44 → Supabase

## Current Architecture
```
Base44 (Frontend + Backend as a Service)
  ├─ React Components
  ├─ Entities (Data Storage)
  ├─ Backend Functions
  └─ Automations

GitHub
  └─ Source Code

Vercel
  └─ Frontend Deployment

Supabase (Empty)
  └─ (Ready for backend)
```

## Target Architecture
```
Supabase (Complete Backend)
  ├─ PostgreSQL Database
  │  └─ All entities as tables
  ├─ Edge Functions
  │  └─ All backend logic
  ├─ Auth
  └─ Real-time subscriptions

GitHub
  └─ Source Code

Vercel
  └─ React Frontend

Frontend (React) ← API → Supabase Backend
```

---

## Migration Steps

### Step 1: Verify Supabase Connection

1. Get your Supabase credentials:
   ```bash
   VITE_SUPABASE_URL=https://[project-id].supabase.co
   VITE_SUPABASE_ANON_KEY=[anon-key]
   SUPABASE_SERVICE_ROLE_KEY=[service-role-key]
   ```

2. Set them in your `.env.local`:
   ```bash
   VITE_SUPABASE_URL=your_url
   SUPABASE_SERVICE_ROLE_KEY=your_service_key
   ```

3. Test the connection:
   ```bash
   curl -H "Authorization: Bearer YOUR_SERVICE_KEY" \
     https://[project-id].supabase.co/rest/v1/
   ```

---

### Step 2: Create All Tables in Supabase

Use the migration SQL file we created earlier:

```sql
-- Run this in Supabase SQL Editor
-- File: supabase/migrations/001_initial_schema.sql

-- User Profiles
CREATE TABLE IF NOT EXISTS public.user_profiles (
  id UUID PRIMARY KEY DEFAULT auth.uid(),
  email VARCHAR NOT NULL UNIQUE,
  full_name VARCHAR,
  role VARCHAR DEFAULT 'user',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Workspaces
CREATE TABLE IF NOT EXISTS public.workspaces (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR NOT NULL,
  owner_email VARCHAR NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Vision Ideas
CREATE TABLE IF NOT EXISTS public.vision_ideas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_email VARCHAR NOT NULL,
  title VARCHAR NOT NULL,
  description TEXT,
  business_model VARCHAR,
  status VARCHAR,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Continue with other entities...
-- (Use the full schema from supabase/migrations/001_initial_schema.sql)
```

**Run in Supabase Dashboard:**
1. Go to `SQL Editor`
2. New Query
3. Paste and execute each migration file

---

### Step 3: Export Data from Base44

Call the migration function to fetch all your data:

```bash
# Using the deployed function
curl -X POST https://your-vercel-app.vercel.app/api/functions/migrateToSupabase \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_AUTH_TOKEN"
```

Or invoke from your app:

```javascript
const response = await base44.functions.invoke('migrateToSupabase', {});
console.log(response.data);
// Returns: { success: true, stats: { entitiesMigrated: 28, totalRecords: 1250 } }
```

---

### Step 4: Insert Data into Supabase

After tables are created, insert your exported data:

```javascript
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

// Example: Insert vision ideas
const { data, error } = await supabase
  .from('vision_ideas')
  .insert([
    {
      user_email: 'user@example.com',
      title: 'AI Consulting Platform',
      description: 'Strategic advisory powered by AI',
      business_model: 'SaaS',
      status: 'analyzing'
    }
  ]);

if (error) console.error('Insert failed:', error);
else console.log('Inserted:', data.length, 'records');
```

**Bulk Insert Script** (if you have large amounts of data):

```javascript
async function bulkInsert(supabase, table, records, batchSize = 100) {
  for (let i = 0; i < records.length; i += batchSize) {
    const batch = records.slice(i, i + batchSize);
    const { error } = await supabase
      .from(table)
      .insert(batch);
    
    if (error) {
      console.error(`Batch ${i/batchSize + 1} failed:`, error);
    } else {
      console.log(`Inserted batch ${i/batchSize + 1}: ${batch.length} records`);
    }
  }
}

// Usage
const visionIdeas = [...]; // Your data
await bulkInsert(supabase, 'vision_ideas', visionIdeas);
```

---

### Step 5: Migrate Backend Functions to Supabase Edge Functions

1. **Deploy all functions to Supabase:**

```bash
supabase functions deploy generateExecutiveSummary
supabase functions deploy projectionEngine
supabase functions deploy voiceToInsight
supabase functions deploy aiCompetitiveAnalysis
# ... (deploy all functions from /functions folder)
```

2. **Update API calls in your React code:**

```javascript
// Before (Base44)
const res = await base44.functions.invoke('generateExecutiveSummary', { ... });

// After (Supabase)
const { data, error } = await supabase.functions.invoke('generateExecutiveSummary', {
  body: { ... }
});
```

---

### Step 6: Update Frontend to Use Supabase

Replace Base44 SDK with Supabase client:

```javascript
// Remove
import { base44 } from '@/api/base44Client';

// Add
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

// Example: Fetch data
const { data: ideas } = await supabase
  .from('vision_ideas')
  .select('*')
  .order('created_at', { ascending: false });
```

**Create a utility file** to make the transition smoother:

```javascript
// lib/supabaseClient.js
import { createClient } from '@supabase/supabase-js';

export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

// Wrapper functions
export const db = {
  entities: {
    VisionIdea: {
      list: () => supabase.from('vision_ideas').select('*'),
      create: (data) => supabase.from('vision_ideas').insert([data]),
      update: (id, data) => supabase.from('vision_ideas').update(data).eq('id', id),
      delete: (id) => supabase.from('vision_ideas').delete().eq('id', id),
    },
    // ... add other entities
  }
};
```

---

### Step 7: Set Up Real-time Subscriptions (Optional)

Replace Base44 subscriptions with Supabase:

```javascript
// Before (Base44)
const unsubscribe = base44.entities.VisionIdea.subscribe((event) => {
  console.log(`Idea ${event.id} was ${event.type}d`);
});

// After (Supabase)
const subscription = supabase
  .from('vision_ideas')
  .on('*', (payload) => {
    console.log('Change received!', payload);
  })
  .subscribe();
```

---

### Step 8: Verify Everything Works

**Checklist:**

- [ ] All tables created in Supabase
- [ ] Data inserted into tables
- [ ] Edge Functions deployed
- [ ] Frontend updated to use Supabase
- [ ] Authentication working
- [ ] Real-time subscriptions active (if using)
- [ ] No errors in browser console or Supabase logs

**Test queries:**

```javascript
// Test 1: Fetch data
const { data: users } = await supabase.from('user_profiles').select('*');
console.log('Users found:', users.length);

// Test 2: Insert data
const { data: newIdea, error } = await supabase
  .from('vision_ideas')
  .insert([{ user_email: 'test@example.com', title: 'Test' }])
  .select();
console.log('Insert successful:', !error);

// Test 3: Call Edge Function
const { data, error } = await supabase.functions.invoke('generateExecutiveSummary', {
  body: { /* params */ }
});
console.log('Function works:', !error);
```

---

### Step 9: (Optional) Clean Up Base44 References

Once everything is in Supabase:

1. Remove Base44 dependencies from `package.json`
2. Remove Base44 auth provider wrapper
3. Use only Supabase for auth going forward
4. Archive old code if needed

---

## Complete Data Export Script

Run this in your dashboard to export everything:

```javascript
async function exportAllData() {
  const base44 = window.base44; // If available in window
  
  const entities = [
    'User', 'Workspace', 'VisionIdea', 'StressTestResult',
    'StrategicIntelligence', 'DebateHistory', 'DecisionTask',
    'StrategyPlaybook', 'ContentItem', 'AutomationTask'
  ];

  const exportData = {};

  for (const entity of entities) {
    try {
      const records = await base44.entities[entity].list('-created_date', 10000);
      exportData[entity] = records;
      console.log(`✓ ${entity}: ${records.length} records`);
    } catch (e) {
      console.log(`✗ ${entity}: ${e.message}`);
    }
  }

  // Download as JSON
  const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `export-${new Date().toISOString().split('T')[0]}.json`;
  a.click();
}

exportAllData();
```

---

## Troubleshooting

**Q: Nothing appears in Supabase after running migration**
- A: Check that `SUPABASE_SERVICE_ROLE_KEY` is set correctly
- A: Verify RLS policies aren't blocking inserts
- A: Check Supabase function logs for errors

**Q: Data types don't match**
- A: Supabase uses PostgreSQL types; adjust as needed:
  - `text` for strings
  - `numeric` or `integer` for numbers
  - `boolean` for booleans
  - `timestamp` for dates
  - `jsonb` for complex objects

**Q: Authentication not working**
- A: Make sure Supabase Auth is enabled in dashboard
- A: Update your login flow to use Supabase instead of Base44

**Q: Edge Functions not deploying**
- A: Run `supabase functions deploy --help`
- A: Check function names don't have special characters
- A: Ensure Deno syntax is correct

---

## Summary

You now have:
✅ All data migrated to Supabase PostgreSQL  
✅ All backend functions as Edge Functions  
✅ Frontend connected to Supabase  
✅ Complete independence from Base44  
✅ Self-hosted backend infrastructure  

Your app is now fully on **Supabase + Vercel + GitHub** 🚀