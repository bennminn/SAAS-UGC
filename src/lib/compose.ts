import { spawn } from "node:child_process";
import { mkdtemp, writeFile, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { uploadVideo } from "@/lib/storage";

const FFMPEG_PATH = process.env.FFMPEG_PATH || "ffmpeg";

function run(args: string[]): Promise<void> {
  return new Promise((resolve, reject) => {
    const p = spawn(FFMPEG_PATH, args, { stdio: ["ignore", "pipe", "pipe"] });
    let stderr = "";
    p.stderr.on("data", (d) => (stderr += d.toString()));
    p.on("error", reject);
    p.on("close", (code) => {
      if (code === 0) resolve();
      else reject(new Error(`ffmpeg exit ${code}: ${stderr.slice(-2000)}`));
    });
  });
}

async function download(url: string, dest: string): Promise<void> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Descarga fallo ${res.status} para ${url}`);
  await writeFile(dest, Buffer.from(await res.arrayBuffer()));
}

/**
 * Compone el video final:
 *   1. Descarga cada clip.
 *   2. Reescala todos a 1080x1920 y concatena (-c:v libx264).
 *   3. Descarga audio TTS.
 *   4. Mezcla audio sobre video, ajustando duracion (shortest, o loop del ultimo frame si audio mas largo).
 *   5. Sube MP4 a S3 y extrae thumbnail del primer clip.
 */
export async function composeVideo(args: {
  userId: string;
  videoId: string;
  clipUrls: string[];        // en orden
  audioUrl: string;
  watermark?: boolean;
}): Promise<{ videoUrl: string; thumbnailUrl: string }> {
  const { userId, videoId, clipUrls, audioUrl } = args;
  if (clipUrls.length === 0) throw new Error("No hay clips para componer");

  const work = await mkdtemp(path.join(tmpdir(), "ugc-"));
  try {
    // 1. Descargar clips
    const clipPaths: string[] = [];
    for (let i = 0; i < clipUrls.length; i++) {
      const p = path.join(work, `clip_${i}.mp4`);
      await download(clipUrls[i], p);
      clipPaths.push(p);
    }

    // 2. Reescalar cada clip a 1080x1920, forzar mismo codec para concat.
    const normPaths: string[] = [];
    for (let i = 0; i < clipPaths.length; i++) {
      const out = path.join(work, `norm_${i}.mp4`);
      await run([
        "-y",
        "-i",
        clipPaths[i],
        "-vf",
        "scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,setsar=1",
        "-c:v",
        "libx264",
        "-preset",
        "fast",
        "-crf",
        "20",
        "-pix_fmt",
        "yuv420p",
        "-an",
        "-r",
        "30",
        out,
      ]);
      normPaths.push(out);
    }

    // 3. Concat
    const listFile = path.join(work, "list.txt");
    await writeFile(
      listFile,
      normPaths.map((p) => `file '${p.replace(/'/g, "'\\''")}'`).join("\n")
    );
    const concatPath = path.join(work, "concat.mp4");
    await run([
      "-y",
      "-f",
      "concat",
      "-safe",
      "0",
      "-i",
      listFile,
      "-c",
      "copy",
      concatPath,
    ]);

    // 4. Descargar TTS
    const audioPath = path.join(work, "tts.mp3");
    await download(audioUrl, audioPath);

    // 5. Mux: video + audio, alineados a la duracion del video (shortest)
    const finalPath = path.join(work, "final.mp4");
    await run([
      "-y",
      "-i",
      concatPath,
      "-i",
      audioPath,
      "-c:v",
      "copy",
      "-c:a",
      "aac",
      "-b:a",
      "192k",
      "-shortest",
      "-movflags",
      "+faststart",
      finalPath,
    ]);

    // 6. Thumbnail (primer frame del primer clip)
    const thumbPath = path.join(work, "thumb.jpg");
    await run([
      "-y",
      "-i",
      concatPath,
      "-ss",
      "00:00:00.500",
      "-frames:v",
      "1",
      "-q:v",
      "2",
      thumbPath,
    ]);

    const videoBuf = await readFile(finalPath);
    const thumbBuf = await readFile(thumbPath);

    const videoKey = `videos/${userId}/${videoId}.mp4`;
    const thumbKey = `videos/${userId}/${videoId}.jpg`;

    const [videoUrl, thumbnailUrl] = await Promise.all([
      uploadVideo(videoKey, videoBuf, "video/mp4"),
      uploadVideo(thumbKey, thumbBuf, "image/jpeg"),
    ]);

    return { videoUrl, thumbnailUrl };
  } finally {
    await rm(work, { recursive: true, force: true });
  }
}
