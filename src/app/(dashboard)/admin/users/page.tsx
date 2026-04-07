"use client";

import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Shield, CreditCard } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const mockUsers = [
  { id: "1", name: "Maria Garcia", email: "maria@example.com", plan: "pro", credits: 38, videos: 24, role: "USER", createdAt: "2026-03-15" },
  { id: "2", name: "Carlos Lopez", email: "carlos@example.com", plan: "business", credits: 180, videos: 67, role: "USER", createdAt: "2026-02-20" },
  { id: "3", name: "Ana Rodriguez", email: "ana@example.com", plan: "free", credits: 1, videos: 5, role: "USER", createdAt: "2026-04-01" },
  { id: "4", name: "Luis Martinez", email: "luis@example.com", plan: "pro", credits: 45, videos: 12, role: "USER", createdAt: "2026-03-28" },
  { id: "5", name: "Admin", email: "admin@example.com", plan: "admin", credits: 999999, videos: 15, role: "ADMIN", createdAt: "2026-01-01" },
];

const planColors: Record<string, string> = {
  free: "bg-gray-500/15 text-gray-400 border-gray-500/20",
  pro: "bg-blue-500/15 text-blue-400 border-blue-500/20",
  business: "bg-purple-500/15 text-purple-400 border-purple-500/20",
  admin: "bg-primary/15 text-primary border-primary/20",
};

export default function AdminUsersPage() {
  const { data: session } = useSession();
  const role = (session?.user as { role?: string })?.role;

  if (role !== "ADMIN") {
    redirect("/dashboard");
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/admin"><ArrowLeft className="h-5 w-5" /></Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-foreground">Gestion de Usuarios</h1>
          <p className="mt-1 text-muted-foreground">{mockUsers.length} usuarios registrados</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Usuarios</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-muted-foreground">
                  <th className="pb-3 font-medium">Usuario</th>
                  <th className="pb-3 font-medium">Plan</th>
                  <th className="pb-3 font-medium">Creditos</th>
                  <th className="pb-3 font-medium">Videos</th>
                  <th className="pb-3 font-medium">Registro</th>
                  <th className="pb-3 font-medium">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {mockUsers.map((u) => (
                  <tr key={u.id} className="text-foreground">
                    <td className="py-3">
                      <div>
                        <p className="font-medium flex items-center gap-1">
                          {u.name}
                          {u.role === "ADMIN" && <Shield className="h-3 w-3 text-primary" />}
                        </p>
                        <p className="text-xs text-muted-foreground">{u.email}</p>
                      </div>
                    </td>
                    <td className="py-3">
                      <Badge className={planColors[u.plan]}>{u.plan}</Badge>
                    </td>
                    <td className="py-3">{u.role === "ADMIN" ? "∞" : u.credits}</td>
                    <td className="py-3">{u.videos}</td>
                    <td className="py-3 text-muted-foreground">{u.createdAt}</td>
                    <td className="py-3">
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline">
                          <CreditCard className="h-3 w-3 mr-1" /> Dar Creditos
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
