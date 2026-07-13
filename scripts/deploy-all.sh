#!/bin/bash
# ============================================================
# Mutluet — Tüm Servisleri Deploy Etme Scripti
# Kullanım: bash scripts/deploy-all.sh [azure|vercel|both]
# ============================================================

set -e

HEDEF="${1:-azure}"
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$PROJECT_ROOT"

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log_ok()   { echo -e "${GREEN}✅ $1${NC}"; }
log_warn() { echo -e "${YELLOW}⚠️  $1${NC}"; }
log_err()  { echo -e "${RED}❌ $1${NC}"; exit 1; }
log_step() { echo -e "${BLUE}🔷 $1${NC}"; }

echo "================================================="
echo "  🚀 Mutluet Deploy Scripti"
echo "  Hedef: $HEDEF"
echo "  Tarih: $(date '+%d.%m.%Y %H:%M')"
echo "================================================="
echo ""

# ── Ön Kontroller ────────────────────────────────────────
log_step "Ön kontroller yapılıyor..."

if ! git diff --quiet; then
  log_warn "Kaydedilmemiş değişiklikler var"
  read -p "Devam etmek istiyor musunuz? (e/H): " CONFIRM
  [ "$CONFIRM" != "e" ] && [ "$CONFIRM" != "E" ] && exit 1
fi

BRANCH=$(git branch --show-current)
if [ "$BRANCH" != "main" ] && [ "$BRANCH" != "master" ]; then
  log_warn "Production deploy için main branch önerilir (mevcut: $BRANCH)"
  read -p "Devam etmek istiyor musunuz? (e/H): " CONFIRM
  [ "$CONFIRM" != "e" ] && [ "$CONFIRM" != "E" ] && exit 1
fi

# ── TypeScript Kontrolü ────────────────────────────────────
log_step "TypeScript kontrol ediliyor..."
npx tsc --noEmit || log_err "TypeScript hatası! Deploy iptal."
cd backend && npx prisma generate > /dev/null 2>&1 && npx tsc --noEmit || log_err "Backend TypeScript hatası!"
cd ..
log_ok "TypeScript kontrolü geçti"

# ── Frontend Build ─────────────────────────────────────────
log_step "Frontend build yapılıyor..."
pnpm build
log_ok "Frontend build tamamlandı (dist/ klasörü hazır)"

# ── Azure Deploy ─────────────────────────────────────────
deploy_azure() {
  log_step "Azure deploy başlıyor..."

  if ! command -v az &> /dev/null; then
    log_err "Azure CLI bulunamadı. Kurulum: https://docs.microsoft.com/tr-tr/cli/azure/install-azure-cli"
  fi

  az account show > /dev/null 2>&1 || log_err "Azure'a giriş yapılmamış. 'az login' çalıştırın."

  # Frontend (Azure Static Web Apps)
  if [ -n "$AZURE_STATIC_WEB_APPS_API_TOKEN" ]; then
    log_step "Frontend Azure Static Web Apps'a deploy ediliyor..."
    az staticwebapp deploy \
      --name "${AZURE_STATIC_WEB_APP_NAME:-mutluet-frontend}" \
      --resource-group "${AZURE_RESOURCE_GROUP:-mutluet-rg}" \
      --source ./dist \
      --token "$AZURE_STATIC_WEB_APPS_API_TOKEN"
    log_ok "Frontend Azure'a deploy edildi"
  else
    log_warn "AZURE_STATIC_WEB_APPS_API_TOKEN eksik — frontend deploy atlandı"
  fi

  # Backend (Azure App Service + Docker)
  if [ -n "$AZURE_ACR_NAME" ]; then
    log_step "Backend Docker image build ediliyor..."
    docker build -t mutluet-backend ./backend

    log_step "Azure Container Registry'ye push ediliyor..."
    az acr login --name "$AZURE_ACR_NAME"
    docker tag mutluet-backend "${AZURE_ACR_NAME}.azurecr.io/backend:latest"
    docker tag mutluet-backend "${AZURE_ACR_NAME}.azurecr.io/backend:$(git rev-parse --short HEAD)"
    docker push "${AZURE_ACR_NAME}.azurecr.io/backend:latest"

    log_step "Azure App Service yeniden başlatılıyor..."
    az webapp restart \
      --name "${AZURE_WEBAPP_NAME:-mutluet-backend}" \
      --resource-group "${AZURE_RESOURCE_GROUP:-mutluet-rg}"
    log_ok "Backend Azure'a deploy edildi"
  else
    log_warn "AZURE_ACR_NAME eksik — backend deploy atlandı"
  fi
}

# ── Vercel Deploy ─────────────────────────────────────────
deploy_vercel() {
  log_step "Vercel deploy başlıyor..."

  if ! command -v vercel &> /dev/null; then
    log_warn "Vercel CLI bulunamadı, yükleniyor..."
    npm install -g vercel
  fi

  vercel --prod --yes
  log_ok "Frontend Vercel'e deploy edildi"
}

# ── Deploy Yürüt ─────────────────────────────────────────
case "$HEDEF" in
  azure)
    deploy_azure
    ;;
  vercel)
    deploy_vercel
    ;;
  both)
    deploy_azure
    deploy_vercel
    ;;
  *)
    log_err "Geçersiz hedef: $HEDEF. Kullanım: azure | vercel | both"
    ;;
esac

# ── Bildirimler ───────────────────────────────────────────
COMMIT_MSG=$(git log -1 --pretty=%s)

if [ -n "$TELEGRAM_BOT_TOKEN" ] && [ -n "$TELEGRAM_CHAT_ID" ]; then
  MESSAGE="✅ *Mutluet Deploy Tamamlandı*
🎯 Hedef: $HEDEF
🌿 Branch: \`$BRANCH\`
📦 Commit: $COMMIT_MSG
🕐 $(date '+%d.%m.%Y %H:%M')"

  curl -s -X POST "https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage" \
    -d "chat_id=${TELEGRAM_CHAT_ID}" \
    --data-urlencode "text=$MESSAGE" \
    -d "parse_mode=Markdown" > /dev/null
fi

if [ -n "$SLACK_WEBHOOK_URL" ]; then
  curl -s -X POST "$SLACK_WEBHOOK_URL" \
    -H 'Content-type: application/json' \
    -d "{\"text\": \"✅ Mutluet Deploy Tamamlandı: \`$HEDEF\` — Branch: \`$BRANCH\`\"}" > /dev/null
fi

echo ""
echo "================================================="
echo "  🎉 Deploy Tamamlandı!"
echo "  Tarih: $(date '+%d.%m.%Y %H:%M')"
echo "================================================="
