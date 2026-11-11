import React from "react";
import { useTranslation } from "react-i18next";
import { Bar, Line } from "react-chartjs-2";
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
import moment from "moment";

const DayWiseCollectionChart = ({ state }) => {
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

  const data = {
    labels: state?.totalBookeddata
      ?.map((item) => {
        return moment(item?.Date).format("DMMM");
      })
      ?.reverse(),
    datasets: [
      {
        label: "Last 7 Day Revenue",
        data: state?.totalBookeddata
          ?.map((item) => {
            return item?.TotalNetAmount;
          })
          ?.reverse(),
        backgroundColor: [
          "#999e05",
          "#ba3490",
          "#37a37c",
          "#e74c3c",
          "#3498db",
          "#f1c40f",
          "#b802e0",
        ],
      },
    ],
  };

  return (
    <div className="col-sm-12" style={{ width: "100%", height: "90%" }}>
      <Bar
        data={data}
        options={{
          maintainAspectRatio: false,
          responsive: true,
          scales: {
            y: {
              beginAtZero: true,
              ticks: {
                stepSize: 1,
              },
            },
          },
        }}
      />
    </div>
  );
};

export default DayWiseCollectionChart;
