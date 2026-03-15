import { Router } from 'express';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { getSecretSync } from '../config/azure-secrets.js';

const router = Router();
const prisma = new PrismaClient();

/**
 * Google OAuth Callback
 * POST /api/oauth/google
 */
router.post('/google', async (req, res) => {
  try {
    const { email, name, picture, googleToken } = req.body;

    if (!email || !name) {
      return res.status(400).json({ error: 'Email ve name gerekli' });
    }

    let user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      user = await prisma.user.create({
        data: {
          email,
          name,
          authProvider: 'GOOGLE',
          avatar: picture || undefined
        }
      });
    } else {
      user = await prisma.user.update({
        where: { email },
        data: {
          authProvider: 'GOOGLE',
          avatar: picture || user.avatar
        }
      });
    }

    const jwtSecret = getSecretSync('JWT-SECRET') || process.env.JWT_SECRET || 'default-secret';
    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      jwtSecret,
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        avatar: user.avatar
      }
    });
  } catch (error: any) {
    console.error('Google OAuth error:', error);
    res.status(500).json({ error: 'OAuth işlemi başarısız', message: error.message });
  }
});

/**
 * Facebook OAuth Callback
 * POST /api/oauth/facebook
 */
router.post('/facebook', async (req, res) => {
  try {
    const { email, name, picture, facebookToken } = req.body;

    if (!email || !name) {
      return res.status(400).json({ error: 'Email ve name gerekli' });
    }

    let user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      user = await prisma.user.create({
        data: {
          email,
          name,
          authProvider: 'FACEBOOK',
          avatar: picture || undefined
        }
      });
    } else {
      user = await prisma.user.update({
        where: { email },
        data: {
          authProvider: 'FACEBOOK',
          avatar: picture || user.avatar
        }
      });
    }

    const jwtSecret = getSecretSync('JWT-SECRET') || process.env.JWT_SECRET || 'default-secret';
    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      jwtSecret,
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        avatar: user.avatar
      }
    });
  } catch (error: any) {
    console.error('Facebook OAuth error:', error);
    res.status(500).json({ error: 'OAuth işlemi başarısız', message: error.message });
  }
});

/**
 * TikTok OAuth Callback
 * POST /api/oauth/tiktok
 */
router.post('/tiktok', async (req, res) => {
  try {
    const { email, name, picture, tiktokToken } = req.body;

    if (!email || !name) {
      return res.status(400).json({ error: 'Email ve name gerekli' });
    }

    let user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      user = await prisma.user.create({
        data: {
          email,
          name,
          authProvider: 'TIKTOK',
          avatar: picture || undefined
        }
      });
    } else {
      user = await prisma.user.update({
        where: { email },
        data: {
          authProvider: 'TIKTOK',
          avatar: picture || user.avatar
        }
      });
    }

    const jwtSecret = getSecretSync('JWT-SECRET') || process.env.JWT_SECRET || 'default-secret';
    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      jwtSecret,
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        avatar: user.avatar
      }
    });
  } catch (error: any) {
    console.error('TikTok OAuth error:', error);
    res.status(500).json({ error: 'OAuth işlemi başarısız', message: error.message });
  }
});

/**
 * Azure AD OAuth Callback
 * POST /api/oauth/azure
 * Not: AuthProvider enum'da AZURE yok, EMAIL olarak kaydediyoruz
 * ve providerId ile Azure olduğunu belirtiyoruz.
 */
router.post('/azure', async (req, res) => {
  try {
    const { email, name, azureToken } = req.body;

    if (!email || !name) {
      return res.status(400).json({ error: 'Email ve name gerekli' });
    }

    let user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      user = await prisma.user.create({
        data: {
          email,
          name,
          authProvider: 'EMAIL',
          providerId: 'azure'
        }
      });
    } else {
      user = await prisma.user.update({
        where: { email },
        data: {
          authProvider: 'EMAIL',
          providerId: 'azure'
        }
      });
    }

    const jwtSecret = getSecretSync('JWT-SECRET') || process.env.JWT_SECRET || 'default-secret';
    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      jwtSecret,
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        avatar: user.avatar
      }
    });
  } catch (error: any) {
    console.error('Azure AD OAuth error:', error);
    res.status(500).json({ error: 'OAuth işlemi başarısız', message: error.message });
  }
});

export default router;
