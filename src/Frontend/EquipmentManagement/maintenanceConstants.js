// Option lists, dummy records and helpers for the Maintenance tab.
import moment from "moment";

// A PM is flagged "Due" this many days before its date.
export const PM_DUE_WINDOW_DAYS = 7;

// Breakdown tickets move forward through this pipeline, never backwards.
export const TICKET_FLOW = [
  "Reported",
  "Assigned",
  "In Progress",
  "Resolved",
  "Closed",
];

// Validated with the palette checker in this exact order (lightness band,
// chroma floor, CVD separation, normal-vision floor, contrast all pass).
// Every slice is named + counted in the legend, so colour is never the only cue.
export const TICKET_STATUS_COLORS = {
  Reported: "#be123c",
  Assigned: "#7c3aed",
  "In Progress": "#ca8a04",
  Resolved: "#1A5FA8",
  Closed: "#15803d",
};

export const PRIORITY_OPTIONS = [
  { label: "Critical", value: "Critical" },
  { label: "High", value: "High" },
  { label: "Medium", value: "Medium" },
  { label: "Low", value: "Low" },
];

export const PM_FREQUENCY_OPTIONS = [
  { label: "Monthly", value: "Monthly" },
  { label: "Quarterly", value: "Quarterly" },
  { label: "Half-yearly", value: "Half-yearly" },
];

export const ticketBadgeClass = (status) =>
  ({
    Reported: "em-badge em-badge-inactive",
    Assigned: "em-badge em-badge-supplier",
    "In Progress": "em-badge em-badge-maintenance",
    Resolved: "em-badge em-badge-condemned",
    Closed: "em-badge em-badge-active",
  })[status] || "em-badge em-badge-inactive";

export const priorityClass = (priority) =>
  ({
    Critical: "em-crit-high",
    High: "em-crit-high",
    Medium: "em-crit-medium",
    Low: "em-crit-low",
  })[priority] || "em-crit-medium";

// ─── PM status ──────────────────────────────────────────────────────────────
export const pmStatus = (nextDate) => {
  const days = moment(nextDate).startOf("day").diff(moment().startOf("day"), "days");
  if (days < 0) return "Overdue";
  if (days <= PM_DUE_WINDOW_DAYS) return "Due";
  return "Scheduled";
};

export const pmDaysLeft = (nextDate) =>
  moment(nextDate).startOf("day").diff(moment().startOf("day"), "days");

// ─── Downtime ───────────────────────────────────────────────────────────────
// Open tickets accrue downtime up to now, which is why this is computed rather
// than stored — a ticket left open keeps counting.
export const downtimeHours = (ticket) => {
  const start = moment(ticket.ReportedAt);
  const end = ticket.ResolvedAt ? moment(ticket.ResolvedAt) : moment();
  if (!start.isValid()) return 0;
  return Math.max(0, end.diff(start, "hours"));
};

export const downtimeLabel = (ticket) => {
  const h = downtimeHours(ticket);
  return h >= 24 ? `${Math.floor(h / 24)}d ${h % 24}h` : `${h}h`;
};

export const isTicketOpen = (ticket) =>
  !["Closed", "Resolved"].includes(ticket.Status);

// ─── DUMMY DATA — replace with the maintenance API when it exists ───────────
export const DUMMY_PM_SCHEDULE = [
  {
    EquipmentCode: "EQ-0001",
    Frequency: "Monthly",
    LastDone: "2026-08-14",
    NextPM: "2026-09-14",
    Engineer: "Rajeev Malhotra",
    Checklist: "Probe cleaning, tubing, background count",
  },
  {
    EquipmentCode: "EQ-0002",
    Frequency: "Monthly",
    LastDone: "2026-08-02",
    NextPM: "2026-09-02",
    Engineer: "Amit Vaidya",
    Checklist: "Cuvette wash, ISE maintenance",
  },
  {
    EquipmentCode: "EQ-0007",
    Frequency: "Quarterly",
    LastDone: "2026-06-25",
    NextPM: "2026-09-25",
    Engineer: "Biomedical Team",
    Checklist: "Compressor check, temp mapping",
  },
  {
    EquipmentCode: "EQ-0009",
    Frequency: "Quarterly",
    LastDone: "2026-09-11",
    NextPM: "2026-12-11",
    Engineer: "Neha Kulkarni",
    Checklist: "HEPA filter, CO2 supply line",
  },
  {
    EquipmentCode: "EQ-0012",
    Frequency: "Monthly",
    LastDone: "2026-07-28",
    NextPM: "2026-08-28",
    Engineer: "Abbott FSE",
    Checklist: "Wash buffer, pipettor alignment",
  },
];

