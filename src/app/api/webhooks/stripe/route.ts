import { NextResponse } from "next/server";
import { stripe as getStripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import { PLANS, type PlanId } from "@/lib/constants";

export async function POST(req: Request) {
  const body = await req.text();
  const signature = req.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  let event;
  try {
    event = getStripe().webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET || ""
    );
  } catch (err) {
    console.error("Stripe webhook signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as unknown as Record<string, unknown>;
        const metadata = session.metadata as Record<string, string> | undefined;
        const userId = metadata?.userId;
        const subscriptionId = session.subscription as string;
        const customerId = session.customer as string;

        if (userId && subscriptionId) {
          const subscription = await getStripe().subscriptions.retrieve(subscriptionId) as unknown as unknown as Record<string, unknown>;
          const items = subscription.items as { data: Array<{ price: { id: string } }> };
          const priceId = items.data[0]?.price.id;

          const planEntry = Object.entries(PLANS).find(
            ([, plan]) => plan.stripePriceId === priceId
          );
          const planId = (planEntry?.[0] || "pro") as PlanId;

          await prisma.user.update({
            where: { id: userId },
            data: {
              stripeCustomerId: customerId,
              planId,
              creditsRemaining: PLANS[planId].credits,
            },
          });

          const periodStart = subscription.current_period_start as number;
          const periodEnd = subscription.current_period_end as number;

          await prisma.subscription.create({
            data: {
              userId,
              stripeSubscriptionId: subscriptionId,
              stripePriceId: priceId,
              status: subscription.status as string,
              currentPeriodStart: new Date(periodStart * 1000),
              currentPeriodEnd: new Date(periodEnd * 1000),
            },
          });
        }
        break;
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object as unknown as unknown as Record<string, unknown>;
        const periodStart = subscription.current_period_start as number;
        const periodEnd = subscription.current_period_end as number;
        await prisma.subscription.update({
          where: { stripeSubscriptionId: subscription.id as string },
          data: {
            status: subscription.status as string,
            currentPeriodStart: new Date(periodStart * 1000),
            currentPeriodEnd: new Date(periodEnd * 1000),
          },
        });
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as unknown as unknown as Record<string, unknown>;
        await prisma.subscription.update({
          where: { stripeSubscriptionId: subscription.id as string },
          data: { status: "canceled" },
        });

        const sub = await prisma.subscription.findUnique({
          where: { stripeSubscriptionId: subscription.id as string },
        });
        if (sub) {
          await prisma.user.update({
            where: { id: sub.userId },
            data: { planId: "free", creditsRemaining: PLANS.free.credits },
          });
        }
        break;
      }

      case "invoice.paid": {
        const invoice = event.data.object as unknown as unknown as Record<string, unknown>;
        const subscriptionId = invoice.subscription as string;
        if (subscriptionId) {
          const sub = await prisma.subscription.findUnique({
            where: { stripeSubscriptionId: subscriptionId },
          });
          if (sub) {
            const user = await prisma.user.findUnique({ where: { id: sub.userId } });
            if (user) {
              const plan = PLANS[user.planId as PlanId];
              if (plan) {
                await prisma.user.update({
                  where: { id: user.id },
                  data: { creditsRemaining: plan.credits, creditsResetAt: new Date() },
                });
              }
            }
          }
        }
        break;
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Stripe webhook error:", error);
    return NextResponse.json({ error: "Webhook handler error" }, { status: 500 });
  }
}
