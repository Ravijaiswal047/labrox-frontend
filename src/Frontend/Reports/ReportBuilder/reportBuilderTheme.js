// Maps the site's accent-color skin (the header's Theme dropdown — stored under
// localStorage "theme" and mirrored live in Redux as loadingSlice.currentTheme,
// see src/layouts/header/Theme-dropdown and src/store/reducers/loadingSlice)
// onto the two CSS variables Report Builder's panel headers/strips/buttons use.
// Colors are read straight from each `.XXX_theme button { background-color }`
// rule in src/assets/css/theme.css, so this stays a direct reflection of the
// same skin every other button on the site already uses.
const THEME_ACCENT_COLORS = {
  default_theme: "#22d8a9",
  peach_theme: "#bc8f3c",
  pale_pink_theme: "#bc3c8b",
  red_theme: "#8b2424",
  sky_blue_theme: "#03a0e7",
  light_blue_theme: "#7ea0ea",
  pink_theme: "#ffa4c3",
  purple_theme: "#b48af6",
  gray_theme: "#666866",
  pastel_pink_theme: "#fcdede",
  light_peach_theme: "#ffe6d4",
  pale_peach_theme: "#fff3da",
  pale_yellow_theme: "#fcfaca",
  pale_green_theme: "#eaffb9",
  light_celadon_theme: "#ddffc3",
  pale_mint_theme: "#e1ffee",
  pale_aqua_theme: "#dafffc",
  pale_lavender_blue_theme: "#e1e6fe",
  pale_gray_theme: "#dfdfef",
  pale_mauve_theme: "#f2d7fe",
  lavender_blush_theme: "#f7e0f8",
  pale_rose_theme: "#ffddf8",
  lite_pale_theme: "#ffe9f0",
  blush_pink_theme: "#ffdde6",
  light_pink_theme: "#fee5e5",
  bright_aqua_theme: "#68EDE7",
  coral_orange_theme: "#ff964f",
  royal_purple_theme: "#966fd6",
  vivid_rose_theme: "#ff3d77",
  dusty_rose_theme: "#f47a97",
  rust_blue_theme: "#6196d2",
};

// Darkens a hex color by `percent` (0-1) for the header gradient's second stop.
const shade = (hex, percent) => {
  const n = parseInt(hex.replace("#", ""), 16);
  const clamp = (v) => Math.max(0, Math.min(255, Math.round(v)));
  const r = clamp(((n >> 16) & 0xff) * (1 - percent));
  const g = clamp(((n >> 8) & 0xff) * (1 - percent));
  const b = clamp((n & 0xff) * (1 - percent));
  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
};

export const getReportBuilderThemeStyle = (themeName) => {
  const top = THEME_ACCENT_COLORS[themeName] || THEME_ACCENT_COLORS.default_theme;
  return { "--rb-top": top, "--rb-top-2": shade(top, 0.35) };
};
