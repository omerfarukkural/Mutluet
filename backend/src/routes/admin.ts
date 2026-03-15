import { Router } from 'express';
import { authMiddleware, AuthRequest } from '../middleware/auth.js';
import prisma from '../config/database.js';

const router = Router();

// ============================================
// ADMIN MIDDLEWARE - Tüm admin endpoint'lerinde kullanılır
// ============================================
const adminOnly = async (req: AuthRequest, res: any, next: any) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      select: { role: true }
    });
    if (user?.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Yetkisiz erişim. Admin rolü gerekli.' });
    }
    next();
  } catch (error) {
    return res.status(500).json({ error: 'Yetki kontrolü başarısız' });
  }
};

// ============================================
// DASHBOARD İSTATİSTİKLERİ
// ============================================
router.get('/stats', authMiddleware, adminOnly, async (req: AuthRequest, res) => {
  try {
    const [
      totalUsers,
      totalDonations,
      totalEvents,
      totalOrganizations,
      recentUsers,
      donationSum,
      activeVolunteers,
      pendingTeamLeaders
    ] = await Promise.all([
      prisma.user.count(),
      prisma.donation.count(),
      prisma.event.count(),
      prisma.organization.count(),
      prisma.user.count({ where: { createdAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } } }),
      prisma.donation.aggregate({ _sum: { amount: true } }),
      prisma.user.count({ where: { role: 'VOLUNTEER' } }),
      prisma.user.count({ where: { role: 'USER', volunteerHours: { gt: 0 } } }),
    ]);

    res.json({
      totalUsers,
      totalDonations,
      totalEvents,
      totalOrganizations,
      recentUsers,
      totalDonationAmount: donationSum._sum.amount || 0,
      activeVolunteers,
      pendingTeamLeaders,
    });
  } catch (error) {
    console.error('Admin stats error:', error);
    res.status(500).json({ error: 'İstatistikler alınamadı' });
  }
});

// ============================================
// KULLANICI YÖNETİMİ
// ============================================

// Tüm kullanıcıları getir (filtreleme & sayfalama)
router.get('/users', authMiddleware, adminOnly, async (req: AuthRequest, res) => {
  try {
    const { page = '1', limit = '20', search, role, sort = 'createdAt', order = 'desc' } = req.query;
    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);
    const take = parseInt(limit as string);

    const where: any = {};
    if (search) {
      where.OR = [
        { name: { contains: search as string, mode: 'insensitive' } },
        { email: { contains: search as string, mode: 'insensitive' } },
      ];
    }
    if (role) {
      where.role = role as string;
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take,
        orderBy: { [sort as string]: order },
        select: {
          id: true,
          email: true,
          name: true,
          avatar: true,
          role: true,
          authProvider: true,
          emailVerified: true,
          bio: true,
          location: true,
          phone: true,
          interests: true,
          totalDonations: true,
          volunteerHours: true,
          eventsAttended: true,
          engagementScore: true,
          matchingEnabled: true,
          createdAt: true,
          updatedAt: true,
        }
      }),
      prisma.user.count({ where }),
    ]);

    res.json({ users, total, page: parseInt(page as string), totalPages: Math.ceil(total / take) });
  } catch (error) {
    console.error('Admin get users error:', error);
    res.status(500).json({ error: 'Kullanıcılar alınamadı' });
  }
});

// Kullanıcı rolünü güncelle
router.patch('/users/:userId/role', authMiddleware, adminOnly, async (req: AuthRequest, res) => {
  try {
    const userId = req.params.userId as string;
    const { role } = req.body;

    if (!['USER', 'VOLUNTEER', 'ADMIN', 'ORGANIZATION'].includes(role)) {
      return res.status(400).json({ error: 'Geçersiz rol' });
    }

    const user = await prisma.user.update({
      where: { id: userId },
      data: { role },
      select: { id: true, name: true, email: true, role: true }
    });

    res.json({ message: `${user.name} kullanıcısının rolü ${role} olarak güncellendi`, user });
  } catch (error) {
    console.error('Update role error:', error);
    res.status(500).json({ error: 'Rol güncellenemedi' });
  }
});

