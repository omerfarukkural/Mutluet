# Vercel Deployment Rehberi

Bu doküman, Mutluet projesinin Vercel'e nasıl deploy edileceğini adım adım açıklar.

## 📋 Ön Gereksinimler

- GitHub hesabı
- Vercel hesabı (GitHub ile giriş yapabilirsiniz)
- Supabase veya başka bir PostgreSQL veritabanı (ücretsiz tier yeterli)

## 🚀 Deployment Adımları

### 1. Frontend Deployment (Ana Uygulama)

#### Adım 1: Vercel'e Giriş Yapın
1. https://vercel.com adresine gidin
2. "Sign Up" veya "Login" butonuna tıklayın
3. GitHub hesabınızla giriş yapın

#### Adım 2: Yeni Proje Oluşturun
1. Dashboard'da "New Project" butonuna tıklayın
2. GitHub repository'nizi seçin: `omerfarukkural/Mutluet`
3. "Import" butonuna tıklayın

#### Adım 3: Frontend Konfigürasyonu
```
Framework Preset: Vite
Build Command: pnpm run build
Output Directory: dist
Install Command: pnpm install
Root Directory: ./
```

#### Adım 4: Environment Variables Ekleyin
Vercel dashboard'da "Environment Variables" bölümüne aşağıdaki değişkenleri ekleyin:

**ZORUNLU:**
```
VITE_API_URL=https://mutluet-backend.vercel.app/api
VITE_SOCKET_URL=https://mutluet-backend.vercel.app
```

**OPSIYONEL (İhtiyaç duyduğunuzda ekleyin):**
```
VITE_GOOGLE_CLIENT_ID=your_google_client_id
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
VITE_SENTRY_DSN=your_sentry_dsn
```

#### Adım 5: Deploy Edin
"Deploy" butonuna tıklayın ve deployment'ın tamamlanmasını bekleyin.

---

### 2. Backend Deployment

#### Adım 1: Yeni Proje Oluşturun
1. Vercel dashboard'da tekrar "New Project" butonuna tıklayın
2. Aynı repository'yi seçin: `omerfarukkural/Mutluet`
3. "Import" butonuna tıklayın

#### Adım 2: Backend Konfigürasyonu
```
Framework Preset: Other
Build Command: cd backend && pnpm install
Output Directory: backend
Install Command: pnpm install
Root Directory: ./backend
```

#### Adım 3: Environment Variables Ekleyin

**ZORUNLU:**
```
DATABASE_URL=your_postgresql_connection_string
JWT_SECRET=your_super_secret_jwt_key_min_32_characters
NODE_ENV=production
FRONTEND_URL=https://your-frontend-url.vercel.app
```

**OPSIYONEL:**
```
SENDGRID_API_KEY=your_sendgrid_api_key
FROM_EMAIL=noreply@mutluet.org
STRIPE_SECRET_KEY=your_stripe_secret_key
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
```

#### Adım 4: Deploy Edin
"Deploy" butonuna tıklayın.

---

### 3. Veritabanı Kurulumu (Supabase)

#### Adım 1: Supabase Projesi Oluşturun
1. https://supabase.com adresine gidin
2. "New Project" oluşturun
3. Database password'ünüzü kaydedin

#### Adım 2: Connection String'i Alın
1. Supabase dashboard'da "Settings" > "Database" bölümüne gidin
2. "Connection string" altındaki "URI" formatını kopyalayın
3. `[YOUR-PASSWORD]` kısmını gerçek şifrenizle değiştirin

Örnek:
```
postgresql://postgres.xxxxx:YOUR-PASSWORD@aws-0-eu-central-1.pooler.supabase.com:5432/postgres
```

#### Adım 3: Schema'yı Migrate Edin
1. Backend Vercel deployment'ınıza gidin
2. "Settings" > "Functions" kısmında bir fonksiyon oluşturun veya
3. Lokal olarak migration çalıştırın:

```bash
# .env dosyanızda DATABASE_URL'i Supabase connection string'e güncelleyin
cd backend
pnpm install
npx prisma migrate deploy
```

#### Adım 4: Admin Kullanıcısı Oluşturun
Supabase SQL Editor'de aşağıdaki komutu çalıştırın:

```sql
-- Admin kullanıcısı oluştur
INSERT INTO "User" (
  id,
  email,
  name,
  password,
  role,
  "authProvider",
  "emailVerified",
  bio,
  location,
  "totalDonations",
  "volunteerHours",
  "eventsAttended",
  "engagementScore",
  "matchingEnabled",
  "createdAt",
  "updatedAt"
) VALUES (
  gen_random_uuid(),
  'admin@mutluet.org',
  'Admin Kullanıcısı',
  '$2a$10$kFUKauCV/r2mEIfkSR5V4uScjvrGKFJ225LXA5outQwbbweY7GF3.',
  'ADMIN',
  'EMAIL',
  true,
  'Mutluet Platformu Yöneticisi',
  'Türkiye',
  0,
  0,
  0,
  100,
  false,
  NOW(),
  NOW()
);
```

