import { Router } from 'express';
import Stripe from 'stripe';

const router = Router();

// Lazy init
let _stripe: Stripe | null = null;
function getStripe(): Stripe {
  if (!_stripe) {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) throw new Error('STRIPE_SECRET_KEY not configured');
    _stripe = new Stripe(key);
  }
  return _stripe;
}

const PACKAGES: Record<string, { points: number; priceInCents: number; label: string }> = {
  small: { points: 20, priceInCents: 500, label: '20 Points' },
  medium: { points: 50, priceInCents: 1000, label: '50 Points' },
  large: { points: 120, priceInCents: 2000, label: '120 Points' },
};

/**
 * POST /api/v1/payments/create-checkout-session
 *
 * Creates a Stripe Checkout Session for web — redirects user to
 * Stripe's hosted payment page to enter card details.
 */
router.post('/create-checkout-session', async (req, res) => {
  try {
    const { packageId, successUrl, cancelUrl } = req.body;

    const pkg = PACKAGES[packageId];
    if (!pkg) {
      res.status(400).json({ error: 'Invalid package ID' });
      return;
    }

    const session = await getStripe().checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: pkg.label,
              description: `${pkg.points} Agar points`,
            },
            unit_amount: pkg.priceInCents,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: successUrl || 'http://localhost:3000/shop?success=true&points=' + pkg.points,
      cancel_url: cancelUrl || 'http://localhost:3000/shop?canceled=true',
      metadata: {
        packageId,
        points: String(pkg.points),
      },
    });

    res.json({ url: session.url });
  } catch (err: any) {
    console.error('Stripe checkout error:', err.message);
    res.status(500).json({ error: 'Failed to create checkout session' });
  }
});

/**
 * POST /api/v1/payments/create-payment-intent
 *
 * Creates a Stripe PaymentIntent for mobile — returns client secret
 * for confirming payment with card details on the client.
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
 * POST /api/v1/payments/confirm
 *
 * Verifies a PaymentIntent was actually paid before crediting points.
 * Mobile calls this after user enters card and payment succeeds.
 */
router.post('/confirm', async (req, res) => {
  try {
    const { paymentIntentId } = req.body;

    if (!paymentIntentId) {
      res.status(400).json({ error: 'paymentIntentId required' });
      return;
    }

    const intent = await getStripe().paymentIntents.retrieve(paymentIntentId);

    if (intent.status === 'succeeded') {
      const points = parseInt(intent.metadata.points || '0', 10);
      // TODO: credit points in database
      res.json({ success: true, points });
    } else {
      res.json({ success: false, status: intent.status });
    }
  } catch (err: any) {
    console.error('Confirm error:', err.message);
    res.status(500).json({ error: 'Failed to confirm payment' });
  }
});

/**
 * POST /api/v1/payments/webhook
 */
router.post('/webhook', async (req, res) => {
  const event = req.body;

  if (event.type === 'payment_intent.succeeded') {
    const intent = event.data.object;
    const { points } = intent.metadata;
    console.log(`Payment succeeded: credit ${points} points`);
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const { points } = session.metadata;
    console.log(`Checkout completed: credit ${points} points`);
  }

  res.json({ received: true });
});

export const paymentRouter = router;
