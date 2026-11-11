import React from "react";
import { Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  Title,
  BarElement,
  Tooltip,
  Legend,
} from "chart.js";
import { useTranslation } from "react-i18next";

const UserPieChart = ({ state, BookingPerdata }) => {
  const { t } = useTranslation();
  ChartJS.register(
    CategoryScale,
    LinearScale,
    Title,
    BarElement,
    Tooltip,
    Legend,
  );

  const data = {
    labels: [
      t("Cash"),
      t("Cheque"),
      // t("Credit"),
      // t("CreditCard"),
      // t("DebitCard"),
      // t("InternetBanking"),
      t("OnlinePayment"),
      // t("Paytm"),
    ],
    datasets: [
      {
        data: [
          state?.cash,
          state?.cheque,
          // state?.credit,
          // state?.creditCard,
          // state?.debitCard,
          // state?.InternetBanking,
          state?.TotalOnlinepayment,
          // state?.Paytm,
        ],
        backgroundColor: [
          "#FF7F3F",
          "#0472bd",
          //  "#610761",
          //  "#038784",
          //  "#ed1515",
          //  "#0472bd",
          //  "#843feb",
          "#bf0854",
          //  "#f50ced"
        ],
        borderWidth: 2,
        hoverOffset: 7,
      },
    ],
  };

  return (
    <>
      <div style={{ width: "100%", margin: "0px", padding: "0px" }}>
        <Doughnut
          data={data}
          options={{
            maintainAspectRatio: false,
            responsive: true,
            plugins: {
              legend: {
                display: false,
              },
            },
          }}
        />
      </div>
    </>
  );
};

export default UserPieChart;
