// Define the type for the model from the API
export type ApiModel = {
  id: string;
  object: string;
  created: number;
  owned_by: string;
  modalities: {
    input: string[];
  };
  model_tier: string;
};

// Transform API model to our format
export const transformApiModel = (apiModel: ApiModel) => {
  // Create a display name from the model ID
  let name = apiModel.id;

  // Convert kebab-case to Title Case for better readability
  name = name
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

  return {
    id: apiModel.id,
    name,
    // Store additional info for potential future use
    owned_by: apiModel.owned_by,
    modalities: apiModel.modalities,
    model_tier: apiModel.model_tier,
  };
};

export const CHAT_MODELS: ApiModel[] = [
  {
    id: "default",
    object: "model",
    created: 1764003930,
    owned_by: "llm7",
    modalities: {
      input: ["text", "image"],
    },
    model_tier: "standard",
  },
  {
    id: "fast",
    object: "model",
    created: 1764003931,
    owned_by: "llm7",
    modalities: {
      input: ["text", "image"],
    },
    model_tier: "standard",
  },
  {
    id: "pro",
    object: "model",
    created: 1764003931,
    owned_by: "llm7",
    modalities: {
      input: ["text", "image"],
    },
    model_tier: "pro",
  },
];
