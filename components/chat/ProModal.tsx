"use client";
import { GoogleLogin, type CredentialResponse } from "@react-oauth/google";
import { Loader2Icon, XIcon } from "lucide-react";
import { Button } from "@/components/ui/buttonShadcn";

type Props = {
  setShowProModal: (show: boolean) => void;
  authStatus: "idle" | "loading" | "ready" | "error";
  apiToken: string | null;
  authError: string | null;
  userEmail: string;
  showAuthButton: boolean;
  setShowAuthButton: (show: boolean) => void;
  handleCredential: (response: CredentialResponse) => void;
  handleGoogleError: () => void;
};
export function ProModal({setShowProModal, authStatus, apiToken, authError, userEmail, showAuthButton, setShowAuthButton, handleCredential, handleGoogleError}: Props) {
  return (
        <div className="fixed inset-0 z-40 flex items-center justify-center px-4" onClick={() => setShowProModal(false)}>
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
          <div
            className="relative w-full max-w-md rounded-2xl border border-border/60 bg-gradient-to-br from-background/95 via-background to-background/90 shadow-2xl p-6 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm uppercase tracking-[0.12em] text-muted-foreground">Account required</p>
                <h4 className="text-2xl font-semibold leading-tight mt-1">Use Pro models with your LLM7 account</h4>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setShowProModal(false)} aria-label="Close">
                <XIcon className="h-5 w-5" />
              </Button>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Do you already have an LLM7 account with an active subscription or available balance? Please sign in to continue, or top up your balance in the dashboard.
            </p>
            {authStatus === "ready" && !apiToken && (
              <div className="rounded-xl border border-amber-500/50 bg-amber-500/10 text-amber-900 dark:text-amber-100 text-sm p-3 space-y-1">
                <div className="font-semibold">Balance required</div>
                <p>You are signed in, but we could not find an API token for this account. Please top up your balance or check your dashboard.</p>
                <a className="text-primary underline text-xs" href="https://dash.llm7.io/" target="_blank" rel="noreferrer">
                  Open dashboard
                </a>
              </div>
            )}
            {authStatus === "error" && authError && (
              <div className="rounded-xl border border-destructive/40 bg-destructive/10 text-destructive text-sm p-3">
                {authError}
              </div>
            )}
            {apiToken ? (
              <div className="rounded-xl border border-green-500/40 bg-green-500/10 text-green-900 dark:text-green-200 text-sm p-3">
                Account confirmed{userEmail ? ` for ${userEmail}` : ""}. You can close this dialog and continue with Pro models.
              </div>
            ) : null}
            <div className="flex flex-col sm:flex-row gap-2 justify-end">
              {!apiToken && !showAuthButton && (
                <Button variant="outline" onClick={() => setShowAuthButton(true)}>
                  I already have an account
                </Button>
              )}
              {showAuthButton && !apiToken && (
                <div className="flex items-center gap-2">
                  <GoogleLogin onSuccess={handleCredential} onError={handleGoogleError} />
                  {authStatus === "loading" && <Loader2Icon className="h-4 w-4 animate-spin text-primary" />}
                </div>
              )}
              {!apiToken && (
                <Button asChild>
                  <a href="https://dash.llm7.io/" target="_blank" rel="noopener noreferrer">
                    Top up balance
                  </a>
                </Button>
              )}
            </div>
          </div>
        </div>
  );
}
