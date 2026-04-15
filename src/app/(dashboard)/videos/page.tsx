"use client";

import { useState } from "react";
import Link from "next/link";
import { Play, Download, Trash2, Wand2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select } from "@/components/ui/select";
import { cn } from "@/lib/utils";

const mockVideos = [
  { id: "1", title: "Resena Crema Hidratante", platform: "TIKTOK", status: "COMPLETED", date: "2026-04-06", duration: 30 },
  { id: "2", title: "Unboxing Auriculares Pro", platform: "REELS", status: "GENERATING_CLIPS", date: "2026-04-05", duration: 45 },
  { id: "3", title: "Tutorial Serum Facial", platform: "TIKTOK", status: "FAILED", date: "2026-04-04", duration: 60 },
  { id: "4", title: "Comparacion Zapatillas", platform: "REELS", status: "COMPLETED", date: "2026-04-03", duration: 30 },
  { id: "5", title: "Testimonio Suplemento", platform: "TIKTOK", status: "COMPLETED", date: "2026-04-02", duration: 15 },
  { id: "6", title: "Unboxing Maquillaje", platform: "REELS", status: "COMPLETED", date: "2026-04-01", duration: 30 },
];

const statusMap: Record<string, { label: string; className: string }> = {
  COMPLETED: { label: "Completado", className: "bg-green-500/15 text-green-400 border-green-500/20" },
  GENERATING_FRAMES: { label: "Generando frames", className: "bg-yellow-500/15 text-yellow-400 border-yellow-500/20" },
  AWAITING_FRAME_SELECTION: { label: "Eligiendo frames", className: "bg-blue-500/15 text-blue-400 border-blue-500/20" },
  GENERATING_CLIPS: { label: "Animando", className: "bg-yellow-500/15 text-yellow-400 border-yellow-500/20" },
  GENERATING_AUDIO: { label: "Generando audio", className: "bg-yellow-500/15 text-yellow-400 border-yellow-500/20" },
  COMPOSING: { label: "Componiendo", className: "bg-yellow-500/15 text-yellow-400 border-yellow-500/20" },
  FAILED: { label: "Fallido", className: "bg-red-500/15 text-red-400 border-red-500/20" },
  PENDING: { label: "Pendiente", className: "bg-gray-500/15 text-gray-400 border-gray-500/20" },
};

export default function VideosPage() {
  const [platformFilter, setPlatformFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const filtered = mockVideos.filter((v) => {
    if (platformFilter !== "all" && v.platform !== platformFilter) return false;
    if (statusFilter !== "all" && v.status !== statusFilter) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Mis Videos</h1>
          <p className="mt-1 text-muted-foreground">{mockVideos.length} videos generados</p>
        </div>
        <Button asChild>
          <Link href="/generate">
            <Wand2 className="mr-2 h-4 w-4" /> Generar Video
          </Link>
        </Button>
      </div>

      <div className="flex gap-3">
        <Select value={platformFilter} onChange={(e) => setPlatformFilter(e.target.value)}>
          <option value="all">Todas las plataformas</option>
          <option value="TIKTOK">TikTok</option>
          <option value="REELS">Instagram Reels</option>
        </Select>
        <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="all">Todos los estados</option>
          <option value="COMPLETED">Completado</option>
          <option value="GENERATING_CLIPS">En Proceso</option>
          <option value="FAILED">Fallido</option>
        </Select>
      </div>

      {filtered.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Play className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold text-foreground">Aun no tienes videos</h3>
            <p className="mt-1 text-muted-foreground">Genera tu primer video UGC con IA</p>
            <Button className="mt-4" asChild>
              <Link href="/generate">Generar Mi Primer Video</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((video) => (
            <Link key={video.id} href={`/videos/${video.id}`}>
              <Card className="overflow-hidden transition-colors hover:bg-accent/50 cursor-pointer">
                <div className="aspect-[9/16] max-h-48 bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                  <Play className="h-10 w-10 text-primary/40" />
                </div>
                <CardContent className="p-4">
                  <h3 className="font-semibold text-foreground truncate">{video.title}</h3>
                  <p className="text-xs text-muted-foreground mt-1">{video.date} · {video.duration}s</p>
                  <div className="flex items-center gap-2 mt-3">
                    <Badge className={cn(
                      video.platform === "TIKTOK"
                        ? "bg-pink-500/15 text-pink-400 border-pink-500/20"
                        : "bg-purple-500/15 text-purple-400 border-purple-500/20"
                    )}>
                      {video.platform}
                    </Badge>
                    <Badge className={statusMap[video.status]?.className}>
                      {statusMap[video.status]?.label}
                    </Badge>
                  </div>
                  {video.status === "COMPLETED" && (
                    <div className="flex gap-2 mt-3">
                      <Button size="sm" variant="outline" className="flex-1" onClick={(e) => e.preventDefault()}>
                        <Download className="h-3 w-3 mr-1" /> Descargar
                      </Button>
                      <Button size="sm" variant="ghost" onClick={(e) => e.preventDefault()}>
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
