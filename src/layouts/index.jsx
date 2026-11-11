import { useState, useEffect, useCallback, useRef } from "react";
import { useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { toggleSidebarMenu, resetSidebarMenu } from "@app/store/reducers/ui";
import { addWindowClass, removeWindowClass } from "@app/utils/helpers";
import Header from "@app/layouts/header/Header";
import MenuSidebar from "@app/layouts/menu-sidebar/MenuSidebar";
import Footer from "@app/layouts/footer/Footer";

import { toast } from "react-toastify";
import { axiosInstance } from "../utils/axiosInstance";

import Loading from "../components/loader/Loading";
import NotificationContent from "./NotificationContent";
import moment from "moment";
import { useLocalStorage } from "../utils/hooks/useLocalStorage";
import NotificationContentForMachine from "../modules/login/MachineBreakDownModal/NotificationContentForMachine";

const Index = (props) => {
  const [menuData, setmenuData] = useState([]);
  const [pageData, setPageData] = useState([]);
  const [load, setLoad] = useState([]);
  const [downTimeData, setDownTimeData] = useState([]);
  const [notification, setNotification] = useState(true);
  const [downtimeMessage, setDowntimeMessage] = useState(false);
  // Machine breakdown Notification
  const [machineMessages, setMachineMessages] = useState([]);
  const [showMachineNotification, setShowMachineNotification] = useState(true);

useEffect(() => {
  axiosInstance
    .get("MachineGroup/SearchMachineBreakdownMarque")
    .then((res) => {
      const messages =
        res?.data?.data?.map((item, index) =>
          index === 0
            ? item.WarningMessage
            : ` ,  ${item.WarningMessage}`
        ) || [];

      setMachineMessages(messages);
    })
    .catch(console.log);
}, []);


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

  const SuperAdmin = useLocalStorage("userData", "get")?.SuperAdmin;
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
          pageData: allPageData?.filter(item => item?.MenuID !== -1),
        };
        finalData.unshift(allMenu);
        state(finalData);
        if (res?.data?.message?.downTimeData?.length > 0) {
          if (
            moment(new Date()).format("YYYY-MM-DD") ==
            moment(
              new Date(res?.data?.message?.downTimeData[0]?.DownTimeDate),
            ).format("YYYY-MM-DD") &&
            ((res?.data?.message?.downTimeData[0]?.IsShowAlertToSuperAdmin ==
              1 &&
              SuperAdmin == 1) ||
              res?.data?.message?.downTimeData[0]?.IsShowAlertToAllEmployee ==
              1)
          ) {
            const downtime = res?.data?.message?.downTimeData?.map((ele) => {
              return {
                ...ele,
              };
            });
            const currentTime = moment().format("HH:mm:ss");

            const formattedFromTime = downtime[0]?.FromTime;
            const formattedToTime = downtime[0]?.ToTime;

            if (
              (formattedFromTime <= formattedToTime &&
                currentTime >= formattedFromTime &&
                currentTime <= formattedToTime) ||
              (formattedFromTime > formattedToTime &&
                (currentTime >= formattedFromTime ||
                  currentTime <= formattedToTime))
            ) {
              setDownTimeData(downtime);
              setDowntimeMessage(true);
            } else {
              setDowntimeMessage(false);
            }
          }
        }

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

  // React Router doesn't reset window scroll on navigation. Without this,
  // landing here (e.g. right after login) can inherit a leftover scrollY
  // from whatever page/scroll position was active before this layout
  // mounted, so the page renders already scrolled past the sticky header.
  const location = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  const submenu = useSelector((state) => state.submenuSlice.type);
  const prevScreenSizeRef = useRef(screenSize);

  useEffect(() => {
    if (prevScreenSizeRef.current && prevScreenSizeRef.current !== screenSize) {
      console.log(
        "Screen size changed from",
        prevScreenSizeRef.current,
        "to",
        screenSize,
      );
      dispatch(resetSidebarMenu());
    }
    prevScreenSizeRef.current = screenSize;
  }, [screenSize, dispatch]);

  useEffect(() => {
    removeWindowClass("sidebar-closed");
    removeWindowClass("sidebar-open");
    removeWindowClass("sidebar-collapse");

    const verticalMode = submenu === "V";

    if (verticalMode) {
      if (menuSidebarCollapsed) {
        addWindowClass("sidebar-open");
      } else {
        addWindowClass("sidebar-closed");
      }
    } else {
      if (menuSidebarCollapsed && screenSize === "lg") {
        addWindowClass("sidebar-collapse");
      } else if (
        menuSidebarCollapsed &&
        (screenSize === "xs" || screenSize === "sm")
      ) {
        addWindowClass("sidebar-open");
      } else if (!menuSidebarCollapsed && screenSize !== "lg") {
        addWindowClass("sidebar-closed");
        addWindowClass("sidebar-collapse");
      } else if (!menuSidebarCollapsed && screenSize === "lg") {
        // desktop expanded: make sure closed/collapse are handled consistently
        addWindowClass("sidebar-closed");
      }
    }
  }, [menuSidebarCollapsed, screenSize, submenu]);

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


  return (
    <div className="wrapper">
      <>
        <>
           {showMachineNotification && machineMessages.length > 0 && (
            <div className="text-notification">
              <span>
                <NotificationContentForMachine messages={machineMessages} />
              </span>
              <i
                className="pi pi-times"
                onClick={() => setShowMachineNotification(false)}
              />
            </div>
          )}
          {notification && (
            <>
              <div className="text-notification">
                <span>
                  <NotificationContent setNotification={setNotification} />
                </span>
                <i
                  className="pi pi-times"
                  onClick={() => setNotification(false)}
                ></i>
              </div>
            </>
          )}
          {downtimeMessage && (
            <>
              <div className="text-notification">
                <span style={{ color: "red" }}>
                  ⚠️ **Alert:** There is a scheduled downtime between **
                  {downTimeData[0]?.FromTime} - {downTimeData[0]?.ToTime}**.
                  Please avoid using the system during this time.
                </span>
                <i
                  className="pi pi-times"
                  onClick={() => setDowntimeMessage(false)}
                ></i>
              </div>
            </>
          )}
        </>
        <div id="main-header">
          <div className="header-fixed">
            <Header menuData={[...menuData].sort((a, b) => (a.MenuID - b.MenuID))} handlePage={handlePage} />
          </div>
          <MenuSidebar menuData={menuData} pageData={pageData} />
        </div>
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
          onKeyDown={() => { }}
        />
      </>
    </div>
  );
};

export default Index;
