# Admin Review Queue

## Purpose

The Admin Review Queue keeps AI autonomous for routine work while preserving human control over sensitive or high-risk actions.

## Tables

- `ai_approval_queue`
- `ai_admin_reviews`

## Admin Review Required For

- public publishing
- paid API activation
- destructive database operations
- real-money actions
- high-risk public claims
- avatar publishing
- external social posting
- sensitive legal, financial, or compliance content

## Not Required For

- routine source receipt logging
- fallback-safe dashboard updates
- draft content packages
- health check logs
- non-destructive docs/code proposals

## Dashboard

Admin review items appear in the AI Autonomy Command panel.

## Rule

If unsure whether an action needs approval, mark it `pending` and escalate to admin instead of silently proceeding.
