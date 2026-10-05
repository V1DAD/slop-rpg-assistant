6.4 Sistema de comandos de texto (requisito central)
  Um console/chat único aceita comandos que começam com "/". Texto sem "/" é
  mensagem de chat da mesa (opcional, mas barato de fazer).

  Princípio: INTERFACE GRÁFICA E COMANDOS CHAMAM A MESMA CAMADA DE SERVIÇO.
  Nunca duplique regras de negócio. Fluxo:
      UI ou texto  ->  Command (objeto tipado)  ->  CommandHandler
      ->  policy (permissão)  ->  transação no banco  ->  evento no log
      ->  broadcast WebSocket filtrado por visibilidade

  Parser:
    - Gramática simples e tolerante: /comando alvo args... com aspas para nomes
      com espaço ("Sir Aldric").
    - Alvo por nome parcial, case-insensitive e sem acento ("thor" -> Thorin).
      Se ambíguo, responder com a lista de candidatos (não adivinhar).
    - Aliases (/d = /dano, /c = /curar).
    - Autocomplete no console: comandos, nomes de personagens e de itens.
    - Histórico com seta para cima.
    - Mensagens de erro claras em pt-BR, com exemplo de uso.
    - /ajuda e /ajuda <comando> geradas a partir do registro de comandos.

  Comandos mínimos (GM = só Mestre; P = jogador, só na própria ficha):
    /rolar 2d6+3 [desc]          P e GM   rolagem pública; "/rolar -s ..." = secreta (GM)
    /dano <alvo> <n> [tipo]      GM       reduz HP (consome HP temporário antes)
    /curar <alvo> <n>            GM       aumenta HP até o máximo
    /hp <alvo> <n|+n|-n>         GM       define ou ajusta HP
    /hpmax <alvo> <n>            GM
    /temp <alvo> <n>             GM       HP temporário
    /status <alvo> <attr> <v>    GM       define atributo (aceita +n/-n)
    /condicao <alvo> <nome> [rodadas]   GM    aplica condição
    /remover-condicao <alvo> <nome>     GM
    /dar <alvo> <item> [qtd]     GM       adiciona item (do catálogo ou criando)
    /tirar <alvo> <item> [qtd]   GM       remove item
    /usar <item>                 P        consome/usa item próprio
    /equipar <item>, /desequipar <item>   P
    /xp <alvo> <n>               GM       dá XP (calcula nível se houver tabela)
    /ouro <alvo> <+n|-n> [moeda] GM
    /ficha [alvo]                P (próprio) / GM (qualquer) — resumo no console
    /inventario [alvo]           idem
    /encontro iniciar|parar|proximo|add <npc> [iniciativa]   GM
    /npc criar <nome> <hpmax>    GM
    /musica play|pause|proxima|anterior|seek <mm:ss>|vol <0-100>   GM
    /playlist <nome>             GM       carrega e toca playlist
    /desfazer                    GM       desfaz último evento reversível
    /ajuda

  Teste do parser: crie uma bateria de testes (>= 40 casos) cobrindo aspas,
  acentos, ambiguidade, permissões, argumentos faltando e injeção de texto
  estranho.

