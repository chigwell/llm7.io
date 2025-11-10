"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import Switch from "react-switch";
import axios from "axios";
// amCharts v5
import * as am5 from "@amcharts/amcharts5";
import * as am5xy from "@amcharts/amcharts5/xy";
import am5themes_Animated from "@amcharts/amcharts5/themes/Animated";
import am5themes_Dark from "@amcharts/amcharts5/themes/Dark";
import { useTheme } from "next-themes";

const SUMMARY_URL = "https://ee137.uk/llm7-usage-summary";

type Point = { bucket: string; total_tokens: number };

export default function UsageSummaryChartCard() {
  const { theme, systemTheme } = useTheme();
  const resolved = theme === "system" ? systemTheme : theme;
  const isDark = resolved === "dark";

  const labelFill = isDark ? am5.color(0xe2e8f0) : am5.color(0x1f2937);

  const [range, setRange] = useState<"24h" | "7d">("7d");
  const [loading, setLoading] = useState(false);
  const [points, setPoints] = useState<Point[]>([]);

  const chartDivRef = useRef<HTMLDivElement | null>(null);
  const chartRef = useRef<{
    root: am5.Root;
    xAxis: am5xy.CategoryAxis<am5xy.AxisRenderer>;
    colSeries: am5xy.ColumnSeries;
    //lineSeries: am5xy.LineSeries;
  } | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const fmtBucket = useCallback((isoLike: string, mode: "hour" | "day") => {
    const d = new Date(isoLike.replace(" ", "T") + "Z");
    if (mode === "hour") {
      return d.toLocaleString(undefined, {
        month: "short",
        day: "2-digit",
        hour: "2-digit",
        hour12: false,
      });
    }
    return d.toLocaleDateString(undefined, { month: "short", day: "2-digit" });
  }, []);

  const loadData = useCallback(async () => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setLoading(true);

    const winParam = range === "24h" ? "24h" : "7d";

    try {
      let res;
      try {
        res = await axios.get(`${SUMMARY_URL}?range=${winParam}`, { signal: controller.signal });
      } catch (e: any) {
        if (winParam === "7d" && e?.response?.status === 400) {
          res = await axios.get(`${SUMMARY_URL}?range=day`, { signal: controller.signal });
        } else {
          throw e;
        }
      }

      const payload = res?.data || {};
      const groupKey: "hour" | "day" = payload.group_by === "hour" ? "hour" : "day";
      const stats = Array.isArray(payload.stats) ? payload.stats : [];

      const mapped: Point[] = stats
        .slice()
        .reverse()
        .map((r: any) => ({
          bucket: fmtBucket(r[groupKey], groupKey),
          total_tokens: Number(r.in_tokens || 0) + Number(r.out_tokens || 0),
          //requests: Number(r.requests || 0),
        }));

      setPoints(mapped);
    } catch (e: any) {
      if (!(e && (e.code === "ERR_CANCELED" || e.name === "CanceledError" || e.message === "canceled"))) {
        console.error("Failed to load summary stats", e);
        setPoints([]);
      }
    } finally {
      if (abortRef.current === controller) abortRef.current = null;
      setLoading(false);
    }
  }, [range, fmtBucket]);

  useEffect(() => {
    loadData();
  }, [range, loadData]);

  // full cleanup on unmount
  useEffect(() => {
    return () => {
      abortRef.current?.abort();
      if (chartRef.current) {
        chartRef.current.root.dispose();
        chartRef.current = null;
      }
    };
  }, []);

  // tear down chart on theme change so we can rebuild with the new theme
  useEffect(() => {
    if (chartRef.current) {
      chartRef.current.root.dispose();
      chartRef.current = null;
    }
  }, [isDark]);

  // also tear down while "loading" to show just the spinner
  useEffect(() => {
    if (loading && chartRef.current) {
      chartRef.current.root.dispose();
      chartRef.current = null;
    }
  }, [loading]);

  // build chart
  useEffect(() => {
    if (loading) return;
    if (!chartDivRef.current || chartRef.current) return;

    const root = am5.Root.new(chartDivRef.current);
    root.setThemes(isDark ? [am5themes_Animated.new(root), am5themes_Dark.new(root)] : [am5themes_Animated.new(root)]);
    root.numberFormatter.set("numberFormat", "#,###");

    const chart = root.container.children.push(
      am5xy.XYChart.new(root, {
        panX: false,
        panY: false,
        wheelX: "panX",
        wheelY: "zoomX",
        paddingLeft: 0,
        paddingRight: 0,
        layout: root.verticalLayout,
      }),
    );

    const colorSet = chart.get("colors") as am5.ColorSet | undefined;

    chart.set("scrollbarX", am5.Scrollbar.new(root, { orientation: "horizontal" }));
    chart.set("cursor", am5xy.XYCursor.new(root, { behavior: "none" }));

    const xRenderer = am5xy.AxisRendererX.new(root, {
      minGridDistance: 30,
      minorGridEnabled: false,
    });
    xRenderer.labels.template.setAll({
      rotation: -45,
      centerY: am5.p50,
      centerX: am5.p100,
      paddingTop: 10,
      maxWidth: 100,
      oversizedBehavior: "truncate",
      fill: labelFill,
    });

    const xAxis = chart.xAxes.push(
      am5xy.CategoryAxis.new(root, {
        categoryField: "bucket",
        renderer: xRenderer,
        tooltip: am5.Tooltip.new(root, {}),
      }),
    );

    const yAxisLeft = chart.yAxes.push(
      am5xy.ValueAxis.new(root, {
        renderer: am5xy.AxisRendererY.new(root, { strokeOpacity: 0.1 }),
        min: 0,
        extraMax: 0.05,
      }),
    );

    const yAxisRightRenderer = am5xy.AxisRendererY.new(root, { opposite: true });
    const yAxisRight = chart.yAxes.push(
      am5xy.ValueAxis.new(root, {
        renderer: yAxisRightRenderer,
        min: 0,
        extraMax: 0.05,
      }),
    );
    yAxisRightRenderer.grid.template.set("forceHidden", true);

    const colSeries = chart.series.push(
      am5xy.ColumnSeries.new(root, {
        name: "Tokens",
        xAxis,
        yAxis: yAxisLeft,
        valueYField: "total_tokens",
        categoryXField: "bucket",
        tooltip: am5.Tooltip.new(root, {
          pointerOrientation: "horizontal",
          labelText: "{valueY} {name}",
        }),
      }),
    );

    colSeries.columns.template.setAll({
      strokeOpacity: 0,
      cornerRadiusTL: 6,
      cornerRadiusTR: 6,
      tooltipY: am5.percent(10),
    });

    // Safe colour adapter (no am5xy.Column type needed)
    colSeries.columns.template.adapters.add("fill", (_fill, target) => {
      const idx = (colSeries.columns as unknown as { indexOf: (t: unknown) => number }).indexOf(target);
      const safeIdx = idx >= 0 ? idx : 0;
      return colorSet?.getIndex(safeIdx) ?? am5.color(0x94a3b8);
    });

    /*const lineSeries = chart.series.push(
      am5xy.LineSeries.new(root, {
        name: "Requests",
        xAxis,
        yAxis: yAxisRight,
        valueYField: "requests",
        categoryXField: "bucket",
        maskBullets: false,
        tooltip: am5.Tooltip.new(root, {
          pointerOrientation: "horizontal",
          labelText: "{valueY} {name}",
        }),
      }),
    );
    lineSeries.strokes.template.setAll({ strokeWidth: 3 });
    lineSeries.bullets.push(() =>
      am5.Bullet.new(root, {
        sprite: am5.Circle.new(root, {
          radius: 5,
          strokeWidth: 2,
          stroke: root.interfaceColors.get("background"),
          fill: lineSeries.get("fill"),
        }),
      }),
    );*/

    const legend = chart.children.push(am5.Legend.new(root, { centerX: am5.p50, x: am5.p50 }));
    legend.data.setAll(chart.series.values);

    colSeries.appear();
    chart.appear(800, 100);

    chartRef.current = { root, xAxis, colSeries }; //, lineSeries

    if (points.length) {
      xAxis.data.setAll(points);
      colSeries.data.setAll(points);
      //lineSeries.data.setAll(points);
    }

    // set label colours after creation
    yAxisLeft.get("renderer")!.labels.template.setAll({ fill: labelFill });
    yAxisRight.get("renderer")!.labels.template.setAll({ fill: labelFill });
    legend.labels.template.setAll({ fill: labelFill });
    legend.valueLabels.template.setAll({ fill: labelFill });

    return () => {
      chartRef.current?.root.dispose();
      chartRef.current = null;
    };
  }, [loading, points, isDark, labelFill]);

  // push data if chart exists
  useEffect(() => {
    if (!chartRef.current || loading) return;
    const { xAxis, colSeries } = chartRef.current; //, lineSeries
    xAxis.data.setAll(points);
    colSeries.data.setAll(points);
    //lineSeries.data.setAll(points);
  }, [points, loading]);

  return (
    <div className="w-full">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="w-full max-w-3xl mx-auto">
          <div className="w-full bg-card rounded-lg shadow-sm border border-border">
            <div className="flex items-center gap-3 px-4 py-3 border-b border-border">
              <div>
                <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-1">Global usage</h2>
                <p className="text-muted-foreground text-sm">Aggregated totals across all users</p>
              </div>
              <div className="ml-auto flex items-center gap-2">
                <span className="text-xs opacity-75">24h</span>
                <Switch
                  checked={range === "7d"}
                  onChange={(checked: boolean) => {
                    const next = checked ? "7d" : "24h";
                    if (next === range) return;
                    setLoading(true);
                    setRange(next);
                  }}
                  disabled={loading}
                  height={22}
                  width={44}
                  handleDiameter={18}
                  uncheckedIcon={false}
                  checkedIcon={false}
                  offColor="#e5e7eb"
                  onColor="#22c55e"
                />
                <span className="text-xs opacity-75">7d</span>
              </div>
            </div>

            <div className="px-4 py-4" style={{ minHeight: 360 }}>
              {loading ? (
                <div className="w-full h-[340px] flex items-center justify-center">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2" />
                    <p className="text-muted-foreground text-sm">Loading data...</p>
                  </div>
                </div>
              ) : (
                <div
                  key={isDark ? "dark" : "light"} // force remount on theme change
                  ref={chartDivRef}
                  id="usageSummaryChart"
                  style={{ width: "100%", height: 340 }}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
