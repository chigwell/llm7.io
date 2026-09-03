"use client";

import React, {
  memo,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useTheme as useNextTheme } from "next-themes";
import { usePingMetrics } from "@/hooks/use-ping-metrics";
import {
  DEMO_PAYLOAD,
  clamp,
  compactNumber,
  extractSnapshot,
  formatPercent,
  formatSeconds,
  fullNumber,
  lerp,
  stableId,
  statusForModel,
  visibleModelsForViewport,
} from "./modelData.js";
import {
  flowStyle,
  hexToRgb,
  pathBetween,
  pathToArray,
} from "./flowGeometry.js";

const h = React.createElement;

const FLOW_WINDOW_SECONDS = 60;
const REFERENCE_WIDTH = 1920;
const REFERENCE_HEIGHT = 1080;
const MODEL_WIDTH = 240;
const MODEL_HEIGHT = 160;
const ROUTER_SIZE = 280;
// Match the reference's visual population on capable desktops. Above these limits
// token volume is sampled proportionally, so relative traffic remains truthful
// without allowing an unusually busy minute to allocate millions of GPU points.
const PARTICLE_RENDER_BUDGET = 130_000;
const TABLET_PARTICLE_RENDER_BUDGET = 55_000;
const MOBILE_PARTICLE_RENDER_BUDGET = 18_000;
const LOW_POWER_PARTICLE_FLOOR = 10_000;
const TARGET_FRAME_MS = 1000 / 45;
const MIN_STAGE_WIDTH = 300;
const MIN_STAGE_HEIGHT = 520;
const COMPACT_STAGE_BREAKPOINT = 640;
const MOBILE_VIEWPORT_BREAKPOINT = 768;
const MOBILE_MODEL_TOP_GAP = 68;
const MODEL_STREAM_HOLD_MS = 300;

const DEFAULT_STAGE_SIZE = {
  width: 920,
  height: 760,
  viewportHeight: 760,
};

const MODEL_FLOW_PALETTES = [
  { accent: "#517fb5", light: ["#517fb5", "#2b9a80"], dark: ["#80b7ef", "#63d7b5"] },
  { accent: "#7763bd", light: ["#7763bd", "#d17a35"], dark: ["#b8a5ff", "#f7ad67"] },
  { accent: "#a653a5", light: ["#a653a5", "#278f9d"], dark: ["#e39ae0", "#63d1dc"] },
  { accent: "#c24973", light: ["#5c7fd1", "#c24973"], dark: ["#8eadff", "#ff8fb4"] },
  { accent: "#b36a36", light: ["#b36a36", "#738f32"], dark: ["#f1a46b", "#b2d76a"] },
  { accent: "#16869a", light: ["#16869a", "#9b62b4"], dark: ["#55d1e2", "#d397eb"] },
  { accent: "#667896", light: ["#667896", "#d05d55"], dark: ["#aabbd4", "#ff9288"] },
  { accent: "#486aa8", light: ["#486aa8", "#b18b22"], dark: ["#8eadf0", "#e1c45f"] },
  { accent: "#218779", light: ["#218779", "#c44f63"], dark: ["#62ceb9", "#fb8799"] },
  { accent: "#6854a3", light: ["#6854a3", "#a16f42"], dark: ["#aa96e2", "#daa475"] },
  { accent: "#43834d", light: ["#43834d", "#b65391"], dark: ["#7bc786", "#ea91c8"] },
  { accent: "#34538f", light: ["#34538f", "#cf693d"], dark: ["#7698db", "#fa9e72"] },
  { accent: "#81558f", light: ["#81558f", "#7f812e"], dark: ["#c394d0", "#bfc163"] },
];

function modelPaletteMap(models, theme) {
  const paletteMap = new Map();
  const usedPaletteIndexes = new Set();
  const modelIds = [...new Set(models.map((model) => stableId(model.name || model.displayName)))].sort();

  for (const modelId of modelIds) {
    let hash = 2166136261;
    for (let index = 0; index < modelId.length; index += 1) {
      hash ^= modelId.charCodeAt(index);
      hash = Math.imul(hash, 16777619);
    }
    let paletteIndex = (hash >>> 0) % MODEL_FLOW_PALETTES.length;
    while (usedPaletteIndexes.has(paletteIndex) && usedPaletteIndexes.size < MODEL_FLOW_PALETTES.length) {
      paletteIndex = (paletteIndex + 1) % MODEL_FLOW_PALETTES.length;
    }
    usedPaletteIndexes.add(paletteIndex);
    const palette = MODEL_FLOW_PALETTES[paletteIndex];
    const [prompt, completion] = theme === "dark" ? palette.dark : palette.light;
    paletteMap.set(modelId, { accent: theme === "dark" ? prompt : palette.accent, prompt, completion });
  }

  return paletteMap;
}

function gaussianLane() {
  let u = 0;
  let v = 0;
  while (u === 0) u = Math.random();
  while (v === 0) v = Math.random();
  const gaussian = Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
  return 0.5 + gaussian * 0.18;
}

function particleBudgetForDevice() {
  const viewportWidth = window.innerWidth || document.documentElement.clientWidth || 1024;
  const baseBudget = viewportWidth < MOBILE_VIEWPORT_BREAKPOINT
    ? MOBILE_PARTICLE_RENDER_BUDGET
    : viewportWidth < 1200
      ? TABLET_PARTICLE_RENDER_BUDGET
      : PARTICLE_RENDER_BUDGET;
  const hardwareConcurrency = navigator.hardwareConcurrency || 8;
  const deviceMemory = navigator.deviceMemory || 8;
  const deviceScale = hardwareConcurrency <= 4 || deviceMemory <= 4 ? 0.65 : 1;
  return Math.max(LOW_POWER_PARTICLE_FLOOR, Math.round(baseBudget * deviceScale));
}

function modelSlot(index, compact) {
  if (compact) return { column: 0, row: index };
  // Match the reference: the four busiest models occupy the left column with
  // its two busiest cards nearest the hub, while the second column is staggered.
  const leftRows = [1, 2, 0, 3];
  if (index < 4) return { column: 0, row: leftRows[index] };
  return { column: 1, row: index - 4 };
}

