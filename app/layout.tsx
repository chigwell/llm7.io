import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import ThemeProvider from "@/providers/ThemeProvider";
import { PackageManagerProvider } from "@/contexts/PackageManagerContext";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Vyoma UI | Truly Beyond UI. Designed with Spatial Wisdom Inside.",
  description: "Truly Beyond UI. Designed with Spatial Wisdom Inside.",
  keywords: [
    "Vyoma UI",
    "React UI",
    "Component Library",
    "Open Source",
    "Modern UI",
    "Customizable",
    "Interactive",
    "Spatial Design",
    "VUI",
  ],
  metadataBase: new URL("https://vyomaui.design"),
  alternates: {
    canonical: "https://vyomaui.design",
  },
  openGraph: {
    title: "Vyoma UI",
    description: "Truly Beyond UI. Designed with Spatial Wisdom Inside.",
    url: "https://vyomaui.design/",
    siteName: "Vyoma UI",
    type: "website",
    images: [
      {
        url: "https://vyomaui.design/api/og",
        width: 1200,
        height: 630,
        alt: "Vyoma UI Logo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Vyoma UI",
    description: "Truly Beyond UI. Designed with Spatial Wisdom Inside.",
    images: [
      {
        url: "https://vyomaui.design/api/og",
        width: 1200,
        height: 630,
        alt: "Vyoma UI Logo",
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
    title: "Vyoma UI",
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
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider>
          <PackageManagerProvider>
            {children}
            <Analytics />
            <SpeedInsights />
          </PackageManagerProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
