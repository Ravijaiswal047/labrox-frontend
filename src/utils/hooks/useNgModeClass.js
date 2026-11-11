import { useSelector } from "react-redux";

/**
 * Any element that hardcodes `className="nextgen-mode"` on itself (Dialogs,
 * portaled panels, the profile overlay, ...) re-matches the base
 * `.nextgen-mode { --ng-navy-900: <light>; ... }` rule in variables.css
 * directly on that element — which overrides whatever `.nextgen-mode.ng-dark`
 * an ancestor (like <body>) already set, since a custom property declared on
 * a closer element always wins over an inherited one, even to the "same"
 * rule name. Every element that applies the base `nextgen-mode` class must
 * also conditionally carry `ng-dark` itself for the dark override to
 * actually reach it — use this hook instead of hardcoding the string.
 * (Light is the base/default palette on purpose - forgetting the mode
 * class here now just falls back to light, not dark.)
 */
export function useNgModeClass() {
  const { ngColorMode } = useSelector((state) => state?.loadingSlice) || {};
  return ngColorMode === "dark" ? "nextgen-mode ng-dark" : "nextgen-mode";
}
