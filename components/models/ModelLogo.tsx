import Image from "next/image";
import type { PublicModel } from "@/lib/models/api-types";
import { cn } from "@/lib/utils";

type Logo = { name: string; light: string; dark?: string; invert?: boolean };

function logoForModelId(modelId: string): Logo | null {
  const id = modelId.toLowerCase();
  if (id.startsWith("gpt-")) return { name: "OpenAI", light: "/openai.svg", invert: true };
  if (id.startsWith("flux-")) return { name: "Flux", light: "/flux-lettermark-full-color.svg" };
  if (id.startsWith("claude-")) return { name: "Anthropic", light: "/claude.svg" };
  if (id.startsWith("gemini-")) return { name: "Google", light: "/gemini.svg" };
  if (id.startsWith("codestral-") || id.startsWith("devstral-")) return { name: "Mistral AI", light: "/mistral-ai-logo.svg" };
  if (id.startsWith("deepseek-")) return { name: "DeepSeek", light: "/deepseek-color.svg" };
  if (id.startsWith("glm-")) return { name: "Z.ai", light: "/z-ai-logo.svg" };
  if (id.startsWith("grok-")) return { name: "xAI", light: "/grok-ai-icon-light.svg", dark: "/grok-icon-dark.svg" };
  if (id.startsWith("kimi-")) return { name: "Moonshot AI", light: "/k-only-light.svg", dark: "/k-only-dark.svg" };
  if (id.startsWith("minimax-")) return { name: "MiniMax", light: "/minimax.png" };
  if (id.startsWith("qwen3") || id.startsWith("qwen-")) return { name: "Qwen", light: "/qwen.svg" };
  return null;
}

export default function ModelLogo({ model, size = "md", className }: { model: PublicModel; size?: "sm" | "md" | "lg"; className?: string }) {
  const logo = logoForModelId(model.model_id);
  const sizes = { sm: "h-9 w-9", md: "h-12 w-12", lg: "h-16 w-16" };
  const imageSizes = { sm: 24, md: 32, lg: 42 };

  if (!logo) return <div aria-hidden="true" className={cn("grid shrink-0 place-items-center rounded-xl border border-border/60 bg-background/60 text-sm font-bold", sizes[size], className)}>{model.model_id.slice(0, 1).toUpperCase()}</div>;

  return <div className={cn("relative grid shrink-0 place-items-center rounded-xl border border-border/60 bg-background/60 shadow-sm", sizes[size], className)} title={logo.name}>
    <Image src={logo.light} alt={logo.name + " logo"} width={imageSizes[size]} height={imageSizes[size]} className={cn("max-h-[65%] w-auto object-contain", logo.dark && "dark:hidden", logo.invert && "dark:invert")} />
    {logo.dark ? <Image src={logo.dark} alt={logo.name + " logo"} width={imageSizes[size]} height={imageSizes[size]} className="hidden max-h-[65%] w-auto object-contain dark:block" /> : null}
  </div>;
}
