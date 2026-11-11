// Option lists, dummy records and helpers for the AMC / CMC tab.
import moment from "moment";
import { ALL_VALUE } from "./equipmentConstants";

// A contract counts as "Expiring Soon" this many days before it ends.
export const EXPIRING_WINDOW_DAYS = 60;

export const CONTRACT_TYPE_OPTIONS = [
  { label: "All Types", value: ALL_VALUE },
  { label: "AMC", value: "AMC" },
  { label: "CMC", value: "CMC" },
  { label: "Warranty", value: "Warranty" },
];

// "All Types" is a filter-only choice; the New Contract form shouldn't offer it.
export const CONTRACT_TYPE_FORM_OPTIONS = CONTRACT_TYPE_OPTIONS.filter(
  (o) => o.value !== ALL_VALUE,
);

export const CONTRACT_STATUS_OPTIONS = [
  { label: "All Status", value: ALL_VALUE },
  { label: "Active", value: "Active" },
  { label: "Expiring Soon", value: "Expiring Soon" },
  { label: "Expired", value: "Expired" },
];

// ─── Status derivation ──────────────────────────────────────────────────────
// Derived from the end date rather than stored, so a contract can never show a
// status that disagrees with its own dates.
export const contractStatus = (endDate) => {
  const end = moment(endDate);
  if (!end.isValid()) return "Active";
  const daysLeft = end.startOf("day").diff(moment().startOf("day"), "days");
  if (daysLeft < 0) return "Expired";
  if (daysLeft <= EXPIRING_WINDOW_DAYS) return "Expiring Soon";
  return "Active";
};

export const daysLeft = (endDate) => {
  const end = moment(endDate);
  if (!end.isValid()) return 0;
  return end.startOf("day").diff(moment().startOf("day"), "days");
};

export const renewalLabel = (endDate) => {
  const days = daysLeft(endDate);
  if (days < 0) return `Expired ${Math.abs(days)}d ago`;
  return `${days}d left`;
};

export const contractStatusClass = (status) => {
  switch (status) {
    case "Expired":
      return "em-amc-expired";
    case "Expiring Soon":
      return "em-amc-expiring";
    default:
      return "em-amc-active";
  }
};

// ─── DUMMY DATA ─────────────────────────────────────────────────────────────
// Replace with the contracts API once it exists. Equipment here stands in for
// the Equipment Master list.

export const DUMMY_CONTRACTS = [
  {
    ContractID: "CT-106",
    EquipmentCode: "EQ-0008",
    EquipmentName: "Vitros ECiQ",
    Centre: "Ghaziabad — RDC",
    Type: "CMC",
    Vendor: "Ortho Clinical Diagnostics",
    StartDate: "2025-01-01",
    EndDate: "2025-12-31",
    Cost: 310000,
    VisitsDone: 6,
    VisitsTotal: 6,
  },
  {
    ContractID: "CT-103",
    EquipmentCode: "EQ-0003",
    EquipmentName: "Mindray BS-240",
    Centre: "Noida — Sector 62",
    Type: "Warranty",
    Vendor: "Mindray India",
    StartDate: "2024-02-05",
    EndDate: "2026-02-04",
    Cost: 0,
    VisitsDone: 2,
    VisitsTotal: 2,
  },
  {
    ContractID: "CT-107",
    EquipmentCode: "EQ-0012",
    EquipmentName: "Abbott Architect i1000SR",
    Centre: "Gurugram — Sector 44",
    Type: "Warranty",
    Vendor: "Abbott India",
    StartDate: "2024-06-22",
    EndDate: "2026-06-21",
    Cost: 0,
    VisitsDone: 2,
    VisitsTotal: 2,
  },
  {
    ContractID: "CT-108",
    EquipmentCode: "EQ-0009",
    EquipmentName: "CO2 Incubator 170L",
    Centre: "Noida — Sector 62",
    Type: "AMC",
    Vendor: "Thermo Fisher India",
    StartDate: "2025-09-20",
    EndDate: "2026-09-19",
    Cost: 45000,
    VisitsDone: 1,
    VisitsTotal: 2,
  },
  {
    ContractID: "CT-101",
    EquipmentCode: "EQ-0001",
    EquipmentName: "Sysmex XN-1000",
    Centre: "Delhi — Rajouri Garden",
    Type: "CMC",
    Vendor: "Transasia Bio-Medicals",
    StartDate: "2025-03-28",
    EndDate: "2026-09-27",
    Cost: 185000,
    VisitsDone: 3,
    VisitsTotal: 4,
  },
  {
    ContractID: "CT-102",
    EquipmentCode: "EQ-0002",
    EquipmentName: "Cobas c311",
    Centre: "Delhi — Rajouri Garden",
    Type: "AMC",
    Vendor: "Roche Diagnostics India",
    StartDate: "2025-10-01",
    EndDate: "2026-09-30",
    Cost: 240000,
    VisitsDone: 4,
    VisitsTotal: 4,
  },
  {
    ContractID: "CT-104",
    EquipmentCode: "EQ-0004",
    EquipmentName: "Horiba Yumizen H550",
    Centre: "Noida — Sector 62",
    Type: "AMC",
    Vendor: "Horiba India",
    StartDate: "2025-11-21",
    EndDate: "2027-11-20",
    Cost: 98000,
    VisitsDone: 2,
    VisitsTotal: 4,
  },
  {
    ContractID: "CT-105",
    EquipmentCode: "EQ-0007",
    EquipmentName: "Blood Bank Refrigerator 300L",
    Centre: "Gurugram — Sector 44",
    Type: "AMC",
    Vendor: "Blue Star Ltd",
    StartDate: "2026-01-15",
    EndDate: "2027-01-14",
    Cost: 24000,
    VisitsDone: 1,
    VisitsTotal: 2,
  },
];

