import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function CTA() {
  return (
    <section className="relative overflow-hidden py-24 sm:py-32">
      {/* Gradient background */}
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_80%_60%_at_50%_50%,hsl(var(--primary)/0.15),transparent)]" />

      <div className="mx-auto max-w-4xl px-6 text-center lg:px-8">
        <h2 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
          Empieza a crear videos que convierten
        </h2>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
          Unete a miles de creadores que ya generan contenido UGC con
          inteligencia artificial. Comienza gratis, sin tarjeta de credito.
        </p>
        <div className="mt-10">
          <Link
            href="/register"
            className={cn(
              buttonVariants({ size: "lg" }),
              "text-base px-8 py-6 text-lg"
            )}
          >
            Crear mi primer video gratis
            <ArrowRight className="ml-2 h-5 w-5" />
          </Link>
        </div>
      </div>
    </section>
  );
}
