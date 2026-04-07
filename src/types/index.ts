export type VideoStatus = "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED";
export type Platform = "TIKTOK" | "REELS";
export type GenerationStatus =
  | "QUEUED"
  | "SCRIPT_READY"
  | "GENERATING_AUDIO"
  | "GENERATING_VIDEO"
  | "UPLOADING"
  | "COMPLETED"
  | "FAILED";
export type Role = "USER" | "ADMIN";

export interface GenerateScriptRequest {
  productName: string;
  productDescription: string;
  tone: string;
  platform: Platform;
  duration: number;
  category: string;
}

export interface GenerateVideoRequest {
  title: string;
  script: string;
  avatarId: string;
  voiceId: string;
  templateId?: string;
  platform: Platform;
}

export interface VideoWithGeneration {
  id: string;
  title: string;
  status: VideoStatus;
  templateId: string | null;
  avatarId: string;
  voiceId: string;
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
