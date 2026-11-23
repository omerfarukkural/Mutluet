# 🔐 DEPLOYMENT & SECRETS KURULUM REHBERİ

Backend'in Vercel'de sorunsuz çalışması ve CI/CD süreçlerinin (GitHub Actions) aktifleşmesi için aşağıdaki adımları takip etmelisiniz.

---

## 1️⃣ GitHub Secrets Ayarları
GitHub Actions workflow'larının çalışması için bu secret'ları eklemelisiniz.

**Nereye:** GitHub Repo > Settings > Secrets and variables > Actions > New repository secret

| Secret Name | Örnek Değer / Açıklama |
|-------------|-----------------------|
| `DATABASE_URL` | `postgresql://postgres:şifre@db.host.supabase.co:5432/postgres` |
| `JWT_SECRET` | `openssl rand -hex 32` ile üretilen güçlü bir anahtar |
| `WORDPRESS_JWT_SECRET` | WordPress SSO için güçlü bir anahtar |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase Dashboard > Settings > API > service_role key |
| `GITHUB_TOKEN` | (Admin Panel'den deploy tetiklemek için) Developer Settings > PAT (Classic) |

---

## 2️⃣ Vercel Environment Variables
Backend'in Vercel Functions üzerinde çalışması için bu değişkenleri eklemelisiniz.

**Nereye:** Vercel Dashboard > Mutluet Project > Settings > Environment Variables

| Variable Name | Value |
|---------------|-------|
| `DATABASE_URL` | (Supabase Connection String) |
| `JWT_SECRET` | (GitHub'daki ile aynı olmalı) |
| `WORDPRESS_JWT_SECRET` | (GitHub'daki ile aynı olmalı) |
| `SUPABASE_SERVICE_ROLE_KEY` | (Supabase Service Role Key) |
| `FRONTEND_URL` | `https://mutluet.vercel.app` |
| `NODE_ENV` | `production` |
| `VERCEL` | `1` (Backend kodumuzun Vercel'de olduğunu anlaması için) |

---

## 3️⃣ Vercel Deployment Adımları (Backend)
Backend'i ayrı bir proje olarak Vercel'e eklemek için:

1. **Vercel Dashboard > Add New > Project**
2. **Mutluet** reposunu seçin.
3. **Root Directory:** `backend` olarak seçin.
4. **Framework Preset:** `Other` (veya Node.js).
5. **Build Command:** `pnpm build`
6. **Output Directory:** `dist` (Opsiyonel, Vercel default olarak `/api` veya `vercel.json`'ı kullanacaktır).
7. Yukarıdaki **Environment Variables**'ları ekleyin ve **Deploy**'a basın.

---

## 4️⃣ Frontend Güncelleme
Frontend'in canlı backend ile konuşması için:

1. Vercel'deki **Frontend** projenizin ayarlarına gidin.
2. `VITE_API_URL` değişkenini backend'in Vercel URL'si ile güncelleyin:
   `VITE_API_URL` = `https://mutluet-backend.vercel.app/api`

---
*Hazırlayan: Gemini CLI*
