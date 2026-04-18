import { NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { checkCredits, deductCredit } from "@/lib/credits";
import { getVideoProvider } from "@/lib/video-providers";
import type { VideoProviderName } from "@/lib/video-providers";

/**
 * POST /api/videos/text-to-video
 *
 * Pipeline directo: guion → Seedance T2V → video final.
 * No requiere keyframes ni seleccion de imagenes.
 *
 * Body: {
 *   title, script, platform, duration,
 *   provider, providerParams, ttsParams, voiceId
 * }
 */
export async function POST(req: Request) {
  try {
    const session = await getServerSession();
    if (!session?.user) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    const userId = (session.user as { id: string }).id;

    const body = await req.json();
    const {
      title,
      script,
      businessContext,
      platform,
      duration,
      provider = "SEEDANCE",
      providerParams,
      ttsParams,
      voiceId,
    } = body;

    if (!script || !platform || !duration) {
      return NextResponse.json({ error: "Faltan campos requeridos: script, platform, duration" }, { status: 400 });
    }

    const videoProvider = getVideoProvider(provider as VideoProviderName);
    if (!videoProvider.supportsT2V || !videoProvider.textToVideo) {
      return NextResponse.json(
        { error: `El proveedor ${provider} no soporta texto-a-video` },
        { status: 400 }
      );
    }

    const credits = await checkCredits(userId);
    if (!credits.hasCredits) {
      return NextResponse.json(
        { error: "No tienes creditos disponibles. Actualiza tu plan." },
        { status: 402 }
      );
    }

    const video = await prisma.video.create({
      data: {
        userId,
        title: title || `Video T2V ${new Date().toLocaleDateString("es-ES")}`,
        script,
        businessContext: businessContext || null,
        platform,
        duration: Number(duration),
        provider: provider as VideoProviderName,
        providerParams: providerParams || undefined,
        ttsParams: ttsParams || undefined,
        voiceId: voiceId || null,
        status: "GENERATING_CLIPS",
        creditsCost: 1,
        generation: {
          create: {
            userId,
            status: "GENERATING_CLIPS",
            steps: { t2v_started: new Date().toISOString() },
          },
        },
      },
    });

    // Dispatch T2V job asynchronously (fire and forget) — the status endpoint polls
    videoProvider
      .textToVideo({
        prompt: script,
        durationSec: Number(duration),
        aspectRatio: "9:16",
        providerParams: providerParams || {},
      })
      .then(async ({ jobId }) => {
        // Store job ID in a synthetic Frame row so the status poller can track it
        await prisma.frame.create({
          data: {
            videoId: video.id,
            order: 0,
            prompt: script,
            imageUrl: "",
            selected: true,
            clipJobId: jobId,
          },
        });
        await prisma.generation.update({
          where: { videoId: video.id },
          data: { steps: { t2v_started: new Date().toISOString(), jobId } },
        });
      })
      .catch(async (err) => {
        console.error("T2V dispatch error:", err);
        await prisma.video.update({
          where: { id: video.id },
          data: { status: "FAILED" },
        });
      });

    await deductCredit(userId);

    return NextResponse.json({ videoId: video.id, mode: "text-to-video" });
  } catch (error) {
    console.error("T2V route error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Error iniciando texto-a-video" },
      { status: 500 }
    );
  }
}
