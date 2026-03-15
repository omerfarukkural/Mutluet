# 🎯 YAPILACAKLAR - HIZLI BAŞLANGAÇ ÖZETİ

**Soru:** "Yapılacakları nereden alacağım ve nereye ekleyeceğim?"

**Cevap:** Burada bulacaksın! ⬇️

---

## 📂 YAPILACAKLAR DOSYALARI KONUMLARI

Yapılacaklar şu dosyalarda listelenmiş:

| Dosya                                  | Konumu                                     | İçeriği                                             |
|----------------------------------------|--------------------------------------------|-----------------------------------------------------|
| **📄 GUNCEL_YAPILACAKLAR.md**          | `/Mutluet/GUNCEL_YAPILACAKLAR.md`          | En güncel görevler, GitHub Secrets, Vercel ayarları |
| **📄 SENİN_YAPMAN_GEREKENLER.md**      | `/Mutluet/SENİN_YAPMAN_GEREKENLER.md`      | Adım adım rehber (Admin, Test, Deploy)              |
| **📄 DETAYLI_YAPILACAKLAR_REHBERI.md** | `/Mutluet/DETAYLI_YAPILACAKLAR_REHBERI.md` | **👈 SEN BURDASIN!** Çok detaylı anlatım            |
| **📄 YAPILACAKLAR_SIRA_LISTESI.md**    | `/Mutluet/YAPILACAKLAR_SIRA_LISTESI.md`    | Tüm aşamalar ve tahmini süreler                     |
| **📄 CREATE_ADMIN_USER.md**            | `/Mutluet/CREATE_ADMIN_USER.md`            | Admin oluşturmanın 3 yolu                           |
| **📄 DEPLOYMENT.md**                   | `/Mutluet/DEPLOYMENT.md`                   | Tüm deployment seçenekleri                          |

---

## 🚀 HEMEN YAPMALISIN - AÇIK VE NETLER

### 1️⃣ ADMIN KULLANICISI OLUŞTUR (5 dakika)

**Dosya:** `CREATE_ADMIN_USER.md`

**Terminal'de Yapılacaklar:**

```bash
cd ~/Mutluet/backend
npx prisma studio
```

