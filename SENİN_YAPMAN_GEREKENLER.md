# ✅ SENİN YAPMAN GEREKENLER - ADIM ADIM

## 🎯 ŞU AN DURUM

✅ **TAMAMLANDI:**
- Backend tamamen çalışıyor (http://localhost:3001)
- Frontend tamamen çalışıyor (http://localhost:5173)
- Database kurulu ve hazır
- Admin paneli eklendi (/admin)
- GitHub'a yüklendi
- Tüm dokümantasyon hazır

⏳ **YAPMALISIN:**
1. Admin kullanıcısı oluştur
2. Test et (kullanıcı ve admin gözünden)
3. Deploy et (internetten erişilebilir yap)
4. API key'leri ekle (opsiyonel)

---

## 1️⃣ ADIM 1: ADMIN KULLANICISI OLUŞTUR (5 dakika)

### En Kolay Yol:

```bash
# Terminal 1'de backend çalışıyorsa, Terminal 2'de:
cd ~/Mutluet/backend
npx prisma studio
```

1. Tarayıcıda `http://localhost:5555` açılacak
2. Sol menüden **"User"** tıkla
3. **"Add Record"** butonuna tıkla
4. Şu bilgileri gir:
   ```
   email: admin@mutluet.org
   name: Admin
   password: (aşağıdaki komutu çalıştırıp hash'i al)
   role: ADMIN
   authProvider: EMAIL
   ```

5. **Şifre hash'i oluştur:**
   ```bash
   cd ~/Mutluet/backend
   node -e "const bcrypt = require('bcrypt'); bcrypt.hash('admin123', 10).then(hash => console.log(hash));"
   ```
   Çıktıyı kopyala ve `password` alanına yapıştır.

6. **"Save 1 Change"** tıkla

✅ **Bitti!** Artık admin hesabın hazır.

**Detaylı anlatım:** `CREATE_ADMIN_USER.md` dosyasına bak.

---

## 2️⃣ ADIM 2: KULLANICI GÖRÜNÜMÜNDEN TEST ET (10 dakika)

### 2.1. Tarayıcıda Aç

```
http://localhost:5173
```

### 2.2. Kayıt Ol

1. **"Kayıt Ol"** tıkla
2. İsim: Test Kullanıcı
3. Email: test@example.com
4. Şifre: test123
5. **"Kayıt Ol"** butonuna tıkla

✅ **Ana sayfaya yönlendirileceksin**

### 2.3. Ana Sayfayı Test Et

Ana sayfada göreceklerin:
- 📊 **İstatistikler:** Bağışlar, Gönüllülük, Etkinlikler, Etkileşim
- 🎮 **4 Özellik:** Oyun Oyna, Eşleş, Sohbet, Keşfet
- 🎯 **Günün Görevi**
- ⭐ **Başarılar**
- 📅 **Yaklaşan Etkinlikler** (henüz boş)

### 2.4. Diğer Sayfaları Test Et

Alt menüden gezin:
- 🏠 **Ana Sayfa** - Dashboard
- 🏷️ **Kategoriler** - Bağış kategorileri
- 🗺️ **Harita** - Yakındaki yerler (Google Maps key gerekiyor)
- 💕 **Eşleşme** - Gönüllü eşleştirme
- 👤 **Profil** - Kendi profilin

### 2.5. Test Verisi Ekle (Opsiyonel)

Prisma Studio'da (`http://localhost:5555`) test etkinliği ekle:

1. **Event** tablosuna git
2. **Add Record** tıkla
3. Bilgileri gir:
   ```
   title: Kitap Bağışı Kampanyası
   description: Çocuklar için kitap topluyoruz
   category: EGITIM
   date: 2026-03-15 (gelecek bir tarih)
   time: 14:00
   location: Merkez Kütüphane
   currentParticipants: 5
   maxParticipants: 50
   ```
4. **Save** tıkla
5. Frontend'i yenile - Ana sayfada görünecek!

---

## 3️⃣ ADIM 3: ADMIN GÖRÜNÜMÜNDEN TEST ET (5 dakika)

### 3.1. Admin Olarak Giriş Yap

1. Çıkış yap (sağ üst)
2. **Giriş Yap:**
   - Email: admin@mutluet.org
   - Şifre: admin123

### 3.2. Profil Sayfasına Git

```
http://localhost:5173/profile
```

✅ **Mor/pembe "Admin Paneli" kartını göreceksin**

### 3.3. Admin Paneline Git

1. **"Admin Paneli"** kartına tıkla
2. Veya direkt: `http://localhost:5173/admin`

**Admin panelinde göreceklerin:**
- 📊 **4 İstatistik kartı:**
  - Toplam Kullanıcı
  - Aktif Kullanıcı
  - Toplam Bağış (₺)
  - Toplam Etkinlik

- 👥 **Son Kayıtlar:** En son kayıt olan 5 kullanıcı
- 📅 **Yaklaşan Etkinlikler:** İlk 3 etkinlik
- 💰 **Son Bağışlar:** Son 5 bağış
- ⚡ **Hızlı İşlemler:**
  - Prisma Studio aç
  - Kullanıcı Görünümü'ne geç
  - Verileri Yenile
  - Backend Status kontrol et

### 3.4. Hızlı İşlemleri Test Et

- **"Prisma Studio"** tıkla → Yeni sekmede database açılacak
- **"Kullanıcı Görünümü"** tıkla → Ana sayfaya döneceksin
- **"Backend Status"** tıkla → API health check açılacak

✅ **Admin paneli tamamen çalışıyor!**

---

## 4️⃣ ADIM 4: DEPLOY ET - İNTERNETTEN ERİŞİLEBİLİR YAP

### Seçenek A: VERCEL (ÖNERİLEN - ÜCRETSİZ)

#### 4.1. Vercel Hesabı Aç

1. https://vercel.com'a git
2. **"Sign Up"** tıkla
3. **"Continue with GitHub"** seç
4. GitHub hesabınla giriş yap

#### 4.2. Frontend Deploy Et

1. Vercel dashboard'da **"Add New"** > **"Project"** tıkla
2. **`omerfarukkural/Mutluet`** repository'sini seç
3. **"Import"** tıkla
4. Ayarlar:
   ```
   Framework Preset: Vite
   Root Directory: ./
   Build Command: pnpm build
   Output Directory: dist
   ```
5. **Environment Variables** ekle:
   ```
   VITE_API_URL=https://mutluet-backend.vercel.app/api
   ```
   (Backend deploy ettikten sonra güncelleyeceğiz)
6. **"Deploy"** tıkla
7. **2-3 dakika bekle**
8. ✅ URL alacaksın: `https://mutluet-abc123.vercel.app`

#### 4.3. Backend Deploy Et

**ÖNEMLİ:** Backend için database gerekiyor! Aşağıdaki adımları sırayla yap:

**A) Supabase Database Oluştur (Ücretsiz)**

1. https://supabase.com'a git
2. **"Start your project"** > GitHub ile giriş yap
3. **"New Project"** tıkla
4. Bilgileri gir:
   ```
   Name: mutluet-db
   Database Password: (güçlü bir şifre oluştur, kaydet!)
   Region: EU West (Frankfurt)
   ```
5. **"Create new project"** tıkla (30-60 saniye sürer)
6. Sol menüden **"Settings"** > **"Database"**
7. **"Connection string"** > **"URI"** sekmesi
8. **PostgreSQL connection string'i kopyala:**
   ```
   postgresql://postgres:[YOUR-PASSWORD]@db.abc123.supabase.co:5432/postgres
   ```

**B) Backend'i Vercel'e Deploy Et**

