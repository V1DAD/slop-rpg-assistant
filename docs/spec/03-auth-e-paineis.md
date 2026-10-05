--------------------------------------------------------------------------------
6. FUNCIONALIDADES DETALHADAS
--------------------------------------------------------------------------------

6.1 Autenticação
  - Tela de login (usuário + senha). Sem cadastro público.
  - Primeiro boot: se não houver GM, a aplicação mostra uma tela única de
    "criar conta do Mestre" (ou lê ADMIN_USER/ADMIN_PASSWORD de variável de
    ambiente na primeira inicialização). Depois disso, a tela some.
  - O GM cria contas dos jogadores e define uma senha temporária; o jogador
    deve trocá-la no primeiro login.
  - Sessão via cookie httpOnly + SameSite=Lax (+ Secure quando em HTTPS),
    tokens opacos guardados com hash no banco, expiração deslizante (ex.: 14 dias)
  - Logout e "encerrar todas as sessões".
  - Rate limiting no login (ex.: 5 tentativas/minuto por IP+usuário).

6.2 Painel do jogador
  - Cabeçalho com nome, nível, barra de HP (atual/máx/temp), condições.
  - Abas: Ficha | Inventário | Notas | Log da mesa | Música (mini-player).
  - Inventário: lista com quantidade, equipar/desequipar, usar (consome 1),
    descartar, ver descrição. Peso total e carga se habilitado.
  - Edição inline com confirmação visual; mudanças aparecem em tempo real.
  - Funciona bem no celular (botões grandes, sem hover obrigatório).

6.3 Painel do Mestre
  - Visão geral: cards de todos os jogadores com HP, condições, ações rápidas
    (+/- HP, aplicar condição, dar item, dar XP).
  - Gerenciador de encontro: lista de NPCs/monstros com HP, iniciativa
    (ordem, turno atual, rodada), botão "próximo turno" (decrementa duração
    das condições).
  - Catálogo de itens: criar/editar/duplicar; arrastar para um jogador ou
    usar o comando /dar.
  - Gerenciador de usuários/fichas.
  - Console de comandos fixo no rodapé (ver 6.4).
  - Log de eventos filtrável, com desfazer (undo) dos últimos N eventos
    reversíveis (dano, cura, item dado/retirado, XP).

