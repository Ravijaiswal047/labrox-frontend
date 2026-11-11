// Page dimensions in CSS pixels @ 96dpi, [width, height]. A4's width is widened ~10%
// over true A4 (794px = 210mm @ 96dpi) for more comfortable editing/preview room — content
// designed at this width will run wider than physical A4 paper if printed at 100% scale.
export const PAGE_SIZES = {
  A4: [874, 1123],
  A5: [559, 794],
  Letter: [816, 1056],
  "Thermal 80mm": [302, 1123],
};

export const PAGE_SIZE_OPTIONS = [
  ...Object.keys(PAGE_SIZES).map((key) => ({ label: key, value: key })),
  { label: "Custom", value: "Custom" },
];

export const ORIENTATION_OPTIONS = [
  { label: "Portrait", value: "Portrait" },
  { label: "Landscape", value: "Landscape" },
];

// "Custom" bypasses the preset table entirely — meta.pageWidth/meta.pageHeight (px, user-
// entered in Page & Branding) are the source of truth, not derived from any name+orientation
// lookup. For every preset, dimensions still come from PAGE_SIZES so Designer/Preview/export
// always agree on the exact px box currently on screen.
export const getPageDimensions = (meta) => {
  if (meta?.pageSize === "Custom") {
    const w = Number(meta.pageWidth) || PAGE_SIZES.A4[0];
    const h = Number(meta.pageHeight) || PAGE_SIZES.A4[1];
    return [w, h];
  }
  const [w, h] = PAGE_SIZES[meta?.pageSize] || PAGE_SIZES.A4;
  return meta?.orientation === "Landscape" ? [h, w] : [w, h];
};
