import React from "react";
import Chart from "react-apexcharts";

const UniversalChart = ({
  title = "Chart Title",
  description = "",
  type = "bar", // bar, column, stackedBar, groupedBar
  height = 280,
  stacked = false,
  horizontal = false,
  categories = [],
  series = [],
  colors = [],
  legend = true,
  dataLabels = false,
  tooltip = true,
  grid = true,
  distributed=false,
  yAxisFormatter = null, // new prop for formatting Y-axis labels
}) => {
  const options = {
    chart: {
      type: "bar",
      stacked: stacked,
      toolbar: { show: false },
      zoom: { enabled: false },
    },
    plotOptions: {
      bar: {
        horizontal: horizontal,
        columnWidth: "50%",
        borderRadius: 4,
        distributed: distributed,
      },
    },
    colors: colors,
    dataLabels: {
      enabled: dataLabels,
    },
    stroke: {
      show: true,
      width: 2,
      colors: ["transparent"],
    },
    xaxis: {
      categories: categories,
      labels: { style: { fontSize: "12px" } },
    },
    yaxis: {
      labels: {
        style: { fontSize: "12px" },
        formatter: yAxisFormatter || undefined, // use custom if provided, else default
      },
    },
    legend: {
      show: legend,
      position: "top",
      horizontalAlign: "center",
    },
    grid: {
      show: grid,
      strokeDashArray: 3,
    },
    tooltip: {
      enabled: tooltip,
      y: {
        formatter: yAxisFormatter || undefined, // match tooltip formatting
      },
    },
    fill: {
      opacity: 1,
    },
  };

  return (
    <div style={{ background: "#fff", padding: "16px", borderRadius: "8px" }}>
      <h3 style={{ margin: "0 0 4px 0" }}>{title}</h3>
      {description && (
        <p style={{ margin: "0 0 12px 0", color: "#6b7280", fontSize: "14px" }}>
          {description}
        </p>
      )}
      <Chart
        options={options}
        series={series}
        type={type}
        height={height}
        width="100%"
      />
    </div>
  );
};

export default UniversalChart;
