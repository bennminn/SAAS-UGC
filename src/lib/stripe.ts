import Stripe from "stripe";

let _stripe: Stripe | null = null;

function getStripeClient(): Stripe {
  if (!_stripe) {
    _stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "sk_test_placeholder", {
      apiVersion: "2025-03-31.basil",
    });
  }
  return _stripe;
}

export { getStripeClient as stripe };

export async function createCheckoutSession(
  userId: string,
  priceId: string,
  customerEmail: string,
  customerId?: string
): Promise<string> {
  const s = getStripeClient();
  const session = await s.checkout.sessions.create({
    mode: "subscription",
    payment_method_types: ["card"],
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${process.env.NEXTAUTH_URL}/dashboard?checkout=success`,
    cancel_url: `${process.env.NEXTAUTH_URL}/pricing?checkout=cancelled`,
    customer: customerId || undefined,
    customer_email: customerId ? undefined : customerEmail,
    metadata: { userId },
  });
  return session.url || "";
}

export async function createPortalSession(customerId: string): Promise<string> {
  const s = getStripeClient();
  const session = await s.billingPortal.sessions.create({
    customer: customerId,
    return_url: `${process.env.NEXTAUTH_URL}/settings`,
  });
  return session.url;
}

export async function getSubscription(subscriptionId: string) {
  return getStripeClient().subscriptions.retrieve(subscriptionId);
}
