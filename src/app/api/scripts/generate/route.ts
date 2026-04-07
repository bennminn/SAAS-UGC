import { NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth";
import { generateScript } from "@/lib/openai";

export async function POST(req: Request) {
  try {
    const session = await getServerSession();
    if (!session?.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const body = await req.json();
    const { productName, productDescription, tone, platform, duration, category } = body;

    if (!productName || !productDescription || !tone || !platform) {
      return NextResponse.json({ error: "Faltan campos requeridos" }, { status: 400 });
    }

    const script = await generateScript({
      productName,
      productDescription,
      tone,
      platform,
      duration: duration || 30,
      category: category || "resena-producto",
    });

    return NextResponse.json({ script });
  } catch (error) {
    console.error("Script generation error:", error);
    return NextResponse.json({ error: "Error al generar el script" }, { status: 500 });
  }
}
