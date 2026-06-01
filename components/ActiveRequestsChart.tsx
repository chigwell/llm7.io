"use client";

import React, { useMemo, useCallback, useState, useEffect } from 'react';
import { AreaClosed, Line, Bar } from '@visx/shape';
import { curveMonotoneX } from '@visx/curve';
import { GridRows, GridColumns } from '@visx/grid';
import { scaleTime, scaleLinear } from '@visx/scale';
import { withTooltip, Tooltip, TooltipWithBounds, defaultStyles } from '@visx/tooltip';
import { WithTooltipProvidedProps } from '@visx/tooltip/lib/enhancers/withTooltip';
import { localPoint } from '@visx/event';
import { LinearGradient } from '@visx/gradient';
import { max, extent, bisector } from 'd3-array';
import { timeFormat } from 'd3-time-format';
import { useTheme } from 'next-themes';

// Define the data structure for API response
interface ApiResponse {
  message: string;
  active_requests_last_60s: number;
}

// Define the data structure for our chart
interface ChartData {
  date: Date;
  value: number;
}

type TooltipData = ChartData;

// Maximum number of data points to keep
const MAX_DATA_POINTS = 500;
const Z_INDEX = { value: 50, time: 10 };

// Initial empty data array
const initialData: ChartData[] = [];

