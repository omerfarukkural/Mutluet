# 🎯 KALAN ADIMLAR - ŞİMDİ YAPILACAKLAR

**Tarih:** 6 Mart 2026, 02:35
**Son Commit:** `6d07351` - Tailwind build scripts fix
**Durum:** ✅ Frontend build sorunu çözüldü, şimdi deployment aşamasına geçelim

---

## ✅ TAMAMLANAN İŞLER (Son 10 Dakika)

1. ✅ **Tailwind Build Scripts Sorunu Çözüldü**
   - `package.json`'a `allowedBuildScripts` eklendi
   - Vercel artık Tailwind CSS v4 build edebilecek

2. ✅ **Backend Secret'lar Oluşturuldu**
   ```
   JWT_SECRET=0b19629595089bc1df746adeaed4389e8379d5f1f187883fad88fe6bb3518ed2
   WORDPRESS_JWT_SECRET=c7d8eff6cbc913e4e077c154387a46bd830c7595d1c2a99861b1526cdf65e396
   ```

3. ✅ **Git Push Yapıldı**
   - Commit: `6d07351`
   - Vercel otomatik deployment başladı

---

## 🚀 ŞİMDİ YAPILACAKLAR (SENİN YAPACAKLARIN)

### **ADIM 1: Vercel Deployment İzle** (2 dakika)

**URL:** https://vercel.com/omerfarukkurals-projects/mutluet/deployments

**Beklenecek Çıktı:**
```
✅ Building...
✅ Installing dependencies (pnpm install)
✅ Running build command (vite build)
✅ Deploying to Production
✅ Build completed in ~45s
```

**Eğer hata varsa:**
- Build logs'u screenshot al
- Bana gönder

---

### **ADIM 2: GitHub Secrets Ekle** (10 dakika)

**URL:** https://github.com/omerfarukkural/Mutluet/settings/secrets/actions

**Eklenecek 6 Secret:**

