// Option lists, dummy records and helpers for the Calibration tab.
import moment from "moment";
import { ALL_VALUE } from "./equipmentConstants";

// A calibration counts as "Due" this many days before its next due date.
export const DUE_WINDOW_DAYS = 30;
// The "Due in Next N Days" panel looks this far ahead.
export const UPCOMING_WINDOW_DAYS = 60;

export const CALIBRATION_STATUS_OPTIONS = [
  { label: "All", value: ALL_VALUE },
  { label: "Done", value: "Done" },
  { label: "Due", value: "Due" },
  { label: "Overdue", value: "Overdue" },
];

export const PERFORMED_BY_OPTIONS = [
  { label: "Internal", value: "Internal" },
  { label: "External Agency", value: "External Agency" },
];

export const CALIBRATION_RESULT_OPTIONS = [
  { label: "Pass", value: "Pass" },
  { label: "Fail", value: "Fail" },
];

export const FREQUENCY_OPTIONS = [
  { label: "Monthly", value: "Monthly" },
  { label: "Quarterly", value: "Quarterly" },
  { label: "Half-yearly", value: "Half-yearly" },
  { label: "Yearly", value: "Yearly" },
];

// ISO 15189 clause 6.5.3 requires calibration to be metrologically traceable.
export const TRACEABILITY_OPTIONS = [
  { label: "ISO/IEC 17025 lab · SI-traceable", value: "ISO/IEC 17025 lab · SI-traceable" },
  { label: "Manufacturer CRM · SI-traceable", value: "Manufacturer CRM · SI-traceable" },
  { label: "NPL / NIST reference standard", value: "NPL / NIST reference standard" },
  { label: "Not established", value: "Not established" },
];

// How many months each frequency adds when scheduling the next calibration.
const FREQUENCY_MONTHS = {
  Monthly: 1,
  Quarterly: 3,
  "Half-yearly": 6,
  Yearly: 12,
};

export const nextDueFrom = (date, frequency) => {
  const start = moment(date);
  if (!start.isValid()) return null;
  return start.add(FREQUENCY_MONTHS[frequency] || 1, "months").toDate();
};

// ─── Status derivation ──────────────────────────────────────────────────────
// Derived from the next due date rather than stored, so the KPIs, the donut,
// the row tint and the Status column can never disagree with each other.
export const calibrationStatus = (nextDue) => {
  const due = moment(nextDue);
  if (!due.isValid()) return "Done";
  const days = due.startOf("day").diff(moment().startOf("day"), "days");
  if (days < 0) return "Overdue";
  if (days <= DUE_WINDOW_DAYS) return "Due";
  return "Done";
};

export const daysUntilDue = (nextDue) => {
  const due = moment(nextDue);
  if (!due.isValid()) return 0;
  return due.startOf("day").diff(moment().startOf("day"), "days");
};

export const calibrationStatusClass = (status) => {
  switch (status) {
    case "Overdue":
      return "em-cal-overdue";
    case "Due":
      return "em-cal-due";
    default:
      return "em-cal-done";
  }
};

// Colours for the compliance donut. These are the reserved status hues, and
// this exact trio passes the palette validator (lightness band, chroma floor,
// CVD separation, normal-vision floor and contrast) — the more usual amber
// #b45309 fails against red at ΔE 9.9 for normal vision, so warning sits on
// yellow #ca8a04 instead. Every slice is also labelled in the legend, so
// identity never rests on colour alone.
export const COMPLIANCE_COLORS = {
  "Up to Date": "#15803d",
  "Due ≤30d": "#ca8a04",
  Overdue: "#dc2626",
};

