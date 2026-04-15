export const PLANS = {
  free: {
    id: "free",
    name: "Gratis",
    description: "Perfecto para probar la plataforma",
    price: 0,
    credits: 3,
    maxDuration: 30,
    features: [
      "3 videos por mes",
      "Duracion maxima de 30 segundos",
      "Marca de agua",
      "Exportacion 720p",
    ],
    stripePriceId: null,
  },
  pro: {
    id: "pro",
    name: "Pro",
    description: "Para creadores de contenido serios",
    price: 29,
    credits: 50,
    maxDuration: 60,
    features: [
      "50 videos por mes",
      "Duracion maxima de 60 segundos",
      "Sin marca de agua",
      "Todos los proveedores de video",
      "Exportacion 1080p",
      "Soporte prioritario",
    ],
    stripePriceId: process.env.STRIPE_PRO_PRICE_ID || "",
  },
  business: {
    id: "business",
    name: "Business",
    description: "Para agencias y equipos",
    price: 99,
    credits: 200,
    maxDuration: 90,
    features: [
      "200 videos por mes",
      "Duracion maxima de 90 segundos",
      "Sin marca de agua",
      "Modo avanzado con control total",
      "Exportacion 1080p",
      "Soporte dedicado",
      "API access",
    ],
    stripePriceId: process.env.STRIPE_BUSINESS_PRICE_ID || "",
  },
} as const;

export type PlanId = keyof typeof PLANS;

export const VIDEO_STYLES = [
  {
    id: "cinematic",
    name: "Cinematografico",
    description: "Iluminacion dramatica, color grading cinematico, lentes anamorficas",
    promptSuffix: "cinematic lighting, dramatic shadows, anamorphic lens, film grain, color graded",
  },
  {
    id: "ugc-selfie",
    name: "Selfie UGC",
    description: "Camara en mano, luz natural, se siente autentico y casero",
    promptSuffix: "handheld selfie shot, natural daylight, authentic vlog aesthetic, imperfect framing, raw look",
  },
  {
    id: "product-studio",
    name: "Estudio de Producto",
    description: "Producto limpio sobre superficie, luz de estudio, alta definicion",
    promptSuffix: "clean product photography, softbox studio lighting, seamless background, ultra sharp detail",
  },
  {
    id: "lifestyle",
    name: "Lifestyle",
    description: "Personas reales usando el producto en contexto, luz natural",
    promptSuffix: "lifestyle photography, real people, natural daylight, candid moment, warm tones",
  },
  {
    id: "minimal",
    name: "Minimalista",
    description: "Paleta reducida, espacios amplios, estetica limpia",
    promptSuffix: "minimalist composition, negative space, muted palette, editorial style",
  },
  {
    id: "bold-pop",
    name: "Pop Vibrante",
    description: "Colores saturados, alto contraste, atencion inmediata",
    promptSuffix: "vibrant saturated colors, high contrast pop style, bold graphic composition",
  },
] as const;

export type VideoStyleId = (typeof VIDEO_STYLES)[number]["id"];

// Cuanto cubre cada clip image-to-video, en segundos. Base para calcular N frames.
export const SECONDS_PER_CLIP = 5;

// Voces ElevenLabs sugeridas (el usuario puede usar cualquier voice_id personalizado en modo avanzado).
export const VOICES = [
  { id: "rachel", name: "Rachel (ES-LA Natural)", elevenlabsVoiceId: "21m00Tcm4TlvDq8ikWAM", gender: "female", language: "es" },
  { id: "antoni", name: "Antoni (ES-LA Profesional)", elevenlabsVoiceId: "ErXwobaYiN019PkySvjV", gender: "male", language: "es" },
  { id: "bella", name: "Bella (ES-LA Energetica)", elevenlabsVoiceId: "EXAVITQu4vr4xnSDxMaL", gender: "female", language: "es" },
  { id: "josh", name: "Josh (ES-LA Dinamico)", elevenlabsVoiceId: "TxGEqnHWrfWFTfGW9XjX", gender: "male", language: "es" },
] as const;

export const TEMPLATE_CATEGORIES = [
  { id: "resena-producto", name: "Resena de Producto", icon: "Star" },
  { id: "unboxing", name: "Unboxing", icon: "Package" },
  { id: "tutorial", name: "Tutorial", icon: "GraduationCap" },
  { id: "testimonial", name: "Testimonial", icon: "MessageCircle" },
  { id: "comparacion", name: "Comparacion", icon: "ArrowLeftRight" },
  { id: "antes-despues", name: "Antes y Despues", icon: "RefreshCw" },
] as const;

export const VIDEO_TONES = [
  { id: "entusiasta", name: "Entusiasta", description: "Energetico y emocionado por el producto" },
  { id: "profesional", name: "Profesional", description: "Informativo y confiable" },
  { id: "casual", name: "Casual", description: "Relajado y natural, como hablar con un amigo" },
  { id: "urgente", name: "Urgente", description: "Sentido de urgencia, ideal para ofertas" },
  { id: "storytelling", name: "Storytelling", description: "Narrativo, cuenta una historia personal" },
] as const;

// Coste interno (en creditos fraccionarios) por componente. Solo para trazabilidad interna.
// 1 credito = 1 video completo del plan del usuario.
export const PROVIDER_PRICING = {
  SEEDANCE: { clipCostUsd: 0.12, label: "Seedance 2.0 (ByteDance)" },
  KLING: { clipCostUsd: 0.18, label: "Kling 2.x (Kuaishou)" },
  WAN: { clipCostUsd: 0.08, label: "Wan 2.x (Alibaba)" },
} as const;

export const IMAGE_COST_USD = 0.04; // gpt-image-1 medium quality approx
export const TTS_COST_USD_PER_SECOND = 0.002; // ElevenLabs approximation
