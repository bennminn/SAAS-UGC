export type VideoProviderName = "SEEDANCE" | "KLING" | "WAN";

export interface ImageToVideoInput {
  imageUrl: string;
  motionPrompt: string;
  durationSec: number;
  aspectRatio: "9:16";
  providerParams?: Record<string, unknown>;
  webhookUrl?: string;
}

export interface ImageToVideoResult {
  jobId: string;
}

export interface VideoJobStatus {
  status: "pending" | "running" | "done" | "failed";
  clipUrl?: string;
  error?: string;
}

export type ParamType = "number" | "string" | "boolean" | "enum" | "url";

export interface ParamSchemaField {
  key: string;
  label: string;
  type: ParamType;
  default: unknown;
  min?: number;
  max?: number;
  step?: number;
  enum?: { value: string; label: string }[];
  help?: string;
  group?: string;
}

export interface VideoProvider {
  name: VideoProviderName;
  label: string;
  paramsSchema: ParamSchemaField[];
  defaults: Record<string, unknown>;
  imageToVideo(input: ImageToVideoInput): Promise<ImageToVideoResult>;
  getStatus(jobId: string): Promise<VideoJobStatus>;
}
