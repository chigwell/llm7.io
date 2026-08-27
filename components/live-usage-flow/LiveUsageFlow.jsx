"use client";

import React, {
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { ReactFlow } from "@xyflow/react";
import { useTheme as useNextTheme } from "next-themes";
import { usePingMetrics } from "@/hooks/use-ping-metrics";
import {
  DEMO_PAYLOAD,
  clamp,
  clientLabel,
  compactNumber,
  extractSnapshot,
  formatPercent,
  formatSeconds,
  fullNumber,
  lerp,
  numberOrZero,
  stableId,
  statusForModel,
  visibleModelsForViewport,
} from "./modelData.js";
import {
  flowStyle,
  hexToRgb,
  pathBetween,
  pathToArray,
  routeD,
} from "./flowGeometry.js";

const h = React.createElement;

const FLOW_WINDOW_SECONDS = 60;
const MODEL_ROW_HEIGHT = 74;
const MODEL_TOP = 26;
const MODEL_WIDTH = 258;
const MODEL_HEIGHT = 64;
const CLIENT_WIDTH = 166;
const CLIENT_HEIGHT = 94;
const ROUTER_SIZE = 132;
const RIGHT_PADDING = 34;
const LEFT_PADDING = 38;
const PARTICLE_RENDER_BUDGET = 1_600_000;
const TARGET_FRAME_MS = 1000 / 30;
const MIN_STAGE_WIDTH = 300;
const MIN_STAGE_HEIGHT = 520;
const MOBILE_STAGE_BREAKPOINT = 720;
const MOBILE_MODEL_TOP_GAP = 52;
const CLIENT_STREAM_HOLD_MS = 900;
const MODEL_STREAM_HOLD_MS = 300;

const DEFAULT_STAGE_SIZE = {
  width: 920,
  height: 760,
  viewportHeight: 760,
};

const SITE_FLOW_GRADIENT = {
  light: ["#be185d", "#b45309", "#047857", "#1d4ed8", "#7e22ce"],
  dark: ["#f9a8d4", "#fde68a", "#a7f3d0", "#93c5fd", "#c4b5fd"],
};

function useStageSize() {
  const ref = useRef(null);
  const lastSizeRef = useRef(DEFAULT_STAGE_SIZE);
  const frameRef = useRef(null);
  const [size, setSize] = useState(lastSizeRef.current);

  useEffect(() => {
    const node = ref.current;
    if (!node) return undefined;

    const readSize = () => {
      const rect = node.getBoundingClientRect();
      const rawWidth = rect.width > 1 ? rect.width : window.innerWidth || lastSizeRef.current.width;
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
  }, []);

  return [ref, size];
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

function siteGradientForStream(index, theme) {
  const colors = SITE_FLOW_GRADIENT[theme === "dark" ? "dark" : "light"];
  const from = colors[index % colors.length];
  const to = colors[(index + 1) % colors.length];
  const mid = colors[(index + 2) % colors.length];
  return { from, mid, to };
}

function createGraph(snapshot, size, theme, status) {
  const width = Math.max(1, size.width || DEFAULT_STAGE_SIZE.width);
  const measuredHeight = Math.max(1, size.height || DEFAULT_STAGE_SIZE.height);
  const compact = width < MOBILE_STAGE_BREAKPOINT;
  const viewportHeight = Math.max(
    MIN_STAGE_HEIGHT,
    size.viewportHeight || measuredHeight,
  );
  const models = visibleModelsForViewport(snapshot, measuredHeight, compact);
  const modelWidth = compact ? Math.min(MODEL_WIDTH, Math.max(224, width - 28)) : MODEL_WIDTH;
  const modelTop = compact ? CLIENT_HEIGHT + ROUTER_SIZE + MOBILE_MODEL_TOP_GAP + 84 : MODEL_TOP;
  const modelBottom = modelTop + Math.max(1, models.length) * MODEL_ROW_HEIGHT + 24;
  const height = Math.max(measuredHeight, viewportHeight, modelBottom);
  const centerX = width / 2;
  const centerY = compact ? 0 : viewportHeight / 2;
  const routerX = compact
    ? clamp(centerX - ROUTER_SIZE / 2, 12, Math.max(12, width - ROUTER_SIZE - 12))
    : centerX - ROUTER_SIZE / 2;
  const routerY = compact ? CLIENT_HEIGHT + 76 : centerY - ROUTER_SIZE / 2;
  const preferredModelX = width - modelWidth - RIGHT_PADDING;
  const minModelX = routerX + ROUTER_SIZE + 36;
  const maxModelX = width - modelWidth - 12;
  const modelX = compact
    ? clamp(centerX - modelWidth / 2, 12, Math.max(12, width - modelWidth - 12))
    : minModelX <= maxModelX
      ? clamp(preferredModelX, minModelX, maxModelX)
      : Math.max(12, maxModelX);
  const preferredClientX = LEFT_PADDING;
  const maxClientX = routerX - CLIENT_WIDTH - 36;
  const clientX = compact
    ? clamp(centerX - CLIENT_WIDTH / 2, 12, Math.max(12, width - CLIENT_WIDTH - 12))
    : maxClientX >= 12
      ? clamp(preferredClientX, 12, maxClientX)
      : 12;
  const clientY = compact ? 28 : centerY - CLIENT_HEIGHT / 2;
  const maxTokens = Math.max(1, snapshot.totals.tokens, ...models.map((model) => model.tokens));

  const nodes = [
    {
      id: "clients",
      type: "clients",
      position: { x: clientX, y: clientY },
      data: { snapshot, theme },
      draggable: false,
      selectable: false,
    },
    {
      id: "router",
      type: "router",
      position: { x: routerX, y: routerY },
      data: { snapshot, theme, status },
      draggable: false,
      selectable: false,
    },
    ...models.map((model, index) => ({
      id: `model-${stableId(model.name || model.displayName || index)}`,
      type: "model",
      position: { x: modelX, y: modelTop + index * MODEL_ROW_HEIGHT },
      data: { model, theme },
      draggable: false,
      selectable: false,
    })),
  ];

  const clientPoint = compact
    ? { x: clientX + CLIENT_WIDTH / 2, y: clientY + CLIENT_HEIGHT }
    : { x: clientX + CLIENT_WIDTH, y: centerY };
  const routerIn = compact
    ? { x: routerX + ROUTER_SIZE / 2, y: routerY }
    : { x: routerX, y: centerY };
  const routerOut = compact
    ? { x: routerX + ROUTER_SIZE / 2, y: routerY + ROUTER_SIZE }
    : { x: routerX + ROUTER_SIZE, y: centerY };
  const streams = [
    {
      id: "clients-router",
      tokens: snapshot.totals.tokens,
      attempts: snapshot.totals.attempts,
      errorRate: snapshot.totals.errorRate,
      path: pathBetween(clientPoint, routerIn, compact ? 0.16 : 0.36),
      gradient: siteGradientForStream(0, theme),
      maxTokens,
    },
    ...models.map((model, index) => {
      const modelPoint = compact
        ? { x: modelX + modelWidth / 2, y: modelTop + index * MODEL_ROW_HEIGHT }
        : { x: modelX, y: modelTop + index * MODEL_ROW_HEIGHT + MODEL_HEIGHT / 2 };
      return {
        id: `router-${stableId(model.name || model.displayName || index)}`,
        tokens: model.tokens,
        attempts: model.attempts,
        errorRate: model.errorRate,
        path: pathBetween(
          routerOut,
          modelPoint,
          compact ? 0.16 : 0.28 + Math.min(0.14, Math.abs(modelPoint.y - centerY) / 1200),
        ),
        gradient: siteGradientForStream(index + 1, theme),
        maxTokens,
      };
    }),
  ];

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

function UserIcon() {
  return h(
    "svg",
    { viewBox: "0 0 24 24", "aria-hidden": "true" },
    h("path", {
      d: "M12 12.2c2.42 0 4.38-1.96 4.38-4.38S14.42 3.44 12 3.44 7.62 5.4 7.62 7.82 9.58 12.2 12 12.2Zm0 2.05c-3.68 0-6.86 1.98-8.52 4.92-.42.74.1 1.66.95 1.66h15.14c.85 0 1.37-.92.95-1.66-1.66-2.94-4.84-4.92-8.52-4.92Z",
    }),
  );
}

const ClientsNode = memo(function ClientsNode({ data }) {
  const snapshot = data.snapshot;
  const uniqueClients = Math.max(0, Math.round(snapshot.uniqueClients));
  const iconCount = clamp(uniqueClients || 3, 3, 8);
  const breakdown = Object.entries(snapshot.clientBreakdown || {})
    .filter(([, value]) => numberOrZero(value) > 0)
    .map(([key, value]) => `${clientLabel(key)} ${fullNumber(value)}`)
    .join(" · ") || "—";
  const tooltip = {
    key: "clients",
    title: "Users / clients",
    stats: [
      { label: "unique", value: fullNumber(snapshot.uniqueClients) },
      { label: "active req", value: fullNumber(snapshot.activeRequests) },
      { label: "tokens", value: fullNumber(snapshot.totals.tokens) },
      { label: "breakdown", value: breakdown },
    ],
  };

  return h(
    "div",
    { className: "flow-node", ...tooltipEventProps(data, tooltip) },
    h(
      "div",
      { className: "client-node" },
      h(
        "div",
        { className: "client-stack", "aria-label": `${uniqueClients} unique clients` },
        Array.from({ length: iconCount }).map((_, index) =>
          h(
            "div",
            {
              key: index,
              className: "client-avatar",
              style: {
                left: `${index * 10}px`,
                zIndex: iconCount - index,
                opacity: 0.98 - index * 0.035,
              },
            },
            h(UserIcon),
          ),
        ),
        h("div", { className: "client-badge" }, compactNumber(uniqueClients)),
      ),
    ),
  );
});

const RouterNode = memo(function RouterNode({ data }) {
  const snapshot = data.snapshot;
  const status = data.status;
  const [logoFailed, setLogoFailed] = useState(false);
  const statusClass = status.state === "loading" ? "loading" : status.state === "error" || status.state === "stale" ? "error" : "";
  const tooltip = {
    key: "router",
    title: "api.llm7.io router",
    stats: [
      { label: "tokens", value: fullNumber(snapshot.totals.tokens) },
      { label: "requests", value: fullNumber(snapshot.totals.attempts) },
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
      { className: "router-node" },
      h("span", { className: `router-pulse ${statusClass}` }),
      h(
        "div",
        { className: "router-core" },
        !logoFailed
          ? h("img", {
              alt: "LLM7",
              src: getLogoPath(data.theme === "dark" ? "LLM7_white_transparent.png" : "llm7.png"),
              onError: () => setLogoFailed(true),
            })
          : h("div", { className: "router-fallback" }, "7"),
      ),
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
      { className: "model-node" },
      h(
        "div",
        { className: `model-logo-box ${imageLogo ? "image-logo" : ""}` },
        logo && !logoFailed
          ? h("img", {
              alt: "",
              src: logo,
              loading: "lazy",
              onError: () => setLogoFailed(true),
            })
          : h("div", { className: "model-initials" }, initialsForModel(model.name)),
      ),
      h(
        "div",
        { className: "model-main" },
        h("div", { className: "model-name" }, model.displayName),
        h(
          "div",
          { className: "model-meta" },
          h("span", { className: `health-dot ${status === "ok" ? "" : status}` }),
          h("span", null, formatPercent(model.successRate)),
          h("span", null, "·"),
          h("span", null, `${compactNumber(model.attempts)} req`),
        ),
      ),
      h("div", { className: "token-pill" }, compactNumber(model.tokens)),
    ),
  );
});

const nodeTypes = {
  clients: ClientsNode,
  router: RouterNode,
  model: ModelNode,
};

function EdgeCanvas({ streams, size, theme }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dpr = Math.min(2, window.devicePixelRatio || 1);
    canvas.width = Math.max(1, Math.floor(size.width * dpr));
    canvas.height = Math.max(1, Math.floor(size.height * dpr));
    canvas.style.width = `${size.width}px`;
    canvas.style.height = `${size.height}px`;

    const context = canvas.getContext("2d");
    if (!context) return;

    context.setTransform(dpr, 0, 0, dpr, 0, 0);
    context.clearRect(0, 0, size.width, size.height);

    for (const stream of streams) {
      const style = flowStyle(stream.tokens, stream.maxTokens);
      const color = stream.gradient?.mid || stream.gradient?.from || stream.color || "#1d4ed8";
      const gradient = context.createLinearGradient(stream.path.p0.x, stream.path.p0.y, stream.path.p3.x, stream.path.p3.y);
      gradient.addColorStop(0, stream.gradient?.from || (theme === "dark" ? "#f9a8d4" : "#be185d"));
      gradient.addColorStop(0.46, color);
      gradient.addColorStop(1, stream.gradient?.to || (theme === "dark" ? "#93c5fd" : "#1d4ed8"));

      context.save();
      context.globalAlpha = style.opacity;
      context.lineCap = "round";
      context.lineWidth = style.width;
      context.strokeStyle = gradient;
      context.shadowColor = color;
      context.shadowBlur = stream.tokens > 0 ? 18 * style.norm : 0;
      const path = new Path2D(routeD(stream.path));
      context.stroke(path);
      context.restore();

      context.save();
      context.globalAlpha = theme === "dark" ? 0.1 : 0.13;
      context.lineCap = "round";
      context.lineWidth = Math.max(1, style.width + 12);
      context.strokeStyle = color;
      context.stroke(path);
      context.restore();
    }
  }, [streams, size.height, size.width, theme]);

  return h("canvas", { ref: canvasRef, className: "edge-layer", "aria-hidden": "true" });
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
        float lane = (a_lane - 0.5) * u_flowWidth;
        p += normal * lane;

        vec2 clip = vec2(
          (p.x / u_resolution.x) * 2.0 - 1.0,
          1.0 - (p.y / u_resolution.y) * 2.0
        );
        gl_Position = vec4(clip, 0.0, 1.0);
        gl_PointSize = max(1.0, a_size * u_dpr);

        v_alpha = 1.0;
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
    this.dpr = Math.min(2, window.devicePixelRatio || 1);
    const pixelWidth = Math.max(1, Math.floor(this.width * this.dpr));
    const pixelHeight = Math.max(1, Math.floor(this.height * this.dpr));
    if (this.canvas.width !== pixelWidth) this.canvas.width = pixelWidth;
    if (this.canvas.height !== pixelHeight) this.canvas.height = pixelHeight;
    this.canvas.style.width = `${this.width}px`;
    this.canvas.style.height = `${this.height}px`;
    this.gl?.viewport(0, 0, this.canvas.width, this.canvas.height);
  }

  setStreams(nextStreams, graph) {
    const gl = this.gl;
    if (!gl || !this.program || this.contextLost) return;
    const now = performance.now();
    const requested = Math.max(0, graph?.requestedParticles || 0);
    const ratio = requested > PARTICLE_RENDER_BUDGET ? PARTICLE_RENDER_BUDGET / requested : 1;
    const seen = new Set();

    for (const spec of nextStreams) {
      seen.add(spec.id);
      const style = flowStyle(spec.tokens, spec.maxTokens);
      const rawTargetCount = spec.tokens <= 0 ? 0 : Math.max(1, Math.round(spec.tokens * ratio));
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
        const holdMs = spec.id === "clients-router" ? CLIENT_STREAM_HOLD_MS : MODEL_STREAM_HOLD_MS;
        if (stream.lastPositiveAt && now - stream.lastPositiveAt < holdMs) {
          const holdRatio = 1 - (now - stream.lastPositiveAt) / holdMs;
          const holdMultiplier = spec.id === "clients-router" ? 0.62 : 0.25;
          targetCount = Math.max(1, Math.floor(stream.lastPositiveCount * holdRatio * holdMultiplier));
        }
      }

      stream.retiring = false;
      stream.deleteAfter = null;
      stream.lastSeenAt = now;
      stream.targetCount = targetCount;
      stream.targetPath = pathToArray(spec.path);
      stream.targetColorStart = hexToRgb(spec.gradient?.from || spec.color);
      stream.targetColorEnd = hexToRgb(spec.gradient?.to || spec.color);
      stream.targetAlpha = targetCount > 0 ? (spec.errorRate >= 0.1 ? 0.9 : 0.78) : 0;
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
      nextData[offset + 1] = Math.random();
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

      const drawCount = Math.min(stream.capacity, Math.max(0, Math.floor(stream.currentCount)));
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
  }
}

function ParticleLayer({ streams, graph, size }) {
  const canvasRef = useRef(null);
  const engineRef = useRef(null);
  const latestRef = useRef({ streams, graph, size });

  useEffect(() => {
    latestRef.current = { streams, graph, size };
  }, [graph, size, streams]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;

    const createEngine = () => {
      const current = latestRef.current;
      const engine = new ParticleEngine(canvas);
      engineRef.current = engine;
      engine.resize(Math.max(current.size.width, MIN_STAGE_WIDTH), Math.max(current.size.height, MIN_STAGE_HEIGHT));
      engine.setStreams(current.streams, current.graph);
      engine.start();
    };

    const disposeEngine = () => {
      engineRef.current?.dispose();
      engineRef.current = null;
    };

    const handleContextLost = (event) => {
      event.preventDefault();
      disposeEngine();
    };

    const handleContextRestored = () => {
      disposeEngine();
      createEngine();
    };

    canvas.addEventListener("webglcontextlost", handleContextLost, false);
    canvas.addEventListener("webglcontextrestored", handleContextRestored, false);
    createEngine();

    return () => {
      canvas.removeEventListener("webglcontextlost", handleContextLost, false);
      canvas.removeEventListener("webglcontextrestored", handleContextRestored, false);
      disposeEngine();
    };
  }, []);

  useEffect(() => {
    const engine = engineRef.current;
    if (!engine) return;
    engine.resize(Math.max(size.width, MIN_STAGE_WIDTH), Math.max(size.height, MIN_STAGE_HEIGHT));
    engine.setStreams(streams, graph);
  }, [graph, size.height, size.width, streams]);

  return h("canvas", { ref: canvasRef, className: "particle-layer", "aria-hidden": "true" });
}

