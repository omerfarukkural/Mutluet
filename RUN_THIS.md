# 🚀 MUTLUET UYGULAMASINI ÇALIŞTIR

## HAZIRLIK ✅

Aşağıdaki dosyalar oluşturuldu ve hazır:

### Backend
- ✅ Database schema (Prisma)
- ✅ API endpoints (Auth, User, Donations, Events, Matching, Chat, Organizations)
- ✅ Socket.IO (Real-time chat & video call)
- ✅ .env dosyası

### Frontend
- ✅ API client (`src/lib/api.ts`)
- ✅ Type definitions (`src/types/index.ts`)
- ✅ Auth context (`src/contexts/AuthContext.tsx`)
- ✅ Login sayfası (Google, Facebook, TikTok, Magic Link)
- ✅ Home sayfası (Backend entegreli)
- ✅ Tüm diğer sayfalar

---

## ADIM 1: POSTGRESQL KURULUMU

```bash
# PostgreSQL yüklü değilse:
brew install postgresql@16

# PostgreSQL'i başlat
brew services start postgresql@16

# Database oluştur
psql postgres -c "CREATE DATABASE mutluet;"

# Test et
psql mutluet -c "SELECT version();"
```

---

## ADIM 2: BACKEND KURULUM VE BAŞLATMA

```bash
cd ~/Mutluet/backend

# Dependencies yükle (pnpm hala çalışıyorsa bekle)
# Eğer takılırsa: Ctrl+C yapıp şunu çalıştır:
npm install

# Prisma setup
pnpm prisma:generate
# veya
npx prisma generate

# Database migration
pnpm prisma:migrate
# veya
npx prisma migrate dev --name init

# Backend'i başlat
pnpm dev
# veya
npx tsx watch src/index.ts
```

✅ **Backend hazır!** `http://localhost:3001` adresinde çalışacak.

---

## ADIM 3: FRONTEND KURULUM VE BAŞLATMA

**YENİ TERMINAL AÇIN**

```bash
cd ~/Mutluet

# Dependencies zaten yüklü olmalı
# Eğer yoksa:
pnpm install

# Frontend'i başlat
pnpm dev
```

✅ **Frontend hazır!** Tarayıcıda `http://localhost:5173` açılacak.

---

## ADIM 4: İLK TEST

### 1. Backend Test

```bash
# Health check
curl http://localhost:3001/health

# Çıktı: {"status":"ok","timestamp":"..."}
```

### 2. Kullanıcı Kayıt

Tarayıcıda:
1. `http://localhost:5173` aç
2. Onboarding ekranlarını geç
3. Login sayfasında "Kayıt Ol" seç
4. Bilgileri gir ve kayıt ol
5. Otomatik olarak /home sayfasına yönlendirileceksin

### 3. İstatistikleri Gör

Home sayfasında:
- Bağışlar: ₺0
- Gönüllülük: 0 saat
- Etkinlikler: 0
- Etkileşim: 0

Bu normaldir! Henüz aktivite yok.

---

## ADIM 5: TEST DATASI EKLE (OPSIYONEL)

Backend'de test verisi eklemek için:

```bash
cd ~/Mutluet/backend

# Prisma Studio'yu aç (GUI database editörü)
pnpm prisma:studio
# veya
npx prisma studio
```

Tarayıcıda `http://localhost:5555` açılacak. Buradan manuel veri ekleyebilirsin.

**Örnek Event ekle:**
- Model: Event
- Add Record
  - title: "Test Etkinlik"
  - description: "İlk etkinlik"
  - category: EGITIM
  - date: 2026-03-15 (gelecek tarih)
  - time: "14:00"
  - location: "İstanbul"
  - currentParticipants: 5

Kaydet ve frontend'i yenile. Home sayfasında görünecek!

---

## 📌 SORUN GİDERME

### Backend çalışmıyor

```bash
# Port kullanımda mı kontrol et
lsof -i :3001

# Varsa kill et
kill -9 <PID>

# Tekrar başlat
cd ~/Mutluet/backend && pnpm dev
```

### Frontend çalışmıyor

```bash
# Port kontrolü
lsof -i :5173

# Kill & restart
kill -9 <PID>
cd ~/Mutluet && pnpm dev
```

### Database hatası

```bash
# PostgreSQL çalışıyor mu?
brew services list | grep postgresql

# Çalışmıyorsa başlat
brew services start postgresql@16

# Migration tekrar dene
cd ~/Mutluet/backend
pnpm prisma:migrate
```

### API bağlantı hatası

Frontend `.env` dosyasını kontrol et:
```bash
cat ~/Mutluet/.env
# VITE_API_URL=http://localhost:3001/api olmalı
```

Backend `.env` dosyasını kontrol et:
```bash
cat ~/Mutluet/backend/.env
# DATABASE_URL ve diğer değerler doğru mu?
```

---

## 🎯 SONRAKİ ADIMLAR

### Eksik Özellikler

1. **Video Call** - Azure Communication Services entegrasyonu gerekli
2. **Harita** - Google Maps API key gerekli
3. **Sosyal Login** - Google, Facebook, TikTok OAuth credentials gerekli
4. **Ödeme** - Stripe entegrasyonu gerekli (bağış sistemi için)
5. **Email** - SMTP ayarları gerekli (Magic Link için)

### Yapılacaklar

- [ ] Google OAuth credentials al ve backend .env'e ekle
- [ ] Facebook App credentials al
- [ ] TikTok Developer hesabı aç
- [ ] Google Maps API key al
- [ ] Stripe hesabı aç
- [ ] Azure Communication Services setup yap (video call için)

---

## 🔥 HIZLI BAŞLATMA (Herşey hazırsa)

Terminal 1:
```bash
cd ~/Mutluet/backend && pnpm dev
```

Terminal 2:
```bash
cd ~/Mutluet && pnpm dev
```

Tarayıcı: `http://localhost:5173`

DONE! 🎉

---

## 📞 DESTEK

Sorun olursa:
1. Backend log'larına bak (Terminal 1)
2. Frontend console'una bak (Browser F12)
3. Database'i kontrol et (Prisma Studio)
4. Backend `.env` ve Frontend `.env` dosyalarını kontrol et
