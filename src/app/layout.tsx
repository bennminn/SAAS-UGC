import type { Metadata } from "next";
import { Providers } from "@/app/providers";
import "./globals.css";

export const metadata: Metadata = {
  title: "UGC Studio - Genera Videos UGC con IA",
  description:
    "Crea videos UGC profesionales con avatares de inteligencia artificial para TikTok e Instagram Reels. Sin camaras, sin actores.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="h-full antialiased">
      <body className="min-h-full flex flex-col font-sans">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
