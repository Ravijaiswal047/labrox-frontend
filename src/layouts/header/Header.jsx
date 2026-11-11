import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Dropdown, Modal } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import { toggleSidebarMenu } from "@app/store/reducers/ui";
import { Image } from "primereact/image";
import LanguagesDropdown from "@app/layouts/header/languages-dropdown/LanguagesDropdown";
import Themedropdown from "@app/layouts/header/Theme-dropdown";
import {
  shouldIncludeAIIMSID,
  toggleFullScreen,
  useClickOutside,
  addWindowClass,
  removeWindowClass,
} from "../../utils/helpers";

import { useNavigate } from "react-router-dom";
import ReactSelectHead from "../../components/formComponent/ReactSelectHead";
import { useLocalStorage } from "../../utils/hooks/useLocalStorage";
import UserDropdown from "./user-dropdown/UserDropdown";

import labroxLogo from "../../assets/image/labrox_logo.png";
import logoelabprobg from "../../assets/image/logo elabpro bg.png";
import nanjappaLogo from "../../assets/image/nanjappa.jpg";

import { toast } from "react-toastify";
import { axiosInstance } from "../../utils/axiosInstance";
import Input from "../../components/formComponent/Input";
import VoiceNavigation from "../../pages/VoiceNavigation";
import Loading from "../../components/loader/Loading";
import { reset } from "../../store/reducers/loginSlice/loginSlice";
import { getS3FileData } from "../../Frontend/util/Commonservices";
import { Tooltip } from "primereact/tooltip";
import CameraModal from "../../Frontend/utils/CameraModal";
import "./HeaderResponsive.css";
import { getBalance } from "../../store/reducers/ApiSlice/balanceSlice";
import { formatIndianNumber, logoList } from "../../utils/utils";
import {
  setLoading,
  setUiMode,
  setNgColorMode,
  setNgFontFamily,
} from "../../store/reducers/loadingSlice/loadingSlice";
import { NG_DEFAULT_FONT_FAMILY } from "../../utils/ngFontFamilies";
import PaymentModal from "../../Frontend/PaymentGateway/PaymentModal";
import SettingMenu from "./SettingMenu/SettingMenu";
import ModeToggle from "@components/nextgen/ModeToggle";
import NextGenSidebar from "@components/nextgen/NextGenSidebar";
import NextGenProfilePanel from "@components/nextgen/NextGenProfilePanel";
import SubmenuDropdown from "./submenu-dropdown";
import NotificationDropdown from "./NotificationDropdown/NotificationDropdown";
import "./Header.css";
import BalanceMenu from "./BalanceMenu";
import PaymentMethodModal from "../../Frontend/PaymentGateway/PaymentMethodModal";
import HdfcPayment from "../../Frontend/PaymentGateway/HdfcPayment";
import IciciPayment from "../../Frontend/PaymentGateway/IciciPayment";
import { DynamicIcon } from "../../utils/DynamicIcon";
import DesignationModal from "./DesignationModal";
import { LanguageProvider } from "../../ContextApi/ContextApi";
import pathcareLogo from '../../assets/image/pathcareFavLogo.jpeg'
import CreateTicket from "../../Frontend/TicketingModules/components/CreateTicket";
import AppModal from "../../components/formComponent/Modal";

