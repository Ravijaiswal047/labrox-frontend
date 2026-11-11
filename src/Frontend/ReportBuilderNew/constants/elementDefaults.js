export const PALETTE_ITEMS = [
  { type: "label", name: "Static text" },
  { type: "html", name: "Static HTML" },
  { type: "image", name: "Image" },
  { type: "barcode", name: "2D Barcode" },
  { type: "qrcode", name: "QR (report URL)" },
  { type: "stamp", name: "Stamp" },
  { type: "pageno", name: "Page No" },
  { type: "line", name: "Line" },
  { type: "rect", name: "Rectangle" },
];

// Singleton element types — only one of each may exist on the canvas at a time.
export const SINGLETON_TYPES = ["bodytable", "settletable", "totalsblock"];

// Shared default for the optional per-side border on `label`/`html` elements — same
// shape/behavior as the page-level border (independent top/right/bottom/left toggles +
// one shared width), just scoped to a single element instead of the whole page.
const NO_BORDER = { borderTop: false, borderRight: false, borderBottom: false, borderLeft: false, borderWidth: 1, borderColor: "#1B2E5E" };

export const ELEMENT_DEFAULTS = {
  label: { w: 180, h: 22, text: "Static text", fontSize: 10, bold: false, italic: false, align: "left", color: "#20242B", ...NO_BORDER },
  html: { w: 300, h: 60, html: "<b>Static HTML</b> content", fontSize: 10, ...NO_BORDER },
  image: { w: 120, h: 80, previewSrc: null, fit: "cover" },
  barcode: { w: 130, h: 42, token: "{BarcodeNo}" },
  qrcode: { w: 70, h: 70, token: "{OnlinelabLink}" },
  stamp: { w: 110, h: 62, previewSrc: null },
  pageno: { w: 90, h: 16, format: "Page {page} of {pages}", fontSize: 8, align: "right" },
  line: { w: 200, h: 2, color: "#1B2E5E", thickness: 2, orientation: "H" },
  rect: { w: 160, h: 70, borderColor: "#1B2E5E", borderWidth: 1.5, fill: "transparent" },
  field: { w: 180, h: 20, fontSize: 9, showLabel: true, bold: false, boldLabel: false, boldValue: true, italic: false, align: "left", color: "#20242B" },
  bodytable: { w: 746, h: 260 },
  settletable: { w: 360, h: 96 },
  totalsblock: { w: 300, h: 96 },
};

export const makeElement = (type, overrides = {}) => ({
  id: crypto.randomUUID(),
  type,
  x: 60,
  y: 60,
  z: Date.now(),
  opacity: 1,
  // Degrees, clockwise, pivoting around the element's own center — universal across every
  // type (not just barcode/qrcode, which used to be the only types with a rotation field).
  rotation: 0,
  ...(ELEMENT_DEFAULTS[type] || {}),
  ...overrides,
});
