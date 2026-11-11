import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  DateTypeSearch2,
  defaultSearchTypes,
  Flag,
  getStatusColor,
  Order,
  SampleStatus,
  SearchBy,
} from "../../utils/Constants";
import Accordion from "@app/components/UI/Accordion";
import {
  AddBlankData,
  AllDataDropDownPayload,
  CheckDevice,
  DyanmicStatusResponse,
  Time,
  autocompleteOnBlur,
  dateConfig,
  getTrimmedData,
  number,
  onlyNumbers,
  shouldIncludeAIIMSID,
  getMaxToDate,
} from "../../utils/helpers";
import { axiosInstance, axiosReport } from "../../utils/axiosInstance";
import {
  DepartmentWiseItemList,
  getCollectionBoy,
  getDoctorSuggestion,
  getPaymentModes,
  getSearchController,
} from "../../utils/NetworkApi/commonApi";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import Tables from "../../components/UI/customTable";
import { toast } from "react-toastify";
import moment from "moment";
import { useTranslation } from "react-i18next";
import { isChecked } from "../util/Commonservices";
import { Dialog } from "primereact/dialog";
import { useLocalStorage } from "../../utils/hooks/useLocalStorage";
import PatientDetailModal from "../utils/PatientDetailModal";
import NoRecordFound from "../../components/formComponent/NoRecordFound";
import CustomTimePicker from "../../components/formComponent/TimePicker";
import RETable from "../Table/ResultEntryTable";
import Loading from "../../components/loader/Loading";
import MedicialModal from "../utils/MedicialModal";
import UploadFile from "../utils/UploadFileModal/UploadFile";
import RSadvanceFilter from "../utils/RSadvanceFilter";
import { SelectBox } from "../../components/formComponent/SelectBox";
import Input from "../../components/formComponent/Input";
import AutoComplete from "../../components/formComponent/AutoComplete";
import DatePicker from "../../components/formComponent/DatePicker";
import OldReportModal from "../utils/OldReportModal";
import ResultEntryEditModal from "../utils/ResultEntryEditModal";
import ResultEditAddModal from "../utils/ResultEditAddModal";
import TemplateMasterModal from "../utils/TemplateMasterModal";
import RerunResultEntryModal from "../utils/RerunResultEntryModal";
import AuditTrailMoadal from "../utils/AuditTrailMoadal";
import Reason from "../utils/Reason";
import SampleRemark from "../utils/SampleRemark";
import ReceiptReprintFilter from "./ReceiptReprintFilter";
import ResultEntryTableCustom from "./ResultEntryTableCustom";
import Tooltip from "../../components/formComponent/Tooltip";
import RejectModal from "../utils/RejectModal";

import CryptoJS from "crypto-js";
import ReactSelect from "../../components/formComponent/ReactSelect";
import MultiBackGroundReactSelect from "./MultiBackGroundReactSelect";
import { useDispatch } from "react-redux";
import { Button, Form } from "react-bootstrap";
import TableFilterDot from "../../components/TableFilter/TableFilterDot";
import "./ResultEntry.css";
import REAlertModal from "../utils/REAlertModal";
import { CustomSelectBox } from "../../components/formComponent/CustomSelectBox";
import Urgent from ".././Images/urgent.gif";
import LabWorksheetTable from "../Table/LabWorkSheetTable";
import { CustomButton, SearchButton } from "../../components/UI/CustomButton";
import HistoWorkSheetTable from "../Table/HistoWorkSheetTable";

