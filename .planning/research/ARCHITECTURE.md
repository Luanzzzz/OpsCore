# Architecture Research: OpsCore

**Context:** Architectural synthesis from current product and macro-architecture docs.
**Date:** 2026-04-17

## Major Components

1. **Ingestion Layer**
   Receives entries from internal and external channels and normalizes them into a common operational item model.

2. **Triage Engine**
   Applies category, urgency, next-step and contextual summarization logic to incoming items.

3. **Operational Work Core**
   Holds tasks, ownership, statuses, linked context and workflow transitions.

4. **Scheduling Layer**
   Manages follow-ups, due dates, commitments and calendar-like views tied to operational items.

5. **Operational Visibility Layer**
   Exposes dashboards, bottlenecks, queues and waiting states for human decision making.

6. **Integration Adapters**
   Add channel-specific ingestion and sync behavior without changing the core workflow model.

## Data Flow

1. Entry arrives through ingestion layer
2. Item is normalized and enriched by triage engine
3. Human operator reviews priority and next action
4. Item is either resolved in place or converted into operational work
5. Tasks and follow-ups feed agenda and dashboard views
6. Dashboard reflects current queue pressure, ownership and pending states

## Suggested Build Order

1. Core inbox and normalized operational item model
2. Triage metadata and operator review flow
3. Task conversion and execution tracking
4. Agenda and follow-up coordination
5. Dashboard and bottleneck visibility
6. Real integrations and stronger AI recommendations

## Architectural Warnings

- Keep the normalized item model stable before adding many adapters
- Avoid letting AI output bypass explicit operator review in early phases
- Preserve traceability between source entry, task, follow-up and dashboard metrics
