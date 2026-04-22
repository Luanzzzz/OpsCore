# Phase 4: Panorama e Inteligencia - Pattern Map

**Mapped:** 2026-04-21  
**Files analyzed:** 27 likely new/modified files  
**Analogs found:** 24 / 27  

## File Classification

| New/Modified File | Role | Data Flow | Closest Analog | Match Quality |
|-------------------|------|-----------|----------------|---------------|
| `src/types/panorama.ts` | model | transform | `src/types/agenda.ts` | exact |
| `src/db/queries/panorama.ts` | service/query | batch + transform | `src/db/queries/tasks.ts` + `src/db/queries/agenda.ts` | exact |
| `src/lib/intelligence/context-packet.ts` | utility | transform | `src/types/inbox.ts` triage/review split | partial |
| `src/lib/validation/panorama.ts` | utility | request-response validation | `src/lib/validation/agenda.ts` | exact |
| `src/app/api/panorama/route.ts` | route | request-response | `src/app/api/tasks/route.ts` | exact |
| `src/app/(workspace)/panorama/page.tsx` | route/component | request-response | `src/app/(workspace)/agenda/page.tsx` | exact |
| `src/app/(workspace)/panorama/loading.tsx` | component | request-response | `src/app/(workspace)/agenda/loading.tsx` | exact |
| `src/app/(workspace)/panorama/error.tsx` | component | request-response | `src/app/(workspace)/agenda/error.tsx` | exact |
| `src/components/panorama/workspace-shell.tsx` | component | event-driven + request-response | `src/components/agenda/workspace-shell.tsx` | exact |
| `src/components/panorama/overview-strip.tsx` | component | transform | `src/components/dashboard/agenda-radar.tsx` | role-match |
| `src/components/panorama/signal-list.tsx` | component | transform | `src/components/dashboard/ops-radar.tsx` | role-match |
| `src/components/panorama/intelligence-readiness.tsx` | component | transform | `src/components/dashboard/execution-radar.tsx` | role-match |
| `src/components/panorama/milestone-direction.tsx` | component | transform | `src/components/dashboard/agenda-radar.tsx` | role-match |
| `src/components/inbox/workspace-shell.tsx` | component | event-driven navigation | `src/components/agenda/workspace-shell.tsx` | exact |
| `src/components/execution/workspace-shell.tsx` | component | event-driven navigation | `src/components/agenda/workspace-shell.tsx` | exact |
| `src/components/agenda/workspace-shell.tsx` | component | event-driven navigation | same file | exact |
| `src/app/layout.tsx` | config/component | request-response metadata | `src/app/layout.tsx` existing metadata | exact |
| `src/app/page.tsx` | component | request-response | `src/app/page.tsx` existing home | exact |
| `src/app/globals.css` | config/style | transform | existing workspace/radar CSS blocks | exact |
| `src/test/panorama-domain.test.ts` | test | batch + transform | `src/test/agenda-domain.test.ts` | exact |
| `src/test/panorama-api.test.ts` | test | request-response | `src/test/agenda-api.test.ts` | exact |
| `src/test/panorama-workspace.test.tsx` | test | event-driven + request-response | `src/test/agenda-workspace.test.tsx` | exact |
| `src/test/inbox-workspace.test.tsx` | test | event-driven navigation | `src/test/execution-workspace.test.tsx` | role-match |
| `src/test/execution-workspace.test.tsx` | test | event-driven navigation | same file | exact |
| `src/test/agenda-workspace.test.tsx` | test | event-driven navigation | same file | exact |
| `README.md` / selected product docs | documentation | transform | `README.md` current status section | partial |
| `.planning/REQUIREMENTS.md` / `.planning/STATE.md` | planning state | transform | existing traceability tables | partial |

## Pattern Assignments

### `src/types/panorama.ts` (model, transform)

**Analog:** `src/types/agenda.ts`

**Imports pattern** (lines 1-2):
```typescript
import type { InboxPriority } from "@/types/inbox";
import type { TaskPriority, TaskStatus } from "@/types/tasks";
```

**Const-union pattern** (lines 4-27):
```typescript
export const AGENDA_LINKED_TYPES = ["inbox", "task"] as const;
export type AgendaLinkedType = (typeof AGENDA_LINKED_TYPES)[number];

export const AGENDA_URGENCY_STATES = [
  "vencido",
  "hoje",
  "proximo",
  "futuro"
] as const;
export type AgendaUrgencyState = (typeof AGENDA_URGENCY_STATES)[number];
```

**Summary contract pattern** (lines 86-101):
```typescript
export interface AgendaSummary {
  totalCount: number;
  activeCount: number;
  overdueCount: number;
  dueTodayCount: number;
  upcomingCount: number;
  futureCount: number;
  completedCount: number;
  cancelledCount: number;
  criticalItems: Array<{
    id: number;
    title: string;
    dueAt: string;
    urgencyState: AgendaUrgencyState;
  }>;
}
```

**Apply to panorama:** define const unions for module ids, signal severities, readiness dimensions and milestone direction. Prefer interfaces with already-derived numbers and short lists; do not expose raw `descriptionRaw` or full entity stores.

