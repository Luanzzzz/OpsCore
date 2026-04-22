# Phase 2: Execucao de Trabalho - Pattern Map

**Mapeado:** 2026-04-18
**Arquivos analisados:** 17
**Analogos encontrados:** 17 / 17

## File Classification

| Novo/Modificado | Papel | Fluxo de dados | Analogico mais proximo | Qualidade |
|---|---|---|---|---|
| `src/types/tasks.ts` | model | CRUD | `src/types/inbox.ts` | exato |
| `src/db/schema/tasks.ts` | model | CRUD | `src/db/schema/inbox.ts` | exato |
| `src/lib/validation/tasks.ts` | utility | request-response | `src/lib/validation/inbox.ts` | exato |
| `src/db/queries/tasks.ts` | service | CRUD | `src/db/queries/inbox.ts` | exato |
| `src/app/api/tasks/route.ts` | route | request-response | `src/app/api/inbox/route.ts` | exato |
| `src/app/api/tasks/[id]/route.ts` | route | request-response | `src/app/api/inbox/[id]/route.ts` | exato |
| `src/app/api/tasks/[id]/status/route.ts` | route | request-response | `src/app/api/inbox/[id]/review/route.ts` | role-match |
| `src/app/(workspace)/execucao/page.tsx` | route | request-response | `src/app/(workspace)/inbox/page.tsx` | exato |
| `src/components/execution/workspace-shell.tsx` | component | request-response | `src/components/inbox/workspace-shell.tsx` | exato |
| `src/components/execution/tasks-table.tsx` | component | CRUD | `src/components/inbox/inbox-table.tsx` | exato |
| `src/components/execution/filters-bar.tsx` | component | transform | `src/components/inbox/filters-bar.tsx` | exato |
| `src/components/execution/conversion-strip.tsx` | component | event-driven | `src/components/inbox/new-entry-dialog.tsx` | role-match |
| `src/components/detail/task-detail-panel.tsx` | component | request-response | `src/components/detail/item-detail-panel.tsx` | exato |
| `src/components/dashboard/execution-radar.tsx` | component | transform | `src/components/dashboard/ops-radar.tsx` | exato |
| `src/test/tasks-domain.test.ts` | test | CRUD | `src/test/inbox-domain.test.ts` | exato |
| `src/test/tasks-api.test.ts` | test | request-response | `src/test/inbox-api.test.ts` | exato |
| `src/test/execution-workspace.test.tsx` | test | event-driven | `src/test/inbox-workspace.test.tsx` | exato |

## Pattern Assignments

### `src/types/tasks.ts` (model, CRUD)

**Analogico:** `src/types/inbox.ts`

**Contratos base** (`src/types/inbox.ts:1-69`)
```ts
export type InboxPriority = "Baixa" | "Media" | "Alta" | "Critica";
export type TriageStatus = "pending" | "ready" | "reviewed";

export interface InboxListItem {
  id: number;
  title: string;
  source: string;
  summaryShort: string;
  status: InboxStatus;
  priorityReviewed: InboxPriority;
  waitingOnResponse: boolean;
  lastActivityAt: string;
  triageStatus: TriageStatus;
}
```

**Aplicacao:** manter a mesma separacao entre tipo literal, item de lista, detalhe, filtros e payloads de mutacao. Em `tasks.ts`, espelhar isso com `TaskStatus`, `TaskPriority`, `TaskListItem`, `TaskDetail`, `CreateTaskFromInboxInput`, `UpdateTaskStatusInput` e `TaskFilters`.

---

### `src/db/schema/tasks.ts` (model, CRUD)

**Analogico:** `src/db/schema/inbox.ts`

**Imports e enums** (`src/db/schema/inbox.ts:1-28`)
```ts
import { boolean, pgEnum, pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";

export const inboxStatusEnum = pgEnum("inbox_status", [
  "Nova",
  "Em analise",
  "Aguardando resposta",
  "Concluida/Arquivada"
]);
```

**Tabela canonica** (`src/db/schema/inbox.ts:30-61`)
```ts
export const inboxItems = pgTable("inbox_items", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  source: text("source").notNull(),
  summaryShort: text("summary_short").notNull(),
  descriptionRaw: text("description_raw").notNull(),
  status: inboxStatusEnum("status").notNull().default("Nova"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull()
});
```

**Aplicacao:** declarar enums `task_status` e `task_priority` no mesmo estilo e incluir `originInboxId`, `owner`, `status`, `priority`, `lastMovementAt`, `createdAt`, `updatedAt`.

---

### `src/lib/validation/tasks.ts` (utility, request-response)

