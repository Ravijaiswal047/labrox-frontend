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
import { axiosInstance } from "../../utils/axiosInstance";
import UploadFile from "../utils/UploadFileModal/UploadFile";
import Heading from "../../components/UI/Heading";
import Accordion from "@app/components/UI/Accordion";
import { SelectBox } from "../../components/formComponent/SelectBox";
import Input from "../../components/formComponent/Input";
import {
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
} from "../../utils/Constants";
import { toast } from "react-toastify";
import Loading from "../../components/loader/Loading";
import ReactSelect from "../../components/formComponent/ReactSelect";
import { Form } from "react-bootstrap";
import { SelectBoxWithCheckbox } from "../../components/formComponent/MultiSelectBox";
import DatePicker from "../../components/formComponent/DatePicker";
// import { apiUrls } from "../../utils/apiEndpoints";
import { notify } from "../../utils/utils";
import OldPatientSearchModal from "../utils/OldPatientSearchModal";
import { apiUrls } from "../../utils/apiUrls";
import MultiSelectComp from "../../components/formComponent/MultiSelectComp";
import { CustomButton } from "../../components/UI/CustomButton";

const CenterManager = () => {
  const { name } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { state } = location;
  const [Invoice, setInvoice] = useState([]);
  const [load, setLoad] = useState(false);
  const [show, setShow] = useState(false);
  const [show1, setShow1] = useState(false);
  const [show2, setShow2] = useState(false);
  const [show3, setShow3] = useState(false);
  const [show4, setShow4] = useState(false);
  const [show5, setShow5] = useState(false);
  const [show6, setShow6] = useState(false);
  const [show7, setShow7] = useState(false);
  const [show8, setShow8] = useState(false);
  const [show9, setShow9] = useState(false);

  const [ProcessingLab, setProcessingLab] = useState([]);
  const [ReferenceRate, setReferenceRate] = useState([]);
  const [BarCodeLogic, setBarCodeLogic] = useState([]);
  const [VisitType, setVisitType] = useState([]);
  const [BusinessUnit, setBusinessUnit] = useState([]);
  const [CentreType, setCentreType] = useState([]);
  const [BasicDetailsCentreType, setBasicDetailsCentreType] = useState([]);
  const [doc, setDoc] = useState(null);
  const [showAccount, setShowAccount] = useState(true);
  const [salesManager, setSalesManager] = useState([]);
  const [proEmplyee, setProEmployee] = useState([]);
  const [AllsalesManager, setAllsalesManager] = useState([]);
  const [filedboyId, setfiledboyId] = useState([]);
  const [MrpData, setMrpData] = useState([]);
  const [ShareInvoiCerate, getShareInvoiCerate] = useState([]);
  const [ReferenceData, getReferenceData] = useState([]);

  const { t } = useTranslation();

  console.log("state33", state);

  console.log("testingggg", state?.other?.button);
  //   const [formData, setFormData] = useState({
  //     DataType: state?.data?.DataType ? state?.data?.DataType : "",
  //     CentreCode: state?.data?.CentreCode ? state?.data?.CentreCode : "",
  //     Centre: state?.data?.Centre ? state?.data?.Centre : "",
  //     CentreType: state?.data?.CentreType ? state?.data?.CentreType : "",
  //     InvoiceTo: state?.data?.InvoiceTo ? state?.data?.InvoiceTo : "Self",
  //     BusinessUnit: state?.data?.BusinessUnit
  //       ? state?.data?.BusinessUnit
  //       : "Self",
  //     ProcessingLab: state?.data?.ProcessingLab
  //       ? state?.data?.ProcessingLab
  //       : "Self",
  //     ReferenceRate: state?.data?.ReferenceRate
  //       ? state?.data?.ReferenceRate
  //       : "Self",
  //     Type: state?.data?.Type ? state?.data?.Type : "",
  //     Address1: state?.data?.Address1 ? state?.data?.Address1 : "",
  //     Address2: state?.data?.Address2 ? state?.data?.Address2 : "",
  //     City: state?.data?.City ? state?.data?.City : "",
  //     BusinessZone: state?.data?.BusinessZone ? state?.data?.BusinessZone : "",
  //     State: state?.data?.State ? state?.data?.State : "",
  //     Country: state?.data?.Country ? state?.data?.Country : "",
  //     Pincode: state?.data?.Pincode ? state?.data?.Pincode : "",
  //     Email: state?.data?.Email ? state?.data?.Email : "",
  //     LandLineNo: state?.data?.LandLineNo ? state?.data?.LandLineNo : "",
  //     Phone: state?.data?.Phone ? state?.data?.Phone : "",
  //     StateCode: state?.data?.StateCode ? state?.data?.StateCode : "",
  //     Fax: state?.data?.Fax ? state?.data?.Fax : "",
  //     Url: state?.data?.Url ? state?.data?.Url : "",
  //     PaymentMode: state?.data?.PaymentMode ? state?.data?.PaymentMode : "",
  //     VisitType: state?.data?.VisitType ? state?.data?.VisitType : 1,
  //     Status: state?.data?.Status ? state?.data?.Status : 1,
  //     BarcodeLogic: state?.data?.BarcodeLogic ? state?.data?.BarcodeLogic : 1,
  //     SampleCollectandReceive: state?.data?.SampleCollectandReceive
  //       ? state?.data?.SampleCollectandReceive
  //       : 0,
  //     CityZone: state?.data?.CityZone ? state?.data?.CityZone : "",
  //     ReferenceRate1: state?.data?.ReferenceRate1
  //       ? state?.data?.ReferenceRate1
  //       : 0,
  //     ReferenceRate2: state?.data?.ReferenceRate2
  //       ? state?.data?.ReferenceRate2
  //       : 0,
  //     IsTrfRequired: state?.data?.IsTrfRequired ? state?.data?.IsTrfRequired : 0,
  //     IsDepartmentSlip: state?.data?.IsDepartmentSlip
  //       ? state?.data?.IsDepartmentSlip
  //       : 0,
  //     IsSampleRecollection: state?.data?.IsSampleRecollection
  //       ? state?.data?.IsSampleRecollection
  //       : 0,
  //     HideAmount: state?.data?.HideAmount ? state?.data?.HideAmount : 0,
  //     HideReceipt: state?.data?.HideReceipt ? state?.data?.HideReceipt : 0,
  //     IsDoctorShareRequired: state?.data?.IsDoctorShareRequired
  //       ? state?.data?.IsDoctorShareRequired
  //       : 0,
  //     isActive: state?.data?.isActive ? state?.data?.isActive : 1,
  //     CentreID: state?.data?.CentreID ? state?.data?.CentreID : 0,
  //     UserName: state?.data?.Username ? state?.data?.Username : "",
  //     Password: state?.data?.Password ? state?.data?.Password : "",
  //     isAllowedLogin: state?.data?.IsAllowedLogin
  //       ? state?.data?.IsAllowedLogin
  //       : 0,
  //     userLoginID: state?.data?.userLoginID ? state?.data?.userLoginID : 0,
  //     centreIDHash: "",
  //     AgainstInvoice: state?.data?.AgainstInvoice
  //       ? state?.data?.AgainstInvoice
  //       : "0",
  //     SecurityAmount: state?.data?.SecurityAmount
  //       ? state?.data?.SecurityAmount
  //       : "",
  //     SecurityRemark: state?.data?.SecurityRemark
  //       ? state?.data?.SecurityRemark
  //       : "",
  //     Gstin: state?.data?.Gstin ? state?.data?.Gstin : "",
  //     dtEntry: state?.data?.dtEntry ? state?.data?.dtEntry : new Date(),
  //     FullyPaid: state?.data?.FullyPaid ? state?.data?.FullyPaid : 0,
  //     SetMRP: state?.data?.SetMRP ? state?.data?.SetMRP : 0,
  //     ProEmployee: state?.data?.ProEmployee ? state?.data?.ProEmployee : "",
  //     skipTimeType: state?.data?.skipTimeType ? state?.data?.skipTimeType : "NA",
  //     CreditLimitInRs: state?.data?.CreditLimitInRs
  //       ? state?.data?.CreditLimitInRs
  //       : "",
  //     CreditLimitInTime: state?.data?.CreditLimitInTime
  //       ? state?.data?.CreditLimitInTime
  //       : "",
  //     skipValue: state?.data?.skipValue ? state?.data?.skipValue : "0",
  //     IsAutoEmail: state?.data?.IsAutoEmail ? state?.data?.IsAutoEmail : 0,
  //     IsAutoPRDM: state?.data?.IsAutoPRDM ? state?.data?.IsAutoPRDM : 0,
  //     IncludeDoctorShare: state?.data?.IncludeDoctorShare
  //       ? state?.data?.IncludeDoctorShare
  //       : 0,

  //     UHIDCode: state?.data?.UHIDCode ? state?.data?.UHIDCode : "",
  //   });
  const initialPayload = {};
  const [payload, setPayload] = useState(initialPayload);
  console.log("payload", payload);
  const [formData, setFormData] = useState({
    // Basic Details
    DataType: state?.data?.DataType || "",
    CentreType: state?.data?.Type || "",
    VisitType: state?.data?.VisitType || [],
    CenterCode: state?.data?.CentreCode || "",
    UHIDCode: state?.data?.UHIDCode || "",
    BasicDetailsName: state?.data?.Centre || "",
    Status: state?.data?.isActive ? state?.data?.isActive : "1",

    //Address
    Mobile: state?.data?.Phone || "",
    LandLine: state?.data?.LandLineNo || "",
    EmailID: state?.data?.Email || "",
    Website: state?.data?.Website || "",
    Address1: state?.data?.Address1 || "",
    Address2: state?.data?.Address2 || "",
    Pincode: state?.data?.Pincode || "",
    Country: state?.data?.Country || "",
    BusinessZone: state?.data?.BusinessZone || "",
    State: state?.data?.State || "",
    City: state?.data?.City || "",
    CityZone: state?.data?.CityZone || "",
    Locality: state?.data?.Locality || "",

    // Centre Info
    CentreName: state?.data?.Centre || "",
    CentreMobile: state?.data?.ContactPersonMobile || "",
    CentreEmail: state?.data?.ContactPersonEmail || "",
    ContactPersonDesignation: state?.data?.ContactPersonDesignation || "",

    // Bank Info
    BankName: state?.data?.bankName || "",
    BankAccountNo: state?.data?.BankAccountNo || "",
    IFSCCode: state?.data?.IFSCCode || "",
    BenefecialName: state?.data?.BenificialName || "",
    BrachAddress: state?.data?.BranchAddress || "",
    GSTNO: state?.data?.Gstin || "",
    AadharCardNo: state?.data?.AadharCardNo || "",
    PanNo: state?.data?.PANNo || "",
    NamePanCard: state?.data?.panName || "",

    ACDescription: state?.data?.Description || "",
    RegisteredOffice: state?.data?.RegisteredOffice || "",
    ContractDate: state?.data?.dtEntry
      ? new Date(state?.data?.dtEntry)
      : new Date(),
    ContactToDate: state?.data?.ContactToDate
      ? new Date(state?.data?.ContactToDate)
      : new Date(),
    CreditLimit: state?.data?.CreditLimit || 0,
    // Accessioning Infomration
    BusinessUnit: state?.data?.BusinessUnit || "",
    ProcessingLab: state?.data?.ProcessingLab || "",
    PaymentMode: state?.data?.PaymentMode || "",
    MinCashBookingReceive: state?.data?.MinCashBookingReceive || "",
    SkipTimeType: state?.data?.skipTimeType || "",
    SkipValue: state?.data?.skipValue || "",
    AllowInvoice: state?.data?.AllowInvoice || "",
    InvoiceTo: state?.data?.InvoiceTo || "",
    SetMrp: state?.data?.SetMRP || "",
    ReferenceRate: state?.data?.ReferenceRate || "",
    ShareRate: state?.data?.CentreID || "",
    InvoiceCode: state?.data?.InvoiceCode || "",
    InvoiceDisplayName: state?.data?.InvoiceDisplayName || "",
    InvoiceBillingCycle: state?.data?.InvoiceBillingCycle || "Monthly",
    AgainstInvoice: state?.data?.AgainstInvoice || "",
    IntimationLimit: state?.data?.IntimationLimit || "",
    EmailIDInvoice: state?.data?.InvoiceEmail || "",
    SalesManager: state?.data?.SalesManager || "",
    FieldBoy: state?.data?.FieldBoyID || "",
    ConfigAllowInvoice: state?.data?.AgainstInvoice ?? 0,

    //Configuration
    PortalAccess: state?.data?.PortalType || "",
    UserName: state?.data?.UserName || "",
    Password: state?.data?.Password || "",
    BarcodeType: state?.data?.BarcodeLogic || "",
    BarcodePrint: state?.data?.BarcodePrint || "",
    IsReceiptRequired: state?.data?.IsReceiptRequired || [],
    NotificationAlert: state?.data?.NotificationAlert || "",
    HideNablLogo: state?.data?.HideNablLogo ?? 0,
    HideSignature: state?.data?.HideSignature ?? 0,
    HideReceipt: state?.data?.HideReceipt ?? 0,
    OnlyFullPaidReceipt: state?.data?.OnlyFullPaidReceipt ?? 0,
    AllowDoctorShare: state?.data?.AllowDoctorShare ?? 0,
    AllowPanelShare: state?.data?.AllowPanelShare ?? 0,
    HideAmount: state?.data?.HideAmount ?? 0,
    PRDMConfiguration: state?.data?.PRDMConfiguration ?? 0,
    LockRegist: state?.data?.LockRegist ?? 0,
    LockReport: state?.data?.LockReport ?? 0,
    IsAutoPRDM: state?.data?.IsAutoPRDM ?? 0,
    AllowPaymentGateway: state?.data?.AllowPaymentGateway ?? 0,
    IsSampleReCollection: state?.data?.IsSampleReCollection ?? 0,
    AutoDepartmentReceive: state?.data?.AutoDepartmentReceive ?? 0,
    centreIDHash: state?.data?.centreIDHash
      ? state?.data?.centreIDHash
      : guidNumber(),
  });

  console.log("formDataformDataformData", formData);

  //   useEffect(() => {
  //     if (name === "center") {
  //       setFormData({
  //         dtEntry: state?.data?.dtEntry ? state?.data?.dtEntry : new Date(),
  //         DataType: state?.data?.DataType ? state?.data?.DataType : "Centre",
  //         CentreCode: state?.data?.CentreCode ? state?.data?.CentreCode : "",
  //         Centre: state?.data?.Centre ? state?.data?.Centre : "",
  //         CentreType: state?.data?.CentreType
  //           ? state?.data?.CentreType
  //           : "Booking",
  //         InvoiceTo: state?.data?.InvoiceTo ? state?.data?.InvoiceTo : "Self",
  //         BusinessUnit: state?.data?.BusinessUnit
  //           ? state?.data?.BusinessUnit
  //           : "Self",
  //         ProcessingLab: state?.data?.ProcessingLab
  //           ? state?.data?.ProcessingLab
  //           : "Self",
  //         ReferenceRate: state?.data?.ReferenceRate
  //           ? state?.data?.ReferenceRate
  //           : "Self",
  //         Type: state?.data?.Type ? state?.data?.Type : "",
  //         Address1: state?.data?.Address1 ? state?.data?.Address1 : "",
  //         Address2: state?.data?.Address2 ? state?.data?.Address2 : "",
  //         City: state?.data?.City ? state?.data?.City : "",
  //         BusinessZone: state?.data?.BusinessZone
  //           ? state?.data?.BusinessZone
  //           : "",
  //         State: state?.data?.State ? state?.data?.State : "",
  //         Country: state?.data?.Country ? state?.data?.Country : "",
  //         Pincode: state?.data?.Pincode ? state?.data?.Pincode : "",
  //         Email: state?.data?.Email ? state?.data?.Email : "",
  //         LandLineNo: state?.data?.LandLineNo ? state?.data?.LandLineNo : "",
  //         Phone: state?.data?.Phone ? state?.data?.Phone : "",
  //         StateCode: state?.data?.StateCode ? state?.data?.StateCode : "",
  //         Fax: state?.data?.Fax ? state?.data?.Fax : "",
  //         Url: state?.data?.Url ? state?.data?.Url : "",
  //         PaymentMode: state?.data?.PaymentMode
  //           ? state?.data?.PaymentMode
  //           : "Cash",
  //         VisitType: state?.data?.VisitType ? state?.data?.VisitType : 1,
  //         BarcodeLogic: state?.data?.BarcodeLogic ? state?.data?.BarcodeLogic : 1,
  //         SampleCollectandReceive: state?.data?.SampleCollectandReceive
  //           ? state?.data?.SampleCollectandReceive
  //           : 0,
  //         CityZone: state?.data?.CityZone ? state?.data?.CityZone : "",
  //         ReferenceRate1: state?.data?.ReferenceRate1
  //           ? state?.data?.ReferenceRate1
  //           : 0,
  //         ReferenceRate2: state?.data?.ReferenceRate2
  //           ? state?.data?.ReferenceRate2
  //           : 0,
  //         IsTrfRequired: state?.data?.IsTrfRequired
  //           ? state?.data?.IsTrfRequired
  //           : 0,
  //         IsDepartmentSlip: state?.data?.IsDepartmentSlip
  //           ? state?.data?.IsDepartmentSlip
  //           : 0,
  //         IsSampleRecollection: state?.data?.IsSampleRecollection
  //           ? state?.data?.IsSampleRecollection
  //           : 0,
  //         HideAmount: state?.data?.HideAmount ? state?.data?.HideAmount : 0,
  //         HideReceipt: state?.data?.HideReceipt ? state?.data?.HideReceipt : 0,
  //         IsDoctorShareRequired: state?.data?.IsDoctorShareRequired
  //           ? state?.data?.IsDoctorShareRequired
  //           : 0,
  //         isActive: state?.data ? state?.data?.isActive : 1,
  //         CentreID: state?.data?.CentreID ? state?.data?.CentreID : 0,
  //         UserName: state?.data?.Username ? state?.data?.Username : "",
  //         Password: state?.data?.Password ? state?.data?.Password : "",
  //         isAllowedLogin: state?.data?.IsAllowedLogin
  //           ? state?.data?.IsAllowedLogin
  //           : 0,
  //         userLoginID: state?.data?.userLoginID ? state?.data?.userLoginID : 0,
  //         centreIDHash: state?.data?.centreIDHash
  //           ? state?.data?.centreIDHash
  //           : guidNumber(),
  //         AgainstInvoice: state?.data?.AgainstInvoice
  //           ? state?.data?.AgainstInvoice
  //           : "0",
  //         isNabl: state?.data?.isNabl ? state?.data?.isNabl : 0,
  //         SecurityRemark: state?.data?.SecurityRemark
  //           ? state?.data?.SecurityRemark
  //           : "",
  //         SecurityAmount: state?.data?.SecurityAmount
  //           ? state?.data?.SecurityAmount
  //           : "",
  //         DemandDraft: state?.data?.DemandDraft ? state?.data?.DemandDraft : "",
  //         BenificialName: state?.data?.BenificialName
  //           ? state?.data?.BenificialName
  //           : "",
  //         BankAccountNo: state?.data?.BankAccountNo
  //           ? state?.data?.BankAccountNo
  //           : "",
  //         bankName: state?.data?.bankName ? state?.data?.bankName : "",
  //         IFSCCode: state?.data?.IFSCCode ? state?.data?.IFSCCode : "",
  //         BranchAddress: state?.data?.BranchAddress
  //           ? state?.data?.BranchAddress
  //           : "",
  //         PANNo: state?.data?.PANNo ? state?.data?.PANNo : "",
  //         Description: state?.data?.Description ? state?.data?.Description : "",
  //         RegisteredOffice: state?.data?.RegisteredOffice
  //           ? state?.data?.RegisteredOffice
  //           : "",
  //         Gstin: state?.data?.Gstin ? state?.data?.Gstin : "",
  //         FullyPaid: state?.data?.FullyPaid ? state?.data?.FullyPaid : 0,
  //         SetMRP: state?.data?.SetMRP ? state?.data?.SetMRP : 0,
  //         skipTimeType: state?.data?.skipTimeType
  //           ? state?.data?.skipTimeType
  //           : "NA",
  //         CreditLimitInRs: state?.data?.CreditLimitInRs
  //           ? state?.data?.CreditLimitInRs
  //           : "",
  //         CreditLimitInTime: state?.data?.CreditLimitInTime
  //           ? state?.data?.CreditLimitInTime
  //           : "",
  //         skipValue: state?.data?.skipValue ? state?.data?.skipValue : "0",
  //         isAutoEmail: state?.data?.isAutoEmail ? state?.data?.isAutoEmail : 0,
  //         IncludeDoctorShare: state?.data?.IncludeDoctorShare
  //           ? state?.data?.IncludeDoctorShare
  //           : 0,
  //       });
  //     } else if (name === "Rate") {
  //       setFormData({
  //         dtEntry: state?.data?.dtEntry ? state?.data?.dtEntry : new Date(),

  //         Type: state?.data?.Type ? state?.data?.Type : "",
  //         DataType: state?.data?.DataType ? state?.data?.DataType : "RateType",
  //         CentreCode: state?.data?.CentreCode ? state?.data?.CentreCode : "",
  //         Centre: state?.data?.Centre ? state?.data?.Centre : "",
  //         CentreType: state?.data?.CentreType ? state?.data?.CentreType : "",
  //         AgainstInvoice: state?.data?.AgainstInvoice
  //           ? state?.data?.AgainstInvoice
  //           : "0",
  //         InvoiceTo: state?.data?.InvoiceTo ? state?.data?.InvoiceTo : "Self",
  //         BusinessUnit: state?.data?.BusinessUnit
  //           ? state?.data?.BusinessUnit
  //           : "Self",
  //         ProcessingLab: state?.data?.ProcessingLab
  //           ? state?.data?.ProcessingLab
  //           : "Self",
  //         ReferenceRate: state?.data?.ReferenceRate
  //           ? state?.data?.ReferenceRate
  //           : "Self",
  //         Address1: state?.data?.Address1 ? state?.data?.Address1 : "",
  //         Address2: state?.data?.Address2 ? state?.data?.Address2 : "",
  //         City: state?.data?.City ? state?.data?.City : "",
  //         BusinessZone: state?.data?.BusinessZone
  //           ? state?.data?.BusinessZone
  //           : "",
  //         State: state?.data?.State ? state?.data?.State : "",
  //         Country: state?.data?.Country ? state?.data?.Country : "",
  //         Pincode: state?.data?.Pincode ? state?.data?.Pincode : "",
  //         Email: state?.data?.Email ? state?.data?.Email : "",
  //         LandLineNo: state?.data?.LandLineNo ? state?.data?.LandLineNo : "",
  //         Phone: state?.data?.Phone ? state?.data?.Phone : "",
  //         StateCode: state?.data?.StateCode ? state?.data?.StateCode : "",
  //         Fax: state?.data?.Fax ? state?.data?.Fax : "",
  //         Url: state?.data?.Url ? state?.data?.Url : "",
  //         PaymentMode: state?.data?.PaymentMode
  //           ? state?.data?.PaymentMode
  //           : "Cash",
  //         VisitType: state?.data?.VisitType ? state?.data?.VisitType : 1,
  //         BarcodeLogic: state?.data?.BarcodeLogic ? state?.data?.BarcodeLogic : 1,
  //         SampleCollectandReceive: state?.data?.SampleCollectandReceive
  //           ? state?.data?.SampleCollectandReceive
  //           : 0,
  //         CityZone: state?.data?.CityZone ? state?.data?.CityZone : "",
  //         ReferenceRate1: state?.data?.ReferenceRate1
  //           ? state?.data?.ReferenceRate1
  //           : 0,
  //         ReferenceRate2: state?.data?.ReferenceRate2
  //           ? state?.data?.ReferenceRate2
  //           : 0,
  //         IsTrfRequired: state?.data?.IsTrfRequired
  //           ? state?.data?.IsTrfRequired
  //           : 0,
  //         IsDepartmentSlip: state?.data?.IsDepartmentSlip
  //           ? state?.data?.IsDepartmentSlip
  //           : 0,
  //         IsSampleRecollection: state?.data?.IsSampleRecollection
  //           ? state?.data?.IsSampleRecollection
  //           : 0,
  //         HideAmount: state?.data?.HideAmount ? state?.data?.HideAmount : 0,
  //         HideReceipt: state?.data?.HideReceipt ? state?.data?.HideReceipt : 0,
  //         IsDoctorShareRequired: state?.data?.IsDoctorShareRequired
  //           ? state?.data?.IsDoctorShareRequired
  //           : 0,
  //         isActive: state?.data ? state?.data?.isActive : 1,
  //         CentreID: state?.data?.CentreID ? state?.data?.CentreID : 0,
  //         UserName: state?.data?.Username ? state?.data?.Username : "",
  //         Password: state?.data?.Password ? state?.data?.Password : "",
  //         isAllowedLogin: state?.data?.IsAllowedLogin
  //           ? state?.data?.IsAllowedLogin
  //           : 0,
  //         userLoginID: state?.data?.userLoginID ? state?.data?.userLoginID : 0,
  //         centreIDHash: state?.data?.centreIDHash
  //           ? state?.data?.centreIDHash
  //           : guidNumber(),

  //         CreditLimit:
  //           state?.data?.CreditLimit !== undefined &&
  //           state?.data?.CreditLimit !== null
  //             ? state?.data?.CreditLimit
  //             : state?.data?.CreditLimit === 0
  //               ? 0
  //               : "",
  //         SecurityAmount: state?.data?.SecurityAmount
  //           ? state?.data?.SecurityAmount
  //           : "",
  //         LockRegistration: state?.data?.LockRegistration
  //           ? state?.data?.LockRegistration
  //           : 0,
  //         LockReport: state?.data?.LockReport ? state?.data?.LockReport : 0,
  //         isAutoEmail: state?.data?.isAutoEmail ? state?.data?.isAutoEmail : 0,
  //         IsRollingAdvance: state?.data?.IsRollingAdvance
  //           ? state?.data?.IsRollingAdvance
  //           : 0,
  //         GraceTime: state?.data?.GraceTime ? state?.data?.GraceTime : "",
  //         SecurityRemark: state?.data?.SecurityRemark
  //           ? state?.data?.SecurityRemark
  //           : "",
  //         IntimationLimit:
  //           state?.data?.IntimationLimit !== undefined &&
  //           state?.data?.IntimationLimit !== null
  //             ? state?.data?.IntimationLimit
  //             : state?.data?.IntimationLimit === 0
  //               ? 0
  //               : "",
  //         InvoiceDisplayName: state?.data?.InvoiceDisplayName
  //           ? state?.data?.InvoiceDisplayName
  //           : "",
  //         InvoiceEmail: state?.data?.InvoiceEmail
  //           ? state?.data?.InvoiceEmail
  //           : "",
  //         SalesManager: state?.data?.SalesManager
  //           ? state?.data?.SalesManager
  //           : "",
  //         BillingCycle: state?.data?.BillingCycle
  //           ? state?.data?.BillingCycle
  //           : "Monthly",
  //         Gstin: state?.data?.Gstin ? state?.data?.Gstin : "",
  //         ProEmployee: state?.data?.ProEmployee ? state?.data?.ProEmployee : "",
  //         BankAccountNo: state?.data?.BankAccountNo
  //           ? state?.data?.BankAccountNo
  //           : "",
  //         FullyPaid: state?.data?.FullyPaid ? state?.data?.FullyPaid : 0,
  //         SetMRP: state?.data?.SetMRP ? state?.data?.SetMRP : 0,
  //         skipTimeType: state?.data?.skipTimeType
  //           ? state?.data?.skipTimeType
  //           : "NA",
  //         CreditLimitInRs: state?.data?.CreditLimitInRs
  //           ? state?.data?.CreditLimitInRs
  //           : "",
  //         CreditLimitInTime: state?.data?.CreditLimitInTime
  //           ? state?.data?.CreditLimitInTime
  //           : "",
  //         skipValue: state?.data?.skipValue ? state?.data?.skipValue : "0",
  //         IsAutoPRDM: state?.data?.IsAutoPRDM ? state?.data?.IsAutoPRDM : 0,
  //       });
  //     }
  //   }, [name]);

  //fetching document required
  const getRequiredAttachment = () => {
    axiosInstance
      .post("Global/GetGlobalData", {
        Type: "RequiredAttachment",
      })
      .then((res) => {
        let data = res.data.message;
        let RequiredAttachment = data.map((ele) => {
          return {
            value: ele.FieldDisplay,
            label: ele.FieldDisplay,
          };
        });
        setDoc(RequiredAttachment);
      })
      .catch((err) => console.log(err));
  };

  const getInvoiceTo = () => {
    axiosInstance
      .get("CentreManager/CentreInvoiceToList")
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
      .get("CentreManager/CentreBusinessUnit")
      .then((res) => {
        let data = res.data.message;
        let CentreBusinessUnit = data.map((ele) => {
          return {
            value: ele.BusinessUnitID,
            label: ele.BusinessUnit,
          };
        });
        CentreBusinessUnit.unshift({ label: "Self", value: "Self" });
        setBusinessUnit(CentreBusinessUnit);
      })
      .catch((err) => console.log(err));
  };
  const getCentreProcessingLab = () => {
    axiosInstance
      .get("CentreManager/CentreProcessingLab")
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
        .post("CentreManager/checkDuplicateCentreCode", {
          CentreCode: formData?.CentreCode,
          CentreID: formData?.CentreID != 0 ? formData?.CentreID : "",
        })
        .then((res) => {
          if (res?.data?.message === "Duplicate CentreCode.") {
            toast.error(res?.data?.message);
            setFormData({ ...formData, CentreCode: "" });
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
      .get("CentreManager/CentreReferRateList")
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
      .get("CentreManager/visitTypeList")
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
      .get("CentreManager/BarcodeLogicList")
      .then((res) => {
        let data = res.data.message;
        let Barcode = data.map((ele) => {
          return {
            value: ele.BarcodeID,
            label: ele.BarcodeDisplay,
          };
        });
        setBarCodeLogic(Barcode);
      })
      .catch((err) => console.log(err));
  };

  const getfiledboyId = () => {
    axiosInstance
      .get("CentreManager/getfiledboyId")
      .then((res) => {
        let data = res.data.message;
        let Barcode = data.map((ele) => {
          return {
            value: ele.FieldBoyID,
            label: ele.NAME,
          };
        });
        setfiledboyId(Barcode);
      })
      .catch((err) => console.log(err));
  };
  const getMrp = () => {
    axiosInstance
      .get("CentreManager/getMrp")
      .then((res) => {
        let data = res.data.message;
        let Barcode = data.map((ele) => {
          return {
            value: String(ele.CentreID),
            label: `${ele.SetMrp}`,
          };
        });
        setMrpData(Barcode);
      })
      .catch((err) => console.log(err));
  };
  const getshareinvoicerate = () => {
    axiosInstance
      .get("CentreManager/getshareinvoicerate")
      .then((res) => {
        let data = res.data.message;
        let Barcode = data.map((ele) => {
          return {
            value: ele.CentreID,
            label: ele.InvoiceTo,
          };
        });
        getShareInvoiCerate(Barcode);
      })
      .catch((err) => console.log(err));
  };
  const getReference = () => {
    axiosInstance
      .get("CentreManager/getReference")
      .then((res) => {
        let data = res.data.message;
        let Barcode = data.map((ele) => {
          return {
            value: ele.CentreID,
            label: ele.ReferenceRate,
          };
        });
        getReferenceData(Barcode);
      })
      .catch((err) => console.log(err));
  };
  console.log("BasicDetailsCentreType", BasicDetailsCentreType);

  const getAllsalesManager = () => {
    axiosInstance
      .get("Accounts/getAllsalesManager")
      .then((res) => {
        let data = res.data.message;
        let VisitTypeList = data.map((ele) => {
          return {
            value: ele.PROID,
            label: ele.ProName,
          };
        });
        setAllsalesManager(VisitTypeList);
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
  // console.log(formData);
  const { errors, handleBlur, touched, handleSubmit } = useFormik({
    initialValues: formData,
    enableReinitialize: state?.url ? true : true,
    validationSchema:
      name === "center"
        ? CenterMasterValidationSchema
        : formData?.PaymentMode === "Credit"
          ? RateMasterValidationSchema
          : RateMasterValidationSchemacash,
    onSubmit: (values) => {
      if ([1, 2, 3, 4, 5].includes(formData?.Pincode.length)) {
        toast.error("Please Enter Correct Pin Code");
      } else {
        setLoad(true);
        handleCheckDuplicate().then((res) => {
          if (res === "Duplicate CentreCode.") {
            setLoad(false);
          } else {
            axiosInstance
              .post(
                state?.url ? state?.url : "CentreManager/InsertCentre",
                getTrimmedData({
                  ...values,
                  InvoiceTo:
                    values?.InvoiceTo === "Self" ? 0 : values?.InvoiceTo,
                  BusinessUnit:
                    values?.BusinessUnit === "Self" ? 0 : values?.BusinessUnit,
                  ProcessingLab:
                    values?.ProcessingLab === "Self"
                      ? 0
                      : values?.ProcessingLab,
                  ReferenceRate:
                    values?.ReferenceRate === "Self"
                      ? 0
                      : values?.ReferenceRate,
                  skipTimeType: values?.skipTimeType?.toString(),
                  skipValue: values?.skipValue?.toString(),
                  isActive: values?.isActive ? 1 : 0,
                  isNabl: values?.isNabl ? 1 : 0,
                }),
              )
              .then((res) => {
                if (res.data.message) {
                  navigate(`/CentreMasterList`);
                  toast.success(res.data.message);
                  setLoad(false);
                } else {
                  toast.error("Something went wrong");
                  toast.success(res.data.message);
                  setLoad(false);
                }
              })
              .catch((err) => {
                toast.error(
                  err?.response?.data?.message
                    ? err?.response?.data?.message
                    : "Error Occured",
                );
                setLoad(false);
              });
          }
        });
      }
    },
  });
  //   const handleChange = (e) => {
  //     const { name, value, type, checked } = e.target;
  //     const reg = /^([^0-9$%]*)$/;

  //     if (name === "CentreCode") {
  //       setFormData({
  //         ...formData,
  //         [name]: ["CentreCode"].includes(name)
  //           ? PreventSpecialCharacter(value)
  //             ? value.toUpperCase()
  //             : formData[name]
  //           : value.toUpperCase(),
  //       });
  //     } else if (name == "skipTimeType") {
  //       setFormData({
  //         ...formData,
  //         [name]: value,
  //         skipValue: "",
  //       });
  //     } else if (
  //       name === "BankAccountNo" ||
  //       name === "IFSCCode" ||
  //       name === "PANNo"
  //     ) {
  //       setFormData({
  //         ...formData,
  //         [name]: PreventSpecialCharacter(value) ? value : formData[name],
  //       });
  //     } else if (name === "Centre") {
  //       setFormData({
  //         ...formData,
  //         [name]: value,
  //       });
  //     } else {
  //       setFormData({
  //         ...formData,
  //         [name]:
  //           type === "checkbox"
  //             ? checked
  //               ? 1
  //               : 0
  //             : [
  //                   "City",
  //                   "State",
  //                   "Country",
  //                   "CityZone",
  //                   "BusinessZone",
  //                   "BenificialName",
  //                   "bankName",
  //                   "InvoiceDisplayName",
  //                 ].includes(name)
  //               ? PreventNumber(value)
  //                 ? value
  //                 : formData[name]
  //               : [""].includes(name)
  //                 ? PreventSpecialCharacter(value)
  //                   ? value
  //                   : formData[name]
  //                 : value,
  //       });
  //     }
  //   };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (name === "MinCashBookingReceive") {
      // convert to number
      const num = Number(value);

      if (num > 100) {
        notify("less than 100.", "error");
        return; // stop updating state
      }

      setFormData({
        ...formData,
        [name]: num, // store number
      });
      return;
    }

    const reg = /^([^0-9$%]*)$/;

    if (name === "CentreCode") {
      setFormData({
        ...formData,
        [name]: ["CentreCode"].includes(name)
          ? PreventSpecialCharacter(value)
            ? value.toUpperCase()
            : formData[name]
          : value.toUpperCase(),
      });
    } else if (name == "skipTimeType") {
      setFormData({
        ...formData,
        [name]: value,
        skipValue: "",
      });
    } else if (
      name === "BankAccountNo" ||
      name === "IFSCCode" ||
      name === "PANNo"
    ) {
      setFormData({
        ...formData,
        [name]: PreventSpecialCharacter(value) ? value : formData[name],
      });
    } else if (name === "Centre") {
      setFormData({
        ...formData,
        [name]: value,
      });
    } else {
      setFormData({
        ...formData,
        [name]:
          type === "checkbox"
            ? checked
              ? 1
              : 0
            : [
                  "City",
                  "State",
                  "Country",
                  "CityZone",
                  "BusinessZone",
                  "BenificialName",
                  "bankName",
                  "InvoiceDisplayName",
                ].includes(name)
              ? PreventNumber(value)
                ? value
                : formData[name]
              : [""].includes(name)
                ? PreventSpecialCharacter(value)
                  ? value
                  : formData[name]
                : value,
      });
    }
  };

  const dateSelect = (value, name) => {
    setFormData({
      ...formData,
      [name]: value,
    });
  };
  const getTypeName = () => {
    const btb = type?.filter((ele) => ele?.value == formData?.Type);
    if (btb[0]?.label == "B2B") return true;
    else return false;
  };
  const handleSelectChange = (e) => {
    const { name, value } = e.target;
    if (name == "PaymentMode") {
      setFormData({
        ...formData,
        [name]: value,
        IntimationLimit: "",
        CreditLimit: "",
        AgainstInvoice: "",
        IsRollingAdvance: 0,
        skipValue: "",
        skipTimeType: "",
        CreditLimitInRs: "",
        CreditLimitInTime: "",
        LockRegistration: 0,
        LockReport: 0,
      });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };
  const handleSelectMultiChange = (name, value) => {
    // const val = select.map((ele) => {
    //   return ele?.value;
    // });
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  //   const [dropDownList, setDropdownlist] = useState({
  //     hideRoleList: VisitType,
  //     IsReceiptRequired: [{}],
  //   });
  const [dropDownList, setDropdownlist] = useState({
    hideRoleList: VisitType,
    IsReceiptRequired: [
      { label: "TRF", value: 1 },
      { label: "Receipt", value: 2 },
      { label: "Department Slip", value: 3 },
    ],
  });
  const handleSearchSelectChange = (label, value) => {
    setFormData({ ...formData, [label]: value?.value });
  };

  const getType = () => {
    axiosInstance
      .get("CentreManager/getCentreType")
      .then((res) => {
        const data = res?.data?.message;
        const Type = data?.map((ele) => {
          return {
            value: ele?.id,
            label: ele?.Centretype,
          };
        });
        setBasicDetailsCentreType(Type);
      })
      .catch((err) => {
        toast.error(err?.res?.data ? err?.res?.data : "Something Went Wrong");
      });
  };

  const getSalesManager = () => {
    axiosInstance
      .get("Accounts/getAllsalesManager")
      .then((res) => {
        const data = res?.data?.message;

        const Type = data?.map((ele) => {
          return {
            value: ele?.PROID,
            label: ele?.ProName,
          };
        });
        setSalesManager(Type);
      })
      .catch((err) => {
        toast.error(err?.res?.data ? err?.res?.data : "Something Went Wrong");
      });
  };

  const handleToggleChange = (e) => {
    const { name, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: checked ? 1 : 0, // convert boolean → 0/1
    }));
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
    getType();
    getProEmployee();
    getAllsalesManager();
    getfiledboyId();
    getReference();
    getshareinvoicerate();
    getMrp();
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

  function getlabel(id) {
    const ele = BasicDetailsCentreType.find((item) => item.value === id);
    return ele ? ele.label : "";
  }

  console.log('formData?.PortalAccess', formData?.PortalAccess);
  console.log("formData?.BusinessUnit", formData);
  const handleSubmitCenterManagerData = async () => {
    // if (!formData?.centreName) {

    //   notify("Centre is required.", "error");
    //   return;
    // }
    // if (!formData?.paymentMode) {
    //   notify("Payment mode is required.", "error");
    //   return;
    // }


    const toIsoDateTime = (value) => {
      const d = new Date(value);
      return isNaN(d) ? "" : d.toISOString();
    };
    const payload = {
      username: String(formData?.UserName || ""),
      password: String(formData?.Password || ""),
      gstin: String(formData?.GSTNO || ""),
      dataType: String(formData?.DataType || ""),
      centreCode: String(formData?.CenterCode || ""),
      uhidCode: String(formData?.UHIDCode || ""),
      centre: String(formData?.CentreName || ""),
      ContactPersonMobile: String(formData?.CentreMobile || ""),
      ContactPersonEmail: String(formData?.CentreEmail || ""),
      centreType: getlabel(Number(formData?.CentreType)),
      invoiceTo: Number(formData?.InvoiceTo || 0),
      businessUnit: Number(formData?.BusinessUnit || 0),
      processingLab: Number(formData?.ProcessingLab || 0),
      referenceRate: Number(formData?.ReferenceRate || 0),
      address1: String(formData?.Address1 || ""),
      address2: String(formData?.Address2 || ""),
      city: String(formData?.City || ""),
      businessZone: String(formData?.BusinessZone || ""),
      state: String(formData?.State || ""),
      country: String(formData?.Country || ""),
      pincode: String(formData?.Pincode || ""),
      email: String(formData?.EmailID || ""),
      landLineNo: String(formData?.LandLine || ""),
      phone: String(formData?.Mobile || ""),
      stateCode: String(formData?.State || ""),
      paymentMode: String(formData?.PaymentMode || ""),
      visitType: Array.isArray(formData?.VisitType)
        ? formData.VisitType.join(",")
        : String(formData?.VisitType || ""),
      barcodeLogic: Number(formData?.BarcodeType || 0),
      sampleCollectandReceive: String(formData?.IsSampleReCollection || ""),
      cityZone: String(formData?.CityZone || ""),
      referenceRate1: Number(formData?.ReferenceRate || 0),
      referenceRate2: Number(formData?.ReferenceRate || 0),
      isTrfRequired: String(formData?.IsTrfRequired || 0),
      isPrefixRequired: String(formData?.IsPrefixRequired || ""),
      isActive: Number(formData?.Status || 0),
      centreIDHash: String(formData?.CentreIDHash || ""),
      isNabl: Number(formData?.HideNablLogo || 0),
      createdDate: String(formData?.CreatedDate || ""),
      modifiedDate: String(formData?.ModifiedDate || ""),
      creditLimit: String(formData?.CreditLimit || ""),
      securityAmount: String(formData?.SecurityAmount || ""),
      graceTime: String(formData?.GraceTime || ""),
      lockRegistration: Number(formData?.LockRegistration || 0),
      lockReport: Number(formData?.LockReport || 0),
      Type: String(formData?.CentreType || ""),
      againstInvoice: String(formData?.AgainstInvoice || ""),
      demandDraft: String(formData?.DemandDraft || ""),
      benificialName: String(formData?.BenefecialName || ""),
      bankAccountNo: String(formData?.BankAccountNo || ""),
      branchAddress: String(formData?.BrachAddress || ""),
      panNo: String(formData?.PanNo || ""),
      PanName: String(formData?.NamePanCard || ""),
      description: String(formData?.ACDescription || ""),
      registeredOffice: String(formData?.RegisteredOffice || ""),
      isRollingAdvance: Number(formData?.IsRollingAdvance || 0),
      invoiceDisplayName: String(formData?.InvoiceDisplayName || ""),
      invoiceEmail: String(formData?.EmailIDInvoice || ""),
      salesManager: String(formData?.SalesManager || ""),
      bankName: String(formData?.BankName || ""),
      ifscCode: String(formData?.IFSCCode || ""),
      intimationLimit: String(formData?.IntimationLimit || ""),
      billingCycle: String(formData?.InvoiceBillingCycle || ""),
      isSampleRecollection: String(formData?.IsSampleReCollection || ""),
      hideAmount: String(formData?.HideAmount || ""),
      hideReceipt: String(formData?.HideReceipt || ""),
      isDoctorShareRequired: String(formData?.AllowDoctorShare || ""),
      isDepartmentSlip: String(formData?.AutoDepartmentReceive || ""),
      fullyPaid: String(formData?.OnlyFullPaidReceipt || ""),
      SetMrp: String(formData?.SetMrp || ""),
      proEmployee: String(formData?.ProEmployee || ""),
      skipTimeType: String(formData?.SkipTimeType || ""),
      skipValue: String(formData?.SkipValue || ""),
      isAutoPRDM: Number(formData?.IsAutoPRDM || 0),
      includeDoctorShare: Number(formData?.IncludeDoctorShare || 0),
      website: String(formData?.Website || ""),
      contactPersonDesignation: String(
        formData?.ContactPersonDesignation || "",
      ),
      aadharCardNo: String(formData?.AadharCardNo || ""),
      MinCashBookingReceive: Number(formData?.MinCashBookingReceive || ""),
      invoiceCode: String(formData?.InvoiceCode || ""),
      fieldBoyID: Number(formData?.FieldBoy || 0),
      feildBoyName: String(formData?.FeildBoyName || ""),
      portalType: Number(formData?.PortalAccess || 0),
      barcodePrintLogic: Number(formData?.BarcodePrint || ""),
      isReceiptRequired: Array.isArray(formData?.IsReceiptRequired)
        ? formData.IsReceiptRequired.join(",")
        : String(formData?.IsReceiptRequired || ""),
      hideNablLogo: Number(formData?.HideNablLogo || 0),
      HideSignature: Number(formData?.HideSignature || 0),
      HideReceipt: Number(formData?.HideReceipt || 0),
      OnlyFullPaidReceipt: Number(formData?.OnlyFullPaidReceipt || 0),
      AllowDoctorShare: Number(formData?.AllowDoctorShare || 0),
      AllowPanelShare: Number(formData?.AllowPanelShare || 0),
      HideAmount: Number(formData?.HideAmount || 0),
      PRDMConfiguration: Number(formData?.PRDMConfiguration || 0),
      LockRegist: Number(formData?.LockRegist || 0),
      LockReport: Number(formData?.LockReport || 0),
      IsAutoPRDM: Number(formData?.IsAutoPRDM || 0),
      AllowPaymentGateway: Number(formData?.AllowPaymentGateway || 0),
      IsSampleReCollection: Number(formData?.IsSampleReCollection || 0),
      AutoDepartmentReceive: Number(formData?.AutoDepartmentReceive || 0),

      isRateTypeShareRequired: Number(formData?.IsRateTypeShareRequired || 0),
      allowPaymentGateway: Number(formData?.AllowPaymentGateway || 0),
      contactToDate: toIsoDateTime(formData?.ContactToDate),
      centreID: Number(state?.data?.CentreID) || "",
      CompanyID: "",
    };

    try {
      const apiEndpoint = state?.other?.button
        ? apiUrls.UpdateCentre
        : apiUrls.InsertCentre;
      const res = await axiosInstance.post(apiEndpoint, payload);
      console.log("InsertCentre", res.data);
      if (res.data?.success) {
        notify(res?.data?.message, "success");
        // setFormData({
        //   centreName: "",
        //   paymentMode: "",
        //   transactionDate: new Date(),
        //   amount: "",
        //   TransactionID: "",
        //   receiptFile: null,
        //   adjustment: false,
        //   remarks: "",
        // });
        setshowpopup(false);
        dispatch(clearFiles());
        handlesearch();
      } else {
        notify(res?.data?.message, "error");
      }
    } catch (err) {
      console.log(err);
      notify(err?.data?.data?.message, "error");
    }
  };

  console.log("formData222", formData);
  const handleSelctData = (data) => {
    const { years, months, days } = calculateDOB(new Date(data?.DOB));
    handlePreviewImage(data?.PatientGuid);
    setState({
      ...state,
      Title: data.Title,
      FirstName: data.FirstName,
      LastName: data?.LastName,
      MiddleName: data?.MiddleName,
      //  CentreID: data?.CentreID,
      //   RateID: data?.RateTypeId,
      // AgeYear: data?.AgeYear,
      // AgeMonth: data?.AgeMonth,
      // AgeDays: data?.AgeDays,
      Mobile: data?.Mobile,
      Gender: data?.Gender,
      DOB: new Date(data?.DOB),
      Age: data?.Age,
      PatientCode: data?.PatientCode,
      Email: data?.Email,
      PinCode: data?.Pincode,
      AgeDays: days,
      AgeMonth: months,
      AgeYear: years,
      HouseNo: data?.HouseNo,
      City: data?.City,
      State: data?.State,
      Country: data?.Country,
      StreetName: data?.StreetName,
      IsMask: data?.IsMask,
      isVIP: data?.IsVIP,
      Locality: data?.Locality,
      TotalAgeInDays: calculateTotalNumberOfDays(new Date(data?.DOB)),
    });

    const testDetails =
      suggestionData?.testSuggestions?.Total?.length > 0
        ? suggestionData?.testSuggestions?.Total?.filter(
            (ele) => ele?.patientcode == data?.PatientCode,
          )
        : [];

    if (testDetails?.length > 0) {
      setSuggestionData((ele) => ({
        ...ele,
        show: true,
        testSuggestions: {
          ...suggestionData?.testSuggestions,
          data: testDetails,
          show: true,
        },
      }));
    }
    SetPatientGuid(
      data?.PatientGuid && data?.PatientGuid !== ""
        ? data?.PatientGuid
        : PatientGuid,
    );
    handleUploadCount(
      "UploadDocumentCount",
      data?.DocumentUplodedCount,
      "IsDocumentUploaded",
      "MedicalHistoryCount",
      data?.MedicalHistoryCount,
      "IsMedicalHistory",
    );
    setShowOP(false);
    // handleUploadCount(
    //   "UploadDocumentCount",
    //   data?.MedicalHistoryCount,
    //   "IsDocumentUploaded"
    // );

    // setLTData({
    //   ...LTData,
    // //  CentreName: centreName.label,
    //   CentreID: centreName.value,
    // });
    handleClose4();
    setThroughMobileData(true);
    setMobileData([]);
  };
  const [showOP, setShowOP] = useState(false);
  return (
    <>
      {show && (
        <UploadFile
          show={show}
          handleClose={() => setShow(false)}
          documentId={formData?.centreIDHash}
          pageName={"UploadHeader"}
        />
      )}

      {show1 && (
        <UploadFile
          show={show1}
          handleClose={() => setShow1(false)}
          documentId={formData?.centreIDHash}
          pageName={"UploadFooter"}
        />
      )}

      {show2 && (
        <UploadFile
          show={show2}
          handleClose={() => setShow2(false)}
          documentId={formData?.centreIDHash}
          pageName={"UploadReceiptLogo"}
        />
      )}

      {show3 && (
        <UploadFile
          show={show3}
          handleClose={() => setShow3(false)}
          documentId={formData?.centreIDHash}
          pageName={"UploadStamp"}
        />
      )}

      {show4 && (
        <UploadFile
          show={show4}
          handleClose={() => setShow4(false)}
          documentId={formData?.centreIDHash}
          pageName={"UploadNablLogo"}
        />
      )}
      {show5 && (
        <UploadFile
          show={show5}
          handleClose={() => setShow5(false)}
          documentId={formData?.centreIDHash}
          pageName={"UploadAgreement"}
        />
      )}
      {show6 && (
        <UploadFile
          show={show6}
          handleClose={() => setShow6(false)}
          documentId={formData?.centreIDHash}
          pageName={"UploadAadharCard"}
        />
      )}
      {show7 && (
        <UploadFile
          show={show7}
          handleClose={() => setShow7(false)}
          documentId={formData?.centreIDHash}
          pageName={"UploadAadharCard"}
        />
      )}
      {show8 && (
        <UploadFile
          show={show8}
          handleClose={() => setShow8(false)}
          documentId={formData?.centreIDHash}
          pageName={"UploadUploadQRCodeUPI"}
        />
      )}
      {show9 && (
        <UploadFile
          show={show9}
          handleClose={() => setShow9(false)}
          documentId={formData?.centreIDHash}
          pageName={"UploadLetterHead"}
        />
      )}

      {showOP && (
        <OldPatientSearchModal
          show={showOP}
          setShow={setShowOP}
          handleSelctData={handleSelctData}
        />
      )}
      <Accordion
        name={
          name === t("center")
            ? t("CenterManager")
            : t("Center Manager/ Basic Details")
        }
        defaultValue={true}
        isBreadcrumb={true}
      >
        <div className="row pt-2 pl-2 pr-2">
          <div className="col-sm-2 col-md-2 ">
            <SelectBox
              options={[
                { value: "", label: "Select Centre" },
                { value: "Centre", label: "Centre" },
                { value: "RateType", label: "RateType" },
              ]}
              name="DataType"
              id="DataType"
              lable="Data Type"
              selectedValue={formData?.DataType}
              onChange={handleSelectChange}
            />
          </div>
          <div className="col-sm-2 col-md-2 ">
            <SelectBox
              options={[
                { label: "Select Centre Type", value: 0 },
                ...BasicDetailsCentreType,
              ]}
              name="CentreType"
              id="CentreType"
              lable="Centre Type"
              selectedValue={formData?.CentreType}
              onChange={handleSelectChange}
            />
          </div>
          <div className="col-sm-3 col-md-2">
            <MultiSelectComp
              name="VisitType"
              className=""
              placeholder=" "
              label="Visit Type"
              id="VisitType"
              onChange={handleSelectMultiChange}
              options={VisitType || []}
              value={formData?.VisitType}
            />
          </div>
          <div className="col-sm-2 col-md-2">
            <Input
              lable="Center Code"
              id="CenterCode"
              placeholder=" "
              max={30}
              onChange={handleChange}
              value={formData?.CenterCode}
              name="CenterCode"
            />
          </div>
          <div className="col-sm-2 col-md-2">
            <Input
              lable="UHID Code"
              id="UHIDCode"
              placeholder=" "
              max={10}
              onChange={handleChange}
              value={formData?.UHIDCode}
              name="UHIDCode"
            />
          </div>

          {state?.other?.button === "Update" ? (
            ""
          ) : (
            <div className="col-sm-2 col-md-2">
              <Input
                lable="Basic Details Name"
                id="BasicDetailsName"
                placeholder=" "
                max={3}
                onChange={handleChange}
                value={formData?.BasicDetailsName}
                name="BasicDetailsName"
              />
            </div>
          )}

          <div className="col-sm-2 col-md-2 ">
            <SelectBox
              options={[
                { value: "", label: "Select Status" },
                { value: "0", label: "Inactive" },
                { value: "1", label: "Active" },
                { value: "2", label: "Closed" },
              ]}
              name="Status"
              id="Status"
              lable="Status"
              selectedValue={formData?.Status}
              onChange={handleSelectChange}
            />
          </div>
        </div>
      </Accordion>
      <Accordion title={t("Address")} defaultValue={true}>
        <div className="row pt-2 pl-2 pr-2">
          <div className="col-sm-2 col-md-2">
            <Input
              lable="Mobile"
              id="Mobile"
              placeholder=" "
              onInput={(e) => number(e, 10)}
              type="number"
              onChange={handleChange}
              value={formData?.Mobile}
              name="Mobile"
            />
          </div>
          <div className="col-sm-2 col-md-2">
            <Input
              lable="LandLine"
              id="LandLine"
              placeholder=" "
              max={30}
              onChange={handleChange}
              value={formData?.LandLine}
              name="LandLine"
            />
          </div>

          <div className="col-sm-2 col-md-2">
            <Input
              lable="Email ID"
              id="EmailID"
              placeholder=" "
              max={30}
              onChange={handleChange}
              value={formData?.EmailID}
              name="EmailID"
            />
          </div>
          <div className="col-sm-2 col-md-2">
            <Input
              lable="Website"
              id="Website"
              placeholder=" "
              max={100}
              onChange={handleChange}
              value={formData?.Website}
              name="Website"
            />
          </div>
          <div className="col-sm-2 col-md-2">
            <Input
              lable="Address1"
              id="Address1"
              placeholder=" "
              max={50}
              onChange={handleChange}
              value={formData?.Address1}
              name="Address1"
            />
          </div>
          <div className="col-sm-2 col-md-2">
            <Input
              lable="Address2"
              id="Address2"
              placeholder=" "
              max={50}
              onChange={handleChange}
              value={formData?.Address2}
              name="Address2"
            />
          </div>
          <div className="col-sm-2 col-md-2">
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
          </div>
          {/* <div className="col-sm-2 col-md-2 ">
            <SelectBox
              options={[
                { value: 0, label: "Select Country" },
                { value: 1, label: "India" },
              ]}
              name="Country"
              id="Country"
              lable="Country"
              selectedValue={formData?.Country}
              onChange={handleSelectChange}
            />
          </div> */}
          <div className="col-sm-2 col-md-2">
            <Input
              lable="Country"
              id="Country"
              placeholder=" "
              max={50}
              onChange={handleChange}
              value={formData?.Country}
              name="Country"
            />
          </div>
          {/* <div className="col-sm-2 col-md-2 ">
            <SelectBox
              options={[
                { value: 0, label: "Select Business Zone" },
                { value: "Delhi", label: "Delhi" },
                { value: "Noida", label: "Noida" },
              ]}
              name="BusinessZone"
              id="BusinessZone"
              lable="Business Zone"
              selectedValue={formData?.BusinessZone}
              onChange={handleSelectChange}
            />
          </div> */}
          <div className="col-sm-2 col-md-2">
            <Input
              lable="BusinessZone"
              id="BusinessZone"
              placeholder=" "
              max={50}
              onChange={handleChange}
              value={formData?.BusinessZone}
              name="BusinessZone"
            />
          </div>
          {/* <div className="col-sm-2 col-md-2 ">
            <SelectBox
              options={[
                { value: 0, label: "Selsect State" },
                { value: "Delhi", label: "Delhi" },
                { value: "UP", label: "UP" },
              ]}
              name="State"
              id="State"
              lable="State"
              selectedValue={formData?.State}
              onChange={handleSelectChange}
            />
          </div> */}
          <div className="col-sm-2 col-md-2">
            <Input
              lable="State"
              id="State"
              placeholder=" "
              max={50}
              onChange={handleChange}
              value={formData?.State}
              name="State"
            />
          </div>
          {/* <div className="col-sm-2 col-md-2 ">
            <SelectBox
              options={[
                { value: 0, label: "Select City" },
                { value: "Delhi", label: "Delhi" },
                { value: "Noida", label: "Noida" },
              ]}
              name="City"
              id="City"
              lable="City"
              selectedValue={formData?.City}
              onChange={handleSelectChange}
            />
          </div> */}
          <div className="col-sm-2 col-md-2">
            <Input
              lable="City"
              id="City"
              placeholder=" "
              max={50}
              onChange={handleChange}
              value={formData?.City}
              name="City"
            />
          </div>
          {/* <div className="col-sm-2 col-md-2 ">
            <SelectBox
              options={[
                { value: 0, label: "NA" },
                { value: 1, label: "PUP" },
                { value: 2, label: "LIMS" },
              ]}
              name="CityZone"
              id="CityZone"
              lable="City Zone"
              selectedValue={formData?.CityZone}
              onChange={handleSelectChange}
            />
          </div> */}
          <div className="col-sm-2 col-md-2">
            <Input
              lable="CityZone"
              id="CityZone"
              placeholder=" "
              max={50}
              onChange={handleChange}
              value={formData?.CityZone}
              name="CityZone"
            />
          </div>
          {/* <div className="col-sm-2 col-md-2 ">
            <SelectBox
              options={[
                { value: 0, label: "NA" },
                { value: 1, label: "PUP" },
                { value: 2, label: "LIMS" },
              ]}
              name="Locality"
              id="Locality"
              lable="Locality"
              selectedValue={formData?.Locality}
              onChange={handleSelectChange}
            />
          </div> */}
          <div className="col-sm-2 col-md-2">
            <Input
              lable="Locality"
              id="Locality"
              placeholder=" "
              max={50}
              onChange={handleChange}
              value={formData?.Locality}
              name="Locality"
            />
          </div>
        </div>
      </Accordion>
      <Accordion title={t("Centre InCharge/Contact Info")} defaultValue={true}>
        <div className="row pt-2 pl-2 pr-2">
          <div className="col-sm-2 col-md-2">
            <Input
              lable="Centre Name"
              id="CentreName"
              placeholder=" "
              max={30}
              onChange={handleChange}
              value={formData?.CentreName}
              name="CentreName"
            />
          </div>

          <div className="col-sm-2 col-md-2">
            <Input
              lable="Centre Mobile"
              id="CentreMobile"
              placeholder=" "
              onInput={(e) => number(e, 10)}
              type="number"
              onChange={handleChange}
              value={formData?.CentreMobile}
              name="CentreMobile"
            />
          </div>
          <div className="col-sm-2 col-md-2">
            <Input
              lable="Centre Email"
              id="CentreEmail"
              placeholder=" "
              max={50}
              onChange={handleChange}
              value={formData?.CentreEmail}
              name="CentreEmail"
            />
          </div>
          <div className="col-sm-2 col-md-2">
            <Input
              lable="Contact Person Designation"
              id="ContactPersonDesignation"
              placeholder=" "
              max={50}
              onChange={handleChange}
              value={formData?.ContactPersonDesignation}
              name="ContactPersonDesignation"
            />
          </div>
        </div>
      </Accordion>
      <Accordion title={t("Accounts Details")} defaultValue={true}>
        <div className="row pt-2 pl-2 pr-2">
          {/* <div className="col-sm-2 col-md-2 ">
            <SelectBox
              options={[
                { value: "0", label: "BankName0" },
                { value: "1", label: "BankName1" },
                { value: "2", label: "BankName2" },
                { value: "3", label: "BankName3" },
              ]}
              name="BankName"
              id="BankName"
              lable="Bank Name"
              selectedValue={formData?.BankName}
              onChange={handleSelectChange}
            />
          </div> */}
          <div className="col-sm-2 col-md-2">
            <Input
              lable="BankName"
              id="BankName"
              placeholder=" "
              max={50}
              onChange={handleChange}
              value={formData?.BankName}
              name="BankName"
            />
          </div>
          <div className="col-sm-2 col-md-2">
            <Input
              lable="Bank Account No"
              id="BankAccountNo"
              placeholder=" "
              max={30}
              onChange={handleChange}
              value={formData?.BankAccountNo}
              name="BankAccountNo"
            />
          </div>
          <div className="col-sm-2 col-md-2">
            <Input
              lable="IFSC Code"
              id="IFSCCode"
              placeholder=" "
              max={30}
              onChange={handleChange}
              value={formData?.IFSCCode}
              name="IFSCCode"
            />
          </div>
          <div className="col-sm-2 col-md-2">
            <Input
              lable="Benefecial Name"
              id="BenefecialName"
              placeholder=" "
              max={30}
              onChange={handleChange}
              value={formData?.BenefecialName}
              name="BenefecialName"
            />
          </div>
          <div className="col-sm-2 col-md-2">
            <Input
              lable="Brach Address"
              id="BrachAddress"
              placeholder=" "
              max={30}
              onChange={handleChange}
              value={formData?.BrachAddress}
              name="BrachAddress"
            />
          </div>
          <div className="col-sm-2 col-md-2">
            <Input
              lable="GST No"
              id="GSTNO"
              placeholder=" "
              max={30}
              onChange={handleChange}
              value={formData?.GSTNO}
              name="GSTNO"
            />
          </div>
          <div className="col-sm-2 col-md-2">
            <Input
              lable="Aadhar Card No"
              id="AadharCardNo"
              placeholder=" "
              max={20}
              onChange={handleChange}
              value={formData?.AadharCardNo}
              name="AadharCardNo"
            />
          </div>
          <div className="col-sm-2 col-md-2">
            <Input
              lable="Pan No"
              id="PanNo"
              placeholder=" "
              max={30}
              onChange={handleChange}
              value={formData?.PanNo}
              name="PanNo"
            />
          </div>
          <div className="col-sm-2 col-md-2">
            <Input
              lable="Name Pan Card"
              id="NamePanCard"
              placeholder=" "
              max={30}
              onChange={handleChange}
              value={formData?.NamePanCard}
              name="NamePanCard"
            />
          </div>
          <div className="col-sm-2 col-md-2">
            <Input
              lable="Description"
              id="ACDescription"
              placeholder=" "
              max={150}
              onChange={handleChange}
              value={formData?.ACDescription}
              name="ACDescription"
            />
          </div>
          <div className="col-sm-2 col-md-2">
            <Input
              lable="Registered Office"
              id="RegisteredOffice"
              placeholder=" "
              max={150}
              onChange={handleChange}
              value={formData?.RegisteredOffice}
              name="RegisteredOffice"
            />
          </div>
          <div className="col-sm-2">
            <DatePicker
              className="custom-calendar"
              name="ContractDate"
              value={formData?.ContractDate}
              placeholder=" "
              id="ContractDate"
              lable="Contract From Date"
              onChange={dateSelect}
              maxDate={new Date()}
              minDate={new Date(formData.ContractDate)}
            />
          </div>
          <div className="col-sm-2">
            <DatePicker
              className="custom-calendar"
              name="ContactToDate"
              value={formData?.ContactToDate}
              placeholder=" "
              id="ContactToDate"
              lable="Contact To Date"
              onChange={dateSelect}
              // maxDate={new Date()}
              minDate={new Date(formData.ContactToDate)}
            />
          </div>
        </div>
      </Accordion>
      <Accordion title={t("Accessioning Infomration")} defaultValue={true}>
        <>
          <div className="row pt-2 pl-2 pr-2">
            <div className="col-sm-2 col-md-2 ">
              <SelectBox
                options={[...BusinessUnit]}
                name="BusinessUnit"
                id="BusinessUnit"
                lable="Business Unit"
                selectedValue={formData?.BusinessUnit}
                onChange={handleSelectChange}
              />
            </div>
            <div className="col-sm-2 col-md-2 ">
              <SelectBox
                options={[
                  { label: "Select Processing Lab ", value: "" },
                  ...ProcessingLab,
                ]}
                name="ProcessingLab"
                id="ProcessingLab"
                lable="Processing Lab"
                selectedValue={formData?.ProcessingLab}
                onChange={handleSelectChange}
              />
            </div>
            <div className="col-sm-2 col-md-2 ">
              <ReactSelect
                dynamicOptions={[
                  { value: "", label: "Select Payment Mode" },
                  { value: 1, label: "Cash" },
                  { value: 2, label: "Credit" },
                  { value: 3, label: "Rolling Advance" },
                ]}
                name="PaymentMode"
                lable={t("Payment Mode")}
                id="PaymentMode"
                removeIsClearable={true}
                placeholderName={t("PaymentMode")}
                value={formData?.PaymentMode}
                onChange={handleSearchSelectChange}
              />
            </div>
            <div className="col-sm-2 col-md-2">
              <Input
                lable="Credit Limit"
                id="CreditLimit"
                placeholder=" "
                // onInput={(e) => number(e, 3)}
                type="number"
                onChange={handleChange}
                value={formData?.CreditLimit}
                name="CreditLimit"
              />
            </div>

            <div className="col-sm-2 col-md-2">
              <Input
                lable="Min Cash Booking"
                id="MinCashBookingReceive"
                placeholder=" "
                onInput={(e) => number(e, 3)}
                type="number"
                onChange={handleChange}
                value={formData?.MinCashBookingReceive}
                name="MinCashBookingReceive"
              />
            </div>
            <div className="col-sm-2 col-md-2">
              <ReactSelect
                dynamicOptions={[
                  { label: "Select SkipT ime Type", value: "" },
                  { label: "Cash", value: 0 },
                  { label: "NA", value: 1 },
                  { label: "RealTime", value: 2 },
                  { label: "Skip Hour", value: 3 },
                  { label: "Skip Day", value: 4 },
                  { label: "Skip Week", value: 5 },
                  { label: "Skip Month", value: 6 },
                ]}
                name="SkipTimeType"
                lable={t("Skip Time Type")}
                id="SkipTimeType"
                removeIsClearable={true}
                placeholderName={t("SkipTimeType")}
                value={formData?.SkipTimeType}
                onChange={handleSearchSelectChange}
              />
            </div>
            <div className="col-sm-2 col-md-2">
              <Input
                lable="Skip Value"
                id="SkipValue"
                placeholder=" "
                onInput={(e) => number(e, 5)}
                type="number"
                onChange={handleChange}
                value={formData?.SkipValue}
                name="SkipValue"
              />
            </div>
            {/* <div className="col-sm-2 col-md-2 ">
              <ReactSelect
                dynamicOptions={[
                  { value: "0", label: "Centre" },
                  { value: "1", label: "RateType" },
                ]}
                name="AllowInvoice"
                lable={t("Allow Invoice")}
                id="AllowInvoice"
                removeIsClearable={true}
                placeholderName={t("Allow Invoice")}
                value={formData?.AllowInvoice}
                onChange={handleSearchSelectChange}
              />
            </div> */}
            <div className="col-sm-2 col-md-2 ">
              <ReactSelect
                dynamicOptions={Invoice}
                name="InvoiceTo"
                lable={t("Invoice To")}
                id="InvoiceTo"
                removeIsClearable={true}
                placeholderName={t("Invoice To")}
                value={formData?.InvoiceTo}
                onChange={handleSearchSelectChange}
              />
            </div>
            <div className="col-sm-2 col-md-2 ">
              <ReactSelect
                dynamicOptions={[
                  { value: "", label: "Select MRP" },
                  ...MrpData,
                ]}
                name="SetMrp"
                lable={t("MRP")}
                id="SetMrp"
                removeIsClearable={true}
                placeholderName={t("MRP")}
                value={formData?.SetMrp}
                onChange={handleSearchSelectChange}
              />
            </div>
            <div className="col-sm-2 col-md-2 ">
              <ReactSelect
                dynamicOptions={[
                  { value: "", label: "Select Reference Rate" },
                  ...ReferenceData,
                ]}
                name="ReferenceRate"
                lable={t("Reference Rate")}
                id="ReferenceRate"
                removeIsClearable={true}
                placeholderName={t("Reference Rate")}
                value={formData?.ReferenceRate}
                onChange={handleSearchSelectChange}
              />
            </div>
            <div className="col-sm-2 col-md-2 ">
              <ReactSelect
                dynamicOptions={[
                  { value: "", label: "Select Share Rate" },
                  ...ShareInvoiCerate,
                ]}
                name="ShareRate"
                lable={t("Share Rate")}
                id="ShareRate"
                removeIsClearable={true}
                placeholderName={t("Share Rate")}
                value={formData?.ShareRate}
                onChange={handleSearchSelectChange}
              />
            </div>
            <div className="col-sm-2 col-md-2">
              <Input
                lable="Invoice Code"
                id="InvoiceCode"
                placeholder=" "
                max={30}
                onChange={handleChange}
                value={formData?.InvoiceCode}
                name="InvoiceCode"
              />
            </div>
            <div className="col-sm-2 col-md-2">
              <Input
                lable="Invoice Display Name"
                id="InvoiceDisplayName"
                placeholder=" "
                max={30}
                onChange={handleChange}
                value={formData?.InvoiceDisplayName}
                name="InvoiceDisplayName"
              />
            </div>
            <div className="col-sm-2 col-md-2 ">
              <ReactSelect
                dynamicOptions={[
                  { value: "Monthly", label: "Selected Monthly" },
                  {
                    label: "Weekly",
                    value: "Weekly",
                  },
                  {
                    label: "15 Days",
                    value: "15 Days",
                  },
                ]}
                name="InvoiceBillingCycle"
                lable={t("Invoice Billing Cycle")}
                id="InvoiceBillingCycle"
                removeIsClearable={true}
                placeholderName={t("Invoice Billing Cycle")}
                value={formData?.InvoiceBillingCycle}
                onChange={handleSearchSelectChange}
              />
            </div>
            <div className="col-sm-2 col-md-2 ">
              <ReactSelect
                dynamicOptions={[
                  { label: "Select Against Invoice", value: "" },
                  { label: "Against Invoice", value: 1 },
                  { label: "Against OnAccount", value: 2 },
                ]}
                name="AgainstInvoice"
                lable={t("Against Invoice")}
                id="AgainstInvoice"
                removeIsClearable={true}
                placeholderName={t("Payment Against")}
                value={formData?.AgainstInvoice}
                onChange={handleSearchSelectChange}
              />
            </div>
            <div className="col-sm-2 col-md-2">
              <Input
                lable="Intimation Limit"
                id="IntimationLimit"
                placeholder=" "
                onInput={(e) => number(e, 5)}
                type="number"
                onChange={handleChange}
                value={formData?.IntimationLimit}
                name="IntimationLimit"
              />
            </div>
            <div className="col-sm-2 col-md-2">
              <Input
                lable="Email ID (Invoice)"
                id="EmailIDInvoice"
                placeholder=" "
                max={50}
                onChange={handleChange}
                value={formData?.EmailIDInvoice}
                name="EmailIDInvoice"
              />
            </div>
            <div className="col-sm-2 col-md-2 ">
              <ReactSelect
                dynamicOptions={[
                  { label: "Select Sales Manager", value: "" },
                  ...AllsalesManager,
                ]}
                name="SalesManager"
                lable={t("Sales Manager")}
                id="SalesManager"
                removeIsClearable={true}
                placeholderName={t("Sales Manager")}
                value={formData?.SalesManager}
                onChange={handleSearchSelectChange}
              />
            </div>
            <div className="col-sm-2 col-md-2 ">
              <ReactSelect
                dynamicOptions={[
                  { label: "Select Field Body", value: "" },
                  ...filedboyId,
                ]}
                name="FieldBoy"
                lable={t("Field Boy")}
                id="FieldBoy"
                removeIsClearable={true}
                placeholderName={t("Field Boy")}
                value={formData?.FieldBoy}
                onChange={handleSearchSelectChange}
              />
            </div>
            <div className="col-sm-3 col-md-2">
              <Form.Check
                className="toggle_btn"
                type="switch"
                id="ConfigAllowInvoice"
                name="ConfigAllowInvoice"
                label="Allow Invoice"
                checked={formData?.ConfigAllowInvoice === 1}
                onChange={handleToggleChange}
              />
            </div>
          </div>
        </>
      </Accordion>
      <Accordion title={t("Configuration")} defaultValue={true}>
        <>
          <div className="row pt-2 pl-2 pr-2">
            <div className="col-sm-2 col-md-2 ">
              <SelectBox
                options={[
                  { value: "", label: "Select Portal Access" },
                  { value: "0", label: "NA" },
                  { value: "1", label: "PUP" },
                  { value: "2", label: "LIMS" },
                ]}
                name="PortalAccess"
                id="PortalAccess"
                lable="Portal Access"
                selectedValue={formData?.PortalAccess}
                onChange={handleSelectChange}
              />
            </div>
            {state?.other?.button === "Update" ? (
              ""
            ) : (
              <div className="col-sm-2 col-md-2">
                <Input
                  max={100}
                  lable="User Name"
                  id="UserName"
                  className="required-fields"
                  placeholder=" "
                  onChange={handleChange}
                  value={formData?.UserName}
                  name="UserName"
                  onBlur={() => {
                    handleCheckDuplicate();
                  }}
                  onInput={(e) => number(e, 100)}
                />
                {errors?.UserName && touched?.UserName && (
                  <div className="error-message">{errors?.UserName}</div>
                )}
              </div>
            )}

            {state?.other?.button === "Update" ? (
              ""
            ) : (
              <div className="col-sm-2 col-md-2">
                <Input
                  max={6}
                  lable="Password"
                  id="Password"
                  className="required-fields"
                  placeholder=" "
                  onChange={handleChange}
                  value={formData?.Password}
                  name="Password"
                  onBlur={() => {
                    handleCheckDuplicate();
                  }}
                  onInput={(e) => number(e, 6)}
                />
                {errors?.Password && touched?.Password && (
                  <div className="error-message">{errors?.Password}</div>
                )}
              </div>
            )}

            <div className="col-sm-2 col-md-2 ">
              <SelectBox
                options={[
                  { value: "", label: "Select Barcode Type" },
                  ...BarCodeLogic,
                ]}
                name="BarcodeType"
                id="BarcodeType"
                lable="Barcode Type"
                selectedValue={formData?.BarcodeType}
                onChange={handleSelectChange}
              />
            </div>
            <div className="col-sm-2 col-md-2 ">
              <SelectBox
                options={[
                  { value: "", label: "Select Barcode Print" },
                  { value: 0, label: "Registration" },
                  { value: 1, label: "Sample Collection" },
                ]}
                name="BarcodePrint"
                id="BarcodePrint"
                lable="Barcode Print"
                selectedValue={formData?.BarcodePrint}
                onChange={handleSelectChange}
              />
            </div>
            <div className="col-sm-3 col-md-2">
              <MultiSelectComp
                name="IsReceiptRequired"
                className=""
                placeholder=" "
                label="Is Receipt Required"
                id="IsReceiptRequired"
                onChange={handleSelectMultiChange}
                options={dropDownList.IsReceiptRequired || []}
                value={formData?.IsReceiptRequired}
              />
            </div>
            <div className="col-sm-6 col-md-6">
              <Input
                lable="Notification (Alert)"
                id="NotificationAlert"
                placeholder=" "
                max={150}
                onChange={handleChange}
                value={formData?.NotificationAlert}
                name="NotificationAlert"
              />
            </div>
          </div>
          <div className="row pt-2 pl-2 pr-2 m-2">
            <div className="col-sm-3 col-md-2">
              <Form.Check
                className="toggle_btn"
                type="switch"
                id="HideNablLogo"
                name="HideNablLogo"
                label="Hide Nabl Logo"
                checked={formData?.HideNablLogo === true}
                onChange={handleToggleChange}
              />
            </div>
            <div className="col-sm-3 col-md-2">
              <Form.Check
                className="toggle_btn"
                type="switch"
                id="HideSignature"
                name="HideSignature"
                label="Hide Signature"
                checked={formData?.HideSignature === 1}
                onChange={handleToggleChange}
              />
            </div>
            <div className="col-sm-3 col-md-2">
              <Form.Check
                className="toggle_btn"
                type="switch"
                id="HideReceipt"
                name="HideReceipt"
                label="Hide Receipt"
                checked={formData?.HideReceipt === 1}
                onChange={handleToggleChange}
              />
            </div>

            <div className="col-sm-3 col-md-2">
              <Form.Check
                className="toggle_btn"
                type="switch"
                id="OnlyFullPaidReceipt"
                name="OnlyFullPaidReceipt"
                label="Only Full Paid Receipt"
                checked={formData?.OnlyFullPaidReceipt === 1}
                onChange={handleToggleChange}
              />
            </div>
            <div className="col-sm-3 col-md-2">
              <Form.Check
                className="toggle_btn"
                type="switch"
                id="AllowDoctorShare"
                name="AllowDoctorShare"
                label="Allow Doctor Share"
                checked={formData?.AllowDoctorShare === 1}
                onChange={handleToggleChange}
              />
            </div>
            <div className="col-sm-3 col-md-2">
              <Form.Check
                className="toggle_btn"
                type="switch"
                id="AllowPanelShare"
                name="AllowPanelShare"
                label="Allow Panel Share"
                checked={formData?.AllowPanelShare === 1}
                onChange={handleToggleChange}
              />
            </div>
            <div className="col-sm-3 col-md-2">
              <Form.Check
                className="toggle_btn"
                type="switch"
                id="HideAmount"
                name="HideAmount"
                label="Hide Amount"
                checked={formData?.HideAmount === 1}
                onChange={handleToggleChange}
              />
            </div>
            <div className="col-sm-3 col-md-2">
              <Form.Check
                className="toggle_btn"
                type="switch"
                id="PRDMConfiguration"
                name="PRDMConfiguration"
                label="PRDMConfiguration"
                checked={formData?.PRDMConfiguration === 1}
                onChange={handleToggleChange}
              />
            </div>

            <div className="col-sm-3 col-md-2">
              <Form.Check
                className="toggle_btn"
                type="switch"
                id="LockRegist"
                name="LockRegist"
                label="Lock Regist"
                checked={formData?.LockRegist === 1}
                onChange={handleToggleChange}
              />
            </div>
            <div className="col-sm-3 col-md-2">
              <Form.Check
                className="toggle_btn"
                type="switch"
                id="LockReport"
                name="LockReport"
                label="Lock Report"
                checked={formData?.LockReport === 1}
                onChange={handleToggleChange}
              />
            </div>
            <div className="col-sm-3 col-md-2">
              <Form.Check
                className="toggle_btn"
                type="switch"
                id="IsAutoPRDM"
                name="IsAutoPRDM"
                label="Is Auto PRDM"
                checked={formData?.IsAutoPRDM === 1}
                onChange={handleToggleChange}
              />
            </div>
            <div className="col-sm-3 col-md-2">
              <Form.Check
                className="toggle_btn"
                type="switch"
                id="PRDMConfiguration"
                name="PRDMConfiguration"
                label="PRDM Configuration"
                checked={formData?.PRDMConfiguration === 1}
                onChange={handleToggleChange}
              />
            </div>
            <div className="col-sm-3 col-md-2">
              <Form.Check
                className="toggle_btn"
                type="switch"
                id="AllowPaymentGateway"
                name="AllowPaymentGateway"
                label="Allow Payment Gateway"
                checked={formData?.AllowPaymentGateway === true}
                onChange={handleToggleChange}
              />
            </div>

            <div className="col-sm-3 col-md-2">
              <Form.Check
                className="toggle_btn"
                type="switch"
                id="IsSampleReCollection"
                name="IsSampleReCollection"
                label="IsSample ReCollection"
                checked={formData?.IsSampleReCollection === 1}
                onChange={handleToggleChange}
              />
            </div>
            <div className="col-sm-3 col-md-2">
              <Form.Check
                className="toggle_btn"
                type="switch"
                id="AutoDepartmentReceive"
                name="AutoDepartmentReceive"
                label="Auto Department Receive"
                checked={formData?.AutoDepartmentReceive === 1}
                onChange={handleToggleChange}
              />
            </div>
          </div>
        </>
      </Accordion>

      <Accordion title={t("Add Attachment")} defaultValue={true}>
        <div className="row pt-2 pl-2 pr-2 m-2">
          <div className="col-sm-2 col-md-2">
            <CustomButton
                className="btn-block"
                text={"Upload Letter Head"}
                id="btnUpload"
                onClick={() => {
                  setShow9(true);
                }}
            />
          </div>
          {/* <div className="col-sm-2 col-md-2">
  <button
    className="btn custom-btn btn-sm btn-block"
    id="btnUpload"
    onClick={() => {
      setShow(true);
    }}
  >
    {t("Upload Letter Head")}
  </button>
</div> */}
          <div className="col-sm-2 col-md-2">
            <CustomButton
                className="btn-block"
                text={"Upload Header"}
                id="btnUpload"
                onClick={() => {
                setShow(true);
              }}
            />
          </div>
          <div className="col-sm-2 col-md-2">
            <CustomButton
                className="btn-block"
                text={"Upload Footer"}
                id="btnUpload"
                onClick={() => {
                setShow1(true);
              }}
            />
          </div>{" "}
          <div className="col-sm-2 col-md-2">
             <CustomButton
                className="btn-block"
                text={"Upload Receipt Logo"}
                id="btnUpload"
                onClick={() => {
                setShow2(true);
              }}
            />
          </div>
          <div className="col-sm-2 col-md-2">
             <CustomButton
                className="btn-block"
                text={"Upload Stamp"}
                id="btnUpload"
                onClick={() => {
                  setShow3(true);
                }}
            />
          </div>
          <div className="col-sm-2 col-md-2">
            <CustomButton
                className="btn-block"
                text={"Upload Nabl Logo"}
                id="btnUpload"
                  onClick={() => {
                  setShow4(true);
                }}
            />
          </div>
        </div>
        <div className="row pt-2 pl-2 pr-2 m-2">
          <div className="col-sm-2 col-md-2">
            <CustomButton
                className="btn-block"
                text={"Upload Agreement"}
                  onClick={() => {
                  setShow5(true);
                }}
            />
          </div>
          <div className="col-sm-2 col-md-2">
            <CustomButton
                className="btn-block"
                text={"Upload Aadhar Card"}
                 onClick={() => {
                setShow6(true);
              }}
            />
          </div>
          <div className="col-sm-2 col-md-2">
             <CustomButton
                className="btn-block"
                text={"Upload Pan Card"}
                onClick={() => {
                setShow7(true);
              }}
            />
          </div>

          <div className="col-sm-2 col-md-2">
             <CustomButton
                className="btn-block"
                text={"Upload Upload QR Code (UPI)"}
                onClick={() => {
                  setShow8(true);
                }}
            />
          </div>
        </div>
        <div>
          {/* <div className="row pt-2 pl-2 pr-2 m-2 align-items-center">
            <div className="col-sm-12 d-flex justify-content-center">
              {load ? (
                <Loading />
              ) : (
                <button
                  className="btn btn-success btn-lg"
                  onClick={handleSubmit}
                >
                  {state?.other?.button ? t(state?.other?.button) : t("Save")}
                </button>
              )}
            </div>
            <div className="col-sm-12 d-flex justify-content-end mt-2">
              <Link
                to={`/CentreMasterList/${name}`}
                style={{ fontSize: "13px" }}
              >
                {t("Back to List")}
              </Link>
            </div>
          </div> */}
        </div>
      </Accordion>
      <Accordion title={t("Tab")} defaultValue={true}>
        <div className="row pt-2 pl-2 pr-2 m-2">
          <div className="col-sm-2 col-md-2">
            <CustomButton
                className="btn-block"
                text={"Lab Report Dispatch"}
                onClick={() => {
                  setShowOP(true);
                }}
            />
          </div>
          {/* <div className="col-sm-2 col-md-2">
  <button
    className="btn custom-btn btn-sm btn-block"
    id="btnUpload"
    onClick={() => {
      setShow(true);
    }}
  >
    {t("Upload Letter Head")}
  </button>
</div> */}
          <div className="col-sm-2 col-md-2">
            <CustomButton
                className="btn-block"
                text={"Invoice Dispatch"}
                onClick={() => {
                  setShowOP(true);
                }}
            />
          </div>
          <div className="col-sm-2 col-md-2">
            <CustomButton
                className="btn-block"
                text={"Rate List"}
                onClick={() => {
                  setShowOP(true);
                }}
            />
          </div>{" "}
          {/* <div className="col-sm-2 col-md-2">
             <button
                className="text-white rounded p-1"
                type="button"
                style={{
                  width: "74%",
                  fontSize: "11px",
                  marginLeft: "5px",
                  bottom: "5px",
                }}
                onClick={() => {
                  setShowOP(true);
                }}
              >
                {t("Old Patient")}
              </button>
          </div> */}
          <div className="col-sm-2 col-md-2">
            <CustomButton
                className="btn-block"
                text={"Schedule Rate List"}
                onClick={() => {
                  setShowOP(true);
                }}
            />
          </div>
          <div className="col-sm-2 col-md-2">
            <CustomButton
                className="btn-block"
                text={"Transfer Rate List"}
                onClick={() => {
                  setShowOP(true);
                }}
            />
          </div>
          <div className="col-sm-2 col-md-2">
            <CustomButton
                className="btn-block"
                text={"Rate Type Test Lock"}
                onClick={() => {
                  setShowOP(true);
                }}
            />
          </div>
        </div>
        <div className="row pt-2 pl-2 pr-2 m-2">
          <div className="col-sm-2 col-md-2">
            <CustomButton
                className="btn-block"
                text={"Share Rate"}
                 onClick={() => {
                setShowOP(true);
              }}
            />
          </div>
        </div>
        <div>
          <div className="row pt-2 pl-2 pr-2 m-2 align-items-center">
            {/* Save Button Center */}
            <div className="col-sm-12 d-flex justify-content-center">
              {load ? (
                <Loading />
              ) : (
                <button
                  className="btn btn-success btn-lg"
                  onClick={handleSubmitCenterManagerData}
                >
                  {state?.other?.button ? t(state?.other?.button) : t("Save")}
                </button>
              )}
            </div>

            {/* Back to List Right Side */}
            <div className="col-sm-12 d-flex justify-content-end mt-2">
              <Link
                to={`/CentreManagerList/center`}
                style={{ fontSize: "13px" }}
              >
                {t("Back to List")}
              </Link>
            </div>
          </div>
        </div>
      </Accordion>
    </>
  );
};

export default CenterManager;
