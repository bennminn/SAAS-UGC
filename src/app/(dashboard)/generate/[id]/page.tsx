"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Check, Loader2, Download, AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

const STEPS = [
  { id: "GENERATING_FRAMES", label: "Generando keyframes" },
  { id: "AWAITING_FRAME_SELECTION", label: "Keyframes listos" },
  { id: "GENERATING_CLIPS", label: "Animando clips" },
  { id: "GENERATING_AUDIO", label: "Generando narracion" },
  { id: "COMPOSING", label: "Componiendo video final" },
  { id: "COMPLETED", label: "Listo" },
];

interface VideoData {
  id: string;
  status: string;
  videoUrl: string | null;
  thumbnailUrl: string | null;
  errorMessage: string | null;
}

export default function GenerationStatusPage() {
  const params = useParams<{ id: string }>();
  const [video, setVideo] = useState<VideoData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!params.id) return;
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout>;

    async function poll() {
      try {
        const res = await fetch(`/api/videos/${params.id}/status`);
        const data = await res.json();
        if (cancelled) return;
        if (data.video) setVideo(data.video);
        const s = data.video?.status;
        if (s !== "COMPLETED" && s !== "FAILED") {
          timer = setTimeout(poll, 3500);
        }
      } catch (e) {
        console.error(e);
        if (!cancelled) timer = setTimeout(poll, 5000);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    poll();
    return () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
    };
  }, [params.id]);

  const status = video?.status || "PENDING";
  const currentIndex = Math.max(
    0,
    STEPS.findIndex((s) => s.id === status)
  );
  const progress = ((currentIndex + 1) / STEPS.length) * 100;
  const isDone = status === "COMPLETED";
  const isFailed = status === "FAILED";

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground">
          {isDone ? "Video listo" : isFailed ? "Error" : "Generando video"}
        </h1>
        <p className="mt-1 text-muted-foreground">ID: {params.id}</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {!isDone && !isFailed && (
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
            )}
            {isDone && <Check className="h-5 w-5 text-green-500" />}
            {isFailed && <AlertCircle className="h-5 w-5 text-red-500" />}
            {loading
              ? "Cargando estado..."
              : isDone
                ? "Video completado"
                : isFailed
                  ? "Error en la generacion"
                  : "Procesando..."}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <Progress value={progress} />

          <div className="space-y-3">
            {STEPS.map((step, index) => (
              <div
                key={step.id}
                className={cn(
                  "flex items-center gap-3 rounded-lg p-3 transition-colors",
                  index < currentIndex && "text-green-400",
                  index === currentIndex && !isDone && !isFailed && "bg-primary/10 text-primary",
                  index > currentIndex && "text-muted-foreground"
                )}
              >
                {index < currentIndex || isDone ? (
                  <Check className="h-5 w-5 text-green-500" />
                ) : index === currentIndex && !isFailed ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <div className="h-5 w-5 rounded-full border-2 border-muted" />
                )}
                <span className="text-sm font-medium">{step.label}</span>
              </div>
            ))}
          </div>

          {isDone && video?.videoUrl && (
            <div className="space-y-4">
              <div className="mx-auto aspect-[9/16] max-h-[480px] overflow-hidden rounded-lg bg-black">
                {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
                <video
                  src={video.videoUrl}
                  controls
                  poster={video.thumbnailUrl || undefined}
                  className="h-full w-full"
                />
              </div>
              <div className="flex gap-3">
                <Button className="flex-1" asChild>
                  <a href={video.videoUrl} download>
                    <Download className="mr-2 h-4 w-4" /> Descargar
                  </a>
                </Button>
                <Button variant="outline" asChild>
                  <Link href="/videos">Mis videos</Link>
                </Button>
              </div>
            </div>
          )}

          {isFailed && (
            <div className="space-y-4">
              <div className="rounded-lg bg-red-500/10 p-4 text-sm text-red-400">
                {video?.errorMessage || "Hubo un error al generar el video."}
              </div>
              <Button asChild>
                <Link href="/generate">Intentar de nuevo</Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
