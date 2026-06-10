# Validation Agent Contract

## Purpose
Define the evidence required before Strategic Minds Advisory accepts output routed from AUTO_BUILDER.

## Source of Agent
AUTO_BUILDER owns the validation agent. Strategic Minds Advisory receives validation status and stores the contract.

## Required Checks
1. Homepage files unchanged.
2. UI files unchanged.
3. No direct main branch write.
4. No secret values in commits.
5. Production not deployed by this workflow.
6. SMS not sent by this workflow.
7. Live payments not processed by this workflow.
8. Vercel preview or workflow receipt exists before promotion.
9. Drive receipt exists before promotion.
10. AUTO_BUILDER project registration exists.

## Result Shape
- status: pass | warning | fail
- repo: target repository
- branch: feature branch
- changed_files: list
- blockers: list
- receipts: list
- production_ready: false unless operator approved

## Failure Rule
Any failed safety check keeps the workflow blocked and requires operator review.
