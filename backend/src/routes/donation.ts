import { Router } from 'express';
import Stripe from 'stripe';
import { authMiddleware, AuthRequest } from '../middleware/auth.js';
import prisma from '../config/database.js';

const router = Router();

function getStripe(): Stripe | null {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) return null;
  return new Stripe(key, { apiVersion: '2026-05-27.dahlia' as any });
}

// Kullanıcının bağışları
router.get('/my-donations', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const donations = await prisma.donation.findMany({
      where: { userId: req.userId },
      orderBy: { createdAt: 'desc' },
    });
    res.json(donations);
  } catch (error) {
    console.error('Get donations error:', error);
    res.status(500).json({ error: 'Bağışlar alınamadı' });
  }
});

// Stripe payment intent oluştur (ödeme öncesi)
router.post('/create-payment-intent', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { amount, type } = req.body;
    if (!amount || amount <= 0) return res.status(400).json({ error: 'Geçerli bir tutar girin' });
    if (!type) return res.status(400).json({ error: 'Bağış türü zorunludur' });

    const stripe = getStripe();
    if (!stripe) {
      return res.status(503).json({ error: 'Ödeme sistemi yapılandırılmamış', code: 'STRIPE_NOT_CONFIGURED' });
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Kuruş cinsinden (TRY için 100x)
      currency: 'try',
      metadata: { userId: req.userId!, donationType: type },
    });

    res.json({ clientSecret: paymentIntent.client_secret, paymentIntentId: paymentIntent.id });
  } catch (error: any) {
    console.error('Create payment intent error:', error);
    res.status(500).json({ error: 'Ödeme başlatılamadı' });
  }
});

// Bağış kaydı (Stripe ödeme tamamlandıktan sonra çağrılır)
router.post('/', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { amount, type, description, stripePaymentId } = req.body;

    if (!amount || !type) return res.status(400).json({ error: 'Tutar ve bağış türü zorunludur' });

    // Stripe kullanılıyorsa payment intent doğrula
    if (stripePaymentId) {
      const stripe = getStripe();
      if (stripe) {
        const intent = await stripe.paymentIntents.retrieve(stripePaymentId);
        if (intent.status !== 'succeeded') {
          return res.status(400).json({ error: 'Ödeme tamamlanmamış' });
        }
      }
    }

    const donation = await prisma.donation.create({
      data: { userId: req.userId!, amount, type, description, stripePaymentId },
    });

    await prisma.user.update({
      where: { id: req.userId },
      data: { totalDonations: { increment: amount } },
    });

    res.json(donation);
  } catch (error) {
    console.error('Create donation error:', error);
    res.status(500).json({ error: 'Bağış oluşturulamadı' });
  }
});

// Stripe webhook — Stripe dashboard'dan gelen olaylar
router.post('/webhook', async (req, res) => {
  const stripe = getStripe();
  if (!stripe) return res.status(503).json({ error: 'Stripe yapılandırılmamış' });

  const sig = req.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!sig || !webhookSecret) {
    return res.status(400).json({ error: 'Webhook imzası eksik' });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
  } catch (err: any) {
    console.error('Webhook signature error:', err.message);
    return res.status(400).json({ error: `Webhook hatası: ${err.message}` });
  }

  if (event.type === 'payment_intent.succeeded') {
    const intent = event.data.object as Stripe.PaymentIntent;
    console.log(`✅ Ödeme başarılı: ${intent.id}, tutar: ${intent.amount / 100} TRY`);
  }

  res.json({ received: true });
});

// Admin: Tüm bağışlar
router.get('/all', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const currentUser = await prisma.user.findUnique({ where: { id: req.userId }, select: { role: true } });
    if (currentUser?.role !== 'ADMIN') return res.status(403).json({ error: 'Yetkisiz erişim' });

    const donations = await prisma.donation.findMany({
      orderBy: { createdAt: 'desc' },
      include: { user: { select: { id: true, name: true, email: true } } },
    });
    res.json(donations);
  } catch (error) {
    console.error('Get all donations error:', error);
    res.status(500).json({ error: 'Bağışlar alınamadı' });
  }
});

export default router;
