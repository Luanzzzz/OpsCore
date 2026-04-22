# OpsCore

## What This Is

OpsCore e uma plataforma operacional com IA para centralizar entradas de operacoes digitais, priorizar demandas e converter esse fluxo em execucao rastreavel. O produto conecta inbox, triagem, tarefas, agenda e visibilidade operacional em um unico sistema para pequenas e medias operacoes que hoje trabalham de forma fragmentada.

## Core Value

Transformar entradas dispersas em um fluxo operacional organizado, priorizado e acionavel.

## Requirements

### Validated

- [x] Converter itens priorizados em tarefas operacionais rastreaveis — Validated in Phase 2: Execucao de Trabalho
- [x] Conectar tarefas e follow-ups com agenda, prazos e compromissos — Validated in Phase 3: Coordenacao de Agenda
- [x] Exibir panorama operacional amplo a partir de inbox, tarefas e agenda — Validated in Phase 4: Panorama e Inteligencia

### Active

- [ ] Centralizar entradas operacionais em um inbox unico com contexto suficiente para triagem
- [ ] Classificar itens com apoio de IA para definir categoria, urgencia e proxima acao
- [ ] Exibir gargalos, pendencias e prioridades em uma visao operacional clara

### Out of Scope

- Aplicativos nativos mobile no primeiro ciclo - web-first e suficiente para validar o fluxo central
- Cobertura completa de integracoes externas desde o inicio - canais reais entram depois da base operacional estabilizada
- Automacoes amplas e autonomas sem supervisao - o foco inicial e organizacao operacional confiavel, nao autonomia total

## Context

- OpsCore nasce como a evolucao mais ambiciosa da linha iniciada com InboxFlow, mas com escopo mais amplo que um simples MVP de triagem.
- A documentacao atual posiciona o produto como plataforma operacional com cinco modulos centrais: inbox, classificacao/IA, tarefas, agenda e dashboard operacional.
- O principal problema identificado e a dispersao de mensagens, prioridades, tarefas, follow-ups e compromissos entre varios canais e ferramentas.
- O projeto ainda esta em desenho estrategico; este planejamento existe para transformar a visao em escopo executavel sem perder a ambicao arquitetural.
- A narrativa de portifolio importa: o produto deve transmitir maturidade tecnica, visao de arquitetura e clareza de produto.
- Current state: Phase 4 complete — OpsCore now has a `/panorama` workspace that consolidates real inbox, task and agenda states, readiness for future intelligence/integrations, and next milestone options.

## Constraints

- **Escopo**: Preservar OpsCore como plataforma ampla, nao apenas como extensao do InboxFlow - a diferenciacao estrategica depende disso.
- **Execucao**: Trabalhar em fatias pequenas e verificaveis - reduz risco de um produto amplo demais travar antes de gerar aprendizado.
- **Produto**: Inbox, triagem, tarefas, agenda e dashboard precisam permanecer conectados no desenho - a proposta perde forca se virar ferramentas soltas.
- **Narrativa**: O produto precisa ser apresentavel como projeto robusto de portfolio - isso afeta priorizacao de UX, arquitetura e coesao.

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Inicializar o projeto como OpsCore, nao como Agent Control Room | O usuario instruiu explicitamente a ignorar o desvio registrado em arquivo fora de lugar | ✓ Good |
| Operar em modo YOLO | O usuario quer reduzir atrito de aprovacoes e seguir automaticamente | ✓ Good |
| Usar pesquisa, plan check e verifier habilitados | Mantem rigor no fluxo mesmo com auto-aprovacao | — Pending |
| Comecar pela base operacional antes de integracoes reais | A base de inbox, triagem e visibilidade sustenta o restante da plataforma | — Pending |
| Manter panorama como aggregate read-only sem persistencia propria | Evita duplicar stores e prepara IA/integracoes futuras com payload resumido | ✓ Good |

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition**
1. Requirements invalidated? -> Move to Out of Scope with reason
2. Requirements validated? -> Move to Validated with phase reference
3. New requirements emerged? -> Add to Active
4. Decisions to log? -> Add to Key Decisions
5. "What This Is" still accurate? -> Update if drifted

**After each milestone**
1. Full review of all sections
2. Core Value check - still the right priority?
3. Audit Out of Scope - reasons still valid?
4. Update Context with current state

---
*Last updated: 2026-04-22 after phase 4 execution verification*
