# 🔑 MutluET - API Anahtarları Tam Rehberi

> **Son güncelleme:** 15 Mart 2026
> **Proje:** MutluET (Bir Tebessüm Bin Mutluluk Derneği)
> **Domainler:** mutluet.org, bitebimuv.org

---

## 📊 DURUM ÖZETİ

### ✅ Zaten Çalışan (Alınmış) Servisler
| Servis | .env Adı | Durum |
|--------|----------|-------|
| Supabase (PostgreSQL DB) | `DATABASE_URL` | ✅ Aktif |
| JWT Secret | `JWT_SECRET` | ✅ Oluşturulmuş |
| WordPress SSO | `WORDPRESS_JWT_SECRET` | ✅ Oluşturulmuş |
| Vercel | `VERCEL_PROJECT_ID` | ✅ Aktif |
| Azure Subscription | `AZURE_SUBSCRIPTION_ID` | ✅ Aktif |
| OpenAI API | `OPENAI_API_KEY` | ✅ Aktif (AI/MCP için) |
| Claude API | `CLAUDE_API_KEY` | ✅ Aktif (AI/MCP için) |

### 🔴 Alınması GEREKEN API Anahtarları
| # | Servis | .env Adı | Öncelik | Maliyet |
|---|--------|----------|---------|---------|
| 1 | Google OAuth | `GOOGLE_CLIENT_ID` + `GOOGLE_CLIENT_SECRET` | 🔴 Acil | Ücretsiz |
| 2 | Google Maps | `VITE_GOOGLE_MAPS_API_KEY` + `GOOGLE_MAPS_API_KEY_BACKEND` | 🔴 Acil | $200/ay kredi (ücretsiz) |
| 3 | Stripe / iyzico | `STRIPE_SECRET_KEY` + `STRIPE_WEBHOOK_SECRET` + `VITE_STRIPE_PUBLISHABLE_KEY` | 🔴 Acil | Ücretsiz (komisyon bazlı) |
| 4 | SendGrid | `SENDGRID_API_KEY` | 🟡 Orta | Ücretsiz (100 email/gün) |
| 5 | Sentry | `SENTRY_DSN` + `VITE_SENTRY_DSN` | 🟡 Orta | Ücretsiz (5K event/ay) |
| 6 | Telegram Bot | `TELEGRAM_BOT_TOKEN` + `TELEGRAM_CHAT_ID` | 🟢 Düşük | Ücretsiz |
| 7 | Facebook OAuth | `FACEBOOK_APP_ID` + `FACEBOOK_APP_SECRET` | 🟢 Düşük | Ücretsiz |
| 8 | TikTok OAuth | `TIKTOK_CLIENT_KEY` + `TIKTOK_CLIENT_SECRET` | 🟢 Düşük | Ücretsiz |
| 9 | Firebase (Flutter) | `google-services.json` + `GoogleService-Info.plist` | 🟡 Orta | Ücretsiz |

---

## 🔴 1. GOOGLE OAUTH (Sosyal Giriş - ACİL)

### Neden Gerekli?
- "Google ile Giriş" butonu (`oauth.ts` → `/api/oauth/google`)
- `auth.ts` → `/api/auth/social/google`

### Kayıt Linki
👉 **https://console.cloud.google.com/apis/credentials**

### Adımlar
1. Google Cloud Console'a git → **Proje seç** veya yeni oluştur: `mutluet`
2. Sol menü → **APIs & Services** → **Credentials**
3. **+ CREATE CREDENTIALS** → **OAuth client ID**
4. **Application type:** Web application
5. **Name:** MutluET Web
6. **Authorized JavaScript origins:**
   ```
   http://localhost:5173
   https://mutluet.org
   https://app.mutluet.org
   ```
7. **Authorized redirect URIs:**
   ```
   http://localhost:3001/auth/google/callback
   https://api.mutluet.org/auth/google/callback
   ```
