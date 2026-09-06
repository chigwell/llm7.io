import { clamp, stableId, visibleModelsForViewport } from "./modelData.js";
import { pathBetween } from "./flowGeometry.js";

export const REFERENCE_WIDTH = 1920;
export const REFERENCE_HEIGHT = 1080;
export const MODEL_WIDTH = 240;
export const MODEL_HEIGHT = 160;
export const ROUTER_SIZE = 280;
export const PARTICLE_RENDER_BUDGET = 130_000;
export const MIN_STAGE_HEIGHT = 520;
export const COMPACT_STAGE_BREAKPOINT = 640;
export const MOBILE_MODEL_TOP_GAP = 68;
export const DEFAULT_STAGE_SIZE = {
  width: 920,
  height: 760,
  viewportHeight: 760,
};

const MODEL_FLOW_PALETTES = [
  { accent: "#2f639d", light: ["#235f9f", "#00735f"], dark: ["#9bd0ff", "#7ff5d4"] },
  { accent: "#6046a7", light: ["#5c3aa7", "#0074b8"], dark: ["#cdbfff", "#8cddff"] },
  { accent: "#943b92", light: ["#8f2f8f", "#007484"], dark: ["#f4a9ef", "#86edf6"] },
  { accent: "#b13060", light: ["#315fc3", "#af2757"], dark: ["#a9c3ff", "#ffa8c7"] },
  { accent: "#4f7c1b", light: ["#2f7a28", "#007fa3"], dark: ["#a6ee8a", "#91e9ff"] },
  { accent: "#00778a", light: ["#00778a", "#833ca1"], dark: ["#78ecfb", "#edb0ff"] },
  { accent: "#4d6386", light: ["#465f85", "#b23c34"], dark: ["#c4d8f5", "#ffaaa1"] },
  { accent: "#315d9d", light: ["#27599b", "#8f6c00"], dark: ["#a8c7ff", "#f5da72"] },
  { accent: "#007663", light: ["#007663", "#ae344b"], dark: ["#82ecd4", "#ff9daf"] },
  { accent: "#523a95", light: ["#523a95", "#0070aa"], dark: ["#c1afff", "#93d9ff"] },
  { accent: "#286d32", light: ["#286d32", "#9f347b"], dark: ["#96e7a0", "#fface0"] },
  { accent: "#214a86", light: ["#214a86", "#b12f6d"], dark: ["#9bbcff", "#ffa6d0"] },
  { accent: "#6d3f7f", light: ["#6d3f7f", "#686d00"], dark: ["#dda9ed", "#dbdf74"] },
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

function modelSlot(index, compact) {
  if (compact) return { column: 0, row: index };
  // Match the reference: the four busiest models occupy the left column with
  // its two busiest cards nearest the hub, while the second column is staggered.
  const leftRows = [1, 2, 0, 3];
  if (index < 4) return { column: 0, row: leftRows[index] };
  return { column: 1, row: index - 4 };
}

export function createGraph(snapshot, size, theme, status) {
  const width = Math.max(1, size.width || DEFAULT_STAGE_SIZE.width);
  const measuredHeight = Math.max(1, size.height || DEFAULT_STAGE_SIZE.height);
  const compact = width < COMPACT_STAGE_BREAKPOINT;
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

