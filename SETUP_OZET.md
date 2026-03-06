# 🎯 MUTLUET - KURULUM ÖZETİ VE API KEYS REHBERİ

Bu dokuman, Mutluet projesi için tamamlanan kurulumları ve doldurulması gereken API key'leri gösterir.

---

## ✅ TAMAMLANAN KURULUMLAR

### 1. ✅ Geliştirme Ortamı
- **Node.js**: v20.19.4 ✓
- **Flutter**: 3.35.7 ✓
- **Android SDK**: Kurulu ✓
- **pnpm**: Kurulu ✓
- **Git**: Aktif ✓

### 2. ✅ Terminal Konfigurasyon
- **Powerlevel10k Theme**: Aktif ✓
- **Flutter PATH**: Tanımlı ✓
- **Android SDK PATH**: Tanımlı ✓
- **Mutluet Aliases**: Eklendi ✓

**Yeni Aliaslar:**
```bash
# Proje navigasyonu
mutluet                 # ~/Mutluet klasörüne git
mutluet-backend         # Backend klasörüne git
mutluet-mobile          # Flutter uygulamayı çalıştır

# Geliştirme
flutter-clean           # Flutter temizle ve dependencies yükle
backend-dev             # Backend dev server başlat
frontend-dev            # Frontend dev server başlat

# Build
build-android           # Android APK oluştur (release)
build-android-debug     # Android APK oluştur (debug)

# Test
test-flutter            # Flutter testleri çalıştır
test-backend            # Backend testleri çalıştır
test-all                # Tüm testleri çalıştır
```

### 3. ✅ MCP (Model Context Protocol)
**Konum:** `~/Library/Application Support/Claude/claude_desktop_config.json`

**Aktif MCP Serverlar:**
- ✅ `mutluet-filesystem` - Mutluet klasörüne erişim
- ✅ `mutluet-github` - GitHub entegrasyonu (Token gerekli)
- ✅ `jetbrains` - DataGrip entegrasyonu
- ✅ `MCP_DOCKER` - Docker gateway

### 4. ✅ Git Repository
- **Remote**: https://github.com/omerfarukkural/Mutluet.git
- **Branch**: main
- **Son Commit**: feat: Add complete Azure integration

### 5. ✅ Android Debug Keystore
**SHA-1 Certificate:**
```
6B:98:01:40:EF:23:87:FE:8D:09:95:78:9F:BA:D4:F2:23:12:3D:2B
```

**SHA-256 Certificate:**
```
14:29:E3:0F:91:38:DD:58:C8:E9:DD:EA:68:68:BD:74:4F:97:FC:71:D3:92:FB:D1:82:59:40:78:B1:DF:4E:9B
```

**Kullanım:** Google Firebase Console ve Google Cloud Console'da Android app kaydı için gerekli

---

## 🔑 DOLDURULMASI GEREKEN API KEYS

### 1. 🟢 GOOGLE CLOUD (Öncelikli)

#### A) OAuth 2.0 Credentials

**Adım 1:** Google Cloud Console'a git
- URL: https://console.cloud.google.com
- Proje: "Mutluet" oluştur (veya mevcut kullan)

**Adım 2:** OAuth Consent Screen yapılandır
```
Navigation: APIs & Services → OAuth consent screen
User Type: External
App name: Mutluet
User support email: omerfaruk@bitebimuv.org
Developer email: omerfaruk@bitebimuv.org
```

**Adım 3:** Web Application Credentials oluştur
```
Navigation: APIs & Services → Credentials → Create Credentials → OAuth client ID
Application type: Web application
Name: Mutluet Web Client

Authorized JavaScript origins:
  - http://localhost:5173
  - https://mutluet.vercel.app
  - https://mutluet.org

Authorized redirect URIs:
  - http://localhost:5173/auth/google/callback
  - https://mutluet.vercel.app/auth/google/callback
  - https://mutluet.org/auth/google/callback
```

**Çıktı (Kaydet):**
- Client ID: `................................apps.googleusercontent.com`
- Client Secret: `GOCSPX-................................`

**Dosyaya Ekle:**
```bash
# backend/.env
GOOGLE_CLIENT_ID="[buraya yapıştır]"
GOOGLE_CLIENT_SECRET="[buraya yapıştır]"
```

---

#### B) Android OAuth (Mobil için - İleride)

**Adım 4:** Android Application Credentials
```
Application type: Android
Name: Mutluet Android
Package name: com.bitebimuv.mutluet
SHA-1 certificate: 6B:98:01:40:EF:23:87:FE:8D:09:95:78:9F:BA:D4:F2:23:12:3D:2B
```