const Header = ({ menuData, handlePage }) => {
  const localData = useLocalStorage("userData", "get");
  const RateTypeLogo = localData?.RateTypeLogo;
  const localCentre = useLocalStorage("DefaultCentre", "get");
  const SessionRateTypeID = localData?.SessionRateTypeID;
  const Defaultcurrency = localData?.DefaultCurrencyName;
  const DoctorId = localData?.DoctorId;
  console.log("SessionRateTypeID, DoctorId", SessionRateTypeID, DoctorId);
  const [uploadImage, setUploadImage] = useState({ show: false, data: "" });
  const {
    data: balance,
    loading,
    error,
  } = useSelector((state) => state.balaceSlice);
  const [empImage, setEmpImage] = useState(
    `https://elabassets.s3.ap-south-1.amazonaws.com/${localData?.EmployeeImage}`,
  );
  const [t] = useTranslation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const navbarVariant = useSelector((state) => state.ui.navbarVariant);
  const headerBorder = useSelector((state) => state.ui.headerBorder);
  const screenSize = useSelector((state) => state.ui.screenSize);
  const [selectedMenu, setSelectedMenu] = useState(
    menuData?.length > 0 ? menuData[0]?.value : [],
  );
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [favIndex, setFavIndex] = useState(0);
  const [load, setLoad] = useState(false);
  const [showUserProfile, setShowUserProfile] = useState(false);
  const handleUserProfile = () => {
    setShowUserProfile(!showUserProfile);
  };
  const Showdashboard = useLocalStorage("userData", "get")?.ShowDashboard;
  const IsStoreDashboard = useLocalStorage("userData", "get")?.IsStoreDashboard;
  const submenuType = useSelector((state) => state?.submenuSlice?.type);
  const userProfile = useRef(null);
  useClickOutside(userProfile, handleUserProfile, showUserProfile);

  useEffect(() => {
    setSelectedMenu(menuData?.length > 0 ? menuData[0]?.value : []);
  }, [menuData, submenuType]);

  const [centreData, setCentreData] = useState([]);
  const [showDesignationModal, setShowDesignationModal] = useState(false);
  const [showCreateTicketModal, setShowCreateTicketModal] = useState(false);
  const [designation, setDesignation] = useState([]);
  const [showNextGenProfile, setShowNextGenProfile] = useState(false);
  const { uiMode, ngColorMode, ngFontFamily, designationModalTrigger } = useSelector((state) => state?.loadingSlice);

  // ModeToggle's own class-sync effect only runs while ModeToggle is
  // mounted — but its one persistent home is inside the <nav> below, which
  // is now itself hidden whenever uiMode is "nextgen" (that <nav> is what
  // this whole hunk is conditional on). Since uiMode is read from
  // localStorage at redux init (before first render), a fresh page load
  // that's already in NextGen mode meant <nav> — and ModeToggle inside it —
  // never mounted at all, so the "nextgen-mode" class never got applied,
  // even though NextGenSidebar (self-contained CSS, no class dependency)
  // rendered fine regardless. Header.jsx itself always mounts regardless of
  // the nav's visibility, so the sync belongs here instead.
  // useLayoutEffect (not useEffect) — useEffect only runs AFTER the browser
  // has already painted the first frame, so on a hard refresh that first
  // frame rendered with NextGen's own component markup (self-delegating
  // components branch on `uiMode` synchronously, so that part was already
  // correct) but none of the `--ng-*` CSS custom properties, since those are
  // scoped under the `.nextgen-mode` class this effect adds — the result was
  // one visible frame of unstyled/white buttons before the class landed and
  // colors resolved. useLayoutEffect runs after DOM mutations but before
  // paint, so the class is already present for the very first frame.
  useLayoutEffect(() => {
    if (uiMode === "nextgen") {
      addWindowClass("nextgen-mode");
      document.body.classList.add("nextgen-mode");
    } else {
      removeWindowClass("nextgen-mode");
      document.body.classList.remove("nextgen-mode");
    }
  }, [uiMode]);

  // Same reasoning as the nextgen-mode sync above, for the light/dark color
  // mode within NextGen — kept here (not inside the toggle component) so it
  // reliably applies on first paint regardless of which component mounts.
  // Light is the base/default palette (variables.css's bare .nextgen-mode
  // rule) — only dark needs an explicit class added on top.
  useLayoutEffect(() => {
    if (ngColorMode === "dark") {
      addWindowClass("ng-dark");
      document.body.classList.add("ng-dark");
    } else {
      removeWindowClass("ng-dark");
      document.body.classList.remove("ng-dark");
    }
  }, [ngColorMode]);

  // Same reasoning again, for the whole-app font family — a CSS custom
  // property (not a class) since the value is arbitrary text, but the
  // "must survive a fresh load regardless of which component mounts first"
  // problem is identical, so it's synced from the same place.
  useLayoutEffect(() => {
    if (ngFontFamily) {
      document.documentElement.style.setProperty("--ng-font-family", ngFontFamily);
    }
  }, [ngFontFamily]);

  // NextGenSidebar / NextGenProfilePanel request opening the designation
  // modal via redux (they don't have access to this component's local
  // `designation` list/state), so re-use the exact same modal + data here.
  const isFirstDesignationTrigger = useRef(true);
  useEffect(() => {
    if (isFirstDesignationTrigger.current) {
      isFirstDesignationTrigger.current = false;
      return;
    }
    setShowDesignationModal(true);
  }, [designationModalTrigger]);
  const userdata = useLocalStorage("userData", "get");
  const DefaultCurrencyName = userdata?.DefaultCurrencyName;
  const [headerLogoUrl, setHeaderLogoUrl] = useState("");

  // These companies must always show the LabRox logo in the header (same
  // logo used on their login page), regardless of whatever logo is
  // configured against the company in the DB (GetHeaderLogo /
  // GetCompanyLogo) or in the logoList map above - so this check overrides
  // both, rather than just changing the fallback.
  const FORCE_LABROX_HEADER_LOGO_COMPANY_IDS = [1, 999, 998, 987];
  const forceLabroxHeaderLogo = FORCE_LABROX_HEADER_LOGO_COMPANY_IDS.includes(
    Number(localData?.CompanyID),
  );

  const fallbackLogoSrc = forceLabroxHeaderLogo
    ? labroxLogo
    : DefaultCurrencyName == "KES"
      ? pathcareLogo
      : logoList[localData?.CompanyID] || labroxLogo;

  const readApiMessage = (res) =>
    res?.data?.message || res?.data?.Message || "";

  const loadHeaderLogo = useCallback(async () => {
    const applyUrl = (url) => {
      if (typeof url === "string" && /^https?:\/\//i.test(url)) {
        setHeaderLogoUrl(url);
        return true;
      }
      return false;
    };

    try {
      const headerRes = await axiosInstance.post("CommonController/GetHeaderLogo");
      if (headerRes?.data?.success !== false && applyUrl(readApiMessage(headerRes))) {
        return;
      }
    } catch (_) {
      // Endpoint may not be available on an older API process; fall through.
    }

    try {
      const logoRes = await axiosInstance.post("CommonController/GetCompanyLogo", {
        Page: "CompanyLogo",
        Guid: localData?.CompanyLogo || "",
        CompanyId: String(localData?.CompanyID || ""),
      });
      const docs = logoRes?.data?.message || logoRes?.data?.Message || [];
      if (Array.isArray(docs) && docs.length > 0) {
        if (applyUrl(docs[0].fileUrl)) {
          return;
        }
        if (docs[0].awsKey) {
          const urlRes = await axiosInstance.post("CommonController/GetFileUrl", {
            Key: docs[0].awsKey,
          });
          if (applyUrl(readApiMessage(urlRes))) {
            return;
          }
        }
      }
    } catch (_) {
      // continue to login awsKey fallback
    }

    if (localData?.ImageLogo) {
      try {
        const urlRes = await axiosInstance.post("CommonController/GetFileUrl", {
          Key: localData.ImageLogo,
        });
        if (applyUrl(readApiMessage(urlRes))) {
          return;
        }
      } catch (_) {
        // keep default logo
      }
    }

    setHeaderLogoUrl("");
  }, [localData?.CompanyID, localData?.CompanyLogo, localData?.ImageLogo]);

  useEffect(() => {
    // Skip the DB logo lookup entirely for the forced companies - there is
    // nothing for it to fetch that we'd ever use, so no point spending the
    // request.
    if (forceLabroxHeaderLogo) return;
    loadHeaderLogo();
    const refreshLogo = () => loadHeaderLogo();
    window.addEventListener("company-logo-updated", refreshLogo);
    return () => window.removeEventListener("company-logo-updated", refreshLogo);
  }, [loadHeaderLogo, forceLabroxHeaderLogo]);

  const dynamicLogoSrc = forceLabroxHeaderLogo
    ? labroxLogo
    : headerLogoUrl || fallbackLogoSrc;

  const favouritePages = (
    menuData?.find((m) => m.MenuName === "Favourite" || m.MenuID === -1)
      ?.pageData ?? []
  );

  const getAbbreviation = (name = "") => {
    const words = name
      .replace(/([a-z])([A-Z])/g, "$1 $2")
      .replace(/([A-Z]+)([A-Z][a-z])/g, "$1 $2")
      .split(/[\s_\-]+/)
      .filter(Boolean);
    return words.map((w) => w[0].toUpperCase()).join("");
  };

  const handleToggleMenuSidebar = () => {
    dispatch(toggleSidebarMenu());
  };

  const handlePatientLabSearch = (e) => {
    const { value } = e.target;
    const keypress = [9, 13];
    if (keypress.includes(e.which)) {
      if (value.trim() === "") {
        toast.error("Please enter Value");
        return;
      }
      e.preventDefault();
      navigate("/DynamicLabSearch", {
        state: { data: value?.trim(), timestamp: Date.now() },
      });
      setLabNo("");
    }
  };
  const getContainerClasses = useCallback(() => {
    let classes = `main-header navbar navbar-expand ${navbarVariant}`;
    if (headerBorder) {
      classes = `${classes} border-bottom-0`;
    }
    return classes;
  }, [navbarVariant, headerBorder]);
  const [showInput, setShowInput] = useState(false);
  const [showMobileActions, setShowMobileActions] = useState(false);
  const [labNo, setLabNo] = useState("");

  const url = window.location.href;

  const logOut = async () => {
    try {
      setLoad(true);
      dispatch(setLoading(true));
      axiosInstance
        .post("Users/logout", {
          Username: localData.Username,
        })
        .then(() => {
          setLoad(false);

          if (localData?.IsWebsiteLogin == 1) {
            window.location.href = localData?.Website;
          } else {
            navigate("/login");
          }
          dispatch(reset());
          // NextGen mode/color/font are session personalization, not
          // account settings — reset them on logout so the very next login
          // (this browser, possibly a different user) starts from Classic
          // + the default font rather than inheriting whatever the last
          // logged-in user had picked. The localStorage.clear() below wipes
          // the *stored* value for next time, but does nothing about the
          // *current* in-memory redux state or the nextgen-mode/ng-light
          // classes + --ng-font-family already applied to #root/body — this
          // is what actually flips it back immediately, since navigate()
          // (unlike a hard redirect) keeps the SPA instance alive and those
          // wouldn't otherwise clear themselves before the next page loads.
          dispatch(setUiMode("classic"));
          dispatch(setNgColorMode("light"));
          dispatch(setNgFontFamily(NG_DEFAULT_FONT_FAMILY));
          const hiddenCols = window.localStorage.getItem("ResultEntryTable_HiddenCols");
          const hiddenColsCulture = window.localStorage.getItem("ResultCultureTable_HiddenCols");
          const hiddenColsAllergy = window.localStorage.getItem("ResultAllergyTable_HiddenCols");
          const hiddenColsHistoCyto = window.localStorage.getItem("HistoCytoTable_HiddenCols");
          const hiddenColsReceiptReprint = window.localStorage.getItem("ReceiptReprintTable_HiddenCols");
          const hiddenColsDispatch = window.localStorage.getItem("DispatchReportTable_HiddenCols");
          window.sessionStorage.clear();
          window.localStorage.clear();
          if (hiddenCols) {
            window.localStorage.setItem("ResultEntryTable_HiddenCols", hiddenCols);
          }
          if (hiddenColsCulture) {
            window.localStorage.setItem("ResultCultureTable_HiddenCols", hiddenColsCulture);
          }
          if (hiddenColsAllergy) {
            window.localStorage.setItem("ResultAllergyTable_HiddenCols", hiddenColsAllergy);
          }
          if (hiddenColsHistoCyto) {
            window.localStorage.setItem("HistoCytoTable_HiddenCols", hiddenColsHistoCyto);
          }
          if (hiddenColsReceiptReprint) {
            window.localStorage.setItem("ReceiptReprintTable_HiddenCols", hiddenColsReceiptReprint);
          }
          if (hiddenColsDispatch) {
            window.localStorage.setItem("DispatchReportTable_HiddenCols", hiddenColsDispatch);
          }
          document.documentElement.style.setProperty("--app-font-size", "13px");
          document.documentElement.style.setProperty(
            "--control-height",
            "26px",
          );
        })
        .catch((err) => {
          setLoad(false);
          toast.error(
            err?.data?.message ? err?.data?.message : "Error Occured",
          );
        });
    } catch (err) {
      setLoad(false);
      toast.error(err?.message || "Error Occurred");
    }
  };

  const getCentreDetails = (state) => {
    axiosInstance
      .get("Centre/getGlobalCentres")
      .then((res) => {
        let data = res.data.message;
        console.log("Centre Data:", data);
        if (DefaultCurrencyName === "KES") {
          data = data.filter((ele) => ele.CentreType !== "INSURANCE");
        }
        let value = data.map((ele) => {
          return {
            value: ele.CentreID,
            label: ele.Centre,
            DefaultCentreId: ele.DefaultCentreId,
          };
        });
        state(value);
      })
      .catch((err) => {
        setLoad(false);
        // Only treat a real auth rejection (401/403) as "logged out" - any
        // other failure (network blip, timeout, or the session cookie not
        // yet propagated to this brand-new tab on iOS) is transient and
        // must not wipe the token/userData that login just wrote.
        const status = err?.response?.status;
        if (status === 401 || status === 403) {
          dispatch(reset());
          if (localData?.IsWebsiteLogin == 1) {
            window.location.href = localData?.Website;
          } else {
            navigate("/login");
          }
          window.sessionStorage.clear();
          window.localStorage.clear();
        }
        toast.error("Something went wrong");
      });
  };

  const getDesignationData = () => {
    axiosInstance
      .get("Designation/getDesignationDataByEmployeeId")
      .then((res) => {
        if (res.data.success && Array.isArray(res?.data?.data)) {
          let data = res.data.data;
          setDesignation(data);
        }
      })
      .catch((err) => console.log(err));
  };

  useEffect(() => {
    getCentreDetails(setCentreData);
    getDesignationData();
  }, []);

  // Allow any page to open the Create Ticket modal via custom event
  useEffect(() => {
    const handler = () => setShowCreateTicketModal(true);
    window.addEventListener("openCreateTicket", handler);
    return () => window.removeEventListener("openCreateTicket", handler);
  }, []);

  const handleRedirectToPayment = () => {
    window.open(
      "https://lis.ldpldiagnostics.in/Labcorp/Design/Lab/LoginThroughOTP.aspx",
      "_blank",
    );
  };

  const handleChangeCentre = (centreId, designationId = null) => {
    axiosInstance
      .post("Users/ChangeCentre", {
        CentreID: centreId?.toString(),
        DesignationId: designationId,
      })
      .then((res) => {
        const newUserData = res?.data?.message;
        useLocalStorage("userData", "set", newUserData);
        useLocalStorage("DefaultCentre", "set", centreId);
        // useLocalStorage("DefaultCentre", "set", newUserData?.DefaultCentreId);
        useLocalStorage("CurrentDesignation", "set", designationId);
        window.location.reload();
      })
      .catch((err) =>
        toast.error(
          err?.data?.response?.message
            ? err?.data?.response?.message
            : "Error Occur",
        ),
      );
  };

  useEffect(() => {
    dispatch(getBalance());
  }, [dispatch]);

  return (
    <>
      <LanguageProvider>
        {uploadImage.show && (
          <CameraModal
            visible={uploadImage.show}
            guid={uploadImage.data}
            pageName={"Employee Image"}
            handleClose={(guidNo) =>
              setUploadImage({
                show: false,
                data: guidNo && guidNo !== "" ? guidNo : uploadImage.data,
              })
            }
            onImageChange={(imgUrl) => {
              if (imgUrl) {
                setEmpImage(imgUrl);
                const updatedData = {
                  ...localData,
                  EmployeeImage: imgUrl.replace(
                    "https://elabassets.s3.ap-south-1.amazonaws.com/",
                    "",
                  ),
                };
                useLocalStorage("userData", "set", updatedData);
              }
            }}
          />
        )}

        {load && <Loading />}
        {uiMode !== "nextgen" && (
        <nav
          className={getContainerClasses()}
          style={{ position: "sticky", top: 0, zIndex: 999 }}
        >
          <ul className="navbar-nav">
            {["lg", "md"].includes(screenSize) ? (
              submenuType === "V" ? (
                <li className="nav-item vertical-item d-flex">
                  <div className="vertical-img-conatiner">
                    <div className="header-company-logo-wrap">
                      <img
                        src={dynamicLogoSrc}
                        alt={localData?.CompanyCode}
                        className="header-company-logo"
                        onError={(e) => (e.target.src = fallbackLogoSrc)}
                      />
                      {(localData?.RateCentreType == "Franchise") && (
                      <div className="d-flex align-items-center flex-nowrap">
                       <img
                        src={`https://elabassets.s3.ap-south-1.amazonaws.com/${localData?.RateTypeLogo}`}
                        alt="Franchise Logo"
                        className="img-fluid"
                        style={{
                          height: "38px",
                          width: "100px",
                          objectFit: "contain",
                        }}
                      />
                      </div>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={handleToggleMenuSidebar}
                    type="button"
                    className="nav-link mobilerespBars vertical-button"
                  >
                    <i className="fas fa-bars" />
                  </button>
                </li>
              ) : (
                <li className="nav-item d-flex align-items-center">
                  <div className="img-conatiner">
                    <div className="header-company-logo-wrap">
                      <img
                        src={dynamicLogoSrc}
                        alt={localData?.CompanyCode}
                        className="header-company-logo"
                        onError={(e) => (e.target.src = fallbackLogoSrc)}
                      />
                      {(localData?.RateCentreType == "Franchise") && (
                      <div className="d-flex align-items-center flex-nowrap">
                      <img
                      src={`https://elabassets.s3.ap-south-1.amazonaws.com/${localData?.RateTypeLogo}`}
                      alt="Franchise Logo"
                      className="img-fluid"
                      style={{
                        height: "38px",
                        width: "100px",
                        objectFit: "contain",
                      }}
                    />
                    </div>
                      )}
                    </div>
                  </div>
                  {/* <button
                    onClick={handleToggleMenuSidebar}
                    type="button"
                    className="nav-link mobilerespBars"
                  >
                    <i className="fas fa-bars" />
                  </button> */}
                </li>
              )
            ) : (
              <li className="nav-item d-flex align-items-center">
                <div className="header-company-logo-wrap header-company-logo-wrap--mobile">
                  <img
                    src={dynamicLogoSrc}
                    alt={localData?.CompanyCode}
                    className="header-company-logo header-company-logo--mobile"
                    onError={(e) => (e.target.src = fallbackLogoSrc)}
                  />
                </div>
                <button
                  onClick={handleToggleMenuSidebar}
                  type="button"
                  className="nav-link mobilerespBars"
                >
                  <i className="fas fa-bars" />
                </button>
              </li>
            )}
          </ul>
          {["lg", "md"].includes(screenSize) && <BalanceMenu />}
          {/* <ul className="navbar-nav ml-6"></ul> */}
          {/* {localData?.ShowBalanceAmount > 0 && (
          <div className={`balance_box d-flex align-items-center`}>
            <span className="d-sm-block d-none">Balance :</span>
            <strong> ₹{formatIndianNumber(balance?.outstandingAmount)}</strong>
          </div>
        )} */}

          <ul className="navbar-nav ml-auto d-flex handleMargininSelect">
            {localData && (
              <>
              <div
                className="d-flex align-items-center"
                style={{
                  overflowX: "auto",
                  flexWrap: "nowrap",
                  gap: "6px",
                  marginRight: "8px",
                  scrollbarWidth: "none",
                }}
              >
                {favouritePages.slice(0, 5).map((item, i) => {
                  const palette = ["#6366f1","#10b981","#0ea5e9","#f43f5e","#f59e0b"];
                  const accent = palette[i % palette.length];
                  return (
                    <div
                      key={i}
                      title={item?.PageName}
                      style={{
                        flexShrink: 0,
                        cursor: "pointer",
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        height: "28px",
                        minWidth: "36px",
                        padding: "0 10px",
                        borderRadius: "6px",
                        background: "#fff",
                        borderLeft: `3px solid ${accent}`,
                        boxShadow: "0 1px 4px rgba(0,0,0,0.14)",
                        fontWeight: "700",
                        fontSize: "11px",
                        letterSpacing: "0.04em",
                        whiteSpace: "nowrap",
                        color: accent,
                        userSelect: "none",
                        position: "relative",
                        zIndex: 1,
                        transition: "transform 0.1s, box-shadow 0.1s",
                      }}
                      onMouseEnter={e => {
                        e.currentTarget.style.boxShadow = `0 3px 10px rgba(0,0,0,0.18)`;
                        e.currentTarget.style.transform = "translateY(-1px)";
                      }}
                      onMouseLeave={e => {
                        e.currentTarget.style.boxShadow = "0 1px 4px rgba(0,0,0,0.14)";
                        e.currentTarget.style.transform = "translateY(0)";
                      }}
                      onMouseDown={e => {
                        e.currentTarget.style.transform = "translateY(1px)";
                        e.currentTarget.style.boxShadow = "0 1px 2px rgba(0,0,0,0.1)";
                      }}
                      onMouseUp={e => {
                        e.currentTarget.style.transform = "translateY(-1px)";
                        e.currentTarget.style.boxShadow = "0 3px 10px rgba(0,0,0,0.18)";
                      }}
                      onClick={() => item?.PageUrl && navigate(item.PageUrl)}
                    >
                      {getAbbreviation(item?.PageName || "")}
                    </div>
                  );
                })}
              </div>

                {(url?.includes("localhost") || url?.includes("uat")) && (
                  <div className="mr-3">
                    <span
                      className={`badge rounded-pill d-inline-flex align-items-center gap-2 px-3 py-2 badge-disco`}
                      style={{
                        fontSize: "12px",
                        letterSpacing: ".05em",
                        textTransform: "uppercase",
                        fontWeight: 650,
                        border: "2px solid white",
                        margin: "0px 10px"
                      }}
                    >
                      <span className={`env-dot ${url?.includes("demo") ? "dot-demo" : "dot-uat"}`}></span>
                      {url?.includes("demo") ? "DEMO" : "UAT"}
                    </span>
                  </div>
                )}

                <Tooltip
                  target={`#designation`}
                  position="top"
                  content={"Designation"}
                />
                <div id="designation" className="mr-3 bg-white px-1 rounded-lg">
                  <strong className="text-black">
                    {localData?.DesignationName}
                  </strong>
                </div>
              </>
            )}
            {/* {(() => {
            const switchDate = new Date('2026-03-03T00:00:00');
            const now = new Date();
            const isAfterSwitch = now >= switchDate;

            return (
              <>
                {!isAfterSwitch && [1002]?.includes(Number(localData?.CompanyID)) && (
                  <div onClick={handleRedirectToPayment} className="payment_icon">
                    <SlWallet />
                  </div>
                )}
      
                {(isAfterSwitch || [1001]?.includes(Number(localData?.CompanyID))) && ( */}
            {localData?.ShowPaymentGatewayLinkinTop == 1 && (
              <PaymentMethodModal />
            )}
            {/* )}
              </>
            );
          })()} */}
            {/* <PaymentModal /> */}
            {/* {(localData?.EmployeeID == 16405 ||
            localData?.EmployeeID == 16469) && <PaymentMethodModal />} */}
            <HdfcPayment />
            <IciciPayment />
            {/* {localData?.ShowPaymentGatewayLinkinTop == 1 && <PaymentModal />} */}
            {["lg", "md"].includes(screenSize) && (
              <li className="nav-item savetheme mr-2 ">
                <div type="button" className=" ">
                  <ReactSelectHead
                    placeholderName="Select Centre"
                    dynamicOptions={centreData?.map((ele) => {
                      return { label: ele.label, value: ele.value };
                    })}
                    searchable={true}
                    value={useLocalStorage("DefaultCentre", "get")}
                    respclass="roll-off"
                    handleChange={(e) =>
                      handleChangeCentre(e.value, localData?.DesignationId)
                    }
                    plcN="center"
                  />
                </div>
              </li>
            )}
            {["lg", "md"].includes(screenSize) && (
              <li className="nav-item savetheme d-none">
                <div type="button" className=" ">
                  <ReactSelectHead
                    placeholderName="Select Menu"
                    dynamicOptions={menuData?.map((ele) => {
                      return {
                        label: ele?.label,
                        value: ele?.value,
                        pageData: ele?.pageData,
                      };
                    })}
                    searchable={true}
                    respclass="col-12 roll-off"
                    value={Number(selectedMenu)}
                    handleChange={(e) => {
                      handlePage(e.pageData);
                      setSelectedMenu(e.value);
                    }}
                    plcN="center"
                  />
                </div>
              </li>
            )}
            {["lg", "md"].includes(screenSize) && (
              <li className="nav-item savetheme d-none">
                <SubmenuDropdown />
              </li>
            )}
            {["lg", "md"].includes(screenSize) && (
              <li className="nav-item md-none mt-1">
                <Input
                  type="text"
                  // id="LabNo"
                  name="LabNo"
                  // lable={"Visit No. / Barcode No."}
                  placeholder={
                    shouldIncludeAIIMSID()
                      ? "VisitNo/BarcodeNo/CrNo"
                      : "VisitNo/BarcodeNo/Mobile"
                  }
                  value={labNo}
                  onChange={(e) => setLabNo(e.target.value)}
                  onKeyDown={(e) => handlePatientLabSearch(e, "LabNo")}
                />
              </li>
            )}
            {!["lg", "md"].includes(screenSize) && (
              <div className="nav-item d-flex align-items-center">
                <select
                  className="form-control form-control-sm mobile-header-centre-select"
                  aria-label={t("Change Centre")}
                  value={String(localCentre ?? "")}
                  onChange={(e) => {
                    const next = e.target.value;
                    if (next && String(next) !== String(localCentre ?? "")) {
                      handleChangeCentre(next, localData?.DesignationId);
                    }
                  }}
                >
                  {centreData?.map((ele) => (
                    <option key={ele.value} value={ele.value}>
                      {ele.label}
                    </option>
                  ))}
                </select>
                <i
                  className="fa fa-barcode mr-1 ml-2 pointer ls-none text-white text-bold"
                  onClick={() => {
                    setShowInput(!showInput);
                    setShowMobileActions(false);
                  }}
                ></i>
                <Dropdown
                  align="end"
                  show={showMobileActions}
                  onToggle={(isOpen) => setShowMobileActions(isOpen)}
                >
                  <Dropdown.Toggle as="div" className="pointer">
                    <i
                      className="fa fa-plus-circle mr-1 ml-2 text-white"
                      style={{ fontSize: "18px" }}
                      onClick={() => {
                        setShowMobileActions(!showMobileActions);
                        setShowInput(false);
                      }}
                    ></i>
                  </Dropdown.Toggle>

                  <Dropdown.Menu
                    className="bg-grey shadow p-2"
                    style={{ width: "260px", marginTop: "10px" }}
                  >
                    <Dropdown.Header className="px-1 py-1 border-bottom text-bold">
                      Quick Actions
                    </Dropdown.Header>
                    <div className="d-flex flex-column gap-3">
                      <div className="d-flex align-items-center justify-content-between p-1 bg-white rounded border">
                        <BalanceMenu />
                        {/* {localData?.ShowPaymentGatewayLinkinTop == 1 && (
                        <PaymentMethodModal />
                      )} */}
                      </div>
                    </div>
                  </Dropdown.Menu>
                </Dropdown>
              </div>
            )}
            {showInput && (
              <div className="header-search-menu">
                <div className="header-search-input">
                  <div className="maindiv mt-2">
                    <Input
                      type="text"
                      id="LabNo"
                      name="LabNo"
                      // lable={"Visit No. / Barcode No."}
                      placeholder="Visit No. / Barcode No."
                      value={labNo}
                      onChange={(e) => setLabNo(e.target.value)}
                      onKeyDown={(e) => handlePatientLabSearch(e, "LabNo")}
                    />
                  </div>
                </div>
              </div>
            )}
            {/* <li className="nav-item d-md-flex px-1" style={{ cursor: "pointer" }}>
            <NotificationDropdown />
          </li> */}
            {/* This is only for rendering theme at initial load */}
            <li className="nav-item d-none px-1">
              <Themedropdown />
            </li>
            {designation.length > 0 && !(SessionRateTypeID + DoctorId > 0) && (
              <div className="mx-2">
                <DynamicIcon
                  name="PiTreeStructureFill"
                  size={20}
                  color="#FFFFFF"
                  style={{ cursor: "pointer" }}
                  onClick={() => setShowDesignationModal(true)}
                />
              </div>
            )}
            {Defaultcurrency !== "KES" && <div>
              {/* Create Ticket Button */}
              < li
                className="nav-item d-md-flex align-items-center px-1"
                style={{ listStyle: "none" }}
              >
                <button
                  type="button"
                  title={t("Create Ticket")}
                  onClick={() => setShowCreateTicketModal(true)}
                  style={{
                    background: "rgba(255,255,255,0.18)",
                    border: "1.5px solid rgba(255,255,255,0.5)",
                    borderRadius: "50%",
                    width: 28,
                    height: 28,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                    color: "#fff",
                    fontSize: 20,
                    lineHeight: 1,
                    padding: 0,
                    transition: "background 0.2s",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.32)")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.18)")}
                >
                  +
                </button>
              </li>
            </div>}
            {!["sm", "xs"].includes(screenSize) && Number(localData?.CompanyID) === 999 && (
              <li className="nav-item d-flex align-items-center px-1">
                <ModeToggle />
              </li>
            )}
            <div>
              <SettingMenu />
            </div>
            {!["sm", "xs"].includes(screenSize) && (
              <li className="nav-item d-md-flex px-1">
                <div type="button">
                  <Tooltip target=".fa-home" />
                  <i
                    className="fa fa-home text-white"
                    aria-hidden="true"
                    data-pr-tooltip={t("Go To Dashboard")}
                    data-pr-position="bottom"
                    onClick={() => {
                      Showdashboard == 1 || IsStoreDashboard == 1
                        ? navigate("/dashboard")
                        : navigate("/Welcome");
                    }}
                  ></i>
                </div>
              </li>
            )}
            {/* <li className="nav-item d-none d-md-flex px-2">
            <VoiceNavigation />
          </li> */}
            <li className="nav-item d-none d-md-flex">
              {/* <Tooltip target=".Logout" /> */}
              <button
                type="button"
                className="nav-link Logout"
                data-pr-tooltip={t("Logout")}
                data-pr-position="bottom"
                onClick={logOut}
              >
                <i className="fas fa-sign-out-alt"></i>
              </button>
            </li>
            &nbsp;&nbsp;
            <li className="nav-item d-md-flex">
              {uiMode === "nextgen" ? (
                <button
                  type="button"
                  className="nav-link d-flex align-items-center"
                  onClick={() => setShowNextGenProfile(true)}
                >
                  <img
                    src={localData?.EmployeeImage}
                    alt=""
                    width={28}
                    height={23}
                    className="rounded-circle"
                    onError={(e) => (e.target.style.display = "none")}
                  />
                  <label className="control-label ml-1 d-none d-lg-block text-white">
                    {localData?.Username}
                  </label>
                </button>
              ) : (
                <button type="button" className="nav-link d-flex">
                  <UserDropdown
                    setUploadImage={setUploadImage}
                    setDropdownOpen={setDropdownOpen}
                    dropdownOpen={dropdownOpen}
                    logOut={logOut}
                    emp={localData?.EmployeeImage}
                  />
                  <label className="control-label ml-1 d-none d-lg-block text-white">
                    {localData?.Username}
                  </label>
                </button>
              )}
            </li>
            &nbsp;&nbsp;
          </ul>
        </nav>
        )}

        {showDesignationModal && (
          <DesignationModal
            show={showDesignationModal}
            setShow={() => setShowDesignationModal(false)}
            designation={designation}
            onSelectDesignation={(designationId) => {
              const finalDesignationId =
                designationId === "" ? localData?.DesignationId : designationId;
              handleChangeCentre(localCentre, finalDesignationId);
            }}
          />
        )}

        {uiMode === "nextgen" && (
          <NextGenSidebar
            menuData={menuData}
            logoSrc={dynamicLogoSrc}
            onOpenProfile={() => setShowNextGenProfile(true)}
          />
        )}

        {uiMode === "nextgen" && (
          <div className="ng-mobile-chrome">
            <img
              src={dynamicLogoSrc}
              alt={localData?.CompanyCode}
              className="ng-mobile-chrome__logo"
              onError={(e) => (e.target.src = fallbackLogoSrc)}
            />
            <select
              className="form-control form-control-sm mobile-header-centre-select"
              aria-label={t("Change Centre")}
              value={String(localCentre ?? "")}
              onChange={(e) => {
                const next = e.target.value;
                if (next && String(next) !== String(localCentre ?? "")) {
                  handleChangeCentre(next, localData?.DesignationId);
                }
              }}
            >
              {centreData?.map((ele) => (
                <option key={ele.value} value={ele.value}>
                  {ele.label}
                </option>
              ))}
            </select>
            <button
              type="button"
              className="ng-mobile-chrome__profile"
              onClick={() => setShowNextGenProfile(true)}
            >
              {t("Profile")}
            </button>
          </div>
        )}

        <NextGenProfilePanel
          open={showNextGenProfile}
          onClose={() => setShowNextGenProfile(false)}
          onLogout={logOut}
          onChangeCentre={(centreId) => handleChangeCentre(centreId, localData?.DesignationId)}
          onOpenCreateTicket={() => setShowCreateTicketModal(true)}
          onOpenUpdateProfile={() =>
            setUploadImage({ data: localData?.ImageGuid, show: true })
          }
          labNoValue={labNo}
          onLabNoChange={(e) => setLabNo(e.target.value)}
          onLabNoKeyDown={(e) => handlePatientLabSearch(e, "LabNo")}
          labNoPlaceholder={
            shouldIncludeAIIMSID() ? "VisitNo/BarcodeNo/CrNo" : "VisitNo/BarcodeNo/Mobile"
          }
        />

        {/* ── Create Ticket Modal ──────────────────────────────── */}
        <AppModal
          visible={showCreateTicketModal}
          setVisible={setShowCreateTicketModal}
          Header={
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%", paddingRight: 8 }}>
              <span>{t("Create New Ticket")}</span>
              <div style={{ display: "flex", gap: 6 }}>
                {[
                  { label: t("All Tickets"), path: "/ticketing" },
                  { label: t("Dashboard"),   path: "/Dashboard" },
                ].map(({ label, path }) => (
                  <button
                    key={path}
                    type="button"
                    onClick={() => { setShowCreateTicketModal(false); navigate(path); }}
                    style={{
                      background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.35)",
                      borderRadius: 5, color: "#fff", fontSize: 11, fontWeight: 600,
                      padding: "3px 10px", cursor: "pointer", whiteSpace: "nowrap",
                    }}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          }
          modalWidth="1100px"
          footer={<></>}
        >
          <CreateTicket
            compact
            onSuccess={() => setShowCreateTicketModal(false)}
            onCancel={() => setShowCreateTicketModal(false)}
          />
        </AppModal>

      </LanguageProvider>
    </>
  );
};

export default Header;