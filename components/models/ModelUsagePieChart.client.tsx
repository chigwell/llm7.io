"use client";

import Link from "next/link";
import type { MouseEvent } from "react";
import { useMemo, useRef, useState } from "react";
import { modelPath } from "@/lib/models/routes";

export type ModelUsageDatum = {
  modelId: string;
  slug: string;
  requests: number;
};

type Segment = ModelUsageDatum & {
  color: string;
  endAngle: number;
  percent: number;
  startAngle: number;
};

const palette = [
  "#22c55e",
  "#38bdf8",
  "#f59e0b",
  "#f43f5e",
  "#a78bfa",
  "#14b8a6",
  "#f97316",
  "#6366f1",
  "#84cc16",
  "#ec4899",
  "#06b6d4",
  "#eab308",
  "#10b981",
  "#8b5cf6",
  "#ef4444",
  "#0ea5e9",
  "#d946ef",
  "#65a30d",
];

const size = 420;
const center = size / 2;
const outerRadius = 176;
const innerRadius = 104;
const startOffset = -Math.PI / 2;

const percentFormatter = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 2,
  minimumFractionDigits: 0,
  style: "percent",
});

function pointAt(angle: number, radius: number) {
  return {
    x: center + Math.cos(angle) * radius,
    y: center + Math.sin(angle) * radius,
  };
}

function describeSegment(startAngle: number, endAngle: number) {
  const end = Math.min(endAngle, startAngle + Math.PI * 2 - 0.0001);
  const largeArc = end - startAngle > Math.PI ? 1 : 0;
  const outerStart = pointAt(startAngle, outerRadius);
  const outerEnd = pointAt(end, outerRadius);
  const innerEnd = pointAt(end, innerRadius);
  const innerStart = pointAt(startAngle, innerRadius);

  return [
    `M ${outerStart.x.toFixed(3)} ${outerStart.y.toFixed(3)}`,
    `A ${outerRadius} ${outerRadius} 0 ${largeArc} 1 ${outerEnd.x.toFixed(3)} ${outerEnd.y.toFixed(3)}`,
    `L ${innerEnd.x.toFixed(3)} ${innerEnd.y.toFixed(3)}`,
    `A ${innerRadius} ${innerRadius} 0 ${largeArc} 0 ${innerStart.x.toFixed(3)} ${innerStart.y.toFixed(3)}`,
    "Z",
  ].join(" ");
}

function formatPercent(value: number) {
  if (value > 0 && value < 0.0001) return "<0.01%";
  return percentFormatter.format(value);
}

