/**
 * Stripe integration placeholder for MVP.
 *
 * In production, Stripe Payment Links or Checkout Sessions (via a server)
 * would handle purchases. For now, we simulate a successful purchase by
 * crediting points directly.
 */

export async function buyPoints(
  _packageId: string,
  _userId: string
): Promise<{ success: boolean; message: string }> {
  // MVP: This will be replaced with Stripe Payment Links
  // For now, return a placeholder response
  return {
    success: false,
    message: 'Payment integration coming soon!',
  };
}
