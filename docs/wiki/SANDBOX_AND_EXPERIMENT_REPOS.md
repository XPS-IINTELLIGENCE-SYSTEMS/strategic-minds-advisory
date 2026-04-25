# Sandbox and Experiment Repos

## Purpose

Sandbox and experiment repos allow AI to test ideas without risking production.

## Repo Classifications

Every repo must be classified as one of:

```text
production-linked
sandbox
experiment
template-source
reference-only
deprecated
```

## Sandbox Rules

AI may be more experimental in sandbox repos, but still must not expose secrets, fabricate proof, claim fake results, commit passwords, perform real-money actions, or violate source/platform terms.

## Experiment Intake Checklist

When a new repo is added, create an issue with:

```markdown
# Repo Name

# Repo URL

# Classification

production-linked / sandbox / experiment / template-source / reference-only / deprecated

# Purpose

# Useful Assets

# Risks

# Dependencies

# Should AI extract anything?

# Should AI modify this repo?

# Should this connect to Supabase?

# Should this connect to Vercel?

# Decision

USE NOW / USE LATER / REFERENCE ONLY / REJECT
```

## Extraction Rule

AI should extract useful patterns, schemas, components, workflows, safe logic, and docs.

AI should avoid wholesale imports, stale dependencies, duplicate frameworks, secret-bearing files, risky autonomy, unclear licensing, and paid-service lock-in unless approved.