8. **CREATE** tıkla

### .env'ye Kaydet
```bash
# Backend (.env)
GOOGLE_CLIENT_ID="xxxxxxxxxxxx-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="GOCSPX-xxxxxxxxxxxxxxxxxxxxxxxx"

# Frontend (.env) - Aynı Client ID
VITE_GOOGLE_CLIENT_ID="xxxxxxxxxxxx-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx.apps.googleusercontent.com"
```

### ⚠️ Önemli
- **OAuth consent screen** konfigüre edilmeli (External seç, app name: MutluET)
- **Scopes:** `email`, `profile`, `openid` yeterli
- Test kullanıcıları ekle veya "In production" yap

---

## 🔴 2. GOOGLE MAPS API (Harita & Konum - ACİL)

### Neden Gerekli?
- Frontend: Etkinlik haritası, kuruluş konumları (`google_maps_flutter`, `VITE_GOOGLE_MAPS_API_KEY`)
- Backend: Geocoding, mesafe hesaplama (`organization.ts`)
- Flutter app: `google_maps_flutter` paketi

### Kayıt Linki
👉 **https://console.cloud.google.com/google/maps-apis/overview**

### Adımlar
1. Google Cloud Console → **APIs & Services** → **Library**
2. Şu API'leri etkinleştir:
   - ✅ Maps JavaScript API (web)
   - ✅ Maps SDK for Android (mobil)
   - ✅ Maps SDK for iOS (mobil)
   - ✅ Geocoding API (adres → koordinat)
   - ✅ Places API (yer arama)
3. **Credentials** → **+ CREATE CREDENTIALS** → **API Key**
4. **Restrict key** → HTTP referrers:
   ```
   localhost:5173/*
   mutluet.org/*
   app.mutluet.org/*
   ```

### .env'ye Kaydet
```bash
# Frontend (.env)
VITE_GOOGLE_MAPS_API_KEY="AIzaSy-xxxxxxxxxxxxxxxxxxxxxxxx"

# Backend (.env)
GOOGLE_MAPS_API_KEY_BACKEND="AIzaSy-xxxxxxxxxxxxxxxxxxxxxxxx"
```

### 💰 Maliyet
- Google, aylık **$200 ücretsiz kredi** verir — çoğu proje için yeterli
- STK olarak ek kredi talep edebilirsin: https://cloud.google.com/nonprofit

---

## 🔴 3. ÖDEME SİSTEMİ (Stripe VEYA iyzico)

### Stripe (Uluslararası)

#### Neden?
- `donation.ts` → `stripePaymentId` alanı kullanıyor
- `donate.tsx` → Kredi kartı, dijital cüzdan seçenekleri

#### Kayıt Linki
👉 **https://dashboard.stripe.com/register**

#### Türkiye'de Durum
- ✅ Stripe 2023'ten beri Türkiye'de aktif
- ✅ TL cinsinden ödeme alabilirsin
- Komisyon: %3.9 + 0,40₺ (yerli kart), %4.9 + 0,40₺ (uluslararası)

#### .env'ye Kaydet
```bash
# Backend (.env)
STRIPE_SECRET_KEY="sk_live_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
STRIPE_WEBHOOK_SECRET="whsec_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"

# Frontend (.env)
VITE_STRIPE_PUBLISHABLE_KEY="pk_live_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
```

### iyzico (Alternatif - Yerli)

#### Kayıt Linki
👉 **https://www.iyzico.com/uye-is-yeri-basvurusu**

#### Avantajları
- 🇹🇷 Tamamen Türk firması
- Daha düşük komisyon: %2.99 + 0,35₺
- BKM Express, Papara, Param destekli
- STK'lara özel indirimli komisyon

