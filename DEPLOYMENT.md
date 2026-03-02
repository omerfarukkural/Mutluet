# 🚀 MUTLUET DEPLOYMENT REHBERİ

## 🌐 İNTERNETTEN ERİŞİLEBİLİR HALE GETİRME

Şu an uygulama **sadece senin bilgisayarında** (`localhost`) çalışıyor.
İnternetten herkesin erişebilmesi için **deployment** yapmalısın.

---

## 📋 DEPLOYMENT SEÇENEKLERİ

### SEÇENEK 1: VERCEL (ÖNERİLEN - ÜCRETSİZ)

#### Frontend Deployment

**Adımlar:**

1. **Vercel hesabı aç**
   - https://vercel.com'a git
   - "Sign Up" tıkla
   - GitHub hesabınla giriş yap (zaten var)

2. **Proje import et**
   - Dashboard'da "Add New" > "Project" tıkla
   - `omerfarukkural/Mutluet` repository'sini seç
   - "Import" tıkla

3. **Ayarları yap**
   - **Framework Preset:** Vite
   - **Root Directory:** `./` (olduğu gibi bırak)
   - **Build Command:** `pnpm build`
   - **Output Directory:** `dist`

4. **Environment Variables ekle**
   ```
   VITE_API_URL=https://mutluet-backend.vercel.app/api
   ```
   (Backend URL'ini güncelleyeceğiz)

5. **Deploy**
   - "Deploy" butonuna tıkla
   - 2-3 dakika bekle
   - ✅ URL alacaksın: `https://mutluet-abc123.vercel.app`

#### Backend Deployment

**Adımlar:**

1. **Yeni proje oluştur**
   - Vercel dashboard'da "Add New" > "Project"
   - Yine `omerfarukkural/Mutluet` seç
   - "Import" tıkla

2. **Root directory'yi değiştir**
   - **Root Directory:** `backend`
   - **Framework:** Other
   - **Build Command:** `pnpm build`
   - **Output Directory:** `dist`

3. **Environment Variables ekle**
   ```
   DATABASE_URL=<Supabase veya Azure SQL URL>
   JWT_SECRET=<güçlü bir secret key>
   FRONTEND_URL=https://mutluet-abc123.vercel.app
   ```

4. **Deploy et**

**⚠️ NOT:** Backend için **Supabase** veya **Azure SQL** database gerekiyor (localhost çalışmaz).

---

### SEÇENEK 2: AZURE (2000$ KREDİN VAR)

#### Frontend (Azure Static Web Apps)

1. **Azure Portal'a git**
   - https://portal.azure.com
   - Giriş yap

2. **Static Web App oluştur**
   - "Create a resource" tıkla
   - "Static Web Apps" ara
   - "Create" tıkla

3. **Ayarları yap**
   ```
   Resource Group: mutluet-rg (yeni oluştur)
   Name: mutluet-frontend
   Region: West Europe
   Source: GitHub
   Repository: omerfarukkural/Mutluet
   Branch: main
   Build Preset: Vite
   App location: /
   Output location: dist
   ```

4. **Create** tıkla

5. **GitHub Actions otomatik çalışacak**
   - 5-10 dakika bekle
   - URL alacaksın: `https://mutluet-frontend.azurestaticapps.net`

#### Backend (Azure App Service)

1. **Web App oluştur**
   ```
   Resource Group: mutluet-rg
   Name: mutluet-backend
   Publish: Code
   Runtime: Node 22 LTS
   Region: West Europe
   Plan: Free F1
   ```

2. **Create** tıkla

3. **GitHub ile bağla**
   - App Service'i aç
   - "Deployment Center" git
   - Source: GitHub
   - Repository: omerfarukkural/Mutluet
   - Branch: main
   - Build Provider: GitHub Actions
   - **Root folder:** `backend`

4. **Environment Variables ekle**
   - "Configuration" > "Application Settings"
   - Yukarıdaki tüm `.env` değerlerini ekle

#### Database (Azure SQL veya Supabase)

**Azure SQL:**
```
Resource Group: mutluet-rg
Database name: mutluet-db
Server: mutluet-sql-server
Region: West Europe
Compute + storage: Basic (2 GB)
```

**Supabase (Daha Kolay):**
1. https://supabase.com'a git
2. "New Project" oluştur
3. PostgreSQL connection string'i kopyala
4. Backend environment variables'a ekle

---

### SEÇENEK 3: NETLIFY (Frontend Only)

1. https://netlify.com'a git
2. GitHub ile giriş yap
3. "Add new site" > "Import an existing project"
4. `omerfarukkural/Mutluet` seç
5. Ayarlar:
   ```
   Build command: pnpm build
   Publish directory: dist
   ```
6. Deploy et

---

## 🗄️ DATABASE MIGRATION

Deployment sonrası database'i migrate etmen gerekiyor:

### Vercel Postgres kullanıyorsan:
```bash
# Local'den production'a migrate
DATABASE_URL="<production-url>" npx prisma migrate deploy
```

### Supabase kullanıyorsan:
```bash
# Supabase URL'ini .env'e ekle
DATABASE_URL="postgresql://..." npx prisma migrate deploy
```

---

## 🔗 DOMAIN BAĞLAMAK (bitebimuv.org)

### Vercel'de:
1. Vercel dashboard'da projeyi aç
2. "Settings" > "Domains"
3. "Add Domain" tıkla
4. `mutluet.bitebimuv.org` yaz
5. DNS kayıtlarını kopyala
6. Turhost'a git (bitebimuv.org host'u)
7. DNS ayarlarına şu kaydı ekle:
   ```
   Type: CNAME
   Name: mutluet
   Value: cname.vercel-dns.com
   ```
