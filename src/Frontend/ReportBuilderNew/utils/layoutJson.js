// Maps the internal reducer state <-> the portable "LayoutJson" shape used for the
// export/view modal and for localStorage persistence.

import { getPageDimensions } from "../constants/pageSizes";

// Default/fallback report type — the actual value now comes from state.reportType (see
// constants/reportTypes.js for the selectable list), this is just what a brand-new
// template starts as and what a malformed/legacy LayoutJson falls back to.
export const REPORT_TYPE = "Receipt";

export const DEFAULT_TABLE_BORDER = {
  headerTopBorder: true,
  headerBottomBorder: true,
  outerBorder: true,
  cellBorder: false,
  borderWidth: 1,
  // Line color for every border drawn by the settings above (table outline, header
  // top/bottom rules, cell grid) — was two separate hardcoded constants in
  // TablePreviews.jsx before this was configurable, so nothing but this default changes
  // for a template that never touches the new field.
  borderColor: "#1B2E5E",
  // The header row's own fill — previously hardcoded in CSS with no way to turn off or
  // recolor, which is why disabling every border checkbox above still left a solid blue
  // header row behind. Defaults preserve that exact look; uncheck `headerFill` for a
  // plain white header row instead (bottom border, if any, still comes from
  // headerBottomBorder above).
  headerFill: true,
  headerBg: "#1B2E5E",
  headerColor: "#ffffff",
  // CSS's own `.rbn-preview-thead th { text-transform: uppercase }` forced every header
  // label to caps regardless of how it was actually typed in the Body Table tab — no way
  // to turn it off. `false` prints the label exactly as typed (e.g. "Time Duration"
  // instead of "TIME DURATION").
  headerUppercase: true,
};

// Fixed-width box every `field` element's label renders into, so a column of fields
// (Patient Name / Age / Mobile / Address / ...) with different-length labels still lines
// their values up at a consistent X instead of each one starting wherever its own label
// text happens to end. A single element can override this via its own `labelWidth`.
export const DEFAULT_FIELD_LABEL_WIDTH = 90;

// A print-safe INSET margin — the page's own physical size (pageWidth x pageHeight) never
// changes; this draws a border inset from the true page edges by this amount, same as a
// standard document margin. Doesn't shift any element's x/y (those stay relative to the
// true page origin) or resize/rescale them either — purely a visual frame the designer is
// responsible for keeping elements clear of, same as any other layout guide in this app.
// Applies identically in the Designer canvas and Preview & Print (utils/pageFrame.js).
export const DEFAULT_PAGE_MARGIN = { top: 0, right: 0, bottom: 0, left: 0 };

export const DEFAULT_PAGE_BORDER = {
  top: false,
  right: false,
  bottom: false,
  left: false,
  borderWidth: 1,
  borderColor: "#1B2E5E",
};

// Position + size box for `letterheadType: "image_static"` — that mode has no
// upload/preview of its own (the image is resolved entirely server-side, from wherever it
// already lives), so this is the only thing about it the Designer actually configures.
// `x`/`y` behave exactly like any element's own position (page-relative, freely draggable
// on canvas) — this box is effectively a positionable/resizable placeholder standing in
// for a real element, just with no bitmap of its own to render.
export const DEFAULT_LETTERHEAD_IMAGE_SIZE = { width: 300, height: 80, x: 0, y: 0 };

export const toLayoutJson = (state) => {
  // Resolved, exact px dimensions of the page currently being designed/previewed — for a
  // preset (A4/A5/Letter/Thermal 80mm) these come from PAGE_SIZES (already
  // orientation-swapped), for "Custom" they're the user-entered values. Sent explicitly so
  // the backend's PDF renderer draws the page at this exact size instead of re-deriving it
  // from the "A4"/"Portrait" strings — which would drift, since this app's "A4"
  // (874x1123px) is deliberately ~10% wider than true A4 for editing room.
  const [pageWidth, pageHeight] = getPageDimensions(state.meta);
  return {
    templateId: state.templateId,
    reportType: state.reportType || REPORT_TYPE,
    // Guaranteed non-null here regardless of how it got into state — the backend's own
    // SaveTemplate validation rejects a null/blank Status outright.
    template: { ...state.meta, status: state.meta.status || "Draft", pageWidth, pageHeight },
    settings: { ...state.settings },
    elements: state.elements.map((el) => ({ ...el })),
    bodyColumns: state.bodyColumns,
    settlementColumns: state.settlementColumns,
    totals: state.totals,
  };
};

