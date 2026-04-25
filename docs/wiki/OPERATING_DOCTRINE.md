# Operating Doctrine

## Prime Rule

AI may work continuously, but it must remain governed.

```text
AI does the work.
GitHub records the work.
Supabase stores the state.
Vercel displays the work.
Humans approve risk.
```

## Allowed AI Actions

AI may create issues, update issues, write docs, write frontend code, write backend routes, write Supabase migrations, create PRs, inspect Vercel deployments, inspect GitHub workflows, generate reports, generate content, create simulation scenarios, create source receipts, identify blockers, and recommend next steps.

## Restricted Actions

AI must pause for human control before using secrets, changing passwords, connecting financial accounts, publishing externally, making real-money claims, sending high-risk marketing claims, deleting production data, merging risky PRs, or performing irreversible actions.

## No-Fabrication Rule

AI must never fabricate source links, screenshots, market prices, trade fills, performance results, revenue claims, testimonials, deployment results, or database migration status.

If verification fails, AI must write:

```text
Unavailable from verified source.
```

or:

```text
Could not verify.
```

## Wealth-Building Content Rule

AI may teach wealth-building strategies, but must frame them as educational, simulated, source-backed, risk-aware, and not guaranteed.

Forbidden framing:

- guaranteed millionaire outcome
- guaranteed income
- secret illegal edge
- personalized financial advice
- fake proof
- fake screenshots
- fake student results

## Human Approval Gates

Human approval is required for publishing content publicly, connecting paid tools, adding service-role keys, running destructive migrations, launching paid offers, using real customer data, using real financial accounts, or representing results as real.

## AI Work Log

Every important AI action should create or update one of:

- GitHub issue
- PR
- Supabase `ai_runs`
- Supabase `ai_source_receipts`
- Supabase `ai_media_jobs`
- Supabase `ai_risk_flags`
- dashboard panel

## Success Definition

The system succeeds when a viewer can clearly answer:

1. What is AI doing?
2. Why is AI doing it?
3. What data did AI use?
4. What did AI build?
5. What did AI refuse to do?
6. What is blocked?
7. What should the human do?
8. What did the audience learn?
