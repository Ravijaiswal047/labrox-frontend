import { useSelector } from "react-redux";

// Chart.js renders to <canvas>, so none of the app's CSS (including all the
// .nextgen-mode overrides in shell.css) can ever reach axis/legend/grid
// text — those colors are hardcoded in each chart's JS `options` object
// instead (mostly "#1a1a1a"/near-black, written back when every page was
// on a plain white Classic background), so on NextGen's dark background
// they read as invisible near-black-on-near-black text. This mirrors
// useNgModeClass's reasoning but for values that have to be plain JS
// colors, not CSS custom properties a canvas can't use anyway.
export function useChartThemeColors() {
  const { uiMode, ngColorMode } = useSelector((state) => state?.loadingSlice) || {};
  const isNextgenDark = uiMode === "nextgen" && ngColorMode !== "light";

  return isNextgenDark
    ? {
        text: "#e2e8f0",
        textMuted: "#94a3b8",
        grid: "rgba(226, 232, 240, 0.12)",
        tooltipBg: "#1e293b",
        tooltipTitle: "#f8fafc",
        tooltipBody: "#cbd5e1",
      }
    : {
        text: "#1a1a1a",
        textMuted: "#4b5563",
        grid: "rgba(26, 26, 26, 0.1)",
        tooltipBg: "#333",
        tooltipTitle: "#fff",
        tooltipBody: "#ddd",
      };
}

// Same 5-color set every "Sample Collection Status" chart variant already
// uses for `borderColor` (Collected/Not Collected/Received/Rejected/
// Approved) — paired fill colors at low alpha so bars/slices/areas are
// actually visible instead of just an outline (none of these charts set
// `backgroundColor` at all, so Chart.js was falling back to its own
// near-transparent default fill).
export const CHART_FILL_COLORS = [
  "rgba(252, 186, 3, 0.5)",
  "rgba(99, 104, 116, 0.5)",
  "rgba(51, 122, 183, 0.5)",
  "rgba(237, 21, 21, 0.5)",
  "rgba(25, 163, 18, 0.5)",
];
