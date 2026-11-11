// Shared visual language for the dashboard tabs rendered from MainDashboard.jsx
// (Frontoffice Dashboard, Director Dashboard, ...). Keep every chart card,
// stat tile and status color pulled from here so the tabs read as one system.

export const FONT_FAMILY = "system-ui, -apple-system, 'Segoe UI', sans-serif";

export const INK = {
  primary: "#0b0b0b",
  secondary: "#52514e",
  muted: "#898781",
  gridline: "#e1e0d9",
};

export const ACCENT = "#2a78d6";

// Status palette -- reserved for state, never reused as a generic series color.
export const STATUS_COLOR = {
  good: "#0ca30c",
  warning: "#fab219",
  serious: "#ec835a",
  critical: "#d03b3b",
};

export const MUTED_BAR = "#b9c0c9";

// Validated 8-hue categorical palette (fixed order is the CVD-safety
// mechanism -- keep this order when coloring by identity, don't reshuffle
// per chart). Use for "each bar/slice is a distinct named entity" charts.
export const CATEGORY_COLORS = [
  "#2a78d6", // blue
  "#1baf7a", // aqua
  "#eda100", // yellow
  "#008300", // green
  "#4a3aa7", // violet
  "#e34948", // red
  "#e87ba4", // magenta
  "#eb6834", // orange
];

export const cardStyle = {
  background: "#fcfcfb",
  borderRadius: 14,
  padding: "16px 18px 6px",
  boxShadow: "0 1px 10px rgba(11,11,11,0.06)",
  border: "1px solid rgba(11,11,11,0.06)",
  height: "100%",
};

export const statTileStyle = (tint) => ({
  background: "#fcfcfb",
  borderRadius: 14,
  padding: "14px 16px",
  boxShadow: "0 1px 10px rgba(11,11,11,0.06)",
  border: "1px solid rgba(11,11,11,0.06)",
  borderLeft: `4px solid ${tint}`,
  display: "flex",
  alignItems: "center",
  gap: 12,
  height: "100%",
});

export const iconBadgeStyle = (color = ACCENT) => ({
  width: 32,
  height: 32,
  minWidth: 32,
  borderRadius: 9,
  background: `${color}1a`,
  color,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: 14,
});

export const headerRowStyle = {
  display: "flex",
  alignItems: "flex-start",
  gap: 10,
  marginBottom: 6,
};

export const titleStyle = {
  fontSize: 15,
  fontWeight: 700,
  color: INK.primary,
  lineHeight: 1.3,
};

export const subtitleStyle = {
  fontSize: 12.5,
  color: "#6b7280",
  marginTop: 2,
};

export const legendRowStyle = {
  display: "flex",
  alignItems: "center",
  gap: 14,
  marginTop: 4,
  marginBottom: 0,
  flexWrap: "wrap",
};

export const legendItemStyle = {
  display: "flex",
  alignItems: "center",
  gap: 6,
  fontSize: 12,
  color: INK.secondary,
};

export const legendDot = (color) => ({
  width: 10,
  height: 10,
  borderRadius: 3,
  background: color,
  flexShrink: 0,
});

export const formatCurrency = (val) => `₹${Number(val || 0).toLocaleString()}`;
