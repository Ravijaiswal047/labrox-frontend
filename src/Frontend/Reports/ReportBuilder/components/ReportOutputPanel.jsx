import React, { useMemo, useState } from "react";
import moment from "moment";
import { toast } from "react-toastify";
import ReactSelect from "../../../../components/formComponent/ReactSelect";
import Input from "../../../../components/formComponent/Input";
import { CustomButton } from "../../../../components/UI/CustomButton";
import { exportReportToExcel, exportReportToCsv, exportReportToPdf, printReport } from "../reportExport";

const pageSizeOptions = [
  { value: 50, label: "50 / page" },
  { value: 100, label: "100 / page" },
  { value: 500, label: "500 / page" },
];

const NUMERIC_TYPES = ["Currency", "Number"];

const EXPORT_BUTTONS = [
  { key: "PDF", label: "PDF", variant: "danger", cls: "pdf" },
  { key: "Excel", label: "Excel", variant: "success", cls: "xls" },
  { key: "CSV", label: "CSV", variant: "secondary", cls: "csv" },
  { key: "Print", label: "Print", variant: "info", cls: "htm" },
];

const formatCell = (col, value, currencySymbol) => {
  if (value === null || value === undefined || value === "") return "";
  if (col.dataType === "Currency") {
    return `${currencySymbol} ${Number(value || 0).toLocaleString("en-IN", {
      minimumFractionDigits: col.dec ?? 2,
      maximumFractionDigits: col.dec ?? 2,
    })}`;
  }
  if (col.dataType === "Number") {
    return Number(value || 0).toLocaleString("en-IN", {
      minimumFractionDigits: col.dec ?? 0,
      maximumFractionDigits: col.dec ?? 0,
    });
  }
  if (col.dataType === "Date") {
    const m = moment(value);
    return m.isValid() ? m.format("DD-MMM-YYYY") : String(value);
  }
  return String(value);
};

