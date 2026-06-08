import { AnimatedCarousel, type LogoItem } from "@/components/ui/logo-carousel";

const partnerLogos: LogoItem[] = [
  { src: "/logos/azure-color.svg", alt: "Azure" },
  { src: "/logos/cloudflare-color.svg", alt: "Cloudflare" },
  { src: "/logos/deepseek-color.svg", alt: "DeepSeek" },
  { src: "/logos/Google_Symbol_0.svg", alt: "Google" },
  { src: "/logos/MistralAI-light.svg", alt: "Mistral AI" },
  { src: "/logos/idCFFrGr_W_logos.jpeg", alt: "Nebius" },
  { src: "/logos/nebula-block.png", alt: "Nebula Block" },
  { src: "/logos/ollama.svg", alt: "Ollama", className: "dark:invert" },
  { src: "/logos/OpenAI-light.svg", darkSrc: "/logos/OpenAI_Symbol_0.svg", alt: "OpenAI" },
  { src: "/logos/pollinations-icon-seeklogo.svg", alt: "Pollinations" },
  { src: "/logos/Scaleway_id_RaUxAYi_0.svg", alt: "Scaleway" },
];

export default function EcosystemLogoCarousel() {
  return (
    <AnimatedCarousel
      title="Connected across the AI ecosystem"
      logos={partnerLogos}
      autoPlay
      autoPlayInterval={1200}
      durationSeconds={36}
      logoContainerWidth="w-28 md:w-36"
      logoContainerHeight="h-16 md:h-20"
      logoImageWidth="w-auto"
      logoImageHeight="h-10 md:h-12"
    />
  );
}
