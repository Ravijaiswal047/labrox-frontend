import React from "react";
import QrCode from "../utils/QrCode";
import { resolveToken } from "../utils/sampleData";
import { BodyTablePreview, SettlementTablePreview, TotalsBlockPreview } from "./TablePreviews";
import { useDesigner } from "./DesignerTab";
import { DEFAULT_FIELD_LABEL_WIDTH } from "../utils/layoutJson";

const ALIGN_JUSTIFY = { left: "flex-start", center: "center", right: "flex-end" };

const baseStyle = (el) => ({
  fontSize: el.fontSize || 10,
  fontWeight: el.bold ? 700 : 400,
  fontStyle: el.italic ? "italic" : "normal",
  textAlign: el.align || "left",
  color: el.color || "#20242B",
  opacity: el.opacity ?? 1,
  width: "100%",
  height: "100%",
  overflow: "hidden",
  lineHeight: 1.3,
});

// One shared style computation for a field's label span, used identically by both the
// canvas and preview render paths — previously each had its own separate style object
// (canvas computed its own fontSize explicitly, preview relied on inheriting the outer
// container's), which could drift apart. Explicit + shared removes any chance of that.
const fieldLabelStyle = (el, width) => ({
  color: "#5A6472",
  fontSize: el.fontSize || 9,
  display: "inline-block",
  width,
  flexShrink: 0,
  fontWeight: el.boldLabel ? 700 : 400,
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
});

// Optional per-side border for `label`/`html` elements — same shape/behavior as the
// page-level border (independent top/right/bottom/left toggles + one shared width+color),
// just scoped to a single element.
const elementBorderStyle = (el) => {
  const w = Math.max(0, Number(el.borderWidth)) || 1;
  const color = el.borderColor || "#1B2E5E";
  const side = (on) => (on ? `${w}px solid ${color}` : "none");
  return {
    borderTop: side(el.borderTop),
    borderRight: side(el.borderRight),
    borderBottom: side(el.borderBottom),
    borderLeft: side(el.borderLeft),
  };
};

