# Release Gate Contract

## Purpose
Define the gate required before any Strategic Minds Advisory AUTO_BUILDER output can move beyond preview.

## Required Evidence
1. AUTO_BUILDER project registration committed.
2. Strategic Minds sync docs committed.
3. Vercel preview receipt exists.
4. Validation report passes.
5. Drive receipt exists.
6. No homepage or UI files changed in sync branch.
7. No direct main branch writes.
8. No committed secret values.
9. Operator approval recorded.

## Blocked Without Approval
- production deployment
- live payment activation
- live SMS sending
- customer-facing messages
- pricing changes
- destructive database operations

## Default Status
preview_only until operator approval is recorded.
