# Features Research: OpsCore

**Context:** Feature synthesis from repository strategy documents.
**Date:** 2026-04-17

## Table Stakes

### Inbox

- Unified intake queue for operational entries
- Basic metadata and source visibility per item
- Clear prioritization and status handling

### Triage / IA

- Category suggestion
- Urgency / priority suggestion
- Next-action suggestion
- Context summary for each item

### Tasks

- Convert inbox items into tasks
- Assign owner and track status
- Preserve link between task and original demand

### Agenda

- Follow-up reminders
- Deadlines and due dates
- Operational events connected to tasks

### Dashboard

- Visibility into backlog
- Pending and urgent items
- Waiting-for-response states
- Basic bottleneck view

## Differentiators

- Deep context handoff between inbox item, task and calendar event
- Operational suggestions that recommend what to do next, not just classify
- A single operational view that feels broader than ticketing but more grounded than generic productivity tools

## Anti-Features

- Generic chat-first interface replacing operational structures
- Channel sprawl without normalized data model
- Fully autonomous decision making in v1

## Dependencies

- Tasks depend on inbox + triage foundation
- Agenda depends on stable task and follow-up model
- Stronger IA features depend on operational history and good context capture
- Real integrations depend on a stable intake abstraction
