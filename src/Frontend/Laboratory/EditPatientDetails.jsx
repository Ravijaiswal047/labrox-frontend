import React, { useEffect, useRef, useState } from "react";
import moment from "moment";
import { toast } from "react-toastify";
import { validateIdentityProof, validateEmail, validatePincode, validateAddress, ADDRESS_MAX_LENGTH } from "../../utils/validations/validationHelpers";
import {
  checkDuplicateBarcode,
  getAccessCentres,
  getAccessDataRate,
  getBindDiscApproval,
  getBindDiscReason,
  getBindReportDeliveryMethod,
  getCollectionBoy,
  getDoctorSuggestion,
  GetGlobalData,
  getPaymentModes,
  getSearchController,
  getVisitType,

} from "../../utils/NetworkApi/commonApi";
import { saveMacRadiologyAppointment, cancelMacRadiologyAppointment, linkAppointmentRegistration } from "../RadiologyAppointment/api";

import MyImage from "./PlaceholderImage.jpg";
import Heading from "../../components/UI/Heading";
import Accordion from "@app/components/UI/Accordion";
import { SelectBox } from "../../components/formComponent/SelectBox";
import Input from "../../components/formComponent/Input";
import RegisterationTable from "../Table/RegisterationTable";
import {
  PreventNumber,
  PreventSpecialCharacter,
  autocompleteOnBlur,
  getTrimmedData,
  number,
  removeSpecialCharacters,
  selectedValueCheck,
} from "../../utils/helpers";

