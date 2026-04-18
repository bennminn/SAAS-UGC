import type {
  VideoProvider,
  ImageToVideoInput,
  TextToVideoInput,
  ImageToVideoResult,
  VideoJobStatus,
  ParamSchemaField,
} from "./types";

// Seedance 2.0 via ByteDance / Volcengine Ark API.
// Endpoint docs: https://docs.byteplus.com/en/docs/ModelArk/1520757
const SEEDANCE_API_BASE =
  process.env.SEEDANCE_API_BASE ||
  "https://ark.cn-beijing.volces.com/api/v3";

function getApiKey(): string {
  const key = process.env.SEEDANCE_API_KEY;
  if (!key) throw new Error("SEEDANCE_API_KEY no configurada");
  return key;
}

// ─── I2V schema ────────────────────────────────────────────────────────────────

const i2vSchema: ParamSchemaField[] = [
  {
    key: "model",
    label: "Modelo I2V",
    type: "enum",
    group: "Calidad",
    default: "doubao-seedance-1-0-pro-250428",
    enum: [
      { value: "doubao-seedance-2-0-pro-260215", label: "Seedance 2.0 Pro (mejor calidad)" },
      { value: "doubao-seedance-2-0-260128", label: "Seedance 2.0 Standard" },
      { value: "doubao-seedance-2-0-fast-260128", label: "Seedance 2.0 Fast (rapido)" },
      { value: "doubao-seedance-1-0-pro-250428", label: "Seedance 1.0 Pro" },
      { value: "doubao-seedance-1-0-lite-i2v-250219", label: "Seedance 1.0 Lite I2V" },
    ],
  },
  {
    key: "resolution",
    label: "Resolucion",
    type: "enum",
    group: "Calidad",
    default: "1080p",
    enum: [
      { value: "480p", label: "480p" },
      { value: "720p", label: "720p" },
      { value: "1080p", label: "1080p" },
    ],
  },
  {
    key: "duration",
    label: "Duracion del clip (s)",
    type: "enum",
    group: "Calidad",
    default: "5",
    enum: [
      { value: "5", label: "5 segundos" },
      { value: "10", label: "10 segundos" },
    ],
  },
  {
    key: "camera_fixed",
    label: "Camara fija",
    type: "boolean",
    group: "Camara",
    default: false,
    help: "La camara no se mueve; solo se anima el sujeto",
  },
  {
    key: "generate_audio",
    label: "Generar audio nativo",
    type: "boolean",
    group: "Audio",
    default: false,
    help: "Seedance 2.0+ puede generar audio ambiental sincronizado",
  },
  {
    key: "seed",
    label: "Seed",
    type: "number",
    group: "Avanzado",
    default: -1,
    min: -1,
    max: 2147483647,
    help: "-1 = aleatorio",
  },
  {
    key: "watermark",
    label: "Marca de agua",
    type: "boolean",
    group: "Avanzado",
    default: false,
  },
  {
    key: "draft",
    label: "Modo borrador",
    type: "boolean",
    group: "Avanzado",
    default: false,
    help: "Mas rapido y barato; menor calidad. Ideal para previsualizar.",
  },
];

const i2vDefaults = Object.fromEntries(
  i2vSchema.map((f) => [f.key, f.default])
) as Record<string, unknown>;

// ─── T2V schema ────────────────────────────────────────────────────────────────

const t2vSchema: ParamSchemaField[] = [
  {
    key: "model",
    label: "Modelo T2V",
    type: "enum",
    group: "Calidad",
    default: "doubao-seedance-2-0-pro-260215",
    enum: [
      { value: "doubao-seedance-2-0-pro-260215", label: "Seedance 2.0 Pro (maxima calidad)" },
      { value: "doubao-seedance-2-0-260128", label: "Seedance 2.0 Standard" },
      { value: "doubao-seedance-2-0-fast-260128", label: "Seedance 2.0 Fast (rapido y barato)" },
      { value: "doubao-seedance-1-5-pro-251215", label: "Seedance 1.5 Pro" },
      { value: "doubao-seedance-1-0-lite-t2v-250219", label: "Seedance 1.0 Lite T2V" },
    ],
  },
  {
    key: "resolution",
    label: "Resolucion",
    type: "enum",
    group: "Calidad",
    default: "1080p",
    enum: [
      { value: "480p", label: "480p" },
      { value: "720p", label: "720p" },
      { value: "1080p", label: "1080p" },
    ],
  },
  {
    key: "duration",
    label: "Duracion por segmento (s)",
    type: "number",
    group: "Calidad",
    default: 5,
    min: 4,
    max: 12,
    step: 1,
    help: "Cada segmento del guion generara un clip de esta duracion",
  },
  {
    key: "camera_fixed",
    label: "Camara fija",
    type: "boolean",
    group: "Camara",
    default: false,
    help: "Sin movimiento de camara",
  },
  {
    key: "generate_audio",
    label: "Audio nativo Seedance",
    type: "boolean",
    group: "Audio",
    default: false,
    help: "Activa audio ambiental generado por el modelo (Seedance 2.0+). Se desactiva si usas TTS de ElevenLabs.",
  },
  {
    key: "seed",
    label: "Seed",
    type: "number",
    group: "Avanzado",
    default: -1,
    min: -1,
    max: 2147483647,
    help: "-1 = aleatorio; mismo seed = resultados reproducibles",
  },
  {
    key: "watermark",
    label: "Marca de agua",
    type: "boolean",
    group: "Avanzado",
    default: false,
  },
  {
    key: "draft",
    label: "Modo borrador",
    type: "boolean",
    group: "Avanzado",
    default: false,
    help: "Preview barato antes de generar en alta calidad",
  },
];