function useStageSize() {
  const [node, setNode] = useState(null);
  const ref = useCallback((nextNode) => setNode(nextNode), []);
  const lastSizeRef = useRef(DEFAULT_STAGE_SIZE);
  const frameRef = useRef(null);
  const [size, setSize] = useState(lastSizeRef.current);

  useLayoutEffect(() => {
    if (!node) return undefined;

    const readSize = () => {
      const rect = node.getBoundingClientRect();
      const rawWidth = node.clientWidth > 1 ? node.clientWidth : rect.width > 1 ? rect.width : window.innerWidth || lastSizeRef.current.width;
      const rawHeight = rect.height > 1 ? rect.height : lastSizeRef.current.height;
      const width = Math.max(MIN_STAGE_WIDTH, Math.round(rawWidth || lastSizeRef.current.width));
      const height = Math.max(MIN_STAGE_HEIGHT, Math.round(rawHeight || lastSizeRef.current.height));
      const viewportHeight = height;
      return { width, height, viewportHeight };
    };

    const commit = () => {
      frameRef.current = null;
      const next = readSize();
      const previous = lastSizeRef.current;
      if (
        Math.abs(next.width - previous.width) < 1
        && Math.abs(next.height - previous.height) < 1
        && Math.abs(next.viewportHeight - previous.viewportHeight) < 1
      ) {
        return;
      }
      lastSizeRef.current = next;
      setSize(next);
    };

    const schedule = () => {
      if (frameRef.current !== null) return;
      frameRef.current = window.requestAnimationFrame(commit);
    };

    schedule();
    window.addEventListener("resize", schedule, { passive: true });
    window.addEventListener("orientationchange", schedule, { passive: true });
    window.visualViewport?.addEventListener("resize", schedule, { passive: true });

    const observer = typeof ResizeObserver === "undefined" ? null : new ResizeObserver(schedule);
    observer?.observe(node);

    return () => {
      if (frameRef.current !== null) window.cancelAnimationFrame(frameRef.current);
      observer?.disconnect();
      window.removeEventListener("resize", schedule);
      window.removeEventListener("orientationchange", schedule);
      window.visualViewport?.removeEventListener("resize", schedule);
    };
  }, [node]);

  return [ref, size, node];
}

function usePageDragScroll(onPress) {
  const startRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);

  const onPointerDown = useCallback(
    (event) => {
      onPress?.();
      const target = event.target instanceof Element ? event.target : null;
      if (target?.closest(".flow-node")) return;
      if (event.pointerType !== "mouse") return;
      if (event.pointerType === "mouse" && event.button !== 0) return;
      const scrollContainer = event.currentTarget.closest("[data-live-flow-scroll]");
      const horizontalScroller = scrollContainer instanceof HTMLElement ? scrollContainer : null;

      startRef.current = {
        pointerId: event.pointerId,
        x: event.clientX,
        y: event.clientY,
        scrollX: window.scrollX,
        scrollY: window.scrollY,
        scrollLeft: horizontalScroller?.scrollLeft ?? 0,
        horizontalScroller,
        active: false,
      };
      event.currentTarget.setPointerCapture?.(event.pointerId);
    },
    [onPress],
  );

  const onPointerMove = useCallback((event) => {
    const start = startRef.current;
    if (!start || start.pointerId !== event.pointerId) return;

    const dx = event.clientX - start.x;
    const dy = event.clientY - start.y;
    if (!start.active && Math.hypot(dx, dy) < 5) return;

    start.active = true;
    setIsDragging(true);
    event.preventDefault();
    if (start.horizontalScroller) {
      start.horizontalScroller.scrollLeft = start.scrollLeft - dx;
      window.scrollTo(start.scrollX, start.scrollY - dy);
      return;
    }
    window.scrollTo(start.scrollX - dx, start.scrollY - dy);
  }, []);

  const stopDragging = useCallback((event) => {
    const start = startRef.current;
    if (!start || start.pointerId !== event.pointerId) return;
    startRef.current = null;
    setIsDragging(false);
    event.currentTarget.releasePointerCapture?.(event.pointerId);
  }, []);

  return {
    isDragging,
    dragScrollHandlers: {
      onPointerDown,
      onPointerMove,
      onPointerUp: stopDragging,
      onPointerCancel: stopDragging,
    },
  };
}

function getLogoPath(path) {
  return `/${path.replace(/^\/+/u, "")}`;
}

function logoForModel(name, theme) {
  const lower = String(name || "").toLowerCase();
  const themed = (lightPath, darkPath) => getLogoPath(theme === "dark" ? darkPath : lightPath);

  if (lower.includes("other active")) return null;
  if (lower.includes("claude") || lower.includes("anthropic")) {
    return themed("logos/Anthropic-light.svg", "logos/Anthropic-dark.svg");
  }
  if (lower.includes("openai") || lower.startsWith("gpt")) {
    return themed("logos/OpenAI-light.svg", "logos/OpenAI-dark.svg");
  }
  if (lower.includes("gemini") || lower.includes("gemma") || lower.includes("google")) {
    return getLogoPath("gemini.svg");
  }
  if (lower.includes("deepseek")) return getLogoPath("deepseek-color.svg");
  if (lower.includes("mistral") || lower.includes("codestral")) return getLogoPath("mistral-ai-logo.svg");
  if (lower.includes("minimax")) return getLogoPath("minimax.png");
  if (lower.includes("qwen")) return getLogoPath("qwen.svg");
  if (lower.includes("glm") || lower.includes("z.ai") || lower.includes("z-ai")) return getLogoPath("z-ai-logo.svg");
  if (lower.includes("grok")) return themed("grok-ai-icon-light.svg", "grok-icon-dark.svg");
  if (lower.includes("kimi") || lower.includes("moonshot")) return themed("k-only-light.svg", "k-only-dark.svg");
  if (lower.includes("kling")) return getLogoPath("kling.png");
  if (lower.includes("seed") || lower.includes("bytedance")) return getLogoPath("bytedance-icon.png");
  if (lower.includes("firefly")) return getLogoPath("firefly-preview.png");
  if (lower.includes("flux")) return getLogoPath("flux-lettermark-full-color.svg");
  if (lower.includes("xiaomi") || lower.includes("mimo")) return getLogoPath("logos/xiaomi.png");
  if (lower.includes("inkling")) return getLogoPath("logos/inkling.jpg");
  if (lower.includes("llama") || lower.includes("meta")) return themed("logos/ollama.svg", "logos/ollama-dark.svg");
  return null;
}

