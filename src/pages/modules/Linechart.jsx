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
} from "chart.js";
import { useChartThemeColors } from "../../utils/hooks/useChartThemeColors";

const Linechart = (state) => {
  ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
  );

  const { t } = useTranslation();
  const chartColors = useChartThemeColors();
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
        label: t("Line Chart"),
        data: chartValues,
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
    <div className="col-sm-12" style={{ width: "100%", height: "90%" }}>
      <Line
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

export default Linechart;
