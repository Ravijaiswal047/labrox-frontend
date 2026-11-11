import React from "react";
import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import { Line } from "react-chartjs-2";
import moment from "moment";

import { useTranslation } from "react-i18next";
import { useChartThemeColors } from "../utils/hooks/useChartThemeColors";
ChartJS.register(
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Tooltip,
  Legend,
  Filler,
);

const MultiAxisLineChart = ({ data1 }) => {
  const { t } = useTranslation();
  const chartColors = useChartThemeColors();
  const canvasRef = React.useRef(null);

  // Create gradient fill for Revenue
  const getGradient1 = (ctx) => {
    const gradient = ctx.createLinearGradient(0, 0, 0, 400);
    gradient.addColorStop(0, "rgba(75,192,192,0.6)");
    gradient.addColorStop(1, "rgba(255,255,255,0)");
    return gradient;
  };

  // Create gradient fill for Bookings
  const getGradient2 = (ctx) => {
    const gradient = ctx.createLinearGradient(0, 0, 0, 400);
    gradient.addColorStop(0, "rgba(153,102,255,0.6)");
    gradient.addColorStop(1, "rgba(255,255,255,0)");
    return gradient;
  };

  const data = {
    labels:
      data1 && data1.length > 0
        ? data1.map((ele) => moment(ele?.date).format("DD MMM"))
        : [],
    datasets: [
      {
        label: t("Revenue"),

        data:
          data1 && data1.length > 0
            ? data1.map((ele) => ele?.totalNetAmount)
            : [],
        borderColor: "#4BC0C0",
        backgroundColor: (context) => {
          const chart = context.chart;
          const { ctx } = chart;
          return getGradient1(ctx);
        },
        yAxisID: "y-axis-1",
        fill: true,
        pointRadius: 4,
        pointHoverRadius: 8,
        pointBackgroundColor: "#4BC0C0",
        pointBorderColor: "#fff",
        tension: 0.4,
      },
      {
        label: t("Bookings"),
        data:
          data1 && data1.length > 0
            ? data1.map((ele) => ele?.totalReceiptBooked)
            : [],
        borderColor: "#9966FF",
        backgroundColor: (context) => {
          const chart = context.chart;
          const { ctx } = chart;
          return getGradient2(ctx);
        },
        yAxisID: "y-axis-2",
        fill: true,
        pointRadius: 4,
        pointHoverRadius: 8,
        pointBackgroundColor: "#9966FF",
        pointBorderColor: "#fff",
        tension: 0.4,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      "y-axis-1": {
        type: "linear",
        position: "left",
        ticks: {
          color: chartColors.text,
          font: {
            size: 12,
          },
          callback: (value) => value.toLocaleString(),
        },
        grid: {
          color: chartColors.grid,
          lineWidth: 0.5,
        },
      },
      "y-axis-2": {
        type: "linear",
        position: "right",
        ticks: {
          color: chartColors.text,
          font: {
            size: 12,
          },
          callback: (value) => value.toLocaleString(),
        },
        grid: {
          color: chartColors.grid,
          lineWidth: 0.5,
        },
      },
      x: {
        ticks: {
          color: chartColors.text,
          font: {
            size: 12,
          },
        },
        grid: {
          color: chartColors.grid,
          lineWidth: 0.5,
        },
      },
    },
    plugins: {
      legend: {
        position: "top",
        labels: {
          color: chartColors.text,
          font: {
            size: 12,
          },
          boxWidth: 20,
          padding: 15,
        },
      },
      tooltip: {
        backgroundColor: chartColors.tooltipBg,
        titleColor: chartColors.tooltipTitle,
        bodyColor: chartColors.tooltipBody,
        borderColor: "#9966FF",
        borderWidth: 1,
        padding: 10,
        displayColors: true,
        callbacks: {
          label: (context) =>
            `${context.dataset.label}: ${context.raw.toLocaleString()}`,
        },
      },
    },
    interaction: {
      mode: "nearest",
      intersect: false,
    },
    animation: {
      duration: 800,
      easing: "easeInOutQuad",
    },
  };

  return (
    <div style={{ width: "100%", height: "100%" }}>
      <Line ref={canvasRef} data={data} options={options} />
    </div>
  );
};

export default MultiAxisLineChart;
