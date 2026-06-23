"use client";

import Image from "next/image";
import { useCallback, useEffect, useMemo, useState } from "react";
import { CheckCircle2Icon, ChevronDownIcon, ChevronUpIcon, Loader2Icon, XIcon } from "lucide-react";
import { GoogleLogin, type CredentialResponse } from "@react-oauth/google";
import fallbackModels from "@/data/payAsYouGoModels.json";
import { Button } from "@/components/ui/buttonShadcn";
import { ShinyButton } from "@/components/ui/shiny-button";
import { cn } from "@/lib/utils";

const BASE_API_URL = "https://api-token.llm7.io";
const MODELS_API_URL = "https://api.llm7.io/v1/models";

type PayModel = {
  id: string;
  name: string;
  provider: string;
  lightLogo?: string;
  darkLogo?: string;
  tier?: string;
  chips: Array<"tools" | "vision" | "json" | "stream" | "reasoning">;
  contextWindow: string;
  inputPrice: string;
  outputPrice: string;
  minimumRequestPrice?: string;
  usageBasedOnly?: boolean;
};

type ApiModel = {
  id: string;
  tier?: string;
  pricing?: {
    input?: number;
    output?: number;
    minimum_request_price_usd?: number;
    currency?: string;
    unit?: string;
  };
  modalities?: {
    input?: string[];
    output?: string[];
  };
  context_window?: {
    tokens?: number | null;
    chars?: number | null;
  };
  usage_based_only?: boolean;
  stream?: boolean;
  json_mode?: boolean;
  reasoning?: boolean;
  tools_calling?: boolean;
};

type ApiModelsResponse = {
  object: "list";
  data: ApiModel[];
};

type WaitlistState = "idle" | "submitting" | "success" | "error";

function providerDetails(id: string) {
  const modelId = id.toLowerCase();

  if (modelId.startsWith("gpt-5")) {
    return { provider: "OpenAI", lightLogo: "/openai.svg", darkLogo: "/openai.svg" };
  }

  if (modelId.startsWith("claude-")) {
    return { provider: "Anthropic", lightLogo: "/claude.svg", darkLogo: "/claude.svg" };
  }

  if (modelId.startsWith("kimi-")) {
    return { provider: "Moonshot AI", lightLogo: "/k-only-light.svg", darkLogo: "/k-only-dark.svg" };
  }

  if (modelId.startsWith("minimax-")) {
    return { provider: "MiniMax", lightLogo: "/minimax.png", darkLogo: "/minimax.png" };
  }

  if (modelId.startsWith("qwen3")) {
    return { provider: "Qwen", lightLogo: "/qwen.svg", darkLogo: "/qwen.svg" };
  }

  return { provider: "" };
}

function formatUsd(value?: number) {
  if (typeof value !== "number" || !Number.isFinite(value)) return "n/a";

  const digits = value < 0.01 ? 4 : 2;
  return `$${value.toLocaleString("en-US", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  })}`;
}

function formatContextWindow(model: ApiModel) {
  const tokens = model.context_window?.tokens;
  if (typeof tokens === "number" && Number.isFinite(tokens)) {
    if (tokens >= 1_000_000) return `${tokens / 1_000_000}M tokens`;
    if (tokens >= 1_000) return `${Math.round(tokens / 1_000)}k tokens`;
    return `${tokens.toLocaleString("en-US")} tokens`;
  }

  const chars = model.context_window?.chars;
  if (typeof chars === "number" && Number.isFinite(chars)) {
    if (chars >= 1_000_000) return `${chars / 1_000_000}M chars`;
    if (chars >= 1_000) return `${Math.round(chars / 1_000)}k chars`;
    return `${chars.toLocaleString("en-US")} chars`;
  }

  return "Not listed";
}

