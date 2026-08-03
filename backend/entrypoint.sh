#!/bin/sh

# Interrompe o script imediatamente se qualquer comando falhar (Segurança)
set -e

echo "🔄 [Entrypoint] Rodando migrações do banco de dados (Prisma)..."
npx prisma migrate deploy

echo "🚀 [Entrypoint] Iniciando a API do Backend..."
exec "$@"
