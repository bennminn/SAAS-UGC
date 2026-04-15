import { NextResponse } from "next/server";

/**
 * POST /api/videos/generate
 *
 * DEPRECADO: el pipeline ahora se inicia en /api/frames/generate (crea el video
 * y los keyframes), seguido de /api/videos/[id]/animate tras la seleccion del
 * usuario. Se mantiene este endpoint devolviendo 410 para detectar
 * integraciones antiguas.
 */
export async function POST() {
  return NextResponse.json(
    {
      error:
        "Este endpoint fue reemplazado. Usa /api/frames/generate y /api/videos/[id]/animate",
    },
    { status: 410 }
  );
}
