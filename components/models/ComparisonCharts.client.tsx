"use client";

import { LinePath } from "@visx/shape";
import { scaleLinear, scaleTime } from "@visx/scale";
import { hasChartableSeries, metricValue, metricsForType, type Metric } from "./ModelMetricsCharts.client";

type Point = Record<string, string | number | null> & { bucket_start: string };

function formatMetric(metric: Metric, number: number) {
  if (metric.unit === "%") return new Intl.NumberFormat("en-US", { style: "percent", maximumFractionDigits: 1 }).format(number);
  if (metric.unit === "ms") return new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(number) + " ms";
  return new Intl.NumberFormat("en-US", { maximumFractionDigits: 1, notation: number >= 1_000_000 ? "compact" : "standard" }).format(number) + " " + metric.unit;
}

function formatDay(value: string) {
  return new Intl.DateTimeFormat("en-GB", { month: "short", day: "numeric", timeZone: "UTC" }).format(new Date(value));
}

function usable(points: Point[], metric: Metric) {
  return points.filter((point) => {
    const number = metricValue(point, metric.key);
    return number !== null && number !== 0;
  });
}

function MergedMetricChart({ metric, leftName, rightName, leftPoints, rightPoints }: { metric: Metric; leftName: string; rightName: string; leftPoints: Point[]; rightPoints: Point[] }) {
  const left = usable(leftPoints, metric);
  const right = usable(rightPoints, metric);
  const all = [...left, ...right].sort((a, b) => Date.parse(a.bucket_start) - Date.parse(b.bucket_start));
  const values = all.map((point) => metricValue(point, metric.key) ?? 0);
  const width = 760;
  const height = 235;
  const padding = { top: 30, right: 24, bottom: 32, left: 24 };
  const x = scaleTime({ domain: [new Date(all[0].bucket_start), new Date(all[all.length - 1].bucket_start)], range: [padding.left, width - padding.right] });
  const max = Math.max(...values, 1);
  const min = Math.min(...values, 0);
  const y = scaleLinear({ domain: [Math.max(0, min - (max - min) * 0.12), max * 1.12], range: [height - padding.bottom, padding.top], nice: true });
  const leftLatest = metricValue(left.at(-1)!, metric.key) ?? 0;
  const rightLatest = metricValue(right.at(-1)!, metric.key) ?? 0;

  return (
    <article className="rounded-2xl border border-border/60 bg-card/55 p-4 shadow-sm backdrop-blur">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div><h3 className="font-semibold">{metric.title}</h3><p className="mt-1 text-xs text-muted-foreground">Both models on the same scale</p></div>
        <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs">
          <span className="inline-flex items-center gap-1.5"><i className="h-2.5 w-2.5 rounded-full bg-violet-500" />{leftName}: {formatMetric(metric, leftLatest)}</span>
          <span className="inline-flex items-center gap-1.5"><i className="h-2.5 w-2.5 rounded-full bg-cyan-500" />{rightName}: {formatMetric(metric, rightLatest)}</span>
        </div>
      </div>
      <svg viewBox={"0 0 " + width + " " + height} role="img" aria-label={metric.title + " comparison chart"} className="mt-4 w-full overflow-visible">
        {[0.25, 0.5, 0.75].map((part) => <line key={part} x1={padding.left} x2={width - padding.right} y1={padding.top + (height - padding.top - padding.bottom) * part} y2={padding.top + (height - padding.top - padding.bottom) * part} stroke="currentColor" opacity="0.09" />)}
        <LinePath data={left} x={(point) => x(new Date(point.bucket_start)) ?? 0} y={(point) => y(metricValue(point, metric.key) ?? 0) ?? 0} stroke="#8b5cf6" strokeWidth={3} />
        <LinePath data={right} x={(point) => x(new Date(point.bucket_start)) ?? 0} y={(point) => y(metricValue(point, metric.key) ?? 0) ?? 0} stroke="#06b6d4" strokeWidth={3} />
        {left.map((point) => <circle key={"left-" + point.bucket_start} cx={x(new Date(point.bucket_start)) ?? 0} cy={y(metricValue(point, metric.key) ?? 0) ?? 0} r="3.5" fill="#8b5cf6" stroke="currentColor" strokeWidth="1.5" />)}
        {right.map((point) => <circle key={"right-" + point.bucket_start} cx={x(new Date(point.bucket_start)) ?? 0} cy={y(metricValue(point, metric.key) ?? 0) ?? 0} r="3.5" fill="#06b6d4" stroke="currentColor" strokeWidth="1.5" />)}
        <text x={padding.left} y={height - 8} className="fill-muted-foreground text-[11px]">{formatDay(all[0].bucket_start)}</text>
        <text x={width - padding.right} y={height - 8} textAnchor="end" className="fill-muted-foreground text-[11px]">{formatDay(all[all.length - 1].bucket_start)}</text>
      </svg>
    </article>
  );
}

export default function ComparisonCharts({ modelType, leftName, rightName, leftPoints, rightPoints }: { modelType: "chat" | "image" | "video"; leftName: string; rightName: string; leftPoints: Point[]; rightPoints: Point[] }) {
  const chartable = metricsForType(modelType).filter((metric) => hasChartableSeries(leftPoints, metric) && hasChartableSeries(rightPoints, metric));
  if (!chartable.length) return null;

  return (
    <section aria-labelledby="comparison-charts-heading">
      <div className="mb-5"><h2 id="comparison-charts-heading" className="text-2xl font-semibold">Side-by-side trends</h2><p className="mt-1 text-sm text-muted-foreground">Shared charts make the observed differences easier to read. Metrics without enough history stay hidden.</p></div>
      <div className="grid gap-4">{chartable.map((metric) => <MergedMetricChart key={metric.key} metric={metric} leftName={leftName} rightName={rightName} leftPoints={leftPoints} rightPoints={rightPoints} />)}</div>
    </section>
  );
}

