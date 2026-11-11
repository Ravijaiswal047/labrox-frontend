// NextGen font-family options.
//
// The first 10 are OS-installed fonts only (no network fetch, no flash of
// unstyled text) — several look near-identical (Segoe UI/Arial/Verdana/
// Tahoma/Trebuchet are all similar system sans-serifs), which is the
// tradeoff of staying OS-only.
//
// The remaining ones are genuinely distinct "modern"/"classy"/"trending"
// faces (Poppins, Inter, Playfair Display, etc.) that aren't installed on
// most machines, so they're self-hosted as woff2 files bundled into the
// build (styles/nextgen/fonts.css + assets/fonts/nextgen/) rather than
// fetched from Google Fonts' CDN at runtime — same zero-network-dependency
// guarantee as the OS-fonts list, just backed by a bundled file instead of
// an OS-provided one. Each includes a same-genre fallback in case the
// woff2 fails to load for any reason.
export const NG_FONT_FAMILIES = [
  { label: "System Default", value: 'system-ui, -apple-system, "Segoe UI", sans-serif' },
  { label: "Segoe UI", value: '"Segoe UI", Tahoma, sans-serif' },
  { label: "Arial", value: "Arial, Helvetica, sans-serif" },
  { label: "Verdana", value: "Verdana, Geneva, sans-serif" },
  { label: "Tahoma", value: "Tahoma, Geneva, sans-serif" },
  { label: "Trebuchet MS", value: '"Trebuchet MS", sans-serif' },
  { label: "Georgia (serif)", value: 'Georgia, "Times New Roman", serif' },
  { label: "Times New Roman (serif)", value: '"Times New Roman", Times, serif' },
  { label: "Courier New (mono)", value: '"Courier New", Courier, monospace' },
  { label: "Consolas (mono)", value: 'Consolas, "Lucida Console", monospace' },
  // Modern
  { label: "Inter (modern)", value: '"NG Inter", system-ui, sans-serif' },
  { label: "Poppins (modern)", value: '"NG Poppins", system-ui, sans-serif' },
  { label: "Montserrat (modern)", value: '"NG Montserrat", system-ui, sans-serif' },
  { label: "DM Sans (modern)", value: '"NG DM Sans", system-ui, sans-serif' },
  { label: "Space Grotesk (trending)", value: '"NG Space Grotesk", system-ui, sans-serif' },
  // Classy
  { label: "Playfair Display (classy)", value: '"NG Playfair Display", Georgia, serif' },
  { label: "Merriweather (classy)", value: '"NG Merriweather", Georgia, serif' },
  // Trending mono
  { label: "JetBrains Mono (trending)", value: '"NG JetBrains Mono", Consolas, monospace' },
];

export const NG_DEFAULT_FONT_FAMILY = NG_FONT_FAMILIES[0].value;
