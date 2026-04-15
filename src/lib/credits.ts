import { prisma } from "@/lib/prisma";
import {
  PLANS,
  type PlanId,
  PROVIDER_PRICING,
  IMAGE_COST_USD,
  TTS_COST_USD_PER_SECOND,
} from "@/lib/constants";
import type { VideoProviderName } from "@/lib/video-providers";

export async function checkCredits(userId: string): Promise<{
  hasCredits: boolean;
  remaining: number;
  isAdmin: boolean;
  ok: boolean;
}> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true, creditsRemaining: true },
  });

  if (!user) return { hasCredits: false, remaining: 0, isAdmin: false, ok: false };

  if (user.role === "ADMIN") {
    return { hasCredits: true, remaining: 999999, isAdmin: true, ok: true };
  }

  return {
    hasCredits: user.creditsRemaining > 0,
    remaining: user.creditsRemaining,
    isAdmin: false,
    ok: user.creditsRemaining > 0,
  };
}

export async function isAdmin(userId: string): Promise<boolean> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true },
  });
  return user?.role === "ADMIN";
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
    data: { creditsRemaining: plan.credits, creditsResetAt: new Date() },
  });
}

export async function getUserPlanLimits(userId: string): Promise<{
  maxDuration: number;
  isAdmin: boolean;
}> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true, planId: true },
  });
  if (!user) return { maxDuration: 15, isAdmin: false };
  if (user.role === "ADMIN") return { maxDuration: 600, isAdmin: true };
  const plan = PLANS[(user.planId as PlanId) || "free"];
  return { maxDuration: plan?.maxDuration || 30, isAdmin: false };
}

/**
 * Estima el coste en USD de generar un video con N frames.
 * Util para trazabilidad / panel admin. No se muestra al usuario final,
 * que paga con creditos del plan (1 video = 1 credito).
 */
export function estimateVideoCostUsd(args: {
  nFrames: number;
  durationSec: number;
  provider: VideoProviderName;
}): number {
  const { nFrames, durationSec, provider } = args;
  const clipCost = PROVIDER_PRICING[provider].clipCostUsd * nFrames;
  const imageCost = IMAGE_COST_USD * nFrames;
  const ttsCost = TTS_COST_USD_PER_SECOND * durationSec;
  return Number((clipCost + imageCost + ttsCost).toFixed(4));
}
