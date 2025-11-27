"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { useState, useCallback, useEffect, useMemo, useRef, ReactNode } from "react";
import { MessageSquare, Grid3x3, CircleDot } from "lucide-react";
import { Button } from "@/components/ui/buttonShadcn";
import { GoogleLogin, CredentialResponse, GoogleOAuthProvider } from "@react-oauth/google";

/* -------------------------
   Constants
   ------------------------- */
const GA_CLIENT_ID = "264062651955-8qamru5vjtu9kc1tk2trsgte5e10hm0m.apps.googleusercontent.com";
const BASE_API_URL = "https://llm7-api.chigwel137.workers.dev";
const ID_TOKEN_KEY = "id_token";

/* -------------------------
   Types / Data
   ------------------------- */
interface FeaturedItem {
  name: string;
  description: string;
  icon: React.ReactElement;
  route: string;
  accent: "purple" | "blue" | "amber";
}

const items: FeaturedItem[] = [
  { name: "Free (Anonymous)", description: "AI-powered chat interface...", icon: <MessageSquare className="w-8 h-8" />, route: "/ai-components/magical-chat-input", accent: "purple" },
  { name: "Free (Token-based)", description: "Apple-inspired responsive grid...", icon: <Grid3x3 className="w-8 h-8" />, route: "/components/bento-grid", accent: "blue" },
  { name: "Subscription Waitlist", description: "Physics-based iOS style wheel...", icon: <CircleDot className="w-8 h-8" />, route: "/components/wheel-picker", accent: "amber" },
];

const accentClasses = {
  purple: { ring: "ring-purple-400/40", bg: "from-purple-600/20 to-violet-600/20", glow: "", text: "text-purple-300", grad: "" },
  blue: { ring: "ring-sky-400/40", bg: "from-sky-600/20 to-cyan-600/20", glow: "", text: "text-sky-300", grad: "" },
  amber: { ring: "ring-amber-400/40", bg: "from-amber-600/20 to-orange-600/20", glow: "", text: "text-amber-300", grad: "" },
} as const;

/* -------------------------
   Helper: exchange / activate token
   ------------------------- */
async function verifyAndActivate(idToken: string, setMessage?: (m: string) => void) {
  if (setMessage) setMessage("Verifying token…");
  // store token locally
  localStorage.setItem(ID_TOKEN_KEY, idToken);

  // 1) Verify on API
  const v = await fetch(`${BASE_API_URL}/verify`, {
    method: "GET",
    headers: { Authorization: `Bearer ${idToken}` },
  });
  if (!v.ok) {
    const txt = await v.text().catch(() => "");
    throw new Error(txt || "Token verification failed");
  }
  const data = await v.json();
  const verifiedEmail = (data && data.email) || "";

  if (setMessage) setMessage("Activating Basic subscription…");

  // 2) Activate
  const s = await fetch(`${BASE_API_URL}/set-sub`, {
    method: "POST",
    headers: { Authorization: `Bearer ${idToken}` },
  });
  if (!s.ok) {
    const txt = await s.text().catch(() => "");
    throw new Error(txt || "Failed to activate subscription");
  }

  return verifiedEmail;
}

/* -------------------------
   BasicSubGoogleBlock (rewritten to use @react-oauth/google)
   ------------------------- */
function BasicSubGoogleBlock({ onClose, onSuccess }: { onClose: () => void; onSuccess: (email?: string) => void }) {
  const [status, setStatus] = useState<"idle" | "loading" | "ok" | "error">("idle");
  const [message, setMessage] = useState("");
  const [email, setEmail] = useState("");
  const [isTermsAccepted, setIsTermsAccepted] = useState(false);
  const mountedRef = useRef(false);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const onCredentialResponse = useCallback(
    async (response: CredentialResponse) => {
      const credential = response.credential;
      if (!credential) {
        setStatus("error");
        setMessage("No credential returned from Google");
        return;
      }
      if (!isTermsAccepted) {
        setStatus("error");
        setMessage("Please accept the Terms and Privacy Policy first.");
        return;
      }

      setStatus("loading");
      setMessage("Signing in…");

      try {
        const verifiedEmail = await verifyAndActivate(credential, setMessage);
        if (!mountedRef.current) return;
        setEmail(verifiedEmail || "");
        setStatus("ok");
        setMessage("Basic subscription activated.");
        onSuccess(verifiedEmail);
      } catch (err: any) {
        setStatus("error");
        setMessage(err?.message || "Something went wrong");
      }
    },
    [isTermsAccepted, onSuccess]
  );

  const handleGoogleError = useCallback(() => {
    console.error("Google sign-in failed");
    setStatus("error");
    setMessage("Google sign-in failed. Please try again.");
  }, []);

  return (
    <div className="space-y-4">
      <div className="text-xl font-semibold">Join the Waitlist</div>
      <p className="text-sm text-muted-foreground">Sign in with Google to subscribe</p>

      <div className="mt-3">
        {status === "loading" && !message && (
          <div className="flex items-center justify-center h-10 w-full bg-gray-100 dark:bg-gray-800 rounded-md">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-500" />
          </div>
        )}

        {status === "error" && (
          <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md text-sm text-red-700 dark:text-red-300">
            Error: {message}
          </div>
        )}

        <div className={`flex justify-center ${isTermsAccepted ? "opacity-100" : "opacity-60 pointer-events-none"}`} style={{ minHeight: 48 }}>
          <GoogleLogin
            onSuccess={onCredentialResponse}
            onError={handleGoogleError}
          />
        </div>
      </div>

      <div className="flex items-start gap-2 mt-3 text-xs text-muted-foreground">
        <input
          id="terms-accept"
          type="checkbox"
          checked={isTermsAccepted}
          onChange={(e) => setIsTermsAccepted(e.target.checked)}
          className="w-4 h-4 rounded border-border mt-0.5"
        />
        <label htmlFor="terms-accept" className="cursor-pointer">
          I agree to the{" "}
          <a href="https://github.com/chigwell/llm7.io/blob/main/TERMS.md" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
            Terms of Service
          </a>{" "}
          and acknowledge the{" "}
          <a href="https://github.com/chigwell/llm7.io/blob/main/PRIVACY.md" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
            Privacy Policy
          </a>
          .
        </label>
      </div>

      {status !== "idle" && (
        <p className="text-sm text-muted-foreground mt-3">
          {message} {email ? <>({email})</> : null}
        </p>
      )}

      <div className="flex justify-end">
        <Button variant="outline" onClick={onClose}>
          Close
        </Button>
      </div>
    </div>
  );
}

