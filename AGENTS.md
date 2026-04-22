# Repository Guidelines

## Project Structure & Module Organization
This repository is now a hybrid workspace: focused Markdown docs at the root plus the Phase 1 web app under `src/`.

Current top-level material:

- `README.md`: entry point and document index
- `context.md`, `visao-do-produto.md`: product framing
- `arquitetura-macro.md`, `spec-tecnico-inicial.md`: technical direction
- `roadmap.md`, `execucao-com-opencode.md`: planning and execution notes
- `src/app`: Next.js App Router entrypoints
- `src/test`: Vitest-based tests for the active phase
- `.planning/`: GSD project state and phase artifacts

Keep new documentation material as small, single-purpose `.md` files. Use clear names with hyphens, matching the current pattern such as `spec-tecnico-inicial.md`.

## Build, Test, and Development Commands
The repository now includes a web app toolchain for the active phase. Primary commands are:

- `npm install`: install app dependencies
- `npm run dev`: start the local Next.js app
- `npm run lint`: run static checks
- `npm run build`: create a production build
- `npm run test -- --run`: run the non-watch Vitest suite
- `rg --files`: list tracked content quickly

Any future tooling changes must still be documented in both `README.md` and this guide.

## Coding Style & Naming Conventions
Write in concise Markdown with short sections and descriptive headings. Prefer:

- ATX headings: `#`, `##`, `###`
- short paragraphs and flat bullet lists
- file names in lowercase kebab-case, for example `arquitetura-macro.md`

Preserve the repository’s existing language choice when editing a file. Most current content is in Portuguese, so new related docs should stay consistent unless there is a reason to split by audience.

## Testing Guidelines
Automated tests now exist for the active phase. Review contributions by checking:

- `npm run lint`
- `npm run build`
- `npm run test -- --run`
- internal consistency across linked docs
- terminology alignment between product, architecture, roadmap, and implementation

For substantial edits, re-read the touched files end to end before opening a PR.

## Commit & Pull Request Guidelines
Local `.git` history is not available in this workspace, so no project-specific commit convention can be inferred. Use a simple imperative style such as `docs: refine roadmap milestones`.

PRs should include:

- a short summary of what changed
- the affected documents
- rationale when changing product direction or architecture assumptions
- screenshots only if rendered Markdown formatting is relevant

## Contributor Notes
Do not add placeholder implementation details that are not supported by the current docs and phase artifacts. The repository is still strategy-heavy, so clarity and consistency matter as much as implementation progress.
