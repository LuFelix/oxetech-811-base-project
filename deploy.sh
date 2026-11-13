#!/usr/bin/env bash

# ==============================================================================
# SCRIPT CANÔNICO DE DEPLOY LOCAL (SSOT) — OXETECH HELPDESK
# ==============================================================================
# Em conformidade com MANUAL-DEPLOY.md:
# - Fail-fast com set -euo pipefail
# - Sincronização estrita via git fetch + git reset --hard
# ==============================================================================

set -euo pipefail

APP_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$APP_DIR"

TARGET_BRANCH="main"

echo "🚀 [1/5] Iniciando deploy automático do Oxetech Helpdesk em $APP_DIR..."

if [ -f ".env" ]; then
  chmod 600 .env
fi

echo "📥 [2/5] Sincronizando código com origin/$TARGET_BRANCH..."
git fetch origin "$TARGET_BRANCH"
git reset --hard "origin/$TARGET_BRANCH"

echo "🏗️ [3/5] Reconstruindo os contêineres de produção..."
docker compose -f docker-compose.prod.yml build --no-cache

echo "🔄 [4/5] Subindo os novos contêineres..."
docker compose -f docker-compose.prod.yml up -d

echo "🧹 [5/5] Limpando imagens antigas..."
docker image prune -f

echo "✅ Deploy concluído com sucesso!"