export default function ActiveRequestsChart() {
  const { theme, systemTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [data, setData] = useState<ChartData[]>(initialData);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dimensions, setDimensions] = useState({ width: 768, height: 200 });

  // Get the current theme, defaulting to system theme if not explicitly set
  const currentTheme = theme === "system" ? systemTheme : theme;
  const isDarkTheme = currentTheme === "dark";

  // Update dimensions on window resize
  useEffect(() => {
    const updateDimensions = () => {
      const container = document.getElementById('chart-container');
      if (container) {
        setDimensions({
          width: container.offsetWidth,
          height: 200
        });
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  // Theme-based colors
  const colors = useMemo(() => {
    if (isDarkTheme) {
      return {
        background: '#1e293b',
        background2: '#0f172a',
        accentColor: '#8b5cf6',
        accentColorDark: '#a78bfa',
        gridColor: '#334155',
        textColor: '#e2e8f0',
        tooltipBg: '#1e293b',
        tooltipBorder: '#475569',
      };
    } else {
      return {
        background: '#f8fafc',
        background2: '#e2e8f0',
        accentColor: '#6366f1',
        accentColorDark: '#4f46e5',
        gridColor: '#cbd5e1',
        textColor: '#1e293b',
        tooltipBg: '#ffffff',
        tooltipBorder: '#e2e8f0',
      };
    }
  }, [isDarkTheme]);

  const tooltipStyles = {
    ...defaultStyles,
    background: colors.tooltipBg,
    border: `1px solid ${colors.tooltipBorder}`,
    color: colors.textColor,
    borderRadius: '6px',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
  };

  // Format date for display
  const formatDate = timeFormat("%H:%M:%S");

  // Accessors
  const getDate = (d: ChartData) => d.date;
  const getValue = (d: ChartData) => d.value;
  const bisectDate = bisector<ChartData, Date>((d) => d.date).left;

  // Fetch data from API
  const fetchData = useCallback(async () => {
    try {
      const response = await fetch('https://api.llm7.io/ping');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const result: ApiResponse = await response.json();
      const currLevel = result.active_requests_last_60s;

      // Add new data point
      const newDataPoint: ChartData = {
        date: new Date(),
        value: currLevel,
      };

      // Update data, keeping only the latest MAX_DATA_POINTS
      setData(prevData => {
        const updatedData = [...prevData, newDataPoint];
        if (updatedData.length > MAX_DATA_POINTS) {
          return updatedData.slice(-MAX_DATA_POINTS);
        }
        return updatedData;
      });

      setError(null);
    } catch (err) {
      console.error('Error fetching data:', err);
      //setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Set up interval to fetch data every second
  useEffect(() => {
    setMounted(true);

    // Initial fetch
    fetchData();

    // Set up interval for subsequent fetches
    const intervalId = setInterval(fetchData, 1000);

    // Clean up interval on unmount
    return () => clearInterval(intervalId);
  }, [fetchData]);

  // Don't render until mounted to avoid hydration mismatch
  if (!mounted) {
    return (
      <div className="w-full h-64 bg-card rounded-lg animate-pulse"></div>
    );
  }

  // If there's an error, show error message
  if (error) {
    return (
      <div className="w-full h-64 bg-card rounded-lg flex items-center justify-center">
        <div className="text-center p-4">
          <p className="text-destructive mb-2">Error loading data</p>
          <p className="text-muted-foreground text-sm">{error}</p>
        </div>
      </div>
    );
  }

  // If still loading or no data, show loading state
  if (isLoading || data.length === 0) {
    return (
      <div className="w-full h-64 bg-card rounded-lg flex items-center justify-center">
        <div className="text-center p-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
          <p className="text-muted-foreground">Loading data...</p>
        </div>
      </div>
    );
  }

  // Return the chart component with props
  return (
    <div id="chart-container" className="w-full">
      <AreaChart
        data={data}
        colors={colors}
        tooltipStyles={tooltipStyles}
        formatDate={formatDate}
        getDate={getDate}
        getValue={getValue}
        bisectDate={bisectDate}
        width={dimensions.width}
        height={dimensions.height}
      />
    </div>
  );
}

// The actual chart component
type AreaChartProps = {
  data: ChartData[];
  colors: {
    background: string;
    background2: string;
    accentColor: string;
    accentColorDark: string;
    gridColor: string;
    textColor: string;
    tooltipBg: string;
    tooltipBorder: string;
  };
  tooltipStyles: React.CSSProperties;
  formatDate: (date: Date) => string;
  getDate: (d: ChartData) => Date;
  getValue: (d: ChartData) => number;
  bisectDate: (array: ChartData[], x: Date) => number;
  width: number;
  height: number;
  margin?: { top: number; right: number; bottom: number; left: number };
};

const AreaChart = withTooltip<AreaChartProps, TooltipData>(
  ({
    data,
    colors,
    tooltipStyles,
    formatDate,
    getDate,
    getValue,
    bisectDate,
    width,
    height,
    margin = { top: 20, right: 20, bottom: 30, left: 50 },
    showTooltip,
    hideTooltip,
    tooltipData,
    tooltipTop = 0,
    tooltipLeft = 0,
  }: AreaChartProps & WithTooltipProvidedProps<TooltipData>) => {
    // Ensure we have valid dimensions
    if (!width || !height || width < 10 || height < 10) {
      return (
        <div className="w-full h-64 bg-card rounded-lg flex items-center justify-center">
          <div className="text-center p-4">
            <p className="text-muted-foreground">Loading chart...</p>
          </div>
        </div>
      );
    }

    // bounds
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    // scales
    const dateScale = useMemo(
      () =>
        scaleTime({
          range: [margin.left, innerWidth + margin.left],
          domain: extent(data, getDate) as [Date, Date],
        }),
      [innerWidth, margin.left, data],
    );
    const valueScale = useMemo(
      () =>
        scaleLinear({
          range: [innerHeight + margin.top, margin.top],
          domain: [0, (max(data, getValue) || 0) + innerHeight / 3],
          nice: true,
        }),
      [margin.top, innerHeight, data],
    );

    // tooltip handler
    const handleTooltip = useCallback(
      (event: React.TouchEvent<SVGRectElement> | React.MouseEvent<SVGRectElement>) => {
        const { x } = localPoint(event) || { x: 0 };
        const x0 = dateScale.invert(x);
        // FIX: Removed the third argument from bisectDate
        const index = bisectDate(data, x0);
        const d0 = data[index - 1];
        const d1 = data[index];
        let d = d0;
        if (d1 && getDate(d1)) {
          d = x0.valueOf() - getDate(d0).valueOf() > getDate(d1).valueOf() - x0.valueOf() ? d1 : d0;
        }
        showTooltip({
          tooltipData: d,
          tooltipLeft: x,
          tooltipTop: valueScale(getValue(d)),
        });
      },
      [showTooltip, valueScale, dateScale, data, getDate, getValue, bisectDate],
    );

    return (
      <div className="w-full flex flex-col items-center">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="text-center mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
              Active Requests (Last 60 Seconds)
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Real-time monitoring of API requests
            </p>
          </div>
        </div>
        <div className="bg-card rounded-lg p-4 w-full max-w-4xl flex justify-center">
          <div className="relative">
            <svg width={width} height={height}>
              <rect
                x={0}
                y={0}
                width={width}
                height={height}
                fill="url(#area-background-gradient)"
                rx={14}
              />
              <LinearGradient id="area-background-gradient" from={colors.background} to={colors.background2} />
              <LinearGradient id="area-gradient" from={colors.accentColor} to={colors.accentColor} toOpacity={0.1} />
              <GridRows
                left={margin.left}
                scale={valueScale}
                width={innerWidth}
                strokeDasharray="1,3"
                stroke={colors.gridColor}
                strokeOpacity={0.5}
                pointerEvents="none"
              />
              <GridColumns
                top={margin.top}
                scale={dateScale}
                height={innerHeight}
                strokeDasharray="1,3"
                stroke={colors.gridColor}
                strokeOpacity={0.2}
                pointerEvents="none"
              />
              <AreaClosed<ChartData>
                data={data}
                x={(d) => dateScale(getDate(d)) ?? 0}
                y={(d) => valueScale(getValue(d)) ?? 0}
                yScale={valueScale}
                strokeWidth={1}
                stroke="url(#area-gradient)"
                fill="url(#area-gradient)"
                curve={curveMonotoneX}
              />
              <Bar
                x={margin.left}
                y={margin.top}
                width={innerWidth}
                height={innerHeight}
                fill="transparent"
                rx={14}
                onTouchStart={handleTooltip}
                onTouchMove={handleTooltip}
                onMouseMove={handleTooltip}
                onMouseLeave={() => hideTooltip()}
              />
              {tooltipData && (
                <g>
                  <Line
                    from={{ x: tooltipLeft, y: margin.top }}
                    to={{ x: tooltipLeft, y: innerHeight + margin.top }}
                    stroke={colors.accentColorDark}
                    strokeWidth={2}
                    pointerEvents="none"
                    strokeDasharray="5,2"
                  />
                  <circle
                    cx={tooltipLeft}
                    cy={tooltipTop + 1}
                    r={4}
                    fill="black"
                    fillOpacity={0.1}
                    stroke="black"
                    strokeOpacity={0.1}
                    strokeWidth={2}
                    pointerEvents="none"
                  />
                  <circle
                    cx={tooltipLeft}
                    cy={tooltipTop}
                    r={4}
                    fill={colors.accentColorDark}
                    stroke="white"
                    strokeWidth={2}
                    pointerEvents="none"
                  />
                </g>
              )}
            </svg>
            {tooltipData && (
              <div className="absolute top-0 left-0">
                <TooltipWithBounds
                  key={Math.random()}
                  top={tooltipTop -40}
                  left={tooltipLeft +12}
                  style={{ ...tooltipStyles, zIndex: Z_INDEX.value, pointerEvents: "none" }}
                >
                  {`${getValue(tooltipData)} requests`}
                </TooltipWithBounds>

                <Tooltip
                  top={innerHeight + margin.top - 14}
                  left={tooltipLeft}
                  style={{
                    ...defaultStyles,
                    ...tooltipStyles,
                    minWidth: 72,
                    textAlign: "center",
                    transform: "translateX(-50%)",
                    zIndex: Z_INDEX.time,
                    pointerEvents: "none",
                  }}
                >
                  {formatDate(getDate(tooltipData))}
                </Tooltip>

              </div>
            )}
          </div>
        </div>
        <p className="mt-3 max-w-4xl text-center text-xs text-muted-foreground/70">
          For full detailed numbers of the status of api.llm7.io,{' '}
          <a
            href="https://status.llm7.io/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary/80 underline underline-offset-4 hover:text-primary"
          >
            open the status dashboard
          </a>
          .
        </p>
      </div>
    );
  },
);
