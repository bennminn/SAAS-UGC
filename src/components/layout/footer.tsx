import Link from "next/link";
import { Video } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t bg-card">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-2">
              <Video className="h-6 w-6 text-primary" />
              <span className="text-lg font-bold">UGC Studio</span>
            </div>
            <p className="mt-3 max-w-md text-sm text-muted-foreground">
              Genera videos UGC profesionales con inteligencia artificial. Crea contenido viral para
              TikTok e Instagram Reels en minutos.
            </p>
          </div>
          <div>
            <h3 className="text-sm font-semibold">Producto</h3>
            <ul className="mt-3 space-y-2">
              <li>
                <Link href="/#features" className="text-sm text-muted-foreground hover:text-foreground">
                  Caracteristicas
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="text-sm text-muted-foreground hover:text-foreground">
                  Precios
                </Link>
              </li>
              <li>
                <Link href="/register" className="text-sm text-muted-foreground hover:text-foreground">
                  Comenzar Gratis
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold">Legal</h3>
            <ul className="mt-3 space-y-2">
              <li>
                <Link href="#" className="text-sm text-muted-foreground hover:text-foreground">
                  Terminos de Servicio
                </Link>
              </li>
              <li>
                <Link href="#" className="text-sm text-muted-foreground hover:text-foreground">
                  Politica de Privacidad
                </Link>
              </li>
              <li>
                <Link href="#" className="text-sm text-muted-foreground hover:text-foreground">
                  Contacto
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-8 border-t pt-8 text-center text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} UGC Studio. Todos los derechos reservados.
        </div>
      </div>
    </footer>
  );
}
