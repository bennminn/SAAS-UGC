"use client";

import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Users, Video, DollarSign, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const globalStats = [
  { title: "Total Usuarios", value: "1,247", icon: Users, change: "+12%" },
  { title: "Videos Generados", value: "8,432", icon: Video, change: "+23%" },
  { title: "Ingresos MRR", value: "$12,450", icon: DollarSign, change: "+8%" },
  { title: "Tasa Conversion", value: "4.2%", icon: TrendingUp, change: "+0.5%" },
];

export default function AdminPage() {
  const { data: session } = useSession();
  const role = (session?.user as { role?: string })?.role;

  if (role !== "ADMIN") {
    redirect("/dashboard");
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Panel de Administracion</h1>
          <p className="mt-1 text-muted-foreground">Resumen global de la plataforma</p>
        </div>
        <Button asChild>
          <Link href="/admin/users">Gestionar Usuarios</Link>
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {globalStats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
              <stat.icon className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">{stat.value}</div>
              <p className="mt-1 text-xs text-green-400">{stat.change} vs mes anterior</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Actividad Reciente</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              { action: "Nuevo usuario registrado", detail: "maria@example.com", time: "Hace 2 min" },
              { action: "Video generado", detail: "Resena Crema XYZ por carlos@example.com", time: "Hace 15 min" },
              { action: "Suscripcion Pro activada", detail: "ana@example.com", time: "Hace 1 hora" },
              { action: "Video completado", detail: "Tutorial Serum por laura@example.com", time: "Hace 2 horas" },
            ].map((item, i) => (
              <div key={i} className="flex items-center justify-between rounded-lg border p-3">
                <div>
                  <p className="text-sm font-medium text-foreground">{item.action}</p>
                  <p className="text-xs text-muted-foreground">{item.detail}</p>
                </div>
                <span className="text-xs text-muted-foreground">{item.time}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
