import React from "react";
import { Bar, Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  Title,
  BarElement,
  Tooltip,
} from "chart.js";
import { useTranslation } from "react-i18next";
import { useChartThemeColors, CHART_FILL_COLORS } from "../../utils/hooks/useChartThemeColors";
const BarChart = (state) => {
  const { t } = useTranslation();
  const chartColors = useChartThemeColors();

  ChartJS.register(CategoryScale, LinearScale, Title, BarElement, Tooltip);
  const labels = state?.chartLabels || [
    t("Collected"),
    t("Not Collected"),
    t("Received"),
    t("Rejected"),
    t("Approved"),
  ];
  const chartValues = [
    state?.state?.sampleCollectionCount,
    state?.state?.notCollectedCount,
    state?.state?.departmentReceiveCount,
    state?.state?.rejectedCount,
    state?.state?.approvedCount,
  ].slice(0, labels.length);

  const data = {
    labels,

    datasets: [
      {
        label: t("Bar Chart"),
        borderRadius: 10,
        data: chartValues,
        backgroundColor: CHART_FILL_COLORS,
        borderColor: [
          "rgba(252, 186,3)",
          "rgba(99,104,116,0.8)",
          "rgba(51, 122, 183)",
          "rgba(237, 21, 21)",
          "rgba(25, 163, 18)",
        ],
        borderWidth: 2,
        hoverOffset: 8,
      },
    ],
  };

  return (
    <div style={{ width: "100%", height: "90%" }}>
      <Bar
        data={data}
        options={{
          maintainAspectRatio: false,
          responsive: true,
          plugins: {
            legend: {
              labels: { color: chartColors.text },
            },
            tooltip: {
              backgroundColor: chartColors.tooltipBg,
              titleColor: chartColors.tooltipTitle,
              bodyColor: chartColors.tooltipBody,
            },
          },
          scales: {
            x: {
              ticks: { color: chartColors.text },
              grid: { color: chartColors.grid },
            },
            y: {
              ticks: { color: chartColors.text },
              grid: { color: chartColors.grid },
            },
          },
        }}
      />
    </div>
  );
};
export default BarChart;