---

### `src/db/queries/panorama.ts` (service/query, batch + transform)

**Analogs:** `src/db/queries/tasks.ts`, `src/db/queries/agenda.ts`, `src/db/queries/inbox.ts`

**Read-only aggregation pattern** (tasks lines 324-361):
```typescript
export async function getReadyToConvertItems(): Promise<ReadyToConvertItem[]> {
  const [inboxItems, tasks] = await Promise.all([getInboxItems(), readStore()]);
  const activeOrigins = new Set(
    tasks.filter(isActiveTask).map((task) => task.originInboxId)
  );
  const reviewedItems = inboxItems.filter(
    (item) => item.triageStatus === "reviewed" && !activeOrigins.has(item.id)
  );

  return details
    .filter((item): item is PersistedInboxItem => Boolean(item))
    .map(toReadyToConvertItem)
    .sort((left, right) => {
      const priorityDelta =
        PRIORITY_WEIGHT[right.priorityReviewed] -
        PRIORITY_WEIGHT[left.priorityReviewed];

      if (priorityDelta !== 0) {
        return priorityDelta;
      }

      return (
        new Date(left.lastActivityAt).getTime() -
        new Date(right.lastActivityAt).getTime()
      );
    });
}

export async function getExecutionSummary(): Promise<TaskSummary> {
  const [tasks, readyToConvert] = await Promise.all([
    readStore(),
    getReadyToConvertItems()
  ]);
  const activeTasks = tasks.filter(isActiveTask);
```

**Derived summary pattern** (agenda lines 409-433):
```typescript
export async function getAgendaSummary(): Promise<AgendaSummary> {
  const items = await readStore();
  const list = items.map(toListItem);
  const active = list.filter((item) => item.status === "Aberto");

  return {
    totalCount: list.length,
    activeCount: active.length,
    overdueCount: active.filter((item) => item.urgencyState === "vencido")
      .length,
    dueTodayCount: active.filter((item) => item.urgencyState === "hoje")
      .length,
    upcomingCount: active.filter((item) => item.urgencyState === "proximo")
      .length,
    futureCount: active.filter((item) => item.urgencyState === "futuro")
      .length,
    criticalItems: active
      .filter((item) =>
        ["vencido", "hoje", "proximo"].includes(item.urgencyState)
      )
      .slice(0, 5)
      .map((item) => ({
        id: item.id,
        title: item.title,
        dueAt: item.dueAt,
        urgencyState: item.urgencyState
      }))
  };
}
```

**Inbox summary source** (inbox lines 193-229):
```typescript
export async function getDashboardSummary(): Promise<DashboardSummary> {
  const items = await readStore();
  const now = Date.now();
  const byStatus = (
    ["Nova", "Em analise", "Aguardando resposta", "Concluida/Arquivada"] as InboxStatus[]
  ).map((status) => ({
    status,
    count: items.filter((item) => item.status === status).length
  }));

  const waitingOnResponseCount = items.filter(
    (item) => item.waitingOnResponse
  ).length;
  const highPriorityCount = items.filter((item) =>
    ["Alta", "Critica"].includes(item.priorityReviewed)
  ).length;
```

**Apply to panorama:** no new store initially. `getOperationalPanorama()` should call `getDashboardSummary`, `getExecutionSummary`, `getAgendaSummary` with `Promise.all`, then feed those summaries into pure helpers such as `buildModuleStates`, `buildSignals`, `buildReadinessSnapshot`, and `buildNextMilestoneOptions`.

---

### `src/lib/intelligence/context-packet.ts` (utility, transform)

**Analog:** `src/types/inbox.ts`

**Human-reviewed AI boundary pattern** (lines 11-17 and 31-37):
```typescript
export interface TriageSuggestion {
  category: string;
  urgency: InboxPriority;
  nextAction: string;
  summary: string;
  rationale: string;
}

export interface InboxDetail extends InboxListItem {
  descriptionRaw: string;
  aiSuggestion: TriageSuggestion | null;
  reviewedCategory: string | null;
  reviewedNextAction: string | null;
  triageReviewedAt: string | null;
}
```

**Apply to panorama:** context packets should be local, deterministic summaries for future AI. Preserve the distinction between suggested/readiness data and reviewed/current operational truth. Do not add new OpenAI calls in Phase 4.

---

### `src/lib/validation/panorama.ts` (utility, request-response validation)

**Analog:** `src/lib/validation/agenda.ts`

**Import + enum schema pattern** (lines 1-20):
```typescript
import { z } from "zod";

import {
  AGENDA_KINDS,
  AGENDA_LINKED_TYPES,
  AGENDA_STATUSES,
  AGENDA_URGENCY_STATES
} from "@/types/agenda";

export const agendaLinkedTypeSchema = z.enum(AGENDA_LINKED_TYPES);
export const agendaKindSchema = z.enum(AGENDA_KINDS);
export const agendaStatusSchema = z.enum(AGENDA_STATUSES);
export const agendaUrgencyStateSchema = z.enum(AGENDA_URGENCY_STATES);
```

