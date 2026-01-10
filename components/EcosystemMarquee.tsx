"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";

interface EcosystemLogo {
  id: string;
  name: string;
  logoLight: string;
  logoDark: string;
  url?: string;
}

const ecosystemLogos: EcosystemLogo[] = [
  {
    id: "1",
    name: "Azure",
    logoLight: "/logos/azure-color.svg",
    logoDark: "/logos/azure-color.svg",
    url: "https://azure.microsoft.com/en-us/products/ai-foundry/models/",
  },
  {
    id: "2",
    name: "Cloudflare",
    logoLight: "/logos/cloudflare-color.svg",
    logoDark: "/logos/cloudflare-color.svg",
    url: "https://cloudflare.com/",
  },
  {
    id: "3",
    name: "DeepSeek",
    logoLight: "/logos/deepseek-color.svg",
    logoDark: "/logos/deepseek-color.svg",
    url: "https://deepseek.ai/",
  },
  {
    id: "5",
    name: "Google",
    logoLight: "/logos/Google_Symbol_0.svg",
    logoDark: "/logos/Google_Symbol_0.svg",
    url: "https://cloud.google.com/vertex-ai/",
  },
  {
    id: "6",
    name: "Mistral AI",
    logoLight: "/logos/MistralAI-light.svg",
    logoDark: "/logos/MistralAI-light.svg",
    url: "https://mistral.ai/",
  },
  {
    id: "7",
    name: "Nebius",
    logoLight: "/logos/idCFFrGr_W_logos.jpeg",
    logoDark: "/logos/idCFFrGr_W_logos.jpeg",
    url: "https://nebius.com/",
  },
  {
    id: "8",
    name: "Nebula Block",
    logoLight: "/logos/nebula-block.png",
    logoDark: "/logos/nebula-block.png",
    url: "https://www.nebulablock.com/",
  },
  {
    id: "9",
    name: "Ollama",
    logoLight: "/logos/ollama.svg",
    logoDark: "/logos/ollama.webp",
    url: "https://ollama.com/",
  },
  {
    id: "10",
    name: "OpenAI",
    logoLight: "/logos/OpenAI-light.svg",
    logoDark: "/logos/OpenAI_Symbol_0.svg",
    url: "https://openai.com/",
  },
  {
    id: "11",
    name: "Pollinations",
    logoLight: "/logos/pollinations-icon-seeklogo.svg",
    logoDark: "/logos/pollinations_ai_logo_white.svg",
    url: "https://pollinations.ai/",
  },
  {
    id: "12",
    name: "Scaleway",
    logoLight: "/logos/Scaleway_id_RaUxAYi_0.svg",
    logoDark: "/logos/Scaleway_id_RaUxAYi_0.svg",
    url: "https://www.scaleway.com/",
  },
];

export default function EcosystemMarquee() {
  const { theme, systemTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  const currentTheme = theme === "system" ? systemTheme : theme;
  const isDarkTheme = currentTheme === "dark";

  useEffect(() => {
    setMounted(true);
  }, []);

  const duplicatedLogos = [...ecosystemLogos, ...ecosystemLogos];
  const tickerBg = isDarkTheme ? "bg-slate-900/50" : "bg-white/50";

  if (!mounted) {
    return (
      <div className={`w-full py-12 md:py-16 overflow-hidden ${tickerBg} backdrop-blur-sm`}>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
              Connected Across the AI Ecosystem
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Works with all major model providers through a unified API layer.
            </p>
          </div>
          <div className="h-16 flex items-center justify-center">
            <div className="animate-pulse bg-muted rounded w-32 h-8"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`w-full py-12 md:py-16 overflow-hidden ${tickerBg} backdrop-blur-sm`}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
            Connected Across the AI Ecosystem
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Works with all major model providers through a unified API layer.
          </p>
        </div>

        <div className="relative overflow-hidden">
          <div className="flex animate-scroll">
            {duplicatedLogos.map((logo, index) => (
              <div
                key={`${logo.id}-${index}`}
                className="flex-shrink-0 mx-4 md:mx-8 lg:mx-12 h-12 md:h-16 flex items-center justify-center"
              >
                {logo.url ? (
                  <a
                    href={logo.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="opacity-60 hover:opacity-100 transition-opacity duration-300"
                    aria-label={logo.name}
                  >
                    <img
                      src={isDarkTheme ? logo.logoDark : logo.logoLight}
                      alt={logo.name}
                      style={{
                        width: logo.name === "OpenAI" ? "65px" : "50px",
                        height: "75%",
                        maxWidth: "75px",
                      }}
                      className="h-full w-auto max-w-[180px] object-contain"
                    />
                  </a>
                ) : (
                  <div className="opacity-60">
                    <img
                      src={isDarkTheme ? logo.logoDark : logo.logoLight}
                      alt={logo.name}
                      style={{
                        width: logo.name === "OpenAI" ? "65px" : "50px",
                        height: "75%",
                        maxWidth: "75px",
                      }}
                      className="h-full w-auto max-w-[180px] object-contain"
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes scroll {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }

        .animate-scroll {
          animation: scroll 30s linear infinite;
        }

        @media (prefers-reduced-motion: reduce) {
          .animate-scroll {
            animation: none;
          }
        }
      `}</style>
    </div>
  );
}
