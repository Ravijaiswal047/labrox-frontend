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
  DyanmicStatusResponseCulture,
  Time,
  autocompleteOnBlur,
  dateConfig,
  getTrimmedData,
  number,
  onlyNumbers,
  shouldIncludeAIIMSID,
} from "../../utils/helpers";
import {
  parseMappedSignature,
  resolveApprovalDoctor,
  stampApprovedBy,
  withMappedDoctorOption,
} from "../../utils/dutyRosterApprovalDoctor";
import { axiosInstance, axiosReport } from "../../utils/axiosInstance";
import {
  DepartmentWiseItemList,
  getCollectionBoy,
  getDoctorSuggestion,
  getPaymentModes,
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
// import RETable from "../Table/ResultEntryTable";
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
import RETable from "../Table/CombineResultEntryTable";

import CryptoJS from "crypto-js";
import ReactSelect from "../../components/formComponent/ReactSelect";
import MultiBackGroundReactSelect from "./MultiBackGroundReactSelect";
import { useDispatch } from "react-redux";
import { Button, Form } from "react-bootstrap";
import TableFilterDot from "../../components/TableFilter/TableFilterDot";
import "./ResultEntry.css";
import ResultAllergyVisit from "./ResultAllergyVisit";
import useArrowNavigation from "../Laboratory/CombineResultEntryAssets/useArrowNavigation"
import ResultCultureVisit from "./ResultCultureVisit";

const ResultEntry = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { ShowAllCheckBarcodeOption, ShowDefaultLoginCentre } = useLocalStorage("userData", "get");
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

  const [returnFromResultTableWithStatus, setReturnFromResultTableWithStatus] = useState(null);

  const [testCount, setTestCount] = useState(0);
  const [columnConfig, setColumnConfig] = useState([]);
  const [approve, setshowApprove] = useState({
    msg: "",
    show: false,
  });

  const [PreviousTestResult, setPreviousTestResult] = useState([]);
  const [headerTestResult, setHeaderTestResult] = useState([]);
  // const [show2, setShow2] = useState({
  //   moadal: false,
  //   data: {},
  // });
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
    ID: 0
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
  const [statusBuckets, setStatusBuckets] = useState(null);
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

  const today = new Date();
  const { DefaultDateTypeResultEntry } = useLocalStorage("userData", "get");
  let isTrueCheckBarcodeOption =
    ShowAllCheckBarcodeOption == 1 && defaultSearchTypes == "BarcodeNo";
  const [checkBarcodeOption, setCheckBarcodeOption] = useState(
    isTrueCheckBarcodeOption
  );

  //RE States 
  const [bindAllergyType, setBindAllergyType] = useState([]);
  const [mandatoryIDs, setMandatoryIDs] = useState([]);
  const [investigationId, setInvestigationID] = useState(0);
  const [entry, setEntry] = useState([]);
  const [entryShow, setEntryShow] = useState(false);
  const [ReportType, setReportType] = useState("1");
  const [show2, setShow2] = useState({
    moadal: false,
    data: {},
  });
  const [isRA, setIsRA] = useState("");



  // const [show3, setShow3] = useState({
  //     modal: false,
  //     data: {},
  //   });

  const validateData = (field, payload, message, headerData) => {
    if (payload?.length > 0) {
      if (
        [
          "Save",
          "Hold",
          "Unhold",
          "Not Approved",
          "Dual Authentication",
        ].includes(field)
      ) {
        fetchApi(field, payload, headerData);
      } else {
        let showMessage = t("All Required fields are mandatory");
        let flag = 1;
        let DlcSum = 0;
        let dlc = false;
        // console.log(headerData);
        for (var i = 0; i < payload.length > 0; i++) {
          // if (payload[i].dlcCheck == "1" && DlcCheckChecked) {
          //   dlc = true;
          //   DlcSum =
          //     parseFloat(DlcSum) +
          //     parseFloat(payload[i].Value === "" ? 0 : payload[i].Value);
          // }
          if (payload[i].ReportType === "1") {
            if (payload[i].isMandatory === 1 && payload[i].Value == "") {
              flag = 0;
            }
            if (payload[i].AMRMin > 0 || payload[i].AMRMax > 0) {
              if (
                payload[i].Value > payload[i].AMRMax ||
                payload[i].Value < payload[i].AMRMin
              ) {
                toast.error(
                  payload[i].TestName +
                  " value is greater or less than" +
                  payload[i].AMRMin +
                  " or " +
                  payload[i].AMRMax
                );
                return;
              }
            }
          }
          if (["2", "3"].includes(payload[i].ReportType)) {
            if (
              payload[i].isMandatory === 1 &&
              (payload[i].COMMENT == "" || payload[i].COMMENT == null)
            ) {
              flag = 0;
            }
          }
        }
        for (let i = 0; i < headerData.length; i++) {
          if (headerData[i]["ApprovedBy"] == "0" && !parseMappedSignature(headerData[i]["DefaultSignatureID"]).id) {
            flag = 0;
            showMessage = t("Kindly Select Doctor");
            break;
          }
        }
        for (let i = 0; i < headerData.length; i++) {
          if (
            headerData[i]["DualAuthentication"] == 1 &&
            headerData[i]["DualAuthenticatedcount"] != 2
          ) {
            flag = 0;
            showMessage = `Can't Be Approved. For ${headerData[i]?.PackageName} Dual Authentication Is Required`;
            break;
          }
        }

        if (flag == 1) {
          fetchApi(field, payload, headerData);
        } else {
          toast.error(showMessage);
        }
      }
    } else {
      toast.error(message);
    }
  };

  const validateDataRA = (field, payload, message, headerData) => {
    console.log("field, payload, message, headerData", field, payload, message, headerData);
    console.log(payload, "3");
    if (payload?.length > 0) {
      if (
        [
          "Save",
          "Hold",
          "Unhold",
          "Not Approved",
          "Dual Authentication",
        ].includes(field)
      ) {
        fetchApiRA(field, payload, headerData);
      } else {
        if (checkDual(headerData)) {
          toast.error(checkDual(headerData));
        } else if (
          !entryPayload?.ApprovedBy &&
          !parseMappedSignature(ResultData?.[0]?.DefaultSignatureID).id
        ) {
          toast.error("Kindly Select Doctor");
        } else {
          fetchApiRA(field, payload, headerData);
        }
      }
    } else {
      toast.error(message);
    }
  };

  const REPORT_TYPE_CONFIG = {
    1: {
      validateFn: validateData,
      checkedKey: "isChecked",
      checkedValue: true,
      statuses: [3, 10, 14, 13, 20],
      hasOmit: true,
      errorToast: () =>
        `This Test is ${DyanmicStatusResponse(ResultTestData)}`
    },
    2: {
      validateFn: validateData,
      checkedKey: "isChecked",
      checkedValue: true,
      statuses: [3, 10, 14, 13, 20],
      hasOmit: true,
      errorToast: () =>
        `This Test is ${DyanmicStatusResponse(ResultTestData)}`
    },
    22: {
      validateFn: validateDataRA,
      checkedKey: "IsChecked",
      checkedValue: 1,
      statuses: [3, 10, 5, 6, 20],
      hasOmit: false,
      errorToast: () =>
        `This Test is ${DyanmicStatusResponseCulture(ResultTestData)}`
    }
  };
  const [configState, setConfigState] = useState(REPORT_TYPE_CONFIG[1]);

  useEffect(() => {
    setConfigState(
      REPORT_TYPE_CONFIG[ReportType] ?? REPORT_TYPE_CONFIG[1]
    );
  }, [ReportType]);

  const {
    validateFn,
    checkedKey,
    checkedValue,
    statuses,
    hasOmit,
    errorToast
  } = configState;

  console.log("validateFn", validateFn);
  console.log("configState", configState);

  const [entryPayload, setEntryPayload] = useState({
    organism: "",
    IncubationDate: new Date(),
    IncubationTime: "00:00:00",
    ApprovedBy: "",
    ApprovalName: "",
  });


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
  });

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

  const location = useLocation();
  const { SkipTestCentreResultEntry } = useLocalStorage("userData", 'get');
  const searchParams = new URLSearchParams(location.search);
  const decryptData = (encryptedData) => {
    const secretKey = "resultentry";
    const bytes = CryptoJS.AES.decrypt(
      decodeURIComponent(encryptedData),
      secretKey
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
  useEffect(() => {
    ResultEntryFilter();
    getCollectionBoy(setCollectionBoyList, true);
  }, []);

  const handleToggleChange = (e) => {
    const { checked } = e.target;
    setCheckBarcodeOption(checked);
  };

  const isVisible = (header) =>
    dynamicFilter.find((f) => f?.header === header)?.visible;

  const id = searchParams.get("id")
    ? decryptData(searchParams.get("id"))
    : null;

  const EmployeeID = useLocalStorage("userData", "get")?.EmployeeID;
  const OnAppGoToMainList = useLocalStorage(
    "userData",
    "get"
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
            : "Error Occurxxx"
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
        "Investigation"
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
        "Package"
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

  const handleKeyUpRA = (e, targetElem) => {
    if (e.key === "Enter" && targetElem) {
      targetElem.focus();
    }
  };

  const handleToggle = (name) => {
    setToggleDate({ ...toggleDate, [name]: !toggleDate[name] });
  };

  const dateSelect = (value, name) => {
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
            ele.TestName?.toLowerCase().includes(value.toLowerCase())
          )
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
            ele.Name?.toLowerCase().includes(value.toLowerCase())
          )
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
            ele.TestName?.toLowerCase().includes(value.toLowerCase())
          )
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
          setFormData((prev) => ({ ...prev, CentreID: DefaultCentre }))
          fetchRateTypes([DefaultCentre]);
        }
        else {
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
        "RE/CombineResultEntry",
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
        })
      )
      .then((res) => {
        setSelectedRowIndex(-1);
        // Bucket totals come from the server, measured over this search with no
        // status filter applied. Keep whatever arrives, including on an empty
        // result, so the chips describe the search rather than the last bucket
        // that was clicked.
        setStatusBuckets(
          res?.data?.data?.StatusBuckets ||
            res?.data?.Data?.StatusBuckets ||
            null,
        );
        if (Array.isArray(res?.data?.message)) {
          setTestCount(res?.data?.message?.length);
          const final = modifyArray(res?.data?.message);
          console.log('final>>>', final)
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
    "get"
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
  //     0: (item) => `${ item.LedgerTransactionID }`,
  //     1: (item) => `${ item.LedgerTransactionID }-${ item.DepartmentID }`,
  //     2: (item) => `${ item.LedgerTransactionID }-${ item.DepartmentID }-${ item.SinNo }`,
  //     3: (item) => `${ item.LedgerTransactionID }-${ item.SinNo }`,
  //     4: (item) => `${ item.TestID }`,
  //   };

  //   const getKey = keyMap[IsPatientWiseReporting] || (() => "");
  //   for (const item of dataArray) {
  //     const key = getKey(item);
  //     const checkboxHTML = `<p class="round Status-${ item.Status }">${ createCheckbox(item) }${ item.TestName }</p>`;
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
  //       existing.TestID += `${ item.TestID },`;
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
  //         TestID: `${ item.TestID },`,
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

  function modifyArray(dataArray) {
    const modifiedArray = [];
    const tempObject = {};

    const patientWiseKeyMap = {
      0: (item) => `${item.LedgerTransactionID}`,
      1: (item) => `${item.LedgerTransactionID}-${item.DepartmentID}`,
      2: (item) =>
        `${item.LedgerTransactionID}-${item.DepartmentID}-${item.SinNo}`,
      3: (item) => `${item.LedgerTransactionID}-${item.SinNo}`,
      4: (item) => `${item.TestID}`,
    };

    const getPatientWiseKey =
      patientWiseKeyMap[IsPatientWiseReporting] ||
      ((item) => `${item.TestID}`);

    for (const item of dataArray) {
      // 👉 DECISION POINT
      const key =
        item.ReportType === "1" || item.ReportType === "2"
          ? getPatientWiseKey(item) // existing logic
          : `${item.TestID}`; // force TestID grouping

      console.log("getPatientWiseKey", key, item.ReportType);

      const checkboxHTML = `<p class="round Status-${item.Status}">
      ${createCheckbox(item)}${item.TestName}
    </p>`;

      const remarksList = item.RemarksList
        ? JSON.parse(item.RemarksList)
        : [];

      const testDetails = {
        TestName: item.TestName,
        Status: item.Status,
        TestID: item.TestID,
        LedgerTransactionID: item.LedgerTransactionID,
        TestIdhash: item.TestIdhash,
      };

      if (tempObject[key]) {
        const existing = tempObject[key];
        existing.TestName += checkboxHTML;
        existing.TestDetails.push(testDetails);
        existing.TestID += `${item.TestID},`;
        existing.LabRemarkCount += item.LabRemarkCount || 0;
        existing.RemarksList = [...existing.RemarksList, ...remarksList];
      } else {
        tempObject[key] = {
          ...item,
          TestName: checkboxHTML,
          TestDetails: [testDetails],
          TestID: `${item.TestID},`,
          LabRemarkCount: item.LabRemarkCount || 0,
          RemarksList: remarksList,
        };
      }
    }

    for (const key in tempObject) {
      const entry = tempObject[key];
      entry.TestID = entry.TestID.slice(0, -1);
      modifiedArray.push(entry);
    }

    return modifiedArray;
  }


  // function modifyArray(dataArray) {
  //     return dataArray.map((visit) => {
  //         const pliList = visit.PLI_LIST ? JSON.parse(visit.PLI_LIST) : [];
  //         const remarksList = visit.RemarksList
  //             ? JSON.parse(visit.RemarksList)
  //             : [];

  //         const testDetails = [];
  //         let testNameHTML = "";
  //         let testIDs = "";

  //         pliList.forEach((test) => {
  //             // row-level HTML (legacy usage)
  //             testNameHTML += `<p class="round Status-${test.Status}">
  //     ${test.TestName}
  //   </p>`;

  //             testIDs += `${test.TestID},`;

  //             // what your JSX REALLY uses
  //             testDetails.push({
  //                 TestName: test.TestName, // plain text
  //                 Status: test.Status,
  //                 TestID: test.TestID,
  //                 LedgerTransactionID: visit.LedgerTransactionID,
  //                 TestIdhash: test.TestIdhash,
  //             });
  //         });

  //         console.log("pliList", pliList);

  //         const firstTest = pliList[0] || {};

  //         return {
  //             // =====================
  //             // VISIT LEVEL (as before)
  //             // =====================
  //             ...visit,

  //             // =====================
  //             // ROW LEVEL (expected by UI)
  //             // =====================
  //             TestName: testNameHTML,
  //             TestID: testIDs.replace(/,$/, ""),
  //             TestDetails: testDetails,
  //             RemarksList: remarksList,
  //             LabRemarkCount: 0,

  //             // =====================
  //             // IMPORTANT FALLBACKS
  //             // =====================
  //             Status: firstTest.Status,
  //             DepartmentID: firstTest.DepartmentID,
  //             SinNo: firstTest.SinNo,
  //             IsSampleCollected: firstTest.IsSampleCollected,
  //             SampleReceiveDate: firstTest.SampleReceiveDate,
  //             SampleDate: firstTest.SampleDate,
  //             SampleCollectionDate: firstTest.SampleCollectionDate,
  //             StatSample: firstTest.StatSample,
  //             isUrgent: firstTest.IsUrgent,
  //             isOutSource: firstTest.IsOutSource,
  //         };
  //     });
  // }

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

  const GetResultEntry = (payload, index, loading, sampleStatusAtAction = "") => {
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
            ApprovedBy: resolveApprovalDoctor({
              defaultSignatureID: ele?.DefaultSignatureID,
              currentApprovedBy: payload?.ApprovedBy,
              doctorAdmin,
            }).approvedBy,
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
              ApprovedBy: resolveApprovalDoctor({
                defaultSignatureID: ele?.DefaultSignatureID || val[0]?.DefaultSignatureID,
                currentApprovedBy: payload?.ApprovedBy,
                doctorAdmin,
              }).approvedBy,
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
            console.log('skhwioerwefhkjefhkjsehkfj', 'Rame');
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
            : t("No Record Found")
        );
        loading && loading(false);
      });
  };

  // Get ResultData for RE Allergy 

  const getOrganimseName = (data, val, ReportNumber) => {
    setEntryShow(true);
    let id = data.split(",").map(Number);
    console.log(val);
    const sourceArray =
      ReportType === "22"
        ? bindAllergyType
        : ReportType === "21"
          ? bindOrganism
          : [];

    let filteredId = sourceArray?.filter((item) =>
      id.includes(item.value)
    );

    // let filteredId = bindAllergyType.filter((item) => id.includes(item.value));

    console.log(filteredId);
    filteredId.forEach((entry) => {
      getEntryData(
        entry.value,
        entry.label,
        val?.TestID,
        val?.BarcodeNo,
        ReportNumber,
        false
      );
    });
  };

  const getEntryData = (id, name, Testid, BarcodeNo, ReportNumber, key) => {
    console.log({ id, name, Testid, BarcodeNo, ReportNumber });
    if (id) {
      const isPresent = entry?.some((innerArray) =>
        innerArray?.some((obj) => obj?.obid == id)
      );

      if (!isPresent || !key) {
        axiosInstance
          .post("ResultentryAllergy/BindDrugAntibiotic", {
            ObsId: id?.toString(),
            ObsName: name,
            TestId:
              Testid?.toString() ?? reData[ResultData[0]?.currentIndex]?.TestID,
            BarcodeNo:
              BarcodeNo ?? reData[ResultData[0]?.currentIndex]?.BarcodeNo,
            ReportNumber: ReportNumber ?? entryPayload?.ReportNumber,
          })
          .then((res) => {
            let data = res.data.message;
            if (res?.data?.success) {
              data = data.map((item, index) => {
                return {
                  ...item,
                  index: index,
                  AntibioticInterpreatation: item?.AntibioticInterpreatation,
                  isInput: false,
                };
              });
              setEntry((prevData) => [...prevData, data]);
            } else {
              toast?.error(data ? data : "No Record Found");
            }
          })
          .catch((err) =>
            toast.error(err?.response?.data?.message ?? "Something Went Wrong")
          );
      } else {
        toast.error("Entry already added");
      }
    }
  };

  const GetResultEntryCulture = (payload, index, loading, ReportNumber) => {
    if (loading) {
      loading(true);
    }
    setEntry([]);
    axiosInstance
      .post("ResultentryAllergy/AllergyObservationSearch", {
        ...payload,
        ReportNumber: ReportNumber,
      })
      .then((res) => {
        const data = res?.data?.message?.message;
        setInvestigationID(res?.data?.message?.message[0]?.InvestigationID || 0);
        const val = data?.map((ele) => {
          return {
            ...ele,
            currentIndex: index,
            IsChecked: 1,
            SaveRangeStatus: 0,
          };
        });
        if (val && val.length > 1) {
          const lastElementCopy = { ...val[0] };
          lastElementCopy.LabObservationName = "Comments";
          lastElementCopy.TestName = "Comments";
          lastElementCopy.COMMENT = val[0]?.TestComment ?? "";
          lastElementCopy.InvestigationID = "";
          lastElementCopy.labObservationID = val[0]?.InvestigationID;
          lastElementCopy.Value = "";
          val.push(lastElementCopy);
        }
        const dataTestHeader = res?.data?.message?.testHeader;
        const valTestHeader = dataTestHeader?.map((ele) => {
          return {
            ...ele,
            IsChecked: 1,
            outSource: 1,
            isDocumentUpload: 0,
            TestCenterId: val[0]?.TestCentreID,
          };
        });
        console.log({ val });
        val[0]?.OrgId != "" &&
          getOrganimseName(val[0]?.OrgId, payload, ReportNumber);
        setResultTestData(valTestHeader);
        setArrangeMentOfData(val, valTestHeader);
        if (loading) {
          loading(false);
        }
        console.log({ ResultTestData });
        val[0]?.OrgId == "" && setEntryShow(false);
        console.log(val[0]);

        setEntryPayload({
          ...entryPayload,
          ...(() => {
            const rosterDoctor = resolveApprovalDoctor({
              defaultSignatureID: val[0]?.DefaultSignatureID,
              currentApprovedBy: "",
              doctorAdmin,
              emptyValue: "",
            });
            return {
              ApprovedBy: rosterDoctor.approvedBy,
              ApprovalName: rosterDoctor.approvalName,
              IsDutyRosterLocked: rosterDoctor.locked,
            };
          })(),
          organism: "",
          IncubationDate: new Date(val[0]?.IncubationDate),
          IncubationTime: val[0]?.IncubationTime,
        });


      })
      .catch((err) => {
        if (loading) {
          loading(false);
        }
        toast.error(
          err?.response?.data?.message
            ? err?.response?.data?.message
            : "Error Occured"
        );
        setEntryShow(false);
        setEntry([]);
      });
  };

  // RE Function 

  // RC Function

  const GetResultEntryCulture2 = (payload, index, loading, ReportNumber) => {

    console.log("payload", payload);
    if (loading) {
      loading(true);
    }
    setEntry([]);
    axiosInstance
      .post("RECulture/LabObservationSearch", {
        ...payload,
        ReportNumber: ReportNumber,
      })
      .then((res) => {
        const data = res?.data?.message?.message;
        const val = data?.map((ele) => {
          return {
            ...ele,
            currentIndex: index,
            IsChecked: 1,
            SaveRangeStatus: 0,
          };
        });
        if (val && val.length > 1) {
          const lastElementCopy = { ...val[0] };
          lastElementCopy.LabObservationName = "Comments";
          lastElementCopy.TestName = "Comments";
          lastElementCopy.COMMENT = val[0]?.TestComment ?? "";
          lastElementCopy.InvestigationID = "";
          lastElementCopy.labObservationID = val[0]?.InvestigationID;
          lastElementCopy.Value = "";
          val.push(lastElementCopy);
        }
        const dataTestHeader = res?.data?.message?.testHeader;
        const valTestHeader = dataTestHeader?.map((ele) => {
          return {
            ...ele,
            IsChecked: 1,
            outSource: 1,
            isDocumentUpload: 0,
            TestCenterId: val[0]?.TestCentreID,
          };
        });
        val[0]?.OrgId != "" &&
          getOrganimseName(val[0]?.OrgId, payload, ReportNumber);
        setResultTestData(valTestHeader);
        setArrangeMentOfData(val, valTestHeader);
        if (loading) {
          loading(false);
        }
        val[0]?.OrgId == "" && setEntryShow(false);
        // console.log(val[0]);
        setEntryPayload({
          ...entryPayload,
          ...(() => {
            const rosterDoctor = resolveApprovalDoctor({
              defaultSignatureID: val[0]?.DefaultSignatureID,
              currentApprovedBy: "",
              doctorAdmin,
              emptyValue: "",
            });
            return {
              ApprovedBy: rosterDoctor.approvedBy,
              ApprovalName: rosterDoctor.approvalName,
              IsDutyRosterLocked: rosterDoctor.locked,
            };
          })(),
          ReportNumber: ReportNumber,
          organism: "",
          IncubationDate: new Date(val[0]?.IncubationDate),
          IncubationTime: val[0]?.IncubationTime,
        });
      })
      .catch((err) => {
        toast.error(
          err?.response?.data?.message
            ? err?.response?.data?.message
            : "Error Occured"
        );
        if (loading) {
          loading(false);
        }
        setEntryShow(false);
        setEntry([]);
      });
  };

  const checkDual = (headerData) => {
    console.log(headerData);
    for (let i = 0; i < headerData.length; i++) {
      if (
        headerData[i]["DualAuthentication"] == 1 &&
        headerData[i]["DualAuthenticatedcount"] != 2
      ) {
        return `Can't Be Approved. For ${headerData[i]?.PackageName} Dual Authentication Is Required`;
      }
    }
    return false;
  };

  const getAllergyData = () => {
    console.log("ResultData", ResultData);
    if (investigationId === 0) {
      return;
    }
    const payload = {
      investigationId: investigationId || 0,
    }
    console.log("payload", payload);
    axiosInstance
      .post("ResultentryAllergy/GetAllAllergyInvestigationID", payload)
      .then((res) => {
        const data = res?.data?.message;
        const val = data.map((ele) => {
          return {
            value: ele?.ID,
            label: ele?.Name,
            mandatory: ele?.IsMandatory,
          };
        });
        setBindAllergyType(val);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  console.log('ResultData::', ResultData);

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
          doctorAdmin?.length === 1
            ? doctorAdmin[0]?.value?.toString()
            : "0",
      },
      index
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

  const handleDoctorName = (e) => {
    if (
      resolveApprovalDoctor({
        defaultSignatureID: ResultTestData[0]?.DefaultSignatureID,
        currentApprovedBy: ResultTestData[0]?.ApprovedBy,
        doctorAdmin,
      }).locked
    ) {
      return;
    }
    const { name, value } = e.target;
    const data = ResultTestData?.map((ele) => {
      return {
        ...ele,
        [name]: value,
      };
    });

    setResultTestData(data);
  };

  const handleDoctorNameRA = (e) => {
    if (entryPayload?.IsDutyRosterLocked) return;
    const { name, value, selectedIndex } = e.target;
    const label = e?.target?.children[selectedIndex].text;
    setEntryPayload({
      ...entryPayload,
      [name]: value,
      ApprovalName: label,
    });
  };

  // const ApplyFormula = (testid) => {
  //   if (!Array.isArray(ResultData) || ResultData.length === 0) return;

  //   // ✔ FIX: filter only rows of SAME PACKAGE
  //   const packageRows = ResultData.filter((r) => r.TestID === testid);

  //   const tgOverrideActive = packageRows.some(
  //     (r) => Number(r?.IsTG) === 1 && parseFloat(r?.Value || 0) > 400
  //   );

  //   for (let i = 0; i < packageRows.length; i++) {
  //     const test = packageRows[i];
  //     let Formula = test.Formula;

  //     if (Formula && test.TestID === testid) {
  //       if (
  //         (Number(test?.IsLDL) === 1 || Number(test?.IsVLDL) === 1) &&
  //         tgOverrideActive
  //       ) {
  //         continue;
  //       }

  //       // ✔ FIX: only loop inside SAME PACKAGE rows
  //       for (let j = 0; j < packageRows.length; j++) {
  //         const obs = packageRows[j];
  //         let aa = parseFloat(obs.Value);
  //         if (isNaN(aa)) aa = 0;

  //         try {
  //           const idRegex = new RegExp(`\\b${ obs.labObservationID }&`, "g");
  //           Formula = Formula.replace(idRegex, aa);

  //           if (Formula.includes("Age&")) {
  //             const ageYears = Math.round((obs.TotalAgeInDays || 0) / 365);
  //             Formula = Formula.replace(/Age&/g, ageYears);
  //           }
  //           if (Formula.includes("Gender&")) {
  //             const gender = obs.Gender ? `"${ obs.Gender }"` : '""';
  //             Formula = Formula.replace(/Gender&/g, gender);
  //           }
  //         } catch (err) {
  //           console.error("Replacement error:", err);
  //         }
  //       }

  //       try {
  //         const raw = eval(Formula);
  //         const vv =
  //           isFinite(raw) && !isNaN(raw) ? Math.round(raw * 100) / 100 : NaN;

  //         const computedValue = isNaN(vv) ? "" : vv.toString();
  //         if (
  //           (test?.OriginalValue === "" ||
  //             test?.OriginalValue === null ||
  //             test?.OriginalValue === undefined) &&
  //           parseFloat(computedValue) === 0
  //         ) {
  //           test.Value = "";
  //         } else {
  //           test.Value = computedValue;
  //         }
  //       } catch (err) {
  //         console.error("Formula eval error:", err);
  //         test.Value = "";
  //       }

  //       const val = parseFloat(test.Value);
  //       const min = parseFloat(test.MinValue);
  //       const max = parseFloat(test.MaxValue);

  //       if (!isNaN(val) && (isFinite(min) || isFinite(max))) {
  //         if (val < min) test.Flag = "Low";
  //         else if (val > max) test.Flag = "High";
  //         else test.Flag = "Normal";
  //       } else {
  //         test.Flag = "";
  //       }

  //       // SAME LOGIC
  //       if (!isFinite(val) || isNaN(val) || val === "") {
  //         test.Value = "";
  //         test.Flag = "";
  //       }
  //     }
  //   }
  // };

  const ApplyFormula = (testid) => {
    let changed = false;
    console.log('skhwioerwefhkjefhkjsehkfj::testid::', testid);
    if (!Array.isArray(ResultData) || ResultData.length === 0) return changed;

    const packageRows = ResultData.filter((r) => r.TestID === testid);

    const tgOverrideActive = packageRows.some(
      (r) => Number(r?.IsTG) === 1 && parseFloat(r?.Value || 0) > 400
    );

    for (let i = 0; i < packageRows.length; i++) {
      const test = packageRows[i];
      if (test.MacReading !== "") continue;
      let Formula = test.Formula;

      if (Formula && test.TestID === testid) {
        if (
          (Number(test?.IsLDL) === 1 || Number(test?.IsVLDL) === 1) &&
          tgOverrideActive
        ) {
          continue;
        }

        // Check if all dependent values exist
        let hasAllDependentValues = true;

        for (let j = 0; j < packageRows.length; j++) {
          const obs = packageRows[j];
          let aa = parseFloat(obs.Value);
          if (isNaN(aa)) aa = 0;

          try {
            const idRegex = new RegExp(`\\b${obs.labObservationID}&`, "g");

            // If formula contains this ID and value is empty, mark as incomplete
            if (Formula.includes(`${obs.labObservationID}&`) && (!obs.Value || obs.Value === "")) {
              hasAllDependentValues = false;
            }

            Formula = Formula.replace(idRegex, aa);

            if (Formula.includes("Age&")) {
              const ageYears = Math.round((obs.TotalAgeInDays || 0) / 365);
              Formula = Formula.replace(/Age&/g, ageYears);
            }
            if (Formula.includes("Gender&")) {
              const gender = obs.Gender ? `"${obs.Gender}"` : '""';
              Formula = Formula.replace(/Gender&/g, gender);
            }
          } catch (err) {
            console.error("Replacement error:", err);
          }
        }

        try {
          // Only calculate if all dependent values exist
          if (hasAllDependentValues) {
            const raw = new Function('return ' + Formula)();
            const vv = isFinite(raw) && !isNaN(raw) ? Math.round(raw * 100) / 100 : NaN;
            const computedValue = isNaN(vv) ? "" : vv.toString();

            // Always show computed value, including 0
            if (test.Value !== computedValue) {
              test.Value = computedValue;
              changed = true;
            }
          } else {
            // Clear value if dependent values are missing
            if (test.Value !== "") {
              test.Value = "";
              changed = true;
            }
          }
        } catch (err) {
          console.error("Formula eval error:", err);
          if (test.Value !== "") {
            test.Value = "";
            changed = true;
          }
        }

        const val = parseFloat(test.Value);
        const min = parseFloat(test.MinValue);
        const max = parseFloat(test.MaxValue);

        if (!isNaN(val) && (isFinite(min) || isFinite(max))) {
          let flag = "";
          if (val < min) flag = "Low";
          else if (val > max) flag = "High";
          else flag = "Normal";
          if (test.Flag !== flag) {
            test.Flag = flag;
            changed = true;
          }
        } else {
          if (test.Flag !== "") {
            test.Flag = "";
            changed = true;
          }
        }

        if (!isFinite(val) || isNaN(val) || val === "") {
          if (test.Value !== "") {
            test.Value = "";
            changed = true;
          }
          if (test.Flag !== "") {
            test.Flag = "";
            changed = true;
          }
        }
      }
    }
    return changed;
  };

  function isValidDecimal(value) {
    if (
      (value.match(/</g) || []).length + (value.match(/>/g) || []).length >
      1
    ) {
      return false;
    }
    const afterSign =
      value.includes("<") || value.includes(">")
        ? value.split(/[<>]/)[1]
        : value;

    const decimalRegex = /^\d*\.?\d*$/;
    return decimalRegex.test(afterSign);
  }

  const handleDLCValue = (e, index) => {
    const data = [...ResultData];
    const { value, name } = e.target;
    if (value === "") data[index][name] = "";
    else data[index][name] = onlyNumbers(value) ? value : data[index][name];

    setResultData(data);
  };

  // New function for handling value changes with formula recalculation
  const handleValueChange = (index, value, testID) => {
    setResultData(prev => {
      let updated = [...prev];

      // Update the changed value
      updated[index] = {
        ...updated[index],
        Value: value || ""
      };

      // Handle flag calculation for the changed value
      const modifiedValue = value.includes("<")
        ? parseFloat(value.split("<")[1]) - 0.1
        : value.includes(">")
          ? parseFloat(value.split(">")[1]) + 0.1
          : value;

      if (
        (parseFloat(updated[index]["MaxValue"]) != 0 &&
          parseFloat(updated[index]["MinValue"]) != 0) ||
        parseFloat(updated[index]["MaxValue"]) > 0 ||
        parseFloat(updated[index]["MinValue"]) > 0 ||
        parseFloat(updated[index]["MaxValue"]) < 0 ||
        parseFloat(updated[index]["MinValue"]) < 0
      ) {
        if (parseFloat(modifiedValue) > parseFloat(updated[index]["MaxValue"])) {
          updated[index]["Flag"] = "High";
        }
        if (parseFloat(modifiedValue) < parseFloat(updated[index]["MinValue"])) {
          updated[index]["Flag"] = "Low";
        }
        if (
          parseFloat(modifiedValue) >= parseFloat(updated[index]["MinValue"]) &&
          parseFloat(modifiedValue) <= parseFloat(updated[index]["MaxValue"])
        ) {
          updated[index]["Flag"] = "Normal";
        }
      }

      if (value === "") {
        updated[index]["Flag"] = "";
      }

      // Recalculate dependent formulas
      const changedObsId = updated[index].labObservationID;
      updated = recalculateDependencies(updated, changedObsId);

      // Update TG state if needed
      const addValidationForCBCManullyEnter = updated[index];
      setisTGGreaterThan400((prev) => ({
        ...prev,
        value: addValidationForCBCManullyEnter?.Value,
        isTG: true,
      }));
      updatedIsTGGreaterThan400();

      // Apply formula for the test
      ApplyFormula(testID);

      return updated;
    });
  };

  const recalculateDependencies = (rows, changedObservationId) => {
    const updated = [...rows];

    updated.forEach(row => {
      if (row.Formula && row.Formula.includes(`${changedObservationId}&`)) {
        row.Value = evaluateFormula(row.Formula, updated);
      }
    });

    return updated;
  };

  const evaluateFormula = (formula, rows) => {
    if (!formula) return "";

    let expression = formula;

    rows.forEach(r => {
      const value = parseFloat(r.Value);
      expression = expression.replaceAll(
        `${r.labObservationID}&`,
        isNaN(value) ? 0 : value
      );
    });

    try {
      const result = new Function('return ' + expression)();
      return isNaN(result) ? "" : Number(result.toFixed(2));
    } catch (err) {
      console.error("Formula error:", formula, err);
      return "";
    }
  };

  const handleCheckbox = (e, index, testid) => {
    const data = [...ResultData];
    const dataTestHeader = [...ResultTestData];
    const { value, checked, type, name } = e.target;

    // Only handle checkboxes and non-Value fields
    if (index >= 0 && name !== "Value") {
      if (type === "checkbox") {
        data[index][name] = checked;
      }
      if (name === "isOmit" || name === "IsCriticalCheck") {
        data[index][name] = checked ? 1 : 0;
      }
      setResultData(data);
    } else if (index < 0) {
      // Handle test header checkboxes
      const val = data.map((ele) => {
        if (testid === ele?.TestID) {
          return {
            ...ele,
            [name]: checked,
          };
        } else {
          return ele;
        }
      });

      const valTestHeader = dataTestHeader?.map((ele) => {
        if (testid === ele?.TestID) {
          return {
            ...ele,
            isChecked: checked,
          };
        } else {
          return ele;
        }
      });
      setResultTestData(valTestHeader);
      setResultData(val);
    }
  };

  const handleCheckboxRA = (e, index, testid) => {
    const data = [...ResultData];

    const dataTestHeader = [...ResultTestData];
    const { value, checked, type, name } = e.target;
    if (index >= 0) {
      if (name === "Value" || name === "ReadingFormat") {
        data[index][name] = value;
      }

      if (type === "checkbox") {
        data[index][name] = checked;
      }
      setResultData(data);
    } else {
      const val = data.map((ele) => {
        if (testid === ele?.TestID) {
          return {
            ...ele,
            [name]: checked,
          };
        } else {
          return ele;
        }
      });

      const valTestHeader = dataTestHeader?.map((ele) => {
        if (testid === ele?.TestID) {
          return {
            ...ele,
            IsChecked: checked ? 1 : 0,
          };
        } else {
          return ele;
        }
      });
      setResultTestData(valTestHeader);
      setResultData(val);
    }
  };

  const updatedIsTGGreaterThan400 = () => {
    const tgOverrideActive = ResultData.map((r) => {
      if (Number(r?.IsTG) === 1 && parseFloat(r?.Value || 0) > 400) {
        setisTGGreaterThan400((prev) => ({
          ...prev,
          value: r?.Value,
          isTG: r?.IsTG,
        }));
      }
    });
  };

  console.log("isTGGreaterThan400", isTGGreaterThan400);

  const getHelpMenuData = (e, labObservationId) => {
    if (e?.which !== 13) {
      setHiddenDropDownHelpMenu(true);
      axiosInstance
        .post("RE/getHelpMenuInvestigationWise", {
          InvestigationID: labObservationId,
        })
        .then((res) => {
          setHelpMenu(res.data?.message);
        })
        .catch((err) => {
          console.log(err);
        });
    }
  };

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
  const onChangeDLC = (e, index) => {
    const { checked } = e.target;
    const datas = [...ResultTestData];
    datas[index]["IsDLCCheck"] = checked ? 1 : 0;
    setResultTestData(datas);
  };
  const fetchApi = (field, payload, headerData) => {
    // console.log(field, headerData);
    console.log
    setLoading(true);
    const ModifiedHeaderData = headerData?.map((ele) => {
      return {
        ...ele,
        IsHold: ele?.IsHold ?? 0,
      };
    });
    const result = getUnFilledValue(ModifiedHeaderData, payload);
    const isOutSource = headerData[0]?.isOutSource == 1;
    const isSaveOrApproved =
      field === "Save" ||
      field === "Approved" ||
      field === "Dual Authentication";

    const result1 = isOutSource
      ? ModifiedHeaderData
      : isSaveOrApproved
        ? result?.newArr1
        : ModifiedHeaderData;
    const result2 = isOutSource
      ? payload
      : isSaveOrApproved
        ? result?.newArr2
        : payload;
    if (result1?.length > 0) {
      if (field == "Approved") {
        const details = {
          data: result2.map((ele) => {
            const obj = {
              ...ele,
              Value: ele?.Value?.toString(),
              ApprovedBy:
                stampApprovedBy(ele, doctorAdmin),
              CommentID: ele?.CommentID?.toString(),
              HelpMenuBold: ele?.HelpMenuBold ?? 0,
            };
            delete obj.IsNablInvestigation;
            return obj;
          }),
          ResultStatus: field,
          IsCritical: 0,
          HeaderInfo: result1?.map((item, _) => ({
            ...item,
            isNablInvestigation: result2?.[0]?.IsNablInvestigation,
            ApprovedBy:
              stampApprovedBy(item, doctorAdmin),
          })),
        };

        setmodalPayload({ ...details, IsCritical: 1 });
        axiosInstance
          .post("RE/SaveResultEntry", {
            data: result2.map((ele) => {
              const obj = {
                ...ele,
                Value: ele?.Value?.toString(),
                ApprovedBy:
                  stampApprovedBy(ele, doctorAdmin),
                CommentID: ele?.CommentID?.toString(),
                HelpMenuBold: ele?.HelpMenuBold ?? 0,
                Flag: ele?.IsHelpMenu && ele?.HelpMenuBold ? "High" : ele?.Flag,
              };
              delete obj.IsNablInvestigation;
              return obj;
            }),
            ResultStatus: field,
            HeaderInfo: result1?.map((item, _) => ({
              ...item,
              isNablInvestigation: result2?.[0]?.IsNablInvestigation,
              ApprovedBy:
stampApprovedBy(item, doctorAdmin),
            })),
          })

          .then((res) => {
            if (res?.data?.message?.startsWith("Dlc Count for Test")) {
              toast.error(res.data?.message);
            } else {
              if (handleSplitData(res?.data?.message, "&")[0] == "1") {
                setshowApprove({
                  ...approve,
                  show: true,
                  msg: handleSplitData(res?.data?.message, "&")[1],
                });
              } else {
                const testidhash = ResultTestData.map((obj) => obj.TestID);
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
                      LedgertransactionIDHash:
                        ResultData[0]?.LedgertransactionIDHash,
                      isOutSource: ResultData[0]?.isOutSource,
                      index: ResultData[0]?.index,
                      ApprovedBy: ResultData[0]?.ApprovedBy,
                    },
                    ResultData[0]?.index,
                    setLoading
                  );
                } else {
                  setResultTestData([]);
                  setResultData([]);
                }

                // handleReport("Yes", headerData);
                toast.success(res?.data?.message);
                // setDlcCheckChecked(true);
              }
            }
            setLoading(false);
            TableData(document.getElementById("SampleStatus")?.value ??
              formData?.SampleStatus)
          })
          .catch((err) => {
            setLoading(false);

            toast.error(
              err?.response?.data?.message
                ? err?.response?.data?.message
                : "Error Occured xxx"
            );
            // setResultData([]);
          });
      } else {
        axiosInstance
          .post("RE/SaveResultEntry", {
            data: result2.map((ele) => {
              const obj = {
                ...ele,
                Value: ele?.Value?.toString(),
                ApprovedBy:
                  stampApprovedBy(ele, doctorAdmin),
                CommentID: ele?.CommentID?.toString(),
                HelpMenuBold: ele?.HelpMenuBold ?? 0,
                Flag: ele?.IsHelpMenu && ele?.HelpMenuBold ? "High" : ele?.Flag,
              };
              delete obj.IsNablInvestigation;
              return obj;
            }),
            ResultStatus: field,
            HeaderInfo: result1?.map((item, _) => ({
              ...item,
              isNablInvestigation: result2?.[0]?.IsNablInvestigation,
              ApprovedBy:
stampApprovedBy(item, doctorAdmin),
            })),
          })
          .then((res) => {
            setLoading(false);
            toast.success(res.data.message);
            // setResultData([]);
            // console.log(payload);
            // setDlcCheckChecked(true);
            const testidhash = ResultTestData.map((obj) => obj.TestID);
            console.log('testidhash', testidhash);
            // (field === "Hold" || field === "Unhold") &&
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
              setLoading
            );
            GetResultEntry(payload, index, loading)
          })
          .catch((err) => {
            setLoading(false);
            notify(err?.response?.data?.message || "Something went wrong", 'error')
          });
      }
    } else {
      setLoading(false);
      toast.error("Please Enter An Entry For Any UnApproved Test.");
    }
  };

  // RE Allergy 

  const fetchApiRA = (field, payload, headerData) => {
    console.log({ field, headerData });

    const singleArrayOfObjects = entry?.reduce(
      (acc, arr) => acc.concat(arr),
      []
    );

    console.log("singleArrayOfObjects", singleArrayOfObjects);
    console.log({ singleArrayOfObjects });
    const failedGroups = [];

    mandatoryIDs?.forEach((id) => {
      const hasReading = singleArrayOfObjects
        .filter((i) => Number(i.obid) === id)
        .some((i) => String(i.AntibioticInterpreatation || "").trim() !== "");

      if (!hasReading) {
        failedGroups.push(id);
      }
    });

    console.log("failed groups", failedGroups)

    if (failedGroups.length > 0) {
      toast.error(
        "Please fill at least one Display Reading for all mandatory groups."
      );
      return;
    }
    setLoading(true);
    const organismData = singleArrayOfObjects?.map((ele) => {
      console.log({ ele });
      return {
        awskey: ele?.DrugImage ? ele?.DrugImage : "",
        AllergyTypeName: ele?.obname,
        Sensitivity: "",
        TestId: payload[0]?.TestID,
        DrugId: ele?.id,
        DrugName: ele?.name,
        ColonyCount: "",
        ColonyCountComment: "",
        OrganismNameDisplayname: "",
        AllergyTypeId: ele?.obid,
        MinValue: ele?.Minimum,
        MaxValue: ele?.Maximum,
        AntiBioticGroupName: "",
        AntiBioticInterpreatation: ele?.AntibioticInterpreatation
          ? ele?.AntibioticInterpreatation
          : "",
        AntiBioticGroupId: 0,
        MIC: "",
        mic_bp: "",
        DisplayReading: ele?.DisplayReading,
      };
    });

    console.log({ organismData });
    const savePayload = payload?.map((ele) => {
      let obj = {
        ...ele,
        InvestigationId: ele?.InvestigationID,
        LabInvestigationId: ele?.InvestigationID,
        TestId: ele?.TestID,
        Inv: "",
        LabNo: ele?.LedgerTransactionNo,
        BarcodeNo: ele?.SINNo,
        LabObservationId: ele?.labObservationID,
        Description: ele?.COMMENT,
      };
      delete obj.IsNablInvestigation;
      return obj;
    });

    console.log({ savePayload });
    if (field == "Approved") {
      const details = {
        Data: savePayload,
        ResultStatus: field,
        IsCritical: 0,
        // HeaderInfo: headerData,
        HeaderInfo: headerData?.map((item, _) => {
          return {
            ...item,
            ApprovedBy: parseMappedSignature(payload?.[0]?.DefaultSignatureID).id || item?.ApprovedBy,
            IisNablInvestigation: payload?.[0]?.IsNablInvestigation,
          };
        }),
        AntiBioticData: organismData,
        ReportNumber: entryPayload?.ReportNumber,
        LedgertransactionId: savePayload[0]?.LedgerTransactionID,
        ApprovedBy:
          parseMappedSignature(payload?.[0]?.DefaultSignatureID).id || entryPayload?.ApprovedBy,
        ApprovalName: entryPayload?.ApprovalName,
      };

      axiosInstance
        .post("ResultentryAllergy/SaveAllergyData", details)
        .then((res) => {
          setLoading(false);
          // console.log(doctorAdmin);

          // handleReport("Yes", headerData);
          setResultData([]);
          setEntry([]);
          toast.success(res?.data?.message);

          setEntryPayload({
            ReportNumber: "1",
            organism: "",
            IncubationDate: new Date(),
            IncubationTime: "00:00:00",
            ApprovedBy: "",
            ApprovalName: "",
          });
        })
        .catch((err) => {
          if (err.response.status === 504) {
            toast.error(t("Something Went Wrong"));
          }
          if (err.response.status === 401) {
            toast.error(err.response.data.message);
          }
          if (err.response.status === 400) {
            toast.error(err.response.data.message);
          }
          setLoading(false);
        });
    } else {
      axiosInstance
        .post("ResultentryAllergy/SaveAllergyData", {
          Data: savePayload,
          ResultStatus: field,
          HeaderInfo: headerData?.map((item, _) => {
            return {
              ...item,
              ApprovedBy: parseMappedSignature(payload?.[0]?.DefaultSignatureID).id || item?.ApprovedBy,
              IisNablInvestigation: payload?.[0]?.IsNablInvestigation,
            };
          }),
          AntiBioticData: organismData,
          ReportNumber: "1",
          LedgertransactionId: savePayload[0]?.LedgerTransactionID,
          NotApprovalComment: headerData[0]?.NotApproveRemark ?? "",
        })
        .then((res) => {
          setLoading(false);
          toast.success(res.data.message);
          setResultData([]);
          if (field == "Not Approved") {
            setResultData([]);
            setEntry([]);
            setEntryPayload({
              ReportNumber: "1",
              organism: "",
              IncubationDate: new Date(),
              IncubationTime: "00:00:00",
              ApprovedBy: "",
              ApprovalName: "",
            });
          }
        })
        .catch((err) => {
          if (err.response.status === 504) {
            toast.error(t("Something Went Wrong"));
          }
          if (err.response.status === 401) {
            toast.error(err.response.data.message);
          }
          setLoading(false);
        });
    }
  };

  const getUnFilledValue = (arr1, arr2) => {
    const uniqueV = [...new Set(arr1.map((item) => item.InvestigationID))];
    const filteredV = uniqueV.filter((InvestigationID) => {
      const values = arr2
        .filter((item) => item.InvestigationID === InvestigationID)
        .map((item) => ({ Value: item.Value, Comment: item.COMMENT }));

      return values.some(
        ({ Value, Comment }) => Value !== "" || Comment !== ""
      );
    });

    const newArr1 = arr1.filter((item) =>
      filteredV.includes(item.InvestigationID)
    );

    const newArr2 = arr2.filter((item) =>
      filteredV.includes(item.InvestigationID)
    );

    return { newArr1, newArr2 };
  };
  const handleSplitData = (id, symbol) => {
    const data = id?.split(symbol);
    return data;
  };

  // const handleStatusFilter = (status) => {
  //   const data = ResultTestData.filter(
  //     (ele) => ele?.Status === status && ele?.isChecked === true
  //   );
  //   return data;
  // };

  const checkDlc = (result1) => {
    const result = result1.some((item) => item.IsDLCCheck == 1) ? true : false;
    return result && DlcCheckChecked;
  };

  // RE Changes 

  // console.log(ResultTestData);
  const handleKeyDown = (e) => {
    if (e?.key === "Enter") {
      TableData("");
    }
  };
  // const handleResultSubmit = (field, headData, skipModal = false) => {
  //   const errorToast = `This Test is ${ DyanmicStatusResponse(ResultTestData) }`;
  //   if (field === "Approved") {
  //     const data = ResultData.filter(
  //       (ele) =>
  //         [3, 10, 14, 13, 20].includes(ele?.Status) && ele?.isChecked === true
  //     );
  //     const val = ResultTestData.filter(
  //       (ele) =>
  //         [3, 10, 14, 13, 20].includes(ele?.Status) && ele?.isChecked === true
  //     );

  //     const omitted = data.filter(
  //       (ele) => ele.isOmit === 1 || ele.isOmit === true
  //     );
  //     if (omitted.length > 0 && !skipModal) {
  //       setOmitTests(omitted);
  //       setModalAction("Approved");
  //       setShowOmitModal(true);
  //       return;
  //     }

  //     validateData(field, data, errorToast, val);
  //   } else if (field === "Save") {
  //     const data = ResultData.filter(
  //       (ele) =>
  //         [3, 10, 14, 13, 20].includes(ele?.Status) && ele?.isChecked === true
  //     );
  //     const val = ResultTestData.filter(
  //       (ele) =>
  //         [3, 10, 14, 13, 20].includes(ele?.Status) && ele?.isChecked === true
  //     );

  //     const omitted = data.filter(
  //       (ele) => ele.isOmit === 1 || ele.isOmit === true
  //     );
  //     if (omitted.length > 0 && !skipModal) {
  //       setOmitTests(omitted);
  //       setModalAction("Save");
  //       setShowOmitModal(true);
  //       return;
  //     }

  //     validateData(field, data, errorToast, val);
  //   } else if (field === "Dual Authentication") {
  //     const data = ResultData.filter(
  //       (ele) =>
  //         [3, 10, 14, 13, 20].includes(ele?.Status) && ele?.isChecked === true
  //     );
  //     const val = ResultTestData.filter(
  //       (ele) =>
  //         [3, 10, 14, 13, 20].includes(ele?.Status) && ele?.isChecked === true
  //     );
  //     validateData(field, data, errorToast, val);
  //   } else if (field === "Not Approved") {
  //     const data = ResultData.filter((ele) => ele.TestID === headData.TestID);
  //     const val = ResultTestData.filter(
  //       (ele) => ele?.TestID === headData.TestID
  //     );
  //     validateData(field, data, "This test is Not Approved", val);
  //   } else if (field === "Hold") {
  //     const payload = ResultData.filter(
  //       (ele) => ele.Status !== 5 && ele.isChecked === true
  //     );
  //     const val = ResultTestData.filter(
  //       (ele) => ele.Status !== 5 && ele.isChecked === true
  //     );
  //     validateData(field, payload, errorToast, val);
  //   } else if (field === "Unhold") {
  //     const data = ResultData.filter((ele) => ele.TestID === headData.TestID);
  //     const val = ResultTestData.filter(
  //       (ele) => ele?.TestID === headData.TestID
  //     );
  //     const UnholdData = val?.map((ele) => {
  //       return {
  //         ...ele,
  //         IsHold: 0,
  //       };
  //     });

  //     validateData(field, data, t("This Test is not Hold"), UnholdData);
  //   } else {
  //     const payload = ResultData.filter((ele) => ele.isChecked === true);
  //     validateData(field, payload);
  //     // } else {
  //     //   if (field === "Not Approved") {
  //     //     const payload = ResultData.filter((ele) => ele.isChecked === true);
  //     //     fetchApi(field, payload);
  //     //   } else {
  //     //     toast.error(
  //     //       `This already approved ${ResultTestData[statusMatchIndex]["PackageName"]}, Please Uncheck to continue or unhold to continue`
  //     //     );
  //     //   }
  //     // }
  //   }
  // };


  // RE HandleSubmit 

  const handleResultSubmit = (field, headData, skipModal = false) => {
    const toastMsg = errorToast();

    console.log("enteredddddd", field, headData, skipModal);

    const getFiltered = (source) =>
      source.filter(
        (ele) =>
          statuses.includes(ele?.Status) &&
          ele?.[checkedKey] === checkedValue
      );

    if (["Approved", "Save", "Dual Authentication"].includes(field)) {
      const data = getFiltered(ResultData);
      const val = getFiltered(ResultTestData);

      if (hasOmit && field !== "Dual Authentication") {
        const omitted = data.filter(
          (ele) => ele.isOmit === 1 || ele.isOmit === true
        );

        if (omitted.length && !skipModal) {
          setOmitTests(omitted);
          setModalAction(field);
          setShowOmitModal(true);
          return;
        }
      }

      validateFn(field, data, toastMsg, val);
      return;
    }

    if (field === "Not Approved") {
      const data = ResultData.filter((ele) => ele.TestID === headData.TestID);
      const val = ResultTestData.filter(
        (ele) => ele?.TestID === headData.TestID
      );

      validateFn(field, data, "This test is Not Approved", val);
      return;
    }

    if (field === "Hold") {
      const payload = ResultData.filter(
        (ele) =>
          ele.Status !== 5 && ele?.[checkedKey] === checkedValue
      );
      const val = ResultTestData.filter(
        (ele) =>
          ele.Status !== 5 && ele?.[checkedKey] === checkedValue
      );

      validateFn(field, payload, toastMsg, val);
      return;
    }

    if (field === "Unhold") {
      const data = ResultData.filter((ele) => ele.TestID === headData.TestID);
      let val = ResultTestData.filter(
        (ele) => ele?.TestID === headData.TestID
      );

      if (hasOmit === true) {
        val = val.map((ele) => ({ ...ele, IsHold: 0 }));
      }

      validateFn(field, data, t("This Test is not Hold"), val);
      return;
    }

    const payload = ResultData.filter(
      (ele) => ele?.[checkedKey] === checkedValue
    );
    validateFn(field, payload);
  };

  // console.log(helpmenu);
  const DeltaResponse = (data) => {
    axiosInstance
      .post("RE/DeltaCheck", {
        TestID: data?.TestID,
        LabObservation_ID: data?.labObservationID,
      })
      .then((res) => {
        const data = res.data.message;
        if (Array.isArray(data) && data.length > 0) {
          setPreviousTestResult(data);
        } else {
          setPreviousTestResult([]);
        }
      })
      .catch((err) => {
        console.log(err);
      });
  };
  const TestHeaderResponce = (data) => {
    axiosInstance
      .post("RE/TestWiseDeltaValue", {
        TestID: data?.TestID,
        LabObservation_ID: data?.labObservationID,
      })
      .then((res) => {
        const data = res.data.message;
        if (Array.isArray(res.data.message)) {
          setHeaderTestResult(data);
        } else {
          setHeaderTestResult([]);
        }
      })
      .catch((err) => {
        console.log(err);
      });
  };
  const getUniqueTest = () => {
    const data = ResultTestData[0]?.AllTestDetails?.split("#");
    const finalDatas = [...new Set(data)];
    const finalData = finalDatas?.map((ele) => {
      return {
        TestID: Number(ele?.split("$")[0]),
        TestName: ele?.split("$")[1],
        labObservationID: Number(ele?.split("$")[2]),
        Status: ele?.split("$")[3],
      };
    });
    console.log("finalData", finalData);
    return finalData ?? [];
  };
  const AuditTrailResponce = async (data) => {
    await axiosInstance
      .post("RE/TestWiseDeltaValue", {
        TestID: data?.TestID,
        LabObservation_ID: data?.labObservationID,
      })
      .then((res) => {
        const resData = res.data.message;
        if (resData.length > 0) {
          setShowAuditTrail({
            show: true,
            data: resData,
            testname: data?.PackageName,
          });
        } else {
          setShowAuditTrail({ show: false, data: "", testname: "" });
        }
      })
      .catch((err) => {
        toast.error(err.response.data.message);
        setShowAuditTrail({ show: false, data: "", testname: "" });
      });
  };

  const handleAuditTrailModal = () => {
    setShowAuditTrail({ show: false, data: "", testname: "" });
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
  // console.log(ResultTestData);
  console.log(ResultData);
  const checkDualAuthentication =
    ResultTestData?.length > 0
      ? ResultTestData?.some((ele) => ele?.DualAuthentication == 1)
      : false;
  const handleReport = (key, headerData) => {
    const data = ResultTestData.filter((ele) => ele?.isChecked === true || ele?.IsChecked === 1);
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
            : err?.data?.message
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
            : t("Something Went Wrong")
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
            setLoading
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
            setLoading
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
  }, []);

  const handleDeltaCheckReport = (parameterData) => {
    const payloadData = parameterData.reduce(
      (acc, current) => {
        if (!acc.Patientcode) {
          acc.Patientcode = current?.PatientCode;
        }

        acc.testid.push(current.TestID);

        return acc;
      },
      {
        Patientcode: "",
        testid: [],
      }
    );
    // console.log(payloadData);
    axiosReport
      .post(
        "commonReports/DeltaCheckData",
        {
          ...payloadData,
          Patientcode: payloadData?.Patientcode ?? "",
          testid: Array.isArray(payloadData?.testid)
            ? payloadData?.testid
            : [payloadData?.testid],
        },
        { responseType: "blob" }
      )
      .then((res) => {
        const contentType = res?.headers?.["content-type"] || "";
        if (contentType.includes("application/json")) {
          return (res.data instanceof Blob ? res.data.text() : Promise.resolve(JSON.stringify(res.data)))
            .then((text) => {
              try {
                const json = JSON.parse(text);
                toast.error(json?.message || t("No Record Found"));
              } catch {
                toast.error(t("No Record Found"));
              }
            });
        }
        const url = window.URL.createObjectURL(
          new Blob([res.data], { type: "application/pdf" })
        );
        window.open(url, "_blank");
      })
      .catch(async (err) => {
        let message = t("No Record Found");
        const data = err?.response?.data;
        if (data instanceof Blob) {
          try {
            const text = await data.text();
            const json = JSON.parse(text);
            if (typeof json?.message === "string" && json.message.trim()) {
              message = json.message;
            }
          } catch {
            /* keep fallback */
          }
        } else if (typeof data?.message === "string" && data.message.trim()) {
          message = data.message;
        }
        toast.error(message);
      });
  };

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
        "CommonController/BindTestCentreList"
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

  const handleShowRemark = () => {
    setShowRemark(false);
  };
  const handleShowPrickRemarks = () => {
    setShowPrickRemark(false);
  };

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

  const handleNotApproveRemark = (e, data) => {
    const { name, value } = e.target;
    const TestHeader = [...ResultTestData];
    const index = ResultTestData.indexOf(data);
    TestHeader[index][name] = value;

    if (ReportType === "1" || ReportType === "2") {
      if (name == "HoldReason") TestHeader[index]["IsHold"] = 1;
    }
    setResultTestData(TestHeader);
  };

  const handleReactSelectChange = (name, option) => {
    setCollectionBoy(option?.value);
  };

  const printHeader = (isPrint, guid) => {
    console.log(isPrint, guid);
    let newResultTestData = [...ResultTestData].map((ele) => {
      return {
        ...ele,
        Printwithhead:
          ele?.TestIDHash === guid ? (isPrint ?? 0) : ele?.Printwithhead,
      };
    });
    setResultTestData(newResultTestData);
    let newResultData = [...ResultData].map((ele) => {
      return {
        ...ele,
        Printwithhead:
          ele?.TestIDHash === guid ? (isPrint ?? 0) : ele?.Printwithhead,
      };
    });
    setResultData(newResultData);
  };

  const totalPatient = () => {
    const visitNos = redata.map((item) => item.VisitNo);
    const uniqueVisitNos = new Set(visitNos);
    return uniqueVisitNos.size;
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

  const reloadRange = async (reloadData) => {
    try {
      setLoading(true);
      const testID = Number(reloadData?.[0]?.TestID);
      const res = await axiosInstance.post("RE/ReloadRanges", {
        testID: testID,
      });

      const resReloadData = Array.isArray(res?.data?.data)
        ? res.data?.data
        : [];
      setResultData((prev) =>
        prev.map((ele, idx) => {
          const newRange1 = resReloadData?.filter((item, _) => {
            return item?.LabObservationID == ele?.labObservationID;
          })?.[0];
          return {
            ...ele,
            MinValue: newRange1?.MinValue || "",
            MaxValue: newRange1?.MaxValue || "",
            DisplayReading: `${newRange1?.DisplayReading || ""}`,
            ReadingFormat: newRange1?.ReadingFormat || "",
            MethodName: newRange1?.Method || "",
          };
        })
      );
    } catch (err) {
      console.log("Reload range error:", err);
    } finally {
      setLoading(false);
    }
  };

  const totalDlcSum = [...ResultData]
    ?.filter((item) => item?.dlcCheck === 1)
    .reduce((sum, item) => sum + parseFloat(item?.Value || 0), 0);

  const statusCount = (key) => {
    // Server-supplied totals. It owns what each bucket means - Receive, MAC Data,
    // OutSource and Partial Done are conditions on several columns, not a Status
    // value - and it measures them over the whole search rather than the rows
    // currently on screen.
    if (statusBuckets) {
      return Number(statusBuckets[key ?? ""] ?? 0);
    }
    // Older API build with no counts in the response: fall back to the previous
    // behaviour so the bar still shows something rather than all zeros.
    if (key == "") {
      return [...originalTableData]?.length;
    }
    return [...originalTableData]?.filter((item) => item?.Status == key)
      ?.length;
  };

  const filterStatusWise = (sampStatus) => {
    setFormData({ ...formData, ["SampleStatus"]: sampStatus });
    TableData(sampStatus);
  };

  useEffect(() => {
    setIndexMatch(0);
  }, [formData?.DoctorName, formData?.TestName, formData?.Package]);

  // RE Functions 

  const removeArrayAtIndex = (index) => {
    const newData = [...entry];
    newData.splice(index, 1);
    setEntry(newData);
  };

  const handleSensitivity = (value, outerIndex, innerIndex, name) => {
    console.log({ name });
    const newEntry = [...entry];
    newEntry[outerIndex][innerIndex][name] = value;
    setEntry(newEntry);
  };

  const { handleArrowNavigation } = useArrowNavigation({
    ReportType,
    ResultData,
    redata,
    machine,
    doctorAdmin,
    GetResultEntry,
    GetResultEntryCulture,
  });


  //RE Use Effects 
  useEffect(() => {
    if (investigationId) {
      getAllergyData();
    } else {
      return;
    }
  }, [investigationId])

  useEffect(() => {

    if (bindAllergyType?.length > 0) {
      console.log("inside");
      const mandatoryItems = bindAllergyType.filter(
        (item) => item?.mandatory === 1
      );
      console.log("mandatoryItems", mandatoryItems);

      const ids = mandatoryItems.map((item) => item.value);
      setMandatoryIDs(ids);

      mandatoryItems.forEach((item) => {
        getEntryData(
          item.value,
          item.label,
          "",
          "",
          "",
          true
        );
      });
      setEntryShow(true);
    }
  }, [bindAllergyType]);

  useEffect(() => {
    if (ReportType !== "") {
      setIsRA(ReportType)
    }
  }, [ReportType])



  console.log("ResultTestData", ResultTestData);
  console.log("ResultData", ResultData);
  console.log("redata", redata);
  console.log("formData", formData);

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
      {showPH && (
        <PatientDetailModal
          showPH={showPH}
          setShowPH={(data) => {
            setShowPH(false);
          }}
          ResultData={ResultData}
        />
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
                  formData?.SampleStatus
                );
              }}
            />
          )}
          {/* <Heading isBreadcrumb={true} name="Result Entry" /> */}
          <Accordion
            name={t("Result Entry")}
            defaultValue={true}
            linkTo="/receiptreprint"
            isBreadcrumb={true}
            linkTitle={
              <div className="link-title-container" id="pr_id_11">
                <div className="link-title-item">
                  {t("Total Patient") + " : " + totalPatient()}
                </div>
                <div className="link-title-item">
                  {t("Total Test Count") + " : " + testCount}
                </div>
              </div>
            }
          >
            <Accordion
              defaultValue={true}
              title={
                <div className="d-flex">
                  <span className="mt-1"> {t("Result Entry Details")} </span>
                  <span className="header ml-1" style={{ cursor: "pointer" }}>
                    <ReceiptReprintFilter
                      columnConfig={dynamicFilter}
                      setColumnConfig={setDynamicFilter}
                      PageName="ResultEntryFilter"
                    />
                  </span>
                </div>
              }
            />{" "}
            {/* {areAllVisibleKeysTrue() && ( */}
            <>
              {" "}
              <div className="row  px-2 pt-2">
                {isVisible("SelectTypes") && (
                  <div className="col-sm-2">
                    <div className="d-flex" style={{ display: "flex" }}>
                      <div style={{ width: "40%" }}>
                        <SelectBox
                          options={[
                            ...SearchBy,
                            ...(shouldIncludeAIIMSID()
                              ? [
                                { label: "AIIMSID", value: "AIIMSID" },
                                { label: "CrNo", value: "CrNo" },
                              ]
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
                          <>
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
                          </>
                        )}
                      <div className="flex-grow-1" style={{ width: "50%" }}>
                        {formData?.SelectTypes === "Mobile" ? (
                          <div style={{ width: "100%" }}>
                            <Input
                              type="number"
                              name="ItemValue"
                              max={10}
                              onKeyDown={handleKeyDown}
                              value={formData.ItemValue}
                              onChange={handleChange}
                              onInput={(e) => number(e, 10)}
                            />
                            {errors?.ItemValue && (
                              <div className="error-message">
                                {errors?.ItemValue}
                              </div>
                            )}
                          </div>
                        ) : (
                          <div style={{ width: "100%" }}>
                            <Input
                              type="text"
                              name="ItemValue"
                              onKeyDown={handleKeyDown}
                              max={20}
                              value={formData.ItemValue}
                              onChange={handleChange}
                            />
                            {errors?.ItemValue && (
                              <div className="error-message">
                                {errors?.ItemValue}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {isVisible("CentreID") && (
                  <div className="col-sm-2  ">
                    <ReactSelect
                      dynamicOptions={AddBlankData(CentreData, "All Centre")}
                      name="CentreID"
                      lable={t("Centre")}
                      id="Centre"
                      removeIsClearable={true}
                      placeholderName={t("Centre")}
                      value={formData?.CentreID}
                      onChange={handleSearchSelectChange}
                    />
                  </div>
                )}
                {/* {isVisible("TestCentre") && ( */}
                <div className="col-sm-2">
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
                {/* )} */}
                {isVisible("RateTypeID") && (
                  <div className="col-sm-2 ">
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
                )}
                {isVisible("DepartmentID") && (
                  <div className="col-sm-2  ">
                    <ReactSelect
                      dynamicOptions={AddBlankData(
                        DepartmentData,
                        "All Department"
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
                )}
                {shouldIncludeAIIMSID() && isVisible("WardNo") && (
                  <div className="col-sm-2">
                    <SelectBox
                      options={[
                        { label: "WardNo", value: "" },
                        ...WardNoOptions,
                      ]}
                      name="WardNo"
                      lable="WardNo"
                      id="WardNo"
                      onChange={handleSelectChange}
                      selectedValue={formData?.WardNo}
                    />
                  </div>
                )}
                {isVisible("DoctorName") && (
                  <div className="col-sm-2  ">
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
                        // setTimeout(() => {
                        //   const data = doctorSuggestion.filter(
                        //     (ele) => ele?.Name.toLowerCase() === e.target.value.toLowerCase()
                        //   );
                        //   if (data.length === 0) {
                        //     setFormData({ ...formData, DoctorName: "" });
                        //   }
                        // }, 500);
                      }}
                    // autoComplete="off"
                    />
                    {dropFalse &&
                      doctorSuggestion.length > 0 &&
                      formData.DoctorName && (
                        <ul className="suggestion-data">
                          {doctorSuggestion.map((data, index) => (
                            <li
                              onClick={() =>
                                handleListSearchNew(data, "DoctorName")
                              }
                              className={`${index === indexMatch && "matchIndex"}`}
                              key={index}
                            >
                              {data?.Name}
                            </li>
                          ))}
                        </ul>
                      )}
                  </div>
                )}
                {/* {isVisible("Package") && ( */}
                <div className="col-sm-2">
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
                {/* )} */}

                <div className="col-sm-2">
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

                {isVisible("TestName") && (
                  <div className="col-sm-2  ">
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
                        // setTimeout(() => {
                        //   const match = TestSuggestion.some(
                        //     (ele) =>
                        //       ele?.TestName?.toLowerCase() ===
                        //       e.target.value?.toLowerCase()
                        //   );

                        //   if (!match) {
                        //     setFormData((prev) => ({ ...prev, TestName: "" }));
                        //   }
                        // }, 200);
                      }}
                    />
                    {/* {TestSuggestion.length > 0 && (
                      <AutoComplete
                        selects={selects}
                        test={TestSuggestion}
                        handleListSearch={handleListSearchNew}
                        indexMatch={indexMatch}
                      />
                    )} */}
                    {selects &&
                      TestSuggestion.length > 0 &&
                      formData.TestName && (
                        <ul className="suggestion-data">
                          {TestSuggestion.map((data, index) => (
                            <li
                              onClick={() =>
                                handleListSearchNew(data, "TestName")
                              }
                              className={`${index === indexMatch && "matchIndex"}`}
                              key={index}
                            >
                              {data.TestName}
                            </li>
                          ))}
                        </ul>
                      )}
                  </div>
                )}

                {isVisible("DateTypeSearch") && (
                  <div className="col-sm-2">
                    <SelectBox
                      lable="DateTypeSearch"
                      options={DateTypeSearch2}
                      selectedValue={formData?.DateTypeSearch}
                      name="DateTypeSearch"
                      onChange={handleSelectChange}
                    />
                  </div>
                )}
                {isVisible("FromDate") && (
                  <div className="col-sm-2">
                    <DatePicker
                      className="custom-calendar"
                      name="FromDate"
                      value={formData?.FromDate}
                      onChange={dateSelect}
                      placeholder=" "
                      id="FromDate"
                      lable="FromDate"
                      maxDate={new Date(formData?.ToDate)}
                    />
                  </div>
                )}
                {isVisible("FromTime") && (
                  <div className="col-sm-2">
                    <CustomTimePicker
                      name="FromTime"
                      placeholder="FromTime"
                      value={formData?.FromTime}
                      id="FromTime"
                      lable="FromTime"
                      onChange={handleTime}
                    />
                  </div>
                )}
                {isVisible("ToDate") && (
                  <div className="col-sm-2">
                    <DatePicker
                      className="custom-calendar"
                      name="ToDate"
                      value={formData?.ToDate}
                      onChange={dateSelect}
                      placeholder=" "
                      id="ToDate"
                      lable="ToDate"
                      maxDate={new Date()}
                    // minDate={new Date(formData?.FromDate)}
                    />
                  </div>
                )}
                {isVisible("ToTime") && (
                  <div className="col-sm-2">
                    <CustomTimePicker
                      name="ToTime"
                      placeholder="ToTime"
                      value={formData?.ToTime}
                      id="ToTime"
                      lable="ToTime"
                      onChange={handleTime}
                    />
                  </div>
                )}

                {isVisible("SampleStatus") && (
                  <div className="col-sm-2 my-1">
                    <MultiBackGroundReactSelect
                      placeholderName={t("Sample Status")}
                      dynamicOptions={SampleStatus}
                      value={formData.SampleStatus}
                      onChange={handleSelectChange1}
                      name="SampleStatus"
                      id="SampleStatus"
                      bgColor={true} // enable colored background
                    />
                  </div>
                )}
                {isVisible("MachineID") && (
                  <div className="col-sm-2   ">
                    <ReactSelect
                      dynamicOptions={machineId ?? []}
                      name="MachineID"
                      lable={t("MachineID")}
                      id="MachineID"
                      removeIsClearable={true}
                      placeholderName={t("MachineID")}
                      value={formData?.MachineID}
                      onChange={handleSearchSelectChange}
                      className="input-sm"
                    />
                  </div>
                )}

                <div className="col-sm-2 col-6">
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
                <div className="col-sm-2">
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
                {isVisible("IsTat") && (
                  <div className="col-sm-2   ">
                    <SelectBox
                      options={[
                        { label: "TAT Report - All", value: 0 },
                        { label: "In TAT", value: 1 },
                        { label: "Out TAT", value: 2 },
                      ]}
                      selectedValue={formData?.IsTat}
                      lable="IsTat"
                      id="IsTat"
                      name="IsTat"
                      onChange={handleSelectChange}
                    />
                  </div>
                )}
                {isVisible("Flag") && (
                  <div className="col-sm-2">
                    <SelectBox
                      options={[{ label: "Select Flag", value: "" }, ...Flag]}
                      name="Flag"
                      lable="Flag"
                      id="Flag"
                      onChange={handleSelectChange}
                      selectedValue={formData?.Flag}
                    />
                  </div>
                )}
                {isVisible("Order") && (
                  <div className="col-sm-1">
                    <SelectBox
                      options={[{ label: "Select Order", value: "" }, ...Order]}
                      name="Order"
                      lable="Order"
                      id="Order"
                      onChange={handleSelectChange}
                      selectedValue={formData?.Order}
                    />
                  </div>
                )}
                {isVisible("IsUrgent") && (
                  <div className="col-sm-1 ">
                    <input
                      id="IsUrgent"
                      type="checkbox"
                      // className="mt-2"
                      name="IsUrgent"
                      checked={formData?.IsUrgent}
                      onChange={handleSelectChange}
                    />
                    <label htmlFor="IsUrgent">
                      &nbsp;&nbsp; {t("IsUrgent")}
                    </label>
                  </div>
                )}
                <div className="col-sm-1 ">
                  <input
                    id="IsVip"
                    type="checkbox"
                    // className="mt-2"
                    name="IsVip"
                    checked={formData?.IsVip}
                    onChange={handleSelectChange}
                  />
                  <label htmlFor="IsVip">
                    &nbsp;&nbsp; {t("IsVip")}
                  </label>
                </div>
                {/* {isVisible("SearchButton") && ( */}
                <div className="col-sm-1 p-1">
                  <button
                    name="SearchButton"
                    onClick={() =>
                      TableData(
                        document.getElementById("SampleStatus")?.value ??
                        formData?.SampleStatus
                      )
                    }
                    className="btn btn-primary btn-sm w-100"
                  >
                    {t("Search")}
                  </button>
                </div>
                {/* )} */}
                {isVisible("MoreFilterButton") && (
                  <div className="col-sm-1 d-flex align-items-center">
                    <button
                      name="MoreFilterButton"
                      onClick={() => {
                        setShowAdvanceFilter({ show: true, data: formData });
                      }}
                      className="btn btn-success btn-sm w-100"
                    >
                      {t("MoreFilter")}
                    </button>
                  </div>
                )}
              </div>
            </>
          </Accordion>
          <div className="mt-2 mb-3 px-2 py-1 bg-white d-flex sampleStatusClass">
            <strong style={{ minWidth: "100px" }}>Sample Status : </strong>
            {SampleStatus?.map((sItem, idx) => (
              <TableFilterDot
                color={`${getStatusColor(sItem?.value)}`}
                // color={"#f1a098"}
                title={`${sItem?.label} (${statusCount(sItem?.value)})`}
                onClick={() => filterStatusWise(sItem?.value)}
                bgColor={`#e9e2e1`}
              />
            ))}
          </div>
          <Accordion
            title={
              <>
                {redata?.length === 0 ? (
                  t("Search Result")
                ) : (
                  <div className="d-flex">
                    <span className="mt-1">
                      {t("Click Icon To Filter Results")}
                    </span>

                    <span className="header ml-1" style={{ cursor: "pointer" }}>
                      <ReceiptReprintFilter
                        columnConfig={columnConfig}
                        setColumnConfig={setColumnConfig}
                        PageName="ResultEntry"
                      />
                    </span>
                  </div>
                )}
              </>
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
              <Loading />
            ) : load ? (
              <div className="">
                <>
                  {/* Added status */}
                  {/* <RETable
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
                    setReturnFromResultTableWithStatus={setReturnFromResultTableWithStatus}
                 
                  /> */}
                  <RETable
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
                    setReturnFromResultTableWithStatus={setReturnFromResultTableWithStatus}
                    GetResultEntryCulture={GetResultEntryCulture}
                    getAllergyData={getAllergyData}
                    setReportType={setReportType}
                    GetResultEntryCulture2={GetResultEntryCulture2}
                  // CreateCheckbox={CreateCheckbox}
                  />
                </>
              </div>
            ) : (
              <div className="">
                <NoRecordFound />
              </div>
            )}{" "}
          </Accordion>
        </>
      ) : (ReportType === "1" || ReportType === "2") ? (
        <>
          <>
            {showOldReportModal.show && (
              <OldReportModal
                show={showOldReportModal.show}
                value={showOldReportModal.data}
                handleClose={() => {
                  setShowOldReportModal({ show: false, data: "" });
                }}
              />
            )}
            {show.moadal && (
              <ResultEntryEditModal
                show={show}
                handleClose={() => {
                  setShow({ moadal: false, data: {} });
                }}
                handleSave={handleSave}
              />
            )}
            {show2.moadal && (
              <ResultEditAddModal
                show={show2}
                handleClose={() => {
                  setShow2({ moadal: false, data: {} });
                }}
                handleSave={handleSave}
              />
            )}
            {show3?.modal && (
              <TemplateMasterModal
                show={show3}
                handleClose={() => {
                  setShow3({ modal: false, data: {} });
                }}
                handleSave={handleSave}
              />
            )}
            {show7?.modal && (
              <RerunResultEntryModal
                show={show7?.modal}
                data={show7?.data}
                handleClose={() => {
                  setShow7({ modal: false, data: {} });
                }}
              />
            )}
            {reason?.HoldShow && (
              <Reason
                show={reason?.HoldShow}
                reason={reason}
                setReason={setReason}
                handleNotApproveRemark={handleNotApproveRemark}
                handleResultSubmit={handleResultSubmit}
              />
            )}
            {show5?.modal && (
              <UploadFile
                show={show5?.modal}
                handleClose={(data) => {
                  setShow5({
                    modal: false,
                    data: "",
                    pageName: "",
                    blockUpload: "",
                  });
                  printHeader(data, show5.data);
                }}
                documentId={show5.data}
                pageName={show5?.pageName}
                formData={formData}
                isPrintHeader={show5?.Printwithhead}
                blockUpload={show5.blockUpload}
                LedgerTransactionIDHash={
                  ResultTestData[0]?.LedgertransactionIDHash
                }
                ResultTestData={ResultTestData?.[0]}
              />
            )}
            {showRemark && (
              <SampleRemark
                show={showRemark}
                handleShow={handleShowRemark}
                state={handleShowRemark}
                PageName={ResultTestData[0]?.Remarks}
                handleSave={handleShowRemark}
                title={"Remarks"}
              />
            )}{" "}
            {showPrickRemark && (
              <SampleRemark
                show={showPrickRemark}
                handleShow={handleShowPrickRemarks}
                state={handleShowPrickRemarks}
                PageName={ResultTestData[0]?.PricksRemarks}
                handleSave={handleShowRemark}
                title={"PricksRemarks"}
              />
            )}
            {showAuditTrail.show && (
              <AuditTrailMoadal
                show={showAuditTrail.show}
                data={showAuditTrail.data}
                testname={showAuditTrail?.testname}
                handleClose={handleAuditTrailModal}
              />
            )}
            {showReject?.show && (
              <RejectModal
                show={showReject?.show}
                handleShow={handleShowReject}
                data={showReject?.data}
                TableData={handleCloseReject}
              />
            )}
            <div
              className="p-dialog-header custom-box-body"
              style={{
                display: "flex",
                flexDirection: "column",
                backgroundColor: "#bd933aff",
              }}
            >
              <div
                style={{
                  // backgroundColor: "#b53f3fff",
                  display: "",
                  gridTemplateColumns: "repeat(auto-fit, minmax(135px, 1fr))",
                  gap: "8px",
                  padding: "0px",
                  borderRadius: "8px",
                }}
                className="d-flex flex-wrap"
              >
                <div
                  style={{
                    display: "flex",
                    minWidth: "135px",
                    // display: "flex",
                    alignItems: "center",
                  }}
                >
                  <i
                    className="fa fa-folder mr-1"
                    style={{ color: "white" }}
                  ></i>
                  <Tooltip position="bottom" label={t("Lab No")}>
                    <span>{ResultData[0]?.LedgerTransactionNo}</span>
                  </Tooltip>
                </div>
                <div
                  style={{
                    display: "flex",
                    minWidth: "165px",
                    // display: "flex",
                    alignItems: "center",
                  }}
                >
                  <i className="fa fa-user mr-1" style={{ color: "white" }}></i>
                  <Tooltip position="bottom" label={t("Patient Name")}>
                    <span>{ResultData[0]?.PName}</span>
                  </Tooltip>
                </div>
                {ResultTestData[0]?.MobileNo && (
                  <div
                    style={{
                      display: "flex",
                      minWidth: "165px",
                      // display: "flex",
                      alignItems: "center",
                    }}
                  >
                    <i
                      className="fa fa-phone mr-1"
                      style={{ color: "white" }}
                    ></i>
                    <Tooltip position="bottom" label={t("Mobile No")}>
                      <span>{ResultTestData[0]?.MobileNo}</span>
                    </Tooltip>
                  </div>
                )}
                {ResultTestData[0]?.hmis_patCrNo && (
                  <div
                    style={{
                      display: "flex",
                      minWidth: "165px",
                      // display: "flex",
                      alignItems: "center",
                    }}
                  >
                    <i
                      className="fa fa-book mr-1"
                      style={{ color: "white" }}
                    ></i>
                    <Tooltip position="bottom" label={t("PatCr NO")}>
                      <span>{ResultTestData[0]?.hmis_patCrNo}</span>
                    </Tooltip>
                  </div>
                )}
                {ResultTestData[0]?.WardNo && (
                  <div
                    style={{
                      display: "flex",
                      minWidth: "165px",
                      // display: "flex",
                      alignItems: "center",
                    }}
                  >
                    <i
                      className="fa fa-bed mr-1"
                      style={{ color: "white" }}
                    ></i>
                    <Tooltip position="bottom" label={t("WardNo")}>
                      <span>{ResultTestData[0]?.WardNo}</span>
                    </Tooltip>
                  </div>
                )}
                <div
                  style={{
                    display: "flex",
                    minWidth: "135px",
                    // display: "flex",
                    alignItems: "center",
                  }}
                >
                  <i className="fa fa-book mr-1" style={{ color: "white" }}></i>
                  <Tooltip position="bottom" label={t("Patient Code")}>
                    <span>{ResultData[0]?.PatientCode}</span>
                  </Tooltip>
                </div>
                <div
                  style={{
                    display: "flex",
                    minWidth: "100px",
                    // display: "flex",
                    alignItems: "center",
                  }}
                >
                  <i
                    className="fa fa-calendar mr-1"
                    style={{ color: "white" }}
                  ></i>
                  <Tooltip position="bottom" label={t("Age")}>
                    <span>{ResultData[0]?.Age}</span>
                  </Tooltip>
                </div>{" "}
                <div
                  style={{
                    display: "flex",
                    minWidth: "80px",
                    // display: "flex",
                    alignItems: "center",
                  }}
                >
                  <i
                    className="fa fa-street-view mr-1"
                    style={{ color: "white" }}
                  ></i>
                  <Tooltip position="bottom" label={t("Gender")}>
                    <span>{ResultData[0]?.Gender}</span>
                  </Tooltip>
                </div>
                <div
                  style={{
                    display: "flex",
                    minWidth: "175px",
                    // display: "flex",
                    alignItems: "center",
                  }}
                >
                  <i
                    className="fa fa-h-square mr-1"
                    style={{ color: "white" }}
                  ></i>
                  <Tooltip position="bottom" label={t("Center")}>
                    <span>{ResultData[0]?.Centre}</span>
                  </Tooltip>
                </div>
                <div
                  style={{
                    display: "flex",
                    minWidth: "125px",
                    // display: "flex",
                    alignItems: "center",
                  }}
                >
                  <i
                    className="fa fa-user-md mr-1"
                    style={{ color: "white" }}
                  ></i>
                  <Tooltip position="bottom" label={t("Doctor")}>
                    <span>{ResultData[0]?.ReferDoctor}</span>
                  </Tooltip>
                </div>
                <div
                  style={{
                    display: "flex",
                    minWidth: "175px",
                    // display: "flex",
                    alignItems: "center",
                  }}
                >
                  <i
                    className="fa fa-plus-square mr-1"
                    style={{ color: "white" }}
                  ></i>
                  <Tooltip position="bottom" label={t("Rate Type")}>
                    <span>{ResultData[0]?.RateType}</span>
                  </Tooltip>
                </div>
                <div
                  style={{
                    display: "flex",
                    minWidth: "135px",
                    // display: "flex",
                    alignItems: "center",
                  }}
                >
                  <i
                    className="fa fa-calendar mr-1"
                    style={{ color: "white" }}
                  ></i>
                  <Tooltip position="bottom" label={t("Registration Date")}>
                    <span>
                      {ResultData[0]?.RegDate &&
                        dateConfig(ResultData[0]?.RegDate)}
                    </span>
                  </Tooltip>
                </div>
              </div>

              <div className="custom-row">
                {getUniqueTest()?.map((data, index) => (
                  <div
                    key={index}
                    style={{
                      cursor: "pointer",
                      padding: "2px 5px",
                      background: "#f5f5f5",
                      transition: "all 0.3s ease",
                      boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
                    }}
                    className={` round font-weight-bold mx-2 mt-1 w-auto Status-${data.Status}`}
                    onMouseEnter={() => {
                      setTestHeaderHover({
                        index: index,
                        data: [],
                      });
                      TestHeaderResponce(data);
                    }}
                    onMouseLeave={() => {
                      setTestHeaderHover({
                        index: -1,
                        data: [],
                      });
                      setHeaderTestResult([]);
                    }}
                    onClick={() => {
                      callGetResultEntryByTest(data.TestID, index);
                    }}
                  >
                    {data?.TestName}
                    {testHeaderHover?.index === index &&
                      headerTestResult.length > 0 && (
                        <div
                          style={{
                            position: "absolute",
                            width: "auto",
                            left: "60px",
                            zIndex: 9999999,
                            height: "auto",
                            overflow: "visible",
                          }}
                          className="resultEntryCssTable"
                        >
                          <table className="">
                            <thead className="cf">
                              <tr>
                                <th>{t("Test")}</th>
                                <th>{t("Value")}</th>
                                <th>{t("Unit")}</th>
                                <th>{t("Min")}</th>
                                <th>{t("Max")}</th>
                              </tr>
                            </thead>
                            <tbody>
                              {headerTestResult.map((ele, index) => (
                                <tr
                                  key={index}
                                  style={{
                                    background:
                                      ele?.Flag === "High"
                                        ? "#FFD1DC"
                                        : ele?.Flag === "Low"
                                          ? "#FDFD96"
                                          : "#fff",
                                  }}
                                >
                                  <td data-title="LabObservationName">
                                    {ele?.LabObservationName
                                      ? ele?.LabObservationName
                                      : "-"}
                                  </td>
                                  <td data-title="Value">
                                    {ele?.Value ? ele?.Value : "-"}
                                  </td>
                                  <td data-title="ReadingFormat">
                                    {ele?.ReadingFormat
                                      ? ele?.ReadingFormat
                                      : "-"}
                                  </td>
                                  <td data-title="MinValue">
                                    {ele?.MinValue ? ele?.MinValue : "-"}
                                  </td>
                                  <td data-title="MaxValue">
                                    {ele?.MaxValue ? ele?.MaxValue : "-"}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                  </div>
                ))}
                <></>
              </div>
            </div>{" "}
          </>
          <div className="card">
            <div className="p-1">
              <ResultEntryTableCustom>
                <thead class="cf">
                  <tr
                    style={{
                      wordWrap: "break-word",
                      whiteSpace: "normal",
                    }}
                  >
                    <th style={{ width: "20px" }}>{t("#")}</th>
                    <th style={{ width: "200px" }}>{t("Test Name")}</th>
                    {isPreviousResultAvailable && (
                      <th style={{ width: "130px" }}>{t("Pre. Value")}</th>
                    )}
                    <th style={{ width: "160px" }}>{t("Value")}</th>
                    <th style={{ width: "60px" }}>{t("Comment")}</th>
                    <th style={{ width: "70px" }}>
                      <Tooltip label={"Flag"}>
                        <div className="m-0 p-0">
                          <i className="ml-1 fa fa-flag p-0 m-0"></i>
                        </div>
                      </Tooltip>
                    </th>
                    <th style={{ width: "25px" }}>
                      <Tooltip label={"Omit"}>
                        <div className="m-0 p-0">
                          <i className="ml-1 fa fa-eraser p-0 m-0"></i>
                        </div>
                      </Tooltip>
                    </th>
                    <th style={{ width: "20px" }}>
                      {" "}
                      <Tooltip label={"Critical"}>
                        <div className="m-0 p-0">
                          <i className=" fa fa-exclamation-triangle p-0 m-0"></i>
                        </div>
                      </Tooltip>
                    </th>
                    <th>{t("Mac Reading")}</th>
                    <th>{t("Machine Name")}</th>
                    <th>{t("Method Name")}</th>
                    <th style={{ width: "150px" }}>{t("Reference Range")} </th>
                    <th style={{ width: "52px" }}>{t("Unit")}</th>
                    <th>{t("Reading 1")}</th>
                    <th>{t("Reading 2")}</th>
                    <th>{t("QC Data")}</th>
                    {/* <th>{t("Action")}</th> */}
                    {/* <th>{t("Rerun")}</th> */}
                    {/* <th>{t("AuditTrail")}</th> */}
                  </tr>
                </thead>
                <tbody>
                  {ResultTestData?.map((Hdata, Hindex) => (
                    <>
                      <tr key={Hindex} style={{ backgroundColor: "lightgrey" }}>
                        <td data-title={t("#")} style={{ width: "15px" }}>
                          <input
                            type="checkbox"
                            onChange={(e) =>
                              handleCheckbox(e, -1, Hdata.TestID)
                            }
                            checked={
                              ResultData?.length > 0
                                ? isChecked(
                                  "isChecked",
                                  ResultData,
                                  true,
                                  Hdata.TestID
                                ).includes(false)
                                  ? false
                                  : true
                                : false
                            }
                            // disabled={
                            //   (Hdata?.Status === 5 ? true : false)
                            //   || (Hdata?.TestCentreID==0 || Hdata?.TestCentreID==globalCentre) ? true : false
                            // }
                            disabled={
                              !(
                                Hdata?.TestCentreID === 0 ||
                                Hdata?.TestCentreID === globalCentre
                              ) && Hdata?.Status === 5
                            }
                            name="isChecked"
                          />
                        </td>
                        <td
                          colSpan={`${isPreviousResultAvailable ? 1 : 3}`}
                          data-title={t("TestName")}
                          style={{
                            whiteSpace: "normal",
                            wordBreak: "break-word",
                          }}
                        >
                          <span
                            className="invName"
                            style={{ fontWeight: "bold" }}
                          >
                            {Hdata?.PackageName}
                          </span>
                        </td>
                        {isPreviousResultAvailable && (
                          <td colSpan={3} data-title={t("Previous Test Date")}>
                            <b>{Hdata.OldValueDate}</b>
                          </td>
                        )}
                        <td>{Hdata?.DefaultSignatureID?.split("#")?.[1]}</td>
                        <td data-title={t("")} colSpan={2}></td>
                        <td data-title={t("SINNO")} colSpan={1}>
                          <span className="fa fa-barcode">&nbsp;</span>
                          <b>{Hdata?.SINNO}</b>
                        </td>
                        <td colSpan="3" data-title={t("Comment")}>
                          <div className="d-flex flex-wrap align-items-center">
                            {(Hdata?.Status === 3 ||
                              Hdata.Status === 10 ||
                              Hdata.Status === 13 ||
                              Hdata?.Status === 14) && (
                                <>
                                  <div
                                    className="m-0 p-0"
                                    onClick={() => {
                                      setShow5({
                                        modal: true,
                                        data: Hdata?.TestIDHash,
                                        pageName: "Add Report",
                                        Printwithhead: Hdata?.Printwithhead,
                                        blockUpload:
                                          Hdata?.Status == 5 || Hdata?.Status == 6
                                            ? true
                                            : false,
                                      });
                                    }}
                                  >
                                    <Tooltip label={"Add Report"}>
                                      {" "}
                                      <i
                                        className="bi bi-file-earmark-pdf m-0 text-icon-size ml-1 mr-1"
                                        style={{ color: "red" }}
                                        disabled={!Hdata?.isChecked}
                                      ></i>{" "}
                                    </Tooltip>
                                  </div>
                                  &nbsp;
                                  <div
                                    className="m-0 p-0"
                                    onClick={() => {
                                      setShow5({
                                        modal: true,
                                        data: Hdata?.TestIDHash,
                                        pageName: "Add Attachment",
                                        blockUpload:
                                          Hdata?.Status == 5 || Hdata?.Status == 6
                                            ? true
                                            : false,
                                      });
                                    }}
                                  >
                                    <Tooltip label={"Add Attachment"}>
                                      {" "}
                                      <i
                                        className="bi bi-file-earmark-image m-0 text-icon-size ml-1 mr-1"
                                        style={{ color: "#07b023" }}
                                        disabled={!Hdata?.isChecked}
                                      ></i>
                                    </Tooltip>
                                  </div>
                                  &nbsp;
                                  {Hdata?.datatype === "Profile" && (
                                    <div
                                      className="m-0 p-0"
                                      onClick={() =>
                                        setShow2({
                                          moadal: true,
                                          data: { ...Hdata, pageName: "All" },
                                        })
                                      }
                                    >
                                      <Tooltip label={"Add Comment"}>
                                        <i
                                          className="bi bi-chat-dots m-0 text-icon-size ml-2"
                                          style={{ color: "blue" }}
                                          disabled={!Hdata?.isChecked}
                                        ></i>{" "}
                                      </Tooltip>
                                    </div>
                                  )}
                                  &nbsp;
                                </>
                              )}
                            {[5, 6].includes(Number(Hdata?.Status)) &&
                              buttonsData?.map(
                                (ele, index) =>
                                  ele?.AccessBy === "Not Approved" && (
                                    <>
                                      <div
                                        className="m-0 p-0"
                                        onClick={() => {
                                          setShow5({
                                            modal: true,
                                            data: Hdata?.TestIDHash,
                                            pageName: "Add Report",
                                            Printwithhead: Hdata?.Printwithhead,
                                            blockUpload:
                                              Hdata?.Status == 5 ||
                                                Hdata?.Status == 6
                                                ? true
                                                : false,
                                          });
                                        }}
                                      >
                                        <Tooltip
                                          label={
                                            Hdata?.Status == 5 ||
                                              Hdata?.Status == 6
                                              ? t("Show Report")
                                              : t("Add Report")
                                          }
                                        >
                                          <i
                                            className="bi bi-file-earmark-pdf m-0 text-icon-size"
                                            style={{ color: "red" }}
                                            disabled={!Hdata?.isChecked}
                                          ></i>{" "}
                                        </Tooltip>
                                      </div>
                                      &nbsp;
                                      <div
                                        className=" m-0 p-0"
                                        onClick={() => {
                                          setShow5({
                                            modal: true,
                                            data: Hdata?.TestIDHash,
                                            pageName: "Add Attachment",
                                            blockUpload:
                                              Hdata?.Status == 5 ||
                                                Hdata?.Status == 6
                                                ? true
                                                : false,
                                          });
                                        }}
                                      >
                                        {" "}
                                        <Tooltip
                                          label={
                                            Hdata?.Status == 5 ||
                                              Hdata?.Status == 6
                                              ? t("Show Attachment")
                                              : t("Add Attachment")
                                          }
                                        >
                                          <i
                                            className="bi bi-file-earmark-image m-0 text-icon-size"
                                            style={{ color: "#07b023" }}
                                            disabled={!Hdata?.isChecked}
                                          ></i>{" "}
                                        </Tooltip>
                                      </div>
                                      &nbsp; &nbsp;
                                      {loading ? (
                                        <Loading />
                                      ) : (
                                        <div
                                          className=" m-0 p-0"
                                          onClick={() => {
                                            setReason({
                                              ...reason,
                                              HoldShow: true,
                                              Hdata: Hdata,
                                              type: "Not Approved",
                                            });
                                          }}
                                        >
                                          <Tooltip label={ele?.AccessBy}>
                                            {" "}
                                            <i
                                              className="bi bi-x-octagon text-icon-size m-0"
                                              style={{ color: "#b06605" }}
                                              type="button"
                                              disabled={!Hdata?.isChecked}
                                              id="btnMainList"
                                              key={index}
                                            ></i>
                                          </Tooltip>
                                        </div>
                                      )}
                                    </>
                                  )
                              )}
                            &nbsp;
                            {Hdata?.Status === 11 &&
                              buttonsData?.map(
                                (ele, index) =>
                                  ele?.AccessBy === "Unhold" && (
                                    <>
                                      {loading ? (
                                        <Loading />
                                      ) : (
                                        <div
                                          className="m-0 p-0"
                                          onClick={() =>
                                            handleResultSubmit(
                                              ele?.AccessBy,
                                              Hdata
                                            )
                                          }
                                        >
                                          <Tooltip
                                            label={`${ele?.AccessBy} ( Hold Reason : ${Hdata?.Hold_Reason} )`}
                                          >
                                            <i
                                              className="bi bi-play-circle m-0 text-icon-size ml-2"
                                              style={{
                                                color: "green",
                                              }}
                                              type="button"
                                              id="btnMainList"
                                              disabled={!Hdata?.isChecked}
                                              key={index}
                                            ></i>
                                          </Tooltip>
                                        </div>
                                      )}
                                    </>
                                  )
                              )}
                            {![11, 5, 6].includes(Hdata?.Status) &&
                              buttonsData?.map(
                                (ele, index) =>
                                  ele?.AccessBy === "Hold" && (
                                    <>
                                      {loading ? (
                                        <Loading />
                                      ) : (
                                        <div
                                          onClick={() => {
                                            setReason({
                                              ...reason,
                                              HoldShow: true,
                                              Hdata: Hdata,
                                              type: "Hold",
                                            });
                                          }}
                                        >
                                          <Tooltip label={ele?.AccessBy}>
                                            <i
                                              className="bi bi-stop-circle m-0 text-icon-size ml-2"
                                              style={{
                                                color: "#d9070e",
                                              }}
                                              type="button"
                                              id="btnMainList"
                                              key={index}
                                              disabled={!Hdata?.isChecked}
                                            ></i>
                                          </Tooltip>
                                        </div>
                                      )}
                                    </>
                                  )
                              )}
                            &nbsp;
                            {[3, 13, 14, 10, 20].includes(Hdata.Status) && (
                              <div
                                onClick={() =>
                                  setShow7({ modal: true, data: Hdata })
                                }
                              >
                                <Tooltip label={"Rerun"}>
                                  <i
                                    className="bi bi-arrow-repeat m-0 text-icon-size ml-1 mr-1"
                                    style={{ color: "#327570 " }}
                                    disabled={!Hdata?.isChecked}
                                  ></i>
                                </Tooltip>
                              </div>
                            )}
                            &nbsp;&nbsp;
                            <div
                              onClick={() => {
                                AuditTrailResponce(Hdata);
                              }}
                            >
                              <Tooltip label={"Audit Trail"}>
                                <i
                                  className="bi bi-table m-0 text-icon-size mr-2"
                                  style={{ color: "blue" }}
                                ></i>
                              </Tooltip>
                            </div>
                            &nbsp;&nbsp;
                            {[3, 13, 14, 10, 20].includes(Hdata.Status) && (
                              <div
                                onClick={() => {
                                  setShowReject({
                                    show: true,
                                    data: {
                                      TestID: Hdata?.TestID,
                                      LedgerTransactionID:
                                        Hdata?.LedgerTransactionID,
                                      VisitNo: Hdata?.LedgerTransactionNo,
                                      Test: Hdata?.PackageName,
                                      CentreID: ResultData[0]?.CentreID,
                                      SINNo: Hdata?.SINNO,
                                      PatientID: ResultData[0]?.PatientID,
                                    },
                                  });
                                }}
                              >
                                <Tooltip label={"Reject"}>
                                  <i
                                    className="bi bi-ban m-0 text-icon-size mr-2"
                                    style={{ color: "red" }}
                                  ></i>
                                </Tooltip>
                              </div>
                            )}
                            {Hdata?.ShowDLC == 1 && (
                              <>
                                {/* <input
                                  type="checkbox"
                                  checked={Hdata?.IsDLCCheck}
                                  onChange={(e) => onChangeDLC(e, Hindex)}
                                />
                                <label className="mb-1 mx-1" style={{ alignSelf: "flex-end" }}>
                                  {t("DLC Check")}
                                </label> */}
                                <Form.Check
                                  type="switch"
                                  id="DLC Check"
                                  name="DLC Check"
                                  label={t("DLC Check")}
                                  checked={Hdata?.IsDLCCheck}
                                  onChange={(e) => onChangeDLC(e, Hindex)}
                                  className="my-1 dlcCheckBox"
                                />
                              </>
                            )}
                          </div>
                        </td>
                        <td colSpan={"4"}>
                          {Hindex == 0 &&
                            // <Tooltip
                            //   label={"Reload Range"}
                            //   children={

                            //   }
                            // />

                            Hdata?.Status == 10 &&
                            globalReportType && (
                              <Button className="rounded">
                                <span
                                  onClick={() => reloadRange(ResultTestData)}
                                >
                                  <i className="bi bi-arrow-clockwise mb-0"></i>
                                </span>
                              </Button>
                            )}
                        </td>
                        {/* <td data-title={t("Flag")}>
                      {[3, 13, 14, 10].includes(Hdata.Status) && (
                        <button
                          className="btn btn-sm btn-warning"
                          disabled={!Hdata?.isChecked}
                          onClick={() => setShow7({ modal: true, data: Hdata })}
                        >
                          Rerun
                        </button>
                      )}
                    </td>
                    <td
                      data-title={t("Audit Trail")}
                      style={{
                        cursor: "pointer",
                        textDecoration: "underline",
                      }}
                      className="text-center text-primary"
                    >
                      <span
                        onClick={() => {
                          AuditTrailResponce(Hdata);
                        }}
                      >
                        View
                      </span>
                    </td> */}
                      </tr>
                      {ResultData?.map((datanew, index) => (
                        <>
                          {Hdata.TestID === datanew.TestID && (
                            <tr
                              key={index}
                              style={{
                                backgroundColor:
                                  datanew?.IsLabOutSource == "True"
                                    ? "pink"
                                    : "",
                              }}
                            >
                              <td data-title={t("#")} style={{ width: "15px" }}>
                                <input
                                  type="checkbox"
                                  checked={datanew?.isChecked}
                                  onChange={(e) => handleCheckbox(e, index)}
                                  name="isChecked"
                                  disabled={true}
                                />
                              </td>
                              <td
                                data-title={t("TestName")}
                                style={{
                                  whiteSpace: "normal",
                                  wordBreak: "break-word",
                                }}
                              >
                                <span
                                  style={{ cursor: "pointer" }}
                                  data-toggle="tooltip"
                                  data-placement="top"
                                  title={
                                    datanew?.isMandatory === 1
                                      ? "Required Field"
                                      : datanew?.dlcCheck === 1
                                        ? "DLC Parameter"
                                        : datanew?.Formula != ""
                                          ? "Calculated Field"
                                          : ""
                                  }
                                  className={`
                                    ${isTGGreaterThan400?.value > 400 && (datanew?.IsLDL == 1 || datanew?.IsVLDL == 1 || datanew?.IsTG == 1) ? "required_forvldl" : ""} 
                                    ${datanew?.isMandatory === 1 && "required-fields "} 
                                    ${datanew?.dlcCheck === 1 && "bg-yellow-new "}`}
                                >
                                  <span
                                    className={`
                                      ${datanew?.Formula !== "" && "Formula"}
                                      ${isTGGreaterThan400?.value > 400 && (datanew?.IsLDL == 1 || datanew?.IsVLDL == 1 || datanew?.IsTG == 1) ? "required_forvldl" : ""} 
                                    `}
                                    style={{
                                      fontWeight:
                                        datanew?.TestName ===
                                          "Differential Leucocyte Count (DLC) (Method-DHSS)" ||
                                          datanew.Header == 1
                                          ? "bold"
                                          : "normal",

                                      fontStyle:
                                        datanew?.TestName ===
                                          "Differential Leucocyte Count (DLC) (Method-DHSS)" ||
                                          datanew.Header == 1
                                          ? "italic"
                                          : "normal",
                                      display: "inline-block",
                                    }}
                                  >
                                    {datanew?.TestName}
                                  </span>
                                </span>
                              </td>
                              {isPreviousResultAvailable && (
                                <td
                                  data-title={t("Previous Value")}
                                  style={{
                                    wordWrap: "break-word",
                                    whiteSpace: "normal",
                                  }}
                                >
                                  {datanew.OldValue}
                                </td>
                              )}
                              {datanew?.Header === 0 ? (
                                <>
                                  {["2", "3"].includes(datanew?.ReportType) ? (
                                    <td
                                      style={{
                                        fontSize: "15px",
                                        cursor: "pointer",
                                      }}
                                      onClick={() =>
                                        setShow3({
                                          modal: true,
                                          data: datanew,
                                        })
                                      }
                                      data-title={t("Action")}
                                    >
                                      <Button title="Add Comment">
                                        <i
                                          className="fa fa-plus plusSign"
                                          aria-hidden="true"
                                          onClick={() =>
                                            setShow2({
                                              moadal: true,
                                              data: {
                                                ...datanew,
                                                pageName: "Single",
                                              },
                                            })
                                          }
                                        ></i>
                                      </Button>
                                    </td>
                                  ) : datanew?.dlcCheck === 1 ? (
                                    datanew?.IsHelpMenu === 0 ?
                                      (
                                        <td data-title={t("Value")}>
                                          <input
                                            type="number"
                                            className={`form-control input-sm resultInput ${(datanew?.MaxValue != "0" ||
                                              datanew?.MinValue != "0") &&
                                              parseFloat(datanew?.Value) >
                                              parseFloat(datanew?.MaxValue)
                                              ? "high"
                                              : parseFloat(datanew?.Value) <
                                                parseFloat(datanew?.MinValue)
                                                ? "low"
                                                : ""
                                              } `}
                                            name="Value"
                                            autoComplete="off"
                                            disabled={
                                              // If TG > 400 and this is LDL/VLDL, allow editing
                                              SkipTestCentreResultEntry == 1 ? false :
                                                isTGGreaterThan400.isTG &&
                                                  parseFloat(
                                                    isTGGreaterThan400.value
                                                  ) > 400 &&
                                                  (datanew?.IsLDL === 1 ||
                                                    datanew?.IsVLDL === 1)
                                                  ? false
                                                  : (datanew?.CanSaveAmendment ===
                                                    0 &&
                                                    datanew?.MacReading) ||
                                                  (datanew?.TestCentreID !== 0 &&
                                                    datanew?.TestCentreID !==
                                                    globalCentre)
                                            }
                                            value={datanew?.Value}
                                            onChange={(e) =>
                                              handleValueChange(index, e.target.value, datanew?.TestID)
                                            }
                                            onKeyDown={(e) =>
                                              handleKeyUp(e, index)
                                            }
                                            ref={(el) =>
                                              (myRefs.current[index] = el)
                                            }
                                          />
                                        </td>
                                      ) :
                                      (
                                        <td data-title={t("Value")}>
                                          <input
                                            type="text"
                                            className={`form-control input-sm resultInput ${(datanew?.MaxValue != "0" ||
                                              datanew?.MinValue != "0") &&
                                              parseFloat(datanew?.Value) >
                                              parseFloat(datanew?.MaxValue)
                                              ? "high"
                                              : parseFloat(datanew?.Value) <
                                                parseFloat(datanew?.MinValue)
                                                ? "low"
                                                : ""
                                              }`}
                                            name="Value"
                                            value={datanew?.Value}
                                            disabled={
                                              // If TG > 400 and this is LDL/VLDL, allow editing
                                              SkipTestCentreResultEntry == 1 ? false :
                                                isTGGreaterThan400.isTG &&
                                                  parseFloat(
                                                    isTGGreaterThan400.value
                                                  ) > 400 &&
                                                  (datanew?.IsLDL === 1 ||
                                                    datanew?.IsVLDL === 1)
                                                  ? false
                                                  : (datanew?.CanSaveAmendment ===
                                                    0 &&
                                                    datanew?.MacReading) ||
                                                  (datanew?.TestCentreID !== 0 &&
                                                    datanew?.TestCentreID !==
                                                    globalCentre)
                                            }
                                            onChange={(e) =>
                                              handleValueChange(index, e.target.value, datanew?.TestID)
                                            }
                                            onKeyDown={(e) =>
                                              handleKeyUp(e, index)
                                            }
                                            autoComplete="off"
                                            ref={(el) =>
                                              (myRefs.current[index] = el)
                                            }
                                          />
                                        </td>
                                      )
                                  ) : datanew?.IsHelpMenu === 0 ? (
                                    <td data-title={t("Value")}>
                                      <input
                                        type="text"
                                        className={`form-control input-sm resultInput ${(datanew?.MaxValue != "0" ||
                                          datanew?.MinValue != "0") &&
                                          parseFloat(datanew?.Value) >
                                          parseFloat(datanew?.MaxValue)
                                          ? "high"
                                          : parseFloat(datanew?.Value) <
                                            parseFloat(datanew?.MinValue)
                                            ? "low"
                                            : ""
                                          }`}
                                        name="Value"
                                        disabled={
                                          // If TG > 400 and this is LDL/VLDL, allow editing
                                          SkipTestCentreResultEntry == 1 ? false :
                                            isTGGreaterThan400.isTG &&
                                              parseFloat(isTGGreaterThan400.value) >
                                              400 &&
                                              (datanew?.IsLDL === 1 ||
                                                datanew?.IsVLDL === 1)
                                              ? false
                                              : (datanew?.CanSaveAmendment ===
                                                0 &&
                                                datanew?.MacReading) ||
                                              (datanew?.TestCentreID !== 0 &&
                                                datanew?.TestCentreID !==
                                                globalCentre)
                                        }
                                        value={datanew?.Value}
                                        onChange={(e) =>
                                          handleValueChange(index, e.target.value, datanew?.TestID)
                                        }
                                        onKeyDown={(e) =>
                                          handleKeyUp(e, index)
                                        }
                                        autoComplete="off"
                                        ref={(el) =>
                                          (myRefs.current[index] = el)
                                        }
                                      />
                                    </td>
                                  ) : (
                                    <td data-title={t("Value")}>
                                      <div style={{ position: "relative" }}>
                                        <input
                                          type="text"
                                          className={`form-control input-sm resultInput ${(datanew?.MaxValue != "0" ||
                                            datanew?.MinValue != "0") &&
                                            parseFloat(datanew?.Value) >
                                            parseFloat(datanew?.MaxValue)
                                            ? "high"
                                            : parseFloat(datanew?.Value) <
                                              parseFloat(datanew?.MinValue)
                                              ? "low"
                                              : ""
                                            }`}
                                          name="Value"
                                          autoComplete="off"
                                          disabled={
                                            // If TG > 400 and this is LDL/VLDL, allow editing
                                            SkipTestCentreResultEntry == 1 ? false :
                                              isTGGreaterThan400.isTG &&
                                                parseFloat(
                                                  isTGGreaterThan400.value
                                                ) > 400 &&
                                                (datanew?.IsLDL === 1 ||
                                                  datanew?.IsVLDL === 1)
                                                ? false
                                                : (datanew?.CanSaveAmendment ===
                                                  0 &&
                                                  datanew?.MacReading) ||
                                                (datanew?.TestCentreID !== 0 &&
                                                  datanew?.TestCentreID !==
                                                  globalCentre)
                                          }
                                          value={datanew?.Value}
                                          onChange={(e) => {
                                            handleValueChange(index, e.target.value, datanew?.TestID);
                                            setHiddenDropDownHelpMenu(false);
                                          }}
                                          onKeyDown={(e) => {
                                            getHelpMenuData(
                                              e,
                                              datanew?.labObservationID
                                            );
                                            handleIndex(e, index);
                                            handleKeyUp(e, index)
                                          }}
                                          ref={(el) =>
                                            (myRefs.current[index] = el)
                                          }
                                          onBlur={() =>
                                            setTimeout(() => {
                                              setHiddenDropDownHelpMenu(false);
                                            }, [1000])
                                          }
                                          style={{
                                            backgroundImage: `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" fill="%23000" height="16" width="16" viewBox="0 0 24 24"><path d="M7 10l5 5 5-5" stroke-width="2" stroke="black" fill="black"/></svg>')`,
                                            backgroundPosition:
                                              "calc(100% - 10px) center", // Adjust arrow position
                                            backgroundRepeat: "no-repeat",
                                            paddingRight: "30px", // Space for the arrow
                                          }}
                                          onClick={(e) => {
                                            setHiddenDropDownHelpMenu(
                                              !HiddenDropDownHelpMenu
                                            );
                                            getHelpMenuData(
                                              e,
                                              datanew?.labObservationID
                                            );
                                          }}
                                        />
                                        {helpmenu.length > 0 &&
                                          helpmenu[0]?.Value ==
                                          datanew?.labObservationID &&
                                          HiddenDropDownHelpMenu && (
                                            <ul
                                              className={"suggestion-data-help"}
                                              style={{
                                                width: "100%",
                                                position: "absolute",
                                                right: "0px",
                                                border: "1px solid #dddfeb",
                                              }}
                                            >
                                              {helpmenu.map(
                                                (data, helpmenuindex) => (
                                                  <li
                                                    key={helpmenuindex}
                                                    onClick={() => {
                                                      // Set the selected value from dropdown
                                                      handleListSearch(
                                                        data,
                                                        "Value",
                                                        index
                                                      );
                                                      // Close the dropdown after selection
                                                      setHiddenDropDownHelpMenu(
                                                        false
                                                      );
                                                    }}
                                                    className={`${helpmenuindex === indexMatch ? "matchIndex" : ""}`}
                                                  >
                                                    {data?.label}
                                                  </li>
                                                )
                                              )}
                                            </ul>
                                          )}
                                      </div>
                                    </td>
                                  )}
                                  {["2", "3"].includes(datanew?.ReportType) ? (
                                    <td></td>
                                  ) : (
                                    <td
                                      style={{ position: "relative" }}
                                      data-title={t("Action")}
                                    >
                                      <div className="d-flex align-items-center">
                                        <div
                                          className="mx-2"
                                          style={{
                                            cursor: "pointer",
                                            fontSize: "15px",
                                          }}
                                          onClick={() =>
                                            setShow2({
                                              moadal: true,
                                              data: {
                                                ...datanew,
                                                pageName: "Single",
                                              },
                                            })
                                          }
                                        >
                                          <Tooltip label={"Add Comment"}>
                                            {" "}
                                            <i
                                              className="fa fa-plus plusSign"
                                              aria-hidden="true"
                                            ></i>
                                          </Tooltip>{" "}
                                        </div>
                                        <span
                                          className="fa fa-exclamation-triangle mx-2"
                                          aria-hidden="true"
                                          style={{
                                            cursor: "pointer",
                                            fontSize: "15px",
                                            width: "35px",
                                            padding: "5px 10px",
                                          }}
                                          onMouseEnter={() => {
                                            setMouseHover({
                                              index: index,
                                              data: [],
                                            });
                                            DeltaResponse(datanew);
                                          }}
                                          onMouseLeave={() => {
                                            setMouseHover({
                                              index: -1,
                                              data: [],
                                            });
                                            setPreviousTestResult([]);
                                          }}
                                        >
                                          {mouseHover?.index === index &&
                                            PreviousTestResult.length > 0 && (
                                              <div
                                                style={{
                                                  position: "absolute",
                                                  top: "-100%",
                                                  left: "0",
                                                  width: "600px",
                                                  zIndex: 999999,
                                                  height: "auto",
                                                  overflow: "visible",
                                                  backgroundColor: "white",
                                                  color: "black",
                                                  fontFamily: "Source Sans Pro",
                                                  fontWeight: 500,
                                                  border: "1px solid #ddd",
                                                }}
                                              // className="resultEntryCssTable"
                                              >
                                                <table>
                                                  <thead>
                                                    <tr>
                                                      <th>Booking Date</th>
                                                      <th>Approved Date</th>
                                                      <th>Test</th>
                                                      <th>Value</th>
                                                      <th>Unit</th>
                                                      <th>Min</th>
                                                      <th>Max</th>
                                                    </tr>
                                                  </thead>
                                                  <tbody>
                                                    {PreviousTestResult.map(
                                                      (ele, index) => (
                                                        <tr
                                                          key={index}
                                                          style={{
                                                            background:
                                                              "skyBlue",
                                                          }}
                                                        >
                                                          <td
                                                            data-title="BookingDate"
                                                            style={{
                                                              width: "120px",
                                                            }}
                                                          >
                                                            {dateConfig(
                                                              ele?.BookingDate
                                                            )}
                                                          </td>
                                                          <td
                                                            data-title="BookingDate"
                                                            style={{
                                                              width: "120px",
                                                            }}
                                                          >
                                                            {dateConfig(
                                                              ele?.ApprovedDate
                                                            )}
                                                          </td>
                                                          <td data-title="LabObservationName">
                                                            {ele?.LabObservationName
                                                              ? ele?.LabObservationName
                                                              : "-"}
                                                          </td>
                                                          <td data-title="Value">
                                                            {ele?.Value
                                                              ? ele?.Value
                                                              : "-"}
                                                          </td>
                                                          <td data-title="ReadingFormat">
                                                            {ele?.ReadingFormat
                                                              ? ele?.ReadingFormat
                                                              : "-"}
                                                          </td>
                                                          <td data-title="MinValue">
                                                            {ele?.MinValue
                                                              ? ele?.MinValue
                                                              : "-"}
                                                          </td>
                                                          <td data-title="MaxValue">
                                                            {ele?.MaxValue
                                                              ? ele?.MaxValue
                                                              : "-"}
                                                          </td>
                                                        </tr>
                                                      )
                                                    )}
                                                  </tbody>
                                                </table>
                                              </div>
                                            )}
                                        </span>
                                      </div>
                                    </td>
                                  )}
                                  {["2", "3"].includes(datanew?.ReportType) ? (
                                    <td> &nbsp;</td>
                                  ) : (
                                    <td
                                      className="w-50p"
                                      data-title={t("Flag")}
                                    >
                                      <select
                                        value={
                                          datanew?.IsHelpMenu &&
                                            datanew?.HelpMenuBold
                                            ? ""
                                            : datanew?.Flag
                                        }
                                        disabled
                                      >
                                        <option hidden></option>
                                        <option value="Normal">Normal</option>
                                        <option value="High">High</option>
                                        <option value="Low">Low</option>
                                      </select>
                                    </td>
                                  )}
                                  <td data-title={t("Omit")}>
                                    <input
                                      type="checkbox"
                                      checked={datanew?.isOmit}
                                      onChange={(e) => handleCheckbox(e, index)}
                                      name="isOmit"
                                      disabled={
                                        datanew?.TestCentreID == 0 ||
                                          datanew?.TestCentreID == globalCentre
                                          ? false
                                          : true
                                      }
                                    />
                                  </td>
                                  <td data-title={t("Critical")}>
                                    <input
                                      type="checkbox"
                                      checked={datanew?.IsCriticalCheck}
                                      onChange={(e) => handleCheckbox(e, index)}
                                      name="IsCriticalCheck"
                                      disabled={
                                        datanew?.TestCentreID == 0 ||
                                          datanew?.TestCentreID == globalCentre
                                          ? false
                                          : true
                                      }
                                    />
                                  </td>
                                  <td
                                    data-title={t("Mac Reading")}
                                    className={`Status-${datanew?.Status}`}
                                    style={{
                                      wordWrap: "break-word",
                                      whiteSpace: "normal",
                                    }}
                                  >
                                    {" "}
                                    {datanew?.MacReading}&nbsp;
                                  </td>
                                  <td
                                    data-title={t("MachineName")}
                                    style={{
                                      wordWrap: "break-word",
                                      whiteSpace: "normal",
                                    }}
                                  >
                                    {" "}
                                    {datanew?.machinename}&nbsp;
                                  </td>

                                  {["2", "3"].includes(datanew?.ReportType) ? (
                                    <td data-title=""> &nbsp;</td>
                                  ) : (
                                    <td
                                      data-title={t("Method Name")}
                                      style={{
                                        wordWrap: "break-word",
                                        whiteSpace: "normal",
                                      }}
                                    >
                                      {datanew?.MethodName} &nbsp;
                                    </td>
                                  )}

                                  {["2", "3"].includes(datanew?.ReportType) ? (
                                    <td data-title=""> &nbsp;</td>
                                  ) : (
                                    <td data-title="DisplayReading">
                                      <div
                                        style={{
                                          display: "flex",
                                          justifyContent: "space-between",
                                        }}
                                      >
                                        <div
                                          style={{
                                            wordWrap: "break-word",
                                            whiteSpace: "normal",
                                          }}
                                        >
                                          {datanew?.DisplayReading}
                                        </div>{" "}
                                        <div>
                                          {" "}
                                          {["2", "3"].includes(
                                            datanew?.ReportType
                                          ) ? (
                                            <div data-title=""> &nbsp;</div>
                                          ) : (
                                            <>
                                              {/* {accessRight?.includes("17") && ( */}
                                              <div
                                                onClick={() =>
                                                  setShow({
                                                    moadal: true,
                                                    data: datanew,
                                                  })
                                                }
                                              >
                                                <Tooltip label={"Edit"}>
                                                  <i
                                                    className="bi bi-pencil-square m-0 mr-3 text-icon-size-edit"
                                                    style={{
                                                      color: "#274C77",
                                                    }}
                                                  ></i>{" "}
                                                </Tooltip>
                                              </div>
                                              {/* )} */}
                                            </>
                                          )}
                                        </div>
                                      </div>{" "}
                                      &nbsp;
                                    </td>
                                  )}
                                  {["2", "3"].includes(datanew?.ReportType) ? (
                                    <td data-title=""> &nbsp;</td>
                                  ) : (
                                    <td data-title={t("ReadingFormat")}>
                                      <div
                                        style={{
                                          wordWrap: "break-word",
                                          whiteSpace: "normal",
                                        }}
                                      >
                                        {" "}
                                        {datanew?.ReadingFormat}
                                      </div>{" "}
                                      &nbsp;
                                    </td>
                                  )}
                                  <td
                                    data-title={t("Reading 1")}
                                    style={{
                                      wordWrap: "break-word",
                                      whiteSpace: "normal",
                                    }}
                                  >
                                    {datanew?.Reading1} &nbsp;
                                  </td>
                                  <td
                                    data-title={t("Reading 2")}
                                    style={{
                                      wordWrap: "break-word",
                                      whiteSpace: "normal",
                                    }}
                                  >
                                    {datanew?.Reading2} &nbsp;
                                  </td>
                                </>
                              ) : (
                                <td colSpan="12" data-title="">
                                  {" "}
                                  {(totalDlcSum > 0 && datanew.Header == 1 && Hdata?.IsDLCCheck === 1) && (
                                    <div
                                      className="mx-2 mb-0 py-0 rouned"
                                      style={{ letterSpacing: "0.4px" }}
                                    >
                                      <strong className="bg-yellow-new">
                                        Total DLC Count = {totalDlcSum?.toFixed(2)}
                                      </strong>
                                    </div>
                                  )}
                                  &nbsp;
                                </td>
                              )}
                              {/* <td colSpan="10" data-title="">
                            {" "}
                            &nbsp;
                          </td> */}
                              <td data-title="QC Data">
                                {datanew?.QCData?.split(",").map((item, index) => {
                                  const [content, status] = item.split("#");

                                  return (
                                    <div
                                      key={index}
                                      className="fw-bold mb-1"
                                      style={{
                                        // color: status === "0" ? "#ff65b2ff" : "#198754",
                                        color: "black",
                                        backgroundColor: status === "0" ? "#ff8bbcff" : "#93ffbeff",
                                        padding: "0px 2px",
                                        borderRadius: "4px",
                                        fontSize: "12px",
                                        border: `1px solid ${status === "0" ? "#ffc1e3" : "#c3e6cb"}`
                                      }}
                                    >
                                      {content}
                                    </div>
                                  );
                                })}
                              </td>
                            </tr>
                          )}
                        </>
                      ))}
                    </>
                  ))}
                </tbody>
              </ResultEntryTableCustom>
            </div>
            <div className=" m-0 p-0 pb-2" style={{ zIndex: 0 }}>
              <div
                className="row mt-3 mr-1  d-flex flex-wrap"
                style={{ textWrap: "avoid" }}
              >
                {loading ? (
                  <div className="mx-3">
                    <Loading />
                  </div>
                ) : (
                  <>

                    {["", 3, 10, 11, 13, 14, 15, 20, 5, 6, 18].includes(
                      statusValue
                    ) && (
                        <div
                          className={
                            buttonsData?.some(
                              (ele) => ele?.AccessBy === "Dual Authentication"
                            ) && checkDualAuthentication
                              ? "col-sm-2"
                              : "col-sm-1"
                          }
                        >
                          <div className="p-inputgroup d-flex">
                            <button
                              style={{
                                backgroundColor: "Pink",
                                width:
                                  buttonsData?.some(
                                    (ele) =>
                                      ele?.AccessBy === "Dual Authentication"
                                  ) && checkDualAuthentication
                                    ? "30%"
                                    : "100%",
                              }}
                              className="btn btn-block btn-sm"
                              onClick={() => handleResultSubmit("Save")}
                            >
                              {t("Save")}
                            </button>
                            {buttonsData?.some(
                              (ele) => ele?.AccessBy === "Dual Authentication"
                            ) &&
                              checkDualAuthentication && (
                                <div style={{ width: "70%", marginLeft: "10px" }}>
                                  {buttonsData
                                    ?.filter(
                                      (ele) =>
                                        ele?.AccessBy === "Dual Authentication"
                                    )
                                    .map((ele, index) => (
                                      <button
                                        key={index}
                                        style={{
                                          backgroundColor: "#fc3a3d",
                                          color: "white",
                                        }}
                                        className="btn btn-block btn-sm"
                                        onClick={() =>
                                          handleResultSubmit(ele?.AccessBy)
                                        }
                                      >
                                        {t("Dual Authentication")}
                                      </button>
                                    ))}
                                </div>
                              )}
                          </div>
                        </div>
                      )}

                    {!id && (
                      <div className="col-sm-1">
                        <button
                          className="btn btn-dark btn-block btn-sm"
                          type="button"
                          id="btnMainList"
                          onClick={() => {
                            setResultData([]);
                            setResultTestData([]);
                            setCopyPayload({});
                            // GetResultEntry()
                            TableData(document.getElementById("SampleStatus")?.value ??
                              formData?.SampleStatus)

                          }}
                        >
                          {t("Main List")}
                        </button>
                      </div>
                    )}
                    <div className="col-sm-2">
                      <SelectBox
                        options={[
                          { label: "Select Doctor", value: "0" },
                          ...withMappedDoctorOption(
                            doctorAdmin,
                            parseMappedSignature(ResultTestData[0]?.DefaultSignatureID)
                          ),
                        ]}
                        selectedValue={ResultTestData[0]?.ApprovedBy}
                        id="ApprovedBy"
                        lable="Doctor"
                        name="ApprovedBy"
                        onChange={handleDoctorName}
                        isDisabled={
                          resolveApprovalDoctor({
                            defaultSignatureID: ResultTestData[0]?.DefaultSignatureID,
                            currentApprovedBy: ResultTestData[0]?.ApprovedBy,
                            doctorAdmin,
                          }).locked
                        }
                      />
                    </div>
                    <div className="col-sm-1">
                      <SelectBox
                        options={machine}
                        id="Machine"
                        name="Machine"
                        selectedValue={ResultData[0]?.MacID}
                        onChange={(e) =>
                          GetResultEntry(
                            {
                              TestID:
                                redata[ResultData[0]?.currentIndex]?.TestID,
                              LedgerTransactionID: "",
                              DepartmentID: "",
                              symbol: "",
                              Mobile:
                                redata[ResultData[0]?.currentIndex]?.Mobile,
                              VisitNo:
                                redata[ResultData[0]?.currentIndex]?.VisitNo,
                              PEmail:
                                redata[ResultData[0]?.currentIndex]?.PEmail,
                              MacID: e?.target?.value,
                              LedgertransactionIDHash:
                                redata[ResultData[0]?.currentIndex]
                                  ?.LedgertransactionIDHash,
                              index: redata[ResultData[0]?.currentIndex]?.index,
                              ApprovedBy:
                                doctorAdmin?.length == 1
                                  ? doctorAdmin[0]?.value?.toString()
                                  : "0",
                            },
                            ResultData[0]?.currentIndex
                          )
                        }
                        lable={t("Machine Group")}
                      />
                    </div>
                    <div className="col-sm-1">
                      {PrintReportLoading ? (
                        <Loading />
                      ) : (
                        <button
                          className="btn btn-secondary btn-block btn-sm my"
                          type="button"
                          id="btnMainList"
                          onClick={() => handleReport("no", "")}
                          disabled={
                            !ResultTestData.some((ele) =>
                              [10, 6, 5].includes(ele?.Status)
                            )
                          }
                        >
                          {t("Preview")}
                        </button>
                      )}
                    </div>
                    <div className="col-sm-1">
                      {console.log("buttonsData", buttonsData)}
                      {[]}
                      {buttonsData?.map(
                        (ele, index) =>
                          ele?.AccessBy !== "Not Approved" &&
                          ele?.AccessBy !== "Unhold" &&
                          ele?.AccessBy !== "Discount Approval" &&
                          ele?.AccessBy !== "Hold" &&
                          ele?.AccessBy !== "Dual Authentication" &&
                          ele?.AccessBy !== "Allow Customize Date" && (
                            <button
                              className="btn btn-block btn-sm my"
                              style={{
                                backgroundColor: "#008000",
                                color: "white",
                              }}
                              type="button"
                              id="btnMainList"
                              key={index}
                              onClick={() => handleResultSubmit(ele?.AccessBy)}
                            >
                              {ele?.AccessBy === "Approved"
                                ? t("Approve")
                                : t(ele?.AccessBy)}
                            </button>
                          )
                      )}
                    </div>
                    <div className="col-sm-1">
                      <i
                        // className="previous roundarrow btn-success mx-2"
                        className="fa fa-chevron-left mx-2"
                        style={{
                          color: ResultData[0]?.currentIndex === 0 || id ? "gray" : "darkred",
                          cursor: ResultData[0]?.currentIndex === 0 || id ? "not-allowed" : "pointer",
                        }}
                        // 
                        onClick={() => handleArrowNavigation("prev")}
                      // disabled={
                      //   ResultData[0]?.currentIndex === 0 ? true : false || id
                      // }
                      />
                      {/* ‹
                      </i> */}
                      <i
                        // className="next roundarrow btn-success"
                        className="fa fa-chevron-right mx-2"
                        style={{
                          color: ResultData[0]?.currentIndex === redata.length - 1 || id ? "gray" : "darkred",
                          cursor: ResultData[0]?.currentIndex === redata.length - 1 || id ? "not-allowed" : "pointer",
                        }}
                        // onClick={() => {
                        //   if (ResultData[0]?.currentIndex === redata.length - 1 || id) return;
                        //   ResultData.length > 0 &&
                        //     GetResultEntry(
                        //       {
                        //         TestID:
                        //           redata[ResultData[0]?.currentIndex + 1]
                        //             ?.TestID,
                        //         LedgerTransactionID: "",
                        //         DepartmentID: "",
                        //         symbol: "",

                        //         Mobile:
                        //           redata[ResultData[0]?.currentIndex + 1]
                        //             ?.Mobile,
                        //         VisitNo:
                        //           redata[ResultData[0]?.currentIndex + 1]
                        //             ?.VisitNo,
                        //         PEmail:
                        //           redata[ResultData[0]?.currentIndex + 1]
                        //             ?.PEmail,
                        //         MacID: machine[0]?.value ?? "",
                        //         LedgertransactionIDHash:
                        //           redata[ResultData[0]?.currentIndex + 1]
                        //             ?.LedgertransactionIDHash,
                        //         isOutSource:
                        //           redata[ResultData[0]?.currentIndex + 1]
                        //             ?.isOutSource,
                        //         index:
                        //           redata[ResultData[0]?.currentIndex + 1]
                        //             ?.index,
                        //         ApprovedBy:
                        //           doctorAdmin?.length == 1
                        //             ? doctorAdmin[0]?.value?.toString()
                        //             : "0",
                        //       },
                        //       ResultData[0]?.currentIndex + 1
                        //     );
                        // }}
                        onClick={() => handleArrowNavigation("next")}
                      // disabled={
                      //   ResultData[0]?.currentIndex === redata.length - 1 ||
                      //     id
                      //     ? true
                      //     : false
                      // }
                      />
                      {/* ›
                      </button> */}
                    </div>
                    <div className="col-sm-1">
                      <button
                        className="btn  btn-block btn-success btn-sm"
                        type="button"
                        //   id="btnMainList"
                        onClick={() => handleDeltaCheckReport(ResultTestData)}
                      >
                        {" "}
                        {t("Delta Check")}
                      </button>
                    </div>
                    <div className="col-sm-1">
                      <button
                        className="btn btn-success btn-block btn-sm"
                        onClick={() => {
                          setShowPH(true);
                        }}
                      >
                        {t("Patient Details")}
                      </button>
                    </div>
                    <div className="col-sm-1">
                      <button
                        className="btn btn-danger btn-block btn-sm"
                        type="button"
                        onClick={() =>
                          setShowOldReportModal({
                            show: true,
                            data: ResultData[0]?.PatientCode,
                          })
                        }
                      >
                        {t("Old Report")}
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </>
      ) : (ReportType === "22") ? (
        <ResultAllergyVisit ResultData={ResultData} ResultTestData={ResultTestData} setShow2={setShow2} show2={show2} show3={show3}
          setShow3={setShow3}
          show={show}
          setShow={setShow}
          setShowPH={setShowPH}
          showPH={showPH}
          handleNotApproveRemark={handleNotApproveRemark}
          handleResultSubmit={handleResultSubmit}
          handleCheckboxRA={handleCheckboxRA}
          handleKeyUpRA={handleKeyUpRA}
          entryShow={entryShow}
          mandatoryIDs={mandatoryIDs}
          removeArrayAtIndex={removeArrayAtIndex}
          handleSensitivity={handleSensitivity}
          bindAllergyType={bindAllergyType}
          getEntryData={getEntryData}
          loading={loading}
          GetResultEntryCulture={GetResultEntryCulture}
          buttonsData={buttonsData}
          setResultData={setResultData}
          setMandatoryIDs={setMandatoryIDs}
          PrintReportLoading={PrintReportLoading}
          handleReport={handleReport}
          printHeader={printHeader}
          statusValue={statusValue}
          checkDualAuthentication={checkDualAuthentication}
          reData={redata}
          doctorAdmin={doctorAdmin}
          entryPayload={entryPayload}
          handleDoctorNameRA={handleDoctorNameRA}
          myRefs={myRefs}
          entry={entry}
          setResultTestData={setResultTestData}
          setEntryShow={setEntryShow}
          setEntry={setEntry}
          setInvestigationID={setInvestigationID}
          setEntryPayload={setEntryPayload}
          handleSave={handleSave}
          onArrowNavigate={handleArrowNavigation}

        />
      ) : (ReportType === "21") ? (
        <ResultCultureVisit />
      ) : (
        null
      )}

      {showOmitModal && (
        <Dialog
          header={""}
          onHide={() => setShowOmitModal(false)}
          visible={showOmitModal}
          className={theme}
          style={{ width: "50vw" }}
        >
          <div className="box-success px-2">
            <div className="row">
              <label className="col-sm-12 text-center" htmlFor="">
                <span>Omitted Tests</span>
              </label>
            </div>
            <div>
              <p>You have marked omit on:</p>
              <ul>
                {omitTests.map((test, i) => (
                  <li key={i}>{test.TestName}</li>
                ))}
              </ul>
            </div>
            <div
              className="row d-flex justify-content-end"
              style={{ gap: "10px" }}
            >
              <button
                className="btn btn-primary"
                style={
                  modalAction === "Approved"
                    ? {
                      backgroundColor: "green",
                      borderColor: "green",
                      color: "white",
                    }
                    : {}
                }
                onClick={() => {
                  setShowOmitModal(false);
                  handleResultSubmit(
                    modalAction === "Save"
                      ? "Save"
                      : modalAction === "Approved"
                        ? "Approved"
                        : null,
                    null,
                    true
                  );
                }}
              >
                {modalAction === "Save"
                  ? "Save"
                  : modalAction === "Approved"
                    ? "Approved"
                    : null}
              </button>
              <button
                className="btn btn-secondary"
                style={{ backgroundColor: "gray" }}
                onClick={() => setShowOmitModal(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </Dialog>
      )}
    </>
  );
};

export default ResultEntry;
