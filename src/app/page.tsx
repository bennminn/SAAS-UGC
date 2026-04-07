import type { Metadata } from "next";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Hero } from "@/components/landing/hero";
import { Features } from "@/components/landing/features";
import { PricingCards } from "@/components/landing/pricing-cards";
import { Testimonials } from "@/components/landing/testimonials";
import { CTA } from "@/components/landing/cta";

export const metadata: Metadata = {
  title: "UGC Studio - Genera Videos UGC con IA",
  description:
    "Crea videos UGC con avatares de inteligencia artificial para TikTok e Instagram Reels. Sin camaras, sin actores. De idea a video en minutos.",
};

export default function Home() {
  return (
    <>
      <Navbar />
      <main className="flex-1">
        <Hero />
        <section id="features">
          <Features />
        </section>
        <PricingCards />
        <section id="testimonials">
          <Testimonials />
        </section>
        <CTA />
      </main>
      <Footer />
    </>
  );
}
