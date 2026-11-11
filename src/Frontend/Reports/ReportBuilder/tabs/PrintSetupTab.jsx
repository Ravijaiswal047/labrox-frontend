import React from "react";
import ReactSelect from "../../../../components/formComponent/ReactSelect";
import Input from "../../../../components/formComponent/Input";
import {
  orientationOptions,
  paperSizeOptions,
  fontOptions,
  csvDelimiterOptions,
  encodingOptions,
  outputFormatOptions,
} from "../reportBuilderData";

const headerFooterElements = [
  ["companyLogo", "Company Logo"],
  ["companyName", "Company Name"],
  ["address", "Address"],
  ["gst", "GST"],
  ["phoneEmail", "Phone / Email"],
  ["website", "Website"],
  ["selectionCriteria", "Selection Criteria"],
  ["printedBy", "Printed By"],
  ["printDateTime", "Print Date Time"],
  ["pageXY", "Page X of Y"],
  ["grandTotal", "Grand Total"],
  ["pageTotal", "Page Total"],
  ["altRowColor", "Alternate Row Color"],
  ["pageBorder", "Page Border"],
  ["confidentialFooter", "Confidential Footer"],
];

const excelOptions = [
  ["freezeHeader", "Freeze Header"],
  ["freezeFirstColumn", "Freeze First Column"],
  ["autoFilter", "Auto Filter"],
  ["autoWidth", "Auto Width"],
  ["wrapText", "Wrap Text"],
  ["currencyFormat", "Currency Format"],
  ["conditionalFormatting", "Conditional Formatting"],
  ["formulaSupport", "Formula Support"],
  ["pivotCompatible", "Pivot Compatible"],
];