const t2vDefaults = Object.fromEntries(
  t2vSchema.map((f) => [f.key, f.default])
) as Record<string, unknown>;

// ─── API helpers ──────────────────────────────────────────────────────────────

async function postTask(body: Record<string, unknown>): Promise<{ jobId: string }> {
  const res = await fetch(`${SEEDANCE_API_BASE}/contents/generations/tasks`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getApiKey()}`,
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Seedance API error (${res.status}): ${err}`);
  }
  const data = await res.json();
  const jobId = data.id as string;
  if (!jobId) throw new Error("Seedance: respuesta sin id");
  return { jobId };
}

function buildCommonTextParts(p: Record<string, unknown>, motionPrompt: string): string[] {
  const parts = [motionPrompt];
  if (String(p.resolution)) parts.push(`--resolution ${p.resolution}`);
  if (p.camera_fixed === true) parts.push("--camerafixed true");
  if (p.watermark === false) parts.push("--watermark false");
  if (p.draft === true) parts.push("--draft true");
  const seed = Number(p.seed);
  if (seed >= 0) parts.push(`--seed ${seed}`);
  return parts;
}

// ─── I2V ─────────────────────────────────────────────────────────────────────

async function imageToVideo(input: ImageToVideoInput): Promise<ImageToVideoResult> {
  const p = { ...i2vDefaults, ...(input.providerParams || {}) };
  const duration = Number(p.duration || 5);
  const generateAudio = Boolean(p.generate_audio);

  const textParts = buildCommonTextParts(p, input.motionPrompt);
  textParts.push(`--duration ${duration}`);
  textParts.push(`--ratio 9:16`);
  if (generateAudio) textParts.push("--generate_audio true");

  return postTask({
    model: String(p.model),
    content: [
      { type: "text", text: textParts.join(" ") },
      { type: "image_url", image_url: { url: input.imageUrl } },
    ],
  });
}

// ─── T2V ─────────────────────────────────────────────────────────────────────

async function textToVideo(input: TextToVideoInput): Promise<ImageToVideoResult> {
  const p = { ...t2vDefaults, ...(input.providerParams || {}) };
  const duration = Number(p.duration || 5);
  const generateAudio = Boolean(p.generate_audio);

  const textParts = buildCommonTextParts(p, input.prompt);
  textParts.push(`--duration ${duration}`);
  textParts.push(`--ratio 9:16`);
  if (generateAudio) textParts.push("--generate_audio true");

  return postTask({
    model: String(p.model),
    content: [
      { type: "text", text: textParts.join(" ") },
    ],
  });
}

// ─── Status ──────────────────────────────────────────────────────────────────

async function getStatus(jobId: string): Promise<VideoJobStatus> {
  const res = await fetch(
    `${SEEDANCE_API_BASE}/contents/generations/tasks/${jobId}`,
    { headers: { Authorization: `Bearer ${getApiKey()}` } }
  );
  if (!res.ok) return { status: "failed", error: `HTTP ${res.status}` };
  const data = await res.json();
  const s = String(data.status || "").toLowerCase();

  if (s === "succeeded" || s === "completed") {
    const videoUrl =
      data.content?.[0]?.video_url?.url ||
      data.content?.video_url ||
      data.video_url;
    return { status: "done", clipUrl: videoUrl };
  }
  if (s === "failed" || s === "cancelled") {
    return { status: "failed", error: data.error?.message || "Error desconocido" };
  }
  if (s === "running") return { status: "running" };
  return { status: "pending" };
}

// ─── Export ──────────────────────────────────────────────────────────────────

export const seedanceProvider: VideoProvider = {
  name: "SEEDANCE",
  label: "Seedance 2.0 (ByteDance)",
  supportsT2V: true,
  paramsSchema: i2vSchema,
  t2vParamsSchema: t2vSchema,
  defaults: i2vDefaults,
  t2vDefaults,
  imageToVideo,
  textToVideo,
  getStatus,
};
