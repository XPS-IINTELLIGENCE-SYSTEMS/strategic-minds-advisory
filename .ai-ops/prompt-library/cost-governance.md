# Cost Governance

## Default budget targets

- Vercel: about 20 USD/month
- Supabase: about 20-25 USD/month
- GitHub/tools: about 20 USD/month
- OpenAI API target: about 100 USD/month
- Initial total target: about 165 USD/month

## Environment variables

```text
OPENAI_AUTONOMY_MODE=low_cost
OPENAI_DAILY_BUDGET_USD=3
OPENAI_MAX_CALLS_PER_DAY=50
OPENAI_DEFAULT_MODEL=gpt-5-nano
OPENAI_ESCALATION_MODEL=gpt-5-mini
OPENAI_FRONTIER_DISABLED=true
OPENAI_IMAGE_VIDEO_APPROVAL_REQUIRED=true
OPENAI_HIGH_COST_GENERATION_DISABLED=true
```

## Model routing

- nano/default: classify, summarize, route, short issue drafts, short content transforms
- mini/escalation: code patch plans, product copy, content drafts, moderate reasoning
- frontier/manual only: deep debugging, complex strategy, major architecture, long content packs

## API use rule

Call OpenAI API only when deterministic scripts/templates cannot complete the task.

## Budget gate

Before every API call:

1. Read current month/day cost from `ai_cost_ledger`.
2. Read daily call count.
3. Estimate call cost.
4. If over budget, do not call API.
5. Create `gpt_plus_handoff` task instead.

## Cost ledger record

Every API call must log:

- provider
- model
- input tokens
- output tokens
- estimated cost
- task id
- run id
- purpose
- created_at

## Image/video policy

Image and video are part of the MVP, but high-cost generation must be approval-gated.

Allowed without approval:

- thumbnail prompt
- banner prompt
- video storyboard
- short script
- shot list
- visual direction

Requires approval:

- generated image batches
- generated video
- public upload
- paid rendering tools

## Handoff rule

If the task needs expensive or deep reasoning:

- stop spending
- write a GPT Plus handoff prompt
- create blocker issue
- preserve all evidence
