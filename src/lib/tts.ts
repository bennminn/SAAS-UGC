import { uploadVideo } from "@/lib/storage";

const ELEVENLABS_API_BASE = "https://api.elevenlabs.io/v1";

export interface Voice {
  voice_id: string;
  name: string;
  category: string;
  labels: Record<string, string>;
  preview_url: string;
}

export interface TTSParams {
  model_id?: string;
  stability?: number;
  similarity_boost?: number;
  style?: number;
  use_speaker_boost?: boolean;
  speed?: number;
}

export const DEFAULT_TTS_PARAMS: Required<Omit<TTSParams, "speed">> & {
  speed?: number;
} = {
  model_id: "eleven_multilingual_v2",
  stability: 0.5,
  similarity_boost: 0.75,
  style: 0.4,
  use_speaker_boost: true,
};

async function elevenlabsFetch(
  endpoint: string,
  options: RequestInit = {}
): Promise<Response> {
  const apiKey = process.env.ELEVENLABS_API_KEY;
  if (!apiKey) throw new Error("ELEVENLABS_API_KEY no configurada");

  const response = await fetch(`${ELEVENLABS_API_BASE}${endpoint}`, {
    ...options,
    headers: { "xi-api-key": apiKey, ...options.headers },
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`ElevenLabs API error (${response.status}): ${errorBody}`);
  }
  return response;
}

export async function generateSpeech(args: {
  text: string;
  voiceId: string;
  params?: TTSParams;
}): Promise<Buffer> {
  const { text, voiceId, params } = args;
  const merged = { ...DEFAULT_TTS_PARAMS, ...(params || {}) };

  const voiceSettings: Record<string, unknown> = {
    stability: merged.stability,
    similarity_boost: merged.similarity_boost,
    style: merged.style,
    use_speaker_boost: merged.use_speaker_boost,
  };
  if (typeof merged.speed === "number") voiceSettings.speed = merged.speed;

  const response = await elevenlabsFetch(`/text-to-speech/${voiceId}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "audio/mpeg" },
    body: JSON.stringify({
      text,
      model_id: merged.model_id,
      voice_settings: voiceSettings,
    }),
  });

  return Buffer.from(await response.arrayBuffer());
}

export async function generateAndUploadSpeech(args: {
  text: string;
  voiceId: string;
  userId: string;
  videoId: string;
  params?: TTSParams;
}): Promise<{ url: string; buffer: Buffer }> {
  const buffer = await generateSpeech(args);
  const key = `audio/${args.userId}/${args.videoId}.mp3`;
  const url = await uploadVideo(key, buffer, "audio/mpeg");
  return { url, buffer };
}

export async function listVoices(): Promise<Voice[]> {
  const response = await elevenlabsFetch("/voices", { method: "GET" });
  const data = await response.json();
  return data.voices as Voice[];
}

export const TTS_PARAMS_SCHEMA = [
  {
    key: "model_id",
    label: "Modelo TTS",
    type: "enum" as const,
    group: "Modelo",
    default: "eleven_multilingual_v2",
    enum: [
      { value: "eleven_multilingual_v2", label: "Multilingual v2 (recomendado)" },
      { value: "eleven_turbo_v2_5", label: "Turbo v2.5 (baja latencia)" },
      { value: "eleven_multilingual_v1", label: "Multilingual v1" },
    ],
  },
  { key: "stability", label: "Estabilidad", type: "number" as const, group: "Voz", default: 0.5, min: 0, max: 1, step: 0.05 },
  { key: "similarity_boost", label: "Similaridad", type: "number" as const, group: "Voz", default: 0.75, min: 0, max: 1, step: 0.05 },
  { key: "style", label: "Exageracion de estilo", type: "number" as const, group: "Voz", default: 0.4, min: 0, max: 1, step: 0.05 },
  { key: "use_speaker_boost", label: "Speaker boost", type: "boolean" as const, group: "Voz", default: true },
  { key: "speed", label: "Velocidad (1.0 = normal)", type: "number" as const, group: "Voz", default: 1.0, min: 0.7, max: 1.2, step: 0.05 },
];
