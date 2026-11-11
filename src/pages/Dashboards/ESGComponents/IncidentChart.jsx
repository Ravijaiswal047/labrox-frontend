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

const IncidentChart = ({ filters }) => {
  const [t] = useTranslation();
  const [loading, setLoading] = useState(false);
  const [incidentStats, setIncidentStats] = useState({ ThisMonth: 0, LastMonth: 0, Diff: 0 });

  const fetchIncidentData = () => {
    const centreId = Array.isArray(filters?.CentreID) ? filters?.CentreID[0] : (filters?.CentreID ?? 0);

    setLoading(true);
    axiosInstance
      .post(`ESG/GetIncidentDashboardData?centreId=${centreId}`)
      .then((res) => {
        if (res?.data?.success && res.data.message.length > 0) {
          setIncidentStats(res.data.message[0]);
        }
      })
      .catch((err) => {
        toast.error(err?.response?.data?.message || t("Error fetching incident data"));
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchIncidentData();
  }, [filters?.CentreID]);

  const chartData = {
    labels: [t("Last Month"), t("This Month")],
    datasets: [
      {
        label: t("Incidents"),
        data: [incidentStats.LastMonth, incidentStats.ThisMonth],
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
          <h4 className="header-dashboard m-0">{t("Incident Overview")}</h4>
        </div>
        <div className="col-2 text-end">
           <span className={`badge p-2 ${incidentStats.Diff <= 0 ? "bg-success" : "bg-danger"}`}>
              {incidentStats.Diff > 0 ? `+${incidentStats.Diff}` : incidentStats.Diff} Trend
           </span>
        </div>
      </div>

      <div style={{ height: "300px", width: "100%" }}>
        <Bar data={chartData} options={chartOptions} />
      </div>

      <div className="mt-2 text-center border-top pt-2">
        <p className="text-muted small m-0">
          {t("Current variance vs last month")}: <strong>{incidentStats.Diff}</strong>
        </p>
      </div>
    </div>
  );
};

export default IncidentChart;