**Analogico:** `src/lib/validation/inbox.ts`

**Padrao zod** (`src/lib/validation/inbox.ts:1-35`)
```ts
import { z } from "zod";

export const inboxPrioritySchema = z.enum(["Baixa", "Media", "Alta", "Critica"]);

export const createInboxInputSchema = z.object({
  title: z.string().trim().min(1),
  source: z.string().trim().min(1),
  summaryShort: z.string().trim().min(1)
});
```

**Aplicacao:** expor enums e objetos `z.object` pequenos, sem validacao espalhada nas rotas. Em `tasks.ts`, criar ao menos `taskStatusSchema`, `taskPrioritySchema`, `createTaskFromInboxSchema`, `taskFiltersSchema`, `updateTaskStatusSchema`.

---

### `src/db/queries/tasks.ts` (service, CRUD)

**Analogico:** `src/db/queries/inbox.ts`

**Persistencia local e tipo persistido** (`src/db/queries/inbox.ts:16-23`, `45-63`)
```ts
const DATA_DIR = path.join(process.cwd(), ".data");
const DATA_FILE = path.join(DATA_DIR, "inbox-items.json");

export type PersistedInboxItem = InboxDetail & {
  createdAt: string;
  updatedAt: string;
};

async function readStore(): Promise<PersistedInboxItem[]> {
  await ensureStore();
  const raw = await readFile(DATA_FILE, "utf8");
  return JSON.parse(raw) as PersistedInboxItem[];
}
```

**Criacao com defaults e IDs** (`src/db/queries/inbox.ts:78-107`)
```ts
const nextId =
  items.reduce((highest, item) => Math.max(highest, item.id), 0) + 1;

const item: PersistedInboxItem = {
  id: nextId,
  title: input.title,
  source: input.source,
  triageStatus: "pending",
  createdAt: now,
  updatedAt: now
};
```

**Filtro + ordenacao** (`src/db/queries/inbox.ts:110-134`)
```ts
return items
  .filter((item) => !filters.status || item.status === filters.status)
  .filter((item) => !filters.priority || item.priorityReviewed === filters.priority)
  .sort((left, right) => { /* prioridade e idade */ })
  .map(toListItem);
```

**Mutacao de update imutavel** (`src/db/queries/inbox.ts:69-76`, `163-187`)
```ts
async function updateInboxItems(
  updater: (items: PersistedInboxItem[]) => PersistedInboxItem[]
) {
  const items = await readStore();
  const updated = updater(items);
  await writeStore(updated);
  return updated;
}
```

**Aplicacao:** `tasks.ts` deve repetir o modelo file-backed com um store proprio (`tasks.json`), helper `updateTasks`, `createTaskFromInbox`, `getTasks`, `getTaskById`, `updateTaskStatus`. Ao converter do inbox, validar a origem e persistir um snapshot minimo da origem junto do `originInboxId`.

---

### `src/app/api/tasks/route.ts` (route, request-response)

**Analogico:** `src/app/api/inbox/route.ts`

**Imports e GET/POST enxutos** (`src/app/api/inbox/route.ts:1-25`)
```ts
import { NextRequest, NextResponse } from "next/server";

import { getInboxItems, createInboxItem } from "@/db/queries/inbox";
import { createInboxInputSchema, inboxFiltersSchema } from "@/lib/validation/inbox";

export async function GET(request: NextRequest) {
  const filters = inboxFiltersSchema.parse({
    status: request.nextUrl.searchParams.get("status") ?? undefined,
    priority: request.nextUrl.searchParams.get("priority") ?? undefined
  });

  const items = await getInboxItems(filters);
  return NextResponse.json({ items });
}
```

**Aplicacao:** manter rota sem camada extra. `GET` parseia query params com schema. `POST` recebe JSON, chama schema e delega a `createTaskFromInbox`.

---

### `src/app/api/tasks/[id]/route.ts` (route, request-response)

**Analogico:** `src/app/api/inbox/[id]/route.ts`

**Padrao detalhe por ID** (`src/app/api/inbox/[id]/route.ts:5-24`)
```ts
type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(_: Request, context: RouteContext) {
  const { id } = await context.params;
  const numericId = Number(id);

  if (Number.isNaN(numericId)) {
    return NextResponse.json({ error: "Invalid inbox id" }, { status: 400 });
  }
```

**Aplicacao:** repetir `RouteContext`, coercao `Number(id)`, retorno `400` para id invalido e `404` para tarefa inexistente.

---

### `src/app/api/tasks/[id]/status/route.ts` (route, request-response)

**Analogico:** `src/app/api/inbox/[id]/review/route.ts`

