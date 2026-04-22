# Phase 3: Coordenacao de Agenda - Research

**Researched:** 2026-04-20
**Domain:** coordenacao operacional de follow-ups, prazos e compromissos sobre inbox e tarefas no monolito Next.js atual [VERIFIED: local repo]
**Confidence:** HIGH

## User Constraints

### Locked Decisions
- Nao existe `03-CONTEXT.md` nem `03-UI-SPEC.md`; nao ha decisoes adicionais travadas pelo usuario para esta fase alem de `PROJECT.md`, `ROADMAP.md`, `REQUIREMENTS.md`, `STATE.md` e das instrucoes deste pedido [VERIFIED: local repo].
- A fase deve preservar Portugues nos artefatos [VERIFIED: user request].
- A fase deve ser tratada como app Next.js App Router com CSS/design system manual, persistencia runtime file-backed, schema Drizzle como contrato canonico futuro, validacao Zod, route handlers e testes Vitest/RTL [VERIFIED: user request] [VERIFIED: local repo].

### Claude's Discretion
- Como nao ha contexto interativo, o planner pode decidir a decomposicao em dominio, API e UI, desde que preserve o fluxo operacional existente de inbox -> execucao -> agenda [VERIFIED: user request] [VERIFIED: local repo].
- O planner pode escolher entre integrar a agenda em `/execucao`, criar rota propria `/agenda`, ou entregar ambas com navegacao compartilhada; a recomendacao conservadora desta pesquisa e criar entidade de agenda e uma rota propria `/agenda`, mantendo pontos de criacao e resumo dentro de `/execucao` [ASSUMED].

### Deferred Ideas (OUT OF SCOPE)
- Integracoes reais com Google Calendar, Outlook, WhatsApp, Instagram ou email permanecem fora de v1 [VERIFIED: local repo].
- IA avancada, automacoes autonomas e sincronizacao externa permanecem fora desta fase [VERIFIED: local repo].
- Migrar a persistencia runtime de arquivos para banco relacional real permanece fora desta fase, salvo decisao explicita posterior [ASSUMED].

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| AGND-01 | Usuario pode criar follow-up ou prazo associado a uma tarefa ou entrada | Criar entidade `agenda item` de primeira classe com `linkedType`, `linkedId`, snapshot de origem, `kind`, `dueAt` e status; expor criacao a partir de tarefa e entrada [VERIFIED: local repo] [ASSUMED]. |
| AGND-02 | Usuario pode visualizar compromissos, vencimentos e follow-ups em um fluxo unico | Criar `getAgendaItems()` com filtros e ordenacao por prazo, e uma rota `/agenda` server-first com lista densa + painel de detalhe [VERIFIED: local repo] [ASSUMED]. |
| AGND-03 | Usuario pode identificar itens vencidos ou proximos do vencimento | Calcular `urgencyState` no dominio a partir de `dueAt` e `Date.now()`, destacando `vencido`, `hoje`, `proximo` e `futuro` na lista, no detalhe e no radar [ASSUMED]. |
</phase_requirements>

## Summary

A Fase 3 deve ser planejada como a terceira camada do fluxo operacional ja implementado: inbox captura e triagem, tarefas convertem trabalho rastreavel, agenda coordena o tempo desse trabalho [VERIFIED: local repo]. A base atual ja possui `src/types/tasks.ts`, `src/db/queries/tasks.ts`, `src/db/schema/tasks.ts`, rotas `src/app/api/tasks/*`, conversao `src/app/api/inbox/[id]/convert/route.ts` e workspace `/execucao` com lista, detalhe, faixa de conversao e radar [VERIFIED: local repo]. A agenda deve se apoiar nesses mesmos padroes em vez de introduzir outra arquitetura [VERIFIED: local repo].

O ponto central de planejamento e modelar **itens de agenda como entidade de primeira classe** [ASSUMED]. Follow-ups, prazos e compromissos podem nascer de uma entrada ou de uma tarefa, mas nao sao apenas atributos desses registros: eles possuem status proprio, data/hora propria, tipo proprio, filtros proprios e precisam aparecer em uma visao unificada [VERIFIED: local repo] [ASSUMED]. Acrescentar apenas `dueAt` em `TaskDetail` resolveria parte de prazos de tarefa, mas nao cobriria follow-ups associados diretamente a entradas nem compromissos independentes vinculados ao fluxo operacional [ASSUMED].

