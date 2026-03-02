# 📱 MUTLUET UYGULAMASI - TAM KULLANIM REHBERİ

## 🎯 ŞU AN DURUM

### ✅ ÇALIŞAN SERVİSLER
1. **Backend Server** - `http://localhost:3001` 🟢 ÇALIŞIYOR
2. **Frontend App** - `http://localhost:5173` 🟢 ÇALIŞIYOR
3. **PostgreSQL Database** - Port 5432 🟢 ÇALIŞIYOR
4. **GitHub Repository** - https://github.com/omerfarukkural/Mutluet ✅

---

## 📍 NEREDE NE VAR?

### 1️⃣ UYGULAMAYI KULLANMAK İÇİN
**Tarayıcıda aç:** `http://localhost:5173`

Bu adres sana **frontend** uygulamasını gösterir. Buradan:
- Kayıt olabilirsin
- Giriş yapabilirsin
- Ana sayfayı görebilirsin
- Tüm özellikleri kullanabilirsin

### 2️⃣ DATABASE'İ GÖRMEK İÇİN
**Terminal'de çalıştır:**
```bash
cd ~/Mutluet/backend
npx prisma studio
```

Bu komut tarayıcıda `http://localhost:5555` adresini açar.
Burada:
- Kullanıcıları görebilirsin
- Etkinlikleri ekleyebilirsin
- Bağışları görebilirsin
- Tüm verileri düzenleyebilirsin

### 3️⃣ API'YI TEST ETMEK İÇİN
**Tarayıcıda aç:** `http://localhost:3001/health`

Şunu göreceksin:
```json
{"status":"ok","timestamp":"2026-03-02T..."}
```

Bu, backend'in çalıştığını gösterir.

### 4️⃣ KODLARI GÖRMEK İÇİN
**Klasör:** `/Users/omerfarukkural/Mutluet`

- `backend/` - Sunucu kodu (Node.js)
- `src/` - Uygulama arayüzü (React)
- `backend/prisma/` - Database şeması

---

## 🎮 UYGULAMAYI NASIL KULLANIRSIN?

### ADIM 1: Tarayıcıda Aç
```
http://localhost:5173
```

### ADIM 2: İlk Ekranlar
1. **Onboarding** - 3 tanıtım ekranı göreceksin
   - "Hoş Geldiniz"
   - "Bağış Yapın"
   - "Etkinliklere Katılın"
2. **Atla** veya **Devam** butonlarıyla geçebilirsin

### ADIM 3: Kayıt Ol
Login sayfasında:
1. **"Hesabınız yok mu? Kayıt olun"** tıkla
2. Bilgilerini gir:
   - **Ad Soyad:** İstediğin isim
   - **E-posta:** test@example.com (veya herhangi bir email)
   - **Şifre:** password123 (veya istediğin şifre)
3. **Kayıt Ol** butonuna tıkla
4. ✅ Otomatik olarak **Ana Sayfa**'ya yönlendirileceksin!

### ADIM 4: Ana Sayfayı Keşfet
Ana sayfada göreceklerin:

#### 📊 İstatistikler (Üstte)
- **Bağışlar:** Yaptığın toplam bağış (başta ₺0)
- **Gönüllülük:** Toplam gönüllülük saatlerin (başta 0 saat)
- **Etkinlikler:** Katıldığın etkinlik sayısı (başta 0)
- **Etkileşim:** Toplam etkileşim puanın (başta 0)

#### 🎮 Özellikler (4 renkli kart)
1. **Oyun Oyna** (Mor) - Oyunlar sayfasına gider
2. **Eşleş** (Pembe) - Benzer gönüllülerle eşleşme
3. **Sohbet** (Mavi) - Mesajlaşma sayfası
4. **Keşfet** (Yeşil) - Harita ve yakındaki yerler

#### 🎯 Günün Görevi
- Günlük hedefini gösterir
- Tamamladıkça progress bar dolar
- Puan kazanırsın

