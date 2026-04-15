import type { VideoProviderName } from "./types";

export interface Preset {
  id: string;
  label: string;
  description: string;
  params: Partial<Record<VideoProviderName, Record<string, unknown>>>;
}

export const PRESETS: Preset[] = [
  {
    id: "max-quality",
    label: "Maxima calidad",
    description: "Mejor resolucion y modelo, mas lento y caro",
    params: {
      SEEDANCE: { model: "seedance-1-0-pro-250528", resolution: "1080p", duration: "5" },
      KLING: { model_name: "kling-v2-master", mode: "pro", duration: "5" },
      WAN: { model: "wan2.2-i2v-plus", resolution: "1080P", duration: 5 },
    },
  },
  {
    id: "fast-cheap",
    label: "Rapido y barato",
    description: "Modelos lite, menor resolucion, ideal para iterar",
    params: {
      SEEDANCE: { model: "seedance-1-0-lite-i2v-250428", resolution: "720p", duration: "5" },
      KLING: { model_name: "kling-v1-6", mode: "std", duration: "5" },
      WAN: { model: "wan2.2-i2v-flash", resolution: "720P", duration: 5 },
    },
  },
  {
    id: "dramatic-motion",
    label: "Movimiento dramatico",
    description: "Camara activa, CFG alto, look cinematografico",
    params: {
      SEEDANCE: { camera_fixed: false, resolution: "1080p", duration: "10" },
      KLING: { mode: "pro", cfg_scale: 0.8, camera_type: "zoom" },
      WAN: { prompt_extend: true, resolution: "1080P", duration: 8 },
    },
  },
  {
    id: "static",
    label: "Estatico (solo sujeto)",
    description: "Camara fija, solo se anima el sujeto",
    params: {
      SEEDANCE: { camera_fixed: true, resolution: "1080p", duration: "5" },
      KLING: { mode: "pro", camera_type: "simple", cfg_scale: 0.5 },
      WAN: { prompt_extend: false, resolution: "1080P", duration: 5 },
    },
  },
];

export function getPresetParams(
  presetId: string,
  provider: VideoProviderName
): Record<string, unknown> | null {
  const p = PRESETS.find((x) => x.id === presetId);
  if (!p) return null;
  return p.params[provider] || null;
}
