import React, { useEffect, useState } from "react";
import Heading from "../../components/UI/Heading";
import { useTranslation } from "react-i18next";
import Chart from "react-apexcharts";
import { axiosInstance } from "../../utils/axiosInstance";
import moment from "moment";
import {
  STATUS_COLOR,
  MUTED_BAR,
  FONT_FAMILY,
  INK,
  CATEGORY_COLORS,
  formatCurrency,
} from "../DashboardShared/dashboardTheme";
import DirectorChartCard, {
  vividTileStyle,
  vividIconStyle,
} from "../DashboardShared/VividDashboardCard";

const DirectorDashboard = ({ filters }) => {
  const { t } = useTranslation();

  const [departmentPerf, setDepartmentPerf] = useState([]);
  const [centrePerf, setCentrePerf] = useState([]);
  const [testPerf, setTestPerf] = useState([]);
  const [investigationPerf, setInvestigationPerf] = useState([]);
  const [machineRevenue, setMachineRevenue] = useState([]);
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
    await Promise.all([
      axiosInstance
        .post("CommonController/GetDepartmentWiseSalesPerformance", payload)
        .then((res) =>
          setDepartmentPerf(
            [...(res?.data?.message || [])].sort(
              (a, b) => Number(a?.NetAmount || 0) - Number(b?.NetAmount || 0),
            ),
          ),
        )
        .catch((err) => console.error(err)),
      axiosInstance
        .post("CommonController/GetCentreWiseSalesPerformance", payload)
        .then((res) =>
          setCentrePerf(
            [...(res?.data?.message || [])].sort(
              (a, b) => Number(a?.NetAmount || 0) - Number(b?.NetAmount || 0),
            ),
          ),
        )
        .catch((err) => console.error(err)),
      axiosInstance
        .post("CommonController/GetDepartmentWiseTestPerformance", payload)
        .then((res) =>
          setTestPerf(
            [...(res?.data?.message || [])].sort(
              (a, b) => Number(b?.TestCount || 0) - Number(a?.TestCount || 0),
            ),
          ),
        )
        .catch((err) => console.error(err)),
      axiosInstance
        .post("CommonController/GetTotalInvestigationCount", payload)
        .then((res) =>
          setInvestigationPerf(
            [...(res?.data?.message || [])].sort(
              (a, b) => Number(b?.TotalInvestigation || 0) - Number(a?.TotalInvestigation || 0),
            ),
          ),
        )
        .catch((err) => console.error(err)),
      axiosInstance
        .post("CommonController/GetMachineWiseRevenue", payload)
        .then((res) =>
          setMachineRevenue(
            [...(res?.data?.message || [])].sort(
              (a, b) => Number(b?.NetAmount || 0) - Number(a?.NetAmount || 0),
            ),
          ),
        )
        .catch((err) => console.error(err)),
    ]).finally(() => setLoading(false));
  };

  useEffect(() => {
    if (!filters?.FromDate || !filters?.ToDate) return;
    fetchDashboardData();
  }, [filters]);

  // Emphasis form: the worst performer(s) carry the accent, everyone else is
  // de-emphasised context -- fits the "Low Performance" story better than a
  // uniform sequential ramp would.
  //
  // "Low performers" is defined as below-average, not a fixed head-count: a
  // fixed N still breaks when a group has few entries and one big outlier
  // (e.g. 5 centres, 1 of them huge) -- the outlier stays in the chart and
  // crushes the rest to invisible slivers on a shared linear scale. Below-
  // average adapts to whatever the actual spread is.
  const buildPerformanceChart = ({ data, nameKey, idKey }) => {
    const total = data.length;
    const average =
      total > 0
        ? data.reduce((sum, ele) => sum + Number(ele?.NetAmount || 0), 0) / total
        : 0;
    let low = data.filter((ele) => Number(ele?.NetAmount || 0) < average);
    if (!low.length) low = data.slice(0, Math.min(5, total));

    const values = low.map((ele) => Number(ele?.NetAmount || 0));
    const lowest = values.length ? Math.min(...values) : null;

    return {
      meta: { total, shown: low.length },
      series: [{ name: t("Net Amount"), data: values }],
      options: {
        chart: {
          type: "bar",
          toolbar: { show: false },
          fontFamily: FONT_FAMILY,
        },
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
          formatter: (val) => formatCurrency(val),
          style: { fontWeight: 600, colors: [INK.primary], fontSize: "9px" },
          offsetY: -16,
        },
        legend: { show: false },
        xaxis: {
          categories: low.map(
            (ele) =>
              (ele?.[nameKey] && ele[nameKey].trim()) ||
              `${t("Dept")} ${ele?.[idKey]}`,
          ),
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
            formatter: (val) => formatCurrency(val),
            style: { colors: INK.secondary, fontWeight: 600, fontSize: "10px" },
          },
        },
        colors: values.map((v) => (v === lowest ? STATUS_COLOR.critical : MUTED_BAR)),
        grid: {
          borderColor: INK.gridline,
          strokeDashArray: 0,
          xaxis: { lines: { show: false } },
          yaxis: { lines: { show: true } },
          padding: { left: 0, right: 0, bottom: 0 },
        },
        tooltip: {
          y: { formatter: (val) => formatCurrency(val) },
        },
      },
    };
  };

  const departmentChart = buildPerformanceChart({
    data: departmentPerf,
    nameKey: "DepartmentName",
    idKey: "DepartmentID",
  });

  const centreChart = buildPerformanceChart({
    data: centrePerf,
    nameKey: "CentreName",
    idKey: "CentreID",
  });

  const legend = [
    { label: t("Lowest performer"), color: STATUS_COLOR.critical },
    { label: t("Others"), color: MUTED_BAR },
  ];

  // Test volume is a magnitude story, not a "low performer" one -- every
  // department is shown, ranked highest to lowest, in a single accent hue.
  const departmentLabel = (ele) =>
    (ele?.DepartmentName && ele.DepartmentName.trim()) ||
    `${t("Dept")} ${ele?.DepartmentID}`;

  const totalTests = testPerf.reduce(
    (sum, ele) => sum + Number(ele?.TestCount || 0),
    0,
  );
  const topDepartment = testPerf[0];

  // Each bar gets its own color from the fixed categorical palette so the
  // chart reads as lively/distinct rather than one flat hue -- cycles past
  // 8 categories, which is fine here since every bar already carries a
  // direct text label on the axis.
  const testVolumeColors = testPerf.map(
    (_, i) => CATEGORY_COLORS[i % CATEGORY_COLORS.length],
  );

  // Vertical column chart -- bars rise bottom-to-top from the axis; labels
  // rotate underneath since the department names are long.
  const testPerformanceChart = {
    series: [
      { name: t("Tests"), data: testPerf.map((ele) => Number(ele?.TestCount || 0)) },
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
      colors: testVolumeColors,
      legend: { show: false },
      xaxis: {
        categories: testPerf.map(departmentLabel),
        labels: {
          rotate: -45,
          trim: true,
          hideOverlappingLabels: false,
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
        y: { formatter: (val) => `${Number(val).toLocaleString()} ${t("tests")}` },
      },
    },
  };

  const totalInvestigations = investigationPerf.reduce(
    (sum, ele) => sum + Number(ele?.TotalInvestigation || 0),
    0,
  );
  const totalMachineRevenue = machineRevenue.reduce(
    (sum, ele) => sum + Number(ele?.NetAmount || 0),
    0,
  );

  // Only 2-3 machines and share-of-total is the story, so a donut reads
  // better than two mostly-empty bar charts. Each machine is a distinct
  // entity, so slices take the categorical palette rather than one hue.
  const buildDonutChart = ({ labels, values, totalLabel, valueFormatter }) => ({
    series: values,
    options: {
      chart: { type: "donut", fontFamily: FONT_FAMILY },
      labels,
      colors: CATEGORY_COLORS.slice(0, values.length),
      stroke: { width: 2, colors: ["#fcfcfb"] },
      // Per-slice % labels are redundant with the legend + center total here
      // (2-3 slices) and were colliding with the center text -- turned off
      // rather than fought with positioning.
      dataLabels: { enabled: false },
      legend: {
        position: "bottom",
        fontSize: "10px",
        fontFamily: FONT_FAMILY,
        labels: { colors: INK.secondary },
        markers: { size: 7, shape: "circle" },
        itemMargin: { horizontal: 6, vertical: 0 },
      },
      plotOptions: {
        pie: {
          // Wider hole (74% vs the default ~65%) so the center total text
          // has room and doesn't overflow the ring -- verified visually,
          // it was clipping into the ring at the narrower size.
          donut: {
            size: "74%",
            labels: {
              show: true,
              total: {
                show: true,
                label: totalLabel,
                color: INK.muted,
                fontSize: "9px",
                fontWeight: 600,
                formatter: (w) =>
                  valueFormatter(w.globals.seriesTotals.reduce((a, b) => a + b, 0)),
              },
              value: {
                fontSize: "15px",
                fontWeight: 700,
                color: INK.primary,
                offsetY: -4,
                formatter: (val) => valueFormatter(val),
              },
            },
          },
        },
      },
      tooltip: { y: { formatter: (val) => valueFormatter(val) } },
    },
  });

  const investigationChart = buildDonutChart({
    labels: investigationPerf.map(
      (ele) => (ele?.MachineName && ele.MachineName.trim()) || t("Unassigned"),
    ),
    values: investigationPerf.map((ele) => Number(ele?.TotalInvestigation || 0)),
    totalLabel: t("Total Investigations"),
    valueFormatter: (val) => Number(val).toLocaleString(),
  });

  const machineRevenueChart = buildDonutChart({
    labels: machineRevenue.map(
      (ele) => (ele?.MachineName && ele.MachineName.trim()) || t("Unassigned"),
    ),
    values: machineRevenue.map((ele) => Number(ele?.NetAmount || 0)),
    totalLabel: t("Total Revenue"),
    valueFormatter: (val) => formatCurrency(val),
  });

  // Fixed height for the vertical (column) low-performance charts -- rotated
  // labels underneath need consistent room regardless of bar count.
  const LOW_PERF_CHART_HEIGHT = 220;

  const subtitleWithMeta = (base, meta) =>
    meta?.total > meta?.shown
      ? `${t(base)} · ${t("Below average")} (${meta.shown} ${t("of")} ${meta.total})`
      : t(base);

  return (
    <>
      <Heading name={"Director Dashboard"} isBreadcrumb={true} />

      <div className="row mt-1 px-2 g-2">
        <div className="col-md-6 col-12">
          <DirectorChartCard
            icon="fa fa-flask"
            title={t("Low Performance Departments")}
            subtitle={subtitleWithMeta(
              "Department Wise Performance in Terms of Sale",
              departmentChart.meta,
            )}
            legend={legend}
          >
            <Chart
              options={departmentChart.options}
              series={departmentChart.series}
              type="bar"
              height={LOW_PERF_CHART_HEIGHT}
            />
          </DirectorChartCard>
        </div>
        <div className="col-md-6 col-12">
          <DirectorChartCard
            icon="fa fa-building"
            title={t("Low Performance Branches")}
            subtitle={subtitleWithMeta(
              "Centre Wise Performance in Terms of Sale",
              centreChart.meta,
            )}
            legend={legend}
          >
            <Chart
              options={centreChart.options}
              series={centreChart.series}
              type="bar"
              height={LOW_PERF_CHART_HEIGHT}
            />
          </DirectorChartCard>
        </div>
      </div>

      {/* One-line KPI strip -- every headline number in one place instead of
          scattered single-tile rows, so the page reads top-to-bottom as
          summary first, then supporting charts. */}
      <div className="row mt-1 px-2 g-2">
        <div className="col-md-3 col-6">
          <div style={vividTileStyle(CATEGORY_COLORS[0])}>
            <span style={vividIconStyle(CATEGORY_COLORS[0])}>
              <i className="fa fa-vial"></i>
            </span>
            <div>
              <div style={{ fontSize: 11, color: INK.secondary, fontWeight: 600 }}>
                {t("Total Tests")}
              </div>
              <div style={{ fontSize: 17, fontWeight: 700, color: INK.primary }}>
                {totalTests.toLocaleString()}
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-3 col-6">
          <div style={vividTileStyle(CATEGORY_COLORS[1])}>
            <span style={vividIconStyle(CATEGORY_COLORS[1])}>
              <i className="fa fa-microscope"></i>
            </span>
            <div>
              <div style={{ fontSize: 11, color: INK.secondary, fontWeight: 600 }}>
                {t("Total Investigations")}
              </div>
              <div style={{ fontSize: 17, fontWeight: 700, color: INK.primary }}>
                {totalInvestigations.toLocaleString()}
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-3 col-6">
          <div style={vividTileStyle(CATEGORY_COLORS[2])}>
            <span style={vividIconStyle(CATEGORY_COLORS[2])}>
              <i className="fa fa-money-bill-wave"></i>
            </span>
            <div>
              <div style={{ fontSize: 11, color: INK.secondary, fontWeight: 600 }}>
                {t("Machine Revenue (Approx)")}
              </div>
              <div style={{ fontSize: 17, fontWeight: 700, color: INK.primary }}>
                {formatCurrency(totalMachineRevenue)}
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-3 col-6">
          <div style={vividTileStyle(CATEGORY_COLORS[4])}>
            <span style={vividIconStyle(CATEGORY_COLORS[4])}>
              <i className="fa fa-layer-group"></i>
            </span>
            <div>
              <div style={{ fontSize: 11, color: INK.secondary, fontWeight: 600 }}>
                {t("Departments Covered")}
              </div>
              <div style={{ fontSize: 17, fontWeight: 700, color: INK.primary }}>
                {testPerf.length}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="row mt-1 px-2 g-2">
        <div className="col-12">
          <DirectorChartCard
            icon="fa fa-vials"
            title={t("Department Wise Test Performance")}
            subtitle={
              topDepartment
                ? `${t("Top")}: ${departmentLabel(topDepartment)} (${Number(topDepartment.TestCount || 0).toLocaleString()} ${t("tests")})`
                : t("Test volume by department")
            }
          >
            {testPerf.length ? (
              <Chart
                options={testPerformanceChart.options}
                series={testPerformanceChart.series}
                type="bar"
                height={260}
              />
            ) : (
              <div style={{ fontSize: 13, color: INK.muted, padding: "12px 0" }}>
                {t("No test data for the selected filters")}
              </div>
            )}
          </DirectorChartCard>
        </div>
      </div>

      {/* Only 2-3 machines and the story is "share of total," so a donut
          reads better than a bar chart that's mostly empty space. */}
      <div className="row mt-1 px-2 g-2">
        <div className="col-md-6 col-12">
          <DirectorChartCard
            icon="fa fa-microscope"
            title={t("Investigations by Machine")}
            subtitle={t("Share of investigations by machine")}
          >
            {investigationPerf.length ? (
              <Chart
                options={investigationChart.options}
                series={investigationChart.series}
                type="donut"
                height={210}
              />
            ) : (
              <div style={{ fontSize: 13, color: INK.muted, padding: "12px 0" }}>
                {t("No investigation data for the selected filters")}
              </div>
            )}
          </DirectorChartCard>
        </div>
        <div className="col-md-6 col-12">
          <DirectorChartCard
            icon="fa fa-money-bill-wave"
            iconColor={STATUS_COLOR.good}
            title={t("Machine Wise Revenue (Approx)")}
            subtitle={t("Share of net revenue by machine")}
          >
            {machineRevenue.length ? (
              <Chart
                options={machineRevenueChart.options}
                series={machineRevenueChart.series}
                type="donut"
                height={210}
              />
            ) : (
              <div style={{ fontSize: 13, color: INK.muted, padding: "12px 0" }}>
                {t("No revenue data for the selected filters")}
              </div>
            )}
          </DirectorChartCard>
        </div>
      </div>
    </>
  );
};

export default DirectorDashboard;
