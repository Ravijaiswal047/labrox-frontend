import React, { useEffect, useState } from "react";
import { axiosInstance } from "../../utils/axiosInstance";
import { toast } from "react-toastify";
import moment from "moment";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
} from "recharts";
import Loading from "../../components/loader/Loading";

const COLORS = {
  total: "#3b82f6",
  approved: "#22c55e",
  pending: "#f97316",
  rejected: "#ef4444",
  free: "#8b5cf6",
  paid: "#f43f5e",
};
const PIE_COLORS = ["#22c55e", "#f97316", "#ef4444"];

// ─── SparklineCard ─────────────────────────────────────────────────────────────
const SparklineCard = ({ uid, title, value, suffix = "", color, sparkData, trendLabel, trendUp, subText }) => (
  <div
    style={{
      background: "#fff",
      borderRadius: "12px",
      padding: "12px 14px 0",
      boxShadow: "0 1px 10px rgba(0,0,0,0.07)",
      flex: 1,
      minWidth: "130px",
      overflow: "hidden",
      display: "flex",
      flexDirection: "column",
    }}
  >
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
      <span style={{ fontSize: "9.5px", fontWeight: "700", color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.8px" }}>
        {title}
      </span>
      <div style={{ width: "26px", height: "26px", borderRadius: "7px", background: `${color}18`, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ width: "10px", height: "10px", borderRadius: "3px", background: color, opacity: 0.85 }} />
      </div>
    </div>

    <div style={{ fontSize: "26px", fontWeight: "800", color, marginTop: "6px", lineHeight: 1, letterSpacing: "-0.5px" }}>
      {value}{suffix}
    </div>

    <div style={{ marginTop: "4px", display: "flex", alignItems: "center", gap: "6px", minHeight: "18px" }}>
      {trendLabel && (
        <span style={{ background: trendUp ? "#dcfce7" : "#fee2e2", color: trendUp ? "#16a34a" : "#dc2626", borderRadius: "20px", padding: "1px 7px", fontSize: "9.5px", fontWeight: "700" }}>
          {trendUp ? "▲" : "▼"} {trendLabel}
        </span>
      )}
      {subText && <span style={{ color: "#9ca3af", fontSize: "10px" }}>{subText}</span>}
    </div>

    <div style={{ marginTop: "auto", marginLeft: "-14px", marginRight: "-14px" }}>
      <ResponsiveContainer width="100%" height={48}>
        <AreaChart data={sparkData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id={`sg${uid}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={color} stopOpacity={0.3} />
              <stop offset="95%" stopColor={color} stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <Area type="monotone" dataKey="v" stroke={color} strokeWidth={1.5} fill={`url(#sg${uid})`} dot={false} activeDot={false} isAnimationActive={false} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  </div>
);

// ─── PipelineStep ──────────────────────────────────────────────────────────────
const PipelineStep = ({ label, count, color, statusText, variant, isLast }) => {
  const isDone = variant === "done";
  const isBottleneck = variant === "bottleneck";
  const badgeBg = isDone ? "#dcfce7" : isBottleneck ? "#fee2e2" : "#fef3c7";
  const badgeColor = isDone ? "#16a34a" : isBottleneck ? "#dc2626" : "#d97706";
  return (
    <div style={{ display: "flex", alignItems: "center", flex: isLast ? "none" : 1 }}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", minWidth: "72px" }}>
        <div style={{
          width: "52px", height: "52px", borderRadius: "50%",
          border: `2.5px solid ${color}`,
          background: isDone && count > 0 ? color : `${color}15`,
          display: "flex", alignItems: "center", justifyContent: "center",
          position: "relative",
          boxShadow: `0 3px 10px ${color}28`,
        }}>
          {isDone && count > 0 && (
            <div style={{ position: "absolute", top: "-1px", right: "-1px", width: "16px", height: "16px", borderRadius: "50%", background: color, display: "flex", alignItems: "center", justifyContent: "center", border: "2px solid white" }}>
              <span style={{ color: "white", fontSize: "8px", fontWeight: "800", lineHeight: 1 }}>✓</span>
            </div>
          )}
          <span style={{ fontSize: "16px", fontWeight: "800", color: isDone && count > 0 ? "white" : color }}>
            {count}
          </span>
        </div>
        <div style={{ marginTop: "6px", fontSize: "11px", fontWeight: "600", color: "#374151", textAlign: "center", lineHeight: 1.2 }}>
          {label}
        </div>
        <span style={{ marginTop: "3px", fontSize: "9px", fontWeight: "700", padding: "1px 7px", borderRadius: "8px", background: badgeBg, color: badgeColor }}>
          {statusText}
        </span>
      </div>
      {!isLast && (
        <div style={{ flex: 1, display: "flex", alignItems: "center", margin: "0 4px", marginBottom: "28px" }}>
          <div style={{ flex: 1, height: "1.5px", background: "#e5e7eb" }} />
          <span style={{ color: "#9ca3af", fontSize: "14px", marginLeft: "1px" }}>›</span>
        </div>
      )}
    </div>
  );
};

// ─── SectionHeader ─────────────────────────────────────────────────────────────
const SectionHeader = ({ title, badge }) => (
  <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
    <span style={{ width: "7px", height: "7px", borderRadius: "50%", background: "#3b82f6", display: "inline-block", flexShrink: 0 }} />
    <span style={{ fontWeight: "700", fontSize: "13px", color: "#111827" }}>{title}</span>
    {badge && (
      <span style={{ fontSize: "10px", background: "#dcfce7", color: "#16a34a", padding: "1px 7px", borderRadius: "8px", fontWeight: "700" }}>
        {badge}
      </span>
    )}
  </div>
);

// ─── Chart Tooltip ──────────────────────────────────────────────────────────────
const ChartTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: "white", border: "1px solid #e5e7eb", borderRadius: "10px", padding: "8px 12px", fontSize: "12px", boxShadow: "0 4px 16px rgba(0,0,0,0.1)" }}>
      <p style={{ fontWeight: "700", marginBottom: "4px", color: "#111827" }}>{label}</p>
      {payload.map((p) => (
        <p key={p.name} style={{ color: p.color || p.fill, margin: "1px 0" }}>{p.name}: <strong>{p.value}</strong></p>
      ))}
    </div>
  );
};

// ─── Main Component ────────────────────────────────────────────────────────────
const CampAnalysisDashboard = ({ filters, accessCentre = [] }) => {
  const [loading, setLoading] = useState(false);
  const [hasData, setHasData] = useState(false);

  const [kpi, setKpi] = useState({ total: 0, approved: 0, pending: 0, rejected: 0, free: 0, paid: 0 });
  const [pipeline, setPipeline] = useState({ planned: 0, total: 0, pending: 0, approved: 0, rejected: 0 });
  const [monthlyData, setMonthlyData] = useState([]);
  const [comparisonData, setComparisonData] = useState([]);
  const [statusPie, setStatusPie] = useState([]);

  const processData = (plannedCamps, requestCamps) => {
    const total = requestCamps.length;
    const approved = requestCamps.filter((c) => c.IsApproved === 1 && c.IsActive === 1).length;
    const pending = requestCamps.filter((c) => c.IsApproved === 0 && c.IsActive === 1).length;
    const rejected = requestCamps.filter((c) => c.IsActive === 0).length;
    const free = requestCamps.filter((c) => {
      const ct = (c.CampType || "").toString();
      return ct === "1" || ct.toLowerCase() === "free";
    }).length;
    const paid = total - free;

    setKpi({ total, approved, pending, rejected, free, paid });
    setPipeline({ planned: plannedCamps.length, total, pending, approved, rejected });

    // Monthly breakdown
    const monthMap = {};
    requestCamps.forEach((camp) => {
      const key = moment(camp.StartDate).format("MMM YY");
      const sortKey = moment(camp.StartDate).startOf("month").valueOf();
      if (!monthMap[key]) monthMap[key] = { month: key, sortKey, Total: 0, Approved: 0, Pending: 0, Rejected: 0, Free: 0, Paid: 0 };
      monthMap[key].Total += 1;
      if (camp.IsActive === 0) monthMap[key].Rejected += 1;
      else if (camp.IsApproved === 1) monthMap[key].Approved += 1;
      else monthMap[key].Pending += 1;
      const ct = (camp.CampType || "").toString();
      if (ct === "1" || ct.toLowerCase() === "free") monthMap[key].Free += 1;
      else monthMap[key].Paid += 1;
    });
    setMonthlyData(Object.values(monthMap).sort((a, b) => a.sortKey - b.sortKey));

    // Comparison: planned vs approved per month
    const compMap = {};
    plannedCamps.forEach((camp) => {
      const key = moment(camp.StartDate).format("MMM YY");
      const sortKey = moment(camp.StartDate).startOf("month").valueOf();
      if (!compMap[key]) compMap[key] = { month: key, sortKey, Planned: 0, Approved: 0 };
      compMap[key].Planned += 1;
    });
    requestCamps.forEach((camp) => {
      if (camp.IsApproved !== 1 || camp.IsActive !== 1) return;
      const key = moment(camp.StartDate).format("MMM YY");
      const sortKey = moment(camp.StartDate).startOf("month").valueOf();
      if (!compMap[key]) compMap[key] = { month: key, sortKey, Planned: 0, Approved: 0 };
      compMap[key].Approved += 1;
    });
    setComparisonData(Object.values(compMap).sort((a, b) => a.sortKey - b.sortKey));

    setStatusPie([
      { name: "Approved", value: approved },
      { name: "Pending", value: pending },
      { name: "Rejected", value: rejected },
    ].filter((d) => d.value > 0));

    setHasData(true);
  };

  const fetchData = async () => {
    if (!filters?.FromDate || !filters?.ToDate) return;
    setLoading(true);
    setHasData(false);
    try {
      const fromFmt = moment(filters.FromDate).format("YYYY-MM-DD");
      const toFmt = moment(filters.ToDate).format("YYYY-MM-DD");

      const [plannedRes, requestRes] = await Promise.all([
        axiosInstance.post("Camp/getCampCreation", {
          fromDate: fromFmt,
          toDate: toFmt,
          searchType: 0,
          status: 0,
          TypeID: "0",
        }),
        axiosInstance.post("Camp/SearchCampRequestforapproval", {
          FromDate: `${fromFmt} 00:00:00`,
          ToDate: `${toFmt} 23:59:59`,
          SearchType: "0",
          status: "-1",
          TypeID: "0",
        }),
      ]);

      const planned = Array.isArray(plannedRes?.data?.message) ? plannedRes.data.message : [];
      const requests = Array.isArray(requestRes?.data?.message) ? requestRes.data.message : [];

      if (!planned.length && !requests.length) {
        setHasData(false);
        return;
      }
      processData(planned, requests);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to load camp dashboard data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [filters]);

  const pad = (arr) => arr.length < 2 ? [{ v: 0 }, ...arr] : arr;
  const spark = {
    total:    pad(monthlyData.map((m) => ({ v: m.Total }))),
    approved: pad(monthlyData.map((m) => ({ v: m.Approved }))),
    pending:  pad(monthlyData.map((m) => ({ v: m.Pending }))),
    rejected: pad(monthlyData.map((m) => ({ v: m.Rejected }))),
    free:     pad(monthlyData.map((m) => ({ v: m.Free }))),
    paid:     pad(monthlyData.map((m) => ({ v: m.Paid }))),
  };

  const approvalRate = kpi.total > 0 ? Math.round((kpi.approved / kpi.total) * 100) : 0;
  const rejectionRate = kpi.total > 0 ? Math.round((kpi.rejected / kpi.total) * 100) : 0;
  const pendingRate = kpi.total > 0 ? Math.round((kpi.pending / kpi.total) * 100) : 0;

  const card = { padding: "16px", borderRadius: "12px", background: "white", boxShadow: "0 1px 10px rgba(0,0,0,0.06)" };

  return (
    <div style={{ background: "#f8fafc", padding: "2px 0 16px" }}>
      {loading && (
        <div style={{ display: "flex", justifyContent: "center", padding: "40px" }}>
          <Loading />
        </div>
      )}

      {!loading && !hasData && (
        <div style={{ textAlign: "center", padding: "40px 0", color: "#9ca3af", fontSize: "13px" }}>
          No camp data found for the selected date range.
        </div>
      )}

      {hasData && !loading && (
        <>
          {/* KPI Cards */}
          <div style={{ marginBottom: "14px" }}>
            <SectionHeader title="Key Metrics" />
            <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
              <SparklineCard uid="tot" title="Total Requests"   value={kpi.total}    color={COLORS.total}    sparkData={spark.total}    subText="selected period" />
              <SparklineCard uid="apr" title="Approved Camps"   value={kpi.approved} color={COLORS.approved} sparkData={spark.approved} trendLabel={`${approvalRate}% of total`} trendUp={approvalRate >= 60} />
              <SparklineCard uid="pnd" title="Pending Approval" value={kpi.pending}  color={COLORS.pending}  sparkData={spark.pending}  trendLabel={kpi.pending > 0 ? `${pendingRate}%` : null} trendUp={false} />
              <SparklineCard uid="rej" title="Rejected"         value={kpi.rejected} color={COLORS.rejected} sparkData={spark.rejected} trendLabel={kpi.rejected > 0 ? `${rejectionRate}%` : null} trendUp={false} />
              <SparklineCard uid="fre" title="Free Camps"       value={kpi.free}     color={COLORS.free}     sparkData={spark.free}     subText={`of ${kpi.total} total`} />
              <SparklineCard uid="pad" title="Paid Camps"       value={kpi.paid}     color={COLORS.paid}     sparkData={spark.paid}     subText={`of ${kpi.total} total`} />
            </div>
          </div>

          {/* Pipeline */}
          <div style={{ ...card, marginBottom: "14px", padding: "16px 20px 14px" }}>
            <SectionHeader title="Camp Pipeline" badge="Live" />
            <div style={{ display: "flex", alignItems: "center", overflowX: "auto" }}>
              <PipelineStep label="Planned"   count={pipeline.planned}  color="#3b82f6" statusText={pipeline.planned > 0 ? "Created" : "None"}        variant="done" />
              <PipelineStep label="Submitted" count={pipeline.total}    color="#06b6d4" statusText={pipeline.total > 0 ? "In Review" : "None"}          variant={pipeline.total > 0 ? "progress" : "done"} />
              <PipelineStep label="Pending"   count={pipeline.pending}  color={COLORS.pending} statusText={pipeline.pending > pipeline.approved ? "Bottleneck" : pipeline.pending > 0 ? "In Progress" : "Clear"} variant={pipeline.pending > pipeline.approved ? "bottleneck" : pipeline.pending > 0 ? "progress" : "done"} />
              <PipelineStep label="Approved"  count={pipeline.approved} color={COLORS.approved} statusText={pipeline.approved > 0 ? "Done" : "None"}    variant={pipeline.approved > 0 ? "done" : "progress"} />
              <PipelineStep label="Rejected"  count={pipeline.rejected} color={COLORS.rejected} statusText={pipeline.rejected > 0 ? "Rejected" : "None"} variant={pipeline.rejected > 0 ? "bottleneck" : "done"} isLast />
            </div>
          </div>

          {/* Planned vs Approved bar */}
          <div style={{ ...card, marginBottom: "14px" }}>
            <SectionHeader title="Planned vs Approved — Monthly" />
            <ResponsiveContainer width="100%" height={230}>
              <BarChart data={comparisonData} margin={{ top: 4, right: 12, left: 0, bottom: 0 }} barCategoryGap="32%">
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#6b7280" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "#6b7280" }} axisLine={false} tickLine={false} />
                <Tooltip content={<ChartTooltip />} />
                <Legend wrapperStyle={{ fontSize: "12px", paddingTop: "8px" }} iconType="circle" iconSize={9} />
                <Bar dataKey="Planned"  fill="#8b5cf6" radius={[4, 4, 0, 0]} maxBarSize={50} />
                <Bar dataKey="Approved" fill="#22c55e" radius={[4, 4, 0, 0]} maxBarSize={50} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Bottom row */}
          <div className="row g-2 mb-3">
            <div className="col-md-5">
              <div style={{ ...card, height: "270px" }}>
                <SectionHeader title="Monthly Status" />
                <ResponsiveContainer width="100%" height={210}>
                  <BarChart data={monthlyData} margin={{ top: 2, right: 8, left: 0, bottom: 0 }} barCategoryGap="35%">
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                    <XAxis dataKey="month" tick={{ fontSize: 10, fill: "#6b7280" }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 10, fill: "#6b7280" }} axisLine={false} tickLine={false} />
                    <Tooltip content={<ChartTooltip />} />
                    <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: "11px" }} />
                    <Bar dataKey="Approved" stackId="s" fill={COLORS.approved} maxBarSize={50} />
                    <Bar dataKey="Pending"  stackId="s" fill={COLORS.pending}  maxBarSize={50} />
                    <Bar dataKey="Rejected" stackId="s" fill={COLORS.rejected} radius={[3, 3, 0, 0]} maxBarSize={50} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="col-md-3">
              <div style={{ ...card, height: "270px" }}>
                <SectionHeader title="Status Split" />
                <ResponsiveContainer width="100%" height={210}>
                  <PieChart>
                    <Pie data={statusPie} cx="50%" cy="50%" innerRadius={48} outerRadius={76} paddingAngle={4} dataKey="value">
                      {statusPie.map((entry, i) => <Cell key={entry.name} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                    </Pie>
                    <Tooltip contentStyle={{ borderRadius: "10px", fontSize: "12px" }} formatter={(v, n) => [v, n]} />
                    <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: "11px" }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="col-md-4">
              <div style={{ ...card, height: "270px" }}>
                <SectionHeader title="Quick Stats" />
                {[
                  { label: "Approval Rate",   value: `${approvalRate}%`,  color: approvalRate >= 70 ? COLORS.approved : COLORS.pending, bg: approvalRate >= 70 ? "#dcfce7" : "#fef3c7" },
                  { label: "Rejection Rate",  value: `${rejectionRate}%`, color: rejectionRate > 20 ? COLORS.rejected : "#6b7280",      bg: rejectionRate > 20 ? "#fee2e2" : "#f3f4f6" },
                  { label: "Pending Rate",    value: `${pendingRate}%`,   color: pendingRate > 30 ? COLORS.pending : "#6b7280",          bg: pendingRate > 30 ? "#fff7ed" : "#f3f4f6" },
                  { label: "Free Camp Share", value: `${kpi.total > 0 ? Math.round((kpi.free / kpi.total) * 100) : 0}%`, color: COLORS.free, bg: "#f3e8ff" },
                  { label: "Paid Camp Share", value: `${kpi.total > 0 ? Math.round((kpi.paid / kpi.total) * 100) : 0}%`, color: COLORS.paid, bg: "#ffe4e6" },
                ].map((stat, i, arr) => (
                  <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: i < arr.length - 1 ? "1px solid #f1f5f9" : "none" }}>
                    <span style={{ fontSize: "12px", color: "#6b7280", fontWeight: "500" }}>{stat.label}</span>
                    <span style={{ fontSize: "15px", fontWeight: "800", color: stat.color, background: stat.bg, padding: "2px 9px", borderRadius: "7px" }}>{stat.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Summary Table */}
          <div style={card}>
            <SectionHeader title="Monthly Summary" />
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "12px" }}>
                <thead>
                  <tr style={{ background: "#f8fafc" }}>
                    {["Month", "Total", "Approved", "Pending", "Rejected", "Free", "Paid", "Approval %"].map((h) => (
                      <th key={h} style={{ padding: "8px 12px", textAlign: h === "Month" ? "left" : "center", fontWeight: "700", color: "#6b7280", fontSize: "10px", textTransform: "uppercase", letterSpacing: "0.4px", borderBottom: "2px solid #e5e7eb", whiteSpace: "nowrap" }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {monthlyData.map((row, i) => {
                    const rr = row.Total > 0 ? Math.round((row.Approved / row.Total) * 100) : 0;
                    return (
                      <tr key={i} style={{ borderBottom: "1px solid #f1f5f9" }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = "#f8fafc")}
                        onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}>
                        <td style={{ padding: "7px 12px", fontWeight: "600", color: "#111827" }}>{row.month}</td>
                        <td style={{ padding: "7px 12px", textAlign: "center", color: COLORS.total, fontWeight: "700" }}>{row.Total}</td>
                        <td style={{ padding: "7px 12px", textAlign: "center", color: COLORS.approved }}>{row.Approved}</td>
                        <td style={{ padding: "7px 12px", textAlign: "center", color: COLORS.pending }}>{row.Pending}</td>
                        <td style={{ padding: "7px 12px", textAlign: "center", color: COLORS.rejected }}>{row.Rejected}</td>
                        <td style={{ padding: "7px 12px", textAlign: "center", color: COLORS.free }}>{row.Free}</td>
                        <td style={{ padding: "7px 12px", textAlign: "center", color: COLORS.paid }}>{row.Paid}</td>
                        <td style={{ padding: "7px 12px", textAlign: "center" }}>
                          <span style={{ background: rr >= 70 ? "#dcfce7" : rr >= 40 ? "#fef3c7" : "#fee2e2", color: rr >= 70 ? "#16a34a" : rr >= 40 ? "#d97706" : "#dc2626", padding: "1px 7px", borderRadius: "8px", fontSize: "10px", fontWeight: "700" }}>
                            {row.Total > 0 ? `${rr}%` : "—"}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot>
                  <tr style={{ background: "#f8fafc", fontWeight: "700", borderTop: "2px solid #e5e7eb" }}>
                    <td style={{ padding: "7px 12px", color: "#111827" }}>Total</td>
                    <td style={{ padding: "7px 12px", textAlign: "center", color: COLORS.total }}>{kpi.total}</td>
                    <td style={{ padding: "7px 12px", textAlign: "center", color: COLORS.approved }}>{kpi.approved}</td>
                    <td style={{ padding: "7px 12px", textAlign: "center", color: COLORS.pending }}>{kpi.pending}</td>
                    <td style={{ padding: "7px 12px", textAlign: "center", color: COLORS.rejected }}>{kpi.rejected}</td>
                    <td style={{ padding: "7px 12px", textAlign: "center", color: COLORS.free }}>{kpi.free}</td>
                    <td style={{ padding: "7px 12px", textAlign: "center", color: COLORS.paid }}>{kpi.paid}</td>
                    <td style={{ padding: "7px 12px", textAlign: "center" }}>
                      <span style={{ background: approvalRate >= 70 ? "#dcfce7" : "#fee2e2", color: approvalRate >= 70 ? "#16a34a" : "#dc2626", padding: "1px 7px", borderRadius: "8px", fontSize: "10px", fontWeight: "700" }}>
                        {approvalRate}%
                      </span>
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default CampAnalysisDashboard;
