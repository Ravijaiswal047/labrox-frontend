import { useSelector } from "react-redux";

import DesktopMenuItem from "./DesktopMenuItem";

import { toggleSidebarMenu } from "@app/store/reducers/ui";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { SelectBox } from "../../components/formComponent/SelectBox";
import { useDispatch } from "react-redux";

const MenuSidebar = ({ menuData, pageData }) => {
  const navigate = useNavigate();
  const [selectedMenu, setSelectedMenu] = useState({
    menuValue: menuData || [],
    pageData: pageData || [],
  });
  const screenSize = useSelector((state) => state.ui.screenSize);
  const sidebarSkin = useSelector((state) => state.ui.sidebarSkin);
  const submenu = useSelector((state) => state.submenuSlice.type);

  const [expandedMenus, setExpandedMenus] = useState(new Set());
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredMenuData, setFilteredMenuData] = useState(menuData || []);
  const [originalPageData, setOriginalPageData] = useState([]);
  const [displayedOriginalPageData, setDisplayedOriginalPageData] = useState(
    [],
  );

  useEffect(() => {
    const q = (searchTerm || "").trim().toLowerCase();

    // If a menu is selected (originalPageData has items) -> filter inside it
    if (originalPageData && originalPageData.length > 0) {
      if (!q) {
        setDisplayedOriginalPageData(originalPageData);
      } else {
        const filtered = originalPageData.filter((page) =>
          String(page?.PageName ?? "")
            .toLowerCase()
            .includes(q),
        );
        setDisplayedOriginalPageData(filtered);
      }
      return; // don't run global-menu filtering when a menu is selected
    }

    // No menu selected -> your existing menu-level search/filter behavior
    if (!q) {
      setFilteredMenuData(menuData || []);
      setExpandedMenus(new Set());
      return;
    }

    const filtered =
      menuData
        ?.map((menu) => {
          const matchingPages =
            menu.pageData?.filter((page) =>
              page?.PageName?.toLowerCase()?.includes(q),
            ) || [];

          return {
            ...menu,
            pageData: matchingPages,
            hasMatch: matchingPages.length > 0,
          };
        })
        .filter((menu) => menu.hasMatch) || [];

    setFilteredMenuData(filtered);

    const menusToExpand = new Set();
    filtered.forEach((menu) => {
      if (menu.hasMatch) menusToExpand.add(menu.value);
    });
    setExpandedMenus(menusToExpand);
  }, [searchTerm, menuData, originalPageData]);

  const getPageData = (value) => {
    if (!value || value === "9999") return [];
    const data = menuData?.find((ele) => ele?.value == value);
    return data?.pageData || [];
  };

  const handleChange = (e) => {
    const { value } = e.target;
    console.log("value", value);
    setSelectedMenu({
      menuValue: value,
      pageData: getPageData(value) ?? [],
    });
    setOriginalPageData(value ? (getPageData(value) ?? []) : []);
    setDisplayedOriginalPageData(value ? (getPageData(value) ?? []) : []);
  };

  const toggleMenu = (menuValue) => {
    setExpandedMenus((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(menuValue)) {
        newSet.delete(menuValue);
      } else {
        newSet.add(menuValue);
      }
      return newSet;
    });
  };

  const dispatch = useDispatch();
  const handleSearchPage = (value) => {
    setSearchTerm(value);
  };

  const handlePageClick = (pageUrl) => {
    sessionStorage.removeItem("receiptReprintSearchState");
    navigate(pageUrl);
    dispatch(toggleSidebarMenu());
  };

  const isVertical = submenu === "V" || submenu === "vertical";
  if (!isVertical) {
    return <DesktopMenuItem pageData={pageData} menuData={menuData} />;
  }

  const visibleMenus = filteredMenuData?.slice(1) || [];

  const getIconComponent = (menuname) => {
    const keywordIconMap = {
      Camp: "fa fa-ambulance",
      Report: "fa fa-newspaper",
      Collection: "fa fa-newspaper",
      Combine: "fa fa-newspaper",
      Membership: "pi pi-id-card",
      Doc: "fa fa-user-md",
    };

    for (let keyword in keywordIconMap) {
      if (menuname.includes(keyword)) {
        return keywordIconMap[keyword];
      }
    }

    const iconMap = {
      Laboratory: "fa fa-flask",
      Reports: "fa fa-hospital-o",
      Administrator: "fa fa-user",
      Master: "fa fa-wrench",
      Invoicing: "pi pi-wallet",
      DocAccount: "fa fa-user-md",
      CouponMaster: "pi pi-ticket",
      MembershipMaster: "pi pi-id-card",
      CustomerCare: "pi pi-home",
      "Online Payment": "pi pi-money-bill",
      Radiology: "fa fa-solid fa-people-arrows",
      Tools: "fa fa-solid fa-cog",
    };
    return iconMap[menuname] || "pi pi-bullseye";
  };

  return (
    <aside className={`main-sidebar sidebar_border ${sidebarSkin}`}>
      <div className="sidebar" style={{ paddingBottom: "38px" }}>
        <div className="mt-3 bindrole col-sm-12">
          <SelectBox
            placeholderName=""
            id="MenuBar"
            options={menuData?.map((ele) => ({
              label: ele?.label,
              value: ele?.value,
              pageData: ele?.pageData,
            }))}
            selectedValue={selectedMenu?.menuValue}
            onChange={handleChange}
          />
        </div>
        <div className="bindrole">
          <div className="col-12">
            <input
              type="text"
              className="form-control search_Items"
              id="search"
              name="search"
              onChange={(e) => handleSearchPage(e?.target?.value)}
              placeholder="Search"
            />
            <i className="fa fa-search search_icon" aria-hidden="true"></i>
          </div>
        </div>
        <nav className="mt-2">
          {displayedOriginalPageData && displayedOriginalPageData.length > 0 ? (
            <div>
              {displayedOriginalPageData.map((page, index) => (
                <p
                  key={page?.PageUrl || index}
                  className="sidebar-submenu"
                  onClick={() => handlePageClick(page?.PageUrl)}
                  style={{ cursor: "pointer" }}
                >
                  <i className="fas fa-tachometer-alt" aria-hidden="true">
                    &nbsp;&nbsp;
                  </i>
                  {page?.PageName}
                </p>
              ))}
            </div>
          ) : (
            <>
              {visibleMenus?.map((menu) => (
                <div key={menu.value}>
                  {/* Parent Menu Button */}
                  <p
                    className="sidebar-submenu"
                    onClick={() => toggleMenu(menu.value)}
                    style={{
                      cursor: "pointer",
                      fontWeight: "bold",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <span>
                      <i
                        className={getIconComponent(menu.label)}
                        aria-hidden="true"
                      >
                        &nbsp;&nbsp;
                      </i>
                      {menu?.label}
                    </span>
                    <i
                      className={`fa fa-chevron-${expandedMenus.has(menu.value) ? "down" : "right"}`}
                      aria-hidden="true"
                    ></i>
                  </p>

                  {/* Submenu Items (Collapsible) */}
                  {expandedMenus.has(menu.value) && (
                    <div style={{ paddingLeft: "10px" }}>
                      {menu?.pageData?.map((page, index) => (
                        <p
                          key={page?.PageUrl || index}
                          className="sidebar-submenu"
                          onClick={() => handlePageClick(page?.PageUrl)}
                          style={{ cursor: "pointer" }}
                        >
                          <i
                            className="fas fa-tachometer-alt"
                            aria-hidden="true"
                          >
                            &nbsp;&nbsp;
                          </i>
                          {page?.PageName}
                        </p>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </>
          )}

          {filteredMenuData?.length === 0 && searchTerm && (
            <p style={{ padding: "10px", color: "#999", textAlign: "center" }}>
              No results found
            </p>
          )}
        </nav>
      </div>
    </aside>
  );
};

export default MenuSidebar;