**Filter object pattern** (lines 35-42):
```typescript
export const agendaFiltersSchema = z.object({
  linkedType: agendaLinkedTypeSchema.optional(),
  kind: agendaKindSchema.optional(),
  status: agendaStatusSchema.optional(),
  urgencyState: agendaUrgencyStateSchema.optional(),
  owner: z.string().trim().optional(),
  sort: z.enum(["urgency", "dueAt", "recent"]).optional()
});
```

**Apply to panorama:** only create validation if `/api/panorama` accepts query params. If filters exist, model them as optional Zod enums from `src/types/panorama.ts`; keep invalid filter responses as `400`.

---

### `src/app/api/panorama/route.ts` (route, request-response)

**Analog:** `src/app/api/tasks/route.ts`

**GET with validation and aggregate payload pattern** (lines 1-29):
```typescript
import { NextRequest, NextResponse } from "next/server";

import {
  getExecutionSummary,
  getReadyToConvertItems,
  getTasks
} from "@/db/queries/tasks";
import { taskFiltersSchema } from "@/lib/validation/tasks";

export async function GET(request: NextRequest) {
  const parsed = taskFiltersSchema.safeParse({
    status: request.nextUrl.searchParams.get("status") ?? undefined,
    priority: request.nextUrl.searchParams.get("priority") ?? undefined,
    owner: request.nextUrl.searchParams.get("owner") ?? undefined,
    ageBucket: request.nextUrl.searchParams.get("ageBucket") ?? undefined,
    sort: request.nextUrl.searchParams.get("sort") ?? undefined
  });

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid task filters" }, { status: 400 });
  }

  const [items, summary, readyToConvert] = await Promise.all([
    getTasks(parsed.data),
    getExecutionSummary(),
    getReadyToConvertItems()
  ]);

  return NextResponse.json({ items, summary, readyToConvert });
}
```

**Minimal read-only GET pattern** (dashboard route lines 1-7):
```typescript
import { NextResponse } from "next/server";

import { getDashboardSummary } from "@/db/queries/dashboard";

export async function GET() {
  const summary = await getDashboardSummary();
  return NextResponse.json(summary);
}
```

**Apply to panorama:** if no filters, mirror dashboard and return the panorama object directly. If filters are introduced, mirror tasks/agenda: `NextRequest`, `safeParse`, `400` on invalid filters, then `NextResponse.json({ panorama })` or direct `NextResponse.json(panorama)` consistently with page and tests.

---

### `src/app/(workspace)/panorama/page.tsx` (route/component, request-response)

**Analog:** `src/app/(workspace)/agenda/page.tsx`

**Server-first workspace pattern** (lines 1-18):
```typescript
import { WorkspaceShell } from "@/components/agenda/workspace-shell";
import {
  getAgendaItemById,
  getAgendaItems,
  getAgendaSummary
} from "@/db/queries/agenda";

export default async function AgendaWorkspacePage() {
  const items = await getAgendaItems();
  const selectedItem = items[0] ? await getAgendaItemById(items[0].id) : null;
  const summary = await getAgendaSummary();

  return (
    <WorkspaceShell
      initialItems={items}
      initialSelectedItem={selectedItem}
      initialSummary={summary}
    />
  );
}
```

**Apply to panorama:** call `getOperationalPanorama()` server-side and pass `initialPanorama` to `src/components/panorama/workspace-shell.tsx`. Avoid client-side recomputation of the initial panorama.

---

### `src/app/(workspace)/panorama/loading.tsx` (component, request-response)

**Analog:** `src/app/(workspace)/agenda/loading.tsx`

**Workspace skeleton pattern** (lines 1-12):
```typescript
export default function AgendaWorkspaceLoading() {
  return (
    <main className="workspace-page">
      <div className="workspace-loading" aria-label="Carregando agenda">
        <div className="workspace-loading__sidebar">
          <div />
        </div>
        <div className="workspace-loading__main">
          <div />
        </div>
        <div className="workspace-loading__detail" />
      </div>
    </main>
  );
}
```

**Apply to panorama:** same layout classes; change only the accessible `aria-label` and skeleton count if the panorama grid shape differs.

---

### `src/app/(workspace)/panorama/error.tsx` (component, request-response)

**Analog:** `src/app/(workspace)/agenda/error.tsx`

**Client error boundary pattern** (lines 1-20):
```typescript
"use client";

export default function AgendaWorkspaceError({ reset }: { reset: () => void }) {
  return (
    <main className="workspace-page">
      <section className="workspace-error-panel">
        <p className="workspace-panel__eyebrow">Agenda operacional</p>
        <h1>Nao foi possivel carregar a agenda</h1>
        <p>
          Atualize a tela para recuperar follow-ups, prazos e compromissos do
          fluxo operacional.
        </p>
        <button
          className="button button--primary"
          onClick={() => reset()}
          type="button"
        >
          Tentar novamente
        </button>
      </section>
    </main>
  );
}
```

**Apply to panorama:** keep `"use client"`, `reset`, `workspace-error-panel`, and one primary retry button. Copy should say panorama could not be loaded, not imply integrations/AI failed.

---

### `src/components/panorama/workspace-shell.tsx` (component, event-driven + request-response)

