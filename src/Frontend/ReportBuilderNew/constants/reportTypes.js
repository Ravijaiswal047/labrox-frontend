// Every GetFieldTokens/GetColumnCatalog/GetTemplateList call is scoped to one of these —
// the value sent as `ReportType` must match whatever the backend seeds in its field-master
// catalog for that type. "FullyPaidReceipt" mostly inherits Receipt's Header/Footer/Body
// fields (per the field-master spec) plus one new Totals row ({TotalMRP}) — see
// FULLY-PAID-RECEIPT.md for what the backend needs to seed for it to actually differ from
// plain "Receipt" in GetFieldTokens/GetColumnCatalog.
export const REPORT_TYPE_OPTIONS = [
  { label: "Receipt", value: "Receipt" },
  { label: "Fully Paid Receipt", value: "FullyPaidReceipt" },
];

export const DEFAULT_REPORT_TYPE = "Receipt";