**Tarayıcıda (http://localhost:5555):**

- User tablosuna git
- "Add Record" tıkla
- Admin bilgilerini gir
- Kaydet

**Sonuç:** Admin hesap hazır ✅

---

### 2️⃣ YEREL TESTLER (15 dakika)

**Dosya:** `SENİN_YAPMAN_GEREKENLER.md` (ADIM 2)

**3 Terminal Aç:**

Terminal 1 - PostgreSQL Başlat:

```bash
brew services start postgresql@16
```

Terminal 2 - Backend Başlat:

```bash
cd ~/Mutluet/backend
pnpm dev
```

Terminal 3 - Frontend Başlat:

```bash
cd ~/Mutluet
pnpm dev
```

**Tarayıcıda Test Et:**

- `http://localhost:5173` aç
- Kayıt ol
- Giriş yap
- Admin paneline git
- Her sekmede tıkla

**Sonuç:** Hepsini çalıştığını gördüğün ✅

---

### 3️⃣ GITHUB SECRETS EKLE (10 dakika)

**Dosya:** `GUNCEL_YAPILACAKLAR.md` (ADIM 2)

**Nereye Ekleyeceksin:**

```
https://github.com/omerfarukkural/Mutluet/settings/secrets/actions
```

**Ekleyecek Secrets:**

| Secret                      | Değer                                | Nereden Al                           |
|-----------------------------|--------------------------------------|--------------------------------------|
| `JWT_SECRET`                | `0b19629595089bc1df746adeaed4389...` | GUNCEL_YAPILACAKLAR.md'de hazır      |
| `WORDPRESS_JWT_SECRET`      | `c7d8eff6cbc913e4e077c15438...`      | GUNCEL_YAPILACAKLAR.md'de hazır      |
| `SUPABASE_SERVICE_ROLE_KEY` | `eyJhbGc...`                         | Supabase Project Settings → API      |
| `DATABASE_URL`              | `postgresql://postgres:...`          | Supabase Project Settings → Database |

**Nasıl Ekle:**

1. GitHub linki aç
2. "New repository secret" tıkla
3. Name: `JWT_SECRET`
4. Value: Değeri yapıştır
5. "Add secret" tıkla
6. Tekrarla (4 secret için)

**Sonuç:** 4 secret eklendi ✅

---

### 4️⃣ SUPABASE DATABASE OLUŞTUR (5 dakika)

**Dosya:** `DETAYLI_YAPILACAKLAR_REHBERI.md` (AŞAMA 2)

**Nereye Ekleyeceksin:**

```
https://supabase.com
```

**Adımlar:**

1. Hesap aç (GitHub ile)
2. "New Project" tıkla
3. İsim: `mutluet-db`
4. Password: Güçlü şifre (KAY ET!)
5. Region: Frankfurt
6. "Create" tıkla
7. 30-60 saniye bekle
8. Settings → Database → Connection Strings
9. **PostgreSQL URI'sini KAY ET**

**Kopya Tutulacak String:**

```
postgresql://postgres:PASSWORD@db.abc123.supabase.co:5432/postgres
```

**Sonuç:** Database oluşturuldu, Connection string alındı ✅

---

### 5️⃣ DATABASE MIGRATION ÇALIŞTIR (2 dakika)

**Dosya:** `DETAYLI_YAPILACAKLAR_REHBERI.md` (AŞAMA 3)

**Terminal'de:**

```bash
cd ~/Mutluet/backend

# CONNECTION_STRING'i Supabase'den kopyaladığın URL ile değiştir
DATABASE_URL="postgresql://postgres:PASSWORD@db.abc123.supabase.co:5432/postgres" npx prisma migrate deploy
```

**Beklenen Çıktı:**

```
✓ All migrations have been successfully applied.
```

**Kontrol Et:** Supabase → Table Editor → 13 tablo görünmeli ✅

**Sonuç:** Veritabanı şeması Supabase'e gönderildi ✅

---

### 6️⃣ BACKEND DEPLOY ET VERCEL'E (30 dakika)

**Dosya:** `DETAYLI_YAPILACAKLAR_REHBERI.md` (AŞAMA 4)

**Nereye Ekleyeceksin:**

```
https://vercel.com
```

**Adımlar:**

1. Vercel'e giriş yap (GitHub ile)
2. "Add New" → "Project"
3. Repository: `omerfarukkural/Mutluet`
4. Root Directory: `backend` seç
5. Environment Variables ekle:
   ```
   DATABASE_URL=postgresql://postgres:...
   JWT_SECRET=0b19629595089bc1df746adeaed4389...
   FRONTEND_URL=https://mutluet.bitebimuv.org
   PORT=3001
   ```
6. "Deploy" tıkla
7. 3-5 dakika bekle
8. "Visit" butonu → Backend URL'i al (örn: `https://mutluet-backend.vercel.app`)

**Test Et:**

```
https://mutluet-backend.vercel.app/health
```

Göreceksin: `{ "status": "ok" }`

**Sonuç:** Backend internette çalışıyor ✅

---

### 7️⃣ FRONTEND DEPLOY ET VERCEL'E (30 dakika)

**Dosya:** `DETAYLI_YAPILACAKLAR_REHBERI.md` (AŞAMA 5)

**Nereye Ekleyeceksin:**

```
https://vercel.com
```

**Adımlar:**

1. "Add New" → "Project"
2. Repository: `omerfarukkural/Mutluet` (aynı repo, değişik proje)
3. Root Directory: `./` (kök klasör)
4. Environment Variables ekle:
   ```
   VITE_API_URL=https://mutluet-backend.vercel.app/api
   VITE_SUPABASE_URL=https://abc123.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGc...
   ```
5. "Deploy" tıkla
6. 5-10 dakika bekle
7. "Visit" butonu → Frontend URL'i al (örn: `https://mutluet-frontend.vercel.app`)

**Test Et:**

```
https://mutluet-frontend.vercel.app
```

Kayıt ol → Başarılı!

**Sonuç:** Frontend internette çalışıyor ✅

---

### 8️⃣ DOMAIN BAĞLA (15 dakika)

**Dosya:** `DETAYLI_YAPILACAKLAR_REHBERI.md` (AŞAMA 5.1)

**Nereye Ekleyeceksin:**

1. **Vercel Frontend Projesinde:**
   ```
   https://vercel.com
   → Frontend Project → Settings → Domains
   ```

2. **Turhost DNS Panel'inde:**
   ```
   https://panel.turhost.com
   (veya domain sağlayıcı paneli)
   ```

**Adımlar:**

1. Vercel'de:
    - "Add Domain" tıkla
    - `mutluet.bitebimuv.org` yaz
    - DNS kayıtlarını kopyala (CNAME)

2. Turhost'ta:
    - Domain yönetimi aç
    - DNS kayıtlarına gir:
      ```
      Type: CNAME
      Subdomain: mutluet
      Target: cname.vercel-dns.com.
      ```
    - Kaydet

3. Bekleme (5-30 dakika)

4. Kontrol et:
   ```bash
   nslookup mutluet.bitebimuv.org
   ```

**Test Et:**

```
https://mutluet.bitebimuv.org
```

Açıldı! ✅

**Sonuç:** Domain bağlandı, HTTPS çalışıyor ✅

---

## 🔗 LINK ÖZETI

Hızlıca bulman için:

### GitHub

| İşlem        | Link                                                               |
|--------------|--------------------------------------------------------------------|
| Secrets Ekle | https://github.com/omerfarukkural/Mutluet/settings/secrets/actions |
| Repository   | https://github.com/omerfarukkural/Mutluet                          |

### Vercel

| İşlem            | Link                                               |
|------------------|----------------------------------------------------|
| Dashboard        | https://vercel.com                                 |
| Backend Projesi  | https://vercel.com/omerfarukkural/mutluet-backend  |
| Frontend Projesi | https://vercel.com/omerfarukkural/mutluet-frontend |

### Supabase

| İşlem     | Link                                                        |
|-----------|-------------------------------------------------------------|
| Dashboard | https://supabase.com/dashboard                              |
| Project   | https://supabase.com/dashboard/project/xuqbxbhgkoivqdqblbeq |

### Google

| İşlem         | Link                             |
|---------------|----------------------------------|
| Cloud Console | https://console.cloud.google.com |

### Stripe

| İşlem     | Link                         |
|-----------|------------------------------|
| Dashboard | https://dashboard.stripe.com |

### Host Panel

| İşlem       | Link                      |
|-------------|---------------------------|
| Turhost DNS | https://panel.turhost.com |

---

## 📋 KONTROL LİSTESİ

Yapılacakları bitirdin mi? Kontrol et:

- [ ] **Admin Kullanıcı Oluşturuldu**
    - Dosya: `CREATE_ADMIN_USER.md`
    - Kontrol: Prisma Studio'da admin@mutluet.org var mı?

- [ ] **Yerel Testler Tamamlandı**
    - Dosya: `SENİN_YAPMAN_GEREKENLER.md` (ADIM 2)
    - Kontrol: Kayıt/Giriş/Admin Paneli çalışıyor mu?

- [ ] **GitHub Secrets Eklendi**
    - Dosya: `GUNCEL_YAPILACAKLAR.md` (ADIM 2)
    - Kontrol: 4 secret eklemişin mi?

- [ ] **Supabase Database Oluşturuldu**
    - Dosya: `DETAYLI_YAPILACAKLAR_REHBERI.md` (AŞAMA 2)
    - Kontrol: 13 tablo var mı?

- [ ] **Backend Deploy Edildi**
    - Dosya: `DETAYLI_YAPILACAKLAR_REHBERI.md` (AŞAMA 4)
    - Kontrol: Backend URL'i çalışıyor mu?

- [ ] **Frontend Deploy Edildi**
    - Dosya: `DETAYLI_YAPILACAKLAR_REHBERI.md` (AŞAMA 5)
    - Kontrol: Frontend URL'i açılıyor mu?

- [ ] **Domain Bağlandı**
    - Dosya: `DETAYLI_YAPILACAKLAR_REHBERI.md` (AŞAMA 5.1)
    - Kontrol: mutluet.bitebimuv.org açılıyor mu?

---

## ❓ SORU CEVAP

### "Nereden değer alacağım?"

| Değer                       | Nereden Alındığı                                          |
|-----------------------------|-----------------------------------------------------------|
| `JWT_SECRET`                | `GUNCEL_YAPILACAKLAR.md`'de hazır (kopyala)               |
| `WORDPRESS_JWT_SECRET`      | `GUNCEL_YAPILACAKLAR.md`'de hazır (kopyala)               |
| `DATABASE_URL`              | Supabase → Settings → Database → Connection Strings → URI |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase → Settings → API → service_role (gizli)          |
| `VITE_API_URL`              | Kendi Backend Vercel URL'in (deploy sonra)                |
| `VITE_SUPABASE_URL`         | Supabase → Settings → API → URL                           |
| `VITE_SUPABASE_ANON_KEY`    | Supabase → Settings → API → anon (public)                 |

### "Nereye ekleyeceğim?"

| Değer               | Nereye Eklendiği                      |
|---------------------|---------------------------------------|
| `JWT_SECRET`        | GitHub Secrets                        |
| `DATABASE_URL`      | Vercel Backend Environment Variables  |
| `VITE_SUPABASE_URL` | Vercel Frontend Environment Variables |
| DNS CNAME           | Turhost DNS Panel                     |

### "Kaç adım var?"

**Toplam 8 adım:**

1. Admin Kullanıcı Oluştur (5 dk)
2. Yerel Testler (15 dk)
3. GitHub Secrets (10 dk)
4. Supabase Database (5 dk)
5. Database Migration (2 dk)
6. Backend Deploy (30 dk)
7. Frontend Deploy (30 dk)
8. Domain Bağla (15 dk)

**Toplam Süre: ~2 saat** ⏱️

---

## 🎯 EN HIZLI YÖNTEM

Eğer sadece `mutluet.bitebimuv.org` üzerine git ve hızlıca bitmek istiyorsan:

```bash
# 1. Admin Oluştur
cd ~/Mutluet/backend && npx prisma studio
# (Admin@mutluet.org, admin123, role: ADMIN)

# 2. Supabase URL Al
# https://supabase.com/dashboard → Settings → Database → URI kopyala

# 3. Database Migration Çalıştır
DATABASE_URL="postgresql://..." npx prisma migrate deploy

# 4. Vercel'e Deploy
# GitHub Secrets ekle → Backend ve Frontend deploy et

# 5. Domain Bağla
# Vercel + Turhost DNS
```

**Bitti!** 🚀

---

## 📚 DETAYLI DOSYALAR

Eğer daha detaylı bilgi istersen:

- **📄 DETAYLI_YAPILACAKLAR_REHBERI.md** ← **BURAYA BAK!**
    - Çok detaylı, hiç bilmeyen birine anlatır gibi
    - Her adımı resimli anlatır (metin ama çok açık)
    - Hataların çözümü var

- **📄 SENİN_YAPMAN_GEREKENLER.md**
    - Daha kısa versiyonu
    - Adım adım yapılır

- **📄 GUNCEL_YAPILACAKLAR.md**
    - En güncel görevler
    - Secret değerleri hazır

- **📄 DEPLOYMENT.md**
    - Tüm deployment seçenekleri
    - Azure, Vercel, Railway karşılaştırması

---

## 🎉 BAŞARILI DEPLOYMENT İÇİN

1. ✅ Tüm kontrol listesini tamamla
2. ✅ Her adımdan sonra test et
3. ✅ Hata olursa `DETAYLI_YAPILACAKLAR_REHBERI.md`'nin sorun giderme bölümüne bak
4. ✅ Başarıdan sonra kutla! 🎊

---

**Hazırlayan:** GitHub Copilot  
**Tarih:** 8 Mart 2026  
**Amaç:** Yapılacakları hiç bilmeyen birine anlatır gibi açıklamak

✅ **BAŞARILI DEPLOYMENT DILERIM!** 🚀