function initialsForModel(name) {
  const cleaned = String(name || "AI")
    .replace(/[^a-zA-Z0-9\s-]+/g, " ")
    .trim();
  const parts = cleaned.split(/[\s-]+/u).filter(Boolean);
  if (String(name).toLowerCase().includes("other active")) return "Σ";
  if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  return cleaned.slice(0, 2).toUpperCase() || "AI";
}

function createGraph(snapshot, size, theme, status) {
  const width = Math.max(1, size.width || DEFAULT_STAGE_SIZE.width);
  const measuredHeight = Math.max(1, size.height || DEFAULT_STAGE_SIZE.height);
  const compact = width < COMPACT_STAGE_BREAKPOINT;
  const viewportHeight = Math.max(
    MIN_STAGE_HEIGHT,
    size.viewportHeight || measuredHeight,
  );
  const models = visibleModelsForViewport(snapshot, measuredHeight, compact)
    .filter((model) => model.tokens > 0)
    .sort((a, b) => b.tokens - a.tokens);
  const referenceScale = compact ? 1 : clamp(width / REFERENCE_WIDTH, 2 / 3, 1);
  const modelWidth = compact ? Math.min(240, Math.max(224, width - 28)) : MODEL_WIDTH * referenceScale;
  const modelHeight = compact ? 112 : MODEL_HEIGHT * referenceScale;
  const routerSize = compact ? Math.min(280, width - 28) : ROUTER_SIZE * referenceScale;
  const modelPitch = compact ? 132 : 250 * referenceScale;
  const compactModelTop = 174 + routerSize + MOBILE_MODEL_TOP_GAP;
  const modelPositions = models.map((_, index) => {
    const { column, row } = modelSlot(index, compact);
    if (compact) {
      return {
        x: clamp(width / 2 - modelWidth / 2, 12, Math.max(12, width - modelWidth - 12)),
        y: compactModelTop + row * modelPitch,
      };
    }

    const rightPadding = 30 * referenceScale;
    const columnGap = 120 * referenceScale;
    const cardsStartX = width - rightPadding - modelWidth * 2 - columnGap;
    const columnTop = column === 0 ? 30 * referenceScale : 155 * referenceScale;
    return {
      x: cardsStartX + column * (modelWidth + columnGap),
      y: columnTop + row * modelPitch,
    };
  });
  const modelBottom = modelPositions.length
    ? Math.max(...modelPositions.map((position) => position.y + modelHeight)) + 24
    : 0;
  const referenceStageHeight = compact ? modelBottom : width * (REFERENCE_HEIGHT / REFERENCE_WIDTH);
  const height = Math.max(compact ? measuredHeight : 640, referenceStageHeight, modelBottom);
  const centerX = width / 2;
  const routerX = compact
    ? clamp(centerX - routerSize / 2, 12, Math.max(12, width - routerSize - 12))
    : 90 * referenceScale;
  const routerY = compact ? 174 : 400 * referenceScale;
  const maxTokens = Math.max(1, snapshot.totals.inputTokens, snapshot.totals.outputTokens, ...models.map((model) => model.tokens));
  const modelPalettes = modelPaletteMap(models, theme);

  const nodes = [
    {
      id: "router",
      type: "router",
      position: { x: routerX, y: routerY },
      data: { snapshot, theme, status },
      draggable: false,
      selectable: false,
    },
    ...models.map((model, index) => {
      const modelId = stableId(model.name || model.displayName || index);
      const palette = modelPalettes.get(modelId);
      return {
        id: `model-${modelId}`,
        type: "model",
        position: modelPositions[index],
        data: { model, theme, tint: palette.accent, flowColors: palette },
        draggable: false,
        selectable: false,
      };
    }),
  ];

  const streams = models.flatMap((model, index) => {
    const { x: cardX, y: cardY } = modelPositions[index];
    const modelId = stableId(model.name || model.displayName || index);
    const palette = modelPalettes.get(modelId);
    const promptRouterPort = compact
      ? { x: routerX + routerSize * 0.66, y: routerY + routerSize }
      : { x: routerX + routerSize, y: routerY + routerSize * 0.74 };
    const promptCardPort = compact
      ? { x: cardX + modelWidth * 0.66, y: cardY }
      : { x: cardX, y: cardY + modelHeight * 0.72 };
    const completionRouterPort = compact
      ? { x: routerX + routerSize * 0.34, y: routerY + routerSize }
      : { x: routerX + routerSize, y: routerY + routerSize * 0.36 };
    const completionCardPort = compact
      ? { x: cardX + modelWidth * 0.34, y: cardY }
      : { x: cardX, y: cardY + modelHeight * 0.3 };
    const promptCurve = compact ? 0.16 : 0.28 + Math.min(0.16, Math.abs(promptCardPort.y - promptRouterPort.y) / 1200);
    const completionCurve = compact ? 0.16 : 0.28 + Math.min(0.16, Math.abs(completionCardPort.y - completionRouterPort.y) / 1200);
    return [
      { id: `prompt-${modelId}`, modelId, tokens: model.inputTokens, attempts: model.attempts, errorRate: model.errorRate, path: pathBetween(promptRouterPort, promptCardPort, promptCurve), color: palette.prompt, maxTokens },
      { id: `completion-${modelId}`, modelId, tokens: model.outputTokens, attempts: model.attempts, errorRate: model.errorRate, path: pathBetween(completionCardPort, completionRouterPort, completionCurve), color: palette.completion, maxTokens },
    ];
  });

  const requestedParticles = streams.reduce((sum, stream) => sum + Math.max(0, Math.round(stream.tokens)), 0);
  const renderedParticles = requestedParticles <= PARTICLE_RENDER_BUDGET
    ? requestedParticles
    : PARTICLE_RENDER_BUDGET;

  return {
    nodes,
    streams,
    requestedParticles,
    renderedParticles,
    exactParticles: requestedParticles <= PARTICLE_RENDER_BUDGET,
    stageHeight: height,
    compact,
    modelWidth,
    modelHeight,
    routerSize,
  };
}

function TooltipStat({ label, value }) {
  return h(
    "div",
    { className: "tooltip-stat" },
    h("div", { className: "tooltip-label" }, label),
    h("div", { className: "tooltip-value" }, value),
  );
}

