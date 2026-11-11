import React, { useEffect, useRef, useState } from "react";
import { createPortal, flushSync } from "react-dom";

import Heading from "../../components/UI/Heading";
import Accordion from "@app/components/UI/Accordion";
import { useTranslation } from "react-i18next";
import { SelectBox } from "../../components/formComponent/SelectBox";
import { useMemo } from "react";
import Tooltip from "../../components/formComponent/Tooltip";
import DatePicker from "../../components/formComponent/DatePicker";
import NepaliDatePicker from "../../components/formComponent/NepaliDatePicker";
import CustomTimePicker from "../../components/formComponent/TimePicker";
import Tables from "../../components/UI/customTable";
import Input from "../../components/formComponent/Input";
import { toast } from "react-toastify";
import { DISCOUNT_TYPE, LTDataIniti, stateIniti } from "../../utils/Constants";
import DiscountBearBy from "../../components/formComponent/DiscountBearBy";
import {
  emptyDiscountBearBy,
  isManagementDiscountType,
  syncDiscountBearBy,
  toDiscountBearByPayload,
  validateDiscountBearBy,
} from "../../utils/discountBearBy";
import PlaceholderImage from "./PlaceholderImage.jpg";
import { Tooltip as ReactTooltip } from "react-tooltip";
import "./PatientRegistration.css";
import "./DynamicValidation.css";
import "./ErrorStyles.css";
import MpesaModal from "../../components/MpesaModal/MpesaModal";
import "./patientRegistrationRequiredClass.css";

import {
  checkDuplicateBarcode,
  checkEmploypeeWiseDiscount,
  getAccessCentres,
  getAccessDataRate,
  getBindDiscApproval,
  getBindDiscReason,
  getCollectionBoy,
  getDoctorSuggestion,
  getPaymentModes,
  getSearchController,
  getsecondDoctorSuggestion,
} from "../../utils/NetworkApi/commonApi";
import { axiosInstance, axiosReport } from "../../utils/axiosInstance";
import {
  PreventNumber,
  PreventSpecialCharacter,
  PreventSpecialCharacterAddress,
  PreventSpecialCharacterFirstName,
  Tabfunctionality,
  autocompleteOnBlur,
  getTrimmedData,
  number,
  removeSpecialCharacters,
} from "../../utils/helpers";
import { useLocation, useNavigate } from "react-router-dom";
import { linkAppointmentRegistration, saveMacRadiologyAppointment } from "../RadiologyAppointment/api";
import moment from "moment/moment";
import { CouponValidateSchema } from "../../utils/Schema";
import Loading from "../../components/loader/Loading";
import CloseButton from "../../components/formComponent/CloseButton";
import RegisterationTable from "../Table/RegisterationTable";
import { useLocalStorage } from "../../utils/hooks/useLocalStorage";
import MedicialModal from "../utils/MedicialModal";
import UploadFile from "../utils/UploadFileModal/UploadFile";
import MobileDataModal from "../utils/MobileDataModal";
import AdvanceMobileDataModal from "../utils/AdvanceMobileDataModal";
import CameraModal from "../utils/CameraModal";
import SampleRemark from "../utils/SampleRemark";
import PatientRegisterModal from "../utils/PatientRegisterModal";
import SaveSmsEmail from "../utils/SaveSmsEmail";
import SlotBookModal from "../utils/SlotBookModal";
import ReactSelect from "../../components/formComponent/ReactSelect";
import BarcodeLogicModal from "../utils/BarcodeLogicModal";
import OldPatientSearchModal from "../utils/OldPatientSearchModal";
import MembershipModal from "../utils/MembershipModal";
import PackageSuggestion from "../utils/PackageSuggestion";
import SuggestionModal from "../utils/SuggestionModal";
import axios from "axios";
import { apiUrls } from "../../utils/apiUrls";
import { notify } from "../../utils/utils";
import PatientRegistrationModal from "./PatientRegistrationModal";
import { useDispatch } from "react-redux";
import { getBalance } from "../../store/reducers/ApiSlice/balanceSlice";
import { Form, InputGroup } from "react-bootstrap";
import { useFocusManager } from "../../../src/utils/hooks/useFocusManager.jsx";
import { useSelector } from "react-redux";
import CustomTooltip from "../../components/formComponent/CustomTooltip.jsx";
import {
  CancelButton,
  CustomButton,
  SaveButton,
  SearchButton,
} from "../../components/UI/CustomButton.jsx";
import MobileStepper from "./MobileStepper.jsx";
import {
  setRefLabModalData,
  setRefDoctorModalData,
} from "../../store/reducers/loadingSlice/loadingSlice.js";
import { validateBeforeSubmission, isAadhaarIdType, sanitizeAadhaarInput, validateAadhaarNumber, isPanIdType, validatePanNumber, validateIdentityProof, validateEmail, ADDRESS_MAX_LENGTH, validateAddress, LAST_NAME_MAX_LENGTH, sanitizeLastNameInput, validateLastName, FIRST_NAME_MAX_LENGTH, validateFirstName, validateAgeComponent, AGE_YEAR_MAX, AGE_MONTH_MAX, AGE_DAY_MAX, validateWeight, validateRowDiscount, sanitizeCountryName, validateCountryName, validateDob, parseTypedDate, calculateAgeFromDob, validateMobileDigits, getPhoneMaxLength, validatePhone, TRF_NO_MAX_LENGTH, validateTrfNo } from "../../utils/validations/index.js";
import { createDynamicValidation } from "./dynamicValidation";
import UltraFastSelect from "../../components/UltraFastSelect/UltraFastSelect.jsx";
import { Dialog } from "primereact/dialog";
import SpeedDialWithDrawer from "../utils/SpeedDial/SpeedDialWithDrawer.jsx";
import { FaEdit, FaEye, FaPlus } from "react-icons/fa";
import AdvanceOldPatientSearchModal from "../utils/AdvanceOldPatientSearchModal.jsx";
import { faBullseye } from "@fortawesome/free-solid-svg-icons";
import { AutoComplete } from "primereact/autocomplete";
import PageControlGear from "../../components/PageGearModel/PageControlGear.jsx";
import PatientConfirmModal from "../utils/PatientConfirmModal.jsx";
import VoiceFormFiller from "../../components/UI/VoiceFormFiller.jsx";
import TRFScanner from "./TRFScanner";
import { FileText } from "lucide-react";
import TestAlreadyHaveModal from "../utils/TestAlreadyHaveModal";

const PatientRegistration = () => {
  const [CoPaymentPercentage, setCoPaymentPercentage] = useState(0);
  const [showScanPanel, setShowScanPanel] = useState(false);
  const [trfImages, setTrfImages] = useState([]);
  const [CenterType, setCenterType] = useState("");
  const [showTestModal, setShowTestModal] = useState(false);
  const [pendingTest, setPendingTest] = useState(null);
  const isSelectCome = true
  const pendingPaidRef = useRef(0);
  const pendingTransactionRef = useRef("");
  // EPD-032: remember ID Proof No per Id Type so switching back restores it.
  const idProofByTypeRef = useRef({});

  const callFromRegistration = 1; // use for centreAcess Api call
  const dispatch = useDispatch();
  const isAutoFocused = useRef(false);
  const prevInvestigationIdsRef = useRef("");
  const isMobileSize = window.innerWidth > 768;
  const theme = useLocalStorage("theme", "get");
  const userdata = useLocalStorage("userData", "get");
  console.log("Patient Registration Rendered", userdata);
  const useWorkOrderRateFlow = [1002, 1005].includes(userdata?.CompanyID);
  const IsAllowlocalTestData = 0;
  const isLocalEnabled =
    IsAllowlocalTestData === 1 && userdata?.CompanyID === 1002;
  const isDefaultReferalDoctorSelf = userdata?.IsDefaultReferalDoctorSelf == 1;
  console.log(userdata, "isDefaultReferalDoctorSelf")
  const [doctorRequiredAttachment, setDoctorRequiredAttachment] = useState([]);
  console.log(doctorRequiredAttachment, "doctorRequiredAttachment")
  const {
    CentreVsRateTypeatWorkOrder,
    DefaultDocotorOnWorkorder,
    DefaultCurrencyName,
    IsPatientNameAutoCaps_WorkOrder,
    AllowAdvanceOldPatientSearchAtWorkOrder,
    AtleastOneBarcodeMandatoryAtWorkOrder,
    AllowCofirmationMessageatWorkOrder,
    DefaultVisitTypeatWorkOrder,
    AllowTRFUploadAndScan,
  } = useLocalStorage("userData", "get");
  console.log(CentreVsRateTypeatWorkOrder, "CentreVsRateTypeatWorkOrder")
  // getRateTypeWorkOrder (BindRateTypeWorkOrder API) only applies when
  // CentreVsRateTypeatWorkOrder is 0 — the function itself no-ops otherwise,
  // so callers must fall back to handleRateType in that case or RateType
  // never gets populated on centre selection.
  const useBindRateTypeWorkOrderFlow =
    useWorkOrderRateFlow && CentreVsRateTypeatWorkOrder == 0;
  const { refLabModalData, refDoctorModalData } = useSelector(
    (data) => data?.loadingSlice,
  );
  const [patientImg, setPatientImg] = useState({
    img: PlaceholderImage,
    show: false,
  });
  const [AgeWiseDiscountDropdown, setAgeWiseDiscountDropdown] = useState([]);
  const [Gender, setGender] = useState([]);
  const [SampleSource, setSampleSource] = useState([]);
  //stepper state
  const [step, setStep] = useState(1);
  const [showDefault, setShowDefault] = useState(true);

  const [Title, setTitle] = useState([]);

  useEffect(() => {
    const pending = sessionStorage.getItem("pendingTRFs");
    if (pending) {
      try {
        const images = JSON.parse(pending);
        if (Array.isArray(images) && images.length > 0) {
          setTrfImages(images);
          setCurrentTRFIndex(0);
          setShowScanPanel(true);
        }
      } catch (e) {
        console.error("Error parsing pendingTRFs", e);
      }
    }
  }, []);
  const [Identity, setIdentity] = useState([]);
  const [requiredAttachment, setRequiredAttachment] = useState([]);
  const [PaymentMode, setPaymentMode] = useState([]);
  const [BankName, setBankName] = useState([]);
  const [CollectionBoy, setCollectionBoy] = useState([]);
  const [visibleFields, setVisibleFields] = useState([]);
  const [RateType, setRateType] = useState([]);

  const [isB2B, setisB2B] = useState("");
  const [isBookingLocked, setIsBookingLocked] = useState(false);
  const [bookingLockedRateTypeName, setBookingLockedRateTypeName] = useState("");
  const [doctorNotification, setDoctorNotification] = useState("");
  const [investigationId, setInvestigationId] = useState([]);

  console.log(isB2B, "isB2B");

  const [CentreData, setCentreData] = useState([]);
  const [suggestion, setSuggestion] = useState([]);
  const [doctorSuggestion, setDoctorSuggestion] = useState([]);
  const [seconddoctorSuggestion, setseconddoctorSuggestion] = useState([]);
  const [VisitType, setVisitType] = useState([]);
  const [throughMobileData, setThroughMobileData] = useState(false);
  const [throughMemberData, setThroughmemberdata] = useState(false);
  const [showRegForm, setShowRegForm] = useState(true);
  const [showMarker, setShowMarker] = useState(false);
  const PAGE_ID = "2";
  const [markerData, setMarkerData] = useState({
    scanDate: new Date(),
    sampleCollection: new Date(),
    gestationalWeek: "",
    gestationalDays: "",
    age: new Date(),
  });
  const [markerResults, setMarkerResults] = useState([]);
  const [showMarkerResults, setShowMarkerResults] = useState(false);
  const [allReceipt, setAllReceipt] = useState({
    AutoTRF: "",
    AutoReceipt: "",
    AutoMRPReceipt: "",
  });
  const [DateData, setDateData] = useState({
    AgeYear: 0,
    AgeDays: "",
    AgeMonth: "",
  });
  const [isActive, setIsActive] = useState(0);
  const Navigate = useNavigate();
  const location = useLocation();

  const [toggleRefLabModal, setToggleRefLabModal] = useState(false);
  const [paid, setPaid] = useState(0);
  const [BindDiscApproval, setBindDiscApproval] = useState([]);
  const [BindDiscReason, setBindDiscReason] = useState([]);
  const [load, setLoad] = useState(false);
  const [discountPercentage, setDiscountPercentage] = useState("");
  const [disAmt, setdisAmt] = useState("");
  const [discountBearBy, setDiscountBearBy] = useState(emptyDiscountBearBy());
  const [documentId, setDocumentID] = useState("");
  const [PatientGuid, SetPatientGuid] = useState("");
  const [PatientSource, setPatientSource] = useState([]);
  const [PatientType, setPatientType] = useState([]);
  const [HLMPatientType, setHLMPatientType] = useState([]);
  const [SourceType, setSourceType] = useState([]);
  const [WardNoOptions, setWardNoOptions] = useState([]);
  const [lastVisitNo, setLastVisitNo] = useState([]);
  const [mobleData, setMobileData] = useState([]);
  console.log(mobleData, "mobleData");
  const [Memberdata, setMemberdata] = useState([]);
  const [fuhid, setFuhid] = useState("");
  const [searchMobile, setSearchMobile] = useState("");
  const [familyMemberData, setFamilyMemberData] = useState([]);
  const [showFamilyDialog, setShowFamilyDialog] = useState(false);
  const [showOtherDoctorModal, setShowOtherDoctorModal] = useState(false);
  const [throughFamilyData, setThroughFamilyData] = useState(false);
  const [Memberdetails, setMemberdetails] = useState({});
  const [familyMemberDetails, setFamilyMemberDetails] = useState({});
  const [isPolicyPrescription, setIsPolicyPrescription] = useState(0);
  const [isSubmit, setIsSubmit] = useState({
    type: "Success",
    isLoading: false,
  });
  const [BarcodeLogic, setBarcodeLogic] = useState(0);
  const [UploadDoumentType, setUploadDoumentType] = useState([""]);
  const [autoEmail, setAutoEmail] = useState({
    order_id: "",
    flag: false,
  });
  const [dropFalse, setDropFalse] = useState(false);
  const [secondDropFalse, setSecondDropFalse] = useState(false);
  const [show, setShow] = useState({
    show: false,
    Type: "",
  });
  const [showOP, setShowOP] = useState(false);
  const [tableData, setTableData] = useState([]);
  console.log(tableData, "tableData");
  const [indexMatch, setIndexMatch] = useState(0);
  const [show2, setShow2] = useState(false);
  const [show3, setShow3] = useState(false);
  const [show4, setShow4] = useState(false);
  const [proEmplyee, setProEmployee] = useState([]);
  const [refLabList, setRefLabList] = useState([]);
  const [refLabSearchText, setRefLabSearchText] = useState("");
  const [refLabSuggestions, setRefLabSuggestions] = useState([]);
  const [refLabDropShow, setRefLabDropShow] = useState(false);
  const [tabbingOrder, setTabbingOrder] = useState([]);
  const [controllerDynamicList, setControllerDynamicList] = useState([]);
  console.log(controllerDynamicList, "controllerDynamicList");
  const [selectAllUrgent, setSelectAllUrgent] = useState(false);
  const [isMobileSearchSelected, setIsMobileSearchSelected] = useState(false);

  const [showConfirm, setShowConfirm] = useState(false);
  const [pendingPayload, setPendingPayload] = useState(null);

  const [show5, setShow5] = useState({
    modal: false,
    index: -1,
  });
  const [show6, setShow6] = useState(false);
  const [show7, setShow7] = useState(false);
  const [RequiredShow, setRequiredShow] = useState({
    show: false,
    FieldIDs: "",
  });
  const [hiddenRequiredModal, setHiddenRequiredModal] = useState({
    show: false,
    fields: [], // [{ controlId, fieldName, label }]
    pendingData: null,
    localValues: {}, // { controlId: value } – filled by user inside the modal
    errors: [], // [controlId] - fields that failed modal validation
  });
  const [duplicateParamModal, setDuplicateParamModal] = useState({
    show: false,
    data: [],
  });
  const [preRegistrationTRFID, setPreRegistrationTRFID] = useState(0);
  const [trfNo, setTrfNo] = useState("");
  const [SecondaryMobile, setSecondaryMobile] = useState("");
  const [formData, setFormData] = useState({
    DoctorName: isDefaultReferalDoctorSelf ? "SELF" : "",
    SecondReferDoctor: isDefaultReferalDoctorSelf ? "SELF" : "",
  });
  const [state, setState] = useState({
    ...stateIniti,
    RateID: null,
    RateTypeName: "",
    // trfNo: "",
    ReferenceRate: 0,
  });

  // Gender comes back from LinkAppointmentRegistration as a single letter
  // ("M"/"F"/"O") — the Gender dropdown's options use full words, so the
  // raw letter never matches an option and the field just looks empty.
  const RADIOLOGY_GENDER_MAP = { M: "Male", F: "Female", O: "Other" };

  // Once linkAppointmentRegistration resolves, the appointment's Centre and
  // TestName still need a working RateType before the test can actually be
  // priced/added — that only exists after Centre selection kicks off its
  // normal RateType fetch (see the CentreData and state?.RateID effects
  // below). Stashed here in the meantime rather than acted on immediately.
  const pendingRadiologyAutoFillRef = useRef(null);

  // Backstop for the remark prefilled from linkAppointmentRegistration (see
  // the effect below). handleSearchSelectChange's CentreID branch (and 15
  // other spots in this file) call setLTData({...LTData, ...}) — a plain
  // closure spread, not the functional-updater form — and the radiology
  // auto-fill sequence this page kicks off right after prefill (auto-select
  // Centre -> auto-select RateType -> auto-add the test) runs straight
  // through several of them. Any one of those can re-spread an LTData
  // snapshot captured before this effect's setLTData(Remarks) landed,
  // silently wiping it back to "" before SaveData ever fires. Stashed here
  // and re-merged into the actual SaveData payload at submit time so it
  // survives regardless of how many times LTData gets reset in between.
  const radiologyRemarkRef = useRef("");

  // Appointment IDs freshly created by bookPendingRadiologySlots() during
  // *this* save — linked to the new LedgerTransactionID once SaveData
  // resolves below (see that .then block). Without this, saveMacRadiologyAppointment
  // never gets a LedgerTransactionID at insert time (it's only auto-filled by
  // TryAutoRegisterAsync's pay-at-booking path, which doesn't apply to tests
  // added mid-registration), so the appointment stays permanently
  // "unregistered"/yellow in the slot picker, and a later edit can't resolve
  // its RadiologyAppointmentId to cancel it when the test is removed.
  const freshlyBookedRadiologyAppointmentIdsRef = useRef([]);

  // Set when linkAppointmentRegistration's response reports a PaidAmount > 0
  // — part (or all) of the total was already collected during the
  // radiology slot booking itself (BookSlotModal.jsx's "Pay Now" flow), so
  // the AutoFillPaidAmount effect further down needs to auto-fill only the
  // remaining due amount here, not the full Net Amount, and the billing
  // panel shows a note about it so staff don't miss that cash already
  // changed hands.
  const [radiologyPrePaidAmount, setRadiologyPrePaidAmount] = useState(0);

  useEffect(() => {
    const ls = location.state;
    if (!ls?.fromRadiology || !ls?.appointmentId) return;

    // Pre-fill from navigation state immediately
    setState((prev) => ({
      ...prev,
      ...(ls.Mobile ? { Mobile: ls.Mobile } : {}),
      ...(ls.PatientName ? { FirstName: ls.PatientName } : {}),
    }));

    // Fetch full appointment data and fill remaining fields
    linkAppointmentRegistration({ appointmentId: ls.appointmentId })
      .then((res) => {
        const d = res?.data?.message;
        if (!d) return;

        // Age comes back as a whole-years string like "23 Y" — no month/day
        // precision, so DOB is only ever approximate (today minus that many
        // years), same approximation SlotBookModal.jsx's age↔DOB sync uses.
        const ageYear = parseInt(String(d.Age || "")) || 0;
        const hasAge = String(d.Age || "").trim() !== "";
        const dob = hasAge ? moment().subtract(ageYear, "years").toDate() : null;
        const genderFull =
          RADIOLOGY_GENDER_MAP[String(d.Gender || "").trim().toUpperCase()] || d.Gender;

        setState((prev) => ({
          ...prev,
          Mobile: d.MobileNo || prev.Mobile,
          FirstName: d.PatientName || prev.FirstName,
          Gender: genderFull || prev.Gender,
          AgeYear: ageYear,
          AgeMonth: 0,
          AgeDays: 0,
          DOB: dob || prev.DOB,
          TotalAgeInDays: dob ? calculateTotalNumberOfDays(dob) : prev.TotalAgeInDays,
          // Address/Locality inputs on this page are bound to HouseNo/Locality
          // (not "Address" — that name belongs to BookSlotModal.jsx's own,
          // separate form) — the response's Address/Locality values were
          // being fetched but never actually applied to state, so these two
          // fields always came in empty despite the API returning them.
          HouseNo: d.Address || prev.HouseNo,
          Locality: d.Locality || prev.Locality,
          Title: d.Title || prev.Title,
        }));

        // The remark typed on BookSlotModal.jsx ("Comment") is stored server-side
        // as appointment_radiology_details.Remarks and comes back here as
        // d.Remarks. It has no field of its own on this page — it rides in
        // LTData.Remarks, the same "Billing Remarks" field SampleRemark.jsx
        // edits (see handleSaveremark below), which IS sent to the backend on
        // PatientRegistration/SaveData (LTData.Remarks -> f_ledgertransaction
        // Remarks) and is what GetReceipt/reprint print. Without this, the
        // remark only survives the full-payment auto-registration path (done
        // entirely server-side) — this manual "Register" flow used to drop it.
        if (d.Remarks) {
          radiologyRemarkRef.current = d.Remarks;
          setLTData((prev) => ({ ...prev, Remarks: d.Remarks }));
        }
        // No matching state field for PatientType ("VVIP") exists on this
        // page's form (Category's PATIENT_TYPES values don't line up with
        // BookSlotModal.jsx's) — left unfilled rather than guessing a mapping.

        // Some/all of the amount may already have been collected at booking
        // time (BookSlotModal.jsx's "Pay Now" flow) — see
        // radiologyPrePaidAmount below for how this feeds into the billing
        // section's auto-filled Paid Amount.
        if (Number(d.PaidAmount) > 0) {
          setRadiologyPrePaidAmount(Number(d.PaidAmount));
        }

        // Centre selection (below) needs the full option object from
        // CentreData, not just the id, and the test can't be priced until
        // that selection resolves a RateType — both handled by the two
        // effects below once their data is actually ready.
        if (d.CentreId && d.TestName) {
          pendingRadiologyAutoFillRef.current = { centreId: d.CentreId, testName: d.TestName };
        }
      })
      .catch(() => {/* ignore — form is still usable without pre-fill */ });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Select the appointment's centre the same way the Centre dropdown itself
  // would, as soon as the centre list is loaded — this is what kicks off
  // the normal Centre → RateType cascade (see handleSearchSelectChange).
  // Guarded to fire only once: CentreData can reload later for unrelated
  // reasons, and re-selecting the centre at that point would reset RateID
  // (via handleSearchSelectChange's own CentreID branch) before the test
  // auto-add effect below ever gets a chance to see it populated.
  const radiologyCentreAutoSelectedRef = useRef(false);
  useEffect(() => {
    const pending = pendingRadiologyAutoFillRef.current;
    if (!pending || !CentreData?.length || radiologyCentreAutoSelectedRef.current) return;
    const centreOption = CentreData.find((c) => String(c.value) === String(pending.centreId));
    if (!centreOption) return;
    radiologyCentreAutoSelectedRef.current = true;
    handleSearchSelectChange("CentreID", centreOption);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [CentreData]);

  // Once the centre selection above has actually resolved a RateType, look
  // up and add the appointment's test the same way typing it into the test
  // search box and picking it would (bindPrebookingTests does this same
  // lookup-then-add for prebooking/GWT imports, just by TestCode — this
  // only has a TestName from the appointment, hence SearchBy: "TestName").
  useEffect(() => {
    const pending = pendingRadiologyAutoFillRef.current;
    if (!pending?.testName || !state?.RateID) return;
    pendingRadiologyAutoFillRef.current = null; // only ever auto-add once
    axiosInstance
      .post("TestData/BindBillingTestData", {
        TestName: pending.testName,
        CentreID: state.RateID,
        SearchBy: "TestName",
        ActualRateTypeID: state.RateID,
        AllowZeroRateBooking: selectedRateType?.AllowZeroRateBooking || 0,
      })
      .then((res) => {
        const match = (res?.data?.message || []).find(
          (t) => String(t?.TestName || "").trim().toLowerCase() === pending.testName.trim().toLowerCase(),
        ) || res?.data?.message?.[0];
        if (res?.data?.success && match) {
          handleListSearch(match, "TestName");
        } else {
          toast.warn(`Couldn't find "${pending.testName}" to auto-add — please add it manually.`);
        }
      })
      .catch(() => {
        toast.warn(`Couldn't find "${pending.testName}" to auto-add — please add it manually.`);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state?.RateID]);

  // "Convert" on Estimate Search (EstimateRatenew / EstimateRatenewList)
  // navigates here with the estimate row. Patient details are filled right
  // away; centre -> rate type -> tests then follow the same cascade the
  // radiology flow above uses. estimateConvertRef survives until SaveData
  // succeeds so the estimate can be marked Convert with the new Visit No.
  const pendingEstimateAutoFillRef = useRef(null);
  const estimateConvertRef = useRef(null);
  useEffect(() => {
    const ls = location.state;
    if (!ls?.fromEstimate) return;
    const est = ls.estimate || ls.data || {};

    const items = (() => {
      const raw = est.ItemArray ?? est.Items ?? [];
      try {
        return typeof raw === "string" ? JSON.parse(raw) : raw;
      } catch {
        return [];
      }
    })();

    const ageYear = Number(est.AgeYear) || 0;
    const ageMonth = Number(est.AgeMonth) || 0;
    const ageDays = Number(est.AgeDays) || 0;
    const parsedDOB = est.DOB ? moment(est.DOB) : null;
    const dob =
      parsedDOB?.isValid() && parsedDOB.isBefore(moment())
        ? parsedDOB.toDate()
        : moment()
          .subtract(ageYear, "years")
          .subtract(ageMonth, "months")
          .subtract(ageDays, "days")
          .toDate();
    const { years, months, days } = calculateDOB(dob);

    // Only non-empty values, so nothing already on the form gets blanked.
    const patientFields = Object.fromEntries(
      Object.entries({
        Title: est.Title,
        // Estimate Booking's name goes in its Middle Name field -> First Name
        // here; Last Name -> Last Name. Older rows that only carry PName (the
        // full name) fall back to putting all of it in First Name.
        FirstName: String(
          est.MiddleName || est.FirstName || est.PName || est.PatientName || "",
        ).trim(),
        LastName: String(est.LastName || "").trim(),
        Mobile: est.Mobile ? String(est.Mobile) : "",
        Gender: est.Gender,
        Email: est.Email,
        HouseNo: est.Address,
        DOB: dob,
        AgeYear: years,
        AgeMonth: months,
        AgeDays: days,
        TotalAgeInDays: calculateTotalNumberOfDays(dob),
      }).filter(([, v]) => v !== undefined && v !== null && v !== ""),
    );
    setState((prev) => ({ ...prev, ...patientFields }));
    if (patientFields.Mobile) setSearchMobile(patientFields.Mobile);
    const dateForFields = handleDateFunction({ year: years, month: months, days });
    setDateData({
      AgeYear: dateForFields?.AgeYear,
      AgeMonth: dateForFields?.AgeMonth,
      AgeDays: dateForFields?.AgeDays,
    });

    if (est.EstimateNoHash || est.EstimateNo) {
      estimateConvertRef.current = {
        estimateNo: est.EstimateNo || "",
        estimateNoHash: est.EstimateNoHash || "",
      };
    }

    pendingEstimateAutoFillRef.current = {
      centreId: est.CentreID ?? est.CentreId ?? est.BusinessUnitID ?? ls.centreId,
      rateTypeId: est.RateTypeID ?? est.RateTypeId ?? ls.rateTypeId,
      items: Array.isArray(items) ? items : [],
      patientFields,
      centreSelected: false,
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const pending = pendingEstimateAutoFillRef.current;
    if (!pending || pending.centreSelected || !CentreData?.length) return;
    const centreOption = CentreData.find(
      (c) => String(c.value) === String(pending.centreId),
    );
    pending.centreSelected = true;
    if (centreOption) {
      handleSearchSelectChange("CentreID", centreOption);
    } else if (pending.centreId) {
      toast.warn("Estimate centre is not available — please select centre manually.");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [CentreData]);

  // Centre selection reloads RateType; pick the estimate's rate type from it.
  useEffect(() => {
    const pending = pendingEstimateAutoFillRef.current;
    if (!pending?.centreSelected || !pending.rateTypeId || !RateType?.length) return;
    if (String(state?.RateID) === String(pending.rateTypeId)) return;
    const rateOption = RateType.find(
      (r) => String(r.value) === String(pending.rateTypeId),
    );
    if (rateOption) handleSearchSelectChange("RateID", rateOption);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [RateType]);

  // Add the estimate's tests once the matching rate type is selected (or,
  // when that rate type isn't offered for this centre, whichever one is).
  useEffect(() => {
    const pending = pendingEstimateAutoFillRef.current;
    if (!pending?.centreSelected || !state?.RateID) return;
    const rateAvailable = RateType?.some(
      (r) => String(r.value) === String(pending.rateTypeId),
    );
    if (rateAvailable && String(state.RateID) !== String(pending.rateTypeId)) return;
    pendingEstimateAutoFillRef.current = null; // only ever auto-add once

    // The centre / rate type cascade above runs several async state updates;
    // re-apply the estimate's patient details in case any of them replaced
    // state from an older snapshot.
    setState((prev) => ({ ...prev, ...pending.patientFields }));

    const rateID = state.RateID;
    (async () => {
      const notFound = [];
      for (const item of pending.items) {
        const code = item?.ItemCode ?? item?.TestCode;
        const name = item?.ItemName ?? item?.TestName;
        const id = item?.ItemId ?? item?.InvestigationID;
        try {
          const res = await axiosInstance.post("TestData/BindBillingTestData", {
            TestName: code || name,
            CentreID: rateID,
            SearchBy: code ? "TestCode" : "TestName",
            ActualRateTypeID: rateID,
            AllowZeroRateBooking: selectedRateType?.AllowZeroRateBooking || 0,
          });
          const list = res?.data?.success ? res?.data?.message || [] : [];
          const match =
            list.find((t) => id && String(t?.InvestigationID) === String(id)) ||
            list[0];
          if (match) {
            handleListSearch(
              {
                ...match,
                _rateTypeOverride: rateID,
                _patientGender: pending.patientFields?.Gender ?? state?.Gender,
                _patientAgeInDays:
                  pending.patientFields?.TotalAgeInDays ?? state?.TotalAgeInDays,
                _fromPrebooking: true,
              },
              "TestName",
            );
          } else {
            notFound.push(name || code);
          }
        } catch {
          notFound.push(name || code);
        }
      }
      if (notFound.length > 0) {
        toast.warn(`Couldn't auto-add: ${notFound.join(", ")} — please add manually.`);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state?.RateID]);

  const [rateIDForMemerber, setRateIDForMemerber] = useState(null);
  console.log(rateIDForMemerber, "rateIDForMemerber")
  const pendingCentreRef = useRef(null);

  const getCoPayment = async (RateTypeId) => {
    try {
      const response = await axiosInstance.get(`/Centre/Getcopayment`, {
        params: {
          RateTypeId: RateTypeId,
        },
      });
      if (response?.data?.message) {
        setisCoPayment(response?.data?.message || 0);
      }

      return response?.data;
    } catch (error) {
      console.error("Error fetching CoPayment:", error);
    }
  };

  const [moreErrors, setMoreErrors] = useState({});
  const [showMpesa, setShowMpesa] = useState(false);
  // const [isMpesaSelected, setIsMpesaSelected] = useState(false);
  const [Countries, setCountries] = useState([]);
  const [Cities, setCities] = useState([]);
  const [States, setStates] = useState([]);
  const [autoCompleteCountry, setAutoCompleteCountry] = useState("");
  const [autoCompleteState, setAutoCompleteState] = useState("");
  const [autoCompleteCity, setAutoCompleteCity] = useState("");
  const countryDraftRef = useRef("");
  const countriesListRef = useRef([]);
  const countrySelectedRef = useRef({ name: "", id: "" });
  const stateDraftRef = useRef("");
  const statesListRef = useRef([]);
  const stateSelectedRef = useRef({ name: "", id: "" });
  const stateSearchSeqRef = useRef(0);
  const rejectedStateRef = useRef("");
  const cityDraftRef = useRef("");
  const citiesListRef = useRef([]);
  const citySelectedRef = useRef({ name: "", id: "" });
  const citySearchSeqRef = useRef(0);
  const rejectedCityRef = useRef("");
  const cityInputRef = useRef(null);

  const refs = {
    CentreRef: useRef(),
    rateTypeRef: useRef(),
    titleRef: useRef(),
    nameRef: useRef(),
    ageRef: useRef(),
    RefLabRef: useRef(),
    RefDoctorRef: useRef(),
    testRef: useRef(),
    barcodeRef: useRef(),
    sampleCollectionDateRef: useRef(),
    reactSelectRef: useRef(),
    selectBoxRef: useRef(),
    inputRef: useRef(),
  };

  const refMap = {
    CentreID: "CentreRef",
    RateID: "rateTypeRef",
    Title: "titleRef",
    FirstName: "nameRef",
    AgeYear: "ageRef",
    ReferLabId: "RefLabRef",
    DoctorName: "RefDoctorRef",
    testSearch: "testRef",
    barcode: "barcodeRef",
    data: "sampleCollectionDateRef",
  };

  // const handleFocusNext = (e, next) => {
  //   if (e?.key === "Tab") {
  //     e?.preventDefault();
  //     refs[next]?.current?.focus();
  //   }
  // };

  const handleRateTypePaymode = useMemo(() => {
    const data = RateType.find((ele) => ele?.value == state?.RateID);
    return data?.PayMode;
  }, [state?.RateID, RateType]);


  const getDefaultPaymentMode = () => {
    if (handleRateTypePaymode === "Credit") {
      return { PaymentMode: "Credit", PaymentModeID: 215 };
    }

    if (DefaultCurrencyName === "KES") {
      return { PaymentMode: "M-Pesa", PaymentModeID: 1008 };
    }

    return { PaymentMode: "Cash", PaymentModeID: 134 };
  };

  const defaultPayment = getDefaultPaymentMode();



  const [hcPaymentMode, setHcPaymentMode] = useState(null);

  const getEffectivePayment = () => {
    if (handleRateTypePaymode === "Credit") {
      return defaultPayment;
    }
    if (DefaultCurrencyName === "KES" && hcPaymentMode?.PaymentModeID) {
      return hcPaymentMode;
    }
    return defaultPayment;
  };

  const getResolvedStateId = () =>
    Number(state?.StateID || stateSelectedRef.current?.id) || 0;

  const bindExactStateMatch = (list, typedName) => {
    const typed = String(typedName || "").trim().toLowerCase();
    if (!typed) return null;
    const exact = (list || []).find(
      (s) => String(s?.State || s?.StateName || "").toLowerCase() === typed,
    );
    if (!exact) return null;
    const id = exact.ID ?? exact.id ?? exact.StateID ?? exact.stateID ?? exact.value;
    stateSelectedRef.current = { name: exact.State || exact.StateName, id };
    setState((prev) => ({
      ...prev,
      State: exact.State || exact.StateName,
      StateID: id,
    }));
    return id;
  };

  const getCityDropDown = (stateId, name) => {
    const resolvedId = Number(stateId || getResolvedStateId()) || 0;
    const fetchCities = (id) => {
      if (!id) {
        citiesListRef.current = [];
        setCities([]);
        return;
      }
      const requestSeq = ++citySearchSeqRef.current;
      axiosInstance
        .post("CommonHC/SearchCityData", {
          stateId: id,
          cityName: name,
        })
        .then((res) => {
          if (requestSeq !== citySearchSeqRef.current) return;
          const response = res?.data?.message ?? res?.data?.data;
          const list = Array.isArray(response) ? response : [];
          citiesListRef.current = list;
          setCities(list);
        })
        .catch((err) => {
          toast.error(err?.res?.data ? err?.res?.data : "Something Went Wrong");
        });
    };

    if (resolvedId) {
      fetchCities(resolvedId);
      return;
    }

    const stateName = String(autoCompleteState || state?.State || "").trim();
    if (!stateName) {
      citiesListRef.current = [];
      setCities([]);
      return;
    }

    axiosInstance
      .post("CommonHC/SearchStateData", {
        countryId: getResolvedCountryId(),
        stateName,
      })
      .then((res) => {
        const response = res?.data?.message ?? res?.data?.data;
        const list = Array.isArray(response) ? response : [];
        const exact = list.find(
          (s) => String(s?.State || s?.StateName || "").toLowerCase() === stateName.toLowerCase(),
        );
        const id = exact?.ID ?? exact?.id ?? exact?.StateID ?? exact?.stateID ?? exact?.value;
        if (id) {
          bindExactStateMatch(list, stateName);
          fetchCities(id);
        } else {
          citiesListRef.current = [];
          setCities([]);
        }
      })
      .catch(() => {
        citiesListRef.current = [];
        setCities([]);
      });
  };

  const resetCityForStateChange = (nextStateId) => {
    setAutoCompleteCity("");
    cityDraftRef.current = "";
    citySelectedRef.current = { name: "", id: "" };
    citiesListRef.current = [];
    rejectedCityRef.current = "";
    setCities([]);
    if (nextStateId) {
      getCityDropDown(nextStateId, "");
    }
  };

  const getResolvedCountryId = () =>
    Number(state?.CountryID || countrySelectedRef.current?.id) || 1;

  const getStates = (countryId, name) => {
    const resolvedId = Number(countryId || getResolvedCountryId()) || 0;
    const requestSeq = ++stateSearchSeqRef.current;
    axiosInstance
      .post("CommonHC/SearchStateData", {
        countryId: resolvedId,
        stateName: name || "",
      })
      .then((res) => {
        if (requestSeq !== stateSearchSeqRef.current) return;
        const response = res?.data?.message ?? res?.data?.data;
        const list = Array.isArray(response) ? response : [];
        statesListRef.current = list;
        setStates(list);
        bindExactStateMatch(list, name);
      })
      .catch((err) => console.log(err));
  };

  const getCountries = (name) => {
    axiosInstance
      .post("CommonHC/SearchCountryData", {
        countryName: name,
      })
      .then((res) => {
        if (res?.data?.success) {
          const response = res?.data?.message;
          const list = Array.isArray(response) ? response : [];
          countriesListRef.current = list;
          setCountries(list);
        }
      })
      .catch((err) => console.log(err));
  };

  const applyCountryTypedValue = (rawValue) => {
    const original =
      typeof rawValue === "object" ? rawValue?.CountryName : rawValue;
    const typed = String(original ?? "");
    const countryCheck = validateCountryName(typed);
    // EPD-066: keep numeric/invalid input visible with a flag — do not strip it
    // to "" (that looked like a silent accept when the AutoComplete still showed
    // the typed digits).
    const display = countryCheck.isValid
      ? sanitizeCountryName(typed)
      : typed;
    setMoreErrors((prev) => {
      const next = { ...prev };
      if (!countryCheck.isValid) next.Country = countryCheck.message;
      else delete next.Country;
      return next;
    });
    setAutoCompleteCountry(display);
    countryDraftRef.current = display;
    if (countryCheck.isValid && display.trim()) {
      getCountries(display);
    }
    setState((prev) => {
      const keepSelection =
        countryCheck.isValid &&
        display &&
        String(prev.Country || "").toLowerCase() ===
          String(display).toLowerCase() &&
        !!prev.CountryID;
      if (!keepSelection) {
        countrySelectedRef.current = { name: "", id: "" };
      }
      return {
        ...prev,
        Country: display,
        CountryID: keepSelection ? prev.CountryID : "",
      };
    });
    return display;
  };

  const flagInvalidCountry = (typed, message) => {
    const value = String(typed ?? "").trim();
    flushSync(() => {
      setAutoCompleteCountry(value);
      countryDraftRef.current = value;
      countrySelectedRef.current = { name: "", id: "" };
      setState((prev) => ({ ...prev, Country: value, CountryID: "" }));
      setMoreErrors((prev) => ({
        ...prev,
        Country: message,
      }));
    });
  };

  const handleCountryBlur = (e) => {
    const nativeValue =
      e?.target?.value ??
      e?.originalEvent?.target?.value ??
      countryDraftRef.current ??
      autoCompleteCountry;
    const typed = String(
      countryDraftRef.current || autoCompleteCountry || nativeValue || "",
    ).trim();

    if (!typed) {
      setAutoCompleteCountry("");
      countryDraftRef.current = "";
      countrySelectedRef.current = { name: "", id: "" };
      setState((prev) => ({ ...prev, Country: "", CountryID: "" }));
      return;
    }

    const formatCheck = validateCountryName(typed);
    if (!formatCheck.isValid) {
      flagInvalidCountry(typed, formatCheck.message);
      return;
    }

    const listMatch = countriesListRef.current.find(
      (c) =>
        String(c?.CountryName || "").toLowerCase() === typed.toLowerCase(),
    );
    const selected = countrySelectedRef.current;
    const selectedMatch =
      selected?.id &&
      String(selected?.name || "").toLowerCase() === typed.toLowerCase()
        ? { CountryName: selected.name, CountryID: selected.id }
        : null;
    const match = listMatch || selectedMatch;

    if (match) {
      setAutoCompleteCountry(match.CountryName);
      countryDraftRef.current = match.CountryName;
      countrySelectedRef.current = {
        name: match.CountryName,
        id: match.CountryID ?? selected?.id ?? "",
      };
      setState((prev) => ({
        ...prev,
        Country: match.CountryName,
        CountryID: match.CountryID ?? prev.CountryID,
      }));
      clearValidationError("Country");
      return;
    }

    // EPD-065: keep "Atlantis" (etc.) visible and flag — do not clear silently.
    flagInvalidCountry(
      typed,
      "Please select a valid country from the list",
    );
  };

  const applyStateTypedValue = (rawValue) => {
    const val = typeof rawValue === "object" ? rawValue?.State : rawValue;
    const nextStateName = String(val ?? "").trim();
    if (
      rejectedStateRef.current &&
      nextStateName.toLowerCase() === rejectedStateRef.current
    ) {
      // Re-typing the same rejected value — keep it flagged.
      setAutoCompleteState(val ?? "");
      stateDraftRef.current = val ?? "";
      setMoreErrors((prev) => ({
        ...prev,
        State: prev.State || "State must belong to the selected country",
      }));
      return val;
    }
    if (
      nextStateName &&
      nextStateName.toLowerCase() !== rejectedStateRef.current
    ) {
      rejectedStateRef.current = "";
    }
    const prevStateName = String(
      stateDraftRef.current || autoCompleteState || "",
    ).trim();
    const stateChanged =
      prevStateName.toLowerCase() !== nextStateName.toLowerCase();
    stateDraftRef.current = val ?? "";
    setAutoCompleteState(val);
    getStates(getResolvedCountryId(), val);
    if (stateChanged) {
      stateSelectedRef.current = { name: "", id: "" };
      if (prevStateName || autoCompleteCity || state?.City) {
        resetCityForStateChange("");
      }
    }
    setState((prev) => ({
      ...prev,
      State: val,
      ...(stateChanged ? { City: "", StateID: "" } : {}),
    }));
    return val;
  };

  const flagInvalidState = (typed, message) => {
    const value = String(typed ?? "").trim();
    rejectedStateRef.current = value.toLowerCase();
    flushSync(() => {
      setAutoCompleteState(value);
      stateDraftRef.current = value;
      stateSelectedRef.current = { name: "", id: "" };
      setState((prev) => ({ ...prev, State: value, StateID: "" }));
      setMoreErrors((prev) => ({
        ...prev,
        State: message,
      }));
    });
  };

  const handleStateBlur = (e) => {
    const nativeValue =
      e?.target?.value ??
      e?.originalEvent?.target?.value ??
      stateDraftRef.current ??
      autoCompleteState;
    const typed = String(
      stateDraftRef.current || autoCompleteState || nativeValue || "",
    ).trim();
    const countryId = getResolvedCountryId();
    const countrySelected = !!(
      countryId ||
      countrySelectedRef.current?.id ||
      countrySelectedRef.current?.name ||
      state?.Country
    );
    const listMatch = statesListRef.current.find(
      (s) => String(s?.State || "").toLowerCase() === typed.toLowerCase(),
    );
    const selected = stateSelectedRef.current;
    const selectedMatch =
      selected?.id &&
      String(selected?.name || "").toLowerCase() === typed.toLowerCase()
        ? { State: selected.name, ID: selected.id }
        : null;

    const keepValidState = (match) => {
      const name = match.State || match.StateName;
      const id = match.ID ?? match.id ?? match.StateID ?? match.stateID ?? match.value;
      setAutoCompleteState(name);
      stateDraftRef.current = name;
      stateSelectedRef.current = { name, id };
      rejectedStateRef.current = "";
      setState((prev) => ({
        ...prev,
        State: name,
        StateID: id ?? prev.StateID,
      }));
      clearValidationError("State");
    };

    if (!typed) {
      setAutoCompleteState("");
      setState((prev) => ({ ...prev, State: "", StateID: "" }));
      return;
    }

    // EPD-067: when a country is chosen, the state must be in that country's master.
    // Do not accept a global listMatch if CountryID is missing/wrong.
    if (countrySelected) {
      if (countryId && listMatch) {
        keepValidState(listMatch);
        return;
      }
      if (countryId && selectedMatch) {
        keepValidState(selectedMatch);
        return;
      }
      if (listMatch) {
        keepValidState(listMatch);
        return;
      }
      if (selectedMatch) {
        keepValidState(selectedMatch);
        return;
      }
      flagInvalidState(
        typed,
        "State must belong to the selected country",
      );
      return;
    }

    const match = listMatch || selectedMatch;
    if (match) {
      keepValidState(match);
      return;
    }

    flagInvalidState(typed, "Please select a valid state from the list");
  };

  const applyCityTypedValue = (rawValue) => {
    const val = typeof rawValue === "object" ? rawValue?.City : rawValue;
    const nextCityName = String(val ?? "").trim();
    if (
      rejectedCityRef.current &&
      nextCityName.toLowerCase() === rejectedCityRef.current
    ) {
      setAutoCompleteCity(val ?? "");
      cityDraftRef.current = val ?? "";
      setMoreErrors((prev) => ({
        ...prev,
        City: prev.City || "City must belong to the selected state",
      }));
      return val;
    }
    if (
      nextCityName &&
      nextCityName.toLowerCase() !== rejectedCityRef.current
    ) {
      rejectedCityRef.current = "";
    }
    cityDraftRef.current = val ?? "";
    setAutoCompleteCity(val);
    citySelectedRef.current = { name: "", id: "" };
    getCityDropDown(getResolvedStateId(), val);
    setState((prev) => ({ ...prev, City: val }));
    return val;
  };

  const flagInvalidCity = (message, typedValue) => {
    const value = String(
      typedValue || cityDraftRef.current || autoCompleteCity || "",
    ).trim();
    rejectedCityRef.current = value.toLowerCase();
    flushSync(() => {
      setAutoCompleteCity(value);
      cityDraftRef.current = value;
      citySelectedRef.current = { name: "", id: "" };
      setState((prev) => ({ ...prev, City: value }));
      setMoreErrors((prev) => ({
        ...prev,
        City: message,
      }));
    });
  };

  const handleCityBlur = (e) => {
    const nativeValue =
      e?.target?.value ??
      e?.originalEvent?.target?.value ??
      cityInputRef.current?.value;
    const typed = String(
      cityDraftRef.current || autoCompleteCity || nativeValue || "",
    ).trim();
    const stateSelected = !!(
      getResolvedStateId() ||
      state?.State ||
      autoCompleteState
    );
    const listMatch = citiesListRef.current.find(
      (c) => String(c?.City || "").toLowerCase() === typed.toLowerCase(),
    );
    const selected = citySelectedRef.current;
    const selectedMatch =
      selected?.id &&
      String(selected?.name || "").toLowerCase() === typed.toLowerCase()
        ? { City: selected.name, ID: selected.id }
        : null;

    const keepValidCity = (match) => {
      const name = match.City || match.CityName;
      const id = match.ID ?? match.id ?? match.CityID ?? match.cityID ?? match.value;
      setAutoCompleteCity(name);
      cityDraftRef.current = name;
      citySelectedRef.current = { name, id };
      rejectedCityRef.current = "";
      setState((prev) => ({ ...prev, City: name, CityID: id ?? prev.CityID }));
      clearValidationError("City");
    };

    if (!typed) {
      setAutoCompleteCity("");
      setState((prev) => ({ ...prev, City: "", CityID: "" }));
      return;
    }

    if (stateSelected) {
      if (listMatch) {
        keepValidCity(listMatch);
        return;
      }
      if (selectedMatch) {
        keepValidCity(selectedMatch);
        return;
      }
      // EPD-068: keep "Mumbai" visible when it does not belong to the selected state.
      flagInvalidCity("City must belong to the selected state", typed);
      return;
    }

    const match = listMatch || selectedMatch;
    if (match) {
      keepValidCity(match);
      return;
    }

    flagInvalidCity("Please select a valid city from the list", typed);
  };

  const handleAutoCompleteChange = (e) => {
    const name = e.target?.name || e.originalEvent?.target?.name;
    if (name === "Country") {
      applyCountryTypedValue(e.value);
    } else if (name === "State" || name === "County") {
      applyStateTypedValue(e.value);
    } else if (name === "City") {
      applyCityTypedValue(e.value);
    } else {
      const val = typeof e.value === "object" ? e.value.City : e.value;
      setAutoCompleteCity(val);
      getCityDropDown(getResolvedStateId(), val);
      setState((prev) => ({ ...prev, [name]: val }));
    }
  };
  const handleAutoCompleteSelect = (type) => (e) => {
    const selected = e.value;
    if (type === "Country") {
      const countryName = selected?.CountryName || selected;
      const countryId = selected?.CountryID ?? selected?.countryID ?? "";
      clearValidationError("Country");
      setAutoCompleteCountry(countryName);
      countryDraftRef.current = countryName;
      countrySelectedRef.current = { name: countryName, id: countryId };
      setAutoCompleteState("");
      stateDraftRef.current = "";
      stateSelectedRef.current = { name: "", id: "" };
      setState((prev) => ({
        ...prev,
        Country: countryName,
        CountryID: countryId,
        State: "",
        StateID: "",
        City: "",
      }));
    }
    if (type === "State") {
      const nextState = selected?.State || selected?.StateName || (typeof selected === "string" ? selected : "");
      const nextStateId = selected?.ID ?? selected?.StateID ?? selected?.stateID ?? selected?.id ?? selected?.value ?? (typeof selected === "number" ? selected : "");
      setAutoCompleteState(nextState);
      stateDraftRef.current = nextState;
      stateSelectedRef.current = { name: nextState, id: nextStateId };
      rejectedStateRef.current = "";
      clearValidationError("State");
      resetCityForStateChange(nextStateId);
      setState((prev) => ({
        ...prev,
        State: nextState,
        StateID: nextStateId,
        City: "",
        CityID: "",
      }));
    }
    if (type === "City") {
      const nextCity = selected?.City || selected?.CityName || (typeof selected === "string" ? selected : "");
      const nextCityId = selected?.ID ?? selected?.CityID ?? selected?.cityID ?? selected?.id ?? selected?.value ?? (typeof selected === "number" ? selected : "");
      setAutoCompleteCity(nextCity);
      cityDraftRef.current = nextCity;
      citySelectedRef.current = { name: nextCity, id: nextCityId };
      rejectedCityRef.current = "";
      clearValidationError("City");
      setState((prev) => ({
        ...prev,
        City: nextCity,
        CityID: nextCityId,
      }));
    }
  };

  const getVoiceOptions = (id) => {
    switch (id) {
      case "CentreID":
        return CentreData;
      case "DoctorID":
      case "DoctorName":
        return doctorSuggestion;
      case "SecondReferDoctor":
        return seconddoctorSuggestion;
      case "RateID":
      case "RateTypeId":
        return RateType;
      case "SampleBy":
      case "CollectionBoyId":
        return CollectionBoy;
      case "Gender":
        return Gender;
      case "Title":
        return Title;
      case "CentreType":
        return VisitType;
      case "VisitType":
        return VisitType;
      case "Category":
        return Category;
      case "testSearch":
        return suggestion;
      // City / State / Country autocomplete options
      case "Country":
        return Countries;
      case "State":
        return States;
      case "City":
        return Cities;
      // ID type dropdown options
      case "PatientIDProof":
        return Identity;
      case "IdType":
        return Identity;
      default:
        return [];
    }
  };

  const handleVoiceTestSearch = (text) => {
    const fakeEvent = { target: { name: "TestName", value: text } };
    if (typeof handleChange === "function") {
      handleChange(fakeEvent);
    }
  };

  const countryTemplate = (item) => (
    <div className="p-clearfix">
      <div style={{ float: "left", fontSize: "12px", width: "100%" }}>
        {item?.CountryName}
      </div>
    </div>
  );
  const stateTemplate = (item) => (
    <div className="p-clearfix">
      <div style={{ float: "left", fontSize: "12px", width: "100%" }}>
        {item?.State}
      </div>
    </div>
  );
  const cityTemplate = (item) => (
    <div className="p-clearfix">
      <div style={{ float: "left", fontSize: "12px", width: "100%" }}>
        {item?.City}
      </div>
    </div>
  );

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

      const formattedNameFull = [name, mobile, department, specialization]
        .filter(
          (item) =>
            item && String(item).trim() !== "" && item !== 0 && item !== "0",
        )
        .join("~");

      const doctorId =
        refDoctorModalData?.doctorId || refDoctorModalData?.DoctorReferalID;

      if (refDoctorModalData?.Type === "Secondary") {
        setFormData((prev) => ({
          ...prev,
          SecondReferDoctor: formattedNameFull,
        }));
        setLTData((prev) => ({
          ...prev,
          SecondReferDoctor: name,
        }));
        setSecondDropFalse(false);
      } else {
        setFormData((prev) => ({ ...prev, DoctorName: formattedNameFull }));
        setLTData((prev) => ({
          ...prev,
          DoctorID: doctorId,
          DoctorName: name,
        }));
        setDropFalse(false);
      }

      // Clear Modal Data so it doesn't trigger again unexpectedly
      dispatch(setRefDoctorModalData(null));
    }
  }, [refDoctorModalData?.doctorId, refDoctorModalData?.DoctorReferalID]);
  useEffect(() => {
    if (!isDefaultReferalDoctorSelf) return;

    const tempFormData = { DoctorName: "SELF" };

    getDoctorSuggestion(
      tempFormData,
      (suggestions) => {
        if (!suggestions || suggestions.length === 0) return;

        const selfDoctor =
          suggestions.find((d) => d?.Name?.trim()?.toUpperCase() === "SELF") ||
          suggestions[0];

        if (!selfDoctor) return;

        const dept = selfDoctor?.Department || selfDoctor?.DeptName || "";
        const spec = selfDoctor?.Specialization || selfDoctor?.Speciality || "";

        const formattedNameFull = [
          selfDoctor.Name,
          selfDoctor.Mobile,
          dept,
          spec,
        ]
          .filter(
            (item) =>
              item && String(item).trim() !== "" && item !== 0 && item !== "0",
          )
          .join("~");

        setFormData((prev) => ({
          ...prev,
          DoctorName: formattedNameFull,
          SecondReferDoctor: formattedNameFull,
        }));

        setLTData((prev) => ({
          ...prev,
          DoctorName: selfDoctor.Name,
          DoctorID: selfDoctor.DoctorReferalID,
          DoctorMobile: selfDoctor?.Mobile || "",
          DoctorEmail: selfDoctor?.Email || "",
          SecondReferDoctor: selfDoctor.Name,
        }));
      },
      () => { },
    );
  }, [isDefaultReferalDoctorSelf]);

  useEffect(() => {
    if (refLabModalData?.referId) {
      setLTData((prev) => ({
        ...prev,
        ReferLabId: String(refLabModalData?.referId),
      }));
    }
  }, [refLabModalData?.referId]);

  const controllerDynamic = async () => {
    const { controllersData, controllerTabbingOrder } =
      await getSearchController(PAGE_ID);
    let filterTabbingOrder = controllerTabbingOrder?.map((ele) => {
      if (
        [1]?.includes(BarcodeLogic) &&
        ele?.ControlDisplayID == "barcode"
        // [1]?.includes(BarcodeLogic) && (ele?.ControlDisplayID == 'barcode' || ele?.ControlDisplayID == 'BarcodeNo')
      ) {
        return;
      } else {
        return { ...ele };
      }
    });
    setTabbingOrder(filterTabbingOrder);
    setControllerDynamicList(controllersData);
    const defaultTabFocusId = controllerTabbingOrder?.find(
      (item) => item?.TabOrder == 1,
    );
    // autofocusTitle("Title")
    autofocusTitle(defaultTabFocusId?.ControlDisplayID);
  };

  useEffect(() => {
    if (!tabbingOrder?.length) return;

    const first = tabbingOrder.find((c) => c.TabOrder === 1);
    if (!first) return;

    setTimeout(() => {
      const el = document.getElementById(first.ControlDisplayID);
      const input = el?.querySelector("input, select, textarea, button");
      if (input || el) {
        (input || el).focus();
        isAutoFocused.current = true;
      }
    }, 0);
  }, [tabbingOrder]);

  const getFieldValue = (controlId) => {
    const fieldMap = {
      CentreID: LTData?.CentreID,
      RateID: state?.RateID,
      VisitType: LTData?.VisitType,
      PatientCode: state?.PatientCode,
      PreBookingNo: state?.PreBookingNo,
      MembershipNo: membershipnum,
      Mobile: state?.Mobile,
      Title: state?.Title,
      FirstName: state?.FirstName,
      MiddleName: state?.MiddleName,
      LastName: state?.LastName,
      ReferLabId: LTData?.ReferLabId,
      DoctorName: formData?.DoctorName,
      DOB: state?.DOB,
      AgeYear: state?.AgeYear,
      AgeMonth: state?.AgeMonth,
      AgeDays: state?.AgeDays,
      Gender: state?.Gender,
      CollectionBoyId: LTData?.CollectionBoyId,
      IdType: LTData?.PatientIDProof,
      PatientIDProofNo: LTData?.PatientIDProofNo,
      Email: state?.Email,
      BarcodeNo: state?.BarcodeNo,
      HMIS_PatCrNo: state?.HMIS_PatCrNo,
      nikshayID: state?.nikshayID,
      trfNo: trfNo,
      RegistrationDate: LTData?.RegistrationDate,
      HouseNo: state?.HouseNo,
      City: state?.City,
      State: state?.State,
      Country: state?.Country,
      PinCode: state?.PinCode,
      Locality: state?.Locality,
      SrfId: LTData?.SrfId,
      IcmrId: LTData?.IcmrId,
      NoOfChildren: Pndt?.NoOfChildren,
      NoOfSon: Pndt?.NoOfSon,
      NoOfDaughter: Pndt?.NoOfDaughter,
      Pregnancy: Pndt?.Pregnancy,
      AgeOfSon: Pndt?.AgeOfSon,
      Category: LTData?.Category,
      testSearch: "", // This is a search field, usually not validated
      barcode: state?.BarcodeNo,
      data: sampleCollectionDateTime?.data,
      time: sampleCollectionDateTime?.time,
      CouponCode: coupon?.code,
      SecondaryMobile: SecondaryMobile,
      ReferDoctorRemarks: LTData?.ReferDoctorRemarks,
    };
    return fieldMap[controlId] || state[controlId] || LTData[controlId] || "";
  };

  const ignoreValidation = (controlId) => {
    const ignoreList = ["Category", "SecondReferDoctor"];
    if (userdata.AllowTestAddWithOutAge == 1) {
      ignoreList.push("AgeYear");
      ignoreList.push("DOB");
      ignoreList.push("AgeDays");
      ignoreList.push("AgeMonth");
    }
    return ignoreList.includes(controlId);
  };

  const getFieldErrorClass = (controlId) => {
    return moreErrors?.[controlId] ? "error border-danger" : "";
  };

  const renderErrorMessage = (controlId, isMandatory = false) => {
    return null;
  };

  const ageValidation = () => {
    let isAnyAgeFieldShown = false;

    controllerDynamicList?.forEach((item) => {
      if (
        ["AgeYear", "AgeMonth", "AgeDays"].includes(item?.ControlDisplayID) &&
        item.IsShow === 1
      ) {
        isAnyAgeFieldShown = true;
      }
    });

    if (!isAnyAgeFieldShown) return false;

    const ageYear = Number(getFieldValue("AgeYear") || 0);
    const ageMonth = Number(getFieldValue("AgeMonth") || 0);
    const ageDay = Number(getFieldValue("AgeDays") || 0);

    return ageYear > 0 || ageMonth > 0 || ageDay > 0;
  };

  const VALIDATION_REGEX = {
    PAN_REGEX: /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/,
    AADHAAR_REGEX: /^[2-9]{1}[0-9]{11}$/,
    PINCODE_REGEX: /^[1-9][0-9]{5}$/,
    EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/,
    NORMAL_INPUT_REGEX: /^[A-Za-z1-9][A-Za-z0-9]{24}$/,
  };

  const getAadhaarError = (value) => validateAadhaarNumber(value).message;

  const syncAadhaarProofError = (proofNo) => {
    const aadhaarError = getAadhaarError(proofNo);
    setMoreErrors((prev) => {
      const next = { ...prev };
      if (aadhaarError) next.PatientIDProofNo = aadhaarError;
      else delete next.PatientIDProofNo;
      return next;
    });
  };

  const validateId = (type, value) => {
    if (isPanIdType(type)) {
      const trimmed = String(value || "").trim();
      return !!trimmed && validatePanNumber(trimmed).isValid;
    }
    if (isAadhaarIdType(type))
      return !!value && validateAadhaarNumber(value).isValid;
    return VALIDATION_REGEX["NORMAL_INPUT_REGEX"].test(value);
  };


  const validateMandatoryFields = () => {
    const validationErrors = {};

    if (!state?.Title || state?.Title.trim() === "") {
      validationErrors["Title"] = "Title is required";
    }

    if (!state?.Gender || state?.Gender.trim() === "") {
      validationErrors["Gender"] = "Gender is required";
    }

    if (state?.Email && state.Email.trim() !== "") {
      const emailCheck = validateEmail(state.Email);
      if (!emailCheck.isValid) {
        validationErrors["Email"] = emailCheck.message;
      }
    }

    // FirstName is required for patients under 120 years old
    if (
      Number(state?.AgeYear || 0) < 120 &&
      (!state?.FirstName || state.FirstName.trim() === "")
    ) {
      validationErrors["FirstName"] = "First Name is required";
    }

    const maleTitles = ["Mr.", "Baba", "Dr.(Mr)", "Master"];
    const femaleTitles = [
      "Miss.",
      "Mrs.",
      "Baby",
      "Dr.(Miss)",
      "Dr.(Mrs)",
      "Ms.",
      "SMT.",
    ];

    if (state?.Title && maleTitles.includes(state?.Title) && state?.Gender !== "Male") {
      validationErrors["Gender"] = "Gender must be Male for the selected Title";
    }

    if (state?.Title && femaleTitles.includes(state?.Title) && state?.Gender !== "Female") {
      validationErrors["Gender"] = "Gender must be Female for the selected Title";
    }

    if (selectedDiscount?.isDiscountDocument === 1) {
      if (!UploadDoumentType.includes(selectedDiscount?.documentName)) {
        validationErrors["uploadFile"] =
          `${selectedDiscount?.documentName} is required `;
      }
    }
    if (LTData?.DiscountType == 1 && (Number(disAmt) > 0 || Number(discountPercentage) > 0) && DefaultCurrencyName === "KES") {
      if (!UploadDoumentType.includes("DiscountDocument")) {
        validationErrors["uploadFile"] =
          `${"DiscountDocument"} is required `;
      }
    }

    if (!controllerDynamicList || controllerDynamicList.length === 0) {
      if (isAadhaarIdType(LTData?.PatientIDProof) && LTData?.PatientIDProofNo) {
        const aadhaarError = getAadhaarError(LTData.PatientIDProofNo);
        if (aadhaarError) validationErrors["PatientIDProofNo"] = aadhaarError;
      }
      const addressError = validateAddress(state?.HouseNo);
      if (!addressError.isValid) {
        validationErrors["HouseNo"] = addressError.message;
      }
      const lastNameError = validateLastName(state?.LastName);
      if (!lastNameError.isValid) {
        validationErrors["LastName"] = lastNameError.message;
      }
      const firstNameError = validateFirstName(state?.FirstName);
      if (!firstNameError.isValid) {
        validationErrors["FirstName"] = firstNameError.message;
      }
      const mobileDigitError = validateMobileDigits(state?.Mobile);
      if (!mobileDigitError.isValid) {
        validationErrors["Mobile"] = mobileDigitError.message;
      }
      const phoneError = validatePhone(
        SecondaryMobile,
        getPhoneMaxLength(DefaultCurrencyName),
      );
      if (!phoneError.isValid) {
        validationErrors["SecondaryMobile"] = phoneError.message;
      }
      const trfError = validateTrfNo(trfNo);
      if (!trfError.isValid) {
        validationErrors["trfNo"] = trfError.message;
      }
      ["AgeYear", "AgeMonth", "AgeDays"].forEach((field) => {
        const agePartError = validateAgeComponent(field, state?.[field]);
        if (!agePartError.isValid) {
          validationErrors[field] = agePartError.message;
        }
      });
      const countryCheck = validateCountryName(state?.Country || autoCompleteCountry);
      if (!countryCheck.isValid) {
        validationErrors["Country"] = countryCheck.message;
      }
      const typedState = String(state?.State || autoCompleteState || "").trim();
      if (typedState && !state?.StateID) {
        validationErrors["State"] =
          state?.CountryID || countrySelectedRef.current?.id || state?.Country
            ? "State must belong to the selected country"
            : "Please select a valid state from the list";
      }
      const typedCity = String(state?.City || autoCompleteCity || "").trim();
      if (typedCity) {
        const cityOk =
          citySelectedRef.current?.name &&
          String(citySelectedRef.current.name).toLowerCase() === typedCity.toLowerCase();
        const cityInList = citiesListRef.current.some(
          (c) => String(c?.City || "").toLowerCase() === typedCity.toLowerCase(),
        );
        if (!cityOk && !cityInList) {
          validationErrors["City"] =
            state?.StateID || stateSelectedRef.current?.id || state?.State
              ? "City must belong to the selected state"
              : "Please select a valid city from the list";
        }
      }
      const weightCheck = validateWeight(state?.Weight);
      if (!weightCheck.isValid) {
        validationErrors["Weight"] = weightCheck.message;
      }
      const dobCheck = validateDob(state?.DOB);
      if (!dobCheck.isValid) {
        validationErrors["DOB"] = dobCheck.message;
      }
      return validationErrors;
    }

    controllerDynamicList.forEach((item) => {
      let isMandatoryField =
        selectedRateType?.PayMode?.toUpperCase() === "CREDIT"
          ? false
          : item.IsMandatory == 1;

      if (
        item.ControlDisplayID === "Mobile" &&
        LTData?.BTB != 1 &&
        LTData?.SUBPCC != 1
      ) {
        isMandatoryField = selectedRateType?.IsMobileRequired == 1;
      }

      if (
        isMandatoryField &&
        item.IsShow == 1 &&
        !ignoreValidation(item.ControlDisplayID)
      ) {
        const fieldValue = getFieldValue(item.ControlDisplayID);
        // Check if field is empty, null, undefined, or just whitespace
        const isEmpty =
          !fieldValue ||
          fieldValue === null ||
          fieldValue === undefined ||
          fieldValue.toString().trim() === "" ||
          fieldValue.toString().trim() === "0" ||
          (Array.isArray(fieldValue) && fieldValue.length === 0);

        if (isEmpty) {

          validationErrors[item.ControlDisplayID] =
            `${item?.ControlDisplayName || item.ControlDisplayID} is required`;
        }
        if (item.ControlDisplayID == "IdType") {
          let value = getFieldValue("PatientIDProofNo");
          let selectedIdType = getFieldValue("IdType");
          let validaionCheck = validateId(selectedIdType, value);
          if (selectedIdType && !validaionCheck) {
            validationErrors["PatientIDProofNo"] =
              `Please Enter Valid ${selectedIdType}`;
          }
        }

        if (fieldValue) {
          const pattern = item?.validationLogic?.slice(1, -1);
          let isValidValue = new RegExp(pattern).test(fieldValue);
          if (!isValidValue) {
            validationErrors[item.ControlDisplayID] =
              `${item?.ControlDisplayName || item.ControlDisplayID} is not valid`;
          }
        }
        if (!ageValidation()) {
          validationErrors["AgeYear"] = `Age is required`;
        }
      }
    });

    // if (
    //   selectedRateType?.RequiredAttachment
    // ) {
    //   const parsedAttachments = (() => {
    //     try {
    //       const val = selectedRateType.RequiredAttachment;
    //       return typeof val === "string" ? JSON.parse(val) : val;
    //     } catch {
    //       return [];
    //     }
    //   })();

    //   if (Array.isArray(parsedAttachments)) {
    //     parsedAttachments.forEach((doc) => {
    //       const docName = doc?.RequiredFeildName;
    //       if (!UploadDoumentType?.includes(docName)) {
    //         if (!validationErrors["uploadFile"]) {
    //           validationErrors["uploadFile"] = [];
    //         }
    //         validationErrors["uploadFile"].push(`${docName} is required`);
    //       }
    //     });
    //   }
    // }
    // if (doctorRequiredAttachment.length > 0) {
    //   doctorRequiredAttachment.forEach((doc) => {
    //     const docName = doc?.RequiredFeildName;
    //     if (!UploadDoumentType?.includes(docName)) {
    //       if (!validationErrors["uploadFile"]) {
    //         validationErrors["uploadFile"] = [];
    //       }
    //       validationErrors["uploadFile"].push(`${docName} is required for referred doctor`);
    //     }
    //   });
    // }

    // Combine both attachment lists
    const allRequiredAttachments = [];

    if (selectedRateType?.RequiredAttachment) {
      try {
        const val = selectedRateType.RequiredAttachment;
        const parsed = typeof val === "string" ? JSON.parse(val) : val;
        if (Array.isArray(parsed)) {
          parsed.forEach((doc) => {
            if (doc?.RequiredFeildName && !allRequiredAttachments.includes(doc.RequiredFeildName)) {
              allRequiredAttachments.push(doc.RequiredFeildName);
            }
          });
        }
      } catch { }
    }

    if (doctorRequiredAttachment.length > 0) {
      doctorRequiredAttachment.forEach((doc) => {
        if (doc?.RequiredFeildName && !allRequiredAttachments.includes(doc.RequiredFeildName)) {
          allRequiredAttachments.push(doc.RequiredFeildName);
        }
      });
    }
    const missingDocs = [];

    allRequiredAttachments.forEach((docName) => {
      if (!UploadDoumentType?.includes(docName)) {
        missingDocs.push(docName);
      }
    });

    if (missingDocs.length > 0) {
      validationErrors["uploadFile"] =
        missingDocs.map(doc => `• ${doc} is required for Attachment`).join("\n");
    }

    // Add logic for test-specific required fields (RequiredFeildList) and attachments (RequiredAttachment)
    tableData.forEach((test) => {
      // Handle Required Fields
      if (test.RequiredFeildList && test.RequiredFeildList !== "[]") {
        try {
          const requiredFields =
            typeof test.RequiredFeildList === "string"
              ? JSON.parse(test.RequiredFeildList)
              : test.RequiredFeildList;

          if (Array.isArray(requiredFields)) {
            requiredFields.forEach((field) => {
              const fieldName = field.RequiredFeildName;
              let controlId = fieldName;
              const lowerName = fieldName?.toLowerCase();

              // Map common API field names to controlIds used in getFieldValue
              if (lowerName === "mobileno" || lowerName === "mobile")
                controlId = "Mobile";
              if (lowerName === "houseno" || lowerName === "address")
                controlId = "HouseNo";
              if (lowerName === "pincode" || lowerName === "zipcode")
                controlId = "PinCode";
              if (lowerName === "email") controlId = "Email";
              if (
                lowerName === "idproof" ||
                lowerName === "idproofno" ||
                lowerName === "patientidproofno"
              )
                controlId = "PatientIDProofNo";

              const fieldValue = getFieldValue(controlId);
              const isEmpty =
                !fieldValue ||
                fieldValue === null ||
                fieldValue === undefined ||
                fieldValue.toString().trim() === "" ||
                fieldValue.toString().trim() === "0" ||
                (Array.isArray(fieldValue) && fieldValue.length === 0);

              if (isEmpty) {
                // Check if the field is hidden or visible
                const controllerItem = controllerDynamicList.find(
                  (x) =>
                    x?.ControlDisplayID?.toLowerCase() ===
                    controlId?.toLowerCase(),
                );

                // Only add to validationErrors if the field is actually VISIBLE on the form
                // If it's hidden, we'll handle it via the modal in saveData()
                if (!controllerItem || controllerItem.IsShow !== 0) {
                  validationErrors[controlId] =
                    `${field.RequiredFeildName} is required for test: ${test.TestName}`;
                }
              }
            });
          }
        } catch (e) {
          console.error(
            "Error parsing RequiredFeildList for test:",
            test.TestName,
            e,
          );
        }
      }

      // Handle Required Attachments
      if (
        test.RequiredAttachment &&
        test.RequiredAttachment !== "" &&
        test.RequiredAttachment !== "[]"
      ) {
        try {
          const requiredDocs =
            typeof test.RequiredAttachment === "string"
              ? JSON.parse(test.RequiredAttachment)
              : test.RequiredAttachment;

          if (Array.isArray(requiredDocs)) {
            requiredDocs.forEach((docName) => {
              if (!UploadDoumentType.includes(docName)) {
                validationErrors["uploadFile"] =
                  `Attachment '${docName}' is required for test: ${test.TestName}`;
              }
            });
          } else if (
            typeof test.RequiredAttachment === "string" &&
            test.RequiredAttachment.trim() !== ""
          ) {
            // Handle cases where it might just be a single string instead of a JSON array
            if (!UploadDoumentType.includes(test.RequiredAttachment)) {
              validationErrors["uploadFile"] =
                `Attachment '${test.RequiredAttachment}' is required for test: ${test.TestName}`;
            }
          }
        } catch (e) {
          // If JSON parse fails, treat as a single string
          if (!UploadDoumentType.includes(test.RequiredAttachment)) {
            validationErrors["uploadFile"] =
              `Attachment '${test.RequiredAttachment}' is required for test: ${test.TestName}`;
          }
        }
      }
    });

    if (isAadhaarIdType(LTData?.PatientIDProof) && LTData?.PatientIDProofNo) {
      const aadhaarError = getAadhaarError(LTData.PatientIDProofNo);
      if (aadhaarError) validationErrors["PatientIDProofNo"] = aadhaarError;
    }
    const addressError = validateAddress(state?.HouseNo);
    if (!addressError.isValid) {
      validationErrors["HouseNo"] = addressError.message;
    }
    const lastNameError = validateLastName(state?.LastName);
    if (!lastNameError.isValid) {
      validationErrors["LastName"] = lastNameError.message;
    }
    const firstNameError = validateFirstName(state?.FirstName);
    if (!firstNameError.isValid) {
      validationErrors["FirstName"] = firstNameError.message;
    }
    const mobileDigitError = validateMobileDigits(state?.Mobile);
    if (!mobileDigitError.isValid) {
      validationErrors["Mobile"] = mobileDigitError.message;
    }
    const phoneError = validatePhone(
      SecondaryMobile,
      getPhoneMaxLength(DefaultCurrencyName),
    );
    if (!phoneError.isValid) {
      validationErrors["SecondaryMobile"] = phoneError.message;
    }
    const trfError = validateTrfNo(trfNo);
    if (!trfError.isValid) {
      validationErrors["trfNo"] = trfError.message;
    }
    ["AgeYear", "AgeMonth", "AgeDays"].forEach((field) => {
      const agePartError = validateAgeComponent(field, state?.[field]);
      if (!agePartError.isValid) {
        validationErrors[field] = agePartError.message;
      }
    });
    const countryCheck = validateCountryName(state?.Country || autoCompleteCountry);
    if (!countryCheck.isValid) {
      validationErrors["Country"] = countryCheck.message;
    }
    const typedState = String(state?.State || autoCompleteState || "").trim();
    if (typedState && !state?.StateID) {
      validationErrors["State"] =
        state?.CountryID || countrySelectedRef.current?.id || state?.Country
          ? "State must belong to the selected country"
          : "Please select a valid state from the list";
    }
    const typedCity = String(state?.City || autoCompleteCity || "").trim();
    if (typedCity) {
      const cityOk =
        citySelectedRef.current?.name &&
        String(citySelectedRef.current.name).toLowerCase() === typedCity.toLowerCase();
      const cityInList = citiesListRef.current.some(
        (c) => String(c?.City || "").toLowerCase() === typedCity.toLowerCase(),
      );
      if (!cityOk && !cityInList) {
        validationErrors["City"] =
          state?.StateID || stateSelectedRef.current?.id || state?.State
            ? "City must belong to the selected state"
            : "Please select a valid city from the list";
      }
    }
    const weightCheck = validateWeight(state?.Weight);
    if (!weightCheck.isValid) {
      validationErrors["Weight"] = weightCheck.message;
    }
    const dobCheck = validateDob(state?.DOB);
    if (!dobCheck.isValid) {
      validationErrors["DOB"] = dobCheck.message;
    }

    return validationErrors;
  };

  const clearValidationError = (fieldName) => {
    const lowerField = fieldName?.toLowerCase();

    // Check moreErrors keys case-insensitively
    Object.keys(moreErrors).forEach((key) => {
      if (key?.toLowerCase() === lowerField) {
        setMoreErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors[key];
          return newErrors;
        });
      }
    });

    const controllerItem = controllerDynamicList.find(
      (item) => item.ControlDisplayID?.toLowerCase() === lowerField,
    );

    if (controllerItem && moreErrors[controllerItem.ControlDisplayID]) {
      setMoreErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[controllerItem.ControlDisplayID];
        return newErrors;
      });
    }
  };

  const showValidationSummary = (validationErrors) => {
    const errors = Object.values(validationErrors || moreErrors).filter(
      (error) => error,
    );
    if (errors.length > 0) {
      const errorList = errors.join("\n• ");
      toast.error(`${errorList}`, {
        autoClose: 5000,
        style: {
          whiteSpace: "pre-line",
        },
      });
    }
  };

  // Dynamic validation function
  const validateDynamicFields = () => {
    const validationErrors = validateMandatoryFields();
    setMoreErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) {
      showValidationSummary(validationErrors);
      return false;
    }
    return true;
  };

  // Returns list of fields that are required by a test (RequiredFeildList)
  // but are hidden in controllerDynamicList (IsShow === 0) and currently empty.
  const getHiddenRequiredFields = (currentValues = {}) => {
    const hidden = [];
    const seen = new Set();
    const normalizedTableData = Array.isArray(tableData) ? tableData : [];

    normalizedTableData.forEach((test) => {
      if (!test.RequiredFeildList || test.RequiredFeildList === "[]") return;
      try {
        const requiredFields =
          typeof test.RequiredFeildList === "string"
            ? JSON.parse(test.RequiredFeildList)
            : test.RequiredFeildList;

        if (!Array.isArray(requiredFields)) return;

        requiredFields.forEach((field) => {
          const fieldName = field.RequiredFeildName;
          let controlId = fieldName;
          const lowerName = fieldName?.toLowerCase();

          // Field Mappings
          if (lowerName === "mobileno" || lowerName === "mobile")
            controlId = "Mobile";
          if (lowerName === "houseno" || lowerName === "address")
            controlId = "HouseNo";
          if (lowerName === "pincode" || lowerName === "zipcode")
            controlId = "PinCode";
          if (
            lowerName === "idproof" ||
            lowerName === "idproofno" ||
            lowerName === "patientidproofno"
          )
            controlId = "PatientIDProofNo";

          if (seen.has(controlId?.toLowerCase())) return;

          // Find the controller item case-insensitively
          const controllerItem = controllerDynamicList.find(
            (x) =>
              x?.ControlDisplayID?.toLowerCase() === controlId?.toLowerCase(),
          );

          // Only intercept fields that are HIDDEN (IsShow === 0)
          if (!controllerItem || controllerItem.IsShow !== 0) return;

          // Check if the field is empty. Priority: currentValues (from modal) > state > getFieldValue
          const valFromState = state[controlId] || LTData[controlId] || "";
          const fieldValue =
            currentValues[controlId] !== undefined
              ? currentValues[controlId]
              : valFromState;

          const isEmpty =
            !fieldValue ||
            fieldValue === null ||
            fieldValue === undefined ||
            fieldValue.toString().trim() === "" ||
            fieldValue.toString().trim() === "0";

          if (isEmpty) {
            seen.add(controlId?.toLowerCase());
            hidden.push({
              controlId,
              fieldName,
              label: controllerItem?.ControlDisplayName || fieldName,
            });
          }
        });
      } catch (e) {
        console.error(
          "Error parsing RequiredFeildList in getHiddenRequiredFields:",
          e,
        );
      }
    });

    return hidden;
  };

  // HideController
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

  // Debug component to show current validation errors
  const ValidationDebug = () => {
    if (Object.keys(moreErrors).length === 0) return null;

    return (
      <div className="validation-summary mb-3">
        <h6>Validation Errors:</h6>
        <ul>
          {Object.entries(moreErrors).map(([field, error]) => (
            <li key={field}>
              <strong>{field}:</strong> {error}
            </li>
          ))}
        </ul>
      </div>
    );
  };

  // Tabbing OrderLogic
  useEffect(() => {
    controllerDynamic();
  }, []);

  const [sampleCollectionDateTime, setSampleCollectionDateTime] = useState(
    () => {
      const now = new Date();
      const hours = String(now.getHours()).padStart(2, "0");
      const minutes = String(now.getMinutes()).padStart(2, "0");
      return {
        data: now,
        time: `${hours}:${minutes}:00`,
      };
    },
  );
  const [LTData, setLTData] = useState(LTDataIniti);
  const [lockedCentre, setLockedCentre] = useState(false);
  const [tooltipData, setTooltipData] = useState({
    testNames: [],
    position: null,
  });
  const selectedDiscount = AgeWiseDiscountDropdown.find(
    (ele) => ele?.value == LTData?.DiscountId
  );
  console.log(selectedDiscount, "selectedDiscount")

  useEffect(() => {
    if (state?.RateID) {
      getCoPayment(state.RateID);
    }
  }, [state?.RateID, LTData?.CentreID]);

  // Detect IsForcelyBookingLock whenever selected RateID changes (auto or manual)
  useEffect(() => {
    if (!state?.RateID || !RateType?.length) {
      setIsBookingLocked(false);
      setBookingLockedRateTypeName("");
      return;
    }
    const selected = RateType.find((rt) => rt?.value == state?.RateID);
    if (selected?.IsForcelyBookingLock === 1) {
      setIsBookingLocked(true);
      setBookingLockedRateTypeName(selected?.label || "");
    } else {
      setIsBookingLocked(false);
      setBookingLockedRateTypeName("");
    }
  }, [state?.RateID, RateType]);

  const [lockedRate, setLockedRate] = useState(false);
  const [saveSmsEmail, setSaveSmsEmail] = useState({
    SmsToPatient: "",
    SmsToDoctor: "",
    IsActiveSmsToPatient: "",
    IsActiveSmsToDoctor: "",
    EmailToPatient: "",
    EmailToDoctor: "",
    IsActiveEmailToPatient: "",
    IsActiveEmailToDoctor: "",
    SmsToClient: "",
    IsActiveSmsToClient: "",
    EmailToClient: "",
    IsActiveEmailToClient: "",
    IsCourier: "",
    IsWhatsappRequired: "",
  });
  const [membershipnum, setmembershipnum] = useState("");
  const [accessionNo, setAccessionNo] = useState("");
  const [gwtAccessionLocked, setGwtAccessionLocked] = useState(false);
  const [gwtData, setGwtData] = useState(null);
  const [gwtInvalidTests, setGwtInvalidTests] = useState([]);
  const [gwtConditions, setGwtConditions] = useState([]);
  const [couponDetails, setCouponDetails] = useState([]);
  const [type3And5BarcodeNo, setType3And5Barcode] = useState();
  const [showCoupon, setShowCoupon] = useState({
    BindTestCouponShow: false,
    ShowCouponDetail: false,
  });
  const [coupon, setCoupon] = useState({
    code: "",
    field: false,
    load: false,
  });

  const [Category, setCategory] = useState([]);
  const hideRate = useLocalStorage("userData", "get")?.HideRate;
  const HidePRDM = useLocalStorage("userData", "get")?.HidePRDM;
  const {
    AddBlankRateTypeWorkOrder,
    HideOutSourceColor,
    AllowTestAddWithOutAge,
    AllowOutsourceLabAtRegistration,
  } = useLocalStorage("userData", "get");
  const allowOutsourceLab = Number(AllowOutsourceLabAtRegistration) === 1;
  console.log(allowOutsourceLab, "allowOutsourceLab")
  const [outSourceLabOptions, setOutSourceLabOptions] = useState([]);
  const BarocdeNoMaxLength = useLocalStorage("BarocdeNoMaxLength", "get");
  const [time, setTime] = useState({
    Hour: new Date().getHours().toString().padStart(2, "0"),
    Minute: new Date().getMinutes().toString().padStart(2, "0"),
    Second: new Date().getSeconds().toString().padStart(2, "0"),
  });

  const [suggestionData, setSuggestionData] = useState({
    show: false,
    viewTestModal: false,
    viewTestModalId: "",
    testSuggestions: {
      data: [],
      show: false,
      Total: [],
    },
    packageSuggestions: {
      data: [],
      show: false,
    },
    daySuggestions: {
      data: [],
      show: false,
    },
  });

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

  useEffect(() => {
    if (!allowOutsourceLab) return;
    const centreId = LTData?.CentreID;
    const url = centreId
      ? `OutSourceLabMaster/getOutSourceLabData?BookingCentreID=${centreId}`
      : "OutSourceLabMaster/getOutSourceLabData";
    axiosInstance
      .get(url)
      .then((res) => {
        if (res?.data?.success) {
          setOutSourceLabOptions(res?.data?.message || []);
        }
      })
      .catch((err) => {
        console.log(err);
      });
  }, [allowOutsourceLab, LTData?.CentreID]);

  const mapPackageOutSourceLabs = (observationData = []) =>
    (observationData || []).map((t) => ({
      InvestigationID:
        t.TestId || t.testID || t.InvestigationID || t.InvestigationId || 0,
      TestName: t.TestName || "",
      TestCode: t.TestCode || "",
      isOutSource: Number(t.isOutSource ?? t.IsOutSource) || 0,
      LabOutsrcID: "",
      LabOutsrcName: "",
    }));

  // const DefaultVisitTypeatWorkOrder = useLocalStorage("userData", "get")?.DefaultVisitTypeatWorkOrder;

  useEffect(() => {
    if (coupon?.field) setMoreErrors({});
  }, [coupon?.field]);

  const [couponData, setCouponData] = useState([]);
  const [showRemark, setShowRemark] = useState(false);
  const [snrCheck, setSnrCheck] = useState({});

  useEffect(() => {
    setLTData({ ...LTData, Adjustment: paid });
  }, [paid]);

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
  const [PLO, setPLO] = useState([]);
  console.log(PLO, "plo")
  const [RcData, setRcData] = useState([
    {
      PayBy: "Patient",
      ReceiptNo: "",
      ledgerNoCr: "",
      RateTypeId: state?.RateID,
      PaymentMode: defaultPayment.PaymentMode,
      PaymentModeID: defaultPayment.PaymentModeID,
      Amount: "",
      BankName: "",
      CardDate: "",
      CardNo: "",
      CentreID: LTData?.CentreID,
    },
  ]);

  const inputRef = useRef(null);
  const [isRazorPayOpen, setIsRazorPayOpen] = useState(false);
  const selectedReferLabName =
    refLabList?.find((refLab) => refLab?.value === LTData?.ReferLabId) || null;
  const selectedRateType = RateType?.find(
    (rType) => rType?.value == state?.RateID,
  );
  const scType = selectedRateType?.SampleCollectionType;
  const scTypeCopayment = selectedRateType?.CoPaymentApplicable;
  const [isCoPayment, setisCoPayment] = useState(scTypeCopayment);
  const RequiredAttachment = selectedRateType?.RequiredAttachment;
  const isManualDiscountApply = selectedRateType?.isManualDiscountApply;
  console.log(isManualDiscountApply, "isManualDiscountApply")
  const selectedCentre = CentreData?.find(
    (item) => item?.value == LTData?.value,
  );

  const selectedCentreType = CentreData?.find(
    (item) => item?.value == LTData?.CentreID,
  );

  const getWhtsapp = () => {
    if (
      Object.values({
        IsPatientSMS: saveSmsEmail?.IsActiveSmsToPatient,

        IsPatientEmail: saveSmsEmail?.IsActiveEmailToPatient,

        IsDoctorSMS: saveSmsEmail?.IsActiveSmsToDoctor,

        IsDoctorEmail: saveSmsEmail?.IsActiveEmailToDoctor,
        IsClientSMS: saveSmsEmail?.IsActiveSmsToClient,

        IsClientEmail: saveSmsEmail?.IsActiveEmailToClient,
        IsCourier: saveSmsEmail?.IsCourier,
      }).every((value) => value == 0 || value == "")
    ) {
      if (LTData?.BTB == 1) {
        return 0;
      } else return 1;
    } else {
      if (saveSmsEmail?.IsWhatsappRequired == 0) {
        return 1;
      } else return 0;
    }
  };

  const saveData = (data) => {
    if (!validateDynamicFields()) {
      return;
    }

    // Check for hidden fields required by tests that haven't been filled
    const hiddenFields = getHiddenRequiredFields();
    if (hiddenFields.length > 0) {
      // Pre-fill with existing state values (in case partially filled)
      const localValues = {};
      hiddenFields.forEach((f) => {
        localValues[f.controlId] = state[f.controlId] || "";
      });
      setHiddenRequiredModal({
        show: true,
        fields: hiddenFields,
        pendingData: data,
        localValues,
      });
      return;
    }

    setIsSubmit({
      type: "Success",
      isLoading: true,
    });
    handleSubmitFinalBooking(data);
  };

  const getSampleSource = () => {
    axiosInstance
      .get("PatientRegistration/GetAllSampleSources")
      .then((res) => {
        if (res?.data?.success) {
          const data = res?.data?.message;
          const finalData = data?.map((ele) => {
            return {
              value: ele.sampleSourceId,
              label: ele.sampleSourceName,
            };
          });
          setSampleSource(finalData);
        } else {
          setSampleSource([]);
        }
      })
      .catch((err) => console.log(err));
  };

  const getRefLabList = async () => {
    await axiosInstance
      .get(apiUrls?.GetReferalLabDropdwon)
      .then((res) => {
        if (Array.isArray(res?.data?.message)) {
          let refReslist = res?.data?.message?.map((data) => ({
            ...data,
            label: data?.NAME,
            value: String(data?.ID),
          }));
          setRefLabList(refReslist);
        }
      })
      .catch((err) => {
        console.log(err);
      })
      .finally(() => { });
  };

  useEffect(() => {
    if (!toggleRefLabModal) {
      getRefLabList();
    }
  }, [toggleRefLabModal]);

  useEffect(() => {
    if (LTData?.ReferLabId && refLabList.length > 0) {
      const found = refLabList.find((r) => r.value === String(LTData.ReferLabId));
      if (found) setRefLabSearchText(found.label);
    } else if (!LTData?.ReferLabId) {
      setRefLabSearchText("");
    }
  }, [LTData?.ReferLabId, refLabList]);

  const validateAtLeastOneBarcode = (ploData) => {
    const allSamples = ploData.flatMap(
      (plo) => plo?.InvestigationSampleType || [],
    );
    return allSamples.some(
      (item) => item?.barcodeNo && item.barcodeNo.trim() !== "",
    );
  };

  const isManagementLocked = isManagementDiscountType({
    couponApplied: coupon?.field,
    throughMemberData,
    throughFamilyData,
    discountType: LTData?.DiscountType,
  });
  const applicableDiscount = Number(LTData?.DiscountOnTotal || 0);
  // EPD-122 / TC-233: 100% discount (Net 0) must still allow approver + reason.
  const hasActiveDiscount =
    Number(discountPercentage) > 0 ||
    Number(disAmt) > 0 ||
    applicableDiscount > 0 ||
    (tableData?.some((t) => Number(t?.Discount) > 0) ?? false);

  useEffect(() => {
    setDiscountBearBy((prev) =>
      syncDiscountBearBy(prev, applicableDiscount, isManagementLocked),
    );
  }, [applicableDiscount, isManagementLocked]);

  const discountTypeValidation = () => {
    if (LTData?.DiscountType && !throughMemberData) {
      if (!LTData?.DiscountReason) {
        notify("Kindly Enter Discount Reason", "warn");
        return false;
      }
      if (!LTData?.DiscountApprovedBy) {
        notify("Discount Approved By, is Mandatory", "warn");
        return false;
      }
    }
    return true;
  };

  const handleSaveSmsEmailSave = async (
    data,
    saveSmsEmailArgument,
    confirmed = false,
  ) => {
    if (!validateDynamicFields()) {
      setIsSubmit((prev) => ({ ...prev, isLoading: false }));
      return;
    }

    if (!throughMemberData && !throughFamilyData) {
      const hasTestWiseDiscount = tableData?.some((t) => Number(t.Discount) > 0);
      const hasAnyDiscount =
        Number(discountPercentage) > 0 || Number(disAmt) > 0 || hasTestWiseDiscount;

      if (
        hasAnyDiscount &&
        LTData?.DiscountType === 1 &&
        (!LTData?.DiscountApprovedBy || LTData?.DiscountApprovedBy?.trim() === "")
      ) {
        notify("Please Select Discount Approved By", "warn");
        setIsSubmit((prev) => ({ ...prev, isLoading: false }));
        return;
      }

      if (
        hasAnyDiscount &&
        (!LTData?.DiscountReason || LTData?.DiscountReason?.trim() === "")
      ) {
        notify("Please Select Discount Reason", "warn");
        setIsSubmit((prev) => ({ ...prev, isLoading: false }));
        return;
      }

      if (hasAnyDiscount) {
        const bearCheck = validateDiscountBearBy(
          discountBearBy,
          Number(LTData?.DiscountOnTotal || disAmt || 0),
        );
        if (!bearCheck.ok) {
          notify(bearCheck.message, "warn");
          setIsSubmit((prev) => ({ ...prev, isLoading: false }));
          return;
        }
      }

    }

    if (tableData?.length == 0) {
      notify("Kindly Add Test", "warn");
      setIsSubmit((prev) => ({ ...prev, isLoading: false }));
      return;
    }

    if (
      DefaultCurrencyName !== "KES" &&
      !state?.BarcodeNo &&
      BarcodeLogic == 3
    ) {
      notify("Barcode is required.", "warn");
      setIsSubmit((prev) => ({ ...prev, isLoading: false }));
      return;
    }

    setIsSubmit({
      type: "Success",
      isLoading: true,
    });

    // Barcodelogic cusmtome change if user not enter barcode number in case of logic - 5;
    let sentBarcodeLogic = selectedCentre?.BarcodeLogic;
    if (BarcodeLogic == 5) {
      if (state.BarcodeNo) {
        sentBarcodeLogic = 3;
      } else {
        sentBarcodeLogic = 1;
      }
    }

    if (
      Number(AtleastOneBarcodeMandatoryAtWorkOrder) === 1 &&
      Number(BarcodeLogic) === 4
    ) {
      const hasAtLeastOneBarcode = PLO?.some((test) =>
        test?.InvestigationSampleType?.some(
          (sample) => sample?.barcodeNo && sample.barcodeNo.trim() !== "",
        ),
      );

      if (!hasAtLeastOneBarcode) {
        toast.error("At least One Barcode Mandatory");
        setIsSubmit((prev) => ({ ...prev, isLoading: false }));
        return;
      }
    }

    // if(!discountTypeValidation()){
    //   setIsSubmit({
    //     type: "error",
    //     isLoading: false,
    //   });
    //   return;
    // }

    const validation = handleFileValidationUpload();
    // if (!validation?.DocumentFlag) {
    //    notify(`Kindly upload ${validation?.message}`, 'error')
    //   setIsSubmit({
    //     type: "error",
    //     isLoading: false,
    //   });
    //   return;
    // }
    if (Number(AllowCofirmationMessageatWorkOrder) === 1 && !confirmed) {
      setPendingPayload({ data, saveSmsEmailArgument });
      setShowConfirm(true);
      return; // stop here if not yet confirmed
    }

    // Book any radiology slots that were only picked locally (see
    // SlotBookModal.jsx) now that the registration is actually being
    // submitted. Abort the save if any of them can no longer be booked —
    // bookPendingRadiologySlots() has already shown the reason.
    const bookedTableData = await bookPendingRadiologySlots();
    if (!bookedTableData) {
      setIsSubmit((prev) => ({ ...prev, isLoading: false }));
      return;
    }
    // PLO's own state won't reflect bookedTableData within this same call
    // (setPLO() is async) — use processPLOData's return value directly so
    // the just-booked RadiologyAppointmentId values make it into this save.
    const freshPLO = processPLOData(bookedTableData);

    const { CountryID, StateID, ...restState } = state;

    const patientFullName = [state?.Title, state?.FirstName?.trim(), state?.MiddleName?.trim(), state?.LastName?.trim()]
      .filter(Boolean)
      .join(" ")
      .trim() || state?.FirstName?.trim() || "Walk-in Patient";

    axiosInstance
      .post("PatientRegistration/SaveData", {
        PatientData: getTrimmedData({
          ...restState,
          PName: patientFullName,
          PatientName: patientFullName,
          FirstName: state?.FirstName?.trim() || "",
          MiddleName: state?.MiddleName?.trim() || "",
          LastName: state?.LastName?.trim() || "",
          PatientGuid: PatientGuid,
          DOB: state?.DOB || `${new Date()?.toISOString()}`,
          AgeDays: state?.AgeDays == "" ? "0" : state?.AgeDays,
          AgeMonth: state?.AgeMonth == "" ? "0" : state?.AgeMonth,
          CentreID: LTData?.CentreID,
          MobileVip: state?.Mobile,
          FirstNameVip: state?.FirstName,
          MiddleNameVip: state?.MiddleName,
          LastNameVip: state?.LastName,
          MembershipCardID: Memberdetails?.MembershipCardID
            ? Memberdetails?.MembershipCardID
            : 0,
          FamilyMemberIsPrimary: Memberdetails?.FamilyMemberIsPrimary
            ? Memberdetails?.FamilyMemberIsPrimary
            : 0,
          Age: `${state?.AgeYear == "" ? 0 : state?.AgeYear} Y ${state?.AgeMonth == "" ? 0 : state?.AgeMonth} M ${state?.AgeDays == "" ? 0 : state?.AgeDays} D`,
          secondaryNumber: SecondaryMobile || "",
        }),
        LTData: getTrimmedData({
          ...LTData,
          // Re-merged here rather than trusted from the ...LTData spread above —
          // see radiologyRemarkRef's declaration for why LTData.Remarks can end up
          // wiped back to "" by the time this payload is actually built. Prefers
          // whatever's currently in LTData.Remarks (so a manual edit in the Billing
          // Remarks box still wins) and only falls back to the stashed radiology
          // remark when that ended up empty.
          Remarks: LTData?.Remarks || radiologyRemarkRef.current || "",
          preRegistrationRequestID: parseInt(LTData?.preRegistrationRequestID || 0),
          preRegistrationTRFID: preRegistrationTRFID,
          LedgerTransactionNoInterface: gwtData?.requisitionNo || accessionNo?.trim() || "",
          InterfacecompanyName: gwtData?.interfacecompanyName || "",
          CopaymentPercentage: (CoPaymentPercentage),
          IsCopaymentApplicalble: Number(isCoPayment),
          LPO: LTData?.LPO,
          SampleSourceId: Number(LTData?.SampleBy),
          IsConsentForCommunication: isActive ? 1 : 0,
          mobile: state?.Mobile,
          email: state?.Email,
          SampleCollectionDate: utcDate().toISOString(),
          BusinessUnitID: Number(
            selectedRateType?.BusinessUnitID || LTData?.CentreID,
          ),
          barcodeLogicID: sentBarcodeLogic || selectedRateType?.BarcodeLogic,
          InvoiceTo: Number(selectedRateType?.Invoice_To || state?.RateID),
          PreBookingNo: state?.PreBookingNo,
          throughHC: state?.throughHC,
          Category: LTData?.Category?.toString(),
          Gender: state?.Gender,
          Age: `${state?.AgeYear == "" ? 0 : state?.AgeYear} Y ${state?.AgeMonth == "" ? 0 : state?.AgeMonth} M ${state?.AgeDays == "" ? 0 : state?.AgeDays} D`,
          ReferLabId: LTData?.ReferLabId?.toString(),
          ReferLabName: selectedReferLabName?.label,
          collectionBoyName: LTData?.collectionBoyName || "",
          GrossAmount: Number(LTData?.GrossAmount),
          NetAmount: Number(LTData?.NetAmount),
          ProEmployee: state?.ProEmployee?.toString(),
          RateTypeId: state?.RateID,
          PName:
            state?.Title +
            " " +
            state?.FirstName?.trim() +
            (state?.MiddleName?.trim() ? " " + state?.MiddleName?.trim() : "") +
            (state?.LastName?.trim() ? " " + state?.LastName?.trim() : ""),
          OrderId: data ? data : "",
          LedgerTransactionIDHash: documentId,
          CoupanCode: coupon?.field ? coupon?.code : "",
          CoupanId: coupon?.field ? String(couponData[0]?.CoupanId || "") : "",
          IsCoupon: coupon?.field ? 1 : 0,
          MembershipCardID: throughMemberData ? (Memberdetails?.MembershipCardID || 0) : 0,
          MembershipCardNo: throughMemberData ? (Memberdetails?.CardNo || "") : "",
          PolicyID: throughFamilyData ? (familyMemberDetails?.PolicyID || 0) : 0,
          PolicyNo: throughFamilyData ? String(familyMemberDetails?.PolicyNo) : "",
          PatientID: throughFamilyData ? (familyMemberDetails?.PatientID || 0) : 0,
          PatientCode: throughFamilyData ? (familyMemberDetails?.PatientCode || "") : "",
          FamlilyMemberEmployeeID: throughFamilyData ? String(familyMemberDetails?.FamlilyMemberEmployeeID) : "",
          PrimaryFamilyMemberID: throughFamilyData ? Number(familyMemberDetails?.PrimaryFamilyMemberID) : 0,
          IsPrimaryFamilyMember: throughFamilyData ? Number(familyMemberDetails?.FamilyMemberIsPrimary) : 0,
          DiscountReason:
            throughMemberData || throughFamilyData
              ? "Other"
              : LTData?.DiscountReason,
          OtherDiscountReason: throughMemberData
            ? "MembershipCardDiscount"
            : throughFamilyData
              ? (isPolicyPrescription === 1
                  ? "Family Member policy discount - With Prescription"
                  : "Family Member policy discount - Without Prescription")
              : LTData?.OtherDiscountReason,
          VisitType: LTData?.VisitType?.toString(),
          DATE:
            useLocalStorage("userData", "get").ModifyRegDate == "1"
              ? LTData?.RegistrationDate
              : new Date(),
          PNameVip: LTData?.PName,
          IsCourier: saveSmsEmail?.IsCourier,
          IsWhatsappRequired: getWhtsapp(),
          IsCredit: handleRateTypePaymode == "Credit" ? 1 : 0,
          ...Pndt,
          Pregnancy:
            Pndt?.Pregnancy == ""
              ? "0001-01-01"
              : moment(Pndt?.Pregnancy).format("YYYY-MM-DD"),
          IsPndt: Pndt?.PNDT ? 1 : 0,
          IsPndtForm: checkPndt(),
          IsConcern: checkConcent(),
          HLMOPDIPDNo: LTData?.OPDIPD,
          hmis_request_type: state?.hmis_request_type ?? "",
          hmis_patCrNo: state?.hmis_patCrNo ?? "",
          hmis_hospital_code: state?.hmis_hospital_code ?? "",
          poct_facility_id: state?.poct_facility_id ?? "",
          hmis_episode_code: state?.hmis_episode_code ?? "",
          hmis_episode_visitno: state?.hmis_episode_visitno ?? "",
          nikshayID: state?.nikshayID || "",
          rateTypeName: selectedRateType?.label,
          trfNo: trfNo ?? "",
          Height: state?.Height,
          Weight: state?.Weight,
          centreType: selectedRateType?.CentreType || selectedRateType?.centreType || LTData?.CentreType || "",
          CentreType: selectedRateType?.CentreType || selectedRateType?.centreType || LTData?.CentreType || "",
          ...toDiscountBearByPayload(discountBearBy),
        }),
        PLO: freshPLO.map((ploItem) => {
          const row = tableData.find(
            (t) =>
              String(t.InvestigationID) === String(ploItem.InvestigationID),
          );
          return {
          ...getTrimmedData(ploItem),
          DATE:
            localStorage.getItem("ModifyRegDate") == "1"
              ? LTData?.RegistrationDate
              : new Date(),
          IsCredit: handleRateTypePaymode == "Credit" ? 1 : 0,
          Amount: ploItem?.Amount?.toString(),
          DiscountAmt: ploItem?.DiscountAmt?.toString(),
          Rate: ploItem?.Rate?.toString(),
          paybypatient:
            isCoPayment == 0
              ? Number(ploItem?.Amount).toFixed(2)
              : (ploItem?.Amount * CoPaymentPercentage / 100).toFixed(2),

          paybypanel:
            isCoPayment == 0
              ? "0.00"
              : (
                ploItem?.Amount -
                (ploItem?.Amount * CoPaymentPercentage / 100)
              ).toFixed(2),
          sampleTypeID: ploItem?.sampleTypeID
            ? Number(ploItem?.sampleTypeID)
            : 0,
          ModalityId: ploItem?.ModalityId?.toString(),
          BusinessUnitID: Number(
            selectedRateType?.BusinessUnitID || LTData?.CentreID,
          ),
          InvoiceTo: Number(selectedRateType?.Invoice_To || state?.RateID),
          PreSampleCollectionDate: utcDate().toISOString(),
          LabOutsrcID: Number(row?.LabOutsrcID || ploItem?.LabOutsrcID) || 0,
          LabOutsrcName: row?.LabOutsrcName || ploItem?.LabOutsrcName || "",
          PackageOutSourceLabs: (
            row?.packageOutSourceLabs ||
            ploItem?.PackageOutSourceLabs ||
            []
          ).map((t) => ({
            InvestigationID: Number(t.InvestigationID) || 0,
            LabOutsrcID: Number(t.LabOutsrcID) || 0,
            LabOutsrcName: t.LabOutsrcName || "",
          })),
        };
        }),
        DocumentDetail: {
          DocumentID: PatientGuid,
        },
        patientMedical: {
          PatientGuid: PatientGuid,
        },

        PRDeliveryMethod: {
          IsPatientSMS: saveSmsEmailArgument?.IsActiveSmsToPatient ?? 0,
          PatientMobileNo: saveSmsEmailArgument?.SmsToPatient ?? "",
          IsPatientEmail: saveSmsEmailArgument?.IsActiveEmailToPatient ?? 0,
          PatientEmailId: saveSmsEmailArgument?.EmailToPatient ?? "",
          IsDoctorSMS: saveSmsEmailArgument?.IsActiveSmsToDoctor ?? 0,
          DoctorMobileNo: saveSmsEmailArgument?.SmsToDoctor ?? "",
          IsDoctorEmail: saveSmsEmailArgument?.IsActiveEmailToDoctor ?? 0,
          DoctorEmailId: saveSmsEmailArgument?.EmailToDoctor ?? "",
          IsClientSMS: saveSmsEmailArgument?.IsActiveSmsToClient ?? 0,
          ClientMobileNo: saveSmsEmailArgument?.SmsToClient ?? "",
          IsClientEmail: saveSmsEmailArgument?.IsActiveEmailToClient ?? 0,
          ClientEmail: saveSmsEmailArgument?.EmailToClient ?? "",
          IsCourier: saveSmsEmailArgument?.IsCourier ?? "",
        },
        RcData: RcData,
        FieldIds: "",
        mandatoryFields: [],
        preRegistrationRequestID: parseInt(LTData?.preRegistrationRequestID || 0),
      })
      .then((res) => {
        if (res.data.success) {
          toast.success(res.data.message);

          const data = Array.isArray(res?.data?.data)
            ? res?.data?.data
            : [res?.data?.data];

          const newLedgerId =
            data?.[0]?.LedgerTransactionID ??
            data?.[0]?.ledgerTransactionID;

          // If navigated from a radiology appointment, link the new registration to it
          if (location?.state?.fromRadiology && location?.state?.appointmentId && newLedgerId) {
            linkAppointmentRegistration({
              appointmentId: location.state.appointmentId,
              ledgerTransactionID: newLedgerId,
            }).catch(() => {/* silent — registration is already saved */ });
          }

          // Registered from an estimate — mark it Convert with the new Visit No.
          if (estimateConvertRef.current) {
            const visitNo = data?.[0]?.visitNo ?? data?.[0]?.LedgerTransactionNo;
            axiosInstance
              .post("Estimatebilldetail/EstimateUpdateStatus", {
                ...estimateConvertRef.current,
                ledgerTransactionNo: visitNo || String(newLedgerId || ""),
                statusId: 2,
                remark: "",
              })
              .catch(() => {/* silent — registration is already saved */ });
            estimateConvertRef.current = null;
          }

          // Any radiology test added directly during this registration (not
          // the "converted from a standalone booking" case above) goes
          // through bookPendingRadiologySlots() earlier in this same submit,
          // which has no LedgerTransactionID to send at booking time since
          // it runs before SaveData creates one. Link them now that it
          // exists, or they stay permanently "unregistered"/yellow in the
          // slot picker and can never be resolved back to a
          // RadiologyAppointmentId for cancellation on a later edit.
          if (newLedgerId && freshlyBookedRadiologyAppointmentIdsRef.current.length > 0) {
            freshlyBookedRadiologyAppointmentIdsRef.current.forEach((appointmentId) => {
              linkAppointmentRegistration({
                appointmentId,
                ledgerTransactionID: newLedgerId,
              }).catch(() => {/* booking already succeeded — registration link is best-effort */ });
            });
            freshlyBookedRadiologyAppointmentIdsRef.current = [];
          }

    const val = data?.map((ele, index) => {
  const filteredBarcodeInfo = ele?.barcodeInfo?.filter((item) => {
    if (userdata?.CompanyID === 1008) {
      return (
        item?.isSampleCollected === "S" ||
        item?.isSampleCollected === "Y" ||
        item?.isSampleCollected === "N"
      );
    }

    return (
      (item?.isSampleCollected === "S" ||
        item?.isSampleCollected === "Y") &&
      item?.sampleOption === "Sample Required"
    );
  });

  return {
    LedgerTransactionNo: ele?.visitNo,
    barcodeInfo: filteredBarcodeInfo,
  };
});
          const samplecollectedData = val?.some(
            (item) => item.barcodeInfo?.length > 0,
          );

          if (samplecollectedData) {
            getBarcodeData(val);
          }

          const newDocumentId = guidNumber();
          setDocumentID(newDocumentId);
          setIsRazorPayOpen(false);
          setState({ ...stateIniti, RateID: "" });
          setLockedRate(true);
          setTrfNo("");
          setSecondaryMobile("");
          setTime({
            Hour: new Date().getHours().toString().padStart(2, "0"),
            Minute: new Date().getMinutes().toString().padStart(2, "0"),
            Second: new Date().getSeconds().toString().padStart(2, "0"),
          });

          setSampleCollectionDateTime({
            data: new Date(),
            time: `${new Date().getHours().toString().padStart(2, "0")}:${new Date().getMinutes().toString().padStart(2, "0")}:00`,
          });

          setIsActive(0);
          setPLO([]);
          setAutoCompleteCountry();
          setAutoCompleteCity();
          setAutoCompleteState();
          setRcData([
            {
              PayBy: "Patient",
              ReceiptNo: "",
              ledgerNoCr: "",
              RateTypeId: state?.RateID,
              PaymentMode: defaultPayment.PaymentMode,
              PaymentModeID: defaultPayment.PaymentModeID,
              BankName: "",
              CardDate: "",
              CardNo: "",
              Amount: "",
              CentreID: LTData?.CentreID,
            },
          ]);
          setSaveSmsEmail({
            SmsToPatient: "",
            SmsToDoctor: "",
            IsActiveSmsToPatient: "",
            IsActiveSmsToDoctor: "",
            EmailToPatient: "",
            EmailToDoctor: "",
            IsActiveEmailToPatient: "",
            IsActiveEmailToDoctor: "",
            SmsToClient: "",
            IsActiveSmsToClient: "",
            EmailToClient: "",
            IsActiveEmailToClient: "",
            IsCourier: "",
            IsWhatsappRequired: "",
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
          setFormData((prev) => ({
            ...prev,
            DoctorName: isDefaultReferalDoctorSelf ? "SELF" : "",
            SecondReferDoctor: isDefaultReferalDoctorSelf ? "SELF" : "",
          }));
          setLTData((prev) => ({
            ...prev,
            DoctorName: isDefaultReferalDoctorSelf ? "SELF" : "",
            DoctorID: isDefaultReferalDoctorSelf ? 1 : "",
            DoctorMobile: "",
            DoctorEmail: "",
            ProEmployee: 0,
            ReferLabId: "",
            KinName: "",
            ReferDoctorRemarks: "",
            DiscountId: "",
            DiscountApprovedBy: "",
            DiscountReason: "",
            OtherDiscountReason: "",
            DiscountType: 1,
          }));

          setmembershipnum("");
          setAccessionNo("");
          setGwtAccessionLocked(false);
          setGwtData(null);
          setGwtInvalidTests([]);
          setGwtConditions([]);
          setThroughmemberdata(false);
          setMemberdetails({});
          setTableData([]);
          setIsSubmit({
            type: "Success",
            isLoading: false,
          });
          setCoupon({
            code: "",
            field: false,
          });
          setThroughMobileData(false);
          setThroughmemberdata(false);
          setThroughFamilyData(false);
          setFamilyMemberDetails({});
          setIsPolicyPrescription(0);
          setFuhid("");
          setdisAmt("");
          setDiscountPercentage("");
          setIsMobileSearchSelected(false);
          setSearchMobile("");
          getAccessCentres(
            setCentreData,
            LTData,
            safeSetLTData,
            LTDataIniti,
            (cid, ct) => useBindRateTypeWorkOrderFlow ? getRateTypeWorkOrder(cid, ct, true) : handleRateType(cid, ct),
            VisitTypeCategory,
            fetchFields,
            callFromRegistration,
            setCenterType,
          );
          SetPatientGuid(guidNumber());
          setCoPaymentPercentage(0);
          setDoctorRequiredAttachment([]);


          // Reset focus to the start of the form after short delay to allow DOM to update
          setTimeout(() => {
            const order = getFocusOrder();
            if (order.length > 0) {
              // Focus the first valid element in the order
              focusNextById(order[order.length - 1], false);
            }
          }, 500);

          if (Number(allReceipt?.AutoReceipt) === 1) {
            getReceipt(
              res?.data?.data?.ledgertransactionID,
              res?.data?.data?.fullyPaid,
            );
          }
          // Remove by Ashish after discuss with PRASHANT SIR on 29-03-2026
          if (Number(allReceipt?.AutoTRF) === 1) {
            getConcern(res?.data?.data?.ledgertransactionID);
          }
          if (res?.data?.data?.isPndt == 1) {
            getPndtForm(res?.data?.data?.ledgertransactionID);
          }
          // if (res?.data?.data?.isTrfRequired == 1) {
          getReceiptTRF(
            res?.data?.data?.ledgertransactionID,
            // res?.data?.data?.isTrfRequired,
            res?.data?.data?.isDepartmentSlip,
          );
          // }
          guidNumber();
          setPatientImg({ img: PlaceholderImage, show: false });
          setAutoEmail({
            order_id: "",
            flag: false,
          });
          setSuggestionData({
            show: false,
            viewTestModal: false,
            viewTestModalId: "",
            testSuggestions: {
              data: [],
              show: false,
              Total: [],
            },
            packageSuggestions: {
              data: [],
              show: false,
            },
            daySuggestions: {
              data: [],
              show: false,
            },
          });
          if (res?.data?.data?.labBarcodeData) {
            handleAcknowledgementSlip(
              res?.data?.data?.labBarcodeData,
              res?.data?.data?.ledgertransactionID,
            );
          }
          // dispatch(getBalance());
          setState((prev) => ({
            ...prev,
            RateID: state?.RateID,
            CentreID: state?.CentreID,
          }));
          setLTData((prev) => ({
            ...prev,
            CentreID: LTData?.CentreID,
            CentreType: LTData?.CentreType,
            RateTypeId: null,
            CardHolderName: "",
            CardHolderRelation: "Self",
            KinTitle: "",
            KinName: "",
            PolicyNo: "",
            LPO: "",
          }));
          autofocusTitle(tabbingOrder[0]?.AutoFocusControlID);
          GetLastVisitNoByCentreID();
          if (Number(AllowAdvanceOldPatientSearchAtWorkOrder)) {
            setShowOP(true);
          }
          if (Number(AllowAdvanceOldPatientSearchAtWorkOrder)) {
            setShowDefault(!showDefault);
          }
        } else {
          setIsSubmit({
            type: "Error",
            isLoading: false,
          });
          if (
            res?.data?.message === "Duplicate Parameter Booking" &&
            Array.isArray(res?.data?.data) &&
            res?.data?.data?.length > 0
          ) {
            setDuplicateParamModal({
              show: true,
              data: res?.data?.data,
            });
          } else {
            toast.error(res.data.message);
          }
        }
      })
      .catch((err) => {
        setIsRazorPayOpen(false);
        toast.error(
          err?.response?.data?.message
            ? err?.response?.data?.message
            : "Something Went Wrong",
        );
        setIsSubmit({
          type: "Error",
          isLoading: false,
        });
      })
      .finally(() => {
        setIsSubmit((prev) => ({
          ...prev,
          isLoading: false,
        }));
      });
  };

  const handleSubmitFinalBooking = (data) => {
    if (state?.AutoEmail == 1 && HidePRDM != 1) {
      setAutoEmail({
        order_id: data,
        flag: true,
      });
      setSaveSmsEmail({
        ...saveSmsEmail,
        IsActiveEmailToClient:
          saveSmsEmail?.IsActiveEmailToClient !== ""
            ? saveSmsEmail?.IsActiveEmailToClient
            : saveSmsEmail?.EmailToClient != ""
              ? 1
              : state?.RateTypeEmail != ""
                ? 1
                : 0,
        IsActiveSmsToDoctor:
          saveSmsEmail?.IsActiveSmsToDoctor !== ""
            ? saveSmsEmail?.IsActiveSmsToDoctor
            : saveSmsEmail?.SmsToDoctor != ""
              ? 1
              : LTData?.DoctorMobile != ""
                ? 1
                : 0,
        IsActiveEmailToDoctor:
          saveSmsEmail?.IsActiveEmailToDoctor !== ""
            ? saveSmsEmail?.IsActiveEmailToDoctor
            : saveSmsEmail?.EmailToDoctor != ""
              ? 1
              : LTData?.DoctorEmail != ""
                ? 1
                : 0,
        IsActiveEmailToPatient:
          saveSmsEmail?.IsActiveEmailToPatient !== ""
            ? saveSmsEmail?.IsActiveEmailToPatient
            : saveSmsEmail?.EmailToPatient != ""
              ? 1
              : state?.Email != ""
                ? 1
                : 0,
        IsActiveSmsToPatient:
          saveSmsEmail?.IsActiveSmsToPatient !== ""
            ? saveSmsEmail?.IsActiveSmsToPatient
            : saveSmsEmail?.SmsToPatient != ""
              ? 1
              : state?.Mobile != ""
                ? 1
                : 0,
        IsActiveSmsToClient:
          saveSmsEmail?.IsActiveSmsToClient !== ""
            ? saveSmsEmail?.IsActiveSmsToClient
            : saveSmsEmail?.SmsToClient != ""
              ? 1
              : state?.RateTypePhone != ""
                ? 1
                : 0,
        IsWhatsappRequired: saveSmsEmail?.IsWhatsappRequired
          ? saveSmsEmail?.IsWhatsappRequired
          : 0,
      });
      if (HidePRDM != 1) {
        setShow6(true);
      }
    } else {
      handleSaveSmsEmailSave(data, saveSmsEmail);
    }
  };
  const getPaymentModeAmount = RcData?.filter(
    (ele) => ele?.PaymentMode == "Online Payment",
  );
  const [searchTest, setSearchTest] = useState("TestName");
  const [slotOpen, setSlotOpen] = useState({
    show: false,
    data: "",
  });

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
  const handleToggleRefLabModal = () => {
    setToggleRefLabModal(false);
  };
  const handleDatePNDT = (value, name) => {
    setPndt({
      ...Pndt,
      [name]: value,
    });
  };
  const handlePNDTChange = (e) => {
    const { name, value } = e.target;
    setPndt({
      ...Pndt,
      [name]: value,
    });
  };
  const handleCityState = (
    id,
    name,
    email,
    phone,
    ClientAddress,
    HideAmount,
    ProEmployee,
    AutoEmail,
    states,
    setAllReceipt = null,
    value,
  ) => {
    setLoad(true);
    axiosInstance
      .post("Centre/getRateTypeDetailWithCentre", {
        CentreID: id,
      })
      .then((res) => {
        setLoad(false);
        const detail = res?.data?.message?.[0] || {};
        const newCity = detail?.City || "";
        const newState = detail?.State || "";
        const newCountry = detail?.Country || "India";
        const newCityId = detail?.CityID || 1;
        const newStateId = detail?.StateID || 1;
        const newCountryId = detail?.CountryID || 1;
        const newPin = detail?.Pincode || "";

        if (newCountry) {
          setAutoCompleteCountry(newCountry);
          countryDraftRef.current = newCountry;
          countrySelectedRef.current = { name: newCountry, id: newCountryId };
        }
        if (newState) {
          setAutoCompleteState(newState);
          stateDraftRef.current = newState;
          stateSelectedRef.current = { name: newState, id: newStateId };
        }
        if (newCity) {
          setAutoCompleteCity(newCity);
          cityDraftRef.current = newCity;
          citySelectedRef.current = { name: newCity, id: newCityId };
        }

        setState((prev) => ({
          ...prev,
          RateTypeEmail: email,
          RateTypePhone: phone,
          ClientAddress: ClientAddress,
          HideAmount: HideAmount,
          ProEmployee: ProEmployee,
          AutoEmail: AutoEmail,
          [name]: id,
          PinCode: newPin ? newPin : prev.PinCode,
          City: newCity ? newCity : prev.City,
          CityID: newCityId ? newCityId : prev.CityID,
          State: newState ? newState : prev.State,
          StateID: newStateId ? newStateId : prev.StateID,
          Country: newCountry ? newCountry : prev.Country,
          CountryID: newCountryId ? newCountryId : prev.CountryID,
          ReferenceRate: value?.ReferenceRate || 0,
        }));
        if (typeof setAllReceipt === "function") {
          setAllReceipt({
            AutoTRF: value?.AutoTRF || "",
            AutoReceipt: value?.AutoReceipt || "",
            AutoMRPReceipt: value?.AutoMRPReceipt || "",
          });
        }
      })
      .catch((err) => {
        setLoad(false);
        setState((prev) => ({
          ...prev,
          RateTypeEmail: email,
          RateTypePhone: phone,
          ClientAddress: ClientAddress,
          HideAmount: HideAmount,
          [name]: id,
        }));
        // setAllReceipt({
        //   AutoTRF: "",
        //   AutoReceipt: "",
        //   AutoMRPReceipt: "",
        // });
        toast.error(
          err?.response?.data?.message
            ? err?.response?.data?.message
            : "Something went wrong.",
        );
      });
  };

  const PaymentData = () => {
    let match = false;
    if (checkRateTypePayMode !== "Credit") {
      const data = ["Cash", "Online Payment", "Paytm"];
      for (let i = 0; i < RcData.length; i++) {
        if (!data.includes(RcData[i].PaymentMode)) {
          if (
            RcData[i].CardDate === "" ||
            RcData[i]?.CardNo === "" ||
            RcData[i]?.BankName === ""
          ) {
            match = true;
          }
        }
      }
    }
    return match;
  };

  useEffect(() => {
    if (handleRateTypePaymode === "Cash") {
      if (RcData.length === 1) {
        const newAmount = throughMemberData ? LTData?.NetAmount : "";
        let data = RcData.map((ele) => ({ ...ele, Amount: newAmount }));
        setRcData(data);
      }
    }
  }, [LTData?.NetAmount]);

  // Set RateType Default 1st option
  useEffect(() => {
    if (RateType?.length > 0 && AddBlankRateTypeWorkOrder == 0 && !lockedRate) {
      setState((prev) => ({ ...prev, RateID: RateType?.[0]?.value }));
      setBarcodeLogic(RateType?.[0]?.BarcodeLogic);
    }
  }, [RateType, lockedRate]);

  useEffect(() => {
    if (handleRateTypePaymode === "Cash") {
      const effectivePayment = getEffectivePayment();
      setRcData([
        {
          PayBy: "Patient",
          ReceiptNo: "",
          ledgerNoCr: "",
          RateTypeId: state?.RateID,
          PaymentMode: effectivePayment.PaymentMode,
          PaymentModeID: effectivePayment.PaymentModeID,
          Amount: throughMemberData ? LTData?.NetAmount : "",
          BankName: "",
          CardDate: "",
          CardNo: "",
          CentreID: LTData?.CentreID,
        },
      ]);
    }
  }, [LTData?.DiscountOnTotal, hcPaymentMode]);

  useEffect(() => {
    // setLTData({
    //   ...LTData,
    //   PName:
    //     state?.Title +
    //     " " +
    //     state?.FirstName?.trim() +
    //     (state?.MiddleName?.trim() ? " " + state?.MiddleName?.trim() : "") +
    //     (state?.LastName?.trim() ? " " + state?.LastName?.trim() : ""),
    //   Age: state?.Age,
    //   Gender: state?.Gender,
    //   RateTypeId: state?.RateID,
    //   VIP: state?.isVIP,
    // });
    if (LTData?.CentreID === "" || !LTData?.CentreID || LTData?.CentreID == "")
      getAccessCentres(
        setCentreData,
        LTData,
        safeSetLTData,
        LTDataIniti,
        (cid, ct) => useBindRateTypeWorkOrderFlow ? getRateTypeWorkOrder(cid, ct, true) : handleRateType(cid, ct),
        VisitTypeCategory,
        fetchFields,
        callFromRegistration,
        setCenterType,
      );
    getCentreWorkOrder()
    const data = RcData.map((ele) => {
      return {
        ...ele,
        CentreID: LTData?.CentreID,
        RateTypeId: state?.RateID,
        // PaymentMode: handleRateTypePaymode === "Credit" ? "Credit" :ele?.PaymentModeID,
        // PaymentModeID: handleRateTypePaymode === "Credit" ? 215 : ele?.PaymentModeID,
      };
    });
    setRcData(data);
  }, [state, tableData]);

  const processScannedTests = async (testNames, rateId) => {
    if (!rateId) {
      toast.warn(t("Please select a centre/rate type first to add scanned tests"));
      return;
    }

    const addedTests = [];
    const failedTests = [];

    for (const name of testNames) {
      if (!name) continue;

      try {
        const res = await axiosInstance.post("TestData/BindBillingTestData", {
          TestName: name,
          CentreID: rateId == "" || rateId == null ? rateIDForMemerber : rateId,
          SearchBy: "TestName",
          ActualRateTypeID: state?.RateID,
          AllowZeroRateBooking: selectedRateType?.AllowZeroRateBooking || 0,
        });

        if (res?.data?.success && res.data.message && res.data.message.length > 0) {
          // Look for an exact match first (case-insensitive)
          let match = res.data.message.find(
            (m) => m.TestName && m.TestName.toUpperCase().trim() === name.toUpperCase().trim()
          );

          // If no exact match, take the first one if it's a reasonably good match
          if (!match) match = res.data.message[0];

          if (match) {
            handleListSearch(match, "TestName");
            addedTests.push(match.TestName);
          }
        } else {
          failedTests.push(name);
        }
      } catch (err) {
        console.error(`Error searching for test ${name}:`, err);
        failedTests.push(name);
      }
    }

    if (addedTests.length > 0) {
      toast.success(`${t("Added scanned tests")}: ${addedTests.join(", ")}`);
    }
    if (failedTests.length > 0) {
      toast.warn(`${t("Could not find matching tests for")}: ${failedTests.join(", ")}`);
    }
  };

  console.log({ selectedRateType })

  const handleDataExtracted = async (parsed) => {
    if (!parsed) return;

    if (parsed.trfId) {
      setPreRegistrationTRFID(Number(parsed.trfId));
    }

    // If the AI only found an age (no explicit DOB on the document), derive
    // the DOB the same way manual Age entry does (handleDOBCalculation),
    // otherwise the Years field fills in but DOB is left blank.
    let derivedDOB = parsed.DOB || null;
    if (!derivedDOB && parsed.AgeYear) {
      derivedDOB = moment()
        .subtract(parsed.AgeYear || 0, "years")
        .subtract(parsed.AgeMonth || 0, "months")
        .subtract(parsed.AgeDays || 0, "days")
        .toDate();
    }

    setState((prev) => ({
      ...prev,
      FirstName: parsed.FirstName || prev.FirstName,
      MiddleName: parsed.MiddleName || prev.MiddleName,
      LastName: parsed.LastName || prev.LastName,
      Title: parsed.Title || prev.Title,
      AgeYear: parsed.AgeYear || prev.AgeYear,
      Gender: parsed.Gender || prev.Gender,
      Mobile: parsed.Mobile || prev.Mobile,
      Email: parsed.Email || prev.Email,
      Height: parsed.Height || prev.Height,
      Weight: parsed.Weight || prev.Weight,
      HouseNo: parsed.HouseNo || prev.HouseNo,
      City: parsed.City || prev.City,
      State: parsed.State || prev.State,
      Country: parsed.Country || prev.Country,
      DOB: derivedDOB || prev.DOB,
      TotalAgeInDays: derivedDOB
        ? moment().diff(derivedDOB, "days")
        : prev.TotalAgeInDays,
    }));

    setLTData((prev) => ({
      ...prev,
      DoctorName: parsed.DoctorName || prev.DoctorName,
      ReferLabId: parsed.ReferLabId || prev.ReferLabId,
      Remarks: parsed.Remarks || prev.Remarks,
      ClientRefNumber: parsed.ClientRefNumber || prev.ClientRefNumber,
      trfNo: parsed.trfNo || prev.trfNo,
      BarcodeNo: parsed.BarcodeNo || prev.BarcodeNo,
    }));

    if (parsed.DoctorName) {
      setFormData((prev) => ({ ...prev, DoctorName: parsed.DoctorName }));
    }

    // Handle Scanned Tests
    const testList = parsed.testNames || parsed.TestNames || [];
    if (Array.isArray(testList) && testList.length > 0) {
      const currentRateId = state?.RateID;
      processScannedTests(testList, currentRateId);
    }

    // Keep the panel open so the user can process other images in the grid
    toast.success(t("Patient details filled from scanned document"));
  };

  const handleScanDocumentClick = async () => {
    if (trfImages.length === 0) {
      const loadingToast = toast.loading(t("Fetching TRF images..."));
      try {
        const res = await axiosInstance.post(
          "PreRegistration/GetTrfS3Files",
          {
            CentreID: LTData?.CentreID || 0,
            RateTypeID: state?.RateID || 0,
          }
        );

        if (res?.data?.success) {
          const message = res.data.message;
          let fileKeys = [];

          if (Array.isArray(message)) {
            message.forEach((item) => {
              if (item?.Files) {
                try {
                  const parsedFiles =
                    typeof item.Files === "string"
                      ? JSON.parse(item.Files)
                      : item.Files;
                  if (Array.isArray(parsedFiles)) {
                    fileKeys = [...fileKeys, ...parsedFiles];
                  }
                } catch (e) {
                  console.error("Error parsing TRF files:", e);
                }
              }
            });
          } else if (message?.Files) {
            try {
              fileKeys =
                typeof message.Files === "string"
                  ? JSON.parse(message.Files)
                  : message.Files;
            } catch (e) {
              console.error("Error parsing TRF files:", e);
            }
          }

          if (fileKeys.length > 0) {
            try {
              // Fetch each file as base64 via the backend to avoid CORS/Tainted Canvas issues
              const base64Promises = fileKeys.map(async (f) => {
                const b64Res = await axiosInstance.post("ManagerSOP/GetS3FileAsBase64", {
                  fileKey: f.AwsKey
                });
                if (b64Res.data?.success) {
                  // Based on the observed API response: data: [{ base64: "..." }]
                  const base64Data = b64Res.data?.data?.[0]?.base64 || b64Res.data?.message;
                  if (base64Data && typeof base64Data === 'string') {
                    return { id: f.TrfId, image: `data:image/jpeg;base64,${base64Data}` };
                  }
                }
                return null;
              });

              const base64Images = (await Promise.all(base64Promises))
                .filter(img => img)
                // Newest (highest TrfId) first, same ordering as freshly
                // captured/uploaded ones — Promise.all only preserves
                // fileKeys' own order, which isn't guaranteed to be
                // newest-first from the backend.
                .sort((a, b) => (Number(b.id) || 0) - (Number(a.id) || 0));

              if (base64Images.length > 0) {
                setTrfImages(base64Images);
                setShowScanPanel(true);
                toast.update(loadingToast, {
                  render: t("Images loaded successfully"),
                  type: "success",
                  isLoading: false,
                  autoClose: 2000,
                });
              } else {
                toast.update(loadingToast, {
                  render: t("Failed to retrieve image data"),
                  type: "error",
                  isLoading: false,
                  autoClose: 3000,
                });
              }
            } catch (err) {
              console.error("Base64 fetch error:", err);
              toast.update(loadingToast, {
                render: t("Error loading image content"),
                type: "error",
                isLoading: false,
                autoClose: 3000,
              });
            }
          } else {
            toast.update(loadingToast, {
              render: t("No TRF images found"),
              type: "info",
              isLoading: false,
              autoClose: 2000,
            });
            setShowScanPanel(!showScanPanel);
          }
        } else {
          toast.update(loadingToast, {
            render: res?.data?.message || t("Failed to fetch TRF images"),
            type: "error",
            isLoading: false,
            autoClose: 3000,
          });
          setShowScanPanel(!showScanPanel);
        }
      } catch (err) {
        console.error("TRF Fetch Error:", err);
        toast.update(loadingToast, {
          render: t("Error fetching TRF images"),
          type: "error",
          isLoading: false,
          autoClose: 3000,
        });
        setShowScanPanel(!showScanPanel);
      }
    } else {
      setShowScanPanel(!showScanPanel);
    }
  };

  // Same "PreRegistration/SaveTrfWithFiles" upload WelcomePage's camera/
  // gallery-upload flow calls — a TRF captured/picked from the scanner panel
  // here needs to actually be saved (not just held in local state) the same
  // way. Takes an array so a single camera capture ([file]) and a
  // multi-select gallery upload both go through one call/one API request,
  // matching WelcomePage's handleTrfFiles (multiple "KeyFiles" in one
  // FormData) instead of firing one request per file.
  const handleTrfFilesUpload = async (files) => {
    const fileList = Array.isArray(files) ? files : [files];
    if (fileList.length === 0) return;
    if (!LTData?.CentreID || !state?.RateID) {
      toast.warn(t("Please select Centre and Rate Type"));
      return;
    }
    const formData = new FormData();
    formData.append("CentreID", LTData?.CentreID || 0);
    formData.append("RateTypeID", state?.RateID || 0);
    fileList.forEach((file) => formData.append("KeyFiles", file));

    try {
      const response = await axiosInstance.post(
        "PreRegistration/SaveTrfWithFiles",
        formData,
        { headers: { "Content-Type": "multipart/form-data" } },
      );
      if (response.data.success) {
        const dataUrls = await Promise.all(
          fileList.map(
            (file) =>
              new Promise((resolve) => {
                const reader = new FileReader();
                reader.onloadend = () => resolve(reader.result);
                reader.readAsDataURL(file);
              }),
          ),
        );
        // Newest capture/upload lands first, not last, so it shows at the
        // top of the grid instead of requiring a scroll.
        setTrfImages((prev) => [
          ...dataUrls.map((dataUrl) => ({ id: null, image: dataUrl })),
          ...prev,
        ]);
        toast.success(t("TRF Uploaded Successfully"));
      } else {
        toast.error(t(response?.data?.message));
      }
    } catch (err) {
      console.error(err);
      toast.error(t("Upload failed. Please try again."));
    }
  };

  // Removes one TRF from the pending grid. Optimistic — removes locally
  // first, then calls the backend for images that actually have a TrfId
  // (fetched via GetTrfS3Files, i.e. already saved server-side); rolls back
  // if that call fails. A freshly-captured/uploaded image in this same
  // session has `id: null` (SaveTrfWithFiles's response doesn't currently
  // hand back a per-file identifier — see
  // backend-docs/backend-trf-delete-endpoint.md), so there's nothing to call
  // the backend with for those yet and the removal stays local-only.
  //
  // ⚠️ NEW ENDPOINT — PreRegistration/DeleteTrfFile does not exist on the
  // backend yet. See backend-docs/backend-trf-delete-endpoint.md.
  const handleRemoveTrfImage = async (index, image) => {
    setTrfImages((prev) => prev.filter((_, i) => i !== index));
    if (!image?.id) {
      toast.success(t("TRF Removed"));
      return;
    }
    try {
      const res = await axiosInstance.post("PreRegistration/DeleteTrfFile", {
        TrfId: image.id,
      });
      if (res?.data?.success) {
        toast.success(t("TRF Removed"));
      } else {
        setTrfImages((prev) => {
          const next = [...prev];
          next.splice(index, 0, image);
          return next;
        });
        toast.error(t(res?.data?.message) || t("Failed to remove TRF"));
      }
    } catch (err) {
      console.error(err);
      setTrfImages((prev) => {
        const next = [...prev];
        next.splice(index, 0, image);
        return next;
      });
      toast.error(t("Failed to remove TRF"));
    }
  };

  const handleMainChange = async (e) => {

    const { name, value, type, checked } = e.target;
    const isAutoCaps = Number(IsPatientNameAutoCaps_WorkOrder) === 1;

    if (name === "HouseNo") {
      if (!PreventSpecialCharacterAddress(value)) return;
      let nextValue = value.toUpperCase();
      if (nextValue.length > ADDRESS_MAX_LENGTH) {
        nextValue = nextValue.slice(0, ADDRESS_MAX_LENGTH);
        setMoreErrors((prev) => ({
          ...prev,
          HouseNo: `Address cannot exceed ${ADDRESS_MAX_LENGTH} characters`,
        }));
      } else {
        clearValidationError("HouseNo");
      }
      setState((prev) => ({ ...prev, HouseNo: nextValue }));
      return;
    }

    if (name === "LastName") {
      if (!PreventSpecialCharacter(value)) return;
      let nextValue = sanitizeLastNameInput(isAutoCaps ? value.toUpperCase() : value);
      if (nextValue.length > LAST_NAME_MAX_LENGTH) {
        nextValue = nextValue.slice(0, LAST_NAME_MAX_LENGTH);
        setMoreErrors((prev) => ({
          ...prev,
          LastName: `Last Name cannot exceed ${LAST_NAME_MAX_LENGTH} characters`,
        }));
      } else {
        clearValidationError("LastName");
      }
      setState((prev) => ({ ...prev, LastName: nextValue }));
      return;
    }

    if (name === "Mobile") {
      const digitCheck = validateMobileDigits(value);
      if (!digitCheck.isValid) {
        setMoreErrors((prev) => ({ ...prev, Mobile: digitCheck.message }));
        setState((prev) => ({ ...prev, Mobile: value }));
        return;
      }
      const mobileMax = getPhoneMaxLength(DefaultCurrencyName);
      if (value.length > mobileMax) {
        setMoreErrors((prev) => ({
          ...prev,
          Mobile: `Mobile number cannot exceed ${mobileMax} digits`,
        }));
        setState((prev) => ({ ...prev, Mobile: value }));
        return;
      }
      clearValidationError("Mobile");
      if (value.length === 10) {
        await axiosInstance
          .post("CommonController/CheckInvalidMobileNo", {
            MobileNo: value,
          })
          .then((res) => {
            setState((prev) => ({ ...prev, [name]: value }));
          })
          .catch((err) => {
            if (err?.response?.data?.message >= 1) {
              toast.error("Invalid number");
              setState((prev) => ({ ...prev, [name]: "" }));
            } else {
              setState((prev) => ({ ...prev, [name]: value }));
            }
          });
        return;
      }
      setState((prev) => ({ ...prev, Mobile: value }));
      return;
    }

    if (name === "SecondaryMobile") {
      const phoneMax = getPhoneMaxLength(DefaultCurrencyName);
      let nextValue = value;
      if (nextValue.length > phoneMax) {
        nextValue = nextValue.slice(0, phoneMax);
        setMoreErrors((prev) => ({
          ...prev,
          SecondaryMobile: `Phone cannot exceed ${phoneMax} digits`,
        }));
      } else {
        const phoneCheck = validatePhone(nextValue, phoneMax);
        if (!phoneCheck.isValid) {
          setMoreErrors((prev) => ({ ...prev, SecondaryMobile: phoneCheck.message }));
        } else {
          clearValidationError("SecondaryMobile");
        }
      }
      setSecondaryMobile(nextValue);
      return;
    }

    if (name === "Country") {
      applyCountryTypedValue(value);
      return;
    }

    // EPD-061/064: validate Email before the generic clearValidationError path,
    // which was wiping the flag and returning without re-checking the value.
    if (name === "Email") {
      setState((prev) => ({
        ...prev,
        [name]: value,
      }));
      const emailCheck = validateEmail(value);
      setMoreErrors((prev) => {
        const next = { ...prev };
        if (emailCheck.isValid) delete next.Email;
        else next.Email = emailCheck.message;
        return next;
      });
      return;
    }

    // Clear validation errors dynamically
    clearValidationError(name);

    if (name === "Gender") {
      setState((prev) => ({
        ...prev,
        [name]: value,
      }));
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
    }

    if (name === "ProEmployee") {
      setState((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
    if (name === "Title") {
      setState((prev) => ({
        ...prev,
        [name]: value,
        ...(value === "" && { Gender: "" }),
      }));
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
    }

    if (name === "FirstName") {
      const inputEl = e.target;
      const isRealInput = typeof inputEl?.setSelectionRange === "function";
      const cursorPos = isRealInput ? inputEl.selectionStart : null;
      if (!PreventSpecialCharacterFirstName(value)) {
        return;
      }
      let nextValue = isAutoCaps ? value.toUpperCase() : value;
      if (nextValue.length > FIRST_NAME_MAX_LENGTH) {
        nextValue = nextValue.slice(0, FIRST_NAME_MAX_LENGTH);
        setMoreErrors((prev) => ({
          ...prev,
          FirstName: `First Name cannot exceed ${FIRST_NAME_MAX_LENGTH} characters`,
        }));
      } else {
        clearValidationError("FirstName");
      }
      setState((prev) => ({
        ...prev,
        FirstName: nextValue,
      }));
      if (isRealInput) {
        requestAnimationFrame(() => {
          const adjustedPos = Math.max(
            0,
            Math.min(
              nextValue.length,
              (cursorPos ?? nextValue.length) - (value.length - nextValue.length),
            ),
          );
          inputEl.setSelectionRange(adjustedPos, adjustedPos);
        });
      }
      return;
    }
    if (name === "Weight") {
      const weightCheck = validateWeight(value);
      if (!weightCheck.isValid) {
        setMoreErrors((prev) => ({ ...prev, Weight: weightCheck.message }));
      } else {
        clearValidationError("Weight");
      }
      setState((prev) => ({ ...prev, Weight: value }));
      return;
    }
    if (name === "trfNo") {
      let nextValue = value;
      if (nextValue.length > TRF_NO_MAX_LENGTH) {
        nextValue = nextValue.slice(0, TRF_NO_MAX_LENGTH);
        setMoreErrors((prev) => ({
          ...prev,
          trfNo: `TRF No cannot exceed ${TRF_NO_MAX_LENGTH} characters`,
        }));
      } else {
        const trfCheck = validateTrfNo(nextValue);
        if (!trfCheck.isValid) {
          setMoreErrors((prev) => ({ ...prev, trfNo: trfCheck.message }));
        } else {
          clearValidationError("trfNo");
        }
      }
      setTrfNo(nextValue);
      return;
    }
      setState((prev) => {
        const calculatedValue =
          type === "checkbox"
            ? checked
              ? 1
              : 0
            : ["MiddleName", "LastName"].includes(name)
              ? PreventSpecialCharacter(value)
                ? isAutoCaps
                  ? value.toUpperCase()
                  : value
                : prev[name]
              : ["City", "State", "Country", "Locality"].includes(name)
                ? PreventSpecialCharacter(value)
                  ? value
                  : prev[name]
                : name === "HouseNo"
                  ? PreventSpecialCharacterAddress(value)
                    ? value.toUpperCase()
                    : prev[name]
                  : name === "PatientCode" && DefaultCurrencyName === "KES"
                    ? value
                    : PreventSpecialCharacter(value)
                      ? value
                      : prev[name];
        return {
          ...prev,
          [name]: calculatedValue,
        };
      });
  };

  const getSubtractType = (name) => {
    return name === "AgeYear"
      ? "years"
      : name === "AgeMonth"
        ? "months"
        : "days";
  };

  const handleDateFunction = (value) => {
    const { year, month, days } = value;
    const yearDiff = moment().subtract(year, "years")?._d;
    const monthDiff = moment(yearDiff).subtract(month, "months")?._d;
    const daysDiff = moment(monthDiff).subtract(days, days)?._d;

    return {
      AgeYear: yearDiff,
      AgeMonth: monthDiff,
      AgeDays: daysDiff,
    };
  };
  // const handleDOBCalculation = (e) => {
  //   const { name, value } = e.target;

  //   let diff = {};
  //   let subtractType = getSubtractType(name);
  //   if (name === "AgeYear") {
  //     diff = moment().subtract(value, subtractType);
  //     setDateData({
  //       ...DateData,
  //       AgeYear: diff?._d,
  //     });
  //   }

  //   if (name === "AgeMonth") {
  //     diff = moment(DateData?.AgeYear || new Date().now).subtract(
  //       value,
  //       subtractType
  //     );
  //     setDateData(prev=>({
  //       ...prev,
  //       AgeMonth: diff?._d,
  //     }));
  //   }

  //   if (name === "AgeDays") {
  //     diff = moment(DateData?.AgeMonth || new Date().now).subtract(
  //       value,
  //       subtractType
  //     );
  //     setDateData({
  //       ...DateData,
  //       AgeDays: diff?._d,
  //     });
  //   }

  //   var startDate = moment(diff._d);
  //   var endDate = moment();

  //   var yearsDiff = endDate.diff(startDate, "years");
  //   startDate.add(yearsDiff, "years");

  //   var monthsDiff = endDate.diff(startDate, "months");
  //   startDate.add(monthsDiff, "months");

  //   var daysDiff = endDate.diff(startDate, "days");
  //   setState({
  //     ...state,
  //     [name]: value,
  //     DOB: diff?._d,
  //     TotalAgeInDays: moment(moment().format("YYYY-MM-DD")).diff(
  //       diff?._d,
  //       "days"
  //     ),
  //   });

  //   setLTData({
  //     ...LTData,
  //   });

  //   setTableData([]);

  //   setSuggestionData((ele) => ({
  //     ...ele,
  //     testSuggestions: {
  //       ...suggestionData?.testSuggestions,
  //       data: [],
  //       show: false,
  //     },
  //     packageSuggestions: {
  //       ...suggestionData?.packageSuggestions,
  //       data: [],
  //       show: false,
  //     },
  //   }));
  //   setRcData([
  //     {
  //       PayBy: "Patient",
  //       ReceiptNo: "",
  //       ledgerNoCr: "",
  //       RateTypeId: state?.RateID,
  //       PaymentMode: handleRateTypePaymode === "Credit" ? "Credit" : "Cash",
  //       PaymentModeID: handleRateTypePaymode === "Credit" ? 215 : 134,
  //       CardDate: "",
  //       CardNo: "",
  //       BankName: "",
  //       Amount: "",
  //       CentreID: LTData?.CentreID,
  //     },
  //   ]);
  // };

  const handleDOBCalculation = (e) => {
    const { name, value } = e.target;

    const agePartError = validateAgeComponent(name, value);
    setMoreErrors((prev) => {
      const next = { ...prev };
      if (agePartError.message) next[name] = agePartError.message;
      else delete next[name];
      return next;
    });

    const years = name === "AgeYear" ? value : state.AgeYear || 0;
    const months = name === "AgeMonth" ? value : state.AgeMonth || 0;
    const days = name === "AgeDays" ? value : state.AgeDays || 0;

    // Calculate DOB from scratch
    const dob = moment()
      .subtract(years, "years")
      .subtract(months, "months")
      .subtract(days, "days")
      .toDate();

    // Set state
    setState((prev) => ({
      ...prev,
      [name]: value,
      DOB: dob,
      TotalAgeInDays: moment().diff(dob, "days"),
    }));

    // Set DateData for your date-select UI
    setDateData({
      AgeYear: dob,
      AgeMonth: dob,
      AgeDays: dob,
    });

    // Clear Table / Suggestions
    // setTableData([]);
    setSuggestionData((ele) => ({
      ...ele,
      testSuggestions: {
        ...suggestionData?.testSuggestions,
        data: [],
        show: false,
      },
      packageSuggestions: {
        data: [],
        show: false,
      },
    }));

    // Reset RC Data
    setRcData([
      {
        PayBy: "Patient",
        ReceiptNo: "",
        ledgerNoCr: "",
        RateTypeId: state?.RateID,
        PaymentMode: defaultPayment.PaymentMode,
        PaymentModeID: defaultPayment.PaymentModeID,
        CardDate: "",
        CardNo: "",
        BankName: "",
        Amount: "",
        CentreID: LTData?.CentreID,
      },
    ]);
  };

  useEffect(() => {
    if (state?.isVIP === 0) {
      // functional update — this also runs on mount (isVIP starts at 0), and
      // spreading the stale `state` there wiped fields pre-filled by other
      // mount effects (e.g. Convert from Estimate Search)
      setState((prev) => ({ ...prev, IsMask: 0 }));
    }
  }, [state?.isVIP]);

  function getTestNamesWithBlankSampleTypeID() {
    const testsWithBlankSampleTypeID = PLO.filter(
      (test) =>
        test?.IsSampleRequired == "Sample Required" &&
        (test?.sampleTypeID === "" || test?.sampleTypeID === 0),
    );
    if (testsWithBlankSampleTypeID?.length === 0) {
      return false;
    } else {
      const testNames = testsWithBlankSampleTypeID?.map(
        (test) => test.ItemName,
      );

      const concatenatedTestNames = testNames?.join(", ");

      return "In " + concatenatedTestNames + " test SampleType Not Found";
    }
  }

  //allowlocaltestdata

  useEffect(() => {
    if (!isLocalEnabled) return;

    const fetchAll = async () => {
      try {
        const res = await axiosInstance.get(
          "TestData/BindBillingAllTestDataInfo",
        );

        if (res?.data?.success) {
          const formatted = (res.data.message || []).map((item) => ({
            ...item,
            _name: item.TestName?.toLowerCase() || "",
            _code: item.TestCode?.toLowerCase() || "",
          }));

          localStorage.removeItem("ALL_TESTS");
          localStorage.setItem("ALL_TESTS", JSON.stringify(formatted));
        }
      } catch (err) {
        console.error(err);
      }
    };

    fetchAll();
  }, [isLocalEnabled]);

  const getSuggestion = (value) => {
    // if (disAmt || discountPercentage) {
    //   toast.error("Remove Discount Amount or Discount Percentage to Add");
    //   return;
    // }

    if (!state?.RateID) {
      notify("Kindly select Client Name", "warn");
      return;
    }

    if (Number(AllowTestAddWithOutAge) === 0 && !state?.DOB) {
      toast.error("Please choose DOB || Age");
      return;
    }

    if (!LTData?.CentreID) {
      toast.error("please Select Centre");
      return;
    }

    if (value.length < 2) {
      setSuggestion([]);
      return;
    }

    // ✅ LOCAL SEARCH MODE
    if (isLocalEnabled) {
      const localData = JSON.parse(localStorage.getItem("ALL_TESTS") || "[]");

      const searchValue = value.toLowerCase();

      const filtered = localData
        .filter((item) => {
          if (searchTest === "TestName") {
            return item._name.includes(searchValue);
          } else {
            return item._code.includes(searchValue);
          }
        })
        .slice(0, 50); // limit for performance

      setSuggestion(filtered);
      setIndexMatch(0);
      return;
    }

    // ❌ API MODE (existing)
    axiosInstance
      .post("TestData/BindBillingTestData", {
        TestName: value,
        CentreID: state?.RateID == "" || state?.RateID == null ? rateIDForMemerber : state?.RateID,
        SearchBy: searchTest,
        ActualRateTypeID: state?.RateID,
        AllowZeroRateBooking: selectedRateType?.AllowZeroRateBooking || 0,
      })
      .then((res) => {
        if (res?.data?.success) {
          setSuggestion(res?.data?.message);
          setIndexMatch(0);
        } else {
          toast.error(res?.data?.message || "Please check rate/Share and sample type");
        }
      })
      .catch((err) => {
        toast.error(err?.response?.data?.message);
      });

  };

  // const getSuggestion = (value) => {
  //   if (disAmt || discountPercentage) {
  //     toast.error("Remove Discount Amount or Discount Percentage to Add");
  //     return;
  //   }

  //   if (!state?.RateID) {
  //     notify("Kindly select Client Name", "warn");
  //     return;
  //   }
  //   if (Number(AllowTestAddWithOutAge) === 0 && !state?.DOB) {
  //     toast.error("Please choose DOB || Age");
  //   } else {
  //     if (LTData?.CentreID) {
  //       if (value.length >= 2) {
  //         axiosInstance
  //           .post("TestData/BindBillingTestData", {
  //             TestName: value,
  //             CentreID: state?.RateID,
  //             SearchBy: searchTest,
  //           })
  //           .then((res) => {
  //             if (res?.data?.success) {
  //               setSuggestion(res?.data?.message);
  //               setIndexMatch(0);
  //             } else {
  //               toast.error("Please check rate/Share and sample type");
  //             }
  //           })
  //           .catch((err) => {
  //             toast.error(err?.response?.data?.message);
  //           });
  //       } else {
  //         setSuggestion([]);
  //       }
  //     } else {
  //       toast.error("please Select Centre");
  //     }
  //   }
  // };

  const handleDeboucing = (func, delay) => {
    let timeout;
    return function (value) {
      if (timeout) clearTimeout(timeout);

      timeout = setTimeout(() => {
        func(value);
      }, delay);
    };
  };

  const debouce = handleDeboucing(getSuggestion, isLocalEnabled ? 200 : 300);

  const handleChange = (event) => {
    const { value } = event.target;
    setIndexMatch(0);
    debouce(value);
  };

  const handleTitleChange = (e) => {
    const { name, value } = e?.target;
    if (name === "Title") {
      const selectedTitleOption = Title.find((opt) => opt.value === value);
      setState((prev) => ({
        ...prev,
        ["Title"]: value,
        isVetCanine: selectedTitleOption?.isVetCanine ?? 0,
        Gender: value === "" ? "" : prev.Gender,
      }));
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
    }
  };

  console.log({ LTData })

  const handleSearchSelectChange = (label, value) => {
    console.log("Selecrererted:", { label, value });
    clearValidationError(label);

    if (label === "Title") {
      setState((prev) => ({
        ...prev,
        ["Title"]: value?.value,
      }));
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
    }

    if (label === "CentreID") {
      pendingPaidRef.current = 0;
      const finalVisitType =
        LTData.VisitType ||
        LTData.CentreType ||
        value?.CentreType ||
        DefaultVisitTypeatWorkOrder ||
        "Walkin";
      useBindRateTypeWorkOrderFlow ? getRateTypeWorkOrder(value?.value, finalVisitType) : handleRateType(value?.value, finalVisitType);
      setCenterType(value?.CentreType);
      setState((prev) => ({
        ...prev,
        RateID: "",
        RateTypeName: "",
      }));
      setBookingLockedRateTypeName("");
      setIsBookingLocked(false);
      // setBarcodeLogic(Number(value?.BarcodeLogic));
      setLTData({
        ...LTData,
        ["CentreID"]: value?.value,
        CentreName: value?.label,
        CentreType: finalVisitType,
        ["VisitType"]: finalVisitType,
        SetMRP: value?.SetMRP,
        BTB: value?.BTB,
        SUBPCC: value?.SUBPCC,
        ReferLabId: "",
      });
      // mark centre as explicitly selected by user so later automatic reloads won't overwrite it
      setLockedCentre(true);
      setLockedRate(false); // reset rate lock when centre changes manually
      handleCityState(
        value?.value,
        label,
        value?.RateTypeEmail,
        value?.RateTypePhone,
        value?.ClientAddress,
        value?.HideAmount,
        value?.ProEmployee,
        value?.AutoEmail,
        state,
        undefined,
        value,
      );
      setSaveSmsEmail({
        SmsToPatient: "",
        SmsToDoctor: "",
        IsActiveSmsToPatient: "",
        IsActiveSmsToDoctor: "",
        EmailToPatient: "",
        EmailToDoctor: "",
        IsActiveEmailToPatient: "",
        IsActiveEmailToDoctor: "",
        SmsToClient: "",
        IsActiveSmsToClient: "",
        EmailToClient: "",
        IsActiveEmailToClient: "",
        IsCourier: "",
        IsWhatsappRequired: "",
      });

      // Load RateType options with both CentreID and CentreType
      getAccessDataRate(
        setRateType,
        value?.value,
        callFromRegistration,
        setState,
        setAllReceipt,
        undefined,
        finalVisitType,
        setisCoPayment,
        false,
        isSelectCome
      );
      VisitTypeCategory(finalVisitType);
      fetchFields(finalVisitType);
      // getSpecialDayTest(value?.value, state?.RateID);
    }
    if (label === "RateID") {
      pendingPaidRef.current = 0;
      // Check if the selected rate type has forcely booking lock enabled
      if (value?.IsForcelyBookingLock === 1) {
        setIsBookingLocked(true);
        setBookingLockedRateTypeName(value?.label || "");
      } else {
        setIsBookingLocked(false);
        setBookingLockedRateTypeName("");
      }

      setState((prev) => ({
        ...prev,
        RateID: value?.value,
        RateTypeName: value?.label,
        ReferenceRate: value?.ReferenceRate || 0,
      }));
      setBarcodeLogic(Number(value?.BarcodeLogic));
      setisCoPayment(value?.CoPaymentApplicable);
      setisB2B(value?.CentreType || value?.centreType);
      setLTData((prev) => ({
        ...prev,
        CentreType: value?.CentreType || value?.centreType || prev?.CentreType || "",
        centreType: value?.centreType || value?.CentreType || prev?.centreType || "",
      }));

      if (CentreVsRateTypeatWorkOrder == 0) {
        getCentreWorkOrder(value?.value, value?.BusinessUnitID);
      }
      setLockedRate(true); // lock RateID after manual selection to prevent auto-updates
      handleCityState(
        value?.value,
        label,
        value?.RateTypeEmail,
        value?.RateTypePhone,
        value?.ClientAddress,
        value?.HideAmount,
        value?.ProEmployee,
        value?.AutoEmail,
        state,
        setAllReceipt,
        value,
      );
      setSaveSmsEmail({
        SmsToPatient: "",
        SmsToDoctor: "",
        IsActiveSmsToPatient: "",
        IsActiveSmsToDoctor: "",
        EmailToPatient: "",
        EmailToDoctor: "",
        IsActiveEmailToPatient: "",
        IsActiveEmailToDoctor: "",
        SmsToClient: "",
        IsActiveSmsToClient: "",
        EmailToClient: "",
        IsActiveEmailToClient: "",
        IsCourier: "",
        IsWhatsappRequired: "",
      });
      if (useWorkOrderRateFlow) {
        const fullRate = RateType.find((r) => r.value == value?.value);
        if (fullRate) {
          if (fullRate.IsForcelyBookingLock === 1) {
            setIsBookingLocked(true);
            setBookingLockedRateTypeName(fullRate.label || "");
          } else {
            setIsBookingLocked(false);
            setBookingLockedRateTypeName("");
          }
          if (CentreVsRateTypeatWorkOrder == 0) {
            getCentreWorkOrder(fullRate.value, fullRate.BusinessUnitID);
          }
          handleCityState(
            fullRate.value,
            label,
            fullRate.RateTypeEmail,
            fullRate.RateTypePhone,
            fullRate.ClientAddress,
            fullRate.HideAmount,
            fullRate.ProEmployee,
            fullRate.AutoEmail,
            state,
            setAllReceipt,
            fullRate,
          );
        }
      } else {
        const fullRate = RateType.find((r) => r.value == value?.value);
        if (fullRate) {
          if (fullRate.IsForcelyBookingLock === 1) {
            setIsBookingLocked(true);
            setBookingLockedRateTypeName(fullRate.label || "");
          } else {
            setIsBookingLocked(false);
            setBookingLockedRateTypeName("");
          }
          if (CentreVsRateTypeatWorkOrder == 0) {
            getCentreWorkOrder(fullRate.value, fullRate.BusinessUnitID);
          }
          handleCityState(
            fullRate.value,
            label,
            fullRate.RateTypeEmail,
            fullRate.RateTypePhone,
            fullRate.ClientAddress,
            fullRate.HideAmount,
            fullRate.ProEmployee,
            fullRate.AutoEmail,
            state,
            setAllReceipt,
            fullRate,
          );
        }
      }
      // autofocusTitle();
    }
    if (label === "VisitType") {
      pendingPaidRef.current = 0;
      setLTData({
        ...LTData,
        ["VisitType"]: value?.value,
        Category: "",
      });
      VisitTypeCategory(Number(value?.value));
      fetchFields(value?.value);
      useBindRateTypeWorkOrderFlow ? getRateTypeWorkOrder(LTData?.CentreID, value?.value) : handleRateType(LTData?.CentreID, value?.value);
    }
    if (label === "CollectionBoyId") {
      setLTData({
        ...LTData,
        ["CollectionBoyId"]: value?.value,
        collectionBoyName: value?.label,
      });
    }
    if (label === "Category") {
      setLTData({
        ...LTData,
        ["Category"]: value?.value ? value?.value : "",
      });
    }
    if (label === "CentreType") {
      setLTData({
        ...LTData,
        ["CentreType"]: value?.value,
        ["VisitType"]: value?.value,
      });

      useBindRateTypeWorkOrderFlow ? getRateTypeWorkOrder(LTData?.CentreID, value?.value) : handleRateType(LTData?.CentreID, value?.value);
      // VisitTypeCategory(Number(value?.value));
      // fetchFields(value?.value);
    }
    if (label === "SampleBy") {
      setLTData({
        ...LTData,
        ["SampleBy"]: value?.value ? value?.value : "",
      });
    }
    focusNextById(label);
  };

  const handleReactSelectChange = (name, e) => {
    // Clear validation errors dynamically
    clearValidationError(name);

    setLTData((prev) => ({ ...prev, [name]: e?.value }));
    persistFocusOfReactSelect(name); //Focus the dropdown at onchange
  };

  const handleSelectChange = (event) => {
    const { name, value, selectedIndex } = event?.target;
    const label =
      selectedIndex !== undefined && event?.target?.children
        ? event?.target?.children[selectedIndex]?.text
        : "";

    // Clear validation errors dynamically
    clearValidationError(name);

    persistFocusOfReactSelect(name); //Focus the dropdown at onchange
    if (name === "PatientIDProof") {
      // EPD-BUG-001 / EPD-030/032: changing Id Type enables the number field,
      // clears it for the new type, and restores a previously entered number
      // when switching back to an earlier type.
      const prevType = String(LTData?.PatientIDProof || "").trim();
      const prevNo = String(LTData?.PatientIDProofNo || "");
      if (prevType) {
        idProofByTypeRef.current[prevType] = prevNo;
      }

      const nextType = String(value || "").trim();
      let proofNo = nextType ? (idProofByTypeRef.current[nextType] ?? "") : "";
      if (isAadhaarIdType(nextType)) {
        proofNo = sanitizeAadhaarInput(proofNo);
        syncAadhaarProofError(proofNo);
      } else {
        clearValidationError("PatientIDProofNo");
        if (isPanIdType(nextType) && proofNo) {
          const panCheck = validatePanNumber(proofNo);
          setMoreErrors((prev) => {
            const next = { ...prev };
            if (panCheck.isValid) delete next.PatientIDProofNo;
            else next.PatientIDProofNo = panCheck.message;
            return next;
          });
        }
      }
      setLTData({ ...LTData, [name]: value, PatientIDProofNo: proofNo });
    }

    if (name === "VisitType") {
      setLTData({ ...LTData, [name]: value });
      fetchFields(value);
    }

    if (name === "ReportDeliveryMethodId") {
      setLTData({ ...LTData, [name]: value });
    }

    if (name === "DiscountApprovedBy") {
      if (value) {
        checkEmploypeeWiseDiscount(LTData, value)
          .then((res) => {
            setLTData({
              ...LTData,
              [name]: value,
              DiscountId: "",
              DiscountReason: "",
            });
          })
          .catch((err) => {
            toast.error(err);
            setLTData({
              ...LTData,
              [name]: "",
              DiscountId: "",
              DiscountReason: "",
            });
          });
      } else {
        setLTData({
          ...LTData,
          [name]: "",
          DiscountId: "",
          DiscountReason: "",
        });
      }
    }

    if (name === "DiscountReason") {
      // if (value === "Other") {
      //   setShowOtherDiscountModal(true);
      //   return;
      // }
      setLTData({ ...LTData, [name]: value });
    }

    if (name === "CollectionBoyId") {
      setLTData({ ...LTData, [name]: value });
    } else {
      // getSpecialDayTest(LTData?.CentreID,value)
    }

    if (name === "SrfId") {
      setLTData({ ...LTData, [name]: value });
    }
    if (name === "IcmrId") {
      setLTData({ ...LTData, [name]: value });
    }
    if (name === "CashRendering") {
      setLTData({ ...LTData, [name]: value });
    }
    if (name === "CollectionCharges") {
      setLTData({ ...LTData, [name]: value });
    }
    if (name === "DiscountType") {
      if (value == "2") {
        handleDiscountAgeWiseItem();
        setLTData({
          ...LTData,
          [name]: Number(value),
          DiscountApprovedBy: "",
          DiscountReason: "",
        });
        if (DefaultCurrencyName !== "KES") {
          setdisAmt("");
          setDiscountPercentage("");
        }
      }

      if (value == "1") {
        if (DefaultCurrencyName !== "KES") {
          setdisAmt("");
          setDiscountPercentage("");
        }
        setLTData({
          ...LTData,
          [name]: Number(value),
          DiscountId: "",
          DiscountReason: "",
        });
      }
    }
    if (name === "CardHolderRelation") {
      setLTData({
        ...LTData,
        [name]: value,
      });
    }
    if (name === "KinTitle") {
      setLTData({
        ...LTData,
        [name]: value,
      });
    }
    if (name === "KinName") {
      setLTData({
        ...LTData,
        [name]: value,
      });
    }
  };

  const handleSelectNew = (event) => {
    const { name, value } = event?.target;
    setLTData({ ...LTData, [name]: value });
  };

  // safe setter that preserves user-selected CentreID when locked
  const safeSetLTData = (payload) => {
    if (CentreVsRateTypeatWorkOrder == 0) return; // ignore presist if centreVsRate
    if (lockedCentre) {
      setLTData((prev) => ({ ...payload, CentreID: prev?.CentreID }));
    } else {
      setLTData(payload);
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
    const other = [];
    setState((prev) => {
      let updatedGender = prev.Gender;
      if (prev.Title === "") {
        updatedGender = "";
      } else if (male.includes(prev.Title)) {
        updatedGender = "Male";
      } else if (female.includes(prev.Title)) {
        updatedGender = "Female";
      } else if (other.includes(prev.Title)) {
        updatedGender = "Other";
      }

      if (updatedGender !== prev.Gender) {
        return { ...prev, Gender: updatedGender };
      }
      return prev;
    });
  };

  useEffect(() => {
    findGender();
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
  }, [state?.Title]);

  const calculateDOB = (value) => calculateAgeFromDob(value);

  const calculateTotalNumberOfDays = (value) => {
    const dob = parseTypedDate(value);
    if (!dob) {
      return "";
    }
    return moment().startOf("day").diff(moment(dob).startOf("day"), "days");
  };
  const dateSelect = (value, name) => {
    let nextValue = value;
    if (name === "DOB") {
      const parsed = parseTypedDate(value);
      const dateCheck = validateDob(parsed || value);
      if (!parsed) {
        if (value && dateCheck.message) {
          setMoreErrors((prev) => ({ ...prev, DOB: dateCheck.message }));
        }
        return;
      }
      if (!dateCheck.isValid) {
        setMoreErrors((prev) => ({ ...prev, DOB: dateCheck.message }));
        setState((prev) => ({
          ...prev,
          DOB: parsed,
        }));
        return;
      }
      clearValidationError("DOB");
      nextValue = parsed;
    }
    const { years, months, days } = calculateDOB(nextValue);
    setState((prev) => ({
      ...prev,
      [name]: nextValue,
      AgeYear: years,
      AgeMonth: months,
      AgeDays: days,
      TotalAgeInDays: calculateTotalNumberOfDays(nextValue),
    }));
    const dateForFields = handleDateFunction({
      year: years,
      month: months,
      days: days,
    });
    setDateData({
      AgeYear: dateForFields?.AgeYear,
      AgeMonth: dateForFields?.AgeMonth,
      AgeDays: dateForFields?.AgeDays,
    });

    // setTableData([]);
    setSuggestionData((ele) => ({
      ...ele,
      testSuggestions: {
        ...suggestionData?.testSuggestions,
        data: [],
        show: false,
      },
      packageSuggestions: {
        data: [],
        show: false,
      },
    }));
    setRcData([
      {
        PayBy: "Patient",
        ReceiptNo: "",
        ledgerNoCr: "",
        RateTypeId: state?.RateID,
        PaymentMode: defaultPayment.PaymentMode,
        PaymentModeID: defaultPayment.PaymentModeID,
        CardDate: "",
        CardNo: "",
        BankName: "",
        Amount: "",
        CentreID: LTData?.CentreID,
      },
    ]);
  };

  const handleDateTime = (time, name) => {
    setSampleCollectionDateTime((prev) => ({ ...prev, [name]: time }));
  };

  const utcDate = () => {
    const d = new Date(sampleCollectionDateTime.data);
    const [hh, mm] = sampleCollectionDateTime.time.split(":");

    return new Date(
      Date.UTC(d.getFullYear(), d.getMonth(), d.getDate(), hh, mm, 0),
    );
  };

  const dateregselecect = (value, name) => {
    setLTData({ ...LTData, [name]: value });
  };

  const S4 = () => {
    return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
  };

  const isValidGuid = (guid) => {
    return (
      guid &&
      typeof guid === "string" &&
      guid.trim() !== "" &&
      guid.toLowerCase() !== "null" &&
      guid.toLowerCase() !== "undefined" &&
      guid !== "00000000-0000-0000-0000-000000000000"
    );
  };

  const guidNumber = () => {
    const guidNumber =
      S4() +
      S4() +
      "-" +
      S4() +
      "-" +
      S4() +
      "-" +
      S4() +
      "-" +
      S4() +
      "-" +
      S4() +
      S4();
    return guidNumber;
  };

  useEffect(() => {
    BindDoctorData();
    const DocumentId = guidNumber();
    setDocumentID(DocumentId);
    const patientId = guidNumber();
    SetPatientGuid(patientId);
    getProEmployee();
  }, []);

  const handleIndex = (e) => {
    const { name } = e.target;
    switch (name) {
      case "btnSave":
        switch (e.which) {
          case 13: // Enter
            handleSubmit();
            window.scrollTo(0, 0);
            break;
          case 9: //tab
            e.preventDefault();
            handleKeyDown(e, "btnSave");
            break;
          default:
            break;
        }
        break;
      case "TestName":
        switch (e.which) {
          case 38:
            if (suggestion?.length > 0) {
              if (indexMatch > 0) {
                setIndexMatch(indexMatch - 1);
              } else {
                setIndexMatch(suggestion.length - 1);
              }
            }
            break;

          case 40:
            if (suggestion?.length > 0) {
              if (indexMatch === suggestion.length - 1) {
                setIndexMatch(0);
              } else {
                setIndexMatch(indexMatch + 1);
              }
            }
            break;

          case 13: // Enter
            if (
              suggestion?.length > 0 &&
              indexMatch >= 0 &&
              suggestion[indexMatch]
            ) {
              handleListSearch(suggestion[indexMatch], name);
            }
            setIndexMatch(-1);
            break;
          case 9:
            // if (
            //   suggestion?.length > 0 &&
            //   indexMatch >= 0 &&
            //   suggestion[indexMatch]
            // ) {
            //   handleListSearch(suggestion[indexMatch], name);
            // }
            e.preventDefault();
            handleKeyDown(e, "testSearch");
            break;
          default:
            break;
        }
        break;

      case "DoctorName":
        switch (e.which) {
          case 38:
            if (doctorSuggestion?.length > 0) {
              if (indexMatch > 0) {
                setIndexMatch(indexMatch - 1);
              } else {
                setIndexMatch(doctorSuggestion.length - 1);
              }
            }
            break;

          case 40:
            if (doctorSuggestion?.length > 0) {
              if (indexMatch === doctorSuggestion.length - 1) {
                setIndexMatch(0);
              } else {
                setIndexMatch(indexMatch + 1);
              }
            }
            break;

          case 13:
            if (
              formData?.DoctorName?.trim() &&
              doctorSuggestion?.length > 0 &&
              indexMatch >= 0 &&
              doctorSuggestion[indexMatch]
            ) {
              handleListSearch(doctorSuggestion[indexMatch], name);
            } else {
              setDoctorSuggestion([]);
              setDropFalse(false);
            }
            setIndexMatch(-1);
            break;
          case 9: // tab — only auto-select when field has text
            if (formData?.DoctorName?.trim() && doctorSuggestion?.length > 0) {
              const idx = indexMatch >= 0 ? indexMatch : 0;
              if (doctorSuggestion[idx]) {
                handleListSearch(doctorSuggestion[idx], "DoctorName");
              }
            } else {
              // Field is empty or cleared — just close dropdown and move focus
              setDoctorSuggestion([]);
              setDropFalse(false);
              setIndexMatch(-1);
            }
            handleKeyDown(e, name);
            break;
          default:
            break;
        }
        break;

      case "SecondReferDoctor":
        switch (e.which) {
          case 38:
            if (seconddoctorSuggestion?.length > 0) {
              if (indexMatch !== 0) {
                setIndexMatch(indexMatch - 1);
              } else {
                setIndexMatch(seconddoctorSuggestion.length - 1);
              }
            }
            break;
          case 40:
            if (seconddoctorSuggestion?.length > 0) {
              if (seconddoctorSuggestion.length - 1 === indexMatch) {
                setIndexMatch(0);
              } else {
                setIndexMatch(indexMatch + 1);
              }
            }
            break;
          case 13:
            if (
              seconddoctorSuggestion?.length > 0 &&
              indexMatch >= 0 &&
              seconddoctorSuggestion[indexMatch]
            ) {
              handleListSearch(seconddoctorSuggestion[indexMatch], name);
            }
            setIndexMatch(-1);
            break;
          case 9: // tab select
            if (seconddoctorSuggestion?.length > 0) {
              const idx = indexMatch >= 0 ? indexMatch : 0;
              if (seconddoctorSuggestion[idx]) {
                handleListSearch(
                  seconddoctorSuggestion[idx],
                  "SecondReferDoctor",
                );
              }
            }
            e.preventDefault();
            if (seconddoctorSuggestion?.length > 0) {
              const idxToSelect = indexMatch >= 0 ? indexMatch : 0;
              handleListSearch(seconddoctorSuggestion[idxToSelect], name);
            }
            handleKeyDown(e, name);
            break;

          default:
            break;
        }
        break;

      case "ReferLabId":
        switch (e.which) {
          case 38: // ArrowUp
            if (refLabSuggestions?.length > 0) {
              if (indexMatch > 0) {
                setIndexMatch(indexMatch - 1);
              } else {
                setIndexMatch(refLabSuggestions.length - 1);
              }
            }
            break;
          case 40: // ArrowDown
            if (refLabSuggestions?.length > 0) {
              if (indexMatch === refLabSuggestions.length - 1) {
                setIndexMatch(0);
              } else {
                setIndexMatch(indexMatch + 1);
              }
            }
            break;
          case 13: // Enter
            if (refLabSuggestions?.length > 0 && indexMatch >= 0 && refLabSuggestions[indexMatch]) {
              const lab = refLabSuggestions[indexMatch];
              setLTData((prev) => ({ ...prev, ReferLabId: lab.value }));
              setRefLabSearchText(lab.label);
              setRefLabDropShow(false);
              setRefLabSuggestions([]);
              clearValidationError("ReferLabId");
            }
            setIndexMatch(-1);
            break;
          case 9: // Tab — select highlighted (or first) item
            if (refLabSuggestions?.length > 0) {
              const idx = indexMatch >= 0 ? indexMatch : 0;
              const lab = refLabSuggestions[idx];
              if (lab) {
                setLTData((prev) => ({ ...prev, ReferLabId: lab.value }));
                setRefLabSearchText(lab.label);
                setRefLabDropShow(false);
                setRefLabSuggestions([]);
                clearValidationError("ReferLabId");
              }
            }
            handleKeyDown(e, "ReferLabId");
            break;
          default:
            break;
        }
        break;

      default:
        break;
    }
  };

  const validtabledata = (data, test, Promo) => {
    if (coupon?.field) {
      toast.error(
        "You can't add test because you have applied coupon,first remove coupon code.",
      );
    } else {
      getTableData(data, "test", Promo);
    }
  };
  const handleListSearch = (data, name, Promo) => {
    switch (name) {
      case "TestName":
        const testSearchInput = document.getElementById("testSearch");
        if (testSearchInput) {
          testSearchInput.value = "";
        }
        setIndexMatch(0);
        setSuggestion([]);
        validtabledata(data, "test", Promo);

        break;
      case "DoctorName":
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
        const formattedNameFull = [data?.Name, data?.Mobile, dept, spec]
          .filter(
            (item) =>
              item && String(item).trim() !== "" && item !== 0 && item !== "0",
          )
          .join("~");

        setFormData({ ...formData, [name]: formattedNameFull });
        setLTData((prev) => ({
          ...prev,
          [name]: data?.Name,
          DoctorID: data.DoctorReferalID,
          DoctorMobile: data?.Mobile,
          DoctorEmail: data?.Email,
          ProEmployee: data?.ProEmployee,
        }));

        setDoctorNotification(data?.Notification || "");

        try {
          const docAttachment = typeof data?.RequiredAttachment === "string"
            ? JSON.parse(data?.RequiredAttachment)
            : (data?.RequiredAttachment || []);
          setDoctorRequiredAttachment(Array.isArray(docAttachment) ? docAttachment : []);
        } catch {
          setDoctorRequiredAttachment([]);
        }

        // Close the dropdown after selection.
        // onMouseDown uses e.preventDefault() which blocks the blur event,
        // so onBlur cleanup never fires — must close explicitly here.
        setDoctorSuggestion([]);
        setDropFalse(false);
        setIndexMatch(-1);
        break;

        setState({
          ...state,
          ProEmployee:
            state?.ProEmployee != "" ? state?.ProEmployee : data?.ProEmployee,
        });
        setIndexMatch(0);
        setDoctorSuggestion([]);
        setDropFalse(false);
        break;
      case "SecondReferDoctor":
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
        const sformattedNameFull = [data?.Name, data?.Mobile, sdept, sspec]
          .filter(
            (item) =>
              item && String(item).trim() !== "" && item !== 0 && item !== "0",
          )
          .join("~");

        setFormData({ ...formData, [name]: sformattedNameFull });
        setLTData((prev) => ({
          ...prev,
          //  SecondReferDoctor: data?.Name,
          SecondReferDoctor: data?.DoctorReferalID || 0,
          // SecondReferDoctorID: data?.DoctorReferalID,
        }));
        setIndexMatch(0);
        setseconddoctorSuggestion([]);
        setSecondDropFalse(false);
        break;
      default:
        break;
    }
  };

  const handleLTData = (e) => {
    const { name, value } = e.target;
    let nextValue = value;

    if (name === "PatientIDProofNo" && isAadhaarIdType(LTData?.PatientIDProof)) {
      nextValue = sanitizeAadhaarInput(value);
      syncAadhaarProofError(nextValue);
    } else if (name === "PatientIDProofNo" && isPanIdType(LTData?.PatientIDProof)) {
      nextValue = String(value || "").toUpperCase();
      clearValidationError(name);
    } else {
      clearValidationError(name);
    }

    if (name === "PatientIDProofNo") {
      const proofType = String(LTData?.PatientIDProof || "").trim();
      if (proofType) {
        idProofByTypeRef.current[proofType] = nextValue;
      }
    }

    setLTData({
      ...LTData,
      [name]: nextValue,
    });
  };

  const handleIdProofBlur = (e) => {
    const proofType = LTData?.PatientIDProof;
    const proofNo = e?.target?.value ?? LTData?.PatientIDProofNo;
    const result = validateIdentityProof(proofType, proofNo);
    setMoreErrors((prev) => {
      const next = { ...prev };
      if (result.isValid) delete next.PatientIDProofNo;
      else next.PatientIDProofNo = result.message;
      return next;
    });
  };

  const handleIdProofKeyDown = (e) => {
    if (
      isAadhaarIdType(LTData?.PatientIDProof) &&
      e.key.length === 1 &&
      /\D/.test(e.key) &&
      !e.ctrlKey &&
      !e.metaKey
    ) {
      e.preventDefault();
      setMoreErrors((prev) => ({
        ...prev,
        PatientIDProofNo: "Aadhaar must contain only digits",
      }));
    }
    handleKeyDown(e, "PatientIDProofNo");
  };

  const handleIdProofInput = (e) => {
    if (!isAadhaarIdType(LTData?.PatientIDProof)) return;
    e.target.value = sanitizeAadhaarInput(e.target.value);
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      getDoctorSuggestion(formData, setDoctorSuggestion, setFormData);
    }, 100);
    return () => clearTimeout(timer);
  }, [formData?.DoctorName]);

  // Auto-highlight first item when doctor suggestions load
  useEffect(() => {
    if (doctorSuggestion?.length > 0) {
      setIndexMatch(0);
    }
  }, [doctorSuggestion]);

  const refreshDoctorSuggestion = () => {
    getDoctorSuggestion(formData, setDoctorSuggestion, setFormData);
  };

  const refreshSecondDoctorSuggestion = () => {
    getsecondDoctorSuggestion(formData, setseconddoctorSuggestion, setFormData);
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      getsecondDoctorSuggestion(
        formData,
        setseconddoctorSuggestion,
        setFormData,
      );
    }, 100);
    return () => clearTimeout(timer);
  }, [formData?.SecondReferDoctor]);

  // Auto-highlight first item when second doctor suggestions load
  useEffect(() => {
    if (seconddoctorSuggestion?.length > 0) {
      setIndexMatch(0);
    }
  }, [seconddoctorSuggestion]);

  const getBarcode = (id) => {
    let barcode = "";
    if (BarcodeLogic === 3) {
      barcode = tableData[0]?.BarcodeNo;
    } else if (BarcodeLogic === 4) {
      tableData?.map((ele) => {
        if (ele?.SampleTypeID === id) {
          barcode = "";
        }
      });
    }
    return barcode;
  };

  const handleSelectSlot = (data, slotData, testData) => {
    // SlotBookModal.jsx already toasts the accurate "will be booked at Save"
    // message for this — don't also show the old "Added" wording here.
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
        RadiologyAppointmentId: data?.RadiologyAppointmentId,
        // Carries the info bookPendingRadiologySlots() needs to actually
        // book this at Save time — see SlotBookModal.jsx's handleBookSlot.
        PendingRadiologyBooking: data?.PendingRadiologyBooking,
        UpdateModalityId: 1,
      };

      setTableData(updatedTableData);
      // PLO only auto-rebuilds from tableData when tableData.length changes
      // (see the `processPLOData` effect below) — this branch updates an
      // existing row's contents without changing the array length, so PLO
      // would otherwise keep serving its pre-booking snapshot (ModalityId
      // "0", no RadiologyAppointmentId) all the way to save. Same fix
      // handleBarcodeChange/SNR-check already apply for the same reason.
      processPLOData(updatedTableData);
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
          UpdateModalityId: 1,
        },
      ]);
    }
  };

  // Actually books the radiology slots picked earlier via SlotBookModal.jsx
  // (which only reserves them locally — see its handleBookSlot). Called from
  // handleSaveSmsEmailSave right before the registration itself is saved, so
  // the backend appointment only gets created once the user is actually
  // submitting, not the moment a test is added. Returns the tableData with
  // real RadiologyAppointmentId values filled in, or null if a slot could no
  // longer be booked (e.g. someone else took it in the meantime) — the
  // caller must abort the save in that case rather than register against a
  // slot that doesn't exist.
  const bookPendingRadiologySlots = async () => {
    const pendingRows = tableData.filter(
      (row) => row?.Radiology == 1 && !row?.RadiologyAppointmentId && row?.PendingRadiologyBooking,
    );
    if (pendingRows.length === 0) return tableData;

    const patientName = [state?.FirstName, state?.MiddleName, state?.LastName]
      .filter(Boolean)
      .join(" ");

    // Reset per-save — only appointments booked in *this* run get linked
    // once SaveData resolves below.
    freshlyBookedRadiologyAppointmentIdsRef.current = [];

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
        // Was hardcoded to 0/"" — panelId/panelName are the Rate Type
        // (BookSlotModal.jsx sends its own RateTypeId/RateTypeName the same
        // way), not left blank; state.RateID/RateTypeName are the same
        // fields already used everywhere else in this file for the
        // currently-selected Rate Type.
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
        // Backend returns appointmentId as an array of
        // { appointmentId, isRegistered } objects (one per booked slot)
        // instead of a plain number — unwrap it, with a fallback to the old
        // plain-number shape in case an older response ever shows up.
        const savedAppointmentId = Array.isArray(res?.data?.appointmentId)
          ? res.data.appointmentId[0]?.appointmentId
          : res?.data?.appointmentId;
        const idx = updated.findIndex((r) => r.InvestigationID === row.InvestigationID);
        if (idx !== -1) {
          updated[idx] = { ...updated[idx], RadiologyAppointmentId: savedAppointmentId };
        }
        if (savedAppointmentId) {
          freshlyBookedRadiologyAppointmentIdsRef.current.push(savedAppointmentId);
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

  const setBarcodeLogics = (table) => {
    if (BarcodeLogic == 4 || BarcodeLogic == 5 || BarcodeLogic == 3) {
      const arraySample = table.map((item) => {
        const matchingItem = PLO.flatMap(
          (data) => data.InvestigationSampleType || [],
        ).find((istItem) => istItem.sampleId === item.sampleId);

        if (matchingItem) {
          item.barcodeNo = matchingItem.barcodeNo;
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
          setBarcode: matchingTestId
            ? matchingTestId.setBarcode
            : ele.setBarcode,
        };
      });
      return PLO?.length == 0 ? table : finalDatas;
    }
  };

  const handleSrnCheck = (e, sampleName) => {
    const { checked } = e.target;

    // Update snrCheck state
    setSnrCheck((prev) => ({
      ...prev,
      [sampleName]: checked,
    }));

    const updatedTableData = tableData.map((test) => {
      const updatedSampleTypes = test.InvestigationSampleType?.map((sample) => {
        if (sample.sampleName === sampleName) {
          return {
            ...sample,
            isSrnChecked: checked,
            barcodeNo: checked ? "SNR" : "",
            isDisabled: checked,
          };
        }
        return sample;
      });

      const hasSampleType = test.InvestigationSampleType?.some(
        (sample) => sample.sampleName === sampleName,
      );

      return {
        ...test,
        BarcodeNo: hasSampleType ? (checked ? "SRN" : "") : test.BarcodeNo,
        InvestigationSampleType: updatedSampleTypes,
      };
    });

    setTableData(updatedTableData);
    processPLOData(updatedTableData);
  };

  const handleBarcodeChange = (e, sampleName) => {
    const { value } = e.target;

    const updatedTableData = tableData?.map((test) => {
      const updatedSampleTypes = test.InvestigationSampleType?.map((sample) => {
        if (sample.sampleName === sampleName) {
          // Don't update if the sample is SRN checked
          if (sample.isSrnChecked) {
            return sample;
          }
          return { ...sample, barcodeNo: value };
        } else if (sample.sampleName.toLowerCase()?.trim() === "na") {
          return { ...sample, barcodeNo: "0" };
        }
        return sample;
      });
      const hasSampleType = test.InvestigationSampleType?.some(
        (sample) => sample.sampleName === sampleName,
      );

      return {
        ...test,
        BarcodeNo: hasSampleType ? value : test.BarcodeNo,
        InvestigationSampleType: updatedSampleTypes,
      };
    });

    setTableData(updatedTableData);
    processPLOData(updatedTableData);
  };

  const handleCloseBarcodeModal = (data) => {
    // const checkBarcode = data?.find((ele) => {
    //   if (ele?.sampleId === "0") return false;
    //   return ele?.barcodeNo === "" || ele?.barcodeNo?.length < 3
    // })
    // if (checkBarcode) {
    //   if (checkBarcode.barcodeNo ==="") {
    //     toast.error("Barcode is Required");
    //   } else {
    //     toast.error("Minimum 3 Char is Required");
    //   }
    //   return;
    // }
    const updatedTableData = [...tableData];
    if (BarcodeLogic == 4 || BarcodeLogic == 5 || BarcodeLogic == 3) {
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

  let sampleColorObj = {};
  tableData?.flatMap((e) =>
    e.InvestigationSampleType?.map((items, idx) => {
      sampleColorObj[items?.sampleName] = items?.sampleColor;
    }),
  );

  let uniqueSampleTypesName = [];
  uniqueSampleTypesName = [
    ...new Map(
      tableData
        ?.flatMap((e) =>
          e.InvestigationSampleType?.filter(
            (item) => item?.sampleId !== "0" && item?.sampleId !== 0,
          ),
        )
        ?.sort(
          (a, b) =>
            (a?.sampleTypePrintSequence ?? 9999) -
            (b?.sampleTypePrintSequence ?? 9999),
        )
        ?.map((item) => [item?.sampleName, item]),
    ).values(),
  ].map((x) => x?.sampleName);

  const groupTestsBySample = (tableData) => {
    const sampleGroups = {};

    tableData?.forEach((test) => {
      test?.InvestigationSampleType?.forEach((sample) => {
        const { sampleName, testName } = sample;
        if (!sampleName || sampleName === "0") return; // skip invalid samples

        if (!sampleGroups[sampleName]) {
          sampleGroups[sampleName] = [];
        }
        sampleGroups[sampleName].push(testName);
      });
    });

    return sampleGroups;
  };

  const showMarkerRef = useRef(showMarker);
  useEffect(() => {
    showMarkerRef.current = showMarker;
  }, [showMarker]);

  const getDefaultSC = () => {
    switch (selectedRateType?.SampleCollectionType) {
      case 1: // Skip Sample Collection
        return 2; // checked
      case 2: // Manual
        return 1; // unchecked
      case 3: // Hide Sample Collection
        return 1; // unchecked
      case 4: // Auto Collect
        return 2; // checked
      default:
        return 1;
    }
  };

  // const getDefaultUrgent = () => {
  //   return selectedRateType?.IsUrgent === 1 ? 1 : 0;
  // };

  const getDefaultUrgent = (apiUrgent) => {
    if (selectedRateType?.IsUrgent === 1) return 1;

    return apiUrgent === 1 ? 1 : 0;
  };

  const getTableData = (data, key, Promo) => {
    setLoad(true);
    const InvestigationID =
      data?.InvestigationID ||
      data?.investigationID ||
      data?.testID ||
      data?.testId ||
      data?.Id ||
      data?.id ||
      data?.investigationid;

    if (!InvestigationID || InvestigationID === "0" || InvestigationID === 0) {
      console.error("Missing InvestigationID in getTableData:", data);
      toast.error("Invalid Test ID selected");
      setLoad(false);
      return;
    }

    const ItemIndex = tableData.findIndex(
      (e) =>
        e.InvestigationID == InvestigationID ||
        e.investigationID == InvestigationID,
    );

    if (ItemIndex === -1) {
      const _effectiveRateID = data?._rateTypeOverride || state?.RateID;
      const p1 = axiosInstance.post("TestData/BindSingleTestData", {
        // UHID: DefaultCurrencyName === "KES" ? String(state?.PatientCode) : "",
        CopaymentRatetype: Number(_effectiveRateID) || 0,
        InvestigationID: InvestigationID,
        ReferenceRate: state?.ReferenceRate || data?.ReferenceRate || suggestion[0]?.ReferenceRate || 0,
        // CentreID: isLocalEnabled ? state?.RateID : data?.CentreID,
        CentreID: data?.CentreID,
        ActualRateTypeID: _effectiveRateID,
        AllowZeroRateBooking: selectedRateType?.AllowZeroRateBooking || 0,
        CentreIdNew: LTData?.CentreID,
        policyId: Number(familyMemberDetails?.PolicyID) || 0,
        FamlilyMemberEmployeeID: Number(familyMemberDetails?.FamlilyMemberEmployeeID || familyMemberDetails?.EmployeeID) || 0,
        FamilyMemberRelationType: familyMemberDetails?.RelationType || familyMemberDetails?.Relation || "",
        FamilyMemberIsPrimary: Number(familyMemberDetails?.FamilyMemberIsPrimary) || 0,
        IsPolicyPrescription: isPolicyPrescription,
        AlreadyAppliedPolicyDiscount: tableData.reduce(
          (sum, row) => sum + (Number(row.Discount) || 0),
          0,
        ),
        PatientCode: familyMemberDetails?.PatientCode || state?.PatientCode,
        MembershipCardID: throughMemberData
          ? Memberdetails?.MembershipCardID
          : 0,
        SetMRP: LTData?.SetMRP,
        IsPromotional: Promo ? 1 : 0,
        PromotionalID: data?.PromotionalID ? data?.PromotionalID : 0,
        Cdac: data?.throughHmis ? data?.throughHmis : state?.throughHmis,
        scanDate: markerData.scanDate
          ? new Date(markerData.scanDate).toISOString()
          : new Date().toISOString(),
        sampleCollectionDate: markerData.sampleCollection
          ? new Date(markerData.sampleCollection).toISOString()
          : new Date().toISOString(),
        gestationalWeek: Number(markerData.gestationalWeek) || 0,
        gestationalDays: Number(markerData.gestationalDays) || 0,
        age: (() => {
          let ageInYears = Number(state?.AgeYear) || 0;
          if (markerData.age) {
            const dob = new Date(markerData.age);
            const today = new Date();
            let years = today.getFullYear() - dob.getFullYear();
            const m = today.getMonth() - dob.getMonth();
            if (m < 0 || (m === 0 && today.getDate() < dob.getDate()))
              years--;
            ageInYears = years;
          }
          return ageInYears;
        })(),
        isVetCanine: state?.isVetCanine ?? 0,
        MembershipCardNo: String(membershipnum ?? "").trim(),
        CentreType: selectedRateType?.CentreType
      });

      const p2 =
        data?.DataType === "Package" || data?.IsPackage === 1
          ? axiosInstance.get(
            `Investigations/EditInvestigation?id=${data.InvestigationID}&DataType=Package`
          )
          : Promise.resolve(null);

      Promise.all([p1, p2])
        .then(([res, pRes]) => {
          if (res?.data?.success && (res?.data?.message?.length > 0 || res?.data?.invDetails)) {
            const testData = res?.data?.message?.[0] || res?.data?.invDetails;
            if (Number(testData?.IsAllowTest) === 0) {
              toast.error("Selected test is not in contract");
              setLoad(false);
              return;
            }
            setInvestigationId((prev) => [
              ...new Set([...prev, testData.InvestigationID])
            ]);
            const observationData = pRes?.data?.observationData || res?.data?.observationData || testData?.observationData || [];
            const testIdsToRemove = observationData.map((t) =>
              String(t.TestId || t.testID || t.InvestigationID || t.InvestigationId || "").trim().toLowerCase()
            ).filter(id => id !== "");

            const testCodesToRemove = observationData.map((t) =>
              String(t.TestCode || "").trim().toLowerCase()
            ).filter(code => code !== "");
            const packageOutSourceLabs =
              mapPackageOutSourceLabs(observationData);
            if (testData?.todaybookcount > "0") {
              setPendingTest({
                testData,
                originalData: data,
                key,
                Promo,
                packageOutSourceLabs,
              });

              setShowTestModal(true);
              setLoad(false);
              return;
            }
            /* modal works ends here */

            // setCoPaymentPercentage(res?.data?.message[0]?.CoPaymentPercentage);

            const patientGender =
              data?._patientGender || state?.Gender || (state?.Title === "Mrs." ? "Female" : "");
            const apiUrgent = testData?.Urgent;
            const urgentDefault = getDefaultUrgent(apiUrgent);

            if (
              testData?.IsMarkerTest === 1 &&
              !showMarkerRef.current &&
              !data?.isFromMarkerModal &&
              patientGender === "Female"
            ) {
              setMarkerData((prev) => ({
                ...prev,
                scanDate: prev.scanDate ? new Date(prev.scanDate) : new Date(),
                sampleCollection: prev.sampleCollection
                  ? new Date(prev.sampleCollection)
                  : new Date(),
                age: state?.DOB
                  ? new Date(state.DOB)
                  : prev.age
                    ? new Date(prev.age)
                    : new Date(),
              }));
              setShowMarker(true);
              setLoad(false);
              return;
            }
            const patientAgeDays = markerData.age
              ? moment(moment().format("YYYY-MM-DD")).diff(
                moment(markerData.age),
                "days",
              )
              : (data?._patientAgeInDays ?? state?.TotalAgeInDays);

            const { genderCheck, ageCheck, message } = CheckageTest(

              testData?.Gender,
              testData?.ToAge,
              testData?.FromAge,
              patientGender,
              patientAgeDays,
            );

            if (!genderCheck || !ageCheck) {
              toast.warn(
                `Validation failed - Gender: ${genderCheck ? "OK" : "Fail"}, Age: ${ageCheck ? "OK" : "Fail"}. ${message}`,
              );
            }

            if (genderCheck && ageCheck) {
              if (
                testData?.IsSampleRequired == "Sample Required" &&
                (testData?.SampleTypeID == "" ||
                  testData?.SampleTypeID == 0)
              ) {
                toast?.error(
                  "In " +
                  testData?.TestName +
                  " test SampleType Not Found",
                );
              } else if (testData?.Radiology == 1) {
                // mode: "auto" — book the next available (non-past) slot
                // silently instead of popping the picker open; the gear
                // icon in RegisterationTable.jsx (which never sets mode)
                // still opens the visible picker for a manual override.
                setSlotOpen({
                  data: testData,
                  show: true,
                  mode: "auto",
                });
                setTableData((prevData) => {
                  const filteredData =
                    testIdsToRemove.length > 0 || testCodesToRemove.length > 0
                      ? prevData.filter((item) => {
                        const itemId = String(
                          item.InvestigationID ||
                          item.investigationID ||
                          item.testID ||
                          item.testId ||
                          ""
                        )
                          .trim()
                          .toLowerCase();
                        const itemCode = String(item.TestCode || "")
                          .trim()
                          .toLowerCase();
                        return (
                          !testIdsToRemove.includes(itemId) &&
                          !testCodesToRemove.includes(itemCode)
                        );
                      })
                      : prevData;
                  return [
                    ...filteredData,
                    {
                      ...testData,
                      hmis_req_no: data?.hmis_req_no ? data.hmis_req_no : "",
                      hmis_req_dno: data?.hmis_req_dno ? data.hmis_req_dno : "",
                      hmis_lab_code: data?.hmis_lab_code
                        ? data.hmis_lab_code
                        : "",
                      hmis_test_code: data?.hmis_test_code
                        ? data.hmis_test_code
                        : "",
                      hmis_test_name: data?.hmis_test_name
                        ? data.hmis_test_name
                        : "",
                      hmis_sample_code: data?.hmis_sample_code
                        ? data.hmis_sample_code
                        : "",
                      hmis_sample_name: data?.hmis_sample_name
                        ? data.hmis_sample_name
                        : "",
                      cdac_inv_status: data?.cdac_inv_status
                        ? Number(data.cdac_inv_status)
                        : 0,
                      req_type: data?.req_type ? data.req_type : "0",
                      Discount: data?.Discount
                        ? (
                          (Number(testData.Rate) *
                            data?.Discount) /
                          100
                        ).toFixed(2)
                        : Number(testData.DiscAmt) == 0
                          ? ""
                          : Number(testData.DiscAmt),
                      Rate: Number(testData.Rate).toFixed(2),
                      NetAmount: data?.Discount
                        ? (
                          testData.Rate -
                          (Number(testData.Rate) *
                            data?.Discount) /
                          100
                        ).toFixed(2)
                        : Number(testData.Amount).toFixed(2),
                      // IsSampleCollected: "N",
                      IsSampleCollected: getDefaultSC() === 2 ? "S" : "N",
                      // Status: 1,
                      Status: getDefaultSC(),
                      // IsUrgent: 0,
                      IsUrgent: urgentDefault,
                      UrgentDateTime: "",
                      BarcodeNo:
                        getBarcode(testData?.SampleTypeID) ?? "",
                      isLabOutSource: testData?.isLabOutSource,
                      IsCulture: testData?.IsCulture,
                      IsConcern: testData?.IsConcern,
                      IsPndtForm: testData?.IsPndtForm,
                      UrgentdeleiveryDate:
                        testData?.UrgentDeliveryDate,
                      // DeliveryDate: testData?.deliveryDate,
                      // DeliveryDate:
                      //   getDefaultUrgent() === 1
                      //     ? testData?.UrgentDeliveryDate
                      //     : testData?.deliveryDate,
                      DeliveryDate:
                        urgentDefault === 1
                          ? testData?.UrgentDeliveryDate
                          : testData?.deliveryDate,
                      InvestigationSampleType:
                        testData?.InvestigationSampleType,
                      DepartmentName: testData?.DepartmentName,
                      departmentPrintOrder: data?.departmentPrintOrder,
                      investigationPrintOrder: data?.investigationPrintOrder,
                      isOutSource: Number(testData?.isOutSource) || 0,
                      isLabOutSource: Number(testData?.isOutSource) || 0,
                      LabOutsrcID: "",
                      LabOutsrcName: "",
                      packageOutSourceLabs,
                      // bypatinetandPanel
                      paybypanel: testData?.paybypanel
                        ? testData?.paybypanel
                        : "0",
                      paybypatient: testData?.paybypatient
                        ? testData?.paybypatient
                        : "0",
                    },
                  ];
                });
              } else
                setTableData((prevData) => {
                  const filteredData =
                    testIdsToRemove.length > 0 || testCodesToRemove.length > 0
                      ? prevData.filter((item) => {
                        const itemId = String(
                          item.InvestigationID ||
                          item.investigationID ||
                          item.testID ||
                          item.testId ||
                          ""
                        )
                          .trim()
                          .toLowerCase();
                        const itemCode = String(item.TestCode || "")
                          .trim()
                          .toLowerCase();
                        return (
                          !testIdsToRemove.includes(itemId) &&
                          !testCodesToRemove.includes(itemCode)
                        );
                      })
                      : prevData;
                  return [
                    ...filteredData,
                    {
                      ...testData,
                      hmis_req_no: data?.hmis_req_no ? data.hmis_req_no : "",
                      hmis_req_dno: data?.hmis_req_dno ? data.hmis_req_dno : "",
                      hmis_lab_code: data?.hmis_lab_code
                        ? data.hmis_lab_code
                        : "",
                      hmis_test_code: data?.hmis_test_code
                        ? data.hmis_test_code
                        : "",
                      hmis_test_name: data?.hmis_test_name
                        ? data.hmis_test_name
                        : "",
                      hmis_sample_code: data?.hmis_sample_code
                        ? data.hmis_sample_code
                        : "",
                      hmis_sample_name: data?.hmis_sample_name
                        ? data.hmis_sample_name
                        : "",
                      cdac_inv_status: data?.cdac_inv_status
                        ? Number(data.cdac_inv_status)
                        : 0,
                      req_type: data?.req_type ? data.req_type : "0",
                      Discount: data?.Discount
                        ? (
                          (Number(testData.Rate) * data?.Discount) /
                          100
                        ).toFixed(2)
                        : Number(testData.DiscAmt) == 0
                          ? ""
                          : Number(testData.DiscAmt),
                      Rate: Number(testData.Rate).toFixed(2),
                      // bypatinetandPanel
                      paybypanel: testData?.paybypanel
                        ? testData?.paybypanel
                        : "0",
                      paybypatient: testData?.paybypatient
                        ? testData?.paybypatient
                        : "0",
                      NetAmount: data?.Discount
                        ? (
                          testData.Rate -
                          (Number(testData.Rate) * data?.Discount) /
                          100
                        ).toFixed(2)
                        : Number(testData.Amount).toFixed(2),
                      // IsSampleCollected: "N",
                      IsSampleCollected: getDefaultSC() === 2 ? "S" : "N",
                      // Status: 1,
                      Status: getDefaultSC(),
                      // IsUrgent: 0,
                      IsUrgent: urgentDefault,
                      UrgentDateTime: "",
                      BarcodeNo: getBarcode(testData?.SampleTypeID) ?? "",
                      isLabOutSource: testData?.isLabOutSource,
                      IsCulture: testData?.IsCulture,
                      IsConcern: testData?.IsConcern,
                      IsPndtForm: testData?.IsPndtForm,
                      UrgentdeleiveryDate: testData?.UrgentDeliveryDate,
                      DeliveryDate:
                        urgentDefault === 1
                          ? testData?.UrgentDeliveryDate
                          : testData?.deliveryDate,
                      InvestigationSampleType: setBarcodeLogics(
                        testData?.InvestigationSampleType
                      ),
                      DepartmentName: testData?.DepartmentName,
                      departmentPrintOrder: data?.departmentPrintOrder,
                      investigationPrintOrder: data?.investigationPrintOrder,
                      isOutSource: Number(testData?.isOutSource) || 0,
                      isLabOutSource: Number(testData?.isOutSource) || 0,
                      LabOutsrcID: "",
                      LabOutsrcName: "",
                      packageOutSourceLabs,
                    },
                  ];
                });
              // toast.success("Test added successfully");
              if (key == "Coupon") {
                setCoupon({
                  ...coupon,
                  field: true,
                });
              }
            } else {
              !genderCheck &&
                toast.error("This Test is Not for " + state?.Gender);
              !ageCheck && toast.error(message);
            }
          } else if (res?.data?.message?.length == 0) {
            toast.error("Please check rate/Share and sample type");
          } else {
            toast.error(res?.data?.message || "Failed to add test");
          }

          setLoad(false);
        })
        .catch((err) => {
          setLoad(false);
          console.log(err);
          toast.error(
            err?.response?.data?.message ||
            "An error occurred while adding test",
          );
        });
    } else {
      setLoad(false);
      toast.error("Duplicate Test Found");
    }
  };

  console.log("InvestigationId:", investigationId);
  /* modal works start here */
  const handleContinueTest = () => {
    const { testData, originalData, packageOutSourceLabs } = pendingTest;

    const urgentDefault = getDefaultUrgent(testData?.Urgent);

    setTableData((prev) => [
      ...prev,
      {
        ...testData,
        Rate: Number(testData.Rate).toFixed(2),
        Discount: originalData?.Discount
          ? ((Number(testData.Rate) * originalData.Discount) / 100).toFixed(2)
          : Number(testData.DiscAmt) === 0
            ? ""
            : Number(testData.DiscAmt),

        NetAmount: originalData?.Discount
          ? (
            testData.Rate -
            (Number(testData.Rate) * originalData.Discount) / 100
          ).toFixed(2)
          : Number(testData.Amount).toFixed(2),

        IsSampleCollected: getDefaultSC() === 2 ? "S" : "N",
        Status: getDefaultSC(),
        IsUrgent: urgentDefault,
        BarcodeNo: getBarcode(testData?.SampleTypeID) ?? "",

        DeliveryDate:
          urgentDefault === 1
            ? testData?.UrgentDeliveryDate
            : testData?.deliveryDate,
        isOutSource: Number(testData?.isOutSource) || 0,
        isLabOutSource: Number(testData?.isOutSource) || 0,
        LabOutsrcID: "",
        LabOutsrcName: "",
        packageOutSourceLabs: packageOutSourceLabs || [],
      },
    ]);

    setShowTestModal(false);
    setPendingTest(null);
  };

  const handleCancelTest = () => {
    setShowTestModal(false);
    setPendingTest(null);
  };
  /* modal works start here */

  const handlePLOChange = (e, index, main) => {
    const { name, checked } = !main && e.target;
    if (index >= 0) {
      const data = [...tableData];
      if (main) {
        data[index]["IsUrgent"] = 0;
        data[index]["UrgentDateTime"] = "";
      } else if (name === "Status") {
        data[index][name] = checked ? 2 : 1;
        data[index]["IsSampleCollected"] = checked ? "S" : "N";
        if ([3, 4, 5].includes(BarcodeLogic)) {
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
      const val = tableData?.map((ele) => {
        return {
          ...ele,
          Status: checked ? 2 : 1,
          IsSampleCollected: checked ? "S" : "N",
        };
      });
      setTableData(val);
    }
  };

  // const handleCloseBarcodeModal = (value) => {
  //   if (value?.length >= 3) {
  //     checkDuplicateBarcode(value, "").then((res) => {
  //       if (res === "") {
  //         setShow5({ modal: false, index: -1 });
  //       } else {
  //         toast.error(res);
  //       }
  //     });
  //   } else if (value === "") {
  //     toast.error("This Field Required");
  //   } else {
  //     toast.error("Minimum 3 Char is Required");
  //   }
  // };

  const handleMarkerTest = () => {
    if (Number(markerData.gestationalDays) > 7) {
      toast.error("Please Enter Valid days which is equal to 7 or less than 7");
      return;
    }
    if (Number(markerData.gestationalWeek) > 40) {
      toast.error(
        "Please Enter Valid week which is equal to 40 or less than 40",
      );
      return;
    }
    let ageInYears = Number(state?.AgeYear) || 0;
    if (markerData.age) {
      const dob = new Date(markerData.age);
      const today = new Date();
      let years = today.getFullYear() - dob.getFullYear();
      const m = today.getMonth() - dob.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) years--;
      ageInYears = years;
    }
    const payload = {
      scanDate: markerData.scanDate
        ? new Date(markerData.scanDate).toISOString()
        : new Date().toISOString(),
      sampleCollectionDate: markerData.sampleCollection
        ? new Date(markerData.sampleCollection).toISOString()
        : new Date().toISOString(),
      gestationalWeek: Number(markerData.gestationalWeek) || 0,
      gestationalDays: Number(markerData.gestationalDays) || 0,
      gender: "",
      age: ageInYears,
      sampleType: "",
      isFasting: true,
    };
    axiosInstance
      .post("PatientRegistration/CheckMarkerTest", payload)
      .then((res) => {
        if (res?.data?.success) {
          toast.success(
            res?.data?.message || "Marker Test checked successfully",
          );
          setMarkerResults(res?.data?.data || []);
        } else {
          toast.error(res?.data?.message || "Something went wrong");
        }
      })
      .catch((err) => {
        console.log(err);
        toast.error("Failed to check Marker Test");
      });
  };

  const handleDiscountAgeWiseItem = () => {
    axiosInstance
      .post("PatientRegistration/DiscountTypeByAge", {
        Age: state?.AgeYear,
        Gender: state?.Gender,
      })
      .then((res) => {
        const data = res?.data?.message;
        const val = data?.map((ele) => {
          return {
            label: ele?.DiscountType,
            value: ele?.DiscountId,
            perCentage: ele?.DiscountPer,
            isDiscountDocument: ele?.IsDiscountDocument,
            documentName: ele?.DocumentName,
            documentID: ele?.DocumentID,
          };
        });

        val?.unshift({
          label: "Select Discount",
          value: "",
          perCentage: "",
        });

        setAgeWiseDiscountDropdown(val);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const handleUrgent = (value, index, mainClose) => {
    const data = [...tableData];
    if (mainClose) {
      data[index]["UrgentDateTime"] = "";
      setTableData(data);
    } else {
      data[index]["UrgentDateTime"] = value;
      setTableData(data);
    }
  };

  const handleDiscount = (value, index) => {
    if (disAmt === "" && discountPercentage === "") {
      const discountCheck = validateRowDiscount(value, tableData[index]?.Rate);
      if (!discountCheck.isValid) {
        toast.error(t(discountCheck.message));
        return;
      }
      const data = [...tableData];
      const numericDiscount = value === "" ? 0 : Number(value);
      data[index]["Discount"] = value;
      data[index]["NetAmount"] =
        (Number(data[index]["Rate"]) - numericDiscount) *
        (Number(data[index]["Quantity"]) || 1);
      setTableData(data);
      processPLOData(data);
    } else {
      toast.error("Discount already given");
    }
  };

  const handleRateChange = (value, index) => {
    const data = [...tableData];
    const discount = Number(data[index]["Discount"]) || 0;
    const quantity = Number(data[index]["Quantity"]) || 1;
    data[index]["Rate"] = value;
    data[index]["NetAmount"] = (Number(value) - discount) * quantity;
    setTableData(data);
    processPLOData(data);
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
    processPLOData(data);
  };

  useEffect(() => {
    // Gross must always reflect the current test list, even when a discount
    // is active — otherwise adding/removing a test leaves Gross stale.
    const total = tableData.reduce(
      (acc, item) => acc + Number(item.Rate) * (Number(item.Quantity) || 1),
      0,
    );

    // Collection Charges is a flat add-on that sits on top of the test
    // totals — it must never feed the discount % / DiscountOnTotal math
    // below (discount is only ever computed off the pure test amounts, and
    // the backend cross-checks DiscountOnTotal against the sum of PLO
    // DiscountAmt, which knows nothing about this charge). It's added to
    // Gross/Net only after each branch's own discount logic is done.
    const collectionCharges = Number(LTData?.CollectionCharges) || 0;

    if (throughMemberData || throughFamilyData) {
      const NetTotal = tableData.reduce(
        (acc, item) => acc + Number(item.NetAmount),
        0,
      );
      const discountAmt = total > 0 && NetTotal >= 0 ? total - NetTotal : 0;

      setLTData({
        ...LTData,
        GrossAmount: total + collectionCharges,
        NetAmount: NetTotal + collectionCharges,
        DiscountOnTotal: discountAmt > 0 ? discountAmt : "",
        SrfId: checkCovid() ? LTData?.SrfId : "",
        IcmrId: checkCovid() ? LTData?.IcmrId : "",
      });
      setdisAmt(discountAmt > 0 ? discountAmt.toFixed(2) : "");
      setDiscountPercentage(
        discountAmt > 0 && total > 0
          ? ((discountAmt / total) * 100).toFixed(2)
          : "",
      );
    } else if (Number(disAmt) > 0) {
      // Flat discount amount active: recompute Gross; the flat amount stays
      // fixed, so Net rises by the newly added test's full rate.
      setLTData({
        ...LTData,
        GrossAmount: total + collectionCharges,
        NetAmount: Number(
          (total - Number(disAmt) + collectionCharges).toFixed(2),
        ),
        DiscountOnTotal: disAmt,
        SrfId: checkCovid() ? LTData?.SrfId : "",
        IcmrId: checkCovid() ? LTData?.IcmrId : "",
      });
    } else if (Number(discountPercentage) > 0) {
      // Discount % active: recompute Gross and re-derive Net so the same
      // percentage stays applied across the updated test list.
      const NetTotal = total - (total * Number(discountPercentage)) / 100;
      setLTData({
        ...LTData,
        GrossAmount: total + collectionCharges,
        NetAmount: Number((NetTotal + collectionCharges).toFixed(2)),
        DiscountOnTotal: Number((total - NetTotal).toFixed(2)),
        SrfId: checkCovid() ? LTData?.SrfId : "",
        IcmrId: checkCovid() ? LTData?.IcmrId : "",
      });
    } else {
      const NetTotal = tableData.reduce(
        (acc, item) => acc + Number(item.NetAmount),
        0,
      );

      // EPD-122: when NetTotal is 0 (100% test-wise discount), still record the
      // discount amount — previously `NetTotal > 0` wiped DiscountOnTotal to ""
      // and disabled the mandatory approver/reason selects.
      setLTData({
        ...LTData,
        GrossAmount: total + collectionCharges,
        NetAmount: NetTotal + collectionCharges,
        DiscountOnTotal:
          total > 0 && NetTotal < total
            ? Number((total - NetTotal).toFixed(2))
            : "",
        SrfId: checkCovid() ? LTData?.SrfId : "",
        IcmrId: checkCovid() ? LTData?.IcmrId : "",
      });
    }
    const currentInvestigationIds = (tableData || [])
      .map((item) => item.InvestigationID)
      .sort()
      .join(",");

    if (currentInvestigationIds !== prevInvestigationIdsRef.current) {
      prevInvestigationIdsRef.current = currentInvestigationIds;
      tableData?.length > 2 && getPackageSuggestions(tableData);
    }
  }, [tableData, LTData?.CollectionCharges, disAmt, discountPercentage]);

  const getPackageSuggestions = (data) => {
    const payload = [];

    data.forEach((obj) => {
      payload.push(obj.InvestigationID);
    });
    axiosInstance
      .post("TestData/BindPackage", {
        InvestigationID: payload,
        CentreID: state?.RateID,
      })
      .then((res) => {
        let data = res?.data?.message;
        if (res?.data?.success) {
          setSuggestionData((ele) => ({
            ...ele,
            show: true,
            packageSuggestions: {
              ...ele.packageSuggestions,
              data: data,
              show: true,
            },
          }));
        } else {
          setSuggestionData((ele) => ({
            ...ele,
            show: suggestionData?.testSuggestions?.show || false,
            packageSuggestions: {
              ...ele.packageSuggestions,
              data: [],
              show: false,
            },
          }));
        }
      })
      .catch((err) => {
        setSuggestionData((ele) => ({
          ...ele,
          packageSuggestions: {
            ...suggestionData.packageSuggestions,
            data: [],
            show: false,
          },
        }));
        // toast.error(
        //   err?.response?.data?.message
        //     ? err?.response?.data?.message
        //     : "Error Occured"
        // );
      });
  };
  // const getSpecialDayTest = (CentreID, RateTypeID) => {
  //   axiosInstance
  //     .post("TestData/BindPromotional", {
  //       CentreID: CentreID?.toString(),
  //       RateTypeID: RateTypeID?.toString(),
  //     })
  //     .then((res) => {
  //       if (res?.data?.success) {
  //         let data = res?.data?.message;
  //         setSuggestionData((ele) => ({
  //           ...ele,
  //           show: true,
  //           daySuggestions: {
  //             ...suggestionData.daySuggestions,
  //             data: data,
  //             show: true,
  //           },
  //         }));
  //       } else {
  //         setSuggestionData((ele) => ({
  //           ...ele,
  //           daySuggestions: {
  //             ...suggestionData.daySuggestions,
  //             data: [],
  //             show: false,
  //           },
  //         }));
  //       }
  //     })
  //     .catch((err) => {
  //       setSuggestionData((ele) => ({
  //         ...ele,
  //         daySuggestions: {
  //           ...suggestionData.daySuggestions,
  //           data: [],
  //           show: false,
  //         },
  //       }));
  //     });
  // };
  const globalVisibleFieldByVisitType = (fields) => {
    fields.forEach((ele) => {
      if (ele?.IsVisible) {
        if (["HLMPatientType", "Source"].includes(ele?.FieldType)) {
          getDropDownData(ele?.FieldType);
        }
      }
    });
  };

  const fetchFields = (visitType) => {
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
        globalVisibleFieldByVisitType(res?.data?.message);
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

  const checkCovid = () => {
    const isCovid = PLO?.find((ele) => ele?.IsCovid == 1);
    if (isCovid) return true;
    else return false;
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
  const getUploadFileIdentity = () => {
    axiosInstance
      .post("Global/GetGlobalData", {
        Type: "RequiredAttachment",
      })
      .then((res) => {
        let data = res.data.message;
        let UploadFileIdentity = data.map((ele) => {
          return {
            value: ele.FieldDisplay,
            label: ele.FieldDisplay,
          };
        });
        return setRequiredAttachment(UploadFileIdentity);
      })
      .catch((err) => console.log(err));
  };

  const getDropDownData = (name) => {
    const match = [
      "Title",
      "Gender",
      "BankName",
      "HLMPatientType",
      "Source",
      "WardNo",
    ];
    axiosInstance
      .post("Global/getGlobalData", { Type: name })
      .then((res) => {
        let data = res.data.message;
        let value = data.map((ele) => {
          return {
            value: match.includes(name) ? ele.FieldDisplay : ele.FieldID,
            label: ele.FieldDisplay,
            ...(name === "Title" ? { isVetCanine: ele.IsVetCanine ?? 0 } : {}),
          };
        });
        !["Title", "PaymentMode", "Gender"].includes(name) &&
          value.unshift({ label: `Select ${name} `, value: "" });

        switch (name) {
          case "Gender":
            const extractedGenders = value
              ?.filter((option) => option?.value != "Both")
              .map((option) => {
                return {
                  value: option?.value,
                  label: option?.label,
                };
              });

            setGender([
              { label: "Select Gender", value: "" },
              ...extractedGenders,
            ]);
            break;
          case "Title":
            setTitle(value);

            break;
          case "PaymentMode":
            setPaymentMode(value);
            break;
          case "BankName":
            setBankName(value);
            break;
          case "HLMPatientType":
            setHLMPatientType(value);
            break;
          case "Source":
            setSourceType(value);
            break;
          case "WardNo":
            setWardNoOptions(value);
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

  const handleShowMobile = () => {
    getDataByMobileNo("Mobile");

    // setShow4(true)
  };

  const handleFilter = (data) => {
    // InvestigationID

    if (coupon?.field) {
      toast.error(
        "You can't remove test because you have applied coupon, first remove coupon code.",
      );
    } else {
      if ((disAmt || discountPercentage) && !throughMemberData && !throughFamilyData) {
        toast.error("First Remove Disc per Or Discount Percentage");
      } else {
        const value = tableData.filter(
          (ele) => ele.InvestigationID !== data.InvestigationID,
        );
        setTableData(value);
        getPackageSuggestions(value);
        setInvestigationId((prev) =>
          prev.filter((id) => id !== data.InvestigationID)
        );
        // toast.success("successfully Removed");
        setRcData([
          {
            PayBy: "Patient",
            ReceiptNo: "",
            ledgerNoCr: "",
            RateTypeId: state?.RateID,
            PaymentMode: defaultPayment.PaymentMode,
            PaymentModeID: defaultPayment.PaymentModeID,
            Amount: "",
            BankName: "",
            CardDate: "",
            CardNo: "",
            CentreID: LTData?.CentreID,
          },
        ]);
        setPayByPatientTotal(0);
        setCoPaymentPercentage(0);
      }
    }
  };

  const handleFilterAll = (datas = []) => {
    if (coupon?.field) {
      toast.error(
        "You can't remove test because you have applied coupon, first remove coupon code.",
      );
      return;
    }

    if ((disAmt || discountPercentage) && !throughMemberData && !throughFamilyData) {
      toast.error("First Remove Disc per Or Discount Percentage");
      return;
    }

    const investigationIdsToRemove = datas.map((item) => item.InvestigationID);

    const updatedTableData = tableData.filter(
      (ele) => !investigationIdsToRemove.includes(ele.InvestigationID),
    );

    setTableData(updatedTableData);
    getPackageSuggestions(updatedTableData);

    // toast.success("Successfully Removed");

    setRcData([
      {
        PayBy: "Patient",
        ReceiptNo: "",
        ledgerNoCr: "",
        RateTypeId: state?.RateID,
        PaymentMode: defaultPayment.PaymentMode,
        PaymentModeID: defaultPayment.PaymentModeID,
        Amount: "",
        BankName: "",
        CardDate: "",
        CardNo: "",
        CentreID: LTData?.CentreID,
      },
    ]);
  };

  const checkBarcodeValidationForDuplicate = (currTableData) => {
    let duplicateFound = false;
    const barcodeSampleMap = new Map();

    for (let ele of currTableData) {
      ele?.InvestigationSampleType?.forEach((item) => {
        const { sampleId, barcodeNo } = item || {};
        if (!sampleId || !barcodeNo || barcodeNo === "SNR") return;

        if (
          barcodeSampleMap.has(barcodeNo) &&
          barcodeSampleMap.get(barcodeNo) !== sampleId
        ) {
          duplicateFound = true;
        } else {
          barcodeSampleMap.set(barcodeNo, sampleId);
        }
      });
    }

    if (duplicateFound) {
      toast.error(
        "Barcode number cannot be the same for different sample types.",
      );
      return true;
    }

    return false;
  };

  // const checkBarcodeValidationForBlank = (currTableData) => {
  //   let blankFound = false;

  //   for (const ele of currTableData) {
  //     ele?.InvestigationSampleType?.forEach((item) => {
  //       const { barcodeNo } = item || {};
  //       if (barcodeNo || barcodeNo.trim() !== "" || barcodeNo !== null) {
  //         blankFound = true;
  //       }
  //     });
  //   }

  //   if (!blankFound) {
  //     toast.error("Barcode number cannot be blank.");
  //     return true;
  //   }

  //   return false;
  // };

  const GetLastVisitNoByCentreID = async (centreID = "") => {
    await axiosInstance
      .post(`CommonController/GetLastVisitNoByCentreID`, {
        centreID: Number(centreID || 0),
      })
      .then((res) => {
        if (Array.isArray(res?.data?.message)) {
          setLastVisitNo(res?.data?.message);
        } else {
          setLastVisitNo([]);
        }
      })
      .catch((err) => {
        console.log("GetLastVisitNoByCentreID:::", err);
      });
  };

  const checkBarcodeValidationForBlank = (currTableData = []) => {
    let allBlank = true;

    for (const ele of currTableData) {
      ele?.InvestigationSampleType?.forEach((item) => {
        const barcodeNo = item?.barcodeNo?.trim();
        if (barcodeNo && barcodeNo !== "") {
          allBlank = false;
        }
      });
    }
    if (allBlank) {
      toast.error("At least one barcode number must be filled.");
      return true;
    }

    return false;
  };

  const processPLOData = (currTableData) => {
    let data = currTableData.map((ele) => {
      const uniqueSampleTypes = [];
      const barcodeValue = ele?.InvestigationSampleType?.filter((item) => {
        const alreadyExists = uniqueSampleTypes.includes(item?.sampleId);
        if (!alreadyExists) {
          uniqueSampleTypes.push(item?.sampleId);
          return true;
        }
        return false;
      })
        .map(({ sampleId, barcodeNo }) => {
          //  return `${sampleId}#${barcodeNo}`;
          if (BarcodeLogic == 5 || BarcodeLogic == 3) {
            return `${sampleId}#${state?.BarcodeNo}`;
          } else if (BarcodeLogic == 4) {
            return `${sampleId}#${barcodeNo || "SNR"}`;
          } else {
            return `${sampleId}#${barcodeNo}`;
          }
          a;
        })
        .join("~");

      return {
        InvestigationSampleType: ele?.InvestigationSampleType,
        InvestigationDate: ele?.InvestigationDate
          ? moment(ele?.InvestigationDate).format("YYYY-MM-DD")
          : "",
        ModalityId: ele?.ModalityId ? ele?.ModalityId : 0,
        ShiftName: ele?.ShiftName ? ele?.ShiftName : "",
        EndTime: ele?.EndTime ? ele?.EndTime : "",
        StartTime: ele?.StartTime ? ele?.StartTime : "",
        StartEndTimeSlot: ele?.StartEndTimeSlot ? ele?.StartEndTimeSlot : "",
        IsRadiology: ele?.Radiology,
        // Set by SlotBookModal.jsx's handleSelectSlot when a radiology slot
        // was booked as part of this registration — without forwarding it
        // here, the backend has no way to link this PLO row back to the
        // MacRadiology appointment it created, so that appointment's
        // isRegistered stays false even though it's being registered right now.
        RadiologyAppointmentId: ele?.RadiologyAppointmentId || 0,
        IsSampleCollected: ele?.IsSampleCollected,
        IsSampleRequired: ele?.IsSampleRequired,
        Status: ele?.Status,
        IsUrgent: ele?.IsUrgent,
        sampleTypeID: ele?.SampleTypeID,
        SampleTypeName: ele?.SampleName,
        ItemId: ele?.InvestigationID,
        ItemName: ele?.TestName,
        InvestigationID: ele?.InvestigationID,
        InvestigationName: ele?.TestName,
        ReportType: ele?.ReportType,
        IsPackage: ele?.DataType === "Package" ? 1 : 0,
        Rate: Number(ele?.Rate).toFixed(2),
        Amount: Number(ele?.NetAmount).toFixed(2),
        Quantity: Number(ele?.Quantity) || 1,
        PCCDiscAmt: 0,
        PCCDiscPer: 0,
        RateTypeId: state?.RateID,
        // Discount is held per unit in the table; PLO.DiscountAmt is the line
        // total (f_ledgertransaction.DiscountOnTotal = SUM(plo.DiscountAmt)).
        DiscountAmt: (Number(ele?.Discount) || 0) * (Number(ele?.Quantity) || 1),
        DiscountApprovedBy: LTData?.DiscountApprovedBy,
        DiscountReason: LTData?.DiscountReason,
        IsReporting: ele?.IsReporting?.toString(),
        ageInDays: Number(state?.TotalAgeInDays || 0),
        Gender: state?.Gender,
        CentreID: LTData?.CentreID,
        SessionCentreID: useLocalStorage("userData", "get").DefaultCentre,
        TestCentreID: 0,
        SampleBySelf: "1",
        sampleCollectionBy: 0,
        DeliveryDate: ele?.DeliveryDate,
        UrgentDateTime: ele?.UrgentDateTime,
        DepartmentID: ele?.DepartmentID,
        isHistoryReq: 0,
        PackageCode: "",
        PackageName: "",
        TestCode: ele?.TestCode,
        isLabOutSource: ele?.isOutSource,
        LabOutsrcID: Number(ele?.LabOutsrcID) || 0,
        LabOutsrcName: ele?.LabOutsrcName || "",
        PackageOutSourceLabs: ele?.packageOutSourceLabs || [],
        IsCulture: ele?.IsCulture,
        MemberType: ele?.MemberType,
        IsConcern: ele?.IsConcern,
        IsPndtForm: ele?.IsPndtForm,
        SetMRP: ele?.SetMRP,
        IsCovid: ele?.IsCovid,
        UrgentdeleiveryDate: ele?.UrgentdeleiveryDate,
        BarcodeNo: barcodeValue,
        hmis_req_no: ele?.hmis_req_no,
        hmis_req_dno: ele?.hmis_req_dno,
        hmis_lab_code: ele?.hmis_lab_code,
        hmis_test_code: ele?.hmis_test_code,
        hmis_test_name: ele?.hmis_test_name,
        hmis_sample_code: ele?.hmis_sample_code,
        hmis_sample_name: ele?.hmis_sample_name,
        cdac_inv_status: ele?.cdac_inv_status,
        req_type: ele?.req_type,
        DepartmentName: ele?.DepartmentName ?? "",
        departmentPrintOrder: Number(ele?.departmentPrintOrder) ?? 0,
        investigationPrintOrder: Number(ele?.investigationPrintOrder) ?? 0,
        // bypatinetandPanel
        paybypanel: (Number(ele?.paybypanel) || 0) * (Number(ele?.Quantity) || 1),
        paybypatient: (Number(ele?.paybypatient) || 0) * (Number(ele?.Quantity) || 1),
        TypeOfTnx: throughFamilyData ? "Policy Discount"
                 : throughMemberData ? "Membership Discount"
                 : coupon?.field ? "Coupon Discount"
                 : Number(ele?.Discount) > 0 ? "Test Wise Discount"
                 : (Number(disAmt) > 0 || Number(discountPercentage) > 0) ? "Manual Discount"
                 : "",
      };
    });

    // Re-apply active total-level discount so DiscountAmt is not lost
    // when PLO is rebuilt (e.g. barcode change) without a PLO.length change.
    const currentDisAmt = Number(disAmt);
    const currentDiscPct = Number(discountPercentage);

    if (currentDisAmt > 0) {
      const gross =
        Number(LTData?.GrossAmount) ||
        data.reduce((acc, e) => acc + Number(e.Rate) * (Number(e.Quantity) || 1), 0);
      const pct = (currentDisAmt / gross) * 100;
      let runningSum = 0;
      data = data.map((ele, idx) => {
        const qty = Number(ele.Quantity) || 1;
        // discAmt is this line's share of the bill-level discount (whole line),
        // which is exactly what PLO.DiscountAmt stores.
        let discAmt;
        if (data.length === 1) {
          discAmt = currentDisAmt;
        } else if (idx < data.length - 1) {
          discAmt = parseFloat(((Number(ele.Rate) * qty * pct) / 100).toFixed(2));
          runningSum += discAmt;
        } else {
          discAmt = parseFloat((currentDisAmt - runningSum).toFixed(2));
        }
        return {
          ...ele,
          Amount: parseFloat((Number(ele.Rate) * qty - discAmt).toFixed(2)),
          DiscountAmt: discAmt,
        };
      });
    } else if (currentDiscPct > 0) {
      data = data.map((ele) => {
        const lineGross = Number(ele.Rate) * (Number(ele.Quantity) || 1);
        const lineDiscount = parseFloat(
          ((lineGross * currentDiscPct) / 100).toFixed(2),
        );
        return {
          ...ele,
          Amount: (lineGross - lineDiscount).toFixed(2),
          DiscountAmt: lineDiscount.toFixed(2),
        };
      });
    }

    setPLO(data);
    // setPLO() won't be visible in `PLO` state within the same synchronous
    // call — callers that need the freshly-built array right away (e.g.
    // handleSaveSmsEmailSave, right after bookPendingRadiologySlots updates
    // tableData) should use this return value instead of reading `PLO`.
    return data;
  };

  // const payByPanelTotal = tableData?.reduce(
  //   (sum, item) => sum + Number(item?.paybypanel || 0),
  //   0
  // );

  const [payByPatientTotal, setPayByPatientTotal] = useState(0);
  const [payByPanelTotal, setPayByPanelTotal] = useState(0);

  useEffect(() => {
    const Total = tableData?.reduce(
      (sum, item) => sum + Number(item?.paybypatient || 0),
      0,
    );

    const payByPanelTotal = tableData?.reduce(
      (sum, item) => sum + Number(item?.paybypanel || 0),
      0,
    );
    setPayByPanelTotal(Number(payByPanelTotal.toFixed(2)));
    // setPayByPatientTotal(Number(Total.toFixed(2)));
  }, [tableData?.length, discountPercentage]);

  useEffect(() => {
    // setPayByPatientTotal(Number(Number(LTData?.NetAmount).toFixed(2) * CoPaymentPercentage / 100).toFixed(2))

    setPayByPanelTotal(
      Number(
        Number(LTData?.NetAmount).toFixed(2) -
        (Number(LTData?.NetAmount).toFixed(2) * CoPaymentPercentage) / 100,
      ).toFixed(2),
    );
  }, [Number(LTData?.NetAmount).toFixed(2), CoPaymentPercentage]);

  useEffect(() => {
    processPLOData(tableData);
  }, [state?.BarcodeNo, tableData?.length]);
  // dont remove that tabledata?.length

  const checkConcent = () => {
    const check = PLO?.filter((ele) => ele?.IsConcern == "1");

    return check?.length > 0 ? 1 : 0;
  };

  const checkPndt = () => {
    const check = PLO?.filter((ele) => ele?.IsPndtForm == "1");

    return check?.length > 0 ? 1 : 0;
  };
  // const handleChangePloBarCode = (e, sampletypeId) => {
  //   const { value } = e.target;
  //   if (BarcodeLogic === 3) {
  //     const data = tableData.map((ele) => {
  //       return {
  //         ...ele,
  //         BarcodeNo: value,
  //       };
  //     });
  //     setTableData(data);
  //   }
  //   if (BarcodeLogic === 4) {
  //     let flag = true;
  //     for (let i = 0; i < tableData.length; i++) {
  //       if (
  //         tableData[i]?.SampleTypeID !== sampletypeId &&
  //         value !== "" &&
  //         value === tableData[i]?.BarcodeNo
  //       ) {
  //         flag = false;
  //         break;
  //       }
  //     }
  //     if (flag) {
  //       const data = tableData.map((ele) => {
  //         if (ele?.SampleTypeID === sampletypeId) {
  //           return {
  //             ...ele,
  //             BarcodeNo: value,
  //           };
  //         } else {
  //           return ele;
  //         }
  //       });
  //       setTableData(data);
  //     } else {
  //       toast.error("This BarCode is Already Given");
  //     }
  //   }
  // };
  // useEffect(() => {
  //   if (LTData?.CentreID === "" || !LTData?.CentreID || LTData?.CentreID == "")
  //     getAccessCentres(
  //       setCentreData,
  //       LTData,
  //       setLTData,
  //       LTDataIniti,
  //       handleRateType
  //     );
  // }, [LTData?.CentreID]);
  const getVisitType = async (state) => {
    await axiosInstance
      .post("Global/getGlobalData", { Type: "VisitType" })
      .then((res) => {
        let data = res.data.message;
        let Visit = data.map((ele) => {
          return {
            value: ele.FieldID,
            label: ele.FieldDisplay,
          };
        });
        const defaultValue = Visit[0]?.value;

        setLTData((prevData) => ({
          ...prevData,
          VisitType: defaultValue?.toString(),
        }));

        VisitTypeCategory(Number(Visit[0]?.value));
        state(Visit);
      })
      .catch((err) => console.log(err));
  };

  // useEffect(()=>{
  //   setLTData((prevData) => ({
  //         ...prevData,
  //         VisitType: VisitType?.[0]?.value,
  //       }));
  // },[VisitType])

  useEffect(() => {
    // Use safe setter so external centre reloads don't overwrite a user-selected centre
    getAccessCentres(
      setCentreData,
      LTData,
      safeSetLTData,
      LTDataIniti,
      (cid, ct) => useBindRateTypeWorkOrderFlow ? getRateTypeWorkOrder(cid, ct, true) : handleRateType(cid, ct),
      VisitTypeCategory,
      fetchFields,
      callFromRegistration,
      setCenterType,
    );
    // getCentreWorkOrder()
    getCollectionBoy(setCollectionBoy, true);
    getDropDownData("Gender");
    getDropDownData("Title");
    getDropDownData("Identity");
    getDropDownData("PaymentMode");
    getDropDownData("BankName");
    getDropDownData("WardNo");
    getVisitType(setVisitType);
    getBindDiscApproval(setBindDiscApproval);
    getBindDiscReason(setBindDiscReason);
    getSampleSource();
    getPaymentModes("Source", setPatientSource);
    getPaymentModes("PatientType", setPatientType);
    getRequiredAttachment();
    getUploadFileIdentity();
  }, []);

  // Auto-select the first centre on initial load only if user hasn't selected one
  // useEffect(() => {
  //   if (
  //     Array.isArray(CentreData) &&
  //     CentreData.length > 0 &&
  //     (!LTData?.CentreID || LTData?.CentreID === "") &&
  //     !lockedCentre &&
  //     CentreVsRateTypeatWorkOrder == 1
  //   ) {
  //     const first = CentreData?.[0];
  //     setLTData((prev) => ({
  //       ...prev,
  //       CentreID: first?.value,
  //       CentreName: first?.label,
  //     }));
  //     // load rate types for the auto-selected centre (no lock)
  //     getAccessDataRate(
  //       setRateType,
  //       LTData?.CentreID || first?.value,
  //       callFromRegistration,
  //       undefined,
  //       setAllReceipt,
  //       undefined,
  //       LTData?.VisitType,
  //       setisCoPayment,
  //     );
  //   }
  // }, [CentreData]);

  useEffect(() => {
    if (!Array.isArray(CentreData) || CentreData.length === 0) return;

    // ✅ Check if this was triggered by getCentreWorkOrder
    if (pendingCentreRef.current) {
      const formattedCentre = pendingCentreRef.current;
      pendingCentreRef.current = null; // clear after use

      const visitType =
        formattedCentre.VisitType || DefaultVisitTypeatWorkOrder || "Walkin";

      setLTData((prev) => ({
        ...prev,
        CentreID: formattedCentre.value,
        CentreName: formattedCentre.label,
        VisitType: visitType,
        SetMRP: formattedCentre.SetMRP,
        BTB: formattedCentre.BTB,
        SUBPCC: formattedCentre.SUBPCC,
        CentreType: formattedCentre.CentreType || DefaultVisitTypeatWorkOrder || "Walkin",
      }));

      VisitTypeCategory(visitType);
      fetchFields(visitType);
      return; // skip the block below
    }

    // ✅ Original logic for CentreVsRateTypeatWorkOrder == 1
    if (
      (!LTData?.CentreID || LTData?.CentreID === "") &&
      !lockedCentre &&
      CentreVsRateTypeatWorkOrder == 1
    ) {
      const first = CentreData[0];
      setLTData((prev) => ({
        ...prev,
        CentreID: first?.value,
        CentreName: first?.label,
      }));

      getAccessDataRate(
        setRateType,
        LTData?.CentreID || first?.value,
        callFromRegistration,
        undefined,
        setAllReceipt,
        undefined,
        LTData?.VisitType,
        setisCoPayment,
        false,
        isSelectCome
      );
    }
  }, [CentreData]);

  useEffect(() => {
    if (LTData?.CentreID) {
      GetLastVisitNoByCentreID(LTData?.CentreID);
    }
  }, [LTData?.CentreID]);

  const handleRateType = (value, ct, skipAutoSelect = false) => {
    if (value) {
      getAccessDataRate(
        setRateType,
        LTData.CentreID || value,
        callFromRegistration,
        undefined,
        setAllReceipt,
        undefined,
        ct || LTData?.VisitType,
        setisCoPayment,
        false,
        isSelectCome
      ).then((res) => {
        if (
          CentreVsRateTypeatWorkOrder == 1 &&
          !lockedRate &&
          !skipAutoSelect
        ) {
          setState((prev) => ({ ...prev, RateID: res?.[0]?.value }));
        }
        setBarcodeLogic(res?.[0]?.BarcodeLogic);
      });
    }
  };

  useEffect(() => {
    if (RateType?.length > 0) {
      const countryName = RateType[0]?.Country || "India";
      setAutoCompleteCountry(countryName);
      setState((prev) => ({ ...prev, Country: countryName }));
      const trimmed = String(countryName || "").trim();
      if (trimmed) {
        axiosInstance
          .post("CommonHC/SearchCountryData", { countryName: trimmed })
          .then((res) => {
            const list = Array.isArray(res?.data?.message)
              ? res.data.message
              : [];
            const match = list.find(
              (c) =>
                String(c?.CountryName || c?.Country || "").toLowerCase() ===
                trimmed.toLowerCase(),
            );
            const countryId = match?.CountryID ?? match?.ID ?? 1;
            const finalName = match?.CountryName || match?.Country || countryName;
            countrySelectedRef.current = {
              name: finalName,
              id: countryId,
            };
            setState((prev) => ({
              ...prev,
              Country: prev.Country || finalName,
              CountryID: countryId,
            }));
          })
          .catch(() => {});
      }
    }

    if (RateType?.length === 1 && !lockedRate) {
      setState((prev) => ({ ...prev, RateID: RateType[0]?.value }));
      setBarcodeLogic(RateType[0]?.BarcodeLogic);
    }
  }, [RateType, LTData?.CentreID, lockedRate]);

  useEffect(() => {
    if (disAmt !== "" && parseFloat(disAmt) > 0) return;
    // Do not coerce an empty percentage into DiscountOnTotal=0 — that disables
    // the approver UI (EPD-122) via `DiscountOnTotal == 0`.
    if (discountPercentage === "" || discountPercentage == null) return;

    setLTData((prev) => {
      const gross = Number(prev.GrossAmount) || 0;
      const pct = Number(discountPercentage) || 0;
      const totaldiscount = (gross * pct) / 100;
      return {
        ...prev,
        NetAmount: Number((gross - totaldiscount).toFixed(2)),
        // Keep a numeric discount even at 100% (Net 0) so approval stays enabled.
        DiscountOnTotal: totaldiscount > 0 ? Number(totaldiscount.toFixed(2)) : "",
      };
    });
  }, [discountPercentage, disAmt]);

  useEffect(() => {
    if (discountPercentage === "" || discountPercentage == 0) return;
    if (disAmt !== "" && parseFloat(disAmt) > 0) return;
    if (throughMemberData || throughFamilyData) return;
    if (PLO.length > 0) {
      const data = PLO.map((ele) => {
        return {
          ...ele,
          Amount: Number(
            ele.Rate - (ele.Rate * (discountPercentage || 0)) / 100,
          ).toFixed(2),
          DiscountAmt: ((ele.Rate * (discountPercentage || 0)) / 100).toFixed(
            2,
          ),
        };
      });
      setPLO(data);
    }
  }, [discountPercentage, PLO.length]);

  useEffect(() => {
    if (disAmt === "" || disAmt == 0) return;

    setLTData((prev) => ({
      ...prev,
      NetAmount: prev.GrossAmount - Number(disAmt),
      DiscountOnTotal: disAmt,
    }));

    if (throughMemberData || throughFamilyData) return;

    if (PLO.length > 0) {
      const findPercentageDiscount = (disAmt / LTData?.GrossAmount) * 100;
      sumOfPLO = [];
      const data = PLO.map((ele, index) => {
        const finalDiscountamont = handleDiscountLastIndex(
          ele,
          index,
          findPercentageDiscount,
          disAmt,
        );

        return {
          ...ele,
          Amount:
            PLO?.length > 1
              ? ele.Rate - finalDiscountamont
              : ele?.Rate - disAmt,
          DiscountAmt:
            PLO?.length > 1 ? finalDiscountamont : disAmt,
        };
      });
      setPLO(data);
    }
  }, [disAmt, PLO.length, LTData.GrossAmount]);

  useEffect(() => {
    if (disAmt !== "" && disAmt != 0) return;
    if (discountPercentage !== "" && discountPercentage != 0) return;
    if (throughMemberData || throughFamilyData) return;

    setLTData((prev) => ({ ...prev, NetAmount: prev.GrossAmount }));

    if (PLO.length > 0) {
      const data = PLO.map((ele) => {
        if (ele.DiscountAmt != 0 || ele.Amount != ele.Rate) {
          return { ...ele, Amount: ele.Rate, DiscountAmt: 0 };
        }
        return ele;
      });
      if (data.some((ele, idx) => ele !== PLO[idx])) {
        setPLO(data);
      }
    }
  }, [disAmt, discountPercentage]);

  const Match = () => {
    let match = false;
    for (let i = 0; i < tableData.length; i++) {
      if (tableData[i].Discount !== "") {
        match = true;
        break;
      }
    }
    return match;
  };

  const handlePaymentChange = (event) => {
    const { value, selectedIndex } = event?.target;
    const label = event?.target?.children[selectedIndex].text;
    let match = false;
    // if (label === "M-Pesa") {
    //   setIsMpesaSelected(true);
    // } else {
    //   setIsMpesaSelected(false);
    // }
    for (var i = 0; i < RcData.length; i++) {
      if (RcData[i].PaymentMode === label) {
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
          PaymentMode: label,
          PaymentModeID: value,
          CardNo: "",
          CardDate: "",
          BankName: "",
          Amount: "",
          CentreID: LTData?.CentreID,
        },
      ]);
    } else {
      toast.error("Payment Mode is Already Added");
    }
  };

  const handleFilterPayment = (index) => {
    if (RcData.length > 1) {
      const removedAmount = Number(RcData[index]?.Amount || 0);
      const data = RcData.filter((ele, i) => index !== i);
      if (removedAmount > 0) {
        const targetIndex = index < data.length ? index : data.length - 1;
        data[targetIndex] = {
          ...data[targetIndex],
          Amount: Number(data[targetIndex].Amount || 0) + removedAmount,
        };
      }
      setRcData(data);
      toast?.success("Removed Successfully");
    }
  };
  const calculate = (value, index) => {
    let data = [...RcData];
    data[index]["Amount"] = value;
    const sum = data.reduce((a, item) => Number(item.Amount) + a, 0);
    setPaid(Number(sum).toFixed(2));
    return sum;
  };

  useEffect(() => {
    const sum = RcData.reduce((a, item) => Number(item.Amount || 0) + a, 0);
    setPaid(sum);
  }, [RcData]);

  // Collection Charges folds straight into the first payment row's own
  // Amount (rather than just the Paid Amount summary), so RcData — the
  // actual thing submitted on Save — reflects it too. Tracked as a delta off
  // the previously-applied charge so raising/lowering/clearing the field
  // adjusts that row's Amount instead of stacking on top of whatever the
  // user already typed there.
  const prevCollectionChargesRef = useRef(0);
  useEffect(() => {
    const newCharge = Number(LTData?.CollectionCharges) || 0;
    const delta = newCharge - prevCollectionChargesRef.current;
    prevCollectionChargesRef.current = newCharge;
    if (delta === 0) return;
    setRcData((prev) => {
      if (prev.length === 0) return prev;
      const data = [...prev];
      data[0] = {
        ...data[0],
        Amount: Math.max(0, Number(data[0].Amount || 0) + delta),
      };
      return data;
    });
  }, [LTData?.CollectionCharges]);

  // Re-assert the pending prebooking paid amount whenever a cascade
  // (NetAmount / DiscountOnTotal / centre / rate / payment-mode resets)
  // blanks RcData after a prebooking patient is selected.
  // useEffect(() => {
  //   if (pendingPaidRef.current > 0) {
  //     setRcData((prev) => {
  //       const i = prev.length - 1;
  //       if (i < 0) return prev;
  //       if (Number(prev[i]?.Amount || 0) === Number(pendingPaidRef.current)) {
  //         return prev; // already set — stop, prevents infinite loop
  //       }
  //       const updated = [...prev];
  //       updated[i] = { ...updated[i], Amount: pendingPaidRef.current };
  //       return updated;
  //     });
  //   }
  // }, [RcData]);

  useEffect(() => {
    if (pendingPaidRef.current > 0) {
      setRcData((prev) => {
        const i = prev.length - 1;
        if (i < 0) return prev;
        if (Number(prev[i]?.Amount || 0) === Number(pendingPaidRef.current)) {
          return prev; // already set — stop, prevents infinite loop
        }
        const updated = [...prev];
        updated[i] = {
          ...updated[i],
          Amount: pendingPaidRef.current,
          CardNo: pendingTransactionRef.current || updated[i].CardNo,
        };
        return updated;
      });
    }
  }, [RcData]);

  const handleClose2 = () => {
    setShow2(false);
  };

  const handleClose3 = () => {
    setShow3(!show3);
  };

  const handleCloseMarker = () => {
    if (!showMarker) {
      setMarkerData({
        scanDate: new Date(),
        sampleCollection: new Date(),
        gestationalWeek: "",
        gestationalDays: "",
        age: state?.DOB ? new Date(state.DOB) : new Date(),
      });
      setMarkerResults([]);
    }
    setShowMarker(!showMarker);
  };

  const handleBarcodeTypeChange = (e) => {
    const { name, value } = e?.target;
    setType3And5Barcode(value);
    if (value?.length <= BarocdeNoMaxLength) {
      setState((prev) => ({ ...prev, [name]: value }));
    }
  };

  const getDataByMobileNo = (type) => {
    if (type === "Mobile") {
      if (
        DefaultCurrencyName === "KES"
          ? state?.Mobile?.length >= 9
          : state?.Mobile?.length >= 10
      ) {
        axiosInstance
          .post("Booking/getDataByMobileNo", {
            Mobile: state?.Mobile,
            PatientCode: "",
          })
          .then((res) => {
            if (res?.data?.success) {
              const users = res.data.message?.user || [];
              const requestId =
                res?.data?.message?.RequestId ||
                res?.data?.RequestId ||
                users[0]?.RequestId ||
                users[0]?.RequestID ||
                0;
              const updatedUsers = users.map((user) => ({
                ...user,
                throughHmis: 0,
                throughHC: 0,
                RequestId: user?.RequestId || user?.RequestID || requestId,
              }));
              setMobileData(updatedUsers);
              if (requestId) {
                setLTData((prev) => ({
                  ...prev,
                  preRegistrationRequestID: parseInt(requestId),
                }));
              }
              setSuggestionData((ele) => ({
                ...ele,
                testSuggestions: {
                  ...suggestionData.testSuggestions,
                  Total: res?.data?.message?.data,
                },
              }));
            } else {
              setMobileData([]);
              toast.error(res.data?.message || "No Patient Record Found");
            }

            setShow4(true);
          })
          .catch((err) => {
            toast.error(
              err?.response?.data?.message
                ? err?.response?.data?.message
                : "Error Occured",
            );
          });
      } else {
        toast.error(
          `Mobile Number min Length Must Be ${DefaultCurrencyName == "KES" ? 9 : 10}`,
        );
      }
    } else {
      if (state?.PatientCode.length >= 3) {
        axiosInstance
          .post("Booking/getDataByMobileNo", {
            Mobile: "",
            PatientCode: state?.PatientCode,
          })
          .then((res) => {
            if (res?.data?.success) {
              const users = res.data.message?.user || [];
              const requestId =
                res?.data?.message?.RequestId ||
                res?.data?.RequestId ||
                users[0]?.RequestId ||
                users[0]?.RequestID ||
                0;
              const updatedUsers = users.map((user) => ({
                ...user,
                throughHmis: 0,
                RequestId: user?.RequestId || user?.RequestID || requestId,
              }));
              setMobileData(updatedUsers);
              if (requestId) {
                setLTData((prev) => ({
                  ...prev,
                  preRegistrationRequestID: parseInt(requestId),
                }));
              }
              setSuggestionData((ele) => ({
                ...ele,
                testSuggestions: {
                  ...suggestionData.testSuggestions,
                  Total: res?.data?.message?.data,
                },
              }));
            } else {
              setMobileData([]);
              toast.error(res?.data?.message || "No Patient Record Found");
            }
            setShow4(true);
          })
          .catch((err) => {
            toast.error(
              err?.response?.data?.message
                ? err?.response?.data?.message
                : "Error Occured",
            );
          });
      }
    }
  };

  const someMethodWithoutAccessToEvent = (e, id) => {
    if (e.key === " ") {
      document.getElementById(id).focus();
    }
  };

  const handlePatientData = (e, type) => {
    const keypress = [9, 13];
    if (keypress.includes(e.which)) {
      getDataByMobileNo(type);
    }
  };
  const handleHMIS_PatCrNo = (e, type) => {
    const keypress = [9, 13];

    if (keypress.includes(e.which)) {
      if (type == "HMIS_PatCrNo") {
        getDataByHMIS_PatCrNo();
      } else getPreBookingNo();
    }
  };
  const getPreBookingNo = () => {

    setLoad(true);
    axiosInstance
      .post("HomeCollectionSearch/hcdemographicdetails", {
        PreBookingId: Number(state?.PreBookingNo?.trim()),
      })
      .then((res) => {
        if (res?.data?.success) {
          const data = res?.data?.message;
          const finalData = data?.map((ele) => {
            return {
              Title: ele?.Title,
              FirstName: ele?.FirstName,
              LastName: ele?.LastName,
              MiddleName: ele?.MiddleName,
              Mobile: ele?.Mobile,
              Gender: ele?.Gender,
              DOB: calculateDateOfBirth(ele?.Age, ele?.AgeMonth, ele?.AgeDays),
              Age:
                ele?.Age + " Y " + ele?.AgeMonth + " M " + ele?.AgeDays + " D ",
              PatientCode: "",
              Email: ele?.Email,
              Pincode: ele?.pincode,
              HouseNo: ele?.HouseNo,
              City: ele?.City,
              State: ele?.State,
              Country: "",
              StreetName: "",
              IsMask: 0,
              isVIP: 0,
              Locality: ele?.Locality,
              // TestData: ele?.TestCode,
              TestData: (() => {
                try {
                  return typeof ele?.TestCode === "string"
                    ? JSON.parse(ele.TestCode)
                    : ele?.TestCode || [];
                } catch {
                  return [];
                }
              })(),
              PatientGuid: "",
              DocumentUplodedCount: 0,
              MedicalHistoryCount: 0,
              hmis_request_type: "",
              hmis_patCrNo: "",
              hmis_hospital_code: "",
              poct_facility_id: "",
              hmis_episode_code: "",
              hmis_episode_visitno: "",
              throughHmis: 0,
              throughHC: 1,
              RateTypeId: ele?.RateTypeId,
              CentreID: ele?.CentreID,
              HCPaymentMode: ele?.paymentMode,
              HCPaymentModeID: ele?.PaymentModeID,
              ReferedDoctor: ele?.ReferedDoctor || "",
              DoctorID: ele?.DoctorID || "",
              PaidAmount: ele?.PaidAmount || 0,
              BarcodeNo: ele?.BarcodeNo || "",
              TransactionID: ele?.TransactionID || "",
            };
          });
          setShow4(true);
          setMobileData(finalData);
        } else {
          setMobileData([]);
          toast.error(res?.data?.message || "No Patient Record Found");
        }

        setLoad(false);
      })
      .catch((err) => {
        setLoad(false);
        toast.error(
          err?.response?.data?.message
            ? err?.response?.data?.message
            : "Error Occured",
        );
      });
  };

  const hcinvestigationdetails = () => {
    setLoad(true);
    axiosInstance
      .post("HomeCollectionSearch/hcinvestigationdetails", {
        PreBookingId: Number(state?.PreBookingNo),
      })
      .then((res) => {
        if (res?.data?.success) {
          const data = res?.data?.message;
          const finalData = data?.map((ele) => {
            return {
              ...ele,
              Amount: ele?.Rate,
              BarcodeNo: "",
              cdac_inv_status: 0,
              DataType: ele?.datatype,
              deliveryDate: ele?.DATE,
              DeliveryDate: ele?.DATE,
              DepartmentID: ele?.DepartmentId,
              DepartmentName: ele?.Department,
              DiscAmt: ele?.DiscAmt,
              Discount: ele?.DiscAmt,
              FromAge: 0,
              Gender: "Both",
              hmis_lab_code: "",
              hmis_req_dno: "",
              hmis_req_no: "",
              hmis_sample_code: "",
              hmis_sample_name: "",
              hmis_test_code: "",
              hmis_test_name: "",
              hmis_sample_name: "",
              InvestigationID: ele?.Investigation_ID,
              IsConcern: "0",
              IsCovid: 0,
              IsCulture: 0,
              isOutSource: 0,
              IsReporting: ele?.IsReporting,
              IsSampleCollected: "N",
              IsSampleRequired: ele?.IsSampleRequired,
              IsSampleTypeRequired: ele?.IsSampleTypeRequired,
              IsUrgent: 0,
              MemberType: 0,
              NetAmount: Number(ele?.Rate) - Number(ele?.DiscAmt),
              Radiology: 0,
              Rate: ele?.Rate,
              refRateValue: ele?.Rate,
              ReportType: ele?.ReportType,
              req_type: "0",
              RequiredAttachment: "",
              SampleCode: ele?.SampleCode,
              SampleName: ele?.SampleName,
              SampleRemarks: ele?.SampleRemarks,
              SampleTypeID: ele?.SampleTypeID,
              SetMRP: "0",
              Status: 1,
              TestCode: ele?.TestCode,
              TestName: ele?.TestName,
              ToAge: 70000,
              UrgentDateTime: "",
              UrgentdeleiveryDate: ele?.DATE,
              UrgentDeliveryDate: ele?.DATE,
            };
          });
          setTableData(finalData);
        } else {
          setTableData([]);
        }
        setLoad(false);
      })
      .catch((err) => {
        setLoad(false);
        toast.error(
          err?.response?.data?.message
            ? err?.response?.data?.message
            : "Error Occured",
        );
      });
  };
  function calculateDateOfBirth(ageYears, ageMonths, ageDays) {
    const now = new Date();
    const dob = new Date(
      now.getFullYear() - ageYears,
      now.getMonth() - ageMonths,
      now.getDate() - ageDays,
    );
    dob.setHours(0, 0, 0, 0);
    const options = {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    };
    return dob.toLocaleString("en-GB", options).replace(",", "");
  }

  const getDataByHMIS_PatCrNo = () => {
    setLoad(true);
    axiosInstance
      .post("CRMIntegration/HimsToLimsIntregration", {
        hmis_patCrNo: state?.HMIS_PatCrNo,
        hmis_request_type: "1",
      })
      .then((res) => {
        if (res?.data?.success) {
          if (
            res?.data?.message?.data &&
            res?.data?.message?.data?.version === "V2"
          ) {
            const data = res.data.message.data;
            const { years, months, days } = calculateDOB(
              new Date(data?.hmis_patdob),
            );
            const HMIS = {
              Title: data?.hmis_initial,
              FirstName: data?.hmis_patfirstname,
              LastName: data?.hmis_patlastname,
              MiddleName: data?.hmis_patmiddlename,
              Mobile: data?.hmis_patAddMobileNo,
              Gender: data?.hmis_patgender,
              DOB: data?.hmis_patdob,
              Age: years + " Y " + months + " M " + days + " D ",
              PatientCode: "",
              Email: "",
              Pincode: "",
              HouseNo: data?.hmis_patAddHNo,
              City: data?.hmis_patadddistrict,
              State: data?.hmis_pataddstate,
              Country: data?.pataddcountry,
              StreetName: data?.hmis_patAddStreet,
              IsMask: 0,
              isVIP: 0,
              Locality: data?.hmis_patAddLandMarks,
              TestData: data?.hmis_investigation_data,
              PatientGuid: "",
              DocumentUplodedCount: 0,
              MedicalHistoryCount: 0,
              hmis_request_type: "",
              hmis_patCrNo: "",
              hmis_hospital_code: "",
              poct_facility_id: "",
              hmis_episode_code: "",
              hmis_episode_visitno: "",
              throughHmis: 1,
              throughHC: 0,
            };
            setShow4(true);
            setMobileData([HMIS]);
          } else {
            const data = res?.data?.message;
            const { years, months, days } = calculateDOB(
              new Date(data?.hmis_patdob),
            );
            const HMIS = {
              Title: data?.hmis_initial,
              FirstName: data?.hmis_patfirstname,
              LastName: data?.hmis_patlastname,
              MiddleName: data?.hmis_patmiddlename,
              Mobile: data?.hmis_patAddMobileNo,
              Gender: data?.hmis_patgender,
              DOB: data?.hmis_patdob,
              Age: years + " Y " + months + " M " + days + " D ",
              PatientCode: "",
              Email: "",
              Pincode: "",
              HouseNo: data?.hmis_patAddHNo,
              City: data?.hmis_patadddistrict,
              State: data?.hmis_pataddstate,
              Country: data?.pataddcountry,
              StreetName: data?.hmis_patAddStreet,
              IsMask: 0,
              isVIP: 0,
              Locality: data?.hmis_patAddLandMarks,
              TestData: data?.hmis_investigation_data,
              PatientGuid: "",
              DocumentUplodedCount: 0,
              MedicalHistoryCount: 0,
              hmis_request_type: "",
              hmis_patCrNo: "",
              hmis_hospital_code: "",
              poct_facility_id: "",
              hmis_episode_code: "",
              hmis_episode_visitno: "",
              throughHmis: 1,
              throughHC: 0,
            };

            setShow4(true);
            setMobileData([HMIS]);
          }
        } else {
          setMobileData([]);
          toast.error("No Patient Record Found");
        }

        setLoad(false);
      })
      .catch((err) => {
        setLoad(false);
        toast.error(
          err?.response?.data?.message
            ? err?.response?.data?.message
            : "Error Occured",
        );
      });
  };

  const fetchMembershipData = () => {
    if (membershipnum.trim() === "") {
      toast.error("Please enter membership number");
      return;
    }
    axiosInstance
      .post("Booking/GetMemberShipPatientData", {
        MemberShipNo: membershipnum,
        CenterID: LTData?.CentreID,
      })
      .then((res) => {
        if (res?.data?.success && Array.isArray(res.data?.message)) {
          setMemberdata(res?.data.message);
          setShow7(true);
        } else {
          toast.error(res?.data?.message || "No Record Found");
          setShow7(false);
        }
      })
      .catch((err) => {
        toast.error(err?.response?.data?.message || "Something went wrong");
      });
  };

  const getMemberhipdata = (e) => {
    const keypress = [9, 13];
    if (keypress.includes(e.which)) {
      fetchMembershipData();
    }
  };

  const handleClose4 = () => {
    setShow4(false);
    setMobileData([]);
  };

  const Fetch = async (guidNumber, pageName) => {
    const response = await axiosInstance.post("CommonController/GetDocument", {
      Page: pageName,
      Guid: guidNumber,
    });
    return response?.data?.message;
  };

  const getS3url = async (id) => {
    const response = await axiosInstance.post("CommonController/GetFileUrl", {
      Key: id,
    });
    return response?.data?.message;
  };

  const handlePreviewImage = async (guidNumber) => {
    const response = await Fetch(guidNumber, "patientImage");
    if (response.length > 0) {
      const imgURL = await getS3url(response[0]?.awsKey);
      setPatientImg({
        img: imgURL,
        show: false,
      });
    }
  };

  const handleSelctData = (data) => {
    const { years, months, days } = calculateDOB(new Date(data?.DOB));
    handlePreviewImage(data?.PatientGuid);
    setState({
      ...state,
      Title: data.Title,
      FirstName: (data.FirstName).trim(),
      LastName: data?.LastName,
      MiddleName: data?.MiddleName,
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
      hmis_request_type: data?.hmis_request_type ?? "",
      hmis_patCrNo: data?.hmis_patCrNo ?? "",
      hmis_hospital_code: data?.hmis_hospital_code ?? "",
      poct_facility_id: data?.poct_facility_id ?? "",
      hmis_episode_code: data?.hmis_episode_code ?? "",
      hmis_episode_visitno: data?.hmis_episode_visitno ?? "",
      throughHmis: data?.throughHmis,
      throughHC: data?.throughHC,
      BarcodeNo: data?.BarcodeNo || ""
      // RateID: data.RateTypeId
    });
    if (data?.RateTypeId) {
      const rt = RateType.find((r) => r.value == data.RateTypeId);
      if (rt) {
        setState((prev) => ({
          ...prev,
          RateID: rt.value,
          RateTypeName: rt.label,
          ReferenceRate: rt.ReferenceRate || 0,
          RateTypeEmail: rt.RateTypeEmail,
          RateTypePhone: rt.RateTypePhone,
          ClientAddress: rt.ClientAddress,
          HideAmount: rt.HideAmount,
          ProEmployee: rt.ProEmployee,
          AutoEmail: rt.AutoEmail,
        }));
        setBarcodeLogic(Number(rt.BarcodeLogic));
        setisCoPayment(rt.CoPaymentApplicable);
        setisB2B(rt.CentreType || rt.centreType);
        setAllReceipt({
          AutoTRF: rt.AutoTRF || "",
          AutoReceipt: rt.AutoReceipt || "",
          AutoMRPReceipt: rt.AutoMRPReceipt || "",
        });
        setLTData((prev) => ({
          ...prev,
          CentreType: rt.CentreType || rt.centreType || prev.CentreType || "",
          centreType: rt.centreType || rt.CentreType || prev.centreType || "",
        }));
        setLockedRate(true);
      } else {
        setState((prev) => ({ ...prev, RateID: data.RateTypeId }));
      }
    }
    if (data?.ReferedDoctor) {
      setFormData((prev) => ({ ...prev, DoctorName: data.ReferedDoctor }));
    }
    setRateIDForMemerber(data.RateTypeId);

    setLTData((prev) => ({
      ...prev,
      preRegistrationRequestID: parseInt(data?.RequestId || data?.RequestID || data?.preRegistrationRequestID || prev.preRegistrationRequestID || 0),
      CentreID: data.CentreID,
      DoctorName: data.ReferedDoctor,
      DoctorID: data.DoctorID || "",
    }));

    pendingPaidRef.current = Number(data?.PaidAmount) || 0;
    pendingTransactionRef.current = data?.TransactionID || "";
    if (Number(data?.PaidAmount) > 0) {
      setRcData((prev) => {
        const updated = [...prev];
        const lastIndex = updated.length - 1;
        updated[lastIndex] = {
          ...updated[lastIndex],
          Amount: data.PaidAmount,
          CardNo: data.TransactionID,
        };
        return updated;
      });
      setPaid(Number(data.PaidAmount));
    }
    setSecondaryMobile("");
    // hcinvestigationdetails();
    // if (
    //   data?.TestData &&
    //   Array.isArray(data?.TestData) &&
    //   data?.TestData?.length > 0
    // ) {
    //   const slicedData = data?.TestData;
    //   slicedData.forEach((entry) => {
    //     getTableData({
    //       CentreID: state.RateID,
    //       InvestigationID: entry?.investigationId,
    //       hmis_req_no: entry?.hmis_req_no,
    //       hmis_req_dno: entry?.hmis_req_dno,
    //       hmis_lab_code: entry?.hmis_lab_code,
    //       hmis_test_code: entry?.hmis_test_code,
    //       hmis_test_name: entry?.hmis_test_name,
    //       hmis_sample_code: entry?.hmis_sample_code,
    //       hmis_sample_name: entry?.hmis_sample_name,
    //       cdac_inv_status: entry?.cdac_inv_status,
    //       req_type: entry?.req_type,
    //       throughHmis: 1,
    //     });
    //   });
    // } else {
    //   setTableData([]);
    // }

    const codes = (() => {
      try {
        return typeof data?.TestData === "string"
          ? JSON.parse(data.TestData)
          : data?.TestData || [];
      } catch {
        return [];
      }
    })();
    debugger

    // setInvestigationId([]);
    if (Array.isArray(codes) && codes.length > 0) {
      bindPrebookingTests(codes, data?.RateTypeId, {
        gender: data?.Gender,
        ageInDays: calculateTotalNumberOfDays(new Date(data?.DOB)),
      });
    }


    const testDetails =
      suggestionData?.testSuggestions?.Total?.length > 0
        ? suggestionData?.testSuggestions?.Total?.filter((ele) => {
          return ele?.patientcode == data?.PatientCode;
        })
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
    } else {
      setSuggestionData((ele) => ({
        ...ele,
        show: false,
        testSuggestions: {
          ...suggestionData?.testSuggestions,
          data: [],
          show: false,
        },
      }));
    }
    SetPatientGuid(
      isValidGuid(data?.PatientGuid)
        ? data?.PatientGuid
        : (isValidGuid(PatientGuid) ? PatientGuid : guidNumber()),
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

    // Auto-select the payment mode coming from the Home Collection
    // demographic API, but ONLY for KES currency (and not when the
    // rate type forces Credit). Other currencies keep the existing default.
    if (
      DefaultCurrencyName === "KES" &&
      handleRateTypePaymode !== "Credit" &&
      Number(data?.HCPaymentModeID) > 0
    ) {
      const hcPay = {
        PaymentMode: data?.HCPaymentMode,
        PaymentModeID: Number(data?.HCPaymentModeID),
      };
      setHcPaymentMode(hcPay);
      setRcData((prev) => {
        const updated = [...prev];
        const lastIndex = updated.length - 1;
        updated[lastIndex] = {
          ...updated[lastIndex],
          PaymentMode: hcPay.PaymentMode,
          PaymentModeID: hcPay.PaymentModeID,
          CardNo: data?.TransactionID || updated[lastIndex].CardNo,
        };
        return updated;
      });
    } else {
      setHcPaymentMode(null);
    }

    handleClose4();
    handleClose4();
    setThroughMobileData(true);
    setIsMobileSearchSelected(true);
    setMobileData([]);
    if (Number(AllowAdvanceOldPatientSearchAtWorkOrder)) {
      setShowDefault(true);
    }
  };

  const handleSelctDataAdvance = (data) => {
    const { years, months, days } = calculateDOB(new Date(data?.DOB));
    handlePreviewImage(data?.PatientGuid);
    setSecondaryMobile("");
    setState({
      ...state,
      Title: data.Title,
      FirstName: data.FirstName,
      LastName: data?.LastName,
      MiddleName: data?.MiddleName,
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
      hmis_request_type: data?.hmis_request_type ?? "",
      hmis_patCrNo: data?.hmis_patCrNo ?? "",
      hmis_hospital_code: data?.hmis_hospital_code ?? "",
      poct_facility_id: data?.poct_facility_id ?? "",
      hmis_episode_code: data?.hmis_episode_code ?? "",
      hmis_episode_visitno: data?.hmis_episode_visitno ?? "",
      throughHmis: data?.throughHmis,
      throughHC: data?.throughHC,
    });
    setLTData((prev) => ({
      ...prev,
      preRegistrationRequestID: parseInt(data?.RequestId || data?.RequestID || data?.preRegistrationRequestID || 0),
    }));

    if (data?.TestData) {
      const testCodes =
        typeof data.TestData === "string"
          ? JSON.parse(data.TestData)
          : data.TestData;

      bindPrebookingTests(testCodes, data?.RateTypeId);
    }
    // hcinvestigationdetails();
    if (
      data?.TestData &&
      Array.isArray(data?.TestData) &&
      data?.TestData?.length > 0
    ) {
      const slicedData = data?.TestData;
      slicedData.forEach((entry) => {
        getTableData({
          CentreID: state.RateID,
          InvestigationID: entry?.investigationId,
          hmis_req_no: entry?.hmis_req_no,
          hmis_req_dno: entry?.hmis_req_dno,
          hmis_lab_code: entry?.hmis_lab_code,
          hmis_test_code: entry?.hmis_test_code,
          hmis_test_name: entry?.hmis_test_name,
          hmis_sample_code: entry?.hmis_sample_code,
          hmis_sample_name: entry?.hmis_sample_name,
          cdac_inv_status: entry?.cdac_inv_status,
          req_type: entry?.req_type,
        });
      });
    } else {
      setTableData([]);
    }
    const testDetails =
      suggestionData?.testSuggestions?.Total?.length > 0
        ? suggestionData?.testSuggestions?.Total?.filter((ele) => {
          return ele?.patientcode == data?.PatientCode;
        })
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
    } else {
      setSuggestionData((ele) => ({
        ...ele,
        show: false,
        testSuggestions: {
          ...suggestionData?.testSuggestions,
          data: [],
          show: false,
        },
      }));
    }
    SetPatientGuid(
      isValidGuid(data?.PatientGuid)
        ? data?.PatientGuid
        : (isValidGuid(PatientGuid) ? PatientGuid : guidNumber()),
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
    // Auto-select the Home Collection payment mode for KES only
    // (kept in sync with handleSelctData).
    if (
      DefaultCurrencyName === "KES" &&
      handleRateTypePaymode !== "Credit" &&
      Number(data?.HCPaymentModeID) > 0
    ) {
      const hcPay = {
        PaymentMode: data?.HCPaymentMode,
        PaymentModeID: Number(data?.HCPaymentModeID),
      };
      setHcPaymentMode(hcPay);
      setRcData((prev) => {
        const updated = [...prev];
        const lastIndex = updated.length - 1;
        updated[lastIndex] = {
          ...updated[lastIndex],
          PaymentMode: hcPay.PaymentMode,
          PaymentModeID: hcPay.PaymentModeID,
        };
        return updated;
      });
    } else {
      setHcPaymentMode(null);
    }

    handleClose4();
    handleClose4();
    setThroughMobileData(true);
    setIsMobileSearchSelected(true);
    setMobileData([]);
    // if (Number(AllowAdvanceOldPatientSearchAtWorkOrder)) {
    //   setShowDefault(!showDefault);
    // }
  };

  const handleFamilyUHIDKeyDown = (e) => {
    if (e.which === 13) {
      fetchFamilyMemberData();
    }
  };

  const fetchFamilyMemberData = async () => {
    if (!fuhid) {
      notify("Please enter Employee ID", "warn");
      return;
    }
    setLoad(true);
    try {
      const res = await axiosInstance.post(
        "Employee/GetFamilyMemberPolicyPatientData",
        {
          fuhid: fuhid,
          centerID: LTData?.CentreID,
        },
      );
      if (res.data?.success && Array.isArray(res.data?.message)) {
        setFamilyMemberData(res.data.message);
        setShowFamilyDialog(true);
      } else {
        notify(res.data.message || "No data found", "warn");
      }
    } catch (err) {
      console.error(err);
      notify("Error fetching family member data", "error");
    } finally {
      setLoad(false);
    }
  };

  const handlePolicyPrescriptionToggle = async (checked) => {
    const next = checked ? 1 : 0;
    setIsPolicyPrescription(next);
    if (!throughFamilyData || !tableData?.length) {
      return;
    }
    let applied = 0;
    const updated = [];
    for (const row of tableData) {
      try {
        const res = await axiosInstance.post("TestData/BindSingleTestData", {
          CopaymentRatetype: Number(state?.RateID) || 0,
          InvestigationID: row.InvestigationID,
          ReferenceRate: state?.ReferenceRate || 0,
          CentreID: row.CentreID || state?.RateID,
          ActualRateTypeID: state?.RateID,
          AllowZeroRateBooking: selectedRateType?.AllowZeroRateBooking || 0,
          CentreIdNew: LTData?.CentreID,
          policyId: Number(familyMemberDetails?.PolicyID) || 0,
          FamlilyMemberEmployeeID:
            Number(familyMemberDetails?.FamlilyMemberEmployeeID || familyMemberDetails?.EmployeeID) || 0,
          FamilyMemberRelationType:
            familyMemberDetails?.RelationType || familyMemberDetails?.Relation || "",
          FamilyMemberIsPrimary: Number(familyMemberDetails?.FamilyMemberIsPrimary) || 0,
          IsPolicyPrescription: next,
          AlreadyAppliedPolicyDiscount: applied,
          PatientCode: familyMemberDetails?.PatientCode || state?.PatientCode,
          MembershipCardID: 0,
          SetMRP: LTData?.SetMRP,
        });
        const testData = res?.data?.message?.[0];
        if (res?.data?.success && testData) {
          const disc = Number(testData.DiscAmt) || 0;
          applied += disc;
          updated.push({
            ...row,
            Discount: disc === 0 ? "" : disc,
            Rate: Number(testData.Rate).toFixed(2),
            NetAmount: Number(testData.Amount).toFixed(2),
          });
        } else {
          updated.push(row);
        }
      } catch {
        updated.push(row);
      }
    }
    setTableData(updated);
  };

  const handleSelectFamilyMember = (data) => {
    const { years, months, days } = calculateDOB(new Date(data?.DOB));
    handlePreviewImage(data?.PatientGuid);
    setState({
      ...state,
      Title: data?.Title,
      FirstName: data?.Name,
      LastName: data?.LastName,
      MiddleName: data?.MiddleName,
      Mobile: data?.MobileNo,
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
      HouseNo: data?.Address,
      City: data?.City,
      State: data?.State,
      Country: data?.Country,
      StreetName: data?.StreetName,
      IsMask: data?.IsMask || 0,
      isVIP: data?.IsVIP || 0,
      Locality: data?.Locality,
      TotalAgeInDays:
        data?.TotalAgeInDays || calculateTotalNumberOfDays(new Date(data?.DOB)),
    });
    setThroughFamilyData(true);
    setFamilyMemberDetails(data);
    setShowFamilyDialog(false);
  };

  const bindPrebookingTests = async (codes, rateTypeId, patientInfo = {}) => {
    try {
      const rateID = rateTypeId || state?.RateID || rateIDForMemerber;
      for (let code of codes) {
        const res = await axiosInstance.post("TestData/BindBillingTestData", {
          TestName: code,
          CentreID: rateID == "" || rateID == null ? rateIDForMemerber : rateID,
          SearchBy: "TestCode",
          ActualRateTypeID: rateID,
          AllowZeroRateBooking: selectedRateType?.AllowZeroRateBooking || 0,
        });

        if (res?.data?.success && res?.data?.message?.length > 0) {
          const test = {
            ...res.data.message[0], _rateTypeOverride: rateID,
            _patientGender: patientInfo.gender,
            _patientAgeInDays: patientInfo.ageInDays,
            _fromPrebooking: true,
          };
          handleListSearch(test, "TestName");
        }
      }
    } catch (err) {
      console.log(err);
    }
  };

  const bindGwtTests = async (codes) => {
    try {
      for (let code of codes) {
        const res = await axiosInstance.post("TestData/BindBillingTestData", {
          TestName: code,
          CentreID: state?.RateID == "" || state?.RateID == null ? rateIDForMemerber : state?.RateID,
          SearchBy: "TestCode",
          ActualRateTypeID: state?.RateID,
          AllowZeroRateBooking: selectedRateType?.AllowZeroRateBooking || 0,
        });
        if (res?.data?.success && res?.data?.message?.length > 0) {
          handleListSearch(res.data.message[0], "TestName");
        }
      }
    } catch (err) {
      console.log(err);
    }
  };

  const handleGetProcedureRequests = () => {
    if (!state?.RateID) {
      toast.error(t("Please select Rate Type first"));
      return;
    }
    const trimmed = accessionNo?.trim();
    if (!trimmed) {
      toast.error(t("Please enter Accession No"));
      return;
    }
    setLoad(true);
    axiosInstance
      .post(`Gwt/GetProcedureRequests?requisition=${trimmed}`)
      .then((res) => {
        if (res?.data?.success) {
          const fullResponse = res.data.message;
          setGwtData(fullResponse);
          const { patientDetails, tests } = fullResponse;
          const gender = patientDetails?.gender;
          const title = gender === "M" ? "Mr." : "Miss.";
          const genderFull = gender === "M" ? "Male" : "Female";
          const dob = new Date(patientDetails?.dateOfBirth);
          const { years, months, days } = calculateDOB(dob);
          setState((prev) => ({
            ...prev,
            FirstName: patientDetails?.name || "",
            Title: title,
            Gender: genderFull,
            DOB: dob,
            AgeYear: years,
            AgeMonth: months,
            AgeDays: days,
            Mobile: patientDetails?.mobile || "",
            TotalAgeInDays: calculateTotalNumberOfDays(dob),
          }));
          const dateForFields = handleDateFunction({ year: years, month: months, days });
          setDateData({
            AgeYear: dateForFields?.AgeYear,
            AgeMonth: dateForFields?.AgeMonth,
            AgeDays: dateForFields?.AgeDays,
          });
          if (patientDetails?.conditions?.length > 0) {
            setGwtConditions(patientDetails.conditions);
          }
          const validTests = (tests || []).filter((t) => t.isValid);
          const invalidTests = (tests || []).filter((t) => !t.isValid);
          setGwtInvalidTests(invalidTests);
          if (validTests.length > 0) {
            bindGwtTests(validTests.map((t) => t.testCode));
          }
          const resolvedDoctorId = fullResponse?.doctorReferalID || fullResponse?.DoctorReferalID;
          const resolvedDoctorName =
            fullResponse?.doctorName ||
            fullResponse?.DoctorName ||
            fullResponse?.requester?.agent?.display;
          if (resolvedDoctorId) {
            handleListSearch(
              {
                DoctorReferalID: resolvedDoctorId,
                Name: resolvedDoctorName,
              },
              "DoctorName"
            );
          } else if (resolvedDoctorName) {
            setFormData((prev) => ({ ...prev, DoctorName: resolvedDoctorName }));
          }
          setGwtAccessionLocked(true);
        } else {
          toast.error(res?.data?.message || t("No data found"));
        }
      })
      .catch((err) => {
        toast.error(err?.response?.data?.message);
      })
      .finally(() => setLoad(false));
  };

  const handleSelectedData = (data) => {
    // Use API-provided age values directly to avoid 2-digit year parsing issues
    // (e.g., "14-May-46" is parsed as year 2046 by JS, giving negative age)
    const years = data?.AgeYear ?? 0;
    const months = data?.AgeMonth ?? 0;
    const days = data?.AgeDays ?? 0;

    // Correct 2-digit year DOB: if parsed date is in the future, subtract 100 years
    const rawDOB = new Date(data?.DOB);
    const dob =
      rawDOB.getFullYear() > new Date().getFullYear()
        ? new Date(rawDOB.setFullYear(rawDOB.getFullYear() - 100))
        : rawDOB;

    setState({
      ...state,
      Title: data.Title,
      FirstName: data.FirstName,
      LastName: data?.LastName,
      MiddleName: data?.MiddleName,
      Gender: data?.Gender,
      DOB: dob,
      Age: data?.Age,
      PatientCode: data?.PatientCode,
      Email: data?.Email == null ? "" : data?.Email,
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
      Mobile: data?.Mobile,
      TotalAgeInDays: calculateTotalNumberOfDays(dob),
    });
    setSecondaryMobile("");
    setMemberdetails(data);
    setMemberdata([]);
    setThroughmemberdata(true);
    handleclosemembershipmodal();
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

  const getReceipt = async (id, fullyPaid) => {
    if (Number(allReceipt.AutoReceipt) !== 1) return;
    await axiosReport
      .post(
        "getReceipt",
        { LedgerTransactionIDHash: id },
        { responseType: "blob" },
      )
      .then((res) => {
        const blob = new Blob([res.data], { type: "application/pdf" });
        const url = window.URL.createObjectURL(blob);
        window.open(url, "_blank");
        if (fullyPaid == 1) getReceiptFullyPaid(id);
      })
      .catch((err) => {
        toast.error(
          err?.data?.response?.message
            ? err?.data?.response?.message
            : "Error Occured",
        );
      });
  };

  const getReceiptFullyPaid = async (id) => {
    if (Number(allReceipt.AutoMRPReceipt) !== 1) return;
    await axiosInstance
      .post(
        "reports/v1/getReceiptFullyPaid",
        {
          LedgerTransactionIDHash: id,
        },
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

  const handleAcknowledgementSlip = (labBarcodeData, ledgertransactionID) => {
    if (labBarcodeData && labBarcodeData.length > 0) {
      labBarcodeData.forEach((barcodeObj) => {
        if (barcodeObj?.IsAcknowledgementSlipRequired === 1) {
          const payload = {
            LedgerTransactionNo: ledgertransactionID,
            BarcodeNo: barcodeObj?.labbarcode,
          };

          axiosInstance
            .post("SC/getLabBarcode", payload)
            .then((res) => {
              if (res?.data?.success && res?.data?.message) {
                window.open(res?.data?.message);
              } else {
                toast.error(
                  res?.data?.message
                    ? res?.data?.message
                    : "Something Went wrong",
                );
              }
            })
            .catch((err) => {
              toast.error(
                err?.data?.response?.message
                  ? err?.data?.response?.message
                  : "Error Occured",
              );
            });
        }
      });
    }
  };

  const getConcern = (id) => {
    axiosInstance
      .post("ConcentFormMaster/generateConcentForm", {
        LedgerTransactionIDHash: id,
      }, { responseType: "blob" })
      .then(async (res) => {
        const blob = res?.data;
        if (!blob || blob.size === 0) {
          toast.error(t("No data found"));
          return;
        }
        const contentType = res.headers?.["content-type"] || "";
        if (contentType.includes("application/json")) {
          const text = await blob.text();
          const json = JSON.parse(text);
          console.error(json?.message || t("No data found"));
          return;
        }

        const pdfBlob = new Blob([blob], { type: "application/pdf" });
        const fileUrl = window.URL.createObjectURL(pdfBlob);

        window.open(fileUrl, "_blank");

        setTimeout(() => window.URL.revokeObjectURL(fileUrl), 10000);
      })
      .catch((error) => {
        toast.error(error?.response?.data?.message);
      });
  };
  const getPndtForm = (id) => {
    axiosInstance
      .post("PndtFormMaster/generatPndtForm", {
        LedgerTransactionIDHash: id,
      })
      .then((res) => {
        window.open(res?.data?.url, "_blank");
      })
      .catch((error) => {
        toast.error(error?.response?.data?.message);
      });
  };

  const getReceiptTRF = async (id, DepartmentSlip) => {
    if (Number(allReceipt?.AutoTRF) === 1) {
      await axiosReport
        .post(
          "getTRF",
          { LedgerTransactionIDHash: id },
          { responseType: "blob" },
        )
        .then((res) => {
          // window.open(res?.data?.url, "_blank");
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
    }
    if (DepartmentSlip == 1) {
      axiosReport
        .post("getDepartment", {
          LedgerTransactionIDHash: id,
        })
        .then((res) => {
          window.open(res?.data?.url, "_blank");
        })
        .catch((err) => {
          toast.error(
            err?.data?.response?.message
              ? err?.data?.response?.message
              : "Error Occured",
          );
        });
    }
  };

  const checkPaymentStatus = async (order_id, pLink) => {
    try {
      const { data } = await axiosInstance.post("RazorPay/paymentstatus", {
        order_id: order_id,
        pLink: pLink,
      });

      const isPaymentConfirmed = Boolean(
        data?.success === true &&
          (data?.status === "success" || data?.status === "paid" || data?.status === "captured")
      );

      if (isPaymentConfirmed) {
        toast.success("Payment successful!");
        return true;
      }

      toast.error(
        data?.message || "Payment status is still pending. Please try again.",
      );
      return false;
    } catch (error) {
      toast.error(error?.message || "Error checking payment status.");
      return false;
    }
  };

  const stopPaymentLoader = () => {
    setIsRazorPayOpen(false);
    setIsSubmit((prev) => ({ ...prev, isLoading: false }));
  };

  const getPaymentLink = () => {
    axiosInstance
      .post("RazorPay/createPaymentLink", {
        amount: getPaymentModeAmount[0]?.Amount,
        receipt: guidNumber(),
        mobile: state?.Mobile,
        email: state?.Email,
      })
      .then((res) => {
        const paymentLink = res?.data?.messageInfo?.paymentLink;
        const paymentLinkId = paymentLink?.id;
        const orderId = paymentLink?.notes?.order_id;

        if (res?.data?.success && paymentLinkId && orderId) {
          let timeoutId;
          let intervalId;
          let countdownIntervalId;
          let remainingTime = 180;
          const formatTime = (time) => {
            const minutes = Math.floor(time / 60);
            const seconds = time % 60;
            return `${minutes} : ${seconds < 10 ? "0" : ""}${seconds}`;
          };
          const toastId = toast.info(
            `Please go to the payment link sent to your number ${state?.Mobile
            } and complete the payment. Time remaining : ${formatTime(
              remainingTime,
            )} .`,
            {
              autoClose: false,
              closeOnClick: false,
            },
          );

          countdownIntervalId = setInterval(() => {
            remainingTime -= 1;
            toast.update(toastId, {
              render: `Please go to the payment link sent to your number ${state?.Mobile
                } and complete the payment. Time remaining : ${formatTime(
                  remainingTime,
                )} .`,
            });

            if (remainingTime <= 0) {
              clearInterval(countdownIntervalId);
            }
          }, 1000);

          intervalId = setInterval(async () => {
            const success = await checkPaymentStatus(orderId, paymentLinkId);
            if (success) {
              clearInterval(intervalId);
              clearTimeout(timeoutId);
              clearInterval(countdownIntervalId);
              toast.dismiss();
              setIsRazorPayOpen(false);
              try {
                handleSubmitFinalBooking(orderId);
              } catch (err) {
                console.error(err);
                setIsSubmit((prev) => ({ ...prev, isLoading: false }));
                toast.error("Payment succeeded but registration failed. Please try again.");
              }
            }
          }, 2000);

          timeoutId = setTimeout(() => {
            setIsRazorPayOpen(false);
            clearInterval(intervalId);
            clearInterval(countdownIntervalId);
            toast.dismiss();
            toast.error("Payment status check timeout.");
            setIsSubmit((prev) => ({ ...prev, isLoading: false }));
          }, 180000);
        } else {
          stopPaymentLoader();
          const errMessage = Array.isArray(res?.data?.message)
            ? res?.data?.message[0]
            : res?.data?.message;
          toast.error(errMessage || "Failed to create payment link");
        }
      })
      .catch((err) => {
        stopPaymentLoader();
        toast.error(
          err?.response?.data?.message
            ? err?.response?.data?.message
            : "Error Occurred",
        );
      });
  };

  const IsOnlinePayment = () => {
    axiosInstance
      .get("RazorPay/Otherpayment")
      .then((res) => {
        if (res?.data?.message?.payment_capture == 1) {
          setIsRazorPayOpen(true);
          getPaymentLink();
        } else {
          setIsSubmit({
            type: "Success",
            isLoading: true,
          });
          handleSubmitFinalBooking();
        }
      })
      .catch((err) => {
        stopPaymentLoader();
        toast.error(
          err?.response?.data?.message
            ? err?.response?.data?.message
            : "Error Occur",
        );
      });
  };

  const handleSubmitApi = (data) => {
    // Intercept if there are hidden required fields that are empty
    // We pass current modal values if they exist, to avoid state lag
    const hiddenFields = getHiddenRequiredFields();
    if (hiddenFields.length > 0) {
      const currentLocalValues = hiddenRequiredModal.localValues || {};
      const localValues = { ...currentLocalValues };

      hiddenFields.forEach((f) => {
        if (localValues[f.controlId] === undefined) {
          localValues[f.controlId] =
            state[f.controlId] || LTData[f.controlId] || "";
        }
      });

      setHiddenRequiredModal({
        show: true,
        fields: hiddenFields,
        pendingData: data,
        localValues,
        errors: [],
      });
      setIsSubmit((prev) => ({ ...prev, isLoading: false }));
      return;
    }

    if (getPaymentModeAmount?.length > 0) {
      IsOnlinePayment();
    } else {
      setIsSubmit({
        type: "Success",
        isLoading: true,
      });
      handleSubmitFinalBooking(data);
    }
  };
  const CompanyCode = useLocalStorage("userData", "get")?.CompanyCode;
  const IsCDAC = useLocalStorage("userData", "get")?.IsCDAC;
  const AutoFillPaidAmount = useLocalStorage(
    "userData",
    "get",
  )?.AutoFillPaidAmount;


  const isMobileMandatory = controllerDynamicList?.some(
    (item) =>
      item?.ControlDisplayID === "Mobile" && item?.IsMandatory === 1
  );

  console.log(isMobileMandatory, "isMobileMandatory")

  const handleSubmit = (e) => {
    e?.preventDefault();

    // Block registration if the selected rate type has forcely booking lock enabled
    if (isBookingLocked) {
      toast.error(
        `${bookingLockedRateTypeName || state?.RateTypeName || "Selected rate type"} has been locked for this booking. Registration cannot be done.`
      );
      return;
    }

    if (
      CenterType?.trim()?.toUpperCase() === "INSURANCE" &&
      DefaultCurrencyName === "KES"
    ) {
      if (!LTData?.PolicyNo?.trim()) {
        toast.error("Please enter policy number");
        return;
      }
    }

    // if(state?.Title === "" ){
    //   toast.error("Please select Title");
    //   return;
    // }
    if (DefaultCurrencyName === "KES") {
      if (LTData?.DoctorID == "0" || LTData?.DoctorID == "") {
        toast.error("please select Referred Doctor")
        return
      }

      if (LTData?.DoctorID == 1 && !LTData?.ReferDoctorRemarks) {
        toast.error("please fill the ReferDoctor Remarks")
        return
      }

      const hasInvalidMpesa = RcData?.some(
        (item) =>
          (Number(item?.PaymentModeID) === 1008 || Number(item?.PaymentModeID) === 1084) &&
          Number(item?.Amount) > 0 &&
          (!item?.CardNo || item?.CardNo.trim() === "")
      );

      if (hasInvalidMpesa) {
        toast.error("Please provide the M-pesa reference number");
        return;
      }

      if (BarcodeLogic == 3) {
        const barcodeLength = state?.BarcodeNo?.trim()?.length || 0 || "";
        if (barcodeLength < 9) {
          notify("Barcode number must be at least 9 digits.", "warn");
          setIsSubmit((prev) => ({ ...prev, isLoading: false }));
          return;
        }
      }
      // if (isB2B === "B2B") {
      //   if (!LTData?.LPO) {
      //     toast.error("Please provide LPO");
      //     return;
      //   }
      const totalPaid = parseFloat(
        RcData.reduce(
          (sum, item) => sum + Number(item?.Amount || 0),
          0
        ).toFixed(2)
      );

      const patientTotal = parseFloat(
        Number(payByPatientTotal || 0).toFixed(2)
      );

      const payByPanelTotals = parseFloat(
        Number(payByPanelTotal || 0).toFixed(2)
      );

      if (isCoPayment == 1) {
        if ((totalPaid > 0) && totalPaid !== patientTotal) {
          toast.error("Paid Amount and PaybyPatient should be same");
          return;
        }
      }

      if (isCoPayment == 0) {
        if (totalPaid > 0 && totalPaid !== payByPanelTotals) {
          toast.error("Paid Amount and PaybyPatient should be same");
          return;
        }
      }
      if (
        selectedCentreType?.CentreType == "INSURANCE" &&
        !UploadDoumentType?.includes("InsuranceDocument")
      ) {
        toast.error("Insurance Document is not uploaded");
        return;
      }

    }

    if (!validateDynamicFields()) {
      return;
    }

    if (DefaultCurrencyName !== "KES" && !throughMemberData && !throughFamilyData) {
      const hasTestWiseDiscount = tableData?.some((t) => Number(t.Discount) > 0);
      const hasAnyDiscount =
        Number(discountPercentage) > 0 || Number(disAmt) > 0 || hasTestWiseDiscount;

      if (
        hasAnyDiscount &&
        (!LTData?.DiscountReason || LTData?.DiscountReason?.trim() === "")
      ) {
        toast.error("Please Select Discount Reason");
        return;
      }

      if (
        hasAnyDiscount &&
        LTData?.DiscountType === 1 &&
        (!LTData?.DiscountApprovedBy || LTData?.DiscountApprovedBy?.trim() === "")
      ) {
        toast.error("Please Select Discount Approved By");
        return;
      }
    }

    if (DefaultCurrencyName == "KES") {
      if (state.Mobile && state.Mobile.length > 0 && state.Mobile.length < 9) {
        toast.error("Invalid Mobile number");
        return;
      }
    }

    const hasZeroAmount =
      userdata?.CompanyID === 1004 &&
      Number(LTData?.NetAmount) > 0 &&
      handleRateTypePaymode === "Cash" &&
      RcData?.some((item) => item?.PaymentMode === "Cash" && !Number(item?.Amount));
    if (hasZeroAmount) {
      toast.error("Paid Amount is mandatory. Please enter amount for all selected payment modes.");
      return;
    }

    setIsSubmit({ type: "Success", isLoading: true });

    handleSubmitApi();
  };

  useEffect(() => {
    if (tableData.length === 0) {
      setPaid(0);
    }
  }, [tableData]);

  const handleTimeChange = (e) => {
    const { name, value } = e.target;
    if (value === "") {
      setTime({ ...time, [name]: 0 });
      return;
    }

    if (name === "Hour") {
      let hour = parseInt(value.replace(/\D/g, ""));
      if (isNaN(hour) || hour < 0 || hour > 23) return;
      const registrationDate = new Date(LTData?.RegistrationDate);
      registrationDate.setHours(value);
      registrationDate.setMinutes(time?.Minute);
      registrationDate.setSeconds(time?.Second);
      setLTData({ ...LTData, RegistrationDate: registrationDate });
      setTime({ ...time, [name]: hour });
    } else if (name === "Minute" || name === "Second") {
      let minuteOrSecond = parseInt(value.replace(/\D/g, ""));
      if (isNaN(minuteOrSecond) || minuteOrSecond < 0 || minuteOrSecond > 59)
        return;
      if (name == "Minute") {
        const registrationDate = new Date(LTData?.RegistrationDate);
        registrationDate.setHours(time?.Hour);
        registrationDate.setMinutes(value);
        registrationDate.setSeconds(time?.Second);
        setLTData({ ...LTData, RegistrationDate: registrationDate });
      }
      if (name == "Second") {
        const registrationDate = new Date(LTData?.RegistrationDate);
        registrationDate.setHours(time?.Hour);
        registrationDate.setMinutes(time?.Minute);
        registrationDate.setSeconds(value);
        setLTData({ ...LTData, RegistrationDate: registrationDate });
      }

      setTime({ ...time, [name]: minuteOrSecond });
    } else {
      setTime({ ...time, [name]: value });
    }
  };

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


  useEffect(() => {
    if (tableData?.length === 0) {
      setdisAmt("");
      setDiscountPercentage("");
    }
  }, [tableData]);

  useEffect(() => {
    setTableData([]);

    // setSuggestionData({
    //   show: false,
    //   viewTestModal: false,
    //   viewTestModalId: "",
    //   testSuggestions: {
    //     data: [],
    //     show: false,
    //     Total: [],
    //   },
    //   packageSuggestions: {
    //     data: [],
    //     show: false,
    //   },
    //   daySuggestions: {
    //     data: [],
    //     show: false,
    //   },
    // });
    setThroughMobileData(false);
    {
      const effectivePayment = getEffectivePayment();
      setRcData([
        {
          PayBy: "Patient",
          ReceiptNo: "",
          ledgerNoCr: "",
          RateTypeId: state?.RateID,
          PaymentMode: effectivePayment.PaymentMode,
          PaymentModeID: effectivePayment.PaymentModeID,
          BankName: "",
          CardNo: "",
          CardDate: "",
          Amount: "",
          CentreID: LTData?.CentreID,
        },
      ]);
    }
  }, [LTData?.CentreID, state?.RateID, state?.Gender, hcPaymentMode]);

  const handleChangeRTCData = (e, index) => {
    const { name, value } = e.target;
    if (name === "CardNo") {
      pendingTransactionRef.current = "";
    }
    const data = [...RcData];
    data[index][name] = value;
    setRcData(data);
  };

  const handleUploadCount = (
    name,
    value,
    secondName,
    medicalName,
    medicalValue,
    MedicalSName,
  ) => {
    setLTData({
      ...LTData,
      [name]: value,
      [secondName]: value === 0 ? 0 : 1,
      [medicalName]: medicalValue,
      [MedicalSName]: medicalValue === 0 ? 0 : 1,
    });
  };

  const handleMedicalCount = (name, value, secondName) => {
    setLTData({
      ...LTData,
      [name]: value,
      [secondName]: value === 0 ? 0 : 1,
    });
  };

  const getDocumentType = (data) => {
    setUploadDoumentType(data);
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

  const valiateProofID = () => {
    if (!LTData?.PatientIDProof) return true;
    const proofNo = LTData?.PatientIDProofNo || "";
    if (isAadhaarIdType(LTData.PatientIDProof)) {
      return validateAadhaarNumber(proofNo).isValid;
    }
    if (proofNo.length < 5) {
      return false;
    }
    return true;
  };

  const findMRPAndRateEstimate = () => {
    let MRP = 0;
    let Rate = 0;
    for (let i = 0; i < tableData?.length; i++) {
      MRP = MRP + Number(tableData[i]["Rate"]);
      Rate = Rate + Number(tableData[i]["NetAmount"]);
    }
    return { MRP, Rate };
  };

  const filterUnPaidRcData = () => {
    let paymentFlag = false;
    if (throughMemberData) {
      return false;
    }
    if ((handleRateTypePaymode || "")?.trim()?.toLowerCase() !== "credit") {
      for (let i = 0; i < RcData.length; i++) {
        if (RcData[i]["Amount"] === "") {
          paymentFlag = true;
          break;
        }
      }
    }
    return paymentFlag;
  };

  const CheckageTest = (
    gender,
    ToAge,
    FromAge,
    patientGender,
    patientAgeInDays,
  ) => {
    let genderCheck = false;
    let ageCheck = true;
    let message = "";

    // Use passed values if available, otherwise fallback to component state
    const pGender = patientGender || state?.Gender;
    const pAgeDays =
      patientAgeInDays !== undefined ? patientAgeInDays : state?.TotalAgeInDays;

    genderCheck = [pGender, "Both"].includes(gender) ? true : false;

    if (pAgeDays > ToAge) {
      ageCheck = false;
      message = "Your age is greater than this test maximum age";
    }

    if (pAgeDays < FromAge) {
      ageCheck = false;
      message = "Your age is Less than this test Minimum age";
    }

    return {
      genderCheck: genderCheck,
      ageCheck: ageCheck,
      message: message,
    };
  };

  const handleLockRegistation = useMemo(() => {
    const data = RateType.find((ele) => ele?.value == state?.RateID);
    return [0, null].includes(data?.LockRegistration) ? false : true;
  }, [state?.RateID, RateType]);

  const checkRateTypePayMode = useMemo(() => {
    const data = RateType.find((ele) => ele?.value == state?.RateID);
    return data?.PayMode;
  }, [state?.RateID, RateType]);

  const handleCloseCoupon = () => {
    setShowCoupon({
      ...showCoupon,
      ShowCouponDetail: false,
    });
  };

  const handleclosemembershipmodal = () => {
    setShow7(false);
  };

  const handleCloseBindTestCouponShowModal = () => {
    setShowCoupon({
      ...showCoupon,
      BindTestCouponShow: false,
    });
  };

  const handleSelectTestData = (ele) => {
    const data = {
      InvestigationID: ele?.TestId,
      CentreID: state?.RateID,
      Discount: Number(ele?.DiscountPercentage),
    };

    getTableData(data, "Coupon");
  };

  // const handleCouponValidate = () => {
  //   const generatedError = CouponValidateSchema(
  //     state,
  //     formData,
  //     LTData,
  //     selectedRateType,
  //   );
  //   setCoupon({
  //     ...coupon,
  //     load: true,
  //   });

  //   if (generatedError == "") {
  //     const match = Match();
  //     if (disAmt || discountPercentage || match) {
  //       toast.error("First Remove Discount For Adding Coupon");
  //       setCoupon({
  //         ...coupon,
  //         load: false,
  //       });
  //     } else {
  //       axiosInstance
  //         .post("CouponMaster/BindTestForAppliedCoupon", {
  //           coupanCode: coupon?.code.trim(),
  //           centreId: LTData?.CentreID,
  //           rateTypeId: state?.RateID,
  //           InvestigationId: investigationId,
  //         })
  //         .then((res) => {
  //           setCoupon({ ...coupon, load: false });

  //           if (!res?.data?.success) {
  //             toast.error(res.data?.message || "Coupon validation failed");
  //             return;
  //           }
  //           const couponData = res?.data?.message;
  //           setCouponData(couponData);
  //           if (couponData?.Type == 2) {
  //             setTableData([]);
  //             setShowCoupon({ ...showCoupon, BindTestCouponShow: true });
  //           } else {
  //             if (LTData?.GrossAmount < couponData?.MinBookingAmount) {
  //               toast.error(
  //                 `Total amount should be greater than ${couponData?.MinBookingAmount}`,
  //               );
  //             } else if (LTData?.GrossAmount < couponData?.DiscountAmount) {
  //               toast.error(
  //                 `Gross amount must be greater than ${couponData?.DiscountAmount}`,
  //               );
  //             } else {
  //               if (couponData?.DiscountAmount == 0) {
  //                 setDiscountPercentage(couponData?.DiscountPercentage);
  //               }
  //               if (couponData?.DiscountPercentage == 0) {
  //                 setdisAmt(couponData?.DiscountAmount);
  //                 // ... rest of discount logic
  //               }
  //               setCoupon({ ...coupon, field: true });
  //               toast.success("Coupon applied successfully");
  //             }
  //           }
  //         })
  //         .catch((err) => {
  //           setCoupon({ ...coupon, load: false });
  //           toast.error(err?.response?.data?.message || "Error Occurred");
  //         });
  //     }
  //   } else {
  //     setCoupon({
  //       ...coupon,
  //       load: false,
  //     });
  //     setMoreErrors(generatedError);
  //   }
  // };


  const handleCouponValidate = () => {
    const generatedError = CouponValidateSchema(
      state,
      formData,
      LTData,
      selectedRateType,
    );
    setCoupon({
      ...coupon,
      load: true,
    });


    if (generatedError == "") {
      const match = Match();
      if (disAmt || discountPercentage || match) {
        toast.error("First Remove Discount For Adding Coupon");
        setCoupon({
          ...coupon,
          load: false,
        });
      } else {
        axiosInstance
          .post("CouponMaster/BindTestForAppliedCoupon", {
            coupanCode: coupon?.code.trim(),
            centreId: LTData?.CentreID,
            rateTypeId: state?.RateID,
            InvestigationId: investigationId,
          })
          .then((res) => {
            setCoupon({
              ...coupon,
              load: false,
            });

            if (!res?.data?.success) {
              toast.error(res?.data?.message || "Coupon validation failed");
              return;
            }
            const couponData = res?.data?.message;
            const couponInfo = Array.isArray(couponData)
              ? couponData[0]
              : couponData;
            setCouponData(couponData);
            const couponType = couponInfo?.Type;
            if (couponType == 2) {
              //handleSelectTestData(couponInfo);

              if (couponInfo?.DiscountAmount > 0) {
                setdisAmt(couponInfo?.DiscountAmount);
              }

              if (couponInfo?.DiscountPercentage > 0) {
                setDiscountPercentage(couponInfo?.DiscountPercentage);
              }

              setCoupon({
                ...coupon,
                field: true,
              });

              toast.success("Coupon applied successfully");
            } else {
              if (LTData?.GrossAmount < couponInfo?.MinBookingAmount) {
                toast.error(
                  `Total amount should be greater than ${couponInfo?.MinBookingAmount}`,
                );
              } else if (LTData?.GrossAmount < couponInfo?.DiscountAmount) {
                toast.error(
                  `Gross amount must be greater than ${couponInfo?.DiscountAmount}`,
                );
              } else {
                if (couponInfo?.DiscountAmount > 0) {
                  setdisAmt(couponInfo?.DiscountAmount);
                }
                if (couponInfo?.DiscountPercentage > 0) {
                  setDiscountPercentage(
                    couponInfo?.DiscountPercentage,
                  );
                }
                setCoupon({ ...coupon, field: true });
                toast.success("Coupon applied successfully");
              }
            }
          })
          .catch((err) => {
            setCoupon({ ...coupon, load: false });
            toast.error(err?.response?.data?.message || "Error Occurred");
          });
      }
    } else {
      setCoupon({
        ...coupon,
        load: false,
      });
      setMoreErrors(generatedError);
    }
  };

  const handleCouponCancel = () => {
    setCoupon({
      code: "",
      field: false,
    });
    setTableData([]);
    setMoreErrors({});

    if (coupon?.field) toast.error("Coupon Removed Successfully");
  };
  const handleMembershipcancel = () => {
    pendingPaidRef.current = 0;
    setmembershipnum("");
    setTableData([]);
    setdisAmt("");
    setDiscountPercentage("");
    setSuggestionData({
      show: false,
      viewTestModal: false,
      viewTestModalId: "",
      testSuggestions: {
        data: [],
        show: false,
        Total: [],
      },
      packageSuggestions: {
        data: [],
        show: false,
      },
      daySuggestions: {
        data: [],
        show: false,
      },
    });

    setState(stateIniti);
    setSecondaryMobile("");
    setThroughmemberdata(false);
    setThroughMobileData(false);
    getAccessCentres(
      setCentreData,
      LTData,
      safeSetLTData,
      LTDataIniti,
      (cid, ct) => useBindRateTypeWorkOrderFlow ? getRateTypeWorkOrder(cid, ct, true) : handleRateType(cid, ct),
      VisitTypeCategory,
      fetchFields,
      callFromRegistration,
      setCenterType,
    );
    // getCentreWorkOrder()
  };

  const handleCouponDetailsModal = () => {
    axiosInstance
      .post("CouponMaster/GetCouponValidationData", {
        CoupanCode: coupon?.code.trim(),
      })
      .then((res) => {
        setCouponDetails(res?.data?.message);
        if (res?.data?.message.length > 0) {
          setShowCoupon({
            ...showCoupon,
            ShowCouponDetail: true,
          });
        } else {
          toast.error("No Coupon Details Found");
        }
      })
      .catch((err) => {
        toast.error(
          err?.response?.data?.message ? "Details Not Found" : "Error Occured",
        );
      });
  };

  let sumOfPLO = [];
  const handleDiscountLastIndex = (
    ele,
    index,
    findPercentageDiscount,
    value,
  ) => {
    if (index + 1 != PLO.length) {
      const result = ((ele.Rate * findPercentageDiscount) / 100).toFixed(2);
      const roundedResult = parseFloat(result).toFixed(2);
      sumOfPLO.push(roundedResult);
      return roundedResult;
    } else {
      const finalData = sumOfPLO.reduce(
        (acc, current) => acc + parseFloat(current),
        0,
      );

      const finalResult = parseFloat((value - finalData).toFixed(2));

      return finalResult;
    }
  };

  const testDataArray = [];
  tableData.forEach((obj) => {
    testDataArray.push(obj.InvestigationID);
  });

  const handleShowRemark = () => {
    setShowRemark(false);
  };

  const handleSaveremark = (payload) => {
    setLTData({ ...LTData, Remarks: payload });
    handleShowRemark();
  };

  const [t] = useTranslation();
  const getBarcodeData = (data) => {
    const allTestIds = data[0]?.barcodeInfo?.map((item) => item.testID);
    const allBarcodeNos = data[0]?.barcodeInfo?.map((item) => item.barcodeNo);
    axiosInstance
      .post("SC/getBarcode", {
        LedgerTransactionNo: data[0]?.LedgerTransactionNo,
        BarcodeNo: allBarcodeNos,
        TestID: allTestIds,
        barcodeNoDepartmentID: 0,
      })
      .then((res) => {
        if (res?.data?.message != "") window.open(res?.data?.message);
      })
      .catch((err) => {
        if (err.response.status === 504) {
          toast.error(t("Something Went Wrong"));
        }
        if (err.response.status === 401) {
          toast.error(err.response.data.message);
        }
      });
  };

  useEffect(() => {
    const onGlobalKeyDown = (e) => {
      try {
        if ((e.ctrlKey || e.metaKey) && e.key && e.key.toLowerCase() === "s") {
          e.preventDefault();
          handleSubmit(e);
        }
      } catch (err) {
        console.error("Error handling global Ctrl+S", err);
      }
    };

    window.addEventListener("keydown", onGlobalKeyDown);
    return () => window.removeEventListener("keydown", onGlobalKeyDown);
  }, [handleSubmit]);

  const ShowBarcodeGroupForLogicFour = () => {
    return (
      <>
        {selectedRateType?.PayMode === "Credit" &&
          BarcodeLogic == 4 && (
          <div className="my-2 mt-3 px-2">
            <Heading title={t("Enter Barcode")} />
            <div
              style={{ gap: "6px" }}
              className="pt-2 row px-3 d-flex flex-wrap"
            >
              {uniqueSampleTypesName?.map(
                (item, idx) =>
                  item?.toLowerCase()?.trim() !== "na" && (
                    <InputGroup
                      key={idx}
                      className="mb-3 col-md-6 flex-grow-1 row kohdskj px-2"
                    >
                      <ReactTooltip
                        id={`my-tooltip-${idx}`}
                        place="top"
                        content={
                          <div>
                            <h2 className="mb-1 border-bottom">
                              {item} Test List:-
                            </h2>
                            {groupTestsBySample(tableData)[item]?.map(
                              (item, idx) => (
                                <p className="mb-0">
                                  {idx + 1}. {item}
                                </p>
                              ),
                            )}
                          </div>
                        }
                        style={{ zIndex: 9999 }}
                      />
                      <InputGroup.Text
                        data-tooltip-id={`my-tooltip-${idx}`}
                        style={{
                          backgroundColor: `${sampleColorObj[item]}`,
                          borderColor: `${sampleColorObj[item]}`,
                          color: `${sampleColorObj[item] ? "#fff" : ""}`,
                        }}
                        className="col-6 d-flex align-items-center justify-content-between"
                        id={`barcodeSmapleWise-${idx} my-tooltip-2`}
                      >
                        <div
                          style={{ gap: "6px" }}
                          className="d-flex align-items-center "
                        >
                          <i className="bi bi-upc-scan mb-0 h-25"></i>
                          <span>{item}</span>
                        </div>
                        <div className="d-flex align-items-center">
                          <input
                            type="checkbox"
                            checked={snrCheck[item] || false}
                            style={{ marginLeft: "10px" }}
                            aria-label={`srnCheck-${item}`}
                            name={item}
                            onChange={(e) => handleSrnCheck(e, item)}
                            disabled={true}
                          />
                        </div>
                      </InputGroup.Text>
                      <Form.Control
                        style={{
                          borderColor: `${sampleColorObj[item]}`,
                        }}
                        className="col-6"
                        type="text"
                        placeholder="Enter Barcode"
                        aria-label={`barcode-${item}`}
                        aria-describedby={`barcodeSmapleWise-${idx}`}
                        maxLength={Number(BarocdeNoMaxLength)}
                        name={item}
                        disabled={snrCheck[item] ? true : false}
                        onChange={(e) => handleBarcodeChange(e, item)}
                        value={
                          tableData
                            ?.flatMap(
                              (test) => test.InvestigationSampleType || [],
                            )
                            ?.find((sample) => sample.sampleName === item)
                            ?.barcodeNo || ""
                        }
                        id={`barcode-${idx}`}
                        onKeyDown={(e) => handleKeyDown(e, `barcode-${idx}`)}
                      />
                    </InputGroup>
                  ),
              )}
            </div>
          </div>
        )}
      </>
    );
  };
  // Fields with an explicit TabOrder (> 0) define the intended keyboard
  // sequence and must be visited in that numeric order; a TabOrder of 0
  // means "not part of the configured tab sequence" (e.g. SampleCollectionTime)
  // and should be skipped by Tab rather than visited in raw DisplayOrder position.
  const configuredTabbingOrder = Array.isArray(tabbingOrder)
    ? tabbingOrder
      .filter((ele) => Number(ele?.TabOrder) > 0)
      .sort((a, b) => Number(a?.TabOrder) - Number(b?.TabOrder))
    : [];

  const getTabbingOrderIds = (
    configuredTabbingOrder.length
      ? configuredTabbingOrder
      : Array.isArray(tabbingOrder)
        ? tabbingOrder
        : []
  )
    .map((ele) => {
      let id = ele?.ControlDisplayID;
      if (id === "RateType") return "RateID";
      if (id === "Visit") return "VisitType";
      return id;
    })
    .filter(Boolean);

  // focusOrder (static fields) — keep any existing tabbing ids first
  const baseFocusOrder = [...getTabbingOrderIds];

  const fullTabbingOrderIds = Array.isArray(tabbingOrder)
    ? tabbingOrder
      .map((ele) => {
        let id = ele?.ControlDisplayID;
        if (id === "RateType") return "RateID";
        if (id === "Visit") return "VisitType";
        return id;
      })
      .filter(Boolean)
    : [];

  const insertBarcodeIds = (baseOrder = [], barcodeIds = []) => {
    if (!Array.isArray(baseOrder)) baseOrder = [];
    if (!Array.isArray(barcodeIds) || barcodeIds.length === 0) return baseOrder;

    const placeholderIndex = baseOrder.indexOf("barcode");
    const baseWithoutBarcodes = baseOrder.filter(
      (it) => !(typeof it === "string" && it.startsWith("barcode")),
    );

    if (placeholderIndex === -1) {
      return [...baseWithoutBarcodes, ...barcodeIds];
    }

    let insertAt = 0;
    for (let i = 0, count = 0; i < baseOrder.length; i++) {
      if (i === placeholderIndex) {
        insertAt = count;
        break;
      }
      if (
        !(
          typeof baseOrder[i] === "string" && baseOrder[i].startsWith("barcode")
        )
      ) {
        count++;
      }
    }

    return [
      ...baseWithoutBarcodes.slice(0, insertAt),
      ...barcodeIds,
      ...baseWithoutBarcodes.slice(insertAt),
    ];
  };

  const getFocusOrder = () => {
    const barcodeIds = (
      Array.isArray(uniqueSampleTypesName) ? uniqueSampleTypesName : []
    )
      .filter((item) => item && String(item).toLowerCase().trim() !== "na")
      .map((_, idx) => `barcode-${idx}`);

    const focusOrderWithBarcodes = insertBarcodeIds(baseFocusOrder, barcodeIds);
    const finalOrder = [...new Set(focusOrderWithBarcodes.filter(Boolean))];
    return [...finalOrder, "btnSave"];
  };

  const getFullFocusOrder = () => {
    const barcodeIds = (
      Array.isArray(uniqueSampleTypesName) ? uniqueSampleTypesName : []
    )
      .filter((item) => item && String(item).toLowerCase().trim() !== "na")
      .map((_, idx) => `barcode-${idx}`);

    const focusOrderWithBarcodes = insertBarcodeIds(
      fullTabbingOrderIds,
      barcodeIds,
    );
    const finalOrder = [...new Set(focusOrderWithBarcodes.filter(Boolean))];
    return [...finalOrder, "btnSave"];
  };

  const getTabIndex = (id) => {
    // Skip hidden controls in tabbing
    if (!isHideController(id)) {
      return -1; // Remove from tab order
    }

    if (id === "BarcodeNo" && BarcodeLogic === 4) {
      // if (id === "BarcodeNo" && (BarcodeLogic === 4 || BarcodeLogic === 5)) {
      return -1; // Skip BarcodeNo when BarcodeLogic is 4 or 5
    }

    const order = getFocusOrder();
    const index = order.indexOf(id);
    return index === -1 ? -1 : index + 1;
  };

  // const focusNextById = (currentId, isReverse = false) => {
  //   const focusOrder = getFocusOrder();
  //   const currentIndex = focusOrder.indexOf(currentId);
  //   if (currentIndex === -1) return;

  //   let nextIndex = isReverse ? currentIndex - 1 : currentIndex + 1;

  //   // Loop through focus order to find next enabled element
  //   while (nextIndex >= 0 && nextIndex < focusOrder.length) {
  //     const nextId = focusOrder[nextIndex];
  //     const nextElement = document.getElementById(nextId);

  //     if (nextElement &&
  //       !nextElement.disabled &&
  //       nextElement.style.display !== 'none' &&
  //       nextElement.offsetParent !== null) {

  //       const input = nextElement.querySelector("input, select, textarea, button, .react-select__input input, [role='combobox']");
  //       if (input && !input.disabled) {
  //         input.focus();
  //         return;
  //       } else if (!nextElement.disabled) {
  //         nextElement.focus();
  //         return;
  //       }
  //     }

  //     nextIndex = isReverse ? nextIndex - 1 : nextIndex + 1;
  //   }
  // };

  const focusNextById = (currentId, isReverse = false) => {
    let focusOrder = getFocusOrder();
    let currentIndex = focusOrder.indexOf(currentId);

    if (currentIndex === -1) {
      // currentId isn't part of the configured TabOrder sequence (e.g. a
      // TabOrder = 0 field like SampleCollectionTime, reached by clicking
      // it directly) — fall back to the full DisplayOrder-based order so
      // Tab still moves focus forward instead of doing nothing.
      focusOrder = getFullFocusOrder();
      currentIndex = focusOrder.indexOf(currentId);
      if (currentIndex === -1) return;
    }

    let nextIndex = isReverse ? currentIndex - 1 : currentIndex + 1;

    // Initial wrap-around
    if (nextIndex >= focusOrder.length) nextIndex = 0;
    if (nextIndex < 0) nextIndex = focusOrder.length - 1;

    let attempts = 0;
    while (attempts < focusOrder.length) {
      const nextId = focusOrder[nextIndex];
      const nextElement = document.getElementById(nextId);

      if (
        nextElement &&
        !nextElement.disabled &&
        nextElement.style.display !== "none" &&
        nextElement.offsetParent !== null
      ) {
        // Try searching for the most common input children (including UltraFastSelect inputs)
        const input = nextElement.querySelector(
          "input:not([type='hidden']), select, textarea, button, .react-select__input input, [role='combobox'], .ufs-input",
        );

        if (input && !input.disabled) {
          input.focus();
          const selectableInputTypes = ["text", "search", "tel", "url", "password"];
          if (
            typeof input.select === "function" &&
            (!input.type || selectableInputTypes.includes(input.type))
          ) {
            input.select();
          }
          return;
        } else if (!nextElement.disabled) {
          nextElement.focus();
          return;
        }
      }

      nextIndex = isReverse ? nextIndex - 1 : nextIndex + 1;
      if (nextIndex >= focusOrder.length) nextIndex = 0;
      if (nextIndex < 0) nextIndex = focusOrder.length - 1;

      attempts++;
    }
  };

  const handleKeyDown = (e, currentId) => {
    // if (e.target?.id?.includes("react-select")) return;

    if (e.key !== "Tab") return;

    // const isReactSelectInput =
    // e.target?.className?.includes("input") ||
    // e.target?.id?.includes("react-select") ||
    // e.target?.closest?.(".react-select__control");

    // if (isReactSelectInput) return;

    // input.select() throws for control types that don't support text
    // selection (time/date/number/...); guard so a throw here can't skip
    // the preventDefault/focusNextById below and leave Tab "stuck".
    const selectableTypes = ["text", "search", "tel", "url", "password"];
    if (
      e.target &&
      typeof e.target.select === "function" &&
      (!e.target.type || selectableTypes.includes(e.target.type))
    ) {
      e.target.select();
    }

    e.preventDefault();
    focusNextById(currentId, e.shiftKey);
  };

  const fetchRateTypeDetails = async (rateTypeID, cid, ct, onSuccess) => {
    if (!rateTypeID) return;
    const CentreType =
      Number(AllowAdvanceOldPatientSearchAtWorkOrder) === 0
        ? ""
        : ct == 1
          ? DefaultVisitTypeatWorkOrder || "Walkin"
          : ct || DefaultVisitTypeatWorkOrder || "Walkin";
    await axiosInstance
      .post(`${apiUrls.BindRateTypeWorkOrder}?SelectedRateTypeID=${rateTypeID}`, {
        centreID: cid || LTData?.CentreID || 0,
        rateTypeID: rateTypeID,
        AllowEstimate: 0,
        CentreType: CentreType,
        AllowHomeCollection: 0,
        AllowMembershipCard: 0,
      })
      .then((res) => {
        const data = res?.data?.message;
        if (!data?.length) return;
        const ele = data.find((d) => d?.RateTypeID == rateTypeID) || data[0];
        const fullData = {
          ReferenceRate: ele?.ReferenceRate,
          BusinessUnitID: ele?.BusinessUnitID,
          Invoice_To: ele?.InvoiceTo,
          value: ele?.RateTypeID,
          label: ele?.RateTypeName,
          BarcodeLogic: ele?.BarcodeLogic,
          LockRegistration: ele?.LockRegistration,
          PayMode: ele?.PayMode,
          RateTypeEmail: ele?.Email,
          RateTypePhone: ele?.Phone,
          ClientAddress: ele?.ClientAddress,
          HideAmount: ele?.HideAmount,
          ProEmployee: ele?.ProEmployee,
          AutoEmail: ele?.IsAutoPRDM,
          IsMobileRequired:
            ele?.PayMode?.toUpperCase() === "CREDIT"
              ? 0
              : ele?.PayMode?.toUpperCase() === "CASH"
                ? 1
                : ele?.IsMobileRequired,
          AutoTRF: ele?.AutoTRF,
          AutoReceipt: ele?.AutoReceipt,
          AutoMRPReceipt: ele?.AutoMRPReceipt,
          SampleCollectionType: ele?.SampleCollectionType,
          IsUrgent: ele?.IsUrgent,
          CoPaymentApplicable: ele?.CoPaymentApplicable,
          centreType: ele?.centreType || ele?.CentreType,
          CentreType: ele?.CentreType || ele?.centreType,
          Country: ele?.Country,
          RequiredAttachment: ele?.RequiredAttachment,
          AllowZeroRateBooking: ele?.AllowZeroRateBooking,
          IsForcelyBookingLock: ele?.IsForcelyBookingLock || 0,
        };
        setRateType((prev) =>
          prev.map((r) => (r.value == rateTypeID ? { ...r, ...fullData } : r))
        );
        setAutoCompleteCountry(fullData.Country);
        setisCoPayment(fullData.CoPaymentApplicable);
        setisB2B(fullData.CentreType || fullData.centreType);
        setLTData((prev) => ({
          ...prev,
          CentreType: fullData.CentreType || fullData.centreType || prev?.CentreType || "",
          centreType: fullData.centreType || fullData.CentreType || prev?.centreType || "",
        }));
        setState((prev) => ({ ...prev, RateID: fullData.value }));
        setAllReceipt((prev) => ({
          ...prev,
          AutoTRF: fullData.AutoTRF || "",
          AutoReceipt: fullData.AutoReceipt || "",
          AutoMRPReceipt: fullData.AutoMRPReceipt || "",
        }));
        setBarcodeLogic(fullData.BarcodeLogic);
        if (onSuccess) onSuccess(fullData);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const getRateTypeWorkOrder = async (cid, ct) => {
    if (CentreVsRateTypeatWorkOrder == 1) {
      return;
    }
    const CentreType =
      Number(AllowAdvanceOldPatientSearchAtWorkOrder) === 0
        ? ""
        : ct == 1
          ? DefaultVisitTypeatWorkOrder || "Walkin"
          : ct || DefaultVisitTypeatWorkOrder || "Walkin";
    await axiosInstance
      .post(apiUrls.BindRateTypeWorkOrder, {
        centreID: cid || LTData?.CentreID || 0,
        rateTypeID: 0,
        AllowEstimate: 0,
        CentreType: CentreType,
        AllowHomeCollection: 0,
        AllowMembershipCard: 0,
      })
      .then((res) => {
        const data = res?.data?.message;
        const val = data.map((ele) => {
          return {
            ReferenceRate: ele?.ReferenceRate,
            BusinessUnitID: ele?.BusinessUnitID,
            Invoice_To: ele?.InvoiceTo,
            value: ele?.RateTypeID,
            label: ele?.RateTypeName,
            BarcodeLogic: ele?.BarcodeLogic,
            LockRegistration: ele?.LockRegistration,
            PayMode: ele?.PayMode,
            RateTypeEmail: ele?.Email,
            RateTypePhone: ele?.Phone,
            ClientAddress: ele?.ClientAddress,
            HideAmount: ele?.HideAmount,
            ProEmployee: ele?.ProEmployee,
            AutoEmail: ele?.IsAutoPRDM,
            IsMobileRequired:
              ele?.PayMode?.toUpperCase() === "CREDIT"
                ? 0
                : ele?.PayMode?.toUpperCase() === "CASH"
                  ? 1
                  : ele?.IsMobileRequired,
            AutoTRF: ele?.AutoTRF,
            AutoReceipt: ele?.AutoReceipt,
            AutoMRPReceipt: ele?.AutoMRPReceipt,
            SampleCollectionType: ele?.SampleCollectionType,
            IsUrgent: ele?.IsUrgent,
            CoPaymentApplicable: ele?.CoPaymentApplicable,
            centreType: ele?.centreType || ele?.CentreType,
            CentreType: ele?.CentreType || ele?.centreType,
            Country: ele?.Country,
            RequiredAttachment: ele?.RequiredAttachment,
            AllowZeroRateBooking: ele?.AllowZeroRateBooking,
            IsForcelyBookingLock: ele?.IsForcelyBookingLock || 0,
          };
        });
        console.log("bindratetypeworkorder", val)
        setRateType([...val]);

        // if (val?.length == 1) {
        //   setState((prev) => ({ ...prev, RateID: val?.[0]?.value }));
        //   setAllReceipt((prev) => ({
        //     ...prev,
        //     AutoTRF: val?.[0]?.AutoTRF || "",
        //     AutoReceipt: val?.[0]?.AutoReceipt || "",
        //     AutoMRPReceipt: val?.[0].AutoMRPReceipt || "",
        //   }));
        // }
        // if (val?.length > 0 && AddBlankRateTypeWorkOrder == 0) {
        console.log("val[0]?.Country", val[0]?.Country)
        if (val?.length > 0) {
          setAutoCompleteCountry(val[0]?.Country);
          setisCoPayment(val?.[0]?.CoPaymentApplicable);
          setisB2B(val?.[0]?.CentreType || val?.[0]?.centreType);
          setLTData((prev) => ({
            ...prev,
            CentreType: val?.[0]?.CentreType || val?.[0]?.centreType || prev?.CentreType || "",
            centreType: val?.[0]?.centreType || val?.[0]?.CentreType || prev?.centreType || "",
          }));
          setState((prev) => ({ ...prev, RateID: val?.[0]?.value }));
          setAllReceipt((prev) => ({
            ...prev,
            AutoTRF: val?.[0]?.AutoTRF || "",
            AutoReceipt: val?.[0]?.AutoReceipt || "",
            AutoMRPReceipt: val?.[0].AutoMRPReceipt || "",
          }));
        }
        setBarcodeLogic(val?.[0]?.BarcodeLogic);
      })
      .catch((err) => {
        console.log(err);
      })
      .finally(() => { });
  };

  console.log("Ratetype", RateType)

  useEffect(() => {
    if (RateType?.length === 1 && CentreVsRateTypeatWorkOrder == 0 && useWorkOrderRateFlow) {
      const rt = RateType[0];
      getCentreWorkOrder(rt.value, rt.BusinessUnitID);
    }
  }, [RateType]);

  console.log({ autoCompleteCountry })

  useEffect(() => {
    if (LTData?.CentreID) {
      const barcodeLogic = CentreData?.find(
        (item) => item?.value == LTData?.CentreID,
      );
      // setBarcodeLogic(barcodeLogic?.BarcodeLogic)
    }
  }, [LTData?.CentreID, CentreData]);

  const getCentreWorkOrder = async (rateTypeId, BusinessUnitID) => {
    if (!BusinessUnitID) return;
    if (!rateTypeId) return;
    try {
      // If feature is off, do nothing
      if (CentreVsRateTypeatWorkOrder == 1) return;

      const res = await axiosInstance.post(apiUrls.BindCentreWorkOrder, {
        centreID: Number(BusinessUnitID) || 0,
        rateTypeID: Number(rateTypeId) || 0,
      });

      const data = res?.data?.message;
      if (!Array.isArray(data) || data.length === 0) return;
      const centre = data[0]; // always 1 centre return as per your logic
      // Prepare dropdown data
      const formattedCentre = {
        value: centre?.value,
        label: centre?.label,
        VisitType: centre?.VisitType,
        SetMRP: centre?.SetMRP,
        BTB: centre?.BTB,
        SUBPCC: centre?.SUBPCC,
        ...centre,
      };
      pendingCentreRef.current = formattedCentre;

      setCentreData([formattedCentre]);


      // Set dropdown list
      setLTData((prev) => ({
        ...prev,
        CentreID: formattedCentre.value,
        CentreName: formattedCentre.label,
        VisitType:
          formattedCentre.VisitType || DefaultVisitTypeatWorkOrder || "Walkin",
        SetMRP: formattedCentre.SetMRP,
        BTB: formattedCentre.BTB,
        SUBPCC: formattedCentre.SUBPCC,
        CentreType:
          formattedCentre.CentreType || DefaultVisitTypeatWorkOrder || "Walkin",
      }));
      setState((prev) => ({
        ...prev,
        CentreID: formattedCentre.value,
      }));

      // Auto-select centre in LTData
      // setBarcodeLogic(centre?.BarcodeLogic);
      // Auto-select centre in state

      // Load VisitType & Dynamic Fields
      VisitTypeCategory(
        formattedCentre.VisitType || DefaultVisitTypeatWorkOrder || "Walkin",
      );
      fetchFields(
        formattedCentre.VisitType || DefaultVisitTypeatWorkOrder || "Walkin",
      );
    } catch (err) {
      console.log("BindCentreWorkOrder Error:", err);
    }
  };

  console.log({ CentreVsRateTypeatWorkOrder })
  console.log({ CompanyID: userdata.CompanyID });

  // When CentreVsRateTypeatWorkOrder == 0 (company 1002), load rate type dropdown directly since getAccessCentres returns early
  useEffect(() => {
      if (CentreVsRateTypeatWorkOrder == 0 && !lockedRate) {
      getRateTypeWorkOrder(undefined, undefined, true);}
  }, [CentreVsRateTypeatWorkOrder, LTData?.CentreID, lockedRate]);

  // const autofocusTitle = (targetFieldId = null) => {
  //   setTimeout(() => {
  //     let targetId;

  //     if (targetFieldId) {
  //       // Use the provided field ID
  //       targetId = targetFieldId;
  //     } else {
  //       // Find field with TabOrder = 1 (default behavior)
  //       const firstTabOrderField = tabbingOrder?.find(field => field.TabOrder === 1);
  //       targetId = firstTabOrderField?.ControlDisplayID || "Title";
  //     }

  //     const refKey = refMap[targetId];
  //     if (refKey && refs[refKey]?.current) {
  //       refs[refKey].current.focus();
  //     } else {
  //       const firstElement = document.getElementById(targetId);
  //       if (firstElement) {
  //         const input = firstElement.querySelector(
  //           "input, select, textarea, button"
  //         );
  //         if (input) input?.focus();
  //         else firstElement?.focus();
  //       }
  //     }
  //   }, 100);
  // };

  const autofocusTitle = (targetFieldId = null) => {
    setTimeout(() => {
      let targetId;

      if (targetFieldId) {
        // Use the provided field ID
        targetId = targetFieldId;
      } else {
        // Find field with TabOrder = 1 (default behavior)
        const firstTabOrderField = tabbingOrder?.find(
          (field) => field.TabOrder === 1,
        );
        targetId = firstTabOrderField?.ControlDisplayID || "Title";
      }

      if (targetId === "RateType") targetId = "RateID";
      if (targetId === "Visit") targetId = "VisitType";

      const refKey = refMap[targetId];
      if (refKey && refs[refKey]?.current) {
        refs[refKey].current.focus();
      } else {
        const firstElement = document.getElementById(targetId);
        if (firstElement) {
          // For ReactSelect components, look for the input inside the control
          const input = firstElement.querySelector(
            "input, select, textarea, button, .react-select__input input, [role='combobox']",
          );
          if (input) {
            input.focus();
          } else {
            // For ReactSelect, try to focus the control itself
            const reactSelectControl = firstElement.querySelector(
              ".react-select__control",
            );
            if (reactSelectControl) {
              reactSelectControl.click(); // This will open the dropdown and focus
            } else {
              firstElement.focus();
            }
          }
        }
      }
    }, 150); // Increased timeout to ensure ReactSelect is fully rendered
  };

  const persistFocusOfReactSelect = (autoFocusId) => {
    setTimeout(() => {
      const firstElement = document.getElementById(autoFocusId);
      if (firstElement) {
        const input = firstElement.querySelector(
          // "input, select, textarea, button"
          "input, select, textarea, button, .react-select__input input, [role='combobox']",
        );
        if (input) input?.focus();
        else firstElement?.focus();
      }
    }, 100);
  };

  const handleNewPatient = () => {
    setShowOP(false);
    pendingPaidRef.current = 0;
    handleCreateNewPatient(searchMobile || state?.Mobile);
  };

  const handleCreateNewPatient = (mobile = "") => {
    const newDocumentId = guidNumber();
    setDocumentID(newDocumentId);
    setState({ ...stateIniti, Mobile: mobile });
    setIsMobileSearchSelected(mobile ? true : false);
    setSearchMobile(mobile); // sync searchMobile too
    setHcPaymentMode(null)
    setLockedRate(false); // reset rate lock when creating new patient
    setTrfNo("");
    setSecondaryMobile("");
    setTime({
      Hour: new Date().getHours().toString().padStart(2, "0"),
      Minute: new Date().getMinutes().toString().padStart(2, "0"),
      Second: new Date().getSeconds().toString().padStart(2, "0"),
    });

    setPLO([]);
    setRcData([
      {
        PayBy: "Patient",
        ReceiptNo: "",
        ledgerNoCr: "",
        RateTypeId: state?.RateID,
        PaymentMode: defaultPayment.PaymentMode,
        PaymentModeID: defaultPayment.PaymentModeID,
        BankName: "",
        CardDate: "",
        CardNo: "",
        Amount: "",
        CentreID: LTData?.CentreID,
      },
    ]);
    setSaveSmsEmail({
      SmsToPatient: "",
      SmsToDoctor: "",
      IsActiveSmsToPatient: "",
      IsActiveSmsToDoctor: "",
      EmailToPatient: "",
      EmailToDoctor: "",
      IsActiveEmailToPatient: "",
      IsActiveEmailToDoctor: "",
      SmsToClient: "",
      IsActiveSmsToClient: "",
      EmailToClient: "",
      IsActiveEmailToClient: "",
      IsCourier: "",
      IsWhatsappRequired: "",
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
    setFormData((prev) => ({
      ...prev,
      DoctorName: isDefaultReferalDoctorSelf ? "SELF" : "",
      SecondReferDoctor: isDefaultReferalDoctorSelf ? "SELF" : "",
    }));
    setLTData((prev) => ({
      ...prev,
      DoctorName: isDefaultReferalDoctorSelf ? "SELF" : "",
      DoctorID: isDefaultReferalDoctorSelf ? 1 : "",
      // ReferLabId: data.DoctorReferalID,
      // ReferLabName: data.Name,
      DoctorMobile: "",
      DoctorEmail: "",
      ProEmployee: 0,
      ReferLabId: "",
    }));
    setDoctorRequiredAttachment([]);

    setmembershipnum("");
    setThroughmemberdata(false);
    setMemberdetails({});
    setTableData([]);
    // setIsSubmit({
    //   type: "Success",
    //   isLoading: false,
    // });
    setCoupon({
      code: "",
      field: false,
    });
    setThroughMobileData(false);
    setThroughmemberdata(false);
    // getAccessCentres(
    //   setCentreData,
    //   LTData,
    //   safeSetLTData,
    //   LTDataIniti,
    //   handleRateType,
    //   VisitTypeCategory,
    //   fetchFields,
    //   callFromRegistration
    // );
    SetPatientGuid(guidNumber());
    guidNumber();
    setPatientImg({ img: PlaceholderImage, show: false });
    setAutoEmail({
      order_id: "",
      flag: false,
    });
    setSuggestionData({
      show: false,
      viewTestModal: false,
      viewTestModalId: "",
      testSuggestions: {
        data: [],
        show: false,
        Total: [],
      },
      packageSuggestions: {
        data: [],
        show: false,
      },
      daySuggestions: {
        data: [],
        show: false,
      },
    });

    setState((prev) => ({
      ...prev,
      RateID: state?.RateID,
      CentreID: state?.CentreID,
      AutoEmail: state?.AutoEmail,
      RateTypeEmail: state?.RateTypeEmail,
      RateTypePhone: state?.RateTypePhone,
      ClientAddress: state?.ClientAddress,
      HideAmount: state?.HideAmount,
      ProEmployee: state?.ProEmployee,
    }));
    setLTData((prev) => ({
      ...prev,
      CentreID: LTData?.CentreID,
      CentreName: LTData?.CentreName,
      RateTypeId: null,
      SetMRP: LTData?.SetMRP,
      BTB: LTData?.BTB,
      SUBPCC: LTData?.SUBPCC,
      CentreType: LTData?.CentreType || DefaultVisitTypeatWorkOrder || "Walkin",
      ReferLabId: "",
    }));

    // setBarcodeLogic(Number(value?.BarcodeLogic));
    autofocusTitle(tabbingOrder[0]?.AutoFocusControlID);
    GetLastVisitNoByCentreID();
    setShowDefault(true);
  };

  const handleResetCreateNewPatient = (mobile) => {
    pendingPaidRef.current = 0;
    const newDocumentId = guidNumber();
    setDocumentID(newDocumentId);
    setState(mobile ? { ...stateIniti, Mobile: mobile } : stateIniti);
    setSearchMobile(mobile || ""); // reset searchMobile too
    setTrfNo("");
    setSecondaryMobile("");
    setHcPaymentMode(null)
    setPreRegistrationTRFID(0);
    setTime({
      Hour: new Date().getHours().toString().padStart(2, "0"),
      Minute: new Date().getMinutes().toString().padStart(2, "0"),
      Second: new Date().getSeconds().toString().padStart(2, "0"),
    });

    setPLO([]);
    setRcData([
      {
        PayBy: "Patient",
        ReceiptNo: "",
        ledgerNoCr: "",
        RateTypeId: state?.RateID,
        PaymentMode: defaultPayment.PaymentMode,
        PaymentModeID: defaultPayment.PaymentModeID,
        BankName: "",
        CardDate: "",
        CardNo: "",
        Amount: "",
        CentreID: LTData?.CentreID,
      },
    ]);
    setSaveSmsEmail({
      SmsToPatient: "",
      SmsToDoctor: "",
      IsActiveSmsToPatient: "",
      IsActiveSmsToDoctor: "",
      EmailToPatient: "",
      EmailToDoctor: "",
      IsActiveEmailToPatient: "",
      IsActiveEmailToDoctor: "",
      SmsToClient: "",
      IsActiveSmsToClient: "",
      EmailToClient: "",
      IsActiveEmailToClient: "",
      IsCourier: "",
      IsWhatsappRequired: "",
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
    setFormData((prev) => ({
      ...prev,
      DoctorName: isDefaultReferalDoctorSelf ? "SELF" : "",
      SecondReferDoctor: isDefaultReferalDoctorSelf ? "SELF" : "",
    }));
    setLTData((prev) => ({
      ...prev,
      DoctorName: isDefaultReferalDoctorSelf ? "SELF" : "",
      DoctorID: isDefaultReferalDoctorSelf ? 1 : "",
      // ReferLabId: data.DoctorReferalID,
      // ReferLabName: data.Name,
      DoctorMobile: "",
      DoctorEmail: "",
      ProEmployee: 0,
      ReferLabId: "",
      preRegistrationRequestID: 0,
    }));

    setmembershipnum("");
    setThroughmemberdata(false);
    setMemberdetails({});
    setTableData([]);
    // setIsSubmit({
    //   type: "Success",
    //   isLoading: false,
    // });
    setCoupon({
      code: "",
      field: false,
    });
    setThroughMobileData(false);
    setThroughmemberdata(false);
    // getAccessCentres(
    //   setCentreData,
    //   LTData,
    //   safeSetLTData,
    //   LTDataIniti,
    //   handleRateType,
    //   VisitTypeCategory,
    //   fetchFields,
    //   callFromRegistration
    // );
    SetPatientGuid(guidNumber());
    guidNumber();
    setPatientImg({ img: PlaceholderImage, show: false });
    setAutoEmail({
      order_id: "",
      flag: false,
    });
    setSuggestionData({
      show: false,
      viewTestModal: false,
      viewTestModalId: "",
      testSuggestions: {
        data: [],
        show: false,
        Total: [],
      },
      packageSuggestions: {
        data: [],
        show: false,
      },
      daySuggestions: {
        data: [],
        show: false,
      },
    });

    setState((prev) => ({
      ...prev,
      RateID: state?.RateID,
      CentreID: state?.CentreID,
      AutoEmail: state?.AutoEmail,
      RateTypeEmail: state?.RateTypeEmail,
      RateTypePhone: state?.RateTypePhone,
      ClientAddress: state?.ClientAddress,
      HideAmount: state?.HideAmount,
      ProEmployee: state?.ProEmployee,
    }));
    setLTData((prev) => ({
      ...prev,
      CentreID: LTData?.CentreID,
      CentreName: LTData?.CentreName,
      RateTypeId: null,
      SetMRP: LTData?.SetMRP,
      BTB: LTData?.BTB,
      SUBPCC: LTData?.SUBPCC,
      ReferLabId: "",
    }));

    // setBarcodeLogic(Number(value?.BarcodeLogic));
    autofocusTitle(tabbingOrder[0]?.AutoFocusControlID);
    GetLastVisitNoByCentreID();
    setShowDefault(false);
  };

  useEffect(() => {
    if (AutoFillPaidAmount == 1) {
      // Part of the total may already be paid (radiologyPrePaidAmount, see
      // its declaration above) — auto-fill only what's actually still due,
      // not the full Net Amount, or staff would be prompted to collect cash
      // that was already taken at booking time.
      const amountDue = Math.max(
        0,
        (Number(LTData?.NetAmount) || 0) - radiologyPrePaidAmount,
      );
      const updatedRcData = RcData.map((item) => {
        if (item.PaymentMode === "Cash") {
          return { ...item, Amount: amountDue };
        }
        return item;
      });
      setRcData(updatedRcData);
    }
  }, [LTData?.NetAmount, radiologyPrePaidAmount]);

  const hideSpecificField = (controllarId = "") => {
    const controllerData = controllerDynamicList?.find((item) => {
      if (item?.ControlDisplayID == controllarId) {
        return item;
      }
    });
    return controllerData;
  };

  useEffect(() => {
    if (Number(AllowAdvanceOldPatientSearchAtWorkOrder)) {
      setShowOP(true);
      setShowDefault(false);
    }
  }, []);

  useEffect(() => {
    if (!tableData || tableData.length === 0) {
      setSelectAllUrgent(false);
      return;
    }

    const allUrgent = tableData?.every((item) => item.IsUrgent === 1);
    setSelectAllUrgent(allUrgent);
  }, [tableData]);

  const VisitTypeOptions = [
    { label: "Walkin", value: "Walkin" },
    { label: "Panel", value: "Panel" },
    { label: "B2B", value: "B2B" },
  ];

  // const handleMakePayment = (e) => {
  //   e.preventDefault();
  //   setShowMpesa(true);
  // };

  const handleMakePayment = (e) => {
    e.preventDefault();

    const mpesaRow = RcData?.find((item) => item.PaymentMode === "M-Pesa");
    if (!mpesaRow || Number(mpesaRow.Amount) <= 0) {
      toast.error("M-pesa Paid Amt is required");
      return;
    }
    setShowMpesa(true);
  };

  const handleConfirmOk = () => {
    setShowConfirm(false);
    if (pendingPayload) {
      handleSaveSmsEmailSave(
        pendingPayload.data,
        pendingPayload.saveSmsEmailArgument,
        true,
      );
      setPendingPayload(null); // clear pending payload
    }
  };

  const handleConfirmCancel = () => {
    setShowConfirm(false);
    setPendingPayload(null); // just discard
    setIsSubmit((prev) => ({ ...prev, isLoading: false }));
  };

  const isMpesaSelected = RcData?.some((item) => item.PaymentMode === "M-Pesa");

  const isHavingMpesa = RcData?.some(
    (item) => item.PaymentMode === "M-Pesa" && Number(item.Amount) > 0,
  );

  const mpesaData = RcData?.find((item) => item.PaymentMode === "M-Pesa");

  const mpesaAmount = mpesaData?.Amount;
  const mpesaCardNo = mpesaData?.CardNo;

  const updateTableWithPercent = (percent, netAmount) => {
    setTableData((prev) =>
      prev.map((item) => {
        const amount = Number(item?.Amount || 0);

        const patient = parseFloat(((amount * percent) / 100).toFixed(2));
        const panel = parseFloat((amount - patient).toFixed(2));

        console.log({ item })

        return {
          ...item,
          paybypatient: patient,
          paybypanel: panel,

        };
      }),
    );
  };

  const calculateFromPercent = (percent) => {
    const netAmount = Number(LTData?.NetAmount) || 0;

    if (percent > 100) percent = 100;
    if (percent < 0) percent = 0;

    const cleanPercent = parseFloat(percent.toFixed(2));
    setCoPaymentPercentage(cleanPercent);

    const patientTotal = parseFloat(
      ((netAmount * cleanPercent) / 100).toFixed(2),
    );
    const panelTotal = parseFloat((netAmount - patientTotal).toFixed(2));

    setPayByPatientTotal(patientTotal);
    setPayByPanelTotal(panelTotal);

    updateTableWithPercent(cleanPercent, netAmount);
  };
  const handlePercentageChange = (e) => {
    const percent = Number(e.target.value) || 0;
    calculateFromPercent(percent);
  };

  // const handlePanelChange = (value) => {
  //   const netAmount = Number(LTData?.NetAmount) || 0;
  //   let panelTotal = Number(value) || 0;

  //   if (panelTotal > netAmount) {
  //     toast.error("Panel amount cannot exceed Net Amount");
  //     return;
  //   }

  //   const patientTotal = netAmount - panelTotal;
  //   const percent = netAmount ? (patientTotal / netAmount) * 100 : 0;

  //   calculateFromPercent(percent);
  // };

  const handlePatientChange = (value) => {
    const netAmount = Number(LTData?.NetAmount) || 0;
    let patientTotal = Number(value) || 0;
    setCoPaymentPercentage("");
    if (patientTotal > netAmount) {
      toast.error("Patient amount cannot exceed Net Amount");
      setPayByPatientTotal(0)
      return;
    }

    const percent = netAmount ? (patientTotal / netAmount) * 100 : 0;
    const cleanPercent = parseFloat(percent.toFixed(5));

    setCoPaymentPercentage(cleanPercent);

    updateTableWithPercent(cleanPercent, netAmount);
  };

  // const handlePatientChange = (value) => {
  //   const netAmount = Number(LTData?.NetAmount) || 0;
  //   let patientTotal = Number(value) || 0;

  //   if (patientTotal > netAmount) {
  //     toast.error("Patient amount cannot exceed Net Amount");
  //     return;
  //   }

  //   const percent = netAmount ? (patientTotal / netAmount) * 100 : 0;
  //   const cleanPercent = parseFloat(percent.toFixed(2));

  //   updateTableWithPercent(cleanPercent, netAmount);

  //   setPayByPatientTotal(parseFloat(patientTotal.toFixed(2)));
  //   setPayByPanelTotal(parseFloat((netAmount - patientTotal).toFixed(2)));
  // };

  useEffect(() => {
    if (tableData.length === 0) {
      setCoPaymentPercentage(0);
    }
    setPayByPatientTotal(0);
    setCoPaymentPercentage(0);
  }, [tableData.length]);



  const relations = [
    { label: "Self", value: "Self" },
    { label: "Son", value: "Son" },
    { label: "Daughter", value: "Daughter" },
    { label: "Brother", value: "Brother" },
    { label: "Sister", value: "Sister" },
    { label: "Husband", value: "Husband" },
    { label: "Mother", value: "Mother" },
    { label: "Father", value: "Father" },
    { label: "Wife", value: "Wife" },
  ];

  // Mobile-only: the photo box + upload-document button + medical-history
  // button move from their usual spot (a column next to the main field
  // grid, far below the header) up into the "Registration Details"
  // header's right side, next to Membership No/Pre Booking No on the
  // left. Rendered in exactly one of the two spots depending on
  // isMobileView, never both — both spots use the same ids
  // (#profileImage/#uploadFile/#medicalHistory), and duplicate ids would
  // break isHideController/tooltip targeting.
  const isMobileView = typeof window !== "undefined" && window.innerWidth <= 768;

  const photoAndDocsField = (
    <>
      <div
        style={{
          border: "1px solid grey",
          borderRadius: "5px",
          textAlign: "center",
          ...(isMobileView
            ? { width: "60px", height: "60px", margin: "0 auto" }
            : {}),
        }}
        id="profileImage"
        className={`p-1 profile-image-container ${isMobileView ? "pr-photo-mobile" : ""} ${!isHideController("profileImaxge") && "d-none"}`}
      >
        <img
          src={patientImg.img}
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
          onDoubleClick={() => {
            setPatientImg({ ...patientImg, show: true });
          }}
        />
      </div>
      <div
        className="mb-1 d-flex justify-content-center"
        style={{ gap: "5px" }}
      >
        <div
          className={`p-1 ${!isHideController("uploadFile") && "d-none"}`}
          id="uploadFile"
        >
          <button
            className={`text-white rounded p-1 action-btn ${isMobileView ? "pr-action-btn-mobile" : ""} ${moreErrors?.uploadFile ? "mandatory_field" : ""}`}
            type="button"
            style={
              isMobileView
                ? { width: "30px", height: "26px", fontSize: "11px", padding: "2px" }
                : { width: "78%", fontSize: "11px", marginLeft: "5px", bottom: "5px" }
            }
            onClick={() => {
              setShow2(true);
            }}
          >
            <i class="fa fa-file" aria-hidden="true"></i>
          </button>
        </div>
        <div
          className={`p-1 ${!isHideController("medicalHistory") && "d-none"}`}
          id="medicalHistory"
        >
          <button
            className={`text-white rounded p-1 action-btn ${isMobileView ? "pr-action-btn-mobile" : ""}`}
            type="button"
            style={
              isMobileView
                ? { width: "30px", height: "26px", fontSize: "11px", padding: "2px" }
                : { width: "78%", fontSize: "11px", marginLeft: "5px", bottom: "5px" }
            }
            onClick={() => {
              handleClose3();
            }}
          >
            <i class="fa fa-h-square" aria-hidden="true"></i>
          </button>
        </div>
      </div>
    </>
  );

  return (
    <>
      {showTestModal && (
        <TestAlreadyHaveModal
          show={showTestModal}
          onHide={handleCancelTest}
          onContinue={handleContinueTest}
        />
      )}

      {showMpesa && (
        <MpesaModal
          show={showMpesa}
          onHide={() => setShowMpesa(false)}
          amount={mpesaAmount}
          Name={state?.FirstName}
          Id={documentId}
          centerId={LTData?.CentreID}
          centername={LTData?.CentreName}
          mobile={state.Mobile}
          countryMobLength={DefaultCurrencyName}
          onPaymentSuccess={(checkoutId) => {
            if (!checkoutId || checkoutId == "0") return;

            setRcData((prev) => {
              return prev.map((item) =>
                item.PaymentModeID == "1008"
                  ? { ...item, CardNo: checkoutId, isMpesaAuto: true }
                  : item,
              );
            });
            setShowMpesa(false);
          }}
        />
      )}
      {show3 && (
        <MedicialModal
          show={show3}
          setShow3={setShow3}
          handleClose={handleClose3}
          MedicalId={PatientGuid}
          handleUploadCount={handleUploadCount}
          gwtConditions={gwtConditions}
        />
      )}

      {show2 && (
        <UploadFile
          options={requiredAttachment}
          show={show2}
          setOldState={setState}
          oldState={state}
          handleClose={handleClose2}
          documentId={PatientGuid}
          guid={PatientGuid}
          pageName="Patient Registration"
          handleUploadCount={handleUploadCount}
          getDocumentType={getDocumentType}
          LedgerTransactionIDHash={documentId}
        />
      )}
      {mobleData.length > 0 &&
        show4 &&
        !Number(AllowAdvanceOldPatientSearchAtWorkOrder) && (
          <MobileDataModal
            show={show4}
            setShow={setShow4}
            mobleData={mobleData}
            handleClose4={handleClose4}
            handleSelctData={handleSelctData}
            handleCreateNewPatient={handleCreateNewPatient}
            state={state}
          />
        )}

      {mobleData.length > 0 &&
        show4 &&
        Number(AllowAdvanceOldPatientSearchAtWorkOrder) && (
          <AdvanceMobileDataModal
            show={show4}
            setShow={setShow4}
            mobleData={mobleData}
            handleClose4={handleClose4}
            handleSelctDataAdvance={handleSelctDataAdvance}
            handleCreateNewPatient={handleCreateNewPatient}
            state={state}
          />
        )}

      {show7 && (
        <MembershipModal
          show7={show7}
          data={Memberdata}
          handleclosemembership={handleclosemembershipmodal}
          handleSelectedData={handleSelectedData}
        />
      )}
      {patientImg.show && (
        <CameraModal
          visible={patientImg.show}
          guid={PatientGuid}
          pageName={"patientImage"}
          defaultImage={patientImg.img}
          handleClose={(guidNo, newUrl) => {
            setPatientImg({
              show: false,
              img: newUrl ? newUrl : MyImage,
            });
          }}
        />
      )}
      {show?.show && (
        <PatientRegisterModal
          show={show?.show}
          handleClose={handleClose}
          Type={show?.Type}
          onSuccess={
            show?.Type === "Secondary"
              ? refreshSecondDoctorSuggestion
              : refreshDoctorSuggestion
          }
        />
      )}
      {showRemark && (
        <SampleRemark
          show={showRemark}
          handleShow={handleShowRemark}
          state={LTData}
          PageName={LTData?.Remarks}
          handleSave={handleSaveremark}
          title={"Billing Remarks"}
        />
      )}
      {show6 && HidePRDM != 1 && (
        <SaveSmsEmail
          show6={show6}
          state={state}
          autoEmail={autoEmail}
          handleSaveSmsEmailSave={handleSaveSmsEmailSave}
          LTData={LTData}
          saveSmsEmail={saveSmsEmail}
          setSaveSmsEmail={setSaveSmsEmail}
          setShow6={setShow6}
        />
      )}
      {slotOpen?.show && (
        <SlotBookModal
          show={slotOpen?.show}
          slotOpen={slotOpen}
          setSlotOpen={setSlotOpen}
          handleSelectSlot={handleSelectSlot}
          LTData={LTData}
          tableData={tableData}
          patientState={state}
          centreName={selectedCentreType?.label}
        />
      )}
      {showOP && !Number(AllowAdvanceOldPatientSearchAtWorkOrder) && (
        <OldPatientSearchModal
          show={showOP}
          setShow={setShowOP}
          handleSelctData={handleSelctData}
          handleCreateNewPatient={handleCreateNewPatient}
          onMobileChange={setSearchMobile}
        />
      )}

      {showConfirm && (
        <PatientConfirmModal
          show={showConfirm}
          handleClose={handleConfirmCancel}
          handleConfirm={handleConfirmOk}
          patientData={state}
        />
      )}

      <div className="row g-2">
        <div className={showScanPanel ? "col-md-8" : "col-md-12"}>
          <MobileStepper stepLabels={["Registration", "Booking", "Payment"]}>
            <>
              <Heading
                isBreadcrumb={true}
                name={t("PatientRegistration")}
                mobileHeadingSuffix={
                  <span
                    onClick={() => {
                      setShowOP(true);
                      setShowDefault(false);
                    }}
                    className="fs-5 reload-icon-mobile"
                    style={{
                      cursor: "pointer",
                      backgroundColor: "#fff",
                      borderRadius: "50%",
                      padding: "5px",
                    }}
                  >
                    <i className="bi bi-arrow-clockwise mb-0"></i>
                  </span>
                }
                secondTitle={
                  <>
                    {AllowTRFUploadAndScan == 1 && <CustomButton
                      text={t("Scan TRF")}
                      className="btn-info text-white mx-2"
                      onClick={handleScanDocumentClick}
                      icon="image"
                    />}
                    {lastVisitNo?.length > 0 && (
                      <div
                        style={{ gap: "4px" }}
                        className="d-flex align-items-center flex-wrap"
                      >
                        <p className="mb-0">
                          <strong>Last Visit No: </strong>
                          <span>{lastVisitNo?.[0]?.LastVisitNo}</span>
                        </p>
                        |
                        <p className="mb-0">
                          <strong>Last Visit Date: </strong>{" "}
                          <span>{lastVisitNo?.[0]?.LastVisitDate}</span>
                        </p>
                      </div>
                    )}
                    {
                      <PageControlGear
                        pageId={PAGE_ID}
                        style={{ marginLeft: "auto" }}
                      />
                    }
                    <span
                      onClick={() => {
                        setShowOP(true);
                        setShowDefault(false);
                      }}
                      className="fs-5 reload-icon-mobile d-none d-md-inline-flex"
                      style={{
                        cursor: "pointer",
                        marginLeft: "10px",
                        marginTop: "5px",
                        backgroundColor: "#fff",
                        borderRadius: "50%",
                        padding: "5px",
                      }}
                    >
                      <i className="bi bi-arrow-clockwise mb-0"></i>
                    </span>
                  </>
                }
              />
              {

                showOP &&
                !showDefault &&
                Number(AllowAdvanceOldPatientSearchAtWorkOrder) && (
                  <>
                    <div className="row align-items-end mt-2">
                      <div className="col-12 col-md d-flex flex-wrap">
                        {controllerDynamicList
                          ?.sort((a, b) => a.DisplayOrder - b.DisplayOrder)
                          .map((item) => {
                            if (item?.ControlDisplayID === "CentreID") {
                              return (
                                <div
                                  key="CentreID"
                                  className={`col-sm-2 col-6 mb-1 ${!isHideController("CentreID") ? "d-none" : ""
                                    }`}
                                >
                                  <ReactSelect
                                    dynamicOptions={CentreData}
                                    name="CentreID"
                                    label={t("centre")}
                                    id="CentreID"
                                    removeIsClearable
                                    placeholderName={t("Centre")}
                                    value={LTData?.CentreID}
                                    onChange={handleSearchSelectChange}
                                    inputRef={(r) => (refs.CentreRef.current = r)}
                                    onKeyDown={(e) => handleKeyDown(e, "CentreID")}
                                    tabIndex={getTabIndex("CentreID")}
                                    className={`
                                ${getFieldErrorClass("CentreID")} 
                                ${!LTData?.CentreID && item?.IsMandatory ? "mandatory_field" : ""}
                              `}
                                  />
                                  {renderErrorMessage(
                                    "CentreID",
                                    item?.IsMandatory === 1,
                                  )}
                                </div>
                              );
                            }

                            if (item?.ControlDisplayID === "Visit") {
                              return (
                                <div
                                  key="Visit"
                                  className={`col-sm-2 col-6 mb-1 ${!isHideController("Visit") ? "d-none" : ""
                                    }`}
                                >
                                  <ReactSelect
                                    dynamicOptions={VisitTypeOptions}
                                    name="CentreType"
                                    label={t("Visit Type")}
                                    id="CentreType"
                                    removeIsClearable
                                    placeholderName={t("Visit Type")}
                                    value={LTData?.CentreType}
                                    onChange={handleSearchSelectChange}
                                    inputRef={(r) => (refs.CentreRef.current = r)}
                                    onKeyDown={(e) => handleKeyDown(e, "visit")}
                                    tabIndex={getTabIndex("Visit")}
                                    className={`
                                ${getFieldErrorClass("Visit")} 
                                ${!LTData?.CentreID && item?.IsMandatory ? "mandatory_field" : ""}
                              `}
                                  />
                                  {renderErrorMessage(
                                    "Visit",
                                    item?.IsMandatory === 1,
                                  )}
                                </div>
                              );
                            }

                            if (item?.ControlDisplayID === "RateID") {
                              return (
                                <>
                                  <div
                                    className={`col-sm-2 col-6 ${!isHideController("RateType") ? "d-none" : ""
                                      }`}
                                  >
                                    <UltraFastSelect
                                      options={[...RateType]}
                                      value={state?.RateID}
                                      onChange={handleSearchSelectChange}
                                      searchable={true}
                                      autoFocus={true}
                                      tabIndex={getTabIndex("RateID")}
                                      isDisabled={false}
                                      isClearable={true}
                                      onKeyDown={(e) => handleKeyDown(e, "RateID")}
                                      name="RateID"
                                      label={t("RateType")}
                                      id="RateID"
                                      className={`
                                ${getFieldErrorClass("RateID")} 
                                ${!state?.RateID && item?.IsMandatory ? "mandatory_field" : ""}`}
                                    />
                                  </div>
                                </>
                              );
                            }
                          })}
                      </div>
                      {/* <Tooltip label={t("Create New Patient")}> */}
                      <div className="col-12 col-md-auto d-flex justify-content-md-end mt-2 mt-md-0">
                        <CustomButton
                          // text="Create New"
                          icon="add"
                          className="w-100 w-md-auto mb-1"
                          onClick={handleNewPatient}
                          title={t("Create New Patient")}
                        />
                      </div>

                      {/* </Tooltip> */}
                    </div>
                  </>
                )
                // <div className="row">
                //   {controllerDynamicList
                //     ?.sort((a, b) => a.DisplayOrder - b.DisplayOrder)
                //     .map((item) => {
                //       if (item?.ControlDisplayID === "CentreID") {
                //         return (
                //           <div
                //             key="CentreID"
                //             className={`col-sm-2 col-12 mb-1 ${!isHideController("CentreID") ? "d-none" : ""
                //               }`}
                //           >
                //             <ReactSelect
                //               dynamicOptions={CentreData}
                //               name="CentreID"
                //               label={t("centre")}
                //               id="CentreID"
                //               removeIsClearable
                //               placeholderName={t("Centre")}
                //               value={LTData?.CentreID}
                //               onChange={handleSearchSelectChange}
                //               inputRef={(r) => (refs.CentreRef.current = r)}
                //               onKeyDown={(e) => handleKeyDown(e, "CentreID")}
                //               tabIndex={getTabIndex("CentreID")}
                //               className={`
                //                     ${getFieldErrorClass("CentreID")}
                //                     ${!LTData?.CentreID && item?.IsMandatory ? "mandatory_field" : ""}
                //                   `}
                //             />
                //             {renderErrorMessage("CentreID", item?.IsMandatory === 1)}
                //           </div>
                //         );
                //       }

                //       if (item?.ControlDisplayID === "RateID") {
                //         return (
                //           <>
                //             <div
                //               className={`col-sm-2 col-12 ${!isHideController("RateType") ? "d-none" : ""
                //                 }`}
                //             >
                //               <UltraFastSelect
                //                 options={[...RateType]}
                //                 value={state?.RateID}
                //                 onChange={handleSearchSelectChange}
                //                 searchable={true}
                //                 autoFocus={true}
                //                 tabIndex={getTabIndex("RateID")}
                //                 isDisabled={false}
                //                 isClearable={true}
                //                 onKeyDown={(e) => handleKeyDown(e, "RateID")}
                //                 name="RateID"
                //                 label={t("RateType")}
                //                 id="RateID"
                //                 className={`
                //                     ${getFieldErrorClass("RateID")}
                //                     ${!state?.RateID && item?.IsMandatory ? "mandatory_field" : ""}`}
                //               />
                //             </div>
                //           </>
                //         );
                //       }
                //     })}
                //     <CustomButton text="Create New" icon="add" className="rounded-15 mb-2 mt-1"
                //     onClick={handleNewPatient}
                //   />
                // </div>
              }

              {Number(AllowAdvanceOldPatientSearchAtWorkOrder) && showOP ? (
                <Accordion title={t("Search Old Patients")} defaultValue={true}>
                  <AdvanceOldPatientSearchModal
                    show={showOP}
                    setShow={setShowOP}
                    handleSelctData={handleSelctData}
                    centreID={LTData?.CentreID}
                    handleCreateNewPatient={handleCreateNewPatient}
                    handleResetCreateNewPatient={handleResetCreateNewPatient}
                    onMobileChange={setSearchMobile}
                  />
                </Accordion>
              ) : null}
              {showDefault && (
                <>
                  {/* Booking Lock Banner */}
                  {isBookingLocked && (
                    <>
                      <style>{`
                        @keyframes bookingLockPulse {
                          0%, 100% { box-shadow: 0 2px 8px rgba(230,126,34,0.15); }
                          50% { box-shadow: 0 4px 16px rgba(230,126,34,0.35); }
                        }
                      `}</style>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "12px",
                          background: "linear-gradient(135deg, #fff3cd 0%, #ffeaa7 100%)",
                          border: "1.5px solid #f39c12",
                          borderLeft: "5px solid #e67e22",
                          borderRadius: "8px",
                          padding: "12px 18px",
                          margin: "8px 0 4px 0",
                          boxShadow: "0 2px 8px rgba(230,126,34,0.15)",
                          animation: "bookingLockPulse 2s ease-in-out infinite",
                        }}
                      >
                        <span style={{ fontSize: "22px", flexShrink: 0, lineHeight: 1 }}>
                          🔒
                        </span>
                        <div style={{ flex: 1 }}>
                          <div
                            style={{
                              fontWeight: 700,
                              fontSize: "13px",
                              color: "#7d4a00",
                              letterSpacing: "0.2px",
                            }}
                          >
                            Booking Locked
                          </div>
                          <div
                            style={{
                              fontSize: "12.5px",
                              color: "#5c3500",
                              marginTop: "2px",
                            }}
                          >
                            <strong>
                              {bookingLockedRateTypeName || state?.RateTypeName || "Selected rate type"}
                            </strong>{" "}
                            has been locked for this booking.
                          </div>
                        </div>
                      </div>
                    </>
                  )}

                  {/* Doctor Notification Banner */}
                  {doctorNotification && (
                    <>
                      <style>{`
                        @keyframes doctorNotifyPulse {
                          0%, 100% { box-shadow: 0 2px 8px rgba(230,126,34,0.15); }
                          50% { box-shadow: 0 4px 16px rgba(230,126,34,0.35); }
                        }
                      `}</style>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "12px",
                          background: "linear-gradient(135deg, #fff3cd 0%, #ffeaa7 100%)",
                          border: "1.5px solid #f39c12",
                          borderLeft: "5px solid #e67e22",
                          borderRadius: "8px",
                          padding: "12px 18px",
                          margin: "8px 0 4px 0",
                          boxShadow: "0 2px 8px rgba(230,126,34,0.15)",
                          animation: "doctorNotifyPulse 2s ease-in-out infinite",
                        }}
                      >
                        <span style={{ fontSize: "22px", flexShrink: 0, lineHeight: 1 }}>
                          🔔
                        </span>
                        <div style={{ flex: 1 }}>
                          <div
                            style={{
                              fontWeight: 700,
                              fontSize: "13px",
                              color: "#7d4a00",
                              letterSpacing: "0.2px",
                            }}
                          >
                            Doctor Notification
                          </div>
                          <div
                            style={{
                              fontSize: "12.5px",
                              color: "#5c3500",
                              marginTop: "2px",
                            }}
                          >
                            {doctorNotification}
                          </div>
                        </div>
                      </div>
                    </>
                  )}

                  <Accordion
                    title={t("Registration Details")}
                    defaultValue={true}
                    className="mt-1"
                    notOpen={true}
                    seconTitle={(() => {
                      const registrationDetailsFieldsRow = (
                      <div className="row g-2 align-items-start">
                        {" "}
                        {/* 'row' allows horizontal alignment; 'g-2' is the gap */}
                        {controllerDynamicList
                          ?.sort((a, b) => a.DisplayOrder - b.DisplayOrder)
                          .map((item) => {
                            if (item?.ControlDisplayID == "fuhid") {
                              return (
                                <React.Fragment key="fuhid-wrapper">
                                <div
                                  className={`col-sm-2 col-6 mt-1 ${!isHideController("fuhid") && "d-none"}`}
                                >
                                  <div className="p-inputgroup d-flex">
                                    <div style={{ width: "87%" }}>
                                      <Input
                                        type="text"
                                        lable={t("Employee ID")}
                                        name="fuhid"
                                        placeholder=" "
                                        id="fuhid"
                                        value={fuhid}
                                        disabled={throughFamilyData}
                                        onChange={(e) => {
                                          setFuhid(e?.target?.value);
                                        }}
                                        onKeyDown={(e) => {
                                          handleFamilyUHIDKeyDown(e);
                                        }}
                                      />
                                    </div>
                                    <div style={{ width: "10%" }}>
                                      {throughFamilyData ? (
                                        <Tooltip label={t("Remove Employee ID")}>
                                          <button
                                            type="button"
                                            className="btn btn-sm btn-danger"
                                            onClick={() => {
                                              setFuhid("");
                                              setThroughFamilyData(false);
                                              setFamilyMemberDetails({});
                                              setIsPolicyPrescription(0);
                                            }}
                                          >
                                            <i className="fa fa-times fa-sm new_record_pluse"></i>
                                          </button>
                                        </Tooltip>
                                      ) : (
                                        <Tooltip label={t("Search Family Member")}>
                                          <button
                                            type="button"
                                            className="btn btn-sm btn-primary"
                                            onClick={() => {
                                              fetchFamilyMemberData();
                                            }}
                                          >
                                            <i className="fa fa-search fa-sm new_record_pluse"></i>
                                          </button>
                                        </Tooltip>
                                      )}
                                    </div>
                                  </div>
                                </div>
                                {throughFamilyData && (
                                  <div className="col-sm-2 col-6 mt-1 d-flex align-items-center">
                                    <label className="mb-0" style={{ fontSize: "12px", whiteSpace: "nowrap" }}>
                                      <input
                                        type="checkbox"
                                        className="mr-1"
                                        checked={isPolicyPrescription === 1}
                                        onChange={(e) =>
                                          handlePolicyPrescriptionToggle(e.target.checked)
                                        }
                                      />
                                      {t("With Prescription (Self FOC)")}
                                    </label>
                                  </div>
                                )}
                                </React.Fragment>
                              );
                            }
                            if (item?.ControlDisplayID == "PreBookingNo") {
                              return (
                                <div
                                  key="prebooking-wrapper"
                                  className="col-md-3 col-6 mt-1"
                                >
                                  {Category?.length > 0 ? (
                                    <div
                                      className={`${!isHideController("Category") && "d-none"}`}
                                    >
                                      <ReactSelect
                                        name="Category"
                                        className={`required-fields ${!LTData?.Category && item?.IsMandatory ? "mandatory_field" : ""}`}
                                        id="Category"
                                        dynamicOptions={Category}
                                        lable={t("Department Category")}
                                        placeholderName={t("Department Category")}
                                        value={LTData?.Category}
                                        onChange={handleSearchSelectChange}
                                        onKeyDown={(e) =>
                                          handleKeyDown(e, "Category")
                                        }
                                      />
                                      {LTData?.Category === "" && (
                                        <div className="error-message text-danger small">
                                          Category is required
                                        </div>
                                      )}
                                    </div>
                                  ) : (
                                    <div
                                      className={`${isHideController("PreBookingNo") ? "d-none" : ""} d-flex align-items-end`}
                                      style={{ gap: "4px" }}
                                    >
                                      <div className="flex-grow-1">
                                        <Input
                                          type="text"
                                          value={state?.PreBookingNo}
                                          disabled={
                                            throughMobileData || throughMemberData
                                          }
                                          lable={t("Pre Booking No")}
                                          name="PreBookingNo"
                                          className={`${!state?.PreBookingNo && item?.IsMandatory ? "mandatory_field" : ""}`}
                                          onChange={handleMainChange}
                                          placeholder=" "
                                          id="PreBookingNo"
                                          onKeyDown={(e) => {
                                            handleHMIS_PatCrNo(e, "PreBookingNo");
                                            handleKeyDown(e, "PreBookingNo");
                                          }}
                                          tabIndex={getTabIndex("PreBookingNo")}
                                        />
                                        {item?.IsMandatory === 1 &&
                                          moreErrors?.[item.ControlDisplayID] && (
                                            <div className="error-message text-danger small">
                                              {moreErrors[item.ControlDisplayID]}
                                            </div>
                                          )}
                                      </div>
                                      <button
                                        type="button"
                                        className="btn btn-sm btn-primary ms-1 mb-1 flex-shrink-0"
                                        style={{
                                          height: "33px",
                                          //  marginBottom: "9.8px",
                                          //   marginTop: "-8px",
                                        }}
                                        onClick={getPreBookingNo}
                                      >
                                        <i className="fa fa-search fa-sm"></i>
                                      </button>
                                    </div>
                                  )}
                                </div>
                              );
                            }

                            if (item?.ControlDisplayID == "MembershipNo") {
                              return (
                                <div
                                  key="membership-wrapper"
                                  className={`${!isHideController("MembershipNo") && "d-none"} col-md-3 col-12 mt-1`}
                                >
                                  <div className="d-flex align-items-end">
                                    <div className="flex-grow-1">
                                      <Input
                                        type="text"
                                        lable={t("Membership Number")}
                                        name="MembershipNo"
                                        placeholder=" "
                                        id="MembershipNo"
                                        value={membershipnum}
                                        disabled={throughMemberData}
                                        onChange={(e) => {
                                          setmembershipnum(e?.target?.value);
                                        }}
                                        tabIndex={getTabIndex("MembershipNo")}
                                        onKeyDown={(e) => {
                                          getMemberhipdata(e);
                                          handleKeyDown(e, "MembershipNo");
                                        }}
                                      />
                                    </div>
                                    <div
                                      className="ms-1 d-flex"
                                      style={{ marginBottom: "5px", gap: "4px" }}
                                    >
                                      {throughMemberData ? (
                                        <Tooltip label={t("Remove Membership")}>
                                          <button
                                            type="button"
                                            className="btn btn-sm btn-danger"
                                            onClick={handleMembershipcancel}
                                            style={{ height: "33px" }}
                                          >
                                            <i className="fa fa-times fa-sm"></i>
                                          </button>
                                        </Tooltip>
                                      ) : (
                                        <>
                                          <Tooltip
                                            label={t("Create New Membership Card")}
                                          >
                                            <button
                                              type="button"
                                              className="btn btn-sm btn-primary"
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                e.preventDefault();
                                                Navigate("/MembershipCardIssue");
                                              }}
                                              style={{ height: "33px" }}
                                            >
                                              <i className="fa fa-plus-circle fa-sm"></i>
                                            </button>
                                          </Tooltip>
                                          <Tooltip label={t("Search Membership")}>
                                            <button
                                              className="btn btn-primary btn-sm"
                                              type="button"
                                              style={{ height: "33px" }}
                                              onClick={fetchMembershipData}
                                            >
                                              <i className="fa fa-search"></i>
                                            </button>
                                          </Tooltip>
                                        </>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              );
                            }

                            if (item?.ControlDisplayID == "AccessionNo") {
                              return (
                                <div
                                  key="accession-wrapper"
                                  className={`${!isHideController("AccessionNo") && "d-none"} col-md-3 col-12 mt-1`}
                                >
                                  <div className="d-flex align-items-end gap-2">
                                    <div className="flex-grow-1">
                                      <Input
                                        type="text"
                                        value={accessionNo}
                                        lable={t("Accession No")}
                                        name="AccessionNo"
                                        placeholder=" "
                                        id="AccessionNo"
                                        disabled={gwtAccessionLocked}
                                        onChange={(e) => setAccessionNo(e.target.value)}
                                        onKeyDown={(e) => {
                                          if (e.which === 13) handleGetProcedureRequests();
                                        }}
                                      />
                                    </div>
                                    <button
                                      type="button"
                                      className="btn btn-sm btn-primary mb-1 flex-shrink-0"
                                      style={{ height: "33px" }}
                                      onClick={handleGetProcedureRequests}
                                    >
                                      <i className="fa fa-search fa-sm"></i>
                                    </button>
                                  </div>
                                </div>
                              );
                            }

                            if (item?.ControlDisplayID == "CouponCode") {
                              return (
                                <div
                                  key="coupon-wrapper"
                                  className={`${!isHideController("CouponCode") && "d-none"} col-md-3 col-12 mt-1`}
                                >
                                  <div className="d-flex align-items-end" style={{ gap: "3px" }}>
                                    <div className="flex-grow-1">
                                      <Input
                                        id="CouponCode"
                                        lable="Coupon Code"
                                        type="text"
                                        value={coupon.code}
                                        max={30}
                                        placeholder={" "}
                                        disabled={coupon.field}
                                        onChange={(e) =>
                                          setCoupon({
                                            ...coupon,
                                            code: e.target.value,
                                          })
                                        }
                                      />
                                    </div>
                                    {/* <button
                                      className="btn btn-primary btn-sm ms-1 rounded-15"
                                      type="button"
                                      style={{
                                        height: "33px",
                                        marginBottom: "3px",
                                      }}
                                      onClick={handleCouponDetailsModal}
                                    >
                                      <i className="fa fa-search"></i>
                                    </button> */}
                                    {coupon?.load ? (
                                      <Loading />
                                    ) :
                                      coupon.field ? (
                                        <CustomButton
                                          icon={"cancel"}
                                          id="btndeleterow"
                                          className="rounded-15 mt-0 mb-1"
                                          title={t("Cancel")}
                                          onClick={handleCouponCancel}
                                        />
                                      ) : (
                                        <CustomButton
                                          icon={"search"}
                                          className="rounded-15 mt-0 mb-1"
                                          title={t("Validate")}
                                          onClick={handleCouponValidate}
                                        />
                                      )}
                                  </div>
                                </div>
                              );
                            }
                            return null;
                          })}
                      </div>
                      );
                      return isMobileView ? (
                        <div className="d-flex w-100" style={{ gap: "10px" }}>
                          <div style={{ flex: "1 1 0", minWidth: 0 }}>
                            {registrationDetailsFieldsRow}
                          </div>
                          <div
                            style={{
                              flex: "0 0 auto",
                              display: "flex",
                              flexDirection: "column",
                              alignItems: "center",
                            }}
                          >
                            {photoAndDocsField}
                          </div>
                        </div>
                      ) : (
                        registrationDetailsFieldsRow
                      );
                    })()}
                  >
                    {/* <ValidationDebug /> */}
                    {/* Debug button to test validation */}
                    {/* <div className="mb-2">
              <button 
                type="button" 
                className="btn btn-sm btn-warning me-2"
                onClick={() => {
                  const result = validateDynamicFields();
                }}
              >
                Test Validation
              </button>
              <button 
                type="button" 
                className="btn btn-sm btn-info"
                onClick={() => {
                  setMoreErrors({});
                }}
              >
                Clear Errors
              </button>
            </div> */}
                    <div className="row pt-2 pl-2 pr-2 flex-md-row flex-column-reverse">
                      <div className="col-md-11 mb-2">
                        {/*Comment 1.  Ordering working well, but i thing some loigc not */}
                        <div className="row">
                          {controllerDynamicList
                            ?.sort((a, b) => a.DisplayOrder - b.DisplayOrder)
                            .map((itemOrigin) => {
                              const isCredit =
                                selectedRateType?.PayMode?.toUpperCase() ===
                                "CREDIT";
                              const item = {
                                ...itemOrigin,
                                IsMandatory: isCredit ? 0 : itemOrigin.IsMandatory,
                              };
                              if (item?.ControlDisplayID === "CentreID") {
                                return (
                                  <div
                                    key="CentreID"
                                    className={`col-sm-2 col-6 mb-1 ${!isHideController("CentreID") ? "d-none" : ""
                                      }`}
                                  >
                                    <ReactSelect
                                      dynamicOptions={CentreData}
                                      name="CentreID"
                                      // label={DefaultCurrencyName == "KES" ? t("Centre/Insurance") : t("Centre")}
                                      label={
                                        DefaultCurrencyName === "KES"
                                          ? t("Centre/Insurance")
                                          : t("Centre")
                                      }
                                      id="CentreID"
                                      removeIsClearable
                                      placeholderName={
                                        DefaultCurrencyName === "KES"
                                          ? t("Centre/Insurance")
                                          : t("Centre")
                                      }
                                      value={LTData?.CentreID}
                                      onChange={handleSearchSelectChange}
                                      inputRef={(r) => (refs.CentreRef.current = r)}
                                      onKeyDown={(e) =>
                                        handleKeyDown(e, "CentreID")
                                      }
                                      tabIndex={getTabIndex("CentreID")}
                                      className={`
                                ${getFieldErrorClass("CentreID")} 
                                ${!LTData?.CentreID && item?.IsMandatory ? "mandatory_field" : ""}
                              `}
                                    />
                                    {renderErrorMessage(
                                      "CentreID",
                                      item?.IsMandatory === 1,
                                    )}
                                  </div>
                                );
                              }

                              if (item?.ControlDisplayID === "RateID") {
                                return (
                                  <>
                                    <div
                                      className={`col-sm-2 col-6 ${!isHideController("RateType")
                                        ? "d-none"
                                        : ""
                                        }`}
                                    >
                                      <UltraFastSelect
                                        options={[...RateType]}
                                        value={state?.RateID}
                                        onChange={handleSearchSelectChange}
                                        searchable={true}
                                        autoFocus={true}
                                        tabIndex={getTabIndex("RateID")}
                                        isDisabled={false}
                                        isClearable={true}
                                        onKeyDown={(e) =>
                                          handleKeyDown(e, "RateID")
                                        }
                                        name="RateID"
                                        // label={t("RateType")}
                                        label={
                                          DefaultCurrencyName === "KES"
                                            ? t("RateType/Scheme/B2B")
                                            : t("RateType")
                                        }
                                        placeholderName={
                                          DefaultCurrencyName === "KES"
                                            ? t("RateType/Scheme/B2B")
                                            : t("RateType")
                                        }
                                        id="RateID"
                                        className={`
                                ${getFieldErrorClass("RateID")} 
                                ${!state?.RateID && item?.IsMandatory ? "mandatory_field" : ""}`}
                                      />
                                    </div>
                                  </>
                                );
                              }

                              if (item?.ControlDisplayID == "VisitType") {
                                return (
                                  <div
                                    className={`${!isHideController("VisitType") && "d-none"} col-sm-2 col-4`}
                                  >
                                    <ReactSelect
                                      name="VisitType"
                                      id="VisitType"
                                      removeIsClearable={true}
                                      dynamicOptions={VisitType}
                                      placeholderName={t("VisitType")}
                                      label={t("VisitType")}
                                      value={LTData?.VisitType}
                                      onChange={handleSearchSelectChange}
                                      inputRef={(r) =>
                                        (refs.RefDoctorRef.current = r)
                                      }
                                      // onKeyDown={(e) => handleFocusNext(e, "RefDoctorRef")}
                                      onKeyDown={(e) =>
                                        handleKeyDown(e, "VisitType")
                                      }
                                      tabIndex={getTabIndex("VisitType")}
                                      className={`
                                ${!LTData?.VisitType && item?.IsMandatory ? "mandatory_field" : ""}
                              `}
                                    />
                                    {item?.IsMandatory === 1 &&
                                      moreErrors?.[item.ControlDisplayID] && (
                                        <div className="error-message text-danger small">
                                          {moreErrors[item.ControlDisplayID]}
                                        </div>
                                      )}
                                  </div>
                                );
                              }

                              if (item?.ControlDisplayID === "RegistrationDate") {
                                return (
                                  <div
                                    key="RegistrationDate"
                                    className={`col-sm-2 col-6 mb-1 ${!isHideController("RegistrationDate")
                                      ? "d-none"
                                      : ""
                                      }`}
                                  >
                                    <DatePicker
                                      className={`custom-calendar ${!LTData?.RegistrationDate && item?.IsMandatory ? "mandatory_field" : ""}`}
                                      id="RegistrationDate"
                                      name="RegistrationDate"
                                      lable={t("Registration Date")}
                                      placeholder="DD-MM-YYYY"
                                      value={
                                        LTData?.RegistrationDate
                                          ? new Date(LTData.RegistrationDate)
                                          : new Date()
                                      }
                                      onChange={dateSelect}
                                      onKeyDown={(e) =>
                                        handleKeyDown(e, "RegistrationDate")
                                      }
                                      tabIndex={getTabIndex("RegistrationDate")}
                                    />
                                    {item?.IsMandatory === 1 &&
                                      moreErrors?.[item.ControlDisplayID] && (
                                        <div className="error-message text-danger small">
                                          {moreErrors[item.ControlDisplayID]}
                                        </div>
                                      )}
                                  </div>
                                );
                              }

                              if (item?.ControlDisplayID == "PatientCode") {
                                return (
                                  <div
                                    className={`${!isHideController("PatientCode") && "d-none"} col-sm-2 col-4`}
                                  >
                                    <Input
                                      type="text"
                                      lable={t("UHID")}
                                      max={15}
                                      disabled={
                                        state?.Mobile && CompanyCode !== "DMC"
                                      }
                                      value={state?.PatientCode}
                                      name="PatientCode"
                                      className={`${CompanyCode === "DMC" ? "required-fields" : ""} ${!state?.PatientCode && item?.IsMandatory ? "mandatory_field" : ""}`}
                                      // onInput={DefaultCurrencyName === "KES" ? undefined : (e) => number(e, 15)}
                                      placeholder=" "
                                      id="PatientCode"
                                      onChange={handleMainChange}
                                      // onKeyDown={(e) => handlePatientData(e, "PatientCode")}
                                      onKeyDown={(e) => {
                                        handlePatientData(e, "PatientCode");
                                        handleKeyDown(e, "PatientCode");
                                      }}
                                      tabIndex={getTabIndex("PatientCode")}
                                    />
                                    {item?.IsMandatory === 1 &&
                                      moreErrors?.[item.ControlDisplayID] && (
                                        <div className="error-message text-danger small">
                                          {moreErrors[item.ControlDisplayID]}
                                        </div>
                                      )}
                                  </div>
                                );
                              }

                              if (item?.ControlDisplayID == "SampleBy") {
                                return (
                                  <div
                                    className={`${!isHideController("SampleBy") && "d-none"} col-sm-2 col-6`}
                                  >
                                    <ReactSelect
                                      name="SampleBy"
                                      id="SampleBy"
                                      removeIsClearable={true}
                                      dynamicOptions={SampleSource}
                                      placeholderName={t("SampleBy")}
                                      label={t("SampleBy")}
                                      value={LTData?.SampleBy}
                                      onChange={handleSearchSelectChange}
                                      inputRef={(r) =>
                                        (refs.RefDoctorRef.current = r)
                                      }
                                      // onKeyDown={(e) => handleFocusNext(e, "RefDoctorRef")}
                                      onKeyDown={(e) =>
                                        handleKeyDown(e, "SampleBy")
                                      }
                                      tabIndex={getTabIndex("SampleBy")}
                                      className={`
                                ${!LTData?.SampleBy && item?.IsMandatory ? "mandatory_field" : ""}
                              `}
                                    />
                                    {item?.IsMandatory === 1 &&
                                      moreErrors?.[item.ControlDisplayID] && (
                                        <div className="error-message text-danger small">
                                          {moreErrors[item.ControlDisplayID]}
                                        </div>
                                      )}
                                  </div>
                                );
                              }

                              // if (item?.ControlDisplayID == "PreBookingNo") {
                              //   return (
                              //     <>
                              //       {Category?.length > 0 ? (
                              //         <div
                              //           className={`${!isHideController("Category") && "d-none"} col-sm-2 col-12`}
                              //         >
                              //           <ReactSelect
                              //             name="Category"
                              //             className={`required-fields ${!LTData?.Category && item?.IsMandatory ? "mandatory_field" : ""}`}
                              //             id="Category"
                              //             dynamicOptions={Category}
                              //             lable={t("Department Category")}
                              //             placeholderName={t("Department Category")}
                              //             value={LTData?.Category}
                              //             onChange={handleSearchSelectChange}
                              //             onKeyDown={(e) => handleKeyDown(e, "Category")}
                              //           />
                              //           {LTData?.Category === "" && (
                              //             <div className="error-message text-danger small">
                              //               Category is required
                              //             </div>
                              //           )}
                              //         </div>
                              //       ) : (
                              //         <div
                              //           className={`${!isHideController("PreBookingNo") && "d_none"} col-sm-2 col-12 d-flex`}
                              //         >
                              //           <div style={{ width: "87%" }}>
                              //             <Input
                              //               type="text"
                              //               value={state?.PreBookingNo}
                              //               disabled={throughMobileData || throughMemberData}
                              //               lable={t("Pre Booking No")}
                              //               name="PreBookingNo"
                              //               className={`${!state?.PreBookingNo && item?.IsMandatory ? "mandatory_field" : ""}`}
                              //               onChange={handleMainChange}
                              //               placeholder=" "
                              //               id="PreBookingNo"
                              //               onKeyDown={(e) => {
                              //                 handleHMIS_PatCrNo(e, "PreBookingNo");
                              //                 handleKeyDown(e, "PreBookingNo");
                              //               }}
                              //               tabIndex={getTabIndex("PreBookingNo")}
                              //             />
                              //             {item?.IsMandatory === 1 && moreErrors?.[item.ControlDisplayID] && (
                              //               <div className="error-message text-danger small">{moreErrors[item.ControlDisplayID]}</div>
                              //             )}
                              //           </div>
                              //           <div style={{ width: "10%" }}>
                              //             <button
                              //               type="button"
                              //               className="btn btn-sm btn-primary"
                              //               onClick={getPreBookingNo}
                              //             >
                              //               <i className="fa fa-plus-circle fa-sm new_record_pluse"></i>
                              //             </button>
                              //           </div>
                              //         </div>
                              //       )}
                              //     </>
                              //   )
                              // }
                              // if (item?.ControlDisplayID == "MembershipNo") {
                              //   return (
                              //     <div
                              //       className={`${!isHideController("MembershipNo") && "d-none"} col-sm-2 col-12`}
                              //     >
                              //       <div className="p-inputgroup d-flex">
                              //         <div style={{ width: "87%" }}>
                              //           <Input
                              //             type="text"
                              //             lable={t("Membership Number")}
                              //             name="MembershipNo"
                              //             placeholder=" "
                              //             id="MembershipNo"
                              //             value={membershipnum}
                              //             disabled={throughMemberData}
                              //             className={`${!membershipnum && item?.IsMandatory ? "mandatory_field" : ""}`}
                              //             onChange={(e) => {
                              //               setmembershipnum(e?.target?.value);
                              //             }}
                              //             tabIndex={getTabIndex("MembershipNo")}
                              //             onKeyDown={(e) => {
                              //               getMemberhipdata(e);
                              //               handleKeyDown(e, "MembershipNo");
                              //             }}
                              //           />
                              //           {item?.IsMandatory === 1 && moreErrors?.[item.ControlDisplayID] && (
                              //             <div className="error-message text-danger small">{moreErrors[item.ControlDisplayID]}</div>
                              //           )}
                              //         </div>
                              //         <div style={{ width: "10%" }}>
                              //           {throughMemberData ? (
                              //             <Tooltip label={t("Remove Membership")}>
                              //               <button
                              //                 type="button"
                              //                 className="btn btn-sm btn-primary"
                              //                 onClick={handleMembershipcancel}
                              //               >
                              //                 <i className="fa fa-times fa-sm new_record_pluse"></i>
                              //               </button>
                              //             </Tooltip>
                              //           ) : (
                              //             <Tooltip label={t("Create New Membership Card")}>
                              //               <button
                              //                 type="button"
                              //                 className="btn btn-sm btn-primary"
                              //                 // onClick={() => {
                              //                 //   Navigate("/MembershipCardMaster");
                              //                 // }}
                              //                 onClick={(e) => getMemberhipdata(e, membershipnum)}
                              //               >
                              //                 <i className="fa fa-plus-circle fa-sm new_record_pluse"></i>
                              //               </button>
                              //             </Tooltip>
                              //           )}
                              //         </div>
                              //       </div>
                              //     </div>
                              //   )
                              // }
                              if (item?.ControlDisplayID == "Mobile") {
                                return (
                                  <div
                                    className={`${!isHideController("Mobile") && "d-none"} col-sm-2 col-6`}
                                  >
                                    <div className="d-flex">
                                      <div style={{ width: "86%" }}>
                                        <Input
                                          name="Mobile"
                                          inputRef={inputRef}
                                          className={`${LTData?.BTB != 1 && LTData?.SUBPCC != 1 && selectedRateType?.IsMobileRequired == 1 && isB2B !== "B2B" ? "required-fields" : ""}
                                      
                                    ${getFieldErrorClass("Mobile")} 
                                    ${!state.Mobile && (item?.IsMandatory || moreErrors?.Mobile) && isB2B !== "B2B" ? "mandatory_field" : ""}
                                  `}
                                          id="Mobile"
                                          value={state.Mobile}
                                          disabled={
                                            throughMobileData ||
                                            throughMemberData ||
                                            (AllowAdvanceOldPatientSearchAtWorkOrder ==
                                              1 &&
                                              (state?.PatientCode ||
                                                isMobileSearchSelected))
                                          }
                                          onChange={handleMainChange}
                                          type="text"
                                          inputMode="numeric"
                                          lable={t("Mobile Number")}
                                          placeholder={t(" ")}
                                          required={item?.IsMandatory == 1 && isB2B !== "B2B"}
                                          tabIndex={getTabIndex("Mobile")}
                                          // onKeyDown={(e) => handlePatientData(e, "Mobile")}
                                          onKeyDown={(e) => {
                                            handlePatientData(e, "Mobile");
                                            handleKeyDown(e, "Mobile");
                                          }}
                                          ariaInvalid={!!moreErrors?.Mobile}
                                          ariaDescribedBy={
                                            moreErrors?.Mobile ? "Mobile-error" : undefined
                                          }
                                        />
                                        {moreErrors?.Mobile && (
                                          <div
                                            className="error-message text-danger small"
                                            id="Mobile-error"
                                            role="alert"
                                          >
                                            {moreErrors.Mobile}
                                          </div>
                                        )}
                                      </div>
                                      <div style={{ width: "10%" }}>
                                        <button
                                          type="button"
                                          className="btn btn-sm btn-primary"
                                          onClick={handleShowMobile}
                                        >
                                          <i className="fa fa-plus-circle fa-sm new_record_pluse"></i>
                                        </button>
                                      </div>
                                    </div>
                                  </div>
                                );
                              }
                              if (item?.ControlDisplayID == "SecondaryMobile") {
                                return (
                                  <div
                                    className={`${!isHideController("SecondaryMobile") && "d-none"} col-sm-2 col-6 mb-1`}
                                  >
                                    <Input
                                      type="number"
                                      lable={t("Phone")}
                                      name="SecondaryMobile"
                                      placeholder={t(" ")}
                                      id="SecondaryMobile"
                                      value={SecondaryMobile}
                                      className={`${!SecondaryMobile && item?.IsMandatory ? "mandatory_field" : ""}`}
                                      onChange={handleMainChange}
                                      tabIndex={getTabIndex("SecondaryMobile")}
                                      onKeyDown={(e) => {
                                        handleKeyDown(e, "SecondaryMobile");
                                      }}
                                      ariaInvalid={!!moreErrors?.SecondaryMobile}
                                      ariaDescribedBy={
                                        moreErrors?.SecondaryMobile
                                          ? "SecondaryMobile-error"
                                          : undefined
                                      }
                                    />
                                    {moreErrors?.SecondaryMobile && (
                                      <div
                                        className="error-message text-danger small"
                                        id="SecondaryMobile-error"
                                        role="alert"
                                      >
                                        {moreErrors.SecondaryMobile}
                                      </div>
                                    )}
                                  </div>
                                );
                              }
                              if (item?.ControlDisplayID == "Title") {
                                return (
                                  <div
                                    className={`${!isHideController("Title") && "d-none"} col-sm-2 col-12 mb-1`}
                                  >
                                    <div className="d-flex">
                                      <div className="" style={{ width: "40%" }}>
                                        {/* <ReactSelect //title_custom
                                  dynamicOptions={Title}
                                  name="Title"
                                  id="Title"
                                  lable={t("Title")}
                                  placeholderName={t("Title")}
                                  isDisabled={throughMobileData || throughMemberData}
                                  value={state?.Title}
                                  onChange={handleSearchSelectChange}
                                  tabIndex={getTabIndex("Title")}
                                  removeIsClearable={true}
                                  onKeyDown={(e) => handleKeyDown(e, "Title")}
                                  className={`${ !state?.Title && item?.IsMandatory ? "mandatory_field" : "" }`}
                                  searchable={false}
                                /> */}
                                        <SelectBox
                                          tabIndex={getTabIndex("Title")}
                                          lable={t("Title")}
                                          id="Title"
                                          name="Title"
                                          options={Title}
                                          selectedValue={state?.Title}
                                          required
                                          onChange={handleTitleChange}
                                          isDisabled={
                                            throughMobileData || throughMemberData
                                          }
                                          onKeyDown={(e) =>
                                            handleKeyDown(e, "Title")
                                          }
                                          className={`required-fields ${!state?.Title && item?.IsMandatory ? "mandatory_field" : ""}`}
                                        />
                                        {moreErrors["Title"] && (
                                          <span className="error-message mb-2">
                                            {moreErrors["Title"]}
                                          </span>
                                        )}
                                      </div>
                                      <div style={{ width: "60%" }}>
                                        <Input
                                          name="FirstName"
                                          className={`required-fields ${getFieldErrorClass("FirstName")} 
                                    ${!state.FirstName && !!hideSpecificField("FirstName")?.IsMandatory ? "mandatory_field" : ""}
                                  `}
                                          type="text"
                                          id="FirstName"
                                          lable={t("First Name")}
                                          placeholder={t(" ")}
                                          disabled={
                                            throughMobileData || throughMemberData
                                          }
                                          value={state?.FirstName}
                                          onChange={handleMainChange}
                                          required
                                          tabIndex={getTabIndex("FirstName")}
                                          onKeyDown={(e) =>
                                            handleKeyDown(e, "FirstName")
                                          }
                                          ariaInvalid={!!moreErrors?.FirstName}
                                          ariaDescribedBy={
                                            moreErrors?.FirstName
                                              ? "FirstName-error"
                                              : undefined
                                          }
                                        />
                                        {moreErrors?.FirstName && (
                                          <div
                                            className="error-message text-danger small"
                                            id="FirstName-error"
                                            role="alert"
                                          >
                                            {moreErrors.FirstName}
                                          </div>
                                        )}
                                        {renderErrorMessage(
                                          "FirstName",
                                          item?.IsMandatory === 1,
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                );
                              }
                              if (item?.ControlDisplayID == "MiddleName") {
                                return (
                                  <div
                                    className={`${!isHideController("MiddleName") && "d-none"} col-sm-2 col-6 mb-1`}
                                  >
                                    <Input
                                      type="text"
                                      lable={t("Middle Name")}
                                      name="MiddleName"
                                      placeholder={t(" ")}
                                      id="MiddleName"
                                      value={state?.MiddleName}
                                      disabled={
                                        throughMobileData || throughMemberData
                                      }
                                      max={35}
                                      className={`${!state?.MiddleName && item?.IsMandatory ? "mandatory_field" : ""}`}
                                      onChange={handleMainChange}
                                      tabIndex={getTabIndex("MiddleName")}
                                      onKeyDown={(e) => {
                                        someMethodWithoutAccessToEvent(
                                          e,
                                          "LastName",
                                        );
                                        handleKeyDown(e, "MiddleName");
                                      }}
                                    />
                                    {item?.IsMandatory === 1 &&
                                      moreErrors?.[item.ControlDisplayID] && (
                                        <div className="error-message text-danger small">
                                          {moreErrors[item.ControlDisplayID]}
                                        </div>
                                      )}
                                  </div>
                                );
                              }
                              if (item?.ControlDisplayID == "LastName") {
                                return (
                                  <div
                                    className={`${!isHideController("LastName") && "d-none"} col-sm-2 col-6`}
                                  >
                                    <Input
                                      type="text"
                                      lable={t("Last Name")}
                                      name="LastName"
                                      placeholder={t(" ")}
                                      id="LastName"
                                      value={state?.LastName}
                                      disabled={
                                        throughMobileData || throughMemberData
                                      }
                                      className={`${!state?.LastName && item?.IsMandatory ? "mandatory_field" : ""} ${moreErrors?.LastName ? "error border-danger" : ""}`}
                                      onChange={handleMainChange}
                                      tabIndex={getTabIndex("LastName")}
                                      onKeyDown={(e) =>
                                        handleKeyDown(e, "LastName")
                                      }
                                      maxLength={LAST_NAME_MAX_LENGTH}
                                      ariaInvalid={!!moreErrors?.LastName}
                                      ariaDescribedBy={
                                        moreErrors?.LastName ? "LastName-error" : undefined
                                      }
                                    />
                                    {moreErrors?.LastName && (
                                      <div
                                        className="error-message text-danger small"
                                        id="LastName-error"
                                        role="alert"
                                      >
                                        {moreErrors.LastName}
                                      </div>
                                    )}
                                  </div>
                                );
                              }
                              if (item?.ControlDisplayID == "ReferLabId") {
                                return (
                                  <div
                                    className={`${!isHideController("ReferLabId") && "d_none"} col-sm-2 col-6 d-flex`}
                                  >
                                    <div
                                      className="col-sm flex-grow-1 px-0 mb-1"
                                      style={{ width: "90%", position: "relative" }}
                                    >
                                      <Input
                                        tabIndex={getTabIndex("ReferLabId")}
                                        id="ReferLabId"
                                        name="ReferLabId"
                                        lable={t("Ref Lab")}
                                        type="text"
                                        value={refLabSearchText}
                                        className={`required-fields ${!LTData?.ReferLabId && item?.IsMandatory ? "mandatory_field" : ""}`}
                                        onChange={(e) => {
                                          const text = e.target.value;
                                          setRefLabSearchText(text);
                                          setIndexMatch(0);
                                          setLTData((prev) => ({ ...prev, ReferLabId: "" }));
                                          if (!text.trim()) {
                                            setRefLabSuggestions([]);
                                            setRefLabDropShow(false);
                                            return;
                                          }
                                          setRefLabDropShow(true);
                                          const searchLower = text.toLowerCase();
                                          setRefLabSuggestions(
                                            refLabList
                                              .filter((r) =>
                                                (r.label || "").toLowerCase().includes(searchLower)
                                              )
                                              .sort((a, b) => {
                                                const aL = (a.label || "").toLowerCase();
                                                const bL = (b.label || "").toLowerCase();
                                                const aStarts = aL.startsWith(searchLower);
                                                const bStarts = bL.startsWith(searchLower);
                                                if (aStarts && !bStarts) return -1;
                                                if (!aStarts && bStarts) return 1;
                                                return aL.localeCompare(bL);
                                              })
                                          );
                                          clearValidationError("ReferLabId");
                                        }}
                                        onBlur={() => {
                                          setRefLabDropShow(false);
                                          setRefLabSuggestions([]);
                                          setIndexMatch(-1);
                                          setLTData((prev) => {
                                            if (!prev.ReferLabId) {
                                              setRefLabSearchText("");
                                            }
                                            return prev;
                                          });
                                        }}
                                        onKeyDown={(e) => {
                                          handleIndex(e);
                                          handleKeyDown(e, "ReferLabId");
                                        }}
                                      />
                                      {refLabDropShow && refLabSuggestions.length > 0 && (
                                        <ul
                                          className="suggestion-data"
                                          style={{
                                            zIndex: 9999,
                                            width: "100%",
                                            position: "absolute",
                                            top: "100%",
                                            left: 0,
                                            background: "white",
                                            padding: 0,
                                            margin: 0,
                                            listStyle: "none",
                                            boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
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
                                                setLTData((prev) => ({ ...prev, ReferLabId: lab.value }));
                                                setRefLabSearchText(lab.label);
                                                setRefLabDropShow(false);
                                                setRefLabSuggestions([]);
                                                setIndexMatch(-1);
                                                clearValidationError("ReferLabId");
                                              }}
                                              className={index === indexMatch ? "matchIndex" : ""}
                                              style={{
                                                padding: "4px 8px",
                                                cursor: "pointer",
                                                backgroundColor: index === indexMatch ? "blue" : "white",
                                                color: index === indexMatch ? "white" : "inherit",
                                              }}
                                            >
                                              {lab.label}
                                            </li>
                                          ))}
                                        </ul>
                                      )}
                                      {item?.IsMandatory === 1 &&
                                        moreErrors?.[item.ControlDisplayID] && (
                                          <div className="error-message text-danger small">
                                            {moreErrors[item.ControlDisplayID]}
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
                              if (item?.ControlDisplayID == "DoctorName") {
                                return (
                                  <div
                                    className={`${!isHideController("DoctorName") && "d-none"} col-sm-2 ${DefaultCurrencyName === "KES" ? "col-11" : "col-6"}`}
                                  >
                                    <div
                                      className="p-inputgroup d-flex"
                                      style={{ position: "relative" }}
                                    >
                                      <div style={{ width: DefaultCurrencyName === "KES" ? "100%" : "87%" }}>
                                        <Input
                                          tabIndex={getTabIndex("DoctorName")}
                                          className={`required-fields ${!formData?.DoctorName && item?.IsMandatory ? "mandatory_field" : ""}`}
                                          id="DoctorName"
                                          name="DoctorName"
                                          lable={t("Referred Doctor")}
                                          onChange={(e) => {
                                            const val = e.target.value;
                                            // Typing "others" locks in the fixed
                                            // sentinel doctor (ID 2 / "Others")
                                            // instantly and opens a modal for
                                            // the actual doctor name
                                            // (LTData.OtherDoctorName) instead of
                                            // requiring a suggestion pick.
                                            const isOthers =
                                              val.trim().toLowerCase() === "others";
                                            setFormData((prev) => ({
                                              ...prev,
                                              DoctorName: val,
                                            }));
                                            setLTData((prev) => ({
                                              ...prev,
                                              DoctorName: isOthers ? "Others" : val,
                                              DoctorID: isOthers ? "2" : "",
                                              DoctorMobile: "",
                                              DoctorEmail: "",
                                              OtherDoctorName: isOthers
                                                ? prev.OtherDoctorName
                                                : "",
                                            }));
                                            setDoctorNotification("");
                                            if (!val.trim() || isOthers) {
                                              // Field cleared, or "Others" just
                                              // got locked in — close dropdown
                                              // immediately so Tab/blur don't
                                              // accidentally re-select an old item.
                                              setDoctorSuggestion([]);
                                              setDropFalse(false);
                                              setIndexMatch(-1);
                                            } else {
                                              setDropFalse(true);
                                            }
                                            if (isOthers) {
                                              setShowOtherDoctorModal(true);
                                            }
                                          }}
                                          onBlur={() => {
                                            setIndexMatch(-1);
                                            setDoctorSuggestion([]);
                                            setDropFalse(false);
                                            // Use functional updater to read the
                                            // latest LTData — avoids stale closure.
                                            setLTData((prev) => {
                                              if (!prev.DoctorID) {
                                                setFormData((fd) => ({ ...fd, DoctorName: "" }));
                                                setDoctorNotification("");
                                                return { ...prev, DoctorName: "", DoctorMobile: "", DoctorEmail: "", OtherDoctorName: "" };
                                              }
                                              return prev;
                                            });
                                          }}
                                          value={formData?.DoctorName}
                                          onKeyDown={handleIndex}
                                          placeholder={t(" ")}
                                          type="text"
                                        />
                                        {dropFalse &&
                                          doctorSuggestion.length > 0 && (() => {
                                            const suggestionThStyle = {
                                              padding: "10px 16px",
                                              textAlign: "left",
                                              whiteSpace: "nowrap",
                                              background: "#f0f2f5",
                                              color: "#344054",
                                              fontWeight: 600,
                                              fontSize: "12px",
                                              textTransform: "uppercase",
                                              letterSpacing: "0.02em",
                                              borderBottom: "1px solid #d0d5dd",
                                              borderRight: "1px solid #e4e7ec",
                                            };
                                            const suggestionThLastStyle = { ...suggestionThStyle, borderRight: "none" };
                                            const suggestionTdStyle = {
                                              padding: "10px 16px",
                                              whiteSpace: "nowrap",
                                              borderBottom: "1px solid #eef0f2",
                                              borderRight: "1px solid #eef0f2",
                                            };
                                            const suggestionTdLastStyle = { ...suggestionTdStyle, borderRight: "none" };
                                            return (
                                            <div
                                              className="suggestion-data"
                                              style={{
                                                zIndex: 9999,
                                                width: "max-content",
                                                minWidth: "100%",
                                                maxWidth: "90vw",
                                                position: "absolute",
                                                top: "100%",
                                                left: 0,
                                                background: "white",
                                                margin: 0,
                                                borderRadius: "8px",
                                                boxShadow:
                                                  "0 8px 20px rgba(16,24,40,0.15)",
                                                border: "1px solid #d0d5dd",
                                              }}
                                            >
                                            <table
                                              style={{
                                                width: "100%",
                                                borderCollapse: "collapse",
                                                fontSize: "13px",
                                              }}
                                            >
                                              <thead>
                                                <tr>
                                                  <th style={suggestionThStyle}>{t("Name")}</th>
                                                  <th style={suggestionThStyle}>{t("Mobile")}</th>
                                                  <th style={suggestionThStyle}>{t("Department")}</th>
                                                  <th style={suggestionThStyle}>{t("Specialization")}</th>
                                                  <th style={suggestionThStyle}>{t("ProEmployee")}</th>
                                                  <th style={suggestionThLastStyle}>{t("ProEmployee Number")}</th>
                                                </tr>
                                              </thead>
                                              <tbody>
                                                {doctorSuggestion.map(
                                                  (data, index) => {
                                                    const dept =
                                                      data?.Department ||
                                                      data?.DeptName ||
                                                      data?.DepartmentName ||
                                                      data?.dept ||
                                                      data?.DoctorDepartment ||
                                                      data?.DeptlName ||
                                                      "";

                                                    const spec =
                                                      data?.Specialization ||
                                                      data?.Speciality ||
                                                      data?.Speclization ||
                                                      data?.spec ||
                                                      data?.SpecializationName ||
                                                      "";

                                                    return (
                                                      <tr
                                                        key={index}
                                                        onMouseDown={(e) => {
                                                          e.preventDefault();
                                                          handleListSearch(
                                                            data,
                                                            "DoctorName",
                                                          );
                                                        }}
                                                        className={`${index === indexMatch ? "matchIndex" : ""}`}
                                                        style={{
                                                          cursor: "pointer",
                                                          color:
                                                            index === indexMatch
                                                              ? "white"
                                                              : "black",
                                                          backgroundColor:
                                                            index === indexMatch
                                                              ? "#4aa0fcff"
                                                              : "white",
                                                        }}
                                                      >
                                                        <td style={suggestionTdStyle}>{data?.Name}</td>
                                                        <td style={suggestionTdStyle}>{data?.Mobile}</td>
                                                        <td style={suggestionTdStyle}>{dept}</td>
                                                        <td style={suggestionTdStyle}>{spec}</td>
                                                        <td style={suggestionTdStyle}>{data?.ProEmployee}</td>
                                                        <td style={suggestionTdLastStyle}>{data?.ProEmployeeNumber}</td>
                                                      </tr>
                                                    );
                                                  },
                                                )}
                                              </tbody>
                                            </table>
                                            </div>
                                            );
                                          })()}
                                      </div>
                                      {DefaultCurrencyName !== "KES" && (<div style={{ width: "10%" }}>
                                        <Tooltip label={t("Add Referred Doctor")}>
                                          <button
                                            type="button"
                                            className="btn btn-sm btn-primary"
                                            onClick={() => handleShow("Refer")}
                                          >
                                            <i className="fa fa-plus-circle fa-sm new_record_pluse"></i>
                                          </button>
                                        </Tooltip>
                                      </div>)}


                                    </div>

                                    {item?.IsMandatory === 1 &&
                                      moreErrors?.[item.ControlDisplayID] && (
                                        <div className="error-message text-danger small">
                                          {moreErrors[item.ControlDisplayID]}
                                        </div>
                                      )}
                                    {formData.DoctorName !== "" &&
                                      formData?.DoctorID === "" && (
                                        <div className="error-message text-danger small">
                                          Doctor is required
                                        </div>
                                      )}
                                  </div>
                                );
                              }
                              if (item?.ControlDisplayID == "ReferDoctorRemark" && DefaultCurrencyName === "KES") {
                                return (
                                  <div
                                    className={`${!isHideController("ReferDoctorRemark") && "d-none"} col-sm-2 col-6`}
                                  >
                                    <Input
                                      className={`required-fields ${!LTData?.ReferDoctorRemarks ? "mandatory_field" : ""}`}
                                      id="ReferDoctorRemarks"
                                      name="ReferDoctorRemarks"
                                      lable={t("ReferDoctorRemarks")}
                                      onChange={(e) => {
                                        const value = e.target.value;
                                        setLTData(prev => ({
                                          ...prev,
                                          ReferDoctorRemarks: value,
                                        }));
                                      }}
                                      value={LTData?.ReferDoctorRemarks}
                                      placeholder={t(" ")}
                                      maxLength={50}
                                      type="text"
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

                              if (DefaultCurrencyName === "KES") {
                                if (item?.ControlDisplayID === "DoctorNameAddButton") {
                                  return (
                                    <div
                                      className={`${!isHideController("DoctorNameAddButton") && "d-none"
                                        }`}
                                    >
                                      <div
                                      >
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
                                  );
                                }
                                "";
                              }

                              if (item?.ControlDisplayID == "DOB") {
                                return (
                                  <div
                                    className={`${!isHideController("DOB") && "d-none"} col-sm-2 col-4`}
                                  >
                                    {DefaultCurrencyName === "NPR" ? (
                                      <NepaliDatePicker
                                        tabIndex={getTabIndex("DOB")}
                                        value={state?.DOB}
                                        className={`custom-calendar ${!state?.DOB && item?.IsMandatory ? "mandatory_field" : ""} ${moreErrors?.DOB ? "error border-danger" : ""}`}
                                        name="DOB"
                                        disabled={throughMobileData || throughMemberData}
                                        id="DOB"
                                        lable={t("DOB")}
                                        maxDate={new Date()}
                                        onChange={dateSelect}
                                        onKeyDown={(e) => handleKeyDown(e, "DOB")}
                                      />
                                    ) : (
                                      <DatePicker
                                        tabIndex={getTabIndex("DOB")}
                                        showOnFocus={false}
                                        value={state?.DOB}
                                        className={`custom-calendar ${!state?.DOB && item?.IsMandatory ? "mandatory_field" : ""}`}
                                        name="DOB"
                                        disabled={
                                          throughMobileData || throughMemberData
                                        }
                                        placeholder={t("DOB")}
                                        id="DOB"
                                        lable={t("DOB")}
                                        maxDate={new Date()}
                                        dateFormat="dd/mm/yy"
                                        onChange={dateSelect}
                                        onKeyDown={(e) => handleKeyDown(e, "DOB")}
                                        invalid={!!moreErrors?.DOB}
                                        inputClassName={moreErrors?.DOB ? "error border-danger" : ""}
                                        required
                                      />
                                    )}
                                    {moreErrors?.DOB && (
                                      <div
                                        className="error-message text-danger small"
                                        id="DOB-error"
                                        role="alert"
                                      >
                                        {moreErrors.DOB}
                                      </div>
                                    )}
                                  </div>
                                );
                              }
                              if (item?.ControlDisplayID == "AgeYear") {
                                return (
                                  <div className="col-sm-2 col-4">
                                    <div className="p-inputgroup flex-1">
                                      <div
                                        className={`flex-grow-1 ${!isHideController("AgeYear") && "d-none"}`}
                                      >
                                        <Input
                                          tabIndex={getTabIndex("AgeYear")}
                                          type="number"
                                          className={`required-fields w-100 ${getFieldErrorClass("AgeYear")} ${!state?.AgeYear && item?.IsMandatory ? "mandatory_field" : ""} ${moreErrors?.AgeYear ? "error border-danger" : ""}`}
                                          lable={t("Years")}
                                          name="AgeYear"
                                          value={state?.AgeYear}
                                          min={0}
                                          max={AGE_YEAR_MAX}
                                          disabled={
                                            throughMemberData || throughMobileData
                                          }
                                          onChange={handleDOBCalculation}
                                          id={"AgeYear"}
                                          onKeyDown={(e) =>
                                            handleKeyDown(e, "AgeYear")
                                          }
                                          ariaInvalid={!!moreErrors?.AgeYear}
                                          ariaDescribedBy={
                                            moreErrors?.AgeYear ? "AgeYear-error" : undefined
                                          }
                                          required
                                        />
                                        {moreErrors?.AgeYear && (
                                          <div
                                            className="error-message text-danger small"
                                            id="AgeYear-error"
                                            role="alert"
                                          >
                                            {moreErrors.AgeYear}
                                          </div>
                                        )}
                                      </div>
                                      <div
                                        className={`${!isHideController("AgeYear") || (!hideSpecificField("AgeMonth")?.IsShow && "d-none")}`}
                                      >
                                        <Input
                                          tabIndex={getTabIndex("AgeMonth")}
                                          type="number"
                                          // placeholder={t("Months")}
                                          lable={t("Months")}
                                          name="AgeMonth"
                                          id={"AgeMonth"}
                                          className={`required-fields ${getFieldErrorClass("AgeMonth")} ${!state?.AgeMonth && !!hideSpecificField("AgeMonth")?.IsMandatory ? "mandatory_field" : ""} ${moreErrors?.AgeMonth ? "error border-danger" : ""}`}
                                          value={state?.AgeMonth}
                                          min={0}
                                          max={AGE_MONTH_MAX}
                                          disabled={
                                            throughMemberData || throughMobileData
                                          }
                                          onChange={handleDOBCalculation}
                                          onKeyDown={(e) =>
                                            handleKeyDown(e, "AgeMonth")
                                          }
                                          ariaInvalid={!!moreErrors?.AgeMonth}
                                          ariaDescribedBy={
                                            moreErrors?.AgeMonth ? "AgeMonth-error" : undefined
                                          }
                                        />
                                        {moreErrors?.AgeMonth && (
                                          <div
                                            className="error-message text-danger small"
                                            id="AgeMonth-error"
                                            role="alert"
                                          >
                                            {moreErrors.AgeMonth}
                                          </div>
                                        )}
                                      </div>
                                      <div
                                        className={`${!isHideController("AgeYear") || (!hideSpecificField("AgeDays")?.IsShow && "d-none")}`}
                                      >
                                        <Input
                                          tabIndex={getTabIndex("AgeDays")}
                                          // placeholder={t("Days")}
                                          lable={t("Days")}
                                          type="number"
                                          className={`required-fields ${getFieldErrorClass("AgeDays")} ${!state?.AgeDays && !!hideSpecificField("AgeDays")?.IsMandatory ? "mandatory_field" : ""} ${moreErrors?.AgeDays ? "error border-danger" : ""}`}
                                          name="AgeDays"
                                          id={"AgeDays"}
                                          value={state?.AgeDays}
                                          min={0}
                                          max={AGE_DAY_MAX}
                                          disabled={
                                            throughMemberData || throughMobileData
                                          }
                                          onChange={handleDOBCalculation}
                                          onKeyDown={(e) =>
                                            handleKeyDown(e, "AgeDays")
                                          }
                                          ariaInvalid={!!moreErrors?.AgeDays}
                                          ariaDescribedBy={
                                            moreErrors?.AgeDays ? "AgeDays-error" : undefined
                                          }
                                        />
                                        {moreErrors?.AgeDays && (
                                          <div
                                            className="error-message text-danger small"
                                            id="AgeDays-error"
                                            role="alert"
                                          >
                                            {moreErrors.AgeDays}
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                    {item?.IsMandatory === 1 &&
                                      moreErrors?.[item.ControlDisplayID] && (
                                        <div className="error-message text-danger small">
                                          {moreErrors[item.ControlDisplayID]}
                                        </div>
                                      )}
                                  </div>
                                );
                              }
                              if (
                                item?.ControlDisplayID == "AgeMonth" ||
                                item?.ControlDisplayID == "AgeDays"
                              ) {
                                return null;
                              }
                              if (item?.ControlDisplayID == "Gender") {
                                return (
                                  <div
                                    className={`${!isHideController("Gender") && "d-none"} col-sm-2 col-4 mb-1`}
                                  >
                                    <SelectBox
                                      tabIndex={getTabIndex("Gender")}
                                      options={Gender}
                                      name="Gender"
                                      id="Gender"
                                      lable={t("Gender")}
                                      className={`${!state?.Gender && item?.IsMandatory ? "mandatory_field" : ""}`}
                                      isDisabled={
                                        [
                                          "",
                                          "canine",
                                          "baby",
                                          "baby of",
                                          "baby of",
                                          "babyof",
                                          "babyof",
                                          "master",
                                          "b/o",
                                          "b/0",
                                          "c/o",
                                          "s/o",
                                          "other",
                                          "dr.",
                                          "baby of.",
                                          "dog",
                                          "cat",
                                          "feline",
                                          "equine",
                                          "porcine",
                                          "bovine",
                                          "avian",
                                          "caprine",
                                          "ovine",

                                        ].includes(
                                          state?.Title?.toLocaleLowerCase(),
                                        )
                                          ? false
                                          : state?.Title || state?.Title === ""
                                            ? true
                                            : false
                                      }
                                      selectedValue={state?.Gender}
                                      onChange={handleMainChange}
                                      onKeyDown={(e) => handleKeyDown(e, "Gender")}
                                    />
                                    {item?.IsMandatory === 1 &&
                                      moreErrors?.[item.ControlDisplayID] && (
                                        <div className="error-message text-danger small">
                                          {moreErrors[item.ControlDisplayID]}
                                        </div>
                                      )}
                                    {item?.IsMandatory === 1 &&
                                      moreErrors?.[item.ControlDisplayID] && (
                                        <div className="error-message text-danger small">
                                          {moreErrors[item.ControlDisplayID]}
                                        </div>
                                      )}
                                  </div>
                                );
                              }
                              if (item?.ControlDisplayID == "CollectionBoyId") {
                                return (
                                  <div
                                    className={`${!isHideController("CollectionBoyId") && "d-none"} col-sm-2 col-4`}
                                  >
                                    <ReactSelect
                                      tabIndex={getTabIndex("CollectionBoyId")}
                                      name="CollectionBoyId"
                                      id="CollectionBoyId"
                                      dynamicOptions={[
                                        {
                                          label: t("Select Collection Boy"),
                                          value: "",
                                        },
                                        ...CollectionBoy,
                                      ]}
                                      placeholderName={t("Collection Boy")}
                                      // isDisabled={true}
                                      value={LTData?.CollectionBoyId}
                                      onChange={handleSearchSelectChange}
                                      onKeyDown={(e) =>
                                        handleKeyDown(e, "CollectionBoyId")
                                      }
                                      className={`${!LTData?.CollectionBoyId && item?.IsMandatory ? "mandatory_field" : ""}`}
                                    />
                                    {item?.IsMandatory === 1 &&
                                      moreErrors?.[item.ControlDisplayID] && (
                                        <div className="error-message text-danger small">
                                          {moreErrors[item.ControlDisplayID]}
                                        </div>
                                      )}
                                  </div>
                                );
                              }

                              if (item?.ControlDisplayID == "IdType") {
                                return (
                                  <div
                                    className={`${!isHideController("IdType") && "d-none"} col-sm-2 col-12`}
                                  >
                                    <div className="d-flex">
                                      <div style={{ width: "40%" }}>
                                        <SelectBox
                                          tabIndex={getTabIndex("IdType")}
                                          name="PatientIDProof"
                                          options={[
                                            { label: t("Choose ID"), value: "" },
                                            ...Identity,
                                          ]}
                                          selectedValue={LTData?.PatientIDProof}
                                          id="IdType"
                                          lable={t("Id Type")}
                                          className={`${!LTData?.PatientIDProof && item?.IsMandatory ? "mandatory_field" : ""}`}
                                          onChange={handleSelectChange}
                                          onKeyDown={(e) =>
                                            handleKeyDown(e, "IdType")
                                          }
                                        />
                                      </div>
                                      <div style={{ width: "60%" }}>
                                        <Input
                                          tabIndex={getTabIndex("PatientIDProofNo")}
                                          name="PatientIDProofNo"
                                          type="text"
                                          maxLength={isAadhaarIdType(LTData?.PatientIDProof) ? 12 : isPanIdType(LTData?.PatientIDProof) ? 10 : 20}
                                          onChange={handleLTData}
                                          onInput={handleIdProofInput}
                                          onBlur={handleIdProofBlur}
                                          disabled={!String(LTData?.PatientIDProof || "").trim()}
                                          value={LTData?.PatientIDProofNo}
                                          id="PatientIDProofNo"
                                          lable={t("Patient ID Proof")}
                                          placeholder={t("")}
                                          onKeyDown={handleIdProofKeyDown}
                                          ariaInvalid={!!moreErrors?.PatientIDProofNo}
                                          ariaDescribedBy={
                                            moreErrors?.PatientIDProofNo
                                              ? "PatientIDProofNo-error"
                                              : undefined
                                          }
                                          className={`${!LTData?.PatientIDProofNo && item?.IsMandatory ? "mandatory_field" : ""} ${moreErrors?.PatientIDProofNo ? "error border-danger" : ""}`}
                                        />
                                        {moreErrors?.PatientIDProofNo && (
                                          <div
                                            className="error-message text-danger small"
                                            id="PatientIDProofNo-error"
                                            role="alert"
                                          >
                                            {moreErrors.PatientIDProofNo}
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                    {item?.IsMandatory === 1 &&
                                      moreErrors?.[item.ControlDisplayID] &&
                                      item.ControlDisplayID !== "IdType" && (
                                        <div className="error-message text-danger small">
                                          {moreErrors[item.ControlDisplayID]}
                                        </div>
                                      )}
                                  </div>
                                );
                              }
                              if (item?.ControlDisplayID == "SecondReferDoctor") {
                                return (
                                  <div
                                    className={`${!isHideController("SecondReferDoctor") && "d-none"} col-sm-2 col-12`}
                                  >
                                    <div
                                      className="p-inputgroup d-flex"
                                      style={{ position: "relative" }}
                                    >
                                      <div style={{ width: "87%" }}>
                                        <Input
                                          tabIndex={-1}
                                          id="SecondReferDoctor"
                                          name="SecondReferDoctor"
                                          lable={t("Second Ref. Doctor")}
                                          placeholder={t("")}
                                          type="text"
                                          value={formData?.SecondReferDoctor}
                                          className={`${!formData?.SecondReferDoctor && item?.IsMandatory ? "mandatory_field" : ""}`}
                                          onChange={(e) => {
                                            setFormData((prev) => ({
                                              ...prev,
                                              SecondReferDoctor: e.target.value,
                                            }));
                                            setLTData((prev) => ({
                                              ...prev,
                                              SecondReferDoctor: "",
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
                                          seconddoctorSuggestion.length > 0 && (
                                            <ul
                                              className="suggestion-data"
                                              style={{
                                                zIndex: 9999,
                                                width: "100%",
                                                position: "absolute",
                                                top: "100%",
                                                left: 0,
                                                background: "white",
                                                padding: 0,
                                                margin: 0,
                                                listStyle: "none",
                                                boxShadow:
                                                  "0 4px 6px rgba(0,0,0,0.1)",
                                                border: "1px solid #ddd",
                                              }}
                                            >
                                              {seconddoctorSuggestion.map(
                                                (data, index) => {
                                                  const dept =
                                                    data?.Department ||
                                                    data?.DeptName ||
                                                    data?.DepartmentName ||
                                                    data?.dept ||
                                                    data?.DoctorDepartment ||
                                                    data?.DeptlName ||
                                                    "";

                                                  const spec =
                                                    data?.Specialization ||
                                                    data?.Speciality ||
                                                    data?.Speclization ||
                                                    data?.spec ||
                                                    data?.SpecializationName ||
                                                    "";

                                                  const pattern =
                                                    item?.DropDownPattern ||
                                                    "{Name}";

                                                  const separatorMatch =
                                                    pattern.match(/}\s*(.*?)\s*{/);
                                                  const separator = separatorMatch
                                                    ? separatorMatch[1]
                                                    : " ";

                                                  const keys =
                                                    pattern
                                                      .match(/{(.*?)}/g)
                                                      ?.map((key) =>
                                                        key
                                                          .replace(/[{}]/g, "")
                                                          .trim(),
                                                      ) || [];

                                                  const fieldMap = {
                                                    name: data?.Name,
                                                    mobile: data?.Mobile,
                                                    dept: dept,
                                                    spec: spec,
                                                  };

                                                  const displayString = keys
                                                    .map(
                                                      (key) =>
                                                        fieldMap[key.toLowerCase()],
                                                    )
                                                    .filter(
                                                      (value) =>
                                                        value &&
                                                        String(value).trim() !==
                                                        "" &&
                                                        value !== 0 &&
                                                        value !== "0",
                                                    )
                                                    .join(separator);

                                                  return (
                                                    <li
                                                      key={index}
                                                      onMouseDown={(e) => {
                                                        e.preventDefault();
                                                        handleListSearch(
                                                          data,
                                                          "SecondReferDoctor",
                                                        );
                                                      }}
                                                      className={`${index === indexMatch ? "matchIndex" : ""}`}
                                                      style={{
                                                        padding: "4px",
                                                        cursor: "pointer",
                                                        color:
                                                          index === indexMatch
                                                            ? "white"
                                                            : "black",
                                                        backgroundColor:
                                                          index === indexMatch
                                                            ? "#4aa0fcff"
                                                            : "white",
                                                      }}
                                                    >
                                                      {displayString}
                                                    </li>
                                                  );
                                                },
                                              )}
                                            </ul>
                                          )}
                                      </div>

                                      <div style={{ width: "10%" }}>
                                        <Tooltip label={t("Add SecondReferDoctor")}>
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
                                  </div>
                                );
                              }

                              if (item?.ControlDisplayID == "Email") {
                                return (
                                  <div
                                    className={`${!isHideController("Email") && "d-none"} col-sm-2 col-12`}
                                  >
                                    <Input
                                      type="text"
                                      lable={t("Email")}
                                      name="Email"
                                      placeholder={t("")}
                                      id="Email"
                                      value={state?.Email}
                                      className={`${(!state?.Email && (item?.IsMandatory || moreErrors?.Email)) || moreErrors?.Email ? "mandatory_field" : ""} ${moreErrors?.Email ? "error border-danger is-invalid" : ""}`}
                                      onChange={handleMainChange}
                                      onBlur={(e) => {
                                        const emailCheck = validateEmail(
                                          e?.target?.value ?? state?.Email,
                                        );
                                        setMoreErrors((prev) => {
                                          const next = { ...prev };
                                          if (emailCheck.isValid) delete next.Email;
                                          else next.Email = emailCheck.message;
                                          return next;
                                        });
                                      }}
                                      onKeyDown={(e) => handleKeyDown(e, "Email")}
                                      ariaInvalid={!!moreErrors?.Email}
                                      ariaDescribedBy={
                                        moreErrors?.Email ? "Email-error" : undefined
                                      }
                                    />
                                    {moreErrors?.Email && (
                                      <div
                                        className="error-message text-danger small"
                                        id="Email-error"
                                        role="alert"
                                      >
                                        {moreErrors.Email}
                                      </div>
                                    )}
                                  </div>
                                );
                              }
                              if (item?.ControlDisplayID == "ClientRefNumber") {
                                return (
                                  <div
                                    className={`${!isHideController("ClientRefNumber") && "d-none"} col-sm-2 col-12`}
                                  >
                                    <Input
                                      type="text"
                                      lable={t("ClientRefNumber")}
                                      name="ClientRefNumber"
                                      placeholder={t("")}
                                      id="ClientRefNumber"
                                      value={LTData?.ClientRefNumber}
                                      maxLength={25}
                                      className={`${!LTData?.ClientRefNumber && item?.IsMandatory ? "mandatory_field" : ""}`}
                                      onChange={(e) => {
                                        clearValidationError("ClientRefNumber");
                                        setLTData((prev) => ({
                                          ...prev,
                                          ClientRefNumber: e.target.value,
                                        }));
                                      }}
                                      onKeyDown={(e) =>
                                        handleKeyDown(e, "ClientRefNumber")
                                      }
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
                                item?.ControlDisplayID ==
                                "OtherLabReferenceLabNumber"
                              ) {
                                return (
                                  <div
                                    className={`${!isHideController("OtherLabReferenceLabNumber") && "d-none"} col-sm-2 col-12`}
                                  >
                                    <Input
                                      type="text"
                                      lable={t("OtherLabReferenceNumber")}
                                      name="OtherLabReferenceLabNumber"
                                      placeholder={t("")}
                                      id="OtherLabReferenceLabNumber"
                                      value={LTData?.OtherLabReferenceLabNumber}
                                      maxLength={25}
                                      className={`${!LTData?.OtherLabReferenceLabNumber && item?.IsMandatory ? "mandatory_field" : ""}`}
                                      onChange={(e) => {
                                        clearValidationError(
                                          "OtherLabReferenceLabNumber",
                                        );
                                        setLTData((prev) => ({
                                          ...prev,
                                          OtherLabReferenceLabNumber:
                                            e.target.value,
                                        }));
                                      }}
                                      onKeyDown={(e) =>
                                        handleKeyDown(
                                          e,
                                          "OtherLabReferenceLabNumber",
                                        )
                                      }
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
                                    className={`${!isHideController("PinCode") && "d-none"} col-sm-2 col-6`}
                                  >
                                    <Input
                                      lable={t("Pincode")}
                                      type="number"
                                      name="PinCode"
                                      placeholder={t("")}
                                      onInput={(e) => number(e, 6)}
                                      id="PinCode"
                                      value={state?.PinCode}
                                      className={`${!state?.PinCode && (item?.IsMandatory || moreErrors?.PinCode) ? "mandatory_field" : ""}`}
                                      onChange={handleMainChange}
                                      onKeyDown={(e) => handleKeyDown(e, "PinCode")}
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
                              if (item?.ControlDisplayID == "nikshayID") {
                                return (
                                  <div
                                    className={`${!isHideController("nikshayID") && "d-none"} col-sm-2 col-12`}
                                  >
                                    <Input
                                      lable={t("Nikshay ID")}
                                      type="text"
                                      name="nikshayID"
                                      placeholder={t("")}
                                      // onInput={(e) => number(e, 6)}
                                      id="nikshayID"
                                      value={state?.nikshayID}
                                      className={`${!state?.nikshayID && item?.IsMandatory ? "mandatory_field" : ""}`}
                                      onChange={handleMainChange}
                                      onKeyDown={(e) =>
                                        handleKeyDown(e, "nikshayID")
                                      }
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
                              if (item?.ControlDisplayID == "Locality") {
                                return (
                                  <div
                                    className={`${!isHideController("Locality") && "d-none"} col-sm-2 col-12`}
                                  >
                                    <Input
                                      lable={t("Locality")}
                                      max={30}
                                      type="text"
                                      value={state?.Locality}
                                      onChange={handleMainChange}
                                      name="Locality"
                                      placeholder={t("")}
                                      id="Locality"
                                      className={`${!state?.Locality && item?.IsMandatory ? "mandatory_field" : ""}`}
                                      onKeyDown={(e) =>
                                        handleKeyDown(e, "Locality")
                                      }
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
                              if (item?.ControlDisplayID == "Weight") {
                                return (
                                  <div
                                    className={`${!isHideController("Weight") && "d-none"} col-sm-2 col-12`}
                                  >
                                    <Input
                                      lable={t("Weight(Kg)")}
                                      type="text"
                                      value={state?.Weight}
                                      onChange={handleMainChange}
                                      name="Weight"
                                      placeholder={t("")}
                                      id="Weight"
                                      ariaInvalid={!!moreErrors?.Weight}
                                      className={`${!state?.Weight && (item?.IsMandatory || moreErrors?.Weight) ? "mandatory_field" : ""} ${moreErrors?.Weight ? "error border-danger" : ""}`}
                                      onKeyDown={(e) => handleKeyDown(e, "Weight")}
                                    />
                                    {moreErrors?.Weight && (
                                      <div
                                        className="error-message text-danger small"
                                        id="Weight-error"
                                        role="alert"
                                      >
                                        {moreErrors.Weight}
                                      </div>
                                    )}
                                  </div>
                                );
                              }
                              if (item?.ControlDisplayID == "Height") {
                                return (
                                  <div
                                    className={`${!isHideController("Height") && "d-none"} col-sm-2 col-12`}
                                  >
                                    <Input
                                      lable={t("Height(cm)")}
                                      max={30}
                                      type="text"
                                      value={state?.Height}
                                      onChange={handleMainChange}
                                      name="Height"
                                      placeholder={t("")}
                                      id="Height"
                                      className={`${!state?.Height && (item?.IsMandatory || moreErrors?.Height) ? "mandatory_field" : ""}`}
                                      onKeyDown={(e) => handleKeyDown(e, "Height")}
                                    />
                                    {renderErrorMessage(
                                      "Height",
                                      item?.IsMandatory === 1,
                                    )}
                                  </div>
                                );
                              }
                              if (item?.ControlDisplayID == "BMI") {
                                return (
                                  <div
                                    className={`${!isHideController("BMI") && "d-none"} col-sm-2 col-12`}
                                  >
                                    <Input
                                      lable={t("BMI")}
                                      max={30}
                                      type="text"
                                      value={state?.BMI}
                                      onChange={handleMainChange}
                                      name="BMI"
                                      placeholder={t("")}
                                      id="BMI"
                                      className={`${!state?.BMI && item?.IsMandatory ? "mandatory_field" : ""}`}
                                      onKeyDown={(e) => handleKeyDown(e, "BMI")}
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
                              if (item?.ControlDisplayID == "H-UIHD") {
                                return (
                                  <div
                                    className={`${!isHideController("H-UIHD") && "d-none"} col-sm-2 col-12`}
                                  >
                                    <Input
                                      lable={t("H-UIHD")}
                                      max={30}
                                      type="text"
                                      value={state?.H_UIHD}
                                      onChange={handleMainChange}
                                      name="H-UIHD"
                                      placeholder={t("")}
                                      id="H-UIHD"
                                      className={`${!state?.H_UIHD && item?.IsMandatory ? "mandatory_field" : ""}`}
                                      onKeyDown={(e) => handleKeyDown(e, "H-UIHD")}
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
                              if (item?.ControlDisplayID == "H-VisitNo") {
                                return (
                                  <div
                                    className={`${!isHideController("H-VisitNo") && "d-none"} col-sm-2 col-12`}
                                  >
                                    <Input
                                      lable={t("H-VisitNo")}
                                      max={30}
                                      type="text"
                                      value={state?.H_VisitNo}
                                      onChange={handleMainChange}
                                      name="H-VisitNo"
                                      placeholder={t("")}
                                      id="H-VisitNo"
                                      className={`${!state?.H_VisitNo && item?.IsMandatory ? "mandatory_field" : ""}`}
                                      onKeyDown={(e) =>
                                        handleKeyDown(e, "H-VisitNo")
                                      }
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
                                    className={`${!isHideController("City") && "d-none"} col-sm-2 col-6 mt-2 mt-sm-0`}
                                    onKeyDown={(e) => handleKeyDown(e, "City")}
                                    onBlur={(e) => {
                                      if (e.currentTarget.contains(e.relatedTarget)) return;
                                      handleCityBlur(e);
                                    }}
                                  >
                                    {/* <Input
                                  max={30}
                                  type="text"
                                  value={state?.City}
                                  onChange={handleMainChange}
                                  lable={t(item?.ControlDisplayName)}
                                  name="City"
                                  placeholder={t("")}
                                  id="City"
                                  className={`${!state?.City && item?.IsMandatory ? "mandatory_field" : ""}`}
                                  onKeyDown={(e) => handleKeyDown(e, "City")}
                                /> */}
                                    <AutoComplete
                                      style={{ width: "100%" }}
                                      value={autoCompleteCity || state?.City || ""}
                                      suggestions={Cities}
                                      completeMethod={(e) =>
                                        getCityDropDown(getResolvedStateId(), e.query)
                                      }
                                      onSelect={handleAutoCompleteSelect("City")}
                                      id="City_AutoComplete"
                                      inputId="City"
                                      name="City"
                                      field="City"
                                      delay={0}
                                      minLength={1}
                                      forceSelection
                                      inputRef={cityInputRef}
                                      onChange={(e) => applyCityTypedValue(e.value)}
                                      onBlur={handleCityBlur}
                                      itemTemplate={cityTemplate}
                                      inputClassName={moreErrors?.City ? "error border-danger" : ""}
                                      aria-invalid={moreErrors?.City ? "true" : undefined}
                                    />
                                    <label
                                      htmlFor="City"
                                      className="lable searchtest"
                                    >
                                      {t(item?.ControlDisplayName)}
                                    </label>
                                    {moreErrors?.City && (
                                      <div
                                        className="error-message text-danger small"
                                        id="City-error"
                                        role="alert"
                                      >
                                        {moreErrors.City}
                                      </div>
                                    )}
                                  </div>
                                );
                              }
                              if (item?.ControlDisplayID == "State") {
                                return (
                                  <div
                                    className={`${!isHideController("State") && "d-none"} col-sm-2 col-6`}
                                    onKeyDown={(e) => handleKeyDown(e, "State")}
                                  >
                                    {/* <Input
                                  type="text"
                                  lable={t(item?.ControlDisplayName)}
                                  name="State"
                                  placeholder={t("")}
                                  id="State"
                                  max={30}
                                  value={state?.State}
                                  className={`${!state?.State && item?.IsMandatory ? "mandatory_field" : ""}`}
                                  onChange={handleMainChange}
                                  onKeyDown={(e) => handleKeyDown(e, "State")}
                                /> */}

                                    <AutoComplete
                                      style={{ width: "100%" }}
                                      value={autoCompleteState || state?.State || ""}
                                      suggestions={States}
                                      completeMethod={(e) =>
                                        getStates(getResolvedCountryId(), e.query)
                                      }
                                      onSelect={handleAutoCompleteSelect("State")}
                                      id="State_AutoComplete"
                                      inputId="State"
                                      name="State"
                                      field="State"
                                      delay={0}
                                      minLength={1}
                                      forceSelection
                                      onChange={(e) => applyStateTypedValue(e.value)}
                                      onBlur={handleStateBlur}
                                      itemTemplate={stateTemplate}
                                      inputClassName={moreErrors?.State ? "error border-danger" : ""}
                                      aria-invalid={moreErrors?.State ? "true" : undefined}
                                    />
                                    <label
                                      htmlFor="State"
                                      className="lable searchtest"
                                    >
                                      {t(item?.ControlDisplayName)}
                                    </label>
                                    {moreErrors?.State && (
                                      <div
                                        className="error-message text-danger small"
                                        id="State-error"
                                        role="alert"
                                      >
                                        {moreErrors.State}
                                      </div>
                                    )}
                                  </div>
                                );
                              }
                              if (item?.ControlDisplayID == "HouseNo") {
                                return (
                                  <div
                                    className={`${!isHideController("HouseNo") && "d-none"} col-sm-4 col-12`}
                                  >
                                    <Input
                                      lable={t("Address")}
                                      type="text"
                                      name="HouseNo"
                                      maxLength={ADDRESS_MAX_LENGTH}
                                      placeholder={t("")}
                                      id="HouseNo"
                                      value={state?.HouseNo}
                                      onChange={handleMainChange}
                                      onKeyDown={(e) => handleKeyDown(e, "HouseNo")}
                                      ariaInvalid={!!moreErrors?.HouseNo}
                                      ariaDescribedBy={
                                        moreErrors?.HouseNo ? "HouseNo-error" : undefined
                                      }
                                      className={`${!state.HouseNo && (item?.IsMandatory || moreErrors?.HouseNo) ? "mandatory_field" : ""} ${moreErrors?.HouseNo ? "error border-danger" : ""}`}
                                    />
                                    {moreErrors?.HouseNo && (
                                      <div
                                        className="error-message text-danger small mb-2"
                                        id="HouseNo-error"
                                        role="alert"
                                      >
                                        {moreErrors.HouseNo}
                                      </div>
                                    )}
                                  </div>
                                );
                              }
                              if (item?.ControlDisplayID == "Country") {
                                return (
                                  <div
                                    className={`${!isHideController("Country") ? "d-none" : ""} col-sm-2 col-6`}
                                    onKeyDown={(e) => handleKeyDown(e, "Country")}
                                  >
                                    {/* <Input
                                  max={30}
                                  value={state?.Country}
                                  type="text"
                                  onChange={handleMainChange}
                                  lable={t("Country")}
                                  name="Country"
                                  placeholder={t("")}
                                  id="Country"
                                  onKeyDown={(e) => handleKeyDown(e, "Country")}
                                  className={`${!state.Country && item?.IsMandatory ? "mandatory_field" : ""}`}
                                /> */}

                                    <AutoComplete
                                      style={{ width: "100%" }}
                                      value={autoCompleteCountry || state?.Country || ""}
                                      suggestions={Countries}
                                      completeMethod={(e) => getCountries(sanitizeCountryName(e.query))}
                                      onSelect={handleAutoCompleteSelect("Country")}
                                      id="Country_AutoComplete"
                                      inputId="Country"
                                      name="Country"
                                      forceSelection
                                      onChange={(e) => applyCountryTypedValue(e.value)}
                                      onBlur={handleCountryBlur}
                                      itemTemplate={countryTemplate}
                                      field="CountryName"
                                      inputClassName={moreErrors?.Country ? "error border-danger" : ""}
                                      aria-invalid={moreErrors?.Country ? "true" : undefined}
                                    />
                                    <label
                                      htmlFor="Country"
                                      className="lable searchtest"
                                    >
                                      Country
                                    </label>
                                    {moreErrors?.Country && (
                                      <div
                                        className="error-message text-danger small"
                                        id="Country-error"
                                        role="alert"
                                      >
                                        {moreErrors.Country}
                                      </div>
                                    )}
                                  </div>
                                );
                              }
                              if (item?.ControlDisplayID == "ProEmployee") {
                                return (
                                  <div
                                    className={`${!isHideController("ProEmployee") && "d-none"} col-sm-2 col-12`}
                                  >
                                    <SelectBox
                                      options={[
                                        { label: "Select", value: "" },
                                        ...proEmplyee,
                                      ]}
                                      name="ProEmployee"
                                      id="ProEmployee"
                                      lable={t("Pro Employee")}
                                      selectedValue={state?.ProEmployee}
                                      onChange={handleMainChange}
                                      onKeyDown={(e) =>
                                        handleKeyDown(e, "ProEmployee")
                                      }
                                      className={`${!state.ProEmployee && item?.IsMandatory ? "mandatory_field" : ""}`}
                                    // isDisabled={state?.ProEmployee != "" ? true : false}
                                    />
                                  </div>
                                );
                              }
                              if (item?.ControlDisplayID == "data") {
                                return (
                                  <div
                                    className={`${!isHideController("data") && "d-none"} col-sm-2 col-6`}
                                  >
                                    <DatePicker
                                      showOnFocus={false}
                                      value={sampleCollectionDateTime?.data}
                                      name="data"
                                      placeholder={t("SampleCollectionDate")}
                                      id="data"
                                      lable={t("SampleCollectionDate")}
                                      maxDate={new Date()}
                                      tabIndex={getTabIndex("data")}
                                      onChange={handleDateTime}
                                      onKeyDown={(e) => handleKeyDown(e, "data")}
                                      className={`custom-calendar flex-grow-1 
                                ${!sampleCollectionDateTime?.data && item?.IsMandatory ? "mandatory_field" : ""}`}
                                    />
                                  </div>
                                );
                              }
                              if (item?.ControlDisplayID == "time") {
                                return (
                                  <div
                                    style={{ minWidth: "110px" }}
                                    className={`${!isHideController("time") && "d-none"} col-md-2 col-sm-3 col-6`}
                                  >
                                    <CustomTimePicker
                                      name="time"
                                      toolTipText={t("SampleCollectionTime")}
                                      value={sampleCollectionDateTime?.time}
                                      id="time"
                                      lable={t("Samp.Time")}
                                      tabIndex={getTabIndex("time")}
                                      onChange={handleDateTime}
                                      onKeyDown={(e) => handleKeyDown(e, "time")}
                                      respclass={`${!sampleCollectionDateTime?.time && item?.IsMandatory ? "mandatory_field" : ""}`}
                                    />
                                  </div>
                                );
                              }
                              if (item?.ControlDisplayID == "trfNo") {
                                return (
                                  <div
                                    className={`${!isHideController("trfNo") && "d-none"} col-sm-2 col-6`}
                                  >
                                    <Input
                                      max={30}
                                      value={trfNo}
                                      type="text"
                                      onChange={handleMainChange}
                                      lable={t("TRF No")}
                                      name="trfNo"
                                      id="trfNo"
                                      placeholder={t("")}
                                      onKeyDown={(e) => {
                                        handleKeyDown(e, "trfNo");
                                      }}
                                      tabIndex={getTabIndex("trfNo")}
                                      className={`${!trfNo && item?.IsMandatory ? "mandatory_field" : ""}`}
                                      ariaInvalid={!!moreErrors?.trfNo}
                                      ariaDescribedBy={
                                        moreErrors?.trfNo ? "trfNo-error" : undefined
                                      }
                                    />
                                    {moreErrors?.trfNo && (
                                      <div
                                        className="error-message text-danger small"
                                        id="trfNo-error"
                                        role="alert"
                                      >
                                        {moreErrors.trfNo}
                                      </div>
                                    )}
                                  </div>
                                );
                              }
                              if (item?.ControlDisplayID == "BarcodeNo") {
                                return (
                                  <>
                                    {[3, 5]?.includes(Number(BarcodeLogic)) && (
                                      <div className={`col-sm-2 col-6`}>
                                        <Input
                                          type="text"
                                          value={state?.BarcodeNo}
                                          name="BarcodeNo"
                                          onChange={handleBarcodeTypeChange}
                                          lable={t("Barcode No.")}
                                          id="BarcodeNo"
                                          placeholder=" "
                                          tabIndex={getTabIndex("BarcodeNo")}
                                          onKeyDown={(e) =>
                                            handleKeyDown(e, "BarcodeNo")
                                          }
                                          className={`${!state?.BarcodeNo && item?.IsMandatory ? "mandatory_field" : ""}`}
                                        />
                                      </div>
                                    )}
                                  </>
                                );
                              }
                              // if (item?.ControlDisplayID == "ProEmployee") {
                              //   return (
                              //     <div
                              //       className={`${!isHideController("ProEmployee") && "d-none"} col-sm-2 col-12`}
                              //     >

                              //       {/* <SelectBox
                              //   options={BindDiscReason}
                              //   name="DiscountReason"
                              //   selectedValue={LTData?.DiscountReason}
                              //   onChange={handleSelectChange}
                              //   isDisabled={
                              //     coupon?.field
                              //       ? true
                              //       : LTData?.DiscountId != ""
                              //         ? true
                              //         : LTData?.DiscountOnTotal === "" ||
                              //           LTData?.DiscountOnTotal == 0
                              //           ? true
                              //           : false
                              //   }
                              // /> */}
                              //       <SelectBox
                              //         options={[
                              //           { label: "Select", value: "" },
                              //           ...relations,
                              //         ]}
                              //         name="ProEmployee"
                              //         id="ProEmployee"
                              //         lable={t("Pro Employee")}
                              //         selectedValue={state?.ProEmployee}
                              //         onChange={handleMainChange}
                              //         onKeyDown={(e) =>
                              //           handleKeyDown(e, "ProEmployee")
                              //         }
                              //         className={`${!state.ProEmployee && item?.IsMandatory ? "mandatory_field" : ""}`}
                              //       // isDisabled={state?.ProEmployee != "" ? true : false}
                              //       />
                              //     </div>
                              //   );
                              // }

                              // for pkl

                              if (CenterType === "INSURANCE") {
                                if (item?.ControlDisplayID == "PolicyNo") {
                                  return (
                                    <div
                                      className={`${!isHideController("PolicyNo") && "d-none"} col-sm-2 col-12`}
                                    >
                                      {/* <div className="d-flex"> */}

                                      <Input
                                        tabIndex={getTabIndex("PolicyNo")}
                                        name="PolicyNo"
                                        type="text"
                                        max={50}
                                        onChange={handleLTData}
                                        value={LTData?.PolicyNo}
                                        id="PolicyNo"
                                        lable={t("Policy No./Memeber No.")}
                                        className={`${CenterType === "INSURANCE" &&
                                          !state?.PolicyNo
                                          ? // && item?.IsMandatory
                                          "mandatory_field"
                                          : ""
                                          }`}
                                        placeholder={t("")}
                                        onKeyDown={(e) =>
                                          handleKeyDown(e, "PolicyNo")
                                        }
                                      />

                                      {/* </div> */}
                                      {CenterType === "INSURANCE" &&
                                        moreErrors?.[item.ControlDisplayID] && (
                                          <div className="error-message text-danger small">
                                            {moreErrors[item.ControlDisplayID]}
                                          </div>
                                        )}
                                    </div>
                                  );
                                }

                                if (
                                  item?.ControlDisplayID == "CardHolderRelation"
                                ) {
                                  return (
                                    <div
                                      className={`${!isHideController("CardHolderRelation") && "d-none"} col-sm-2 col-12`}
                                    >
                                      <div className="d-flex">
                                        <div style={{ width: "40%" }}>
                                          <SelectBox
                                            tabIndex={getTabIndex(
                                              "CardHolderRelation",
                                            )}
                                            name="CardHolderRelation"
                                            options={[
                                              { label: t("select"), value: "" },
                                              ...relations,
                                            ]}
                                            selectedValue={
                                              LTData?.CardHolderRelation
                                            }
                                            id="CardHolderRelation"
                                            lable={t("Card HolderRelation")}
                                            // className={`${!LTData?.CardHolderRelation  && item?.IsMandatory ? "mandatory_field" : ""}`}
                                            onChange={handleSelectChange}
                                            onKeyDown={(e) =>
                                              handleKeyDown(e, "CardHolderRelation")
                                            }
                                          />
                                        </div>
                                        <div style={{ width: "60%" }}>
                                          <Input
                                            tabIndex={getTabIndex("CardHolderName")}
                                            name="CardHolderName"
                                            type="text"
                                            disabled={
                                              LTData?.CardHolderRelation == "Self"
                                                ? true
                                                : false
                                            }
                                            onChange={handleLTData}
                                            value={LTData?.CardHolderName}
                                            id="CardHolderName"
                                            lable={t("Card HolderName")}
                                            placeholder={t("")}
                                            onKeyDown={(e) =>
                                              handleKeyDown(e, "CardHolderName")
                                            }
                                          />
                                        </div>
                                      </div>
                                      {item?.IsMandatory === 1 &&
                                        moreErrors?.[item.ControlDisplayID] && (
                                          <div className="error-message text-danger small">
                                            {moreErrors[item.ControlDisplayID]}
                                          </div>
                                        )}
                                    </div>
                                  );
                                }

                                if (item?.ControlDisplayID == "KinTitle") {
                                  return (
                                    <div
                                      className={`${!isHideController("KinTitle") && "d-none"} col-sm-2 col-12 mb-1`}
                                    >
                                      <div className="d-flex">
                                        <div className="" style={{ width: "50%" }}>
                                          <SelectBox
                                            tabIndex={getTabIndex("KinTitle")}
                                            lable={t("Title")}
                                            id="KinTitle"
                                            name="KinTitle"
                                            options={Title}
                                            selectedValue={LTData?.KinTitle}
                                            onChange={handleSelectChange}
                                            onKeyDown={(e) =>
                                              handleKeyDown(e, "KinTitle")
                                            }
                                            className={`${!state?.KinTitle && item?.IsMandatory ? "mandatory_field" : ""}`}
                                          />
                                        </div>
                                        <div style={{ width: "70%" }}>
                                          <Input
                                            max={35}
                                            name="KinName"
                                            className={`required-fields ${getFieldErrorClass("KinName")} 
                                    ${!state.KinName && !!hideSpecificField("KinName")?.IsMandatory ? "mandatory_field" : ""}
                                  `}
                                            type="text"
                                            id="KinName"
                                            lable={t("KinName")}
                                            placeholder={t(" ")}
                                            // disabled={
                                            //   throughMobileData || throughMemberData
                                            // }
                                            value={LTData?.KinName}
                                            onChange={handleLTData}
                                            required
                                            tabIndex={getTabIndex("KinName")}
                                            onKeyDown={(e) =>
                                              handleKeyDown(e, "KinName")
                                            }
                                          />
                                          {renderErrorMessage(
                                            "KinName",
                                            item?.IsMandatory === 1,
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                  );
                                }
                              }

                              // Split into 3
                              if (item?.ControlDisplayID == "RegistrationDate") {
                                return (
                                  <>
                                    {useLocalStorage("userData", "get")
                                      .ModifyRegDate == 1 && (
                                        <>
                                          <div
                                            className={`${!isHideController("RegistrationDate") && "d-none"} col-sm-2 col-12`}
                                          >
                                            <DatePicker
                                              className="custom-calendar"
                                              name="RegistrationDate"
                                              value={LTData?.RegistrationDate}
                                              placeholder={t("")}
                                              id="RegistrationDate"
                                              lable={t("Registration Date")}
                                              onChange={dateregselecect}
                                              onKeyDown={(e) =>
                                                handleKeyDown(e, "RegistrationDate")
                                              }
                                            />
                                          </div>
                                          <div
                                            className={`${!isHideController("H") && "d-none"} col-sm-2 col-12`}
                                          >
                                            <div className="d-flex">
                                              <Input
                                                type="text"
                                                placeholder=" "
                                                lable={t("H")}
                                                id="H"
                                                value={time?.Hour}
                                                name="Hour"
                                                onChange={handleTimeChange}
                                                onKeyDown={(e) =>
                                                  handleKeyDown(e, "H")
                                                }
                                              />
                                              <Input
                                                type="text"
                                                value={time?.Minute}
                                                name="Minute"
                                                onChange={handleTimeChange}
                                                lable={t("M")}
                                                id="M"
                                                placeholder=" "
                                                onKeyDown={(e) =>
                                                  handleKeyDown(e, "M")
                                                }
                                              />
                                              <Input
                                                type="text"
                                                value={time?.Second}
                                                name="Second"
                                                onChange={handleTimeChange}
                                                lable={t("S")}
                                                id="S"
                                                placeholder=" "
                                                onKeyDown={(e) =>
                                                  handleKeyDown(e, "S")
                                                }
                                              />
                                            </div>
                                          </div>
                                        </>
                                      )}
                                  </>
                                );
                              }
                              if (item?.ControlDisplayID == "FieldType") {
                                return (
                                  <>
                                    {visibleFields?.map((data, index) =>
                                      data?.IsVisible == 1 ? (
                                        <div
                                          className={`${!isHideController("FieldType") && "d-none"} col-sm-2 col-12`}
                                          style={{ marginBottom: "5px" }}
                                          key={index}
                                        >
                                          {[
                                            "PatientSource",
                                            "PatientType",
                                            "HLMPatientType",
                                            "Source",
                                          ].includes(data?.FieldType) ||
                                            (data?.FieldType === "BedNo" &&
                                              data?.isDropdown == 1) ? (
                                            <SelectBox
                                              options={
                                                data?.FieldType === "PatientSource"
                                                  ? [
                                                    {
                                                      label: t("Select"),
                                                      value: "",
                                                    },
                                                    ...PatientSource,
                                                  ]
                                                  : data?.FieldType ===
                                                    "PatientType"
                                                    ? [
                                                      {
                                                        label: t("Select"),
                                                        value: "",
                                                      },
                                                      ...PatientType,
                                                    ]
                                                    : data?.FieldType ===
                                                      "HLMPatientType"
                                                      ? HLMPatientType
                                                      : data?.FieldType === "Source"
                                                        ? SourceType
                                                        : data?.FieldType ===
                                                          "BedNo"
                                                          ? WardNoOptions
                                                          : []
                                              }
                                              id="FieldType"
                                              placeholder={t(data?.FieldType)}
                                              lable={t(data?.FieldType)}
                                              selectedValue={
                                                LTData[data?.FieldType]
                                              }
                                              name={data?.FieldType}
                                              onChange={handleSelectNew}
                                              onKeyDown={(e) =>
                                                handleKeyDown(
                                                  e,
                                                  data?.FieldType || "FieldType",
                                                )
                                              }
                                            />
                                          ) : (
                                            <Input
                                              max={30}
                                              name={data?.FieldType}
                                              id={removeSpecialCharacters(
                                                data?.FieldType,
                                              )}
                                              placeholder={t("")}
                                              lable={t(
                                                data?.FieldType == "BedNo"
                                                  ? "WardNo/BedNo"
                                                  : data?.FieldType,
                                              )}
                                              value={LTData[data?.FieldType]}
                                              onChange={handleLTData}
                                              type="text"
                                              onKeyDown={(e) =>
                                                handleKeyDown(
                                                  e,
                                                  data?.FieldType || "FieldType",
                                                )
                                              }
                                            />
                                          )}
                                          {data?.isError && (
                                            <div className="error-message">
                                              {t(data?.message)}
                                            </div>
                                          )}
                                        </div>
                                      ) : null,
                                    )}
                                  </>
                                );
                              }
                              if (item?.ControlDisplayID == "SrfId") {
                                return (
                                  <>
                                    {checkCovid() ? (
                                      <>
                                        <div
                                          className={`${!isHideController("SrfId") && "d-none"} col-sm-2 col-12`}
                                        >
                                          <Input
                                            id="SrfId"
                                            placeholder=" "
                                            name="SrfId"
                                            lable={t("Srf Id")}
                                            type="text"
                                            value={LTData?.SrfId}
                                            onChange={handleSelectChange}
                                            onKeyDown={(e) =>
                                              handleKeyDown(e, "SrfId")
                                            }
                                          />
                                        </div>

                                        <div
                                          className={`${!isHideController("IcmrId") && "d-none"} col-sm-2 col-12`}
                                        >
                                          <Input
                                            id="IcmrId"
                                            placeholder=" "
                                            name="IcmrId"
                                            lable={t("Icmr Id")}
                                            type="text"
                                            value={LTData?.IcmrId}
                                            onChange={handleSelectChange}
                                            onKeyDown={(e) =>
                                              handleKeyDown(e, "IcmrId")
                                            }
                                          />
                                        </div>
                                      </>
                                    ) : (
                                      ""
                                    )}
                                  </>
                                );
                              }
                              if (item?.ControlDisplayID == "HMIS_PatCrNo") {
                                return (
                                  <>
                                    {IsCDAC ? (
                                      <>
                                        <div
                                          className={`${!isHideController("HMIS_PatCrNo") && "d-none"} col-md-2`}
                                        >
                                          <Input
                                            max={30}
                                            value={state?.HMIS_PatCrNo}
                                            type="text"
                                            onChange={handleMainChange}
                                            lable={t("Other Refral Lab")}
                                            name="HMIS_PatCrNo"
                                            placeholder={t("")}
                                            id="HMIS_PatCrNo"
                                            onKeyDown={(e) => {
                                              handleHMIS_PatCrNo(e, "HMIS_PatCrNo");
                                              handleKeyDown(e, "HMIS_PatCrNo");
                                            }}
                                          />{" "}
                                        </div>
                                      </>
                                    ) : (
                                      ""
                                    )}
                                  </>
                                );
                              }
                              // if (item?.ControlDisplayID == "CouponCode") {
                              //   return (
                              //     <div
                              //       id={"CouponCode"}
                              //       style={{ gap: "4px", width: "fit-content" }}
                              //       className="d-flex flex-wrap"
                              //     >
                              //       <div className="col-sm-6 col-6 mr-2">
                              //         <div className="d-flex">
                              //           <div>
                              //             <Input
                              //               id="CouponCode"
                              //               lable="Enter Your Coupon Code"
                              //               type="text"
                              //               value={coupon.code}
                              //               max={30}
                              //               placeholder={" "}
                              //               disabled={coupon.field}
                              //               onChange={(e) =>
                              //                 setCoupon({
                              //                   ...coupon,
                              //                   code: e.target.value,
                              //                 })
                              //               }
                              //             />
                              //           </div>
                              //           <div style={{ width: "13%" }}>
                              //             <button
                              //               className="btn btn-primary btn-sm"
                              //               type="button"
                              //               style={{
                              //                 borderRadius: "0px !important",
                              //               }}
                              //               onClick={handleCouponDetailsModal}
                              //             >
                              //               <i
                              //                 className="fa fa-search coloricon"
                              //                 style={{ cursor: "pointer" }}
                              //               ></i>
                              //             </button>
                              //           </div>
                              //         </div>
                              //       </div>
                              //       <div className="col-sm-auto px-0">
                              //         {coupon?.load ? (
                              //           <Loading />
                              //         ) :
                              //           coupon.field ? (
                              //             <CancelButton
                              //               text={"Cancel"}
                              //               id="btndeleterow"
                              //               onClick={handleCouponCancel}
                              //             />
                              //           ) : (
                              //             <CustomButton
                              //               text={"Validate Coupon"}
                              //               className="btn-block"
                              //               onClick={handleCouponValidate}
                              //             />
                              //           )}
                              //       </div>
                              //     </div>
                              //   );
                              // }
                              return null;
                            })}

                          {DefaultCurrencyName === "KES" && isB2B === "B2B" ? (
                            <div className={`col-sm-2 col-12`}>
                              <Input
                                name="LPO"
                                type="text"
                                max={20}
                                onChange={handleLTData}
                                value={LTData?.LPO}
                                id="LPO"
                                lable={t("Clinet Reff No.")}
                                placeholder={t("")}
                                className={`required-fields`}
                                onKeyDown={(e) => handleKeyDown(e, "LPO")}
                              />
                            </div>
                          ) : null}

                          {state?.Gender == "Female" && (
                            <div className="col-sm-1 col-12">
                              <button
                                className="btn-info text-white btn-block rounded p-1"
                                type="button"
                                id="documents"
                                onClick={handlePNDT}
                                disabled={state?.Gender == "Female" ? false : true}
                              >
                                <Tooltip label="Pre-Natal Diagnostic Techniques">
                                  <i aria-hidden="true">{t("PNDT")}</i>
                                </Tooltip>
                              </button>
                            </div>
                          )}
                          {HidePRDM != 1 && (
                            <div
                              className={
                                state?.Gender === "Female"
                                  ? "col-sm-1 col-6"
                                  : "col-sm-1"
                              }
                            >
                              <button
                                className="btn-info text-white btn-block rounded p-1"
                                type="button"
                                onClick={() => {
                                  setSaveSmsEmail({
                                    ...saveSmsEmail,
                                    IsActiveEmailToClient:
                                      saveSmsEmail?.IsActiveEmailToClient !== ""
                                        ? saveSmsEmail?.IsActiveEmailToClient
                                        : saveSmsEmail?.EmailToClient != ""
                                          ? 1
                                          : state?.RateTypeEmail != ""
                                            ? 1
                                            : 0,
                                    IsActiveSmsToDoctor:
                                      saveSmsEmail?.IsActiveSmsToDoctor !== ""
                                        ? saveSmsEmail?.IsActiveSmsToDoctor
                                        : saveSmsEmail?.SmsToDoctor != ""
                                          ? 1
                                          : LTData?.DoctorMobile != ""
                                            ? 1
                                            : 0,
                                    IsActiveEmailToDoctor:
                                      saveSmsEmail?.IsActiveEmailToDoctor !== ""
                                        ? saveSmsEmail?.IsActiveEmailToDoctor
                                        : saveSmsEmail?.EmailToDoctor != ""
                                          ? 1
                                          : LTData?.DoctorEmail != ""
                                            ? 1
                                            : 0,
                                    IsActiveEmailToPatient:
                                      saveSmsEmail?.IsActiveEmailToPatient !== ""
                                        ? saveSmsEmail?.IsActiveEmailToPatient
                                        : saveSmsEmail?.EmailToPatient != ""
                                          ? 1
                                          : state?.Email != ""
                                            ? 1
                                            : 0,
                                    IsActiveSmsToPatient:
                                      saveSmsEmail?.IsActiveSmsToPatient !== ""
                                        ? saveSmsEmail?.IsActiveSmsToPatient
                                        : saveSmsEmail?.SmsToPatient != ""
                                          ? 1
                                          : state?.Mobile != ""
                                            ? 1
                                            : 0,
                                    IsActiveSmsToClient:
                                      saveSmsEmail?.IsActiveSmsToClient !== ""
                                        ? saveSmsEmail?.IsActiveSmsToClient
                                        : saveSmsEmail?.SmsToClient != ""
                                          ? 1
                                          : state?.RateTypePhone != ""
                                            ? 1
                                            : 0,
                                    IsWhatsappRequired:
                                      saveSmsEmail?.IsWhatsappRequired
                                        ? saveSmsEmail?.IsWhatsappRequired
                                        : 0,
                                  });
                                  if (HidePRDM != 1) {
                                    setShow6(true);
                                  }
                                }}
                              >
                                <Tooltip
                                  label={t("Patient Report Delivery Management")}
                                >
                                  <i aria-hidden="true">{t("PRDM")}</i>
                                </Tooltip>
                              </button>
                            </div>
                          )}
                        </div>

                        {/*Comment 2. Comment logic but except ordering all logic working well */}
                        {/* <div className="row">
                  <div
                    className={`col-sm-2 col-12 mb-1 ${ !isHideController("CentreID") && "d-none" }`}
                  >
                    <ReactSelect
                      dynamicOptions={CentreData}
                      name="CentreID"
                      label={t("centre")}
                      id="CentreID"
                      removeIsClearable={true}
                      placeholderName={t("Centre")}
                      value={LTData?.CentreID}
                      onChange={handleSearchSelectChange}
                      inputRef={(r) => (refs.CentreRef.current = r)}
                      onKeyDown={(e) => handleKeyDown(e, "CentreID")}
                      // onKeyDown={(e) => handleFocusNext(e, "CentreRef")}
                      tabIndex={getTabIndex("CentreID")}
                    />
                  </div>

                  <div
                    className={`${ !isHideController("RateType") && "d-none" } col-sm-2 col-12`}
                  >
                    <ReactSelect
                      dynamicOptions={[
                        { label: "All Select", value: "" },
                        ...RateType,
                      ]}
                      name="RateID"
                      label={t("RateType")}
                      id="RateID"
                      isClearable={true}
                      menuPosition="fixed"
                      menuPlacement="auto"
                      placeholderName={t("RateType")}
                      value={state?.RateID}
                      onChange={handleSearchSelectChange}
                      defaultValue={null}
                      noOptionsMessage={() => t("No options")}
                      tabIndex={getTabIndex("RateID")}
                      onKeyDown={(e) => handleKeyDown(e, "RateID")}
                    // autoFocus={true}
                    />
                  </div>

                  <div
                    className={`${ !isHideController("VisitType") && "d-none" } col-sm-2 col-12`}
                  >
                    <ReactSelect
                      name="VisitType"
                      id="VisitType"
                      removeIsClearable={true}
                      dynamicOptions={VisitType}
                      placeholderName={t("VisitType")}
                      label={t("VisitType")}
                      value={LTData?.VisitType}
                      onChange={handleSearchSelectChange}
                      inputRef={(r) => (refs.RefDoctorRef.current = r)}
                      // onKeyDown={(e) => handleFocusNext(e, "RefDoctorRef")}
                      onKeyDown={(e) => handleKeyDown(e, "VisitType")}
                      tabIndex={getTabIndex("VisitType")}
                    />
                  </div>
                  <div
                    className={`${ !isHideController("PatientCode") && "d-none" } col-sm-2 col-12`}
                  >
                    <Input
                      type="text"
                      lable={t("UHID")}
                      max={15}
                      disabled={state?.Mobile && CompanyCode !== "DMC"}
                      value={state?.PatientCode}
                      name="PatientCode"
                      className={CompanyCode === "DMC" ? "required-fields" : ""}
                      onInput={(e) => number(e, 15)}
                      placeholder=" "
                      id="PatientCode"
                      onChange={handleMainChange}
                      // onKeyDown={(e) => handlePatientData(e, "PatientCode")}
                      onKeyDown={(e) => {
                        handlePatientData(e, "PatientCode");
                        handleKeyDown(e, "PatientCode");
                      }}
                      tabIndex={getTabIndex("PatientCode")}
                    />
                    {state?.PatientCode === "" && (
                      <div className="error-message">
                        {t(errors?.PatientCode)}
                      </div>
                    )}
                  </div>
                  {Category?.length > 0 ? (
                        <div
                          className={`${!isHideController("Category") && "d-none"} col-sm-2 col-12`}
                        >
                          <ReactSelect
                            name="Category"
                            className="required-fields"
                            id="Category"
                            dynamicOptions={Category}
                            lable={t("Department Category")}
                            placeholderName={t("Department Category")}
                            value={LTData?.Category}
                            onChange={handleSearchSelectChange}
                            onKeyDown={(e) => handleKeyDown(e, "Category")}
                          />
                          {LTData?.Category === "" && (
                            <div className="error-message">
                              {t(errors?.Category)}
                            </div>
                          )}
                        </div>
                      ) : (
                        <div
                          className={`${!isHideController("PreBookingNo") && "d_none"} col-sm-2 col-12 d-flex`}
                        >
                          <div style={{ width: "87%" }}>
                            <Input
                              type="text"
                              value={state?.PreBookingNo}
                              disabled={throughMobileData || throughMemberData}
                              lable={t("Pre Booking No")}
                              name="PreBookingNo"
                              onChange={handleMainChange}
                              placeholder=" "
                              id="PreBookingNo"
                              onKeyDown={(e) => {
                                handleHMIS_PatCrNo(e, "PreBookingNo");
                                handleKeyDown(e, "PreBookingNo");
                              }}
                              tabIndex={getTabIndex("PreBookingNo")}
                            />
                          </div>
                          <div style={{ width: "10%" }}>
                            <button
                              type="button"
                              className="btn btn-sm btn-primary"
                              onClick={getPreBookingNo}
                            >
                              <i className="fa fa-plus-circle fa-sm new_record_pluse"></i>
                            </button>
                          </div>
                        </div>
                      )}
                      <div
                        className={`${!isHideController("MembershipNo") && "d-none"} col-sm-2 col-12`}
                      >
                        <div className="p-inputgroup d-flex">
                          <div style={{ width: "87%" }}>
                            <Input
                              type="text"
                              lable={t("Membership Number")}
                              name="MembershipNo"
                              placeholder=" "
                              id="MembershipNo"
                              value={membershipnum}
                              disabled={throughMemberData}
                              onChange={(e) => {
                                setmembershipnum(e?.target?.value);
                              }}
                              tabIndex={getTabIndex("MembershipNo")}
                              onKeyDown={(e) => {
                                getMemberhipdata(e);
                                handleKeyDown(e, "MembershipNo");
                              }}
                            />
                          </div>
                          <div style={{ width: "10%" }}>
                            {throughMemberData ? (
                              <Tooltip label={t("Remove Membership")}>
                                <button
                                  type="button"
                                  className="btn btn-sm btn-primary"
                                  onClick={handleMembershipcancel}
                                >
                                  <i className="fa fa-times fa-sm new_record_pluse"></i>
                                </button>
                              </Tooltip>
                            ) : (
                              <Tooltip label={t("Create New Membership Card")}>
                                <button
                                  type="button"
                                  className="btn btn-sm btn-primary"
                                  onClick={() => {
                                    Navigate("/MembershipCardMaster");
                                  }}
                                >
                                  <i className="fa fa-plus-circle fa-sm new_record_pluse"></i>
                                </button>
                              </Tooltip>
                            )}
                          </div>
                        </div>
                      </div>
                      <div
                        className={`${!isHideController("Mobile") && "d-none"} col-sm-2 col-12`}
                      >
                        <div className="d-flex">
                          <div style={{ width: "86%" }}>
                            <Input
                              name="Mobile"
                              inputRef={inputRef}
                              className={`${LTData?.BTB != 1 && LTData?.SUBPCC != 1 && selectedRateType?.IsMobileRequired == 1 ? "required-fields" : ""} ${moreErrors?.Mobile ? "error border-danger" : ""}`}
                              id="Mobile"
                              value={state.Mobile}
                              disabled={throughMobileData || throughMemberData}
                              onChange={handleMainChange}
                              type="text"
                              inputMode="numeric"
                              lable={t("Mobile Number")}
                              placeholder={t(" ")}
                              required={selectedRateType?.IsMobileRequired == 1}
                              tabIndex={getTabIndex("Mobile")}
                              onKeyDown={(e) => {
                                handlePatientData(e, "Mobile");
                                handleKeyDown(e, "Mobile");
                              }}
                              ariaInvalid={!!moreErrors?.Mobile}
                              ariaDescribedBy={
                                moreErrors?.Mobile ? "Mobile-error" : undefined
                              }
                            />
                            {moreErrors?.Mobile && (
                              <div
                                className="error-message text-danger small"
                                id="Mobile-error"
                                role="alert"
                              >
                                {moreErrors.Mobile}
                              </div>
                            )}
                            {!err?.Mobile && !err?.Mobiles && (
                              <div className="error-message">
                                {t(errors?.Mobile)}
                              </div>
                            )}
                            {state.Mobile === "" && (
                              <div className="error-message">{t(err?.Mobile)}</div>
                            )}
                            {state.Mobile !== "" && state?.Mobile.length < 10 && (
                              <div className="error-message">{t(err?.Mobiles)}</div>
                            )}
                          </div>
                          <div style={{ width: "10%" }}>
                            <button
                              type="button"
                              className="btn btn-sm btn-primary"
                              onClick={handleShowMobile}
                            >
                              <i className="fa fa-plus-circle fa-sm new_record_pluse"></i>
                            </button>
                          </div>
                        </div>
                      </div>

                      <div
                        className={`${!isHideController("Title") && "d-none"} col-sm-2 col-12 mb-1`}
                      >
                        <div className="d-flex">
                          <div className="title_custom" style={{ width: "50%" }}>
                            <ReactSelect
                              dynamicOptions={Title}
                              name="Title"
                              id="Title"
                              lable={t("Title")}
                              placeholderName={t("Title")}
                              isDisabled={throughMobileData || throughMemberData}
                              value={state?.Title}
                              onChange={handleSearchSelectChange}
                              tabIndex={getTabIndex("Title")}
                              removeIsClearable={true}
                              onKeyDown={(e) => handleKeyDown(e, "Title")}
                            />
                          </div>
                          <div style={{ width: "70%" }}>
                            <Input
                              name="FirstName"
                              className={selectedRateType?.PayMode === "Credit" ? "" : "required-fields"}
                              type="text"
                              id="FirstName"
                              lable={t("First Name")}
                              placeholder={t(" ")}
                              disabled={throughMobileData || throughMemberData}
                              value={state?.FirstName}
                              onChange={handleMainChange}
                              required={selectedRateType?.PayMode !== "Credit"}
                              tabIndex={getTabIndex("FirstName")}
                              onKeyDown={(e) => handleKeyDown(e, "FirstName")}
                              ariaInvalid={!!moreErrors?.FirstName}
                              ariaDescribedBy={
                                moreErrors?.FirstName
                                  ? "FirstName-error"
                                  : undefined
                              }
                            />
                            {moreErrors?.FirstName && (
                              <div
                                className="error-message text-danger small"
                                id="FirstName-error"
                                role="alert"
                              >
                                {moreErrors.FirstName}
                              </div>
                            )}
                            {!err?.FirstName &&
                              !err?.FirstNames &&
                              errors?.FirstName && (
                                <div className="error-message">
                                  {t(errors?.FirstName)}
                                </div>
                              )}
                            {state.FirstName === "" && (
                              <div className="error-message">
                                {t(err?.FirstName)}
                              </div>
                            )}
                            {state?.FirstName !== "" &&
                              state?.FirstName.trim().length < 3 && (
                                <div className="error-message">
                                  {t(err?.FirstNames)}
                                </div>
                              )}
                          </div>
                        </div>
                      </div>

                      <div
                        className={`${!isHideController("MiddleName") && "d-none"} col-sm-2 col-12 mb-1`}
                      >
                        <Input
                          type="text"
                          lable={t("Middle Name")}
                          name="MiddleName"
                          placeholder={t(" ")}
                          id="MiddleName"
                          value={state?.MiddleName}
                          disabled={throughMobileData || throughMemberData}
                          max={35}
                          onChange={handleMainChange}
                          tabIndex={getTabIndex("MiddleName")}
                          onKeyDown={(e) => {
                            someMethodWithoutAccessToEvent(e, "LastName");
                            handleKeyDown(e, "MiddleName");
                          }}
                        />
                      </div>

                      <div
                        className={`${!isHideController("LastName") && "d-none"} col-sm-2 col-12`}
                      >
                        <Input
                          type="text"
                          lable={t("Last Name")}
                          name="LastName"
                          placeholder={t(" ")}
                          id="LastName"
                          value={state?.LastName}
                          disabled={throughMobileData || throughMemberData}
                          className={moreErrors?.LastName ? "error border-danger" : ""}
                          onChange={handleMainChange}
                          tabIndex={getTabIndex("LastName")}
                          onKeyDown={(e) => handleKeyDown(e, "LastName")}
                          maxLength={LAST_NAME_MAX_LENGTH}
                          ariaInvalid={!!moreErrors?.LastName}
                          ariaDescribedBy={
                            moreErrors?.LastName ? "LastName-error" : undefined
                          }
                        />
                        {moreErrors?.LastName && (
                          <div
                            className="error-message text-danger small"
                            id="LastName-error"
                            role="alert"
                          >
                            {moreErrors.LastName}
                          </div>
                        )}
                      </div>

                      <div
                        className={`${!isHideController("ReferLabId") && "d_none"} col-sm-2 col-12 d-flex`}
                      >
                        <div className="col-sm flex-grow-1 px-0 mb-1" style={{ position: "relative" }}>
                          <Input
                            tabIndex={getTabIndex("ReferLabId")}
                            id="ReferLabId"
                            name="ReferLabId"
                            lable={t("Ref Lab")}
                            type="text"
                            value={refLabSearchText}
                            className={selectedRateType?.PayMode?.toUpperCase() === "CREDIT" ? "" : "required-fields"}
                            onChange={(e) => {
                              const text = e.target.value;
                              setRefLabSearchText(text);
                              setIndexMatch(0);
                              setLTData((prev) => ({ ...prev, ReferLabId: "" }));
                              if (!text.trim()) {
                                setRefLabSuggestions([]);
                                setRefLabDropShow(false);
                                return;
                              }
                              setRefLabDropShow(true);
                              const searchLower = text.toLowerCase();
                              setRefLabSuggestions(
                                refLabList
                                  .filter((r) =>
                                    (r.label || "").toLowerCase().includes(searchLower)
                                  )
                                  .sort((a, b) => {
                                    const aL = (a.label || "").toLowerCase();
                                    const bL = (b.label || "").toLowerCase();
                                    const aStarts = aL.startsWith(searchLower);
                                    const bStarts = bL.startsWith(searchLower);
                                    if (aStarts && !bStarts) return -1;
                                    if (!aStarts && bStarts) return 1;
                                    return aL.localeCompare(bL);
                                  })
                              );
                              clearValidationError("ReferLabId");
                            }}
                            onBlur={() => {
                              setRefLabDropShow(false);
                              setRefLabSuggestions([]);
                              setIndexMatch(-1);
                              setLTData((prev) => {
                                if (!prev.ReferLabId) {
                                  setRefLabSearchText("");
                                }
                                return prev;
                              });
                            }}
                            onKeyDown={(e) => {
                              handleIndex(e);
                              handleKeyDown(e, "ReferLabId");
                            }}
                          />
                          {refLabDropShow && refLabSuggestions.length > 0 && (
                            <ul
                              className="suggestion-data"
                              style={{
                                zIndex: 9999,
                                width: "100%",
                                position: "absolute",
                                top: "100%",
                                left: 0,
                                background: "white",
                                padding: 0,
                                margin: 0,
                                listStyle: "none",
                                boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
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
                                    setLTData((prev) => ({ ...prev, ReferLabId: lab.value }));
                                    setRefLabSearchText(lab.label);
                                    setRefLabDropShow(false);
                                    setRefLabSuggestions([]);
                                    setIndexMatch(-1);
                                    clearValidationError("ReferLabId");
                                  }}
                                  className={index === indexMatch ? "matchIndex" : ""}
                                  style={{
                                    padding: "4px 8px",
                                    cursor: "pointer",
                                    backgroundColor: index === indexMatch ? "blue" : "white",
                                    color: index === indexMatch ? "white" : "inherit",
                                  }}
                                >
                                  {lab.label}
                                </li>
                              ))}
                            </ul>
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
                      <div
                        className={`${!isHideController("DoctorName") && "d-none"} col-sm-2 col-12`}
                      >
                        <div className="p-inputgroup d-flex">
                          <div style={{ width: "87%" }}>
                            <Input
                              tabIndex={getTabIndex("DoctorName")}
                              className={selectedRateType?.PayMode?.toUpperCase() === "CREDIT" ? "" : "required-fields"}
                              id="DoctorName"
                              name="DoctorName"
                              lable={t("Referred Doctor")}
                              onChange={(e) => {
                                setFormData((prev) => ({
                                  ...prev,
                                  DoctorName: e.target.value,
                                }));
                                setIndexMatch(0);
                                setDropFalse(true);
                              }}
                              value={formData?.DoctorName}
                              onKeyDown={handleIndex}
                              placeholder={t(" ")}
                              type="text"
                            />
                            {dropFalse && doctorSuggestion.length > 0 && (() => {
                              const suggestionThStyle = {
                                padding: "10px 16px",
                                textAlign: "left",
                                whiteSpace: "nowrap",
                                background: "#f0f2f5",
                                color: "#344054",
                                fontWeight: 600,
                                fontSize: "12px",
                                textTransform: "uppercase",
                                letterSpacing: "0.02em",
                                borderBottom: "1px solid #d0d5dd",
                                borderRight: "1px solid #e4e7ec",
                              };
                              const suggestionThLastStyle = { ...suggestionThStyle, borderRight: "none" };
                              const suggestionTdStyle = {
                                padding: "10px 16px",
                                whiteSpace: "nowrap",
                                borderBottom: "1px solid #eef0f2",
                                borderRight: "1px solid #eef0f2",
                              };
                              const suggestionTdLastStyle = { ...suggestionTdStyle, borderRight: "none" };
                              return (
                              <div
                                className="suggestion-data"
                                style={{
                                  width: "max-content",
                                  minWidth: "100%",
                                  maxWidth: "90vw",
                                  borderRadius: "8px",
                                  boxShadow: "0 8px 20px rgba(16,24,40,0.15)",
                                  border: "1px solid #d0d5dd",
                                }}
                              >
                              <table
                                style={{
                                  width: "100%",
                                  borderCollapse: "collapse",
                                  fontSize: "13px",
                                }}
                              >
                                <thead>
                                  <tr>
                                    <th style={suggestionThStyle}>{t("Name")}</th>
                                    <th style={suggestionThStyle}>{t("Mobile")}</th>
                                    <th style={suggestionThStyle}>{t("Department")}</th>
                                    <th style={suggestionThStyle}>{t("Specialization")}</th>
                                    <th style={suggestionThStyle}>{t("ProEmployee")}</th>
                                    <th style={suggestionThLastStyle}>{t("ProEmployee Number")}</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {doctorSuggestion.map((data, index) => (
                                    <tr
                                      onClick={() =>
                                        handleListSearch(data, "DoctorName")
                                      }
                                      className={`${index === indexMatch && "matchIndex"}`}
                                      key={index}
                                      style={{ cursor: "pointer" }}
                                    >
                                      <td style={suggestionTdStyle}>{data?.Name}</td>
                                      <td style={suggestionTdStyle}>{data?.Mobile}</td>
                                      <td style={suggestionTdStyle}>
                                        {data?.Department ||
                                          data?.DeptName ||
                                          data?.Dept ||
                                          data?.dept}
                                      </td>
                                      <td style={suggestionTdStyle}>
                                        {data?.Specialization ||
                                          data?.Speciality ||
                                          data?.Spec ||
                                          data?.spec}
                                      </td>
                                      <td style={suggestionTdStyle}>{data?.ProEmployee}</td>
                                      <td style={suggestionTdLastStyle}>{data?.ProEmployeeNumber}</td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                              </div>
                              );
                            })()}
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

                        {formData.DoctorName !== "" &&
                          formData?.DoctorID === "" && (
                            <div className="error-message">{t(err?.DoctorID)}</div>
                          )}
                      </div>
                      <div
                        className={`${!isHideController("DOB") && "d-none"} col-sm-2 col-12`}
                      >
                        <DatePicker
                          tabIndex={getTabIndex("DOB")}
                          showOnFocus={false}
                          value={state?.DOB}
                          className="custom-calendar"
                          name="DOB"
                          disabled={throughMobileData || throughMemberData}
                          placeholder={t("DOB")}
                          id="DOB"
                          lable={t("DOB")}
                          maxDate={new Date()}
                          dateFormat="dd/mm/yy"
                          onChange={dateSelect}
                          onKeyDown={(e) => handleKeyDown(e, "DOB")}
                          invalid={!!moreErrors?.DOB}
                          inputClassName={moreErrors?.DOB ? "error border-danger" : ""}
                          required={selectedRateType?.PayMode?.toUpperCase() !== "CREDIT"}
                        />
                        {moreErrors?.DOB && (
                          <div
                            className="error-message text-danger small"
                            id="DOB-error"
                            role="alert"
                          >
                            {moreErrors.DOB}
                          </div>
                        )}
                        {!err?.DOB && errors?.DOB && (
                          <div className="error-message">{t(errors?.DOB)}</div>
                        )}
                        {state.DOB == "" && (
                          <div className="error-message">{t(err?.DOB)}</div>
                        )}
                      </div>

                      <div className="col-sm-2 col-12">
                        <div className="p-inputgroup flex-1">
                          <div
                            className={`${!isHideController("AgeYear") && "d-none"}`}
                          >
                            <Input
                              tabIndex={getTabIndex("AgeYear")}
                              type="text"
                              className={`${selectedRateType?.PayMode?.toUpperCase() === "CREDIT" ? "" : "required-fields"} ${moreErrors?.AgeYear ? "error border-danger" : ""}`}
                              placeholder={t("Years")}
                              lable={t("Years")}
                              name="AgeYear"
                              value={state?.AgeYear}
                              disabled={throughMemberData || throughMobileData}
                              onChange={handleDOBCalculation}
                              id={"AgeYear"}
                              onKeyDown={(e) => handleKeyDown(e, "AgeYear")}
                              ariaInvalid={!!moreErrors?.AgeYear}
                              ariaDescribedBy={
                                moreErrors?.AgeYear ? "AgeYear-error" : undefined
                              }
                              required={selectedRateType?.PayMode?.toUpperCase() !== "CREDIT"}
                            />
                            {moreErrors?.AgeYear && (
                              <div
                                className="error-message text-danger small"
                                id="AgeYear-error"
                                role="alert"
                              >
                                {moreErrors.AgeYear}
                              </div>
                            )}
                            {!err?.AgeYear && !err?.AgeYears && errors?.AgeYear && (
                              <div className="error-message">
                                {t(errors?.AgeYear)}
                              </div>
                            )}
                          </div>
                          <div
                            className={`${!isHideController("AgeMonth") && "d-none"}`}
                          >
                            <Input
                              tabIndex={getTabIndex("AgeMonth")}
                              type="text"
                              placeholder={t("Months")}
                              lable={t("Months")}
                              name="AgeMonth"
                              id={"AgeMonth"}
                              className={`${selectedRateType?.PayMode?.toUpperCase() === "CREDIT" ? "" : "required-fields"} ${moreErrors?.AgeMonth ? "error border-danger" : ""}`}
                              value={state?.AgeMonth}
                              disabled={throughMemberData || throughMobileData}
                              onChange={handleDOBCalculation}
                              onKeyDown={(e) => handleKeyDown(e, "AgeMonth")}
                              ariaInvalid={!!moreErrors?.AgeMonth}
                              ariaDescribedBy={
                                moreErrors?.AgeMonth ? "AgeMonth-error" : undefined
                              }
                            />
                            {moreErrors?.AgeMonth && (
                              <div
                                className="error-message text-danger small"
                                id="AgeMonth-error"
                                role="alert"
                              >
                                {moreErrors.AgeMonth}
                              </div>
                            )}
                          </div>
                          <div
                            className={`${!isHideController("AgeDays") && "d-none"}`}
                          >
                            <Input
                              tabIndex={getTabIndex("AgeDays")}
                              placeholder={t("Days")}
                              lable={t("Days")}
                              type="text"
                              className={`${selectedRateType?.PayMode?.toUpperCase() === "CREDIT" ? "" : "required-fields"} ${moreErrors?.AgeDays ? "error border-danger" : ""}`}
                              name="AgeDays"
                              id={"AgeDays"}
                              value={state?.AgeDays}
                              disabled={throughMemberData || throughMobileData}
                              onChange={handleDOBCalculation}
                              onKeyDown={(e) => handleKeyDown(e, "AgeDays")}
                              ariaInvalid={!!moreErrors?.AgeDays}
                              ariaDescribedBy={
                                moreErrors?.AgeDays ? "AgeDays-error" : undefined
                              }
                            />
                            {moreErrors?.AgeDays && (
                              <div
                                className="error-message text-danger small"
                                id="AgeDays-error"
                                role="alert"
                              >
                                {moreErrors.AgeDays}
                              </div>
                            )}
                          </div>
                        </div>
                        {state.DOB == "" && (
                          <div className="error-message">{t(err?.AgeYear)}</div>
                        )}
                      </div>

                      <div
                        className={`${!isHideController("Gender") && "d-none"} col-sm-2 col-12 mb-1`}
                      >
                        <SelectBox
                          tabIndex={getTabIndex("Gender")}
                          options={Gender}
                          name="Gender"
                          id="Gender"
                          lable={t("Gender")}
                          isDisabled={
                            [
                              "baby",
                              "baby of",
                              "baby of",
                              "babyof",
                              "babyof",
                              "master",
                              "b/o",
                              "b/0",
                              "c/o",
                              "s/o",
                              "other",
                              "dr.",
                              "baby of.",
                              "dog",
                              "cat",
                            ].includes(state?.Title?.toLocaleLowerCase())
                              ? false
                              : state?.Title || state?.Title === ""
                                ? true
                                : false
                          }
                          selectedValue={state?.Gender}
                          onChange={handleMainChange}
                          onKeyDown={(e) => handleKeyDown(e, "Gender")}
                        />
                      </div>

                      <div
                        className={`${!isHideController("CollectionBoyId") && "d-none"} col-sm-2 col-12`}
                      >
                        <ReactSelect
                          tabIndex={getTabIndex("CollectionBoyId")}
                          name="CollectionBoyId"
                          id="CollectionBoyId"
                          dynamicOptions={[
                            { label: t("Select Collection Boy"), value: "" },
                            ...CollectionBoy,
                          ]}
                          placeholderName={t("Collection Boy")}
                          // isDisabled={true}
                          value={LTData?.CollectionBoyId}
                          onChange={handleSearchSelectChange}
                          onKeyDown={(e) => handleKeyDown(e, "CollectionBoyId")}
                        />
                      </div>

                      <div
                        className={`${!isHideController("IdType") && "d-none"} col-sm-2 col-12`}
                      >
                        <div className="d-flex">
                          <div style={{ width: "40%" }}>
                            <SelectBox
                              tabIndex={getTabIndex("IdType")}
                              name="PatientIDProof"
                              options={[
                                { label: t("Choose ID"), value: "" },
                                ...Identity,
                              ]}
                              selectedValue={LTData?.PatientIDProof}
                              id="IdType"
                              lable={t("Id Type")}
                              onChange={handleSelectChange}
                              onKeyDown={(e) => handleKeyDown(e, "IdType")}
                            />
                          </div>
                          <div style={{ width: "60%" }}>
                            <Input
                              tabIndex={getTabIndex("PatientIDProofNo")}
                              name="PatientIDProofNo"
                              type="text"
                              maxLength={isAadhaarIdType(LTData?.PatientIDProof) ? 12 : 20}
                              onChange={handleLTData}
                              onInput={handleIdProofInput}
                              disabled={
                                LTData?.PatientIDProof === "" ? true : false
                              }
                              value={LTData?.PatientIDProofNo}
                              id="PatientIDProofNo"
                              lable={t("Patient ID Proof Number")}
                              placeholder={t("")}
                              onKeyDown={handleIdProofKeyDown}
                              ariaInvalid={!!moreErrors?.PatientIDProofNo}
                              ariaDescribedBy={
                                moreErrors?.PatientIDProofNo
                                  ? "PatientIDProofNo-error"
                                  : undefined
                              }
                              className={`${(!LTData?.PatientIDProofNo && (item?.IsMandatory || moreErrors?.PatientIDProofNo)) ? "mandatory_field" : ""} ${moreErrors?.PatientIDProofNo ? "error border-danger" : ""}`}
                            />
                            {moreErrors?.PatientIDProofNo && (
                              <div
                                className="error-message text-danger small"
                                id="PatientIDProofNo-error"
                                role="alert"
                              >
                                {moreErrors.PatientIDProofNo}
                              </div>
                            )}
                            {renderErrorMessage("PatientIDProofNo", item?.IsMandatory === 1)}
                          </div>
                        </div>
                      </div>

                      <div
                        className={`${!isHideController("SecondReferDoctor") && "d-none"} col-sm-2 col-12`}
                      >
                        <div className="p-inputgroup d-flex">
                          <div style={{ width: "87%" }}>
                            <Input
                              tabIndex={getTabIndex("SecondReferDoctor")}
                              id="SecondReferDoctor"
                              name="SecondReferDoctor"
                              lable={t("Second Ref. Doctor")}
                              placeholder={t("")}
                              type="text"
                              value={formData?.SecondReferDoctor}
                              onChange={(e) => {
                                setFormData({
                                  ...formData,
                                  SecondReferDoctor: e.target.value,
                                });
                                setIndexMatch(0);
                                setSecondDropFalse(true);
                              }}
                              onBlur={(e) => {
                                autocompleteOnBlur(setseconddoctorSuggestion);
                              }}
                              onKeyDown={(e) => {
                                handleIndex(e);
                                handleKeyDown(e, "SecondReferDoctor");
                              }}
                            />
                            {secondDropFalse &&
                              seconddoctorSuggestion.length > 0 && (
                                <ul className="suggestion-data">
                                  {seconddoctorSuggestion.map((data, index) => (
                                    <li
                                      onClick={() =>
                                        handleListSearch(data, "SecondReferDoctor")
                                      }
                                      className={`${index === indexMatch && "matchIndex"}`}
                                      key={index}
                                    >
                                      {[
                                        data?.Name,
                                        data?.Mobile,
                                        data?.Department ||
                                        data?.DeptName ||
                                        data?.Dept ||
                                        data?.dept,
                                        data?.Specialization ||
                                        data?.Speciality ||
                                        data?.Spec ||
                                        data?.spec,
                                      ]
                                        .filter(
                                          (item) =>
                                            item &&
                                            String(item).trim() !== "" &&
                                            item !== 0 &&
                                            item !== "0",
                                        )
                                        .join("~")}
                                    </li>
                                  ))}
                                </ul>
                              )}
                          </div>
                          <div style={{ width: "10%" }}>
                            <Tooltip label={t("Add SecondReferDoctor")}>
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
                      </div>

                      <div
                        className={`${!isHideController("Email") && "d-none"} col-sm-2 col-12`}
                      >
                        <Input
                          type="text"
                          lable={t("Email")}
                          name="Email"
                          placeholder={t("")}
                          id="Email"
                          value={state?.Email}
                          onChange={handleMainChange}
                          onKeyDown={(e) => handleKeyDown(e, "Email")}
                        />

                      </div>

                      <div
                        className={`${!isHideController("PinCode") && "d-none"} col-sm-2 col-12`}
                      >
                        <Input
                          lable={t("Pincode")}
                          type="number"
                          name="PinCode"
                          placeholder={t("")}
                          onInput={(e) => number(e, 6)}
                          id="PinCode"
                          value={state?.PinCode}
                          onChange={handleMainChange}
                          onKeyDown={(e) => handleKeyDown(e, "PinCode")}
                        />
                      </div>
                      <div
                        className={`${!isHideController("nikshayID") && "d-none"} col-sm-2 col-12`}
                      >
                        <Input
                          lable={t("Nikshay ID")}
                          type="text"
                          name="nikshayID"
                          placeholder={t("")}
                          // onInput={(e) => number(e, 6)}
                          id="nikshayID"
                          value={state?.nikshayID}
                          onChange={handleMainChange}
                          onKeyDown={(e) => handleKeyDown(e, "nikshayID")}
                        />
                      </div>
                      <div
                        className={`${!isHideController("Locality") && "d-none"} col-sm-2 col-12`}
                      >
                        <Input
                          lable={t("Locality")}
                          max={30}
                          type="text"
                          value={state?.Locality}
                          onChange={handleMainChange}
                          name="Locality"
                          placeholder={t("")}
                          id="Locality"
                          onKeyDown={(e) => handleKeyDown(e, "Locality")}
                        />
                      </div>
                      <div
                        className={`${!isHideController("City") && "d-none"} col-sm-2 col-12`}
                      >
                        <Input
                          max={30}
                          type="text"
                          value={state?.City}
                          onChange={(e) => {
                            cityDraftRef.current = e.target.value;
                            handleMainChange(e);
                          }}
                          onBlur={handleCityBlur}
                          lable={t("City")}
                          name="City"
                          placeholder={t("")}
                          id="City"
                          onKeyDown={(e) => handleKeyDown(e, "City")}
                          ariaInvalid={!!moreErrors?.City}
                          className={`${moreErrors?.City ? "error border-danger" : ""}`}
                        />
                        {moreErrors?.City && (
                          <div
                            className="error-message text-danger small"
                            id="City-error"
                            role="alert"
                          >
                            {moreErrors.City}
                          </div>
                        )}
                      </div>
                      <div
                        className={`${!isHideController("State") && "d-none"} col-sm-2 col-12`}
                      >
                        <Input
                          type="text"
                          lable={t("State")}
                          name="State"
                          placeholder={t("")}
                          id="State"
                          max={30}
                          value={state?.State}
                          onChange={(e) => {
                            stateDraftRef.current = e.target.value;
                            handleMainChange(e);
                          }}
                          onBlur={handleStateBlur}
                          onKeyDown={(e) => handleKeyDown(e, "State")}
                          ariaInvalid={!!moreErrors?.State}
                          className={`${moreErrors?.State ? "error border-danger" : ""}`}
                        />
                        {moreErrors?.State && (
                          <div
                            className="error-message text-danger small"
                            id="State-error"
                            role="alert"
                          >
                            {moreErrors.State}
                          </div>
                        )}
                      </div>

                      <div
                        className={`${!isHideController("Address") && "d-none"} col-sm-2 col-12`}
                      >
                        <Input
                          lable={t("Address")}
                          type="text"
                          name="HouseNo"
                          maxLength={ADDRESS_MAX_LENGTH}
                          placeholder={t("")}
                          id="HouseNo"
                          value={state?.HouseNo}
                          onChange={handleMainChange}
                          onKeyDown={(e) => handleKeyDown(e, "HouseNo")}
                          ariaInvalid={!!moreErrors?.HouseNo}
                          ariaDescribedBy={
                            moreErrors?.HouseNo ? "HouseNo-error" : undefined
                          }
                          className={`${moreErrors?.HouseNo ? "error border-danger" : ""}`}
                        />
                        {moreErrors?.HouseNo && (
                          <div
                            className="error-message text-danger small"
                            id="HouseNo-error"
                            role="alert"
                          >
                            {moreErrors.HouseNo}
                          </div>
                        )}
                      </div>
                      <div
                        className={`${!isHideController("Country") && "d-none"} col-sm-2 col-12`}
                      >
                        <Input
                          max={30}
                          value={state?.Country}
                          type="text"
                          onChange={handleMainChange}
                          onBlur={handleCountryBlur}
                          lable={t("Country")}
                          name="Country"
                          placeholder={t("")}
                          id="Country"
                          onKeyDown={(e) => handleKeyDown(e, "Country")}
                          ariaInvalid={!!moreErrors?.Country}
                          className={`${moreErrors?.Country ? "error border-danger" : ""}`}
                        />
                        {moreErrors?.Country && (
                          <div
                            className="error-message text-danger small"
                            id="Country-error"
                            role="alert"
                          >
                            {moreErrors.Country}
                          </div>
                        )}
                      </div>
                      <div
                        className={`${!isHideController("ProEmployee") && "d-none"} col-sm-2 col-12`}
                      >
                        <SelectBox
                          options={[{ label: "Select", value: "" }, ...proEmplyee]}
                          name="ProEmployee"
                          id="ProEmployee"
                          lable={t("Pro Employee")}
                          selectedValue={state?.ProEmployee}
                          onChange={handleMainChange}
                          onKeyDown={(e) => handleKeyDown(e, "ProEmployee")}
                        // isDisabled={state?.ProEmployee != "" ? true : false}
                        />
                      </div>
                      <div
                        className={`${!isHideController("data") && "d-none"} col-sm-2 col-12`}
                      >
                        <DatePicker
                          showOnFocus={false}
                          value={sampleCollectionDateTime?.data}
                          className="custom-calendar flex-grow-1"
                          name="data"
                          placeholder={t("SampleCollectionDate")}
                          id="data"
                          lable={t("SampleCollectionDate")}
                          maxDate={new Date()}
                          tabIndex={getTabIndex("data")}
                          onChange={handleDateTime}
                          onKeyDown={(e) => handleKeyDown(e, "data")}
                        />
                      </div>
                      <div
                        style={{ minWidth: "110px" }}
                        className={`${!isHideController("time") && "d-none"} col-md-1 col-sm-3 col-4`}
                      >
                        <CustomTimePicker
                          name="time"
                          toolTipText={t("SampleCollectionTime")}
                          value={sampleCollectionDateTime?.time}
                          id="time"
                          lable={t("Samp.Time")}
                          tabIndex={getTabIndex("time")}
                          onChange={handleDateTime}
                          onKeyDown={(e) => handleKeyDown(e, "time")}
                        />
                      </div>
                      <div
                        className={`${!isHideController("TRFNo") && "d-none"} col-sm-2 col-12`}
                      >
                        <Input
                          max={30}
                          value={trfNo}
                          type="text"
                          onChange={handleMainChange}
                          lable={t("TRF No")}
                          name="trfNo"
                          id="trfNo"
                          placeholder={t("")}
                          onKeyDown={(e) => {
                            handleKeyDown(e, "trfNo");
                          }}
                          tabIndex={getTabIndex("trfNo")}
                          ariaInvalid={!!moreErrors?.trfNo}
                          ariaDescribedBy={
                            moreErrors?.trfNo ? "trfNo-error" : undefined
                          }
                        />
                        {moreErrors?.trfNo && (
                          <div
                            className="error-message text-danger small"
                            id="trfNo-error"
                            role="alert"
                          >
                            {moreErrors.trfNo}
                          </div>
                        )}
                      </div>
                      {[3, 5].includes(Number(BarcodeLogic)) && (
                        <div
                          className={`${!isHideController("BarcodeNo") && "d-none"} col-sm-2 col-12`}
                        >
                          <Input
                            type="text"
                            value={state?.BarcodeNo}
                            name="BarcodeNo"
                            onChange={handleBarcodeTypeChange}
                            lable={t("Barcode No.")}
                            id="BarcodeNo"
                            placeholder=" "
                            tabIndex={getTabIndex("BarcodeNo")}
                            onKeyDown={(e) => handleKeyDown(e, "BarcodeNo")}
                          />
                        </div>
                      )}

                      {useLocalStorage("userData", "get").ModifyRegDate == 1 && (
                        <>
                          <div
                            className={`${!isHideController("RegistrationDate") && "d-none"} col-sm-2 col-12`}
                          >
                            <DatePicker
                              className="custom-calendar"
                              name="RegistrationDate"
                              value={LTData?.RegistrationDate}
                              placeholder={t("")}
                              id="RegistrationDate"
                              lable={t("Registration Date")}
                              onChange={dateregselecect}
                              onKeyDown={(e) =>
                                handleKeyDown(e, "RegistrationDate")
                              }
                            />
                          </div>
                          <div
                            className={`${!isHideController("H") && "d-none"} col-sm-2 col-12`}
                          >
                            <div className="d-flex">
                              <Input
                                type="text"
                                placeholder=" "
                                lable={t("H")}
                                id="H"
                                value={time?.Hour}
                                name="Hour"
                                onChange={handleTimeChange}
                                onKeyDown={(e) => handleKeyDown(e, "H")}
                              />
                              <Input
                                type="text"
                                value={time?.Minute}
                                name="Minute"
                                onChange={handleTimeChange}
                                lable={t("M")}
                                id="M"
                                placeholder=" "
                                onKeyDown={(e) => handleKeyDown(e, "M")}
                              />
                              <Input
                                type="text"
                                value={time?.Second}
                                name="Second"
                                onChange={handleTimeChange}
                                lable={t("S")}
                                id="S"
                                placeholder=" "
                                onKeyDown={(e) => handleKeyDown(e, "S")}
                              />
                            </div>
                          </div>
                        </>
                      )}

                      {visibleFields?.map((data, index) =>
                        data?.IsVisible == 1 ? (
                          <div
                            className={`${!isHideController("FieldType") && "d-none"} col-sm-2 col-12`}
                            style={{ marginBottom: "5px" }}
                            key={index}
                          >
                            {[
                              "PatientSource",
                              "PatientType",
                              "HLMPatientType",
                              "Source",
                            ].includes(data?.FieldType) ||
                              (data?.FieldType === "BedNo" &&
                                data?.isDropdown == 1) ? (
                              <SelectBox
                                options={
                                  data?.FieldType === "PatientSource"
                                    ? [
                                      { label: t("Select"), value: "" },
                                      ...PatientSource,
                                    ]
                                    : data?.FieldType === "PatientType"
                                      ? [
                                        { label: t("Select"), value: "" },
                                        ...PatientType,
                                      ]
                                      : data?.FieldType === "HLMPatientType"
                                        ? HLMPatientType
                                        : data?.FieldType === "Source"
                                          ? SourceType
                                          : data?.FieldType === "BedNo"
                                            ? WardNoOptions
                                            : []
                                }
                                id="FieldType"
                                placeholder={t(data?.FieldType)}
                                lable={t(data?.FieldType)}
                                selectedValue={LTData[data?.FieldType]}
                                name={data?.FieldType}
                                onChange={handleSelectNew}
                                onKeyDown={(e) =>
                                  handleKeyDown(e, data?.FieldType || "FieldType")
                                }
                              />
                            ) : (
                              <Input
                                max={30}
                                name={data?.FieldType}
                                id={removeSpecialCharacters(data?.FieldType)}
                                placeholder={t("")}
                                lable={t(
                                  data?.FieldType == "BedNo"
                                    ? "WardNo/BedNo"
                                    : data?.FieldType
                                )}
                                value={LTData[data?.FieldType]}
                                onChange={handleLTData}
                                type="text"
                                onKeyDown={(e) =>
                                  handleKeyDown(e, data?.FieldType || "FieldType")
                                }
                              />
                            )}
                          </div>
                        ) : null
                      )}
                      {checkCovid() ? (
                        <>
                          <div
                            className={`${!isHideController("SrfId") && "d-none"} col-sm-2 col-12`}
                          >
                            <Input
                              id="SrfId"
                              placeholder=" "
                              name="SrfId"
                              lable={t("Srf Id")}
                              type="text"
                              value={LTData?.SrfId}
                              onChange={handleSelectChange}
                              onKeyDown={(e) => handleKeyDown(e, "SrfId")}
                            />
                          </div>

                          <div
                            className={`${!isHideController("IcmrId") && "d-none"} col-sm-2 col-12`}
                          >
                            <Input
                              id="IcmrId"
                              placeholder=" "
                              name="IcmrId"
                              lable={t("Icmr Id")}
                              type="text"
                              value={LTData?.IcmrId}
                              onChange={handleSelectChange}
                              onKeyDown={(e) => handleKeyDown(e, "IcmrId")}
                            />
                          </div>
                        </>
                      ) : (
                        ""
                      )}

                      {IsCDAC ? (
                        <>
                          <div
                            className={`${!isHideController("HMIS_PatCrNo") && "d-none"} col-md-2`}
                          >
                            <Input
                              max={30}
                              value={state?.HMIS_PatCrNo}
                              type="text"
                              onChange={handleMainChange}
                              lable={t("Other Refral Lab")}
                              name="HMIS_PatCrNo"
                              placeholder={t("")}
                              id="HMIS_PatCrNo"
                              onKeyDown={(e) => {
                                handleHMIS_PatCrNo(e, "HMIS_PatCrNo");
                                handleKeyDown(e, "HMIS_PatCrNo");
                              }}
                            />{" "}
                          </div>
                        </>
                      ) : (
                        ""
                      )}

                      {state?.Gender == "Female" && (
                        <div className="col-sm-1 col-12">
                          <button
                            className="btn-info text-white btn-block rounded p-1"
                            type="button"
                            id="documents"
                            onClick={handlePNDT}
                            disabled={state?.Gender == "Female" ? false : true}
                          >
                            <i aria-hidden="true">{t("PNDT")}</i>
                          </button>
                        </div>
                      )}
                      {HidePRDM != 1 && (
                        <div
                          className={
                            state?.Gender === "Female"
                              ? "col-sm-1 col-6"
                              : "col-sm-1"
                          }
                        >
                          <button
                            className="btn-info text-white btn-block rounded p-1"
                            type="button"
                            onClick={() => {
                              setSaveSmsEmail({
                                ...saveSmsEmail,
                                IsActiveEmailToClient:
                                  saveSmsEmail?.IsActiveEmailToClient !== ""
                                    ? saveSmsEmail?.IsActiveEmailToClient
                                    : saveSmsEmail?.EmailToClient != ""
                                      ? 1
                                      : state?.RateTypeEmail != ""
                                        ? 1
                                        : 0,
                                IsActiveSmsToDoctor:
                                  saveSmsEmail?.IsActiveSmsToDoctor !== ""
                                    ? saveSmsEmail?.IsActiveSmsToDoctor
                                    : saveSmsEmail?.SmsToDoctor != ""
                                      ? 1
                                      : LTData?.DoctorMobile != ""
                                        ? 1
                                        : 0,
                                IsActiveEmailToDoctor:
                                  saveSmsEmail?.IsActiveEmailToDoctor !== ""
                                    ? saveSmsEmail?.IsActiveEmailToDoctor
                                    : saveSmsEmail?.EmailToDoctor != ""
                                      ? 1
                                      : LTData?.DoctorEmail != ""
                                        ? 1
                                        : 0,
                                IsActiveEmailToPatient:
                                  saveSmsEmail?.IsActiveEmailToPatient !== ""
                                    ? saveSmsEmail?.IsActiveEmailToPatient
                                    : saveSmsEmail?.EmailToPatient != ""
                                      ? 1
                                      : state?.Email != ""
                                        ? 1
                                        : 0,
                                IsActiveSmsToPatient:
                                  saveSmsEmail?.IsActiveSmsToPatient !== ""
                                    ? saveSmsEmail?.IsActiveSmsToPatient
                                    : saveSmsEmail?.SmsToPatient != ""
                                      ? 1
                                      : state?.Mobile != ""
                                        ? 1
                                        : 0,
                                IsActiveSmsToClient:
                                  saveSmsEmail?.IsActiveSmsToClient !== ""
                                    ? saveSmsEmail?.IsActiveSmsToClient
                                    : saveSmsEmail?.SmsToClient != ""
                                      ? 1
                                      : state?.RateTypePhone != ""
                                        ? 1
                                        : 0,
                                IsWhatsappRequired: saveSmsEmail?.IsWhatsappRequired
                                  ? saveSmsEmail?.IsWhatsappRequired
                                  : 0,
                              });
                              if (HidePRDM != 1) {
                                setShow6(true);
                              }
                            }}
                          >
                            <i aria-hidden="true">{t("PRDM")}</i>
                          </button>
                        </div>
                      )}
                    </div> */}
                      </div>
                      <div className="col-md-1 col-12 mb-4 mb-md-0 d-flex flex-column align-items-center d-md-block mt-4 mt-md-0">
                        {!isMobileView && photoAndDocsField}
                        <div className="mb-1">
                          {state?.Title === "Mrs." && (
                            <div
                              className={`p-1 ${!isHideController("medicalHistory") && "d-none"}`}
                              id="medicalHistory"
                            >
                              <button
                                className="text-white rounded p-1 action-btn"
                                type="button"
                                style={{
                                  width: "78%",
                                  fontSize: "11px",
                                  marginLeft: "5px",
                                  bottom: "5px",
                                }}
                                onClick={() => {
                                  handleCloseMarker();
                                }}
                              >
                                Marker Test
                              </button>
                            </div>
                          )}
                          {!Number(AllowAdvanceOldPatientSearchAtWorkOrder) && (
                            <div
                              id={"oldPatient"}
                              className={`p-1 ${!isHideController("oldPatient") && "d-none"}`}
                            >
                              <button
                                className="text-white rounded p-1 action-btn"
                                type="button"
                                style={{
                                  width: "78%",
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
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </Accordion>
                  {Pndt?.PNDT && (
                    <Accordion
                      title={t("Pre-Natal Diagnostic Techniques")}
                      defaultValue={true}
                    >
                      <div className="row pt-2 pl-2 pr-2">
                        {controllerDynamicList
                          ?.filter(
                            (item) => item?.TypeId === 1 && item?.IsShow === 1,
                          )
                          ?.sort((a, b) => a.DisplayOrder - b.DisplayOrder)
                          ?.map((item) => {
                            if (item?.ControlDisplayID === "NoOfChildren") {
                              return (
                                <div
                                  key="NoOfChildren"
                                  className={`col-sm-3 col-md-2 col-6`}
                                >
                                  <Input
                                    id="NoOfChildren"
                                    name="NoOfChildren"
                                    lable={t("Number Of Children")}
                                    placeholder=" "
                                    type="number"
                                    onInput={(e) => number(e, 3)}
                                    value={Pndt?.NoOfChildren}
                                    onChange={handlePNDTChange}
                                    onKeyDown={(e) =>
                                      handleKeyDown(e, "NoOfChildren")
                                    }
                                    className={`${!Pndt?.NoOfChildren && item?.IsMandatory ? "mandatory_field" : ""}`}
                                  />
                                  {renderErrorMessage(
                                    "NoOfChildren",
                                    item?.IsMandatory === 1,
                                  )}
                                </div>
                              );
                            }

                            if (item?.ControlDisplayID === "NoOfSon") {
                              return (
                                <div
                                  key="NoOfSon"
                                  className={`col-md-2 col-sm-3 col-6`}
                                >
                                  <Input
                                    name="NoOfSon"
                                    id="NoOfSon"
                                    lable={t("Number Of Son")}
                                    placeholder=" "
                                    type="number"
                                    value={Pndt?.NoOfSon}
                                    onInput={(e) => number(e, 3)}
                                    onChange={handlePNDTChange}
                                    onKeyDown={(e) => handleKeyDown(e, "NoOfSon")}
                                    className={`${!Pndt?.NoOfSon && item?.IsMandatory ? "mandatory_field" : ""}`}
                                  />
                                  {renderErrorMessage(
                                    "NoOfSon",
                                    item?.IsMandatory === 1,
                                  )}
                                </div>
                              );
                            }

                            if (item?.ControlDisplayID === "NoOfDaughter") {
                              return (
                                <div
                                  key="NoOfDaughter"
                                  className={`col-md-2 col-sm-3 col-6`}
                                >
                                  <Input
                                    id="NoOfDaughter"
                                    lable={t("Number Of Daughter")}
                                    placeholder=" "
                                    name="NoOfDaughter"
                                    type="number"
                                    value={Pndt?.NoOfDaughter}
                                    onInput={(e) => number(e, 3)}
                                    onChange={handlePNDTChange}
                                    onKeyDown={(e) =>
                                      handleKeyDown(e, "NoOfDaughter")
                                    }
                                    className={`${!Pndt?.NoOfDaughter && item?.IsMandatory ? "mandatory_field" : ""}`}
                                  />
                                  {renderErrorMessage(
                                    "NoOfDaughter",
                                    item?.IsMandatory === 1,
                                  )}
                                </div>
                              );
                            }

                            if (item?.ControlDisplayID === "Pregnancy") {
                              return (
                                <div
                                  key="Pregnancy"
                                  className={`col-md-2 col-sm-3 col-6`}
                                >
                                  <DatePicker
                                    name="Pregnancy"
                                    className={`custom-calendar ${!Pndt?.Pregnancy && item?.IsMandatory ? "mandatory_field" : ""}`}
                                    id="Pregnancy"
                                    lable={t("Pregnancy")}
                                    placeholder=" "
                                    value={Pndt?.Pregnancy}
                                    maxDate={new Date()}
                                    onChange={handleDatePNDT}
                                    onKeyDown={(e) => handleKeyDown(e, "Pregnancy")}
                                  />
                                  {renderErrorMessage(
                                    "Pregnancy",
                                    item?.IsMandatory === 1,
                                  )}
                                </div>
                              );
                            }

                            if (item?.ControlDisplayID === "AgeOfSon") {
                              return (
                                <div
                                  key="AgeOfSon"
                                  className={`col-md-1 col-sm-3 col-6`}
                                >
                                  <Input
                                    name="AgeOfSon"
                                    lable={t("Son's Age")}
                                    id="AgeOfSon"
                                    placeholder=" "
                                    type="number"
                                    value={Pndt?.AgeOfSon}
                                    onInput={(e) => number(e, 3)}
                                    onChange={handlePNDTChange}
                                    onKeyDown={(e) => handleKeyDown(e, "AgeOfSon")}
                                    className={`${!Pndt?.AgeOfSon && item?.IsMandatory ? "mandatory_field" : ""}`}
                                  />
                                  {renderErrorMessage(
                                    "AgeOfSon",
                                    item?.IsMandatory === 1,
                                  )}
                                </div>
                              );
                            }

                            return null;
                          })}
                      </div>
                    </Accordion>
                  )}
                </>
              )}

              {/* {Pndt?.PNDT && (
            <Accordion
              title={t("Pre-Natal Diagnostic Techniques")}
              defaultValue={true}
            >
              <div className="row mt-2 pt-2 pl-2 pr-2">
                <div
                  className={`${ !isHideController("NoOfChildren") && "d-none" } col-sm-3 col-md-2 col-6`}
                >
                  <Input
                    id="NoOfChildren"
                    name="NoOfChildren"
                    lable={t("Number Of Children")}
                    placeholder=" "
                    type="number"
                    onInput={(e) => number(e, 3)}
                    value={Pndt?.NoOfChildren}
                    onChange={handlePNDTChange}
                    onKeyDown={() => handleKeyDown(e, "NoOfChildren")}
                  />
                 </div>
                <div
                  className={`${ !isHideController("NoOfSon") && "d-none" } col-md-2 col-sm-3 col-6`}
                >
                  <Input
                    name="NoOfSon"
                    id="NoOfSon"
                    lable={t("Number Of Son")}
                    placeholder=" "
                    type="number"
                    value={Pndt?.NoOfSon}
                    onInput={(e) => number(e, 3)}
                    onChange={handlePNDTChange}
                    onKeyDown={() => handleKeyDown(e, "NoOfSon")}
                  />
                </div>
                <div
                  className={`${ !isHideController("NoOfDaughter") && "d-none" } col-md-2 col-sm-3 col-6`}
                >
                  <Input
                    id="NoOfDaughter"
                    lable={t("Number Of Daughter")}
                    placeholder=" "
                    name="NoOfDaughter"
                    type="number"
                    value={Pndt?.NoOfDaughter}
                    onInput={(e) => number(e, 3)}
                    onChange={handlePNDTChange}
                    onKeyDown={() => handleKeyDown(e, "NoOfDaughter")}
                  />
                 
                </div>
                <div
                  className={`${ !isHideController("Pregnancy") && "d-none" } col-md-2 col-sm-3 col-6`}
                >
                  <DatePicker
                    name="Pregnancy"
                    className="custom-calendar"
                    id="Pregnancy"
                    lable={t("Pregnancy")}
                    placeholder=" "
                    value={Pndt?.Pregnancy}
                    maxDate={new Date()}
                    onChange={handleDatePNDT}
                    onKeyDown={() => handleKeyDown(e, "Pregnancy")}
                  />
                
                </div>
                <div
                  className={`${ !isHideController("AgeOfSon") && "d-none" } col-md-1 col-sm-3 col-6`}
                >
                  <Input
                    name="AgeOfSon"
                    lable={t("Son's Age")}
                    id="AgeOfSon"
                    placeholder=" "
                    type="number"
                    value={Pndt?.AgeOfSon}
                    onInput={(e) => number(e, 3)}
                    onChange={handlePNDTChange}
                    onKeyDown={() => handleKeyDown(e, "AgeOfSon")}
                  />
                 
                </div>
                <div
                  className={`${ !isHideController("AgeOfDaughter") && "d-none" } col-md-1 col-sm-3 col-6`}
                >
                  <Input
                    className="form-control input-sm"
                    name="AgeOfDaughter"
                    type="number"
                    id="AgeOfDaughter"
                    lable={t("Daughter's Age")}
                    placeholder=" "
                    value={Pndt?.AgeOfDaughter}
                    onInput={(e) => number(e, 3)}
                    onChange={handlePNDTChange}
                    onKeyDown={() => handleKeyDown(e, "AgeOfDaughter")}
                  />
                 
                </div>
                <div
                  className={`${ !isHideController("PNDTDoctor") && "d-none" } col-md-1 col-sm-3 col-6`}
                >
                  <SelectBox
                    className="form-control input-sm"
                    name="PNDTDoctor"
                    id="PNDTDoctor"
                    lable={t("PNDT Doctor")}
                    placeholder="PNDT Doctor"
                    options={DoctorData}
                    selectedValue={Pndt?.PNDTDoctor}
                    onChange={handlePNDTChange}
                    onKeyDown={() => handleKeyDown(e, "PNDTDoctor")}
                  />
                  
                </div>
                <div
                  className={`${ !isHideController("Husband") && "d-none" } col-md-1 col-sm-3 col-6`}
                >
                  <Input
                    className="form-control input-sm"
                    name="Husband"
                    lable={t("Husband")}
                    placeholder=" "
                    id="Husband"
                    value={Pndt?.Husband}
                    onChange={handlePNDTChange}
                    onKeyDown={() => handleKeyDown(e, "Husband")}
                  />
                 
                </div>
              </div>
            </Accordion>
          )} */}
            </>
            {showDefault && (
              <Accordion title={t("Booking Details")} defaultValue={true}>
                <div className="row d-flex" style={{ paddingBottom: "0px" }}>
                  <div
                    style={{ width: "60%", flex: "0 0 60%", maxWidth: "60%" }}
                    className="col-md-6 col-sm-12 col-12"
                  >
                    <div className="row pt-2 pl-2 pr-2">
                      <div className="col-lg-5 col-md-12 col-12 col-sm-5">
                        <Input
                          name="TestName"
                          className={`${selectedRateType?.PayMode?.toUpperCase() === "CREDIT" ? "" : "required-fields"} custome_little`}
                          lable={
                            searchTest == "TestName"
                              ? t("Type TestName For Add Test")
                              : t("Type TestCode For Add Test")
                          }
                          type="text"
                          placeholder=" "
                          max={30}
                          id="testSearch"
                          tabIndex={getTabIndex("testSearch")}
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
                                ref={(el) => {
                                  // added this ref to scroll into view
                                  if (index === indexMatch && el) {
                                    el.scrollIntoView({ block: "nearest" });
                                  }
                                }}
                                onClick={() => handleListSearch(data, "TestName")}
                                key={index}
                                className={`${index === indexMatch && "matchIndex"}`}
                                style={{
                                  backgroundColor:
                                    allowOutsourceLab &&
                                    Number(data?.isOutSource) === 1
                                      ? "pink"
                                      : undefined,
                                }}
                              >
                                {data.TestName}
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                      {/* <div className="ml-2">
                <span>
                  {" "}
                  <i
                    className="fa fa-microphone"
                  />
                </span>
              </div> */}
                      <div className="col-lg-4 col-md-8 col-8 col-sm-4 d-flex align-items-center">
                        <div className="d-flex align-items-center">
                          <div className="mx-2 d-flex align-items-center">
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
                            <label htmlFor="TestName" className="ml-2 mb-0">
                              {t("By TestName")}
                            </label>
                          </div>
                          <div className="mx-2 d-flex align-items-center">
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
                            <label htmlFor="TestCode" className="ml-2 mb-0">
                              {t("By TestCode")}
                            </label>
                          </div>
                        </div>
                      </div>
                      <div className="col-lg-3 col-md-4 col-4 col-sm-3 d-flex align-items-center">
                        <div className="d-flex align-items-center">
                          <div className="mx-2 d-flex align-items-center">
                            <Form.Check
                              type="switch"
                              id="isVIP"
                              name="isVIP"
                              label={t("VIP")}
                              checked={state?.isVIP === 1 ? true : false}
                              onChange={handleMainChange}
                              className="m-0"
                            />
                          </div>
                          {/* {state?.isVIP === 1 && ( */}
                          {controllerDynamicList
                            ?.sort((a, b) => a.DisplayOrder - b.DisplayOrder)
                            .map((item) => {
                              if (item?.ControlDisplayID === "IsMask") {
                                return (
                                  <div
                                    className="mx-2"
                                    key={item?.ControlDisplayID}
                                  >
                                    <div
                                      className={`${!isHideController("IsMask") && "d-none"}`}
                                    >
                                      <Form.Check
                                        type="switch"
                                        id="IsMask"
                                        name="IsMask"
                                        label={t("MASK")}
                                        checked={state?.IsMask === 1}
                                        onChange={handleMainChange}
                                        className="m-0"
                                      />
                                    </div>
                                  </div>
                                );
                              }
                              return null;
                            })}
                          {/* )} */}
                          {/* )} */}
                          {HideOutSourceColor != 1 &&
                            tableData.some((item) => item?.IsMask === 1) && (
                              <div className="status_code d-flex align-items-center">
                                <div className="color_dot">IsMask</div>
                              </div>
                            )}
                        </div>
                      </div>
                    </div>
                    <div className="row px-2">
                      <div className="col-12">
                        {gwtInvalidTests.length > 0 && (
                          <div className="mb-2">
                            <small className="text-danger fw-bold">{t("Not Found Tests")}:</small>
                            <ul className="mb-0 ps-3">
                              {gwtInvalidTests.map((test, i) => (
                                <li key={i} className="text-danger small">
                                  {test.testCode} - {test.testName}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                        {tableData.length > 0 && (
                          <div className="pr-booking-table-desktop-grid">
                          <Tables>
                            <thead>
                              <tr>
                                <th className="text-center">{"#"}</th>
                                {!isMobileView && <th>{t("Slot")}</th>}
                                {isMobileView ? (
                                  <th
                                    style={{
                                      wordWrap: "break-word",
                                      whiteSpace: "normal",
                                    }}
                                  >
                                    {t("Item")}
                                  </th>
                                ) : (
                                  <>
                                    <th>{t("Code")}</th>
                                    <th
                                      style={{
                                        wordWrap: "break-word",
                                        whiteSpace: "normal",
                                      }}
                                    >
                                      {t("Item")}
                                    </th>
                                  </>
                                )}
                                {!isMobileView && <th>{t("View")}</th>}
                                {!isMobileView && <th>{t("DOS")}</th>}
                                <th>{t("MRP")}</th>
                                <th>{t("Rate")}</th>
                                <th>{t("Qty")}</th>
                                {!isMobileView &&
                                  selectedRateType?.PayMode !== "Credit" &&
                                  BarcodeLogic != 4 && <th>{t("Disc.")}</th>}
                                {!isMobileView &&
                                  selectedRateType?.PayMode === "Credit" &&
                                  BarcodeLogic != 4 && <th>{t("Amt")}</th>}
                                {!isMobileView && <th>{t("D.Date")}</th>}
                                {/* {selectedRateType?.PayMode === "Credit" &&
                              BarcodeLogic != 4 && <th>{t("SC")}</th>} */}
                                {/* {
                             selectedRateType?.PayMode === "Credit" &&
                              BarcodeLogic != 4 &&
                              ( */}
                                {[2, 4].includes(
                                  selectedRateType?.SampleCollectionType,
                                ) && (
                                    <th>
                                      <span
                                        data-tooltip-id="sc-tooltip"
                                        data-tooltip-content={t("Sample Collection")}
                                      >
                                        {t("SC")}
                                      </span>
                                      <ReactTooltip id="sc-tooltip" place="top" />
                                    </th>
                                  )}
                                {/* )} */}
                                <th className="text-center">
                                  {/* urgent sample tooltip added  */}
                                  {/* <Tooltip label={t("Urgen Delivery")}> */}
                                  <input
                                    type="checkbox"
                                    checked={selectAllUrgent}
                                    onChange={(e) => {
                                      const isChecked = e.target.checked;
                                      setSelectAllUrgent(isChecked);

                                      // Update all tableData items
                                      const updatedData = tableData?.map(
                                        (item) => ({
                                          ...item,
                                          IsUrgent: isChecked ? 1 : 0,
                                          deleiveryDate: isChecked
                                            ? item?.UrgentdeleiveryDate
                                            : item?.DeliveryDate,
                                        }),
                                      );
                                      setTableData(updatedData);
                                    }}
                                    style={{ cursor: "pointer" }}
                                    title={t("Select/Deselect All Urgent")}
                                  />
                                  <span
                                    className="blinking"
                                    data-tooltip-id="urgent-tooltip"
                                    data-tooltip-content={t("Urgent Sample")}
                                  >
                                    <i
                                      className="fa fa-hourglass-start blinking"
                                      style={{ color: "red" }}
                                    ></i>
                                  </span>
                                  <ReactTooltip id="urgent-tooltip" place="top" />
                                  {/* </Tooltip> */}
                                </th>
                                <th className="text-center">
                                  <i
                                    className="fa fa-trash"
                                    onClick={() => handleFilterAll(tableData)}
                                  ></i>
                                </th>
                                {allowOutsourceLab && (
                                  <th style={{ minWidth: "200px", whiteSpace: "nowrap" }}>
                                    {t("Outsource Lab")}
                                  </th>
                                )}
                              </tr>
                            </thead>
                            {tableData.length > 0 && (
                              <tbody>
                                {tableData?.map((data, index) => (
                                  <>
                                    {show5?.modal &&
                                      index === show5?.index &&
                                      [3, 4, 5].includes(BarcodeLogic) && (
                                        <BarcodeLogicModal
                                          tableData={tableData}
                                          show={show5}
                                          setShow5={setShow5}
                                          BarcodeLogic={BarcodeLogic}
                                          onClose={() =>
                                            setShow5({ modal: false, index: -1 })
                                          }
                                          data={data}
                                          handleCloseBarcodeModal={
                                            handleCloseBarcodeModal
                                          }
                                        />
                                      )}
                                    <tr
                                      key={index}
                                      style={{
                                        background:
                                          HideOutSourceColor != 1
                                            ? data?.isOutSource == 1
                                              ? "pink"
                                              : ""
                                            : "",
                                      }}
                                    >
                                      <RegisterationTable
                                        data={data}
                                        BarcodeLogic={BarcodeLogic}
                                        slotOpen={slotOpen}
                                        setSlotOpen={setSlotOpen}
                                        handleSelectSlot={handleSelectSlot}
                                        tableData={tableData}
                                        setTableData={setTableData}
                                        LTData={LTData}
                                        index={index}
                                        coupon={coupon}
                                        member={throughMemberData}
                                        handleFilter={handleFilter}
                                        handleDiscount={handleDiscount}
                                        handleRateChange={handleRateChange}
                                        handleQuantityChange={handleQuantityChange}
                                        enableQuantitySelection={true}
                                        handlePLOChange={handlePLOChange}
                                        handleUrgent={handleUrgent}
                                        handleRateTypePaymode={
                                          handleRateTypePaymode
                                        }
                                        state={state}
                                        selectedRateType={selectedRateType}
                                        setSelectAllUrgent={setSelectAllUrgent}
                                        isMobileView={isMobileView}
                                        allowOutsourceLab={allowOutsourceLab}
                                        outSourceLabOptions={outSourceLabOptions}
                                        processPLOData={processPLOData}
                                      />
                                    </tr>
                                  </>
                                ))}
                              </tbody>
                            )}
                          </Tables>
                          </div>
                        )}
                      </div>{" "}
                    </div>
                  </div>
                  {selectedRateType?.PayMode &&
                    !(
                      selectedRateType?.PayMode === "Credit" && selectedRateType?.AgainstInvoice !== 3
                    ) && (
                      <div
                        style={{ width: "40%", flex: "0 0 40%", maxWidth: "40%" }}
                        className=" pt-2 pl-2 pr-3 col-md-6 col-sm-12 col-12"
                      >
                        <div className="row">
                          <div className="col-sm-3 col-4">
                            <Input
                              data-val="false"
                              placeholder=" "
                              lable={t("Gross Amount")}
                              id="Gross_Amount"
                              name="Gross_Amount"
                              disabled={true}
                              type="text"
                              value={
                                hideRate === 1
                                  ? ""
                                  : Number(LTData?.GrossAmount).toFixed(2)
                              }
                              readOnly="readonly"
                            />
                          </div>
                          <div className="col-sm-3 col-4">
                            <Input
                              data-val="false"
                              placeholder=" "
                              lable={t("Net Amount")}
                              id="Total_Amount"
                              name="Total_Amount"
                              disabled={true}
                              type="text"
                              value={
                                hideRate === 1
                                  ? ""
                                  : Number(LTData?.NetAmount).toFixed(2)
                              }
                              readOnly="readonly"
                            />
                          </div>
                          <div className="col-sm-3 col-4">
                            <Input
                              id="Paid_Amount"
                              lable={t("Paid Amount")}
                              placeholder=" "
                              name="Paid_Amount"
                              type="number"
                              value={Number(paid).toFixed(2)}
                              readOnly="readonly"
                            />
                            {radiologyPrePaidAmount > 0 && (
                              <small
                                className="d-block text-success fw-bold"
                                style={{ fontSize: "10.5px", marginTop: "2px" }}
                              >
                                {t("₹{{amount}} already paid at appointment time", {
                                  amount: radiologyPrePaidAmount.toFixed(2),
                                })}
                              </small>
                            )}
                          </div>
                          <div className="col-sm-3 col-4">
                            <Input
                              data-val="false"
                              placeholder=" "
                              id="DiscountAmt"
                              // readOnly={isCoPayment == 1}
                              lable={t("Discount Amount")}
                              disabled={
                                (DefaultCurrencyName === "KES" && isManualDiscountApply !== 1) ||
                                throughMemberData ||
                                throughFamilyData ||
                                (tableData?.length > 0
                                  ? LTData?.DiscountId != ""
                                    ? true
                                    : handleRateTypePaymode === "Credit"
                                      ? true
                                      : LTData?.DiscountApprovedBy != ""
                                        ? true
                                        : false
                                  : true)
                              }
                              value={disAmt}
                              name="disAmt"
                              onChange={(e) => {
                                setPayByPatientTotal(0);
                                setCoPaymentPercentage(0);
                                let match = Match();

                                if (coupon?.field == true) {
                                  toast.error(t("Remove Coupon First"));
                                } else {
                                  if (discountPercentage === "" && !match) {
                                    if (
                                      LTData?.GrossAmount < Number(e.target.value)
                                    ) {
                                      toast.error(t("Please Enter Valid Discount"));
                                    } else {
                                      const val = e.target.value;
                                      const isValidInput =
                                        /^\d+(\.\d{0,2})?$/.test(val) &&
                                        parseFloat(val) >= 0 &&
                                        parseFloat(val) <= 99999999999;
                                      setdisAmt(
                                        isValidInput || val === "" ? val : disAmt,
                                      );
                                      setLTData({
                                        ...LTData,
                                        DiscountOnTotal:
                                          isValidInput || val === ""
                                            ? val
                                            : LTData.DiscountOnTotal,
                                      });
                                      // setPLO(prev => {
                                      //   const updated = [...prev];
                                      //   data.forEach((newItem, index) => {
                                      //     updated[index] = { ...prev[index], ...newItem }; // merge, not replace
                                      //   });
                                      //   return updated;
                                      // });
                                    }
                                  } else {
                                    toast.error(t("Discount already Given"));
                                  }
                                }
                              }}
                            />
                          </div>
                          <div className="col-sm-3 col-4">
                            <Input
                              id="DiscountPer"
                              lable={t("Discount Percentage")}
                              value={discountPercentage}
                              name="DiscountPer"
                              // readOnly={isCoPayment == 1}
                              disabled={
                                (DefaultCurrencyName === "KES" && isManualDiscountApply !== 1) ||
                                throughMemberData ||
                                throughFamilyData ||
                                (tableData?.length > 0
                                  ? LTData?.DiscountId != ""
                                    ? true
                                    : handleRateTypePaymode === "Credit"
                                      ? true
                                      : LTData?.DiscountApprovedBy != ""
                                        ? true
                                        : false
                                  : true)
                              }
                              placeholder=" "
                              onChange={(e) => {
                                const val = e.target.value;
                                const isValidInput =
                                  /^\d+(\.\d{0,2})?$/.test(val) &&
                                  parseFloat(val) >= 0 &&
                                  parseFloat(val) <= 100;
                                let match = Match();
                                setPayByPatientTotal(0);
                                setCoPaymentPercentage(0);
                                setPayByPanelTotal(
                                  Number(LTData?.NetAmount).toFixed(2),
                                );
                                if (coupon?.field == true) {
                                  toast.error(t("Remove Coupon First"));
                                } else {
                                  if (disAmt === "" && !match) {
                                    setDiscountPercentage(
                                      isValidInput || val === ""
                                        ? val
                                        : discountPercentage,
                                    );
                                  } else {
                                    toast.error(t("Discount Already Given"));
                                  }
                                }
                              }}
                            />
                          </div>
                          <div className="col-sm-3 col-4">
                            <SelectBox
                              options={
                                selectedRateType?.PayMode === "Cash"
                                  ? PaymentMode.filter((item) => item.label !== "Credit")
                                  : PaymentMode
                              }
                              selectedValue={
                                RcData[RcData.length - 1].PaymentModeID
                              }
                              onChange={handlePaymentChange}
                              isDisabled={
                                (DefaultCurrencyName !== "KES" && selectedRateType?.PayMode === "Credit")
                                || (
                                  DefaultCurrencyName === "KES" &&
                                  isCoPayment == 0 &&
                                  (tableData?.length > 0
                                    ? handleRateTypePaymode === "Credit"
                                      ? true
                                      : false
                                    : true)
                                )
                              }
                            />
                          </div>

                          <div className="col-sm-3 col-4">
                            <SelectBox
                              options={DISCOUNT_TYPE}
                              selectedValue={LTData?.DiscountType}
                              onChange={handleSelectChange}
                              name={"DiscountType"}
                              isDisabled={
                                throughMemberData ||
                                throughFamilyData ||
                                (tableData?.length > 0 && !coupon.field
                                  ? false
                                  : true)
                              }
                            />
                          </div>
                          <div className="col-sm-3 col-4">
                            {LTData?.DiscountType === 1 ? (
                              <SelectBox
                                className={
                                  // DefaultCurrencyName !== "KES" &&
                                  (Number(discountPercentage) > 0 ||
                                    Number(disAmt) > 0) &&
                                    LTData?.DiscountType === 1
                                    ? "required-fields"
                                    : ""
                                }
                                options={BindDiscApproval}
                                name="DiscountApprovedBy"
                                selectedValue={LTData?.DiscountApprovedBy}
                                onChange={handleSelectChange}
                                isDisabled={
                                  throughMemberData ||
                                  throughFamilyData ||
                                  coupon?.field ||
                                  LTData?.DiscountId != "" ||
                                  !hasActiveDiscount
                                }
                              />
                            ) : (
                              AgeWiseDiscountDropdown.length > 0 && (
                                <SelectBox
                                  options={AgeWiseDiscountDropdown}
                                  selectedValue={LTData?.DiscountId}
                                  name="DiscountId"
                                  onChange={(e) => {
                                    let match = Match();
                                    if (disAmt === "" && !match) {
                                      const data = AgeWiseDiscountDropdown.find(
                                        (ele) => ele?.value == e.target.value,
                                      );

                                      setDiscountPercentage(data?.perCentage);
                                      setLTData({
                                        ...LTData,
                                        DiscountId: e.target.value,
                                        DiscountApprovedBy: "",
                                        DiscountReason: "",
                                      });
                                    } else {
                                      toast.error(t("Discount Already Given"));
                                    }
                                  }}
                                />
                              )
                            )}
                          </div>
                          <div className="col-sm-3 col-4">
                            {LTData?.DiscountId === "" ? (
                              <SelectBox
                                className={
                                  // DefaultCurrencyName !== "KES" &&
                                  (Number(discountPercentage) > 0 ||
                                    Number(disAmt) > 0)
                                    ? "required-fields"
                                    : ""
                                }
                                options={BindDiscReason}
                                name="DiscountReason"
                                selectedValue={LTData?.DiscountReason}
                                onChange={handleSelectChange}
                                isDisabled={
                                  throughMemberData ||
                                  throughFamilyData ||
                                  coupon?.field ||
                                  LTData?.DiscountId != "" ||
                                  !hasActiveDiscount
                                }
                              />
                            ) : (
                              <Input
                                className={DefaultCurrencyName !== "KES" &&
                                  (Number(discountPercentage) > 0 ||
                                    Number(disAmt) > 0)
                                  ? "required-fields"
                                  : ""
                                }
                                name="DiscountReason"
                                lable="Discount Reason"
                                placeholder=" "
                                value={LTData?.DiscountReason}
                                onChange={handleSelectChange}
                              />
                            )}
                          </div>
                          {applicableDiscount > 0 && (
                            <div className="col-12">
                              <DiscountBearBy
                                totalDiscount={applicableDiscount}
                                value={discountBearBy}
                                onChange={setDiscountBearBy}
                                locked={isManagementLocked}
                              />
                            </div>
                          )}

                          {/* copayment */}
                          {DefaultCurrencyName === "KES" && (
                            <>
                              <div className="col-sm-3 col-6">
                                <Input
                                  lable={t("Co-Pay%")}
                                  value={CoPaymentPercentage}
                                  onChange={handlePercentageChange}
                                  disabled={isCoPayment == 0 ? true : false}
                                />
                              </div>

                              <div className="col-sm-3 col-6">
                                <Input
                                  placeholder="0"
                                  lable={t("paybypatient")}
                                  value={
                                    isCoPayment == 0
                                      ? payByPanelTotal
                                      : payByPatientTotal
                                  }
                                  disabled={isCoPayment == 0 ? true : false}
                                  onChange={(e) => {
                                    Number(setPayByPatientTotal(e.target.value))
                                    // setCoPaymentPercentage("");
                                  }}
                                  onBlur={(e) =>
                                    handlePatientChange(e.target.value)
                                  }
                                />
                              </div>

                              <div className="col-sm-3 col-6">
                                <Input
                                  lable={t("paybypanel")}
                                  readOnly
                                  // value={payByPanelTotal}
                                  value={
                                    isCoPayment == 0
                                      ? payByPatientTotal
                                      : payByPanelTotal
                                  }
                                />
                              </div>
                            </>
                          )}
                          {/* copayment ends */}
                          {LTData.DiscountReason === "Other" && (
                            <div className="col-9">
                              <Input
                                name="OtherDiscountReason"
                                lable="Other Discount Reason"
                                placeholder=" "
                                value={LTData?.OtherDiscountReason}
                                maxLength={98}
                                onChange={(e) => {
                                  setLTData({
                                    ...LTData,
                                    OtherDiscountReason: e.target.value,
                                  });
                                }}
                              />
                            </div>
                          )}
                        </div>
                        <div className="row d-none">
                          <div className="col-sm-4 col-6">
                            <div className="d-flex">
                              <div style={{ width: "87%" }}>
                                <Input
                                  id="CouponCode"
                                  lable="Enter Your Coupon Code"
                                  type="text"
                                  value={coupon.code}
                                  max={30}
                                  placeholder={" "}
                                  disabled={coupon.field}
                                  onChange={(e) =>
                                    setCoupon({
                                      ...coupon,
                                      code: e.target.value,
                                    })
                                  }
                                />
                              </div>
                              <div style={{ width: "13%" }}>
                                <button
                                  className="btn btn-primary btn-sm"
                                  type="button"
                                  style={{ borderRadius: "0px !important" }}
                                  onClick={handleCouponDetailsModal}
                                >
                                  <i
                                    className="fa fa-search coloricon"
                                    style={{ cursor: "pointer" }}
                                  ></i>
                                </button>
                              </div>
                            </div>
                          </div>
                          <div className="col-sm-2 col-3">
                            {coupon?.load ? (
                              <Loading />
                            ) : (
                              // <button
                              //   className="btn btn-success btn-block btn-sm"
                              //   onClick={handleCouponValidate}
                              //   disabled={coupon.field}
                              // >
                              //   {"Validate"}
                              // </button>
                              <CustomButton
                                text={"Validate"}
                                className="btn-block"
                                onClick={handleCouponValidate}
                                disabled={coupon.field}
                              />
                            )}
                          </div>
                          <div className="col-sm-2 col-3">
                            {/* <button
                      id="btndeleterow"
                      className="btn btn-danger btn-block btn-sm"
                      onClick={handleCouponCancel}
                    >
                      {"Cancel"}
                    </button> */}
                            <CancelButton
                              text={"Cancel"}
                              id="btndeleterow"
                              className="btn-block"
                              onClick={handleCouponCancel}
                            />
                          </div>
                        </div>

                        <div className="row">
                          <div className="col-sm-3 col-6">
                            <Input
                              name="CashRendering"
                              lable={t("Cash Rendering")}
                              id="CashRendering"
                              value={LTData?.CashRendering}
                              placeholder=" "
                              onChange={handleSelectChange}
                            />
                          </div>

                          <div
                            className={`col-sm-3 col-6 ${!isHideController("CollectionCharges") && "d-none"}`}
                          >
                            <Input
                              name="CollectionCharges"
                              lable={t("Collection Charges")}
                              id="CollectionCharges"
                              value={LTData?.CollectionCharges}
                              placeholder=" "
                              onChange={handleSelectChange}
                            />
                          </div>

                          {Number(LTData?.CashRendering) -
                            Number(LTData?.NetAmount) >
                            0 ? (
                            <div className="col-sm-3 col-6">
                              <Input
                                name="Return"
                                value={
                                  Number(LTData?.CashRendering) -
                                  Number(LTData?.NetAmount)
                                }
                                lable={t("Return")}
                                placeholder=" "
                                disabled={true}
                              />
                            </div>
                          ) : (
                            ""
                          )}
                        </div>
                        <div className="pr-booking-table-desktop-grid">
                          <Tables>
                            <thead className="cf">
                              <tr>
                                <th className="text-center">
                                  <i className="fa fa-trash"></i>
                                </th>
                                <th>{t("Mode")}</th>
                                <th>{t("Paid Amount")}</th>
                                {!isMobileView && <th>{t("Currency")}</th>}
                                {!isMobileView && <th>{t("Base")}</th>}
                                <th>{t("Bank Name")}</th>
                                <th>
                                  {DefaultCurrencyName === "KES"
                                    ? t("Reference No")
                                    : t("Ch/C No.")}
                                </th>
                                <th>{t("Ch.D/T No")}</th>
                                {DefaultCurrencyName === "KES" && (
                                  <th>{t("Action")}</th>
                                )}
                              </tr>
                            </thead>
                            <tbody>
                              {RcData?.map((data, index) => {
                                const isMpesaLocked =
                                  data?.PaymentMode === "M-Pesa" &&
                                  data?.isMpesaAuto;

                                return (
                                  <tr
                                    key={index}
                                    style={{
                                      pointerEvents: isMpesaLocked
                                        ? "none"
                                        : "auto",
                                      opacity: isMpesaLocked ? 0.6 : 1,
                                      backgroundColor: isMpesaLocked
                                        ? "#f5f5f5"
                                        : "transparent",
                                    }}
                                  >
                                    <td data-title={t("Action")}>
                                      <div>
                                        <CloseButton
                                          handleClick={() => {
                                            handleFilterPayment(index);
                                          }}
                                        />
                                      </div>
                                    </td>
                                    <td data-title={t("Mode")}>
                                      <span id="SpanPaymentMode">
                                        {t(data?.PaymentMode)} &nbsp;
                                      </span>
                                    </td>
                                    <td data-title={t("Paid Amount")}>
                                      {handleRateTypePaymode === "Credit" &&
                                        DefaultCurrencyName === "KES" &&
                                        isCoPayment == 0 ? (
                                        ""
                                      ) : (
                                        <Input
                                          name="Amount"
                                          value={data?.Amount}
                                          // value={
                                          //   data?.PaymentMode === "Cash" && AutoFillPaidAmount == 1
                                          //     ? LTData?.NetAmount
                                          //     : data?.Amount
                                          // }
                                          disabled={
                                            data?.PaymentMode === "M-Pesa" &&
                                            data?.isMpesaAuto
                                          }
                                          placeholder={"0.00"}
                                          type="number"
                                          onChange={(e) => {
                                            pendingPaidRef.current = 0;
                                            let sum = calculate(
                                              e.target.value,
                                              index,
                                            );

                                            if (
                                              sum >
                                              (DefaultCurrencyName === "KES" &&
                                                isCoPayment == 1
                                                ? payByPatientTotal
                                                : LTData?.NetAmount) ||
                                              e.target.value >
                                              (DefaultCurrencyName === "KES" &&
                                                isCoPayment == 1
                                                ? Number(payByPatientTotal)
                                                : LTData?.NetAmount)
                                            ) {
                                              toast.error(
                                                "Please Enter Correct Amount",
                                              );
                                              const data = [...RcData];
                                              data[index]["Amount"] = "";
                                              calculate("", index);
                                              setRcData(data);
                                            } else {
                                              const data = [...RcData];
                                              data[index]["Amount"] =
                                                e.target.value;
                                              setRcData(data);
                                            }
                                          }}
                                        />
                                      )}
                                    </td>
                                    {!isMobileView && (
                                      <td data-title={t("Currency")}>
                                        <span id="SpanCurrency">
                                          {DefaultCurrencyName || "INR"}
                                        </span>
                                      </td>
                                    )}
                                    {!isMobileView && (
                                      <td data-title={t("Base")}>
                                        <span id="spnbaseAmount">
                                          {data?.Amount} &nbsp;
                                        </span>
                                      </td>
                                    )}
                                    <td data-title={t("Bank Name")}>
                                      {[
                                        "Cash",
                                        "Online Payment",
                                        "Paytm",
                                        "M-Pesa",
                                        "M-Pesa-2",
                                      ].includes(data?.PaymentMode) ? (
                                        ""
                                      ) : (
                                        <select
                                          className="required"
                                          name="BankName"
                                          value={data?.BankName}
                                          disabled={
                                            handleRateTypePaymode === "Credit"
                                              ? true
                                              : false
                                          }
                                          onChange={(e) =>
                                            handleChangeRTCData(e, index)
                                          }
                                        >
                                          <option hidden>--Select Bank --</option>
                                          {BankName.map((ele, index) => (
                                            <option value={ele.value} key={index}>
                                              {ele.label}
                                            </option>
                                          ))}
                                        </select>
                                      )}
                                      &nbsp;
                                    </td>
                                    <td data-title={t("Cheque/Card No.")}>
                                      <Input
                                        disabled={
                                          DefaultCurrencyName === "KES" &&
                                          isCoPayment == 0 &&
                                          ([
                                            "Cash",
                                            "Online Payment",
                                            "Paytm",
                                          ].includes(data?.PaymentMode) ||
                                            handleRateTypePaymode === "Credit")
                                        }
                                        type="text"
                                        id="CardNo"
                                        // {DefaultCurrencyName === "KES"
                                        //   ? t("RateType/Scheme/B2B")
                                        //   : t("RateType")}
                                        onInput={(e) => {
                                          if (DefaultCurrencyName !== "KES") {
                                            number(e, 16);
                                          }
                                        }}
                                        name="CardNo"
                                        title={data?.CardNo}
                                        readOnly={
                                          data?.PaymentMode === "M-Pesa" &&
                                          data?.isMpesaAuto
                                        }
                                        value={data?.CardNo}
                                        onChange={(e) =>
                                          handleChangeRTCData(e, index)
                                        }
                                        className={`select-input-box form-control input-sm ${[
                                          "Cash",
                                          "Online Payment",
                                          "Paytm",
                                        ].includes(data?.PaymentMode)
                                          ? data?.PaymentMode === "M-Pesa"
                                            ? "required-fields"
                                            : ""
                                          : "required-fields"
                                          }`}
                                      />
                                    </td>
                                    <td data-title={t("Cheque Date/Trans No")}>
                                      <Input
                                        disabled={
                                          data?.PaymentMode !== "Cash"
                                            ? handleRateTypePaymode === "Credit"
                                              ? true
                                              : false
                                            : true
                                        }
                                        type={
                                          [
                                            "Cash",
                                            "Online Payment",
                                            "Paytm",
                                          ].includes(data?.PaymentMode)
                                            ? "text"
                                            : "date"
                                        }
                                        id="CardDate"
                                        className={`select-input-box form-control input-sm ${[
                                          "Cash",
                                          "Online Payment",
                                          "Paytm",
                                        ].includes(data?.PaymentMode)
                                          ? ""
                                          : "required"
                                          }`}
                                        name="CardDate"
                                        value={data?.CardDate}
                                        onChange={(e) =>
                                          handleChangeRTCData(e, index)
                                        }
                                      />
                                    </td>
                                    {DefaultCurrencyName === "KES" && (
                                      <td data-title={t("Action")}>
                                        {data?.PaymentMode === "M-Pesa" &&
                                          (isMpesaSelected || isHavingMpesa) &&
                                          !mpesaCardNo && (
                                            <SaveButton
                                              text={"Make Payment"}
                                              className="text-white btn-success"
                                              type="submit"
                                              onClick={handleMakePayment}
                                            />
                                          )}
                                      </td>

                                    )}
                                  </tr>
                                );
                              })}
                            </tbody>
                          </Tables>
                          </div>

                        <div className="row mt-2 mb-1">
                          {/* {(isMpesaSelected || isHavingMpesa) && !mpesaCardNo && (
                        <div className="col-sm-2 order-4 order-sm-1">
                          <SaveButton
                            text={"Make Payment"}
                            className="text-white btn-success"
                            type="submit"
                            onClick={handleMakePayment}
                          />
                        </div>
                      )} */}
                          <div className={isMobileView ? "col-6 order-4" : "col-sm-2 order-4 order-sm-1 "}>
                            {(isSubmit?.isLoading &&
                              isSubmit?.type === "Success") ||
                              load ||
                              isRazorPayOpen ? (
                              <Loading />
                            ) : (
                              // <button
                              //   type="submit"
                              //   id="btnSave"
                              //   // disabled={handleLockRegistation}
                              //   className="btn btn-success w-100 btn-sm"
                              //   onClick={() => {
                              //     handleSubmit();
                              //     window.scrollTo(0, 0);
                              //   }}
                              //   onKeyDown={(e)=>handleIndex(e, 'btnSave')}
                              // >
                              //   {t("Submit")}
                              // </button>
                              <SaveButton
                                text={"Submit"}
                                className={`text-white btn-success ${isMobileView ? "btn-block mt-2" : ""}`}
                                id="btnSave"
                                type="submit"
                                disabled={isSubmit?.isLoading || load}
                                onClick={() => {
                                  handleSubmit();
                                  window.scrollTo(0, 0);
                                }}
                                onKeyDown={(e) => handleIndex(e, "btnSave")}
                              />
                            )}
                          </div>

                          {userdata?.CompanyID === 999 && (
                            <div className="col-sm-4 order-4 order-sm-1s d-flex align-items-center">
                              <label className="switch">
                                <input
                                  type="checkbox"
                                  // checked={payload.isActive === 1}
                                  checked={isActive}
                                  onChange={() => setIsActive(!isActive)}
                                />
                                <span className="slider"></span>
                              </label>
                              <strong className="ml-2 mb-2">
                                {t("ConsentForCommunication")}
                              </strong>
                            </div>
                          )}

                          {state?.HideAmount != 1 && (
                            <label className={isMobileView ? "col-6 order-1" : "col-sm-3 col-4 order-1 order-sm-2"}>
                              {t("Due Amount")}:{" "}
                              {hideRate != 1
                                ? (Math.max(0, (parseFloat(LTData?.NetAmount) || 0) - (parseFloat(paid) || 0) - radiologyPrePaidAmount)).toFixed(2)
                                : ""}
                            </label>
                          )}
                          {state?.HideAmount != 1 && (
                            <label className={isMobileView ? "col-6 order-3 pr-total-discount-mobile" : "col-sm-4 col-4 order-2 order-sm-3"}>
                              {t("Total Discount Amount")}:{" "}
                              {hideRate != 1 && parseFloat(LTData?.GrossAmount) > parseFloat(LTData?.NetAmount)
                                ? ((parseFloat(LTData?.GrossAmount) || 0) - (parseFloat(LTData?.NetAmount) || 0)).toFixed(2)
                                : " 0"}
                            </label>
                          )}
                          <div
                            id={"BillingRemarks"}
                            className={`${!isHideController("BillingRemarks") && "d-none"} ${isMobileView ? "col-6 order-2" : "col-sm-3 col-4 order-3"}`}
                          >
                            <button
                              className="btn btn-success btn-block btn-sm mt-2"
                              onClick={() => {
                                setShowRemark(true);
                              }}
                            >
                              {t("Billing Remarks")}
                            </button>
                          </div>
                        </div>
                        {suggestionData.show &&
                          (suggestionData?.testSuggestions?.show ||
                            suggestionData?.packageSuggestions?.show) && (
                            <>
                              <SpeedDialWithDrawer
                                initialShow={suggestionData.show}
                                actions={[]}
                                title={t(
                                  `${suggestionData?.testSuggestions?.show ? "Abnormal Test" : "Suggestive Packages"}`,
                                )}
                              >
                                {suggestionData?.testSuggestions?.show && (
                                  <PackageSuggestion
                                    view={suggestionData?.testSuggestions?.show}
                                    // title={"Abnormal Test"}
                                    data={suggestionData?.testSuggestions?.data}
                                    testData={testDataArray}
                                    handleSuggestion={(data) =>
                                      handleListSearch(data, "TestName")
                                    }
                                    handleViewTestDetails={(data) => {
                                      setSuggestionData((ele) => ({
                                        ...ele,
                                        viewTestModal: true,
                                        viewTestModalId: data,
                                      }));
                                    }}
                                    suggestionData={suggestionData}
                                    setSuggestionData={setSuggestionData}
                                    onClose={() =>
                                      setSuggestionData((prev) => ({
                                        ...prev,
                                        testSuggestions: {
                                          ...prev.testSuggestions,
                                          show: false,
                                        },
                                      }))
                                    }
                                  />
                                )}
                                {suggestionData?.packageSuggestions?.show && (
                                  <PackageSuggestion
                                    view={suggestionData?.packageSuggestions?.show}
                                    title={"Suggestive Packages"}
                                    data={suggestionData?.packageSuggestions?.data}
                                    testData={testDataArray}
                                    handleSuggestion={(data) =>
                                      handleListSearch(data, "TestName")
                                    }
                                    handleViewTestDetails={(data) => {
                                      setSuggestionData((ele) => ({
                                        ...ele,
                                        viewTestModal: true,
                                        viewTestModalId: data,
                                      }));
                                    }}
                                    suggestionData={suggestionData}
                                    setSuggestionData={setSuggestionData}
                                  />
                                )}
                              </SpeedDialWithDrawer>
                            </>
                          )}
                        {/* {suggestionData.show && (
                    <Dialog
                      header={t(`Test Suggestions ${ ' ' } ( ${ suggestionData?.testSuggestions?.show ? "Abnormal Test" : "Suggestive Packages" } )`)}
                      visible={suggestionData?.show}
                      style={{ width: isMobileSize ? "50vw" : "90vw" }}
                      onHide={() => setSuggestionData(prev => ({ ...prev, show: false }))}
                      draggable={false}
                      className={theme}
                     >
                      {suggestionData?.testSuggestions?.show && (
                        <PackageSuggestion
                          view={suggestionData?.testSuggestions?.show}
                          title={"Abnormal Test"}
                          data={suggestionData?.testSuggestions?.data}
                          testData={testDataArray}
                          handleSuggestion={(data) =>
                            handleListSearch(data, "TestName")
                          }
                          handleViewTestDetails={(data) => {
                            setSuggestionData((ele) => ({
                              ...ele,
                              viewTestModal: true,
                              viewTestModalId: data,
                            }));
                          }}
                          suggestionData={suggestionData}
                          setSuggestionData={setSuggestionData}
                          onClose={() =>
                            setSuggestionData((prev) => ({
                              ...prev,
                              testSuggestions: {
                                ...prev.testSuggestions,
                                show: false,
                              },
                            }))
                          }
                        />
                      )}
                      {suggestionData?.packageSuggestions?.show && (
                        <PackageSuggestion
                          view={suggestionData?.packageSuggestions?.show}
                          title={"Suggestive Packages"}
                          data={suggestionData?.packageSuggestions?.data}
                          testData={testDataArray}
                          handleSuggestion={(data) =>
                            handleListSearch(data, "TestName")
                          }
                          handleViewTestDetails={(data) => {
                            setSuggestionData((ele) => ({
                              ...ele,
                              viewTestModal: true,
                              viewTestModalId: data,
                            }));
                          }}
                        />
                      )}
                    </Dialog>
                  )} */}
                      </div>
                    )}

                  {selectedRateType?.AgainstInvoice !== 3 && (
                    <div
                      style={{ width: "50%" }}
                      className={` pt-2 pl-2 pr-3 col-md-6 col-sm-12 col-12 ${isMobileView ? "pr-total-amount-mobile" : ""}`}
                    >
                      {/* total amount */}
                      {hideRate == 0 && (
                        <div className="row">
                          <div className="col-sm-3 col-6">
                            <Input
                              data-val="false"
                              placeholder=" "
                              lable={t("Total Amount")}
                              id="Total_Amount"
                              name="Total_Amount"
                              disabled={true}
                              type="text"
                              value={
                                hideRate === 1
                                  ? ""
                                  : Number(LTData?.NetAmount).toFixed(2)
                              }
                              readOnly="readonly"
                            />
                          </div>
                        </div>

                      )}

                      {/* Sample-type barcode entry — self-gated by
                          PayMode === "Credit" && AgainstInvoice !== 3 inside
                          ShowBarcodeGroupForLogicFour itself. */}
                      {ShowBarcodeGroupForLogicFour()}

                      {selectedRateType?.PayMode &&
                        selectedRateType?.PayMode === "Credit" &&
                        selectedRateType?.AgainstInvoice !== 3 && (
                          <div className="row mt-2 mb-1">
                            <div className="col-sm-2 order-4 order-sm-1 ">
                              {(isSubmit?.isLoading &&
                                isSubmit?.type === "Success") ||
                                load ||
                                isRazorPayOpen ? (
                                <Loading />
                              ) : (
                                // <button
                                //   type="submit"
                                //   id="btnSave"
                                //   // disabled={handleLockRegistation}
                                //   className="btn btn-success w-100 btn-sm"
                                //   onClick={() => {
                                //     handleSubmit();
                                //     window.scrollTo(0, 0);
                                //   }}
                                // >
                                //   {t("Submit")}
                                // </button>
                                <SaveButton
                                  text={"Submit"}
                                  className="text-white btn-success"
                                  id="btnSave"
                                  type="submit"
                                  disabled={isSubmit?.isLoading || load}
                                  onClick={() => {
                                    handleSubmit();
                                    window.scrollTo(0, 0);
                                  }}
                                />
                              )}
                            </div>
                          </div>
                        )}
                    </div>
                  )}
                </div>
              </Accordion>
            )}
          </MobileStepper>
        </div>
        {showScanPanel && (
          <div className="col-md-4">
            <TRFScanner
              onDataExtracted={handleDataExtracted}
              onClose={() => {
                setShowScanPanel(false);
                setTrfImages([]);
                sessionStorage.removeItem("pendingTRFs");
              }}
              images={trfImages}
              onCapture={handleTrfFilesUpload}
              onRemove={handleRemoveTrfImage}
            />
          </div>
        )}
      </div>

      <PatientRegistrationModal
        show={toggleRefLabModal}
        onHide={handleToggleRefLabModal}
      />
      {tooltipData.position && tooltipData.testNames.length > 0 && (
        <CustomTooltip
          testNames={tooltipData.testNames}
          position={tooltipData.position}
          rowIndex={tooltipData.rowIndex}
          totalRows={uniqueSampleTypesName.length} // or tableData.length
        />
      )}

      {/* ===== Check For Marker Test Modal ===== */}
      <Dialog
        header={t("Check For Marker Test")}
        visible={showMarker}
        style={{ width: "650px", maxWidth: "98vw" }}
        onHide={() => {
          setShowMarker(false);
          setMarkerResults([]);
        }}
        draggable={false}
        className={theme}
      >
        {(() => {
          const labelCellStyle = {
            padding: "8px 10px",
            fontWeight: "600",
            fontSize: "13px",
            width: "45%",
            border: "1px solid #d0e8b0",
            background: "#f0f8e8",
            textAlign: "left",
          };
          const valueCellStyle = {
            padding: "6px 10px",
            border: "1px solid #d0e8b0",
            background: "#fff",
          };
          return (
            <>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <tbody>
                  {/* SCAN DATE */}
                  <tr>
                    <td style={labelCellStyle}>SCAN DATE</td>
                    <td style={valueCellStyle}>
                      <DatePicker
                        id="scanDate"
                        name="scanDate"
                        lable="Scan Date"
                        value={
                          markerData.scanDate
                            ? new Date(markerData.scanDate)
                            : new Date()
                        }
                        maxDate={new Date()}
                        onChange={(value, name) =>
                          setMarkerData({
                            ...markerData,
                            [name]: value,
                          })
                        }
                      />
                    </td>
                  </tr>
                  {/* SAMPLE COLLECTION */}
                  <tr>
                    <td style={labelCellStyle}>SAMPLE COLLECTION</td>
                    <td style={valueCellStyle}>
                      <DatePicker
                        id="sampleCollection"
                        name="sampleCollection"
                        lable="Sample Collection"
                        value={
                          markerData.sampleCollection
                            ? new Date(markerData.sampleCollection)
                            : new Date()
                        }
                        maxDate={new Date()}
                        onChange={(value, name) =>
                          setMarkerData({
                            ...markerData,
                            [name]: value,
                          })
                        }
                      />
                    </td>
                  </tr>
                  {/* GESTATIONAL WEEK */}
                  <tr>
                    <td style={labelCellStyle}>GESTATIONAL WEEK</td>
                    <td style={valueCellStyle}>
                      <Input
                        type="number"
                        value={markerData.gestationalWeek}
                        min={0}
                        max={40}
                        placeholder=""
                        onChange={(e) => {
                          const val = e.target.value;
                          if (Number(val) > 40) {
                            toast.error(
                              "Please Enter Valid week which is equal to 40 or less than 40",
                            );
                            return;
                          }
                          setMarkerData((prev) => ({
                            ...prev,
                            gestationalWeek: val,
                          }));
                        }}
                      />
                    </td>
                  </tr>
                  {/* GESTATIONAL DAYS */}
                  <tr>
                    <td style={labelCellStyle}>GESTATIONAL DAYS</td>
                    <td style={valueCellStyle}>
                      <Input
                        type="number"
                        value={markerData.gestationalDays}
                        min={0}
                        max={7}
                        placeholder=""
                        onChange={(e) => {
                          const val = e.target.value;
                          if (Number(val) > 7) {
                            toast.error(
                              "Please Enter Valid days which is equal to 7 or less than 7",
                            );
                            return;
                          }
                          setMarkerData((prev) => ({
                            ...prev,
                            gestationalDays: val,
                          }));
                        }}
                      />
                    </td>
                  </tr>
                  {/* DATE (DOB for age calculation) */}
                  <tr>
                    <td style={labelCellStyle}>DOB</td>
                    <td style={valueCellStyle}>
                      <DatePicker
                        id="age"
                        name="age"
                        lable="Age"
                        value={
                          markerData.age ? new Date(markerData.age) : new Date()
                        }
                        maxDate={new Date()}
                        onChange={(value, name) =>
                          setMarkerData({
                            ...markerData,
                            [name]: value,
                          })
                        }
                      />
                    </td>
                  </tr>
                </tbody>
              </table>

              {/* Footer Buttons */}
              <div
                style={{
                  textAlign: "center",
                  marginTop: "20px",
                  display: "flex",
                  justifyContent: "center",
                  gap: "10px",
                }}
              >
                <CustomButton
                  type="button"
                  text={"Check"}
                  onClick={handleMarkerTest}
                />
                <CustomButton
                  type="button"
                  text={"Cancel"}
                  onClick={() => {
                    setMarkerData({
                      scanDate: new Date(),
                      sampleCollection: new Date(),
                      gestationalWeek: "",
                      gestationalDays: "",
                      age: "",
                    });
                    setMarkerResults([]);
                    setShowMarker(false);
                  }}
                />
              </div>

              {/* Results Table Integrated Below Form */}
              {markerResults.length > 0 && (
                <div style={{ marginTop: "30px" }}>
                  <hr
                    style={{
                      borderTop: "1px solid #d0e8b0",
                      marginBottom: "20px",
                    }}
                  />
                  <strong
                    style={{
                      display: "block",
                      marginBottom: "10px",
                      color: "#3c763d",
                    }}
                  >
                    Marker Test List
                  </strong>
                  <div className="table-responsive">
                    <table className="table table-bordered table-hover table-sm">
                      <thead style={{ background: "#f5f5f5" }}>
                        <tr>
                          <th style={{ padding: "8px" }}>Test Code</th>
                          <th style={{ padding: "8px" }}>Test Name</th>
                          <th
                            style={{ padding: "8px" }}
                            className="text-center"
                          >
                            Action
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {markerResults.map((test, index) => (
                          <tr key={index}>
                            <td style={{ padding: "8px" }}>{test.testCode}</td>
                            <td style={{ padding: "8px" }}>{test.testName}</td>
                            <td
                              style={{ padding: "8px" }}
                              className="text-center"
                            >
                              <button
                                type="button"
                                className="btn btn-success btn-sm"
                                style={{
                                  padding: "2px 10px",
                                  fontSize: "12px",
                                }}
                                onClick={() => {
                                  // Ensure InvestigationID and CentreID are present
                                  const testId =
                                    test.InvestigationID ||
                                    test.investigationID ||
                                    test.investigationId ||
                                    test.investigationid ||
                                    test.testID ||
                                    test.testId ||
                                    test.TestID ||
                                    test.TestId ||
                                    test.id ||
                                    test.Id;
                                  const testWithIds = {
                                    ...test,
                                    InvestigationID: testId,
                                    CentreID:
                                      state?.RateID ||
                                      test.centreID ||
                                      LTData?.CentreID,
                                    isFromMarkerModal: true,
                                  };
                                  if (testId) {
                                    toast.info(
                                      `Adding test: ${test.testName || test.TestName} (${testId})`,
                                    );
                                    validtabledata(testWithIds, "test", false);
                                  } else {
                                    toast.error(
                                      "Could not find ID for this test",
                                    );
                                    console.error(
                                      "No ID found in test object:",
                                      test,
                                    );
                                  }
                                }}
                              >
                                Add
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </>
          );
        })()}
      </Dialog>

      {/* ===== Hidden Required Fields Modal ===== */}
      {hiddenRequiredModal.show && (
        <Dialog
          header="Required Information"
          visible={hiddenRequiredModal.show}
          style={{ width: "420px", maxWidth: "98vw" }}
          onHide={() =>
            setHiddenRequiredModal((prev) => ({ ...prev, show: false }))
          }
          draggable={false}
          className={theme}
          footer={
            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                gap: "8px",
                padding: "4px 0",
              }}
            >
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() =>
                  setHiddenRequiredModal((prev) => ({ ...prev, show: false }))
                }
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-primary btn-sm"
                onClick={() => {
                  // Validate that all hidden required fields are filled
                  const localVals = hiddenRequiredModal.localValues;
                  const missingFields = hiddenRequiredModal.fields.filter(
                    (f) => {
                      const v = localVals[f.controlId];
                      return (
                        !v ||
                        v.toString().trim() === "" ||
                        v.toString().trim() === "0"
                      );
                    },
                  );

                  if (missingFields.length > 0) {
                    setHiddenRequiredModal((prev) => ({
                      ...prev,
                      errors: missingFields.map((f) => f.controlId),
                    }));
                    toast.error(
                      `Please fill all required fields highlighted in red`,
                    );
                    return;
                  }

                  // Update parent states based on field mapping
                  const stateUpdates = {};
                  const ltDataUpdates = {};

                  Object.entries(localVals).forEach(([key, val]) => {
                    if (key in state) stateUpdates[key] = val;
                    if (key in LTData) ltDataUpdates[key] = val;
                    // Ensure secondary mapping works
                    if (key === "PatientIDProofNo") ltDataUpdates[key] = val;
                    if (key === "HouseNo") stateUpdates[key] = val;
                  });

                  if (Object.keys(stateUpdates).length > 0)
                    setState((prev) => ({ ...prev, ...stateUpdates }));
                  if (Object.keys(ltDataUpdates).length > 0)
                    setLTData((prev) => ({ ...prev, ...ltDataUpdates }));

                  setHiddenRequiredModal((prev) => ({
                    ...prev,
                    show: false,
                    errors: [],
                  }));
                }}
              >
                Save
              </button>
            </div>
          }
        >
          <p style={{ marginBottom: "12px", fontSize: "13px", color: "#555" }}>
            The following details are required for the selected test(s). Please
            fill them before saving.
          </p>
          <div className="row">
            {hiddenRequiredModal.fields.map((field) => (
              <div key={field.controlId} className="col-12 mb-3">
                <label
                  style={{
                    display: "block",
                    fontWeight: "600",
                    fontSize: "13px",
                    marginBottom: "4px",
                  }}
                >
                  {field.label}
                  <span style={{ color: "red", marginLeft: "2px" }}>*</span>
                </label>
                <input
                  type="text"
                  className={`form-control form-control-sm ${hiddenRequiredModal.errors.includes(field.controlId)
                    ? "border-danger"
                    : ""
                    }`}
                  style={
                    hiddenRequiredModal.errors.includes(field.controlId)
                      ? { backgroundColor: "#fff5f5" }
                      : {}
                  }
                  value={hiddenRequiredModal.localValues[field.controlId] || ""}
                  placeholder={`Enter ${field.label}`}
                  onChange={(e) => {
                    const val = e.target.value;
                    setHiddenRequiredModal((prev) => ({
                      ...prev,
                      localValues: {
                        ...prev.localValues,
                        [field.controlId]: val,
                      },
                      // Clear individual error when user starts typing
                      errors: prev.errors.filter(
                        (id) => id !== field.controlId,
                      ),
                    }));
                  }}
                />
              </div>
            ))}
          </div>
        </Dialog>
      )}

      {duplicateParamModal.show && (
        <Dialog
          header="Duplicate Parameter Booking"
          visible={duplicateParamModal.show}
          style={{ width: "720px", maxWidth: "98vw" }}
          onHide={() =>
            setDuplicateParamModal({ show: false, data: [] })
          }
          draggable={false}
          className={theme}
          footer={
            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                gap: "8px",
                padding: "4px 0",
              }}
            >
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() =>
                  setDuplicateParamModal({ show: false, data: [] })
                }
              >
                Close
              </button>
            </div>
          }
        >
          <p style={{ marginBottom: "12px", fontSize: "13px", color: "#555" }}>
            The following parameter(s) are booked in more than one
            investigation. Please review the duplicates below.
          </p>
          <div className="table-responsive">
            <Tables>
              <thead>
                <tr>
                  <th style={{ padding: "8px" }}>{t("Parameter Name")}</th>
                  <th style={{ padding: "8px" }}>{t("Investigation Name")}</th>
                </tr>
              </thead>
              <tbody>
                {duplicateParamModal.data.map((item, index) => (
                  <tr key={index}>
                    <td style={{ padding: "8px", fontWeight: 600 }}>
                      {item?.ParameterName}
                    </td>
                    <td style={{ padding: "8px" }}>
                      {(item?.InvestigationName || "")
                        .split(",")
                        .map((inv, i) => (
                          <div key={i}>{inv.trim()}</div>
                        ))}
                    </td>

                  </tr>
                ))}
              </tbody>
            </Tables>
          </div>
        </Dialog>
      )}

      <Dialog
        visible={showFamilyDialog}
        header={t("Select Family Member")}
        style={{ width: "80vw" }}
        className={theme || ""}
        onHide={() => setShowFamilyDialog(false)}
      >
        <div className="card shadow-sm p-2">
          <div className="table-responsive">
            <Tables>
              <thead>
                <tr>
                  <th style={{ padding: "8px" }}>{t("Action")}</th>
                  <th style={{ padding: "8px" }}>{t("Patient Name")}</th>
                  <th style={{ padding: "8px" }}>{t("Age/Gender")}</th>
                  <th style={{ padding: "8px" }}>{t("Relation")}</th>
                  <th style={{ padding: "8px" }}>{t("Policy Name")}</th>
                  <th style={{ padding: "8px" }}>{t("Mobile")}</th>
                </tr>
              </thead>
              <tbody>
                {familyMemberData.map((item, index) => (
                  <tr key={index}>
                    <td style={{ padding: "8px" }}>
                      <CustomButton
                        text={t("Select")}
                        onClick={() => handleSelectFamilyMember(item)}
                      />
                    </td>
                    <td
                      style={{ padding: "8px" }}
                    >{`${item.Title} ${item.Name}`}</td>
                    <td
                      style={{ padding: "8px" }}
                    >{`${item.Age || ""} - ${item.Gender || ""}`}</td>
                    <td style={{ padding: "8px" }}>{item.Relation}</td>
                    <td style={{ padding: "8px" }}>{item.PolicyName}</td>
                    <td style={{ padding: "8px" }}>{item.MobileNo}</td>
                  </tr>
                ))}
              </tbody>
            </Tables>
          </div>
        </div>
      </Dialog>

      <Dialog
        visible={showOtherDoctorModal}
        header={t("Other Doctor Name")}
        style={{ width: "30vw" }}
        className={theme || ""}
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
              value={LTData?.OtherDoctorName || ""}
              onChange={(e) => {
                const value = e.target.value;
                setLTData((prev) => ({
                  ...prev,
                  OtherDoctorName: value,
                }));
                // Mirror into the visible Referred Doctor field so it shows
                // the actual typed name instead of staying stuck on
                // "others" — DoctorID/DoctorName in LTData stay fixed at
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
      {userdata?.CompanyID == 1007 &&
        createPortal(
          <VoiceFormFiller
            // ── original (keep as-is) ──
            onTitleChange={handleTitleChange}
            onTextFieldChange={(fieldId, value) =>
              handleMainChange({ target: { name: fieldId, value } })
            }
            onSelectChange={(fieldName, optionObj) =>
              handleSearchSelectChange(fieldName, optionObj)
            }
            onAction={(id) => {
              if (id === "__save__") handleSubmit();
              if (id === "__reset__") handleResetCreateNewPatient();
            }}
            onTestSearch={handleVoiceTestSearch}
            getOptions={getVoiceOptions}
            // ── new ──
            onDobChange={(date, name) => dateSelect(date, name)}
            onSelectMainChange={(name, value) =>
              handleMainChange({ target: { name, value } })
            }
            onSelectLTChange={(name, value) =>
              handleSelectChange({ target: { name, value } })
            }
            onTypeaheadChange={(name, value) => {
              // Directly update formData so the debounced useEffect fires the suggestion API
              setFormData((prev) => ({ ...prev, [name]: value }));
            }}
            onTypeaheadSelect={(name, index) => {
              if (name === "DoctorName") {
                if (doctorSuggestion[index])
                  handleListSearch(doctorSuggestion[index], "DoctorName");
              }
              if (name === "SecondReferDoctor") {
                if (seconddoctorSuggestion[index])
                  handleListSearch(
                    seconddoctorSuggestion[index],
                    "SecondReferDoctor",
                  );
              }
            }}
            onTestSelect={(index) => {
              if (suggestion[index]) {
                handleListSearch(suggestion[index], "TestName");
              }
            }}
            // ── City / State / Country (PrimeReact AutoComplete) ──
            onAutoCompleteChange={(fieldName, value) => {
              if (fieldName === "Country") {
                applyCountryTypedValue(value);
              } else if (fieldName === "State") {
                applyStateTypedValue(value);
              } else if (fieldName === "City") {
                applyCityTypedValue(value);
              }
            }}
            onAutoCompleteSelect={(fieldName, item) => {
              if (fieldName === "Country") {
                const countryName = item?.CountryName || item;
                const countryId = item?.CountryID ?? item?.countryID ?? "";
                setState((prev) => ({
                  ...prev,
                  Country: countryName,
                  CountryID: countryId,
                  State: "",
                  StateID: "",
                  City: "",
                }));
                setAutoCompleteCountry(countryName);
                countryDraftRef.current = countryName;
                countrySelectedRef.current = { name: countryName, id: countryId };
                setAutoCompleteState("");
                stateDraftRef.current = "";
                stateSelectedRef.current = { name: "", id: "" };
              } else if (fieldName === "State") {
                const nextState = item?.State || item?.StateName || (typeof item === "string" ? item : "");
                const nextStateId = item?.ID ?? item?.StateID ?? item?.stateID ?? item?.id ?? item?.value ?? (typeof item === "number" ? item : "");
                setAutoCompleteState(nextState);
                stateDraftRef.current = nextState;
                stateSelectedRef.current = { name: nextState, id: nextStateId };
                rejectedStateRef.current = "";
                clearValidationError("State");
                resetCityForStateChange(nextStateId);
                setState((prev) => ({
                  ...prev,
                  State: nextState,
                  StateID: nextStateId,
                  City: "",
                  CityID: "",
                }));
              } else if (fieldName === "City") {
                const nextCity = item?.City || item?.CityName || (typeof item === "string" ? item : "");
                const nextCityId = item?.ID ?? item?.CityID ?? item?.cityID ?? item?.id ?? item?.value ?? (typeof item === "number" ? item : "");
                setAutoCompleteCity(nextCity);
                cityDraftRef.current = nextCity;
                citySelectedRef.current = { name: nextCity, id: nextCityId };
                rejectedCityRef.current = "";
                clearValidationError("City");
                setState((prev) => ({
                  ...prev,
                  City: nextCity,
                  CityID: nextCityId,
                }));
              }
            }}
            getSampleTypes={() =>
              uniqueSampleTypesName?.filter(
                (s) => s?.toLowerCase()?.trim() !== "na",
              ) || []
            }
            // onBarcodeChange={(sampleName, value) => {
            //   // Mirror your handleBarcodeChange logic — create a fake event
            //   handleBarcodeChange(
            //     { target: { name: sampleName, value } },
            //     sampleName
            //   );
            //   // ── LT Data fields (PatientIDProofNo, ClientRefNumber, OtherLabRefNo) ──
            //   clearValidationError(fieldId);
            //   setLTData((prev) => ({
            //     ...prev,
            //     [fieldId]: value,
            //   }));
            // }}
            onBarcodeChange={(sampleName, value) => {
              handleBarcodeChange(
                { target: { name: sampleName, value } },
                sampleName
              );
              clearValidationError(sampleName);
              setLTData((prev) => ({ ...prev, [sampleName]: value }));
            }}
            onFuhidChange={(value) => {
              setFuhid(value);
            }}
          />,
          document.body,
        )}
    </>
  );
};

export default PatientRegistration;
