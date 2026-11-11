import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useDispatch, useSelector } from "react-redux";
import { setUiMode } from "@store/reducers/loadingSlice/loadingSlice";
import { useLocalStorage } from "@app/utils/hooks/useLocalStorage";
import { addWindowClass, removeWindowClass } from "@app/utils/helpers";
import { updateFontAndTheme } from "@app/utils/updateFontAndTheme";
import { NG_FONT_FAMILIES } from "@app/utils/ngFontFamilies";
import "./ModeToggle.css";

const MODES = [
  { value: "classic", label: "Classic" },
  { value: "nextgen", label: "NextGen" },
];

// Matches the CSS transition duration on .ng-transition__panel.
const PANEL_MS = 450;
const HOLD_MS = 250;

function applyModeClass(mode) {
  if (mode === "nextgen") {
    addWindowClass("nextgen-mode");
    // PrimeReact overlays (Dialog/MultiSelect panel/Tooltip) portal straight
    // to document.body, outside #root, so the class needs to live there too.
    document.body.classList.add("nextgen-mode");
  } else {
    removeWindowClass("nextgen-mode");
    document.body.classList.remove("nextgen-mode");
  }
}

export default function ModeToggle() {
  const dispatch = useDispatch();
  const { uiMode, ngFontFamily } = useSelector((state) => state?.loadingSlice);
  // phase: null | "enter" | "closed" | "opening"
  const [phase, setPhase] = useState(null);
  const [pendingMode, setPendingMode] = useState(null);

  useEffect(() => {
    applyModeClass(uiMode);
  }, [uiMode]);

  useEffect(() => {
    if (phase === "enter") {
      const raf = requestAnimationFrame(() => setPhase("closed"));
      return () => cancelAnimationFrame(raf);
    }
    if (phase === "closed") {
      const timer = setTimeout(() => {
        useLocalStorage("uiMode", "set", pendingMode);
        dispatch(setUiMode(pendingMode));
        const fontLabel =
          NG_FONT_FAMILIES.find((f) => f.value === ngFontFamily)?.label || "";
        updateFontAndTheme({ theme: pendingMode, fontFamily: fontLabel });
        setPhase("opening");
      }, PANEL_MS + HOLD_MS);
      return () => clearTimeout(timer);
    }
    if (phase === "opening") {
      const timer = setTimeout(() => {
        setPhase(null);
        setPendingMode(null);
      }, PANEL_MS);
      return () => clearTimeout(timer);
    }
  }, [phase, pendingMode, dispatch]);

  const handleSelect = (mode) => {
    if (mode === uiMode || phase) return;
    setPendingMode(mode);
    setPhase("enter");
  };

  return (
    <>
      <div className="ng-mode-toggle" role="tablist" aria-label="UI mode">
        {MODES.map((mode) => (
          <button
            key={mode.value}
            type="button"
            role="tab"
            aria-selected={uiMode === mode.value}
            className={`ng-mode-toggle__option ${uiMode === mode.value ? "is-active" : ""}`}
            onClick={() => handleSelect(mode.value)}
          >
            {mode.label}
          </button>
        ))}
      </div>

      {phase &&
        createPortal(
          <div className={`ng-transition ng-transition--${phase}`}>
            <div className="ng-transition__veil" />
            <div className="ng-transition__content">
              <div className="ng-transition__orb">
                <span className="ng-transition__orb-ripple" />
                <span className="ng-transition__orb-ring" />
                <span className="ng-transition__orb-core" />
              </div>
              <span className="ng-transition__label">
                {pendingMode === "nextgen" ? "Entering NextGen" : "Returning to Classic"}
              </span>
            </div>
          </div>,
          document.body,
        )}
    </>
  );
}
