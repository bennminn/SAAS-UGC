"use client";

import Link from "next/link";
import { Play, CircleDollarSign, Calendar, TrendingUp } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const stats = [
  {
    title: "Videos Generados",
    value: "24",
    icon: Play,
    description: "Total historico",
  },
  {
    title: "Creditos Restantes",
    value: "38",
    icon: CircleDollarSign,
    description: "De 50 disponibles",
  },
  {
    title: "Videos Este Mes",
    value: "12",
    icon: Calendar,
    description: "+3 respecto al mes pasado",
  },
  {
    title: "Tasa de Exito",
    value: "96%",
    icon: TrendingUp,
    description: "Ultimos 30 dias",
  },
];

const recentVideos = [
  {
    id: "1",
    title: "Resena Crema Hidratante",
    platform: "TIKTOK",
    status: "Completado",
    date: "2026-04-06",
  },
  {
    id: "2",
    title: "Unboxing Auriculares Pro",
    platform: "REELS",
    status: "En Proceso",
    date: "2026-04-05",
  },
  {
    id: "3",
    title: "Tutorial Serum Facial",
    platform: "TIKTOK",
    status: "Fallido",
    date: "2026-04-04",
  },
];

function getStatusColor(status: string) {
  switch (status) {
    case "Completado":
      return "bg-green-500/15 text-green-400 border-green-500/20";
    case "En Proceso":
      return "bg-yellow-500/15 text-yellow-400 border-yellow-500/20";
    case "Fallido":
      return "bg-red-500/15 text-red-400 border-red-500/20";
    default:
      return "";
  }
}

function getPlatformColor(platform: string) {
  return platform === "TIKTOK"
    ? "bg-pink-500/15 text-pink-400 border-pink-500/20"
    : "bg-purple-500/15 text-purple-400 border-purple-500/20";
}

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Panel de Control
          </h1>
          <p className="mt-1 text-muted-foreground">
            Resumen de tu actividad reciente
          </p>
        </div>
        <Link href="/generate">
          <Button size="lg">
            <Play className="mr-2 h-4 w-4" />
            Generar Nuevo Video
          </Button>
        </Link>
      </div>

      {/* Stat cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <stat.icon className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">
                {stat.value}
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                {stat.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent videos */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Videos Recientes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentVideos.map((video) => (
              <div
                key={video.id}
                className="flex items-center justify-between rounded-lg border border-border p-4 transition-colors hover:bg-accent/50"
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <Play className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{video.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {video.date}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge className={getPlatformColor(video.platform)}>
                    {video.platform}
                  </Badge>
                  <Badge className={getStatusColor(video.status)}>
                    {video.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
