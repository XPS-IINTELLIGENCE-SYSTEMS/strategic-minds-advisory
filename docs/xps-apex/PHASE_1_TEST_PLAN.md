# XPS Apex Standard — Phase 1 Test Plan

## Business purpose
Use Strategic Minds Advisory as the test engine for XPS Contractor Success before creating a standalone production system.

## Test module
Route: `/xps-apex`

## Success criteria
- XPS Apex dashboard loads in fallback mode without Supabase tables.
- Supabase migration creates XPS-prefixed tables.
- Dashboard can switch to live Supabase data once environment variables and tables exist.
- Contractor scorecard displays contractors, score, tier, job count, rating, and purchase volume.
- Implementation board displays Phase 1 tasks.
- Signoff panel supports founder/participant review workflow.
- Compliance-safe review workflow avoids incentivized public reviews.

## Validation commands
```bash
npm run typecheck
npm run build
```

## Human approval gates
- Production launch
- Real customer data
- Contractor pricing rules
- Public claims
- Paid API usage
- Destructive database changes
