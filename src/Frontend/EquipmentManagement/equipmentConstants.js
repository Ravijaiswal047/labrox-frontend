// Shared option lists / helpers for the Equipment Management module.
import moment from "moment";

/**
 * Normalise whatever the API hands back for a date.
 *
 * The shared DataContext connection string sets `Allow Zero Datetime=true`, so
 * some endpoints return a MySqlDateTime struct — {year, month, value, …} —
 * instead of a date string. Unwrap `.value` when that shows up, otherwise the
 * whole object reaches moment() and parses as invalid.
 */
const unwrapDate = (value) => {
  if (value && typeof value === "object" && !(value instanceof Date)) {
    if (value.isNull) return null;
    return value.value ?? null;
  }
  return value;
};

export const CRITICALITY_OPTIONS = [
  { label: "High", value: "High" },
  { label: "Medium", value: "Medium" },
  { label: "Low", value: "Low" },
];

// Sentinel for the "All …" entry in every filter dropdown.
// It can't be "" — ReactSelect treats an empty value as "nothing selected"
// (see its selectedOption logic), so an "" option never renders as chosen.
// Deliberately not a plausible id or name, so it can't collide with real data.
export const ALL_VALUE = "__ALL__";

export const STATUS_OPTIONS = [
  { label: "All Status", value: ALL_VALUE },
  { label: "Active", value: "Active" },
  { label: "Under Maintenance", value: "Under Maintenance" },
  { label: "Sent to Supplier", value: "Sent to Supplier" },
  { label: "Out of Service", value: "Out of Service" },
  { label: "Condemned", value: "Condemned" },
];

// The Add/Edit form should not offer "All Status".
export const STATUS_FORM_OPTIONS = STATUS_OPTIONS.filter(
  (o) => o.value !== ALL_VALUE,
);

// True when a filter is unset or explicitly "All …".
export const isAllValue = (value) => !value || value === ALL_VALUE;

// The list API returns IsActive as 1/0 (or an already-readable string).
export const getStatusLabel = (row) => {
  const raw = row?.Status ?? row?.IsActive;
  if (raw === 1 || raw === "1") return "Active";
  if (raw === 0 || raw === "0") return "Inactive";
  return raw || "Inactive";
};

export const statusBadgeClass = (status) => {
  switch (String(status).toLowerCase()) {
    case "active":
      return "em-badge em-badge-active";
    case "under maintenance":
      return "em-badge em-badge-maintenance";
    case "sent to supplier":
      return "em-badge em-badge-supplier";
    case "out of service":
      return "em-badge em-badge-outofservice";
    case "condemned":
      return "em-badge em-badge-condemned";
    default:
      return "em-badge em-badge-inactive";
  }
};

export const criticalityClass = (criticality) => {
  switch (String(criticality).toLowerCase()) {
    case "high":
      return "em-crit-high";
    case "low":
      return "em-crit-low";
    default:
      return "em-crit-medium";
  }
};

// "EQ-0013" style code for the next row in the grid.
export const buildNextEquipmentCode = (list = []) => {
  const highest = list.reduce((max, row) => {
    const code = String(row?.EquipmentCode || row?.Code || "");
    const digits = code.match(/(\d+)\s*$/);
    const num = digits ? parseInt(digits[1], 10) : 0;
    return num > max ? num : max;
  }, 0);
  const next = (highest || list.length) + 1;
  return `EQ-${String(next).padStart(4, "0")}`;
};

// Date -> "YYYY-MM-DD" for the save API.
export const formatApiDate = (value) => {
  const raw = unwrapDate(value);
  if (!raw) return "";
  const parsed = moment(raw);
  return parsed.isValid() ? parsed.format("YYYY-MM-DD") : "";
};

// ─── DUMMY DATA — remove once Equipment/getdata returns rows for this DB ────
// Shaped exactly like a row from Equipment/getdata so the grid mapping is real.
export const DUMMY_EQUIPMENT = [
  {
    EquipmentID: 9001,
    __dummy: true,
    EquipmentCode: "EQ-0001",
    DisplayName: "Sysmex XN-1000",
    labmachinename: "Sysmex XN-1000",
    SerialNumber: "A7231-1104",
    EquipmentType: "Analyzer",
    Department: "Haematology",
    DepartmentID: 0,
    Criticality: "High",
    IsActive: 1,
    Manufacture: "Sysmex",
    ModelNumber: "XN-1000",
    Vendor: "Sysmex India",
    Cost: "1250000",
    ServiceStartDate: "2024-04-01",
    InstallationDate: "2024-04-15",
    ServiceRenewalDate: "2027-03-31",
  },
  {
    EquipmentID: 9002,
    __dummy: true,
    EquipmentCode: "EQ-0002",
    DisplayName: "Cobas c311",
    labmachinename: "Cobas c311",
    SerialNumber: "RC311-88452",
    EquipmentType: "Analyzer",
    Department: "Biochemistry",
    DepartmentID: 0,
    Criticality: "High",
    IsActive: 1,
    Manufacture: "Roche",
    ModelNumber: "c311",
    Vendor: "Roche Diagnostics",
    Cost: "980000",
    ServiceStartDate: "2023-11-10",
    InstallationDate: "2023-11-28",
    ServiceRenewalDate: "2026-11-09",
  },
];

