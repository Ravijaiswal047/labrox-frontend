import { axiosInstance } from "../../../utils/axiosInstance";

// Converts one PascalCase (or SCREAMING-prefixed) key to camelCase, mirroring
// .NET's own JsonNamingPolicy.CamelCase algorithm — lowercases the whole
// leading run of uppercase letters except the last one before a lowercase
// letter, so "ReportHeadID" -> "reportHeadID" and "SPParameter" -> "spParameter".
// A no-op on keys that are already camelCase.
const toCamelKey = (key) => {
  if (!key) return key;
  let i = 0;
  while (i < key.length && key[i] !== key[i].toLowerCase()) i++;
  if (i === 0) return key;
  if (i > 1 && i < key.length) return key.slice(0, i - 1).toLowerCase() + key.slice(i - 1);
  return key.slice(0, i).toLowerCase() + key.slice(i);
};

// Recursively remaps every object key to camelCase. Used on schema-shaped
// endpoints (report/column/filter metadata) so this frontend works whether or
// not the backend's JSON serializer is configured for camelCase output.
// Deliberately NOT applied to RunReport's row data — those keys are the
// developer's own chosen ReportColumn.Alias values and must pass through
// byte-for-byte, not get silently re-cased.
const deepCamelCase = (value) => {
  if (Array.isArray(value)) return value.map(deepCamelCase);
  if (value && typeof value === "object") {
    return Object.fromEntries(Object.entries(value).map(([k, v]) => [toCamelKey(k), deepCamelCase(v)]));
  }
  return value;
};

// Thin wrapper around the ReportBuilderController endpoints (api/v1/ReportBuilder/...).
// Every call resolves to the backend's { success, message, data } Response shape —
// callers branch on res.success / res.message / res.data themselves, matching how
// the rest of the app consumes axiosInstance responses.
const unwrap = (promise, { normalize = true } = {}) =>
  promise
    .then((res) => ({ ...res.data, data: normalize ? deepCamelCase(res.data?.data) : res.data?.data }))
    .catch((err) => ({
      success: false,
      message: err?.response?.data?.message || err?.message || "Something went wrong",
      data: null,
    }));

// Shared shape mapper: backend GetReportTree groups -> the {id, group, open, items:[{id,name,code,status}]}
// shape ReportExplorer already knows how to render, reused by both Developer and User Mode.
export const mapReportTree = (data) =>
  (data || []).map((g) => ({
    id: `head-${g.reportHeadID}`,
    group: g.headName,
    open: true,
    items: (g.items || []).map((it) => ({ id: it.reportID, name: it.reportName, code: it.reportCode, status: it.status })),
  }));

// Shared ReportColumn -> ReportOutputPanel column-config mapper, reused by both
// Developer Mode (ReportBuilder.jsx) and Report Viewer so a report's columns
// always render identically wherever it's opened.
export const mapColumns = (cols) =>
  (cols || []).map((c, idx) => ({
    id: c.columnID || `c-${idx}`,
    dbColumn: c.dbColumn,
    alias: c.alias || "",
    displayName: c.displayName || "",
    visible: !!c.isVisible,
    width: c.width ?? 100,
    align: c.align || "Left",
    dataType: c.dataType || "Text",
    dec: c.decimalPlaces ?? 0,
    group: !!c.isGroup,
    sort: !!c.isSort,
    search: !!c.isSearch,
    exportable: !!c.isExport,
    freeze: !!c.isFreeze,
    isFormula: !!c.isFormula,
    formulaExpression: c.formulaExpression || "",
    aggregateType: c.aggregateType || "Sum",
    conditionalFormat: c.conditionalFormat || "",
  }));

// Maps the backend's flat PrintSetup DTO (show*/header*/currencySymbol fields)
// into the {elements: {...}} shape reportExport.js and PrintSetupTab both key
// off of. Shared so Report Viewer's PDF/Print output honors the same header
// color, watermark, and header/footer element toggles a developer configured
// in Print Setup — not just orientation/paperSize/currencySymbol.
export const mapPrintSetup = (ps) => ({
  currencySymbol: ps?.currencySymbol || "₹",
  allowedFormats: ps?.allowedFormats?.length ? ps.allowedFormats : ["PDF", "Excel", "CSV", "Print"],
  orientation: ps?.orientation || "Portrait",
  paperSize: ps?.paperSize || "A4",
  headerBgColor: ps?.headerBgColor || "#0d1b3e",
  watermark: ps?.watermark || "",
  elements: {
    companyLogo: !!ps?.showCompanyLogo,
    companyName: !!ps?.showCompanyName,
    address: !!ps?.showAddress,
    gst: !!ps?.showGST,
    phoneEmail: !!ps?.showPhoneEmail,
    website: !!ps?.showWebsite,
    selectionCriteria: !!ps?.showSelectionCriteria,
    printedBy: !!ps?.showPrintedBy,
    printDateTime: ps?.showPrintDateTime !== false,
    pageXY: ps?.showPageXY !== false,
    grandTotal: ps?.showGrandTotal !== false,
    pageTotal: !!ps?.showPageTotal,
    altRowColor: ps?.showAltRowColor !== false,
    pageBorder: !!ps?.showPageBorder,
    confidentialFooter: !!ps?.showConfidentialFooter,
  },
});

