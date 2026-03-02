#!/bin/bash

# Mutluet - Hızlı Başlatma Script'i

echo "🚀 MUTLUET UYGULAMASI BAŞLATILIYOR..."
echo ""

# Renk kodları
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# PostgreSQL kontrolü
echo -e "${YELLOW}📦 PostgreSQL kontrol ediliyor...${NC}"
if brew services list | grep -q "postgresql.*started"; then
    echo -e "${GREEN}✅ PostgreSQL çalışıyor${NC}"
else
    echo -e "${YELLOW}⚠️  PostgreSQL başlatılıyor...${NC}"
    brew services start postgresql@16
    sleep 3
fi

# Database kontrolü
echo -e "${YELLOW}🗄️  Database kontrol ediliyor...${NC}"
if psql postgres -lqt | cut -d \| -f 1 | grep -qw mutluet; then
    echo -e "${GREEN}✅ Database 'mutluet' mevcut${NC}"
else
    echo -e "${YELLOW}⚠️  Database oluşturuluyor...${NC}"
    psql postgres -c "CREATE DATABASE mutluet;" 2>/dev/null
fi

echo ""
echo -e "${GREEN}✅ Sistem hazır!${NC}"
echo ""
echo "📋 İki terminal açın ve şu komutları çalıştırın:"
echo ""
echo -e "${YELLOW}Terminal 1 (Backend):${NC}"
echo "  cd ~/Mutluet/backend && pnpm dev"
echo ""
echo -e "${YELLOW}Terminal 2 (Frontend):${NC}"
echo "  cd ~/Mutluet && pnpm dev"
echo ""
echo "🌐 Tarayıcıda http://localhost:5173 açın"
echo ""
