import { Router, Request, Response } from 'express';
import Stripe from 'stripe';

const router = Router();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? '', {
  apiVersion: '2025-03-31.basil',
});

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
router.post('/create-payment-intent', async (req: Request, res: Response) => {
  try {
    const { packageId } = req.body;

    const pkg = PACKAGES[packageId];
    if (!pkg) {
      res.status(400).json({ error: 'Invalid package ID' });
      return;
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: pkg.priceInCents,
      currency: 'usd',
      metadata: {
        packageId,
        points: String(pkg.points),
      },
    });

    // Optionally create an ephemeral key for the customer
    // For now, we return just the client secret
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
 * In production, use express.raw() for this route specifically.
 */
router.post('/webhook', async (req: Request, res: Response) => {
  // TODO: Verify webhook signature with STRIPE_WEBHOOK_SECRET
  // For now, handle payment_intent.succeeded events
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
