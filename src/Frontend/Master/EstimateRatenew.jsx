import React, { useEffect, useMemo, useState } from "react";
import Accordion from "@app/components/UI/Accordion";
import Input from "../../components/formComponent/Input";
import {
  autocompleteOnBlur,
  number,
  statusConfig,
  statusOptions,
} from "../../utils/helpers";
import { useTranslation } from "react-i18next";
import ReactSelect from "../../components/formComponent/ReactSelect";
import { axiosInstance, axiosReport } from "../../utils/axiosInstance";
import { SelectBox } from "../../components/formComponent/SelectBox";
import { LTDataIniti, recordOptions, stateIniti } from "../../utils/Constants";
import DatePicker from "../../components/formComponent/DatePicker";
import moment from "moment";
import Tables from "../../components/UI/customTable";
import RegisterationTable from "../Table/RegisterationTable";
import {
  getBindDiscApproval,
  getDoctorSuggestion,
  getSearchController,
} from "../../utils/NetworkApi/commonApi";
import { toast } from "react-toastify";
import { EstimateBillValidationSchema } from "../../utils/Schema";
import { useRef } from "react";
import MobileDataModal from "../utils/MobileDataModal";
import EstimateRatenewTable from "./EstimateRatenewTable";
import Tooltip from "../../components/formComponent/Tooltip";
import PatientRegisterModal from "../utils/PatientRegisterModal";
import { Link, useNavigate } from "react-router-dom";
import { CustomButton, SaveButton } from "../../components/UI/CustomButton";
import { FaEye, FaUser } from "react-icons/fa";
import { MdFilterListAlt, MdPrint } from "react-icons/md";
import { FiFileText, FiActivity, FiList, FiTerminal } from "react-icons/fi";
import NoRecordFound from "../../components/formComponent/NoRecordFound";
import Loading from "../../components/loader/Loading";
import TableFilterDot from "../../components/FilterTableDot/TableFilterDot";
import { Dialog } from "primereact/dialog";
import { useLocalStorage } from "../../utils/hooks/useLocalStorage";
import TextAreaInput from "../../components/formComponent/TextAreaInput";
import Heading from "../../components/UI/Heading";
import { apiUrls } from "../../utils/apiUrls";
import PageControlGear from "../../components/PageGearModel/PageControlGear";

