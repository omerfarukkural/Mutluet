# 🚀 MUTLUET DEPLOYMENT DETAYLI REHBERİ

## Hiç Bilmeyen Birine Anlatır Gibi

**Yazarı:** GitHub Copilot  
**Tarih:** 8 Mart 2026  
**Amaç:** Mutluet uygulamasını internette yayınlamak (deployment)

---

## 📚 İÇİNDEKİLER

1. [Sistemin Neyi Neden Yaptığını Anlamak](#sistem-neyi-neden-yapıyor)
2. [Admin Kullanıcı Oluşturma](#1-admin-kullanıcı-oluşturma)
3. [Yerel Testler](#2-yerel-testler)
4. [Vercel ile Deploy](#3-vercel-ile-deploy)
5. [Supabase Database Setup](#4-supabase-database)
6. [Domain Bağlama](#5-domain-bağlama)
7. [API Key'leri Ekleme](#6-api-keyleri-ekleme)
8. [Troubleshooting](#7-sorun-giderme)

---

## 🤔 SİSTEM NEYİ NEDEN YAPIYOR?

### Basit Anlatım

Mutluet uygulaması üç ana parçadan oluşuyor:

```
┌─────────────────────────────────────────────────────────────┐
│                    MUTLUET SİSTEMİ                          │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  1️⃣ FRONTEND (Kullanıcı Arayüzü)                           │
│     ├─ Ne işe yarar: Ekran, butonlar, resimler            │
│     ├─ Nerede çalışır: Tarayıcı (Chrome, Safari vb.)      │
│     ├─ URL (Şu an): http://localhost:5173                 │
│     └─ URL (Production): https://mutluet.bitebimuv.org    │
│                                                             │
│  ⬅️➡️ (İletişim)                                           │
│                                                             │
│  2️⃣ BACKEND (Sunucu - Beyin)                              │
│     ├─ Ne işe yarar: Hesaplamalar, veri saklama           │
│     ├─ Nerede çalışır: Cloud sunucusu                     │
│     ├─ URL (Şu an): http://localhost:3001                │
│     └─ URL (Production): https://mutluet-api.vercel.app  │
│                                                             │
│  ⬇️⬆️ (Veri alma/gönderme)                                  │
│                                                             │
│  3️⃣ DATABASE (Veri Deposu)                                │
│     ├─ Ne işe yarar: Kullanıcılar, bağışlar, etkinlikleri │
│     ├─ Nerede bulunur: Supabase (PostgreSQL)             │
│     └─ Bağlantı: Encrypted connection                     │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Nasıl Çalışıyor? Adım Adım

**Senaryo: Kullanıcı "Kayıt Ol" butonuna tıklar**

```
1. Tarayıcıda (Frontend)
   ├─ Kullanıcı formu doldur
   └─ "Kayıt Ol" butonuna tıkla
        ⬇️
2. Frontend Backend'e İsteği Gönder
   ├─ İsim: "Ahmet"
   ├─ Email: "ahmet@example.com"
   └─ Şifre: "sifre123"
        ⬇️
3. Backend Kontrol Eder
   ├─ Email var mı? (yoksa devam)
   ├─ Şifre güvenlimi? (evet)
   ├─ Veri doğru mu? (evet)
   └─ Şifreyi encrypt et (güvenlik için)
        ⬇️
4. Database'e Kaydet
   ├─ User tablosuna ekle
   └─ PostgreSQL'de sakla
        ⬇️
5. Frontend'e Cevap Dön
   ├─ Başarı mesajı
   └─ Ana sayfaya yönlendir
        ⬇️
6. Kullanıcı Giriş Yapmış! ✅
```

---

## 1️⃣ ADMIN KULLANICI OLUŞTURMA

### Neden Admin Kullanıcıya İhtiyacımız Var?

- 👑 **Normal kullanıcılar:** Sadece kendi profillerini görür
- 🔧 **Admin kullanıcılar:** Herşeyi yönetebilir
    - Tüm kullanıcıları görebilir
    - Etkinlikleri yönetebilir
    - İstatistikleri görüntüleyebilir
    - Admin paneline erişebilir

### Admin Kullanıcı Oluşturma Adımları

#### Adım 1: Prisma Studio'yu Aç

**Nedir Prisma Studio?**

- Database'i görsel arayüzle yönetme aracı
- Veritabanındaki tabloları görebilir, ekleyebilir, düzenleyebilir
- Çok kullanışlı!

**Nasıl Açılır?**

```bash
# Terminal aç (⌘T macOS'ta)
# Terminalde bu komutları sırayla yazıp Enter'a bas

cd ~/Mutluet/backend
npx prisma studio
```

**Beklenen Sonuç:**

- Bir takım yazılar aşağı doğru akalacak
- Son satırda göreceksin: `Opening Prisma Studio...`
- Tarayıcında otomatik açılacak: `http://localhost:5555`

#### Adım 2: User Tablosunu Aç

1. **http://localhost:5555** tarayıcıda açılırsa devam et
2. Sol tarafta görüyorsun: **"User"** yazısı
3. **"User"** yazısına tıkla

**Sonuç:** Kullanıcılar tablosu açılacak. Henüz boş olabilir.

#### Adım 3: Yeni Kullanıcı Ekle

1. Sağ üst köşede gör: **"Add record +"** butonu
2. Bu butona tıkla
3. Yeni bir form açılacak

#### Adım 4: Admin Bilgilerini Gir

**Forma şu bilgileri gir:**

| Alan              | Gir               | Açıklama                        |
|-------------------|-------------------|---------------------------------|
| **email**         | admin@mutluet.org | Admin emaili (benzersiz olmalı) |
| **name**          | Admin             | Admin adı (istediğin isim)      |
| **password**      | (aşağı bak)       | Şifreli form (hash gerekli)     |
| **role**          | ADMIN             | Dropdown'dan seç                |
| **authProvider**  | EMAIL             | Dropdown'dan seç                |
| **emailVerified** | true              | Toggle tıkla                    |

**⚠️ Password Field Özel:**

Password'ü direkt yazamazsın! Şifreyi hash etmen gerek (Güvenlik için). Şöyle yap:

```bash
# Terminal açık mı? Varsa, başka bir Terminal Tab açıp git:

cd ~/Mutluet/backend

# Bu kodu kopyala yapıştır ve Enter'a bas:
node -e "const bcrypt = require('bcrypt'); bcrypt.hash('admin123', 10).then(hash => console.log(hash));"
```

**Çıktı:**

```
$2b$10$... (çok uzun karmaşık metin)
```

Bu metin çıkacak. Tamamını kopyala:

- Terminal'de yazıyı seç (Cmd+A)
- Kopyala (Cmd+C)
- Prisma Studio'da password alanına yapıştır (Cmd+V)

#### Adım 5: Kaydet

1. Form'un altında gör: **"Save 1 change"** butonu
2. Bu butona tıkla
3. Başarı mesajı göreceksin ✅

**Hazır!** Admin kullanıcın oluşturuldu!

### Admin Kullanıcı Oluşturma - Alternatif Yol

**Eğer terminal komutu korkutuyorsa, bu yolu kullan:**

```sql
-- Bunu SQL editor'a yapıştır (Supabase'de sonra)
INSERT INTO "User" (id, email, name, password, role, "authProvider")
VALUES 
  (
    'admin-uuid-123456789',
    'admin@mutluet.org',
    'Admin',
    '$2b$10$salt...',  -- bcrypt hash
    'ADMIN',
    'EMAIL'
  );
```

---

## 2️⃣ YEREL TESTLER

### Test Etme Nedir?

Test, uygulamanın çalışıp çalışmadığını kontrol etmek.

**Neden gerekli?**

- Deployment öncesi hataları bulur
- Internette yayınlamadan öncesi sorun çözer
- Vakit ve para kaybı önler

### Test Öncesi Hazırlık

**3 terminal açmanız gerekecek:**

```
Terminal 1: PostgreSQL (Database)
Terminal 2: Backend (API Server)
Terminal 3: Frontend (Kullanıcı Arayüzü)
```

### Terminal 1: PostgreSQL Başlatma

```bash
# Terminal 1'de
brew services start postgresql@16

# Kontrol et
brew services list

# Çıktı şöyle görünmeli:
# postgresql@16  started
```

**Ne oldu?**

- Database motor başladı
- Veri saklamaya hazır

### Terminal 2: Backend Başlatma

```bash
# Terminal 2'de
cd ~/Mutluet/backend
pnpm dev

# Çıktı şöyle görünmeli:
# Server running on http://localhost:3001
```

**Ne oldu?**

- Backend sunucusu başladı
- API'ler kullanıma hazır

### Terminal 3: Frontend Başlatma

```bash
# Terminal 3'de
cd ~/Mutluet
pnpm dev

# Çıktı şöyle görünmeli:
# ➜  Local:   http://localhost:5173/
```

**Ne oldu?**

- Frontend web uygulaması başladı
- Tarayıcıya hazır

### Tarayıcıda Aç

```
http://localhost:5173
```

**Görüyorsun:**

- Mutluet logosu
- Onboarding ekranları
- Kayıt/Giriş butonları

**Mükemmel! ✅**

---

### Test 1: Kayıt Ol

1. **"Kayıt Ol"** butonuna tıkla
2. Forma şu bilgileri gir:
   ```
   İsim: Test Kullanıcı
   Email: test@example.com
   Şifre: test123456 (minimum 6 karakter)
   ```
3. **"Kayıt Ol"** butonuna tıkla
4. **Beklenen Sonuç:** Ana sayfa açılır ✅

**Eğer hata alırsan:**

- Backend Terminal'inde bak: Kırmızı yazılar var mı?
- Browser console'unda bak: F12 tuşu > Console tab
- `LOKAL_HATA_DUZELT.md` dosyasına bak

### Test 2: Giriş Yap

1. Sağ üst köşede profil simgesine tıkla
2. **"Çıkış Yap"** tıkla
3. Başka email ile kayıt ol:
   ```
   İsim: Test User 2
   Email: test2@example.com
   Şifre: test123456
   ```
4. **Beklenen Sonuç:** Giriş yapılır ✅

### Test 3: Admin Paneli

1. **Admin** hesabıyla giriş yap:
   ```
   Email: admin@mutluet.org
   Şifre: admin123
   ```
2. Sağ üst profil simgesine tıkla
3. **"/profile"** veya direkt adreste `/profile` yaz
4. Aşağı scroll et
5. **Mor/Pembe "Admin Paneli" kartı** göreceksin
6. **"Admin Paneli"** kartına tıkla
7. **Beklenen Sonuç:** İstatistikler ve yönetim paneli açılır ✅

**Admin Panelinde Göreceklerin:**

- 📊 Toplam kullanıcı sayısı
- 💰 Toplam bağışlar
- 📅 Yaklaşan etkinlikler
- 👥 Son kayıt olan kullanıcılar
- ⚙️ Hızlı araçlar (Prisma Studio, Backend Status)

### Test 4: Tüm Sayfaları Gezin

Alt menüden:

- 🏠 **Ana Sayfa** - Ana dashboard
- 🏷️ **Kategoriler** - Bağış kategorileri
- 🗺️ **Harita** - Yakındaki yerler (Google Maps key gerekirse)
- 💕 **Eşleşme** - Gönüllü eşleştirme
- 👤 **Profil** - Profil yönetimi

**Hepsinin yüklenip yüklenmediğini kontrol et**

### Test 5: Etkinlik Oluştur (Opsiyonel)

```bash
# Terminal'de (herhangi biri):
cd ~/Mutluet/backend
npx prisma studio
```

1. Prisma Studio'da `http://localhost:5555` aç
2. Sol menüden **"Event"** tıkla
3. **"Add Record"** tıkla
4. Bilgileri gir:
   ```
   title: Kitap Bağışı
   description: Çocuklar için kitap topluyoruz
   category: EGITIM
   date: 2026-03-20 (gelecek bir tarih)
   time: 14:00
   location: Merkez Kütüphane
   currentParticipants: 2
   maxParticipants: 50
   ```
5. **"Save"** tıkla
6. Frontend'i yenile (Cmd+R)
7. **Beklenen Sonuç:** Etkinlik ana sayfada göründür ✅

---

## 3️⃣ VERCEL İLE DEPLOY

### Vercel Nedir?

**Basitçe:**

- Ücretsiz hosting hizmeti
- Uygulamanı internete yayınlar
- Herkes erişebilir
- Adı girilince açılır

**Alternatif Seçenekler:**

- Railway ($5/ay)
- Azure (2000$ kredi)
- Heroku (Ücretli)

**Vercel neden seçildi?**

- ✅ Ücretsiz
- ✅ Kolay kurulum
- ✅ Hızlı deployment
- ✅ Automatic scaling

---

### AŞAMA 1: VERCEL HESABI OLUŞTUR

#### Adım 1: Vercel Sitesine Git

Tarayıcıda aç:

```
https://vercel.com
```

#### Adım 2: Kayıt Ol

1. **"Sign Up"** veya **"Get Started"** butonuna tıkla
2. **"Continue with GitHub"** seç
    - (GitHub hesabın yoksa https://github.com'da oluştur)
3. GitHub hesabınla giriş yap
4. Vercel'e izin vermek istediğini onayla

**Sonuç:** Vercel hesabın oluşturuldu ✅

#### Adım 3: Profil Kontrol

Sağ üst köşede profilin görünmeli. İyi!

---

### AŞAMA 2: SUPABASE DATABASE OLUŞTUR

**Neden Supabase?**

- PostgreSQL database ücretsiz
- Cloud'da (internette) çalışır
- Production için güvenli
- Backup otomatik

#### Adım 1: Supabase Sitesine Git

Tarayıcıda aç:

```
https://supabase.com
```

#### Adım 2: Kayıt Ol

1. **"Start your project"** veya **"Sign Up"** tıkla
2. **"Continue with GitHub"** seç
3. GitHub hesabınla giriş yap

#### Adım 3: Yeni Project Oluştur

1. Sağ üst **"New Project"** veya **"+"** tıkla
2. Şu bilgileri gir:

| Alan                  | Gir             | Açıklama                            |
|-----------------------|-----------------|-------------------------------------|
| **Project Name**      | mutluet-db      | Veritabanının adı                   |
| **Database Password** | Güçlü bir şifre | Örn: MySuper$ecurePass123 (KAY ET!) |
| **Region**            | Frankfurt (EU)  | En yakın bölge                      |

3. **"Create new project"** tıkla
4. **30-60 saniye bekle** (Database kurulmakta)

#### Adım 4: Connection String'i Al

1. Sol menüde **"Settings"** tıkla
2. **"Database"** bölümü aç
3. **"Connection strings"** sekmesinde **"URI"** bölümünü aç
4. **PostgreSQL** satırını gör:

```
postgresql://postgres:[YOUR-PASSWORD]@db.abc123.supabase.co:5432/postgres
```

5. **Bu URL'in sağında kopyala simgesi var**
6. Tıkla ve kopyala (Cmd+C)
7. **BAŞKA BİR YERE KAYDET** (Sonra lazım olacak)

**Kopya Link:**

```
postgresql://postgres:YOUR_PASSWORD@db.abc123.supabase.co:5432/postgres
```

---

### AŞAMA 3: DATABASE MIGRATION ÇALIŞTır

**Ne işe yarar?**

- Lokal database şemasını (13 tablo) Supabase'e gönderir
- Tüm tabloları ve ilişkileri oluşturur

**Nasıl Yapar?**

```bash
# Terminal aç
cd ~/Mutluet/backend

# Bu komutu çalıştır (CONNECTION_STRING'i kopyaladığın URL ile değiştir)
DATABASE_URL="postgresql://postgres:MySuper$ecurePass123@db.abc123.supabase.co:5432/postgres" npx prisma migrate deploy
```

**Çıktı Şöyle Görünür:**

```
Prisma schema loaded from prisma/schema.prisma
Datasource "db": PostgreSQL
Migrations to apply:
  2026/03/02155244_init
All migrations have been successfully applied. ✅
```

**Başarı!** ✅ Tüm tablolar Supabase'de oluşturuldu!

**Kontrol Etmek İçin:**

1. Supabase sitesinde kalmışsa
2. Sol menü > **"Table Editor"**
3. Tablolar listesi göreceksin:
    - User ✅
    - Donation ✅
    - Event ✅
    - ... (toplam 13 tablo)

---

### AŞAMA 4: BACKEND DEPLOY ET VERCEL'E

#### Adım 1: Vercel Projesi Oluştur

1. https://vercel.com aç
2. Dashboard'da **"Add New"** > **"Project"** tıkla
3. **"Import Git Repository"** altında gör
4. Repo listesinde ara: **"omerfarukkural/Mutluet"**
5. **"Import"** tıkla

#### Adım 2: Proje Ayarları

Açılan sayfada:

| Alan                 | Seç            | Açıklama            |
|----------------------|----------------|---------------------|
| **Framework Preset** | Node.js        | Backend teknolojisi |
| **Root Directory**   | `backend`      | Backend klasörü seç |
| **Build Command**    | `pnpm build`   | Derleme komutu      |
| **Output Directory** | `dist`         | Çıkış klasörü       |
| **Install Command**  | `pnpm install` | Kurulum komutu      |

#### Adım 3: Environment Variables Ekle

Formu aşağı scroll et. **"Environment Variables"** bölümü var:

1. **"Add New"** veya **"+"** tıkla
2. Şu değişkenleri ekle:

```
Name: DATABASE_URL
Value: postgresql://postgres:MySuper$ecurePass123@db.abc123.supabase.co:5432/postgres
(Supabase'den kopyaladığın)

Name: JWT_SECRET
Value: super-secret-production-key-change-this-12345678

Name: FRONTEND_URL
Value: https://mutluet.bitebimuv.org (veya Vercel URL'i)

Name: PORT
Value: 3001
```

3. Her bir değişken için **"Add"** tıkla

**Çıktı:**

```
✓ DATABASE_URL added
✓ JWT_SECRET added
✓ FRONTEND_URL added
✓ PORT added
```

#### Adım 4: Deploy Et

1. Sayfanın alt kısmında **"Deploy"** butonu
2. Bu butona tıkla
3. **3-5 dakika bekle** (Deployment yapılıyor)

**Çıktı Şöyle Olur:**

```
✓ Verifying project settings
✓ Fetching git information
✓ Downloading files from repository
✓ Installing dependencies
✓ Building application
✓ Optimizing production bundles
✓ Preparing deployment
✓ Deployment successful
```

#### Adım 5: Backend URL'i Al

1. Deployment tamamlanırsa
2. **"Visit"** butonu görünür
3. Tıkla ve test et: `https://mutluet-backend.vercel.app/health`

**Başarı!** Backend internette çalışıyor! ✅

**Çıktı:**

```json
{
  "status": "ok",
  "timestamp": "..."
}
```

---

### AŞAMA 5: FRONTEND DEPLOY ET VERCEL'E

#### Adım 1: Yeni Proje Oluştur

1. Vercel Dashboard'a git
2. **"Add New"** > **"Project"** tıkla
3. Repo listesinde: **"omerfarukkural/Mutluet"**
4. **"Import"** tıkla

#### Adım 2: Proje Ayarları

| Alan                 | Seç          | Açıklama             |
|----------------------|--------------|----------------------|
| **Framework Preset** | Vite         | Frontend framework'ü |
| **Root Directory**   | `./`         | Root klasörü         |
| **Build Command**    | `pnpm build` | Derleme komutu       |
| **Output Directory** | `dist`       | Çıkış klasörü        |

#### Adım 3: Environment Variables Ekle

1. **"Environment Variables"** bölümüne scroll et
2. **"Add New"** tıkla
3. Ekle:

```
Name: VITE_API_URL
Value: https://mutluet-backend.vercel.app/api
(Backend URL'iniz)

Name: VITE_SUPABASE_URL
Value: https://abc123.supabase.co
(Supabase'den al)

Name: VITE_SUPABASE_ANON_KEY
Value: eyJhbGc... (çok uzun kod)
(Supabase'den al)
```

**Supabase URL'lerini almak için:**

1. Supabase sitesine git
2. Project'e gir
3. Sol menü > **"Settings"** > **"API"**
4. Görüyorsun:
    - `URL`
    - `anon (public)`
5. Kopyala ve Vercel'e yapıştır

#### Adım 4: Deploy Et

1. **"Deploy"** butonuna tıkla
2. **5-10 dakika bekle**

**Çıktı:**

```
✓ Verifying project settings
✓ Fetching git information
✓ Downloading files from repository
✓ Installing dependencies
✓ Building application
✓ Deploying...
✓ Success!
```

#### Adım 5: Frontend URL'i Al

1. Deployment tamamlanırsa
2. **"Visit"** butonu
3. Tıkla: `https://mutluet-frontend.vercel.app`

**Başarı!** Frontend internette açıldı! ✅

---

### Test: Her İkisinin Birlikte Çalışıp Çalışmadığını Kontrol Et

1. Frontend URL'i aç: `https://mutluet-frontend.vercel.app`
2. **"Kayıt Ol"** tıkla
3. Formu doldur:
   ```
   İsim: Test User Production
   Email: test@production.com
   Şifre: test123456
   ```
4. **"Kayıt Ol"** tıkla
5. **Beklenen Sonuç:** Ana sayfa açılır ✅

---

## 4️⃣ DOMAIN BAĞLAMA

### Domain Nedir?

- **Domain:** Websitesinin adresi (örn: google.com, instagram.com)
- **Şu an URL:** https://mutluet-frontend.vercel.app (karmaşık)
- **Hedef URL:** https://mutluet.bitebimuv.org (güzel, hatırlanabilir)

### Seçenek 1: mutluet.bitebimuv.org (Subdomain)

**Fayda:**

- ✅ Zaten domain'in parçası (bitebimuv.org)
- ✅ Kurulumu basit
- ✅ Maliyeti sıfır

**Kurulum:**

#### Adım 1: Vercel'de Domain Ekle

1. Vercel Frontend projesine git
2. **"Settings"** sekmesi
3. Sol menüde **"Domains"** tıkla
4. **"Add Domain"** butonu
5. Yaz: `mutluet.bitebimuv.org`
6. **"Add"** tıkla

**Çıktı:**

```
Domain: mutluet.bitebimuv.org
Status: Invalid Configuration
(Vercel'i DNS'ye bağlamalısın)
```

#### Adım 2: DNS Kayıtlarını Al

1. Vercel'de domain'in altında gör:
   ```
   Type: CNAME
   Name: mutluet
   Value: cname.vercel-dns.com.
   ```

2. Bu bilgileri **KOPYALA**

#### Adım 3: Turhost'ta DNS Ekle

1. https://turhost.com veya domain host paneline git
2. Giriş yap (bitebimuv.org'u aldığın yer)
3. **"Domain Yönetimi"** veya **"DNS Management"** bul
4. **DNS Kayıtlarını Düzenle:**
    - **Type:** CNAME
    - **Subdomain:** mutluet
    - **Target:** cname.vercel-dns.com.
    - **TTL:** 3600 (varsayılan)

5. **"Save"** veya **"Kaydet"** tıkla

#### Adım 4: Bekleme

DNS değişimleri 5-30 dakika sürebilir. Sabrır!

1. Terminal aç
2. Kontrol et:
   ```bash
   nslookup mutluet.bitebimuv.org
   ```

3. Göreceksin:
   ```
   Name: mutluet.bitebimuv.org
   Address: 76.76.19.... (Vercel IP)
   ```

#### Adım 5: SSL Certificate

Vercel otomatik SSL sertifikası veriyor.

1. Vercel'de domain'in yanına bakalım
2. **"Status: Valid Configuration"** yazacak ✅
3. **"Cert Status: Valid"** yazacak ✅

**Hazır!** 🎉

Tarayıcıda aç:

```
https://mutluet.bitebimuv.org
```

**Başarı!** Frontend internette erişilebiliyor! ✅

---

### Seçenek 2: Admin Paneli Domain (Opsiyonel)

Eğer **mutluet.bitebimuv.org** kullanıcılar için kullanırsan, admin paneli başka bir domain
olabilir:

```
Seçenek 1:
- mutluet.bitebimuv.org → Kullanıcı Web App
- admin.bitebimuv.org → Admin Panel

Seçenek 2:
- mutluet.bitebimuv.org/admin → Admin Panel (aynı domain'de)

Seçenek 3:
- mutluet.org → Main App (satın almak gerekirse)
- mutluet.bitebimuv.org → Backup
```

---

## 5️⃣ API KEY'LERI EKLEME

### API Key Nedir?

**Basitçe:**

- Şifre gibi bir kod
- Harici servislere (Google, Stripe) erişim için
- Uygulamada özel özellikleri aktif ediyor

### Hangi API'lere İhtiyacımız Var?

| Hizmet           | Maksadı            | Zorunlu mu? | Maliyeti           |
|------------------|--------------------|-------------|--------------------|
| **Google OAuth** | Google ile giriş   | ❌ Opsiyonel | Ücretsiz           |
| **Stripe**       | Bağış ödemeleri    | ❌ Opsiyonel | %2.9 + $0.30       |
| **Google Maps**  | Harita göstermek   | ❌ Opsiyonel | Ücretsiz (sınırlı) |
| **Firebase**     | Push notifications | ❌ Opsiyonel | Ücretsiz (sınırlı) |
| **SendGrid**     | Email gönderme     | ❌ Opsiyonel | Ücretsiz (100/gün) |

**Şu an çalışıyor:**

- Email/Şifre ile giriş ✅
- Etkinlik, bağış, chat ✅
- Admin paneli ✅

**Opsiyonel özellikler (API gerekli):**

- Google ile giriş ⭕
- Harita (Google Maps) ⭕
- Ödeme (Stripe) ⭕
- Push notifications (Firebase) ⭕

---

### 5.1 GOOGLE OAUTH (Google ile Giriş)

#### Adım 1: Google Cloud Console'a Git

Tarayıcıda aç:

```
https://console.cloud.google.com
```

#### Adım 2: Giriş Yap

- Google hesabınla giriş yap

#### Adım 3: Yeni Project Oluştur

1. Üst bar'da gör: **"Select a Project"** veya "Project" dropdown'u
2. **"New Project"** tıkla
3. İsim: `mutluet`
4. **"Create"** tıkla
5. **30 saniye bekle**

#### Adım 4: OAuth Consent Screen Oluştur

1. Sol menüde **"APIs & Services"** > **"OAuth consent screen"**
2. **"External"** seç (dış kullanıcılar için)
3. **"Create"** tıkla
4. Formu doldur:

| Alan                   | Gir               |
|------------------------|-------------------|
| **App name**           | Mutluet           |
| **User support email** | admin@mutluet.org |
| **Developer contact**  | Senin emailing    |

5. **"Save and Continue"** tıkla

#### Adım 5: Scopes Ekle

1. **"Scopes"** sayfasında
2. **"Add or Remove Scopes"** tıkla
3. Ara: `email`, `profile`
4. Tikle
5. **"Update"** tıkla
6. **"Save and Continue"** tıkla

#### Adım 6: OAuth Credentials Oluştur

1. **"Credentials"** sayfasına git
2. **"+ Create Credentials"** > **"OAuth Client ID"** tıkla
3. Application type: **"Web application"**
4. Adı: `Mutluet App`
5. **"Authorized redirect URIs"** bölümünde:
   ```
   https://mutluet.bitebimuv.org/api/oauth/callback
   https://localhost:3000/api/oauth/callback
   ```
6. **"Create"** tıkla

#### Adım 7: Credentials'ı Kaydet

Açılan pencerede gör:

```
Client ID: 123456789-abc...
Client Secret: GOCSPX-...
```

**KAY ET! (Sonra lazım olacak)**

#### Adım 8: Backend'e Ekle

1. Backend `.env` dosyasını aç:
   ```
   ~/Mutluet/backend/.env
   ```

2. Ekle:
   ```
   GOOGLE_CLIENT_ID=123456789-abc...
   GOOGLE_CLIENT_SECRET=GOCSPX-...
   GOOGLE_CALLBACK_URL=https://mutluet.bitebimuv.org/api/oauth/callback
   ```

3. Kaydet

#### Adım 9: Vercel'de Environment Variable Ekle

1. Vercel Backend projesine git
2. **"Settings"** > **"Environment Variables"**
3. Ekle:
   ```
   GOOGLE_CLIENT_ID
   GOOGLE_CLIENT_SECRET
   GOOGLE_CALLBACK_URL
   ```

4. **Deploy et** (yeniden deploy et)

---

### 5.2 STRIPE (Bağış Ödemeleri)

#### Adım 1: Stripe Hesabı Aç

Tarayıcıda aç:

```
https://stripe.com/tr
```

1. **"Hesap Aç"** veya **"Sign Up"** tıkla
2. Email ve şifre gir
3. Doğrulama email'ine tıkla

#### Adım 2: Test Keys Al

1. Dashboard'da git
2. Sol menü > **"Developers"** > **"API keys"**
3. Gör:
   ```
   Publishable key: pk_test_...
   Secret key: sk_test_...
   ```

4. **KAY ET!**

#### Adım 3: Backend'e Ekle

1. Backend `.env`:
   ```
   STRIPE_PUBLISHABLE_KEY=pk_test_...
   STRIPE_SECRET_KEY=sk_test_...
   ```

2. Kaydet

#### Adım 4: Frontend'e Ekle

1. Frontend `.env`:
   ```
   VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...
   ```

2. Kaydet

#### Adım 5: Deploy Et

Yeniden deploy et (GitHub'a push et, Vercel otomatik deploy yapacak)

---

### 5.3 GOOGLE MAPS (Harita)

#### Adım 1: Google Cloud Console'da

Zaten açtıysan, devam et. Değilse:

```
https://console.cloud.google.com
```

#### Adım 2: Maps API'yi Aktif Et

1. Sol menü > **"APIs & Services"** > **"Library"**
2. Ara: `Maps JavaScript API`
3. Tıkla
4. **"Enable"** butonu
5. Başlıyor...

#### Adım 3: API Key Oluştur

1. **"Credentials"** sekmesine git
2. **"+ Create Credentials"** > **"API Key"** tıkla
3. **KAY ET!**

#### Adım 4: Frontend'e Ekle

1. Frontend `.env`:
   ```
   VITE_GOOGLE_MAPS_API_KEY=...
   ```

2. Kaydet
3. Redeploy et

---

## 6️⃣ UYGULAMANIN KULLANIMIMDA HANGİ İŞE YARADIĞINI ANLA

### Admin Paneli

**Nerede?**

```
https://mutluet.bitebimuv.org/admin
```

**Kimlerin Erişebileceği?**

- Sadece `role: ADMIN` olan kullanıcılar
- Diğerleri erişemez

**Ne İşe Yarar?**

1. **İstatistikler Kartları** (En üst):
    - 📊 Toplam Kullanıcı: Kaç kişi kayıtlı?
    - 👤 Aktif Kullanıcı: Kaç kişi aktif?
    - 💰 Toplam Bağış: Ne kadar para bağışlanmış?
    - 📅 Toplam Etkinlik: Kaç etkinlik var?

2. **Son Kayıtlar Listesi**:
    - Yeni gelen kullanıcıları görmek
    - İlk bakış atma

3. **Yaklaşan Etkinlikler**:
    - Önümüzdeki etkinlikleri görmek
    - Planlamaya yardımcı

4. **Son Bağışlar**:
    - Kimin ne kadar bağışladığını görmek
    - Teşekkür etmek için

5. **Hızlı İşlemler Butonları**:
    - **Prisma Studio**: Veritabanını görsel arayüzle yönetmek
    - **Kullanıcı Görünümü**: Normal kullanıcı gibi uygulamayı görmek
    - **Backend Status**: Backend sunucusunun sağlıklı olup olmadığını kontrol
    - **Verileri Yenile**: İstatistikleri güncellemek

### Normal Kullanıcı Paneli

**Nerede?**

```
https://mutluet.bitebimuv.org
```

**Ne İşe Yarar?**

1. **Ana Sayfa (Dashboard)**:
    - İstatistikler: Senin bağışların, gönüllülük saatlerin, katıldığın etkinlikler
    - Özellikler: Oyun, Eşleşme, Sohbet, Keşfet
    - Yaklaşan Etkinlikler

2. **Kategoriler Sekmesi**:
    - Bağış kategorilerini görmek
    - Her kategoriye tıklayıp detay bilgi almak
    - Kategoriye bağış yapmak

3. **Harita Sekmesi**:
    - Yakındaki etkinlikleri harita üzerinde görmek
    - Konum tabanlı arama

4. **Eşleşme Sekmesi**:
    - Senin gibi düşünen gönüllülerle eşleşmek
    - Uyumlu kişilerle bağlantı kurmak

5. **Profil Sekmesi**:
    - Kendi bilgilerini görmek/düzenlemek
    - Başarıları görmek
    - Ayarları değiştirmek

---

## 7️⃣ SORUN GIDERME

### Sorun 1: "Admin Paneli Görünmüyor"

**Neden?**

- Kullanıcı role'ü ADMIN değil
- Cache sorun
- Oturum kapandı

**Çözüm:**

```bash
# Terminal:
cd ~/Mutluet/backend
npx prisma studio

# Prisma Studio açılır (http://localhost:5555)
# User tablosunda admin kullanıcıyı aç
# role: ADMIN olduğundan emin ol
# Çıkış yap ve tekrar giriş yap
```

### Sorun 2: "Database Bağlantı Hatası"

**Hata:**

```
Error: could not connect to server
```

**Neden?**

- PostgreSQL çalışmıyor
- Connection string yanlış

**Çözüm:**

```bash
# PostgreSQL'i başlat
brew services start postgresql@16

# Kontrol et
brew services list

# Connection string'i kontrol et
cat ~/Mutluet/backend/.env
```

### Sorun 3: "Frontend Açılmıyor"

**Hata:**

```
ERR_CONNECTION_REFUSED
```

**Neden?**

- Frontend server çalışmıyor
- Port 5173 kullanımda

**Çözüm:**

```bash
# Port temizle
lsof -ti:5173 | xargs kill -9

# Frontend restart
cd ~/Mutluet
pnpm dev
```

### Sorun 4: "Vercel Deploy Hatası"

**Hata:**

```
Build failed
```

**Neden?**

- Environment variable eksik
- Dependency problemi
- Build komutu yanlış

**Çözüm:**

```bash
# Yerel olarak derle
cd ~/Mutluet
pnpm build

# Hataları oku
# Sonra Vercel'de environment variables kontrol et
```

### Sorun 5: "Domain Çalışmıyor"

**Hata:**

```
mutluet.bitebimuv.org açılmıyor
```

**Neden?**

- DNS henüz propagate olmadı
- CNAME kaydı yanlış
- SSL certificate hazır değil

**Çözüm:**

```bash
# DNS'i kontrol et
nslookup mutluet.bitebimuv.org

# Propagation kontrolü
dig mutluet.bitebimuv.org

# 5-30 dakika bekle
# Sonra tekrar dene
```

---

## 📋 KONTROL LİSTESİ

Başarıyla completion için kontrol et:

### Yerel Kurulum

- [ ] PostgreSQL çalışıyor
- [ ] Backend çalışıyor (http://localhost:3001)
- [ ] Frontend çalışıyor (http://localhost:5173)
- [ ] Admin kullanıcı oluşturuldu

### Testler

- [ ] Kayıt/Giriş çalışıyor
- [ ] Ana sayfa açılıyor
- [ ] Admin paneli erişilebiliyor
- [ ] Etkinlik oluşturulabiliyor

### Supabase Database

- [ ] Supabase hesabı oluşturuldu
- [ ] Database oluşturuldu
- [ ] Connection string alındı
- [ ] Migration çalıştırıldı
- [ ] Tablolar oluşturuldu

### Vercel Deployment

- [ ] Vercel hesabı oluşturuldu
- [ ] Backend deployed ✅
- [ ] Frontend deployed ✅
- [ ] Environment variables eklendi
- [ ] Test edildi (Vercel URL)

### Domain

- [ ] DNS kaydı eklendi (CNAME)
- [ ] Domain Vercel'de ekle
- [ ] SSL certificate aktif
- [ ] Domain üzerinde test edildi

### API Keys (Opsiyonel)

- [ ] Google OAuth (Google ile giriş)
- [ ] Stripe (Bağış ödemeleri)
- [ ] Google Maps (Harita)
- [ ] Firebase (Notifications)

---

## 🎉 BAŞARILI DEPLOYMENT İZLERİ

Herşey doğru yapıldıysa:

✅ https://mutluet.bitebimuv.org **açılır**
✅ Kayıt ol/Giriş **çalışır**
✅ Admin paneli **erişilir**
✅ İstatistikler **gösterilir**
✅ Etkinlikler **listelenir**
✅ Backend API **çalışır**
✅ Database **verileri tutar**

---

## 📞 DESTEK VE KAYNAKLAR

**Dosyalar:**

- 📄 `SENİN_YAPMAN_GEREKENLER.md` - Hızlı kurulum
- 📄 `DEPLOYMENT.md` - Detaylı deployment
- 📄 `CREATE_ADMIN_USER.md` - Admin oluşturma
- 📄 `LOKAL_HATA_DUZELT.md` - Lokal sorun giderme
- 📄 `DURUM_RAPORU.md` - Proje durumu

**Dış Linkler:**

- 🔗 https://vercel.com - Deployment
- 🔗 https://supabase.com - Database
- 🔗 https://console.cloud.google.com - API Keys
- 🔗 https://stripe.com - Ödeme

---

## 📝 ÖZETİ

**Yapılacaklar (Sırayla):**

1. ✅ Admin kullanıcı oluştur (Prisma Studio)
2. ✅ Yerel testler (Kayıt/Giriş/Admin Paneli)
3. ✅ Supabase database oluştur
4. ✅ Database migration çalıştır
5. ✅ Backend Vercel'e deploy
6. ✅ Frontend Vercel'e deploy
7. ✅ Domain bağla (mutluet.bitebimuv.org)
8. ✅ API key'leri ekle (opsiyonel)

**Sonuç:**

- Uygulanız internette canlı olur
- Herkese erişilebilir olur
- Admin panelinde yönetim yapabilirsiniz

**Zaman:** ~3-4 saat
**Maliyet:** Sıfır (Supabase + Vercel ücretsiz)

---

**Hazırlayan:** GitHub Copilot  
**Tarih:** 8 Mart 2026  
**Versiyon:** 1.0

✅ **BAŞARILI DEPLOYMENT DILERIM!** 🚀

