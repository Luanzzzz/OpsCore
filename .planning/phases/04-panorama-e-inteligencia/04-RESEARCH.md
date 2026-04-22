# Phase 4: Panorama e Inteligencia - Research

**Researched:** 2026-04-21 [VERIFIED: local clock]  
**Domain:** panorama operacional cross-domain sobre inbox, tarefas, agenda, narrativa de plataforma e pontos de extensao para inteligencia/integracoes futuras [VERIFIED: .planning/ROADMAP.md]  
**Confidence:** HIGH [VERIFIED: local repo]

## User Constraints

### Locked Decisions
- Phase 4 e `Panorama e Inteligencia`, com objetivo de consolidar a leitura operacional ampla e preparar expansao para IA mais forte e integracoes futuras [VERIFIED: .planning/ROADMAP.md].
- O requisito da fase e `DASH-03`: usuario pode acompanhar panorama operacional a partir de estados reais do sistema [VERIFIED: .planning/REQUIREMENTS.md].
- A pesquisa deve focar em planejamento, nao implementacao [VERIFIED: user request].
- O escopo v1 deve permanecer restrito: sem integracoes reais, sem agentes autonomos avancados, sem OAuth, sem calendario externo e sem implementacao de canais externos [VERIFIED: user request] [VERIFIED: .planning/REQUIREMENTS.md].
- `gsd-sdk` esta indisponivel no PATH nesta sessao, entao caminhos e estado foram inferidos diretamente dos arquivos do repositorio [VERIFIED: user request] [VERIFIED: shell Get-Command gsd-sdk].
- `workflow.nyquist_validation` esta desabilitado em `.planning/config.json`, entao a pesquisa nao deve exigir uma arquitetura Nyquist formal [VERIFIED: .planning/config.json].
- Nao existe `04-CONTEXT.md` nem `04-UI-SPEC.md` no inicio da pesquisa [VERIFIED: local repo] [VERIFIED: user request].

### Claude's Discretion
- A decomposicao recomendada pode decidir a superficie principal de panorama, desde que reflita estados reais de inbox, tarefas e agenda [VERIFIED: user request] [VERIFIED: .planning/ROADMAP.md].
- A pesquisa pode recomendar contratos e pontos de extensao para IA e integracoes, desde que eles sejam estruturas locais e verificaveis, nao implementacoes reais de v2 [VERIFIED: user request].
- A pesquisa pode recomendar atualizacoes de copy/narrativa do produto para comunicar OpsCore como plataforma mais ampla que InboxFlow [VERIFIED: user request] [VERIFIED: context.md] [VERIFIED: arquitetura-macro.md].

### Deferred Ideas (OUT OF SCOPE)
- Integracoes reais com WhatsApp, Instagram, email, CRM, Google Calendar, Outlook ou OAuth ficam fora da Fase 4 [VERIFIED: .planning/REQUIREMENTS.md] [VERIFIED: user request].
- IA avancada, agentes autonomos, recomendacoes historicas fortes e automacoes por regra ficam fora da Fase 4 [VERIFIED: .planning/REQUIREMENTS.md] [VERIFIED: user request].
- Migrar a persistencia runtime file-backed para Postgres real fica fora desta fase, salvo nova decisao explicita [VERIFIED: local repo] [ASSUMED].
- Redesign completo de marca, landing page de marketing ou troca de stack ficam fora da Fase 4 [VERIFIED: local repo] [ASSUMED].

## Project Constraints (from AGENTS.md)

- Manter a estrutura hibrida do repositorio: documentacao Markdown no root e app Next.js em `src/` [VERIFIED: AGENTS.md].
- Documentar mudancas futuras de tooling em `README.md` e `AGENTS.md` se ocorrerem [VERIFIED: AGENTS.md].
- Usar `npm install`, `npm run dev`, `npm run lint`, `npm run build` e `npm run test -- --run` como comandos primarios [VERIFIED: AGENTS.md].
- Preservar o idioma do arquivo editado; documentos atuais e UI usam Portugues majoritariamente [VERIFIED: AGENTS.md] [VERIFIED: local repo].
- Para contribuicoes substanciais, verificar `npm run lint`, `npm run build` e `npm run test -- --run` [VERIFIED: AGENTS.md].
- Nao adicionar detalhes placeholder sem suporte nos documentos e artefatos atuais [VERIFIED: AGENTS.md].
- Ao iniciar trabalho relacionado a OpsCore, consultar checkpoints recentes em `D:\Obsidian\Vaults\2° Cérebro\projects\opscore\context`; o checkpoint mais recente indicava iniciar pesquisa da Fase 4 [VERIFIED: AGENTS.md] [VERIFIED: checkpoint 2026-04-20-2108-phase-4-planning-start.md].

<phase_requirements>

## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| DASH-03 | Usuario pode acompanhar panorama operacional a partir de estados reais do sistema [VERIFIED: .planning/REQUIREMENTS.md] | Criar um agregado `panorama` server-side que leia `getDashboardSummary`, `getExecutionSummary`, `getAgendaSummary` e listas/detalhes necessarios para sinais cross-domain, sem fixtures ou recomputacao improvisada no cliente [VERIFIED: src/db/queries/inbox.ts] [VERIFIED: src/db/queries/tasks.ts] [VERIFIED: src/db/queries/agenda.ts]. |

</phase_requirements>

## Summary

A Fase 4 deve fechar a v1 como uma camada de leitura operacional sobre os tres dominios ja implementados: inbox, tarefas e agenda [VERIFIED: .planning/STATE.md] [VERIFIED: .planning/phases/03-coordenacao-de-agenda/03-VERIFICATION.md]. O caminho conservador e criar um dominio `panorama` com contratos proprios, query agregadora e uma rota/workspace `/panorama`, em vez de esticar `DashboardSummary` de inbox ate ele virar um objeto misto sem dono claro [VERIFIED: src/types/inbox.ts] [VERIFIED: src/db/queries/dashboard.ts] [ASSUMED].

O panorama precisa mostrar estados reais e coerentes, nao graficos decorativos [VERIFIED: .planning/ROADMAP.md] [VERIFIED: .planning/research/PITFALLS.md]. A base atual ja fornece resumo de inbox (`DashboardSummary`), execucao (`TaskSummary`) e agenda (`AgendaSummary`), mas essas leituras ainda vivem em radares separados dentro de `/inbox`, `/execucao` e `/agenda` [VERIFIED: src/components/dashboard/ops-radar.tsx] [VERIFIED: src/components/dashboard/execution-radar.tsx] [VERIFIED: src/components/dashboard/agenda-radar.tsx]. Phase 4 deve consolidar esses sinais em uma tela de comando que responda "onde a operacao esta pressionada agora?" e "qual caminho de milestone faz mais sentido depois?" [VERIFIED: .planning/ROADMAP.md] [ASSUMED].

