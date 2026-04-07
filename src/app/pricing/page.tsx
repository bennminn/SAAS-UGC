"use client";

import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { PricingCards } from "@/components/landing/pricing-cards";

export default function PricingPage() {
  return (
    <>
      <Navbar />
      <main className="flex-1 py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center mb-12">
          <h1 className="text-4xl font-bold text-foreground">
            Planes y Precios
          </h1>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
            Elige el plan que mejor se adapte a tus necesidades. Todos incluyen acceso a avatares IA y generacion de scripts automaticos.
          </p>
        </div>
        <PricingCards />
      </main>
      <Footer />
    </>
  );
}
