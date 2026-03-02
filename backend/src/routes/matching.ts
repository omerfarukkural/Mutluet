import { Router } from 'express';
import { authMiddleware, AuthRequest } from '../middleware/auth.js';
import prisma from '../config/database.js';

const router = Router();

// Get potential matches
router.get('/potential', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const currentUser = await prisma.user.findUnique({
      where: { id: req.userId },
      include: {
        matches: true,
        matchedWith: true
      }
    });

    if (!currentUser || !currentUser.matchingEnabled) {
      return res.json([]);
    }

    const existingMatchIds = [
      ...currentUser.matches.map(m => m.matchedUserId),
      ...currentUser.matchedWith.map(m => m.userId)
    ];

    const potentialMatches = await prisma.user.findMany({
      where: {
        id: { notIn: [...existingMatchIds, req.userId!] },
        matchingEnabled: true
      },
      take: 10,
      select: {
        id: true,
        name: true,
        avatar: true,
        bio: true,
        location: true,
        interests: true,
        volunteerHours: true,
        eventsAttended: true
      }
    });

    // Calculate compatibility scores
    const matchesWithScore = potentialMatches.map(user => {
      const score = calculateCompatibility(currentUser, user);
      return { ...user, compatibilityScore: score };
    });

    matchesWithScore.sort((a, b) => b.compatibilityScore - a.compatibilityScore);

    res.json(matchesWithScore);
  } catch (error) {
    console.error('Get potential matches error:', error);
    res.status(500).json({ error: 'Eşleşmeler alınamadı' });
  }
});

// Create match
router.post('/:userId/match', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { userId: matchedUserId } = req.params;
    const { compatibilityScore } = req.body;

    const match = await prisma.match.create({
      data: {
        userId: req.userId!,
        matchedUserId,
        compatibilityScore: compatibilityScore || 0,
        status: 'pending'
      }
    });

    res.json(match);
  } catch (error) {
    console.error('Create match error:', error);
    res.status(500).json({ error: 'Eşleşme oluşturulamadı' });
  }
});

// Helper function to calculate compatibility
function calculateCompatibility(user1: any, user2: any): number {
  let score = 0;

  // Interest overlap
  const interests1 = user1.interests || [];
  const interests2 = user2.interests || [];
  const commonInterests = interests1.filter((i: string) => interests2.includes(i));
  score += commonInterests.length * 10;

  // Location proximity (if both have locations)
  if (user1.location && user2.location && user1.location === user2.location) {
    score += 20;
  }

  // Volunteer hours similarity
  const hoursDiff = Math.abs((user1.volunteerHours || 0) - (user2.volunteerHours || 0));
  score += Math.max(0, 30 - hoursDiff);

  // Events attended similarity
  const eventsDiff = Math.abs((user1.eventsAttended || 0) - (user2.eventsAttended || 0));
  score += Math.max(0, 20 - eventsDiff);

  return Math.min(100, score);
}

export default router;
