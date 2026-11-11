import React from "react";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { Doughnut } from "react-chartjs-2";

import { useTranslation } from "react-i18next";

ChartJS.register(ArcElement, Tooltip, Legend);

function Chat3({ state }) {
  const { t } = useTranslation();

  const data = {
    labels: [
      t("Pending"),
      t("Rescheduled"),
      t("Completed"),
      t("Canceled"),
      t("CheckIn"),
    ],
    datasets: [
      {
        data: [
          state?.sampleCollectionCount,
          state?.notCollectedCount,
          state?.departmentReceiveCount,
          state?.rejectedCount,
          state?.approvedCount,
        ],
        backgroundColor: [
          "rgba(255, 99, 132, 0.2)",
          "rgba(54, 162, 235, 0.2)",
          "rgba(255, 206, 86, 0.2)",
          "rgba(75, 192, 192, 0.2)",
          "rgba(153, 102, 255, 0.2)",
        ],
        borderColor: [
          "rgba(255, 99, 132, 1)",
          "rgba(54, 162, 235, 1)",
          "rgba(255, 206, 86, 1)",
          "rgba(75, 192, 192, 1)",
          "rgba(153, 102, 255, 1)",
        ],
        borderWidth: 1,
      },
    ],
  };
  return <Doughnut data={data} />;
}

export default Chat3;
