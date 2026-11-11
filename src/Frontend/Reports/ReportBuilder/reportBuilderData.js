// Static seed / option data for the Report Builder module.
// In a real integration these lists would come from API calls (report heads,
// SP/table metadata, role master, etc). Kept local here since the prototype
// this screen was built from ships with fixed sample data.

export const initialTreeData = [
  {
    id: "grp-lab",
    group: "Laboratory Reports",
    open: true,
    items: [
      { id: "rpt-1", name: "Daily Collection", code: "RPT-LAB-0012", status: "DRAFT" },
      { id: "rpt-2", name: "Pending Report", code: "RPT-LAB-0013", status: "LIVE" },
      { id: "rpt-3", name: "Test Wise Report", code: "RPT-LAB-0014", status: "LIVE" },
      { id: "rpt-4", name: "Department Summary", code: "RPT-LAB-0015", status: "LIVE" },
    ],
  },
  {
    id: "grp-coll",
    group: "Collection Reports",
    open: true,
    items: [
      { id: "rpt-5", name: "Centre Wise Collection", code: "RPT-COL-0021", status: "LIVE" },
      { id: "rpt-6", name: "Refund Report", code: "RPT-COL-0022", status: "LIVE" },
    ],
  },
  { id: "grp-fin", group: "Finance Reports", open: false, items: [] },
  { id: "grp-inv", group: "Inventory Reports", open: false, items: [] },
  { id: "grp-rad", group: "Radiology Reports", open: false, items: [] },
  { id: "grp-crm", group: "CRM Reports", open: false, items: [] },
];

export const reportHeadOptions = [
  "Laboratory Reports", "Collection Reports", "Finance Reports", "Inventory Reports", "Radiology Reports", "CRM Reports",
].map((v) => ({ value: v, label: v }));

export const reportTypeOptions = [
  "Summary", "Detail", "Detail Patient Wise", "Centre Wise", "Department Wise", "Consolidated",
].map((v) => ({ value: v, label: v }));

export const iconOptions = [
  { value: "chart", label: "📊 Chart" },
  { value: "document", label: "📄 Document" },
  { value: "money", label: "💰 Money" },
];

export const dataSourceTypeOptions = [
  "Stored Procedure", "SQL Query", "View", "Table", "API", "Dynamic Dataset",
];

export const connectionOptions = [
  { value: "default", label: "Default (healthplus_v6)" },
  { value: "replica", label: "Reporting Replica" },
];

export const bindFilterOptions = [
  "From Date (Filter)", "To Date (Filter)", "Centre (Filter)", "Department (Filter)", "Payment Mode (Filter)", "— Not Bound —",
].map((v) => ({ value: v, label: v }));

export const paramDataTypeOptions = ["Date", "Number", "Text", "Boolean"].map((v) => ({ value: v, label: v }));

export const initialParamRows = [
  { id: "p1", spParameter: "@FromDate", bindFilter: "From Date (Filter)", dataType: "Date", defaultValue: "Today" },
  { id: "p2", spParameter: "@ToDate", bindFilter: "To Date (Filter)", dataType: "Date", defaultValue: "Today" },
  { id: "p3", spParameter: "@CentreID", bindFilter: "Centre (Filter)", dataType: "Number", defaultValue: "Logged In Centre" },
  { id: "p4", spParameter: "@DepartmentID", bindFilter: "Department (Filter)", dataType: "Number", defaultValue: "All" },
];

export const alignOptions = ["Left", "Center", "Right"].map((v) => ({ value: v, label: v }));
export const columnDataTypeOptions = ["Text", "Number", "Date", "Currency", "Boolean"].map((v) => ({ value: v, label: v }));

export const initialColumnRows = [
  { id: "c1", dbColumn: "PName", alias: "patient", displayName: "Patient Name", visible: true, width: 180, align: "Left", dataType: "Text", dec: 0, group: false, sort: true, search: true, exportable: true, freeze: true, isFormula: false },
  { id: "c2", dbColumn: "VisitCode", alias: "visit", displayName: "Visit No.", visible: true, width: 110, align: "Left", dataType: "Text", dec: 0, group: false, sort: false, search: true, exportable: true, freeze: false, isFormula: false },
  { id: "c3", dbColumn: "CentreName", alias: "centre", displayName: "Centre", visible: true, width: 150, align: "Left", dataType: "Text", dec: 0, group: false, sort: false, search: true, exportable: true, freeze: false, isFormula: false },
  { id: "c4", dbColumn: "BookingDate", alias: "date", displayName: "Booking Date", visible: true, width: 110, align: "Center", dataType: "Date", dec: 0, group: false, sort: false, search: false, exportable: true, freeze: false, isFormula: false },
  { id: "c5", dbColumn: "GrossAmount", alias: "gross", displayName: "Gross Amt", visible: true, width: 100, align: "Right", dataType: "Currency", dec: 2, group: false, sort: false, search: false, exportable: true, freeze: false, isFormula: false },
  { id: "c6", dbColumn: "DiscountOnTotal", alias: "disc", displayName: "Discount", visible: true, width: 90, align: "Right", dataType: "Currency", dec: 2, group: false, sort: false, search: false, exportable: true, freeze: false, isFormula: false },
  { id: "c7", dbColumn: null, alias: "net", displayName: "Net Amount", visible: true, width: 100, align: "Right", dataType: "Currency", dec: 2, group: false, sort: false, search: false, exportable: true, freeze: false, isFormula: true, formulaExpression: "[gross] - [disc]", aggregateType: "Sum", conditionalFormat: ">=10000:red-bold" },
  { id: "c8", dbColumn: "PaymentMode", alias: "mode", displayName: "Pay Mode", visible: true, width: 90, align: "Center", dataType: "Text", dec: 0, group: true, sort: true, search: true, exportable: true, freeze: false, isFormula: false },
];