O segundo eixo e narrativo/arquitetural: o produto deve comunicar OpsCore como plataforma operacional mais ampla que InboxFlow [VERIFIED: context.md] [VERIFIED: arquitetura-macro.md] [VERIFIED: diferenca-entre-inboxflow-e-opscore.md]. Isso exige atualizar copy e metadados que ainda descrevem o app como "Inbox operacional com triagem assistida por IA" ou "Base operacional em construcao", sem fingir que integracoes ou IA avancada ja existem [VERIFIED: src/app/layout.tsx] [VERIFIED: src/app/page.tsx] [VERIFIED: user request].

**Primary recommendation:** planejar a Fase 4 em quatro frentes: contratos/agregado `panorama`, API e rota `/panorama`, UI densa de panorama com navegacao compartilhada, e documentacao/copy de extensibilidade para IA/integracoes futuras [VERIFIED: local repo] [ASSUMED].

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Agregar estados reais de inbox, tarefas e agenda | API / Backend | Database / Storage | A coerencia de `DASH-03` depende de leitura server-side das fontes persistidas, nao de recontagem no browser [VERIFIED: .planning/REQUIREMENTS.md] [VERIFIED: src/db/queries/inbox.ts] [VERIFIED: src/db/queries/tasks.ts] [VERIFIED: src/db/queries/agenda.ts]. |
| Calcular sinais cross-domain | API / Backend | Database / Storage | Sinais como tarefas bloqueadas, itens aguardando resposta e prazos criticos precisam de regras centralizadas e testaveis [VERIFIED: src/types/tasks.ts] [VERIFIED: src/types/agenda.ts] [ASSUMED]. |
| Exibir panorama operacional | Frontend Server | Browser / Client | O padrao atual carrega dados iniciais em Server Component e hidrata interacao no shell client [VERIFIED: src/app/(workspace)/inbox/page.tsx] [VERIFIED: src/app/(workspace)/execucao/page.tsx] [VERIFIED: src/app/(workspace)/agenda/page.tsx]. |
| Filtrar/selecionar sinais no panorama | Browser / Client | API / Backend | Filtros e selecao de UI seguem o padrao dos shells existentes, enquanto a verdade dos dados continua no servidor [VERIFIED: src/components/inbox/workspace-shell.tsx] [VERIFIED: src/components/execution/workspace-shell.tsx] [VERIFIED: src/components/agenda/workspace-shell.tsx]. |
| Comunicar tese de plataforma | Browser / Client | Frontend Server | Copy, metadados, home/entrada e nav sao responsabilidade de apresentacao, com base nas decisoes de produto [VERIFIED: context.md] [VERIFIED: src/app/layout.tsx] [VERIFIED: src/app/page.tsx]. |
| Preparar extensao para IA forte e integracoes futuras | API / Backend | Database / Storage | O v1 deve expor context packets, extension slots e contratos tipados sem chamar servicos externos novos [VERIFIED: .planning/REQUIREMENTS.md] [VERIFIED: user request] [ASSUMED]. |

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| `next` | `15.5.15` instalado [VERIFIED: npm list --depth=0] | App Router, Server Components e route handlers | O app atual usa `src/app/(workspace)` e `src/app/api/*`; a Fase 4 deve continuar esse padrao [VERIFIED: local repo]. |
| `react` / `react-dom` | `19.2.5` instalado [VERIFIED: npm list --depth=0] | Shell interativo, filtros e estados de pending | Os shells atuais usam `useState`, `useEffect` e `useTransition` [VERIFIED: src/components/*/workspace-shell.tsx]. |
| `zod` | `4.3.6` instalado [VERIFIED: npm list --depth=0] | Validar filtros do panorama e contratos de payload se houver mutacao local | Inbox, tarefas e agenda ja centralizam validacao em `src/lib/validation/*` [VERIFIED: src/lib/validation/inbox.ts] [VERIFIED: src/lib/validation/tasks.ts] [VERIFIED: src/lib/validation/agenda.ts]. |
| `drizzle-orm` / `drizzle-kit` | `0.45.2` / `0.31.10` instalados [VERIFIED: npm list --depth=0] | Manter schema futuro e modelagem relacional como contrato | O runtime atual e file-backed, mas `src/db/schema/*` existe para inbox, tasks e agenda [VERIFIED: drizzle.config.ts] [VERIFIED: src/db/schema/*.ts]. |
| `@tanstack/react-table` | `8.21.3` instalado [VERIFIED: npm list --depth=0] | Tabela/lista densa de sinais, se a UI pedir linha selecionavel | Inbox e execucao ja usam a biblioteca para listas operacionais densas [VERIFIED: src/components/inbox/inbox-table.tsx] [VERIFIED: src/components/execution/tasks-table.tsx]. |
| `vitest` + Testing Library | `vitest 3.2.4`, `@testing-library/react 16.3.2` instalados [VERIFIED: npm list --depth=0] | Testes de dominio, API e workspace | A suite atual cobre query modules, route handlers e shells com RTL [VERIFIED: src/test]. |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `lucide-react` | `1.8.0` instalado [VERIFIED: npm list --depth=0] | Icones compactos de sinal, risco, extensao e navegacao | Usar apenas onde reforca affordance, preservando labels textuais e acessibilidade [VERIFIED: package.json] [ASSUMED]. |
| `recharts` | `3.8.1` instalado [VERIFIED: npm list --depth=0] | Graficos pequenos, se houver necessidade de distribuicao visual | Nao e necessario para o v1 se `StatusBlock` e listas de sinais resolverem melhor a leitura operacional [VERIFIED: package.json] [VERIFIED: src/components/dashboard/status-block.tsx] [ASSUMED]. |
| `openai` | `6.34.0` instalado [VERIFIED: npm list --depth=0] | Triagem atual e futura inteligencia assistida | Nao introduzir novas chamadas de IA nesta fase; manter apenas extension points e preservar fallback deterministico existente [VERIFIED: src/lib/triage/service.ts] [VERIFIED: user request]. |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Novo dominio `panorama` [ASSUMED] | Acrescentar campos diretamente em `DashboardSummary` de inbox | Mais rapido inicialmente, mas mistura ownership de inbox com tarefas/agenda e dificulta extensao futura [VERIFIED: src/types/inbox.ts] [ASSUMED]. |
| Rota propria `/panorama` [ASSUMED] | Colocar panorama apenas no `/inbox` existente | Menor navegacao, mas reforca a leitura de InboxFlow e falha no criterio de plataforma ampla [VERIFIED: .planning/ROADMAP.md] [VERIFIED: context.md] [ASSUMED]. |
| Sinais deterministico-regrados [ASSUMED] | Nova recomendacao via LLM agora | Regras locais sao testaveis e respeitam o limite sem IA avancada; LLM novo mudaria o escopo da fase [VERIFIED: user request] [ASSUMED]. |
| `StatusBlock` + listas compactas [ASSUMED] | Dashboard analitico com muitos graficos | Contadores e listas preservam foco operacional; grafico demais aumenta polish sem necessariamente melhorar `DASH-03` [VERIFIED: .planning/research/PITFALLS.md] [ASSUMED]. |

**Installation:**
```bash
npm install
```

**Version verification:** versoes acima foram verificadas por `npm list --depth=0` nesta sessao; a pesquisa recomenda preservar o stack instalado e tratar upgrades como trabalho separado [VERIFIED: npm list --depth=0] [ASSUMED].

## Architecture Patterns

### System Architecture Diagram

```text
File-backed domain stores
  |          |             |
  | inbox    | tasks       | agenda
  v          v             v
getDashboardSummary + getExecutionSummary + getAgendaSummary
  \          |             /
   \         |            /
    v        v           v
      getOperationalPanorama()
       |
       +--> normaliza modulos: intake, execucao, agenda
       +--> calcula pressao operacional e sinais cross-domain
       +--> produz context packet para futura IA
       +--> recomenda proxima direcao de milestone como decisao assistida
       |
       v
GET /api/panorama
       |
       v
/panorama server page -> PanoramaWorkspaceShell
       |
       +--> blocos de saude operacional
       +--> lista de sinais acionaveis
       +--> painel de prontidao para IA/integracoes
       +--> links para /inbox, /execucao e /agenda
```

### Recommended Project Structure

```text
src/
├── app/
│   ├── (workspace)/
│   │   ├── panorama/
│   │   │   ├── page.tsx              # leitura server-first do panorama
│   │   │   ├── loading.tsx           # estado coerente com workspaces atuais
│   │   │   └── error.tsx             # recuperacao operacional
│   │   ├── inbox/page.tsx            # adicionar link Panorama na sidebar
│   │   ├── execucao/page.tsx         # adicionar link Panorama na sidebar
│   │   └── agenda/page.tsx           # adicionar link Panorama na sidebar
│   └── api/
│       └── panorama/route.ts         # GET agregado do panorama
├── components/
│   ├── panorama/
│   │   ├── workspace-shell.tsx
│   │   ├── overview-strip.tsx
│   │   ├── signal-list.tsx
│   │   ├── intelligence-readiness.tsx
│   │   └── milestone-direction.tsx
│   └── dashboard/status-block.tsx    # reutilizar para contadores
├── db/
│   └── queries/panorama.ts           # agregado cross-domain
├── lib/
│   ├── intelligence/context-packet.ts # payload local para IA futura
│   └── validation/panorama.ts         # filtros, se existirem
├── test/
│   ├── panorama-domain.test.ts
│   ├── panorama-api.test.ts
│   └── panorama-workspace.test.tsx
└── types/
    └── panorama.ts
```

### Pattern 1: Aggregate Root de Panorama

**What:** criar `OperationalPanorama` como contrato proprio que compoe resumos existentes e sinais derivados [VERIFIED: src/types/inbox.ts] [VERIFIED: src/types/tasks.ts] [VERIFIED: src/types/agenda.ts] [ASSUMED].

**When to use:** em `GET /api/panorama`, `/panorama/page.tsx` e testes de `DASH-03` [VERIFIED: .planning/REQUIREMENTS.md] [ASSUMED].

**Example:**
```typescript
// Source: padrao local de contracts em src/types/*.ts [VERIFIED: local repo]
export type PanoramaSignalSeverity = "info" | "attention" | "critical";

export interface PanoramaModuleState {
  id: "inbox" | "execution" | "agenda";
  label: string;
  totalCount: number;
  pressureCount: number;
  route: "/inbox" | "/execucao" | "/agenda";
}

export interface PanoramaSignal {
  id: string;
  severity: PanoramaSignalSeverity;
  title: string;
  description: string;
  sourceModule: "inbox" | "execution" | "agenda" | "cross-domain";
  targetRoute: string;
}

export interface OperationalPanorama {
  modules: PanoramaModuleState[];
  signals: PanoramaSignal[];
  intelligenceReadiness: IntelligenceReadinessSnapshot;
  nextMilestoneOptions: NextMilestoneOption[];
}
```

### Pattern 2: Query Agregadora Server-Side

**What:** implementar `getOperationalPanorama()` em `src/db/queries/panorama.ts`, usando `Promise.all` para resumos e leituras minimas de listas/detalhes [VERIFIED: src/app/(workspace)/execucao/page.tsx] [VERIFIED: src/app/(workspace)/agenda/page.tsx] [ASSUMED].

**When to use:** sempre que a tela ou API de panorama precisar estado atualizado [VERIFIED: src/app/api/tasks/route.ts] [VERIFIED: src/app/api/agenda/route.ts] [ASSUMED].

**Example:**
```typescript
// Source: padrao local de workspace payloads em src/app/api/tasks/route.ts [VERIFIED: local repo]
export async function getOperationalPanorama(): Promise<OperationalPanorama> {
  const [inbox, execution, agenda] = await Promise.all([
    getDashboardSummary(),
    getExecutionSummary(),
    getAgendaSummary()
  ]);

  return buildOperationalPanorama({ inbox, execution, agenda });
}
```

### Pattern 3: Sinais Deterministicos e Acionaveis

**What:** gerar sinais a partir de thresholds simples e nomes de modulo, por exemplo "tarefas bloqueadas", "prazos vencidos", "inbox aguardando resposta" e "triagem pendente" [VERIFIED: src/types/inbox.ts] [VERIFIED: src/types/tasks.ts] [VERIFIED: src/types/agenda.ts] [ASSUMED].

**When to use:** na UI de panorama e no context packet de IA futura [VERIFIED: .planning/ROADMAP.md] [ASSUMED].

**Example:**
```typescript
// Source: padrao local de derived summaries em src/db/queries/tasks.ts e agenda.ts [VERIFIED: local repo]
function buildSignals(input: PanoramaSourceSummaries): PanoramaSignal[] {
  return [
    input.agenda.overdueCount > 0
      ? {
          id: "agenda-overdue",
          severity: "critical",
          title: "Prazos vencidos",
          description: `${input.agenda.overdueCount} itens de agenda estao vencidos.`,
          sourceModule: "agenda",
          targetRoute: "/agenda"
        }
      : null
  ].filter((signal): signal is PanoramaSignal => Boolean(signal));
}
```

### Pattern 4: Extension Points Sem Integracao Real

**What:** criar estruturas locais como `IntelligenceReadinessSnapshot`, `IntegrationReadinessSnapshot` ou `ContextPacket` para indicar quais dados ja existem para IA forte e canais externos [VERIFIED: .planning/ROADMAP.md] [VERIFIED: .planning/research/FEATURES.md] [ASSUMED].

**When to use:** apenas como leitura e contrato de futuro, sem chamar API externa nova [VERIFIED: user request] [ASSUMED].

**Example:**
```typescript
// Source: padrao local de separar IA sugerida e revisao humana em src/types/inbox.ts [VERIFIED: local repo]
export interface IntelligenceReadinessSnapshot {
  hasReviewedTriage: boolean;
  hasTaskHistory: boolean;
  hasAgendaRiskSignals: boolean;
  missingSignals: string[];
  recommendedNextMilestone: "intelligence" | "integrations" | "stabilization";
}
```

### Pattern 5: Workspace Server-First

**What:** criar `/panorama` no mesmo padrao das rotas de workspace existentes: page server-side carrega dados iniciais, shell client renderiza filtros/selecoes/refresh [VERIFIED: src/app/(workspace)/inbox/page.tsx] [VERIFIED: src/app/(workspace)/execucao/page.tsx] [VERIFIED: src/app/(workspace)/agenda/page.tsx].

**When to use:** tela principal da Fase 4 [VERIFIED: .planning/ROADMAP.md] [ASSUMED].

### Anti-Patterns to Avoid

- **Dashboard fake:** nao preencher panorama com fixtures, copy aspiracional ou cards estaticos; `DASH-03` exige estados reais [VERIFIED: .planning/REQUIREMENTS.md].
- **Recontagem no cliente:** nao derivar contadores lendo arrays no componente se a regra pertence ao dominio [VERIFIED: src/db/queries/inbox.ts] [VERIFIED: src/db/queries/tasks.ts] [VERIFIED: src/db/queries/agenda.ts].
- **IA nova como entrega principal:** nao chamar LLM para gerar "insights" da Fase 4; esta fase prepara extensao, nao entrega agente avancado [VERIFIED: user request].
- **Integracao placeholder:** nao criar conectores WhatsApp/email/calendario vazios nem mocks que parecam sincronizacao real [VERIFIED: user request] [VERIFIED: .planning/REQUIREMENTS.md].
- **Panorama escondido dentro do inbox:** nao resolver a tese de plataforma apenas ampliando o radar do inbox, pois o produto precisa aparecer como orquestracao ampla [VERIFIED: .planning/ROADMAP.md] [VERIFIED: context.md] [ASSUMED].
- **Copiar snapshots como verdade atual:** snapshots de origem preservam contexto historico, mas o panorama deve distinguir snapshot historico de estado atual quando cruzar dominios [VERIFIED: src/types/tasks.ts] [VERIFIED: src/types/agenda.ts] [ASSUMED].

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Agregado cross-domain | Recontagem ad hoc dentro de componente React | `src/db/queries/panorama.ts` com helpers testados [VERIFIED: local repo] [ASSUMED] | Mantem coerencia entre API, SSR e testes [VERIFIED: src/app/api/tasks/route.ts] [VERIFIED: src/app/api/agenda/route.ts]. |
| Validacao de filtros do panorama | `if/else` espalhado na rota | Zod em `src/lib/validation/panorama.ts`, se a rota aceitar query params [VERIFIED: src/lib/validation/*.ts] [ASSUMED] | O projeto ja usa Zod para filtros de inbox, tasks e agenda [VERIFIED: local repo]. |
| UI de indicadores | Novo sistema visual de cards/graficos | `StatusBlock`, `ops-radar` e padroes de workspace existentes [VERIFIED: src/components/dashboard/status-block.tsx] [VERIFIED: src/app/globals.css] | Preserva linguagem visual e reduz risco de dashboard-polish sem verdade operacional [VERIFIED: .planning/research/PITFALLS.md]. |
| Insights de IA | Prompt novo sem avaliacao | Sinais deterministicos + `ContextPacket` para IA futura [VERIFIED: user request] [ASSUMED] | Mantem a fase verificavel e deixa clara a fronteira para milestones futuras [VERIFIED: .planning/ROADMAP.md]. |
| Integrações externas | OAuth/conectores fake | `IntegrationReadinessSnapshot` local e documentado [VERIFIED: user request] [ASSUMED] | Prepara decisao futura sem abrir superficie de auth/sync [VERIFIED: .planning/REQUIREMENTS.md]. |
| Navegacao duplicada | Sidebar copiada divergente em cada shell | Atualizar links existentes de forma consistente ou extrair componente compartilhado se reduzir duplicacao real [VERIFIED: src/components/*/workspace-shell.tsx] [ASSUMED] | Inbox, execucao e agenda ja duplicam o mesmo nav; adicionar Panorama aumenta risco de drift [VERIFIED: local repo]. |