**Analog:** `src/components/agenda/workspace-shell.tsx`

**Client shell imports and props pattern** (lines 1-24):
```typescript
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import React, { useEffect, useState, useTransition } from "react";

import { AgendaRadar } from "@/components/dashboard/agenda-radar";
import { AgendaDetailPanel } from "@/components/detail/agenda-detail-panel";
import { AgendaTable } from "@/components/agenda/agenda-table";
import {
  FiltersBar,
  type AgendaWorkspaceFilters
} from "@/components/agenda/filters-bar";
import type {
  AgendaDetail,
  AgendaListItem,
  AgendaSummary,
  UpdateAgendaItemInput,
  UpdateAgendaStatusInput
} from "@/types/agenda";

type AgendaWorkspaceProps = {
  initialItems: AgendaListItem[];
  initialSelectedItem: AgendaDetail | null;
  initialSummary: AgendaSummary;
};
```

**Typed fetch helper pattern** (lines 41-47):
```typescript
async function readJson<T>(response: Response): Promise<T> {
  if (!response.ok) {
    throw new Error("request_failed");
  }

  return (await response.json()) as T;
}
```

**Refresh and error handling pattern** (lines 123-142 and 180-190):
```typescript
async function refreshWorkspace(nextSelectedId?: number | null) {
  const targetId = nextSelectedId ?? selectedId;
  const response = await fetch(`/api/agenda${toQuery(filters)}`);
  const payload = await readJson<WorkspacePayload>(response);
  const resolvedSelectedId =
    targetId && payload.items.some((item) => item.id === targetId)
      ? targetId
      : payload.items[0]?.id ?? null;

  setItems(payload.items);
  setSummary(payload.summary);
  setSelectedId(resolvedSelectedId);

  if (!resolvedSelectedId) {
    setSelectedItem(null);
    return;
  }

  const detailResponse = await fetch(`/api/agenda/${resolvedSelectedId}`);
  const detailPayload = await readJson<AgendaDetail>(detailResponse);
  setSelectedItem(detailPayload);
}

function handleAsyncAction(action: () => Promise<void>) {
  startTransition(async () => {
    try {
      await action();
    } catch {
      setErrorMessage(
        "Nao foi possivel carregar a agenda. Atualize a tela ou revise o ultimo prazo alterado."
      );
    }
  });
}
```

**Navigation pattern** (lines 217-233):
```typescript
<nav className="workspace-sidebar__nav" aria-label="Navegacao do workspace">
  <Link
    className={pathname === "/inbox" ? "is-active" : undefined}
    href="/inbox"
  >
    Inbox
  </Link>
  <Link
    className={pathname === "/execucao" ? "is-active" : undefined}
    href="/execucao"
  >
    Tarefas
  </Link>
  <Link
    className={pathname === "/agenda" ? "is-active" : undefined}
    href="/agenda"
  >
    Agenda
  </Link>
</nav>
```

**Apply to panorama:** keep `usePathname`, `useTransition`, `notice`, `errorMessage`, and `readJson`. For a read-only panorama shell, state can be `panorama` plus optional selected signal/module. `refreshWorkspace()` should fetch `/api/panorama` and replace `panorama`; it should not fetch raw inbox/tasks/agenda endpoints independently.

---

### `src/components/panorama/overview-strip.tsx` (component, transform)

**Analog:** `src/components/dashboard/status-block.tsx` + radar components

**Status block primitive** (status-block lines 1-17):
```typescript
import React, { type ReactNode } from "react";

type StatusBlockProps = {
  emphasis?: "accent" | "default" | "warning";
  label: string;
  value: ReactNode;
};

export function StatusBlock({
  emphasis = "default",
  label,
  value
}: StatusBlockProps) {
  return (
    <article className={`status-block status-block--${emphasis}`}>
      <p>{label}</p>
      <strong>{value}</strong>
    </article>
  );
}
```

**Radar block pattern** (execution radar lines 21-42):
```typescript
<div className="ops-radar__blocks">
  <StatusBlock
    emphasis="accent"
    label="Prontos para conversao"
    value={summary.readyToConvertCount}
  />
  <StatusBlock
    emphasis="warning"
    label="Sem responsavel"
    value={summary.unassignedCount}
  />
  <StatusBlock
    emphasis="warning"
    label="Bloqueadas"
    value={summary.blockedCount}
  />
  <StatusBlock
    emphasis="accent"
    label="Criticas"
    value={summary.criticalCount}
  />
  <StatusBlock label="Envelhecidas" value={summary.agedCount} />
</div>
```

**Apply to panorama:** reuse `StatusBlock` for module-level counts. Use `warning` only for pressure/risk, `accent` for primary totals/readiness. Keep labels short because existing CSS has compact blocks.

---

### `src/components/panorama/signal-list.tsx` (component, transform)

**Analog:** `src/components/dashboard/ops-radar.tsx`

