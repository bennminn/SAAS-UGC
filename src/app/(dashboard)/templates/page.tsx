"use client";

import Link from "next/link";
import { Star, Package, GraduationCap, MessageCircle, ArrowLeftRight, RefreshCw } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const iconMap: Record<string, React.ElementType> = {
  Star, Package, GraduationCap, MessageCircle, ArrowLeftRight, RefreshCw,
};

const templates = [
  { id: "1", name: "Resena Entusiasta", category: "Resena de Producto", icon: "Star", description: "Resena positiva y energetica de un producto, ideal para generar confianza y ventas.", platform: "TIKTOK" },
  { id: "2", name: "Unboxing Sorpresa", category: "Unboxing", icon: "Package", description: "Reaccion autentica al abrir un producto por primera vez. Genera curiosidad y expectativa.", platform: "REELS" },
  { id: "3", name: "Tutorial Rapido", category: "Tutorial", icon: "GraduationCap", description: "Explica como usar un producto paso a paso en menos de 60 segundos.", platform: "TIKTOK" },
  { id: "4", name: "Testimonio Personal", category: "Testimonial", icon: "MessageCircle", description: "Historia personal de como un producto cambio tu rutina. Muy persuasivo.", platform: "REELS" },
  { id: "5", name: "Versus Competencia", category: "Comparacion", icon: "ArrowLeftRight", description: "Compara tu producto con la competencia de forma objetiva y convincente.", platform: "TIKTOK" },
  { id: "6", name: "Transformacion", category: "Antes y Despues", icon: "RefreshCw", description: "Muestra el antes y despues de usar un producto. Resultados visuales impactantes.", platform: "REELS" },
];

export default function TemplatesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Plantillas</h1>
        <p className="mt-1 text-muted-foreground">
          Elige una plantilla probada para maximizar el engagement de tus videos
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {templates.map((template) => {
          const IconComponent = iconMap[template.icon] || Star;
          return (
            <Card key={template.id} className="overflow-hidden">
              <div className="flex h-32 items-center justify-center bg-gradient-to-br from-primary/20 to-primary/5">
                <IconComponent className="h-12 w-12 text-primary/60" />
              </div>
              <CardContent className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-foreground">{template.name}</h3>
                  <Badge
                    className={
                      template.platform === "TIKTOK"
                        ? "bg-pink-500/15 text-pink-400 border-pink-500/20"
                        : "bg-purple-500/15 text-purple-400 border-purple-500/20"
                    }
                  >
                    {template.platform}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">{template.description}</p>
                <Badge variant="outline" className="text-xs">{template.category}</Badge>
                <Button className="w-full mt-2" size="sm" asChild>
                  <Link href="/generate">Usar Plantilla</Link>
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