export const aggregateOptions = ["Sum", "Count", "Average", "Min", "Max", "None"].map((v) => ({ value: v, label: v }));

export const controlTypeOptions = [
  "Date", "Date Range", "Textbox", "Dropdown", "Multi Select", "Auto Complete", "Tree View", "Search Popup", "Checkbox", "Radio", "Time", "Number",
].map((v) => ({ value: v, label: v }));

export const validationOptions = ["Mandatory", "Optional", "Hidden", "Read Only"].map((v) => ({ value: v, label: v }));

export const defaultSelectionOptions = [
  "Today", "Yesterday", "Current Month", "Current FY", "All", "Logged In Centre", "Dynamic SQL",
].map((v) => ({ value: v, label: v }));

export const initialFilterRows = [
  { id: "f1", seq: 1, name: "From Date", controlType: "Date", dropdownSourceType: null, dropdownSourceValue: "", valueField: "", displayField: "", defaultSelection: "Today", validation: "Mandatory", width: 140 },
  { id: "f2", seq: 2, name: "To Date", controlType: "Date", dropdownSourceType: null, dropdownSourceValue: "", valueField: "", displayField: "", defaultSelection: "Today", validation: "Mandatory", width: 140 },
  { id: "f3", seq: 3, name: "Centre", controlType: "Multi Select", dropdownSourceType: "SQL Query", dropdownSourceValue: "SELECT CentreID, CentreName FROM Centre_Master", valueField: "CentreID", displayField: "CentreName", defaultSelection: "Logged In Centre", validation: "Mandatory", width: 250 },
  { id: "f4", seq: 4, name: "Department", controlType: "Dropdown", dropdownSourceType: "Stored Procedure", dropdownSourceValue: "sp_DeptList", valueField: "DeptID", displayField: "DeptName", defaultSelection: "All", validation: "Optional", width: 200 },
  { id: "f5", seq: 5, name: "Payment Mode", controlType: "Dropdown", dropdownSourceType: "Static Values", dropdownSourceValue: "All,Cash,Credit", valueField: "", displayField: "", defaultSelection: "All", validation: "Optional", width: 150 },
];

export const dropdownSourceTypeOptions = ["SQL Query", "Stored Procedure", "Static Values", "API"];

export const outputFormatOptions = ["PDF", "Excel", "CSV", "Print"];

export const paperSizeOptions = ["A4", "A3", "Letter", "Legal"].map((v) => ({ value: v, label: v }));
export const orientationOptions = ["Portrait", "Landscape"].map((v) => ({ value: v, label: v }));
export const fontOptions = ["Segoe UI", "Arial", "Roboto"].map((v) => ({ value: v, label: v }));
export const csvDelimiterOptions = ["Comma", "Tab", "Pipe"].map((v) => ({ value: v, label: v }));
export const encodingOptions = ["UTF-8", "ANSI"].map((v) => ({ value: v, label: v }));
export const frequencyOptions = ["Daily", "Weekly", "Monthly"].map((v) => ({ value: v, label: v }));
export const scheduleFormatOptions = ["PDF + Excel", "PDF", "Excel"].map((v) => ({ value: v, label: v }));

export const initialSecurityRoles = [
  { id: "r1", role: "Admin", allow: true, view: true, export: true, schedule: true, drillDown: true },
  { id: "r2", role: "Centre Manager", allow: true, view: true, export: true, schedule: false, drillDown: true },
  { id: "r3", role: "Accounts Executive", allow: true, view: true, export: false, schedule: false, drillDown: false },
  { id: "r4", role: "Phlebotomist", allow: false, view: false, export: false, schedule: false, drillDown: false },
  { id: "r5", role: "Lab Technician", allow: false, view: false, export: false, schedule: false, drillDown: false },
];

export const securityScopes = [
  { id: "role", label: "By Role", count: 3 },
  { id: "department", label: "By Department", count: 0 },
  { id: "user", label: "By User", count: 2 },
  { id: "centre", label: "By Centre", count: 5 },
  { id: "branch", label: "By Branch", count: 0 },
  { id: "company", label: "By Company", count: 1 },
];

export const previewRecords = [
  { id: 1, patient: "Ramesh Kumar", visit: "V-260720-001", centre: "Noida HO", date: "20-Jul-2026", gross: 1850, disc: 150, net: 1700, mode: "Cash" },
  { id: 2, patient: "Sunita Devi", visit: "V-260720-002", centre: "Noida HO", date: "20-Jul-2026", gross: 3200, disc: 0, net: 3200, mode: "Credit" },
  { id: 3, patient: "Amit Verma", visit: "V-260720-003", centre: "Sec-18", date: "20-Jul-2026", gross: 12400, disc: 400, net: 12000, mode: "Cash" },
  { id: 4, patient: "Pooja Sharma", visit: "V-260720-004", centre: "Sec-18", date: "20-Jul-2026", gross: 950, disc: 50, net: 900, mode: "UPI" },
];

export const auditTrailEntries = [
  { version: "v3", modifiedBy: "Prashant", date: "20-Jul-2026 14:30", change: "Updated filter defaults & added Net Amount formula column" },
  { version: "v2", modifiedBy: "Prashant", date: "18-Jul-2026 11:05", change: "Added Payment Mode filter and grouping" },
  { version: "v1", modifiedBy: "Prashant", date: "15-Jul-2026 09:42", change: "Report created" },
];
