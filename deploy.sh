#!/bin/bash

# Interrompe o script imediatamente se qualquer comando falhar (Segurança)
set -e

echo "🚀 Iniciando deploy automático do Oxetech Helpdesk..."

# Detecta a branch ativa atual no servidor
CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)

echo "📦 1. Puxando as atualizações do repositório (branch: $CURRENT_BRANCH)..."
git pull origin "$CURRENT_BRANCH"

echo "🏗️ 2. Reconstruindo os containers de produção (sem cache para evitar código velho)..."
docker compose -f docker-compose.prod.yml build --no-cache

echo "🔄 3. Subindo os novos containers..."
docker compose -f docker-compose.prod.yml up -d

echo "🧹 4. Limpando imagens antigas e soltas para liberar espaço no disco da VPS..."
docker image prune -f

echo "✅ Deploy concluído com sucesso!"