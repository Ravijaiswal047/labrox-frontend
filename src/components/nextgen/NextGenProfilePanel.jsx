import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import { axiosInstance } from "@app/utils/axiosInstance";
import { useLocalStorage } from "@app/utils/hooks/useLocalStorage";
import { toggleFullScreen } from "@app/utils/helpers";
import { applyTheme } from "@app/utils/applyTheme";
import { useLanguage } from "@app/ContextApi/ContextApi";
import { useLanguageFetcher } from "@app/utils/hooks/useLanguageFetcher";
import { triggerDesignationModal } from "@store/reducers/loadingSlice/loadingSlice";
import { useNgModeClass } from "@app/utils/hooks/useNgModeClass";
import { themes } from "../../layouts/header/Theme-dropdown";
import ModeToggle from "./ModeToggle";
import NgColorModeToggle from "./NgColorModeToggle";
import NextGenSelect from "./NextGenSelect";
import NextGenInput from "./NextGenInput";
import VoiceNavigation from "../../pages/VoiceNavigation";
import NgFontSizeControl from "./NgFontSizeControl";
import NgFontFamilySelect from "./NgFontFamilySelect";
import CenterDropdown from "../../layouts/header/CenterDropdown/CenterDropdown";
import DesignationDropdown from "../../layouts/header/DesignationDropdown/DesignationDropdown";
import PaymentMethodModal from "../../Frontend/PaymentGateway/PaymentMethodModal";
import "./NextGenProfilePanel.css";

const THEME_OPTIONS = themes.map((th) => ({ label: th.label, value: th.theme, icon: th.icon }));

const themeOptionLabel = (option) => (
  <span className="ng-option-with-icon">
    <span className={`ng-option-with-icon__swatch ${option.icon}`} />
    {option.label}
  </span>
);

const languageOptionLabel = (option) => (
  <span className="ng-option-with-icon">
    {option.icon && <img className="ng-option-with-icon__flag" src={option.icon} alt="" />}
    {option.label}
  </span>
);