**Mutacao com parse + not found** (`src/app/api/inbox/[id]/review/route.ts:10-25`)
```ts
export async function POST(request: Request, context: RouteContext) {
  const { id } = await context.params;
  const numericId = Number(id);

  if (Number.isNaN(numericId)) {
    return NextResponse.json({ error: "Invalid inbox id" }, { status: 400 });
  }

  const payload = triageReviewSchema.parse(await request.json());
  const updated = await reviewInboxItem(numericId, payload);
```

**Aplicacao:** usar uma unica mutacao POST para transicao operacional inicial da fase. O payload deve aceitar `owner`, `status`, `priority` e talvez `lastMovementNote`, com schema centralizado.

---

### `src/app/(workspace)/execucao/page.tsx` (route, request-response)

**Analogico:** `src/app/(workspace)/inbox/page.tsx`

**SSR simples** (`src/app/(workspace)/inbox/page.tsx:1-17`)
```ts
export default async function InboxWorkspacePage() {
  const items = await getInboxItems();
  const selectedItem = items[0] ? await getInboxItemById(items[0].id) : null;
  const dashboard = await getDashboardSummary();

  return (
    <WorkspaceShell
      initialDashboard={dashboard}
      initialItems={items}
      initialSelectedItem={selectedItem}
    />
  );
}
```

**Aplicacao:** `execucao/page.tsx` deve seguir o mesmo desenho server-first: carregar tarefas, detalhe inicial, resumo e faixa de conversao antes de renderizar o shell client.

---

### `src/components/execution/workspace-shell.tsx` (component, request-response)

**Analogico:** `src/components/inbox/workspace-shell.tsx`

**Assinatura e estado base** (`src/components/inbox/workspace-shell.tsx:19-24`, `33-54`)
```ts
type WorkspaceShellProps = {
  initialDashboard: DashboardSummary;
  initialItems: InboxListItem[];
  initialSelectedItem: InboxDetail | null;
};

const [items, setItems] = useState(initialItems);
const [dashboard, setDashboard] = useState(initialDashboard);
const [selectedId, setSelectedId] = useState<number | null>(...);
const [selectedItem, setSelectedItem] = useState<InboxDetail | null>(...);
const [isPending, startTransition] = useTransition();
```

**Refresh centralizado** (`src/components/inbox/workspace-shell.tsx:97-124`)
```ts
async function refreshWorkspace(nextSelectedId?: number | null) {
  const [itemsResponse, dashboardResponse] = await Promise.all([
    fetch("/api/inbox"),
    fetch("/api/dashboard")
  ]);
  // atualiza lista, radar e detalhe selecionado
}
```

**Tratamento de mutacoes** (`src/components/inbox/workspace-shell.tsx:166-174`)
```ts
function handleAsyncAction(action: () => Promise<void>) {
  startTransition(() => {
    action().catch(() => {
      setErrorMessage("Nao foi possivel carregar a fila operacional...");
    });
  });
}
```

**Layout principal** (`src/components/inbox/workspace-shell.tsx:178-279`)
```tsx
<main className="workspace-page">
  <aside className="workspace-sidebar">...</aside>
  <section className="workspace-main">...</section>
</main>
```

**Aplicacao:** o shell de execucao deve reaproveitar essa organizacao, trocando os endpoints e incluindo duas zonas novas do contrato da fase: `ConversionStrip` e `ExecutionRadar`.

---

### `src/components/execution/tasks-table.tsx` (component, CRUD)

**Analogico:** `src/components/inbox/inbox-table.tsx`

**TanStack + helper** (`src/components/inbox/inbox-table.tsx:4-15`, `76-109`)
```ts
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable
} from "@tanstack/react-table";

const columnHelper = createColumnHelper<InboxListItem>();
```

**Filtro + ordenacao local** (`src/components/inbox/inbox-table.tsx:31-58`)
```ts
function sortItems(items: InboxListItem[], filters: WorkspaceFilters) {
  return [...items]
    .filter(...)
    .sort((left, right) => { /* prioridade / ultima atividade */ });
}
```

**Linha clicavel e destaque** (`src/components/inbox/inbox-table.tsx:131-154`)
```tsx
<tr
  aria-selected={isSelected}
  className={isSelected ? "is-selected" : undefined}
  onClick={() => onSelectItem(item.id)}
>
```

**Aplicacao:** manter tabela densa como superficie principal. As colunas devem priorizar `titulo`, `responsavel`, `prioridade`, `status`, `origem`, `envelhecimento`.

---

### `src/components/execution/filters-bar.tsx` (component, transform)

