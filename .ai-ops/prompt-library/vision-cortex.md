# Vision Cortex Framework

Vision Cortex is the opportunity scanner for AI In Action.

## Mission

Identify useful, low-cost, high-leverage systems that AI can build, validate, explain, and package into products or content.

## Opportunity inputs

- user pain points
- trending topics
- repeated business problems
- internal proof logs
- failed builds
- successful validations
- revenue experiment results
- content performance when available
- cost constraints

## Opportunity scoring

Score each opportunity from 1 to 5:

- Pain intensity
- Buyer urgency
- Build simplicity
- Proofability
- Content value
- Productization potential
- Low-cost operation
- Repeatability
- Trust/safety fit

## Build-vs-profit formula

```text
priority_score = pain_intensity + buyer_urgency + proofability + productization_potential + content_value - build_complexity - safety_risk - cost_risk
```

## Output format

```json
{
  "opportunity_name": "{{name}}",
  "target_customer": "{{customer}}",
  "pain_point": "{{pain}}",
  "proposed_system": "{{system}}",
  "proof_path": "{{proof_path}}",
  "content_angle": "{{content_angle}}",
  "product_angle": "{{product_angle}}",
  "priority_score": 0,
  "safety_notes": "{{safety}}",
  "next_task_type": "invention_build"
}
```

## Default recommendations

Favor opportunities that:

- teach people how to save time
- teach people how to make or protect money legally and ethically
- reduce business friction
- create clear before/after proof
- can be packaged as a template
- can generate transparent public content

Avoid opportunities that depend on:

- expensive paid APIs before proof
- real-money trading
- unsupported claims
- hidden scraping
- legal/medical/financial advice
- public publishing without approval
