import React from "react";
import { useEffect } from "react";
import { useState } from "react";
import moment from "moment";
import { toast } from "react-toastify";
import { validateIdentityProof, validateEmail, validatePincode, validateAddress, ADDRESS_MAX_LENGTH } from "../../utils/validations/validationHelpers";
import { useFormik } from "formik";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Heading from "../../components/UI/Heading";
import Accordion from "@app/components/UI/Accordion";
import { axiosInstance } from "../../utils/axiosInstance";
import {
  getAccessCentres,
  getAccessDataRate,
  getCollectionBoy,
  getDoctorSuggestion,
  getsecondDoctorSuggestion,
  getSearchController,
  getPaymentModes,
  GetGlobalData,
} from "../../utils/NetworkApi/commonApi";
import PatientRegisterModal from "../utils/PatientRegisterModal";
import Input from "../../components/formComponent/Input";
import {
  autocompleteOnBlur,
  formatStandardDate,
  getTrimmedData,
  number,
  parseBackendDate,
  selectedValueCheck,
} from "../../utils/helpers";
import DatePicker from "../../components/formComponent/DatePicker";
import { SelectBox } from "../../components/formComponent/SelectBox";
import { useTranslation } from "react-i18next";
import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";
import Loading from "../../components/loader/Loading";
import Tooltip from "../../components/formComponent/Tooltip";
import { useSelector } from "react-redux";
import ReactSelect from "../../components/formComponent/ReactSelect";
import PatientRegistrationModal from "./PatientRegistrationModal";
import { EditButton, SearchButton, CustomButton } from "../../components/UI/CustomButton";
import UploadFile from "../utils/UploadFileModal/UploadFile";
import PdfPreviewModal from "../utils/PdfPreviewModal";
import { guidNumber } from "../../utils/generateGuid";
import { useDispatch } from "react-redux";
import {
  setLoading,
  setRefDoctorModalData,
} from "../../store/reducers/loadingSlice/loadingSlice";
import { useRef } from "react";
import CustomTimePicker from "../../components/formComponent/TimePicker";
import { useLocalStorage } from "../../utils/hooks/useLocalStorage";
import "./PatientRegistration.css";
import "./DynamicValidation.css";
import "./ErrorStyles.css";

