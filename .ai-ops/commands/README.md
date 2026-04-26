# AI Ops Commands

This folder contains small JSON command files that trigger allowlisted GitHub Actions through `.github/workflows/ai-ops-command-dispatcher.yml`.

## Purpose

The ChatGPT GitHub connector can write files but may not expose direct workflow-dispatch actions. This command bridge lets AI trigger safe operations by committing a command file.

## Allowed Commands

```json
{ "command": "run-supabase-migrations" }
```

```json
{ "command": "run-health-check" }
```

```json
{ "command": "run-cron-failover", "route": "platform-health" }
```

Supported cron failover routes:

- `platform-health`
- `market-check`
- `daily-summary`
- `content-package`
- `all`

## Safety

The dispatcher only supports allowlisted commands. It does not expose secret values. It creates an audit issue after each dispatch attempt.
