const HEYGEN_API_BASE = "https://api.heygen.com";

interface CreateVideoParams {
  script: string;
  avatarId: string;
  voiceId: string;
  webhookUrl: string;
}

interface VideoGenerationResult {
  jobId: string;
}

interface VideoStatusResult {
  status: "processing" | "completed" | "failed" | "pending";
  videoUrl?: string;
  error?: string;
}

async function heygenFetch(
  endpoint: string,
  options: RequestInit = {}
): Promise<Response> {
  const apiKey = process.env.HEYGEN_API_KEY;
  if (!apiKey) {
    throw new Error("HEYGEN_API_KEY is not configured");
  }

  const response = await fetch(`${HEYGEN_API_BASE}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      "X-Api-Key": apiKey,
      ...options.headers,
    },
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(
      `HeyGen API error (${response.status}): ${errorBody}`
    );
  }

  return response;
}

export async function createVideoGeneration(
  params: CreateVideoParams
): Promise<VideoGenerationResult> {
  const { script, avatarId, voiceId, webhookUrl } = params;

  const response = await heygenFetch("/v2/video/generate", {
    method: "POST",
    body: JSON.stringify({
      video_inputs: [
        {
          character: {
            type: "avatar",
            avatar_id: avatarId,
            avatar_style: "normal",
          },
          voice: {
            type: "text",
            input_text: script,
            voice_id: voiceId,
          },
        },
      ],
      dimension: {
        width: 1080,
        height: 1920,
      },
      callback_id: webhookUrl,
    }),
  });

  const data = await response.json();

  return {
    jobId: data.data.video_id,
  };
}

export async function getVideoStatus(
  jobId: string
): Promise<VideoStatusResult> {
  const response = await heygenFetch(
    `/v1/video_status.get?video_id=${jobId}`,
    { method: "GET" }
  );

  const data = await response.json();
  const status = data.data?.status;

  const statusMap: Record<string, VideoStatusResult["status"]> = {
    processing: "processing",
    completed: "completed",
    failed: "failed",
    pending: "pending",
  };

  return {
    status: statusMap[status] || "processing",
    videoUrl: data.data?.video_url,
    error: data.data?.error,
  };
}
