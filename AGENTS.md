# RPG Table Manager — instruções permanentes para o agente

Aplicação web para mesa de RPG (1 Mestre + jogadores): fichas, inventário,
comandos de texto, tempo real (WebSocket) e música sincronizada.
Roda em Docker, acessada via Tailscale. Interface e comandos em pt-BR.

## Como trabalhar (IMPORTANTE: seu contexto é pequeno)
- A especificação completa está em docs/SPEC_COMPLETO.txt. NÃO leia esse
  arquivo inteiro. Ela está dividida em docs/spec/*.md. Leia SOMENTE os
  arquivos que o prompt da fase atual indicar.
- Faça uma fase por vez. Não adiante fases futuras e não adicione
  funcionalidades não pedidas (ideias vão para docs/IDEIAS_FUTURAS.md).
- Trabalhe em passos pequenos: leia o arquivo antes de editar, rode os
  testes depois de cada mudança relevante.
- Se perceber que perdeu contexto, releia este arquivo, rode `git log
  --oneline` e `git status`, e veja a seção "Progresso" abaixo.
- Nunca declare algo pronto sem ter rodado os testes. Se não conseguiu
  rodar algo, diga isso claramente.

## Regras de arquitetura
- Monorepo: /server  /web  /shared  /docs
- Stack: Node 20 + TypeScript + Fastify, SQLite (better-sqlite3),
  WebSocket (ws), Zod, argon2 (ou bcrypt), React + Vite, Vitest.
- Camadas: routes/ws -> commands/services -> policy -> repositories(db).
  Sem SQL fora dos repositórios. Sem regra de negócio em handlers HTTP/WS.
- Tipos e schemas Zod ficam em /shared (fonte única de verdade).
- Permissões são verificadas NO SERVIDOR, em um módulo central (policy).
  O frontend só esconde botões.
- UI e comandos de texto usam a MESMA camada de serviço.
- Valide toda entrada com Zod. SQL sempre parametrizado.
- Textos da interface em pt-BR, preparados para i18n futuro.
- Decisões não definidas na spec: escolha a opção mais simples e registre
  em docs/DECISOES.md.

## Ambiente
- Fique SEMPRE dentro do diretório do projeto. Use caminhos relativos.
  Nunca procure arquivos a partir de `/` nem acesse fora deste diretório.
- Comandos úteis (crie estes scripts no package.json raiz):
  `npm test` (todos os testes), `npm run build`, `npm run lint`,
  `npm run seed`.
- Docker: use `docker compose`. Se `docker` não existir, tente
  `podman compose`. Se nenhum funcionar, valide com `npm run build &&
  npm start`, teste o /healthz com curl e avise no resumo final.
- Playwright (E2E) só deve ser instalado se o prompt da fase pedir.
- Commits no padrão Conventional Commits, um por fase (ou por etapa clara).

## Progresso (marque [x] ao concluir uma fase, com commit)
- [ ] fase0  Fundação
- [ ] fase1  Autenticação e usuários
- [ ] fase2  Fichas, HP, condições
- [ ] fase3  Itens, inventário e log
- [ ] fase4a WebSocket autenticado e filtro de visibilidade
- [ ] fase4b Reconexão, ack, versionamento
- [ ] fase5a Parser de comandos e console
- [ ] fase5b Comandos de jogo
- [ ] fase6  Encontros e NPCs
- [ ] fase7a Biblioteca de música e upload
- [ ] fase7b Sincronização de música
- [ ] fase8  Endurecimento, Tailscale e documentação
- [ ] fase9  Extras (opcional)