function GlobalTooltip({ tooltip, size }) {
  if (!tooltip) return null;
  const width = 320;
  const approxHeight = 92 + Math.ceil((tooltip.stats?.length || 0) / 2) * 66;
  const left = clamp(tooltip.x + 18, 12, Math.max(12, size.width - width - 12));
  const top = clamp(tooltip.y + 18, 12, Math.max(12, size.height - approxHeight - 12));

  return h(
    "div",
    {
      className: `global-tooltip ${tooltip.sticky ? "sticky" : ""}`,
      style: { left, top },
    },
    h(
      "div",
      { className: "tooltip-title" },
      h("span", null, tooltip.title),
      h("span", { className: "tooltip-window" }, `${FLOW_WINDOW_SECONDS}s`),
    ),
    h(
      "div",
      { className: "tooltip-grid" },
      tooltip.stats.map((stat) => h(TooltipStat, { key: stat.label, label: stat.label, value: stat.value })),
    ),
  );
}

function tooltipEventProps(data, tooltip) {
  const api = data.tooltip;
  const show = (event) => api?.show(event, tooltip);
  const move = (event) => api?.move(event, tooltip);
  const hideWhenLeavingNode = (event) => {
    const currentTarget = event?.currentTarget;
    const relatedTarget = event?.relatedTarget;
    if (
      typeof Node !== "undefined" &&
      currentTarget instanceof Node &&
      relatedTarget instanceof Node &&
      currentTarget.contains(relatedTarget)
    ) {
      return;
    }
    api?.hide();
  };
  return {
    tabIndex: 0,
    onPointerDown: (event) => event.stopPropagation(),
    onPointerEnter: show,
    onPointerOver: show,
    onPointerMove: move,
    onPointerLeave: hideWhenLeavingNode,
    onPointerOut: hideWhenLeavingNode,
    onMouseEnter: show,
    onMouseOver: show,
    onMouseMove: move,
    onMouseLeave: hideWhenLeavingNode,
    onMouseOut: hideWhenLeavingNode,
    onFocus: show,
    onBlur: () => api?.hide(),
    onClick: (event) => {
      event.stopPropagation();
      api?.toggle(event, tooltip);
    },
    onKeyDown: (event) => {
      if (event.key !== "Enter" && event.key !== " ") return;
      event.preventDefault();
      event.stopPropagation();
      api?.toggle(event, tooltip);
    },
  };
}

const RouterNode = memo(function RouterNode({ data }) {
  const snapshot = data.snapshot;
  const status = data.status;
  const statusClass = status.state === "loading" ? "loading" : status.state === "error" || status.state === "stale" ? "error" : "";
  const tooltip = {
    key: "router",
    title: "api.llm7.io router",
    stats: [
      { label: "prompt tokens", value: fullNumber(snapshot.totals.inputTokens) },
      { label: "completion tokens", value: fullNumber(snapshot.totals.outputTokens) },
      { label: "success", value: `${compactNumber(snapshot.totals.success)} · ${formatPercent(snapshot.totals.successRate)}` },
      { label: "errors", value: `${compactNumber(snapshot.totals.errors)} · ${formatPercent(snapshot.totals.errorRate)}` },
      { label: "timeouts", value: fullNumber(snapshot.totals.timeouts) },
      { label: "avg time", value: formatSeconds(snapshot.totals.avgSecondsWeighted) },
    ],
  };

  return h(
    "div",
    { className: "flow-node", ...tooltipEventProps(data, tooltip) },
    h(
      "div",
      { className: "router-node flow-hub" },
      h("span", { className: `router-pulse ${statusClass}` }),
      h("div", { className: "router-core" }, "LLM7"),
      h("div", { className: "hub-direction completion" }, "COMPLETION ← MODELS"),
      h("div", { className: "hub-rate" }, `${compactNumber(snapshot.totals.outputTokens / FLOW_WINDOW_SECONDS)}/s`),
      h("div", { className: "hub-direction prompt" }, "PROMPT → MODELS"),
      h("div", { className: "hub-rate" }, `${compactNumber(snapshot.totals.inputTokens / FLOW_WINDOW_SECONDS)}/s`),
      h("div", { className: "hub-peak" }, `${compactNumber(snapshot.activeRequests)} active requests`),
    ),
  );
});

const ModelNode = memo(function ModelNode({ data }) {
  const model = data.model;
  const [logoFailed, setLogoFailed] = useState(false);
  const logo = logoForModel(model.name, data.theme);
  const status = statusForModel(model);
  const imageLogo = logo && /\.(png|jpe?g|webp)$/iu.test(logo);
  const tooltip = {
    key: `model-${stableId(model.name || model.displayName)}`,
    modelId: stableId(model.name),
    title: model.isAggregate ? `${model.childrenCount} models` : model.displayName,
    stats: [
      { label: "tokens", value: fullNumber(model.tokens) },
      { label: "input/output", value: `${compactNumber(model.inputTokens)} / ${compactNumber(model.outputTokens)}` },
      { label: "requests", value: fullNumber(model.attempts) },
      { label: "success", value: `${compactNumber(model.success)} · ${formatPercent(model.successRate)}` },
      { label: "errors", value: `${compactNumber(model.errorsTotal)} · ${formatPercent(model.errorRate)}` },
      { label: "timeouts/429", value: `${fullNumber(model.timeouts)} / ${fullNumber(model.status429)}` },
      { label: "avg time", value: formatSeconds(model.avgSeconds) },
      { label: "health", value: status.toUpperCase() },
    ],
  };

  return h(
    "div",
    { className: "flow-node", ...tooltipEventProps(data, tooltip) },
    h(
      "div",
      {
        className: "model-node flow-model-card",
        style: {
          "--model-tint": data.tint,
          "--prompt-flow-color": data.flowColors.prompt,
          "--completion-flow-color": data.flowColors.completion,
        },
      },
      h(
        "div",
        { className: `model-logo-box ${imageLogo ? "image-logo" : ""}` },
        logo && !logoFailed
          ? h("img", { alt: "", src: logo, loading: "lazy", onError: () => setLogoFailed(true) })
          : h("div", { className: "model-initials" }, initialsForModel(model.name)),
      ),
      h("div", { className: "model-latency" }, formatSeconds(model.avgSeconds)),
      h("div", { className: "model-main" }, h("div", { className: "model-name" }, model.displayName)),
      h(
        "div",
        { className: "model-footer" },
        h("div", null, h("div", { className: "token-pill" }, compactNumber(model.tokens)), h("div", { className: "model-token-label" }, "TOK / MIN")),
        h("div", { className: "model-meta" }, h("span", { className: `health-dot ${status === "ok" ? "" : status}` }), h("span", null, `${compactNumber(model.attempts)} req`), h("span", null, formatPercent(model.successRate))),
      ),
    ),
  );
});

