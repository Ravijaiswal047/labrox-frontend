import React, { useEffect, useState } from "react";
import { Bar } from "react-chartjs-2";
import { axiosInstance } from "../../../utils/axiosInstance";
import { toast } from "react-toastify";
import Loading from "../../../components/loader/Loading";
import { useTranslation } from "react-i18next";
import ReactSelect from "../../../components/formComponent/ReactSelect";
import { CustomButton } from "../../../components/UI/CustomButton";

const ConsumptionChart = ({ filters }) => {
  const [t] = useTranslation();
  const [loading, setLoading] = useState(false);
  const [consumptionData, setConsumptionData] = useState([]);
  const [consumptionType, setConsumptionType] = useState("ELECTRICITY");
  const [monthsBack, setMonthsBack] = useState(12);

  const monthOptions = [
    { label: t("Last 3 Months"), value: 3 },
    { label: t("Last 6 Months"), value: 6 },
    { label: t("Last 12 Months"), value: 12 },
  ];

  const fetchConsumptionData = () => {
    const centreId = Array.isArray(filters?.CentreID) 
      ? filters?.CentreID[0] 
      : filters?.CentreID || 0;

    setLoading(true);
    axiosInstance
      .post("ESG/GetUtilityConsumptionDashboardData", {
        centreId: Number(centreId),
        consumptionType: consumptionType.toLowerCase(),
        monthsBack: monthsBack,
      })
      .then((res) => {
        if (res?.data?.success) {
          setConsumptionData(res?.data?.message || []);
        }
      })
      .catch((err) => {
        toast.error(err?.response?.data?.message || t("Error fetching data"));
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (filters?.CentreID) {
      fetchConsumptionData();
    }
  }, [filters, monthsBack, consumptionType]);

  const isElec = consumptionType === "ELECTRICITY";

  const chartData = {
    labels: consumptionData.map((item) => item.MonthName),
    datasets: [
      {
        label: isElec ? t("Electricity (Units)") : t("Water (Units)"),
        data: consumptionData.map((item) => item.TotalUnits),
        backgroundColor: isElec ? "rgba(255, 193, 7, 0.6)" : "rgba(33, 150, 243, 0.6)",
        borderColor: isElec ? "rgba(255, 193, 7, 1)" : "rgba(33, 150, 243, 1)",
        borderWidth: 2,
      },
    ],
  };

  return (
    <div className="card-dashboard mb-4 shadow-lg h-100 mb-10">
      {loading && <Loading />}
      
      <div className="row align-items-center mb-3">
        <div className="col-md-6">
          <h4 className="header-dashboard m-0">{t("Utility Consumption")}</h4>
        </div>
        <div className="col-md-6 d-flex justify-content-end gap-2">
           <ReactSelect
              dynamicOptions={monthOptions}
              value={monthsBack}
              removeIsClearable={true}
              onChange={(label, value) => setMonthsBack(value?.value)}
            />
        </div>
      </div>

      <div className="d-flex gap-2 mb-3" style={{gap: "4px"}}>
        <CustomButton
          text={t("Electricity")}
          onClick={() => setConsumptionType("ELECTRICITY")}
        //   className={isElec ? "btn-primary" : "btn-outline-primary"}
          disabled={isElec}
        />
        <CustomButton
          text={t("Water")}
          onClick={() => setConsumptionType("WATER")}
        //   className={!isElec ? "btn-primary" : "btn-outline-primary"}
          disabled={!isElec}
        />
      </div>

      <div style={{ height: "300px", width: "100%" }}>
        {consumptionData.length > 0 ? (
          <Bar 
            data={chartData} 
            options={{ 
                responsive: true, 
                maintainAspectRatio: false,
                plugins: { legend: { position: 'top' } } 
            }} 
          />
        ) : (
          <div className="d-flex align-items-center justify-content-center h-100 border rounded bg-light">
            <p className="text-muted small">{t("No data available for this selection")}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ConsumptionChart;