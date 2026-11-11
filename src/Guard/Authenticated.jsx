import React, { useEffect } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { toast } from "react-toastify";
import { axiosInstance } from "../utils/axiosInstance";
import { useLocalStorage } from "../utils/hooks/useLocalStorage";
import { setWindowClass } from "../utils/helpers";
import {
  setUiMode,
  setNgColorMode,
  setNgFontFamily,
} from "../store/reducers/loadingSlice/loadingSlice";
import { NG_DEFAULT_FONT_FAMILY } from "../utils/ngFontFamilies";

import { useTranslation } from "react-i18next";
const Authenticated = ({ children }) => {
  const CompanyCode = useLocalStorage("userData", "get")?.CompanyCode;
  const Showdashboard = useLocalStorage("userData", "get")?.ShowDashboard;
  const IsStoreDashboard = useLocalStorage("userData", "get")?.IsStoreDashboard;
  const userData = useLocalStorage("userData", "get");
  // Token without userData is an incomplete first-login session.
  // Require both so the dashboard is not opened in a half-logged-in state.
  const token = userData
    ? sessionStorage.getItem("token") ||
      localStorage.getItem("token") ||
      localStorage.getItem("userData")
    : null;
  const User = sessionStorage.getItem("User") || localStorage.getItem("User");
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Missing token here means an automatic logout (expired/invalid session)
  // rather than the user clicking Logout — that path (Header.jsx) already
  // resets NextGen mode/color/font, but this <Navigate> below is the same
  // kind of client-side redirect (keeps the SPA instance alive, unlike a
  // hard reload), so without this it'd otherwise carry the previous user's
  // NextGen look right onto the login page.
  useEffect(() => {
    if (!token) {
      dispatch(setUiMode("classic"));
      dispatch(setNgColorMode("light"));
      dispatch(setNgFontFamily(NG_DEFAULT_FONT_FAMILY));
    }
  }, [token]);

  const path = window.location.pathname.toLowerCase();

  const { t } = useTranslation();

  const accessedURL = async (value) => {
    const currentPath = window.location.pathname.toLowerCase();
    if (User == "1") {
      if (currentPath !== "/patientreport") {
        useLocalStorage("theme", "set", "sky_blue_theme");
        setWindowClass(`hold-transition login-page ${"sky_blue_theme"}`);
        toast.error("Redirecting to Patient Report...");
        navigate("/patientreport");
        return;
      }
      // if (currentPath !== "/dispatchreport") {
      //   useLocalStorage("theme", "set", "sky_blue_theme");
      //   setWindowClass(`hold-transition login-page ${"sky_blue_theme"}`);
      //   toast.error("Redirecting to DispatchReport...");
      //   navigate("/DispatchReport");
      //   return;
      // }
    }
    try {
      const urlToCheck =
        value?.toLowerCase() === "/invoicesettlement"
          ? "/advancesettlement"
          : value;
      const res = await axiosInstance.post("Menu/ValidMenuPageData", {
        Url: urlToCheck,
      });
      return res.data;
    } catch (err) {
      console.log(err.response ? err.response.data : "Something Went Wrong");
      return null;
    }
  };

  const checkAccessRights = async () => {
    const accessedData = await accessedURL(window.location.pathname);
    const accessiblePaths = [
      "/dashboard",
      "/designations",
      "/pagemaster",
      "/menumaster",
      "/subpagemaster",
      "/apireportxyg",
      "/welcome",
      "/login",
      "/forgotpassword",
      "/",
      "*",
      "/welcomepage",
      "/blankpage",
      "/patientportallogin",
      "/HomeCollectionLiveTracking",
      "/reportbuilder",
      "/reportviewer",
      "/nabl-document-control",
    ];

    if (
      !accessiblePaths.includes(window.location.pathname.toLowerCase()) &&
      userData?.SuperAdmin != 1
    ) {
      const restrictedPaths = [
        "/companymasterlist",
        // "/companymaster",
        "/companypaymentdetail",
        "/companykey",
        "/onlinepaymentpage",
        "/smsdata",
        "/downtimemaster",
      ];

      console.log("company code", CompanyCode, restrictedPaths.includes(window.location.pathname.toLowerCase()), accessedData?.message === "False");


      if (
        ((CompanyCode?.toLowerCase() !== "itd" &&
          CompanyCode?.toLowerCase() !== "itduat") &&
          restrictedPaths.includes(window.location.pathname.toLowerCase())) ||
        accessedData?.message === "False"
      ) {
        toast.error(
          t(
            "You have not rights to access this page, Redirecting to Dashboard.",
          ),
        );

        const redirectPath =
          Showdashboard == 1 || IsStoreDashboard == 1 ? "/Dashboard" : "/Welcome";
        window.location.replace(redirectPath);
      }
    }
  };
  useEffect(() => {
    const handleStorageChange = (event) => {
      if (event?.key === "userData") {
        const encryptedData = event?.newValue;
        if (encryptedData) {
          const decryptedData = useLocalStorage("userData", "get")?.CompanyCode;
          if (decryptedData !== CompanyCode) {
            window.location.reload();
          }
        }
      }
    };
    window.addEventListener("storage", handleStorageChange);
    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, [CompanyCode]);

  useEffect(() => {
    if (window.location.pathname.toLowerCase() == "/dashboard") {
      return;
    }
    checkAccessRights();
  }, [window.location.pathname, Showdashboard, IsStoreDashboard]);

  // useEffect(() => {
  //   const path = window.location.pathname.toLowerCase();

  //   const mustChange = ((userData?.AllowAutoUserRateType == 1 ||
  //     userData?.SessionRateTypeID > 0) &&
  //     userData?.LoginCount == 0);

  //   if (token && mustChange && path !== "/changepassword") {
  //     navigate("/ChangePassword");
  //     return;
  //   }

  //   if (path === "/dashboard" || path === "/") {
  //     const redirectPath = Showdashboard == 1 ? "/Dashboard" : "/Welcome";
  //     navigate(redirectPath);
  //   }

  //   checkAccessRights();
  // }, [window.location.pathname, userData, token]);

  return token ? children : <Navigate to="/login" replace />;
};

export default Authenticated;