const nodeTypes = {
  router: RouterNode,
  model: ModelNode,
};

function FlowNodeLayer({ nodes }) {
  return h(
    "div",
    { className: "flow-react", "aria-label": "Live model traffic" },
    nodes.map((node) => {
      const NodeComponent = nodeTypes[node.type];
      if (!NodeComponent) return null;
      return h(
        "div",
        {
          key: node.id,
          className: "flow-node-shell",
          style: {
            transform: `translate3d(${node.position.x}px, ${node.position.y}px, 0)`,
          },
        },
        h(NodeComponent, { data: node.data }),
      );
    }),
  );
}

class ParticleEngine {
  constructor(canvas) {
    this.canvas = canvas;
    this.gl = canvas.getContext("webgl", {
      alpha: true,
      antialias: false,
      depth: false,
      stencil: false,
      premultipliedAlpha: false,
      preserveDrawingBuffer: false,
    });
    this.streams = new Map();
    this.width = 1;
    this.height = 1;
    this.dpr = 1;
    this.running = false;
    this.lastFrame = 0;
    this.lastRender = 0;
    this.performanceScale = 1;
    this.smoothedRenderMs = 0;
    this.program = null;
    this.locations = null;
    this.raf = null;
    this.contextLost = false;
    this.handleContextLost = (event) => {
      event.preventDefault();
      this.contextLost = true;
      this.program = null;
      this.locations = null;
    };
    this.handleContextRestored = () => {
      this.gl = this.canvas.getContext("webgl", {
        alpha: true,
        antialias: false,
        depth: false,
        stencil: false,
        premultipliedAlpha: false,
        preserveDrawingBuffer: false,
      });
      this.contextLost = false;
      if (!this.gl) return;
      this.initGl();
      for (const stream of this.streams.values()) {
        stream.buffer = this.gl.createBuffer();
        stream.capacity = 0;
        const wanted = Math.max(stream.currentCount, stream.targetCount, 1);
        stream.data = new Float32Array(0);
        this.ensureCapacity(stream, Math.ceil(wanted * 1.04));
      }
      this.resize(this.width, this.height);
    };
    canvas.addEventListener("webglcontextlost", this.handleContextLost, false);
    canvas.addEventListener("webglcontextrestored", this.handleContextRestored, false);

    if (this.gl) this.initGl();
  }

  initGl() {
    const gl = this.gl;
    const vertexSource = `
      attribute float a_phase;
      attribute float a_lane;
      attribute float a_speedSeed;
      attribute float a_size;
      uniform vec2 u_resolution;
      uniform float u_progress;
      uniform float u_flowWidth;
      uniform float u_dpr;
      uniform vec2 u_p0;
      uniform vec2 u_p1;
      uniform vec2 u_p2;
      uniform vec2 u_p3;
      varying float v_alpha;
      varying float v_t;

      vec2 cubic(float t) {
        float u = 1.0 - t;
        return
          (u * u * u) * u_p0 +
          (3.0 * u * u * t) * u_p1 +
          (3.0 * u * t * t) * u_p2 +
          (t * t * t) * u_p3;
      }

      vec2 tangent(float t) {
        float u = 1.0 - t;
        return normalize(
          3.0 * u * u * (u_p1 - u_p0) +
          6.0 * u * t * (u_p2 - u_p1) +
          3.0 * t * t * (u_p3 - u_p2)
        );
      }

      void main() {
        float t = fract(a_phase + u_progress * a_speedSeed);
        vec2 p = cubic(t);
        vec2 n = tangent(t);
        vec2 normal = vec2(-n.y, n.x);
        float taper = sin(3.14159265 * t);
        float edgeFade = smoothstep(0.0, 0.09, t) * smoothstep(0.0, 0.09, 1.0 - t);
        float lane = (a_lane - 0.5) * u_flowWidth * taper;
        p += normal * lane;

        vec2 clip = vec2(
          (p.x / u_resolution.x) * 2.0 - 1.0,
          1.0 - (p.y / u_resolution.y) * 2.0
        );
        gl_Position = vec4(clip, 0.0, 1.0);
        gl_PointSize = max(1.0, a_size * u_dpr);

        v_alpha = edgeFade;
        v_t = t;
      }
    `;
    const fragmentSource = `
      precision mediump float;
      uniform vec4 u_color_start;
      uniform vec4 u_color_end;
      varying float v_alpha;
      varying float v_t;

      void main() {
        vec2 coord = gl_PointCoord - vec2(0.5);
        float dist = length(coord);
        vec4 color = mix(u_color_start, u_color_end, v_t);
        float alpha = smoothstep(0.5, 0.08, dist) * v_alpha * color.a;
        gl_FragColor = vec4(color.rgb, alpha);
      }
    `;

    const vertexShader = this.compileShader(gl.VERTEX_SHADER, vertexSource);
    const fragmentShader = this.compileShader(gl.FRAGMENT_SHADER, fragmentSource);
    if (!vertexShader || !fragmentShader) return;

    const program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error("Particle shader link failed", gl.getProgramInfoLog(program));
      return;
    }

    this.program = program;
    this.locations = {
      aPhase: gl.getAttribLocation(program, "a_phase"),
      aLane: gl.getAttribLocation(program, "a_lane"),
      aSpeedSeed: gl.getAttribLocation(program, "a_speedSeed"),
      aSize: gl.getAttribLocation(program, "a_size"),
      uResolution: gl.getUniformLocation(program, "u_resolution"),
      uProgress: gl.getUniformLocation(program, "u_progress"),
      uFlowWidth: gl.getUniformLocation(program, "u_flowWidth"),
      uDpr: gl.getUniformLocation(program, "u_dpr"),
      uP0: gl.getUniformLocation(program, "u_p0"),
      uP1: gl.getUniformLocation(program, "u_p1"),
      uP2: gl.getUniformLocation(program, "u_p2"),
      uP3: gl.getUniformLocation(program, "u_p3"),
      uColorStart: gl.getUniformLocation(program, "u_color_start"),
      uColorEnd: gl.getUniformLocation(program, "u_color_end"),
    };

