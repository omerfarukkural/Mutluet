import { Router } from 'express';
import prisma from '../config/database.js';

const router = Router();

// Get nearby organizations
router.get('/nearby', async (req, res) => {
  try {
    const { lat, lng, radius = 10 } = req.query;

    if (!lat || !lng) {
      return res.status(400).json({ error: 'Konum bilgisi gerekli' });
    }

    // Simple distance calculation (in production, use PostGIS or similar)
    const organizations = await prisma.organization.findMany({
      where: { verified: true },
      orderBy: { createdAt: 'desc' }
    });

    const nearby = organizations.map(org => {
      const distance = calculateDistance(
        Number(lat),
        Number(lng),
        org.latitude,
        org.longitude
      );
      return { ...org, distance };
    }).filter(org => org.distance <= Number(radius))
      .sort((a, b) => a.distance - b.distance);

    res.json(nearby);
  } catch (error) {
    console.error('Get nearby organizations error:', error);
    res.status(500).json({ error: 'Kuruluşlar alınamadı' });
  }
});

// Get all organizations
router.get('/', async (req, res) => {
  try {
    const organizations = await prisma.organization.findMany({
      where: { verified: true },
      orderBy: { name: 'asc' }
    });

    res.json(organizations);
  } catch (error) {
    console.error('Get organizations error:', error);
    res.status(500).json({ error: 'Kuruluşlar alınamadı' });
  }
});

// Haversine formula for distance calculation
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(degrees: number): number {
  return degrees * (Math.PI / 180);
}

export default router;