const EstimateRatenew = () => {
  const { t } = useTranslation();
  const theme = useLocalStorage("theme", "get");
  const [centreData, setCentreData] = useState([]);
  const [rateTypes, setRateTypes] = useState([]);
  const [Title, setTitle] = useState([]);
  const [Gender, setGender] = useState([]);
  const [suggestion, setSuggestion] = useState([]);
  const [tableData, setTableData] = useState([]);
  // Same "Outsource Lab" per-test picker Patient Registration already has
  // (PatientRegistration.jsx) — same config flag, same lab-master endpoint.
  const { AllowOutsourceLabAtRegistration } = useLocalStorage("userData", "get") || {};
  const allowOutsourceLab = Number(AllowOutsourceLabAtRegistration) === 1;
  const [outSourceLabOptions, setOutSourceLabOptions] = useState([]);
  const [disAmt, setdisAmt] = useState("");
  const [PaymentMode, setPaymentMode] = useState([]);
  const [discountPercentage, setDiscountPercentage] = useState("");
  const [testInfoData, setTestInfoData] = useState([]);
  const [selectedRow, setSelectedRow] = useState(null);
  const [showTestInfoModal, setShowTestInfoModal] = useState(false);
  const [BindDiscApproval, setBindDiscApproval] = useState([]);
  const [RateType, setRateType] = useState([]);
  const [tabbingOrder, setTabbingOrder] = useState([]);
  const [controllerDynamicList, setControllerDynamicList] = useState([]);
  const [moreErrors, setMoreErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [throughMemberData, setThroughmemberdata] = useState(false);
  const [indexMatch, setIndexMatch] = useState(0);
  const [BarcodeLogic, setBarcodeLogic] = useState(0);
  const [LTData, setLTData] = useState(LTDataIniti);
  const [searchTest, setSearchTest] = useState("TestName");
  const [lastEstimateData, setLastEstimateData] = useState("");
  const [showLogModal, setShowLogModal] = useState(false);
  const [logData, setLogData] = useState([]);
  const PAGE_ID = "140";
  const [estimateData, setEstimateData] = useState([]);
  const [load, setLoad] = useState(false);
  const [pageReady, setPageReady] = useState(false);
  const [blockMsg, setBlockMsg] = useState("");
  const [recordsPerPage, setRecordsPerPage] = useState(10);
  const [printLoading, setPrintLoading] = useState(false);
  const [showRemarkModal, setShowRemarkModal] = useState(false);
  const [selectedStatusFilter, setSelectedStatusFilter] = useState(null);
  const [modalData, setModalData] = useState({
    estimateNo: "",
    estimateNoHash: "",
    ledgerTransactionNo: "",
    statusId: null,
    remark: "",
  });

  const [state, setState] = useState(stateIniti);
  const [values, setValues] = useState({
    NumberOfRecords: "",
  });
  const formDataInit = {
    DoctorName: "Self",
    SecondReferDoctor: "",
  };
  const [formData, setFormData] = useState(formDataInit);
  const [slotOpen, setSlotOpen] = useState({
    show: false,
    data: "",
  });
  const [DateData, setDateData] = useState({
    AgeYear: "",
    AgeDays: "",
    AgeMonth: "",
  });
  const [coupon, setCoupon] = useState({
    code: "",
    field: false,
    load: false,
  });
  const [RcData, setRcData] = useState([
    {
      PayBy: "Patient",
      ReceiptNo: "",
      ledgerNoCr: "",
      RateTypeId: LTData?.RateTypeID,
      PaymentMode: "Cash",
      PaymentModeID: 134,
      Amount: "",
      BankName: "",
      CardDate: "",
      CardNo: "",
      CentreID: LTData?.CentreID,
    },
  ]);
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
  const handleRecordsChange = (name, selectedOption) => {
    if (name === "NumberOfRecords") {
      setRecordsPerPage(selectedOption?.value);
      getEstimateData(selectedOption?.value);
    }
  };
  const [show4, setShow4] = useState(false);
  const [doctorSuggestion, setDoctorSuggestion] = useState([]);
  const [seconddoctorSuggestion, setseconddoctorSuggestion] = useState([]);

  // const [LTData, setLTData] = useState({
  //   Title: "",
  //   PName: "",
  //   Mobile: "",
  //   Gender: "",
  //   Address: "",
  //   IsDOBActual: "",
  //   Age: "",
  //   AgeYear: "",
  //   AgeMonth: "",
  //   AgeDays: "",
  //   TotalAgeInDays: "",
  //   DOB: "",
  //   Email: "",
  //   RateTypeID: "",
  //   CentreID: "",
  //   ItemId: "",
  //   ItemName: "",
  //   Rate: "",
  //   DiscAmt: "",
  //   Amount: "",
  //   IsPackage: "",
  //   DeliveryDate: "",
  //   DepartmentID: "",
  // });

  const getFieldValue = (controlId) => {
    const fieldMap = {
      FirstName: state?.FirstName,
      Title: state?.Title,
      RateTypeID: LTData?.RateTypeID,
      CentreID: LTData?.CentreID,
      MiddleName: state?.MiddleName,
      LastName: state?.LastName,
      Gender: state?.Gender,
      DOB: state?.DOB,
      AgeYear: state?.AgeYear,
      Email: LTData?.Email,
      HouseNo: LTData?.HouseNo,
      DoctorName: formData?.DoctorName,
      Mobile: state.Mobile,
    };
    return fieldMap[controlId] || state[controlId] || LTData[controlId] || "";
  };

  const validateMandatoryFields = () => {
    const errors = {};
    console.log("controllerDynamicList length:", controllerDynamicList.length);

    if (!controllerDynamicList || controllerDynamicList.length === 0) {
      console.log("controllerDynamicList not loaded yet");
      return errors;
    }

    controllerDynamicList.forEach((item) => {
      console.log(
        "Checking item:",
        item.ControlDisplayID,
        "IsMandatory:",
        item.IsMandatory,
      );
      if (item.IsMandatory == 1) {
        const fieldValue = getFieldValue(item.ControlDisplayID);
        console.log("Field:", item.ControlDisplayID, "Value:", fieldValue);
        if (!fieldValue || fieldValue.toString().trim() === "") {
          errors[item.ControlDisplayID] =
            `${item?.ControlDisplayName} Field is required`;
        }
      }
    });
    console.log("Validation errors:", errors);
    return errors;
  };

  const validateDynamicFields = () => {
    console.log("entered");
    const validationErrors = validateMandatoryFields();
    setMoreErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) {
      // showValidationSummary(validationErrors);
      return false;
    }
    return true;
  };

  const clearValidationError = (fieldName) => {
    // Direct mapping for most fields
    if (moreErrors[fieldName]) {
      setMoreErrors((prev) => ({
        ...prev,
        [fieldName]: "",
      }));
      return;
    }

    // Find by ControlDisplayID in dynamic list
    const controllerItem = controllerDynamicList.find(
      (item) => item.ControlDisplayID === fieldName,
    );

    if (controllerItem && moreErrors[controllerItem.ControlDisplayID]) {
      setMoreErrors((prev) => ({
        ...prev,
        [controllerItem.ControlDisplayID]: "",
      }));
    }
  };

  const controllerDynamic = async () => {
    const { controllersData, controllerTabbingOrder } =
      await getSearchController(PAGE_ID);
    // First Name is saved as the estimate's PName (shown in Estimate Search and
    // carried into Registration on Convert) — render it even when this page's
    // control config leaves it out, right after Title.
    if (
      controllersData?.length &&
      !controllersData.some((x) => x?.ControlDisplayID === "FirstName")
    ) {
      const title = controllersData.find((x) => x?.ControlDisplayID === "Title");
      controllersData.push({
        ControlDisplayID: "FirstName",
        ControlDisplayName: "First Name",
        IsShow: 1,
        IsMandatory: 0, // First Name or Middle Name — checked in handleSubmit
        DisplayOrder: (Number(title?.DisplayOrder) || 0) + 0.5,
        TabOrder: 0,
      });
    }
    setTabbingOrder(controllerTabbingOrder);
    setControllerDynamicList(controllersData);
    console.log("controllersDataInvs::", controllersData);
    console.log("controllerTabbingOrder::", controllerTabbingOrder);
  };

  const handleModalSubmit = async () => {
    try {
      const res = await axiosInstance.post(
        "Estimatebilldetail/EstimateUpdateStatus",
        { ...modalData },
      );
      const data = res?.data;
      if (data?.success) {
        setShowRemarkModal(false);
        toast.success("Remark added successfully.");
      } else {
        toast.error(res?.data?.message || "Error Occured");
      }
    } catch (error) {
      console.error("Estimate Error:", error);
    }
  };

  const handleModalStatusChange = (name, value) => {
    setModalData((prev) => ({ ...prev, statusId: value?.value }));
  };

  const handleModalChange = (e) => {
    const { name, value } = e.target;
    setModalData({ ...modalData, [name]: value });
  };

  console.log("controller", controllerDynamic);
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

  const showAlways = (controlId) => {
    const showAlwaysList = [
      // "Centre Type",
      "FirstName",
    ];
    return showAlwaysList.includes(controlId);
  };

  useEffect(() => {
    controllerDynamic();
  }, []);

  // Same lab-master fetch Patient Registration uses for its Outsource Lab
  // dropdown (PatientRegistration.jsx:2230-2246).
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

  const handlePrintReport = async (EstimateNoHash) => {
    try {
      setPrintLoading(EstimateNoHash);
      const res = await axiosReport.post(
        `GetEstimateReceipt`,
        {
          EstimateNoHash: EstimateNoHash,
        },
        { responseType: "blob" },
      );

      if (res?.status === 200) {
        const url = window.URL.createObjectURL(
          new Blob([res.data], { type: "application/pdf" }),
        );
        window.open(url, "_blank");
      }
    } catch (error) {
      console.error("Error while downloading pdf", error);
      toast.error("Error while printing report!");
    } finally {
      setPrintLoading(false);
    }
  };

  const handleSelectStatusChange = (name, value, rowData) => {
    console.log("name", name, "value", value, "rowData", rowData);
    // Convert -> open Registration pre-filled with this estimate's patient and tests
    if (value?.value === 2) {
      navigate("/patientregister", {
        state: {
          fromEstimate: true,
          estimate: rowData,
          // fallback when the row doesn't carry its own centre / rate type
          centreId: LTData?.CentreID,
          rateTypeId: LTData?.RateTypeID,
        },
      });
      return;
    }
    if (value) {
      setSelectedRow(rowData);
      setModalData({
        estimateNo: rowData?.EstimateNo || "",
        estimateNoHash: rowData?.EstimateNoHash || "",
        ledgerTransactionNo: "",
        statusId: value?.value,
        remark: "",
      });
      setShowRemarkModal(true);
    }
  };
  const getSuggestion = (value) => {
    // if (!state?.DOB) {
    //   toast.error("Please choose DOB || Age");
    // }
    // else {

    // }

    if (LTData?.CentreID) {
      if (value.length >= 2) {
        axiosInstance
          .post("TestData/BindBillingTestData", {
            TestName: value,
            CentreID: LTData?.RateTypeID,
            SearchBy: searchTest,
          })
          .then((res) => {
            if (res?.data?.success) setSuggestion(res?.data?.message);
            else {
              toast.error("Please check rate/Share and sample type");
            }
          })
          .catch((err) => {
            toast.error(err?.response?.data?.message);
          });
      } else {
        setSuggestion([]);
      }
    } else {
      toast.error("please Select Centre");
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
    if (male.includes(state?.Title)) {
      setState({ ...state, Gender: "Male" });
    }

    if (female.includes(state?.Title)) {
      setState({ ...state, Gender: "Female" });
    }
    if (other.includes(state?.Title)) {
      setState({ ...state, Gender: "Other" });
    }
  };

  useEffect(() => {
    findGender();
  }, [state?.Title]);

  const handleDeboucing = (fuc) => {
    let timeout;
    return function (value) {
      if (timeout) {
        clearTimeout(timeout);
      }
      timeout = setTimeout(() => {
        fuc(value);
      }, 400);
    };
  };

  const debouce = handleDeboucing(getSuggestion);

  const handleSearchSuggest = (event) => {
    const { value } = event.target;
    debouce(value);
  };

  console.log("state", state);
  // const handleChange = (e) => {
  //   const { name, value } = e.target;

  //   if (name === "Title") {
  //     setState((prevState) => ({
  //       ...prevState,
  //       Title: value,
  //       Gender: value === "Baby" ? "" : prevState.Gender,
  //     }));
  //   }
  //   if (name === "Gender") {
  //     setState({
  //       ...state,
  //       [name]: value,
  //     });
  //   } else {
  //     setLTData((prevLTData) => ({
  //       ...prevLTData,
  //       [name]: value,
  //     }));
  //   }
  // };

  const handleChange = (e) => {
    const { name, value } = e.target;

    // Fields that belong to state (Patient Info)
    const stateFields = [
      "Title",
      "FirstName",
      "MiddleName",
      "LastName",
      "Gender",
    ];

    // If field belongs to state, update state
    if (stateFields.includes(name)) {
      setState((prev) => ({
        ...prev,
        [name]: value,
        ...(name === "Title" && {
          Gender: value === "Baby" ? "" : prev.Gender,
        }),
      }));
      return;
    }

    // Otherwise update LTData
    setLTData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleTestInfoClick = (data) => {
    try {
      const items = JSON.parse(data.ItemArray);
      setTestInfoData(items);
      setSelectedRow(data.EstimateNo);
      setShowTestInfoModal(true);
    } catch (error) {
      console.error("Error parsing ItemArray:", error);
      toast.error("Failed to load test information");
    }
  };

  const handleSearchSelectChange = (label, value) => {
    const selectedValue = value?.value;
    setLTData({
      ...LTData,
      [label]: selectedValue,
    });

    if (label === "CentreID") {
      // fetchRateTypes(selectedValue);
      getRateTypeWorkOrder(selectedValue);
      getEstimateData();
    }
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

  const statusCount = (status) => {
    if (!estimateData || estimateData.length === 0) return 0;
    return estimateData.filter((item) => item.Status === status).length;
  };

  const calculateDOB = (value) => {
    var TodayDate = moment(new Date().now).format("YYYY,MM,DD");
    var DOBDate = moment(value).format("YYYY,MM,DD");
    var a = moment(TodayDate);
    var b = moment(DOBDate);
    var years = a.diff(b, "year");
    b.add(years, "years");
    var months = a.diff(b, "months");
    b.add(months, "months");
    var days = a.diff(b, "days");
    days = years == 0 && months == 0 && days == 0 ? 1 : days;

    return { years, months, days };
  };

  const calculateTotalNumberOfDays = (value) => {
    return moment(moment().format("YYYY-MM-DD")).diff(value, "days");
  };

  const dateSelect = (value, name) => {
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
      days: days,
    });
    setDateData({
      AgeYear: dateForFields?.AgeYear,
      AgeMonth: dateForFields?.AgeMonth,
      AgeDays: dateForFields?.AgeDays,
    });
  };

  const getSubtractType = (name) => {
    return name === "AgeYear"
      ? "years"
      : name === "AgeMonth"
        ? "months"
        : "days";
  };

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
        UpdateModalityId: 1,
      };

      setTableData(updatedTableData);
    }
  };

  const handleDOBCalculation = (e) => {
    const { name, value } = e.target;

    let diff = {};
    let subtractType = getSubtractType(name);

    if (name === "AgeYear") {
      diff = moment().subtract(value, subtractType);
      setDateData({
        ...DateData,
        AgeYear: diff?._d,
      });
    }

    if (name === "AgeMonth") {
      diff = moment(DateData?.AgeYear || new Date().now).subtract(
        value,
        subtractType,
      );
      setDateData({
        ...DateData,
        AgeMonth: diff?._d,
      });
    }

    if (name === "AgeDays") {
      diff = moment(DateData?.AgeMonth || new Date().now).subtract(
        value,
        subtractType,
      );
      setDateData({
        ...DateData,
        AgeDays: diff?._d,
      });
    }

    var startDate = moment(diff._d);
    var endDate = moment();

    var yearsDiff = endDate.diff(startDate, "years");
    startDate.add(yearsDiff, "years");

    var monthsDiff = endDate.diff(startDate, "months");
    startDate.add(monthsDiff, "months");

    var daysDiff = endDate.diff(startDate, "days");
    setState({
      ...state,
      [name]: value,
      DOB: diff?._d,
      TotalAgeInDays: moment(moment().format("YYYY-MM-DD")).diff(
        diff?._d,
        "days",
      ),
    });
  };

  const handleDiscount = (value, index) => {
    if (disAmt === "" && discountPercentage === "") {
      const data = [...tableData];
      data[index]["Discount"] = value;
      data[index]["NetAmount"] = data[index]["Rate"] - value;
      setTableData(data);
    } else {
      toast.error("Discount already given");
    }
  };

  const fetchRateTypes = async (id, flag) => {
    try {
      const res = await axiosInstance.post("Centre/GetRateType", {
        CentreId: [id],
      });
      const list = res?.data?.message.map((item) => ({
        label: item?.RateTypeName,
        value: item?.RateTypeID,
      }));

      flag
        ? setLTData({
          ...LTDataIniti,
          CentreID: id,
          RateTypeID: list[0]?.value ?? "",
        })
        : setLTData({
          ...LTData,
          CentreID: id,
          RateTypeID: list[0]?.value ?? "",
        });
      setRateTypes(list);
    } catch (err) {
      flag
        ? setLTData({
          ...LTDataIniti,
          CentreID: id,
          RateTypeID: "",
        })
        : setLTData({
          ...LTData,
          CentreID: id,
          RateTypeID: "",
        });
      console.log(err);
    }
  };

  const handleIndex = (e) => {
    const { name } = e.target;
    switch (name) {
      case "TestName":
        switch (e.which) {
          case 38:
            if (indexMatch !== 0) {
              setIndexMatch(indexMatch - 1);
            } else {
              setIndexMatch(suggestion.length - 1);
            }
            break;
          case 40:
            if (suggestion.length - 1 === indexMatch) {
              setIndexMatch(0);
            } else {
              setIndexMatch(indexMatch + 1);
            }
            break;
          case 13:
            if (suggestion.length > 0) {
              handleListSearch(suggestion[indexMatch], name);
            }
            setIndexMatch(0);
            break;
          default:
            break;
        }
        break;
      case "DoctorName":
        switch (e.which) {
          case 38:
            if (indexMatch !== 0) {
              setIndexMatch(indexMatch - 1);
            } else {
              setIndexMatch(doctorSuggestion.length - 1);
            }
            break;
          case 40:
            if (doctorSuggestion.length - 1 === indexMatch) {
              setIndexMatch(0);
            } else {
              setIndexMatch(indexMatch + 1);
            }
            break;
          case 13:
            handleListSearch(doctorSuggestion[indexMatch], name);
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

  const getAccessCentres = (flag) => {
    axiosInstance
      .get("Centre/getAccessCentres")
      .then((res) => {
        let data = res.data.message;
        let CentreDataValue = data.map((ele) => {
          return {
            value: ele.CentreID,
            label: ele.Centre,
          };
        });
        let allValues = CentreDataValue.map((ele) => ele.value);
        setCentreData(CentreDataValue);
        getRateTypeWorkOrder(allValues[0]);

        // fetchRateTypes(allValues[0], flag);
      })
      .catch((err) => console.log(err));
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

  const HandleLogDetails = async (data) => {
    setShowLogModal(true);
    setSelectedRow(data);
    try {
      const res = await axiosInstance.post(
        "Estimatebilldetail/EstimateSearchInfoUpdateLog",
        { EstimateNoHash: data?.EstimateNoHash },
      );
      const resData = res?.data;
      if (resData?.success) {
        setLogData(resData?.message);
      }
    } catch (error) {
      console.error("Estimate Error:", error);
      setLogData([]);
    }
  };
  const handleRateTypePaymode = useMemo(() => {
    const data = RateType.find((ele) => ele?.value == LTData?.RateTypeID);
    return data?.PayMode;
  }, [LTData?.RateTypeID, RateType]);
  const getTableData = (data, key, Promo) => {
    const ItemIndex = tableData.findIndex(
      (e) => e.InvestigationID == data.InvestigationID,
    );

    if (ItemIndex === -1) {
      axiosInstance
        .post("TestData/BindSingleTestData", {
          InvestigationID: data.InvestigationID,
          CentreID: data?.CentreID,
          CentreIdNew: LTData?.CentreID,
          ActualRateTypeID: Number(selectedRateType?.RateTypeID) || Number(LTData?.RateTypeID),
          ReferenceRate: selectedRateType?.ReferenceRate || 0,
          AllowZeroRateBooking: selectedRateType?.AllowZeroRateBooking || 0,
          FamilyMemberIsPrimary: 0,
          PatientCode: 0,
          MembershipCardID: 0,
          SetMRP: LTData?.SetMRP,
          IsPromotional: Promo ? 1 : 0,
          PromotionalID: data?.PromotionalID ? data?.PromotionalID : 0,
        })
        .then((res) => {
          const { genderCheck, ageCheck, message } = CheckageTest(
            res?.data?.message[0]?.Gender,
            res?.data?.message[0]?.ToAge,
            res?.data?.message[0]?.FromAge,
          );

          if (genderCheck && ageCheck) {
            if (
              res?.data?.message[0]?.IsSampleRequired == "Sample Required" &&
              (res?.data?.message[0]?.SampleTypeID == "" ||
                res?.data?.message[0]?.SampleTypeID == 0)
            ) {
              toast?.error(
                "In " +
                res?.data?.message[0]?.TestName +
                " test SampleType Not Found",
              );
            }
            setTableData([
              ...tableData,
              {
                ...res?.data?.message[0],
                Discount: data?.Discount
                  ? (
                    (Number(res?.data?.message[0].Rate) * data?.Discount) /
                    100
                  ).toFixed(2)
                  : Number(res?.data?.message[0].DiscAmt) == 0
                    ? ""
                    : Number(res?.data?.message[0].DiscAmt),
                Rate: Number(res?.data?.message[0].Rate).toFixed(2),
                NetAmount: data?.Discount
                  ? (
                    res?.data?.message[0].Rate -
                    (Number(res?.data?.message[0].Rate) * data?.Discount) /
                    100
                  ).toFixed(2)
                  : Number(res?.data?.message[0].Amount).toFixed(2),
                IsSampleCollected: "N",
                Status: 1,
                IsUrgent: 0,
                UrgentDateTime: "",
                BarcodeNo: "",
                isLabOutSource: res?.data?.message[0]?.isLabOutSource,
                isOutSource: Number(res?.data?.message[0]?.isOutSource) || 0,
                LabOutsrcID: "",
                LabOutsrcName: "",
                IsCulture: res?.data?.message[0]?.IsCulture,
                IsConcern: res?.data?.message[0]?.IsConcern,
                IsPndtForm: res?.data?.message[0]?.IsPndtForm,
                UrgentdeleiveryDate: res?.data?.message[0]?.UrgentdeleiveryDate,
                DeliveryDate: res?.data?.message[0]?.deliveryDate,
              },
            ]);
          } else {
            !genderCheck &&
              toast.error("This Test is Not for " + state?.Gender);
            !ageCheck && toast.error(message);
          }
        })
        .catch((err) => console.log(err));
    } else {
      toast.error("Duplicate Test Found");
    }
  };

  const getPackageSuggestions = (data) => {
    const LTData = [];

    data.forEach((obj) => {
      LTData.push(obj.InvestigationID);
    });
    axiosInstance
      .post("TestData/BindPackage", {
        InvestigationID: LTData,
        CentreID: LTData?.RateTypeId,
      })
      .then((res) => {
        let data = res?.data?.message;
        setSuggestionData((ele) => ({
          ...ele,
          show: true,
          packageSuggestions: {
            ...suggestionData.packageSuggestions,
            data: data,
            show: true,
          },
        }));
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
      });
  };

  const handleFilter = (data) => {
    const value = tableData.filter(
      (ele) => ele.InvestigationID !== data.InvestigationID,
    );
    setTableData(value);
    getPackageSuggestions(value);
    toast.success("successfully Removed");
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

  const handleListSearch = (data, name, Promo) => {
    switch (name) {
      case "TestName":
        const testSearchInput = document.getElementById("testSearch");
        if (testSearchInput) {
          testSearchInput.value = "";
        }
        setIndexMatch(0);
        setSuggestion([]);

        getTableData(data, "test", Promo);
        setErrors((prev) => ({
          ...prev,
          tableData: "",
        }));
        break;
      case "DoctorName":
        setFormData({ ...formData, [name]: data.Name });
        setLTData({
          ...LTData,
          [name]: data.Name,
          DoctorID: data.DoctorReferalID,
          ReferLabId: data.DoctorReferalID,
          ReferLabName: data.Name,
          DoctorMobile: data?.Mobile,
          DoctorEmail: data?.Email,
          ProEmployee: data?.ProEmployee,
        });
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
        setFormData({ ...formData, [name]: data.Name });
        setLTData({
          ...LTData,

          SecondReferDoctor: data.DoctorReferalID,
          // ReferLabId: data.DoctorReferalID,
          // ReferLabName: data.Name,
          // DoctorMobile: data?.Mobile,
          // DoctorEmail: data?.Email,
        });
        setIndexMatch(0);
        setDoctorSuggestion([]);
        setSecondDropFalse(false);
        break;
      default:
        break;
    }
  };

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

            setGender(extractedGenders);
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
          default:
            break;
        }
      })
      .catch((err) => console.log(err));
  };
  const getEstimateData = (records = recordsPerPage) => {
    setLoading(true);
    axiosInstance
      .post("Estimatebilldetail/EstimateSearchLimit", {
        bussinessUnitId: LTData?.CentreID || 0,
        limitCount: records || 10,
      })
      .then((res) => {
        console.log("estimate res", res);
        if (res?.data?.success) {
          setLastEstimateData(res?.data?.message?.lastTenSearchData);
          setEstimateData(res?.data?.message?.estimateData || []);
        } else {
          setLastEstimateData("");
          setEstimateData([]);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.log(err);
        setLoading(false);
      })
      .finally(() => {
        setLoading(false);
      });
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

  const findFinalDeliveryDate = () => {
    if (tableData?.length > 0) {
      const dates = tableData
        .map((item) => item?.deliveryDate || item?.DeliveryDate)
        .filter((date) => date)
        .map((date) =>
          moment(date, [
            "DD-MMM-YYYY HH:mm:ss",
            "DD-MM-YYYY HH:mm:ss",
            "YYYY-MM-DD HH:mm:ss",
            "DD-MM-YYYY",
            "DD-MMM-YYYY",
            "YYYY-MM-DD",
          ]),
        );

      const validDates = dates.filter((d) => d.isValid());

      if (validDates.length > 0) {
        const maxDate = moment.max(validDates);
        return maxDate.format("DD-MMM-YYYY HH:mm:ss");
      }
    }
    return "";
  };

  console.log("LTData", LTData);
  const handleSubmitAndBilling = async () => {
    const estimatePayload = {
      Title: state?.Title,
      FirstName: state?.FirstName,
      MiddleName: state?.MiddleName,
      LastName: state?.LastName,
      PName: [state?.FirstName, state?.MiddleName, state?.LastName]
        .map((x) => x?.trim())
        .filter(Boolean)
        .join(" "), // for backward compatibility
      Mobile: state?.Mobile,
      Gender: state?.Gender,
      AgeYear: state?.AgeYear,
      AgeMonth: state?.AgeMonth,
      AgeDays: state?.AgeDays,
      DOB: state?.DOB,
      Email: LTData?.Email,
      CentreID: LTData?.CentreID,
      RateTypeID: LTData?.RateTypeID,
      Items: tableData.map((row) => ({
        ...row,
        InvestigationID: row.InvestigationID,
        TestCode: row.TestCode,
        TestName: row.TestName,
        Rate: row.Rate,
        Discount: row.Discount,
        Amount: row.Rate - row.Discount,
      })),
    };

    const success = await handleSubmit(true);
    if (success) {
      navigate("/patientregister", {
        state: { data: estimatePayload, fromEstimate: true },
      });
    }
  };

  const handleSubmit = async (skipReset = false) => {
    if (!state?.Mobile || state?.Mobile.trim() === "") {
      toast.warning("Mobile Number is required");
      return false;
    }
    if (!state?.FirstName?.trim() && !state?.MiddleName?.trim()) {
      toast.warning("Patient Name is required");
      return false;
    }
    if (!validateDynamicFields()) {
      // setIsSubmit((prev) => ({ ...prev, isLoading: false }));
      return false;
    }
    let newErrors = {};

    if (!tableData || tableData.length === 0) {
      newErrors.tableData = "Test is required";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return false; // ❌ stop submit
    }

    const Items = tableData.map((row) => {
      const amount = row?.Rate - row?.Discount;
      return {
        ItemId: row?.InvestigationID || 0,
        ItemCode: row?.TestCode?.toString(),
        ItemName: row?.TestName,
        Rate: row?.Rate,
        DiscAmt: row?.Discount === "" ? 0 : Number(row?.Discount),
        Amount: amount,
        IsPackage: "0",
        DeliveryDate: row?.DeliveryDate,
        DepartmentID: row?.DepartmentID?.toString(),
        LabOutsrcID: Number(row?.LabOutsrcID) || 0,
        LabOutsrcName: row?.LabOutsrcName || "",
        IsLabOutSource: Number(row?.isOutSource || row?.isLabOutSource) || 0,
      };
    });

    try {
      const res = await axiosInstance.post(
        "Estimatebilldetail/SaveEstimateBillDetail",
        {
          Title: state?.Title,
          // full name for display in Estimate Search; the parts are sent
          // separately so Convert can fill Registration's First/Last Name
          PName: [state?.FirstName, state?.MiddleName, state?.LastName]
            .map((x) => x?.trim())
            .filter(Boolean)
            .join(" "),
          FirstName: state?.FirstName?.trim() || "",
          MiddleName: state?.MiddleName?.trim() || "",
          LastName: state?.LastName?.trim() || "",
          Mobile: state?.Mobile,
          Gender: state?.Gender,
          Address: LTData?.HouseNo,
          IsDOBActual: 1,
          Age: `${state.AgeYear} Y ${state.AgeMonth} M ${state.AgeDays} D`,
          AgeYear: state?.AgeYear === "" ? 0 : Number(state?.AgeYear),
          AgeMonth: state?.AgeMonth === "" ? 0 : Number(state?.AgeMonth),
          AgeDays: state?.AgeDays === "" ? 0 : Number(state?.AgeDays),
          TotalAgeInDays:
            state?.TotalAgeInDays === "" ? 0 : Number(state?.TotalAgeInDays),
          DOB: moment(state?.DOB).format("YYYY-MM-DD"),
          Email: LTData?.Email,
          RateTypeID: LTData?.RateTypeID,
          CentreID: LTData?.CentreID,
          Items: Items,
        },
      );

      if (res?.data?.success) {
        setErrors({});
        toast.success(res?.data?.message);
        if (!skipReset) {
          resetFormFields();
          getAccessCentres(true);
          getEstimateData(recordsPerPage);
        }
        setMoreErrors({});
        return true;
      } else {
        toast.error(res?.data?.message || "Error occured");
        return false;
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || "Some error occurred");
      return false;
    }
  };

  const resetFormFields = () => {
    setState(stateIniti);
    setTableData([]);
    setFormData(formDataInit);
    setLTData(LTDataIniti);
  };
  const [DoctorData, setDoctorData] = useState([]);

  const handleFilterInputChange = (status) => {
    // Toggle: if same status clicked, reset to show all
    if (selectedStatusFilter === status) {
      setSelectedStatusFilter(null);
      // setFormData((prev) => ({ ...prev, statusID: 0 }));
    } else {
      setSelectedStatusFilter(status);
      // setFormData((prev) => ({ ...prev, statusID: statusConfig[status].id }));
    }
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
    getAccessCentres();
    getDropDownData("Gender");
    getDropDownData("Title");
    getDropDownData("Identity");
    getBindDiscApproval(setBindDiscApproval);
    BindDoctorData();
  }, []);

  const [throughMobileData, setThroughMobileData] = useState(false);
  const inputRef = useRef(null);
  const [mobleData, setMobileData] = useState([]);
  const [err, setErr] = useState({});
  const [PatientGuid, SetPatientGuid] = useState("");
  const [showOP, setShowOP] = useState(false);
  const selectedRateType = RateType?.find(
    (rType) => rType?.RateTypeID == LTData?.RateTypeID,
  );
  const [dropFalse, setDropFalse] = useState(false);

  const [show, setShow] = useState({
    show: false,
    Type: "",
  });
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
  const getDataByMobileNo = async (type) => {
    if (type === "Mobile") {
      if (state?.Mobile.length === 10) {
        await axiosInstance
          .post("Booking/getDataByMobileNo", {
            Mobile: state?.Mobile,
            PatientCode: "",
          })
          .then((res) => {
            if (res?.data?.success) {
              const users = res.data.message?.user || [];
              const updatedUsers = users.map((user) => ({
                ...user,
                throughHmis: 0,
                throughHC: 0,
              }));
              setMobileData(updatedUsers);
              setSuggestionData((ele) => ({
                ...ele,
                testSuggestions: {
                  ...suggestionData.testSuggestions,
                  Total: res?.data?.message?.data,
                },
              }));
            } else {
              setMobileData([]);
              toast.error("No Patient Record Found");
            }

            setShow4(true);
          })
          .catch((err) => {
            console.error(
              err?.response?.data?.message
                ? err?.response?.data?.message
                : "Error Occured",
            );
          });
      } else {
        toast.error("Mobile Number Length Must Be 10");
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
              const updatedUsers = users.map((user) => ({
                ...user,
                throughHmis: 0,
              }));
              setMobileData(updatedUsers);
              setSuggestionData((ele) => ({
                ...ele,
                testSuggestions: {
                  ...suggestionData.testSuggestions,
                  Total: res?.data?.message?.data,
                },
              }));
            } else {
              setMobileData([]);
              toast.error("No Patient Record Found");
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
  const handleMainChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (name === "Gender") {
      setState({
        ...state,
        [name]: value,
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
    }

    if (name === "ProEmployee") {
      setState({
        ...state,
        [name]: value,
      });
    }
    if (name === "Title") {
      setState({
        ...state,
        [name]: value,
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
    }

    if (name === "FirstName") {
      setState({
        ...state,
        [name]: PreventSpecialCharacterFirstName(value)
          ? value?.toUpperCase()
          : state[name],
      });
    } else {
      setState({
        ...state,
        [name]:
          type === "checkbox"
            ? checked
              ? 1
              : 0
            : [
              "MiddleName",
              "LastName",
              "City",
              "State",
              "Country",
              "Locality",
            ].includes(name)
              ? PreventSpecialCharacter(value.toUpperCase())
                ? value.toUpperCase()
                : state[name]
              : [""].includes(name)
                ? PreventSpecialCharacter(value)
                  ? value
                  : state[name]
                : value,
      });
    }

    if (name === "Mobile" && value.length === 10) {
      axiosInstance
        .post("CommonController/CheckInvalidMobileNo", {
          MobileNo: value,
        })
        .then((res) => {
          // if(res?.data?.success){
          //   toast.success(res?.data?.message);
          // }
        })

        .catch((err) => {
          if (err?.response?.data?.message >= 1) {
            toast.error("Invalid number");
            setState({ ...state, [name]: "" });
          } else {
            setState({ ...state, [name]: value });
          }
        });
      return;
    }
  };

  const handleShowMobile = () => {
    getDataByMobileNo("Mobile");
    // setShow4(true)
  };

  const handleClose4 = () => {
    setShow4(false);
    setMobileData([]);
  };
  const handlePatientData = (e, type) => {
    const keypress = [9, 13];
    if (keypress.includes(e.which)) {
      getDataByMobileNo(type);
    }
  };
  const handleSelctData = (data) => {
    const { years, months, days } = calculateDOB(new Date(data?.DOB));
    // console.log(data);
    handlePreviewImage(data?.PatientGuid);
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
          throughHmis: 1,
        });
      });
    } else {
      setTableData([]);
    }
    const testDetails =
      suggestionData?.testSuggestions?.Total?.length > 0
        ? suggestionData?.testSuggestions?.Total?.filter((ele) => {
          console.log({ ele });
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
    handleClose4();
    setThroughMobileData(true);
    setMobileData([]);
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

  const getStatusLabel = (statusId, t, statusOptions) => {
    if (statusId === null || statusId === undefined) {
      return "-";
    }

    const option = statusOptions.find((option) => option.value === statusId);

    return option ? t(option.label) : statusId;
  };

  const getRateTypeWorkOrder = async (Centerid = 0) => {
    await axiosInstance
      .post(apiUrls.BindRateTypeDropdown, {
        centreID: Centerid || 0,
        rateTypeID: 0,
        AllowEstimate: 1,
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
        setRateTypes(val);
        setRateType(data)
        setLTData((prev) => ({
          ...prev,
          CentreID: Centerid || 0,
          RateTypeID: val?.[0]?.value || 0,
        }));
        if (val.length === 0) {
          setBlockMsg(t("No rate type found for this centre. Please configure a rate type."));
          setPageReady(false);
        } else {
          setBlockMsg("");
          setPageReady(true);
        }
      })
      .catch((err) => {
        console.log(err);
        setLTData((prev) => ({
          ...prev,
          CentreID: Centerid || 0,
          RateTypeID: "",
        }));
        setBlockMsg(t("Failed to load rate types. Please try again."));
        setPageReady(false);
      })
      .finally(() => { });
  };

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

  useEffect(() => {
    getDoctorSuggestion(formData, setDoctorSuggestion, setFormData);
  }, [formData?.DoctorName]);

  const navigate = useNavigate();

  const handleBack = () => {
    navigate("/EstimateRatenewList");
  };
  useEffect(() => {
    getEstimateData();
  }, [LTData?.CentreID]);
  console.log("lastEstimateData", lastEstimateData);
  console.log("estimateData", estimateData);
  console.log("testInfoData", testInfoData);
  console.log("LTData", LTData);
  console.log("moreErrors", moreErrors);
  return (
    <>
      {mobleData.length > 0 && show4 && (
        <MobileDataModal
          show={show4}
          setShow={setShow4}
          mobleData={mobleData}
          handleClose4={handleClose4}
          handleSelctData={handleSelctData}
        />
      )}
      {show?.show && (
        <PatientRegisterModal
          show={show?.show}
          handleClose={handleClose}
          Type={show?.Type}
        />
      )}
      {showTestInfoModal && (
        <Dialog
          header={`Test Information - ${selectedRow}`}
          onHide={() => {
            setShowTestInfoModal(false);
            setTestInfoData([]);
            setSelectedRow(null);
          }}
          className={theme}
          visible={showTestInfoModal}
          style={{ width: "50vw" }}
        >
          <div className="row pt-2 px-2 py-3">
            <div className="col-12">
              {testInfoData.length > 0 ? (
                <Tables
                  style={{
                    maxHeight: "400px",
                    overflowY: "auto",
                  }}
                >
                  <thead className="cf">
                    <tr>
                      <th>{t("S.No")}</th>
                      <th>{t("Department")}</th>
                      <th>{t("Test Name")}</th>
                      <th>{t("Delivery Date")}</th>
                      {/* <th>{t("MRP")}</th> */}
                      <th>{t("Amount")}</th>
                      {allowOutsourceLab && <th>{t("Outsource Lab")}</th>}
                    </tr>
                  </thead>
                  <tbody>
                    {testInfoData.map((item, index) => (
                      <tr key={index}>
                        <td data-title={t("S.No")}>{index + 1}</td>
                        <td data-title={t("Department")}>
                          {item.DepartmentName || "-"}
                        </td>
                        <td data-title={t("Test Name")}>{item.ItemName}</td>
                        <td data-title={t("Delivery Date")}>
                          {item.DeliveryDate}
                        </td>
                        {/* <td>{item?.mrp || ""}</td> */}
                        <td data-title={t("Amount")}>
                          {parseFloat(item.Amount).toFixed(2)}
                        </td>
                        {allowOutsourceLab && (
                          <td data-title={t("Outsource Lab")}>
                            {item.LabOutsrcName || "-"}
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                  {/* <tfoot>
                    <tr
                      style={{ fontWeight: "bold", backgroundColor: "#f8f9fa" }}
                    >
                      <td colSpan="4" style={{ textAlign: "right" }}>
                        {t("Total Amount")}:
                      </td>
                      <td>
                        {testInfoData
                          .reduce(
                            (sum, item) => sum + parseFloat(item.Amount),
                            0
                          )
                          .toFixed(2)}
                      </td>
                      <td colSpan="2"></td>
                    </tr>
                  </tfoot> */}
                  <tfoot>
                    <tr
                      style={{ fontWeight: "bold", backgroundColor: "#f8f9fa" }}
                    >
                      {/* Empty cells till Delivery Date */}
                      <td colSpan="4" style={{ textAlign: "right" }}>
                        {t("Total")}
                      </td>

                      {/* Total MRP */}
                      {/* <td>
                        {testInfoData
                          .reduce((sum, item) => sum + parseFloat(item.mrp || 0), 0)
                          .toFixed(2)}
                      </td> */}

                      {/* Total Amount */}
                      <td>
                        {testInfoData
                          .reduce(
                            (sum, item) => sum + parseFloat(item.Amount || 0),
                            0,
                          )
                          .toFixed(2)}
                      </td>
                      {allowOutsourceLab && <td></td>}
                    </tr>
                  </tfoot>
                </Tables>
              ) : (
                <div className="text-center py-4">
                  <p>{t("No test information available")}</p>
                </div>
              )}
            </div>
          </div>
        </Dialog>
      )}
      {showRemarkModal && (
        <Dialog
          header={"Add Remark"}
          onHide={() => setShowRemarkModal(false)}
          className={theme}
          visible={showRemarkModal}
          style={{ width: "20vw" }}
        >
          <div className="row pt-2 px-2 py-3 align-items-center justify-content-center">
            <div className="col-12 mb-2">
              <ReactSelect
                dynamicOptions={statusOptions}
                name="StatusID"
                lable={t("Status")}
                id="StatusID"
                removeIsClearable={true}
                placeholderName={t("Status")}
                value={modalData.statusId}
                onChange={handleModalStatusChange}
              />
            </div>

            {console.log("MOdal data", modalData)}

            {modalData.statusId === 2 && (
              <div className="col-12 mb-3">
                <Input
                  className="form-control"
                  type="text"
                  name="ledgerTransactionNo"
                  id="ledgerTransactionNo"
                  placeholder={t("")}
                  lable={t("Visit No")}
                  value={modalData.ledgerTransactionNo}
                  onChange={handleModalChange}
                />
              </div>
            )}

            {(modalData.statusId === 3 || modalData.statusId === 4) && (
              <div className="col-12 mb-3">
                <TextAreaInput
                  className="form-control"
                  name="remark"
                  lable={"Remark"}
                  placeholder={t("")}
                  rows="4"
                  value={modalData.remark}
                  onChange={handleModalChange}
                />
              </div>
            )}

            <div className="col-12 text-end">
              <SaveButton
                text={"Save"}
                onClick={handleModalSubmit}
                disabled={
                  !modalData.statusId ||
                  (modalData.statusId === 2 &&
                    !modalData.ledgerTransactionNo) ||
                  ((modalData.statusId === 3 || modalData.statusId === 4) &&
                    !modalData.remark)
                }
              />
            </div>
          </div>
        </Dialog>
      )}
      {showLogModal && (
        <Dialog
          header={`Estimate No - ${selectedRow?.EstimateNo} | Pname - ${selectedRow?.PName}`}
          onHide={() => {
            setShowLogModal(false);
            setLogData([]);
            setSelectedRow(null);
          }}
          className={theme}
          visible={showLogModal}
          style={{ width: "50vw" }}
        >
          <div className="row pt-2 px-2 py-3">
            <div className="col-12">
              {logData.length > 0 ? (
                <Tables
                  style={{
                    maxHeight: "400px",
                    overflowY: "auto",
                  }}
                >
                  <thead className="cf">
                    <tr>
                      <th>{t("S.No")}</th>
                      <th>{t("Status")}</th>
                      <th>{t("Remark")}</th>
                      <th>{t("Username")}</th>
                      <th>{t("Date/Time")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {logData.map((item, index) => {
                      const statusLabel = getStatusLabel(
                        item?.ColorStatus,
                        t,
                        statusOptions,
                      );

                      return (
                        <tr key={index}>
                          <td data-title={t("S.No")}>{index + 1}</td>
                          <td data-title={t("Status")}>{statusLabel}</td>
                          <td data-title={t("Remark")}>
                            {item?.Remarks || "-"}
                          </td>
                          <td data-title={t("Username")}>
                            {item?.CreatedByName}
                          </td>
                          <td data-title={t("Date/Time")}>
                            {item?.CreatedDate}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </Tables>
              ) : (
                <div className="text-center py-4">
                  <p>{t("No log information available")}</p>
                </div>
              )}
            </div>
          </div>
        </Dialog>
      )}
      <Accordion
        name={t("Estimate Booking")}
        isBreadcrumb={true}
        defaultValue={true}
        linkTo="#"
        seconTitle={
          <>
            {lastEstimateData?.length > 0 ? (
              <div
                className="link-title-container mt-2 d-none  d-md-flex"
                id="pr_id_11"
              >
                <label>
                  {t("Last Estimate No")} :{/* Total patient  */}
                  <span className="text-danger" style={{ marginLeft: "10px" }}>
                    {lastEstimateData[0]?.EstimatENo}
                  </span>
                </label>
                |
                <label>
                  {t("Last Created By")} :{/* Total patient  */}
                  <span className="text-danger" style={{ marginLeft: "10px" }}>
                    {lastEstimateData[0]?.CreatedByName}
                  </span>
                </label>
                |
                <label>
                  {t("Last Created Date")} :{/* Total patient  */}
                  <span className="text-danger" style={{ marginLeft: "10px" }}>
                    {lastEstimateData[0]?.dtEntry}
                  </span>
                </label>
              </div>
            ) : null}
            <div>
              <PageControlGear pageId={PAGE_ID} />
            </div>
          </>
        }
      >
        <div className="row pt-2 pl-2 pr-2 mt-1">
          {controllerDynamicList
            ?.sort((a, b) => a.DisplayOrder - b.DisplayOrder)
            .map((item) => {
              if (
                item?.ControlDisplayID === "CentreID" &&
                isHideController("CentreID")
              ) {
                return (
                  <div className="col-sm-2">
                    <ReactSelect
                      name="CentreID"
                      id="CentreID"
                      lable="Center"
                      placeholderName={t("Center")}
                      value={LTData?.CentreID}
                      dynamicOptions={centreData}
                      removeIsClearable={true}
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
              // if (item?.ControlDisplayID === "NumberOfRecords" && isHideController("NumberOfRecords")) {
              //   return (
              //     <div className="col-sm-2">
              //       <ReactSelect
              //         name="NumberOfRecords"
              //         id="NumberOfRecords"
              //         lable="Number Of Records"
              //         placeholderName={t("Number Of Records")}
              //         value={recordsPerPage}
              //         dynamicOptions={recordOptions}
              //         removeIsClearable={true}
              //         onChange={handleRecordsChange}
              //       />
              //        {item?.IsMandatory === 1 && moreErrors?.[item.ControlDisplayID] && (
              //           <div className="error-message">{moreErrors[item.ControlDisplayID]}</div>
              //         )}
              //     </div>
              //   )
              // }
              if (
                item?.ControlDisplayID === "RateTypeID" &&
                isHideController("RateTypeID")
              ) {
                return (
                  <div className="col-sm-2">
                    <ReactSelect
                      name="RateTypeID"
                      id="RateTypeID"
                      lable={t("Rate Type")}
                      placeholderName={t("Rate Type")}
                      value={LTData?.RateTypeID}
                      dynamicOptions={rateTypes}
                      removeIsClearable={true}
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
                item?.ControlDisplayID === "Mobile" &&
                isHideController("Mobile")
              ) {
                return (
                  <div className="col-sm-2 col-6">
                    <div className="d-flex">
                      <div style={{ width: "86%" }}>
                        <Input
                          name="Mobile"
                          inputRef={inputRef}
                          className={`${LTData?.BTB != 1 && LTData?.SUBPCC != 1 && selectedRateType?.IsMobileRequired == 1 ? "required-fields" : ""}`}
                          id="Mobile"
                          onInput={(e) => number(e, 10)}
                          onKeyDown={(e) => handlePatientData(e, "Mobile")}
                          value={state.Mobile}
                          disabled={throughMobileData || throughMemberData}
                          onChange={handleMainChange}
                          type="number"
                          lable={t("Mobile Number")}
                          placeholder={t(" ")}
                          required
                        />

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
                item?.ControlDisplayID === "Title" &&
                isHideController("Title")
              ) {
                return (
                  <div className="col-sm-1">
                    <SelectBox
                      options={Title}
                      name="Title"
                      id="Title"
                      lable="Title"
                      selectedValue={state?.Title}
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
                item?.ControlDisplayID === "FirstName" &&
                isHideController("FirstName")
              ) {
                return (
                  <div className="col-sm-2">
                    <Input
                      className="required-fields"
                      lable={t("First Name")}
                      name="FirstName"
                      id="FirstName"
                      type="text"
                      max={50}
                      value={state?.FirstName}
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

              // if (
              //   (item?.ControlDisplayID === "Title" && isHideController("Title")) ||
              //   (item?.ControlDisplayID === "FirstName" && isHideController("FirstName"))
              // ) {
              //   return (
              //     <div className="col-sm-2">
              //       <div className="d-flex">
              //         {item?.ControlDisplayID === "Title" && (
              //           <div style={{ width: "35%" }}>
              //             <SelectBox
              //               options={Title}
              //               name="Title"
              //               id="Title"
              //               lable="Title"
              //               selectedValue={state?.Title}
              //               onChange={handleChange}
              //             />
              //           </div>
              //         )}

              //         {item?.ControlDisplayID === "FirstName" && (
              //           <div style={{ width: "65%" }}>
              //             <Input
              //               className="required-fields"
              //               lable={t("First Name")}
              //               name="FirstName"
              //               id="FirstName"
              //               type="text"
              //               max={50}
              //               value={state?.FirstName}
              //               onChange={handleChange}
              //             />
              //           </div>
              //         )}
              //       </div>
              //         {item?.IsMandatory === 1 && moreErrors?.[item.ControlDisplayID] && (
              //           <div className="error-message">{moreErrors[item.ControlDisplayID]}</div>
              //         )}
              //     </div>
              //   )
              // }

              if (
                item?.ControlDisplayID === "MiddleName" &&
                isHideController("MiddleName")
              ) {
                return (
                  <div className="col-sm-2">
                    <Input
                      type="text"
                      lable="Middle Name"
                      name="MiddleName"
                      placeholder=" "
                      id="MiddleName"
                      value={state?.MiddleName}
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
                item?.ControlDisplayID === "LastName" &&
                isHideController("LastName")
              ) {
                return (
                  <div className="col-sm-2">
                    <Input
                      type="text"
                      lable="Last Name"
                      name="LastName"
                      placeholder=" "
                      id="LastName"
                      value={state?.LastName}
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
                item?.ControlDisplayID === "Gender" &&
                isHideController("Gender")
              ) {
                return (
                  <div className="col-sm-1">
                    <SelectBox
                      options={Gender}
                      name="Gender"
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
                          "B/O",
                          "C/O",
                          "S/O",
                          "Dr.",
                          "Baby of.",
                        ].includes(state?.Title)
                          ? false
                          : state?.Title || state?.Title == ""
                            ? true
                            : false
                      }
                      selectedValue={state?.Gender}
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
              if (item?.ControlDisplayID === "DOB" && isHideController("DOB")) {
                return (
                  <div className="col-sm-2">
                    <DatePicker
                      value={state?.DOB}
                      className="custom-calendar"
                      name="DOB"
                      placeholder=" "
                      id="DOB"
                      lable="DOB"
                      maxDate={new Date()}
                      onChange={dateSelect}
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
                item?.ControlDisplayID === "AgeYear" &&
                isHideController("AgeYear")
              ) {
                return (
                  <div className="col-sm-2">
                    <div className="p-inputgroup flex-1">
                      <Input
                        type="text"
                        className="required-fields"
                        // placeholder="Y"
                        lable={t("YY")}
                        name="AgeYear"
                        value={state?.AgeYear}
                        onInput={(e) => number(e, 3, 120)}
                        onChange={handleDOBCalculation}
                      />
                      <Input
                        type="text"
                        // placeholder="M"
                        lable={t("MM")}
                        name="AgeMonth"
                        className="required-fields"
                        value={state?.AgeMonth}
                        onInput={(e) => number(e, 2, 12)}
                        onChange={handleDOBCalculation}
                      />

                      <Input
                        // placeholder="D"
                        lable={t("DD")}
                        type="text"
                        className="required-fields"
                        name="AgeDays"
                        value={state?.AgeDays}
                        onInput={(e) => number(e, 2, 31)}
                        onChange={handleDOBCalculation}
                      />
                    </div>
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
                item?.ControlDisplayID === "Email" &&
                isHideController("Email")
              ) {
                return (
                  <div className="col-sm-2">
                    <Input
                      type="text"
                      lable="Email"
                      name="Email"
                      placeholder=" "
                      id="Email"
                      value={LTData?.Email}
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
                item?.ControlDisplayID === "HouseNo" &&
                isHideController("HouseNo")
              ) {
                return (
                  <div className="col-sm-2">
                    <Input
                      lable="Address"
                      type="text"
                      name="HouseNo"
                      max={100}
                      placeholder=" "
                      id="Address"
                      value={LTData?.HouseNo}
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
                item?.ControlDisplayID === "DoctorName" &&
                isHideController("DoctorName")
              ) {
                return (
                  <div className="col-sm-2 col-6">
                    <div className="p-inputgroup d-flex">
                      <div style={{ width: "87%" }}>
                        <Input
                          className="required-fields"
                          id="DoctorName"
                          name="DoctorName"
                          lable={t("Doctor")}
                          onChange={(e) => {
                            setFormData({
                              ...formData,
                              DoctorName: e.target.value,
                            });
                            setDropFalse(true);
                          }}
                          value={formData?.DoctorName}
                          onBlur={(e) => {
                            autocompleteOnBlur(setDoctorSuggestion);
                            setTimeout(() => {
                              const data = doctorSuggestion.filter(
                                (ele) => ele?.Name === e.target.value,
                              );
                              if (data.length === 0) {
                                setFormData({ ...formData, DoctorName: "" });
                              }
                            }, 500);
                          }}
                          onKeyDown={handleIndex}
                          placeholder={t(" ")}
                          type="text"
                          required
                        />
                        {dropFalse && doctorSuggestion.length > 0 && (
                          <ul className="suggestion-data">
                            {doctorSuggestion.map((data, index) => (
                              <li
                                onClick={() =>
                                  handleListSearch(data, "DoctorName")
                                }
                                className={`${index === indexMatch && "matchIndex"}`}
                                key={index}
                              >
                                {t(data?.Name)}
                              </li>
                            ))}
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
                    {item?.IsMandatory === 1 &&
                      moreErrors?.[item.ControlDisplayID] && (
                        <div className="error-message">
                          {moreErrors[item.ControlDisplayID]}
                        </div>
                      )}

                    {/* {!err?.DoctorName &&
                        !err?.DoctorID &&
                        (errors?.DoctorID || errors?.DoctorName) && (
                          <div className="error-message">
                            {t(errors?.DoctorID || errors?.DoctorName)}
                          </div>
                        )}
                      {formData.DoctorName === "" && (
                        <div className="error-message">{t(err?.DoctorName)}</div>
                      )}
                      {formData.DoctorName !== "" && formData?.DoctorID === "" && (
                        <div className="error-message">{t(err?.DoctorID)}</div>
                      )} */}
                  </div>
                );
              }
            })}
        </div>
      </Accordion>

      {blockMsg && (
        <div className="alert alert-danger text-center mt-3 mx-3" style={{ fontWeight: 600 }}>
          <i className="fa fa-exclamation-triangle mr-2" />
          {blockMsg}
        </div>
      )}

      {pageReady && <>
      <Accordion title={t("Estimate Details")} defaultValue={true}>
        <div className="row d-flex pb-2">
          <div style={{ width: "50%" }} className="col-md-9 col-sm-12 col-12">
            <div className="row pt-2 pl-2 pr-2 pb-2">
              <div className="col-sm-5">
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
                  max={30}
                  id="testSearch"
                  onChange={handleSearchSuggest}
                  onBlur={() => {
                    autocompleteOnBlur(setSuggestion);
                    setTimeout(() => {
                      const testSearchInput = document.getElementById("testSearch");
                      if (testSearchInput) {
                        testSearchInput.value = "";
                      }
                    }, 500);
                  }}
                  onKeyDown={handleIndex}
                />
                {errors?.tableData && (
                  <span className="error-message">{errors?.tableData}</span>
                )}
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
              <div className="col-sm-4">
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
                      By TestName
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
                      By TestCode
                    </label>
                  </div>
                </div>
              </div>
            </div>
            <div className="row px-2">
              <div className="col-sm-10">
                <Tables>
                  <thead>
                    <tr>
                      <th className="text-center">{"#"}</th>
                      {/* <th>{"Slot"}</th> */}
                      <th>{"Code"}</th>
                      <th
                        style={{
                          wordWrap: "break-word",
                          whiteSpace: "normal",
                        }}
                      >
                        {"Item"}
                      </th>
                      <th>{"View"}</th>
                      <th>{"DOS"}</th>
                      <th>{"MRP"}</th>
                      {/* <th>{"Rate"}</th> */}
                      <th>{"Amt"}</th>
                      <th>{"D.Date"}</th>
                      {allowOutsourceLab && <th>{t("Outsource Lab")}</th>}
                      <th className="text-center">
                        <i class="fa fa-trash"></i>
                      </th>
                    </tr>
                  </thead>
                  {tableData.length > 0 && (
                    <tbody>
                      {tableData.map((data, index) => (
                        <>
                          <tr
                            key={index}
                            style={{
                              backgroundColor:
                                data?.isOutSource === 1 ? "pink" : "",
                            }}
                          >
                            <EstimateRatenewTable
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
                              handlePLOChange={handlePLOChange}
                              handleUrgent={handleUrgent}
                              handleRateTypePaymode={handleRateTypePaymode}
                              state={state}
                              allowOutsourceLab={allowOutsourceLab}
                              outSourceLabOptions={outSourceLabOptions}
                            />
                          </tr>
                        </>
                      ))}
                    </tbody>
                  )}
                </Tables>
                {tableData.length > 0 && (
                  <div
                    className="d-flex justify-content-end mt-2 "
                    style={{ borderTop: "1px solid #ddd", paddingTop: "5px" }}
                  >
                    <div
                      style={{
                        background: "#f8f9fa",
                        padding: "5px 15px",
                        borderRadius: "5px",
                        boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                      }}
                    >
                      <span style={{ fontWeight: "bold", color: "#333" }}>
                        Final Delivery Date:{" "}
                      </span>
                      <span style={{ fontWeight: "bold", color: "#dc3545" }}>
                        {findFinalDeliveryDate()}
                      </span>
                    </div>
                  </div>
                )}
              </div>{" "}
              <div className="col-sm-2">
                <div className="row d-flex align-items-center justify-content-between">
                  <div className="col-md-6">
                    <Input
                      lable={t("Total MRP")}
                      name="TotlaMRP"
                      id="TotlaMRP"
                      type="number"
                      placeholder=""
                      value={findMRPAndRateEstimate().MRP}
                      disabled={true}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="col-md-6">
                    <Input
                      lable={t("Total Amt")}
                      name="TotalRate"
                      id="TotalRate"
                      type="number"
                      placeholder=""
                      value={findMRPAndRateEstimate().Rate}
                      disabled={true}
                      onChange={handleChange}
                    />
                  </div>
                </div>
                <div className="row">
                  <div className="col-sm-12 d-flex gap-2">
                    <button
                      type="submit"
                      id="btnSave"
                      className="btn btn-success btn-sm flex-fill"
                      onClick={() => {
                        handleSubmit();
                        window.scrollTo(0, 0);
                      }}
                    >
                      {t("Submit")}
                    </button>
                    {/* <button
                      type="button"
                      className="btn btn-primary btn-sm flex-fill"
                      onClick={handleSubmitAndBilling}
                    >
                      {t("Submit and Billing")}
                    </button> */}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <Heading
          title={t("Estimate Booking Details")}
          secondTitle={
            <div
              className="d-flex justify-content-between align-items-center pt-1"
              style={{ gap: "10px" }}
            >
              {/* Display individual sums and total */}
              <div style={{ fontWeight: "bold", display: "flex", gap: "12px" }}>
                <div
                  style={{
                    fontWeight: "bold",
                    display: "flex",
                    gap: "10px",
                    alignItems: "center",
                  }}
                >
                  {/* <span>
                      {t("Total MRP")}:{" "}
                      <span style={{ color: "#dc3545" }}>
                        {estimateData.reduce(
                          (sum, item) => sum + item.GrossAmount,
                          0
                        )}
                      </span>
                    </span> */}
                  <span>
                    {t("Total Amount")}:{" "}
                    <span style={{ color: "#dc3545" }}>
                      {estimateData.reduce(
                        (sum, item) => sum + item.NetAmount,
                        0,
                      )}
                    </span>
                  </span>
                </div>
              </div>
              {/* Status filter dots */}
              <div style={{ gap: "4px" }} className="d-flex">
                {Object.keys(statusConfig).map((status) => (
                  <TableFilterDot
                    key={status}
                    // onClick={() => handleFilterInputChange(status)}
                    color={statusConfig[status].text}
                    // bgColor={statusConfig[status].bg}
                    title={`${status} ${statusCount(status)}`}
                  />
                ))}
                <div className="" style={{ width: "150px" }}>
                  <ReactSelect
                    name="NumberOfRecords"
                    id="NumberOfRecords"
                    lable="No. Of Records"
                    placeholderName={t("No. Of Records")}
                    value={recordsPerPage}
                    dynamicOptions={recordOptions}
                    removeIsClearable={true}
                    onChange={handleRecordsChange}
                  />
                </div>

                <div className="row mb-2">
                  <div className="col-12 d-flex justify-content-end">
                    <Link
                      to="/EstimateRatenewList"
                      style={{
                        fontSize: "13px",
                        textDecoration: "underline",
                        cursor: "pointer",
                      }}
                    >
                      <CustomButton text={"Back to List"} icon={"back"} />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          }
        />
        {/* <Accordion
          title={t("Estimate Booking Details")}
          defaultValue={true}
          linkTo="#"
          seconTitle={
              <div
                className="d-flex justify-content-between align-items-center pt-1"
                style={{ gap: "10px" }}
              >
               
                <div
                  style={{ fontWeight: "bold", display: "flex", gap: "12px" }}
                >
                  <div
                    style={{
                      fontWeight: "bold",
                      display: "flex",
                      gap: "10px",
                      alignItems: "center",
                    }}
                  >
                    
                    <span>
                      {t("Total Amount")}:{" "}
                      <span style={{ color: "#dc3545" }}>
                        {estimateData.reduce(
                          (sum, item) => sum + item.NetAmount,
                          0
                        )}
                      </span>
                    </span>
                  </div>
                </div>
               
                <div style={{ gap: "4px" }} className="d-flex">
                  {Object.keys(statusConfig).map((status) => (
                    <TableFilterDot
                      key={status}
                      color={statusConfig[status].text}
                      bgColor={statusConfig[status].bg}
                      title={`${status} ${statusCount(status)}`}
                    />
                  ))}
                <div className="" style={{width: "150px"}}>
                  <ReactSelect
                    name="NumberOfRecords"
                    id="NumberOfRecords"
                    lable="No. Of Records"
                    placeholderName={t("No. Of Records")}
                    value={recordsPerPage}
                    dynamicOptions={recordOptions}
                    removeIsClearable={true}
                    onChange={handleRecordsChange}
                  />
                  </div>
                
                </div>
              </div>
            }
          > */}
        {/* <div className="d-flex justify-content-end">
            <div className="col-sm-2">
              <ReactSelect
                name="NumberOfRecords"
                id="NumberOfRecords"
                lable="No. Of Records"
                placeholderName={t("No. Of Records")}
                value={recordsPerPage}
                dynamicOptions={recordOptions}
                removeIsClearable={true}
                onChange={handleRecordsChange}
              />
            </div>
            </div> */}
        <div className="row px-2 mt-2 mb-2">
          <div className="col-12">
            {loading ? (
              <Loading />
            ) : estimateData.length > 0 ? (
              <>
                <Tables
                  style={{
                    maxHeight: "400px",
                    overflowY: "auto",
                  }}
                >
                  <thead className="cf">
                    <tr>
                      <th>{t("S.No")}</th>
                      <th>{t("EstimateNo")}</th>
                      <th>{t("Reg Date")}</th>
                      <th>{t("PName | Age | Gender")}</th>
                      <th>{t("Mobile")}</th>
                      <th>{t("Email")}</th>
                      {/* <th>{t("MRP")}</th> */}
                      <th>{t("Amount")}</th>
                      <th>{t("TestInfo")}</th>
                      <th>{t("Print")}</th>
                      <th>{t("Convert")}</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {estimateData?.map((data, index) => (
                      <tr key={data?.EstimateNo}>
                        <td data-title={"S No."}>{index + 1}</td>
                        <td data-title={"EstimateNo"}>{data?.EstimateNo}</td>
                        <td data-title={"Reg Date"}>{data?.CreatedDate}</td>
                        <td
                          data-title={"PName | Age | Gender"}
                        >{`${data?.PName} | ${data?.AgeYear}Y ${data?.AgeMonth}M ${data?.AgeDays}D | ${data?.Gender}`}</td>
                        <td data-title={"Mobile"}>{data?.Mobile}</td>
                        <td data-title={"Email"}>{data?.Email}</td>
                        {/* <td data-title={"MRP"}>{data?.mrp || ""}</td> */}
                        <td data-title={"Amount"}>{data?.NetAmount}</td>
                        <td data-title={"TestInfo"}>
                          <div
                            className=""
                            style={{
                              textDecoration: "none",
                              color: "#007bff",
                            }}
                            title="View Test"
                          >
                            <FaEye
                              size={18}
                              onClick={() => handleTestInfoClick(data)}
                            />
                          </div>
                        </td>

                        <td data-title={"Actions"}>
                          {printLoading === data?.EstimateNoHash ? (
                            <i className="fa fa-spinner fa-spin me-2 mr-2" />
                          ) : (
                            <span
                              onClick={() =>
                                handlePrintReport(data?.EstimateNoHash)
                              }
                              title="Print"
                            >
                              <MdPrint size={18} />
                            </span>
                          )}
                          {data?.StatusID != 1 && (
                            <span
                              onClick={() => HandleLogDetails(data)}
                              title="View Logs"
                              className="mx-3"
                            >
                              {/* <i class="bi bi-database d-inline"></i> */}
                              <FiFileText
                                size={18}
                                style={{ color: "#2783e5" }}
                              />
                            </span>
                          )}
                          {/* {[1].includes(data?.StatusID) && (
                              <Link
                                className="ml-3"
                                to={"/patientregister"}
                                state={data}
                                title="Register Patient"
                              >
                                <FaUser size={16} />
                              </Link>
                            )}
                             */}
                          {/* <i className="bi bi-printer-fill"></i> */}
                        </td>
                        <td
                          data-title={"Convert"}
                          style={{ maxWidth: "150px", gap: "5px" }}
                          className="d-flex"
                        >
                          <div style={{ minWidth: "100px", gap: "5px" }}>
                            <ReactSelect
                              dynamicOptions={statusOptions}
                              name="StatusID"
                              lable={t("Status")}
                              id="StatusID"
                              removeIsClearable={true}
                              placeholderName={t("Status")}
                              value={data?.StatusID}
                              onChange={(name, value) =>
                                handleSelectStatusChange(name, value, data)
                              }
                            />
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Tables>
              </>
            ) : (
              <NoRecordFound />
            )}
          </div>
        </div>
      </Accordion>
      </>}
    </>
  );
};

export default EstimateRatenew;
