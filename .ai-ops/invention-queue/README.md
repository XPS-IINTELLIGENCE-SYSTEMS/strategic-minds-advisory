# AI Invention Factory Batch Queue

This folder stores bounded sandbox invention queue files.

## Queue file format

Each queue file is JSON:

```json
{
  "batch_name": "starter-batch",
  "deploy_after_batch": true,
  "max_items": 3,
  "requests": [
    {
      "system_name": "AI Example System",
      "system_slug": "ai-example-system",
      "description": "Plain-English sandbox system description.",
      "objective": "Proof objective.",
      "safety": [
        "Sandbox-only until promoted.",
        "No public publishing without approval.",
        "No paid API activation without approval.",
        "No secret values in code, issues, logs, or frontend."
      ]
    }
  ]
}
```

## Batch rules

- Process only sandbox inventions.
- Default max batch size is 3.
- Stop on invalid JSON, missing slug, duplicate unsafe slug, generator failure, deploy failure, or validation failure.
- Deploy once after generation.
- Validate each generated API route after deployment.
- Create GitHub issues for proof and blockers.
- Do not create new repos from this queue until same-repo proof is stable.
- Do not activate paid APIs, real-money operations, or public publishing without approval.
