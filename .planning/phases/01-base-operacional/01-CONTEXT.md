# Phase 1: Base Operacional - Context

**Gathered:** 2026-04-17
**Status:** Ready for planning

<domain>
## Phase Boundary

Esta fase entrega o nucleo operacional inicial do OpsCore: uma fila unica de entradas, enriquecimento inicial por IA e uma leitura clara do que exige atencao agora.

O foco e triagem e visibilidade, nao execucao profunda. Ainda nao inclui conversao completa para tarefas, agenda operacional ou integracoes reais com canais externos.

</domain>

<decisions>
## Implementation Decisions

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

### the agent's Discretion
- Definir o layout exato do painel de detalhe, desde que preserve leitura rapida e nao esconda os sinais operacionais principais.
- Escolher a melhor representacao visual do dashboard inicial, desde que mantenha poucos blocos e foco em acao imediata.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Escopo do projeto
- `.planning/ROADMAP.md` — escopo, objetivo e criterios de sucesso da Fase 1
- `.planning/REQUIREMENTS.md` — requisitos INBX, TRIA e DASH mapeados para a fase
- `.planning/PROJECT.md` — principios, restricoes e narrativa de portfolio do produto
- `.planning/STATE.md` — estado atual do projeto e foco ativo

### Contexto estrategico do repositorio
- `context.md` — tese curta do produto e papel estrategico
- `visao-do-produto.md` — definicao do problema, solucao e resultado desejado
- `arquitetura-macro.md` — modulos centrais e regra de posicionamento mais amplo que InboxFlow

### Referencia de decisao e posicionamento
- `spec-tecnico-inicial.md` — referencia historica de posicionamento; ler como contexto, nao como direcao obrigatoria de escopo

### Referencias externas usadas nesta discussao
- `https://m1.material.io/components/lists.html` — base para recomendar lista densa em vez de cards para triagem
- `https://m1.material.io/components/data-tables.html` — referencia para operacoes desktop com ordenacao e manipulacao de dados
- `https://developer.android.com/guide/navigation/navigation-3/recipes/material-listdetail` — padrao list-detail adaptativo para inbox e painel de detalhe
- `https://www.intercom.com/help/en/articles/10223008-setting-up-the-inbox` — orientacao de organizacao de inbox operacional
- `https://www.intercom.com/help/en/articles/6989006-prioritize-responding-to-customers-who-ve-been-waiting-longest` — ordenacao por sinais operacionais relevantes
- `https://support.zendesk.com/hc/en-us/articles/4408894213018-About-system-ticket-rules` — referencia para estados e comportamento de tickets
- `https://support.zendesk.com/hc/en-us/articles/4408882066202-Fine-Tuning-How-to-build-your-ideal-workflow` — relacao entre prioridade e operacao/SLA
- `https://www.microsoft.com/en-us/research/blog/guidelines-for-human-ai-interaction-design/` — base para humano no loop e IA explicavel
- `https://support.atlassian.com/analytics/docs/create-charts-on-your-dashboard/` — referencia para dashboard enxuto e orientado por visualizacao util

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- Nenhum codigo de produto existe ainda neste repositorio; a implementacao pode definir a primeira linguagem visual e estrutura do app.

### Established Patterns
- O padrao dominante atual e documental: arquivos pequenos, foco estrategico e linguagem em portugues.
- A arquitetura conceitual ja fixa cinco modulos conectados: inbox, classificacao/IA, tasks, agenda e dashboard.

### Integration Points
- A Fase 1 deve estabelecer entidades e estados que sustentem Fase 2 (tarefas) e Fase 3 (agenda) sem exigir essas capacidades agora.
- O campo `origem` e o vinculo da triagem precisam nascer preparados para futuras integracoes reais da Fase 5.

</code_context>

<specifics>
## Specific Ideas

- O produto deve parecer plataforma operacional seria, nao apenas um inbox bonito.
- A tela principal deve transmitir capacidade de triagem e controle, com narrativa de portfolio forte.
- O dashboard deve funcionar como radar de operacao, nao como BI pesado.
- O racional das escolhas deve ficar salvo explicitamente para evitar que planejamento posterior reduza o produto a um clone de help desk.

</specifics>

<deferred>
## Deferred Ideas

- Automacao ou decisao autonoma de IA alem de sugestoes assistidas
- Integracoes reais com WhatsApp, Instagram, email ou outros canais
- Conversao completa para tarefas e ownership operacional profundo
- Agenda operacional e follow-ups vinculados ao fluxo
- Panorama analitico amplo e inteligencia operacional mais forte

</deferred>

---

*Phase: 01-base-operacional*
*Context gathered: 2026-04-17*
