# 🔑 API KEYS VE SERVİSLER - KAPSAMLI REHBER

## 📋 İÇİNDEKİLER

1. [Gerekli Servisler](#gerekli-servisler)
2. [Opsiyonel Servisler](#opsiyonel-servisler)
3. [Her Servis İçin Adım Adım Kurulum](#kurulum-adımları)
4. [Environment Variables Yapılandırması](#environment-variables)
5. [Test ve Doğrulama](#test-ve-doğrulama)

---

## ✅ GEREKLİ SERVİSLER (Uygulama Çalışması İçin)

### 1. **PostgreSQL Database** ✅ KURULU
- **Ne İşe Yarar:** Tüm verileri saklar (kullanıcılar, bağışlar, etkinlikler)
- **Durum:** ✅ Kurulu ve çalışıyor
- **URL:** localhost:5432
- **Database:** mutluet
- **Maliyet:** Ücretsiz (local)

---

## 🎯 OPSİYONEL SERVİSLER (Ekstra Özellikler İçin)

### Seviye 1: TEMEL ÖZELLİKLER

#### 1. Google OAuth (Giriş Yapma)
- **Ne İşe Yarar:** Kullanıcılar Google hesabıyla giriş yapabilir
- **Gerekli mi:** Hayır (email/şifre zaten var)
- **Maliyet:** Ücretsiz
- **Kurulum Süresi:** 10 dakika

#### 2. Stripe (Ödeme)
- **Ne İşe Yarar:** Kullanıcılar kredi kartıyla bağış yapabilir
- **Gerekli mi:** Hayır (manuel bağış kaydı zaten var)
- **Maliyet:** %2.9 + ₺0.30 komisyon (işlem başına)
- **Kurulum Süresi:** 15 dakika

### Seviye 2: GELİŞMİŞ ÖZELLİKLER

#### 3. Google Maps API (Harita)
- **Ne İşe Yarar:** Yakındaki organizasyonları haritada gösterir
- **Gerekli mi:** Hayır (liste halinde zaten gösteriyor)
- **Maliyet:** $200 ücretsiz kredi/ay
- **Kurulum Süresi:** 5 dakika

#### 4. Cloudinary (Fotoğraf Yükleme)
- **Ne İşe Yarar:** Etkinlik fotoğraflarını cloud'da saklar
- **Gerekli mi:** Hayır (base64 olarak da saklanabilir)
- **Maliyet:** 25GB ücretsiz
- **Kurulum Süresi:** 5 dakika

### Seviye 3: PRO ÖZELLİKLER

#### 5. SendGrid (Email)
- **Ne İşe Yarar:** Kullanıcılara email gönderir (bildirimler, şifre sıfırlama)
- **Gerekli mi:** Hayır
- **Maliyet:** 100 email/gün ücretsiz
- **Kurulum Süresi:** 10 dakika

#### 6. Azure Communication Services (Video Call)
- **Ne İşe Yarar:** Kullanıcılar video görüşme yapabilir
- **Gerekli mi:** Hayır
- **Maliyet:** $2000 Azure kredin var
- **Kurulum Süresi:** 30 dakika

#### 7. Sentry (Error Tracking)
- **Ne İşe Yarar:** Production'daki hataları takip eder
- **Gerekli mi:** Production için önerilen
- **Maliyet:** 5000 event/ay ücretsiz
- **Kurulum Süresi:** 5 dakika

---

## 📖 KURULUM ADIMLARI

### 🔵 1. GOOGLE OAUTH (Sosyal Giriş)

#### Adım 1: Google Cloud Console'a Git
```
https://console.cloud.google.com
```

#### Adım 2: Yeni Proje Oluştur
1. Sol üstten "Select a project"
2. "NEW PROJECT" tıkla
3. Proje adı: `Mutluet`
4. "CREATE" tıkla

#### Adım 3: OAuth Consent Screen Ayarla
1. Sol menüden "APIs & Services" > "OAuth consent screen"
2. User Type: **External** seç
3. "CREATE" tıkla
4. Bilgileri doldur:
   ```
   App name: Mutluet
   User support email: senin@email.com
   Developer contact: senin@email.com
   ```
5. "SAVE AND CONTINUE" (3 kez)

#### Adım 4: Credentials Oluştur
1. Sol menüden "Credentials"
2. "CREATE CREDENTIALS" > "OAuth client ID"
3. Application type: **Web application**
4. Name: `Mutluet Web Client`
5. Authorized JavaScript origins:
   ```
   http://localhost:5173
   https://mutluet.vercel.app  (production URL'in)
   ```
6. Authorized redirect URIs:
   ```
   http://localhost:5173/auth/google/callback
   https://mutluet.vercel.app/auth/google/callback
   ```
7. "CREATE" tıkla
8. **Client ID** ve **Client Secret** kopyala

#### Adım 5: .env Dosyasına Ekle
```bash
# Backend: ~/Mutluet/backend/.env
GOOGLE_CLIENT_ID=123456789-abcdefg.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-abc123def456

# Frontend: ~/Mutluet/.env
VITE_GOOGLE_CLIENT_ID=123456789-abcdefg.apps.googleusercontent.com
```

#### Adım 6: Test Et
1. Uygulamayı yeniden başlat
2. Login sayfasında "Google ile Giriş Yap" butonuna tıkla
3. Google hesabı seç
4. ✅ Giriş başarılı!

**Maliyet:** ✅ Ücretsiz

---

### 💳 2. STRIPE (Ödeme Sistemi)

#### Adım 1: Stripe Hesabı Aç
```
https://stripe.com/tr
```
1. "Hemen Başlayın" tıkla
2. Email, isim, şifre gir
3. Email'i doğrula

#### Adım 2: Dashboard'a Git
```
https://dashboard.stripe.com
```

#### Adım 3: Test API Keys Al
1. Sol menüden "Developers" > "API keys"
2. **Test mode** (üstte toggle) açık olsun
3. İki key göreceksin:
   - **Publishable key** (pk_test_...)
   - **Secret key** (sk_test_...) - "Reveal" tıkla

#### Adım 4: .env Dosyasına Ekle
```bash
# Backend: ~/Mutluet/backend/.env
STRIPE_SECRET_KEY=sk_test_51ABC123...

# Frontend: ~/Mutluet/.env
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_51ABC123...
```

#### Adım 5: Stripe.js Kütüphanesi Ekle
```bash
cd ~/Mutluet
pnpm install @stripe/stripe-js @stripe/react-stripe-js
```

#### Adım 6: Production İçin Live Keys
Production'a geçtiğinde:
1. Stripe'da hesap bilgilerini tamamla (KYC)
2. "Developers" > "API keys" > **Live mode** toggle
3. Live keys'i production .env'e ekle

**Maliyet:**
- Test: ✅ Ücretsiz
- Production: %2.9 + ₺0.30/işlem

---

### 🗺️ 3. GOOGLE MAPS API

#### Adım 1: Google Cloud Console (Aynı Proje)
```
https://console.cloud.google.com
```
Yukarıda oluşturduğun "Mutluet" projesini seç

#### Adım 2: Maps JavaScript API'yi Aktifleştir
1. Sol menüden "APIs & Services" > "Library"
2. "Maps JavaScript API" ara
3. "ENABLE" tıkla

#### Adım 3: API Key Oluştur
1. "APIs & Services" > "Credentials"
2. "CREATE CREDENTIALS" > "API key"
3. API key kopyala
4. (Opsiyonel) "RESTRICT KEY" > HTTP referrers ekle:
   ```
   localhost:5173/*
   mutluet.vercel.app/*
   ```

#### Adım 4: .env'e Ekle
```bash
# Frontend: ~/Mutluet/.env
VITE_GOOGLE_MAPS_API_KEY=AIzaSyABC123...
```

#### Adım 5: Script Tag Ekle
```typescript
// src/app/components/map.tsx içinde
useEffect(() => {
  const script = document.createElement('script');
  script.src = `https://maps.googleapis.com/maps/api/js?key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}&libraries=places`;
  script.async = true;
  document.body.appendChild(script);
}, []);
```

**Maliyet:**
- $200 ücretsiz kredi/ay
- Sonra $7/1000 istek

---

### ☁️ 4. CLOUDINARY (Fotoğraf Depolama)

#### Adım 1: Cloudinary Hesabı Aç
```
https://cloudinary.com/users/register/free
```

#### Adım 2: Dashboard Bilgilerini Al
```
https://cloudinary.com/console
```
Göreceğin bilgiler:
- **Cloud Name:** abc123def
- **API Key:** 123456789012345
- **API Secret:** abcdefGHIJKLmnopqr

#### Adım 3: .env'e Ekle
```bash
# Backend: ~/Mutluet/backend/.env
CLOUDINARY_CLOUD_NAME=abc123def
CLOUDINARY_API_KEY=123456789012345
CLOUDINARY_API_SECRET=abcdefGHIJKLmnopqr
```

#### Adım 4: Kütüphane Kur
```bash
cd ~/Mutluet/backend
pnpm install cloudinary
```

#### Adım 5: Upload Fonksiyonu
```typescript
// backend/src/utils/upload.ts
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const uploadImage = async (base64: string) => {
  const result = await cloudinary.uploader.upload(base64, {
    folder: 'mutluet/events',
  });
  return result.secure_url;
};
```

**Maliyet:**
- 25GB storage ücretsiz
- 25GB bandwidth/ay ücretsiz

---

### 📧 5. SENDGRID (Email Servisi)

#### Adım 1: SendGrid Hesabı Aç
```
https://signup.sendgrid.com
```

#### Adım 2: API Key Oluştur
1. Dashboard > Settings > API Keys
2. "Create API Key" tıkla
3. Name: `Mutluet Backend`
4. Permissions: **Full Access**
5. "Create & View" tıkla
6. API key kopyala (BIR KEZ GÖSTER İLİR!)

#### Adım 3: Sender Identity Doğrula
1. Settings > Sender Authentication
2. "Verify a Single Sender" seç
3. Email ve bilgilerini gir
4. Email'deki linke tıkla

#### Adım 4: .env'e Ekle
```bash
# Backend: ~/Mutluet/backend/.env
SENDGRID_API_KEY=SG.abc123def456...
SENDGRID_FROM_EMAIL=noreply@bitebimuv.org
```

#### Adım 5: Kütüphane Kur
```bash
cd ~/Mutluet/backend
pnpm install @sendgrid/mail
```

#### Adım 6: Email Gönder Fonksiyonu
```typescript
// backend/src/utils/email.ts
import sgMail from '@sendgrid/mail';

sgMail.setApiKey(process.env.SENDGRID_API_KEY!);

export const sendEmail = async (
  to: string,
  subject: string,
  html: string
) => {
  await sgMail.send({
    to,
    from: process.env.SENDGRID_FROM_EMAIL!,
    subject,
    html,
  });
};

// Kullanım
await sendEmail(
  'user@example.com',
  'Mutluet\'e Hoş Geldiniz!',
  '<h1>Merhaba!</h1><p>Kaydınız başarıyla oluşturuldu.</p>'
);
```

**Maliyet:**
- 100 email/gün ücretsiz
- Sonra $14.95/ay (40,000 email)

---

### 🎥 6. AZURE COMMUNICATION SERVICES (Video Call)

#### Adım 1: Azure Portal
```
https://portal.azure.com
```
($2000 kredin var!)

#### Adım 2: Communication Service Oluştur
1. "Create a resource" tıkla
2. "Communication Services" ara
3. "Create" tıkla
4. Bilgileri doldur:
   ```
   Resource group: mutluet-rg (yeni oluştur)
   Name: mutluet-video
   Region: West Europe
   ```
5. "Review + create" > "Create"

#### Adım 3: Keys Al
1. Resource'u aç
2. Sol menüden "Keys"
3. **Connection string** kopyala

#### Adım 4: .env'e Ekle
```bash
# Backend: ~/Mutluet/backend/.env
AZURE_COMMUNICATION_CONNECTION_STRING=endpoint=https://...
```

#### Adım 5: SDK Kur
```bash
cd ~/Mutluet
pnpm install @azure/communication-react
pnpm install @azure/communication-calling
```

**Maliyet:**
- Senin $2000 Azure kredin var
- Audio: $0.004/dakika
- Video: $0.024/dakika
- İlk 10,000 dakika ÜCRETSİZ

---

### 🐛 7. SENTRY (Error Tracking)

#### Adım 1: Sentry Hesabı Aç
```
https://sentry.io/signup/
```

#### Adım 2: Proje Oluştur
1. Platform seç: **React**
2. Proje adı: `mutluet-frontend`
3. "Create Project" tıkla

#### Adım 3: DSN Kopyala
```
https://abc123def@o123456.ingest.sentry.io/789012
```

#### Adım 4: .env'e Ekle
```bash
# Frontend: ~/Mutluet/.env
VITE_SENTRY_DSN=https://abc123def@o123456.ingest.sentry.io/789012
```

#### Adım 5: SDK Kur (Zaten var!)
```bash
cd ~/Mutluet
pnpm install @sentry/react
```

#### Adım 6: Initialize Et
```typescript
// src/main.tsx (zaten hazır)
import * as Sentry from "@sentry/react";

if (import.meta.env.PROD) {
  Sentry.init({
    dsn: import.meta.env.VITE_SENTRY_DSN,
    integrations: [
      new Sentry.BrowserTracing(),
      new Sentry.Replay(),
    ],
    tracesSampleRate: 1.0,
  });
}
```

**Maliyet:**
- 5,000 errors/ay ücretsiz
- Sonra $26/ay

---

## 🔐 ENVIRONMENT VARIABLES (Tüm Liste)

### Backend (.env)
```bash
# ~/Mutluet/backend/.env

# Database (✅ Gerekli)
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/mutluet?schema=public"

# JWT (✅ Gerekli)
JWT_SECRET="mutluet-super-secret-jwt-key-2026-change-in-production"

# Server
PORT=3001
FRONTEND_URL="http://localhost:5173"

# Google OAuth (⏳ Opsiyonel)
GOOGLE_CLIENT_ID=123456789-abcdefg.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-abc123def456

# Stripe (⏳ Opsiyonel)
STRIPE_SECRET_KEY=sk_test_51ABC123...

# Cloudinary (⏳ Opsiyonel)
CLOUDINARY_CLOUD_NAME=abc123def
CLOUDINARY_API_KEY=123456789012345
CLOUDINARY_API_SECRET=abcdefGHIJKLmnopqr

# SendGrid (⏳ Opsiyonel)
SENDGRID_API_KEY=SG.abc123def456...
SENDGRID_FROM_EMAIL=noreply@bitebimuv.org

# Azure (⏳ Opsiyonel)
AZURE_COMMUNICATION_CONNECTION_STRING=endpoint=https://...
```

### Frontend (.env)
```bash
# ~/Mutluet/.env

# API URL (✅ Gerekli)
VITE_API_URL=http://localhost:3001/api

# Google OAuth (⏳ Opsiyonel)
VITE_GOOGLE_CLIENT_ID=123456789-abcdefg.apps.googleusercontent.com

# Stripe (⏳ Opsiyonel)
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_51ABC123...

# Google Maps (⏳ Opsiyonel)
VITE_GOOGLE_MAPS_API_KEY=AIzaSyABC123...

# Sentry (⏳ Opsiyonel)
VITE_SENTRY_DSN=https://abc123def@o123456.ingest.sentry.io/789012
```

---

## ✅ TEST VE DOĞRULAMA

### Test 1: Environment Variables Yüklendi mi?
```bash
# Backend
cd ~/Mutluet/backend
node -e "console.log(process.env.GOOGLE_CLIENT_ID)"

# Frontend
cd ~/Mutluet
echo $VITE_GOOGLE_CLIENT_ID
```

### Test 2: Google OAuth Çalışıyor mu?
1. http://localhost:5173/login
2. "Google ile Giriş Yap" tıkla
3. Google popup açılmalı
4. Hesap seç
5. ✅ Ana sayfaya yönlendirildin mi?

### Test 3: Stripe Test Payment
1. Bağış sayfasına git
2. Test kartı kullan:
   ```
   Kart: 4242 4242 4242 4242
   Tarih: 12/34
   CVC: 123
   ```
3. ✅ Başarılı mesajı aldın mı?

### Test 4: Sentry Error Logging
1. Console'da:
   ```javascript
   throw new Error("Test error for Sentry");
   ```
2. Sentry dashboard'a git
3. ✅ Error görünüyor mu?

---

## 📊 ÖNCELİK SIRASI

### Şimdi Kur (Temel):
1. ✅ PostgreSQL (zaten kurulu)
2. ✅ JWT Secret (zaten var)

### Bu Hafta (Önemli):
3. Google OAuth (sosyal giriş)
4. Cloudinary (fotoğraf yükleme)
5. Sentry (hata takibi)

### Sonra (İleri Seviye):
6. Stripe (ödeme)
7. SendGrid (email)
8. Google Maps (harita)
9. Azure Video (görüntülü konuşma)

---

## 🚨 GÜVENLİK UYARILARI

### ❌ ASLA YAPMA:
1. API key'leri GitHub'a commit etme
2. `.env` dosyalarını public yapma
3. Secret key'leri frontend'te kullanma
4. Production'da test keys kullanma

### ✅ MUTLAKA YAP:
1. `.env` dosyalarını `.gitignore`'a ekle (✅ zaten eklendi)
2. Production için farklı keys kullan
3. Key'leri environment variables olarak sakla
4. İhtiyaç duyduğunda key'leri rotate et

---

## 💰 MALİYET ÖZET İ

| Servis | Ücretsiz Limit | Ücretli Plan |
|--------|----------------|--------------|
| PostgreSQL (Local) | ♾️ Sınırsız | - |
| Google OAuth | ♾️ Sınırsız | Ücretsiz |
| Stripe | Test: Sınırsız | %2.9 + ₺0.30 |
| Google Maps | $200 kredi/ay | $7/1000 istek |
| Cloudinary | 25GB | $89/ay (100GB) |
| SendGrid | 100 email/gün | $14.95/ay |
| Azure | $2000 kredin var | Sonra ücretli |
| Sentry | 5000 error/ay | $26/ay |

**İlk Yıl Tahmini Maliyet:** $0-50 (sadece Stripe komisyonu)

---

## 🎯 SONUÇ

**Şu An Çalışan:**
- ✅ Email/Şifre girişi
- ✅ Profil yönetimi
- ✅ Etkinlik listeleme
- ✅ Manuel bağış kaydı

**API Key Eklenirse:**
- 🔵 Google ile giriş
- 💳 Kredi kartı ile bağış
- 🗺️ Harita görünümü
- 📧 Email bildirimleri
- 🎥 Video görüşme
- 🐛 Hata takibi

**Hangilerini Kurmalısın?**
- **Minimum:** Hiçbiri (uygulama zaten çalışıyor!)
- **Önerilen:** Google OAuth + Cloudinary + Sentry
- **Full Stack:** Hepsi

---

**Sorularını sorabilirsin!** 🚀

**İlgili Dosyalar:**
- `.env.example` - Örnek environment variables
- `backend/.env` - Backend secrets
- `.env` - Frontend secrets
