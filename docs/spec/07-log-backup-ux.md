6.7 Log de eventos e histórico
  - Todo comando/ação gera evento com autor, alvo, antes/depois e visibilidade.
  - Log público da mesa (rolagens, danos visíveis) e log privado do GM.
  - Exportação do log da sessão em .txt ou .md.

6.8 Backup e exportação
  - Botão do GM "Exportar tudo" (JSON) e "Importar".
  - Script de backup do SQLite (usando a API de backup do SQLite, não cp de
    arquivo em uso) documentado, com sugestão de cron.

--------------------------------------------------------------------------------
7. UX / INTERFACE
--------------------------------------------------------------------------------
  - Tema escuro por padrão (uso em mesa com luz baixa) + opção de tema claro.
  - Barra de HP com cores por faixa e animação suave; sem depender só de cor
    (mostre também o número/ícone) por acessibilidade.
  - Fontes grandes e áreas de toque >= 44 px.
  - Atalhos de teclado no desktop: "/" foca o console, "Esc" sai.
  - Toasts discretos para eventos ("Você recebeu 2x Poção de Cura").
  - Indicador de conexão (online/reconectando) sempre visível.
  - Sem telas desnecessárias: o jogador deve conseguir abrir o link e ver sua
    ficha em no máximo 2 toques.

