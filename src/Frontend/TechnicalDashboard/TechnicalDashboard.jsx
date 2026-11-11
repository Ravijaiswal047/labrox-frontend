import React, { useEffect, useState } from "react";
import Heading from "../../components/UI/Heading";
import { useTranslation } from "react-i18next";
import Chart from "react-apexcharts";
import { axiosInstance } from "../../utils/axiosInstance";
import moment from "moment";
import { FONT_FAMILY, INK, CATEGORY_COLORS } from "../DashboardShared/dashboardTheme";
import VividChartCard, {
  vividTileStyle,
  vividIconStyle,
} from "../DashboardShared/VividDashboardCard";

const TechnicalDashboard = ({ filters }) => {
  const { t } = useTranslation();

  const [rerunPerf, setRerunPerf] = useState([]);
  const [loading, setLoading] = useState(false);

  const buildPayload = () => {
    const centreID = Array.isArray(filters?.CentreID)
      ? filters.CentreID
      : filters?.CentreID
        ? [filters.CentreID]
        : [];
    return {
      centreID,
      fromDate: moment(filters?.FromDate).format("YYYY-MM-DD"),
      fromTime: filters?.FromTime || "00:00:00",
      toDate: moment(filters?.ToDate).format("YYYY-MM-DD"),
      toTime: filters?.ToTime || "23:59:59",
    };
  };

  const fetchDashboardData = async () => {
    setLoading(true);
    const payload = buildPayload();
    await axiosInstance
      .post("CommonController/GetRerunParametersCountByMachine", payload)
      .then((res) =>
        setRerunPerf(
          [...(res?.data?.message || [])].sort(
            (a, b) => Number(b?.RerunCount || 0) - Number(a?.RerunCount || 0),
          ),
        ),
      )
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (!filters?.FromDate || !filters?.ToDate) return;
    fetchDashboardData();
  }, [filters]);

  const totalReruns = rerunPerf.reduce(
    (sum, ele) => sum + Number(ele?.RerunCount || 0),
    0,
  );
  const topMachine = rerunPerf[0];
  const machineLabel = (ele) =>
    (ele?.MachineName && ele.MachineName.trim()) || t("Unassigned");

  // Same "rank everything, one categorical color per bar" vertical-column
  // shape used by the Director Dashboard's test-volume chart -- bars rise
  // bottom-to-top, labels rotate underneath.
  const rerunChart = {
    series: [
      { name: t("Reruns"), data: rerunPerf.map((ele) => Number(ele?.RerunCount || 0)) },
    ],
    options: {
      chart: { type: "bar", toolbar: { show: false }, fontFamily: FONT_FAMILY },
      plotOptions: {
        bar: {
          horizontal: false,
          columnWidth: "55%",
          borderRadius: 3,
          borderRadiusApplication: "end",
          distributed: true,
          dataLabels: { position: "top" },
        },
      },
      dataLabels: {
        enabled: true,
        formatter: (val) => Number(val).toLocaleString(),
        style: { fontWeight: 700, colors: [INK.secondary], fontSize: "10px" },
        offsetY: -18,
        dropShadow: { enabled: false },
      },
      colors: rerunPerf.map((_, i) => CATEGORY_COLORS[i % CATEGORY_COLORS.length]),
      legend: { show: false },
      xaxis: {
        categories: rerunPerf.map(machineLabel),
        labels: {
          rotate: -45,
          trim: true,
          style: { colors: INK.muted, fontSize: "9px" },
        },
        axisBorder: { show: false },
        axisTicks: { show: false },
      },
      yaxis: {
        labels: {
          formatter: (val) => Number(val).toLocaleString(),
          style: { colors: INK.secondary, fontWeight: 600, fontSize: "10px" },
        },
      },
      grid: {
        borderColor: INK.gridline,
        strokeDashArray: 0,
        yaxis: { lines: { show: true } },
        xaxis: { lines: { show: false } },
        padding: { left: 0, right: 0, bottom: 0 },
      },
      tooltip: {
        y: { formatter: (val) => `${Number(val).toLocaleString()} ${t("reruns")}` },
      },
    },
  };

  return (
    <>
      <Heading name={"Technical"} isBreadcrumb={true} />

      <div className="row mt-1 px-2 g-2">
        <div className="col-md-3 col-6">
          <div style={vividTileStyle(CATEGORY_COLORS[5])}>
            <span style={vividIconStyle(CATEGORY_COLORS[5])}>
              <i className="fa fa-rotate-right"></i>
            </span>
            <div>
              <div style={{ fontSize: 11, color: INK.secondary, fontWeight: 600 }}>
                {t("Total Reruns")}
              </div>
              <div style={{ fontSize: 17, fontWeight: 700, color: INK.primary }}>
                {totalReruns.toLocaleString()}
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-3 col-6">
          <div style={vividTileStyle(CATEGORY_COLORS[0])}>
            <span style={vividIconStyle(CATEGORY_COLORS[0])}>
              <i className="fa fa-desktop"></i>
            </span>
            <div>
              <div style={{ fontSize: 11, color: INK.secondary, fontWeight: 600 }}>
                {t("Machines Covered")}
              </div>
              <div style={{ fontSize: 17, fontWeight: 700, color: INK.primary }}>
                {rerunPerf.length}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="row mt-1 px-2 g-2">
        <div className="col-12">
          <VividChartCard
            icon="fa fa-rotate-right"
            iconColor={CATEGORY_COLORS[5]}
            title={t("Rerun Parameters Count")}
            subtitle={
              topMachine
                ? `${t("Top")}: ${machineLabel(topMachine)} (${Number(topMachine.RerunCount || 0).toLocaleString()} ${t("reruns")})`
                : t("Rerun parameter count by machine")
            }
          >
            {rerunPerf.length ? (
              <Chart
                options={rerunChart.options}
                series={rerunChart.series}
                type="bar"
                height={240}
              />
            ) : (
              <div style={{ fontSize: 13, color: INK.muted, padding: "12px 0" }}>
                {t("No rerun data for the selected filters")}
              </div>
            )}
          </VividChartCard>
        </div>
      </div>
    </>
  );
};

export default TechnicalDashboard;
