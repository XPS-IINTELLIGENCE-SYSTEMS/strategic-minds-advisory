# AI Ops Command Bridge

## Purpose

The AI Ops Command Bridge gives AI a GitHub-native way to trigger approved operations without needing direct UI-click access to GitHub Actions.

The ChatGPT GitHub connector can create files. The dispatcher workflow watches `.ai-ops/commands/*.json` and dispatches allowlisted workflows.

## Dispatcher Workflow

`.github/workflows/ai-ops-command-dispatcher.yml`

## Allowed Commands

### Run Supabase migrations

```json
{
  "command": "run-supabase-migrations",
  "reason": "Apply and verify Supabase migrations for AI in Action Labs"
}
```

### Run health check

```json
{
  "command": "run-health-check",
  "reason": "Verify deployed AI in Action runtime health"
}
```

### Run cron failover

```json
{
  "command": "run-cron-failover",
  "route": "platform-health",
  "reason": "Trigger platform health run from GitHub Actions"
}
```

## Supported Cron Routes

- `platform-health`
- `market-check`
- `daily-summary`
- `content-package`
- `all`

## Safety Model

The bridge only dispatches allowlisted workflows:

- Supabase migrations
- health check
- cron failover

It does not expose secret values.
It does not run arbitrary shell from command files.
It does not bypass admin approval gates.
It creates an audit issue after each dispatch attempt.

## How AI Uses It

AI creates a unique JSON file under `.ai-ops/commands/`, for example:

`.ai-ops/commands/run-supabase-migrations-20260425T235900Z.json`

That commit triggers the dispatcher, and the dispatcher triggers the target workflow.

## Remaining Human Gates

Humans still control:

- secret values
- paid API activation
- public publishing approval
- destructive operations
- real-money account access
