import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { apiUrls } from "../../../utils/apiUrls";
import { axiosInstance } from "../../../utils/axiosInstance";
import { useLocalStorage } from "../../../utils/hooks/useLocalStorage";
import { setWindowClass, addWindowClass, removeWindowClass } from "@app/utils/helpers";
import { setLoading, setCurrentTheme, setUiMode, setNgFontFamily } from "../loadingSlice/loadingSlice";
import { NG_FONT_FAMILIES, NG_DEFAULT_FONT_FAMILY } from "@app/utils/ngFontFamilies";

// 1) Generate login token
export const generateLoginToken = createAsyncThunk(
  "auth/generateLoginToken",
  async ({ userName, password, ipaddress }, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setLoading(true));
      const res = await axiosInstance.post(apiUrls?.GenerateLoginToken, {
        userName,
        password,
        ipaddress,
      });

      const guestToken =
        res?.data?.payload?.token ||
        res?.data?.token ||
        res?.data?.message?.token ||
        null;

      console.log("guestToken", guestToken);

      if (guestToken) {
        useLocalStorage("guest_token", "set", guestToken);
      }

      return res.data;
    } catch (err) {
      return rejectWithValue(
        err?.response?.data?.message || err.message || "Network error",
      );
    } finally {
      dispatch(setLoading(false));
    }
  },
);

