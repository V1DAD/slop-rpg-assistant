--------------------------------------------------------------------------------
8. SEGURANÇA (checklist obrigatório)
--------------------------------------------------------------------------------
  [ ] Autorização por recurso em TODA rota e em TODO handler WebSocket
  [ ] Zod validando toda entrada; limites de tamanho de payload
  [ ] Consultas SQL parametrizadas (nunca concatenar string)
  [ ] Escapar saída no frontend (sem dangerouslySetInnerHTML com dado do
      usuário); se houver markdown em notas, sanitizar (DOMPurify)
  [ ] Cookies httpOnly, SameSite, Secure quando HTTPS; proteção CSRF para
      rotas que alteram estado (token ou verificação de Origin)
  [ ] Verificar o header Origin no handshake do WebSocket
  [ ] Rate limit no login e nos comandos
  [ ] Upload de áudio: validar extensão E tipo real (magic bytes), limitar
      tamanho, nome de arquivo gerado pelo servidor (evitar path traversal)
  [ ] Cabeçalhos de segurança (helmet/CSP restritiva)
  [ ] Container roda como usuário não-root, filesystem de somente leitura
      quando possível, sem privilégios extras
  [ ] Segredos por variável de ambiente / Docker secrets; nada no repositório
  [ ] Testes específicos provando que o jogador A não consegue ler nem alterar
      dados do jogador B por API, WebSocket ou comando
  [ ] Dependências auditadas (npm audit) e versões fixadas por lockfile

