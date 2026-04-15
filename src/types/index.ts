export type VideoStatus =
  | "PENDING"
  | "GENERATING_FRAMES"
  | "AWAITING_FRAME_SELECTION"
  | "GENERATING_CLIPS"
  | "GENERATING_AUDIO"
  | "COMPOSING"
  | "COMPLETED"
  | "FAILED";

export type Platform = "TIKTOK" | "REELS";

export type GenerationStatus =
  | "QUEUED"
  | "SCRIPT_READY"
  | "GENERATING_FRAMES"
  | "AWAITING_FRAME_SELECTION"
  | "GENERATING_CLIPS"
  | "GENERATING_AUDIO"
  | "COMPOSING"
  | "UPLOADING"
  | "COMPLETED"
  | "FAILED";

export type Role = "USER" | "ADMIN";
export type VideoProviderName = "SEEDANCE" | "KLING" | "WAN";

export interface GenerateScriptRequest {
  productName: string;
  productDescription: string;
  tone: string;
  platform: Platform;
  duration: number;
  category: string;
}

export interface GenerateFramesRequest {
  title: string;
  script: string;
  businessContext?: string;
  platform: Platform;
  duration: number;
  style?: string;
  provider: VideoProviderName;
  providerParams?: Record<string, unknown>;
  imageParams?: Record<string, unknown>;
  ttsParams?: Record<string, unknown>;
  voiceId?: string;
}

export interface Frame {
  id: string;
  order: number;
  prompt: string;
  imageUrl: string;
  selected: boolean;
  clipUrl: string | null;
}

export interface VideoWithGeneration {
  id: string;
  title: string;
  status: VideoStatus;
  templateId: string | null;
  provider: VideoProviderName;
  script: string;
  platform: Platform;
  duration: number | null;
  videoUrl: string | null;
  thumbnailUrl: string | null;
  createdAt: Date;
  generation: {
    status: GenerationStatus;
    steps: Record<string, unknown>;
  } | null;
}
