import { AnimatedCarousel, type LogoItem } from "@/components/ui/logo-carousel";

const partnerLogos: LogoItem[] = [
  { src: "/logos/azure-color.svg", alt: "Azure", href: "https://azure.microsoft.com/en-us/products/ai-foundry/models/" },
  { src: "/logos/cloudflare-color.svg", alt: "Cloudflare", href: "https://cloudflare.com/" },
  { src: "/logos/deepseek-color.svg", alt: "DeepSeek", href: "https://deepseek.ai/" },
  { src: "/logos/Google_Symbol_0.svg", alt: "Google", href: "https://cloud.google.com/vertex-ai/" },
  { src: "/logos/MistralAI-light.svg", alt: "Mistral AI", href: "https://mistral.ai/" },
  { src: "/logos/idCFFrGr_W_logos.jpeg", alt: "Nebius", href: "https://nebius.com/" },
  { src: "/logos/nebula-block.png", alt: "Nebula Block", href: "https://www.nebulablock.com/" },
  { src: "/logos/ollama.svg", alt: "Ollama", href: "https://ollama.com/", className: "dark:invert" },
  {
    src: "/logos/OpenAI-light.svg",
    darkSrc: "/logos/OpenAI_Symbol_0.svg",
    alt: "OpenAI",
    href: "https://openai.com/",
    className: "scale-125",
  },
  {
    src: "/logos/pollinations-icon-seeklogo.svg",
    darkSrc: "/logos/pollinations_ai_logo_white.svg",
    alt: "Pollinations",
    href: "https://pollinations.ai/",
  },
  { src: "/logos/Scaleway_id_RaUxAYi_0.svg", alt: "Scaleway", href: "https://www.scaleway.com/" },
];

export default function EcosystemLogoCarousel() {
  return (
    <AnimatedCarousel
      title="Connected across the AI ecosystem"
      logos={partnerLogos}
      autoPlay
      autoPlayInterval={1200}
      durationSeconds={56}
      logoContainerWidth="w-28 md:w-36"
      logoContainerHeight="h-14 md:h-16"
      logoImageWidth="w-auto"
      logoImageHeight="h-9 md:h-10"
      logoMaxHeight="max-h-9 md:max-h-10"
    />
  );
}