// Kullanıcı detayı
router.get('/users/:userId', authMiddleware, adminOnly, async (req: AuthRequest, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.params.userId as string },
      include: {
        donations: { orderBy: { createdAt: 'desc' }, take: 10 },
        events: { include: { event: true }, take: 10 },
        achievements: { include: { achievement: true } },
        sentMessages: { take: 5, orderBy: { createdAt: 'desc' } },
      }
    });

    if (!user) return res.status(404).json({ error: 'Kullanıcı bulunamadı' });
    res.json(user);
  } catch (error) {
    console.error('Get user detail error:', error);
    res.status(500).json({ error: 'Kullanıcı detayı alınamadı' });
  }
});

// Kullanıcıyı sil
router.delete('/users/:userId', authMiddleware, adminOnly, async (req: AuthRequest, res) => {
  try {
    const userId = req.params.userId as string;

    // Admin kendini silemez
    if (userId === req.userId) {
      return res.status(400).json({ error: 'Kendinizi silemezsiniz' });
    }

    // Bağlı verileri sil
    await prisma.$transaction([
      prisma.eventParticipant.deleteMany({ where: { userId: userId } }),
      prisma.donation.deleteMany({ where: { userId: userId } }),
      prisma.message.deleteMany({ where: { OR: [{ senderId: userId }, { receiverId: userId }] } }),
      prisma.userAchievement.deleteMany({ where: { userId: userId } }),
      prisma.userChallenge.deleteMany({ where: { userId: userId } }),
      prisma.match.deleteMany({ where: { OR: [{ userId: userId }, { matchedUserId: userId }] } }),
      prisma.user.delete({ where: { id: userId } }),
    ]);

    res.json({ message: 'Kullanıcı silindi' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ error: 'Kullanıcı silinemedi' });
  }
});

// Kullanıcı profilini güncelle (admin olarak)
router.patch('/users/:userId', authMiddleware, adminOnly, async (req: AuthRequest, res) => {
  try {
    const userId = req.params.userId as string;
    const { name, email, bio, location, phone, interests, role, emailVerified } = req.body;

    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(name !== undefined && { name }),
        ...(email !== undefined && { email }),
        ...(bio !== undefined && { bio }),
        ...(location !== undefined && { location }),
        ...(phone !== undefined && { phone }),
        ...(interests !== undefined && { interests }),
        ...(role !== undefined && { role }),
        ...(emailVerified !== undefined && { emailVerified }),
      }
    });

    res.json(user);
  } catch (error) {
    console.error('Admin update user error:', error);
    res.status(500).json({ error: 'Kullanıcı güncellenemedi' });
  }
});

// ============================================
// ETKİNLİK YÖNETİMİ (CRUD)
// ============================================

// Etkinlik oluştur
router.post('/events', authMiddleware, adminOnly, async (req: AuthRequest, res) => {
  try {
    const { title, description, category, date, time, location, latitude, longitude, maxParticipants } = req.body;

    if (!title || !description || !category || !date || !time || !location) {
      return res.status(400).json({ error: 'Zorunlu alanlar eksik: title, description, category, date, time, location' });
    }

    const event = await prisma.event.create({
      data: {
        title,
        description,
        category,
        date: new Date(date),
        time,
        location,
        latitude: latitude || null,
        longitude: longitude || null,
        maxParticipants: maxParticipants || null,
      }
    });

    res.status(201).json(event);
  } catch (error) {
    console.error('Create event error:', error);
    res.status(500).json({ error: 'Etkinlik oluşturulamadı' });
  }
});

// Etkinlik güncelle
router.patch('/events/:eventId', authMiddleware, adminOnly, async (req: AuthRequest, res) => {
  try {
    const eventId = req.params.eventId as string;
    const { title, description, category, date, time, location, latitude, longitude, maxParticipants } = req.body;

    const event = await prisma.event.update({
      where: { id: eventId },
      data: {
        ...(title && { title }),
        ...(description && { description }),
        ...(category && { category }),
        ...(date && { date: new Date(date) }),
        ...(time && { time }),
        ...(location && { location }),
        ...(latitude !== undefined && { latitude }),
        ...(longitude !== undefined && { longitude }),
        ...(maxParticipants !== undefined && { maxParticipants }),
      }
    });

    res.json(event);
  } catch (error) {
    console.error('Update event error:', error);
    res.status(500).json({ error: 'Etkinlik güncellenemedi' });
  }
});