1. Vercel'de **"Add New"** > **"Project"**
2. **`omerfarukkural/Mutluet`** seç
3. **"Import"** tıkla
4. **Root Directory:** `backend` seç
5. **Environment Variables** ekle:
   ```
   DATABASE_URL=postgresql://postgres:...  (Supabase'den kopyaladığın)
   JWT_SECRET=super-secret-production-key-change-this-123456
   FRONTEND_URL=https://mutluet-abc123.vercel.app (frontend URL'in)
   PORT=3001
   ```
6. **"Deploy"** tıkla
7. **3-5 dakika bekle**
8. ✅ Backend URL'i alacaksın: `https://mutluet-backend.vercel.app`

**C) Database Migration Çalıştır**

```bash
cd ~/Mutluet/backend
DATABASE_URL="postgresql://postgres:..." npx prisma migrate deploy
```

(Supabase connection string'ini buraya yapıştır)

**D) Frontend Environment Variable'ı Güncelle**

1. Vercel'de frontend projesini aç
2. **"Settings"** > **"Environment Variables"**
3. `VITE_API_URL` değerini güncelle:
   ```
   VITE_API_URL=https://mutluet-backend.vercel.app/api
   ```
4. **"Save"** tıkla
5. **"Deployments"** > En son deployment > **"Redeploy"**

#### 4.4. Test Et

1. Frontend URL'ini aç: `https://mutluet-abc123.vercel.app`
2. Kayıt ol
3. Giriş yap
4. ✅ **ÇALIŞIYOR!**

---

### Seçenek B: AZURE (2000$ KREDİNLE)

**Daha detaylı:**
- `DEPLOYMENT.md` dosyasına bak
- Azure Portal'da Static Web App + App Service + Azure SQL kullan
- Tam profesyonel deployment

---