export const loginFromToken = createAsyncThunk(
  "auth/loginFromToken",
  async ({ token, navigate }, { dispatch, rejectWithValue }) => {
    try {
      const guestToken = localStorage.getItem("guest_token");
      const res = await axiosInstance.post(apiUrls?.LoginFromToken, {
        Token: token || guestToken,
      });

      const payload = res.data;
      const user = payload?.user || payload?.message?.user || {};
      const tokenFromResponse =
        payload?.token ||
        payload?.data?.token ||
        payload?.message?.token ||
        guestToken;

      console.log("tokenFromResponse", tokenFromResponse);
      let dashboardSource = user || {};
      if (user?.EmployeeID) {
        try {
          const dashboardRes = await axiosInstance.post("Employee/getEmployeeDetailsByID", {
            EmployeeID: user?.EmployeeID,
          });
          dashboardSource = dashboardRes?.data?.message?.[0] || dashboardSource;
        } catch (error) {
          console.log("Error fetching dashboard rights", error);
        }
      }
      const showDashboard = dashboardSource?.ShowDashboard ?? user?.ShowDashboard ?? 0;
      const isStoreDashboard = dashboardSource?.IsStoreDashboard ?? user?.IsStoreDashboard ?? 0;

      const userData = {
        AutoFillPaidAmount: user?.AutoFillPaidAmount,
        IsRazorPayGateway: user?.IsRazorPayGateway,
        IsHdfcPayGateway: user?.IsHdfcPayGateway,
        IsIciciPayGateway: user?.IsIciciPayGateway,
        AddBlankRateTypeWorkOrder: user?.AddBlankRateTypeWorkOrder,
        DefaultDocotorOnWorkorder: user?.DefaultDocotorOnWorkorder,
        MainCentreID: user?.MainCentreID,
        CentreVsRateTypeatWorkOrder: user?.CentreVsRateTypeatWorkOrder,
        DefaultCurrencyName: user?.DefaultCurrencyName,
        SessionShowOnlineRemark: user?.ShowOnlineRemark,
        SessionDoctorId: user?.DoctorId,
        SessionInvoiceTo: user?.InvoiceTo,
        SessionRateTypeID: user?.RateTypeID,
        AllowTestAddWithOutAge: user?.AllowTestAddWithOutAge,
        HideInvoiceBillingCycle: user?.HideInvoiceBillingCycle,
        HideRePrintColorCode: user?.HideRePrintColorCode,
        ShowRePrintTotal: user?.ShowRePrintTotal,
        ShowAllCheckBarcodeOption: user?.ShowAllCheckBarcodeOption,
        ShowPaymentGatewayLinkinTop: user?.ShowPaymentGatewayLinkinTop,
        DefaultDateTypeResultEntry: user?.DefaultDateTypeResultEntry,
        HidePRDM: user?.HidePRDM,
        AllowRateTypeRefereshWorkOrder: user?.AllowRateTypeRefereshWorkOrder,
        AllowLabReport_Manual_W: user?.AllowLabReport_Manual_W,
        AllowReceipt_Manual_W: user?.AllowReceipt_Manual_W,
        AllowLabReport_Manual_SMS: user?.AllowLabReport_Manual_SMS,
        AllowReceipt_Manual_SMS: user?.AllowReceipt_Manual_SMS,
        AllowLabReport_Manual_E: user?.AllowLabReport_Manual_E,
        AllowReceipt_Manual_E: user?.AllowReceipt_Manual_E,
        MenuDirection: user?.MenuDirection,
        AllowEditRanges: user?.AllowEditRanges,
        HideBirthday: user?.HideBirthday,
        HideOutSourceColor: user?.HideOutSourceColor || 0,
        ReferedByDoctorDesignationID: user?.ReferedByDoctorDesignationID,
        DesignationId: user?.DesignationId,
        RemoveTestStatusLogic: user?.RemoveTestStatusLogic,
        IsWebsiteLogin: user?.IsWebsiteLogin,
        DefaultSearchTypeValue: user?.DefaultSearchTypeValue,
        Website: user?.Website,
        ShowBalanceAmount: user?.ShowBalanceAmount || 0,
        ImageGuid: user?.ImageGuid || "",
        ModifyRegDate: user?.ModifiedRegDate || "",
        Username: user?.Username || "",
        DefaultCentre: user?.DefaultCentreID || 0,
        SessionCentreID: user?.SessionCentreID || 0,
        CenterName: user?.CenterName || "",
        ShowDashboard: user?.ShowDashboard || 0,
        IsStoreDashboard: user?.IsStoreDashboard || 0,
        CompanyCode: user?.CompanyCode || "",
        SkipTestCentreResultEntry: user?.SkipTestCentreResultEntry || 0,
        SkipMicLabEntry: user?.SkipMicLabEntry || 0,
        CompanyLogo: user?.CompanyLogo || "",
        EmployeeID: user?.EmployeeID || 0,
        ImageLogo: user?.LogoCompany || "",
        EmployeeImage: user?.EmployeeImage || "",
        CompanyName: user?.CompanyName || "",
        CompanyID: user?.CompanyID || "",
        Theme:
          user?.Theme === "Default"
            ? "sky_blue_theme"
            : user?.Theme || "sky_blue_theme",
        IsPoct: user?.IsPoct || 0,
        DesignationName: user?.DesignationName || "",
        SuperAdmin: user?.SuperAdmin || 0,
        OnAppGoToMainList: user?.OnAppGoToMainList || 0,
        DefaultRole: user?.DefaultRole || 0,
        IsRoleWise: user?.IsRoleWise || 0,
        IsCDAC: user?.CDAC || 0,
        IsPatientWiseReporting: user?.IsPatientWiseReporting || 0,
        HideRate: user?.HideRate || 0,
        ShowDefaultLoginCentre: user?.ShowDefaultLoginCentre || "",
        ShowITDOSEFlashLogo: user?.ShowITDOSEFlashLogo || "",
        HideMacStatusFromDispatch: user?.HideMacStatusFromDispatch || "",
        HideResultDoneStatusFromDispatch:
          user?.HideResultDoneStatusFromDispatch || "",
        HideInTransitIconatDispatch: user?.HideInTransitIconatDispatch || "",
        IsPatientNameAutoCaps_WorkOrder:
          user?.IsPatientNameAutoCaps_WorkOrder || "",
        ShowUserFilterAtReprint: user?.ShowUserFilterAtReprint || "",
        AllowAdvanceOldPatientSearchAtWorkOrder:
          user?.AllowAdvanceOldPatientSearchAtWorkOrder || "",
        AccessRight: user?.AccessRight || "",
        HideOmitOptionatResultEntry: user?.HideOmitOptionatResultEntry || "",
        AllowSRAModule: user?.AllowSRAModule ? user?.AllowSRAModule : 0,
        IsHistoCascadeNumber: user?.IsHistoCascadeNumber ? user?.IsHistoCascadeNumber : 0,
        SkipRemarksOnReceiptPrint: user?.SkipRemarksOnReceiptPrint
          ? user?.SkipRemarksOnReceiptPrint
          : 1,
        IsBlankDefaultTitleatWorkOrder: user?.IsBlankDefaultTitleatWorkOrder
          ? user?.IsBlankDefaultTitleatWorkOrder
          : 0,
        AllowTestDeleteInsteadOfRefund: user?.AllowTestDeleteInsteadOfRefund
          ? user?.AllowTestDeleteInsteadOfRefund
          : 0,
        MaxDateRangeatResultEntry: user?.MaxDateRangeatResultEntry || "15",
        applicationFont: user?.applicationFont || "13",
        AllowZoneDiameterMicroResutlEntry: user?.AllowZoneDiameterMicroResutlEntry || "",
        AllowBreakPointMicroResutlEntry: user?.AllowBreakPointMicroResutlEntry || "",
        DefaultAllStatusResultEntry: user?.DefaultAllStatusResultEntry || "",
        HideNonDeposit: user?.HideNonDeposit || 0,
        HideNonCash: user?.HideNonCash || 0,
        AllowCofirmationMessageatWorkOrder: user?.AllowCofirmationMessageatWorkOrder || 0,
        HideInvoiceReprintExcel: user?.HideInvoiceReprintExcel || 0,
        AllowEditInfo: user?.AllowEditInfo || 0,
        AllowReceiptEdit: user?.AllowReceiptEdit || 0,
        AllowAutoNextSaveResultEntry: user?.AllowAutoNextSaveResultEntry || 0,
        AllowAutoNextApproveResultEntry: user?.AllowAutoNextApproveResultEntry || 0,
        IsDefaultReferalDoctorSelf: user?.IsDefaultReferalDoctorSelf || 0,
        IsDefaultAscOrderatResultEntry: user?.IsDefaultAscOrderatResultEntry || "0",
        ST_AutoGenerateSubcategoryCode: user?.ST_AutoGenerateSubcategoryCode || "0",
        ST_AutoGenerateVendorCode: user?.ST_AutoGenerateVendorCode || "0",
        AllowChangeBarcode: user?.AllowChangeBarcode || 0,
        AllowB2BDiscount: user?.AllowB2BDiscount || 0,
        AllowOrganismNameEditableAtResultEntry: user?.AllowOrganismNameEditableAtResultEntry || 0,
        AllowSpecialCharacterInNumericValue: user?.AllowSpecialCharacterInNumericValue || 0,
        SkipCriticalCheck: user?.SkipCriticalCheck || 0,
        AllowExcelonRePrint: user?.AllowExcelonRePrint || 0,
        AllowPDFonReprint: user?.AllowPDFonReprint || 0,
        Font_family: user?.Font_family ? user.Font_family : "System Default",
        NextGenTheme: user?.NextGenTheme ? user.NextGenTheme : "classic",
        AllowOutsourceLabAtRegistration: user?.AllowOutsourceLabAtRegistration || 0,
      };

      useLocalStorage("submenu", "set", user?.MenuDirection);
      useLocalStorage("theme", "set", userData?.Theme);
      useLocalStorage("userData", "set", userData);
      // useLocalStorage("accessRight", "set", user?.AccessRight || {});
      useLocalStorage("accessRight", "set", user?.AccessRight || "");
      useLocalStorage(
        "BarocdeNoMaxLength",
        "set",
        user?.BarocdeNoMaxLength || "",
      );
      // useLocalStorage("DefaultCentre", "set", user?.DefaultCentreID || "");
      useLocalStorage("DefaultCentre", "set", user?.DefaultCentreID || 0);
      useLocalStorage(
        "language",
        "set",
        user?.EmpLanguageCode ? user.EmpLanguageCode : "en",
      );
      useLocalStorage("token", "set", tokenFromResponse);

      // Set body theme class
      setWindowClass(`hold-transition login-page ${userData?.Theme}`);

      // ✅ SET THEME IN REDUX STORE
      dispatch(setCurrentTheme(userData?.Theme));

      // NextGen mode + font family now come back on the login/user record
      // itself (userData.NextGenTheme / userData.Font_family, built above)
      // — apply them the same way the toggle/font-picker do (localStorage +
      // redux + class), instead of only relying on whatever was left over
      // in localStorage from a previous session.
      const loginUiMode = userData?.NextGenTheme === "nextgen" ? "nextgen" : "classic";
      useLocalStorage("uiMode", "set", loginUiMode);
      dispatch(setUiMode(loginUiMode));
      if (loginUiMode === "nextgen") {
        addWindowClass("nextgen-mode");
        document.body.classList.add("nextgen-mode");
      } else {
        removeWindowClass("nextgen-mode");
        document.body.classList.remove("nextgen-mode");
      }

      const loginFontFamily =
        NG_FONT_FAMILIES.find((f) => f.label === userData?.Font_family)?.value ||
        NG_DEFAULT_FONT_FAMILY;
      useLocalStorage("ngFontFamily", "set", loginFontFamily);
      dispatch(setNgFontFamily(loginFontFamily));

      // Navigate after login
      if (navigate) navigate(showDashboard || isStoreDashboard ? "/dashboard" : "/Welcome");

      return { user, token: tokenFromResponse, raw: payload, userData };
    } catch (err) {
      return rejectWithValue(
        err?.response?.data?.message ||
          err.message ||
          "Login from token failed",
      );
    }
  },
);

const initialState = {
  loading: false,
  error: null,
  generateResponse: null,
  loginResponse: null,
  isAuthenticated: false,
  authToken: null,
  user: null,
  userData: null,
};

const byPassauthSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout(state) {
      state.isAuthenticated = false;
      state.authToken = null;
      state.loginResponse = null;
      state.user = null;
      state.userData = null;
      localStorage.clear();
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(generateLoginToken.pending, (state) => {
        state.loading = true;
      })
      .addCase(generateLoginToken.fulfilled, (state, action) => {
        state.loading = false;
        state.generateResponse = action.payload;
      })
      .addCase(generateLoginToken.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(loginFromToken.pending, (state) => {
        state.loading = true;
      })
      .addCase(loginFromToken.fulfilled, (state, action) => {
        state.loading = false;
        state.loginResponse = action.payload.raw;
        state.user = action.payload.user;
        state.userData = action.payload.userData;
        state.authToken = action.payload.token;
        state.isAuthenticated = true;
      })
      .addCase(loginFromToken.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { logout } = byPassauthSlice.actions;
export default byPassauthSlice.reducer;
