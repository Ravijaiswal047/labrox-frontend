import { axiosInstance } from "../../../utils/axiosInstance";

const first = (obj, ...keys) => {
  for (const key of keys) {
    if (obj?.[key] !== undefined && obj?.[key] !== null) return obj[key];
  }
  return undefined;
};

export const NABL_TABS = [
  { id: "dashboard", label: "Dashboard" },
  { id: "documents", label: "Documents", badgeKey: "documents" },
  { id: "meetings", label: "Meetings" },
  { id: "mrm", label: "MRM", badgeKey: "mrm" },
  { id: "checklist", label: "NABL Checklist" },
  { id: "auditYear", label: "Audit Year" },
  { id: "audits", label: "Audits", badgeKey: "audits" },
  { id: "findings", label: "Findings / CAPA", badgeKey: "findings" },
  { id: "training", label: "Training" },
  { id: "qualityRecords", label: "Quality Records" },
  { id: "reports", label: "Reports" },
  { id: "configuration", label: "Configuration" },
];

export const FALLBACK_FILTERS = {
  centres: [{ value: 0, label: "All Centres" }],
  auditYears: [
    { value: 1, label: "Audit Year 2024-25" },
    { value: 2, label: "Audit Year 2025-26" },
    { value: 3, label: "Audit Year 2026-27" },
  ],
  departments: [{ value: 0, label: "All Departments" }],
  defaultAuditYearId: 3,
  tabBadges: { documents: 148, mrm: 2, audits: 3, findings: 9 },
  user: {
    userName: "Quality Manager",
    role: "Quality Manager",
    roleInitials: "QM",
    standards: "ISO 15189:2022 · NABL 112",
  },
};

