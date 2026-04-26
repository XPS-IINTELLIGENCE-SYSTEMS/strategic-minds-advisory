# Product Templates

## Stripe-ready product blueprint

```json
{
  "product_name": "{{product_name}}",
  "slug": "{{slug}}",
  "target_customer": "{{target_customer}}",
  "problem_solved": "{{problem_solved}}",
  "promise": "{{promise}}",
  "deliverables": ["{{deliverable_1}}", "{{deliverable_2}}"],
  "price_min_usd": 49,
  "price_max_usd": 199,
  "stripe_notes": "Create product/payment link after approval.",
  "landing_page_copy": "{{landing_page_copy}}",
  "content_hooks": ["{{hook_1}}", "{{hook_2}}"],
  "proof_requirements": ["validated route", "proof issue", "dashboard section"],
  "approval_required": true
}
```

## Starter products

### AI In Action Starter Kit

Purpose: teach humans how to recreate the low-cost AI stack.

Deliverables:
- repo structure
- Supabase schema
- GitHub Actions workflows
- Vercel deploy guide
- prompt library
- safety gates
- proof dashboard guide

### White Unicorn AI Stack Blueprint

Purpose: explain why GPT + GitHub + Vercel + Supabase + Stripe is a low-cost build stack.

Deliverables:
- architecture map
- budget caps
- account setup checklist
- workflow map
- risk controls

### AI Invention Factory Template Pack

Purpose: reusable templates for generating sandbox inventions.

Deliverables:
- invention request template
- manifest template
- validation template
- proof issue template
- content recap template

## Product approval checklist

- [ ] Product has proof requirement.
- [ ] Product has clear target customer.
- [ ] Product does not promise guaranteed income.
- [ ] Stripe launch approval exists.
- [ ] Landing page copy is public-safe.
- [ ] Price is recorded.
- [ ] Delivery method is defined.