**Çıktı:**
- Android Client ID: `................................apps.googleusercontent.com`

---

#### C) Google Maps API

**Adım 5:** API'leri aktifleştir
```
Navigation: APIs & Services → Library
Aktifleştir:
  ✓ Maps JavaScript API
  ✓ Places API
  ✓ Geolocation API
  ✓ Directions API
```

**Adım 6:** API Key oluştur
```
Navigation: APIs & Services → Credentials → Create Credentials → API key
Name: Mutluet Maps API Key

API restrictions:
  ✓ Maps JavaScript API
  ✓ Places API
  ✓ Geolocation API
  ✓ Directions API
```

**Çıktı:**
- API Key: `AIza................................`

**Dosyaya Ekle:**
```bash
# .env
VITE_GOOGLE_MAPS_API_KEY="[buraya yapıştır]"
```

---

### 2. 🔥 FIREBASE (Push Notifications + Analytics)

**Adım 1:** Firebase Console
- URL: https://console.firebase.google.com
- "Add project" → "Mutluet"
- Google Analytics: Enable

**Adım 2:** Android App Ekle
```
Platform: Android
Package name: com.bitebimuv.mutluet
App nickname: Mutluet Android
SHA-1: 6B:98:01:40:EF:23:87:FE:8D:09:95:78:9F:BA:D4:F2:23:12:3D:2B

Download: google-services.json
Taşı: ~/Mutluet/android/app/google-services.json
```

**Adım 3:** Web App Ekle
```
Platform: Web
App nickname: Mutluet Web

Config'i kopyala:
```

**Dosyaya Ekle:**
```bash
# .env
VITE_FIREBASE_API_KEY="AIza................................"
VITE_FIREBASE_AUTH_DOMAIN="mutluet.firebaseapp.com"
VITE_FIREBASE_PROJECT_ID="mutluet"
VITE_FIREBASE_STORAGE_BUCKET="mutluet.appspot.com"
VITE_FIREBASE_MESSAGING_SENDER_ID=".................."
VITE_FIREBASE_APP_ID="1:.....................:web:.................."
```

**Adım 4:** Cloud Messaging
```
Navigation: Project Settings → Cloud Messaging
Copy:
  - Server key
  - Sender ID
```

---

### 3. 💳 STRIPE (Bağış Ödemeleri)

**Adım 1:** Stripe Dashboard
- URL: https://dashboard.stripe.com/register
- Email: omerfaruk@bitebimuv.org
- Business type: Non-profit
- Business name: Bir Tebessüm Bin Mutluluk Derneği

**Adım 2:** API Keys (Test Mode)
```
Navigation: Developers → API keys

Test Mode:
  - Publishable key: pk_test_................................
  - Secret key: sk_test_................................ (Reveal)
```

**Dosyaya Ekle:**
```bash
# backend/.env
STRIPE_SECRET_KEY="sk_test_................................"
STRIPE_PUBLISHABLE_KEY="pk_test_................................"

# .env
VITE_STRIPE_PUBLISHABLE_KEY="pk_test_................................"
```

**Adım 3:** Webhook
```
Navigation: Developers → Webhooks → Add endpoint

Endpoint URL: https://mutluet-api.azurewebsites.net/api/stripe/webhook
Events:
  ✓ payment_intent.succeeded
  ✓ payment_intent.payment_failed
  ✓ charge.refunded

Signing secret: whsec_................................
```

**Dosyaya Ekle:**
```bash
# backend/.env
STRIPE_WEBHOOK_SECRET="whsec_................................"
```

---

### 4. 🟦 AZURE (Backend + Storage + Video)

#### A) Service Principal (MCP için)

**Adım 1:** Azure Portal
- URL: https://portal.azure.com
- Azure Active Directory → App registrations → New registration

```
Name: mutluet-mcp
Supported account types: Single tenant
```

**Adım 2:** Client Secret
```
Navigation: Certificates & secrets → Client secrets → New

Description: MCP Access
Expires: 24 months

Value: ................................ (HEMEN KOPYALA!)
```

**Adım 3:** IDs'leri al
```
Navigation: Overview

Application (client) ID: ................................
Directory (tenant) ID: ................................
```

**Adım 4:** Subscription ID
```
Navigation: Subscriptions → [subscription adınız]

Subscription ID: ................................
```

