--------------------------------------------------------------------------------
9. DOCKER E TAILSCALE
--------------------------------------------------------------------------------
Docker:
  - Dockerfile multi-stage: build do web + server, imagem final enxuta
    (node:20-alpine ou distroless), usuário não-root, HEALTHCHECK em /healthz.
  - O servidor Node serve a API, o WebSocket e os arquivos estáticos do
    frontend (um único serviço, uma única porta, ex.: 3000).
  - docker-compose.yml com:
        volumes:  ./data -> /data (SQLite)   ./music -> /music
        env:      NODE_ENV, PORT, SESSION_SECRET, ADMIN_USER, ADMIN_PASSWORD,
                  TRUST_PROXY, TZ=America/Sao_Paulo
        restart:  unless-stopped
  - Arquivo .env.example documentado.

Tailscale — documente e implemente a opção A como padrão, e descreva a B:

  Opção A (recomendada): Tailscale no HOST
    - O host que roda o Docker já está no tailnet.
    - Publicar a porta só no localhost: "127.0.0.1:3000:3000".
    - Usar "tailscale serve" para expor com HTTPS automático dentro do tailnet:
          tailscale serve --bg 3000
      Isso entrega https://<maquina>.<tailnet>.ts.net com certificado válido
      (necessário para cookies Secure e melhor compatibilidade de áudio).
    - NÃO usar "tailscale funnel" (isso expõe à internet pública).

  Opção B: sidecar Tailscale no docker-compose
    - Serviço "tailscale" (imagem oficial) com TS_AUTHKEY, TS_STATE_DIR,
      TS_SERVE_CONFIG; o app usa network_mode: "service:tailscale".
    - Documente as variáveis, onde gerar a auth key e como persistir o estado.

  Como os JOGADORES acessam (documentar passo a passo, em linguagem leiga):
    - Cada jogador instala o Tailscale e entra no seu tailnet (convite de
      usuário) OU o Mestre compartilha a máquina ("Share node") com a conta
      Tailscale de cada jogador. Explique as duas formas e a diferença.
    - Sugerir ACL: jogadores só enxergam a porta do servidor da mesa, nada
      mais da rede do Mestre.
    - Passo a passo com prints textuais: instalar -> logar -> abrir URL ->
      adicionar à tela inicial do celular (PWA).

  Configurar TRUST_PROXY corretamente para obter o IP real atrás do
  "tailscale serve".

PWA (opcional, barato): manifest + service worker mínimo só para "instalar" o
app no celular; NÃO fazer cache agressivo de dados da ficha.