export const fromLayoutJson = (json) => {
  const elements = Array.isArray(json?.elements) ? json.elements : [];
  const template = json?.template || {};
  return {
    templateId: json?.templateId ?? null,
    reportType: json?.reportType || REPORT_TYPE,
    meta: {
      ...template,
      // The backend's live response has been observed with only the PascalCase
      // `StaticHtml` present (no lowercase `staticHtml` counterpart, unlike every other
      // field) — fall back to it so an existing template's HTML letterhead actually loads
      // into the editor instead of coming back blank.
      staticHtml: template.staticHtml ?? template.StaticHtml ?? "",
      // Also observed in upper-snake-case ("HTML_STATIC") rather than the frontend's
      // lower-snake-case option values ("html_static") — normalize so the Letterhead
      // radio group actually shows the loaded template's selection instead of nothing.
      letterheadType: String(template.letterheadType ?? template.LetterheadType ?? "html_static").toLowerCase(),
      // Older templates saved before this setting existed won't have it at all —
      // backfill with the defaults so the checkboxes/width field always have a value.
      tableBorder: { ...DEFAULT_TABLE_BORDER, ...(template.tableBorder ?? template.TableBorder) },
      // Settlement/Totals used to just reuse `tableBorder` for all three tables — now each
      // is independently configurable. A template saved before this split has no
      // `settlementTableBorder`/`totalsTableBorder` of its own yet, so fall back to
      // whatever `tableBorder` already had (preserves that template's exact current look);
      // only once a per-table field actually exists does it diverge from Body's.
      settlementTableBorder: {
        ...DEFAULT_TABLE_BORDER,
        ...(template.tableBorder ?? template.TableBorder),
        ...(template.settlementTableBorder ?? template.SettlementTableBorder),
      },
      totalsTableBorder: {
        ...DEFAULT_TABLE_BORDER,
        ...(template.tableBorder ?? template.TableBorder),
        ...(template.totalsTableBorder ?? template.TotalsTableBorder),
      },
      fieldLabelWidth: Number(template.fieldLabelWidth ?? template.FieldLabelWidth ?? DEFAULT_FIELD_LABEL_WIDTH),
      pageMargin: { ...DEFAULT_PAGE_MARGIN, ...(template.pageMargin ?? template.PageMargin) },
      pageBorder: { ...DEFAULT_PAGE_BORDER, ...(template.pageBorder ?? template.PageBorder) },
      // Only meaningful for pageSize:"Custom" (presets always resolve from PAGE_SIZES) —
      // backfilled from whatever the backend echoed back so a loaded Custom template
      // restores its exact px box instead of falling back to the A4 default.
      pageWidth: Number(template.pageWidth ?? template.PageWidth) || 874,
      pageHeight: Number(template.pageHeight ?? template.PageHeight) || 1123,
      // Only meaningful for letterheadType:"image_static" — backfilled the same way as
      // every other older-template-safe field above.
      letterheadImageSize: { ...DEFAULT_LETTERHEAD_IMAGE_SIZE, ...(template.letterheadImageSize ?? template.LetterheadImageSize) },
      // Also observed coming back as an explicit `null` (lowercase key present, value
      // null) rather than just being absent — spreading `...template` would otherwise
      // carry that null straight into state, and a later Save would echo it right back,
      // which the backend's own validation then rejects ("Status field is required").
      // Never let a loaded template leave this blank.
      status: template.status || template.Status || "Draft",
    },
    settings: { ...json?.settings },
    elements: elements.map((el) => ({
      // Stable ids are a deliberate improvement over the original demo prototype
      // (which reassigned fresh ids on every load) — assign one only if missing,
      // so re-importing an older/foreign JSON still works.
      id: el.id || crypto.randomUUID(),
      ...el,
    })),
    bodyColumns: Array.isArray(json?.bodyColumns) ? json.bodyColumns : [],
    settlementColumns: Array.isArray(json?.settlementColumns) ? json.settlementColumns : [],
    totals: Array.isArray(json?.totals) ? json.totals : [],
  };
};

export const downloadLayoutJson = (state, filename) => {
  const json = JSON.stringify(toLayoutJson(state), null, 2);
  const blob = new Blob([json], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename || `${state?.meta?.code || "receipt-template"}_layout.json`;
  a.click();
  URL.revokeObjectURL(url);
};
