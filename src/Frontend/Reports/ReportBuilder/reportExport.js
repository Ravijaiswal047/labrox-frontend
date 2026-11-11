import * as XLSX from "xlsx";
import html2pdf from "html2pdf.js";
import moment from "moment";
import { toast } from "react-toastify";

// Client-side export straight from whatever rows are already on screen (the
// same columns/records ReportOutputPanel renders) — no export-specific
// backend endpoint needed for on-demand PDF/Excel/CSV/Print.

const sanitizeFileName = (name) => (name || "Report").replace(/[\\/:*?"<>|]/g, "").trim() || "Report";

const NUMERIC_TYPES = ["Currency", "Number"];

// Columns actually meant for exported output. A column can be shown on the
// Report Viewer grid but left out of PDF/Excel/CSV/Print via its "Export"
// checkbox in Developer Mode > Columns — that's how a wide detail report
// stays readable on screen while its PDF only carries the handful of fields
// that matter (e.g. Patient, Visit, Centre, Gross, Disc, Net, Mode).
const exportColumns = (columns) => (columns || []).filter((c) => c.visible !== false && c.exportable !== false);

const formatValue = (col, value, currencySymbol) => {
  if (value === null || value === undefined || value === "") return "";
  if (col.dataType === "Currency") {
    const n = Number(value).toLocaleString("en-IN", { minimumFractionDigits: col.dec ?? 2, maximumFractionDigits: col.dec ?? 2 });
    return currencySymbol ? `${currencySymbol} ${n}` : n;
  }
  if (col.dataType === "Number") {
    return Number(value).toLocaleString("en-IN", { minimumFractionDigits: col.dec ?? 0, maximumFractionDigits: col.dec ?? 0 });
  }
  if (col.dataType === "Date") {
    const m = moment(value);
    return m.isValid() ? m.format("DD-MMM-YYYY") : String(value);
  }
  return String(value);
};

const rowsAsPlainObjects = (columns, records) => {
  const cols = exportColumns(columns);
  return (records || []).map((r) =>
    Object.fromEntries(cols.map((c) => [c.displayName || c.alias, formatValue(c, r[c.alias])]))
  );
};

export const exportReportToExcel = (columns, records, reportName) => {
  const worksheet = XLSX.utils.json_to_sheet(rowsAsPlainObjects(columns, records));
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Report");
  XLSX.writeFile(workbook, `${sanitizeFileName(reportName)}.xlsx`);
};

export const exportReportToCsv = (columns, records, reportName) => {
  const worksheet = XLSX.utils.json_to_sheet(rowsAsPlainObjects(columns, records));
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Report");
  XLSX.writeFile(workbook, `${sanitizeFileName(reportName)}.csv`, { bookType: "csv" });
};

const PALETTE = { navy: "#0d1b3e", orange: "#f26b1d", orangeSoft: "#fff1e8", line: "#dde2ec", muted: "#8a92a3" };

const alignOf = (col) => (col.align === "Right" ? "right" : col.align === "Center" ? "center" : "left");

// Builds a detached, print-styled DOM node (mirrors the "Live PDF Preview"
// look from Developer Mode > Print Setup) that html2pdf rasterizes into the
// PDF. Rendering real HTML — rather than jsPDF's own text/table primitives —
// is what lets a currency symbol like ₹ show up correctly and gives full CSS
// control over the header/footer/grand-total styling.
const buildReportElement = (columns, records, reportName, printSetup = {}) => {
  const cols = exportColumns(columns);
  const elements = printSetup.elements || {};
  const currencySymbol = printSetup.currencySymbol || "₹";
  const headerColor = printSetup.headerBgColor || PALETTE.navy;
  const landscape = printSetup.orientation === "Landscape";
  const numericAliases = cols.filter((c) => NUMERIC_TYPES.includes(c.dataType)).map((c) => c.alias);
  const showGrandTotal = elements.grandTotal !== false && numericAliases.length > 0;
  const zebra = elements.altRowColor !== false;

  const wrap = document.createElement("div");
  wrap.style.cssText = `width:${landscape ? 1000 : 740}px; box-sizing:border-box; background:#fff; font-family:"Segoe UI",Arial,sans-serif; color:#222; padding:4px; position:relative;`;

  if (printSetup.watermark) {
    const wm = document.createElement("div");
    wm.textContent = printSetup.watermark;
    wm.style.cssText = "position:absolute; top:45%; left:50%; transform:translate(-50%,-50%) rotate(-28deg); font-size:64px; font-weight:800; color:rgba(13,27,62,0.06); white-space:nowrap; pointer-events:none;";
    wrap.appendChild(wm);
  }

  const header = document.createElement("div");
  header.style.cssText = `display:flex; justify-content:space-between; align-items:flex-end; border-bottom:2px solid ${headerColor}; padding-bottom:8px; margin-bottom:10px;`;
  const title = document.createElement("div");
  title.style.cssText = `font-size:17px; font-weight:800; color:${headerColor};`;
  title.textContent = reportName || "Report";
  header.appendChild(title);

  const meta = document.createElement("div");
  meta.style.cssText = "font-size:9.5px; color:#888; text-align:right; line-height:1.5;";
  const genLine = document.createElement("div");
  genLine.textContent = `Generated ${new Date().toLocaleString()}`;
  meta.appendChild(genLine);
  if (elements.printedBy && printSetup.printedBy) {
    const byLine = document.createElement("div");
    byLine.textContent = `By: ${printSetup.printedBy}`;
    meta.appendChild(byLine);
  }
  header.appendChild(meta);
  wrap.appendChild(header);

  const table = document.createElement("table");
  table.style.cssText = "width:100%; border-collapse:collapse; font-size:10px;";

  const thead = document.createElement("thead");
  const trh = document.createElement("tr");
  cols.forEach((c) => {
    const th = document.createElement("th");
    th.textContent = c.displayName || c.alias;
    th.style.cssText = `background:${headerColor}; color:#fff; padding:6px 8px; text-align:${alignOf(c)}; font-weight:700; white-space:nowrap;`;
    trh.appendChild(th);
  });
  thead.appendChild(trh);
  table.appendChild(thead);

  const tbody = document.createElement("tbody");
  (records || []).forEach((r, idx) => {
    const tr = document.createElement("tr");
    if (zebra && idx % 2 === 1) tr.style.background = "#f6f8fc";
    cols.forEach((c) => {
      const td = document.createElement("td");
      td.textContent = formatValue(c, r[c.alias], c.dataType === "Currency" ? currencySymbol : undefined);
      td.style.cssText = `padding:5px 8px; border-bottom:1px solid #eee; text-align:${alignOf(c)};`;
      tr.appendChild(td);
    });
    tbody.appendChild(tr);
  });

  if (showGrandTotal) {
    const firstNumericIdx = cols.findIndex((c) => numericAliases.includes(c.alias));
    const labelSpan = firstNumericIdx === -1 ? cols.length : firstNumericIdx;
    const tr = document.createElement("tr");
    tr.style.cssText = `background:${PALETTE.orangeSoft}; border-top:1.5px solid ${PALETTE.orange}; font-weight:700;`;
    if (labelSpan > 0) {
      const tdLabel = document.createElement("td");
      tdLabel.colSpan = labelSpan;
      tdLabel.textContent = "GRAND TOTAL";
      tdLabel.style.cssText = "padding:6px 8px; text-align:right;";
      tr.appendChild(tdLabel);
    }
    cols.slice(labelSpan).forEach((c) => {
      const td = document.createElement("td");
      if (numericAliases.includes(c.alias)) {
        const sum = (records || []).reduce((s, r) => s + Number(r[c.alias] || 0), 0);
        td.textContent = formatValue(c, sum, c.dataType === "Currency" ? currencySymbol : undefined);
      }
      td.style.cssText = `padding:6px 8px; text-align:${alignOf(c)};`;
      tr.appendChild(td);
    });
    tbody.appendChild(tr);
  }

  table.appendChild(tbody);
  wrap.appendChild(table);

  const footer = document.createElement("div");
  footer.style.cssText = `display:flex; justify-content:space-between; color:${PALETTE.muted}; font-size:8.5px; border-top:1px solid ${PALETTE.line}; margin-top:10px; padding-top:6px;`;
  const left = document.createElement("span");
  left.textContent = elements.confidentialFooter ? "Confidential" : "";
  const right = document.createElement("span");
  right.textContent = "Powered By LabRox";
  footer.appendChild(left);
  footer.appendChild(right);
  wrap.appendChild(footer);

  return wrap;
};

const html2pdfOptions = (printSetup, reportName) => ({
  margin: [28, 24, 28, 24],
  filename: `${sanitizeFileName(reportName)}.pdf`,
  image: { type: "jpeg", quality: 0.98 },
  html2canvas: { scale: 2, useCORS: true },
  jsPDF: {
    unit: "pt",
    format: (printSetup.paperSize || "a4").toLowerCase(),
    orientation: printSetup.orientation === "Landscape" ? "landscape" : "portrait",
  },
});

const addPageNumbers = (pdf) => {
  const pageCount = pdf.internal.getNumberOfPages();
  const w = pdf.internal.pageSize.getWidth();
  const h = pdf.internal.pageSize.getHeight();
  for (let i = 1; i <= pageCount; i += 1) {
    pdf.setPage(i);
    pdf.setFontSize(8);
    pdf.setTextColor(150);
    pdf.text(`Page ${i} of ${pageCount}`, w - 70, h - 16);
  }
};

export const exportReportToPdf = (columns, records, reportName, printSetup = {}) => {
  const el = buildReportElement(columns, records, reportName, printSetup);
  const showPageXY = printSetup.elements?.pageXY !== false;
  return html2pdf()
    .from(el)
    .set(html2pdfOptions(printSetup, reportName))
    .toPdf()
    .get("pdf")
    .then((pdf) => {
      if (showPageXY) addPageNumbers(pdf);
    })
    .save()
    .catch((err) => toast.error(`Failed to build PDF: ${err.message}`));
};

export const printReport = (columns, records, reportName, printSetup = {}) => {
  const el = buildReportElement(columns, records, reportName, printSetup);
  const showPageXY = printSetup.elements?.pageXY !== false;
  return html2pdf()
    .from(el)
    .set(html2pdfOptions(printSetup, reportName))
    .toPdf()
    .get("pdf")
    .then((pdf) => {
      if (showPageXY) addPageNumbers(pdf);
      pdf.autoPrint();
      window.open(pdf.output("bloburl"), "_blank");
    })
    .catch((err) => toast.error(`Failed to build print preview: ${err.message}`));
};
