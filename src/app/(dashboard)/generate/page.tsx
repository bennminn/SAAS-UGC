"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Check,
  ChevronLeft,
  ChevronRight,
  Film,
  Loader2,
  Play,
  RefreshCw,
  Sparkles,
  Type,
  Volume2,
  Wand2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import {
  VIDEO_TONES,
  VIDEO_STYLES,
  VOICES,
  SECONDS_PER_CLIP,
  PROVIDER_PRICING,
} from "@/lib/constants";
import {
  listVideoProviders,
  getVideoProvider,
  PRESETS,
  type VideoProviderName,
} from "@/lib/video-providers";
import { DEFAULT_IMAGE_PARAMS } from "@/lib/image-gen";
import { TTS_PARAMS_SCHEMA, DEFAULT_TTS_PARAMS } from "@/lib/tts";
import { ParamField, groupParams } from "@/components/generate/param-field";
import { cn } from "@/lib/utils";

type GenerationMode = "i2v" | "t2v";

const I2V_STEPS = ["Guion y contexto", "Estilo y proveedor", "Keyframes", "Voz y audio", "Confirmar"];
const T2V_STEPS = ["Guion y contexto", "Proveedor T2V", "Voz y audio", "Confirmar"];

type Frame = {
  id: string;
  order: number;
  imageUrl: string;
  prompt: string;
};