export const DUMMY_TICKETS = [
  {
    TicketNo: "BRK-2026-041",
    EquipmentCode: "EQ-0004",
    ReportedBy: "Lab Incharge — Noida",
    Description: "Sheath flow error 245, runs aborting mid-cycle",
    Priority: "Critical",
    Status: "In Progress",
    ReportedAt: "2026-09-03 09:40",
    ResolvedAt: null,
    Parts: "Flow cell PCB",
    Cost: 38500,
    Engineer: "S. Krishnan",
    Remarks: "Part replaced, verification runs pending",
    Adverse: true,
    Impact: "Pending review",
    Verified: "Pending",
  },
  {
    TicketNo: "BRK-2026-040",
    EquipmentCode: "EQ-0008",
    ReportedBy: "Centre Manager — Ghaziabad",
    Description: "System boot failure, service required",
    Priority: "High",
    Status: "Assigned",
    ReportedAt: "2026-09-01 15:10",
    ResolvedAt: null,
    Parts: "",
    Cost: 0,
    Engineer: "OCD Support",
    Remarks: "",
    Adverse: false,
    Impact: "",
    Verified: "Pending",
  },
  {
    TicketNo: "BRK-2026-039",
    EquipmentCode: "EQ-0005",
    ReportedBy: "Technician — Delhi",
    Description: "Abnormal vibration at 4000 rpm",
    Priority: "Medium",
    Status: "Resolved",
    ReportedAt: "2026-08-27 11:25",
    ResolvedAt: "2026-08-28 17:00",
    Parts: "Rotor bush",
    Cost: 2200,
    Engineer: "Remi Service",
    Remarks: "Bush replaced, balanced OK",
    Adverse: false,
    Impact: "No impact — non-analytical equipment",
    Verified: "Pending",
  },
  {
    TicketNo: "BRK-2026-038",
    EquipmentCode: "EQ-0002",
    ReportedBy: "Sr. Technologist — Delhi",
    Description: "ISE Na drift beyond limits",
    Priority: "High",
    Status: "Closed",
    ReportedAt: "2026-08-20 08:55",
    ResolvedAt: "2026-08-20 14:30",
    Parts: "ISE cartridge",
    Cost: 16400,
    Engineer: "Amit Vaidya",
    Remarks: "Cartridge replaced, QC passed",
    Adverse: false,
    Impact: "Previous 2h results reviewed — no impact",
    Verified: "Yes — QC passed",
  },
  {
    TicketNo: "BRK-2026-037",
    EquipmentCode: "EQ-0011",
    ReportedBy: "Histopath Tech",
    Description: "Temperature not holding at 56°C",
    Priority: "Low",
    Status: "Reported",
    ReportedAt: "2026-09-05 12:05",
    ResolvedAt: null,
    Parts: "",
    Cost: 0,
    Engineer: "",
    Remarks: "",
    Adverse: false,
    Impact: "",
    Verified: "Pending",
  },
];

export const VERIFIED_PASS = "Yes — QC passed";

// Repair cost trend, ₹ thousands. Static in the prototype; keep it that way
// until a real series exists rather than inventing one from the tickets.
export const REPAIR_COST_TREND = [
  { label: "Apr", value: 18 },
  { label: "May", value: 34 },
  { label: "Jun", value: 12 },
  { label: "Jul", value: 47 },
  { label: "Aug", value: 22 },
  { label: "Sep", value: 58 },
];
