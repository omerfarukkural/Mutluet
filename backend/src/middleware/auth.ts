import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthRequest extends Request {
  userId?: string;
  user?: {
    id: string;
    email: string;
    name: string;
    role: string;
  };
}

export const authMiddleware = (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ error: 'Yetkilendirme token\'ı bulunamadı' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string; email?: string; name?: string; role?: string };
    req.userId = decoded.userId;
    req.user = {
      id: decoded.userId,
      email: decoded.email || '',
      name: decoded.name || '',
      role: decoded.role || 'USER'
    };
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Geçersiz token' });
  }
};

// Alias for backward compatibility
export const authenticateToken = authMiddleware;
