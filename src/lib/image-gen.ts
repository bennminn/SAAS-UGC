import OpenAI from "openai";
import { uploadVideo } from "@/lib/s3";

let _openai: OpenAI | null = null;
function getOpenAI(): OpenAI {
  if (!_openai) {
    _openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY || "sk-placeholder" });
  }
  return _openai;
}

export type ImageSize = "1024x1536" | "1024x1024" | "1536x1024";
export type ImageQuality = "low" | "medium" | "high" | "auto";
export type ImageBackground = "transparent" | "opaque" | "auto";

export interface ImageGenParams {
  // Defaults que tambien expone el modo avanzado:
  size?: ImageSize; // 9:16 para UGC = 1024x1536
  quality?: ImageQuality;
  background?: ImageBackground;
  moderation?: "auto" | "low";
  n?: number;
}

export const DEFAULT_IMAGE_PARAMS: Required<ImageGenParams> = {
  size: "1024x1536",
  quality: "medium",
  background: "auto",
  moderation: "auto",
  n: 1,
};

export interface FrameBlueprint {
  order: number;
  prompt: string;
}

/**
 * Construye los prompts de keyframes a partir del guion + contexto + estilo.
 * Divide el guion en N beats (uno por frame), y decora cada beat con estilo visual.
 */
export function buildFramePrompts(args: {
  script: string;
  businessContext?: string | null;
  stylePromptSuffix?: string | null;
  nFrames: number;
}): FrameBlueprint[] {
  const { script, businessContext, stylePromptSuffix, nFrames } = args;
  const cleanScript = script.replace(/\s+/g, " ").trim();
  const sentences = cleanScript
    .split(/(?<=[.!?])\s+/)
    .filter((s) => s.length > 0);

  const beats: string[] = [];
  if (sentences.length >= nFrames) {
    const perBeat = Math.ceil(sentences.length / nFrames);
    for (let i = 0; i < nFrames; i++) {
      beats.push(sentences.slice(i * perBeat, (i + 1) * perBeat).join(" "));
    }
  } else {
    // Pocas oraciones: repartir texto en chunks de caracteres.
    const chunk = Math.ceil(cleanScript.length / nFrames);
    for (let i = 0; i < nFrames; i++) {
      beats.push(cleanScript.slice(i * chunk, (i + 1) * chunk));
    }
  }

  const contextLine = businessContext
    ? `Contexto de marca: ${businessContext}. `
    : "";
  const styleLine = stylePromptSuffix ? ` Estilo: ${stylePromptSuffix}.` : "";

  return beats.map((beat, i) => ({
    order: i,
    prompt:
      `${contextLine}Frame ${i + 1} de ${nFrames} de un video UGC vertical 9:16 ` +
      `para TikTok / Reels. Narrativa del frame: ${beat}` +
      styleLine +
      ` Fotografia ultra realista, composicion vertical, alta definicion, sin texto sobreimpreso.`,
  }));
}

/**
 * Genera una imagen con gpt-image-1 y la sube a S3.
 * Devuelve la URL publica.
 */
export async function generateFrameImage(args: {
  prompt: string;
  userId: string;
  videoId: string;
  frameId: string;
  params?: ImageGenParams;
}): Promise<string> {
  const { prompt, userId, videoId, frameId, params } = args;
  const merged = { ...DEFAULT_IMAGE_PARAMS, ...(params || {}) };

  const model = process.env.OPENAI_IMAGE_MODEL || "gpt-image-1";
  const resp = await getOpenAI().images.generate({
    model,
    prompt,
    size: merged.size,
    quality: merged.quality,
    background: merged.background,
    moderation: merged.moderation,
    n: 1,
  });

  const b64 = resp.data?.[0]?.b64_json;
  if (!b64) throw new Error("gpt-image-1 no devolvio imagen");

  const buffer = Buffer.from(b64, "base64");
  const key = `frames/${userId}/${videoId}/${frameId}.png`;
  return uploadVideo(key, buffer, "image/png");
}