**Compact list pattern** (ops radar lines 34-55):
```typescript
<section className="ops-radar__section">
  <h4>Entradas por status</h4>
  <ul>
    {dashboard.byStatus.map((item) => (
      <li key={item.status}>
        <span>{item.status}</span>
        <strong>{item.count}</strong>
      </li>
    ))}
  </ul>
</section>

<section className="ops-radar__section">
  <h4>Itens mais antigos</h4>
  <ul>
    {dashboard.oldestItems.map((item) => (
      <li key={item.id}>
        <span>{item.title}</span>
        <strong>{item.ageHours}h</strong>
      </li>
    ))}
  </ul>
</section>
```

**Apply to panorama:** map `PanoramaSignal[]` into list rows with `key={signal.id}`. Include a short title/description and target route link, but keep the same dense list structure and empty-state branch.

---

### `src/components/panorama/intelligence-readiness.tsx` (component, transform)

**Analog:** `src/components/dashboard/agenda-radar.tsx`

**Empty/non-empty branch pattern** (agenda radar lines 45-58):
```typescript
<section className="ops-radar__section">
  <h4>Criticos</h4>
  {summary.criticalItems.length === 0 ? (
    <p>Nenhum prazo critico aberto.</p>
  ) : (
    <ul>
      {summary.criticalItems.map((item) => (
        <li key={item.id}>
          <span>{item.title}</span>
          <strong>{formatDateLabel(item.dueAt)}</strong>
        </li>
      ))}
    </ul>
  )}
</section>
```

**Apply to panorama:** readiness should list available/missing signals deterministically. Do not describe future AI as already active; use wording like readiness, base, or preparo.

---

### `src/components/panorama/milestone-direction.tsx` (component, transform)

**Analog:** `src/components/dashboard/agenda-radar.tsx`

**Local format helper pattern** (agenda radar lines 11-18):
```typescript
function formatDateLabel(value: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit"
  }).format(new Date(value));
}
```

**Apply to panorama:** if milestone options need display formatting, keep helper local to the component. Do not introduce shared utilities unless multiple files actually use the formatter.

---

### Existing workspace shell nav updates

**Files:** `src/components/inbox/workspace-shell.tsx`, `src/components/execution/workspace-shell.tsx`, `src/components/agenda/workspace-shell.tsx`

**Analog:** each current shell has the same local nav block.

**Inbox nav source** (inbox shell lines 223-239):
```tsx
<nav className="workspace-sidebar__nav" aria-label="Navegacao do workspace">
  <Link
    className={pathname === "/inbox" ? "is-active" : undefined}
    href="/inbox"
  >
    Inbox
  </Link>
  <Link
    className={pathname === "/execucao" ? "is-active" : undefined}
    href="/execucao"
  >
    Tarefas
  </Link>
  <Link
    className={pathname === "/agenda" ? "is-active" : undefined}
    href="/agenda"
  >
    Agenda
  </Link>
</nav>
```

**Execution nav source** (execution shell lines 239-255) and **Agenda nav source** (agenda shell lines 217-233) match the same pattern.

**Apply to panorama:** add a `Panorama` link consistently to all four shells. If planner chooses to extract shared nav, copy the `usePathname` + `Link` active-state logic exactly and keep scope limited to navigation.

---

### `src/app/layout.tsx` (config/component, request-response metadata)

**Analog:** same file current metadata.

**Current metadata pattern** (lines 1-9):
```typescript
import type { Metadata } from "next";
import type { ReactNode } from "react";

import "./globals.css";

export const metadata: Metadata = {
  title: "OpsCore",
  description: "Inbox operacional com triagem assistida por IA."
};
```

**Apply to Phase 4:** change only metadata copy unless there is a separate UI requirement. Description should mention the broader operational platform across inbox, tasks and agenda, without promising integrations or autonomous agents.

---

### `src/app/page.tsx` (component, request-response)

**Analog:** same file current home.

**Current home pattern** (lines 1-11):
```tsx
export default function HomePage() {
  return (
    <main className="app-shell">
      <section className="hero-panel">
        <p className="eyebrow">OpsCore</p>
        <h1>Base operacional em construção</h1>
        <p className="hero-copy">
          O repositório agora comporta um app web para a Fase 1 sem perder o
          workspace documental existente.
        </p>
      </section>
    </main>
  );
}
```

**Apply to Phase 4:** keep the simple `app-shell`/`hero-panel` structure or route users to `/panorama`; update copy to platform-wide language. Do not build a marketing landing page unless later UI spec requires it.

---

### `src/app/globals.css` (config/style, transform)

**Analog:** existing workspace and radar CSS.

**Workspace layout anchors** (lines 88-97, 151-166, 211-224):
```css
.workspace-page {
  display: grid;
  grid-template-columns: minmax(260px, 320px) 1fr;
  min-height: 100vh;
  background:
    radial-gradient(circle at top left, rgba(34, 197, 94, 0.14), transparent 32rem),
    #f8fafc;
}

.workspace-main {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  min-width: 0;
  padding: 2rem;
}

.workspace-grid {
  display: grid;
  grid-template-columns: minmax(30rem, 1.4fr) minmax(24rem, 1fr);
  gap: 1rem;
  align-items: start;
}
```