import MedicialModal from "../utils/MedicialModal";
import UploadFile from "../utils/UploadFileModal/UploadFile";
import MobileDataModal from "../utils/MobileDataModal";
import { LTDataIniti, stateIniti } from "../../utils/Constants";
import { useFormik } from "formik";
import { useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import SlotBookModal from "../utils/SlotBookModal";
import DatePicker from "../../components/formComponent/DatePicker";
import { axiosInstance, axiosReport } from "../../utils/axiosInstance";
import PatientRegisterModal from "../utils/PatientRegisterModal";
import { Button } from "primereact/button";
import Tooltip from "../../components/formComponent/Tooltip";
import Tables from "../../components/UI/customTable";
import Loading from "../../components/loader/Loading";
import { useLocalStorage } from "../../utils/hooks/useLocalStorage";
import BarcodeLogicModal from "../utils/BarcodeLogicModal";
import { useSelector } from "react-redux";
import { notify } from "../../utils/utils";
import { validateRowDiscount } from "../../utils/validations/index.js";
import { CustomButton, SaveButton } from "../../components/UI/CustomButton";
import "./PatientRegistration.css";
import "./DynamicValidation.css";
import "./ErrorStyles.css";


const EditPatientDetails = ({ onHideModal }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const reprintLabNo = useSelector((state) => state.loadingSlice.reprintLabNo);
  const [Gender, setGender] = useState([]);
  const [Title, setTitle] = useState([]);
  const [Identity, setIdentity] = useState([]);
  const [PaymentMode, setPaymentMode] = useState([]);
  const [BankName, setBankName] = useState([]);

  const [HLMPatientType, setHLMPatientType] = useState([]);
  const [CollectionBoy, setCollectionBoy] = useState([]);
  const [ploInitData, setPloInitData] = useState([]);
  const [visibleFields, setVisibleFields] = useState([]);
  const [RateType, setRateType] = useState([]);
  const [CentreData, setCentreData] = useState([]);
  const [PatientSource, setPatientSource] = useState([]);
  const [PatientType, setPatientType] = useState([]);
  const [suggestion, setSuggestion] = useState([]);
  const [doctorSuggestion, setDoctorSuggestion] = useState([]);
  const [secondDoctorSuggestion, setSecondDoctorSuggestion] = useState([]);
  const [secondDropFalse, setSecondDropFalse] = useState(true);

  const [VisitType, setVisitType] = useState([]);
  const [throughMobileData, setThroughMobileData] = useState(false);
  const [paid, setPaid] = useState(0);
  const [BindDiscApproval, setBindDiscApproval] = useState([]);
  const [BindDiscReason, setBindDiscReason] = useState([]);
  const [BindReportDeliveryMethod, setBindReportDeliveryMethod] = useState([]);
  const [discountPercentage, setDiscountPercentage] = useState("");
  const [disAmt, setdisAmt] = useState("");
  const [documentId, setDocumentID] = useState("");
  const [BarcodeLogic, setBarcodeLogic] = useState(0);
  const [show5, setShow5] = useState({
    modal: false,
    index: -1,
  });

  const [Category, setCategory] = useState([]);
  const { t } = useTranslation();
  const [searchTest, setSearchTest] = useState("TestName");
  const [mobleData, setMobileData] = useState([]);
  const [isSubmit, setIsSubmit] = useState(false);
  const [searchForm, setSearchForm] = useState({
    TestName: "",
    CentreID: "",
    InvestigationID: "",
  });
  const [UploadDoumentType, setUploadDoumentType] = useState([""]);
  const [dropFalse, setDropFalse] = useState(true);
  const [show, setShow] = useState({
    show: false,
    Type: "",
  });
  const [tableData, setTableData] = useState([]);
  const [indexMatch, setIndexMatch] = useState(0);
  const [show2, setShow2] = useState(false);
  const [show3, setShow3] = useState(false);
  const [show4, setShow4] = useState(false);
  const [RequiredShow, setRequiredShow] = useState({
    show: false,
    FieldIDs: "",
  });
  const [formData, setFormData] = useState({
    DoctorName: "",
    SecondReferDoctor: "",
  });
  const [state, setState] = useState(stateIniti);
  console.log(state, "stateare")
  const [LTData, setLTData] = useState(LTDataIniti);
  const [moreErrors, setMoreErrors] = useState({});
  const [tabbingOrder, setTabbingOrder] = useState([]);
  const [controllerDynamicList, setControllerDynamicList] = useState([]);


  const rightDeleteAddTest = useLocalStorage("userData", "get") || "";
  const DefaultCurrencyName = useLocalStorage("userData", "get")?.DefaultCurrencyName
  console.log("DefaultCurrencyName", DefaultCurrencyName);
  const arrOfRightDeleteAddTest = rightDeleteAddTest
    ? rightDeleteAddTest?.RemoveTestStatusLogic?.split(",").filter(Boolean)
    : [];

  // EPD-048: block re-entrant delete for the same test from a double-firing click
  const removeInFlightRef = useRef(new Set());
  // EPD-088: snapshot of patient fields as loaded — server merges unchanged fields from live DB
  const patientEditBaselineRef = useRef(null);
  // EPD-032: remember ID Proof No per Id Type so switching back restores it.
  const idProofByTypeRef = useRef({});

  useEffect(() => {
    setLTData({ ...LTData, Adjustment: paid });
  }, [paid]);

  const [PLO, setPLO] = useState([]);

  const [RcData, setRcData] = useState([
    {
      PayBy: "Patient",
      ReceiptNo: "",
      ledgerNoCr: "",
      RateTypeId: state?.RateID,
      PaymentMode: "Cash",
      PaymentModeID: 134,
      Amount: "",
      BankName: "",
      CardDate: "",
      CardNo: "",
      CentreID: state?.CentreID,
    },
  ]);
  const [slotOpen, setSlotOpen] = useState({
    show: false,
    data: "",
  });

  const [SourceType, setSourceType] = useState([]);
  const [Pndt, setPndt] = useState({
    PNDT: false,
    NoOfChildren: "",
    NoOfSon: "",
    NoOfDaughter: "",
    Pregnancy: "",
    AgeOfSon: "",
    AgeOfDaughter: "",
    PNDTDoctor: "",
    Husband: "",
  });
  const [DoctorData, setDoctorData] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const handlePNDT = () => {
    setPndt({
      ...Pndt,
      PNDT: Pndt?.PNDT ? false : true,
      NoOfChildren: "",
      NoOfSon: "",
      NoOfDaughter: "",
      Pregnancy: "",
      AgeOfSon: "",
      AgeOfDaughter: "",
      PNDTDoctor: "",
      Husband: "",
    });
  };

  const selectedRateType = RateType?.find(
    (rType) => rType?.value == state?.RateID,
  );
  const Centretype = selectedRateType?.CentreType
  console.log("tedewfwefsting", Centretype)

  const handleDatePNDT = (date, name) => {
    setPndt({
      ...Pndt,
      [name]: date,
    });
  };
  const handlePNDTChange = (e) => {
    const { name, value } = e.target;
    setPndt({
      ...Pndt,
      [name]: value,
    });
  };
  const BindDoctorData = () => {
    axiosInstance
      .post("DoctorReferal/getDoctorDataBind")
      .then((res) => {
        const data = res?.data?.message;
        const val = data?.map((ele) => {
          return {
            label: ele?.DoctorName,
            value: ele?.DoctorID,
          };
        });
        val.unshift({ label: "Select Doctor", value: "" });
        setDoctorData(val);
      })
      .catch((err) => {
        toast.error(
          err?.data?.message ? err?.data?.message : "SomeThing Went Wrong",
        );
      });
  };

  useEffect(() => {
    if (RcData.length === 1) {
      let data = RcData.map((ele) => {
        return { ...ele, Amount: LTData?.NetAmount ? LTData?.NetAmount : "" };
      });
      setRcData(data);
    }
  }, [LTData?.NetAmount]);

  useEffect(() => {
    const data = RcData.map((ele) => {
      return { ...ele, CentreID: state?.CentreID, RateTypeId: state?.RateID };
    });
    setRcData(data);
  }, [state]);

  // const handleMainChange = (e) => {
  //   const { name, value, type, checked } = e.target;

  //   setState({
  //     ...state,
  //     [name]:
  //       type === "checkbox"
  //         ? checked
  //           ? 1
  //           : 0
  //         : ["FirstName", "MiddleName", "LastName"].includes(name)
  //           ? value.toUpperCase()
  //           : value,
  //   });
  // };

  const handleMainChange = (e) => {
    const { name, value, type, checked } = e.target;

    // Do not clear Email / PinCode / ID-proof / Remarks / Address errors here — those fields own
    // their validation on change/blur. Clearing first left flagged=false after Tab
    // when the clear won the race (EPD-061 / EPD-070 / EPD-145 / EPD-146).
    if (!["Email", "PinCode", "PatientIDProofNo", "IdType", "Remarks", "Remark", "HouseNo", "Address"].includes(name)) {
      setMoreErrors((prev) => ({ ...prev, [name]: "" }));
    }

    if (name === "HouseNo" || name === "Address") {
      let nextValue = String(value ?? "");
      let addrError = "";
      if (nextValue.length > ADDRESS_MAX_LENGTH) {
        nextValue = nextValue.slice(0, ADDRESS_MAX_LENGTH);
        addrError = `Address cannot exceed ${ADDRESS_MAX_LENGTH} characters`;
      }
      setMoreErrors((prev) => {
        const next = { ...prev };
        if (addrError) {
          next.HouseNo = addrError;
          next.Address = addrError;
        } else {
          delete next.HouseNo;
          delete next.Address;
        }
        return next;
      });
      setState((prev) => ({ ...prev, HouseNo: nextValue }));
      return;
    }

    setState({
      ...state,
      [name]:
        type === "checkbox"
          ? checked
            ? 1
            : 0
          : ["FirstName", "MiddleName", "LastName"].includes(name)
            ? value.toUpperCase()
            : value,
    });
  };
  useEffect(() => {
    if (state?.isVIP === 0) {
      setState({ ...state, IsMask: 0 });
    }
  }, [state?.isVIP]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setSearchForm({ ...searchForm, [name]: value });
  };

  // const handleSelectChange = (event) => {
  //   const { name, value, selectedIndex } = event?.target;
  //   const label = event?.target?.children[selectedIndex].text;
  //   if (name === "CentreID") {
  //     setSearchForm({ ...searchForm, [name]: value });
  //     setLTData({ ...LTData, [name]: event.value, CentreName: label });
  //   }

  //   if (name === "PatientIDProof") {
  //     setLTData({ ...LTData, [name]: value });
  //   }

  //   if (name === "VisitType") {
  //     setLTData({ ...LTData, [name]: value });
  //     fetchFields(event.value);
  //   }

  //   if (name === "ReportDeliveryMethodId") {
  //     setLTData({ ...LTData, [name]: value });
  //   }

  //   if (name === "DiscountApprovedBy") {
  //     setLTData({ ...LTData, [name]: value });
  //   }

  //   if (name === "DiscountReason") {
  //     setLTData({ ...LTData, [name]: value });
  //   }

  //   if (name === "CollectionBoyId") {
  //     const selectedBoy = CollectionBoy.find((boy) => boy.value === value);
  //     setLTData({
  //       ...LTData,
  //       [name]: value,
  //       collectionBoyName: selectedBoy?.label || "",
  //     });
  //   } else {
  //     setState({
  //       ...state,
  //       [name]: value,
  //     });
  //   }
  // };
  const handleSelectChange = (event) => {
    const { name, value, selectedIndex } = event?.target;
    const label = event?.target?.children[selectedIndex].text;

    // FIX: Select change par error clear karo
    setMoreErrors((prev) => ({ ...prev, [name]: "" }));

    if (name === "CentreID") {
      setSearchForm({ ...searchForm, [name]: value });
      setLTData({ ...LTData, [name]: event.value, CentreName: label });
    }
    if (name === "PatientIDProof") {
      const prevType = String(LTData?.PatientIDProof || "").trim();
      const prevNo = String(LTData?.PatientIDProofNo || "");
      if (prevType) {
        idProofByTypeRef.current[prevType] = prevNo;
      }
      const nextType = String(value || "").trim();
      const proofNo = nextType ? (idProofByTypeRef.current[nextType] ?? "") : "";
      setLTData({ ...LTData, [name]: value, PatientIDProofNo: proofNo });
    }
    if (name === "VisitType") {
      setLTData({ ...LTData, [name]: value });
      fetchFields(event.value);
    }
    if (name === "ReportDeliveryMethodId") {
      setLTData({ ...LTData, [name]: value });
    }
    if (name === "DiscountApprovedBy") {
      setLTData({ ...LTData, [name]: value });
    }
    if (name === "DiscountReason") {
      setLTData({ ...LTData, [name]: value });
    }
    if (name === "CollectionBoyId") {
      const selectedBoy = CollectionBoy.find((boy) => boy.value === value);
      setLTData({
        ...LTData,
        [name]: value,
        collectionBoyName: selectedBoy?.label || "",
      });
    } else {
      setState({
        ...state,
        [name]: value,
      });
    }
  };
  const handleRateChange = (value, index) => {
    const data = [...tableData];
    const discount = Number(data[index]["Discount"]) || 0;
    const quantity = Number(data[index]["Quantity"]) || 1;
    data[index]["Rate"] = value;
    data[index]["NetAmount"] = (Number(value) - discount) * quantity;
    setTableData(data);
  };

  const handleQuantityChange = (value, index) => {
    const quantity = Math.min(6, Math.max(1, Number(value) || 1));
    const data = [...tableData];
    const discount = Number(data[index]["Discount"]) || 0;
    data[index] = {
      ...data[index],
      Quantity: quantity,
      NetAmount: (Number(data[index]["Rate"]) - discount) * quantity,
    };
    setTableData(data);
  };

  console.log("LTData", LTData);
  useEffect(() => {
    fetchFields(LTData?.VisitType);
    controllerDynamic();
  }, []);

  const PAGE_ID = "1048";

  const controllerDynamic = async () => {
    try {
      const { controllersData, controllerTabbingOrder } =
        await getSearchController(PAGE_ID);
      setTabbingOrder(controllerTabbingOrder || []);
      setControllerDynamicList(controllersData || []);
    } catch (err) {
      console.error("Error fetching dynamic controllers:", err);
    }
  };

  // const getFieldValue = (id) => {
  //   switch (id) {
  //     case "Mobile":
  //       return state?.Mobile;
  //     case "Title":
  //       return state?.Title;
  //     case "FirstName":
  //       return state?.FirstName;
  //     case "MiddleName":
  //       return state?.MiddleName;
  //     case "LastName":
  //       return state?.LastName;
  //     case "DOB":
  //       return state?.DOB;
  //     case "Age":
  //       return state?.AgeYear;
  //     case "Gender":
  //       return state?.Gender;
  //     case "DoctorName":
  //       return formData?.DoctorName;
  //     case "Email":
  //       return state?.Email;
  //     case "Address":
  //       return state?.HouseNo;
  //     case "PinCode":
  //       return state?.PinCode;
  //     case "Locality":
  //       return state?.Locality;
  //     case "City":
  //       return state?.City;
  //     case "State":
  //       return state?.State;
  //     case "Country":
  //       return state?.Country;
  //     default:
  //       return state[id] || LTData[id];
  //   }
  // };


  // const validateMandatoryFields = () => {
  //   let errorsFound = {};
  //   let firstErrorFieldId = null;

  //   controllerDynamicList.forEach((item) => {
  //     if (item.IsMandatory === 1 && item.IsShow === 1) {
  //       const val = getFieldValue(item.ControlDisplayID);
  //       if (!val || String(val).trim() === "") {
  //         errorsFound[item.ControlDisplayID] = `${item.ControlLabel || item.ControlDisplayID
  //           } is Required`;
  //         if (!firstErrorFieldId) firstErrorFieldId = item.ControlDisplayID;
  //       }
  //     }
  //   });

  //   setMoreErrors(errorsFound);

  //   if (Object.keys(errorsFound).length > 0) {
  //     toast.error("Please fill all mandatory fields marked in red");
  //     if (firstErrorFieldId) {
  //       const element = document.getElementById(firstErrorFieldId);
  //       if (element) {
  //         element.scrollIntoView({ behavior: "smooth", block: "center" });
  //         element.focus();
  //       }
  //     }
  //     return false;
  //   }
  //   return true;
  // };

  // ─── 1. getFieldValue - sirf jo fields form mein hain ────────────
  const getFieldValue = (id) => {
    switch (id) {
      case "Mobile":
        return state?.Mobile;
      case "Title":
        return state?.Title;
      case "FirstName":
        return state?.FirstName;
      case "MiddleName":
        return state?.MiddleName;
      case "LastName":
        return state?.LastName;
      case "DOB":
        return state?.DOB;
      // FIX: "Age" aur "AgeYear" dono handle karo
      case "Age":
      case "AgeYear":
        return state?.AgeYear !== undefined && state?.AgeYear !== null
          ? String(state.AgeYear)
          : "";
      case "Gender":
        return state?.Gender;
      // FIX: DoctorName ke liye LTData bhi fallback
      case "DoctorName":
        return formData?.DoctorName || LTData?.DoctorName || "";
      case "Email":
        return state?.Email;
      case "Address":
      case "HouseNo":
        return state?.HouseNo;
      case "PinCode":
        return state?.PinCode;
      case "Locality":
        return state?.Locality;
      case "City":
        return state?.City;
      case "State":
        return state?.State;
      case "Country":
        return state?.Country;
      case "Remarks":
      case "Remark":
        return state?.Remarks ?? state?.Remark;
      default:
        return state?.[id] ?? LTData?.[id] ?? "";
    }
  };

  // const validateMandatoryFields = () => {
  //   let errorsFound = {};
  //   let firstErrorFieldId = null;

  //   controllerDynamicList.forEach((item) => {
  //     if (item.IsMandatory !== 1 || item.IsShow !== 1) return;

  //     const controlId = item.ControlDisplayID;

  //     // AgeMonth aur AgeDays skip karo - ye AgeYear ke saath grouped hain
  //     if (["AgeMonth", "AgeDays"].includes(controlId)) return;

  //     const val = getFieldValue(controlId);

  //     // FIX: Age field ke liye "0" valid hai (newborn), baaki ke liye "0" empty hai
  //     const isAgeField = ["Age", "AgeYear"].includes(controlId);

  //     const isEmpty =
  //       val === undefined ||
  //       val === null ||
  //       String(val).trim() === "" ||
  //       (!isAgeField && String(val).trim() === "0") ||
  //       (Array.isArray(val) && val.length === 0);

  //     if (isEmpty) {
  //       errorsFound[controlId] = `${item.ControlDisplayName || item.ControlDisplayID
  //         } is required`;
  //       if (!firstErrorFieldId) firstErrorFieldId = controlId;
  //     }
  //   });

  //   setMoreErrors(errorsFound);

  //   if (Object.keys(errorsFound).length > 0) {
  //     const errorList = Object.values(errorsFound).join("\n• ");
  //     toast.error(`Please fill required fields:\n• ${errorList}`, {
  //       autoClose: 5000,
  //       style: { whiteSpace: "pre-line" },
  //     });

  //     setTimeout(() => {


  const validateMandatoryFields = () => {
    let errorsFound = {};
    let firstErrorFieldId = null;

    const EDIT_PAGE_SKIP_FIELDS = ["RegistrationDate", "RegistrationTime"];

    controllerDynamicList.forEach((item) => {
      if (item.IsMandatory !== 1 || item.IsShow !== 1) return;

      const controlId = item.ControlDisplayID;

      // AgeMonth aur AgeDays skip karo
      if (["AgeMonth", "AgeDays"].includes(controlId)) return;

      // Edit page specific fields skip karo
      if (EDIT_PAGE_SKIP_FIELDS.includes(controlId)) return;

      // DOM mein field exist nahi karti toh skip karo
      const domElement = document.getElementById(controlId);
      if (!domElement) return;

      const val = getFieldValue(controlId);

      const isAgeField = ["Age", "AgeYear"].includes(controlId);

      const isEmpty =
        val === undefined ||
        val === null ||
        String(val).trim() === "" ||
        (!isAgeField && String(val).trim() === "0") ||
        (Array.isArray(val) && val.length === 0);

      if (isEmpty) {
        errorsFound[controlId] = `${item.ControlDisplayName || item.ControlDisplayID} is required`;
        if (!firstErrorFieldId) firstErrorFieldId = controlId;
      }
    });

    // EPD-034/035: PAN / Aadhaar format must be enforced on this screen (not length-only)
    const identityCheck = validateIdentityProof(
      LTData?.PatientIDProof,
      LTData?.PatientIDProofNo,
    );
    if (!identityCheck.isValid) {
      errorsFound.IdType = identityCheck.message;
      errorsFound.PatientIDProofNo = identityCheck.message;
      if (!firstErrorFieldId) firstErrorFieldId = "PatientIDProofNo";
    }

    // EPD-061: blank email OK; missing @ (and other bad formats) must block save
    const emailCheck = validateEmail(state?.Email);
    if (!emailCheck.isValid) {
      errorsFound.Email = emailCheck.message;
      if (!firstErrorFieldId) firstErrorFieldId = "Email";
    }

    // EPD-070/071: blank pincode OK; non-empty must be exactly 6 digits
    const pincodeCheck = validatePincode(state?.PinCode);
    if (!pincodeCheck.isValid) {
      errorsFound.PinCode = pincodeCheck.message;
      if (!firstErrorFieldId) firstErrorFieldId = "PinCode";
    }

    // EPD-146: Address bounded — never silently truncated (max 50 chars)
    const addressCheck = validateAddress(state?.HouseNo);
    if (!addressCheck.isValid) {
      errorsFound.HouseNo = addressCheck.message;
      errorsFound.Address = addressCheck.message;
      if (!firstErrorFieldId) firstErrorFieldId = "Address";
    }

    // EPD-145: Reason for change is mandatory for compliance/audit trail.
    // An edit saved without a reason leaves an amended patient record with no documented justification.
    const remarkValue = String(state?.Remarks ?? state?.Remark ?? "").trim();
    if (!remarkValue) {
      const reasonMsg = "Reason to Change is required";
      errorsFound.Remarks = reasonMsg;
      errorsFound.Remark = reasonMsg;
      if (!firstErrorFieldId) firstErrorFieldId = "Remarks";
      requestAnimationFrame(() => {
        const el = document.getElementById("Remarks") || document.getElementById("Remark");
        if (el) {
          el.setAttribute("aria-invalid", "true");
          el.classList.add("error", "border-danger", "is-invalid");
          el.setAttribute("title", reasonMsg);
        }
      });
    }

    setMoreErrors(errorsFound);

    if (Object.keys(errorsFound).length > 0) {
      const errorList = Object.values(errorsFound).join("\n• ");
      toast.error(`Please fill required fields:\n• ${errorList}`, {
        autoClose: 5000,
        style: { whiteSpace: "pre-line" },
      });

      setTimeout(() => {
        const element = document.getElementById(firstErrorFieldId);
        if (element) {
          element.scrollIntoView({ behavior: "smooth", block: "center" });
          const input = element.querySelector("input, select, textarea");
          if (input) input.focus();
          else element.focus();
        }
      }, 100);

      return false;
    }
    return true;
  };

  // Flags ID proof on blur / Id Type change (EPD-034/035) — same rules as registration / EditPatientInfo
  const revalidateIdentityProof = (proofType, proofNumber) => {
    const result = validateIdentityProof(proofType, proofNumber);
    setMoreErrors((prev) => {
      const next = { ...prev };
      if (result.isValid) {
        delete next.PatientIDProofNo;
        delete next.IdType;
      } else {
        next.PatientIDProofNo = result.message;
        next.IdType = result.message;
      }
      return next;
    });
    return result.isValid;
  };

  const identityTypeMounted = useRef(false);
  useEffect(() => {
    if (!identityTypeMounted.current) {
      identityTypeMounted.current = true;
      return;
    }
    revalidateIdentityProof(LTData?.PatientIDProof, LTData?.PatientIDProofNo);
  }, [LTData?.PatientIDProof]);

  const getFieldErrorClass = (id) => {
    const EDIT_PAGE_SKIP_FIELDS = ["RegistrationDate", "RegistrationTime"];

    // Skip fields jo edit page pe hain hi nahi
    if (EDIT_PAGE_SKIP_FIELDS.includes(id)) return "";

    const hasError =
      !!moreErrors[id] ||
      ((id === "Remarks" || id === "Remark") && (!!moreErrors?.Remarks || !!moreErrors?.Remark));

    if (id === "Remarks" || id === "Remark") {
      const val = state?.Remarks ?? state?.Remark;
      const isEmpty = val === undefined || val === null || String(val).trim() === "";
      let classes = "";
      if (isEmpty) classes += "mandatory_field ";
      if (hasError) classes += "error border-danger ";
      return classes.trim();
    }

    const controller = controllerDynamicList.find(
      (item) => item.ControlDisplayID === id,
    );

    if (!controller || controller.IsMandatory !== 1 || controller.IsShow !== 1) {
      return hasError ? "error border-danger" : "";
    }

    const val = getFieldValue(id);
    const isAgeField = ["Age", "AgeYear"].includes(id);

    const isMandatoryEmpty =
      val === undefined ||
      val === null ||
      String(val).trim() === "" ||
      (!isAgeField && String(val).trim() === "0") ||
      (Array.isArray(val) && val.length === 0);

    let classes = "";
    if (isMandatoryEmpty) classes += "mandatory_field ";
    if (hasError) classes += "error border-danger ";
    return classes.trim();
  };


  const FieldError = ({ id }) => {

    return moreErrors[id] ? (
      <div className="error-message" style={{ color: "red", fontSize: "10px" }}>
        {moreErrors[id]}
      </div>
    ) : null;
  };

  // ─── Render field by controllerDynamicList item (dynamic, like EditPatientInfo) ─────
  const renderField = (item) => {
    const controlId = item?.ControlDisplayID;

    if (controlId === "CentreID") {
      return (
        <SelectBox
          options={CentreData}
          isDisabled={true}
          name="CentreID"
          lable="Centre"
          selectedValue={LTData?.CentreID}
          onChange={handleSelectChange}
          className="form-control-sm"
        />
      );
    }

    if (controlId === "RateID") {
      return (
        <SelectBox
          isDisabled={true}
          options={RateType}
          name="RateID"
          lable="RateType"
          selectedValue={state?.RateID}
          onChange={handleSelectChange}
          className="form-control-sm"
        />
      );
    }

    if (controlId === "VisitType") {
      return (
        <SelectBox
          name="VisitType"
          options={VisitType}
          isDisabled={true}
          lable="VisitType"
          selectedValue={LTData?.VisitType}
          onChange={handleSelectChange}
          className="form-control-sm"
        />
      );
    }

    if (controlId === "Category") {
      return (
        Category?.length > 0 ? (
          <SelectBox
            name="Category"
            id="Category"
            lable="Department Category"
            isDisabled={true}
            options={[{ label: "", value: "" }, ...Category]}
            selectedValue={LTData?.Category}
            onChange={handleSelectChange}
            className="form-control-sm"
          />
        ) : (
          <div style={{ width: "100%" }}>
            <Input
              type="text"
              lable="Pre Booking No"
              disabled={true}
              name="PreBookingNo"
              placeholder=" "
              id="PreBookingNo"
            />
          </div>
        )
      );
    }

    if (controlId === "Mobile") {
      return (
        <>
          <Input
            name="Mobile"
            id="Mobile"
            onInput={(e) => number(e, DefaultCurrencyName == "KES" ? 14 : 10)}
            onKeyDown={(e) => handlePatientData(e, "Mobile")}
            value={state.Mobile}
            disabled={throughMobileData}
            onChange={handleMainChange}
            type="number"
            lable="Mobile Number"
            placeholder=" "
            className={getFieldErrorClass("Mobile")}
          />
          <FieldError id="Mobile" />
        </>
      );
    }

    if (controlId === "DoctorName") {
      return (
        <>
          <div className="p-inputgroup d-flex">
            <div style={{ width: "87%" }}>
              <Input
                autoComplete="off"
                id="DoctorName"
                name="DoctorName"
                lable="Referred Doctor"
                onChange={(e) => {
                  setIsTyping(true);
                  setFormData({ ...formData, DoctorName: e.target.value });
                  setDropFalse(true);
                  setMoreErrors((prev) => ({ ...prev, DoctorName: "" }));
                }}
                value={formData?.DoctorName}
                onBlur={(e) => {
                  setIsTyping(false);
                  setTimeout(() => {
                    autocompleteOnBlur(setDoctorSuggestion);
                    const data = doctorSuggestion.filter(
                      (ele) => ele?.Name === e.target.value,
                    );
                    if (data.length === 0) {
                      setFormData({ ...formData, DoctorName: "" });
                    }
                  }, 150);
                }}
                onKeyDown={handleIndex}
                placeholder=" "
                type="text"
                className={getFieldErrorClass("DoctorName")}
              />
              <FieldError id="DoctorName" />
              {dropFalse &&
                doctorSuggestion.length > 0 &&
                formData?.DoctorName &&
                (isTyping || !formData?.DoctorName) && (
                  <ul className="suggestion-data">
                    {doctorSuggestion.map((data, index) => (
                      <li
                        onMouseDown={(e) => {
                          e.preventDefault();
                          handleListSearch(data, "DoctorName");
                        }}
                        onClick={() => handleListSearch(data, "DoctorName")}
                        className={`${index === indexMatch && "matchIndex"}`}
                        key={index}
                      >
                        {data?.Name}
                      </li>
                    ))}
                  </ul>
                )}
            </div>
            <div style={{ width: "10%" }}>
              <Tooltip label={"Add Referred Doctor"}>
                <button
                  type="button"
                  className="btn btn-sm btn-primary"
                  onClick={() => handleShow("Refer")}
                >
                  <i className="fa fa-plus-circle fa-sm new_record_pluse"></i>
                </button>
              </Tooltip>
            </div>
          </div>
          {(errors?.DoctorID || errors?.DoctorName) &&
            (touched?.DoctorID || touched?.DoctorName) && (
              <div className="error-message">
                {errors?.DoctorID || errors?.DoctorName}
              </div>
            )}
        </>
      );
    }
    if (controlId === "SecondReferDoctor") {
      return (
        <>
          <div className="p-inputgroup d-flex">
            <div style={{ width: "87%" }}>
              <Input
                autoComplete="off"
                id="SecondReferDoctor"
                name="SecondReferDoctor"
                lable="Second Ref. Doctor"
                onChange={(e) => {
                  setIsTyping(true);
                  setFormData({ ...formData, SecondReferDoctor: e.target.value });
                  setLTData({
                    ...LTData,
                    SecondReferDoctor: e.target.value,
                    // SecondReferDoctorID: "",
                  });
                  setSecondDropFalse(true);
                  setMoreErrors((prev) => ({ ...prev, SecondReferDoctor: "" }));
                }}
                value={formData?.SecondReferDoctor}
                onBlur={(e) => {
                  setTimeout(() => {
                    autocompleteOnBlur(setSecondDoctorSuggestion);
                    // Only clear if no ID was stored (meaning nothing was actually selected)
                    // if (!LTData?.SecondReferDoctor) {
                    //   setFormData((prev) => ({ ...prev, SecondReferDoctor: "" }));
                    // }
                    if (state?.SecondReferDoctor) {
                      setFormData((prev) => ({
                        ...prev,
                        SecondReferDoctor: state?.SecondReferName || "",
                      }));
                    } else {
                      setFormData((prev) => ({
                        ...prev,
                        SecondReferDoctor: "",
                      }));
                    }
                  }, 150);
                }}
                onKeyDown={handleIndex}
                placeholder=" "
                type="text"
                className={getFieldErrorClass("SecondReferDoctor")}
              />

              <FieldError id="SecondReferDoctor" />

              {secondDropFalse &&
                secondDoctorSuggestion.length > 0 &&
                formData?.SecondReferDoctor && (
                  <ul className="suggestion-data">
                    {secondDoctorSuggestion.map((data, index) => (
                      <li
                        onMouseDown={(e) => {
                          e.preventDefault();
                          handleListSearch(data, "SecondReferDoctor");
                        }}
                        onClick={() => handleListSearch(data, "SecondReferDoctor")}
                        className={`${index === indexMatch && "matchIndex"}`}
                        key={index}
                      >
                        {data?.Name}
                      </li>
                    ))}
                  </ul>
                )}
            </div>

            <div style={{ width: "10%" }}>
              <Tooltip label={"Add Second Ref. Doctor"}>
                <button
                  type="button"
                  className="btn btn-sm btn-primary"
                  onClick={() => handleShow("Secondary")}
                >
                  <i className="fa fa-plus-circle fa-sm new_record_pluse"></i>
                </button>
              </Tooltip>
            </div>
          </div>
        </>
      );
    }
    if (controlId === "Title") {
      return (
        <>
          <div className="d-flex">
            <div style={{ width: "30%" }}>
              <SelectBox
                options={Title}
                name="Title"
                id="Title"
                lable="Title"
                isDisabled={throughMobileData}
                selectedValue={state?.Title}
                onChange={handleMainChange}
                className={`form-control-sm ${getFieldErrorClass("Title")}`}
              />
              <FieldError id="Title" />
            </div>
            <div style={{ width: "70%" }}>
              <Input
                max={35}
                name="FirstName"
                type="text"
                id="FirstName"
                lable="First Name"
                placeholder=" "
                disabled={throughMobileData}
                value={state?.FirstName}
                onChange={handleMainChange}
                className={getFieldErrorClass("FirstName")}
              />
              <FieldError id="FirstName" />
            </div>
          </div>
        </>
      );
    }

    if (controlId === "FirstName") {
      const titleItem = controllerDynamicList.find((x) => x.ControlDisplayID === "Title");
      if (titleItem && titleItem.IsShow === 1) return null;
      return (
        <>
          <Input
            max={35}
            name="FirstName"
            type="text"
            id="FirstName"
            lable="First Name"
            placeholder=" "
            disabled={throughMobileData}
            value={state?.FirstName}
            onChange={handleMainChange}
            className={getFieldErrorClass("FirstName")}
          />
          <FieldError id="FirstName" />
        </>
      );
    }

    if (controlId === "MiddleName") {
      return (
        <>
          <Input
            type="text"
            lable="Middle Name"
            name="MiddleName"
            placeholder=" "
            id="MiddleName"
            value={state?.MiddleName}
            disabled={throughMobileData}
            max={35}
            onChange={handleMainChange}
            className={getFieldErrorClass("MiddleName")}
          />
          <FieldError id="MiddleName" />
        </>
      );
    }

    if (controlId === "LastName") {
      return (
        <>
          <Input
            type="text"
            lable="Last Name"
            name="LastName"
            placeholder=" "
            id="LastName"
            value={state?.LastName}
            disabled={throughMobileData}
            onChange={handleMainChange}
            className={getFieldErrorClass("LastName")}
          />
          <FieldError id="LastName" />
        </>
      );
    }

    if (controlId === "Gender") {
      return (
        <>
          <SelectBox
            options={Gender}
            name="Gender"
            id="Gender"
            lable="Gender"
            isDisabled={
              ["Baby", "Baby of", "Baby Of", "BabyOf", "Babyof", "Master", "B/O", "C/O", "S/O", "Dr.", "Baby of."].includes(state?.Title)
                ? false
                : state?.Title || state?.Title == ""
                  ? true
                  : false
            }
            selectedValue={state?.Gender}
            onChange={handleMainChange}
            className={`form-control-sm ${getFieldErrorClass("Gender")}`}
          />
          <FieldError id="Gender" />
        </>
      );
    }

    if (controlId === "DOB") {
      return (
        <>
          <DatePicker
            value={state?.DOB}
            className={`custom-calendar ${getFieldErrorClass("DOB")}`}
            name="DOB"
            disabled={throughMobileData}
            placeholder=" "
            id="DOB"
            lable="DOB"
            maxDate={new Date()}
            onChange={dateSelect}
            inputClassName="form-control-sm"
          />
          <FieldError id="DOB" />
        </>
      );
    }

    if (controlId === "AgeYear" || controlId === "Age") {
      return (
        <>
          <div className="p-inputgroup flex-1">
            <Input
              placeholder=" "
              type="number"
              id="Y"
              name="AgeYear"
              value={state?.AgeYear}
              onInput={(e) => number(e, 3, 120)}
              disabled={throughMobileData}
              onChange={handleMainChange}
              className={getFieldErrorClass("Age")}
            />
            <Input
              placeholder=" "
              type="number"
              id="M"
              name="AgeMonth"
              value={state?.AgeMonth}
              onInput={(e) => number(e, 2, 12)}
              disabled={throughMobileData}
              onChange={handleMainChange}
            />
            <Input
              placeholder=" "
              type="number"
              id="D"
              name="AgeDays"
              value={state?.AgeDays}
              onInput={(e) => number(e, 2, 31)}
              disabled={throughMobileData}
              onChange={handleMainChange}
            />
          </div>
          <FieldError id="Age" />
        </>
      );
    }

    if (controlId === "AgeMonth" || controlId === "AgeDays") {
      return null;
    }

    if (controlId === "Email") {
      const emailError = moreErrors?.Email;
      return (
        <>
          <Input
            type="text"
            lable="Email"
            name="Email"
            placeholder=" "
            id="Email"
            value={state?.Email}
            onChange={(e) => {
              const value = e.target.value;
              setState((prev) => ({ ...prev, Email: value }));
              const check = validateEmail(value);
              setMoreErrors((prev) => {
                const next = { ...prev };
                if (check.isValid) delete next.Email;
                else next.Email = check.message;
                return next;
              });
            }}
            onBlur={(e) => {
              const value = e?.target?.value ?? state?.Email;
              const check = validateEmail(value);
              setMoreErrors((prev) => {
                const next = { ...prev };
                if (check.isValid) delete next.Email;
                else next.Email = check.message;
                return next;
              });
            }}
            ariaInvalid={!!emailError}
            ariaDescribedBy={emailError ? "Email-error" : undefined}
            className={`${getFieldErrorClass("Email")}${emailError ? " error border-danger is-invalid" : ""}`}
          />
          {emailError ? (
            <div
              id="Email-error"
              className="error-message"
              style={{ color: "red", fontSize: "10px" }}
              role="alert"
            >
              {emailError}
            </div>
          ) : (
            <FieldError id="Email" />
          )}
        </>
      );
    }

    if (controlId === "Address" || controlId === "HouseNo") {
      const addressError = moreErrors?.Address || moreErrors?.HouseNo;
      const applyAddressValidation = (raw) => {
        const value = raw == null ? "" : String(raw);
        const check = validateAddress(value);
        setMoreErrors((prev) => {
          const next = { ...prev };
          if (check.isValid) {
            delete next.Address;
            delete next.HouseNo;
          } else {
            next.Address = check.message;
            next.HouseNo = check.message;
          }
          return next;
        });
        requestAnimationFrame(() => {
          const el = document.getElementById("Address") || document.getElementById("HouseNo");
          if (!el) return;
          if (check.isValid) {
            el.removeAttribute("aria-invalid");
            el.classList.remove("error", "border-danger", "is-invalid");
            el.removeAttribute("title");
          } else {
            el.setAttribute("aria-invalid", "true");
            el.classList.add("error", "border-danger", "is-invalid");
            el.setAttribute("title", check.message);
          }
        });
        return check;
      };

      return (
        <>
          <Input
            lable="Address"
            type="text"
            name="HouseNo"
            maxLength={ADDRESS_MAX_LENGTH}
            placeholder=" "
            id="Address"
            value={state?.HouseNo ?? ""}
            onChange={handleMainChange}
            onBlur={(e) => {
              applyAddressValidation(e?.target?.value ?? state?.HouseNo);
            }}
            ariaInvalid={!!addressError}
            ariaDescribedBy={addressError ? "Address-error" : undefined}
            className={`${getFieldErrorClass("Address")}${addressError ? " error border-danger is-invalid" : ""}`}
          />
          {addressError ? (
            <div
              id="Address-error"
              className="error-message"
              style={{ color: "red", fontSize: "10px" }}
              role="alert"
            >
              {addressError}
            </div>
          ) : (
            <FieldError id="Address" />
          )}
        </>
      );
    }

    if (controlId === "PinCode" || controlId === "Pincode") {
      const pinError = moreErrors?.PinCode;
      const applyPinValidation = (raw) => {
        const value = raw == null ? "" : String(raw);
        const check = validatePincode(value);
        setMoreErrors((prev) => {
          const next = { ...prev };
          if (check.isValid) delete next.PinCode;
          else next.PinCode = check.message;
          return next;
        });
        // Ensure evaluate() sees the flag even if a later paint races (EPD-070/071)
        requestAnimationFrame(() => {
          const el = document.getElementById("PinCode");
          if (!el) return;
          if (check.isValid) {
            el.removeAttribute("aria-invalid");
            el.classList.remove("error", "border-danger", "is-invalid");
            el.removeAttribute("title");
          } else {
            el.setAttribute("aria-invalid", "true");
            el.classList.add("error", "border-danger", "is-invalid");
            el.setAttribute("title", check.message);
          }
        });
        return check;
      };

      return (
        <>
          <Input
            lable="Pincode"
            type="text"
            name="PinCode"
            placeholder=" "
            maxLength={6}
            onInput={(e) => {
              number(e, 6);
              const value = e.target.value;
              setState((prev) => ({ ...prev, PinCode: value }));
              applyPinValidation(value);
            }}
            id="PinCode"
            value={state?.PinCode ?? ""}
            onChange={(e) => {
              const value = e.target.value;
              setState((prev) => ({ ...prev, PinCode: value }));
              applyPinValidation(value);
            }}
            onBlur={(e) => {
              applyPinValidation(e?.target?.value ?? state?.PinCode);
            }}
            ariaInvalid={!!pinError}
            ariaDescribedBy={pinError ? "PinCode-error" : undefined}
            className={`${getFieldErrorClass("PinCode")}${pinError ? " error border-danger is-invalid" : ""}`}
          />
          <div
            id="PinCode-error"
            className="error-message"
            style={{
              color: "red",
              fontSize: "10px",
              display: pinError ? "block" : "none",
            }}
            role="alert"
          >
            {pinError || ""}
          </div>
        </>
      );
    }

    if (controlId === "Locality") {
      return (
        <>
          <Input
            lable="Locality"
            max={30}
            type="text"
            value={state?.Locality}
            onChange={handleMainChange}
            name="Locality"
            placeholder=" "
            id="Locality"
            className={getFieldErrorClass("Locality")}
          />
          <FieldError id="Locality" />
        </>
      );
    }

    if (controlId === "City") {
      return (
        <>
          <Input
            max={30}
            type="text"
            value={state?.City}
            onChange={handleMainChange}
            lable="City"
            name="City"
            placeholder=" "
            id="City"
            className={getFieldErrorClass("City")}
          />
          <FieldError id="City" />
        </>
      );
    }

    if (controlId === "State") {
      return (
        <>
          <Input
            type="text"
            lable="State"
            name="State"
            placeholder=" "
            id="State"
            max={30}
            value={state?.State}
            onChange={handleMainChange}
            className={getFieldErrorClass("State")}
          />
          <FieldError id="State" />
        </>
      );
    }

    if (controlId === "Country") {
      return (
        <>
          <Input
            max={30}
            value={state?.Country}
            type="text"
            onChange={handleMainChange}
            lable="Country"
            name="Country"
            placeholder=" "
            id="Country"
            className={getFieldErrorClass("Country")}
          />
          <FieldError id="Country" />
        </>
      );
    }

    if (controlId === "Remarks" || controlId === "Remark") {
      const remarkError = moreErrors?.Remarks || moreErrors?.Remark;
      const applyRemarkValidation = (raw) => {
        const val = raw == null ? "" : String(raw).trim();
        setMoreErrors((prev) => {
          const next = { ...prev };
          if (val) {
            delete next.Remarks;
            delete next.Remark;
          } else {
            next.Remarks = "Reason to Change is required";
            next.Remark = "Reason to Change is required";
          }
          return next;
        });
        requestAnimationFrame(() => {
          const el = document.getElementById("Remarks") || document.getElementById("Remark");
          if (!el) return;
          if (val) {
            el.removeAttribute("aria-invalid");
            el.classList.remove("error", "border-danger", "is-invalid");
            el.removeAttribute("title");
          } else {
            el.setAttribute("aria-invalid", "true");
            el.classList.add("error", "border-danger", "is-invalid");
            el.setAttribute("title", "Reason to Change is required");
          }
        });
      };

      return (
        <>
          <Input
            max={100}
            value={state?.Remarks ?? state?.Remark ?? ""}
            type="text"
            onChange={(e) => {
              const val = e.target.value;
              setState((prev) => ({ ...prev, Remarks: val, Remark: val }));
              applyRemarkValidation(val);
            }}
            onBlur={(e) => {
              applyRemarkValidation(e?.target?.value ?? state?.Remarks ?? state?.Remark);
            }}
            lable={item?.ControlDisplayName || "Reason to Change Demographic"}
            name="Remarks"
            placeholder=" "
            id="Remarks"
            ariaInvalid={!!remarkError}
            ariaDescribedBy={remarkError ? "Remarks-error" : undefined}
            className={`required-fields ${getFieldErrorClass("Remarks")}${remarkError ? " error border-danger is-invalid" : ""}`}
          />
          {remarkError ? (
            <div
              id="Remarks-error"
              className="error-message"
              style={{ color: "red", fontSize: "10px" }}
              role="alert"
            >
              {remarkError}
            </div>
          ) : (
            <FieldError id="Remarks" />
          )}
        </>
      );
    }

    if (controlId === "SecondaryMobile" || controlId === "SecondaryNumber") {
      return (
        <>
          <Input
            name="SecondaryNumber"
            id="SecondaryNumber"
            onInput={(e) => number(e, 14)}
            onKeyDown={(e) => handlePatientData(e, "SecondaryNumber")}
            value={state.SecondaryNumber}
            disabled={throughMobileData}
            onChange={handleMainChange}
            type="number"
            lable="Alternate Phone Number"
            placeholder=" "
          />
        </>
      );
    }

    if (controlId === "IdType") {
      return (
        <>
          <div className="d-flex">
            <div style={{ width: "40%" }}>
              <SelectBox
                name="PatientIDProof"
                options={[{ label: "Choose ID", value: "" }, ...Identity]}
                selectedValue={LTData?.PatientIDProof}
                id="IdType"
                lable="Id Type"
                onChange={handleSelectChange}
                className={getFieldErrorClass("IdType")}
              />
            </div>
            <div style={{ width: "60%" }}>
              <Input
                name="PatientIDProofNo"
                type="text"
                max={20}
                onChange={handleLTData}
                onBlur={(e) =>
                  revalidateIdentityProof(
                    LTData?.PatientIDProof,
                    e?.target?.value ?? LTData?.PatientIDProofNo,
                  )
                }
                disabled={!String(LTData?.PatientIDProof || "").trim()}
                value={LTData?.PatientIDProofNo}
                id="PatientIDProofNo"
                lable="Patient ID Proof Number"
                placeholder=" "
                className={getFieldErrorClass("PatientIDProofNo")}
                ariaInvalid={!!moreErrors?.PatientIDProofNo}
              />
            </div>
          </div>
          <FieldError id="IdType" />
          <FieldError id="PatientIDProofNo" />
        </>
      );
    }

    if (controlId === "CollectionBoyId") {
      return (
        <SelectBox
          name="CollectionBoyId"
          options={[{ label: "Select Collection Boy", value: "" }, ...CollectionBoy]}
          lable="Collection Boy"
          isDisabled={true}
          selectedValue={LTData?.CollectionBoyId}
          onChange={handleSelectChange}
          className="form-control-sm"
        />
      );
    }

    if (controlId === "nikshayID") {
      return (
        <Input
          name="NikshayID"
          type="text"
          disabled={true}
          value={LTData?.NikshayID}
          id="NikshayID"
          lable="NikshayID"
          placeholder=" "
        />
      );
    }

    if (controlId === "TRFNo") {
      return (
        <Input
          maxLength={30}
          value={LTData?.TRFNo}
          type="text"
          onChange={handleLTData}
          lable={t("TRf No")}
          name="TRFNo"
          id="TRFNo"
          placeholder={t("")}
        />
      );
    }

    if (controlId === "SrfId") {
      return (
        <Input
          maxLength={30}
          value={LTData?.SrfId}
          type="text"
          onChange={handleLTData}
          lable={t("SRF No")}
          name="SrfId"
          id="SrfId"
          placeholder={t("")}
        />
      );
    }

    if (controlId === "SampleCollectionDate") {
      return (
        <DatePicker
          showOnFocus={false}
          value={new Date(LTData?.SampleCollectionDate?.split(" ")?.[0])}
          className="custom-calendar flex-grow-1"
          name="data"
          placeholder={t("SampleCollectionDate")}
          id="data"
          lable={t("SampleCollectionDate")}
          maxDate={new Date()}
          disabled={true}
          inputClassName="form-control-sm"
        />
      );
    }

    if (controlId === "SampleCollectionTime") {
      return (
        <Input
          name="SampleCollectionTime"
          type="text"
          disabled={true}
          value={
            LTData?.SampleCollectionDate
              ? new Date(LTData?.SampleCollectionDate).toLocaleTimeString("en-GB", { hour12: true })
              : ""
          }
          id="SampleCollectionTime"
          lable="SampleCollectionTime"
          placeholder=" "
        />
      );
    }

    return null;
  };

  const findGender = () => {
    const male = ["Mr.", "Baba", "Dr.(Mrs)"];
    const female = ["Miss.", "Mrs.", "Baby", "Dr.(Miss)", "Ms.", "SMT."];

    if (male.includes(state?.Title)) {
      setState({ ...state, Gender: "Male" });
    }

    if (female.includes(state?.Title)) {
      setState({ ...state, Gender: "Female" });
    }
  };

  useEffect(() => {
    findGender();
  }, [state?.Title]);

  const dateSelect = (value, name) => {
    var diff = moment(moment(), "milliseconds").diff(
      moment(value).format("YYYY-MM-DD"),
    );
    var duration = moment.duration(diff);
    setState({
      ...state,
      [name]: value,
      AgeYear: duration?._data?.years,
      AgeMonth: duration._data?.months,
      AgeDays: duration?._data?.days,
      TotalAgeInDays: moment(moment().format("YYYY-MM-DD")).diff(value, "days"),
      Age: `${duration?._data?.years} Y ${duration._data?.months} M ${duration?._data?.days} D`,
    });

    setTableData([]);
    setRcData([
      {
        PayBy: "Patient",
        ReceiptNo: "",
        ledgerNoCr: "",
        RateTypeId: state?.RateID,
        PaymentMode: "Cash",
        PaymentModeID: 134,
        CardDate: "",
        CardNo: "",
        BankName: "",
        Amount: "",
        CentreID: state?.CentreID,
      },
    ]);
  };

  const handleIndex = (e) => {
    const { name } = e.target;

    const safeGet = (arr, idx) =>
      Array.isArray(arr) && arr.length > 0 ? arr[idx] : null;

    switch (name) {
      case "TestName":
        switch (e.which) {
          case 38: // Up
            if (suggestion?.length) {
              if (indexMatch !== 0) {
                setIndexMatch(indexMatch - 1);
              } else {
                setIndexMatch(suggestion.length - 1);
              }
            }
            break;

          case 40: // Down
            if (suggestion?.length) {
              if (suggestion.length - 1 === indexMatch) {
                setIndexMatch(0);
              } else {
                setIndexMatch(indexMatch + 1);
              }
            }
            break;

          case 13: // Enter
            if (suggestion?.length > 0) {
              const item = safeGet(suggestion, indexMatch);
              if (item) {
                handleListSearch(item, name);
              }
            }
            setIndexMatch(0);
            break;
          default:
            break;
        }
        break;
      case "DoctorName":
        switch (e.which) {
          case 38: // Up
            if (doctorSuggestion?.length) {
              if (indexMatch !== 0) {
                setIndexMatch(indexMatch - 1);
              } else {
                setIndexMatch(doctorSuggestion.length - 1);
              }
            }
            break;

          case 40: // Down
            if (doctorSuggestion?.length) {
              if (doctorSuggestion.length - 1 === indexMatch) {
                setIndexMatch(0);
              } else {
                setIndexMatch(indexMatch + 1);
              }
            }
            break;

          case 13: // Enter
            if (doctorSuggestion?.length > 0) {
              const item = safeGet(doctorSuggestion, indexMatch);
              if (item) {
                handleListSearch(item, name);
              }
            }
            setIndexMatch(0);
            break;
          default:
            break;
        }
        break;
      default:
        break;
    }
  };
  const VisitTypeCategory = (value) => {
    axiosInstance
      .post("CommonController/GetVisitCategoryData", { VisitTypeID: value })
      .then((res) => {
        if (res?.data?.success) {
          const data = res?.data?.message;
          const activeData = data?.filter((ele) => ele?.IsActive == 1);
          const finalData = activeData?.map((ele) => {
            return {
              value: ele.CategoryID,
              label: ele.Category,
            };
          });
          setCategory(finalData);
        } else {
          setCategory([]);
        }
      })
      .catch((err) => console.log(err));
  };

  const EditPatientDetail = (editID) => {
    axiosInstance
      .post("PatientRegistration/getDataEditByLabNo", {
        LabNo: editID,
      })
      .then((res) => {
        console.log("res?.data?.message?.ltData[0]", res?.data?.message?.ltData[0])
        setPloInitData(res?.data?.message?.plo || []);
        const patient = res?.data?.message?.patientDetail?.[0];
        patientEditBaselineRef.current = {
          Email: patient?.Email ?? "",
          City: patient?.City ?? "",
          Locality: patient?.Locality ?? "",
          HouseNo: patient?.HouseNo ?? "",
          StreetName: patient?.StreetName ?? "",
          State: patient?.State ?? "",
          Country: patient?.Country ?? "",
          PinCode: patient?.PinCode ?? patient?.Pincode ?? "",
          Mobile: patient?.Mobile ?? "",
          Phone: patient?.Phone ?? "",
          SecondaryNumber: patient?.SecondaryNumber ?? "",
          FirstName: patient?.FirstName ?? "",
          MiddleName: patient?.MiddleName ?? "",
          LastName: patient?.LastName ?? "",
          Title: patient?.Title ?? "",
          Gender: patient?.Gender ?? "",
          PatientDtUpdate: patient?.PatientDtUpdate ?? "",
        };
        setState({
          ...res?.data?.message?.patientDetail[0],
          HideAmount: res?.data?.message?.ltData[0]?.HideAmount,
          DOB: new Date(res?.data?.message?.patientDetail[0]?.DOB),
          SecondReferDoctor: Number(patient?.SecondReferDoctor || 0),
          SecondReferName: patient?.SecondReferName || "",
          PatientDtUpdate: patient?.PatientDtUpdate || "",
        });

        setPndt({
          PNDT: res?.data?.message?.ltData[0]?.IsPndt == 1 ? true : false,
          NoOfChildren: res?.data?.message?.ltData[0]?.NoOfChildren,
          NoOfSon: res?.data?.message?.ltData[0]?.NoOfSon,
          NoOfDaughter: res?.data?.message?.ltData[0]?.NoOfDaughter,
          Pregnancy:
            res?.data?.message?.ltData[0]?.Pregnancy == "01-Jan-0001"
              ? "0001-01-01"
              : new Date(res?.data?.message?.ltData[0]?.Pregnancy),
          AgeOfSon: res?.data?.message?.ltData[0]?.AgeOfSon,
          AgeOfDaughter: res?.data?.message?.ltData[0]?.AgeOfDaughter,
          PNDTDoctor: res?.data?.message?.ltData[0]?.PNDTDoctor,
          Husband: res?.data?.message?.ltData[0]?.Husband,
        });
        setLTData({
          ...res?.data?.message?.ltData[0],
          LedgertransactionID:
            res?.data?.message?.ltData[0]?.LedgerTransactionID,
          BTB: res?.data?.message?.ltData[0]?.BTB,
          OPDIPD: res?.data?.message?.ltData[0]?.HLMOPDIPDNo,
          SrfId: res?.data?.message?.ltData[0]?.SrfId,
          MembershipID: res?.data?.message?.ltData[0]?.MembershipID || 0,
          MembershipCardNo: res?.data?.message?.ltData[0]?.MembershipCardNo || "",
          PolicyID: res?.data?.message?.ltData[0]?.PolicyID || 0,
          CoupanId: res?.data?.message?.ltData[0]?.CoupanId || 0,
          IsCoupon: res?.data?.message?.ltData[0]?.IsCoupon || 0,
        });
        VisitTypeCategory(Number(res?.data?.message?.ltData[0]?.VisitType));
        getAccessDataRate(setRateType, res?.data?.message?.ltData[0]?.CentreID);

        let data = res?.data?.message?.plo;
        data = data.map((ele) => {
          return {
            ...ele,
            // The edit API returns historical Rate/Discount as totals. Keep
            // unit values in the table; Amount/NetAmount remains the line total.
            Quantity: Number(ele?.Quantity) || 1,
            Rate: Number(ele?.Rate) / (Number(ele?.Quantity) || 1),
            Discount: Number(ele?.Discount) / (Number(ele?.Quantity) || 1),
            isDisable: true,
            UpdateModalityId: "0",
            OldUpdateModalityId: "0",
            OldStartEndTimeSlot: ele?.OldStartEndTimeSlot,
            OldBookingDate: ele?.OldBookingDate
              ? moment(ele?.OldBookingDate).format("YYYY-MM-DD")
              : moment(new Date()).format("YYYY-MM-DD"),
            OldModalityID: ele?.OldModalityID,
            SetMRP: ele?.SetMRP,
            IsMrpset: ele?.IsMrpset,
            InvestigationSampleType: ele?.InvestigationSampleType,
          };
        });
        const val = data.map((ele) => {
          return {
            DepartmentName: ele?.DepartmentName,
            InvestigationSampleType: ele?.InvestigationSampleType,
            SetMRP: ele?.SetMRP,
            IsMrpset: ele?.IsMrpset,
            IsSampleCollected: ele?.IsSampleCollected,
            IsSampleRequired: ele?.IsSampleRequired,
            Status: ele?.Status,
            IsUrgent: ele?.IsUrgent,
            sampleTypeID: ele?.SampleTypeID,
            SampleTypeName: ele?.SampleTypeName,
            ItemId: ele?.InvestigationID,
            ItemName: ele?.TestName,
            InvestigationID: ele?.InvestigationID,
            InvestigationName: ele?.TestName,
            ReportType: ele?.ReportType,
            IsPackage: ele?.IsPackage,
            Rate: ele?.Rate,
            Amount: ele?.NetAmount,
            Quantity: Number(ele?.Quantity) || 1,
            PCCDiscAmt: 0,
            PCCDiscPer: 0,
            RateTypeId: ele?.RateTypeId,
            // Discount is per unit in the table; PLO.DiscountAmt is the line total.
            DiscountAmt: (Number(ele?.Discount) || 0) * (Number(ele?.Quantity) || 1),
            DiscountApprovedBy: ele?.DiscountApprovedBy,
            DiscountReason: ele?.DiscountReason,
            IsReporting: ele?.IsReporting?.toString(),
            ageInDays: ele?.ageInDays,
            Gender: ele?.Gender,
            CentreID: ele?.CentreID,
            SampleBySelf: "1",
            sampleCollectionBy: 0,
            DeliveryDate: ele?.DeliveryDate,
            BarcodeNo: ele?.BarcodeNo,
            UrgentDateTime: ele?.UrgentDateTime,
            DepartmentID: ele?.DepartmentID,
            isHistoryReq: 0,
            PackageCode: "",
            PackageName: "",
            TestCode: ele?.TestCode,
            TestIdHash: ele?.TestIdHash,
            isLabOutSource: ele?.isLabOutSource,
            IcmrId: ele?.IcmrId,
            IsCulture: ele?.IsCulture,
            Radiology: ele?.Radiology,
            UpdateModalityId: 0,
            OldUpdateModalityId: 0,
            IsCovid: ele?.IsCovid,
            isDisable: true,
            departmentPrintOrder: ele?.departmentPrintOrder,
            investigationPrintOrder: ele?.investigationPrintOrder,
            paybypatient: ele?.paybypatient,   // ← add
            paybypanel: ele?.paybypanel,
          };
        });
        setPLO(val);

        setTableData(data);
        setRcData(res?.data?.message?.rcData);
        setFormData({
          ...formData,
          DoctorName: res?.data?.message?.ltData[0]?.DoctorName,
          SecondReferDoctor:
            res?.data?.message?.ltData[0]?.SecondReferName ||
            res?.data?.message?.patientDetail[0]?.SecondReferName ||
            "",

        });
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const handleKeyDown = (e, currentId) => {
    if (e.key !== "Tab") return;

    if (e.target && typeof e.target.select === 'function') {
      e.target.select();
    }

    e.preventDefault();
    // focusNextById(currentId, e.shiftKey);
  };

  console.log("LTData::", LTData);
  console.log("State", state);

  useEffect(() => {
    BindDoctorData();
    EditPatientDetail(reprintLabNo || location?.state?.data);
  }, []);

  const handleListSearch = (data, name) => {
    switch (name) {
      case "TestName":
        setSearchForm({
          ...searchForm,
          TestName: "",
          InvestigationID: data.InvestigationID,
        });
        setIndexMatch(0);
        setSuggestion([]);
        getTableData(data);
        break;
      case "DoctorName":
        setFormData({ ...formData, [name]: data.Name });
        setLTData({
          ...LTData,
          [name]: data.Name,
          DoctorID: data.DoctorReferalID,
          ReferLabId: data.DoctorReferalID,
          ReferLabName: data.Name,
        });
        setIndexMatch(0);
        setDoctorSuggestion([]);
        setDropFalse(false);
        break;
      case "SecondReferDoctor":
        setFormData({ ...formData, [name]: data.Name });
        setLTData({
          ...LTData,
          // SecondReferDoctor: data.Name,
          SecondReferDoctor: data.DoctorReferalID,
          // SecondReferDoctorID: data.DoctorReferalID,
        });
        setIndexMatch(0);
        setSecondDoctorSuggestion([]);
        setSecondDropFalse(false);
        break;
      default:
        break;
    }
  };

  const handleFileValidationUpload = () => {
    let requiredDocument = [];
    let DocumentFlag = true;
    let message = "";
    tableData.map((ele) => {
      if (ele.RequiredAttachment !== "") {
        requiredDocument.push(ele.RequiredAttachment);
      }
    });

    for (let i = 0; i < requiredDocument.length; i++) {
      if (!UploadDoumentType.includes(requiredDocument[i])) {
        DocumentFlag = false;
        message = requiredDocument[i];
        break;
      }
    }

    return {
      DocumentFlag,
      message,
    };
  };

  // const handleLTData = (e) => {
  //   const { name, value } = e.target;
  //   setLTData({
  //     ...LTData,
  //     [name]: value,
  //   });
  // };
  const handleLTData = (e) => {
    const { name, value } = e.target;

    // FIX: LTData field change hone par error clear karo
    setMoreErrors((prev) => ({ ...prev, [name]: "" }));

    setLTData({
      ...LTData,
      [name]: value,
    });
  };
  const getBarcode = (id) => {
    let barcode = "";
    if (BarcodeLogic === 3) {
      barcode = tableData[0]?.BarcodeNo;
    } else if (BarcodeLogic === 4) {
      tableData?.map((ele) => {
        if (ele?.SampleTypeID === id) {
          barcode = ele?.BarcodeNo;
        }
      });
    }
    return barcode;
  };

  const FindBarcode = (id) => {
    let disable = false;
    for (let i = 0; i < tableData?.length; i++) {
      if (tableData[i]["Status"] === 3 && tableData[i]["SampleTypeID"] === id) {
        disable = true;
      }
    }

    return disable;
  };

  useEffect(() => {
    if (state.RateID !== "" && RateType.length > 0) {
      const data = RateType?.find((ele) => ele.value == state?.RateID);
      setBarcodeLogic(Number(data?.BarcodeLogic));
    }
  }, [state?.RateID, RateType]);

  const handleSelectSlot = (data, slotData, testData) => {
    toast.success("Slot Added Successfully");
    const index = tableData?.findIndex(
      (item) => item.InvestigationID === testData.InvestigationID,
    );

    if (index !== -1) {
      const updatedTableData = [...tableData];
      updatedTableData[index] = {
        ...updatedTableData[index],
        StartTime: slotData?.StartTime,
        EndTime: slotData?.EndTime,
        StartEndTimeSlot: slotData?.StartEndTimeSlot,
        status: slotData?.status,
        color: slotData?.color,
        isSelected: slotData?.isSelected,
        InvestigationDate: data?.InvestigationDate,
        ModalityId: data?.ModalityId,
        SelectedTimeSlot: data?.SelectedTimeSlot,
        ModalityName: data?.ModalityName,
        ShiftName: data?.ShiftName,
        UpdateModalityId: "1",
        OldUpdateModalityId: "1",
        // Was missing here - bookPendingRadiologySlots() below reads this to
        // actually call SaveMacRadiologyAppointment at Save time. Without it
        // a re-picked slot on an already-present row never got booked.
        PendingRadiologyBooking: data?.PendingRadiologyBooking,
        RadiologyAppointmentId: 0,
      };

      setTableData(updatedTableData);
    } else {
      setTableData([
        ...tableData,
        {
          ...data,
          ...slotData,
          ...testData,
          Discount: data?.Discount
            ? ((Number(testData.Rate) * data?.Discount) / 100).toFixed(2)
            : "",
          Rate: Number(testData.Rate).toFixed(2),
          NetAmount: data?.Discount
            ? (
              testData.Rate -
              (Number(testData.Rate) * data?.Discount) / 100
            ).toFixed(2)
            : Number(testData.Rate).toFixed(2),
          IsSampleCollected: "N",
          Status: 1,
          IsUrgent: 0,
          UrgentDateTime: "",
          BarcodeNo: getBarcode(testData?.SampleTypeID),
          isLabOutSource: testData?.isLabOutSource,
          IsCulture: testData?.IsCulture,
          UpdateModalityId: "1",
          OldUpdateModalityId: "0",
        },
      ]);
    }
  };

  // Ported from PatientRegistration.jsx's identically-named function - see
  // SlotBookModal.jsx's header comment: picking a slot in that modal never
  // calls SaveMacRadiologyAppointment itself (there is no "hold" endpoint),
  // it only stashes a PendingRadiologyBooking on the row via
  // handleSelectSlot above. Actually booking it is deferred to here, called
  // right before Save. Without this step (which this Edit page never had),
  // a newly-picked radiology slot never became a real appointment - the row
  // just carried local-only slot fields that RegistrationEditData has no way
  // to turn into an appointment_radiology_details row.
  const bookPendingRadiologySlots = async () => {
    const pendingRows = tableData.filter(
      (row) => row?.Radiology == 1 && !row?.RadiologyAppointmentId && row?.PendingRadiologyBooking,
    );
    if (pendingRows.length === 0) return tableData;

    const patientName = [state?.FirstName, state?.MiddleName, state?.LastName]
      .filter(Boolean)
      .join(" ");

    let updated = [...tableData];
    for (const row of pendingRows) {
      const b = row.PendingRadiologyBooking;
      const payload = {
        appointmentId: 0,
        title: state?.Title || "Mr.",
        mobileNo: state?.Mobile || "",
        patientName,
        dob: state?.DOB ? moment(state.DOB).format("DD/MMM/YYYY") : "",
        ageYear: state?.AgeYear || 0,
        ageMonth: state?.AgeMonth || 0,
        ageDays: state?.AgeDays || 0,
        age: `${state?.AgeYear || 0} Y ${state?.AgeMonth || 0} M ${state?.AgeDays || 0} D`,
        gender: state?.Gender || "",
        emailId: state?.Email || "",
        address: state?.HouseNo || "",
        country: state?.Country || "",
        state: state?.State || "",
        stateId: "0",
        city: state?.City || "",
        pinCode: state?.PinCode || "",
        refDoctor: "SELF",
        refDoctorId: 0,
        panelId: state?.RateID || 0,
        panelName: state?.RateTypeName || "",
        comment: "",
        patientType: "",
        bookingId: "",
        appointmentDate: b.appointmentDate,
        timeSlots: b.slotList,
        departmentId: b.departmentId,
        departmentName: b.departmentName,
        machineId: String(b.machineId),
        machineName: b.machineName,
        centreId: b.centreId,
        investigations: [
          {
            investigationId: b.investigationId,
            investigationName: b.investigationName,
            rate: b.rate,
          },
        ],
        totalAmount: Number(b.rate) || 0,
      };

      try {
        const res = await saveMacRadiologyAppointment(payload);
        if (!res?.data?.success) {
          toast.error(
            `Could not book radiology slot for "${b.investigationName}": ${res?.data?.message || "it may no longer be available"}. Please pick a different slot and try again.`,
          );
          return null;
        }
        const savedAppointmentId = Array.isArray(res?.data?.appointmentId)
          ? res.data.appointmentId[0]?.appointmentId
          : res?.data?.appointmentId;
        const idx = updated.findIndex((r) => r.InvestigationID === row.InvestigationID);
        if (idx !== -1) {
          updated[idx] = { ...updated[idx], RadiologyAppointmentId: savedAppointmentId };
        }

        // We're editing an already-registered patient, so the ledger
        // transaction already exists - link it onto the appointment right
        // away instead of leaving LedgerTransactionID null forever. Without
        // this, GetMacRadiologyAppointment's IsRegistered check (keyed off
        // LedgerTransactionID) always reads false and the row shows
        // "Booked (not registered)" even though it belongs to a real
        // registration, AND getDataEditByLabNoInfo's RadiologyAppointmentId
        // lookup (which joins on ard.LedgerTransactionID = plo.LedgerTransactionID)
        // can never match a NULL, so removing this test later would silently
        // skip cancelMacRadiologyAppointment above and orphan the slot.
        const ledgerTransactionId = LTData?.LedgerTransactionID || LTData?.LedgertransactionID;
        if (savedAppointmentId && ledgerTransactionId) {
          linkAppointmentRegistration({
            appointmentId: savedAppointmentId,
            ledgerTransactionID: ledgerTransactionId,
          }).catch(() => {/* booking already succeeded - registration link is best-effort */ });
        }
      } catch (err) {
        toast.error(
          err?.response?.data?.message ||
            `Could not book radiology slot for "${b.investigationName}".`,
        );
        return null;
      }
    }

    setTableData(updated);
    return updated;
  };

  const getSuggestion = () => {

    if (searchForm.CentreID || LTData?.CentreID) {
      if (searchForm.TestName.length >= 3) {
        axiosInstance
          .post("TestData/BindBillingTestData", {
            TestName: searchForm.TestName,
            CentreID: LTData?.RateTypeId,
            SearchBy: searchTest,
          })
          .then((res) => {
            setSuggestion(res?.data?.message);
          })
          .catch((err) => {
            toast.error(err?.response?.data?.message);
          });
      } else {
        setSuggestion([]);
      }
    } else {
      if (searchForm.TestName !== "") {
        toast.error("please Select Centre");
      }
    }
  };

  const setBarcodeLogics = (table) => {
    if (BarcodeLogic == 4) {
      const arraySample = table.map((item) => {
        const matchingItem = PLO.flatMap(
          (data) => data.InvestigationSampleType,
        ).find((istItem) => istItem?.sampleId === item?.sampleId);
        if (matchingItem) {
          item.barcodeNo = matchingItem.barcodeNo;
          item.barcodefill = matchingItem.barcodeNo && true;
          item.setBarcode = matchingItem.setBarcode;
        }
        return item;
      });
      return PLO?.length == 0 ? table : arraySample;
    }
    if (BarcodeLogic == 3) {
      let commonBarcode = "";
      for (const ploItem of PLO) {
        const found = ploItem?.InvestigationSampleType?.find(
          (item) => item?.sampleId !== "0" && item?.barcodeNo,
        );
        if (found?.barcodeNo) {
          commonBarcode = found.barcodeNo;
          break; // Exit loop once found
        }
      }
      const finalDatas = table?.map((ele) => {
        const matchingTestId = PLO.flatMap(
          (data) => data.InvestigationSampleType,
        ).find((invItem) => invItem?.testID === ele?.testID);
        return {
          ...ele,
          barcodeNo: ele?.sampleId !== "0" ? commonBarcode : "",
          barcodefill: ele?.sampleId !== "0" && commonBarcode ? true : false,
          setBarcode: matchingTestId
            ? matchingTestId.setBarcode
            : ele.setBarcode,
        };
      });
      return PLO?.length == 0 ? table : finalDatas;
    }
  };
  const getTableData = (data) => {
    const ItemIndex = tableData.findIndex(
      (e) => e.InvestigationID === data.InvestigationID,
    );
    const centreMRP = CentreData.find((c) => {
      return c.value === LTData?.CentreID;
    })?.SetMRP;
    console.log({ centreMRP });
    if (ItemIndex === -1) {
      axiosInstance
        .post("TestData/BindSingleTestData", {
          CopaymentRatetype: Number(state?.RateID) || 0,
          InvestigationID: data.InvestigationID,
          CentreID: data?.CentreID,
          IsPromotional: 0,
          PromotionalID: 0,
          SetMRP: PLO.length > 0 ? PLO[0].IsMrpset : centreMRP,
          isVetCanine: state?.isVetCanine ?? 0,
          ReferenceRate: data?.ReferenceRate ?? suggestion[0]?.ReferenceRate ?? 0,
          ActualRateTypeID: state?.RateID ?? 0,
          Centretype: Centretype ?? "0",

        })
        .then((res) => {
          const testData = res?.data?.message?.[0];
          if (Number(testData?.IsAllowTest) === 0) {
            toast.error("Selected test is not in contract");
            return;
          }
          const { genderCheck, ageCheck, message } = CheckageTest(
            res?.data?.message[0]?.Gender,
            res?.data?.message[0]?.ToAge,
            res?.data?.message[0]?.FromAge,
          );
          if (!genderCheck || !ageCheck) {
            // Previously fell through silently here with no feedback at all -
            // API call succeeds, nothing visible happens, nothing in the
            // console. `message` was already computed by CheckageTest but
            // never surfaced.
            toast.error(message || "Selected test is not applicable for this patient");
            return;
          }
          if (res?.data?.message[0]?.Radiology == 1) {
            // Every radiology booking - even one replacing a just-removed
            // test - has to go through this modal: the current MacRadiology
            // system requires a live SaveMacRadiologyAppointment call to
            // actually reserve a slot (see bookPendingRadiologySlots above),
            // there's no local "hold" left to silently reuse. This matches
            // PatientRegistration.jsx, which never does that either.
            setSlotOpen({
              data: res?.data?.message[0],
              show: true,
            });
          } else
            setTableData([
              ...tableData,
              {
                ...res?.data?.message[0],
                isDisable: false,
                Discount: 0,
                Rate: Number(res?.data?.message[0].Rate).toFixed(2),
                NetAmount: Number(res?.data?.message[0].Rate).toFixed(2),
                IsSampleCollected: "N",
                Status: 1,
                IsUrgent: 0,
                UrgentDateTime: "",
                BarcodeNo: getBarcode(res?.data?.message[0]?.SampleTypeID),
                IsCulture: res?.data?.message[0]?.IsCulture,
                isPrimary: true,
                TestIdHash: "",
                DeliveryDate: res?.data?.message[0]?.deliveryDate,
                isLabOutSource: res?.data?.message[0]?.isOutSource,
                DepartmentName: res?.data?.message[0]?.DepartmentName,
                departmentPrintOrder: res?.data?.message[0]?.InvestigationSampleType[0].departmentPrintOrder,
                investigationPrintOrder: res?.data?.message[0]?.InvestigationSampleType[0].investigationPrintOrder,
                InvestigationSampleType: setBarcodeLogics(
                  res?.data?.message[0]?.InvestigationSampleType?.map(
                    (item) => ({
                      ...item,
                      barcodefill: false,
                    }),
                  ),
                ),
              },
            ]);
        })
        .catch((err) => console.log(err));
    } else {
      toast.error("Duplicate Text Found");
    }
  };

  const handlePLOChange = (e, index) => {
    const { name, checked } = e.target;
    if (index >= 0) {
      const data = [...tableData];
      if (name === "Status") {
        data[index][name] = checked ? 2 : 1;
        data[index]["IsSampleCollected"] = checked ? "S" : "N";
        if ([3, 4].includes(BarcodeLogic)) {
          if (checked) {
            setShow5({ modal: true, index: index });
          } else {
            setShow5({ modal: false, index: index });
          }
        }
      } else {
        data[index][name] = checked ? 1 : 0;
        if (!checked) {
          data[index]["UrgentDateTime"] = "";
        }
      }
      setTableData(data);
    } else {
      const val = tableData.map((ele) => {
        return {
          ...ele,
          Status: checked ? 2 : 1,
          IsSampleCollected: checked ? "S" : "N",
        };
      });
      setTableData(val);
    }
  };

  const CheckageTest = (gender, ToAge, FromAge) => {
    let genderCheck = false;
    let ageCheck = true;
    let message = "";
    genderCheck = [state?.Gender, "Both"].includes(gender) ? true : false;

    if (state?.TotalAgeInDays > ToAge) {
      ageCheck = false;
      message = "Your age is greater than this test maximum age";
    }

    if (state?.TotalAgeInDays < FromAge) {
      ageCheck = false;
      message = "Your age is Less than this test Minimum age";
    }

    return {
      genderCheck: genderCheck,
      ageCheck: ageCheck,
      message: message,
    };
  };

  const handleUrgent = (value, index) => {
    const data = [...tableData];
    data[index]["UrgentDateTime"] = value;
    setTableData(data);
  };

  const handleDiscount = (value, index) => {
    if (disAmt === "" && discountPercentage === "") {
      const discountCheck = validateRowDiscount(value, tableData[index]?.Rate);
      if (!discountCheck.isValid) {
        toast.error(discountCheck.message);
        return;
      }
      const data = [...tableData];
      const numericDiscount = value === "" ? 0 : Number(value);
      data[index]["Discount"] = value;
      data[index]["NetAmount"] =
        (Number(data[index]["Rate"]) - numericDiscount) *
        (Number(data[index]["Quantity"]) || 1);
      setTableData(data);
    } else {
      toast.error("Discount already given");
    }
  };

  useEffect(() => {
    let total = tableData.reduce(
      (acc, item) => acc + Number(item.Rate) * (Number(item.Quantity) || 1),
      0,
    );
    let NetTotal = tableData.reduce(
      (acc, item) => acc + Number(item.NetAmount) || acc + Number(item.Rate) * (Number(item.Quantity) || 1),
      0,
    );

    setLTData({
      ...LTData,
      GrossAmount: total,
      NetAmount: NetTotal,
      DiscountOnTotal: total > 0 && NetTotal > 0 ? total - NetTotal : "",
      // SrfId: checkCovid() ? LTData?.SrfId : "",
      // SrfId: LTData?.SrfId,
      IcmrId: checkCovid() ? LTData?.IcmrId : "",
    });
  }, [tableData]);

  const fetchFields = (visitType) => {
    console.log("visit", visitType);
    axiosInstance
      .post("ManageFieldMaster/getAllManageFieldMasterData", {
        VisitTypeID: Number(visitType),
      })
      .then((res) => {
        let data = res?.data?.message;
        data.map((ele) => {
          return {
            ...ele,
            isError: false,
            message: "",
          };
        });

        setVisibleFields(res?.data?.message);
      })
      .catch((err) => {
        toast.error(
          err?.response?.data?.message
            ? err?.response?.data?.message
            : "Error Occured",
        );
      });
  };

  useEffect(() => {
    getSuggestion();
  }, [searchForm.TestName]);

  const getDropDownData = (name) => {
    const match = ["Title", "Gender", "BankName", "HLMPatientType", "Source"];
    axiosInstance
      .post("Global/getGlobalData", { Type: name })
      .then((res) => {
        let data = res.data.message;
        let value = data.map((ele) => {
          return {
            value: match.includes(name) ? ele.FieldDisplay : ele.FieldID,
            label: ele.FieldDisplay,
          };
        });

        switch (name) {
          case "Gender":
            setGender(value);
            break;
          case "Title":
            setTitle(value);
            break;

          case "PaymentMode":
            setPaymentMode(value);
            break;
          case "HLMPatientType":
            setHLMPatientType(value);
            break;
          case "BankName":
            setBankName(value);
            break;
          case "Source":
            setSourceType(value);
            break;
          default:
            break;
        }
      })
      .catch((err) => console.log(err));
  };

  //Modal show

  const handleClose = () =>
    setShow({
      Type: "",
      show: false,
    });
  const handleShow = (Type) =>
    setShow({
      Type: Type,
      show: true,
    });
  const handleFilter = async (data) => {
    const investigationId = data?.InvestigationID;
    if (
      investigationId != null &&
      removeInFlightRef.current.has(investigationId)
    ) {
      return;
    }
    if (investigationId != null) {
      removeInFlightRef.current.add(investigationId);
    }

    try {
      // InvestigationID
      if (
        !arrOfRightDeleteAddTest?.includes(data?.Status)
      ) {
        // A row with a real RadiologyAppointmentId (loaded from the DB, or
        // booked earlier via bookPendingRadiologySlots) has an actual
        // appointment_radiology_details row reserved for it - removing the
        // test here has to free that slot too, or it stays "booked" forever
        // even though the test itself is gone. Cancel it before removing the
        // row locally so a failure surfaces here instead of silently leaving
        // an orphaned appointment.
        if (
          (data?.Radiology == 1 || data?.IsRadiology == 1) &&
          data?.RadiologyAppointmentId
        ) {
          try {
            const res = await cancelMacRadiologyAppointment({
              appointmentId: data.RadiologyAppointmentId,
              cancelReason: "Test removed during registration edit",
              remarks: "",
            });
            if (!res?.data?.success) {
              toast.error(
                `Could not free the radiology slot for "${data?.TestName || data?.ItemName || "this test"}": ${res?.data?.message || "please cancel it manually in Radiology Appointment."}`,
              );
            }
          } catch (err) {
            toast.error(
              err?.response?.data?.message ||
                `Could not free the radiology slot for "${data?.TestName || data?.ItemName || "this test"}" - please cancel it manually in Radiology Appointment.`,
            );
          }
        }

        const value = tableData.filter(
          (ele) => ele.InvestigationID !== data.InvestigationID,
        );
        setTableData(value);
        // EPD-047 / EPD-BUG-003: removal is only local until Submit persists it —
        // do not toast success the server has not done (matches PatientRegistration).
        // EPD-048: one click → at most one message (none until Submit).
      } else {
        toast.error("Already Received");
      }
    } finally {
      if (investigationId != null) {
        removeInFlightRef.current.delete(investigationId);
      }
    }
  };

  useEffect(() => {
    // let data = tableData.map((ele) => {
    //   const uniqueSampleTypes = [];
    //   const barcodeValue = ele?.InvestigationSampleType?.filter((item) => {
    //     const alreadyExists = uniqueSampleTypes.includes(item?.sampleId);
    //     if (!alreadyExists) {
    //       uniqueSampleTypes.push(item?.sampleId);
    //       return true;
    //     }
    //     return false;
    //   }).map(({ sampleId, barcodeNo }) => {
    //       return `${sampleId}#${barcodeNo}`;
    //   }).join("~");
    //   return {
    //     isDisable: ele?.isDisable,
    //     isLabOutSource: ele?.isLabOutSource,
    //     SetMRP: ele?.SetMRP,
    //     IsMrpset: ele?.IsMrpset,
    //     OldStartEndTimeSlot: ele?.OldStartEndTimeSlot ?? "",
    //     OldBookingDate: ele?.OldBookingDate ?? "",
    //     OldModalityID: ele?.OldModalityID ?? "",
    //     UpdateModalityId: ele?.UpdateModalityId,
    //     OldUpdateModalityId: ele?.OldUpdateModalityId,
    //     InvestigationDate: ele?.InvestigationDate
    //       ? moment(ele?.InvestigationDate).format("YYYY-MM-DD")
    //       : "",
    //     ModalityId: ele?.ModalityId ? ele?.ModalityId : 0,
    //     ShiftName: ele?.ShiftName ? ele?.ShiftName : "",
    //     EndTime: ele?.EndTime ? ele?.EndTime : "",
    //     StartTime: ele?.StartTime ? ele?.StartTime : "",
    //     StartEndTimeSlot: ele?.StartEndTimeSlot ? ele?.StartEndTimeSlot : "",
    //     IsRadiology: ele?.Radiology,
    //     IsSampleCollected: ele?.IsSampleCollected,
    //     IsSampleRequired: ele?.IsSampleRequired,
    //     Status: ele?.Status,
    //     IsUrgent: ele?.IsUrgent,
    //     sampleTypeID: ele?.SampleTypeID,
    //     SampleTypeName: ele?.SampleName || ele?.SampleTypeName,
    //     ItemId: ele?.InvestigationID,
    //     ItemName: ele?.TestName,
    //     InvestigationID: ele?.InvestigationID,
    //     InvestigationName: ele?.TestName,
    //     ReportType: ele?.ReportType,
    //     IsPackage: ele?.DataType === "Package" ? 1 : 0,
    //     Rate: ele?.Rate,
    //     Amount: ele?.NetAmount,
    //     Quantity: 1,
    //     PCCDiscAmt: 0,
    //     PCCDiscPer: 0,
    //     RateTypeId: state?.RateID,
    //     DiscountAmt: ele?.Discount,
    //     DiscountApprovedBy: LTData?.DiscountApprovedBy,
    //     DiscountReason: LTData?.DiscountReason,
    //     IsReporting: ele?.IsReporting?.toString(),
    //     ageInDays: state?.TotalAgeInDays,
    //     Gender: state?.Gender,
    //     CentreID: state?.CentreID,
    //     SampleBySelf: "1",
    //     sampleCollectionBy: 0,
    //     DeliveryDate: ele?.DeliveryDate,
    //     BarcodeNo: ele?.isDisable ? "~" : !barcodeValue?.includes('~') ? `${barcodeValue}~` : barcodeValue,
    //     UrgentDateTime: ele?.UrgentDateTime,
    //     DepartmentID: ele?.DepartmentID,
    //     DepartmentName: ele?.DepartmentName ?? "",
    //     isHistoryReq: 0,
    //     PackageCode: "",
    //     PackageName: "",
    //     TestCode: ele?.TestCode,
    //     TestIdHash: ele?.TestIdHash,
    //     IsCulture: ele?.IsCulture,
    //     IsCovid: ele?.IsCovid,
    //     UrgentdeleiveryDate: ele?.UrgentdeleiveryDate,

    //     InvestigationSampleType: ele?.InvestigationSampleType,
    //   };
    // });
    let data = tableData.map((ele) => {
      const seenSamples = new Set();

      const barcodeValue = ele?.InvestigationSampleType
        ?.filter((item) => {
          if (!item?.sampleId || item?.sampleId === "0") return false;
          if (seenSamples.has(item?.sampleId)) return false;
          seenSamples.add(item?.sampleId);
          return true;
        })
        .map(({ sampleId, barcodeNo }) => {
          return barcodeNo ? `${sampleId}#${barcodeNo}` : `${sampleId}#`;
        })
        .join("~");
      return {
        ...ele,
        isDisable: ele?.isDisable,
        isLabOutSource: ele?.isLabOutSource,
        SetMRP: ele?.SetMRP,
        IsMrpset: ele?.IsMrpset,
        OldStartEndTimeSlot: ele?.OldStartEndTimeSlot ?? "",
        OldBookingDate: ele?.OldBookingDate ?? "",
        OldModalityID: ele?.OldModalityID ?? "",
        UpdateModalityId: ele?.UpdateModalityId,
        OldUpdateModalityId: ele?.OldUpdateModalityId,
        InvestigationDate: ele?.InvestigationDate
          ? moment(ele?.InvestigationDate).format("YYYY-MM-DD")
          : "",
        ModalityId: ele?.ModalityId ? ele?.ModalityId : 0,
        ShiftName: ele?.ShiftName ? ele?.ShiftName : "",
        EndTime: ele?.EndTime ? ele?.EndTime : "",
        StartTime: ele?.StartTime ? ele?.StartTime : "",
        StartEndTimeSlot: ele?.StartEndTimeSlot ? ele?.StartEndTimeSlot : "",
        IsRadiology: ele?.Radiology,
        IsSampleCollected: ele?.IsSampleCollected,
        IsSampleRequired: ele?.IsSampleRequired,
        Status: ele?.Status,
        IsUrgent: ele?.IsUrgent,
        sampleTypeID: ele?.SampleTypeID,
        SampleTypeName: ele?.SampleName || ele?.SampleTypeName,
        ItemId: ele?.InvestigationID,
        ItemName: ele?.TestName,
        InvestigationID: ele?.InvestigationID,
        InvestigationName: ele?.TestName,
        ReportType: ele?.ReportType,
        IsPackage: ele?.DataType === "Package" ? 1 : 0,
        Rate: ele?.Rate,
        Amount: ele?.NetAmount,
        Quantity: Number(ele?.Quantity) || 1,
        PCCDiscAmt: 0,
        PCCDiscPer: 0,
        RateTypeId: state?.RateID,
        // Discount is per unit in the table; PLO.DiscountAmt is the line total.
        DiscountAmt: (Number(ele?.Discount) || 0) * (Number(ele?.Quantity) || 1),
        DiscountApprovedBy: LTData?.DiscountApprovedBy,
        DiscountReason: LTData?.DiscountReason,
        IsReporting: ele?.IsReporting?.toString(),
        ageInDays: state?.TotalAgeInDays,
        Gender: state?.Gender,
        CentreID: state?.CentreID,
        SampleBySelf: "1",
        sampleCollectionBy: 0,
        DeliveryDate: ele?.DeliveryDate,
        UrgentDateTime: ele?.UrgentDateTime,
        DepartmentID: ele?.DepartmentID,
        DepartmentName: ele?.DepartmentName ?? "",
        isHistoryReq: 0,
        PackageCode: "",
        PackageName: "",
        TestCode: ele?.TestCode,
        TestIdHash: ele?.TestIdHash,
        IsCulture: ele?.IsCulture,
        IsCovid: ele?.IsCovid,
        UrgentdeleiveryDate: ele?.UrgentdeleiveryDate,
        BarcodeNo: barcodeValue,
        Allowquantity: ele?.Allowquantity,
      };
    });

    setPLO(data);
  }, [tableData]);

  const getReceipt = (id) => {
    axiosReport
      .post(
        "getReceipt",
        { LedgerTransactionIDHash: id },
        { responseType: "blob" },
      )
      .then((res) => {
        const blob = new Blob([res.data], { type: "application/pdf" });
        const url = window.URL.createObjectURL(blob);
        window.open(url, "_blank");
      })
      .catch((err) => {
        toast.error(
          err?.data?.response?.message
            ? err?.data?.response?.message
            : "Error Occured",
        );
      });
  };

  useEffect(() => {
    getAccessCentres(setCentreData);
    getCollectionBoy(setCollectionBoy);
    getDropDownData("Gender");
    getDropDownData("Title");
    getDropDownData("PaymentMode");
    getDropDownData("BankName");
    GetGlobalData(setVisitType, "VisitType");
    getBindDiscApproval(setBindDiscApproval);
    getBindDiscReason(setBindDiscReason);
    getBindReportDeliveryMethod(setBindReportDeliveryMethod);
    getPaymentModes("Source", setPatientSource);
    getPaymentModes("PatientType", setPatientType);
    getRequiredAttachment();
  }, []);

  const handleSelectNew = (event) => {
    const { name, value } = event.target;
    setLTData({ ...LTData, [name]: value });
  };

  useEffect(() => {
    let totaldiscount = (LTData.GrossAmount * discountPercentage) / 100;
    let disamount = LTData.GrossAmount - totaldiscount;
    let DiscountAmt = totaldiscount / tableData.length;

    setLTData({
      ...LTData,
      NetAmount: disamount,
      DiscountOnTotal: totaldiscount,
    });
    const data = PLO.map((ele) => {
      return {
        ...ele,
        Amount: ele.Rate - DiscountAmt,
        DiscountAmt: DiscountAmt,
      };
    });
    setPLO(data);
  }, [discountPercentage]);

  useEffect(() => {
    setLTData({ ...LTData, NetAmount: LTData.GrossAmount - disAmt });
  }, [disAmt]);

  const Match = () => {
    let match = false;
    for (var i = 0; i < tableData.length; i++) {
      if (tableData[i].Discount !== "") {
        match = true;
        break;
      }
    }
    return match;
  };

  const handlePaymentChange = (event) => {
    let match = false;
    for (var i = 0; i < RcData.length; i++) {
      if (RcData[i].PaymentMode === event.label) {
        match = true;
        break;
      }
    }
    if (!match) {
      setRcData([
        ...RcData,
        {
          PayBy: "Patient",
          ReceiptNo: "",
          ledgerNoCr: "",
          RateTypeId: state?.RateID,
          PaymentMode: event.label,
          PaymentModeID: event.value,
          CardNo: "",
          CardDate: "",
          BankName: "",
          Amount: "",
          CentreID: state?.CentreID,
        },
      ]);
    } else {
      toast.error("Payment Mode is Already Added");
    }
  };

  const handleFilterPayment = (index) => {
    if (RcData.length > 1) {
      const data = RcData.filter((ele, i) => index !== i);
      setRcData(data);
      toast?.success("Removed Successfully");
    }
  };
  const calculate = (value, index) => {
    let data = [...RcData];
    data[index]["Amount"] = value;
    const sum = data.reduce((a, item) => Number(item.Amount) + a, 0);
    setPaid(sum);
    return sum;
  };

  useEffect(() => {
    getDoctorSuggestion(formData, setDoctorSuggestion, setFormData);
  }, [formData?.DoctorName]);
  useEffect(() => {
    getDoctorSuggestion(
      { ...formData, DoctorName: formData?.SecondReferDoctor },
      setSecondDoctorSuggestion,
      setFormData,
    );
  }, [formData?.SecondReferDoctor]);


  useEffect(() => {
    if (RcData.length >= 1) {
      const sum = RcData.reduce((a, item) => Number(item.Amount) + a, 0);
      setPaid(sum);
    }
  }, [RcData]);

  const handleClose2 = () => {
    setShow2(false);
  };

  const handleClose3 = () => {
    setShow3(!show3);
  };

  const getDataByMobileNo = () => {
    if (state?.Mobile.length === (DefaultCurrencyName === "KES"
      ? state?.Mobile?.length >= 9
      : state?.Mobile?.length >= 10)) {
      axiosInstance
        .post("Booking/getDataByMobileNo", {
          Mobile: state?.Mobile,
        })
        .then((res) => {
          setMobileData(res.data.message);
          setShow4(true);
        })
        .catch((err) => console.log(err));
    }
  };

  const handlePatientData = (e) => {
    const keypress = [9, 13];
    if (keypress.includes(e.which)) {
      e.preventDefault();
      getDataByMobileNo();
    }
  };

  const handleClose4 = () => {
    setShow4(false);
  };

  const getRequiredAttachment = () => {
    axiosInstance
      .post("Global/GetGlobalData", {
        Type: "Identity",
      })
      .then((res) => {
        let data = res.data.message;
        let RequiredAttachment = data.map((ele) => {
          return {
            value: ele.FieldDisplay,
            label: ele.FieldDisplay,
          };
        });
        return setIdentity(RequiredAttachment);
      })
      .catch((err) => console.log(err));
  };

  const handleSelctData = (data) => {
    const centreName = CentreData?.find((ele) => ele.value === data.CentreID);
    setState({
      ...state,
      Title: data.Title,
      FirstName: data.FirstName,
      LastName: data?.LastName,
      MiddleName: data?.MiddleName,
      CentreID: data?.CentreID,
      RateID: data?.RateTypeId,
      Gender: data?.Gender,
      DOB: new Date(data?.DOB),
      Age: data?.Age,
      PatientCode: data?.PatientCode,
      Email: data?.Email,
      PinCode: data?.Pincode,
      AgeDays: data?.AgeDays,
      AgeMonth: data?.AgeMonth,
      AgeYear: data?.AgeYear,
      HouseNo: data?.HouseNo,
      City: data?.City,
      State: data?.State,
      Country: data?.Country,
      StreetName: data?.StreetName,
      IsMask: data?.IsMask,
      isVIP: data?.IsVIP,
      Locality: data?.Locality,
      IcmrId: data?.IcmrId,
      // SrfId: data?.SrfId,
    });

    setLTData({
      ...LTData,
      CentreName: centreName.label,
      CentreID: centreName.value,
    });
    handleClose4();
    setMobileData([]);
  };

  const DynamicFieldValidations = () => {
    const data = visibleFields.map((ele) => {
      if (
        ele["IsMandatory"] == 1 &&
        ele["IsVisible"] == 1 &&
        LTData[ele["FieldType"]] === ""
      ) {
        return {
          ...ele,
          isError: true,
          message: `${ele["FieldType"]} is Required Field`,
        };
      } else {
        return {
          ...ele,
          isError: false,
          message: "",
        };
      }
    });
    return data;
  };

  console.log("getTrimmedData(PLO)", getTrimmedData(PLO));

  const valiateProofID = () => {
    return validateIdentityProof(
      LTData?.PatientIDProof,
      LTData?.PatientIDProofNo,
    ).isValid;
  };

  const getValidDateTime = (dateStr) => {
    if (
      !dateStr ||
      dateStr === "0000-00-00 00:00:00" ||
      dateStr === "0000-00-00T00:00:00Z" ||
      isNaN(new Date(dateStr).getTime())
    ) {
      return null;
    }
    // normalize to ISO format
    return new Date(dateStr.replace(" ", "T")).toISOString();
  };

  const { errors, handleBlur, touched, handleSubmit } = useFormik({
    initialValues: { ...state, ...LTData, ...formData, ...Pndt },
    enableReinitialize: true,
    // validationSchema: PatientRegisterSchema,
    onSubmit: async (values) => {
      if (!validateMandatoryFields()) return;
      console.log("handleSubmit", LTData);

      const data = DynamicFieldValidations();
      setVisibleFields(data);
      const flag = data.filter((ele) => ele?.isError === true);
      const match = Match();
      // if (BarcodeLogic === 3 || BarcodeLogic === 4) {
      //   const MissingBarcode = tableData.some((ele) => {
      //     return (
      //       !ele?.isDisable && ele?.IsSampleCollected === "S" &&
      //       ele?.InvestigationSampleType?.some((item) => item?.sampleId !== "0" && !item?.barcodeNo));
      //   });
      //   if (MissingBarcode) {
      //     toast.error("Barcode is required");
      //     // setIsSubmit({ type: "Success", isLoading: false });
      //     return;
      //   }
      // }
      console.log("tableData:::", tableData)
      const collectedSamples = tableData?.filter(
        (ele) => ele?.IsSampleCollected === "Y",
      );
      const hasAnyChecked = collectedSamples?.every((ele) =>
        ele?.InvestigationSampleType?.some((item) => item?.setBarcode === 1),
      );
      console.log({ hasAnyChecked: hasAnyChecked });
      if (!hasAnyChecked) {
        const missingBarcodeTests = collectedSamples?.filter((ele) =>
          ele?.InvestigationSampleType?.some(
            (item) =>
              item?.sampleId !== "0" &&
              item?.setBarcode !== 1 &&
              !item?.barcodeNo,
          ),
        );
        console.log('missingBarcodeTests', { missingBarcodeTests });
        const TestNames = missingBarcodeTests?.map((ele) => ele?.TestName);
        const isMissingBarcode = missingBarcodeTests?.length > 0;
        if (isMissingBarcode) {
          toast.error(`Barcode is required for ${TestNames.join(", ")}`);
          return;
        }
      }

      //  sampleCollectionDate: `${LTData?.SampleCollectionDate?.split(" ")?.join("T")}Z`,
      // SampleCollectionDate: new Date(LTData?.SampleCollectionDate).toISOString(),
      // const paymentCheck = PaymentData();
      const { DocumentFlag, message } = handleFileValidationUpload();

      // Book any radiology slots that were only picked locally in
      // SlotBookModal (see bookPendingRadiologySlots' own comment above) now
      // that the edit is actually being submitted. Abort if any of them can
      // no longer be booked - bookPendingRadiologySlots() has already shown
      // the reason via toast. onSubmit is `async` (see useFormik call above)
      // specifically so this await is safe to use directly here.
      const bookedTableData = await bookPendingRadiologySlots();
      if (!bookedTableData) return;

      // PLO's own state won't reflect bookedTableData within this same call
      // (setPLO() from the [tableData] effect is async) - merge the
      // just-booked RadiologyAppointmentId in directly by InvestigationID so
      // it actually makes it into this save.
      const fixedPLO = PLO.map(item => {
        const bookedRow = bookedTableData.find(
          (r) => r.InvestigationID === item.InvestigationID,
        );
        return {
          ...item,
          PCCDiscAmt: item.PCCDiscAmt === "" || item.PCCDiscAmt == null ? 0 : Number(item.PCCDiscAmt),
          PCCDiscPer: item.PCCDiscPer === "" || item.PCCDiscPer == null ? 0 : Number(item.PCCDiscPer),
          RadiologyAppointmentId: bookedRow?.RadiologyAppointmentId ?? item.RadiologyAppointmentId ?? 0,
        };
      });

      if (flag.length === 0) {
        if (PLO.length > 0) {
          if (valiateProofID()) {
            if (disAmt || discountPercentage || match) {
              setIsSubmit(true);
              try {
                axiosInstance
                  .post("PatientRegistration/RegistrationEditData", {
                    PatientData: getTrimmedData({
                      ...state,
                      PageName: "",
                      BarcodeNo: "",
                      ProEmployee: "",
                      RateTypeEmail: "",
                      RateTypePhone: "",
                      ClientAddress: "",
                      MobileVip: "",
                      FirstNameVip: "",
                      MiddleNameVip: "",
                      LastNameVip: "",
                      MembershipCardID: 0,
                      FamilyMemberIsPrimary: 0,
                      SecondReferName: "",
                      SecondReferDoctor: "",
                      PatientID: state?.PatientID?.toString(),
                      ExpectedDtUpdate:
                        state?.PatientDtUpdate ||
                        patientEditBaselineRef.current?.PatientDtUpdate ||
                        "",
                    }),
                    PatientEditBaseline: patientEditBaselineRef.current,
                    LTData: getTrimmedData({
                      ...LTData,
                      ...Pndt,
                      Pregnancy:
                        Pndt?.Pregnancy == "0001-01-01"
                          ? "0001-01-01"
                          : moment(Pndt?.Pregnancy).format("YYYY-MM-DD"),
                      mobile: state?.Mobile,
                      email: state?.Email,
                      SampleCollectionDate: getValidDateTime(LTData?.SampleCollectionDate),

                      barcodeLogicID: 0,
                      DiscountApprovedBy: "",
                      ReferRate: "",
                      CentreName: LTData?.CentreName || "",
                      DiscountType: "",
                      // SecondReferDoctor: "",
                      //  SecondReferDoctor: LTData?.SecondReferDoctor || "",
                      // SecondReferDoctor: LTData?.SecondReferDoctorID || 0,
                      SecondReferDoctor: LTData?.SecondReferDoctor || state?.SecondReferDoctor || 0,
                      //  SecondReferDoctorID: LTData?.SecondReferDoctorID || 0,
                      DoctorMobile: "",
                      DoctorEmail: "",
                      LedgerTransactionID:
                        LTData?.LedgerTransactionID?.toString(),
                      LedgertransactionID:
                        LTData?.LedgertransactionID?.toString(),
                      Source: "",
                      RegistrationDate: new Date(),
                      SrfId: (LTData?.SrfId ?? "").toString(),
                      IcmrId: "",
                      IsConcern: 0,
                      HideAmount: "",
                      DiscountId: "",
                      BTB: "0",
                      OrderId: "",
                      CoupanCode: LTData?.CoupanCode || "",
                      CoupanId: LTData?.CoupanId || "0",
                      IsCoupon: LTData?.IsCoupon || 0,
                      MembershipID: LTData?.MembershipID || 0,
                      MembershipCardNo: LTData?.MembershipCardNo || "",
                      PolicyID: LTData?.PolicyID || 0,
                      PNameVip: "",
                      IsCourier: "",
                      IsWhatsappRequired: "",
                      IsPndtForm: "",
                      ReferLabId: "",
                      CollectionBoyId: LTData?.CollectionBoyId?.toString(),
                      IsPndt: Pndt?.PNDT ? 1 : 0,
                      HLMOPDIPDNo: LTData?.OPDIPD,
                      hmis_request_type: state?.hmis_request_type ?? "",
                      hmis_patCrNo: state?.hmis_patCrNo ?? "",
                      hmis_hospital_code: state?.hmis_hospital_code ?? "",
                      poct_facility_id: state?.poct_facility_id ?? "",
                      hmis_episode_code: state?.hmis_episode_code ?? "",
                      hmis_episode_visitno: state?.hmis_episode_visitno ?? "",
                      Category: LTData?.Category?.toString(),
                      businessUnitID: Number(LTData?.CentreID || ""),
                      invoiceTo: Number(LTData?.RateTypeId || ""),
                      collectionBoyName:
                        LTData?.collectionBoyName?.toString() || "",
                      Centretype: Centretype || "",
                    }),
                    PLO: fixedPLO.map((ploItem) => {
                      const { BarcodeNo, ...rest } = ploItem;
                      return ({
                        ...getTrimmedData(rest),
                        paybypanel: String(ploItem?.paybypanel) || "0",
                        paybypatient: String(ploItem?.paybypatient) || "0",
                        SampleBySelf: String(ploItem?.SampleBySelf),
                        IsReporting: String(ploItem?.IsReporting),
                        barcodeNo: BarcodeNo || ploItem.barcodeNo || "",
                        IsCredit: LTData?.IsCredit,
                        DiscountApprovedBy: "",
                        businessUnitID: Number(ploItem?.CentreID || ""),
                        invoiceTo: Number(ploItem?.RateTypeId || ""),

                        ReportType: ploItem?.ReportType?.toString(),
                        Amount: ploItem?.Amount?.toString(),
                        DiscountAmt: ploItem?.DiscountAmt?.toString(),
                        Rate: ploItem?.Rate?.toString(),
                        SessionCentreID: "",
                        TestCentreID: ploItem?.TestCentreID
                          ? Number(ploItem?.TestCentreID)
                          : 0,
                        UrgentDateTime: "",
                        isLabOutSource: ploItem?.isLabOutSource
                          ? Number(ploItem?.isLabOutSource)
                          : 0,
                        IsCulture: ploItem?.IsCulture ?? 0,
                        MemberType: ploItem?.MemberType
                          ? Number(ploItem?.MemberType)
                          : 0,
                        IsConcern: "0",
                        SetMRP: ploItem?.SetMRP,
                        UpdateModalityId: ploItem?.UpdateModalityId
                          ? ploItem?.UpdateModalityId?.toString()
                          : "",

                        OldModalityID: ploItem?.OldModalityID
                          ? ploItem?.OldModalityID?.toString()
                          : "",
                        OldUpdateModalityId: ploItem?.OldUpdateModalityId
                          ? ploItem?.OldUpdateModalityId?.toString()
                          : "",
                        DATE: new Date(),

                        ModalityId: ploItem?.ModalityId?.toString(),

                        hmis_req_no: ploItem?.hmis_req_no
                          ? ploItem.hmis_req_no
                          : "",
                        hmis_req_dno: ploItem?.hmis_req_dno
                          ? ploItem.hmis_req_dno
                          : "",
                        hmis_lab_code: ploItem?.hmis_lab_code
                          ? ploItem.hmis_lab_code
                          : "",
                        hmis_test_code: ploItem?.hmis_test_code
                          ? ploItem.hmis_test_code
                          : "",
                        hmis_test_name: ploItem?.hmis_test_name
                          ? ploItem.hmis_test_name
                          : "",
                        hmis_sample_code: ploItem?.hmis_sample_code
                          ? ploItem.hmis_sample_code
                          : "",
                        hmis_sample_name: ploItem?.hmis_sample_name
                          ? ploItem.hmis_sample_name
                          : "",
                        cdac_inv_status: ploItem?.cdac_inv_status
                          ? Number(ploItem.cdac_inv_status)
                          : 0,
                        req_type: ploItem?.req_type ? ploItem.req_type : "1",
                        departmentPrintOrder: ploItem?.departmentPrintOrder ? ploItem.departmentPrintOrder : 0,
                        investigationPrintOrder: ploItem?.investigationPrintOrder ? ploItem.investigationPrintOrder : 0
                      })
                    }),
                    DocumentDetail: {
                      DocumentID: "",
                    },
                    patientMedical: {
                      PatientGuid: "",
                    },
                    PRDeliveryMethod: {
                      IsPatientSMS: "",
                      PatientMobileNo: "",
                      IsPatientEmail: "",
                      PatientEmailId: "",
                      IsDoctorSMS: "",
                      DoctorMobileNo: "",
                      IsDoctorEmail: "",
                      DoctorEmailId: "",
                      IsClientSMS: "",
                      ClientMobileNo: "",
                      IsClientEmail: "",
                      ClientEmail: "",
                      IsCourier: "",
                    },
                    RcData: RcData,
                    FieldIds: "",
                    mandatoryFields: [],
                  })
                  .then((res) => {
                    if (res?.data?.success) {
                      toast.success(res.data.message);
                      setState(stateIniti);
                      setLTData(LTDataIniti);
                      setPLO([]);
                      setRcData([
                        {
                          PayBy: "Patient",
                          ReceiptNo: "",
                          ledgerNoCr: "",
                          RateTypeId: state?.RateID,
                          PaymentMode: "Cash",
                          PaymentModeID: 134,
                          BankName: "",
                          CardDate: "",
                          CardNo: "",
                          Amount: "",
                          CentreID: state?.CentreID,
                        },
                      ]);
                      setFormData({
                        DoctorName: "",
                      });
                      setPndt({
                        ...Pndt,
                        PNDT: false,
                        NoOfChildren: "",
                        NoOfSon: "",
                        NoOfDaughter: "",
                        Pregnancy: "",
                        AgeOfSon: "",
                        AgeOfDaughter: "",
                        PNDTDoctor: "",
                        Husband: "",
                      });
                      setTableData([]);

                      if (res?.data?.data?.hideReceipt != 1)
                        getReceipt(res?.data?.data?.ledgertransactionID);

                      if (typeof onHideModal === "function") {
                        onHideModal();
                      } else {
                        navigate("/receiptreprint");
                      }
                    } else {
                      toast.error(res.data.message);
                    }
                    setIsSubmit(false);
                  })
                  .catch((err) => {
                    toast.error(
                      err?.response?.data?.message
                        ? err?.response?.data?.message
                        : "Something Went Wrong",
                    );
                    setIsSubmit(false);
                  });
              } catch (error) {
                notify('Something went wrong', 'error')
                console.log('error:::', error);
              }
            } else {
              if (DocumentFlag) {
                setIsSubmit(true);
                axiosInstance
                  .post("PatientRegistration/RegistrationEditData", {
                    PatientData: getTrimmedData({
                      ...state,
                      MembershipCardID: 0,
                      FamilyMemberIsPrimary: 0,
                      // Backend requires PatientID as a string — see the
                      // matching override in the other RegistrationEditData
                      // call above; without it ...state leaks the raw
                      // number and the API 400s on System.String conversion.
                      PatientID: state?.PatientID?.toString(),
                      ExpectedDtUpdate:
                        state?.PatientDtUpdate ||
                        patientEditBaselineRef.current?.PatientDtUpdate ||
                        "",
                    }),
                    PatientEditBaseline: patientEditBaselineRef.current,
                    LTData: getTrimmedData({
                      ...LTData,
                      LedgerTransactionIDHash: documentId,
                      trfNo: state?.TRFNo,
                      SrfId: (state?.SrfId ?? "").toString(),
                      // Backend requires ReferLabId as a string — see the
                      // matching override in the other RegistrationEditData
                      // call above; without it ...LTData leaks the raw
                      // number and the API 400s on System.String conversion.
                      ReferLabId: (LTData?.ReferLabId ?? "").toString(),
                    }),
                    PLO: PLO?.map((ploItem, _) => ({
                      ...getTrimmedData(ploItem),
                      IsCredit: LTData?.IsCredit,
                    })),
                    DocumentDetail: {
                      DocumentID: "",
                    },
                    patientMedical: {
                      PatientGuid: "",
                    },
                    PRDeliveryMethod: {
                      IsPatientSMS: "",
                      PatientMobileNo: "",
                      IsPatientEmail: "",
                      PatientEmailId: "",
                      IsDoctorSMS: "",
                      DoctorMobileNo: "",
                      IsDoctorEmail: "",
                      DoctorEmailId: "",
                      IsClientSMS: "",
                      ClientMobileNo: "",
                      IsClientEmail: "",
                      ClientEmail: "",
                      IsCourier: "",
                    },
                    RcData: RcData,
                    FieldIds: "",
                    mandatoryFields: [],
                  })
                  .then((res) => {
                    toast.success(res.data.message);
                    setState(stateIniti);
                    setLTData(LTDataIniti);
                    setPLO([]);
                    setRcData([
                      {
                        PayBy: "Patient",
                        ReceiptNo: "",
                        ledgerNoCr: "",
                        RateTypeId: state?.RateID,
                        PaymentMode: "Cash",
                        PaymentModeID: 134,
                        BankName: "",
                        CardDate: "",
                        CardNo: "",
                        Amount: "",
                        CentreID: state?.CentreID,
                      },
                    ]);
                    setTableData([]);
                    setIsSubmit(false);
                    setFormData({
                      DoctorName: "",
                    });
                    if (res?.data?.data?.hideReceipt != 1)
                      getReceipt(res?.data?.data?.ledgertransactionID);

                    if (typeof onHideModal === "function") {
                      onHideModal();
                    } else {
                      navigate("/receiptreprint");
                    }
                  })
                  .catch((err) => {
                    toast.error(
                      err?.response?.data?.message ?? "Something Went Wrong",
                    );

                    setIsSubmit(false);
                  });
              } else {
                toast.error(`${message} is Required Document`);
              }
            }
            // } else {
            //   toast.error("Please Fill All The Required Fields");
            // }
          } else {
            const identityCheck = validateIdentityProof(
              LTData?.PatientIDProof,
              LTData?.PatientIDProofNo,
            );
            revalidateIdentityProof(
              LTData?.PatientIDProof,
              LTData?.PatientIDProofNo,
            );
            toast.error(
              identityCheck.message || "Please Enter Identity No",
            );
          }
        } else {
          toast.error("Please Select Test");
        }
      }
    },
  });

  useEffect(() => {
    if (tableData.length === 0) {
      setPaid(0);
    }
  }, [tableData]);

  useEffect(() => {
    const data = PLO.map((ele) => {
      return {
        ...ele,
        DiscountReason: LTData?.DiscountReason,
        DiscountApprovedBy: LTData?.DiscountApprovedBy,
      };
    });
    setPLO(data);
  }, [LTData?.DiscountReason, LTData?.DiscountApprovedBy]);

  const checkCovid = () => {
    const isCovid = PLO?.find((ele) => ele?.IsCovid == 1);
    if (isCovid) return true;
    else return false;
  };
  const handleRequiredModal = () => {
    if (tableData.length > 0) {
      let val = "";
      for (let i = 0; i < tableData.length; i++) {
        val =
          val === ""
            ? `${tableData[i].InvestigationID}`
            : `${val},${tableData[i].InvestigationID}`;
      }

      return new Promise((resolve, reject) => {
        axiosInstance
          .post("TestData/GetFieldIds", {
            invIds: "3306,2",
            isEditPage: false,
          })
          .then((res) => {
            resolve(res?.data?.message[0]);
          })
          .catch((err) => {
            reject(err);
          });
      });
    } else {
      toast.error("please Select one Test");
    }
  };

  useEffect(() => {
    if (tableData?.length === 0) {
      setdisAmt("");
      setDiscountPercentage("");
    }
  }, [tableData]);

  const getDocumentType = (data) => {
    setUploadDoumentType(data);
  };

  useEffect(() => {
    setThroughMobileData(true);
  }, []);

  const handleChangeRTCData = (e, index) => {
    const { name, value } = e.target;
    const data = [...RcData];
    data[index][name] = value;
    setRcData(data);
  };

  const handleUploadCount = (name, value, secondName) => {
    setLTData({
      ...LTData,
      [name]: value,
      [secondName]: value === 0 ? 0 : 1,
    });
  };
  const handleCloseBarcodeModal = (data) => {
    const updatedTableData = [...tableData];
    if (BarcodeLogic == 4) {
      updatedTableData.forEach((group) => {
        group.InvestigationSampleType.forEach((sample) => {
          const matchingSample = data.find(
            (d) => d.sampleId == sample.sampleId,
          );
          if (matchingSample) {
            sample.barcodeNo = matchingSample.barcodeNo;
            sample.setBarcode = matchingSample.setBarcode;
          }
        });
      });
      setTableData(updatedTableData);
    }
    if (BarcodeLogic == 3) {
      const commonBarcode = data[0]?.barcodeNo || "";
      for (let i = 0; i < updatedTableData.length; i++) {
        updatedTableData[i].InvestigationSampleType.forEach((item) => {
          item.barcodeNo = item?.sampleId != 0 ? commonBarcode : "";
          const matchingTestId = data.find((d) => d.testID == item.testID);
          if (matchingTestId) {
            item.setBarcode = matchingTestId.setBarcode;
          }
        });
      }
      setTableData(updatedTableData);
    }
    setShow5({ modal: false, index: -1 });
  };

  console.log("Ratetype", RateType);
  console.log("selectedRateType", selectedRateType);

  return (
    <>
      {slotOpen?.show && (
        <SlotBookModal
          show={slotOpen?.show}
          slotOpen={slotOpen}
          setSlotOpen={setSlotOpen}
          handleSelectSlot={handleSelectSlot}
          LTData={LTData}
          tableData={tableData}
          patientState={state}
          centreName={CentreData?.find((c) => c.value === LTData?.CentreID)?.label}
        />
      )}
      {show2 && (
        <UploadFile
          options={Identity}
          show={show2}
          handleClose={handleClose2}
          documentId={state?.PatientGuid}
          pageName="Patient Registration"
          handleUploadCount={handleUploadCount}
          getDocumentType={getDocumentType}
        />
      )}
      {show?.show && (
        <PatientRegisterModal
          show={show?.show}
          handleClose={handleClose}
          Type={show?.Type}
        />
      )}

      {mobleData.length > 0 && show4 && (
        <MobileDataModal
          show={show4}
          mobleData={mobleData}
          handleClose4={handleClose4}
          handleSelctData={handleSelctData}
        />
      )}
      {show3 && (
        <MedicialModal
          show={show3}
          handleClose={handleClose3}
          MedicalId={state?.PatientGuid}
          handleUploadCount={handleUploadCount}
        />
      )}
      <Accordion title={t("Patient Details")} defaultValue={true}>
        <div className="row pt-2 pl-2 pr-2">
          <div className="col-12 col-md-10">
            <div className="row pt-2 pl-1 pr-1 flex-wrap">
              {controllerDynamicList
                ?.sort((a, b) => a.DisplayOrder - b.DisplayOrder)
                .map((item) => {
                  if (!item?.IsShow) return null;
                  const fieldContent = renderField(item);
                  if (!fieldContent) return null;

                  return (
                    <div
                      key={item.ControlDisplayID}
                      className={
                        item?.ControlDisplayID === "Remarks" || item?.ControlDisplayID === "Remark"
                          ? "col-12 col-md-4 my-1"
                          : "col-6 col-md-2 my-1"
                      }
                    >
                      {fieldContent}
                    </div>
                  );
                })}

              {!controllerDynamicList?.some(
                (item) =>
                  (item?.ControlDisplayID === "Remarks" || item?.ControlDisplayID === "Remark") &&
                  item?.IsShow === 1,
              ) && (
                <div className="col-12 col-md-4 my-1">
                  {renderField({
                    ControlDisplayID: "Remarks",
                    ControlDisplayName: "Reason to Change Demographic",
                    IsShow: 1,
                  })}
                </div>
              )}

              <div className="col-6 col-md-2 my-1">
                <Input
                  type="text"
                  lable="UHID"
                  max={15}
                  disabled={state?.Mobile}
                  value={state?.PatientCode}
                  name="PatientCode"
                  onInput={(e) => number(e, 15)}
                  onKeyDown={(e) => handlePatientData(e, "PatientCode")}
                  placeholder=" "
                  id="PatientCode"
                  onChange={handleMainChange}
                />
              </div>

              {visibleFields?.map(
                (data, index) =>
                  data?.IsVisible === 1 && (
                    <div className="col-6 col-md-2 my-1" id="OpdNo" key={index}>
                      {[
                        "PatientSource",
                        "PatientType",
                        "HLMPatientType",
                      ].includes(data?.FieldType) ? (
                        <SelectBox
                          className={`${data?.IsMandatory === 1 && "required"}`}
                          lable={data?.FieldType}
                          options={
                            data?.FieldType === "PatientSource"
                              ? [
                                { label: "Select", value: "" },
                                ...PatientSource,
                              ]
                              : data?.FieldType === "PatientType"
                                ? [
                                  { label: "Select", value: "" },
                                  ...PatientType,
                                ]
                                : data?.FieldType === "HLMPatientType"
                                  ? HLMPatientType
                                  : data?.FieldType === "Source"
                                    ? SourceType
                                    : []
                          }
                          selectedValue={LTData[data?.FieldType]}
                          name={data?.FieldType}
                          onChange={handleSelectNew}
                        />
                      ) : (
                        <Input
                          className={` ${data?.IsMandatory === 1 && "required"}`}
                          id={removeSpecialCharacters(data?.FieldType)}
                          placeholder=" "
                          lable={data?.FieldType}
                          max={30}
                          name={data?.FieldType}
                          value={LTData[data?.FieldType]}
                          onChange={handleLTData}
                          type="text"
                        />
                      )}
                      {data?.isError && (
                        <div className="error-message">{data?.message}</div>
                      )}
                    </div>
                  ),
              )}
            </div>
          </div>

          <div className="col-6 col-md-2 my-1">
            <div
              style={{
                border: "1px solid grey",
                borderRadius: "5px",
                textAlign: "center",
                width: "67%",
                height: "52%",
                marginLeft: "10px",
              }}
              className="p-1"
            >
              <img
                src={MyImage}
                height={65}
                alt="Image"
                style={{ width: "100%" }}
                preview
                disable={true}
              />
            </div>
            <div className="p-1">
              <button
                className="text-white rounded p-1"
                type="button"
                style={{
                  width: "74%",
                  fontSize: "11px",
                  marginLeft: "5px",
                  bottom: "5px",
                }}
                id="document-s"
                onClick={() => {
                  setShow2(true);
                }}
              >
                <i class="fa fa-file" aria-hidden="true"></i>
              </button>
            </div>
            <div className="p-1">
              <button
                className="text-white rounded p-1"
                type="button"
                style={{
                  width: "74%",
                  fontSize: "11px",
                  marginLeft: "5px",
                  bottom: "5px",
                }}
                id="document-s"
                onClick={() => {
                  handleClose3();
                }}
              >
                <i class="fa fa-h-square" aria-hidden="true"></i>
              </button>
            </div>
          </div>
        </div>
      </Accordion>
      {Pndt?.PNDT && (
        <Accordion
          // className="card"
          title={t("Pre-Natal Diagnostic Techniques")}
          defaultValue={true}
        >
          <div className="row mt-2 pt-2 pl-2 pr-2">
            <div className="col-6 col-md-2 my-1">
              <Input
                id="NoOfChildren"
                name="NoOfChildren"
                lable="Number Of Children"
                placeholder=" "
                type="number"
                onInput={(e) => number(e, 3)}
                value={Pndt?.NoOfChildren}
                onChange={handlePNDTChange}
              />
              {Pndt.NoOfChildren === "" && (
                <div className="error-message">{errors?.NoOfChildren}</div>
              )}
            </div>
            <div className="col-6 col-md-2 my-1">
              <Input
                name="NoOfSon"
                id="NoOfSon"
                lable="Number Of Son"
                placeholder=" "
                type="number"
                value={Pndt?.NoOfSon}
                onInput={(e) => number(e, 3)}
                onChange={handlePNDTChange}
              />
              {Pndt.NoOfSon === "" && (
                <div className="error-message">{errors?.NoOfSon}</div>
              )}
            </div>
            <div className="col-6 col-md-2 my-1">
              <Input
                id="NoOfDaughter"
                lable="Number Of Daughter"
                placeholder=" "
                name="NoOfDaughter"
                type="number"
                value={Pndt?.NoOfDaughter}
                onInput={(e) => number(e, 3)}
                onChange={handlePNDTChange}
              />
              {Pndt.NoOfDaughter === "" && (
                <div className="error-message">{errors?.NoOfDaughter}</div>
              )}
            </div>
            <div className="col-6 col-md-2 my-1">
              <DatePicker
                name="Pregnancy"
                className="custom-calendar"
                id="Pregnancy"
                lable="Pregnancy"
                placeholder=" "
                value={Pndt?.Pregnancy}
                maxDate={new Date()}
                onChange={handleDatePNDT}
              />
              {Pndt.Pregnancy === "" && (
                <div className="error-message">{errors?.Pregnancy}</div>
              )}
            </div>
            <div className="col-6 col-md-2 my-1">
              <Input
                name="AgeOfSon"
                lable="Son's Age"
                id="AgeOfSon"
                placeholder=" "
                type="number"
                value={Pndt?.AgeOfSon}
                onInput={(e) => number(e, 3)}
                onChange={handlePNDTChange}
              />
              {Pndt.AgeOfSon === "" && (
                <div className="error-message">{errors?.AgeOfSon}</div>
              )}
            </div>
            <div className="col-6 col-md-2 my-1">
              <Input
                className="form-control input-sm"
                name="AgeOfDaughter"
                type="number"
                id="AgeOfDaughter"
                lable="Daughter's Age"
                placeholder=" "
                value={Pndt?.AgeOfDaughter}
                onInput={(e) => number(e, 3)}
                onChange={handlePNDTChange}
              />
              {Pndt.AgeOfDaughter === "" && (
                <div className="error-message">{errors?.AgeOfDaughter}</div>
              )}
            </div>
            <div className="col-6 col-md-2 my-1">
              <SelectBox
                className="form-control input-sm"
                name="PNDTDoctor"
                id="PNDTDoctor"
                lable="PNDT Doctor"
                placeholder="PNDT Doctor"
                options={DoctorData}
                selectedValue={Pndt?.PNDTDoctor}
                onChange={handlePNDTChange}
              />
              {Pndt.PNDTDoctor === "" && (
                <div className="error-message">{errors?.PNDTDoctor}</div>
              )}
            </div>
            <div className="col-md-1 m-0 p-0">
              <Input
                className="form-control input-sm"
                name="Husband"
                lable="Husband"
                placeholder=" "
                id="Husband"
                value={Pndt?.Husband}
                onChange={handlePNDTChange}
              />
              {Pndt.Husband === "" && (
                <div className="error-message">{errors?.Husband}</div>
              )}
            </div>
          </div>
        </Accordion>
      )}
      <Accordion title={t("Booking Details")} defaultValue={true}>
        <div className="row flex-wrap">
          <div className="col-12 col-md-6">
            <div className="row pt-2 pl-2 pr-2">
              <div className="col-sm-12 col-md-12 col-12 col-lg-5">
                <Input
                  name="TestName"
                  className="required-fields"
                  lable={
                    searchTest == "TestName"
                      ? "Type TestName For Add Test"
                      : "Type TestCode For Add Test"
                  }
                  type="text"
                  placeholder=" "
                  value={searchForm?.TestName}
                  max={30}
                  id="testSearch"
                  onChange={handleChange}
                  onBlur={() => {
                    autocompleteOnBlur(setSuggestion);
                  }}
                  onKeyDown={handleIndex}
                />
                {suggestion.length > 0 && (
                  <ul className="suggestion-data" style={{ zIndex: 99 }}>
                    {suggestion.map((data, index) => (
                      <li
                        onClick={() => handleListSearch(data, "TestName")}
                        key={index}
                        className={`${index === indexMatch && "matchIndex"}`}
                      >
                        {data.TestName}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              <div className="col-auto">
                <div className="d-flex align-items-center">
                  <div className="mx-2">
                    <input
                      type="radio"
                      id="TestName"
                      name="TestName"
                      value="TestName"
                      checked={searchTest == "TestName"}
                      onChange={(e) => {
                        setSearchTest(e.target.value);
                      }}
                    />
                    <label htmlFor="TestName" className="ml-2">
                      {t("By TestName")}
                    </label>
                  </div>
                  <div className="mx-2">
                    <input
                      type="radio"
                      id="TestCode"
                      name="TestCode"
                      value="TestCode"
                      checked={searchTest == "TestCode"}
                      onChange={(e) => {
                        setSearchTest(e.target.value);
                      }}
                    />
                    <label htmlFor="TestCode" className="ml-2">
                      {t("By TestCode")}
                    </label>
                  </div>
                </div>
              </div>
              <div className="col-auto">
                <div className="d-flex align-items-center">
                  <div className="mx-2">
                    <input
                      type="checkbox"
                      name="isVIP"
                      id="isVIP"
                      checked={state?.isVIP}
                      onChange={handleMainChange}
                      value={state?.isVIP === 1 ? true : false}
                    />
                    <label htmlFor="isVIP" className="ml-2">
                      {t("VIP")}
                    </label>
                  </div>
                  {state?.isVIP === 1 && (
                    <div className="mx-2">
                      <input
                        type="checkbox"
                        name="IsMask"
                        id="IsMask"
                        checked={state?.IsMask}
                        onChange={handleMainChange}
                        value={state?.IsMask === 1 ? true : false}
                      />
                      <label htmlFor="IsMask" className="ml-1">
                        {t("MASK")}
                      </label>{" "}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="row px-2 mb-2">
              {" "}
              <div className="col-12">
                <Tables>
                  <thead>
                    <tr>
                      <th className="text-center">{"#"}</th>
                      <th>{t("Slot")}</th>
                      <th>{t("Code")}</th>
                      <th
                        style={{
                          wordWrap: "break-word",
                          whiteSpace: "normal",
                        }}
                      >
                        {t("Item")}
                      </th>
                      <th>{t("View")}</th>
                      <th>{t("DOS")}</th>
                      <th>{t("MRP")}</th>
                      <th>{t("Rate")}</th>
                      <th>{t("Qty")}</th>
                      {/* <th>{t("Disc.")}</th> */}
                      {/* <th>{t("Amt")}</th> */}
                      <th>{t("D.Date")}</th>
                      {/* <th>{t("SC")}</th> */}
                      <th>
                        <Tooltip label={"Urgen Delivery"}>
                          {/* <span class="blinking"> */}
                          <i
                            className="fa fa-hourglass-start fa-spin blinking"
                            style={{ color: "red" }}
                          ></i>
                          {/* </span> */}
                        </Tooltip>
                      </th>
                      <th className="text-center">
                        <i class="fa fa-trash"></i>
                      </th>
                    </tr>
                  </thead>{" "}
                  {tableData.length > 0 && (
                    <tbody>
                      {tableData.map((data, index) => (
                        <>
                          {show5?.modal &&
                            index === show5?.index &&
                            [3, 4].includes(BarcodeLogic) && (
                              <BarcodeLogicModal
                                BarcodeLogic={BarcodeLogic}
                                show={show5}
                                setShow5={setShow5}
                                Edit={false}
                                onClose={() => {
                                  setShow5({ modal: false, index: -1 });
                                }}
                                data={data}
                                handleCloseBarcodeModal={
                                  handleCloseBarcodeModal
                                }
                                LedgerTransactionID={
                                  LTData?.LedgerTransactionID
                                }
                              // handleMainClose={() =>
                              //   handleBarcodeUpperClose(index, data?.Status)
                              // }
                              />
                            )}
                          <tr
                            key={index}
                            style={{
                              background: data?.isOutSource === 1 ? "pink" : "",
                            }}
                          >
                            <RegisterationTable
                              data={data}
                              slotOpen={slotOpen}
                              setSlotOpen={setSlotOpen}
                              handleSelectSlot={handleSelectSlot}
                              tableData={tableData}
                              setTableData={setTableData}
                              LTData={LTData}
                              index={index}
                              coupon={false}
                              member={false}
                              handleFilter={handleFilter}
                              handleDiscount={handleDiscount}
                              handleRateChange={handleRateChange}
                              handleQuantityChange={handleQuantityChange}
                              enableQuantitySelection={true}
                              handlePLOChange={handlePLOChange}
                              handleUrgent={handleUrgent}
                              state={state}
                              isEditPatientDetails
                            />
                          </tr>
                        </>
                      ))}
                    </tbody>
                  )}
                </Tables>
              </div>{" "}
            </div>
          </div>

          <div className="col-12 col-md-6 pt-2 px-2">
            <div className="row mt-2 mb-1 ml-0 align-items-center">
              <div className="col-auto mb-1">
                {isSubmit ? (
                  <Loading />
                ) : (
                  <SaveButton
                    text={"Submit"}
                    type="submit"
                    id="btnSave"
                    onClick={() => {
                      handleSubmit();
                      window.scrollTo(0, 0);
                    }}
                  />
                )}
              </div>
              <div className="col-auto mb-1">
                {/* <button
                  type="submit"
                  id="btnSave"
                  className="btn btn-success w-100 btn-sm"
                  onClick={() => {
                    handleClose()
                    navigate("/receiptreprint");
                    onHideModal()
                  }}
                >
                  {"MainList"}
                </button> */}
                <CustomButton
                  text={"MainList"}
                  icon={"list"}
                  type="button"
                  id="btnCancel"
                  onClick={() => {
                    handleClose()
                    if (typeof onHideModal === "function") {
                      onHideModal();
                    } else {
                      navigate("/receiptreprint");
                    }
                  }}
                />
              </div>
            </div>
            <div className="row mt-3">
              <div className="col-sm-12">
                <div
                  className="alert"
                  style={{
                    backgroundColor: "#fdecea",
                    color: "#b71c1c",
                    border: "1px solid #f5c6cb",
                    padding: "8px 12px",
                    fontSize: "16px",
                    borderRadius: "6px",
                    fontWeight: "700",
                    width: "fit-content"
                  }}
                >
                  {rightDeleteAddTest?.AllowTestDeleteInsteadOfRefund == 1 ? (
                    <span>
                      ⚠ Removing a test will impact the daily net sales for the patient’s booking date
                    </span>
                  ) : (
                    <span>
                      ⚠ Removing a test will impact your net sales for today.
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </Accordion>
    </>
  );
};

export default EditPatientDetails;

