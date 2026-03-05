import { Router } from 'express';
import jwt from 'jsonwebtoken';
import { authenticateToken } from '../middleware/auth.js';
import { getSecretSync } from '../config/azure-secrets.js';

const router = Router();

/**
 * WordPress SSO - Generate JWT token for WordPress login
 *
 * POST /api/wordpress/sso-token
 *
 * Requires authentication
 * Returns a JWT token that WordPress can verify
 */
router.post('/sso-token', authenticateToken, async (req, res) => {
  try {
    const user = req.user;

    if (!user) {
      return res.status(401).json({ error: 'Kullanıcı bulunamadı' });
    }

    // Get WordPress JWT secret
    const wpSecret = getSecretSync('WORDPRESS-JWT-SECRET') || process.env.WORDPRESS_JWT_SECRET || 'default-wordpress-secret';

    // Create WordPress-specific JWT
    const wpToken = jwt.sign(
      {
        user_id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        exp: Math.floor(Date.now() / 1000) + (60 * 5) // 5 minutes
      },
      wpSecret
    );

    const wordpressUrl = process.env.WORDPRESS_URL || 'https://mutluet.org';
    const redirectUrl = `${wordpressUrl}/wp-json/mutluet/v1/sso?token=${wpToken}`;

    res.json({
      success: true,
      token: wpToken,
      redirectUrl,
      expiresIn: 300 // 5 minutes
    });
  } catch (error: any) {
    console.error('WordPress SSO token generation error:', error);
    res.status(500).json({ error: 'Token oluşturulamadı', message: error.message });
  }
});

/**
 * Verify WordPress callback
 * This endpoint is called by WordPress after SSO
 */
router.get('/verify', async (req, res) => {
  try {
    const { token } = req.query;

    if (!token || typeof token !== 'string') {
      return res.status(400).json({ error: 'Token gerekli' });
    }

    const wpSecret = getSecretSync('WORDPRESS-JWT-SECRET') || process.env.WORDPRESS_JWT_SECRET || 'default-wordpress-secret';

    // Verify token
    const decoded = jwt.verify(token, wpSecret) as any;

    res.json({
      success: true,
      user: {
        id: decoded.user_id,
        email: decoded.email,
        name: decoded.name,
        role: decoded.role
      }
    });
  } catch (error: any) {
    console.error('WordPress token verification error:', error);
    res.status(401).json({ error: 'Geçersiz token', message: error.message });
  }
});

export default router;
