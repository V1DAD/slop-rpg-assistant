#!/usr/bin/env bash
# Uso: ./run_fase.sh fase1
# Roda o agente com o prompt da fase e repete (até 3x) se os testes falharem.
set -u
FASE="${1:?uso: ./run_fase.sh fase1}"
PROMPT="prompts/${FASE}.txt"
[ -f "$PROMPT" ] || { echo "Não achei $PROMPT"; exit 1; }
git rev-parse --is-inside-work-tree >/dev/null 2>&1 || git init
git add -A && git commit -qm "chore: antes de ${FASE}" 2>/dev/null || true

for i in 1 2 3; do
  echo "=== ${FASE}: tentativa $i ==="
  opencode run "$(cat "$PROMPT")"
  if npm test --if-present --silent; then
    echo "=== testes OK ==="
    break
  fi
  echo "=== testes falharam; nova tentativa ==="
done
git status --short