#### ⭐ Başarılar
4 kutucuk göreceksin:
- 🎁 **İlk Bağış** (ilk bağışta açılır)
- ⭐ **Gönüllü Yıldız** (10 saat gönüllülükte açılır)
- 🦋 **Sosyal Kelebek** (5 etkinliğe katılınca açılır)
- ⏰ **100 Saat** (100 saat gönüllülükte açılır)

#### 📅 Yaklaşan Etkinlikler
Etkinlik listesi göreceksin (başta boş olabilir).

### ADIM 5: Diğer Sayfalar
**Alt menüden gezinebilirsin:**
- 🏠 **Ana Sayfa** - Dashboard
- 🏷️ **Kategoriler** - Bağış türleri (Eğitim, Gıda, vb.)
- 🗺️ **Harita** - Yakındaki yerler
- 💕 **Eşleşme** - Gönüllü eşleştirme
- 👤 **Profil** - Kendi profilin

---

## 🛠️ DATABASE'E VERİ EKLEMEK

Şu an database boş. Test verisi eklemek için:

### Prisma Studio'yu Aç
```bash
cd ~/Mutluet/backend
npx prisma studio
```

Tarayıcıda `http://localhost:5555` açılacak.

### Örnek Etkinlik Ekle

1. Sol menüden **"Event"** tıkla
2. **"Add Record"** butonuna tıkla
3. Şu bilgileri gir:
   ```
   title: Kitap Bağışı Kampanyası
   description: Çocuklar için kitap topluyoruz
   category: EGITIM
   date: 2026-03-15 (gelecek bir tarih seç)
   time: 14:00
   location: Merkez Kütüphane
   currentParticipants: 5
   ```
4. **Save 1 Change** tıkla
5. ✅ Frontend'i yenile - Ana sayfada görünecek!

### Örnek Organization Ekle

1. Sol menüden **"Organization"** tıkla
2. **"Add Record"** tıkla
3. Bilgileri gir:
   ```
   name: AFAD İstanbul
   description: Afet ve Acil Durum Yönetimi
   category: Acil Yardım
   address: İstanbul, Kadıköy
   latitude: 40.9922
   longitude: 29.0261
   verified: true
   ```
4. **Save 1 Change** tıkla

---

## 💻 SERVİSLERİ YÖNETMEK

### Servisleri Başlatmak

İki terminal aç:

**Terminal 1 (Backend):**
```bash
cd ~/Mutluet/backend
pnpm dev
```

**Terminal 2 (Frontend):**
```bash
cd ~/Mutluet
pnpm dev
```

### Servisleri Durdurmak

Her iki terminalde de:
- **Mac/Linux:** `Ctrl + C`

### PostgreSQL'i Kontrol Etmek

```bash
# PostgreSQL çalışıyor mu?
brew services list | grep postgresql

# Başlat
brew services start postgresql@16

# Durdur
brew services stop postgresql@16
```

---

## 🌐 İNTERNETTEN ERİŞİM (Henüz Yok)

Şu an uygulama **sadece senin bilgisayarında** çalışıyor.

İnternetten erişmek için **deployment** yapman gerekiyor:

### Seçenek 1: Vercel (Frontend)
1. https://vercel.com'a git
2. GitHub hesabınla giriş yap
3. "Import Project" tıkla
4. `omerfarukkural/Mutluet` repository'sini seç
5. Deploy et
6. ✅ URL alacaksın: `https://mutluet.vercel.app`

### Seçenek 2: Azure (Full Stack)
1. Azure Portal'a git (2000$ kredin var)
2. "Create Resource" > "Web App"
3. Frontend ve Backend deploy et
4. Azure SQL Database oluştur

**Ben bunu senin için yapabilir miyim?** (Aşağıda yapacağım)

---

## 📱 MOBIL UYGULAMA YOK

Şu an sadece **web uygulaması** var.

Mobil uygulama yapmak için:
1. **React Native** ile yeniden yazman gerekir
2. Veya **Capacitor** ile mevcut web uygulamasını paketleyebilirsin

