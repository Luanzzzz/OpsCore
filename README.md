# OpsCore

> Plataforma operacional para capturar entradas, organizar a execução, conectar agenda e mostrar, em um só lugar, o que merece atenção agora.

OpsCore centraliza inbox, tarefas, agenda e panorama operacional em um fluxo rastreável. O objetivo é transformar sinais dispersos em decisões claras, preservando a origem de cada item e expondo a pressão real da operação.

## O que o projeto entrega

- `Inbox` para entrada, triagem e revisão humana.
- `Execução` para converter entradas em tarefas, atribuir responsáveis e acompanhar bloqueios.
- `Agenda` para follow-ups, prazos e compromissos conectados ao trabalho real.
- `Panorama` para ler pressão operacional, readiness e direção da próxima milestone.
- APIs server-side para manter os estados coerentes entre os workspaces.

## Por que existe

Operações digitais costumam falhar no mesmo ponto: mensagens ficam dispersas, urgências se misturam, tarefas perdem contexto e a agenda deixa de refletir o que realmente está em andamento.

OpsCore foi desenhado para corrigir isso com uma base simples:

- uma única visão operacional
- origem vinculada entre inbox, tarefa e agenda
- sinais consolidados por domínio
- transições testáveis e rastreáveis

## Stack

- Next.js 15
- React 19
- TypeScript
- Vitest
- Zod
- Recharts
- Drizzle ORM e Drizzle Kit
- OpenAI SDK para triagem assistida

## Começando

```bash
npm install
```

Depois crie o arquivo de ambiente local a partir do exemplo:

```bash
Copy-Item .env.example .env.local
```

Se estiver no macOS ou Linux:

```bash
cp .env.example .env.local
```

Em seguida, ajuste as variáveis:

- `OPENAI_API_KEY` é necessária para o fluxo de triagem assistida.
- `DATABASE_URL` permanece no template da camada de persistência e acompanha a evolução do projeto.
- `OPENAI_MODEL` é opcional e pode ser usado para sobrescrever o modelo padrão.

Rode o app:

```bash
npm run dev
```

Abra o painel em `http://localhost:3000`.

## Scripts

| Comando | O que faz |
| --- | --- |
| `npm run dev` | Sobe o Next.js em modo desenvolvimento |
| `npm run build` | Gera a build de produção |
| `npm run start` | Executa a build gerada localmente |
| `npm run lint` | Roda as checagens estáticas |
| `npm run test -- --run` | Executa a suíte Vitest em modo não interativo |

## Estrutura principal

- `src/app` - páginas, layouts e rotas de API
- `src/components` - componentes dos workspaces e dos painéis de detalhe
- `src/db/queries` - leitura e escrita dos estados operacionais
- `src/lib` - triagem, inteligência e validação
- `src/test` - testes de domínio, API, UI e fixtures
- `.planning` - planejamento e artefatos GSD do projeto

## Visão do produto

O app atual gira em torno de quatro superfícies principais:

1. `Inbox` para capturar e revisar entradas.
2. `Execução` para transformar entradas em tarefas operacionais.
3. `Agenda` para acompanhar prazos, follow-ups e compromissos.
4. `Panorama` para consolidar pressão operacional e orientar a próxima decisão.

Essa leitura está alinhada com a visão do produto, que busca reduzir fricção entre captura, execução e acompanhamento do trabalho.

## Documentação relacionada

- [Contexto](context.md)
- [Visão do produto](visao-do-produto.md)
- [Arquitetura macro](arquitetura-macro.md)
- [Roadmap](roadmap.md)
- [Spec técnico inicial](spec-tecnico-inicial.md)
- [Execução com OpenCode](execucao-com-opencode.md)
- [Diferença entre InboxFlow e OpsCore](diferenca-entre-inboxflow-e-opscore.md)

## Notas importantes

- O projeto usa stores locais em `.data/` para a fase atual e isola os testes por worker quando necessário.
- A triagem assistida depende da chave da OpenAI; sem ela, o fluxo de IA não fica disponível.
- Os testes cobrem domínio, API e UI para manter o fluxo operacional consistente.
