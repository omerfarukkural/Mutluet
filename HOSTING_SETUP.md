# Mutluet — Production Hosting Kurulum Rehberi

## Mimari

```
GitHub Repo
    │ push to main
    ├──────────────────────────────────────┐
    │                                      │
    ▼                                      ▼
GitHub Actions CI             GitHub Actions Deploy
(build + check)                     │
                         ┌──────────┴──────────┐
                         ▼                     ▼
                      Vercel            DigitalOcean
                    (Frontend)        App Platform
                         │           (Backend API)
                         │                 │
                    Cloudflare DNS         │
                   mutluet.org  ◄──────────┘
                   mutluet.com        │
                                      ▼
                                  Supabase
                               (PostgreSQL DB)
```

## GitHub Education Pack Aktivasyonu

1. https://education.github.com/pack adresine git
2. "Get Student Benefits" → öğrenci/eğitimci doğrula
3. Aşağıdaki servisleri aktifleştir:

| Servis | Benefit | Bağlantı |
|--------|---------|---------|
| DigitalOcean | $200 kredi | digitalocean.com/github-students |
| MongoDB Atlas | $50 kredi* | mongodb.com/students |
| Namecheap | Ücretsiz .me domain | namecheap.com/github-students |
| Vercel | Pro plan ücretsiz | vercel.com/github-students |

> *Şu an Supabase PostgreSQL kullanıyoruz (ücretsiz, migration gerektirmez).
> MongoDB Atlas'a geçmek istersen Prisma provider'ını değiştirmek gerekir.

---

## 1. Supabase (Veritabanı)

**Ücretsiz tier: 500 MB, 50K aktif kullanıcı/ay**

1. https://supabase.com → "New Project" → `mutluet`
2. Region: **Europe West** (Frankfurt — Türkiye'ye yakın)
3. Database Password: Güçlü bir şifre belirle
4. Settings → Database → **Connection string (URI)** kopyala:
   ```
   postgresql://postgres.[ref]:[password]@aws-0-eu-central-1.pooler.supabase.com:6543/postgres
   ```
5. Bu URL'i `DATABASE_URL` olarak kaydet

**İlk migration çalıştır:**
```bash
cd backend
DATABASE_URL="supabase_url_buraya" pnpm exec prisma migrate deploy
DATABASE_URL="supabase_url_buraya" pnpm exec tsx prisma/seed.ts
```

---

## 2. Vercel (Frontend)

**Ücretsiz (veya Education Pro)**

1. https://vercel.com → "New Project" → GitHub repo bağla: `omerfarukkural/Mutluet`
2. Framework: **Vite**
3. Root Directory: `/` (kök dizin)
4. Build Command: `pnpm install && pnpm run build`
5. Output Dir: `dist`

**Environment Variables:**
```
VITE_API_URL          = https://api.mutluet.org/api
VITE_SOCKET_URL       = https://api.mutluet.org
VITE_GOOGLE_CLIENT_ID = (Google Console'dan)
VITE_SENTRY_DSN       = (Sentry'den, opsiyonel)
VITE_JITSI_DOMAIN     = meet.jit.si
VITE_ENV              = production
```

6. Deploy et → URL al: `https://mutluet.vercel.app`

**GitHub Actions secrets için:**
- Settings → Tokens → Create token
- `VERCEL_TOKEN` olarak GitHub Secrets'a ekle
- Proje ID için: `vercel env pull` komutu veya dashboard'dan al
- `VERCEL_ORG_ID` ve `VERCEL_PROJECT_ID` olarak ekle

---

## 3. DigitalOcean App Platform (Backend)

**$200 Education kredisi ile ~3 yıl ücretsiz ($5/ay plan)**

1. https://cloud.digitalocean.com → "Create App"
2. Source: **GitHub** → `omerfarukkural/Mutluet`
3. Branch: `main`
4. Source Directory: `/backend`
5. Build Command:
   ```
   npm install -g pnpm && pnpm install --frozen-lockfile && pnpm exec prisma generate && pnpm build
   ```
6. Run Command: `node dist/index.js`
7. HTTP Port: `3001`
8. Plan: **Basic** → `apps-s-1vcpu-0.5gb` ($5/ay)
9. Region: **AMS** (Amsterdam)

**Environment Variables (App Platform → Settings → App-Level Env Vars):**
```
NODE_ENV              = production
PORT                  = 3001
DATABASE_URL          = [Supabase connection string]  ← SECRET
JWT_SECRET            = [güçlü rastgele string]       ← SECRET
FRONTEND_URL          = https://mutluet.vercel.app,https://mutluet.org
WORDPRESS_URL         = https://mutluet.org
FROM_EMAIL            = noreply@mutluet.org
SMTP_HOST             = smtp.gmail.com
SMTP_PORT             = 587
SMTP_USER             = [gmail adresin]               ← SECRET
SMTP_PASS             = [Gmail uygulama şifresi]      ← SECRET
STRIPE_SECRET_KEY     = [Stripe key]                  ← SECRET (opsiyonel)
CLOUDINARY_CLOUD_NAME = [Cloudinary]                  ← SECRET (opsiyonel)
CLOUDINARY_API_KEY    = [Cloudinary]                  ← SECRET (opsiyonel)
CLOUDINARY_API_SECRET = [Cloudinary]                  ← SECRET (opsiyonel)
SENTRY_DSN            = [Sentry DSN]                  ← SECRET (opsiyonel)
```

10. Deploy et → URL al: `https://mutluet-api-xxxxx.ondigitalocean.app`
11. App ID'yi al (dashboard URL'den): GitHub Secret olarak `DO_APP_ID` ekle