#### .env'ye Kaydet (iyzico tercih edilirse)
```bash
# Backend (.env)
IYZICO_API_KEY="sandbox-xxxxxxxxxxxxxxxx"
IYZICO_SECRET_KEY="sandbox-xxxxxxxxxxxxxxxx"
IYZICO_BASE_URL="https://sandbox-api.iyzipay.com"  # Test
# Production: https://api.iyzipay.com
```

### 📌 Tavsiyem
> STK olarak **iyzico** tercih et: Daha düşük komisyon + Papara desteği + Türk müşteri desteği
> Uluslararası bağış istiyorsan **Stripe** da ayrıca aktif et

---

## 🟡 4. SENDGRID (Email Servisi)

### Neden Gerekli?
- `auth.ts` → Magic Link gönderimi (`TODO: Send email with magic link`)
- Bağış makbuzu email'i
- Etkinlik bildirimleri

### Kayıt Linki
👉 **https://signup.sendgrid.com/**

### Adımlar
1. Hesap oluştur
2. **Settings** → **API Keys** → **Create API Key**
3. **Full Access** seç veya **Restricted Access** (Mail Send only)
4. **Sender Authentication:**
   - Single Sender: `noreply@mutluet.org` veya `bilgi@bitebimuv.org`
   - Veya Domain Authentication: `mutluet.org` için DNS kayıtları ekle

### .env'ye Kaydet
```bash
# Backend (.env)
SENDGRID_API_KEY="SG.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
FROM_EMAIL="noreply@mutluet.org"
```

### 💰 Maliyet
- **Ücretsiz:** 100 email/gün (3000/ay) — başlangıç için yeterli

---

## 🟡 5. SENTRY (Hata Takibi)

### Neden Gerekli?
- `ErrorBoundary.tsx` → Production'da hata yakalama
- Backend exception tracking

### Kayıt Linki
👉 **https://sentry.io/signup/**

### Adımlar
1. Hesap oluştur → Org: `bitebimuv`
2. **Create Project** → **React** (frontend) → Project name: `mutluet-frontend`
3. **Create Project** → **Node.js** (backend) → Project name: `mutluet-backend`
4. DSN'leri kopyala

### .env'ye Kaydet
```bash
# Frontend (.env)
VITE_SENTRY_DSN="https://xxxxxxxxxxxxxxxxxxxxx@o123456.ingest.sentry.io/1234567"

# Backend (.env)
SENTRY_DSN="https://xxxxxxxxxxxxxxxxxxxxx@o123456.ingest.sentry.io/7654321"
```

### 💰 Maliyet
- **Ücretsiz:** 5.000 event/ay — başlangıç için fazlasıyla yeter

---

## 🟢 6. TELEGRAM BOT (Bildirim & Monitoring)

### Neden Gerekli?
- n8n ile entegre: Yeni bağış, yeni üye bildirimleri
- Admin'e anlık bildirim

### Kayıt Linki
👉 **Telegram'da @BotFather'a mesaj at**

### Adımlar
1. Telegram → @BotFather → `/newbot`
2. Bot adı: `MutluET Bildirim`
3. Username: `mutluet_bot`
4. Token'ı al
5. Grup oluştur → Bot'u ekle → Grup Chat ID'sini al:
   - `https://api.telegram.org/bot<TOKEN>/getUpdates`

### .env'ye Kaydet
```bash
TELEGRAM_BOT_TOKEN="1234567890:ABCdefGHIjklMNOpqrSTUvwxYZ"
TELEGRAM_CHAT_ID="-1001234567890"
```

---

## 🟢 7. FACEBOOK OAUTH (Opsiyonel)

### Kayıt Linki
👉 **https://developers.facebook.com/apps/**

### Adımlar
1. **Create App** → **Consumer** → App name: `MutluET`
2. **Facebook Login** → **Settings**
3. Valid OAuth Redirect URIs:
   ```
   http://localhost:3001/auth/facebook/callback
   https://api.mutluet.org/auth/facebook/callback
   ```

### .env'ye Kaydet
```bash
FACEBOOK_APP_ID="xxxxxxxxxxxxxxxxxx"
FACEBOOK_APP_SECRET="xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
```

