import { DEFAULT_PAGE_MARGIN, DEFAULT_PAGE_BORDER } from "./layoutJson";

// A print-safe inset margin/border — the page's own physical size (pageW x pageH) never
// changes; margin/border draw INSET from the true page edges instead. This matters because
// a real printer's paper size is fixed — anything that tried to grow the page to make room
// for extra margin would either get scaled down (shrinking the whole receipt) or clipped by
// the printer, neither of which is what "add a print margin" should mean.
//
// This returns an absolutely-positioned OVERLAY style, not a wrapping box — render it as a
// sibling on top of the existing (unchanged, still full pageW x pageH) page content, inside
// a `position: relative` container sized to exactly pageW*scaleFactor x pageH*scaleFactor.
// Elements' x/y are completely unaffected either way (same "the designer keeps them within
// the frame" responsibility as every other layout guide in this app, e.g. Section 9's
// dynamic-reflow footer zone) — this never repositions or rescales any element, it only
// draws a border inset by the margin amount from the page's true edges.
// `scaleFactor` is the same zoom/scale the page box itself is already rendered at, so the
// frame stays visually proportional to the page instead of the margin/border looking
// disproportionately large or small at different zoom levels.
export const getPageFrameStyle = (meta, scaleFactor = 1) => {
  const m = { ...DEFAULT_PAGE_MARGIN, ...meta?.pageMargin };
  const b = { ...DEFAULT_PAGE_BORDER, ...meta?.pageBorder };
  const w = (Math.max(0, Number(b.borderWidth)) || 1) * scaleFactor;
  const color = b.borderColor || DEFAULT_PAGE_BORDER.borderColor;
  const side = (on) => (on ? `${w}px solid ${color}` : "none");

  return {
    position: "absolute",
    top: m.top * scaleFactor,
    right: m.right * scaleFactor,
    bottom: m.bottom * scaleFactor,
    left: m.left * scaleFactor,
    borderTop: side(b.top),
    borderRight: side(b.right),
    borderBottom: side(b.bottom),
    borderLeft: side(b.left),
    pointerEvents: "none",
  };
};
