"use client";

import Image from "next/image";
import { useCallback, useMemo, useState } from "react";
import { CheckCircle2Icon, ChevronDownIcon, ChevronUpIcon, Loader2Icon, XIcon } from "lucide-react";
import { GoogleLogin, type CredentialResponse } from "@react-oauth/google";
import models from "@/data/payAsYouGoModels.json";
import { Button } from "@/components/ui/buttonShadcn";
import { ShinyButton } from "@/components/ui/shiny-button";
import { cn } from "@/lib/utils";

const BASE_API_URL = "https://llm7-api.chigwel137.workers.dev";

type PayModel = {
  id: string;
  name: string;
  provider: string;
  lightLogo?: string;
  darkLogo?: string;
  chips: string[];
  contextWindow: string;
  inputPrice: string;
  outputPrice: string;
};

type WaitlistState = "idle" | "submitting" | "success" | "error";

function ProviderLogo({ model }: { model: PayModel }) {
  const isOpenAi = model.provider.toLowerCase() === "openai";
  const fallback = model.provider
    .split(/\s+/)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  if (!model.lightLogo) {
    return (
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-muted/60 text-sm font-semibold text-muted-foreground">
        {fallback}
      </div>
    );
  }

  return (
    <div className="relative flex h-11 w-11 shrink-0 items-center justify-center">
      <Image
        src={model.lightLogo}
        alt={`${model.provider} logo`}
        width={30}
        height={30}
        className={cn(
          "max-h-7 w-auto object-contain",
          model.darkLogo && model.darkLogo !== model.lightLogo && "dark:hidden",
          isOpenAi && "dark:invert"
        )}
      />
      {model.darkLogo && model.darkLogo !== model.lightLogo ? (
        <Image
          src={model.darkLogo}
          alt={`${model.provider} logo`}
          width={30}
          height={30}
          className="hidden max-h-7 w-auto object-contain dark:block"
        />
      ) : null}
    </div>
  );
}

function ModelCard({ model }: { model: PayModel }) {
  return (
    <article className="flex h-full flex-col rounded-xl border border-border/60 bg-card/55 p-4 shadow-sm backdrop-blur">
      <div className="flex items-start gap-3">
        <ProviderLogo model={model} />
        <div className="min-w-0">
          <h4 className="truncate text-base font-semibold leading-6">{model.name}</h4>
          <p className="text-xs text-muted-foreground">{model.provider}</p>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-2 text-sm">
        <div className="rounded-lg border border-border/50 bg-background/60 p-2">
          <div className="text-[11px] text-muted-foreground">Input</div>
          <div className="mt-1 font-semibold">{model.inputPrice}</div>
        </div>
        <div className="rounded-lg border border-border/50 bg-background/60 p-2">
          <div className="text-[11px] text-muted-foreground">Output</div>
          <div className="mt-1 font-semibold">{model.outputPrice}</div>
        </div>
      </div>
    </article>
  );
}

function decodeGoogleEmail(token: string) {
  const payload = token.split(".")[1];
  if (!payload) throw new Error("Invalid Google credential.");

  const base64 = payload.replace(/-/g, "+").replace(/_/g, "/");
  const decoded = JSON.parse(window.atob(base64)) as { email?: string };
  const email = decoded.email?.trim().toLowerCase();

  if (!email) throw new Error("Google credential did not include an email.");
  return email;
}

async function submitWaitlist(token: string, email: string) {
  const response = await fetch(`${BASE_API_URL}/wait-list`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email,
      google_token: token,
    }),
  });

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    const message = typeof data.error === "string" ? data.error : "Unable to join the waiting list.";
    throw new Error(message);
  }
}

