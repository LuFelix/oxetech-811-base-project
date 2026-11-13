# Plano de Execução - Issue #55: Adequação CD, deploy.sh e Release Gate SSOT

## Contexto e Motivação
A auditoria `sync-standards.sh --check-deploy` acusou 4 inconformidades críticas no repositório `oxetech-811-base-project`:
1. `SEM_ENV_PROD`: falta de `environment: production` no deploy.
2. `SECRETS_FORA_PADRAO`: uso de `SERVER_HOST` em vez de `HOST_VPS`.
3. `SEM_SMOKE_TEST`: ausência de healthcheck HTTP pós-deploy.
4. `GIT_PULL_USADO`: uso de `git pull` na VPS em vez de `fetch` + `reset --hard`.
Além disso, o repositório não possuía branch `develop` (usava `dev`), nem pipelines de CI e Release Gate configuradas.

## Objetivos e Entregáveis
1. **Atualizar `deploy.sh`**:
   - `set -euo pipefail`.
   - Sincronização via `git fetch origin main` e `git reset --hard origin/main`.
   - Limpeza e reinício seguro de containers via docker compose.
   - Healthcheck local via `curl -f http://localhost:3000/api/health`.
2. **Atualizar `.github/workflows/deploy.yml`**:
   - `environment: production` e `timeout-minutes: 15`.
   - Secrets canônicos: `HOST_VPS`, `USERNAME_VPS`, `SSH_KEY`, `PORT_VPS` com fallback.
   - Smoke test pós-deploy HTTP condicional via `HEALTHCHECK_URL`.
3. **Criar `scripts/check-secrets.sh`**:
   - Scanner de credenciais no padrão canônico.
4. **Criar `.github/workflows/ci.yml`**:
   - Testes e validação para PRs contra `develop` com Auto-Merge Nível 1.
5. **Criar `.github/workflows/release-gate.yml`**:
   - Release Quality Gate para PRs de `develop` para `main` com os 7 pilares e Auto-Merge Nível 2.

## Estratégia de Teste e Validação
- Validar sintaxe shell de `deploy.sh`.
- Executar `bash /home/jaspion/projetos/engineering-standards/sync-standards.sh --check-deploy` comprovando status `✅ CONFORME`.
- Checklist pré-merge de 8 itens.