Como a fase nao possui UI-SPEC, o default conservador deve preservar a linguagem visual densa de `/execucao`: sidebar compacta, navegacao `Inbox` / `Tarefas` / `Agenda`, lista ordenada por risco temporal, detalhe lateral, formularios pequenos e radar operacional [VERIFIED: local repo] [ASSUMED]. A rota propria `/agenda` e a melhor superficie principal para AGND-02 e AGND-03; `/execucao` deve receber apenas pontos de criacao/visibilidade contextual para nao misturar backlog de execucao com calendario completo [ASSUMED].

**Primary recommendation:** planejar a Fase 3 como dominio `agenda`, API `agenda`, rota `/agenda` e pequenos pontos de criacao a partir de inbox/task, usando entidade `AgendaItem` vinculada por `linkedType: "inbox" | "task"` e snapshot operacional da origem [ASSUMED].

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Criar follow-up/prazo a partir de entrada ou tarefa | API / Backend | Database / Storage | A criacao precisa validar payload, verificar existencia da origem e persistir link/snapshot de forma confiavel [VERIFIED: local repo] [ASSUMED]. |
| Calcular vencido/proximo/hoje | API / Backend | Browser / Client | O calculo deve ser consistente para lista, detalhe, radar e testes; o browser apenas renderiza o estado recebido [ASSUMED]. |
| Persistir compromissos e follow-ups | Database / Storage | API / Backend | Agenda item tem ciclo de vida proprio e deve sobreviver a refresh, filtros e navegacao [ASSUMED]. |
| Renderizar visao unica de agenda | Frontend Server | Browser / Client | O padrao atual carrega dados iniciais em Server Component e hidrata interacoes no shell client [VERIFIED: local repo]. |
| Filtrar e selecionar itens de agenda | Browser / Client | Frontend Server | Filtros e selecao seguem o mesmo padrao local usado em inbox e execucao [VERIFIED: local repo]. |
| Exibir resumo de prazos criticos | Frontend Server | Database / Storage | Radar deve derivar de dados persistidos via query, como `ExecutionRadar` e `OpsRadar` [VERIFIED: local repo]. |

## Project Constraints (from AGENTS.md)

- Manter estrutura hibrida: documentos Markdown no root e app Next.js em `src/` [VERIFIED: AGENTS.md].
- Documentar tooling futuro em `README.md` e `AGENTS.md` se ele mudar [VERIFIED: AGENTS.md].
- Usar `npm install`, `npm run dev`, `npm run lint`, `npm run build`, `npm run test -- --run` como comandos primarios [VERIFIED: AGENTS.md].
- Preservar idioma do arquivo editado; a maioria do projeto esta em Portugues [VERIFIED: AGENTS.md].
- Para contribuicoes substanciais, verificar `npm run lint`, `npm run build` e `npm run test -- --run` [VERIFIED: AGENTS.md].
- Nao adicionar detalhes placeholder sem suporte nos docs e artefatos atuais [VERIFIED: AGENTS.md].

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| `next` | `^15.5.2` em `package.json` [VERIFIED: local repo] | App Router, Server Components e route handlers | O app ja usa `src/app/(workspace)` e `src/app/api/*`; a fase deve continuar esse padrao [VERIFIED: local repo]. |
| `react` / `react-dom` | `^19.1.1` em `package.json` [VERIFIED: local repo] | Shell interativo de agenda, formularios e transicoes | `WorkspaceShell` de execucao ja usa `useState`, `useEffect` e `useTransition` [VERIFIED: local repo]. |
| `zod` | `^4.3.6` em `package.json` [VERIFIED: local repo] | Validar criacao, filtros, status e ids logicos | Inbox e tarefas ja centralizam validacao em `src/lib/validation/*` [VERIFIED: local repo]. |
| `drizzle-orm` / `drizzle-kit` | `^0.45.2` / `^0.31.10` em `package.json` [VERIFIED: local repo] | Schema canonico futuro para `agenda_items` | O runtime atual e file-backed, mas `src/db/schema/*` e mantido como contrato relacional futuro [VERIFIED: local repo]. |
| `@tanstack/react-table` | `^8.21.3` em `package.json` [VERIFIED: local repo] | Lista densa e selecionavel de agenda | Inbox e tarefas usam tabela/lista operacional densa; agenda deve seguir a mesma linguagem [VERIFIED: local repo]. |
| `vitest` + RTL | `vitest ^3.2.4`, `@testing-library/react ^16.0.1` em `package.json` [VERIFIED: local repo] | Testes de dominio, API e workspace | A suite atual cobre dominios, route handlers e shells com o mesmo modelo [VERIFIED: local repo]. |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `lucide-react` | `^1.8.0` em `package.json` [VERIFIED: local repo] | Icones compactos para prazo, alerta, follow-up e compromisso | Usar com parcimonia em botoes/indicadores sem trocar o design system manual [VERIFIED: local repo] [ASSUMED]. |
| `recharts` | `^3.8.1` em `package.json` [VERIFIED: local repo] | Graficos pequenos, se o radar pedir visual temporal | Nao e necessario para a entrega minima; contadores densos atendem AGND-03 [ASSUMED]. |
| `postgres` | `^3.4.9` em `package.json` [VERIFIED: local repo] | Futuro runtime relacional | Nao ativar como parte obrigatoria da fase 3 [ASSUMED]. |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| `AgendaItem` proprio [ASSUMED] | Campos `dueAt` e `followUpAt` diretamente em `tasks` e `inbox_items` | Mais rapido no primeiro form, mas nao cria fluxo unico para AGND-02 e fragmenta vencidos/proximos entre entidades [ASSUMED]. |
| Rota propria `/agenda` [ASSUMED] | Apenas uma aba dentro de `/execucao` | Menor superficie de navegacao, mas compromissos e follow-ups ligados a inbox ficam subordinados a tarefas [ASSUMED]. |
| Persistencia file-backed `agenda-items.json` [ASSUMED] | Migrar tudo para Postgres/Drizzle runtime | Melhora alinhamento futuro, mas adiciona migracao fora do objetivo da fase [ASSUMED]. |