// Etkinlik sil
router.delete('/events/:eventId', authMiddleware, adminOnly, async (req: AuthRequest, res) => {
  try {
    const eventId = req.params.eventId as string;
    await prisma.$transaction([
      prisma.eventParticipant.deleteMany({ where: { eventId: eventId } }),
      prisma.event.delete({ where: { id: eventId } }),
    ]);

    res.json({ message: 'Etkinlik silindi' });
  } catch (error) {
    console.error('Delete event error:', error);
    res.status(500).json({ error: 'Etkinlik silinemedi' });
  }
});

// ============================================
// BAĞIŞ YÖNETİMİ
// ============================================
router.get('/donations', authMiddleware, adminOnly, async (req: AuthRequest, res) => {
  try {
    const { page = '1', limit = '20' } = req.query;
    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);
    const take = parseInt(limit as string);

    const [donations, total] = await Promise.all([
      prisma.donation.findMany({
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        include: { user: { select: { id: true, name: true, email: true } } },
      }),
      prisma.donation.count(),
    ]);

    res.json({ donations, total, page: parseInt(page as string), totalPages: Math.ceil(total / take) });
  } catch (error) {
    console.error('Admin donations error:', error);
    res.status(500).json({ error: 'Bağışlar alınamadı' });
  }
});

// ============================================
// KURULUŞ YÖNETİMİ (CRUD)
// ============================================
router.post('/organizations', authMiddleware, adminOnly, async (req: AuthRequest, res) => {
  try {
    const { name, description, category, address, latitude, longitude, phone, website } = req.body;
    const org = await prisma.organization.create({
      data: { name, description, category, address, latitude, longitude, phone, website }
    });
    res.status(201).json(org);
  } catch (error) {
    console.error('Create org error:', error);
    res.status(500).json({ error: 'Kuruluş oluşturulamadı' });
  }
});

router.patch('/organizations/:orgId', authMiddleware, adminOnly, async (req: AuthRequest, res) => {
  try {
    const orgId = req.params.orgId as string;
    const org = await prisma.organization.update({
      where: { id: orgId },
      data: req.body,
    });
    res.json(org);
  } catch (error) {
    console.error('Update org error:', error);
    res.status(500).json({ error: 'Kuruluş güncellenemedi' });
  }
});

router.delete('/organizations/:orgId', authMiddleware, adminOnly, async (req: AuthRequest, res) => {
  try {
    const orgId = req.params.orgId as string;
    await prisma.organization.delete({ where: { id: orgId } });
    res.json({ message: 'Kuruluş silindi' });
  } catch (error) {
    console.error('Delete org error:', error);
    res.status(500).json({ error: 'Kuruluş silinemedi' });
  }
});