export const FALLBACK_DASHBOARD = {
  auditYearLabel: "2026-27",
  tabBadges: { documents: 148, mrm: 2, audits: 3, findings: 9 },
  kpis: [
    { key: "readiness", label: "NABL READINESS (WEIGHTED)", value: "78.4%", accent: "green", trend: "4.2% vs last month", trendUp: true, detail: "", breakdown: [] },
    { key: "findings", label: "OPEN FINDINGS", value: "9", accent: "orange", trend: "", trendUp: false, detail: "", breakdown: [
      { label: "Critical", count: 1, tone: "critical" },
      { label: "Major", count: 3, tone: "major" },
      { label: "Minor", count: 4, tone: "minor" },
      { label: "OFI", count: 1, tone: "ofi" },
    ] },
    { key: "sopReviews", label: "SOP REVIEWS DUE (30 DAYS)", value: "12", accent: "amber", trend: "", trendUp: false, detail: "4 overdue — escalated to QM", breakdown: [] },
    { key: "capa", label: "CAPA EFFECTIVENESS", value: "86%", accent: "teal", trend: "", trendUp: false, detail: "2 awaiting verification · 1 reopened", breakdown: [] },
  ],
  clauseReadiness: [
    { clause: "Cl. 4", title: "General requirements", percent: 92, tone: "green" },
    { clause: "Cl. 5", title: "Structural & governance", percent: 88, tone: "green" },
    { clause: "Cl. 6", title: "Resource requirements", percent: 71, tone: "amber" },
    { clause: "Cl. 7", title: "Process requirements", percent: 74, tone: "amber" },
    { clause: "Cl. 8", title: "Management system", percent: 63, tone: "red" },
  ],
  readinessNote: "Readiness is weighted: compliance status × mandatory evidence validity × document approval × training completion × CAPA effectiveness. Checkbox alone doesn't count.",
  checklistStatus: {
    totalItems: 412,
    edition: "frozen edition 112A R4",
    slices: [
      { label: "Compliant", count: 228, color: "#2f9e44" },
      { label: "Partially compliant", count: 62, color: "#c9a227" },
      { label: "Non-compliant", count: 41, color: "#d94841" },
      { label: "Evidence pending", count: 38, color: "#e67a22" },
      { label: "Not applicable", count: 24, color: "#8b93a7" },
      { label: "Not verified", count: 19, color: "#7eb6d9" },
    ],
  },
  documentLifecycle: [
    { label: "Draft", count: 8, color: "#c5cad6" },
    { label: "Review", count: 12, color: "#e6c84a" },
    { label: "Approved", count: 14, color: "#3d7ea6" },
    { label: "Effective", count: 105, color: "#2f9e44" },
    { label: "Review Due", count: 18, color: "#e67a22" },
    { label: "Obsolete", count: 6, color: "#d0d4de" },
  ],
  findingsTrend: [
    { month: "Oct", raised: 3, closed: 2, overdue: 1 },
    { month: "Nov", raised: 2, closed: 3, overdue: 0 },
    { month: "Dec", raised: 4, closed: 4, overdue: 1 },
    { month: "Jan", raised: 3, closed: 5, overdue: 2 },
    { month: "Feb", raised: 4, closed: 4, overdue: 1 },
    { month: "Mar", raised: 5, closed: 3, overdue: 0 },
    { month: "Apr", raised: 6, closed: 4, overdue: 1 },
    { month: "May", raised: 4, closed: 5, overdue: 0 },
    { month: "Jun", raised: 5, closed: 4, overdue: 1 },
    { month: "Jul", raised: 3, closed: 3, overdue: 0 },
    { month: "Aug", raised: 2, closed: 4, overdue: 1 },
    { month: "Sep", raised: 4, closed: 3, overdue: 0 },
  ],
  needsAttention: [
    { tone: "orange", title: "SOP-BIO-014 v3 review overdue 6 days", detail: "Owner: Dr. Meena Kapoor → escalated to Dept Head" },
    { tone: "orange", title: "Calibration expiring — Cobas c311", detail: "Due 14-Sep-2026 · AMC vendor notified" },
    { tone: "navy", title: "EQAS Cycle 2 result unsatisfactory — HbA1c", detail: "Investigation pending · linked to F-2026-031" },
    { tone: "navy", title: "7 staff pending Read & Understood", detail: "SOP-HEM-002 v4 · due 10-Sep-2026" },
    { tone: "green", title: "MRM Q2 minutes approved", detail: "14 decisions logged · 3 open actions" },
  ],
  upcomingAudits: [
    { tone: "orange", title: "Internal Audit — Biochemistry (Vertical)", detail: "18-Sep-2026 · Lead: V. Chowdhary · Cl. 7.2–7.4" },
    { tone: "navy", title: "Mock NABL Audit — All Departments", detail: "05-Oct-2026 · full clause coverage check" },
    { tone: "navy", title: "NABL Surveillance", detail: "22-Nov-2026 · Certificate MC-3121 valid till Aug-2027" },
  ],
  training: [
    { label: "SOP acknowledgements", percent: 84, tone: "green" },
    { label: "Training completion", percent: 77, tone: "amber" },
    { label: "Competency current", percent: 91, tone: "green" },
    { label: "Authorizations valid", percent: 95, tone: "green" },
  ],
};

const mapLookup = (list) =>
  (list || []).map((item) => ({
    value: Number(first(item, "Value", "value", "CentreID", "DepartmentID") ?? 0),
    label: String(first(item, "Label", "label", "Centre", "Department") ?? ""),
  }));

export const normalizeFilters = (raw) => {
  if (!raw || typeof raw !== "object") return FALLBACK_FILTERS;
    const centres = mapLookup(first(raw, "Centres", "centres"));
    const departments = mapLookup(first(raw, "Departments", "departments"));
    const auditYears = mapLookup(first(raw, "AuditYears", "auditYears"));
  const badges = first(raw, "TabBadges", "tabBadges") || {};
  const user = first(raw, "User", "user") || {};
  return {
    centres: centres.length ? centres : FALLBACK_FILTERS.centres,
    auditYears: auditYears.length ? auditYears : FALLBACK_FILTERS.auditYears,
    departments: departments.length ? departments : FALLBACK_FILTERS.departments,
    defaultAuditYearId: Number(
      first(raw, "DefaultAuditYearId", "defaultAuditYearId") ?? 3
    ),
    tabBadges: {
      documents: Number(first(badges, "Documents", "documents") ?? 148),
      mrm: Number(first(badges, "MRM", "mrm") ?? 2),
      audits: Number(first(badges, "Audits", "audits") ?? 3),
      findings: Number(first(badges, "Findings", "findings") ?? 9),
    },
    user: {
      userName: first(user, "UserName", "userName") || "Quality Manager",
      role: first(user, "Role", "role") || "Quality Manager",
      roleInitials: first(user, "RoleInitials", "roleInitials") || "QM",
      standards: first(user, "Standards", "standards") || "ISO 15189:2022 · NABL 112",
    },
  };
};