/* -------------------------
   Pricing card + main export
   ------------------------- */
type Plan = {
  title: string;
  desc: string;
  price: string;
  period?: string;
  features?: string[];
  image?: string;
  subTiers?: Array<{ label: string; rows: Array<string | ReactNode> }>;
  action: {
    label: string;
    href?: string;
    onClick?: () => void;
    buttonStyle?: any;
    trackSource?: number;
  };
};

function PricingCard({ plan }: { plan: Plan }) {
  const recordClick = useCallback((source?: number) => {
    if (!source) return;
    const url = `https://api.llm7.io/record-click?source=${source}`;
    try {
      fetch(url, { method: "GET", keepalive: true, mode: "no-cors" }).catch(() => {});
    } catch (_err) {
      // ignore
    }
  }, []);

  const handleClick = useCallback(() => {
    recordClick(plan.action.trackSource);
    if (plan.action.href) {
      window.open(plan.action.href, "_blank", "noopener,noreferrer");
      return;
    }
    if (plan.action.onClick) plan.action.onClick();
  }, [plan, recordClick]);

  return (
    <div className="bg-card/40 backdrop-blur-xl border border-border/50 rounded-2xl p-6 md:p-7 flex flex-col shadow-lg h-full">
      <div className="flex items-center gap-3 mb-2">
        {plan.image ? (
          <div className="relative h-12 w-12 rounded-xl overflow-hidden border border-border/60 bg-muted/50 flex-shrink-0">
            <Image src={plan.image} alt={`${plan.title} badge`} fill sizes="48px" className="object-contain p-2" />
          </div>
        ) : null}
        <h3 className="text-lg md:text-xl font-semibold leading-tight">{plan.title}</h3>
      </div>

      <p className="text-sm text-muted-foreground mb-4">{plan.desc}</p>

      <div className="flex items-baseline gap-2 mb-4">
        <div className="text-2xl font-bold">{plan.price}</div>
        {plan.period ? <div className="text-lg opacity-70">/{plan.period}</div> : null}
      </div>

      {plan.subTiers ? (
        <div className="space-y-4 mb-6 flex-grow">
          {plan.subTiers.map((tier, idx) => (
            <div key={tier.label} className="rounded-xl border border-border/60 bg-muted/20 p-3">
              <div className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground mb-2">{tier.label}</div>
              <ul className="space-y-2">
                {tier.rows.map((row, rIdx) => (
                  <li key={rIdx} className="flex items-start gap-2 text-sm">
                    <span className="flex-shrink-0 w-5 h-5 rounded-full bg-green-100 border border-green-300 text-green-800 flex items-center justify-center text-xs font-bold">✓</span>
                    <span>{row}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      ) : (
        <ul className="space-y-3 mb-6 flex-grow">
          {(plan.features || []).map((info: string, idx: number) => (
            <li key={idx} className="flex items-start gap-2">
              <span className="flex-shrink-0 w-5 h-5 rounded-full bg-green-100 border border-green-300 text-green-800 flex items-center justify-center text-xs font-bold">✓</span>
              <span className="text-sm">{info}</span>
            </li>
          ))}
        </ul>
      )}

      <Button
        className={`w-full ${plan.action.buttonStyle ? "" : "bg-background hover:bg-accent"}`}
        variant={plan.action.buttonStyle ? "default" : "outline"}
        style={plan.action.buttonStyle}
        onClick={handleClick}
      >
        {plan.action.label}
      </Button>
    </div>
  );
}

export default function FeaturedComponents() {
  const [modal, setModal] = useState<string | null>(null);
  const [justActivatedEmail, setJustActivatedEmail] = useState("");

  const scrollToExample = useCallback(() => {
    const el = document.getElementById("example");
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);
  const plans = useMemo(
    () => [
      {
        title: "Free",
        desc: "Start instantly as anonymous or use a free token for higher limits.",
        price: "$0",
        subTiers: [
          {
            label: "Anonymous",
            rows: ["No sign-up", "8k chars/r*, 100 r/h, 10 r/m, 1 r/s"],
          },
          {
            label: "With free token",
            rows: [
              "Free token",
              "128k chars/req*",
              "200 r/h, 30 r/m, 2 r/s",
              "Image gen (watermark)",
              <span key="token-link">
                Get your token at{" "}
                <a href="https://token.llm7.io/" className="text-primary underline underline-offset-4" target="_blank" rel="noreferrer">
                  token.llm7.io
                </a>
              </span>,
            ],
          },
        ],
        action: { label: "See Example", onClick: scrollToExample },
      },
      {
        title: "Vibe",
        desc: "Higher limits for chat and images—great for agents and internal tools.",
        price: "$5",
        period: "m",
        image: "/vibe.png",
        features: [
          "Up to 10 text req/s",
          "Up to 600 text req/min",
          "Up to 5,000 text req/hour",
          "Up to 10 images/s",
          "Up to 60 images/min",
          "Ideal for agents, side projects, and internal tools",
        ],
        action: { label: "Choose Vibe", href: "https://token.llm7.io/?subscription=show", buttonStyle: { background: "black", color: "#fff", border: "1px solid #212121" }, trackSource: 5 },
      },
      {
        title: "Pro",
        desc: "Production plan with higher limits, JSON mode, functions, and Pro models.",
        price: "$12",
        period: "m",
        image: "/pro.png",
        features: [
          "Up to 25 text req/s",
          "Up to 1,500 text req/min",
          "Up to 15,000 text req/hour",
          "Up to 20 images/s",
          "Up to 120 images/min",
          "JSON mode",
          "Function calling",
          "Pro models",
          "Speech-to-text for production apps and APIs",
        ],
        action: { label: "Go Pro", href: "https://token.llm7.io/?subscription=show", buttonStyle: { background: "#2e34c8", color: "#fff", border: "1px solid #212121" }, trackSource: 6 },
      },
    ],
    [scrollToExample]
  );

  return (
    <GoogleOAuthProvider clientId={GA_CLIENT_ID}>
      <section id="plans" aria-labelledby="featured-heading-plans" className="relative py-20 md:py-28 overflow-hidden bg-gradient-to-b from-background via-background to-background/95">
        {/* ... header / other UI unchanged ... */}
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center mb-14 md:mb-20">
            <motion.h2 id="featured-heading-plans" initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.1 }} className="mt-6 text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight">
              <span className="bg-gradient-to-r from-foreground via-primary to-foreground bg-clip-text text-transparent">Pick a plan that grows with your goals.</span>
            </motion.h2>
            <motion.p initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.2 }} className="mt-4 max-w-2xl mx-auto text-sm md:text-base text-muted-foreground leading-relaxed">
              Compare the benefits and limits below to find the right fit.
            </motion.p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 mb-12">
            {plans.map((plan, i) => (
              <motion.div key={plan.title} initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.55, delay: i * 0.1 }}>
                <PricingCard key={i} plan={plan} />
              </motion.div>
            ))}
          </div>

          <div className="text-xs text-muted-foreground space-y-1">
            <p>* Limits depend on the model and may be lower.</p>
            <p>** Features, limits, and pricing may change.</p>
            <p>If you need more capacity, please contact us via {" "}
             <a href="mailto:support@llm7.io?subject=Subscription Inquiry&body=Hey, I would like to discuss subscription options." className="text-primary underline underline-offset-4">
                support@llm7.io
                </a>.</p>

          </div>
        </div>
      </section>

      {modal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setModal(null)}>
          <div className="bg-background rounded-xl border border-border shadow-xl w-full max-w-md p-6" onClick={(e) => e.stopPropagation()}>
            {modal === "basic" ? (justActivatedEmail ? (
              <div className="space-y-4">
                <div className="text-xl font-semibold flex items-center gap-2"><span className="text-green-500">✅</span> All set</div>
                <p className="text-sm text-muted-foreground">We will notify you when subscriptions are available.</p>
                <div className="flex justify-end"><Button onClick={() => setModal(null)}>Close</Button></div>
              </div>
            ) : (
              <BasicSubGoogleBlock onClose={() => setModal(null)} onSuccess={(email) => setJustActivatedEmail(email || "")} />
            )) : (
              <div className="space-y-4">
                <div className="text-xl font-semibold">Join the Waitlist</div>
                <p className="text-sm text-muted-foreground">Thanks for your interest. Subscriptions will open soon. This is a placeholder dialog—no data is collected here.</p>
                <div className="flex justify-end"><Button variant="outline" onClick={() => setModal(null)}>Close</Button></div>
              </div>
            )}
          </div>
        </div>
      )}
    </GoogleOAuthProvider>
  );
}
