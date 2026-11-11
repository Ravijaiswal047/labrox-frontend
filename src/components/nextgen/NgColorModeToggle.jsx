import { useDispatch, useSelector } from "react-redux";
import { setNgColorMode } from "@store/reducers/loadingSlice/loadingSlice";
import { useLocalStorage } from "@app/utils/hooks/useLocalStorage";
import "./NgColorModeToggle.css";

/**
 * Light/dark switch for the NextGen color mode — separate from ModeToggle
 * (which switches Classic <-> NextGen entirely). Only meaningful once
 * already in NextGen, so it's rendered next to that toggle in the profile
 * panel's Design section, not shown in Classic.
 */
export default function NgColorModeToggle() {
  const dispatch = useDispatch();
  const { ngColorMode } = useSelector((state) => state?.loadingSlice);
  const isLight = ngColorMode === "light";

  const handleToggle = () => {
    const next = isLight ? "dark" : "light";
    useLocalStorage("ngColorMode", "set", next);
    dispatch(setNgColorMode(next));
  };

  return (
    <button
      type="button"
      className={`ng-color-toggle ${isLight ? "is-light" : "is-dark"}`}
      onClick={handleToggle}
      role="switch"
      aria-checked={isLight}
      aria-label="Light / dark mode"
      title={isLight ? "Switch to dark mode" : "Switch to light mode"}
    >
      <span className="ng-color-toggle__icon ng-color-toggle__icon--moon">
        <i className="pi pi-moon" />
      </span>
      <span className="ng-color-toggle__icon ng-color-toggle__icon--sun">
        <i className="pi pi-sun" />
      </span>
      <span className="ng-color-toggle__knob" />
    </button>
  );
}
