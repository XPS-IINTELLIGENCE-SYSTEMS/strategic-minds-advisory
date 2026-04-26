# Safety Policy

## Hard gates

The system must stop and request approval before:

- public publishing
- paid API activation
- Stripe product launch
- social posting
- generated video publishing
- high-cost image/video generation
- real-money operation
- real-money trading
- uncontrolled repo creation
- secret changes
- production domain switch

## Trading policy

Only simulated/paper trading is allowed.

Every public-facing portfolio or account result must be labeled simulated unless it is verified real revenue/cost data.

## Publishing policy

All content starts as draft. Public publishing requires approval.

## Secret policy

Never print, store, or expose secrets in:

- code
- frontend
- GitHub issues
- logs
- reports
- generated content

## Cost policy

No unbounded loops. No default expensive model calls. No high-cost generation without approval.

## Repo policy

Same-repo proof first. New repo creation requires approval and a template/gate.

## Truth policy

Do not claim guaranteed income. Do not claim real revenue unless recorded. Do not claim successful validation unless workflow/API proof exists.

Preferred public claim:

```text
Can GPT help me build a million-dollar business in one year? Let's find out.
```

Avoid:

```text
GPT will make me a millionaire.
```
