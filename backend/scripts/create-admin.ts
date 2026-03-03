import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Önce varsa sil
  await prisma.user.deleteMany({
    where: { email: 'admin@mutluet.org' }
  });

  // Admin oluştur
  const admin = await prisma.user.create({
    data: {
      email: 'admin@mutluet.org',
      name: 'Admin Kullanıcısı',
      password: '$2a$10$kFUKauCV/r2mEIfkSR5V4uScjvrGKFJ225LXA5outQwbbweY7GF3.',
      role: 'ADMIN',
      authProvider: 'EMAIL',
      emailVerified: true,
      bio: 'Mutluet Platformu Yöneticisi',
      location: 'Türkiye',
      totalDonations: 0,
      volunteerHours: 0,
      eventsAttended: 0,
      engagementScore: 100,
      matchingEnabled: false,
    }
  });

  console.log('✅ Admin kullanıcısı oluşturuldu!');
  console.log('Email: admin@mutluet.org');
  console.log('Şifre: Antakya_123');
  console.log('ID:', admin.id);
}

main()
  .catch((e) => {
    console.error('❌ Hata:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
