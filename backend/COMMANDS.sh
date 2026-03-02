#!/bin/bash

# Mutluet Backend Setup Script

echo "🚀 Mutluet Backend Kurulumu Başlıyor..."
echo ""

# Check if PostgreSQL is installed
if ! command -v psql &> /dev/null; then
    echo "❌ PostgreSQL bulunamadı. Kuruluyor..."
    brew install postgresql@16
    echo "✅ PostgreSQL kuruldu"
fi

# Start PostgreSQL
echo "📦 PostgreSQL başlatılıyor..."
brew services start postgresql@16
sleep 3

# Create database
echo "🗄️  Database oluşturuluyor..."
psql postgres -c "CREATE DATABASE mutluet;" 2>/dev/null || echo "Database zaten mevcut"

echo "✅ PostgreSQL hazır"
echo ""

# Backend setup
cd ~/Mutluet/backend

echo "📦 Dependencies yükleniyor (bu biraz sürebilir)..."
pnpm install

echo "🔧 Prisma generate..."
pnpm prisma:generate

echo "🗄️  Database migration..."
pnpm prisma:migrate

echo ""
echo "✅ Kurulum tamamlandı!"
echo ""
echo "🚀 Server'ı başlatmak için:"
echo "   cd ~/Mutluet/backend && pnpm dev"
echo ""
