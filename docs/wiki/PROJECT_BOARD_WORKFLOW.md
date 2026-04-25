# Project Board Workflow

## Purpose

The project board is the command center for AI in Action.

It tracks builds, experiments, migrations, deployments, content packages, source-validation work, sandbox repos, human blockers, and approval gates.

## Standard Flow

```text
Inbox
-> Triage
-> Selected for Build
-> Building
-> Validation
-> Ready to Deploy
-> Deployed
-> Monitoring
-> Done
```

If blocked:

```text
Needs Human Input
Blocked
```

## Issue Types

### Build Task

Used when AI needs to implement code, migrations, pages, routes, or components.

### Research Task

Used when AI needs to evaluate a market, source, tool, trend, or system.

### Simulation Task

Used when AI models possible outcomes.

### Content Task

Used for video scripts, avatar jobs, social packages, newsletters, and reports.

### Risk / Compliance Task

Used when a claim, workflow, or automation needs approval.

### Human Input Task

Used when AI needs a password, secret, account approval, repo access, or business decision.

## Required Fields

Every issue should include:

```text
Objective
Repo
System
Risk Level
Human Approval Required
Validation Steps
Done Definition
Next AI Action
```

## Project Board Rules

- Every AI build should have an issue.
- Every risky production change should have a review path.
- Every unresolved blocker should be visible.
- Every repo added to the system should have a registry issue.
- Every public claim should be source-backed.
- Every failed deployment or migration should become a tracked item.

## Close Criteria

An issue can be closed only when:

- work is committed
- deployment status is known
- data state is known
- docs are updated when needed
- no secrets are exposed
- human approval is recorded if required
