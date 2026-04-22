# Requirements: OpsCore

**Defined:** 2026-04-17
**Core Value:** Transformar entradas dispersas em um fluxo operacional organizado, priorizado e acionavel.

## v1 Requirements

### Inbox

- [ ] **INBX-01**: Usuario pode registrar e visualizar entradas operacionais em uma fila unica
- [ ] **INBX-02**: Usuario pode ver origem, contexto basico e status de cada entrada
- [ ] **INBX-03**: Usuario pode ordenar ou filtrar a fila por prioridade e estado operacional

### Triage IA

- [ ] **TRIA-01**: Usuario pode obter sugestao de categoria para cada entrada
- [ ] **TRIA-02**: Usuario pode obter sugestao de urgencia ou prioridade para cada entrada
- [ ] **TRIA-03**: Usuario pode obter sugestao de proxima acao para cada entrada
- [ ] **TRIA-04**: Usuario pode visualizar um resumo contextual gerado para cada entrada

### Tasks

- [x] **TASK-01**: Usuario pode converter uma entrada em tarefa operacional sem perder o vinculo com a origem
- [x] **TASK-02**: Usuario pode definir responsavel e prioridade para cada tarefa
- [x] **TASK-03**: Usuario pode atualizar status da tarefa ao longo da execucao
- [x] **TASK-04**: Usuario pode consultar tarefas com referencia ao item original que as gerou

### Agenda

- [x] **AGND-01**: Usuario pode criar follow-up ou prazo associado a uma tarefa ou entrada
- [x] **AGND-02**: Usuario pode visualizar compromissos, vencimentos e follow-ups em um fluxo unico
- [x] **AGND-03**: Usuario pode identificar itens vencidos ou proximos do vencimento

### Dashboard

- [ ] **DASH-01**: Usuario pode visualizar gargalos e pendencias operacionais em um dashboard
- [ ] **DASH-02**: Usuario pode identificar itens urgentes e aguardando resposta
- [x] **DASH-03**: Usuario pode acompanhar panorama operacional a partir de estados reais do sistema

## v2 Requirements

### Integrations

- **INTG-01**: Usuario pode conectar canais reais como WhatsApp, Instagram e email
- **INTG-02**: Usuario pode sincronizar entradas externas com o modelo operacional interno

### Advanced IA

- **AIIA-01**: Usuario recebe recomendacoes operacionais mais fortes baseadas em historico
- **AIIA-02**: Usuario recebe resumos transversais sobre contexto de operacao e gargalos

### Automation

- **AUTO-01**: Usuario pode disparar fluxos automaticos a partir de regras operacionais

## Out of Scope

| Feature | Reason |
|---------|--------|
| Aplicativo mobile nativo | Web-first para validar o fluxo central com menor custo |
| Integracoes reais completas em v1 | A base operacional precisa estabilizar antes de multiplicar canais |
| Autonomia total de agentes | O foco inicial e apoio operacional com supervisao humana |
| CRM full-suite | O objetivo e orquestracao operacional, nao cobrir todo o stack comercial |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| INBX-01 | Phase 1 | Pending |
| INBX-02 | Phase 1 | Pending |
| INBX-03 | Phase 1 | Pending |
| TRIA-01 | Phase 1 | Pending |
| TRIA-02 | Phase 1 | Pending |
| TRIA-03 | Phase 1 | Pending |
| TRIA-04 | Phase 1 | Pending |
| DASH-01 | Phase 1 | Pending |
| DASH-02 | Phase 1 | Pending |
| TASK-01 | Phase 2 | Completed |
| TASK-02 | Phase 2 | Completed |
| TASK-03 | Phase 2 | Completed |
| TASK-04 | Phase 2 | Completed |
| AGND-01 | Phase 3 | Completed |
| AGND-02 | Phase 3 | Completed |
| AGND-03 | Phase 3 | Completed |
| DASH-03 | Phase 4 | Completed |

**Coverage:**
- v1 requirements: 17 total
- Mapped to phases: 17
- Unmapped: 0 ✓

---
*Requirements defined: 2026-04-17*
*Last updated: 2026-04-22 after phase 4 execution verification*
