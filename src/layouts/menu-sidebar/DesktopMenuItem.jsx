  import React, { useEffect, useRef, useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import SeeMorePages from "./SeeMorePages";
import start from "../../assets/image/star.png";
import emptyStart from "../../assets/image/favorite.png";
import "./DesktopMenuItem.css";

import { useTranslation } from "react-i18next";
import { axiosInstance } from "../../utils/axiosInstance";
import { apiUrls } from "../../utils/apiUrls";
import { notify } from "../../utils/utils";

const DesktopMenuItem = ({ pageData = [], menuData = [] }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
  
  const [menu, setMenu] = useState([]);
  const [filterdMenu, setFilterdMenu] = useState([]);
  const [originalPageData, setOriginalPageData] = useState([]);
  const containerRef = useRef(null);
  const menuRef = useRef(null);
  const menuItemRefs = useRef([]);

  useEffect(() => {
    const effectivePageData = (pageData && pageData.length > 0) ? pageData : (menuData?.[0]?.pageData || []);
    setFilterdMenu(effectivePageData);
    setOriginalPageData(effectivePageData);
    const firstMenuId = menuData?.[0]?.MenuID ?? 0;
    const data = menuData?.map((ele, idx) => {
      return {
        ...ele,
        selectedMenu: ele?.MenuID === firstMenuId || idx === 0,
      };
    });
    setMenu(data ? data : []);
  }, [pageData, menuData]);

  const filterMenu = (id) => {
    const data = menu?.filter((ele) => ele?.MenuID == id);
    setFilterdMenu(data[0]?.pageData);
    setOriginalPageData(data[0]?.pageData);
    const Menudata = menuData?.map((ele) => {
      return {
        ...ele,
        selectedMenu: ele?.MenuID == id ? true : false,
      };
    });
    if (menuRef?.current) {
      menuRef.current.scrollLeft = 0;
    }
    setMenu(Menudata);
  };

  useEffect(() => {
    const handleScroll = (event, ref) => {
      if (event.deltaY !== 0 && ref.current) {
        event.preventDefault();
        ref.current.scrollLeft += event.deltaY;
      }
    };

    const currentRef = containerRef.current;
    const menuRefs = menuRef.current;

    if (currentRef) {
      currentRef.addEventListener("wheel", (e) => handleScroll(e, currentRef));
    }
    if (menuRefs) {
      menuRefs.addEventListener("wheel", (e) => handleScroll(e, menuRefs));
    }

    return () => {
      if (currentRef) {
        currentRef.removeEventListener("wheel", handleScroll);
      }
      if (menuRefs) {
        menuRefs.removeEventListener("wheel", handleScroll);
      }
    };
  }, []);

  const handleChange = (event) => {
    const { value } = event.target;

    setFilterdMenu(
      originalPageData.filter((item) =>
        item?.PageName?.toLowerCase()?.includes(value.toLowerCase()),
      ),
    );
  };

  const handleScrollLeft = () => {
    if (containerRef.current) {
      containerRef.current.scrollBy({
        left: -100,
        behavior: "smooth",
      });
    }
  };

  const handleScrollRight = () => {
    if (containerRef.current) {
      containerRef.current.scrollBy({
        left: 100,
        behavior: "smooth",
      });
    }
  };

  const handleScrollLeftMenu = () => {
    if (menuRef.current) {
      menuRef.current.scrollBy({
        left: -100,
        behavior: "smooth",
      });
    }
  };

  const handleScrollRightMenu = () => {
    if (menuRef.current) {
      menuRef.current.scrollBy({
        left: 100,
        behavior: "smooth",
      });
    }
  };

  useEffect(() => {
    const activeIndex = filterdMenu?.findIndex(
      (ele) => location.pathname.toLowerCase() === ele?.PageUrl.toLowerCase(),
    );

    if (activeIndex !== -1 && menuItemRefs.current[activeIndex]) {
      const item = menuItemRefs.current[activeIndex];
      const container = item.parentElement;
      const offset = item.offsetLeft - container.offsetLeft;
      container.scrollLeft =
        offset - container.offsetWidth / 2 + item.offsetWidth / 2;
    }
  }, [location.pathname, filterdMenu]);

  const saveFavourite = async (pageID, isFav, PageName) => {
    const payload = {
      isFav: isFav ? 0 : 1,
      pageID: pageID,
    };
    await axiosInstance
      .post(apiUrls?.SaveAllfavouritePage, payload)
      .then((response) => {
        if (response?.data?.success) {
          notify(
            `${PageName + " " + (!isFav ? "Added in" : "Remove From")} Favourite.`,
            "success",
          );
          return;
        }
        notify(response?.data?.message, "error");
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  };

  const toggleFavourite = (pageIndex, event, ele) => {
    event.stopPropagation();
    const updatedMenu = filterdMenu.map((item, index) =>
      index === pageIndex
        ? { ...item, IsFavourite: item.IsFavourite ? 0 : 1 }
        : item,
    );
    setFilterdMenu(updatedMenu);
    saveFavourite(ele?.PageID, ele?.IsFavourite, ele?.PageName);
  };

  const getIconComponent = (menuname) => {
    const keywordIconMap = {
      Favourite: "bi-star-fill",
      Emergency: "fa fa-ambulance",
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
      Favourite: "bi-star-fill",
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
      Logistic: "fa fa-bicycle",
    };
    return iconMap[menuname] || "pi pi-bullseye";
  };

  if (location.pathname === "/ChangePassword" && location.state?.hideMenu) {
    return null;
  }

  return (
    <>
      <div className="menubar-main-container ss-none bg-color-container">
        <i
          className="pi pi-caret-left px-1 pointer mr-2 text-white leftRightMenu"
          onClick={handleScrollLeft}
        ></i>

        <div className="main-menu-container" ref={containerRef}>
          {menu.map((ele, key) => (
            <span
              key={ele?.MenuID}
              ref={(el) => (menuItemRefs.current[key] = el)}
              onClick={() => filterMenu(ele?.MenuID)}
              className={`nav-item mx-2 fw-normal ${
                ele?.selectedMenu ? "active-sub-menu-list-style" : ""
              } ${key % 2 === 0 ? "even-menu-item" : "odd-menu-item"}`}
              style={{
                gap: "5px",
              }}
            >
              <i className={getIconComponent(ele?.MenuName)}></i>{" "}
              {t(ele?.MenuName)}
            </span>
          ))}
        </div>
        <i
          className="pi pi-caret-right mr-2 px-1 pointer text-white leftRightMenu"
          onClick={handleScrollRight}
        ></i>
        <div className="search-container">
          <input
            className="search-menu-container"
            type="text"
            placeholder={t("Search Page")}
            onChange={handleChange}
          />
          <i className="fa fa-search"></i>
        </div>
      </div>
      <div className="desktop-sidebar">
        <i
          className="pi pi-chevron-circle-left px-1 pointer mr-1 text-black leftRightMenu"
          onClick={handleScrollLeftMenu}
        ></i>
        <SeeMorePages name="Page" pages={filterdMenu} />
        <div
          style={{ backgroundColor: "white", position: "sticky" }}
          className="w-100 mr-0"
        >
          <ul className="nav d-flex" ref={menuRef}>
            {filterdMenu?.map((ele, key) => (
              <li
                key={ele?.PageName}
                ref={(el) => (menuItemRefs.current[key] = el)}
                onClick={() => {
                  sessionStorage.removeItem("receiptReprintSearchState");
                  navigate(ele?.PageUrl);
                }}
                style={{ padding: "3px 10px", gap: "3px" }}
                className={`nav-item mx-1 d-flex align-items-center ${
                  location.pathname.toLowerCase() === ele?.PageUrl.toLowerCase()
                    ? "active-tab-menu"
                    : "text-black"
                }`}
              >
                <NavLink className={"remove_theme_bg"}>
                  <p style={{ whiteSpace: "nowrap", margin: "0px" }}>
                    <i className={`fas fa-tachometer-alt nav-icon mr-1`} />{" "}
                    {t(ele?.PageName)}
                    {!!ele?.IsFavourite &&
                      location.pathname.toLowerCase() !==
                        ele?.PageUrl.toLowerCase() && (
                        <i
                          title="Added in Favourite"
                          style={{ color: "yellow" }}
                          className={`fas bi-star-fill nav-icon mr-1`}
                        />
                      )}
                  </p>
                </NavLink>
                {location.pathname.toLowerCase() ===
                  ele?.PageUrl.toLowerCase() && (
                  <img
                    className="pointer-cursor"
                    title="Add to Favourite"
                    style={{ width: "15px", height: "15px" }}
                    src={ele?.IsFavourite ? start : emptyStart}
                    onClick={(event) => toggleFavourite(key, event, ele)}
                    alt=""
                  />
                )}
              </li>
            ))}
          </ul>
        </div>

        <i
          className="pi pi-chevron-circle-right ml-2  px-1 pointer text-black leftRightMenu"
          onClick={handleScrollRightMenu}
        ></i>
      </div>
    </>
  );
};

export default DesktopMenuItem;