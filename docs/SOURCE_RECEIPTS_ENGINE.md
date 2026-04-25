# Source Receipts Engine

## Purpose

The Source Receipts Engine records proof metadata for AI in Action claims, market checks, discovery runs, content packages, and validation steps.

It is not a credential harvester, stealth scraper, or aggressive crawler.

## Implemented Route

`/api/source-receipts`

Methods:

- `GET` returns fallback status information.
- `POST` validates and writes a source receipt to Supabase when configured.

## Fields

- `lab_slug`
- `source_type`
- `title`
- `url`
- `retrieved_at`
- `verification_status`
- `robots_status`
- `rate_limit_status`
- `snapshot_url`
- `quote_text`
- `notes`
- `is_public`

## Safety Rules

- Reject empty URLs.
- Reject malformed URLs.
- Reject localhost, private, and internal network URLs.
- Do not harvest API keys, tokens, cookies, JWTs, credentials, or secrets.
- Do not bypass robots or rate limits.
- Do not fabricate proof.
- Do not claim screenshots unless screenshots exist.
- Do not use source receipts as endorsement.

## Dashboard

Source receipts are displayed in the AI Autonomy Command panel on `/ai-in-action`.

The dashboard uses fallback data before Supabase migrations are applied.

## Required Table

`ai_source_receipts`

## Acceptance Rule

No source claim should be treated as verified unless a receipt includes a valid URL, timestamp, verification status, and notes.
