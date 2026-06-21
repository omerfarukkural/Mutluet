import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import rateLimit from 'express-rate-limit';
import prisma from '../config/database.js';
import { sendMagicLink, sendPasswordReset, sendWelcome } from '../config/email.js';

const router = Router();

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { error: 'Çok fazla giriş denemesi, 15 dakika sonra tekrar deneyin' },
  standardHeaders: true,
  legacyHeaders: false,
});

const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  message: { error: 'Çok fazla kayıt denemesi, 1 saat sonra tekrar deneyin' },
  standardHeaders: true,
  legacyHeaders: false,
});

const magicLinkLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 3,
  message: { error: 'Çok fazla magic link isteği, 1 saat sonra tekrar deneyin' },
  standardHeaders: true,
  legacyHeaders: false,
});

function signToken(userId: string, expiresIn = '7d') {
  return jwt.sign({ userId }, process.env.JWT_SECRET!, { expiresIn } as any);
}

// Register
router.post('/register', registerLimiter, async (req, res) => {
  try {
    const { email, password, name } = req.body;

    if (!email || !password || !name) {
      return res.status(400).json({ error: 'Email, şifre ve isim zorunludur' });
    }
    if (password.length < 6) {
      return res.status(400).json({ error: 'Şifre en az 6 karakter olmalıdır' });
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return res.status(400).json({ error: 'Bu e-posta zaten kullanılıyor' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { email, password: hashedPassword, name, authProvider: 'EMAIL' },
    });

    sendWelcome(email, name).catch(() => {});

    const token = signToken(user.id);
    res.json({ token, user: { id: user.id, email: user.email, name: user.name, avatar: user.avatar, role: user.role } });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: 'Kayıt sırasında bir hata oluştu' });
  }
});

// Login
router.post('/login', loginLimiter, async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email ve şifre zorunludur' });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !user.password) {
      return res.status(401).json({ error: 'Geçersiz e-posta veya şifre' });
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return res.status(401).json({ error: 'Geçersiz e-posta veya şifre' });
    }

    const token = signToken(user.id);
    res.json({ token, user: { id: user.id, email: user.email, name: user.name, avatar: user.avatar, role: user.role } });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Giriş sırasında bir hata oluştu' });
  }
});

// Social auth (Google, Facebook, TikTok)
router.post('/social/:provider', async (req, res) => {
  try {
    const { provider } = req.params;
    const { email, name, avatar, providerId } = req.body;

    let user = await prisma.user.findFirst({
      where: { OR: [{ email }, { providerId, authProvider: provider.toUpperCase() as any }] },
    });

    if (!user) {
      user = await prisma.user.create({
        data: { email, name, avatar, providerId, authProvider: provider.toUpperCase() as any, emailVerified: true },
      });
    }

    const token = signToken(user.id);
    res.json({ token, user: { id: user.id, email: user.email, name: user.name, avatar: user.avatar, role: user.role } });
  } catch (error) {
    console.error('Social auth error:', error);
    res.status(500).json({ error: 'Sosyal giriş sırasında bir hata oluştu' });
  }
});

// Magic link isteği
router.post('/magic-link', magicLinkLimiter, async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'Email zorunludur' });

    let user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      user = await prisma.user.create({
        data: { email, name: email.split('@')[0], authProvider: 'EMAIL' },
      });
    }

    const token = signToken(user.id, '15m');
    const magicLink = `${process.env.FRONTEND_URL}/auth/verify?token=${token}`;

    const sent = await sendMagicLink(email, magicLink);

    res.json({
      message: sent ? 'Magic link e-posta ile gönderildi' : 'E-posta servisi yapılandırılmamış',
      ...(process.env.NODE_ENV !== 'production' && { magicLink }),
    });
  } catch (error) {
    console.error('Magic link error:', error);
    res.status(500).json({ error: 'Magic link oluşturulamadı' });
  }
});

// Magic link doğrulama
router.get('/verify', async (req, res) => {
  try {
    const { token } = req.query;
    if (!token) return res.status(400).json({ error: 'Token gerekli' });

    const decoded = jwt.verify(token as string, process.env.JWT_SECRET!) as { userId: string };
    const user = await prisma.user.findUnique({ where: { id: decoded.userId } });
    if (!user) return res.status(404).json({ error: 'Kullanıcı bulunamadı' });

    await prisma.user.update({ where: { id: user.id }, data: { emailVerified: true } });

    const newToken = signToken(user.id);
    res.json({ token: newToken, user: { id: user.id, email: user.email, name: user.name, avatar: user.avatar, role: user.role } });
  } catch (error) {
    res.status(401).json({ error: 'Geçersiz veya süresi dolmuş token' });
  }
});

// Şifre sıfırlama isteği
router.post('/forgot-password', magicLinkLimiter, async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'Email zorunludur' });

    const user = await prisma.user.findUnique({ where: { email } });
    // Kullanıcı bulunamasa bile aynı yanıtı ver (güvenlik)
    if (!user) {
      return res.json({ message: 'Şifre sıfırlama bağlantısı gönderildi' });
    }

    const token = jwt.sign({ userId: user.id, type: 'password-reset' }, process.env.JWT_SECRET!, { expiresIn: '15m' } as any);
    const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;

    const sent = await sendPasswordReset(email, resetLink);

    res.json({
      message: sent ? 'Şifre sıfırlama bağlantısı gönderildi' : 'E-posta servisi yapılandırılmamış',
      ...(process.env.NODE_ENV !== 'production' && { resetLink }),
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ error: 'Şifre sıfırlama isteği oluşturulamadı' });
  }
});

// Şifre sıfırlama — yeni şifreyi kaydet
router.post('/reset-password', async (req, res) => {
  try {
    const { token, password } = req.body;
    if (!token || !password) return res.status(400).json({ error: 'Token ve şifre zorunludur' });
    if (password.length < 6) return res.status(400).json({ error: 'Şifre en az 6 karakter olmalıdır' });

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string; type: string };
    if (decoded.type !== 'password-reset') {
      return res.status(400).json({ error: 'Geçersiz token türü' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    await prisma.user.update({ where: { id: decoded.userId }, data: { password: hashedPassword } });

    res.json({ message: 'Şifre başarıyla güncellendi' });
  } catch (error) {
    res.status(401).json({ error: 'Geçersiz veya süresi dolmuş token' });
  }
});

export default router;
