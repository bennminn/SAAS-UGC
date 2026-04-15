import { NextResponse } from "next/server";
import { VOICES } from "@/lib/constants";
import { listVoices } from "@/lib/tts";

/**
 * GET /api/voices
 * Devuelve el listado curado + voces remotas de ElevenLabs si la API key esta configurada.
 */
export async function GET() {
  const curated = VOICES.map((v) => ({
    voice_id: v.elevenlabsVoiceId,
    name: v.name,
    category: "curated",
    labels: { gender: v.gender, language: v.language },
  }));

  try {
    const remote = await listVoices();
    return NextResponse.json({ voices: [...curated, ...remote] });
  } catch {
    return NextResponse.json({ voices: curated });
  }
}