---

## 🟢 8. TIKTOK OAUTH (Opsiyonel)

### Kayıt Linki
👉 **https://developers.tiktok.com/**

### .env'ye Kaydet
```bash
TIKTOK_CLIENT_KEY="xxxxxxxxxxxxxxxx"
TIKTOK_CLIENT_SECRET="xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
```

---

## 🟡 9. FIREBASE (Flutter App - Push Notification)

### Neden Gerekli?
- `mutluet_app/` → Flutter mobil uygulama
- Push notification (firebase_messaging)
- Analytics (firebase_analytics)
- Auth (firebase_auth)

### Kayıt Linki
👉 **https://console.firebase.google.com/**

### Adımlar
1. **Add project** → `mutluet`
2. **Add app** → Android:
   - Package name: `org.bitebimuv.mutluet`
   - Download `google-services.json` → `mutluet_app/android/app/`
3. **Add app** → iOS:
   - Bundle ID: `org.bitebimuv.mutluet`
   - Download `GoogleService-Info.plist` → `mutluet_app/ios/Runner/`
4. **Cloud Messaging** → Server key al

### Dosyalara Kaydet
```
mutluet_app/android/app/google-services.json  (otomatik indirilir)
mutluet_app/ios/Runner/GoogleService-Info.plist (otomatik indirilir)
```

---

## 🔵 n8n.mutluet.org İÇİN GEREKENLER

### n8n Nedir?
Otomasyon platformu. Şu iş akışlarını çalıştıracak:
- Yeni bağış → Telegram bildirim + Email makbuzu
- Yeni üye → Hoşgeldin emaili
- Yeni etkinlik → Sosyal medya paylaşımı
- Haftalık rapor → Admin'e email

### n8n Kurulum Yeri
- **Seçenek A:** Azure VM (B1s) — ~$10/ay
- **Seçenek B:** Railway.app — Ücretsiz başlangıç
- **Seçenek C:** Coolify (self-hosted) — Organize klasöründe mevcut

### n8n İçin Gereken API'ler
| Servis | n8n'de Kullanım |
|--------|-----------------|
| SendGrid API | Email gönderimi |
| Telegram Bot Token | Anlık bildirimler |
| Stripe/iyzico Webhook | Bağış bildirimi tetikleme |
| Supabase/PostgreSQL | DB okuma/yazma |
| OpenAI API (mevcut) | AI ile otomatik yanıtlar |

---

## 🌐 DEPLOYMENT MİMARİSİ

```
mutluet.org (WordPress)  ← WordPress hosting (mevcut)
    ↕ SSO (JWT)
app.mutluet.org (Frontend) ← Vercel (ücretsiz)
    ↕ API calls
api.mutluet.org (Backend)  ← Vercel Serverless VEYA Azure App Service
    ↕ DB
db.xxx.supabase.co         ← Supabase (mevcut, ücretsiz)
    
n8n.mutluet.org            ← Railway / Azure VM / Coolify
```

---

## 📦 .env NEREDE SAKLAMALI?

### Lokal Geliştirme
```
/Mutluet/.env              ← Frontend (Vite) — VITE_ prefix'li olanlar
/Mutluet/backend/.env      ← Backend (Express)
```

### Production (Vercel)
- Vercel Dashboard → Project Settings → Environment Variables
- Tüm `VITE_*` değişkenlerini buraya ekle

### Production (Azure App Service)
- Azure Portal → App Service → Configuration → Application settings
- Tüm backend değişkenlerini buraya ekle