export default function PayAsYouGoModels() {
  const [showAll, setShowAll] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [waitlistState, setWaitlistState] = useState<WaitlistState>("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const visibleModels = useMemo(() => {
    const typedModels = models as PayModel[];
    return showAll ? typedModels : typedModels.slice(0, 3);
  }, [showAll]);

  const hiddenCount = Math.max((models as PayModel[]).length - 3, 0);

  const openWaitlist = useCallback(() => {
    setErrorMessage("");
    setWaitlistState("idle");
    setIsModalOpen(true);
  }, []);

  const handleCredential = useCallback(async (response: CredentialResponse) => {
    const token = response.credential;
    if (!token) {
      setWaitlistState("error");
      setErrorMessage("No credential returned from Google.");
      return;
    }

    setWaitlistState("submitting");
    setErrorMessage("");

    try {
      const email = decodeGoogleEmail(token);
      await submitWaitlist(token, email);
      setWaitlistState("success");
    } catch (error) {
      setWaitlistState("error");
      setErrorMessage(error instanceof Error ? error.message : "Unable to join the waiting list.");
    }
  }, []);

  const handleGoogleError = useCallback(() => {
    setWaitlistState("error");
    setErrorMessage("Google sign-in failed. Please try again.");
  }, []);

  return (
    <section aria-labelledby="payg-heading" className="mx-auto mt-[4.5rem] w-full max-w-md md:mt-24 md:max-w-[61rem]">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-primary">Or pay as you go</p>
          <h3 id="payg-heading" className="mt-2 text-2xl font-bold tracking-tight md:text-3xl">
            Scale frontier model access on your terms.
          </h3>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
            Join the waitlist for metered billing across premium model routes, with transparent per-token pricing.
          </p>
        </div>
        <ShinyButton onClick={openWaitlist} className="w-full md:w-auto">
          Join waiting list
        </ShinyButton>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
        {visibleModels.map((model) => (
          <ModelCard key={model.id} model={model} />
        ))}
      </div>

      <p className="mt-4 text-xs text-muted-foreground">Prices are per 1M tokens.</p>

      {hiddenCount > 0 ? (
        <div className="mt-5 flex justify-center">
          <Button variant="outline" onClick={() => setShowAll((value) => !value)}>
            {showAll ? (
              <>
                Show less <ChevronUpIcon className="h-4 w-4" />
              </>
            ) : (
              <>
                Show {hiddenCount} more <ChevronDownIcon className="h-4 w-4" />
              </>
            )}
          </Button>
        </div>
      ) : null}

      {isModalOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4" onClick={() => setIsModalOpen(false)}>
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
          <div
            className="relative w-full max-w-md rounded-2xl border border-border/60 bg-background p-6 shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.14em] text-primary">Pay as you go</p>
                <h4 className="mt-1 text-2xl font-semibold leading-tight">Join the waiting list</h4>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setIsModalOpen(false)} aria-label="Close">
                <XIcon className="h-5 w-5" />
              </Button>
            </div>

            {waitlistState === "success" ? (
              <div className="mt-6 rounded-xl border border-green-500/40 bg-green-500/10 p-4 text-green-900 dark:text-green-200">
                <div className="flex items-center gap-2 font-semibold">
                  <CheckCircle2Icon className="h-5 w-5" />
                  Thanks, we will notify you!
                </div>
                <p className="mt-2 text-sm">You are on the list. We will notify you when pay-as-you-go access is ready.</p>
              </div>
            ) : (
              <>
                <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                  Sign in with Google so we can attach your request to a verified account.
                </p>
                <div className="mt-5 flex flex-col gap-3">
                  <div className="flex min-h-10 items-center justify-center gap-3">
                    <GoogleLogin onSuccess={handleCredential} onError={handleGoogleError} />
                    {waitlistState === "submitting" ? <Loader2Icon className="h-4 w-4 animate-spin text-primary" /> : null}
                  </div>
                  {waitlistState === "error" ? (
                    <div className="rounded-lg border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
                      {errorMessage}
                    </div>
                  ) : null}
                </div>
              </>
            )}
          </div>
        </div>
      ) : null}
    </section>
  );
}