function App() {
  const { resolvedTheme, theme: selectedTheme } = useNextTheme();
  const theme = resolvedTheme === "dark" || selectedTheme === "dark" ? "dark" : "light";
  const [stageRef, size] = useStageSize();
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
  const clearLooseTooltip = useCallback(() => {
    setTooltip((current) => (current?.sticky ? null : current));
  }, []);
  const { isDragging, dragScrollHandlers } = usePageDragScroll(clearLooseTooltip);

  const makeTooltipState = useCallback(
    (event, content, sticky = false) => {
      const rect = stageRef.current?.getBoundingClientRect();
      const x = rect ? event.clientX - rect.left : event.clientX;
      const y = rect ? event.clientY - rect.top : event.clientY;
      return { ...content, x, y, sticky };
    },
    [stageRef],
  );

  const tooltipApi = useMemo(
    () => ({
      show: (event, content) => {
        setTooltip((current) => (current?.sticky ? current : makeTooltipState(event, content, false)));
      },
      move: (event, content) => {
        setTooltip((current) => (current?.sticky ? current : makeTooltipState(event, content, false)));
      },
      hide: () => {
        setTooltip((current) => (current?.sticky ? current : null));
      },
      toggle: (event, content) => {
        setTooltip((current) =>
          current?.sticky && current.key === content.key ? null : makeTooltipState(event, content, true),
        );
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
      },
      ...dragScrollHandlers,
    },
    h(ParticleLayer, { streams: graph.streams, graph, size: { width: size.width, height: graph.stageHeight } }),
    h(
      "div",
      { className: "flow-react" },
      h(ReactFlow, {
        nodes: nodesWithTooltip,
        edges: [],
        nodeTypes,
        defaultViewport: { x: 0, y: 0, zoom: 1 },
        viewport: { x: 0, y: 0, zoom: 1 },
        onlyRenderVisibleElements: false,
        minZoom: 1,
        maxZoom: 1,
        panOnDrag: false,
        panOnScroll: false,
        preventScrolling: false,
        zoomOnScroll: false,
        zoomOnPinch: false,
        zoomOnDoubleClick: false,
        nodesDraggable: false,
        nodesConnectable: false,
        elementsSelectable: false,
        proOptions: { hideAttribution: true },
        style: { width: "100%", height: "100%" },
      }),
    ),
    h(GlobalTooltip, { tooltip, size: { width: size.width, height: graph.stageHeight } }),
  );
}

export default App;
