import React, { useState, useCallback, useRef, useMemo } from 'react';
import { ChatLLM7 } from "langchain-llm7";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";

const chat = new ChatLLM7({
  stream: true,
});

const PLACEHOLDERS: string[] = [
  "Explain OAuth2 vs OIDC in one paragraph.",
  "Write a SQL query: top 5 users by orders this month.",
  "Generate unit tests for a pure function (TS, vitest).",
  "Draft an email asking for payment confirmation (polite, concise).",
  "Create a regex to validate UK postcode; explain edge cases.",
  "Design a Postgres schema for a task app with labels.",
  "Write a FastAPI endpoint with JWT auth (HS256).",
  "Explain CAPTCHAs trade-offs: Turnstile vs hCaptcha vs ALTCHA.",
  "Generate a Dockerfile for a Python 3.11 app with Poetry.",
  "Write a GitLab CI job to run black + pytest + mypy.",
  "Explain the difference between retries and circuit breakers.",
  "Give me 3 perf tips for React + Zustand store.",
  "Write a TypeScript Zod schema for a login form.",
  "Produce a migration to add a nullable column with default in Postgres.",
  "Explain vector DB vs Postgres pgvector in 5 sentences.",
  "Write a bash one-liner to tail logs and highlight ERROR.",
  "Draft acceptance criteria for a CAPTCHA evaluation epic.",
  "Create a minimal Terraform GCS bucket example (with versioning).",
  "Convert UTC 2025-08-05 10:06 to BST and explain the steps.",
  "Suggest 5 load-testing scenarios for a login flow.",
  "Generate a short story about a brave squirrel.",
];

function getRandomPlaceholder(): string {
  return PLACEHOLDERS[Math.floor(Math.random() * PLACEHOLDERS.length)];
}

function LiveExample() {
  const [response, setResponse] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const timerRef = useRef(null);

  const placeholder = useMemo(() => getRandomPlaceholder(), []);
  const [prompt, setPrompt] = useState(placeholder);

  // Start timer
  const startTimer = () => {
    setElapsedTime(0);
    timerRef.current = setInterval(() => {
      setElapsedTime(prev => parseFloat((prev + 0.1).toFixed(1)));
    }, 100);
  };

  // Stop and reset timer
  const stopTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = null;
    setElapsedTime(0);
  };

  const handleSubmit = useCallback(async (event) => {
    event.preventDefault();
    if (!prompt || isLoading) return;

    setIsLoading(true);
    setError(null);
    setResponse("");
    startTimer();

    const messages = [
      new SystemMessage("You are a helpful AI assistant."),
      new HumanMessage(prompt),
    ];

    try {
      const stream = await chat.stream(messages);
      for await (const chunk of stream) {
        setResponse(prevResponse => prevResponse + chunk.text);
      }
    } catch (err) {
      console.error("Streaming Error:", err);
      setError(`Error interacting with LLM: ${err.message}. Note: Direct browser calls often fail due to CORS or runtime limitations. A backend proxy is usually required.`);
    } finally {
      setIsLoading(false);
      stopTimer();
    }
  }, [prompt, isLoading]);

  return (
    <div className="bg-white p-4 md:p-6 rounded-lg shadow-md w-full max-w-4xl mx-4 border border-gray-200">
      <form onSubmit={handleSubmit}>
        <label htmlFor="prompt" className="block text-sm font-medium text-gray-700 mb-1">
          Enter your prompt:
        </label>
        <textarea
          id="prompt"
          rows={3}
          className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-sm"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="e.g., What is LangChain?"
          disabled={isLoading}
        />
        <div className="mt-2 flex items-center space-x-2">
          <button
            type="submit"
            style={{ backgroundColor: isLoading ? '#ccc' : 'rgb(31 41 55 / var(--tw-bg-opacity))' }}
            disabled={isLoading || !prompt}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
          >
            {isLoading ? 'Generating...' : 'Send Prompt'}
          </button>
          {isLoading && (
            <span className="text-xs text-gray-500">{elapsedTime.toFixed(1)} sec</span>
          )}
        </div>
      </form>

      {error && (
        <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded text-sm">
          <p><strong>Error:</strong></p>
          <p>{error}</p>
        </div>
      )}

      {response && !error && (
        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Response:
          </label>
          <pre className="bg-gray-100 p-3 rounded-md whitespace-pre-wrap break-words text-sm border border-gray-200">
            {response}
          </pre>
        </div>
      )}
    </div>
  );
}

export default LiveExample;