**Key insight:** a entrega da Fase 4 e uma camada de sintese e decisao, nao uma nova fonte de dados independente [VERIFIED: .planning/ROADMAP.md] [ASSUMED].

## Concrete Existing Patterns

| Pattern | Existing Source | Apply In Phase 4 |
|---------|-----------------|------------------|
| Contratos compartilhados por dominio | `src/types/inbox.ts`, `src/types/tasks.ts`, `src/types/agenda.ts` [VERIFIED: local repo] | Criar `src/types/panorama.ts` [ASSUMED]. |
| Query module file-backed/domain-derived | `src/db/queries/inbox.ts`, `src/db/queries/tasks.ts`, `src/db/queries/agenda.ts` [VERIFIED: local repo] | Criar `src/db/queries/panorama.ts` sem store proprio inicialmente [ASSUMED]. |
| API route com payload agregado | `src/app/api/tasks/route.ts`, `src/app/api/agenda/route.ts` [VERIFIED: local repo] | Criar `src/app/api/panorama/route.ts` retornando `{ panorama }` ou objeto direto [ASSUMED]. |
| Server-first workspace | `src/app/(workspace)/agenda/page.tsx` [VERIFIED: local repo] | Criar `src/app/(workspace)/panorama/page.tsx` [ASSUMED]. |
| Shell client com `notice`, `errorMessage`, `useTransition` | `src/components/agenda/workspace-shell.tsx` [VERIFIED: local repo] | Criar `src/components/panorama/workspace-shell.tsx` com refresh leve [ASSUMED]. |
| Radar compacto | `src/components/dashboard/ops-radar.tsx`, `execution-radar.tsx`, `agenda-radar.tsx` [VERIFIED: local repo] | Criar overview de modulo + lista de sinais [ASSUMED]. |
| RTL workspace tests com `next/navigation` mock | `src/test/execution-workspace.test.tsx`, `src/test/agenda-workspace.test.tsx` [VERIFIED: local repo] | Criar `src/test/panorama-workspace.test.tsx` [ASSUMED]. |

