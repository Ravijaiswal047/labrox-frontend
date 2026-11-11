import { useEffect, useMemo, useState } from "react";
import { useDispatch } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { DynamicIcon } from "@app/utils/DynamicIcon";
import { useLocalStorage } from "@app/utils/hooks/useLocalStorage";
import { triggerDesignationModal } from "@store/reducers/loadingSlice/loadingSlice";
import "./NextGenSidebar.css";

// Menu names are free text from the backend (no icon/color metadata), so we
// map common ones to a sensible icon + accent, and hash anything unrecognized
// onto a fallback palette so it always looks intentional either way.
const MENU_ICON_MAP = {
  dashboard: { icon: "FaChartPie", color: "#8b5cf6" },
  hr: { icon: "FaUsers", color: "#3b82f6" },
  tool: { icon: "FaToolbox", color: "#22c55e" },
  feedback: { icon: "FaCommentDots", color: "#22c55e" },
  registration: { icon: "FaIdCard", color: "#22c55e" },
  advance: { icon: "FaFileInvoiceDollar", color: "#f87171" },
  settlement: { icon: "FaFileInvoiceDollar", color: "#f87171" },
  reprint: { icon: "FaPrint", color: "#f87171" },
  report: { icon: "FaChartBar", color: "#22c55e" },
  opd: { icon: "FaStethoscope", color: "#22c55e" },
  approval: { icon: "FaCheckCircle", color: "#22c55e" },
  laboratory: { icon: "FaFlask", color: "#06b6d4" },
  master: { icon: "FaDatabase", color: "#f59e0b" },
  invoic: { icon: "FaFileInvoice", color: "#0ea5e9" },
  account: { icon: "FaCoins", color: "#0ea5e9" },
  collection: { icon: "FaHandHoldingUsd", color: "#0ea5e9" },
  administrat: { icon: "FaUserShield", color: "#6366f1" },
  customer: { icon: "FaHeadset", color: "#ec4899" },
  radiology: { icon: "FaXRay", color: "#06b6d4" },
  pharmac: { icon: "FaPrescriptionBottle", color: "#22c55e" },
  favourite: { icon: "FaStar", color: "#f59e0b" },
  all: { icon: "FaThLarge", color: "#64748b" },
};

const FALLBACK_PALETTE = ["#6366f1", "#0ea5e9", "#22c55e", "#f59e0b", "#ec4899", "#06b6d4"];
const FALLBACK_ICON = "FaFolder";

const EXPANDED_WIDTH = "260px";
const COLLAPSED_WIDTH = "76px";

function getMenuStyle(menuName, index) {
  const key = (menuName || "").toLowerCase();
  const matchKey = Object.keys(MENU_ICON_MAP).find((k) => key.includes(k));
  if (matchKey) return MENU_ICON_MAP[matchKey];
  return { icon: FALLBACK_ICON, color: FALLBACK_PALETTE[index % FALLBACK_PALETTE.length] };
}