// Pure presentational, no drag/resize/selection logic here.
// preview=false -> Designer canvas chrome (token chips, dashed anchor boxes).
// preview=true  -> Preview & Print tab, tokens resolved against sample data.
export default function ElementRenderer({ el, preview = false, centre = null, fieldLabelWidth }) {
  const style = baseStyle(el);
  // Only populated when rendered inside the Designer canvas (DesignerContext.Provider) —
  // null when rendered from the Preview & Print tab, which is a sibling tab, not nested
  // inside the Designer's provider tree.
  const designer = useDesigner();
  // A whole column of fields (Patient Name / Age / Mobile / Address / ...) only lines up
  // if every one of them reserves the same width for its label — per-field `labelWidth`
  // overrides the template-wide default (Page & Branding), which itself falls back to
  // DEFAULT_FIELD_LABEL_WIDTH for templates saved before this setting existed.
  const effectiveLabelWidth = el.labelWidth ?? fieldLabelWidth ?? designer?.meta?.fieldLabelWidth ?? DEFAULT_FIELD_LABEL_WIDTH;

  switch (el.type) {
    case "label":
      // Plain text — a newline typed in the Property Panel is a real line break the user
      // intended, not something to collapse. `white-space: normal` (the CSS default,
      // implicit whenever not set) treats \n as just another space, so it has to be set
      // explicitly or every Enter in the textarea silently vanishes on render.
      return <div style={{ ...style, ...elementBorderStyle(el), whiteSpace: "pre-wrap" }}>{el.text}</div>;

    case "html":
      // Same reasoning as `label`, but for raw HTML source: a newline typed between two
      // pieces of plain text (not between tags) needs to survive as a line break too. This
      // only affects whitespace that isn't already inside a tag — block-level tags
      // (<p>/<li>/<div>/...) still lay out on their own line regardless, so well-formed
      // multi-line HTML isn't affected either way.
      return <div style={{ ...style, ...elementBorderStyle(el), whiteSpace: "pre-wrap" }} dangerouslySetInnerHTML={{ __html: el.html }} />;

    case "field":
      // A fixed-width label leaves a variable, sometimes-narrow remainder for the value
      // within the element's own designed width — values (patient names, addresses, ...)
      // are unpredictable length, so let the value overflow visibly past the box rather
      // than clip it with `overflow: hidden` (inherited from baseStyle). It's absolutely
      // positioned on open canvas space, not inside a constrained cell, so this is safe.
      return preview ? (
        <div
          style={{
            ...style,
            overflow: "visible",
            display: "flex",
            alignItems: "baseline",
            justifyContent: ALIGN_JUSTIFY[el.align] || "flex-start",
            whiteSpace: "nowrap",
          }}
        >
          {el.showLabel && <span style={fieldLabelStyle(el, effectiveLabelWidth)}>{el.label}:</span>}
          <b style={{ fontSize: el.fontSize || 9, fontWeight: el.boldValue ? 700 : 400 }}>{resolveToken(el.token, centre)}</b>
        </div>
      ) : (
        <div style={{ ...style, overflow: "visible", display: "flex", alignItems: "center", gap: 3, whiteSpace: "nowrap" }}>
          {el.showLabel && <span style={fieldLabelStyle(el, effectiveLabelWidth)}>{el.label}:</span>}
          <span className="rbn-token-chip">{el.token || "{token}"}</span>
        </div>
      );

    case "image":
      // Not set in Page & Branding — this element's own Property Panel ("Picture" section)
      // is where its image is picked, same as `stamp`.
      return el.previewSrc ? (
        <img src={el.previewSrc} alt="" style={{ width: "100%", height: "100%", objectFit: el.fit || "cover" }} />
      ) : (
        <div className="rbn-placeholder-box">Image — select it, then upload in the Property Panel</div>
      );

    case "barcode":
      // Rotation is applied once, uniformly, by the host wrapper (ElementBox on canvas,
      // the per-element positioning div in PreviewPrintTab) — not per element type here.
      return (
        <div className="rbn-barcode-placeholder">
          <div className="rbn-barcode-bars" />
          <span>{preview ? resolveToken(el.token, centre) : el.token}</span>
        </div>
      );

    case "qrcode":
      return (
        <div style={{ width: "100%", height: "100%" }}>
          <QrCode value={preview ? resolveToken(el.token, centre) : el.token} />
        </div>
      );

    case "stamp":
      return el.previewSrc ? (
        <img src={el.previewSrc} alt="stamp" style={{ width: "100%", height: "100%", objectFit: "contain", opacity: el.opacity ?? 0.9 }} />
      ) : (
        <div className="rbn-stamp-placeholder">STAMP</div>
      );

    case "pageno":
      return (
        <div style={{ ...style, textAlign: el.align || "right" }}>
          {(el.format || "Page {page} of {pages}").replace("{page}", "1").replace("{pages}", "1")}
        </div>
      );

    case "line":
      return <div style={{ width: "100%", height: "100%", background: el.color || "#1B2E5E", opacity: el.opacity ?? 1 }} />;

    case "rect":
      return (
        <div
          style={{
            width: "100%",
            height: "100%",
            border: `${el.borderWidth || 1.5}px solid ${el.borderColor || "#1B2E5E"}`,
            background: el.fill === "transparent" || !el.fill ? "transparent" : el.fill,
            opacity: el.opacity ?? 1,
          }}
        />
      );

    case "bodytable":
      if (preview) return null;
      return designer?.bodyColumns?.length ? (
        <div className="rbn-canvas-table-wrap">
          <BodyTablePreview
            bodyColumns={designer.bodyColumns}
            inclusionStyle={designer.meta?.inclusionStyle}
            tableBorder={designer.meta?.tableBorder}
          />
        </div>
      ) : (
        <div className="rbn-anchor-box">Body table — columns in the Body Table tab</div>
      );

    case "settletable":
      // "Show settlement table" (Page & Branding) is what actually decides whether this
      // prints at all — Preview & Print already hides it entirely when off, and so does
      // the canvas now, rather than showing anything (live table or placeholder) that's
      // misleading about what actually prints.
      if (preview || designer?.meta?.showSettlement === false) return null;
      return designer?.settlementColumns?.length ? (
        <div className="rbn-canvas-table-wrap">
          <SettlementTablePreview settlementColumns={designer.settlementColumns} tableBorder={designer.meta?.settlementTableBorder} />
        </div>
      ) : (
        <div className="rbn-anchor-box">Settlement table — columns in Settlement &amp; Totals tab</div>
      );

    case "totalsblock":
      if (preview) return null;
      return designer?.totals?.length ? (
        <div className="rbn-canvas-table-wrap">
          <TotalsBlockPreview totals={designer.totals} tableBorder={designer.meta?.totalsTableBorder} />
        </div>
      ) : (
        <div className="rbn-anchor-box">Totals block (Gross → Due)</div>
      );

    default:
      return null;
  }
}
