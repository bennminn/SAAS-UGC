import { NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { checkCredits, estimateVideoCostUsd } from "@/lib/credits";
import { buildFramePrompts, generateFrameImage, DEFAULT_IMAGE_PARAMS } from "@/lib/image-gen";
import { SECONDS_PER_CLIP, VIDEO_STYLES } from "@/lib/constants";
import type { VideoProviderName } from "@/lib/video-providers";

/**
 * POST /api/frames/generate
 * Crea el Video (status=GENERATING_FRAMES), genera N keyframes con gpt-image-1
 * y los deja listos para que el usuario seleccione.
 *
 * Body: {
 *   title, script, businessContext, platform, duration, style,
 *   provider, providerParams, imageParams, ttsParams, voiceId
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
      style,
      provider = "SEEDANCE",
      providerParams,
      imageParams,
      ttsParams,
      voiceId,
    } = body;

    if (!script || !platform || !duration) {
      return NextResponse.json({ error: "Faltan campos requeridos" }, { status: 400 });
    }

    const credits = await checkCredits(userId);
    if (!credits.hasCredits) {
      return NextResponse.json(
        { error: "No tienes creditos disponibles. Actualiza tu plan." },
        { status: 402 }
      );
    }

    const nFrames = Math.max(1, Math.ceil(Number(duration) / SECONDS_PER_CLIP));
    const styleDef = VIDEO_STYLES.find((s) => s.id === style);

    const video = await prisma.video.create({
      data: {
        userId,
        title: title || `Video ${new Date().toLocaleDateString("es-ES")}`,
        script,
        businessContext: businessContext || null,
        platform,
        duration: Number(duration),
        style: style || null,
        provider: provider as VideoProviderName,
        providerParams: providerParams || undefined,
        imageParams: imageParams || undefined,
        ttsParams: ttsParams || undefined,
        voiceId: voiceId || null,
        status: "GENERATING_FRAMES",
        creditsCost: Math.round(
          estimateVideoCostUsd({ nFrames, durationSec: Number(duration), provider: provider as VideoProviderName }) * 100
        ),
        generation: {
          create: {
            userId,
            status: "GENERATING_FRAMES",
            steps: { frames_started: new Date().toISOString() },
          },
        },
      },
    });

    const blueprints = buildFramePrompts({
      script,
      businessContext,
      stylePromptSuffix: styleDef?.promptSuffix,
      nFrames,
    });

    // Crear filas de Frame y generar en paralelo (limitado para no saturar)
    const frameRows = await Promise.all(
      blueprints.map((bp) =>
        prisma.frame.create({
          data: {
            videoId: video.id,
            order: bp.order,
            prompt: bp.prompt,
            imageUrl: "",
            selected: false,
          },
        })
      )
    );

    // Generacion serial para evitar rate limits agresivos
    const params = { ...DEFAULT_IMAGE_PARAMS, ...(imageParams || {}) };
    for (const f of frameRows) {
      try {
        const url = await generateFrameImage({
          prompt: f.prompt,
          userId,
          videoId: video.id,
          frameId: f.id,
          params,
        });
        await prisma.frame.update({ where: { id: f.id }, data: { imageUrl: url } });
      } catch (e) {
        console.error("Error generando frame:", e);
        await prisma.frame.update({
          where: { id: f.id },
          data: { imageUrl: "", clipStatus: "FAILED" },
        });
      }
    }

    await prisma.video.update({
      where: { id: video.id },
      data: { status: "AWAITING_FRAME_SELECTION" },
    });
    await prisma.generation.update({
      where: { videoId: video.id },
      data: {
        status: "AWAITING_FRAME_SELECTION",
        steps: { frames_ready: new Date().toISOString() },
      },
    });

    const frames = await prisma.frame.findMany({
      where: { videoId: video.id },
      orderBy: { order: "asc" },
    });

    return NextResponse.json({ videoId: video.id, frames });
  } catch (error) {
    console.error("Frame generation error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Error generando frames" },
      { status: 500 }
    );
  }
}
