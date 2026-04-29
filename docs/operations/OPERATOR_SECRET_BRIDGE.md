# Operator Secret Bridge

## Purpose

The Operator Secret Bridge allows AI in Action to request missing API keys, secrets, and environment variables without ever receiving, storing, logging, printing, or exposing secret values.

This bridge supports autonomous invention hardening while keeping credential control with the human operator.

## Core Rule

AI may request a secret by name, purpose, platform, and validation method.

AI must never receive or store the secret value.

The operator adds the secret directly inside the target platform dashboard.

The system verifies existence only.

## Supported Platforms

- Vercel Environment Variables
- GitHub Actions Secrets
- Supabase Project Settings
- Groq Console
- OpenAI / OpenAI-compatible provider dashboard
- Vercel AI Gateway
- Other approved provider dashboards

## Roles

### AI / GPT

AI may:

- Detect missing environment variables
- Explain why a key is needed
- Identify the target platform
- Create a human checklist
- Create a GitHub issue or approval queue item
- Verify existence using boolean checks only
- Log completion without the secret value
- Recommend next validation

AI must not:

- Ask the operator to paste a secret into chat
- Print a secret
- Store a secret in GitHub files
- Store a secret in GitHub issues
- Store a secret in Supabase rows
- Store a secret in logs
- Store a secret in Google Drive
- Store a secret in Gmail
- Commit `.env` files
- Expose partial secret previews
- Auto-rotate production secrets without approval

### Human Operator

The operator:

- Approves or rejects secret requests
- Creates or retrieves the secret from the provider
- Adds the secret directly to Vercel, GitHub, or Supabase
- Redeploys or reruns workflows when required
- Confirms completion without exposing the value

### GitHub

GitHub stores:

- Secret request issues
- Approval checklist
- Validation status
- Pull request references
- Non-secret audit trail

GitHub must never store:

- Secret values
- Screenshots revealing secret values
- `.env` files
- Provider tokens
- API keys

### Vercel

Vercel stores runtime environment variables for serverless functions and deployments.

Common variables:

