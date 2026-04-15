import type {
  VideoProvider,
  ImageToVideoInput,
  ImageToVideoResult,
  VideoJobStatus,
  ParamSchemaField,
} from "./types";

// Kling AI (Kuaishou). Docs: https://docs.qingque.cn/s/home/eZQD0Xbbn6dJQtGp_luOqSsXp
const KLING_API_BASE =
  process.env.KLING_API_BASE || "https://api.klingai.com";

const schema: ParamSchemaField[] = [
  {
    key: "model_name",
    label: "Modelo",
    type: "enum",
    group: "Calidad",
    default: "kling-v2-master",
    enum: [
      { value: "kling-v2-master", label: "Kling 2.0 Master (ultra realista)" },
      { value: "kling-v1-6", label: "Kling 1.6" },
      { value: "kling-v1-5", label: "Kling 1.5" },
    ],
  },
  {
    key: "mode",
    label: "Modo",
    type: "enum",
    group: "Calidad",
    default: "pro",
    enum: [
      { value: "std", label: "Standard (rapido)" },
      { value: "pro", label: "Professional (mejor calidad)" },
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
    key: "cfg_scale",
    label: "CFG Scale",
    type: "number",
    group: "Avanzado",
    default: 0.5,
    min: 0,
    max: 1,
    step: 0.05,
    help: "Cuan fuerte el modelo sigue el prompt (0 = libre, 1 = literal)",
  },
  {
    key: "negative_prompt",
    label: "Prompt negativo",
    type: "string",
    group: "Avanzado",
    default: "",
    help: "Describe lo que NO debe aparecer",
  },
  {
    key: "tail_image_url",
    label: "Imagen final (URL)",
    type: "url",
    group: "Camara",
    default: "",
    help: "Opcional: frame final para transicion suave",
  },
  {
    key: "camera_type",
    label: "Movimiento de camara",
    type: "enum",
    group: "Camara",
    default: "simple",
    enum: [
      { value: "simple", label: "Simple (automatico)" },
      { value: "zoom", label: "Zoom" },
      { value: "horizontal", label: "Panoramica horizontal" },
      { value: "vertical", label: "Panoramica vertical" },
      { value: "pan", label: "Pan" },
      { value: "tilt", label: "Tilt" },
      { value: "roll", label: "Roll" },
    ],
  },
];

const defaults = Object.fromEntries(schema.map((f) => [f.key, f.default])) as Record<string, unknown>;

function getApiKey(): string {
  const key = process.env.KLING_API_KEY;
  if (!key) throw new Error("KLING_API_KEY no configurada");
  return key;
}

async function imageToVideo(input: ImageToVideoInput): Promise<ImageToVideoResult> {
  const p = { ...defaults, ...(input.providerParams || {}) };

  const body: Record<string, unknown> = {
    model_name: p.model_name,
    mode: p.mode,
    duration: String(p.duration),
    image: input.imageUrl,
    prompt: input.motionPrompt,
    cfg_scale: Number(p.cfg_scale),
    aspect_ratio: "9:16",
  };
  if (p.negative_prompt) body.negative_prompt = p.negative_prompt;
  if (p.tail_image_url) body.image_tail = p.tail_image_url;
  if (p.camera_type && p.camera_type !== "simple") {
    body.camera_control = { type: p.camera_type };
  }
  if (input.webhookUrl) body.callback_url = input.webhookUrl;

  const res = await fetch(`${KLING_API_BASE}/v1/videos/image2video`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getApiKey()}`,
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Kling API error (${res.status}): ${err}`);
  }
  const data = await res.json();
  const taskId = data.data?.task_id || data.task_id || data.id;
  if (!taskId) throw new Error("Kling: respuesta sin task_id");
  return { jobId: String(taskId) };
}

async function getStatus(jobId: string): Promise<VideoJobStatus> {
  const res = await fetch(
    `${KLING_API_BASE}/v1/videos/image2video/${jobId}`,
    {
      method: "GET",
      headers: { Authorization: `Bearer ${getApiKey()}` },
    }
  );
  if (!res.ok) return { status: "failed", error: `HTTP ${res.status}` };
  const data = await res.json();
  const d = data.data || data;
  const s = String(d.task_status || d.status || "").toLowerCase();
  const clipUrl =
    d.task_result?.videos?.[0]?.url ||
    d.videos?.[0]?.url ||
    d.video_url;
  if (s === "succeed" || s === "succeeded" || s === "completed") {
    return { status: "done", clipUrl };
  }
  if (s === "failed") return { status: "failed", error: d.task_status_msg };
  if (s === "processing") return { status: "running" };
  return { status: "pending" };
}

export const klingProvider: VideoProvider = {
  name: "KLING",
  label: "Kling 2.x (Kuaishou)",
  paramsSchema: schema,
  defaults,
  imageToVideo,
  getStatus,
};