**Radar/status classes** (lines 405-529):
```css
.ops-radar {
  display: grid;
  gap: 1rem;
}

.ops-radar__blocks {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.75rem;
}

.status-block {
  border: 1px solid #dbe3ef;
  border-radius: 0.85rem;
  padding: 0.85rem;
  background: #ffffff;
}

.status-block--accent {
  border-color: rgba(37, 99, 235, 0.42);
}

.status-block--warning {
  border-color: rgba(245, 158, 11, 0.55);
}
```

**Apply to Phase 4:** extend existing workspace/radar class families. Avoid a separate visual system for panorama unless required by the UI spec.

---

### `src/test/panorama-domain.test.ts` (test, batch + transform)

**Analog:** `src/test/agenda-domain.test.ts`

**Domain test setup pattern** (agenda-domain lines 1-24, 46-52):
```typescript
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  createAgendaItem,
  getAgendaItems,
  getAgendaSummary,
  getAgendaUrgencyState,
  resetAgendaStore,
  updateAgendaItem,
  updateAgendaStatus
} from "@/db/queries/agenda";
import { createInboxItem, resetInboxStore, reviewInboxItem } from "@/db/queries/inbox";
import { createTaskFromInbox, resetTasksStore } from "@/db/queries/tasks";
import {
  agendaFiltersSchema,
  agendaKindSchema,
  agendaLinkedTypeSchema,
  agendaStatusSchema
} from "@/lib/validation/agenda";
import { createInboxFactory } from "./factories/inbox";

describe("agenda domain", () => {
  beforeEach(async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-04-20T12:00:00.000Z"));
    await resetInboxStore();
    await resetTasksStore();
    await resetAgendaStore();
  });
```

**Summary assertion pattern** (agenda-domain lines 252-302):
```typescript
it("lists, filters and summarizes active agenda risk states", async () => {
  const inbox = await createReviewedInbox({
    title: "Entrada com retorno urgente",
    priorityReviewed: "Critica"
  });

  await createAgendaItem({
    linkedType: "inbox",
    linkedId: inbox.id,
    kind: "deadline",
    dueAt: "2026-04-20T10:00:00.000Z"
  });

  const items = await getAgendaItems({ sort: "urgency" });
  const overdue = await getAgendaItems({ urgencyState: "vencido" });
  const summary = await getAgendaSummary();

  expect(items.map((item) => item.urgencyState)).toEqual([
    "vencido",
    "hoje",
    "proximo"
  ]);
  expect(overdue).toHaveLength(1);
  expect(summary).toMatchObject({
    activeCount: 3,
    overdueCount: 1,
    dueTodayCount: 1,
    upcomingCount: 1,
    criticalItems: expect.arrayContaining([
      expect.objectContaining({ title: "Entrada com retorno urgente" })
    ])
  });
});
```

**Apply to panorama:** reset all three stores, seed reviewed inbox + task + agenda risk, call `getOperationalPanorama()`, assert module states, signals, readiness, and no persistence side effects.

---

### `src/test/panorama-api.test.ts` (test, request-response)

**Analog:** `src/test/agenda-api.test.ts`

**Route import and request helper pattern** (agenda-api lines 1-30):
```typescript
import { NextRequest } from "next/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  GET as getAgendaWorkspace,
  POST as postAgenda
} from "@/app/api/agenda/route";
import { resetAgendaStore } from "@/db/queries/agenda";
import { createInboxItem, resetInboxStore, reviewInboxItem } from "@/db/queries/inbox";
import { createTaskFromInbox, resetTasksStore } from "@/db/queries/tasks";
import { createInboxFactory } from "./factories/inbox";

function getRequest(url = "http://localhost/api/agenda") {
  return new NextRequest(url);
}
```

**Workspace payload assertion pattern** (agenda-api lines 187-218):
```typescript
it("lists agenda workspace data and validates filters", async () => {
  const origin = await createReviewedInbox({ title: "Proposta urgente" });
  await postAgenda(
    postRequest("http://localhost/api/agenda", {
      linkedType: "inbox",
      linkedId: origin.id,
      kind: "deadline",
      dueAt: "2026-04-20T10:00:00.000Z"
    })
  );

  const response = await getAgendaWorkspace(
    getRequest("http://localhost/api/agenda?urgencyState=vencido")
  );
  const body = await response.json();

  expect(response.status).toBe(200);
  expect(body.items).toHaveLength(1);
  expect(body.summary).toMatchObject({
    overdueCount: 1,
    activeCount: 1
  });

  const invalidFilter = await getAgendaWorkspace(
    getRequest("http://localhost/api/agenda?urgencyState=invalid")
  );
  expect(invalidFilter.status).toBe(400);
});
```

**Apply to panorama:** import `GET as getPanorama`. Seed real stores through existing query/API helpers. Assert status `200`, full contract, and invalid filters only if panorama filters are implemented.

---

### `src/test/panorama-workspace.test.tsx` (test, event-driven + request-response)

**Analog:** `src/test/agenda-workspace.test.tsx`

