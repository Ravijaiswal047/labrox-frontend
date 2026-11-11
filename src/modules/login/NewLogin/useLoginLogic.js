import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  signInAction,
  signInWithGoogleAction,
  signInWithOtpAction,
} from "../../../store/reducers/loginSlice/loginSlice";
import { setWindowClass } from "../../../utils/helpers";
import { useLocalStorage } from "../../../utils/hooks/useLocalStorage";
import { axiosInstance } from "../../../utils/axiosInstance";
import { toast } from "react-toastify";

export const useLoginLogic = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { i18n } = useTranslation();
  const [isRightPanelActive, setRightPanelActive] = useState(false);
  const [load, setLoad] = useState(false);
  const [ip, setIp] = useState("");
  const [isForgot, setIsForgot] = useState(false);
  const { user, loading, error, success } = useSelector(
    (state) => state.authSlice,
  );

  console.log("user", user, success);
  const [isPopupOpen, setIsPopupOpen] = useState({ Id: "", isOpen: false });
  const [isOtpRequired, setIsOtpRequired] = useState(false);
  const [loginStep, setLoginStep] = useState(1);
  const [showForceChangePassword, setShowForceChangePassword] = useState(false);

  const [credentials, setCredentials] = useState({
    UserName: "",
    username: "",
    Mobile: "",
    OTP: "",
    Password: "",
    ConfirmPassword: "",
    password: "",
    RememberMe: false,
  });

  const fetchIpAddress = async () => {
    try {
      const response = await fetch("https://api.ipify.org?format=json");
      if (!response.ok) return "";

      const data = await response.json();
      return data?.ip || "";
    } catch (error) {
      console.error("Error fetching IP:", error);
      return "";
    }
  };

  const getCurrentIpAddress = async () => {
    if (ip) return ip;

    const resolvedIp = await fetchIpAddress();
    setIp(resolvedIp);
    return resolvedIp;
  };

  useEffect(() => {
    let isMounted = true;

    const initializeIp = async () => {
      setLoad(true);
      const resolvedIp = await fetchIpAddress();

      if (isMounted) {
        setIp(resolvedIp);
        setLoad(false);
      }
    };

    initializeIp();

    return () => {
      isMounted = false;
    };
  }, []);

  // `success` is a plain boolean that gets set to true on every successful
  // login - if it's already true (e.g. this session already had one login
  // and never cleanly hit reset() before the next one), a second, different
  // user's login also sets it to true, which React sees as "no change" on
  // a [success]-only dependency array, so this effect silently never re-runs
  // and the new user's data never gets written. `user` is a fresh object
  // reference on every signInAction.fulfilled dispatch regardless, so
  // depend on that too to guarantee this fires for every login attempt.
  useEffect(() => {
    if (!success) return;

    const loginUser = user?.user || user?.message?.user;
    console.log("LOGIN SUCCESS - loginUser:", loginUser, "LoginCount:", loginUser?.LoginCount);

    if (Number(loginUser?.LoginCount) === 0) {
      setShowForceChangePassword(true);
      try { useLocalStorage("token", "set", user.token); } catch (e) { console.error(e); }
      return;
    }

    if (
      loginUser?.SuperAdmin == 1 &&
      loginUser?.isAuthroizedApproval == 0
    ) {
      openAgreeDialog(user);
    } else {
      AgreeButtonCheck(user, success);
    }
  }, [success, user]);

  // iOS WebKit (Safari and Chrome-on-iOS, which is WebKit-based too) persists
  // localStorage writes to disk asynchronously via IPC. A hard `window.location`
  // navigation tears the page down and reloads from scratch, so the next
  // page's auth guard has to re-read localStorage from disk - if that async
  // flush hasn't landed yet (most likely on a "cold" first write), the guard
  // sees an empty token and bounces back to /login. Navigating client-side
  // instead (no reload) sidesteps this entirely: the guard reads the same
  // in-memory localStorage we just wrote to in this same document, so there's
  // no disk-persistence timing involved at all.
  const redirectAfterStorageFlush = (path) => {
    navigate(path, { replace: true });
  };

  const openAgreeDialog = (user) => {
    setIsPopupOpen({ Id: user, isOpen: true });
  };
  const closeAgreeDialog = () => {
    setIsPopupOpen({ Id: "", isOpen: false });
  };

  const AgreeButtonCheck = async (user, success) => {
    if (success) {
      setIsPopupOpen({ Id: "", isOpen: false });
      const rawUser = user?.user || user?.message?.user || user || {};
      const token = user?.token || user?.data?.token || user?.message?.token || rawUser?.token || localStorage.getItem("token") || "";
      const lastSavedFont = localStorage.getItem("lastFontSize") || "13";
      const fontFromServer = rawUser?.FontSize ? String(rawUser.FontSize) : lastSavedFont;
      let dashboardSource = rawUser || {};
      try {
        if (rawUser?.EmployeeID) {
          const dashboardRes = await axiosInstance.post("Employee/getEmployeeDetailsByID", {
            EmployeeID: rawUser?.EmployeeID,
          });
          dashboardSource = dashboardRes?.data?.message?.[0] || dashboardSource;
        }
      } catch (error) {
        console.log("Error fetching dashboard rights", error);
      }
      const showDashboard = dashboardSource?.ShowDashboard ?? rawUser?.ShowDashboard ?? 1;
      const isStoreDashboard = dashboardSource?.IsStoreDashboard ?? rawUser?.IsStoreDashboard ?? 0;

      const userData = {
        SkipTestCentreResultEntry: rawUser?.SkipTestCentreResultEntry,
        IsRazorPayGateway: rawUser?.IsRazorPayGateway,
        IsHdfcPayGateway: rawUser?.IsHdfcPayGateway,
        IsIciciPayGateway: rawUser?.IsIciciPayGateway,
        AddBlankRateTypeWorkOrder: rawUser?.AddBlankRateTypeWorkOrder,
        MainCentreID: rawUser?.MainCentreID,
        CentreVsRateTypeatWorkOrder: rawUser?.CentreVsRateTypeatWorkOrder,
        SessionShowOnlineRemark: rawUser?.ShowOnlineRemark,
        SessionDoctorId: rawUser?.DoctorId,
        SessionInvoiceTo: rawUser?.InvoiceTo,
        SessionRateTypeID: rawUser?.RateTypeID,
        DefaultCurrencyName: rawUser?.DefaultCurrencyName,
        HideInvoiceBillingCycle: rawUser?.HideInvoiceBillingCycle,
        HideRePrintColorCode: rawUser?.HideRePrintColorCode,
        ShowAllCheckBarcodeOption: rawUser?.ShowAllCheckBarcodeOption,
        ShowRePrintTotal: rawUser?.ShowRePrintTotal,
        ShowPaymentGatewayLinkinTop: rawUser?.ShowPaymentGatewayLinkinTop,
        DefaultDateTypeResultEntry: rawUser?.DefaultDateTypeResultEntry,
        HidePRDM: rawUser?.HidePRDM,
        AllowTestAddWithOutAge: rawUser?.AllowTestAddWithOutAge,
        AllowRateTypeRefereshWorkOrder: rawUser?.AllowRateTypeRefereshWorkOrder,
        AllowLabReport_Manual_W: rawUser?.AllowLabReport_Manual_W,
        AllowReceipt_Manual_W: rawUser?.AllowReceipt_Manual_W,
        AllowLabReport_Manual_SMS: rawUser?.AllowLabReport_Manual_SMS,
        AllowReceipt_Manual_SMS: rawUser?.AllowReceipt_Manual_SMS,
        AllowLabReport_Manual_E: rawUser?.AllowLabReport_Manual_E,
        AllowReceipt_Manual_E: rawUser?.AllowReceipt_Manual_E,
        MenuDirection: rawUser?.MenuDirection,
        AllowEditRanges: rawUser?.AllowEditRanges,
        HideBirthday: rawUser?.HideBirthday,
        HideOutSourceColor: rawUser?.HideOutSourceColor ? rawUser?.HideOutSourceColor : 0,
        ReferedByDoctorDesignationID: rawUser?.ReferedByDoctorDesignationID,
        DesignationId: rawUser?.DesignationId ? rawUser?.DesignationId : 0,
        RemoveTestStatusLogic: rawUser?.RemoveTestStatusLogic,
        DefaultSearchTypeValue: rawUser?.DefaultSearchTypeValue,
        IsWebsiteLogin: rawUser?.IsWebsiteLogin,
        Website: rawUser?.Website,
        ShowBalanceAmount: rawUser?.ShowBalanceAmount,
        ImageGuid: rawUser?.ImageGuid,
        ModifyRegDate: rawUser?.ModifiedRegDate,
        Username: rawUser?.Username || rawUser?.username,
        FirstName: rawUser?.FirstName ? rawUser?.FirstName : "",
        DefaultCentre: rawUser?.DefaultCentreID || rawUser?.DefaultCentre || 1,
        SessionCentreID: rawUser?.SessionCentreID || rawUser?.DefaultCentreID || 1,
        CenterName: rawUser?.CenterName || "Main Reference Lab",
        ShowDashboard: showDashboard,
        IsStoreDashboard: isStoreDashboard,
        CompanyCode: rawUser?.CompanyCode || "LABROX",
        SkipMicLabEntry: rawUser?.SkipMicLabEntry,
        CompanyLogo: rawUser?.CompanyLogo,
        EmployeeID: rawUser?.EmployeeID || 1,
        ImageLogo: rawUser?.LogoCompany,
        EmployeeImage: rawUser?.EmployeeImage ? rawUser?.EmployeeImage : "",
        CompanyName: rawUser?.CompanyName ? rawUser?.CompanyName : "LabRox Healthcare and Diagnostics",
        CompanyID: rawUser?.CompanyID ? rawUser?.CompanyID : 1,
        Theme: rawUser?.Theme == "Default" || !rawUser?.Theme ? "sky_blue_theme" : rawUser?.Theme,
        IsPoct: rawUser?.IsPoct ? rawUser?.IsPoct : 0,
        DesignationName: rawUser?.DesignationName ? rawUser?.DesignationName : "Super Administrator",
        SuperAdmin: rawUser?.SuperAdmin ? rawUser?.SuperAdmin : 1,
        OnAppGoToMainList: rawUser?.OnAppGoToMainList ? rawUser?.OnAppGoToMainList : 0,
        DefaultRole: rawUser?.DefaultRole ? rawUser?.DefaultRole : 0,
        IsRoleWise: rawUser?.IsRoleWise ? rawUser?.IsRoleWise : 0,
        IsCDAC: rawUser?.CDAC ? rawUser?.CDAC : 0,
        IsPatientWiseReporting: rawUser?.IsPatientWiseReporting ? rawUser?.IsPatientWiseReporting : 0,
        HideRate: rawUser?.HideRate ? rawUser?.HideRate : 0,
        AutoFillPaidAmount: rawUser?.AutoFillPaidAmount,
        TGLabobservationID: rawUser?.TGLabobservationID ? rawUser?.TGLabobservationID : "",
        LDLLabobservationID: rawUser?.LDLLabobservationID ? rawUser?.LDLLabobservationID : "",
        VLDLLabobservationID: rawUser?.VLDLLabobservationID ? rawUser?.VLDLLabobservationID : "",
        DefaultDocotorOnWorkorder: rawUser?.DefaultDocotorOnWorkorder ? rawUser?.DefaultDocotorOnWorkorder : "",
        AddBlankRateTypeWorkOrder: rawUser?.AddBlankRateTypeWorkOrder ? rawUser?.AddBlankRateTypeWorkOrder : "",
        AccessDashboardId: rawUser?.AccessDashboardId ? rawUser?.AccessDashboardId : "",
        AllowSRAModule: rawUser?.AllowSRAModule ? rawUser?.AllowSRAModule : 0,
        IsHistoCascadeNumber: rawUser?.IsHistoCascadeNumber ? rawUser?.IsHistoCascadeNumber : 0,
        ShowDefaultLoginCentre: rawUser?.ShowDefaultLoginCentre ? rawUser?.ShowDefaultLoginCentre : "",
        ShowITDOSEFlashLogo: rawUser?.ShowITDOSEFlashLogo ? rawUser?.ShowITDOSEFlashLogo : "",
        HideMacStatusFromDispatch: rawUser?.HideMacStatusFromDispatch ? rawUser?.HideMacStatusFromDispatch : "",
        HideResultDoneStatusFromDispatch: rawUser?.HideResultDoneStatusFromDispatch ? rawUser?.HideResultDoneStatusFromDispatch : "",
        HideInTransitIconatDispatch: rawUser?.HideInTransitIconatDispatch ? rawUser?.HideInTransitIconatDispatch : "",
        IsPatientNameAutoCaps_WorkOrder: rawUser?.IsPatientNameAutoCaps_WorkOrder ? rawUser?.IsPatientNameAutoCaps_WorkOrder : "",
        ShowUserFilterAtReprint: rawUser?.ShowUserFilterAtReprint ? rawUser?.ShowUserFilterAtReprint : "",
        AllowAdvanceOldPatientSearchAtWorkOrder: rawUser?.AllowAdvanceOldPatientSearchAtWorkOrder ? rawUser?.AllowAdvanceOldPatientSearchAtWorkOrder : "",
        AllowAutoUserRateType: rawUser?.AllowAutoUserRateType ? rawUser?.AllowAutoUserRateType : "",
        LoginCount: rawUser?.LoginCount ? rawUser?.LoginCount : 1,
        HideOmitOptionatResultEntry: rawUser?.HideOmitOptionatResultEntry ? rawUser?.HideOmitOptionatResultEntry : "",
        AtleastOneBarcodeMandatoryAtWorkOrder: rawUser?.AtleastOneBarcodeMandatoryAtWorkOrder ? rawUser?.AtleastOneBarcodeMandatoryAtWorkOrder : "",
        IsBlankDefaultTitleatWorkOrder: rawUser?.IsBlankDefaultTitleatWorkOrder ? rawUser?.IsBlankDefaultTitleatWorkOrder : 0,
        ValidateMRPValidationAtWorkOrder: rawUser?.ValidateMRPValidationAtWorkOrder ? rawUser?.ValidateMRPValidationAtWorkOrder : 0,
        DefaultDateTypeDispatchLabReport: rawUser?.DefaultDateTypeDispatchLabReport ? rawUser?.DefaultDateTypeDispatchLabReport : "",
        SkipRemarksOnReceiptPrint: rawUser?.SkipRemarksOnReceiptPrint ? rawUser?.SkipRemarksOnReceiptPrint : 1,
        AllowTestDeleteInsteadOfRefund: rawUser?.AllowTestDeleteInsteadOfRefund ? rawUser?.AllowTestDeleteInsteadOfRefund : 0,
        MaxDateRangeatResultEntry: rawUser?.MaxDateRangeatResultEntry ? rawUser?.MaxDateRangeatResultEntry : "15",
        HideNonDeposit: rawUser?.HideNonDeposit ? rawUser?.HideNonDeposit : 0,
        HideNonCash: rawUser?.HideNonCash ? rawUser?.HideNonCash : 0,
        AccessRight: rawUser?.AccessRight || "",
        applicationFont: fontFromServer,
        AllowZoneDiameterMicroResutlEntry: rawUser?.AllowZoneDiameterMicroResutlEntry ? rawUser?.AllowZoneDiameterMicroResutlEntry : "",
        AllowBreakPointMicroResutlEntry: rawUser?.AllowBreakPointMicroResutlEntry ? rawUser?.AllowBreakPointMicroResutlEntry : "",
        DefaultAllStatusResultEntry: rawUser?.DefaultAllStatusResultEntry ? rawUser?.DefaultAllStatusResultEntry : "",
        DefaultVisitTypeatWorkOrder: rawUser?.DefaultVisitTypeatWorkOrder ? rawUser?.DefaultVisitTypeatWorkOrder : "",
        AllowCofirmationMessageatWorkOrder: rawUser?.AllowCofirmationMessageatWorkOrder ? rawUser?.AllowCofirmationMessageatWorkOrder : 0,
        HideInvoiceReprintExcel: rawUser?.HideInvoiceReprintExcel ? rawUser?.HideInvoiceReprintExcel : 0,
        AllowEditInfo: rawUser?.AllowEditInfo ? rawUser?.AllowEditInfo : 0,
        AllowReceiptEdit: rawUser?.AllowReceiptEdit ? rawUser?.AllowReceiptEdit : 0,
        AllowAutoNextSaveResultEntry: rawUser?.AllowAutoNextSaveResultEntry ? rawUser?.AllowAutoNextSaveResultEntry : 0,
        AllowAutoNextApproveResultEntry: rawUser?.AllowAutoNextApproveResultEntry ? rawUser?.AllowAutoNextApproveResultEntry : 0,
        IsDefaultReferalDoctorSelf: rawUser?.IsDefaultReferalDoctorSelf ? rawUser?.IsDefaultReferalDoctorSelf : 0,
        IsDefaultAscOrderatResultEntry: rawUser?.IsDefaultAscOrderatResultEntry ? rawUser?.IsDefaultAscOrderatResultEntry : "0",
        DispatchScreenTableUI: rawUser?.DispatchScreenTableUI ? rawUser?.DispatchScreenTableUI : 0,
        AllowAttachmentAfterApproval: rawUser?.AllowAttachmentAfterApproval ? rawUser?.AllowAttachmentAfterApproval : 0,
        IsDiscountApprovedByOther: rawUser?.IsDiscountApprovedByOther ? rawUser?.IsDiscountApprovedByOther : 0,
        AllowTestTickInResultEntry: rawUser?.AllowTestTickInResultEntry ? rawUser?.AllowTestTickInResultEntry : 0,
        HideAuditTrailDispatch: rawUser?.HideAuditTrailDispatch ? rawUser?.HideAuditTrailDispatch : 0,
        ST_AutoGenerateSubcategoryCode: rawUser?.ST_AutoGenerateSubcategoryCode ? rawUser?.ST_AutoGenerateSubcategoryCode : 0,
        ST_AutoGenerateVendorCode: rawUser?.ST_AutoGenerateVendorCode ? rawUser?.ST_AutoGenerateVendorCode : 0,
        AllowChangeBarcode: rawUser?.AllowChangeBarcode ? rawUser?.AllowChangeBarcode : 0,
        AllowB2BDiscount: rawUser?.AllowB2BDiscount ? rawUser?.AllowB2BDiscount : 0,
        AllowTRFUploadAndScan: rawUser?.AllowTRFUploadAndScan ? rawUser?.AllowTRFUploadAndScan : 0,
        RateTypeLogo: rawUser?.RateTypeLogo ? rawUser?.RateTypeLogo : "",
        RateCentreType: rawUser?.RateCentreType ? rawUser?.RateCentreType : "",
        HideResultEntryPreview: rawUser?.HideResultEntryPreview ? rawUser?.HideResultEntryPreview : 0,
        AllowOrganismNameEditableAtResultEntry: rawUser?.AllowOrganismNameEditableAtResultEntry ? rawUser?.AllowOrganismNameEditableAtResultEntry : 0,
        AllowSpecialCharacterInNumericValue: rawUser?.AllowSpecialCharacterInNumericValue ? rawUser?.AllowSpecialCharacterInNumericValue : 0,
        ShowClientNearToExpiry: rawUser?.ShowClientNearToExpiry ? rawUser?.ShowClientNearToExpiry : 0,
        BlockExcelPrintout: rawUser?.BlockExcelPrintout ? rawUser?.BlockExcelPrintout : 0,
        SkipCriticalCheck: rawUser?.SkipCriticalCheck ? rawUser?.SkipCriticalCheck : 0,
        AllowDesktopView: rawUser?.AllowDesktopView ? rawUser?.AllowDesktopView : 0,
        LabTATStartFrom: rawUser?.LabTATStartFrom ? rawUser?.LabTATStartFrom : "Booking",
        IsPaginationOnTop: rawUser?.IsPaginationOnTop ? rawUser?.IsPaginationOnTop : 0,
        AllowExcelonRePrint: rawUser?.AllowExcelonRePrint ? rawUser?.AllowExcelonRePrint : 0,
        AllowPDFonReprint: rawUser?.AllowPDFonReprint ? rawUser?.AllowPDFonReprint : 0,
        Font_family: rawUser?.Font_family ? rawUser?.Font_family : "System Default",
        NextGenTheme: rawUser?.NextGenTheme ? rawUser?.NextGenTheme : "classic",
        AllowOutsourceLabAtRegistration: rawUser?.AllowOutsourceLabAtRegistration ? rawUser?.AllowOutsourceLabAtRegistration : 0,
      };

      useLocalStorage("submenu", "set", rawUser?.MenuDirection || "LTR");
      useLocalStorage("theme", "set", userData?.Theme);
      useLocalStorage("userData", "set", userData);
      useLocalStorage("accessRight", "set", rawUser?.AccessRight || "");
      useLocalStorage("BarocdeNoMaxLength", "set", rawUser?.BarocdeNoMaxLength || "15");
      useLocalStorage("DefaultCentre", "set", rawUser?.DefaultCentreID || rawUser?.DefaultCentre || 1);
      useLocalStorage("language", "set", rawUser?.EmpLanguageCode ? rawUser.EmpLanguageCode : "en");
      i18n.changeLanguage(rawUser?.EmpLanguageCode ? rawUser.EmpLanguageCode : "en");
      useLocalStorage("token", "set", token);
      setWindowClass("hold-transition login-page " + (userData?.Theme || ""));

      const savedFont = Number(fontFromServer || 13);
      document.documentElement.style.setProperty("--app-font-size", savedFont + "px");
      document.documentElement.style.setProperty("--control-height", Math.max(28, savedFont * 2) + "px");

      const isChangePasswordModalRequired =
        Number(rawUser?.LoginCount) === 0 &&
        Number(rawUser?.AllowAutoUserRateType) === 1 &&
        Number(rawUser?.RateTypeID) > 0;

      if (isChangePasswordModalRequired) {
        const redirectPath =
          showDashboard == 1 || isStoreDashboard == 1
            ? "/dashboard?forceChangePassword=true"
            : "/Welcome?forceChangePassword=true";
        redirectAfterStorageFlush(redirectPath);
      } else if (Number(rawUser?.LoginCount) === 0) {
        redirectAfterStorageFlush("/ChangePassword?firstLogin=true");
      } else {
        const redirectPath =
          showDashboard == 1 || isStoreDashboard == 1 ? "/dashboard" : "/Welcome";
        redirectAfterStorageFlush(redirectPath);
      }
    }
  };

  const validate = (overrides = {}) => {
    // `overrides` carries values read straight from the DOM inputs. Safari's
    // native autofill/QuickType bar can set an input's value without firing
    // the input/change event React listens to, so `credentials` state can
    // still be empty at submit time even though the field looks filled -
    // overrides let the caller supply the true current value as a fallback.
    const effective = { ...credentials, ...overrides };
    let errorMessage = "";
    if (loginStep === 1 && !isRightPanelActive) {
      if (!effective?.username?.trim()) errorMessage = "Username is required";
    } else if (loginStep === 2 && !isRightPanelActive) {
      if (isOtpRequired) {
        if (!effective?.OTP?.trim()) errorMessage = "OTP is required";
      } else {
        if (!effective?.password?.trim())
          errorMessage = "Password is required";
      }
    }
    if (isRightPanelActive && !isForgot) {
      if (!effective?.UserName?.trim() && !effective?.Mobile?.trim()) {
        errorMessage = "Username and Registered Mobile Number are required";
      } else {
        if (!effective?.UserName?.trim())
          errorMessage = "Username is required";
        if (!effective?.Mobile?.trim())
          errorMessage += errorMessage
            ? " and Registered Mobile Number are required"
            : "Registered Mobile Number is required";
      }
    }
    if (isRightPanelActive && isForgot) {
      if (!String(effective?.OTP)?.trim()) errorMessage = "OTP is required";
      if (!String(effective?.Password)?.trim())
        errorMessage += errorMessage
          ? " and Password is required"
          : "Password is required";
      if (!String(effective?.ConfirmPassword)?.trim())
        errorMessage += errorMessage
          ? " and Confirm Password is required"
          : "Confirm Password is required";
      if (
        effective?.Password?.trim() &&
        effective.Password !== effective.ConfirmPassword
      )
        errorMessage += errorMessage
          ? " and Confirm Password does not match Password"
          : "Confirm Password does not match Password";
    }
    if (errorMessage) {
      toast.error(errorMessage);
      return false;
    }
    return true;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "UserName" || name === "username") {
      setCredentials({ ...credentials, UserName: value, username: value });
    } else if (name === "RememberMe") {
      setCredentials({
        ...credentials,
        RememberMe: credentials.RememberMe ? false : true,
      });
    } else {
      setCredentials({ ...credentials, [name]: value });
    }
  };

  const handleCheckUser = async (e, overrides = {}) => {
    e.preventDefault();
    const username = overrides.username ?? credentials?.username;
    if (!username?.trim())
      return toast.error("Please enter a username");
    setLoad(true);
    try {
      const res = await axiosInstance.post("login/LoginWithOTP", {
        username,
      });
      if (res.data?.success) {
        setIsOtpRequired(res.data.isOTPLogin);
        setLoginStep(2);
      } else {
        toast.error(res.data?.message || "User not found");
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || error?.message || "User verification failed");
    } finally {
      setLoad(false);
    }
  };

  const handleSubmit = async (e, overrides = {}) => {
    e.preventDefault();
    if (!validate(overrides)) return;

    const effective = { ...credentials, ...overrides };
    const currentIp = await getCurrentIpAddress();

    dispatch(
      signInAction({
        username: effective.username,
        password: effective.password,
        RememberMe: effective.RememberMe,
        ipaddress: currentIp || "",
      }),
    );
  };

  const handleOtpSubmit = async (e, overrides = {}) => {
    e.preventDefault();
    if (!validate(overrides)) return;

    const effective = { ...credentials, ...overrides };
    const currentIp = await getCurrentIpAddress();

    dispatch(
      signInWithOtpAction({
        username: effective.username,
        OTP: effective.OTP,
        RememberMe: effective.RememberMe,
        ipaddress: currentIp || "",
      }),
    );
  };

  const handleForget = (e) => {
    e.preventDefault();
    setLoad(true);
    axiosInstance
      .post("ForgetPasswordController/ForgetPassword", {
        UserName: credentials?.UserName,
        Mobile: credentials?.Mobile,
      })
      .then((res) => {
        if (res.data?.success) {
          toast.success(res.data?.message);
          setIsForgot(true);
        } else {
          toast.error(res.data?.message);
        }
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

  const handleReset = (e) => {
    e.preventDefault();
    if (validate()) {
      axiosInstance
        .post("ForgetPasswordController/ResetPassword", {
          UserName: credentials?.UserName,
          Mobile: credentials?.Mobile,
          OTP: credentials?.OTP,
          Password: credentials?.Password,
          ConfirmPassword: credentials?.ConfirmPassword,
        })
        .then((res) => {
          if (res.data?.success) {
            setRightPanelActive(false);
            toast.success(res.data?.message);
          } else {
            toast.error(res.data?.message);
          }
        })
        .catch((error) => {
          toast.error(error.message || "An error occurred.");
        });
    }
  };

  // On a first-time login (LoginCount === 0) the earlier effect only saves
  // the token and shows the force-change-password modal - it deliberately
  // skips AgreeButtonCheck (which is what actually builds and saves
  // userData to localStorage and navigates into the app). Once the user
  // successfully sets their new password, finish that same login here using
  // the still-live user/success from Redux, instead of just closing the
  // modal and leaving the session without userData.
  const completeLoginAfterForcedPasswordChange = () => {
    setShowForceChangePassword(false);
    if (!success || !user) return;
    const loginUser = user?.user || user?.message?.user;
    if (loginUser?.SuperAdmin == 1 && loginUser?.isAuthroizedApproval == 0) {
      openAgreeDialog(user);
    } else {
      AgreeButtonCheck(user, success);
    }
  };

  // Cancelling the forced password change should still let the user into
  // the app with their existing session (just without having changed their
  // password) rather than leave them stuck with a saved token but no
  // userData (Authenticated.jsx's guard only checks for the token, so that
  // half-logged-in state was reachable before). Complete the same login
  // AgreeButtonCheck would have done.
  const cancelForcedPasswordChange = () => {
    completeLoginAfterForcedPasswordChange();
  };

  return {
    credentials,
    isOtpRequired,
    loginStep,
    setLoginStep,
    handleChange,
    handleCheckUser,
    handleSubmit,
    handleOtpSubmit,
    handleForget,
    handleReset,
    isRightPanelActive,
    setRightPanelActive,
    isForgot,
    setIsForgot,
    isPopupOpen,
    closeAgreeDialog,
    AgreeButtonCheck,
    loading: load,
    validate,
    showForceChangePassword,
    setShowForceChangePassword,
    completeLoginAfterForcedPasswordChange,
    cancelForcedPasswordChange,
  };
};
