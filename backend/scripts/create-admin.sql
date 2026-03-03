-- Admin kullanıcısı oluşturma scripti
-- Çalıştırmak için: psql -d mutluet -f scripts/create-admin.sql

-- Önce aynı email ile kullanıcı varsa sil
DELETE FROM "User" WHERE email = 'admin@mutluet.org';

-- Admin kullanıcısı oluştur
INSERT INTO "User" (
  id,
  email,
  name,
  password,
  role,
  "authProvider",
  "emailVerified",
  bio,
  location,
  "totalDonations",
  "volunteerHours",
  "eventsAttended",
  "engagementScore",
  "matchingEnabled",
  "createdAt",
  "updatedAt"
) VALUES (
  gen_random_uuid(),
  'admin@mutluet.org',
  'Admin Kullanıcısı',
  '$2a$10$kFUKauCV/r2mEIfkSR5V4uScjvrGKFJ225LXA5outQwbbweY7GF3.',
  'ADMIN',
  'EMAIL',
  true,
  'Mutluet Platformu Yöneticisi',
  'Türkiye',
  0,
  0,
  0,
  100,
  false,
  NOW(),
  NOW()
);

-- Başarı mesajı
SELECT 'Admin kullanıcısı başarıyla oluşturuldu!' AS mesaj;
SELECT
  'Email: admin@mutluet.org' AS bilgi1,
  'Şifre: Antakya_123' AS bilgi2,
  'Rol: ADMIN' AS bilgi3;
