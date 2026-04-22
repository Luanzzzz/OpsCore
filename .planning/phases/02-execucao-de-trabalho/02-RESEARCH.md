# Phase 2: Execucao de Trabalho - Research

**Researched:** 2026-04-18
**Domain:** conversao de itens triados em tarefas rastreaveis dentro do monolito Next.js atual [VERIFIED: local repo]
**Confidence:** HIGH

## User Constraints

### Locked Decisions
- Nenhum `02-CONTEXT.md` existe para esta fase; nao ha decisoes adicionais travadas pelo usuario alem do que ja consta em `ROADMAP.md`, `PROJECT.md` e `02-UI-SPEC.md` [VERIFIED: local repo]

### Claude's Discretion
- O planner pode escolher a decomposicao entre dominio, API e UI, desde que preserve a continuidade da Fase 1: monolito `Next.js`, design system manual, linguagem list-detail e separacao explicita entre backlog de entrada e backlog de execucao [VERIFIED: local repo]

### Deferred Ideas (OUT OF SCOPE)
- Agenda, follow-ups e vencimentos permanecem na Fase 3 [VERIFIED: local repo]
- Integracoes reais, automacoes amplas e IA mais forte permanecem fora desta fase [VERIFIED: local repo]
- Redesign de plataforma ou troca de stack nao faz parte do objetivo desta fase [VERIFIED: local repo]

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| TASK-01 | Usuario pode converter uma entrada em tarefa operacional sem perder o vinculo com a origem | Criar entidade `task` com `originInboxItemId` persistido e fluxo dedicado de conversao a partir do inbox [VERIFIED: local repo] [CITED: https://orm.drizzle.team/docs/indexes-constraints] |
| TASK-02 | Usuario pode definir responsavel e prioridade para cada tarefa | Expor campos canonicos de ownership e prioridade no dominio, validacao Zod e formularios na UI [VERIFIED: local repo] [CITED: https://zod.dev/basics] |
| TASK-03 | Usuario pode atualizar status da tarefa ao longo da execucao | Persistir status proprio da tarefa e mutacoes de update separadas da revisao de triagem [VERIFIED: local repo] [CITED: https://nextjs.org/docs/app/getting-started/route-handlers-and-middleware] |
| TASK-04 | Usuario pode consultar tarefas com referencia ao item original que as gerou | Entregar lista/detalhe de tarefas com card persistente de origem e historico operacional minimo [VERIFIED: local repo] [CITED: https://orm.drizzle.team/docs/relations] |
</phase_requirements>

## Summary

A Fase 2 deve ser planejada como **extensao do fluxo da Fase 1**, nao como um novo modulo isolado [VERIFIED: local repo]. O repositorio ja possui um shell inbox-first em `src/app/(workspace)/inbox/page.tsx`, contratos canonicos de inbox em `src/types/inbox.ts`, esquema Drizzle de inbox em `src/db/schema/inbox.ts`, rotas App Router sob `src/app/api/*` e persistencia runtime file-backed em `src/db/queries/inbox.ts` [VERIFIED: local repo]. O menor caminho com melhor continuidade e acrescentar um dominio explicito de tarefas usando os mesmos padroes de tipos, queries, validacao, route handlers e componentes densos [VERIFIED: local repo] [CITED: https://nextjs.org/docs/app/getting-started/server-and-client-components] [CITED: https://nextjs.org/docs/app/getting-started/route-handlers-and-middleware].

O principal cuidado de planejamento e **nao colapsar tarefa em “mais um status do inbox”** [VERIFIED: local repo]. Os requisitos da fase pedem ownership, progresso operacional e consulta da tarefa com referencia ao item original [VERIFIED: local repo]. Isso exige uma entidade `task` propria, com ligacao persistida ao inbox, e nao apenas campos extras no `InboxDetail` [ASSUMED]. O UI-SPEC aprovado reforca essa leitura ao separar backlog de entrada de backlog de execucao, exigir CTA `Converter em tarefa`, faixa de itens prontos para conversao e lista densa de tarefas com responsavel, prioridade, status e envelhecimento [VERIFIED: local repo].

Como a Fase 1 executa hoje sobre store file-backed e o roadmap da Fase 2 nao menciona migracao de runtime para Postgres, o plano mais seguro e manter a mesma estrategia de persistencia nesta fase, acrescentando schema/tipos de tarefas de forma compativel com a modelagem relacional futura [VERIFIED: local repo] [ASSUMED]. Isso preserva o escopo em conversao, ownership e rastreabilidade, em vez de abrir uma segunda frente de migracao de dados e infraestrutura no mesmo pacote [ASSUMED].

**Primary recommendation:** planejar a Fase 2 como tres frentes coordenadas: dominio/persistencia de tarefas, APIs de conversao e update, e workspace de execucao com lista densa + detalhe + faixa de conversao [VERIFIED: local repo].

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Converter item triado em tarefa | API / Backend | Database / Storage | A conversao precisa validar payload, persistir o vinculo com a origem e evitar duplicacao de regra na UI [VERIFIED: local repo] [CITED: https://nextjs.org/docs/app/getting-started/route-handlers-and-middleware] |
| Renderizar backlog de execucao e detalhe inicial | Frontend Server | Browser / Client | O projeto ja usa leitura inicial no servidor e hidrata a mesa interativa no cliente [VERIFIED: local repo] [CITED: https://nextjs.org/docs/app/getting-started/server-and-client-components] |
| Filtrar, ordenar e selecionar tarefas | Browser / Client | Frontend Server | Sao interacoes de tabela/estado local, como ja acontece no inbox atual [VERIFIED: local repo] [CITED: https://nextjs.org/docs/app/getting-started/server-and-client-components] |
| Persistir ownership, prioridade, status e timeline | Database / Storage | API / Backend | Esses campos sao a verdade operacional da tarefa e devem sobreviver a refresh e reordenacao [ASSUMED] [CITED: https://orm.drizzle.team/docs/indexes-constraints] |
| Exibir ligacao com item original | API / Backend | Database / Storage | A referencia ao inbox precisa vir do dado persistido, nao de estado local efemero [VERIFIED: local repo] [CITED: https://orm.drizzle.team/docs/relations] |
| Resumos de gargalo de execucao | Frontend Server | Database / Storage | Blocos-resumo devem derivar de tarefas reais, nos mesmos moldes do radar operacional da Fase 1 [VERIFIED: local repo] |

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| `next` | `15.5.2` no repo; `16.2.4` no npm [VERIFIED: local repo] [VERIFIED: npm registry] | Continuar App Router, pages SSR e route handlers | A fase ja depende do App Router e das rotas em `src/app/api/*`; absorver upgrade de framework aqui adicionaria risco sem atender `TASK-*` [VERIFIED: local repo] [CITED: https://nextjs.org/docs/app] |
| `react` / `react-dom` | `19.1.1` no repo; `19.2.5` no npm [VERIFIED: local repo] [VERIFIED: npm registry] | Interacoes do workspace de execucao | O shell atual ja usa `useState`, `useEffect` e `useTransition`; a fase deve reaproveitar esse modelo [VERIFIED: local repo] [CITED: https://react.dev/reference/react/useTransition] |
| `zod` | `4.3.6` no repo [VERIFIED: local repo] | Validar conversao de inbox -> tarefa e updates de task | O projeto ja usa schemas Zod em `src/lib/validation/inbox.ts`; repetir o padrao evita validacao espalhada [VERIFIED: local repo] [CITED: https://zod.dev/basics] |
| `@tanstack/react-table` | `8.21.3` no repo [VERIFIED: local repo] [CITED: https://tanstack.com/table/latest/docs/guide/sorting] | Tabela/lista densa de tarefas | A Fase 1 ja usa a biblioteca na inbox table; reuso reduz custo e mantem comportamento consistente [VERIFIED: local repo] |
| `drizzle-orm` / `drizzle-kit` | `0.45.2` / `0.31.10` no repo [VERIFIED: local repo] | Manter schema canonico e preparar relacao inbox -> task | Mesmo com runtime file-backed hoje, o repo ja trata `src/db/schema` como contrato canonico [VERIFIED: local repo] [CITED: https://orm.drizzle.team/docs/indexes-constraints] [CITED: https://orm.drizzle.team/docs/relations] |
| `vitest` | `3.2.4` no repo; `4.1.4` no npm [VERIFIED: local repo] [VERIFIED: npm registry] | Cobrir dominio, API e UI da fase | A infraestrutura de testes ja existe e cobre o shell atual; a Fase 2 deve se apoiar nela, nao trocar de framework [VERIFIED: local repo] |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `lucide-react` | `1.8.0` no repo [VERIFIED: local repo] | Indicadores de ownership, status e navegacao `Inbox`/`Tarefas` | Usar para reforcos visuais compactos, sem introduzir nova biblioteca de componentes [VERIFIED: local repo] |
| `recharts` | `3.8.1` no repo [VERIFIED: local repo] | Blocos-resumo de backlog de execucao, se a fase precisar mini-graficos | Usar apenas se a leitura operacional pedir grafico; contadores densos tambem atendem o UI-SPEC [VERIFIED: local repo] |
| `openai` | `6.34.0` no repo e no npm [VERIFIED: local repo] [VERIFIED: npm registry] | Sem papel central na fase; apenas preservar compatibilidade com o contexto herdado da triagem | Nao planejar nova dependencia de IA para tarefas nesta fase [VERIFIED: local repo] |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Entidade `task` separada [ASSUMED] | Acrescentar campos de execucao diretamente em `inbox_items` | Barateia o primeiro insert, mas mistura backlog de entrada com backlog de execucao e enfraquece `TASK-04` [VERIFIED: local repo] |
| Persistencia file-backed estendida nesta fase [ASSUMED] | Migrar runtime inteiro para Drizzle/Postgres agora | Ganha alinhamento com o schema, mas adiciona migracao de infraestrutura fora do objetivo central da fase [VERIFIED: local repo] |
| Route Handlers seguindo o padrao atual [VERIFIED: local repo] | Introduzir Server Actions como novo padrao dominante | Server Actions sao viaveis, mas a base atual ja esta estruturada em fetch + `/api/*`; trocar o mecanismo no meio da fase aumenta variacao sem ganho funcional obrigatorio [VERIFIED: local repo] [CITED: https://nextjs.org/docs/app/guides/forms] |

**Installation:**
```bash
npm install
```

**Version verification:** para esta fase, o planejamento deve preservar as versoes ja instaladas no repositório e tratar upgrades de framework como trabalho separado [VERIFIED: local repo]. O npm foi consultado para `next`, `react`, `openai` e `vitest`; ha drift em `next`, `react` e `vitest`, mas isso nao precisa entrar na Fase 2 [VERIFIED: npm registry].

## Architecture Patterns

### System Architecture Diagram

```text
Inbox SSR atual
  |
  | itens triados / revisados
  v
Faixa "Itens prontos para conversao"
  |
  | CTA Converter em tarefa
  v
Route Handler de conversao
  |
  +--> valida origem + payload (Zod)
  +--> grava task com originInboxItemId
  +--> grava metadado de conversao/historico minimo
  +--> atualiza leitura do backlog de execucao
              |
              v
     Queries de tarefas
      |            \
      | lista       \ detalhe
      v              v
Workspace de tarefas (SSR + client state)
  |
  +--> filtros/sort/selecionar tarefa
  +--> update de owner
  +--> update de status
  +--> blocos-resumo de gargalos
```

### Recommended Project Structure
```text
src/
├── app/
│   ├── (workspace)/
│   │   ├── inbox/page.tsx                 # manter shell de entrada
│   │   └── tasks/page.tsx                 # novo backlog de execucao
│   └── api/
│       ├── inbox/[id]/convert/route.ts    # conversao inbox -> tarefa
│       ├── tasks/route.ts                 # list/create se necessario
│       └── tasks/[id]/
│           ├── route.ts                   # detalhe
│           └── status/route.ts            # update de progresso
├── components/
│   ├── inbox/                             # faixa de conversao e navegacao
│   ├── tasks/                             # lista, filtros, detalhe, formularios
│   └── dashboard/                         # blocos-resumo de execucao
├── db/
│   ├── queries/tasks.ts                   # store file-backed + mapeadores
│   └── schema/tasks.ts                    # contrato canonico futuro
├── lib/
│   └── validation/tasks.ts                # payloads de conversao/update
└── types/
    └── tasks.ts                           # contratos compartilhados
```

### Pattern 1: Task as First-Class Entity
**What:** criar um tipo `TaskListItem` / `TaskDetail` separado do `InboxDetail`, com `originInboxItemId` obrigatorio [ASSUMED].
**When to use:** em toda leitura e mutacao do backlog de execucao [ASSUMED].
**Example:**
```typescript
// Source: https://orm.drizzle.team/docs/indexes-constraints
export const tasks = pgTable("tasks", {
  id: serial("id").primaryKey(),
  originInboxItemId: integer("origin_inbox_item_id").notNull().references(() => inboxItems.id),
  title: text("title").notNull(),
  ownerName: text("owner_name"),
  priority: text("priority").notNull(),
  status: text("status").notNull(),
  lastMovementAt: timestamp("last_movement_at", { withTimezone: true }).notNull()
});
```

### Pattern 2: Conversion Route Separate from Review Route
**What:** a conversao deve ser uma mutacao dedicada, separada da rota atual de revisao de triagem [VERIFIED: local repo].
**When to use:** sempre que um item revisado for promovido a trabalho operacional [VERIFIED: local repo].
**Example:**
```typescript
// Source: https://nextjs.org/docs/app/getting-started/route-handlers-and-middleware
export async function POST(request: Request) {
  const payload = await request.json();
  return Response.json({ ok: true });
}
```

### Pattern 3: Server-First Read, Client-Only Interaction
**What:** manter `page.tsx` como Server Component buscando lista/detalhe inicial e deixar filtros, selecao e updates no cliente [VERIFIED: local repo].
**When to use:** na nova rota `/tasks` e em qualquer resumo de execucao inserido no inbox [VERIFIED: local repo] [CITED: https://nextjs.org/docs/app/getting-started/server-and-client-components].
**Example:**
```typescript
// Source: https://nextjs.org/docs/app/getting-started/server-and-client-components
export default async function TasksPage() {
  const tasks = await getTasks();
  return <TasksWorkspace initialTasks={tasks} />;
}
```

### Pattern 4: Non-Blocking Updates for Status/Ownership
**What:** usar `useTransition` para updates que refrescam lista + detalhe sem congelar a mesa de execucao [CITED: https://react.dev/reference/react/useTransition].
**When to use:** ao atribuir responsavel, alterar status ou concluir conversao [CITED: https://react.dev/reference/react/useTransition].
**Example:**
```typescript
// Source: https://react.dev/reference/react/useTransition
const [isPending, startTransition] = useTransition();

function handleStatusChange(nextStatus: string) {
  startTransition(async () => {
    await updateTaskStatus(nextStatus);
  });
}
```

### Anti-Patterns to Avoid
- **Task como flag do inbox:** nao resolver a fase com `convertedToTask: true` e campos soltos no item de inbox; isso nao cria backlog de execucao real [ASSUMED].
- **Conversao sem persistir origem:** nao copiar apenas titulo/resumo e perder `originInboxItemId`; `TASK-01` e `TASK-04` dependem da ligacao persistida [VERIFIED: local repo].
- **Misturar triagem com execucao na mesma rota:** a revisao atual ajusta categoria/proxima acao do inbox; conversao e ownership sao outra responsabilidade [VERIFIED: local repo].
- **Introduzir upgrade de framework no mesmo plano:** `next`, `react` e `vitest` ja tem drift com o npm, mas isso deve virar trabalho separado para nao contaminar o escopo funcional [VERIFIED: local repo] [VERIFIED: npm registry].

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Validacao de conversao e updates | `if/else` espalhado em route handlers e componentes | `zod` schemas por payload [VERIFIED: local repo] [CITED: https://zod.dev/basics] | Garante enums, campos obrigatorios e mensagens coerentes numa unica fronteira |
| Ordenacao/filtros da lista de tarefas | tabela artesanal nova para tarefas | `@tanstack/react-table` reutilizando o padrao da inbox [VERIFIED: local repo] [CITED: https://tanstack.com/table/latest/docs/guide/sorting] | Evita duplicar comportamento de sort/filter/selection |
| Ligacao origem -> tarefa | string livre “origem” copiada no detalhe | FK logica `originInboxItemId` + card de origem persistido [ASSUMED] [CITED: https://orm.drizzle.team/docs/relations] | Copia textual perde navegabilidade e confianca historica |
| Historico de mudancas | deduzir “historico” comparando estado atual com o item de inbox | evento minimo de conversao + timestamps de movimento na task [ASSUMED] | Planejamento e verificacao ficam objetivos sem precisar reconstruir passado de forma heuristica |

**Key insight:** a Fase 2 nao pede gerenciamento de projetos generico; ela pede **rastreabilidade operacional** [VERIFIED: local repo]. O planner deve priorizar link, ownership e progresso antes de qualquer elaboracao visual ou analitica [VERIFIED: local repo].

## Common Pitfalls

### Pitfall 1: Fazer a Fase 2 sem nova entidade de dominio
**What goes wrong:** o backlog de execucao vira apenas uma visao filtrada do inbox [ASSUMED].
**Why it happens:** parece mais rapido reaproveitar `status` e `priorityReviewed` do inbox [VERIFIED: local repo].
**How to avoid:** introduzir `tasks` com id proprio, owner, status e referencia obrigatoria ao inbox [ASSUMED].
**Warning signs:** a UI fala em “tarefa”, mas o dado salvo continua sendo apenas `InboxDetail` [VERIFIED: local repo].

### Pitfall 2: Ownership sem modelo claro
**What goes wrong:** o requisito `TASK-02` fica parcialmente entregue porque o responsavel existe so na tela e nao no dado persistido [ASSUMED].
**Why it happens:** o projeto ainda nao tem modulo de usuarios/autenticacao [VERIFIED: local repo].
**How to avoid:** usar `ownerName: string | null` como baseline desta fase e destacar `Sem responsavel` como estado operacional [ASSUMED].
**Warning signs:** a lista marca “atribuido”, mas um refresh perde o owner [ASSUMED].

### Pitfall 3: Conversao sem regra de idempotencia
**What goes wrong:** o mesmo item gera tarefas duplicadas por clique repetido ou refresh [ASSUMED].
**Why it happens:** o CTA de conversao aparece no inbox e o planner esquece trava de dominio [VERIFIED: local repo].
**How to avoid:** decidir explicitamente se a fase suporta uma tarefa ativa por inbox item e validar isso no backend [ASSUMED].
**Warning signs:** a faixa “Itens prontos para conversao” continua mostrando item ja convertido [VERIFIED: local repo].

### Pitfall 4: UI de tarefas parecer outro produto
**What goes wrong:** a rota nova quebra a continuidade visual e semantica da Fase 1 [VERIFIED: local repo].
**Why it happens:** a equipe tenta “subir de nivel” para board/PM tool em vez de continuar a superficie operacional [VERIFIED: local repo].
**How to avoid:** manter sidebar compacta, layout list-detail, copy operacional e faixa de conversao conforme `02-UI-SPEC.md` [VERIFIED: local repo].
**Warning signs:** kanban vira estrutura dominante ou o link com o item de origem some do detalhe [VERIFIED: local repo].

## Code Examples

Verified patterns from official sources:

### Route Handler para mutacao
```typescript
// Source: https://nextjs.org/docs/app/getting-started/route-handlers-and-middleware
export async function POST(request: Request) {
  const body = await request.json();
  return Response.json({ body });
}
```

### Relacao com foreign key
```typescript
// Source: https://orm.drizzle.team/docs/indexes-constraints
export const tasks = pgTable("tasks", {
  id: serial("id").primaryKey(),
  originInboxItemId: integer("origin_inbox_item_id").notNull().references(() => inboxItems.id)
});
```

### Transition para update nao bloqueante
```typescript
// Source: https://react.dev/reference/react/useTransition
const [isPending, startTransition] = useTransition();

startTransition(async () => {
  await saveTaskChange();
});
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Atualizar tudo pelo cliente e deixar a pagina montar estado inicial so no browser | Ler dados iniciais em Server Components e delegar apenas interacao ao cliente [CITED: https://nextjs.org/docs/app/getting-started/server-and-client-components] | docs atuais atualizadas em 2026-03-16 | O novo workspace de tarefas deve nascer server-first como o inbox atual |
| API Routes no `pages/` | Route Handlers no `app/` [CITED: https://nextjs.org/docs/app/getting-started/route-handlers-and-middleware] | guidance atual do App Router | O planner deve continuar usando `src/app/api/*` |
| Upgrades de stack misturados ao trabalho funcional | Congelar versoes instaladas e separar upgrade em fase propria [VERIFIED: local repo] [VERIFIED: npm registry] | necessario porque `next`, `react` e `vitest` ja divergiram do npm | Evita que TASK-01..04 virem refactor de plataforma |

**Deprecated/outdated:**
- Introduzir `pages/api` para a nova fase: o repositório ja esta em App Router com route handlers [VERIFIED: local repo] [CITED: https://nextjs.org/docs/app]
- Replanejar a tela como kanban dominante: o UI-SPEC aprovado fixou lista densa/tela operacional como estrutura principal [VERIFIED: local repo]

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | A Fase 2 deve introduzir uma entidade `task` separada, e nao apenas ampliar `inbox_items` | Summary / Patterns | Se o usuario quiser modelo unificado, o plano de schema e APIs muda bastante |
| A2 | A Fase 2 deve manter persistencia runtime file-backed e adiar migracao real para Postgres | Summary / Alternatives | Se houver expectativa de ativar Drizzle/Postgres agora, o planner subestimaria infraestrutura e migracao |
| A3 | O baseline de ownership deve ser `ownerName` texto livre, sem modulo de usuarios | Common Pitfalls | Se houver auth/usuarios fora dos arquivos lidos, o modelo de task muda |
| A4 | O fluxo deve impor uma tarefa ativa por item de inbox nesta fase | Common Pitfalls | Se um item precisar gerar varias tarefas logo agora, a conversao precisa outro desenho |

**If this table is empty:** not applicable.

## Open Questions (RESOLVED)

1. **A Fase 2 vai ativar persistencia relacional real ou manter o adapter file-backed?**
   - RESOLVED: manter o adapter file-backed nesta fase.
   - What we know: o runtime atual grava em `.data/inbox-items.json`, enquanto `src/db/schema/inbox.ts` ja existe como contrato relacional [VERIFIED: local repo]
   - What's unclear: se a fase tem budget para migrar store, fixtures, APIs e testes no mesmo pacote [ASSUMED]
   - Recommendation: planejar a fase assumindo continuidade file-backed e deixar migracao de runtime como trabalho explicito posterior, salvo instrucao contraria do usuario [ASSUMED]

2. **Uma entrada pode gerar mais de uma tarefa em v1?**
   - RESOLVED: impor uma tarefa ativa por item de inbox em v1.
   - What we know: o UI-SPEC fala em CTA singular `Converter em tarefa` e em item “ainda nao gerou trabalho operacional” [VERIFIED: local repo]
   - What's unclear: se isso e apenas copy ou uma regra de negocio real [ASSUMED]
   - Recommendation: travar uma tarefa ativa por item nesta fase para simplificar idempotencia, historico e verificacao [ASSUMED]

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node.js | Next.js app e scripts | ✓ [VERIFIED: local repo] | `v24.6.0` [VERIFIED: local repo] | — |
| npm | install, lint, build, test | ✓ [VERIFIED: local repo] | `11.5.1` [VERIFIED: local repo] | — |
| Vitest | suite atual de testes | ✓ [VERIFIED: local repo] | `3.2.4` no repo [VERIFIED: local repo] | — |

**Missing dependencies with no fallback:**
- Nenhum bloqueador tecnico novo foi identificado para planejar a fase [VERIFIED: local repo]

**Missing dependencies with fallback:**
- Nenhum; a fase pode ser planejada sobre o stack ja instalado [VERIFIED: local repo]

## Security Domain

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V2 Authentication | no [VERIFIED: local repo] | Nao ha auth na fase atual; ownership nao pode presumir usuario autenticado [VERIFIED: local repo] |
| V3 Session Management | no [VERIFIED: local repo] | Fora do escopo desta fase [VERIFIED: local repo] |
| V4 Access Control | no por enquanto [VERIFIED: local repo] | Sem auth, a fase deve ao menos manter mutacoes no servidor e nao aceitar estados arbitrarios sem validacao [VERIFIED: local repo] [CITED: https://nextjs.org/docs/app/getting-started/route-handlers-and-middleware] |
| V5 Input Validation | yes [VERIFIED: local repo] | `zod` para conversao, updates de owner/status e ids de rota [VERIFIED: local repo] [CITED: https://zod.dev/basics] |
| V6 Cryptography | no [VERIFIED: local repo] | Nao ha requisito criptografico novo nesta fase [VERIFIED: local repo] |

### Known Threat Patterns for this stack

| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| Alteracao invalida de status/priority por payload manual | Tampering | validar enums e transicoes aceitas no servidor antes de persistir [ASSUMED] [CITED: https://zod.dev/basics] |
| Quebra de rastreabilidade apagando origem da tarefa | Tampering | `originInboxItemId` obrigatorio e leitura do card de origem via dado persistido [ASSUMED] [CITED: https://orm.drizzle.team/docs/indexes-constraints] |
| Duplicacao de tarefa por clique repetido | Denial of Service / Tampering | idempotencia de conversao e bloqueio backend para item ja convertido [ASSUMED] |
| Exposicao de logica critica apenas no cliente | Tampering | manter conversao e updates em route handlers server-side [VERIFIED: local repo] [CITED: https://nextjs.org/docs/app/getting-started/route-handlers-and-middleware] |

## Sources

### Primary (HIGH confidence)
- Local repo files:
  `src/types/inbox.ts`, `src/db/schema/inbox.ts`, `src/db/queries/inbox.ts`, `src/app/(workspace)/inbox/page.tsx`, `src/app/api/inbox/route.ts`, `src/app/api/inbox/[id]/route.ts`, `src/app/api/inbox/[id]/review/route.ts`, `src/components/inbox/workspace-shell.tsx`, `src/components/detail/item-detail-panel.tsx`, `src/components/detail/triage-review-card.tsx`, `.planning/phases/02-execucao-de-trabalho/02-UI-SPEC.md`, `.planning/ROADMAP.md`, `.planning/REQUIREMENTS.md`, `.planning/STATE.md` [VERIFIED: local repo]
- https://nextjs.org/docs/app [CITED: official docs]
- https://nextjs.org/docs/app/getting-started/server-and-client-components [CITED: official docs]
- https://nextjs.org/docs/app/getting-started/route-handlers-and-middleware [CITED: official docs]
- https://nextjs.org/docs/app/guides/forms [CITED: official docs]
- https://react.dev/reference/react/useTransition [CITED: official docs]
- https://react.dev/reference/react/useOptimistic [CITED: official docs]
- https://orm.drizzle.team/docs/indexes-constraints [CITED: official docs]
- https://orm.drizzle.team/docs/relations [CITED: official docs]
- https://zod.dev/basics [CITED: official docs]
- https://tanstack.com/table/latest/docs/guide/sorting [CITED: official docs]

### Secondary (MEDIUM confidence)
- npm registry via `npm view next version` -> `16.2.4` [VERIFIED: npm registry]
- npm registry via `npm view react version` -> `19.2.5` [VERIFIED: npm registry]
- npm registry via `npm view openai version` -> `6.34.0` [VERIFIED: npm registry]
- npm registry via `npm view vitest version` -> `4.1.4` [VERIFIED: npm registry]

### Tertiary (LOW confidence)
- Nenhuma fonte terciaria usada; itens `[ASSUMED]` estao listados no Assumptions Log

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - a recomendacao principal preserva o stack instalado e usa docs oficiais para o padrao arquitetural
- Architecture: HIGH - o desenho proposto segue diretamente o shell, as rotas e o UI-SPEC aprovados
- Pitfalls: MEDIUM - os riscos principais sao fortemente apoiados pelo repo, mas algumas regras de dominio ainda dependem de confirmacao

**Research date:** 2026-04-18
**Valid until:** 2026-05-18
