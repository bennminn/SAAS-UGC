import { NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { checkCredits, deductCredit } from "@/lib/credits";
import { createVideoGeneration } from "@/lib/heygen";
import { AVATARS, VOICES } from "@/lib/constants";

export async function POST(req: Request) {
  try {
    const session = await getServerSession();
    if (!session?.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const userId = (session.user as { id: string }).id;
    const body = await req.json();
    const { title, script, avatarId, voiceId, templateId, platform } = body;

    if (!script || !avatarId || !voiceId || !platform) {
      return NextResponse.json({ error: "Faltan campos requeridos" }, { status: 400 });
    }

    const credits = await checkCredits(userId);
    if (!credits.hasCredits) {
      return NextResponse.json(
        { error: "No tienes creditos disponibles. Actualiza tu plan." },
        { status: 403 }
      );
    }

    const avatar = AVATARS.find((a) => a.id === avatarId);
    const voice = VOICES.find((v) => v.id === voiceId);

    const video = await prisma.video.create({
      data: {
        userId,
        title: title || `Video ${new Date().toLocaleDateString("es-ES")}`,
        script,
        avatarId,
        voiceId,
        templateId,
        platform,
        status: "PROCESSING",
        generation: {
          create: {
            userId,
            status: "QUEUED",
            steps: { queued: new Date().toISOString() },
          },
        },
      },
      include: { generation: true },
    });

    try {
      const webhookUrl = `${process.env.NEXTAUTH_URL}/api/webhooks/heygen`;
      const result = await createVideoGeneration({
        script,
        avatarId: avatar?.heygenAvatarId || avatarId,
        voiceId: voice?.elevenlabsVoiceId || voiceId,
        webhookUrl,
      });

      await prisma.video.update({
        where: { id: video.id },
        data: { providerJobId: result.jobId },
      });

      await prisma.generation.update({
        where: { videoId: video.id },
        data: {
          status: "GENERATING_VIDEO",
          startedAt: new Date(),
          steps: {
            queued: new Date().toISOString(),
            generating_video: new Date().toISOString(),
          },
        },
      });
    } catch (error) {
      console.error("HeyGen API error:", error);
      await prisma.generation.update({
        where: { videoId: video.id },
        data: {
          status: "GENERATING_VIDEO",
          startedAt: new Date(),
        },
      });
    }

    if (!credits.isAdmin) {
      await deductCredit(userId);
    }

    return NextResponse.json({ id: video.id, status: "PROCESSING" });
  } catch (error) {
    console.error("Video generation error:", error);
    return NextResponse.json({ error: "Error al iniciar la generacion" }, { status: 500 });
  }
}