**Analogico:** `src/components/inbox/filters-bar.tsx`

**Estado controlado simples** (`src/components/inbox/filters-bar.tsx:7-16`, `18-73`)
```ts
export type WorkspaceFilters = {
  priority: InboxPriority | "all";
  sort: "priority" | "recent";
  status: InboxStatus | "all";
};

export function FiltersBar({ filters, onChange }: FiltersBarProps) {
  return (
    <div className="filters-bar">
      <label className="filters-bar__field">
        <span>Filtrar por status</span>
        <select ... />
      </label>
    </div>
  );
}
```

**Aplicacao:** preservar o padrao de `select` controlado e label textual explicita. Em execucao, adicionar filtro por `responsavel` e `envelhecimento` sem menus profundos.

---

### `src/components/execution/conversion-strip.tsx` (component, event-driven)

**Analogico:** `src/components/inbox/new-entry-dialog.tsx`

**Form state local + reset por abertura** (`src/components/inbox/new-entry-dialog.tsx:21-35`)
```ts
const [form, setForm] = useState<CreateInboxInput>(INITIAL_FORM);
const [error, setError] = useState<string | null>(null);

useEffect(() => {
  if (isOpen) {
    setForm(INITIAL_FORM);
    setError(null);
  }
}, [isOpen]);
```

**Validacao leve antes do submit** (`src/components/inbox/new-entry-dialog.tsx:48-60`)
```ts
if (!form.title.trim() || !form.source.trim() || !form.summaryShort.trim()) {
  setError("Preencha titulo, origem e resumo curto...");
  return;
}

onSubmit({
  ...form,
  title: form.title.trim()
});
```

**Aplicacao:** a faixa de conversao pode ser inline em vez de modal, mas deve copiar este padrao de estado local, prefill, validacao clara e submit unico para `Converter em tarefa`.

---

### `src/components/detail/task-detail-panel.tsx` (component, request-response)

**Analogico:** `src/components/detail/item-detail-panel.tsx`

**Fallback vazio** (`src/components/detail/item-detail-panel.tsx:24-41`)
```tsx
if (!detail) {
  return (
    <section className="detail-panel">
      <p className="workspace-panel__eyebrow">Detalhe</p>
      <h3>Selecione uma entrada</h3>
    </section>
  );
}
```

**Meta e secoes** (`src/components/detail/item-detail-panel.tsx:43-79`)
```tsx
<header className="detail-panel__header">
  <div>
    <p className="workspace-panel__eyebrow">Detalhe do item</p>
    <h3>{detail.title}</h3>
  </div>
  <span className="status-chip">{detail.status}</span>
</header>

<dl className="detail-panel__meta">
  <div><dt>Origem</dt><dd>{detail.source}</dd></div>
  <div><dt>Ultima atividade</dt><dd>{formatDateLabel(detail.lastActivityAt)}</dd></div>
</dl>
```

**Aplicacao:** manter a mesma casca visual, mas substituir o bloco principal por `Responsavel`, `Status da tarefa`, `Prioridade`, `Ultima movimentacao` e um card persistente de `Origem vinculada` acima da dobra.

---

### `src/components/dashboard/execution-radar.tsx` (component, transform)

**Analogico:** `src/components/dashboard/ops-radar.tsx`

**Blocos resumo** (`src/components/dashboard/ops-radar.tsx:20-32`)
```tsx
<div className="ops-radar__blocks">
  <StatusBlock emphasis="accent" label="Alta/Critica" value={dashboard.highPriorityCount} />
  <StatusBlock emphasis="warning" label="Aguardando resposta" value={dashboard.waitingOnResponseCount} />
</div>
```

**Listas secundarias** (`src/components/dashboard/ops-radar.tsx:34-56`)
```tsx
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

**Aplicacao:** limitar o radar de execucao a 4-5 blocos como manda o UI-SPEC: prontos para conversao, sem responsavel, bloqueadas, criticas, envelhecidas.

---

### `src/test/tasks-domain.test.ts` (test, CRUD)

**Analogico:** `src/test/inbox-domain.test.ts`

**Estrutura do teste de dominio** (`src/test/inbox-domain.test.ts:1-26`)
```ts
beforeEach(async () => {
  await resetInboxStore();
});

