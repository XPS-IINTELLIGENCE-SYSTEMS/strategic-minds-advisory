# Project Board Operations

## Purpose

The GitHub Project board is the visual command center. GitHub Issues remain the writable task ledger.

## Current Access Pattern

AI can create and update issues, PRs, files, workflows, and docs. Direct GitHub Projects v2 field/card writes may not be available through all connectors.

## Operating Rule

Every major AI in Action system should have an issue. The project board should auto-add or manually include those issues.

## Standard Status Flow

Inbox -> Triage -> Selected for Build -> Building -> Validation -> Ready to Deploy -> Deployed -> Monitoring -> Done

Blocked work goes to:

- Needs Human Input
- Blocked

## Required Issue Fields

- Objective
- Repo/System
- Current State
- Desired State
- Risk Level
- Human Approval Required
- Validation Steps
- Done Definition
- Next AI Action

## Labels

- ai-in-action
- supabase
- vercel
- github-actions
- frontend
- backend
- content
- source-receipts
- human-input-needed
- blocked
- risk:high
- risk:medium
- risk:low
- safe-to-build
- needs-validation
- deployed
