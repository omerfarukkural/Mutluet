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

export default router;
