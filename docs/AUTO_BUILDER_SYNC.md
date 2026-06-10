# AUTO_BUILDER Sync Contract

## Purpose
Strategic Minds Advisory is a target presentation repository controlled by Strategic-Minds/AUTO_BUILDER through governed build packets and Vercel Workflow.

## Scope
This document does not build or modify the website UI. It defines the sync boundary only.

## Control Plane
- Control repo: Strategic-Minds/AUTO_BUILDER
- Target repo: XPS-IINTELLIGENCE-SYSTEMS/strategic-minds-advisory
- Target branch: feature/auto-builder-sync
- Mode: preview only

## Allowed
- Receive approved build packet metadata.
- Report validation results.
- Preserve Drive/GitHub receipts.
- Keep production gated.

## Blocked
- Homepage changes.
- UI changes.
- Main branch writes.
- Production deployment.
- Live SMS.
- Live payment processing.
- Secret commits.

## Completion Rule
This repo is synchronized only when AUTO_BUILDER registration, workflow contract, validation contract, release gate, rollback gate, and env contract exist and validation confirms safe mode.
