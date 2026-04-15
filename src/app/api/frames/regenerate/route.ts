import { NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateFrameImage, DEFAULT_IMAGE_PARAMS } from "@/lib/image-gen";

/**
 * POST /api/frames/regenerate
 * Body: { frameId, promptOverride? }
 * Regenera una sola imagen keyframe con gpt-image-1.
 */
export async function POST(req: Request) {
  try {
    const session = await getServerSession();
    if (!session?.user) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    const userId = (session.user as { id: string }).id;

    const { frameId, promptOverride } = await req.json();
    if (!frameId) return NextResponse.json({ error: "frameId requerido" }, { status: 400 });

    const frame = await prisma.frame.findUnique({
      where: { id: frameId },
      include: { video: true },
    });
    if (!frame) return NextResponse.json({ error: "Frame no encontrado" }, { status: 404 });
    if (frame.video.userId !== userId) {
      return NextResponse.json({ error: "Prohibido" }, { status: 403 });
    }

    const params = {
      ...DEFAULT_IMAGE_PARAMS,
      ...((frame.video.imageParams as Record<string, unknown>) || {}),
    };

    const prompt = promptOverride || frame.prompt;
    const url = await generateFrameImage({
      prompt,
      userId,
      videoId: frame.videoId,
      frameId: frame.id,
      params,
    });

    const updated = await prisma.frame.update({
      where: { id: frame.id },
      data: { imageUrl: url, prompt, selected: false },
    });

    return NextResponse.json({ frame: updated });
  } catch (error) {
    console.error("Frame regenerate error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Error regenerando" },
      { status: 500 }
    );
  }
}
