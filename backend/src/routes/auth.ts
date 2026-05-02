import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import rateLimit from 'express-rate-limit';
import prisma from '../config/database.js';

const router = Router();

// Strict rate limiter for auth endpoints (brute-force protection)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Çok fazla giriş denemesi. 15 dakika sonra tekrar deneyin.' },
});

// Helpers
function isValidEmail(email: string): boolean {
  if (typeof email !== 'string' || email.length > 254 || email.length < 5) return false;
  // Non-backtracking check: split on last '@' and validate parts individually
  const atIdx = email.lastIndexOf('@');
  if (atIdx < 1) return false;
  const local = email.slice(0, atIdx);
  const domain = email.slice(atIdx + 1);
  if (local.length === 0 || local.length > 64) return false;
  if (domain.length < 3 || domain.startsWith('.') || domain.endsWith('.')) return false;
  if (!domain.includes('.')) return false;
  // Reject whitespace characters in any part
  if (/\s/.test(local) || /\s/.test(domain)) return false;
  return true;
}

function isStrongPassword(password: string): boolean {
  return typeof password === 'string' && password.length >= 8;
}

// Register with email
router.post('/register', authLimiter, async (req, res) => {
  try {
    const { email, password, name } = req.body;

    if (!email || !password || !name) {
      return res.status(400).json({ error: 'E-posta, şifre ve isim zorunludur' });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({ error: 'Geçersiz e-posta formatı' });
    }

    if (!isStrongPassword(password)) {
      return res.status(400).json({ error: 'Şifre en az 8 karakter olmalıdır' });
    }

    if (typeof name !== 'string' || name.trim().length < 2) {
      return res.status(400).json({ error: 'İsim en az 2 karakter olmalıdır' });
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: 'Bu e-posta zaten kullanılıyor' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name: name.trim(),
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
router.post('/login', authLimiter, async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'E-posta ve şifre zorunludur' });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({ error: 'Geçersiz e-posta formatı' });
    }

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
router.post('/magic-link', authLimiter, async (req, res) => {
  try {
    const { email } = req.body;

    if (!email || !isValidEmail(email)) {
      return res.status(400).json({ error: 'Geçerli bir e-posta adresi girin' });
    }

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

    // TODO: Send email with magic link via SendGrid / Azure Communication Services
    const magicLink = `${process.env.FRONTEND_URL}/auth/verify?token=${token}`;

    if (process.env.NODE_ENV === 'production') {
      // In production the link is sent via email only — do not expose it in the response
      res.json({ message: 'Magic link e-posta adresinize gönderildi' });
    } else {
      // Development convenience: return the link so it can be tested without email setup
      res.json({ message: 'Magic link gönderildi', magicLink });
    }
  } catch (error) {
    console.error('Magic link error:', error);
    res.status(500).json({ error: 'Magic link oluşturulamadı' });
  }
});

export default router;
