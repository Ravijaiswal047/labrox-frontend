import React, { useEffect, useState } from "react";
import { Bar } from "react-chartjs-2";
import { axiosInstance } from "../../../utils/axiosInstance";
import { toast } from "react-toastify";
import Loading from "../../../components/loader/Loading";
import { useTranslation } from "react-i18next";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const GrievianceChart = ({ filters }) => {
  const [t] = useTranslation();
  const [loading, setLoading] = useState(false);
  const [grievanceStats, setGrievanceStats] = useState({ ThisMonth: 0, LastMonth: 0, Diff: 0 });

  const fetchGrievanceData = () => {
    const centreId = Array.isArray(filters?.CentreID) ? filters?.CentreID[0] : (filters?.CentreID ?? 0);

    setLoading(true);
    axiosInstance
      .post(`ESG/GetGrievanceDashboardData?centreId=${centreId}`)
      .then((res) => {
        if (res?.data?.success && res.data.message.length > 0) {
          setGrievanceStats(res.data.message[0]);
        }
      })
      .catch((err) => {
        toast.error(err?.response?.data?.message || t("Error fetching grievance data"));
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchGrievanceData();
  }, [filters?.CentreID]);

  const chartData = {
    labels: [t("Last Month"), t("This Month")],
    datasets: [
      {
        label: t("Incidents"),
        data: [grievanceStats?.LastMonth, grievanceStats?.ThisMonth],
        backgroundColor: ["#6c757d99", "#dc354599"],
        borderColor: ["#6c757d", "#dc3545"],
        borderWidth: 2,
        barThickness: 40,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
    },
    scales: {
      y: { 
        beginAtZero: true, 
        ticks: { stepSize: 1, color: "#6c757d" },
        grid: { borderDash: [5, 5] }
      },
      x: {
        ticks: { color: "#6c757d" }
      }
    },
  };

  return (
    <div className="card-dashboard mb-4 shadow-lg h-100">
      {loading && <Loading />}
      
      <div className="row align-items-center mb-3">
        <div className="col-10">
          <h4 className="header-dashboard m-0">{t("Grievance Overview")}</h4>
        </div>
        <div className="col-2 text-end">
           <span className={`badge p-2 ${grievanceStats?.Diff <= 0 ? "bg-success" : "bg-danger"}`}>
              {grievanceStats?.Diff > 0 ? `+${grievanceStats?.Diff}` : grievanceStats?.Diff} Trend
           </span>
        </div>
      </div>

      <div style={{ height: "300px", width: "100%" }}>
        <Bar data={chartData} options={chartOptions} />
      </div>

      <div className="mt-2 text-center border-top pt-2">
        <p className="text-muted small m-0">
          {t("Current variance vs last month")}: <strong>{grievanceStats?.Diff}</strong>
        </p>
      </div>
    </div>
  );
};

export default GrievianceChart;