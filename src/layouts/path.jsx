import { useState, useEffect, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toggleSidebarMenu } from "@app/store/reducers/ui";
import { addWindowClass, removeWindowClass } from "@app/utils/helpers";
import Header from "@app/layouts/header/Header";
import MenuSidebar from "@app/layouts/menu-sidebar/MenuSidebar";
import Footer from "@app/layouts/footer/Footer";

import { toast } from "react-toastify";
import { axiosInstance } from "../utils/axiosInstance";

import Loading from "../components/loader/Loading";
import { useLocalStorage } from "../utils/hooks/useLocalStorage";
import NotificationContent from "./NotificationContent";
import Heading from "../components/UI/Heading";
import PathHeading from "../components/UI/PathHeading";

const Index = (props) => {
  const [menuData, setmenuData] = useState([]);
  const [pageData, setPageData] = useState([]);
  const [load, setLoad] = useState([]);

  const [notification, setNotification] = useState(true);
  const filtermenu = (menu, page) => {
    let resultData = [];
    const menuData = [...menu];
    const pageData = [...page];
    for (const item of menuData) {
      let subMenu = pageData.filter(
        (ele) =>
          (ele.MenuID === item?.MenuID || ele.MenuName === item?.MenuName) &&
          ele.PageName !== "" &&
          ele.PageUrl !== "",
      );
      subMenu = subMenu.map((ele) => {
        return { ...ele, label: ele?.PageName, value: ele.PageID };
      });
      item.value = item?.MenuID;
      item.label = item?.MenuName;
      item.pageData = subMenu;
      resultData.push(item);
    }
    return resultData;
  };
  useEffect(() => {
    getPageData(setmenuData, setPageData);
  }, []);

  const getPageData = (state, state2) => {
    setLoad(true);
    axiosInstance
      .get("Menu/MainMenuPageData")
      .then((res) => {
        let data = res?.data?.message;
        let finalData = filtermenu(data?.menuData, data?.pageData);
        const allPageData = finalData.flatMap((menu) => menu.pageData);
        const allMenu = {
          MenuID: 0,
          MenuName: "All Menu",
          value: 0,
          label: "All Menu",
          pageData: allPageData,
        };
        finalData.unshift(allMenu);
        state(finalData);
        state2(finalData[0].pageData);
        setLoad(false);
      })
      .catch((err) => {
        setLoad(false);
        toast.error(
          err?.response?.data?.message
            ? err?.response?.data?.message
            : "Something Went Wrong",
        );
      });
  };

  const dispatch = useDispatch();
  const menuSidebarCollapsed = useSelector(
    (state) => state.ui.menuSidebarCollapsed,
  );
  const controlSidebarCollapsed = useSelector(
    (state) => state.ui.controlSidebarCollapsed,
  );
  const screenSize = useSelector((state) => state.ui.screenSize);

  const handleToggleMenuSidebar = () => {
    dispatch(toggleSidebarMenu());
  };

  useEffect(() => {
    removeWindowClass("register-page");
    removeWindowClass("login-page");
    removeWindowClass("hold-transition");
  }, []);

  useEffect(() => {
    removeWindowClass("sidebar-closed");
    removeWindowClass("sidebar-collapse");
    removeWindowClass("sidebar-open");
    if (menuSidebarCollapsed && screenSize === "lg") {
      addWindowClass("sidebar-collapse");
    } else if (menuSidebarCollapsed && screenSize === "xs") {
      addWindowClass("sidebar-open");
    } else if (menuSidebarCollapsed && screenSize === "sm") {
      addWindowClass("sidebar-open");
    } else if (!menuSidebarCollapsed && screenSize !== "lg") {
      addWindowClass("sidebar-closed");
      addWindowClass("sidebar-collapse");
    }
  }, [screenSize, menuSidebarCollapsed]);

  useEffect(() => {
    if (controlSidebarCollapsed) {
      removeWindowClass("control-sidebar-slide-open");
    } else {
      addWindowClass("control-sidebar-slide-open");
    }
  }, [screenSize, controlSidebarCollapsed]);
  const handlePage = (e) => {
    setPageData(e);
  };

  const User = localStorage.getItem("User") ? true : false;

  return (
    <div className="wrapper">
      {" "}
      <>
        {!User && (
          <>
            {notification && (
              <div className="text-notification">
                <span>
                  <NotificationContent setNotification={setNotification} />
                </span>
                <i
                  className="pi pi-times"
                  onClick={() => setNotification(false)}
                ></i>
              </div>
            )}
          </>
        )}
        {!User && (
          <div id="main-header">
            <div className="header-fixed">
              <Header menuData={menuData} handlePage={handlePage} />
            </div>

            <MenuSidebar menuData={menuData} pageData={pageData} />
            <div className="mt-1">
              <PathHeading name="PatientRegistration" />
            </div>
          </div>
        )}
        {load ? (
          <Loading />
        ) : (
          <div className="p-1 content-wrapper" id="page-data">
            {props.children}
          </div>
        )}

        <Footer />
        <div
          id="sidebar-overlay"
          role="presentation"
          onClick={handleToggleMenuSidebar}
          onKeyDown={() => {}}
        />
      </>
    </div>
  );
};

export default Index;
