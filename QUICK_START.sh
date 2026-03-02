#!/bin/bash

# Mutluet - ULTRA HIZLI BAŞLATMA
# Bu script PostgreSQL, database ve Prisma setup'ını otomatik yapar

set -e  # Hata olursa dur

echo "🚀 Mutluet Otomatik Kurulum Başlıyor..."
echo ""

# PostgreSQL
if ! brew services list | grep -q "postgresql.*started"; then
    echo "📦 PostgreSQL başlatılıyor..."
    brew services start postgresql@16
    sleep 3
fi

# Database
if ! psql postgres -lqt | cut -d \| -f 1 | grep -qw mutluet; then
    echo "🗄️  Database oluşturuluyor..."
    psql postgres -c "CREATE DATABASE mutluet;"
fi

# Backend setup
echo "⚙️  Backend kurulumu..."
cd ~/Mutluet/backend

if [ ! -d "node_modules" ]; then
    echo "📦 Dependencies yükleniyor..."
    pnpm install
fi

echo "🔧 Prisma generate..."
pnpm prisma:generate

echo "🗄️  Database migration..."
pnpm prisma:migrate

echo ""
echo "✅ KURULUM TAMAMLANDI!"
echo ""
echo "Şimdi iki terminal açın:"
echo ""
echo "Terminal 1:"
echo "  cd ~/Mutluet/backend && pnpm dev"
echo ""
echo "Terminal 2:"
echo "  cd ~/Mutluet && pnpm dev"
echo ""
