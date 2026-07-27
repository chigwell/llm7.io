import Image from "next/image";
import type { PublicModel } from "@/lib/models/api-types";
import { logoDetailsForModelId } from "@/lib/models/logos";
import { cn } from "@/lib/utils";

export default function ModelLogo({ model, size = "md", className }: { model: PublicModel; size?: "sm" | "md" | "lg"; className?: string }) {
  const logo = logoDetailsForModelId(model.model_id);
  const sizes = { sm: "h-9 w-9", md: "h-12 w-12", lg: "h-16 w-16" };
  const imageSizes = { sm: 24, md: 32, lg: 42 };

  if (!logo) return <div aria-hidden="true" className={cn("grid shrink-0 place-items-center rounded-xl border border-border/60 bg-background/60 text-sm font-bold", sizes[size], className)}>{model.model_id.slice(0, 1).toUpperCase()}</div>;

  return <div className={cn("relative grid shrink-0 place-items-center rounded-xl border border-border/60 bg-background/60 shadow-sm", sizes[size], className)} title={logo.provider}>
    <Image src={logo.lightLogo} alt={logo.provider + " logo"} width={imageSizes[size]} height={imageSizes[size]} className={cn("max-h-[65%] w-auto object-contain", logo.darkLogo && "dark:hidden", logo.invert && "dark:invert")} />
    {logo.darkLogo ? <Image src={logo.darkLogo} alt={logo.provider + " logo"} width={imageSizes[size]} height={imageSizes[size]} className="hidden max-h-[65%] w-auto object-contain dark:block" /> : null}
  </div>;
}
