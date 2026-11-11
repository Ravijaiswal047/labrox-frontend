import React from "react";
import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Tooltip,
  Legend,
} from "chart.js";
import { Line } from "react-chartjs-2";
import moment from "moment";

import { useTranslation } from "react-i18next";
ChartJS.register(
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Tooltip,
  Legend,
);

const { t } = useTranslation();

function MultiAxisLineChart({ data1 }) {
  const data = {
    labels:
      data1 && data1.length > 0
        ? data1.map((ele) => moment(ele?.Date).format("DD MMM"))
        : [],
    datasets: [
      {
        label: t("Revenue"),
        data:
          data1 && data1.length > 0
            ? data1.map((ele) => ele?.TotalNetAmount)
            : [],
        borderColor: "rgba(75,192,192,1)",
        backgroundColor: "rgba(75,192,192,0.2)",
        yAxisID: "y-axis-1",
        fill: true,
        tension: 0.4,
      },
      {
        label: t("Bookings"),
        data:
          data1 && data1.length > 0
            ? data1.map((ele) => ele?.TotalReceiptBooked)
            : [],
        borderColor: "rgba(153,102,255,1)",
        backgroundColor: "rgba(153,102,255,0.2)",
        yAxisID: "y-axis-2",
        fill: true,
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
          beginAtZero: true,
        },
      },
      "y-axis-2": {
        type: "linear",
        position: "right",
        ticks: {
          beginAtZero: true,
        },
      },
    },
    plugins: {
      legend: {
        position: "top",
      },
    },
  };

  return (
    <div style={{ width: "100%", height: "100%" }}>
      <Line data={data} options={options} />
    </div>
  );
}

export default MultiAxisLineChart;
