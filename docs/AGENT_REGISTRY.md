# Agent Registry

## Purpose

The Agent Registry defines the visible AI roles used by AI in Action Labs. It is intentionally lightweight: scheduled routes and logged runs provide the operating behavior; the registry defines responsibilities, constraints, and dashboard visibility.

## Supabase Tables

- `ai_agent_registry`
- `ai_agent_runs`

## Seed Agents

1. Operator Agent
2. Builder Agent
3. Validator Agent
4. Source Receipts Agent
5. Paper Trading Agent
6. Digital Business Agent
7. Media Agent
8. Risk Manager Agent
9. Tool Intelligence Agent
10. Discovery Agent

## Required Fields

- name
- role
- capabilities
- allowed actions
- restricted actions
- status
- risk level
- last run
- next run
- public visibility

## Rules

- Agents may draft, log, validate, and propose.
- Agents may not expose secrets.
- Agents may not approve their own high-risk actions.
- Agents may not publish externally without admin approval.
- Trading agents remain paper-only.

## Dashboard

The AI Autonomy Command panel displays the registry and falls back safely if Supabase is unavailable.
