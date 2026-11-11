import { useFormik } from "formik";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import {
  CenterMasterValidationSchema,
  RateMasterValidationSchema,
  RateMasterValidationSchemacash,
} from "../../utils/Schema";
import { guidNumber } from "../util/Commonservices";
import { axiosInstance, axiosReport } from "../../utils/axiosInstance";
import UploadFile from "../utils/UploadFileModal/UploadFile";
import Heading from "../../components/UI/Heading";
import Accordion from "@app/components/UI/Accordion";
import { SelectBox } from "../../components/formComponent/SelectBox";
import NoRecordFound from "../../components/formComponent/NoRecordFound";

import Input from "../../components/formComponent/Input";
import {
  autocompleteOnBlur,
  ExportToExcel,
  formatStandardDate,
  getTrimmedData,
  number,
  PreventNumber,
  PreventSpecialCharacter,
} from "../../utils/helpers";
import moment from "moment";
import {
  AgainstInvoice,
  BillingCycle,
  SkipTimeType,
  GraceTime,
  PaymentMode,
  AutoSampleCollectionList,
  NablLogic,
} from "../../utils/Constants";
import { toast } from "react-toastify";
import Loading from "../../components/loader/Loading";
import ReactSelect from "../../components/formComponent/ReactSelect";
import IsBillAndReportModal from "../utils/IsBillAndReportModal";
import WelcomeModal from "../utils/WelcomeModal";
import {
  getCentreDetails,
  getCollectionBoy,
  getSearchController,
  GetGlobalData
} from "../../utils/NetworkApi/commonApi";
import AutoComplete from "../../components/formComponent/AutoComplete";
import RateTypeController from "./RateTypeController";
import { useSelector } from "react-redux";
import { useLocalStorage } from "../../utils/hooks/useLocalStorage";
import { Form } from "react-bootstrap";
import { FaPlus, FaRedo } from "react-icons/fa";
import { notify } from "../../utils/utils";
import { createDynamicValidation } from "../Laboratory/dynamicValidation";
import DatePicker from "../../components/formComponent/DatePicker";
import { apiUrls } from "../../utils/apiUrls";
import { CustomButton } from "../../components/UI/CustomButton";
import { FaEye } from "react-icons/fa";
import { Dialog } from "primereact/dialog";
import EmailPhoneCheckModal from "../../utils/EmailPhoneCheckModal/EmailPhoneCheckModal";
import "./CenterMaster.css";
import PageControlGear from "../../components/PageGearModel/PageControlGear";
import MultiSelectComp from "../../components/formComponent/MultiSelectComp";
import Tables from "../../components/UI/customTable";

// ─── DEFAULT EMPTY FORM STATE ────────────────────────────────────────────────
const getEmptyFormData = (nameParam) => ({
  DataType:
    nameParam === "center" ? "Centre" : nameParam === "Rate" ? "RateType" : "",
  CentreCode: "",
  UHIDCode: "",
  DispatchNo: "",
  Centre: "",
  CentreType: "",
  InvoiceTo: "Self",
  BusinessUnit: "Self",
  ProcessingLab: "Self",
  ReferenceRate: "Self",
  Type: nameParam === "center" ? "" : "null",
  Address1: "",
  Address2: "",
  CityId: 0,
  City: "",
  BusinessZoneId: 0,
  BusinessZone: "",
  StateId: 0,
  State: "",
  CountryId: 0,
  Country: "",
  Pincode: "",
  Email: "",
  LandLineNo: "",
  Phone: "",
  StateCode: "",
  Fax: "",
  Url: "",
  PaymentMode: "Cash",
  VisitType: 1,
  BarcodeLogic: "",
  SampleCollectandReceive: 0,
  CityZone: 0,
  ReferenceRate1: 0,
  ReferenceRate2: 0,
  IsTrfRequired: 0,
  IsDepartmentSlip: 0,
  IsSampleRecollection: 0,
  HideAmount: 0,
  isManualDiscountApply: 0,
  HideReceipt: 0,
  IsDoctorShareRequired: 0,
  isActive: 1,
  CentreID: 0,
  UserName: "",
  Password: "",
  isAllowedLogin: 0,
  userLoginID: 0,
  centreIDHash: guidNumber(),
  AgainstInvoice: "",
  SecurityAmount: "",
  SecurityRemark: "",
  Gstin: "",
  dtEntry: new Date(),
  FullyPaid: 0,
  SetMRP: 0,
  ProEmployee: "",
  skipTimeType: "NA",
  CreditLimitInRs: "",
  CreditLimitInTime: "",
  CreditLimitBase: 0.0,
  CreditLimitType: "",
  skipValue: "",
  IsAutoEmail: 0,
  IsAutoPRDM: 0,
  isAutoEmail: 0,
  fieldBodyID: 0,
  fieldBodyName: "",
  contractFromDate: new Date(),
  contractToDate: new Date(),
  mrpRateTypeID: 0,
  creditDays: 0,
  authrizedPersonName: "",
  authrizedPersonDesingation: "",
  authrizedPersonMobile: "",
  authrizedPersonEmailID: "",
  spocName: "",
  spocDesingation: "",
  spocMobile: "",
  spocEmailID: "",
  forcelyBookingLock: 0,
  forcelyReportingLock: 0,
  minCashInBookingPercent: 0,
  CreditLimit: 0,
  LockRegistration: 0,
  LockReport: 0,
  CoPaymentApplicable: 0,
  IsRollingAdvance: 0,
  GraceTime: "",
  IntimationLimit: "",
  InvoiceDisplayName: "",
  InvoiceEmail: "",
  SalesManager: "",
  BillingCycle: "Monthly",
  BankAccountNo: "",
  PANNo: "",
  aadharCardNo: "",
  tinno: "",
  udyamCertificateNo: "",
  IsPRDMConfiguration: {
    IsMailReport: 0,
    IsMailBill: 0,
    IsWhatsappReport: 0,
    IsWhatsappBill: 0,
    IsSmsReport: 0,
    IsSmsBill: 0,
  },
  isNabl: 0,
  DemandDraft: "",
  BenificialName: "",
  bankName: "",
  IFSCCode: "",
  BranchAddress: "",
  Description: "",
  RegisteredOffice: "",
  SampleCollectionType: 0,
  IsUrgent: 0,
  NablLogic: 1,
  requiredDocumentsDispatch: [],
  clientCategory: "",
  RequiredAttachment: [],
  InsuranceMapId: "",
  AllowZeroRateBooking: 0,
});

let PAGE_ID = name === "Rate" ? 15 : 13;

const localData = useLocalStorage("userData", "get");
const CompanyID = localData?.CompanyID;

// ─── HYDRATE FORM FROM API/STATE DATA ────────────────────────────────────────
const hydrateFormData = (data, nameParam) => {
  const base = getEmptyFormData(nameParam);
  if (!data) return base;
  return {
    ...base,
    DataType: data.DataType || base.DataType,
    CentreCode: data.CentreCode || "",
    UHIDCode: data.UHIDCode || "",
    DispatchNo: data.DispatchNo || "",
    Centre: data.Centre || "",

    // ✅ FIX: CentreType — API sends "B2B"/"Walkin"/"Panel" directly
    CentreType: data.CentreType || "",

    // ✅ FIX: Type — API sends string "null", convert to empty
    Type: !data.Type || data.Type === "null" ? base.Type : data.Type,

    InvoiceTo: data.InvoiceTo || "Self",
    BusinessUnit: data.BusinessUnit || "Self",
    ProcessingLab: data.ProcessingLab || "Self",
    ReferenceRate: data.ReferenceRate || "Self",
    Address1: data.Address1 || "",
    Address2: data.Address2 || "",
    CityId: data.CityId || 0,
    City: data.City || "",
    BusinessZoneId: data.BusinessZoneId || 0,
    BusinessZone: data.BusinessZone || "",
    StateId: data.StateId || 0,
    State: data.State || "",
    CountryId: data.CountryId || 0,
    Country: data.Country || "",
    Pincode: data.Pincode || "",
    Email: data.Email || "",
    LandLineNo: data.LandLineNo || "",
    Phone: data.Phone || "",
    StateCode: data.StateCode || "",
    Fax: data.Fax || "",
    Url: data.Url || "",
    PaymentMode: data.PaymentMode ? (data.PaymentMode === "Cash" ? "Cash" : "Credit") : "Cash",
    VisitType: data.VisitType || 1,
    BarcodeLogic: data.BarcodeID || data.BarcodeLogic || "",
    SampleCollectandReceive: data.SampleCollectandReceive || 0,
    CityZone: data.CityZone || 0,
    ReferenceRate1: data.ReferenceRate1 || 0,
    ReferenceRate2: data.ReferenceRate2 || 0,
    IsTrfRequired: data.IsTrfRequired || 0,
    IsDepartmentSlip: data.IsDepartmentSlip || 0,
    IsSampleRecollection: data.IsSampleRecollection || 0,
    HideAmount: data.HideAmount || 0,
    isManualDiscountApply: data.isManualDiscountApply || 0,
    HideReceipt: data.HideReceipt || 0,
    IsDoctorShareRequired: data.IsDoctorShareRequired || 0,
    isActive: data.isActive !== undefined ? data.isActive : 1,
    CentreID: data.CentreID || 0,
    InsuranceMapId: data.InsuranceMapId || "",

    // ✅ API sends "Username" (lowercase n)
    UserName: data.Username || data.UserName || "",
    Password: data.Password || "",
    isAllowedLogin: data.IsAllowedLogin || data.isAllowedLogin || 0,
    userLoginID: data.userLoginID || 0,
    centreIDHash: data.centreIDHash || guidNumber(),

    // ✅ FIX: AgainstInvoice — API sends 0 (number), form needs string
    AgainstInvoice:
      data.AgainstInvoice === 0 ||
        data.AgainstInvoice === null ||
        data.AgainstInvoice === undefined
        ? ""
        : String(data.AgainstInvoice),

    SecurityAmount: data.SecurityAmount || "",
    SecurityRemark: data.SecurityRemark || "",
    Gstin: data.Gstin || "",
    dtEntry: data.dtEntry ? new Date(data.dtEntry) : new Date(),
    FullyPaid: data.FullyPaid || 0,
    SetMRP: data.SetMRP || 0,
    ProEmployee: data.ProEmployee || "",

    // ✅ API sends 0 when no skip type — convert to "NA"
    skipTimeType:
      data.skipTimeType === 0 || data.skipTimeType === "0" || !data.skipTimeType
        ? "NA"
        : String(data.skipTimeType),

    CreditLimitInRs: data.CreditLimitInRs || "",
    CreditLimitInTime: data.CreditLimitInTime || "",
    CreditLimitBase: data.CreditLimitBase || 0.0,
    CreditLimitType: data.CreditLimitType || "",

    // ✅ API sends 0 when no skip value — convert to empty string
    skipValue:
      data.skipValue === 0 || data.skipValue === "0"
        ? ""
        : data.skipValue || "",

    IsAutoEmail: data.IsAutoEmail || 0,
    isAutoEmail: data.isAutoEmail || 0,
    IsAutoPRDM: data.IsAutoPRDM || 0,
    fieldBodyID: data.FieldBoyID || data.fieldBodyID || 0,
    fieldBodyName: data.FieldBoyName || data.fieldBodyName || "",
    contractFromDate: data.ContractFromDate
      ? new Date(data.ContractFromDate)
      : new Date(),
    contractToDate: data.ContractToDate
      ? new Date(data.ContractToDate)
      : new Date(),
    mrpRateTypeID: data.Mrp_RateTypeID || data.mrpRateTypeID || 0,
    creditDays: data.CreditDays || data.creditDays || 0,

    // ✅ API returns PascalCase (AuthrizedPersonName)
    authrizedPersonName:
      data.AuthrizedPersonName || data.authrizedPersonName || "",
    authrizedPersonDesingation:
      data.AuthrizedPersonDesingation || data.authrizedPersonDesingation || "",
    authrizedPersonMobile:
      data.AuthrizedPersonMobile || data.authrizedPersonMobile || "",
    authrizedPersonEmailID:
      data.AuthrizedPersonEmailID || data.authrizedPersonEmailID || "",

    // ✅ API returns PascalCase (SPOCName)
    spocName: data.SPOCName || data.spocName || "",
    spocDesingation: data.SPOCDesingation || data.spocDesingation || "",
    spocMobile: data.SPOCMobile || data.spocMobile || "",
    spocEmailID: data.SPOCEmailID || data.spocEmailID || "",

    forcelyBookingLock: data.forcelyBookingLock || 0,
    forcelyReportingLock: data.forcelyReportingLock || 0,

    // ✅ FIX: API sends "MinCashInBookingPercent" (PascalCase)
    minCashInBookingPercent:
      data.MinCashInBookingPercent ?? data.minCashInBookingPercent ?? 0,

    // ✅ FIX: CreditLimit — API sends 0 (number), form needs "" for disabled state
    CreditLimit:
      data.CreditLimit === 0 ||
        data.CreditLimit === null ||
        data.CreditLimit === undefined
        ? 0
        : parseInt(data.CreditLimit, 10) || 0,

    LockRegistration: data.LockRegistration || 0,
    LockReport: data.LockReport || 0,
    CoPaymentApplicable: data.CoPaymentApplicable || 0,
    IsRollingAdvance: data.IsRollingAdvance || 0,
    GraceTime: data.GraceTime || "",

    // ✅ FIX: IntimationLimit — API sends 0 (number), form needs ""
    IntimationLimit:
      data.IntimationLimit === 0 ||
        data.IntimationLimit === null ||
        data.IntimationLimit === undefined
        ? ""
        : data.IntimationLimit,

    InvoiceDisplayName: data.InvoiceDisplayName || "",
    InvoiceEmail: data.InvoiceEmail || "",
    SalesManager: data.SalesManager || "",
    ProEmployee: data.ProEmployee || "",
    BillingCycle: data.BillingCycle || "Monthly",
    BankAccountNo: data.BankAccountNo || "",
    PANNo: data.PANNo || "",

    // ✅ API sends "AadharCardNo" (PascalCase)
    aadharCardNo: data.AadharCardNo || data.aadharCardNo || "",

    // ✅ API sends "TINNO" (uppercase)
    tinno: data.TINNO || data.tinno || "",

    udyamCertificateNo: data.udyamCertificateNo || "",

    IsPRDMConfiguration: {
      IsMailReport: data.IsMailReport || 0,
      IsMailBill: data.IsMailBill || 0,
      IsWhatsappReport: data.IsWhatsappReport || 0,
      IsWhatsappBill: data.IsWhatsappBill || 0,
      IsSmsReport: data.IsSmsReport || 0,
      IsSmsBill: data.IsSmsBill || 0,
    },

    // ✅ API sends boolean false/true
    isNabl: data.isNabl ? 1 : 0,

    DemandDraft: data.DemandDraft || "",
    BenificialName: data.BenificialName || "",
    bankName: data.bankName || "",
    IFSCCode: data.IFSCCode || "",
    BranchAddress: data.BranchAddress || "",
    Description: data.Description || "",
    RegisteredOffice: data.RegisteredOffice || "",

    // ✅ FIX: SampleCollectionType — API sends number directly
    SampleCollectionType: data.SampleCollectionType ?? 0,

    // ✅ FIX: IsUrgent — API sends number directly
    IsUrgent: data.IsUrgent ?? 0,
    NablLogic: data.NablLogic || 0,
    // here have to work
    RequiredAttachment: data.RequiredAttachment
      ? (data.RequiredAttachment).split(",").map(Number)
      : [],

    requiredDocumentsDispatch: Array.isArray(data.requiredDocumentsDispatch)
      ? data.requiredDocumentsDispatch.map((item) => ({
        documentID:
          (item.documentID ?? item.documentId ?? item.value ?? item) || 0,
        documentName: item.documentName ?? item.label ?? "",
      }))
      : data.requiredDocumentsDispatch
        ? String(data.requiredDocumentsDispatch)
          .split(",")
          .map((id) => ({
            documentID: Number(id.trim()),
            documentName: "",
          }))
        : [],

    AllowZeroRateBooking: data.AllowZeroRateBooking ? 1 : 0,
  };
};

