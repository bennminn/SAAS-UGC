import type {
  VideoProvider,
  ImageToVideoInput,
  ImageToVideoResult,
  VideoJobStatus,
  ParamSchemaField,
} from "./types";

// Seedance 2.0 via ByteDance / Volcengine Ark API.
// Docs: https://www.volcengine.com/docs/82379 (seedance-1-0-pro / seedance-1-0-lite)
const SEEDANCE_API_BASE =
  process.env.SEEDANCE_API_BASE ||
  "https://ark.cn-beijing.volces.com/api/v3";

const schema: ParamSchemaField[] = [
  {
    key: "model",
    label: "Modelo",
    type: "enum",
    group: "Calidad",
    default: "seedance-1-0-pro-250528",
    enum: [
      { value: "seedance-1-0-pro-250528", label: "Seedance 1.0 Pro (maxima calidad)" },
      { value: "seedance-1-0-lite-i2v-250428", label: "Seedance 1.0 Lite (rapido)" },
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
    help: "Si esta activo, la camara no se mueve; solo se anima el sujeto",
  },
  {
    key: "seed",
    label: "Seed",
    type: "number",
    group: "Avanzado",
    default: -1,
    min: -1,
    max: 2147483647,
    help: "-1 para aleatorio",
  },
  {
    key: "watermark",
    label: "Marca de agua",
    type: "boolean",
    group: "Avanzado",
    default: false,
  },
];

const defaults = Object.fromEntries(
  schema.map((f) => [f.key, f.default])
) as Record<string, unknown>;

function getApiKey(): string {
  const key = process.env.SEEDANCE_API_KEY;
  if (!key) throw new Error("SEEDANCE_API_KEY no configurada");
  return key;
}

async function imageToVideo(input: ImageToVideoInput): Promise<ImageToVideoResult> {
  const p = { ...defaults, ...(input.providerParams || {}) };
  const model = String(p.model);
  const resolution = String(p.resolution);
  const duration = Number(p.duration);
  const cameraFixed = Boolean(p.camera_fixed);
  const seed = Number(p.seed);
  const watermark = Boolean(p.watermark);

  // Volcengine Ark: text is the motion prompt, plus image. Params prefixed with "--" inline.
  const textParts = [
    input.motionPrompt,
    `--resolution ${resolution}`,
    `--duration ${duration}`,
    `--ratio 9:16`,
    `--camerafixed ${cameraFixed}`,
    `--watermark ${watermark}`,
  ];
  if (seed >= 0) textParts.push(`--seed ${seed}`);

  const body = {
    model,
    content: [
      { type: "text", text: textParts.join(" ") },
      { type: "image_url", image_url: { url: input.imageUrl } },
    ],
  };

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
  return { jobId: data.id as string };
}

async function getStatus(jobId: string): Promise<VideoJobStatus> {
  const res = await fetch(
    `${SEEDANCE_API_BASE}/contents/generations/tasks/${jobId}`,
    {
      method: "GET",
      headers: { Authorization: `Bearer ${getApiKey()}` },
    }
  );
  if (!res.ok) {
    return { status: "failed", error: `HTTP ${res.status}` };
  }
  const data = await res.json();
  const s = String(data.status || "").toLowerCase();
  if (s === "succeeded" || s === "completed") {
    return { status: "done", clipUrl: data.content?.video_url };
  }
  if (s === "failed" || s === "cancelled") {
    return { status: "failed", error: data.error?.message };
  }
  if (s === "running") return { status: "running" };
  return { status: "pending" };
}

export const seedanceProvider: VideoProvider = {
  name: "SEEDANCE",
  label: "Seedance 2.0 (ByteDance)",
  paramsSchema: schema,
  defaults,
  imageToVideo,
  getStatus,
};
