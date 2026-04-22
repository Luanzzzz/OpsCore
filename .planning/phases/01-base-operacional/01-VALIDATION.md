---
phase: 1
slug: base-operacional
status: draft
nyquist_compliant: true
wave_0_complete: true
created: 2026-04-17
---

# Phase 1 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | `vitest` instalado na Wave 1, com `npm run lint` / `npm run build` como gates complementares |
| **Config file** | `vitest.config.ts` |
| **Quick run command** | `npm run lint` |
| **Full suite command** | `npm run lint && npm run build && npm run test -- --run` |
| **Estimated runtime** | ~30 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npm run lint`
- **After every plan wave:** Run `npm run lint && npm run build && npm run test -- --run`
- **Before `$gsd-verify-work`:** Full suite must be green
- **Max feedback latency:** 30 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 1-01-01 | 01 | 1 | tooling | T-01-01 / T-01-02 | bootstrap nao expoe segredos e mantem shell executavel coerente com o contrato visual | integration | `npm run lint` | ✅ via Plan 01 | ⬜ pending |
| 1-04-01 | 04 | 2 | INBX-01, INBX-02 | T-01-03 / T-01-04 | defaults de status/prioridade e separacao entre `ai_*` e `*_reviewed` permanecem validos | unit | `npm run test -- --run src/test/inbox-domain.test.ts` | ✅ via Plan 04 | ⬜ pending |
| 1-04-02 | 04 | 2 | INBX-01, INBX-02 | T-01-03 / T-01-05 | `POST/GET /api/inbox` e `GET /api/inbox/[id]` validam payload e retornam contratos canonicos | integration | `npm run test -- --run src/test/inbox-api.test.ts` | ✅ via Plan 04 | ⬜ pending |
| 1-02-01 | 02 | 3 | TRIA-01, TRIA-02, TRIA-03, TRIA-04 | T-01-04 / T-01-05 | Structured Outputs nao vazam segredos, preservam `pending -> ready` e nao sobrescrevem campos revisados | unit | `npm run test -- --run src/test/triage-service.test.ts` | ✅ via Plan 02 | ⬜ pending |
| 1-02-02 | 02 | 3 | DASH-01, DASH-02 | T-01-06 / T-01-07 | revisao humana preserva sugestao original e dashboard deriva apenas de dados reais | integration | `npm run test -- --run src/test/dashboard-review.test.ts` | ✅ via Plan 02 | ⬜ pending |
| 1-03-01 | 03 | 4 | INBX-01, INBX-02, INBX-03 | T-01-08 / T-01-09 | UI registra entrada, lista/ordena/filtra sem divergir do servidor | e2e | `npm run test -- --run src/test/inbox-workspace.test.tsx` | ✅ via Plan 03 | ⬜ pending |
| 1-03-02 | 03 | 4 | TRIA-01, TRIA-02, TRIA-03, TRIA-04 | T-01-09 | detalhe permite disparar/reprocessar triagem e revisar sugestoes sem perder trilha da IA | e2e | `npm run test -- --run src/test/triage-review-ui.test.tsx` | ✅ via Plan 03 | ⬜ pending |
| 1-03-03 | 03 | 4 | DASH-01, DASH-02 | T-01-10 | radar operacional reflete alteracoes reais de status/revisao | e2e | `npm run test -- --run src/test/ops-radar.test.tsx` | ✅ via Plan 03 | ⬜ pending |
| 1-03-04 | 03 | 4 | INBX-02, INBX-03 | T-01-10 | loading, empty e error states preservam copy operacional e nao quebram a navegacao principal | integration | `npm run lint && npm run build` | ✅ via Plan 03 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [x] `vitest.config.ts` — entregue no Plan 01
- [x] `src/test/setup.ts` — entregue no Plan 01
- [x] `src/test/factories/inbox.ts` — entregue no Plan 01
- [x] `src/test/inbox-domain.test.ts` — entregue no Plan 01
- [x] `src/test/inbox-api.test.ts` — entregue no Plan 01
- [x] `src/test/triage-service.test.ts` — entregue no Plan 02
- [x] `src/test/dashboard-review.test.ts` — entregue no Plan 02
- [x] `src/test/inbox-workspace.test.tsx` — entregue no Plan 03
- [x] `src/test/triage-review-ui.test.tsx` — entregue no Plan 03
- [x] `src/test/ops-radar.test.tsx` — entregue no Plan 03
- [x] `npm install -D vitest @testing-library/react @testing-library/jest-dom jsdom` — entregue no Plan 01

*A infraestrutura-base de teste deixa de ser uma Wave 0 separada e passa a ser parte explícita do Plan 01.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Densidade visual da lista, legibilidade do detalhe e aderencia ao UI contract | INBX-02, INBX-03 | depende de julgamento visual e ergonomia operacional | abrir a tela principal, validar lista densa, detalhe lateral e CTA `Registrar entrada` em desktop e mobile |
| Clareza da justificativa curta da IA para o operador | TRIA-03, TRIA-04 | qualidade de copy e interpretabilidade exigem leitura humana | triar um item realista, revisar se `categoria`, `urgencia`, `proxima acao`, `resumo` e `justificativa` sao compreensiveis e editaveis |
| Utilidade pratica do radar operacional | DASH-01, DASH-02 | o valor do dashboard depende de leitura operacional, nao apenas de forma | alterar status/revisao de itens e confirmar se o dashboard passa a destacar gargalos, urgencias e aguardando resposta de modo acionavel |

---

## Validation Sign-Off

- [x] All tasks have `<automated>` verify or Wave 0 dependencies
- [x] Sampling continuity: no 3 consecutive tasks without automated verify
- [x] Wave 0 covers all MISSING references
- [x] No watch-mode flags
- [x] Feedback latency < 30s
- [x] `nyquist_compliant: true` set in frontmatter

**Approval:** approved 2026-04-17