// Generic, column-driven results grid — renders whatever report was designed in
// Developer Mode (any columns, any grouping, any formula/aggregate) rather than
// one fixed demo shape. Shared by the Developer Mode Preview tab and Report
// Viewer, so every report gets the same grid, search, grouping and export UX.
const ReportOutputPanel = ({ columns, records, currencySymbol = "₹", allowedFormats, reportName = "Report", printSetup }) => {
  const [search, setSearch] = useState("");
  const [pageSize, setPageSize] = useState(50);

  const handleExport = (type) => {
    if (!records || records.length === 0) {
      toast.error("No records to export.");
      return;
    }
    try {
      if (type === "Excel") exportReportToExcel(columns, records, reportName);
      else if (type === "CSV") exportReportToCsv(columns, records, reportName);
      else if (type === "PDF") exportReportToPdf(columns, records, reportName, printSetup);
      else if (type === "Print") printReport(columns, records, reportName, printSetup);
    } catch (err) {
      toast.error(`Failed to export ${type}: ${err.message}`);
    }
  };

  const visibleColumns = useMemo(
    () => (columns || []).filter((c) => c.visible !== false),
    [columns]
  );
  const groupColumn = visibleColumns.find((c) => c.group);
  const sortColumn = visibleColumns.find((c) => c.sort);
  const searchableAliases = visibleColumns.filter((c) => c.search).map((c) => c.alias);
  const numericAliases = visibleColumns.filter((c) => NUMERIC_TYPES.includes(c.dataType)).map((c) => c.alias);

  const filtered = useMemo(() => {
    const rows = records || [];
    const term = search.trim().toLowerCase();
    const searched = !term
      ? rows
      : rows.filter((r) =>
          (searchableAliases.length ? searchableAliases : visibleColumns.map((c) => c.alias)).some((alias) =>
            String(r[alias] ?? "").toLowerCase().includes(term)
          )
        );
    if (!sortColumn) return searched;
    return [...searched].sort((a, b) => {
      const av = a[sortColumn.alias];
      const bv = b[sortColumn.alias];
      if (NUMERIC_TYPES.includes(sortColumn.dataType)) return Number(av || 0) - Number(bv || 0);
      return String(av ?? "").localeCompare(String(bv ?? ""));
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [records, search, searchableAliases.join(","), sortColumn?.alias]);

  const groups = useMemo(() => {
    if (!groupColumn) return [[null, filtered]];
    const map = new Map();
    filtered.forEach((r) => {
      const key = r[groupColumn.alias] ?? "—";
      if (!map.has(key)) map.set(key, []);
      map.get(key).push(r);
    });
    return Array.from(map.entries());
  }, [filtered, groupColumn]);

  const sumOf = (rows, alias) => rows.reduce((s, r) => s + Number(r[alias] || 0), 0);
  const grandTotals = Object.fromEntries(numericAliases.map((alias) => [alias, sumOf(filtered, alias)]));

  const colCount = visibleColumns.length + 1; // + row number column
  const firstNumericIdx = visibleColumns.findIndex((c) => numericAliases.includes(c.alias));
  const labelSpan = firstNumericIdx === -1 ? visibleColumns.length : firstNumericIdx + 1;

  const exportButtons = allowedFormats
    ? EXPORT_BUTTONS.filter((b) => allowedFormats.includes(b.key))
    : EXPORT_BUTTONS;

  let rowNo = 0;

  return (
    <>
      <div className="rb-out-tools">
        <Input
          id="rbOutSearch"
          name="outSearch"
          type="text"
          placeholder="🔍 Search in results…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          removeFormGroupClass
          className="rb-search-input"
        />
        <span className="rb-sp" />
        {exportButtons.map((b) => (
          <CustomButton key={b.key} text={b.label} variant={b.variant} className={`rb-exp ${b.cls}`} onClick={() => handleExport(b.key)} />
        ))}
      </div>

      <div style={{ overflowX: "auto", border: "1px solid var(--rb-line)", borderRadius: 5 }}>
        <table className="rb-grid rb-out-grid">
          <thead>
            <tr>
              <th style={{ width: 40 }}>#</th>
              {visibleColumns.map((c) => (
                <th key={c.id} style={{ width: c.width || undefined, textAlign: c.align === "Right" ? "right" : c.align === "Center" ? "center" : "left" }}>
                  {c.displayName || c.alias}
                  {c.sort ? " ▲" : ""}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {groups.length === 0 && (
              <tr><td colSpan={colCount} className="ctr" style={{ padding: 12, color: "var(--rb-muted)" }}>No records found.</td></tr>
            )}
            {groups.map(([groupValue, rows]) => (
              <React.Fragment key={groupValue ?? "all"}>
                {groupColumn && (
                  <tr>
                    <td colSpan={colCount} style={{ background: "var(--rb-orange-soft)", fontWeight: 700, color: "#b24a08" }}>
                      ▾ {groupColumn.displayName} : {String(groupValue).toUpperCase()} ({rows.length} record{rows.length > 1 ? "s" : ""})
                    </td>
                  </tr>
                )}
                {rows.map((r, idx) => {
                  rowNo += 1;
                  return (
                    <tr key={r.id ?? idx}>
                      <td className="ctr">{rowNo}</td>
                      {visibleColumns.map((c) => (
                        <td key={c.id} style={{ textAlign: c.align === "Right" ? "right" : c.align === "Center" ? "center" : "left" }}>
                          {formatCell(c, r[c.alias], currencySymbol)}
                        </td>
                      ))}
                    </tr>
                  );
                })}
                {groupColumn && (
                  <tr>
                    <td colSpan={labelSpan + 1} style={{ fontWeight: 700, textAlign: "right", background: "#f2f4f9" }}>
                      Sub Total ({groupValue})
                    </td>
                    {visibleColumns.slice(labelSpan).map((c) => (
                      <td key={c.id} style={{ textAlign: "right", fontWeight: 700, background: "#f2f4f9" }}>
                        {numericAliases.includes(c.alias) ? formatCell(c, sumOf(rows, c.alias), currencySymbol) : ""}
                      </td>
                    ))}
                  </tr>
                )}
              </React.Fragment>
            ))}
            {groups.length > 0 && numericAliases.length > 0 && (
              <tr>
                <td colSpan={labelSpan + 1} style={{ fontWeight: 800, textAlign: "right", background: "var(--rb-top)", color: "#fff" }}>
                  GRAND TOTAL
                </td>
                {visibleColumns.slice(labelSpan).map((c) => (
                  <td key={c.id} style={{ textAlign: "right", fontWeight: 800, background: "var(--rb-top)", color: "#fff" }}>
                    {numericAliases.includes(c.alias) ? formatCell(c, grandTotals[c.alias], currencySymbol) : ""}
                  </td>
                ))}
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="rb-pager">
        <span>Showing 1–{filtered.length} of {filtered.length} records</span>
        <button type="button">«</button>
        <button type="button" className="cur">1</button>
        <button type="button">»</button>
        <ReactSelect
          id="rbPageSize"
          name="pageSize"
          placeholderName="Page Size"
          dynamicOptions={pageSizeOptions}
          value={pageSize}
          onChange={(name, opt) => setPageSize(opt?.value ?? 50)}
          removeIsClearable
        />
      </div>
    </>
  );
};

export default ReportOutputPanel;
