import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seed başlıyor...');

  // Admin kullanıcı
  const adminPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@mutluet.org' },
    update: {},
    create: {
      email: 'admin@mutluet.org',
      password: adminPassword,
      name: 'Mutluet Admin',
      role: 'ADMIN',
      authProvider: 'EMAIL',
      emailVerified: true,
      bio: 'Platform yöneticisi',
    },
  });
  console.log('✅ Admin:', admin.email);

  // Test kullanıcısı
  const userPassword = await bcrypt.hash('test123', 10);
  const testUser = await prisma.user.upsert({
    where: { email: 'test@mutluet.org' },
    update: {},
    create: {
      email: 'test@mutluet.org',
      password: userPassword,
      name: 'Test Kullanıcı',
      role: 'VOLUNTEER',
      authProvider: 'EMAIL',
      emailVerified: true,
      bio: 'Gönüllü kullanıcı',
      location: 'İstanbul',
      interests: ['eğitim', 'çevre', 'sağlık'],
      totalDonations: 250,
      volunteerHours: 12,
      eventsAttended: 3,
    },
  });
  console.log('✅ Test kullanıcı:', testUser.email);

  // Kuruluşlar
  const orgs = [
    { name: 'TÜRKÇED', description: 'Türkiye Çevre Eğitim Derneği', category: 'EGITIM', address: 'Kadıköy, İstanbul', latitude: 40.9916, longitude: 29.0233 },
    { name: 'İstanbul Gönüllüleri', description: 'Şehir bazlı gönüllülük platformu', category: 'SOSYAL', address: 'Beyoğlu, İstanbul', latitude: 41.0335, longitude: 28.9773 },
    { name: 'Yemek Paylaş', description: 'Gıda israfını önleme derneği', category: 'GIDA', address: 'Şişli, İstanbul', latitude: 41.0602, longitude: 28.9877 },
    { name: 'Barınak Destek', description: 'Evsizlere barınak ve destek', category: 'BARINMA', address: 'Fatih, İstanbul', latitude: 41.0136, longitude: 28.9550 },
    { name: 'Sağlık Gönüllüleri', description: 'Ücretsiz sağlık hizmeti', category: 'SAGLIK', address: 'Üsküdar, İstanbul', latitude: 41.0228, longitude: 29.0150 },
  ];

  for (const org of orgs) {
    await prisma.organization.upsert({
      where: { id: (await prisma.organization.findFirst({ where: { name: org.name } }))?.id || 'new' },
      update: {},
      create: { ...org, verified: true },
    });
  }
  console.log('✅ Kuruluşlar oluşturuldu');

  // Etkinlikler
  const events = [
    {
      title: 'Sahil Temizliği',
      description: 'Kadıköy sahilinde çevre temizliği etkinliği. Eldiven ve torba sağlanacak.',
      category: 'SOSYAL' as const,
      date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      time: '09:00',
      location: 'Kadıköy Sahili, İstanbul',
      latitude: 40.9840,
      longitude: 29.0287,
      maxParticipants: 50,
    },
    {
      title: 'Çocuklara Okuma Saati',
      description: 'Haftasonu çocuklara kitap okuma ve hikaye anlatma etkinliği.',
      category: 'EGITIM' as const,
      date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      time: '14:00',
      location: 'Üsküdar Kütüphanesi, İstanbul',
      latitude: 41.0228,
      longitude: 29.0150,
      maxParticipants: 20,
    },
    {
      title: 'Gıda Bankası Dağıtımı',
      description: 'İhtiyaç sahiplerine gıda paketi dağıtımı. Yardımcı gönüllüler aranıyor.',
      category: 'GIDA' as const,
      date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      time: '10:00',
      location: 'Fatih, İstanbul',
      latitude: 41.0136,
      longitude: 28.9550,
      maxParticipants: 30,
    },
    {
      title: 'Ücretsiz Sağlık Taraması',
      description: 'Kan basıncı, şeker ve kolesterol ölçümü. Herkes katılabilir.',
      category: 'SAGLIK' as const,
      date: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
      time: '08:30',
      location: 'Şişli, İstanbul',
      latitude: 41.0602,
      longitude: 28.9877,
      maxParticipants: 100,
    },
  ];

  for (const event of events) {
    await prisma.event.create({ data: event }).catch(() => {});
  }
  console.log('✅ Etkinlikler oluşturuldu');

  // Başarımlar
  const achievements = [
    { name: 'İlk Bağış', description: 'İlk bağışını yaptın', icon: '💰', requirement: { type: 'donation', count: 1 } },
    { name: 'Gönüllü Başlangıç', description: 'İlk etkinliğe katıldın', icon: '🌟', requirement: { type: 'event', count: 1 } },
    { name: 'Sosyal Kelebek', description: '5 eşleşme yaptın', icon: '🦋', requirement: { type: 'match', count: 5 } },
    { name: 'Yardımsever', description: '10 saat gönüllülük yaptın', icon: '❤️', requirement: { type: 'hours', count: 10 } },
  ];

  for (const ach of achievements) {
    await prisma.achievement.create({ data: ach }).catch(() => {});
  }
  console.log('✅ Başarımlar oluşturuldu');

  // Örnek bağışlar
  await prisma.donation.createMany({
    data: [
      { userId: testUser.id, amount: 100, type: 'EGITIM', description: 'Eğitim malzemesi' },
      { userId: testUser.id, amount: 150, type: 'GIDA', description: 'Gıda yardımı' },
    ],
    skipDuplicates: true,
  });
  console.log('✅ Örnek bağışlar oluşturuldu');

  console.log('\n🎉 Seed tamamlandı!');
  console.log('📧 Admin: admin@mutluet.org / admin123');
  console.log('📧 Test:  test@mutluet.org  / test123');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