// ============================================
// SİSTEM BİLGİSİ & SAĞLIK KONTROLÜ
// ============================================
router.get('/system', authMiddleware, adminOnly, async (req: AuthRequest, res) => {
  try {
    const uptime = process.uptime();
    const memoryUsage = process.memoryUsage();

    res.json({
      status: 'healthy',
      uptime: Math.floor(uptime),
      uptimeFormatted: `${Math.floor(uptime / 3600)}s ${Math.floor((uptime % 3600) / 60)}d ${Math.floor(uptime % 60)}sn`,
      memory: {
        heapUsed: Math.round(memoryUsage.heapUsed / 1024 / 1024) + ' MB',
        heapTotal: Math.round(memoryUsage.heapTotal / 1024 / 1024) + ' MB',
        rss: Math.round(memoryUsage.rss / 1024 / 1024) + ' MB',
      },
      nodeVersion: process.version,
      environment: process.env.NODE_ENV || 'development',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(500).json({ error: 'Sistem bilgisi alınamadı' });
  }
});

// ============================================
// AI ASISTAN ENDPOINT'İ
// ============================================
router.post('/ai/chat', authMiddleware, adminOnly, async (req: AuthRequest, res) => {
  try {
    const { message, context } = req.body;

    // GitHub Copilot veya OpenAI API'si ile entegrasyon
    const apiKey = process.env.OPENAI_API_KEY || process.env.GITHUB_TOKEN;

    if (!apiKey) {
      // AI olmadan akıllı yanıtlar üret
      const response = generateLocalResponse(message, context);
      return res.json({ response, source: 'local' });
    }

    // OpenAI API çağrısı
    const aiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `Sen Mutluet platformunun AI asistanısın. Platform: Bir Tebessüm Bin Mutluluk Derneği'nin sosyal etki platformu.
Görevlerin:
- Admin paneli üzerinden kod değişiklikleri önerme
- Veritabanı sorgularını çalıştırma
- Hata tespiti ve düzeltme önerileri
- Kullanıcı yönetimi tavsiyeleri
- Etkinlik ve bağış optimizasyonları
Türkçe yanıt ver. Teknik detayları açıkla.`
          },
          { role: 'user', content: message }
        ],
        max_tokens: 2000,
        temperature: 0.7,
      }),
    });

    if (!aiResponse.ok) {
      const response = generateLocalResponse(message, context);
      return res.json({ response, source: 'local' });
    }

    const data = await aiResponse.json() as any;
    res.json({
      response: data.choices[0].message.content,
      source: 'openai',
      usage: data.usage,
    });
  } catch (error) {
    console.error('AI chat error:', error);
    const response = generateLocalResponse(req.body.message, req.body.context);
    res.json({ response, source: 'local-fallback' });
  }
});

// AI: Veritabanı sorgusu çalıştır (salt okunur)
router.post('/ai/query', authMiddleware, adminOnly, async (req: AuthRequest, res) => {
  try {
    const { query } = req.body;

    // Güvenlik: Sadece SELECT sorgularına izin ver
    const normalizedQuery = query.trim().toUpperCase();
    if (!normalizedQuery.startsWith('SELECT')) {
      return res.status(400).json({ error: 'Güvenlik: Sadece SELECT sorguları desteklenir' });
    }

    // Tehlikeli kelimeleri kontrol et
    const forbidden = ['DROP', 'DELETE', 'UPDATE', 'INSERT', 'ALTER', 'TRUNCATE', 'CREATE'];
    for (const word of forbidden) {
      if (normalizedQuery.includes(word)) {
        return res.status(400).json({ error: `Güvenlik: ${word} komutu izin verilmiyor` });
      }
    }

    const result = await prisma.$queryRawUnsafe(query);
    res.json({ result, rowCount: Array.isArray(result) ? result.length : 0 });
  } catch (error: any) {
    console.error('Admin query error:', error);
    res.status(400).json({ error: 'Sorgu hatası: ' + (error.message || 'Bilinmeyen hata') });
  }
});

// ============================================
// GITHUB ENTEGRASYONU
// ============================================
router.post('/github/deploy', authMiddleware, adminOnly, async (req: AuthRequest, res) => {
  try {
    const token = process.env.GITHUB_TOKEN;
    if (!token) {
      return res.status(400).json({
        error: 'GitHub token bulunamadı',
        instructions: 'GITHUB_TOKEN env değişkenini .env dosyasına ekleyin. GitHub Settings > Developer settings > Personal access tokens > Tokens (classic) > Generate new token'
      });
    }

    // GitHub Actions workflow tetikle
    const response = await fetch(
      'https://api.github.com/repos/omerfarukkural/Mutluet/dispatches',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/vnd.github.v3+json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          event_type: 'deploy',
          client_payload: {
            triggeredBy: req.userId,
            timestamp: new Date().toISOString(),
          }
        }),
      }
    );

    if (response.ok || response.status === 204) {
      res.json({ message: 'Deploy tetiklendi! GitHub Actions workflow başlatıldı.' });
    } else {
      const errorData = await response.json().catch(() => ({}));
      res.status(response.status).json({ error: 'GitHub API hatası', details: errorData });
    }
  } catch (error) {
    console.error('GitHub deploy error:', error);
    res.status(500).json({ error: 'Deploy tetiklenemedi' });
  }
});

