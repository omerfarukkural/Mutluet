# 🔐 ADMIN KULLANICISI OLUŞTURMA

## Yöntem 1: Prisma Studio ile (EN KOLAY)

1. **Prisma Studio'yu aç:**
   ```bash
   cd ~/Mutluet/backend
   npx prisma studio
   ```

2. **Tarayıcıda `http://localhost:5555` açılacak**

3. **Sol menüden "User" tıkla**

4. **Sağ üstten "Add Record" butonuna tıkla**

5. **Şu bilgileri gir:**
   ```
   email: admin@mutluet.org
   name: Admin
   password: $2a$10$YourHashedPasswordHere
   role: ADMIN (dropdown'dan seç)
   authProvider: EMAIL
   ```

   **ÖNEMLİ:** Şifre için hash kullanman gerekiyor!

6. **Şifre hash'i almak için:**
   ```bash
   cd ~/Mutluet/backend
   node -e "const bcrypt = require('bcrypt'); bcrypt.hash('admin123', 10).then(hash => console.log(hash));"
   ```

   Çıktıyı kopyala ve `password` alanına yapıştır.

7. **"Save 1 Change" butonuna tıkla**

8. **✅ Admin kullanıcı oluşturuldu!**

---

## Yöntem 2: PostgreSQL ile

```bash
# PostgreSQL'e bağlan
psql -U postgres -d mutluet

# Şifre hash'i oluştur (önce bcrypt ile)
# Örnek: admin123 -> $2a$10$eO4Y8EK.Hn0kR0JC3U.rF.QvXJK5R4R5R5R5R5R5R5R5R5R5R5R5R

# Admin kullanıcı ekle
INSERT INTO "User" (id, email, name, password, role, "authProvider", "createdAt", "updatedAt")
VALUES (
  gen_random_uuid(),
  'admin@mutluet.org',
  'Admin',
  '$2a$10$...',  -- Buraya hash'i koy
  'ADMIN',
  'EMAIL',
  NOW(),
  NOW()
);
```

---

## Yöntem 3: Kayıt Ol Sayfasından + Sonra Role Değiştir

1. **Normal kayıt ol:**
   - http://localhost:5173/login
   - Email: admin@mutluet.org
   - Şifre: admin123
   - "Kayıt Ol" tıkla

2. **Prisma Studio'da role değiştir:**
   ```bash
   npx prisma studio
   ```
   - User tablosunda kaydı bul
   - Role'ü "ADMIN" yap
   - Save

3. **Çıkış yap ve tekrar giriş yap**

4. **✅ Artık admin paneline erişebilirsin!**

---

## Admin Paneline Erişim

1. **http://localhost:5173/login adresinden giriş yap**
   - Email: admin@mutluet.org
   - Şifre: admin123 (veya belirlediğin şifre)

2. **Profil sayfasına git** (`http://localhost:5173/profile`)

3. **"Admin Paneli" kartını göreceksin** (mor/pembe gradient)

4. **Tıkla ve admin paneline git** (`http://localhost:5173/admin`)

5. **Admin panelinde göreceklerin:**
   - Toplam kullanıcı sayısı
   - Aktif kullanıcı sayısı
   - Toplam bağış miktarı
   - Toplam etkinlik sayısı
   - Son kayıtlar listesi
   - Yaklaşan etkinlikler
   - Son bağışlar
   - Hızlı işlemler (Prisma Studio, Backend Status, vb.)

---

## Güvenlik Notları

**Production'da:**
- ❌ ASLA `admin123` gibi basit şifreler kullanma
- ✅ Güçlü şifre kullan (en az 12 karakter, büyük/küçük harf, rakam, özel karakter)
- ✅ 2FA (Two-Factor Authentication) ekle
- ✅ Admin email'ini gizli tut
- ✅ Admin paneline IP kısıtlaması koy

**Development'da:**
- ✅ `admin@mutluet.org` / `admin123` kullanabilirsin
- ✅ Test için birden fazla admin oluşturabilirsin

---

## Sorun Giderme

### "Yetkisiz erişim" hatası alıyorum
- ✅ Kullanıcının `role` alanı `ADMIN` olduğundan emin ol (Prisma Studio'da kontrol et)
- ✅ Çıkış yap ve tekrar giriş yap
- ✅ Browser cache'ini temizle

### Admin paneline buton görünmüyor
- ✅ Role kontrolü yapılıyor, `role: ADMIN` olmalı
- ✅ Frontend'i yenile (browser'da F5)
- ✅ Profil sayfasına git: http://localhost:5173/profile

### API hatası alıyorum
- ✅ Backend çalışıyor mu? `curl http://localhost:3001/health`
- ✅ PostgreSQL çalışıyor mu? `brew services list`
- ✅ Token doğru mu? Çıkış yap ve tekrar giriş yap

---

**Oluşturma tarihi:** 2 Mart 2026
**Güncelleme:** Admin paneli tam çalışır durumda
