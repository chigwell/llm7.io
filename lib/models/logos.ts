export type ModelLogoAsset = {
  provider: string;
  lightLogo: string;
  darkLogo?: string;
  invert?: boolean;
};

export function logoDetailsForModelId(modelId: string): ModelLogoAsset | null {
  const id = modelId.toLowerCase();

  if (id.startsWith("gpt-")) return { provider: "OpenAI", lightLogo: "/openai.svg", invert: true };
  if (id.startsWith("firefly-") || id.includes("firefly")) return { provider: "Firefly", lightLogo: "/firefly-preview.png" };
  if (id.startsWith("seedance-") || id.includes("seedance")) return { provider: "Seedance", lightLogo: "/seedance-preview.png" };
  if (id.startsWith("flux-")) return { provider: "Flux", lightLogo: "/flux-lettermark-full-color.svg" };
  if (id.startsWith("claude-")) return { provider: "Anthropic", lightLogo: "/claude.svg" };
  if (id.startsWith("gemini-")) return { provider: "Google", lightLogo: "/gemini.svg" };
  if (id.startsWith("codestral-") || id.startsWith("devstral-")) return { provider: "Mistral AI", lightLogo: "/mistral-ai-logo.svg" };
  if (id.startsWith("deepseek-")) return { provider: "DeepSeek", lightLogo: "/deepseek-color.svg" };
  if (id.startsWith("glm-")) return { provider: "Z.ai", lightLogo: "/z-ai-logo.svg" };
  if (id.startsWith("grok-")) return { provider: "xAI", lightLogo: "/grok-ai-icon-light.svg", darkLogo: "/grok-icon-dark.svg" };
  if (id.startsWith("kimi-")) return { provider: "Moonshot AI", lightLogo: "/k-only-light.svg", darkLogo: "/k-only-dark.svg" };
  if (id.startsWith("minimax-")) return { provider: "MiniMax", lightLogo: "/minimax.png" };
  if (id.startsWith("qwen3") || id.startsWith("qwen-")) return { provider: "Qwen", lightLogo: "/qwen.svg" };

  return null;
}