| Secret Name | Value | Nereden? |
|-------------|-------|----------|
| `JWT_SECRET` | `0b19629595089bc1df746adeaed4389e8379d5f1f187883fad88fe6bb3518ed2` | ✅ Yukarıda |
| `WORDPRESS_JWT_SECRET` | `c7d8eff6cbc913e4e077c154387a46bd830c7595d1c2a99861b1526cdf65e396` | ✅ Yukarıda |
| `DATABASE_URL` | `postgresql://postgres:Antakya_123@db.gzeebhkogwmnmefapebo.supabase.co:5432/postgres` | ✅ Backend .env |
| `SUPABASE_SERVICE_ROLE_KEY` | `eyJhbGc...` | 🔴 Supabase'den al |
| `STRIPE_SECRET_KEY` | `sk_test_...` | 🟡 Opsiyonel (Stripe'dan) |
| `GOOGLE_CLIENT_SECRET` | `GOCSPX-...` | 🟡 Opsiyonel (Google'dan) |

#### Supabase Service Role Key Nasıl Alınır?

```
1. https://supabase.com/dashboard/project/xuqbxbhgkoivqdqblbeq
2. Settings → API
3. Project API keys → service_role (gizli!)
4. "Reveal" tıkla
5. Kopyala
```

#### GitHub'a Nasıl Eklenir?

```
1. GitHub Repo → Settings → Secrets and variables → Actions
2. "New repository secret" tıkla
3. Name: SECRET_ADI (büyük harfle)
4. Secret: (değeri yapıştır)
5. "Add secret" tıkla
6. Tekrar et (6 secret için)
```

---

### **ADIM 3: Vercel Environment Variables Ekle** (10 dakika)

**URL:** https://vercel.com/omerfarukkurals-projects/mutluet/settings/environment-variables

**Eklenecek 8 Variable:**

| Variable Name | Value | Environment |
|---------------|-------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://xuqbxbhgkoivqdqblbeq.supabase.co` | Production + Preview + Development |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh1cWJ4Ymhna29pdnFkcWJsYmVxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI0OTI4NDgsImV4cCI6MjA4ODA2ODg0OH0.stN_6Da5qvm9mcoPEnXjYgLWaRg16rfS-6pyGFRFdc8` | Production + Preview + Development |
| `DATABASE_URL` | `postgresql://postgres:Antakya_123@db.gzeebhkogwmnmefapebo.supabase.co:5432/postgres` | Production + Preview + Development |
| `JWT_SECRET` | `0b19629595089bc1df746adeaed4389e8379d5f1f187883fad88fe6bb3518ed2` | Production + Preview + Development |
| `WORDPRESS_JWT_SECRET` | `c7d8eff6cbc913e4e077c154387a46bd830c7595d1c2a99861b1526cdf65e396` | Production + Preview + Development |
| `SUPABASE_SERVICE_ROLE_KEY` | `(Supabase'den)` | Production + Preview + Development |
| `STRIPE_SECRET_KEY` | `(Stripe'dan - opsiyonel)` | Production + Preview + Development |
| `VITE_API_URL` | `https://mutluet-backend.vercel.app/api` | Production + Preview + Development |

**Not:** `VITE_API_URL` şimdilik boş bırak, backend deploy'dan sonra ekleyeceğiz.

#### Vercel'e Nasıl Eklenir?

```
1. Vercel Dashboard → Project (Mutluet) → Settings → Environment Variables
2. "Add New" tıkla
3. Key: VARIABLE_ADI
4. Value: (değeri yapıştır)
5. Environments: ✓ Production ✓ Preview ✓ Development (3'ünü seç)
6. "Save" tıkla
7. Tekrar et (8 variable için)
```

---

### **ADIM 4: Frontend Test** (2 dakika)

**Vercel Environment Variables ekledikten sonra:**

```
1. Vercel Dashboard → Deployments
2. Latest deployment → ⋮ (3 nokta) → "Redeploy"
3. Deployment tamamlanınca:
```

**Test Et:**
```
1. https://mutluet.vercel.app aç
2. F12 Console aç
3. Şunu yaz:
   console.log(import.meta.env.VITE_SUPABASE_URL)

Beklenen: https://xuqbxbhgkoivqdqblbeq.supabase.co
```

---

### **ADIM 5: Backend Deploy (Railway)** (15 dakika)

**Neden Railway?**
- Vercel Functions backend için sınırlı (sadece serverless)
- Railway tam Node.js sunucu ($5/ay, ilk $5 ücretsiz)

#### Railway Setup

**URL:** https://railway.app

```
1. Sign in with GitHub
2. "New Project" tıkla
3. "Deploy from GitHub repo" seç
4. Repository: omerfarukkural/Mutluet
5. "Deploy Now" tıkla
```

#### Railway Ayarları

```
Settings:
- Service Name: mutluet-backend
- Root Directory: backend
- Build Command: pnpm install && pnpm build
- Start Command: node dist/index.js
- Watch Paths: backend/**
```

#### Railway Environment Variables

```
Variables → Raw Editor → Paste:

DATABASE_URL=postgresql://postgres:Antakya_123@db.gzeebhkogwmnmefapebo.supabase.co:5432/postgres
JWT_SECRET=0b19629595089bc1df746adeaed4389e8379d5f1f187883fad88fe6bb3518ed2
WORDPRESS_JWT_SECRET=c7d8eff6cbc913e4e077c154387a46bd830c7595d1c2a99861b1526cdf65e396
SUPABASE_SERVICE_ROLE_KEY=(Supabase'den aldığın key)
FRONTEND_URL=https://mutluet.vercel.app
WORDPRESS_URL=https://mutluet.org
NODE_ENV=production
PORT=3001
```

**Save → Deploy başlayacak**

---

### **ADIM 6: Backend URL'yi Frontend'e Ekle** (2 dakika)

**Railway deployment tamamlandıktan sonra:**

```
1. Railway Dashboard → mutluet-backend → Settings → Domains
2. "Generate Domain" tıkla
3. Domain kopyala: https://mutluet-backend-production-xxxx.up.railway.app
```

**Vercel'e Ekle:**

```
1. Vercel → Settings → Environment Variables
2. VITE_API_URL değişkenini ekle/güncelle:

   Key: VITE_API_URL
   Value: https://mutluet-backend-production-xxxx.up.railway.app/api
   Environments: ✓ Production ✓ Preview ✓ Development

3. Save
4. Deployments → Redeploy
```

---

### **ADIM 7: Test - Production Ready!** (5 dakika)

#### Backend Test

```
1. Browser'da aç: https://mutluet-backend-production-xxxx.up.railway.app/health

Beklenen:
{
  "status": "ok",
  "timestamp": "2026-03-06T..."
}
```

#### Frontend Test

```
1. https://mutluet.vercel.app aç
2. "Kayıt Ol" tıkla
3. Test kullanıcısı oluştur:
   - Email: test@mutluet.org
   - Şifre: Test123!
   - İsim: Test User

4. "Giriş Yap" tıkla
5. Dashboard açılıyor mu? ✅
```

#### Database Test

```
1. https://supabase.com/dashboard/project/xuqbxbhgkoivqdqblbeq
2. Table Editor → users
3. Test kullanıcısı var mı? ✅
```

---

### **ADIM 8: Azure WordPress Sil** (5 dakika)

**Azure Portal:** https://portal.azure.com

```
1. Resource groups → mutluet-prod-rg
2. Şunları sil (checkbox işaretle → Delete):
   ✓ mutluet-org (App Service)
   ✓ ASP-mutluetprodrg-bd6c (App Service Plan)
   ✓ mutluetorg-e199c11f12-wpdbserver (MySQL Flexible Server)
   ✓ mutluetorg-e199c11f12-wpidentity (Managed Identity)

3. "Delete" tıkla
4. Confirm: "delete" yaz
5. Delete
```

**Neden:** Vercel frontend'i host ediyor, WordPress gereksiz.

---

## 📋 KONTROL LİSTESİ

### Secrets Eklendi Mi?

- [ ] `JWT_SECRET` → GitHub Secrets
- [ ] `WORDPRESS_JWT_SECRET` → GitHub Secrets
- [ ] `DATABASE_URL` → GitHub Secrets
- [ ] `SUPABASE_SERVICE_ROLE_KEY` → GitHub Secrets
- [ ] `STRIPE_SECRET_KEY` → GitHub Secrets (opsiyonel)
- [ ] `GOOGLE_CLIENT_SECRET` → GitHub Secrets (opsiyonel)

### Vercel Variables Eklendi Mi?

- [ ] `NEXT_PUBLIC_SUPABASE_URL` → Vercel
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` → Vercel
- [ ] `DATABASE_URL` → Vercel
- [ ] `JWT_SECRET` → Vercel
- [ ] `WORDPRESS_JWT_SECRET` → Vercel
- [ ] `SUPABASE_SERVICE_ROLE_KEY` → Vercel
- [ ] `VITE_API_URL` → Vercel
- [ ] `STRIPE_SECRET_KEY` → Vercel (opsiyonel)

### Backend Deploy

- [ ] Railway project oluşturuldu
- [ ] Environment variables eklendi
- [ ] Deployment başarılı
- [ ] `/health` endpoint test edildi

### Frontend

- [ ] Vercel deployment başarılı
- [ ] `VITE_API_URL` eklendi
- [ ] Redeploy yapıldı
- [ ] Login/register test edildi

### Temizlik

- [ ] Azure WordPress silindi
- [ ] Gereksiz kaynaklar temizlendi

---

## 🎯 SIRA ÖZETİ

**TOPLAM SÜRE:** 50 dakika

| # | Adım | Süre | Kümülatif |
|---|------|------|-----------|
| 1 | Vercel deployment izle | 2 dk | 2 dk |
| 2 | GitHub Secrets ekle | 10 dk | 12 dk |
| 3 | Vercel Variables ekle | 10 dk | 22 dk |
| 4 | Frontend test | 2 dk | 24 dk |
| 5 | Railway backend deploy | 15 dk | 39 dk |
| 6 | Backend URL frontend'e ekle | 2 dk | 41 dk |
| 7 | Test - Production ready | 5 dk | 46 dk |
| 8 | Azure WordPress sil | 5 dk | **51 dk** |

---

## 💰 PRODUCTION MALİYET

| Servis | Aylık |
|--------|-------|
| Vercel (Frontend) | $0 (Hobby) |
| Railway (Backend) | $5 (ilk $5 ücretsiz) |
| Supabase (Database) | $0 (Free tier) |
| **TOPLAM** | **$5/ay** ✅ |

**İlk ay:** $0 (Railway credit)
**Sonraki aylar:** $5/ay

---

## 🆘 SORUN YAŞARSAN

### Vercel Build Hatası
```
Build logs → Screenshot al → Bana gönder
```

### Railway Deployment Hatası
```
Deployment logs → Screenshot al → Bana gönder
```

### Frontend Açılmıyor
```
F12 Console → Hata mesajı → Screenshot al
```

### Backend API Çalışmıyor
```
Railway logs → Screenshot al → Bana gönder
```

---

## 🎉 BAŞARI SONRASI

**Production URL'ler:**
- ✅ Frontend: https://mutluet.vercel.app
- ✅ Backend: https://mutluet-backend-production-xxxx.up.railway.app
- ✅ Database: Supabase Dashboard

**Monitoring:**
- Vercel Analytics (otomatik)
- Railway Metrics (CPU, Memory, Network)
- Supabase Logs

**Sonraki Adımlar:**
1. Custom domain bağla (mutluet.org)
2. SSL sertifikası (otomatik - Vercel/Railway)
3. Google OAuth ekle
4. Stripe bağış sistemi aktif et
5. Production monitoring (Sentry)

---

**ŞİMDİ YAP:**

1. ✅ Vercel deployment kontrol et (https://vercel.com/omerfarukkurals-projects/mutluet/deployments)
2. 🔴 GitHub Secrets ekle (6 adet)
3. 🔴 Vercel Variables ekle (8 adet)
4. 🔴 Railway backend deploy et
5. 🔴 Test yap!

**İLK OLARAK VERCEL DEPLOYMENT'I İZLE, SONRA SCREENSHOTS PAYLAŞ!** 🚀
