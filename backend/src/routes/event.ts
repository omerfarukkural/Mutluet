import { Router } from 'express';
import { authMiddleware, AuthRequest } from '../middleware/auth.js';
import prisma from '../config/database.js';

const router = Router();

// Get all events
router.get('/', async (req, res) => {
  try {
    const events = await prisma.event.findMany({
      include: {
        participants: {
          include: { user: true }
        }
      },
      orderBy: { date: 'asc' }
    });

    res.json(events);
  } catch (error) {
    console.error('Get events error:', error);
    res.status(500).json({ error: 'Etkinlikler alınamadı' });
  }
});

// Get upcoming events
router.get('/upcoming', async (req, res) => {
  try {
    const events = await prisma.event.findMany({
      where: {
        date: { gte: new Date() }
      },
      include: {
        participants: true
      },
      orderBy: { date: 'asc' },
      take: 10
    });

    res.json(events);
  } catch (error) {
    console.error('Get upcoming events error:', error);
    res.status(500).json({ error: 'Yaklaşan etkinlikler alınamadı' });
  }
});

// Join event
router.post('/:eventId/join', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const eventId = req.params.eventId as string;

    const event = await prisma.event.findUnique({
      where: { id: eventId },
      include: { participants: true }
    });

    if (!event) {
      return res.status(404).json({ error: 'Etkinlik bulunamadı' });
    }

    if (event.maxParticipants && event.currentParticipants >= event.maxParticipants) {
      return res.status(400).json({ error: 'Etkinlik dolu' });
    }

    const existing = await prisma.eventParticipant.findUnique({
      where: {
        userId_eventId: {
          userId: req.userId!,
          eventId
        }
      }
    });

    if (existing) {
      return res.status(400).json({ error: 'Zaten katıldınız' });
    }

    await prisma.eventParticipant.create({
      data: {
        userId: req.userId!,
        eventId
      }
    });

    await prisma.event.update({
      where: { id: eventId },
      data: { currentParticipants: { increment: 1 } }
    });

    await prisma.user.update({
      where: { id: req.userId },
      data: { eventsAttended: { increment: 1 } }
    });

    res.json({ message: 'Etkinliğe katıldınız' });
  } catch (error) {
    console.error('Join event error:', error);
    res.status(500).json({ error: 'Etkinliğe katılınamadı' });
  }
});

export default router;