function modelChips(model: ApiModel): PayModel["chips"] {
  return [
    model.tools_calling ? "tools" : null,
    model.modalities?.input?.includes("image") ? "vision" : null,
    model.json_mode ? "json" : null,
    model.stream ? "stream" : null,
    model.reasoning ? "reasoning" : null,
  ].filter(Boolean) as PayModel["chips"];
}

function transformApiModel(model: ApiModel): PayModel {
  const provider = providerDetails(model.id);
  const unit = model.pricing?.unit ?? "1M tokens";
  const inputPrice = formatUsd(model.pricing?.input);
  const outputPrice = formatUsd(model.pricing?.output);

  return {
    id: model.id,
    name: model.id,
    ...provider,
    tier: model.tier,
    chips: modelChips(model),
    contextWindow: formatContextWindow(model),
    inputPrice: `${inputPrice} / ${unit}`,
    outputPrice: `${outputPrice} / ${unit}`,
    minimumRequestPrice:
      typeof model.pricing?.minimum_request_price_usd === "number"
        ? formatUsd(model.pricing.minimum_request_price_usd)
        : undefined,
    usageBasedOnly: model.usage_based_only,
  };
}

function isApiModelsResponse(value: unknown): value is ApiModelsResponse {
  return (
    typeof value === "object" &&
    value !== null &&
    Array.isArray((value as ApiModelsResponse).data)
  );
}

function normalizeFallbackModels(): PayModel[] {
  if (isApiModelsResponse(fallbackModels)) {
    return fallbackModels.data.map(transformApiModel);
  }

  if (Array.isArray(fallbackModels)) {
    return fallbackModels as PayModel[];
  }

  return [];
}

function ProviderLogo({ model }: { model: PayModel }) {
  const isOpenAi = model.provider.toLowerCase() === "openai";

  if (!model.lightLogo) {
    return null;
  }

  return (
    <div className="relative flex h-11 w-11 shrink-0 items-center justify-center">
      <Image
        src={model.lightLogo}
        alt={`${model.provider} logo`}
        width={30}
        height={30}
        className={cn(
          "max-h-7 w-auto object-contain",
          model.darkLogo && model.darkLogo !== model.lightLogo && "dark:hidden",
          isOpenAi && "dark:invert"
        )}
      />
      {model.darkLogo && model.darkLogo !== model.lightLogo ? (
        <Image
          src={model.darkLogo}
          alt={`${model.provider} logo`}
          width={30}
          height={30}
          className="hidden max-h-7 w-auto object-contain dark:block"
        />
      ) : null}
    </div>
  );
}

function ModelCard({ model }: { model: PayModel }) {
  return (
    <article className="flex h-full flex-col rounded-xl border border-border/60 bg-card/55 p-4 shadow-sm backdrop-blur">
      <div className="flex items-start gap-3">
        <ProviderLogo model={model} />
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <h4 className="min-w-0 truncate text-base font-semibold leading-6">{model.name}</h4>
            {model.tier ? (
              <span className="shrink-0 rounded-full border border-border/50 bg-background/70 px-2 py-0.5 text-[10px] font-medium uppercase tracking-[0.08em] text-muted-foreground">
                {model.tier}
              </span>
            ) : null}
          </div>
          {model.provider ? <p className="text-xs text-muted-foreground">{model.provider}</p> : null}
        </div>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-2 text-sm">
        <div className="rounded-lg border border-border/50 bg-background/60 p-2">
          <div className="text-[11px] text-muted-foreground">Input</div>
          <div className="mt-1 text-xs font-semibold">{model.inputPrice}</div>
        </div>
        <div className="rounded-lg border border-border/50 bg-background/60 p-2">
          <div className="text-[11px] text-muted-foreground">Output</div>
          <div className="mt-1 text-xs font-semibold">{model.outputPrice}</div>
        </div>
      </div>

      <div className={cn("mt-3 grid gap-2 text-sm", model.minimumRequestPrice ? "grid-cols-2" : "grid-cols-1")}>
        <div className="rounded-lg border border-border/50 bg-background/60 p-2">
          <div className="text-[11px] text-muted-foreground">Context</div>
          <div className="mt-1 text-xs font-semibold">{model.contextWindow}</div>
        </div>
        {model.minimumRequestPrice ? (
          <div className="rounded-lg border border-border/50 bg-background/60 p-2">
            <div className="text-[11px] text-muted-foreground">Min request</div>
            <div className="mt-1 text-xs font-semibold">{model.minimumRequestPrice}</div>
          </div>
        ) : null}
      </div>

      <div className="mt-4 flex flex-wrap gap-1.5">
        {model.chips.length > 0 ? (
          model.chips.map((chip) => (
            <span key={chip} className="rounded-full bg-primary/10 px-2 py-1 text-[11px] font-medium capitalize text-primary">
              {chip}
            </span>
          ))
        ) : (
          <span className="rounded-full bg-muted px-2 py-1 text-[11px] font-medium text-muted-foreground">Capabilities vary</span>
        )}
        {model.usageBasedOnly ? (
          <span className="rounded-full bg-muted px-2 py-1 text-[11px] font-medium text-muted-foreground">Usage only</span>
        ) : null}
      </div>
    </article>
  );
}