const HistoWorksheet = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const {
    ShowAllCheckBarcodeOption,
    ShowDefaultLoginCentre,
    HideOmitOptionatResultEntry,
  } = useLocalStorage("userData", "get");
  console.log("HideOmitOptionatResultEntry", HideOmitOptionatResultEntry);
  const DefaultCentre = useLocalStorage("DefaultCentre", "get");
  const globalCentre = useLocalStorage("DefaultCentre", "get");
  const [WardNoOptions, setWardNoOptions] = useState([]);
  const [TestSuggestion, setTestSuggestion] = useState([]);
  const [CentreData, setCentreData] = useState([]);
  const [doctorAdmin, setDoctorAdmin] = useState([]);
  const [RateTypes, setRateTypes] = useState([]);
  const [transferCentres, setTransferCentres] = useState([]);
  const [DepartmentData, setDepartmentData] = useState([]);
  const [ResultTestData, setResultTestData] = useState([]);
  const [copyPayload, setCopyPayload] = useState({});
  const [ResultData, setResultData] = useState([]);
  const [HiddenDropDownHelpMenu, setHiddenDropDownHelpMenu] = useState(false);
  const [indexMatch, setIndexMatch] = useState(0);
  const [buttonsData, setButtonsData] = useState([]);
  const [helpmenu, setHelpMenu] = useState([]);
  const [packageSuggestions, setPackageSuggestions] = useState([]);
  // const [DlcCheckChecked, setDlcCheckChecked] = useState(true);
  const [dropFalse, setDropFalse] = useState(true);
  const [doctorSuggestion, setDoctorSuggestion] = useState([]);
  const [statusValue, setStatusValue] = useState("");
  const [modalpayload, setmodalPayload] = useState({});
  const [machine, setMachine] = useState([]);
  const [proEmployee, setProEmployee] = useState([]);
  const [machineId, setMachineId] = useState([]);
  const [testIndex, setTestIndex] = useState(0);
  const [show, setShow] = useState({
    moadal: false,
    data: {},
  });
  const [showAlert, setShowAlert] = useState({
    modal: false,
    field: "",
    data: [],
    val: [],
    errorToast: "",
  });

  const [DignosticMaster, setDignosticMaster] = useState([]);

  const [returnFromResultTableWithStatus, setReturnFromResultTableWithStatus] =
    useState(null);
  const [testCount, setTestCount] = useState(0);
  const [columnConfig, setColumnConfig] = useState([]);
  const [approve, setshowApprove] = useState({
    msg: "",
    show: false,
  });

  const [PreviousTestResult, setPreviousTestResult] = useState([]);
  const [headerTestResult, setHeaderTestResult] = useState([]);
  const [show2, setShow2] = useState({
    moadal: false,
    data: {},
  });
  const [PrintReportLoading, setPrintReportLoading] = useState(false);
  const [showAdvanceFilter, setShowAdvanceFilter] = useState({
    show: false,
    data: "",
  });
  const [selects, setSelects] = useState(false);
  const [selectpackage, setSelectpackage] = useState(false);
  const [state, setState] = useState({
    ProEmployee: "",
  });
  const [show3, setShow3] = useState({
    modal: false,
    data: {},
  });
  const globalReportType = ResultData?.some((item) => item?.ReportType == 1);
  const [show4, setShow4] = useState({
    modal: false,
    data: "",
    index: -1,
    ID: 0,
  });
  const [show5, setShow5] = useState({
    modal: false,
    data: "",
  });

  const [isTGGreaterThan400, setisTGGreaterThan400] = useState({
    value: 0,
    isTG: null,
  });
  const [mouseHover, setMouseHover] = useState({
    index: -1,
    data: [],
  });
  const [testHeaderHover, setTestHeaderHover] = useState({
    index: -1,
    data: [],
  });

  const [toggleDate, setToggleDate] = useState({
    FromDate: false,
    ToDate: false,
  });
  const [showReject, setShowReject] = useState({
    show: false,
    data: {},
  });
  const [showRemark, setShowRemark] = useState(false);
  const [showPrickRemark, setShowPrickRemark] = useState(false);
  const [redata, SetReData] = useState([]);
  const theme = useLocalStorage("theme", "get");
  const [showdetails, setshowDetails] = useState(true);
  const [load, setLoad] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [Identity, setIdentity] = useState([]);
  const [collectionBoy, setCollectionBoy] = useState();
  const [collectionBoyList, setCollectionBoyList] = useState([]);
  const [originalTableData, setOriginalTableData] = useState([]);
  const accessRightStr = useLocalStorage("accessRight", "get") || "";
  const accessRight = accessRightStr
    ? accessRightStr?.split(",").filter(Boolean)
    : [];
  const [showAuditTrail, setShowAuditTrail] = useState({
    show: false,
    data: "",
    testname: "",
  });
  const [show6, setShow6] = useState({
    modal: false,
    data: "",
    index: -1,
  });
  const [selectedRowIndex, setSelectedRowIndex] = useState(-1);
  const [show7, setShow7] = useState({
    modal: false,
    data: "",
    index: -1,
  });

  const [showOmitModal, setShowOmitModal] = useState(false);
  const [omitTests, setOmitTests] = useState([]);
  const [modalAction, setModalAction] = useState("");

  const [controllerDynamicList, setControllerDynamicList] = useState([]);
  const [tabbingOrder, setTabbingOrder] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isSampleStatusFixed, setIsSampleStatusFixed] = useState(false);
  const [sampleStatusHeight, setSampleStatusHeight] = useState(42);
  const sampleSentinelRef = useRef(null);
  const sampleStatusRef = useRef(null);

  const today = new Date();
  const { DefaultDateTypeResultEntry, MaxDateRangeatResultEntry } = useLocalStorage("userData", "get");
  console.log("MaxDateRangeatResultEntry", MaxDateRangeatResultEntry);
  const maxRange = Number(MaxDateRangeatResultEntry) || 15;
  let isTrueCheckBarcodeOption =
    ShowAllCheckBarcodeOption == 1 && defaultSearchTypes == "BarcodeNo";
  const [checkBarcodeOption, setCheckBarcodeOption] = useState(
    isTrueCheckBarcodeOption,
  );
  const [selectedIDs, setSelectedIDs] = useState([]);
  const [formData, setFormData] = useState({
    FromDate: new Date(),
    ToDate: new Date(),
    CentreID: "",
    testCentreID: "0",
    ItemValue: "",
    RateTypeID: "",
    SelectTypes: defaultSearchTypes || "",
    RefundFilter: null,
    FromTime: "00:00:00",
    ToTime: "23:59:59",
    // FromTime: new Date(today.setHours(0, 0, 0, 0)),
    // ToTime: new Date(today.setHours(23, 59, 59, 999)),
    DoctorReferal: "",
    DepartmentID: "",
    DoctorName: "",
    TestName: "",
    SampleStatus: "3",
    DateTypeSearch: DefaultDateTypeResultEntry || "Date",
    IsUrgent: "",
    IsVip: "",
    MachineID: "",
    IsTat: 0,
    Order: "DESC",
    Flag: "",
    moreFilter: 0,
    parameterId: [],
    valueCheck: "=",
    valueToSearch: "",
    valueRangeFrom: "",
    valueRangeTo: "",
    WardNo: "",
    Package: "",
    OutSourceStatus: "-1",
    InvestigationID: "",
    DignosticMasterID: "",
    // TAT: "",
  });

  // const getMaxToDate = () => {
  //   if (!formData?.FromDate) return new Date();

  //   const date = new Date(formData.FromDate);
  //   date.setDate(date.getDate() + maxRange);

  //   return date > new Date() ? new Date() : date;
  // };

  const [reason, setReason] = useState({
    HoldShow: false,
    Hdata: "",
    type: "",
  });
  const [isPreviousResultAvailable, setIsPreviousResultAvailable] =
    useState(false);
  const [showOldReportModal, setShowOldReportModal] = useState({
    show: false,
    data: {},
  });
  const [showPH, setShowPH] = useState(false);
  const handleShowReject = () => {
    setShowReject({
      show: false,
      data: {},
    });
  };
  const handleCloseReject = () => {
    setResultData([]);
  };

  const handleGetReport = (selectedTestIDs) => {
    if (!selectedTestIDs.length) {
      toast.error("Please select at least one test to generate the report");
      return;
    }

    console.log("SelectedIDs", selectedTestIDs);

    axiosReport.post("commonReports/LabWorksheetHisto", {
      testIDHash: selectedTestIDs,
    },
      { responseType: "blob" }
    ).
      then((res) => {
        console.log("report res", res);
        const file = new Blob([res.data], { type: "application/pdf" });

        const fileURL = URL.createObjectURL(file);

        // ✅ Open in new tab
        window.open(fileURL);
      }).catch((err) => {
        toast.error("No Report Found");
        console.log("report err", err)
      })
      .finally(() => {

      });

  };
  const location = useLocation();
  const { SkipTestCentreResultEntry } = useLocalStorage("userData", "get");
  const searchParams = new URLSearchParams(location.search);
  const decryptData = (encryptedData) => {
    const secretKey = "resultentry";
    const bytes = CryptoJS.AES.decrypt(
      decodeURIComponent(encryptedData),
      secretKey,
    );
    return JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
  };
  const [dynamicFilter, setDynamicFilter] = useState([]);
  const ResultEntryFilter = () => {
    setLoading(true);
    axiosInstance
      .post("Lab/getFilterTableReprintData", {
        PageName: "ResultEntryFilter",
        EmployeeId: EmployeeID?.toString(),
      })
      .then((res) => {
        let data = res?.data?.message;

        setDynamicFilter(data);
        setLoading(false);
      })
      .catch((err) => {
        setDynamicFilter([]);
        setLoading(false);
      });
  };

  const handleGetSelectedIDs = (ids) => {
    setSelectedIDs(ids);
  };



  useEffect(() => {
    ResultEntryFilter();
    getCollectionBoy(setCollectionBoyList, true);
  }, []);

  const handleToggleChange = (e) => {
    const { checked } = e.target;
    setCheckBarcodeOption(checked);
  };

  // const isVisible = (header) =>
  //   dynamicFilter.find((f) => f?.header === header)?.visible;

  const isVisible = (header) => {
    if (controllerDynamicList?.length) {
      const dynCtrl = controllerDynamicList.find(
        (x) => x?.ControlDisplayID === header && x?.TypeId === 1,
      );
      if (dynCtrl) {
        if (!dynCtrl.IsShow) return false;
      }
    }
    return dynamicFilter.find((f) => f?.header === header)?.visible;
  };

  const id = searchParams.get("id")
    ? decryptData(searchParams.get("id"))
    : null;

  const EmployeeID = useLocalStorage("userData", "get")?.EmployeeID;
  const OnAppGoToMainList = useLocalStorage(
    "userData",
    "get",
  )?.OnAppGoToMainList;

  const getFilterResultOption = () => {
    axiosInstance
      .post("Lab/getFilterTableReprintData", {
        PageName: "ResultEntry",
        EmployeeId: EmployeeID?.toString(),
      })
      .then((res) => {
        let data = res?.data?.message;

        setColumnConfig(data);
      })
      .catch((err) => setColumnConfig([]));
  };

  const getWardNo = () => {
    axiosInstance
      .post("Global/getGlobalData", { Type: "WardNo" })
      .then((res) => {
        let data = res?.data?.message;
        let value = data?.map((ele) => {
          return {
            value: ele.FieldDisplay,
            label: ele.FieldDisplay,
          };
        });
        setWardNoOptions(value);
      })
      .catch((err) => console.log(err));
  };
  console.log({ WardNoOptions });

  const BindMachineName = () => {
    axiosInstance
      .get("MachineGroup/BindMachineName")
      .then((res) => {
        let data = res?.data?.message;

        let val = data?.map((ele) => {
          return {
            value: ele?.MachineId,
            label: ele?.MachineName,
          };
        });

        val.unshift({ label: "All Machine", value: 0 });
        setMachineId(val);
      })
      .catch((err) => {
        console.log(
          err?.response?.data?.message
            ? err?.response?.data?.message
            : "Error Occurxxx",
        );
      });
  };
  const getMachine = () => {
    axiosInstance
      .get("RE/BindMachineGroup")
      .then((res) => {
        let data = res.data.message;
        let Machine = data.map((ele) => {
          return {
            value: ele.MachineId,
            label: ele.MachineName,
          };
        });
        setMachine(Machine);
      })
      .catch((err) => console.log(err));
  };

  useEffect(() => {
    getMachine();
    BindMachineName();
    getFilterResultOption();
  }, []);

  const handleIndexNew = (e, name) => {
    switch (name) {
      case "Package":
        switch (e.which) {
          case 38:
            if (indexMatch !== 0) {
              setIndexMatch(indexMatch - 1);
            } else {
              setIndexMatch(packageSuggestions.length - 1);
            }
            setTimeout(() => {
              const el = document.querySelector(".matchIndex");
              if (el) el.scrollIntoView({ block: "nearest" });
            }, 0);
            break;
          case 40:
            if (packageSuggestions.length - 1 === indexMatch) {
              setIndexMatch(0);
            } else {
              setIndexMatch(indexMatch + 1);
            }
            setTimeout(() => {
              const el = document.querySelector(".matchIndex");
              if (el) el.scrollIntoView({ block: "nearest" });
            }, 0);
            break;
          case 13:
            handleListSearchNew(packageSuggestions[indexMatch], name);
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

  useEffect(() => {
    if (formData?.TestName.length > 2) {
      DepartmentWiseItemList(
        formData.DepartmentID,
        formData?.TestName,
        setTestSuggestion,
        true,
        "Investigation",
      );
    }
  }, [formData?.TestName]);

  useEffect(() => {
    if (formData?.Package?.length > 2) {
      DepartmentWiseItemList(
        formData.DepartmentID,
        formData?.Package,
        setPackageSuggestions,
        true,
        "Package",
      );
    }
  }, [formData?.Package, formData?.DepartmentID]);

  const handleListSearchNew = (data, name) => {
    switch (name) {
      case "DoctorName":
        setFormData({
          ...formData,
          [name]: data.Name,
          DoctorReferal: data.Name ? data.DoctorReferalID : "",
        });
        setIndexMatch(0);
        setDoctorSuggestion([]);
        setDropFalse(false);
        break;

      case "TestName":
        setFormData({
          ...formData,
          [name]: data.TestName,
          InvestigationID: data?.InvestigationID,
          Package: "",
        });
        setSelects(false);
        // setTestIndex(0);
        setIndexMatch(0);
        setTestSuggestion([]);
        break;

      case "Package":
        setFormData({
          ...formData,
          Package: data.TestName, // or data.value if mapped
          InvestigationID: data?.InvestigationID, // optional, if needed
        });
        setSelectpackage(false);
        setIndexMatch(0);
        setPackageSuggestions([]);
        break;

      default:
        break;
    }
  };

  useEffect(() => {
    getDoctorSuggestion(formData, setDoctorSuggestion, setFormData);
    if (formData?.DoctorName === "") {
      setDropFalse(true);
    }
  }, [formData?.DoctorName]);

  const validation = () => {
    let error = "";
    if (
      formData?.SelectTypes.trim() !== "" &&
      formData?.ItemValue.trim() === ""
    ) {
      error = { ...error, ItemValue: t("Please Choose Value") };
    }
    if (formData.SelectTypes === "Mobile") {
      if (formData?.SelectTypes !== "" && formData?.ItemValue === "") {
        error = { ...error, ItemValue: t("This Field is Required") };
      } else if (formData.ItemValue.length !== 10) {
        error = { ...error, ItemValue: t("Invalid Mobile Number") };
      }
    }

    return error;
  };

  const myRefs = useRef([]);

  const handleKeyUp = (e, index) => {
    if (e.key === "Tab") {
      e.preventDefault();
      if (e.shiftKey) {
        // move backward
        let prevIndex = index - 1;
        while (
          prevIndex >= 0 &&
          (!myRefs.current[prevIndex] ||
            myRefs.current[prevIndex].tagName !== "INPUT" ||
            myRefs.current[prevIndex].disabled)
        ) {
          prevIndex--;
        }
        if (prevIndex < 0) {
          prevIndex = myRefs.current.length - 1;
        }
        const prevElem = myRefs.current[prevIndex];
        if (prevElem && typeof prevElem.focus === "function") {
          prevElem.focus();
          if (typeof prevElem.select === "function") {
            prevElem.select();
          }
        }
      } else {
        // move forward
        let nextIndex = index + 1;
        while (
          nextIndex < myRefs.current.length &&
          (!myRefs.current[nextIndex] ||
            myRefs.current[nextIndex].tagName !== "INPUT" ||
            myRefs.current[nextIndex].disabled)
        ) {
          nextIndex++;
        }
        if (nextIndex >= myRefs.current.length) {
          nextIndex = 0;
        }
        const nextElem = myRefs.current[nextIndex];
        if (nextElem && typeof nextElem.focus === "function") {
          nextElem.focus();
          if (typeof nextElem.select === "function") {
            nextElem.select();
          }
        }
      }
    } else if (e.key === "Enter") {
      e.preventDefault();
      // move forward on Enter
      let nextIndex = index + 1;
      while (
        nextIndex < myRefs.current.length &&
        (!myRefs.current[nextIndex] ||
          myRefs.current[nextIndex].tagName !== "INPUT" ||
          myRefs.current[nextIndex].disabled)
      ) {
        nextIndex++;
      }
      if (nextIndex >= myRefs.current.length) {
        nextIndex = 0;
      }
      const nextElem = myRefs.current[nextIndex];
      if (nextElem && typeof nextElem.focus === "function") {
        nextElem.focus();
        if (typeof nextElem.select === "function") {
          nextElem.select();
        }
      }
    }
  };

  const handleToggle = (name) => {
    setToggleDate({ ...toggleDate, [name]: !toggleDate[name] });
  };

  const dateSelect = (value, name) => {
    if (name === "FromDate") {
      const newFrom = new Date(value);

      const maxAllowedTo = new Date(newFrom);
      maxAllowedTo.setDate(maxAllowedTo.getDate() + maxRange);

      const today = new Date();
      const finalMaxTo = maxAllowedTo > today ? today : maxAllowedTo;

      let updatedToDate = formData.ToDate;

      // Case 1: ToDate < FromDate
      if (new Date(updatedToDate) < newFrom) {
        updatedToDate = finalMaxTo;
      }

      // Case 2: ToDate > allowed range
      if (new Date(updatedToDate) > finalMaxTo) {
        updatedToDate = finalMaxTo;
      }

      setFormData((prev) => ({
        ...prev,
        FromDate: value,
        ToDate: updatedToDate
      }));

      return;
    }
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSearchSelectChange = (label, value) => {
    if (label === "CentreID") {
      setFormData({ ...formData, [label]: value?.value, RateTypeID: "" });
      if (value?.value == "") {
        fetchRateTypes(CentreData.map((ele) => ele.value));
      } else {
        fetchRateTypes([value?.value]);
      }
    } else {
      setFormData({ ...formData, [label]: value?.value });
    }
  };

  const handleSelectChange = (event) => {
    const { name, value, checked, type } = event?.target;
    if (name == "IsUrgent" || name == "IsVip") {
      setFormData({
        ...formData,
        [name]: type === "checkbox" ? checked : value,
      });
    } else {
      setFormData({ ...formData, [name]: value });
    }
    if (name == "SelectTypes" && value !== "BarcodeNo") {
      setCheckBarcodeOption(false);
    }
    if (
      name == "SelectTypes" &&
      value === "BarcodeNo" &&
      ShowAllCheckBarcodeOption == 1
    ) {
      setCheckBarcodeOption(true);
    }
  };
  // console.log(ResultTestData)
  const handleProEmployeeChange = (name, e) => {
    setState((prev) => ({ ...prev, [name]: e?.value }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "TestName") {
      if (value === "") {
        setSelects(false);
        setTestSuggestion([]);
        setFormData({ ...formData, TestName: "", InvestigationID: "" });
      } else {
        setSelects(true);
        setTestSuggestion((prev) =>
          prev.filter((ele) =>
            ele.TestName?.toLowerCase().includes(value.toLowerCase()),
          ),
        );
        setFormData({
          ...formData,
          TestName: value,
          Package: "",
          InvestigationID: "",
        });
      }
    } else if (name === "DoctorName") {
      if (value === "") {
        setDoctorSuggestion([]);
        setDropFalse(false);
      } else {
        setDoctorSuggestion((prev) =>
          prev.filter((ele) =>
            ele.Name?.toLowerCase().includes(value.toLowerCase()),
          ),
        );
      }
      setFormData({ ...formData, [name]: value });
    } else if (name === "Package") {
      if (value === "") {
        setSelectpackage(false);
        setPackageSuggestions([]);
        setFormData({ ...formData, Package: "", InvestigationID: "" });
      } else {
        setSelectpackage(true);
        setPackageSuggestions((prev) =>
          prev.filter((ele) =>
            ele.TestName?.toLowerCase().includes(value.toLowerCase()),
          ),
        );
        // Clear TestName when Package is being set
        setFormData({
          ...formData,
          Package: value,
          TestName: "",
          InvestigationID: "",
        });
      }
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const getAccessCentres = () => {
    axiosInstance
      .get("centre/getGlobalCentres")
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
        if (ShowDefaultLoginCentre === "1") {
          setFormData((prev) => ({ ...prev, CentreID: DefaultCentre }));
          fetchRateTypes([DefaultCentre]);
        } else {
          fetchRateTypes(allValues);
        }
      })
      .catch((err) => console.log(err));
  };

  const handleSave = (data, modal) => {
    if (modal === "Edit") {
      if (Number(data?.MinValue) >= Number(data?.MaxValue)) {
        toast.error(t("Please Enter Correct Min and Max Value"));
      } else {
        let val = ResultData.map((ele) => {
          if (ele.labObservationID == data?.labObservationID) {
            return {
              ...ele,
              DisplayReading: data?.DisplayReading,
              MinValue: data?.MinValue,
              MaxValue: data?.MaxValue,
              ReadingFormat: data?.ReadingFormat,
              SaveRangeStatus: 1,
              MethodName: data?.MethodName,
            };
          } else {
            return ele;
          }
        });
        setResultData(val);
        setShow({ moadal: false, data: {} });
      }
    }

    if (modal === "AddComment") {
      if (data?.pageName === "Single") {
        let val = ResultData.map((ele) => {
          if (ele.labObservationID == data?.labObservationID) {
            return {
              ...ele,
              COMMENT: data?.COMMENT,
              Dignomasterid: data?.Dignomasterid,
              SaveRangeStatus: 1,
            };
          } else {
            return ele;
          }
        });
        setResultData(val);
        setShow2({ moadal: false, data: {} });
      } else {
        let val = ResultTestData.map((ele) => {
          if (ele.TestID == data?.TestID) {
            return {
              ...ele,
              COMMENT: data?.COMMENT,
              SaveRangeStatus: 1,
              labObservationID: -1,
            };
          } else {
            return ele;
          }
        });
        setResultTestData(val);
        setShow2({ moadal: false, data: {} });
      }
    }

    if (modal === "TemplateMaster") {
      // console.log(data);
      let val = ResultData.map((ele) => {
        if (ele.labObservationID == data?.labObservationID) {
          console.log(data);
          return {
            ...ele,
            COMMENT: data?.COMMENT,
            CommentID: data?.CommentID,
          };
        } else {
          return ele;
        }
      });
      setResultData(val);
      setShow3({ moadal: false, data: {} });
    }
  };

  const getDignosticMasterData = () => {
    axiosInstance
      .get("DignosticMaster/GetDignosticDDL")
      .then((res) => {
        let data = res.data.message;
        let DignosticMaster = data.map((ele) => {
          return {
            value: ele.Dignomasterid,
            label: ele.DignoName,
          };
        });
        return setDignosticMaster(DignosticMaster);
      })
      .catch((err) => console.log(err));
  };

  const getDepartment = () => {
    axiosInstance
      .get("Department/getDepartment")
      .then((res) => {
        let data = res.data.message;
        let DeptDataValue = data.map((ele) => {
          return {
            value: ele.DepartmentID,
            label: ele.Department,
          };
        });

        setDepartmentData(DeptDataValue);
      })
      .catch((err) => console.log(err));
  };

  const TableData = (status) => {
    const rateTypes = RateTypes.map((item) => {
      return item?.value;
    });
    setLoading(true);
    // return;
    axiosInstance
      .post(
        "RE/GetLabWorkSheetHisto",
        getTrimmedData({
          CentreID: formData?.CentreID ? [formData?.CentreID] : [],
          testCentreID: formData?.testCentreID
            ? Number(formData.testCentreID)
            : "",
          ShowAllCheckBarcodeOption: checkBarcodeOption ? 1 : 0,
          CollectionBoyID: Number(collectionBoy),
          SelectTypes: formData.SelectTypes,
          ItemValue: formData.ItemValue,
          RateTypeID: formData?.RateTypeID ? [formData?.RateTypeID] : [],
          DoctorReferal: formData.DoctorReferal,
          FromDate: moment(formData.FromDate).format("DD/MMM/YYYY"),
          ToDate: moment(formData.ToDate).format("DD/MMM/YYYY"),
          FromTime: formData.FromTime,
          ToTime: formData.ToTime,
          DepartmentID: formData?.DepartmentID ? [formData?.DepartmentID] : [],
          SampleStatus:
            !!checkBarcodeOption && formData.ItemValue ? "" : status,
          TestName: formData?.TestName ? String(formData?.InvestigationID) : "",
          DateTypeSearch: formData?.DateTypeSearch,
          IsUrgent: formData?.IsUrgent ? 1 : 0,
          IsVip: formData?.IsVip ? 1 : 0,
          MachineID:
            formData?.MachineID == "" ? "0" : formData?.MachineID?.toString(),
          IsTat: formData?.IsTat,
          Order: formData?.Order,
          Flag: formData?.Flag,
          moreFilter: formData?.moreFilter,
          parameterId: formData?.parameterId,
          valueCheck: formData?.valueCheck,
          valueToSearch: formData?.valueToSearch,
          valueRangeFrom: formData?.valueRangeFrom,
          valueRangeTo: formData?.valueRangeTo,
          WardNo: formData?.WardNo,
          IsOutSource: formData?.OutSourceStatus || 0,
          PackageID: formData?.Package
            ? Number(formData?.InvestigationID || 0)
            : 0,
          ProEmployeeID: Number(state?.ProEmployee || 0),
          // TAT: Number(formData?.TAT || 0),
        }),
      )
      .then((res) => {
        setSelectedRowIndex(-1);
        if (Array.isArray(res?.data?.message)) {
          setTestCount(res?.data?.message?.length);
          const final = modifyArray(res?.data?.message);
          console.log("final>>>", final);
          const currentIndex = final?.map((ele, index) => {
            return {
              ...ele,
              index: index,
              currentIndex: index,
            };
          });
          SetReData(currentIndex);
          setOriginalTableData(res?.data?.message);
          console.log("currentIndex", currentIndex);
        } else {
          SetReData([]);
          setOriginalTableData([]);
          setTestCount(0);
        }
        setStatusValue(status === "" ? status : parseInt(status));
        setShowAdvanceFilter({ show: false, data: "" });
        setLoad(true);
        setLoading(false);
      })
      .catch((err) => setLoading(false));
  };

  const IsPatientWiseReporting = useLocalStorage(
    "userData",
    "get",
  )?.IsPatientWiseReporting;

  function createCheckbox(item) {
    if (item.Status == 5 || item.Status == 6) {
      return `<input type=\"checkbox\" onchange={handleCheck}  value=\"${item.TestIdhash}\" id=\"${item.LedgerTransactionID}\" class=${item.LedgerTransactionID} />`;
    } else {
      return "";
    }
  }

  // function modifyArray(dataArray) {
  //   const modifiedArray = [];
  //   const tempObject = {};
  //   const keyMap = {
  //     0: (item) => `${item.LedgerTransactionID}`,
  //     1: (item) => `${item.LedgerTransactionID}-${item.DepartmentID}`,
  //     2: (item) =>
  //       `${item.LedgerTransactionID}-${item.DepartmentID}-${item.SinNo}`,
  //     3: (item) => `${item.LedgerTransactionID}-${item.SinNo}`,
  //     4: (item) => `${item.TestID}`,
  //   };

  //   const getKey = keyMap[4] || (() => "");
  //   for (const item of dataArray) {
  //     const key = getKey(item);
  //     const checkboxHTML = `<p class="round Status-${item.Status}">${createCheckbox(item)}${item.TestName}</p>`;
  //     const remarksList = item.RemarksList ? JSON.parse(item.RemarksList) : [];

  //     const testDetails = {
  //       TestName: item.TestName,
  //       Status: item.Status,
  //       TestID: item.TestID,
  //       LedgerTransactionID: item.LedgerTransactionID,
  //       TestIdhash: item.TestIdhash,
  //     };

  //     if (tempObject[key]) {
  //       const existing = tempObject[key];
  //       existing.TestName += checkboxHTML;
  //       existing.TestDetails.push(testDetails);
  //       existing.TestID += `${item.TestID},`;
  //       existing.LabRemarkCount += item.LabRemarkCount || 0;
  //       existing.RemarksList = [
  //         ...existing.RemarksList, // Existing remarks
  //         ...remarksList, // New remarks from current item
  //       ];
  //     } else {
  //       tempObject[key] = {
  //         ...item,
  //         TestName: checkboxHTML,
  //         TestDetails: [testDetails],
  //         TestID: `${item.TestID},`,
  //         LabRemarkCount: item.LabRemarkCount || 0,
  //         RemarksList: remarksList,
  //       };
  //     }
  //   }

  //   for (const key in tempObject) {
  //     const entry = tempObject[key];
  //     entry.TestID = entry.TestID.slice(0, -1);
  //     modifiedArray.push(entry);
  //   }
  //   // return modifiedArray?.sort((a, b)=>b.IsVip - a.IsVip)

  //   return modifiedArray;
  // }

  // new 

  const modifyArray = (data) => {
    const seen = {};

    return data.map((item) => {
      const key = item.VisitNo + "_" + item.LedgerTransactionID;

      if (!seen[key]) {
        seen[key] = true;

        return {
          ...item,
          isFirstRow: true, // ✅ first row
          TestDetails: [
            {
              TestName: item.TestName,
              Status: item.Status,
              TestID: item.TestID,
              LedgerTransactionID: item.LedgerTransactionID,
              TestIdhash: item.TestIdhash,
            },
          ],
        };
      }

      return {
        ...item,
        isFirstRow: false, // ❌ duplicate row
        TestDetails: [
          {
            TestName: item.TestName,
            Status: item.Status,
            TestID: item.TestID,
            LedgerTransactionID: item.LedgerTransactionID,
            TestIdhash: item.TestIdhash,
          },
        ],
      };
    });
  };

  const setArrangeMentOfData = (data, subData) => {
    let mainData = [];
    subData.map((ele, index) => {
      data.map((eleInner, indexInner) => {
        if (ele?.TestID === eleInner?.TestID) {
          eleInner.Printwithhead = eleInner.Printwithhead
            ? eleInner.Printwithhead
            : 0;
          mainData = [...mainData, eleInner];
        }
      });
    });
    setResultData(mainData);
  };

  const GetResultEntry = (
    payload,
    index,
    loading,
    sampleStatusAtAction = "",
  ) => {
    setCopyPayload(payload);
    loading && loading(true);
    setSelectedRowIndex(index);
    axiosInstance
      .post("RE/GetResultEntryData", {
        ...payload,
        // TestID:"14",
        // sampleStatus: sampleStatusAtAction || payload?.sampStatus,
        MacID:
          payload?.MacID != ""
            ? payload?.MacID
            : (machine[0]?.value?.toString() ?? ""),
      })
      .then((res) => {
        const data = res?.data?.message?.message;

        if (!Array.isArray(res?.data?.message) && data.length > 0) {
          // Prepare final val[]
          const val = data.map((ele) => ({
            ...ele,
            isChecked: true,
            RerunIscheck: false,
            SaveRangeStatus: 0,
            currentIndex: index,
            Mobile: payload?.Mobile,
            MinValue: ele?.MinValue == null ? "0" : ele?.MinValue,
            MaxValue: ele?.MaxValue == null ? "0" : ele?.MaxValue,
            index: payload?.index,
            HelpMenuBold: Number(ele?.HelpMenuBold),
            PEmail: payload?.PEmail,
            MachineId: payload?.MacID ?? "",
            MacID: payload?.MacID ?? "",
            COMMENT: ele?.COMMENT ? ele?.COMMENT : "",
            ApprovedBy: payload?.ApprovedBy ?? "0",
            LedgertransactionIDHash: payload?.LedgertransactionIDHash,
            TotalAgeInDays: ele?.TotalAgeInDays,
            VisitNo: payload?.VisitNo,
            isOutSource: payload?.isOutSource,


            // ✔ FIX: Keep exact backend value
            OriginalValue: ele?.Value ?? "",
            Value: ele?.Value == "0" ? "" : ele?.Value,
          }));

          // Prepare TestHeader
          const dataTestHeader = res?.data?.message?.testHeader;
          let isPreviousResult = false;

          const valTestHeader = dataTestHeader?.map((ele) => {
            if (ele?.OldValueDate) isPreviousResult = true;

            return {
              ...ele,
              isChecked: true,
              isDocumentUpload: 0,
              currentIndex: index,
              TestCenterId: val[0]?.TestCentreID,
              Mobile: payload?.Mobile,
              LedgertransactionIDHash: payload?.LedgertransactionIDHash,
              isOutSource: payload?.isOutSource,
              PEmail: payload?.PEmail,
              index: payload?.index,
              MachineId: payload?.MacID ?? "",
              MacID: payload?.MacID ?? "",
              labObservationID: ele?.InvestigationID,
              Printwithhead: ele?.Printwithhead || 0,
              ApprovedBy: payload?.ApprovedBy ?? "0",
              VisitNo: payload?.VisitNo,
              ShowDLC: ele?.IsDLCCheck,
            };
          });

          setIsPreviousResultAvailable(isPreviousResult);
          setArrangeMentOfData(val, valTestHeader);
          setResultTestData(valTestHeader);
          loading && loading(false);

          // Run formulas AFTER data load
          if (val && val.length > 0) {
            console.log("skhwioerwefhkjefhkjsehkfj", "Rame");
            let hasChanged = false;
            const uniqueTestIds = [...new Set(val.map((item) => item.TestID))];
            uniqueTestIds.forEach((testid) => {
              if (ApplyFormula(testid)) hasChanged = true;
            });
            if (hasChanged) setResultData([...ResultData]);
          }
        } else {
          const currentRecord = redata[index];

          if (currentRecord?.Status === "1")
            toast.error("Sample not collected yet");
          else if (currentRecord?.Status === "2")
            toast.error("Department not received yet");
          else if (currentRecord?.Status === "4")
            toast.error("Sample rejected. Please recollect sample");
          else toast.error(t("No Data Found"));

          loading && loading(false);
        }
      })
      .catch((err) => {
        toast.error(
          err?.response?.data?.message
            ? err?.response?.data?.message
            : t("No Record Found"),
        );
        loading && loading(false);
      });
  };

  console.log("ResultData::", ResultData);

  const callGetResultEntryByTest = (testData, index = 0) => {
    GetResultEntry(
      {
        TestID: testData?.toString(),
        LedgerTransactionID: "",
        DepartmentID: "",
        symbol: "",
        Mobile: copyPayload?.Mobile ?? "",
        VisitNo: copyPayload?.VisitNo ?? "",
        PEmail: copyPayload?.PEmail ?? "",
        MacID: machine[0]?.value ?? "",
        LedgertransactionIDHash: copyPayload?.LedgertransactionIDHash ?? "",
        isOutSource: copyPayload?.isOutSource ?? "",
        index: index,
        ApprovedBy:
          doctorAdmin?.length === 1 ? doctorAdmin[0]?.value?.toString() : "0",
      },
      index,
    );
  };

  useEffect(() => {
    if (ResultData?.length > 0) {
      let hasChanged = false;
      const uniqueTestIds = [...new Set(ResultData.map((item) => item.TestID))];
      uniqueTestIds.forEach((testid) => {
        if (ApplyFormula(testid)) hasChanged = true;
      });
      if (hasChanged) setResultData([...ResultData]);
    }
  }, [ResultData]);

  const handleIndex = (e, index) => {
    const { name } = e.target;
    switch (name) {
      case "Value":
        switch (e.which) {
          case 38:
            if (indexMatch !== 0) {
              setIndexMatch(indexMatch - 1);
            } else {
              setIndexMatch(helpmenu.length - 1);
            }
            break;
          case 40:
            if (helpmenu.length - 1 === indexMatch) {
              setIndexMatch(0);
            } else {
              setIndexMatch(indexMatch + 1);
            }
            break;
          case 13:
            if (HiddenDropDownHelpMenu) {
              handleListSearch(helpmenu[indexMatch], name, index);
              setIndexMatch(0);
            }
            break;
          default:
            break;
        }
        break;
      case "TestName":
        switch (e.which) {
          case 38:
            if (TestSuggestion.length > 0) {
              if (indexMatch !== 0) {
                setIndexMatch(indexMatch - 1);
              } else {
                setIndexMatch(TestSuggestion.length - 1);
              }
              setTimeout(() => {
                const el = document.querySelector(".matchIndex");
                if (el) el.scrollIntoView({ block: "nearest" });
              }, 0);
            }
            break;
          case 40:
            if (TestSuggestion.length > 0) {
              if (TestSuggestion.length - 1 === indexMatch) {
                setIndexMatch(0);
              } else {
                setIndexMatch(indexMatch + 1);
              }
              setTimeout(() => {
                const el = document.querySelector(".matchIndex");
                if (el) el.scrollIntoView({ block: "nearest" });
              }, 0);
            }
            break;
          case 13:
            if (TestSuggestion.length > 0 && TestSuggestion[indexMatch]) {
              handleListSearchNew(TestSuggestion[indexMatch], name);
            }
            setIndexMatch(-1);
            break;
          default:
            break;
        }
        break;

      case "DoctorName":
        switch (e.which) {
          case 38:
            if (doctorSuggestion.length > 0) {
              if (indexMatch !== 0) {
                setIndexMatch(indexMatch - 1);
              } else {
                setIndexMatch(doctorSuggestion.length - 1);
              }
              setTimeout(() => {
                const el = document.querySelector(".matchIndex");
                if (el) el.scrollIntoView({ block: "nearest" });
              }, 0);
            }
            break;
          case 40: // Down
            if (doctorSuggestion.length > 0) {
              if (doctorSuggestion.length - 1 === indexMatch) {
                setIndexMatch(0);
              } else {
                setIndexMatch(indexMatch + 1);
              }
              setTimeout(() => {
                const el = document.querySelector(".matchIndex");
                if (el) el.scrollIntoView({ block: "nearest" });
              }, 0);
            }
            break;
          case 13:
            if (doctorSuggestion.length > 0 && doctorSuggestion[indexMatch]) {
              handleListSearchNew(doctorSuggestion[indexMatch], name);
            }
            setIndexMatch(-1);
            break;
          default:
            break;
        }
        break;

      default:
        break;
    }
  };

  // console.log(HiddenDropDownHelpMenu, helpmenu);
  const handleListSearch = (data, name, index) => {
    // console.log(data);
    const val = [...ResultData];
    val[index][name] = data?.label;
    val[index].HelpMenuBold = Number(data?.HelpMenuBold);
    setResultData(val);
    setHelpMenu([]);
    setHiddenDropDownHelpMenu(false);
  };

  const getUnFilledValue = (arr1, arr2) => {
    const uniqueV = [...new Set(arr1.map((item) => item.InvestigationID))];
    const filteredV = uniqueV.filter((InvestigationID) => {
      const values = arr2
        .filter((item) => item.InvestigationID === InvestigationID)
        .map((item) => ({ Value: item.Value, Comment: item.COMMENT }));

      return values.some(
        ({ Value, Comment }) => Value !== "" || Comment !== "",
      );
    });

    const newArr1 = arr1.filter((item) =>
      filteredV.includes(item.InvestigationID),
    );

    const newArr2 = arr2.filter((item) =>
      filteredV.includes(item.InvestigationID),
    );

    return { newArr1, newArr2 };
  };
  const handleSplitData = (id, symbol) => {
    const data = id?.split(symbol);
    return data;
  };

  const handleKeyDown = (e) => {
    if (e?.key === "Enter") {
      TableData("");
    }
  };

  const handleApproveReport = (Url, headerData) => {
    axiosInstance
      .post("RE/SendReport", {
        LedgerTransactionNo: headerData[0]?.LedgerTransactionNo,
        PatientName: headerData[0]?.PatientName,
        MobileNo: headerData[0]?.Mobile,
        LedgerTransactionID: headerData[0]?.LedgerTransactionID,
        PEmail: headerData[0]?.PEmail,
        URL: Url,
        LedgertransactionIDHash: headerData[0]?.LedgertransactionIDHash,
      })
      .then((res) => console.log(res?.data?.message))
      .catch((err) => {
        // toast.error(
        //   err?.response?.data?.message
        //     ? err?.response?.data?.message
        //     : "Something Went Wrong"
        // );
      });
  };

  const handleReport = (key, headerData) => {
    const data = ResultTestData.filter((ele) => ele?.isChecked === true);
    let TestIDHash = data.map((ele) => {
      return ele?.TestIDHash;
    });

    // setPrintReportLoading(true);
    axiosReport
      .post(`commonReports/GetLabReport`, {
        TestIDHash: TestIDHash,
        PHead: 0,
        PrintColour: "0",
        IsDownload: CheckDevice(),
      })
      .then((res) => {
        if (res?.data?.success) {
          if (key == "Yes") {
            handleApproveReport(res?.data?.url, headerData);
            // setPrintReportLoading(false);
          } else {
            window.open(res?.data?.url, "_blank");
            // setPrintReportLoading(false);
          }
        } else {
          // setPrintReportLoading(false);
          key == "no" && toast.error(res?.data?.message);
        }
      })
      .catch((err) => {
        toast.error(
          err?.response?.data?.message
            ? err?.response?.data?.message
            : err?.data?.message,
        );
        // setPrintReportLoading(false);
      });
  };

  const getButtondata = () => {
    axiosInstance
      .get("RE/EmployeeAccessDetails")
      .then((res) => {
        setButtonsData(res.data.message);
        console.log("res.data.message", res.data.message);
      })
      .catch((err) => {
        toast.error(
          err?.response?.data?.message
            ? err?.response?.data?.message
            : t("Something Went Wrong"),
        );
      });
  };

  const handleInnerChecked = (e, newIndex, index) => {
    const { name, checked } = e.target;
    const val = [...redata];
    val[index]["TestDetail"][newIndex][name] = checked;
    SetReData(val);
  };
  const getGradientClass = () => {
    let condition = localStorage.getItem("Theme");
    switch (condition) {
      case "Default":
        return "gradient-lightblue";
      case "light Green":
        return "gradient-lightgreen";
      case "Peach":
        return "gradient-peach";
      case "Pale Pink":
        return "gradient-pink";
      case "Red":
        return "gradient-red";
      case "SkyBlue":
        return "gradient-skyblue";
      case "Grey":
        return "gradient-grey";
      default:
        return "";
    }
  };

  const handleTime = (time, name) => {
    setFormData((prev) => ({ ...prev, [name]: time }));
  };
  const BindApprovalDoctor = () => {
    setLoading(true);
    axiosInstance
      .get("CommonController/BindApprovalDoctor")
      .then((res) => {
        // console.log(res)
        setLoading(false);

        let data = res.data.message;
        let doctorData = data.map((ele) => {
          return {
            value: ele?.employeeid,
            label: ele?.name,
          };
        });
        setDoctorAdmin(doctorData);
        if (id) {
          GetResultEntry(
            {
              TestID: id?.TestID,
              LedgerTransactionID: "",
              DepartmentID: "",
              symbol: "",
              Mobile: id?.Mobile,
              VisitNo: id?.VisitNo,
              PEmail: id?.PEmail,
              MacID: id?.MacID,
              LedgertransactionIDHash: id?.LedgertransactionIDHash,
              isOutSource: id?.isOutSource,
              index: id?.index,
              ApprovedBy: id?.ApprovedBy,
            },
            id?.index,
            setLoading,
          );
        }
      })
      .catch((err) => {
        setLoading(false);
        console.log(err);
      });
  };

  const handleSelectChange1 = (name, event) => {
    setFormData({ ...formData, [name]: event?.value });
    event?.value != -1 && TableData(event?.value);
  };

  const handleApifromModal = () => {
    setshowApprove({ ...approve, show: false });
    axiosInstance
      .post("RE/SaveResultEntry", modalpayload)
      .then((res) => {
        setLoading(false);
        handleReport("Yes", modalpayload?.HeaderInfo);
        const testidhash = ResultTestData.map((obj) => obj.TestID);
        // console.log(modalpayload);
        if (OnAppGoToMainList == 0) {
          GetResultEntry(
            {
              TestID: testidhash.join(","),
              LedgerTransactionID: "",
              DepartmentID: "",
              symbol: "",
              Mobile: ResultData[0]?.Mobile,
              VisitNo: ResultData[0]?.VisitNo,
              PEmail: ResultData[0]?.PEmail,
              MacID: ResultData[0]?.MacID,
              LedgertransactionIDHash: ResultData[0]?.LedgertransactionIDHash,
              isOutSource: ResultData[0]?.isOutSource,
              index: ResultData[0]?.index,
              ApprovedBy: ResultData[0]?.ApprovedBy,

            },
            ResultData[0]?.index,
            setLoading,
          );
        } else {
          setResultTestData([]);
          setResultData([]);
        }
        toast.success(res?.data?.message);
        // setDlcCheckChecked(true);
      })
      .catch((err) => {
        if (err.response.status === 504) {
          toast.error(t("Something Went Wrong"));
        }
        toast.error(err.response.data.message);
        setLoading(false);
        // setResultData([]);
      });
  };

  useEffect(() => {
    getAccessCentres();
    getDepartment();
    BindApprovalDoctor();
    getPaymentModes("Identity", setIdentity);
    getButtondata();
    getWardNo();
    controllerDynamic();
  }, []);

  /////////////pro employeeee///////////////
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
    getProEmployee();
  }, []);

  const fetchRateTypes = async (id) => {
    try {
      const res = await axiosInstance.post("Centre/GetRateType", {
        CentreId: id,
      });
      const list = res?.data?.message.map((item) => ({
        label: item?.RateTypeName,
        value: item?.RateTypeID,
      }));
      setRateTypes(list);
    } catch (err) {
      console.log(err);
    }
  };

  const fetchTransferCentres = async (id) => {
    try {
      const res = await axiosInstance.get(
        "CommonController/BindTestCentreList",
      );
      const data = res.data;
      const list = data?.message.map((item) => ({
        label: item?.Centre,
        value: item?.CentreID,
      }));
      setTransferCentres(list);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    fetchTransferCentres();
  }, []);

  const handleUploadCount = (name, value, secondName) => {
    let data = [...redata];
    if (name === "UploadDocumentCount") {
      data[show6?.index][name] = value;
      data[show6?.index][secondName] = value === 0 ? 0 : 1;
      SetReData(data);
    } else {
      data[show4?.index][name] = value;
      data[show4?.index][secondName] = value === 0 ? 0 : 1;
      SetReData(data);
    }
  };

  const handleReactSelectChange = (name, option) => {
    setCollectionBoy(option?.value);
  };

  const prop = () => {
    // const uniqueTestIDs = new Set();
    // redata.forEach((item) => {
    //   const testIDs = item.TestID.split(",").map((id) => id.trim());
    //   testIDs.forEach((id) => uniqueTestIDs.add(id));
    // });
    return redata.length ?? 0;
  };

  const closeAModal = () => {
    setshowApprove({ ...approve, show: false });
  };

  const statusCount = (key) => {
    console.log("key", key);
    if (key == "") {
      return [...originalTableData]?.length;
    }
    if (key == "26") {
      return [...originalTableData]?.filter(
        (item) =>
          Number(item?.Status) === 10 && Number(item?.IsPartialResult) === 1,
      )?.length;
    }
    return [...originalTableData]?.filter((item) => item?.Status == key)
      ?.length;
  };

  const filterStatusWise = (sampStatus) => {
    setFormData({ ...formData, ["SampleStatus"]: sampStatus });
    TableData(sampStatus);
  };

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

  const controllerDynamic = async () => {
    try {
      let pageID = 1020;
      const { controllersData, controllerTabbingOrder } =
        await getSearchController(pageID);

      setTabbingOrder(controllerTabbingOrder);
      setControllerDynamicList(controllersData);
    } catch (error) {
      console.error("error in controllerDynamic:", error);
    }
  };

  const handleChangeSearch = (e) => {
    const value = e.target.value.toLowerCase();
    setSearchTerm(value);

    if (!value.trim()) {
      const final = modifyArray(originalTableData);
      const withIndex = final.map((ele, index) => ({
        ...ele,
        index: index,
        currentIndex: index,
      }));
      SetReData(withIndex);
      return;
    }

    const searchableKeys = ["PatientName", "VisitNo", "Mobile", "PatientCode"];

    const filtered = originalTableData?.filter((row) =>
      searchableKeys.some((key) =>
        String(row[key] || "")
          .toLowerCase()
          .includes(value),
      ),
    );

    const final = modifyArray(filtered);

    const withIndex = final.map((ele, index) => ({
      ...ele,
      index: index,
      currentIndex: index,
    }));

    SetReData(withIndex);
  };

  useEffect(() => {
    setIndexMatch(0);
  }, [formData?.DoctorName, formData?.TestName, formData?.Package]);

  useEffect(() => {
    if (window.innerWidth >= 768) return;
    if (sampleStatusRef.current) {
      setSampleStatusHeight(sampleStatusRef.current.offsetHeight);
    }
    const HEADER_HEIGHT = 57;
    const scrollEl = document.getElementById("root") || window;
    const handleScroll = () => {
      if (!sampleSentinelRef.current) return;
      const top = sampleSentinelRef.current.getBoundingClientRect().top;
      setIsSampleStatusFixed(top <= HEADER_HEIGHT);
    };
    scrollEl.addEventListener("scroll", handleScroll);
    return () => scrollEl.removeEventListener("scroll", handleScroll);
  }, []);

  console.log("controller", controllerDynamicList);

  return (
    <>
      {approve?.show && (
        <Dialog
          header={""}
          onHide={closeAModal}
          visible={approve?.show}
          className={theme}
        >
          <div className="box-success">
            <div className="row">
              <label className="col-sm-12" htmlFor="PreBooking ID">
                <span>{approve?.msg}</span>
              </label>
            </div>
            <div className="row">
              <div className="col-sm-2">
                <button
                  type="button"
                  className="btn btn-sm btn-block btn-success"
                  onClick={handleApifromModal}
                >
                  Yes
                </button>
              </div>
              <div className="col-sm-2">
                <button
                  type="button"
                  className="btn btn-sm btn-block btn-danger"
                  onClick={() => {
                    setshowApprove({ ...approve, show: false });
                  }}
                >
                  No
                </button>
              </div>
            </div>
          </div>
        </Dialog>
      )}

      {ResultData.length === 0 ? (
        <>
          {show4?.modal && (
            <MedicialModal
              show={show4.modal}
              handleClose={() => {
                setShow4({
                  modal: false,
                  data: "",
                  index: -1,
                });
              }}
              MedicalId={show4?.data}
              ID={show4.ID}
              handleUploadCount={handleUploadCount}
            />
          )}

          {show6?.modal && (
            <UploadFile
              show={show6?.modal}
              handleClose={() => {
                setShow6({ modal: false, data: "", index: -1 });
              }}
              options={Identity}
              documentId={show6?.data}
              pageName="Patient Registration"
              handleUploadCount={handleUploadCount}
              formData={formData}
            />
          )}
          {showAdvanceFilter.show && (
            <RSadvanceFilter
              show={showAdvanceFilter.show}
              handleShow={() => {
                setShowAdvanceFilter({ show: false, data: "" });
                setFormData((data) => ({
                  ...data,
                  parameterId: [],
                  valueCheck: "=",
                  valueToSearch: "",
                  valueRangeFrom: "",
                  valueRangeTo: "",
                  moreFilter: 0,
                }));
              }}
              handleFilterChange={handleChange}
              data={formData}
              handleAdvSearch={() => {
                setFormData((data) => ({
                  ...data,
                  moreFilter: 1,
                }));
                TableData(
                  document.getElementById("SampleStatus")?.value ??
                  formData?.SampleStatus,
                );
              }}
            />
          )}
          {/* <Heading isBreadcrumb={true} name="Result Entry" /> */}
          <Accordion
            name={
              <div className="d-flex">
                <span className="mt-1"> {t("Histo Worksheet Details")} </span>
                {/* <span className="header ml-1" style={{ cursor: "pointer" }}>
                    <ReceiptReprintFilter
                      columnConfig={dynamicFilter}
                      setColumnConfig={setDynamicFilter}
                      PageName="ResultEntryFilter"
                    />
                  </span> */}
              </div>
            }
            defaultValue={true}
            isBreadcrumb={true}
          >
            <>
              <div className="row  px-2 pt-2">
                {/* {controllerDynamicList
                  ?.filter((item) => item?.TypeId === 1 && item?.IsShow === 1)
                  ?.map((item, index) => {
                    if (
                      item?.ControlDisplayID === "SelectTypes" &&
                      isHideController("SelectTypes")
                    ) {
                      return ( */}
                <div className="col-12 col-sm-6 col-md-2 my-1" >
                  <div className="d-flex" style={{ display: "flex" }}>
                    <div style={{ width: "40%" }}>
                      <SelectBox
                        options={[
                          ...SearchBy,
                          ...(shouldIncludeAIIMSID()
                            ? [{ label: "AIIMSID", value: "AIIMSID" }]
                            : []),
                        ]}
                        id="SelectTypes"
                        lable="SelectTypes"
                        selectedValue={formData.SelectTypes}
                        name="SelectTypes"
                        onChange={handleSelectChange}
                      />
                    </div>
                    {ShowAllCheckBarcodeOption == 1 &&
                      formData.SelectTypes === "BarcodeNo" && (
                        <Tooltip
                          position="bottom"
                          label={t("ShowAllCheckBarcodeOption")}
                        >
                          <Form.Check
                            type="checkbox"
                            label=""
                            id="ShowAllCheckBarcodeOption"
                            checked={!!checkBarcodeOption}
                            onChange={handleToggleChange}
                            className="cursor-pointer"
                          />
                        </Tooltip>
                      )}
                    <div
                      className="flex-grow-1"
                      style={{ width: "50%" }}
                    >
                      {formData?.SelectTypes === "Mobile" ? (
                        <Input
                          type="number"
                          name="ItemValue"
                          max={10}
                          onKeyDown={handleKeyDown}
                          value={formData.ItemValue}
                          onChange={handleChange}
                          onInput={(e) => number(e, 10)}
                        />
                      ) : (
                        <Input
                          type="text"
                          name="ItemValue"
                          onKeyDown={handleKeyDown}
                          max={20}
                          value={formData.ItemValue}
                          onChange={handleChange}
                        />
                      )}
                      {errors?.ItemValue && (
                        <div className="error-message">
                          {errors?.ItemValue}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                {/* );
                    }

                    if (
                      item?.ControlDisplayID === "CentreID" &&
                      isHideController("CentreID")
                    ) {
                      return ( */}
                <div className="col-12 col-sm-6 col-md-2 my-1" >
                  <ReactSelect
                    dynamicOptions={AddBlankData(
                      CentreData,
                      "All Centre",
                    )}
                    name="CentreID"
                    lable={t("Centre")}
                    id="Centre"
                    removeIsClearable={true}
                    placeholderName={t("Centre")}
                    value={formData?.CentreID}
                    onChange={handleSearchSelectChange}
                  />
                </div>
                {/* );
                    }

                    if (
                      item?.ControlDisplayID === "TestCentre" &&
                      isHideController("TestCentre")
                    ) {
                      return ( */}
                <div className="col-12 col-sm-6 col-md-2 my-1">
                  <ReactSelect
                    dynamicOptions={[
                      { label: "All", value: "0" },
                      ...transferCentres,
                    ]}
                    name="testCentreID"
                    lable={t("Test Centre")}
                    id="testCentreID"
                    removeIsClearable={true}
                    placeholderName={t("Test Centre")}
                    value={formData?.testCentreID}
                    onChange={handleSearchSelectChange}
                  />
                </div>
                {/* );
                    }

                    if (
                      item?.ControlDisplayID === "RateTypeID" &&
                      isHideController("RateTypeID")
                    ) {
                      return ( */}
                <div className="col-12 col-sm-6 col-md-2 my-1" >
                  <ReactSelect
                    dynamicOptions={[
                      { label: "All RateType", value: "" },
                      ...RateTypes,
                    ]}
                    name="RateTypeID"
                    lable={t("RateType")}
                    id="RateType"
                    removeIsClearable={true}
                    placeholderName={t("RateType")}
                    value={formData?.RateTypeID}
                    onChange={handleSearchSelectChange}
                  />
                </div>
                {/* );
                    }

                    if (
                      item?.ControlDisplayID === "DepartmentID" &&
                      isHideController("DepartmentID")
                    ) {
                      return ( */}
                <div className="col-12 col-sm-6 col-md-2 my-1" >
                  <ReactSelect
                    dynamicOptions={AddBlankData(
                      DepartmentData,
                      "All Department",
                    )}
                    name="DepartmentID"
                    lable={t("Department")}
                    id="Department"
                    removeIsClearable={true}
                    placeholderName={t("Department")}
                    value={formData?.DepartmentID}
                    onChange={handleSearchSelectChange}
                  />
                </div>
                {/* );
                    }

                    if (
                      item?.ControlDisplayID === "DoctorName" &&
                      isHideController("DoctorName")
                    ) {
                      return ( */}
                <div className="col-12 col-sm-6 col-md-2 my-1" >
                  <Input
                    type="text"
                    lable="Refer Doctor"
                    id="DoctorName"
                    name="DoctorName"
                    value={formData.DoctorName}
                    onChange={handleChange}
                    placeholder=" "
                    onKeyDown={(e) => handleIndex(e, "DoctorName")}
                    onBlur={(e) => {
                      autocompleteOnBlur(setDoctorSuggestion);
                    }}
                  />
                  {dropFalse &&
                    doctorSuggestion.length > 0 &&
                    formData.DoctorName && (
                      <ul className="suggestion-data">
                        {doctorSuggestion.map((data, idx) => (
                          <li
                            onClick={() =>
                              handleListSearchNew(data, "DoctorName")
                            }
                            className={`${idx === indexMatch && "matchIndex"}`}
                            key={idx}
                          >
                            {data?.Name}
                          </li>
                        ))}
                      </ul>
                    )}
                </div>
                {/* );
                    }
                    if (
                      item?.ControlDisplayID === "Package" &&
                      isHideController("Package")
                    ) {
                      return ( */}
                <div className="col-12 col-sm-6 col-md-2 my-1">
                  <Input
                    type="text"
                    name="Package"
                    lable="Package"
                    id="Package"
                    value={formData?.Package}
                    onKeyDown={(e) => handleIndexNew(e, "Package")}
                    placeholder=" "
                    onChange={handleChange}
                    onBlur={(e) => {
                      autocompleteOnBlur(setPackageSuggestions);
                      // setTimeout(() => {
                      //   const match = packageSuggestions.some(
                      //     (ele) =>
                      //       (ele?.TestName || "").toLowerCase() ===
                      //       (e.target.value || "").toLowerCase()
                      //   );
                      //   if (!match) {
                      //     setFormData((prev) => ({ ...prev, Package: "" }));
                      //   }
                      // }, 200);
                    }}
                  />
                  {selectpackage &&
                    packageSuggestions.length > 0 &&
                    formData.Package && (
                      <ul className="suggestion-data">
                        {packageSuggestions.map((data, index) => (
                          <li
                            onClick={() =>
                              handleListSearchNew(data, "Package")
                            }
                            className={`${index === indexMatch && "matchIndex"}`}
                            key={index}
                          >
                            {data?.TestName}
                          </li>
                        ))}
                      </ul>
                    )}
                </div>
                {/* );
                    }
                    if (
                      item?.ControlDisplayID === "OutSourceStatus" &&
                      isHideController("OutSourceStatus")
                    ) {
                      return ( */}
                <div className="col-12 col-sm-6 col-md-2 my-1">
                  <SelectBox
                    lable={t("OutSourceStatus")}
                    options={[
                      { label: t("Pending"), value: "1" },
                      { label: t("Sent"), value: "2" },
                      { label: t("Sent or Pending"), value: "3" },
                      { label: t("N/A"), value: "-1" },
                    ]}
                    selectedValue={formData?.OutSourceStatus}
                    name="OutSourceStatus"
                    onChange={handleSelectChange}
                  />
                </div>
                {/* );
                    }
                    if (
                      item?.ControlDisplayID === "TestName" &&
                      isHideController("TestName")
                    ) {
                      return ( */}
                <div className="col-12 col-sm-6 col-md-2 my-1" >
                  <Input
                    autocomplete="off"
                    type="text"
                    name="TestName"
                    lable="Search By Test Name"
                    id="TestName"
                    value={formData.TestName}
                    placeholder=" "
                    onChange={handleChange}
                    onKeyDown={(e) => handleIndex(e, "TestName")}
                    onBlur={(e) => {
                      autocompleteOnBlur(setTestSuggestion);
                    }}
                  />
                  {selects &&
                    TestSuggestion.length > 0 &&
                    formData.TestName && (
                      <ul className="suggestion-data">
                        {TestSuggestion.map((data, idx) => (
                          <li
                            onClick={() =>
                              handleListSearchNew(data, "TestName")
                            }
                            className={`${idx === indexMatch && "matchIndex"}`}
                            key={idx}
                          >
                            {data.TestName}
                          </li>
                        ))}
                      </ul>
                    )}
                </div>
                {/* );
                    }

                    if (
                      item?.ControlDisplayID === "DateTypeSearch" &&
                      isHideController("DateTypeSearch")
                    ) {
                      return ( */}
                <div className="col-12 col-sm-6 col-md-2 my-1" >
                  <SelectBox
                    lable="DateTypeSearch"
                    options={DateTypeSearch2}
                    selectedValue={formData?.DateTypeSearch}
                    name="DateTypeSearch"
                    onChange={handleSelectChange}
                  />
                </div>
                {/* );
                    }

                    if (
                      item?.ControlDisplayID === "FromDate" &&
                      isHideController("FromDate")
                    ) {
                      return ( */}
                <div className="col-12 col-sm-6 col-md-2 my-1" >
                  <DatePicker
                    className="custom-calendar"
                    name="FromDate"
                    value={formData?.FromDate}
                    onChange={dateSelect}
                    placeholder=" "
                    id="FromDate"
                    lable="FromDate"
                    // maxDate={new Date(formData?.ToDate)}
                    maxDate={new Date()}
                  />
                </div>
                {/* );
                    }

                    if (
                      item?.ControlDisplayID === "FromTime" &&
                      isHideController("FromTime")
                    ) {
                      return ( */}
                <div className="col-12 col-sm-6 col-md-2 my-1" >
                  <CustomTimePicker
                    name="FromTime"
                    placeholder="FromTime"
                    value={formData?.FromTime}
                    id="FromTime"
                    lable="FromTime"
                    onChange={handleTime}
                  />
                </div>
                {/* );
                    }

                    if (
                      item?.ControlDisplayID === "ToDate" &&
                      isHideController("ToDate")
                    ) {
                      return ( */}
                <div className="col-12 col-sm-6 col-md-2 my-1" >
                  <DatePicker
                    className="custom-calendar"
                    name="ToDate"
                    value={formData?.ToDate}
                    onChange={dateSelect}
                    placeholder=" "
                    id="ToDate"
                    lable="ToDate"
                    minDate={new Date(formData?.FromDate)}
                    // maxDate={new Date()}
                    maxDate={getMaxToDate(formData?.FromDate, maxRange)}
                  />
                </div>
                {/* );
                    }

                    if (
                      item?.ControlDisplayID === "ToTime" &&
                      isHideController("ToTime")
                    ) {
                      return ( */}
                <div className="col-12 col-sm-6 col-md-2 my-1" >
                  <CustomTimePicker
                    name="ToTime"
                    placeholder="ToTime"
                    value={formData?.ToTime}
                    id="ToTime"
                    lable="ToTime"
                    onChange={handleTime}
                  />
                </div>
                {/* );
                    }

                    if (
                      item?.ControlDisplayID === "SampleStatus" &&
                      isHideController("SampleStatus")
                    ) {
                      return ( */}
                <div className="col-12 col-sm-6 col-md-2 my-1" >
                  <MultiBackGroundReactSelect
                    placeholderName={t("Sample Status")}
                    dynamicOptions={SampleStatus}
                    value={formData.SampleStatus}
                    onChange={handleSelectChange1}
                    name="SampleStatus"
                    id="SampleStatus"
                    bgColor={true}
                  />
                </div>
                {/* );
                    }

                    if (
                      item?.ControlDisplayID === "MachineID" &&
                      isHideController("MachineID")
                    ) {
                      return ( */}
                <div className="col-12 col-sm-6 col-md-2 my-1" >
                  <ReactSelect
                    dynamicOptions={machineId ?? []}
                    name="MachineID"
                    lable={t("MachineID")}
                    id="MachineID"
                    removeIsClearable={true}
                    placeholderName={t("MachineID")}
                    value={formData?.MachineID}
                    onChange={handleSearchSelectChange}
                  />
                </div>
                {/* );
                    }
                    if (
                      item?.ControlDisplayID === "ProEmployee" &&
                      isHideController("ProEmployee")
                    ) {
                      return ( */}
                <div className="col-12 col-sm-6 col-md-2 my-1">
                  <ReactSelect
                    dynamicOptions={[
                      { label: "Select", value: "" },
                      ...proEmployee,
                    ]}
                    name={"ProEmployee"}
                    id={"ProEmployee"}
                    label="ProEmployee"
                    value={state?.ProEmployee}
                    onChange={handleProEmployeeChange}
                    placeholderName={"ProEmployee"}
                    respclass={""}
                  />
                </div>
                {/* );
                    }

                    if (
                      item?.ControlDisplayID === "collectionBoy" &&
                      isHideController("collectionBoy")
                    ) {
                      return ( */}
                <div className="col-12 col-sm-6 col-md-2 my-1">
                  <ReactSelect
                    name="collectionBoy"
                    dynamicOptions={[
                      { label: t("Select Collection Boy"), value: "" },
                      ...collectionBoyList,
                    ]}
                    placeholderName={t("Collection Boy")}
                    // isDisabled={true}
                    value={collectionBoy}
                    onChange={handleReactSelectChange}
                  />
                </div>
                {/* );
                    }

                    if (
                      item?.ControlDisplayID === "IsTat" &&
                      isHideController("IsTat")
                    ) {
                      return ( */}
                <div className="col-12 col-sm-6 col-md-2 my-1" >
                  {/* <SelectBox
                            // options={[
                            //   { label: "TAT Report - All", value: 0 },
                            //   { label: "In TAT", value: 1 },
                            //   { label: "Out TAT", value: 2 },
                            // ]}
                            options={[
                              { label: t("All"), value: 0 },
                              { label: t("Within TAT"), value: 1 },
                              { label: t("Outside TAT"), value: 2 },
                              { label: t("Near TAT"), value: 3 },
                            ]}
                            selectedValue={formData?.IsTat}
                            lable="IsTat"
                            id="IsTat"
                            name="IsTat"
                            onChange={handleSelectChange}
                          /> */}
                  <CustomSelectBox
                    options={[
                      { label: "All", value: 0 },
                      {
                        label: "Within TAT",
                        value: 1,
                        style: { backgroundColor: "green", color: "white" },
                      },
                      {
                        label: "Near TAT",
                        value: 2,
                        style: { backgroundColor: "yellow" },
                      },
                      {
                        label: "Outside TAT",
                        value: 3,
                        style: { backgroundColor: "red", color: "white" },
                      },
                    ]}
                    selectedValue={formData?.IsTat}
                    label="IsTat"
                    id="IsTat"
                    name="IsTat"
                    onChange={handleSelectChange}
                  />
                </div>
                {/* );
                    }

                    if (
                      item?.ControlDisplayID === "Flag" &&
                      isHideController("Flag")
                    ) {
                      return ( */}
                <div className="col-12 col-sm-6 col-md-2 my-1" >
                  <SelectBox
                    options={[
                      { label: "Select Flag", value: "" },
                      ...Flag,
                    ]}
                    name="Flag"
                    lable="Flag"
                    id="Flag"
                    onChange={handleSelectChange}
                    selectedValue={formData?.Flag}
                  />
                </div>
                {/* );
                    }

                    if (
                      item?.ControlDisplayID === "Order" &&
                      isHideController("Order")
                    ) {
                      return ( */}
                <div className="col-12 col-sm-6 col-md-2 my-1" >
                  <SelectBox
                    options={[
                      { label: "Select Order", value: "" },
                      ...Order,
                    ]}
                    name="Order"
                    lable="Order"
                    id="Order"
                    onChange={handleSelectChange}
                    selectedValue={formData?.Order}
                  />
                </div>
                {/* );
                    }

                    if (
                      item?.ControlDisplayID === "IsUrgent" &&
                      isHideController("IsUrgent")
                    ) {
                      return ( */}
                <div className="col-12 col-sm-auto my-1 d-flex flex-wrap align-items-center" style={{ gap: "8px" }}>
                  <Form.Check
                    type="switch"
                    id="IsUrgent"
                    name="IsUrgent"
                    label={t("IsUrgent")}
                    checked={formData?.IsUrgent}
                    onChange={handleSelectChange}
                    className="m-0"
                  />
                  <Form.Check
                    type="switch"
                    id="IsVip"
                    name="IsVip"
                    label={t("IsVip")}
                    checked={formData?.IsVip}
                    onChange={handleSelectChange}
                    className="m-0"
                  />
                  <CustomButton
                    className="rounded-10"
                    text="Search"
                    icon="Search"
                    onClick={() =>
                      TableData(
                        document.getElementById("SampleStatus")
                          ?.value ?? formData?.SampleStatus,
                      )
                    }
                  />
                  <CustomButton
                    text="Get Report"
                    onClick={() => handleGetReport(selectedIDs)}
                    icon="pdf"
                  />
                </div>
              </div>

            </>
          </Accordion>
          {/* Sentinel: tracks natural scroll position of sample status on mobile */}
          <div ref={sampleSentinelRef} style={{ height: 0 }} />

          {/* Spaceholder: prevents layout jump when sample status becomes fixed on mobile */}
          {isSampleStatusFixed && (
            <div style={{ height: sampleStatusHeight, marginTop: "8px", marginBottom: "16px" }} />
          )}

          <div
            ref={sampleStatusRef}
            className="mt-2 mb-3 px-2 py-1 bg-white d-flex sampleStatusClass"
            style={isSampleStatusFixed ? {
              position: "fixed",
              top: "57px",
              left: 0,
              right: 0,
              zIndex: 98,
              marginTop: 0,
              marginBottom: 0,
              boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
            } : {}}
          >
            <strong style={{ minWidth: "100px" }}>Sample Status : </strong>

            {SampleStatus
              ?.filter((sItem) => !["5", "6"].includes(sItem?.value))
              .map((sItem, idx) => (
                <TableFilterDot
                  key={idx}
                  color={`${getStatusColor(sItem?.value)}`}
                  title={`${sItem?.label} (${statusCount(sItem?.value)})`}
                  onClick={() => filterStatusWise(sItem?.value)}
                  bgColor="#e9e2e1"
                />
              ))}
          </div>
          <Accordion
            title={t("Search Result")}
            // title={
            //   <>
            //     {redata?.length === 0 ? (
            //       t("Search Result")
            //     ) : (
            //       <div className="d-flex">
            //         <span className="mt-1">
            //           {t("Click Icon To Filter Results")}
            //         </span>
            //         {/* <span className="header ml-1" style={{ cursor: "pointer" }}>
            //           <ReceiptReprintFilter
            //             columnConfig={columnConfig}
            //             setColumnConfig={setColumnConfig}
            //             PageName="ResultEntry"
            //           />
            //         </span> */}
            //       </div>
            //     )}
            //   </>
            // }
            seconTitle={
              <div className="d-flex align-items-center justify-content-end w-100 px-2 mt-1" style={{ gap: "12px" }}>

                {/* SEARCH BOX */}
                <Input
                  type="text"
                  name="search"
                  id="search"
                  placeholder="Search Details..."
                  value={searchTerm}
                  onChange={handleChangeSearch}
                />
              </div>
            }
            linkTitle={
              <div style={{ gap: "4px" }} className="d-flex align-items-center">
                {[...SampleStatus]?.map((item, idx) => {
                  return (
                    <div style={{ backgroundColor: `Status-1` }}>
                      {item?.label}
                    </div>
                  );
                })}
              </div>
            }
            notOpen={true}
            defaultValue={true}
          >
            {loading ? (
              <div style={isSampleStatusFixed ? { paddingTop: `${sampleStatusHeight}px` } : {}}>
                <Loading />
              </div>
            ) : load ? (
              <div className="">
                <>
                  {/* Added status */}
                  <HistoWorkSheetTable
                    TableData={TableData}
                    Status={formData?.SampleStatus}
                    redata={redata}
                    GetResultEntry={GetResultEntry}
                    show={setShow4}
                    show2={setShow6}
                    handleInnerChecked={handleInnerChecked}
                    columnConfig={columnConfig}
                    selectedRowIndex={selectedRowIndex}
                    setSelectedRowIndex={setSelectedRowIndex}
                    doctorAdmin={doctorAdmin}
                    machine={machine}
                    setReturnFromResultTableWithStatus={
                      setReturnFromResultTableWithStatus
                    }
                    filterData={controllerDynamicList}
                    onGetSelectedIDs={handleGetSelectedIDs}
                  // CreateCheckbox={CreateCheckbox}
                  />
                </>
              </div>
            ) : (
              <div className="" style={isSampleStatusFixed ? { paddingTop: `${sampleStatusHeight}px` } : {}}>
                <NoRecordFound />
              </div>
            )}{" "}
          </Accordion>
        </>
      ) : (
        null
      )}
    </>
  );
};

export default HistoWorksheet;