    gl.enable(gl.BLEND);
    gl.blendEquation(gl.FUNC_ADD);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    gl.disable(gl.DEPTH_TEST);
  }

  compileShader(type, source) {
    const gl = this.gl;
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      console.error("Particle shader compile failed", gl.getShaderInfoLog(shader));
      gl.deleteShader(shader);
      return null;
    }
    return shader;
  }

  resize(width, height) {
    const nextWidth = Math.max(1, Math.round(width || window.innerWidth || this.width));
    const nextHeight = Math.max(1, Math.round(height || window.innerHeight || this.height));
    this.width = nextWidth;
    this.height = nextHeight;
    this.dpr = 1;
    const pixelWidth = Math.max(1, Math.floor(this.width * this.dpr));
    const pixelHeight = Math.max(1, Math.floor(this.height * this.dpr));
    if (this.canvas.width !== pixelWidth) this.canvas.width = pixelWidth;
    if (this.canvas.height !== pixelHeight) this.canvas.height = pixelHeight;
    this.canvas.style.width = `${this.width}px`;
    this.canvas.style.height = `${this.height}px`;
    this.gl?.viewport(0, 0, this.canvas.width, this.canvas.height);
  }

  setStreams(nextStreams, graph, focusedModelId = null, particleBudget = PARTICLE_RENDER_BUDGET) {
    const gl = this.gl;
    if (!gl || !this.program || this.contextLost) return;
    const now = performance.now();
    const requested = Math.max(0, graph?.requestedParticles || 0);
    const ratio = requested > particleBudget ? particleBudget / requested : 1;
    const seen = new Set();

    for (const spec of nextStreams) {
      seen.add(spec.id);
      const style = flowStyle(spec.tokens, spec.maxTokens);
      const rawTargetCount = spec.tokens <= 0 ? 0 : Math.max(18, Math.round(spec.tokens * ratio));
      let stream = this.streams.get(spec.id);

      if (!stream) {
        stream = this.createStream(spec, style);
        this.streams.set(spec.id, stream);
      }

      let targetCount = rawTargetCount;
      if (rawTargetCount > 0) {
        stream.lastPositiveAt = now;
        stream.lastPositiveCount = rawTargetCount;
      } else {
        const holdMs = MODEL_STREAM_HOLD_MS;
        if (stream.lastPositiveAt && now - stream.lastPositiveAt < holdMs) {
          const holdRatio = 1 - (now - stream.lastPositiveAt) / holdMs;
          targetCount = Math.max(1, Math.floor(stream.lastPositiveCount * holdRatio * 0.25));
        }
      }

      stream.retiring = false;
      stream.deleteAfter = null;
      stream.lastSeenAt = now;
      stream.targetCount = targetCount;
      stream.targetPath = pathToArray(spec.path);
      stream.targetColorStart = hexToRgb(spec.gradient?.from || spec.color);
      stream.targetColorEnd = hexToRgb(spec.gradient?.to || spec.color);
      const isFocused = !focusedModelId || spec.modelId === focusedModelId;
      stream.targetAlpha = targetCount > 0
        ? (spec.errorRate >= 0.1 ? 0.9 : 0.78) * (isFocused ? 1 : 0.045)
        : 0;
      stream.targetBaseSpeed = rawTargetCount > 0 ? 1 / style.seconds : Math.max(stream.targetBaseSpeed, 1.2);
      stream.targetFlowWidth = style.flowWidth;
      stream.targetSize = style.size;

      this.ensureCapacity(stream, Math.ceil(targetCount * 1.04));
    }

    for (const [id, stream] of this.streams) {
      if (!seen.has(id)) {
        if (stream.buffer) gl.deleteBuffer(stream.buffer);
        this.streams.delete(id);
      }
    }
  }

  createStream(spec, style) {
    const gl = this.gl;
    const initialPath = pathToArray(spec.path);
    const colorStart = hexToRgb(spec.gradient?.from || spec.color);
    const colorEnd = hexToRgb(spec.gradient?.to || spec.color);
    return {
      id: spec.id,
      progress: Math.random(),
      buffer: gl.createBuffer(),
      capacity: 0,
      data: new Float32Array(0),
      currentCount: 0,
      targetCount: 0,
      path: [...initialPath],
      targetPath: [...initialPath],
      colorStart: [...colorStart],
      targetColorStart: [...colorStart],
      colorEnd: [...colorEnd],
      targetColorEnd: [...colorEnd],
      alpha: 0.78,
      targetAlpha: 0.78,
      baseSpeed: 1 / style.seconds,
      targetBaseSpeed: 1 / style.seconds,
      flowWidth: style.flowWidth,
      targetFlowWidth: style.flowWidth,
      size: style.size,
      targetSize: style.size,
      retiring: false,
      deleteAfter: null,
      lastSeenAt: performance.now(),
      lastPositiveAt: 0,
      lastPositiveCount: 0,
    };
  }

  ensureCapacity(stream, requestedCapacity) {
    const gl = this.gl;
    const nextCapacity = Math.max(0, requestedCapacity);
    if (nextCapacity <= stream.capacity) return;

    const previousCapacity = stream.capacity;
    const grownCapacity = Math.max(nextCapacity, Math.ceil(Math.max(256, stream.capacity * 1.4)));
    const nextData = new Float32Array(grownCapacity * 4);
    nextData.set(stream.data);

    for (let index = previousCapacity; index < grownCapacity; index += 1) {
      const offset = index * 4;
      nextData[offset] = previousCapacity === 0 ? Math.random() : Math.random() * 0.08;
      nextData[offset + 1] = gaussianLane();
      nextData[offset + 2] = 0.75 + Math.random() * 0.65;
      nextData[offset + 3] = clamp(stream.targetSize * (0.72 + Math.random() * 0.7), 0.75, 2.5);
    }

    stream.capacity = grownCapacity;
    stream.data = nextData;
    gl.bindBuffer(gl.ARRAY_BUFFER, stream.buffer);
    gl.bufferData(gl.ARRAY_BUFFER, stream.data, gl.STATIC_DRAW);
  }

  start() {
    if (this.running || !this.gl || !this.program) return;
    this.running = true;
    this.lastFrame = performance.now();
    this.lastRender = 0;
    const tick = (now) => {
      if (!this.running) return;
      if (document.hidden) {
        this.lastFrame = now;
        this.raf = requestAnimationFrame(tick);
        return;
      }
      const dt = Math.min(0.1, (now - this.lastFrame) / 1000);
      this.lastFrame = now;
      if (now - this.lastRender >= TARGET_FRAME_MS) {
        this.render(now / 1000, dt);
        this.lastRender = now;
      }
      this.raf = requestAnimationFrame(tick);
    };
    this.raf = requestAnimationFrame(tick);
  }

  stop() {
    this.running = false;
    if (this.raf) cancelAnimationFrame(this.raf);
  }

  dispose() {
    this.stop();
    const gl = this.gl;
    if (!gl) return;
    for (const stream of this.streams.values()) {
      gl.deleteBuffer(stream.buffer);
    }
    this.streams.clear();
    this.canvas.removeEventListener("webglcontextlost", this.handleContextLost, false);
    this.canvas.removeEventListener("webglcontextrestored", this.handleContextRestored, false);
  }

  render(time, dt) {
    const gl = this.gl;
    if (!gl || !this.program || !this.locations || this.contextLost) return;
    const renderStartedAt = performance.now();

    gl.viewport(0, 0, this.canvas.width, this.canvas.height);
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.useProgram(this.program);
    gl.uniform2f(this.locations.uResolution, this.width, this.height);
    gl.uniform1f(this.locations.uDpr, this.dpr);

    for (const [id, stream] of this.streams) {
      const pathSmooth = 1 - Math.exp(-dt * 14);
      const countRate = stream.retiring
        ? 10
        : stream.targetCount < stream.currentCount
          ? 7.5
          : 10;
      const countSmooth = 1 - Math.exp(-dt * countRate);
      const alphaSmooth = 1 - Math.exp(-dt * (stream.retiring ? 12 : 10));
      stream.currentCount = lerp(stream.currentCount, stream.targetCount, countSmooth);
      stream.baseSpeed = lerp(stream.baseSpeed, stream.targetBaseSpeed, pathSmooth);
      stream.flowWidth = lerp(stream.flowWidth, stream.targetFlowWidth, pathSmooth);
      stream.alpha = lerp(stream.alpha, stream.targetAlpha, alphaSmooth);
      stream.size = lerp(stream.size, stream.targetSize, pathSmooth);
      stream.progress = (stream.progress + dt * stream.baseSpeed) % 10000;

      for (let index = 0; index < 8; index += 1) {
        stream.path[index] = lerp(stream.path[index], stream.targetPath[index], pathSmooth);
      }
      for (let index = 0; index < 3; index += 1) {
        stream.colorStart[index] = lerp(stream.colorStart[index], stream.targetColorStart[index], pathSmooth);
        stream.colorEnd[index] = lerp(stream.colorEnd[index], stream.targetColorEnd[index], pathSmooth);
      }

      const drawCount = Math.min(
        stream.capacity,
        Math.max(0, Math.floor(stream.currentCount * this.performanceScale)),
      );
      if (drawCount <= 0 || (stream.retiring && stream.alpha < 0.025)) {
        if (stream.targetCount === 0 && (stream.currentCount < 0.5 || stream.alpha < 0.025)) {
          gl.deleteBuffer(stream.buffer);
          this.streams.delete(id);
        }
        continue;
      }

      gl.bindBuffer(gl.ARRAY_BUFFER, stream.buffer);
      const stride = 4 * Float32Array.BYTES_PER_ELEMENT;
      gl.enableVertexAttribArray(this.locations.aPhase);
      gl.vertexAttribPointer(this.locations.aPhase, 1, gl.FLOAT, false, stride, 0);
      gl.enableVertexAttribArray(this.locations.aLane);
      gl.vertexAttribPointer(this.locations.aLane, 1, gl.FLOAT, false, stride, 4);
      gl.enableVertexAttribArray(this.locations.aSpeedSeed);
      gl.vertexAttribPointer(this.locations.aSpeedSeed, 1, gl.FLOAT, false, stride, 8);
      gl.enableVertexAttribArray(this.locations.aSize);
      gl.vertexAttribPointer(this.locations.aSize, 1, gl.FLOAT, false, stride, 12);

      gl.uniform1f(this.locations.uProgress, stream.progress);
      gl.uniform1f(this.locations.uFlowWidth, stream.flowWidth);
      gl.uniform2f(this.locations.uP0, stream.path[0], stream.path[1]);
      gl.uniform2f(this.locations.uP1, stream.path[2], stream.path[3]);
      gl.uniform2f(this.locations.uP2, stream.path[4], stream.path[5]);
      gl.uniform2f(this.locations.uP3, stream.path[6], stream.path[7]);
      gl.uniform4f(
        this.locations.uColorStart,
        stream.colorStart[0],
        stream.colorStart[1],
        stream.colorStart[2],
        stream.alpha,
      );
      gl.uniform4f(
        this.locations.uColorEnd,
        stream.colorEnd[0],
        stream.colorEnd[1],
        stream.colorEnd[2],
        stream.alpha,
      );
      gl.drawArrays(gl.POINTS, 0, drawCount);
    }

    const renderMs = performance.now() - renderStartedAt;
    this.smoothedRenderMs = this.smoothedRenderMs
      ? this.smoothedRenderMs * 0.9 + renderMs * 0.1
      : renderMs;
    if (this.smoothedRenderMs > 13) {
      this.performanceScale = Math.max(0.35, this.performanceScale - 0.035);
    } else if (this.smoothedRenderMs < 7) {
      this.performanceScale = Math.min(1, this.performanceScale + 0.008);
    }
  }
}

