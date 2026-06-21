import { Router } from 'express';
import jwt from 'jsonwebtoken';
import prisma from '../config/database.js';

const router = Router();

type OAuthProvider = 'GOOGLE' | 'FACEBOOK' | 'TIKTOK';

async function handleOAuth(
  provider: OAuthProvider,
  email: string,
  name: string,
  picture?: string,
) {
  let user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    user = await prisma.user.create({
      data: { email, name, authProvider: provider, avatar: picture ?? undefined, emailVerified: true },
    });
  } else {
    user = await prisma.user.update({
      where: { email },
      data: { authProvider: provider, ...(picture && { avatar: picture }) },
    });
  }

  const token = jwt.sign(
    { userId: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET!,
    { expiresIn: '7d' },
  );

  return { token, user: { id: user.id, email: user.email, name: user.name, role: user.role, avatar: user.avatar } };
}

router.post('/google', async (req, res) => {
  try {
    const { email, name, picture } = req.body;
    if (!email || !name) return res.status(400).json({ error: 'Email ve name gerekli' });
    const result = await handleOAuth('GOOGLE', email, name, picture);
    res.json({ success: true, ...result });
  } catch (error: any) {
    console.error('Google OAuth error:', error);
    res.status(500).json({ error: 'OAuth işlemi başarısız' });
  }
});

router.post('/facebook', async (req, res) => {
  try {
    const { email, name, picture } = req.body;
    if (!email || !name) return res.status(400).json({ error: 'Email ve name gerekli' });
    const result = await handleOAuth('FACEBOOK', email, name, picture);
    res.json({ success: true, ...result });
  } catch (error: any) {
    console.error('Facebook OAuth error:', error);
    res.status(500).json({ error: 'OAuth işlemi başarısız' });
  }
});

router.post('/tiktok', async (req, res) => {
  try {
    const { email, name, picture } = req.body;
    if (!email || !name) return res.status(400).json({ error: 'Email ve name gerekli' });
    const result = await handleOAuth('TIKTOK', email, name, picture);
    res.json({ success: true, ...result });
  } catch (error: any) {
    console.error('TikTok OAuth error:', error);
    res.status(500).json({ error: 'OAuth işlemi başarısız' });
  }
});

export default router;
