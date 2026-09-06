"use client";
import { useCallback, useEffect, useState } from "react";
import {
  ID_TOKEN_KEY,
  BASE_API_URL,
  issueApiToken,
  getCookie,
  persistCookie,
  persistIdToken,
  clearIdToken,
} from "@/lib/chat/auth";
export function useChatAuth() {
  const [apiToken, setApiToken] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string>("");
  const [authStatus, setAuthStatus] = useState<
    "idle" | "loading" | "ready" | "error"
  >("idle");
  const [authError, setAuthError] = useState<string | null>(null);
  const persistApiToken = useCallback((token: string) => {
    setApiToken(token);
    persistCookie("LLM7_API_TOKEN", token);
  }, []);

  const fetchApiToken = useCallback(
    async (idToken: string) => {
      const existing = getCookie("LLM7_API_TOKEN");
      if (existing) {
        setApiToken(existing);
        return existing;
      }

      return issueApiToken(idToken, persistApiToken);
    },
    [persistApiToken],
  );

  const verifyIdToken = useCallback(
    async (idToken: string) => {
      setAuthStatus("loading");
      setAuthError(null);
      try {
        const v = await fetch(`${BASE_API_URL}/verify`, {
          method: "GET",
          headers: { Authorization: `Bearer ${idToken}` },
        });
        if (!v.ok) throw new Error("Verification failed");
        const data = await v.json().catch(() => ({}));
        const email = data?.email || "";
        setUserEmail(email);
        persistIdToken(idToken);
        const token = await fetchApiToken(idToken);
        if (!token) throw new Error("Unable to issue an API token");
        setAuthStatus("ready");
        return true;
      } catch (err: unknown) {
        setAuthStatus("error");
        const message =
          err instanceof Error ? err.message : "Unable to verify your account";
        setAuthError(message);
        clearIdToken();
        setApiToken(null);
        return false;
      }
    },
    [fetchApiToken],
  );

  useEffect(() => {
    if (typeof window === "undefined") return;
    let storedId = getCookie(ID_TOKEN_KEY);
    try {
      localStorage.removeItem(ID_TOKEN_KEY);
      storedId = sessionStorage.getItem(ID_TOKEN_KEY) || storedId;
    } catch {
      // ignore blocked storage and fall back to the cookie
    }
    if (storedId) {
      verifyIdToken(storedId).catch(() => {});
    }
  }, [verifyIdToken]);

  return {
    apiToken,
    userEmail,
    authStatus,
    authError,
    setAuthStatus,
    setAuthError,
    getCookie,
    fetchApiToken,
    verifyIdToken,
  };
}
