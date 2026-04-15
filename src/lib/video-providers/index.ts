import { seedanceProvider } from "./seedance";
import { klingProvider } from "./kling";
import { wanProvider } from "./wan";
import type { VideoProvider, VideoProviderName } from "./types";

export * from "./types";
export { PRESETS } from "./presets";

const REGISTRY: Record<VideoProviderName, VideoProvider> = {
  SEEDANCE: seedanceProvider,
  KLING: klingProvider,
  WAN: wanProvider,
};

export function getVideoProvider(name?: VideoProviderName | null): VideoProvider {
  const resolved = (name || (process.env.VIDEO_PROVIDER as VideoProviderName) || "SEEDANCE") as VideoProviderName;
  const p = REGISTRY[resolved];
  if (!p) throw new Error(`Proveedor de video desconocido: ${resolved}`);
  return p;
}

export function listVideoProviders(): VideoProvider[] {
  return [seedanceProvider, klingProvider, wanProvider];
}
