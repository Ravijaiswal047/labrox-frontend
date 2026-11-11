import React, { useEffect, useState } from "react";
import Heading from "../../components/UI/Heading";
import { useTranslation } from "react-i18next";
import Chart from "react-apexcharts";
import { axiosInstance } from "../../utils/axiosInstance";
import moment from "moment";
import DashboardChartCard from "../DashboardShared/DashboardChartCard";
import LineChartPayment from "../../pages/modules/LineChartPayment";
import {
  STATUS_COLOR,
  ACCENT,
  FONT_FAMILY,
  INK,
  statTileStyle,
  iconBadgeStyle,
} from "../DashboardShared/dashboardTheme";

const formatDelay = (minutes) => {
  const totalMinutes = Math.max(0, Math.round(Number(minutes) || 0));
  const days = Math.floor(totalMinutes / 1440);
  const hours = Math.floor((totalMinutes % 1440) / 60);
  if (days > 0) return `${days}d ${hours}h`;
  const mins = totalMinutes % 60;
  return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
};

const STATUS_META = {
  open: { color: STATUS_COLOR.warning, icon: "fa fa-hourglass-half" },
  convert: { color: STATUS_COLOR.good, icon: "fa fa-check-circle" },
  dead: { color: STATUS_COLOR.critical, icon: "fa fa-times-circle" },
};

const getStatusMeta = (name = "") => {
  const key = name?.toLowerCase() || "";
  const found = Object.keys(STATUS_META).find((k) => key.includes(k));
  return STATUS_META[found] || { color: ACCENT, icon: "fa fa-info-circle" };
};

