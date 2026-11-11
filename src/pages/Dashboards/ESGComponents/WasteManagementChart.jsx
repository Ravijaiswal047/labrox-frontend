import React, { useEffect, useState } from "react";
import { Line } from "react-chartjs-2";
import { axiosInstance } from "../../../utils/axiosInstance";
import { toast } from "react-toastify";
import Loading from "../../../components/loader/Loading";
import { useTranslation } from "react-i18next";
import ReactSelect from "../../../components/formComponent/ReactSelect";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
// Register ChartJS components for Line chart
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const WasteManagementChart = ({ filters }) => {
  const [t] = useTranslation();
  const [loading, setLoading] = useState(false);
  const [wasteData, setWasteData] = useState([]);
  const [monthsBack, setMonthsBack] = useState(12);

  const monthOptions = [
    { label: t("Last 3 Months"), value: 3 },
    { label: t("Last 6 Months"), value: 6 },
    { label: t("Last 12 Months"), value: 12 },
  ];

  const fetchWasteData = () => {
    const centreId = Array.isArray(filters?.CentreID) 
      ? filters?.CentreID[0] 
      : filters?.CentreID || 0;

    setLoading(true);
    axiosInstance
      .post("ESG/GetWasteDashboardData", {
        centreId: centreId,
        monthsBack: monthsBack,
      })
      .then((res) => {
        if (res?.data?.success) {
          setWasteData(res?.data?.message || []);
        }
      })
      .catch((err) => {
        toast.error(err?.response?.data?.message || t("Error fetching waste data"));
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (filters?.CentreID) {
      fetchWasteData();
    }
  }, [filters, monthsBack]);

  const chartData = {
    labels: wasteData.map((item) => item.MonthName),
    datasets: [
      {
        label: t("Infectious (Kg)"),
        data: wasteData.map((item) => item.InfectiousKg),
        borderColor: "#FF6384",
        backgroundColor: "rgba(255, 99, 132, 0.2)",
        tension: 0.4, // Makes the lines curved
        pointRadius: 4,
      },
      {
        label: t("General (Kg)"),
        data: wasteData.map((item) => item.GeneralKg),
        borderColor: "#4BC0C0",
        backgroundColor: "rgba(75, 192, 192, 0.2)",
        tension: 0.4,
        pointRadius: 4,
      },
      {
        label: t("Sharps (Kg)"),
        data: wasteData.map((item) => item.SharpsKg),
        borderColor: "#FFCE56",
        backgroundColor: "rgba(255, 206, 86, 0.2)",
        tension: 0.4,
        pointRadius: 4,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: "top" },
      tooltip: {
        mode: 'index',
        intersect: false, // Allows you to see all 3 values when hovering anywhere on the vertical line
      },
    },
    scales: {
      y: { 
        beginAtZero: true,
        title: { display: true, text: t("Kilograms (Kg)") }
      },
    },
  };

  return (
    <div className="card-dashboard mb-4 shadow-lg h-100">
      {loading && <Loading />}
      
      <div className="row align-items-center mb-3 px-2">
        <div className="col-sm-7">
          <h4 className="header-dashboard m-0">{t("Waste Management")}</h4>
        </div>
        <div className="col-sm-5">
          <ReactSelect
            dynamicOptions={monthOptions}
            value={monthsBack}
            removeIsClearable={true}
            onChange={(label, value) => setMonthsBack(value?.value)}
          />
        </div>
      </div>

      <div style={{ height: "300px", width: "100%", padding: "0 10px" }}>
        {wasteData.length > 0 ? (
          <Line data={chartData} options={chartOptions} />
        ) : (
          <div className="d-flex align-items-center justify-content-center h-100 border rounded bg-light">
            <p className="text-muted small">{t("No waste data available")}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default WasteManagementChart;