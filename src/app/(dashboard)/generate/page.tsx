"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Check,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Play,
  RefreshCw,
  User,
  Volume2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { AVATARS, VOICES, VIDEO_TONES } from "@/lib/constants";
import { cn } from "@/lib/utils";

const STEPS = [
  "Describe tu Producto",
  "Edita el Script",
  "Elige tu Avatar",
  "Selecciona la Voz",
  "Confirmar y Generar",
];

export default function GeneratePage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  // Step 1
  const [productName, setProductName] = useState("");
  const [productDescription, setProductDescription] = useState("");
  const [tone, setTone] = useState("");
  const [platform, setPlatform] = useState("TIKTOK");
  const [duration, setDuration] = useState("30");

  // Step 2
  const [script, setScript] = useState("");

  // Step 3
  const [selectedAvatar, setSelectedAvatar] = useState("");

  // Step 4
  const [selectedVoice, setSelectedVoice] = useState("");

  async function handleGenerateScript() {
    setIsLoading(true);
    try {
      const res = await fetch("/api/scripts/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productName,
          productDescription,
          tone,
          platform,
          duration: parseInt(duration),
        }),
      });
      const data = await res.json();
      setScript(
        data.script ||
          `¡Hola! ¿Buscas ${productName}? Te cuento por que me encanta este producto. ${productDescription} No te lo pierdas, enlace en mi bio. 🔥`
      );
      setCurrentStep(1);
    } catch {
      setScript(
        `¡Hola! ¿Buscas ${productName}? Te cuento por que me encanta este producto. ${productDescription} No te lo pierdas, enlace en mi bio. 🔥`
      );
      setCurrentStep(1);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleGenerateVideo() {
    setIsGenerating(true);
    try {
      const res = await fetch("/api/videos/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          script,
          avatarId: selectedAvatar,
          voiceId: selectedVoice,
          platform,
          duration: parseInt(duration),
        }),
      });
      const data = await res.json();
      router.push(`/generate/${data.id || "mock-video-1"}`);
    } catch {
      router.push("/generate/mock-video-1");
    }
  }

  const canProceed = () => {
    switch (currentStep) {
      case 0:
        return productName && productDescription && tone;
      case 1:
        return script.length > 0;
      case 2:
        return selectedAvatar !== "";
      case 3:
        return selectedVoice !== "";
      case 4:
        return true;
      default:
        return false;
    }
  };

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Generar Video</h1>
        <p className="mt-1 text-muted-foreground">
          Sigue los pasos para crear tu video UGC
        </p>
      </div>

      {/* Step indicator */}
      <div className="flex items-center justify-between">
        {STEPS.map((step, index) => (
          <div key={step} className="flex items-center">
            <div className="flex flex-col items-center">
              <div
                className={cn(
                  "flex h-10 w-10 items-center justify-center rounded-full border-2 text-sm font-medium transition-colors",
                  index < currentStep
                    ? "border-primary bg-primary text-primary-foreground"
                    : index === currentStep
                      ? "border-primary text-primary"
                      : "border-muted text-muted-foreground"
                )}
              >
                {index < currentStep ? (
                  <Check className="h-5 w-5" />
                ) : (
                  index + 1
                )}
              </div>
              <span
                className={cn(
                  "mt-2 hidden text-xs sm:block",
                  index <= currentStep
                    ? "text-foreground font-medium"
                    : "text-muted-foreground"
                )}
              >
                {step}
              </span>
            </div>
            {index < STEPS.length - 1 && (
              <div
                className={cn(
                  "mx-2 h-0.5 w-8 sm:w-16",
                  index < currentStep ? "bg-primary" : "bg-muted"
                )}
              />
            )}
          </div>
        ))}
      </div>

      {/* Step content */}
      <Card>
        <CardHeader>
          <CardTitle>{STEPS[currentStep]}</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Step 1: Product Description */}
          {currentStep === 0 && (
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  Nombre del Producto
                </label>
                <Input
                  placeholder="Ej: Crema Hidratante XYZ"
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  Descripcion del Producto
                </label>
                <Textarea
                  placeholder="Describe las caracteristicas principales, beneficios y publico objetivo..."
                  rows={4}
                  value={productDescription}
                  onChange={(e) => setProductDescription(e.target.value)}
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">
                    Tono
                  </label>
                  <Select
                    value={tone}
                    onChange={(e) => setTone(e.target.value)}
                  >
                    <option value="">Seleccionar tono...</option>
                    {VIDEO_TONES.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name}
                      </option>
                    ))}
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">
                    Plataforma
                  </label>
                  <Select
                    value={platform}
                    onChange={(e) => setPlatform(e.target.value)}
                  >
                    <option value="TIKTOK">TikTok</option>
                    <option value="REELS">Instagram Reels</option>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">
                    Duracion
                  </label>
                  <Select
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                  >
                    <option value="15">15 segundos</option>
                    <option value="30">30 segundos</option>
                    <option value="60">60 segundos</option>
                  </Select>
                </div>
              </div>
              <Button
                className="w-full"
                size="lg"
                disabled={!canProceed() || isLoading}
                onClick={handleGenerateScript}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generando Script...
                  </>
                ) : (
                  "Generar Script con IA"
                )}
              </Button>
            </div>
          )}

          {/* Step 2: Edit Script */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <Textarea
                rows={8}
                value={script}
                onChange={(e) => setScript(e.target.value)}
                placeholder="El script generado aparecera aqui..."
              />
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  {script.length} caracteres
                </span>
                <Button
                  variant="outline"
                  onClick={handleGenerateScript}
                  disabled={isLoading}
                >
                  <RefreshCw
                    className={cn(
                      "mr-2 h-4 w-4",
                      isLoading && "animate-spin"
                    )}
                  />
                  Regenerar
                </Button>
              </div>
            </div>
          )}

          {/* Step 3: Choose Avatar */}
          {currentStep === 2 && (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {AVATARS.map((avatar) => (
                <button
                  key={avatar.id}
                  onClick={() => setSelectedAvatar(avatar.id)}
                  className={cn(
                    "flex flex-col items-center rounded-lg border-2 p-4 text-left transition-colors hover:bg-accent/50",
                    selectedAvatar === avatar.id
                      ? "border-primary bg-primary/5"
                      : "border-border"
                  )}
                >
                  <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-primary/20 to-primary/5">
                    <User className="h-10 w-10 text-primary/60" />
                  </div>
                  <p className="mt-3 font-semibold text-foreground">
                    {avatar.name}
                  </p>
                  <p className="mt-1 text-center text-xs text-muted-foreground">
                    {avatar.description}
                  </p>
                  {selectedAvatar === avatar.id && (
                    <Badge className="mt-2 bg-primary/15 text-primary border-primary/20">
                      Seleccionado
                    </Badge>
                  )}
                </button>
              ))}
            </div>
          )}

          {/* Step 4: Select Voice */}
          {currentStep === 3 && (
            <div className="space-y-3">
              {VOICES.map((voice) => (
                <button
                  key={voice.id}
                  onClick={() => setSelectedVoice(voice.id)}
                  className={cn(
                    "flex w-full items-center justify-between rounded-lg border-2 p-4 text-left transition-colors hover:bg-accent/50",
                    selectedVoice === voice.id
                      ? "border-primary bg-primary/5"
                      : "border-border"
                  )}
                >
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-primary/20 to-primary/5">
                      <Volume2 className="h-6 w-6 text-primary/60" />
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">
                        {voice.name}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {voice.gender === "female" ? "Femenina" : "Masculina"} ·{" "}
                        {voice.language.toUpperCase()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation();
                      }}
                    >
                      <Play className="h-4 w-4" />
                    </Button>
                    {selectedVoice === voice.id && (
                      <Badge className="bg-primary/15 text-primary border-primary/20">
                        Seleccionada
                      </Badge>
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* Step 5: Confirm */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <div className="space-y-4 rounded-lg border border-border p-4">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">
                    Producto
                  </span>
                  <span className="text-sm font-medium text-foreground">
                    {productName}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">
                    Plataforma
                  </span>
                  <Badge
                    className={
                      platform === "TIKTOK"
                        ? "bg-pink-500/15 text-pink-400 border-pink-500/20"
                        : "bg-purple-500/15 text-purple-400 border-purple-500/20"
                    }
                  >
                    {platform}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">
                    Duracion
                  </span>
                  <span className="text-sm font-medium text-foreground">
                    {duration}s
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Tono</span>
                  <span className="text-sm font-medium text-foreground">
                    {VIDEO_TONES.find((t) => t.id === tone)?.name || tone}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Avatar</span>
                  <span className="text-sm font-medium text-foreground">
                    {AVATARS.find((a) => a.id === selectedAvatar)?.name}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Voz</span>
                  <span className="text-sm font-medium text-foreground">
                    {VOICES.find((v) => v.id === selectedVoice)?.name}
                  </span>
                </div>
                <div className="border-t border-border pt-4">
                  <span className="text-sm text-muted-foreground">Script</span>
                  <p className="mt-2 text-sm text-foreground whitespace-pre-wrap">
                    {script}
                  </p>
                </div>
              </div>
              <Button
                className="w-full"
                size="lg"
                disabled={isGenerating}
                onClick={handleGenerateVideo}
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Iniciando generacion...
                  </>
                ) : (
                  "Generar Video"
                )}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Navigation */}
      {currentStep > 0 && (
        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={() => setCurrentStep(currentStep - 1)}
          >
            <ChevronLeft className="mr-2 h-4 w-4" />
            Anterior
          </Button>
          {currentStep < 4 && (
            <Button
              disabled={!canProceed()}
              onClick={() => setCurrentStep(currentStep + 1)}
            >
              Siguiente
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