export default function ModelUsagePieChart({ data }: { data: ModelUsageDatum[] }) {
  const chartRef = useRef<HTMLDivElement | null>(null);
  const [activeSlug, setActiveSlug] = useState<string | null>(null);
  const [showTooltip, setShowTooltip] = useState(false);
  const [tooltip, setTooltip] = useState({ x: center, y: center });

  const segments = useMemo(() => {
    const usable = data.filter((item) => Number.isFinite(item.requests) && item.requests > 0).sort((left, right) => right.requests - left.requests);
    const total = usable.reduce((sum, item) => sum + item.requests, 0);
    let cursor = startOffset;

    return usable.flatMap((item, index): Segment[] => {
      const angle = total > 0 ? (item.requests / total) * Math.PI * 2 : 0;
      const gap = usable.length > 1 ? Math.min(0.012, angle * 0.2) : 0;
      const segment: Segment = {
        ...item,
        color: palette[index % palette.length],
        endAngle: cursor + angle - gap / 2,
        percent: total > 0 ? item.requests / total : 0,
        startAngle: cursor + gap / 2,
      };
      cursor += angle;
      return segment.endAngle > segment.startAngle ? [segment] : [];
    });
  }, [data]);

  const active = segments.find((segment) => segment.slug === activeSlug) ?? null;
  const leader = segments[0] ?? null;
  const legend = segments.slice(0, 10);

  if (!segments.length) return null;

  const updateTooltip = (event: MouseEvent<SVGPathElement>) => {
    const bounds = chartRef.current?.getBoundingClientRect();
    if (!bounds) return;
    setTooltip({ x: event.clientX - bounds.left, y: event.clientY - bounds.top });
  };

  return (
    <section className="mt-14" aria-labelledby="model-usage-share">
      <div className="w-full rounded-3xl border border-border/60 bg-card/55 p-5 shadow-sm backdrop-blur md:p-7">
        <div className="text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">Usage mix</p>
          <h2 id="model-usage-share" className="mt-2 text-2xl font-semibold">Model usage share</h2>
        </div>

        <div className="mx-auto mt-7 grid max-w-5xl items-center gap-7 lg:grid-cols-[minmax(0,1fr)_19rem]">
          <div ref={chartRef} className="relative mx-auto aspect-square w-full max-w-[28rem]">
            <svg viewBox={`0 0 ${size} ${size}`} role="img" aria-label="Share of requests by model" className="h-full w-full overflow-visible">
              <defs>
                <filter id="model-usage-glow" x="-25%" y="-25%" width="150%" height="150%">
                  <feDropShadow dx="0" dy="10" stdDeviation="10" floodColor="currentColor" floodOpacity="0.2" />
                </filter>
              </defs>
              <circle cx={center} cy={center} r="188" className="fill-background/70 stroke-border/70" strokeWidth="1" />
              {segments.map((segment) => {
                const isActive = activeSlug === segment.slug;
                return (
                  <path
                    key={segment.slug}
                    d={describeSegment(segment.startAngle, segment.endAngle)}
                    fill={segment.color}
                    filter={isActive ? "url(#model-usage-glow)" : undefined}
                    opacity={!activeSlug || isActive ? 1 : 0.46}
                    stroke="var(--card)"
                    strokeWidth="1.5"
                    tabIndex={0}
                    className="cursor-pointer outline-none transition-[opacity,transform,filter] duration-200 ease-out focus-visible:ring-2 focus-visible:ring-ring/50"
                    style={{ transform: isActive ? "scale(1.045)" : "scale(1)", transformBox: "fill-box", transformOrigin: "center" }}
                    aria-label={`${segment.modelId}: ${formatPercent(segment.percent)}`}
                    onBlur={() => {
                      setActiveSlug(null);
                      setShowTooltip(false);
                    }}
                    onFocus={() => {
                      setActiveSlug(segment.slug);
                      setShowTooltip(true);
                      setTooltip({ x: center, y: center });
                    }}
                    onMouseEnter={(event) => {
                      setActiveSlug(segment.slug);
                      setShowTooltip(true);
                      updateTooltip(event);
                    }}
                    onMouseLeave={() => {
                      setActiveSlug(null);
                      setShowTooltip(false);
                    }}
                    onMouseMove={updateTooltip}
                  />
                );
              })}
              <circle cx={center} cy={center} r="94" className="fill-card stroke-border/70" strokeWidth="1" />
              <text x={center} y={center - 8} textAnchor="middle" className="fill-foreground text-[18px] font-semibold">
                {leader ? formatPercent(leader.percent) : ""}
              </text>
              <text x={center} y={center + 18} textAnchor="middle" className="fill-muted-foreground text-[12px]">
                top model
              </text>
            </svg>

            {active && showTooltip ? (
              <div
                className="pointer-events-none absolute z-10 max-w-[15rem] rounded-xl border border-border/70 bg-popover px-3 py-2 text-sm shadow-lg"
                style={{ left: tooltip.x, top: tooltip.y, transform: "translate(-50%, calc(-100% - 12px))" }}
              >
                <p className="truncate font-medium text-popover-foreground">{active.modelId}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">{formatPercent(active.percent)}</p>
              </div>
            ) : null}
          </div>

          <div className="space-y-2">
            {legend.map((segment) => {
              const isActive = activeSlug === segment.slug;
              return (
                <Link
                  key={segment.slug}
                  href={modelPath(segment.slug)}
                  className={"flex min-w-0 items-center gap-3 rounded-xl border px-3 py-2 text-sm transition-all " + (isActive ? "border-primary/45 bg-primary/5" : "border-border/60 bg-background/45 hover:border-primary/35 hover:bg-accent/60")}
                  onBlur={() => setActiveSlug(null)}
                  onFocus={() => {
                    setActiveSlug(segment.slug);
                    setShowTooltip(false);
                  }}
                  onMouseEnter={() => {
                    setActiveSlug(segment.slug);
                    setShowTooltip(false);
                  }}
                  onMouseLeave={() => setActiveSlug(null)}
                >
                  <span aria-hidden="true" className="h-3 w-3 shrink-0 rounded-full" style={{ backgroundColor: segment.color }} />
                  <span className="min-w-0 flex-1 truncate font-medium">{segment.modelId}</span>
                  <span className="shrink-0 text-xs text-muted-foreground">{formatPercent(segment.percent)}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
