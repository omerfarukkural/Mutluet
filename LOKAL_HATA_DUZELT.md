# 🔧 Lokal Hatalar ve Çözümler

## ❌ Sorun 1: `/happiness` Sayfasında Kayıt Eklenmiyor

### Sebep: Supabase RLS (Row Level Security) Aktif

Supabase'de `happiness_events` tablosu için RLS politikaları tanımlı değil, bu yüzden kimse veri ekleyemiyor.

### ✅ Çözüm:

1. **Supabase Dashboard'a Git:**
   https://supabase.com/dashboard/project/gzeebhkogwmnmefapebo/editor/17494

2. **Table Editor'de `happiness_events` tablosunu seç**

3. **Sağ üstte "RLS disabled" uyarısı var. Şu seçeneklerden birini yap:**

#### Seçenek A: RLS'i Kapat (Hızlı Test İçin) ⚡
```sql
-- SQL Editor'e git ve çalıştır:
ALTER TABLE happiness_events DISABLE ROW LEVEL SECURITY;
```

#### Seçenek B: Public Access Politikası Ekle (Önerilen) ✅
```sql
-- SQL Editor'e git ve çalıştır:

-- RLS'i aktifleştir
ALTER TABLE happiness_events ENABLE ROW LEVEL SECURITY;

-- Herkesin okuyabilmesi için
CREATE POLICY "Enable read access for all users" 
ON happiness_events FOR SELECT 
USING (true);

-- Herkesin yazabilmesi için (test için)
CREATE POLICY "Enable insert access for all users" 
ON happiness_events FOR INSERT 
WITH CHECK (true);
```

#### Seçenek C: Authenticated Users Only (Production İçin) 🔒
```sql
-- RLS'i aktifleştir
ALTER TABLE happiness_events ENABLE ROW LEVEL SECURITY;

-- Sadece login olmuş kullanıcılar okuyabilir
CREATE POLICY "Authenticated users can read" 
ON happiness_events FOR SELECT 
TO authenticated 
USING (true);

-- Sadece login olmuş kullanıcılar ekleyebilir
CREATE POLICY "Authenticated users can insert" 
ON happiness_events FOR INSERT 
TO authenticated 
WITH CHECK (true);
```

### Test Et:
```bash
# Browser'da aç:
http://localhost:5173/happiness

# Kayıt ekle ve başarı mesajı gör!
```

---

## ❌ Sorun 2: `/admin` Sayfası Açılmıyor

### Olası Sebepler:

#### 1. Admin User Login Olmamış
**Çözüm:** Önce login ol:
```
http://localhost:5173/login
Email: admin@mutluet.org
Şifre: Antakya_123
```

#### 2. Console'da Hata Var
**Kontrol Et:**
1. Browser'da F12 bas
2. Console sekmesini aç
3. Kırmızı hataları kontrol et

Olası hatalar:
- `Cannot find module` → Import path yanlış
- `undefined is not a function` → Component import hatası
- `Network error` → Backend bağlanamıyor

#### 3. Backend Çalışmıyor
**Kontrol Et:**
```bash
curl http://localhost:3001/api/events
# Boş array [] dönmeli
```

Çalışmıyorsa:
```bash
cd ~/Mutluet/backend
npx tsx watch src/index.ts
```

### Manuel Test:
```bash
# Admin kullanıcısını kontrol et:
cd ~/Mutluet/backend
npx tsx -e "
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
prisma.user.findUnique({ where: { email: 'admin@mutluet.org' } })
  .then(user => console.log('Admin:', user))
  .finally(() => prisma.\$disconnect());
"
```

---

## 🐛 Genel Debug Komutları

### Frontend Loglarını İzle:
```bash
cd ~/Mutluet
pnpm dev
# Console'u izle
```

### Backend Loglarını İzle:
```bash
cd ~/Mutluet/backend
npx tsx watch src/index.ts
# API çağrılarını göreceksin
```

### Supabase Bağlantısını Test Et:
```bash
cd ~/Mutluet
node -e "
import('$HOME/Mutluet/src/lib/supabase.ts').then(({ supabase }) => {
  supabase.from('happiness_events').select('*').then(console.log);
});
"
```

---

## 📝 Hatayı Bulma Checklist

- [ ] Browser Console (F12) kontrol ettim
- [ ] Backend server çalışıyor (port 3001)
- [ ] Frontend server çalışıyor (port 5173)
- [ ] Supabase RLS politikaları tanımlı
- [ ] Environment variables doğru (.env)
- [ ] Admin user login olmuş
- [ ] Network tab'de API çağrıları başarılı

---

## 💡 Hızlı Fix Script

Tüm servisleri yeniden başlat:
```bash
# Terminal 1: Backend
cd ~/Mutluet/backend
pkill -f "npx tsx"
npx tsx watch src/index.ts

# Terminal 2: Frontend
cd ~/Mutluet
pkill -f "vite"
pnpm dev
```

Tarayıcı cache'ini temizle:
```
Cmd + Shift + R (Mac)
Ctrl + Shift + R (Windows)
```

---

Hala çalışmıyorsa, bana:
1. Browser console'daki tam hata mesajını
2. Backend terminal output'unu
3. Hangi sayfada sorun olduğunu
gönder!