// DUMMY: the equipment roster the AMC / Calibration / Maintenance / Return /
// Transfer tabs pick from. Replace with the Equipment Master list once its API
// returns rows — every tab reads this one array, so there's a single swap.
export const DUMMY_EQUIPMENT_LIST = [
  { Code: "EQ-0001", Name: "Sysmex XN-1000", Centre: "Delhi — Rajouri Garden", Dept: "Haematology", Serial: "A7231-1104", Status: "Active", Warranty: "2025-03-27" },
  { Code: "EQ-0002", Name: "Cobas c311", Centre: "Delhi — Rajouri Garden", Dept: "Biochemistry", Serial: "RC311-88452", Status: "Active", Warranty: "2024-08-29" },
  { Code: "EQ-0003", Name: "Mindray BS-240", Centre: "Noida — Sector 62", Dept: "Biochemistry", Serial: "MB240-33019", Status: "Active", Warranty: "2026-02-04" },
  { Code: "EQ-0004", Name: "Horiba Yumizen H550", Centre: "Noida — Sector 62", Dept: "Haematology", Serial: "HY550-2210", Status: "Under Maintenance", Warranty: "2025-11-17" },
  { Code: "EQ-0005", Name: "Remi R-8C Centrifuge", Centre: "Delhi — Rajouri Garden", Dept: "Sample Storage", Serial: "RM8C-77501", Status: "Active", Warranty: "2023-05-11" },
  { Code: "EQ-0006", Name: "Olympus CX23 Microscope", Centre: "Gurugram — Sector 44", Dept: "Microbiology", Serial: "OL23-90112", Status: "Active", Warranty: "2024-01-31" },
  { Code: "EQ-0007", Name: "Blood Bank Refrigerator 300L", Centre: "Gurugram — Sector 44", Dept: "Sample Storage", Serial: "BS300-11208", Status: "Active", Warranty: "2026-06-24" },
  { Code: "EQ-0008", Name: "Vitros ECiQ", Centre: "Ghaziabad — RDC", Dept: "Immunoassay", Serial: "VE-55340", Status: "Sent to Supplier", Warranty: "2022-10-14" },
  { Code: "EQ-0009", Name: "CO2 Incubator 170L", Centre: "Noida — Sector 62", Dept: "Microbiology", Serial: "TF150-40021", Status: "Active", Warranty: "2025-09-19" },
  { Code: "EQ-0010", Name: "Vertical Autoclave 50L", Centre: "Ghaziabad — RDC", Dept: "Microbiology", Serial: "EQ7431-8815", Status: "Condemned", Warranty: "2021-12-09" },
  { Code: "EQ-0011", Name: "CBS-40 Water Bath", Centre: "Delhi — Rajouri Garden", Dept: "Histopathology", Serial: "LT40-6620", Status: "Sent to Supplier", Warranty: "2023-07-13" },
  { Code: "EQ-0012", Name: "Abbott Architect i1000SR", Centre: "Gurugram — Sector 44", Dept: "Immunoassay", Serial: "AB1000-70233", Status: "Active", Warranty: "2026-06-21" },
];

export const CENTRE_NAMES = [
  "Delhi — Rajouri Garden",
  "Noida — Sector 62",
  "Gurugram — Sector 44",
  "Ghaziabad — RDC",
];

export const findEquipment = (code) =>
  DUMMY_EQUIPMENT_LIST.find((e) => e.Code === code) || {};

export const equipmentSelectOptions = () =>
  DUMMY_EQUIPMENT_LIST.map((e) => ({
    value: e.Code,
    label: `${e.Code} — ${e.Name}`,
  }));

// DUMMY: detail shown in the View popup. None of these sub-records have an API
// yet, so every tab below General reads from here until one exists.
export const DUMMY_EQUIPMENT_DETAIL = {
  vendor: "Transasia Bio-Medicals",
  amc: [
    {
      ContractID: "CT-101",
      Type: "CMC",
      Vendor: "Transasia Bio-Medicals",
      FromDate: "2025-03-28",
      ToDate: "2026-09-27",
      Cost: 185000,
      VisitsDone: 3,
      VisitsTotal: 4,
      DaysLeft: 21,
    },
  ],
  calibration: [
    {
      LastDone: "2026-07-10",
      Frequency: "Quarterly",
      NextDue: "2026-10-10",
      DoneBy: "External Agency",
      Certificate: "CAL/26/0871",
      Result: "Pass",
    },
  ],
  maintenance: [
    {
      Frequency: "Monthly",
      LastDone: "2026-08-14",
      NextPM: "2026-09-14",
      Engineer: "Rajeev Malhotra",
    },
  ],
  breakdowns: [],
  transfers: [],
  documents: [
    {
      Name: "Purchase Invoice — INV/2023/0412",
      Type: "Invoice",
      UploadedOn: "2023-03-15",
    },
    { Name: "Installation Report", Type: "Report", UploadedOn: "2023-03-28" },
    { Name: "User Manual (PDF)", Type: "Manual", UploadedOn: "2023-03-28" },
  ],
};

// Display helpers for the View popup.
export const formatDisplayDate = (value) => {
  const raw = unwrapDate(value);
  if (!raw) return "";
  const parsed = moment(raw);
  return parsed.isValid() ? parsed.format("DD MMM YYYY") : "";
};

export const formatCurrency = (value) => {
  const num = Number(value);
  if (!value || Number.isNaN(num)) return "";
  return `₹${num.toLocaleString("en-IN")}`;
};

export const isExpired = (value) => {
  const parsed = moment(unwrapDate(value));
  return parsed.isValid() && parsed.isBefore(moment(), "day");
};

// API date -> Date object the DatePicker can render (or null).
export const toDateOrNull = (value) => {
  const raw = unwrapDate(value);
  if (!raw) return null;
  const parsed = moment(raw);
  return parsed.isValid() ? parsed.toDate() : null;
};