// ─── DUMMY DATA — replace with the calibration API when it exists ───────────
export const DUMMY_CALIBRATIONS = [
  {
    EquipmentCode: "EQ-0011",
    EquipmentName: "CBS-40 Water Bath",
    Centre: "Delhi — Rajouri Garden",
    LastCalibration: "2025-10-05",
    Frequency: "Half-yearly",
    NextDue: "2026-04-05",
    PerformedBy: "Internal",
    Certificate: "CAL/25/1420",
    Traceability: "Manufacturer CRM · SI-traceable",
    Result: "Pass",
  },
  {
    EquipmentCode: "EQ-0004",
    EquipmentName: "Horiba Yumizen H550",
    Centre: "Noida — Sector 62",
    LastCalibration: "2026-02-20",
    Frequency: "Quarterly",
    NextDue: "2026-05-20",
    PerformedBy: "Internal",
    Certificate: "CAL/26/0301",
    Traceability: "Manufacturer CRM · SI-traceable",
    Result: "Fail",
  },
  {
    EquipmentCode: "EQ-0003",
    EquipmentName: "Mindray BS-240",
    Centre: "Noida — Sector 62",
    LastCalibration: "2026-05-15",
    Frequency: "Quarterly",
    NextDue: "2026-08-15",
    PerformedBy: "External Agency",
    Certificate: "CAL/26/0655",
    Traceability: "ISO/IEC 17025 lab · SI-traceable",
    Result: "Pass",
  },
  {
    EquipmentCode: "EQ-0002",
    EquipmentName: "Cobas c311",
    Centre: "Delhi — Rajouri Garden",
    LastCalibration: "2026-06-02",
    Frequency: "Quarterly",
    NextDue: "2026-09-02",
    PerformedBy: "Internal",
    Certificate: "CAL/26/0712",
    Traceability: "Manufacturer CRM · SI-traceable",
    Result: "Pass",
  },
  {
    EquipmentCode: "EQ-0009",
    EquipmentName: "CO2 Incubator 170L",
    Centre: "Noida — Sector 62",
    LastCalibration: "2026-08-12",
    Frequency: "Monthly",
    NextDue: "2026-09-12",
    PerformedBy: "Internal",
    Certificate: "CAL/26/0918",
    Traceability: "Manufacturer CRM · SI-traceable",
    Result: "Pass",
  },
  {
    EquipmentCode: "EQ-0007",
    EquipmentName: "Blood Bank Refrigerator 300L",
    Centre: "Gurugram — Sector 44",
    LastCalibration: "2026-08-30",
    Frequency: "Monthly",
    NextDue: "2026-09-30",
    PerformedBy: "Internal",
    Certificate: "CAL/26/0954",
    Traceability: "Manufacturer CRM · SI-traceable",
    Result: "Pass",
  },
  {
    EquipmentCode: "EQ-0001",
    EquipmentName: "Sysmex XN-1000",
    Centre: "Delhi — Rajouri Garden",
    LastCalibration: "2026-07-10",
    Frequency: "Quarterly",
    NextDue: "2026-10-10",
    PerformedBy: "External Agency",
    Certificate: "CAL/26/0871",
    Traceability: "ISO/IEC 17025 lab · SI-traceable",
    Result: "Pass",
  },
  {
    EquipmentCode: "EQ-0012",
    EquipmentName: "Abbott Architect i1000SR",
    Centre: "Gurugram — Sector 44",
    LastCalibration: "2026-07-25",
    Frequency: "Quarterly",
    NextDue: "2026-10-25",
    PerformedBy: "External Agency",
    Certificate: "CAL/26/0888",
    Traceability: "ISO/IEC 17025 lab · SI-traceable",
    Result: "Pass",
  },
];

// ─── Derived figures ────────────────────────────────────────────────────────
export const calibrationKpis = (rows) => {
  const counts = { Done: 0, Due: 0, Overdue: 0 };
  rows.forEach((r) => {
    counts[calibrationStatus(r.NextDue)] += 1;
  });
  return {
    total: rows.length,
    upToDate: counts.Done,
    due: counts.Due,
    overdue: counts.Overdue,
  };
};

// Overdue first, then whatever falls inside the look-ahead window, soonest first.
export const upcomingCalibrations = (rows) =>
  rows
    .filter((r) => daysUntilDue(r.NextDue) <= UPCOMING_WINDOW_DAYS)
    .sort((a, b) => daysUntilDue(a.NextDue) - daysUntilDue(b.NextDue));

export const dueLabel = (nextDue) => {
  const days = daysUntilDue(nextDue);
  if (days < 0) return `${Math.abs(days)}d overdue`;
  return moment(nextDue).format("DD MMM YYYY");
};