**Installation:**
```bash
npm install
```

**Version verification:** versoes foram verificadas apenas no `package.json`; npm registry e documentacao externa nao foram consultados nesta pesquisa por nao serem necessarios para decidir o plano e para manter a pesquisa repo-grounded [VERIFIED: local repo] [ASSUMED].

## Architecture Patterns

### System Architecture Diagram

```text
Inbox item ou Task detail
  |
  | "Agendar follow-up" / "Definir prazo"
  v
Route Handler de agenda
  |
  +--> valida payload com Zod
  +--> verifica origem: inbox ou task
  +--> cria AgendaItem com linkedType + linkedId + snapshot
  +--> calcula estado temporal derivado
              |
              v
        Store file-backed
        .data/agenda-items.json
              |
              v
Queries de agenda
  |             |              |
  | lista       | detalhe      | resumo
  v             v              v
/agenda SSR -> AgendaWorkspaceShell client -> filtros, selecao, concluir/reagendar
              |
              v
      lista densa + detalhe + radar de vencimentos
```

### Recommended Project Structure
```text
src/
├── app/
│   ├── (workspace)/
│   │   ├── execucao/page.tsx          # manter; pode exibir criacao contextual/resumo pequeno
│   │   └── agenda/page.tsx            # nova visao unica de agenda
│   └── api/
│       └── agenda/
│           ├── route.ts               # GET lista/resumo, POST cria item
│           └── [id]/
│               ├── route.ts           # GET detalhe, PATCH metadados/data/status
│               └── status/route.ts    # opcional: mutacao dedicada para concluir/cancelar
├── components/
│   ├── agenda/
│   │   ├── agenda-table.tsx
│   │   ├── filters-bar.tsx
│   │   ├── schedule-dialog.tsx
│   │   └── workspace-shell.tsx
│   ├── detail/
│   │   └── agenda-detail-panel.tsx
│   └── dashboard/
│       └── agenda-radar.tsx
├── db/
│   ├── queries/agenda.ts
│   └── schema/agenda.ts
├── lib/
│   └── validation/agenda.ts
├── test/
│   ├── agenda-domain.test.ts
│   ├── agenda-api.test.ts
│   └── agenda-workspace.test.tsx
└── types/
    └── agenda.ts
```

### Pattern 1: Agenda Item como Entidade de Primeira Classe
**What:** criar `AgendaItem` com id proprio, tipo, prazo, status, link para origem e snapshot de origem [ASSUMED].
**When to use:** em toda criacao/listagem/detalhe de follow-ups, vencimentos e compromissos [ASSUMED].
**Example:**
```typescript
// Source: padrao local de src/types/tasks.ts [VERIFIED: local repo]
export type AgendaItemKind = "follow_up" | "deadline" | "commitment";
export type AgendaLinkedType = "inbox" | "task";
export type AgendaStatus = "Aberto" | "Concluido" | "Cancelado";
export type AgendaUrgencyState = "vencido" | "hoje" | "proximo" | "futuro";

export interface AgendaListItem {
  id: number;
  title: string;
  kind: AgendaItemKind;
  status: AgendaStatus;
  dueAt: string;
  urgencyState: AgendaUrgencyState;
  linkedType: AgendaLinkedType;
  linkedId: number;
  linkedTitle: string;
  ownerName: string | null;
}
```

