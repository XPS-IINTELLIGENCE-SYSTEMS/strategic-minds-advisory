# Worker Tool Contracts

## Worker loop

1. Start run record.
2. Check cost caps.
3. Pick one queued task.
4. Lock task.
5. Route task type.
6. Execute deterministic template first.
7. Use OpenAI API only if allowed and needed.
8. Validate result.
9. Log proof/cost/run result.
10. Create GitHub issue when proof or blocker is important.
11. Release or complete task.
12. Stop.

## Required environment variables

```text
SUPABASE_URL
SUPABASE_SERVICE_ROLE_KEY
OPENAI_API_KEY optional until API mode enabled
OPENAI_DAILY_BUDGET_USD
OPENAI_MAX_CALLS_PER_DAY
OPENAI_DEFAULT_MODEL
OPENAI_ESCALATION_MODEL
AI_IN_ACTION_BASE_URL
VERCEL_PROTECTION_BYPASS optional
```

## Deterministic tools

### pick_next_task
Input: status queued, scheduled_for <= now.
Output: highest priority task.

### create_generated_invention
Input: invention request payload.
Output: manifest, migration, generated route proof target.

### validate_route
Input: base URL and route.
Output: pass/fail JSON.

### create_proof_issue
Input: proof template data.
Output: GitHub issue URL.

### create_handoff_prompt
Input: blocker, task, evidence.
Output: GPT Plus prompt and blocker issue.

### create_content_draft
Input: content type, topic, proof, product.
Output: ai_content_queue draft only.

### create_product_blueprint
Input: product idea.
Output: ai_products draft only.

### update_simulated_portfolio
Input: simulated price/position data.
Output: simulated portfolio record only.

## Stop conditions

- no queued task
- task completed
- budget exceeded
- safety gate encountered
- missing secret
- failed validation
- approval required
- unsupported task type
