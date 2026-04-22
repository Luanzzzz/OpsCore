# Phase 1: Base Operacional - Research

**Researched:** 2026-04-17
**Domain:** inbox operacional web-first com triagem assistida por IA e dashboard de prioridades
**Confidence:** HIGH

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
### Formato do Inbox
- **D-01:** O inbox deve usar **lista densa com painel de detalhe**, nao cards independentes como padrao principal.
  **Por que:** triagem operacional exige leitura rapida, comparacao entre itens, ordenacao e filtro eficientes. Lista densa favorece volume e scanning; o painel de detalhe preserva contexto sem sacrificar velocidade.
- **D-02:** Cada linha da fila deve exibir no minimo `titulo`, `origem`, `resumo curto`, `prioridade`, `status`, `aguardando resposta` e `ultima atividade`.
  **Por que:** esses campos sao suficientes para decidir o proximo passo sem abrir tudo, sustentando o criterio de "contexto suficiente para triagem" da fase.
- **D-03:** A origem nesta fase deve ser tratada como um atributo operacional do item, mesmo sem integracoes reais.
  **Por que:** o modelo precisa nascer preparado para multiplos canais futuros sem depender deles agora.

### Priorizacao e Estados
- **D-04:** Os estados iniciais da fila devem ser `Nova`, `Em analise`, `Aguardando resposta` e `Concluida/Arquivada`.
  **Por que:** estados demais geram ambiguidade cedo; esse conjunto separa claramente o que ainda nao foi tocado, o que exige acao interna, o que depende do outro lado e o que saiu do fluxo ativo.
- **D-05:** A prioridade deve usar quatro niveis: `Baixa`, `Media`, `Alta` e `Critica`, com `Media` como padrao.
  **Por que:** quatro niveis oferecem contraste suficiente para triagem sem virar taxonomia excessiva. O default em `Media` evita vazios operacionais e facilita ordenacao consistente.
- **D-06:** A ordenacao principal da fila deve privilegiar `prioridade` e depois `tempo de espera/ultima atividade`.
  **Por que:** isso aproxima a fila de um instrumento operacional real, equilibrando importancia e envelhecimento do item.

### Triagem com IA
- **D-07:** A IA deve atuar como **camada de sugestao editavel**, nao como decisor autonomo.
  **Por que:** na Fase 1 o objetivo e acelerar triagem com confianca, mantendo humano no loop para revisar categoria, urgencia, proxima acao e resumo.
- **D-08:** Cada item deve exibir sugestoes de `categoria`, `urgencia`, `proxima acao` e `resumo contextual`, com possibilidade de aceitar, ajustar ou ignorar.
  **Por que:** esse conjunto cobre os requisitos da fase e produz estrutura suficiente para priorizacao e dashboard sem acoplar automacao pesada.
- **D-09:** Sempre que possivel, a UI deve mostrar uma justificativa curta da sugestao de IA, nao apenas o rotulo final.
  **Por que:** explicacao curta aumenta confianca, acelera revisao humana e cria base melhor para calibracao futura do modelo.

### Dashboard Inicial
- **D-10:** O dashboard da Fase 1 deve ser pequeno, operacional e orientado a acao, nao um painel analitico amplo.
  **Por que:** o valor imediato da fase e apontar gargalos atuais, nao produzir BI sofisticado.
- **D-11:** Os blocos prioritarios do dashboard devem ser `entradas por status`, `itens Alta/Critica`, `itens aguardando resposta`, `itens sem triagem revisada` e `itens mais antigos/tempo medio sem resposta`.
  **Por que:** esses indicadores respondem diretamente "o que esta travando agora?" e "o que precisa de atencao primeiro?".

### Experiencia de Operacao
- **D-12:** A experiencia principal deve ser **inbox-first**, com densidade suficiente para triagem rapida e detalhe calmo para entendimento do caso.
  **Por que:** a fase precisa provar que o OpsCore melhora a tomada de decisao operacional antes de expandir para execucao, agenda e integracoes.

### Claude's Discretion
- Definir o layout exato do painel de detalhe, desde que preserve leitura rapida e nao esconda os sinais operacionais principais.
- Escolher a melhor representacao visual do dashboard inicial, desde que mantenha poucos blocos e foco em acao imediata.

