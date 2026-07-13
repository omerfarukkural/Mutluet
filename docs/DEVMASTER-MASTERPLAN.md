# DEVMASTER — KAPSAMLI MASTER PLAN
> Mutluet + DevMaster entegrasyon ve geliştirme yol haritası
> Tarih: 2026-03-11 | Versiyon: 1.0

---

## GENEL MİMARİ

```
┌─────────────────────────────────────────────────────────────────────┐
│                        DEVMASTER EKOSISTEMI                          │
│                                                                       │
│  ┌──────────────┐   ┌──────────────┐   ┌──────────────────────────┐ │
│  │   MUTLUET    │   │  DEVMASTER   │   │    OTOMASYON KATMANI     │ │
│  │  (NGO App)   │◄──│  (Dev Hub)   │──►│  Azure Fn + AppScript    │ │
│  └──────────────┘   └──────────────┘   └──────────────────────────┘ │
│         │                  │                        │                 │
│         ▼                  ▼                        ▼                 │
│  ┌──────────────────────────────────────────────────────────────┐    │
│  │                    SHARED SERVICES LAYER                      │    │
│  │  Supabase │ Azure │ Vercel │ Stripe │ Cloudinary │ SendGrid  │    │
│  └──────────────────────────────────────────────────────────────┘    │
│         │                  │                        │                 │
│         ▼                  ▼                        ▼                 │
│  ┌───────────┐   ┌──────────────────┐   ┌──────────────────────┐    │
│  │  AI LAYER │   │  SOCIAL/CONTENT  │   │   MOBILE/DEPLOY      │    │
│  │ Claude    │   │  Postiz (SM Sched│   │  Fastlane (iOS/And)  │    │
│  │ ChatGPT   │   │  CapCut (Video)  │   │  Xcode / Android     │    │
│  │ Gemini    │   │  Figma (Design)  │   │  Studio              │    │
│  │ Perplexity│   │  Canva (Grafik)  │   │  App Store / Play    │    │
│  │ Copilot   │   │  After Effects   │   │  Store               │    │
│  └───────────┘   └──────────────────┘   └──────────────────────┘    │
└─────────────────────────────────────────────────────────────────────┘
```

---

## BÖLÜM 1: MUTLUET — ACİL DÜZELTMELER (Hafta 1)

### 1.1 Prisma Şema Düzeltmeleri
**Sorun:** `oauth.ts`'de `profileImage` ve `AZURE` auth provider eksik
```prisma
# backend/prisma/schema.prisma'ya eklenecekler:
enum AuthProvider {
  EMAIL
  GOOGLE
  FACEBOOK
  TIKTOK
  AZURE        # ← Eklenecek
  MICROSOFT    # ← Eklenecek
}

model User {
  # Mevcut alanların yanına eklenecek:
  profileImage  String?   # ← Eklenecek
  avatar        String?   # Zaten var
}
```

**Komutlar:**
```bash
cd backend
npx prisma migrate dev --name add-azure-provider-and-profile-image
npx prisma generate
```

### 1.2 Eksik NPM Paketleri
```bash
cd backend
pnpm add @azure/keyvault-secrets @azure/identity applicationinsights
```

### 1.3 wordpress.ts Auth Düzeltmesi
```typescript
# backend/src/middleware/auth.ts'e eklenecek:
export { authenticate as authenticateToken }
```

### 1.4 OAuth Route Düzeltmeleri
- `AZURE` → `AuthProvider.AZURE` şema değişikliğinden sonra otomatik düzelecek
- `profileImage` → User modeline eklendikten sonra düzelecek

---

## BÖLÜM 2: MUTLUET — SERVİS YAPILANDIRMALARI (Hafta 1-2)

### 2.1 OAuth Servisleri

#### Google OAuth
```env
GOOGLE_CLIENT_ID=<Google Cloud Console'dan>
GOOGLE_CLIENT_SECRET=<Google Cloud Console'dan>
```
**Adımlar:**
1. console.cloud.google.com → Credentials → OAuth 2.0
2. Authorized redirect URIs: `https://api.mutluet.com/auth/google/callback`

#### Facebook OAuth
```env
FACEBOOK_APP_ID=<Meta Developer'dan>
FACEBOOK_APP_SECRET=<Meta Developer'dan>
```

#### Azure AD (Microsoft)
```env
AZURE_AD_CLIENT_ID=<Azure Portal'dan>
AZURE_AD_CLIENT_SECRET=<Azure Portal'dan>
AZURE_AD_TENANT_ID=<Azure Portal'dan>
```

