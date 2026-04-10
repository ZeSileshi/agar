import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

const PACKAGES: Record<string, { points: number; priceInCents: number; label: string }> = {
  small: { points: 20, priceInCents: 500, label: '20 Points' },
  medium: { points: 50, priceInCents: 1000, label: '50 Points' },
  large: { points: 120, priceInCents: 2000, label: '120 Points' },
};

export async function POST(req: NextRequest) {
  try {
    const secretKey = process.env.STRIPE_SECRET_KEY;
    if (!secretKey) {
      return NextResponse.json({ error: 'Stripe not configured' }, { status: 500 });
    }

    const stripe = new Stripe(secretKey);
    const { packageId, successUrl, cancelUrl } = await req.json();

    const pkg = PACKAGES[packageId];
    if (!pkg) {
      return NextResponse.json({ error: 'Invalid package' }, { status: 400 });
    }

    const session = await stripe.checkout.sessions.create({
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
      success_url: successUrl || `${req.nextUrl.origin}/shop?success=true&points=${pkg.points}`,
      cancel_url: cancelUrl || `${req.nextUrl.origin}/shop?canceled=true`,
      metadata: {
        packageId,
        points: String(pkg.points),
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (err: any) {
    console.error('Stripe checkout error:', err.message);
    return NextResponse.json({ error: err.message || 'Payment failed' }, { status: 500 });
  }
}