**RTL shell setup pattern** (lines 1-15, 152-170):
```typescript
import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { WorkspaceShell } from "@/components/agenda/workspace-shell";
import type {
  AgendaDetail,
  AgendaListItem,
  AgendaSummary
} from "@/types/agenda";

vi.mock("next/navigation", () => ({
  usePathname: () => "/agenda"
}));

describe("agenda workspace shell", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("renders server-hydrated agenda, radar and detail", () => {
    render(
      <WorkspaceShell
        initialItems={agendaItems}
        initialSelectedItem={agendaDetail}
        initialSummary={summary}
      />
    );

    expect(screen.getByText("Agenda operacional")).toBeInTheDocument();
    expect(screen.getAllByText("Retomar contrato").length).toBeGreaterThan(0);
    expect(screen.getByText("Prazos criticos do fluxo operacional")).toBeInTheDocument();
  });
});
```

**Fetch mocking pattern** (agenda-workspace lines 173-199):
```typescript
it("filters by temporal state through the agenda API", async () => {
  const fetchMock = vi
    .fn<typeof fetch>()
    .mockResolvedValueOnce(
      new Response(JSON.stringify(workspacePayload([agendaItems[1]])))
    );
  vi.stubGlobal("fetch", fetchMock);

  render(
    <WorkspaceShell
      initialItems={agendaItems}
      initialSelectedItem={agendaDetail}
      initialSummary={summary}
    />
  );

  fireEvent.change(screen.getByLabelText("Filtrar agenda por estado temporal"), {
    target: { value: "vencido" }
  });

  await waitFor(() =>
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/agenda?sort=urgency&urgencyState=vencido"
    )
  );
});
```

**Apply to panorama:** mock `usePathname: () => "/panorama"`. Render with `initialPanorama`. Test module blocks, signal list, readiness, milestone options, nav links, empty state, and refresh button if added.

---

### Existing workspace tests for nav regression

**Files:** `src/test/inbox-workspace.test.tsx`, `src/test/execution-workspace.test.tsx`, `src/test/agenda-workspace.test.tsx`

**Analog:** `src/test/execution-workspace.test.tsx`

**Navigation mock pattern** (execution-workspace lines 1-14):
```typescript
import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { WorkspaceShell } from "@/components/execution/workspace-shell";

vi.mock("next/navigation", () => ({
  usePathname: () => "/execucao"
}));
```

**Render + assertions pattern** (execution-workspace lines 138-160):
```typescript
render(
  <WorkspaceShell
    initialItems={taskItems}
    initialReadyToConvert={readyToConvert}
    initialSelectedItem={taskDetail}
    initialSummary={summary}
  />
);

expect(screen.getAllByText("Contrato operacional").length).toBeGreaterThan(0);
expect(screen.getByText("Checklist de onboarding")).toBeInTheDocument();
expect(screen.getByText("Origem vinculada")).toBeInTheDocument();
```

**Apply to Phase 4:** after adding `Panorama` nav, add assertions that the link exists and has `href="/panorama"` in all workspace shells. Keep tests focused on regression, not full panorama behavior.

---

### `README.md`, `context.md`, selected product docs (documentation, transform)

**Analog:** `README.md`

**Current status section** (README lines 10-20):
```markdown
## Status
Repositório híbrido: documentação estratégica + app web da Fase 1 em execução inicial.

## App web local

### Comandos
- `npm install`
- `npm run dev`
- `npm run lint`
- `npm run build`
- `npm run test -- --run`
```

**Apply to Phase 4:** update only stale wording that still says Phase 1/inbox-only when Phase 4 ships. Keep Markdown concise and preserve Portuguese.

---

### `.planning/REQUIREMENTS.md` / `.planning/STATE.md` (planning state, transform)

**Analog:** existing traceability/state tables.

**Requirements traceability anchor** (`.planning/REQUIREMENTS.md` lines 67-85):
```markdown
| Requirement | Phase | Status |
|-------------|-------|--------|
| INBX-01 | Phase 1 | Pending |
| INBX-02 | Phase 1 | Pending |
| INBX-03 | Phase 1 | Pending |
...
| DASH-03 | Phase 4 | Pending |
```

**State current status anchor** (`.planning/STATE.md` lines 10-25):
```markdown
## Current Status

- Project initialized via gsd-new-project
- Mode: YOLO
- Research synthesized from current repository documents
...
- Phase 3 execution completed with agenda domain/API, `/agenda` workspace, contextual scheduling from inbox/tasks, focused code review and verification passed
- Next recommended action: plan Phase 4 - Panorama e Inteligencia
```

**Apply to Phase 4:** planner should only include traceability updates after implementation verification. If DASH-01/DASH-02 are reconciled, cite phase summaries/tests; do not mark requirements complete from pattern mapping alone.

## Shared Patterns

### Server-First Workspace Hydration

**Source:** `src/app/(workspace)/agenda/page.tsx` lines 1-18  
**Apply to:** `src/app/(workspace)/panorama/page.tsx`

```typescript
const items = await getAgendaItems();
const selectedItem = items[0] ? await getAgendaItemById(items[0].id) : null;
const summary = await getAgendaSummary();

return (
  <WorkspaceShell
    initialItems={items}
    initialSelectedItem={selectedItem}
    initialSummary={summary}
  />
);
```

### Route Handler Response Shape