function decodeGoogleEmail(token: string) {
  const payload = token.split(".")[1];
  if (!payload) throw new Error("Invalid Google credential.");

  const base64 = payload.replace(/-/g, "+").replace(/_/g, "/");
  const decoded = JSON.parse(window.atob(base64)) as { email?: string };
  const email = decoded.email?.trim().toLowerCase();

  if (!email) throw new Error("Google credential did not include an email.");
  return email;
}

async function submitWaitlist(token: string, email: string) {
  const response = await fetch(`${BASE_API_URL}/wait-list`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email,
      google_token: token,
    }),
  });

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    const message = typeof data.error === "string" ? data.error : "Unable to join the waiting list.";
    throw new Error(message);
  }
}

export default function PayAsYouGoModels() {
  const [showAll, setShowAll] = useState(false);
  const [models, setModels] = useState<PayModel[]>(() => normalizeFallbackModels());
  const [modelsState, setModelsState] = useState<"loading" | "ready" | "error">("loading");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [waitlistState, setWaitlistState] = useState<WaitlistState>("idle");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function fetchModels() {
      try {
        setModelsState("loading");
        const response = await fetch(MODELS_API_URL);

        if (!response.ok) {
          throw new Error(`Unable to load models: ${response.status}`);
        }

        const data: unknown = await response.json();
        if (!isApiModelsResponse(data)) {
          throw new Error("Unexpected models response.");
        }

        if (!cancelled) {
          setModels(data.data.map(transformApiModel));
          setModelsState("ready");
        }
      } catch {
        if (!cancelled) {
          setModelsState("error");
        }
      }
    }

    fetchModels();

    return () => {
      cancelled = true;
    };
  }, []);

  const visibleModels = useMemo(() => {
    const sortedModels = [...models].sort((a, b) => {
      const aHasImage = a.lightLogo ? 0 : 1;
      const bHasImage = b.lightLogo ? 0 : 1;
      return aHasImage - bHasImage;
    });

    if (showAll) return sortedModels;

    const proModels = sortedModels.filter((model) => model.tier?.toLowerCase() === "pro");
    return (proModels.length >= 3 ? proModels : sortedModels).slice(0, 3);
  }, [models, showAll]);

  const hiddenCount = Math.max(models.length - visibleModels.length, 0);

  const openWaitlist = useCallback(() => {
    setErrorMessage("");
    setWaitlistState("idle");
    setIsModalOpen(true);
  }, []);

  const handleCredential = useCallback(async (response: CredentialResponse) => {
    const token = response.credential;
    if (!token) {
      setWaitlistState("error");
      setErrorMessage("No credential returned from Google.");
      return;
    }

    setWaitlistState("submitting");
    setErrorMessage("");

    try {
      const email = decodeGoogleEmail(token);
      await submitWaitlist(token, email);
      setWaitlistState("success");
    } catch (error) {
      setWaitlistState("error");
      setErrorMessage(error instanceof Error ? error.message : "Unable to join the waiting list.");
    }
  }, []);

  const handleGoogleError = useCallback(() => {
    setWaitlistState("error");
    setErrorMessage("Google sign-in failed. Please try again.");
  }, []);

  return (
    <section aria-labelledby="payg-heading" className="mx-auto mt-[4.5rem] w-full max-w-md md:mt-24 md:max-w-[61rem]">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-primary">Or pay as you go</p>
          <h3 id="payg-heading" className="mt-2 text-2xl font-bold tracking-tight md:text-3xl">
            Scale frontier model access on your terms.
          </h3>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
            Join the waitlist for metered billing across premium model routes, with live per-token pricing and capability details.
          </p>
        </div>
        <ShinyButton onClick={openWaitlist} className="w-full md:w-auto">
          Join waiting list
        </ShinyButton>
      </div>

      <div className="mt-4 text-xs text-muted-foreground">
        {modelsState === "loading" ? "Loading current model pricing..." : null}
        {modelsState === "error" ? "Showing cached model pricing while live pricing is unavailable." : null}
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
        {visibleModels.map((model) => (
          <ModelCard key={model.id} model={model} />
        ))}
      </div>

      <p className="mt-4 text-xs text-muted-foreground">
        Prices are shown per 1M tokens unless a model lists a different unit. Minimum request price is shown when provided by the model endpoint.{" "}
        <a href={MODELS_API_URL} target="_blank" rel="noreferrer" className="text-primary underline underline-offset-4">
          See all models in JSON format via API
        </a>
        .
      </p>

      {hiddenCount > 0 ? (
        <div className="mt-5 flex justify-center">
          <Button variant="outline" onClick={() => setShowAll((value) => !value)}>
            {showAll ? (
              <>
                Show less <ChevronUpIcon className="h-4 w-4" />
              </>
            ) : (
              <>
                Show all {models.length} models <ChevronDownIcon className="h-4 w-4" />
              </>
            )}
          </Button>
        </div>
      ) : null}

      {isModalOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4" onClick={() => setIsModalOpen(false)}>
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
          <div
            className="relative w-full max-w-md rounded-2xl border border-border/60 bg-background p-6 shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.14em] text-primary">Pay as you go</p>
                <h4 className="mt-1 text-2xl font-semibold leading-tight">Join the waiting list</h4>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setIsModalOpen(false)} aria-label="Close">
                <XIcon className="h-5 w-5" />
              </Button>
            </div>

            {waitlistState === "success" ? (
              <div className="mt-6 rounded-xl border border-green-500/40 bg-green-500/10 p-4 text-green-900 dark:text-green-200">
                <div className="flex items-center gap-2 font-semibold">
                  <CheckCircle2Icon className="h-5 w-5" />
                  Thanks, we will notify you!
                </div>
                <p className="mt-2 text-sm">You are on the list. We will notify you when pay-as-you-go access is ready.</p>
              </div>
            ) : (
              <>
                <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                  Sign in with Google so we can attach your request to a verified account.
                </p>
                <div className="mt-5 flex flex-col gap-3">
                  <div className="flex min-h-10 items-center justify-center gap-3">
                    <GoogleLogin onSuccess={handleCredential} onError={handleGoogleError} />
                    {waitlistState === "submitting" ? <Loader2Icon className="h-4 w-4 animate-spin text-primary" /> : null}
                  </div>
                  {waitlistState === "error" ? (
                    <div className="rounded-lg border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
                      {errorMessage}
                    </div>
                  ) : null}
                </div>
              </>
            )}
          </div>
        </div>
      ) : null}
    </section>
  );
}
