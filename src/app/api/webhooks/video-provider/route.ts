import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { uploadVideo } from "@/lib/s3";

/**
 * POST /api/webhooks/video-provider?videoId=...
 * Callback generico. Intenta detectar el proveedor y extraer jobId + url.
 * Si un proveedor no soporta webhook, use el endpoint de polling
 * /api/videos/[id]/status para avanzar el pipeline.
 */
export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const url = new URL(req.url);
    const videoIdHint = url.searchParams.get("videoId");

    // Normalizar campos comunes
    const jobId =
      body.task_id ||
      body.data?.task_id ||
      body.id ||
      body.job_id ||
      null;
    const clipUrl =
      body.video_url ||
      body.output?.video_url ||
      body.content?.video_url ||
      body.data?.task_result?.videos?.[0]?.url ||
      body.task_result?.videos?.[0]?.url ||
      null;
    const rawStatus = String(
      body.task_status || body.status || body.output?.task_status || ""
    ).toLowerCase();
    const done = ["succeeded", "succeed", "completed", "done"].includes(rawStatus);
    const failed = ["failed", "cancelled", "canceled"].includes(rawStatus);

    if (!jobId && !videoIdHint) {
      return NextResponse.json({ ok: false, reason: "sin jobId ni videoId" }, { status: 200 });
    }

    const frame = jobId
      ? await prisma.frame.findFirst({ where: { clipJobId: String(jobId) } })
      : null;

    if (!frame) {
      return NextResponse.json({ ok: false, reason: "frame no encontrado" }, { status: 200 });
    }

    if (done && clipUrl) {
      let finalUrl = clipUrl as string;
      try {
        const resp = await fetch(clipUrl);
        const buf = Buffer.from(await resp.arrayBuffer());
        const video = await prisma.video.findUnique({ where: { id: frame.videoId } });
        if (video) {
          finalUrl = await uploadVideo(
            `clips/${video.userId}/${video.id}/${frame.id}.mp4`,
            buf,
            "video/mp4"
          );
        }
      } catch (e) {
        console.error("S3 upload clip error:", e);
      }
      await prisma.frame.update({
        where: { id: frame.id },
        data: { clipUrl: finalUrl, clipStatus: "DONE" },
      });
    } else if (failed) {
      await prisma.frame.update({
        where: { id: frame.id },
        data: { clipStatus: "FAILED" },
      });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Webhook video-provider error:", error);
    return NextResponse.json({ error: "Error procesando webhook" }, { status: 500 });
  }
}
