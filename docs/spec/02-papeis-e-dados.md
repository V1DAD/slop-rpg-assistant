--------------------------------------------------------------------------------
4. PAPÉIS E PERMISSÕES
--------------------------------------------------------------------------------
Papéis: GM (Mestre) e PLAYER (Jogador).

GM pode:
  - Criar/editar/remover contas de jogadores e resetar senhas
  - Ver e editar TODAS as fichas, itens, status
  - Criar itens-modelo (catálogo) e distribuí-los
  - Criar NPCs/monstros (fichas sem login) e rastrear o HP deles em "encontro"
  - Controlar o player de música (play, pause, seek, próxima, volume mestre,
    playlists, fila)
  - Executar todos os comandos
  - Ver o log de eventos completo
  - Marcar campos como "ocultos ao jogador" (ex.: HP de NPC, item amaldiçoado
    cuja natureza o jogador ainda não descobriu)

PLAYER pode:
  - Ver apenas a PRÓPRIA ficha (e, opcionalmente, um resumo público do grupo
    se o GM habilitar: nome, HP em barra sem números, condições)
  - Editar apenas campos que o GM liberar (padrão: notas, uso/equipar itens,
    gastar/recuperar recursos próprios, HP temporário próprio)
  - Rolar dados (/rolar) e ver o resultado no log da mesa
  - Ouvir a música; ajustar o PRÓPRIO volume local e dar mute (isso não afeta
    os outros)
  - Usar comandos permitidos ao seu papel, SEMPRE restritos à própria ficha

Regra de ouro: a verificação de permissão acontece NO SERVIDOR, em um único
módulo central (policy). O frontend apenas esconde botões; nunca é a barreira.

--------------------------------------------------------------------------------
5. MODELO DE DADOS (ponto de partida; refine conforme necessário)
--------------------------------------------------------------------------------
users          id, username (único), password_hash, role, created_at, disabled
characters     id, owner_user_id (nullable p/ NPC), name, kind (PC|NPC),
               class_or_concept, level, xp, hp_current, hp_max, hp_temp,
               currency (JSON: moedas), notes, data (JSON livre p/ campos
               específicos do sistema), hidden_fields (JSON)
attributes     id, character_id, key, label, value, modifier(opcional), order
               (ex.: Força, Destreza... totalmente configurável, nada fixo)
conditions     id, character_id, name, description, duration_rounds(nullable)
item_defs      id, name, description, weight, value, tags (JSON), properties
               (JSON), image(optional), secret_notes (só GM)
inventory      id, character_id, item_def_id, quantity, equipped, custom_name,
               custom_notes, hidden_to_player (bool)
event_log      id, ts, actor_user_id, character_id(nullable), type, payload
               (JSON), visibility (PUBLIC|GM_ONLY|PRIVATE_TO:<user>)
tracks         id, title, artist, file_path, duration_sec, tags
playlists      id, name, created_by
playlist_items id, playlist_id, track_id, position
sessions_auth  id, user_id, token_hash, expires_at, user_agent
settings       key, value (ex.: "jogadores veem resumo do grupo", volume mestre)

Sistema de regras agnóstico: NÃO hard-code D&D. Ofereça "templates de ficha"
(JSON) que definem atributos, recursos e campos. Entregue 2 templates prontos:
"Genérico" e "D&D 5e simplificado". Permita ao GM duplicar/editar templates.