**GitHub Actions secret:**
- API Token: digitalocean.com → API → Generate Token (read+write)
- `DIGITALOCEAN_ACCESS_TOKEN` olarak GitHub Secrets'a ekle

---

## 4. Cloudflare DNS

**Tamamen ücretsiz**

1. https://cloudflare.com → "Add Site" → domain adını gir
2. Nameserver'ları domain registrar'a (Namecheap vs.) ekle
3. DNS Records:

| Type | Name | Value |
|------|------|-------|
| CNAME | @ (veya www) | `cname.vercel-dns.com` |
| CNAME | api | `mutluet-api-xxxxx.ondigitalocean.app` |
| TXT | @ | SPF/DKIM kayıtları (email için) |

4. SSL/TLS: **Full (strict)** seç
5. Page Rules: `www.mutluet.org → mutluet.org` redirect

---

## 5. GitHub Actions Secrets Listesi

GitHub → Settings → Secrets and Variables → Actions:

```
# Vercel
VERCEL_TOKEN          = vercel api token
VERCEL_ORG_ID         = vercel org/user id
VERCEL_PROJECT_ID     = vercel project id

# DigitalOcean
DIGITALOCEAN_ACCESS_TOKEN = do api token
DO_APP_ID             = do app platform app id

# Database
DATABASE_URL          = supabase postgresql url

# Backend secrets (also set in DO App Platform)
JWT_SECRET            = güçlü random string
WORDPRESS_JWT_SECRET  = wordpress sso secret
SMTP_USER             = gmail adresi
SMTP_PASS             = gmail uygulama şifresi
STRIPE_SECRET_KEY     = stripe key (opsiyonel)
CLOUDINARY_CLOUD_NAME = (opsiyonel)
CLOUDINARY_API_KEY    = (opsiyonel)
CLOUDINARY_API_SECRET = (opsiyonel)
SENTRY_DSN            = (opsiyonel)

# Frontend env (Vercel'e de ekle)
VITE_API_URL          = https://api.mutluet.org/api
VITE_SOCKET_URL       = https://api.mutluet.org
VITE_GOOGLE_CLIENT_ID = (opsiyonel)
VITE_SENTRY_DSN       = (opsiyonel)
```

---

## 6. Gmail Uygulama Şifresi (SMTP)

1. Google Hesabın → Güvenlik → **2 Adımlı Doğrulama** aç
2. Güvenlik → **Uygulama şifreleri**
3. Uygulama: "Diğer" → İsim: "Mutluet"
4. Oluşturulan 16 haneli şifreyi `SMTP_PASS` olarak kullan

---

## 7. Sentry (Opsiyonel, ücretsiz 5K hata/ay)

1. https://sentry.io → New Project → **Node.js** → `mutluet-backend`
2. New Project → **React** → `mutluet-frontend`
3. DSN'leri kopyala → GitHub Secrets'a ekle

---

## Deployment Akışı

```
git push origin main
       │
       ├─► GitHub Actions CI (build check) ─────── 2 dk
       │
       └─► GitHub Actions Deploy
              │
              ├─► Vercel (frontend) ─────────────── 1-2 dk
              │
              ├─► DigitalOcean (backend) ─────────── 3-5 dk
              │
              └─► Prisma migrate deploy ─────────── 30 sn
```

---

## Tahmini Maliyet

| Servis | Plan | Maliyet |
|--------|------|---------|
| Vercel | Free / Education Pro | **$0** |
| DigitalOcean | $5/ay (Education kredi) | **$0** (200$ kredi = ~3 yıl) |
| Supabase | Free tier (500MB) | **$0** |
| Cloudflare | Free | **$0** |
| GitHub Actions | Free (public repo) | **$0** |
| Gmail SMTP | Free (500/gün) | **$0** |
| Sentry | Free (5K/ay) | **$0** |
| **Toplam** | | **$0/ay** |

