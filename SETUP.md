# Mutluet Backend Setup - Terminal Komutları

## 1. PostgreSQL Kurulumu ve Başlatma

```bash
# PostgreSQL kurulu değilse:
brew install postgresql@16

# PostgreSQL'i başlat
brew services start postgresql@16

# Veya manuel başlat (her seferinde çalıştırman gerekir):
/opt/homebrew/opt/postgresql@16/bin/postgres -D /opt/homebrew/var/postgresql@16
```

## 2. Database Oluşturma

```bash
# PostgreSQL'e bağlan
psql postgres

# Database oluştur (psql içinde):
CREATE DATABASE mutluet;

# Çık
\q
```

## 3. Backend Kurulumu

```bash
cd ~/Mutluet/backend

# Dependencies yükle (arka planda çalışıyor, bitene kadar bekle)
# pnpm install komutu şu anda çalışıyor...

# Prisma generate
pnpm prisma:generate

# Database migration
pnpm prisma:migrate

# Server'ı başlat
pnpm dev
```

## 4. Test Endpointleri

Server ayağa kalktıktan sonra (`http://localhost:3001`) test et:

### Health Check
```bash
curl http://localhost:3001/health
```

### Register
```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@mutluet.com",
    "password": "password123",
    "name": "Test User"
  }'
```

### Login
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@mutluet.com",
    "password": "password123"
  }'
```

Login'den dönen `token`'ı kopyala ve sonraki isteklerde kullan.

### Get Current User
```bash
curl http://localhost:3001/api/users/me \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Create Donation
```bash
curl -X POST http://localhost:3001/api/donations \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 100,
    "type": "EGITIM",
    "description": "Eğitim fonu"
  }'
```

### Get Events
```bash
curl http://localhost:3001/api/events/upcoming
```

### Get Potential Matches
```bash
curl http://localhost:3001/api/matching/potential \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Get Conversations
```bash
curl http://localhost:3001/api/chat/conversations \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Get Organizations
```bash
curl "http://localhost:3001/api/organizations/nearby?lat=41.0082&lng=28.9784&radius=10"
```

## Tüm Endpoint Listesi

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/health` | ❌ | Health check |
| POST | `/api/auth/register` | ❌ | Kayıt ol |
| POST | `/api/auth/login` | ❌ | Giriş yap |
| POST | `/api/auth/social/:provider` | ❌ | Sosyal medya girişi |
| POST | `/api/auth/magic-link` | ❌ | Magic link iste |
| GET | `/api/users/me` | ✅ | Kullanıcı bilgilerini al |
| PATCH | `/api/users/me` | ✅ | Profil güncelle |
| GET | `/api/users/me/stats` | ✅ | İstatistikleri al |
| GET | `/api/donations/my-donations` | ✅ | Bağışlarımı listele |
| POST | `/api/donations` | ✅ | Bağış yap |
| GET | `/api/events` | ❌ | Tüm etkinlikler |
| GET | `/api/events/upcoming` | ❌ | Yaklaşan etkinlikler |
| POST | `/api/events/:eventId/join` | ✅ | Etkinliğe katıl |
| GET | `/api/matching/potential` | ✅ | Potansiyel eşleşmeler |
| POST | `/api/matching/:userId/match` | ✅ | Eşleş |
| GET | `/api/chat/conversations` | ✅ | Konuşmalar |
| GET | `/api/chat/messages/:userId` | ✅ | Mesajları getir |
| POST | `/api/chat/messages` | ✅ | Mesaj gönder |
| GET | `/api/organizations` | ❌ | Tüm kuruluşlar |
| GET | `/api/organizations/nearby` | ❌ | Yakındaki kuruluşlar |
