# ⚡ Vercel'e Hızlı Deployment Rehberi

## 🎯 Ön Hazırlık (Yapıldı ✅)

- ✅ GitHub repository hazır: `omerfarukkural/Mutluet`
- ✅ Supabase database hazır: `gzeebhkogwmnmefapebo`
- ✅ Admin kullanıcısı oluşturuldu
- ✅ Backend ve Frontend kodları tamamlandı

---

## 🚀 ADIM 1: Vercel Hesabı Oluştur

1. **Vercel'e Git:** https://vercel.com/signup
2. **"Continue with GitHub"** ile giriş yap
3. GitHub hesabınla bağlan ve yetki ver

---

## 🌐 ADIM 2: Frontend Deploy Et

### 2.1 Yeni Proje Oluştur

1. Vercel Dashboard: https://vercel.com/new
2. **"Import Git Repository"** → GitHub'dan **`omerfarukkural/Mutluet`** seç
3. **Import** butonuna tıkla

### 2.2 Frontend Ayarları

**Framework Preset:** Vite
```
Build Command:    pnpm run build
Output Directory: dist
Install Command:  pnpm install
Root Directory:   ./
```

### 2.3 Environment Variables Ekle

**Settings → Environment Variables** bölümünde şunları ekle:

```bash
VITE_API_URL=https://mutluet-backend.vercel.app/api
VITE_SOCKET_URL=https://mutluet-backend.vercel.app
VITE_SUPABASE_URL=https://xuqbxbhgkoivqdqblbeq.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh1cWJ4Ymhna29pdnFkcWJsYmVxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI0OTI4NDgsImV4cCI6MjA4ODA2ODg0OH0.stN_6Da5qvm9mcoPEnXjYgLWaRg16rfS-6pyGFRFdc8
```

⚠️ **ÖNEMLİ:** `VITE_API_URL` şimdilik placeholder. Backend deploy edince güncelleyeceğiz.

### 2.4 Deploy Et!

**"Deploy"** butonuna tıkla ve bekle (1-2 dakika).

✅ **Frontend URL'in:** `https://mutluet-XXXX.vercel.app` (kaydet!)

---

## ⚙️ ADIM 3: Backend Deploy Et

### 3.1 Yeni Proje Oluştur

1. Vercel Dashboard: https://vercel.com/new
2. **Aynı GitHub repo'yu** tekrar seç: `omerfarukkural/Mutluet`
3. **Import** tıkla

### 3.2 Backend Ayarları

**Framework Preset:** Other
```
Build Command:    cd backend && pnpm install
Output Directory: backend
Install Command:  pnpm install
Root Directory:   ./backend
```

### 3.3 Environment Variables Ekle (ZORUNLU!)

```bash
DATABASE_URL=postgresql://postgres.gzeebhkogwmnmefapebo:Antakya_123@aws-1-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true
JWT_SECRET=mutluet-super-secret-jwt-key-2026-change-in-production
NODE_ENV=production
FRONTEND_URL=https://mutluet-XXXX.vercel.app
PORT=3001
```

⚠️ **ÖNEMLİ:** `FRONTEND_URL`'i kendi frontend URL'inle değiştir!

### 3.4 Deploy Et!

**"Deploy"** tıkla (2-3 dakika).

✅ **Backend URL'in:** `https://mutluet-backend-XXXX.vercel.app` (kaydet!)

---

## 🔄 ADIM 4: URL'leri Güncelle

### Frontend'i Güncelle

1. **Frontend Vercel projesine** git
2. **Settings → Environment Variables**
3. `VITE_API_URL` ve `VITE_SOCKET_URL`'i gerçek backend URL'inle değiştir:

```bash
VITE_API_URL=https://mutluet-backend-XXXX.vercel.app/api
VITE_SOCKET_URL=https://mutluet-backend-XXXX.vercel.app
```

4. **Save** → **Deployments** → **Redeploy** (sağ üst menüden)

### Backend'i Güncelle

1. **Backend Vercel projesine** git
2. **Settings → Environment Variables**
3. `FRONTEND_URL`'i gerçek frontend URL'inle değiştir
4. **Redeploy**

---

## ✅ ADIM 5: Test Et!

### Frontend Test

1. **Frontend URL'ini aç:** `https://mutluet-XXXX.vercel.app`
2. Ana sayfa yüklenmeliydi
3. `/login` sayfasına git
4. Admin bilgileriyle giriş yap:
   - Email: `admin@mutluet.org`
   - Şifre: `Antakya_123`

### Backend Test

```bash
curl https://mutluet-backend-XXXX.vercel.app/api/events
```

Boş array `[]` dönmeli.

### Happiness Events Test

1. `/happiness` sayfasını aç
2. Yeni kayıt ekle
3. Supabase'de görünmeli: https://supabase.com/dashboard/project/gzeebhkogwmnmefapebo/editor/17494

---

## 🐛 Sorun Yaşarsan?

### 1. "Internal Server Error" (500)

**Sebep:** Database bağlanamıyor

**Çözüm:**
- Backend Vercel Settings → Environment Variables
- `DATABASE_URL`'i kontrol et
- Supabase şifresi doğru mu?

### 2. CORS Hatası

**Sebep:** Frontend URL backend'de tanımlı değil

**Çözüm:**
- Backend `FRONTEND_URL` environment variable kontrol et
- Redeploy yap

### 3. 404 Not Found (Routes)

**Sebep:** SPA routing sorunu

**Çözüm:** `vercel.json` rewrites zaten var, redeploy yap.

### 4. Environment Variables Görünmüyor

**Çözüm:**
1. Settings'de doğru yazdığından emin ol
2. **Redeploy** yap (Environment değişiklikleri için gerekli!)

---

## 📊 Deployment Sonrası

### URL'lerini Kaydet:

```
Frontend:  https://mutluet-XXXX.vercel.app
Backend:   https://mutluet-backend-XXXX.vercel.app
Admin:     https://mutluet-XXXX.vercel.app/admin
Happiness: https://mutluet-XXXX.vercel.app/happiness
Supabase:  https://supabase.com/dashboard/project/gzeebhkogwmnmefapebo
```

### Custom Domain Ekle (Opsiyonel)

1. Vercel project → **Settings** → **Domains**
2. Domain ekle (örn: `mutluet.com`)
3. DNS kayıtlarını güncelle (Vercel gösterecek)

---

## 🎉 Tebrikler!

Uygulamın artık production'da! 🚀

**Faydalı Linkler:**
- Vercel Dashboard: https://vercel.com/dashboard
- Vercel Docs: https://vercel.com/docs
- Supabase Dashboard: https://supabase.com/dashboard
- GitHub Repo: https://github.com/omerfarukkural/Mutluet
