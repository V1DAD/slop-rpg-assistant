--------------------------------------------------------------------------------
1. VISÃO GERAL
--------------------------------------------------------------------------------
Uma aplicação web usada por 1 Mestre (GM) e N jogadores (tipicamente 3 a 8)
durante sessões de RPG de mesa. Funções principais:

  a) Gerenciar fichas: vida (HP), status/atributos, condições, itens, dinheiro,
     XP/nível, notas.
  b) Cada jogador só vê e (dentro de limites) edita o que é DELE. O Mestre vê
     e edita tudo.
  c) Todo gerenciamento pode ser feito de DUAS formas equivalentes:
        - Interface gráfica (botões, formulários, barras de vida, drag-and-drop)
        - Comandos de texto num console/chat (ex.: "/dano Thorin 7")
  d) Player de música sincronizado: o Mestre controla playlists e todos os
     clientes ouvem a mesma faixa, no mesmo ponto, ao mesmo tempo.
  e) Tudo em tempo real (WebSocket): quando o Mestre reduz o HP de alguém, a
     tela do jogador atualiza na hora.
  f) Roda 100% localmente em um container Docker e é acessado remotamente
     via Tailscale (sem expor nada à internet pública).

Idioma da interface e dos comandos: Português do Brasil (pt-BR). Prepare os
textos para internacionalização futura, mas não implemente outros idiomas agora.

--------------------------------------------------------------------------------
2. REQUISITOS NÃO FUNCIONAIS
--------------------------------------------------------------------------------
- Usuários simultâneos: até ~10. Não otimize para escala; otimize para
  simplicidade, robustez e baixa manutenção.
- Responsivo: jogadores usarão celular com frequência. Mobile-first.
- Persistência: os dados sobrevivem a reinício do container (volume Docker).
- Segurança: ver seção 8. Nenhum dado de um jogador pode vazar para outro,
  nem por API, nem por WebSocket, nem por comando de texto.
- Latência de sincronização de música: desvio máximo aceitável entre clientes
  de ~150 ms em rede Tailscale normal.
- Observabilidade mínima: logs estruturados e endpoint /healthz.
- Código com testes automatizados nas partes críticas (permissões, parser de
  comandos, lógica de HP/itens, sincronização de relógio).

--------------------------------------------------------------------------------
3. STACK SUGERIDA (pode trocar se justificar em DECISOES.md)
--------------------------------------------------------------------------------
Backend ......... Node.js 20 + TypeScript + Fastify
Tempo real ...... WebSocket (biblioteca "ws" ou Socket.IO)
Banco ........... SQLite (better-sqlite3) em arquivo no volume /data
                  + migrações versionadas (ex.: drizzle-kit ou SQL puro)
Validação ....... Zod em TODA entrada (HTTP, WebSocket, comandos)
Senhas .......... argon2 (preferido) ou bcrypt
Frontend ........ React + Vite + TypeScript (ou Svelte, se preferir menos código)
                  CSS: Tailwind ou CSS modules. Sem frameworks pesados de UI.
Áudio ........... Web Audio API / elemento <audio> com arquivos locais
Testes .......... Vitest (unidade) + Playwright (um fluxo E2E básico)
Container ....... Dockerfile multi-stage + docker-compose.yml
Rede ............ Tailscale (ver seção 9)

Monorepo simples:
  /server   /web   /shared (tipos e schemas Zod compartilhados)   /docs

