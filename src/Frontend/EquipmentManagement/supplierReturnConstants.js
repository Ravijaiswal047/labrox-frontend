// Option lists, dummy records and helpers for the Supplier Return tab.
import moment from "moment";

// A return moves forward through this pipeline, never backwards.
export const RETURN_FLOW = [
  "Sent",
  "Under Repair at Vendor",
  "Dispatched Back",
  "Received & Installed",
];

// Validated with the palette checker in this exact order — all six checks pass.
// Each stage is also named and counted in the legend, so colour is never alone.
export const RETURN_STATUS_COLORS = {
  Sent: "#1A5FA8",
  "Under Repair at Vendor": "#ca8a04",
  "Dispatched Back": "#7c3aed",
  "Received & Installed": "#15803d",
};

export const returnBadgeClass = (status) =>
  ({
    Sent: "em-badge em-badge-supplier",
    "Under Repair at Vendor": "em-badge em-badge-maintenance",
    "Dispatched Back": "em-badge em-badge-condemned",
    "Received & Installed": "em-badge em-badge-active",
  })[status] || "em-badge em-badge-inactive";

export const isReturnOpen = (row) => !row.ActualReturn;

export const isReturnOverdue = (row) =>
  isReturnOpen(row) &&
  moment(row.Expected).isValid() &&
  moment(row.Expected).startOf("day").isBefore(moment().startOf("day"));

// Days the unit has been out — counted to the actual return, or to today
// while it is still at the vendor.
export const daysOut = (row) => {
  const sent = moment(row.Sent);
  if (!sent.isValid()) return 0;
  const end = row.ActualReturn ? moment(row.ActualReturn) : moment();
  return Math.max(0, end.startOf("day").diff(sent.startOf("day"), "days"));
};

// ─── DUMMY DATA — replace with the returns API when it exists ───────────────
export const DUMMY_RETURNS = [
  {
    ReturnID: "RTN-2026-007",
    EquipmentCode: "EQ-0008",
    Vendor: "Ortho Clinical Diagnostics",
    GatePass: "GP/26/1189",
    Challan: "CH-4451 · BlueDart",
    Sent: "2026-08-12",
    Expected: "2026-09-01",
    ActualReturn: null,
    Reason: "Mainboard failure — factory-level repair",
    Cost: 145000,
    Decontaminated: true,
    Status: "Under Repair at Vendor",
  },
  {
    ReturnID: "RTN-2026-006",
    EquipmentCode: "EQ-0011",
    Vendor: "Labtop Instruments",
    GatePass: "GP/26/1120",
    Challan: "CH-4390 · Self",
    Sent: "2026-08-28",
    Expected: "2026-09-15",
    ActualReturn: null,
    Reason: "Thermostat replacement",
    Cost: 6500,
    Decontaminated: true,
    Status: "Sent",
  },
  {
    ReturnID: "RTN-2026-005",
    EquipmentCode: "EQ-0005",
    Vendor: "Remi Sales",
    GatePass: "GP/26/0988",
    Challan: "CH-4102 · DTDC",
    Sent: "2026-06-10",
    Expected: "2026-06-30",
    ActualReturn: "2026-07-02",
    Reason: "Motor rewinding",
    Cost: 8900,
    Decontaminated: true,
    Status: "Received & Installed",
  },
  {
    ReturnID: "RTN-2026-004",
    EquipmentCode: "EQ-0006",
    Vendor: "Olympus Medical",
    GatePass: "GP/26/0870",
    Challan: "CH-3960 · BlueDart",
    Sent: "2026-05-02",
    Expected: "2026-05-25",
    ActualReturn: "2026-05-24",
    Reason: "Objective lens alignment",
    Cost: 12000,
    Decontaminated: true,
    Status: "Received & Installed",
  },
];

export const returnKpis = (rows) => {
  const open = rows.filter(isReturnOpen);
  return {
    total: rows.length,
    atVendor: open.length,
    overdue: rows.filter(isReturnOverdue).length,
    returned: rows.filter((r) => r.ActualReturn).length,
    cost: rows.reduce((sum, r) => sum + (Number(r.Cost) || 0), 0),
  };
};