const fmt = (n) => Number(n || 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const PrintSetupTab = ({
  printSetup,
  setPrintRootField,
  toggleElement,
  toggleExcel,
  toggleAllowedFormat,
  master,
  previewFilters,
  previewRecords,
}) => {
  const gross = previewRecords.reduce((s, r) => s + r.gross, 0);
  const disc = previewRecords.reduce((s, r) => s + r.disc, 0);
  const net = gross - disc;

  return (
    <div className="rb-cols2">
      <div>
        <div className="rb-panel">
          <div className="rb-panel-hd"><span className="rb-dot" />Allowed Export Formats</div>
          <div className="rb-panel-body">
            <div className="rb-chk-grid">
              {outputFormatOptions.map((fmtKey) => (
                <label key={fmtKey}>
                  <input
                    type="checkbox"
                    checked={(printSetup.allowedFormats || []).includes(fmtKey)}
                    onChange={() => toggleAllowedFormat(fmtKey)}
                  />
                  {fmtKey}
                </label>
              ))}
            </div>
            <span className="rb-hint">Report Viewer will only show export buttons for the formats checked here. The on-screen table view is always available.</span>
          </div>
        </div>

        <div className="rb-panel">
          <div className="rb-panel-hd"><span className="rb-dot" />PDF Configuration</div>
          <div className="rb-panel-body">
            <div className="rb-frm" style={{ gridTemplateColumns: "1fr 1fr" }}>
              <div className="rb-fg">
                <label>Orientation</label>
                <ReactSelect id="rbOrientation" name="orientation" placeholderName="Select" dynamicOptions={orientationOptions} value={printSetup.orientation} onChange={(n, o) => setPrintRootField(n, o?.value ?? "")} removeIsClearable />
              </div>
              <div className="rb-fg">
                <label>Paper Size</label>
                <ReactSelect id="rbPaperSize" name="paperSize" placeholderName="Select" dynamicOptions={paperSizeOptions} value={printSetup.paperSize} onChange={(n, o) => setPrintRootField(n, o?.value ?? "")} removeIsClearable />
              </div>
              <div className="rb-fg">
                <label>Header Height (px)</label>
                <Input id="rbHeaderHeight" name="headerHeight" type="number" value={printSetup.headerHeight} onChange={(e) => setPrintRootField("headerHeight", e.target.value)} removeFormGroupClass />
              </div>
              <div className="rb-fg">
                <label>Footer Height (px)</label>
                <Input id="rbFooterHeight" name="footerHeight" type="number" value={printSetup.footerHeight} onChange={(e) => setPrintRootField("footerHeight", e.target.value)} removeFormGroupClass />
              </div>
              <div className="rb-fg">
                <label>Font</label>
                <ReactSelect id="rbFont" name="font" placeholderName="Select" dynamicOptions={fontOptions} value={printSetup.font} onChange={(n, o) => setPrintRootField(n, o?.value ?? "")} removeIsClearable />
              </div>
              <div className="rb-fg">
                <label>Font Size</label>
                <Input id="rbFontSize" name="fontSize" type="number" value={printSetup.fontSize} onChange={(e) => setPrintRootField("fontSize", e.target.value)} removeFormGroupClass />
              </div>
              <div className="rb-fg">
                <label>Currency Symbol</label>
                <Input id="rbCurrencySymbol" name="currencySymbol" type="text" value={printSetup.currencySymbol} onChange={(e) => setPrintRootField("currencySymbol", e.target.value)} removeFormGroupClass />
              </div>
              <div className="rb-fg">
                <label>Decimal Precision</label>
                <Input id="rbDecimalPrecision" name="decimalPrecision" type="number" value={printSetup.decimalPrecision} onChange={(e) => setPrintRootField("decimalPrecision", e.target.value)} removeFormGroupClass />
              </div>
              <div className="rb-fg">
                <label>Watermark</label>
                <Input id="rbWatermark" name="watermark" type="text" placeholder="e.g. CONFIDENTIAL" value={printSetup.watermark} onChange={(e) => setPrintRootField("watermark", e.target.value)} removeFormGroupClass />
              </div>
              <div className="rb-fg">
                <label>Header BG Color</label>
                <Input id="rbHeaderBgColor" name="headerBgColor" type="text" value={printSetup.headerBgColor} onChange={(e) => setPrintRootField("headerBgColor", e.target.value)} removeFormGroupClass />
              </div>
            </div>
            <h4 style={{ fontSize: 11, color: "var(--rb-top)", textTransform: "uppercase", letterSpacing: ".6px", margin: "12px 0 7px", borderBottom: "1px dashed var(--rb-line)", paddingBottom: 4 }}>
              Header / Footer Elements
            </h4>
            <div className="rb-chk-grid">
              {headerFooterElements.map(([key, label]) => (
                <label key={key}>
                  <input type="checkbox" checked={!!printSetup.elements[key]} onChange={() => toggleElement(key)} />
                  {label}
                </label>
              ))}
            </div>
          </div>
        </div>

        <div className="rb-panel">
          <div className="rb-panel-hd"><span className="rb-dot" />Excel / CSV Configuration</div>
          <div className="rb-panel-body">
            <div className="rb-chk-grid">
              {excelOptions.map(([key, label]) => (
                <label key={key}>
                  <input type="checkbox" checked={!!printSetup.excel[key]} onChange={() => toggleExcel(key)} />
                  {label}
                </label>
              ))}
            </div>
            <div className="rb-frm" style={{ gridTemplateColumns: "1fr 1fr", marginTop: 12 }}>
              <div className="rb-fg">
                <label>CSV Delimiter</label>
                <ReactSelect id="rbCsvDelimiter" name="csvDelimiter" placeholderName="Select" dynamicOptions={csvDelimiterOptions} value={printSetup.csvDelimiter} onChange={(n, o) => setPrintRootField(n, o?.value ?? "")} removeIsClearable />
              </div>
              <div className="rb-fg">
                <label>Encoding</label>
                <ReactSelect id="rbEncoding" name="encoding" placeholderName="Select" dynamicOptions={encodingOptions} value={printSetup.encoding} onChange={(n, o) => setPrintRootField(n, o?.value ?? "")} removeIsClearable />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div>
        <div className="rb-panel">
          <div className="rb-panel-hd"><span className="rb-dot" />Live PDF Preview</div>
          <div className="rb-panel-body">
            <div className="rb-pdf-mock">
              <div className="rb-co">
                <div>
                  <div className="rb-nm">ABC DIAGNOSTICS</div>
                  <div>B-24 Sector 62, Noida · GSTIN 09AABCU9603R1ZK</div>
                  <div>☎ 0120-4567890 · info@abcdiag.in</div>
                </div>
                <div style={{ width: 44, height: 44, background: "var(--rb-orange-soft)", border: "1px dashed var(--rb-orange)", borderRadius: 4, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 8, color: "#b24a08" }}>LOGO</div>
              </div>
              <div className="rb-rn">{(master.reportName || "REPORT").toUpperCase()}</div>
              <div className="rb-crit">
                <span>From: <b>{previewFilters.fromDateLabel}</b></span>
                <span>To: <b>{previewFilters.toDateLabel}</b></span>
                <span>Centre: <b>Noida HO</b></span>
                <span>By: <b>Prashant</b></span>
              </div>
              <table>
                <thead>
                  <tr>
                    <th>Patient Name</th><th>Visit No.</th><th>Centre</th>
                    <th style={{ textAlign: "right" }}>Gross</th><th style={{ textAlign: "right" }}>Disc</th><th style={{ textAlign: "right" }}>Net</th><th>Mode</th>
                  </tr>
                </thead>
                <tbody>
                  {previewRecords.map((r) => (
                    <tr key={r.id}>
                      <td>{r.patient}</td><td>{r.visit}</td><td>{r.centre}</td>
                      <td style={{ textAlign: "right" }}>{fmt(r.gross)}</td>
                      <td style={{ textAlign: "right" }}>{fmt(r.disc)}</td>
                      <td style={{ textAlign: "right", color: r.gross - r.disc >= 10000 ? "#d63333" : undefined, fontWeight: r.gross - r.disc >= 10000 ? 700 : 400 }}>{fmt(r.gross - r.disc)}</td>
                      <td>{r.mode}</td>
                    </tr>
                  ))}
                  <tr className="rb-tot">
                    <td colSpan={3}>GRAND TOTAL</td>
                    <td style={{ textAlign: "right" }}>{fmt(gross)}</td>
                    <td style={{ textAlign: "right" }}>{fmt(disc)}</td>
                    <td style={{ textAlign: "right" }}>{fmt(net)}</td>
                    <td></td>
                  </tr>
                </tbody>
              </table>
              <div className="rb-ft">
                <span>{printSetup.elements.confidentialFooter ? "Confidential" : ""}</span>
                <span>Powered By LabRox · Printed: {previewFilters.fromDateLabel} 14:32</span>
                <span>Page 1 of 1</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrintSetupTab;
