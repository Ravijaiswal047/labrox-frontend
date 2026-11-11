import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { setWindowClass } from "@app/utils/helpers";
import { signInAction } from "../../store/reducers/loginSlice/loginSlice";

import { InputText } from "primereact/inputtext";
import { FaUser, FaEye, FaMobileAlt, FaEyeSlash } from "react-icons/fa";

import logo from "@app/assets/image/logo.png";

import { useLocalStorage } from "@app/utils/hooks/useLocalStorage";
import { useEffect, useRef, useState } from "react";
import OtpInput from "./OtpInput";
import { toast } from "react-toastify";
import { axiosInstance } from "../../utils/axiosInstance";
import AgreementPopup from "./AgreementPopup";
import Loading from "../../components/loader/Loading";

const LoginComponent = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const [isRightPanelActive, setRightPanelActive] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [cShowPass, setCShowPass] = useState(false);
  const [ip, setIp] = useState("");
  const [load, setLoad] = useState(false);
  const [isForgot, setIsForgot] = useState(false);

  const handleSignUpClick = () => {
    setRightPanelActive(true);
    setIsForgot(false);
  };
  const handleSignInClick = () => {
    setRightPanelActive(false);
    setIsForgot(false);
  };

  const { user, loading, error, success, token } = useSelector(
    (state) => state.authSlice,
  );



  useEffect(() => {
    if (
      success &&
      user?.user?.SuperAdmin == 1 &&
      user?.user?.isAuthroizedApproval == 0
    ) {
      openAgreeDialog(user);
    } else {
      AgreeButtonCheck(user, success);
    }
  }, [success]);

  const [credentials, setCredentials] = useState({
    UserName: "",
    username: "",
    Mobile: "",
    OTP: "",
    Password: "",
    ConfirmPassword: "",
    password: "",
  });

  const [isPopupOpen, setIsPopupOpen] = useState({ Id: "", isOpen: false });
  const openAgreeDialog = (user) => {
    setIsPopupOpen({ Id: user, isOpen: true });
  };
  const closeAgreeDialog = () => {
    setIsPopupOpen({ Id: "", isOpen: false });
  };

  const AgreeButtonCheck = (user, success) => {
    console.log("user", user);
    if (success) {
      setIsPopupOpen({ Id: "", isOpen: false });
      const lastSavedFont = localStorage.getItem("lastFontSize") || "13";
      const fontFromServer = user?.user?.FontSize
        ? String(user.user.FontSize)
        : lastSavedFont;

      const userData = {
        IsRazorPayGateway: user?.user?.IsRazorPayGateway,
        IsHdfcPayGateway: user?.user?.IsHdfcPayGateway,
        IsIciciPayGateway: user?.user?.IsIciciPayGateway,
        DefaultDocotorOnWorkorder: user?.user?.DefaultDocotorOnWorkorder,
        AddBlankRateTypeWorkOrder: user?.user?.AddBlankRateTypeWorkOrder,
        MainCentreID: user?.user?.MainCentreID,
        CentreVsRateTypeatWorkOrder: user?.user?.CentreVsRateTypeatWorkOrder,
        SessionShowOnlineRemark: user?.user?.ShowOnlineRemark,
        SessionDoctorId: user?.user?.DoctorId,
        SessionInvoiceTo: user?.user?.InvoiceTo,
        SessionRateTypeID: user?.user?.RateTypeID,
        HideInvoiceBillingCycle: user?.user?.HideInvoiceBillingCycle,
        HideRePrintColorCode: user?.user?.HideRePrintColorCode,
        ShowAllCheckBarcodeOption: user?.user?.ShowAllCheckBarcodeOption,
        ShowRePrintTotal: user?.user?.ShowRePrintTotal,
        ShowPaymentGatewayLinkinTop: user?.user?.ShowPaymentGatewayLinkinTop,
        DefaultDateTypeResultEntry: user?.user?.DefaultDateTypeResultEntry,
        HidePRDM: user?.user?.HidePRDM,
        AllowRateTypeRefereshWorkOrder:
          user?.user?.AllowRateTypeRefereshWorkOrder,
        AllowLabReport_Manual_W: user?.user?.AllowLabReport_Manual_W,
        AllowReceipt_Manual_W: user?.user?.AllowReceipt_Manual_W,
        AllowLabReport_Manual_SMS: user?.user?.AllowLabReport_Manual_SMS,
        AllowReceipt_Manual_SMS: user?.user?.AllowReceipt_Manual_SMS,
        AllowLabReport_Manual_E: user?.user?.AllowLabReport_Manual_E,
        AllowReceipt_Manual_E: user?.user?.AllowReceipt_Manual_E,
        MenuDirection: user?.user?.MenuDirection,
        AllowEditRanges: user?.user?.AllowEditRanges,
        HideBirthday: user?.user?.HideBirthday,
        HideOutSourceColor: user?.user?.HideOutSourceColor,
        ReferedByDoctorDesignationID: user?.user?.ReferedByDoctorDesignationID,
        DesignationId: user.user.DesignationId ? user.user.DesignationId : 0,
        RemoveTestStatusLogic: user?.user?.RemoveTestStatusLogic,
        DefaultSearchTypeValue: user?.user?.DefaultSearchTypeValue,
        IsWebsiteLogin: user?.user?.IsWebsiteLogin,
        Website: user?.user?.Website,
        ShowBalanceAmount: user.user.ShowBalanceAmount,
        ImageGuid: user.user.ImageGuid,
        ModifyRegDate: user.user.ModifiedRegDate,
        Username: user.user.Username,
        FirstName: user?.user?.FirstName ? user?.user?.FirstName : "",
        DefaultCentre: user.user.DefaultCentreID,
        SessionCentreID: user.user.SessionCentreID,
        CenterName: user.user.CenterName,
        ShowDashboard: user.user.ShowDashboard,
        IsStoreDashboard: user.user.IsStoreDashboard,
        CompanyCode: user.user.CompanyCode,
        SkipMicLabEntry: user.user.SkipMicLabEntry,
        CompanyLogo: user.user.CompanyLogo,
        EmployeeID: user.user.EmployeeID,
        ImageLogo: user.user.LogoCompany,
        EmployeeImage: user.user.EmployeeImage ? user.user.EmployeeImage : "",
        CompanyName: user.user.CompanyName ? user.user.CompanyName : "",
        CompanyID: user.user.CompanyID ? user.user.CompanyID : "",
        Theme:
          user.user.Theme == "Default" ? "sky_blue_theme" : user.user.Theme,
        IsPoct: user.user.IsPoct ? user.user.IsPoct : 0,
        DesignationName: user.user.DesignationName
          ? user.user.DesignationName
          : "",
        SuperAdmin: user.user.SuperAdmin ? user.user.SuperAdmin : 0,
        OnAppGoToMainList: user.user.OnAppGoToMainList
          ? user.user.OnAppGoToMainList
          : 0,
        DefaultRole: user.user.DefaultRole ? user.user.DefaultRole : 0,
        IsRoleWise: user.user.IsRoleWise ? user.user.IsRoleWise : 0,
        IsCDAC: user.user.CDAC ? user.user.CDAC : 0,
        IsPatientWiseReporting: user.user.IsPatientWiseReporting
          ? user.user.IsPatientWiseReporting
          : 0,
        HideRate: user.user.HideRate ? user.user.HideRate : 0,
        AccessDashboardId: user.user.AccessDashboardId
          ? user.user.AccessDashboardId
          : "",
        AllowSRAModule: user.user.AllowSRAModule ? user.user.AllowSRAModule : 0,
        IsHistoCascadeNumber: user.user.IsHistoCascadeNumber ? user.user.IsHistoCascadeNumber : 0,
        AllowAutoUserRateType: user.user.AllowAutoUserRateType
          ? user.user.AllowAutoUserRateType
          : "",
        LoginCount: user.user.LoginCount ? user.user.LoginCount : 0,
        AtleastOneBarcodeMandatoryAtWorkOrder: user.user
          .AtleastOneBarcodeMandatoryAtWorkOrder
          ? user.user.AtleastOneBarcodeMandatoryAtWorkOrder
          : 0,
        ValidateMRPValidationAtWorkOrder: user.user
          .ValidateMRPValidationAtWorkOrder
          ? user.user.ValidateMRPValidationAtWorkOrder
          : 0,
        DefaultDateTypeDispatchLabReport: user.user
          .DefaultDateTypeDispatchLabReport
          ? user.user.DefaultDateTypeDispatchLabReport
          : "",
        SkipRemarksOnReceiptPrint: user.user.SkipRemarksOnReceiptPrint
          ? user.user.SkipRemarksOnReceiptPrint
          : 1,
        AllowTestDeleteInsteadOfRefund: user.user.AllowTestDeleteInsteadOfRefund
          ? user.user.AllowTestDeleteInsteadOfRefund
          : 0,
        HideNonDeposit: user.user.HideNonDeposit
          ? user.user.HideNonDeposit
          : 0,
        HideNonCash: user.user.HideNonCash ? user.user.HideNonCash : 0,
        AccessRight: user.user?.AccessRight || "",
        DefaultVisitTypeatWorkOrder: user.user.DefaultVisitTypeatWorkOrder ? user.user.DefaultVisitTypeatWorkOrder : "",
        applicationFont: fontFromServer,
        IsBlankDefaultTitleatWorkOrder: user.user.IsBlankDefaultTitleatWorkOrder ? user.user.IsBlankDefaultTitleatWorkOrder : 0,
        DispatchScreenTableUI: user.user.DispatchScreenTableUI ? user.user.DispatchScreenTableUI : 0,
        AllowAttachmentAfterApproval: user.user.AllowAttachmentAfterApproval ? user.user.AllowAttachmentAfterApproval : 0,
        AllowAutoNextSaveResultEntry: user.user.AllowAutoNextSaveResultEntry ? user.user.AllowAutoNextSaveResultEntry : 0,
        AllowAutoNextApproveResultEntry: user.user.AllowAutoNextApproveResultEntry ? user.user.AllowAutoNextApproveResultEntry : 0,
        IsDiscountApprovedByOther: user.user.IsDiscountApprovedByOther ? user.user.IsDiscountApprovedByOther : 0,
        AllowTestTickInResultEntry: user.user.AllowTestTickInResultEntry ? user.user.AllowTestTickInResultEntry : 0,
        HideAuditTrailDispatch: user.user.HideAuditTrailDispatch ? user.user.HideAuditTrailDispatch : 0,
        ST_AutoGenerateSubcategoryCode: user.user.ST_AutoGenerateSubcategoryCode ? user.user.ST_AutoGenerateSubcategoryCode : 0,
        ST_AutoGenerateVendorCode: user.user.ST_AutoGenerateVendorCode ? user.user.ST_AutoGenerateVendorCode : 0,
        AllowTRFUploadAndScan: user.user.AllowTRFUploadAndScan ? user.user.AllowTRFUploadAndScan : 0,
        st_ManageApprovalWithCentre: user.user.st_ManageApprovalWithCentre ? user.user.st_ManageApprovalWithCentre : 0,
        RateTypeLogo: user.user.RateTypeLogo ? user.user.RateTypeLogo : "",
        RateCentreType: user.user.RateCentreType ? user.user.RateCentreType : "",
        HideResultEntryPreview: user.user?.HideResultEntryPreview ? user.user.HideResultEntryPreview : 0,
        AllowOrganismNameEditableAtResultEntry: user?.user.AllowOrganismNameEditableAtResultEntry ? user.user.AllowOrganismNameEditableAtResultEntry : 0,
        ShowClientNearToExpiry: user.user?.ShowClientNearToExpiry ? user.user.ShowClientNearToExpiry : 0,
        BlockExcelPrintout: user.user?.BlockExcelPrintout ? user.user.BlockExcelPrintout : 0,
        SkipCriticalCheck: user.user?.SkipCriticalCheck ? user.user.SkipCriticalCheck : 0,
        AllowDesktopView: user.user?.AllowDesktopView ? user.user.AllowDesktopView : 0,
        LabTATStartFrom: user.user?.LabTATStartFrom ? user.user.LabTATStartFrom : "Booking",
        IsPaginationOnTop: user.user?.IsPaginationOnTop ? user.user.IsPaginationOnTop : 0,
        AllowPDFonReprint: user.user?.AllowPDFonReprint ? user.user.AllowPDFonReprint : 0,
        AllowExcelonRePrint: user.user?.AllowExcelonRePrint ? user.user.AllowExcelonRePrint : 0,
        Font_family: user.user?.Font_family ? user.user.Font_family : "System Default",
        NextGenTheme: user.user?.NextGenTheme ? user.user.NextGenTheme : "classic",
        AllowOutsourceLabAtRegistration: user.user?.AllowOutsourceLabAtRegistration ? user.user?.AllowOutsourceLabAtRegistration : 0,
      };

      useLocalStorage("submenu", "set", user?.user?.MenuDirection);
      useLocalStorage("theme", "set", userData?.Theme);
      useLocalStorage("userData", "set", userData);
      localStorage.removeItem("User");
      useLocalStorage("accessRight", "set", user?.user?.AccessRight);
      useLocalStorage(
        "BarocdeNoMaxLength",
        "set",
        user?.user?.BarocdeNoMaxLength,
      );
      useLocalStorage("DefaultCentre", "set", user.user.DefaultCentreID);
      useLocalStorage(
        "language",
        "set",
        user.user.EmpLanguageCode ? user.user.EmpLanguageCode : "en",
      );
      i18n.changeLanguage(
        user.user.EmpLanguageCode ? user.user.EmpLanguageCode : "en",
      );
      useLocalStorage("token", "set", user.token);
      setWindowClass(`hold-transition login-page ${userData?.Theme}`);
      const isChangePasswordModalRequired =
        Number(user.user.LoginCount) === 0 &&
        Number(user.user.AllowAutoUserRateType) === 1 &&
        Number(user.user.RateTypeID) > 0;

      if (isChangePasswordModalRequired) {
        const redirectPath = user.user.ShowDashboard == 1 ? "/dashboard?forceChangePassword=true" : "/Welcome?forceChangePassword=true";
        navigate(redirectPath);
      } else {
        user.user.IsStoreDashboard == 1 || user.user.ShowDashboard == 1
          ? navigate("/dashboard")
          : navigate("/Welcome");
      }
    }
  };

  const validate = () => {
    let errorMessage = "";
    if (!isRightPanelActive) {
      if (!credentials?.username?.trim() && !credentials?.password?.trim()) {
        errorMessage = "Username and Password are required";
      } else {
        if (!credentials?.username?.trim())
          errorMessage = "Username is required";
        if (!credentials?.password?.trim())
          errorMessage = "Password is required";
      }
    }
    if (isRightPanelActive && !isForgot) {
      if (!credentials?.UserName?.trim() && !credentials?.Mobile?.trim()) {
        errorMessage = "Username and Registered Mobile Number are required";
      } else {
        if (!credentials?.UserName?.trim())
          errorMessage = "Username is required";
        if (!credentials?.Mobile?.trim())
          errorMessage += errorMessage
            ? " and Registered Mobile Number are required"
            : "Registered Mobile Number is required";
      }
    }
    if (isRightPanelActive && isForgot) {
      if (!String(credentials?.OTP)?.trim()) errorMessage = "OTP is required";
      if (!String(credentials?.Password)?.trim())
        errorMessage += errorMessage
          ? " and Password is required"
          : "Password is required";
      if (!String(credentials?.ConfirmPassword)?.trim())
        errorMessage += errorMessage
          ? " and Confirm Password is required"
          : "Confirm Password is required";
      if (
        credentials?.Password?.trim() &&
        credentials.Password !== credentials.ConfirmPassword
      )
        errorMessage += errorMessage
          ? " and Confirm Password does not match Password"
          : "Confirm Password does not match Password";
    }
    if (errorMessage) {
      toast.error(errorMessage);
    } else {
      return true;
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "UserName" || name === "username") {
      setCredentials({ ...credentials, UserName: value, username: value });
    } else {
      setCredentials({ ...credentials, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    const currentIp = await getCurrentIpAddress();

    dispatch(
      signInAction({
        username: credentials.username,
        password: credentials.password,
        ipaddress: currentIp || "",
      }),
    );
  };

  const handleForget = (e) => {
    e.preventDefault();
    if (validate()) {
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
          } else if (res.data?.message === "User not found.") {
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
    }
  };

  const handleKeyDown = (e) => {
    if (e?.key === "Enter") handleSubmit(e);
  };
  const handleKeyDown2 = (e) => {
    if (e?.key === "Enter") handleForget(e);
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
            handleSignInClick();
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

  const handleOtpChange = (newOtp) => {
    setCredentials({ ...credentials, OTP: newOtp });
  };
  const [passwordVisible, setPasswordVisible] = useState(false);
  const togglePasswordVisibility = () => {
    setPasswordVisible(!passwordVisible);
  };
  const inputRef = useRef(null);
  useEffect(() => {
    if (inputRef.current) inputRef.current.focus();
  }, []);

  return (
    <>
      {isPopupOpen.isOpen && (
        <AgreementPopup
          isPopupOpen={isPopupOpen}
          closeAgreeDialog={closeAgreeDialog}
          AgreeButtonCheck={AgreeButtonCheck}
        />
      )}
      {load && <Loading />}
      <div className="main-login-outer-Container">
        <div className="container">
          <div
            className="contentss"
            style={{
              textAlign: "center",
              justifyContent: "center",
              marginTop: "5px",
            }}
          >
            <Link to="/">
              {/* <img className="logoStyle" src={logo} alt="Logo" /> */}
            </Link>
          </div>

          {isRightPanelActive && (
            <>
              {!isForgot ? (
                <div>
                  <p className="login-sub-heading">Enter Details to get OTP</p>
                  <div className="input-group">
                    <span className="input-wrapper">
                      <InputText
                        type="text"
                        id="username"
                        className="input-field username-field"
                        name="UserName"
                        value={credentials?.UserName}
                        lable={t("Username")}
                        placeholder="Username"
                        onChange={handleChange}
                      />
                      <span className="login-icon">
                        <FaUser />
                      </span>
                    </span>
                  </div>
                  <div className="input-group">
                    <span className="input-wrapper">
                      <InputText
                        type="text"
                        id="Mobile"
                        className="input-field username-field"
                        name="Mobile"
                        value={credentials?.Mobile}
                        lable={t("Registered Mobile Number")}
                        placeholder="Registered Mobile Number"
                        onChange={handleChange}
                        onKeyDown={handleKeyDown2}
                      />
                      <span className="login-icon">
                        <FaMobileAlt />
                      </span>
                    </span>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      flexDirection: "column",
                    }}
                  >
                    <button className="sendOTP" onClick={handleForget}>
                      Send OTP
                    </button>
                    <div className="navigate-login" style={{ marginTop: 20 }}>
                      <Link
                        onClick={() => {
                          handleSignInClick();
                        }}
                        href="#.in"
                      >
                        <p className="back-to-login">Back To Login</p>
                      </Link>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="login-form enterOtp">
                  <h5 className="otp-sub-heading">
                    Enter OTP and updated password
                  </h5>
                  <div className="main-login-input">
                    <div className="icondiv"></div>
                    <div className="maindiv">
                      <OtpInput
                        length={4}
                        value={credentials.OTP}
                        onChange={handleOtpChange}
                      />
                    </div>
                  </div>
                  <div className="input-group">
                    <span className="input-wrapper">
                      <InputText
                        type={showPass ? "text" : "password"}
                        id="Password"
                        className="input-field username-field"
                        name="Password"
                        value={credentials?.Password}
                        placeholder="Password"
                        onChange={handleChange}
                      />
                      <i
                        style={{ color: "white" }}
                        className={`fa ${showPass ? "fa-eye" : "fa-eye-slash"} key-icon`}
                        onClick={() => setShowPass(!showPass)}
                      ></i>
                    </span>
                  </div>
                  <div className="input-group">
                    <span className="input-wrapper">
                      <InputText
                        type={cShowPass ? "text" : "password"}
                        id="ConfirmPassword"
                        className="input-field username-field"
                        name="ConfirmPassword"
                        value={credentials?.ConfirmPassword}
                        placeholder="ConfirmPassword"
                        onChange={handleChange}
                      />
                      <i
                        style={{ color: "white" }}
                        className={`fa ${cShowPass ? "fa-eye" : "fa-eye-slash"} key-icon`}
                        onClick={() => setCShowPass(!cShowPass)}
                      ></i>
                    </span>
                  </div>
                  <div className="main-login-button">
                    <button onClick={handleReset} className="sendOTP2">
                      Change Password
                    </button>
                    <span
                      className="otp-login"
                      onClick={() => {
                        handleSignInClick();
                      }}
                    >
                      Back to login
                    </span>
                  </div>
                </div>
              )}
            </>
          )}

          {!isRightPanelActive && (
            <div>
              <h2 className="login-heading">LOGIN</h2>
              <p className="login-sub-heading">Sign in to start your session</p>
              <div className="input-group">
                <span className="input-wrapper">
                  <InputText
                    placeholder="Username"
                    type="text"
                    id="username"
                    ref={inputRef}
                    className="input-field username-field"
                    name="username"
                    autoComplete="username"
                    value={credentials?.username}
                    lable={t("Username")}
                    onChange={handleChange}
                  />
                  <span className="login-icon">
                    <FaUser />
                  </span>
                </span>
              </div>
              <div className="input-group">
                <span className="input-wrapper">
                  <InputText
                    type={passwordVisible ? "text" : "password"}
                    placeholder="Password"
                    className="input-field password-field"
                    id="password"
                    name="password"
                    autoComplete="current-password"
                    value={credentials?.password}
                    lable={t("Password")}
                    onChange={handleChange}
                    onKeyDown={handleKeyDown}
                  />
                  <span
                    className="login-icon"
                    onClick={togglePasswordVisibility}
                    style={{ cursor: "pointer" }}
                  >
                    {passwordVisible ? <FaEye /> : <FaEyeSlash />}
                  </span>
                </span>
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  flexDirection: "column",
                }}
              >
                {/* AftabChanges */}
                <button
                  onClick={handleSubmit}
                  label="Login"
                  className="sendOTP"
                  // type="button"
                >
                  Login
                </button>
                <Link onClick={handleSignUpClick} href="#">
                  <p className="help-link-forgot forgetclass">
                    Forgot Password
                  </p>
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default LoginComponent;
