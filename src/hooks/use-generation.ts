"use client";

import { useState, useEffect, useCallback } from "react";
import type { GenerationStatus } from "@/types";

interface GenerationState {
  status: GenerationStatus;
  videoUrl: string | null;
  error: string | null;
  isLoading: boolean;
}

export function useGeneration(videoId: string | null) {
  const [state, setState] = useState<GenerationState>({
    status: "QUEUED",
    videoUrl: null,
    error: null,
    isLoading: true,
  });

  const pollStatus = useCallback(async () => {
    if (!videoId) return;

    try {
      const res = await fetch(`/api/videos/${videoId}`);
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();

      setState({
        status: data.generation?.status || data.status,
        videoUrl: data.videoUrl,
        error: data.errorMessage,
        isLoading: data.status === "PROCESSING" || data.status === "PENDING",
      });
    } catch {
      setState((prev) => ({ ...prev, error: "Error al obtener estado", isLoading: false }));
    }
  }, [videoId]);

  useEffect(() => {
    if (!videoId) return;

    pollStatus();
    const interval = setInterval(() => {
      if (state.isLoading) pollStatus();
    }, 3000);

    return () => clearInterval(interval);
  }, [videoId, pollStatus, state.isLoading]);

  return state;
}