const FrontofficeDashboard = ({ filters }) => {
  const { t } = useTranslation();

  const [statusData, setStatusData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [delayedTests, setDelayedTests] = useState([]);
  const [paymentSummary, setPaymentSummary] = useState({});

  const fetchDashboardData = async () => {
    setLoading(true);
    const centreID = Array.isArray(filters?.CentreID)
      ? filters.CentreID
      : filters?.CentreID
        ? [filters.CentreID]
        : [];
    await axiosInstance
      .post("CommonController/GetEstimateStatusDashboard", {
        centreID,
        fromDate: moment(filters?.FromDate).format("YYYY-MM-DD"),
        fromTime: filters?.FromTime || "00:00:00",
        toDate: moment(filters?.ToDate).format("YYYY-MM-DD"),
        toTime: filters?.ToTime || "23:59:59",
      })
      .then((res) => setStatusData(res?.data?.message || []))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  const fetchDelayedTests = async () => {
    const centreID = Array.isArray(filters?.CentreID)
      ? filters.CentreID
      : filters?.CentreID
        ? [filters.CentreID]
        : [];
    await axiosInstance
      .post("CommonController/GetTop10DelayedTest", {
        centreID,
        fromDate: moment(filters?.FromDate).format("YYYY-MM-DD"),
        fromTime: filters?.FromTime || "00:00:00",
        toDate: moment(filters?.ToDate).format("YYYY-MM-DD"),
        toTime: filters?.ToTime || "23:59:59",
      })
      .then((res) => setDelayedTests(res?.data?.data || []))
      .catch((err) => console.error(err));
  };

  const fetchPaymentSummary = async () => {
    await axiosInstance
      .post("CommonController/GetDashboard_Data", {
        CentreId: Array.isArray(filters?.CentreID) ? 0 : Number(filters?.CentreID) || 0,
        FromDate: moment(filters?.FromDate).format("YYYY-MM-DD"),
        ToDate: moment(filters?.ToDate).format("YYYY-MM-DD"),
        FromTime: filters?.FromTime,
        ToTime: filters?.ToTime,
      })
      .then((res) => setPaymentSummary(res?.data?.message?.paymentSummary || {}))
      .catch((err) => console.error(err));
  };

  useEffect(() => {
    if (!filters?.FromDate || !filters?.ToDate) return;
    fetchDashboardData();
    fetchDelayedTests();
    fetchPaymentSummary();
  }, [filters]);

  const totalCount = statusData.reduce(
    (sum, ele) => sum + Number(ele?.Count || 0),
    0,
  );

  const statusChart = {
    series: [
      {
        name: t("Estimates"),
        data: statusData.map((ele) => Number(ele?.Count || 0)),
      },
    ],
    options: {
      chart: { type: "bar", toolbar: { show: false }, fontFamily: FONT_FAMILY },
      plotOptions: {
        bar: {
          horizontal: false,
          columnWidth: "32%",
          borderRadius: 6,
          borderRadiusApplication: "end",
          distributed: true,
        },
      },
      dataLabels: {
        enabled: true,
        style: { fontWeight: 700, colors: [INK.primary] },
        offsetY: -18,
      },
      legend: { show: false },
      xaxis: {
        categories: statusData.map((ele) => ele?.StatusName),
        labels: { style: { colors: INK.secondary, fontWeight: 600 } },
        axisBorder: { show: false },
        axisTicks: { show: false },
      },
      yaxis: {
        labels: {
          formatter: (val) => Math.round(val),
          style: { colors: INK.muted },
        },
      },
      colors: statusData.map((ele) => getStatusMeta(ele?.StatusName).color),
      grid: {
        borderColor: INK.gridline,
        strokeDashArray: 0,
        yaxis: { lines: { show: true } },
        xaxis: { lines: { show: false } },
      },
      tooltip: { y: { formatter: (val) => Math.round(val) } },
    },
  };

  const legend = statusData.map((ele) => ({
    label: t(ele?.StatusName),
    color: getStatusMeta(ele?.StatusName).color,
  }));

  const sortedDelayedTests = [...delayedTests].sort(
    (a, b) => Number(b?.DelayInMinutes || 0) - Number(a?.DelayInMinutes || 0),
  );

  const delayedTestChart = {
    series: [
      {
        name: t("Delay"),
        data: sortedDelayedTests.map((ele) =>
          Number((Number(ele?.DelayInMinutes || 0) / 60).toFixed(1)),
        ),
      },
    ],
    options: {
      chart: { type: "bar", toolbar: { show: false }, fontFamily: FONT_FAMILY },
      plotOptions: {
        bar: {
          horizontal: true,
          barHeight: "55%",
          borderRadius: 4,
          borderRadiusApplication: "end",
          dataLabels: { position: "top" },
        },
      },
      dataLabels: {
        enabled: true,
        formatter: (_val, opts) =>
          formatDelay(sortedDelayedTests[opts.dataPointIndex]?.DelayInMinutes),
        style: { fontWeight: 700, colors: [INK.secondary] },
        offsetX: 24,
        dropShadow: { enabled: false },
      },
      colors: [STATUS_COLOR.critical],
      legend: { show: false },
      xaxis: {
        categories: sortedDelayedTests.map((ele) => ele?.TestName),
        title: { text: t("Hours delayed"), style: { color: INK.muted } },
        labels: { style: { colors: INK.muted } },
        axisBorder: { show: false },
        axisTicks: { show: false },
      },
      yaxis: {
        labels: {
          maxWidth: 200,
          style: { colors: INK.secondary, fontWeight: 600 },
        },
      },
      grid: {
        borderColor: INK.gridline,
        strokeDashArray: 0,
        yaxis: { lines: { show: false } },
        xaxis: { lines: { show: true } },
      },
      tooltip: {
        y: {
          title: { formatter: () => t("Delayed by") },
          formatter: (_val, opts) =>
            formatDelay(
              sortedDelayedTests[opts.dataPointIndex]?.DelayInMinutes,
            ),
        },
        x: { show: true },
        custom: ({ dataPointIndex }) => {
          const row = sortedDelayedTests[dataPointIndex] || {};
          return `<div style="padding:8px 10px;font-size:12px;font-family:${FONT_FAMILY};">
            <div style="font-weight:700;color:${INK.primary};margin-bottom:4px;">${row.TestName || ""}</div>
            <div style="color:${INK.secondary};">${t("Patient")}: ${row.PatientName || "-"}</div>
            <div style="color:${INK.secondary};">${t("Barcode")}: ${row.BarcodeNo || "-"}</div>
            <div style="color:${INK.secondary};">${t("Department")}: ${row.DepartmentName || "-"}</div>
            <div style="color:${STATUS_COLOR.critical};font-weight:700;margin-top:4px;">${t("Delayed by")} ${formatDelay(row.DelayInMinutes)}</div>
          </div>`;
        },
      },
    },
  };

  return (
    <>
      <Heading name={"Frontoffice Dashboard"} isBreadcrumb={true} />

      <div className="row mt-3 px-2 g-3">
        <div className="col-md-3 col-6">
          <div style={statTileStyle(ACCENT)}>
            <span style={iconBadgeStyle(ACCENT)}>
              <i className="fa fa-file-alt"></i>
            </span>
            <div>
              <div style={{ fontSize: 12.5, color: INK.secondary, fontWeight: 600 }}>
                {t("Total Estimates")}
              </div>
              <div style={{ fontSize: 22, fontWeight: 700, color: ACCENT }}>
                {totalCount}
              </div>
            </div>
          </div>
        </div>
        {statusData.map((ele, idx) => {
          const meta = getStatusMeta(ele?.StatusName);
          return (
            <div className="col-md-3 col-6" key={ele?.StatusID ?? idx}>
              <div style={statTileStyle(meta.color)}>
                <span style={iconBadgeStyle(meta.color)}>
                  <i className={meta.icon}></i>
                </span>
                <div>
                  <div style={{ fontSize: 12.5, color: INK.secondary, fontWeight: 600 }}>
                    {t(ele?.StatusName)}
                  </div>
                  <div style={{ fontSize: 22, fontWeight: 700, color: meta.color }}>
                    {ele?.Count}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="row mt-2 px-2 g-3">
        <div className="col-md-8 col-12">
          <DashboardChartCard
            icon="fa fa-chart-column"
            title={t("Estimate Status Overview")}
            subtitle={t("How estimates raised in this period are trending")}
            legend={legend}
          >
            <Chart
              options={statusChart.options}
              series={statusChart.series}
              type="bar"
              height={240}
            />
          </DashboardChartCard>
        </div>
        <div className="col-md-4 col-12">
          <DashboardChartCard
            icon="fa fa-list-check"
            title={t("Status Breakdown")}
            subtitle={t("Share of total estimates")}
          >
            <div style={{ marginTop: 8 }}>
              {statusData.map((ele, idx) => {
                const meta = getStatusMeta(ele?.StatusName);
                const pct = totalCount
                  ? Math.round((Number(ele?.Count || 0) / totalCount) * 100)
                  : 0;
                return (
                  <div
                    key={ele?.StatusID ?? idx}
                    style={{ marginBottom: 16 }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        fontSize: 13,
                        color: INK.secondary,
                        marginBottom: 4,
                      }}
                    >
                      <span style={{ fontWeight: 600 }}>{t(ele?.StatusName)}</span>
                      <span>
                        {ele?.Count} &middot; {pct}%
                      </span>
                    </div>
                    <div
                      style={{
                        height: 8,
                        borderRadius: 4,
                        background: "#eeeeea",
                        overflow: "hidden",
                      }}
                    >
                      <div
                        style={{
                          height: "100%",
                          width: `${pct}%`,
                          background: meta.color,
                          borderRadius: 4,
                        }}
                      ></div>
                    </div>
                  </div>
                );
              })}
              {!statusData.length && (
                <div style={{ fontSize: 13, color: INK.muted }}>
                  {t("No data for the selected filters")}
                </div>
              )}
            </div>
          </DashboardChartCard>
        </div>
      </div>

      <div className="row mt-2 px-2 g-3">
        <div className="col-md-8 col-12">
          <DashboardChartCard
            icon="fa fa-clock"
            iconColor={STATUS_COLOR.critical}
            title={t("Top 10 Delayed Tests")}
            subtitle={t("Tests with the longest turnaround delay in this period")}
          >
            {sortedDelayedTests.length ? (
              <Chart
                options={delayedTestChart.options}
                series={delayedTestChart.series}
                type="bar"
                height={Math.max(280, sortedDelayedTests.length * 42)}
              />
            ) : (
              <div style={{ fontSize: 13, color: INK.muted, padding: "12px 0" }}>
                {t("No delayed tests for the selected filters")}
              </div>
            )}
          </DashboardChartCard>
        </div>
        <div className="col-md-4 col-12">
          <DashboardChartCard
            icon="fa fa-credit-card"
            title={t("Payment Mode Chart")}
            subtitle={t("Collections split by payment method in this period")}
          >
            <div style={{ height: 260 }}>
              <LineChartPayment state={paymentSummary} />
            </div>
          </DashboardChartCard>
        </div>
      </div>
    </>
  );
};

export default FrontofficeDashboard;
