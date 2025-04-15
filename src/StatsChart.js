/* StatsChart.js (Corrected) */
import React, { useRef, useEffect } from 'react';
import * as am5 from "@amcharts/amcharts5";
import * as am5xy from "@amcharts/amcharts5/xy"; // Correct import for LineSeries etc.
import am5themes_Animated from "@amcharts/amcharts5/themes/Animated";

function StatsChart({ data }) {
  const chartRef = useRef(null);

  useEffect(() => {
    if (!data || data.length === 0) {
        return;
    }

    let root = am5.Root.new(chartRef.current);

    root.setThemes([
      am5themes_Animated.new(root)
    ]);

    let chart = root.container.children.push(am5xy.XYChart.new(root, {
      panX: true,
      panY: false,
      wheelX: "panX",
      wheelY: "zoomX",
      pinchZoomX: true,
      paddingLeft: 0
    }));

    let xAxis = chart.xAxes.push(am5xy.DateAxis.new(root, {
      maxDeviation: 0.1,
      baseInterval: {
        timeUnit: "day",
        count: 1
      },
      renderer: am5xy.AxisRendererX.new(root, {
         minorGridEnabled: true,
         minGridDistance: 70
        }),
      tooltip: am5.Tooltip.new(root, {})
    }));

    let yAxis = chart.yAxes.push(am5xy.ValueAxis.new(root, {
        maxDeviation: 0.2,
        renderer: am5xy.AxisRendererY.new(root, {})
    }));

    // ***** CORRECTION HERE *****
    // Use LineSeries and configure fills for area effect
    let series = chart.series.push(am5xy.LineSeries.new(root, { // Use LineSeries
      name: "Requests",
      xAxis: xAxis,
      yAxis: yAxis,
      valueYField: "value",
      valueXField: "date",
      tooltip: am5.Tooltip.new(root, {
        labelText: "{valueY} requests on {valueX.formatDate('yyyy-MM-dd')}"
      }),
      // fillOpacity and visible for fill are set below on the template
    }));

    // Configure the fill to create the area effect
    series.fills.template.setAll({
      fillOpacity: 0.3, // Set fill opacity for area
      visible: true      // Make the fill visible
    });

    // Configure the stroke (the line itself)
    series.strokes.template.setAll({
      strokeWidth: 2
    });

    // Add bullets (optional points on the line)
     series.bullets.push(function() {
       return am5.Bullet.new(root, {
         sprite: am5.Circle.new(root, {
           radius: 3,
           // Match bullet fill to the line's stroke color for consistency
           fill: series.get("stroke"), // Use stroke color for bullet fill
           stroke: root.interfaceColors.get("background"),
           strokeWidth: 1
         })
       });
     });

    const processedData = data.map(item => ({
        date: item.date,
        value: item.requests_num
    }));

    series.data.processor = am5.DataProcessor.new(root, {
        dateFormat: "yyyy-MM-dd",
        dateFields: ["date"]
    });

    series.data.setAll(processedData);

    chart.set("cursor", am5xy.XYCursor.new(root, {
        xAxis: xAxis,
        behavior: "zoomX"
    }));

    chart.set("scrollbarX", am5.Scrollbar.new(root, {
        orientation: "horizontal"
    }));

    series.appear(1000);
    chart.appear(1000, 100);

    return () => {
      root.dispose();
    };
  }, [data]);

  return <div ref={chartRef} style={{ width: "100%", height: "300px" }}></div>;
}

export default StatsChart;