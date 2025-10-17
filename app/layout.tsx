import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import ThemeProvider from "@/providers/ThemeProvider";
import { PackageManagerProvider } from "@/contexts/PackageManagerContext";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import GoogleProvider from "@/components/GoogleProvider";


const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "LLM7.io | One LLM API. Your Gateway to AI Innovation. Connect to leading AI models with one endpoint. Prototype, build, and scale without switching providers.",
  description: "Your Gateway to AI Innovation. Connect to leading AI models with one endpoint. Prototype, build, and scale without switching providers.",
  keywords: [
    "LLM7",
    "AI API",
    "Large Language Models",
    "AI Integration",
    "AI Development",
    "AI Prototyping",
    "AI Scaling",
    "Multi-Model AI",
    "AI Platform",
    "AI Services",
    "Machine Learning API",
    "NLP API",
    "Conversational AI",
    "Generative AI",
    "AI Solutions",
    "AI Tools",
    "AI Applications",
    "AI Innovation",
    "Unified AI API",
    "AI Model Access",
    "AI Model Management",
    "AI Model Deployment",
  ],
  metadataBase: new URL("https://llm7.io"),
  alternates: {
    canonical: "https://llm7.io",
  },
  openGraph: {
    title: "LLM7.io",
    description: "Your Gateway to AI Innovation. Connect to leading AI models with one endpoint. Prototype, build, and scale without switching providers.",
    url: "https://llm7.io",
    siteName: "LLM7.io",
    type: "website",
    images: [
      {
        url: "https://llm7.io/api/og",
        width: 1200,
        height: 630,
        alt: "LLM7 Logo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "LLM7.io",
    description: "Your Gateway to AI Innovation. Connect to leading AI models with one endpoint. Prototype, build, and scale without switching providers.",
    images: [
      {
        url: "https://llm7.io/api/og",
        width: 1200,
        height: 630,
        alt: "LLM7 Logo",
      },
    ],
    creator: "@srijanbaniyal",
  },
  icons: {
    icon: [
      { url: "./favicon.ico", sizes: "any" },
      {
        url: "/favicons/favicon-16x16.png",
        sizes: "16x16",
        type: "image/png",
      },
      {
        url: "/favicons/favicon-32x32.png",
        sizes: "32x32",
        type: "image/png",
      },
    ],
    apple: [
      {
        url: "/favicons/apple-touch-icon.png",
        sizes: "180x180",
        type: "image/png",
      },
    ],
  },
  appleWebApp: {
    title: "LLM7.io",
    statusBarStyle: "default",
    capable: true,
  },
};

export const viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <GoogleProvider>
          <ThemeProvider>
            <PackageManagerProvider>
              {children}
              //<Analytics />
              //<SpeedInsights />
            </PackageManagerProvider>
          </ThemeProvider>
        </GoogleProvider>
        </body>
    </html>
  );
}
