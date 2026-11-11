import React, { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import Heading from "@app/components/UI/Heading";
import ReactSelect from "@app/components/formComponent/ReactSelect";
import CustomTable from "@app/components/Table/CustomTable";
import KpiCard from "./shared/KpiCard";
import Donut from "./shared/Donut";
import BarList from "./shared/BarList";
import { getCentreDetails } from "@app/utils/NetworkApi/commonApi";
import { axiosInstance } from "../../../utils/axiosInstance";
import { alertTagClass } from "../dashboardConstants";

const MAX_ALERTS = 10;
const ALL_CENTRES_KEY = "__ALL__";

const emptyDashboard = {
  kpis: {
    total: 0,
    active: 0,
    underMaintenance: 0,
    outOfService: 0,
    atSupplier: 0,
    amcExpiring: 0,
    calibrationDue: 0,
    openBreakdowns: 0,
  },
  departmentSplit: [],
  statusSplit: [],
  costTrend: [],
  centreSummary: [],
  alerts: [],
};

const DashboardTab = () => {
  const { t } = useTranslation();
  const [centre, setCentre] = useState(ALL_CENTRES_KEY);
  const [centreList, setCentreList] = useState([]);
  const [dashboardData, setDashboardData] = useState(emptyDashboard);
  const [loading, setLoading] = useState(false);

  // ─── Load Centre dropdown list ────────────────────────────────────────────
  useEffect(() => {
    getCentreDetails(setCentreList);
  }, []);

  // ─── Load Live Dashboard Data ─────────────────────────────────────────────
  const loadDashboard = async (selectedCentre) => {
    setLoading(true);
    try {
      const payload = {};
      if (
        selectedCentre &&
        selectedCentre !== ALL_CENTRES_KEY &&
        selectedCentre !== "All Centres"
      ) {
        if (Number(selectedCentre)) {
          payload.CentreID = Number(selectedCentre);
        } else {
          payload.CentreName = selectedCentre;
        }
      }
      const response = await axiosInstance.post(
        "EquipmentManagement/GetDashboardOverview",
        payload
      );
      if (response?.data?.success) {
        setDashboardData(response.data.message || emptyDashboard);
      }
    } catch (err) {
      console.error("Failed to load equipment dashboard", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard(centre);
  }, [centre]);

  const centreOptions = useMemo(() => {
    const list = (centreList || []).map((c) => ({
      label: c.label || c.Centre,
      value: c.value || c.CentreID,
    }));
    return [{ label: t("All Centres"), value: ALL_CENTRES_KEY }, ...list];
  }, [centreList, t]);

  const kpis = dashboardData.kpis || emptyDashboard.kpis;

  const statusSegments = useMemo(
    () =>
      (dashboardData.statusSplit || []).map((s) => ({
        ...s,
        label: t(s.label),
      })),
    [dashboardData.statusSplit, t]
  );

  const deptRows = dashboardData.departmentSplit || [];
  const alerts = dashboardData.alerts || [];
  const centres = dashboardData.centreSummary || [];

  const costRows = useMemo(
    () =>
      (dashboardData.costTrend || []).map((m) => ({
        label: m.label,
        value: m.value,
        display: `${m.value}k`,
      })),
    [dashboardData.costTrend]
  );

  return (
    <div className="em-master">
      <Heading
        title={t("Equipment Dashboard")}
        secondTitle={
          <div className="em-filter-bar">
            <div className="em-filter-field">
              <ReactSelect
                id="dashCentreFilter"
                name="Centre"
                placeholderName="Centre"
                value={centre}
                dynamicOptions={centreOptions}
                onChange={(name, option) =>
                  setCentre(option?.value ?? ALL_CENTRES_KEY)
                }
                respclass=""
              />
            </div>
          </div>
        }
      />

      <div className="em-kpi-row em-kpi-row-8 mt-2">
        <KpiCard
          tone="neutral"
          value={kpis.total ?? 0}
          label={t("Total Equipment")}
        />
        <KpiCard tone="good" value={kpis.active ?? 0} label={t("Active")} />
        <KpiCard
          tone="warning"
          value={kpis.underMaintenance ?? 0}
          label={t("Under Maintenance")}
        />
        <KpiCard
          tone="critical"
          value={kpis.outOfService ?? 0}
          label={t("Out of Service")}
        />
        <KpiCard
          tone="info"
          value={kpis.atSupplier ?? 0}
          label={t("At Supplier (Repair)")}
        />
        <KpiCard
          tone="warning"
          value={kpis.amcExpiring ?? 0}
          label={t("AMC Expiring ≤30d")}
        />
        <KpiCard
          tone="info"
          value={kpis.calibrationDue ?? 0}
          label={t("Calibration Due")}
        />
        <KpiCard
          tone="critical"
          value={kpis.openBreakdowns ?? 0}
          label={t("Open Breakdowns")}
        />
      </div>

      <div className="em-split">
        {/* Left column */}
        <div>
          <div className="mainDashboardwrp em-panel">
            <div className="mainBox1">
              <div className="d-flex flex-wrap mainHeader">
                <h4>{t("Department-wise Equipment")}</h4>
              </div>
              <BarList
                rows={deptRows}
                labelWidth={130}
                emptyText={t("No equipment found.")}
              />
            </div>
          </div>

          <div className="mainDashboardwrp em-panel">
            <div className="mainBox1">
              <div className="d-flex flex-wrap mainHeader">
                <h4>{t("Monthly Maintenance Cost (₹ ,000)")}</h4>
              </div>
              <BarList rows={costRows} labelWidth={54} />
            </div>
          </div>

          <div className="mainDashboardwrp em-panel">
            <div className="mainBox1">
              <div className="d-flex flex-wrap mainHeader">
                <h4>{t("Centre-wise Summary")}</h4>
              </div>
              <CustomTable
                disableTooltip={true}
                columns={[
                  { header: t("Centre"), field: "centre", minWidth: "150px" },
                  { header: t("Total"), field: "total", minWidth: "60px" },
                  { header: t("Active"), field: "active", minWidth: "60px" },
                  {
                    header: t("Under Maint."),
                    field: "underMaintenance",
                    minWidth: "95px",
                  },
                  {
                    header: t("Out of Service"),
                    field: "outOfService",
                    minWidth: "100px",
                  },
                ]}
                data={centres.map((c) => ({
                  centre: c.centre,
                  total: c.total,
                  active: c.active,
                  underMaintenance: c.underMaintenance,
                  outOfService: c.outOfService,
                }))}
              />
            </div>
          </div>
        </div>

        {/* Right column */}
        <div>
          <div className="mainDashboardwrp em-panel">
            <div className="mainBox1">
              <div className="d-flex flex-wrap mainHeader">
                <h4>{t("Equipment Status")}</h4>
              </div>
              <Donut segments={statusSegments} caption={t("units")} />
            </div>
          </div>

          <div className="mainDashboardwrp em-panel">
            <div className="mainBox1">
              <div className="d-flex flex-wrap mainHeader">
                <h4>{t("Expiry & Due Alerts")}</h4>
                <span className="em-badge em-badge-outofservice">
                  {alerts.length} {t("alerts")}
                </span>
              </div>
              <div className="em-due-list">
                {alerts.length ? (
                  alerts.slice(0, MAX_ALERTS).map((a, index) => (
                    <div
                      className="em-due-row"
                      key={`${a.tag}-${a.text}-${index}`}
                    >
                      <span className={`${alertTagClass(a.tag)} em-alert-tag`}>
                        {t(a.tag)}
                      </span>
                      <span className="em-due-name">{a.text}</span>
                      <span
                        className={
                          a.days < 0
                            ? "em-cal-overdue"
                            : a.days <= 30
                              ? "em-cal-due"
                              : "em-due-date"
                        }
                      >
                        {a.days < 0
                          ? `${Math.abs(a.days)}d ${t("overdue")}`
                          : `${a.days}d`}
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="em-detail-empty">
                    {t("No pending alerts — all clear.")}
                  </div>
                )}
                {alerts.length > MAX_ALERTS && (
                  <div className="em-detail-empty">
                    +{alerts.length - MAX_ALERTS} {t("more")}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardTab;
