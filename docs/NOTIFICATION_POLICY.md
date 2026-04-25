# Notification Policy

## Purpose

AI in Action should notify the admin only for true blockers or review-required decisions. Routine successful runs should be logged to Supabase and displayed on the dashboard, not spammed.

## Notify Admin For

- migration failure
- deployment failure
- repeated cron failure
- Supabase writes unavailable
- high-risk content review required
- publishing review required
- paid API activation required
- missing configuration required for runtime
- destructive change requested
- financial/trading compliance risk

## Do Not Notify For

- routine successful cron runs
- ordinary generated drafts
- fallback mode when already known
- low-risk dashboard updates

## Destinations

Initial destination:

- Supabase `ai_notifications`

Future destinations:

- Slack webhook if configured
- email provider if configured

## Safety Rules

- Do not print secret values.
- Do not include credentials in notification text.
- Keep notifications specific and actionable.
- Prefer one blocker summary over many duplicate messages.
