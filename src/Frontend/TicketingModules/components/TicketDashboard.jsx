import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";
import moment from "moment";

import Accordion from "@components/UI/Accordion";
import Tables from "@components/UI/customTable";
import { axiosInstance } from "@app/utils/axiosInstance";
import { useLocalStorage } from "@app/utils/hooks/useLocalStorage";
import { CAT_COLOR_PALETTE } from "../ticketConstants";

const PRIORITY_STYLE = {
  Critical: { background: "#fef2f2", color: "#b91c1c", border: "1px solid #fca5a5" },
  High:     { background: "#fff7ed", color: "#c2410c", border: "1px solid #fed7aa" },
  Medium:   { background: "#eff6ff", color: "#1d4ed8", border: "1px solid #bfdbfe" },
  Low:      { background: "#f0fdf4", color: "#15803d", border: "1px solid #bbf7d0" },
};
const STATUS_STYLE = {
  "Open":        { background: "#dbeafe", color: "#1d4ed8" },
  "In Progress": { background: "#dcfce7", color: "#166534" },
  "Hold":        { background: "#fef9c3", color: "#854d0e" },
  "Escalated":   { background: "#fee2e2", color: "#991b1b" },
  "Resolved":    { background: "#e0f2fe", color: "#0369a1" },
  "Closed":      { background: "#f1f5f9", color: "#475569" },
};
const badgeBase = {
  display: "inline-flex",
  alignItems: "center",
  padding: "3px 10px",
  borderRadius: 999,
  fontSize: 11,
  fontWeight: 600,
  whiteSpace: "nowrap",
  lineHeight: 1.4,
};
const ticketIdStyle = {
  display: "inline-flex",
  alignItems: "center",
  gap: 5,
  background: "#f0f5fb",
  border: "1px solid #c8d6e8",
  borderRadius: 6,
  padding: "3px 9px",
  fontWeight: 700,
  fontSize: 12,
  color: "#3d5a8a",
  whiteSpace: "nowrap",
};

// ── Inline style objects (not affected by any global CSS) ──────────────────
const S = {
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
    gap: 10,
  },
  gridCat: {
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
    gap: 10,
  },
  statCard: (color, border) => ({
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    background: "#fff",
    borderRadius: 10,
    padding: "12px 14px",
    borderLeft: `4px solid ${border}`,
    boxShadow: "0 1px 4px rgba(0,0,0,0.06), 0 4px 14px rgba(0,0,0,0.05)",
    minHeight: 72,
    boxSizing: "border-box",
  }),
  iconBox: (bg) => ({
    width: 40,
    height: 40,
    minWidth: 40,
    borderRadius: 10,
    background: bg,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  }),
  statValue: (color) => ({
    fontSize: 24,
    fontWeight: 800,
    lineHeight: 1,
    color,
    letterSpacing: "-0.5px",
  }),
  statLabel: {
    fontSize: 11,
    color: "#64748b",
    marginTop: 3,
    fontWeight: 500,
    whiteSpace: "nowrap",
  },
  catCard: (borderColor) => ({
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    background: "#fff",
    borderRadius: 10,
    padding: "12px 14px",
    border: `1.5px solid ${borderColor}`,
    boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
    minHeight: 62,
    boxSizing: "border-box",
    overflow: "hidden",
  }),
  catIconBox: (bg) => ({
    width: 36,
    height: 36,
    minWidth: 36,
    borderRadius: 8,
    background: bg,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  }),
  catName: {
    fontSize: 13,
    fontWeight: 700,
    color: "#1e293b",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  catSub: {
    fontSize: 10,
    color: "#94a3b8",
    marginTop: 1,
  },
  catCount: (bg) => ({
    width: 30,
    height: 30,
    minWidth: 30,
    maxWidth: 30,
    borderRadius: 8,
    background: bg,
    color: "#fff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: 800,
    fontSize: 14,
    flexShrink: 0,
    flexGrow: 0,
  }),
  skeleton: (w, h) => ({
    width: w,
    height: h,
    borderRadius: 4,
    background: "#e2e8f0",
  }),
};

