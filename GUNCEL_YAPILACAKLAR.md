# 🎯 GÜNCEL YAPILACAKLAR LİSTESİ

**Tarih:** 6 Mart 2026
**Durum:** Vercel zaten çalışıyor, Azure WordPress gereksiz
**Hedef:** Production'a hazır hale getir

---

## 📊 MEVCUT DURUM ANALİZİ

### ✅ ÇALIŞAN SİSTEMLER
- **Frontend:** Vercel (`https://mutluet.vercel.app/`) ✅
- **Database:** Supabase ✅
- **Backend:** Lokal geliştirme hazır ✅
- **Git:** GitHub repository aktif ✅

### ❌ EKSİK OLANLAR
- GitHub Secrets (7 adet)
- Vercel Environment Variables (8 adet)
- Backend deployment (Vercel Functions veya Railway)

### 🗑️ SİLİNECEKLER (Azure)
- `mutluet-org` (WordPress App Service)
- `ASP-mutluetprodrg-bd6c` (App Service Plan)
- `mutluetorg-e199c11f12-wpdbserver` (MySQL)
- `mutluetorg-e199c11f12-wpidentity` (Managed Identity)

---

## 🚀 YAPILACAKLAR (SENİN YAPACAKLARIN)

### **1️⃣ SECRET'LARI HAZIRLA** (5 dakika)

#### Oluşturulmuş Secret'lar (Kopyala):

```bash
# JWT Secret (Production)
JWT_SECRET=0b19629595089bc1df746adeaed4389e8379d5f1f187883fad88fe6bb3518ed2

# WordPress JWT Secret
WORDPRESS_JWT_SECRET=c7d8eff6cbc913e4e077c154387a46bd830c7595d1c2a99861b1526cdf65e396

# Backup Secret (gerekirse kullan)
BACKUP_SECRET=48e0a7330546cee9d5958ae03feb754b9d7701b8625fa42d2f815b84d13bda7e
```

#### Supabase'den Al:

1. **Supabase Dashboard:** https://supabase.com/dashboard/project/xuqbxbhgkoivqdqblbeq
2. **Settings → API**

```
SUPABASE_URL=https://xuqbxbhgkoivqdqblbeq.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh1cWJ4Ymhna29pdnFkcWJsYmVxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI0OTI4NDgsImV4cCI6MjA4ODA2ODg0OH0.stN_6Da5qvm9mcoPEnXjYgLWaRg16rfS-6pyGFRFdc8
SUPABASE_SERVICE_ROLE_KEY=(Settings → API → service_role key - gizli!)
```

#### Stripe'dan Al (Opsiyonel):

1. **Stripe Dashboard:** https://dashboard.stripe.com/test/apikeys

```
STRIPE_PUBLIC_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
```

#### Google OAuth (Opsiyonel):

1. **Google Cloud Console:** https://console.cloud.google.com/apis/credentials

```
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-...
```

---

### **2️⃣ GITHUB SECRETS EKLE** (10 dakika)

**URL:** https://github.com/omerfarukkural/Mutluet/settings/secrets/actions

**Eklenecek Secret'lar:**

| Secret Name | Value | Nereden Alındı |
|-------------|-------|----------------|
| `JWT_SECRET` | `0b19629595089bc1df746adeaed4389e8379d5f1f187883fad88fe6bb3518ed2` | ✅ Yukarıda oluşturuldu |
| `WORDPRESS_JWT_SECRET` | `c7d8eff6cbc913e4e077c154387a46bd830c7595d1c2a99861b1526cdf65e396` | ✅ Yukarıda oluşturuldu |
| `SUPABASE_SERVICE_ROLE_KEY` | `eyJhbGc...` (service_role) | Supabase Dashboard → API |
| `DATABASE_URL` | `postgresql://postgres:Antakya_123@db.gzeebhkogwmnmefapebo.supabase.co:5432/postgres` | ✅ Backend .env'den |
| `STRIPE_SECRET_KEY` | `sk_test_...` | Stripe Dashboard (opsiyonel) |
| `GOOGLE_CLIENT_SECRET` | `GOCSPX-...` | Google Console (opsiyonel) |

**Nasıl Ekle:**

```
1. GitHub Repo → Settings → Secrets and variables → Actions
2. "New repository secret" tıkla
3. Name: SECRET_ADI
4. Value: (değeri yapıştır)
5. "Add secret" tıkla
6. Tekrarla (6 secret için)
```

---

### **3️⃣ VERCEL ENVIRONMENT VARIABLES EKLE** (10 dakika)

