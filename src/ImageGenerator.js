import React, { useEffect, useMemo, useRef, useState } from "react";

const MODEL_OPTIONS = [
  "black-forest-labs/FLUX.1-schnell",
  "black-forest-labs/FLUX.1 Kontext",
  "lykon/dreamshaper-8-lcm",
];

function mapModelToParam(name) {
  if (name === "black-forest-labs/FLUX.1-schnell") return 1;
  if (name === "black-forest-labs/FLUX.1 Kontext") return 2;
  return 3;
}

export default function ImageGenerator() {
  // Form state
  const [modelUi, setModelUi] = useState(MODEL_OPTIONS[0]);
  const [widthPx, setWidthPx] = useState("512");
  const [heightPx, setHeightPx] = useState("512");
  const [seed, setSeed] = useState("1");
  const [prompt, setPrompt] = useState(
    "A cosy watercolor illustration of a hedgehog reading a book under a mushroom"
  );

  // Gen state
  const [imgApiUrl, setImgApiUrl] = useState(""); // canonical (no cache-buster)
  const [imgViewUrl, setImgViewUrl] = useState(""); // src for <img> (with cache-buster)
  const [isGenerating, setIsGenerating] = useState(false);
  const [isImgLoading, setIsImgLoading] = useState(false);
  const [error, setError] = useState("");
  const [showMeta, setShowMeta] = useState(false); // <-- NEW: show URL + chips only after load

  // Timer
  const [elapsed, setElapsed] = useState(0);
  const timerRef = useRef(null);

  // Inject keyframes for shimmer (once)
  useEffect(() => {
    if (!document.getElementById("shimmer-keyframes")) {
      const style = document.createElement("style");
      style.id = "shimmer-keyframes";
      style.innerHTML =
        "@keyframes shimmer{0%{background-position:-200% 0;}100%{background-position:200% 0;}}";
      document.head.appendChild(style);
    }
  }, []);

  // Hide number input steppers (once)
  useEffect(() => {
    if (!document.getElementById("no-spinner-styles")) {
      const style = document.createElement("style");
      style.id = "no-spinner-styles";
      style.innerHTML = `
        input[type="number"].no-spinner::-webkit-outer-spin-button,
        input[type="number"].no-spinner::-webkit-inner-spin-button { -webkit-appearance: none; margin: 0; }
        input[type="number"].no-spinner { -moz-appearance: textfield; }
      `;
      document.head.appendChild(style);
    }
  }, []);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const startTimer = () => {
    setElapsed(0);
    timerRef.current = setInterval(() => {
      setElapsed((prev) => parseFloat((prev + 0.1).toFixed(1)));
    }, 100);
  };

  const stopTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = null;
  };

  const handleGenerate = (e) => {
    e.preventDefault();
    setError("");
    setShowMeta(false); // <-- hide meta until success

    let w = parseInt(widthPx, 10);
    let h = parseInt(heightPx, 10);
    let s = parseInt(seed, 10);
    let promtToSent = prompt;

    if (!prompt.trim()) {
      setError("Prompt is required.");
      return;
    }
    if (!Number.isFinite(w) || !Number.isFinite(h) || w <= 0 || h <= 0) {
      setError("Width and Height must be positive integers.");
      return;
    }
    if (!Number.isFinite(s) || s < 0) {
      setError("Seed must be a non-negative integer.");
      return;
    }

    if (w > 1500) {
      w = 1500;
      setWidthPx("1500");
    }
    if (h > 1500) {
      h = 1500;
      setHeightPx("1500");
    }
    if (s > 10000000) {
      s = 10000000;
      setSeed("10000000");
    }
    if (prompt.length > 10000) {
      promtToSent = prompt.slice(0, 10000);
      setPrompt(promtToSent);
    }

    const modelParam = mapModelToParam(modelUi);
    const baseUrl = `https://api.llm7.io/prompt/${encodeURIComponent(
      promtToSent.trim()
    )}?w=${w}&h=${h}&seed=${s}&model=${modelParam}`;

    // canonical link (no cache-buster)
    setImgApiUrl(baseUrl);

    // cache-busted view URL so <img> always reloads even with same params
    const viewUrl =
      baseUrl + (baseUrl.includes("?") ? "&" : "?") + `_=${Date.now()}`;

    setIsGenerating(true);
    setIsImgLoading(true);
    setImgViewUrl(viewUrl);
    stopTimer(); // reset if user double-clicks quickly
    startTimer();
  };

  const handleImgLoad = () => {
    setIsImgLoading(false);
    setIsGenerating(false);
    setShowMeta(true); // <-- show meta on successful load
    stopTimer();
  };

  const handleImgError = () => {
    setIsImgLoading(false);
    setIsGenerating(false);
    setShowMeta(false); // <-- keep hidden on error
    stopTimer();
    setError("Failed to load image.");
  };

  const aspectRatioStyle = useMemo(() => {
    const w = Math.max(parseInt(widthPx || "1", 10) || 1, 1);
    const h = Math.max(parseInt(heightPx || "1", 10) || 1, 1);
    return { aspectRatio: `${w}/${h}` };
  }, [widthPx, heightPx]);

  // Parse query params for highlighting chips (safe if imgApiUrl is empty)
  const queryPairs = useMemo(() => {
    if (!imgApiUrl) return [];
    try {
      const u = new URL(imgApiUrl);
      const prompt = decodeURIComponent(u.pathname.split("/").slice(2).join("/"));
      const arr = Array.from(u.searchParams.entries());
      arr.unshift(["prompt", prompt]);
      return arr; // [ [key, value], ... ]
    } catch {
      return [];
    }
  }, [imgApiUrl]);

  return (
    <div className="bg-white p-4 md:p-6 rounded-lg shadow-md w-full max-w-4xl mx-4 border border-gray-200 mt-6">
      <h2 className="text-xl font-semibold mb-3">Image generation</h2>

      <form onSubmit={handleGenerate}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Model */}
          <div className="col-span-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Model
            </label>
            <select
              value={modelUi}
              onChange={(e) => setModelUi(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
            >
              {MODEL_OPTIONS.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>

          {/* Width */}
          <div className="col-span-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Width (px)
            </label>
            <input
              type="number"
              inputMode="numeric"
              className="no-spinner w-full p-2 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
              value={widthPx}
              onChange={(e) => setWidthPx(e.target.value)}
              placeholder="e.g., 512"
            />
          </div>

          {/* Height */}
          <div className="col-span-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Height (px)
            </label>
            <input
              type="number"
              inputMode="numeric"
              className="no-spinner w-full p-2 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
              value={heightPx}
              onChange={(e) => setHeightPx(e.target.value)}
              placeholder="e.g., 512"
            />
          </div>

          {/* Seed */}
          <div className="col-span-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Seed
            </label>
            <input
              type="number"
              inputMode="numeric"
              className="no-spinner w-full p-2 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
              value={seed}
              onChange={(e) => setSeed(e.target.value)}
              placeholder="e.g., 1"
            />
          </div>

          {/* Prompt (full width) */}
          <div className="col-span-1 md:col-span-2">
            <label
              htmlFor="imggen-prompt"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Prompt
            </label>
            <textarea
              id="imggen-prompt"
              rows={3}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-sm"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe the image you want to generate…"
              disabled={isGenerating}
            />
          </div>
        </div>

        <div className="mt-3 flex items-center space-x-2">
          <button
            type="submit"
            disabled={isGenerating || !prompt.trim()}
            className="px-4 py-2 bg-gray-800 text-white rounded-md hover:bg-gray-900 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
          >
            {isGenerating ? "Generating…" : "Generate"}
          </button>
          {isGenerating && (
            <span className="text-xs text-gray-500">
              {elapsed.toFixed(1)} sec
            </span>
          )}
        </div>
      </form>

      {/* Result */}
      <div className="mt-4 w-full">
        {isImgLoading && (
          <div
            className="w-full rounded-md border border-gray-200"
            style={{
              ...aspectRatioStyle,
              background:
                "linear-gradient(90deg, #f3f4f6 25%, #e5e7eb 37%, #f3f4f6 63%)",
              backgroundSize: "400% 100%",
              animation: "shimmer 1.4s ease-in-out infinite",
            }}
          />
        )}

        {imgApiUrl && (
          <a href={imgApiUrl} target="_blank" rel="noopener noreferrer">
            <img
              key={imgViewUrl} // force remount just in case
              src={imgViewUrl}
              alt="Generated"
              onLoad={handleImgLoad}
              onError={handleImgError}
              className={`max-w-full h-auto rounded-md border border-gray-200 ${
                isImgLoading ? "hidden" : ""
              }`}
            />
          </a>
        )}

        {/* URL + highlighted params (only after successful load) */}
        {showMeta && imgApiUrl && !isImgLoading && (
          <div className="mt-3">
            <div className="text-xs text-gray-600 mb-1">Image URL</div>
            <a
              href={imgApiUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="block text-sm font-mono break-all text-blue-700 underline"
            >
              {imgApiUrl}
            </a>

            <div className="mt-2 flex flex-wrap gap-2">
              {queryPairs.map(([k, v]) => (
                <span
                  key={k}
                  className="text-xs rounded-md border border-gray-200 bg-gray-50 px-2 py-1"
                >
                  <span className="font-medium">{k}</span>=
                  <span className="font-mono">{v}</span>
                </span>
              ))}
            </div>
          </div>
        )}

        {error && (
          <div className="mt-3 p-3 bg-red-100 border border-red-400 text-red-700 rounded text-sm">
            {error}
          </div>
        )}
      </div>
    </div>
  );
}
