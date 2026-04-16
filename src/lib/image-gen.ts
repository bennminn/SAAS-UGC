import { createOpenAI } from "@ai-sdk/openai";
import { experimental_generateImage as generateImage } from "ai";
import { uploadVideo } from "@/lib/storage";

const openai = createOpenAI({
  apiKey: process.env.OPENAI_API_KEY || "sk-placeholder",
});

export type ImageSize = "1024x1536" | "1024x1024" | "1536x1024";

export interface ImageGenParams {
  size?: ImageSize; // 9:16 para UGC = 1024x1536
  n?: number;
}

export const DEFAULT_IMAGE_PARAMS: Required<ImageGenParams> = {
  size: "1024x1536",
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
 * Genera una imagen con gpt-image-1 via Vercel AI SDK y la sube a Supabase Storage.
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

  const { image } = await generateImage({
    model: openai.image(model),
    prompt,
    size: merged.size,
    n: 1,
  });

  const buffer = Buffer.from(image.base64, "base64");
  const key = `frames/${userId}/${videoId}/${frameId}.png`;
  return uploadVideo(key, buffer, "image/png");
}
