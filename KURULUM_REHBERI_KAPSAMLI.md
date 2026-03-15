# 🐾 MUTLUET — KAPSAMLI KURULUM VE YAPILANDIRMA REHBERİ

> **Son Güncelleme:** 9 Mart 2026
> **Hazırlayan:** Otomasyon Sistemi
> **Sürüm:** 2.0

---

## 📋 İÇİNDEKİLER

1. [Proje Nedir?](#-proje-nedir)
2. [Mimari Genel Bakış](#-mimari-genel-bakış)
3. [Ön Gereksinimler](#-ön-gereksinimler)
4. [İlk Kurulum](#-ilk-kurulum)
5. [Azure Key Vault — Merkezi Sır Yönetimi](#-azure-key-vault--merkezi-sır-yönetimi)
6. [Veritabanı Kurulumu](#-veritabanı-kurulumu)
7. [Backend Çalıştırma](#-backend-çalıştırma)
8. [Frontend Çalıştırma](#-frontend-çalıştırma)
9. [macOS Preview App](#-macos-preview-app)
10. [WordPress SSO Entegrasyonu](#-wordpress-sso-entegrasyonu)
11. [Flutter Mobil App](#-flutter-mobil-app)
12. [Production Deployment](#-production-deployment)
13. [Yapılacaklar Listesi](#-yapılacaklar-listesi)
14. [Sorun Giderme](#-sorun-giderme)

---

## 🐾 Proje Nedir?

**Mutluet**, evcil hayvan sahiplendirme, hayvan refahı ve topluluk oluşturma platformudur.

| Özellik          | Açıklama                                 |
|------------------|------------------------------------------|
| 🏠 Sahiplendirme | Evcil hayvan eşleştirme ve sahiplendirme |
| 💬 Sohbet        | Gerçek zamanlı mesajlaşma (Socket.IO)    |
| 🗺️ Harita       | Yakındaki barınak/veteriner arama        |
| 💰 Bağış         | Stripe ile online bağış                  |
| 🎮 Oyunlar       | Balon patlatma, okey gibi eğlence        |
| 📊 Admin Panel   | Yönetici dashboard'u                     |
| 🔐 SSO           | WordPress (mutluet.org) ile tek giriş    |
| 😊 Mutluluk      | Psikososyal destek modülü                |
| 📱 Mobil         | Flutter ile iOS/Android uygulaması       |
| 🖥️ macOS        | Native preview uygulaması                |

### Web Adresleri

- **`mutluet.org`** → WordPress ana site (blog, içerik, SEO)
- **`app.mutluet.org`** veya **`mutluet.bitebimuv.org`** → React web uygulaması
- **`mutluet.bitebimuv.org/admin`** → Admin paneli (isteğe bağlı)

---

## 🏗️ Mimari Genel Bakış

```
┌─────────────────────────────────────────────────────────────┐
│                    KULLANICI KATMANI                         │
├──────────┬──────────┬──────────┬──────────┬────────────────┤
│  React   │  Flutter │  macOS   │ WordPress│   Admin        │
│  Web App │  Mobil   │  Preview │  SSO     │   Dashboard    │
│ (Vite)   │  App     │  (Swift) │          │   (React)      │
├──────────┴──────────┴──────────┴──────────┴────────────────┤
│                   BACKEND API (Express.js)                   │
│  /api/auth  /api/chat  /api/config  /api/wordpress          │
├─────────────────────────────────────────────────────────────┤
│                    VERİ KATMANI                              │
├──────────┬──────────┬──────────────────────────────────────┤
│ Supabase │ MongoDB  │ Azure Key Vault                      │
│ (Postgres│ (NoSQL)  │ (Merkezi Sır Yönetimi)               │
│  +Prisma)│          │ https://anahtar.vault.azure.net/     │
└──────────┴──────────┴──────────────────────────────────────┘
```

---

## ⚙️ Ön Gereksinimler

### macOS'ta Kurulması Gerekenler

```bash
# 1. Homebrew (paket yöneticisi)
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# 2. Node.js 20+
brew install node@20

# 3. pnpm (paket yöneticisi)
npm install -g pnpm

# 4. Azure CLI
brew install azure-cli

# 5. Git (genellikle zaten yüklü)
brew install git

# 6. Xcode (macOS Preview App için)
# App Store'dan yükleyin veya: xcode-select --install

# 7. Flutter (mobil app için - isteğe bağlı)
brew install flutter
```

### Kontrol

```bash
node --version    # v20.x.x veya üzeri
pnpm --version    # 10.x.x
az --version      # 2.x.x
git --version     # 2.x.x
```

---

## 🚀 İlk Kurulum

### 1. Depoyu klonla

```bash
git clone https://github.com/omerfarukkural/Mutluet.git
cd Mutluet
```

### 2. Bağımlılıkları yükle

```bash
# Frontend (React + Vite)
pnpm install

# Backend (Express.js)
cd backend && pnpm install && cd ..
```

### 3. .env dosyasını hazırla

```bash
# Eğer .env yoksa, şablondan oluştur
cp .env.example .env

# Düzenle ve değerleri gir
nano .env
```

---

## 🔐 Azure Key Vault — Merkezi Sır Yönetimi

### Neden Key Vault?

Tüm API anahtarları, şifreler ve hassas bilgiler **TEK BİR YERDE** güvenle saklanır. Her uygulama
sadece ihtiyacı olan sırları çeker:

```
┌─────────────────────────────────┐
│   Azure Key Vault               │
│   https://anahtar.vault.azure.net/  │
│                                 │
│   ┌──────────────────────────┐  │
│   │ JWT-SECRET               │──── → Backend (auth)
│   │ OPENAI-API-KEY           │──── → Backend (AI)
│   │ STRIPE-SECRET-KEY        │──── → Backend (ödeme)
│   │ WORDPRESS-JWT-SECRET     │──── → Backend (SSO)
│   │ SUPABASE-URL             │──── → Frontend (config API)
│   │ GOOGLE-CLIENT-ID         │──── → Frontend + Mobil
│   └──────────────────────────┘  │
└─────────────────────────────────┘
```

### Adım 1: Azure'a Giriş Yap

```bash
az login --tenant 35368578-7308-41ca-9d78-3779e3d395bf
az account set --subscription 0760f7f0-03c7-4be6-a6fd-0a7c95039b71
```

### Adım 2: Key Vault Oluştur (eğer yoksa)

```bash
# Resource group oluştur
az group create --name mutluet-rg --location westeurope

# Key Vault oluştur
az keyvault create \
  --name anahtar \
  --resource-group mutluet-rg \
  --location westeurope \
  --enable-rbac-authorization true
```

### Adım 3: Erişim İzni Ver

```bash
# Kendi kullanıcınıza Key Vault yönetici rolü verin
az role assignment create \
  --role "Key Vault Secrets Officer" \
  --assignee $(az ad signed-in-user show --query id -o tsv) \
  --scope /subscriptions/0760f7f0-03c7-4be6-a6fd-0a7c95039b71/resourceGroups/mutluet-rg/providers/Microsoft.KeyVault/vaults/anahtar
```

### Adım 4: Sırları Yükle

```bash
# Otomatik yükleme scripti (tüm .env değerlerini Key Vault'a atar)
chmod +x scripts/upload-secrets-to-vault.sh
./scripts/upload-secrets-to-vault.sh
```

**Script ne yapar?**

1. `.env` dosyasını satır satır okur
2. `KEY_NAME` → `KEY-NAME` formatına çevirir (Key Vault tire kullanır)
3. Placeholder değerleri (`[Eksik/...]`) atlar
4. Her secret'ı `az keyvault secret set` ile yükler
5. Sonuç raporu verir

### Adım 5: Backend'den Erişim

Backend otomatik olarak Key Vault'a bağlanır:

```
Development: .env dosyasından okur (Key Vault'a bağlanmaz)
Production:  Azure Key Vault'tan çeker, .env fallback
```

**Dosya:** `backend/src/config/azure-secrets.ts`

```typescript
import { getSecret, getSecretSync } from './config/azure-secrets.js';

// Async (başlangıçta)
const apiKey = await getSecret('OPENAI-API-KEY');

// Sync (cache'den, runtime'da)
const jwtSecret = getSecretSync('JWT-SECRET');
```

### Adım 6: Frontend ve Mobil Config

Frontend asla doğrudan Key Vault'a erişmez. Backend üzerinden güvenli config alır:

```
GET /api/config/public   → Frontend için (güvenli, hassas değil)
GET /api/config/mobile   → Flutter/React Native için
GET /api/config/health   → Secret durumu (admin)
```

### Secret Grupları

| Grup              | İçerik                 | Kim Kullanır             |
|-------------------|------------------------|--------------------------|
| `backend_core`    | JWT, DB, Supabase      | Backend                  |
| `wordpress`       | JWT Secret, WP URL     | Backend → WordPress      |
| `ai`              | OpenAI, Claude, Gemini | Backend AI servisleri    |
| `payment`         | Stripe keys            | Backend ödeme            |
| `google`          | OAuth, Maps            | Backend + Frontend proxy |
| `communication`   | SendGrid, Azure Comm   | Backend bildirim         |
| `storage`         | Azure Storage, MongoDB | Backend veri             |
| `monitoring`      | App Insights, Sentry   | Backend izleme           |
| `frontend_public` | Supabase URL/key       | Frontend (güvenli)       |

---

## 🗄️ Veritabanı Kurulumu

### PostgreSQL (Supabase + Prisma)

```bash
cd backend

# .env'de DATABASE_URL ve POSTGRES_PRISMA_URL tanımlı olmalı
# Prisma migration çalıştır
pnpm prisma:generate
pnpm prisma:migrate

# Veritabanını görsel olarak incele
pnpm prisma:studio
```

### MongoDB (İsteğe Bağlı)

1. [MongoDB Atlas](https://cloud.mongodb.com) → Yeni Cluster oluştur
2. Cluster → Connect → "Connect your application"
3. Connection string'i kopyala
4. `.env`'deki `MONGODB_URI`'yi güncelle:
   ```
   MONGODB_URI="mongodb+srv://omerfarukkural_db_user:X0q0AsVCfgtKP5FS@omer1.GERCEK_ADRES.mongodb.net/mutluet?retryWrites=true&w=majority"
   ```

---

## 🖥️ Backend Çalıştırma

```bash
cd backend
pnpm dev
```

**Beklenen çıktı:**

```
⚠️  Development mode: Key Vault atlanıyor, .env kullanılıyor
✅ 15 secret env'den cache'e alındı
🚀 Server running on port 3001
📡 Socket.IO ready
🔐 Environment: development
```

**Erişim:**

- API: http://localhost:3001/api
- Health: http://localhost:3001/health
- Config: http://localhost:3001/api/config/public

---

## 🌐 Frontend Çalıştırma

```bash
# Proje kök dizininde
pnpm dev
```

**Beklenen çıktı:**

```
VITE v6.3.5  ready in 500ms
➜  Local:   http://localhost:5173/
```

### Sayfalar

| URL           | Sayfa       | Açıklama                 |
|---------------|-------------|--------------------------|
| `/`           | Onboarding  | İlk karşılama            |
| `/login`      | Giriş       | Email/şifre/sosyal giriş |
| `/home`       | Ana Sayfa   | Ana dashboard            |
| `/categories` | Kategoriler | Hayvan kategorileri      |
| `/events`     | Etkinlikler | Topluluk etkinlikleri    |
| `/donate`     | Bağış       | Stripe ile bağış         |
| `/map`        | Harita      | Yakın barınaklar         |
| `/chat`       | Sohbet      | Gerçek zamanlı mesaj     |
| `/matching`   | Eşleşme     | Hayvan eşleştirme        |
| `/profile`    | Profil      | Kullanıcı profili        |
| `/admin`      | Admin       | Yönetici paneli          |
| `/games`      | Oyunlar     | Eğlence                  |
| `/happiness`  | Mutluluk    | Psikososyal destek       |

---

## 🍎 macOS Preview App

macOS Preview App, Vite dev server'ını native bir Mac penceresinde gösterir. Tarayıcı açmadan
uygulamayı önizleyebilirsiniz.

### Çalıştırma

1. **Önce Vite sunucusunu başlat:**
   ```bash
   cd Mutluet && pnpm dev
   ```

2. **Xcode'u aç:**
   ```bash
   open omer/omer.xcodeproj
   ```

3. **Target olarak "My Mac" seç** → ▶️ Run (⌘R)

### Özellikler

| Özellik             | Nasıl                         |
|---------------------|-------------------------------|
| 🔄 Yenile           | Toolbar'daki ↻ butonu veya ⌘R |
| ◀️ Geri             | Toolbar'daki ← butonu         |
| 🔗 URL değiştir     | Toolbar'daki URL alanı        |
| 📱 Hızlı navigasyon | Sidebar menüsünden sayfa seç  |
| 📐 Cihaz boyutu     | Toolbar'daki cihaz menüsü     |

### Dosya Yapısı

```
omer/
├── omer.xcodeproj/     ← Xcode proje dosyası
├── omer/
│   ├── omerApp.swift   ← Ana uygulama giriş noktası
│   ├── ContentView.swift ← WebView + toolbar + navigasyon
│   ├── WebView.swift   ← WKWebView NSViewRepresentable wrapper
│   ├── omer.entitlements ← Network erişim izni
│   └── Assets.xcassets/
```

---

## 🔗 WordPress SSO Entegrasyonu

### Genel Akış

```
Kullanıcı → mutluet.org (WordPress) → JWT Token → Backend doğrulama → Oturum açık
         ← ← ← ← ← ← ← ← ← ← ← ← ← ← ← ← ←
```

### WordPress Tarafı (mutluet.org)

#### 1. Gerekli WordPress Eklentileri

| Eklenti                      | Ne İşe Yarar                        | Nereden                     |
|------------------------------|-------------------------------------|-----------------------------|
| **JWT Auth for WP REST API** | JWT token oluşturma                 | WordPress Plugin Repository |
| **Application Passwords**    | REST API erişimi (WP 5.6+ built-in) | Yerleşik                    |
| **WP REST API Controller**   | Endpoint yönetimi                   | Plugin Repository           |
| **Wordfence Security**       | Güvenlik                            | Plugin Repository           |

#### 2. WordPress `wp-config.php` Ayarları

```php
// JWT Auth ayarları
define('JWT_AUTH_SECRET_KEY', 'BURAYA_AYNI_JWT_SECRET_YAZIN');
define('JWT_AUTH_CORS_ENABLE', true);

// CORS ayarları
define('MUTLUET_APP_URL', 'https://app.mutluet.org');
```

> **ÖNEMLİ:** `JWT_AUTH_SECRET_KEY` değeri, `.env`'deki `WORDPRESS_JWT_SECRET` ile **BİREBİR AYNI**
> olmalıdır!

#### 3. WordPress `functions.php` CORS Ayarı

```php
// CORS header'ları ekle
add_action('init', function() {
    header('Access-Control-Allow-Origin: ' . MUTLUET_APP_URL);
    header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
    header('Access-Control-Allow-Headers: Authorization, Content-Type');
});
```

### Backend Tarafı

Backend'de WordPress SSO route'u hazır: `backend/src/routes/wordpress.ts`

### Frontend Tarafı

WordPress'e yönlendirme butonu: `src/app/components/wordpress-button.tsx`

### Yapılması Gerekenler (WordPress)

- [ ] WordPress admin paneline gir → Eklentiler → "JWT Auth" yükle ve etkinleştir
- [ ] `wp-config.php`'ye JWT secret ekle
- [ ] CORS ayarlarını yap
- [ ] `https://mutluet.org/wp-json/jwt-auth/v1/token` endpoint'ini test et

---

## 📱 Flutter Mobil App

```bash
cd mutluet_app
flutter pub get
flutter run
```

Flutter app, config'lerini backend'den alır:

```
GET /api/config/mobile
```

---

## 🚀 Production Deployment

### Vercel (Frontend)

```bash
npm i -g vercel
vercel --prod
```

### Azure (Backend)

```bash
# Azure Bicep ile deploy
az deployment group create \
  --resource-group mutluet-rg \
  --template-file infra/main.bicep \
  --parameters infra/main.parameters.json
```

---

## ✅ Yapılacaklar Listesi

### 🔴 KRİTİK (Uygulamanın Çalışması İçin Şart)

| # | Görev                                  | Dosya                                                                 | Durum |
|---|----------------------------------------|-----------------------------------------------------------------------|-------|
| 1 | Azure Key Vault oluştur                | Terminal: `az keyvault create`                                        | ⬜     |
| 2 | Sırları Key Vault'a yükle              | `scripts/upload-secrets-to-vault.sh`                                  | ⬜     |
| 3 | MongoDB Atlas cluster adresini tamamla | `.env` → `MONGODB_URI`                                                | ⬜     |
| 4 | Google OAuth client ID/secret al       | [console.cloud.google.com](https://console.cloud.google.com) → `.env` | ⬜     |
| 5 | Stripe hesabı aç, API key'leri al      | [stripe.com](https://stripe.com) → `.env`                             | ⬜     |
| 6 | JWT_SECRET tanımla                     | `.env` → `JWT_SECRET`                                                 | ⬜     |
| 7 | DATABASE_URL tanımla                   | `.env` → `DATABASE_URL`                                               | ⬜     |
| 8 | Prisma migration çalıştır              | `cd backend && pnpm prisma:migrate`                                   | ⬜     |

### 🟡 YÜKSEK ÖNCELİK

| #  | Görev                              | Dosya                                  | Durum |
|----|------------------------------------|----------------------------------------|-------|
| 9  | Firebase projesi oluştur           | `.env` → `VITE_FIREBASE_*`             | ⬜     |
| 10 | SendGrid API key al                | `.env` → `SENDGRID_API_KEY`            | ⬜     |
| 11 | Google Maps API key al             | `.env` → `GOOGLE_MAPS_API_KEY_BACKEND` | ⬜     |
| 12 | Sentry projesi oluştur             | `.env` → `SENTRY_DSN`                  | ⬜     |
| 13 | WordPress JWT plugin yükle         | mutluet.org admin panel                | ⬜     |
| 14 | WordPress wp-config.php JWT secret | WordPress sunucusu                     | ⬜     |
| 15 | App Insights connection string     | Azure Portal → `.env`                  | ⬜     |

### 🟢 ORTA ÖNCELİK

| #  | Görev                         | Dosya                   | Durum |
|----|-------------------------------|-------------------------|-------|
| 16 | Azure Storage account oluştur | Azure Portal → `.env`   | ⬜     |
| 17 | Azure Communication Services  | Azure Portal → `.env`   | ⬜     |
| 18 | Telegram bot oluştur          | BotFather → `.env`      | ⬜     |
| 19 | Cloudinary hesabı aç          | cloudinary.com → `.env` | ⬜     |
| 20 | Vercel'e deploy               | `vercel --prod`         | ⬜     |

### 🔵 DÜŞÜK ÖNCELİK

| #  | Görev              | Dosya  | Durum |
|----|--------------------|--------|-------|
| 21 | OpenRouter API key | `.env` | ⬜     |
| 22 | Figma API token    | `.env` | ⬜     |
| 23 | Slack bot          | `.env` | ⬜     |
| 24 | Twilio SMS         | `.env` | ⬜     |
| 25 | YouTube API        | `.env` | ⬜     |

---

## 🔧 Sorun Giderme

### "Key Vault'a bağlanamıyor"

```bash
# Azure oturumunu kontrol et
az account show

# Key Vault erişimini test et
az keyvault secret list --vault-name anahtar
```

### "macOS Preview boş ekran gösteriyor"

```bash
# Vite sunucusunun çalıştığından emin ol
pnpm dev

# Tarayıcıda kontrol et
open http://localhost:5173
```

### "Prisma migration hatası"

```bash
cd backend
# .env'deki DATABASE_URL doğru mu kontrol et
pnpm prisma:generate
pnpm prisma:migrate dev --name init
```

### "CORS hatası"

Backend'deki CORS ayarını kontrol et:

```typescript
// backend/src/index.ts
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
```

---

## 📁 Proje Dosya Yapısı (Özet)

```
Mutluet/
├── .env                          ← TÜM sırlar (Git'e push edilmez!)
├── .env.example                  ← Boş şablon (Git'te)
├── scripts/
│   └── upload-secrets-to-vault.sh ← Sırları Azure'a yükle
├── backend/
│   ├── src/
│   │   ├── index.ts              ← Express sunucu giriş noktası
│   │   ├── config/
│   │   │   ├── azure-secrets.ts  ← 🔐 Key Vault merkezi sır yönetimi
│   │   │   ├── database.ts       ← Prisma client
│   │   │   └── monitoring.ts     ← App Insights
│   │   ├── middleware/
│   │   │   └── auth.ts           ← JWT doğrulama (Key Vault destekli)
│   │   ├── routes/
│   │   │   ├── auth.ts           ← Kayıt/giriş
│   │   │   ├── config.ts         ← 📡 Frontend/mobil config endpoint
│   │   │   ├── wordpress.ts      ← WordPress SSO
│   │   │   └── ...
│   │   └── services/
│   │       └── socket.ts         ← Socket.IO (gerçek zamanlı)
│   └── prisma/
│       └── schema.prisma         ← Veritabanı şeması
├── src/                          ← React Frontend
│   ├── main.tsx
│   ├── app/
│   │   ├── App.tsx
│   │   ├── routes.ts
│   │   └── components/           ← Tüm sayfa bileşenleri
│   ├── contexts/
│   │   └── AuthContext.tsx        ← Oturum yönetimi
│   └── lib/
│       ├── api.ts                ← Backend API client
│       └── supabase.ts           ← Supabase client
├── omer/                         ← 🍎 macOS Preview App (SwiftUI)
│   ├── omer.xcodeproj/
│   └── omer/
│       ├── omerApp.swift
│       ├── ContentView.swift     ← WebView + toolbar
│       ├── WebView.swift         ← WKWebView wrapper
│       └── omer.entitlements     ← Network izni
├── mutluet_app/                  ← 📱 Flutter Mobil App
│   ├── lib/
│   │   └── main.dart
│   └── pubspec.yaml
└── infra/                        ← Azure altyapı (Bicep)
    ├── main.bicep
    └── main.parameters.json
```

---

## 💡 Ajan Yönlendirme Rehberi

WordPress veya diğer platformlarda çalışırken ajanları şu şekilde yönlendirebilirsiniz:

### WordPress Ajanı İçin Görevler

1. "mutluet.org WordPress admin paneline git, JWT Auth eklentisini yükle"
2. "wp-config.php'ye bu JWT secret'ı ekle: [secret]"
3. "CORS header'larını functions.php'ye ekle"
4. "REST API endpoint'lerini test et: /wp-json/jwt-auth/v1/token"

### Backend Ajanı İçin Görevler

1. "Azure Key Vault'tan secret'ları çek ve test et"
2. "Yeni bir route ekle: /api/pets"
3. "MongoDB bağlantısını yapılandır"

### Frontend Ajanı İçin Görevler

1. "Yeni sayfa ekle: /api/config/public'ten config çek"
2. "WordPress SSO butonunu profile ekle"
3. "Harita sayfasına Google Maps entegre et"

---

> 📌 **Bu rehber, projenin tam kurulumunu sıfırdan yapmanızı sağlar.**
> Her adımı sırasıyla takip edin. Sorun yaşarsanız "Sorun Giderme" bölümüne bakın.

