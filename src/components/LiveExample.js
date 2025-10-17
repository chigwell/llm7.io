import React, { useState, useCallback, useRef, useMemo, useEffect } from "react";
import { Combobox } from "@headlessui/react";
import { ChatLLM7 } from "langchain-llm7";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";

const PLACEHOLDERS = [
  // --- Code Generation & Refactoring ---
  "Refactor this React class component to a functional component using hooks.",
  "Write a Go function to upload a file to an S3-compatible bucket.",
  "Generate a Python script using Pandas to clean a CSV and compute column stats.",
  "Create a responsive card component using Next.js and Tailwind CSS.",
  "Write a Rust API endpoint using Axum that returns a JSON payload.",
  "Generate a `pyproject.toml` for a Poetry project with Black, pytest, and FastAPI.",
  "Write a custom React hook `useDebounce` and provide a usage example.",

  // --- DevOps & Infrastructure as Code ---
  "Create a GitHub Actions workflow to test, build, and push a Docker image to GHCR.",
  "Write a Kubernetes manifest for a simple web app Deployment and Service.",
  "Generate a Pulumi script in TypeScript to provision a static website on AWS S3.",
  "Write a bash script to check server health and send a notification if it's down.",
  "Explain the difference between mutable and immutable infrastructure.",

  // --- System Design & Architecture ---
  "Explain the trade-offs: REST vs. GraphQL vs. gRPC for microservices.",
  "Design a Redis caching strategy for a high-traffic e-commerce product page.",
  "Summarize the CAP theorem and give a real-world example for CP and AP systems.",
  "Explain ELI5: what is Retrieval-Augmented Generation (RAG)?",
  "Compare Monorepo vs. Polyrepo, listing two pros and cons for each.",

  // --- Database & Data ---
  "Optimize a slow Postgres query by adding a composite index; explain why.",
  "Design a GraphQL schema for a blog with posts, authors, and comments.",
  "Write a SQL migration to enforce a foreign key constraint with `ON DELETE CASCADE`.",
  "Create a Zod schema in TypeScript to validate a complex, nested API response.",

  // --- Communication & Personas ---
  "Act as a senior developer; code-review this TypeScript function for bugs and style.",
  "Draft a short, clear incident post-mortem for a 15-minute API outage.",
  "Generate 5 creative names for a new open-source developer tool.",
];

function getRandomPlaceholder() {
  return PLACEHOLDERS[Math.floor(Math.random() * PLACEHOLDERS.length)];
}

function LiveExample() {
  // Models
  const [models, setModels] = useState([]);
  const [modelsLoading, setModelsLoading] = useState(true);
  const [modelsError, setModelsError] = useState(null);

  // Combobox states
  const [selectedModel, setSelectedModel] = useState("");
  const [query, setQuery] = useState("");

  // Chat states
  const [response, setResponse] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const timerRef = useRef(null);

  const placeholder = useMemo(() => getRandomPlaceholder(), []);
  const [prompt, setPrompt] = useState(placeholder);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setModelsLoading(true);
      setModelsError(null);
      try {
        const res = await fetch("https://api.llm7.io/v1/models");
        const data = await res.json();
        const ids = (Array.isArray(data) ? data : [])
          .map((m) => m?.id)
          .filter(Boolean)
          .sort((a, b) => a.localeCompare(b));
        if (cancelled) return;
        setModels(ids);
        const preferred = "mistral-small-3.1-24b-instruct-2503";
        const def = ids.includes(preferred) ? preferred : ids[0] || "";
        setSelectedModel(def);
        setQuery("");
      } catch {
        if (cancelled) return;
        setModelsError("Failed to load models.");
        setModels([]);
        setSelectedModel("");
      } finally {
        if (!cancelled) setModelsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const filteredModels =
    query.trim() === ""
      ? models
      : models.filter((m) =>
          m.toLowerCase().includes(query.trim().toLowerCase())
        );

  // Timer
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

  const handleSubmit = useCallback(
    async (event) => {
      event.preventDefault();
      if (!prompt || isLoading) return;

      if (!selectedModel) {
        setError("Please select a model first.");
        return;
      }

      setIsLoading(true);
      setError(null);
      setResponse("");
      startTimer();

      const messages = [
        new SystemMessage("You are a helpful AI assistant."),
        new HumanMessage(prompt),
      ];

      try {
        const chat = new ChatLLM7({
          modelName: selectedModel,
          stream: true,
          temperature: 0.7,
        });
        const stream = await chat.stream(messages);
        for await (const chunk of stream) {
          setResponse((prev) => prev + chunk.text);
        }
      } catch (err) {
        console.error("Streaming Error:", err);
        setError(
          `Error interacting with LLM: ${err.message}. Note: Direct browser calls often fail due to CORS or runtime limitations. A backend proxy is usually required.`
        );
      } finally {
        setIsLoading(false);
        stopTimer();
      }
    },
    [prompt, isLoading, selectedModel]
  );

  return (
    <div className="bg-white p-4 md:p-6 rounded-lg shadow-md w-full max-w-4xl mx-4 border border-gray-200 mt-6">
      <h2 className="text-xl font-semibold mb-3">Text generation</h2>
      {/* Model selector: 50% width on desktop */}
      <div className="mb-3 w-full md:w-1/2">
        <div className="flex items-center justify-between">
          <label
            htmlFor="model-combobox"
            className="block text-sm font-medium text-gray-700"
          >
            Select model
          </label>
          <a
            href="https://api.llm7.io/v1/models"
            target="_blank"
            rel="noopener noreferrer"
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
        </div>

        <Combobox
          value={selectedModel}
          onChange={(val) => setSelectedModel(val)}
          disabled={modelsLoading || !!modelsError}
        >
          <div className="relative mt-1">
            <Combobox.Input
              id="model-combobox"
              className="w-full rounded-md border border-gray-300 bg-white p-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder={modelsLoading ? "Loading models..." : "Type to search..."}
              displayValue={(val) => val || ""}
              onChange={(event) => setQuery(event.target.value)}
            />
            <Combobox.Options className="absolute z-10 mt-1 max-h-64 w-full overflow-auto rounded-md border border-gray-200 bg-white py-1 text-sm shadow-lg focus:outline-none">
              {filteredModels.length === 0 && query !== "" ? (
                <div className="px-3 py-2 text-gray-500">No matches</div>
              ) : (
                filteredModels.map((model) => (
                  <Combobox.Option
                    key={model}
                    value={model}
                    className={({ active }) =>
                      `cursor-pointer px-3 py-2 ${active ? "bg-gray-100" : "bg-white"}`
                    }
                  >
                    {model}
                  </Combobox.Option>
                ))
              )}
            </Combobox.Options>
          </div>
        </Combobox>

        {modelsError && (
          <p className="mt-1 text-xs text-red-600">{modelsError}</p>
        )}
      </div>

      <form onSubmit={handleSubmit}>
        <label
          htmlFor="prompt"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
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
            style={{
              backgroundColor: isLoading
                ? "#ccc"
                : "rgb(31 41 55 / var(--tw-bg-opacity))",
            }}
            disabled={isLoading || !prompt || !selectedModel}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
          >
            {isLoading ? "Generating..." : "Send Prompt"}
          </button>
          {isLoading && (
            <span className="text-xs text-gray-500">
              {elapsedTime.toFixed(1)} sec
            </span>
          )}
        </div>
      </form>

      {error && (
        <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded text-sm">
          <p>
            <strong>Error:</strong>
          </p>
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
