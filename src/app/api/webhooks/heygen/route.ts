import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { uploadVideo } from "@/lib/s3";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { event_type, video_id, video_url, status } = body;

    if (!video_id) {
      return NextResponse.json({ error: "Missing video_id" }, { status: 400 });
    }

    const video = await prisma.video.findFirst({
      where: { providerJobId: video_id },
      include: { generation: true },
    });

    if (!video) {
      return NextResponse.json({ error: "Video not found" }, { status: 404 });
    }

    if (status === "completed" || event_type === "video.completed") {
      let finalUrl = video_url;

      if (video_url) {
        try {
          const response = await fetch(video_url);
          const buffer = Buffer.from(await response.arrayBuffer());
          const key = `videos/${video.userId}/${video.id}.mp4`;
          finalUrl = await uploadVideo(key, buffer, "video/mp4");
        } catch (err) {
          console.error("S3 upload error:", err);
          finalUrl = video_url;
        }
      }

      await prisma.video.update({
        where: { id: video.id },
        data: { status: "COMPLETED", videoUrl: finalUrl },
      });

      if (video.generation) {
        await prisma.generation.update({
          where: { id: video.generation.id },
          data: {
            status: "COMPLETED",
            completedAt: new Date(),
            steps: {
              ...(video.generation.steps as object),
              completed: new Date().toISOString(),
            },
          },
        });
      }
    } else if (status === "failed" || event_type === "video.failed") {
      await prisma.video.update({
        where: { id: video.id },
        data: { status: "FAILED", errorMessage: body.error || "Error en la generacion" },
      });

      if (video.generation) {
        await prisma.generation.update({
          where: { id: video.generation.id },
          data: { status: "FAILED" },
        });
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("HeyGen webhook error:", error);
    return NextResponse.json({ error: "Webhook processing error" }, { status: 500 });
  }
}
