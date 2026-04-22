---
phase: 02-execucao-de-trabalho
plan: 01
subsystem: domain
tags: [tasks, file-backed-store, zod, drizzle, vitest]
requires:
  - phase: 01-base-operacional
    provides: inbox store, reviewed triage context, priority vocabulary
provides:
  - canonical task contracts and enums
  - task Drizzle schema
  - file-backed task persistence and conversion rules
  - task domain tests
affects: [phase-02, phase-03, tasks, execution-workspace]
tech-stack:
  added: []
  patterns: [file-backed domain query module, origin snapshot, enriched conversion strip input]
key-files:
  created:
    - src/types/tasks.ts
    - src/db/schema/tasks.ts
    - src/lib/validation/tasks.ts
    - src/db/queries/tasks.ts
    - src/test/tasks-domain.test.ts
  modified:
    - src/db/queries/inbox.ts
key-decisions:
  - "Tasks are a separate operational entity, not an inbox status."
  - "Task origin context is snapshotted at conversion time."
  - "Vitest data stores are isolated per worker to avoid cross-file race conditions."
patterns-established:
  - "Conversion returns explicit domain results instead of throwing for expected conflicts."
  - "Active task uniqueness is enforced by originInboxId plus non-Concluida status."
requirements-completed: [TASK-01, TASK-02, TASK-03, TASK-04]
duration: approx 25min
completed: 2026-04-20
---

# Phase 2 Plan 01 Summary

**Canonical task domain with origin snapshots, idempotent inbox conversion, task mutations, and execution summary counters.**

## Performance

- **Duration:** approx 25min
- **Started:** 2026-04-20T07:20:00-03:00
- **Completed:** 2026-04-20T07:45:00-03:00
- **Tasks:** 2 completed
- **Files modified:** 6

## Accomplishments

- Added task contracts for list, detail, origin snapshot, timeline, filters, conversion, metadata update, status update and ready-to-convert rows.
- Added task schema and validation with closed status/priority vocabularies.
- Implemented file-backed task persistence with conversion idempotency, owner/priority updates, status transitions, ready-to-convert rows and execution summary counters.
- Added domain tests covering conversion, duplicate active task rejection, origin preservation, mutation behavior and summary counters.

## Task Commits

Per-task commits were not created in this workspace. Git reports the repository contents as untracked, including generated/dependency directories, so broad staging would risk committing unrelated artifacts. Verification gates were run and recorded instead.

## Files Created/Modified

- `src/types/tasks.ts` - Shared task domain contracts and enums.
- `src/db/schema/tasks.ts` - Canonical Drizzle task schema and enums.
- `src/lib/validation/tasks.ts` - Zod schemas for filters and task mutations.
- `src/db/queries/tasks.ts` - File-backed task persistence and domain operations.
- `src/test/tasks-domain.test.ts` - Domain regression coverage for task behavior.
- `src/db/queries/inbox.ts` - Test-store namespace support for parallel Vitest workers.

## Decisions Made

- Kept `ownerName: string | null` for Phase 2 instead of introducing users/auth.
- Kept conversion ownership human-driven by default while pre-filling priority from reviewed inbox priority.
- Preserved reviewed inbox context in `TaskOriginSnapshot` so later inbox edits do not rewrite historical task context.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Parallel test store race**
- **Found during:** Final regression after Plan 04
- **Issue:** Domain and API test files shared `.data/inbox-items.json` and `.data/tasks.json`, causing occasional partial JSON reads and cross-file state interference under Vitest parallelism.
- **Fix:** Namespaced file-backed stores under `.data/vitest-${VITEST_POOL_ID}` when running in Vitest, while preserving `.data` for normal runtime.
- **Files modified:** `src/db/queries/inbox.ts`, `src/db/queries/tasks.ts`
- **Verification:** `npm run test -- --run` passed with 10 files and 30 tests.
- **Committed in:** not-created, see Task Commits note.

---

**Total deviations:** 1 auto-fixed blocking issue.
**Impact on plan:** No scope creep. The fix makes planned file-backed tests deterministic.

## Issues Encountered

- Vitest required elevated execution in this environment because sandboxed runs hit `spawn EPERM`.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

The task domain is ready for HTTP routes and UI consumption. Future phases can rely on `originInboxId`, `TaskDetail.origin`, and timeline events as the traceability backbone.

---
*Phase: 02-execucao-de-trabalho*
*Completed: 2026-04-20*
