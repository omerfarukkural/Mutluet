#!/bin/bash
# ============================================================
# Mutluet — Servis Sağlık Kontrolü
# Kullanım: bash scripts/health-check.sh [--prod]
# ============================================================

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

PROD=0
[ "$1" = "--prod" ] && PROD=1

if [ $PROD -eq 1 ]; then
  BACKEND_URL="https://mutluet-backend.azurewebsites.net"
  FRONTEND_URL="https://mutluet.azurestaticapps.net"
else
  BACKEND_URL="${BACKEND_URL:-http://localhost:3001}"
  FRONTEND_URL="${FRONTEND_URL:-http://localhost:5173}"
fi

BASARILI=0
BASARISIZ=0

kontrol() {
  local isim="$1"
  local url="$2"
  local beklenen="${3:-200}"

  HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" --connect-timeout 5 --max-time 10 "$url" 2>/dev/null)

  if [ "$HTTP_CODE" = "$beklenen" ] || [ "$HTTP_CODE" = "200" ]; then
    echo -e "${GREEN}✅ $isim${NC} ($url)"
    BASARILI=$((BASARILI + 1))
  else
    echo -e "${RED}❌ $isim${NC} ($url) — HTTP $HTTP_CODE"
    BASARISIZ=$((BASARISIZ + 1))
  fi
}

echo -e "${BLUE}=================================================${NC}"
echo -e "${BLUE}  🔍 Mutluet Servis Sağlık Kontrolü${NC}"
[ $PROD -eq 1 ] && echo -e "${BLUE}  Mod: PRODUCTION${NC}" || echo -e "${BLUE}  Mod: GELIŞTIRME${NC}"
echo -e "${BLUE}=================================================${NC}"
echo ""

# ── Uygulama Servisleri ───────────────────────────────────
echo "--- Uygulama Servisleri ---"
kontrol "Frontend"          "$FRONTEND_URL"
kontrol "Backend API"       "$BACKEND_URL/health"
kontrol "Backend API v2"    "$BACKEND_URL/api/health"
echo ""

# ── Veritabanı Bağlantısı ─────────────────────────────────
echo "--- Veritabanı ---"
if [ -f "backend/.env" ]; then
  DB_URL=$(grep "^DATABASE_URL=" backend/.env | cut -d= -f2-)
  if [ -n "$DB_URL" ]; then
    if cd backend && npx prisma db execute --stdin <<< "SELECT 1" > /dev/null 2>&1; then
      echo -e "${GREEN}✅ PostgreSQL (Supabase)${NC}"
      BASARILI=$((BASARILI + 1))
    else
      echo -e "${RED}❌ PostgreSQL (Supabase) — bağlantı hatası${NC}"
      BASARISIZ=$((BASARISIZ + 1))
    fi
    cd /home/user/Mutluet 2>/dev/null || true
  else
    echo -e "${YELLOW}⚠️  DATABASE_URL tanımlı değil${NC}"
  fi
else
  echo -e "${YELLOW}⚠️  backend/.env bulunamadı${NC}"
fi
echo ""

# ── Harici Servisler ──────────────────────────────────────
echo "--- Harici Servisler ---"
if curl -sf "https://api.supabase.com" > /dev/null 2>&1; then
  echo -e "${GREEN}✅ Supabase Cloud${NC}"
  BASARILI=$((BASARILI + 1))
else
  echo -e "${YELLOW}⚠️  Supabase Cloud erişilemez (internet bağlantısını kontrol et)${NC}"
fi

# Azure kontrol (opsiyonel)
if command -v az &> /dev/null && az account show > /dev/null 2>&1; then
  echo -e "${GREEN}✅ Azure CLI — Giriş yapılmış${NC}"
  BASARILI=$((BASARILI + 1))
else
  echo -e "${YELLOW}⚠️  Azure CLI — Giriş yapılmamış (geliştirme ortamında normal)${NC}"
fi
echo ""

# ── Git Durumu ────────────────────────────────────────────
echo "--- Git Durumu ---"
if [ -d ".git" ]; then
  BRANCH=$(git branch --show-current)
  UNCOMMITTED=$(git status --porcelain | wc -l | tr -d ' ')
  echo -e "${GREEN}✅ Git Repo${NC} — Branch: \`$BRANCH\`"
  if [ "$UNCOMMITTED" -gt 0 ]; then
    echo -e "${YELLOW}⚠️  $UNCOMMITTED taahhüt edilmemiş değişiklik var${NC}"
  else
    echo -e "   Çalışma ağacı temiz"
  fi
fi
echo ""

# ── Özet ──────────────────────────────────────────────────
echo "================================================="
TOPLAM=$((BASARILI + BASARISIZ))
echo -e "  Sonuç: ${GREEN}$BASARILI başarılı${NC} / ${RED}$BASARISIZ başarısız${NC} ($TOPLAM kontrol)"
if [ $BASARISIZ -eq 0 ]; then
  echo -e "  ${GREEN}✨ Tüm sistemler çalışıyor!${NC}"
else
  echo -e "  ${RED}⚠️  $BASARISIZ servis sorunlu — lütfen kontrol edin${NC}"
fi
echo "================================================="

exit $BASARISIZ