- `CRON_SECRET`
- `ORCHESTRATOR_SECRET`
- `SUPABASE_URL`
- `VITE_SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `GROQ_API_KEY`
- `OPENAI_API_KEY`
- `AI_GATEWAY_API_KEY`

### GitHub Actions

GitHub Actions stores workflow secrets required for CI/CD and Supabase migrations.

Common variables:

- `SUPABASE_ACCESS_TOKEN`
- `SUPABASE_PROJECT_ID`
- `SUPABASE_DB_PASSWORD`

### Supabase

Supabase stores operational state, approval queue records, task logs, and source receipts.

Supabase must not store raw API keys unless a future encrypted vault design is explicitly approved.

## Secret Request Workflow

```text
1. AI detects missing secret.
2. AI creates a Secret Request.
3. Secret Request is marked pending.
4. Operator reviews request.
5. Operator adds secret directly to target platform.
6. Operator redeploys or reruns workflow if needed.
7. AI checks boolean existence only.
8. AI logs non-secret verification.
9. Request is marked completed or blocked.
```

## Secret Request Fields

A secret request should include:

```text
request_id
secret_name
target_platform
target_project
reason_needed
system_enabled
risk_level
operator_action_required
validation_method
status
created_at
updated_at
completed_at
blocked_reason
```

Never include:

```text
secret_value
secret_preview
partial_secret
token_fragment
authorization_header
cookie
JWT
private_key
```

## Approval Queue Mapping

Use `ai_approval_queue` for the request.

Recommended values:

```text
action_type: add_secret
risk_level: high
status: pending
requested_by: ai-in-action
payload.secret_name: allowed
payload.target_platform: allowed
payload.reason_needed: allowed
payload.validation_method: allowed
payload.secret_value: forbidden
```

Use `ai_admin_reviews` for operator review.

Recommended values:

```text
review_type: secret_request_review
status: approved | rejected | completed | blocked
notes: non-secret notes only
evidence: non-secret validation evidence only
```

## Verification Pattern

Verification must return booleans only.

Example safe response:

```json
{
  "env": {
    "cron_secret": true,
    "orchestrator_secret": true,
    "groq": true,
    "openai": false,
    "ai_gateway": false
  },
  "mode": "write-capable",
  "missing": ["openai", "ai_gateway"]
}
```

Forbidden response:

```json
{
  "CRON_SECRET": "actual-secret-value"
}
```

## Required Validation Rules

A secret request is complete only when:

- Operator confirms the secret was added
- Target platform shows the variable exists
- Deployment or workflow has been rerun if required
- System status confirms boolean existence
- No secret value was exposed
- Non-secret proof is logged

## Vercel Add-Secret Checklist

1. Open Vercel.
2. Select the Strategic Minds Advisory team.
3. Open the `strategic-minds-advisory` project.
4. Go to Settings → Environment Variables.
5. Add the variable name.
6. Add the value directly into Vercel.
7. Select the correct environment:
   - Production
   - Preview if PR testing is needed
   - Development if local use is needed
8. Save.
9. Redeploy if the variable affects runtime.

Do not paste the value anywhere else.

## GitHub Actions Add-Secret Checklist

1. Open GitHub repository.
2. Go to Settings → Secrets and variables → Actions.
3. Add repository secret by name.
4. Paste value directly into GitHub.
5. Save.
6. Run or rerun the required workflow.

Do not paste the value anywhere else.

## Supabase Secret / Project Checklist

1. Open Supabase dashboard.
2. Select the correct Strategic Minds Advisory project.
3. Verify the project ref.
4. Add or verify provider-specific settings only where needed.
5. Do not paste database passwords, tokens, or service keys into chat or issues.

## Initial Secret Bridge Targets

Priority 1:

- `CRON_SECRET`
- `ORCHESTRATOR_SECRET`
- `SUPABASE_URL`
- `VITE_SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `SUPABASE_ACCESS_TOKEN`
- `SUPABASE_PROJECT_ID`
- `SUPABASE_DB_PASSWORD`

Priority 2:

- `GROQ_API_KEY`
- `OPENAI_API_KEY`
- `AI_GATEWAY_API_KEY`

Priority 3:

- `FINNHUB_API_KEY`
- `HEYGEN_API_KEY`
- other approved provider keys

## Human Approval Gates

Human approval is required before:

- Adding secrets
- Rotating secrets
- Deleting secrets
- Changing production env variables
- Running migration workflows against production Supabase
- Enabling paid API use
- Enabling high-cost model usage
- Enabling autonomous public publishing
- Enabling real-money actions

## Same-Repo Sandbox Support

The Operator Secret Bridge supports same-repo sandbox autonomy by allowing AI to:

- detect missing capabilities
- request only the required secret
- keep work moving without seeing credentials
- verify setup through boolean status checks
- log non-secret proof
- continue safe build/validation loops

This enables autonomous invention while preserving human control over sensitive access.

## Implementation Phases

### Phase 1 — Docs Only

Create this document.

No production code changes.

### Phase 2 — GitHub Issue Template

Create a reusable Secret Request issue template.

### Phase 3 — Approval Queue Integration

Add backend/UI support for `add_secret` approval queue records.

Do not store secret values.

### Phase 4 — Env Status Route

Add or extend a route that checks required env vars and returns booleans only.

### Phase 5 — Validation Log

Log completion to `ai_execution_logs` and/or `ai_admin_reviews` without secret values.

## Success Criteria

The bridge is working when:

- AI can identify missing secrets
- AI can request them without seeing values
- Operator can add them directly to the correct platform
- System can verify existence only
- Audit trail exists
- No secrets appear in code, logs, issues, Drive, Gmail, or chat