### Infisical?
- **Tavsiye:** Şu an Infisical'a gerek yok. Vercel + Azure portal yeterli.
- İleride takım büyürse (3+ geliştirici), Infisical düşünülebilir.
- **Alternatif:** Doppler (https://doppler.com) — startup'lar için ücretsiz

---

## ⚡ HIZLI BAŞLANGIÇ SIRASI

### Adım 1 — Bugün Yapılabilir (15 dk)
1. ✅ Google Cloud Console → OAuth + Maps API → **2 anahtar**
2. ✅ Sentry hesabı aç → **2 DSN**
3. ✅ Telegram @BotFather → **1 token + 1 chat ID**

### Adım 2 — Bu Hafta (30 dk)
4. SendGrid hesabı aç → Domain doğrulama → **1 API key**
5. Stripe VEYA iyzico başvurusu yap → **3 anahtar**

### Adım 3 — Mobil App İçin (1 saat)
6. Firebase projesi oluştur → **2 config dosyası**

### Adım 4 — n8n Kurulumu (2 saat)
7. Railway/VM'de n8n kur → Webhook'ları bağla

---

## 🔄 BACKEND .env GÜNCEL ŞABLON

```bash
# ========== ZORUNLU ==========
DATABASE_URL="postgresql://postgres:xxx@db.xxx.supabase.co:5432/postgres"
JWT_SECRET="xxx"
JWT_EXPIRES_IN="7d"
PORT=3001
NODE_ENV="development"
FRONTEND_URL="http://localhost:5173"

# ========== GOOGLE OAUTH ==========
GOOGLE_CLIENT_ID=""          # ← BURAYA YAZ
GOOGLE_CLIENT_SECRET=""      # ← BURAYA YAZ

# ========== WORDPRESS SSO ==========
WORDPRESS_JWT_SECRET="xxx"
WORDPRESS_URL="https://mutluet.org"

# ========== ÖDEME ==========
STRIPE_SECRET_KEY=""         # ← BURAYA YAZ (veya iyzico)
STRIPE_WEBHOOK_SECRET=""     # ← BURAYA YAZ
# iyzico alternatifi:
# IYZICO_API_KEY=""
# IYZICO_SECRET_KEY=""
# IYZICO_BASE_URL=""

# ========== EMAİL ==========
SENDGRID_API_KEY=""          # ← BURAYA YAZ
FROM_EMAIL="noreply@mutluet.org"

# ========== HATA TAKİBİ ==========
SENTRY_DSN=""                # ← BURAYA YAZ

# ========== BİLDİRİM ==========
TELEGRAM_BOT_TOKEN=""        # ← BURAYA YAZ
TELEGRAM_CHAT_ID=""          # ← BURAYA YAZ

# ========== OPSİYONEL ==========
FACEBOOK_APP_ID=""
FACEBOOK_APP_SECRET=""
TIKTOK_CLIENT_KEY=""
TIKTOK_CLIENT_SECRET=""
GOOGLE_MAPS_API_KEY_BACKEND=""
SUPABASE_URL=""
SUPABASE_SERVICE_ROLE_KEY=""
```

---

## 🔄 FRONTEND .env GÜNCEL ŞABLON

```bash
# ========== API ==========
VITE_API_URL="http://localhost:3001/api"
VITE_SOCKET_URL="http://localhost:3001"

# ========== SUPABASE ==========
VITE_SUPABASE_URL="https://xxx.supabase.co"
VITE_SUPABASE_ANON_KEY="xxx"

# ========== GOOGLE ==========
VITE_GOOGLE_CLIENT_ID=""     # ← BURAYA YAZ
VITE_GOOGLE_MAPS_API_KEY=""  # ← BURAYA YAZ

# ========== ÖDEME ==========
VITE_STRIPE_PUBLISHABLE_KEY="" # ← BURAYA YAZ

# ========== HATA TAKİBİ ==========
VITE_SENTRY_DSN=""           # ← BURAYA YAZ

# ========== OPSİYONEL ==========
VITE_WORDPRESS_URL="https://mutluet.org"
VITE_FACEBOOK_APP_ID=""
VITE_TIKTOK_CLIENT_KEY=""
VITE_ENV="development"
```