## 5️⃣ ADIM 5: DOMAIN BAĞLA (Opsiyonel)

### mutluet.bitebimuv.org Bağlama

#### Vercel'de:

1. Vercel'de frontend projesini aç
2. **"Settings"** > **"Domains"**
3. **"Add Domain"** tıkla
4. `mutluet.bitebimuv.org` yaz
5. **DNS kayıtlarını** kopyala (CNAME)
6. **Turhost**'a git (bitebimuv.org host'u)
7. DNS ayarlarına ekle:
   ```
   Type: CNAME
   Name: mutluet
   Value: cname.vercel-dns.com
   ```
8. 10-20 dakika bekle
9. ✅ `https://mutluet.bitebimuv.org` hazır!

---

## 6️⃣ ADIM 6: API KEYLERİ EKLE (Opsiyonel - Gelişmiş Özellikler)

### Google Login

1. https://console.cloud.google.com
2. Yeni proje oluştur: "Mutluet"
3. **"APIs & Services"** > **"Credentials"**
4. **"OAuth 2.0 Client ID"** oluştur
5. ID ve Secret'ı backend `.env`'e ekle:
   ```
   GOOGLE_CLIENT_ID=...
   GOOGLE_CLIENT_SECRET=...
   ```

### Stripe (Bağış Ödemeleri)

1. https://stripe.com/tr
2. Hesap aç
3. Dashboard > **"Developers"** > **"API Keys"**
4. Test API key'lerini al
5. Backend `.env`'e ekle:
   ```
   STRIPE_SECRET_KEY=sk_test_...
   STRIPE_PUBLISHABLE_KEY=pk_test_...
   ```

### Google Maps (Harita)

1. https://console.cloud.google.com
2. **"APIs & Services"** > **"Library"**
3. **"Maps JavaScript API"** etkinleştir
4. API Key oluştur
5. Frontend `.env`'e ekle:
   ```
   VITE_GOOGLE_MAPS_API_KEY=...
   ```

---

## 📝 CHECKLIST - TAMAMLANAN İŞLER

### Yerel Geliştirme
- [ ] Backend çalıştır (`cd backend && pnpm dev`)
- [ ] Frontend çalıştır (`cd ~/Mutluet && pnpm dev`)
- [ ] PostgreSQL başlat (`brew services start postgresql@16`)
- [ ] Admin kullanıcı oluştur (Prisma Studio)

### Test
- [ ] Kayıt/Giriş test et
- [ ] Ana sayfa çalışıyor
- [ ] Admin paneli erişilebilir
- [ ] Tüm sayfalar yükleniyor
- [ ] Backend API'ler çalışıyor (`curl http://localhost:3001/health`)

### Deployment
- [ ] Vercel hesabı aç
- [ ] Supabase database oluştur
- [ ] Backend deploy et
- [ ] Frontend deploy et
- [ ] Database migration çalıştır
- [ ] Production'da test et

### Opsiyonel
- [ ] Domain bağla (mutluet.bitebimuv.org)
- [ ] Google OAuth ekle
- [ ] Stripe entegrasyonu
- [ ] Google Maps ekle
- [ ] Facebook/TikTok login
- [ ] Email servisi (SendGrid)

---

## 🚨 SORUN GİDERME

### Backend çalışmıyor
```bash
cd ~/Mutluet/backend
pnpm dev
```

### Frontend çalışmıyor
```bash
cd ~/Mutluet
pnpm dev
```

### PostgreSQL çalışmıyor
```bash
brew services start postgresql@16
```

### Port kullanımda
```bash
# Backend (3001)
lsof -ti:3001 | xargs kill -9

# Frontend (5173)
lsof -ti:5173 | xargs kill -9
```

### Admin paneli görünmüyor
- Role kontrolü: Prisma Studio'da `role: ADMIN` olduğundan emin ol
- Çıkış yap ve tekrar giriş yap
- Browser cache'ini temizle

---

## 📚 DAHA FAZLA BİLGİ

- **Kullanım Rehberi:** `KULLANIM_REHBERI.md`
- **Deployment Detayları:** `DEPLOYMENT.md`
- **Proje Durumu:** `DURUM_RAPORU.md`
- **Admin Kullanıcı:** `CREATE_ADMIN_USER.md`
- **Genel Bilgi:** `README.md`

---

## 💬 YARDIM

Bir sorun olursa:
1. Dokümantasyonu oku
2. GitHub Issues'da ara
3. Backend loglarına bak (Terminal 1)
4. Frontend console'una bak (F12)

---

**Hazırlayan:** Claude Code
**Tarih:** 2 Mart 2026
**Proje:** Mutluet NGO Platform

✅ **HERŞEY HAZIR! ŞIMDI DEPLOY ET VE KULLANMAYA BAŞLA!** 🚀
