import {
  Sparkles,
  Users,
  Smartphone,
  Mic,
  LayoutTemplate,
  Zap,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const features = [
  {
    icon: Sparkles,
    title: "Generacion con IA",
    description:
      "Scripts automaticos generados con inteligencia artificial. Solo describe tu producto y obtendras un guion optimizado para convertir.",
  },
  {
    icon: Users,
    title: "Avatares Realistas",
    description:
      "Presentadores virtuales que parecen reales. Elige entre multiples avatares con expresiones y gestos naturales.",
  },
  {
    icon: Smartphone,
    title: "Multi-Plataforma",
    description:
      "Optimizado para TikTok e Instagram Reels. Formato vertical, duracion ideal y estilo nativo de cada plataforma.",
  },
  {
    icon: Mic,
    title: "Voces Naturales",
    description:
      "Text-to-speech con voces humanas en espanol. Distintos tonos y estilos para cada tipo de contenido.",
  },
  {
    icon: LayoutTemplate,
    title: "Plantillas Pro",
    description:
      "Templates probados para maximizar engagement. Resenas, unboxings, tutoriales y mas formatos listos para usar.",
  },
  {
    icon: Zap,
    title: "Rapido y Facil",
    description:
      "De idea a video en menos de 5 minutos. Sin necesidad de edicion, camaras ni conocimientos tecnicos.",
  },
] as const;

export function Features() {
  return (
    <section className="py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Todo lo que necesitas para crear contenido viral
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Herramientas potentes impulsadas por IA para generar videos UGC
            profesionales sin esfuerzo.
          </p>
        </div>

        <div className="mx-auto mt-16 grid max-w-5xl gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <Card
              key={feature.title}
              className="group relative overflow-hidden border-border/50 transition-colors hover:border-primary/30"
            >
              <CardContent className="p-6">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold">{feature.title}</h3>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  {feature.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