## Likely Files to Modify

| File | Action | Reason |
|------|--------|--------|
| `src/types/panorama.ts` | create [ASSUMED] | Contrato central de `OperationalPanorama`, sinais, readiness e opcao de milestone [ASSUMED]. |
| `src/db/queries/panorama.ts` | create [ASSUMED] | Agregar resumos reais de inbox/tasks/agenda [VERIFIED: src/db/queries/*.ts]. |
| `src/app/api/panorama/route.ts` | create [ASSUMED] | Expor refresh client e contrato API testavel [VERIFIED: src/app/api/tasks/route.ts]. |
| `src/app/(workspace)/panorama/page.tsx` | create [ASSUMED] | Superficie principal de `DASH-03` [VERIFIED: .planning/ROADMAP.md]. |
| `src/app/(workspace)/panorama/loading.tsx` / `error.tsx` | create [ASSUMED] | Manter estados de workspace como nas fases anteriores [VERIFIED: src/app/(workspace)/agenda/loading.tsx] [VERIFIED: src/app/(workspace)/agenda/error.tsx]. |
| `src/components/panorama/*` | create [ASSUMED] | UI densa de panorama, sinais e readiness [ASSUMED]. |
| `src/components/inbox/workspace-shell.tsx` | modify [ASSUMED] | Adicionar link `Panorama` na sidebar [VERIFIED: local repo]. |
| `src/components/execution/workspace-shell.tsx` | modify [ASSUMED] | Adicionar link `Panorama` na sidebar [VERIFIED: local repo]. |
| `src/components/agenda/workspace-shell.tsx` | modify [ASSUMED] | Adicionar link `Panorama` na sidebar [VERIFIED: local repo]. |
| `src/app/page.tsx` | modify [ASSUMED] | Atualizar entrada/copy para OpsCore como plataforma ou encaminhar para `/panorama` [VERIFIED: src/app/page.tsx] [VERIFIED: context.md]. |
| `src/app/layout.tsx` | modify [ASSUMED] | Atualizar metadata para plataforma operacional, nao apenas inbox [VERIFIED: src/app/layout.tsx] [VERIFIED: arquitetura-macro.md]. |
| `src/app/globals.css` | modify [ASSUMED] | Estilos de panorama reaproveitando workspace/radar existentes [VERIFIED: src/app/globals.css]. |
| `src/test/panorama-domain.test.ts` | create [ASSUMED] | Provar agregacao de estados reais e sinais [ASSUMED]. |
| `src/test/panorama-api.test.ts` | create [ASSUMED] | Provar `GET /api/panorama` [ASSUMED]. |
| `src/test/panorama-workspace.test.tsx` | create [ASSUMED] | Provar UI, nav, sinais e readiness [ASSUMED]. |
| `README.md`, `context.md` ou docs estrategicos selecionados | modify lightly [ASSUMED] | Corrigir narrativa se ainda apontar app como Fase 1/inbox-only [VERIFIED: README.md] [VERIFIED: context.md]. |

## Recommended Data Contract

| Contract | Fields | Source |
|----------|--------|--------|
| `PanoramaModuleState` | `id`, `label`, `totalCount`, `pressureCount`, `route`, `summaryLabel` [ASSUMED] | Derivado de `DashboardSummary`, `TaskSummary`, `AgendaSummary` [VERIFIED: src/types/*.ts]. |
| `PanoramaSignal` | `id`, `severity`, `title`, `description`, `sourceModule`, `targetRoute` [ASSUMED] | Derivado de contadores e listas existentes [VERIFIED: src/db/queries/*.ts]. |
| `OperationalPressure` | `intake`, `execution`, `schedule`, `overall` [ASSUMED] | Composicao de high/waiting/unreviewed, blocked/unassigned/aged, overdue/today/upcoming [VERIFIED: src/types/inbox.ts] [VERIFIED: src/types/tasks.ts] [VERIFIED: src/types/agenda.ts]. |
| `IntelligenceReadinessSnapshot` | `hasReviewedTriage`, `hasTaskHistory`, `hasAgendaRiskSignals`, `missingSignals`, `recommendedNextMilestone` [ASSUMED] | Prepara milestone de IA sem chamar IA nova [VERIFIED: user request]. |
| `NextMilestoneOption` | `id`, `label`, `rationale`, `evidence`, `risk` [ASSUMED] | Suporta criterio de decidir entre inteligencia e canais externos [VERIFIED: .planning/ROADMAP.md]. |

## Common Pitfalls

### Pitfall 1: Somar metricas que nao tem o mesmo escopo

**What goes wrong:** o panorama mistura itens fechados, ativos, filtrados e nao filtrados sem explicitar criterio [VERIFIED: src/db/queries/agenda.ts] [ASSUMED].  
**Why it happens:** `GET /api/agenda` retorna `items` filtrados, mas `summary` global, e esse padrao pode ser reutilizado sem decisao explicita [VERIFIED: src/app/api/agenda/route.ts].  
**How to avoid:** definir que `/panorama` sempre usa resumo global da operacao e sinalizar filtros apenas para drill-down [ASSUMED].  
**Warning signs:** `PanoramaModuleState.totalCount` muda quando o usuario aplica filtro visual local [ASSUMED].

### Pitfall 2: Perder a diferenca entre snapshot historico e estado atual

**What goes wrong:** um prazo ligado a tarefa mostra status antigo porque leu `originSnapshot` como se fosse fonte atual [VERIFIED: src/types/agenda.ts] [ASSUMED].  
**Why it happens:** tarefas e agenda preservam snapshots de origem por rastreabilidade historica [VERIFIED: src/types/tasks.ts] [VERIFIED: src/types/agenda.ts].  
**How to avoid:** usar snapshots para contexto e queries atuais para contadores de panorama quando o sinal depender de estado corrente [ASSUMED].  
**Warning signs:** uma tarefa concluida continua aparecendo como bloqueada no panorama por causa de snapshot antigo [ASSUMED].

### Pitfall 3: Chamar qualquer texto de "inteligencia"

**What goes wrong:** a fase parece entregar IA forte, mas so mostra copy generica ou recomendacao sem prova [VERIFIED: .planning/research/PITFALLS.md] [ASSUMED].  
**Why it happens:** a palavra "Inteligencia" no titulo da fase puxa escopo para LLM antes de haver requisito v1 [VERIFIED: .planning/ROADMAP.md] [VERIFIED: .planning/REQUIREMENTS.md].  
**How to avoid:** chamar a entrega de "readiness" ou "sinais operacionais", mantendo IA avancada como opcao de proxima milestone [VERIFIED: user request] [ASSUMED].  
**Warning signs:** nova rota chama OpenAI fora de triagem ou cria prompt de recomendacao transversal nesta fase [VERIFIED: src/lib/triage/service.ts] [ASSUMED].

### Pitfall 4: Comunicar OpsCore como InboxFlow ampliado

**What goes wrong:** a UI e metadata continuam dizendo "Inbox operacional", entao o criterio de plataforma ampla falha [VERIFIED: src/app/layout.tsx] [VERIFIED: src/app/page.tsx] [VERIFIED: .planning/ROADMAP.md].  
**Why it happens:** a Fase 1 nasceu inbox-first e a home ainda reflete esse momento [VERIFIED: .planning/phases/01-base-operacional/*-SUMMARY.md] [VERIFIED: src/app/page.tsx].  
**How to avoid:** atualizar home/metadata/sidebar/copy do panorama para enfatizar inbox + tarefas + agenda + visibilidade operacional [VERIFIED: arquitetura-macro.md] [ASSUMED].  
**Warning signs:** o primeiro viewport nao menciona tarefas, agenda ou operacao ampla [ASSUMED].

### Pitfall 5: Transformar a Fase 4 em BI

**What goes wrong:** surgem graficos, filtros e dashboards demais sem melhorar a decisao operacional [VERIFIED: .planning/research/PITFALLS.md] [ASSUMED].  
**Why it happens:** "panorama" pode ser lido como analytics amplo em vez de leitura operacional acionavel [ASSUMED].  
**How to avoid:** limitar a v1 a contadores, sinais e links de drill-down para os workspaces existentes [VERIFIED: src/components/dashboard/*.tsx] [ASSUMED].  
**Warning signs:** a fase exige nova biblioteca visual ou ranking complexo sem requisito correspondente [ASSUMED].

### Pitfall 6: Nao fechar as pendencias de traceability

**What goes wrong:** `DASH-03` passa, mas `DASH-01`/`DASH-02` continuam marcados pending em `REQUIREMENTS.md`, criando confusao de estado [VERIFIED: .planning/REQUIREMENTS.md] [VERIFIED: .planning/STATE.md].  
**Why it happens:** as fases executadas registraram dashboard real nos summaries, mas o arquivo de requirements ainda lista DASH-01/DASH-02 como pending [VERIFIED: .planning/phases/01-base-operacional/*-SUMMARY.md] [VERIFIED: .planning/REQUIREMENTS.md].  
**How to avoid:** o planner deve incluir uma tarefa documental curta para reconciliar status de dashboard se a verificacao confirmar cobertura [ASSUMED].  
**Warning signs:** Phase 4 reimplementa DASH-01/DASH-02 em vez de consumir os radares existentes [ASSUMED].

## Code Examples

### Route Handler de Panorama

```typescript
// Source: padrao local de src/app/api/tasks/route.ts e src/app/api/agenda/route.ts [VERIFIED: local repo]
import { NextResponse } from "next/server";

import { getOperationalPanorama } from "@/db/queries/panorama";

export async function GET() {
  const panorama = await getOperationalPanorama();
  return NextResponse.json(panorama);
}
```

### Page Server-First

```typescript
// Source: padrao local de src/app/(workspace)/agenda/page.tsx [VERIFIED: local repo]
import { WorkspaceShell } from "@/components/panorama/workspace-shell";
import { getOperationalPanorama } from "@/db/queries/panorama";

export default async function PanoramaWorkspacePage() {
  const panorama = await getOperationalPanorama();

  return <WorkspaceShell initialPanorama={panorama} />;
}
```

### Teste de Dominio

```typescript
// Source: padrao local de src/test/dashboard-review.test.ts e src/test/agenda-domain.test.ts [VERIFIED: local repo]
it("derives panorama signals from real inbox, task and agenda stores", async () => {
  await seedReviewedInboxWithWaitingResponse();
  await seedBlockedTask();
  await seedOverdueAgendaItem();

  const panorama = await getOperationalPanorama();

  expect(panorama.signals.map((signal) => signal.id)).toEqual(
    expect.arrayContaining(["inbox-waiting-response", "execution-blocked", "agenda-overdue"])
  );
});
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Dashboard restrito ao inbox [VERIFIED: src/types/inbox.ts] | Panorama cross-domain sobre inbox, tarefas e agenda [VERIFIED: .planning/ROADMAP.md] [ASSUMED] | Fase 4 do roadmap [VERIFIED: .planning/ROADMAP.md] | Planejamento deve criar contrato `panorama`, nao apenas inflar `DashboardSummary` [ASSUMED]. |
| IA como chamada direta no fluxo [VERIFIED: src/lib/triage/service.ts] | IA futura atras de context packets e readiness local [VERIFIED: user request] [ASSUMED] | Limite v1 informado no pedido [VERIFIED: user request] | Evita escopo de agente/autonomia e preserva verificabilidade [ASSUMED]. |
| Integracao como feature v1 [VERIFIED: .planning/REQUIREMENTS.md] | Integracao como extensao futura preparada por contratos e narrativa [VERIFIED: user request] [ASSUMED] | Roadmap v2 [VERIFIED: .planning/REQUIREMENTS.md] | Phase 4 informa decisao de milestone sem implementar canal externo [ASSUMED]. |
| Home de "base operacional em construcao" [VERIFIED: src/app/page.tsx] | Entrada que comunica plataforma operacional ampla [VERIFIED: context.md] [ASSUMED] | Fase 4 de fechamento v1 [VERIFIED: .planning/ROADMAP.md] | Melhora criterio de produto sem criar marketing falso [ASSUMED]. |

**Deprecated/outdated:**
- Usar `src/db/queries/dashboard.ts` como sinonimo de panorama amplo esta defasado, porque hoje ele apenas reexporta `getDashboardSummary` de inbox [VERIFIED: src/db/queries/dashboard.ts].
- Descrever o produto como "Inbox operacional com triagem assistida por IA" esta estreito para a Fase 4, porque o roadmap ja entregou tarefas e agenda [VERIFIED: src/app/layout.tsx] [VERIFIED: .planning/STATE.md].
- Criar `pages/api` ou uma nova arquitetura de API esta fora do padrao atual App Router [VERIFIED: src/app/api].

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | A Fase 4 deve criar rota propria `/panorama` | Summary / Architecture Patterns | Se o usuario preferir home única ou dashboard dentro de `/inbox`, nav e testes mudam. |
| A2 | `panorama` deve ser contrato proprio e nao extensao de `DashboardSummary` | Summary / Standard Stack | Se o time quiser menor diff, o plano pode parecer maior que o necessario. |
| A3 | Sinais deterministicos sao suficientes para v1 | Patterns / Pitfalls | Se houver expectativa de IA real, a fase precisaria AI-SPEC/evals e escopo maior. |
| A4 | A persistencia runtime deve continuar file-backed sem store proprio de panorama | User Constraints / Architecture | Se o panorama precisar historico persistido, sera necessario schema/store/evento novo. |
| A5 | Atualizar copy e metadata e suficiente para comunicar tese de plataforma sem redesign completo | Common Pitfalls / Likely Files | Se a expectativa for portfolio/landing visual, sera necessaria UI-SPEC adicional. |
| A6 | Reconciliar status documental de DASH-01/DASH-02 e util nesta fase | Common Pitfalls | Se o projeto tratar requirements antigos como historico imutavel, esta tarefa deve ser omitida. |

## Open Questions (RESOLVED)

1. **RESOLVED: `/panorama` sera uma rota de workspace separada, com home/copy apontando para a plataforma ampla.**  
   - What we know: `src/app/page.tsx` ainda mostra uma home generica de construcao, e os workspaces vivem em `/inbox`, `/execucao` e `/agenda` [VERIFIED: src/app/page.tsx] [VERIFIED: local repo].  
   - Resolution: usar um workspace separado `/panorama` e atualizar a home/copy para apontar para OpsCore como plataforma operacional mais ampla; nao forcar redirect da home, salvo se a execucao encontrar esse caminho como simplificacao tecnica [ASSUMED].

2. **RESOLVED: o panorama nao persistira historico de saude operacional na Fase 4.**  
   - What we know: as fases anteriores persistem entidades operacionais, nao snapshots de analytics [VERIFIED: src/db/queries/*.ts].  
   - Resolution: calcular o snapshot atual de panorama a partir dos stores existentes de inbox, tarefas e agenda; nao criar store, schema ou snapshots historicos de panorama nesta fase [ASSUMED].

3. **RESOLVED: a proxima direcao sera representada como `NextMilestoneOption[]` baseada em evidencias, sem decisao automatizada.**  
   - What we know: o criterio 4 pede base suficiente para decidir entre aprofundar inteligencia ou abrir canais externos [VERIFIED: .planning/ROADMAP.md].  
   - Resolution: produzir `NextMilestoneOption[]` com evidencias simples, por exemplo "dados de historico suficientes para IA" vs "modelo de intake estavel para canais"; nao automatizar, finalizar ou substituir a decisao de produto [ASSUMED].

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|-------------|-----------|---------|----------|
| Node.js | Next.js, build e testes | sim [VERIFIED: shell node --version] | `v24.6.0` [VERIFIED: shell node --version] | — |
| npm | scripts e dependencia local | sim [VERIFIED: shell npm --version] | `11.5.1` [VERIFIED: shell npm --version] | — |
| `rg` | auditoria de codigo | sim [VERIFIED: shell Get-Command rg] | caminho local via Codex vendor [VERIFIED: shell Get-Command rg] | `Select-String` se necessario [ASSUMED]. |
| `gsd-sdk` | workflow GSD automatizado | nao [VERIFIED: shell Get-Command gsd-sdk] | — | inferir por arquivos locais, como feito nesta pesquisa [VERIFIED: user request]. |
| OpenAI API key | triagem existente e IA futura | nao probado [VERIFIED: src/lib/triage/service.ts] | — | fallback deterministico existente para triagem quando `OPENAI_API_KEY` ausente [VERIFIED: src/lib/triage/service.ts]. |

**Missing dependencies with no fallback:**
- Nenhuma dependencia externa bloqueia o planejamento ou implementacao v1 de panorama, porque a recomendacao usa o stack instalado e dados locais [VERIFIED: npm list --depth=0] [ASSUMED].

**Missing dependencies with fallback:**
- `gsd-sdk` esta ausente, mas o workflow pode continuar por leitura direta dos arquivos `.planning` [VERIFIED: shell Get-Command gsd-sdk] [VERIFIED: user request].

## Test Strategy

Nyquist formal esta desabilitado por `.planning/config.json`, mas a fase ainda deve ter testes focados com Vitest/RTL [VERIFIED: .planning/config.json] [VERIFIED: package.json].

| Area | File | Coverage | Command |
|------|------|----------|---------|
| Dominio | `src/test/panorama-domain.test.ts` [ASSUMED] | agrega inbox/tasks/agenda reais, gera sinais, calcula readiness, nao cria store proprio [ASSUMED] | `npm run test -- --run src/test/panorama-domain.test.ts` [VERIFIED: package.json]. |
| API | `src/test/panorama-api.test.ts` [ASSUMED] | `GET /api/panorama` retorna contrato completo e reflete mutacoes nos stores [ASSUMED] | `npm run test -- --run src/test/panorama-api.test.ts` [VERIFIED: package.json]. |
| UI | `src/test/panorama-workspace.test.tsx` [ASSUMED] | renderiza modulos, sinais, readiness, links `/inbox` `/execucao` `/agenda`, refresh e empty state [ASSUMED] | `npm run test -- --run src/test/panorama-workspace.test.tsx` [VERIFIED: package.json]. |
| Regression | existing suites [VERIFIED: src/test] | garantir que nav/copy nao quebrou inbox, execucao ou agenda [ASSUMED] | `npm run test -- --run src/test/inbox-workspace.test.tsx src/test/execution-workspace.test.tsx src/test/agenda-workspace.test.tsx` [VERIFIED: package.json]. |
| Full gate | all tests/lint/build [VERIFIED: AGENTS.md] | confirmar entrega substancial [VERIFIED: AGENTS.md] | `npm run lint`, `npm run build`, `npm run test -- --run` [VERIFIED: AGENTS.md]. |

## Security Domain

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control |
|---------------|---------|------------------|
| V2 Authentication | no [VERIFIED: local repo] | Nao ha modulo de auth; nao inventar usuario/sessao nesta fase [VERIFIED: local repo]. |
| V3 Session Management | no [VERIFIED: local repo] | Fora do escopo porque nao ha login/sessao [VERIFIED: local repo]. |
| V4 Access Control | parcialmente [ASSUMED] | Panorama deve ser read-only em v1 e nao deve adicionar mutacoes sensiveis [ASSUMED]. |
| V5 Input Validation | yes se houver filtros [VERIFIED: src/lib/validation/*.ts] | Usar Zod para filtros/query params como nos outros dominios [VERIFIED: local repo]. |
| V6 Cryptography | no [VERIFIED: local repo] | Nao ha requisito criptografico novo [VERIFIED: .planning/REQUIREMENTS.md]. |

### Known Threat Patterns for Next.js + file-backed panorama

| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| Parametros de filtro invalidos no panorama | Tampering | Validar com Zod antes de chamar query agregadora [VERIFIED: src/lib/validation/tasks.ts] [ASSUMED]. |
| Vazamento de dados brutos em "context packet" futuro | Information Disclosure | Expor apenas campos resumidos e tipados; nao incluir `descriptionRaw` por padrao [VERIFIED: src/types/inbox.ts] [ASSUMED]. |
| Sinais inconsistentes por leituras sequenciais | Tampering / Reliability | Usar `Promise.all` e uma funcao agregadora unica por request [VERIFIED: src/app/api/tasks/route.ts] [ASSUMED]. |
| "Readiness" confundido com integracao real | Spoofing / Product risk | Rotular extension points como preparacao e manter ausencia de OAuth/conectores nos testes [VERIFIED: user request] [ASSUMED]. |
| Crescimento de payload com listas completas | Denial of Service | Limitar sinais e listas criticas a poucos itens, como `AgendaSummary.criticalItems` ja faz [VERIFIED: src/db/queries/agenda.ts] [ASSUMED]. |

## Recommended Plan Decomposition

### Wave 1: Domain Contract and Aggregation

- Criar `src/types/panorama.ts` com modulos, sinais, readiness e opcoes de milestone [ASSUMED].
- Criar `src/db/queries/panorama.ts` que compoe `getDashboardSummary`, `getExecutionSummary`, `getAgendaSummary` e helpers de sinais [VERIFIED: src/db/queries/*.ts] [ASSUMED].
- Criar `src/test/panorama-domain.test.ts` cobrindo stores reais e casos vazios/pressionados [ASSUMED].

### Wave 2: API and Server Route

- Criar `src/app/api/panorama/route.ts` com `GET` do agregado [ASSUMED].
- Criar `src/app/(workspace)/panorama/page.tsx`, `loading.tsx` e `error.tsx` no padrao dos workspaces existentes [VERIFIED: src/app/(workspace)/agenda]. 
- Criar `src/test/panorama-api.test.ts` cobrindo contrato e atualizacao apos dados reais [ASSUMED].

### Wave 3: Panorama UI and Navigation

- Criar componentes em `src/components/panorama/*` usando `StatusBlock`, listas compactas e links de drill-down [VERIFIED: src/components/dashboard/status-block.tsx] [ASSUMED].
- Adicionar link `Panorama` nas sidebars de inbox, execucao e agenda; considerar extrair nav compartilhada se a duplicacao ficar arriscada [VERIFIED: src/components/*/workspace-shell.tsx] [ASSUMED].
- Criar `src/test/panorama-workspace.test.tsx` e atualizar testes de workspace existentes para nav [ASSUMED].

