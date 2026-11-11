import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import {
  CategoryScale,
  Chart as ChartJS,
  Filler,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Tooltip,
} from "chart.js";
import { Line } from "react-chartjs-2";
import Accordion from "../../../components/UI/Accordion";
import { CustomButton } from "../../../components/UI/CustomButton";
import Loading from "../../../components/loader/Loading";
import { useNABLFilters } from "../context/NABLFilterContext";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend, Filler);

const polar = (cx, cy, r, angle) => {
  const rad = ((angle - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
};

const DonutChart = ({ slices }) => {
  const total = slices.reduce((sum, item) => sum + item.count, 0) || 1;
  const cx = 90;
  const cy = 90;
  const outer = 78;
  const inner = 48;
  let angle = 0;
  const visible = slices.filter((slice) => slice.count > 0);
  const paths = visible.map((slice) => {
    const sweep = Math.min(359.99, (slice.count / total) * 360);
    const start = polar(cx, cy, outer, angle);
    const end = polar(cx, cy, outer, angle + sweep);
    const startInner = polar(cx, cy, inner, angle + sweep);
    const endInner = polar(cx, cy, inner, angle);
    const large = sweep > 180 ? 1 : 0;
    const d = [
      `M ${start.x} ${start.y}`,
      `A ${outer} ${outer} 0 ${large} 1 ${end.x} ${end.y}`,
      `L ${startInner.x} ${startInner.y}`,
      `A ${inner} ${inner} 0 ${large} 0 ${endInner.x} ${endInner.y}`,
      "Z",
    ].join(" ");
    angle += sweep;
    return { ...slice, d };
  });

  return (
    <svg viewBox="0 0 180 180" width="160" height="160" aria-hidden="true">
      {paths.map((slice) => (
        <path key={slice.label} d={slice.d} fill={slice.color} />
      ))}
    </svg>
  );
};

const KpiCard = ({ item }) => (
  <div className={`nabl-kpi ${item.accent || "green"}`}>
    <div className="nabl-kpi-label">{item.label}</div>
    <div className="nabl-kpi-value">{item.value}</div>
    {item.breakdown?.length ? (
      <div className="nabl-kpi-meta">
        {item.breakdown.map((row, idx) => (
          <span key={row.label}>
            <span
              className={
                row.tone === "critical"
                  ? "text-danger font-weight-bold"
                  : row.tone === "major"
                    ? "text-warning font-weight-bold"
                    : row.tone === "minor"
                      ? "nabl-minor"
                      : "text-info font-weight-bold"
              }
            >
              {row.count} {row.label}
            </span>
            {idx < item.breakdown.length - 1 ? " · " : ""}
          </span>
        ))}
      </div>
    ) : item.trend ? (
      <div className={`nabl-kpi-meta ${item.trendUp ? "text-success font-weight-bold" : ""}`}>
        {item.trendUp ? "▲ " : "▼ "}
        {item.trend}
      </div>
    ) : (
      <div className="nabl-kpi-meta">{item.detail}</div>
    )}
  </div>
);

const TimelineList = ({ items }) => (
  <ul className="nabl-timeline">
    {(items || []).map((item) => (
      <li key={item.title} className={item.tone || "navy"}>
        <div className="nabl-item-title">{item.title}</div>
        <div className="nabl-item-detail">{item.detail}</div>
      </li>
    ))}
  </ul>
);

const Dashboard = () => {
  const { t } = useTranslation();
  const { dashboard: data, loading, setActiveTab } = useNABLFilters();

  const lineData = useMemo(() => {
    const points = data?.findingsTrend || [];
    return {
      labels: points.map((row) => row.month),
      datasets: [
        {
          label: t("Raised"),
          data: points.map((row) => row.raised),
          borderColor: "#e67a22",
          backgroundColor: "#e67a22",
          pointBackgroundColor: "#e67a22",
          tension: 0.25,
          borderWidth: 2,
        },
        {
          label: t("Closed"),
          data: points.map((row) => row.closed),
          borderColor: "#28a745",
          backgroundColor: "#28a745",
          pointBackgroundColor: "#fff",
          pointBorderColor: "#28a745",
          pointBorderWidth: 2,
          tension: 0.25,
          borderWidth: 2,
        },
        {
          label: t("Overdue"),
          data: points.map((row) => row.overdue),
          borderColor: "#dc3545",
          backgroundColor: "#dc3545",
          borderDash: [5, 4],
          pointRadius: 3,
          tension: 0.25,
          borderWidth: 2,
        },
      ],
    };
  }, [data, t]);

  const lineOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top",
        align: "end",
        labels: { boxWidth: 10, boxHeight: 10, usePointStyle: true, font: { size: 12 } },
      },
    },
    scales: {
      x: { grid: { display: false }, ticks: { color: "#6c757d" } },
      y: {
        min: 0,
        max: 6,
        ticks: { stepSize: 2, color: "#6c757d" },
        grid: { color: "#eef1f6" },
      },
    },
  };

  if (loading && !data) {
    return <Loading />;
  }

  if (!data) {
    return <div className="text-center text-muted py-4">{t("No dashboard data available.")}</div>;
  }

  const maxLifecycle = Math.max(...(data.documentLifecycle || []).map((row) => row.count), 1);

  return (
    <Accordion
      name={t("Compliance Dashboard")}
      isBreadcrumb={true}
      defaultValue={true}
      seconTitle={
        <div className="d-flex align-items-center">
          <CustomButton text={t("Export PDF")} icon="pdf" onClick={() => window.print()} />
          <CustomButton
            text={t("Start Mock Audit")}
            icon="flag"
            className="ml-2"
            onClick={() => setActiveTab("audits")}
          />
        </div>
      }
    >
      <div className={`px-2 pb-2 ${loading ? "nabl-is-loading" : ""}`}>
        <p className="text-muted mb-2 mt-1" style={{ fontSize: 12 }}>
          {t("Weighted readiness across documents, evidence, training, findings & CAPA")} — {t("Audit Year")}{" "}
          {data.auditYearLabel}
        </p>

        <div className="row">
          {data.kpis.map((item) => (
            <div className="col-6 col-lg-3 my-1" key={item.key || item.label}>
              <KpiCard item={item} />
            </div>
          ))}
        </div>

        <div className="row">
          <div className="col-lg-7 my-1">
            <div className="nabl-panel">
              <div className="nabl-panel-head">
                <strong>{t("Clause-wise Readiness (ISO 15189:2022)")}</strong>
                <CustomButton text={t("Drill down")} size="sm" variant="outline" onClick={() => setActiveTab("checklist")} />
              </div>
              {(data.clauseReadiness || []).map((row) => (
                <div className="nabl-clause-row" key={row.clause}>
                  <div className="nabl-clause-label">
                    {row.clause} — {row.title}
                  </div>
                  <div className="nabl-track">
                    <div className={`nabl-fill ${row.tone}`} style={{ width: `${row.percent}%` }} />
                  </div>
                  <div className="nabl-clause-pct">{Number(row.percent).toFixed(0)}%</div>
                </div>
              ))}
              <div className="nabl-note">{data.readinessNote}</div>
            </div>
          </div>

          <div className="col-lg-5 my-1">
            <div className="nabl-panel">
              <div className="nabl-panel-head">
                <div>
                  <strong>{t("Checklist Item Status")}</strong>
                  <div className="text-muted" style={{ fontSize: 12 }}>
                    {data.checklistStatus.totalItems} {t("items")} · {data.checklistStatus.edition}
                  </div>
                </div>
              </div>
              <div className="nabl-donut-wrap">
                <DonutChart slices={data.checklistStatus.slices || []} />
                <div>
                  {(data.checklistStatus.slices || []).map((slice) => (
                    <div className="nabl-legend-item" key={slice.label}>
                      <span className="nabl-dot" style={{ background: slice.color }} />
                      {slice.label}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="row">
          <div className="col-lg-6 my-1">
            <div className="nabl-panel">
              <div className="nabl-panel-head">
                <strong>{t("Document Lifecycle Pipeline")}</strong>
              </div>
              <div className="nabl-bars">
                {(data.documentLifecycle || []).map((row) => (
                  <div className="nabl-bar-col" key={row.label}>
                    <div
                      className="nabl-bar"
                      style={{
                        height: `${Math.max(8, (row.count / maxLifecycle) * 160)}px`,
                        background: row.color,
                      }}
                      title={`${row.label}: ${row.count}`}
                    />
                    <div className="nabl-bar-label">{row.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="col-lg-6 my-1">
            <div className="nabl-panel">
              <div className="nabl-panel-head">
                <strong>{t("Findings Trend — 12 Months")}</strong>
              </div>
              <div className="nabl-line-chart">
                <Line data={lineData} options={lineOptions} />
              </div>
            </div>
          </div>
        </div>

        <div className="row">
          <div className="col-lg-4 my-1">
            <div className="nabl-panel">
              <div className="nabl-panel-head">
                <strong>{t("Needs Attention")}</strong>
                <span className="badge bg-light text-muted">{t("auto-escalated")}</span>
              </div>
              <TimelineList items={data.needsAttention} />
            </div>
          </div>
          <div className="col-lg-4 my-1">
            <div className="nabl-panel">
              <div className="nabl-panel-head">
                <strong>{t("Upcoming Audits")}</strong>
              </div>
              <TimelineList items={data.upcomingAudits} />
            </div>
          </div>
          <div className="col-lg-4 my-1">
            <div className="nabl-panel">
              <div className="nabl-panel-head">
                <strong>{t("Acknowledgement & Training")}</strong>
              </div>
              {(data.training || []).map((row) => (
                <div className="nabl-progress-row" key={row.label}>
                  <div className="nabl-progress-label">
                    <span>{row.label}</span>
                    <span>{Number(row.percent).toFixed(0)}%</span>
                  </div>
                  <div className="nabl-track">
                    <div className={`nabl-fill ${row.tone}`} style={{ width: `${row.percent}%` }} />
                  </div>
                </div>
              ))}
              <CustomButton
                text={t("Open Training Matrix")}
                icon="table"
                variant="outline"
                onClick={() => setActiveTab("training")}
              />
            </div>
          </div>
        </div>
      </div>
    </Accordion>
  );
};

export default Dashboard;
