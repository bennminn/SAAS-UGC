import Link from "next/link";
import { Play, Sparkles } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function Hero() {
  return (
    <section className="relative overflow-hidden py-24 sm:py-32">
      {/* Gradient background */}
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_60%_50%_at_50%_-20%,hsl(var(--primary)/0.15),transparent)]" />

      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          {/* Text content */}
          <div className="flex flex-col items-center text-center lg:items-start lg:text-left">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary">
              <Sparkles className="h-4 w-4" />
              Potenciado por Inteligencia Artificial
            </div>

            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
              Crea Videos UGC con IA en Minutos
            </h1>

            <p className="mt-6 max-w-xl text-lg leading-8 text-muted-foreground">
              Genera videos con avatares de IA hiperrealistas para TikTok e
              Instagram Reels. Sin camaras, sin actores, sin complicaciones.
              Solo escribe tu idea y deja que la IA haga el resto.
            </p>

            <div className="mt-10 flex flex-col gap-4 sm:flex-row">
              <Link
                href="/register"
                className={cn(
                  buttonVariants({ size: "lg" }),
                  "text-base px-8"
                )}
              >
                Comenzar Gratis
              </Link>
              <Link
                href="#demo"
                className={cn(
                  buttonVariants({ variant: "outline", size: "lg" }),
                  "text-base px-8"
                )}
              >
                <Play className="mr-2 h-4 w-4" />
                Ver Demo
              </Link>
            </div>

            <p className="mt-4 text-sm text-muted-foreground">
              Sin tarjeta de credito requerida. 3 videos gratis al mes.
            </p>
          </div>

          {/* Phone mockup */}
          <div className="flex justify-center lg:justify-end">
            <div className="relative">
              {/* Glow effect */}
              <div className="absolute -inset-4 rounded-[3rem] bg-gradient-to-tr from-primary/20 via-primary/5 to-transparent blur-2xl" />

              {/* Phone frame */}
              <div className="relative w-[280px] rounded-[2.5rem] border-4 border-foreground/10 bg-card p-2 shadow-2xl sm:w-[320px]">
                {/* Notch */}
                <div className="absolute left-1/2 top-0 z-10 h-6 w-28 -translate-x-1/2 rounded-b-2xl bg-foreground/10" />

                {/* Screen */}
                <div className="relative aspect-[9/19] overflow-hidden rounded-[2rem] bg-gradient-to-br from-primary/20 via-secondary to-accent">
                  {/* Video preview placeholder */}
                  <div className="flex h-full flex-col items-center justify-center gap-4 p-6">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/20 backdrop-blur-sm">
                      <Play className="h-8 w-8 text-primary" />
                    </div>
                    <div className="space-y-2 text-center">
                      <p className="text-sm font-semibold">Vista previa</p>
                      <p className="text-xs text-muted-foreground">
                        Tu video UGC aparecera aqui
                      </p>
                    </div>

                    {/* Fake UI overlays */}
                    <div className="absolute bottom-6 left-4 right-4 space-y-2">
                      <div className="h-2 w-3/4 rounded-full bg-foreground/10" />
                      <div className="h-2 w-1/2 rounded-full bg-foreground/10" />
                    </div>

                    {/* Side icons */}
                    <div className="absolute bottom-8 right-3 flex flex-col gap-4">
                      <div className="h-8 w-8 rounded-full bg-foreground/10" />
                      <div className="h-8 w-8 rounded-full bg-foreground/10" />
                      <div className="h-8 w-8 rounded-full bg-foreground/10" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
