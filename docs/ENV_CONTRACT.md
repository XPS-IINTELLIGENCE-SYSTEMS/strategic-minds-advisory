# Environment Contract

## Purpose
List required environment variable names for Strategic Minds Advisory AUTO_BUILDER sync. Values must never be committed.

## Rule
Only variable names are documented here. Secret values must be stored in Vercel project settings or provider dashboards.

## Required Names
- AUTO_BUILDER_SYNC_SECRET
- AUTO_BUILDER_CONTROL_REPO
- AUTO_BUILDER_TARGET_REPO
- AUTO_BUILDER_MODE
- VERCEL_AI_GATEWAY_API_KEY
- SUPABASE_URL
- SUPABASE_ANON_KEY
- STRIPE_WEBHOOK_SECRET
- TWILIO_FROM_NUMBER
- GOOGLE_DRIVE_ROOT_FOLDER_ID
- CRON_SECRET

## Private Server Only Names
- SUPABASE_SERVICE_ROLE_KEY
- STRIPE_SECRET_KEY
- TWILIO_ACCOUNT_SID
- TWILIO_AUTH_TOKEN
- GOOGLE_CLIENT_EMAIL
- GOOGLE_PRIVATE_KEY
- OPENAI_API_KEY

## Blocked
Do not commit values. Do not paste values in chat. Do not expose server-only names to client bundles.
