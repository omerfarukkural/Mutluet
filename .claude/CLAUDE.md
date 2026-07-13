# MUTLUET — CLAUDE CODE TALİMATLARI

## Proje Özeti
Mutluet (İyilik Fabrikası), sosyal yardım ve gönüllülük NGO platformudur. Kullanıcılar gönüllü olabilir, bağış yapabilir, etkinliklere katılabilir ve toplulukla iletişim kurabilir.

## Tech Stack
- **Frontend**: React 18 + Vite 6 + TailwindCSS 4 + Radix UI + TypeScript 5.7
- **Backend**: Node.js 22 + Express + Prisma ORM 5.22 + TypeScript 5.7
- **Database**: PostgreSQL 16 (Supabase cloud)
- **Auth**: JWT + OAuth 2.0 (Google, Facebook, TikTok, Azure AD)
- **Realtime**: Socket.IO
- **Deploy**: Azure Static Web Apps (FE) + Azure App Service (BE)
- **Alternatif Deploy**: Vercel (FE) + Railway/Render (BE)
- **Payment**: Stripe
- **Video**: Azure Communication Services

## Geliştirme Kuralları
1. Tüm değişken ve fonksiyon adları İngilizce olmalı
2. UI metinleri ve kod yorumları Türkçe olabilir
3. Her commit mesajı Türkçe yazılmalı
4. Gizli anahtarlar asla kaynak koda yazılmaz — .env veya Azure Key Vault kullanılır
5. TypeScript strict mode aktif — `any` kullanımı yasak
6. Her yeni API endpoint için Prisma şeması güncel tutulmalı
7. Bileşenler Radix UI tabanlı, TailwindCSS ile stillendirilmeli

## Geliştirme Komutları
```bash
# Frontend başlat
pnpm dev                           # port 5173

# Backend başlat
cd backend && pnpm dev             # port 3001

# Prisma işlemleri
cd backend && npx prisma studio    # DB görsel arayüz
cd backend && npx prisma migrate dev --name [ad]  # migration
cd backend && npx prisma db push   # schema güncelle
cd backend && npx prisma generate  # client güncelle

# Build
pnpm build                         # Frontend build
cd backend && pnpm build           # Backend build

# Test
pnpm test                          # Frontend testler
cd backend && pnpm test            # Backend testler
```

## Klasör Yapısı
```
/
├── src/                    # React frontend
│   ├── app/components/     # Özellik bileşenleri
│   ├── contexts/           # React context'leri
│   ├── lib/                # Yardımcı kütüphaneler
│   └── types/              # TypeScript tipleri
├── backend/src/            # Express backend
│   ├── config/             # Yapılandırma (Azure, DB, izleme)
│   ├── routes/             # API endpoint'leri
│   ├── middleware/         # Express middleware'leri
│   └── services/           # İş mantığı servisleri
├── backend/prisma/         # Veritabanı şeması ve migration'lar
├── .github/workflows/      # CI/CD pipeline'ları
├── skills/                 # Claude Code skill dosyaları
└── scripts/                # Yardımcı scriptler
```

## MCP Sunucuları (Aktif)
| Sunucu | Kullanım |
|--------|---------|
| `github` | Repo işlemleri, PR'lar, issue'lar |
| `supabase` | Tablo sorgulama, SQL çalıştırma |
| `postgres` | Doğrudan DB sorguları |
| `slack` | Kanal mesajları, bildirimler |
| `notion` | Sayfa ve veritabanı işlemleri |
| `google-maps` | Harita ve konum işlemleri |
| `fetch` | HTTP istekleri |
| `filesystem` | Dosya sistemi işlemleri |
| `sequential-thinking` | Karmaşık problem çözme |

## Platform Skill'leri
Aşağıdaki skill'ler `/skills/` klasöründe tanımlıdır:
- `azure-deploy` — Azure'a deployment
- `supabase-ops` — Supabase/Prisma işlemleri
- `vercel-deploy` — Vercel deployment
- `slack-notify` — Slack bildirimleri
- `whatsapp-business` — WhatsApp Business API
- `telegram-bot` — Telegram Bot API
- `google-workspace` — Google Sheets/Drive/Gmail
- `figma-ops` — Figma tasarım assetleri
- `monday-tasks` — Monday.com görev yönetimi
- `notion-sync` — Notion senkronizasyonu
- `social-media` — Instagram/Facebook/X/LinkedIn/YouTube
- `ai-services` — OpenAI/Gemini/Perplexity/Ollama/Claude
- `twilio-comm` — Twilio SMS/Ses/WhatsApp

## Ortam Değişkenleri
Tüm gerekli değişkenler:
- Frontend: `.env` (VITE_ önekiyle)
- Backend: `backend/.env`
- Şablon: `.env.example` ve `backend/.env.example`
- Güvenli saklama: Azure Key Vault (`backend/src/config/azure-secrets.ts`)

## Dağıtım
- **Prod Frontend**: Azure Static Web Apps → `main` branch push
- **Prod Backend**: Azure App Service → Docker container push
- **Staging**: Vercel preview deployments (PR başına otomatik)
- **CI/CD**: GitHub Actions (`.github/workflows/`)

## Hata Ayıklama
- Hata kayıtları: `backend/src/config/monitoring.ts` (Azure App Insights)
- Prisma sorgu hataları: `backend/.env`'de `DEBUG=prisma*` ekle
- Frontend hataları: `src/components/ErrorBoundary.tsx`
- Splunk izleme: `SPLUNK_HEC_URL` ve `SPLUNK_TOKEN` ayarlandığında aktif

## Güvenlik
- Tüm API rotaları `backend/src/middleware/auth.ts` ile korunuyor
- Rate limiting aktif (express-rate-limit)
- CORS yapılandırması `FRONTEND_URL` ortam değişkenine göre
- Gizli anahtarlar Azure Key Vault'ta şifreli
- SQL injection koruması: Prisma ORM (parametreli sorgular)
- XSS koruması: helmet.js middleware
