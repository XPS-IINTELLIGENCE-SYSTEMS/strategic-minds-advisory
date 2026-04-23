# Vercel + Supabase Migration Guide

## Setup Steps

### 1. Supabase Setup
- Create a Supabase project at https://supabase.com
- Run `supabase-migration.sql` in the SQL Editor to create the schema
- Get your `SUPABASE_URL` and `SUPABASE_ANON_KEY` from Project Settings > API

### 2. Environment Variables
Copy `.env.example` to `.env.local` and fill in:
```
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
GROQ_API_KEY=
CRON_SECRET=<random-secure-string>
BRIGHTDATA_API_KEY=
```

### 3. Vercel Deployment
```bash
npm run build
npx vercel
```

Add environment variables in Vercel Dashboard > Settings > Environment Variables

### 4. PWA Setup
The app now includes:
- `public/manifest.json` - PWA metadata
- `public/service-worker.js` - Offline support
- Service worker registration in `src/main.jsx`

### 5. Cron Jobs
Vercel crons are configured in `vercel.json`:
- Daily digest: 9 AM ET (0 9 * * *)
- Weekly report: Monday 9 AM ET (0 9 * * 1)

### 6. API Routes
All serverless functions are in `/api`:
- `/api/groq-chat` - Groq LLM endpoint
- `/api/cron/daily-digest` - Daily digest generator
- `/api/cron/weekly-report` - Weekly report (create in api/cron/)

## Migration from Base44
1. Export entities from Base44
2. Transform data to match Supabase schema
3. Import using Supabase admin UI or SQL
4. Update frontend SDK calls to use new Vercel endpoints

## Key Changes
- ✅ Vercel serverless functions (api/)
- ✅ Supabase PostgreSQL + Auth
- ✅ Groq LLM for AI features
- ✅ PWA support (offline-first)
- ✅ Cron jobs for automation
- ✅ Removed floating chat widget
- ✅ Added Supabase auth to navbar
- ✅ Hamburger menu with sign in/up on desktop