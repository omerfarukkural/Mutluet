import { Router } from 'express';
import { authMiddleware, AuthRequest } from '../middleware/auth.js';
import prisma from '../config/database.js';

const router = Router();

// Get user donations
router.get('/my-donations', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const donations = await prisma.donation.findMany({
      where: { userId: req.userId },
      orderBy: { createdAt: 'desc' }
    });

    res.json(donations);
  } catch (error) {
    console.error('Get donations error:', error);
    res.status(500).json({ error: 'Bağışlar alınamadı' });
  }
});

// Create donation
router.post('/', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { amount, type, description, stripePaymentId } = req.body;

    const donation = await prisma.donation.create({
      data: {
        userId: req.userId!,
        amount,
        type,
        description,
        stripePaymentId
      }
    });

    // Update user total donations
    await prisma.user.update({
      where: { id: req.userId },
      data: {
        totalDonations: { increment: amount }
      }
    });

    res.json(donation);
  } catch (error) {
    console.error('Create donation error:', error);
    res.status(500).json({ error: 'Bağış oluşturulamadı' });
  }
});

// Admin: Get all donations
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

    const donations = await prisma.donation.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    res.json(donations);
  } catch (error) {
    console.error('Get all donations error:', error);
    res.status(500).json({ error: 'Bağışlar alınamadı' });
  }
});

export default router;