const reportBuilderApi = {
  getReportTree: () => unwrap(axiosInstance.get("ReportBuilder/GetReportTree")),
  getReportHeads: () => unwrap(axiosInstance.get("ReportBuilder/GetReportHeads")),
  createReportHead: (headName) =>
    unwrap(axiosInstance.post("ReportBuilder/CreateReportHead", { headName })),
  updateReportHead: (reportHeadID, headName) =>
    unwrap(axiosInstance.post("ReportBuilder/UpdateReportHead", { reportHeadID, headName })),
  getReportTypes: () => unwrap(axiosInstance.get("ReportBuilder/GetReportTypes")),
  createReportType: (typeName) =>
    unwrap(axiosInstance.post("ReportBuilder/CreateReportType", { typeName })),
  updateReportType: (reportTypeID, typeName) =>
    unwrap(axiosInstance.post("ReportBuilder/UpdateReportType", { reportTypeID, typeName })),

  getNextDisplaySequence: (reportHeadId) =>
    unwrap(axiosInstance.get(`ReportBuilder/GetNextDisplaySequence?reportHeadId=${reportHeadId}`)),

  getReportDetail: (reportId) =>
    unwrap(axiosInstance.get(`ReportBuilder/GetReportDetail?reportId=${reportId}`)),

  saveReportMaster: (model) => unwrap(axiosInstance.post("ReportBuilder/SaveReportMaster", model)),

  saveDataSource: (model) => unwrap(axiosInstance.post("ReportBuilder/SaveDataSource", model)),
  saveParameterMapping: (reportId, parameters) =>
    unwrap(axiosInstance.post("ReportBuilder/SaveParameterMapping", { reportId, parameters })),

  saveColumns: (reportId, columns) =>
    unwrap(axiosInstance.post("ReportBuilder/SaveColumns", { reportId, columns })),

  saveFilters: (reportId, filters) =>
    unwrap(axiosInstance.post("ReportBuilder/SaveFilters", { reportId, filters })),

  savePrintSetup: (model) => unwrap(axiosInstance.post("ReportBuilder/SavePrintSetup", model)),

  saveSecurityRoles: (reportId, roles) =>
    unwrap(axiosInstance.post("ReportBuilder/SaveSecurityRoles", { reportId, roles })),
  saveSchedule: (model) => unwrap(axiosInstance.post("ReportBuilder/SaveSchedule", model)),

  publishReport: (reportId) =>
    unwrap(axiosInstance.post(`ReportBuilder/PublishReport?reportId=${reportId}`)),
  unpublishReport: (reportId) =>
    unwrap(axiosInstance.post(`ReportBuilder/UnpublishReport?reportId=${reportId}`)),
  cloneReport: (reportId) =>
    unwrap(axiosInstance.post("ReportBuilder/CloneReport", { reportId })),
  deleteReport: (reportId) =>
    unwrap(axiosInstance.get(`ReportBuilder/DeleteReport?reportId=${reportId}`)),
  getAuditTrail: (reportId) =>
    unwrap(axiosInstance.get(`ReportBuilder/GetAuditTrail?reportId=${reportId}`)),

  // normalize: false — row keys here are the developer's own ReportColumn.Alias
  // values (e.g. "gross", "net"), not a fixed backend DTO, so they must not be
  // re-cased like every other endpoint's schema-shaped response is.
  runReport: (reportId, filterValues) =>
    unwrap(axiosInstance.post("ReportBuilder/RunReport", { reportId, filterValues }), { normalize: false }),

  // Executes a filter's configured Dropdown Source (SQL / Stored Procedure) at
  // design-time (Filters tab preview) and run-time (Report Viewer) so the options
  // shown always come from the live source, not hardcoded demo lists. dependsOn
  // is an optional { filterName: value } map for filters whose options narrow
  // based on another already-selected filter (e.g. Department depends on Centre).
  getFilterOptions: (reportId, filterId, dependsOn) =>
    unwrap(axiosInstance.post("ReportBuilder/GetFilterOptions", { reportId, filterId, dependsOn })),

  // Introspects the configured SP/View/Table/Query so Developer Mode can auto-fill
  // Parameter Mapping + Columns instead of the developer retyping every column.
  introspectDataSource: (model) =>
    unwrap(axiosInstance.post("ReportBuilder/IntrospectDataSource", model)),
};

export default reportBuilderApi;
