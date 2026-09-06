"use client";
import { useRef, useState, type FormEventHandler } from "react";
import { requestChat, type ChatRequest } from "@/lib/chat/request";

export function useChatGeneration({
  text,
  model,
  apiToken,
  getCookie,
  fetchApiToken,
}: ChatRequest) {
  const [status, setStatus] = useState<
    "submitted" | "streaming" | "ready" | "error"
  >("ready");
  // New states for generation
  const [response, setResponse] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [elapsedTime, setElapsedTime] = useState<number>(0);
  const [showResponse, setShowResponse] = useState<boolean>(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Timer functions
  const startTimer = () => {
    setElapsedTime(0);
    timerRef.current = setInterval(() => {
      setElapsedTime((prev) => parseFloat((prev + 0.1).toFixed(1)));
    }, 100);
  };

  const stopTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = null;
    setElapsedTime(0);
  };

  const handleSubmit: FormEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;

    setStatus("submitted");
    setError(null);
    setResponse("");
    setShowResponse(true);
    startTimer();

    try {
      const generatedText = await requestChat({
        text,
        model,
        apiToken,
        getCookie,
        fetchApiToken,
      });
      setResponse(generatedText);
      setStatus("ready");
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") {
        setError("Request timed out after 180s.");
      } else {
        console.error("Error generating text:", err);
        setError(err instanceof Error ? err.message : "Unknown error");
      }
      setStatus("error");
    } finally {
      stopTimer();
    }
  };

  return { status, response, error, elapsedTime, showResponse, handleSubmit };
}
