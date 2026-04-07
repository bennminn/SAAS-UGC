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
      "Avatares basicos",
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
      "Todos los avatares",
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
      "Todos los avatares premium",
      "Exportacion 4K",
      "Soporte dedicado",
      "API access",
    ],
    stripePriceId: process.env.STRIPE_BUSINESS_PRICE_ID || "",
  },
} as const;

export type PlanId = keyof typeof PLANS;

export const AVATARS = [
  {
    id: "avatar-1",
    name: "Sofia",
    description: "Joven, energetica, ideal para productos de belleza y moda",
    imageUrl: "/images/avatars/sofia.jpg",
    heygenAvatarId: "sofia_avatar_id",
  },
  {
    id: "avatar-2",
    name: "Carlos",
    description: "Profesional, confiable, perfecto para tecnologia y finanzas",
    imageUrl: "/images/avatars/carlos.jpg",
    heygenAvatarId: "carlos_avatar_id",
  },
  {
    id: "avatar-3",
    name: "Luna",
    description: "Creativa, autentica, genial para lifestyle y bienestar",
    imageUrl: "/images/avatars/luna.jpg",
    heygenAvatarId: "luna_avatar_id",
  },
  {
    id: "avatar-4",
    name: "Diego",
    description: "Dinamico, persuasivo, excelente para deportes y fitness",
    imageUrl: "/images/avatars/diego.jpg",
    heygenAvatarId: "diego_avatar_id",
  },
  {
    id: "avatar-5",
    name: "Valentina",
    description: "Elegante, sofisticada, ideal para lujo y gastronomia",
    imageUrl: "/images/avatars/valentina.jpg",
    heygenAvatarId: "valentina_avatar_id",
  },
  {
    id: "avatar-6",
    name: "Mateo",
    description: "Casual, cercano, perfecto para productos del hogar",
    imageUrl: "/images/avatars/mateo.jpg",
    heygenAvatarId: "mateo_avatar_id",
  },
];

export const VOICES = [
  { id: "voice-1", name: "Sofia Natural", language: "es", gender: "female", elevenlabsVoiceId: "voice_sofia" },
  { id: "voice-2", name: "Carlos Profesional", language: "es", gender: "male", elevenlabsVoiceId: "voice_carlos" },
  { id: "voice-3", name: "Luna Energetica", language: "es", gender: "female", elevenlabsVoiceId: "voice_luna" },
  { id: "voice-4", name: "Diego Dinamico", language: "es", gender: "male", elevenlabsVoiceId: "voice_diego" },
];

export const TEMPLATE_CATEGORIES = [
  { id: "resena-producto", name: "Resena de Producto", icon: "Star" },
  { id: "unboxing", name: "Unboxing", icon: "Package" },
  { id: "tutorial", name: "Tutorial", icon: "GraduationCap" },
  { id: "testimonial", name: "Testimonial", icon: "MessageCircle" },
  { id: "comparacion", name: "Comparacion", icon: "ArrowLeftRight" },
  { id: "antes-despues", name: "Antes y Despues", icon: "RefreshCw" },
];

export const VIDEO_TONES = [
  { id: "entusiasta", name: "Entusiasta", description: "Energetico y emocionado por el producto" },
  { id: "profesional", name: "Profesional", description: "Informativo y confiable" },
  { id: "casual", name: "Casual", description: "Relajado y natural, como hablar con un amigo" },
  { id: "urgente", name: "Urgente", description: "Sentido de urgencia, ideal para ofertas" },
  { id: "storytelling", name: "Storytelling", description: "Narrativo, cuenta una historia personal" },
];
