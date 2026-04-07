import OpenAI from "openai";

let _openai: OpenAI | null = null;
function getOpenAI(): OpenAI {
  if (!_openai) {
    _openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY || "sk-placeholder" });
  }
  return _openai;
}

interface GenerateScriptParams {
  productName: string;
  productDescription: string;
  tone: string;
  platform: "TIKTOK" | "REELS";
  duration: number;
  category: string;
}

export async function generateScript(
  params: GenerateScriptParams
): Promise<string> {
  const { productName, productDescription, tone, platform, duration, category } =
    params;

  const wordCount = Math.round(duration * 2.5); // ~2.5 words per second in Spanish
  const platformGuidance =
    platform === "TIKTOK"
      ? "El tono debe ser muy directo, informal y con jerga juvenil. Usa frases cortas y contundentes. Empieza con un gancho que detenga el scroll inmediatamente."
      : "El tono puede ser ligeramente más pulido y visual. Enfocate en la estetica y en transiciones suaves. El gancho debe ser visualmente descriptivo.";

  const prompt = `Eres un experto copywriter de UGC (User Generated Content) en español latinoamericano.
Genera un guion para un video de ${platform === "TIKTOK" ? "TikTok" : "Instagram Reels"}.

PRODUCTO: ${productName}
DESCRIPCION: ${productDescription}
CATEGORIA: ${category}
TONO: ${tone}
DURACION: ${duration} segundos (aproximadamente ${wordCount} palabras)

INSTRUCCIONES DE PLATAFORMA:
${platformGuidance}

ESTRUCTURA DEL GUION:
1. **GANCHO** (primeros 3 segundos): Una frase impactante que capture la atencion inmediatamente. Puede ser una pregunta provocadora, una afirmacion sorprendente o un problema comun.
2. **PROBLEMA** (siguientes 5-8 segundos): Identifica el dolor o necesidad del espectador. Hazlo personal y relatable.
3. **SOLUCION** (parte central): Presenta el producto como la solucion natural. Menciona 2-3 beneficios clave de forma natural, no como lista.
4. **CALL TO ACTION** (ultimos 3-5 segundos): Cierre persuasivo con urgencia o incentivo claro.

REGLAS:
- Escribe SOLO en español latinoamericano natural
- NO uses hashtags ni emojis en el guion
- El guion debe sonar como una persona real hablando a camara, NO como un anuncio
- Usa "tu" (informal) para dirigirte al espectador
- Adapta el largo exactamente a ${duration} segundos
- Devuelve SOLO el guion, sin encabezados, sin formato markdown, sin indicaciones de seccion`;

  const response = await getOpenAI().chat.completions.create({
    model: "gpt-4o",
    messages: [
      {
        role: "system",
        content:
          "Eres un experto en UGC y marketing digital en Latinoamerica. Solo respondes con el guion solicitado, sin explicaciones adicionales.",
      },
      { role: "user", content: prompt },
    ],
    temperature: 0.8,
    max_tokens: 1000,
  });

  const script = response.choices[0]?.message?.content?.trim();

  if (!script) {
    throw new Error("No se pudo generar el guion");
  }

  return script;
}
