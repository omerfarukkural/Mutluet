# 📘 MUTLUET — PROJE REHBERİ

**Son Güncelleme:** 9 Mart 2026  
**Versiyon:** 1.0  
**Hazırlayan:** GitHub Copilot (Ömer Faruk Kural için)

---

## 📋 İÇİNDEKİLER

1. [Projenin Amacı (Giriş → Gelişme → Sonuç)](#1-projenin-amacı)
2. [Mevcut Durum (Son Kontrol)](#2-mevcut-durum-son-kontrol)
3. [Yapılması Gerekenler (Sıralı + Link)](#3-yapılması-gerekenler)
4. [Yapım Aşamaları](#4-yapım-aşamaları)
5. [Kullanılan Teknolojiler](#5-kullanılan-teknolojiler)
6. [Kullanılan Platformlar](#6-kullanılan-platformlar)
7. [API Key'ler ve Servisler](#7-api-keyler-ve-servisler)
8. [Geliştirme Yol Haritası](#8-geliştirme-yol-haritası)

---

## 1. Projenin Amacı

### 🟢 Giriş — Ne Sorun Çözüyor?

Türkiye'de afet, göç ve sosyal kriz dönemlerinde ihtiyaç sahipleri ile gönüllüler arasındaki koordinasyon eksikliği ciddi bir sorun oluşturmaktadır. Mevcut çözümler dağınık, kullanıcı dostu değil ya da birden fazla uygulama gerektirmektedir.

**Mutluet**, bu sorunu tek bir mobil-öncelikli platform altında çözmek için tasarlanmıştır:

- Gönüllüler ve ihtiyaç sahipleri bir araya getirilir
- Bağışlar güvenli ve şeffaf biçimde iletilir
- Etkinlikler kolayca keşfedilip katılım sağlanır
- Psikososyal destek erişilebilir hale gelir

---

### 🟡 Gelişme — Nasıl Çalışıyor?

Uygulama üç ana katmandan oluşur:

#### Kullanıcı Akışı
```
[Onboarding] → [Login/Kayıt] → [Ana Sayfa]
                                    │
              ┌─────────────────────┼─────────────────────┐
              │                     │                     │
         [Kategoriler]          [Etkinlikler]         [Eşleşme]
              │                     │                     │
         [Bağış Yap]            [Harita]              [Sohbet]
              │                     │                     │
         [Oyunlar]           [Kurumlar]           [Video Görüşme]
              │
      [Psikososyal Destek]
              │
         [Profil / Admin]
```

#### Sayfa Rehberi (URL → Amaç)

| URL | Sayfa | Amaç |
|-----|-------|------|
| `/` | Onboarding | Uygulamayı tanıtan 3 slaytlı karşılama ekranı |
| `/login` | Giriş/Kayıt | E-posta, Google, Facebook, TikTok ile giriş |
| `/home` | Ana Sayfa | İstatistikler, görevler, canlı aktivite akışı |
| `/categories` | Kategoriler | Tüm hizmet kategorilerinin listesi (12 kategori) |
| `/events` | Etkinlikler | Gönüllülük etkinlikleri listesi ve arama |
| `/donate` | Bağış | Kredi kartı / banka transferi ile bağış |
| `/map` | Harita | Yakındaki etkinlik ve yardım noktalarının haritası |
| `/chat` | Sohbet | Gönüllüler arası gerçek zamanlı mesajlaşma |
| `/matching` | Eşleşme | İlgi alanına göre gönüllü eşleştirme (Tinder tarzı) |
| `/psychosocial` | Psikososyal Destek | 7/24 kriz hattı, grup terapisi, kaynak kütüphanesi |
| `/institutions` | Kurumlar | AFAD, bakanlıklar, STK listesi ve iletişim bilgileri |
| `/games` | Oyunlar | Okey, Balon Patlatma ve diğer 12 oyun |
| `/balloon-game` | Balon Oyunu | Video görüşmeli çok oyunculu balon patlatma oyunu |
| `/okey-game` | Okey Oyunu | Gerçek zamanlı çok oyunculu Türk Okeyı |
| `/video-call` | Video Görüşme | Grup video görüşmesi (Azure Communication Services) |
| `/happiness` | Mutluluk Kayıtları | Supabase destekli etkinlik kayıt sistemi |
| `/profile` | Profil | Kullanıcı bilgileri, bağış geçmişi, WordPress SSO |
| `/admin` | Admin Paneli | Kullanıcı/etkinlik/bağış yönetimi (sadece ADMIN rolü) |
| `/forgot-password` | Şifremi Unuttum | Magic link ile şifre sıfırlama |

#### Backend API Akışı

```
Frontend (React) → HTTPS → Backend (Express) → PostgreSQL (Supabase)
                       ↕
                  Socket.IO (gerçek zamanlı sohbet)
                       ↕
              Azure Key Vault (production'da sır yönetimi)
```

---

### 🔴 Sonuç — Hedef Kullanım Senaryosu

1. **İhtiyaç sahibi** uygulamayı açar → psikososyal destek veya kurumlar bölümünden yardım alır
2. **Gönüllü** etkinlik keşfeder → katılır → puan/rozet kazanır → diğer gönüllülerle eşleşir
3. **Bağışçı** güvenli bağış yapar → bağışın hangi kategoriye gittiğini görür
4. **Admin** tüm platformat yönetir → kullanıcı/etkinlik/bağış istatistiklerine erişir
5. **Herkes** oyun oynayabilir, sohbet edebilir, video görüşme yapabilir

---

## 2. Mevcut Durum (Son Kontrol)

### ✅ Tamamlananlar

| Alan | Durum | Notlar |
|------|-------|--------|
| Frontend (React + Vite) | ✅ Build alınıyor | TypeScript hatasız |
| Backend (Express + Prisma) | ✅ Build alınıyor | TypeScript hatasız |
| Veritabanı şeması (Prisma) | ✅ Hazır | 10 model, 4 enum |
| Auth (JWT + Email + Social) | ✅ Kod hazır | Çalışması için DB gerekli |
| Rate Limiting | ✅ Eklendi | 100 req/15dk, auth'ta 20 req/15dk |
| Docker Compose | ✅ Hazır | Lokal geliştirme için |
| CI/CD (.github/workflows) | ✅ Hazır | Frontend + Backend build + Docker check |
| Azure Key Vault entegrasyonu | ✅ Kod hazır | Azure hesabı gerekli |
| WordPress SSO | ✅ Kod hazır | WordPress sitesi gerekli |
| Supabase (Mutluluk kayıtları) | ✅ Kod hazır | Supabase env var'ları gerekli |
| Vercel Deployment | ✅ Yapılandırıldı | `vercel.json` hazır |

### ❌ Eksikler (Senin Yapman Gerekiyor)

| Eksik | Neden Önemli | Nerede Ayarlanır |
|-------|-------------|------------------|
| Backend `.env` dosyası | Backend başlatılamaz | `backend/` klasöründe oluştur |
| Frontend `.env` dosyası | Supabase çalışmaz | Kök klasörde oluştur |
| Database migration | Tablolar oluşturulmadı | `pnpm prisma:migrate dev` |
| Backend deployment | API endpoint yok | Railway / Vercel / Azure |
| Vercel env variables | Frontend API'ye bağlanamaz | Vercel Dashboard |
| GitHub Secrets | CI/CD çalışmaz | GitHub → Settings → Secrets |

---

## 3. Yapılması Gerekenler

> 🎯 Bu listeyi sırayla uygula. Her adımı tamamladıktan sonra bir sonrakine geç.

---

### ADIM 1 — Backend .env Dosyasını Oluştur *(5 dakika)*

**Konum:** `backend/.env`

```bash
# Terminalde:
cd ~/Mutluet/backend
cp .env.example .env
```

Sonra `.env` dosyasını aç ve şu alanları doldur:

```env
# 1. Supabase'den al (aşağıda açıklandı)
DATABASE_URL=postgresql://postgres.[PROJE_REF]:[ŞİFREN]@aws-0-eu-central-1.pooler.supabase.com:6543/postgres

# 2. Terminalde üret: openssl rand -hex 32
JWT_SECRET=buraya_32_byte_hex_koy

# 3. Terminalde üret: openssl rand -hex 32
WORDPRESS_JWT_SECRET=buraya_32_byte_hex_koy

# 4. Değiştirme
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```

**DATABASE_URL nasıl alınır:**
```
1. https://supabase.com/dashboard/project/xuqbxbhgkoivqdqblbeq
2. Sol menü → Settings → Database
3. "Connection string" bölümü → URI sekmesi
4. Şifreni [YOUR-PASSWORD] alanına yaz
5. Kopyala → backend/.env içine yapıştır
```

---

### ADIM 2 — Frontend .env Dosyasını Oluştur *(2 dakika)*

**Konum:** `.env` (kök klasörde)

```bash
# Terminalde:
cd ~/Mutluet
cp .env.example .env
```

`.env` dosyasını aç ve şu alanları doldur:

```env
VITE_API_URL=http://localhost:3001/api
VITE_SUPABASE_URL=https://xuqbxbhgkoivqdqblbeq.supabase.co
VITE_SUPABASE_ANON_KEY=[Supabase'den alacağın anon key]
```

**SUPABASE_ANON_KEY nasıl alınır:**
```
1. https://supabase.com/dashboard/project/xuqbxbhgkoivqdqblbeq
2. Sol menü → Settings → API
3. "Project API keys" bölümünde "anon public" anahtarı kopyala
4. .env içine yapıştır
```

---

### ADIM 3 — Database Migration Çalıştır *(3 dakika)*

```bash
cd ~/Mutluet/backend

# Prisma client'ı oluştur
pnpm prisma:generate

# Veritabanı tablolarını oluştur
pnpm prisma migrate dev --name init
```

**Beklenen çıktı:**
```
✔ Generated Prisma Client
✔ Applying migration `init`
```

**Sorun yaşarsan:**
```
Supabase Dashboard → Settings → Database → Connection pooling
"Allow connections from all IPv4 addresses" seçeneğini aktif et
```

---

### ADIM 4 — Lokal Olarak Çalıştır ve Test Et *(5 dakika)*

**Terminal 1 — Backend:**
```bash
cd ~/Mutluet/backend
pnpm dev
# 🚀 Server running on port 3001 görmeli
```

**Terminal 2 — Frontend:**
```bash
cd ~/Mutluet
pnpm dev
# http://localhost:5173 açılmalı
```

**Test Kontrol Listesi:**
```
✅ http://localhost:5173 → Onboarding ekranı açılıyor mu?
✅ /login → Kayıt ol ile hesap oluştur
✅ /home → Ana sayfa görünüyor mu?
✅ http://localhost:3001/health → {"status":"ok"} dönüyor mu?
```

---

### ADIM 5 — Backend'i Production'a Deploy Et *(20 dakika)*

**🚂 Seçenek A: Railway (Önerilen — $5/ay sonrası ücretsiz tier var)**

```
1. https://railway.app adresine git
2. "New Project" → "Deploy from GitHub repo"
3. omerfarukkural/Mutluet seç
4. "Add service" → Settings:
   - Root Directory: backend
   - Build Command: pnpm build
   - Start Command: node dist/index.js
5. Variables sekmesine tıkla → "Raw Editor":
```

```env
DATABASE_URL=postgresql://postgres.[PROJE_REF]:[ŞİFREN]@pooler.supabase.com:6543/postgres
JWT_SECRET=[openssl rand -hex 32 çıktısı]
WORDPRESS_JWT_SECRET=[openssl rand -hex 32 çıktısı]
NODE_ENV=production
PORT=3001
FRONTEND_URL=https://mutluet.vercel.app
```

```
6. "Deploy" tıkla
7. Deploy tamamlanınca URL'yi kopyala
   Örnek: https://mutluet-backend.up.railway.app
```

**⚡ Seçenek B: Vercel Functions (Ücretsiz ama sınırlı)**

```
1. https://vercel.com/new
2. Import → omerfarukkural/Mutluet
3. Root Directory: backend
4. Build Command: pnpm build
5. Output Directory: dist
6. Environment Variables ekle (yukarıdaki Railway variables ile aynı)
7. Deploy
```

---

### ADIM 6 — Vercel Frontend'e Backend URL'sini Bağla *(5 dakika)*

```
1. https://vercel.com/omerfarukkural/mutluet/settings/environment-variables
2. "Add New" tıkla

Eklenecek Variables:
┌─────────────────────────────┬──────────────────────────────────────────────────┐
│ Name                        │ Value                                            │
├─────────────────────────────┼──────────────────────────────────────────────────┤
│ VITE_API_URL                │ https://mutluet-backend.up.railway.app/api      │
│ VITE_SUPABASE_URL           │ https://xuqbxbhgkoivqdqblbeq.supabase.co        │
│ VITE_SUPABASE_ANON_KEY      │ [Supabase'den anon key]                         │
└─────────────────────────────┴──────────────────────────────────────────────────┘

3. Environment: Production + Preview + Development hepsini seç
4. Save → Deployments → Redeploy
```

---

### ADIM 7 — GitHub Secrets Ekle *(5 dakika)*

```
URL: https://github.com/omerfarukkural/Mutluet/settings/secrets/actions
```

**"New repository secret" ile ekle:**

| Secret Adı | Value | Nereden Alınır |
|------------|-------|----------------|
| `JWT_SECRET` | openssl rand -hex 32 | Terminalde üret |
| `WORDPRESS_JWT_SECRET` | openssl rand -hex 32 | Terminalde üret |
| `DATABASE_URL` | Supabase connection string | Supabase → Settings → Database |
| `SUPABASE_SERVICE_ROLE_KEY` | service_role key | Supabase → Settings → API |

---

### ADIM 8 — Production'da Migration Çalıştır *(3 dakika)*

```bash
cd ~/Mutluet/backend

# Production DATABASE_URL'yi export et
export DATABASE_URL="postgresql://postgres.[PROJE_REF]:[ŞİFREN]@pooler.supabase.com:6543/postgres"

# Production migration'ı çalıştır
pnpm exec prisma migrate deploy
```

---

### ADIM 9 — Admin Kullanıcı Oluştur *(2 dakika)*

Backend çalıştıktan sonra, bir kullanıcı kaydı oluştur ve Supabase'den ADMIN yap:

```
1. https://mutluet.vercel.app/login → Kayıt Ol
2. Hesabı oluşturduktan sonra:
3. Supabase Dashboard → Table Editor → users
4. Oluşturduğun kullanıcıyı bul
5. "role" alanını "USER" → "ADMIN" yap
6. Save
7. /admin sayfasına git → Admin Dashboard açılmalı
```

---

### ADIM 10 — Test Et *(5 dakika)*

```
✅ https://mutluet.vercel.app → Uygulama açılıyor mu?
✅ /login → Kayıt ol ve giriş yap
✅ /home → Dashboard görünüyor mu?
✅ /events → Etkinlikler listeleniyor mu?
✅ /happiness → Mutluluk kaydı ekleyip görebiliyor musun?
✅ https://[BACKEND_URL]/health → {"status":"ok"} dönüyor mu?
```

---

## 4. Yapım Aşamaları

### Aşama 1 — Temel Altyapı
- React + TypeScript + Vite ile frontend kuruldu
- Express + TypeScript + Prisma ile backend kuruldu
- PostgreSQL şeması tasarlandı (10 model)
- JWT tabanlı kimlik doğrulama sistemi

### Aşama 2 — UI Bileşenleri
- Radix UI + TailwindCSS ile 20+ sayfa tasarlandı
- Mobile-first, 375px genişlikte optimize edildi
- Onboarding → Login → Home akışı
- Bottom navigation (Ana Sayfa, Kategoriler, Harita, Eşleşme, Profil)

### Aşama 3 — Özellikler
- Bağış sistemi (Stripe entegrasyona hazır)
- Etkinlik keşif ve katılım
- Gönüllü eşleştirme sistemi (uyumluluk skoru)
- Gerçek zamanlı sohbet (Socket.IO)
- Psikososyal destek modülü
- Resmi kurumlar rehberi
- Oyunlar (Okey, Balon Patlatma)
- Video görüşme UI'ı

### Aşama 4 — Entegrasyonlar
- Supabase: Mutluluk Olayları veritabanı
- WordPress SSO: mutluet.org sitesiyle tek oturum
- OAuth: Google, Facebook, TikTok, Azure AD
- Azure Key Vault: Production sır yönetimi
- Application Insights: Monitoring

### Aşama 5 — Güvenlik ve DevOps
- Rate limiting (express-rate-limit)
- Docker Compose ile lokal geliştirme
- GitHub Actions CI/CD (build + type check + docker)
- Vercel + Railway deployment yapılandırması

---

## 5. Kullanılan Teknolojiler

### Frontend

| Teknoloji | Versiyon | Amaç |
|-----------|---------|------|
| **React** | 18.3.1 | UI framework |
| **TypeScript** | 5.7 | Tip güvenliği |
| **Vite** | 6.3.5 | Build tool |
| **React Router** | v7 | Sayfa yönlendirme |
| **TailwindCSS** | 4.1.12 | Stil |
| **Radix UI** | 1.x–2.x | Erişilebilir bileşenler |
| **Material-UI** | 7.3.5 | Ek bileşenler |
| **Lucide React** | 0.487 | İkonlar |
| **Recharts** | 2.15 | Grafikler |
| **Framer Motion** (motion) | 12.23 | Animasyonlar |
| **Sonner** | 2.0 | Toast bildirimleri |
| **React Hook Form** | 7.55 | Form yönetimi |
| **Date-fns** | 3.6 | Tarih işleme |
| **React DnD** | 16 | Sürükle-bırak |
| **Supabase JS** | 2.98 | Realtime DB client |

### Backend

| Teknoloji | Versiyon | Amaç |
|-----------|---------|------|
| **Node.js** | 20 LTS | Runtime |
| **Express** | 4.21 | HTTP framework |
| **TypeScript** | 5.7 | Tip güvenliği |
| **Prisma ORM** | 5.22 | Veritabanı ORM |
| **PostgreSQL** | 16 | Veritabanı |
| **Socket.IO** | 4.8 | WebSocket/gerçek zamanlı |
| **JWT** (jsonwebtoken) | 9.0 | Kimlik doğrulama |
| **bcryptjs** | 2.4 | Şifre hashleme |
| **express-rate-limit** | 8.3 | Rate limiting |
| **dotenv** | 16.4 | Env yönetimi |
| **@azure/keyvault-secrets** | 4.10 | Azure Key Vault |
| **@azure/identity** | 4.13 | Azure kimlik doğrulama |
| **applicationinsights** | 3.14 | Azure monitoring |
| **tsx** | 4.19 | TypeScript runner (dev) |

---

## 6. Kullanılan Platformlar

| Platform | Amaç | URL |
|----------|------|-----|
| **GitHub** | Kaynak kod yönetimi + CI/CD | https://github.com/omerfarukkural/Mutluet |
| **Vercel** | Frontend hosting | https://vercel.com/omerfarukkural/mutluet |
| **Railway** | Backend hosting (önerilen) | https://railway.app |
| **Supabase** | PostgreSQL veritabanı + Auth | https://supabase.com/dashboard/project/xuqbxbhgkoivqdqblbeq |
| **Azure** | Key Vault + Application Insights | https://portal.azure.com |
| **Docker Hub** | Container image (isteğe bağlı) | https://hub.docker.com |
| **WordPress** | SSO entegrasyonu | https://mutluet.org |

### GitHub Actions Workflow'ları

| Workflow Dosyası | Tetikleyici | Ne Yapıyor |
|-----------------|-------------|-----------|
| `ci.yml` | Her push/PR | Frontend + Backend build + Docker check |
| `tests.yml` | Her push | Linting ve testler |
| `frontend-deploy.yml` | main push | Azure Static Web App deploy |
| `backend-deploy.yml` | main push | Azure App Service deploy |
| `deploy-frontend.yml` | manual | Vercel deploy |
| `deploy-backend.yml` | manual | Railway/Vercel deploy |

---

## 7. API Key'ler ve Servisler

> ⚠️ Hiçbir API key'i koda veya GitHub'a commit etme. Hepsini `.env` dosyasına veya platform'un secret yönetimine ekle.

### ZORUNLU (Olmadan uygulama çalışmaz)

#### 1. Supabase — Veritabanı
```
Dashboard: https://supabase.com/dashboard/project/xuqbxbhgkoivqdqblbeq
Nerede bulunur: Settings → API

VITE_SUPABASE_URL=https://xuqbxbhgkoivqdqblbeq.supabase.co
VITE_SUPABASE_ANON_KEY=               ← Settings → API → anon/public
DATABASE_URL=                          ← Settings → Database → URI
SUPABASE_SERVICE_ROLE_KEY=             ← Settings → API → service_role (GİZLİ!)
```

#### 2. JWT Secret — Auth
```
Nasıl üretilir: openssl rand -hex 32
Nereye eklenir: backend/.env + Railway/Vercel Variables

JWT_SECRET=buraya_32_karakter_hex
```

---

### OPSIYONEL — OAuth Girişleri

#### 3. Google OAuth
```
Dashboard: https://console.cloud.google.com/apis/credentials
1. "Create Credentials" → OAuth client ID
2. Application type: Web application
3. Authorized redirect URIs:
   - http://localhost:5173
   - https://mutluet.vercel.app

VITE_GOOGLE_CLIENT_ID=               ← Frontend .env
GOOGLE_CLIENT_ID=                    ← Backend .env
GOOGLE_CLIENT_SECRET=                ← Backend .env (GİZLİ!)
```

#### 4. Facebook OAuth
```
Dashboard: https://developers.facebook.com/apps/
1. "Create App" → Consumer
2. Facebook Login → Settings
3. Valid OAuth Redirect URIs ekle

VITE_FACEBOOK_APP_ID=                ← Frontend .env
```

#### 5. TikTok OAuth
```
Dashboard: https://developers.tiktok.com/
1. App oluştur → Login Kit ekle

VITE_TIKTOK_CLIENT_KEY=              ← Frontend .env
```

---

### OPSIYONEL — Ödeme Sistemi

#### 6. Stripe — Bağış Ödemeleri
```
Dashboard: https://dashboard.stripe.com/test/apikeys
Not: Test ortamında "pk_test_" ile başlar

STRIPE_PUBLIC_KEY=pk_test_...        ← Frontend .env (VITE_STRIPE_PUBLIC_KEY)
STRIPE_SECRET_KEY=sk_test_...        ← Backend .env (GİZLİ!)
STRIPE_WEBHOOK_SECRET=whsec_...      ← Backend .env (GİZLİ!)
```

---

### OPSIYONEL — Azure Servisleri

#### 7. Azure Key Vault
```
Portal: https://portal.azure.com
Kaynak: Key Vault → mutluet-vault

AZURE_KEY_VAULT_URL=https://mutluet-vault.vault.azure.net/
```
> Sadece production'da gerekli. Geliştirmede `.env` dosyası kullanılır.

#### 8. Azure Application Insights
```
Portal: https://portal.azure.com → Application Insights → mutluet-insights
Overview → Connection String

APPLICATIONINSIGHTS_CONNECTION_STRING=InstrumentationKey=...
```

#### 9. Azure Communication Services — Video Görüşme
```
Portal: https://portal.azure.com → Communication Services
Keys → Connection String

AZURE_COMMUNICATION_CONNECTION_STRING=endpoint=...
```
> Video görüşme özelliğinin backend'de gerçekten çalışması için gerekli.

---

### OPSIYONEL — E-posta

#### 10. SendGrid — Magic Link E-postası
```
Dashboard: https://app.sendgrid.com/settings/api_keys

SENDGRID_API_KEY=SG.xxx              ← Backend .env
FROM_EMAIL=noreply@mutluet.org       ← Backend .env
```
> Olmadan magic link sadece response body'de döner (production'da güvensiz!).

---

### OPSIYONEL — Harita

#### 11. Google Maps API
```
Console: https://console.cloud.google.com/apis/credentials
Enable: Maps JavaScript API + Places API

VITE_GOOGLE_MAPS_API_KEY=            ← Frontend .env
```
> Olmadan harita sayfasında gerçek harita yerine statik liste gösterilir.

---

### OPSIYONEL — Hata Takibi

#### 12. Sentry
```
Dashboard: https://sentry.io/settings/
Project oluştur → React

VITE_SENTRY_DSN=https://xxx@sentry.io/xxx    ← Frontend .env
SENTRY_DSN=https://xxx@sentry.io/xxx         ← Backend .env
```

---

## 8. Geliştirme Yol Haritası

Uygulamayı daha ileri taşımak için sırayla yapılması önerilen geliştirmeler:

### 🔴 Kritik (İlk 1 Ay)

1. **Gerçek Stripe Entegrasyonu**
   - `donate.tsx` şu an UI mock'tur
   - Backend'de `POST /api/donations` endpoint'i Stripe'a bağlanmalı
   - Webhook ile ödeme doğrulaması eklenmeli
   - Stripe Docs: https://stripe.com/docs/payments/accept-a-payment

2. **Magic Link E-posta Gönderimi**
   - `auth.ts`'de `// TODO: Send email` yorumu var
   - SendGrid ile gerçek e-posta gönderimi implement edilmeli
   - SendGrid Docs: https://docs.sendgrid.com/for-developers/sending-email/quickstart-nodejs

3. **Google OAuth Gerçek Implementasyon**
   - Şu an "yakında aktif olacak" uyarısı var
   - `@react-oauth/google` paketi kurulmalı
   - Backend'deki `/api/oauth/google` endpoint'i Google token doğrulamasıyla tamamlanmalı

4. **Video Görüşme Backend Entegrasyonu**
   - `video-call.tsx` sadece UI gösteriyor
   - Azure Communication Services ile gerçek video görüşme kurulmalı
   - ACS Docs: https://learn.microsoft.com/azure/communication-services/quickstarts/voice-video-calling/get-started-with-video-calling

5. **Supabase'de `happiness_events` Tablosu Oluştur**
   ```sql
   -- Supabase SQL Editor'da çalıştır:
   -- https://supabase.com/dashboard/project/xuqbxbhgkoivqdqblbeq/sql
   CREATE TABLE happiness_events (
     id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
     title TEXT NOT NULL,
     description TEXT,
     created_at TIMESTAMPTZ DEFAULT now()
   );
   ALTER TABLE happiness_events ENABLE ROW LEVEL SECURITY;
   CREATE POLICY "Public read" ON happiness_events FOR SELECT USING (true);
   CREATE POLICY "Auth insert" ON happiness_events FOR INSERT WITH CHECK (auth.role() = 'anon');
   ```

---

### 🟡 Önemli (1-3 Ay)

6. **Gerçek Zamanlı Sohbet UI → Backend Bağlantısı**
   - `chat.tsx` şu an statik mock data kullanıyor
   - Socket.IO client entegrasyonu yapılmalı
   - `socket.io-client` paketi frontend'e eklenmeli

7. **Harita Entegrasyonu**
   - `map.tsx` şu an statik liste gösteriyor
   - Google Maps JavaScript API veya Leaflet.js entegrasyonu
   - Yakındaki kuruluşları gerçek koordinatlarla göster

8. **Okey/Balon Oyunları Backend Bağlantısı**
   - Oyunlar şu an tek kişilik UI prototype'ı
   - Socket.IO ile çok oyunculu oyun sunucusu kurulmalı
   - Oyun state management için oda sistemi gerekli

9. **Push Bildirimleri**
   - Firebase Cloud Messaging (FCM) veya Web Push API
   - Yeni mesaj, etkinlik hatırlatması bildirimleri
   - FCM Docs: https://firebase.google.com/docs/cloud-messaging/js/client

10. **Profil Fotoğrafı Yükleme**
    - Şu an avatar sadece ismin ilk harfi
    - Cloudinary veya Supabase Storage kullanılabilir
    - Supabase Storage: https://supabase.com/docs/guides/storage

---

### 🟢 Gelecek Geliştirmeler (3+ Ay)

11. **Mobil Uygulama (React Native / Capacitor)**
    - Uygulama mobile-first tasarlandı, native'e taşımak görece kolay
    - Capacitor: https://capacitorjs.com/
    - App Store + Google Play yayını

12. **Çok Dil Desteği (i18n)**
    - `react-i18next` ile Türkçe/İngilizce/Arapça
    - Özellikle mülteci kullanıcılar için kritik

13. **Offline Desteği (PWA)**
    - Service Worker ile çevrimdışı çalışma
    - `vite-plugin-pwa` eklentisi

14. **Admin Panel Geliştirmeleri**
    - Etkinlik oluşturma/düzenleme formu
    - Kullanıcı ban/aktifleştirme işlemleri
    - Bağış raporları export (CSV/PDF)

15. **Analitik Dashboard**
    - Haftalık/aylık bağış istatistikleri
    - Gönüllü katılım trendleri
    - Etkinlik doluluk oranları

16. **n8n Automation**
    - Yeni bağış → admin'e e-posta bildirimi
    - Etkinlik yaklaşıyor → katılımcılara hatırlatma
    - n8n self-hosted: https://n8n.io/

17. **Kurumsal Üyelik**
    - Şirketler toplu bağış yapabilir
    - Şirket profili + çalışan gönüllülük yönetimi

---

## 📞 Yardım

**Repository:** https://github.com/omerfarukkural/Mutluet  
**Vercel:** https://vercel.com/omerfarukkural/mutluet  
**Supabase:** https://supabase.com/dashboard/project/xuqbxbhgkoivqdqblbeq  

Takıldığında:
1. GitHub Actions loglarına bak: https://github.com/omerfarukkural/Mutluet/actions
2. Vercel deployment logları: https://vercel.com/omerfarukkural/mutluet/deployments
3. Supabase logları: https://supabase.com/dashboard/project/xuqbxbhgkoivqdqblbeq/logs/explorer

---

*Bu belge, projenin mevcut durumunu eksiksiz yansıtmak için otomatik analiz edilerek hazırlanmıştır.*
