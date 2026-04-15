import { NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getVideoProvider } from "@/lib/video-providers";
import { deductCredit, checkCredits } from "@/lib/credits";

/**
 * POST /api/videos/[id]/animate
 * Body: { selectedFrameIds: string[] }
 * Dispara el image-to-video con el proveedor configurado en el Video.
 */
export async function POST(
  req: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await ctx.params;
    const session = await getServerSession();
    if (!session?.user) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    const userId = (session.user as { id: string }).id;

    const { selectedFrameIds } = await req.json();
    if (!Array.isArray(selectedFrameIds) || selectedFrameIds.length === 0) {
      return NextResponse.json({ error: "Selecciona al menos un frame" }, { status: 400 });
    }

    const video = await prisma.video.findUnique({
      where: { id },
      include: { frames: { orderBy: { order: "asc" } } },
    });
    if (!video) return NextResponse.json({ error: "Video no encontrado" }, { status: 404 });
    if (video.userId !== userId) return NextResponse.json({ error: "Prohibido" }, { status: 403 });

    const credits = await checkCredits(userId);
    if (!credits.hasCredits) {
      return NextResponse.json({ error: "Sin creditos" }, { status: 402 });
    }

    // Marcar seleccion
    await prisma.$transaction([
      prisma.frame.updateMany({
        where: { videoId: video.id },
        data: { selected: false },
      }),
      prisma.frame.updateMany({
        where: { videoId: video.id, id: { in: selectedFrameIds } },
        data: { selected: true },
      }),
    ]);

    await prisma.video.update({
      where: { id: video.id },
      data: { status: "GENERATING_CLIPS" },
    });
    await prisma.generation.update({
      where: { videoId: video.id },
      data: {
        status: "GENERATING_CLIPS",
        startedAt: new Date(),
        steps: { clips_started: new Date().toISOString() },
      },
    });

    const provider = getVideoProvider(video.provider);
    const providerParams = (video.providerParams as Record<string, unknown>) || {};
    const webhookBase = process.env.NEXTAUTH_URL;
    const webhookUrl = webhookBase
      ? `${webhookBase}/api/webhooks/video-provider?videoId=${video.id}`
      : undefined;

    const selected = video.frames.filter((f) => selectedFrameIds.includes(f.id));
    for (const f of selected) {
      try {
        const { jobId } = await provider.imageToVideo({
          imageUrl: f.imageUrl,
          motionPrompt: f.prompt,
          durationSec: video.duration || 5,
          aspectRatio: "9:16",
          providerParams,
          webhookUrl,
        });
        await prisma.frame.update({
          where: { id: f.id },
          data: { clipJobId: jobId, clipStatus: "GENERATING" },
        });
      } catch (e) {
        console.error("Error image-to-video:", e);
        await prisma.frame.update({
          where: { id: f.id },
          data: { clipStatus: "FAILED" },
        });
      }
    }

    // Descontar credito al lanzar (1 video = 1 credito). Admin bypass en deductCredit.
    await deductCredit(userId);

    return NextResponse.json({ videoId: video.id, status: "GENERATING_CLIPS" });
  } catch (error) {
    console.error("Animate error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Error iniciando animacion" },
      { status: 500 }
    );
  }
}
