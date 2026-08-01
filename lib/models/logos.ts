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
  if (id.startsWith("kling-") || id.includes("kling")) return { provider: "Kling", lightLogo: "/kling.png" };
  if (id.startsWith("flux-")) return { provider: "Flux", lightLogo: "/flux-lettermark-full-color.svg" };
  if (id.startsWith("claude-")) return { provider: "Anthropic", lightLogo: "/claude.svg" };
  if (id.startsWith("gemini-")) return { provider: "Google", lightLogo: "/gemini.svg" };
  if (id.startsWith("codestral-") || id.startsWith("devstral-") || id.startsWith("mistral-")) return { provider: "Mistral AI", lightLogo: "/mistral-ai-logo.svg" };
  if (id.startsWith("meta-")) return { provider: "Meta", lightLogo: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/05/Meta_Platforms_Inc._logo_%28cropped%29.svg/960px-Meta_Platforms_Inc._logo_%28cropped%29.svg.png?_=20230731184236" };
  if (id.startsWith("seed-")) return { provider: "ByteDance", lightLogo: "/bytedance-icon.png" };
  if (id.startsWith("l3-8b")) return { provider: "Hugging Face", lightLogo: "https://cdn-avatars.huggingface.co/v1/production/uploads/64be6a5376a6e2efccc638c1/gvRRLHsicTCxpURJeQDv3.jpeg" };
  if (id.startsWith("xiaomimimo")) return { provider: "Xiaomi", lightLogo: "https://chathub.gg/_next/image?url=https%3A%2F%2Fapp.chathub.gg%2Flogos%2Fxiaomi.png&w=256&q=90" };
  if (id.startsWith("deepseek-")) return { provider: "DeepSeek", lightLogo: "/deepseek-color.svg" };
  if (id.startsWith("glm-")) return { provider: "Z.ai", lightLogo: "/z-ai-logo.svg" };
  if (id.startsWith("grok-")) return { provider: "xAI", lightLogo: "/grok-ai-icon-light.svg", darkLogo: "/grok-icon-dark.svg" };
  if (id.startsWith("kimi-")) return { provider: "Moonshot AI", lightLogo: "/k-only-light.svg", darkLogo: "/k-only-dark.svg" };
  if (id.startsWith("minimax-")) return { provider: "MiniMax", lightLogo: "/minimax.png" };
  if (id.startsWith("qwen3") || id.startsWith("qwen-")) return { provider: "Qwen", lightLogo: "/qwen.svg" };

  return null;
}
