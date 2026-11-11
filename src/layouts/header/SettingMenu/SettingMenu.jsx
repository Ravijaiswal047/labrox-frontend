import React, { useEffect, useRef, useState } from "react";
import { Button } from "primereact/button";
import { OverlayPanel } from "primereact/overlaypanel";
import LanguageDropdown from "../languages-dropdown/LanguagesDropdown";
import ThemeDropdown from "../Theme-dropdown";
import "./SettingMenu.css";
import { useLocalStorage } from "../../../utils/hooks/useLocalStorage";
import { DynamicIcon } from "../../../utils/DynamicIcon";
import { useDispatch, useSelector } from "react-redux";
import {
  setMenuSettingLanguageToggle,
  setThemeMenuToggle,
} from "../../../store/reducers/loadingSlice/loadingSlice";
import { axiosInstance } from "../../../utils/axiosInstance";
import { apiUrls } from "../../../utils/apiUrls";
import { setSubmenu } from "../../../store/reducers/submenuSlice";
import { notify } from "../../../utils/utils";
import { toggleFullScreen } from "../../../utils/helpers";
import VoiceNavigation from "../../../pages/VoiceNavigation";
import HandleFontSize from "../HandleFontSize/HandleFontSize";
import CenterDropdown from "../CenterDropdown/CenterDropdown";
import DesignationDropdown from "../DesignationDropdown/DesignationDropdown";

export default function SettingMenu() {
  const { menuSettingLanguage, themeMenuToggle, currentTheme } = useSelector(
    (state) => state?.loadingSlice,
  );

  const dispatch = useDispatch();

  const op = useRef(null);
  const isClosingRef = useRef(false);

  const storedSubmenu = useLocalStorage("submenu", "get");
  const [menuDirection, setMenuDirection] = useState(storedSubmenu || "H");

  useEffect(() => {
    const initial = storedSubmenu || "H";
    setMenuDirection(initial);
    dispatch(setSubmenu(initial));
    if (!storedSubmenu) {
      useLocalStorage("submenu", "set", initial);
    }
  }, [storedSubmenu, dispatch]);

  const handleSettingsClick = (e) => {
    if (op.current?.overlayVisible) {
      op.current.hide();
      return;
    }
    dispatch(setMenuSettingLanguageToggle(false));
    dispatch(setThemeMenuToggle(false));
    op.current.toggle(e);
  };

  const handleLanguageClick = () => {
    dispatch(setMenuSettingLanguageToggle(!menuSettingLanguage));
  };

  const handleThemeClick = () => {
    dispatch(setThemeMenuToggle(!themeMenuToggle));
  };

  // Toggle horizontal / vertical menu
  const updatedMenuDirection = async () => {
    const newDirection = menuDirection === "V" ? "H" : "V";
    try {
      const res = await axiosInstance.post(apiUrls?.EmployeeMenuDirection, {
        direction: newDirection,
      });
      useLocalStorage("submenu", "set", newDirection);
      notify(res?.data?.message || "Menu direction updated", "success");
      setMenuDirection(newDirection);
      dispatch(setSubmenu(newDirection));
    } catch (err) {
      console.error("Menu direction update failed:", err);
      notify("Failed to update menu direction", "error");
    }
  };

  const handleHide = () => {
    if (isClosingRef.current) return;
    isClosingRef.current = true;

    dispatch(setMenuSettingLanguageToggle(false));
    dispatch(setThemeMenuToggle(false));

    setTimeout(() => {
      isClosingRef.current = false;
    }, 300);
  };

  return (
    <div className="settingmenu-wrapper">
      <Button
        icon="pi pi-cog"
        rounded
        text
        className="settings-btn"
        onClick={handleSettingsClick}
        aria-label="Settings"
      />

      <OverlayPanel
        ref={op}
        onHide={handleHide}
        className={`settingmenu-panel bg-grey ${currentTheme}`}
      >
        {/* Language Selector */}
        <div
          className="settingmenu-item d-flex align-items-center"
          style={{ gap: "8px" }}
        >
          <LanguageDropdown />
          <span onClick={handleLanguageClick} style={{ cursor: "pointer" }}>
            Language
          </span>
        </div>

        {/* Theme Selector */}
        <div
          className="settingmenu-item d-flex align-items-center"
          style={{ gap: "8px" }}
        >
          <ThemeDropdown />
          <span onClick={handleThemeClick} style={{ cursor: "pointer" }}>
            Theme
          </span>
        </div>

        {/* Menu Direction Toggle */}
        <div
          onClick={updatedMenuDirection}
          className="settingmenu-item d-flex align-items-center mb-2"
          style={{ gap: "8px", cursor: "pointer" }}
        >
          <DynamicIcon name="RiMenuFoldLine" size={22} />
          <span>
            {menuDirection === "H" ? "Menu Vertical" : "Menu Horizontal"}
          </span>
        </div>

        {/* Voice Navigation */}
        <div
          className="settingmenu-item d-flex align-items-center"
          style={{ gap: "8px" }}
        >
          <VoiceNavigation />
          <span style={{ cursor: "pointer" }}>Voice</span>
        </div>

        {/* Font Size */}
        <div
          className="settingmenu-item d-flex align-items-center mb-2"
          style={{ gap: "8px" }}
        >
          <HandleFontSize fontSize={22}/>
          <span style={{ cursor: "pointer" }}>Font Size</span>
        </div>

        {/* Full Screen */}
        <div
          onClick={toggleFullScreen}
          className="settingmenu-item d-flex align-items-center mb-2"
          style={{ gap: "8px", cursor: "pointer" }}
        >
          <i
            className="fa fa-arrows-alt text-white"
            data-pr-tooltip={"Full Screen"}
            data-pr-position="bottom"
            aria-hidden="true"
          />
          <span>{"Full Screen"}</span>
        </div>
        <div
          className="settingmenu-item d-flex align-items-center"
          style={{ gap: "8px" }}
        >
          <CenterDropdown fontSize={22} />
          <span style={{ cursor: "pointer" }}>Default Centre</span>
        </div>
        <div
          className="settingmenu-item d-flex align-items-center"
          style={{ gap: "8px" }}
        >
          <DesignationDropdown fontSize={22} />
          <span style={{ cursor: "pointer", marginTop: "-12px" }}>Default Designation</span>
        </div>
      </OverlayPanel>
    </div>
  );
}
