import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { getSecretSync } from '../config/azure-secrets.js';

export interface AuthRequest extends Request {
  userId?: string;
}

export const authMiddleware = (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ error: 'Yetkilendirme token\'ı bulunamadı' });
    }

    // Key Vault cache'inden veya env'den JWT secret al
    const jwtSecret = getSecretSync('JWT-SECRET') || process.env.JWT_SECRET;
    if (!jwtSecret) {
      console.error('❌ JWT_SECRET tanımlanmamış!');
      return res.status(500).json({ error: 'Sunucu yapılandırma hatası' });
    }

    const decoded = jwt.verify(token, jwtSecret) as { userId: string };
    req.userId = decoded.userId;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Geçersiz token' });
  }
};
