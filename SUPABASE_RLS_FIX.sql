-- 🛡️ SUPABASE RLS (ROW LEVEL SECURITY) DÜZELTME SCRIPT'I
-- Bu script'i Supabase SQL Editor'de çalıştırarak happiness_events tablosuna erişim yetkilerini düzeltebilirsiniz.

-- 1. RLS'i Aktifleştir (Eğer kapalıysa)
ALTER TABLE happiness_events ENABLE ROW LEVEL SECURITY;

-- 2. Mevcut hatalı politikaları temizle (opsiyonel)
DROP POLICY IF EXISTS "Enable read access for all users" ON happiness_events;
DROP POLICY IF EXISTS "Enable insert access for all users" ON happiness_events;
DROP POLICY IF EXISTS "Authenticated users can insert" ON happiness_events;

-- 3. OKUMA YETKİSİ: Herkes tüm kayıtları görebilsin
CREATE POLICY "Enable read access for all users" 
ON happiness_events FOR SELECT 
USING (true);

-- 4. YAZMA YETKİSİ: Sadece giriş yapmış (authenticated) kullanıcılar yeni kayıt ekleyebilsin
CREATE POLICY "Authenticated users can insert" 
ON happiness_events FOR INSERT 
TO authenticated 
WITH CHECK (true);

-- 5. GÜNCELLEME YETKİSİ: Kullanıcılar sadece kendi ekledikleri kayıtları güncelleyebilsin (Eğer user_id kolonu varsa)
-- Not: Eğer tabloda user_id kolonu yoksa bu adımı atlayabilirsiniz.
-- CREATE POLICY "Users can update their own events" 
-- ON happiness_events FOR UPDATE 
-- TO authenticated 
-- USING (auth.uid() = user_id);

-- ✅ İşlem tamam! Şimdi uygulamadan kayıt eklemeyi tekrar deneyebilirsiniz.