export const DUMMY_ENGINEER_VISITS = [
  {
    VisitDate: "2026-08-21",
    ContractID: "CT-104",
    EquipmentName: "Horiba Yumizen H550",
    Engineer: "S. Krishnan",
    WorkDone: "Sheath flow error rectified, PCB replaced",
    NextVisit: "2026-11-21",
  },
  {
    VisitDate: "2026-07-14",
    ContractID: "CT-101",
    EquipmentName: "Sysmex XN-1000",
    Engineer: "Rajeev Malhotra",
    WorkDone: "Preventive check, reagent line flush, sensor cleaning",
    NextVisit: "2026-10-14",
  },
  {
    VisitDate: "2026-06-02",
    ContractID: "CT-102",
    EquipmentName: "Cobas c311",
    Engineer: "Amit Vaidya",
    WorkDone: "Photometer lamp replacement, calibration verified",
    NextVisit: "2026-09-02",
  },
  {
    VisitDate: "2026-03-11",
    ContractID: "CT-108",
    EquipmentName: "CO2 Incubator 170L",
    Engineer: "Neha Kulkarni",
    WorkDone: "CO2 sensor calibration, door seal replaced",
    NextVisit: "2026-09-11",
  },
];

// ─── Derived figures ────────────────────────────────────────────────────────
export const contractKpis = (contracts) => {
  const counts = { Active: 0, "Expiring Soon": 0, Expired: 0 };
  let value = 0;
  contracts.forEach((c) => {
    counts[contractStatus(c.EndDate)] += 1;
    value += Number(c.Cost) || 0;
  });
  return {
    total: contracts.length,
    active: counts.Active,
    expiring: counts["Expiring Soon"],
    expired: counts.Expired,
    annualValue: value,
  };
};

// Contract value per vendor, highest first. Vendors with no spend are kept —
// a warranty vendor at zero is meaningful, not missing data.
export const vendorTotals = (contracts) => {
  const byVendor = new Map();
  contracts.forEach((c) => {
    const spend = Number(c.Cost) || 0;
    byVendor.set(c.Vendor, (byVendor.get(c.Vendor) || 0) + spend);
  });
  return [...byVendor.entries()]
    .map(([vendor, total]) => ({ vendor, total }))
    .sort((a, b) => b.total - a.total);
};

// 310000 -> "310k", 0 -> "0"
export const compactValue = (value) => {
  const num = Number(value) || 0;
  if (num === 0) return "0";
  if (num >= 100000) return `${Math.round(num / 1000)}k`;
  if (num >= 1000) return `${Math.round(num / 1000)}k`;
  return String(num);
};
