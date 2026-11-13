#!/usr/bin/env bash

# ==============================================================================
# 🛡️ OXETECH — SECRET SCANNING & PRE-COMMIT SECURITY QUALITY GATE
# ==============================================================================
# Scanner de segurança pré-commit e CI para prevenir vazamentos de credenciais,
# chaves de API, segredos estáticos e arquivos sensíveis no Git.
#
# Uso:
#   ./scripts/check-secrets.sh --pre-commit    (avalia apenas arquivos staged no git)
#   ./scripts/check-secrets.sh --all           (avalia todos os arquivos rastreados)
#   ./scripts/check-secrets.sh [arquivos...]   (avalia arquivos específicos)
# ==============================================================================

set -eo pipefail

RED="\033[0;31m"
GREEN="\033[0;32m"
YELLOW="\033[1;33m"
CYAN="\033[0;36m"
BOLD="\033[1m"
DIM="\033[2m"
NC="\033[0m"

MODE="all"
SPECIFIC_FILES=()

if [ "${1:-}" == "--pre-commit" ]; then
  MODE="pre-commit"
elif [ "${1:-}" == "--all" ]; then
  MODE="all"
elif [ $# -gt 0 ]; then
  MODE="files"
  SPECIFIC_FILES=("$@")
fi

# 1. Coleta dos arquivos a inspecionar
FILES_TO_CHECK=()

if [ "$MODE" == "pre-commit" ]; then
  while IFS= read -r f; do
    [ -n "$f" ] && FILES_TO_CHECK+=("$f")
  done < <(git diff --cached --name-only --diff-filter=ACM || true)
elif [ "$MODE" == "files" ]; then
  FILES_TO_CHECK=("${SPECIFIC_FILES[@]}")
else
  while IFS= read -r f; do
    [ -n "$f" ] && FILES_TO_CHECK+=("$f")
  done < <(git ls-files || true)
fi

if [ ${#FILES_TO_CHECK[@]} -eq 0 ]; then
  echo -e "${GREEN}✔ Secret Scanning: Nenhum arquivo a ser verificado.${NC}"
  exit 0
fi

# 2. Arquivos estritamente proibidos de serem commitados
PROHIBITED_FILENAME_PATTERNS=(
  '^\.env(\.[a-zA-Z0-9_-]+)?$'
  '.*\.pem$'
  '.*\.key$'
  '.*\.p12$'
  '.*id_rsa.*'
  '.*service_account.*\.json$'
  '.*credentials.*\.json$'
)

# 3. Expressões Regulares de Segredos e Chaves Conhecidas
SECRET_REGEXES=(
  'AIza[0-9A-Za-z_-]{35}'                                # Google Cloud / Gemini API Key
  'sk-[a-zA-Z0-9]{20,}'                                  # OpenAI API Key
  'ghp_[0-9a-zA-Z]{36}'                                  # GitHub Personal Access Token
  'gho_[0-9a-zA-Z]{36}'                                  # GitHub OAuth Token
  'github_pat_[0-9a-zA-Z_]{82}'                          # GitHub Fine-grained PAT
  'AKIA[0-9A-Z]{16}'                                     # AWS Access Key ID
  'xox[baprs]-[0-9]{10,13}-[0-9]{10,13}-[a-zA-Z0-9]{24}' # Slack Token
  '-----BEGIN (RSA|EC|DSA|OPENSSH|PGP) PRIVATE KEY-----' # Chaves Privadas Criptográficas
  '[0-9]{8,10}:[a-zA-Z0-9_-]{35}'                        # Telegram Bot Token
)

# Extensões e caminhos a ignorar
is_ignored_path() {
  local file="$1"
  case "$file" in
    *.lock|*-lock.json|*.png|*.jpg|*.jpeg|*.gif|*.svg|*.ico|*.pdf|*.docx|*.xlsx|*.csv|*.map|*.min.js|*.min.css)
      return 0
      ;;
    .env.example|env.example|*/env.example)
      return 0
      ;;
    scripts/check-secrets.sh)
      return 0
      ;;
    *)
      return 1
      ;;
  esac
}

# Padrões que representam placeholders aceitos
is_whitelisted_value() {
  local line="$1"
  if echo "$line" | grep -qE "ci-dummy-|ci-smoke-|<gerar-|<placeholder>|your-|sua-|dummy|EXAMPLE|CHANGEME|change-me"; then
    return 0
  fi
  return 1
}

VIOLATIONS_COUNT=0

echo -e "\n${CYAN}${BOLD}╔════════════════════════════════════════════════════════════════════════════╗${NC}"
echo -e "${CYAN}${BOLD}║      🛡️  OXETECH — SECRET SCANNING QUALITY GATE                            ║${NC}"
echo -e "${CYAN}${BOLD}╚════════════════════════════════════════════════════════════════════════════╝${NC}"
echo -e " Modo: ${BOLD}${MODE}${NC} | Arquivos a analisar: ${BOLD}${#FILES_TO_CHECK[@]}${NC}\n"

for file in "${FILES_TO_CHECK[@]}"; do
  [ -f "$file" ] || continue

  # A. Checagem de Nome de Arquivo Proibido
  basename_file="$(basename "$file")"
  for pattern in "${PROHIBITED_FILENAME_PATTERNS[@]}"; do
    if [[ "$file" =~ $pattern ]] || [[ "$basename_file" =~ $pattern ]]; then
      if [ "$basename_file" != ".env.example" ] && [ "$basename_file" != "env.example" ] && [ "$basename_file" != ".env.production" ]; then
        echo -e "${RED}${BOLD}[BLOQUEIO] Arquivo sensível proibido no repositório:${NC} ${file}"
        echo -e "  └─ Padrão detectado: ${YELLOW}${pattern}${NC}"
        VIOLATIONS_COUNT=$((VIOLATIONS_COUNT + 1))
      fi
    fi
  done

  # B. Pula binários e tipos ignorados para checagem de conteúdo
  if is_ignored_path "$file"; then
    continue
  fi

  # C. Checagem de Conteúdo por Regex
  for pattern in "${SECRET_REGEXES[@]}"; do
    matches=$(grep -n -E "$pattern" "$file" 2>/dev/null || true)
    if [ -n "$matches" ]; then
      while IFS= read -r match_line; do
        line_num=$(echo "$match_line" | cut -d: -f1)
        line_content=$(echo "$match_line" | cut -d: -f2-)

        if is_whitelisted_value "$line_content"; then
          continue
        fi

        # Mascara o segredo na exibição
        masked_content="${line_content:0:40} ... [CONTEÚDO TRUNCADO]"
        echo -e "${RED}${BOLD}[VIOLAÇÃO] Segredo detectado em:${NC} ${file}:${line_num}"
        echo -e "  ├─ Padrão: ${YELLOW}${pattern}${NC}"
        echo -e "  └─ Linha:  ${DIM}${masked_content}${NC}"
        VIOLATIONS_COUNT=$((VIOLATIONS_COUNT + 1))
      done <<< "$matches"
    fi
  done
done

echo ""

if [ "$VIOLATIONS_COUNT" -gt 0 ]; then
  echo -e "${RED}${BOLD}✖ FALHA: ${VIOLATIONS_COUNT} segredo(s) ou arquivo(s) proibido(s) detectado(s).${NC}"
  echo -e "${RED}O commit/build foi bloqueado para impedir vazamento de credenciais.${NC}"
  exit 1
else
  echo -e "${GREEN}${BOLD}✔ Secret Scanning Aprovado: Nenhum segredo ou arquivo proibido encontrado.${NC}\n"
  exit 0
fi
