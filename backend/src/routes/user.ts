import { Router } from 'express';
import { authMiddleware, AuthRequest } from '../middleware/auth.js';
import prisma from '../config/database.js';

const router = Router();

// Get current user
router.get('/me', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      include: {
        achievements: {
          include: { achievement: true }
        },
        challenges: {
          include: { challenge: true }
        }
      }
    });

    if (!user) {
      return res.status(404).json({ error: 'Kullanıcı bulunamadı' });
    }

    res.json(user);
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Kullanıcı bilgileri alınamadı' });
  }
});

// Update user profile
router.patch('/me', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { name, bio, location, phone, interests, avatar } = req.body;

    const user = await prisma.user.update({
      where: { id: req.userId },
      data: {
        ...(name && { name }),
        ...(bio && { bio }),
        ...(location && { location }),
        ...(phone && { phone }),
        ...(interests && { interests }),
        ...(avatar && { avatar })
      }
    });

    res.json(user);
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ error: 'Profil güncellenemedi' });
  }
});

// Get user stats
router.get('/me/stats', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      select: {
        totalDonations: true,
        volunteerHours: true,
        eventsAttended: true,
        engagementScore: true
      }
    });

    res.json(user);
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ error: 'İstatistikler alınamadı' });
  }
});

// Admin: Get all users
router.get('/all', authMiddleware, async (req: AuthRequest, res) => {
  try {
    // Check if user is admin
    const currentUser = await prisma.user.findUnique({
      where: { id: req.userId },
      select: { role: true }
    });

    if (currentUser?.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Yetkisiz erişim' });
    }

    const users = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        authProvider: true,
        totalDonations: true,
        volunteerHours: true,
        eventsAttended: true,
        engagementScore: true,
        createdAt: true,
        updatedAt: true
      }
    });

    res.json(users);
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({ error: 'Kullanıcılar alınamadı' });
  }
});

// Admin: Update user role
router.patch('/:id/role', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const currentUser = await prisma.user.findUnique({
      where: { id: req.userId },
      select: { role: true }
    });

    if (currentUser?.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Yetkisiz erişim' });
    }

    const id = req.params.id as string;
    const { role } = req.body;

    const allowedRoles = ['USER', 'VOLUNTEER', 'ADMIN', 'ORGANIZATION'];
    if (!id || typeof id !== 'string' || !allowedRoles.includes(role)) {
      return res.status(400).json({ error: 'Geçersiz istek parametreleri' });
    }

    const targetUser = await prisma.user.findUnique({ where: { id }, select: { id: true } });
    if (!targetUser) {
      return res.status(404).json({ error: 'Kullanıcı bulunamadı' });
    }

    const user = await prisma.user.update({
      where: { id },
      data: { role },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        engagementScore: true,
        createdAt: true
      }
    });

    res.json(user);
  } catch (error) {
    console.error('Update user role error:', error);
    res.status(500).json({ error: 'Rol güncellenemedi' });
  }
});

export default router;
