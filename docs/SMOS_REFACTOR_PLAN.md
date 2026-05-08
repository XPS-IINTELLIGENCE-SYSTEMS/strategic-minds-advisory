# SMOS Refactor Plan

Prepare the repository for the Strategic Minds OS architecture lock.

Sources:
- 00 - SHOPIFY WORKFLOW Command Center
- Strategic Minds Programmatic Workflow workbook
- Universal Refactor workbook
- XPS_AI_CONSULTANT Drive folder
- SANDBOX repo

## Locked Architecture Principle

Strategic Minds OS uses a locked workflow so the system stays stable and predictable.

The default path is:

1. Intake
2. Discovery
3. Goal engine
4. Market discovery
5. Benchmark system
6. Vizual X
7. Build blueprint
8. Sandbox or stage build
9. QA validation
10. Release gate

## Codex Local Execution Layer

Codex should be included as a controlled local execution operator.

Codex may operate the local machine by:

- queue trigger
- manual operator command
- scheduled runner job
- sandbox build task
- scraper task
- file generation task
- repo refactor task

Codex should not act randomly. It should read command rows, job files, work orders, or explicit operator instructions.

Primary Codex use cases:

- run local scraper jobs
- inspect local files
- create or update repo files
- run tests
- generate build artifacts
- validate outputs
- prepare GitHub commits or PRs
- operate SANDBOX repo workflows

## Queue Trigger Model

The local runner and Codex should share the same command philosophy:

```text
AppSheet / Form / GPT command
↓
Command Center row
↓
Runner job queue
↓
Codex or local runner execution
↓
Output artifacts
↓
Status update
↓
Next queued step
```

## Manual Command Model

The operator may manually command GPT, Codex, or another AI worker at any time.

Manual commands are valid when the operator is explicit.

Manual commands should still create a record in the system when possible:

- who commanded it
- what was overridden
- why it was overridden
- timestamp
- output location
- next action

## Operator Override Rule

The architecture lock is a default safety and consistency system, not a prison.

The operator may override a lock by explicit command.

Override rule:

```text
If Jeremy explicitly commands an override, AI may proceed according to that command, but must log the override and preserve a rollback/audit trail when possible.
```

Examples of valid override language:

- "Override lock and proceed."
- "I approve this exception."
- "Run this manually now."
- "Bypass the normal route for this test."

Default rule if no override is explicit:

```text
Follow the locked workflow.
```

## Stage Preview Rules

Stage preview does not require human approval.

Allowed automatically:

- SANDBOX repo work
- GitHub Pages preview
- Vercel Preview
- local scraper runs
- local Codex analysis
- draft docs
- test artifacts

Production release remains gated unless explicitly overridden by the operator.

## Next steps

1. Preserve the current repo state.
2. Add locked workflow definitions.
3. Add test plan.
4. Add Codex/local execution runbook.
5. Build stage preview through GitHub and Vercel.
6. Keep release gates programmatic, with explicit operator override available.