const CentreMaster = () => {
  const { rateTypeControllerData } = useSelector((data) => data?.loadingSlice);
  const { name } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { state } = location;
  console.log("state", state?.url);
  const [Invoice, setInvoice] = useState([]);
  const { HidePRDM } = useLocalStorage("userData", "get");
  const [load, setLoad] = useState(false);
  const [show, setShow] = useState(false);
  const [showAgrement, setShowAgrement] = useState(false);
  const [showPdf, setShowPdf] = useState(false);
  const [show1, setShow1] = useState(false);
  const [show2, setShow2] = useState(false);
  const [show3, setShow3] = useState(false);
  const [show4, setShow4] = useState(false);
  const [show5, setShow5] = useState(false);
  const [show6, setShow6] = useState(false);
  const [show8, setShow8] = useState(false);
  const [show7, setShow7] = useState(false);
  const [show9, setShow9] = useState(false);
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);
  const [ProcessingLab, setProcessingLab] = useState([]);
  const [ReferenceRate, setReferenceRate] = useState([]);
  const [BarCodeLogic, setBarCodeLogic] = useState([]);
  const [InsuranceData, setInsuranceData] = useState([]);
  const [VisitType, setVisitType] = useState([]);
  const [BusinessUnit, setBusinessUnit] = useState([]);
  const [CentreType, setCentreType] = useState([]);
  const [type, setType] = useState([]);
  const [doc, setDoc] = useState([]);
  const [showPassword, setShowPassword] = useState(false);
  const [showAccount, setShowAccount] = useState(true);
  const [salesManager, setSalesManager] = useState([]);
  const [proEmplyee, setProEmployee] = useState([]);
  const [centreAndRateDetails, setCentreAndRateDetails] = useState({});
  const [allSearchCenters, setAllSearchCenters] = useState([]);
  const [searchCenterSuggestions, setSearchCenterSuggestions] = useState([]);
  const [selectSearchCenter, setSelectSearchCenter] = useState(false);
  const [searchCenterIndex, setSearchCenterIndex] = useState(0);
  const [moreErrors, setMoreErrors] = useState({});
  const [tabbingOrder, setTabbingOrder] = useState([]);
  const [controllerDynamicList, setControllerDynamicList] = useState([]);
  console.log(controllerDynamicList, "controllerDynamicList")
  const [collectionBoyList, setCollectionBoyList] = useState([]);
  const [MRP, setMRP] = useState([]);
  const [businessZoneOptions, setBusinessZoneOptions] = useState([]);
  const [countryOptions, setCountryOptions] = useState([]);
  const [stateOptions, setStateOptions] = useState([]);
  const [cityOptions, setCityOptions] = useState([]);
  const [showEmailPhoneModal, setShowEmailPhoneModal] = useState(false);
  const [emailPhoneData, setEmailPhoneData] = useState([]);
  const [emailPhoneType, setEmailPhoneType] = useState("");
  const [cityList, setCityList] = useState([]);
  const [logData, setLogData] = useState([]);
  const [logLoading, setLogLoading] = useState(false);
  const [showLogDialog, setShowLogDialog] = useState(false);
  const [logSearchTerm, setLogSearchTerm] = useState("");
  const [showCredentialModal, setShowCredentialModal] = useState(false);
  const [credentialData, setCredentialData] = useState({ userName: "", password: "" });
  const [showAuditLogModal, setShowAuditLogModal] = useState(false);
  const [auditAllDate, setAuditAllDate] = useState(false);
  const [auditFromDate, setAuditFromDate] = useState(new Date());
  const [auditToDate, setAuditToDate] = useState(new Date());
  const [auditLoading, setAuditLoading] = useState(false);


  const theme = useLocalStorage("theme", "get");
  const isMobile = window.innerWidth < 768;
  //client
  const [status, setStatus] = useState([])
  const [pendingEmailPhoneValue, setPendingEmailPhoneValue] = useState(null);
  let PAGE_ID = name === "Rate" ? 15 : 13;
  const [searchCenterPayload, setSearchCenterPayload] = useState({
    label: "",
    value: null,
    DefaultCentreId: null,
  });
  const [selectedEmail, setSelectedEmail] = useState("");
  const { t } = useTranslation();
  const hideCredentials = location.state?.hideCredentials || false;

  // ✅ Initialize formData using hydrateFormData
  const [formData, setFormData] = useState(() =>
    hydrateFormData(state?.data, name),
  );
  console.log("Initial formData", formData);

  const [Dispatchdocument, setDispatchdocument] = useState([])
  const [PaymentModeData, setPaymentModeData] = useState([])

  const userdata = useLocalStorage("userData", "get");
  const DefaultCurrencyName = userdata?.DefaultCurrencyName;

  const GetPaymodeData = (state, name) => {
    axiosInstance
      .post("Global/GetGlobalData", {
        Type: name,
      })
      .then((res) => {
        let data = res.data.message;
        let SampleContainer = data.map((ele) => {
          return {
            value:
              ele.FieldDisplay === "Cash"
                ? "Cash"
                : ele.FieldDisplay === "Credit"
                  ? "Credit"
                  : ele.FieldID,
            label: ele.FieldDisplay,
          };
        });
        return state(SampleContainer);
      })
      .catch((err) => console.log(err));
  };
  useEffect(() => {
    GetPaymodeData(setPaymentModeData, "RateTypeMasterPaymentMode")
  }, []);
  console.log("PaymentModeData", PaymentModeData)
  useEffect(() => {
    if (PaymentModeData?.length === 1 && formData?.PaymentMode !== PaymentModeData[0]?.value) {
      setFormData((prev) => ({
        ...prev,
        PaymentMode: String(PaymentModeData[0]?.value),
      }));
    }
  }, [PaymentModeData]);
  // ✅ Re-hydrate when state?.data changes
  useEffect(() => {
    setFormData(hydrateFormData(state?.data, name));
  }, [name, state?.data]);

  const fetchCities = (id) => {
    const stateId = CompanyID == 1002 ? "19" : id;
    if (stateId) {
      axiosInstance
        .post("LocationMaster/bindCity", {
          stateID: stateId,
        })
        .then((res) => {
          const data = res.data.message;
          const value = data.map((ele) => ({
            value: ele.ID,
            label: ele.City,
          }));
          setCityList(value);
        })
        .catch((err) => console.log(err));
    }
  };
  useEffect(() => {
    if (CompanyID == 1002) {
      fetchCities("19");
    }
  }, []);

  const GetBusinessZone = () => {
    return axiosInstance
      .get("CommonController/GetBusinessZone")
      .then((res) => {
        const data = res?.data?.data || [];
        const options = data.map((item) => ({
          value: item.BusinessZoneID,
          label: item.BusinessZoneName,
        }));
        setBusinessZoneOptions(options);
        return options;
      })
      .catch((err) => {
        console.error("API Error:", err);
        return [];
      });
  };

  const CreditLimitType = [
    { label: "Amount", value: "Amount" },
    { label: "Days", value: "Days", max: 365 },
    { label: "PaymentDateOfMonth ", value: "PaymentDateOfMonth", max: 31 },
  ];

  const GetCountryData = () => {
    axiosInstance
      .get("CommonHC/GetCountryData")
      .then((res) => {
        const data = res?.data?.message || [];
        if (res?.data?.success && Array.isArray(data)) {
          const options = data.map((item) => ({
            value: item.CountryID,
            label: item.CountryName,
          }));
          setCountryOptions(options);
          setFormData((prev) => {
            return {
              ...prev,
              CountryId: prev.CountryId || data[0]?.CountryID,
            };
          });
        }
      })
      .catch((err) => {
        console.error("API Error:", err);
      });
  };

  const GetGlobalData = (state, type) => {
    axiosInstance
      .post("Global/getGlobaldata", {
        Type: type,
      })
      .then((res) => {
        const data = res.data?.message;
        console.log("Global Data for", data);
        const val = data.map((ele) => {
          return {
            label: ele?.FieldDisplay,
            value: ele?.FieldID,
          };
        });
        state(val);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  useEffect(() => {
    GetBusinessZone();
    GetCountryData();
    GetGlobalData(setDispatchdocument, "identity")
  }, []);
  //clientCategory
  //  useEffect(() => {

  //       GetGlobalData(setStatus, "clientCategory")
  //   }, []);

  // Fix the GetGlobalData call to map FieldID as value
  useEffect(() => {
    axiosInstance
      .post("Global/getGlobaldata", { Type: "clientCategory" })
      .then((res) => {
        const data = res.data?.message;
        const val = data.map((ele) => ({
          label: ele?.FieldDisplay,
          value: ele?.FieldID,        // ✅ use FieldID as value
        }));
        setStatus(val);
      })
      .catch((err) => console.log(err));
  }, []);
  const GetStateWiseData = (businessZoneId) => {
    return axiosInstance
      .post(
        `CommonController/GetStateWiseData?BusinessZoneID=${businessZoneId}`,
      )
      .then((res) => {
        const data = res?.data?.data || [];
        const options = data.map((item) => ({
          value: item.ID,
          label: item.State,
        }));
        setStateOptions(options);
        return options;
      })
      .catch((err) => {
        console.error("API Error:", err);
        return [];
      });
  };

  const GetCityData = (stateId) => {
    return axiosInstance
      .post(`CommonController/GetStateWiseCityData?StateID=${stateId}`)
      .then((res) => {
        const data = res?.data?.data || [];
        const options = data.map((item) => ({
          value: item.ID,
          label: item.City,
        }));
        setCityOptions(options);
        return options;
      })
      .catch((err) => {
        console.log("City API Error:", err);
        return [];
      });
  };

  const dateSelect = (date, name) => {
    setFormData((prev) => ({
      ...prev,
      [name]: date,
    }));
  };

  const getRequiredAttachment = () => {
    axiosInstance
      .post("Global/GetGlobalData", {
        Type: "RequiredAttachment",
      })
      .then((res) => {
        let data = res.data.message;
        let RequiredAttachment = data.map((ele) => {
          return {
            value: ele.FieldID,
            label: ele.FieldDisplay,
          };
        });
        setDoc(RequiredAttachment);
      })
      .catch((err) => console.log(err));
  };

  const getInvoiceTo = () => {
    axiosInstance
      .get("Centre/CentreInvoiceToList")
      .then((res) => {
        let data = res.data.message;
        let InvoiceData = data.map((ele) => {
          return {
            value: ele.InvoiceID,
            label: ele.Invoice,
          };
        });
        InvoiceData.unshift({ label: "Self", value: "Self" });
        setInvoice(InvoiceData);
      })
      .catch((err) => console.log(err));
  };

  const getProEmployee = () => {
    axiosInstance
      .get("Employee/ProEmployee")
      .then((res) => {
        let data = res?.data?.message;
        let proData = data?.map((ele) => {
          return {
            value: ele?.EmployeeID,
            label: ele?.EmployeeName,
          };
        });
        setProEmployee(proData);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const getCentreBusinessUnit = () => {
    axiosInstance
      .get("Centre/CentreBusinessUnit")
      .then((res) => {
        let data = res.data.message;
        let CentreBusinessUnit = data.map((ele) => {
          return {
            value: ele.BusinessUnitID,
            label: ele.BusinessUnit,
            fullName: `${ele?.BusinessUnit}, CentreId :${ele?.BusinessUnitID}`,
          };
        });
        if (name === "center") {
          CentreBusinessUnit.unshift({ label: "Self", value: "Self" });
        }
        setBusinessUnit(CentreBusinessUnit);
      })
      .catch((err) => console.log(err));
  };

  const getCentreProcessingLab = () => {
    axiosInstance
      .get("Centre/CentreProcessingLab")
      .then((res) => {
        let data = res.data.message;
        let CentreLab = data.map((ele) => {
          return {
            value: ele.ProcessingLabID,
            label: ele.ProcessingLab,
          };
        });
        CentreLab.unshift({ label: "Self", value: "Self" });
        setProcessingLab(CentreLab);
      })
      .catch((err) => console.log(err));
  };

  const handleCheckDuplicate = () => {
    return new Promise((resolve, reject) => {
      axiosInstance
        .post("Centre/checkDuplicateCentreCode", {
          CentreCode: formData?.CentreCode,
          CentreID: formData?.CentreID != 0 ? formData?.CentreID : "",
        })
        .then((res) => {
          if (res?.data?.message === "Duplicate CentreCode.") {
            toast.error(res?.data?.message);
            setFormData((prev) => ({ ...prev, CentreCode: "" }));
          }
          resolve(res?.data?.message);
        })
        .catch((err) => {
          toast.error(
            err?.response?.data?.message
              ? err?.response?.data?.message
              : "Error Occured",
          );
          reject(err);
        });
    });
  };

  const getReferenceRate = () => {
    axiosInstance
      .get("Centre/CentreReferRateList")
      .then((res) => {
        let data = res.data.message;
        let CentreReferRate = data.map((ele) => {
          return {
            value: ele.ReferenceRateID,
            label: ele.ReferenceRate,
          };
        });
        CentreReferRate.unshift({ label: "Self", value: "Self" });
        setReferenceRate(CentreReferRate);
      })
      .catch((err) => console.log(err));
  };

  const getVisitTypeList = () => {
    axiosInstance
      .get("Centre/visitTypeList")
      .then((res) => {
        let data = res.data.message;
        let VisitTypeList = data.map((ele) => {
          return {
            value: ele.FieldID,
            label: ele.FieldDisplay,
          };
        });
        setVisitType(VisitTypeList);
      })
      .catch((err) => console.log(err));
  };

  const getBarCodeLogic = () => {
    axiosInstance
      .get("Centre/BarcodeLogicList")
      .then((res) => {
        let data = res.data.message;
        let Barcode = data.map((ele) => {
          return {
            value: ele.BarcodeID,
            label: ele.BarcodeDisplay,
          };
        });
        Barcode.unshift({ label: "Select Barcode Logic", value: "" });
        setBarCodeLogic(Barcode);
      })
      .catch((err) => console.log(err));
  };

  const getInsuranceMapping = () => {
    axiosInstance
      .get("Centre/GetInsuranceCentre")
      .then((res) => {
        let data = res.data.message;
        let InsuranceMapping = data.map((ele) => {
          return {
            // value: ele.id ?? ele.ID ?? ele.CentreID ?? ele.CentreId ?? ele.InsuranceMapId,
            // label: ele.Centre  ?? ele.CentreName,
            value: ele.CentreID,
            label: ele.Centre,
          };
        });
        InsuranceMapping.unshift({ label: "Select Insurance Mapping", value: "" });
        setInsuranceData(InsuranceMapping);
      })
      .catch((err) => console.log(err));
  };



  const getDropDownData = (name) => {
    axiosInstance
      .post("Global/getGlobalData", { Type: name })
      .then((res) => {
        let data = res?.data?.message;
        let value = data?.map((ele) => {
          return {
            value: ele.FieldDisplay,
            label: ele.FieldDisplay,
          };
        });
        switch (name) {
          case "CentreType":
            setCentreType(value);
            break;
        }
      })
      .catch((err) => console.log(err));
  };

  const checkEmailPhoneRegistration = async (type, value) => {
    console.log("🔍 Function called:", { type, value });

    if (!value || !value.trim()) {
      toast.error(`Please enter ${type.toLowerCase()} first`);
      return;
    }

    try {
      console.log("📡 Sending API request...");

      const response = await axiosInstance.post("RateType/GetDetails", {
        type: type === "Email" ? "Email" : "Number",
        value: value,
      });

      console.log("✅ API Response:", response.data);

      if (response.data.success) {
        const resultData = response.data.message || [];
        console.log("📊 Setting modal data:", resultData);

        if (resultData.length > 0) {
          setPendingEmailPhoneValue({ type, value });
          setEmailPhoneData(resultData);
          setEmailPhoneType(type);
          setShowEmailPhoneModal(true);
        } else {
          toast.info("No Client Information Found " + type.toLowerCase());
        }
      } else {
        toast.info(response.data.message || "No records found");
      }
    } catch (err) {
      console.error("❌ API Error:", err);
      toast.error("Error checking registration details");
    }
  };

  const handleEmailPhoneConfirmation = (confirmed) => {
    if (confirmed) {
      toast.success(
        `Proceeding with ${pendingEmailPhoneValue?.type}: ${pendingEmailPhoneValue?.value}`,
      );
    } else {
      const fieldName =
        pendingEmailPhoneValue?.type === "Email" ? "Email" : "Phone";
      setFormData((prev) => ({
        ...prev,
        [fieldName]: "",
      }));
      toast.info(`${pendingEmailPhoneValue?.type} field cleared`);
    }
    setShowEmailPhoneModal(false);
    setPendingEmailPhoneValue(null);
  };

  const getFieldValue = (controlId) => {
    const fieldMap = {
      "Centre Type": formData?.Type,
      "Centre Name": formData?.Centre,
      "Skip Time Type": formData?.skipTimeType,
      UserName: formData?.UserName,
      fullName: formData?.authrizedPersonName,
      designation: formData?.authrizedPersonDesingation,
      emailId: formData?.authrizedPersonEmailID,
      mobile: formData?.authrizedPersonMobile,
      spocName: formData?.spocName,
      spocDesingation: formData?.spocDesingation,
      spocMobile: formData?.spocMobile,
      spocEmailID: formData?.spocEmailID,
    };

    return fieldMap[controlId] || formData[controlId] || "";
  };

  const ignoreValidation = (controlId) => {
    const ignoreList = [
      "HideAmount",
      "isManualDiscountApply",
      "LockRegistration",
      "LockReport",
      "CoPaymentApplicable",
      "isAutoEmail",
      "isActive",
      "SampleCollectandReceive",
      "IsTrfRequired",
      "IsDepartmentSlip",
      "IsSampleRecollection",
      "HideReceipt",
      "IsDoctorShareRequired",
      "FullyPaid",
      "SetMRP",
      "IsAutoPRDM",
      "btnUpload_cenre",
      "UploadAttHeader_centre",
      "UploadAttFooter_centre",
      "UploadStamp_centre",
      "UploadQRCode_centre",
      "UploadAdditionalLogo_centre",
      "UploadisNabl_centre",
    ];
    return ignoreList.includes(controlId);
  };

  const validateMandatoryFields = () => {
    const errors = {};
    controllerDynamicList.forEach((item) => {
      if (item.IsMandatory == 1 && !ignoreValidation(item.ControlDisplayID)) {
        const fieldValue = getFieldValue(item.ControlDisplayID);
        if (!fieldValue || fieldValue.toString().trim() === "") {
          errors[item.ControlDisplayID] =
            `${item?.ControlDisplayName} Field is required`;
        }
      }
    });
    return errors;
  };

  const { handleSubmit } = useFormik({
    initialValues: formData,
    enableReinitialize: true,
    onSubmit: (values) => {
      console.log("Values:", values);
      const validationErrors = validateMandatoryFields();
      if (Object.keys(validationErrors).length > 0) {
        setMoreErrors(validationErrors);
        return;
      }
      // if (formData?.InsuranceMapId && formData?.CentreType !== "Insurance") {
      //   toast.error("Please select Centre Type as Insurance.");
      //   return;
      // }
      const centreTypeLabel =
        type?.find(
          (t) => String(t.value) === String(formData?.CentreType),
        )?.label || formData?.CentreType;
      const isInsuranceCentreType =
        String(centreTypeLabel).toLowerCase() === "insurance";
      if (formData?.InsuranceMapId && !isInsuranceCentreType) {
        toast.error("Please select Centre Type as Insurance.");
        return;
      }

      // comment

      if (
        DefaultCurrencyName === "KES" &&
        isInsuranceCentreType &&
        !formData?.InsuranceMapId
      ) {
        toast.error("Please select Insurance Mapping.");
        return;
      }
      if ([1, 2, 3, 4, 5].includes(formData?.Pincode.length)) {
        toast.error("Please Enter Correct Pin Code");
      } else {
        setLoad(true);
        // handleCheckDuplicate().then((res) => {
        //   if (res === "Duplicate CentreCode.") {
        //     setLoad(false);
        //   } else {
        const buisnesszoneName = businessZoneOptions.find(
          (item) => item.value === values?.BusinessZoneId,
        )?.label;
        const countryName = countryOptions.find(
          (item) => item.value === values?.CountryId,
        )?.label;
        const stateName = stateOptions.find(
          (item) => item.value === values?.StateId,
        )?.label;
        const city = cityOptions.find(
          (item) => item.value === values?.CityId,
        )?.label;
        const cityZoneNum = Number(values?.CityZone);
        const payloadAfterCnt = getTrimmedData({
          ...values,
          isAllowedLogin: values?.UserName && values?.Password ? 1 : 0,
          CityZone:
            values?.CityZone !== "" && values?.CityZone != null
              ? Number(values.CityZone)
              : 0,
          CreditLimitBase:
            Number(formData?.CreditLimitBase || 0) ||
            Number(values?.CreditLimitBase || 0),
          InvoiceTo: values?.InvoiceTo === "Self" ? 0 : values?.InvoiceTo,
          BusinessUnit:
            values?.BusinessUnit === "Self" ? 0 : values?.BusinessUnit,
          ProcessingLab:
            values?.ProcessingLab === "Self" ? 0 : values?.ProcessingLab,
          ReferenceRate:
            values?.ReferenceRate === "Self"
              ? values?.CentreID
                ? values?.CentreID
                : 0
              : values?.ReferenceRate,
          ReferenceRate1:
            values?.ReferenceRate1 === "Self"
              ? values?.CentreID
                ? values?.CentreID
                : 0
              : values?.ReferenceRate1,
          ReferenceRate2:
            values?.ReferenceRate2 === "Self"
              ? values?.CentreID
                ? values?.CentreID
                : 0
              : values?.ReferenceRate2,
          // mrpRateTypeID shares its options (including the "Self" sentinel)
          // with ReferenceRate/ReferenceRate1/ReferenceRate2 above, but was
          // missing the same conversion - the backend expects a nullable
          // int, so sending the literal string "Self" (or "" from the
          // "Select MRP" placeholder option) fails with a 400.
          mrpRateTypeID:
            values?.mrpRateTypeID === "Self"
              ? values?.CentreID
                ? values?.CentreID
                : 0
              : values?.mrpRateTypeID === "" ||
                  values?.mrpRateTypeID === null ||
                  values?.mrpRateTypeID === undefined
                ? null
                : Number(values?.mrpRateTypeID),
          skipTimeType: values?.skipTimeType?.toString(),
          skipValue: values?.skipValue?.toString(),
          isActive: values?.isActive ? 1 : 0,
          isNabl: values?.isNabl ? 1 : 0,
          contractFromDate: formatStandardDate(
            values?.contractFromDate,
            "YYYY-MM-DD",
          ),
          contractToDate: formatStandardDate(
            values?.contractToDate,
            "YYYY-MM-DD",
          ),
          creditDays: Number(values?.creditDays) || 0,
          CreditLimit: parseInt(values?.CreditLimit, 10) || 0,
          BusinessZone: buisnesszoneName,
          Country: countryName,
          State: stateName,
          City: city,
          authrizedPersonName: formData?.authrizedPersonName || "",
          authrizedPersonDesingation:
            formData?.authrizedPersonDesingation || "",
          authrizedPersonMobile: formData?.authrizedPersonMobile || "",
          authrizedPersonEmailID: formData?.authrizedPersonEmailID || "",
          spocName: formData?.spocName || "",
          spocDesingation: formData?.spocDesingation || "",
          spocMobile: formData?.spocMobile || "",
          spocEmailID: formData?.spocEmailID || "",
          forcelyBookingLock: formData?.forcelyBookingLock || 0,
          forcelyReportingLock: formData?.forcelyReportingLock || 0,
          NablLogic: Number(formData?.NablLogic || 0),
          requiredDocumentsDispatch: formData.requiredDocumentsDispatch || [],
          RequiredAttachment: formData.RequiredAttachment || [],
          CoPaymentApplicable: formData?.CentreType == "Panel" ? formData?.CoPaymentApplicable : 0,
          InsuranceMapId: Number(formData?.InsuranceMapId || 0),
          AllowZeroRateBooking: Boolean(values?.AllowZeroRateBooking),
          // Backend requires a "cm" field on Centre/UpdateCentre with no
          // corresponding frontend control or known meaning yet - sending
          // it empty satisfies the "field is required" validation until
          // its actual purpose is confirmed.
          cm: "",
        });
        axiosInstance
          .post(state?.url ? state?.url : "Centre/InsertCentre", {
            ...payloadAfterCnt,
            flagRates: rateTypeControllerData,
          })
          .then((res) => {
            if (res.data.success) {
              toast.success(res.data.message);
              if (!hideCredentials && res.data.data?.userName && res.data.data?.password) {
                setCredentialData({
                  userName: res.data.data.userName,
                  password: res.data.data.password,
                });
                setShowCredentialModal(true);
              }
              setCentreAndRateDetails({});
              setSearchCenterPayload({
                label: "",
                value: null,
                DefaultCentreId: null,
              });
              // ✅ After successful save, reset ALL fields to empty defaults
              setFormData(getEmptyFormData(name));
              setMoreErrors({});
              setStateOptions([]);
              setCityOptions([]);
              getCentersWithParams({
                Datatype:
                  name === "center" ? "CentreMaster" : "RateTypeMaster",
                InvoiceBillingCycle: "",
                PaymentMode: "",
                IsActive: 0,
              });
              navigate(`/CentreMaster/${name}`, {
                replace: true,
                state: { url: "Centre/InsertCentre" },
              });
              setLoad(false);
            } else {
              toast.error(res?.data?.message || "Something went wrong");
              setLoad(false);
            }
          })
          .catch((err) => {
            console.log("center update error", err);
            toast.error(
              err?.response?.data?.message
                ? err?.response?.data?.message
                : "Error Occured",
            );
            setLoad(false);
          });
        //   }
        // });
      }
    },
  });
  const handleLog = async (CenterId) => {
    if (!CenterId) {
      toast.error("Rate Type is  missing");
      return;
    }

    setLogData([]);

    try {
      const res = await axiosInstance.get(`Centre/GetRateTypeLogs?rateTypeId=${CenterId}`); // ← add your API URL here
      if (res.data.success) {
        setLogData(res.data.message || []);
        setShowLogDialog(true);
        setLogLoading(true);

      } else {
        toast.error(res.data.message || "No log data found");
        return;
      }
    } catch (error) {
      toast.error("Failed to fetch log data");
    } finally {
      setLogLoading(false);
    }
  };

  const handleAuditDateChange = (date, name) => {
    if (name === "auditFromDate") setAuditFromDate(date);
    if (name === "auditToDate") setAuditToDate(date);
  };

  const handleAuditLogExport = async (reportFormat) => {
    const payload = {
      fromDate: auditAllDate ? "" : formatStandardDate(auditFromDate, "YYYY-MM-DD"),
      toDate: auditAllDate ? "" : formatStandardDate(auditToDate, "YYYY-MM-DD"),
      isAllDate: auditAllDate,
      centreIdHash: formData?.centreIDHash || "",
      reportFormat: reportFormat,
    };

    try {
      setAuditLoading(true);
      const res = await axiosReport.post("AuditTrail/AuditLogReport", payload, {
        responseType: "blob",
      });

      const contentType = res.headers?.["content-type"] || "";
      if (contentType.includes("application/json")) {
        const text = await res.data.text();
        const json = JSON.parse(text);
        toast.warning(json?.message || "No records found.");
        return;
      }

      if (!res.data || res.data.size === 0) {
        toast.warning("No data available to export.");
        return;
      }

      if (reportFormat === "Pdf") {
        const url = window.URL.createObjectURL(
          new Blob([res.data], { type: "application/pdf" }),
        );
        window.open(url, "_blank");
      } else {
        const url = window.URL.createObjectURL(
          new Blob([res.data], {
            type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          }),
        );
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", "AuditLog.xlsx");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      }
      setShowAuditLogModal(false);
    } catch (err) {
      if (err?.response?.data instanceof Blob) {
        const text = await err.response.data.text();
        try {
          const json = JSON.parse(text);
          toast.error(json?.message || "Error while fetching report.");
        } catch {
          toast.error("Error while fetching report.");
        }
      } else {
        toast.error(
          err?.response?.data?.message
            ? err?.response?.data?.message
            : "Error Occured",
        );
      }
    } finally {
      setAuditLoading(false);
    }
  };

  const handleSearchCenterChange = (e) => {
    const value = e.target.value;
    setSearchCenterPayload({
      label: value,
      value: null,
      DefaultCentreId: null,
    });

    if (!value.trim()) {
      setSelectSearchCenter(false);
      setSearchCenterSuggestions(allSearchCenters);
    } else {
      const lowerValue = value.toLowerCase();
      const filtered = allSearchCenters.filter(
        (c) =>
          c.label?.toLowerCase().includes(lowerValue) ||
          c.fullName?.toLowerCase().includes(lowerValue) ||
          c.value?.toString().includes(lowerValue),
      );
      setSearchCenterSuggestions(filtered);
      setSelectSearchCenter(true);
      setSearchCenterIndex(0);
    }
  };

  const handleSearchCenterKeyDown = (e) => {
    if (!selectSearchCenter || searchCenterSuggestions.length === 0) return;

    if (e.key === "ArrowUp") {
      setSearchCenterIndex((prev) =>
        prev > 0 ? prev - 1 : searchCenterSuggestions.length - 1,
      );
    } else if (e.key === "ArrowDown") {
      setSearchCenterIndex((prev) =>
        prev === searchCenterSuggestions.length - 1 ? 0 : prev + 1,
      );
    } else if (e.key === "Enter") {
      handleSearchCenterSelect(searchCenterSuggestions[searchCenterIndex]);
      setSearchCenterIndex(0);
    }
  };

  const handleSearchCenterSelect = async (selected) => {
    if (!selected) return;

    const centreId =
      selected?.value !== undefined && selected?.value !== null && selected?.value !== ""
        ? String(selected.value)
        : "";

    if (!centreId) {
      toast.error("Unable to fetch centre detail");
      return;
    }

    setSearchCenterPayload(selected);
    setSelectSearchCenter(false);
    setMoreErrors({});

    try {
      const res = await axiosInstance.post("Centre/GetCentreData", {
        centreType: "",
        centreName: "",
        centreCode: "",
        dataType: name === "center" ? "Centre" : "RateType",
        centreId: centreId,
      });

      const rows = res?.data?.message || res?.data?.Message;
      const success = res?.data?.success ?? res?.data?.Success;

      if (success && Array.isArray(rows) && rows.length > 0) {
        const data = rows[0];
        setCentreAndRateDetails(data);


        // ✅ FIX: Normalize all fields from API response before passing to navigate
        let stateDataToPass = {
          ...data,

          propsID: centreId,
          CityId: data.CityId || 0,
          StateId: data.StateId || 0,
          BusinessZoneId: data.BusinessZoneId || 0,
          ProEmployee: data.ProEmployee || "",

          // ✅ FIX: Type "null" string normalize karo
          Type: !data.Type || data.Type === "null" ? "" : data.Type,

          // ✅ FIX: CentreType explicitly pass karo
          CentreType: data.CentreType || "",

          // ✅ FIX: MinCashInBookingPercent — PascalCase normalize
          MinCashInBookingPercent: data.MinCashInBookingPercent ?? 0,
          minCashInBookingPercent: data.MinCashInBookingPercent ?? 0,

          // ✅ FIX: AgainstInvoice — 0 ko "" karo
          AgainstInvoice:
            data.AgainstInvoice === 0 || !data.AgainstInvoice
              ? ""
              : String(data.AgainstInvoice),
          PaymentMode: data.PaymentMode ? (data.PaymentMode === "Cash" ? "Cash" : "Credit") : "Cash",

          // ✅ FIX: CreditLimit — 0 ko "" karo
          CreditLimit:
            data.CreditLimit === 0 ||
              data.CreditLimit === null ||
              data.CreditLimit === undefined
              ? 0
              : parseInt(data.CreditLimit, 10) || 0,

          CreditLimitType: data.CreditLimitType || "",

          // ✅ FIX: IntimationLimit — 0 ko "" karo
          IntimationLimit:
            data.IntimationLimit === 0 ||
              data.IntimationLimit === null ||
              data.IntimationLimit === undefined
              ? ""
              : data.IntimationLimit,

          // ✅ Already correct keys — explicitly map for clarity
          AadharCardNo: data.AadharCardNo || "",
          TINNO: data.TINNO || "",
          Username: data.Username || data.UserName || "",

          // ✅ SPOC fields (PascalCase from API)
          SPOCName: data.SPOCName || "",
          SPOCDesingation: data.SPOCDesingation || "",
          SPOCMobile: data.SPOCMobile || "",
          SPOCEmailID: data.SPOCEmailID || "",

          // ✅ Authorized Person fields (PascalCase from API)
          AuthrizedPersonName: data.AuthrizedPersonName || "",
          AuthrizedPersonDesingation: data.AuthrizedPersonDesingation || "",
          AuthrizedPersonMobile: data.AuthrizedPersonMobile || "",
          AuthrizedPersonEmailID: data.AuthrizedPersonEmailID || "",
        };


        // Map SalesManager and ProEmployee names to IDs
        try {
          const empRes = await axiosInstance.get("Employee/ProEmployee");
          if (empRes?.data?.success && Array.isArray(empRes.data.message)) {
            const empList = empRes.data.message;
            if (data.ProEmployee && isNaN(data.ProEmployee)) {
              const emp = empList.find(
                (e) => e.EmployeeName === data.ProEmployee,
              );
              if (emp) stateDataToPass.ProEmployee = emp.EmployeeID;
            }
          }
        } catch (e) {
          console.error("Error mapping employees", e);
        }

        try {
        if (data.BusinessZone) {
          const bZones = await GetBusinessZone();
          const zoneList = Array.isArray(bZones) ? bZones : [];
          const bZone = zoneList.find((opt) => opt.label === data.BusinessZone);

          if (bZone) {
            stateDataToPass.BusinessZoneId = bZone.value;
            stateDataToPass.BusinessZone = bZone.label;

            const stateOpts = await GetStateWiseData(bZone.value);
            const stateList = Array.isArray(stateOpts) ? stateOpts : [];
            const stateObj = stateList.find((opt) => opt.label === data.State);

            if (stateObj) {
              stateDataToPass.StateId = stateObj.value;
              stateDataToPass.State = stateObj.label;

              const cityOpts = await GetCityData(stateObj.value);
              const cityList = Array.isArray(cityOpts) ? cityOpts : [];
              const cityObj = cityList.find((opt) => opt.label === data.City);

              if (cityObj) {
                stateDataToPass.CityId = cityObj.value;
                stateDataToPass.City = cityObj.label;
              }
            }
          }
        }
        } catch (mapErr) {
          console.error("Error mapping location details", mapErr);
        }

        navigate(`/CentreMaster/${name}`, {
          state: {
            data: stateDataToPass,
            other: { button: "Update", pageName: "Edit" },
            url: "Centre/UpdateCentre",
            hideCredentials: true,
          },
        });
      } else {
        toast.error(
          (typeof rows === "string" && rows) ||
            res?.data?.message ||
            "Unable to fetch centre detail"
        );
      }
    } catch (err) {
      console.error(err);
      toast.error(
        err?.response?.data?.message ||
          err?.response?.data?.Message ||
          "Unable to fetch centre detail"
      );
    }
  };

  const clearValidationError = (fieldName) => {
    const controllerItem = controllerDynamicList.find((item) => {
      const mappedName =
        fieldName === "Type"
          ? "Centre Type"
          : fieldName === "Centre"
            ? "Centre Name"
            : fieldName;
      return item.ControlDisplayID === mappedName;
    });

    if (controllerItem && moreErrors[controllerItem.ControlDisplayID]) {
      setMoreErrors((prev) => ({
        ...prev,
        [controllerItem.ControlDisplayID]: "",
      }));
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    clearValidationError(name);

    if (type === "checkbox") {
      setFormData({
        ...formData,
        [name]: checked ? 1 : 0,
      });
      return;
    }

    if (name === "CentreCode") {

      const cleanValue = value
        .replace(/[^A-Za-z0-9-]/g, "") // remove invalid chars
        .toUpperCase();

      setFormData({
        ...formData,
        [name]: cleanValue,
      });
      return;
    }

    if (name === "skipTimeType") {
      setFormData({
        ...formData,
        [name]: value,
        skipValue: "",
      });
      return;
    }

    if (name === "BankAccountNo" || name === "IFSCCode" || name === "PANNo") {
      setFormData({
        ...formData,
        [name]: PreventSpecialCharacter(value) ? value : formData[name],
      });
      return;
    }

    if (name === "Centre") {
      setFormData({
        ...formData,
        [name]: value,
      });
      return;
    }

    if (name === "tinno" || name === "udyamCertificateNo") {
      const upperValue = value.toUpperCase();
      if (!/^[A-Z0-9]*$/.test(upperValue)) {
        return;
      }
      setFormData({
        ...formData,
        [name]: upperValue,
      });
      return;
    }

    if (
      [
        "authrizedPersonName",
        "authrizedPersonDesingation",
        "authrizedPersonEmailID",
        "authrizedPersonMobile",
        "spocName",
        "spocDesingation",
        "spocEmailID",
        "spocMobile",
      ].includes(name)
    ) {
      setFormData({
        ...formData,
        [name]: value,
      });
      return;
    }

    if (name === "aadharCardNo") {
      const onlyDigits = value.replace(/\D/g, "");
      if (onlyDigits.length > 12) return;
      setFormData({
        ...formData,
        [name]: onlyDigits,
      });
      return;
    }

    if (
      [
        "City",
        "State",
        "Country",
        "CityZone",
        "BusinessZone",
        "BenificialName",
        "bankName",
        "InvoiceDisplayName",
      ].includes(name)
    ) {
      setFormData({
        ...formData,
        [name]: PreventNumber(value) ? value : formData[name],
      });
      return;
    }

    if (name === "minCashInBookingPercent") {
      const numValue = Number(value);
      if (numValue > 100) return;
      setFormData({
        ...formData,
        [name]: value,
      });
      return;
    }

    if (name === "CreditLimit") {
      const numValue = parseInt(value, 10) || 0;
      const creditType = formData?.CreditLimitType;
      if (creditType === "Days" && numValue > 365) return;
      if (creditType === "PaymentDateOfMonth" && numValue > 31) return;
      setFormData({
        ...formData,
        [name]: numValue,
      });
      return;
    }

    setFormData({
      ...formData,
      [name]: value,
    });
  };
  const handleMultiSelectChange = (name, value) => {
    clearValidationError(name);
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const getTypeName = () => {
    const btb = type?.filter((ele) => ele?.value == formData?.Type);
    if (btb[0]?.label == "B2B" || btb[0]?.label === "SUB PCC") return true;
    else return false;
  };

  const handleSelectChange = (e) => {
    const { name, value } = e.target;
    clearValidationError(name);

    if (name === "BarcodeLogic") {
      setFormData({
        ...formData,
        [name]: Number(value),
      });
      return;
    }

    if (name == "PaymentMode") {
      setFormData({
        ...formData,
        [name]: value,
        IntimationLimit: "",
        CreditLimit: 0,
        CreditLimitType: "",
        CreditLimitBase: 0,
        AgainstInvoice: "",
        IsRollingAdvance: 0,
        skipValue: "",
        skipTimeType: "",
        CreditLimitInRs: "",
        CreditLimitInTime: "",
        LockRegistration: 0,
        LockReport: 0,
        CoPaymentApplicable: 0,
      });
    } else {
      setFormData({ ...formData, [name]: value });
    }
    if (name === "BusinessZoneId") {
      GetStateWiseData(value);
    }
    if (name === "StateId") {
      GetCityData(value);
    }
  };
  const handleSelectchangeCheck = (name, value) => {
    setFormData((prev) => {
      let updated = { ...prev };

      if (name === "DispatchdocumentId") {
        updated.requiredDocumentsDispatch = value.map(id => {
          const doc = Dispatchdocument.find(d => d.value === id);

          return {
            documentID: id,
            documentName: doc?.label || ""
          };
        });
      } else {
        updated[name] = value;
      }

      return updated;
    });
  };

  const handleReactSelectChange = (name, value) => {
    clearValidationError(name);
    setFormData({ ...formData, [name]: value?.value });
    if (name === "BusinessZoneId") {
      GetStateWiseData(value?.value);
    }
    if (name === "StateId") {
      GetCityData(value?.value);
    }
    if (name === "CreditLimitType") {
      const type = value?.value;

      let updatedLimit = parseInt(formData?.CreditLimit, 10) || 0;

      if (type === "PaymentDateOfMonth" && updatedLimit >= 31) {
        updatedLimit = 30;
      }

      if (type === "Days" && updatedLimit >= 365) {
        updatedLimit = 364;
      }

      setFormData({
        ...formData,
        CreditLimitType: type,
        CreditLimit: updatedLimit,
      });
    }
  };

  const handleSearchSelectChange = (label, value) => {
    console.log("valuexx", value);

    if (
      (label === "BusinessUnit" || label === "ProcessingLab") &&
      value?.value === "Self" &&
      name == "Rate"
    ) {
      toast.error(t("You cannot select Self Please Select Other"));
      setFormData((prev) => ({ ...prev, [label]: "" }));
      return;
    }

    if (label === "fieldBodyID") {
      setFormData((prev) => ({
        ...prev,
        [label]: value?.value,
        fieldBodyName: value?.label,
      }));
    } else {
      setFormData((prev) => ({ ...prev, [label]: value?.value }));
    }
  };

  const getType = () => {
    axiosInstance
      .get("centre/getCentreType")
      .then((res) => {
        const data = res?.data?.message;
        const Type = data?.map((ele) => {
          return {
            value: ele?.id,
            label: ele?.Centretype,
          };
        });
        setType(Type);
      })
      .catch((err) => {
        toast.error(err?.res?.data ? err?.res?.data : "Something Went Wrong");
      });
  };

  const VisitTypeOptions = [
    { label: "Walkin", value: "Walkin" },
    { label: "Panel", value: "Panel" },
    { label: "B2B", value: "B2B" },
    { label: "B2D", value: "B2D" },
    { label: "Franchise", value: "Franchise" },
    { label: "Insurance", value: "Insurance" },
  ];

  const getSalesManager = () => {
    axiosInstance
      .get("Employee/ProEmployee")
      .then((res) => {
        const data = res?.data?.message;
        const Type = data?.map((ele) => {
          return {
            value: ele?.EmployeeID,
            label: ele?.EmployeeName,
          };
        });
        setSalesManager(Type);
      })
      .catch((err) => {
        toast.error(err?.res?.data ? err?.res?.data : "Something Went Wrong");
      });
  };

  const getCentersWithParams = (params) => {
    axiosInstance
      .get("Global/getGlobalBusinessUnit", { params })
      .then((res) => {
        let data = res.data.message;
        console.log("res.data.message", data);
        let centers = data.map((ele) => {
          const fullName =
            `${ele?.Centre?.trim() ? ele.Centre : ""}` +
            `${ele?.CentreId ? `${ele?.Centre?.trim() ? ", " : ""}CentreId :${ele.CentreId}` : ""}` +
            `${ele?.CentreCode?.trim() ? `, CentreCode :${ele.CentreCode}` : ""}`;
          const cleanedFullName = fullName.trim()
            ? fullName
            : `CentreId :${ele.CentreId}`;
          return {
            value: ele?.CentreId,
            label: ele?.Centre?.trim() || "",
            active: ele?.IsActive,
            fullName: cleanedFullName,
          };
        });
        setAllSearchCenters(centers);
        setSearchCenterSuggestions(centers);
      })
      .catch((err) => console.log(err));
  };

  const getRateTypeWorkOrder = async () => {
    await axiosInstance
      .post(apiUrls.BindRateTypeWorkOrder, {
        centreID: 0,
        rateTypeID: 0,
        AllowEstimate: 0,
        AllowHomeCollection: 0,
        AllowMembershipCard: 0,
      })
      .then((res) => {
        const data = res?.data?.message;
        const val = data.map((ele) => {
          return {
            value: ele?.RateTypeID,
            label: ele?.RateTypeName,
          };
        });
        setMRP([...val]);
        if (val?.length == 1) {
          setFormData((prev) => ({ ...prev, mrpRateTypeID: val?.[0]?.value }));
        }
      })
      .catch((err) => {
        console.log(err);
      })
      .finally(() => { });
  };



  const getFieldBoy = () => {
    axiosInstance
      .get("CommonController/BindEmpFieldBoy")
      .then((res) => {
        if (res.data.success) {
          const mapped = res.data.message.map((ele) => ({
            value: ele?.EmployeeID ?? ele?.FieldBoyID ?? ele?.ID,
            label: ele?.EmployeeName ?? ele?.FieldBoyName ?? ele?.Name,
          }));
          setCollectionBoyList(mapped);
        }
      })
      .catch((err) => console.log(err));
  };



  useEffect(() => {
    getSalesManager();
    getInvoiceTo();
    getCentreProcessingLab();
    getReferenceRate();
    getBarCodeLogic();
    getVisitTypeList();
    getCentreBusinessUnit();
    getDropDownData("CentreType");
    getRequiredAttachment();
    if (name === "center") getType();
    getFieldBoy();
    getRateTypeWorkOrder();
    getInsuranceMapping();
  }, [name]);

  useEffect(() => {
    if (state?.prdmConfig) {
      // setPrdmConfig(state?.prdmConfig);
    }
  }, []);

  const handleInput = (e) => {
    const value = Number(e.target.value.trim());
    const skipTimeType = formData?.skipTimeType;
    if (!/^\d+$/.test(value)) {
      return;
    }
    if (skipTimeType == "1" && (value < 0 || value > 23)) {
      return;
    }
    if (skipTimeType == "2" && (value < 0 || value > 6)) {
      return;
    }
    if (skipTimeType == "3" && (value < 0 || value > 4)) {
      return;
    }
    handleChange(e);
  };

  const handleInputChange = (e) => {
    const { value, name } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // ✅ handleReset — resets ALL fields including SPOC and Authorized Person
  const handleReset = (event) => {
    event.stopPropagation();
    setSearchCenterPayload({
      label: "",
      value: null,
      DefaultCentreId: null,
    });
    setCentreAndRateDetails({});
    setMoreErrors({});
    setStateOptions([]);
    setCityOptions([]);
    setFormData(getEmptyFormData(name));
    navigate(`/CentreMaster/${name}`, {
      replace: true,
      state: { url: "Centre/InsertCentre" },
    });
  };

  const handleBlur2 = (e) => {
    const { name, value } = e.target;
    console.log("name", name, value);
    if (!value?.trim()?.length) {
      setMoreErrors((prev) => ({
        ...prev,
        [name]: "This Field is required",
      }));
    }
  };

  useEffect(() => {
    getCentersWithParams({
      Datatype: name === "center" ? "CentreMaster" : "RateTypeMaster",
      InvoiceBillingCycle: "",
      PaymentMode: "",
      IsActive: 0,
    });
    setMoreErrors({});
  }, [name]);

  useEffect(() => {
    setSearchCenterPayload({
      label: "",
      value: null,
      DefaultCentreId: null,
    });
    setSearchCenterIndex(0);
  }, [name]);

  const showAlways = (controlId) => {
    const showAlwaysList = [
      "Centre Name",
      "SalesManager",
      "isActive",
      "PaymentMode",
      "ProEmployee",
    ];
    if (name === "Rate") {
      showAlwaysList.push("BusinessUnit");
      showAlwaysList.push("TagProcessingLab");
    }
    return showAlwaysList.includes(controlId);
  };

  const isHideController = (cntrId = "") => {
    if (showAlways(cntrId)) return true;
    if (!controllerDynamicList?.length) return true;
    const isPresent = controllerDynamicList?.find(
      (x) => x?.ControlDisplayID === cntrId,
    );
    if (isPresent?.ControlDisplayID) {
      return !!controllerDynamicList?.find(
        (x) => x?.ControlDisplayID === cntrId,
      )?.IsShow;
    }
    return true;
  };

  const isSectionVisible = (controlIds) => {
    return controlIds.some((id) => isHideController(id));
  };

  const controllerDynamic = async () => {
    // let pageID = name === "Rate" ? 15 : 13;
    const { controllersData, controllerTabbingOrder } =
      await getSearchController(PAGE_ID);
    setTabbingOrder(controllerTabbingOrder);
    setControllerDynamicList(controllersData);
    console.log("controllersData::", controllersData);
    console.log("controllerTabbingOrder::", controllerTabbingOrder);
  };


  useEffect(() => {
    controllerDynamic();
  }, [name]);

  console.log("centreAndRateDetails", centreAndRateDetails);
  console.log("formData", formData);

  return (
    <>
      {show && (
        <UploadFile
          show={show}
          handleClose={() => setShow(false)}
          documentId={formData?.centreIDHash}
          pageName={
            name === t("center") ? t("CentreMaster") : t("RateTypeMaster")
          }
        />
      )}
      {show9 && (
        <UploadFile
          show={show9}
          handleClose={() => setShow9(false)}
          documentId={formData?.centreIDHash}
          pageName={"FranchiseUploadLogo"}
        />
      )}
      {showAgrement && (
        <UploadFile
          show={showAgrement}
          handleClose={() => setShowAgrement(false)}
          documentId={formData?.centreIDHash}
          pageName={
            name === t("center") ? t("CentreMaster") : t("RateTypeMaster")
          }
        />
      )}
      {showPdf && (
        <UploadFile
          show={showPdf}
          handleClose={() => setShowPdf(false)}
          documentId={formData?.centreIDHash}
          pageName={"SamartReportLastCoverPage"}
        />
      )}

      {show1 && (
        <UploadFile
          show={show1}
          handleClose={() => setShow1(false)}
          documentId={formData?.centreIDHash}
          pageName={"centreMasterNabl"}
          CentreID={formData?.CentreID}
        />
      )}

      {show2 && (
        <UploadFile
          show={show2}
          handleClose={() => setShow2(false)}
          documentId={formData?.centreIDHash}
          pageName={"centreMasterReceipt"}
        />
      )}

      {show3 && (
        <UploadFile
          show={show3}
          handleClose={() => setShow3(false)}
          documentId={formData?.centreIDHash}
          pageName={"attachmentHeader"}
        />
      )}

      {show4 && (
        <UploadFile
          show={show4}
          handleClose={() => setShow4(false)}
          documentId={formData?.centreIDHash}
          pageName={"attachmentfooter"}
        />
      )}
      {show5 && (
        <UploadFile
          show={show5}
          handleClose={() => setShow5(false)}
          documentId={formData?.centreIDHash}
          pageName={"b2bqrcode"}
        />
      )}
      {show6 && (
        <UploadFile
          show={show6}
          handleClose={() => setShow6(false)}
          documentId={formData?.centreIDHash}
          pageName={"Stamp"}
        />
      )}
      {show7 && (
        <UploadFile
          show={show7}
          handleClose={() => setShow7(false)}
          documentId={formData?.centreIDHash}
          pageName={"AdditionalLogo"}
        />
      )}
      <WelcomeModal
        show={showWelcomeModal}
        handleClose={() => setShowWelcomeModal(false)}
        defaultEmail={selectedEmail}
      />
      <IsBillAndReportModal
        show={show8}
        setShow={setShow8}
        config={formData.IsPRDMConfiguration}
        setConfig={(updatedConfig) => {
          console.log({ updatedConfig });
          setFormData((prev) => ({
            ...prev,
            IsPRDMConfiguration: updatedConfig,
          }));
        }}
      />
      {console.log("pageId", PAGE_ID)}
      <Accordion
        name={name === t("center") ? t("CentreMaster") : t("RateTypeMaster")}
        defaultValue={true}
        isBreadcrumb={true}
        linkTo="#"
        seconTitle={
          <>
            <PageControlGear pageId={PAGE_ID} />
            {Object.keys(centreAndRateDetails).length > 0 && (
              <div
                style={{ marginRight: "auto" }}
                id="pr_id_11"
                className="link-title-container d-none d-md-flex mx-3"
              >
                <p className="mb-0">
                  <strong>Name</strong>: {centreAndRateDetails?.Title}{" "}
                  {centreAndRateDetails?.Centre}
                </p>{" "}
                |
                <p className="mb-0">
                  <strong>{name == "Rate" ? "ID" : "ID"}</strong> :{" "}
                  {centreAndRateDetails?.CentreID}
                </p>{" "}
                |
                <p className="mb-0">
                  <strong>{name == "Rate" ? "Code" : "Code"}</strong> :{" "}
                  {centreAndRateDetails?.CentreCode}
                </p>{" "}
                |
                <p className="mb-0">
                  <strong>
                    {name == "Rate" ? "Created By" : "Created By"}
                  </strong>{" "}
                  : {centreAndRateDetails?.CreatedByName}
                </p>{" "}
                |
                <p className="mb-0">
                  <strong>
                    {name == "Rate" ? "Created on" : "Created on"}
                  </strong>{" "}
                  : {centreAndRateDetails?.dtEntry}
                </p>
              </div>
            )}
            <div style={{ marginLeft: "auto" }}>
              <PageControlGear pageId={PAGE_ID} />
              <Link to={`/CentreMasterList/${name}`} style={{ fontSize: "13px" }}>
                <CustomButton
                  text={t("Back to list")}
                  icon={"back"}

                />
              </Link>
            </div>
          </>
        }
      // seconTitle={
      //   <div style={{ marginLeft: "auto" }}>

      //   </div>
      // }
      >
        <div className="row px-2 pt-2 d-md-flex align-items-center justify-content-between">
          {name === "center" && (
            <>
              <div className="col-sm-5">
                <Input
                  type="text"
                  name="SearchCenter"
                  lable="Search Any Centre For Update"
                  value={searchCenterPayload.label || ""}
                  placeholder=" "
                  onChange={handleSearchCenterChange}
                  onKeyDown={handleSearchCenterKeyDown}
                  onBlur={(e) => {
                    autocompleteOnBlur(setSearchCenterSuggestions);
                    setTimeout(() => {
                      const data = searchCenterSuggestions?.filter(
                        (ele) => ele?.label === e.target.value,
                      );
                      if (data.length === 0) {
                        setSearchCenterPayload({
                          label: "",
                          value: null,
                          DefaultCentreId: null,
                        });
                      }
                    }, 500);
                  }}
                />

                {selectSearchCenter && searchCenterSuggestions.length > 0 && (
                  <AutoComplete
                    selects={selectSearchCenter}
                    test={searchCenterSuggestions.map((item) => ({
                      TestName: item.fullName,
                      active: item.active,
                    }))}
                    handleListSearch={(selected) =>
                      handleSearchCenterSelect(
                        searchCenterSuggestions.find(
                          (item) => item.fullName === selected.TestName,
                        ),
                      )
                    }
                    indexMatch={searchCenterIndex}
                  />
                )}
              </div>
            </>
          )}
          {name === "Rate" && (
            <>
              <div className="col-sm-5">
                <Input
                  type="text"
                  name="SearchCenter"
                  lable="Search Any RateType For Update"
                  value={searchCenterPayload.label || ""}
                  placeholder=" "
                  onChange={handleSearchCenterChange}
                  onKeyDown={handleSearchCenterKeyDown}
                  onBlur={(e) => {
                    autocompleteOnBlur(setSearchCenterSuggestions);
                    setTimeout(() => {
                      const data = searchCenterSuggestions?.filter(
                        (ele) => ele?.label === e.target.value,
                      );
                      if (data.length === 0) {
                        setSearchCenterPayload({
                          label: "",
                          value: null,
                          DefaultCentreId: null,
                        });
                      }
                    }, 500);
                  }}
                />

                {selectSearchCenter && searchCenterSuggestions.length > 0 && (
                  <AutoComplete
                    selects={selectSearchCenter}
                    test={searchCenterSuggestions.map((item) => ({
                      TestName: item.fullName,
                      active: item.active,
                    }))}
                    handleListSearch={(selected) =>
                      handleSearchCenterSelect(
                        searchCenterSuggestions.find(
                          (item) => item.fullName === selected.TestName,
                        ),
                      )
                    }
                    indexMatch={searchCenterIndex}
                  />
                )}
              </div>
              {Object.keys(centreAndRateDetails).length > 0 && (
                <div>
                  <CustomButton
                    text={"Welcome Email"}
                    onClick={() => {
                      setSelectedEmail(centreAndRateDetails?.Email);
                      setShowWelcomeModal(true);
                    }}
                  />
                </div>
              )}
            </>
          )}
        </div>
        <div className="row pt-2 pl-2 pr-2">
          {/* Dynamic Ordering */}
          {controllerDynamicList
            ?.sort((a, b) => a.DisplayOrder - b.DisplayOrder)
            .map((item) => {
              // amazonq-ignore-next-line
              if (item?.ControlDisplayID === "Type") {
                return (
                  <>
                    {name === "center" && (
                      <div
                        className={`${!isHideController("Type") ? "d-none" : ""} col-sm-2 col-md-2 mb-1`}
                      >
                        <SelectBox
                          options={CentreType}
                          id="Type"
                          lable="Type"
                          onChange={handleSelectChange}
                          name="CentreType"
                          selectedValue={formData?.CentreType}
                          isDisabled={state?.data ? true : false}
                        />
                      </div>
                    )}
                  </>
                );
              }
              if (item?.ControlDisplayID == "Centre Type") {
                return (
                  <div
                    className={`${!isHideController("Centre Type") ? "d-none" : ""} col-sm-2 col-md-2 mb-1`}
                  >
                    <SelectBox
                      onChange={handleSelectChange}
                      selectedValue={formData?.CentreType}
                      className="required-fields"
                      id="CentreType"
                      lable={name == "center" ? "Centre Type" : "Rate Type"}
                      name="CentreType"
                      type="text"
                      options={
                        name == "center"
                          ? [
                            { label: "Select Centre Type", value: "" },
                            ...type,
                          ]
                          : VisitTypeOptions
                      }
                    />
                    {item?.IsMandatory === 1 && moreErrors?.["Centre Type"] && (
                      <div className="error-message">
                        {moreErrors["Centre Type"]}
                      </div>
                    )}
                  </div>
                );
              }
              if (item?.ControlDisplayID == "CentreCode") {
                return (
                  <div
                    className={`${!isHideController("CentreCode") ? "d-none" : ""} col-sm-2 col-md-2 mb-1`}
                  >
                    <Input
                      maxLength={20}
                      lable={
                        name == "center" ? "Centre Code" : "Rate Type Code"
                      }
                      id="CentreCode"
                      className="required-fields"
                      placeholder=" "
                      onChange={handleChange}
                      value={formData?.CentreCode}
                      name="CentreCode"
                    // onBlur={() => {
                    //   handleCheckDuplicate();
                    // }}
                    // onInput={(e) => number(e, 10)}
                    />
                    {moreErrors?.CentreCode && item?.IsMandatory === 1 && (
                      <div className="error-message">
                        {moreErrors.CentreCode}
                      </div>
                    )}
                  </div>
                );
              }
              if (item?.ControlDisplayID == "Centre Name") {
                return (
                  <div
                    className={`${!isHideController("Centre Name") ? "d-none" : ""} col-sm-2 col-md-2 mb-1`}
                  >
                    <Input
                      lable={
                        name == "center" ? "Centre Name" : "Rate Type Name"
                      }
                      className="required-fields"
                      id="Centre Name"
                      placeholder=" "
                      onChange={handleChange}
                      max={60}
                      value={formData?.Centre}
                      name="Centre"
                      type="text"
                    />
                    {moreErrors?.["Centre Name"] && item?.IsMandatory === 1 && (
                      <div className="error-message">
                        {moreErrors["Centre Name"]}
                      </div>
                    )}
                  </div>
                );
              }
              if (name == "center" && item?.ControlDisplayID == "GStinno") {
                return (
                  <div
                    className={`${!isHideController("GStinno") ? "d-none" : ""} col-sm-2 col-md-2 mb-1`}
                  >
                    <Input
                      lable="GSTIN No."
                      id="Gstin"
                      placeholder=" "
                      onChange={handleChange}
                      value={formData?.Gstin}
                      name="Gstin"
                      type="text"
                      max={20}
                    />
                    {item?.IsMandatory === 1 &&
                      moreErrors?.[item.ControlDisplayID] && (
                        <div className="error-message">
                          {moreErrors[item.ControlDisplayID]}
                        </div>
                      )}
                  </div>
                );
              }
              if (item?.ControlDisplayID == "BarcodeLogic") {
                return (
                  <div
                    className={`${!isHideController("BarcodeLogic") ? "d-none" : ""} col-sm-2 col-md-2 mb-1`}
                  >
                    <SelectBox
                      options={BarCodeLogic}
                      name="BarcodeLogic"
                      id="BarcodeLogic"
                      lable="BarcodeLogic"
                      selectedValue={formData?.BarcodeLogic}
                      onChange={handleSelectChange}
                    />
                    {item?.IsMandatory === 1 &&
                      moreErrors?.[item.ControlDisplayID] && (
                        <div className="error-message">
                          {moreErrors[item.ControlDisplayID]}
                        </div>
                      )}
                  </div>
                );
              }
              if (item?.ControlDisplayID == "InsuranceMapping") {
                return (
                  <div
                    className={`${!isHideController("InsuranceMapping") ? "d-none" : ""} col-sm-2 col-md-2 mb-1`}
                  >
                    <ReactSelect
                      dynamicOptions={InsuranceData}
                      name="InsuranceMapId"
                      id="InsuranceMapId"
                      placeholderName={t("InsuranceMapping")}
                      lable="InsuranceMapping"
                      value={formData?.InsuranceMapId}
                      onChange={handleSearchSelectChange}
                      //  isDisabled={state?.data ? true : false}
                      isDisabled={!!centreAndRateDetails?.CentreID}
                    />
                    {item?.IsMandatory === 1 &&
                      moreErrors?.[item.ControlDisplayID] && (
                        <div className="error-message">
                          {moreErrors[item.ControlDisplayID]}
                        </div>
                      )}
                  </div>
                );
              }
              if (item?.ControlDisplayID == "DispatchdocumentId") {
                return (
                  <div
                    className={`${!isHideController("DispatchdocumentId") ? "d-none" : ""} col-sm-2 col-md-2 mb-1`}
                  >
                    <MultiSelectComp
                      options={Dispatchdocument}
                      name="DispatchdocumentId"
                      id="DispatchdocumentId"
                      lable="DispatchdocumentId"
                      placeholder="Dispatchdocument"
                      value={formData?.requiredDocumentsDispatch.map(item => item.documentID)}
                      onChange={handleSelectchangeCheck}
                    />
                    {item?.IsMandatory === 1 &&
                      moreErrors?.[item.ControlDisplayID] && (
                        <div className="error-message">
                          {moreErrors[item.ControlDisplayID]}
                        </div>
                      )}
                  </div>
                );
              }
              if (name == "Rate" && item?.ControlDisplayID == "NablLogic") {
                return (
                  <div
                    className={`${!isHideController("NablLogic") ? "d-none" : ""} col-sm-2 col-md-2 mb-1`}
                  >
                    <SelectBox
                      options={NablLogic}
                      name="NablLogic"
                      id="NablLogic"
                      lable="NablLogic"
                      selectedValue={formData?.NablLogic}
                      onChange={handleSelectChange}
                    />
                    {item?.IsMandatory === 1 &&
                      moreErrors?.[item.ControlDisplayID] && (
                        <div className="error-message">
                          {moreErrors[item.ControlDisplayID]}
                        </div>
                      )}
                  </div>
                );
              }
              // if(name == "Rate" && item?.ControlDisplayID == "clientCategory"){
              //   return(
              //    <ReactSelect
              //         name="clientCategory"
              //         dynamicOptions={[]}
              //         placeholderName={t("clientCategory")}
              //         lable={t("clientCategory")}
              //         id="clientCategory"
              //         removeIsClearable={true}
              //         value={formData?.clientCategory}
              //         onChange={handleSearchSelectChange}
              //          respclass={"col-xl-2 col-sm-4 col-md-8 co-12"}
              //       />
              //   )

              //   }

              if (name == "Rate" && item?.ControlDisplayID == "clientCategory") {
                return (
                  <div
                    className={`${!isHideController("clientCategory") ? "d-none" : ""} col-sm-2 col-md-2 mb-1`}
                  >
                    <ReactSelect
                      name="clientCategory"
                      dynamicOptions={status}        // ✅ was empty []
                      placeholderName={t("clientCategory")}
                      lable={t("clientCategory")}
                      id="clientCategory"
                      removeIsClearable={true}
                      value={formData?.clientCategory}
                      onChange={handleSearchSelectChange}
                    />
                    {item?.IsMandatory === 1 && moreErrors?.[item.ControlDisplayID] && (
                      <div className="error-message">
                        {moreErrors[item.ControlDisplayID]}
                      </div>
                    )}
                  </div>
                );
              }

              if (name == "center" && item?.ControlDisplayID == "isActive") {
                return (
                  <div
                    className={`${!isHideController("isActive") ? "d-none" : ""} col-sm-1 mt-1 d-flex mb-3`}
                  >
                    <Form.Check
                      type="switch"
                      id="isActive"
                      name="isActive"
                      label={t("Active")}
                      onChange={handleChange}
                      checked={formData?.isActive}
                      className="m-0"
                    />
                    {item?.IsMandatory === 1 &&
                      moreErrors?.[item.ControlDisplayID] && (
                        <div className="error-message">
                          {moreErrors[item.ControlDisplayID]}
                        </div>
                      )}
                  </div>
                );
              }
              if (
                name == "center" &&
                item?.ControlDisplayID == "SampleCollectandReceive"
              ) {
                return (
                  <div
                    className={`${!isHideController("SampleCollectandReceive") ? "d-none" : ""} col-sm-2 mt-1 d-flex mb-3`}
                  >
                    <Form.Check
                      type="switch"
                      id="SampleCollectandReceive"
                      name="SampleCollectandReceive"
                      label={t("Sample Collect & Receive")}
                      onChange={handleChange}
                      checked={formData?.SampleCollectandReceive}
                      className="m-0"
                    />
                    {item?.IsMandatory === 1 &&
                      moreErrors?.[item.ControlDisplayID] && (
                        <div className="error-message">
                          {moreErrors[item.ControlDisplayID]}
                        </div>
                      )}
                  </div>
                );
              }
              if (
                name == "center" &&
                item?.ControlDisplayID == "IsTrfRequired"
              ) {
                return (
                  <div
                    className={`${!isHideController("IsTrfRequired") ? "d-none" : ""} col-sm-1 mt-1 d-flex mb-3`}
                  >
                    <Form.Check
                      type="switch"
                      id="IsTrfRequired"
                      name="IsTrfRequired"
                      label={t("IsTrfRequired")}
                      onChange={handleChange}
                      checked={formData?.IsTrfRequired}
                      className="m-0"
                    />
                    {item?.IsMandatory === 1 &&
                      moreErrors?.[item.ControlDisplayID] && (
                        <div className="error-message">
                          {moreErrors[item.ControlDisplayID]}
                        </div>
                      )}
                  </div>
                );
              }
              if (
                name == "center" &&
                item?.ControlDisplayID == "IsDepartmentSlip"
              ) {
                return (
                  <div
                    className={`${!isHideController("IsDepartmentSlip") ? "d-none" : ""} col-sm-2 mt-1 d-flex mb-3`}
                  >
                    <Form.Check
                      type="switch"
                      id="IsDepartmentSlip"
                      name="IsDepartmentSlip"
                      label={t("IsDepartmentSlip")}
                      onChange={handleChange}
                      checked={formData?.IsDepartmentSlip}
                      className="m-0"
                    />
                    {item?.IsMandatory === 1 &&
                      moreErrors?.[item.ControlDisplayID] && (
                        <div className="error-message">
                          {moreErrors[item.ControlDisplayID]}
                        </div>
                      )}
                  </div>
                );
              }
              if (
                name == "center" &&
                item?.ControlDisplayID == "IsSampleRecollection"
              ) {
                return (
                  <div
                    className={`${!isHideController("IsSampleRecollection") ? "d-none" : ""} col-sm-2 mt-1 d-flex mb-3`}
                  >
                    <Form.Check
                      type="switch"
                      id="IsSampleRecollection"
                      name="IsSampleRecollection"
                      label={t("IsSampleRecollection")}
                      onChange={handleChange}
                      checked={formData?.IsSampleRecollection}
                      className="m-0"
                    />
                    {item?.IsMandatory === 1 &&
                      moreErrors?.[item.ControlDisplayID] && (
                        <div className="error-message">
                          {moreErrors[item.ControlDisplayID]}
                        </div>
                      )}
                  </div>
                );
              }
              if (name == "center" && item?.ControlDisplayID == "HideReceipt") {
                return (
                  <div
                    className={`${!isHideController("HideReceipt") ? "d-none" : ""} col-sm-1 mt-1 d-flex mb-3`}
                  >
                    <Form.Check
                      type="switch"
                      id="HideReceipt"
                      name="HideReceipt"
                      label={t("HideReceipt")}
                      onChange={handleChange}
                      checked={formData?.HideReceipt}
                      className="m-0"
                    />
                    {item?.IsMandatory === 1 &&
                      moreErrors?.[item.ControlDisplayID] && (
                        <div className="error-message">
                          {moreErrors[item.ControlDisplayID]}
                        </div>
                      )}
                  </div>
                );
              }
              if (
                name == "center" &&
                item?.ControlDisplayID == "IsDoctorShareRequired"
              ) {
                return (
                  <div
                    className={`${!isHideController("IsDoctorShareRequired") ? "d-none" : ""} col-sm-2 mt-1 d-flex mb-3`}
                  >
                    <Form.Check
                      type="switch"
                      id="IsDoctorShareRequired"
                      name="IsDoctorShareRequired"
                      label={t("IsDoctorShareRequired")}
                      onChange={handleChange}
                      checked={formData?.IsDoctorShareRequired}
                      className="m-0"
                    />
                    {item?.IsMandatory === 1 &&
                      moreErrors?.[item.ControlDisplayID] && (
                        <div className="error-message">
                          {moreErrors[item.ControlDisplayID]}
                        </div>
                      )}
                  </div>
                );
              }
              if (name == "center" && item?.ControlDisplayID == "FullyPaid") {
                return (
                  <div
                    className={`${!isHideController("FullyPaid") ? "d-none" : ""} col-sm-1 mt-1 d-flex mb-3`}
                  >
                    <Form.Check
                      type="switch"
                      id="FullyPaid"
                      name="FullyPaid"
                      label={t("FullyPaid")}
                      onChange={handleChange}
                      checked={formData?.FullyPaid}
                      className="m-0"
                    />
                    {item?.IsMandatory === 1 &&
                      moreErrors?.[item.ControlDisplayID] && (
                        <div className="error-message">
                          {moreErrors[item.ControlDisplayID]}
                        </div>
                      )}
                  </div>
                );
              }
              if (name == "center" && item?.ControlDisplayID == "SetMRP") {
                return (
                  <div
                    className={`${!isHideController("SetMRP") ? "d-none" : ""} col-sm-2 col-md-auto mt-1 d-flex mb-3`}
                  >
                    <Form.Check
                      type="switch"
                      id="SetMRP"
                      name="SetMRP"
                      label={t("Show MRP Booking")}
                      onChange={handleChange}
                      checked={formData?.SetMRP}
                      className="m-0"
                    />
                    {item?.IsMandatory === 1 &&
                      moreErrors?.[item.ControlDisplayID] && (
                        <div className="error-message">
                          {moreErrors[item.ControlDisplayID]}
                        </div>
                      )}
                  </div>
                );
              }
              if (
                name == "center" &&
                item?.ControlDisplayID == "btnUpload_cenre"
              ) {
                return (
                  <div
                    className={`${!isHideController("btnUpload_cenre") ? "d-none" : ""} col-sm-2 col-md-auto mb-1`}
                  >
                    <CustomButton
                      id="btnUpload_cenre"
                      text={"Upload LetterHead"}
                      onClick={() => setShow(true)}
                    />
                  </div>
                );
              }
              if (
                name == "center" &&
                item?.ControlDisplayID == "UploadAttHeader_centre"
              ) {
                return (
                  <div
                    className={`${!isHideController("UploadAttHeader_centre") ? "d-none" : ""} col-sm-2 col-md-auto mb-1`}
                  >
                    <CustomButton
                      id="UploadAttHeader_centre"
                      text={"Upload Att Header"}
                      onClick={() => setShow3(true)}
                    />
                  </div>
                );
              }
              if (
                name == "center" &&
                item?.ControlDisplayID == "UploadAttFooter_centre"
              ) {
                return (
                  <div
                    className={`${!isHideController("UploadAttFooter_centre") ? "d-none" : ""} col-sm-2 col-md-auto mb-1`}
                  >
                    <CustomButton
                      id="UploadAttFooter_centre"
                      text={"Upload Att Footer"}
                      onClick={() => setShow4(true)}
                    />
                  </div>
                );
              }
              if (
                name == "center" &&
                item?.ControlDisplayID == "UploadStamp_centre"
              ) {
                return (
                  <div
                    className={`${!isHideController("UploadStamp_centre") ? "d-none" : ""} col-sm-2 col-md-auto mb-1`}
                  >
                    <CustomButton
                      id="UploadStamp_centre"
                      text={"Upload Stamp"}
                      onClick={() => setShow6(true)}
                    />
                  </div>
                );
              }
              if (
                name == "center" &&
                item?.ControlDisplayID == "UploadQRCode_centre"
              ) {
                return (
                  <div
                    className={`${!isHideController("UploadQRCode_centre") ? "d-none" : ""} col-sm-2 col-md-auto mb-1`}
                  >
                    <CustomButton
                      id="UploadQRCode_centre"
                      text={"Upload QR Code"}
                      onClick={() => setShow5(true)}
                      disabled={getTypeName() ? false : true}
                    />
                  </div>
                );
              }
              if (
                name == "center" &&
                item?.ControlDisplayID == "UploadAdditionalLogo_centre"
              ) {
                return (
                  <div
                    className={`${!isHideController("UploadAdditionalLogo_centre") ? "d-none" : ""} col-sm-2 col-md-auto mb-1`}
                  >
                    <CustomButton
                      id="UploadAdditionalLogo_centre"
                      text={"Upload Additional Logo"}
                      onClick={() => setShow7(true)}
                    />
                  </div>
                );
              }
              if (
                name == "center" &&
                item?.ControlDisplayID == "UploadisNabl_centre"
              ) {
                return (
                  <div
                    className={`${!isHideController("UploadisNabl_centre") ? "d-none" : ""} col-sm-2 col-md-auto mb-1`}
                  >
                    <CustomButton
                      id="UploadisNabl_centre"
                      text={"Upload isNabl"}
                      onClick={() => setShow1(true)}
                      disabled={
                        state == null || state?.url === "Centre/InsertCentre"
                      }
                    />
                  </div>
                );
              }
              if (
                name == "center" &&
                item?.ControlDisplayID == "Advd.FirstPage"
              ) {
                return (
                  <>
                    <div className={`col-sm-2 col-md-auto mb-1`}>
                      <CustomButton
                        type="button"
                        id="Advd.FirstPage"
                        onClick={() => setShowPdf(true)}
                        text={t("Advd. Last Page")}
                      />
                    </div>
                  </>
                );
              }
              if (item?.ControlDisplayID == "Address1") {
                return (
                  <div
                    className={`${!isHideController("Address1") ? "d-none" : ""} col-sm-2 col-md-2 mb-1`}
                  >
                    <Input
                      lable="Address1"
                      id="Address1"
                      onChange={handleChange}
                      value={formData?.Address1}
                      name="Address1"
                      type="text"
                      placeholder=" "
                      max={50}
                    />
                    {item?.IsMandatory === 1 &&
                      moreErrors?.[item.ControlDisplayID] && (
                        <div className="error-message">
                          {moreErrors[item.ControlDisplayID]}
                        </div>
                      )}
                  </div>
                );
              }
              if (item?.ControlDisplayID == "Email") {
                return (
                  <div
                    className={`${!isHideController("Email") ? "d-none" : ""} col-sm-2 mb-1`}
                  >
                    <div className="input-with-icon w-100">
                      <Input
                        lable="Email(Report)"
                        id="Email"
                        placeholder=" "
                        onChange={handleChange}
                        value={formData?.Email}
                        name="Email"
                        type="email"
                        max={50}
                      />
                      <span>
                        <FaEye
                          onClick={() =>
                            checkEmailPhoneRegistration(
                              "Email",
                              formData?.Email,
                            )
                          }
                        />
                      </span>
                    </div>

                    {moreErrors?.[item.ControlDisplayID] &&
                      item?.IsMandatory === 1 && (
                        <div className="error-message">
                          {moreErrors[item.ControlDisplayID]}
                        </div>
                      )}
                  </div>
                );
              }
              if (item?.ControlDisplayID == "Phone") {
                return (
                  <div
                    className={`${!isHideController("Phone") ? "d-none" : ""} col-sm-2 mb-1`}
                  >
                    <div className="input-with-icon w-100">
                      <Input
                        lable="Phone"
                        id="Phone"
                        placeholder=" "
                        onInput={(e) => number(e, 12)}
                        type="number"
                        onChange={handleChange}
                        value={formData?.Phone}
                        name="Phone"
                      />
                      <span>
                        <FaEye
                          onClick={() =>
                            checkEmailPhoneRegistration(
                              "Phone",
                              formData?.Phone,
                            )
                          }
                        />
                      </span>
                    </div>

                    {moreErrors?.[item.ControlDisplayID] &&
                      item?.IsMandatory === 1 && (
                        <div className="error-message">
                          {moreErrors[item.ControlDisplayID]}
                        </div>
                      )}
                  </div>
                );
              }

              if (item?.ControlDisplayID == "LandLineNo") {
                return (
                  <div
                    className={`${!isHideController("LandLineNo") ? "d-none" : ""} col-sm-2 col-md-2 mb-1`}
                  >
                    <Input
                      lable="LandLineNo"
                      id="LandLineNo"
                      placeholder=" "
                      onInput={(e) => number(e, 12)}
                      type="number"
                      onChange={handleChange}
                      value={formData?.LandLineNo}
                      name="LandLineNo"
                    />
                    {item?.IsMandatory === 1 &&
                      moreErrors?.[item.ControlDisplayID] && (
                        <div className="error-message">
                          {moreErrors[item.ControlDisplayID]}
                        </div>
                      )}
                  </div>
                );
              }
              if (item?.ControlDisplayID == "Website") {
                return (
                  <div
                    className={`${!isHideController("Website") ? "d-none" : ""} col-sm-2 col-md-2 mb-1`}
                  >
                    <Input
                      lable="Website"
                      id="Website"
                      placeholder=" "
                      onChange={handleChange}
                      name="Url"
                      value={formData?.Url}
                      type="text"
                      max={50}
                    />
                    {item?.IsMandatory === 1 &&
                      moreErrors?.[item.ControlDisplayID] && (
                        <div className="error-message">
                          {moreErrors[item.ControlDisplayID]}
                        </div>
                      )}
                  </div>
                );
              }
              if (item?.ControlDisplayID == "Fax") {
                return (
                  <div
                    className={`${!isHideController("Fax") ? "d-none" : ""} col-sm-2 col-md-2 mb-1`}
                  >
                    <Input
                      lable="Fax"
                      id="Fax"
                      placeholder=" "
                      onChange={handleChange}
                      value={formData?.Fax}
                      name="Fax"
                      type="text"
                      onInput={(e) => number(e, 20)}
                    />
                    {item?.IsMandatory === 1 &&
                      moreErrors?.[item.ControlDisplayID] && (
                        <div className="error-message">
                          {moreErrors[item.ControlDisplayID]}
                        </div>
                      )}
                  </div>
                );
              }
              if (name === "Rate" && item?.ControlDisplayID == "PANNo") {
                return (
                  <div
                    className={`${!isHideController("PANNo") ? "d-none" : ""} col-sm-2 col-md-2 mb-1`}
                  >
                    <Input
                      lable="PAN No"
                      placeholder=" "
                      type="text"
                      id={"PANNo"}
                      onChange={handleChange}
                      value={formData?.PANNo}
                      name="PANNo"
                      maxLength={10}
                    />
                    {moreErrors?.[item.ControlDisplayID] &&
                      item?.IsMandatory === 1 && (
                        <div className="error-message">
                          {moreErrors[item.ControlDisplayID]}
                        </div>
                      )}
                  </div>
                );
              }
              if (name === "Rate" && item?.ControlDisplayID == "aadharCardNo") {
                return (
                  <div
                    className={`${!isHideController("aadharCardNo") ? "d-none" : ""} col-sm-2 col-md-2 mb-1`}
                  >
                    <Input
                      lable="Aadhar Card No"
                      id="aadharCardNo"
                      placeholder=" "
                      onInput={(e) => number(e, 12)}
                      type="text"
                      onChange={handleChange}
                      value={formData?.aadharCardNo}
                      name="aadharCardNo"
                    />
                    {moreErrors?.[item.ControlDisplayID] &&
                      item?.IsMandatory === 1 && (
                        <div className="error-message">
                          {moreErrors[item.ControlDisplayID]}
                        </div>
                      )}
                  </div>
                );
              }

              if (name == "Rate" && item?.ControlDisplayID == "tinno") {
                return (
                  <div
                    className={`${!isHideController("tinno") ? "d-none" : ""} col-sm-2 col-md-2 mb-1`}
                  >
                    <Input
                      lable="TIN No"
                      id="tinno"
                      placeholder=" "
                      type="text"
                      onChange={handleChange}
                      value={formData?.tinno}
                      name="tinno"
                      maxLength={10}
                    />
                    {moreErrors?.[item.ControlDisplayID] &&
                      item?.IsMandatory === 1 && (
                        <div className="error-message">
                          {moreErrors[item.ControlDisplayID]}
                        </div>
                      )}
                  </div>
                );
              }
              if (
                name == "Rate" &&
                item?.ControlDisplayID == "udyamCertificateNo"
              ) {
                return (
                  <div
                    className={`${!isHideController("udyamCertificateNo") ? "d-none" : ""} col-sm-2 col-md-2 mb-1`}
                  >
                    <Input
                      lable="Udyam Certificate No"
                      id="udyamCertificateNo"
                      placeholder=" "
                      type="text"
                      onChange={handleChange}
                      value={formData?.udyamCertificateNo}
                      name="udyamCertificateNo"
                      maxLength={16}
                    />
                    {moreErrors?.[item.ControlDisplayID] &&
                      item?.IsMandatory === 1 && (
                        <div className="error-message">
                          {moreErrors[item.ControlDisplayID]}
                        </div>
                      )}
                  </div>
                );
              }
              if (name == "Rate" && item?.ControlDisplayID == "VisitType") {
                return (
                  <div
                    className={`${!isHideController("VisitType") ? "d-none" : ""} col-sm-2 col-md-2 mb-1`}
                  >
                    <SelectBox
                      options={VisitType}
                      name="VisitType"
                      id="VisitType"
                      lable="VisitType"
                      selectedValue={formData?.VisitType}
                      onChange={handleSelectChange}
                    />
                    {item?.IsMandatory === 1 &&
                      moreErrors?.[item.ControlDisplayID] && (
                        <div className="error-message">
                          {moreErrors[item.ControlDisplayID]}
                        </div>
                      )}
                  </div>
                );
              }
              if (name === "Rate" && item?.ControlDisplayID == "PaymentMode") {
                return (
                  <div
                    className={`${!isHideController("PaymentMode") ? "d-none" : ""} col-sm-2 col-md-2 mb-1`}
                  >
                    <SelectBox
                      options={
                        PaymentModeData?.length > 0
                          ? PaymentModeData
                          : PaymentMode
                      }
                      name="PaymentMode"
                      id="PaymentMode"
                      lable="PaymentMode"
                      selectedValue={formData?.PaymentMode}
                      onChange={handleSelectChange}
                      isDisabled={state?.data ? true : false}
                    />
                    {item?.IsMandatory === 1 &&
                      moreErrors?.[item.ControlDisplayID] && (
                        <div className="error-message">
                          {moreErrors[item.ControlDisplayID]}
                        </div>
                      )}
                  </div>
                );
              }
              if (name === "Rate" && item?.ControlDisplayID == "CreditLimitType") {
                return (
                  <div
                    className={`${!isHideController("CreditLimitType") ? "d-none" : ""} col-sm-2 col-md-2 mb-1`}
                  >
                    <ReactSelect
                      dynamicOptions={CreditLimitType}
                      value={formData?.CreditLimitType}
                      name="CreditLimitType"
                      removeIsClearable={true}
                      placeholderName="CreditLimitType"
                      onChange={handleReactSelectChange}
                      isDisabled={formData?.PaymentMode === "Cash"}
                    />
                    {item?.IsMandatory === 1 &&
                      moreErrors?.[item.ControlDisplayID] && (
                        <div className="error-message">
                          {moreErrors[item.ControlDisplayID]}
                        </div>
                      )}
                  </div>
                );
              }
              if (name === "Rate" && item?.ControlDisplayID == "CreditLimit") {
                return (
                  <div
                    className={`${!isHideController("CreditLimit") ? "d-none" : ""} col-sm-2 col-md-2 mb-1`}
                  >
                    <Input
                      placeholder=" "
                      lable="CreditLimit"
                      id="CreditLimit"
                      type="number"
                      value={formData?.CreditLimit || ""}
                      name="CreditLimit"
                      onChange={handleChange}
                      onInput={(e) => {
                        const selected = CreditLimitType.find(
                          (opt) => opt.value === formData?.CreditLimitType
                        );
                        number(e, selected?.max || 999);
                      }}
                      disabled={formData?.PaymentMode === "Cash"}

                    />
                    {item?.IsMandatory === 1 &&
                      moreErrors?.[item.ControlDisplayID] && (
                        <div className="error-message">
                          {moreErrors[item.ControlDisplayID]}
                        </div>
                      )}
                  </div>
                );
              }
              if (
                name === "Rate" &&
                item?.ControlDisplayID == "CreditLimitBase"
              ) {
                return (
                  <div
                    className={`${!isHideController("CreditLimitBase") ? "d-none" : ""} col-sm-2 col-md-2 mb-1`}
                  >
                    <Input
                      placeholder=" "
                      lable="CreditLimitBase"
                      id="CreditLimitBase"
                      type="number"
                      value={formData?.CreditLimitBase}
                      name="CreditLimitBase"
                      onChange={handleChange}
                      disabled={formData?.PaymentMode === "Cash"}
                    />
                    {item?.IsMandatory === 1 &&
                      moreErrors?.[item.ControlDisplayID] && (
                        <div className="error-message">
                          {moreErrors[item.ControlDisplayID]}
                        </div>
                      )}
                  </div>
                );
              }
              if (
                name === "Rate" &&
                item?.ControlDisplayID == "IntimationLimit"
              ) {
                return (
                  <div
                    className={`${!isHideController("IntimationLimit") ? "d-none" : ""} col-sm-2 col-md-2 mb-1`}
                  >
                    <Input
                      placeholder=" "
                      lable="IntimationLimit"
                      id="IntimationLimit"
                      type="number"
                      value={formData?.IntimationLimit}
                      name="IntimationLimit"
                      onChange={handleChange}
                      max={30}
                      onInput={(e) => number(e, 30)}
                      disabled={formData?.PaymentMode === "Cash"}
                    />
                    {item?.IsMandatory === 1 &&
                      moreErrors?.[item.ControlDisplayID] && (
                        <div className="error-message">
                          {moreErrors[item.ControlDisplayID]}
                        </div>
                      )}
                  </div>
                );
              }


              if (name === "Rate" && item?.ControlDisplayID == "isManualDiscountApply") {
                return (
                  <div
                    className={`${!isHideController("isManualDiscountApply") ? "d-none" : ""} col-sm-2 col-md-2 mb-1`}
                  >
                    <Form.Check
                      type="switch"
                      id="isManualDiscountApply"
                      name="isManualDiscountApply"
                      label={t("isManualDiscountApply")}
                      onChange={handleChange}
                      checked={formData?.isManualDiscountApply}
                    />
                    {item?.IsMandatory === 1 &&
                      moreErrors?.[item.ControlDisplayID] && (
                        <div className="error-message">
                          {moreErrors[item.ControlDisplayID]}
                        </div>
                      )}
                  </div>
                );
              }


              if (name === "Rate" && item?.ControlDisplayID == "HideAmount") {
                return (
                  <div
                    className={`${!isHideController("HideAmount") ? "d-none" : ""} col-sm-2 col-md-2 mb-1`}
                  >
                    <Form.Check
                      type="switch"
                      id="HideAmount"
                      name="HideAmount"
                      label={t("HideAmount")}
                      onChange={handleChange}
                      checked={formData?.HideAmount}
                    />
                    {item?.IsMandatory === 1 &&
                      moreErrors?.[item.ControlDisplayID] && (
                        <div className="error-message">
                          {moreErrors[item.ControlDisplayID]}
                        </div>
                      )}
                  </div>
                );
              }
              if (
                name === "Rate" &&
                item?.ControlDisplayID == "LockRegistration"
              ) {
                return (
                  <div
                    className={`${!isHideController("LockRegistration") ? "d-none" : ""} col-sm-2 mb-3`}
                  >
                    <Form.Check
                      type="switch"
                      id="LockRegistration"
                      name="LockRegistration"
                      label={t("LockRegistration")}
                      checked={formData?.LockRegistration === 0 ? false : true}
                      onChange={handleChange}
                    />
                    {item?.IsMandatory === 1 &&
                      moreErrors?.[item.ControlDisplayID] && (
                        <div className="error-message">
                          {moreErrors[item.ControlDisplayID]}
                        </div>
                      )}
                  </div>
                );
              }
              if (name === "Rate" && item?.ControlDisplayID == "LockReport") {
                return (
                  <div
                    className={`${!isHideController("LockReport") ? "d-none" : ""} col-sm-2 mb-3`}
                  >
                    <Form.Check
                      type="switch"
                      id="LockReport"
                      name="LockReport"
                      label={t("LockReport")}
                      checked={formData?.LockReport === 0 ? false : true}
                      onChange={handleChange}
                    />
                    {item?.IsMandatory === 1 &&
                      moreErrors?.[item.ControlDisplayID] && (
                        <div className="error-message">
                          {moreErrors[item.ControlDisplayID]}
                        </div>
                      )}
                  </div>
                );
              }
              if (
                name === "Rate" &&
                item?.ControlDisplayID == "forcelyBookingLock"
              ) {
                return (
                  <div
                    className={`${!isHideController("forcelyBookingLock") ? "d-none" : ""} col-sm-2 mb-3`}
                  >
                    <Form.Check
                      type="switch"
                      id="forcelyBookingLock"
                      name="forcelyBookingLock"
                      label={t("Forcely Booking Lock")}
                      checked={Boolean(formData?.forcelyBookingLock)}
                      onChange={handleChange}
                    />
                    {item?.IsMandatory === 1 &&
                      moreErrors?.[item.ControlDisplayID] && (
                        <div className="error-message">
                          {moreErrors[item.ControlDisplayID]}
                        </div>
                      )}
                  </div>
                );
              }
              if (
                name === "Rate" &&
                item?.ControlDisplayID == "forcelyReportingLock"
              ) {
                return (
                  <div
                    className={`${!isHideController("forcelyReportingLock") ? "d-none" : ""} col-sm-2 mb-3`}
                  >
                    <Form.Check
                      type="switch"
                      id="forcelyReportingLock"
                      name="forcelyReportingLock"
                      label={t("Forcely Reporting lock")}
                      checked={Boolean(formData?.forcelyReportingLock)}
                      onChange={handleChange}
                    />
                    {item?.IsMandatory === 1 &&
                      moreErrors?.[item.ControlDisplayID] && (
                        <div className="error-message">
                          {moreErrors[item.ControlDisplayID]}
                        </div>
                      )}
                  </div>
                );
              }
              if (name === "Rate" && item?.ControlDisplayID == "isAutoEmail") {
                return (
                  <>
                    {HidePRDM != 1 && (
                      <div
                        className={`${!isHideController("LockReport") ? "d-none" : ""} col-sm-2 col-md-2 mb-1`}
                      >
                        <Form.Check
                          type="switch"
                          id="isAutoEmail"
                          name="isAutoEmail"
                          label={t("isAutoEmail")}
                          onChange={handleChange}
                          checked={formData?.isAutoEmail === 0 ? false : true}
                        />
                      </div>
                    )}
                  </>
                );
              }
              if (name == "center" && item?.ControlDisplayID == "Gstin") {
                return (
                  <div
                    className={`${!isHideController("Gstin") ? "d-none" : ""} col-sm-2 col-md-2 mb-1`}
                  >
                    <Input
                      lable="GSTIN No."
                      id="GGstin"
                      placeholder=" "
                      onChange={handleChange}
                      value={formData?.Gstin}
                      name="Gstin"
                      type="text"
                      max={20}
                    />
                    {item?.IsMandatory === 1 &&
                      moreErrors?.[item.ControlDisplayID] && (
                        <div className="error-message">
                          {moreErrors[item.ControlDisplayID]}
                        </div>
                      )}
                  </div>
                );
              }
              if (
                name === "Rate" &&
                item?.ControlDisplayID == "AgainstInvoice"
              ) {
                return (
                  <div
                    className={`${!isHideController("AgainstInvoice") ? "d-none" : ""} col-sm-2 col-md-2 mb-1`}
                  >
                    <SelectBox
                      options={AgainstInvoice}
                      name="AgainstInvoice"
                      id="AgainstInvoice"
                      lable="AgainstInvoice"
                      selectedValue={formData?.AgainstInvoice}
                      onChange={handleSelectChange}
                    />
                    {item?.IsMandatory === 1 &&
                      moreErrors?.[item.ControlDisplayID] && (
                        <div className="error-message">
                          {moreErrors[item.ControlDisplayID]}
                        </div>
                      )}
                  </div>
                );
              }
              if (
                name === "Rate" &&
                item?.ControlDisplayID == "InvoiceDisplayName"
              ) {
                return (
                  <div
                    className={`${!isHideController("InvoiceDisplayName") ? "d-none" : ""} col-sm-2 col-md-2 mb-1`}
                  >
                    <Input
                      placeholder=" "
                      lable="InvoiceDisplayName"
                      id="InvoiceDisplayName"
                      type="text"
                      value={formData?.InvoiceDisplayName}
                      name="InvoiceDisplayName"
                      onChange={handleChange}
                      max={30}
                    />
                    {item?.IsMandatory === 1 &&
                      moreErrors?.[item.ControlDisplayID] && (
                        <div className="error-message">
                          {moreErrors[item.ControlDisplayID]}
                        </div>
                      )}
                  </div>
                );
              }
              if (name == "Rate" && item?.ControlDisplayID == "InvoiceEmail") {
                return (
                  <div
                    className={`${!isHideController("InvoiceEmail") ? "d-none" : ""} col-sm-2 col-md-2 mb-1`}
                  >
                    <Input
                      placeholder=" "
                      lable="Email(Invoice)"
                      id="InvoiceEmail"
                      value={formData?.InvoiceEmail}
                      name="InvoiceEmail"
                      onChange={handleChange}
                      type="email"
                      max={50}
                    />
                    {moreErrors?.[item.ControlDisplayID] &&
                      item?.IsMandatory === 1 && (
                        <div className="error-message">
                          {moreErrors[item.ControlDisplayID]}
                        </div>
                      )}
                  </div>
                );
              }
              if (name == "Rate" && item?.ControlDisplayID == "SalesManager") {
                return (
                  <div
                    className={`${!isHideController("SalesManager") ? "d-none" : ""} col-sm-2 col-md-2 mb-1`}
                  >
                    <SelectBox
                      options={[
                        { label: t("Select Sales Manager"), value: "" },
                        ...salesManager,
                      ]}
                      id="ProEmployee"
                      lable="ProEmployee"
                      selectedValue={formData?.ProEmployee}
                      name="ProEmployee"
                      onChange={handleChange}
                    />
                    {item?.IsMandatory === 1 &&
                      moreErrors?.[item.ControlDisplayID] && (
                        <div className="error-message">
                          {moreErrors[item.ControlDisplayID]}
                        </div>
                      )}
                  </div>
                );
              }
              if (name == "Rate" && item?.ControlDisplayID == "FieldBoy") {
                return (
                  <div
                    className={`${!isHideController("FieldBoy") ? "d-none" : ""} col-sm-2 col-md-2 mb-1`}
                  >
                    <ReactSelect
                      name="fieldBodyID"
                      dynamicOptions={[
                        { label: t("Select Field Boy"), value: "" },
                        ...collectionBoyList,
                      ]}
                      placeholderName={t("Field Boy")}
                      lable={t("Field Boy")}
                      id="fieldBodyID"
                      removeIsClearable={true}
                      value={formData?.fieldBodyID}
                      onChange={handleSearchSelectChange}
                    />
                    {item?.IsMandatory === 1 &&
                      moreErrors?.[item.ControlDisplayID] && (
                        <div className="error-message">
                          {moreErrors[item.ControlDisplayID]}
                        </div>
                      )}
                  </div>
                );
              }
              if (name == "Rate" && item?.ControlDisplayID == "BillingCycle") {
                return (
                  <div
                    className={`${!isHideController("BillingCycle") ? "d-none" : ""} col-sm-2 col-md-2 mb-1`}
                  >
                    <ReactSelect
                      name="BillingCycle"
                      dynamicOptions={[...BillingCycle]}
                      placeholderName={t("Invoice Billing Cycle")}
                      lable={t("Invoice Billing Cycle")}
                      id="BillingCycle"
                      removeIsClearable={true}
                      value={formData?.BillingCycle}
                      onChange={handleSearchSelectChange}
                    />
                    {item?.IsMandatory === 1 &&
                      moreErrors?.[item.ControlDisplayID] && (
                        <div className="error-message">
                          {moreErrors[item.ControlDisplayID]}
                        </div>
                      )}
                  </div>
                );
              }
              if (
                name == "Rate" &&
                item?.ControlDisplayID == "SampleCollectionType"
              ) {
                return (
                  <div
                    className={`${!isHideController("SampleCollectionType") ? "d-none" : ""} col-sm-2 col-md-2 mb-1`}
                  >
                    <ReactSelect
                      name="SampleCollectionType"
                      dynamicOptions={[...AutoSampleCollectionList]}
                      placeholderName={t("Sample Collection")}
                      lable={t("Sample Collection")}
                      id="SampleCollectionType"
                      removeIsClearable={true}
                      value={formData?.SampleCollectionType}
                      onChange={handleSearchSelectChange}
                    />
                    {item?.IsMandatory === 1 &&
                      moreErrors?.[item.ControlDisplayID] && (
                        <div className="error-message">
                          {moreErrors[item.ControlDisplayID]}
                        </div>
                      )}
                  </div>
                );
              }
              if (name == "Rate" && item?.ControlDisplayID == "IsUrgent") {
                return (
                  <div
                    className={`${!isHideController("IsUrgent") ? "d-none" : ""} col-sm-2 col-md-2 mb-1`}
                  >
                    <Form.Check
                      type="switch"
                      id="IsUrgent"
                      name="IsUrgent"
                      label={t("Is Urgent")}
                      onChange={handleChange}
                      checked={formData?.IsUrgent}
                    />
                    {item?.IsMandatory === 1 &&
                      moreErrors?.[item.ControlDisplayID] && (
                        <div className="error-message">
                          {moreErrors[item.ControlDisplayID]}
                        </div>
                      )}
                  </div>
                );
              }
              if (name == "Rate" && item?.ControlDisplayID == "MRP") {
                return (
                  <div
                    className={`${!isHideController("MRP") ? "d-none" : ""} col-sm-2 col-md-2 mb-1`}
                  >
                    <ReactSelect
                      name="mrpRateTypeID"
                      dynamicOptions={[
                        { label: t("Select MRP"), value: "" },
                        ...ReferenceRate,
                      ]}
                      placeholderName={t("MRP")}
                      lable={t("MRP")}
                      id="mrpRateTypeID"
                      removeIsClearable={true}
                      value={formData?.mrpRateTypeID}
                      onChange={handleSearchSelectChange}
                    />
                    {item?.IsMandatory === 1 &&
                      moreErrors?.[item.ControlDisplayID] && (
                        <div className="error-message">
                          {moreErrors[item.ControlDisplayID]}
                        </div>
                      )}
                  </div>
                );
              }

              if (name == "Rate" && item?.ControlDisplayID == "CreditDays") {
                return (
                  <div
                    className={`${!isHideController("CreditDays") ? "d-none" : ""} col-sm-2 col-md-2 mb-1`}
                  >
                    <Input
                      lable="Credit Days"
                      className="required-fields"
                      id="creditDays"
                      placeholder=" "
                      onChange={handleChange}
                      max={30}
                      value={formData?.creditDays}
                      name="creditDays"
                      type="text"
                    />
                    {moreErrors?.[item.ControlDisplayID] &&
                      item?.IsMandatory === 1 && (
                        <div className="error-message">
                          {moreErrors[item.ControlDisplayID]}
                        </div>
                      )}
                  </div>
                );
              }
              if (name == "Rate" && item?.ControlDisplayID == "ContractFrom") {
                return (
                  <div
                    className={`${!isHideController("ContractFrom") ? "d-none" : ""} col-sm-2 col-md-2 mb-1`}
                  >
                    <DatePicker
                      className="custom-calendar"
                      name="contractFromDate"
                      value={formData?.contractFromDate}
                      onChange={dateSelect}
                      placeholder=" "
                      id="contractFromDate"
                      lable="Contract From"
                    />
                    {item?.IsMandatory === 1 &&
                      moreErrors?.[item.ControlDisplayID] && (
                        <div className="error-message">
                          {moreErrors[item.ControlDisplayID]}
                        </div>
                      )}
                  </div>
                );
              }
              if (name == "Rate" && item?.ControlDisplayID == "ContractTo") {
                return (
                  <>
                    <div
                      className={`${!isHideController("ContractTo") ? "d-none" : ""} col-sm-2 col-md-2 mb-1`}
                    >
                      <DatePicker
                        className="custom-calendar"
                        name="contractToDate"
                        value={formData?.contractToDate}
                        onChange={dateSelect}
                        placeholder=" "
                        id="contractToDate"
                        lable="Contract To"
                        minDate={formData?.contractFromDate}
                      />
                      {item?.IsMandatory === 1 &&
                        moreErrors?.[item.ControlDisplayID] && (
                          <div className="error-message">
                            {moreErrors[item.ControlDisplayID]}
                          </div>
                        )}
                    </div>
                  </>
                );
              }

              if (name == "Rate" && item?.ControlDisplayID == "IsAutoPRDM") {
                return (
                  <>
                    {HidePRDM != 1 && (
                      <div
                        className={`${!isHideController("IsAutoPRDM") ? "d-none" : ""} col-sm-2 col-md-2 mb-1`}
                      >
                        <Form.Check
                          type="switch"
                          id="IsAutoPRDM"
                          name="IsAutoPRDM"
                          label={t("IsAutoPRDM")}
                          onChange={handleChange}
                          checked={formData?.IsAutoPRDM}
                          className="m-0"
                        />
                        {item?.IsMandatory === 1 &&
                          moreErrors?.[item.ControlDisplayID] && (
                            <div className="error-message">
                              {moreErrors[item.ControlDisplayID]}
                            </div>
                          )}
                      </div>
                    )}
                  </>
                );
              }
              if (name == "Rate" && item?.ControlDisplayID == "Gstin") {
                return (
                  <div
                    className={`${!isHideController("Gstin") ? "d-none" : ""} col-sm-2 col-md-2 mb-1`}
                  >
                    <Input
                      lable="GSTIN No."
                      id="Gstin"
                      placeholder=" "
                      onChange={handleChange}
                      value={formData?.Gstin}
                      name="Gstin"
                      type="text"
                      max={20}
                    />
                    {item?.IsMandatory === 1 &&
                      moreErrors?.[item.ControlDisplayID] && (
                        <div className="error-message">
                          {moreErrors[item.ControlDisplayID]}
                        </div>
                      )}
                  </div>
                );
              }
              if (
                name == "Rate" &&
                item?.ControlDisplayID == "Skip Time Type"
              ) {
                return (
                  <>
                    {formData?.PaymentMode == "Cash" && (
                      <>
                        <div
                          className={`${!isHideController("Skip Time Type") ? "d-none" : ""} col-sm-2 col-md-2 mb-1`}
                        >
                          <SelectBox
                            onChange={handleChange}
                            selectedValue={formData?.skipTimeType}
                            id="Skip Time Type"
                            lable="Skip Time Type"
                            name="skipTimeType"
                            type="text"
                            options={SkipTimeType}
                          />
                          {moreErrors?.["Skip Time Type"] &&
                            item?.IsMandatory === 1 && (
                              <div className="error-message">
                                {moreErrors["Skip Time Type"]}
                              </div>
                            )}
                        </div>
                      </>
                    )}
                  </>
                );
              }
              if (name == "Rate" && item?.ControlDisplayID == "skipValue") {
                return (
                  <>
                    {[1, 2, 3, 4].includes(Number(formData?.skipTimeType)) && (
                      <div
                        className={`${!isHideController("skipValue") ? "d-none" : ""} col-sm-2 col-md-2 mb-1`}
                      >
                        <Input
                          value={formData?.skipValue}
                          id="skipValue"
                          lable="Skip Value"
                          name="skipValue"
                          type="number"
                          onInput={handleInput}
                          placeholder=" "
                          className="custom-skip-value-input"
                        />
                        {item?.IsMandatory === 1 &&
                          moreErrors?.[item.ControlDisplayID] && (
                            <div className="error-message">
                              {moreErrors[item.ControlDisplayID]}
                            </div>
                          )}
                      </div>
                    )}
                  </>
                );
              }
              if (name == "Rate" && item?.ControlDisplayID == "UserName") {
                return (
                  <div
                    className={`${!isHideController("Username") ? "d-none" : ""} col-sm-2 col-md-2 mb-1`}
                  >
                    <Input
                      type="text"
                      className="required-fields"
                      placeholder=" "
                      lable={t("UserName")}
                      id="UserName"
                      name="UserName"
                      value={formData.UserName}
                      onChange={handleChange}
                    />
                    {moreErrors?.UserName && item?.IsMandatory === 1 && (
                      <div className="error-message">{moreErrors.UserName}</div>
                    )}
                  </div>
                );
              }

              if (name == "Rate" && item?.ControlDisplayID == "RequiredAttachment") {
                return (
                  <div
                    className={`${!isHideController("RequiredAttachment") ? "d-none" : ""} col-sm-2 col-md-2 mb-1`}
                  >
                    <MultiSelectComp
                      options={doc}
                      label="RequiredAttachment"
                      id="RequiredAttachment"
                      value={formData?.RequiredAttachment}
                      name="RequiredAttachment"
                      onChange={handleMultiSelectChange}
                    />
                    {moreErrors?.UserName && item?.IsMandatory === 1 && (
                      <div className="error-message">{moreErrors.RequiredAttachment}</div>
                    )}
                  </div>
                );
              }

              // CoPaymentApplicable
              if (name === "Rate" && item?.ControlDisplayID == "CoPaymentApplicable") {
                return (
                  (formData?.CentreType == "Panel") && (
                    <div
                      className={`${!isHideController("CoPaymentApplicable") ? "d-none" : ""
                        } col-sm-2 mb-3`}
                    >
                      <Form.Check
                        type="switch"
                        id="CoPaymentApplicable"
                        name="CoPaymentApplicable"
                        label={t("CoPaymentApplicable")}
                        checked={formData?.CoPaymentApplicable === 0 ? false : true}
                        onChange={handleChange}
                      />
                      {item?.IsMandatory === 1 && moreErrors?.[item.ControlDisplayID] && (
                        <div className="error-message">
                          {moreErrors[item.ControlDisplayID]}
                        </div>
                      )}
                    </div>
                  )
                );
              }

              if (
                name == "Rate" &&
                item?.ControlDisplayID == "minCashInBookingPercent" &&
                formData?.PaymentMode == "Cash"
              ) {
                return (
                  <div
                    className={`${!isHideController("minCashInBookingPercent") ? "d-none" : ""} col-sm-2 col-md-2 mb-1`}
                  >
                    <Input
                      type="number"
                      className="required-fields"
                      placeholder=" "
                      lable={t("Min Cash In Booking Percent")}
                      id="minCashInBookingPercent"
                      name="minCashInBookingPercent"
                      value={formData.minCashInBookingPercent}
                      onChange={handleChange}
                      max={100}
                    />
                    {moreErrors?.minCashInBookingPercent &&
                      item?.IsMandatory === 1 && (
                        <div className="error-message">
                          {moreErrors.minCashInBookingPercent}
                        </div>
                      )}
                  </div>
                );
              }
              if (name === "Rate" && item?.ControlDisplayID === "Password") {
                return (
                  <>
                    {!hideCredentials && (
                      <div
                        className={`${!isHideController("Password") ? "d-none" : ""} col-sm-2 col-md-2 mb-1`}
                      >
                        <div style={{ position: "relative" }}>
                          <Input
                            type={showPassword ? "text" : "password"}
                            className="required-fields"
                            placeholder=" "
                            lable={t("Password")}
                            id="Password"
                            name="Password"
                            value={formData.Password}
                            onChange={handleChange}
                            style={{ paddingRight: "2.5rem" }}
                          />

                          <button
                            type="button"
                            onClick={() => setShowPassword((prev) => !prev)}
                            style={{
                              position: "absolute",
                              right: "0.6rem",
                              top: "50%",
                              transform: "translateY(-50%)",
                              background: "none",
                              border: "none",
                              cursor: "pointer",
                              padding: "0",
                              color: "#6c757d",
                              display: "flex",
                              alignItems: "center",
                            }}
                            tabIndex={-1}
                            aria-label={
                              showPassword ? "Hide password" : "Show password"
                            }
                          >
                            {showPassword ? (
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="18"
                                height="18"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              >
                                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                                <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                                <line x1="1" y1="1" x2="23" y2="23" />
                              </svg>
                            ) : (
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="18"
                                height="18"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              >
                                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                                <circle cx="12" cy="12" r="3" />
                              </svg>
                            )}
                          </button>
                        </div>

                        {moreErrors?.Password && item?.IsMandatory === 1 && (
                          <div className="error-message">
                            {moreErrors.Password}
                          </div>
                        )}
                      </div>
                    )}
                  </>
                );
              }
                if (
                (name == "Rate" || name == "center") &&
                item?.ControlDisplayID == "AllowZeroRateBooking"
              ) {
                return (
                  <div
                    className={`${!isHideController("AllowZeroRateBooking") ? "d-none" : ""} col-sm-2 col-md-2 mb-1`}
                  >
                    <Form.Check
                      type="switch"
                      id="AllowZeroRateBooking"
                      name="AllowZeroRateBooking"
                      label={t("Allow Zero Rate Booking")}
                      checked={Boolean(formData?.AllowZeroRateBooking)}
                      onChange={handleChange}
                      className="allow-rate-type-zero-switch"
                    />
                    {item?.IsMandatory === 1 &&
                      moreErrors?.[item.ControlDisplayID] && (
                        <div className="error-message">
                          {moreErrors[item.ControlDisplayID]}
                        </div>
                      )}
                  </div>
                );
              }
            })}
        </div>
      </Accordion>
      {(name === "Rate" || name === "center") &&
        isSectionVisible(["fullName", "designation", "emailId", "mobile"]) && (
          <Accordion title={t("Authorized Details")} defaultValue={true}>
            <div className="row pt-2 pl-2 pr-2">
              {controllerDynamicList
                ?.sort((a, b) => a.DisplayOrder - b.DisplayOrder)
                .map((item) => {
                  if (item?.ControlDisplayID == "fullName") {
                    return (
                      <div
                        className={`${!isHideController("fullName") ? "d-none" : ""} col-sm-2 col-md-2 mb-1`}
                      >
                        <Input
                          lable="Full Name"
                          id="authrizedPersonName"
                          onChange={handleChange}
                          value={formData?.authrizedPersonName}
                          name="authrizedPersonName"
                          type="text"
                          placeholder=" "
                          max={50}
                        />
                        {item?.IsMandatory === 1 &&
                          moreErrors?.[item.ControlDisplayID] && (
                            <div className="error-message">
                              {moreErrors[item.ControlDisplayID]}
                            </div>
                          )}
                      </div>
                    );
                  }
                  if (item?.ControlDisplayID == "designation") {
                    return (
                      <div
                        className={`${!isHideController("designation") ? "d-none" : ""} col-sm-2 col-md-2 mb-1`}
                      >
                        <Input
                          lable="Designation"
                          id="authrizedPersonDesingation"
                          placeholder=" "
                          onChange={handleChange}
                          value={formData?.authrizedPersonDesingation}
                          name="authrizedPersonDesingation"
                          max={50}
                          min={4}
                        />
                        {item?.IsMandatory === 1 &&
                          moreErrors?.[item.ControlDisplayID] && (
                            <div className="error-message">
                              {moreErrors[item.ControlDisplayID]}
                            </div>
                          )}
                      </div>
                    );
                  }
                  if (item?.ControlDisplayID == "emailId") {
                    return (
                      <div
                        className={`${!isHideController("emailId") ? "d-none" : ""} col-sm-2 col-md-2 mb-1`}
                      >
                        <Input
                          lable="Email"
                          id="authrizedPersonEmailID"
                          placeholder=" "
                          type="email"
                          onChange={handleChange}
                          value={formData?.authrizedPersonEmailID}
                          name="authrizedPersonEmailID"
                        />
                        {item?.IsMandatory === 1 &&
                          moreErrors?.[item.ControlDisplayID] && (
                            <div className="error-message">
                              {moreErrors[item.ControlDisplayID]}
                            </div>
                          )}
                      </div>
                    );
                  }
                  if (item?.ControlDisplayID == "mobile") {
                    return (
                      <div
                        className={`${!isHideController("mobile") ? "d-none" : ""} col-sm-2 col-md-2 mb-1`}
                      >
                        <Input
                          lable="Mobile"
                          id="authrizedPersonMobile"
                          placeholder=" "
                          onInput={(e) => number(e, 10)}
                          type="number"
                          onChange={handleChange}
                          value={formData?.authrizedPersonMobile}
                          name="authrizedPersonMobile"
                        />
                        {item?.IsMandatory === 1 &&
                          moreErrors?.[item.ControlDisplayID] && (
                            <div className="error-message">
                              {moreErrors[item.ControlDisplayID]}
                            </div>
                          )}
                      </div>
                    );
                  }
                  if (item?.ControlDisplayID == "UHIDCode" && name === "center") {
                    return (
                     
            <div  className={`${!isHideController("UHIDCode") ? "d-none" : ""} col-sm-2 col-md-2 mb-1`}>
              <Input
                maxLength={20}
                lable="UHID Code"
                id="UHIDCode"
                placeholder=" "
                onChange={handleChange}
                value={formData?.UHIDCode}
                name="UHIDCode"
              />
            </div>
          
                    );
                  }
                    if (item?.ControlDisplayID == "DispatchNo" && name === "center") {
                    return (
                     
            <div  className={`${!isHideController("DispatchNo") ? "d-none" : ""} col-sm-2 col-md-2 mb-1`}>
              <Input
                maxLength={20}
                lable="Dispatch No"
                id="DispatchNo"
                placeholder=" "
                onChange={handleChange}
                value={formData?.DispatchNo}
                name="DispatchNo"
              />
            </div>
          
                    );
                  }
                })}
            </div>
          </Accordion>
        )}
      {(name === "Rate" || name === "center") &&
        isSectionVisible([
          "spocName",
          "spocDesingation",
          "spocMobile",
          "spocEmailID",
        ]) && (
          <Accordion title={t("SPOC Details")} defaultValue={true}>
            <div className="row pt-2 pl-2 pr-2">
              {controllerDynamicList
                ?.sort((a, b) => a.DisplayOrder - b.DisplayOrder)
                .map((item) => {
                  if (item?.ControlDisplayID == "spocName") {
                    return (
                      <div
                        className={`${!isHideController("spocName") ? "d-none" : ""} col-sm-2 col-md-2 mb-1`}
                      >
                        <Input
                          lable="SPOC Name"
                          id="spocName"
                          placeholder=" "
                          onChange={handleChange}
                          value={formData?.spocName}
                          name="spocName"
                          max={50}
                          min={4}
                        />
                        {item?.IsMandatory === 1 &&
                          moreErrors?.[item.ControlDisplayID] && (
                            <div className="error-message">
                              {moreErrors[item.ControlDisplayID]}
                            </div>
                          )}
                      </div>
                    );
                  }
                  if (item?.ControlDisplayID == "spocDesingation") {
                    return (
                      <div
                        className={`${!isHideController("spocDesingation") ? "d-none" : ""} col-sm-2 col-md-2 mb-1`}
                      >
                        <Input
                          lable="SPOC Desingation"
                          id="spocDesingation"
                          placeholder=" "
                          onChange={handleChange}
                          value={formData?.spocDesingation}
                          name="spocDesingation"
                          max={50}
                          min={4}
                        />
                        {item?.IsMandatory === 1 &&
                          moreErrors?.[item.ControlDisplayID] && (
                            <div className="error-message">
                              {moreErrors[item.ControlDisplayID]}
                            </div>
                          )}
                      </div>
                    );
                  }
                  if (item?.ControlDisplayID == "spocMobile") {
                    return (
                      <div
                        className={`${!isHideController("spocMobile") ? "d-none" : ""} col-sm-2 col-md-2 mb-1`}
                      >
                        <Input
                          lable="SPOC Mobile"
                          id="spocMobile"
                          placeholder=" "
                          onChange={handleChange}
                          value={formData?.spocMobile}
                          name="spocMobile"
                          type="number"
                        />
                        {item?.IsMandatory === 1 &&
                          moreErrors?.[item.ControlDisplayID] && (
                            <div className="error-message">
                              {moreErrors[item.ControlDisplayID]}
                            </div>
                          )}
                      </div>
                    );
                  }
                  if (item?.ControlDisplayID == "spocEmailID") {
                    return (
                      <div
                        className={`${!isHideController("spocEmailID") ? "d-none" : ""} col-sm-2 col-md-2 mb-1`}
                      >
                        <Input
                          lable="SPOC EmailID"
                          id="spocEmailID"
                          placeholder=" "
                          onChange={handleChange}
                          value={formData?.spocEmailID}
                          name="spocEmailID"
                          type="email"
                        />
                        {item?.IsMandatory === 1 &&
                          moreErrors?.[item.ControlDisplayID] && (
                            <div className="error-message">
                              {moreErrors[item.ControlDisplayID]}
                            </div>
                          )}
                      </div>
                    );
                  }
                })}
            </div>
          </Accordion>
        )}
      {isSectionVisible([
        "Country",
        "BusinessZone",
        "State",
        "StateCode",
        "City",
        "CityZone",
        "Address1",
        "Address2",
        "PinCode",
      ]) && (
          <Accordion title={t("Address Details")} defaultValue={true}>
            <div className="row pt-2 pl-2 pr-2">
              {controllerDynamicList
                ?.sort((a, b) => a.DisplayOrder - b.DisplayOrder)
                .map((item) => {
                  if (item?.ControlDisplayID == "Country") {
                    return (
                      <div
                        className={`${!isHideController("Country") ? "d-none" : ""} col-sm-2 col-md-2 mb-1`}
                      >
                        <ReactSelect
                          dynamicOptions={countryOptions}
                          removeIsClearable={true}
                          name="CountryId"
                          lable="Country"
                          placeholderName="Select Country"
                          value={formData?.CountryId}
                          onChange={handleReactSelectChange}
                          isDisabled={countryOptions.length === 0}
                        />
                      </div>
                    );
                  }
                  if (item?.ControlDisplayID == "BusinessZone") {
                    return (
                      <div
                        className={`${!isHideController("BusinessZone") ? "d-none" : ""} col-sm-2 col-md-2 mb-1`}
                      >
                        <ReactSelect
                          dynamicOptions={businessZoneOptions}
                          removeIsClearable={true}
                          name="BusinessZoneId"
                          lable="Business Zone"
                          placeholderName="Select Business Zone"
                          value={formData?.BusinessZoneId}
                          onChange={handleReactSelectChange}
                          isDisabled={businessZoneOptions.length === 0}
                        />
                        {item?.IsMandatory === 1 &&
                          moreErrors?.[item.ControlDisplayID] && (
                            <div className="error-message">
                              {moreErrors[item.ControlDisplayID]}
                            </div>
                          )}
                      </div>
                    );
                  }
                  if (item?.ControlDisplayID == "State") {
                    return (
                      <div
                        className={`${!isHideController("State") ? "d-none" : ""} col-sm-2 col-md-2 mb-1`}
                      >
                        <ReactSelect
                          dynamicOptions={stateOptions}
                          removeIsClearable={true}
                          name="StateId"
                          lable="State"
                          placeholderName="Select State"
                          value={formData?.StateId}
                          onChange={handleReactSelectChange}
                          isDisabled={stateOptions.length === 0}
                        />
                        {item?.IsMandatory === 1 &&
                          moreErrors?.[item.ControlDisplayID] && (
                            <div className="error-message">
                              {moreErrors[item.ControlDisplayID]}
                            </div>
                          )}
                      </div>
                    );
                  }
                  if (item?.ControlDisplayID == "StateCode") {
                    return (
                      <div
                        className={`${!isHideController("StateCode") ? "d-none" : ""} col-sm-2 col-md-2 mb-1`}
                      >
                        <Input
                          lable="StateCode"
                          id="StateCode"
                          placeholder=" "
                          onChange={handleChange}
                          value={formData?.StateCode}
                          name="StateCode"
                          type="number"
                          onInput={(e) => number(e, 2)}
                        />
                        {item?.IsMandatory === 1 &&
                          moreErrors?.[item.ControlDisplayID] && (
                            <div className="error-message">
                              {moreErrors[item.ControlDisplayID]}
                            </div>
                          )}
                      </div>
                    );
                  }
                  if (item?.ControlDisplayID == "City") {
                    return (
                      <div
                        className={`${!isHideController("City") ? "d-none" : ""} col-sm-2 col-md-2 mb-1`}
                      >
                        <ReactSelect
                          dynamicOptions={cityOptions}
                          removeIsClearable={true}
                          name="CityId"
                          lable="City"
                          placeholderName="Select City"
                          value={formData?.CityId}
                          onChange={handleReactSelectChange}
                          isDisabled={cityOptions.length === 0}
                        />
                        {item?.IsMandatory === 1 &&
                          moreErrors?.[item.ControlDisplayID] && (
                            <div className="error-message">
                              {moreErrors[item.ControlDisplayID]}
                            </div>
                          )}
                      </div>
                    );
                  }
                  if (item?.ControlDisplayID == "CityZone") {
                    return (
                      <div
                        className={`${!isHideController("CityZone") ? "d-none" : ""} col-sm-2 col-md-2 mb-1`}
                      >
                        <Input
                          lable="CityZone"
                          id="CityZone"
                          placeholder=" "
                          onChange={handleChange}
                          value={formData?.CityZone}
                          name="CityZone"
                          type="text"
                          max={25}
                        />
                        {item?.IsMandatory === 1 &&
                          moreErrors?.[item.ControlDisplayID] && (
                            <div className="error-message">
                              {moreErrors[item.ControlDisplayID]}
                            </div>
                          )}
                      </div>
                    );
                  }
                  if (item?.ControlDisplayID == "Address1") {
                    return (
                      <div
                        className={`${!isHideController("Address1") ? "d-none" : ""} col-sm-2 col-md-2 mb-1`}
                      >
                        <Input
                          lable="Address1"
                          id="Address1"
                          onChange={handleChange}
                          value={formData?.Address1}
                          name="Address1"
                          type="text"
                          placeholder=" "
                          max={50}
                        />
                        {item?.IsMandatory === 1 &&
                          moreErrors?.[item.ControlDisplayID] && (
                            <div className="error-message">
                              {moreErrors[item.ControlDisplayID]}
                            </div>
                          )}
                      </div>
                    );
                  }
                  if (item?.ControlDisplayID == "Address2") {
                    return (
                      <div
                        className={`${!isHideController("Address2") ? "d-none" : ""} col-sm-2 col-md-2 mb-1`}
                      >
                        <Input
                          lable="Address2"
                          id="Address2"
                          placeholder=" "
                          onChange={handleChange}
                          value={formData?.Address2}
                          name="Address2"
                          max={50}
                          min={4}
                        />
                        {item?.IsMandatory === 1 &&
                          moreErrors?.[item.ControlDisplayID] && (
                            <div className="error-message">
                              {moreErrors[item.ControlDisplayID]}
                            </div>
                          )}
                      </div>
                    );
                  }
                  if (item?.ControlDisplayID == "PinCode") {
                    return (
                      <div
                        className={`${!isHideController("PinCode") ? "d-none" : ""} col-sm-2 col-md-2 mb-1`}
                      >
                        <Input
                          lable="PinCode"
                          id="PinCode"
                          placeholder=" "
                          onInput={(e) => number(e, 6)}
                          type="number"
                          onChange={handleChange}
                          value={formData?.Pincode}
                          name="Pincode"
                        />
                        {item?.IsMandatory === 1 &&
                          moreErrors?.[item.ControlDisplayID] && (
                            <div className="error-message">
                              {moreErrors[item.ControlDisplayID]}
                            </div>
                          )}
                      </div>
                    );
                  }
                })}
            </div>
          </Accordion>
        )}
      {name == "center" && (
        <>
          {name === "center" &&
            isSectionVisible([
              "DemandDraft",
              "BenificialName",
              "BankAccountNo",
              "bankName",
              "IFSCCode",
              "BranchAddress",
              "PANNo",
              "Description",
              "RegisteredOffice",
            ]) && (
              <Accordion title={t("Accounts Details")} defaultValue={true}>
                {showAccount ? (
                  <div className="row pt-2 pl-2 pr-2">
                    {controllerDynamicList
                      ?.sort((a, b) => a.DisplayOrder - b.DisplayOrder)
                      .map((item) => {
                        if (item?.ControlDisplayID == "DemandDraft") {
                          return (
                            <div
                              className={`${!isHideController("DemandDraft") ? "d-none" : ""} col-sm-2 col-md-2 mb-1`}
                            >
                              <Input
                                lable="Demand Draft"
                                id="DemandDraft"
                                placeholder=" "
                                max={6}
                                type="number"
                                onInput={(e) => number(e, 6)}
                                onChange={handleChange}
                                value={formData?.DemandDraft}
                                name="DemandDraft"
                              />
                              {item?.IsMandatory === 1 &&
                                moreErrors?.[item.ControlDisplayID] && (
                                  <div className="error-message">
                                    {moreErrors[item.ControlDisplayID]}
                                  </div>
                                )}
                            </div>
                          );
                        }
                        if (item?.ControlDisplayID == "BenificialName") {
                          return (
                            <div
                              className={`${!isHideController("BenificialName") ? "d-none" : ""} col-sm-2 col-md-2 mb-1`}
                            >
                              <Input
                                type={"text"}
                                lable="Beneficial Name"
                                id="BenificialName"
                                placeholder=" "
                                max={30}
                                onChange={handleInputChange}
                                value={formData?.BenificialName}
                                name="BenificialName"
                              />
                              {item?.IsMandatory === 1 &&
                                moreErrors?.[item.ControlDisplayID] && (
                                  <div className="error-message">
                                    {moreErrors[item.ControlDisplayID]}
                                  </div>
                                )}
                            </div>
                          );
                        }
                        if (item?.ControlDisplayID == "BankAccountNo") {
                          return (
                            <div
                              className={`${!isHideController("BankAccountNo") ? "d-none" : ""} col-sm-2 col-md-2 mb-1`}
                            >
                              <Input
                                lable="Bank Account No"
                                id="BankAccountNo"
                                placeholder=" "
                                onInput={(e) => number(e, 20)}
                                type="number"
                                onChange={handleChange}
                                value={formData?.BankAccountNo}
                                name="BankAccountNo"
                              />
                              {item?.IsMandatory === 1 &&
                                moreErrors?.[item.ControlDisplayID] && (
                                  <div className="error-message">
                                    {moreErrors[item.ControlDisplayID]}
                                  </div>
                                )}
                            </div>
                          );
                        }
                        if (item?.ControlDisplayID == "bankName") {
                          return (
                            <div
                              className={`${!isHideController("bankName") ? "d-none" : ""} col-sm-2 col-md-2 mb-1`}
                            >
                              <Input
                                lable="Bank Name"
                                id="bankName"
                                placeholder=" "
                                max={30}
                                onChange={handleInputChange}
                                value={formData?.bankName}
                                name="bankName"
                              />
                            </div>
                          );
                        }
                        if (item?.ControlDisplayID == "IFSCCode") {
                          return (
                            <div
                              className={`${!isHideController("IFSCCode") ? "d-none" : ""} col-sm-2 col-md-2 mb-1`}
                            >
                              <Input
                                lable="IFSC Code"
                                id="IFSCCode"
                                placeholder=" "
                                type={"text"}
                                max={20}
                                onChange={handleInputChange}
                                value={formData?.IFSCCode}
                                name="IFSCCode"
                              />
                              {item?.IsMandatory === 1 &&
                                moreErrors?.[item.ControlDisplayID] && (
                                  <div className="error-message">
                                    {moreErrors[item.ControlDisplayID]}
                                  </div>
                                )}
                            </div>
                          );
                        }
                        if (item?.ControlDisplayID == "BranchAddress") {
                          return (
                            <div
                              className={`${!isHideController("BranchAddress") ? "d-none" : ""} col-sm-2 col-md-2 mb-1`}
                            >
                              <Input
                                lable="Branch Address"
                                id="BranchAddress"
                                placeholder=" "
                                max={30}
                                onChange={handleInputChange}
                                value={formData?.BranchAddress}
                                name="BranchAddress"
                              />
                              {item?.IsMandatory === 1 &&
                                moreErrors?.[item.ControlDisplayID] && (
                                  <div className="error-message">
                                    {moreErrors[item.ControlDisplayID]}
                                  </div>
                                )}
                            </div>
                          );
                        }
                        if (item?.ControlDisplayID == "PANNo") {
                          return (
                            <div
                              className={`${!isHideController("PANNo") ? "d-none" : ""} col-sm-2 col-md-2 mb-1`}
                            >
                              <Input
                                lable="PAN No"
                                id="PANNo"
                                placeholder=" "
                                onChange={handleInputChange}
                                value={formData?.PANNo}
                                name="PANNo"
                                max={13}
                              />
                              {item?.IsMandatory === 1 &&
                                moreErrors?.[item.ControlDisplayID] && (
                                  <div className="error-message">
                                    {moreErrors[item.ControlDisplayID]}
                                  </div>
                                )}
                            </div>
                          );
                        }
                        if (item?.ControlDisplayID == "Description") {
                          return (
                            <div
                              className={`${!isHideController("Description") ? "d-none" : ""} col-sm-5 mb-1`}
                            >
                              <Input
                                lable="Description"
                                id="Description"
                                placeholder=" "
                                max={40}
                                onChange={handleInputChange}
                                value={formData?.Description}
                                name="Description"
                              />
                              {item?.IsMandatory === 1 &&
                                moreErrors?.[item.ControlDisplayID] && (
                                  <div className="error-message">
                                    {moreErrors[item.ControlDisplayID]}
                                  </div>
                                )}
                            </div>
                          );
                        }
                        if (item?.ControlDisplayID == "RegisteredOffice") {
                          return (
                            <div
                              className={`${!isHideController("RegisteredOffice") ? "d-none" : ""} col-sm-5 mb-1`}
                            >
                              <Input
                                lable="Registered Office"
                                id="RegisteredOffice"
                                placeholder=" "
                                max={40}
                                onChange={handleInputChange}
                                value={formData?.RegisteredOffice}
                                name="RegisteredOffice"
                              />
                              {item?.IsMandatory === 1 &&
                                moreErrors?.[item.ControlDisplayID] && (
                                  <div className="error-message">
                                    {moreErrors[item.ControlDisplayID]}
                                  </div>
                                )}
                            </div>
                          );
                        }
                      })}
                  </div>
                ) : (
                  ""
                )}
              </Accordion>
            )}
        </>
      )}
      <Accordion title={t("Billing Details")} defaultValue={true}>
        <div className="row pt-2 pl-2 pr-2">
          {controllerDynamicList
            ?.sort((a, b) => a.DisplayOrder - b.DisplayOrder)
            .map((item) => {
              if (item?.ControlDisplayID == "InvoiceTo") {
                return (
                  <div
                    className={`${!isHideController("InvoiceTo") ? "d-none" : ""} col-sm-2 col-md-2 mb-1`}
                  >
                    <ReactSelect
                      dynamicOptions={Invoice}
                      name="InvoiceTo"
                      lable={t("InvoiceTo")}
                      id="InvoiceTo"
                      removeIsClearable={true}
                      placeholderName={t("InvoiceTo")}
                      value={formData?.InvoiceTo}
                      onChange={handleSearchSelectChange}
                    />
                    {item?.IsMandatory === 1 &&
                      moreErrors?.[item.ControlDisplayID] && (
                        <div className="error-message">
                          {moreErrors[item.ControlDisplayID]}
                        </div>
                      )}
                  </div>
                );
              }
              if (item?.ControlDisplayID == "BusinessUnit") {
                return (
                  <div
                    className={`${!isHideController("BusinessUnit") ? "d-none" : ""} col-sm-2 col-md-2 mb-1`}
                  >
                    <ReactSelect
                      dynamicOptions={BusinessUnit}
                      name="BusinessUnit"
                      lable={t("BusinessUnit")}
                      id="BusinessUnit"
                      removeIsClearable={true}
                      placeholderName={t("BusinessUnit")}
                      value={formData?.BusinessUnit}
                      onChange={handleSearchSelectChange}
                    />
                    {item?.IsMandatory === 1 &&
                      moreErrors?.[item.ControlDisplayID] && (
                        <div className="error-message">
                          {moreErrors[item.ControlDisplayID]}
                        </div>
                      )}
                  </div>
                );
              }
              if (item?.ControlDisplayID == "TagProcessingLab") {
                return (
                  <div
                    className={`${!isHideController("TagProcessingLab") ? "d-none" : ""} col-sm-2 col-md-2 mb-1`}
                  >
                    <ReactSelect
                      dynamicOptions={ProcessingLab}
                      name="ProcessingLab"
                      lable={t("TagProcessingLab")}
                      id="TagProcessingLab"
                      removeIsClearable={true}
                      placeholderName={t("TagProcessingLab")}
                      value={formData?.ProcessingLab}
                      onChange={handleSearchSelectChange}
                    />
                    {item?.IsMandatory === 1 &&
                      moreErrors?.[item.ControlDisplayID] && (
                        <div className="error-message">
                          {moreErrors[item.ControlDisplayID]}
                        </div>
                      )}
                  </div>
                );
              }
              if (item?.ControlDisplayID == "ReferenceRate") {
                return (
                  <div
                    className={`${!isHideController("ReferenceRate") ? "d-none" : ""} col-sm-2 col-md-2 mb-1`}
                  >
                    <ReactSelect
                      dynamicOptions={ReferenceRate}
                      name="ReferenceRate"
                      lable={t("Rate Type")}
                      id="Rate Type"
                      removeIsClearable={true}
                      placeholderName={t("Rate Type")}
                      value={formData?.ReferenceRate}
                      onChange={handleSearchSelectChange}
                    />
                    {item?.IsMandatory === 1 &&
                      moreErrors?.[item.ControlDisplayID] && (
                        <div className="error-message">
                          {moreErrors[item.ControlDisplayID]}
                        </div>
                      )}
                  </div>
                );
              }
              if (item?.ControlDisplayID == "ReferenceRate1") {
                return (
                  <div
                    className={`${!isHideController("ReferenceRate1") ? "d-none" : ""} col-sm-2 col-md-2 mb-1`}
                  >
                    <ReactSelect
                      dynamicOptions={ReferenceRate}
                      name="ReferenceRate1"
                      lable={t("Rate Type1")}
                      id="Rate Type1"
                      removeIsClearable={true}
                      placeholderName={t("Rate Type1")}
                      value={formData?.ReferenceRate1}
                      onChange={handleSearchSelectChange}
                    />
                    {item?.IsMandatory === 1 &&
                      moreErrors?.[item.ControlDisplayID] && (
                        <div className="error-message">
                          {moreErrors[item.ControlDisplayID]}
                        </div>
                      )}
                  </div>
                );
              }
              if (item?.ControlDisplayID == "ReferenceRate2") {
                return (
                  <div
                    className={`${!isHideController("ReferenceRate2") ? "d-none" : ""} col-sm-2 col-md-2 mb-1`}
                  >
                    <ReactSelect
                      dynamicOptions={ReferenceRate}
                      name="ReferenceRate2"
                      lable={t("Rate Type2")}
                      id="Rate Type2"
                      removeIsClearable={true}
                      placeholderName={t("Rate Type2")}
                      value={formData?.ReferenceRate2}
                      onChange={handleSearchSelectChange}
                    />
                    {item?.IsMandatory === 1 &&
                      moreErrors?.[item.ControlDisplayID] && (
                        <div className="error-message">
                          {moreErrors[item.ControlDisplayID]}
                        </div>
                      )}
                  </div>
                );
              }
              if (name == "Rate" && item?.ControlDisplayID == "isActive") {
                return (
                  <div
                    className={`${!isHideController("isActive") ? "d-none" : ""} col-sm-2 col-md-6 mb-1`}
                  >
                    <Form.Check
                      type="switch"
                      id="isActive"
                      name="isActive"
                      label={t("Active")}
                      onChange={handleChange}
                      checked={formData?.isActive}
                    />
                    {item?.IsMandatory === 1 &&
                      moreErrors?.[item.ControlDisplayID] && (
                        <div className="error-message">
                          {moreErrors[item.ControlDisplayID]}
                        </div>
                      )}
                  </div>
                );
              }
              if (
                name === "Rate" &&
                item?.ControlDisplayID == "UploadLetterHead"
              ) {
                return (
                  <div
                    className={`${!isHideController("UploadLetterHead") ? "d-none" : ""} col-sm-2 col-md-auto mb-1`}
                  >
                    <CustomButton
                      id="UploadLetterHead"
                      text={"Upload LetterHead"}
                      onClick={() => {
                        setShow(true);
                      }}
                    />
                  </div>
                );
              }

              if (
                name === "Rate" &&
                //formData?.CentreType === "Franchise" &&
                item?.ControlDisplayID == "UploadLogo"
              ) {
                return (
                  <div
                    className={`${!isHideController("UploadLogo") ? "d-none" : ""} col-sm-2 col-md-auto mb-1`}
                  >
                    <CustomButton
                      id="UploadLogo"
                      text={"Upload Logo"}
                      onClick={() => {
                        setShow9(true);
                      }}
                    />
                  </div>
                );
              }
              if (
                name === "Rate" &&
                item?.ControlDisplayID == "UploadAgrement"
              ) {
                return (
                  <div
                    className={`${!isHideController("UploadAgrement") ? "d-none" : ""} col-sm-2 col-md-auto mb-1`}
                  >
                    <CustomButton
                      id="UploadAgrement"
                      text={"Upload Agreement"}
                      onClick={() => {
                        setShowAgrement(true);
                      }}
                    />
                  </div>
                );
              }
              if (
                name == "Rate" &&
                item?.ControlDisplayID == "UploadAttHeader"
              ) {
                return (
                  <div
                    className={`${!isHideController("UploadAttHeader") ? "d-none" : ""} col-sm-2 col-md-2 mb-1`}
                  >
                    <CustomButton
                      id="UploadAttHeader"
                      text={"Upload Att Header"}
                      onClick={() => {
                        setShow3(true);
                      }}
                    />
                  </div>
                );
              }
              if (
                name == "Rate" &&
                item?.ControlDisplayID == "UploadAttFooter"
              ) {
                return (
                  <div
                    className={`${!isHideController("UploadAttFooter") ? "d-none" : ""} col-sm-2 col-md-2 mb-1`}
                  >
                    <CustomButton
                      id="UploadAttFooter"
                      text={"Upload Att Footer"}
                      onClick={() => {
                        setShow4(true);
                      }}
                    />
                  </div>
                );
              }
            })}
          {name == "Rate" && (
            <div>
              <CustomButton
                id="ratelist"
                icon="list"
                text="Rate List"
                onClick={() => {
                  navigate(`/RateList`)
                }}
                className="mx-2 mb-1"
              />
            </div>
          )}
          {name == "Rate" && (
            <div>
              <CustomButton
                id="shareRate"
                icon="send"
                text="Share Rate"
                onClick={() => {
                  navigate(`/RateTypeShareMaster`)
                }}
                className="mx-2 mb-1"
              />
            </div>
          )}
          {/* Save / Reset buttons */}
          {/* <div className="col-sm-1 mb-2"> */}
          {load ? (
            <Loading />
          ) : (
            <CustomButton
              id="btnSave"
              icon={state?.other?.button ? "edit" : "Save"}
              text={state?.other?.button ? t(state?.other?.button) : t("Save")}
              onClick={handleSubmit}
              className="mx-2 mb-1"
            />
          )}
          {/* </div> */}
          {state?.other?.button && (
            <CustomButton
              id="btnLog"
              icon="log"
              text={t("Log")}
              onClick={() => handleLog(centreAndRateDetails.CentreID)
              }
              className="mx-2 mb-1"
            />
          )}

          <div>
            <CustomButton
              id="btnRefresh"
              icon="refresh"
              text="Reset"
              onClick={handleReset}
              className="mx-2 mb-1"
            />
          </div>
          <div>
            <CustomButton
              id="btnAuditLog"
              icon="history"
              text={t("Audit Log")}
              onClick={() => setShowAuditLogModal(true)}
              className="mx-2 mb-1"
            />
          </div>
        </div>
      </Accordion>
      <div>
        <RateTypeController rateTypeID={state} name={name} />
      </div>
      <EmailPhoneCheckModal
        show={showEmailPhoneModal}
        handleClose={() => {
          setShowEmailPhoneModal(false);
          setPendingEmailPhoneValue(null);
        }}
        data={emailPhoneData}
        type={emailPhoneType}
        onConfirm={handleEmailPhoneConfirmation}
      />

      {/* Log Dialog */}
      <Dialog
        header={`Centre: ${centreAndRateDetails?.Centre || ""} | CentreID: ${centreAndRateDetails?.CentreID || ""} | CentreCode: ${centreAndRateDetails?.CentreCode || ""}`}
        className={theme}
        visible={showLogDialog}
        style={{ width: isMobile ? "90vw" : "70vw", height: "auto" }}
        contentStyle={{ overflow: "visible" }}
        onHide={() => { setShowLogDialog(false); setLogSearchTerm(""); }}
        dismissableMask
      >
        {logLoading ? (
          <Loading />
        ) : logData.length === 0 ? (
          <NoRecordFound />
        ) : (
          <Tables
            style={{ height: "60vh", tableLayout: "auto", width: "100%" }}>
            <thead>
              <tr>
                <th style={{ padding: "10px 12px", whiteSpace: "nowrap", width: "50px" }}>{t("S.No")}</th>
                <th style={{ padding: "10px 12px", whiteSpace: "nowrap", minWidth: "160px" }}>{t("Status")}</th>
                <th style={{ padding: "10px 12px", whiteSpace: "nowrap", minWidth: "160px" }}>{t("Old Value")}</th>
                <th style={{ padding: "10px 12px", whiteSpace: "nowrap", minWidth: "200px" }}>{t("New Value")}</th>
                <th style={{ padding: "10px 12px", whiteSpace: "nowrap", minWidth: "160px" }}>{t("ChangeBy")}</th>
                <th style={{ padding: "10px 12px", whiteSpace: "nowrap", minWidth: "120px" }}>{t("ChangeBy Date")}</th>
              </tr>
            </thead>
            <tbody>
              {logData.map((row, i) => (
                <tr key={i}>
                  <td style={{ padding: "8px 12px", textAlign: "center" }}>{i + 1}</td>
                  <td style={{ padding: "8px 12px", whiteSpace: "nowrap" }}>{row.columnName ?? "-"}</td>
                  <td style={{ padding: "8px 12px" }}>{row.oldValue ?? "-"}</td>
                  <td style={{ padding: "8px 12px" }}>{row.newValue ?? "-"}</td>
                  <td style={{ padding: "8px 12px", whiteSpace: "nowrap" }}>{row.createdByName ?? "-"}</td>
                  <td style={{ padding: "8px 12px", whiteSpace: "nowrap" }}>
                    {row.dtEntry ? moment(row.dtEntry).format("DD-MM-YYYY ") : "-"}
                  </td>
                </tr>
              ))}
            </tbody>
          </Tables>
        )}
      </Dialog>

      {/* Credential Dialog */}
      <Dialog
        header="Login Credentials"
        className={theme}
        visible={showCredentialModal}
        style={{ width: isMobile ? "20vw" : "30vw" }}
        onHide={() => setShowCredentialModal(false)}
        dismissableMask
      >
        <div className="row px-2 py-2">
          <div className="col-12 mb-2">
            <label className="fw-bold">{t("Username")}</label>
            <div>{credentialData.userName}</div>
          </div>
          <div className="col-12">
            <label className="fw-bold">{t("Password")}</label>
            <div>{credentialData.password}</div>
          </div>
        </div>
      </Dialog>

      {/* Audit Log Dialog */}
      <Dialog
        header={t("Audit Log")}
        className={theme}
        visible={showAuditLogModal}
        style={{ width: isMobile ? "100vw" : "35vw" }}
        onHide={() => setShowAuditLogModal(false)}
        dismissableMask
      >
        <div className="row px-2 py-2">
          <div className="col-auto mb-3">
            <Form.Check
              type="switch"
              id="auditAllDate"
              name="auditAllDate"
              label={t("All Date")}
              checked={auditAllDate}
              onChange={(e) => setAuditAllDate(e.target.checked)}
            />
          </div>
          <div
            className="col-sm-3 mb-3"
            style={auditAllDate ? { cursor: "not-allowed" } : undefined}
          >
            <DatePicker
              className="custom-calendar audit-log-datepicker"
              name="auditFromDate"
              value={auditFromDate}
              onChange={handleAuditDateChange}
              placeholder=" "
              id="auditFromDate"
              lable="From Date"
              disabled={auditAllDate}
            />
          </div>
          <div
            className="col-sm-3 mb-3"
            style={auditAllDate ? { cursor: "not-allowed" } : undefined}
          >
            <DatePicker
              className="custom-calendar audit-log-datepicker"
              name="auditToDate"
              value={auditToDate}
              onChange={handleAuditDateChange}
              placeholder=" "
              id="auditToDate"
              lable="To Date"
              disabled={auditAllDate}
              minDate={auditFromDate}
            />
          </div>
          <div className="col-auto d-flex justify-content-start">
            {auditLoading ? (
              <Loading />
            ) : (
              <>
                <CustomButton
                  id="btnAuditPdf"
                  icon="pdf"
                  text={t("PDF")}
                  onClick={() => handleAuditLogExport("Pdf")}
                  className="mx-2"
                />
                <CustomButton
                  id="btnAuditExcel"
                  icon="excel"
                  text={t("Excel")}
                  onClick={() => handleAuditLogExport("Excel")}
                  className="mx-2"
                />
              </>
            )}
          </div>
        </div>
      </Dialog>
    </>
  );
};

export default CentreMaster;