const EditPatientInfo = ({ onHideModal, onSaved = () => {}, onPatientChange }) => {
  const navigate = useNavigate();
  const reactRef = useRef(null);
  // Snapshot of the doctor loaded with the visit — used on save when the operator
  // did not touch Referred Doctor, so a Locality-only (etc.) update cannot wipe
  // DoctorID to 0 and rewrite it as SELF.
  const loadedDoctorRef = useRef({ id: 0, name: "" });
  // EPD-088: values as loaded — server keeps live DB for fields this session did not change
  const patientEditBaselineRef = useRef(null);
  // EPD-032: remember ID Proof No per Id Type so switching back restores it.
  const idProofByTypeRef = useRef({});
  const { refLabModalData, refDoctorModalData } = useSelector(
    (data) => data?.loadingSlice,
  );
  const PAGE_ID = "1047";
  const DefaultCurrencyName = useLocalStorage(
    "userData",
    "get",
  )?.DefaultCurrencyName;
  const location = useLocation();
  const [show, setShow] = useState({ show: false, Type: "" });
  const reprintLabNo = useSelector((state) => state.loadingSlice.reprintLabNo);
  const dispatch = useDispatch();
  const [t] = useTranslation();
  const [CentreData, setCentreData] = useState([]);
  const [load, setLoad] = useState(false);
  const [RateType, setRateType] = useState([]);
  const [state, setState] = useState({});
  console.log(state,"testing")
  const [visibleFields, setVisibleFields] = useState([]);
  const [suggestion, setSuggestion] = useState([]);
  const [doctorSuggestion, setDoctorSuggestion] = useState([]);
  const [seconddoctorSuggestion, setseconddoctorSuggestion] = useState([]);

  // Safe array setters to prevent .map errors
  const safeSetDoctorSuggestion = (val) =>
    setDoctorSuggestion(Array.isArray(val) ? val : []);
  const safeSetSecondDoctorSuggestion = (val) =>
    setseconddoctorSuggestion(Array.isArray(val) ? val : []);
  const [collectionBoy, setCollectionBoy] = useState([]);
  const [selectedBoy, setSelectedBoy] = useState("");
  const [controllerDynamicList, setControllerDynamicList] = useState([]);
  const [moreErrors, setMoreErrors] = useState({});
  const [tabbingOrder, setTabbingOrder] = useState([]);
  const [toggleRefLabModal, setToggleRefLabModal] = useState(false);
  const [LabNo, setLabNo] = useState("");
  const [referalLab, setReferalLab] = useState([]);
  const [selectedReferLab, setSelectedReferLab] = useState(0);
  const [payload, setPayload] = useState({});
  const [referalBoyPayload, setRefralBoyPayload] = useState({});
  const [Gender, setGender] = useState([]);
  const [indexMatch, setIndexMatch] = useState(0);
  const [Title, setTitle] = useState([]);
  const [Identity, setIdentity] = useState([]);
  const [BankName, setBankName] = useState([]);
  const [PaymentMode, setPaymentMode] = useState([]);
  const [SampleSource, setSampleSource] = useState([]);
  const [VisitType, setVisitType] = useState([]);
  const [PatientSource, setPatientSource] = useState([]);
  const [PatientType, setPatientType] = useState([]);
  const [proEmplyee, setProEmployee] = useState([]);
  const [secondDropFalse, setSecondDropFalse] = useState(false);
  const [dropFalse, setDropFalse] = useState(true);
  const [referLabSearch, setReferLabSearch] = useState("");
  const [refLabSearchText, setRefLabSearchText] = useState("");
  const [refLabSuggestions, setRefLabSuggestions] = useState([]);
  const [refLabDropShow, setRefLabDropShow] = useState(false);
  const [demographicUploadModal, setDemographicUploadModal] = useState({ modal: false, data: "" });
  const [demographicFormFilePath, setDemographicFormFilePath] = useState("");
  const [existingDemographicFileCount, setExistingDemographicFileCount] = useState(0);
  const [demographicAwsKeys, setDemographicAwsKeys] = useState([]);
  const [demographicPreviewVisible, setDemographicPreviewVisible] = useState(false);
  // "Others" referred-doctor flow — exact same behavior as PatientRegistration.jsx:
  // typing "others" locks DoctorID to the fixed sentinel "2" and opens this modal
  // to capture the real name into OtherDoctorName (display mirrors into DoctorName).
  const [showOtherDoctorModal, setShowOtherDoctorModal] = useState(false);

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

  const [sampleCollectionDateTime, setSampleCollectionDateTime] = useState(
    () => {
      const now = new Date();
      const hours = String(now.getHours()).padStart(2, "0");
      const minutes = String(now.getMinutes()).padStart(2, "0");
      return { data: now, time: `${hours}:${minutes}:00` };
    },
  );

  const utcDate = () => {
    const d = new Date(sampleCollectionDateTime.data);
    const [hh, mm] = sampleCollectionDateTime.time.split(":");
    return new Date(
      Date.UTC(
        d.getFullYear(),
        d.getMonth(),
        d.getDate(),
        Number(hh),
        Number(mm),
        0,
      ),
    );
  };

  const [formData, setFormData] = useState({
    DoctorName: "",
    SecondReferDoctor: "",
  });
  const [DefaultDoc, setDefaultDoc] = useState("");
  const [nikshayID, setNikshayID] = useState("");
  const [trfNo, setTrfNo] = useState("");
  const [DateData, setDateData] = useState({
    AgeYear: "",
    AgeMonth: "",
    AgeDays: "",
  });
  const [searchForm, setSearchForm] = useState({
    TestName: "",
    CentreID: "",
    InvestigationID: "",
  });

  const handleClose = () => setShow({ Type: "", show: false });
  const handleShow = (Type) => setShow({ Type: Type, show: true });

  // ─── isHideController (same pattern as PatientRegistration) ───────────────
  const isHideController = (cntrId = "") => {
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

  // ─── Sync refDoctorModalData ─────────────────────────────────────────────
  useEffect(() => {
    if (refDoctorModalData?.doctorId || refDoctorModalData?.DoctorReferalID) {
      const name = refDoctorModalData?.name || refDoctorModalData?.Name || "";
      const mobile =
        refDoctorModalData?.mobile || refDoctorModalData?.Mobile || "";
      const department =
        refDoctorModalData?.Department ||
        refDoctorModalData?.department ||
        refDoctorModalData?.DeptName ||
        refDoctorModalData?.DepartmentName ||
        refDoctorModalData?.Dept ||
        refDoctorModalData?.dept ||
        refDoctorModalData?.DoctorDepartment ||
        "";
      const specialization =
        refDoctorModalData?.Specialization ||
        refDoctorModalData?.specialization ||
        refDoctorModalData?.Speciality ||
        refDoctorModalData?.Speclization ||
        refDoctorModalData?.Spec ||
        refDoctorModalData?.spec ||
        refDoctorModalData?.SpecializationName ||
        "";
      const formattedName = [name, mobile, department, specialization]
        .filter(
          (item) =>
            item && String(item).trim() !== "" && item !== 0 && item !== "0",
        )
        .join("~");
      const doctorId =
        refDoctorModalData?.doctorId || refDoctorModalData?.DoctorReferalID;
      if (refDoctorModalData?.Type === "Secondary") {
        setFormData((prev) => ({ ...prev, SecondReferDoctor: formattedName }));
        setState((prev) => ({ ...prev, SecondReferDoctor: doctorId || 0 }));
        setSecondDropFalse(false);
      } else {
        setFormData((prev) => ({ ...prev, DoctorName: formattedName }));
        setState((prev) => ({
          ...prev,
          DoctorID: doctorId,
          DoctorName: formattedName,
        }));
        setDropFalse(false);
        setDefaultDoc("");
      }
      dispatch(setRefDoctorModalData(null));
    }
  }, [refDoctorModalData?.doctorId, refDoctorModalData?.DoctorReferalID, dispatch]);

  const handleSelectNew = (event) => {
    const { name, value } = event.target;
    setMoreErrors((prev) => ({ ...prev, [name]: "" }));
    setState({ ...state, [name]: value });
  };

  useEffect(() => {
    getCollectionBoy(setCollectionBoy);
  }, []);

  useEffect(() => {
    ReferalLab();
    setSelectedReferLab(refLabModalData?.id);
  }, [refLabModalData?.id]);

  useEffect(() => {
    if (selectedReferLab && referalLab.length > 0) {
      const found = referalLab.find((r) => r.value === String(selectedReferLab));
      if (found) setRefLabSearchText(found.label);
    } else if (!selectedReferLab) {
      setRefLabSearchText("");
    }
  }, [selectedReferLab, referalLab]);

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
        break;
      case "DoctorName": {
        const dept =
          data?.Department ||
          data?.DeptName ||
          data?.DepartmentName ||
          data?.Dept ||
          data?.dept ||
          data?.DoctorDepartment ||
          data?.DeptlName ||
          "";
        const spec =
          data?.Specialization ||
          data?.Speciality ||
          data?.Speclization ||
          data?.Spec ||
          data?.spec ||
          data?.SpecializationName ||
          "";
        // Keep the visible field as Name only so operators (and E2E) can
        // re-read "SELF" after pick. Extra columns stay in the dropdown title.
        const doctorName = String(data?.Name || "").trim();
        const formattedName = [doctorName, data?.Mobile, dept, spec]
          .filter(
            (item) =>
              item && String(item).trim() !== "" && item !== 0 && item !== "0",
          )
          .join("~");
        const doctorId = Number(data?.DoctorReferalID) || 0;
        setFormData((prev) => ({ ...prev, DoctorName: doctorName || formattedName }));
        setState((prev) => ({
          ...prev,
          // Persist the real Name (not Name~Mobile~...) — RegistrationEditData
          // re-resolves from DoctorID, but reopen/DefaultDoc must match what
          // was selected (e.g. SELF, not SELF~98765...).
          DoctorName: doctorName,
          DoctorID: doctorId,
          DoctorMobile: data?.Mobile,
          DoctorEmail: data?.Email,
        }));
        setIndexMatch(0);
        setDoctorSuggestion([]);
        setDropFalse(false);
        setDefaultDoc("");
        break;
      }
      case "SecondReferDoctor": {
        const sdept =
          data?.Department ||
          data?.DeptName ||
          data?.DepartmentName ||
          data?.Dept ||
          data?.dept ||
          data?.DoctorDepartment ||
          data?.DeptlName ||
          "";
        const sspec =
          data?.Specialization ||
          data?.Speciality ||
          data?.Speclization ||
          data?.Spec ||
          data?.spec ||
          data?.SpecializationName ||
          "";
        const sformattedName = [data?.Name, data?.Mobile, sdept, sspec]
          .filter(
            (item) =>
              item && String(item).trim() !== "" && item !== 0 && item !== "0",
          )
          .join("~");
        setFormData((prev) => ({ ...prev, SecondReferDoctor: sformattedName }));
        setState((prev) => ({ ...prev, SecondReferDoctor: data?.DoctorReferalID }));
        setIndexMatch(0);
        setseconddoctorSuggestion([]);
        setSecondDropFalse(false);
        break;
      }
      default:
        break;
    }
  };

  useEffect(() => {
    getDoctorSuggestion(formData, safeSetDoctorSuggestion, setFormData);
  }, [formData?.DoctorName]);
  useEffect(() => {
    if (Array.isArray(doctorSuggestion) && doctorSuggestion?.length > 0)
      setIndexMatch(0);
  }, [doctorSuggestion]);
  useEffect(() => {
    getsecondDoctorSuggestion(
      formData,
      safeSetSecondDoctorSuggestion,
      setFormData,
    );
  }, [formData?.SecondReferDoctor]);
  useEffect(() => {
    if (
      Array.isArray(seconddoctorSuggestion) &&
      seconddoctorSuggestion?.length > 0
    )
      setIndexMatch(0);
  }, [seconddoctorSuggestion]);

  const ReferalLab = async () => {
    dispatch(setLoading(true));
    await axiosInstance
      .get("ReferalLab/GetReferalLabDropdwon")
      .then((res) => {
        if (Array.isArray(res?.data?.message)) {
          const refReslist = res?.data?.message?.map((data) => ({
            ...data,
            label: data?.NAME,
            value: String(data?.ID),
          }));
          setReferalLab(refReslist);
        }
      })
      .catch((err) => console.log(err))
      .finally(() => dispatch(setLoading(false)));
  };

  const handleToggleRefLabModal = () => setToggleRefLabModal(false);

  const handleCollectionBoyChange = (name, e) => {
    setMoreErrors((prev) => ({ ...prev, CollectionBoyId: "" }));
    setSelectedBoy(e?.value);
    setPayload((prev) => ({
      ...prev,
      collectionBoyID: e?.value,
      collectionBoyName: e?.label,
    }));
  };

  const handleReactSelectChange = (name, e) => {
    setMoreErrors((prev) => ({ ...prev, [name]: "" }));
    setSelectedReferLab(e?.value);
    setRefralBoyPayload((prev) => ({
      ...prev,
      referalBoyID: e?.value || "",
      refralBoyName: e?.label || "",
    }));
  };

  const handleKeyDown = (e, currentId) => {
    if (e.key !== "Tab") return;
    if (e.target && typeof e.target.select === "function") e.target.select();
    e.preventDefault();
  };

  const handleSelectChange = (event) => {
    const { name, value } = event.target;
    setMoreErrors((prev) => ({ ...prev, [name]: "" }));
    if (name === "CentreID") {
      setState((prev) => ({ ...prev, [name]: value }));
      getAccessDataRate(setRateType, value);
    }
    if (name === "PatientIDProof") {
      const prevType = String(state?.PatientIDProof || "").trim();
      const prevNo = String(state?.PatientIDProofNo || "");
      if (prevType) {
        idProofByTypeRef.current[prevType] = prevNo;
      }
      const nextType = String(value || "").trim();
      const proofNo = nextType ? (idProofByTypeRef.current[nextType] ?? "") : "";
      setState({ ...state, [name]: value, PatientIDProofNo: proofNo });
    }
    if (name === "VisitType") {
      // setState({ ...state, [name]: value });
      setState({ ...state, [name]: String(value) });
      fetchFields(value);
    }
    if (name === "ReportDeliveryMethodId")
      setState({ ...state, [name]: value });
    if (name === "DiscountApprovedBy") setState({ ...state, [name]: value });
    if (name === "DiscountReason") setState({ ...state, [name]: value });
    if (name === "CollectionBoyId") setState({ ...state, [name]: value });
    if (name === "Gender") setState({ ...state, [name]: value });
    if (name === "SampleBy") setState({ ...state, [name]: value });
  };

  const handleSearchSelectChange = (label, value) => {
    setMoreErrors((prev) => ({ ...prev, [label]: "" }));
    if (label === "VisitType") {
      // setState((prev) => ({ ...prev, VisitType: value?.value }));
      setState((prev) => ({ ...prev, VisitType: String(value?.value) }));
      fetchFields(value?.value);
    }
    if (label === "SampleBy")
      setState((prev) => ({ ...prev, SampleBy: value?.value }));
    if (label === "CollectionBoyId") {
      setSelectedBoy(value?.value);
      setPayload((prev) => ({
        ...prev,
        collectionBoyID: value?.value,
        collectionBoyName: value?.label,
      }));
    }
  };

  const findGender = () => {
    const male = ["Mr.", "Baba", "Dr.(Mr)", "Master"];
    const female = [
      "Miss.",
      "Mrs.",
      "Baby",
      "Dr.(Miss)",
      "Dr.(Mrs)",
      "Ms.",
      "SMT.",
    ];
    const other = [""];
    if (male.includes(state?.Title)) setState({ ...state, Gender: "Male" });
    if (female.includes(state?.Title)) setState({ ...state, Gender: "Female" });
    if (other.includes(state?.Title)) setState({ ...state, Gender: "Other" });
  };

  useEffect(() => {
    findGender();
  }, [state?.Title]);

  const fetchFields = (visitType) => {
    axiosInstance
      .post("ManageFieldMaster/getAllManageFieldMasterData", {
        VisitTypeID: Number(visitType),
      })
      .then((res) => {
        let data = res?.data?.message;
        data.map((ele) => ({ ...ele, isError: false, message: "" }));
        setVisibleFields(res?.data?.message);
      })
      .catch((err) =>
        toast.error(
          err?.response?.data?.message
            ? err?.response?.data?.message
            : "Error Occured",
        ),
      );
  };

  const handlePName = (data) => {
    const { FirstName, MiddleName, LastName } = data;
    return `${FirstName} ${MiddleName} ${LastName}`;
  };

  // The modal header is drawn by the parent from the grid row, which is a snapshot
  // taken by the search and cannot know what is being typed in here. Report the
  // name parts upward as they change, so the header tracks the edit instead of
  // showing the pre-edit name while the user is changing it. Title holds its
  // display text ("Mrs."), not a code, so it can be rendered as-is.
  useEffect(() => {
    if (typeof onPatientChange === "function") {
      onPatientChange({
        Title: state?.Title,
        FirstName: state?.FirstName,
        MiddleName: state?.MiddleName,
        LastName: state?.LastName,
      });
    }
    // onPatientChange is deliberately not a dependency: the parent passes a state
    // setter, and an inline function here would re-fire this on every render.
  }, [state?.Title, state?.FirstName, state?.MiddleName, state?.LastName]);

  const DynamicFieldValidations = () => {
    const data = visibleFields.map((ele) => {
      if (
        ele["IsMandatory"] === 1 &&
        ele["IsVisible"] === 1 &&
        state[ele["FieldType"]] === ""
      ) {
        return {
          ...ele,
          isError: true,
          message: `${ele["FieldType"]} is Required Field`,
        };
      } else {
        return { ...ele, isError: false, message: "" };
      }
    });
    return data;
  };

  // ─── getFieldValue (same pattern as PatientRegistration) ────────────────────
  // const getFieldValue = (controlId) => {
  //   const fieldMap = {
  //     CentreID: state?.CentreID,
  //     RateID: state?.RateID,
  //     VisitType: state?.VisitType,
  //     Mobile: state?.Mobile,
  //     Title: state?.Title,
  //     FirstName: state?.FirstName,
  //     MiddleName: state?.MiddleName,
  //     LastName: state?.LastName,
  //     DoctorName: formData?.DoctorName || DefaultDoc,
  //     SecondReferDoctor: formData?.SecondReferDoctor,
  //     DOB: state?.DOB,
  //     AgeYear: state?.AgeYear,
  //     AgeMonth: state?.AgeMonth,
  //     AgeDays: state?.AgeDays,
  //     Gender: state?.Gender,
  //     CollectionBoyId: selectedBoy,
  //     IdType: state?.PatientIDProof,
  //     PatientIDProofNo: state?.PatientIDProofNo,
  //     Email: state?.Email,
  //     PinCode: state?.PinCode,
  //     City: state?.City,
  //     State: state?.State,
  //     Country: state?.Country,
  //     HouseNo: state?.HouseNo,
  //     Address: state?.HouseNo,
  //     SecondaryNumber: state?.SecondaryNumber,
  //     nikshayID: nikshayID || state?.NikshayID,
  //     trfNo: trfNo,
  //     RegistrationDate: state?.RegistrationDate,
  //     BMI: state?.BMI,
  //     SrfId: state?.SrfId,
  //     IcmrId: state?.IcmrId,
  //     Locality: state?.Locality,
  //     SampleSourceId: state?.SampleBy,
  //     ProEmployee: state?.ProEmployee,
  //     Weight: state?.Weight,
  //     Height: state?.Height,
  //     "H-UIHD": state?.H_UIHD,
  //     "H-VisitNo": state?.H_VisitNo,
  //     HMIS_PatCrNo: state?.HMIS_PatCrNo,
  //     NoOfChildren: Pndt?.NoOfChildren,
  //     NoOfSon: Pndt?.NoOfSon,
  //     NoOfDaughter: Pndt?.NoOfDaughter,
  //     Pregnancy: Pndt?.Pregnancy,
  //     AgeOfSon: Pndt?.AgeOfSon,
  //   };
  //   return fieldMap[controlId] !== undefined
  //     ? fieldMap[controlId]
  //     : state?.[controlId];
  // };
  const getFieldValue = (controlId) => {
    const fieldMap = {
      CentreID: state?.CentreID,
      RateID: state?.RateID,
      VisitType: state?.VisitType,
      Mobile: state?.Mobile,
      Title: state?.Title,
      FirstName: state?.FirstName,
      MiddleName: state?.MiddleName,
      LastName: state?.LastName,
      // FIX: DoctorName ke liye DefaultDoc bhi consider karo
      DoctorName: formData?.DoctorName || DefaultDoc || state?.DoctorName,
      SecondReferDoctor: formData?.SecondReferDoctor,
      DOB: state?.DOB,
      // FIX: Age fields ko string mein convert karo taaki "0" bhi detect ho
      AgeYear: state?.AgeYear !== undefined && state?.AgeYear !== null
        ? String(state.AgeYear)
        : "",
      AgeMonth: state?.AgeMonth !== undefined && state?.AgeMonth !== null
        ? String(state.AgeMonth)
        : "",
      AgeDays: state?.AgeDays !== undefined && state?.AgeDays !== null
        ? String(state.AgeDays)
        : "",
      Gender: state?.Gender,
      CollectionBoyId: selectedBoy,
      IdType: state?.PatientIDProof,
      PatientIDProofNo: state?.PatientIDProofNo,
      Email: state?.Email,
      PinCode: state?.PinCode,
      City: state?.City,
      State: state?.State,
      Country: state?.Country,
      HouseNo: state?.HouseNo,
      Address: state?.HouseNo,
      SecondaryNumber: state?.SecondaryNumber,
      nikshayID: nikshayID || state?.NikshayID,
      trfNo: trfNo,
      RegistrationDate: state?.RegistrationDate,
      BMI: state?.BMI,
      SrfId: state?.SrfId,
      IcmrId: state?.IcmrId,
      Locality: state?.Locality,
      SampleSourceId: state?.SampleBy,
      SampleBy: state?.SampleBy,
      ProEmployee: state?.ProEmployee,
      Weight: state?.Weight,
      Height: state?.Height,
      "H-UIHD": state?.H_UIHD,
      "H-VisitNo": state?.H_VisitNo,
      HMIS_PatCrNo: state?.HMIS_PatCrNo,
      NoOfChildren: Pndt?.NoOfChildren,
      NoOfSon: Pndt?.NoOfSon,
      NoOfDaughter: Pndt?.NoOfDaughter,
      Pregnancy: Pndt?.Pregnancy,
      AgeOfSon: Pndt?.AgeOfSon,
      ReferLabId: String(selectedReferLab || ""),
      ReferDoctorRemarks: state?.ReferDoctorRemarks,
    };
    return fieldMap[controlId] !== undefined
      ? fieldMap[controlId]
      : state?.[controlId];
  };


  // ─── validateMandatoryFields (dynamic, same as PatientRegistration) ─────────
  // const validateMandatoryFields = () => {
  //   let errorsFound = {};
  //   let firstErrorFieldId = null;
  //   controllerDynamicList.forEach((item) => {
  //     if (item.IsMandatory === 1 && item.IsShow === 1) {
  //       const val = getFieldValue(item.ControlDisplayID);
  //       if (!val || String(val).trim() === "") {
  //         errorsFound[item.ControlDisplayID] =
  //           `${item.ControlLabel || item.ControlDisplayID} is Required`;
  //         if (!firstErrorFieldId) firstErrorFieldId = item.ControlDisplayID;
  //       }
  //     }
  //   });
  //   setMoreErrors(errorsFound);
  //   if (Object.keys(errorsFound).length > 0) {
  //     toast.error("Please fill all mandatory fields marked in red");
  //     const element = document.getElementById(firstErrorFieldId);
  //     if (element) {
  //       element.scrollIntoView({ behavior: "smooth", block: "center" });
  //       element.focus();
  //     }
  //     return false;
  //   }
  //   return true;
  // };
  // Flags the ID proof number against the selected Id Type straight away, rather
  // than waiting for Update. A malformed PAN or Aadhaar was accepted silently the
  // whole time the form was open, and the user only found out, if at all, once they
  // tried to save. Sets the error under both ids so the number field gets its red
  // border and the message renders beneath the pair.
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

  // Switching the Id Type re-applies that type's rule to whatever number is already
  // there, so a PAN left behind after switching to Aadhaar is flagged immediately.
  // Skipped on the first run so simply opening a record does not light up a field
  // the user has not touched.
  const identityTypeMounted = useRef(false);
  useEffect(() => {
    if (!identityTypeMounted.current) {
      identityTypeMounted.current = true;
      return;
    }
    revalidateIdentityProof(state?.PatientIDProof, state?.PatientIDProofNo);
  }, [state?.PatientIDProof]);

  // First Name and the reason for the change are mandatory here. Every other
  // field, dynamically-marked-mandatory or not, stays optional on this edit page.
  //
  // Remark is the reason recorded against a demographic change, so a change saved
  // without one leaves an amended patient record with no documented justification
  // - which is the thing an audit asks for. It was previously unenforced, even
  // though this screen already renders a FieldError for it and already gates the
  // "Upload Demographic Change Request Form" button on it.
  const validateMandatoryFields = () => {
    const missing = {};
    let firstErrorFieldId = null;

    if (
      state?.FirstName === undefined ||
      state?.FirstName === null ||
      String(state?.FirstName).trim() === ""
    ) {
      missing.FirstName = "First Name is required";
      firstErrorFieldId = "FirstName";
    }

    const remarkVal = String(state?.Remark ?? state?.Remarks ?? "").trim();
    if (!remarkVal) {
      missing.Remark = "Reason to Change is required";
      missing.Remarks = "Reason to Change is required";
      if (!firstErrorFieldId) firstErrorFieldId = "Remark";
      requestAnimationFrame(() => {
        const el = document.getElementById("Remark") || document.getElementById("Remarks");
        if (el) {
          el.setAttribute("aria-invalid", "true");
          el.classList.add("error", "border-danger", "is-invalid");
          el.setAttribute("title", "Reason to Change is required");
        }
      });
    }

    // The ID proof number has to match the Id Type that is selected. Without this
    // a PAN entered under Aadhaar saved happily, and switching the type left the
    // previous type's number in place unchecked. Reuses the same rule patient
    // registration applies, so the two screens cannot drift apart.
    const identityCheck = validateIdentityProof(
      state?.PatientIDProof,
      state?.PatientIDProofNo,
    );
    if (!identityCheck.isValid) {
      missing.IdType = identityCheck.message;
      missing.PatientIDProofNo = identityCheck.message;
      if (!firstErrorFieldId) firstErrorFieldId = "PatientIDProofNo";
    }

    // Blank email is allowed; a non-empty value must be a real address so
    // "bad-email-value" (and similar) cannot be persisted from this screen.
    const emailCheck = validateEmail(state?.Email);
    if (!emailCheck.isValid) {
      missing.Email = emailCheck.message;
      if (!firstErrorFieldId) firstErrorFieldId = "Email";
    }

    // EPD-070/071: blank OK; non-empty must be exactly 6 digits
    const pincodeCheck = validatePincode(state?.PinCode);
    if (!pincodeCheck.isValid) {
      missing.PinCode = pincodeCheck.message;
      if (!firstErrorFieldId) firstErrorFieldId = "PinCode";
    }

    // EPD-146: Address bounded — never silently truncated (max 50 chars)
    const addressCheck = validateAddress(state?.HouseNo);
    if (!addressCheck.isValid) {
      missing.HouseNo = addressCheck.message;
      missing.Address = addressCheck.message;
      if (!firstErrorFieldId) firstErrorFieldId = "HouseNo";
    }

    if (Object.keys(missing).length > 0) {
      setMoreErrors(missing);
      toast.error(Object.values(missing)[0]);
      const element = document.getElementById(firstErrorFieldId);
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "center" });
        const input = element.querySelector("input, select, textarea");
        if (input) input.focus();
        else element.focus();
      }
      return false;
    }

    setMoreErrors({});
    return true;
  };


  // const getFieldErrorClass = (id) => {
  //   const isError = moreErrors[id];
  //   const controller = controllerDynamicList.find(
  //     (item) => item.ControlDisplayID === id,
  //   );
  //   const isMandatoryEmpty =
  //     controller?.IsMandatory === 1 &&
  //     controller?.IsShow === 1 &&
  //     !getFieldValue(id);
  //   let classes = "";
  //   if (isError || isMandatoryEmpty) classes += "mandatory_field ";
  //   if (isError) classes += "error border-danger ";
  //   return classes.trim();
  // };


  // Only First Name is treated as mandatory on this edit page - every other
  // field only shows an error class if it actually failed validation.
  const getFieldErrorClass = (id) => {
    const hasError =
      !!moreErrors[id] ||
      ((id === "Remark" || id === "Remarks") && (!!moreErrors?.Remark || !!moreErrors?.Remarks));

    if (id === "Remark" || id === "Remarks") {
      const val = state?.Remark ?? state?.Remarks;
      const isEmpty = val === undefined || val === null || String(val).trim() === "";
      let classes = "";
      if (isEmpty) classes += "mandatory_field ";
      if (hasError) classes += "error border-danger ";
      return classes.trim();
    }

    if (id !== "FirstName") {
      return hasError ? "error border-danger" : "";
    }

    const isMandatoryEmpty =
      state?.FirstName === undefined ||
      state?.FirstName === null ||
      String(state?.FirstName).trim() === "";

    let classes = "";
    if (isMandatoryEmpty) classes += "mandatory_field ";
    if (hasError) classes += "error border-danger ";
    return classes.trim();
  };

  const FieldError = ({ id }) => {
    return moreErrors[id] ? (
      <div
        className="error-message text-danger small"
        style={{ fontSize: "10px" }}
      >
        {moreErrors[id]}
      </div>
    ) : null;
  };

  const { errors, handleBlur, Touched, handleSubmit } = useFormik({
    initialValues: state,
    enableReinitialize: true,
    onSubmit: async (values) => {
      console.log("values", values);
      if (!validateMandatoryFields()) return;
      const copyValues = { ...values };
      delete copyValues["NikshayID"];
      delete copyValues["referlabid"];
      delete copyValues["ReferLabId"];
      delete copyValues["referLabID"];
      delete copyValues["referLabName"];
      delete copyValues["ReferLabName"];

      const selectedRefLabItem = referalLab?.find(
        (item) => String(item?.value) === String(selectedReferLab),
      );

      // Resolve referred doctor before save. Typing without picking left
      // DoctorID as 0/"" and either failed JSON binding or silently fell
      // through — lock an exact Name match (e.g. SELF) when present.
      // If the operator never touched the doctor field, keep the loaded ID so
      // single-field edits (Locality, etc.) leave Referred Doctor untouched.
      let resolvedDoctorId = Number(state?.DoctorID ?? values?.DoctorID) || 0;
      let resolvedDoctorName =
        String(state?.DoctorName || formData?.DoctorName || DefaultDoc || "").trim();
      if (
        !resolvedDoctorId &&
        resolvedDoctorName &&
        resolvedDoctorName.toLowerCase() !== "others"
      ) {
        const typed = resolvedDoctorName.split("~")[0].trim().toUpperCase();
        const match = (Array.isArray(doctorSuggestion) ? doctorSuggestion : []).find(
          (d) => String(d?.Name || "").trim().toUpperCase() === typed,
        );
        if (match) {
          resolvedDoctorId = Number(match.DoctorReferalID) || 0;
          resolvedDoctorName = String(match.Name || "").trim();
        } else if (typed === "SELF") {
          // DoctorReferalID 1 is the reserved SELF row — use it when the
          // operator typed/selected SELF but suggestions were already closed.
          resolvedDoctorId = 1;
          resolvedDoctorName = "SELF";
        }
      }
      if (!resolvedDoctorId && loadedDoctorRef.current?.id) {
        resolvedDoctorId = Number(loadedDoctorRef.current.id) || 0;
        if (!resolvedDoctorName) {
          resolvedDoctorName = loadedDoctorRef.current.name || "";
        }
      }

      if (DefaultCurrencyName == "KES" && resolvedDoctorId == 1) {
        if (!state?.ReferDoctorRemarks) {
          toast.error("please fill the ReferDoctorRemarks")
          return;
        }
      }

      const data = DynamicFieldValidations();
      console.log("datass", data);
      setVisibleFields(data);
      const flag = data.filter((ele) => ele?.isError === true);
      console.log("flagss", flag);
      if (flag.length === 0) {
        setLoad(true);
        await axiosInstance
          .post("Demographic/RegistrationEditData", {
            PatientData: getTrimmedData({
              ...copyValues,
              CentreID: state?.CentreID,
              VisitType: copyValues.VisitType != null ? String(copyValues.VisitType) : "",
              nikshayID: values?.NikshayID || nikshayID || "",
              trfNo: trfNo || "",
             SecondReferDoctor: state?.SecondReferDoctor,
              PName: handlePName(values),
              PinCode: values?.PinCode ?? "",
              Age: `${values?.AgeYear === "" ? 0 : values?.AgeYear} Y ${values?.AgeMonth === "" ? 0 : values?.AgeMonth} M ${values?.AgeDays === "" ? 0 : values?.AgeDays} D`,
              AgeDays: values?.AgeDays === "" ? "0" : values?.AgeDays,
              AgeMonth: values?.AgeMonth === "" ? "0" : values?.AgeMonth,
              AgeYear: values?.AgeYear === "" ? "0" : values?.AgeYear,
              CollectionBoyID: Number(selectedBoy || 0),
              CollectionBoyName: String(
                collectionBoy.find((boy) => boy.value === selectedBoy)?.label ||
                "",
              ),
              referlabid: Number(
                selectedRefLabItem?.value ||
                selectedReferLab ||
                0,
              ),
              referlabname: String(
                selectedRefLabItem?.label ||
                referalBoyPayload?.refralBoyName ||
                "",
              ),
              DoctorID: resolvedDoctorId,
              DoctorName: resolvedDoctorName,
              remark: state?.Remark || "",
              patientGuid: demographicFormFilePath || "",
              SampleCollectionDate: utcDate().toISOString(),
              NoOfChildren: Pndt?.NoOfChildren || "",
              NoOfSon: Pndt?.NoOfSon || "",
              NoOfDaughter: Pndt?.NoOfDaughter || "",
              Pregnancy:
                Pndt?.Pregnancy === "" || !Pndt?.Pregnancy
                  ? "0001-01-01"
                  : moment(Pndt?.Pregnancy).format("YYYY-MM-DD"),
              AgeOfSon: Pndt?.AgeOfSon || "",
              IsPndt: Pndt?.PNDT ? 1 : 0,
              CollectionCharges: state?.CollectionCharges,
              OtherDoctorName: resolvedDoctorId === 2 ? state?.OtherDoctorName : "",
              ExpectedDtUpdate:
                state?.PatientDtUpdate ||
                patientEditBaselineRef.current?.PatientDtUpdate ||
                "",
            }),
            PatientEditBaseline: patientEditBaselineRef.current,
          })
          .then((res) => {
            if (!res?.data?.success) {
              toast.error(res?.data?.message);
              return;
            }
            toast.success(res?.data?.message || t("Record Saved Successfully."));
            // Tell the screen underneath to re-read the patient. It previously
            // just closed, so the grid row and the patient header kept the values
            // from before the edit until the user ran the search again - a saved
            // change that looked like it had not been saved.
            if (typeof onSaved === "function") {
              onSaved();
            }
            if (typeof onHideModal === "function") {
              onHideModal();
            } else {
              navigate("/receiptreprint");
            }
          })
          .catch((err) =>
            toast.error(
              err?.response?.data?.message ||
                err?.message ||
                t("Something went wrong."),
            ),
          )
          .finally(() => setLoad(false));
      } else {
        toast.error(t("Please fill all mandatory fields marked in red"));
      }
    },
  });

  const handleDOBCalculation = (e) => {
    const { name, value } = e.target;
    setMoreErrors((prev) => ({ ...prev, [name]: "", DOB: "" }));
    const years = name === "AgeYear" ? value : state.AgeYear || 0;
    const months = name === "AgeMonth" ? value : state.AgeMonth || 0;
    const days = name === "AgeDays" ? value : state.AgeDays || 0;
    const dob = moment()
      .subtract(years, "years")
      .subtract(months, "months")
      .subtract(days, "days")
      .toDate();
    setState((prev) => ({
      ...prev,
      [name]: value,
      DOB: dob,
      TotalAgeInDays: moment().diff(dob, "days"),
    }));
    setDateData({ AgeYear: dob, AgeMonth: dob, AgeDays: dob });
  };

  // const handleMainChange = (e) => {
  //   const { name, value, type, checked } = e.target;
  //   setMoreErrors((prev) => ({ ...prev, [name]: "" }));
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
    // Email / PinCode / Remark / HouseNo own their validation — clearing here wiped Tab/blur flags
    if (!["Email", "PinCode", "Remark", "Remarks", "HouseNo", "Address"].includes(name)) {
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
          ? checked ? 1 : 0
          : ["FirstName", "MiddleName", "LastName"].includes(name)
            ? value.toUpperCase()
            : value,
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setMoreErrors((prev) => ({ ...prev, [name]: "" }));
    setState((prev) => ({ ...prev, [name]: value }));
    if (name === "NikshayID") setNikshayID(value);
    else if (name === "trfNo") setTrfNo(value);
  };

  const handleLTData = (e) => {
    const { name, value } = e.target;
    setMoreErrors((prev) => ({ ...prev, [name]: "" }));
    setState({ ...state, [name]: value });
  };

  const calculateDOB = (value) => {
    var TodayDate = moment(new Date()).format("YYYY,MM,DD");
    var DOBDate = moment(value).format("YYYY,MM,DD");
    var a = moment(TodayDate);
    var b = moment(DOBDate);
    var years = a.diff(b, "year");
    b.add(years, "years");
    var months = a.diff(b, "months");
    b.add(months, "months");
    var days = a.diff(b, "days");
    days = years === 0 && months === 0 && days === 0 ? 1 : days;
    return { years, months, days };
  };

  const handleDateFunction = (value) => {
    const { year, month, days } = value;
    const yearDiff = moment().subtract(year, "years")?._d;
    const monthDiff = moment(yearDiff).subtract(month, "months")?._d;
    const daysDiff = moment(monthDiff).subtract(days, "days")?._d;
    return { AgeYear: yearDiff, AgeMonth: monthDiff, AgeDays: daysDiff };
  };

  const calculateTotalNumberOfDays = (value) =>
    moment(moment().format("YYYY-MM-DD")).diff(value, "days");

  const dateSelect = (value, name) => {
    setMoreErrors((prev) => ({ ...prev, [name]: "" }));
    const { years, months, days } = calculateDOB(value);
    setState({
      ...state,
      [name]: value,
      AgeYear: years,
      AgeMonth: months,
      AgeDays: days,
      TotalAgeInDays: calculateTotalNumberOfDays(value),
    });
    const dateForFields = handleDateFunction({
      year: years,
      month: months,
      days,
    });
    setDateData({
      AgeYear: dateForFields?.AgeYear,
      AgeMonth: dateForFields?.AgeMonth,
      AgeDays: dateForFields?.AgeDays,
    });
  };

  const handleDatePNDT = (value, name) => setPndt({ ...Pndt, [name]: value });
  const handlePNDTChange = (e) => {
    const { name, value } = e.target;
    setPndt({ ...Pndt, [name]: value });
  };
  const handlePNDT = () => {
    setPndt({
      ...Pndt,
      PNDT: !Pndt?.PNDT,
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

  const getSampleSource = () => {
    axiosInstance
      .get("PatientRegistration/GetAllSampleSources")
      .then((res) => {
        if (res?.data?.success) {
          const data = res?.data?.message;
          const finalData = data?.map((ele) => ({
            value: ele.sampleSourceId,
            label: ele.sampleSourceName,
          }));
          setSampleSource(finalData);
        } else setSampleSource([]);
      })
      .catch((err) => console.log(err));
  };

  const getProEmployee = () => {
    axiosInstance
      .get("Employee/ProEmployee")
      .then((res) => {
        let data = res?.data?.message;
        let proData = data?.map((ele) => ({
          value: ele?.EmployeeID,
          label: ele?.EmployeeName,
        }));
        setProEmployee(proData);
      })
      .catch((err) => console.log(err));
  };

  const getVisitType = async () => {
    await axiosInstance
      .get("Centre/visitTypeList")
      .then((res) => {
        let data = res.data.message;
        let Visit = data.map((ele) => ({
          value: ele.FieldID,
          label: ele.FieldDisplay,
        }));
        // setVisitType(Visit);
      })
      .catch((err) => console.log(err));
  };

  const EditPatientDetail = (LabNo) => {
    setLoad(true);
    axiosInstance
      .post("Demographic/getDataEditByLabNo", { LabNo: LabNo })
      .then((res) => {
        if (!res?.data?.success) {
          toast.error(res?.data?.message || "Something went wrong");
          setLoad(false);
          return;
        }
        if (res?.data?.message?.patientDetail.length > 0) {
          const detail = res?.data?.message?.patientDetail[0];
          if (detail?.referlabid) setSelectedReferLab(detail?.referlabid);
          patientEditBaselineRef.current = {
            Email: detail?.Email ?? "",
            City: detail?.City ?? "",
            Locality: detail?.Locality ?? "",
            HouseNo: detail?.HouseNo ?? "",
            StreetName: detail?.StreetName ?? "",
            State: detail?.State ?? "",
            Country: detail?.Country ?? "",
            PinCode: detail?.PinCode ?? detail?.Pincode ?? "",
            Mobile: detail?.Mobile ?? "",
            Phone: detail?.Phone ?? "",
            SecondaryNumber: detail?.SecondaryNumber ?? "",
            FirstName: detail?.FirstName ?? "",
            MiddleName: detail?.MiddleName ?? "",
            LastName: detail?.LastName ?? "",
            Title: detail?.Title ?? "",
            Gender: detail?.Gender ?? "",
            PatientDtUpdate: detail?.PatientDtUpdate ?? "",
          };
          setState({
            ...detail,
            DOB: new Date(detail?.DOB),
            SampleCollectionDate: new Date(detail?.SampleCollectionDate),
            BTB: detail?.BTB,
            AgeYear: detail?.AgeYear?.toString(),
            AgeDays: detail?.AgeDays?.toString(),
            AgeMonth: detail?.AgeMonth?.toString(),
            VisitType: detail?.VisitType != null ? String(detail.VisitType) : "",
            Remark: detail?.Remarks || detail?.remarks || "",
            // DoctorID 2 is the "Others" sentinel - lt.DoctorName already holds
            // the real typed name in that case (see RegistrationEditData /
            // SaveRegData), so re-opening the Other Doctor modal starts
            // pre-filled instead of blank.
            OtherDoctorName: Number(detail?.DoctorID) === 2 ? (detail?.DoctorName || "") : "",
            PatientDtUpdate: detail?.PatientDtUpdate || "",
          });

          const awsCount = Number(detail?.AwsKeyCount) || 0;
          setExistingDemographicFileCount(awsCount);
          const parsedAwsKeys = (() => {
            try { return JSON.parse(detail?.AwsKeys || "[]"); } catch { return []; }
          })();
          setDemographicAwsKeys(parsedAwsKeys);
          if (awsCount > 0 && parsedAwsKeys.length > 0) {
            setDemographicFormFilePath(parsedAwsKeys[0]);
          }
          getAccessDataRate(setRateType, detail?.CentreID);
          setTrfNo(detail?.TRFNo || "");
          setNikshayID(detail?.NikshayID || "");
          setDefaultDoc(detail.DoctorName || "");
          loadedDoctorRef.current = {
            id: Number(detail?.DoctorID) || 0,
            name: String(detail?.DoctorName || "").trim(),
          };
          setSelectedBoy(detail?.CollectionBoyID || "");
          setPayload({
            collectionBoyID: detail?.CollectionBoyID || "",
            collectionBoyName: detail?.CollectionBoyName || "",
          });
          // if (detail?.SecondReferDoctor)
          //   setFormData((prev) => ({
          //     ...prev,
          //     SecondReferDoctor: detail?.SecondReferDoctor,
          //   }));
          if (detail?.SecondReferDoctor) {
            setFormData((prev) => ({
              ...prev,
              SecondReferDoctor: detail?.SecondReferDoctorName,
            }));
            // setState((prev) => ({
            //   ...prev,
            //   SecondReferDoctor: detail?.SecondReferDoctor,
            // }));
          }
          if (detail?.NoOfChildren || detail?.NoOfSon || detail?.NoOfDaughter) {
            setPndt({
              PNDT: true,
              NoOfChildren: detail?.NoOfChildren || "",
              NoOfSon: detail?.NoOfSon || "",
              NoOfDaughter: detail?.NoOfDaughter || "",
              Pregnancy: detail?.Pregnancy || "",
              AgeOfSon: detail?.AgeOfSon || "",
              AgeOfDaughter: detail?.AgeOfDaughter || "",
              PNDTDoctor: detail?.PNDTDoctor || "",
              Husband: detail?.Husband || "",
            });
          }
          const parsedDate = parseBackendDate(detail?.SampleCollectionDate);
          setSampleCollectionDateTime({
            data: parsedDate,
            time: `${String(parsedDate.getHours()).padStart(2, "0")}:${String(parsedDate.getMinutes()).padStart(2, "0")}:00`,
          });
        }
        setDateData({
          AgeYear: moment().subtract(
            res?.data?.message?.patientDetail[0]?.AgeYear?.toString(),
            "years",
          )?._d,
          AgeDays: moment(
            moment().subtract(
              res?.data?.message?.patientDetail[0]?.AgeMonth?.toString(),
              "years",
            )?._d,
          ).subtract(
            res?.data?.message?.patientDetail[0]?.AgeDays?.toString(),
            "days",
          )?._d,
          AgeMonth: moment(
            moment().subtract(
              res?.data?.message?.patientDetail[0]?.AgeYear?.toString(),
              "years",
            )?._d,
          ).subtract(
            res?.data?.message?.patientDetail[0]?.AgeMonth?.toString(),
            "months",
          )?._d,
        });
        setLoad(false);
      })
      .catch((err) => {
        setLoad(false);
        console.log(err);
      });
  };

  const getDropDownData = (name) => {
    const match = ["Title", "Gender", "BankName", "Identity"];
    axiosInstance
      .post("Global/getGlobalData", { Type: name })
      .then((res) => {
        let data = res.data.message;
        let value = data.map((ele) => ({
          value: match.includes(name) ? ele.FieldDisplay : ele.FieldID,
          label: ele.FieldDisplay,
        }));
        switch (name) {
          case "Gender":
            setGender(
              value
                ?.filter((option) => option?.value !== "Both")
                .map((option) => ({
                  value: option?.value,
                  label: option?.label,
                })),
            );
            break;
          case "Title":
            setTitle(value);
            break;
          case "Identity":
            setIdentity(value);
            break;
          case "BankName":
            setBankName(value);
            break;
          case "PaymentMode":
            setPaymentMode(value);
            break;
          default:
            break;
        }
      })
      .catch((err) => console.log(err));
  };

  const handleDateTime = (time, name) =>
    setSampleCollectionDateTime((prev) => ({ ...prev, [name]: time }));

  const handleIndex = (e) => {
    const { name } = e.target;
    const safeDoctorSuggestions = Array.isArray(doctorSuggestion)
      ? doctorSuggestion
      : [];
    const safeSecondDoctorSuggestions = Array.isArray(seconddoctorSuggestion)
      ? seconddoctorSuggestion
      : [];
    const scrollToIndex = () => {
      setTimeout(() => {
        const el = document.querySelector(".matchIndex");
        if (el) el.scrollIntoView({ block: "nearest" });
      }, 0);
    };
    switch (name) {
      case "DoctorName":
        switch (e.which) {
          case 38:
            setIndexMatch((prev) =>
              prev !== 0 ? prev - 1 : safeDoctorSuggestions.length - 1,
            );
            scrollToIndex();
            break;
          case 40:
            setIndexMatch((prev) =>
              safeDoctorSuggestions.length - 1 === prev ? 0 : prev + 1,
            );
            scrollToIndex();
            break;
          case 13:
            e.preventDefault();
            if (safeDoctorSuggestions.length > 0)
              handleListSearch(safeDoctorSuggestions[indexMatch] || "", name);
            setIndexMatch(0);
            break;
          case 9:
            if (safeDoctorSuggestions.length > 0) {
              const idx = indexMatch >= 0 ? indexMatch : 0;
              if (safeDoctorSuggestions[idx])
                handleListSearch(safeDoctorSuggestions[idx], "DoctorName");
            }
            break;
          default:
            break;
        }
        break;
      case "SecondReferDoctor":
        switch (e.which) {
          case 38:
            setIndexMatch((prev) =>
              prev !== 0 ? prev - 1 : safeSecondDoctorSuggestions.length - 1,
            );
            scrollToIndex();
            break;
          case 40:
            setIndexMatch((prev) =>
              safeSecondDoctorSuggestions.length - 1 === prev ? 0 : prev + 1,
            );
            scrollToIndex();
            break;
          case 13:
            e.preventDefault();
            if (safeSecondDoctorSuggestions.length > 0)
              handleListSearch(
                safeSecondDoctorSuggestions[indexMatch] || "",
                name,
              );
            setIndexMatch(0);
            break;
          default:
            break;
        }
        break;
      case "ReferLabId":
        switch (e.which) {
          case 38:
            if (refLabSuggestions?.length > 0) {
              setIndexMatch((prev) => (prev > 0 ? prev - 1 : refLabSuggestions.length - 1));
              scrollToIndex();
            }
            break;
          case 40:
            if (refLabSuggestions?.length > 0) {
              setIndexMatch((prev) => (prev === refLabSuggestions.length - 1 ? 0 : prev + 1));
              scrollToIndex();
            }
            break;
          case 13:
            e.preventDefault();
            if (refLabSuggestions?.length > 0) {
              const idx = indexMatch >= 0 ? indexMatch : 0;
              const lab = refLabSuggestions[idx];
              if (lab) {
                setSelectedReferLab(lab.value);
                setRefralBoyPayload((prev) => ({ ...prev, referalBoyID: lab.value, refralBoyName: lab.label }));
                setRefLabSearchText(lab.label);
                setRefLabDropShow(false);
                setRefLabSuggestions([]);
                setMoreErrors((prev) => ({ ...prev, ReferLabId: "" }));
              }
            }
            setIndexMatch(-1);
            break;
          case 9:
            if (refLabSuggestions?.length > 0) {
              const idx = indexMatch >= 0 ? indexMatch : 0;
              const lab = refLabSuggestions[idx];
              if (lab) {
                setSelectedReferLab(lab.value);
                setRefralBoyPayload((prev) => ({ ...prev, referalBoyID: lab.value, refralBoyName: lab.label }));
                setRefLabSearchText(lab.label);
                setRefLabDropShow(false);
                setRefLabSuggestions([]);
                setMoreErrors((prev) => ({ ...prev, ReferLabId: "" }));
              }
            }
            break;
          default:
            break;
        }
        break;
      default:
        break;
    }
  };

  useEffect(() => {
    if (reprintLabNo || location?.state?.data) {
      setLabNo(reprintLabNo || location?.state?.data);
      EditPatientDetail(reprintLabNo || location?.state?.data);
    }
  }, []);


  useEffect(() => {
    controllerDynamic();
    getAccessCentres(setCentreData);
    getDropDownData("Gender");
    getDropDownData("Title");
    getDropDownData("Identity");
    getDropDownData("PaymentMode");
    getDropDownData("BankName");
    ReferalLab();
    getSampleSource();
    getProEmployee();
    GetGlobalData(setVisitType, "VisitType");
    getPaymentModes("PatientSource", setPatientSource);
    getPaymentModes("PatientType", setPatientType);
  }, []);

  // ─── Render field by controllerDynamicList item (dynamic, like PatientRegistration) ─────
  const renderField = (item) => {
    const isMandatory = item?.IsMandatory === 1;

    if (item?.ControlDisplayID === "CentreID") {
      return (
        <SelectBox
          options={CentreData}
          name="CentreID"
          lable="Centre"
          selectedValue={state?.CentreID}
          onChange={handleSelectChange}
          isDisabled
          className={getFieldErrorClass("CentreID")}
        />
      );
    }

    if (item?.ControlDisplayID === "RateID") {
      return (
        <SelectBox
          options={RateType}
          selectedValue={state?.RateID}
          name="RateID"
          lable="RateType"
          onChange={handleSelectChange}
          isDisabled
          className={getFieldErrorClass("RateID")}
        />
      );
    }

    if (item?.ControlDisplayID === "VisitType") {
      return (
        <ReactSelect
          name="VisitType"
          id="VisitType"
          removeIsClearable={true}
          dynamicOptions={VisitType}
          placeholderName={t("VisitType")}
          label={t("VisitType")}
          value={state?.VisitType}
          onChange={handleSearchSelectChange}
          className={getFieldErrorClass("VisitType")}
        />
      );
    }

    if (item?.ControlDisplayID === "RegistrationDate") {
      return (
        <DatePicker
          className={`custom-calendar ${getFieldErrorClass("RegistrationDate")}`}
          name="RegistrationDate"
          id="RegistrationDate"
          lable={t("Registration Date")}
          value={
            state?.RegistrationDate
              ? new Date(state.RegistrationDate)
              : new Date()
          }
          onChange={(value, name) =>
            setState((prev) => ({ ...prev, [name]: value }))
          }
        />
      );
    }

    if (item?.ControlDisplayID === "Mobile") {
      return (
        <>
          <Input
            name="Mobile"
            type="number"
            onInput={(e) => number(e, DefaultCurrencyName === "KES" ? 14 : 10)}
            value={state.Mobile}
            lable="Mobile Number"
            placeholder=" "
            onBlur={handleBlur}
            onChange={handleMainChange}
            min={DefaultCurrencyName === "KES" ? 9 : 10}
            className={`required-fields ${getFieldErrorClass("Mobile")}`}
          />
          <FieldError id="Mobile" />
        </>
      );
    }

    if (item?.ControlDisplayID === "SecondaryMobile") {
      return (
        <>
          <Input
            name="SecondaryNumber"
            type="number"
            onInput={(e) => number(e, DefaultCurrencyName === "KES" ? 14 : 10)}
            value={state.SecondaryNumber}
            lable="Alternate Phone Number"
            placeholder=" "
            onChange={handleMainChange}
            className={getFieldErrorClass("SecondaryNumber")}
          />
          <FieldError id="SecondaryNumber" />
        </>
      );
    }

    if (item?.ControlDisplayID === "Title") {
      return (
        <>
          <div className="d-flex">
            <div style={{ width: "50%" }}>
              <SelectBox
                options={Title}
                name="Title"
                lable="Title"
                selectedValue={state?.Title}
                onChange={handleSelectNew}
                className={`required-fields ${getFieldErrorClass("Title")}`}
              />
            </div>
            <div style={{ width: "50%" }}>
              <Input
                lable="First Name"
                name="FirstName"
                type="text"
                placeholder=" "
                max={35}
                id="FirstName"
                value={state?.FirstName}
                onChange={handleMainChange}
                onBlur={handleBlur}
                className={`required-fields ${getFieldErrorClass("FirstName")}`}
              />
            </div>
          </div>
          <FieldError id="Title" />
          <FieldError id="FirstName" />
        </>
      );
    }

    if (item?.ControlDisplayID === "MiddleName") {
      return (
        <>
          <Input
            className={`required-fields select-input-box form-control input-sm ${getFieldErrorClass("MiddleName")}`}
            id="MiddleName"
            name="MiddleName"
            lable="Middle Name"
            placeholder=" "
            type="text"
            value={state?.MiddleName}
            max={35}
            onChange={handleMainChange}
          />
          <FieldError id="MiddleName" />
        </>
      );
    }

    if (item?.ControlDisplayID === "LastName") {
      return (
        <>
          <Input
            id="LastName"
            max={50}
            lable="Last Name"
            name="LastName"
            placeholder=" "
            type="text"
            value={state?.LastName}
            onChange={handleMainChange}
            className={`required-fields ${getFieldErrorClass("LastName")}`}
          />
          <FieldError id="LastName" />
        </>
      );
    }

    if (item?.ControlDisplayID === "DOB") {
      return (
        <>
          <DatePicker
            name="DOB"
            className={`custom-calendar ${getFieldErrorClass("DOB")}`}
            value={state?.DOB}
            onBlur={handleBlur}
            onChange={dateSelect}
            id="DOB"
            lable="DOB"
            maxDate={new Date()}
          />
          <FieldError id="DOB" />
        </>
      );
    }

    if (item?.ControlDisplayID === "AgeYear") {
      return (
        <>
          <div className="p-inputgroup flex-1">
            <Input
              placeholder="Years"
              type="number"
              id="AgeYear"
              name="AgeYear"
              value={state?.AgeYear}
              onInput={(e) => number(e, 3, 120)}
              onChange={handleDOBCalculation}
              className={`required-fields ${getFieldErrorClass("AgeYear")}`}
            />
            <Input
              placeholder="Months"
              type="number"
              id="AgeMonth"
              name="AgeMonth"
              value={state?.AgeMonth}
              onInput={(e) => number(e, 2, 12)}
              onChange={handleDOBCalculation}
              className={`required-fields ${getFieldErrorClass("AgeMonth")}`}
            />
            <Input
              placeholder="Days"
              type="number"
              id="AgeDays"
              name="AgeDays"
              value={state?.AgeDays}
              onInput={(e) => number(e, 2, 31)}
              onChange={handleDOBCalculation}
              className={`required-fields ${getFieldErrorClass("AgeDays")}`}
            />
          </div>
          <FieldError id="AgeYear" />
        </>
      );
    }

    if (
      item?.ControlDisplayID === "AgeMonth" ||
      item?.ControlDisplayID === "AgeDays"
    ) {
      return null;
    }

    if (item?.ControlDisplayID === "Gender") {
      return (
        <>
          <SelectBox
            options={Gender}
            id="Gender"
            lable="Gender"
            isDisabled={
              [
                "Baby",
                "Baby of",
                "Baby Of",
                "BabyOf",
                "Babyof",
                "Master",
                "B/0",
                "C/O",
                "S/O",
                "Dr.",
                "Baby of.",
                "Other",
                "Cat",
                "Dog",
                "Feline",
                "Equine",
                "Bovine",
                "Porcine",
                "Caprine",
                "Avian",
                "Ovine",
              ]
                .map((t) => t.toLowerCase())
                .includes(state?.Title?.trim().toLowerCase())
                ? false
                : !!state?.Title
            }
            name="Gender"
            selectedValue={state?.Gender}
            onChange={handleSelectChange}
            className={`required-fields ${getFieldErrorClass("Gender")}`}
          />
          <FieldError id="Gender" />
        </>
      );
    }

    if (item?.ControlDisplayID === "Weight") {
      return (
        <>
          <Input
            lable={t("Weight(Kg)")}
            max={30}
            type="text"
            value={state?.Weight}
            onChange={handleMainChange}
            name="Weight"
            placeholder=" "
            id="Weight"
            className={getFieldErrorClass("Weight")}
          />
          <FieldError id="Weight" />
        </>
      );
    }

    if (item?.ControlDisplayID === "BMI") {
      return (
        <>
          <Input
            lable={t("BMI")}
            max={30}
            type="text"
            value={state?.BMI}
            onChange={handleMainChange}
            name="BMI"
            placeholder=" "
            id="BMI"
            className={getFieldErrorClass("BMI")}
          />
          <FieldError id="BMI" />
        </>
      );
    }

    if (item?.ControlDisplayID === "DoctorName") {
      const getDoctorDropStyle = () => {
        const el = document.getElementById("DoctorName_wrapper");
        if (!el) return {};
        const rect = el.getBoundingClientRect();
        return { position: "fixed", top: rect.bottom, left: rect.left, width: rect.width, zIndex: 999999 };
      };
      return (
        <>
          <div className="p-inputgroup d-flex" style={{ position: "relative" }}>
            <div id="DoctorName_wrapper" style={{ width: "87%" }}>
              <Input
                autoComplete="off"
                lable="Referred Doctor"
                name="DoctorName"
                type="text"
                id="DoctorName"
                value={DefaultDoc ? DefaultDoc : formData?.DoctorName}
                onChange={(e) => {
                  const val = e.target.value;
                  // Typing "others" locks in the fixed sentinel doctor
                  // (ID 2 / "Others") instantly and opens a modal for the
                  // actual doctor name (state.OtherDoctorName) instead of
                  // requiring a suggestion pick — same as PatientRegistration.
                  const isOthers = val.trim().toLowerCase() === "others";
                  if (val === "") {
                    setFormData({ ...formData, DoctorName: "" });
                  } else {
                    setFormData({ ...formData, DoctorName: val });
                  }
                  setState((prev) => ({
                    ...prev,
                    // Use 0 (not "") so RegistrationEditData always receives a
                    // numeric DoctorID — empty string can fail JSON→int binding.
                    DoctorID: isOthers ? 2 : 0,
                    DoctorName: isOthers ? "Others" : "",
                    OtherDoctorName: isOthers ? prev.OtherDoctorName : "",
                  }));
                  setDefaultDoc("");
                  if (isOthers) {
                    // Field locked in - close dropdown immediately so
                    // Tab/blur don't accidentally re-select an old item.
                    safeSetDoctorSuggestion([]);
                    setDropFalse(false);
                    setIndexMatch(-1);
                    setShowOtherDoctorModal(true);
                  } else {
                    setDropFalse(true);
                  }
                  setMoreErrors((prev) => ({ ...prev, DoctorName: "" }));
                }}
                onBlur={() => {
                  setIndexMatch(-1);
                  // Delay close so a mousedown on a suggestion can land first
                  // (blur fires before click when the pointer leaves the input).
                  setTimeout(() => {
                    safeSetDoctorSuggestion([]);
                    setDropFalse(false);
                    setState((prev) => {
                      if (!prev.DoctorID) {
                        setFormData((fd) => ({ ...fd, DoctorName: "" }));
                        return prev;
                      }
                      return prev;
                    });
                  }, 250);
                }}
                onKeyDown={handleIndex}
                className={`required-fields ${getFieldErrorClass("DoctorName")}`}
              />
              {dropFalse &&
                Array.isArray(doctorSuggestion) &&
                doctorSuggestion.length > 0 &&
                formData.DoctorName && (
                  <ul
                    className="suggestion-data"
                    style={{
                      ...getDoctorDropStyle(),
                      background: "#fff",
                      border: "1px solid #ddd",
                      listStyle: "none",
                      padding: 0,
                      margin: 0,
                      maxHeight: 200,
                      overflowY: "auto",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                    }}
                  >
                    {doctorSuggestion.map((data, index) => {
                      const dept =
                        data?.Department ||
                        data?.DeptName ||
                        data?.Dept ||
                        data?.dept ||
                        "";
                      const spec =
                        data?.Specialization ||
                        data?.Speciality ||
                        data?.Spec ||
                        data?.spec ||
                        "";
                      const doctorName = String(data?.Name || "").trim();
                      const detailStr = [data?.Mobile, dept, spec]
                        .filter(
                          (i) =>
                            i &&
                            String(i).trim() !== "" &&
                            i !== 0 &&
                            i !== "0",
                        )
                        .join("~");
                      return (
                        <li
                          key={index}
                          onMouseDown={(e) => {
                            e.preventDefault();
                            handleListSearch(data, "DoctorName");
                          }}
                          className={`${index === indexMatch ? "matchIndex" : ""}`}
                          title={detailStr ? `${doctorName}~${detailStr}` : doctorName}
                          style={{
                            padding: "4px",
                            cursor: "pointer",
                            backgroundColor:
                              index === indexMatch ? "#4aa0fcff" : "#fff",
                            color: index === indexMatch ? "#fff" : "#000",
                          }}
                        >
                          {doctorName}
                        </li>
                      );
                    })}
                  </ul>
                )}
            </div>
            <div style={{ width: "10%" }}>
              <Tooltip label={t("Add Referred Doctor")}>
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
          <FieldError id="DoctorName" />
        </>
      );
    }

    if (item?.ControlDisplayID === "ReferDoctorRemark") {
      return (
        <>
          <Input
            name="ReferDoctorRemarks"
            type="text"
            onChange={handleMainChange}
            value={
              state?.ReferDoctorRemarks
            }
            id="ReferDoctorRemarks"
            lable="ReferDoctorRemarks"
            placeholder=" "
            maxLength={50}
          />
        </>
      );
    }

    if (item?.ControlDisplayID === "SecondReferDoctor") {
      const getSecondDoctorDropStyle = () => {
        const el = document.getElementById("SecondReferDoctor_wrapper");
        if (!el) return {};
        const rect = el.getBoundingClientRect();
        return { position: "fixed", top: rect.bottom, left: rect.left, width: rect.width, zIndex: 999999 };
      };
      return (
        <>
          <div className="p-inputgroup d-flex" style={{ position: "relative" }}>
            <div id="SecondReferDoctor_wrapper" style={{ width: "87%" }}>
              <Input
                id="SecondReferDoctor"
                name="SecondReferDoctor"
                lable={t("Second Ref. Doctor")}
                placeholder=" "
                type="text"
                value={formData?.SecondReferDoctor}
                className={getFieldErrorClass("SecondReferDoctor")}
                onChange={(e) => {
                  setFormData((prev) => ({
                    ...prev,
                    SecondReferDoctor: e.target.value,
                  }));
                  setSecondDropFalse(true);
                }}
                onBlur={() => {
                  setIndexMatch(-1);
                  setseconddoctorSuggestion([]);
                  setSecondDropFalse(false);
                }}
                onKeyDown={handleIndex}
              />
              {secondDropFalse &&
                Array.isArray(seconddoctorSuggestion) &&
                seconddoctorSuggestion.length > 0 && (
                  <ul
                    className="suggestion-data"
                    style={{
                      ...getSecondDoctorDropStyle(),
                      background: "#fff",
                      border: "1px solid #ddd",
                      listStyle: "none",
                      padding: 0,
                      margin: 0,
                      maxHeight: 200,
                      overflowY: "auto",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                    }}
                  >
                    {seconddoctorSuggestion.map((data, index) => {
                      const dept =
                        data?.Department ||
                        data?.DeptName ||
                        data?.Dept ||
                        data?.dept ||
                        "";
                      const spec =
                        data?.Specialization ||
                        data?.Speciality ||
                        data?.Spec ||
                        data?.spec ||
                        "";
                      const displayStr = [data?.Name, data?.Mobile, dept, spec]
                        .filter(
                          (i) =>
                            i &&
                            String(i).trim() !== "" &&
                            i !== 0 &&
                            i !== "0",
                        )
                        .join("~");
                      return (
                        <li
                          key={index}
                          onMouseDown={(e) => {
                            e.preventDefault();
                            handleListSearch(data, "SecondReferDoctor");
                          }}
                          className={`${index === indexMatch ? "matchIndex" : ""}`}
                          style={{
                            padding: "4px",
                            cursor: "pointer",
                            backgroundColor:
                              index === indexMatch ? "blue" : "#fff",
                          }}
                        >
                          {displayStr}
                        </li>
                      );
                    })}
                  </ul>
                )}
            </div>
            <div style={{ width: "10%" }}>
              <Tooltip label={t("Add Second Referred Doctor")}>
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
          <FieldError id="SecondReferDoctor" />
        </>
      );
    }

    if (item?.ControlDisplayID === "ReferLabId") {
      const refLabWrapRef = { current: null };
      const getDropdownStyle = () => {
        const el = document.getElementById("ReferLabId_wrapper");
        if (!el) return {};
        const rect = el.getBoundingClientRect();
        return {
          position: "fixed",
          top: rect.bottom + window.scrollY,
          left: rect.left + window.scrollX,
          width: rect.width,
          zIndex: 999999,
        };
      };
      return (
        <div className="d-flex">
          <div
            id="ReferLabId_wrapper"
            className="flex-grow-1 px-0"
            style={{ position: "relative" }}
          >
            <Input
              id="ReferLabId"
              name="ReferLabId"
              lable={t("Ref Lab")}
              type="text"
              value={refLabSearchText}
              className={`required-fields ${getFieldErrorClass("ReferLabId")}`}
              onChange={(e) => {
                const text = e.target.value;
                setRefLabSearchText(text);
                setRefLabDropShow(true);
                if (!text.trim()) {
                  setSelectedReferLab("");
                  setRefralBoyPayload((prev) => ({ ...prev, referalBoyID: "", refralBoyName: "" }));
                  setRefLabSuggestions([]);
                  setIndexMatch(-1);
                  return;
                }
                const searchLower = text.toLowerCase();
                const filtered = referalLab
                  .filter((r) => r.label.toLowerCase().includes(searchLower))
                  .sort((a, b) => {
                    const aL = a.label.toLowerCase();
                    const bL = b.label.toLowerCase();
                    const aStarts = aL.startsWith(searchLower);
                    const bStarts = bL.startsWith(searchLower);
                    if (aStarts && !bStarts) return -1;
                    if (!aStarts && bStarts) return 1;
                    return aL.localeCompare(bL);
                  });
                setRefLabSuggestions(filtered);
                setIndexMatch(filtered.length > 0 ? 0 : -1);
                setMoreErrors((prev) => ({ ...prev, ReferLabId: "" }));
              }}
              onBlur={() => {
                setTimeout(() => {
                  setRefLabDropShow(false);
                  if (selectedReferLab) {
                    const found = referalLab.find((r) => r.value === String(selectedReferLab));
                    if (found) setRefLabSearchText(found.label);
                  } else {
                    setRefLabSearchText("");
                  }
                }, 200);
              }}
              onKeyDown={handleIndex}
            />
            {refLabDropShow && refLabSuggestions.length > 0 && (
              <ul
                style={{
                  ...getDropdownStyle(),
                  background: "white",
                  padding: 0,
                  margin: 0,
                  listStyle: "none",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                  border: "1px solid #ddd",
                  maxHeight: 200,
                  overflowY: "auto",
                }}
              >
                {refLabSuggestions.map((lab, index) => (
                  <li
                    key={lab.value}
                    onMouseDown={(e) => {
                      e.preventDefault();
                      setSelectedReferLab(lab.value);
                      setRefralBoyPayload((prev) => ({ ...prev, referalBoyID: lab.value, refralBoyName: lab.label }));
                      setRefLabSearchText(lab.label);
                      setRefLabDropShow(false);
                      setRefLabSuggestions([]);
                      setIndexMatch(-1);
                      setMoreErrors((prev) => ({ ...prev, ReferLabId: "" }));
                    }}
                    className={index === indexMatch ? "matchIndex" : ""}
                    style={{
                      padding: "4px 8px",
                      cursor: "pointer",
                      backgroundColor: index === indexMatch ? "#1a73e8" : "white",
                      color: index === indexMatch ? "white" : "inherit",
                    }}
                  >
                    {lab.label}
                  </li>
                ))}
              </ul>
            )}
            {item?.IsMandatory === 1 && moreErrors?.["ReferLabId"] && (
              <div className="error-message text-danger small">
                {moreErrors["ReferLabId"]}
              </div>
            )}
          </div>
          <div style={{ width: "10%" }}>
            <button
              type="button"
              className="btn btn-sm btn-primary"
              onClick={() => setToggleRefLabModal(true)}
            >
              <i className="fa fa-plus-circle fa-sm new_record_pluse"></i>
            </button>
          </div>
        </div>
      );
    }

    if (item?.ControlDisplayID === "CollectionBoyId") {
      return (
        <ReactSelect
          name="CollectionBoyId"
          id="CollectionBoyId"
          className={`required-fields ${getFieldErrorClass("CollectionBoyId")}`}
          dynamicOptions={[
            { label: t("Select Collection Boy"), value: "" },
            ...collectionBoy,
          ]}
          placeholderName={t("Collection Boy")}
          value={selectedBoy}
          onChange={handleCollectionBoyChange}
          ref={reactRef}
        />
      );
    }

    if (item?.ControlDisplayID === "SampleBy") {
      return (
        <>
          <ReactSelect
            name="SampleBy"
            id="SampleBy"
            removeIsClearable={true}
            dynamicOptions={SampleSource}
            placeholderName={t("SampleBy")}
            label={t("SampleBy")}
            value={state?.SampleBy}
            onChange={handleSearchSelectChange}
            className={getFieldErrorClass("SampleBy")}
          />
          <FieldError id="SampleBy" />
        </>
      );
    }

    if (item?.ControlDisplayID === "data") {
      return (
        <DatePicker
          showOnFocus={false}
          value={sampleCollectionDateTime?.data}
          name="data"
          placeholder={t("SampleCollectionDate")}
          id="data"
          lable={t("SampleCollectionDate")}
          maxDate={new Date()}
          onChange={handleDateTime}
          className="custom-calendar"
        />
      );
    }

    if (item?.ControlDisplayID === "time") {
      return (
        <CustomTimePicker
          name="time"
          toolTipText={t("SampleCollectionTime")}
          value={sampleCollectionDateTime?.time}
          id="time"
          lable={t("Samp.Time")}
          onChange={handleDateTime}
        />
      );
    }

    if (item?.ControlDisplayID === "IdType") {
      return (
        <>
          <div className="d-flex">
            <div style={{ width: "40%" }}>
              <SelectBox
                options={[{ label: t("Choose ID"), value: "" }, ...Identity]}
                name="PatientIDProof"
                lable="Id Type"
                selectedValue={state?.PatientIDProof}
                id="IdType"
                onChange={handleSelectChange}
                className={getFieldErrorClass("IdType")}
              />
            </div>
            <div style={{ width: "60%" }}>
              <Input
                lable="ID Proof Number"
                name="PatientIDProofNo"
                type="text"
                placeholder=" "
                id="PatientIDProofNo"
                max={20}
                disabled={!String(state?.PatientIDProof || "").trim()}
                value={state?.PatientIDProofNo}
                onChange={handleLTData}
                onBlur={(e) =>
                  revalidateIdentityProof(
                    state?.PatientIDProof,
                    e?.target?.value ?? state?.PatientIDProofNo,
                  )
                }
                className={getFieldErrorClass("PatientIDProofNo")}
              />
            </div>
          </div>
          <FieldError id="IdType" />
          {/* The number carries its own message too, so a malformed PAN or
              Aadhaar is explained next to the field it belongs to. */}
          <FieldError id="PatientIDProofNo" />
        </>
      );
    }

    if (item?.ControlDisplayID === "ProEmployee") {
      return (
        <>
          <SelectBox
            options={[{ label: "Select", value: "" }, ...proEmplyee]}
            name="ProEmployee"
            id="ProEmployee"
            lable={t("Pro Employee")}
            selectedValue={state?.ProEmployee}
            onChange={handleSelectNew}
            className={getFieldErrorClass("ProEmployee")}
          />
          <FieldError id="ProEmployee" />
        </>
      );
    }

    if (item?.ControlDisplayID === "trfNo") {
      return (
        <>
          <Input
            max={30}
            value={trfNo}
            type="text"
            onChange={handleInputChange}
            lable={t("TRF No")}
            name="trfNo"
            id="trfNo"
            placeholder=" "
            className={getFieldErrorClass("trfNo")}
          />
          <FieldError id="trfNo" />
        </>
      );
    }

    if (item?.ControlDisplayID === "HouseNo") {
      const addressError = moreErrors?.HouseNo || moreErrors?.Address;
      const applyAddressValidation = (raw) => {
        const value = raw == null ? "" : String(raw);
        const check = validateAddress(value);
        setMoreErrors((prev) => {
          const next = { ...prev };
          if (check.isValid) {
            delete next.HouseNo;
            delete next.Address;
          } else {
            next.HouseNo = check.message;
            next.Address = check.message;
          }
          return next;
        });
        requestAnimationFrame(() => {
          const el = document.getElementById("HouseNo") || document.getElementById("Address");
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
            id="HouseNo"
            value={state?.HouseNo ?? ""}
            onChange={handleMainChange}
            onBlur={(e) => {
              applyAddressValidation(e?.target?.value ?? state?.HouseNo);
            }}
            ariaInvalid={!!addressError}
            ariaDescribedBy={addressError ? "HouseNo-error" : undefined}
            className={`required-fields ${getFieldErrorClass("HouseNo")}${addressError ? " error border-danger is-invalid" : ""}`}
          />
          {addressError ? (
            <div
              id="HouseNo-error"
              className="error-message"
              style={{ color: "red", fontSize: "10px" }}
              role="alert"
            >
              {addressError}
            </div>
          ) : (
            <FieldError id="HouseNo" />
          )}
        </>
      );
    }

    if (item?.ControlDisplayID === "Locality") {
      return (
        <>
          <Input
            lable={t("Locality")}
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

    if (item?.ControlDisplayID === "PinCode" || item?.ControlDisplayID === "Pincode") {
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
            className={`required-fields ${getFieldErrorClass("PinCode")}${pinError ? " error border-danger is-invalid" : ""}`}
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

    if (item?.ControlDisplayID === "City") {
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
            className={`required-fields ${getFieldErrorClass("City")}`}
          />
          <FieldError id="City" />
        </>
      );
    }

    if (item?.ControlDisplayID === "State") {
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
            className={`required-fields ${getFieldErrorClass("State")}`}
          />
          <FieldError id="State" />
        </>
      );
    }

    if (item?.ControlDisplayID === "Country") {
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
            className={`required-fields ${getFieldErrorClass("Country")}`}
          />
          <FieldError id="Country" />
        </>
      );
    }

    if (item?.ControlDisplayID === "Email") {
      return (
        <>
          <Input
            lable="Email ID"
            type="text"
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
              const check = validateEmail(e?.target?.value ?? state?.Email);
              setMoreErrors((prev) => {
                const next = { ...prev };
                if (check.isValid) delete next.Email;
                else next.Email = check.message;
                return next;
              });
            }}
            ariaInvalid={!!moreErrors?.Email}
            ariaDescribedBy={moreErrors?.Email ? "Email-error" : undefined}
            className={`required-fields ${getFieldErrorClass("Email")}${moreErrors?.Email ? " error border-danger is-invalid" : ""}`}
          />
          {moreErrors?.Email ? (
            <div
              id="Email-error"
              className="error-message"
              style={{ color: "red", fontSize: "10px" }}
              role="alert"
            >
              {moreErrors.Email}
            </div>
          ) : (
            <FieldError id="Email" />
          )}
        </>
      );
    }

    if (item?.ControlDisplayID === "nikshayID") {
      return (
        <>
          <Input
            className={`form-control input-sm ${getFieldErrorClass("nikshayID")}`}
            id="nikshayID"
            lable="Nikshay ID"
            placeholder=" "
            max={15}
            value={nikshayID}
            name="NikshayID"
            type="text"
            onChange={handleInputChange}
          />
          <FieldError id="nikshayID" />
        </>
      );
    }

    if (item?.ControlDisplayID === "SrfId") {
      return (
        <>
          <Input
            id="SrfId"
            placeholder=" "
            name="SrfId"
            lable={t("Srf Id")}
            type="text"
            value={state?.SrfId}
            onChange={handleLTData}
            className={getFieldErrorClass("SrfId")}
          />
          <FieldError id="SrfId" />
        </>
      );
    }

    if (item?.ControlDisplayID === "CollectionCharges") {
      return (
        <>
          <Input
            id="CollectionCharges"
            placeholder=" "
            name="CollectionCharges"
            lable={t("Collection Charges")}
            type="number"
            value={state?.CollectionCharges}
            onChange={handleLTData}
            className={getFieldErrorClass("CollectionCharges")}
          />
          <FieldError id="CollectionCharges" />
        </>
      );
    }

    if (item?.ControlDisplayID === "PatientCode") {
      return (
        <Input
          className="form-control input-sm"
          id="UHID"
          lable="UHID"
          placeholder=" "
          max={15}
          disabled
          value={state?.PatientCode}
          name="UHID"
          type="text"
        />
      );
    }

    if (item?.ControlDisplayID === "IcmrId") {
      return (
        <>
          <Input
            id="IcmrId"
            placeholder=" "
            name="IcmrId"
            lable={t("Icmr Id")}
            type="text"
            value={state?.IcmrId}
            onChange={handleLTData}
            className={getFieldErrorClass("IcmrId")}
          />
          <FieldError id="IcmrId" />
        </>
      );
    }

    if (item?.ControlDisplayID === "HMIS_PatCrNo") {
      return (
        <>
          <Input
            max={30}
            value={state?.HMIS_PatCrNo}
            type="text"
            onChange={handleMainChange}
            lable={t("HMIS Pat Cr No")}
            name="HMIS_PatCrNo"
            placeholder=" "
            id="HMIS_PatCrNo"
            className={getFieldErrorClass("HMIS_PatCrNo")}
          />
          <FieldError id="HMIS_PatCrNo" />
        </>
      );
    }

    if (item?.ControlDisplayID === "H-UIHD") {
      return (
        <>
          <Input
            lable={t("H-UIHD")}
            max={30}
            type="text"
            value={state?.H_UIHD}
            onChange={handleMainChange}
            name="H-UIHD"
            placeholder=" "
            id="H-UIHD"
            className={getFieldErrorClass("H-UIHD")}
          />
          <FieldError id="H-UIHD" />
        </>
      );
    }

    if (item?.ControlDisplayID === "H-VisitNo") {
      return (
        <>
          <Input
            lable={t("H-VisitNo")}
            max={30}
            type="text"
            value={state?.H_VisitNo}
            onChange={handleMainChange}
            name="H-VisitNo"
            placeholder=" "
            id="H-VisitNo"
            className={getFieldErrorClass("H-VisitNo")}
          />
          <FieldError id="H-VisitNo" />
        </>
      );
    }

    if (item?.ControlDisplayID === "ClientRefNumber") {
      return (
        <>
          <Input
            type="text"
            lable={t("ClientRefNumber")}
            name="ClientRefNumber"
            placeholder=" "
            id="ClientRefNumber"
            value={state?.ClientRefNumber}
            maxLength={25}
            className={`required-fields ${getFieldErrorClass("ClientRefNumber")}`}
            onChange={(e) => {
              setMoreErrors((prev) => ({ ...prev, ClientRefNumber: "" }));
              setState((prev) => ({
                ...prev,
                ClientRefNumber: e.target.value,
              }));
            }}
          />
          <FieldError id="ClientRefNumber" />
        </>
      );
    }

    if (item?.ControlDisplayID === "OtherLabReferenceLabNumber") {
      return (
        <>
          <Input
            type="text"
            lable={t("OtherLabReferenceNumber")}
            name="OtherLabReferenceLabNumber"
            placeholder=" "
            id="OtherLabReferenceLabNumber"
            value={state?.OtherLabReferenceLabNumber}
            maxLength={25}
            className={`required-fields ${getFieldErrorClass("OtherLabReferenceLabNumber")}`}
            onChange={(e) => {
              setMoreErrors((prev) => ({
                ...prev,
                OtherLabReferenceLabNumber: "",
              }));
              setState((prev) => ({
                ...prev,
                OtherLabReferenceLabNumber: e.target.value,
              }));
            }}
          />
          <FieldError id="OtherLabReferenceLabNumber" />
        </>
      );
    }
    if (item?.ControlDisplayID === "CollectionCharges") {
      return (
        <>
          <div >
                <Input
                  id="CollectionCharges"
                  name="CollectionCharges"
                  lable={t("Collection Charges")}
                  placeholder=" "
                  type="number"
                  value={state?.CollectionCharges ?? ""}
                  onChange={handleLTData}
                  className={getFieldErrorClass("CollectionCharges")}
                />
                <FieldError id="CollectionCharges" />
              </div>
        
        </>
      );
    }

    if (item?.ControlDisplayID === "Remark" || item?.ControlDisplayID === "Remarks") {
      const remarkError = moreErrors?.Remark || moreErrors?.Remarks;
      const applyRemarkValidation = (raw) => {
        const val = raw == null ? "" : String(raw).trim();
        setMoreErrors((prev) => {
          const next = { ...prev };
          if (val) {
            delete next.Remark;
            delete next.Remarks;
          } else {
            next.Remark = "Reason to Change is required";
            next.Remarks = "Reason to Change is required";
          }
          return next;
        });
        requestAnimationFrame(() => {
          const el = document.getElementById("Remark") || document.getElementById("Remarks");
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
            type="text"
            name="Remark"
            id="Remark"
            lable={item?.ControlDisplayName || "Reason to Change Demographic"}
            placeholder=" "
            value={state?.Remark ?? state?.Remarks ?? ""}
            onChange={(e) => {
              const val = e.target.value;
              setState((prev) => ({ ...prev, Remark: val, Remarks: val }));
              applyRemarkValidation(val);
            }}
            onBlur={(e) => {
              applyRemarkValidation(e?.target?.value ?? state?.Remark ?? state?.Remarks);
            }}
            ariaInvalid={!!remarkError}
            ariaDescribedBy={remarkError ? "Remark-error" : undefined}
            className={`required-fields ${getFieldErrorClass("Remark")}${remarkError ? " error border-danger is-invalid" : ""}`}
            style={{ width: "100%" }}
          />
          {remarkError ? (
            <div
              id="Remark-error"
              className="error-message text-danger small"
              style={{ color: "red", fontSize: "10px" }}
              role="alert"
            >
              {remarkError}
            </div>
          ) : (
            <FieldError id="Remark" />
          )}
        </>
      );
    }

    return null;
  };

  console.log("render");
  console.log("state", state);

  return (
    <>
      {show?.show && (
        <PatientRegisterModal
          show={show?.show}
          handleClose={handleClose}
          Type={show?.Type}
          onSuccess={
            show?.Type === "Secondary"
              ? () =>
                getsecondDoctorSuggestion(
                  formData,
                  setseconddoctorSuggestion,
                  setFormData,
                )
              : () =>
                getDoctorSuggestion(
                  formData,
                  setDoctorSuggestion,
                  setFormData,
                )
          }
        />
      )}

      <Dialog
        visible={showOtherDoctorModal}
        header={t("Other Doctor Name")}
        style={{ width: "30vw" }}
        onHide={() => setShowOtherDoctorModal(false)}
      >
        <div className="row">
          <div className="col-12">
            <Input
              id="OtherDoctorNameModal"
              name="OtherDoctorName"
              lable={t("Doctor Name")}
              placeholder={t(" ")}
              autoFocus
              value={state?.OtherDoctorName || ""}
              onChange={(e) => {
                const value = e.target.value;
                setState((prev) => ({
                  ...prev,
                  OtherDoctorName: value,
                }));
                // Mirror into the visible Referred Doctor field so it shows
                // the actual typed name instead of staying stuck on
                // "others" — DoctorID/DoctorName in state stay fixed at
                // "2"/"Others" regardless, this is just the display value.
                setFormData((prev) => ({
                  ...prev,
                  DoctorName: value,
                }));
              }}
            />
          </div>
        </div>
        <div className="row mt-3">
          <div className="col-12 text-right">
            <CustomButton
              text={t("Done")}
              onClick={() => setShowOtherDoctorModal(false)}
            />
          </div>
        </div>
      </Dialog>

      {/* ── Lab No Search ── */}
      {/* <Accordion title={t("Visit Number")} defaultValue={true}> */}
      <div className="row pt-2 pl-1 pr-1">
        <div className="col-sm-2 col-6">
          <Input
            disabled={true}
            name="LabNo"
            lable="Visit Number"
            id="LabNo"
            placeholder=" "
            type="text"
            value={LabNo}
            onChange={(e) => setLabNo(e.target.value)}
          />
        </div>
        <div className="col-sm-1 col-6 d-flex align-items-end pb-1">
          <SearchButton
            text={"Search"}
            onClick={() => EditPatientDetail(LabNo)}
          />
        </div>
      </div>
      {/* </Accordion> */}

      {/* ── Demographic Details - DYNAMIC rendering ── */}
      <Accordion title={t("Demographic Details")} defaultValue={true}>
        {load ? (
          <Loading />
        ) : (
          <>
            {/* ─── All fields in ONE single row, rendered dynamically from controllerDynamicList ─── */}
            <div className="row pt-2 pl-1 pr-1 flex-wrap">
              {controllerDynamicList
                ?.sort((a, b) => a.DisplayOrder - b.DisplayOrder)
                .map((item) => {
                  if (!item?.IsShow) return null;
                  const fieldContent = renderField(item);
                  if (!fieldContent) return null;

                  // Width logic: time field gets narrower col, Remark gets full width
                  const colClass =
                    item?.ControlDisplayID === "time"
                      ? "col-md-1 col-sm-3 col-4 mb-1"
                      : item?.ControlDisplayID === "Remark" || item?.ControlDisplayID === "Remarks"
                        ? "col-12 mb-1"
                        : "col-sm-2 col-6 mb-1";

                  return (
                    <div key={item.ControlDisplayID} className={colClass}>
                      {fieldContent}
                    </div>
                  );
                })}

              {!controllerDynamicList?.some(
                (item) =>
                  (item?.ControlDisplayID === "Remark" || item?.ControlDisplayID === "Remarks") &&
                  item?.IsShow === 1,
              ) && (
                <div className="col-12 mb-1">
                  {renderField({
                    ControlDisplayID: "Remark",
                    ControlDisplayName: "Reason to Change Demographic",
                    IsShow: 1,
                  })}
                </div>
              )}

              {/* ── PNDT Button (only for Female) ── */}
              {state?.Gender === "Female" && (
                <div className="col-sm-1 col-3 mb-1">
                  <button
                    className="btn-info text-white btn-block rounded p-1"
                    type="button"
                    onClick={handlePNDT}
                  >
                    <Tooltip label="Pre-Natal Diagnostic Techniques">
                      <i aria-hidden="true">{t("PNDT")}</i>
                    </Tooltip>
                  </button>
                </div>
              )}
            </div>

            {/* ── Dynamic Visible Fields from ManageFieldMaster ── */}
            {visibleFields.filter((d) => d.IsVisible === 1).length > 0 && (
              <div className="row pl-1 pr-1 mt-1">
                {visibleFields
                  .filter((d) => d.IsVisible === 1)
                  .map((data, index) => (
                    <div className="col-sm-2 col-6 mb-1" key={index}>
                      <Input
                        max={30}
                        name={data.FieldType}
                        id={data.FieldType}
                        placeholder=" "
                        lable={t(
                          data.FieldType === "BedNo"
                            ? "WardNo/BedNo"
                            : data.FieldType,
                        )}
                        value={state[data.FieldType] || ""}
                        onChange={handleLTData}
                        type="text"
                      />
                      {data.isError && (
                        <div className="error-message text-danger small">
                          {t(data.message)}
                        </div>
                      )}
                    </div>
                  ))}
              </div>
            )}

            {/* ── Action Buttons ── */}
            <div className="row pl-1 pr-1 mt-2 align-items-center">
              <div className="col-auto mb-1">
                <EditButton
                  text={"Update"}
                  type="submit"
                  id="btnSave"
                  onClick={handleSubmit}
                />
              </div>
              <div className="col-auto mb-1">
                <CustomButton
                  text="Upload Demographic Change Request Form"
                  icon="upload"
                  disabled={!state?.Remark?.trim()}
                  onClick={() => {
                    const guid = state?.PatientGuid || demographicFormFilePath || guidNumber();
                    setDemographicFormFilePath(guid);
                    setDemographicUploadModal({ modal: true, data: guid });
                  }}
                />
              </div>
              <div className="col-auto mb-1">
                <CustomButton
                  text={t("Preview Document")}
                  icon="eye"
                  disabled={existingDemographicFileCount === 0}
                  onClick={() => setDemographicPreviewVisible(true)}
                />
              </div>
              {/* <form onSubmit={handleSubmit}>

                  <EditButton
                    text="Update"
                    type="submit"
                    id="btnSave"
                    onClick={handleSubmit}
                  />
                  <pre style={{ color: "red" }}>
                    {JSON.stringify(errors, null, 2)}
                  </pre>
                </form> */}
              <div className="col-auto mb-1">
                <button
                  type="button"
                  id="btnCancel"
                  className="btn btn-success btn-sm rounded px-3"
                  onClick={() => {
                    if (typeof onHideModal === "function") {
                      onHideModal();
                    } else {
                      navigate("/receiptreprint");
                    }
                  }}
                >
                  {"MainList"}
                </button>
              </div>
            </div>
          </>
        )}
      </Accordion>

      {/* ── PNDT Accordion ── */}
      {Pndt?.PNDT && (
        <Accordion
          title={t("Pre-Natal Diagnostic Techniques")}
          defaultValue={true}
        >
          <div className="row pt-2 pl-1 pr-1">
            {controllerDynamicList
              ?.filter((item) => item?.TypeId === 1 && item?.IsShow === 1)
              ?.sort((a, b) => a.DisplayOrder - b.DisplayOrder)
              ?.map((item) => {
                if (item?.ControlDisplayID === "NoOfChildren") {
                  return (
                    <div key="NoOfChildren" className="col-sm-2 col-6 mb-1">
                      <Input
                        id="NoOfChildren"
                        name="NoOfChildren"
                        lable={t("Number Of Children")}
                        placeholder=" "
                        type="number"
                        onInput={(e) => number(e, 3)}
                        value={Pndt?.NoOfChildren}
                        onChange={handlePNDTChange}
                        className={getFieldErrorClass("NoOfChildren")}
                      />
                      <FieldError id="NoOfChildren" />
                    </div>
                  );
                }
                if (item?.ControlDisplayID === "NoOfSon") {
                  return (
                    <div key="NoOfSon" className="col-sm-2 col-6 mb-1">
                      <Input
                        name="NoOfSon"
                        id="NoOfSon"
                        lable={t("Number Of Son")}
                        placeholder=" "
                        type="number"
                        value={Pndt?.NoOfSon}
                        onInput={(e) => number(e, 3)}
                        onChange={handlePNDTChange}
                        className={getFieldErrorClass("NoOfSon")}
                      />
                      <FieldError id="NoOfSon" />
                    </div>
                  );
                }
                if (item?.ControlDisplayID === "NoOfDaughter") {
                  return (
                    <div key="NoOfDaughter" className="col-sm-2 col-6 mb-1">
                      <Input
                        id="NoOfDaughter"
                        lable={t("Number Of Daughter")}
                        placeholder=" "
                        name="NoOfDaughter"
                        type="number"
                        value={Pndt?.NoOfDaughter}
                        onInput={(e) => number(e, 3)}
                        onChange={handlePNDTChange}
                        className={getFieldErrorClass("NoOfDaughter")}
                      />
                      <FieldError id="NoOfDaughter" />
                    </div>
                  );
                }
                if (item?.ControlDisplayID === "Pregnancy") {
                  return (
                    <div key="Pregnancy" className="col-sm-2 col-6 mb-1">
                      <DatePicker
                        name="Pregnancy"
                        className={`custom-calendar ${getFieldErrorClass("Pregnancy")}`}
                        id="Pregnancy"
                        lable={t("Pregnancy")}
                        placeholder=" "
                        value={Pndt?.Pregnancy}
                        maxDate={new Date()}
                        onChange={handleDatePNDT}
                      />
                      <FieldError id="Pregnancy" />
                    </div>
                  );
                }
                if (item?.ControlDisplayID === "AgeOfSon") {
                  return (
                    <div key="AgeOfSon" className="col-sm-2 col-6 mb-1">
                      <Input
                        name="AgeOfSon"
                        lable={t("Son's Age")}
                        id="AgeOfSon"
                        placeholder=" "
                        type="number"
                        value={Pndt?.AgeOfSon}
                        onInput={(e) => number(e, 3)}
                        onChange={handlePNDTChange}
                        className={getFieldErrorClass("AgeOfSon")}
                      />
                      <FieldError id="AgeOfSon" />
                    </div>
                  );
                }
                return null;
              })}
          </div>
        </Accordion>
      )}

      <PatientRegistrationModal
        show={toggleRefLabModal}
        onHide={handleToggleRefLabModal}
      />

      {demographicUploadModal.modal && (
        <UploadFile
          show={demographicUploadModal.modal}
          handleClose={() => setDemographicUploadModal({ modal: false, data: "" })}
          documentId={demographicUploadModal.data}
          pageName="DemographicChangeRequestForm"
          handleUploadCount={(name, count) => {
            const n = Number(count);
            if (n > 0) setExistingDemographicFileCount(n);
          }}
        />
      )}

      {demographicPreviewVisible && (
        <PdfPreviewModal
          visible={demographicPreviewVisible}
          url={demographicAwsKeys}
          onClose={() => setDemographicPreviewVisible(false)}
        />
      )}
    </>
  );
};

export default EditPatientInfo;
