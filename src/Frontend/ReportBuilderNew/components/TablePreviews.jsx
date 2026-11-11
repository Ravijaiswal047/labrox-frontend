import React from "react";
import { SAMPLE_LINE_ITEMS, SAMPLE_SETTLEMENTS } from "../utils/sampleData";
import { computeSampleTotals, formatMoney } from "../utils/computeTotals";
import { DEFAULT_TABLE_BORDER } from "../utils/layoutJson";

// Shared between the Designer canvas (live WYSIWYG-ish preview on the anchor boxes) and
// the Preview & Print tab, so both always render the same visible/hidden columns — and
// now the same configurable border styling (meta.tableBorder) — one rendering, not two
// that can drift apart.

const ROW_BORDER_COLOR = "#edf0f4";

// Turns the {headerTopBorder, headerBottomBorder, outerBorder, cellBorder, borderWidth,
// borderColor, headerFill, headerBg, headerColor} config into the inline styles for
// <table>/<th>/<td>. Kept as one shared function so the same border rules apply
// consistently everywhere a table renders — canvas, Preview & Print, and (per the note in
// TABLE-BORDER-STYLING.md) the backend's real PDF output.
//
// Every property this returns is set explicitly (never omitted) — including "none"/
// "transparent" for a disabled option — so it always overrides the *.rbn-preview-table
// CSS class defaults regardless of what those defaults are, rather than only doing so when
// a checkbox happens to be on.
export function tableBorderStyles(tableBorder) {
  const cfg = { ...DEFAULT_TABLE_BORDER, ...tableBorder };
  const w = Math.max(0, Number(cfg.borderWidth)) || 1;
  const lineColor = cfg.borderColor || DEFAULT_TABLE_BORDER.borderColor;
  const outer = cfg.outerBorder ? `${w}px solid ${lineColor}` : "none";
  const cellGrid = cfg.cellBorder ? `${w}px solid ${lineColor}` : null;

  return {
    table: {
      border: outer,
      borderTop: cfg.headerTopBorder ? `${w}px solid ${lineColor}` : outer,
    },
    th: {
      ...(cellGrid ? { border: cellGrid } : {}),
      borderBottom: cfg.headerBottomBorder ? `${w}px solid ${lineColor}` : cellGrid || "none",
      background: cfg.headerFill ? cfg.headerBg || DEFAULT_TABLE_BORDER.headerBg : "transparent",
      color: cfg.headerFill ? cfg.headerColor || DEFAULT_TABLE_BORDER.headerColor : "#20242b",
      textTransform: cfg.headerUppercase === false ? "none" : "uppercase",
    },
    td: cellGrid ? { border: cellGrid } : { borderBottom: `${w}px solid ${ROW_BORDER_COLOR}` },
  };
}

const cellStyle = (col, borderStyle, fontSize = 8) => ({ textAlign: col.align, padding: "3px 6px", fontSize, ...borderStyle });

