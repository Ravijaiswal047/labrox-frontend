import React, { useState, useEffect } from "react";
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
  total:    "#3b82f6",
  approved: "#22c55e",
  pending:  "#f97316",
  rejected: "#ef4444",
  free:     "#8b5cf6",
  paid:     "#f43f5e",
};
const STATUS_COLORS = ["#22c55e", "#f97316", "#ef4444"];
const TYPE_COLORS   = ["#8b5cf6", "#f43f5e"];

// ─── SparklineCard ─────────────────────────────────────────────────────────────
const SparklineCard = ({ uid, title, value, suffix = "", color, sparkData, trendLabel, trendUp, subText }) => (
  <div style={{
    background: "#fff",
    borderRadius: "12px",
    padding: "12px 14px 0",
    boxShadow: "0 1px 10px rgba(0,0,0,0.07)",
    flex: 1,
    minWidth: "130px",
    overflow: "hidden",
    display: "flex",
    flexDirection: "column",
  }}>
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
            <linearGradient id={`ms${uid}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%"  stopColor={color} stopOpacity={0.3} />
              <stop offset="95%" stopColor={color} stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <Area type="monotone" dataKey="v" stroke={color} strokeWidth={1.5} fill={`url(#ms${uid})`} dot={false} activeDot={false} isAnimationActive={false} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  </div>
);

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

// ─── Chart Tooltip ─────────────────────────────────────────────────────────────
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

const card = { padding: "16px", borderRadius: "12px", background: "white", boxShadow: "0 1px 10px rgba(0,0,0,0.06)" };
const pad = (arr) => arr.length < 2 ? [{ v: 0 }, ...arr] : arr;

// ─── Main Component ────────────────────────────────────────────────────────────
const CampMonthlySummaryDashboard = ({ filters, accessCentre = [] }) => {
  const [loading, setLoading] = useState(false);
  const [hasData, setHasData] = useState(false);

  const [kpi, setKpi] = useState({ total: 0, approved: 0, pending: 0, rejected: 0, free: 0, paid: 0 });
  const [monthlyData,  setMonthlyData]  = useState([]);
  const [statusPie,    setStatusPie]    = useState([]);
  const [typePie,      setTypePie]      = useState([]);

  const processData = (data) => {
    const total    = data.length;
    const approved = data.filter((c) => c.IsApproved === 1 && c.IsActive === 1).length;
    const pending  = data.filter((c) => c.IsApproved === 0 && c.IsActive === 1).length;
    const rejected = data.filter((c) => c.IsActive === 0).length;
    const free     = data.filter((c) => { const t = (c.CampType || "").toString(); return t === "1" || t.toLowerCase() === "free"; }).length;
    const paid     = total - free;
    setKpi({ total, approved, pending, rejected, free, paid });

    const monthMap = {};
    data.forEach((camp) => {
      const key     = moment(camp.StartDate).format("MMM YY");
      const sortKey = moment(camp.StartDate).startOf("month").valueOf();
      if (!monthMap[key]) monthMap[key] = { month: key, sortKey, Total: 0, Approved: 0, Pending: 0, Rejected: 0, Free: 0, Paid: 0 };
      monthMap[key].Total += 1;
      if (camp.IsActive === 0) monthMap[key].Rejected += 1;
      else if (camp.IsApproved === 1) monthMap[key].Approved += 1;
      else monthMap[key].Pending += 1;
      const t = (camp.CampType || "").toString();
      if (t === "1" || t.toLowerCase() === "free") monthMap[key].Free += 1;
      else monthMap[key].Paid += 1;
    });
    setMonthlyData(Object.values(monthMap).sort((a, b) => a.sortKey - b.sortKey));

    setStatusPie([
      { name: "Approved", value: approved },
      { name: "Pending",  value: pending  },
      { name: "Rejected", value: rejected },
    ].filter((d) => d.value > 0));

    setTypePie([
      { name: "Free", value: free },
      { name: "Paid", value: paid },
    ].filter((d) => d.value > 0));

    setHasData(true);
  };

  const handleSearch = () => {
    if (!filters?.FromDate || !filters?.ToDate) return;
    setLoading(true);
    setHasData(false);
    axiosInstance
      .post("Camp/SearchCampRequestforapproval", {
        FromDate:   moment(filters.FromDate).format("YYYY-MM-DD 00:00:00"),
        ToDate:     moment(filters.ToDate).format("YYYY-MM-DD 23:59:59"),
        SearchType: "0",
        status:     "-1",
        TypeID:     "0",
      })
      .then((res) => {
        const data = Array.isArray(res?.data?.message) ? res.data.message : [];
        if (!data.length) { setHasData(false); return; }
        processData(data);
      })
      .catch((err) => toast.error(err?.response?.data?.message || "Failed to load data"))
      .finally(() => setLoading(false));
  };

  useEffect(() => { handleSearch(); }, [filters]);

  const approvalRate  = kpi.total > 0 ? Math.round((kpi.approved / kpi.total) * 100) : 0;
  const rejectionRate = kpi.total > 0 ? Math.round((kpi.rejected / kpi.total) * 100) : 0;
  const pendingRate   = kpi.total > 0 ? Math.round((kpi.pending  / kpi.total) * 100) : 0;

  const spark = {
    total:    pad(monthlyData.map((m) => ({ v: m.Total }))),
    approved: pad(monthlyData.map((m) => ({ v: m.Approved }))),
    pending:  pad(monthlyData.map((m) => ({ v: m.Pending }))),
    rejected: pad(monthlyData.map((m) => ({ v: m.Rejected }))),
    free:     pad(monthlyData.map((m) => ({ v: m.Free }))),
    paid:     pad(monthlyData.map((m) => ({ v: m.Paid }))),
  };

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
              <SparklineCard uid="m0" title="Total Camps"      value={kpi.total}    color={COLORS.total}    sparkData={spark.total}    subText="in period" />
              <SparklineCard uid="m1" title="Approved"         value={kpi.approved} color={COLORS.approved} sparkData={spark.approved} trendLabel={`${approvalRate}% of total`}  trendUp={approvalRate >= 60} />
              <SparklineCard uid="m2" title="Pending Approval" value={kpi.pending}  color={COLORS.pending}  sparkData={spark.pending}  trendLabel={kpi.pending  > 0 ? `${pendingRate}%`   : null} trendUp={false} />
              <SparklineCard uid="m3" title="Rejected"         value={kpi.rejected} color={COLORS.rejected} sparkData={spark.rejected} trendLabel={kpi.rejected > 0 ? `${rejectionRate}%` : null} trendUp={false} />
              <SparklineCard uid="m4" title="Free Camps"       value={kpi.free}     color={COLORS.free}     sparkData={spark.free}     subText={`of ${kpi.total} total`} />
              <SparklineCard uid="m5" title="Paid Camps"       value={kpi.paid}     color={COLORS.paid}     sparkData={spark.paid}     subText={`of ${kpi.total} total`} />
            </div>
          </div>

          {/* Stacked bar — monthly status */}
          <div style={{ ...card, marginBottom: "14px" }}>
            <SectionHeader title="Monthly Camp Count — Status Breakdown" />
            <ResponsiveContainer width="100%" height={230}>
              <BarChart data={monthlyData} margin={{ top: 4, right: 12, left: 0, bottom: 0 }} barCategoryGap="32%">
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#6b7280" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "#6b7280" }} axisLine={false} tickLine={false} />
                <Tooltip content={<ChartTooltip />} />
                <Legend wrapperStyle={{ fontSize: "12px", paddingTop: "8px" }} iconType="circle" iconSize={9} />
                <Bar dataKey="Approved" stackId="s" fill={COLORS.approved} maxBarSize={50} />
                <Bar dataKey="Pending"  stackId="s" fill={COLORS.pending}  maxBarSize={50} />
                <Bar dataKey="Rejected" stackId="s" fill={COLORS.rejected} radius={[4, 4, 0, 0]} maxBarSize={50} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Row 2: Pie charts + Free vs Paid bar */}
          <div className="row g-2 mb-3">
            <div className="col-md-3">
              <div style={{ ...card, height: "270px" }}>
                <SectionHeader title="Status Split" />
                <ResponsiveContainer width="100%" height={215}>
                  <PieChart>
                    <Pie data={statusPie} cx="50%" cy="50%" outerRadius={82} dataKey="value" labelLine={false}
                      label={({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
                        if (percent < 0.06) return null;
                        const R = Math.PI / 180;
                        const r = innerRadius + (outerRadius - innerRadius) * 0.55;
                        return (
                          <text x={cx + r * Math.cos(-midAngle * R)} y={cy + r * Math.sin(-midAngle * R)}
                            fill="white" textAnchor="middle" dominantBaseline="central" fontSize={11} fontWeight="700">
                            {`${(percent * 100).toFixed(0)}%`}
                          </text>
                        );
                      }}>
                      {statusPie.map((entry, i) => <Cell key={entry.name} fill={STATUS_COLORS[i % STATUS_COLORS.length]} />)}
                    </Pie>
                    <Tooltip contentStyle={{ borderRadius: "10px", fontSize: "12px" }} formatter={(v, n) => [v, n]} />
                    <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: "11px" }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="col-md-3">
              <div style={{ ...card, height: "270px" }}>
                <SectionHeader title="Free vs Paid Split" />
                <ResponsiveContainer width="100%" height={215}>
                  <PieChart>
                    <Pie data={typePie} cx="50%" cy="50%" innerRadius={50} outerRadius={82} paddingAngle={4} dataKey="value" labelLine={false}
                      label={({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
                        if (percent < 0.06) return null;
                        const R = Math.PI / 180;
                        const r = innerRadius + (outerRadius - innerRadius) * 0.55;
                        return (
                          <text x={cx + r * Math.cos(-midAngle * R)} y={cy + r * Math.sin(-midAngle * R)}
                            fill="white" textAnchor="middle" dominantBaseline="central" fontSize={11} fontWeight="700">
                            {`${(percent * 100).toFixed(0)}%`}
                          </text>
                        );
                      }}>
                      {typePie.map((entry, i) => <Cell key={entry.name} fill={TYPE_COLORS[i % TYPE_COLORS.length]} />)}
                    </Pie>
                    <Tooltip contentStyle={{ borderRadius: "10px", fontSize: "12px" }} formatter={(v, n) => [v, n]} />
                    <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: "11px" }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="col-md-6">
              <div style={{ ...card, height: "270px" }}>
                <SectionHeader title="Free vs Paid — Monthly" />
                <ResponsiveContainer width="100%" height={215}>
                  <BarChart data={monthlyData} margin={{ top: 4, right: 8, left: 0, bottom: 0 }} barCategoryGap="30%">
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                    <XAxis dataKey="month" tick={{ fontSize: 10, fill: "#6b7280" }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 10, fill: "#6b7280" }} axisLine={false} tickLine={false} />
                    <Tooltip content={<ChartTooltip />} />
                    <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: "11px" }} />
                    <Bar dataKey="Free" fill={COLORS.free} radius={[4, 4, 0, 0]} maxBarSize={50} />
                    <Bar dataKey="Paid" fill={COLORS.paid} radius={[4, 4, 0, 0]} maxBarSize={50} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Summary Table */}
          <div style={card}>
            <SectionHeader title="Monthly Breakdown Table" />
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
                        <td style={{ padding: "7px 12px", textAlign: "center", color: COLORS.total,    fontWeight: "700" }}>{row.Total}</td>
                        <td style={{ padding: "7px 12px", textAlign: "center", color: COLORS.approved }}>{row.Approved}</td>
                        <td style={{ padding: "7px 12px", textAlign: "center", color: COLORS.pending  }}>{row.Pending}</td>
                        <td style={{ padding: "7px 12px", textAlign: "center", color: COLORS.rejected }}>{row.Rejected}</td>
                        <td style={{ padding: "7px 12px", textAlign: "center", color: COLORS.free     }}>{row.Free}</td>
                        <td style={{ padding: "7px 12px", textAlign: "center", color: COLORS.paid     }}>{row.Paid}</td>
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
                    <td style={{ padding: "7px 12px", textAlign: "center", color: COLORS.total    }}>{kpi.total}</td>
                    <td style={{ padding: "7px 12px", textAlign: "center", color: COLORS.approved }}>{kpi.approved}</td>
                    <td style={{ padding: "7px 12px", textAlign: "center", color: COLORS.pending  }}>{kpi.pending}</td>
                    <td style={{ padding: "7px 12px", textAlign: "center", color: COLORS.rejected }}>{kpi.rejected}</td>
                    <td style={{ padding: "7px 12px", textAlign: "center", color: COLORS.free     }}>{kpi.free}</td>
                    <td style={{ padding: "7px 12px", textAlign: "center", color: COLORS.paid     }}>{kpi.paid}</td>
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

export default CampMonthlySummaryDashboard;
