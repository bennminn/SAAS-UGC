import { prisma } from "@/lib/prisma";
import { PLANS, type PlanId } from "@/lib/constants";

export async function checkCredits(userId: string): Promise<{
  hasCredits: boolean;
  remaining: number;
  isAdmin: boolean;
}> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true, creditsRemaining: true },
  });

  if (!user) {
    return { hasCredits: false, remaining: 0, isAdmin: false };
  }

  if (user.role === "ADMIN") {
    return { hasCredits: true, remaining: 999999, isAdmin: true };
  }

  return {
    hasCredits: user.creditsRemaining > 0,
    remaining: user.creditsRemaining,
    isAdmin: false,
  };
}

export async function deductCredit(userId: string): Promise<void> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true },
  });

  if (user?.role === "ADMIN") return;

  await prisma.user.update({
    where: { id: userId },
    data: { creditsRemaining: { decrement: 1 } },
  });
}

export async function resetCredits(userId: string, planId: string): Promise<void> {
  const plan = PLANS[planId as PlanId];
  if (!plan) return;

  await prisma.user.update({
    where: { id: userId },
    data: {
      creditsRemaining: plan.credits,
      creditsResetAt: new Date(),
    },
  });
}