8. 10-20 dakika bekle
9. ✅ `https://mutluet.bitebimuv.org` hazır!

### Azure'de:
1. Static Web App'i aç
2. "Custom domains" > "Add"
3. `mutluet.bitebimuv.org` gir
4. DNS kayıtlarını Turhost'a ekle

---

## ✅ DEPLOYMENT CHECKLIST

### Deploy Öncesi:
- [ ] `.env` dosyaları `.gitignore`'da (✅ zaten var)
- [ ] Production URL'leri güncelle
- [ ] API keys hazır (Google, Facebook, Stripe)
- [ ] Database hazır (Supabase veya Azure SQL)

### Deploy Sonrası:
- [ ] Frontend erişilebilir mi?
- [ ] Backend health check çalışıyor mu?
- [ ] Database bağlantısı var mı?
- [ ] Login çalışıyor mu?
- [ ] HTTPS aktif mi?

---

## 💰 MALİYET TAHMİNİ

### Vercel (Frontend):
- **Hobby Plan:** ÜCRETSİZ
- **Pro Plan:** $20/ay (gerekirse)

### Backend:
- **Vercel Functions:** Ücretsiz tier: 100GB-saat/ay
- **Azure App Service:** F1 tier: ÜCRETSİZ (senin 2000$ kredin var)

### Database:
- **Supabase:** 500MB ÜCRETSİZ
- **Azure SQL:** Basic tier: ~$5/ay (kredin var)
- **Vercel Postgres:** 256MB ÜCRETSİZ

### Domain:
- `bitebimuv.org` zaten var ✅

**TOPLAM:** İLK 1 YIL ÜCRETSİZ (Azure kredin sayesinde)

---

## 🚀 HIZLI DEPLOY (BENİM İÇİN)

Azure $2000 kredin olduğu için **AZURE** öneriyorum:

### Şimdi Yapman Gerekenler:

1. **Azure Portal'a giriş yap:** https://portal.azure.com

2. **Static Web App oluştur** (yukarıdaki adımlarla)

3. **Bana Azure SQL connection string ver** (ben migration yapacağım)

4. **Ben geri kalan her şeyi hallederim!**

---

## 📞 DESTEK

Herhangi bir sorun olursa:
1. GitHub Issues: https://github.com/omerfarukkural/Mutluet/issues
2. Vercel Support: https://vercel.com/support
3. Azure Support: https://portal.azure.com (sağ üstten)

---

**SON NOT:** Deployment karmaşık görünebilir ama **Vercel en kolay seçenek**.
2-3 tıklama ile deploy edebilirsin!

Ben adım adım yardımcı olabilirim 🚀
