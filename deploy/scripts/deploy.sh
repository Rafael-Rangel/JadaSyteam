#!/usr/bin/env bash
set -euo pipefail

APP_DIR="${APP_DIR:-/opt/jada}"

echo "[1/5] Preparando diretório ${APP_DIR}"
cd "${APP_DIR}"

if [[ ! -f ".env.production" ]]; then
  echo "Arquivo .env.production não encontrado em ${APP_DIR}"
  exit 1
fi

echo "[2/5] Build e subida dos containers"
docker compose --env-file .env.production up -d --build

echo "[3/5] Aplicando migrações Prisma"
docker compose --env-file .env.production exec -T app npx prisma migrate deploy

echo "[4/5] Verificando saúde da aplicação"
docker compose --env-file .env.production ps

echo "[5/5] Limpando imagens antigas"
docker image prune -f >/dev/null || true

echo "Deploy concluído."
