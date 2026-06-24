"use client";

import { useEffect, useState } from "react";
import fallbackModels from "@/data/payAsYouGoModels.json";

export const MODELS_API_URL = "https://api.llm7.io/v1/models";

export type ApiModel = {
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

export type ApiModelsResponse = {
  object: "list";
  data: ApiModel[];
};

type ModelsState = "loading" | "ready" | "error";

let cachedModels: ApiModel[] | null = null;
let cachedState: ModelsState = "loading";
let modelsRequest: Promise<ApiModel[]> | null = null;

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

async function fetchApiModels(): Promise<ApiModel[]> {
  if (cachedModels) return cachedModels;

  if (!modelsRequest) {
    modelsRequest = fetch(MODELS_API_URL)
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
        modelsRequest = null;
        throw error;
      });
  }

  return modelsRequest;
}

export function useLlm7Models() {
  const [models, setModels] = useState<ApiModel[]>(() => cachedModels ?? getFallbackApiModels());
  const [modelsState, setModelsState] = useState<ModelsState>(cachedState);

  useEffect(() => {
    let cancelled = false;

    setModelsState(cachedState);

    fetchApiModels()
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

    return () => {
      cancelled = true;
    };
  }, []);

  return { models, modelsState };
}