**MCP Config'e Ekle:**
```json
// ~/Library/Application Support/Claude/claude_desktop_config.json
"azure": {
  "command": "npx",
  "args": ["-y", "@modelcontextprotocol/server-azure"],
  "env": {
    "AZURE_SUBSCRIPTION_ID": "................................",
    "AZURE_CLIENT_ID": "................................",
    "AZURE_CLIENT_SECRET": "................................",
    "AZURE_TENANT_ID": "................................"
  }
}
```

---

#### B) Azure Communication Services (Video Call)

**Adım 5:** Communication Service oluştur
```
Navigation: Create a resource → Communication Services

Resource group: mutluet-prod-rg (oluştur)
Resource name: mutluet-video
Data location: Europe
```

**Adım 6:** Connection String
```
Navigation: mutluet-video → Keys

Primary connection string:
endpoint=https://mutluet-video.communication.azure.com/;accesskey=................................
```

**Dosyaya Ekle:**
```bash
# backend/.env
AZURE_COMMUNICATION_CONNECTION_STRING="endpoint=https://mutluet-video.communication.azure.com/;accesskey=................................"
```

---

#### C) Azure Storage (Dosya Yükleme)

**Adım 7:** Storage Account oluştur
```
Navigation: Create a resource → Storage account

Resource group: mutluet-prod-rg
Storage account name: mutluetstorage
Region: West Europe
Performance: Standard
Redundancy: LRS
```

**Adım 8:** Container oluştur
```
Navigation: mutluetstorage → Containers → + Container

Name: uploads
Public access level: Blob
```

**Adım 9:** Access Keys
```
Navigation: mutluetstorage → Access keys → Show keys

Connection string:
DefaultEndpointsProtocol=https;AccountName=mutluetstorage;AccountKey=................................
```

**Dosyaya Ekle:**
```bash
# backend/.env
AZURE_STORAGE_CONNECTION_STRING="DefaultEndpointsProtocol=https;AccountName=mutluetstorage;AccountKey=................................"
```

---

### 5. 📸 CLOUDINARY (Resim/Video Hosting - Opsiyonel)

**Adım 1:** Cloudinary Signup
- URL: https://cloudinary.com/users/register/free
- Email: omerfaruk@bitebimuv.org

**Adım 2:** Dashboard Credentials
```
Cloud name: mutluet (veya otomatik oluşan)
API Key: ................................
API Secret: ................................
```

**Dosyaya Ekle:**
```bash
# backend/.env
CLOUDINARY_CLOUD_NAME="mutluet"
CLOUDINARY_API_KEY="................................"
CLOUDINARY_API_SECRET="................................"

# .env
VITE_CLOUDINARY_CLOUD_NAME="mutluet"
```

**Adım 3:** Upload Preset
```
Navigation: Settings → Upload → Upload presets → Add upload preset

Upload preset name: mutluet_uploads
Signing Mode: Unsigned
Folder: mutluet/
```

**Dosyaya Ekle:**
```bash
# .env
VITE_CLOUDINARY_UPLOAD_PRESET="mutluet_uploads"
```

---

### 6. 🐙 GITHUB (MCP Entegrasyonu)

**Adım 1:** Personal Access Token
- URL: https://github.com/settings/tokens
- Tokens (classic) → Generate new token

```
Note: Mutluet MCP Access
Expiration: No expiration
Scopes:
  ✓ repo (Full control)
  ✓ workflow (Update GitHub Actions)
  ✓ read:org (Read org membership)
```

**Token (Kopyala):**
```
ghp_................................
```

**MCP Config'e Ekle:**
```json
// ~/Library/Application Support/Claude/claude_desktop_config.json
"mutluet-github": {
  "command": "npx",
  "args": ["-y", "@modelcontextprotocol/server-github"],
  "env": {
    "GITHUB_PERSONAL_ACCESS_TOKEN": "ghp_................................"
  }
}
```

---

### 7. 📧 SENDGRID (Email - Opsiyonel)

**Adım 1:** SendGrid Signup
- URL: https://signup.sendgrid.com/

**Adım 2:** API Key
```
Navigation: Settings → API Keys → Create API Key

Name: Mutluet Backend
Permissions: Full Access

API Key: SG.................................
```

**Dosyaya Ekle:**
```bash
# backend/.env
SENDGRID_API_KEY="SG................................."
SENDGRID_FROM_EMAIL="noreply@mutluet.org"
```

---

### 8. 🛡️ SENTRY (Error Tracking - Opsiyonel)

**Adım 1:** Sentry Signup
- URL: https://sentry.io/signup/

**Adım 2:** Project Oluştur
```
Platform: React
Project name: mutluet-frontend

Platform: Node.js
Project name: mutluet-backend
```

