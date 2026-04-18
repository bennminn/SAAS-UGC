import type {
  VideoProvider,
  ImageToVideoInput,
  ImageToVideoResult,
  VideoJobStatus,
  ParamSchemaField,
} from "./types";

// Wan 2.x via Alibaba Cloud DashScope.
// Docs: https://help.aliyun.com/zh/model-studio/developer-reference/image-to-video-generation
const WAN_API_BASE =
  process.env.WAN_API_BASE ||
  "https://dashscope.aliyuncs.com/api/v1";

const schema: ParamSchemaField[] = [
  {
    key: "model",
    label: "Modelo",
    type: "enum",
    group: "Calidad",
    default: "wan2.2-i2v-plus",
    enum: [
      { value: "wan2.2-i2v-plus", label: "Wan 2.2 Plus (mejor calidad)" },
      { value: "wan2.2-i2v-flash", label: "Wan 2.2 Flash (mas rapido)" },
    ],
  },
  {
    key: "resolution",
    label: "Resolucion",
    type: "enum",
    group: "Calidad",
    default: "1080P",
    enum: [
      { value: "480P", label: "480P" },
      { value: "720P", label: "720P" },
      { value: "1080P", label: "1080P" },
    ],
  },
  {
    key: "duration",
    label: "Duracion del clip (s)",
    type: "number",
    group: "Calidad",
    default: 5,
    min: 3,
    max: 10,
    step: 1,
  },
  {
    key: "prompt_extend",
    label: "Extender prompt automaticamente",
    type: "boolean",
    group: "Avanzado",
    default: true,
    help: "El modelo enriquece el prompt para mejores resultados",
  },
  {
    key: "seed",
    label: "Seed",
    type: "number",
    group: "Avanzado",
    default: -1,
    min: -1,
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

const defaults = Object.fromEntries(schema.map((f) => [f.key, f.default])) as Record<string, unknown>;

function getApiKey(): string {
  const key = process.env.WAN_API_KEY;
  if (!key) throw new Error("WAN_API_KEY no configurada");
  return key;
}

async function imageToVideo(input: ImageToVideoInput): Promise<ImageToVideoResult> {
  const p = { ...defaults, ...(input.providerParams || {}) };
  const body: Record<string, unknown> = {
    model: p.model,
    input: {
      prompt: input.motionPrompt,
      img_url: input.imageUrl,
    },
    parameters: {
      resolution: p.resolution,
      duration: Number(p.duration),
      prompt_extend: Boolean(p.prompt_extend),
      watermark: Boolean(p.watermark),
    },
  };
  const seed = Number(p.seed);
  if (seed >= 0) (body.parameters as Record<string, unknown>).seed = seed;

  const res = await fetch(
    `${WAN_API_BASE}/services/aigc/video-generation/video-synthesis`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getApiKey()}`,
        "X-DashScope-Async": "enable",
      },
      body: JSON.stringify(body),
    }
  );

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Wan API error (${res.status}): ${err}`);
  }
  const data = await res.json();
  const taskId = data.output?.task_id;
  if (!taskId) throw new Error("Wan: respuesta sin task_id");
  return { jobId: String(taskId) };
}

async function getStatus(jobId: string): Promise<VideoJobStatus> {
  const res = await fetch(`${WAN_API_BASE}/tasks/${jobId}`, {
    method: "GET",
    headers: { Authorization: `Bearer ${getApiKey()}` },
  });
  if (!res.ok) return { status: "failed", error: `HTTP ${res.status}` };
  const data = await res.json();
  const s = String(data.output?.task_status || "").toLowerCase();
  if (s === "succeeded") {
    return { status: "done", clipUrl: data.output?.video_url };
  }
  if (s === "failed" || s === "canceled") {
    return { status: "failed", error: data.output?.message };
  }
  if (s === "running") return { status: "running" };
  return { status: "pending" };
}

export const wanProvider: VideoProvider = {
  name: "WAN",
  label: "Wan 2.x (Alibaba)",
  supportsT2V: false,
  paramsSchema: schema,
  defaults,
  imageToVideo,
  getStatus,
};
