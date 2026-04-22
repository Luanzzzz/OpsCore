---
phase: 03-coordenacao-de-agenda
plan: 04
subsystem: agenda-contextual-actions
status: complete
tags:
  - agenda
  - inbox
  - execution
  - tests
key-files:
  created:
    - src/components/agenda/schedule-dialog.tsx
    - src/test/agenda-workspace.test.tsx
  modified:
    - src/components/inbox/workspace-shell.tsx
    - src/components/detail/item-detail-panel.tsx
    - src/components/execution/workspace-shell.tsx
    - src/components/detail/task-detail-panel.tsx
    - src/test/execution-workspace.test.tsx
    - src/app/globals.css
metrics:
  focused-tests: 25
---

# Plan 03-04 Summary

## Objective

Fechar a fase conectando criacao contextual de agenda aos fluxos de inbox e tarefas, preservando `/agenda` como visao unificada principal.

## Commits

| Task | Commit | Description |
|------|--------|-------------|
| 1 | uncommitted | Criado `ScheduleDialog` reutilizavel e acoes `Agendar follow-up` / `Agendar prazo`. |
| 2 | uncommitted | Adicionada cobertura RTL para agenda, execucao e contrato de inbox. |

## Deliverables

- `ScheduleDialog` cria payload compativel com `createAgendaItemSchema`.
- Inbox envia POST `/api/agenda` com `linkedType: "inbox"` e `linkedId` do item selecionado.
- Execucao envia POST `/api/agenda` com `linkedType: "task"` e `linkedId` da tarefa selecionada.
- Usuario permanece no fluxo atual apos criar agenda contextual, com notice curto e link de navegacao para `/agenda`.
- `agenda-workspace.test.tsx` cobre renderizacao, filtros, selecao, reagendamento, conclusao e contrato de agendamento a partir de inbox.
- `execution-workspace.test.tsx` cobre agendamento contextual de tarefa sem quebrar testes da fase 2.

## Verification

- `npm run test -- --run src/test/agenda-domain.test.ts src/test/agenda-api.test.ts src/test/agenda-workspace.test.tsx src/test/execution-workspace.test.tsx` passou com 25 testes.
- `rg` confirmou `ScheduleDialog`, acoes contextuais, POST `/api/agenda` e `linkedType` correto para inbox e task.

## Deviations

- `ExecutionRadar` nao recebeu resumo adicional de agenda; mantivemos apenas acao contextual e navegacao para `/agenda` para evitar transformar `/execucao` na agenda completa.
- Commits atomicos nao foram criados porque o workspace inteiro esta sem rastreamento git local util nesta sessao.

## Self-Check

PASSED. O plano 03-04 atende AGND-01 e preserva AGND-02/AGND-03 com cobertura automatizada focada.
