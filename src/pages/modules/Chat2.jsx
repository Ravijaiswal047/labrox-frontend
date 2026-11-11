import React from "react";
import { Chart as ChartJS, ArcElement, Tooltip, Legend, Title } from "chart.js";
import { Doughnut } from "react-chartjs-2";
import { useTranslation } from "react-i18next";
import { useChartThemeColors, CHART_FILL_COLORS } from "../../utils/hooks/useChartThemeColors";

ChartJS.register(ArcElement, Tooltip, Legend, Title);

function Chat2({ state, chartLabels }) {
  const { t } = useTranslation();
  const chartColors = useChartThemeColors();
  const chartValues = [
    state?.sampleCollectionCount,
    state?.notCollectedCount,
    state?.departmentReceiveCount,
    state?.rejectedCount,
    state?.approvedCount,
  ];
  const labels = chartLabels
    ? chartLabels.map((label, index) => `${t(label)} : ${chartValues[index] ?? 0}`)
    : [
        `${t("Sample Collected")} : ${state?.sampleCollectionCount || 0}`,
        `${t("Sample Not Collected")} : ${state?.notCollectedCount || 0}`,
        `${t("Sample Received")} : ${state?.departmentReceiveCount || 0}`,
        `${t("Sample Rejected")} : ${state?.rejectedCount || 0}`,
        `${t("Sample Approved")} : ${state?.approvedCount || 0}`,
      ];
  const data = {
    labels,
    datasets: [
      {
        data: chartValues.slice(0, labels.length),
        backgroundColor: CHART_FILL_COLORS,
        borderColor: [
          "blue",
          "rgba(99,104,116,0.8)",
          "rgba(51, 122, 183)",
          "rgba(237, 21, 21,0.8)",
          "rgba(25, 163, 18,0.8)",
        ],
        borderWidth: 2,
        hoverOffset: 8,
      },
    ],
  };

  const options = {
    maintainAspectRatio: false,
    responsive: true,
    plugins: {
      legend: {
        position: "left", // Position the legend to the left
        align: "end", // Align the legend items at the start (top-left)
        labels: {
          color: chartColors.text,
          boxWidth: 20, // Size of the legend box
          padding: 20, // Spacing between the legend items
          font: {
            size: 12, // Increase font size of the labels
          },
        },
      },
      tooltip: {
        backgroundColor: chartColors.tooltipBg,
        titleColor: chartColors.tooltipTitle,
        bodyColor: chartColors.tooltipBody,
      },
    },
  };

  return (
    <div
      style={{
        width: "100%",
        height: "85%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        paddingBottom: "10px",
      }}
    >
      <Doughnut data={data} options={options} />
    </div>
  );
}

export default Chat2;