### Pattern 2: Link Polimorfico com Snapshot Operacional
**What:** persistir `linkedType` + `linkedId` e tambem um snapshot minimo da origem, nos moldes de `TaskOriginSnapshot` [VERIFIED: local repo] [ASSUMED].
**When to use:** quando o item de agenda nasce de inbox ou task e precisa manter contexto mesmo se a origem mudar depois [ASSUMED].
**Example:**
```typescript
// Source: padrao local de TaskOriginSnapshot em src/types/tasks.ts [VERIFIED: local repo]
export interface AgendaLinkedSnapshot {
  type: "inbox" | "task";
  id: number;
  title: string;
  sourceLabel: string;
  summary: string;
  priority: "Baixa" | "Media" | "Alta" | "Critica";
  ownerName?: string | null;
}
```

### Pattern 3: Estado Temporal Derivado no Dominio
**What:** calcular `urgencyState`, `isOverdue` e `hoursUntilDue` em `src/db/queries/agenda.ts`, nao apenas no componente [ASSUMED].
**When to use:** em `getAgendaItems`, `getAgendaItemById` e `getAgendaSummary` [ASSUMED].
**Example:**
```typescript
// Source: padrao local de getAgeHours em src/db/queries/tasks.ts [VERIFIED: local repo]
function getUrgencyState(dueAt: string, status: AgendaStatus): AgendaUrgencyState {
  if (status !== "Aberto") return "futuro";
  const deltaHours = (new Date(dueAt).getTime() - Date.now()) / 36e5;
  if (deltaHours < 0) return "vencido";
  if (deltaHours <= 24) return "hoje";
  if (deltaHours <= 72) return "proximo";
  return "futuro";
}
```

### Pattern 4: Server-First Agenda Workspace
**What:** criar `src/app/(workspace)/agenda/page.tsx` que busca lista, detalhe inicial e resumo antes de renderizar shell client [VERIFIED: local repo] [ASSUMED].
**When to use:** na tela principal de AGND-02/03 [ASSUMED].
**Example:**
```typescript
// Source: padrao local de src/app/(workspace)/execucao/page.tsx [VERIFIED: local repo]
export default async function AgendaWorkspacePage() {
  const items = await getAgendaItems();
  const selectedItem = items[0] ? await getAgendaItemById(items[0].id) : null;
  const summary = await getAgendaSummary();

  return (
    <AgendaWorkspaceShell
      initialItems={items}
      initialSelectedItem={selectedItem}
      initialSummary={summary}
    />
  );
}
```

### Anti-Patterns to Avoid
- **Agenda como dois campos soltos:** nao resolver a fase apenas com `dueAt` em task e `followUpAt` em inbox; isso quebra a visao unica exigida por AGND-02 [ASSUMED].
- **Calendario visual completo cedo demais:** nao priorizar month/week calendar grid; o produto atual e operacional denso, nao calendario pessoal [VERIFIED: local repo] [ASSUMED].
- **Criacao apenas no cliente:** nao deixar links de origem e status temporal como estado local; criacao e calculo precisam passar por route handlers e queries [VERIFIED: local repo].
- **Perder origem ao agendar:** nao salvar apenas texto livre “origem”; o planner deve exigir link e snapshot como em tarefas [VERIFIED: local repo] [ASSUMED].
- **Integracao externa prematura:** nao planejar OAuth/calendar sync nesta fase [VERIFIED: local repo].

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Validacao de payloads de agenda | `if/else` espalhado em componentes e rotas | Schemas Zod em `src/lib/validation/agenda.ts` [VERIFIED: local repo] | O projeto ja usa Zod para inbox e tarefas, incluindo coercoes e enums [VERIFIED: local repo]. |
| Lista densa com filtros | Tabela artesanal nova | Padrao de `TasksTable`/`FiltersBar`, com `@tanstack/react-table` se necessario [VERIFIED: local repo] | Mantem consistencia de selecao, ordenacao e densidade operacional [VERIFIED: local repo]. |
| Estado vencido/proximo | Calculo duplicado em varios componentes | Helper central em queries/domain [ASSUMED] | Evita divergencia entre lista, detalhe, radar e testes [ASSUMED]. |
| Link com origem | Texto livre ou URL manual | `linkedType`, `linkedId` e snapshot persistido [ASSUMED] | Permite criar agenda tanto de inbox quanto de tarefa e preservar contexto [ASSUMED]. |
| Integração de calendário externo | OAuth/sync custom na v1 | Nenhuma integracao externa nesta fase [VERIFIED: local repo] | O roadmap deixa integracoes reais para v2 [VERIFIED: local repo]. |

