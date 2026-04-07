"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Check, Loader2, Download, AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

const GENERATION_STEPS = [
  { id: "queued", label: "En Cola" },
  { id: "script_ready", label: "Script Listo" },
  { id: "generating_audio", label: "Generando Audio" },
  { id: "generating_video", label: "Generando Video" },
  { id: "uploading", label: "Subiendo" },
  { id: "completed", label: "Completado" },
];

export default function GenerationStatusPage() {
  const params = useParams();
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [status, setStatus] = useState<"processing" | "completed" | "failed">("processing");
  const [videoUrl, setVideoUrl] = useState<string | null>(null);

  useEffect(() => {
    if (status === "completed" || status === "failed") return;

    const interval = setInterval(() => {
      setCurrentStepIndex((prev) => {
        if (prev >= GENERATION_STEPS.length - 1) {
          setStatus("completed");
          setVideoUrl("#");
          clearInterval(interval);
          return prev;
        }
        return prev + 1;
      });
    }, 3000);

    return () => clearInterval(interval);
  }, [status]);

  const progress = ((currentStepIndex + 1) / GENERATION_STEPS.length) * 100;

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Generando Video</h1>
        <p className="mt-1 text-muted-foreground">ID: {params.id}</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {status === "processing" && <Loader2 className="h-5 w-5 animate-spin text-primary" />}
            {status === "completed" && <Check className="h-5 w-5 text-green-500" />}
            {status === "failed" && <AlertCircle className="h-5 w-5 text-red-500" />}
            {status === "processing" ? "Procesando..." : status === "completed" ? "Video Completado" : "Error"}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <Progress value={progress} />

          <div className="space-y-3">
            {GENERATION_STEPS.map((step, index) => (
              <div
                key={step.id}
                className={cn(
                  "flex items-center gap-3 rounded-lg p-3 transition-colors",
                  index < currentStepIndex && "text-green-400",
                  index === currentStepIndex && status === "processing" && "bg-primary/10 text-primary",
                  index > currentStepIndex && "text-muted-foreground"
                )}
              >
                {index < currentStepIndex ? (
                  <Check className="h-5 w-5 text-green-500" />
                ) : index === currentStepIndex && status === "processing" ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <div className="h-5 w-5 rounded-full border-2 border-muted" />
                )}
                <span className="text-sm font-medium">{step.label}</span>
              </div>
            ))}
          </div>

          {status === "completed" && (
            <div className="space-y-4">
              <div className="aspect-[9/16] max-h-96 mx-auto w-auto rounded-lg bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                <p className="text-muted-foreground text-sm">Preview del video</p>
              </div>
              <div className="flex gap-3">
                <Button className="flex-1" asChild>
                  <a href={videoUrl || "#"} download>
                    <Download className="mr-2 h-4 w-4" />
                    Descargar Video
                  </a>
                </Button>
                <Button variant="outline" asChild>
                  <Link href="/videos">Ver Mis Videos</Link>
                </Button>
              </div>
            </div>
          )}

          {status === "failed" && (
            <div className="space-y-4">
              <div className="rounded-lg bg-red-500/10 p-4 text-sm text-red-400">
                Hubo un error al generar el video. Por favor intenta de nuevo.
              </div>
              <Button asChild>
                <Link href="/generate">Intentar de Nuevo</Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