it("defaults priority and status and keeps triage pending", async () => {
  const item = await createInboxItem(createInboxFactory());

  expect(item.priorityReviewed).toBe("Media");
  expect(item.status).toBe("Nova");
});
```

**Aplicacao:** repetir o padrão com `resetTasksStore()` e asserts de defaults, vínculo `originInboxId` e separação entre status do inbox e da task.

---

### `src/test/tasks-api.test.ts` (test, request-response)

**Analogico:** `src/test/inbox-api.test.ts`

**Chamada direta de handlers** (`src/test/inbox-api.test.ts:13-34`, `36-67`)
```ts
const response = await postInbox(
  new Request("http://localhost/api/inbox", {
    method: "POST",
    body: JSON.stringify({ title: "...", source: "...", summaryShort: "..." })
  }) as never
);

expect(response.status).toBe(201);
```

**Aplicacao:** testar `POST /api/tasks`, `GET /api/tasks` e `GET /api/tasks/[id]` importando os handlers diretamente, como já ocorre no inbox.

---

### `src/test/execution-workspace.test.tsx` (test, event-driven)

**Analogico:** `src/test/inbox-workspace.test.tsx`

**Dados fixos e mocks de fetch** (`src/test/inbox-workspace.test.tsx:8-56`, `83-170`)
```ts
const inboxItems: InboxListItem[] = [ ... ];
const dashboard: DashboardSummary = { ... };

const fetchMock = vi.fn<typeof fetch>()
  .mockResolvedValueOnce(new Response(JSON.stringify(...), { status: 201 }))
  .mockResolvedValueOnce(new Response(JSON.stringify({ items: [...] })));
```

**Teste de filtro e acao principal** (`src/test/inbox-workspace.test.tsx:63-81`, `148-169`)
```ts
fireEvent.change(screen.getByLabelText("Filtrar por status"), {
  target: { value: "Aguardando resposta" }
});

await waitFor(() =>
  expect(fetchMock).toHaveBeenCalledWith(
    "/api/inbox",
    expect.objectContaining({ method: "POST" })
  )
);
```

**Aplicacao:** reproduzir o padrão com `WorkspaceShell` de execucao, cobrindo filtro por status/owner e CTA `Converter em tarefa`.

## Shared Patterns

### Validacao e resposta de rota
**Fonte:** `src/app/api/inbox/route.ts:9-25`, `src/app/api/inbox/[id]/review/route.ts:10-25`
**Aplicar em:** todas as rotas `tasks/*`

```ts
const payload = schema.parse(await request.json());
const updated = await mutation(numericId, payload);

if (!updated) {
  return NextResponse.json({ error: "..." }, { status: 404 });
}

return NextResponse.json(updated);
```

### Persistencia local como source of truth
**Fonte:** `src/db/queries/inbox.ts:45-76`
**Aplicar em:** `src/db/queries/tasks.ts`

```ts
async function readStore(): Promise<PersistedInboxItem[]> {
  await ensureStore();
  const raw = await readFile(DATA_FILE, "utf8");
  return JSON.parse(raw) as PersistedInboxItem[];
}

async function updateInboxItems(updater: ...) {
  const items = await readStore();
  const updated = updater(items);
  await writeStore(updated);
  return updated;
}
```

### Shell client com refresh pontual
**Fonte:** `src/components/inbox/workspace-shell.tsx:97-124`, `166-174`
**Aplicar em:** `src/components/execution/workspace-shell.tsx`

```ts
async function refreshWorkspace(nextSelectedId?: number | null) { ... }

function handleAsyncAction(action: () => Promise<void>) {
  startTransition(() => {
    action().catch(() => setErrorMessage("..."));
  });
}
```

### Formulario controlado de detalhe
**Fonte:** `src/components/detail/triage-review-card.tsx:22-43`, `86-171`
**Aplicar em:** formularios de owner/status/prioridade no detalhe da tarefa

```ts
function toFormState(detail: InboxDetail): ReviewFormState { ... }

useEffect(() => {
  setForm(toFormState(detail));
}, [detail]);
```

### Tabela densa com selecao
**Fonte:** `src/components/inbox/inbox-table.tsx:75-109`, `131-154`
**Aplicar em:** `src/components/execution/tasks-table.tsx`

```tsx
const table = useReactTable({ columns: [...], data: rows, getCoreRowModel: getCoreRowModel() });

<tr aria-selected={isSelected} className={isSelected ? "is-selected" : undefined}>
```

## No Analog Found

Nenhum. Todos os arquivos centrais da Fase 2 possuem analogos fortes e atuais na Fase 1.

## Metadata

**Escopo de busca:** `src/app/api/inbox*`, `src/db/queries/inbox.ts`, `src/db/schema/inbox.ts`, `src/types/inbox.ts`, `src/lib/validation/inbox.ts`, `src/components/inbox/*`, `src/components/detail/*`, `src/components/dashboard/*`, `src/test/*`
**Arquivos lidos:** 15
**Data de extracao:** 2026-04-18