**Key insight:** a fase nao pede calendario generico; ela pede coordenacao temporal do fluxo operacional existente [VERIFIED: local repo]. Portanto, o planner deve priorizar vínculo, vencimento, visao unica e evidência de risco temporal [ASSUMED].

## Common Pitfalls

### Pitfall 1: Tratar prazo como atributo exclusivo da tarefa
**What goes wrong:** AGND-01 fica incompleto porque entradas sem tarefa nao conseguem gerar follow-up [ASSUMED].
**Why it happens:** a fase anterior acabou de criar `TaskDetail`, entao parece natural colocar tudo em `tasks` [VERIFIED: local repo].
**How to avoid:** permitir `linkedType: "inbox" | "task"` em `AgendaItem` [ASSUMED].
**Warning signs:** nao existe rota ou payload capaz de agendar a partir de `inboxId` [ASSUMED].

### Pitfall 2: Construir calendario visual em vez de fila operacional
**What goes wrong:** o operador ve uma grade bonita, mas perde prioridade, origem, responsavel e tomada de acao [ASSUMED].
**Why it happens:** “agenda” sugere calendario mensal, mas o produto atual usa lista densa e detalhe lateral [VERIFIED: local repo].
**How to avoid:** comecar por lista ordenada por `dueAt` e `urgencyState`, com filtros por tipo/status/origem [ASSUMED].
**Warning signs:** a tela principal nao mostra origem, responsavel ou risco temporal sem abrir detalhe [ASSUMED].

### Pitfall 3: Duplicar regras de data no cliente
**What goes wrong:** um item aparece vencido no radar e “proximo” na lista [ASSUMED].
**Why it happens:** cada componente recalcula prazo com thresholds proprios [ASSUMED].
**How to avoid:** centralizar thresholds e serializar `urgencyState` nos retornos das queries [ASSUMED].
**Warning signs:** `new Date(dueAt)` aparece em muitos componentes [ASSUMED].

### Pitfall 4: Nao definir semantica de tipos
**What goes wrong:** follow-up, prazo e compromisso viram labels intercambiaveis e os filtros ficam confusos [ASSUMED].
**Why it happens:** os requisitos citam tres conceitos, mas nao definem diferencas operacionais [VERIFIED: local repo].
**How to avoid:** usar default: `follow_up` = lembrar de agir/responder; `deadline` = vencimento de entrega/decisao; `commitment` = compromisso com hora marcada [ASSUMED].
**Warning signs:** todo item novo usa tipo unico “agenda” [ASSUMED].

### Pitfall 5: Falta de regra para itens concluidos
**What goes wrong:** itens vencidos continuam contaminando o radar depois de resolvidos [ASSUMED].
**Why it happens:** o planner foca em criacao/listagem e esquece ciclo de vida [ASSUMED].
**How to avoid:** incluir status `Aberto`, `Concluido`, `Cancelado` e mutacao de conclusao/reagendamento [ASSUMED].
**Warning signs:** nao existe teste para concluir item de agenda e remover do contador de vencidos [ASSUMED].

## Code Examples

### Schema Drizzle Canonico
```typescript
// Source: padrao local de src/db/schema/tasks.ts [VERIFIED: local repo]
export const agendaKindEnum = pgEnum("agenda_kind", [
  "follow_up",
  "deadline",
  "commitment"
]);

export const agendaItems = pgTable("agenda_items", {
  id: serial("id").primaryKey(),
  linkedType: text("linked_type").notNull(),
  linkedId: integer("linked_id").notNull(),
  title: text("title").notNull(),
  kind: agendaKindEnum("kind").notNull(),
  dueAt: timestamp("due_at", { withTimezone: true }).notNull(),
  status: text("status").notNull().default("Aberto"),
  ownerName: text("owner_name"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull()
});
```

### Payload de Criacao com Zod
```typescript
// Source: padrao local de src/lib/validation/tasks.ts [VERIFIED: local repo]
export const createAgendaItemSchema = z.object({
  linkedType: z.enum(["inbox", "task"]),
  linkedId: z.coerce.number().int().positive(),
  kind: z.enum(["follow_up", "deadline", "commitment"]),
  title: z.string().trim().min(1),
  dueAt: z.string().datetime(),
  ownerName: nullableTextSchema,
  notes: nullableTextSchema
});
```