**URL:** https://vercel.com/omerfarukkural/mutluet/settings/environment-variables

**Eklenecek Variables:**

#### Frontend (Public - `NEXT_PUBLIC_*`)

| Variable Name | Value | Environment |
|---------------|-------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://xuqbxbhgkoivqdqblbeq.supabase.co` | Production, Preview, Development |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` | Production, Preview, Development |

#### Backend (Private - Server-side)

| Variable Name | Value | Environment |
|---------------|-------|-------------|
| `DATABASE_URL` | `postgresql://postgres:Antakya_123@db.gzeebhkogwmnmefapebo.supabase.co:5432/postgres` | Production, Preview, Development |
| `JWT_SECRET` | `0b19629595089bc1df746adeaed4389e8379d5f1f187883fad88fe6bb3518ed2` | Production, Preview, Development |
| `WORDPRESS_JWT_SECRET` | `c7d8eff6cbc913e4e077c154387a46bd830c7595d1c2a99861b1526cdf65e396` | Production, Preview, Development |
| `SUPABASE_SERVICE_ROLE_KEY` | `(service_role key)` | Production, Preview, Development |
| `STRIPE_SECRET_KEY` | `sk_test_...` (opsiyonel) | Production, Preview, Development |
| `GOOGLE_CLIENT_SECRET` | `GOCSPX-...` (opsiyonel) | Production, Preview, Development |

**Nasıl Ekle:**

```
1. Vercel Dashboard → Project (Mutluet) → Settings → Environment Variables
2. "Add New" tıkla
3. Name: VARIABLE_ADI
4. Value: (değeri yapıştır)
5. Environment: "Production, Preview, Development" seç (hepsini işaretle)
6. "Save" tıkla
7. Tekrarla (8 variable için)
```

---

### **4️⃣ AZURE WORDPRESS'İ SİL** (5 dakika)

**Azure Portal:** https://portal.azure.com

```
1. Resource groups → mutluet-prod-rg
2. mutluet-org (App Service) → Delete
3. Confirm: "mutluet-org" yaz
4. Delete

Sonra sil:
5. ASP-mutluetprodrg-bd6c (App Service Plan) → Delete
6. mutluetorg-e199c11f12-wpdbserver (MySQL) → Delete
7. mutluetorg-e199c11f12-wpidentity (Managed Identity) → Delete
```

**Neden:** Vercel frontend'i zaten host ediyor, WordPress'e gerek yok.

---

### **5️⃣ BACKEND DEPLOY (Vercel Functions veya Railway)** (20 dakika)

#### Seçenek A: Vercel Functions (Önerilen - Ücretsiz)

**Vercel Dashboard:**

```
1. New Project → Import Repository
2. Repository: omerfarukkural/Mutluet (backend klasörü)
3. Framework Preset: Other
4. Root Directory: backend
5. Build Command: pnpm build
6. Output Directory: dist
7. Install Command: pnpm install
8. Deploy
```

**Environment Variables Ekle:**
- Yukarıdaki backend değişkenlerini ekle (3. adımdaki gibi)

#### Seçenek B: Railway (Alternatif - $5/ay)

**Railway Dashboard:** https://railway.app

```
1. New Project → Deploy from GitHub repo
2. Select: omerfarukkural/Mutluet
3. Add service → Node.js
4. Settings:
   - Root Directory: backend
   - Build Command: pnpm build
   - Start Command: node dist/index.js
5. Variables → Raw Editor → Paste:

DATABASE_URL=postgresql://postgres:Antakya_123@db.gzeebhkogwmnmefapebo.supabase.co:5432/postgres
JWT_SECRET=0b19629595089bc1df746adeaed4389e8379d5f1f187883fad88fe6bb3518ed2
WORDPRESS_JWT_SECRET=c7d8eff6cbc913e4e077c154387a46bd830c7595d1c2a99861b1526cdf65e396
SUPABASE_SERVICE_ROLE_KEY=(service_role key buraya)
FRONTEND_URL=https://mutluet.vercel.app
NODE_ENV=production
PORT=3001

6. Deploy
```

---

### **6️⃣ FRONTEND'İ GÜNCELLE** (5 dakika)

**Backend URL'sini Vercel'deki frontend'e ekle:**

```
# .env dosyasını güncelle veya Vercel'de ekle:
VITE_API_URL=https://mutluet-backend.vercel.app/api
# veya
VITE_API_URL=https://mutluet-backend.up.railway.app/api
```

**Vercel'de:**

