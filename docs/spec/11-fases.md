--------------------------------------------------------------------------------
11. FASES E CRITÉRIOS DE ACEITE
--------------------------------------------------------------------------------

FASE 0 - Fundação
  - Monorepo, TypeScript, lint/format, Vitest, estrutura de pastas, docs
    iniciais, Dockerfile + compose rodando um "hello" com /healthz.
  Aceite: "docker compose up" sobe; /healthz responde 200.

FASE 1 - Autenticação e usuários
  - Banco + migrações, login/logout, sessão, bootstrap do GM, CRUD de
    jogadores pelo GM, troca de senha, rate limit.
  Aceite: jogador loga e vê página vazia; rota protegida sem login retorna 401;
  testes de sessão e rate limit passando.

FASE 2 - Fichas, status, HP, condições (interface gráfica)
  - Templates de ficha, CRUD de personagens, edição de atributos, HP com
    temporário, condições, XP/nível, painel do jogador e do GM.
  Aceite: GM edita HP de um jogador e este NÃO vê nada de outro jogador;
  testes de policy cobrindo leitura/escrita cruzada.

FASE 3 - Itens e inventário
  - Catálogo, inventário, equipar/usar/dar/tirar, itens ocultos, peso.
  Aceite: fluxo completo de dar item pelo GM e usar pelo jogador, tudo
  refletido no log.

FASE 4 - Tempo real
  - WebSocket autenticado, canais com filtro de visibilidade, snapshot de
    reconexão, optimistic locking, indicador de conexão.
  Aceite: dois navegadores; alteração do GM aparece no jogador em < 300 ms;
  derrubar e religar a rede ressincroniza sem recarregar a página.

FASE 5 - Console de comandos
  - Registro de comandos, parser, autocomplete, histórico, /ajuda, /rolar,
    todos os comandos da seção 6.4, /desfazer, log público/privado.
  Aceite: cada comando produz exatamente o mesmo efeito que seu equivalente
  gráfico (mesma camada de serviço); >= 40 testes do parser; jogador não
  consegue usar comando de GM nem mirar outra ficha.

FASE 6 - Encontros e NPCs
  - NPCs, iniciativa, turnos, rodadas, duração de condições, visibilidade
    de HP de NPC.
  Aceite: GM roda um combate de teste completo.

FASE 7 - Música sincronizada
  - Upload/biblioteca, playlists, fila, player do GM, player dos jogadores,
    sincronização de relógio, correção de deriva, entrada tardia, botão de
    destravar áudio, painel debug de offset.
  Aceite: com 3 abas/dispositivos tocando, desvio visível <= 150 ms; trocar
  de faixa, pausar, pular e dar seek propagam para todos; quem entra no meio
  cai na posição certa; testes de relógio passando.

FASE 8 - Endurecimento, Tailscale e documentação
  - Passar toda a checklist da seção 8, backup/exportação, PWA opcional,
    guia Tailscale (opções A e B), guia para os jogadores, README final.
  Aceite: instalação do zero seguindo apenas o README funciona; acesso
  remoto por Tailscale validado; checklist de segurança toda marcada.

FASE 9 (opcional) - Extras
  - SFX sincronizados, tema claro, múltiplas campanhas/mesas, importação de
    fichas, rolagens com macros salvas.

