# Vercel Workflow Receiver Contract

## Purpose
Define how Strategic Minds Advisory receives governed workflow instructions from AUTO_BUILDER.

## Boundary
This contract is documentation only. It does not deploy production, modify UI, send SMS, process payments, or expose secrets.

## Receiver Model
- AUTO_BUILDER owns build packet creation.
- Vercel Workflow transports and validates packets.
- Strategic Minds Advisory receives only approved packet metadata and validation callbacks.

## Required Controls
- preview_only mode
- operator approval for production
- secret names only, never values
- Drive receipt required for workflow evidence
- GitHub commit receipt required for repo evidence

## Blocked Actions
- direct main branch writes
- homepage or UI edits in this sync branch
- live Stripe payment processing
- Twilio live sending
- customer-facing messages
- destructive changes

## Submission Evidence
A workflow submission is valid only when GitHub branch receipts, AUTO_BUILDER project registration, and Vercel preview/workflow receipts all exist.
