"use client";

import { useSession } from "next-auth/react";
import { PLANS, type PlanId } from "@/lib/constants";

export function useCredits() {
  const { data: session } = useSession();
  const user = session?.user as {
    planId?: string;
    creditsRemaining?: number;
    role?: string;
  } | undefined;

  const planId = (user?.planId || "free") as PlanId;
  const plan = PLANS[planId] || PLANS.free;
  const isAdmin = user?.role === "ADMIN";
  const remaining = isAdmin ? Infinity : (user?.creditsRemaining ?? 0);
  const total = plan.credits;
  const hasCredits = isAdmin || remaining > 0;

  return { remaining, total, hasCredits, isAdmin, planId, plan };
}