function ParticleLayer({ streams, graph, size, focusedModelId }) {
  const canvasRef = useRef(null);
  const engineRef = useRef(null);
  const latestRef = useRef({ streams, graph, size, focusedModelId });

  useEffect(() => {
    latestRef.current = { streams, graph, size, focusedModelId };
  }, [focusedModelId, graph, size, streams]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let visibilityObserver = null;

    const createEngine = () => {
      const current = latestRef.current;
      const engine = new ParticleEngine(canvas);
      engineRef.current = engine;
      engine.resize(Math.max(current.size.width, MIN_STAGE_WIDTH), Math.max(current.size.height, MIN_STAGE_HEIGHT));
      const particleBudget = particleBudgetForDevice();
      engine.setStreams(current.streams, current.graph, current.focusedModelId, particleBudget);
      if (reducedMotion) {
        engine.render(performance.now() / 1000, 1 / 60);
        return;
      }

      if (typeof IntersectionObserver === "undefined") {
        engine.start();
        return;
      }

      visibilityObserver = new IntersectionObserver(
        ([entry]) => {
          if (entry?.isIntersecting) engine.start();
          else engine.stop();
        },
        { rootMargin: "160px 0px", threshold: 0 },
      );
      visibilityObserver.observe(canvas);
    };

    const disposeEngine = () => {
      visibilityObserver?.disconnect();
      visibilityObserver = null;
      engineRef.current?.dispose();
      engineRef.current = null;
    };
    createEngine();

    return () => {
      disposeEngine();
    };
  }, []);

  useEffect(() => {
    const engine = engineRef.current;
    if (!engine) return;
    engine.resize(Math.max(size.width, MIN_STAGE_WIDTH), Math.max(size.height, MIN_STAGE_HEIGHT));
    const particleBudget = particleBudgetForDevice();
    engine.setStreams(streams, graph, focusedModelId, particleBudget);
  }, [focusedModelId, graph, size.height, size.width, streams]);

  return h("canvas", { ref: canvasRef, className: "particle-layer", "aria-hidden": "true" });
}