export default function NextGenProfilePanel({
  open,
  onClose,
  onLogout,
  onChangeCentre,
  onOpenCreateTicket,
  onOpenUpdateProfile,
  labNoValue,
  onLabNoChange,
  onLabNoKeyDown,
  labNoPlaceholder,
}) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const userData = useLocalStorage("userData", "get");
  const { currentTheme, uiMode } = useSelector((state) => state?.loadingSlice);
  const ngModeClass = useNgModeClass();
  const { languageList, currentLanguage, updateLanguage } = useLanguage();
  const { fetchLanguage } = useLanguageFetcher();

  const [centres, setCentres] = useState([]);
  const [avatarError, setAvatarError] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  // Switching back to Classic (e.g. via this panel's own Design toggle)
  // used to leave the panel open, floating a NextGen popup over the now-
  // Classic app underneath — the panel has no reason to exist outside
  // NextGen mode, so close it the moment uiMode stops being "nextgen".
  useEffect(() => {
    if (open && uiMode !== "nextgen") onClose();
  }, [uiMode, open, onClose]);

  // Same data source as the legacy CenterDropdown.jsx (Centre/getGlobalCentres) —
  // fetched here directly rather than through a one-line wrapper component.
  useEffect(() => {
    if (!open) return;
    axiosInstance
      .get("Centre/getGlobalCentres")
      .then((res) => {
        const mapped = (res?.data?.message || []).map((ele) => ({
          value: ele.CentreID,
          label: ele.Centre,
        }));
        setCentres(mapped);
      })
      .catch(() => setCentres([]));
  }, [open]);

  if (!open) return null;

  const run = (fn) => () => {
    fn?.();
    onClose();
  };

  const handleLanguageSelect = async (option) => {
    const language = languageList.find((l) => l.key === option?.value);
    if (!language) return;
    try {
      if (!userData?.EmployeeID) {
        toast.error("User data not found");
        return;
      }
      updateLanguage(language.key);
      await fetchLanguage({ key: language.key, label: language.label });
      await i18n.changeLanguage(language.key);
      await axiosInstance.post("LanguageMaster/UpdateLangauge", {
        EmpLanguageCode: language.id?.toString(),
        EmpLanguage: language.label,
        EmployeeID: userData?.EmployeeID?.toString(),
      });
      toast.success("Language updated");
    } catch (error) {
      toast.error("Failed to change language");
    }
  };

  // Every plain action here is a *real* handler already used elsewhere in
  // Header.jsx/SettingMenu.jsx — nothing decorative. The "embed" actions wrap
  // existing self-contained icon+dropdown components (Voice/FontSize/
  // CenterDropdown/DesignationDropdown) as-is, since they already own their
  // own fetch + click-outside + popover logic. Theme/Language moved out to
  // their own NextGenSelect sections below — a searchable list is a better
  // fit for 30 themes / a long language list than a tiny popover icon, and
  // it sidesteps the z-index/clipping issues those legacy popovers hit when
  // nested inside this panel's blurred, scrolling container.
  const actions = [
    { key: "fullscreen", label: "Fullscreen", icon: "pi pi-window-maximize", accent: "#f59e0b", onClick: toggleFullScreen },
    { key: "add", label: "Add New", icon: "pi pi-plus", accent: "#10b981", onClick: run(onOpenCreateTicket) },
    { key: "designation", label: "Change Role", icon: "pi pi-users", accent: "#3b82f6", onClick: run(() => dispatch(triggerDesignationModal())) },
    { key: "dashboard", label: "Dashboard", icon: "pi pi-home", accent: "#8b5cf6", onClick: run(() => navigate("/dashboard")) },
    { key: "voice", label: "Voice", accent: "#22c55e", embed: <VoiceNavigation /> },
    { key: "defaultcentre", label: "Default Centre", accent: "#6366f1", embed: <CenterDropdown /> },
    { key: "defaultdesignation", label: "Default Role", accent: "#14b8a6", embed: <DesignationDropdown /> },
    { key: "updateprofile", label: "Update Profile", icon: "pi pi-user-edit", accent: "#22c55e", onClick: run(onOpenUpdateProfile) },
    // Same gate Header.jsx uses for the "Pay" button — not every centre has
    // a payment gateway configured, so this must stay conditional, not always-on.
    ...(userData?.ShowPaymentGatewayLinkinTop == 1
      ? [{ key: "pay", label: "Pay", accent: "#7c3aed", embed: <PaymentMethodModal /> }]
      : []),
  ];

  const initials = (userData?.Username || "U").slice(0, 2).toUpperCase();
  const hasPhoto = userData?.EmployeeImage && !avatarError;
  const avatar = (extraClass = "") =>
    hasPhoto ? (
      <img
        className={`ng-profile-panel__avatar ng-profile-panel__avatar--img ${extraClass}`}
        src={userData.EmployeeImage}
        alt=""
        onError={() => setAvatarError(true)}
      />
    ) : (
      <span className={`ng-profile-panel__avatar ${extraClass}`}>{initials}</span>
    );

  return createPortal(
    <div className={`${ngModeClass} ng-profile-overlay`} onClick={onClose}>
      <div className="ng-profile-panel" onClick={(e) => e.stopPropagation()}>
        <div className="ng-profile-panel__header">
          {avatar()}
          <div className="ng-profile-panel__identity">
            <strong>{userData?.Username || t("User")}</strong>
            <span>{userData?.DesignationName}</span>
          </div>
          <button type="button" className="ng-profile-panel__close" onClick={onClose} aria-label="Close">
            <i className="pi pi-times" />
          </button>
        </div>

        <div className="ng-profile-panel__section">
          <span className="ng-profile-panel__label">{t("Design")}</span>
          <div className="ng-profile-panel__design-row">
            <ModeToggle />
            <NgColorModeToggle />
          </div>
        </div>

        <div className="ng-profile-panel__section">
          <span className="ng-profile-panel__label">{t("Font Size")}</span>
          <NgFontSizeControl />
        </div>

        <div className="ng-profile-panel__section">
          <span className="ng-profile-panel__label">{t("Font Family")}</span>
          <NgFontFamilySelect />
        </div>

        <div className="ng-profile-panel__section">
          <span className="ng-profile-panel__label">{t("Quick Actions")}</span>
          <div className="ng-profile-panel__grid">
            {actions.map((action) =>
              action.embed ? (
                <div
                  key={action.key}
                  className="ng-profile-panel__action ng-profile-panel__action--embed"
                  style={{ "--tile-accent": action.accent }}
                  onClick={(e) => {
                    // These embedded components each attach their own click
                    // handler to a small inner icon glyph, not this wrapper.
                    // A real click bubbles up through every ancestor, so
                    // dispatching it on the innermost icon/svg reliably
                    // reaches that handler even when the visible badge is
                    // bigger than the glyph itself.
                    if (e.target.closest("i, svg")) return;
                    e.currentTarget.querySelector("i, svg")?.click();
                  }}
                >
                  <span className="ng-profile-panel__action-icon">{action.embed}</span>
                  <span className="ng-profile-panel__action-text">{t(action.label)}</span>
                </div>
              ) : (
                <button
                  type="button"
                  key={action.key}
                  className="ng-profile-panel__action"
                  style={{ "--tile-accent": action.accent }}
                  onClick={action.onClick}
                >
                  <span className="ng-profile-panel__action-icon">
                    <i className={action.icon} />
                  </span>
                  <span className="ng-profile-panel__action-text">{t(action.label)}</span>
                </button>
              ),
            )}
          </div>
        </div>

        <div className="ng-profile-panel__section">
          <span className="ng-profile-panel__label">{t("Theme")}</span>
          <NextGenSelect
            id="ng-theme-select"
            name="theme"
            placeholderName={t("Select Theme")}
            dynamicOptions={THEME_OPTIONS}
            value={currentTheme}
            removeIsClearable
            formatOptionLabel={themeOptionLabel}
            onChange={(_, option) => option?.value && applyTheme(option.value, currentTheme, dispatch)}
          />
        </div>

        <div className="ng-profile-panel__section">
          <span className="ng-profile-panel__label">{t("Language")}</span>
          <NextGenSelect
            id="ng-language-select"
            name="language"
            placeholderName={t("Select Language")}
            dynamicOptions={languageList.map((l) => ({ label: l.label, value: l.key, icon: l.icon }))}
            value={currentLanguage?.key}
            removeIsClearable
            formatOptionLabel={languageOptionLabel}
            onChange={(_, option) => handleLanguageSelect(option)}
          />
        </div>

        <div className="ng-profile-panel__section">
          <span className="ng-profile-panel__label">{t("Centre")}</span>
          <NextGenSelect
            id="ng-centre-select"
            name="centre"
            placeholderName={t("Select Centre")}
            dynamicOptions={centres}
            value={useLocalStorage("DefaultCentre", "get")}
            removeIsClearable
            onChange={(_, option) => option?.value && onChangeCentre?.(option.value)}
          />
        </div>

        <div className="ng-profile-panel__section">
          <span className="ng-profile-panel__label">{t("Patient / Barcode Search")}</span>
          <NextGenInput
            id="ng-labno-search"
            name="LabNo"
            placeholder={labNoPlaceholder || "VisitNo/BarcodeNo/Mobile"}
            value={labNoValue}
            onChange={onLabNoChange}
            onKeyDown={onLabNoKeyDown}
          />
        </div>

        <div className="ng-profile-panel__section">
          <span className="ng-profile-panel__label">{t("My Profile")}</span>
          <div className="ng-profile-panel__profile-row">
            {avatar("ng-profile-panel__avatar--lg")}
            <div className="ng-profile-panel__profile-fields">
              <div className="ng-profile-panel__field">
                <i className="pi pi-phone" />
                {userData?.MobileNo || t("No phone on file")}
              </div>
              <div className="ng-profile-panel__field">
                <i className="pi pi-envelope" />
                {userData?.Email || t("No email on file")}
              </div>
            </div>
          </div>
        </div>

        <button type="button" className="ng-profile-panel__logout" onClick={run(onLogout)}>
          <i className="pi pi-sign-out" />
          {t("Logout")}
        </button>
      </div>
    </div>,
    document.body,
  );
}