export function BodyTablePreview({ bodyColumns, inclusionStyle, tableBorder }) {
  const visibleCols = bodyColumns.filter((c) => c.visible && c.key !== "incl");
  const showIncl = bodyColumns.find((c) => c.key === "incl")?.visible;
  const b = tableBorderStyles(tableBorder);

  return (
    <table className="rbn-preview-table" style={b.table}>
      <thead>
        <tr className="rbn-preview-thead">
          {visibleCols.map((col) => (
            <th key={col.key} style={cellStyle(col, b.th, 7.5)}>{col.label}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {SAMPLE_LINE_ITEMS.map((row, i) => (
          <React.Fragment key={row.sr}>
            <tr className={i % 2 ? "rbn-preview-row-alt" : ""}>
              {visibleCols.map((col) => (
                <td key={col.key} style={cellStyle(col, b.td)}>
                  {col.key === "item" ? (
                    <>
                      {row.item}
                      {showIncl && row.incl.length > 0 && inclusionStyle === "brackets" && (
                        <span className="rbn-incl-text"> ({row.incl.join(", ")})</span>
                      )}
                    </>
                  ) : col.key === "amount" ? (
                    formatMoney(row.rate * row.qty - row.disc)
                  ) : col.money ? (
                    formatMoney(row[col.key])
                  ) : (
                    row[col.key]
                  )}
                </td>
              ))}
            </tr>
            {showIncl &&
              inclusionStyle === "subrows" &&
              row.incl.map((inc, j) => (
                <tr key={j} className={i % 2 ? "rbn-preview-row-alt" : ""}>
                  {visibleCols.map((col) => (
                    <td key={col.key} style={cellStyle(col, b.td, 7)}>
                      {col.key === "sr" ? `${row.sr}.${j + 1}` : col.key === "item" ? <span className="rbn-incl-subrow">— {inc}</span> : ""}
                    </td>
                  ))}
                </tr>
              ))}
          </React.Fragment>
        ))}
      </tbody>
    </table>
  );
}

export function SettlementTablePreview({ settlementColumns, tableBorder }) {
  const visibleCols = settlementColumns.filter((c) => c.visible);
  const b = tableBorderStyles(tableBorder);
  return (
    <div>
      <table className="rbn-preview-table" style={b.table}>
        <thead>
          <tr>
            {visibleCols.map((col) => (
              <th key={col.key} style={cellStyle(col, b.th, 7)}>{col.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {SAMPLE_SETTLEMENTS.map((row, i) => (
            <tr key={i}>
              {visibleCols.map((col) => (
                <td key={col.key} style={cellStyle(col, b.td)}>{col.money ? formatMoney(row[col.key]) : row[col.key]}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function TotalsBlockPreview({ totals, tableBorder }) {
  const sample = computeSampleTotals();
  const cfg = { ...DEFAULT_TABLE_BORDER, ...tableBorder };
  const w = Math.max(0, Number(cfg.borderWidth)) || 1;
  const lineColor = cfg.borderColor || DEFAULT_TABLE_BORDER.borderColor;
  const outer = cfg.outerBorder ? `${w}px solid ${lineColor}` : "none";
  const cellStyle2 = cfg.cellBorder ? { border: `${w}px solid ${lineColor}` } : { borderBottom: `${w}px solid ${ROW_BORDER_COLOR}` };

  return (
    <table className="rbn-totals-table" style={{ border: outer }}>
      <tbody>
        {totals.filter((t) => t.visible).map((t) => {
          // `boldLabel`/`boldValue` are independent toggles now — `bold` is the older,
          // single shared flag; a row that never touched the new fields falls back to it
          // so an existing template's exact current look doesn't change on load.
          const boldLabel = t.boldLabel ?? t.bold;
          const boldValue = t.boldValue ?? t.bold;
          return (
            <tr key={t.key} className={t.key === "net" ? "rbn-total-net" : ""}>
              {/* 400/700 only, never an in-between weight like 500/600/800 — none of this
                  app's font options (Arial, Verdana, Times New Roman, ...) ship a real
                  Medium/SemiBold/ExtraBold static weight, so an in-between numeric value
                  gets silently resolved by the browser's font-weight-matching fallback to
                  whichever of 400/700 is "nearest" — for values ≥500 that nearest weight is
                  700 for every one of these fonts, meaning `boldValue: false` (previously
                  600) was rendering visually identical to `boldValue: true` (800): the
                  value always looked bold regardless of the toggle. Plain 400/700 is an
                  exact match either way, so the toggle now reliably makes a visible
                  difference. */}
              <td className="rbn-total-label" style={{ fontWeight: boldLabel ? 700 : 400, ...cellStyle2 }}>{t.label}</td>
              <td className="rbn-total-value" style={{ fontWeight: boldValue ? 700 : 400, ...cellStyle2 }}>{formatMoney(sample[t.key])}</td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