### Route Handler de Criacao
```typescript
// Source: padrao local de src/app/api/tasks/[id]/route.ts [VERIFIED: local repo]
export async function POST(request: Request) {
  const json = await readJson(request);
  const parsed = createAgendaItemSchema.safeParse(json);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid agenda payload" }, { status: 400 });
  }

  const result = await createAgendaItem(parsed.data);

  if (!result.ok && result.code === "linked-origin-not-found") {
    return NextResponse.json({ error: "Linked origin not found" }, { status: 404 });
  }

  return NextResponse.json(result.item, { status: 201 });
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Planejar agenda como calendario pessoal isolado [ASSUMED] | Planejar agenda como fila operacional temporal ligada a inbox/tarefas [VERIFIED: local repo] [ASSUMED] | Decisao de produto v1 em `ROADMAP.md` | A tela deve mostrar risco operacional e origem, nao apenas data [VERIFIED: local repo] [ASSUMED]. |
| Campos de prazo espalhados por entidade [ASSUMED] | Entidade temporal propria com link polimorfico [ASSUMED] | Recomendacao desta pesquisa | Atende AGND-01 e AGND-02 com uma fonte de verdade [ASSUMED]. |
| Runtime relacional imediato [ASSUMED] | File-backed runtime + Drizzle como contrato futuro [VERIFIED: local repo] | Padrao das fases 1 e 2 | Evita abrir migracao de infraestrutura na fase de produto [VERIFIED: local repo] [ASSUMED]. |

**Deprecated/outdated:**
- Criar `pages/api` para agenda: o repo usa App Router em `src/app/api/*` [VERIFIED: local repo].
- Criar UI de agenda fora da navegacao do workspace: `WorkspaceShell` atual ja oferece navegacao compacta para `Inbox` e `Tarefas` [VERIFIED: local repo].
- Introduzir dependencia de date library sem necessidade: os requisitos podem ser atendidos com ISO strings, `Date` nativo e helpers testados [ASSUMED].

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | Agenda deve ser entidade de primeira classe, nao campos em inbox/tasks | Summary / Patterns | Se o usuario quiser agenda minima apenas em tarefa, o plano ficaria maior que o necessario. |
| A2 | Deve existir rota propria `/agenda`, com pontos contextuais em `/execucao` | Summary / Alternatives | Se o usuario preferir tudo em `/execucao`, componentes e navegacao mudam. |
| A3 | Persistencia runtime deve continuar file-backed em `.data/agenda-items.json` | Standard Stack / Patterns | Se a fase tambem ativar banco real, o plano precisa incluir migracao e infra. |
| A4 | Threshold default: vencido `< now`, hoje `<=24h`, proximo `<=72h`, futuro `>72h` | Patterns / Pitfalls | Se o operador tiver outra definicao de SLA, contadores e testes precisam mudar. |
| A5 | Tipos default: follow-up, deadline e commitment com semantica distinta | Common Pitfalls | Se o produto quiser taxonomia diferente, filtros e copy precisam ajuste. |
| A6 | Sem integracao externa de calendario na v1 | User Constraints / Don't Hand-Roll | Se sync externo for exigido, a fase muda de dominio local para integracao/OAuth. |

## Open Questions (RESOLVED)

1. **A agenda deve ter rota propria ou viver dentro de `/execucao`?**
   - RESOLVED: criar `/agenda` como rota principal da visao unificada e manter apenas acoes/resumos contextuais em inbox e `/execucao`.
   - What we know: o requisito AGND-02 pede fluxo unico para compromissos, vencimentos e follow-ups [VERIFIED: local repo].
   - What's unclear: nao ha `03-UI-SPEC.md` para travar IA/UX [VERIFIED: local repo].
   - Recommendation: criar `/agenda` como rota principal e adicionar link na sidebar; manter apenas criacao/resumo contextual em `/execucao` [ASSUMED].

2. **Quais thresholds definem “proximo do vencimento”?**
   - RESOLVED: usar `vencido < agora`, `hoje <= 24h`, `proximo <= 72h` e `futuro > 72h` como default v1.
   - What we know: AGND-03 exige vencidos e proximos evidentes, mas nao define SLA [VERIFIED: local repo].
   - What's unclear: o usuario nao forneceu horizonte operacional especifico [VERIFIED: user request].
   - Recommendation: default conservador `vencido < agora`, `hoje <= 24h`, `proximo <= 72h`; documentar como constante facil de ajustar [ASSUMED].

3. **Compromisso pode existir sem origem?**
   - RESOLVED: exigir origem `inbox` ou `task` em v1; compromissos independentes ficam fora desta fase.
   - What we know: AGND-01 fala associado a tarefa ou entrada; AGND-02 fala compromissos no fluxo unico [VERIFIED: local repo].
   - What's unclear: compromissos independentes nao sao explicitamente permitidos [VERIFIED: local repo].
   - Recommendation: para v1, exigir origem `inbox` ou `task`; compromisso independente fica fora da fase para preservar rastreabilidade [ASSUMED].

4. **Uma origem pode ter varios itens de agenda ativos?**
   - RESOLVED: permitir varios itens por origem, mas impedir duplicata ativa exata por `linkedType + linkedId + kind + dueAt`.
   - What we know: uma tarefa pode precisar de prazo e follow-up separados [ASSUMED].
   - What's unclear: nao ha regra de idempotencia como na conversao task [VERIFIED: local repo].
   - Recommendation: permitir varios itens por origem, mas impedir duplicata exata por `linkedType + linkedId + kind + dueAt + status Aberto` [ASSUMED].

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|-------------|-----------|---------|----------|
| Node.js | Next.js, Vitest e scripts npm | Nao re-probado nesta pesquisa; disponivel na fase 2 [VERIFIED: local repo] | `v24.6.0` registrado em `02-RESEARCH.md` [VERIFIED: local repo] | — |
| npm | comandos de build/test | Nao re-probado nesta pesquisa; disponivel na fase 2 [VERIFIED: local repo] | `11.5.1` registrado em `02-RESEARCH.md` [VERIFIED: local repo] | — |
| Vitest | testes de dominio/API/UI | Sim via dependencia em `package.json` [VERIFIED: local repo] | `^3.2.4` [VERIFIED: local repo] | — |

**Missing dependencies with no fallback:**
- Nenhum bloqueador identificado; a fase pode ser planejada sobre dependencias ja instaladas [VERIFIED: local repo].

**Missing dependencies with fallback:**
- Documentacao externa oficial nao foi consultada; fallback e seguir os padroes locais verificados das fases 1 e 2 [VERIFIED: local repo].

## Validation Architecture

O arquivo `.planning/config.json` define `workflow.nyquist_validation` como `false`; por isso a arquitetura Nyquist detalhada e omitida conforme regra do workflow [VERIFIED: local repo].

Mesmo sem Nyquist, o planner deve incluir testes focados [ASSUMED]:

| Area | Arquivo recomendado | Cobertura |
|------|---------------------|----------|
| Dominio | `src/test/agenda-domain.test.ts` | criacao a partir de inbox/task, snapshot, filtros, status temporal, resumo [ASSUMED]. |
| API | `src/test/agenda-api.test.ts` | `GET /api/agenda`, `POST /api/agenda`, detalhe, payload invalido, origem ausente, concluir/reagendar [ASSUMED]. |
| UI | `src/test/agenda-workspace.test.tsx` | render server-hydrated, filtros por tipo/status/risco, selecao de detalhe, criacao/conclusao e radar [ASSUMED]. |

## Security Domain

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V2 Authentication | no [VERIFIED: local repo] | Nao ha modulo de auth; nao presumir usuario autenticado [VERIFIED: local repo]. |
| V3 Session Management | no [VERIFIED: local repo] | Fora do escopo desta fase [VERIFIED: local repo]. |
| V4 Access Control | parcialmente [ASSUMED] | Sem auth, manter mutacoes no servidor e validar origem/status; nao criar autorizacao falsa no cliente [ASSUMED]. |
| V5 Input Validation | yes [VERIFIED: local repo] | Zod para ids, enums, `dueAt`, texto e filtros [VERIFIED: local repo] [ASSUMED]. |
| V6 Cryptography | no [VERIFIED: local repo] | Nao ha requisito criptografico novo [VERIFIED: local repo]. |

### Known Threat Patterns for Next.js + file-backed agenda

| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| Criar item ligado a origem inexistente | Tampering | Verificar `linkedType` e `linkedId` no backend antes de persistir [ASSUMED]. |
| Enviar `dueAt` invalido ou ambíguo | Tampering | Validar ISO datetime com Zod e normalizar para ISO string no dominio [ASSUMED]. |
| Marcar item alheio como concluido por payload manual | Tampering | Validar id positivo, status fechado e existencia no route handler [ASSUMED]. |
| Divergencia entre status visual e status real | Repudiation | Persistir `status`, `completedAt` e timeline/evento minimo de mutacao [ASSUMED]. |
| Crescimento ilimitado do arquivo `.data/agenda-items.json` | Denial of Service | Manter payloads curtos, snapshots minimos e filtros server-side; nao aceitar blobs livres [ASSUMED]. |

## UI Planning Constraints

- A agenda deve manter a linguagem list-detail densa de `/execucao`, com lista principal, detalhe lateral e radar compacto [VERIFIED: local repo] [ASSUMED].
- A sidebar deve evoluir de `Inbox` / `Tarefas` para `Inbox` / `Tarefas` / `Agenda`, sem landing page intermediaria [VERIFIED: local repo] [ASSUMED].
- A lista deve priorizar risco temporal: vencidos primeiro, depois hoje, proximos e futuros; prioridade operacional deve desempatar [ASSUMED].
- Cada linha deve mostrar tipo, titulo, origem, responsavel, prazo e estado temporal; o operador nao deve precisar abrir detalhe para ver se esta vencido [ASSUMED].
- O detalhe deve mostrar origem vinculada com snapshot, notas, status, acoes `Concluir`, `Reagendar` e opcionalmente `Cancelar` [ASSUMED].
- `/execucao` deve ganhar um ponto contextual para agendar follow-up/prazo da tarefa selecionada e talvez um pequeno resumo de agenda, mas a visao unica completa deve morar em `/agenda` [ASSUMED].

## Sources

### Primary (HIGH confidence)
- `AGENTS.md` - diretrizes de estrutura, idioma, comandos e testes [VERIFIED: local repo].
- `.planning/PROJECT.md` - valor central, escopo ativo e constraints de produto [VERIFIED: local repo].
- `.planning/ROADMAP.md` - objetivo e success criteria da Fase 3 [VERIFIED: local repo].
- `.planning/REQUIREMENTS.md` - AGND-01, AGND-02, AGND-03 [VERIFIED: local repo].
- `.planning/STATE.md` - status atual e proxima acao recomendada [VERIFIED: local repo].
- `.planning/phases/02-execucao-de-trabalho/02-RESEARCH.md` - padroes e decisoes da fase anterior [VERIFIED: local repo].
- `.planning/phases/02-execucao-de-trabalho/02-PATTERNS.md` - analogos para tipos, schema, queries, rotas, componentes e testes [VERIFIED: local repo].
- `.planning/phases/02-execucao-de-trabalho/02-VERIFICATION.md` - confirmacao de que tarefas estao implementadas e verificadas [VERIFIED: local repo].
- `src/types/tasks.ts`, `src/db/schema/tasks.ts`, `src/db/queries/tasks.ts`, `src/lib/validation/tasks.ts` - contratos e dominio de tarefas [VERIFIED: local repo].
- `src/app/api/tasks/route.ts`, `src/app/api/tasks/[id]/route.ts`, `src/app/api/tasks/[id]/status/route.ts`, `src/app/api/inbox/[id]/convert/route.ts` - padroes de route handlers [VERIFIED: local repo].
- `src/app/(workspace)/execucao/page.tsx`, `src/components/execution/workspace-shell.tsx`, `src/components/execution/conversion-strip.tsx`, `src/components/detail/task-detail-panel.tsx`, `src/components/dashboard/execution-radar.tsx` - padroes UI da mesa de execucao [VERIFIED: local repo].
- `src/test/tasks-domain.test.ts`, `src/test/tasks-api.test.ts`, `src/test/execution-workspace.test.tsx` - padroes de teste [VERIFIED: local repo].
- `package.json` - dependencias e scripts [VERIFIED: local repo].

### Secondary (MEDIUM confidence)
- Nenhuma fonte externa foi usada; a pesquisa foi deliberadamente repo-grounded [VERIFIED: local repo].

### Tertiary (LOW confidence)
- Itens marcados `[ASSUMED]` nesta pesquisa representam recomendacoes de desenho ainda nao confirmadas pelo usuario.

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - baseado em `package.json` e padroes ja implementados [VERIFIED: local repo].
- Architecture: HIGH - a recomendacao segue diretamente o modelo de tarefas verificado na fase 2 [VERIFIED: local repo].
- Pitfalls: MEDIUM - riscos principais derivam dos requisitos e do repo, mas thresholds e semantica de tipos ainda sao decisoes de produto [ASSUMED].

**Research date:** 2026-04-20
**Valid until:** 2026-05-20