---

## 🔐 API KEYLERİ EKLEMEK

Bazı özellikler API key istiyor:

### Google Login Aktif Etmek

1. https://console.cloud.google.com'a git
2. Yeni proje oluştur
3. "APIs & Services" > "Credentials"
4. "OAuth 2.0 Client ID" oluştur
5. Aldığın ID ve Secret'ı backend `.env`'e ekle:

```bash
nano ~/Mutluet/backend/.env
```

Ekle:
```
GOOGLE_CLIENT_ID=senin-client-id
GOOGLE_CLIENT_SECRET=senin-secret
```

Backend'i yeniden başlat.

### Facebook Login İçin
1. https://developers.facebook.com
2. Uygulama oluştur
3. App ID ve Secret al
4. `.env`'e ekle

### Stripe (Bağış Ödemesi) İçin
1. https://stripe.com/tr hesabı aç
2. Dashboard'dan API keys al
3. `.env`'e ekle

---

## 🚨 SORUN GİDERME

### "Backend bağlanamıyor" Hatası

**Kontrol et:**
```bash
# Backend çalışıyor mu?
curl http://localhost:3001/health

# Çıktı: {"status":"ok",...} görmelisin
```

**Çözüm:**
```bash
cd ~/Mutluet/backend
pnpm dev
```

### "Database error" Hatası

**Kontrol et:**
```bash
# PostgreSQL çalışıyor mu?
brew services list | grep postgresql
```

**Çözüm:**
```bash
brew services start postgresql@16
```

### "Port already in use" Hatası

**Port'u boşalt:**
```bash
# Backend (3001)
lsof -ti:3001 | xargs kill -9

# Frontend (5173)
lsof -ti:5173 | xargs kill -9
```

### Frontend beyaz sayfa gösteriyor

**Console'a bak:**
- Tarayıcıda `F12` bas
- "Console" tabına git
- Hataları gör

**Çözüm:**
```bash
cd ~/Mutluet
pnpm install
pnpm dev
```

---

## 📊 ÖZET

### Ne Çalışıyor? ✅
- ✅ Kayıt/Giriş (email + şifre)
- ✅ Ana sayfa (istatistikler, özellikler)
- ✅ Profil sayfası
- ✅ Kategoriler sayfası
- ✅ Tüm navigasyon
- ✅ Backend API'leri
- ✅ Database bağlantısı

### Ne Henüz Çalışmıyor? ⏳
- ⏳ Google/Facebook/TikTok girişi (API key gerekli)
- ⏳ Bağış ödeme sistemi (Stripe gerekli)
- ⏳ Video görüşme (Azure gerekli)
- ⏳ Harita özellikleri (Google Maps key gerekli)
- ⏳ İnternetten erişim (Deployment gerekli)

### Nerede Barındırılıyor? 📍
- 🏠 **Şu an:** Sadece senin bilgisayarında (`localhost`)
- 🌐 **GitHub:** Kod burada: https://github.com/omerfarukkural/Mutluet
- ☁️ **İnternet:** Henüz yok (aşağıda yapacağım)

---

## 🎓 HİÇ KODLAMA BİLMİYORSAN

### Sadece Kullanmak İstiyorsan:
1. Terminal 1'de: `cd ~/Mutluet/backend && pnpm dev`
2. Terminal 2'de: `cd ~/Mutluet && pnpm dev`
3. Tarayıcıda: `http://localhost:5173`
4. Kullan! 🎉

### Düzenlemek İstiyorsan:
1. **Visual Studio Code** aç
2. `File > Open Folder` > `Mutluet` klasörünü seç
3. Solda dosyaları göreceksin
4. Düzenle, kaydet
5. Tarayıcıda otomatik yenilenir

### Deploy Etmek İstiyorsan:
**Benim için yapacağım!** ⬇️ Aşağıda...

---

**Bu rehberi `KULLANIM_REHBERI.md` dosyasına kaydettim.**
**Sorularını sorabilirsin!** 🚀
