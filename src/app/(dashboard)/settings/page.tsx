"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { User, CreditCard, Shield } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { PLANS, type PlanId } from "@/lib/constants";

export default function SettingsPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const user = session?.user as { name?: string; email?: string; planId?: string; creditsRemaining?: number; role?: string } | undefined;

  const planId = (user?.planId || "free") as PlanId;
  const plan = PLANS[planId] || PLANS.free;
  const credits = user?.creditsRemaining ?? 0;
  const isAdmin = user?.role === "ADMIN";

  async function handleManageBilling() {
    try {
      const res = await fetch("/api/billing/portal", { method: "POST" });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error("Error opening billing portal:", error);
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Ajustes</h1>
        <p className="mt-1 text-muted-foreground">Gestiona tu cuenta y suscripcion</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" /> Cuenta
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Nombre</Label>
            <Input value={user?.name || ""} readOnly className="bg-muted" />
          </div>
          <div className="space-y-2">
            <Label>Email</Label>
            <Input value={user?.email || ""} readOnly className="bg-muted" />
          </div>
          {isAdmin && (
            <Badge className="bg-primary/15 text-primary border-primary/20">
              <Shield className="mr-1 h-3 w-3" /> Administrador
            </Badge>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" /> Plan y Creditos
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold text-foreground">Plan {plan.name}</p>
              <p className="text-sm text-muted-foreground">
                {plan.price === 0 ? "Gratis" : `$${plan.price}/mes`}
              </p>
            </div>
            {isAdmin ? (
              <Badge className="bg-primary/15 text-primary border-primary/20">Ilimitado</Badge>
            ) : (
              <Badge variant="outline">{credits} creditos restantes</Badge>
            )}
          </div>

          {!isAdmin && (
            <>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Creditos usados</span>
                  <span className="text-foreground">{plan.credits - credits} / {plan.credits}</span>
                </div>
                <Progress value={((plan.credits - credits) / plan.credits) * 100} />
              </div>

              <div className="flex gap-3">
                {planId !== "free" && (
                  <Button variant="outline" onClick={handleManageBilling}>
                    Gestionar Suscripcion
                  </Button>
                )}
                <Button onClick={() => router.push("/pricing")}>
                  {planId === "free" ? "Mejorar Plan" : "Cambiar Plan"}
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
