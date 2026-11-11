import React from "react";
import { Radar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
} from "chart.js";
import { useTranslation } from "react-i18next";
import { useChartThemeColors, CHART_FILL_COLORS } from "../../utils/hooks/useChartThemeColors";
const RadarChart = (state) => {
  const { t } = useTranslation();
  const chartColors = useChartThemeColors();

  ChartJS.register(
    RadialLinearScale,
    PointElement,
    LineElement,
    Filler,
    Tooltip,
    Legend,
  );
  const labels = state?.chartLabels || [
    t("Sample Collected"),
    t("Sample Not Collected"),
    t("Sample Received"),
    t("Sample Rejected"),
    t("Sample Approved"),
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
        label: t("Radar Chart"),
        data: chartValues,
        backgroundColor: "rgba(51, 122, 183, 0.35)",
        borderColor: [
          "rgba(252, 186, 3)",
          "rgba(99,104,116,0.8)",
          "rgba(51, 122, 183)",
          "rgba(237, 21, 21)",
          "rgba(25, 163, 18)",
        ],
        borderWidth: 3,
        hoverOffset: 8,
      },
    ],
  };

  return (
    <div style={{ width: "100%", height: "90%" }}>
      <Radar
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
            r: {
              beginAtZero: true,
              ticks: {
                stepSize: 1,
                color: chartColors.text,
                backdropColor: "transparent",
              },
              grid: { color: chartColors.grid },
              angleLines: { color: chartColors.grid },
              pointLabels: { color: chartColors.text },
            },
          },
        }}
      />
    </div>
  );
};
export default RadarChart;
