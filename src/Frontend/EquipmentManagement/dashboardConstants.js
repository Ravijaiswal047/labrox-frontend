// Aggregations and helpers for the Equipment Dashboard tab.
import moment from "moment";
import { DUMMY_EQUIPMENT_LIST } from "./equipmentConstants";
import { DUMMY_CONTRACTS } from "./amcConstants";
import { DUMMY_CALIBRATIONS, daysUntilDue } from "./calibrationConstants";
import { DUMMY_RETURNS, isReturnOpen } from "./supplierReturnConstants";
import { DUMMY_TICKETS, isTicketOpen } from "./maintenanceConstants";

// How far ahead each alert type looks.
export const CONTRACT_ALERT_DAYS = 60;
export const CALIBRATION_ALERT_DAYS = 30;
export const WARRANTY_ALERT_DAYS = 60;
export const RETURN_ALERT_DAYS = 7;

// The status split shown in the donut. This exact order passes the palette
// validator; every slice is also named and counted in the legend.
export const EQUIPMENT_STATUS_COLORS = {
  Active: "#15803d",
  "Under Maintenance": "#ca8a04",
  "Sent to Supplier": "#1A5FA8",
  "Out of Service": "#be123c",
  Condemned: "#7c3aed",
};

export const EQUIPMENT_STATUSES = Object.keys(EQUIPMENT_STATUS_COLORS);

const daysTo = (date) => {
  const d = moment(date);
  if (!d.isValid()) return Number.POSITIVE_INFINITY;
  return d.startOf("day").diff(moment().startOf("day"), "days");
};

export const inCentre = (centre) => (row) => !centre || row.Centre === centre;

export const equipmentForCentre = (centre) =>
  DUMMY_EQUIPMENT_LIST.filter(inCentre(centre));

// Equipment lives in the roster; every other record points at it by code, so
// a centre filter is applied by resolving the code back to its equipment.
const centreOfCode = (code) =>
  DUMMY_EQUIPMENT_LIST.find((e) => e.Code === code)?.Centre || "";

const codeInCentre = (centre) => (code) => !centre || centreOfCode(code) === centre;

export const dashboardKpis = (centre) => {
  const equipment = equipmentForCentre(centre);
  const inC = codeInCentre(centre);
  const countStatus = (s) => equipment.filter((e) => e.Status === s).length;

  return {
    total: equipment.length,
    active: countStatus("Active"),
    underMaintenance: countStatus("Under Maintenance"),
    outOfService: countStatus("Out of Service"),
    atSupplier: countStatus("Sent to Supplier"),
    amcExpiring: DUMMY_CONTRACTS.filter(
      (c) =>
        inC(c.EquipmentCode) &&
        c.Type !== "Warranty" &&
        daysTo(c.EndDate) >= 0 &&
        daysTo(c.EndDate) <= 30,
    ).length,
    calibrationDue: DUMMY_CALIBRATIONS.filter(
      (c) => inC(c.EquipmentCode) && daysUntilDue(c.NextDue) <= CALIBRATION_ALERT_DAYS,
    ).length,
    openBreakdowns: DUMMY_TICKETS.filter(
      (x) => inC(x.EquipmentCode) && isTicketOpen(x),
    ).length,
  };
};

export const statusSplit = (centre) => {
  const equipment = equipmentForCentre(centre);
  return EQUIPMENT_STATUSES.map((status) => ({
    label: status,
    value: equipment.filter((e) => e.Status === status).length,
    color: EQUIPMENT_STATUS_COLORS[status],
  }));
};

export const departmentSplit = (centre) => {
  const byDept = new Map();
  equipmentForCentre(centre).forEach((e) => {
    byDept.set(e.Dept, (byDept.get(e.Dept) || 0) + 1);
  });
  return [...byDept.entries()]
    .map(([label, value]) => ({ label, value }))
    .sort((a, b) => b.value - a.value);
};

export const centreSummary = () => {
  const byCentre = new Map();
  DUMMY_EQUIPMENT_LIST.forEach((e) => {
    const row = byCentre.get(e.Centre) || {
      centre: e.Centre,
      total: 0,
      active: 0,
      underMaintenance: 0,
      outOfService: 0,
    };
    row.total += 1;
    if (e.Status === "Active") row.active += 1;
    if (e.Status === "Under Maintenance") row.underMaintenance += 1;
    if (e.Status === "Out of Service") row.outOfService += 1;
    byCentre.set(e.Centre, row);
  });
  return [...byCentre.values()];
};

// Monthly maintenance spend, ₹ thousands. Static in the prototype — kept that
// way rather than inventing a series the ticket data can't actually support.
export const MAINTENANCE_COST_TREND = [
  { label: "Apr", value: 42 },
  { label: "May", value: 58 },
  { label: "Jun", value: 31 },
  { label: "Jul", value: 76 },
  { label: "Aug", value: 54 },
  { label: "Sep", value: 41 },
];

/**
 * Everything falling due, from every module, on one list — soonest (and most
 * overdue) first. Each entry keeps its own `days` so the caller can colour by
 * urgency rather than by which module it came from.
 */
export const dueAlerts = (centre) => {
  const inC = codeInCentre(centre);
  const alerts = [];

  DUMMY_CONTRACTS.filter((c) => inC(c.EquipmentCode)).forEach((c) => {
    const days = daysTo(c.EndDate);
    if (days <= CONTRACT_ALERT_DAYS) {
      alerts.push({
        tag: c.Type,
        text: `${DUMMY_EQUIPMENT_LIST.find((e) => e.Code === c.EquipmentCode)?.Name || c.EquipmentCode} · ${c.Vendor}`,
        days,
      });
    }
  });

  DUMMY_CALIBRATIONS.filter((c) => inC(c.EquipmentCode)).forEach((c) => {
    const days = daysUntilDue(c.NextDue);
    if (days <= CALIBRATION_ALERT_DAYS) {
      alerts.push({
        tag: "Calibration",
        text: `${c.EquipmentName} · ${c.Frequency}`,
        days,
      });
    }
  });

  equipmentForCentre(centre).forEach((e) => {
    const days = daysTo(e.Warranty);
    if (days >= 0 && days <= WARRANTY_ALERT_DAYS) {
      alerts.push({ tag: "Warranty", text: e.Name, days });
    }
  });

  DUMMY_RETURNS.filter((r) => inC(r.EquipmentCode) && isReturnOpen(r)).forEach((r) => {
    const days = daysTo(r.Expected);
    if (days <= RETURN_ALERT_DAYS) {
      alerts.push({
        tag: "Vendor Return",
        text: `${DUMMY_EQUIPMENT_LIST.find((e) => e.Code === r.EquipmentCode)?.Name || r.EquipmentCode} · ${r.Vendor}`,
        days,
      });
    }
  });

  return alerts.sort((a, b) => a.days - b.days);
};

export const alertTagClass = (tag) =>
  ({
    AMC: "em-badge em-badge-inactive",
    CMC: "em-badge em-badge-condemned",
    Warranty: "em-badge em-badge-supplier",
    Calibration: "em-badge em-badge-supplier",
    "Vendor Return": "em-badge em-badge-maintenance",
  })[tag] || "em-badge em-badge-inactive";