const TicketDashboard = () => {
  const [t] = useTranslation();
  const theme = useLocalStorage("theme", "get");

  const [isLoading,     setIsLoading]     = useState(false);
  const [summary,       setSummary]       = useState(null);
  const [catBreakdown,  setCatBreakdown]  = useState([]);
  const [recentTickets, setRecentTickets] = useState([]);

  useEffect(() => { fetchDashboard(); }, []);

  const fetchDashboard = () => {
    setIsLoading(true);
    axiosInstance
      .post("Ticketing/GetDashboardSummary", {
        CentreID: 0,
        FromDate: moment().startOf("month").format("YYYY-MM-DD"),
        ToDate:   moment().format("YYYY-MM-DD"),
      })
      .then((res) => {
        const data = res?.data?.message ?? {};
        setSummary(data?.summary        ?? data?.Summary        ?? null);
        setCatBreakdown(data?.categoryBreakdown ?? data?.CategoryBreakdown ?? []);
        setRecentTickets(data?.recentTickets    ?? data?.RecentTickets    ?? []);
      })
      .catch((err) => toast.error(err?.response?.data?.message))
      .finally(() => setIsLoading(false));
  };

  const s = summary ?? {};
  const statCards = [
    { label: "Total Tickets",     value: s.TotalTickets       ?? 0, icon: "bi bi-ticket-perforated-fill",    color: "#3d5a8a", bg: "#e8f0fb", border: "#3d5a8a" },
    { label: "Open",              value: s.OpenTickets        ?? 0, icon: "bi bi-folder2-open",              color: "#1d4ed8", bg: "#dbeafe", border: "#1d4ed8" },
    { label: "In Progress",       value: s.InProgressTickets  ?? 0, icon: "bi bi-arrow-repeat",              color: "#065f46", bg: "#d1fae5", border: "#059669" },
    { label: "On Hold",           value: s.OnHoldTickets      ?? 0, icon: "bi bi-pause-circle-fill",         color: "#6d28d9", bg: "#ede9fe", border: "#7c3aed" },
    { label: "Escalated",         value: s.EscalatedTickets   ?? 0, icon: "bi bi-exclamation-triangle-fill", color: "#991b1b", bg: "#fee2e2", border: "#dc2626" },
    { label: "Resolved / Closed", value: (s.ResolvedTickets   ?? 0) + (s.ClosedTickets ?? 0), icon: "bi bi-check-circle-fill", color: "#166534", bg: "#dcfce7", border: "#16a34a" },
    { label: "SLA Breached",      value: s.SLABreachedTickets ?? 0, icon: "bi bi-clock-history",             color: "#92400e", bg: "#fef3c7", border: "#d97706" },
    { label: "SLA At Risk",       value: s.SLAAtRiskTickets   ?? 0, icon: "bi bi-hourglass-split",           color: "#b45309", bg: "#fef9c3", border: "#f59e0b" },
  ];

  return (
    <div className={`${theme}`}>

      {/* ── Stat Cards ── */}
      <Accordion title="Overview" defaultValue={true} isBreadcrumb={true}>
        <div style={{ padding: "10px 12px" }}>
          <div style={S.grid}>
            {statCards.map((card, i) => (
              <div key={i} style={S.statCard(card.color, card.border)}>
                <div style={S.iconBox(card.bg)}>
                  <i className={card.icon} style={{ fontSize: 19, color: card.color }} />
                </div>
                <div style={{ minWidth: 0 }}>
                  <div style={S.statValue(card.color)}>
                    {isLoading
                      ? <span style={S.skeleton(28, 18)} />
                      : card.value}
                  </div>
                  <div style={S.statLabel}>{t(card.label)}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Accordion>

      {/* ── Category Breakdown ── */}
      <Accordion title="Tickets by Category" defaultValue={true}>
        <div style={{ padding: "10px 12px" }}>
          {isLoading ? (
            <div style={S.gridCat}>
              {[0, 1, 2, 3].map((i) => (
                <div key={i} style={S.catCard("#e2e8f0")}>
                  <div style={S.catIconBox("#f1f5f9")}>
                    <div style={S.skeleton(20, 20)} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={S.skeleton("65%", 12)} />
                    <div style={{ ...S.skeleton("40%", 9), marginTop: 5 }} />
                  </div>
                  <div style={S.catCount("#cbd5e1")}>—</div>
                </div>
              ))}
            </div>
          ) : catBreakdown.length > 0 ? (
            <div style={S.gridCat}>
              {catBreakdown.map((cat, i) => {
                const pal = CAT_COLOR_PALETTE[i % CAT_COLOR_PALETTE.length];
                return (
                  <div key={cat.CategoryID} style={S.catCard(pal.color + "44")}>
                    <div style={S.catIconBox(pal.bgColor)}>
                      <i className={pal.icon} style={{ fontSize: 18, color: pal.color }} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={S.catName}>{t(cat.CategoryName)}</div>
                      <div style={S.catSub}>Tickets</div>
                    </div>
                    <div style={S.catCount(pal.color)}>{cat.Count}</div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div style={{ textAlign: "center", color: "#94a3b8", fontSize: 13, padding: "20px 0" }}>
              <i className="bi bi-grid" style={{ fontSize: 30, display: "block", marginBottom: 6 }} />
              {t("No category data for this period")}
            </div>
          )}
        </div>
      </Accordion>

      {/* ── Recent Tickets ── */}
      <Accordion title="Recent Tickets" defaultValue={true}>
        <div style={{ padding: "4px 12px 12px" }}>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <thead>
                <tr style={{ background: "linear-gradient(90deg,#6d28d9 0%,#4a6fa5 100%)" }}>
                  {["Ticket ID","Category","Patient","Priority","Status","Created"].map((h) => (
                    <th key={h} style={{
                      padding: "9px 12px",
                      color: "#fff",
                      fontWeight: 600,
                      fontSize: 12,
                      textAlign: "left",
                      whiteSpace: "nowrap",
                      letterSpacing: "0.3px",
                    }}>
                      {t(h)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={6} style={{ textAlign: "center", padding: "20px 0", color: "#94a3b8" }}>
                      <span className="spinner-border spinner-border-sm" style={{ marginRight: 6 }} />
                      {t("Loading...")}
                    </td>
                  </tr>
                ) : recentTickets.length > 0 ? (
                  recentTickets.map((tkt, i) => (
                    <tr key={i} style={{
                      background: i % 2 === 0 ? "#fff" : "#f8fafc",
                      borderBottom: "1px solid #e2e8f0",
                      transition: "background 0.15s",
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = "#f0f5fb"}
                    onMouseLeave={e => e.currentTarget.style.background = i % 2 === 0 ? "#fff" : "#f8fafc"}
                    >
                      <td style={{ padding: "9px 12px", whiteSpace: "nowrap" }}>
                        <span style={ticketIdStyle}>
                          <i className="bi bi-ticket-perforated" style={{ fontSize: 11, lineHeight: 1 }} />
                          {tkt.TicketNo}
                        </span>
                      </td>
                      <td style={{ padding: "9px 12px", color: "#334155", fontWeight: 500 }}>
                        {t(tkt.CategoryName)}
                      </td>
                      <td style={{ padding: "9px 12px", color: "#334155" }}>
                        {tkt.PatientName}
                      </td>
                      <td style={{ padding: "9px 12px" }}>
                        <span style={{ ...badgeBase, ...(PRIORITY_STYLE[tkt.Priority] ?? {}) }}>
                          {t(tkt.Priority)}
                        </span>
                      </td>
                      <td style={{ padding: "9px 12px" }}>
                        <span style={{ ...badgeBase, ...(STATUS_STYLE[tkt.Status] ?? {}) }}>
                          {t(tkt.Status)}
                        </span>
                      </td>
                      <td style={{ padding: "9px 12px", fontSize: 11, color: "#64748b", whiteSpace: "nowrap" }}>
                        {tkt.CreatedDate
                          ? moment(tkt.CreatedDate?.value ?? tkt.CreatedDate).format("DD-MMM-YY HH:mm")
                          : "—"}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} style={{ textAlign: "center", color: "#94a3b8", padding: "24px 0" }}>
                      <i className="bi bi-ticket-perforated" style={{ fontSize: 26, display: "block", marginBottom: 6 }} />
                      {t("No tickets created this month")}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </Accordion>

    </div>
  );
};

export default TicketDashboard;
