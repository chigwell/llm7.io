"use client";

import { useSyncExternalStore } from "react";
import fallbackModels from "@/data/payAsYouGoModels.json";
import { liveModelsStore, isApiModelsResponse } from "@/lib/models/live-models-store";
import type { ApiModel } from "@/lib/models/live-api-types";

export { MODELS_API_URL, isApiModelsResponse } from "@/lib/models/live-models-store";
export type { ApiModel, ApiModelsResponse } from "@/lib/models/live-api-types";

export function getFallbackApiModels(): ApiModel[] {
  return isApiModelsResponse(fallbackModels) ? fallbackModels.data : [];
}

/** One request, refresh timer and snapshot shared by every pricing consumer. */
export function useLivePrices() {
  return useSyncExternalStore(liveModelsStore.subscribe, liveModelsStore.getSnapshot, liveModelsStore.getServerSnapshot);
}

export function useLlm7Models() {
  const snapshot = useLivePrices();
  return { models: snapshot.models ?? getFallbackApiModels(), modelsState: snapshot.state };
}
