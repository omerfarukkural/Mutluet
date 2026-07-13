# MUTLUET — PLATFORM ENTEGRASYON REHBERİ

> Bu rehber, Mutluet projesinde kullanılan tüm platform ve servislerin kurulum, entegrasyon ve kullanım kılavuzudur.

---

## İÇİNDEKİLER

1. [Claude Code Kurulumu](#claude-code-kurulumu)
2. [MCP Sunucuları](#mcp-sunucuları)
3. [Platform Skills](#platform-skills)
4. [Faza Planı ve Öncelikler](#faza-planı)
5. [Ortam Değişkenleri](#ortam-değişkenleri)
6. [Deployment Kılavuzu](#deployment)
7. [CI/CD ve Bildirimler](#cicd-ve-bildirimler)
8. [Platform-Özel Kurulumlar](#platform-özel-kurulumlar)
9. [Sorun Giderme](#sorun-giderme)

---

## CLAUDE CODE KURULUMU

### Proje Claude Yapılandırması

Proje kökünde `.claude/` klasörü mevcuttur:

| Dosya | Açıklama |
|-------|---------|
| `.claude/settings.json` | SessionStart hook ve izinler |
| `.claude/CLAUDE.md` | Claude'a proje talimatları |

### Global Claude Yapılandırması

`~/.claude/settings.json` dosyasında:
- **Stop Hook**: Her oturum sonunda git durumu kontrol edilir
- **Permissions**: Skill ve MCP araçlarına otomatik izin

### Skills Kullanımı

Claude'a şu trigger cümleleriyle skill'ler aktifleşir:

```
azure-deploy:        "azure'a deploy et"
supabase-ops:        "veritabanı migration"
vercel-deploy:       "vercel'e deploy et"
slack-notify:        "slack bildir"
whatsapp-business:   "whatsapp gönder"
telegram-bot:        "telegram bildir"
google-workspace:    "google sheets güncelle"
figma-ops:           "figma'dan al"
monday-tasks:        "monday.com görev oluştur"
notion-sync:         "notion'a yaz"
social-media:        "instagram paylaş"
ai-services:         "openai kullan"
twilio-comm:         "twilio sms gönder"
```

---

## MCP SUNUCULARI

Yapılandırma: `.ai/mcp/mcp.json`

### Mevcut MCP Sunucuları

| Sunucu | Paket | Kullanım |
|--------|-------|---------|
| `github` | `@modelcontextprotocol/server-github` | PR, issue, commit işlemleri |
| `supabase` | `@supabase/mcp-server-supabase` | DB sorgu, tablo yönetimi |
| `filesystem` | `@modelcontextprotocol/server-filesystem` | Proje dosya işlemleri |
| `brave-search` | `@modelcontextprotocol/server-brave-search` | Web araması |
| `google-maps` | `@modelcontextprotocol/server-google-maps` | Konum, rota, yer |
| `slack` | `@modelcontextprotocol/server-slack` | Slack mesajları |
| `notion` | `@modelcontextprotocol/server-notion` | Notion sayfa/DB |
| `postgres` | `@modelcontextprotocol/server-postgres` | Doğrudan SQL |
| `fetch` | `@modelcontextprotocol/server-fetch` | HTTP istekleri |
| `sequential-thinking` | `@modelcontextprotocol/server-sequential-thinking` | Karmaşık problem çözme |

### MCP Test
```bash
npx @modelcontextprotocol/inspector npx @modelcontextprotocol/server-github
```

### Gerekli Ortam Değişkenleri (MCP için)
```
GITHUB_TOKEN              # GitHub Personal Access Token
VITE_SUPABASE_URL         # Supabase URL
SUPABASE_SERVICE_ROLE_KEY # Supabase servis anahtarı
BRAVE_API_KEY             # Brave Search API
GOOGLE_MAPS_API_KEY       # Google Maps API
SLACK_BOT_TOKEN           # Slack Bot Token
SLACK_TEAM_ID             # Slack Workspace ID
NOTION_API_KEY            # Notion Integration Token
DATABASE_URL              # PostgreSQL bağlantı URL'si
```

---

## PLATFORM SKILLS

Tüm skill dosyaları `/skills/` klasöründedir.

### Hızlı Başvuru

#### azure-deploy
```bash
# Tetikleme: "azure'a deploy et"
# Gerekli: AZURE_CREDENTIALS, AZURE_RESOURCE_GROUP
bash scripts/deploy-all.sh azure
```

#### supabase-ops
```bash
# Tetikleme: "veritabanı migration"
cd backend && npx prisma migrate dev --name [ad]
cd backend && npx prisma studio
```

#### slack-notify
```bash
# Tetikleme: "slack bildir"
curl -X POST $SLACK_WEBHOOK_URL -d '{"text": "[mesaj]"}'
```

#### social-media
```bash
# Tetikleme: "instagram paylaş", "facebook post", vs.
# Desteklenen: Instagram, Facebook, X, LinkedIn, YouTube, Canva
```

#### ai-services
```bash
# Tetikleme: "openai kullan", "gemini ile yap", vs.
# Desteklenen: Claude, GPT-4o, Gemini, Perplexity, Ollama
```

---

## FAZA PLANI

### FAZA 1 — Temel Altyapı (İlk Gün)

- [ ] **Supabase**: Dashboard > Settings > API → .env dosyasına ekle
- [ ] **Azure**: `az login` → Resource Group + Key Vault oluştur
- [ ] **GitHub Secrets**: Repo > Settings > Secrets > Actions → API key'leri ekle
- [ ] **Vercel**: `vercel login` → Projeyi bağla

**Test:** `bash scripts/health-check.sh`

### FAZA 2 — İletişim (1. Hafta)

- [ ] **Slack**: App oluştur → Webhook URL al → `SLACK_WEBHOOK_URL` ekle
- [ ] **Telegram**: BotFather → Bot oluştur → Token + Chat ID al
- [ ] **Twilio**: Console → SID + Token al → $100 krediyi aktif et
- [ ] **WhatsApp Business**: Meta Business Suite → WhatsApp Cloud API kur

### FAZA 3 — Üretkenlik Araçları (2. Hafta)

- [ ] **Notion**: Integration oluştur → Veritabanına bağla → Token al
- [ ] **Monday.com**: API Token al → Board ID bul
- [ ] **Google Workspace**: Cloud Console → API'ler etkinleştir → OAuth al
- [ ] **Figma**: Account Settings → Personal Access Token oluştur

### FAZA 4 — Sosyal Medya (3. Hafta)

- [ ] **Meta (Instagram + Facebook)**: Developer Portal → App → Graph API Token
- [ ] **X (Twitter)**: Developer Portal → App → Bearer Token
- [ ] **LinkedIn**: Developer Portal → App → OAuth credentials
- [ ] **YouTube**: Cloud Console → YouTube Data API v3 etkinleştir
- [ ] **Canva**: Canva Connect API → Token al

### FAZA 5 — AI & Analitik (4. Hafta)

- [ ] **OpenAI**: platform.openai.com → API Keys → Oluştur
- [ ] **Gemini**: Google AI Studio → API key al
- [ ] **Perplexity**: perplexity.ai → API → Key oluştur
- [ ] **Ollama**: Yerel kurulum → `ollama pull llama3.2`
- [ ] **Splunk**: Cloud setup → HEC Token al

---

## ORTAM DEĞİŞKENLERİ

### GitHub Secrets (Tüm Listesi)

GitHub repo → Settings → Secrets and variables → Actions'a eklenecekler:

```
# Altyapı
AZURE_CREDENTIALS
AZURE_RESOURCE_GROUP
AZURE_STATIC_WEB_APP_NAME
AZURE_WEBAPP_NAME
AZURE_ACR_NAME
AZURE_STATIC_WEB_APPS_API_TOKEN

# Veritabanı
DATABASE_URL
VITE_SUPABASE_URL
SUPABASE_SERVICE_ROLE_KEY

# Bildirim
SLACK_WEBHOOK_URL
SLACK_BOT_TOKEN
TELEGRAM_BOT_TOKEN
TELEGRAM_CHAT_ID
PUSHBULLET_API_KEY

# İletişim
TWILIO_ACCOUNT_SID
TWILIO_AUTH_TOKEN
TWILIO_PHONE_NUMBER
TWILIO_VERIFY_SID
WHATSAPP_TOKEN
WHATSAPP_PHONE_NUMBER_ID

# Sosyal Medya
META_ACCESS_TOKEN
META_PAGE_ID
INSTAGRAM_USER_ID
TWITTER_BEARER_TOKEN
TWITTER_API_KEY
TWITTER_API_SECRET
TWITTER_ACCESS_TOKEN
TWITTER_ACCESS_SECRET
LINKEDIN_ACCESS_TOKEN
LINKEDIN_AUTHOR_URN
YOUTUBE_API_KEY
CANVA_ACCESS_TOKEN

# AI Servisleri
OPENAI_API_KEY
ANTHROPIC_API_KEY
GEMINI_API_KEY
PERPLEXITY_API_KEY

# Tasarım & Proje Yönetimi
FIGMA_TOKEN
FIGMA_FILE_KEY
MONDAY_API_KEY
MONDAY_BOARD_ID
NOTION_API_KEY
NOTION_DB_ID

# Harita
GOOGLE_MAPS_API_KEY

# İzleme
SPLUNK_HEC_URL
SPLUNK_TOKEN
```

---

## DEPLOYMENT

### Azure (Production)

```bash
# Manuel deploy
bash scripts/deploy-all.sh azure

# Otomatik deploy
# main branch'e push → GitHub Actions tetiklenir
```

**Azure kaynakları:**
- Static Web Apps: Frontend
- App Service: Backend API
- Container Registry: Docker images
- Key Vault: Gizli anahtarlar
- Application Insights: İzleme

### Vercel (Alternatif / Staging)

```bash
# Manuel deploy
bash scripts/deploy-all.sh vercel

# PR Staging
# Her PR otomatik preview URL alır
```

### Her İkisi

```bash
bash scripts/deploy-all.sh both
```

---

## CI/CD VE BİLDİRİMLER

### GitHub Actions Workflow'ları

| Dosya | Tetikleyici | Açıklama |
|-------|------------|---------|
| `ci.yml` | Push to main/develop, PR | Build + TypeScript kontrolü |
| `security-scan.yml` | Push to main, Pazartesi 02:00 | Güvenlik taraması |
| `notify.yml` | Deploy workflow'ları tamamlandığında | Slack + Telegram bildirim |
| `deploy-backend.yml` | Push to main | Backend Azure deploy |
| `deploy-frontend.yml` | Push to main | Frontend deploy |

### Bildirim Kanalları

1. **Slack**: `#deploy` kanalına zengin mesaj
2. **Telegram**: Grup/kanala Markdown mesaj
3. **Pushbullet**: Kritik hatalarda tüm cihazlara anlık bildirim

---

## PLATFORM-ÖZEL KURULUMLAR

### Supabase

1. https://supabase.com/dashboard → Proje: "mutluet"
2. Settings > API → URL ve keys kopyala
3. Authentication > Providers → Google, Facebook OAuth etkinleştir
4. Storage → "avatarlar" ve "etkinlik-gorselleri" bucket oluştur
5. Edge Functions → Bildirim fonksiyonları deploy et

### Azure

1. `az login`
2. `az group create --name mutluet-rg --location westeurope`
3. `az keyvault create --name mutluet-vault --resource-group mutluet-rg`
4. `az staticwebapp create --name mutluet-frontend --resource-group mutluet-rg`
5. `az webapp create --name mutluet-backend --resource-group mutluet-rg`
6. Key Vault'a tüm gizli anahtarları ekle:
   ```bash
   az keyvault secret set --vault-name mutluet-vault --name "DATABASE-URL" --value "postgresql://..."
   ```

### Slack App Kurulumu

1. https://api.slack.com/apps → "Create New App" → "From scratch"
2. Ad: "Mutluet Bot", Workspace: Proje workspace'i
3. "Incoming Webhooks" → Etkinleştir → "Add New Webhook to Workspace"
4. `#deploy` kanalını seç → Webhook URL'yi kopyala → `SLACK_WEBHOOK_URL`
5. "OAuth & Permissions" → Scopes: `chat:write`, `channels:read`, `files:write`
6. "Install to Workspace" → Bot Token kopyala → `SLACK_BOT_TOKEN`

### Telegram Bot

1. Telegram'da @BotFather'a `/newbot` gönder
2. Ad: "Mutluet Bildirim Bot", username: "mutluet_bildirim_bot"
3. Token kopyala → `TELEGRAM_BOT_TOKEN`
4. Botu geliştirici grubuna ekle → `/start` mesajı gönder
5. Chat ID: `https://api.telegram.org/bot$TOKEN/getUpdates`
6. `"chat": {"id": -100...}` → `TELEGRAM_CHAT_ID`

### Meta (Instagram + Facebook)

1. https://developers.facebook.com → "My Apps" → "Create App"
2. Tip: "Business" → Ad: "Mutluet Platform"
3. "Add Products" → "WhatsApp" + "Instagram" + "Facebook Login"
4. WhatsApp > API Setup → Phone Number ID → `WHATSAPP_PHONE_NUMBER_ID`
5. Instagram > Basic Display → Instagram User ID → `INSTAGRAM_USER_ID`
6. Settings > Advanced → "Long-lived Access Token" → `META_ACCESS_TOKEN`

### Google Workspace

1. https://console.cloud.google.com → Proje: "mutluet"
2. APIs & Services > Library → Şunları etkinleştir:
   - Google Sheets API
   - Google Drive API
   - Gmail API
   - Google Calendar API
   - Maps JavaScript API
   - Geocoding API
   - Places API
3. APIs & Services > Credentials → OAuth2 Client ID oluştur
4. Scope'lar ekle → Refresh token al

### Figma

1. Figma > Account Settings > Personal Access Tokens
2. "Generate new token" → Ad: "mutluet-dev"
3. `FIGMA_TOKEN` olarak .env'e ekle
4. Figma dosyasının URL'sinden File Key al: `/file/[FILE_KEY]/...`
5. `FIGMA_FILE_KEY` olarak .env'e ekle

---

## SORUN GİDERME

### Genel Kontroller

```bash
# Ortam kurulumunu yenile
bash scripts/setup-env.sh

# Servis durumunu kontrol et
bash scripts/health-check.sh

# Production servisleri kontrol et
bash scripts/health-check.sh --prod
```

### Sık Karşılaşılan Sorunlar

**Prisma bağlantı hatası:**
```bash
# DATABASE_URL'yi kontrol et
cd backend && npx prisma db execute --stdin <<< "SELECT 1"
# Supabase IP allow list kontrolü → Settings > Database > Connection Pooling
```

**TypeScript derleme hatası:**
```bash
npx tsc --noEmit 2>&1 | head -20
cd backend && npx tsc --noEmit 2>&1 | head -20
```

**Azure CLI hatası:**
```bash
az login
az account show
az group list --output table
```

**Slack webhook 403:**
```bash
# Webhook URL'sini yenile
# Slack App > Incoming Webhooks > Add New Webhook
```

**MCP sunucu bağlantı hatası:**
```bash
# Inspector ile test
npx @modelcontextprotocol/inspector npx @modelcontextprotocol/server-github
# Ortam değişkenlerini kontrol et
echo $GITHUB_TOKEN
```

### Log Konumları

| Servis | Log Erişimi |
|--------|------------|
| Azure App Service | `az webapp log tail --name mutluet-backend --resource-group mutluet-rg` |
| Vercel | `vercel logs [url]` |
| Supabase | Dashboard > Logs Explorer |
| GitHub Actions | Repo > Actions > Workflow Run |
| Yerel Backend | `cd backend && pnpm dev` terminali |

---

## KODLAMA STANDARTLARI

### TypeScript
- Strict mode açık (`"strict": true` tsconfig.json)
- `any` kullanımı yasak → `unknown` veya spesifik tip kullan
- Async/await tercih edilir, Promise zincirleri değil

### Güvenlik
- API anahtarları → .env veya Azure Key Vault
- CORS → `FRONTEND_URL` ortam değişkenine göre
- Rate limiting → express-rate-limit
- SQL injection → Prisma ORM (parametreli sorgular)
- XSS → helmet.js middleware

### Commit Mesajları (Türkçe)
```
özellik: yeni gönüllü puanlama sistemi eklendi
düzelt: kullanıcı girişi sonrası yönlendirme hatası
güvenlik: JWT token süresi 7 güne uzatıldı
dokümantasyon: platform entegrasyon rehberi güncellendi
yapılandırma: Vercel deployment ayarları düzenlendi
```

---

*Bu rehber Mutluet projesi için oluşturulmuştur. Güncelleme tarihi: Mart 2026*
