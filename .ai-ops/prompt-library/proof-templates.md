# Proof Templates

## GitHub proof issue

```markdown
# AI In Action Proof Report

## Status
{{status}}

## Task
{{task_type}} — {{task_title}}

## What changed
{{what_changed}}

## Validation
- Route: {{route}}
- Workflow: {{workflow_url}}
- Result: {{result}}

## Evidence
```json
{{evidence_json}}
```

## Cost
Estimated OpenAI cost: {{estimated_cost_usd}}

## Safety
- Public publishing: not approved unless explicitly stated
- Real-money trading: not used
- Secrets exposed: no

## Next action
{{next_action}}
```

## Blocker issue

```markdown
# AI In Action Blocker

## Blocker
{{blocker}}

## Failed step
{{failed_step}}

## Evidence
{{evidence}}

## Safe fallback
{{fallback}}

## GPT Plus handoff prompt
```text
{{handoff_prompt}}
```

No secret values are included.
```

## Supabase proof log JSON

```json
{
  "proof_type": "{{proof_type}}",
  "title": "{{title}}",
  "status": "{{status}}",
  "url": "{{url}}",
  "evidence": {{evidence_json}},
  "notes": "{{notes}}",
  "public_safe": true
}
```