```
Settings → Environment Variables → Add:
- Name: VITE_API_URL
- Value: https://mutluet-backend.vercel.app/api (veya Railway URL)
- Environment: Production, Preview, Development
- Save
```

**Redeploy:**

```
Deployments → Latest → ⋮ (üç nokta) → Redeploy
```

---

### **7️⃣ TEST ET** (5 dakika)

#### Frontend Test

```
1. https://mutluet.vercel.app aç
2. Login sayfası açılıyor mu? ✅
3. Kayıt ol → test kullanıcısı oluştur
4. Giriş yap → dashboard açılıyor mu? ✅
```

#### Backend Test

```
1. https://mutluet-backend.vercel.app/health aç
   (veya Railway URL)

Beklenen:
{
  "status": "ok",
  "timestamp": "2026-03-06T..."
}
```

#### Database Test

```
1. Supabase Dashboard → Table Editor → users
2. Test kullanıcısı var mı? ✅
```

---

## 📋 KONTROL LİSTESİ

### Secrets Eklendi Mi?

- [ ] `JWT_SECRET` → GitHub Secrets
- [ ] `WORDPRESS_JWT_SECRET` → GitHub Secrets
- [ ] `SUPABASE_SERVICE_ROLE_KEY` → GitHub Secrets
- [ ] `DATABASE_URL` → GitHub Secrets
- [ ] `STRIPE_SECRET_KEY` → GitHub Secrets (opsiyonel)
- [ ] `GOOGLE_CLIENT_SECRET` → GitHub Secrets (opsiyonel)

### Vercel Variables Eklendi Mi?

- [ ] `NEXT_PUBLIC_SUPABASE_URL` → Vercel
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` → Vercel
- [ ] `DATABASE_URL` → Vercel
- [ ] `JWT_SECRET` → Vercel
- [ ] `WORDPRESS_JWT_SECRET` → Vercel
- [ ] `SUPABASE_SERVICE_ROLE_KEY` → Vercel
- [ ] `VITE_API_URL` → Vercel (backend URL'si)

### Diğer

- [ ] Azure WordPress silindi
- [ ] Backend deploy edildi (Vercel Functions / Railway)
- [ ] Frontend redeploy edildi
- [ ] Test edildi (login çalışıyor)

---

## 🎯 ÖZET ZAMAN ÇİZELGESİ

| Adım | Süre | Toplam |
|------|------|--------|
| 1. Secret'ları hazırla | 5 dk | 5 dk |
| 2. GitHub Secrets ekle | 10 dk | 15 dk |
| 3. Vercel Variables ekle | 10 dk | 25 dk |
| 4. Azure WordPress sil | 5 dk | 30 dk |
| 5. Backend deploy et | 20 dk | 50 dk |
| 6. Frontend güncelle | 5 dk | 55 dk |
| 7. Test et | 5 dk | **60 dk** |

**TOPLAM:** 1 saat

---

## 💰 MALİYET (Yeni Yapılandırma)

| Servis | Aylık Maliyet |
|--------|---------------|
| Vercel (Frontend) | $0 (Hobby plan) |
| Vercel Functions (Backend) | $0 (Hobby plan - 100GB bandwidth) |
| Supabase | $0 (Free tier - 500MB DB) |
| **TOPLAM** | **$0/ay** ✅ |

**Alternatif (Railway Backend):** $5/ay

---

## 📞 YARDIM GEREKİRSE

### GitHub Secrets Eklerken Hata:
```
- Secret adlarını TAMAMEN büyük harfle yaz
- Value'da boşluk bırakma (başta/sonda)
- Tırnak işareti kullanma
```

### Vercel Variables Eklerken Hata:
```
- Environment'ı doğru seç (3'ü birden işaretle)
- NEXT_PUBLIC_ prefixi olanlar frontend'de görünür (public)
- Diğerleri sadece server-side (private)
```

### Backend Deploy Hata:
```
- package.json'da build script var mı kontrol et
- Node.js version uyumlu mu (18+)
- Environment variables doğru girilmiş mi
```

---

## 🎉 BAŞARI SONRASI

**Production URL'ler:**
- Frontend: https://mutluet.vercel.app
- Backend: https://mutluet-backend.vercel.app (veya Railway)
- Database: Supabase Dashboard

**Monitoring:**
- Vercel Analytics (otomatik)
- Supabase Logs
- Sentry (opsiyonel - hata takibi)

---

**Hazırlayan:** Claude Code
**Güncellenme:** 6 Mart 2026
**Durum:** Production-ready ✅
