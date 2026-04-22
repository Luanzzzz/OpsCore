# Roadmap: OpsCore

**Created:** 2026-04-17
**Granularity:** Standard
**Coverage:** 17 v1 requirements mapped to 4 phases

## Summary

| # | Phase | Goal | Requirements | Success Criteria | UI hint |
|---|-------|------|--------------|------------------|---------|
| 1 | Base Operacional | Consolidar inbox, triagem inicial e visibilidade basica da operacao | INBX-01, INBX-02, INBX-03, TRIA-01, TRIA-02, TRIA-03, TRIA-04, DASH-01, DASH-02 | 4 | yes |
| 2 | Execucao de Trabalho | Converter demanda em trabalho operacional rastreavel | TASK-01, TASK-02, TASK-03, TASK-04 | 4 | yes |
| 3 | Coordenacao de Agenda | Integrar follow-ups, prazos e compromissos ao fluxo operacional | AGND-01, AGND-02, AGND-03 | 3 | yes |
| 4 | Panorama e Inteligencia | Fechar a visao operacional ampla e preparar crescimento da IA | DASH-03 | 4 | yes |

## Phase 1: Base Operacional

**Goal:** Criar o nucleo do produto com fila unica de entradas, enriquecimento inicial por IA e leitura clara de prioridades.

**Requirements:** INBX-01, INBX-02, INBX-03, TRIA-01, TRIA-02, TRIA-03, TRIA-04, DASH-01, DASH-02

**Plans:** 4 plans

Plans:
- [x] 01-01-PLAN.md — Bootstrap do app, tooling inicial, base de testes e documentacao do workspace hibrido
- [x] 01-04-PLAN.md — Contratos do dominio, persistencia canonica e APIs de cadastro/listagem/detalhe da fila unica
- [x] 01-02-PLAN.md — Triagem assistida por IA, revisao humana e agregados reais do dashboard
- [x] 01-03-PLAN.md — Interface inbox-first com lista densa, cadastro, detalhe e radar operacional

**Success Criteria**
1. Operador consegue registrar e revisar entradas em uma fila unica com contexto suficiente para decidir o proximo passo.
2. Cada entrada exibe sugestoes de categoria, urgencia, proxima acao e resumo contextual.
3. A fila pode ser priorizada por estado operacional sem depender de planilhas externas.
4. O dashboard mostra gargalos, urgencias e itens aguardando resposta a partir de dados reais da fila.

## Phase 2: Execucao de Trabalho

**Goal:** Permitir que itens triados virem tarefas rastreaveis com ownership e progresso operacional.

**Requirements:** TASK-01, TASK-02, TASK-03, TASK-04

**Plans:** 4 plans

Plans:
- [x] 02-01-PLAN.md — Fundacao do dominio de tarefas, persistencia file-backed, idempotencia de conversao e agregados do workspace
- [x] 02-02-PLAN.md — Rotas App Router para conversao, backlog de execucao, detalhe e mutacoes de ownership/status
- [x] 02-03-PLAN.md — Fundacao UI da mesa de execucao em `/execucao` com rota server-first e navegacao Inbox/Tarefas
- [x] 02-04-PLAN.md — Componentes densos da mesa de execucao, estilos finais e testes de workspace

**Success Criteria**
1. Operador consegue converter uma entrada em tarefa mantendo o vinculo com a origem.
2. Cada tarefa possui responsavel, prioridade e status atualizavel.
3. O historico operacional preserva a relacao entre item recebido e trabalho em execucao.
4. A operacao consegue diferenciar backlog de entrada do backlog de execucao.

## Phase 3: Coordenacao de Agenda

**Goal:** Trazer follow-ups, vencimentos e compromissos para dentro do mesmo fluxo operacional.

**Requirements:** AGND-01, AGND-02, AGND-03

**Plans:** 4 plans

Plans:
- [x] 03-01-PLAN.md — Fundacao do dominio de agenda, entidade vinculada, persistencia file-backed e risco temporal
- [x] 03-02-PLAN.md — Rotas App Router para agenda, criacao/listagem/detalhe/reagendamento e status
- [x] 03-03-PLAN.md — Workspace `/agenda` com lista densa, detalhe, filtros, radar temporal e navegacao
- [x] 03-04-PLAN.md — Agendamento contextual a partir de inbox/tarefas, testes de workspace e verificacao final

**Success Criteria**
1. Operador consegue agendar follow-ups e prazos a partir de entradas ou tarefas.
2. Vencimentos e compromissos aparecem em uma visao unica orientada a operacao.
3. Itens vencidos ou proximos do prazo ficam evidentes para tomada de acao.

## Phase 4: Panorama e Inteligencia

**Goal:** Consolidar a leitura operacional ampla do sistema e preparar a expansao para IA mais forte e integracoes futuras.

**Requirements:** DASH-03

**Plans:** 5 plans

Plans:
- [x] 04-01-PLAN.md — Contratos, context packet e aggregate owner cross-domain do panorama
- [x] 04-02-PLAN.md — API read-only e rota server-first `/panorama`
- [x] 04-03-PLAN.md — UI final do panorama com componentes, shell e testes RTL
- [x] 04-04-PLAN.md — Navegacao compartilhada, CSS e regressao dos workspaces
- [x] 04-05-PLAN.md — Narrativa de plataforma, readiness e traceability final

**Success Criteria**
1. O panorama operacional reflete estados reais de inbox, tarefas e agenda de forma coerente.
2. O produto comunica claramente a tese de plataforma mais ampla que o InboxFlow.
3. A arquitetura e o modelo de dados deixam pontos de extensao claros para IA mais forte e integracoes reais.
4. Existe base suficiente para decidir a proxima milestone entre aprofundar inteligencia ou abrir canais externos.

## Notes

- Integracoes reais, IA avancada e automacoes permanecem fora do v1 e entram em milestones futuras.
- A ordem privilegia coesao do fluxo operacional antes de expansao de canais.

---
*Last updated: 2026-04-22 after phase 4 execution verification*
