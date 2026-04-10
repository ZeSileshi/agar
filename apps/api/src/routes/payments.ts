import { Router } from 'express';
import Stripe from 'stripe';

const router = Router();

// Lazy init — avoids crash when STRIPE_SECRET_KEY isn't set at import time
let _stripe: Stripe | null = null;
function getStripe(): Stripe {
  if (!_stripe) {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) throw new Error('STRIPE_SECRET_KEY not configured');
    _stripe = new Stripe(key);
  }
  return _stripe;
}

/**
 * Points packages — must match mobile/web constants
 */
const PACKAGES: Record<string, { points: number; priceInCents: number }> = {
  small: { points: 20, priceInCents: 500 },
  medium: { points: 50, priceInCents: 1000 },
  large: { points: 120, priceInCents: 2000 },
};

/**
 * POST /api/v1/payments/create-payment-intent
 *
 * Creates a Stripe PaymentIntent and returns the client secret
 * for the mobile payment sheet.
 */
router.post('/create-payment-intent', async (req, res) => {
  try {
    const { packageId } = req.body;

    const pkg = PACKAGES[packageId];
    if (!pkg) {
      res.status(400).json({ error: 'Invalid package ID' });
      return;
    }

    const paymentIntent = await getStripe().paymentIntents.create({
      amount: pkg.priceInCents,
      currency: 'usd',
      metadata: {
        packageId,
        points: String(pkg.points),
      },
    });

    res.json({
      clientSecret: paymentIntent.client_secret,
      points: pkg.points,
      amount: pkg.priceInCents,
    });
  } catch (err: any) {
    console.error('Stripe error:', err.message);
    res.status(500).json({ error: 'Failed to create payment intent' });
  }
});

/**
 * POST /api/v1/payments/webhook
 *
 * Stripe webhook to confirm payment and credit points.
 */
router.post('/webhook', async (req, res) => {
  const event = req.body;

  if (event.type === 'payment_intent.succeeded') {
    const intent = event.data.object;
    const { points } = intent.metadata;
    // TODO: Credit points to user account in database
    console.log(`Payment succeeded: credit ${points} points`);
  }

  res.json({ received: true });
});

export const paymentRouter = router;
