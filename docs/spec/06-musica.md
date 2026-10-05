6.6 Música sincronizada
  Fonte do áudio (escolha MVP, mantenha interface para outras no futuro):
    MVP: arquivos de áudio locais (mp3/ogg/opus/flac) enviados pelo GM para
    o volume /music (upload pela UI e/ou pasta monitorada). O servidor serve
    os arquivos por rota autenticada com suporte a HTTP Range.
    Extra (fase final, opcional): faixa via URL de stream/YouTube embed. Avise
    claramente na doc as limitações (política de autoplay, bloqueio de embeds,
    termos de uso). Não use scraping/baixadores.

  Arquitetura de sincronização (servidor é a autoridade):
    - Estado de reprodução no servidor:
        { trackId, status: playing|paused|stopped, anchorServerTime,
          anchorPositionSec, queue[], loop, shuffle, masterVolume, revision }
      Posição atual = anchorPositionSec + (agora_servidor - anchorServerTime)
      quando "playing".
    - Sincronização de relógio estilo NTP: cada cliente faz N pings
      (ex.: 8 no início e a cada 30 s), mede RTT, escolhe as amostras de
      menor RTT e calcula offset = serverTime - (clientSend + RTT/2).
      Use performance.now() + Date.now() adequadamente.
    - Ao receber estado, o cliente calcula a posição alvo e faz seek.
      Correção contínua de deriva: a cada 2-5 s compara currentTime com o
      alvo; se desvio < ~40 ms ignora; entre 40 e 300 ms ajusta
      playbackRate levemente (0.97-1.03); acima de 300 ms faz seek direto.
    - Pré-carregar (preload) a próxima faixa da fila para transição sem gap.
    - Entrada tardia: quem entra no meio entra na posição correta.
    - Política de autoplay dos navegadores: exigir um clique no botão
      "Entrar no áudio da mesa" para destravar o AudioContext; mostrar estado
      claro (conectado/sincronizando/mutado/bloqueado).
    - Jogador controla só o próprio volume/mute localmente.
    - Efeitos sonoros/ambiência (SFX): botão simples do GM para tocar um
      efeito curto sincronizado (ex.: trovão) sobre a música. (Fase opcional.)
    - Mostrar no UI, em modo debug, o offset do relógio e o desvio atual.
  Testes: simular dois clientes com relógios defasados e RTT variável e
  verificar que a posição calculada converge dentro da tolerância.

