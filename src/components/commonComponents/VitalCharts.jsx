import React from "react";
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
import { Line } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

// 🔹 helper to safely convert values
const toNumber = (val) => {
  if (val === null || val === undefined || val === "") return null;
  return Number(String(val).replace(/,/g, ""));
};

const SystolicDiagnosisChart = ({ tbody = [] }) => {
  // ===============================
  // Normalize API Data
  // ===============================
  const chartData = tbody.map((item) => {
    let systolic = null;
    let diastolic = null;

    if (item?.BP?.includes("/")) {
      const bp = item.BP.split("/").map(toNumber);
      systolic = bp[0];
      diastolic = bp[1];
    } else {
      systolic = toNumber(item?.BP);
    }

    return {
      timestamp: `${item.DATE} ${item.Time}`,

      systolic,
      diastolic,
      pulse: toNumber(item.pulse),
      resp: toNumber(item.resp),
      temp: toNumber(item.Temp),
      painScore: toNumber(item.PainScore),

      oxygen: toNumber(item.Oxygen),
      bloodSugar: toNumber(item.BloodSugar),
      heartRate: toNumber(item.HeartRate),
      spo2: toNumber(item.SPO2),

      height: toNumber(item.Height),
      weight: toNumber(item.Weight),
      bmi: toNumber(item.BMI),
      bsa: toNumber(item.BSA),
      ciwa: toNumber(item.CIWA),
    };
  });

  const labels = chartData.map((d) => d.timestamp);

  // ===============================
  // MAIN VITALS CHART
  // ===============================
  const vitalsData = {
    labels,
    datasets: [
      {
        label: "Systolic BP",
        data: chartData.map((d) => d.systolic),
        borderColor: "orange",
        tension: 0.4,
      },
      {
        label: "Diastolic BP",
        data: chartData.map((d) => d.diastolic),
        borderColor: "purple",
        tension: 0.4,
      },
      {
        label: "Pulse",
        data: chartData.map((d) => d.pulse),
        borderColor: "green",
        tension: 0.4,
      },
      {
        label: "Respiration",
        data: chartData.map((d) => d.resp),
        borderColor: "blue",
        tension: 0.4,
      },
      {
        label: "Temperature (°C)",
        data: chartData.map((d) => d.temp),
        borderColor: "red",
        tension: 0.4,
      },
      {
        label: "Pain Score",
        data: chartData.map((d) => d.painScore),
        borderColor: "gray",
        tension: 0.4,
      },
      {
        label: "Oxygen",
        data: chartData.map((d) => d.oxygen),
        borderColor: "#00bcd4",
        tension: 0.4,
      },
      {
        label: "Blood Sugar",
        data: chartData.map((d) => d.bloodSugar),
        borderColor: "#8bc34a",
        tension: 0.4,
      },
      {
        label: "Heart Rate",
        data: chartData.map((d) => d.heartRate),
        borderColor: "#ff5722",
        tension: 0.4,
      },
      {
        label: "CIWA",
        data: chartData.map((d) => d.ciwa),
        borderColor: "#9c27b0",
        tension: 0.4,
      },
    ],
  };

  // ===============================
  // BODY METRICS CHART
  // ===============================
  const bodyMetricsData = {
    labels,
    datasets: [
      {
        label: "Height (cm)",
        data: chartData.map((d) => d.height),
        borderColor: "blue",
        tension: 0.4,
      },
      {
        label: "Weight (kg)",
        data: chartData.map((d) => d.weight),
        borderColor: "purple",
        tension: 0.4,
      },
      {
        label: "BMI",
        data: chartData.map((d) => d.bmi),
        borderColor: "brown",
        tension: 0.4,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: "top",
      },
      tooltip: {
        mode: "index",
        intersect: false,
      },
    },
    interaction: {
      mode: "nearest",
      axis: "x",
      intersect: false,
    },
    scales: {
      y: {
        title: {
          display: true,
          text: "Value",
        },
      },
    },
  };

  return (
    <div className="d-flex flex-column gap-4" style={{ width: "100%" }}>
      {/* =================== */}
      {/* VITAL SIGNS */}
      {/* =================== */}
      <div style={{ width: "100%", padding: "1rem" }}>
        <h5 className="fw-semibold mb-2">Vital Signs</h5>
        <Line data={vitalsData} options={options} />
      </div>

      {/* =================== */}
      {/* BODY METRICS */}
      {/* =================== */}
      <div style={{ width: "100%", padding: "1rem" }}>
        <h5 className="fw-semibold mb-2">Body Metrics</h5>
        <Line data={bodyMetricsData} options={options} />
      </div>
    </div>
  );
};

export default SystolicDiagnosisChart;