**Admin Giriş Bilgileri:**
- Email: `admin@mutluet.org`
- Şifre: `Antakya_123`

⚠️ **GÜVENLİK UYARISI:** İlk girişten sonra mutlaka şifrenizi değiştirin!

---

### 4. Domain ve CORS Ayarları

#### Frontend URL'ini Backend'e Bildirin
1. Backend Vercel projenize gidin
2. "Settings" > "Environment Variables" bölümünde `FRONTEND_URL`'i güncelleyin
3. Frontend'in Vercel URL'ini yazın (örn: `https://mutluet.vercel.app`)

#### Backend URL'ini Frontend'e Bildirin
1. Frontend Vercel projenize gidin
2. "Settings" > "Environment Variables" bölümünde güncelleyin:
```
VITE_API_URL=https://mutluet-backend.vercel.app/api
VITE_SOCKET_URL=https://mutluet-backend.vercel.app
```

#### Redeploy Edin
Her iki projeyi de "Deployments" sekmesinden redeploy edin.

---

## 🔍 Deployment Sonrası Kontroller

### 1. Frontend Kontrolü
1. Frontend URL'inizi açın
2. Ana sayfa yüklenmeli
3. Console'da hata olmamalı

### 2. Backend Kontrolü
```bash
# Health check
curl https://your-backend-url.vercel.app/health

# Veya tarayıcıda açın
https://your-backend-url.vercel.app/health
```

Beklenen response:
```json
{
  "status": "healthy",
  "timestamp": "2024-01-01T12:00:00.000Z"
}
```

### 3. Database Bağlantısı
```bash
# Events endpoint'ini test edin
curl https://your-backend-url.vercel.app/api/events
```

### 4. Admin Girişi
1. `/login` sayfasına gidin
2. Admin bilgileriyle giriş yapın
3. `/admin` paneline erişebildiğinizi kontrol edin

---

## 🐛 Sık Karşılaşılan Sorunlar

### 1. "Internal Server Error" (500)
**Sebep:** Database bağlantı sorunu
**Çözüm:**
- Vercel'de `DATABASE_URL` environment variable'ını kontrol edin
- Supabase'de IP whitelist ayarlarını kontrol edin (hepsine izin verin)

### 2. CORS Hatası
**Sebep:** Frontend URL'i backend'de tanımlı değil
**Çözüm:**
- Backend'de `FRONTEND_URL` environment variable'ını kontrol edin
- Değiştirdikten sonra redeploy edin

### 3. 404 Not Found (Frontend routes)
**Sebep:** SPA routing sorunu
**Çözüm:** `vercel.json` dosyasında rewrites doğru ayarlanmış olmalı:
```json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

### 4. Environment Variables Görünmüyor
**Sebep:** Build sırasında environment variables yüklenmemiş
**Çözüm:**
1. Vercel dashboard'da environment variables'ı ekleyin
2. "Redeploy" yapın (cache'siz)

---

## 📊 Monitoring ve Analytics

### Vercel Analytics
1. Vercel dashboard > Analytics sekmesi
2. Otomatik olarak aktif, ek kurulum gerekmez

### Error Tracking (Sentry)
1. Sentry hesabı oluşturun
2. Yeni proje oluşturun (React + Node.js)
3. DSN'leri alın
4. Environment variables'a ekleyin:
   - Frontend: `VITE_SENTRY_DSN`
   - Backend: `SENTRY_DSN`

---

## 🔐 Güvenlik Kontrol Listesi

- [ ] `JWT_SECRET` güçlü ve rastgele oluşturulmuş
- [ ] Database şifresi güçlü
- [ ] Admin şifresi değiştirilmiş
- [ ] `.env` dosyaları `.gitignore`'a eklenmiş
- [ ] CORS sadece kendi domain'inize izin veriyor
- [ ] HTTPS kullanılıyor (Vercel otomatik sağlar)
- [ ] Database production mode'da
- [ ] Sensitive data loglanmıyor

---

## 📞 Destek

Deployment sırasında sorun yaşarsanız:
1. Vercel logs'ları kontrol edin (Deployments > View Logs)
2. Browser console'u kontrol edin (F12)
3. Network tab'ı kontrol edin (API istekleri)
4. GitHub Issues'da sorun bildirin

---

## 🎉 Tebrikler!

Mutluet platformunuz artık production'da! 🚀

**Önemli Linkler:**
- Frontend: `https://your-app.vercel.app`
- Backend: `https://your-backend.vercel.app`
- Admin Panel: `https://your-app.vercel.app/admin`
- Vercel Dashboard: https://vercel.com/dashboard
- Supabase Dashboard: https://app.supabase.com
