import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

async function main() {
  const email = 'admin@mutluet.org';
  const password = 'MutluEt2026!';
  const name = 'Ömer Faruk Kural';

  const hashedPassword = await bcrypt.hash(password, 12);

  // Upsert: varsa güncelle, yoksa oluştur
  const admin = await prisma.user.upsert({
    where: { email },
    update: {
      role: 'ADMIN',
      name,
      password: hashedPassword,
    },
    create: {
      email,
      password: hashedPassword,
      name,
      role: 'ADMIN',
      authProvider: 'EMAIL',
      emailVerified: true,
      bio: 'Mutluet Platform Yöneticisi - Bir Tebessüm Bin Mutluluk Derneği',
      location: 'Hatay, Türkiye',
      interests: ['yönetim', 'sosyal sorumluluk', 'eğitim', 'teknoloji'],
      engagementScore: 100,
      matchingEnabled: false,
    }
  });

  console.log('✅ Admin kullanıcısı oluşturuldu/güncellendi!');
  console.log(`📧 Email: ${email}`);
  console.log(`🔑 Şifre: ${password}`);
  console.log(`👤 İsim: ${admin.name}`);
  console.log(`🛡️  Rol: ${admin.role}`);
  console.log(`🆔 ID: ${admin.id}`);
  console.log('\n⚠️  ÖNEMLİ: Production\'da şifrenizi hemen değiştirin!');
}

main()
  .catch((e) => {
    console.error('❌ Hata:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
