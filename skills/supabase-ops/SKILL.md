# supabase-ops

Supabase veritabanı ve Prisma ORM işlemlerini yönetir.

TRIGGER: "supabase işlemi", "veritabanı migration", "prisma migrate", "db schema güncelle", "supabase edge function", "tablo oluştur", "prisma studio", "veritabanı seed", "supabase bucket", "supabase auth"

## Görev
Supabase ve Prisma işlemlerini gerçekleştirir, veritabanı şemasını yönetir.

## Gerekli Ortam Değişkenleri
```
DATABASE_URL              # postgresql://postgres:...@db.xxx.supabase.co:5432/postgres
VITE_SUPABASE_URL         # https://xxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY # eyJ...
SUPABASE_ANON_KEY         # eyJ...
```

## Sık Kullanılan Komutlar
```bash
# Prisma Migration oluştur (şema değişikliği sonrası)
cd backend && npx prisma migrate dev --name [migration-adi]

# Şemayı doğrudan uygula (migration dosyası olmadan)
cd backend && npx prisma db push

# Prisma client'ı yeniden oluştur
cd backend && npx prisma generate

# Prisma Studio'yu aç (görsel DB yönetimi)
cd backend && npx prisma studio

# Seed data yükle
cd backend && npx prisma db seed

# Migration durumunu kontrol et
cd backend && npx prisma migrate status

# Production migration (dikkatli kullan!)
cd backend && npx prisma migrate deploy

# Şema doğrulama
cd backend && npx prisma validate
```

## MCP ile Supabase İşlemleri (Önerilen)
```
mcp__supabase__list_tables          # Tabloları listele
mcp__supabase__execute_sql          # SQL çalıştır
mcp__supabase__list_edge_functions  # Edge function'ları listele
mcp__supabase__deploy_edge_function # Edge function deploy et
mcp__supabase__get_logs             # Logları görüntüle
```

## Prisma Şeması Örnek Güncelleme
```prisma
// backend/prisma/schema.prisma
model YeniModel {
  id        String   @id @default(cuid())
  isim      String
  olusturma DateTime @default(now())
  guncelleme DateTime @updatedAt

  @@map("yeni_model")
}
```

## Supabase Edge Functions
```bash
# Supabase CLI kurulumu
npm install -g supabase

# Login
supabase login

# Yeni edge function oluştur
supabase functions new bildirim-gonder

# Edge function deploy
supabase functions deploy bildirim-gonder

# Logları görüntüle
supabase functions logs bildirim-gonder
```

## Supabase Storage (Dosya Yükleme)
```javascript
import { createClient } from '@supabase/supabase-js';
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

// Dosya yükle
const { data, error } = await supabase.storage
  .from('avatarlar')
  .upload('user_id/profil.png', dosyaBuffer, { contentType: 'image/png' });

// Public URL al
const { data: { publicUrl } } = supabase.storage.from('avatarlar').getPublicUrl('user_id/profil.png');
```

## Supabase Row Level Security (RLS)
```sql
-- Kullanıcı sadece kendi verilerini görebilir
ALTER TABLE kullaniciler ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Kullanici kendi verisini gorur"
  ON kullaniciler FOR SELECT
  USING (auth.uid()::text = kullanici_id);
```

## Hata Yönetimi
- Bağlantı hatası → DATABASE_URL'yi kontrol et, Supabase IP allow list'ini güncelle
- Migration hatası → `cd backend && npx prisma migrate reset` (DEV ortamında)
- Şema senkron hatası → `cd backend && npx prisma db pull` (DB'den şema çek)
