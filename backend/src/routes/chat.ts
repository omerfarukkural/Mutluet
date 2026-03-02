import { Router } from 'express';
import { authMiddleware, AuthRequest } from '../middleware/auth.js';
import prisma from '../config/database.js';

const router = Router();

// Get conversations
router.get('/conversations', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const messages = await prisma.message.findMany({
      where: {
        OR: [
          { senderId: req.userId },
          { receiverId: req.userId }
        ]
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            avatar: true
          }
        },
        receiver: {
          select: {
            id: true,
            name: true,
            avatar: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    // Group by conversation partner
    const conversations = new Map();
    messages.forEach(msg => {
      const partnerId = msg.senderId === req.userId ? msg.receiverId : msg.senderId;
      const partner = msg.senderId === req.userId ? msg.receiver : msg.sender;

      if (!conversations.has(partnerId)) {
        conversations.set(partnerId, {
          partner,
          lastMessage: msg,
          unreadCount: 0
        });
      }

      if (msg.receiverId === req.userId && !msg.read) {
        conversations.get(partnerId).unreadCount++;
      }
    });

    res.json(Array.from(conversations.values()));
  } catch (error) {
    console.error('Get conversations error:', error);
    res.status(500).json({ error: 'Konuşmalar alınamadı' });
  }
});

// Get messages with a user
router.get('/messages/:userId', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { userId: otherUserId } = req.params;

    const messages = await prisma.message.findMany({
      where: {
        OR: [
          { senderId: req.userId, receiverId: otherUserId },
          { senderId: otherUserId, receiverId: req.userId }
        ]
      },
      include: {
        sender: {
          select: { id: true, name: true, avatar: true }
        }
      },
      orderBy: { createdAt: 'asc' }
    });

    // Mark as read
    await prisma.message.updateMany({
      where: {
        senderId: otherUserId,
        receiverId: req.userId,
        read: false
      },
      data: { read: true }
    });

    res.json(messages);
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({ error: 'Mesajlar alınamadı' });
  }
});

// Send message
router.post('/messages', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { receiverId, content } = req.body;

    const message = await prisma.message.create({
      data: {
        senderId: req.userId!,
        receiverId,
        content
      },
      include: {
        sender: {
          select: { id: true, name: true, avatar: true }
        }
      }
    });

    res.json(message);
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({ error: 'Mesaj gönderilemedi' });
  }
});

export default router;
