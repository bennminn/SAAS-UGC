import { Star } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const testimonials = [
  {
    name: "Maria Garcia",
    role: "Creadora de contenido en TikTok",
    initials: "MG",
    color: "bg-pink-500",
    quote:
      "Increible herramienta. Antes tardaba horas grabando y editando videos para mis clientes. Ahora genero contenido UGC profesional en minutos. Mis clientes no pueden creer que sea IA.",
  },
  {
    name: "Alejandro Torres",
    role: "Fundador de agencia de marketing",
    initials: "AT",
    color: "bg-blue-500",
    quote:
      "Hemos triplicado la produccion de contenido para nuestros clientes sin contratar mas personal. Los avatares son super realistas y las voces suenan completamente naturales.",
  },
  {
    name: "Laura Mendez",
    role: "Emprendedora en e-commerce",
    initials: "LM",
    color: "bg-violet-500",
    quote:
      "Mis ventas en Instagram aumentaron un 40% desde que empece a usar UGC Studio. Los videos generados con IA convierten igual o mejor que los grabados con personas reales.",
  },
] as const;

function StarRating() {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className="h-4 w-4 fill-yellow-500 text-yellow-500"
        />
      ))}
    </div>
  );
}

export function Testimonials() {
  return (
    <section className="py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Lo que dicen nuestros creadores
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Miles de creadores y marcas ya confian en UGC Studio para generar
            su contenido.
          </p>
        </div>

        <div className="mx-auto mt-16 grid max-w-5xl gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {testimonials.map((testimonial) => (
            <Card key={testimonial.name} className="border-border/50">
              <CardContent className="p-6">
                <StarRating />
                <blockquote className="mt-4 text-sm leading-6 text-muted-foreground">
                  &ldquo;{testimonial.quote}&rdquo;
                </blockquote>
                <div className="mt-6 flex items-center gap-3">
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-semibold text-white ${testimonial.color}`}
                  >
                    {testimonial.initials}
                  </div>
                  <div>
                    <p className="text-sm font-semibold">{testimonial.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {testimonial.role}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