### Deferred Ideas (OUT OF SCOPE)
- Automacao ou decisao autonoma de IA alem de sugestoes assistidas
- Integracoes reais com WhatsApp, Instagram, email ou outros canais
- Conversao completa para tarefas e ownership operacional profundo
- Agenda operacional e follow-ups vinculados ao fluxo
- Panorama analitico amplo e inteligencia operacional mais forte
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| INBX-01 | Usuario pode registrar e visualizar entradas operacionais em uma fila unica | Modelo `inbox_item`, layout list-detail, schema relacional e mutacoes HTTP/Server Functions [VERIFIED: local repo] [CITED: https://nextjs.org/docs/app/getting-started/mutating-data] |
| INBX-02 | Usuario pode ver origem, contexto basico e status de cada entrada | Campos minimos da linha e painel de detalhe com metadados persistidos [VERIFIED: local repo] |
| INBX-03 | Usuario pode ordenar ou filtrar a fila por prioridade e estado operacional | `@tanstack/react-table` para sorting/filtering controlados [VERIFIED: npm registry] [CITED: https://tanstack.com/table/latest/docs/guide/sorting] |
| TRIA-01 | Usuario pode obter sugestao de categoria para cada entrada | Structured Outputs com schema fixo para `categoria` [CITED: https://platform.openai.com/docs/guides/structured-outputs?lang=javascript] |
| TRIA-02 | Usuario pode obter sugestao de urgencia ou prioridade para cada entrada | Enum de urgencia no schema da IA e persistencia separada entre sugestao e valor revisado [CITED: https://platform.openai.com/docs/guides/structured-outputs?lang=javascript] [VERIFIED: local repo] |
| TRIA-03 | Usuario pode obter sugestao de proxima acao para cada entrada | Campo dedicado `next_action_suggested` com justificativa curta e revisao humana [VERIFIED: local repo] [CITED: https://platform.openai.com/docs/guides/structured-outputs?lang=javascript] |
| TRIA-04 | Usuario pode visualizar um resumo contextual gerado para cada entrada | Campo `summary_contextual` gerado no pipeline de triagem [VERIFIED: local repo] [CITED: https://platform.openai.com/docs/guides/text?api-mode=responses%5C] |
| DASH-01 | Usuario pode visualizar gargalos e pendencias operacionais em um dashboard | Aggregates SQL em cima dos estados reais do inbox + widgets pequenos [VERIFIED: local repo] [CITED: https://recharts.github.io/en-US/examples/SimpleBarChart/] |
| DASH-02 | Usuario pode identificar itens urgentes e aguardando resposta | Queries agregadas e listas de excecao alimentadas por prioridade/status/idade [VERIFIED: local repo] [CITED: https://www.postgresql.org/docs/current/ddl-generated-columns.html] |
</phase_requirements>

## Summary

A Fase 1 deve ser planejada como um **web app full-stack unico** com renderizacao inicial no servidor, interacoes densas no cliente apenas onde necessario e persistencia relacional desde o primeiro corte [ASSUMED]. Essa direcao respeita o estado atual do repositorio como workspace documental, reduz o custo de bootstrap e preserva a narrativa de portfolio de um produto coeso em vez de um prototipo fragmentado [VERIFIED: local repo].

O stack mais defensavel para esta fase e `Next.js App Router + React + Tailwind CSS + PostgreSQL + Drizzle + OpenAI SDK + TanStack Table` [CITED: https://nextjs.org/docs/app/getting-started/installation] [CITED: https://nextjs.org/docs/app/getting-started/server-and-client-components] [CITED: https://tailwindcss.com/docs] [CITED: https://orm.drizzle.team/docs/sql-schema-declaration] [CITED: https://platform.openai.com/docs/libraries/javascript] [CITED: https://tanstack.com/table/docs/]. Ele cobre bem os tres trabalhos centrais da fase: modelar a fila unica, rodar triagem estruturada com humano no loop e expor leitura operacional confiavel sem introduzir distribuicao desnecessaria.

O principal risco de planejamento nao e tecnico; e **arquitetural**. Se o planner misturar sugestao da IA com verdade operacional, ou construir dashboard a partir de placeholders em vez de dados persistidos, a fase perde valor e compromete as fases seguintes [VERIFIED: local repo]. O plano deve separar explicitamente: entrada bruta, sugestao de triagem, revisao humana e metricas derivadas.

**Primary recommendation:** planejar a Fase 1 como um monolito modular em `Next.js` com `PostgreSQL`, persistindo inbox, triagem sugerida e revisao humana no mesmo modelo fonte-de-verdade [ASSUMED].

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Renderizacao inicial da inbox e dashboard | Frontend Server | Browser / Client | Server Components reduzem JS enviado ao cliente e conseguem buscar dados perto da fonte [CITED: https://nextjs.org/docs/app/getting-started/server-and-client-components] |
| Sorting, filtros locais, selecao de linha e painel de detalhe | Browser / Client | Frontend Server | Interacao de tabela e selecao exigem estado local e handlers [CITED: https://nextjs.org/docs/app/getting-started/server-and-client-components] [CITED: https://tanstack.com/table/latest/docs/framework/react/react-table] |
| Registro de entrada e revisao humana da triagem | API / Backend | Database / Storage | Mutacoes devem validar payload, gravar no banco e controlar transicoes de estado [CITED: https://nextjs.org/docs/app/getting-started/mutating-data] [CITED: https://zod.dev/basics?curius=1296&id=handling-errors] |
| Geracao de sugestoes por IA | API / Backend | Frontend Server | Chaves e chamadas ao provedor devem ficar no servidor; a UI apenas aciona e exibe resultado [CITED: https://nextjs.org/docs/app/getting-started/server-and-client-components] [CITED: https://platform.openai.com/docs/libraries/javascript] |
| Persistencia de entradas, sugestoes, revisoes e agregados | Database / Storage | API / Backend | A fila unica e o dashboard dependem de estados reais e queries consistentes [CITED: https://orm.drizzle.team/docs/sql-schema-declaration] [CITED: https://www.postgresql.org/docs/current/ddl-generated-columns.html] |
| Dashboard operacional | Frontend Server | Browser / Client | Agregados devem ser calculados no servidor e renderizados como widgets pequenos; somente hover/tooltip ficam no cliente [VERIFIED: local repo] [CITED: https://recharts.github.io/en-US/api/Bar/] |

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| `next` | `15.5.2` [VERIFIED: npm registry] | Shell full-stack web-first com App Router | `create-next-app` entrega TypeScript, ESLint, Tailwind, App Router e Turbopack por padrao; a doc recomenda App Router para projetos novos [CITED: https://nextjs.org/docs/app/getting-started/installation] |
| `react` / `react-dom` | `19.1.1` [VERIFIED: npm registry] | UI interativa para inbox densa e detalhe | React 19 sustenta os hooks de concorrencia e o modelo usado pelo App Router [VERIFIED: npm registry] [CITED: https://react.dev/reference/react/useDeferredValue] |
| `tailwindcss` | `4.1.12` [VERIFIED: npm registry] | Implementar rapidamente o contrato visual manual da fase | Tailwind 4 permanece zero-runtime e acelera a construcao de um design system manual sem travar em biblioteca de componentes [VERIFIED: npm registry] [CITED: https://tailwindcss.com/docs] |
| `drizzle-orm` | `0.44.5` [VERIFIED: npm registry] | ORM tipado para schema e queries SQL | A documentacao trata o schema TypeScript como source of truth e integra diretamente com migracoes [CITED: https://orm.drizzle.team/docs/sql-schema-declaration] |
| `drizzle-kit` | `0.31.4` [VERIFIED: npm registry] | Geracao/aplicacao de migracoes SQL | A doc oficial posiciona `drizzle-kit` como CLI de migracao para abordagem code-first [CITED: https://orm.drizzle.team/docs/migrations] |
| `postgres` | `3.4.7` [VERIFIED: npm registry] | Driver PostgreSQL para runtime Node | Usa tagged templates e mostra queries parametrizadas sem concatenacao insegura [VERIFIED: npm registry] [CITED: https://github.com/porsager/postgres] |
| `zod` | `4.1.5` [VERIFIED: npm registry] | Validacao de payloads HTTP e fronteira IA -> dominio | Zod 4 esta estavel e fornece `parse` / `safeParse` com inferencia de tipos [VERIFIED: npm registry] [CITED: https://zod.dev/] [CITED: https://zod.dev/basics?curius=1296&id=handling-errors] |
| `openai` | `5.12.2` [VERIFIED: npm registry] | Chamada ao provedor de IA para triagem estruturada | A documentacao oficial recomenda o SDK JS e o uso da Responses API em projetos novos [VERIFIED: npm registry] [CITED: https://platform.openai.com/docs/libraries/javascript] [CITED: https://platform.openai.com/docs/guides/migrate-to-responses] |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `@tanstack/react-table` | `8.21.3` [VERIFIED: npm registry] | Sorting, filtering e composicao da lista densa | Usar para a grade principal do inbox; evita hand-roll de sorting/filtering/column state [VERIFIED: npm registry] [CITED: https://tanstack.com/table/docs/] |
| `lucide-react` | `0.542.0` [VERIFIED: npm registry] | Iconografia linear coerente com o UI spec | Usar para sinais compactos de status, filtros e navegacao [VERIFIED: npm registry] [CITED: https://lucide.dev/] |
| `recharts` | `3.1.2` [VERIFIED: npm registry] | Graficos pequenos do dashboard-resumo | Usar apenas para 4-5 blocos operacionais; a biblioteca ja cobre barras simples, stacks e responsividade [VERIFIED: npm registry] [CITED: https://recharts.github.io/en-US/examples/SimpleBarChart/] |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| `Next.js` monolito modular [ASSUMED] | `React SPA + FastAPI` [ASSUMED] | Python separa melhor a camada de IA, mas adiciona fronteiras, deploy e contrato HTTP antes da hora para a Fase 1 |
| `Drizzle` [CITED: https://orm.drizzle.team/docs/sql-schema-declaration] | `Prisma` [ASSUMED] | Prisma oferece DX madura, mas Drizzle deixa o SQL e as migracoes mais explicitos para um dominio operacional relacional |
| `TanStack Table` [CITED: https://tanstack.com/table/docs/] | tabela manual em HTML [ASSUMED] | Tabela manual parece barata no inicio, mas sorting, filtering, column state e acessibilidade viram custo acumulado rapido |

**Installation:**
```bash
npx create-next-app@latest opscore --ts --eslint --tailwind --app --src-dir --yes
npm install drizzle-orm drizzle-kit postgres zod openai @tanstack/react-table lucide-react recharts
```

**Version verification:** `Next.js` exige Node `20.9+` na documentacao atual [CITED: https://nextjs.org/docs/app/getting-started/installation]. O ambiente local tem `Node v24.6.0` e `npm 11.5.1` disponiveis [VERIFIED: local repo].

## Architecture Patterns

### System Architecture Diagram

```text
Operador
  |
  v
UI inbox-first (lista densa + detalhe + radar)
  |                     \
  | leitura inicial      \ interacoes locais
  v                       v
Server Components      Client Components
  |                       |
  | fetch/stream          | sorting, filtros, selecao, hover, feedback
  +-----------+-----------+
              |
              v
Mutacoes / endpoints de dominio
  |
  +--> validacao de entrada (Zod)
  |
  +--> persistencia de inbox/revisao (Drizzle + PostgreSQL)
  |
  +--> pipeline de triagem IA
           |
           v
      Responses API + Structured Outputs
           |
           v
      sugestoes persistidas
              |
              v
   queries agregadas do dashboard
              |
              v
    widgets de status, urgencia e envelhecimento
```

### Recommended Project Structure
```text
src/
├── app/
│   ├── (workspace)/
│   │   ├── inbox/page.tsx          # shell SSR da tela principal
│   │   └── api/
│   │       ├── inbox/route.ts      # criar/listar entradas
│   │       ├── triage/route.ts     # disparar/refazer triagem
│   │       └── dashboard/route.ts  # agregados operacionais
├── components/
│   ├── inbox/                      # tabela, row, filtros, badges
│   ├── detail/                     # painel de detalhe
│   └── dashboard/                  # widgets pequenos
├── db/
│   ├── schema/                     # tabelas e enums Drizzle
│   ├── queries/                    # queries de dominio
│   └── migrations/                 # SQL versionado
├── lib/
│   ├── triage/                     # prompt, schema Zod, mapeadores
│   ├── validation/                 # request schemas
│   └── time/                       # SLA age, clocks, helpers
└── types/
    └── inbox.ts                    # tipos do dominio e DTOs
```

### Pattern 1: Canonical Inbox Item
**What:** persistir um `inbox_item` canonico com estados operacionais, sugestoes de IA e revisao humana separados [VERIFIED: local repo].
**When to use:** desde o primeiro migration; e a unidade que alimenta fila, detalhe e dashboard [VERIFIED: local repo].
**Example:**
```typescript
// Source: https://orm.drizzle.team/docs/sql-schema-declaration
export const inboxItems = pgTable('inbox_items', {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  title: varchar('title', { length: 240 }).notNull(),
  source: varchar('source', { length: 64 }).notNull(),
  status: varchar('status', { length: 32 }).notNull().default('Nova'),
  priorityReviewed: varchar('priority_reviewed', { length: 16 }).notNull().default('Media'),
  waitingOnResponse: boolean('waiting_on_response').notNull().default(false),
  lastActivityAt: timestamp('last_activity_at', { withTimezone: true }).notNull(),
  aiCategory: varchar('ai_category', { length: 64 }),
  aiUrgency: varchar('ai_urgency', { length: 16 }),
  aiNextAction: text('ai_next_action'),
  aiSummary: text('ai_summary'),
  aiRationale: text('ai_rationale'),
  triageReviewedAt: timestamp('triage_reviewed_at', { withTimezone: true }),
})
```

### Pattern 2: Structured Triage Boundary
**What:** a chamada ao modelo deve retornar um objeto fechado com enums e campos nomeados; nunca texto livre parseado na mao [CITED: https://platform.openai.com/docs/guides/structured-outputs?lang=javascript].
**When to use:** em toda geracao ou regeneracao de triagem [CITED: https://platform.openai.com/docs/guides/structured-outputs?lang=javascript].
**Example:**
```typescript
// Source: https://platform.openai.com/docs/guides/structured-outputs?lang=javascript
const triageSchema = z.object({
  category: z.string(),
  urgency: z.enum(['Baixa', 'Media', 'Alta', 'Critica']),
  nextAction: z.string(),
  summary: z.string(),
  rationale: z.string(),
})
```

### Pattern 3: Server-First Read, Client-Only Interaction
**What:** ler fila e dashboard no servidor; mover para Client Component apenas tabela interativa, filtros, selecao e microfeedback [CITED: https://nextjs.org/docs/app/getting-started/server-and-client-components].
**When to use:** em toda rota principal da fase [CITED: https://nextjs.org/docs/app/getting-started/server-and-client-components].
**Example:**
```typescript
// Source: https://nextjs.org/docs/app/getting-started/server-and-client-components
export default async function InboxPage() {
  const [items, dashboard] = await Promise.all([getInboxItems(), getDashboardSummary()])
  return <InboxWorkspace initialItems={items} dashboard={dashboard} />
}
```

### Pattern 4: Controlled Table State
**What:** manter sorting/filtering state controlado e explicitamente mapeado para campos de negocio (`priorityReviewed`, `status`, `lastActivityAt`) [CITED: https://tanstack.com/table/latest/docs/guide/sorting].
**When to use:** lista principal do inbox [CITED: https://tanstack.com/table/latest/docs/guide/sorting].
**Example:**
```typescript
// Source: https://tanstack.com/table/latest/docs/guide/sorting
const table = useReactTable({
  data,
  columns,
  state: { sorting, columnFilters },
  onSortingChange: setSorting,
  onColumnFiltersChange: setColumnFilters,
  getCoreRowModel: getCoreRowModel(),
  getSortedRowModel: getSortedRowModel(),
  getFilteredRowModel: getFilteredRowModel(),
})
```

### Anti-Patterns to Avoid
- **Misturar sugestao com verdade operacional:** nao sobrescrever `priorityReviewed` com `aiUrgency`; mantenha `ai_*` e `reviewed_*` separados [VERIFIED: local repo].
- **Dashboard por placeholder:** nao planejar widgets antes de existirem queries persistidas; `DASH-01` e `DASH-02` dependem de estados reais [VERIFIED: local repo].
- **Tudo como Client Component:** a doc do Next separa claramente server e client; empurrar tudo para o browser piora bundle e duplica fetch [CITED: https://nextjs.org/docs/app/getting-started/server-and-client-components].
- **Parse de JSON na unha:** Structured Outputs remove esse custo; regex e `JSON.parse` em texto livre nao devem entrar no plano [CITED: https://platform.openai.com/docs/guides/structured-outputs?lang=javascript].

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Sorting/filtering/column state da fila | tabela manual com estado ad hoc | `@tanstack/react-table` [VERIFIED: npm registry] | A library ja cobre sorting, multi-sort, filtros e controle de estado [CITED: https://tanstack.com/table/latest/docs/guide/sorting] |
| Validacao de payloads e enums | `if/else` espalhado em handlers | `zod` [VERIFIED: npm registry] | `parse` e `safeParse` padronizam fronteiras e mantem inferencia de tipos [CITED: https://zod.dev/basics?curius=1296&id=handling-errors] |
| Parse da resposta do modelo | regex ou schema informal em prompt | Structured Outputs + schema fixo [CITED: https://platform.openai.com/docs/guides/structured-outputs?lang=javascript] | A doc recomenda Structured Outputs no lugar de JSON mode quando possivel |
| Migracoes | SQL manual sem trilha | `drizzle-kit` [VERIFIED: npm registry] | O CLI gera e aplica migracoes versionadas com diff do schema [CITED: https://orm.drizzle.team/docs/migrations] |
| Iconografia operacional | SVGs soltos por tela | `lucide-react` [VERIFIED: npm registry] | Mantem consistencia, tree-shaking e baixo atrito [CITED: https://lucide.dev/] |
| Widgets de grafico do dashboard | SVG/Canvas custom do zero | `recharts` [VERIFIED: npm registry] | Ja cobre barras simples e responsividade com baixo custo [CITED: https://recharts.github.io/en-US/examples/SimpleBarChart/] |

**Key insight:** nesta fase, o custo escondido nao esta em “fazer aparecer na tela”; esta em manter coerencia entre fila, triagem revisada e dashboard conforme o produto cresce [VERIFIED: local repo].

## Common Pitfalls

### Pitfall 1: IA virar fonte de verdade
**What goes wrong:** a sugestao do modelo passa a ser gravada no mesmo campo usado pela operacao [VERIFIED: local repo].
**Why it happens:** o time tenta acelerar o happy path e elimina a camada de revisao [VERIFIED: local repo].
**How to avoid:** separar colunas `ai_*` de colunas `*_reviewed` e exigir acao humana para “aceitar” [VERIFIED: local repo].
**Warning signs:** prioridade muda sem trilha de revisao; dashboard oscila quando o prompt muda [VERIFIED: local repo].

### Pitfall 2: Lista densa sem modelo de ordenacao consistente
**What goes wrong:** a UI exibe sort local, mas o backend nao compartilha a mesma ordem [VERIFIED: local repo].
**Why it happens:** sorting nasce no componente antes do modelo operacional fechar [VERIFIED: local repo].
**How to avoid:** tratar `priorityReviewed`, `status`, `waitingOnResponse` e `lastActivityAt` como colunas canonicas do dominio [VERIFIED: local repo].
**Warning signs:** o mesmo item “some” quando atualiza a pagina ou troca filtro [ASSUMED].

### Pitfall 3: Dashboard pesado cedo demais
**What goes wrong:** a fase tenta construir BI em vez de radar operacional [VERIFIED: local repo].
**Why it happens:** a presenca de um dashboard puxa o time para grafico antes de estabilizar o fluxo [VERIFIED: local repo].
**How to avoid:** limitar o dashboard a 4-5 widgets vinculados diretamente aos requisitos `DASH-01` e `DASH-02` [VERIFIED: local repo].
**Warning signs:** novos charts surgem sem pergunta operacional associada [VERIFIED: local repo].

### Pitfall 4: Client bundle inflado pela tabela inteira
**What goes wrong:** pagina principal fica lenta porque tudo virou Client Component [CITED: https://nextjs.org/docs/app/getting-started/server-and-client-components].
**Why it happens:** e facil marcar a tela inteira com `"use client"` para “resolver rapido” [CITED: https://nextjs.org/docs/app/getting-started/server-and-client-components].
**How to avoid:** server para fetch/render inicial; client apenas para a mesa de controle interativa [CITED: https://nextjs.org/docs/app/getting-started/server-and-client-components].
**Warning signs:** duplicacao de fetch, JS inicial alto e dificuldade de esconder segredos [CITED: https://nextjs.org/docs/app/getting-started/server-and-client-components].

## Code Examples

Verified patterns from official sources:

### Schema relacional da fila
```typescript
// Source: https://orm.drizzle.team/docs/sql-schema-declaration
export const inboxItems = pgTable('inbox_items', {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  title: varchar('title', { length: 240 }).notNull(),
  source: varchar('source', { length: 64 }).notNull(),
  status: varchar('status', { length: 32 }).notNull(),
})
```

### Chamada de triagem estruturada
```typescript
// Source: https://platform.openai.com/docs/libraries/javascript
import OpenAI from 'openai'

const client = new OpenAI()
```

```typescript
// Source: https://platform.openai.com/docs/guides/structured-outputs?lang=javascript
const triageFormat = {
  type: 'json_schema',
  name: 'ops_triage',
  strict: true,
  schema: {
    type: 'object',
    additionalProperties: false,
    required: ['category', 'urgency', 'nextAction', 'summary', 'rationale'],
    properties: {
      category: { type: 'string' },
      urgency: { type: 'string', enum: ['Baixa', 'Media', 'Alta', 'Critica'] },
      nextAction: { type: 'string' },
      summary: { type: 'string' },
      rationale: { type: 'string' },
    },
  },
}
```

### Tabela controlada para o inbox
```typescript
// Source: https://tanstack.com/table/latest/docs/guide/sorting
const [sorting, setSorting] = useState<SortingState>([
  { id: 'priorityReviewed', desc: true },
  { id: 'lastActivityAt', desc: false },
])
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `Chat Completions` como default [CITED: https://platform.openai.com/docs/guides/migrate-to-responses] | `Responses API` para projetos novos [CITED: https://platform.openai.com/docs/guides/migrate-to-responses] | recomendacao atual na doc verificada em 2026-04-17 | planejar a camada de IA ja em `responses.create()` |
| `JSON mode` para estruturar saida [CITED: https://platform.openai.com/docs/guides/structured-outputs?lang=javascript] | Structured Outputs com JSON Schema [CITED: https://platform.openai.com/docs/guides/structured-outputs?lang=javascript] | guidance atual da doc verificada em 2026-04-17 | reduz retries e parse quebrado na triagem |
| instalar Next manualmente sem defaults [CITED: https://nextjs.org/docs/app/getting-started/installation] | `create-next-app` com TypeScript, Tailwind, ESLint e App Router por padrao [CITED: https://nextjs.org/docs/app/getting-started/installation] | doc atualizada em 2026-03-16 | Wave 0 deve bootstrapar via CLI e nao via scaffold manual |
| campos derivados calculados so no front [ASSUMED] | gerados/agregados proximos ao banco e ao servidor [CITED: https://www.postgresql.org/docs/current/ddl-generated-columns.html] | reforcado pelo uso atual de generated columns e queries server-side | reduz divergencia entre lista e dashboard |

**Deprecated/outdated:**
- `JSON mode` como padrao para extracao estruturada: usar Structured Outputs quando possivel [CITED: https://platform.openai.com/docs/guides/structured-outputs?lang=javascript]
- `Pages Router` para app novo desta fase: o planejamento deve assumir `App Router` [CITED: https://nextjs.org/docs/app/getting-started/installation]

## Assumptions Log

> List all claims tagged `[ASSUMED]` in this research. The planner and discuss-phase use this
> section to identify decisions that need user confirmation before execution.

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | A Fase 1 deve ser implementada como um web app full-stack unico em vez de frontend/backend separados | Summary | Pode alterar a estrutura do roadmap tecnico e a granularidade das tasks |
| A2 | O planner deve tratar `Next.js` como recomendacao primaria, nao apenas uma opcao | Summary / Standard Stack | Se o usuario quiser backend Python separado, parte do research de stack muda |
| A3 | O warning sign de divergencia visual apos refresh decorre de inconsistencias entre sort local e sort no servidor | Common Pitfalls | Pode gerar checks de verificacao irrelevantes se a estrategia final for 100% server-driven |
| A4 | Campos derivados proximos ao banco/servidor sao a melhor escolha para esta fase | State of the Art | Pode conflitar com uma decisao futura de usar cache/materializacao em outra camada |

## Open Questions (RESOLVED)

1. **Qual hospedagem/baseline de banco a execucao vai assumir?**
   - What we know: `psql` nao esta instalado localmente, mas `Docker 28.4.0` esta disponivel [VERIFIED: local repo]
   - What's unclear: se o plano deve assumir Postgres em container local ou servico gerenciado desde a Wave 0 [ASSUMED]
   - Resolution: o plano passa a assumir `Postgres` em container local como baseline de execucao da Fase 1, com provider gerenciado tratado apenas como detalhe posterior de deploy.
   - Planning impact: a Wave 1 pode depender de `DATABASE_URL` apontando para ambiente local previsivel, sem bloquear a execucao por decisao de infraestrutura ainda nao tomada.

2. **A triagem por IA sera sincrona no fluxo de cadastro ou assíncrona em segundo passo?**
   - What we know: a fase exige enriquecimento inicial por IA, mas nao exige streaming nem fila externa [VERIFIED: local repo]
   - What's unclear: se “registrar entrada” deve bloquear ate a sugestao voltar [ASSUMED]
   - Resolution: o plano passa a assumir cadastro rapido + status `IA suggestion pending` + mutacao separada de triagem, sem bloquear o registro inicial da entrada.
   - Planning impact: o fluxo de UI precisa entregar cadastro imediato e acionar a triagem como passo posterior, preservando humano no loop e reduzindo latencia da operacao.

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node.js | Next.js / tooling | ✓ | `v24.6.0` [VERIFIED: local repo] | — |
| npm / npx | install e scripts | ✓ | `11.5.1` [VERIFIED: local repo] | — |
| Python | scripts auxiliares, migrations ad hoc, data prep | ✓ | `3.12.10` [VERIFIED: local repo] | — |
| Git | versionamento e workflow GSD | ✓ | `2.45.1.windows.1` [VERIFIED: local repo] | — |
| Docker | fallback de banco local | ✓ | `28.4.0` [VERIFIED: local repo] | usar container Postgres local |
| PostgreSQL CLI (`psql`) | administracao local direta | ✗ | — | usar Docker + cliente embutido no container [ASSUMED] |
| pnpm | opcao de package manager | ✗ | — | usar `npm`, que ja esta disponivel [VERIFIED: local repo] |

**Missing dependencies with no fallback:**
- Nenhum bloqueador imediato para o planejamento [VERIFIED: local repo]

**Missing dependencies with fallback:**
- `psql`: usar container Postgres ou UI de Drizzle Studio mais tarde [ASSUMED]
- `pnpm`: usar `npm` para bootstrap e scripts [VERIFIED: local repo]

## Security Domain

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V2 Authentication | no [VERIFIED: local repo] | Fora do escopo da Fase 1 [VERIFIED: local repo] |
| V3 Session Management | no [VERIFIED: local repo] | Fora do escopo da Fase 1 [VERIFIED: local repo] |
| V4 Access Control | no [VERIFIED: local repo] | Fora do escopo da Fase 1 [VERIFIED: local repo] |
| V5 Input Validation | yes [VERIFIED: local repo] | `zod` nos requests e na fronteira IA -> dominio [VERIFIED: npm registry] [CITED: https://zod.dev/basics?curius=1296&id=handling-errors] |
| V6 Cryptography | no [VERIFIED: local repo] | Sem necessidade especifica nesta fase alem do transporte HTTPS do provider [ASSUMED] |

### Known Threat Patterns for this stack

| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| Prompt injection no texto da entrada | Tampering / Information Disclosure | nunca confiar no modelo para gravar direto no dominio; usar Structured Outputs e revisao humana [CITED: https://platform.openai.com/docs/guides/structured-outputs?lang=javascript] [VERIFIED: local repo] |
| SQL injection em filtros e busca | Tampering | queries parametrizadas com `postgres` tagged templates ou Drizzle query builder [CITED: https://github.com/porsager/postgres] [CITED: https://orm.drizzle.team/docs/select] |
| Enum/state poisoning via payload manual | Tampering | validar enums com `zod` antes de qualquer insert/update [CITED: https://zod.dev/basics?curius=1296&id=handling-errors] |
| Vazamento de segredo do provider para o browser | Information Disclosure | chamadas ao SDK OpenAI somente no servidor [CITED: https://nextjs.org/docs/app/getting-started/server-and-client-components] [CITED: https://platform.openai.com/docs/libraries/javascript] |

## Sources

### Primary (HIGH confidence)
- `https://nextjs.org/docs/app/getting-started/installation` - bootstrap, defaults, requisitos de Node
- `https://nextjs.org/docs/app/getting-started/server-and-client-components` - divisao server/client
- `https://nextjs.org/docs/app/getting-started/mutating-data` - mutacoes via Server Functions
- `https://platform.openai.com/docs/libraries/javascript` - SDK JS oficial
- `https://platform.openai.com/docs/guides/migrate-to-responses` - recomendacao de Responses API
- `https://platform.openai.com/docs/guides/structured-outputs?lang=javascript` - saida estruturada com JSON Schema
- `https://orm.drizzle.team/docs/sql-schema-declaration` - schema code-first
- `https://orm.drizzle.team/docs/migrations` - estrategia de migracoes
- `https://orm.drizzle.team/docs/select` - queries type-safe
- `https://tanstack.com/table/docs/` - capacidades do TanStack Table
- `https://tanstack.com/table/latest/docs/guide/sorting` - sorting state controlado
- `https://zod.dev/` - Zod 4 estavel
- `https://zod.dev/basics?curius=1296&id=handling-errors` - parse/safeParse
- `https://www.postgresql.org/docs/` - versao atual do PostgreSQL
- `https://www.postgresql.org/docs/current/ddl-generated-columns.html` - generated columns e derivados
- `https://lucide.dev/` - iconografia tree-shakable
- `https://recharts.github.io/en-US/examples/SimpleBarChart/` - charts simples

### Secondary (MEDIUM confidence)
- `https://www.npmjs.com/package/next` - versao `15.5.2`
- `https://www.npmjs.com/package/react/v/19.1.1` - versao `19.1.1`
- `https://www.npmjs.com/package/react-dom` - versao `19.1.1`
- `https://www.npmjs.com/package/tailwindcss` - versao `4.1.12`
- `https://www.npmjs.com/package/drizzle-orm` - versao `0.44.5`
- `https://www.npmjs.com/package/drizzle-kit` - versao `0.31.4`
- `https://www.npmjs.com/postgres` - versao `3.4.7`
- `https://www.npmjs.com/package/zod` - versao `4.1.5`
- `https://www.npmjs.com/openai` - versao `5.12.2`
- `https://www.npmjs.com/package/%40tanstack/react-table` - versao `8.21.3`
- `https://www.npmjs.com/package/lucide-react` - versao `0.542.0`
- `https://www.npmjs.com/package/recharts` - versao `3.1.2`

### Tertiary (LOW confidence)
- Nenhuma fonte terciaria usada; itens `[ASSUMED]` foram isolados no Assumptions Log

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - stack principal apoiado em docs oficiais atuais e versoes verificadas no npm
- Architecture: HIGH - alinhado entre docs do Next.js, requisitos da fase e decisoes travadas no contexto
- Pitfalls: MEDIUM - forte apoio no contexto local; alguns warning signs dependem da estrategia final de execucao

**Research date:** 2026-04-17
**Valid until:** 2026-05-17
