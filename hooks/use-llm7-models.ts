"use client";

import { useEffect, useState } from "react";
import fallbackModels from "@/data/payAsYouGoModels.json";
import type { VideoRoutePrice } from "@/lib/models/video-pricing";

export const MODELS_API_URL = "https://api.llm7.io/v1/models";

export type ApiModel = {
  id: string;
  model_type?: string;
  tier?: string;
  pricing?: {
    input?: number;
    output?: number;
    price?: number;
    cached_input?: number;
    cached_output?: number;
    cache_read?: number;
    cache_write?: number;
    public_price_usd_per_million?: {
      cached_input?: number;
      cached_output?: number;
      cache_read?: number;
      cache_write?: number;
    };
    minimum_request_price_usd?: number;
    route_prices_usd_per_second?: VideoRoutePrice[];
    currency?: string;
    unit?: string;
  };
  pricing_mode?: "token" | "image" | "second" | string;
  modalities?: {
    input?: string[];
    output?: string[];
  };
  capabilities?: {
    video_generation?: boolean;
    video_async?: boolean;
    max_reference_images?: number;
    max_reference_image_bytes?: number;
    supported_seconds?: number[];
    supported_sizes?: string[];
    [key: string]: unknown;
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
  availability_last_hour_percent?: number;
  availability?: {
    old?: number;
    mid?: number;
    recent?: number;
  };
};

export type ApiModelsResponse = {
  object: "list";
  data: ApiModel[];
};

type ModelsState = "loading" | "ready" | "error";

let cachedModels: ApiModel[] | null = null;
let cachedState: ModelsState = "loading";
let modelsRequest: Promise<ApiModel[]> | null = null;
const MODELS_REFRESH_INTERVAL_MS = 180_000;

export function isApiModelsResponse(value: unknown): value is ApiModelsResponse {
  return (
    typeof value === "object" &&
    value !== null &&
    Array.isArray((value as ApiModelsResponse).data)
  );
}

export function getFallbackApiModels(): ApiModel[] {
  if (isApiModelsResponse(fallbackModels)) {
    return fallbackModels.data;
  }

  return [];
}

async function fetchApiModels({ refresh = false }: { refresh?: boolean } = {}): Promise<ApiModel[]> {
  if (cachedModels && !refresh) return cachedModels;

  if (!modelsRequest) {
    modelsRequest = fetch(MODELS_API_URL, { cache: "no-store" })
      .then(async (response) => {
        if (!response.ok) {
          throw new Error(`Unable to load models: ${response.status}`);
        }

        const data: unknown = await response.json();
        if (!isApiModelsResponse(data)) {
          throw new Error("Unexpected models response.");
        }

        cachedModels = data.data;
        cachedState = "ready";
        return data.data;
      })
      .catch((error) => {
        cachedState = "error";
        throw error;
      })
      .finally(() => {
        modelsRequest = null;
      });
  }

  return modelsRequest;
}

export function useLlm7Models() {
  const [models, setModels] = useState<ApiModel[]>(() => cachedModels ?? getFallbackApiModels());
  const [modelsState, setModelsState] = useState<ModelsState>(cachedState);

  useEffect(() => {
    let cancelled = false;
    let interval: ReturnType<typeof setInterval> | null = null;

    setModelsState(cachedState);

    const loadModels = (refresh = false) => {
      fetchApiModels({ refresh })
        .then((data) => {
          if (!cancelled) {
            setModels(data);
            setModelsState("ready");
          }
        })
        .catch(() => {
          if (!cancelled) {
            setModelsState("error");
          }
        });
    };

    loadModels();
    interval = setInterval(() => loadModels(true), MODELS_REFRESH_INTERVAL_MS);

    return () => {
      cancelled = true;
      if (interval) clearInterval(interval);
    };
  }, []);

  return { models, modelsState };
}