const mapKpis = (list) =>
  (list || []).map((item) => ({
    key: first(item, "Key", "key"),
    label: first(item, "Label", "label"),
    value: first(item, "Value", "value"),
    accent: first(item, "Accent", "accent"),
    trend: first(item, "Trend", "trend") || "",
    trendUp: Boolean(first(item, "TrendUp", "trendUp")),
    detail: first(item, "Detail", "detail") || "",
    breakdown: (first(item, "Breakdown", "breakdown") || []).map((row) => ({
      label: first(row, "Label", "label"),
      count: Number(first(row, "Count", "count") ?? 0),
      tone: first(row, "Tone", "tone"),
    })),
  }));

export const normalizeDashboard = (raw) => {
  if (!raw || typeof raw !== "object") return null;
  const badges = first(raw, "TabBadges", "tabBadges") || {};
  const checklist = first(raw, "ChecklistStatus", "checklistStatus") || {};
  return {
    auditYearLabel: first(raw, "AuditYearLabel", "auditYearLabel") || "2026-27",
    tabBadges: {
      documents: Number(first(badges, "Documents", "documents") ?? 148),
      mrm: Number(first(badges, "MRM", "mrm") ?? 2),
      audits: Number(first(badges, "Audits", "audits") ?? 3),
      findings: Number(first(badges, "Findings", "findings") ?? 9),
    },
    kpis: mapKpis(first(raw, "Kpis", "kpis")),
    clauseReadiness: (first(raw, "ClauseReadiness", "clauseReadiness") || []).map((row) => ({
      clause: first(row, "Clause", "clause"),
      title: first(row, "Title", "title"),
      percent: Number(first(row, "Percent", "percent") ?? 0),
      tone: first(row, "Tone", "tone"),
    })),
    readinessNote: first(raw, "ReadinessNote", "readinessNote") || "",
    checklistStatus: {
      totalItems: Number(first(checklist, "TotalItems", "totalItems") ?? 0),
      edition: first(checklist, "Edition", "edition") || "",
      slices: (first(checklist, "Slices", "slices") || []).map((row) => ({
        label: first(row, "Label", "label"),
        count: Number(first(row, "Count", "count") ?? 0),
        color: first(row, "Color", "color"),
      })),
    },
    documentLifecycle: (first(raw, "DocumentLifecycle", "documentLifecycle") || []).map((row) => ({
      label: first(row, "Label", "label"),
      count: Number(first(row, "Count", "count") ?? 0),
      color: first(row, "Color", "color"),
    })),
    findingsTrend: (first(raw, "FindingsTrend", "findingsTrend") || []).map((row) => ({
      month: first(row, "Month", "month"),
      raised: Number(first(row, "Raised", "raised") ?? 0),
      closed: Number(first(row, "Closed", "closed") ?? 0),
      overdue: Number(first(row, "Overdue", "overdue") ?? 0),
    })),
    needsAttention: (first(raw, "NeedsAttention", "needsAttention") || []).map((row) => ({
      tone: first(row, "Tone", "tone"),
      title: first(row, "Title", "title"),
      detail: first(row, "Detail", "detail"),
    })),
    upcomingAudits: (first(raw, "UpcomingAudits", "upcomingAudits") || []).map((row) => ({
      tone: first(row, "Tone", "tone"),
      title: first(row, "Title", "title"),
      detail: first(row, "Detail", "detail"),
    })),
    training: (first(raw, "Training", "training") || []).map((row) => ({
      label: first(row, "Label", "label"),
      percent: Number(first(row, "Percent", "percent") ?? 0),
      tone: first(row, "Tone", "tone"),
    })),
  };
};

export const getNablFilters = async () => {
  const res = await axiosInstance.get("NABLDocumentControl/GetFilters");
  if (!res?.data?.success) {
    throw new Error(res?.data?.message || "Unable to load NABL filters");
  }
  return normalizeFilters(res.data.message);
};

export const getNablDashboard = async (payload) => {
  const res = await axiosInstance.post("NABLDocumentControl/GetDashboard", payload);
  if (!res?.data?.success) {
    throw new Error(res?.data?.message || "Unable to load NABL dashboard");
  }
  return normalizeDashboard(res.data.message);
};