**Source:** `src/app/api/tasks/route.ts` lines 10-29  
**Apply to:** `src/app/api/panorama/route.ts`

```typescript
const parsed = taskFiltersSchema.safeParse({
  status: request.nextUrl.searchParams.get("status") ?? undefined,
  priority: request.nextUrl.searchParams.get("priority") ?? undefined
});

if (!parsed.success) {
  return NextResponse.json({ error: "Invalid task filters" }, { status: 400 });
}

const [items, summary, readyToConvert] = await Promise.all([
  getTasks(parsed.data),
  getExecutionSummary(),
  getReadyToConvertItems()
]);

return NextResponse.json({ items, summary, readyToConvert });
```

### File-Backed Store Boundaries

**Source:** `src/db/queries/inbox.ts` lines 49-69 and `src/db/queries/dashboard.ts` lines 1-3  
**Apply to:** `src/db/queries/panorama.ts`

```typescript
async function ensureStore() {
  await mkdir(DATA_DIR, { recursive: true });
  try {
    await readFile(DATA_FILE, "utf8");
  } catch {
    await writeFile(DATA_FILE, "[]", "utf8");
  }
}

export { getDashboardSummary };
```

**Guidance:** panorama should not create a new persisted store in Phase 4 unless requirements change. It should import existing summaries and expose a derived aggregate.

### Client Shell Error Handling

**Source:** `src/components/agenda/workspace-shell.tsx` lines 41-47 and 180-190  
**Apply to:** all panorama client fetches

```typescript
async function readJson<T>(response: Response): Promise<T> {
  if (!response.ok) {
    throw new Error("request_failed");
  }

  return (await response.json()) as T;
}

function handleAsyncAction(action: () => Promise<void>) {
  startTransition(async () => {
    try {
      await action();
    } catch {
      setErrorMessage(
        "Nao foi possivel carregar a agenda. Atualize a tela ou revise o ultimo prazo alterado."
      );
    }
  });
}
```

### Navigation

**Source:** `src/components/inbox/workspace-shell.tsx` lines 223-239  
**Apply to:** inbox, execution, agenda, panorama shells

```tsx
<Link
  className={pathname === "/agenda" ? "is-active" : undefined}
  href="/agenda"
>
  Agenda
</Link>
```

**Guidance:** add equivalent block for `/panorama`. If extracted, preserve `aria-label="Navegacao do workspace"` and `is-active` class behavior.

### Dense Operational UI

**Source:** `src/components/dashboard/status-block.tsx` lines 1-17 and `src/components/dashboard/ops-radar.tsx` lines 34-55  
**Apply to:** panorama overview, signal list, readiness, milestone direction

```tsx
<article className={`status-block status-block--${emphasis}`}>
  <p>{label}</p>
  <strong>{value}</strong>
</article>

<ul>
  {dashboard.oldestItems.map((item) => (
    <li key={item.id}>
      <span>{item.title}</span>
      <strong>{item.ageHours}h</strong>
    </li>
  ))}
</ul>
```

### Tests With Real Stores

**Source:** `src/test/agenda-domain.test.ts` lines 46-52 and `src/test/dashboard-review.test.ts` lines 50-82  
**Apply to:** `src/test/panorama-domain.test.ts`, `src/test/panorama-api.test.ts`

```typescript
beforeEach(async () => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date("2026-04-20T12:00:00.000Z"));
  await resetInboxStore();
  await resetTasksStore();
  await resetAgendaStore();
});

const response = await getDashboard();
const dashboard = await response.json();

expect(dashboard.highPriorityCount).toBe(1);
expect(dashboard.waitingOnResponseCount).toBe(1);
```

## No Analog Found

| File | Role | Data Flow | Reason |
|------|------|-----------|--------|
| `src/lib/intelligence/context-packet.ts` | utility | transform | No existing cross-domain context-packet utility; closest pattern is the type-level split between AI suggestion and reviewed fields in `src/types/inbox.ts`. |
| `src/components/panorama/milestone-direction.tsx` | component | transform | No existing milestone recommendation component; use radar/list display patterns and keep decisions evidence-based. |
| External integration contracts beyond readiness snapshots | model/service | event-driven/pub-sub | No connector, OAuth, webhook, or sync patterns exist in v1, and research marks real integrations out of scope. |

## Planner Notes

- Primary implementation order should be contract/query/tests first, then API/page, then UI/nav/copy.
- `src/db/queries/dashboard.ts` is currently only a re-export of inbox dashboard; do not expand it into cross-domain ownership. Create `src/db/queries/panorama.ts`.
- Keep `OperationalPanorama` as a current-state snapshot, not historical BI. No new persistence is needed for the recommended v1.
- Use Portuguese copy, matching current app text.
- Do not add OAuth, external channel mocks, calendar sync, autonomous agents, or new OpenAI calls.

## Metadata

**Analog search scope:** `.planning`, `src/types`, `src/db/queries`, `src/lib/validation`, `src/app`, `src/components`, `src/test`, `README.md`  
**Files scanned:** 34 via required reads and targeted `rg` searches  
**Pattern extraction date:** 2026-04-21  
