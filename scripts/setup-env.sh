#!/bin/bash
# ============================================================
# Mutluet — Ortam Kurulum Scripti
# Kullanım: bash scripts/setup-env.sh
# ============================================================

set -e

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$PROJECT_ROOT"

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

log_ok()   { echo -e "${GREEN}✅ $1${NC}"; }
log_warn() { echo -e "${YELLOW}⚠️  $1${NC}"; }
log_err()  { echo -e "${RED}❌ $1${NC}"; }
log_info() { echo -e "   $1"; }

echo "================================================="
echo "  🚀 Mutluet Ortam Kurulum Scripti"
echo "  Proje: $PROJECT_ROOT"
echo "================================================="
echo ""

# ── 1. pnpm kontrolü ───────────────────────────────────────
if ! command -v pnpm &> /dev/null; then
  log_warn "pnpm bulunamadı, yükleniyor..."
  npm install -g pnpm
  log_ok "pnpm yüklendi"
else
  log_ok "pnpm mevcut ($(pnpm --version))"
fi

# ── 2. Node.js sürüm kontrolü ─────────────────────────────
NODE_VERSION=$(node --version | sed 's/v//' | cut -d. -f1)
if [ "$NODE_VERSION" -lt 20 ]; then
  log_err "Node.js 20+ gerekli (mevcut: v$NODE_VERSION)"
  exit 1
else
  log_ok "Node.js $(node --version)"
fi

# ── 3. Frontend bağımlılıkları ────────────────────────────
if [ ! -d "node_modules" ] || [ "package.json" -nt "node_modules/.package-lock.json" ]; then
  log_info "Frontend bağımlılıkları yükleniyor..."
  pnpm install --frozen-lockfile 2>&1 | tail -3
  log_ok "Frontend bağımlılıkları yüklendi"
else
  log_ok "Frontend bağımlılıkları güncel"
fi

# ── 4. Backend bağımlılıkları ─────────────────────────────
if [ ! -d "backend/node_modules" ] || [ "backend/package.json" -nt "backend/node_modules/.package-lock.json" ]; then
  log_info "Backend bağımlılıkları yükleniyor..."
  cd backend && pnpm install --frozen-lockfile 2>&1 | tail -3 && cd ..
  log_ok "Backend bağımlılıkları yüklendi"
else
  log_ok "Backend bağımlılıkları güncel"
fi

# ── 5. Prisma client kontrolü ─────────────────────────────
if [ ! -d "backend/node_modules/.prisma" ]; then
  log_info "Prisma client oluşturuluyor..."
  cd backend && npx prisma generate 2>&1 | tail -3 && cd ..
  log_ok "Prisma client oluşturuldu"
else
  log_ok "Prisma client mevcut"
fi

# ── 6. .env dosyaları kontrolü ────────────────────────────
echo ""
echo "--- Ortam Değişkenleri Kontrolü ---"

if [ ! -f ".env" ]; then
  if [ -f ".env.example" ]; then
    cp .env.example .env
    log_warn ".env oluşturuldu — lütfen değerleri doldurun: .env"
  else
    log_warn ".env.example bulunamadı, .env oluşturulamadı"
  fi
else
  log_ok ".env mevcut"
fi

if [ ! -f "backend/.env" ]; then
  if [ -f "backend/.env.example" ]; then
    cp backend/.env.example backend/.env
    log_warn "backend/.env oluşturuldu — lütfen değerleri doldurun: backend/.env"
  else
    log_warn "backend/.env.example bulunamadı, backend/.env oluşturulamadı"
  fi
else
  log_ok "backend/.env mevcut"
fi

# Kritik değişkenleri kontrol et
KRITIK_DEGISKENLER=(
  "DATABASE_URL"
  "JWT_SECRET"
  "SUPABASE_URL"
)

EKSIK_VAR=0
if [ -f "backend/.env" ]; then
  for VAR in "${KRITIK_DEGISKENLER[@]}"; do
    VALUE=$(grep "^$VAR=" backend/.env 2>/dev/null | cut -d= -f2-)
    if [ -z "$VALUE" ] || [ "$VALUE" = "" ] || echo "$VALUE" | grep -q "YOUR_\|XXXXX\|placeholder"; then
      log_warn "backend/.env eksik: $VAR"
      EKSIK_VAR=1
    fi
  done
fi

if [ $EKSIK_VAR -eq 0 ]; then
  log_ok "Kritik ortam değişkenleri tanımlanmış"
fi

# ── 7. Git hook'larını ayarla ─────────────────────────────
echo ""
echo "--- Git Hook Kurulumu ---"

PRE_COMMIT_HOOK=".git/hooks/pre-commit"
if [ ! -f "$PRE_COMMIT_HOOK" ] || ! grep -q "Mutluet" "$PRE_COMMIT_HOOK" 2>/dev/null; then
  cat > "$PRE_COMMIT_HOOK" << 'HOOK'
#!/bin/bash
# Mutluet Pre-commit Hook
echo "🔍 Commit öncesi kontroller başlıyor..."

# TypeScript kontrolü
echo "📝 TypeScript kontrol..."
if ! npx tsc --noEmit 2>&1; then
  echo "❌ TypeScript hatası! Commit iptal edildi."
  exit 1
fi
cd backend && npx prisma generate > /dev/null 2>&1 && npx tsc --noEmit 2>&1 && cd ..

echo "✅ Tüm kontroller geçti!"
HOOK
  chmod +x "$PRE_COMMIT_HOOK"
  log_ok "Pre-commit hook kuruldu"
else
  log_ok "Pre-commit hook zaten mevcut"
fi

# ── 8. Özet ───────────────────────────────────────────────
echo ""
echo "================================================="
echo "  ✨ Kurulum Tamamlandı!"
echo ""
echo "  Başlatma Komutları:"
echo "  Frontend: pnpm dev          → http://localhost:5173"
echo "  Backend:  cd backend && pnpm dev → http://localhost:3001"
echo ""
echo "  Yararlı Komutlar:"
echo "  DB Görsel: cd backend && npx prisma studio"
echo "  Sağlık:    bash scripts/health-check.sh"
echo "================================================="
