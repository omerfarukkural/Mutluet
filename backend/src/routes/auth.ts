import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../config/database.js';

const router = Router();

// Register with email
router.post('/register', async (req, res) => {
  try {
    const { email, password, name } = req.body;

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: 'Bu e-posta zaten kullanılıyor' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        authProvider: 'EMAIL'
      }
    });

    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET!, {
      expiresIn: (process.env.JWT_EXPIRES_IN || '7d') as any
    });

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        avatar: user.avatar,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: 'Kayıt sırasında bir hata oluştu' });
  }
});

// Login with email
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !user.password) {
      return res.status(401).json({ error: 'Geçersiz e-posta veya şifre' });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Geçersiz e-posta veya şifre' });
    }

    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET!, {
      expiresIn: (process.env.JWT_EXPIRES_IN || '7d') as any
    });

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        avatar: user.avatar,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Giriş sırasında bir hata oluştu' });
  }
});

// Social auth (Google, Facebook, TikTok) - placeholder
router.post('/social/:provider', async (req, res) => {
  try {
    const { provider } = req.params;
    const { token: socialToken, email, name, avatar, providerId } = req.body;

    let user = await prisma.user.findFirst({
      where: {
        OR: [
          { email },
          { providerId, authProvider: provider.toUpperCase() as any }
        ]
      }
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          email,
          name,
          avatar,
          providerId,
          authProvider: provider.toUpperCase() as any,
          emailVerified: true
        }
      });
    }

    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET!, {
      expiresIn: (process.env.JWT_EXPIRES_IN || '7d') as any
    });

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        avatar: user.avatar,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Social auth error:', error);
    res.status(500).json({ error: 'Sosyal giriş sırasında bir hata oluştu' });
  }
});

// Magic link request
router.post('/magic-link', async (req, res) => {
  try {
    const { email } = req.body;

    let user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      user = await prisma.user.create({
        data: {
          email,
          name: email.split('@')[0],
          authProvider: 'EMAIL'
        }
      });
    }

    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET!, {
      expiresIn: '15m' as any
    });

    // TODO: Send email with magic link
    const magicLink = `${process.env.FRONTEND_URL}/auth/verify?token=${token}`;

    // For now, just return the link (in production, send via email)
    res.json({
      message: 'Magic link gönderildi',
      magicLink // Remove in production
    });
  } catch (error) {
    console.error('Magic link error:', error);
    res.status(500).json({ error: 'Magic link oluşturulamadı' });
  }
});

export default router;