#### TikTok OAuth
```env
TIKTOK_CLIENT_KEY=<TikTok Developer'dan>
TIKTOK_CLIENT_SECRET=<TikTok Developer'dan>
```

### 2.2 Stripe Entegrasyonu
```env
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PUBLISHABLE_KEY=pk_live_...
```

### 2.3 Azure Servisleri
```env
AZURE_COMMUNICATION_CONNECTION_STRING=<Azure Portal'dan>
AZURE_KEY_VAULT_URL=https://mutluet-kv.vault.azure.net/
APPLICATIONINSIGHTS_CONNECTION_STRING=InstrumentationKey=...
```

### 2.4 E-posta (SendGrid)
```env
SENDGRID_API_KEY=SG...
FROM_EMAIL=noreply@mutluet.com
```

### 2.5 Medya (Cloudinary)
```env
CLOUDINARY_CLOUD_NAME=mutluet
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
```

---

## BÖLÜM 3: MUTLUET — YENİ ÖZELLİKLER (Hafta 2-4)

### 3.1 AI Asistan Entegrasyonu (Mutluet içi)
- Gönüllü eşleştirme için AI önerileri (Claude API)
- Bağış kategorisi için akıllı öneri
- Chatbot desteği (Socket.IO üzerinden)

### 3.2 Sosyal Paylaşım
- Başarımları sosyal medyada paylaşma
- Etkinlik duyurularını otomatik paylaşma (Postiz MCP)

### 3.3 Mobil Uygulama (iOS - Xcode)
- `/home/user/Mutluet/omer/` klasöründeki iOS projesini geliştir
- Fastlane ile App Store deployment otomasyonu
- Push notification (Azure Notification Hub)

---

## BÖLÜM 4: DEVMASTER — ANA UYGULAMA MİMARİSİ (Hafta 3-8)

### 4.1 DevMaster Nedir?
Developer Master Control Center — Tüm geliştirme araçlarını, AI asistanlarını,
deployment platformlarını ve içerik araçlarını tek bir dashboard'da birleştiren
süper uygulama.

