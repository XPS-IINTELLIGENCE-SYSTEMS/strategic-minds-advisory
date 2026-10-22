# Strategic Minds OS Automation Test Plan

## Test Name

SMOS PIPELINE TEST 001

## Purpose

Prove that Strategic Minds OS can trigger its own architecture refactor/build workflow through the existing command system.

## Test Objective

Create a controlled job that moves through intake, discovery, workflow lock, sandbox/stage build planning, QA validation, and release gate status.

## Required Sources

- 00 - SHOPIFY WORKFLOW Command Center
- Strategic Minds Programmatic Workflow workbook
- Universal Refactor workbook
- XPS_AI_CONSULTANT Drive folder
- strategic-minds-advisory repo
- SANDBOX repo

## Required Outputs

- Intake row
- AppSheet To-Do row
- GPT work order row
- Runner job row
- Sandbox build row
- Test log row
- Stage preview plan
- Release gate status

## Automation Rules

- Vercel Preview is allowed automatically.
- GitHub Pages stage is allowed automatically.
- SANDBOX repo work is allowed automatically.
- Local scraper and Codex execution are allowed when queued or manually commanded.
- Production release remains programmatically gated unless operator override is explicit.

## Pass Criteria

1. Task is created from the Command Center or AppSheet operating layer.
2. Task creates a normalized intake row.
3. Intake creates workflow/build work orders.
4. Runner/Codex job can be queued.
5. Sandbox or stage preview task can be created.
6. QA/test rows are created.
7. Release gate is present.
8. System does not require manual JSON entry.

## Failure Criteria

- Task does not create intake.
- Intake does not create work orders.
- Runner job is not created.
- Sandbox/stage task is not created.
- Status is not updated.
- Production action occurs without a release gate or override record.

## First Test Command

Project: SMOS PIPELINE TEST 001

Command: Build the Strategic Minds OS architecture-lock refactor plan through the current workflow.

Instructions: Use source workbooks, AI Consultant folder, Command Center, strategic-minds-advisory repo, and SANDBOX repo. Generate docs, workflow files, test rows, stage preview plan, and release gate record.

Output: Pull request, workflow lock files, test plan, sandbox/stage preview task, and Command Center status rows.
