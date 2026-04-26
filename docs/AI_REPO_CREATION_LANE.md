# AI Repo Creation Lane

## Purpose

AI in Action should eventually create new repositories for validated systems. The first proof path remains same-repo sandboxing because it is easier to validate and safer to debug. Once the same-repo invention factory is stable, repository creation can become an allowed capability.

## Current Position

Repo creation is not inherently destructive. The main risks are poor naming, clutter, missing docs, missing validation, accidental secret exposure, and systems being presented as complete before they are tested.

Therefore, AI-created repos should be allowed after the same-repo sandbox path proves reliable.

## Required Repo Template

Every AI-created repo should include:

- README.md
- SYSTEM_CONTRACT.md
- SAFETY_NOTES.md
- VALIDATION.md
- .gitignore
- .github/workflows/validate.yml
- no secrets
- no live paid API activation by default
- parent ledger link back to AI in Action

## Naming Convention

Use:

`aiia-sandbox-<system-slug>`

Examples:

- `aiia-sandbox-skill-drill-coach`
- `aiia-sandbox-business-idea-validator`
- `aiia-sandbox-content-experiment-studio`

## Creation Policy

A repo can be created when:

1. Same-repo sandbox intake works.
2. Same-repo dashboard proof works.
3. Supabase logging works.
4. Vercel deployment checks work.
5. The system can produce a validation issue.
6. The repo template is present.

## Future Workflow

A future workflow can be added:

`.github/workflows/ai-create-sandbox-repo.yml`

Inputs:

- `system_name`
- `system_slug`
- `description`
- `visibility`
- `template_mode`

Default visibility should be private or internal if available, unless public is explicitly requested.

## Promotion Policy

AI-created repos are prototypes until they pass validation. They should not claim production readiness until build, tests, docs, and deployment proof exist.

## Current Next Step

Prove the same-repo invention factory first, then enable repo creation using a dedicated GitHub workflow or GitHub App permission path.