export default function GeneratePage() {
  const router = useRouter();
  const [mode, setMode] = useState<GenerationMode>("i2v");
  const [step, setStep] = useState(0);
  const [advanced, setAdvanced] = useState(false);

  const STEPS = mode === "t2v" ? T2V_STEPS : I2V_STEPS;

  // Step 1
  const [title, setTitle] = useState("");
  const [productName, setProductName] = useState("");
  const [businessContext, setBusinessContext] = useState("");
  const [tone, setTone] = useState("casual");
  const [platform, setPlatform] = useState("TIKTOK");
  const [duration, setDuration] = useState(30);
  const [script, setScript] = useState("");
  const [loadingScript, setLoadingScript] = useState(false);

  // Step 2 — provider + params
  const [style, setStyle] = useState<string>(VIDEO_STYLES[0].id);
  const [provider, setProvider] = useState<VideoProviderName>("SEEDANCE");
  const providers = useMemo(() => listVideoProviders(), []);
  const t2vProviders = useMemo(() => providers.filter((p) => p.supportsT2V), [providers]);
  const providerDef = useMemo(() => getVideoProvider(provider), [provider]);

  const [providerParams, setProviderParams] = useState<Record<string, unknown>>({
    ...providerDef.defaults,
  });
  const [t2vProviderParams, setT2vProviderParams] = useState<Record<string, unknown>>({
    ...(providerDef.t2vDefaults || providerDef.defaults),
  });
  useEffect(() => {
    const p = getVideoProvider(provider);
    setProviderParams({ ...p.defaults });
    setT2vProviderParams({ ...(p.t2vDefaults || p.defaults) });
  }, [provider]);

  const [imageParams, setImageParams] = useState<Record<string, unknown>>({
    ...DEFAULT_IMAGE_PARAMS,
  });

  // Step 3 — keyframes (I2V only)
  const [videoId, setVideoId] = useState<string | null>(null);
  const [frames, setFrames] = useState<Frame[]>([]);
  const [selectedFrames, setSelectedFrames] = useState<Set<string>>(new Set());
  const [generatingFrames, setGeneratingFrames] = useState(false);
  const [regenerating, setRegenerating] = useState<string | null>(null);

  // Voice
  const [voiceId, setVoiceId] = useState<string>(VOICES[0].elevenlabsVoiceId);
  const [ttsParams, setTtsParams] = useState<Record<string, unknown>>({
    ...DEFAULT_TTS_PARAMS,
    speed: 1.0,
  });

  const [submitting, setSubmitting] = useState(false);

  const nFrames = useMemo(
    () => Math.max(1, Math.ceil(duration / SECONDS_PER_CLIP)),
    [duration]
  );

  // Reset step when mode changes
  useEffect(() => {
    setStep(0);
    setFrames([]);
    setVideoId(null);
    setSelectedFrames(new Set());
  }, [mode]);

  // Ensure T2V mode has a T2V-capable provider selected
  useEffect(() => {
    if (mode === "t2v" && !providerDef.supportsT2V && t2vProviders.length > 0) {
      setProvider(t2vProviders[0].name);
    }
  }, [mode, providerDef.supportsT2V, t2vProviders]);

  async function handleGenerateScript() {
    setLoadingScript(true);
    try {
      const res = await fetch("/api/scripts/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productName,
          productDescription: businessContext,
          tone,
          platform,
          duration,
          category: "resena-producto",
        }),
      });
      const data = await res.json();
      if (data.script) setScript(data.script);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingScript(false);
    }
  }

  async function handleGenerateFrames() {
    setGeneratingFrames(true);
    try {
      const res = await fetch("/api/frames/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title || productName || "Video UGC",
          script,
          businessContext,
          platform,
          duration,
          style,
          provider,
          providerParams,
          imageParams,
          ttsParams,
          voiceId,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error");
      setVideoId(data.videoId);
      setFrames(data.frames);
      setSelectedFrames(new Set(data.frames.map((f: Frame) => f.id)));
    } catch (e) {
      alert((e as Error).message);
    } finally {
      setGeneratingFrames(false);
    }
  }

  async function handleRegenerateFrame(frameId: string) {
    setRegenerating(frameId);
    try {
      const res = await fetch("/api/frames/regenerate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ frameId }),
      });
      const data = await res.json();
      if (data.frame) {
        setFrames((prev) => prev.map((f) => (f.id === frameId ? data.frame : f)));
      }
    } finally {
      setRegenerating(null);
    }
  }

  function toggleFrame(id: string) {
    setSelectedFrames((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  async function handleAnimate() {
    if (!videoId) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/videos/${videoId}/animate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ selectedFrameIds: Array.from(selectedFrames) }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error");
      router.push(`/generate/${videoId}`);
    } catch (e) {
      alert((e as Error).message);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleTextToVideo() {
    setSubmitting(true);
    try {
      const res = await fetch("/api/videos/text-to-video", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title || productName || "Video T2V",
          script,
          businessContext,
          platform,
          duration,
          provider,
          providerParams: t2vProviderParams,
          ttsParams,
          voiceId,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error");
      router.push(`/generate/${data.videoId}`);
    } catch (e) {
      alert((e as Error).message);
    } finally {
      setSubmitting(false);
    }
  }

  function applyPreset(presetId: string) {
    const p = PRESETS.find((x) => x.id === presetId);
    if (!p) return;
    const merge = p.params[provider];
    if (merge) {
      if (mode === "t2v") setT2vProviderParams((prev) => ({ ...prev, ...merge }));
      else setProviderParams((prev) => ({ ...prev, ...merge }));
    }
  }

  const canProceed = (() => {
    if (mode === "t2v") {
      switch (step) {
        case 0: return productName.length > 0 && script.length > 20;
        case 1: return Boolean(provider) && providerDef.supportsT2V;
        case 2: return Boolean(voiceId);
        case 3: return true;
        default: return false;
      }
    }
    switch (step) {
      case 0: return productName.length > 0 && script.length > 20;
      case 1: return Boolean(style && provider);
      case 2: return frames.length > 0 && selectedFrames.size > 0;
      case 3: return Boolean(voiceId);
      case 4: return true;
      default: return false;
    }
  })();

  // Determine which content to render for current step
  const isVoiceStep = (mode === "t2v" && step === 2) || (mode === "i2v" && step === 3);
  const isConfirmStep = (mode === "t2v" && step === 3) || (mode === "i2v" && step === 4);

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Generar Video</h1>
          <p className="mt-1 text-muted-foreground">
            {mode === "t2v"
              ? "Guion → Seedance T2V → narracion TTS"
              : "Guion → keyframes → animacion → narracion TTS"}
          </p>
        </div>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={advanced}
            onChange={(e) => setAdvanced(e.target.checked)}
            className="h-4 w-4"
          />
          <Wand2 className="h-4 w-4" />
          Modo avanzado
        </label>
      </div>

      {/* Mode selector */}
      <div className="flex gap-3">
        <button
          type="button"
          onClick={() => setMode("i2v")}
          className={cn(
            "flex flex-1 items-center gap-3 rounded-lg border-2 p-4 text-left transition-colors",
            mode === "i2v"
              ? "border-primary bg-primary/5"
              : "border-border hover:bg-accent/40"
          )}
        >
          <Film className="h-5 w-5 shrink-0 text-primary" />
          <div>
            <p className="font-semibold text-sm">Imagen a Video (I2V)</p>
            <p className="text-xs text-muted-foreground">
              gpt-image-1 genera keyframes → proveedor los anima
            </p>
          </div>
        </button>
        <button
          type="button"
          onClick={() => setMode("t2v")}
          className={cn(
            "flex flex-1 items-center gap-3 rounded-lg border-2 p-4 text-left transition-colors",
            mode === "t2v"
              ? "border-primary bg-primary/5"
              : "border-border hover:bg-accent/40"
          )}
        >
          <Type className="h-5 w-5 shrink-0 text-primary" />
          <div>
            <p className="font-semibold text-sm">Texto a Video (T2V)</p>
            <p className="text-xs text-muted-foreground">
              Seedance 2.0 genera el video directo desde el guion
            </p>
          </div>
        </button>
      </div>

      <StepIndicator current={step} steps={STEPS} />

      <Card>
        <CardHeader>
          <CardTitle>{STEPS[step]}</CardTitle>
        </CardHeader>
        <CardContent>
          {step === 0 && (
            <div className="space-y-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Titulo (opcional)</label>
                  <Input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Mi video UGC"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Producto / Marca</label>
                  <Input
                    value={productName}
                    onChange={(e) => setProductName(e.target.value)}
                    placeholder="Ej: Crema hidratante XYZ"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Contexto de negocio</label>
                <Textarea
                  rows={3}
                  value={businessContext}
                  onChange={(e) => setBusinessContext(e.target.value)}
                  placeholder="Describe tu marca, publico objetivo, beneficios clave, estetica deseada..."
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Tono</label>
                  <Select value={tone} onChange={(e) => setTone(e.target.value)}>
                    {VIDEO_TONES.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name}
                      </option>
                    ))}
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Plataforma</label>
                  <Select
                    value={platform}
                    onChange={(e) => setPlatform(e.target.value)}
                  >
                    <option value="TIKTOK">TikTok</option>
                    <option value="REELS">Instagram Reels</option>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Duracion (s)</label>
                  <Select
                    value={String(duration)}
                    onChange={(e) => setDuration(Number(e.target.value))}
                  >
                    <option value="15">15</option>
                    <option value="30">30</option>
                    <option value="45">45</option>
                    <option value="60">60</option>
                    <option value="90">90</option>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium">Guion</label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={loadingScript || !productName}
                    onClick={handleGenerateScript}
                  >
                    {loadingScript ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Sparkles className="mr-2 h-4 w-4" />
                    )}
                    Generar con IA
                  </Button>
                </div>
                <Textarea
                  rows={7}
                  value={script}
                  onChange={(e) => setScript(e.target.value)}
                  placeholder="Escribe el guion o genera uno con IA..."
                />
                <p className="text-xs text-muted-foreground">
                  {script.length} caracteres
                  {mode === "i2v" && ` · se dividira en ${nFrames} keyframes`}
                </p>
              </div>
            </div>
          )}

          {step === 1 && mode === "i2v" && (
            <div className="space-y-6">
              <div>
                <h3 className="mb-3 text-sm font-medium">Estilo visual</h3>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {VIDEO_STYLES.map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => setStyle(s.id)}
                      className={cn(
                        "rounded-lg border-2 p-4 text-left transition-colors",
                        style === s.id
                          ? "border-primary bg-primary/5"
                          : "border-border hover:bg-accent/40"
                      )}
                    >
                      <p className="font-semibold">{s.name}</p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {s.description}
                      </p>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="mb-3 text-sm font-medium">Proveedor de video</h3>
                <div className="grid gap-3 sm:grid-cols-3">
                  {providers.map((p) => (
                    <button
                      key={p.name}
                      type="button"
                      onClick={() => setProvider(p.name)}
                      className={cn(
                        "rounded-lg border-2 p-4 text-left transition-colors",
                        provider === p.name
                          ? "border-primary bg-primary/5"
                          : "border-border hover:bg-accent/40"
                      )}
                    >
                      <p className="font-semibold">{p.label}</p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        ~${PROVIDER_PRICING[p.name].clipCostUsd.toFixed(2)} por clip de{" "}
                        {SECONDS_PER_CLIP}s
                      </p>
                    </button>
                  ))}
                </div>
              </div>

              {advanced && (
                <div className="space-y-4 rounded-lg border border-dashed p-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-medium">Parametros del proveedor</h3>
                    <Select
                      defaultValue=""
                      onChange={(e) => {
                        if (e.target.value) applyPreset(e.target.value);
                      }}
                    >
                      <option value="">Aplicar preset…</option>
                      {PRESETS.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.label}
                        </option>
                      ))}
                    </Select>
                  </div>
                  {Object.entries(groupParams(providerDef.paramsSchema)).map(
                    ([group, fields]) => (
                      <div key={group} className="space-y-3">
                        <p className="text-xs font-semibold uppercase text-muted-foreground">
                          {group}
                        </p>
                        <div className="grid gap-3 sm:grid-cols-2">
                          {fields.map((f) => (
                            <ParamField
                              key={f.key}
                              field={f}
                              value={providerParams[f.key]}
                              onChange={(v) =>
                                setProviderParams((prev) => ({ ...prev, [f.key]: v }))
                              }
                            />
                          ))}
                        </div>
                      </div>
                    )
                  )}

                  <div className="border-t pt-4">
                    <p className="mb-3 text-xs font-semibold uppercase text-muted-foreground">
                      gpt-image-1 (Vercel AI SDK)
                    </p>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div className="space-y-1">
                        <label className="text-xs font-medium">Tamano</label>
                        <Select
                          value={String(imageParams.size || "1024x1536")}
                          onChange={(e) =>
                            setImageParams((p) => ({ ...p, size: e.target.value }))
                          }
                        >
                          <option value="1024x1536">1024x1536 (9:16)</option>
                          <option value="1024x1024">1024x1024 (cuadrado)</option>
                          <option value="1536x1024">1536x1024 (horizontal)</option>
                        </Select>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {step === 1 && mode === "t2v" && (
            <div className="space-y-6">
              <div>
                <h3 className="mb-3 text-sm font-medium">Proveedor Texto a Video</h3>
                {t2vProviders.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    No hay proveedores con soporte T2V configurados.
                  </p>
                ) : (
                  <div className="grid gap-3 sm:grid-cols-3">
                    {t2vProviders.map((p) => (
                      <button
                        key={p.name}
                        type="button"
                        onClick={() => setProvider(p.name)}
                        className={cn(
                          "rounded-lg border-2 p-4 text-left transition-colors",
                          provider === p.name
                            ? "border-primary bg-primary/5"
                            : "border-border hover:bg-accent/40"
                        )}
                      >
                        <p className="font-semibold">{p.label}</p>
                        <Badge variant="secondary" className="mt-1 text-xs">
                          T2V
                        </Badge>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {advanced && providerDef.t2vParamsSchema && (
                <div className="space-y-4 rounded-lg border border-dashed p-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-medium">Parametros T2V</h3>
                    <Select
                      defaultValue=""
                      onChange={(e) => {
                        if (e.target.value) applyPreset(e.target.value);
                      }}
                    >
                      <option value="">Aplicar preset…</option>
                      {PRESETS.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.label}
                        </option>
                      ))}
                    </Select>
                  </div>
                  {Object.entries(groupParams(providerDef.t2vParamsSchema)).map(
                    ([group, fields]) => (
                      <div key={group} className="space-y-3">
                        <p className="text-xs font-semibold uppercase text-muted-foreground">
                          {group}
                        </p>
                        <div className="grid gap-3 sm:grid-cols-2">
                          {fields.map((f) => (
                            <ParamField
                              key={f.key}
                              field={f}
                              value={t2vProviderParams[f.key]}
                              onChange={(v) =>
                                setT2vProviderParams((prev) => ({ ...prev, [f.key]: v }))
                              }
                            />
                          ))}
                        </div>
                      </div>
                    )
                  )}
                </div>
              )}
            </div>
          )}

          {step === 2 && mode === "i2v" && (
            <div className="space-y-6">
              {frames.length === 0 ? (
                <div className="rounded-lg border-2 border-dashed p-8 text-center">
                  <p className="mb-4 text-sm text-muted-foreground">
                    Se generaran {nFrames} keyframes con gpt-image-1 a partir de tu guion
                  </p>
                  <Button
                    disabled={generatingFrames}
                    onClick={handleGenerateFrames}
                    size="lg"
                  >
                    {generatingFrames ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Generando {nFrames} keyframes…
                      </>
                    ) : (
                      <>
                        <Sparkles className="mr-2 h-4 w-4" />
                        Generar {nFrames} keyframes
                      </>
                    )}
                  </Button>
                </div>
              ) : (
                <>
                  <p className="text-sm text-muted-foreground">
                    Selecciona los keyframes que quieres animar ({selectedFrames.size}/
                    {frames.length} seleccionados). Puedes regenerar cualquiera.
                  </p>
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {frames.map((f) => (
                      <div
                        key={f.id}
                        className={cn(
                          "relative overflow-hidden rounded-lg border-2 transition-colors",
                          selectedFrames.has(f.id)
                            ? "border-primary"
                            : "border-border"
                        )}
                      >
                        <button
                          type="button"
                          onClick={() => toggleFrame(f.id)}
                          className="block w-full"
                        >
                          {f.imageUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={f.imageUrl}
                              alt={`Frame ${f.order + 1}`}
                              className="aspect-[9/16] w-full object-cover"
                            />
                          ) : (
                            <div className="flex aspect-[9/16] w-full items-center justify-center bg-muted text-xs text-muted-foreground">
                              Fallo
                            </div>
                          )}
                        </button>
                        <div className="flex items-center justify-between border-t p-2">
                          <span className="text-xs font-medium">
                            Frame {f.order + 1}
                          </span>
                          <Button
                            variant="ghost"
                            size="sm"
                            disabled={regenerating === f.id}
                            onClick={() => handleRegenerateFrame(f.id)}
                          >
                            <RefreshCw
                              className={cn(
                                "h-3 w-3",
                                regenerating === f.id && "animate-spin"
                              )}
                            />
                          </Button>
                        </div>
                        {selectedFrames.has(f.id) && (
                          <div className="absolute right-2 top-2 rounded-full bg-primary p-1 text-primary-foreground">
                            <Check className="h-3 w-3" />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}

          {isVoiceStep && (
            <div className="space-y-6">
              <div className="space-y-3">
                {VOICES.map((v) => (
                  <button
                    key={v.id}
                    type="button"
                    onClick={() => setVoiceId(v.elevenlabsVoiceId)}
                    className={cn(
                      "flex w-full items-center justify-between rounded-lg border-2 p-4 text-left transition-colors",
                      voiceId === v.elevenlabsVoiceId
                        ? "border-primary bg-primary/5"
                        : "border-border hover:bg-accent/40"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/15">
                        <Volume2 className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-semibold">{v.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {v.gender === "female" ? "Femenina" : "Masculina"} ·{" "}
                          {v.language.toUpperCase()}
                        </p>
                      </div>
                    </div>
                    {voiceId === v.elevenlabsVoiceId && (
                      <Badge className="bg-primary/15 text-primary border-primary/20">
                        Seleccionada
                      </Badge>
                    )}
                  </button>
                ))}
              </div>

              {advanced && (
                <div className="space-y-4 rounded-lg border border-dashed p-4">
                  <h3 className="text-sm font-medium">Parametros TTS</h3>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {TTS_PARAMS_SCHEMA.map((f) => (
                      <ParamField
                        key={f.key}
                        field={f}
                        value={ttsParams[f.key]}
                        onChange={(v) =>
                          setTtsParams((prev) => ({ ...prev, [f.key]: v }))
                        }
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {isConfirmStep && (
            <div className="space-y-6">
              <div className="space-y-3 rounded-lg border p-4 text-sm">
                <SummaryRow label="Modo" value={mode === "t2v" ? "Texto a Video (T2V)" : "Imagen a Video (I2V)"} />
                <SummaryRow label="Producto" value={productName} />
                <SummaryRow label="Plataforma" value={platform} />
                <SummaryRow label="Duracion" value={`${duration}s`} />
                {mode === "i2v" && (
                  <SummaryRow
                    label="Estilo"
                    value={VIDEO_STYLES.find((s) => s.id === style)?.name || style}
                  />
                )}
                <SummaryRow label="Proveedor" value={providerDef.label} />
                {mode === "i2v" && (
                  <SummaryRow
                    label="Keyframes seleccionados"
                    value={`${selectedFrames.size} / ${frames.length}`}
                  />
                )}
                <div className="border-t pt-3">
                  <p className="text-xs text-muted-foreground">Guion</p>
                  <p className="mt-1 whitespace-pre-wrap">{script}</p>
                </div>
              </div>

              <Button
                size="lg"
                className="w-full"
                disabled={submitting}
                onClick={mode === "t2v" ? handleTextToVideo : handleAnimate}
              >
                {submitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {mode === "t2v" ? "Generando video…" : "Iniciando animacion…"}
                  </>
                ) : (
                  <>
                    <Play className="mr-2 h-4 w-4" />
                    {mode === "t2v"
                      ? "Generar video con Seedance T2V"
                      : "Animar y componer video final"}
                  </>
                )}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex justify-between">
        <Button
          variant="outline"
          disabled={step === 0}
          onClick={() => setStep((s) => Math.max(0, s - 1))}
        >
          <ChevronLeft className="mr-2 h-4 w-4" /> Anterior
        </Button>
        {step < STEPS.length - 1 && (
          <Button
            disabled={!canProceed}
            onClick={() => setStep((s) => Math.min(STEPS.length - 1, s + 1))}
          >
            Siguiente <ChevronRight className="ml-2 h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}

function StepIndicator({ current, steps }: { current: number; steps: string[] }) {
  return (
    <div className="flex items-center justify-between">
      {steps.map((label, i) => (
        <div key={label} className="flex items-center">
          <div className="flex flex-col items-center">
            <div
              className={cn(
                "flex h-9 w-9 items-center justify-center rounded-full border-2 text-sm font-medium",
                i < current
                  ? "border-primary bg-primary text-primary-foreground"
                  : i === current
                    ? "border-primary text-primary"
                    : "border-muted text-muted-foreground"
              )}
            >
              {i < current ? <Check className="h-4 w-4" /> : i + 1}
            </div>
            <span
              className={cn(
                "mt-2 hidden text-xs sm:block",
                i <= current ? "font-medium text-foreground" : "text-muted-foreground"
              )}
            >
              {label}
            </span>
          </div>
          {i < steps.length - 1 && (
            <div
              className={cn(
                "mx-2 h-0.5 w-6 sm:w-12",
                i < current ? "bg-primary" : "bg-muted"
              )}
            />
          )}
        </div>
      ))}
    </div>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}
