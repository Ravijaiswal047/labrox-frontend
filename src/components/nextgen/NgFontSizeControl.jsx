import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { notify } from "@app/utils/utils";
import { axiosInstance } from "@app/utils/axiosInstance";
import { apiUrls } from "@app/utils/apiUrls";
import { useLocalStorage } from "@app/utils/hooks/useLocalStorage";
import "./NgFontSizeControl.css";

const MIN = 9;
const MAX = 17;

/**
 * Inline replacement for layouts/header/HandleFontSize/HandleFontSize.jsx's
 * popover inside the profile panel — that popover uses a plain
 * `position: absolute` div (no portal, no escape hatch like
 * `popperConfig.strategy: "fixed"`), so nested inside this panel's
 * `overflow-y: auto` + `backdrop-filter` container it got clipped/misplaced,
 * the same class of bug Theme/Language hit before those became inline
 * NextGenSelect fields instead of popovers. Same fix here: no popup at all.
 * Reuses the exact same persistence logic (CSS vars + ChangeFontSize API).
 */
export default function NgFontSizeControl() {
  const { t } = useTranslation();
  const userData = useLocalStorage("userData", "get");
  const [fontSize, setFontSize] = useState(Number(userData?.applicationFont || 13));
  const isInitialMount = useRef(true);

  useEffect(() => {
    document.documentElement.style.setProperty("--app-font-size", `${fontSize}px`);
    document.documentElement.style.setProperty("--control-height", `${Math.max(28, fontSize * 2)}px`);
  }, []);

  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    document.documentElement.style.setProperty("--app-font-size", `${fontSize}px`);
    document.documentElement.style.setProperty("--control-height", `${Math.max(28, fontSize * 2)}px`);

    const persist = async () => {
      try {
        const currentTheme = useLocalStorage("theme", "get");
        const apiResp = await axiosInstance.post(apiUrls?.ChangeFontSize, {
          type: "FontSize",
          fontSize,
          theme: currentTheme || userData?.Theme || "",
          menuDirection: userData?.MenuDirection || "",
        });
        if (apiResp?.data?.success) {
          notify(apiResp?.data?.message, "success");
          useLocalStorage("userData", "set", { ...userData, applicationFont: String(fontSize) });
        } else {
          notify(apiResp?.data?.message || "Failed to update font size", "error");
        }
      } catch (error) {
        notify(error?.response?.data?.message || "Error updating font size", "error");
      }
    };

    persist();
  }, [fontSize]);

  return (
    <div className="ng-fontsize">
      <input
        type="range"
        min={MIN}
        max={MAX}
        value={fontSize}
        onChange={(e) => setFontSize(parseInt(e.target.value, 10))}
        className="ng-fontsize__slider"
      />
      <span className="ng-fontsize__value">{fontSize}px</span>
    </div>
  );
}
