"use client";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Loader2Icon, GlobeIcon, FlaskConicalIcon, MessageSquareMoreIcon } from "lucide-react";
import { GoogleOAuthProvider, type CredentialResponse } from "@react-oauth/google";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { CHAT_MODELS, transformApiModel } from "@/lib/chat/models";
import { useChatAuth } from "@/hooks/use-chat-auth";
import { useChatGeneration } from "@/hooks/use-chat-generation";
import { ProModal } from "./chat/ProModal";
import { ChatResponse } from "./chat/ChatResponse";
import { glassPanel, motionSafe } from "./chat/styles";
import { AIInput, AIInputTextarea, AIInputToolbar, AIInputTools, AIInputModelSelect, AIInputModelSelectTrigger, AIInputModelSelectValue, AIInputModelSelectContent, AIInputModelSelectItem, AIInputSubmit } from "./chat/InputPrimitives";
export * from "./chat/InputPrimitives";

const GA_CLIENT_ID = "264062651955-8qamru5vjtu9kc1tk2trsgte5e10hm0m.apps.googleusercontent.com";

export default function MagicalChatInput() {
  const [text, setText] = useState<string>("");
  const [model, setModel] = useState<string>("");
  const [isFocused, setIsFocused] = useState(false);
  const [isDeepResearchEnabled] = useState(false);
  const [isWebSearchEnabled] = useState(false);

  // New states for models
  const [models, setModels] = useState<Array<{id: string, name: string}>>([]);
  const [isLoadingModels, setIsLoadingModels] = useState(true);
  const [modelsError, setModelsError] = useState<string | null>(null);
  const [showProModal, setShowProModal] = useState(false);
  const [showAuthButton, setShowAuthButton] = useState(false);
  const { apiToken, userEmail, authStatus, authError, setAuthStatus, setAuthError, getCookie, fetchApiToken, verifyIdToken } = useChatAuth();
  const { status, response, error, elapsedTime, showResponse, handleSubmit } = useChatGeneration({ text, model, apiToken, getCookie, fetchApiToken });

  const recordClick = useCallback((source: number) => {
    const url = `http://api.llm7.io/record-click?source=${source}`;
    try {
      fetch(url, { method: "GET", keepalive: true, mode: "no-cors" }).catch(() => {});
    } catch {
      // ignore tracking failures
    }
  }, []);

  // Fetch models from API
  useEffect(() => {
    const fetchModels = async () => {
      try {
        setIsLoadingModels(true);
        setModelsError(null);

        const apiModels = CHAT_MODELS;

        // Transform the API models to our format
        const transformedModels = apiModels.map(transformApiModel);

        // Sort models alphabetically by name
        transformedModels.sort((a, b) => a.name.localeCompare(b.name));

        const filteredModels = transformedModels.filter(m => m.model_tier !== "top");

        setModels(filteredModels);

        // Set the default model to the first one if no model is selected
        if (!model && filteredModels.length > 0) {
          setModel(transformedModels[0].id);
        }
      } catch (error) {
        console.error('Error fetching models:', error);
        setModelsError(error instanceof Error ? error.message : 'Unknown error');
      } finally {
        setIsLoadingModels(false);
      }
    };

    fetchModels();
  }, [model]);

  const handleModelChange = useCallback((value: string) => {
    setModel(value);
    if (value.toLowerCase() === "pro") {
      if (apiToken) return;
      setShowProModal(true);
      recordClick(4);
    }
  }, [recordClick, apiToken]);

  const handleCredential = useCallback(
    async (response: CredentialResponse) => {
      const credential = response.credential;
      if (!credential) {
        setAuthStatus("error");
        setAuthError("No credential returned from Google");
        return;
      }
      const ok = await verifyIdToken(credential);
      if (ok) {
        setShowProModal(false);
        setShowAuthButton(false);
      } else {
        setAuthError("Please sign in with an LLM7 account that has an active subscription or available balance.");
      }
    },
    [verifyIdToken, setAuthError, setAuthStatus]
  );

  const handleGoogleError = useCallback(() => {
    setAuthStatus("error");
    setAuthError("Google sign-in failed. Please try again.");
  }, [setAuthError, setAuthStatus]);

  useEffect(() => {
    if (showProModal && apiToken) {
      const t = setTimeout(() => setShowProModal(false), 3000);
      return () => clearTimeout(t);
    }
  }, [showProModal, apiToken]);

  const showFooterPill = text.length > 0;
  const pillContent = useMemo(() => {
    if (isWebSearchEnabled || isDeepResearchEnabled) {
      return (
        <div className="flex items-center justify-center gap-4 sm:gap-6 text-xs sm:text-sm">
          {isWebSearchEnabled && (
            <div className="flex items-center gap-2 text-purple-600 dark:text-purple-400">
              <GlobeIcon
                size={16}
                className="animate-spin"
                style={{ animationDuration: "3s" }}
                aria-hidden
              />
              <span className="font-semibold">Web search active</span>
            </div>
          )}
          {isDeepResearchEnabled && (
            <div className="flex items-center gap-2 text-orange-600 dark:text-orange-400">
              <FlaskConicalIcon
                size={16}
                className="animate-bounce"
                aria-hidden
              />
              <span className="font-semibold">Research mode</span>
            </div>
          )}
        </div>
      );
    }
    return (
      <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
      </div>
    );
  }, [isWebSearchEnabled, isDeepResearchEnabled]);

  return (
    <GoogleOAuthProvider clientId={GA_CLIENT_ID}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="text-center">
          <motion.h3
              id="featured-heading"
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="mt-6 text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight flex items-center justify-center gap-3"
            >
              <MessageSquareMoreIcon className="h-8 w-8 sm:h-10 sm:w-10 text-primary" />
              <span className="bg-gradient-to-r from-foreground via-primary to-foreground bg-clip-text text-transparent">
                Text Generation
              </span>
          </motion.h3>
        </div>
      </div>
      <div className="relative group flex items-center justify-center py-6 sm:py-10">

        {/* Soft ambient gradient glow (mobile-friendly) */}
        <div
          aria-hidden
          className={cn(
            "absolute inset-0 pointer-events-none",
            "opacity-60 sm:opacity-80"
          )}
        >
          <div className="absolute inset-0 m-auto max-w-5xl h-[40%] sm:h-[50%] blur-2xl sm:blur-3xl rounded-[48px] bg-gradient-to-r from-primary/15 via-purple-500/15 to-primary/15" />
        </div>

        <AIInput
          onSubmit={handleSubmit}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          className={cn(
            "relative z-10 w-full",
            "max-w-[min(100%,48rem)]", // 768px max
            motionSafe,
            isFocused && "ring-1 ring-primary/30"
          )}
        >
          <AIInputTextarea
            onChange={(e) => setText(e.target.value)}
            value={text}
            className={cn(
              motionSafe,
              isFocused && "placeholder:text-muted-foreground/40",
              text.length > 0 && "font-semibold"
            )}
            placeholder="Ask me anything... ✨"
          />

          <AIInputToolbar
            className={cn(
              "items-stretch gap-2",
              "bg-gradient-to-r from-background/50 via-background/65 to-background/50",
              text.length > 0 && "backdrop-blur-xl"
            )}
          >
            <AIInputTools>
              <AIInputModelSelect onValueChange={handleModelChange} value={model} disabled={isLoadingModels}>
                <AIInputModelSelectTrigger className="min-w-[116px] sm:min-w-[140px]">
                  {isLoadingModels ? (
                    <div className="flex items-center gap-2">
                      <Loader2Icon className="h-4 w-4 animate-spin" />
                      <span>Loading...</span>
                    </div>
                  ) : (
                    <AIInputModelSelectValue />
                  )}
                </AIInputModelSelectTrigger>
                <AIInputModelSelectContent>
                  {modelsError ? (
                    <div className="p-2 text-sm text-destructive">
                      Error: {modelsError}
                    </div>
                  ) : (
                    models.map((m) => (
                      <AIInputModelSelectItem key={m.id} value={m.id}>
                        <div className="flex items-center justify-between w-full">
                          <span className="font-medium">{m.name}</span>
                          {m.id === "gpt-5-chat" && (
                            <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full ml-3 font-semibold">
                              Popular
                            </span>
                          )}
                        </div>
                      </AIInputModelSelectItem>
                    ))
                  )}
                </AIInputModelSelectContent>
              </AIInputModelSelect>
              <a
                href="#models"
                className="text-gray-600 hover:text-gray-800"
                title="See all models"
                aria-label="See all models"
              >
                {/* Your SVG icon */}
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M5 12V6C5 5.44772 5.44772 5 6 5H18C18.5523 5 19 5.44772 19 6V18C19 18.5523 18.5523 19 18 19H12M8.11111 12H12M12 12V15.8889M12 12L5 19"
                    stroke="#464455"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </a>
            </AIInputTools>

            <AIInputSubmit
              status={status}
              className={cn(
                "relative overflow-hidden z-10",
                text.length > 0 && "shadow-lg",
                status === "ready" && text.length > 0 && "animate-none"
              )}
            />
          </AIInputToolbar>
        </AIInput>

        {/* Footer hint pill */}
        {showFooterPill && (
          <div className="absolute -bottom-12 sm:-bottom-14 left-0 right-0 flex justify-center px-3">
            <div
              className={cn(
                "px-4 py-2 sm:px-6 sm:py-3 rounded-full",
                glassPanel,
                "text-[0.8rem]",
                "animate-in fade-in-0 slide-in-from-bottom-2 duration-300"
              )}
            >
              {pillContent}
            </div>
          </div>
        )}
      </div>

      {showProModal && <ProModal {...{setShowProModal, authStatus, apiToken, authError, userEmail, showAuthButton, setShowAuthButton, handleCredential, handleGoogleError}} />}

      {showResponse && <ChatResponse {...{status, elapsedTime, error, response}} />}
    </GoogleOAuthProvider>
  );
}
