import React from "react";
import { useTranslation } from "react-i18next";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import { useChartThemeColors } from "../../utils/hooks/useChartThemeColors";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
);

const LineChartPayment = ({ state }) => {
  const { t } = useTranslation();
  const chartColors = useChartThemeColors();

  const canvasRef = React.useRef(null);

  // Create gradient fill
  const getGradient = (ctx) => {
    const gradient = ctx.createLinearGradient(0, 0, 0, 400);
    gradient.addColorStop(0, "rgba(153, 102, 255, 0.6)");
    gradient.addColorStop(1, "rgba(255, 255, 255, 0)");
    return gradient;
  };

  const data = {
    labels: [
      t("Cheque"),
      t("CreditCard"),
      t("DebitCard"),
      t("Cash"),
      t("Paytm"),
      t("OnlinePayment"),
      t("InternetBanking"),
      t("Credit"),
    ],
    datasets: [
      {
        label: t("Payment Methods"),
        data: [
          state?.cheque,
          state?.creditCard,
          state?.debitCard,
          state?.cash,
          state?.paytm,
          state?.onlinePayment,
          state?.internetBanking,
          state?.credit,
        ],
        fill: true, // Enable fill under the line
        backgroundColor: (context) => {
          const chart = context.chart;
          const { ctx } = chart;
          return getGradient(ctx);
        },
        borderColor: "#857BEF",
        borderWidth: 2.5,
        pointRadius: 4,
        pointHoverRadius: 8,
        pointBackgroundColor: [
          "#FF5733", // Cheque
          "#33FF57", // CreditCard
          "#3357FF", // DebitCard
          "red", // Cash
          "#A833FF", // Paytm
          "#FFD700", // OnlinePayment
          "#00FFFF", // InternetBanking
          "#FF1493", // Credit
        ],
        pointBorderColor: "#fff",
        pointHoverBackgroundColor: "#fff",
        pointHoverBorderColor: "#9966FF",
        tension: 0.4, // Smooth curves
      },
    ],
  };

  const options = {
    maintainAspectRatio: false,
    responsive: true,
    plugins: {
      legend: {
        display: true,
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
        displayColors: true, // Hide color box
        callbacks: {
          label: (context) => `${context.label}: ${context.raw}`,
        },
      },
    },
    scales: {
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
      y: {
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
    <div className="col-sm-12" style={{ width: "100%", height: "78%" }}>
      <Line ref={canvasRef} data={data} options={options} />
    </div>
  );
};

export default LineChartPayment;