**DSN Kopyala:**
```
Frontend DSN: https://................................@o........ingest.sentry.io/........
Backend DSN: https://................................@o........ingest.sentry.io/........
```

**Dosyaya Ekle:**
```bash
# backend/.env
SENTRY_DSN="https://................................@o........ingest.sentry.io/........"

# .env
VITE_SENTRY_DSN="https://................................@o........ingest.sentry.io/........"
```

---

## 📋 KONTROL LİSTESİ

Aşağıdaki dosyaları doldurun:

### Backend (.env)
```bash
cd ~/Mutluet/backend
nano .env
```

**Doldurulması Gerekenler:**
- [ ] GOOGLE_CLIENT_ID
- [ ] GOOGLE_CLIENT_SECRET
- [ ] STRIPE_SECRET_KEY
- [ ] STRIPE_PUBLISHABLE_KEY
- [ ] STRIPE_WEBHOOK_SECRET
- [ ] AZURE_COMMUNICATION_CONNECTION_STRING
- [ ] AZURE_STORAGE_CONNECTION_STRING
- [ ] CLOUDINARY_CLOUD_NAME (opsiyonel)
- [ ] CLOUDINARY_API_KEY (opsiyonel)
- [ ] CLOUDINARY_API_SECRET (opsiyonel)
- [ ] SENDGRID_API_KEY (opsiyonel)
- [ ] SENTRY_DSN (opsiyonel)

### Frontend (.env)
```bash
cd ~/Mutluet
nano .env
```

**Doldurulması Gerekenler:**
- [ ] VITE_GOOGLE_MAPS_API_KEY
- [ ] VITE_STRIPE_PUBLISHABLE_KEY
- [ ] VITE_FIREBASE_API_KEY
- [ ] VITE_FIREBASE_AUTH_DOMAIN
- [ ] VITE_FIREBASE_PROJECT_ID
- [ ] VITE_FIREBASE_STORAGE_BUCKET
- [ ] VITE_FIREBASE_MESSAGING_SENDER_ID
- [ ] VITE_FIREBASE_APP_ID
- [ ] VITE_CLOUDINARY_CLOUD_NAME (opsiyonel)
- [ ] VITE_CLOUDINARY_UPLOAD_PRESET (opsiyonel)
- [ ] VITE_SENTRY_DSN (opsiyonel)

### MCP Config
```bash
nano ~/Library/Application\ Support/Claude/claude_desktop_config.json
```

**Doldurulması Gerekenler:**
- [ ] GITHUB_PERSONAL_ACCESS_TOKEN
- [ ] AZURE_SUBSCRIPTION_ID (opsiyonel)
- [ ] AZURE_CLIENT_ID (opsiyonel)
- [ ] AZURE_CLIENT_SECRET (opsiyonel)
- [ ] AZURE_TENANT_ID (opsiyonel)

---

## 🚀 İLK ÇALIŞTIRMA

API key'ler eklendikten sonra:

```bash
# 1. Terminal'i yeniden başlat (aliasları yüklemek için)
source ~/.zshrc

# 2. Backend'i başlat
mutluet-backend
pnpm run dev

# 3. Yeni terminal - Frontend'i başlat
mutluet
pnpm run dev

# 4. Claude Desktop'ı yeniden başlat (MCP config için)
```

**Test Et:**
- Frontend: http://localhost:5173
- Backend: http://localhost:3001/api/health
- Google Login çalışıyor mu?
- Firebase bağlantısı çalışıyor mu?

---

## 📚 Diğer Dokümanlar

- **Claude Promptları**: `/CLAUDE_PROMPTS.md`
- **API Keys Detaylı Rehber**: `/docs/API_KEYS_REHBERI.md`
- **Deployment**: `/docs/VERCEL_DEPLOYMENT.md`
- **Azure Entegrasyon**: `/AZURE_ENTEGRASYON_PLANI.md`

---

## 💡 Önemli Notlar

1. **Güvenlik**: API key'leri asla git'e commit etmeyin (.env dosyaları .gitignore'da)
2. **Production**: Production deploy'dan önce tüm test mode key'leri live mode key'lerle değiştirin
3. **MCP**: Claude Desktop'ı her config değişikliğinden sonra restart edin
4. **Aliases**: Terminal'de `mutluet`, `backend-dev` gibi aliaslar artık çalışıyor

---

✅ **Kurulum Tamamlandı!** API key'leri doldurduğunuzda development environment tamamen hazır olacak.
