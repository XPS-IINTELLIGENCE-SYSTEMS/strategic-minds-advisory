# Redis Availability Notes

Redis is available for AI In Action infrastructure.

## Intended use

Redis should be used as a lightweight runtime coordination layer, not as the durable source of truth.

Use Redis for:

- worker locks
- rate limits
- short-lived cache
- queue claim guards
- run de-duplication
- health pings
- temporary agent memory
- cooldown windows

Use Supabase for durable records:

- ai_work_queue
- ai_worker_runs
- ai_cost_ledger
- ai_proof_logs
- ai_revenue_experiments
- ai_products
- ai_content_queue
- ai_approval_gates
- ai_simulated_accounts
- ai_simulated_portfolio
- ai_agent_decisions
- ai_agent_reflections

## Safety rules

- Do not store secrets in Redis.
- Do not use Redis as the only proof ledger.
- Do not depend on Redis for irreversible actions.
- If Redis is unavailable, workers should fall back to Supabase lock fields and stop safely if duplicate-risk is detected.

## Useful future env names

```text
REDIS_URL
REDIS_REST_URL
REDIS_REST_TOKEN
AI_REDIS_LOCK_TTL_SECONDS=900
```

No secret values are included here.