### Wave 4: Product Narrative and Extension Readiness

- Atualizar `src/app/layout.tsx` e `src/app/page.tsx` para comunicar OpsCore como plataforma operacional, sem prometer integracoes ou agentes inexistentes [VERIFIED: src/app/layout.tsx] [VERIFIED: src/app/page.tsx] [ASSUMED].
- Atualizar README/docs selecionados se a descricao ainda estiver presa ao estado de Fase 1 [VERIFIED: README.md] [ASSUMED].
- Reconciliar `REQUIREMENTS.md`/`STATE.md` se a verificacao confirmar `DASH-03` e a cobertura previa de DASH-01/DASH-02 [VERIFIED: .planning/REQUIREMENTS.md] [ASSUMED].

## Out-of-Scope Boundaries for Planner

- Nao implementar Google Calendar, Outlook, WhatsApp, Instagram, email, CRM, webhooks ou OAuth [VERIFIED: user request] [VERIFIED: .planning/REQUIREMENTS.md].
- Nao criar agente autonomo, motor de recomendacao LLM transversal ou automacao por regra [VERIFIED: user request] [VERIFIED: .planning/REQUIREMENTS.md].
- Nao migrar o runtime para Postgres real nesta fase [VERIFIED: local repo] [ASSUMED].
- Nao transformar `/execucao` ou `/agenda` em dashboard completo; eles continuam workspaces especializados [VERIFIED: src/app/(workspace)/execucao/page.tsx] [VERIFIED: src/app/(workspace)/agenda/page.tsx] [ASSUMED].
- Nao substituir os radares existentes; o panorama consome e sintetiza os dominios [VERIFIED: src/components/dashboard/*.tsx] [ASSUMED].

## Sources

### Primary (HIGH confidence)

- `AGENTS.md` - estrutura, comandos, idioma, testes e restricoes de contribuicao [VERIFIED: local repo].
- `.planning/ROADMAP.md` - objetivo, requisito e success criteria da Fase 4 [VERIFIED: local repo].
- `.planning/REQUIREMENTS.md` - `DASH-03`, v2 integrations/AI e out-of-scope [VERIFIED: local repo].
- `.planning/STATE.md` - estado atual e fases concluidas [VERIFIED: local repo].
- `.planning/config.json` - `nyquist_validation: false` [VERIFIED: local repo].
- `.planning/research/SUMMARY.md`, `ARCHITECTURE.md`, `FEATURES.md`, `PITFALLS.md` - tese, fluxo, riscos e limites [VERIFIED: local repo].
- Phase summaries and `03-VERIFICATION.md` - confirmacao de inbox, tarefas e agenda implementados [VERIFIED: local repo].
- `src/types/inbox.ts`, `src/types/tasks.ts`, `src/types/agenda.ts` - contratos existentes [VERIFIED: local repo].
- `src/db/queries/inbox.ts`, `src/db/queries/tasks.ts`, `src/db/queries/agenda.ts`, `src/db/queries/dashboard.ts` - queries, summaries e stores [VERIFIED: local repo].
- `src/app/api/*` and `src/app/(workspace)/*` - padroes App Router/API/workspace [VERIFIED: local repo].
- `src/components/dashboard/*`, `src/components/*/workspace-shell.tsx` - padroes UI e nav [VERIFIED: local repo].
- `src/test/*` - padroes de teste existentes [VERIFIED: local repo].
- `package.json` and `npm list --depth=0` - scripts e versoes instaladas [VERIFIED: local repo] [VERIFIED: npm list].

### Secondary (MEDIUM confidence)

- `context.md`, `visao-do-produto.md`, `arquitetura-macro.md`, `diferenca-entre-inboxflow-e-opscore.md` - narrativa de produto e diferenciacao estrategica [VERIFIED: local repo].
- Checkpoint `2026-04-20-2108-phase-4-planning-start.md` - continuidade de workflow e ausencia de `gsd-sdk` [VERIFIED: local checkpoint].

### Tertiary (LOW confidence)

- Itens marcados `[ASSUMED]` representam recomendacoes de planejamento sem uma decisao explicita de Phase 4 `CONTEXT.md` [VERIFIED: local repo].

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - baseado em `package.json`, `npm list --depth=0` e padroes ja executados [VERIFIED: local repo].
- Architecture: HIGH - a recomendacao consome dominios e APIs ja verificadas, sem nova tecnologia obrigatoria [VERIFIED: local repo].
- Data contracts: MEDIUM - formatos sao recomendados a partir dos contratos atuais, mas nao existem ainda [ASSUMED].
- Pitfalls: MEDIUM - riscos sao derivados de artefatos locais e limites do pedido, mas alguns dependem de preferencia de UX sem `04-UI-SPEC.md` [VERIFIED: user request] [ASSUMED].
- Plan decomposition: MEDIUM - waves seguem padrao das fases anteriores, mas a granularidade final cabe ao planner [VERIFIED: phase summaries] [ASSUMED].

**Research date:** 2026-04-21 [VERIFIED: local clock]  
**Valid until:** 2026-05-21 [ASSUMED]
