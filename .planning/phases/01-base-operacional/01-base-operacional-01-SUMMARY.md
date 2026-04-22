---
phase: 1
plan: 1
status: completed
created: 2026-04-17
---

# Summary — Plan 01

## Outcome

Wave 1 established the executable baseline for the OpsCore app without removing the existing documentation workspace.

## Delivered

- `package.json`, `tsconfig.json`, `next.config.ts`, `next-env.d.ts`
- `eslint.config.mjs`, `vitest.config.ts`, `.env.example`
- `src/app/layout.tsx`, `src/app/page.tsx`, `src/app/globals.css`
- `src/test/setup.ts`, `src/test/factories/inbox.ts`, `src/test/inbox-domain.test.ts`, `src/test/inbox-api.test.ts`
- `README.md` and `AGENTS.md` updated for the hybrid docs + app repository

## Verification

- `npm install`
- `npm run lint`
- `npm run build`
- `npm run test -- --run`

## Notes

- Linting was migrated to the ESLint CLI to avoid the deprecated interactive `next lint` flow.
- Vitest was scoped to `src/test` so the Phase 1 app suite does not execute the vendored `get-shit-done` tests.
