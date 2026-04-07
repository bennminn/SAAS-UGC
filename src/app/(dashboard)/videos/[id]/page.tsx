"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Download, Share2, Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function VideoDetailPage() {
  const params = useParams();

  const video = {
    id: params.id,
    title: "Resena Crema Hidratante",
    platform: "TIKTOK",
    status: "COMPLETED",
    date: "2026-04-06",
    duration: 30,
    script:
      "¿Cansada de que tu piel se sienta seca todo el dia? Yo estaba igual hasta que descubri esta crema hidratante. En serio, desde la primera aplicacion senti la diferencia. Mi piel quedo suave, hidratada y sin esa sensacion grasosa que odio. Lo mejor es que dura todo el dia. Link en mi bio, no te la pierdas.",
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/videos">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-foreground">{video.title}</h1>
          <div className="mt-1 flex items-center gap-2">
            <Badge className="bg-pink-500/15 text-pink-400 border-pink-500/20">{video.platform}</Badge>
            <Badge className="bg-green-500/15 text-green-400 border-green-500/20">Completado</Badge>
            <span className="text-sm text-muted-foreground">{video.date} · {video.duration}s</span>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="aspect-[9/16] rounded-lg bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
          <p className="text-muted-foreground">Video Player</p>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Script</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-foreground whitespace-pre-wrap">{video.script}</p>
            </CardContent>
          </Card>

          <div className="flex flex-col gap-3">
            <Button className="w-full">
              <Download className="mr-2 h-4 w-4" /> Descargar Video
            </Button>
            <Button variant="outline" className="w-full" onClick={() => navigator.clipboard.writeText(window.location.href)}>
              <Share2 className="mr-2 h-4 w-4" /> Copiar Enlace
            </Button>
            <Button variant="destructive" className="w-full">
              <Trash2 className="mr-2 h-4 w-4" /> Eliminar Video
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
