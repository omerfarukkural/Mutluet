import { Router, Request, Response } from 'express';
import { getSecretSync, getSecretStatus } from '../config/azure-secrets.js';

const router = Router();

// ═══════════════════════════════════════════════════════════════
// /api/config — Uygulama Bazlı Yapılandırma Endpoint'leri
// ═══════════════════════════════════════════════════════════════

/**
 * GET /api/config/public
 * Frontend (React/Vite) için güvenli public config'ler.
 * ASLA hassas secret döndürmez (API key, password vb. YOK).
 */
router.get('/public', (req: Request, res: Response) => {
  res.json({
    supabaseUrl: getSecretSync('NEXT-PUBLIC-SUPABASE-URL') || process.env.NEXT_PUBLIC_SUPABASE_URL,
    supabaseAnonKey: getSecretSync('NEXT-PUBLIC-SUPABASE-ANON-KEY') || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    googleClientId: getSecretSync('GOOGLE-CLIENT-ID') || process.env.GOOGLE_CLIENT_ID,
    googleMapsApiKey: process.env.VITE_GOOGLE_MAPS_API_KEY || null,
    stripePublishableKey: process.env.VITE_STRIPE_PUBLISHABLE_KEY || null,
    wordpressUrl: getSecretSync('WORDPRESS-URL') || process.env.WORDPRESS_URL,
    environment: process.env.NODE_ENV || 'development',
  });
});

/**
 * GET /api/config/mobile
 * Flutter / React Native mobil app için config.
 * Hassas değerler dahil DEĞİL.
 */
router.get('/mobile', (req: Request, res: Response) => {
  res.json({
    apiBaseUrl: process.env.VITE_API_URL || `http://localhost:${process.env.PORT || 3001}/api`,
    supabaseUrl: getSecretSync('NEXT-PUBLIC-SUPABASE-URL') || process.env.NEXT_PUBLIC_SUPABASE_URL,
    supabaseAnonKey: getSecretSync('NEXT-PUBLIC-SUPABASE-ANON-KEY') || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    googleClientId: getSecretSync('GOOGLE-CLIENT-ID') || process.env.GOOGLE_CLIENT_ID,
    wordpressUrl: getSecretSync('WORDPRESS-URL') || process.env.WORDPRESS_URL,
    environment: process.env.NODE_ENV || 'development',
  });
});

/**
 * GET /api/config/health
 * Secret durumu ve sistem sağlık kontrolü (sadece ADMIN).
 */
router.get('/health', (req: Request, res: Response) => {
  const status = getSecretStatus();
  res.json({
    vault: {
      url: process.env.AZURE_KEY_VAULT_URL || 'https://anahtar.vault.azure.net/',
      secretStatus: status,
    },
    server: {
      uptime: process.uptime(),
      nodeEnv: process.env.NODE_ENV,
      timestamp: new Date().toISOString(),
    },
  });
});

export default router;

