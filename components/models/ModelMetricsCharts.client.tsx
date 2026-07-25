"use client";

import { LinePath } from "@visx/shape";
import { scaleLinear, scaleTime } from "@visx/scale";

type Point = Record<string, string | number | null> & { bucket_start: string };
export type Metric = { key: string; title: string; unit: string; shortTitle: string };

const common: Metric[] = [
  { key: "requests_total", title: "Request volume", shortTitle: "Requests", unit: "requests" },
  { key: "success_rate", title: "Request success rate", shortTitle: "Success rate", unit: "%" },
  { key: "latency_avg_ms", title: "Average API latency", shortTitle: "Average latency", unit: "ms" },
  { key: "latency_p95_ms", title: "P95 API latency", shortTitle: "P95 latency", unit: "ms" },
];

const typeMetrics: Record<string, Metric[]> = {
  chat: [
    { key: "input_tokens", title: "Input token usage", shortTitle: "Input tokens", unit: "tokens" },
    { key: "output_tokens", title: "Output token usage", shortTitle: "Output tokens", unit: "tokens" },
    { key: "ttft_avg_ms", title: "Time to first token", shortTitle: "TTFT", unit: "ms" },
  ],
  image: [{ key: "images_generated", title: "Images generated", shortTitle: "Images", unit: "images" }],
  video: [
    { key: "videos_generated", title: "Videos generated", shortTitle: "Videos", unit: "videos" },
    { key: "video_seconds_generated", title: "Generated video seconds", shortTitle: "Video seconds", unit: "seconds" },
    { key: "jobs_started", title: "Video jobs started", shortTitle: "Jobs", unit: "jobs" },
    { key: "job_success_rate", title: "Video job success rate", shortTitle: "Job success", unit: "%" },
  ],
};

export function metricsForType(modelType: "chat" | "image" | "video") {
  return [...common, ...typeMetrics[modelType]];
}

export function metricValue(point: Point, key: string): number | null {
  const raw = point[key];
  return typeof raw === "number" && Number.isFinite(raw) ? raw : typeof raw === "string" && /^\d+(?:\.\d+)?$/.test(raw) ? Number(raw) : null;
}

export function hasChartableSeries(points: Point[], metric: Metric) {
  return points.filter((point) => {
    const metricNumber = metricValue(point, metric.key);
    return metricNumber !== null && metricNumber !== 0;
  }).length > 1;
}

function formatMetric(metric: Metric, number: number) {
  if (metric.unit === "%") return new Intl.NumberFormat("en-US", { style: "percent", maximumFractionDigits: 1 }).format(number);
  if (metric.unit === "ms") return new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(number) + " ms";
  return new Intl.NumberFormat("en-US", { maximumFractionDigits: 1, notation: number >= 1_000_000 ? "compact" : "standard" }).format(number) + " " + metric.unit;
}

function formatDay(value: string) {
  return new Intl.DateTimeFormat("en-GB", { month: "short", day: "numeric", timeZone: "UTC" }).format(new Date(value));
}

function MetricChart({ points, metric }: { points: Point[]; metric: Metric }) {
  const usable = points.filter((point) => {
    const number = metricValue(point, metric.key);
    return number !== null && number !== 0;
  });
  const width = 720;
  const height = 220;
  const padding = { top: 28, right: 24, bottom: 32, left: 24 };
  const values = usable.map((point) => metricValue(point, metric.key) ?? 0);
  const x = scaleTime({ domain: [new Date(usable[0].bucket_start), new Date(usable[usable.length - 1].bucket_start)], range: [padding.left, width - padding.right] });
  const max = Math.max(...values, 1);
  const min = Math.min(...values, 0);
  const y = scaleLinear({ domain: [Math.max(0, min - (max - min) * 0.12), max * 1.12], range: [height - padding.bottom, padding.top], nice: true });
  const latest = values.at(-1) ?? 0;

  return (
    <article className="rounded-2xl border border-border/60 bg-card/55 p-4 shadow-sm backdrop-blur">
      <div className="flex items-end justify-between gap-3">
        <div><h3 className="font-semibold">{metric.title}</h3><p className="mt-1 text-xs text-muted-foreground">Daily observed LLM7 activity</p></div>
        <p className="text-right text-sm font-semibold">{formatMetric(metric, latest)}<span className="block text-[11px] font-normal text-muted-foreground">latest</span></p>
      </div>
      <svg viewBox={"0 0 " + width + " " + height} role="img" aria-label={metric.title + " trend"} className="mt-4 w-full overflow-visible">
        <defs><linearGradient id={"gradient-" + metric.key} x1="0" x2="1"><stop stopColor="#8b5cf6" /><stop offset="1" stopColor="#06b6d4" /></linearGradient></defs>
        {[0.25, 0.5, 0.75].map((part) => <line key={part} x1={padding.left} x2={width - padding.right} y1={padding.top + (height - padding.top - padding.bottom) * part} y2={padding.top + (height - padding.top - padding.bottom) * part} stroke="currentColor" opacity="0.09" />)}
        <LinePath data={usable} x={(point) => x(new Date(point.bucket_start)) ?? 0} y={(point) => y(metricValue(point, metric.key) ?? 0) ?? 0} stroke={"url(#gradient-" + metric.key + ")"} strokeWidth={3} />
        {usable.map((point) => <circle key={point.bucket_start} cx={x(new Date(point.bucket_start)) ?? 0} cy={y(metricValue(point, metric.key) ?? 0) ?? 0} r="3.5" fill="#06b6d4" stroke="currentColor" strokeWidth="1.5" />)}
        <text x={padding.left} y={height - 8} className="fill-muted-foreground text-[11px]">{formatDay(usable[0].bucket_start)}</text>
        <text x={width - padding.right} y={height - 8} textAnchor="end" className="fill-muted-foreground text-[11px]">{formatDay(usable[usable.length - 1].bucket_start)}</text>
      </svg>
    </article>
  );
}

export default function ModelMetricsCharts({ modelType, points }: { modelType: "chat" | "image" | "video"; points: Point[] }) {
  const chartable = metricsForType(modelType).filter((metric) => hasChartableSeries(points, metric));
  if (!chartable.length) return null;

  return (
    <section aria-labelledby="metrics-charts-heading">
      <div className="mb-5"><h2 id="metrics-charts-heading" className="text-2xl font-semibold">Usage trends</h2><p className="mt-1 text-sm text-muted-foreground">Only metrics with enough observed history are shown.</p></div>
      <div className="grid gap-4 lg:grid-cols-2">{chartable.map((metric) => <MetricChart key={metric.key} points={points} metric={metric} />)}</div>
    </section>
  );
}