// GitHub: Repo bilgisini getir
router.get('/github/status', authMiddleware, adminOnly, async (req: AuthRequest, res) => {
  try {
    const token = process.env.GITHUB_TOKEN;
    if (!token) {
      return res.json({
        connected: false,
        message: 'GitHub token yapılandırılmamış'
      });
    }

    const response = await fetch('https://api.github.com/repos/omerfarukkural/Mutluet', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/vnd.github.v3+json',
      },
    });

    if (!response.ok) {
      return res.json({ connected: false, message: 'GitHub API erişim hatası' });
    }

    const repo = await response.json() as any;

    // Son commit bilgisi
    const commitsRes = await fetch('https://api.github.com/repos/omerfarukkural/Mutluet/commits?per_page=5', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/vnd.github.v3+json',
      },
    });
    const commits = await commitsRes.json() as any[];

    res.json({
      connected: true,
      repo: {
        name: repo.full_name,
        description: repo.description,
        defaultBranch: repo.default_branch,
        stars: repo.stargazers_count,
        updatedAt: repo.updated_at,
        url: repo.html_url,
      },
      recentCommits: commits.slice(0, 5).map((c: any) => ({
        sha: c.sha.substring(0, 7),
        message: c.commit.message,
        author: c.commit.author.name,
        date: c.commit.author.date,
      })),
    });
  } catch (error) {
    console.error('GitHub status error:', error);
    res.json({ connected: false, message: 'GitHub bağlantı hatası' });
  }
});

// ============================================
// YEREL AI YANIT ÜRETİCİ (API key olmadan)
// ============================================
function generateLocalResponse(message: string, context?: any): string {
  const lower = message.toLowerCase();

  if (lower.includes('kullanıcı') && (lower.includes('say') || lower.includes('kaç'))) {
    return '📊 Kullanıcı sayısını görmek için Dashboard istatistiklerine bakabilirsiniz. "Kullanıcı Yönetimi" sekmesinden tüm kullanıcıları listeleyebilirsiniz.';
  }
  if (lower.includes('etkinlik') && lower.includes('oluştur')) {
    return '📅 Yeni etkinlik oluşturmak için "Etkinlik Yönetimi" sekmesindeki "+ Yeni Etkinlik" butonuna tıklayın. Başlık, açıklama, kategori, tarih, saat ve konum bilgilerini girin.';
  }
  if (lower.includes('deploy') || lower.includes('yayınla')) {
    return '🚀 Deploy için: 1) GitHub\'a push edin 2) Vercel otomatik build yapacak 3) Admin panelden "Deploy" butonuna tıklayın. GITHUB_TOKEN gereklidir.';
  }
  if (lower.includes('hata') || lower.includes('bug') || lower.includes('sorun')) {
    return '🐛 Hata tespit etmek için: 1) Backend Status\'u kontrol edin 2) Sistem bilgisindeki memory kullanımını inceleyin 3) Console log\'larını kontrol edin. Sentry entegrasyonu ile otomatik hata takibi yapabilirsiniz.';
  }
  if (lower.includes('bağış') || lower.includes('ödeme')) {
    return '💰 Bağış sistemi: Şu an temel kayıt yapılıyor. Stripe veya iyzico entegrasyonu için ilgili API anahtarlarını .env dosyasına ekleyin. Dashboard\'dan bağış istatistiklerini takip edebilirsiniz.';
  }
  if (lower.includes('rol') || lower.includes('yetki')) {
    return '🛡️ Rol yönetimi: USER (normal), VOLUNTEER (gönüllü), ADMIN (yönetici), ORGANIZATION (kuruluş). Kullanıcı Yönetimi sekmesinden rolleri değiştirebilirsiniz.';
  }

  return `🤖 Mutluet AI Asistan\n\nSorunuz: "${message}"\n\nŞu an yerel mod'dayım (OpenAI API key yapılandırılmamış). Yapabileceğim şeyler:\n• Kullanıcı yönetimi tavsiyeleri\n• Etkinlik oluşturma rehberi\n• Deploy süreçleri\n• Hata tespiti\n• Veritabanı sorguları\n\n💡 Tam AI deneyimi için OPENAI_API_KEY'i .env dosyasına ekleyin.`;
}

export default router;