export default function NextGenSidebar({ menuData = [], logoSrc, onOpenProfile }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
  const userData = useLocalStorage("userData", "get");

  const [search, setSearch] = useState("");
  const [openMenus, setOpenMenus] = useState(() => new Set());
  const [collapsed, setCollapsed] = useState(() => useLocalStorage("ngSidebarCollapsed", "get") === true);
  const [hoveredMenu, setHoveredMenu] = useState(null);
  const [avatarError, setAvatarError] = useState(false);

  // Single source of truth for the sidebar's current width — both the
  // sidebar itself and shell.css's content-shift rule read this var, so
  // there's only one place that needs to know the collapsed/expanded width.
  useEffect(() => {
    document.documentElement.style.setProperty(
      "--ng-sidebar-width",
      collapsed ? COLLAPSED_WIDTH : EXPANDED_WIDTH,
    );
  }, [collapsed]);

  const toggleCollapsed = () => {
    setCollapsed((prev) => {
      const next = !prev;
      useLocalStorage("ngSidebarCollapsed", "set", next);
      return next;
    });
  };

  const visibleMenus = useMemo(
    () => (menuData || []).filter((m) => m?.MenuName && m?.MenuName !== "All Menu"),
    [menuData],
  );

  const filteredMenus = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return visibleMenus;
    return visibleMenus
      .map((menu) => ({
        ...menu,
        pageData: (menu.pageData || []).filter((p) =>
          (p?.label || "").toLowerCase().includes(term),
        ),
      }))
      .filter((menu) => menu.pageData.length > 0 || menu.MenuName.toLowerCase().includes(term));
  }, [visibleMenus, search]);

  const toggleMenu = (menuId) => {
    setOpenMenus((prev) => {
      const next = new Set(prev);
      if (next.has(menuId)) next.delete(menuId);
      else next.add(menuId);
      return next;
    });
  };

  const goToPage = (pageUrl) => {
    if (pageUrl) navigate(pageUrl);
    setHoveredMenu(null);
  };

  const initials = (userData?.Username || "U").slice(0, 2).toUpperCase();

  // Same rule Classic Header.jsx's home icon uses — go to /dashboard when
  // either flag is on, otherwise /Welcome.
  const goToHome = () => {
    navigate(
      userData?.ShowDashboard == 1 || userData?.IsStoreDashboard == 1
        ? "/dashboard"
        : "/Welcome"
    );
  };

  return (
    <aside className={`ng-sidebar ${collapsed ? "is-collapsed" : ""}`}>
      <div className="ng-sidebar__brand">
        {logoSrc ? (
          <img
            className="ng-sidebar__brand-logo"
            src={logoSrc}
            alt=""
            onClick={goToHome}
            style={{ cursor: "pointer" }}
          />
        ) : (
          <span
            className="ng-sidebar__brand-mark"
            onClick={goToHome}
            style={{ cursor: "pointer" }}
          >LR</span>
        )}
        {/* {!collapsed && (
          <div className="ng-sidebar__brand-text">
            <strong>{userData?.CompanyCode || "Hospedia"}</strong>
            <span>LabRox Health</span>
          </div>
        )} */}
        <button
          type="button"
          className="ng-sidebar__collapse-btn"
          title={collapsed ? t("Expand") : t("Collapse")}
          onClick={toggleCollapsed}
        >
          <i className={`pi ${collapsed ? "pi-angle-double-right" : "pi-angle-double-left"}`} />
        </button>
      </div>

      {!collapsed && (
        <div className="ng-sidebar__search">
          <i className="pi pi-search" />
          <input
            type="text"
            placeholder={t("Search menu...")}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      )}

      <nav className="ng-sidebar__nav">
        {filteredMenus.map((menu, index) => {
          const style = getMenuStyle(menu.MenuName, index);
          const isOpen = !collapsed && (openMenus.has(menu.MenuID) || !!search.trim());
          const isFlyoutOpen = collapsed && hoveredMenu === menu.MenuID;
          const isActiveGroup = (menu.pageData || []).some(
            (p) => p?.PageUrl && location.pathname.toLowerCase() === p.PageUrl.toLowerCase(),
          );

          return (
            <div
              key={menu.MenuID}
              className="ng-sidebar__group"
              onMouseEnter={() => collapsed && setHoveredMenu(menu.MenuID)}
              onMouseLeave={() => collapsed && setHoveredMenu(null)}
            >
              <button
                type="button"
                className={`ng-sidebar__item ${isActiveGroup ? "is-active-group" : ""}`}
                title={collapsed ? t(menu.MenuName) : undefined}
                onClick={() => !collapsed && toggleMenu(menu.MenuID)}
              >
                <span className="ng-sidebar__icon" style={{ background: `${style.color}26`, color: style.color }}>
                  <DynamicIcon name={style.icon} size={16} />
                </span>
                {!collapsed && (
                  <>
                    <span className="ng-sidebar__label">{t(menu.MenuName)}</span>
                    <i className={`pi pi-chevron-down ng-sidebar__chevron ${isOpen ? "is-open" : ""}`} />
                  </>
                )}
              </button>

              {(isOpen || isFlyoutOpen) && (menu.pageData || []).length > 0 && (
                <div className={collapsed ? "ng-sidebar__flyout" : "ng-sidebar__submenu"}>
                  {collapsed && <div className="ng-sidebar__flyout-title">{t(menu.MenuName)}</div>}
                  {menu.pageData.map((page) => {
                    const isActive =
                      page?.PageUrl && location.pathname.toLowerCase() === page.PageUrl.toLowerCase();
                    return (
                      <button
                        type="button"
                        key={page.value}
                        className={`ng-sidebar__page ${isActive ? "is-active" : ""}`}
                        onClick={() => goToPage(page.PageUrl)}
                      >
                        {page.label}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      <div className="ng-sidebar__footer">
        <button
          type="button"
          className="ng-sidebar__designation-btn"
          title={t("Change Designation")}
          onClick={() => dispatch(triggerDesignationModal())}
        >
          <i className="pi pi-users" />
        </button>
        {!collapsed && (
          <button type="button" className="ng-sidebar__profile" onClick={onOpenProfile}>
            {userData?.EmployeeImage && !avatarError ? (
              <img
                className="ng-sidebar__avatar ng-sidebar__avatar--img"
                src={userData.EmployeeImage}
                alt=""
                onError={() => setAvatarError(true)}
              />
            ) : (
              <span className="ng-sidebar__avatar">{initials}</span>
            )}
            <div className="ng-sidebar__profile-text">
              <strong>{userData?.Username || t("User")}</strong>
              <span>{userData?.DesignationName}</span>
            </div>
          </button>
        )}
      </div>
    </aside>
  );
}
