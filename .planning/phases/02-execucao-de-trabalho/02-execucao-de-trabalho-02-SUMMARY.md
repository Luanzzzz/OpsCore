---
phase: 02-execucao-de-trabalho
plan: 02
subsystem: api
tags: [nextjs, app-router, tasks, api, vitest]
requires:
  - phase: 02-execucao-de-trabalho
    provides: task domain queries and validation schemas
provides:
  - inbox-to-task conversion route
  - task workspace list route
  - task detail and metadata route
  - task status mutation route
affects: [execution-workspace, task-ui, phase-03]
tech-stack:
  added: []
  patterns: [App Router route handlers, domain error to HTTP status mapping]
key-files:
  created:
    - src/app/api/inbox/[id]/convert/route.ts
    - src/app/api/tasks/route.ts
    - src/app/api/tasks/[id]/route.ts
    - src/app/api/tasks/[id]/status/route.ts
    - src/test/tasks-api.test.ts
  modified: []
key-decisions:
  - "Conversion uses a dedicated inbox route and rejects path/body origin mismatch."
  - "Task metadata and task status are separate mutations."
patterns-established:
  - "Expected domain conflicts map to deterministic 400/404/409 responses."
  - "`GET /api/tasks` returns items, summary and readyToConvert in one workspace payload."
requirements-completed: [TASK-01, TASK-02, TASK-03, TASK-04]
duration: approx 20min
completed: 2026-04-20
---

# Phase 2 Plan 02 Summary

**Task App Router API surface for conversion, workspace reads, detail lookup, ownership updates, and status transitions.**

## Performance

- **Duration:** approx 20min
- **Started:** 2026-04-20T07:45:00-03:00
- **Completed:** 2026-04-20T08:05:00-03:00
- **Tasks:** 2 completed
- **Files modified:** 5

## Accomplishments

- Added `POST /api/inbox/[id]/convert` with validation, mismatch rejection, 404 for missing origin and 409 for duplicate active conversion.
- Added `GET /api/tasks` returning task rows, execution summary and enriched ready-to-convert rows.
- Added `GET`/`PATCH /api/tasks/[id]` for detail and owner/priority updates.
- Added `POST /api/tasks/[id]/status` for status transitions with separate validation.
- Added API tests covering success, invalid ids, missing records, conflicts, list payloads and mutations.

## Task Commits

Per-task commits were not created in this workspace. Git reports the repository contents as untracked, including generated/dependency directories, so broad staging would risk committing unrelated artifacts. Verification gates were run and recorded instead.

## Files Created/Modified

- `src/app/api/inbox/[id]/convert/route.ts` - Inbox-to-task conversion endpoint.
- `src/app/api/tasks/route.ts` - Execution workspace aggregate endpoint.
- `src/app/api/tasks/[id]/route.ts` - Task detail and metadata endpoint.
- `src/app/api/tasks/[id]/status/route.ts` - Task progress endpoint.
- `src/test/tasks-api.test.ts` - API contract tests for Phase 2 routes.

## Decisions Made

- Kept server validation authoritative; the client never owns conversion or mutation rules.
- Returned workspace data in one payload to avoid UI fan-out for the common refresh path.
- Kept status mutation separate to preserve a clean audit/timeline boundary.

## Deviations from Plan

None - plan executed exactly as written, except for the repository-wide commit deferral noted above.

## Issues Encountered

- None beyond the final test-store isolation fix documented in Plan 01.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

The `/execucao` route can hydrate directly from domain queries and refresh/mutate through the API routes created here.

---
*Phase: 02-execucao-de-trabalho*
*Completed: 2026-04-20*