**Tech Stack:**
- Frontend: Next.js 14 (App Router) + TypeScript + TailwindCSS
- Backend: Node.js + Express (Mutluet backend'i ile paylaşımlı)
- Database: Supabase (Mutluet ile ortak)
- Auth: Supabase Auth / JWT
- MCP: Claude MCP protokolü üzerinden tüm entegrasyonlar
- Deploy: Vercel (frontend) + Azure App Service (backend)

### 4.2 DevMaster Modülleri

#### Modül 1: AI Orkestra
Multi-AI yönetim ve koordinasyon sistemi:
```
┌──────────────────────────────────────────┐
│              AI ORKESTRA                  │
│                                           │
│  ┌────────┐ ┌────────┐ ┌──────────────┐  │
│  │ Claude │ │ChatGPT │ │   Gemini     │  │
│  │  API   │ │  API   │ │    API       │  │
│  └────────┘ └────────┘ └──────────────┘  │
│  ┌────────┐ ┌────────┐ ┌──────────────┐  │
│  │Perplx. │ │Copilot │ │  Ollama      │  │
│  │  API   │ │  API   │ │  (Local)     │  │
│  └────────┘ └────────┘ └──────────────┘  │
│                                           │
│  → Görev yönlendirici (router)            │
│  → Model karşılaştırma                    │
│  → Maliyet takibi                         │
│  → Ortak konuşma geçmişi                  │
└──────────────────────────────────────────┘
```

**Entegrasyonlar:**
- `skills/ai-services/` mevcut skill'i genişletilecek
- Claude MCP üzerinden diğer AI'lara yönlendirme
- Prompt template yönetimi
- Cost dashboard (token kullanımı izleme)

#### Modül 2: Deploy Maestro
Tüm deployment platformlarının merkezi yönetimi:
```
platforms:
  - Vercel (frontend apps)
  - Azure App Service (backend)
  - Azure Static Web Apps (static)
  - Railway/Render (backend alternatif)
  - Supabase (database migrations)
  - App Store (iOS via Fastlane)
  - Google Play (Android via Fastlane)
```

**Fastlane Entegrasyonu (`/Users/omerfarukkural/fastlane` bazlı):**
```ruby
# Fastfile lanes:
lane :ios_beta do
  build_ios_app
  upload_to_testflight
  slack_notify
end

lane :android_release do
  build_android_app
  upload_to_play_store
  slack_notify
end

lane :full_release do
  ios_beta
  android_release
  vercel_deploy
  azure_deploy
end
```

#### Modül 3: Sosyal Medya Merkezi
Postiz-app tabanlı sosyal medya yönetimi:
```
desteklenen platformlar:
  - Instagram (Reels, Stories, Posts)
  - TikTok (Videos)
  - Twitter/X (Tweets, Threads)
  - LinkedIn (Posts, Articles)
  - YouTube (Videos, Shorts)
  - Facebook (Posts, Reels)
  - Threads
  - Pinterest
  - Reddit
```

**Postiz Entegrasyonu:**
- Postiz API bağlantısı veya self-hosted kurulum
- İçerik takvimi
- Toplu zamanlama
- Analitik dashboard
- AI ile içerik üretimi

**Video Workflow (CapCut + After Effects):**
```
video_pipeline:
  1. Ham video → CapCut API / webhook
  2. Efekt/düzenleme → After Effects automation
  3. Render tamamlanınca → Cloudinary upload
  4. Postiz'e → Platform'a göre optimize yükleme
```

#### Modül 4: Proje Yönetim Hub
```
entegrasyonlar:
  - GitHub (repo, PR, issues)
  - Monday.com (görevler, sprints)
  - Notion (dokümantasyon, wiki)
  - Slack (bildirimler, iletişim)
  - Telegram (bot bildirimler)
  - Jira (isteğe bağlı)
```

**Agency Agents Entegrasyonu (`agency-agents-main` bazlı):**
- Research Agent: Pazar araştırması, rakip analizi
- Content Agent: Blog, sosyal medya içerikleri
- Deploy Agent: CI/CD tetikleme
- Monitor Agent: Performans ve hata izleme
- Report Agent: Haftalık raporlar

#### Modül 5: Tasarım Asistanı
```
entegrasyonlar:
  - Figma API (tasarım asset yönetimi)
  - Canva API (sosyal medya görselleri)
  - Cloudinary (medya kütüphanesi)
  - Adobe After Effects (video şablonları)
```

**Figma → Uygulama Pipeline:**
```
1. Figma'da tasarım tamamla
2. DevMaster Figma MCP ile asset'leri çek
3. React bileşenlerine otomatik dönüştür
4. GitHub PR oluştur
5. Vercel preview deploy
```

#### Modül 6: Kod Kalite Merkezi
`web-quality-skills` bazlı:
```
araçlar:
  - ESLint / Prettier otomatik düzeltme
  - TypeScript strict check
  - Lighthouse CI (performance)
  - Snyk (güvenlik taraması)
  - SonarQube (kod kalitesi)
  - Bundle analyzer
  - Accessibility checker (axe-core)
```

#### Modül 7: Otomasyon Motoru
**Azure Functions:**
```typescript
// Örnek otomasyonlar:
- her_gece_yedek: Supabase → Azure Blob backup
- haftalik_rapor: Analytics → Slack/Monday.com
- yeni_kullanici_hoşgeldin: Email + Slack bildirim
- sosyal_medya_zamanlayici: Postiz tetikleyici
- fatura_olustur: Stripe → PDF → Email
```

**Google Apps Script (Google Workspace):**
```javascript
// Örnek otomasyonlar:
- form_to_supabase: Google Forms → DB
- sheets_to_dashboard: Google Sheets → DevMaster
- gmail_to_ticket: Support email → Monday.com görev
- calendar_sync: Google Calendar ↔ Monday.com
- drive_backup: Kritik dosyalar → Google Drive
```

#### Modül 8: İzleme & Analitik
```
araçlar:
  - Azure App Insights (backend perf)
  - Vercel Analytics (frontend)
  - Supabase Dashboard (DB queries)
  - Stripe Dashboard (gelir)
  - Postiz Analytics (sosyal medya)
  - Custom DevMaster Dashboard (tümleşik)
```

---

## BÖLÜM 5: DEVMASTER — MCP BAĞLANTILARI (Hafta 4-6)

### 5.1 Genişletilmiş MCP Konfigürasyonu

Mevcut MCPler (`.ai/mcp/mcp.json`'a eklenmesi gerekenler):

```json
{
  "mcpServers": {
    // MEVCUT
    "github": { ... },
    "supabase": { ... },
    "postgres": { ... },
    "filesystem": { ... },
    "slack": { ... },
    "notion": { ... },
    "google-maps": { ... },
    "fetch": { ... },
    "sequential-thinking": { ... },

    // YENİ EKLENECEKLER
    "azure": {
      "command": "npx",
      "args": ["-y", "@azure/mcp-server"],
      "env": {
        "AZURE_SUBSCRIPTION_ID": "${AZURE_SUBSCRIPTION_ID}",
        "AZURE_TENANT_ID": "${AZURE_TENANT_ID}"
      }
    },
    "vercel": {
      "command": "npx",
      "args": ["-y", "@vercel/mcp-server"],
      "env": { "VERCEL_TOKEN": "${VERCEL_TOKEN}" }
    },
    "stripe": {
      "command": "npx",
      "args": ["-y", "@stripe/mcp-server"],
      "env": { "STRIPE_SECRET_KEY": "${STRIPE_SECRET_KEY}" }
    },
    "figma": {
      "command": "npx",
      "args": ["-y", "figma-mcp-server"],
      "env": { "FIGMA_API_KEY": "${FIGMA_API_KEY}" }
    },
    "monday": {
      "command": "npx",
      "args": ["-y", "monday-mcp-server"],
      "env": { "MONDAY_API_KEY": "${MONDAY_API_KEY}" }
    },
    "telegram": {
      "command": "npx",
      "args": ["-y", "telegram-mcp-server"],
      "env": {
        "TELEGRAM_BOT_TOKEN": "${TELEGRAM_BOT_TOKEN}",
        "TELEGRAM_CHAT_ID": "${TELEGRAM_CHAT_ID}"
      }
    },
    "sendgrid": {
      "command": "npx",
      "args": ["-y", "sendgrid-mcp-server"],
      "env": { "SENDGRID_API_KEY": "${SENDGRID_API_KEY}" }
    },
    "cloudinary": {
      "command": "npx",
      "args": ["-y", "cloudinary-mcp-server"],
      "env": {
        "CLOUDINARY_CLOUD_NAME": "${CLOUDINARY_CLOUD_NAME}",
        "CLOUDINARY_API_KEY": "${CLOUDINARY_API_KEY}",
        "CLOUDINARY_API_SECRET": "${CLOUDINARY_API_SECRET}"
      }
    },
    "twilio": {
      "command": "npx",
      "args": ["-y", "twilio-mcp-server"],
      "env": {
        "TWILIO_ACCOUNT_SID": "${TWILIO_ACCOUNT_SID}",
        "TWILIO_AUTH_TOKEN": "${TWILIO_AUTH_TOKEN}"
      }
    }
  }
}
```

### 5.2 DevMaster Özel MCP Skill'leri

Mevcut `skills/` klasörüne eklenecekler:
```
skills/
├── devmaster-core/       # DevMaster temel işlemleri
├── ai-orchestra/         # Çoklu AI koordinasyonu
├── deploy-maestro/       # Tüm platform deploy
├── social-hub/           # Postiz + sosyal medya
├── video-pipeline/       # Video üretim zinciri
├── code-quality/         # Kalite kontrol araçları
├── automation-engine/    # Azure Fn + AppScript
├── design-assistant/     # Figma + Canva
├── mobile-deploy/        # Fastlane iOS/Android
└── agency-agents/        # Ajan orkestrasyon
```

---

## BÖLÜM 6: DEVMASTER — YENİ CLAUDE.md KURALLARI (Hafta 4)

CLAUDE.md'ye eklenecekler:
```markdown
## DevMaster Kuralları
1. Her modül için ayrı `skills/` dosyası oluştur
2. MCP sunucuları `.ai/mcp/mcp.json`'da merkezi yönetilir
3. Otomasyon fonksiyonları Azure Functions veya AppScript'te
4. Sosyal medya paylaşımları Postiz API üzerinden
5. Video işleme pipeline'ı async olmalı (webhook tabanlı)
6. Tüm AI API çağrıları `skills/ai-orchestra/` üzerinden

## DevMaster Araç Entegrasyonları
| Araç | Entegrasyon | Skill |
|------|-------------|-------|
| VSCode | Extension API | devmaster-core |
| Xcode | xcrun / simctl | mobile-deploy |
| Android Studio | Fastlane | mobile-deploy |
| Figma | REST API + MCP | design-assistant |
| Canva | Connect API | design-assistant |
| CapCut | Webhook | video-pipeline |
| After Effects | ExtendScript | video-pipeline |
| Postiz | REST API | social-hub |
| Monday.com | GraphQL API + MCP | monday-tasks |
| Slack | Bot API + MCP | slack-notify |
| GitHub Copilot | VS Code Extension | devmaster-core |
| Gemini | API | ai-orchestra |
| Perplexity | API | ai-orchestra |
| ChatGPT | API | ai-orchestra |
```

---

## BÖLÜM 7: DEVMASTER — SOSYAL MEDYA & VİDEO PİPELINE (Hafta 5-7)

### 7.1 İçerik Üretim Zinciri (Agency Agents bazlı)

```
[Fikir Girişi]
      │
      ▼
[Research Agent] ← Perplexity API / Brave Search
      │ (konu araştırması)
      ▼
[Content Agent] ← Claude API
      │ (metin, başlık, hashtag üretimi)
      ▼
[Design Agent] ← Canva API / Figma API
      │ (görsel üretim)
      ▼
[Video Agent] ← CapCut webhook / After Effects
      │ (video üretim/edit)
      ▼
[Review Agent] ← İnsan onayı (DevMaster UI)
      │
      ▼
[Publish Agent] ← Postiz API
      │ (zamanlı yayın: IG, TikTok, YT, X, LinkedIn)
      ▼
[Analytics Agent] ← Platform API'leri
      (performans takibi)
```

### 7.2 Desteklenen Sosyal Medya Formatları

| Platform | Format | Boyut | Süre |
|----------|--------|-------|------|
| Instagram | Reels | 9:16 | <90sn |
| Instagram | Post | 1:1 | - |
| Instagram | Story | 9:16 | <15sn |
| TikTok | Video | 9:16 | <10dk |
| YouTube | Video | 16:9 | sınırsız |
| YouTube | Shorts | 9:16 | <60sn |
| Twitter/X | Tweet | - | 280kar |
| LinkedIn | Post | 1200x627 | - |
| Facebook | Reel | 9:16 | <90sn |

### 7.3 Otomatik Yayın Takvimi (Postiz)

```javascript
// Örnek haftalık plan:
{
  pazartesi: { platform: "linkedin", type: "article", time: "09:00" },
  salı:      { platform: "instagram", type: "reel", time: "18:00" },
  çarşamba:  { platform: "twitter", type: "thread", time: "12:00" },
  perşembe:  { platform: "tiktok", type: "video", time: "19:00" },
  cuma:      { platform: "youtube", type: "shorts", time: "17:00" },
  cumartesi: { platform: "instagram", type: "story", time: "11:00" },
  pazar:     { platform: "facebook", type: "post", time: "15:00" }
}
```

---

## BÖLÜM 8: DEVMASTER — MOBİL (iOS/Android) (Hafta 6-8)

### 8.1 iOS (Xcode + Fastlane)
```ruby
# Fastfile (fastlane/Fastfile)
platform :ios do

  lane :dev do
    build_ios_app(scheme: "DevMaster-Dev")
    install_on_device
  end

  lane :beta do
    increment_build_number
    build_ios_app(scheme: "DevMaster")
    upload_to_testflight
    slack(message: "iOS Beta #{version_number} yüklendi!")
  end

  lane :release do
    ensure_git_status_clean
    increment_version_number
    build_ios_app(scheme: "DevMaster")
    upload_to_app_store
    slack(message: "App Store'da DevMaster #{version_number}!")
  end

end
```

**Xcode Entegrasyonları:**
- GitHub Copilot for Xcode (kod tamamlama)
- Antigravity (AI destekli debugging)
- SwiftLint (kod kalitesi)
- Fastlane (otomatik deploy)

### 8.2 Android (Android Studio + Fastlane)
```ruby
platform :android do

  lane :beta do
    gradle(task: "bundle", build_type: "Release")
    upload_to_play_store(track: "internal")
    slack(message: "Android Beta #{version_name} hazır!")
  end

  lane :release do
    gradle(task: "bundle", build_type: "Release")
    upload_to_play_store(track: "production")
  end

end
```

---

## BÖLÜM 9: DEVMASTER — OTOMASYON MOTORLARI (Hafta 7-9)

### 9.1 Azure Functions Otomasyonları

```typescript
// functions/weekly-report/index.ts
export async function weeklyReport(context: Context): Promise<void> {
  const metrics = await gatherMetrics();      // Supabase
  const report = await generateReport(metrics); // Claude API
  await sendToSlack(report);                  // Slack MCP
  await updateMonday(report);                 // Monday.com
  await saveToNotion(report);                 // Notion MCP
}

// functions/social-auto-post/index.ts
export async function socialAutoPost(context: Context): Promise<void> {
  const content = await generateContent();    // Claude API
  const image = await generateImage();        // Canva/Cloudinary
  await schedulePost(content, image);         // Postiz API
}

// functions/code-review-bot/index.ts
export async function codeReviewBot(context: Context): Promise<void> {
  const pr = context.req.body;               // GitHub webhook
  const review = await reviewCode(pr);        // Claude API
  await postReview(review);                   // GitHub API
  await notifySlack(review);                  // Slack MCP
}
```

**Timer Triggers:**
```
- Günlük 00:00: Yedekleme (Supabase → Azure Blob)
- Günlük 08:00: Haber özeti (Perplexity → Slack)
- Haftalık Pazartesi 09:00: Rapor (Claude → Slack + Monday)
- Her PR: Kod review (Claude → GitHub)
- Her deploy: QA check (Lighthouse → Slack)
```

### 9.2 Google Apps Script Otomasyonları

```javascript
// Google Sheets → Supabase sync
function syncSheetsToSupabase() {
  const data = SpreadsheetApp.getActiveSheet().getDataRange().getValues();
  const response = UrlFetchApp.fetch(SUPABASE_URL + '/rest/v1/data', {
    method: 'POST',
    headers: { Authorization: 'Bearer ' + SUPABASE_KEY },
    payload: JSON.stringify(data)
  });
}

// Gmail → Monday.com görev
function gmailToMonday() {
  const threads = GmailApp.search('label:support is:unread');
  threads.forEach(thread => {
    createMondayTask(thread.getFirstMessageSubject());
    thread.markRead();
  });
}

// Google Forms → Kullanıcı kaydı
function formToUserRegistration(e) {
  const data = e.values;
  registerUserInMutluet(data);
  sendWelcomeEmail(data[1]); // email field
}
```

---

## BÖLÜM 10: DEVMASTER — DATABASE ŞEMASI GENİŞLEMESİ (Hafta 4)

Supabase'de yeni tablolar (Prisma migration):

```prisma
// DevMaster modelleri

model DevProject {
  id           String   @id @default(cuid())
  name         String
  platform     String   // vercel, azure, railway, appstore, playstore
  status       String   // active, paused, archived
  deployUrl    String?
  repoUrl      String?
  userId       String
  user         User     @relation(fields: [userId], references: [id])
  createdAt    DateTime @default(now())
  deployments  Deployment[]
}

model Deployment {
  id          String    @id @default(cuid())
  projectId   String
  project     DevProject @relation(fields: [projectId], references: [id])
  platform    String
  status      String    // pending, success, failed
  version     String?
  deployedAt  DateTime  @default(now())
  logs        String?
}

model SocialPost {
  id          String   @id @default(cuid())
  content     String
  platforms   String[] // instagram, tiktok, twitter, etc.
  mediaUrl    String?
  scheduledAt DateTime?
  publishedAt DateTime?
  status      String   // draft, scheduled, published, failed
  postizId    String?  // Postiz platform ID
  analytics   Json?
  userId      String
  user        User     @relation(fields: [userId], references: [id])
  createdAt   DateTime @default(now())
}

model AIUsage {
  id        String   @id @default(cuid())
  model     String   // claude, gpt4, gemini, perplexity
  tokens    Int
  cost      Float
  purpose   String
  userId    String
  user      User     @relation(fields: [userId], references: [id])
  createdAt DateTime @default(now())
}

model AutomationLog {
  id        String   @id @default(cuid())
  type      String   // azure-function, appscript, webhook
  name      String
  status    String   // success, failed
  output    String?
  error     String?
  triggeredAt DateTime @default(now())
}
```

---

## BÖLÜM 11: DEVMASTER — PROJE YAPISI (Hafta 4-5)

```
/devmaster/                  (yeni repo veya Mutluet monorepo içinde)
├── apps/
│   ├── web/                 # Next.js 14 App
│   │   ├── app/
│   │   │   ├── (dashboard)/ # Ana dashboard
│   │   │   ├── ai-orchestra/ # AI yönetim
│   │   │   ├── deploy/      # Deploy yönetim
│   │   │   ├── social/      # Sosyal medya
│   │   │   ├── automation/  # Otomasyon
│   │   │   ├── design/      # Tasarım araçları
│   │   │   └── settings/    # Ayarlar
│   │   └── components/
│   │
│   ├── mobile/              # React Native veya Swift/Kotlin
│   │   ├── ios/             # Xcode projesi
│   │   └── android/         # Android Studio projesi
│   │
│   └── api/                 # Mutluet backend ile paylaşımlı
│
├── packages/
│   ├── ai-sdk/              # Ortak AI client wrapper
│   ├── social-sdk/          # Postiz + platform SDK'ları
│   ├── deploy-sdk/          # Deploy platform SDK'ları
│   └── ui/                  # Ortak UI bileşenleri
│
├── functions/               # Azure Functions
│   ├── weekly-report/
│   ├── social-auto-post/
│   ├── code-review-bot/
│   ├── backup-db/
│   └── send-notifications/
│
├── automations/             # Google Apps Script
│   ├── sheets-sync.gs
│   ├── gmail-tasks.gs
│   ├── form-handler.gs
│   └── calendar-sync.gs
│
├── fastlane/                # Mobile deploy
│   ├── Fastfile
│   ├── Appfile
│   └── Matchfile
│
└── skills/                  # Claude Code skills
    ├── devmaster-core/
    ├── ai-orchestra/
    └── ...
```

---

## BÖLÜM 12: UYGULAMA TAKVİMİ

```
HAFTA 1: Mutluet Acil Düzeltmeler
├── ✅ Supabase credentials
├── ✅ JWT secret
├── ✅ TypeScript setup
├── 🔲 Prisma schema (AZURE + profileImage)
├── 🔲 Missing npm packages
├── 🔲 wordpress.ts auth fix
└── 🔲 oauth.ts type errors

HAFTA 2: Mutluet Servis Yapılandırması
├── 🔲 Google OAuth
├── 🔲 Facebook OAuth
├── 🔲 Stripe entegrasyonu
├── 🔲 SendGrid e-posta
├── 🔲 Cloudinary medya
└── 🔲 Azure Communication Services

HAFTA 3: Mutluet Tamamlama + DevMaster Planlama
├── 🔲 iOS Xcode projesi (omer/) güncelle
├── 🔲 Push notification
├── 🔲 DevMaster repo/klasör oluştur
├── 🔲 Genişletilmiş MCP konfigürasyonu
└── 🔲 Yeni CLAUDE.md kuralları

HAFTA 4-5: DevMaster Temel Altyapı
├── 🔲 Next.js proje kurulumu
├── 🔲 Supabase DevMaster şema migration
├── 🔲 Auth (Supabase Auth)
├── 🔲 AI Orkestra modülü (Claude + ChatGPT + Gemini)
└── 🔲 Deploy Maestro modülü (Vercel + Azure)

HAFTA 5-6: DevMaster Sosyal & İçerik
├── 🔲 Postiz entegrasyonu
├── 🔲 Sosyal medya dashboard
├── 🔲 İçerik üretim pipeline
├── 🔲 Video workflow
└── 🔲 Figma/Canva entegrasyonu

HAFTA 6-7: DevMaster Otomasyon
├── 🔲 Azure Functions kurulum
├── 🔲 Google Apps Script bağlantıları
├── 🔲 Webhook yönetimi
└── 🔲 Otomatik raporlama

HAFTA 7-8: DevMaster Mobil
├── 🔲 Fastlane yapılandırması
├── 🔲 iOS beta deployment
├── 🔲 Android deployment
└── 🔲 App Store / Play Store

HAFTA 8-9: Agency Agents
├── 🔲 Research Agent
├── 🔲 Content Agent
├── 🔲 Deploy Agent
├── 🔲 Monitor Agent
└── 🔲 Report Agent

HAFTA 9-10: Test & Launch
├── 🔲 End-to-end testler
├── 🔲 Performans optimizasyonu
├── 🔲 Güvenlik taraması
├── 🔲 DevMaster public beta
└── 🔲 Mutluet + DevMaster tam entegrasyon
```

---

## BÖLÜM 13: ÇEVRE DEĞİŞKENLERİ ŞABLONU (Tümleşik)

### Mutluet Frontend (.env)
```env
# Supabase ✅ AYARLI
VITE_SUPABASE_URL=https://xuqbxbhgkoivqdqblbeq.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...

# API
VITE_API_URL=http://localhost:3001/api

# OAuth (Frontend)
VITE_GOOGLE_CLIENT_ID=
VITE_FACEBOOK_APP_ID=

# Maps
VITE_GOOGLE_MAPS_API_KEY=

# Stripe
VITE_STRIPE_PUBLISHABLE_KEY=

# Monitoring
VITE_SENTRY_DSN=
```

### Mutluet Backend (backend/.env)
```env
# Supabase ✅ AYARLI
DATABASE_URL=postgresql://...
SUPABASE_URL=https://...
SUPABASE_SERVICE_ROLE_KEY=sb_secret_...
SUPABASE_ANON_KEY=eyJ...

# Auth ✅ AYARLI
JWT_SECRET=...
WORDPRESS_JWT_SECRET=...

# OAuth
GOOGLE_CLIENT_ID=                    🔲
GOOGLE_CLIENT_SECRET=                🔲
FACEBOOK_APP_ID=                     🔲
FACEBOOK_APP_SECRET=                 🔲
TIKTOK_CLIENT_KEY=                   🔲
TIKTOK_CLIENT_SECRET=                🔲
AZURE_AD_CLIENT_ID=                  🔲
AZURE_AD_CLIENT_SECRET=              🔲
AZURE_AD_TENANT_ID=                  🔲

# Payment
STRIPE_SECRET_KEY=                   🔲
STRIPE_WEBHOOK_SECRET=               🔲

# Azure
AZURE_COMMUNICATION_CONNECTION_STRING= 🔲
AZURE_KEY_VAULT_URL=                 🔲
APPLICATIONINSIGHTS_CONNECTION_STRING= 🔲
AZURE_SUBSCRIPTION_ID=               🔲
AZURE_TENANT_ID=                     🔲

# Email
SENDGRID_API_KEY=                    🔲
FROM_EMAIL=noreply@mutluet.com       🔲

# Media
CLOUDINARY_CLOUD_NAME=               🔲
CLOUDINARY_API_KEY=                  🔲
CLOUDINARY_API_SECRET=               🔲
```

### DevMaster Ek Değişkenler (.env.devmaster)
```env
# AI Services
OPENAI_API_KEY=                      🔲
GEMINI_API_KEY=                      🔲
PERPLEXITY_API_KEY=                  🔲
ANTHROPIC_API_KEY=                   🔲

# Social Media
POSTIZ_API_KEY=                      🔲
INSTAGRAM_ACCESS_TOKEN=              🔲
TIKTOK_ACCESS_TOKEN=                 🔲
TWITTER_API_KEY=                     🔲
TWITTER_API_SECRET=                  🔲
LINKEDIN_CLIENT_ID=                  🔲
YOUTUBE_API_KEY=                     🔲

# Design
FIGMA_API_KEY=                       🔲
CANVA_API_KEY=                       🔲

# Deploy
VERCEL_TOKEN=                        🔲
RAILWAY_TOKEN=                       🔲

# Project Management
MONDAY_API_KEY=                      🔲
NOTION_API_KEY=                      🔲
SLACK_BOT_TOKEN=                     🔲
TELEGRAM_BOT_TOKEN=                  🔲

# Mobile
APPLE_TEAM_ID=                       🔲
APPLE_CONNECT_API_KEY=               🔲
GOOGLE_PLAY_JSON_KEY=                🔲

# Media Processing
CLOUDINARY_CLOUD_NAME=               🔲

# Automation
AZURE_FUNCTIONS_KEY=                 🔲
GOOGLE_WORKSPACE_SA_KEY=             🔲
```

---

## ÖZET: ÖNCELİK SIRASI

| Öncelik | Görev | Süre |
|---------|-------|------|
| 🔴 ACIL | Prisma schema fix (AZURE + profileImage) | 1 saat |
| 🔴 ACIL | Backend TS hataları düzelt | 2 saat |
| 🟠 YÜKSEK | Google + Facebook OAuth | 1 gün |
| 🟠 YÜKSEK | Stripe kurulumu | 1 gün |
| 🟡 ORTA | Xcode iOS uygulaması güncelle | 2 gün |
| 🟡 ORTA | DevMaster Next.js kurulumu | 3 gün |
| 🟡 ORTA | AI Orkestra modülü | 2 gün |
| 🟢 NORMAL | Postiz sosyal medya entegrasyonu | 3 gün |
| 🟢 NORMAL | Azure Functions otomasyonu | 3 gün |
| 🟢 NORMAL | Fastlane mobile deployment | 2 gün |
| 🔵 DÜŞÜK | Agency Agents | 5 gün |
| 🔵 DÜŞÜK | Google Apps Script | 2 gün |

**Toplam Tahmin:** ~8-10 hafta (tek geliştirici)