function App() {
  const { resolvedTheme, theme: selectedTheme } = useNextTheme();
  const theme = resolvedTheme === "dark" || selectedTheme === "dark" ? "dark" : "light";
  const [stageRef, size, stageNode] = useStageSize();
  const { payload: livePayload, latest, error } = usePingMetrics();
  const [useDemo, setUseDemo] = useState(false);
  const payload = useDemo ? DEMO_PAYLOAD : livePayload;
  const payloadSource = useDemo ? "demo" : "live";
  const status = useMemo(() => {
    if (useDemo) {
      return { state: "live", error: null, updatedAt: latest?.collectedAt ?? null, latencyMs: 0 };
    }

    if (error && !livePayload) {
      return { state: "error", error, updatedAt: null, latencyMs: null };
    }

    if (error && livePayload) {
      return { state: "stale", error, updatedAt: latest?.collectedAt ?? null, latencyMs: null };
    }

    if (!livePayload) {
      return { state: "loading", error: null, updatedAt: null, latencyMs: null };
    }

    return { state: "live", error: null, updatedAt: latest?.collectedAt ?? null, latencyMs: null };
  }, [error, latest?.collectedAt, livePayload, useDemo]);

  useEffect(() => {
    setUseDemo(new URLSearchParams(window.location.search).get("demo") === "1");
  }, []);

  const [tooltip, setTooltip] = useState(null);
  const [focusedModelId, setFocusedModelId] = useState(null);
  const tooltipHideTimerRef = useRef(null);

  useEffect(() => () => {
    if (tooltipHideTimerRef.current !== null) {
      window.clearTimeout(tooltipHideTimerRef.current);
    }
  }, []);

  const clearLooseTooltip = useCallback(() => {
    setTooltip((current) => (current?.sticky ? null : current));
  }, []);
  const { isDragging, dragScrollHandlers } = usePageDragScroll(clearLooseTooltip);

  const makeTooltipState = useCallback(
    (event, content, sticky = false) => {
      const rect = stageNode?.getBoundingClientRect();
      const x = rect ? event.clientX - rect.left : event.clientX;
      const y = rect ? event.clientY - rect.top : event.clientY;
      return { ...content, x, y, sticky };
    },
    [stageNode],
  );

  const tooltipApi = useMemo(
    () => ({
      show: (event, content) => {
        if (tooltipHideTimerRef.current !== null) {
          window.clearTimeout(tooltipHideTimerRef.current);
          tooltipHideTimerRef.current = null;
        }
        setFocusedModelId(content.modelId ?? null);
        setTooltip((current) => {
          if (current?.sticky || current?.key === content.key) return current;
          return makeTooltipState(event, content, false);
        });
      },
      move: (event, content) => {
        setTooltip((current) => {
          if (current?.sticky || current?.key === content.key) return current;
          return makeTooltipState(event, content, false);
        });
      },
      hide: () => {
        if (tooltipHideTimerRef.current !== null) {
          window.clearTimeout(tooltipHideTimerRef.current);
        }
        tooltipHideTimerRef.current = window.setTimeout(() => {
          setTooltip((current) => (current?.sticky ? current : null));
          setFocusedModelId(null);
          tooltipHideTimerRef.current = null;
        }, 180);
      },
      toggle: (event, content) => {
        if (tooltipHideTimerRef.current !== null) {
          window.clearTimeout(tooltipHideTimerRef.current);
          tooltipHideTimerRef.current = null;
        }
        setTooltip((current) => {
          const willClose = current?.sticky && current.key === content.key;
          setFocusedModelId(willClose ? null : (content.modelId ?? null));
          return willClose ? null : makeTooltipState(event, content, true);
        });
      },
    }),
    [makeTooltipState],
  );

  const snapshot = useMemo(() => extractSnapshot(payload, payloadSource), [payload, payloadSource]);
  const graph = useMemo(() => createGraph(snapshot, size, theme, status), [snapshot, size, theme, status]);
  const nodesWithTooltip = useMemo(
    () => graph.nodes.map((node) => ({ ...node, data: { ...node.data, tooltip: tooltipApi } })),
    [graph.nodes, tooltipApi],
  );

  return h(
    "div",
    {
      ref: stageRef,
      className: `llm7-live-flow flow-shell${graph.compact ? " is-compact" : ""}${isDragging ? " is-dragging" : ""}`,
      style: {
        height: `${graph.stageHeight}px`,
        "--flow-model-width": `${graph.modelWidth}px`,
        "--flow-model-height": `${graph.modelHeight}px`,
        "--flow-router-size": `${graph.routerSize}px`,
      },
      ...dragScrollHandlers,
    },
    h(ParticleLayer, { streams: graph.streams, graph, size: { width: size.width, height: graph.stageHeight }, focusedModelId }),
    h(
      "div",
      { className: "flow-overview", "aria-live": "polite" },
      h("div", { className: "flow-overview-label" }, "LLM7 · TOKEN ROUTING"),
      h("div", { className: "flow-overview-rate" }, compactNumber(snapshot.totals.tokens / FLOW_WINDOW_SECONDS)),
      h("span", { className: "flow-overview-unit" }, "tok/s"),
      h("div", { className: "flow-overview-subtitle" }, `${compactNumber(snapshot.totals.tokens)} tok/min · rolling 60s`),
      h("div", { className: `flow-live-status ${status.state}` }, status.state === "live" ? "LIVE" : status.state.toUpperCase()),
    ),
    h(FlowNodeLayer, { nodes: nodesWithTooltip }),
    h(GlobalTooltip, { tooltip, size: { width: size.width, height: graph.stageHeight } }),
  );
}

export default App;
