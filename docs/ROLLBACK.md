# Rollback Contract

## Purpose
Define rollback behavior for Strategic Minds Advisory when controlled by AUTO_BUILDER.

## Rollback Triggers
- validation failure
- unsafe changed files
- missing Vercel receipt
- missing Drive receipt
- unexpected production activity
- committed sensitive values
- payment or messaging action outside approval

## Rollback Actions
1. Keep production untouched.
2. Stop promotion beyond preview.
3. Mark workflow status blocked.
4. Write blocker receipt in AUTO_BUILDER.
5. Require operator review before continuing.

## Safe Default
If evidence is missing, treat the workflow as blocked, not approved.
