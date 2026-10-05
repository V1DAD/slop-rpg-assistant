6.5 Tempo real
  - Um único endpoint WebSocket autenticado pelo cookie de sessão.
  - Canais por escopo: "user:<id>", "gm", "table" (público).
  - O servidor decide QUEM recebe cada evento, de acordo com visibility e
    permissões. Nunca envie o estado completo da mesa a um jogador.
  - Reconexão automática com backoff; ao reconectar o cliente pede um
    snapshot do que ele pode ver (ressincronização).
  - Operações do cliente usam IDs de requisição (idempotência) e o servidor
    responde com ack/erro.
  - Concorrência: edições simultâneas na mesma ficha usam versão (campo
    "version"/optimistic locking); conflito -> servidor devolve estado atual.

