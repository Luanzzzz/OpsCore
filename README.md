# OpsCore

## Hub do projeto
- [[projects/opscore/context|Contexto]]
- [[projects/opscore/visao-do-produto|Visão do produto]]
- [[projects/opscore/arquitetura-macro|Arquitetura macro]]
- [[projects/opscore/roadmap|Roadmap]]
- [[projects/opscore/diferenca-entre-inboxflow-e-opscore|Diferença entre InboxFlow e OpsCore]]

## Status
Repositório híbrido: documentação estratégica + app web com inbox, tarefas, agenda e panorama operacional em `/panorama`.

O app consolida estados reais dos workspaces existentes para mostrar sinais de pressão, readiness para inteligência/integrações futuras e opções de direção para a próxima milestone. Integrações externas reais e IA avançada continuam fora do v1.

## App web local

### Comandos
- `npm install`
- `npm run dev`
- `npm run lint`
- `npm run build`
- `npm run test -- --run`

### Variáveis de ambiente
- `DATABASE_URL` — banco local da operação
- `OPENAI_API_KEY` — chave da triagem assistida por IA

Copie os nomes a partir de `.env.example` e preencha os valores reais no ambiente local.

## Atualização de rumo
Para execução imediata e conteúdo da próxima semana, o corte concreto mais forte dessa visão passou a ser o [[projects/agent-control-room/README|Agent Control Room]], que será implementado com OpenCode como runtime experimental.

Arquivos relacionados:
- [[projects/opscore/execucao-com-opencode|Execução com OpenCode]]
- [[projects/opscore/spec-tecnico-inicial|Spec técnico inicial]]

## Estrutura atual
- Documentação estratégica na raiz do repositório
- App Next.js em `src/`
- Testes de domínio, API e workspaces em `src/test/`
- Planejamento GSD em `.planning/`
