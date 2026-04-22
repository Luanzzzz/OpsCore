# Stack Research: OpsCore

**Context:** Greenfield planning synthesized from current repository documents.
**Date:** 2026-04-17

## Recommended Stack

| Layer | Recommendation | Why |
|-------|----------------|-----|
| Frontend | React + TypeScript | Good fit for dashboard-heavy interfaces and iterative product UI |
| Backend | Python + FastAPI | Strong ecosystem for workflow orchestration and IA-assisted services |
| Data | PostgreSQL | Reliable relational base for messages, tasks, agenda and operational states |
| Async jobs | Background worker queue | Needed for ingestion, classification and follow-up processing |
| AI layer | Provider-agnostic service boundary | Keeps classification, summaries and suggestions swappable |
| Integrations | Connector adapters per channel | Supports future WhatsApp, Instagram, email and CRM additions without polluting core logic |

## Rationale

- OpsCore needs structured operational data, so a relational core is a better baseline than schema-light storage.
- The product likely evolves into multiple ingestion and processing paths, so async processing should be first-class from the beginning.
- AI capabilities are part of the product value, but they should remain behind explicit service boundaries instead of leaking through every module.
- Dashboard and queue-driven workflows benefit from a typed frontend that can scale with dense operational UI.

## What Not To Optimize Early

- Native mobile apps before the web workflow proves useful
- Hard-coupling the core model to a single channel integration
- Overbuilding autonomous agents before the human-in-the-loop workflow is reliable

## Confidence

- **High**: relational core, async processing, connector boundaries
- **Medium**: exact frontend/backend framework choices
