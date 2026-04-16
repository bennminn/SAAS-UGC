import { NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getVideoProvider } from "@/lib/video-providers";
import { uploadVideo } from "@/lib/storage";
import { generateAndUploadSpeech } from "@/lib/tts";
import { composeVideo } from "@/lib/compose";

/**
 * GET /api/videos/[id]/status
 * Polling endpoint. Consulta el estado actual del video y,
 * si esta en GENERATING_CLIPS, hace polling al proveedor y avanza el pipeline.
 * Ideal para entornos sin webhooks.
 */
export async function GET(
  _req: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await ctx.params;
    const session = await getServerSession();
    if (!session?.user) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    const userId = (session.user as { id: string }).id;

    const video = await prisma.video.findUnique({
      where: { id },
      include: { frames: { orderBy: { order: "asc" } } },
    });
    if (!video) return NextResponse.json({ error: "Video no encontrado" }, { status: 404 });
    if (video.userId !== userId) return NextResponse.json({ error: "Prohibido" }, { status: 403 });

    // Si ya esta en un estado terminal, devolver.
    if (video.status === "COMPLETED" || video.status === "FAILED") {
      return NextResponse.json({ video, frames: video.frames });
    }

    // Si esta esperando seleccion, solo reportar.
    if (video.status !== "GENERATING_CLIPS" && video.status !== "GENERATING_AUDIO" && video.status !== "COMPOSING") {
      return NextResponse.json({ video, frames: video.frames });
    }

    // GENERATING_CLIPS: consultar providers por los frames pendientes.
    if (video.status === "GENERATING_CLIPS") {
      const provider = getVideoProvider(video.provider);
      const pending = video.frames.filter(
        (f) => f.selected && f.clipStatus === "GENERATING" && f.clipJobId
      );
      for (const f of pending) {
        try {
          const st = await provider.getStatus(f.clipJobId!);
          if (st.status === "done" && st.clipUrl) {
            // Descargar y subir a S3
            let finalUrl = st.clipUrl;
            try {
              const resp = await fetch(st.clipUrl);
              const buf = Buffer.from(await resp.arrayBuffer());
              finalUrl = await uploadVideo(
                `clips/${userId}/${video.id}/${f.id}.mp4`,
                buf,
                "video/mp4"
              );
            } catch (e) {
              console.error("Error descargando clip:", e);
            }
            await prisma.frame.update({
              where: { id: f.id },
              data: { clipUrl: finalUrl, clipStatus: "DONE" },
            });
          } else if (st.status === "failed") {
            await prisma.frame.update({
              where: { id: f.id },
              data: { clipStatus: "FAILED" },
            });
          }
        } catch (e) {
          console.error("Error polling clip:", e);
        }
      }

      // Reevaluar
      const refreshed = await prisma.frame.findMany({
        where: { videoId: video.id, selected: true },
        orderBy: { order: "asc" },
      });
      const allDone = refreshed.every((f) => f.clipStatus === "DONE");
      const anyFailed = refreshed.some((f) => f.clipStatus === "FAILED");

      if (anyFailed) {
        await prisma.video.update({
          where: { id: video.id },
          data: { status: "FAILED", errorMessage: "Fallo al generar algun clip" },
        });
        await prisma.generation.update({
          where: { videoId: video.id },
          data: { status: "FAILED" },
        });
      } else if (allDone) {
        // Avanzar: GENERATING_AUDIO
        await prisma.video.update({
          where: { id: video.id },
          data: { status: "GENERATING_AUDIO" },
        });
        await prisma.generation.update({
          where: { videoId: video.id },
          data: {
            status: "GENERATING_AUDIO",
            steps: { audio_started: new Date().toISOString() },
          },
        });
        // Disparar audio + compose async (fire-and-forget)
        void finalizeVideo(video.id).catch((e) =>
          console.error("finalizeVideo error:", e)
        );
      }
    }

    const updated = await prisma.video.findUnique({
      where: { id },
      include: { frames: { orderBy: { order: "asc" } } },
    });
    return NextResponse.json({ video: updated, frames: updated?.frames || [] });
  } catch (error) {
    console.error("Status error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Error de estado" },
      { status: 500 }
    );
  }
}

async function finalizeVideo(videoId: string) {
  const video = await prisma.video.findUnique({
    where: { id: videoId },
    include: { frames: { where: { selected: true }, orderBy: { order: "asc" } } },
  });
  if (!video) return;
  try {
    // 1. TTS
    const voiceId = video.voiceId || "21m00Tcm4TlvDq8ikWAM";
    const { url: audioUrl } = await generateAndUploadSpeech({
      text: video.script,
      voiceId,
      userId: video.userId,
      videoId: video.id,
      params: (video.ttsParams as Record<string, unknown>) || undefined,
    });

    await prisma.video.update({
      where: { id: video.id },
      data: { status: "COMPOSING" },
    });
    await prisma.generation.update({
      where: { videoId: video.id },
      data: {
        status: "COMPOSING",
        steps: { compose_started: new Date().toISOString() },
      },
    });

    // 2. ffmpeg compose
    const clipUrls = video.frames
      .map((f) => f.clipUrl)
      .filter((u): u is string => !!u);
    const { videoUrl, thumbnailUrl } = await composeVideo({
      userId: video.userId,
      videoId: video.id,
      clipUrls,
      audioUrl,
    });

    await prisma.video.update({
      where: { id: video.id },
      data: { status: "COMPLETED", videoUrl, thumbnailUrl },
    });
    await prisma.generation.update({
      where: { videoId: video.id },
      data: {
        status: "COMPLETED",
        completedAt: new Date(),
        steps: { completed: new Date().toISOString() },
      },
    });
  } catch (e) {
    console.error("finalizeVideo:", e);
    await prisma.video.update({
      where: { id: video.id },
      data: {
        status: "FAILED",
        errorMessage: e instanceof Error ? e.message : String(e),
      },
    });
    await prisma.generation.update({
      where: { videoId: video.id },
      data: { status: "FAILED" },
    });
  }
}
