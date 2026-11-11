import React, { useEffect, useMemo, useRef, useState } from "react";
import ReactDOM from "react-dom";
import {
  DateTypeSearch2,
  defaultSearchTypes,
  Flag,
  getStatusColor,
  Order,
  SampleStatus,
  SearchBy,
  // SearchBy2,
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
  parseAwsKeys,
  ExportToExcel,
} from "../../utils/helpers";
import { sanitizeLabReportHtml } from "../../utils/sanitizeLabReportHtml";
import "../../utils/sanitizeLabReportHtml.css";
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
import PatientCallLogModal from "../utils/PatientCallLogModal";

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
import NearTatModal from "../utils/UploadFileModal/NearTatModal";
import { logoList } from "../../utils/utils";
import PdfPreviewModal from "../utils/PdfPreviewModal";
import PdfViewer from "../Components/PdfViewer";
// import Urgent from ".././Images/urgent.gif";
import AddendumModal from "../utils/AddendumModal";
import UnapprovedReportModal from "../utils/UnapprovedReportModal";
import HistoImagesModal from "../utils/HistoImagesModal";
import PageControlGear from "../../components/PageGearModel/PageControlGear";
import Pagination from "../../Pagination/Pagination";
import { SelectBoxWithCheckbox } from "../../components/formComponent/MultiSelectBox";
import FullTextEditor from "../../components/formComponent/TextEditor";
import AddRemark from "../utils/AddRemark";
import { FaEye, FaPlus } from "react-icons/fa";
import { Tooltip as ReactTooltip } from "react-tooltip";
import { RemarkTooltip } from "../utils/RemarkTooltip";
import DispatchPatientDetailModal from "../utils/DispatchPatientDetailModal";
import { CustomButton, SearchButton } from "../../components/UI/CustomButton";
import LabIssueModal from "../utils/LabIssueModal";
const safeParseRemarks = (val) => {
  if (!val) return [];
  if (Array.isArray(val)) return val;
  if (typeof val === "string") {
    try {
      const parsed = JSON.parse(val);
      return Array.isArray(parsed) ? parsed : [val];
    } catch {
      return [val];
    }
  }
  return [String(val)];
};

const formatActionableError = (err, fallback = "Operation could not be completed") => {
  const cid = "ERR-RE-" + Math.random().toString(36).substring(2, 8).toUpperCase();
  const serverMsg = err?.response?.data?.message || err?.response?.data?.error || err?.message;
  if (serverMsg && typeof serverMsg === "string" && !serverMsg.toLowerCase().includes("something went wrong")) {
    return `${serverMsg} (Ref: ${cid})`;
  }
  return `${fallback}. Please retry or report Ref: ${cid} to support.`;
};

const ResultEntry = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const isMobile = window.innerWidth < 768;
  const [stickyHeaderTop, setStickyHeaderTop] = useState(0);

  useEffect(() => {
    const mainHeader = document.getElementById("main-header");
    if (!mainHeader) return;
    const updateOffset = () => setStickyHeaderTop(mainHeader.offsetHeight);
    updateOffset();
    const resizeObserver = new ResizeObserver(updateOffset);
    resizeObserver.observe(mainHeader);
    return () => resizeObserver.disconnect();
  }, []);

  const [isMobileView, setIsMobileView] = useState(window.innerWidth <= 767);

  useEffect(() => {
    const handleResize = () => setIsMobileView(window.innerWidth <= 767);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const dispatch = useDispatch();
  const {
    ShowAllCheckBarcodeOption,
    ShowDefaultLoginCentre,
    HideOmitOptionatResultEntry,
    DefaultAllStatusResultEntry,
    DefaultCurrencyName,
    AllowAutoNextSaveResultEntry,
    AllowAutoNextApproveResultEntry,
    IsDefaultAscOrderatResultEntry,
    AllowAttachmentAfterApproval,
    HideResultEntryPreview,
    AllowSpecialCharacterInNumericValue,
    SkipCriticalCheck,
  } = useLocalStorage("userData", "get");
  console.log("HideResultEntryPreview", HideResultEntryPreview);
  console.log("AllowAutoNextSaveResultEntry", AllowAutoNextSaveResultEntry,AllowAttachmentAfterApproval,HideOmitOptionatResultEntry);
  const localData = useLocalStorage("userData", "get");
  console.log("localData", localData);
  const DefaultCentre = useLocalStorage("DefaultCentre", "get");
  const globalCentre = useLocalStorage("DefaultCentre", "get") || useLocalStorage("userData", "get")?.CentreID || 1;
  const CompanyID = useLocalStorage("userData", "get")?.CompanyID;
  const [tooltipPosition, setTooltipPosition] = useState({ left: 0, right: "auto" });
  const [rateTypeLoading, setRateTypeLoading] = useState(false);

  const [WardNoOptions, setWardNoOptions] = useState([]);
  const [TestSuggestion, setTestSuggestion] = useState([]);
  const [CentreData, setCentreData] = useState([]);
  const [doctorAdmin, setDoctorAdmin] = useState([]);
  const [doctorError, setDoctorError] = useState("");
  const [RateTypes, setRateTypes] = useState([]);
  const [transferCentres, setTransferCentres] = useState([]);
  const [DepartmentData, setDepartmentData] = useState([]);
  const [ResultTestData, setResultTestData] = useState([]);
  const [copyPayload, setCopyPayload] = useState({});
  const [ResultData, setResultData] = useState([]);
  const [testStatusMap, setTestStatusMap] = useState({});
  // Tracks which visit's sibling-test statuses we've already backfilled (see the
  // effect below), so opening a second tab within the same visit doesn't refire it.
  const seededSiblingVisitRef = useRef(null);
  // Every TestID that has EVER appeared live in ResultTestData during this visit
  // (not just currently-live). Once a test has been loaded live - e.g. approved -
  // its status must keep coming from the live effect below, never get clobbered by
  // the (unrefreshed) selectedData.TestDetails snapshot once you navigate away from it.
  const everLiveTestIDsRef = useRef(new Set());
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
  const [isSingleTestMode, setIsSingleTestMode] = useState(false);
  const [showTat, setShowTat] = useState(false);
  const [includeDepartment, setIncludeDepartment] = useState(false);
  const [copyLabno, setCopyLabno] = useState(false);
  const PAGE_ID = "5";
  const [show, setShow] = useState({
    moadal: false,
    data: {},
  });
  const [showColumnModal, setShowColumnModal] = useState(false);
  const [viewMode, setViewMode] = useState(isMobile ? "card" : "table");
  const [showCallLog, setShowCallLog] = useState({ modal: false, rowData: {} });
  const [showAlert, setShowAlert] = useState({
    modal: false,
    field: "",
    data: [],
    val: [],
    errorToast: "",
  });
  const [showCriticalAlert, setShowCriticalAlert] = useState({
    modal: false,
    field: "",
    data: [],
    val: [],
    errorToast: "",
    message: "",
  });
  const [invalidNegativeIndex, setInvalidNegativeIndex] = useState(null);
  const [eyeModalConfig, setEyeModalConfig] = useState({
    show: false,
    data: null,
    index: null,
  });
  const [expansionAnchor, setExpansionAnchor] = useState(null);

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
  const isIssueApplicable = (row) => Number(row?.IsLabIssueApplicable) === 1;
  const showIssuesColumn = ResultTestData?.some(isIssueApplicable) || ResultData?.some(isIssueApplicable);
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
  const [showReportModal, setShowReportModal] = useState({
    show: false,
    url: "",
  });

  const [allComments, setAllComments] = useState({});
  const [saveTemplateModal, setSaveTemplateModal] = useState({ visible: false, templateName: "", templateNameErr: "", observationData: null });
  const [allInterpretations, setAllInterpretations] = useState({});
  const [interpretationModal, setInterpretationModal] = useState({
    show: false,
    data: [],
    testName: "",
  });

  const fetchInterpretation = (id, testName) => {
    if (!id) return toast.error("No Interpretation ID provided");
    axiosInstance
      .post("RE/GetInterpretation", { interpretationID: id })
      .then((res) => {
        if (res?.data?.success && Array.isArray(res?.data?.message)) {
          setInterpretationModal({
            show: true,
            data: res?.data?.message,
            testName: testName || "",
          });
          setAllInterpretations((prev) => ({
            ...prev,
            [id]: res?.data?.message,
          }));
        }
      })
      .catch((err) => {
        console.log(err);
      });
  };





  // const formatHtmlToText = (html) => {
  //   if (!html) return "";

  //   const tempDiv = document.createElement("div");
  //   tempDiv.innerHTML = html;

  //   // Add line breaks for block elements
  //   tempDiv.querySelectorAll("div, p, br").forEach((el) => {
  //     el.insertAdjacentText("beforebegin", "\n");
  //   });

  //   return tempDiv.textContent
  //     .replace(/\n\s*\n/g, "\n") // remove extra empty lines
  //     .trim();
  // };

  const formatHtmlToText = (html) => {
    if (!html) return "";

    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = html;

    tempDiv.querySelectorAll("br").forEach((br) => br.replaceWith("\n"));

    tempDiv.querySelectorAll("div, p").forEach((el) => {
      el.insertAdjacentText("beforebegin", "\n");
    });

    return tempDiv.textContent.replace(/\n\s*\n/g, "\n").trim();
  };

  const convertTextToHtml = (text) => {
    if (!text) return "";

    return text
      .split("\n")
      .map(line => `<div>${line}</div>`)
      .join("");
  };

  const coerceToString = (v) => {
    if (typeof v === "string") return v;
    if (v == null) return "";
    if (typeof v === "object") {
      try {
        // prefer a useful toString when available
        if (typeof v.toString === "function") {
          const s = v.toString();
          if (s && s !== "[object Object]") return s;
        }
        return JSON.stringify(v);
      } catch (err) {
        return String(v);
      }
    }
    return String(v);
  };

  const insertHtmlAtCursor = (html) => {
    try {
      // fallback for execCommand in older browsers
      document.execCommand("insertHTML", false, html);
    } catch (err) {
      // noop
    }
  };

  const updateEditableHeight = (index) => {
    const el = commentRefs.current?.[index];
    if (!el) return;
    try {
      requestAnimationFrame(() => {
        el.style.overflow = "hidden";
        el.style.height = "auto";
        const newH = el.scrollHeight || el.offsetHeight || 0;
        el.style.height = newH + "px";
      });
    } catch (err) {
      el.style.height = "auto";
      el.style.height = el.scrollHeight + "px";
    }
  };

  const wrapImagesInResizable = (container, index) => {
    if (!container) return;

    // cleanup any existing observers for this index
    if (index != null && commentObservers.current[index]) {
      try {
        commentObservers.current[index].forEach((obs) => obs.disconnect());
      } catch (err) { }
      commentObservers.current[index] = [];
    }

    const imgs = Array.from(container.querySelectorAll("img"));
    imgs.forEach((img) => {
      if (img.parentElement && img.parentElement.classList.contains("re-resizable-image")) return;
      const wrapper = document.createElement("div");
      wrapper.className = "re-resizable-image";
      wrapper.contentEditable = "false";
      wrapper.style.display = "block";
      wrapper.style.width = "100%";
      wrapper.style.boxSizing = "border-box";
      wrapper.style.resize = "both";
      wrapper.style.overflow = "auto";
      wrapper.style.maxWidth = "100%";
      wrapper.style.border = "1px dashed #e0e0e0";
      wrapper.style.padding = "2px";
      wrapper.style.margin = "2px 0";

      // ensure image fits wrapper and scales
      img.style.maxWidth = "100%";
      img.style.height = "auto";
      img.style.display = "block";

      img.parentNode.insertBefore(wrapper, img);
      wrapper.appendChild(img);

      // attach ResizeObserver to keep editable height in sync
      if (index != null && typeof ResizeObserver !== "undefined") {
        const ro = new ResizeObserver(() => updateEditableHeight(index));
        try {
          ro.observe(wrapper);
          ro.observe(img);
        } catch (err) { }
        commentObservers.current[index] = commentObservers.current[index] || [];
        commentObservers.current[index].push(ro);
      }
    });

    // ensure container size is updated after wrapping
    if (index != null) updateEditableHeight(index);
  };

  const handlePaste = (e, index) => {
    if (!e.clipboardData) return;
    const items = Array.from(e.clipboardData.items || []);
    const imageItem = items.find((it) => it.type && it.type.indexOf("image") === 0);
    if (imageItem) {
      e.preventDefault();
      const file = imageItem.getAsFile();
      const reader = new FileReader();
      reader.onload = (ev) => {
        const dataUrl = ev.target.result;
        const wrapperHTML = `<div class="re-resizable-image" contenteditable="false" style="display:inline-block; resize:both; overflow:auto; max-width:100%; border:1px dashed #e0e0e0; padding:2px;"><img src="${dataUrl}" style="display:block; max-width:100%; height:auto;"/></div>`;
        insertHtmlAtCursor(wrapperHTML);

        setTimeout(() => {
          const el = commentRefs.current[index];
          if (el) {
            wrapImagesInResizable(el, index);
            const html = el.innerHTML;
            setResultTestData((prev) => {
              const updatedTestData = [...prev];
              updatedTestData[index] = {
                ...updatedTestData[index],
                COMMENT: coerceToString(html),
                PLAIN_COMMENT: formatHtmlToText(html),
              };
              return updatedTestData;
            });
          }
        }, 50);
      };
      reader.readAsDataURL(file);
      return;
    }

    // For non-image paste, let default happen then sync state
    setTimeout(() => {
      const el = commentRefs.current[index];
      if (el) {
        wrapImagesInResizable(el, index);
        const html = el.innerHTML;
        setResultTestData((prev) => {
          const updatedTestData = [...prev];
          updatedTestData[index] = {
            ...updatedTestData[index],
            COMMENT: coerceToString(html),
            PLAIN_COMMENT: formatHtmlToText(html),
          };
          return updatedTestData;
        });
      }
    }, 50);
  };


  useEffect(() => {
    const handleKeyDown = (e) => {
      if (
        showReportModal.show &&
        (e.ctrlKey || e.metaKey) &&
        (e.key === "p" || e.key === "P")
      ) {
        e.preventDefault();
      }
    };
    if (showReportModal.show) {
      document.addEventListener("keydown", handleKeyDown, { capture: true });
    }
    return () => {
      document.removeEventListener("keydown", handleKeyDown, { capture: true });
    };
  }, [showReportModal.show]);

  const [showAddendum, setShowAddendum] = useState({
    show: false,
    data: {},
  });
  const [showReport, setShowReport] = useState({
    show: false,
    data: {},
  });
  const [showHisto, setShowHisto] = useState({
    show: false,
    data: {},
  });
  const [tableData, setTableData] = useState([]);

  const [showRemark, setShowRemark] = useState(false);
  const [showPrickRemark, setShowPrickRemark] = useState(false);
  const [redata, SetReData] = useState([]);
  const theme = useLocalStorage("theme", "get");
  const handleTablePreview = (url) => {
    setShowReportModal({ show: true, url });
    setPrintReportLoading(false);
  };
  const [showdetails, setshowDetails] = useState(true);
  const [load, setLoad] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [Identity, setIdentity] = useState([]);
  const [collectionBoy, setCollectionBoy] = useState();
  const [collectionBoyList, setCollectionBoyList] = useState([]);
  const [originalTableData, setOriginalTableData] = useState([]);
  const [isPartialFilter, setIsPartialFilter] = useState(false);
  const accessRightStr = useLocalStorage("accessRight", "get") || "";
  const accessRight = accessRightStr
    ? accessRightStr?.split(",").filter(Boolean)
    : [];
  console.log("accessRight", accessRight);
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
  const [selectedData, setSelectedData] = useState({});
  const [show7, setShow7] = useState({
    modal: false,
    data: "",
    index: -1,
  });

  const [showOmitModal, setShowOmitModal] = useState(false);
  const [omitTests, setOmitTests] = useState([]);
  const [modalAction, setModalAction] = useState("");
  const [showForwardDialog, setShowForwardDialog] = useState(false);
  const [forwardFormData, setForwardFormData] = useState({
    centre: "",
    test: "",
    doctor: "",
  });
  const [labSearchData, setLabSearchData] = useState([]);
  const [previewConfig, setPreviewConfig] = useState({
    visible: false,
    url: null,
  });
  const [reportUrl, setReportUrl] = useState([]);
  const [AddendumComment, setAddendumComment] = useState([]);
  const saveBtnRef = useRef(null);
  const approveBtnRef = useRef(null);
  const commentRefs = useRef({});
  const commentObservers = useRef({});
  // Bumps on Search / Reset so a late GetResultEntry response cannot refill the grid.
  const getResultEntryReqId = useRef(0);
  //N
  const [EditTable, setEditTable] = useState(true);
  const [buildingBlocks, setBuildingBlocks] = useState([]);

  const getBuildingBlocks = () => {
    axiosInstance
      .get("BuildingBlock/GetList/0")
      .then((res) => {
        const result = res?.data?.message || res?.data?.data || res?.data;
        console.log("buildingBlocks", result);
        if (Array.isArray(result)) {
          setBuildingBlocks(result);
        }
      })
      .catch((err) => console.log(err));
  };

  console.log("saveBtnRef", saveBtnRef, approveBtnRef);

  useEffect(() => {
    if (showForwardDialog && ResultData?.[0]?.VisitNo) {
      axiosInstance
        .post("Dispatch/DynamicLabSearch", {
          LabNo: ResultData?.[0]?.VisitNo,
        })
        .then((res) => {
          setLabSearchData(res?.data?.message || []);
        })
        .catch((err) => {
          console.log(err);
          setLabSearchData([]);
        });
    }
  }, [showForwardDialog]);

  useEffect(() => {
    axiosInstance
      .get("Centre/getGlobalCentres")
      .then((res) => {
        const centres = res?.data?.message || [];
        // use whichever centre is currently selected globally (top-nav
        // centre switcher), not a centre flagged as the org-wide default
        const selectedCentre = centres.find(
          (c) => String(c?.CentreID) === String(DefaultCentre),
        );
        setDefaultCentrePrefix(selectedCentre?.Prefix || "");
      })
      .catch((err) => console.log(err));
  }, [DefaultCentre]);

  const [controllerDynamicList, setControllerDynamicList] = useState([]);
  const [controllerButtonDynamicList, setControllerButtonDynamicList] = useState([]);
  const [tabbingOrder, setTabbingOrder] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [remarkOptions, setRemarkOptions] = useState([]);

  const today = new Date();
  const { DefaultDateTypeResultEntry, MaxDateRangeatResultEntry } =
    useLocalStorage("userData", "get");
  console.log("MaxDateRangeatResultEntry", MaxDateRangeatResultEntry);
  const maxRange = Number(MaxDateRangeatResultEntry) || 15;
  let isTrueCheckBarcodeOption =
    ShowAllCheckBarcodeOption == 1 && defaultSearchTypes == "BarcodeNo";
  const [checkBarcodeOption, setCheckBarcodeOption] = useState(
    isTrueCheckBarcodeOption,
  );

  const [selectedDepartment, setSelectedDepartment] = useState([]);
  const [defaultCentrePrefix, setDefaultCentrePrefix] = useState("");
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
    DepartmentID: [],
    DoctorName: "",
    TestName: "",
    SampleStatus: DefaultAllStatusResultEntry === "1" ? "" : "3",
    DateTypeSearch: DefaultDateTypeResultEntry || "Date",
    IsUrgent: "",
    IsVip: "",
    MachineID: "",
    IsTat: 0,
    Order: IsDefaultAscOrderatResultEntry === "1" ? "ASC" : "DESC",
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
    IsForward: 0,
    IsTatSummary: 0,
    Remarks: "",
    RemarkID: 0,
    // TAT: "",
    HLMPatientType: "ALL",
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

  // Pagination 

  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [pageSize, setPageSize] = useState(100);

  const handleShowReject = () => {
    setShowReject({
      show: false,
      data: {},
    });
  };
  const handleCloseReject = () => {
    // Update rejected test color immediately in the list
    if (showReject?.data?.TestID && showReject?.data?.VisitNo) {
      SetReData((prev) =>
        prev.map((row) => {
          if (row.VisitNo === showReject.data.VisitNo) {
            return {
              ...row,
              TestDetails: row?.TestDetails?.map((test) =>
                test.TestID === showReject.data.TestID
                  ? { ...test, Status: 4 }
                  : test
              ),
            };
          }
          return row;
        })
      );
    }
    // Close the inline portal expansion
    if (eyeModalConfig.show && !eyeModalConfig.isModal) {
      setEyeModalConfig({ show: false, data: null, index: null });
      setResultTestData([]);
      setCopyPayload({});
      setAllComments({});
    }
    setResultData([]);
  };
  const handleShowAddendum = () => {
    setShowAddendum({
      show: false,
      data: {},
    });
  };
  const handleCloseAddendum = () => {
    setResultData([]);
  };
  const handleShowReport = () => {
    setShowReport({
      show: false,
      data: {},
    });
  };
  const handleShowHistoImages = () => {
    setShowHisto({
      show: false,
      data: {},
    });
  };

  const [showAddRemark, setShowAddRemark] = useState({
    modal: false,
    rowData: null,
  });

  const [reviewModal, setReviewModal] = useState({
    show: false,
    rowData: null,
    reviewText: "",
    barcodeNo: "",
    loading: false,
  });

  const closeReviewModal = () => {
    setReviewModal({
      show: false,
      rowData: null,
      reviewText: "",
      barcodeNo: "",
      loading: false,
    });
  };

  const openReviewModal = (rowData, barcodeNo) => {
    setReviewModal({
      show: true,
      rowData,
      barcodeNo: barcodeNo || "",
      reviewText: "",
      loading: false,
    });
  };

  const parseIssueRemarkList = (value) => {
    if (Array.isArray(value)) return value;
    if (!value) return [];

    if (typeof value === "string") {
      try {
        const parsedValue = JSON.parse(value);
        if (Array.isArray(parsedValue)) return parsedValue;
        if (parsedValue && typeof parsedValue === "object") return [parsedValue];
      } catch (err) {
        return value.trim() ? [{ IssueRemarks: value }] : [];
      }
    }

    return typeof value === "object" ? [value] : [];
  };

  const getIssueRemark = (remark) =>
    remark?.IssueRemarks ||
    remark?.IssueRemark ||
    remark?.IssueRemarkList ||
    "";

  const getUniqueIssueRemarks = (remarks) => {
    const seen = new Set();

    return remarks.filter((remark) => {
      const issueRemark = getIssueRemark(remark);
      if (!issueRemark) return false;

      const key = [
        issueRemark,
        remark?.IssueDate,
        remark?.IssueCreatedByName,
      ].join("|");

      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  };

  const renderReviewIcon = (rowData, barcodeNo, tooltipId) => {
    const rowIssueRemarks = parseIssueRemarkList(rowData?.IssueRemarkList);
    const selectedIssueRemarks = parseIssueRemarkList(selectedData?.IssueRemarkList);
    const issueRemarks = getUniqueIssueRemarks([
      ...rowIssueRemarks,
      ...(selectedIssueRemarks.length > rowIssueRemarks.length ? selectedIssueRemarks : []),
    ]);
    const issueCount = Math.max(
      Number(rowData?.IssueCount) || 0,
      Number(selectedData?.IssueCount) || 0,
      issueRemarks.length,
    );

    return (
      <div
        className="d-inline-flex align-items-center justify-content-center"
        data-tooltip-id={issueRemarks.length > 0 ? tooltipId : undefined}
        style={{ gap: "3px" }}
      >
        <Tooltip label={t("Add Review")}>
          <span
            onClick={(e) => {
              e.stopPropagation();
              openReviewModal(rowData, barcodeNo);
            }}
            style={{
              cursor: "pointer",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <span
              style={{
                backgroundColor: "green",
                borderRadius: "50%",
                width: "18px",
                height: "18px",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 1px 3px rgba(0,0,0,0.15)",
              }}
            >
              <FaPlus color="white" size={8} />
            </span>
          </span>
        </Tooltip>
        {issueCount > 0 && (
          <span
            style={{ fontSize: "12px", fontWeight: "bold", cursor: "pointer" }}
          >
            ({issueCount})
          </span>
        )}
        {tooltipId && issueRemarks.length > 0 && (
          <ReactTooltip
            id={tooltipId}
            place="top"
            positionStrategy="fixed"
            style={{ zIndex: 9999 }}
            clickable
            content={
              <div>
                <h2 className="mb-1 border-bottom">{t("Issues")}</h2>
                <div>
                  {issueRemarks.map((remark, index) => (
                    <div key={index} className="mb-1">
                      <span>{index + 1}. </span>{getIssueRemark(remark)}
                      {(remark?.IssueDate || remark?.IssueCreatedByName) && (
                        <div style={{ fontSize: "11px", opacity: 0.85, marginLeft: "14px" }}>
                          {remark?.IssueDate}
                          {remark?.IssueDate && remark?.IssueCreatedByName ? " | " : ""}
                          {remark?.IssueCreatedByName}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            }
          />
        )}
      </div>
    );
  };

  const handleSaveReview = async () => {
    const reviewText = reviewModal.reviewText?.trim() || "";
    if (reviewText === "") {
      toast.error(t("Please enter Issues!"));
      return;
    }
    setReviewModal((prev) => ({ ...prev, loading: true }));
    try {
      const res = await axiosInstance.post("RE/SaveLabIssue", {
        TestId: reviewModal.rowData?.TestID?.toString() || "",
        BarcodeNo: reviewModal.barcodeNo || "",
        IssueRemark: reviewText,
      });
      if (res?.data?.success) {
        setResultTestData((prev) =>
          prev.map((item) => {
            if (String(item?.TestID) !== String(reviewModal.rowData?.TestID)) {
              return item;
            }

            const currentRemarks = parseIssueRemarkList(item?.IssueRemarkList);

            return {
              ...item,
              IssueCount: (Number(item?.IssueCount) || currentRemarks.length) + 1,
              IssueRemarkList: [...currentRemarks, { IssueRemarks: reviewText }],
            };
          }),
        );
        toast.success(res?.data?.message || t("Issues saved successfully"));
        closeReviewModal();
      } else {
        toast.error(res?.data?.message || t("Failed to save Issues"));
      }
    } catch (err) {
      console.error("Save issues Error:", err);
      toast.error(t("An error occurred while saving Issues"));
    } finally {
      setReviewModal((prev) => ({ ...prev, loading: false }));
    }
  };

  const location = useLocation();
  const userDataLocal = useLocalStorage("userData", "get");
  const SkipTestCentreResultEntry = userDataLocal?.SkipTestCentreResultEntry ?? 1;
  console.log("SkipTestCentreResultEntry", SkipTestCentreResultEntry);
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

  const controllerButtonDynamic = async () => {
    try {
      const { controllersData } =
        await getSearchController("1081");

      if (Array.isArray(controllersData) && controllersData.length > 0) {
        const sortedButtons = [...controllersData].sort(
          (a, b) => a.DisplayOrder - b.DisplayOrder
        );
        setControllerButtonDynamicList(sortedButtons);
      } else {
        setControllerButtonDynamicList([
          { ControlDisplayID: "Doctor", IsShow: 1, DisplayOrder: 1 },
          { ControlDisplayID: "Save", IsShow: 1, DisplayOrder: 2 },
          { ControlDisplayID: "Approve", IsShow: 1, DisplayOrder: 3 },
          { ControlDisplayID: "Machine Group", IsShow: 1, DisplayOrder: 4 },
          { ControlDisplayID: "Preview", IsShow: 1, DisplayOrder: 5 },
          { ControlDisplayID: "Main List", IsShow: 1, DisplayOrder: 6 },
        ]);
      }
    } catch (error) {
      console.error("error in controllerButtonDynamic:", error);
      setControllerButtonDynamicList([
        { ControlDisplayID: "Doctor", IsShow: 1, DisplayOrder: 1 },
        { ControlDisplayID: "Save", IsShow: 1, DisplayOrder: 2 },
        { ControlDisplayID: "Approve", IsShow: 1, DisplayOrder: 3 },
        { ControlDisplayID: "Machine Group", IsShow: 1, DisplayOrder: 4 },
        { ControlDisplayID: "Preview", IsShow: 1, DisplayOrder: 5 },
        { ControlDisplayID: "Main List", IsShow: 1, DisplayOrder: 6 },
      ]);
    }
  };

  const renderDynamicButton = (item, index) => {
    const controlId = item?.ControlDisplayID;

    if (!item?.IsShow) return null;

    switch (controlId) {

      // case "Save":
      //   return (
      //     ResultData.length > 0 && (
      //       <div
      //         key={index}
      //         className={
      //           buttonsData?.some(
      //             (ele) => ele?.AccessBy === "Dual Authentication",
      //           ) && checkDualAuthentication
      //             ? "col-sm-2"
      //             : "col-sm-1"
      //         }
      //       >
      //         <div className="p-inputgroup d-flex">
      //           <button
      //             ref={saveBtnRef}
      //             style={{
      //               backgroundColor: "#007bff",
      //               color: "white",
      //               width:
      //                 buttonsData?.some(
      //                   (ele) =>
      //                     ele?.AccessBy === "Dual Authentication",
      //                 ) && checkDualAuthentication
      //                   ? "30%"
      //                   : "100%",
      //             }}
      //             className="btn btn-block btn-sm"
      //             onClick={() => handleResultSubmit("Save")}
      //           >
      //             {t("Save")}
      //           </button>

      //           {buttonsData?.some(
      //             (ele) => ele?.AccessBy === "Dual Authentication",
      //           ) &&
      //             checkDualAuthentication && (
      //               <div style={{ width: "70%", marginLeft: "10px" }}>
      //                 {buttonsData
      //                   ?.filter(
      //                     (ele) =>
      //                       ele?.AccessBy === "Dual Authentication",
      //                   )
      //                   .map((ele, idx) => (
      //                     <button
      //                       key={idx}
      //                       style={{
      //                         backgroundColor: "#fc3a3d",
      //                         color: "white",
      //                       }}
      //                       className="btn btn-block btn-sm"
      //                       onClick={() =>
      //                         handleResultSubmit(ele?.AccessBy)
      //                       }
      //                     >
      //                       {t("Dual Authentication")}
      //                     </button>
      //                   ))}
      //               </div>
      //             )}
      //         </div>
      //       </div>
      //     )
      //   );
      case "Save":
        return (
          ResultData?.length > 0 && (
            <div className="re-action-btn-item" key={index}>
              <button
                ref={saveBtnRef}
                style={{
                  backgroundColor: "#007bff",
                  color: "white",
                  minWidth: "90px",
                }}
                className="btn btn-sm"
                onClick={() => handleResultSubmit("Save")}
              >
                {t("Save")}
              </button>
            </div>
          )
        );

      case "Dual Authentication":
        return (
          buttonsData?.some(
            (ele) => ele?.AccessBy === "Dual Authentication"
          ) &&
          checkDualAuthentication && (
            <div className="col-sm-1" key={index}>
              {buttonsData
                ?.filter(
                  (ele) => ele?.AccessBy === "Dual Authentication"
                )
                .map((ele, idx) => (
                  <button
                    key={idx}
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
          )
        );

      case "Main List":
        return (
          !id && (
            <div className="re-action-btn-item" key={index}>
              <button
                className="btn btn-dark btn-sm"
                type="button"
                style={{ minWidth: "90px" }}
                onClick={() => {
                  setEyeModalConfig({ show: false, data: null, index: null });
                  setResultData([]);
                  setResultTestData([]);
                  setCopyPayload({});
                  setIncludeDepartment(false);
                  setAllComments({});
                  setTooltipPosition({ left: 0, right: "auto" });
                }}
              >
                {t("Main List")}
              </button>
            </div>
          )
        );

      case "Doctor": {
        const currentApprovedBy =
          ResultTestData[0]?.ApprovedBy && String(ResultTestData[0]?.ApprovedBy) !== "0"
            ? String(ResultTestData[0]?.ApprovedBy)
            : "";
        return (
          <div className="col-sm-2" key={index}>
            <SelectBox
              options={[
                { label: "Select Doctor", value: "" },
                ...(doctorAdmin || []).filter((d) => d?.value && String(d?.value) !== "0"),
              ]}
              selectedValue={currentApprovedBy}
              id="ApprovedBy"
              lable="Doctor *"
              name="ApprovedBy"
              onChange={handleDoctorName}
            />
            {doctorError && (
              <span className="text-danger font-weight-bold" style={{ fontSize: "11px", display: "block", marginTop: "2px" }}>
                {doctorError}
              </span>
            )}
          </div>
        );
      }

      case "Machine Group":
        return (
          <div className="col-sm-1" key={index}>
            <SelectBox
              options={machine}
              id="Machine"
              name="Machine"
              selectedValue={ResultTestData[0]?.MacID}
              onChange={handleMachineChange}
              lable={t("Machine Group")}
            />
          </div>
        );

      case "Preview":
        return (
          // CompanyID != 1002 &&
          HideResultEntryPreview == 0 && (
            <div className="re-action-btn-item" key={index}>
              {PrintReportLoading ? (
                <button
                  className="btn btn-secondary btn-sm"
                  style={{ minWidth: "90px" }}
                  disabled
                >
                  {t("Loading...")}
                </button>
              ) : (
                <button
                  className="btn btn-secondary btn-sm"
                  type="button"
                  style={{ minWidth: "90px" }}
                  onClick={() => handleReport("no", "")}
                  disabled={
                    !ResultTestData.some((ele) =>
                      [10, 6, 5].includes(ele?.Status),
                    )
                  }
                >
                  {t("Preview")}
                </button>
              )}
            </div>
          )
        );

      // case "Approve":
      // return (
      //   <div
      //     className="d-flex align-items-center flex-wrap"
      //     style={{ gap: "6px" }}
      //     key={index}
      //   >
      //     {buttonsData?.map((ele, idx) => {
      //       const hideButtons = [
      //         "Not Approved",
      //         "Unhold",
      //         "Discount Approval",
      //         "Hold",
      //         "Dual Authentication",
      //         "Allow Customize Date",
      //         "Not Approved - After Print",
      //       ];

      //       if (hideButtons.includes(ele.AccessBy)) return null;

      //       const isApprove = ele.AccessBy === "Approved";

      //       return (
      //         <React.Fragment key={idx}>
      //           <button
      //             ref={isApprove ? approveBtnRef : null}
      //             className="btn btn-sm"
      //             style={{
      //               backgroundColor: "#008000",
      //               color: "white",
      //             }}
      //             type="button"
      //             onClick={() =>
      //               handleResultSubmit(ele.AccessBy)
      //             }
      //           >
      //             {isApprove ? t("Approve") : t(ele.AccessBy)}
      //           </button>

      //           {isApprove && (
      //             <Tooltip
      //               label={
      //                 ResultTestData[0]?.Status === 5
      //                   ? accessRight.includes("4")
      //                     ? "Unapproved"
      //                     : "You are not authorized"
      //                   : ResultTestData[0]?.Status === 6
      //                     ? (accessRight.includes("4") ||
      //                         accessRight.includes("30"))
      //                       ? "Unapproved"
      //                       : "You are not authorized"
      //                     : "Please approve first"
      //               }
      //             >
      //               <button
      //                 className="btn btn-sm"
      //                 disabled={
      //                   !(
      //                     ((ResultTestData[0]?.Status === 5 &&
      //                       accessRight.includes("4")) ||
      //                       ResultTestData[0]?.Status === 6) &&
      //                     (
      //                       ResultTestData[0]?.Status !== 6 ||
      //                       accessRight.includes("4") ||
      //                       accessRight.includes("30")
      //                     )
      //                   )
      //                 }
      //                 style={{
      //                   backgroundColor: "rgb(211, 13, 30)",
      //                   color: "white",
      //                 }}
      //                 type="button"
      //                 onClick={() => {
      //                   if (
      //                     (ResultTestData[0]?.Status === 5 &&
      //                       accessRight.includes("4")) ||
      //                     (ResultTestData[0]?.Status === 6 &&
      //                       (accessRight.includes("4") ||
      //                         accessRight.includes("30")))
      //                   ) {
      //                     setReason({
      //                       ...reason,
      //                       HoldShow: true,
      //                       Hdata: ResultTestData[0],
      //                       type: "Not Approved",
      //                     });
      //                   }
      //                 }}
      //               >
      //                 Unapprove
      //               </button>
      //             </Tooltip>
      //           )}
      //         </React.Fragment>
      //       );
      //     })}
      //   </div>
      // );

      case "Approve":
        return (
          <div className="re-action-btn-item" key={index}>
            <button
              ref={approveBtnRef}
              className="btn btn-sm"
              style={{
                backgroundColor: "#008000",
                color: "white",
                minWidth: "90px",
              }}
              type="button"
              onClick={() => handleResultSubmit("Approved")}
              disabled={ResultTestData?.[0]?.Status === 5 || ResultTestData?.[0]?.Status == 11}
            >
              {t("Approve")}
            </button>
          </div>
        );

      case "Unapprove":
        return (
          <div className="re-action-btn-item" key={index}>
            <Tooltip
              label={
                ResultTestData[0]?.Status === 5
                  ? accessRight.includes("4")
                    ? "Unapproved"
                    : "You are not authorized"
                  : ResultTestData[0]?.Status === 6
                    ? (accessRight.includes("4") ||
                      accessRight.includes("30"))
                      ? "Unapproved"
                      : "You are not authorized"
                    : "Please approve first"
              }
            >
              <button
                className="btn btn-sm"
                style={{ minWidth: "95px" }}
                disabled={
                  !(
                    ((ResultTestData[0]?.Status === 5 &&
                      accessRight.includes("4")) ||
                      ResultTestData[0]?.Status === 6) &&
                    (
                      ResultTestData[0]?.Status !== 6 ||
                      accessRight.includes("4") ||
                      accessRight.includes("30")
                    )
                  )
                }
                style={{
                  backgroundColor: "rgb(211, 13, 30)",
                  color: "white",
                  opacity:
                    ((ResultTestData[0]?.Status === 5 &&
                      accessRight.includes("4")) ||
                      (ResultTestData[0]?.Status === 6 &&
                        (accessRight.includes("4") ||
                          accessRight.includes("30"))))
                      ? 1
                      : 0.5,

                  cursor:
                    ((ResultTestData[0]?.Status === 5 &&
                      accessRight.includes("4")) ||
                      (ResultTestData[0]?.Status === 6 &&
                        (accessRight.includes("4") ||
                          accessRight.includes("30"))))
                      ? "pointer"
                      : "not-allowed",
                }}
                type="button"
                onClick={() => {
                  if (
                    (ResultTestData[0]?.Status === 5 &&
                      accessRight.includes("4")) ||
                    (ResultTestData[0]?.Status === 6 &&
                      (accessRight.includes("4") ||
                        accessRight.includes("30")))
                  ) {
                    setReason({
                      ...reason,
                      HoldShow: true,
                      Hdata: ResultTestData[0],
                      type: "Not Approved",
                    });
                  }
                }}
              >
                Unapprove
              </button>
            </Tooltip>
          </div>
        );

      case "Hold":
        return (
          buttonsData?.some((ele) => ele?.AccessBy === "Hold") &&
          !([11, 5, 6].includes(ResultTestData[0]?.Status)) && (
            <div className="re-action-btn-item" key={index}>
              <button
                className="btn btn-sm"
                style={{
                  backgroundColor: "#ffc107",
                  color: "#212529",
                  minWidth: "85px",
                  fontWeight: 600,
                }}
                type="button"
                onClick={() => {
                  setReason({
                    ...reason,
                    HoldShow: true,
                    Hdata: ResultTestData[0],
                    type: "Hold",
                  });
                }}
              >
                {t("Hold")}
              </button>
            </div>
          )
        );

      case "Unhold":
        return (
          ResultTestData[0]?.Status === 11 &&
          buttonsData?.some((ele) => ele?.AccessBy === "Unhold") && (
            <div className="re-action-btn-item" key={index}>
              <button
                className="btn btn-sm"
                style={{
                  backgroundColor: "#28a745",
                  color: "white",
                  minWidth: "85px",
                  fontWeight: 600,
                }}
                type="button"
                onClick={() =>
                  handleResultSubmit(
                    "Unhold",
                    ResultTestData[0],
                  )
                }
              >
                {t("Unhold")}
              </button>
            </div>
          )
        );

      case "Arrow":
        return (
          <div className="re-action-btn-item d-flex align-items-center" key={index} style={{ gap: "6px" }}>
            <button
              type="button"
              className="btn btn-outline-secondary btn-sm"
              disabled={!canMoveToPrevious()}
              style={{
                cursor: !canMoveToPrevious() ? "not-allowed" : "pointer",
                padding: "4px 10px",
                height: "32px",
              }}
              onClick={handlePrevious}
              title="Previous"
            >
              <i className="fa fa-chevron-left" />
            </button>
            <button
              type="button"
              className="btn btn-outline-secondary btn-sm"
              disabled={!canMoveToNext(true)}
              style={{
                cursor: !canMoveToNext(true) ? "not-allowed" : "pointer",
                padding: "4px 10px",
                height: "32px",
              }}
              onClick={handleNext}
              title="Next"
            >
              <i className="fa fa-chevron-right" />
            </button>
          </div>
        );

      case "Forward":
        return (
          <div className="col-sm-1" key={index}>
            <button
              className="btn btn-block btn-success btn-sm"
              type="button"
              onClick={() => setShowForwardDialog(true)}
            >
              {t("Forward")}
            </button>
          </div>
        );

      case "Delta Check":
        return (
          <div className="col-sm-1" key={index}>
            <button
              className="btn btn-block btn-success btn-sm"
              type="button"
              onClick={() =>
                handleDeltaCheckReport(ResultTestData)
              }
            >
              {t("Delta Check")}
            </button>
          </div>
        );

      case "Old Report":
        return (
          <div className="col-sm-1" key={index}>
            <button
              className="btn btn-danger btn-block btn-sm"
              type="button"
              disabled={showOldReportModal.show}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                if (showOldReportModal.show) return;
                setShowOldReportModal({
                  show: true,
                  data: ResultData[0]?.PatientCode,
                });
              }}
            >
              {t("Old Report")}
            </button>
          </div>
        );

      default:
        return null;
    }
  };

  useEffect(() => {
    ResultEntryFilter();
    getCollectionBoy(setCollectionBoyList, true);
  }, []);

  const handleToggleChange = (e) => {
    const { checked } = e.target;
    setCheckBarcodeOption(checked);
  };

  const getTestFlags = (testId) => {
    const relatedTests = ResultData?.filter((item) => item.TestID === testId);

    return {
      isUrgent: relatedTests?.some((item) => item.isUrgent == 1),
      isVip: relatedTests?.some((item) => item.IsVip == 1),
    };
  };

  // const getResultValueRangeClass = (row, index) => {
  //   const negativeClass = invalidNegativeIndex === index ? "invalid-negative" : "";
  //   if (row?.Value === undefined || row?.Value === null || row?.Value === "") {
  //     return negativeClass;
  //   }
  //   const value = parseFloat(row.Value);
  //   if (Number.isNaN(value)) return negativeClass;

  //   const min = parseFloat(row.MinValue);
  //   const max = parseFloat(row.MaxValue);
  //   const minCrit =
  //     row.MinCritical != null && row.MinCritical !== ""
  //       ? parseFloat(row.MinCritical)
  //       : NaN;
  //   const maxCrit =
  //     row.MaxCritical != null && row.MaxCritical !== ""
  //       ? parseFloat(row.MaxCritical)
  //       : NaN;
  //   const hasRange =
  //     (row.MaxValue != "0" || row.MinValue != "0") &&
  //     (!Number.isNaN(min) || !Number.isNaN(max));

  //   const IMPLAUSIBLE_FACTOR = 10;
  //   if (!Number.isNaN(max) && max > 0 && value > max * IMPLAUSIBLE_FACTOR) {
  //     return ["implausible", negativeClass].filter(Boolean).join(" ");
  //   }
  //   if (!Number.isNaN(min) && min > 0 && value >= 0 && value < min / IMPLAUSIBLE_FACTOR) {
  //     return ["implausible", negativeClass].filter(Boolean).join(" ");
  //   }
  //   if (!Number.isNaN(minCrit) && !Number.isNaN(min) && minCrit < min && value <= minCrit) {
  //     return ["min-critical", negativeClass].filter(Boolean).join(" ");
  //   }
  //   if (!Number.isNaN(maxCrit) && !Number.isNaN(max) && maxCrit > max && value >= maxCrit) {
  //     return ["max-critical", negativeClass].filter(Boolean).join(" ");
  //   }
  //   if (hasRange && !Number.isNaN(max) && value > max) {
  //     return ["high", negativeClass].filter(Boolean).join(" ");
  //   }
  //   if (hasRange && !Number.isNaN(min) && value < min) {
  //     return ["low", negativeClass].filter(Boolean).join(" ");
  //   }
  //   return negativeClass;
  // };

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

  // const formatHtmlToText = (html) => {
  //   if (!html) return "";

  //   return html
  //     .replace(/<br\s*\/?>/gi, "\n")   
  //     .replace(/<\/p>/gi, "\n")        
  //     .replace(/<[^>]+>/g, "")         
  //     .replace(/&nbsp;/g, " ")        
  //     .trim();
  // };

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

  // const getEditorHeight = (html = "") => {
  //   if (!html) return 180;

  //   const container = document.createElement("div");

  //   container.style.position = "absolute";
  //   container.style.visibility = "hidden";
  //   container.style.width = "800px"; // MUST match editor width
  //   container.style.fontSize = "14px";
  //   container.style.lineHeight = "1.6";
  //   container.style.fontFamily = "Arial";
  //   container.style.whiteSpace = "normal";

  //   container.innerHTML = html;

  //   document.body.appendChild(container);

  //   const height = container.scrollHeight;

  //   document.body.removeChild(container);

  //   const MIN = 180;
  //   const MAX = 1500;

  //   return Math.min(Math.max(height + 20, MIN), MAX);
  // };

  const getEditorHeight = (html = "") => {
    if (!html) return DefaultCurrencyName == "KES" ? 100 : 180;

    const container = document.createElement("div");

    container.style.position = "absolute";
    container.style.visibility = "hidden";
    container.style.width = "800px";

    // ✅ MATCH CKEditor styles more closely
    container.style.fontSize = "14px";
    container.style.lineHeight = "1.6";
    container.style.fontFamily = "Arial";

    // 🔥 IMPORTANT FIXES
    container.style.padding = "10px"; // CKEditor has padding
    container.style.boxSizing = "border-box";

    container.innerHTML = html;

    document.body.appendChild(container);

    let height = container.scrollHeight;

    // ✅ EXTRA: count paragraphs for spacing correction
    const paragraphs = container.querySelectorAll("p").length;

    height += paragraphs * 6; // adjust paragraph spacing

    document.body.removeChild(container);

    const MIN = 180;
    const MAX = 800;

    return Math.min(Math.max(height + 20, MIN), MAX);
  };

  const getRemarks = async () => {
    axiosInstance
      .post("Global/getGlobalData", {
        type: "LabRemarks",
      })
      .then((res) => {
        const message = res?.data?.message || [];

        if (!Array.isArray(message)) {
          setRemarkOptions([]);
          return;
        }

        const formattedRemarks = message.map((item) => ({
          label: item.FieldDisplay,
          value: item.FieldID,
        }));
        setRemarkOptions([
          { label: "Others", value: "others" },
          ...formattedRemarks,
        ]);
      })
      .catch((err) => console.log(err));
  };
  console.log({ WardNoOptions });

  const getInvestigationsListData = (investigationIds = [], val = [], valTestHeader = []) => {
    axiosInstance
      .post("InvestigationCommentMaster/getInvestigationCommentData", {
        InvestigationID: investigationIds || [],
        Template: "",
        TemplateText: "",
      })
      .then((res) => {
        if (res.status === 200) {
          const grouped = {};
          res?.data?.message.forEach((item) => {
            if (!grouped[item.InvestigationID]) {
              grouped[item.InvestigationID] = [];
            }
            grouped[item.InvestigationID].push(item);
          });
          setAllComments(grouped);

          // Auto-select default comment when ResultFlag=0
          let finalVal = val;
          const header = valTestHeader?.[0];
          if (Number(header?.ResultFlag) === 0 && header?.CommentIDDefault) {
            const defaultEntry = String(header.CommentIDDefault)
              .split(",")
              .map((s) => s.trim())
              .find((s) => s.endsWith("|1"));
            const defaultCommentId = defaultEntry?.split("|")[0];
            if (defaultCommentId) {
              let defaultComment = null;
              for (const invId in grouped) {
                const found = grouped[invId].find(
                  (c) => String(c.CommentID) === String(defaultCommentId)
                );
                if (found) { defaultComment = found; break; }
              }
              if (defaultComment) {
                finalVal = val.map((obs) =>
                  obs.ReportType === "2" && (!obs.COMMENT || obs.COMMENT.trim() === "")
                    ? { ...obs, COMMENT: defaultComment.TemplateText, SaveRangeStatus: 1 }
                    : obs
                );
              }
            }
          }

          setArrangeMentOfData(finalVal, valTestHeader);
        } else {
          setArrangeMentOfData(val, valTestHeader);
        }
      })
      .catch((err) => {
        console.log(err);
        setArrangeMentOfData(val, valTestHeader);
      });
  };

  const refreshComments = (investigationIds = []) => {
    axiosInstance
      .post("InvestigationCommentMaster/getInvestigationCommentData", {
        InvestigationID: investigationIds,
        Template: "",
        TemplateText: "",
      })
      .then((res) => {
        if (res.status === 200) {
          const grouped = {};
          res?.data?.message.forEach((item) => {
            if (!grouped[item.InvestigationID]) grouped[item.InvestigationID] = [];
            grouped[item.InvestigationID].push(item);
          });
          setAllComments(grouped);
        }
      })
      .catch((err) => console.log(err));
  };

  const handleSaveTemplate = () => {
    const { templateName, observationData } = saveTemplateModal;
    if (!templateName?.trim()) {
      setSaveTemplateModal((prev) => ({ ...prev, templateNameErr: "This field is required" }));
      return;
    }
    setSaveTemplateModal((prev) => ({ ...prev, templateNameErr: "" }));
    axiosInstance
      .post("InvestigationCommentMaster/InsertInvestigationComment", {
        isActive: 1,
        isDefault: 0,
        InvestigationID: observationData?.InvestigationID,
        Template: templateName.trim(),
        TemplateText: observationData?.COMMENT || "",
        TestName: observationData?.TestName || "",
      })
      .then((res) => {
        if (res?.data?.success) {
          toast.success(res?.data?.message || "Template saved successfully");
          setSaveTemplateModal({ visible: false, templateName: "", templateNameErr: "", observationData: null });
          refreshComments([observationData?.InvestigationID]);
        } else {
          toast.error(res?.data?.message || "Failed to save template");
        }
      })
      .catch((err) => {
        toast.error(err?.response?.data?.message || "Error saving template");
      });
  };

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
      .get("RE/BindMachineGroup?ResultEntry=1")
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

  const handleOpenPreview = (keys) => {
    const parsedKeys = parseAwsKeys(keys);

    if (!parsedKeys) return;

    setPreviewConfig({
      visible: true,
      url: parsedKeys,
    });
  };

  const handleClosePreview = () => {
    setPreviewConfig({ visible: false, url: null });
  };

  useEffect(() => {
    getMachine();
    BindMachineName();
    getFilterResultOption();
    getRemarks();
    getBuildingBlocks();
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
        { useDepartmentIDs: true }
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
        { useDepartmentIDs: true }
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

  const autoGrowResultValue = (el) => {
    if (!el) return;
    // .form-control sets height: 2rem !important globally, so a plain inline
    // style can't win -- set the inline override as !important too.
    el.style.setProperty("height", "auto", "important");
    el.style.setProperty("height", `${el.scrollHeight}px`, "important");
  };

  const handleKeyUp = (e, index) => {
    if (e.key === "Tab") {
      if (e.shiftKey) {
        // move backward
        let prevIndex = index - 1;
        while (
          prevIndex >= 0 &&
          (!myRefs.current[prevIndex] ||
            (myRefs.current[prevIndex].tagName !== "INPUT" &&
              myRefs.current[prevIndex].tagName !== "TEXTAREA") ||
            myRefs.current[prevIndex].disabled)
        ) {
          prevIndex--;
        }
        if (prevIndex < 0) {
          // No earlier input in this grid - let Shift+Tab move focus
          // out naturally instead of wrapping back to the last input.
          return;
        }
        e.preventDefault();
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
            (myRefs.current[nextIndex].tagName !== "INPUT" &&
            myRefs.current[nextIndex].tagName !== "TEXTAREA") ||
            myRefs.current[nextIndex].disabled)
        ) {
          nextIndex++;
        }
        if (nextIndex >= myRefs.current.length) {
          // No further input in this grid - jump straight to the Save
          // button instead of wrapping back to the first input or
          // relying on DOM tab order (which would land on the Doctor/
          // Machine Group dropdowns in between first).
          if (saveBtnRef.current) {
            e.preventDefault();
            saveBtnRef.current.focus();
          }
          return;
        }
        e.preventDefault();
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
          (myRefs.current[nextIndex].tagName !== "INPUT" &&
            myRefs.current[nextIndex].tagName !== "TEXTAREA") ||
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
        ToDate: updatedToDate,
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
        fetchRateTypes(CentreData.map((ele) => ele.value), true);
      } else {
        fetchRateTypes([value?.value], true);
      }
    } else if (label === "LabRemarks") {
      if (value?.value === "others") {
        setFormData({ ...formData, Remarks: "", RemarkID: "others" });
      } else {
        setFormData({
          ...formData,
          Remarks: value.value == "" ? "" : value?.label || "",
          RemarkID: value?.value == "" ? 0 : value?.value || 0,
        });
      }
    } else {
      setFormData({ ...formData, [label]: value?.value });
    }
  };

  const handleSelectMultiChange = (select, name) => {

    const val = select?.map((ele) => {
      return ele?.value;
    });
    if (name === "DepartmentID") {
      setSelectedDepartment(val);
    }
    setFormData((prev) => ({ ...prev, [name]: val }));
  };

  const handleSelectChange = (event) => {
    const { name, value, checked, type } = event?.target;
    if (
      name == "IsUrgent" ||
      name == "IsVip" ||
      name == "IsForward" ||
      name == "IsTatSummary"
    ) {
      setFormData({
        ...formData,
        [name]: type === "checkbox" ? checked : value,
      });
    } else if (name === "SelectTypes") {
      setFormData({
        ...formData,
        [name]: value,
        ItemValue: value === "PatientCode" ? defaultCentrePrefix : "",
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
  const handleToggle = (field) => {
    setFormData((prev) => ({
      ...prev,
      [field]: prev[field] === 1 ? 0 : 1,
    }));
  };

  const handleProEmployeeChange = (name, e) => {
    setState((prev) => ({ ...prev, [name]: e?.value }));
  };

  const handleEditorChange = (newValue) => {
    setEditTable(false);

    const updatedTestData = [...ResultData];

    updatedTestData[index] = {
      ...updatedTestData[index],
      COMMENT: newValue,          // HTML content from editor
      PLAIN_COMMENT: newValue,    // (optional: convert if needed)
      SaveRangeStatus: 1,
    };

    setResultData(updatedTestData);
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
      .post("Centre/BindCentreWorkOrder", {
        centreID: 0,
        rateTypeID: 0,
      })
      .then((res) => {
        let data = res.data.message;
        let CentreDataValue = data.map((ele) => {
          return {
            value: ele.value,
            label: ele.label,
          };
        });
        let allValues = CentreDataValue.map((ele) => ele.value);
        setCentreData(CentreDataValue);
        if (ShowDefaultLoginCentre === "1") {
          setFormData((prev) => ({ ...prev, CentreID: DefaultCentre }));
          fetchRateTypes([DefaultCentre], true);
        } else {
          fetchRateTypes(allValues, true);
        }
      })
      .catch((err) => console.log(err));
  };

  const handleSave = (data, modal) => {
    console.log("dataxx", data, modal);
    if (modal === "Edit") {
      //   if (Number(data?.MinValue) >= Number(data?.MaxValue)) {
      //     toast.error(t("Please Enter Correct Min and Max Value"));
      //   } 
      //   else {
      let val = ResultData?.map((ele) => {
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
      // }
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

  const canMoveToNext = (isApprove = true) => {
    const currentIndex = ResultData[0]?.currentIndex;
    if (currentIndex === undefined || id) return false;

    if (isSingleTestMode) {
      const currentPatient = redata[currentIndex];
      const currentTestID = ResultData[0]?.TestID;
      const currentTestIndex = currentPatient?.TestDetails?.findIndex(
        (t) => String(t.TestID) === String(currentTestID)
      );

      if (
        currentTestIndex !== -1 &&
        currentTestIndex < currentPatient?.TestDetails?.length - 1
      ) {
        return true;
      }

      // If we are on the last test of the patient, only move to next patient on approve
      if (!isApprove) return false;
    }

    return currentIndex < redata.length - 1;
  };

  const canMoveToPrevious = () => {
    const currentIndex = ResultData[0]?.currentIndex;
    if (currentIndex === undefined || id) return false;

    if (isSingleTestMode) {
      const currentPatient = redata[currentIndex];
      const currentTestID = ResultData[0]?.TestID;
      const currentTestIndex = currentPatient?.TestDetails?.findIndex(
        (t) => String(t.TestID) === String(currentTestID)
      );

      if (currentTestIndex > 0) {
        return true;
      }
    }

    return currentIndex > 0;
  };

  const handleNext = () => {
    const currentIndex = ResultData[0]?.currentIndex;
    console.log("herexx");
    if (currentIndex === undefined || id) return;

    if (isSingleTestMode) {
      const currentPatient = redata[currentIndex];
      const currentTestID = ResultData[0]?.TestID;
      console.log("currentPatient", currentPatient, currentTestID);

      const currentTestIndex = currentPatient?.TestDetails?.findIndex(
        (t) => String(t.TestID) === String(currentTestID)
      );

      console.log("currentTestIndex", currentTestIndex, currentPatient, currentPatient?.TestDetails?.length);

      if (
        currentTestIndex !== -1 &&
        currentTestIndex < currentPatient?.TestDetails?.length - 1
      ) {
        const nextTest = currentPatient.TestDetails[currentTestIndex + 1];

        if (["1", "2", "4"].includes(String(nextTest?.Status))) {
          toast.error(
            nextTest?.Status === "1"
              ? "Sample not collected yet"
              : nextTest?.Status === "2"
                ? "Department not received yet"
                : "Sample rejected. Please recollect sample",
          );
          return;
        }

        GetResultEntry(
          {
            ...copyPayload,
            DepartmentID: [],
            DepartmentCode: [],
            TestID: nextTest.TestID.toString(),
            TestCentreIDManual: redata[currentIndex + 1]?.TestCentreID || [0],
            from: "testClick",
            isEyeModal: eyeModalConfig.show && !eyeModalConfig.isModal,
            isEditModal: eyeModalConfig.show && eyeModalConfig.isModal,
          },
          currentIndex,
          setLoading
        );
        return;
      }
    }

    if (currentIndex < redata.length - 1) {
      console.log("herexx2");
      const nextIndex = currentIndex + 1;
      const nextPatient = redata[nextIndex];

      if (["1", "2", "4"].includes(String(nextPatient?.Status))) {
        toast.error(
          nextPatient?.Status === "1"
            ? "Sample not collected yet"
            : nextPatient?.Status === "2"
              ? "Department not received yet"
              : "Sample rejected. Please recollect sample",
        );
        return;
      }

      const testID = isSingleTestMode
        ? nextPatient?.TestDetails?.[0]?.TestID?.toString() ||
        nextPatient?.TestID
        : nextPatient?.TestID;



      GetResultEntry(
        {
          TestID: testID,
          TestCentreIDManual: nextPatient?.TestCentreID || [0],
          LedgerTransactionID: nextPatient?.LedgerTransactionID || 0,
          DepartmentID: isSingleTestMode ? [] : nextPatient?.DepartmentIDs || [],
          DepartmentCode: isSingleTestMode ? [] : nextPatient?.DepartmentCodes || [],
          symbol: "",
          Mobile: nextPatient?.Mobile,
          VisitNo: nextPatient?.VisitNo,
          PEmail: nextPatient?.PEmail,
          MacID: "",
          LedgertransactionIDHash: nextPatient?.LedgertransactionIDHash,
          isOutSource: nextPatient?.isOutSource,
          index: nextPatient?.index,
          ApprovedBy: "",
          SelectedDepartmentId: selectedDepartment || [0],
          from: isSingleTestMode ? "testClick" : "resultClick",
          isEyeModal: eyeModalConfig.show && !eyeModalConfig.isModal,
          isEditModal: eyeModalConfig.show && eyeModalConfig.isModal,
        },
        nextIndex,
        setLoading
      );
      setSelectedData(nextPatient);
    }
  };

  const handlePrevious = () => {
    const currentIndex = ResultData[0]?.currentIndex;
    if (currentIndex === undefined || id) return;

    if (isSingleTestMode) {
      const currentPatient = redata[currentIndex];
      const currentTestID = ResultData[0]?.TestID;
      const currentTestIndex = currentPatient?.TestDetails?.findIndex(
        (t) => String(t.TestID) === String(currentTestID)
      );

      if (currentTestIndex > 0) {
        const prevTest = currentPatient.TestDetails[currentTestIndex - 1];
        console.log("currentPatient", currentPatient);

        if (["1", "2", "4"].includes(String(prevTest?.Status))) {
          toast.error(
            prevTest?.Status === "1"
              ? "Sample not collected yet"
              : prevTest?.Status === "2"
                ? "Department not received yet"
                : "Sample rejected. Please recollect sample",
          );
          return;
        }

        GetResultEntry(
          {
            ...copyPayload,
            DepartmentID: [],
            DepartmentCode: [],
            TestID: prevTest.TestID.toString(),
            TestCentreIDManual: redata[currentIndex - 1]?.TestCentreID || [0],
            from: "testClick",
            isEyeModal: eyeModalConfig.show && !eyeModalConfig.isModal,
            isEditModal: eyeModalConfig.show && eyeModalConfig.isModal,
          },
          currentIndex,
          setLoading
        );
        return;
      }
    }

    if (currentIndex > 0) {
      const prevIndex = currentIndex - 1;
      const prevPatient = redata[prevIndex];
      // console.log("prevPatient", prevPatient);

      if (["1", "2", "4"].includes(String(prevPatient?.Status))) {
        toast.error(
          prevPatient?.Status === "1"
            ? "Sample not collected yet"
            : prevPatient?.Status === "2"
              ? "Department not received yet"
              : "Sample rejected. Please recollect sample",
        );
        return;
      }

      const testID = isSingleTestMode
        ? prevPatient?.TestDetails?.[prevPatient?.TestDetails?.length - 1]
          ?.TestID?.toString() || prevPatient?.TestID
        : prevPatient?.TestID;

      GetResultEntry(
        {
          TestID: testID,
          TestCentreIDManual: prevPatient?.TestCentreID || [0],
          LedgerTransactionID: prevPatient?.LedgerTransactionID || 0,
          DepartmentID: isSingleTestMode ? [] : prevPatient?.DepartmentIDs || [],
          DepartmentCode: isSingleTestMode ? [] : prevPatient?.DepartmentCodes || [],
          symbol: "",
          Mobile: prevPatient?.Mobile,
          VisitNo: prevPatient?.VisitNo,
          PEmail: prevPatient?.PEmail,
          MacID: "",
          LedgertransactionIDHash: prevPatient?.LedgertransactionIDHash,
          isOutSource: prevPatient?.isOutSource,
          index: prevPatient?.index,
          ApprovedBy: "",
          SelectedDepartmentId: selectedDepartment || [0],
          from: isSingleTestMode ? "testClick" : "resultClick",
          isEyeModal: eyeModalConfig.show && !eyeModalConfig.isModal,
          isEditModal: eyeModalConfig.show && eyeModalConfig.isModal,
        },
        prevIndex,
        setLoading
      );
      setSelectedData(prevPatient);
    }
  };

  const TableData = (status, page = 1, partialOverride) => {
    const partialActive =
      partialOverride !== undefined ? partialOverride : isPartialFilter;
    const rateTypes = RateTypes.map((item) => {
      return item?.value;
    });
    const reqId = ++getResultEntryReqId.current;
    setLoading(true);
    // UHID search auto-fills ItemValue with just the centre's prefix (e.g. "APC") so
    // the user can type the rest of the code. If they search without typing anything
    // past that prefix, don't send it as a filter — it isn't a real UHID.
    const isUhidPrefixOnly =
      formData?.SelectTypes === "PatientCode" &&
      formData?.ItemValue?.trim() === defaultCentrePrefix?.trim();
    // return;
    axiosInstance
      .post(
        "RE/GetResultEntry",
        getTrimmedData({
          CentreID: formData?.CentreID ? [formData?.CentreID] : [],
          testCentreID: formData?.testCentreID
            ? Number(formData.testCentreID)
            : "",
          ShowAllCheckBarcodeOption: checkBarcodeOption ? 1 : 0,
          CollectionBoyID: Number(collectionBoy),
          SelectTypes: isUhidPrefixOnly ? "" : formData.SelectTypes,
          ItemValue: isUhidPrefixOnly ? "" : formData.ItemValue,
          RateTypeID: formData?.RateTypeID ? [formData?.RateTypeID] : [],
          DoctorReferal: formData.DoctorReferal,
          FromDate: moment(formData.FromDate).format("DD/MMM/YYYY"),
          ToDate: moment(formData.ToDate).format("DD/MMM/YYYY"),
          FromTime: formData.FromTime,
          ToTime: formData.ToTime,
          // DepartmentID: formData?.DepartmentID ? [formData?.DepartmentID] : [],
          DepartmentID: formData?.DepartmentID ? formData?.DepartmentID : [],
          SampleStatus:
            !!checkBarcodeOption && formData.ItemValue ? "" : status,
          TestName: formData?.TestName ? String(formData?.InvestigationID) : "",
          DateTypeSearch: formData?.DateTypeSearch,
          IsUrgent: formData?.IsUrgent ? 1 : 0,
          IsVip: formData?.IsVip ? 1 : 0,
          MachineID:
            formData?.MachineID == "" ? "0" : formData?.MachineID.toString(),
          IsTat: formData?.IsTat,
          Order: formData?.Order,
          Flag: formData?.Flag,
          moreFilter: formData?.moreFilter,
          parameterId: formData?.parameterId || [],
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
          IsForward: formData?.IsForward ? 1 : 0,
          remarks: formData?.Remarks || "",
          RemarkID:
            formData?.RemarkID === "others"
              ? 0
              : Number(formData?.RemarkID) || 0,
          HLMPatientType: formData?.HLMPatientType || "ALL",
          // TAT: Number(formData?.TAT || 0),
        }),
      )
      .then((res) => {
        if (reqId !== getResultEntryReqId.current) {
          return;
        }
        if(res.data?.success) {
        setSelectedRowIndex(-1);
        setSelectedData({});
        if (Array.isArray(res?.data?.message)) {
          console.log("before", res?.data?.message);
          const rowsForDisplay = partialActive
            ? res?.data?.message?.filter(
                (item) => Number(item?.isPartialResult) === 1,
              )
            : res?.data?.message;
          setTestCount(rowsForDisplay?.length || 0);
          const final = modifyArray(rowsForDisplay);
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
          setTotalCount(final?.length || 0);
          setCurrentPage(page);
          if (formData?.IsTatSummary) {
            setShowTat(true); // modal open
          }
          console.log("currentIndex", currentIndex);
        } else {
          SetReData([]);
          setOriginalTableData([]);
          setTestCount(0);
        }
        setStatusValue(status === "" ? status : parseInt(status));
        setShowAdvanceFilter({ show: false, data: "" });
        setLoad(true);
        } else {
          SetReData([]);
          setOriginalTableData([]);
          setTestCount(0);
          toast.error(res.data?.message || "No record found!")
        }
        setLoading(false);
      })
      .catch((err) => {
        if (reqId === getResultEntryReqId.current) {
          setLoading(false);
        }
      });
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

  const SAMPLE_TYPE_ORDER = ["edta", "serum", "urine", "fluoride"];

  function getSampleTypePriority(sampleTypeName) {
    const name = (sampleTypeName || "").toLowerCase();
    const index = SAMPLE_TYPE_ORDER.findIndex((type) => name.includes(type));
    return index === -1 ? SAMPLE_TYPE_ORDER.length : index;
  }

  function modifyArray(dataArray) {
    const tempObject = {};
    const order = []; // preserve original order
    const keyMap = {
      0: (item) => `${item.LedgerTransactionID}`,
      1: (item) => `${item.LedgerTransactionID}-${item.DepartmentCode}`,
      2: (item) => `${item.LedgerTransactionID}-${item.DepartmentCode}-${item.SinNo}`,
      3: (item) => `${item.LedgerTransactionID}-${item.SinNo}`,
      4: (item) => `${item.TestID}`,
    };

    const getKey = keyMap[IsPatientWiseReporting] || keyMap[0] || ((item) => item.LedgerTransactionID || item.VisitNo);

    // Arrange tests by SampleTypeName priority (EDTA, Serum, Urine, Fluoride, others)
    // before grouping, so both group order and combined TestName follow this order.
    const sortedDataArray = [...(dataArray || [])].sort(
      (a, b) => getSampleTypePriority(a.SampleTypeName) - getSampleTypePriority(b.SampleTypeName)
    );

    for (const item of sortedDataArray) {
      const key = getKey(item);
      const checkboxHTML = `<p class="round Status-${item.Status}">${createCheckbox(item)}${item.TestName}</p>`;
      const remarksList = safeParseRemarks(item?.RemarksList);
      const issueRemarkList = parseIssueRemarkList(item.IssueRemarkList);
      const itemStatus = Number(item?.Status);

      const testDetails = {
        TestName: item.TestName,
        Status: item.Status,
        TestID: item.TestID,
        LedgerTransactionID: item.LedgerTransactionID,
        TestIdhash: item.TestIdhash,
        IsApproved: item.IsApproved,
        LabRemarkCount: item.LabRemarkCount || 0,
        RemarksList: remarksList,
        IsPartialResult: item.IsPartialResult,
      };

      if (tempObject[key]) {
        const existing = tempObject[key];
        existing.TestName += checkboxHTML;
        existing.TestDetails.push(testDetails);
        existing.TestID += `${item.TestID},`;
        existing.LabRemarkCount += item.LabRemarkCount || 0;
        existing.RemarksList = [...existing.RemarksList, ...remarksList];
        existing.IssueCount += Number(item.IssueCount) || issueRemarkList.length;
        existing.IssueRemarkList = [...existing.IssueRemarkList, ...issueRemarkList];
        existing.isUrgent = existing.isUrgent || item.isUrgent;
        if (!existing.DepartmentIDs.includes(Number(item.DepartmentID))) {
          existing.DepartmentIDs.push(Number(item.DepartmentID));
        }

        if (!existing.DepartmentCodes.includes(String(item.DepartmentCode))) {
          existing.DepartmentCodes.push(String(item.DepartmentCode));
        }
        if (
          !existing.TestCentreID.includes(
            Number(item.TestCentreIDManual)
          )
        ) {
          existing.TestCentreID.push(
            Number(item.TestCentreIDManual)
          );
        }
        if (item.SinNo && !existing.SinNoList.includes(item.SinNo)) {
          existing.SinNoList.push(item.SinNo);
        }
        existing.statusArray = [...(existing.statusArray || []), itemStatus];
      } else {
        tempObject[key] = {
          ...item,
          TestName: checkboxHTML,
          TestDetails: [testDetails],
          TestID: `${item.TestID},`,
          LabRemarkCount: item.LabRemarkCount || 0,
          RemarksList: remarksList,
          IssueCount: Number(item.IssueCount) || issueRemarkList.length,
          IssueRemarkList: issueRemarkList,
          DepartmentIDs: [Number(item.DepartmentID)],
          DepartmentCodes: [String(item.DepartmentCode)],
          TestCentreID: [Number(item.TestCentreIDManual)],
          SinNoList: item.SinNo ? [item.SinNo] : [],
          statusArray: [itemStatus],
        };
        order.push(key); // track insertion order
      }
    }

    // Build final array in backend order
    return order.map((key) => {
      const entry = tempObject[key];
      entry.TestID = entry.TestID.slice(0, -1); // remove trailing comma
      entry.SinNo = entry.SinNoList.join(", ");
      return entry;
    });
  }

  const setArrangeMentOfData = (data, subData) => {
    let mainData = [];
    subData.map((ele, index) => {
      data.map((eleInner, indexInner) => {
        if (String(ele?.TestID) === String(eleInner?.TestID)) {
          eleInner.Printwithhead = eleInner.Printwithhead
            ? eleInner.Printwithhead
            : 0;
          mainData = [...mainData, eleInner];
        }
      });
    });
    if (mainData.length === 0 && Array.isArray(data) && data.length > 0) {
      mainData = data;
    }
    setResultData(mainData);
  };

  const prepareInitialData = (data) => {
    return data.map((row) => {
      const hasFormula = !!row.Formula;

      return {
        ...row,

        // ✅ mark as user edited IF value already exists from backend
        isUserEdited:
          hasFormula &&
          row.Value !== "",
        // &&
        // Number(row.AllowEditCalculationValue) === 1,

        // ✅ store original value
        OriginalValue: row.Value || "",
      };
    });
  };

  const GetResultEntry = (
    payload,
    index,
    loading,
    sampleStatusAtAction = "",
  ) => {
    if (payload?.from === "testClick") {
      setIsSingleTestMode(true);
    } else if (payload?.from === "resultClick") {
      setIsSingleTestMode(false);
    }

    setCopyPayload(payload);
    loading && loading(true);
    setSelectedRowIndex(index);
    axiosInstance
      .post("RE/GetResultEntryData", {
        ...payload,
        // TestID:"14",
        // sampleStatus: sampleStatusAtAction || payload?.sampStatus,
        MacID: payload?.MacID ?? "",
        // MacID:
        //   payload?.MacID != ""
        //     ? payload?.MacID
        //     :  "",
      })
      .then((res) => {
        try {
        const rawMsg = res?.data?.message;
        const data = Array.isArray(rawMsg?.message)
          ? rawMsg.message
          : Array.isArray(rawMsg)
          ? rawMsg
          : Array.isArray(res?.data?.data?.message)
          ? res.data.data.message
          : Array.isArray(res?.data?.data)
          ? res.data.data
          : [];
        console.log("res?.data?.message", res?.data?.message);

        if (Array.isArray(data) && data.length > 0) {
          const formatted = prepareInitialData(data);
          // Prepare final val[]
          const val = formatted?.map((ele) => {
            const rosterDoctor = resolveApprovalDoctor({
              defaultSignatureID: ele?.DefaultSignatureID,
              currentApprovedBy: payload?.ApprovedBy,
              doctorAdmin,
            });
            return {
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
            MachineId: Number(payload?.MacID) ?? 0,
            MacID: ele?.MacID || payload?.MacID || "",
            COMMENT: ele?.COMMENT ? ele?.COMMENT : "",
            ApprovedBy: rosterDoctor.approvedBy,
            IsDutyRosterLocked: rosterDoctor.locked,
            LedgertransactionIDHash: payload?.LedgertransactionIDHash,
            Status: Number(ele?.Status || 3),
            TotalAgeInDays: ele?.TotalAgeInDays,
            VisitNo: payload?.VisitNo,
            isOutSource: payload?.isOutSource,

            // ✔ Keep exact backend value. Header rows are stored as "HEAD" —
            // that is not a real result; leave the Value box empty so the row
            // still has the same controls as every other observation.
            Value:
              Number(ele?.Header) === 1 &&
              String(ele?.Value || "").toUpperCase() === "HEAD"
                ? ""
                : (ele?.Value ?? ""),
            // isUserEdited: false,
          };
          });

          // Prepare TestHeader
          const rawHeader = res?.data?.message?.testHeader || res?.data?.testHeader || res?.data?.data?.testHeader;
          const dataTestHeader = Array.isArray(rawHeader) && rawHeader.length > 0
            ? rawHeader
            : [{
                InvestigationID: data[0]?.InvestigationID || 1,
                TestName: data[0]?.TestName || payload?.TestName || "Complete Blood Count (CBC)",
                TestID: data[0]?.TestID || payload?.TestID || 201,
                LedgerTransactionID: data[0]?.LedgerTransactionID || payload?.LedgerTransactionID || 2,
                VisitNo: payload?.VisitNo || "WO-20261105-00001",
                Department: data[0]?.Department || "Hematology",
                DepartmentID: data[0]?.DepartmentID || 1,
                Status: data[0]?.Status || 3,
                Printwithhead: 1,
                IsDLCCheck: 0,
                IsSampleCollected: "Y",
                Approved: 0,
                DefaultSignatureID: 1,
              }];
          let isPreviousResult = false;

          const valTestHeader = dataTestHeader?.map((ele) => {
            if (ele?.OldValueDate) isPreviousResult = true;
            const rosterDoctor = resolveApprovalDoctor({
              defaultSignatureID: ele?.DefaultSignatureID || val[0]?.DefaultSignatureID,
              currentApprovedBy: payload?.ApprovedBy,
              doctorAdmin,
            });

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
              MachineId: Number(payload?.MacID) ?? 0,
              MacID: payload?.MacID ?? ele?.MacID ?? "",
              labObservationID: ele?.InvestigationID,
              Printwithhead: ele?.Printwithhead || 0,
              ApprovedBy: rosterDoctor.approvedBy,
              IsDutyRosterLocked: rosterDoctor.locked,
              VisitNo: payload?.VisitNo,
              ShowDLC: ele?.IsDLCCheck,
            };
          });

          setIsPreviousResultAvailable(isPreviousResult);
          const finalTestHeader =
            payload?.forceHeaderStatus != null
              ? valTestHeader.map((t) => ({ ...t, Status: payload.forceHeaderStatus }))
              : valTestHeader;
          setResultTestData(finalTestHeader);
          const investigationIds = valTestHeader.map((ele) => ele.labObservationID);
          getInvestigationsListData(investigationIds, val, valTestHeader);
          if (payload?.isEyeModal) {
            setEyeModalConfig({ show: true, data: redata[index], index: index, isModal: false });
          } else if (payload?.isEditModal) {
            setEyeModalConfig({ show: true, data: redata[index], index: index, isModal: true });
          }
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
          console.log("currentRecord", currentRecord);

          // if (currentRecord?.Status === "1")
          //   toast.error("Sample not collected yet");
          // else if (currentRecord?.Status === "2")
          //   toast.error("Department not received yet");
          // else if (currentRecord?.Status === "4")
          //   toast.error("Sample rejected. Please recollect sample");
          // else toast.error(t("No Data Found"));

          if (!res?.data?.success) {
            toast.error(
              res?.data?.message?.length > 0 ? res?.data?.message : "No Data Found "
            );
          }

          setEyeModalConfig({ show: false, data: null, index: null });
          // setResultData([]);
          // setResultTestData([]);
          loading && loading(false);
        }
        } catch (err) {
          console.error("GetResultEntry", err);
          loading && loading(false);
          toast.error(err?.message || t("Unable to load result"));
        }
      })
      .catch((err) => {
        toast.error(
          err?.response?.data?.message
            ? err?.response?.data?.message
            : t("No Record Found"),
        );
        loading && loading(false);
        setEyeModalConfig({ show: false, data: null, index: null });
        // setResultData([]);
        // setResultTestData([]);
      });
  };

  console.log("ResultData::", ResultData);

  const callGetResultEntryByTest = (testData, index = 0, testCentreID = [0]) => {
    console.log("testCentreID", testCentreID);
    setIsSingleTestMode(true);
    setIncludeDepartment(false);
    GetResultEntry(
      {
        TestID: testData?.toString(),
        TestCentreIDManual: testCentreID,
        LedgerTransactionID: Number(selectedData?.LedgerTransactionID) || 0,
        DepartmentID: [],
        DepartmentCode: [],
        symbol: "",
        Mobile: copyPayload?.Mobile ?? "",
        VisitNo: copyPayload?.VisitNo ?? "",
        PEmail: copyPayload?.PEmail ?? "",
        MacID: "",
        LedgertransactionIDHash: Number(copyPayload?.LedgertransactionIDHash) ?? 0,
        isOutSource: copyPayload?.isOutSource ?? "",
        index: index,
        ApprovedBy: "",
        SelectedDepartmentId: selectedDepartment || [0],
        isEyeModal: eyeModalConfig.show && !eyeModalConfig.isModal,
        isEditModal: eyeModalConfig.show && eyeModalConfig.isModal,
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

  // Accumulate TestID -> Status instead of relying only on the currently
  // loaded ResultData, since navigating via a test-name tab (single test
  // mode) replaces ResultData with just that one TestID's rows and would
  // otherwise wipe out the colors of every other test's tab.
  // Source from ResultTestData (one entry per test) rather than ResultData
  // (one entry per observation/parameter) - the latter's Status is per
  // parameter and can disagree with the test-level status the tab color
  // is meant to show, which made the active test's own tab go stale/wrong
  // as soon as it loaded.
  useEffect(() => {
    if (!ResultTestData?.length) return;
    ResultTestData.forEach((row) => {
      if (row?.TestID != null) everLiveTestIDsRef.current.add(row.TestID);
    });
    setTestStatusMap((prev) => {
      let changed = false;
      const next = { ...prev };
      ResultTestData.forEach((row) => {
        // A single-test-mode batch can include rows with no Status of their own
        // (e.g. related observations) - skip those instead of clobbering an
        // already-known-good cached status for that TestID with blank/undefined.
        if (row?.TestID != null && row?.Status != null && next[row.TestID] !== row.Status) {
          next[row.TestID] = row.Status;
          changed = true;
        }
      });
      return changed ? next : prev;
    });
  }, [ResultTestData]);

  // Seed TestID -> Status for every test in the visit as soon as a row is
  // selected, using the statuses already known from the list (selectedData
  // .TestDetails) - the same data that colors the test boxes in the outer
  // grid. Single-test-mode entry (clicking a test name directly) only ever
  // fetches/loads the ONE clicked test, so without this seed every other
  // test's tab has no known status yet and renders uncolored until that
  // test is individually opened.
  useEffect(() => {
    const testDetails = selectedData?.TestDetails;
    if (!Array.isArray(testDetails) || !testDetails.length) return;
    // TestIDs that have EVER been loaded live (via ResultTestData) are authoritative
    // and must never be clobbered by this seed - selectedData.TestDetails is a
    // snapshot from whenever the record was first opened and does NOT get refreshed
    // just by navigating between test tabs, so a test approved after that snapshot
    // was taken would otherwise get its status reverted back to stale/unapproved the
    // moment you click away to another tab. Only truly-never-seen TestIDs get seeded
    // from this snapshot.
    setTestStatusMap((prev) => {
      let changed = false;
      const next = { ...prev };
      testDetails.forEach((t) => {
        if (
          t?.TestID != null &&
          t?.Status != null &&
          !everLiveTestIDsRef.current.has(t.TestID) &&
          next[t.TestID] !== t.Status
        ) {
          next[t.TestID] = t.Status;
          changed = true;
        }
      });
      return changed ? next : prev;
    });
  }, [selectedData, ResultTestData]);

  // Entering the detail view via a filtered search (e.g. "search by test name")
  // means the search-results row that seeded testStatusMap above only ever
  // contained the ONE matching test — none of its siblings. A plain/unfiltered
  // search returns every test for the patient in one row, so this gap only shows
  // up when the list itself was narrowed server-side. Backfill by re-querying this
  // one visit (by VisitNo, no test-name filter) so every sibling tab gets the same
  // live status a normal search would already have given it, instead of falling
  // back to the AllTestDetails snapshot (which can lag behind actual Mac Data).
  useEffect(() => {
    const header = ResultTestData?.[0];
    const visitNo = header?.LedgerTransactionNo;
    if (!header?.AllTestDetails || !visitNo) return;
    if (seededSiblingVisitRef.current === visitNo) return;

    const allTestIDs = header.AllTestDetails
      .split("#")
      .map((seg) => Number(seg.split("$")[0]))
      .filter((id) => !Number.isNaN(id));

    const knownIDs = new Set([
      ...Object.keys(testStatusMap).map(Number),
      ...(ResultTestData || []).map((r) => r?.TestID).filter((id) => id != null),
    ]);

    if (allTestIDs.every((id) => knownIDs.has(id))) return; // already fully known

    seededSiblingVisitRef.current = visitNo;

    axiosInstance
      .post(
        "RE/GetResultEntry",
        getTrimmedData({
          CentreID: [],
          testCentreID: null,
          ShowAllCheckBarcodeOption: 0,
          CollectionBoyID: 0,
          SelectTypes: "VisitNo",
          ItemValue: visitNo,
          RateTypeID: [],
          DoctorReferal: "",
          FromDate: moment().subtract(179, "days").format("DD/MMM/YYYY"),
          ToDate: moment().format("DD/MMM/YYYY"),
          FromTime: "00:00:00",
          ToTime: "23:59:59",
          DepartmentID: [],
          SampleStatus: "",
          TestName: "",
          DateTypeSearch: "Date",
          IsUrgent: 0,
          IsVip: 0,
          MachineID: "0",
          IsTat: 0,
          Order: "",
          Flag: "",
          moreFilter: 0,
          parameterId: [],
          valueCheck: "",
          valueToSearch: "",
          valueRangeFrom: "",
          valueRangeTo: "",
          WardNo: "",
          IsOutSource: 0,
          PackageID: 0,
          ProEmployeeID: 0,
          IsForward: 0,
          remarks: "",
          RemarkID: 0,
          HLMPatientType: "ALL",
        }),
      )
      .then((res) => {
        const rows = Array.isArray(res?.data?.message) ? res.data.message : [];
        if (!rows.length) return;
        setTestStatusMap((prev) => {
          let changed = false;
          const next = { ...prev };
          rows.forEach((row) => {
            const id = row?.TestID;
            const rowStatus = row?.Status != null ? Number(row.Status) : null;
            if (id != null && rowStatus != null && !knownIDs.has(id) && next[id] !== rowStatus) {
              next[id] = rowStatus;
              changed = true;
            }
          });
          return changed ? next : prev;
        });
      })
      .catch(() => {
        // Best-effort enrichment only — sibling tabs just keep showing whatever
        // AllTestDetails already gave them if this lookup fails.
      });
  }, [ResultTestData]);

  const handleDoctorName = (e) => {
    if (ResultTestData[0]?.IsDutyRosterLocked) return;
    const { name, value } = e.target;
    const data = ResultTestData?.map((ele) => {
      return {
        ...ele,
        [name]: value,
      };
    });

    setResultTestData(data);

    // ResultData (the per-observation rows sent as the "data" array on save) is a
    // separate array from ResultTestData (sent as "HeaderInfo") - without also stamping
    // it here, the doctor picked on this dropdown only ever lands in HeaderInfo.ApprovedBy;
    // every row in "data" keeps whatever stale ApprovedBy it was fetched with (usually "0"),
    // so stampApprovedBy() at save time has nothing to pick up and falls back to "0".
    const observationData = ResultData?.map((ele) => {
      return {
        ...ele,
        [name]: value,
      };
    });

    setResultData(observationData);
  };

  const handleMachineChange = (e) => {
    const { name, value } = e.target;
    const testData = ResultTestData?.map((ele) => {
      return {
        ...ele,
        [name]: value,
        MacID: value,
      };
    });
    setResultTestData(testData);

    const data = ResultData?.map((ele) => {
      return {
        ...ele,
        [name]: value,
        MacID: value,
      };
    });
    setResultData(data);

    // Trigger API call to fetch machine-specific data
    if (copyPayload && Object.keys(copyPayload).length > 0) {
      GetResultEntry(
        {
          ...copyPayload,
          MacID: value,
          isEyeModal: eyeModalConfig.show && !eyeModalConfig.isModal,
          isEditModal: eyeModalConfig.show && eyeModalConfig.isModal,
        },
        copyPayload.index,
        setLoading
      );
    }
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
    // console.log("skhwioerwefhkjefhkjsehkfj::testid::", testid);
    if (!Array.isArray(ResultData) || ResultData.length === 0) return changed;
    // console.log("skhwioerwefhkjefhkjsehkfj::testid:::", testid);

    const packageRows = ResultData.filter((r) => r.TestID === testid);

    const tgOverrideActive = packageRows.some(
      (r) => Number(r?.IsTG) === 1 && parseFloat(r?.Value || 0) > 350,
    );

    for (let i = 0; i < packageRows.length; i++) {
      const test = packageRows[i];

      // if (
      //   Number(test?.AllowEditCalculationValue) === 1 &&
      //   test.isUserEdited
      // ) {
      //   continue;
      // }

      // if (!test.Formula) continue;

      // ✅ 1. If user already edited → NEVER recalculate
      if (test.isUserEdited) {
        continue;
      }

      // ✅ 2. If value came from API (saved earlier) → NEVER override
      if (
        test.OriginalValue !== "" &&
        test.Value === test.OriginalValue
      ) {
        continue;
      }


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
            if (
              Formula.includes(`${obs.labObservationID}&`) &&
              (!obs.Value || obs.Value === "")
            ) {
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
          // console.log("come",hasAllDependentValues);
          if (hasAllDependentValues) {
            // console.log("inside");
            const raw = new Function('return ' + Formula)();
            const vv =
              isFinite(raw) && !isNaN(raw) ? Math.round(raw * 100) / 100 : NaN;
            const computedValue = isNaN(vv) ? "" : vv.toString();

            // Always show computed value, including 0
            if (test.Value !== computedValue) {
              test.Value = computedValue;
              changed = true;
            }
          } else {
            console.log("value empty")
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
  const handleValueChange = (index, value, testID, editCal) => {
    const processedValue = Number(AllowSpecialCharacterInNumericValue) !== 1
      ? value.replace(/,/g, "")
      : value;

    // if (processedValue.startsWith("-") || parseFloat(processedValue) < 0) {
    //   setInvalidNegativeIndex(index);
    //   toast.warn(t("Negative values are not allowed"), {
    //     toastId: "negative-result-value",
    //   });
    //   return;
    // }
    if (processedValue.startsWith("-")){
      return;
    }

    // const row = ResultData?.[index];
    // const isNumericObservation =
    //   String(row?.ReportType) === "1" &&
    //   Number(row?.IsHelpMenu) !== 1 &&
    //   Number(row?.Header) !== 1;
    // const numericBody = String(processedValue || "")
    //   .trim()
    //   .replace(/^([<>]=?)/, "")
    //   .trim();
    // const isNumericValue =
    //   processedValue === "" ||
    //   numericBody === "" ||
    //   /^-?\d+(\.\d+)?$/.test(numericBody);
    // if (isNumericObservation && processedValue !== "" && !isNumericValue) {
    //   setInvalidNegativeIndex(index);
    //   toast.warn(t("Only numeric values are allowed"), {
    //     toastId: "non-numeric-result-value",
    //   });
    //   return;
    // }

    // setInvalidNegativeIndex((prev) => (prev === index ? null : prev));
    setResultData((prev) => {
      let updated = [...prev];

      // Update the changed value
      updated[index] = {
        ...updated[index],
        Value: processedValue || "",
        isUserEdited:
          Number(updated[index]?.AllowEditCalculationValue) === 1 &&
            updated[index]?.Formula
            ? true
            : false,
      };

      // Handle flag calculation for the changed value
      const modifiedValue = processedValue.includes("<")
        ? parseFloat(processedValue.split("<")[1]) - 0.1
        : processedValue.includes(">")
          ? parseFloat(processedValue.split(">")[1]) + 0.1
          : processedValue;

      if (
        (parseFloat(updated[index]["MaxValue"]) != 0 &&
          parseFloat(updated[index]["MinValue"]) != 0) ||
        parseFloat(updated[index]["MaxValue"]) > 0 ||
        parseFloat(updated[index]["MinValue"]) > 0 ||
        parseFloat(updated[index]["MaxValue"]) < 0 ||
        parseFloat(updated[index]["MinValue"]) < 0
      ) {
        if (
          parseFloat(modifiedValue) > parseFloat(updated[index]["MaxValue"])
        ) {
          updated[index]["Flag"] = "High";
        }
        if (
          parseFloat(modifiedValue) < parseFloat(updated[index]["MinValue"])
        ) {
          updated[index]["Flag"] = "Low";
        }
        if (
          parseFloat(modifiedValue) >= parseFloat(updated[index]["MinValue"]) &&
          parseFloat(modifiedValue) <= parseFloat(updated[index]["MaxValue"])
        ) {
          updated[index]["Flag"] = "Normal";
        }
      }

      if (processedValue === "") {
        updated[index]["Flag"] = "";
      }

      // Recalculate dependent formulas
      const changedObsId = updated[index].labObservationID;

      //N

      updated.forEach((row) => {
        if (
          row.Formula &&
          row.Formula.includes(`${changedObsId}&`)
        ) {
          row.isUserEdited = false;
        }
      });

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

    updated.forEach((row) => {
      // if (row.Formula && row.Formula.includes(`${changedObservationId}&`)) {
      //   row.Value = evaluateFormula(row.Formula, updated);
      // }

      //N
      if (
        row.Formula &&
        row.Formula.includes(`${changedObservationId}&`) &&
        !(
          Number(row?.AllowEditCalculationValue) === 1 &&
          row.isUserEdited
        )
      ) {
        row.Value = evaluateFormula(row.Formula, updated);
      }
    });

    return updated;
  };

  const handleForward = () => {
    const payload = {
      TestID: forwardFormData.test,
      CentreID: forwardFormData.centre,
      DoctorID: forwardFormData.doctor,
    };
    axiosInstance.post("RE/ForwardResultEntryToDoctor", payload).then((res) => {
      if (res.data.success) {
        toast.success(res.data.message);
        setShowForwardDialog(false);
        setForwardFormData({ centre: "", test: "", doctor: "" });
      } else {
        toast.error(res.data.message);
      }
    });
  };

  const evaluateFormula = (formula, rows) => {
    if (!formula) return "";

    let expression = formula;

    rows.forEach((r) => {
      const value = parseFloat(r.Value);
      expression = expression.replaceAll(
        `${r.labObservationID}&`,
        isNaN(value) ? 0 : value,
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

  const updatedIsTGGreaterThan400 = () => {
    const tgOverrideActive = ResultData.map((r) => {
      if (Number(r?.IsTG) === 1 && parseFloat(r?.Value || 0) > 350) {
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

  const getIsPartialResult = (testID, dataRows) => {
    const rows = (dataRows || []).filter((r) => r?.TestID === testID);
    if (!rows.length) return 1;
    // Rows with ReportType 2/3 have no Value field (comment/body only) —
    // they can't count toward an empty-Value partial-result check.
    const valueRows = rows.filter((r) => !["2", "3"].includes(r?.ReportType));
    if (!valueRows.length) return 0;
    return valueRows.some((r) => r?.Value === "" || r?.Value == null) ? 1 : 0;
  };

  const isApproveField = (field) => {
    const name = String(field || "").trim().toLowerCase();
    return name === "approved" || name === "approve";
  };

  const isHivPrintField = (field) => {
    const name = String(field || "").trim().toLowerCase();
    return name.includes("hiv") && name.includes("print");
  };

  const resolveSaveApprovedBy = (item) => {
    const doc = ResultTestData[0]?.ApprovedBy || item?.ApprovedBy || "";
    if (doc && String(doc) !== "0" && String(doc).trim() !== "") {
      return String(doc).trim();
    }
    return "";
  };

  const withApprovalDoctor = (rows = []) =>
    (rows || []).map((item) => ({
      ...item,
      ApprovedBy: resolveSaveApprovedBy(item),
    }));

  const pickApproveRows = (rows = []) => {
    const list = Array.isArray(rows) ? rows : [];
    const checked = list.filter(
      (ele) =>
        ele?.isChecked === true ||
        ele?.isChecked === 1 ||
        ele?.isChecked === "1",
    );
    const source = checked.length ? checked : list;
    const notSignedOff = source.filter(
      (ele) => ![5, 6, 11].includes(Number(ele?.Status)),
    );
    return notSignedOff.length ? notSignedOff : source;
  };

  const validatePayload = (payload) => {
    const errors = [];

    for (let i = 0; i < payload.length; i++) {
      const item = payload[i];
      const missingFields = [];

      if (item.DisplayReadingMandatory === 1 && !item.DisplayReading?.trim()) {
        missingFields.push("Display Reading");
      }

      if (item.MaxReadingMandatory === 1 && !item.MaxValue?.toString().trim()) {
        missingFields.push("Max Value");
      }

      if (item.MinReadingMandatory === 1 && !item.MinValue?.toString().trim()) {
        missingFields.push("Min Value");
      }

      if (item.MethodMandatory === 1 && !item.MethodName?.trim()) {
        missingFields.push("Method Name");
      }

      if (item.UnitManadatory === 1 && !item.ReadingFormat?.trim()) {
        missingFields.push("Unit");
      }

      if (missingFields.length > 0) {
        errors.push(`${item.TestName} - ${missingFields.join(", ")} required`);
      }
    }

    return errors.length > 0 ? errors : null;
  };
  const fetchApi = (field, payload, headerData) => {
    console.log("field", field, payload, headerData);
    try {
    const resultStatus = isApproveField(field) ? "Approved" : field;

    setLoading(true);
    let workingHeader = Array.isArray(headerData) && headerData.length
      ? headerData
      : (Array.isArray(ResultTestData) ? ResultTestData : []);
    if (!workingHeader?.length && payload?.length) {
      const seen = new Set();
      workingHeader = (payload || []).filter((p) => {
        if (seen.has(p?.TestID)) return false;
        seen.add(p?.TestID);
        return true;
      });
    }

    const ModifiedHeaderData = (workingHeader || []).map((ele) => {
      return {
        ...ele,
        IsHold: ele?.IsHold ?? 0,
      };
    });

    const result = getUnFilledValue(ModifiedHeaderData, payload || []);
    const isOutSource =
      Number(workingHeader?.[0]?.isOutSource) === 1 ||
      workingHeader?.[0]?.isOutSource === "true" ||
      workingHeader?.[0]?.isOutSource === true;
    const isSaveOrApproved =
      resultStatus === "Save" ||
      resultStatus === "Approved" ||
      resultStatus === "Dual Authentication";

    let result1 = isOutSource
      ? ModifiedHeaderData
      : isSaveOrApproved
        ? result?.newArr1
        : ModifiedHeaderData;
    let result2 = isOutSource
      ? payload
      : isSaveOrApproved
        ? result?.newArr2
        : payload;
    result1 = Array.isArray(result1) ? result1 : [];
    result2 = Array.isArray(result2) ? result2 : [];
    console.log("result1,result2", result1, result2, isSaveOrApproved, result);

    if (result1?.length == 0) {
      if (
        (resultStatus === "Approved" && (payload?.length > 0 || ModifiedHeaderData?.length > 0)) ||
        isHivPrintField(resultStatus)
      ) {
        result1 = ModifiedHeaderData.length ? ModifiedHeaderData : (workingHeader || []);
        result2 = payload?.length ? payload : result2;
        result1 = Array.isArray(result1) ? result1 : [];
        result2 = Array.isArray(result2) ? result2 : [];
      } else {
        setLoading(false);
        toast.error("Please Enter An Entry For Any UnApproved Test.");
        return;
      }
    }
    else if ((resultStatus === "Save" || resultStatus === "Approved") && !isOutSource) {
      setLoading(false);
      const validationError = validatePayload(payload);
      console.log("validationError", validationError);
      if (validationError && resultStatus !== "Approved") {
        toast.error(validationError.join(" \n "));
        return;
      }
    }
    // else {
    if (resultStatus == "Approved") {
      // console.log("approved");
      const details = {
        data: (result2 || []).map((ele) => {
          const obj = {
            ...ele,
            Value: ele?.Value?.toString(),
            ApprovedBy: resolveSaveApprovedBy(ele),
            CommentID: ele?.CommentID?.toString(),
            HelpMenuBold: ele?.HelpMenuBold ?? 0,
            MinCritical: ele?.MinCritical != null && ele?.MinCritical !== "" ? Number(ele?.MinCritical) : null,
            MaxCritical: ele?.MaxCritical != null && ele?.MaxCritical !== "" ? Number(ele?.MaxCritical) : null,
          };
          delete obj.IsNablInvestigation;
          return obj;
        }),
        ResultStatus: resultStatus,
        IsCritical: 0,
        HeaderInfo: result1?.map((item, _) => ({
          ...item,
          isNablInvestigation: result2?.[0]?.IsNablInvestigation,
          ApprovedBy: resolveSaveApprovedBy(item),
          isPartialResult: getIsPartialResult(item?.TestID, payload),
        })),
      };

      setmodalPayload({ ...details, IsCritical: 1 });
      axiosInstance
        .post("RE/SaveResultEntry", {
          data: (result2 || []).map((ele) => {
            const obj = {
              ...ele,
              PatientID: ele?.PatientID,
              Dignomasterid: Number(ele?.Dignomasterid),
              DignoName: (Array.isArray(DignosticMaster) ? DignosticMaster : []).find(
                (data) => data.value == ele.Dignomasterid,
              )?.label,
              Value: ele?.Value?.toString(),
              ApprovedBy: resolveSaveApprovedBy(ele),
              CommentID: ele?.CommentID?.toString(),
              HelpMenuBold: ele?.HelpMenuBold ?? 0,
              Flag: ele?.IsHelpMenu && ele?.HelpMenuBold ? "High" : ele?.Flag,
              MacID: ele?.MachineId || ele?.MacID || 0,
              MinCritical: ele?.MinCritical != null && ele?.MinCritical !== "" ? Number(ele?.MinCritical) : null,
              MaxCritical: ele?.MaxCritical != null && ele?.MaxCritical !== "" ? Number(ele?.MaxCritical) : null,
            };
            delete obj.IsNablInvestigation;
            return obj;
          }),
          ResultStatus: resultStatus,
          HeaderInfo: result1?.map((item, _) => ({
            ...item,
            PatientID: item?.PatientID,
            isNablInvestigation: result2?.[0]?.IsNablInvestigation,
            ApprovedBy: resolveSaveApprovedBy(item),
            MacID: item?.MachineId || item?.MacID || 0,
            isPartialResult: getIsPartialResult(item?.TestID, payload),
          })),
        })

        .then((res) => {
          if (!res?.data?.success) {
            toast.error(res?.data?.message || "Error Occured");
            setLoading(false);
            return;
          }

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
              const testidhash = (ResultTestData || []).map((obj) => obj.TestID);
              const isAutoNext =
                AllowAutoNextApproveResultEntry == "1" && canMoveToNext(true);

              if (isAutoNext) {
                handleNext();
              } else if (OnAppGoToMainList == 0) {
                GetResultEntry(
                  {
                    TestID: testidhash.join(","),
                    TestCentreIDManual: selectedData?.TestCentreID || [0],
                    LedgerTransactionID: selectedData?.LedgerTransactionID || 0,
                    DepartmentID: includeDepartment
                      ? selectedData?.DepartmentIDs || []
                      : [],
                    DepartmentCode: includeDepartment
                      ? selectedData?.DepartmentCodes || []
                      : [],
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
                    SelectedDepartmentId: selectedDepartment || [0],
                    isEyeModal: eyeModalConfig.show && !eyeModalConfig.isModal,
                    isEditModal: eyeModalConfig.show && eyeModalConfig.isModal,
                    forceHeaderStatus: 5,
                  },
                  ResultData[0]?.currentIndex,
                  setLoading,
                );

                // ✔ FIX: Manually update status to enable Unapproved button immediately
                setResultTestData((prev) =>
                  (Array.isArray(prev) ? prev : []).map((test) => ({
                    ...test,
                    Status: 5,
                  }))
                );
              } else {
                setResultTestData([]);
                setResultData([]);
              }

              const updatedTestIds = result2?.map(r => r.TestID);

              SetReData((prev) =>
                (Array.isArray(prev) ? prev : []).map((row) => {
                  if (row.VisitNo === result2?.[0]?.LedgerTransactionNo) {
                    return {
                      ...row,
                      TestDetails: row?.TestDetails?.map((test) =>
                        updatedTestIds?.includes(test.TestID)
                          ? {
                            ...test,
                            Status: String(5),
                            IsApproved: 1,
                          }
                          : test
                      ),
                    };
                  }
                  return row;
                })
              );

              // handleReport("Yes", headerData);
              toast.success(res?.data?.message);
              // setDlcCheckChecked(true);
            }
          }
          setLoading(false);
          // TableData(document.getElementById("SampleStatus")?.value ??
          //   formData?.SampleStatus)
        })
        .catch((err) => {
          setLoading(false);

          toast.error(
            err?.response?.data?.message
              ? err?.response?.data?.message
              : "Error Occured",
          );
          // setResultData([]);
        });
    } else {
      // console.log("other than approved");
      const chosenDoctor = resolveSaveApprovedBy(result1?.[0]);
      axiosInstance
        .post("RE/SaveResultEntry", {
          doctorId: chosenDoctor,
          ApprovedBy: chosenDoctor,
          data: (result2 || []).map((ele) => {
            const obj = {
              ...ele,
              Dignomasterid: Number(ele?.Dignomasterid),
              DignoName: (Array.isArray(DignosticMaster) ? DignosticMaster : []).find(
                (data) => data.value == ele.Dignomasterid,
              )?.label,
              Value: ele?.Value?.toString(),
              ApprovedBy: chosenDoctor,
              CommentID: ele?.CommentID?.toString(),
              HelpMenuBold: ele?.HelpMenuBold ?? 0,
              Flag: ele?.IsHelpMenu && ele?.HelpMenuBold ? "High" : ele?.Flag,
              MacID: ele?.MachineId || ele?.MacID || 0,
              MinCritical: ele?.MinCritical != null && ele?.MinCritical !== "" ? Number(ele?.MinCritical) : null,
              MaxCritical: ele?.MaxCritical != null && ele?.MaxCritical !== "" ? Number(ele?.MaxCritical) : null,
            };
            delete obj.IsNablInvestigation;
            return obj;
          }),
          ResultStatus: resultStatus,
          HeaderInfo: result1?.map((item, _) => ({
            ...item,
            isNablInvestigation: result2?.[0]?.IsNablInvestigation,
            ApprovedBy: chosenDoctor,
            MacID: item?.MachineId || item?.MacID || 0,
            isPartialResult: getIsPartialResult(item?.TestID, payload),
          })),
        })
        .then((res) => {
          setLoading(false);
          if (res?.data?.success) {
            const updatedTestIds = result2?.map(r => r.TestID);

            console.log("updatedTestIds", updatedTestIds);

            SetReData((prev) =>
              (Array.isArray(prev) ? prev : []).map((row) => {
                if (row.VisitNo === result2?.[0]?.LedgerTransactionNo) {
                  return {
                    ...row,
                    TestDetails: row?.TestDetails?.map((test) =>
                      (updatedTestIds || []).includes(test.TestID)
                        ? {
                          ...test,
                          Status: (field === "Save" || field === "Unhold" || field === "Not Approved") ? String(10) : (field === "Hold" ? String(11) : test.Status),
                          IsApproved: field === "Approved" ? 1 : 0,
                        }
                        : test
                    ),
                  };
                }
                return row;
              })
            );
            toast.success(res.data.message);
            // setResultData([]);
            // console.log(payload);
            // setDlcCheckChecked(true);
            if (field === "Not Approved" && DefaultCurrencyName === "KES") {
              getNotApprovedReport(result2?.[0]);
            }
            const testidhash = (ResultTestData || []).map((obj) => obj.TestID);
            console.log("testidhash", testidhash);
            // (field === "Hold" || field === "Unhold") &&
            const isAutoNext =
              ((AllowAutoNextSaveResultEntry == "1" && field === "Save") ||
                (AllowAutoNextApproveResultEntry == "1" && (field === "Approved" || field === "Dual Authentication"))) && canMoveToNext(field === "Save");
            console.log("isAutoNext", isAutoNext);
            if (isAutoNext) {
              handleNext();
            } else {
              GetResultEntry(
                {
                  TestID: testidhash.join(","),
                  TestCentreIDManual: selectedData?.TestCentreID || [0],
                  LedgerTransactionID: selectedData?.LedgerTransactionID || 0,
                  DepartmentID: includeDepartment
                    ? selectedData?.DepartmentIDs || []
                    : [],
                  DepartmentCode: includeDepartment
                    ? selectedData?.DepartmentCodes || []
                    : [],
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
                  SelectedDepartmentId: selectedDepartment || [0],
                  isEyeModal: eyeModalConfig.show && !eyeModalConfig.isModal,
                  isEditModal: eyeModalConfig.show && eyeModalConfig.isModal,
                },
                ResultData[0]?.currentIndex,
                setLoading
              );
            }
          } else {
            toast.error(res?.data?.message || "Error Occured");
          }

          // GetResultEntry(payload, index, loading);
        })
        .catch((err) => {
          setLoading(false);
          const errMessage = formatActionableError(err, "Failed to save diagnostic results");
          notify(errMessage, "error");
        });
    }
    } catch (err) {
      setLoading(false);
      console.error("fetchApi", err);
      toast.error(err?.message || t("Unable to save result"));
    }
    // } 
  };

  const getUnFilledValue = (arr1, arr2) => {
    const uniqueV = [...new Set((arr1 || []).map((item) => item.InvestigationID))];
    const filteredV = uniqueV.filter((InvestigationID) => {
      const values = (arr2 || [])
        .filter((item) => item.InvestigationID === InvestigationID)
        .map((item) => ({ Value: item.Value, Comment: item.COMMENT }));

      return values.some(
        ({ Value, Comment }) => Value !== "" || Comment !== "",
      );
    });

    const newArr1 = (arr1 || []).filter((item) =>
      filteredV.includes(item.InvestigationID),
    );

    const newArr2 = (arr2 || []).filter((item) =>
      filteredV.includes(item.InvestigationID),
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
  const validateData = (field, payload, message, headerData, skipCriticalCheck = false) => {
    console.log("field", field, payload);
    const isOutSource =
      Number(headerData?.[0]?.isOutSource) === 1 ||
      headerData?.[0]?.isOutSource === "true" ||
      headerData?.[0]?.isOutSource === true;

    if (payload?.length > 0) {
      const mandatoryRows = payload.filter(
        (item) =>
          item.isMandatory === 1 && item.ReportType !== "2" &&
          (item.Value === "" || item.Value == null)
      );

      // Doctor selection is mandatory for both Save and Approve
      const effectiveDoctor = ResultTestData[0]?.ApprovedBy || headerData?.[0]?.ApprovedBy || payload?.[0]?.ApprovedBy;
      if (!effectiveDoctor || String(effectiveDoctor) === "0" || String(effectiveDoctor).trim() === "") {
        setDoctorError("Doctor selection is mandatory. Please select a Doctor before saving.");
        toast.error("Doctor selection is mandatory. Please select a Doctor before saving.");
        return;
      } else {
        setDoctorError("");
      }

      if ((field === "Save" || field === "Dual Authentication") && !isOutSource) {
        if (mandatoryRows.length > 0) {
          toast.error(`Value is mandatory for: ${mandatoryRows.map(r => r.TestName).join(", ")}`);
          return;
        }
      }

      if (isApproveField(field) && !isOutSource) {
        const emptyRows = (payload || []).filter(
          (item) => item.ReportType !== "2" && (!item.Value || item.Value.toString().trim() === "")
        );
        if (emptyRows.length > 0) {
          toast.error("Please enter result values before approving the report");
          return;
        }
      }
      if (
        [
          "Save",
          "Approved",
          "Approve",
          "Hold",
          "Unhold",
          "Not Approved",
          "Dual Authentication",
          "Allow HIV Report Print",
        ].includes(field)
      ) {
        const headerWithDoctor = isApproveField(field)
          ? withApprovalDoctor(headerData)
          : headerData;
        const payloadWithDoctor = isApproveField(field)
          ? (payload || []).map((ele) => {
              const match = (headerWithDoctor || []).find(
                (h) => h.TestID === ele.TestID,
              );
              return {
                ...ele,
                ApprovedBy: resolveSaveApprovedBy({
                  ...ele,
                  ApprovedBy: match?.ApprovedBy ?? ele?.ApprovedBy,
                  DefaultSignatureID:
                    ele?.DefaultSignatureID || match?.DefaultSignatureID,
                }),
              };
            })
          : payload;
        fetchApi(isApproveField(field) ? "Approved" : field, payloadWithDoctor, headerWithDoctor);
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
                (payload[i].AMRMax > 0 && parseFloat(payload[i].Value) > parseFloat(payload[i].AMRMax)) ||
                (payload[i].AMRMin > 0 && parseFloat(payload[i].Value) < parseFloat(payload[i].AMRMin))
              ) {
                toast.error(
                  payload[i].TestName +
                  " value is greater or less than" +
                  payload[i].AMRMin +
                  " or " +
                  payload[i].AMRMax,
                );
                return;
              }
            }
            if (
              !Number(SkipCriticalCheck) &&
              !skipCriticalCheck &&
              (payload[i].MinCritical > 0 || payload[i].MaxCritical > 0) &&
              ((payload[i].MinCritical != null &&
                parseFloat(payload[i].Value) <= parseFloat(payload[i].MinCritical)) ||
                (payload[i].MaxCritical != null &&
                  parseFloat(payload[i].Value) >= parseFloat(payload[i].MaxCritical)))
            ) {
              setShowCriticalAlert({
                modal: true,
                field,
                data: payload,
                val: headerData,
                errorToast: message,
                message:
                  payload[i].TestName +
                  " value (" +
                  payload[i].Value +
                  ") is critical. Min Critical: " +
                  payload[i].MinCritical +
                  ", Max Critical: " +
                  payload[i].MaxCritical +
                  ". Do you want to approve anyway?",
              });
              return;
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
        const headerWithDoctor = (headerData || []).map((item) => ({
          ...item,
          ApprovedBy: resolveSaveApprovedBy(item),
        }));
        const payloadWithDoctor = (payload || []).map((ele) => {
          const match = headerWithDoctor.find((h) => h.TestID === ele.TestID);
          return {
            ...ele,
            ApprovedBy: resolveSaveApprovedBy({
              ...ele,
              ApprovedBy: match?.ApprovedBy ?? ele?.ApprovedBy,
              DefaultSignatureID:
                ele?.DefaultSignatureID || match?.DefaultSignatureID,
            }),
          };
        });

        for (let i = 0; i < headerWithDoctor.length; i++) {
          if (
            headerWithDoctor[i]["DualAuthentication"] == 1 &&
            headerWithDoctor[i]["DualAuthenticatedcount"] != 2
          ) {
            flag = 0;
            showMessage = `Can't Be Approved. For ${headerWithDoctor[i]?.PackageName} Dual Authentication Is Required`;
            break;
          }
        }

        if (flag == 1 || isOutSource) {
          fetchApi(field, payloadWithDoctor, headerWithDoctor);
        } else {
          toast.error(showMessage);
        }
      }
    } else if (isApproveField(field)) {
      fetchApi(
        "Approved",
        withApprovalDoctor(ResultData),
        withApprovalDoctor(ResultTestData),
      );
    } else {
      toast.error(message);
    }
  };
  // console.log(ResultTestData);
  const handleKeyDown = (e) => {
    if (e?.key === "Enter") {
      TableData("");
    }
  };
  const handleResultSubmit = (field, headData, skipModal = false) => {
    try {
    console.log("field, headData", field, headData);
    const errorToast = `This Test is ${DyanmicStatusResponse(ResultTestData)}`;
    if (isApproveField(field)) {
      const data = pickApproveRows(ResultData);
      const val = pickApproveRows(ResultTestData);

      if (!Number(HideOmitOptionatResultEntry)) {
        const omitted = data.filter(
          (ele) => ele.isOmit === 1 || ele.isOmit === true,
        );
        if (omitted.length > 0 && !skipModal) {
          setOmitTests(omitted);
          setModalAction("Approved");
          setShowOmitModal(true);
          return;
        }
      }

      validateData("Approved", data, errorToast, val);
    } else if (field === "Save") {
      const isRowChecked = (ele) => ele?.isChecked === true || ele?.isChecked === 1 || ele?.isChecked === "1";
      const hasAnyChecked = (ResultData || []).some(isRowChecked);
      const data = (ResultData || []).filter(
        (ele) =>
          [3, 10, 14, 13, 20, 25].includes(Number(ele?.Status || 3)) &&
          (hasAnyChecked ? isRowChecked(ele) : true),
      );
      const hasAnyTestChecked = (ResultTestData || []).some(isRowChecked);
      const val = (ResultTestData || []).filter(
        (ele) =>
          [3, 10, 14, 13, 20, 25].includes(Number(ele?.Status || 3)) &&
          (hasAnyTestChecked ? isRowChecked(ele) : true),
      );

      if (data.length === 0) {
        toast.error("Please enter observation values before saving results.");
        return;
      }

      if (!Number(HideOmitOptionatResultEntry)) {
        const omitted = data.filter(
          (ele) => ele.isOmit === 1 || ele.isOmit === true,
        );
        if (omitted.length > 0 && !skipModal) {
          setOmitTests(omitted);
          setModalAction("Save");
          setShowOmitModal(true);
          return;
        }
      }
      const isValueChanged = ResultData?.some((item) => {
        if (item?.OldValue == "") return false;
        return item?.Value != item?.OldValue;
      });
      if (isValueChanged) {
        setShowAlert({
          modal: true,
          field,
          data,
          val,
          errorToast,
        });
      } else {
        validateData(field, data, errorToast, val);
      }
    } else if (field === "Dual Authentication") {
      const data = ResultData.filter(
        (ele) =>
          [3, 10, 14, 13, 20, 25].includes(Number(ele?.Status)) &&
          ele?.isChecked === true,
      );
      const val = ResultTestData.filter(
        (ele) =>
          [3, 10, 14, 13, 20, 25].includes(Number(ele?.Status)) &&
          ele?.isChecked === true,
      );
      validateData(field, data, errorToast, val);
    } else if (field === "Not Approved") {
      const data = ResultData.filter((ele) => ele.TestID === headData.TestID);
      const val = ResultTestData.filter(
        (ele) => ele?.TestID === headData.TestID,
      );
      validateData(field, data, "This test is Not Approved", val);
    } else if (field === "Hold") {
      const payload = ResultData.filter(
        (ele) => ![5, 6].includes(Number(ele.Status)) && ele.isChecked === true,
      );
      const val = ResultTestData.filter(
        (ele) => ![5, 6].includes(Number(ele.Status)) && ele.isChecked === true,
      );
      validateData(field, payload, errorToast, val);
    } else if (field === "Unhold") {
      const data = ResultData.filter((ele) => ele.TestID === headData.TestID);
      const val = ResultTestData.filter(
        (ele) => ele?.TestID === headData.TestID,
      );
      const UnholdData = val?.map((ele) => {
        return {
          ...ele,
          IsHold: 0,
        };
      });

      validateData(field, data, t("This Test is not Hold"), UnholdData);
    } else if (isHivPrintField(field)) {
      const rows = Array.isArray(ResultData) ? ResultData : [];
      const headers = Array.isArray(ResultTestData) ? ResultTestData : [];
      const data = rows.filter((ele) => ele?.isChecked === true);
      const val = headers.filter((ele) => ele?.isChecked === true);
      fetchApi(field, data.length ? data : rows, val.length ? val : headers);
    } else {
      const payload = (ResultData || []).filter((ele) => ele.isChecked === true);
      validateData(field, payload, errorToast, ResultTestData || []);
      // } else {
      //   if (field === "Not Approved") {
      //     const payload = ResultData.filter((ele) => ele.isChecked === true);
      //     fetchApi(field, payload);
      //   } else {
      //     toast.error(
      //       `This already approved ${ResultTestData[statusMatchIndex]["PackageName"]}, Please Uncheck to continue or unhold to continue`
      //     );
      //   }
      // }
    }
    } catch (err) {
      setLoading(false);
      console.error("handleResultSubmit", err);
      toast.error(err?.message || t("Unable to submit result"));
    }
  };
  // console.log(helpmenu);
  const DeltaResponse = (data) => {
    console.log("delta", data);
    axiosInstance
      .post("RE/DeltaCheck", {
        TestID: data?.TestID,
        LabObservation_ID: data?.labObservationID,
        PatientID: data?.PatientID,
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
  // Tabs bind off AllTestDetails from the most recent RE/GetResultEntryData response —
  // it's refreshed with every test's current Status/TestName any time any test in the
  // visit is opened, so it's authoritative for tests you HAVEN'T opened yet. But the
  // backend's AllTestDetails entry for the test you just fetched can itself lag behind
  // (e.g. testHeader.Status=13 while that same test's own AllTestDetails segment still
  // says 3) — so for whichever TestID is actively loaded in ResultTestData, trust that
  // live data instead of the snapshot string. And once you click AWAY to another tab,
  // ResultTestData no longer contains the test you just left, so its color must come
  // from testStatusMap (which effect above keeps updated every time a test is loaded
  // live) rather than falling back straight to the stale AllTestDetails string.
  const getUniqueTest = () => {
    const data = ResultTestData[0]?.AllTestDetails?.split("#") || [];
    const finalDatas = [...new Set(data)];
    const uniqueTestCentreIDs = [
      ...new Set(
        (ResultData || []).flatMap(
          (item) => item?.TestCentreID || []
        )
      ),
    ];
    const finalData = finalDatas?.map((ele) => {
      const parts = ele?.split("$") || [];
      const TestID = Number(parts[0]);
      const liveRow = ResultTestData?.find((row) => row?.TestID === TestID);
      return {
        TestID,
        TestName: parts[1],
        labObservationID: Number(parts[2]),
        Status: liveRow?.Status ?? testStatusMap[TestID] ?? Number(parts[3]),
        TestCentreID: uniqueTestCentreIDs,
        IsPartialResult: ResultData?.find((row) => row?.TestID === TestID)
          ?.IsPartialResult,
        IsApproved: ResultData?.find((row) => row?.TestID === TestID)
          ?.IsApproved,
      };
    });
    return finalData ?? [];
  };
  const getGroupStatus = (testID) =>
    testStatusMap[testID] ??
    ResultData?.find((row) => row?.TestID === testID)?.Status;
  const AuditTrailResponce = async (data) => {
    await axiosInstance
      // .post("RE/TestWiseDeltaValue", {
      .post("RE/ResultEntryAuditLogs", {
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
    const data = ResultTestData.filter((ele) => ele?.isChecked === true);
    let TestIDHash = data.map((ele) => ele?.TestIDHash);

    setPrintReportLoading(true);

    axiosReport
      .post(
        `commonReports/GetLabReport`,
        {
          TestIDHash: TestIDHash,
          PHead: 0,
          PrintColour: "0",
          IsDownload: CheckDevice(),
          isPreview: key === "no" ? 1 : 0,
        },
        {
          responseType: "blob",
        }
      )
      .then((res) => {
        // console.log("report response", res);

        const contentType = res?.headers?.["content-type"] || "";

        // ✅ If server returned JSON (success/error message), parse and handle it
        if (contentType.includes("application/json")) {
          const reader = new FileReader();
          reader.onload = () => {
            try {
              const json = JSON.parse(reader.result);
              if (json?.success) {
                if (key === "Yes") {
                  handleApproveReport(json?.url, headerData);
                } else {
                  setShowReportModal({ show: true, url: json?.url });
                }
              } else {
                key === "no" && toast.error(json?.message);
              }
            } catch {
              toast.error("Unexpected response from server.");
            }
            setPrintReportLoading(false);
          };
          reader.readAsText(res.data);
          return;
        }


        const blob = new Blob([res.data], { type: "application/pdf" });
        if (key === "Yes") {
          const reader = new FileReader();
          reader.onloadend = () => {
            const base64url = reader.result;
            handleApproveReport(base64url, headerData);
            setPrintReportLoading(false);
          };
          reader.readAsDataURL(blob);
        } else {
          const blobUrl = URL.createObjectURL(blob);
          setShowReportModal({ show: true, url: blobUrl });
          setPrintReportLoading(false);
        }
      })
      .catch(async (err) => {
        let message = t("Unable to generate report");
        const data = err?.response?.data;
        if (data instanceof Blob) {
          try {
            const text = await data.text();
            const looksLikeInternals =
              /unknown column|stack trace|at Microsoft|MySql\.|Exception:/i.test(
                text || "",
              );
            if (!looksLikeInternals) {
              const json = JSON.parse(text);
              if (typeof json?.message === "string" && json.message.trim()) {
                message = json.message;
              }
            }
          } catch {
            /* keep fallback */
          }
        } else if (typeof data?.message === "string" && data.message.trim()) {
          message = data.message;
        } else if (typeof err?.data?.message === "string" && err.data.message.trim()) {
          message = err.data.message;
        }
        toast.error(message);
        setPrintReportLoading(false);
      });
  };

  // const handlePreviewSingleTest = (testIDHash) => {
  //   setPrintReportLoading(true);
  //   axiosReport
  //     .post(
  //       `commonReports/GetLabReport`,
  //       { TestIDHash: [testIDHash], PHead: 0, PrintColour: "0", IsDownload: CheckDevice(), isPreview: 1 },
  //       { responseType: "blob" },
  //     )
  //     .then((res) => {
  //       const contentType = res?.headers?.["content-type"] || "";
  //       if (contentType.includes("application/json")) {
  //         const reader = new FileReader();
  //         reader.onload = () => {
  //           try {
  //             const json = JSON.parse(reader.result);
  //             if (json?.success) setShowReportModal({ show: true, url: json?.url });
  //             else toast.error(json?.message);
  //           } catch { toast.error("Unexpected response from server."); }
  //           setPrintReportLoading(false);
  //         };
  //         reader.readAsText(res.data);
  //         return;
  //       }
  //       const blobUrl = URL.createObjectURL(new Blob([res.data], { type: "application/pdf" }));
  //       setShowReportModal({ show: true, url: blobUrl });
  //       setPrintReportLoading(false);
  //     })
  //     .catch((err) => {
  //       toast.error(err?.response?.data?.message || err?.data?.message);
  //       setPrintReportLoading(false);
  //     });
  // };

  const refreshTestHeaderCounts = () => {
    if (!copyPayload || !Object.keys(copyPayload).length) return;
    axiosInstance
      .post("RE/GetResultEntryData", { ...copyPayload, MacID: copyPayload?.MacID ?? "" })
      .then((res) => {
        const freshHeaders = res?.data?.message?.testHeader;
        if (!Array.isArray(freshHeaders)) return;
        setResultTestData((prev) =>
          prev.map((item) => {
            const match = freshHeaders.find((h) => h.TestIDHash === item.TestIDHash);
            if (!match) return item;
            return {
              ...item,
              ReportKey: match.ReportKey ?? item.ReportKey,
              DocumentCount: match.DocumentCount ?? item.DocumentCount,
              ReportCount: match.ReportCount ?? item.ReportCount,
              AttachmentKey: match.AttachmentKey ?? item.AttachmentKey,
            };
          })
        );
      })
      .catch(() => { });
  };

  const getButtondata = () => {
    axiosInstance
      .get("RE/EmployeeAccessDetails")
      .then((res) => {
        setButtonsData(Array.isArray(res?.data?.message) ? res.data.message : []);
        console.log("res.data.message", res.data.message);
      })
      .catch((err) => {
        const msg = formatActionableError(err, "Failed to load employee access privileges");
        toast.error(msg);
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
        let doctorData = Array.isArray(data)
          ? data.map((ele) => {
              return {
                value: ele?.employeeid,
                label: ele?.name,
                IsDefault: Number(ele?.IsDefault) === 1 ? 1 : 0,
              };
            })
          : [];
        setDoctorAdmin(doctorData);
        if (id) {
          GetResultEntry(
            {
              TestID: id?.TestID,
              LedgerTransactionID: 0,
              DepartmentID: [],
              DepartmentCode: [],
              symbol: "",
              Mobile: id?.Mobile,
              VisitNo: id?.VisitNo,
              PEmail: id?.PEmail,
              MacID: id?.MacID,
              LedgertransactionIDHash: id?.LedgertransactionIDHash,
              isOutSource: id?.isOutSource,
              index: id?.index,
              ApprovedBy: id?.ApprovedBy || "",
              SelectedDepartmentId: selectedDepartment || [0],
              TestCentreIDManual: id?.TestCentreID || [0],
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
    // event?.value != -1 && TableData(event?.value);
  };

  const handleFlagChange = (e, testId) => {
    const value = e.target.value;
    console.log("testId", testId);

    setResultData((prev) =>
      prev.map((item) =>
        item.labObservationID === testId
          ? { ...item, Flag: value }
          : item
      )
    );
  };

  const handleApifromModal = () => {
    setshowApprove({ ...approve, show: false });
    axiosInstance
      .post("RE/SaveResultEntry", modalpayload)
      .then((res) => {
        setLoading(false);
        handleReport("Yes", modalpayload?.HeaderInfo);
        const testidhash = (ResultTestData || []).map((obj) => obj.TestID);
        // console.log(modalpayload);
        const isAutoNext =
          ((AllowAutoNextSaveResultEntry == "1" &&
            modalpayload?.ResultStatus === "Save") ||
            (AllowAutoNextApproveResultEntry == "1" &&
              (modalpayload?.ResultStatus === "Approved" ||
                modalpayload?.ResultStatus === "Dual Authentication"))) && canMoveToNext(modalpayload?.ResultStatus !== "Save");

        if (isAutoNext) {
          handleNext();
        } else if (
          OnAppGoToMainList == 0 ||
          modalpayload?.ResultStatus === "Save"
        ) {
          GetResultEntry(
            {
              TestID: testidhash.join(","),
              TestCentreIDManual: selectedData?.TestCentreID || [0],
              LedgerTransactionID: selectedData?.LedgerTransactionID || 0,
              DepartmentID: includeDepartment
                ? selectedData?.DepartmentIDs || []
                : [],
              DepartmentCode: includeDepartment
                ? selectedData?.DepartmentCodes || []
                : [],
              symbol: "",
              Mobile: ResultData[0]?.Mobile,
              VisitNo: ResultData[0]?.VisitNo,
              PEmail: ResultData[0]?.PEmail,
              MacID: ResultData[0]?.MacID,
              LedgertransactionIDHash: ResultData[0]?.LedgertransactionIDHash,
              isOutSource: ResultData[0]?.isOutSource,
              index: ResultData[0]?.index,
              ApprovedBy: ResultData[0]?.ApprovedBy,
              SelectedDepartmentId: selectedDepartment || [0],
            },
            ResultData[0]?.currentIndex,
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
        setLoading(false);
        const actionMsg = formatActionableError(err, "Failed to update test result");
        toast.error(actionMsg);
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
    controllerButtonDynamic();
    TableData(DefaultAllStatusResultEntry === "1" ? "" : "3");
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
      },
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
        { responseType: "blob" },
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
          new Blob([res.data], { type: "application/pdf" }),
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

  const fetchRateTypes = async (id, showLoader = false) => {
    if (showLoader) {
      setRateTypeLoading(true);
    }

    try {
      const res = await axiosInstance.post("Centre/BindRateTypeDropdown", {
        centreID: id.toString() || 0,
        rateTypeID: 0,
        AllowEstimate: 0,
        CentreType: "",
        AllowHomeCollection: 0,
        AllowMembershipCard: 0,
        PageName: "YES",
      });
      const list = res?.data?.message.map((item) => ({
        label: item?.RateTypeName.replace(/\r?\n/g, " ").trim(),
        value: item?.RateTypeID,
      }));
      setRateTypes(list);
    } catch (err) {
      console.log(err);
      if (showLoader) {
        setRateTypeLoading(false);
      }
    } finally {
      if (showLoader) {
        setRateTypeLoading(false);
      }
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
    if (index !== -1) {
      TestHeader[index][name] = value;
      if (name == "HoldReason") TestHeader[index]["IsHold"] = 1;
      setResultTestData(TestHeader);
    } else {
      // stale reference after GetResultEntry replaced ResultTestData — find by TestID
      const idx = TestHeader.findIndex((ele) => ele?.TestID === data?.TestID);
      if (idx !== -1) {
        TestHeader[idx][name] = value;
        if (name == "HoldReason") TestHeader[idx]["IsHold"] = 1;
        setResultTestData(TestHeader);
        setReason((prev) => ({ ...prev, Hdata: TestHeader[idx] }));
      }
    }
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
        }),
      );
    } catch (err) {
      console.log("Reload range error:", err);
    } finally {
      setLoading(false);
    }
  };

  const totalDlcSum = [...(ResultData || [])]
    ?.filter((item) => item?.dlcCheck === 1)
    .reduce((sum, item) => sum + parseFloat(item?.Value || 0), 0);

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

  const SampleStatusWithPartial = [
    ...SampleStatus,
    { label: "Partial Done", value: "partial", status: true },
  ];

  const getStatusColorWithPartial = (val) =>
    val === "partial" ? "#A9A9A9" : getStatusColor(val);

  console.log({ formData });
  const filterStatusWise = (sampStatus) => {
    const isPartial = sampStatus === "partial";
    setIsPartialFilter(isPartial);
    setFormData({ ...formData, ["SampleStatus"]: isPartial ? "" : sampStatus });
    TableData(isPartial ? "" : sampStatus, 1, isPartial);
  };

  useEffect(() => {
    setIndexMatch(0);
  }, [formData?.DoctorName, formData?.TestName, formData?.Package]);

  console.log("ResultTestData", ResultTestData);
  console.log("ResultData", ResultData);
  console.log("redata", redata);
  console.log("formData", formData);

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

  const isHideButtonController = (cntrId = "") => {
    if (!controllerButtonDynamicList?.length) return true;
    const isPresent = controllerButtonDynamicList?.find(
      (x) => x?.ControlDisplayID === cntrId,
    );
    if (isPresent?.ControlDisplayID) {
      return !!controllerButtonDynamicList?.find(
        (x) => x?.ControlDisplayID === cntrId,
      )?.IsShow;
    }
    return true;
  };

  const controllerDynamic = async () => {
    try {
      const { controllersData, controllerTabbingOrder } =
        await getSearchController(PAGE_ID);

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
  const handleSendNotification = () => {
    console.log("Notification Sent");

    const isUhidPrefixOnlyForNotification =
      formData?.SelectTypes === "PatientCode" &&
      formData?.ItemValue?.trim() === defaultCentrePrefix?.trim();

    axiosInstance
      .post("RE/SendresultEntryToSMS", {
        LedgerTransactionID: ResultData[0]?.LedgerTransactionID,

        CentreID: formData?.CentreID ? [formData?.CentreID] : [],
        testCentreID: formData?.testCentreID
          ? Number(formData.testCentreID)
          : "",
        ShowAllCheckBarcodeOption: checkBarcodeOption ? 1 : 0,
        CollectionBoyID: Number(collectionBoy),
        SelectTypes: isUhidPrefixOnlyForNotification ? "" : formData.SelectTypes,
        ItemValue: isUhidPrefixOnlyForNotification ? "" : formData.ItemValue,
        RateTypeID: formData?.RateTypeID ? [formData?.RateTypeID] : [],
        DoctorReferal: formData.DoctorReferal,
        FromDate: moment(formData.FromDate).format("DD/MMM/YYYY"),
        ToDate: moment(formData.ToDate).format("DD/MMM/YYYY"),
        FromTime: formData.FromTime,
        ToTime: formData.ToTime,
        DepartmentID: formData?.DepartmentID ? formData?.DepartmentID : [],
        SampleStatus: String(statusValue),
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
      .then((res) => {
        toast.success(res?.data?.message);
        console.log("Notification sent successfully:", res);
      })
      .catch((err) => {
        toast.error(
          err?.response?.data?.message
            ? err?.response?.data?.message
            : t("Something Went Wrong"),
        );
        console.error("Error sending notification:", err);
      });
  };
  const handleClose = () => {
    setShowTat(false);
  };
  // const handleTatFilter = (tatValue) => {
  //   const status = String(tatValue);

  //   setFormData((prev) => ({
  //     ...prev,
  //     IsTat: status
  //   }));

  //   TableData(status);
  // };
  const handleTatFilter = (tatValue) => {
    const status = tatValue !== null ? String(tatValue) : "";
    TableData(status);
  };
  const getUnapprovedReportUrls = (data) => {
    axiosInstance
      .post("Re/UnapproveReportUrls", {
        TestID: data?.TestID,
      })
      .then((res) => {
        if (res?.data?.success) {
          setReportUrl(res.data?.message);
          setShowReport({
            show: true,
            data: data,
          });
        } else {
          toast.error("No data found");
          setShowReport({
            show: false,
            data: {},
          });
        }
      })
      .catch((err) => {
        toast.error(
          err?.response?.data?.message
            ? err?.response?.data?.message
            : t("Error Occurred"),
        );
      });
  };
  const getNotApprovedReport = (data) => {
    axiosInstance
      .post("Re/GenerateNotApprovedReport", {
        TestID: data?.TestID,
      })
      .then((res) => {
        if (!res?.data?.success) {
          toast.error(res?.data?.message || t("Error Occurred"));
        }
      })
      .catch((err) => {
        toast.error(
          err?.response?.data?.message
            ? err?.response?.data?.message
            : t("Error Occurred"),
        );
      });
  };
  const getAddendumComment = async (data) => {
    try {
      const res = await axiosInstance.post("Re/GetAddendum", {
        TestID: data?.TestID,
      });

      if (res?.data?.success && res?.data?.message?.length > 0) {
        setAddendumComment(res.data.message);
      } else {
        setAddendumComment([{ Comment: "" }]);
      }
      setShowAddendum({
        show: true,
        data: data,
      });
    } catch (err) {
      toast.error(err?.response?.data?.message || t("Error Occurred"));

      setAddendumComment([{ Comment: "" }]);
    }
  };

  const getimgurl = async (id) => {
    try {
      const response = await axiosInstance.post("CommonController/GetFileUrl", {
        Key: id,
      });
      return response?.data?.message;
    } catch (err) {
      toast.error(
        err?.response?.data?.message
          ? err?.response?.data?.message
          : t("Something went Wrong"),
      );
      return null; // Return null or a placeholder URL if there's an error
    }
  };

  const getHistoImages = async (data) => {
    try {
      const response = await axiosInstance.post(
        "CommonController/GetDocument",
        {
          Page: "HistoImage",
          Guid: data?.TestIDHash,
          CompanyId: "",
        },
      );
      if (response?.data?.success) {
        const documents = response?.data?.message || [];
        const tableData = await Promise.all(
          documents.map(async (data) => {
            const imgUrl = await getimgurl(data?.awsKey);
            return { ...data, imgUrl };
          }),
        );
        setTableData(tableData);
        setShowHisto({
          show: true,
          data: data,
        });
      } else {
        toast.error("No image uploaded");
        setShowHisto({
          show: false,
          data: {},
        });
      }
    } catch (err) {
      toast.error(
        err?.response?.data?.message
          ? err?.response?.data?.message
          : t("Error Occurred"),
      );
    }
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.altKey && e.key.toLowerCase() === "s") {
        e.preventDefault();
        saveBtnRef.current?.click();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.altKey && e.key.toLowerCase() === "a") {
        if (approveBtnRef.current) {
          e.preventDefault();
          approveBtnRef.current.click(); // simulate button click
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  useEffect(() => {
    const textareas = document.querySelectorAll("textarea");

    textareas.forEach((ta) => {
      ta.style.height = "auto";
      ta.style.height = ta.scrollHeight + "px";
    });
  }, [ResultTestData]);

  const paginationShow = useMemo(() => {
    return totalCount > 0 ? true : false;
  }, [redata]);

  useEffect(() => {
    getDignosticMasterData();
  }, []);

  useEffect(() => {
    commentRefs.current = {};
  }, [ResultTestData?.length]);

  // Escape key handler to close detailed result entry view
  useEffect(() => {
    const handleEscapeKey = (e) => {
      if (e.key === "Escape" || e.keyCode === 27) {
        // Close the detailed view if it's open
        if (ResultData.length > 0 || eyeModalConfig.show) {
          setResultData([]);
          setResultTestData([]);
          setCopyPayload({});
          setIncludeDepartment(false);
          setAllComments({});
          setTooltipPosition({ left: 0, right: "auto" });
          setEyeModalConfig({ show: false, data: null, index: null });
          console.log("Closed result entry view with Escape key");
        }
      }
    };

    window.addEventListener("keydown", handleEscapeKey);
    return () => window.removeEventListener("keydown", handleEscapeKey);
  }, [ResultData, eyeModalConfig]);

  console.log("resultData", ResultData);
  console.log("ResultTestData", ResultTestData);
  console.log("controllerDynamicList", controllerDynamicList);
  console.log("controllerButtonDynamicList", controllerButtonDynamicList);
  console.log("redata", redata);
  console.log("IsPatientWiseReporting", IsPatientWiseReporting);
  const [isMultiComment, setIsMultiComment] = useState(false);
  const [multiCommentRow, setMultiCommentRow] = useState({});

  return (
    <>
      <NearTatModal
        show={showTat}
        onHandleShow={handleClose}
        tableData={originalTableData}
        onTatClick={handleTatFilter}
      />
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
        // <PatientDetailModal
        //   showPH={showPH}
        //   setShowPH={(data) => {
        //     setShowPH(false);
        //   }}
        //   ResultData={ResultData}
        // />
        <DispatchPatientDetailModal
          showPH={showPH}
          setShowPH={setShowPH}
          ResultData={ResultData}
          Index={0}
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
            refreshTestHeaderCounts();
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
          handleUploadCount={(field, count) => {
            if (show5?.pageName === "Add Report") {
              setResultTestData((prev) =>
                prev.map((item) =>
                  item.TestIDHash === show5.data
                    ? { ...item, ReportCount: count }
                    : item
                )
              );
            } else if (show5?.pageName === "Add Attachment") {
              setResultTestData((prev) =>
                prev.map((item) =>
                  item.TestIDHash === show5.data
                    ? { ...item, DocumentCount: count }
                    : item
                )
              );
            }
          }}
        />
      )}
      {/* {ResultData.length === 0 ? ( */}
      {(ResultData?.length === 0 || eyeModalConfig.show) ? (
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
            name={t("Result Entry")}
            defaultValue={true}
            linkTo="/receiptreprint"
            isBreadcrumb={true}
            seconTitle={
              <>
                <div className="link-title-container" id="pr_id_11">
                  <div className="link-title-item">
                    {t("Total Patient") + " : " + totalPatient()}
                  </div>
                  <div className="link-title-item">
                    {t("Total Test Count") + " : " + testCount}
                  </div>
                </div>
                <div className="mt-2">
                  <PageControlGear pageId={PAGE_ID} />
                </div>
              </>
            }
          >
            {/* <Accordion
              defaultValue={true}
              title={
                <div className="d-flex"> */}
                  {/* <span className="mt-1"> {} </span> */}
                  {/* <span className="header ml-1" style={{ cursor: "pointer" }}>
                    <ReceiptReprintFilter
                      columnConfig={dynamicFilter}
                      setColumnConfig={setDynamicFilter}
                      PageName="ResultEntryFilter"
                    />
                  </span> */}
                {/* </div>
              }
            />{" "} */}
            {/* {areAllVisibleKeysTrue() && ( */}
            <>
              <div className="row  px-2 pt-2 pb-2">
                {controllerDynamicList
                  ?.filter(
                    (item) =>
                      item?.TypeId === 1 &&
                      item?.IsShow === 1 &&
                      !(isMobileView && item?.IsMobile == 1),
                  )
                  ?.map((item, index) => {
                    if (
                      item?.ControlDisplayID === "SelectTypes" &&
                      isHideController("SelectTypes")
                    ) {
                      return (
                        <div className="col-sm-2" key={index}>
                          <div className="d-flex" style={{ display: "flex" }}>
                            <div style={{ width: "40%" }}>
                              <SelectBox
                                options={[
                                  ...SearchBy,
                                  DefaultCurrencyName == "KES"
                                    ? { label: "HNo", value: 'HNo' }
                                    : "",
                                  ...(shouldIncludeAIIMSID()
                                    ? [{ label: "AIIMSID", value: "AIIMSID" }]
                                    : []),
                                ]}
                                id="SelectTypes"
                                lable={t("Search By")}
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
                                  onInput={(e) => number(e, DefaultCurrencyName == "KES" ? 14 : 10)}
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
                      );
                    }

                    if (
                      item?.ControlDisplayID === "CentreID" &&
                      isHideController("CentreID")
                    ) {
                      return (
                        <div className={isMobileView ? "col-4" : "col-6 col-sm-2"} key={index}>
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
                      );
                    }

                    if (
                      item?.ControlDisplayID === "TestCentre" &&
                      isHideController("TestCentre")
                    ) {
                      return (
                        <div className="col-6 col-sm-2">
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
                      );
                    }

                    if (
                      item?.ControlDisplayID === "RateTypeID" &&
                      isHideController("RateTypeID")
                    ) {
                      return (
                        <div className="col-6 col-sm-2" key={index}>
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
                            isLoading={rateTypeLoading}
                          />
                        </div>
                      );
                    }

                    if (
                      item?.ControlDisplayID === "DepartmentID" &&
                      isHideController("DepartmentID")
                    ) {
                      return (
                        <div className="col-6 col-sm-2" key={index}>
                          {/* <ReactSelect
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
                          /> */}
                          <SelectBoxWithCheckbox
                            name="DepartmentID"
                            onChange={handleSelectMultiChange}
                            // options={AddBlankData(
                            //   DepartmentData,
                            //   "All Department",
                            // )}
                            options={DepartmentData}
                            placeholder={t("Department")}
                            lable={t("Department")}
                            // className="required-fields"
                            id="Department"
                            value={formData?.DepartmentID}
                          />

                        </div>
                      );
                    }

                    if (
                      item?.ControlDisplayID === "DoctorName" &&
                      isHideController("DoctorName")
                    ) {
                      return (
                        <div className="col-6 col-sm-2" key={index}>
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
                      );
                    }
                    if (
                      item?.ControlDisplayID === "Package" &&
                      isHideController("Package")
                    ) {
                      return (
                        <div className="col-6 col-sm-2">
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
                      );
                    }
                    if (
                      item?.ControlDisplayID === "OutSourceStatus" &&
                      isHideController("OutSourceStatus")
                    ) {
                      return (
                        <div className="col-6 col-sm-2">
                          <SelectBox
                            lable={t("Outsource Status")}
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
                      );
                    }
                    if (
                      item?.ControlDisplayID === "TestName" &&
                      isHideController("TestName")
                    ) {
                      return (
                        <div className="col-6 col-sm-2" key={index}>
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
                      );
                    }

                    if (
                      item?.ControlDisplayID === "DateTypeSearch" &&
                      isHideController("DateTypeSearch")
                    ) {
                      return (
                        <div className="col-6 col-sm-2" key={index}>
                          <SelectBox
                            lable={t("Date Type")}
                            options={DateTypeSearch2}
                            selectedValue={formData?.DateTypeSearch}
                            name="DateTypeSearch"
                            onChange={handleSelectChange}
                          />
                        </div>
                      );
                    }

                    if (
                      item?.ControlDisplayID === "FromDate" &&
                      isHideController("FromDate")
                    ) {
                      return (
                        <div className={isMobileView ? "col-4" : "col-7 col-sm-2"} key={index}>
                          <DatePicker
                            className="custom-calendar"
                            name="FromDate"
                            value={formData?.FromDate}
                            onChange={dateSelect}
                            placeholder=" "
                            id="FromDate"
                            lable={t("From Date")}
                            // maxDate={new Date(formData?.ToDate)}
                            maxDate={new Date()}
                          />
                        </div>
                      );
                    }

                    if (
                      item?.ControlDisplayID === "FromTime" &&
                      isHideController("FromTime")
                    ) {
                      return (
                        <div className="col-5 col-sm-2" key={index}>
                          <CustomTimePicker
                            name="FromTime"
                            placeholder={t("From Time")}
                            value={formData?.FromTime}
                            id="FromTime"
                            lable={t("From Time")}
                            onChange={handleTime}
                          />
                        </div>
                      );
                    }

                    if (
                      item?.ControlDisplayID === "ToDate" &&
                      isHideController("ToDate")
                    ) {
                      return (
                        <div className={isMobileView ? "col-4" : "col-7 col-sm-2"} key={index}>
                          <DatePicker
                            className="custom-calendar"
                            name="ToDate"
                            value={formData?.ToDate}
                            onChange={dateSelect}
                            placeholder=" "
                            id="ToDate"
                            lable={t("To Date")}
                            minDate={new Date(formData?.FromDate)}
                            // maxDate={new Date()}
                            maxDate={getMaxToDate(formData?.FromDate, maxRange)}
                          />
                        </div>
                      );
                    }

                    if (
                      item?.ControlDisplayID === "ToTime" &&
                      isHideController("ToTime")
                    ) {
                      return (
                        <div className="col-5 col-sm-2" key={index}>
                          <CustomTimePicker
                            name="ToTime"
                            placeholder={t("To Time")}
                            value={formData?.ToTime}
                            id="ToTime"
                            lable={t("To Time")}
                            onChange={handleTime}
                          />
                        </div>
                      );
                    }

                    if (
                      item?.ControlDisplayID === "SampleStatus" &&
                      isHideController("SampleStatus")
                    ) {
                      return (
                        <div className="col-6 col-sm-2 my-1" key={index}>
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
                      );
                    }

                    if (
                      item?.ControlDisplayID === "MachineID" &&
                      isHideController("MachineID")
                    ) {
                      return (
                        <div className="col-6 col-sm-2" key={index}>
                          <ReactSelect
                            dynamicOptions={machineId ?? []}
                            name="MachineID"
                            lable={t("Machine")}
                            id="MachineID"
                            removeIsClearable={true}
                            placeholderName={t("Machine")}
                            value={formData?.MachineID}
                            onChange={handleSearchSelectChange}
                          />
                        </div>
                      );
                    }
                    if (
                      item?.ControlDisplayID === "ProEmployee" &&
                      isHideController("ProEmployee")
                    ) {
                      return (
                        <div className="col-6 col-sm-2">
                          <ReactSelect
                            dynamicOptions={[
                              { label: "Select", value: "" },
                              ...proEmployee,
                            ]}
                            name={"ProEmployee"}
                            id={"ProEmployee"}
                            label={t("Pro Employee")}
                            value={state?.ProEmployee}
                            onChange={handleProEmployeeChange}
                            placeholderName={t("Pro Employee")}
                            respclass={""}
                          />
                        </div>
                      );
                    }

                    if (
                      item?.ControlDisplayID === "collectionBoy" &&
                      isHideController("collectionBoy")
                    ) {
                      return (
                        <div className="col-6 col-sm-2">
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
                      );
                    }

                    if (
                      item?.ControlDisplayID === "IsTat" &&
                      isHideController("IsTat")
                    ) {
                      return (
                        <div className="col-6 col-sm-2" key={index}>
                          <CustomSelectBox
                            options={[
                              { label: "All", value: 0 },
                              {
                                label: "Within TAT",
                                value: 1,
                                style: {
                                  backgroundColor: "green",
                                  color: "white",
                                },
                              },
                              {
                                label: "Near TAT",
                                value: 2,
                                style: { backgroundColor: "yellow" },
                              },
                              {
                                label: "Outside TAT",
                                value: 3,
                                style: {
                                  backgroundColor: "red",
                                  color: "white",
                                },
                              },
                            ]}
                            selectedValue={formData?.IsTat}
                            label={t("TAT")}
                            id="IsTat"
                            name="IsTat"
                            onChange={handleSelectChange}
                          />
                        </div>
                      );
                    }

                    // if (
                    //   item?.ControlDisplayID === "TAT" &&
                    //   isHideController("TAT")
                    // ) {
                    //   return (
                    //     <div className="col-sm-2">
                    //       <SelectBox
                    //         lable={t("TAT")}
                    //         options={[
                    //           { label: t("All"), value: "" },
                    //           { label: t("Within TAT"), value: "1" },
                    //           { label: t("Near TAT"), value: "2" },
                    //           { label: t("Outside TAT"), value: "3" },
                    //         ]}
                    //         selectedValue={formData?.TAT}
                    //         name="TAT"
                    //         onChange={handleSelectChange}
                    //       />
                    //     </div>
                    //   );
                    // }

                    if (
                      item?.ControlDisplayID === "Flag" &&
                      isHideController("Flag")
                    ) {
                      return (
                        <div className="col-6 col-sm-2" key={index}>
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
                      );
                    }

                    if (
                      item?.ControlDisplayID === "LabRemarks" &&
                      isHideController("LabRemarks")
                    ) {
                      return (
                        <>
                          <div className="col-6 col-sm-2" key={index}>
                            <ReactSelect
                              dynamicOptions={[
                                { label: t("Select Lab Remark"), value: "" },
                                ...remarkOptions,
                              ]}
                              name="LabRemarks"
                              lable={t("Lab Remarks")}
                              id="LabRemarks"
                              removeIsClearable={true}
                              placeholderName={t("Lab Remarks")}
                              value={formData?.RemarkID}
                              onChange={handleSearchSelectChange}
                            />
                          </div>
                          {formData?.RemarkID === "others" && (
                            <div className="col-6 col-sm-2">
                              <Input
                                name="Remarks"
                                label={t("Enter Remark")}
                                value={formData?.Remarks}
                                onChange={handleSelectChange}
                              />
                            </div>
                          )}
                        </>
                      );
                    }

                    if (
                      item?.ControlDisplayID === "Order" &&
                      isHideController("Order")
                    ) {
                      return (
                        <div className="col-6 col-sm-1" key={index}>
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
                      );
                    }

                    if (
                      item?.ControlDisplayID === "IsUrgent" &&
                      isHideController("IsUrgent")
                    ) {
                      return (
                        <div className="col-6 col-sm-1" key={index}>
                          {/* <input
                            id="IsUrgent"
                            type="checkbox"
                            name="IsUrgent"
                            checked={formData?.IsUrgent}
                            onChange={handleSelectChange}
                          />
                          <label htmlFor="IsUrgent">
                            &nbsp;&nbsp; {t("IsUrgent")}
                          </label> */}
                          <Form.Check
                            type="switch"
                            id="IsUrgent"
                            name="IsUrgent"
                            label={t("Urgent")}
                            checked={formData?.IsUrgent}
                            onChange={handleSelectChange}
                            className="m-0"
                          />
                        </div>
                      );
                    }
                    if (
                      item?.ControlDisplayID === "IsVip" &&
                      isHideController("IsVip")
                    ) {
                      return (
                        <div className="col-6 col-sm-1 ">
                          {/* <input
                            id="IsVip"
                            type="checkbox"
                            // className="mt-2"
                            name="IsVip"
                            checked={formData?.IsVip}
                            onChange={handleSelectChange}
                          />
                          <label htmlFor="IsVip">
                            &nbsp;&nbsp; {t("IsVip")}
                          </label> */}
                          <Form.Check
                            type="switch"
                            id="IsVip"
                            name="IsVip"
                            label={t("VIP")}
                            checked={formData?.IsVip}
                            onChange={handleSelectChange}
                            className="m-0"
                          />
                        </div>
                      );
                    }
                    if (
                      item?.ControlDisplayID === "IsForward" &&
                      isHideController("IsForward")
                    ) {
                      return (
                        <div className="col-6 col-sm-1 ">
                          <Form.Check
                            type="switch"
                            id="IsForward"
                            name="IsForward"
                            label={t("Forward")}
                            checked={formData?.IsForward}
                            onChange={handleSelectChange}
                            className="m-0"
                          />
                        </div>
                      );
                    }
                    if (
                      item?.ControlDisplayID === "IsTatSummary" &&
                      isHideController("IsTatSummary")
                    ) {
                      return (
                        <div className="col-6 col-sm-auto">
                          <Form.Check
                            type="switch"
                            id="IsTatSummary"
                            name="IsTatSummary"
                            label={t("TAT Summary")}
                            checked={formData?.IsTatSummary}
                            onChange={handleSelectChange}
                            className="m-0"
                          />
                        </div>
                      );
                    }
                    if (
                      item?.ControlDisplayID === "HLMPatientType" &&
                      isHideController("HLMPatientType")
                    ) {
                      return (
                        <div className="col-6 col-sm-2">
                          <ReactSelect
                            dynamicOptions={[
                              { label: t("ALL"), value: "ALL" },
                              { label: t("IP"), value: "IP" },
                              { label: t("OP"), value: "OP" },
                              { label: t("OPD"), value: "OPD" },
                            ]}
                            name="HLMPatientType"
                            lable={t("Patient Type")}
                            id="HLMPatientType"
                            removeIsClearable={true}
                            placeholderName={t("Patient Type")}
                            value={formData?.HLMPatientType}
                            onChange={handleSearchSelectChange}
                          />
                        </div>
                      );
                    }
                    if (
                      item?.ControlDisplayID === "SearchButton" &&
                      isHideController("SearchButton")
                    ) {
                      return (
                        <div className="col-auto col-sm-auto" key={index}>
                          {/* <button
                            name="SearchButton"
                            onClick={() =>
                              TableData(
                                document.getElementById("SampleStatus")
                                  ?.value ?? formData?.SampleStatus,
                              )
                            }
                            className="btn btn-primary btn-sm w-100"
                          >
                            {t("Search")}
                          </button> */}
                          <SearchButton
                            text={"Search"}
                            loading={loading}
                            disabled={loading}
                            onClick={() =>
                              TableData(
                                document.getElementById("SampleStatus")
                                  ?.value ?? formData?.SampleStatus,
                              )
                            }
                          />
                        </div>
                      );
                    }

                    if (
                      item?.ControlDisplayID === "MoreFilterButton" &&
                      isHideController("MoreFilterButton")
                    ) {
                      return (
                        <div
                          className="col-auto col-sm-auto"
                          key={index}
                        >
                          {/* <button
                            name="MoreFilterButton"
                            onClick={() =>
                              setShowAdvanceFilter({
                                show: true,
                                data: formData,
                              })
                            }
                            className="btn btn-success btn-sm w-100"
                          >
                            {t("MoreFilter")}
                          </button> */}
                          <CustomButton
                            text={"More Filter"}
                            icon={"filter"}
                            onClick={() =>
                              setShowAdvanceFilter({
                                show: true,
                                data: formData,
                              })
                            }
                          />
                        </div>
                      );
                    }
                    return null;
                  })}



                <div className="col-auto col-sm-auto">
                  <CustomButton
                    text={"Reset"}
                    icon={"refresh"}
                    onClick={() => {
                      getResultEntryReqId.current += 1;
                      setLoading(false);
                      setFormData({
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
                        DepartmentID: [],
                        DoctorName: "",
                        TestName: "",
                        SampleStatus: DefaultAllStatusResultEntry === "1" ? "" : "3",
                        DateTypeSearch: DefaultDateTypeResultEntry || "Date",
                        IsUrgent: "",
                        IsVip: "",
                        MachineID: "",
                        IsTat: 0,
                        Order: IsDefaultAscOrderatResultEntry === "1" ? "ASC" : "DESC",
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
                        IsForward: 0,
                        IsTatSummary: 0,
                        Remarks: "",
                        RemarkID: 0,
                        // TAT: "",
                        HLMPatientType: "ALL",
                      });
                      SetReData([]);
                      setOriginalTableData([]);
                      setTotalCount(0);
                      setTestCount(0);
                      setCurrentPage(1);
                      setLoad(false);
                      setResultData([]);
                      setResultTestData([]);
                      setSearchTerm("");
                      setCopyPayload({});
                      setSelectedRowIndex(-1);
                      setCheckBarcodeOption(isTrueCheckBarcodeOption);
                      setErrors({});
                      setEyeModalConfig({ show: false, data: null, index: null });
                    }}
                  />
                </div>
                {redata?.length > 0 && (
                  <div className="col-sm-auto">
                    <CustomButton
                      text={"Excel"}
                      icon={"excel"}
                      onClick={() => {
                        const ICON_COLS = new Set([
                          "Call Log", "Uploaded Document", "Medical History",
                          "Customize Date", "Remarks", "Print",
                        ]);
                        const tableCols = controllerDynamicList.filter(
                          (col) => col.TypeId == 2 && col.IsShow == 1 && !ICON_COLS.has(col.ControlDisplayID)
                        );
                        const getCellValue = (header, item, colDef) => {
                          switch (header) {
                            case "TAT Status":
                              if (item.TATDelay == 1) return "Outside TAT";
                              if (item.TATIntimate == 1) return "Near TAT";
                              return "Within TAT";
                            case "S.CollectionDate":
                              return item.PreSampleCollectionDate ? moment(item.PreSampleCollectionDate).format("DD/MMM/YYYY HH:mm") : "";
                            case "Reg Date":
                              return item.Date ? moment(item.Date).format("DD/MMM/YYYY HH:mm") : "";
                            case "Dep. Receive Time":
                              return item.SampleReceiveDate ? moment(item.SampleReceiveDate).format("DD/MMM/YYYY HH:mm") : "";
                            case "Visit No": return item.VisitNo ?? "";
                            case "Ward No": return item.BedNo ?? "";
                            case "hmis_patCrNo": return item.hmis_patCrNo ?? "";
                            case "Barcode No": return item.SinNo ?? "";
                            case "UHID": return item.PatientCode ?? "";
                            case "HNo": return item.HNo ?? "";
                            case "Name": return item.PatientName ?? "";
                            case "Mobile": return item.Mobile ?? "";
                            case "Age/Gender": return `${item.Age ?? ""}/${item.Gender ?? ""}`;
                            case "Test":
                              return Array.isArray(item.TestDetails)
                                ? item.TestDetails.map((t) => t.TestName?.replace(/<br>/g, " ")).join(", ")
                                : "";
                            case "Doctor": return item.DoctorName ?? "";
                            case "Dept.Category": return item.Category ?? "";
                            case "VisitType": return item.VisitType ?? "";
                            case "Centre": return item.Centre ?? "";
                            case "RateType": return item.RateTypeName ?? "";
                            case "RateTypeCode": return item.RateTypeCode ?? "";
                            case "LastRemark": {
                              if (!Array.isArray(item.RemarksList) || item.RemarksList.length === 0) return "";
                              const sorted = [...item.RemarksList].sort((a, b) =>
                                moment(b.RemarkDate, "DD-MMM-YYYY hh:mm A") - moment(a.RemarkDate, "DD-MMM-YYYY hh:mm A")
                              );
                              return sorted[0]?.LabRemarks ?? "";
                            }
                            default: {
                              const field = colDef.ApiFieldName || colDef.ControlDisplayID;
                              const val = item[field];
                              if (Array.isArray(val)) return val.join(", ");
                              if (typeof val === "object" && val !== null) return JSON.stringify(val);
                              return val ?? "";
                            }
                          }
                        };
                        const excelData = redata.map((item) => {
                          const row = {};
                          tableCols.forEach((col) => {
                            row[col.ControlDisplayID] = getCellValue(col.ControlDisplayID, item, col);
                          });
                          return row;
                        });
                        ExportToExcel(excelData, "ResultEntry.xlsx");
                      }}
                    />
                  </div>
                )}
              </div>
            </>
          </Accordion>

          {/* <strong style={{ minWidth: "100px" }}>Sample Status : </strong>
            {SampleStatus?.map((sItem, idx) => (
              <TableFilterDot
                color={`${getStatusColor(sItem?.value)}`}
                // color={"#f1a098"}
                title={`${sItem?.label} (${statusCount(sItem?.value)})`}
                onClick={() => filterStatusWise(sItem?.value)}
                bgColor={`#e9e2e1`}
              />
            ))} */}
          <TableFilterDot
            slide={true}
            items={SampleStatusWithPartial}
            getColor={getStatusColorWithPartial}
            onSelect={(val) => filterStatusWise(val)}
            statusCount={statusCount}
            label=""
            bgColor="#e9e2e1"
            className="mt-2 mb-2 px-2 py-1 bg-white"
          />
          <Accordion
            title={
              <>
                <div className="d-flex">
                  <span className="mt-1">
                    {t("Search Result")}
                  </span>
                  <i
                    className="fa fa-cog ml-2 mt-1"
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowColumnModal(true);
                    }}
                    title="Settings"
                    style={{ fontSize: "16px", cursor: "pointer" }}
                  />
                  {/* <span className="header ml-1" style={{ cursor: "pointer" }}>
                    <ReceiptReprintFilter
                      columnConfig={columnConfig}
                      setColumnConfig={setColumnConfig}
                      PageName="ResultEntry"
                    />
                  </span> */}
                </div>
              </>
            }
            seconTitle={
              <div
                className="ml-auto d-flex align-items-center px-2 mt-1"
                style={{ gap: "12px" }}
              >
                {/* ICON LEGEND */}
                <div
                  className="d-flex align-items-center"
                  style={{ gap: "10px", fontSize: "12px" }}
                >
                  {/* <div
                    className="d-flex align-items-center"
                    style={{ gap: "4px" }}
                  >
                    <i
                      className="bi bi-file-earmark-excel text-success mb-0"
                      style={{ fontSize: "14px", cursor: "pointer" }}
                      onClick={() => {
                        if (redata && redata.length > 0) {
                          const excelData = redata.map((item, index) => ({
                            "S.No": index + 1,
                            "Reg Date": item?.Date ? moment(item.Date).format("DD/MMM/YYYY hh:mm A") : "N/A",
                            "S.CollectionDate": item?.PreSampleCollectionDate ? moment(item.PreSampleCollectionDate).format("DD/MMM/YYYY hh:mm A") : "N/A",
                            "Dep. Receive Time": item?.SampleReceiveDate ? moment(item.SampleReceiveDate).format("DD/MMM/YYYY hh:mm A") : "N/A",
                            "Visit No": item?.VisitNo || "",
                            "Barcode No": item?.SinNo || "",
                            "UHID": item?.PatientCode || "",
                            "Name": item?.PatientName || "",
                            "Age/Gender": `${item?.Age || ""}/${item?.Gender || ""}`,
                            "Test": Array.isArray(item?.TestDetails) ? item.TestDetails.map(t => t.TestName?.replace(/<br>/g, ' ') || "").join(', ') : "",
                            "Doctor": item?.DoctorName || "",
                            "Centre": item?.Centre || "",
                            "RateType": item?.RateTypeName || "",
                            "RateTypeCode": item?.RateTypeCode || "",
                          }));
                          ExportToExcel(excelData, "ResultEntry.xlsx");
                        }
                      }}
                    />
                    <span>
                      <a
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          if (redata && redata.length > 0) {
                            const excelData = redata.map((item, index) => ({
                              "S.No": index + 1,
                              "Reg Date": item?.Date ? moment(item.Date).format("DD/MMM/YYYY hh:mm A") : "N/A",
                              "S.CollectionDate": item?.PreSampleCollectionDate ? moment(item.PreSampleCollectionDate).format("DD/MMM/YYYY hh:mm A") : "N/A",
                              "Dep. Receive Time": item?.SampleReceiveDate ? moment(item.SampleReceiveDate).format("DD/MMM/YYYY hh:mm A") : "N/A",
                              "Visit No": item?.VisitNo || "",
                              "Barcode No": item?.SinNo || "",
                              "UHID": item?.PatientCode || "",
                              "Name": item?.PatientName || "",
                              "Age/Gender": `${item?.Age || ""}/${item?.Gender || ""}`,
                              "Test": Array.isArray(item?.TestDetails) ? item.TestDetails.map(t => t.TestName?.replace(/<br>/g, ' ') || "").join(', ') : "",
                              "Doctor": item?.DoctorName || "",
                              "Centre": item?.Centre || "",
                              "RateType": item?.RateTypeName || "",
                              "RateTypeCode": item?.RateTypeCode || "",
                            }));
                            ExportToExcel(excelData, "ResultEntry.xlsx");
                          }
                        }}
                      >
                        Excel
                      </a>
                    </span>
                  </div> */}
                  {!isMobile && (
                  <div
                    className="d-flex align-items-center"
                    style={{ gap: "4px" }}
                  >
                    <i
                      className="bi bi-send text-primary mb-0"
                      style={{ fontSize: "14px" }}
                    />

                    <span>
                      <a
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          handleSendNotification();
                        }}
                      // style={{ cursor: "pointer"}}
                      >
                        Send Notification
                      </a>
                    </span>
                  </div>
                  )}
                  {!isMobile && (
                  <div
                    className="d-flex align-items-center"
                    style={{ gap: "4px" }}
                  >
                    <i
                      className="fa bi-file-earmark-pdf text-primary"
                      style={{ fontSize: "14px" }}
                    />
                    <span>View Attachments</span>
                  </div>
                  )}
                  {DefaultCurrencyName == "KES" && <div
                    className="d-flex align-items-center"
                    style={{ gap: "4px" }}
                  >
                    <i
                      className="fa fa-address-card text-danger"
                      style={{ fontSize: "14px" }}
                    />
                    <span>Reports Attached Document</span>
                  </div>}
                    {!isMobile && (
                  <div
                    className="d-flex align-items-center"
                    style={{ gap: "4px" }}
                  >
                    <img src={Urgent} className="sizeicon" />
                    <span>Urgent</span>
                  </div>
                  )}
                  {!isMobile && (
                  <div
                    className="d-flex align-items-center"
                    style={{ gap: "4px" }}
                  >
                    <i
                      className="bi bi-shield-fill-check vip-font-size mb-0"
                      style={{ color: "#FFC107" }}
                    />
                    <span>VIP Patient</span>
                  </div> 
                  )}
                </div>

                {/* SEARCH BOX */}
                <Input
                  type="text"
                  name="search"
                  id="search"
                  placeholder="Search Result Entry Details..."
                  value={searchTerm}
                  onChange={handleChangeSearch}
                />
                {!isMobile ? (
                <div
                    className="rr-view-toggle ml-2"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      type="button"
                      className={`rr-view-toggle__btn ${viewMode === "table" ? "is-active" : ""}`}
                      onClick={() => setViewMode("table")}
                      title={t("Table View")}
                    >
                      <i className="fa fa-table" /> {t("Table")}
                    </button>
                    <button
                      type="button"
                      className={`rr-view-toggle__btn ${viewMode === "card" ? "is-active" : ""}`}
                      onClick={() => setViewMode("card")}
                      title={t("Card View")}
                    >
                      <i className="fa fa-th-large" /> {t("Card")}
                    </button>
                </div>
                ) : null}
              </div>
              // <div className="ml-auto d-flex align-items-center px-2 mt-1">
              //   <Input
              //     type="text"
              //     name="search"
              //     id="search"
              //     placeholder="Search Result Entry Details..."
              //     value={searchTerm}
              //     onChange={handleChangeSearch}
              //   />
              // </div>
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
                  <RETable
                    viewMode={viewMode}
                    showColumnModal={showColumnModal}
                    setShowColumnModal={setShowColumnModal}
                    TableData={TableData}
                    Status={formData?.SampleStatus}
                    redata={redata}
                    SetReData={SetReData}
                    GetResultEntry={GetResultEntry}
                    show={setShow4}
                    show2={setShow6}
                    handleInnerChecked={handleInnerChecked}
                    columnConfig={columnConfig}
                    getFilterResultOption={getFilterResultOption}
                    selectedRowIndex={selectedRowIndex}
                    setSelectedRowIndex={setSelectedRowIndex}
                    doctorAdmin={doctorAdmin}
                    machine={machine}
                    setReturnFromResultTableWithStatus={
                      setReturnFromResultTableWithStatus
                    }
                    filterData={controllerDynamicList}
                    onPreview={handleTablePreview}
                    currentPage={currentPage}
                    pageSize={pageSize}
                    setSelectedData={setSelectedData}
                    setIncludeDepartment={setIncludeDepartment}
                    selectedDepartment={selectedDepartment}
                    setShowCallLog={setShowCallLog}
                    // CreateCheckbox={CreateCheckbox}
                    onEyeClick={(data, testIndex, rowIndex) => {
                      const globalIndex = (currentPage - 1) * pageSize + rowIndex;
                      console.log("eye click data", data, testIndex, rowIndex, globalIndex);
                      if (data?.statusArray[testIndex] === 1) {
                        // toast.error(
                        //   data?.statusArray[testIndex] === 1
                        //     ? "Sample not collected yet"
                        //     : "Department not received yet",
                        // );
                        toast.error("Sample not collected yet");
                        return;
                      } else if (data?.statusArray[testIndex] === 2) {
                        toast.error("Department not received yet");
                        return;
                      }
                      GetResultEntry(
                        {
                          TestID: data?.TestID,
                          TestCentreIDManual: data?.TestCentreID || [0],
                          LedgerTransactionID: data?.LedgerTransactionID || 0,
                          DepartmentID: [],
                          DepartmentCode: [],
                          symbol: "",
                          Mobile: data?.Mobile,
                          VisitNo: data?.VisitNo,
                          PEmail: data?.PEmail,
                          MacID: machine[0]?.value ?? "",
                          LedgertransactionIDHash: data?.LedgertransactionIDHash,
                          isOutSource: data?.isOutSource,
                          index: globalIndex,
                          ApprovedBy: "",
                          from: "testClick",
                          SelectedDepartmentId: selectedDepartment || [0],
                          isEditModal: true,
                        },
                        globalIndex,
                        setLoading,
                      );
                    }}
                    setExpansionAnchor={setExpansionAnchor}
                    expandedRowIndex={eyeModalConfig.show && !eyeModalConfig.isModal ? eyeModalConfig.index : null}
                    onCloseExpansion={() => {
                      setEyeModalConfig({ show: false, data: null, index: null });
                      setResultData([]);
                      setResultTestData([]);
                      setCopyPayload({});
                      setAllComments({});
                    }}
                  />
                </>
              </div>
            ) : (
              <div className="">
                <NoRecordFound />
              </div>
            )}{" "}
          </Accordion>
          {paginationShow && redata?.length > 0 && (
            <div className="d-flex flex-wrap justify-content-end">
              <Pagination
                className="pagination-bar mb-2"
                currentPage={currentPage}
                totalCount={totalCount}
                pageSize={pageSize}
                // onPageChange={(page) => {
                //   setCurrentPage(page);
                //   TableData(currentStatus, page);
                // }}
                onPageChange={(page) => {
                  setCurrentPage(page);
                }}
              />{" "}
            </div>
          )}
        </>
      ) : (
        <>
          <>
            {showAlert?.modal && (
              <REAlertModal
                show={showAlert?.modal}
                data={showAlert?.data}
                handleClose={() => {
                  setShowAlert({
                    modal: false,
                    field: "",
                    data: [],
                    val: [],
                    errorToast: "",
                  });
                }}
                handleValueAlert={() => {
                  const { field, data, errorToast, val } = showAlert;
                  validateData(field, data, errorToast, val);
                  setShowAlert({
                    modal: false,
                    field: "",
                    data: [],
                    val: [],
                    errorToast: "",
                  });
                }}
              />
            )}
            {showCriticalAlert?.modal && (
              <REAlertModal
                show={showCriticalAlert?.modal}
                data={showCriticalAlert?.data}
                message={showCriticalAlert?.message}
                handleClose={() => {
                  setShowCriticalAlert({
                    modal: false,
                    field: "",
                    data: [],
                    val: [],
                    errorToast: "",
                    message: "",
                  });
                }}
                handleValueAlert={() => {
                  const { field, data, errorToast, val } = showCriticalAlert;
                  validateData(field, data, errorToast, val, true);
                  setShowCriticalAlert({
                    modal: false,
                    field: "",
                    data: [],
                    val: [],
                    errorToast: "",
                    message: "",
                  });
                }}
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
            <div
              className="p-dialog-header custom-box-body re-detail-header"
              style={{
                display: "flex",
                flexDirection: "column",
                position: "sticky",
                top: stickyHeaderTop,
                zIndex: 1000,
              }}
            >
              <div
                className="re-detail-chips d-flex flex-wrap"
                style={{
                  display: "",
                  gridTemplateColumns: "repeat(auto-fit, minmax(135px, 1fr))",
                  gap: "8px",
                  padding: "0px",
                  borderRadius: "8px",
                }}
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
                  <i
                    className={`bi ${copyLabno ? "bi-check2" : "bi-copy"
                      } mb-0 mx-2 `}
                    onClick={() => {
                      navigator.clipboard.writeText(
                        ResultData[0]?.LedgerTransactionNo,
                      );
                      setCopyLabno(true);
                      setTimeout(() => setCopyLabno(false), 1000);
                    }}
                    style={{ cursor: "pointer" }}
                  ></i>
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
                <div
                  style={{
                    display: "flex",
                    minWidth: "135px",
                    alignItems: "center",
                    gap: "4px",
                  }}
                >
                  {/* ✅ Urgent Icon */}
                  {ResultData?.some((item) => item.isUrgent == 1) && (
                    <div
                      className="d-flex align-items-center"
                      style={{ gap: "4px" }}
                    >
                      <img src={Urgent} className="sizeicon" />
                      <span>Urgent</span>
                    </div>
                  )}

                  {/* ✅ VIP Icon */}
                  {ResultData?.some((item) => item.IsVip == 1) && (
                    <div
                      className="d-flex align-items-center"
                      style={{ gap: "4px" }}
                    >
                      <i
                        className="bi bi-shield-fill-check vip-font-size mb-0"
                        style={{ color: "#FFC107" }}
                      />
                      <span>VIP Patient</span>
                    </div>
                  )}
                  {(() => {
                    const docItem = ResultData?.find(
                      (item) => item.IsPatientDocAvail > 0,
                    );

                    return (
                      docItem && (
                        <div className="d-flex align-items-center">
                          <i
                            className="fa bi-file-earmark-pdf cursor-pointer"
                            style={{
                              fontSize: "16px",
                              color: "blue",
                              display: "flex",
                              justifyContent: "center",
                            }}
                            onClick={() => handleOpenPreview(docItem?.awsKeys)}
                            title="View Attachments"
                          />
                          <span>View Attachments</span>
                        </div>
                      )
                    );
                  })()}
                </div>
              </div>


              <div className="custom-row d-flex justify-content-between">
                {getUniqueTest()?.map((data, index) => (
                  <div
                    key={index}
                    style={{
                      position: "relative", //N
                      cursor: "pointer",
                      padding: "2px 5px",
                      transition: "all 0.3s ease",
                      boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
                    }}
                    // No more per-status color (Status-N / partial-result-badge) -
                    // every test pill just takes the app's current theme color as
                    // its background now, via simple-box-container (themed in
                    // src/assets/css/theme.css for every theme variant).
                    className="round font-weight-bold mx-2 mt-1 w-auto simple-box-container"
                    // onMouseEnter={() => {
                    //   setTestHeaderHover({
                    //     index: index,
                    //     data: [],
                    //   });
                    //   TestHeaderResponce(data);
                    // }}
                    onMouseEnter={(e) => {
                      setTestHeaderHover({ index: index, data: [] });
                      TestHeaderResponce(data);

                      // Calculate tooltip position
                      const rect = e.currentTarget.getBoundingClientRect();
                      const viewportWidth = window.innerWidth;
                      const tooltipWidth = 300;


                      if (rect.right + tooltipWidth > viewportWidth) {
                        setTooltipPosition({ left: "auto", right: 0 });
                      } else {
                        setTooltipPosition({ left: 0, right: "auto" });
                      }
                    }}
                    onMouseLeave={() => {
                      setTestHeaderHover({
                        index: -1,
                        data: [],
                      });
                      setHeaderTestResult([]);
                    }}
                    onClick={() => {
                      callGetResultEntryByTest(data.TestID, selectedRowIndex, data.TestCentreID);
                    }}
                  >
                    {data?.TestName}
                    {testHeaderHover?.index === index &&
                      headerTestResult.length > 0 && (
                        <div
                          // style={{
                          //   position: "absolute",
                          //   width: "auto",
                          //   left: "60px",
                          //   zIndex: 9999999,
                          //   height: "auto",
                          //   overflow: "visible",
                          // }}
                          style={{
                            position: "absolute",
                            width: "auto",
                            left: "0px",
                            zIndex: 9999999,
                            maxHeight: "300px",
                            overflowY: "auto",
                            overflowX: "hidden",
                            ...tooltipPosition,
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
                                    color: "#000000"
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
                <>
                  {/* <div className="col-sm-1"
                   
                   >
                        <button
                          className="btn btn-dark btn-block  "
                          type="button"
                          id="btnMainList"
                            style={{ backgroundColor: "#eb1515", borderColor: "#000" }}
                          onClick={() => {
                            setResultData([]);
                            setResultTestData([]);
                            setCopyPayload({});
                            setIncludeDepartment(false);
                            setAllComments({});
                            setTooltipPosition({ left: 0, right: "auto" });
                            // GetResultEntry()
                            // TableData(
                            //   document.getElementById("SampleStatus")?.value ??
                            //   formData?.SampleStatus,
                            // );
                          }}
                        >
                          {t("Close")}
                        </button>
                      </div> */}
                  <div
                    className="col-sm-1"
                    style={{
                      display: "flex",
                      justifyContent: "flex-end",
                    }}
                  >
                    <button
                      // No more hardcoded red - same theme-color background
                      // as the test pills above (simple-box-container),
                      // dropped btn-dark since it would otherwise fight
                      // simple-box-container for the background color.
                      className="btn simple-box-container"
                      type="button"
                      id="btnMainList"
                      onClick={() => {
                        setResultData([]);
                        setResultTestData([]);
                        setCopyPayload({});
                        setIncludeDepartment(false);
                        setAllComments({});
                        setTooltipPosition({ left: 0, right: "auto" });
                      }}
                      style={{
                        border: "none",
                        borderRadius: "6px",
                        padding: "4px 16px",
                        fontSize: "14px",
                        fontWeight: "bold",
                        cursor: "pointer",
                        boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
                      }}
                    >
                      <Tooltip label="Click Esc to Exit Fullscreen">
                        ✕ {t("Close")}
                      </Tooltip>
                    </button>
                  </div>
                </>
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
                    {!Number(HideOmitOptionatResultEntry) && (
                      <th style={{ width: "25px" }}>
                        <Tooltip label={"Omit"}>
                          <div className="m-0 p-0">
                            <i className="ml-1 fa fa-eraser p-0 m-0"></i>
                          </div>
                        </Tooltip>
                      </th>
                    )}

                    <th style={{ width: "20px" }}>
                      {" "}
                      <Tooltip label={"Critical"}>
                        <div className="m-0 p-0">
                          <i className=" fa fa-exclamation-triangle p-0 m-0"></i>
                        </div>
                      </Tooltip>
                    </th>
                    {/* {!(ResultData[0]?.CentreID == 8 && CompanyID == 1002) && ( */}
                    <>
                      <th>{t("Mac Reading")}</th>
                      <th>{t("Machine Name")}</th>
                    </>
                    {/* )} */}
                    <th>{t("Method Name")}</th>
                    <th style={{ width: "150px" }}>{t("Reference Range")} </th>
                    <th style={{ width: "52px" }}>{t("Unit")}</th>
                    {showIssuesColumn && <th style={{ width: "40px" }}>{t("Issues")}</th>}
                    <th>{t("Reading 1")}</th>
                    <th>{t("Reading 2")}</th>
                    <th>{t("QC Data")}</th>
                    {/* <th>{t("Action")}</th> */}
                    {/* <th>{t("Rerun")}</th> */}
                    {/* <th>{t("AuditTrail")}</th> */}
                  </tr>
                </thead>
                <tbody>
                  {ResultTestData?.map((Hdata, Hindex) => {

                    const commentsForRow = allComments[Hdata?.InvestigationID] || [];
                    const remarksList = safeParseRemarks(Hdata?.RemarksList);
                    return (
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
                                    Hdata.TestID,
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
                            colSpan={`${isPreviousResultAvailable ? 3 : 2}`}
                            data-title={t("TestName")}
                            style={{
                              padding: "8px 12px",
                              verticalAlign: "middle",
                            }}

                          >
                            <div style={{ display: "grid", gridTemplateColumns: Hdata?.ShowDLC == 1 ? "1fr auto" : "1fr", gap: "12px", alignItems: "center" }}>
                              <span
                                className="invName"
                                style={{ fontWeight: "bold", wordBreak: "break-word" }}
                              >
                                {Hdata?.PackageName || Hdata?.TestName || Hdata?.ItemName || Hdata?.Test || 'Investigation'}
                              </span>
                              {Hdata?.ShowDLC == 1 && (
                                <div style={{ display: "flex", alignItems: "center", whiteSpace: "nowrap" }}>
                                  <Form.Check
                                    type="switch"
                                    id={`dlc-check-${Hindex}`}
                                    name="DLC Check"
                                    label={t("DLC Check")}
                                    checked={Hdata?.IsDLCCheck}
                                    onChange={(e) => onChangeDLC(e, Hindex)}
                                    className="dlcCheckBox"
                                    style={{ margin: "0" }}
                                  />
                                </div>
                              )}
                            </div>
                          </td>
                          {isPreviousResultAvailable && (
                            <td colSpan={3} data-title={t("Previous Test Date")}>
                              <b>{Hdata.OldValueDate}</b>
                            </td>
                          )}
                          <td>{typeof Hdata?.DefaultSignatureID === "string" && Hdata?.DefaultSignatureID?.includes("#") ? Hdata?.DefaultSignatureID?.split("#")?.[1] : (Hdata?.DefaultSignatureID || "")}</td>
                          <td data-title={t("")} colSpan={1}></td>
                          <td data-title={t("SINNO")} colSpan={2}>
                            <span className="fa fa-barcode">&nbsp;</span>
                            <b>{Hdata?.SINNO}</b>
                          </td>
                          {!Number(HideOmitOptionatResultEntry) && (<td></td>)}
                          <td colSpan="4" data-title={t("Comment")}>
                            <div className="d-flex flex-wrap align-items-center">
                              {/* {(Hdata?.Status === 3 ||
                              Hdata.Status === 10 ||
                              Hdata.Status === 13 ||
                              Hdata?.Status === 14) && ( */}
                              {(Hdata?.Status != 5 || AllowAttachmentAfterApproval == 1) && (
                                <>
                                  <input type="checkbox" className="mr-2 cursor-pointer"
                                    checked={Hdata?.IsA}
                                  />
                                  <div
                                    className="m-0 p-0"
                                    onClick={() => {
                                      if (
                                        Hdata?.IsApproved == 1 &&
                                        AllowAttachmentAfterApproval == 0
                                      )
                                        return;
                                      setShow5({
                                        modal: true,
                                        data: Hdata?.TestIDHash,
                                        pageName: "Add Attachment",
                                        blockUpload:
                                          (Hdata?.Status == 5 ||
                                            Hdata?.Status == 6) &&
                                            AllowAttachmentAfterApproval == 0
                                            ? true
                                            : false,
                                      });
                                    }}
                                  >
                                    <span style={{ display: "inline-flex", alignItems: "center", gap: "1px" }}>
                                      <Tooltip label={"Add Attachment"}>
                                        {" "}
                                        <i
                                          className="bi bi-file-earmark-image m-0 text-icon-size ml-1 mr-1"
                                          style={{
                                            color:
                                              Hdata?.IsApproved == 1 &&
                                                AllowAttachmentAfterApproval == 0
                                                ? "gray"
                                                : "#07b023",
                                            cursor:
                                              Hdata?.IsApproved == 1 &&
                                                AllowAttachmentAfterApproval == 0
                                                ? "not-allowed"
                                                : "pointer",
                                          }}
                                          disabled={
                                            Hdata?.IsApproved == 1 &&
                                            AllowAttachmentAfterApproval == 0
                                          }
                                        ></i>
                                      </Tooltip>
                                      {Hdata?.DocumentCount > 0 && (
                                        <span
                                          style={{ fontSize: "14px", color: "#07b023", cursor: "pointer" }}
                                          onClick={(e) => { e.stopPropagation(); handleOpenPreview(Hdata?.AttachmentKey); }}
                                        >({Hdata?.DocumentCount})</span>
                                      )}

                                    </span>
                                  </div>
                                  &nbsp;
                                  {/* {Hdata?.datatype === "Profile" && (
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
                                    &nbsp; */}

                                </>
                              )}
                              <div
                                style={{ gap: "4px" }}
                                className="d-flex align-items-center justify-content-center"
                              >
                                <div
                                  data-tooltip-id={`remark-tooltip-${Hindex}`}
                                  onClick={() =>
                                    setShowAddRemark({ modal: true, rowData: { ...Hdata } })
                                  }
                                  style={{
                                    cursor: "pointer",
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "3px",
                                  }}
                                >
                                  <div
                                    style={{
                                      backgroundColor: "green",
                                      borderRadius: "50%",
                                      width: "18px",
                                      height: "18px",
                                      display: "flex",
                                      alignItems: "center",
                                      justifyContent: "center",
                                      boxShadow: "0 1px 3px rgba(0,0,0,0.15)",
                                    }}
                                  >
                                    <FaPlus color="white" size={8} />
                                  </div>
                                  {Hdata?.LabRemarkCount > 0 && (
                                    <span style={{ fontSize: "12px", fontWeight: "bold" }}>
                                      ({Hdata?.LabRemarkCount})
                                    </span>
                                  )}
                                </div>
                                {Array.isArray(remarksList) &&
                                  remarksList?.length > 0 && (
                                    <ReactTooltip
                                      id={`remark-tooltip-${Hindex}`}
                                      place="top"
                                      positionStrategy="fixed"
                                      style={{ zIndex: 9999 }}
                                      clickable
                                      content={<RemarkTooltip remarks={remarksList} />}
                                    />
                                  )}
                              </div>
                              &nbsp;
                              <div>
                                <FaEye
                                  style={{
                                    marginLeft: "5px",
                                    fontSize: "18px",
                                    cursor: "pointer",
                                    color: "#007bff",
                                  }}
                                  onClick={() => {
                                    setShowPH(true);
                                  }}
                                />
                              </div>
                              &nbsp;


                              {/* </>
                              )} */}
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
                                            <span style={{ display: "inline-flex", alignItems: "center", gap: "2px" }}>
                                              <i
                                                className="bi bi-file-earmark-pdf m-0 text-icon-size"
                                                style={{ color: "red" }}
                                                disabled={!Hdata?.isChecked}
                                                title={Hdata?.Status == 5 ||
                                                  Hdata?.Status == 6
                                                  ? t("Show Report")
                                                  : t("Add Report")}
                                              ></i>
                                              {Hdata?.ReportCount > 0 && (
                                                <span
                                                  style={{ fontSize: "14px", color: "#e10b0b", cursor: "pointer" }}
                                                  onClick={(e) => { e.stopPropagation(); handleOpenPreview(Hdata?.ReportKey); }}
                                                >({Hdata?.ReportCount})</span>
                                              )}
                                            </span>{" "}
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
                                              // blockUpload: false,
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
                                            <span style={{ display: "inline-flex", alignItems: "center", gap: "2px" }}>
                                              <i
                                                className="bi bi-file-earmark-image m-0 text-icon-size"
                                                style={{ color: "#07b023" }}
                                                disabled={!Hdata?.isChecked}
                                                title={Hdata?.Status == 5 || Hdata?.Status == 6
                                                  ? t("Show Attachment")
                                                  : t("Add Attachment")}
                                              ></i>
                                              {Hdata?.DocumentCount > 0 && (
                                                <span
                                                  style={{ fontSize: "14px", color: "#07b023", cursor: "pointer" }}
                                                  onClick={(e) => { e.stopPropagation(); handleOpenPreview(Hdata?.AttachmentKey); }}
                                                >({Hdata?.DocumentCount})</span>
                                              )}
                                            </span>{" "}
                                          </Tooltip>
                                        </div>
                                        &nbsp; &nbsp;
                                        {/* {loading ? (
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
                                        )} */}
                                      </>
                                    ),
                                )}
                              &nbsp;
                              {[5, 6].includes(Number(Hdata?.Status)) &&
                                // buttonsData?.map((ele, index) =>
                                (
                                  (Number(Hdata?.Status) === 5 && accessRight.includes("4")) ||
                                  (Number(Hdata?.Status) === 6 &&
                                    (accessRight.includes("4") || accessRight.includes("30")))
                                ) && (
                                  <React.Fragment>
                                    {/* your existing UI stays exactly same */}

                                    {loading ? (
                                      <Loading />
                                    ) : (
                                      <div
                                        className="m-0 p-0"
                                        onClick={() => {
                                          setReason({
                                            ...reason,
                                            HoldShow: true,
                                            Hdata: Hdata,
                                            type: "Not Approved",
                                          });
                                        }}
                                      >
                                        <Tooltip label={"UnApprove"}>
                                          <i
                                            className="bi bi-x-octagon text-icon-size m-0"
                                            style={{ color: "#b06605" }}
                                            disabled={!Hdata?.isChecked}
                                          ></i>
                                        </Tooltip>
                                      </div>
                                    )}
                                  </React.Fragment>
                                )
                                // )
                              }
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
                                                Hdata,
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
                                    ),
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
                                    ),
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
                              {[5].includes(Hdata.Status) && DefaultCurrencyName === "KES" && (
                                <div onClick={() => getAddendumComment(Hdata)}>
                                  <Tooltip label={"Addendum"}>
                                    <i
                                      className="bi bi-journal-text m-0 text-icon-size mr-2"
                                      style={{ color: "green" }}
                                      title={t("Show Addendum")} ></i>
                                  </Tooltip>
                                </div>
                              )}
                              &nbsp;&nbsp;
                              {DefaultCurrencyName === "KES" && (
                                <div onClick={() => getUnapprovedReportUrls(Hdata)}>
                                  <Tooltip label={"UnapprovedReportURLs"}>
                                    <i
                                      className="bi bi-exclamation-triangle m-0 text-icon-size mr-2"
                                      style={{ color: "red" }}
                                      title={t("Show Amendment")}
                                    ></i>
                                  </Tooltip>
                                </div>
                              )}
                              &nbsp;&nbsp;
                              {Hdata.IsHisto ? (
                                <div
                                  onClick={() => getHistoImages(Hdata)}
                                >
                                  <Tooltip label={"MoveHistoImage"}>
                                    <i
                                      className="bi bi-arrows-move m-0 text-icon-size mr-2"
                                      style={{ color: "red" }}
                                    ></i>
                                  </Tooltip>
                                </div>
                              ) : <></>}
                              &nbsp;&nbsp;
                              {[3, 13, 14, 10, 20, 25].includes(Hdata.Status) && (
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
                                  {/* <Form.Check
                                    type="switch"
                                    id="DLC Check"
                                    name="DLC Check"
                                    label={t("DLC Check")}
                                    checked={Hdata?.IsDLCCheck}
                                    onChange={(e) => onChangeDLC(e, Hindex)}
                                    className="my-1 dlcCheckBox"
                                  /> */}
                                </>
                              )}

                              {(Hdata?.Status != 5 || AllowAttachmentAfterApproval == 1) && (
                                <>
                                  <div
                                    className="m-0 p-0"
                                    onClick={() => {
                                      if (
                                        Hdata?.IsApproved == 1 &&
                                        AllowAttachmentAfterApproval == 0
                                      )
                                        return;
                                      setShow5({
                                        modal: true,
                                        data: Hdata?.TestIDHash,
                                        pageName: "Add Report",
                                        Printwithhead: Hdata?.Printwithhead,
                                        blockUpload:
                                          (Hdata?.Status == 5 || Hdata?.Status == 6) &&
                                            AllowAttachmentAfterApproval == 0
                                            ? true
                                            : false,
                                      });
                                    }}
                                  >

                                    {" "}
                                    <span style={{ display: "inline-flex", alignItems: "center", gap: "2px" }}>
                                      <Tooltip label={"Add Report"}>
                                        <i
                                          className="bi bi-file-earmark-pdf m-0 text-icon-size ml-1 mr-1"
                                          // style={{ color: "red" }}
                                          // disabled={!Hdata?.isChecked}
                                          style={{
                                            color:
                                              Hdata?.IsApproved == 1 &&
                                                AllowAttachmentAfterApproval == 0
                                                ? "gray"
                                                : "red",
                                            cursor:
                                              Hdata?.IsApproved == 1 &&
                                                AllowAttachmentAfterApproval == 0
                                                ? "not-allowed"
                                                : "pointer",
                                          }}
                                          disabled={
                                            Hdata?.IsApproved == 1 &&
                                            AllowAttachmentAfterApproval == 0
                                          }
                                        ></i></Tooltip>{" "}
                                      {Hdata?.ReportCount > 0 && (
                                        <span
                                          style={{ fontSize: "14px", color: "#e10b0b", cursor: "pointer" }}
                                          onClick={(e) => { e.stopPropagation(); handleOpenPreview(Hdata?.ReportKey); }}
                                        >({Hdata?.ReportCount})</span>
                                      )}
                                    </span>

                                  </div>
                                </>
                              )}
                              {Hdata?.InterpretationId > 0 && (
                                <div
                                  className="m-0 p-0"
                                  onClick={() =>
                                    fetchInterpretation(
                                      Hdata?.InterpretationId,
                                      Hdata?.PackageName
                                    )
                                  }
                                >
                                  <Tooltip label={t("Interpretation")}>
                                    <i
                                      className="bi bi-info-circle-fill m-0 text-icon-size"
                                      style={{ color: "#007bff" }}

                                    ></i>
                                  </Tooltip>
                                </div>
                              )}
                            </div>
                          </td>
                          {showIssuesColumn && (
                            <td
                              data-title={t("Issues")}
                              style={{ textAlign: "center", verticalAlign: "middle" }}
                            >
                              {isIssueApplicable(Hdata)
                                ? renderReviewIcon(
                                  { ...Hdata, TestName: Hdata?.TestName || Hdata?.PackageName },
                                  Hdata?.SINNO,
                                  `issue-remark-tooltip-main-${Hindex}`,
                                )
                                : null}
                            </td>
                          )}
                          <td colSpan={`${isPreviousResultAvailable ? 4 : 3}`}>
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
                        {ResultData?.map((datanew, index) => {
                          const fullText = datanew?.DisplayReading || "";
                          const firstLine = fullText.split("\n")[0];

                          const truncated =
                            fullText.length > 15
                              ? firstLine.substring(0, 15) + "..."
                              : firstLine;

                          return (
                            <>
                              {Hdata.TestID === datanew.TestID && (
                                <>
                                  <tr
                                    key={index}
                                    style={{
                                      backgroundColor:
                                        datanew?.IsLabOutSource == "True"
                                          ? "#ebb17d"
                                          : "",
                                    }}
                                  >
                                    <td data-title={t("#")} style={{ width: "15px" }}>
                                      <div className="d-flex">
                                        <input
                                          type="checkbox"
                                          checked={datanew?.isChecked}
                                          onChange={(e) => handleCheckbox(e, index)}
                                          name="isChecked"
                                          disabled={true}
                                        />
                                      </div>
                                    </td>
                                    <td
                                      data-title={t("TestName")}
                                      style={{
                                        whiteSpace: "normal",
                                        wordBreak: "break-word",
                                        backgroundColor:
                                          datanew?.MacReading !== "" &&
                                            datanew?.MacReading !== datanew?.Value
                                            ? "#FF7F7F"
                                            : "",
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
                                    ${isTGGreaterThan400?.value > 350 && (datanew?.IsLDL == 1 || datanew?.IsVLDL == 1 || datanew?.IsTG == 1) ? "required_forvldl" : ""} 
                                    ${datanew?.isMandatory === 1 && "required-fields "} 
                                    ${datanew?.dlcCheck === 1 && "bg-yellow-new "}`}
                                      >
                                        <span
                                          className={`
                                      ${datanew?.Formula !== "" && "Formula"}
                                      ${isTGGreaterThan400?.value > 350 && (datanew?.IsLDL == 1 || datanew?.IsVLDL == 1 || datanew?.IsTG == 1) ? "required_forvldl" : ""} 
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
                                          {datanew?.TestName || datanew?.LabObservationName || datanew?.ItemName || datanew?.Test}
                                          {totalDlcSum > 0 &&
                                            datanew.Header == 1 &&
                                            Hdata?.IsDLCCheck === 1 && (
                                              <strong className="bg-yellow-new ml-2">
                                                {" "}
                                                Total DLC Count ={" "}
                                                {totalDlcSum?.toFixed(2)}
                                              </strong>
                                            )}
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
                                    {/* Header rows (e.g. DLC section title) must still carry Value/Flag/Critical */}
                                    {Number(datanew?.Header) === 0 ||
                                    Number(datanew?.Header) === 1 ? (
                                      <>
                                        {["2", "3"].includes(datanew?.ReportType) ? (
                                          // <td
                                          //   style={{
                                          //     fontSize: "15px",
                                          //     cursor: "pointer",
                                          //   }}
                                          //   data-title={t("Action")}
                                          //  >
                                          //   <Button
                                          //     variant="link"
                                          //     className="p-2"
                                          //     title="Add Comment"
                                          //     onClick={() =>
                                          //       setShow2({
                                          //         moadal: true,
                                          //         data: {
                                          //           ...datanew,
                                          //           pageName: "Single",
                                          //         },
                                          //       })
                                          //     }
                                          //   >
                                          //     <i
                                          //       className="fa fa-plus plusSign"
                                          //       aria-hidden="true"
                                          //       style={{ color: "white" }}
                                          //     ></i>
                                          //   </Button>
                                          // </td>
                                          //  {commentsForRow.length > 0 && (

                                          <td colspan={1}>
                                            {/* <div className="col-sm-10 m-0 p-0 "> */}
                                            <>
                                              <div className="d-flex">
                                                {/* <select
                                                  className="select-input-box form-control input-sm mb-2"
                                                  // onChange={(e) => {
                                                  //   const selected = commentsForRow?.find(
                                                  //     (c) => c?.TemplateText === e.target.value
                                                  //   );
                                                  //   setEditTable(true);
                                                  //   setResultData((prev) => {
                                                  //     const updatedTestData = [...prev];
                                                  //     updatedTestData[index] = {
                                                  //       ...updatedTestData[index],
                                                  //       COMMENT: selected?.TemplateText || "",
                                                  //       SaveRangeStatus: 1,
                                                  //     };
                                                  //     return updatedTestData;
                                                  //   });
                                                  // }}
                                                  onChange={(e) => {
                                                    const selected = commentsForRow?.find(
                                                      (c) => c?.TemplateText === e.target.value
                                                    );

                                                    setEditTable(true);

                                                    setResultData((prev) => {
                                                      const updatedTestData = [...prev];

                                                      let previous = updatedTestData[index]?.COMMENT || "";
                                                      let newComment = selected?.TemplateText || "";
                                                      if (multiCommentRow?.[index] && previous) {
                                                        newComment = previous + "<br/>" + newComment;
                                                      }
                                                      updatedTestData[index] = {
                                                        ...updatedTestData[index],
                                                        COMMENT: newComment,
                                                        SaveRangeStatus: 1,
                                                      };

                                                      return updatedTestData;
                                                    });


                                                    e.target.value = "";
                                                  }}
                                                  value={datanew?.COMMENT || ""}
                                                >
                                                  <option>{t("Select Comment")}</option>
                                                  {commentsForRow.map((c) => (
                                                    <option key={c.CommentID} value={c.TemplateText}>
                                                      {c.Template}
                                                    </option>
                                                  ))}

                                                </select> */}
                                                <ReactSelect
                                                  id={`comment-select-${index}`}
                                                  inputId={`comment-select-input-${index}`}
                                                  placeholderName="Select Comment"
                                                  searchable={true}
                                                  removeIsClearable={false}
                                                  respclass="w-100"
                                                  name="COMMENT"
                                                  dynamicOptions={[
                                                    { value: "", label: t("Select Comment") },
                                                    ...commentsForRow.map((c) => ({
                                                      value: c.TemplateText,
                                                      label: c.Template,
                                                    }))
                                                  ]}
                                                  value={datanew?.COMMENT || ""}
                                                  filterOption={(option, input) =>
                                                    option.label.toLowerCase().startsWith(input.toLowerCase())
                                                  }
                                                  onChange={(name, selected) => {
                                                    setEditTable(true);
                                                    setResultData((prev) => {
                                                      const updatedTestData = [...prev];
                                                      let previous = updatedTestData[index]?.COMMENT || "";
                                                      let newComment = selected?.value || "";
                                                      if (multiCommentRow?.[index] && previous) {
                                                        newComment = previous + "<br/>" + newComment;
                                                      }
                                                      updatedTestData[index] = {
                                                        ...updatedTestData[index],
                                                        COMMENT: newComment,
                                                        SaveRangeStatus: 1,
                                                      };
                                                      return updatedTestData;
                                                    });
                                                  }}
                                                />
                                                <input
                                                  title="select multiple comments"
                                                  type="checkbox"
                                                  checked={multiCommentRow?.[index] || false}
                                                  onChange={(e) =>
                                                    setMultiCommentRow((prev) => ({
                                                      ...prev,
                                                      [index]: e.target.checked,
                                                    }))
                                                  }
                                                />
                                              </div>
                                            </>
                                            {/* </div> */}
                                            {/* {ResultData[0]?.DepartmentID == 39 && ( */}
                                            {DefaultCurrencyName != "KES" && datanew?.DepartmentID == 39 && (
                                              // <td colSpan={2}>
                                              <SelectBox
                                                // className="required-fields"
                                                options={[{ label: "DignosticMaster...", value: "" }, ...DignosticMaster]}
                                                id="Dignomasterid"
                                                lable="Dignomasterid"
                                                selectedValue={datanew?.Dignomasterid}
                                                onChange={(e) => {
                                                  setResultData((prev) => {
                                                    const updatedTestData = [...prev];
                                                    updatedTestData[index] = {
                                                      ...updatedTestData[index],
                                                      Dignomasterid: e.target.value,
                                                    };
                                                    return updatedTestData;
                                                  });
                                                }}
                                                name="Dignomasterid"
                                              />
                                              // </td>
                                            )}
                                          </td>
                                          // )}    
                                        ) : datanew?.dlcCheck === 1 ? (
                                          datanew?.IsHelpMenu === 0 ? (
                                            <td data-title={t("Value")}>
                                              <textarea
                                                rows={1}
                                                className={`form-control input-sm resultInput ${datanew?.isMandatory === 1 && !datanew?.Value
                                                    ? "mandatory-empty"
                                                    : ""
                                                  }`}
                                                name="Value"
                                                autoComplete="off"
                                                disabled={
                                                  // If TG > 400 and this is LDL/VLDL, allow editing
                                                  SkipTestCentreResultEntry == 1
                                                    ? false
                                                    : isTGGreaterThan400.isTG &&
                                                      parseFloat(
                                                        isTGGreaterThan400.value,
                                                      ) > 350 &&
                                                      (datanew?.IsLDL === 1 ||
                                                        datanew?.IsVLDL === 1)
                                                      ? false
                                                      : (datanew?.CanSaveAmendment ===
                                                        0 &&
                                                        datanew?.MacReading) ||
                                                      (datanew?.TestCentreID !==
                                                        0 &&
                                                        datanew?.TestCentreID !==
                                                        globalCentre)
                                                }
                                                value={datanew?.Value}
                                                onChange={(e) => {
                                                  autoGrowResultValue(e.target);
                                                  handleValueChange(
                                                    index,
                                                    e.target.value,
                                                    datanew?.TestID,
                                                    datanew?.AllowEditCalculationValue
                                                  )
                                                }}
                                                onKeyDown={(e) =>
                                                  handleKeyUp(e, index)
                                                }
                                                ref={(el) => {
                                                  myRefs.current[index] = el;
                                                  autoGrowResultValue(el);
                                                }}
                                              />
                                            </td>
                                          ) : (
                                            <td data-title={t("Value")}>
                                              <textarea
                                                rows={1}
                                                className={`form-control input-sm resultInput ${datanew?.isMandatory === 1 && !datanew?.Value
                                                    ? "mandatory-empty"
                                                    : ""
                                                  }`}
                                                name="Value"
                                                value={datanew?.Value}
                                                disabled={
                                                  // If TG > 400 and this is LDL/VLDL, allow editing
                                                  SkipTestCentreResultEntry == 1
                                                    ? false
                                                    : isTGGreaterThan400.isTG &&
                                                      parseFloat(
                                                        isTGGreaterThan400.value,
                                                      ) > 350 &&
                                                      (datanew?.IsLDL === 1 ||
                                                        datanew?.IsVLDL === 1)
                                                      ? false
                                                      : (datanew?.CanSaveAmendment ===
                                                        0 &&
                                                        datanew?.MacReading) ||
                                                      (datanew?.TestCentreID !==
                                                        0 &&
                                                        datanew?.TestCentreID !==
                                                        globalCentre)
                                                }
                                                onChange={(e) => {
                                                  autoGrowResultValue(e.target);
                                                  handleValueChange(
                                                    index,
                                                    e.target.value,
                                                    datanew?.TestID,
                                                    datanew?.AllowEditCalculationValue
                                                  )
                                                }}
                                                onKeyDown={(e) =>
                                                  handleKeyUp(e, index)
                                                }
                                                autoComplete="off"
                                                ref={(el) => {
                                                  myRefs.current[index] = el;
                                                  autoGrowResultValue(el);
                                                }}
                                              />
                                            </td>
                                          )
                                        ) : datanew?.IsHelpMenu === 0 ? (
                                          <td data-title={t("Value")}>
                                            <textarea
                                              rows={1}
                                              className={`form-control input-sm resultInput ${datanew?.isMandatory === 1 && !datanew?.Value ? "mandatory-empty" : ""
                                                }`}
                                              name="Value"
                                              disabled={
                                                // If TG > 400 and this is LDL/VLDL, allow editing
                                                SkipTestCentreResultEntry == 1
                                                  ? false
                                                  : isTGGreaterThan400.isTG &&
                                                    parseFloat(
                                                      isTGGreaterThan400.value,
                                                    ) > 350 &&
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
                                                autoGrowResultValue(e.target);
                                                handleValueChange(
                                                  index,
                                                  e.target.value,
                                                  datanew?.TestID,
                                                  datanew?.AllowEditCalculationValue
                                                )
                                              }}
                                              onKeyDown={(e) => handleKeyUp(e, index)}
                                              autoComplete="off"
                                              ref={(el) => {
                                                myRefs.current[index] = el;
                                                autoGrowResultValue(el);
                                              }}
                                            />
                                          </td>
                                        ) : (
                                          <td data-title={t("Value")}>
                                            <div style={{ position: "relative" }}>
                                              <textarea
                                                rows={1}
                                                className={`form-control input-sm resultInput 
                                                   ${datanew?.isMandatory === 1 && !datanew?.Value
                                                    ? "mandatory-empty"
                                                    : ""
                                                  }`}
                                                name="Value"
                                                autoComplete="off"
                                                disabled={
                                                  // If TG > 400 and this is LDL/VLDL, allow editing
                                                  SkipTestCentreResultEntry == 1
                                                    ? false
                                                    : isTGGreaterThan400.isTG &&
                                                      parseFloat(
                                                        isTGGreaterThan400.value,
                                                      ) > 350 &&
                                                      (datanew?.IsLDL === 1 ||
                                                        datanew?.IsVLDL === 1)
                                                      ? false
                                                      : (datanew?.CanSaveAmendment ===
                                                        0 &&
                                                        datanew?.MacReading) ||
                                                      (datanew?.TestCentreID !==
                                                        0 &&
                                                        datanew?.TestCentreID !==
                                                        globalCentre)
                                                }
                                                value={datanew?.Value}
                                                onChange={(e) => {
                                                  autoGrowResultValue(e.target);
                                                  handleValueChange(
                                                    index,
                                                    e.target.value,
                                                    datanew?.TestID,
                                                    datanew?.AllowEditCalculationValue
                                                  );
                                                  setHiddenDropDownHelpMenu(false);
                                                }}
                                                readOnly={datanew?.HelpValueOnly === 1}
                                                onKeyDown={(e) => {
                                                  getHelpMenuData(
                                                    e,
                                                    datanew?.labObservationID,
                                                  );
                                                  handleIndex(e, index);
                                                  handleKeyUp(e, index);
                                                }}
                                                ref={(el) => {
                                                  myRefs.current[index] = el;
                                                  autoGrowResultValue(el);
                                                }}
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
                                                  cursor: datanew?.HelpValueOnly === 1 ? "pointer" : "text"
                                                }}
                                                onClick={(e) => {
                                                  setHiddenDropDownHelpMenu(
                                                    !HiddenDropDownHelpMenu,
                                                  );
                                                  getHelpMenuData(
                                                    e,
                                                    datanew?.labObservationID,
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
                                                              index,
                                                            );
                                                            // Close the dropdown after selection
                                                            setHiddenDropDownHelpMenu(
                                                              false,
                                                            );
                                                          }}
                                                          className={`${helpmenuindex === indexMatch ? "matchIndex" : ""}`}
                                                        >
                                                          {data?.label}
                                                        </li>
                                                      ),
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
                                                className="mx-1 p-2"
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
                                                    style={{ color: "white" }}
                                                  ></i>
                                                </Tooltip>{" "}
                                              </div>
                                              <span
                                                className="fa fa-exclamation-triangle"
                                                aria-hidden="true"
                                                style={{
                                                  cursor: "pointer",
                                                  fontSize: "15px",
                                                  width: "35px",
                                                  padding: "5px 10px",
                                                  color: (datanew?.OldValue !== "") ? "orangered" : "black",
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
                                                                    ele?.BookingDate,
                                                                  )}
                                                                </td>
                                                                <td
                                                                  data-title="BookingDate"
                                                                  style={{
                                                                    width: "120px",
                                                                  }}
                                                                >
                                                                  {dateConfig(
                                                                    ele?.ApprovedDate,
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
                                                            ),
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
                                                datanew?.IsHelpMenu && datanew?.HelpMenuBold
                                                  ? ""
                                                  : !datanew?.Value
                                                    ? ""
                                                    : Number.isNaN(parseFloat(datanew?.Value))
                                                      ? ""
                                                    : datanew?.MinCritical &&
                                                      datanew?.MinCritical < parseFloat(datanew?.MinValue) &&
                                                      parseFloat(datanew?.Value) <= parseFloat(datanew?.MinCritical)
                                                      ? "MinCritical"
                                                      : datanew?.MaxCritical &&
                                                        datanew?.MaxCritical > parseFloat(datanew?.MaxValue) &&
                                                        parseFloat(datanew?.Value) >= parseFloat(datanew?.MaxCritical)
                                                        ? "MaxCritical"
                                                        : (datanew?.MaxValue != "0" || datanew?.MinValue != "0") &&
                                                          parseFloat(datanew?.Value) > parseFloat(datanew?.MaxValue)
                                                          ? "High"
                                                          : (datanew?.MaxValue != "0" || datanew?.MinValue != "0") &&
                                                            parseFloat(datanew?.Value) < parseFloat(datanew?.MinValue)
                                                            ? "Low"
                                                            : "Normal"
                                              }
                                              onChange={(e) => handleFlagChange(e, datanew.TestID)}
                                            // disabled
                                            >
                                              <option value="">Select</option>
                                              <option value="Normal">Normal</option>
                                              <option value="High">High</option>
                                              <option value="Low">Low</option>
                                              <option value="MinCritical">MinCri</option>
                                              <option value="MaxCritical">MaxCri</option>
                                            </select>
                                          </td>
                                        )}
                                        {!Number(HideOmitOptionatResultEntry) && (
                                          <td data-title={t("Omit")}>
                                            <input
                                              type="checkbox"
                                              checked={datanew?.isOmit}
                                              onChange={(e) =>
                                                handleCheckbox(e, index)
                                              }
                                              name="isOmit"
                                              disabled={
                                                datanew?.TestCentreID == 0 ||
                                                  datanew?.TestCentreID == globalCentre
                                                  ? false
                                                  : true
                                              }
                                            />
                                          </td>
                                        )}

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
                                        {/* {!(ResultData[0]?.CentreID == 8 && CompanyID == 1002) && ( */}
                                        <>
                                          <td
                                            data-title={t("Mac Reading")}
                                            className={`Status-${datanew?.Status} ${Number(datanew?.Status) === 10 && Number(datanew?.IsPartialResult) === 1 && Number(datanew?.IsApproved) !== 1 ? "partial-result-badge" : ""}`}
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
                                        </>
                                        {/* // )} */}

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
                                                flexDirection: "row-reverse",
                                                justifyContent: "space-between",
                                                alignItems: "center",
                                              }}
                                            >
                                              <div>
                                                {["2", "3"].includes(
                                                  datanew?.ReportType,
                                                ) ? (
                                                  <div data-title=""> &nbsp;</div>
                                                ) : (
                                                  <div
                                                    onClick={() =>
                                                      setShow({
                                                        moadal: true,
                                                        data: datanew,
                                                      })
                                                    }
                                                  >
                                                    <Tooltip label={t("Edit")}>
                                                      <i
                                                        className="bi bi-pencil-square m-0 mr-3 text-icon-size-edit"
                                                        title={t("Edit")}
                                                        aria-label={t("Edit")}
                                                        data-tooltip="Edit"
                                                        style={{
                                                          color: "#274C77",
                                                        }}
                                                      ></i>
                                                    </Tooltip>
                                                  </div>
                                                )}
                                              </div>
                                              <div
                                                style={{
                                                  wordWrap: "break-word",
                                                  whiteSpace: "normal",
                                                  maxWidth: "150px",
                                                }}
                                              >
                                                <span>{truncated}</span>
                                              </div>
                                            </div>
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
                                        {showIssuesColumn && <td data-title={t("Issues")}>&nbsp;</td>}
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
                                      <>
                                        <td data-title={t("Issues")}>&nbsp;</td>
                                        <td colSpan="1" data-title="">
                                          {totalDlcSum > 0 &&
                                            datanew.Header == 1 &&
                                            Hdata?.IsDLCCheck === 1 && (
                                              <div
                                                className="mb-0 py-0 rouned"
                                                style={{ letterSpacing: "0.4px" }}
                                              >
                                                <strong className="bg-yellow-new">
                                                  Total DLC Count ={" "}
                                                  {totalDlcSum?.toFixed(2)}
                                                </strong>
                                              </div>
                                            )}
                                          &nbsp;
                                        </td>
                                      </>
                                    )}
                                    {/* <td colSpan="10" data-title="">
                            {" "}
                            &nbsp;
                          </td> */}
                                    <td data-title="QC Data">
                                      {typeof datanew?.QCData === "string" && datanew.QCData.split(",").map(
                                        (item, index) => {
                                          const [content, status] = item.split("#");

                                          return (
                                            <div
                                              key={index}
                                              className="fw-bold mb-1"
                                              style={{
                                                // color: status === "0" ? "#ff65b2ff" : "#198754",
                                                color: "black",
                                                backgroundColor:
                                                  status === "0"
                                                    ? "#ff8bbcff"
                                                    : "#93ffbeff",
                                                padding: "0px 2px",
                                                borderRadius: "4px",
                                                fontSize: "12px",
                                                border: `1px solid ${status === "0" ? "#ffc1e3" : "#c3e6cb"}`,
                                              }}
                                            >
                                              {content}
                                            </div>
                                          );
                                        },
                                      )}
                                    </td>
                                  </tr>
                                  {datanew?.Header === 0 && ["2", "3"].includes(datanew?.ReportType) &&
                                    <tr>

                                      {/* {commentsForRow.length > 0 && (
                                        <td colspan={2}>
                                          <div className="col-sm-10 m-0 p-0 ">
                                            <select
                                              className="select-input-box form-control input-sm "
                                              onChange={(e) => {
                                                const selected = commentsForRow?.find(
                                                  (c) => c?.TemplateText === e.target.value
                                                );
                                                setEditTable(true);
                                                const updatedTestData = [...ResultData];
                                                updatedTestData[index] = {
                                                  ...updatedTestData[index],
                                                  COMMENT: selected?.TemplateText || "",
                                                  SaveRangeStatus: 1,
                                                };
                                                setResultData(updatedTestData);
                                              }}
                                            >
                                              <option>{t("Select Comment")}</option>
                                              {commentsForRow.map((c) => (
                                                <option key={c.CommentID} value={c.TemplateText}>
                                                  {c.Template}
                                                </option>
                                              ))}

                                            </select>
                                          </div>
                                        </td>
                                      )}                         */}
                                      {/* {ResultData[0]?.DepartmentID == 39 && (
                                        <td colSpan={2}>
                                          <SelectBox
                                            className="required-fields"
                                            options={[{ label: "DignosticMaster...", value: "" }, ...DignosticMaster]}
                                            id="Dignomasterid"
                                            lable="Dignomasterid"
                                            selectedValue={datanew?.Dignomasterid}
                                            onChange={(e) => {

                                              const updatedTestData = [...ResultData];

                                              updatedTestData[index] = {
                                                ...updatedTestData[index],
                                                Dignomasterid: e.target.value,
                                              };
                                              setResultData(updatedTestData);
                                            }}
                                            name="Dignomasterid"
                                          />
                                        </td>
                                      )} */}

                                      <td colSpan={(isPreviousResultAvailable ? 16 : 15) - (ResultData[0]?.CentreID == 8 && CompanyID == 1002 ? 2 : 0)}>
                                        <div className="d-flex justify-content-end mb-1">
                                          <div
                                            className="btn btn-primary btn-class px-2 py-1"
                                            style={{ borderRadius: 0 }}
                                            onClick={() => setSaveTemplateModal({ visible: true, templateName: "", templateNameErr: "", observationData: datanew })}
                                            title={t("Save Template")}
                                          >
                                            <i className="bi bi-floppy mb-0 p-0" style={{ fontSize: "11px" }}></i>
                                          </div>
                                        </div>
                                        <div className="editorHeight">
                                          <FullTextEditor
                                            isCollapsed={DefaultCurrencyName == "KES" ? false : true}
                                            isDefaultCollapsed={DefaultCurrencyName == "KES" ? true : false}
                                            key={`${datanew?.labObservationID ?? index}-${index}`}
                                            value={datanew?.COMMENT}
                                            EditTable={EditTable}
                                            setEditTable={setEditTable}
                                            autoResize={true}
                                            editorHeight={getEditorHeight(datanew?.COMMENT)}
                                            buildingBlocks={buildingBlocks}
                                            setValue={(newValue) => {
                                              setEditTable(false)
                                              setResultData((prev) => {
                                                const updatedTestData = [...prev];
                                                updatedTestData[index] = {
                                                  ...updatedTestData[index],
                                                  COMMENT: newValue,
                                                  SaveRangeStatus: 1,
                                                };
                                                return updatedTestData;
                                              });
                                            }}
                                          // editorHeight={150}
                                          />
                                        </div>
                                      </td>
                                    </tr>
                                  }
                                </>
                              )}
                            </>
                          )
                        })
                        }
                        {Hdata?.datatype === "Profile" && (
                          <tr>
                            {commentsForRow.length > 0 && (
                              <td colspan={2}>
                                <div className="d-flex ">
                                  {/* <select
                                    className="select-input-box form-control input-sm "
                                    value={Hdata.COMMENT || ""}
                                    onChange={(e) => {
                                      // const selected = commentsForRow?.find(
                                      //   (c) => c?.TemplateText === e.target.value
                                      // );
                                      // const updatedTestData = [...ResultTestData];
                                      // const el = commentRefs?.current[Hindex];
                                      // if (el) {
                                      //   el.innerHTML = selected?.TemplateText || "";
                                      // }
                                      // updatedTestData[Hindex] = {
                                      //   ...updatedTestData[Hindex],
                                      //   COMMENT: selected?.TemplateText || "",
                                      //   PLAIN_COMMENT: formatHtmlToText(selected?.TemplateText || ""),
                                      //   SaveRangeStatus: 1,
                                      //   labObservationID: -1,
                                      // };
                                        setResultTestData(updatedTestData);
                                    }}
                                  >
                                    <option>{t("Select Comment")}</option>
                                    {commentsForRow.map((c) => (
                                      <option key={c.CommentID} value={c.TemplateText}>
                                        {c.Template}
                                      </option>
                                    ))}
                                  </select> */}
                                  <ReactSelect
                                    id={`comment-select-${Hindex}`}
                                    inputId={`comment-select-input-${Hindex}`}
                                    placeholderName="Select Comment"
                                    searchable={true}
                                    removeIsClearable={true}
                                    respclass="w-100"
                                    name="COMMENT"
                                    // dynamicOptions={commentsForRow.map((c) => ({
                                    //   value: c.TemplateText,
                                    //   label: c.Template,
                                    // }))}
                                    dynamicOptions={[
                                      { value: "", label: t("Select Comment") },
                                      ...commentsForRow.map((c) => ({
                                        value: c.TemplateText,
                                        label: c.Template,
                                      }))
                                    ]}
                                    value={Hdata.COMMENT || ""}
                                    onChange={(name, selected) => {
                                      const updatedTestData = [...ResultTestData];
                                      let previous = Hdata?.COMMENT || "";
                                      let newComment = selected?.value || "";
                                      if (isMultiComment && previous) {
                                        newComment = previous + "<br/>" + newComment;
                                      }
                                      updatedTestData[Hindex] = {
                                        ...updatedTestData[Hindex],
                                        COMMENT: newComment,
                                        // COMMENT: selected?.value || "",
                                        PLAIN_COMMENT: formatHtmlToText(newComment),
                                        SaveRangeStatus: 1,
                                        labObservationID: -1,
                                      };
                                      setResultTestData(updatedTestData);
                                    }}
                                  />
                                  <input
                                    title="select multiple comments"
                                    className="ml-2"
                                    type="checkbox"
                                    checked={isMultiComment}
                                    onChange={(e) => setIsMultiComment(e.target.checked)}
                                  />

                                </div>
                              </td>


                            )}
                            <td
                              // colSpan={commentsForRow?.length > 0 ? 12 : 14}
                              colSpan={(commentsForRow?.length > 0
                                ? (isPreviousResultAvailable ? 14 : 13)
                                : (isPreviousResultAvailable ? 16 : 15)) - (ResultData[0]?.CentreID == 8 && CompanyID == 1002 ? 2 : 0)}
                              style={{ padding: "0 15px" }}>
                              {/* <textarea

                                style={{
                                  width: "100%",
                                  minHeight: "25px",
                                  resize: "none",
                                  overflow: "hidden",
                                  whiteSpace: "pre-wrap"
                                }}
                                rows={1}
                                // value={Hdata.COMMENT || ""}
                                value={
                                  Hdata.PLAIN_COMMENT ??
                                  formatHtmlToText(Hdata.COMMENT || "")
                                }
                                onChange={(e) => {
                                  const updatedTestData = [...ResultTestData];

                                  updatedTestData[Hindex] = {
                                    ...updatedTestData[Hindex],
                                    PLAIN_COMMENT: e.target.value,
                                    COMMENT: convertTextToHtml(e.target.value),
                                  };

                                  setResultTestData(updatedTestData);
                                }}
                                onInput={(e) => {
                                  e.target.style.height = "auto";
                                  e.target.style.height = e.target.scrollHeight + "px";
                                }}
                                
                              /> */}
                              <div
                                className="re-comment-editable"
                                contentEditable
                                suppressContentEditableWarning={true}
                                style={{
                                  width: "100%",
                                  minHeight: "25px",
                                  outline: "none",
                                  whiteSpace: "pre-wrap",
                                  wordBreak: "break-word",
                                  backgroundColor: "#f5f5f5",
                                  overflow: "hidden",
                                }}
                                ref={(el) => {
                                  if (el) {
                                    commentRefs.current[Hindex] = el;
                                    // ONLY set HTML if different (prevents cursor jump)
                                    const commentContent = coerceToString(Hdata?.COMMENT);
                                    if (el.innerHTML !== commentContent) {
                                      el.innerHTML = commentContent;
                                    }
                                    // auto height
                                    el.style.height = "auto";
                                    el.style.height = el.scrollHeight + "px";
                                    // ensure images are wrapped and observers attached
                                    wrapImagesInResizable(el, Hindex);
                                    try { updateEditableHeight(Hindex); } catch (err) { }
                                  }
                                }}

                                onPaste={(e) => handlePaste(e, Hindex)}
                                onBlur={(e) => {
                                  const el = e.currentTarget;
                                  wrapImagesInResizable(el, Hindex);
                                  const html = el.innerHTML;
                                  setResultTestData((prev) => {
                                    const updatedTestData = [...prev];
                                    updatedTestData[Hindex] = {
                                      ...updatedTestData[Hindex],
                                      COMMENT: coerceToString(html),
                                      PLAIN_COMMENT: formatHtmlToText(html),
                                    };
                                    return updatedTestData;
                                  });
                                }}
                                onInput={(e) => {
                                  const html = e.currentTarget.innerHTML;

                                  setResultTestData((prev) => {
                                    const updatedTestData = [...prev];
                                    updatedTestData[Hindex] = {
                                      ...updatedTestData[Hindex],
                                      COMMENT: html,
                                      PLAIN_COMMENT: formatHtmlToText(html),
                                    };
                                    return updatedTestData;
                                  });

                                  // auto height
                                  e.currentTarget.style.height = "auto";
                                  e.currentTarget.style.height = e.currentTarget.scrollHeight + "px";
                                }}

                              />
                            </td>
                          </tr >
                        )}
                      </>
                    )
                  })}
                </tbody>
              </ResultEntryTableCustom>
            </div>
            <div className=" m-0 p-0 pb-2" style={{ zIndex: 0 }}>
              <div
                className="row mt-3 mr-1 d-flex flex-wrap re-action-row"
                style={{ textWrap: "avoid" }}
              >
                {loading ? (
                  <div className="mx-3">
                    <Loading />
                  </div>
                ) : (
                  controllerButtonDynamicList?.map((item, index) =>
                    renderDynamicButton(item, index)
                  )
                )}
              </div>
            </div>
          </div>
        </>
      )
      }

      {
        showOmitModal && (
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
                      true,
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
        )
      }
      {
        showForwardDialog && (
          <Dialog
            header={t("Forward")}
            onHide={() => setShowForwardDialog(false)}
            visible={showForwardDialog}
            className={theme}
            style={{ width: "30vw" }}
          >
            <div className="box-success px-2 pt-2">
              <div className="row">
                <div className="col-sm-12">
                  <SelectBox
                    options={[
                      { label: "Select Centre", value: "" },
                      ...CentreData,
                    ]}
                    name="centre"
                    selectedValue={forwardFormData.centre}
                    onChange={(e) =>
                      setForwardFormData({
                        ...forwardFormData,
                        centre: e.target.value,
                      })
                    }
                    lable="Centre"
                  />
                </div>
                <div className="col-sm-12 mt-2">
                  <SelectBox
                    options={[
                      { label: "Select Test", value: "" },
                      ...labSearchData.map((item) => ({
                        label: item?.TestName?.replace(/<\/?[^>]+(>|$)/g, ""),
                        value: item?.TestId,
                      })),
                    ]}
                    name="test"
                    selectedValue={forwardFormData.test}
                    onChange={(e) =>
                      setForwardFormData({
                        ...forwardFormData,
                        test: e.target.value,
                      })
                    }
                    lable="Test"
                  />
                </div>
                <div className="col-sm-12 mt-2">
                  <SelectBox
                    options={[
                      { label: "Select Doctor", value: "" },
                      ...doctorAdmin,
                    ]}
                    name="doctor"
                    selectedValue={forwardFormData.doctor}
                    onChange={(e) =>
                      setForwardFormData({
                        ...forwardFormData,
                        doctor: e.target.value,
                      })
                    }
                    lable="Doctor"
                  />
                </div>
              </div>
              <div
                className="row mt-4 d-flex justify-content-end"
                style={{ gap: "10px", paddingRight: "15px" }}
              >
                <button
                  className="btn btn-primary"
                  style={{
                    backgroundColor: "green",
                    borderColor: "green",
                    color: "white",
                  }}
                  onClick={() => {
                    setShowForwardDialog(false);
                    handleForward();
                  }}
                >
                  Save
                </button>
                <button
                  className="btn btn-secondary"
                  style={{ backgroundColor: "gray" }}
                  onClick={() => setShowForwardDialog(false)}
                >
                  Cancel
                </button>
              </div>
            </div>
          </Dialog>
        )
      }
      {
        showReportModal.show && (
          <Dialog
            header={t("Report Preview")}
            visible={showReportModal.show}
            style={{ height: "100vh", width: (window.innerWidth <= 768 || /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) ? "95vw" : "60vw" }}
            contentStyle={{ padding: 0, overflow: "hidden" }}
            onHide={() => setShowReportModal({ show: false, url: "" })}
            className={theme}

          >
            <div
              style={{ position: "relative", width: "100%", height: "85vh" }}
              onKeyDown={(e) => {
                if (
                  (e.ctrlKey || e.metaKey) &&
                  (e.key === "p" || e.key === "P")
                ) {
                  e.preventDefault();
                }
              }}
              onContextMenu={(e) => e.preventDefault()}
              tabIndex="0"
            >
              {(window.innerWidth <= 768 || /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) ? (
                <PdfViewer pdfUrl={showReportModal.url} />
              ) : (
                /* Disable pointer events on the iframe so focus cannot enter inside it */
                <iframe
                  src={`${showReportModal.url}#toolbar=0`}
                  title="Report Preview"
                  style={{ width: "100%", height: "100%", border: "none" }}
                ></iframe>
              )}
              {/* Watermark Overlay */}
              <div
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  height: "100%",
                  pointerEvents: "none",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  zIndex: 1,
                }}
              >
                {/* For now add text to check, as user requested, later we can use img */}
                {localData.CompanyCode !== "PKL" && (
                  <div
                    style={{
                      fontSize: "100px",
                      fontWeight: "bold",
                      color: "gray",
                      opacity: 0.5,
                      transform: "rotate(-45deg)",
                      userSelect: "none",
                    }}
                  >
                    {/* <img
                      src={
                        logoList[localData.CompanyID] ||
                        `https://elabassets.s3.ap-south-1.amazonaws.com/${localData.ImageLogo}`
                      }
                      alt={localData.CompanyCode}
                      className="img-fluid"
                      style={{
                        height: "100px",
                        width: "200px",
                        transition: "transform 0.3s ease",
                        borderBottomRightRadius: "15px !important",
                      }}
                    /> */}
                  </div>
                )}
                {console.log("localdata", localData)}
              </div>
            </div>
          </Dialog>
        )
      }
      {/* <PdfPreviewModal
        visible={previewConfig.visible}
        url={previewConfig.url}
        onClose={handleClosePreview}
      /> */}
      <PdfPreviewModal
        visible={previewConfig.visible}
        url={previewConfig.url}
        onClose={handleClosePreview}
      />
      <Dialog
        header="Save Data as Template"
        visible={saveTemplateModal.visible}
        onHide={() => setSaveTemplateModal({ visible: false, templateName: "", templateNameErr: "", observationData: null })}
        className={theme}
      >
        <div className="mx-4 my-3">
          {/* <div className="row">
            <label className="mr-4">{t("Template Type")}</label>
            <Input
              type="text"
              name="TemplateType"
              placeholder=""
              value={saveTemplateModal.observationData?.TestName || ""}
              disabled
            />
          </div> */}
          <div className="row">
            <label className="mr-3">{t("Template Name")}</label>
            <Input
              type="text"
              name="TemplateName"
              placeholder=""
              className="required-fields"
              value={saveTemplateModal.templateName}
              onChange={(e) => setSaveTemplateModal((prev) => ({ ...prev, templateName: e.target.value, templateNameErr: "" }))}
              autoFocus
            />
          </div>
          {saveTemplateModal.templateNameErr && (
            <div style={{ color: "red" }}>{saveTemplateModal.templateNameErr}</div>
          )}
        </div>
        <div className="row w-100">
          <div className="col-sm-6">
            <button type="button" className="btn btn-success btn-block btn-sm" onClick={handleSaveTemplate}>
              {t("Save")}
            </button>
          </div>
          <div className="col-sm-6">
            <button
              type="button"
              className="btn btn-danger btn-block btn-sm"
              onClick={() => setSaveTemplateModal({ visible: false, templateName: "", templateNameErr: "", observationData: null })}
            >
              {t("Close")}
            </button>
          </div>
        </div>
      </Dialog>

      {interpretationModal.show && (
        <Dialog
          header={t("Interpretation") + (interpretationModal?.testName ? ` for ${interpretationModal.testName}` : "")}
          visible={interpretationModal.show}
          style={{ width: "50vw" }}
          onHide={() => setInterpretationModal({ show: false, data: [], testName: "" })}
          className={theme}
        >
          <div className="p-2">

            {typeof interpretationModal.data === "string" ? (
              <div
                className="lr-html-safe"
                dangerouslySetInnerHTML={{ __html: sanitizeLabReportHtml(interpretationModal?.data) }}
              />
            ) : Array.isArray(interpretationModal.data) ? (
              <div >
                {interpretationModal.data.map((item, idx) => (
                  <div key={idx} className="mb-3">
                    {(item?.CreatedByName ||
                      item?.dtEntry ||
                      item?.UpdatedByName ||
                      item?.dtUpdate) && (
                        <div
                          className="row p-1"
                          style={{
                            borderTop: "1px solid #ddd",
                            fontSize: "12px",
                            backgroundColor: "#f9f9f9",
                          }}
                        >
                          {item?.CreatedByName && (
                            <div className="col-sm-3">
                              <b>{t("Created By")}:</b> <br />
                              {item?.CreatedByName}
                            </div>
                          )}
                          {item?.dtEntry && (
                            <div className="col-sm-3">
                              <b>{t("Created Date")}:</b> <br />
                              {item?.dtEntry}
                            </div>
                          )}
                          {item?.UpdatedByName && (
                            <div className="col-sm-3">
                              <b>{t("Updated By")}:</b> <br />
                              {item?.UpdatedByName}
                            </div>
                          )}
                          {item?.dtUpdate && (
                            <div className="col-sm-3">
                              <b>{t("Updated Date")}:</b> <br />
                              {item?.dtUpdate}
                            </div>
                          )}
                        </div>
                      )}
                    <div
                      className="lr-html-safe"
                      dangerouslySetInnerHTML={{
                        __html: sanitizeLabReportHtml(item?.Interpretation),
                      }}
                    />
                  </div>
                ))}
              </div>
            ) : (
              <pre>{JSON.stringify(interpretationModal.data, null, 2)}</pre>
            )}
          </div>
        </Dialog>
      )}

      {/* aftab ADD THIS HERE — outside both branches so it works in modal too */}
      {reason?.HoldShow && (
        <Reason
          show={reason?.HoldShow}
          reason={reason}
          setReason={setReason}
          handleNotApproveRemark={handleNotApproveRemark}
          handleResultSubmit={handleResultSubmit}
        />
      )}

      {show?.moadal && (
        <ResultEntryEditModal
          show={show}
          handleClose={() => setShow({ moadal: false, data: {} })}
          handleSave={handleSave}
        />
      )}
      {show2?.moadal && (
        <ResultEditAddModal
          show={show2}
          handleClose={() => setShow2({ moadal: false, data: {} })}
          handleSave={handleSave}
          DignosticMaster={DignosticMaster}
          DepartmentData={DepartmentData}
          getDignosticMasterData={getDignosticMasterData}
          resultData={ResultData}
        />
      )}
      {/* {show5?.modal && (
        <UploadFile
          show={show5?.modal}
          handleClose={(data) => {
            setShow5({ modal: false, data: "", pageName: "", blockUpload: "" });
            printHeader(data, show5.data);
          }}
          documentId={show5.data}
          pageName={show5?.pageName}
          formData={formData}
          isPrintHeader={show5?.Printwithhead}
          blockUpload={show5.blockUpload}
          LedgerTransactionIDHash={ResultTestData[0]?.LedgertransactionIDHash}
          ResultTestData={ResultTestData?.[0]}
        />
      )} */}
      {show7?.modal && (
        <RerunResultEntryModal
          show={show7?.modal}
          data={show7?.data}
          handleClose={() => setShow7({ modal: false, data: {} })}
        />
      )}
      {showAuditTrail?.show && (
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
      {showCallLog?.modal && (
        <PatientCallLogModal
          show={showCallLog.modal}
          rowData={showCallLog.rowData}
          onHide={() => setShowCallLog({ modal: false, rowData: {} })}
        />
      )}
      {showAddendum?.show && (
        <AddendumModal
          show={showAddendum?.show}
          handleShow={handleShowAddendum}
          data={showAddendum?.data}
          TableData={handleCloseAddendum}
          AddendumComment={AddendumComment}
        />
      )}
      {showReport?.show && (
        <UnapprovedReportModal
          show={showReport?.show}
          handleShow={handleShowReport}
          data={showReport?.data}
          reportUrl={reportUrl}
        />
      )}
      {showHisto?.show && (
        <HistoImagesModal
          show={showHisto?.show}
          handleShow={handleShowHistoImages}
          data={showHisto?.data}
          tableData={tableData}
          setTableData={setTableData}
        />
      )}
      {showAddRemark?.modal && (
        <AddRemark
          show={showAddRemark?.modal}
          defaultTestFromRow={true}
          filterTestID={showAddRemark.rowData?.TestID}
          handleShow={() => setShowAddRemark({ modal: false, rowData: null })}
          rowData={showAddRemark.rowData}
          bindTestFromRow={false}
          visitKey="VisitNo"
          testIDsKey="TestID"
          testNamesKey="TestName"
          ledgerTransactionIDKey="LedgerTransactionID"
          patientNameKey="PatientName"
        />
      )}
      <LabIssueModal
        show={reviewModal?.show}
        reviewModal={reviewModal}
        closeReviewModal={closeReviewModal}
        handleSaveReview={handleSaveReview}
        setReviewModal={setReviewModal}
        theme={theme}
        t={t}
      />

      {eyeModalConfig?.show && (() => {
        const content = (
          <>
            <div className={eyeModalConfig.isModal ? "p-dialog-header custom-box-body re-detail-header" : ""} style={{ display: eyeModalConfig.isModal ? "flex" : "none", flexDirection: "column" }}>
              <div
                className="re-detail-chips"
                style={{
                  display: "",
                  gridTemplateColumns: "repeat(auto-fit, minmax(135px, 1fr))",
                  gap: "8px",
                  padding: "0px",
                  borderRadius: "8px",
                }}
              >
                <div style={{ display: "flex", minWidth: "135px", alignItems: "center" }}>
                  <i className="fa fa-folder mr-1" style={{ color: "white" }}></i>
                  <Tooltip position="bottom" label={t("Lab No")}>
                    <span>{ResultData[0]?.LedgerTransactionNo}</span>
                  </Tooltip>
                </div>

                <div style={{ display: "flex", minWidth: "165px", alignItems: "center" }}>
                  <i className="fa fa-user mr-1" style={{ color: "white" }}></i>
                  <Tooltip position="bottom" label={t("Patient Name")}>
                    <span>{ResultData[0]?.PName}</span>
                  </Tooltip>
                </div>
                {ResultTestData[0]?.MobileNo && (
                  <div style={{ display: "flex", minWidth: "165px", alignItems: "center" }}>
                    <i className="fa fa-phone mr-1" style={{ color: "white" }}></i>
                    <Tooltip position="bottom" label={t("Mobile No")}>
                      <span>{ResultTestData[0]?.MobileNo}</span>
                    </Tooltip>
                  </div>
                )}
                {ResultTestData[0]?.hmis_patCrNo && (
                  <div style={{ display: "flex", minWidth: "165px", alignItems: "center" }}>
                    <i className="fa fa-book mr-1" style={{ color: "white" }}></i>
                    <Tooltip position="bottom" label={t("PatCr NO")}>
                      <span>{ResultTestData[0]?.hmis_patCrNo}</span>
                    </Tooltip>
                  </div>
                )}
                {ResultTestData[0]?.WardNo && (
                  <div style={{ display: "flex", minWidth: "165px", alignItems: "center" }}>
                    <i className="fa fa-bed mr-1" style={{ color: "white" }}></i>
                    <Tooltip position="bottom" label={t("WardNo")}>
                      <span>{ResultTestData[0]?.WardNo}</span>
                    </Tooltip>
                  </div>
                )}
                <div style={{ display: "flex", minWidth: "135px", alignItems: "center" }}>
                  <i className="fa fa-book mr-1" style={{ color: "white" }}></i>
                  <Tooltip position="bottom" label={t("Patient Code")}>
                    <span>{ResultData[0]?.PatientCode}</span>
                  </Tooltip>
                </div>
                <div style={{ display: "flex", minWidth: "100px", alignItems: "center" }}>
                  <i className="fa fa-calendar mr-1" style={{ color: "white" }}></i>
                  <Tooltip position="bottom" label={t("Age")}>
                    <span>{ResultData[0]?.Age}</span>
                  </Tooltip>
                </div>
                <div style={{ display: "flex", minWidth: "80px", alignItems: "center" }}>
                  <i className="fa fa-street-view mr-1" style={{ color: "white" }}></i>
                  <Tooltip position="bottom" label={t("Gender")}>
                    <span>{ResultData[0]?.Gender}</span>
                  </Tooltip>
                </div>
                <div style={{ display: "flex", minWidth: "175px", alignItems: "center" }}>
                  <i className="fa fa-h-square mr-1" style={{ color: "white" }}></i>
                  <Tooltip position="bottom" label={t("Center")}>
                    <span>{ResultData[0]?.Centre}</span>
                  </Tooltip>
                </div>
                <div style={{ display: "flex", minWidth: "125px", alignItems: "center" }}>
                  <i className="fa fa-user-md mr-1" style={{ color: "white" }}></i>
                  <Tooltip position="bottom" label={t("Doctor")}>
                    <span>{ResultData[0]?.ReferDoctor}</span>
                  </Tooltip>
                </div>
                <div style={{ display: "flex", minWidth: "175px", alignItems: "center" }}>
                  <i className="fa fa-plus-square mr-1" style={{ color: "white" }}></i>
                  <Tooltip position="bottom" label={t("Rate Type")}>
                    <span>{ResultData[0]?.RateType}</span>
                  </Tooltip>
                </div>
                <div style={{ display: "flex", minWidth: "135px", alignItems: "center" }}>
                  <i className="fa fa-calendar mr-1" style={{ color: "white" }}></i>
                  <Tooltip position="bottom" label={t("Registration Date")}>
                    <span>
                      {ResultData[0]?.RegDate && dateConfig(ResultData[0]?.RegDate)}
                    </span>
                  </Tooltip>
                </div>
                <div style={{ display: "flex", minWidth: "135px", alignItems: "center", gap: "4px" }}>
                  {ResultData?.some((item) => item.isUrgent == 1) && (
                    <div className="d-flex align-items-center" style={{ gap: "4px" }}>
                      <img src={Urgent} className="sizeicon" />
                      <span>Urgent</span>
                    </div>
                  )}
                  {ResultData?.some((item) => item.IsVip == 1) && (
                    <div className="d-flex align-items-center" style={{ gap: "4px" }}>
                      <i className="bi bi-shield-fill-check vip-font-size mb-0" style={{ color: "#FFC107" }} />
                      <span>VIP Patient</span>
                    </div>
                  )}
                  {(() => {
                    const docItem = ResultData?.find((item) => item.IsPatientDocAvail > 0);
                    return (
                      docItem && (
                        <div className="d-flex align-items-center">
                          <i
                            className="fa bi-file-earmark-pdf cursor-pointer"
                            style={{ fontSize: "16px", color: "blue", display: "flex", justifyContent: "center" }}
                            onClick={() => handleOpenPreview(docItem?.awsKeys)}
                            title="View Attachments"
                          />
                          <span>View Attachments</span>
                        </div>
                      )
                    );
                  })()}
                </div>
              </div>

              <div className="custom-row">
                {getUniqueTest()?.map((data, index) => (
                  <div
                    key={index}
                    style={{
                      position: "relative",
                      cursor: "pointer",
                      padding: "2px 5px",
                      background: "#f5f5f5",
                      transition: "all 0.3s ease",
                      boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
                    }}
                    className={`round font-weight-bold mx-2 mt-1 w-auto Status-${data.Status} ${Number(data.Status) === 10 && Number(data.IsPartialResult) === 1 && Number(data.IsApproved) !== 1 ? "partial-result-badge" : ""
                      }`}
                    onMouseEnter={(e) => {
                      setTestHeaderHover({ index: index, data: [] });
                      TestHeaderResponce(data);
                      const rect = e.currentTarget.getBoundingClientRect();
                      const viewportWidth = window.innerWidth;
                      const tooltipWidth = 300;
                      if (rect.right + tooltipWidth > viewportWidth) {
                        setTooltipPosition({ left: "auto", right: 0 });
                      } else {
                        setTooltipPosition({ left: 0, right: "auto" });
                      }
                    }}
                    onMouseLeave={() => {
                      setTestHeaderHover({ index: -1, data: [] });
                      setHeaderTestResult([]);
                    }}
                    onClick={() => {
                      callGetResultEntryByTest(data.TestID, selectedRowIndex, data.TestCentreID);
                    }}
                  >
                    {data?.TestName}
                    {testHeaderHover?.index === index && headerTestResult.length > 0 && (
                      <div
                        style={{
                          position: "absolute",
                          width: "auto",
                          left: "0px",
                          zIndex: 9999999,
                          maxHeight: "300px",
                          overflowY: "auto",
                          overflowX: "hidden",
                          ...tooltipPosition,
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
                                    ele?.Flag === "High" ? "#FFD1DC" : ele?.Flag === "Low" ? "#FDFD96" : "#fff",
                                }}
                              >
                                <td data-title="LabObservationName">{ele?.LabObservationName ? ele?.LabObservationName : "-"}</td>
                                <td data-title="Value">{ele?.Value ? ele?.Value : "-"}</td>
                                <td data-title="ReadingFormat">{ele?.ReadingFormat ? ele?.ReadingFormat : "-"}</td>
                                <td data-title="MinValue">{ele?.MinValue ? ele?.MinValue : "-"}</td>
                                <td data-title="MaxValue">{ele?.MaxValue ? ele?.MaxValue : "-"}</td>
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
            </div>

            <div className="card">
              <div className="p-1">
                <ResultEntryTableCustom>
                  <thead className="cf">
                    <tr style={{ wordWrap: "break-word", whiteSpace: "normal" }}>
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
                      {!Number(HideOmitOptionatResultEntry) && (
                        <th style={{ width: "25px" }}>
                          <Tooltip label={"Omit"}>
                            <div className="m-0 p-0">
                              <i className="ml-1 fa fa-eraser p-0 m-0"></i>
                            </div>
                          </Tooltip>
                        </th>
                      )}
                      <th style={{ width: "20px" }}>
                        <Tooltip label={"Critical"}>
                          <div className="m-0 p-0">
                            <i className="fa fa-exclamation-triangle p-0 m-0"></i>
                          </div>
                        </Tooltip>
                      </th>
                      {/* {!(ResultData[0]?.CentreID == 8 && CompanyID == 1002) && ( */}
                      <>
                        <th>{t("Mac Reading")}</th>
                        <th>{t("Machine Name")}</th>
                      </>
                      {/* )} */}
                      <th>{t("Method Name")}</th>
                      <th style={{ width: "150px" }}>{t("Reference Range")}</th>
                      <th style={{ width: "52px" }}>{t("Unit")}</th>
                      <th style={{ width: "40px" }}>{t("Issues")}</th>
                      <th>{t("Reading 1")}</th>
                      <th>{t("Reading 2")}</th>
                      <th>{t("QC Data")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ResultTestData?.map((Hdata, Hindex) => {
                      const commentsForRow = allComments[Hdata?.InvestigationID] || [];
                      const remarksList = safeParseRemarks(Hdata?.RemarksList);
                      return (
                        <>
                          <tr key={Hindex} style={{ backgroundColor: "lightgrey" }}>
                            <td data-title={t("#")} style={{ width: "15px" }}>
                              <input
                                type="checkbox"
                                onChange={(e) => handleCheckbox(e, -1, Hdata.TestID)}
                                checked={
                                  ResultData?.length > 0
                                    ? isChecked("isChecked", ResultData, true, Hdata.TestID).includes(false)
                                      ? false
                                      : true
                                    : false
                                }
                                disabled={
                                  !(Hdata?.TestCentreID === 0 || Hdata?.TestCentreID === globalCentre) &&
                                  Hdata?.Status === 5
                                }
                                name="isChecked"
                              />
                            </td>
                            <td
                              colSpan={`${isPreviousResultAvailable ? 1 : 3}`}
                              data-title={t("TestName")}
                              style={{ whiteSpace: "normal", wordBreak: "break-word" }}
                            >
                              <div
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "space-between",
                                  gap: "10px",
                                }}
                              >
                                <span className="invName" style={{ fontWeight: "bold" }}>
                                  {Hdata?.PackageName || Hdata?.TestName || Hdata?.ItemName || Hdata?.Test || 'Investigation'}
                                </span>
                                {Hdata?.ShowDLC == 1 && (
                                  <>
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
                            {isPreviousResultAvailable && (
                              <td colSpan={3} data-title={t("Previous Test Date")}>
                                <b>{Hdata.OldValueDate}</b>
                              </td>
                            )}
                            <td>{typeof Hdata?.DefaultSignatureID === "string" && Hdata?.DefaultSignatureID?.includes("#") ? Hdata?.DefaultSignatureID?.split("#")?.[1] : (Hdata?.DefaultSignatureID || "")}</td>
                            <td data-title={t("")} colSpan={1}></td>
                            <td data-title={t("SINNO")} colSpan={2}>
                              <span className="fa fa-barcode">&nbsp;</span>
                              <b>{Hdata?.SINNO}</b>
                            </td>
                            <td colSpan="4" data-title={t("Comment")}>
                              <div className="d-flex flex-wrap align-items-center">
                                {Hdata?.Status != 5 && (
                                  <>
                                    <div
                                      className="m-0 p-0"
                                      onClick={() => {
                                        if (Hdata?.IsApproved == 1 && AllowAttachmentAfterApproval == 0) return;
                                        setShow5({
                                          modal: true,
                                          data: Hdata?.TestIDHash,
                                          pageName: "Add Attachment",
                                          blockUpload:
                                            (Hdata?.Status == 5 || Hdata?.Status == 6) && AllowAttachmentAfterApproval == 0 ? true : false,
                                        });
                                      }}
                                    >
                                      <span style={{ display: "inline-flex", alignItems: "center", gap: "1px" }}>
                                        <Tooltip label={"Add Attachment"}>
                                          <i
                                            className="bi bi-file-earmark-image m-0 text-icon-size ml-1 mr-1"
                                            style={{
                                              color: Hdata?.IsApproved == 1 && AllowAttachmentAfterApproval == 0 ? "gray" : "#07b023",
                                              cursor: Hdata?.IsApproved == 1 && AllowAttachmentAfterApproval == 0 ? "not-allowed" : "pointer",
                                            }}
                                            disabled={!Hdata?.isChecked}
                                          ></i>
                                        </Tooltip>
                                        {Hdata?.DocumentCount > 0 && (
                                          <span
                                            style={{ fontSize: "14px", color: "#07b023", cursor: "pointer" }}
                                            onClick={(e) => { e.stopPropagation(); handleOpenPreview(Hdata?.AttachmentKey); }}
                                          >({Hdata?.DocumentCount})</span>
                                        )}
                                      </span>
                                    </div>
                                    &nbsp;
                                  </>
                                )}
                                <div
                                  style={{ gap: "4px" }}
                                  className="d-flex align-items-center justify-content-center"
                                >
                                  <div
                                    data-tooltip-id={`remark-tooltip-${Hindex}`}
                                    onClick={() =>
                                      setShowAddRemark({ modal: true, rowData: { ...Hdata } })
                                    }
                                    style={{ cursor: "pointer", display: "flex", alignItems: "center", gap: "3px" }}
                                  >
                                    <div
                                      style={{
                                        backgroundColor: "green",
                                        borderRadius: "50%",
                                        width: "18px",
                                        height: "18px",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        boxShadow: "0 1px 3px rgba(0,0,0,0.15)",
                                      }}
                                    >
                                      <FaPlus color="white" size={8} />
                                    </div>
                                    {Hdata?.LabRemarkCount > 0 && (
                                      <span style={{ fontSize: "12px", fontWeight: "bold" }}>
                                        ({Hdata?.LabRemarkCount})
                                      </span>
                                    )}
                                  </div>
                                  {Array.isArray(remarksList) && remarksList?.length > 0 && (
                                    <ReactTooltip
                                      id={`remark-tooltip-${Hindex}`}
                                      place="top"
                                      positionStrategy="fixed"
                                      style={{ zIndex: 9999 }}
                                      clickable
                                      content={<RemarkTooltip remarks={remarksList} />}
                                    />
                                  )}
                                </div>
                                &nbsp;
                                <div>
                                  <FaEye
                                    style={{ marginLeft: "5px", fontSize: "18px", cursor: "pointer", color: "#007bff" }}
                                    onClick={() => { setShowPH(true); }}
                                  />
                                </div>
                                &nbsp;
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
                                                  Hdata?.Status == 5 || Hdata?.Status == 6 ? true : false,
                                              });
                                            }}
                                          >
                                            <Tooltip
                                              label={
                                                Hdata?.Status == 5 || Hdata?.Status == 6
                                                  ? t("Show Report")
                                                  : t("Add Report")
                                              }
                                            >
                                              <span style={{ display: "inline-flex", alignItems: "center", gap: "2px" }}>
                                                <i
                                                  className="bi bi-file-earmark-pdf m-0 text-icon-size"
                                                  style={{ color: "red" }}
                                                  disabled={!Hdata?.isChecked}
                                                  title={Hdata?.Status == 5 ||
                                                    Hdata?.Status == 6
                                                    ? t("Show Report")
                                                    : t("Add Report")}
                                                ></i>
                                                {Hdata?.ReportCount > 0 && (
                                                  <span
                                                    style={{ fontSize: "14px", color: "#e10b0b", cursor: "pointer" }}
                                                    onClick={(e) => { e.stopPropagation(); handleOpenPreview(Hdata?.ReportKey); }}
                                                  >({Hdata?.ReportCount})</span>
                                                )}
                                              </span>{" "}
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
                                                  (Hdata?.Status == 5 || Hdata?.Status == 6) && AllowAttachmentAfterApproval == 0 ? true : false,
                                              });
                                            }}
                                          >
                                            <Tooltip
                                              label={
                                                Hdata?.Status == 5 || Hdata?.Status == 6
                                                  ? t("Show Attachment")
                                                  : t("Add Attachment")
                                              }
                                            >
                                              <span style={{ display: "inline-flex", alignItems: "center", gap: "2px" }}>
                                                <i
                                                  className="bi bi-file-earmark-image m-0 text-icon-size"
                                                  style={{ color: "#07b023" }}
                                                  disabled={!Hdata?.isChecked}
                                                  title={Hdata?.Status == 5 || Hdata?.Status == 6
                                                    ? t("Show Attachment")
                                                    : t("Add Attachment")}
                                                ></i>
                                                {Hdata?.DocumentCount > 0 && (
                                                  <span
                                                    style={{ fontSize: "14px", color: "#07b023", cursor: "pointer" }}
                                                    onClick={(e) => { e.stopPropagation(); handleOpenPreview(Hdata?.AttachmentKey); }}
                                                  >({Hdata?.DocumentCount})</span>
                                                )}
                                              </span>{" "}
                                            </Tooltip>
                                          </div>
                                          &nbsp; &nbsp;
                                          {/* {loading ? (
                                            <Loading />
                                          ) : (
                                            <div
                                              className="m-0 p-0"
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
                                          )} */}
                                        </>
                                      ),
                                  )}
                                {[5, 6].includes(Number(Hdata?.Status)) &&
                                  // buttonsData?.map((ele, index) =>
                                  (
                                    (Number(Hdata?.Status) === 5 && accessRight.includes("4")) ||
                                    (Number(Hdata?.Status) === 6 &&
                                      (accessRight.includes("4") || accessRight.includes("30")))
                                  ) && (
                                    <React.Fragment>
                                      {/* your existing UI stays exactly same */}

                                      {loading ? (
                                        <Loading />
                                      ) : (
                                        <div
                                          className="m-0 p-0"
                                          onClick={() => {
                                            setReason({
                                              ...reason,
                                              HoldShow: true,
                                              Hdata: Hdata,
                                              type: "Not Approved",
                                            });
                                          }}
                                        >
                                          <Tooltip label={"UnApprove"}>
                                            <i
                                              className="bi bi-x-octagon text-icon-size m-0"
                                              style={{ color: "#b06605" }}
                                              disabled={!Hdata?.isChecked}
                                            ></i>
                                          </Tooltip>
                                        </div>
                                      )}
                                    </React.Fragment>
                                  )
                                  // )
                                }
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
                                              onClick={() => handleResultSubmit(ele?.AccessBy, Hdata)}
                                            >
                                              <Tooltip
                                                label={`${ele?.AccessBy} ( Hold Reason : ${Hdata?.Hold_Reason} )`}
                                              >
                                                <i
                                                  className="bi bi-play-circle m-0 text-icon-size ml-2"
                                                  style={{ color: "green" }}
                                                  type="button"
                                                  id="btnMainList"
                                                  disabled={!Hdata?.isChecked}
                                                  key={index}
                                                ></i>
                                              </Tooltip>
                                            </div>
                                          )}
                                        </>
                                      ),
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
                                                  style={{ color: "#d9070e" }}
                                                  type="button"
                                                  id="btnMainList"
                                                  key={index}
                                                  disabled={!Hdata?.isChecked}
                                                ></i>
                                              </Tooltip>
                                            </div>
                                          )}
                                        </>
                                      ),
                                  )}
                                &nbsp;
                                {[3, 13, 14, 10, 20].includes(Hdata.Status) && (
                                  <div onClick={() => setShow7({ modal: true, data: Hdata })}>
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
                                <div onClick={() => { AuditTrailResponce(Hdata); }}>
                                  <Tooltip label={"Audit Trail"}>
                                    <i
                                      className="bi bi-table m-0 text-icon-size mr-2"
                                      style={{ color: "blue" }}
                                    ></i>
                                  </Tooltip>
                                </div>
                                &nbsp;&nbsp;
                                {[5].includes(Hdata.Status) && (
                                  <div onClick={() => getAddendumComment(Hdata)}>
                                    <Tooltip label={"Addendum"}>
                                      <i
                                        className="bi bi-journal-text m-0 text-icon-size mr-2"
                                        style={{ color: "green" }}
                                      ></i>
                                    </Tooltip>
                                  </div>
                                )}
                                &nbsp;&nbsp;
                                <div onClick={() => getUnapprovedReportUrls(Hdata)}>
                                  <Tooltip label={"UnapprovedReportURLs"}>
                                    <i
                                      className="bi bi-exclamation-triangle m-0 text-icon-size mr-2"
                                      style={{ color: "red" }}
                                    ></i>
                                  </Tooltip>
                                </div>
                                &nbsp;&nbsp;
                                {Hdata.IsHisto ? (
                                  <div onClick={() => getHistoImages(Hdata)}>
                                    <Tooltip label={"MoveHistoImage"}>
                                      <i
                                        className="bi bi-arrows-move m-0 text-icon-size mr-2"
                                        style={{ color: "red" }}
                                      ></i>
                                    </Tooltip>
                                  </div>
                                ) : (
                                  <></>
                                )}
                                &nbsp;&nbsp;
                                {[3, 13, 14, 10, 20, 25].includes(Hdata.Status) && (
                                  <div
                                    onClick={() => {
                                      setShowReject({
                                        show: true,
                                        data: {
                                          TestID: Hdata?.TestID,
                                          LedgerTransactionID: Hdata?.LedgerTransactionID,
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
                                {/* {Hdata?.ShowDLC == 1 && (
                            <>
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
                          )} */}
                                {(Hdata?.Status != 5 || AllowAttachmentAfterApproval == 1) && (
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
                                            (Hdata?.Status == 5 || Hdata?.Status == 6) && AllowAttachmentAfterApproval == 0 ? true : false,
                                        });
                                      }}
                                    >
                                      <span style={{ display: "inline-flex", alignItems: "center", gap: "2px" }}>
                                        <Tooltip label={"Add Report"}>
                                          <i
                                            className="bi bi-file-earmark-pdf m-0 text-icon-size ml-1 mr-1"
                                            style={{
                                              color:
                                                Hdata?.IsApproved == 1 &&
                                                  AllowAttachmentAfterApproval == 0
                                                  ? "gray"
                                                  : "red",
                                              cursor:
                                                Hdata?.IsApproved == 1 &&
                                                  AllowAttachmentAfterApproval == 0
                                                  ? "not-allowed"
                                                  : "pointer",
                                            }}
                                            disabled={
                                              Hdata?.IsApproved == 1 &&
                                              AllowAttachmentAfterApproval == 0
                                            }
                                          ></i></Tooltip>{" "}
                                        {Hdata?.ReportCount > 0 && (
                                          <span
                                            style={{ fontSize: "14px", color: "#e10b0b", cursor: "pointer" }}
                                            onClick={(e) => { e.stopPropagation(); handleOpenPreview(Hdata?.ReportKey); }}
                                          >({Hdata?.ReportCount})</span>
                                        )}

                                      </span>
                                    </div>
                                  </>
                                )}
                              </div>
                            </td>
                            <td
                              data-title={t("Issues")}
                              style={{ textAlign: "center", verticalAlign: "middle" }}
                            >
                              {renderReviewIcon(
                                { ...Hdata, TestName: Hdata?.TestName || Hdata?.PackageName },
                                Hdata?.SINNO,
                                `issue-remark-tooltip-detail-${Hindex}`,
                              )}
                            </td>
                            <td colSpan={`${isPreviousResultAvailable ? 2 : 2}`}>
                              {Hindex == 0 && Hdata?.Status == 10 && globalReportType && (
                                <Button className="rounded">
                                  <span onClick={() => reloadRange(ResultTestData)}>
                                    <i className="bi bi-arrow-clockwise mb-0"></i>
                                  </span>
                                </Button>
                              )}
                            </td>
                          </tr>
                          {ResultData?.map((datanew, index) => {
                            const fullText = datanew?.DisplayReading || "";
                            const firstLine = fullText.split("\n")[0];
                            const truncated =
                              fullText.length > 15 ? firstLine.substring(0, 15) + "..." : firstLine;

                            return (
                              <>
                                {Hdata.TestID === datanew.TestID && (
                                  <>
                                    <tr
                                      key={index}
                                      style={{
                                        backgroundColor: datanew?.IsLabOutSource == "True" ? "#ebb17d" : "",
                                      }}
                                    >
                                      <td data-title={t("#")} style={{ width: "15px" }}>
                                        <div className="d-flex">
                                          <input
                                            type="checkbox"
                                            checked={datanew?.isChecked}
                                            onChange={(e) => handleCheckbox(e, index)}
                                            name="isChecked"
                                            disabled={true}
                                          />
                                        </div>
                                      </td>
                                      <td
                                        data-title={t("TestName")}
                                        style={{
                                          whiteSpace: "normal",
                                          wordBreak: "break-word",
                                          backgroundColor:
                                            datanew?.MacReading !== "" &&
                                              datanew?.MacReading !== datanew?.Value
                                              ? "#FF7F7F"
                                              : "",
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
                                      ${isTGGreaterThan400?.value > 350 && (datanew?.IsLDL == 1 || datanew?.IsVLDL == 1 || datanew?.IsTG == 1) ? "required_forvldl" : ""}
                                      ${datanew?.isMandatory === 1 && "required-fields "}
                                      ${datanew?.dlcCheck === 1 && "bg-yellow-new "}`}
                                        >
                                          <span
                                            className={`
                                        ${datanew?.Formula !== "" && "Formula"}
                                        ${isTGGreaterThan400?.value > 350 && (datanew?.IsLDL == 1 || datanew?.IsVLDL == 1 || datanew?.IsTG == 1) ? "required_forvldl" : ""}
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
                                            {datanew?.TestName || datanew?.LabObservationName || datanew?.ItemName || datanew?.Test}
                                            {totalDlcSum > 0 &&
                                              datanew.Header == 1 &&
                                              Hdata?.IsDLCCheck === 1 && (
                                                <strong className="bg-yellow-new ml-2">
                                                  {" "}
                                                  Total DLC Count ={" "}
                                                  {totalDlcSum?.toFixed(2)}
                                                </strong>
                                              )}
                                          </span>
                                        </span>
                                      </td>
                                      {isPreviousResultAvailable && (
                                        <td
                                          data-title={t("Previous Value")}
                                          style={{ wordWrap: "break-word", whiteSpace: "normal" }}
                                        >
                                          {datanew.OldValue}
                                        </td>
                                      )}
                                      {/* Header rows (e.g. DLC section title) must still carry Value/Flag/Critical */}
                                      {Number(datanew?.Header) === 0 ||
                                      Number(datanew?.Header) === 1 ? (
                                        <>
                                          {["2", "3"].includes(datanew?.ReportType) ? (
                                            <td colspan={1}>
                                              <>
                                                <div className="d-flex">
                                                  <ReactSelect
                                                    id={`comment-select-${index}`}
                                                    inputId={`comment-select-input-${index}`}
                                                    placeholderName="Select Comment"
                                                    searchable={true}
                                                    removeIsClearable={false}
                                                    respclass="w-100"
                                                    name="COMMENT"
                                                    dynamicOptions={[
                                                      { value: "", label: t("Select Comment") },
                                                      ...commentsForRow.map((c) => ({
                                                        value: c.TemplateText,
                                                        label: c.Template,
                                                      })),
                                                    ]}
                                                    value={datanew?.COMMENT || ""}
                                                    onChange={(name, selected) => {
                                                      setEditTable(true);
                                                      setResultData((prev) => {
                                                        const updatedTestData = [...prev];
                                                        let previous = updatedTestData[index]?.COMMENT || "";
                                                        let newComment = selected?.value || "";
                                                        if (multiCommentRow?.[index] && previous) {
                                                          newComment = previous + "<br/>" + newComment;
                                                        }
                                                        updatedTestData[index] = {
                                                          ...updatedTestData[index],
                                                          COMMENT: newComment,
                                                          SaveRangeStatus: 1,
                                                        };
                                                        return updatedTestData;
                                                      });
                                                    }}
                                                  />
                                                  <input
                                                    title="select multiple comments"
                                                    type="checkbox"
                                                    checked={multiCommentRow?.[index] || false}
                                                    onChange={(e) =>
                                                      setMultiCommentRow((prev) => ({
                                                        ...prev,
                                                        [index]: e.target.checked,
                                                      }))
                                                    }
                                                  />
                                                </div>
                                              </>
                                              {DefaultCurrencyName != "KES" && datanew?.DepartmentID == 39 && (
                                                <SelectBox
                                                  options={[
                                                    { label: "DignosticMaster...", value: "" },
                                                    ...DignosticMaster,
                                                  ]}
                                                  id="Dignomasterid"
                                                  lable="Dignomasterid"
                                                  selectedValue={datanew?.Dignomasterid}
                                                  onChange={(e) => {
                                                    setResultData((prev) => {
                                                      const updatedTestData = [...prev];
                                                      updatedTestData[index] = {
                                                        ...updatedTestData[index],
                                                        Dignomasterid: e.target.value,
                                                      };
                                                      return updatedTestData;
                                                    });
                                                  }}
                                                  name="Dignomasterid"
                                                />
                                              )}
                                            </td>
                                          ) : datanew?.dlcCheck === 1 ? (
                                            datanew?.IsHelpMenu === 0 ? (
                                              <td data-title={t("Value")}>
                                                <textarea
                                                  rows={1}
                                                  className={`form-control input-sm resultInput ${datanew?.isMandatory === 1 && !datanew?.Value
                                                      ? "mandatory-empty"
                                                      : ""
                                                    }`}
                                                  name="Value"
                                                  autoComplete="off"
                                                  disabled={
                                                    Number(Hdata?.Status) === 5 || Number(datanew?.Status) === 5
                                                      ? true
                                                      : isTGGreaterThan400.isTG &&
                                                        parseFloat(isTGGreaterThan400.value) > 350 &&
                                                        (datanew?.IsLDL === 1 || datanew?.IsVLDL === 1)
                                                        ? false
                                                        : (datanew?.CanSaveAmendment === 0 && datanew?.MacReading)
                                                          ? true
                                                          : false
                                                  }
                                                  value={datanew?.Value}
                                                  onChange={(e) => {
                                                    autoGrowResultValue(e.target);
                                                    handleValueChange(
                                                      index,
                                                      e.target.value,
                                                      datanew?.TestID,
                                                      datanew?.AllowEditCalculationValue
                                                    )
                                                  }}
                                                  onKeyDown={(e) => handleKeyUp(e, index)}
                                                  ref={(el) => {
                                                    myRefs.current[index] = el;
                                                    autoGrowResultValue(el);
                                                  }}
                                                />
                                              </td>
                                            ) : (
                                              <td data-title={t("Value")}>
                                                <textarea
                                                  rows={1}
                                                  className={`form-control input-sm resultInput  ${datanew?.isMandatory === 1 && !datanew?.Value
                                                      ? "mandatory-empty"
                                                      : ""
                                                    }`}
                                                  name="Value"
                                                  value={datanew?.Value}
                                                  disabled={
                                                    Number(Hdata?.Status) === 5 || Number(datanew?.Status) === 5
                                                      ? true
                                                      : isTGGreaterThan400.isTG &&
                                                        parseFloat(isTGGreaterThan400.value) > 350 &&
                                                        (datanew?.IsLDL === 1 || datanew?.IsVLDL === 1)
                                                        ? false
                                                        : (datanew?.CanSaveAmendment === 0 && datanew?.MacReading)
                                                          ? true
                                                          : false
                                                  }
                                                  onChange={(e) => {
                                                    autoGrowResultValue(e.target);
                                                    handleValueChange(
                                                      index,
                                                      e.target.value,
                                                      datanew?.TestID,
                                                      datanew?.AllowEditCalculationValue
                                                    )
                                                  }}
                                                  onKeyDown={(e) => handleKeyUp(e, index)}
                                                  autoComplete="off"
                                                  ref={(el) => {
                                                    myRefs.current[index] = el;
                                                    autoGrowResultValue(el);
                                                  }}
                                                />
                                              </td>
                                            )
                                          ) : datanew?.IsHelpMenu === 0 ? (
                                            <td data-title={t("Value")}>
                                              <textarea
                                                rows={1}
                                                className={`form-control input-sm resultInput  ${datanew?.isMandatory === 1 && !datanew?.Value
                                                    ? "mandatory-empty"
                                                    : ""
                                                  }`}
                                                name="Value"
                                                disabled={
                                                    Number(Hdata?.Status) === 5 || Number(datanew?.Status) === 5
                                                      ? true
                                                      : isTGGreaterThan400.isTG &&
                                                        parseFloat(isTGGreaterThan400.value) > 350 &&
                                                        (datanew?.IsLDL === 1 || datanew?.IsVLDL === 1)
                                                        ? false
                                                        : (datanew?.CanSaveAmendment === 0 && datanew?.MacReading)
                                                          ? true
                                                          : false
                                                  }
                                                value={datanew?.Value}
                                                onChange={(e) => {
                                                  autoGrowResultValue(e.target);
                                                  handleValueChange(
                                                    index,
                                                    e.target.value,
                                                    datanew?.TestID,
                                                    datanew?.AllowEditCalculationValue
                                                  )
                                                }}
                                                onKeyDown={(e) => handleKeyUp(e, index)}
                                                autoComplete="off"
                                                ref={(el) => {
                                                  myRefs.current[index] = el;
                                                  autoGrowResultValue(el);
                                                }}
                                              />
                                            </td>
                                          ) : (
                                            <td data-title={t("Value")}>
                                              <div style={{ position: "relative" }}>
                                                <textarea
                                                  rows={1}
                                                  className={`form-control input-sm resultInput ${datanew?.isMandatory === 1 && !datanew?.Value
                                                      ? "mandatory-empty"
                                                      : ""
                                                    }`}
                                                  name="Value"
                                                  autoComplete="off"
                                                  disabled={
                                                    Number(Hdata?.Status) === 5 || Number(datanew?.Status) === 5
                                                      ? true
                                                      : isTGGreaterThan400.isTG &&
                                                        parseFloat(isTGGreaterThan400.value) > 350 &&
                                                        (datanew?.IsLDL === 1 || datanew?.IsVLDL === 1)
                                                        ? false
                                                        : (datanew?.CanSaveAmendment === 0 && datanew?.MacReading)
                                                          ? true
                                                          : false
                                                  }
                                                  value={datanew?.Value}
                                                  onChange={(e) => {
                                                    autoGrowResultValue(e.target);
                                                    handleValueChange(
                                                      index,
                                                      e.target.value,
                                                      datanew?.TestID,
                                                      datanew?.AllowEditCalculationValue
                                                    );
                                                    setHiddenDropDownHelpMenu(false);
                                                  }}
                                                  readOnly={datanew?.HelpValueOnly === 1}
                                                  onKeyDown={(e) => {
                                                    getHelpMenuData(e, datanew?.labObservationID);
                                                    handleIndex(e, index);
                                                    handleKeyUp(e, index);
                                                  }}
                                                  ref={(el) => {
                                                    myRefs.current[index] = el;
                                                    autoGrowResultValue(el);
                                                  }}
                                                  onBlur={() =>
                                                    setTimeout(() => {
                                                      setHiddenDropDownHelpMenu(false);
                                                    }, [1000])
                                                  }
                                                  style={{
                                                    backgroundImage: `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" fill="%23000" height="16" width="16" viewBox="0 0 24 24"><path d="M7 10l5 5 5-5" stroke-width="2" stroke="black" fill="black"/></svg>')`,
                                                    backgroundPosition: "calc(100% - 10px) center",
                                                    backgroundRepeat: "no-repeat",
                                                    paddingRight: "30px",
                                                    cursor: datanew?.HelpValueOnly === 1 ? "pointer" : "text",
                                                  }}
                                                  onClick={(e) => {
                                                    setHiddenDropDownHelpMenu(!HiddenDropDownHelpMenu);
                                                    getHelpMenuData(e, datanew?.labObservationID);
                                                  }}
                                                />
                                                {helpmenu.length > 0 &&
                                                  helpmenu[0]?.Value == datanew?.labObservationID &&
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
                                                      {helpmenu.map((data, helpmenuindex) => (
                                                        <li
                                                          key={helpmenuindex}
                                                          onClick={() => {
                                                            handleListSearch(data, "Value", index);
                                                            setHiddenDropDownHelpMenu(false);
                                                          }}
                                                          className={`${helpmenuindex === indexMatch ? "matchIndex" : ""}`}
                                                        >
                                                          {data?.label}
                                                        </li>
                                                      ))}
                                                    </ul>
                                                  )}
                                              </div>
                                            </td>
                                          )}
                                          {["2", "3"].includes(datanew?.ReportType) ? (
                                            <td></td>
                                          ) : (
                                            <td style={{ position: "relative" }} data-title={t("Action")}>
                                              <div className="d-flex align-items-center">
                                                <div
                                                  className="mx-1 p-2"
                                                  style={{ cursor: "pointer", fontSize: "15px" }}
                                                  onClick={() =>
                                                    setShow2({
                                                      moadal: true,
                                                      data: { ...datanew, pageName: "Single" },
                                                    })
                                                  }
                                                >
                                                  <Tooltip label={"Add Comment"}>
                                                    <i
                                                      className="fa fa-plus plusSign"
                                                      aria-hidden="true"
                                                      style={{ color: "white" }}
                                                    ></i>
                                                  </Tooltip>
                                                </div>
                                                <span
                                                  className="fa fa-exclamation-triangle p-2"
                                                  aria-hidden="true"
                                                  style={{
                                                    cursor: "pointer",
                                                    fontSize: "15px",
                                                    width: "35px",
                                                    padding: "5px 10px",
                                                    color: datanew?.OldValue !== "" ? "orangered" : "black",
                                                  }}
                                                  onMouseEnter={() => {
                                                    setMouseHover({ index: index, data: [] });
                                                    DeltaResponse(datanew);
                                                  }}
                                                  onMouseLeave={() => {
                                                    setMouseHover({ index: -1, data: [] });
                                                    setPreviousTestResult([]);
                                                  }}
                                                >
                                                  {mouseHover?.index === index && PreviousTestResult.length > 0 && (
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
                                                          {PreviousTestResult.map((ele, index) => (
                                                            <tr key={index} style={{ background: "skyBlue" }}>
                                                              <td data-title="BookingDate" style={{ width: "120px" }}>
                                                                {dateConfig(ele?.BookingDate)}
                                                              </td>
                                                              <td data-title="BookingDate" style={{ width: "120px" }}>
                                                                {dateConfig(ele?.ApprovedDate)}
                                                              </td>
                                                              <td data-title="LabObservationName">
                                                                {ele?.LabObservationName ? ele?.LabObservationName : "-"}
                                                              </td>
                                                              <td data-title="Value">
                                                                {ele?.Value ? ele?.Value : "-"}
                                                              </td>
                                                              <td data-title="ReadingFormat">
                                                                {ele?.ReadingFormat ? ele?.ReadingFormat : "-"}
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
                                                </span>
                                              </div>
                                            </td>
                                          )}
                                          {["2", "3"].includes(datanew?.ReportType) ? (
                                            <td> &nbsp;</td>
                                          ) : (
                                            <td className="w-50p" data-title={t("Flag")}>
                                              <select
                                                value={
                                                  datanew?.IsHelpMenu && datanew?.HelpMenuBold ? "" : datanew?.Flag
                                                }
                                                onChange={(e) => handleFlagChange(e, datanew.labObservationID)}
                                              // disabled
                                              >
                                                <option value="">Select</option>
                                                <option value="Normal">Normal</option>
                                                <option value="High">High</option>
                                                <option value="Low">Low</option>
                                              </select>
                                            </td>
                                          )}
                                          {!Number(HideOmitOptionatResultEntry) && (
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
                                          )}
                                          <td data-title={t("Critical")}>
                                            <input
                                              type="checkbox"
                                              checked={datanew?.IsCriticalCheck}
                                              onChange={(e) => handleCheckbox(e, index)}
                                              name="IsCriticalCheck"
                                              disabled={
                                                datanew?.TestCentreID == 0 || datanew?.TestCentreID == globalCentre
                                                  ? false
                                                  : true
                                              }
                                            />
                                          </td>
                                          {/* {!(ResultData[0]?.CentreID == 8 && CompanyID == 1002) && ( */}
                                            <>
                                              <td
                                                data-title={t("Mac Reading")}
                                                className={`Status-${getGroupStatus(datanew?.TestID) ?? datanew?.Status} ${Number(getGroupStatus(datanew?.TestID) ?? datanew?.Status) === 10 && Number(datanew?.IsPartialResult) === 1 && Number(datanew?.IsApproved) !== 1 ? "partial-result-badge" : ""}`}
                                                style={{ wordWrap: "break-word", whiteSpace: "normal" }}
                                              >
                                                {datanew?.MacReading}&nbsp;
                                              </td>
                                              <td
                                                data-title={t("MachineName")}
                                                style={{ wordWrap: "break-word", whiteSpace: "normal" }}
                                              >
                                                {datanew?.machinename}&nbsp;
                                              </td>
                                            </>
                                          {/* )} */}
                                          {["2", "3"].includes(datanew?.ReportType) ? (
                                            <td data-title=""> &nbsp;</td>
                                          ) : (
                                            <td
                                              data-title={t("Method Name")}
                                              style={{ wordWrap: "break-word", whiteSpace: "normal" }}
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
                                                  flexDirection: "row-reverse",
                                                  justifyContent: "space-between",
                                                  alignItems: "center",
                                                }}
                                              >
                                                <div>
                                                  {["2", "3"].includes(datanew?.ReportType) ? (
                                                    <div data-title=""> &nbsp;</div>
                                                  ) : (
                                                    <div onClick={() => setShow({ moadal: true, data: datanew })}>
                                                      <Tooltip label={t("Edit")}>
                                                        <i
                                                          className="bi bi-pencil-square m-0 mr-3 text-icon-size-edit"
                                                          title={t("Edit")}
                                                          aria-label={t("Edit")}
                                                          data-tooltip="Edit"
                                                          style={{ color: "#274C77" }}
                                                        ></i>
                                                      </Tooltip>
                                                    </div>
                                                  )}
                                                </div>
                                                <div
                                                  style={{
                                                    wordWrap: "break-word",
                                                    whiteSpace: "normal",
                                                    maxWidth: "150px",
                                                  }}
                                                >
                                                  <span>{truncated}</span>
                                                </div>
                                              </div>
                                              &nbsp;
                                            </td>
                                          )}
                                          {["2", "3"].includes(datanew?.ReportType) ? (
                                            <td data-title=""> &nbsp;</td>
                                          ) : (
                                            <td data-title={t("ReadingFormat")}>
                                              <div style={{ wordWrap: "break-word", whiteSpace: "normal" }}>
                                                {datanew?.ReadingFormat}
                                              </div>
                                              &nbsp;
                                            </td>
                                          )}
                                          <td data-title={t("Issues")}>&nbsp;</td>
                                          <td
                                            data-title={t("Reading 1")}
                                            style={{ wordWrap: "break-word", whiteSpace: "normal" }}
                                          >
                                            {datanew?.Reading1} &nbsp;
                                          </td>
                                          <td
                                            data-title={t("Reading 2")}
                                            style={{ wordWrap: "break-word", whiteSpace: "normal" }}
                                          >
                                            {datanew?.Reading2} &nbsp;
                                          </td>
                                        </>
                                      ) : (
                                        <>
                                          <td data-title={t("Issues")}>&nbsp;</td>
                                          <td colSpan="1" data-title="">
                                            {totalDlcSum > 0 && datanew.Header == 1 && Hdata?.IsDLCCheck === 1 && (
                                              <div
                                                className="mb-0 py-0 rouned"
                                                style={{ letterSpacing: "0.4px" }}
                                              >
                                                <strong className="bg-yellow-new">
                                                  Total DLC Count = {totalDlcSum?.toFixed(2)}
                                                </strong>
                                              </div>
                                            )}
                                            &nbsp;
                                          </td>
                                        </>
                                      )}
                                      <td data-title="QC Data" >
                                        {typeof datanew?.QCData === "string" && datanew.QCData.split(",").map((item, index) => {
                                          const [content, status] = item.split("#");
                                          return (
                                            <div
                                              key={index}
                                              className="fw-bold mb-1"
                                              style={{
                                                color: "black",
                                                backgroundColor: status === "0" ? "#ff8bbcff" : "#93ffbeff",
                                                padding: "0px 2px",
                                                borderRadius: "4px",
                                                fontSize: "12px",
                                                border: `1px solid ${status === "0" ? "#ffc1e3" : "#c3e6cb"}`,
                                              }}
                                            >
                                              {content}
                                            </div>
                                          );
                                        })}
                                      </td>
                                    </tr>
                                    {datanew?.Header === 0 && ["2", "3"].includes(datanew?.ReportType) && (
                                      <tr>
                                        <td colSpan={(isPreviousResultAvailable ? 16 : 15) - (ResultData[0]?.CentreID == 8 && CompanyID == 1002 ? 2 : 0)}>
                                          <div className="d-flex justify-content-end mb-1">
                                            <button
                                              className="btn btn-primary btn-class px-2 py-1"
                                              style={{ borderRadius: 0 }}
                                              onClick={() => setSaveTemplateModal({ visible: true, templateName: "", templateNameErr: "", observationData: datanew })}
                                              title={t("Save Template")}
                                            >
                                              <i className="bi bi-floppy mb-0 p-0" style={{ fontSize: "11px" }}></i>
                                            </button>
                                          </div>
                                          <div className="editorHeight">
                                            <FullTextEditor
                                              isCollapsed={DefaultCurrencyName == "KES" ? false : true}
                                              isDefaultCollapsed={DefaultCurrencyName == "KES" ? true : false}
                                              key={`${datanew?.labObservationID ?? index}-${index}`}
                                              value={datanew?.COMMENT}
                                              EditTable={EditTable}
                                              setEditTable={setEditTable}
                                              autoResize={true}
                                              editorHeight={getEditorHeight(datanew?.COMMENT)}
                                              setValue={(newValue) => {
                                                setEditTable(false);
                                                setResultData((prev) => {
                                                  const updatedTestData = [...prev];
                                                  updatedTestData[index] = {
                                                    ...updatedTestData[index],
                                                    COMMENT: newValue,
                                                    SaveRangeStatus: 1,
                                                  };
                                                  return updatedTestData;
                                                });
                                              }}
                                            />
                                          </div>
                                        </td>
                                      </tr>
                                    )}
                                  </>
                                )}
                              </>
                            );
                          })}
                          {Hdata?.datatype === "Profile" && (
                            <tr>
                              {commentsForRow.length > 0 && (
                                <td colspan={2}>
                                  <div className="d-flex ">
                                    <ReactSelect
                                      id={`comment-select-${Hindex}`}
                                      inputId={`comment-select-input-${Hindex}`}
                                      placeholderName="Select Comment"
                                      searchable={true}
                                      removeIsClearable={true}
                                      respclass="w-100"
                                      name="COMMENT"
                                      dynamicOptions={[
                                        { value: "", label: t("Select Comment") },
                                        ...commentsForRow.map((c) => ({
                                          value: c.TemplateText,
                                          label: c.Template,
                                        })),
                                      ]}
                                      value={Hdata.COMMENT || ""}
                                      onChange={(name, selected) => {
                                        const updatedTestData = [...ResultTestData];
                                        let previous = Hdata?.COMMENT || "";
                                        let newComment = selected?.value || "";
                                        if (isMultiComment && previous) {
                                          newComment = previous + "<br/>" + newComment;
                                        }
                                        updatedTestData[Hindex] = {
                                          ...updatedTestData[Hindex],
                                          COMMENT: newComment,
                                          PLAIN_COMMENT: formatHtmlToText(newComment),
                                          SaveRangeStatus: 1,
                                          labObservationID: -1,
                                        };
                                        setResultTestData(updatedTestData);
                                      }}
                                    />
                                    <input
                                      title="select multiple comments"
                                      className="ml-2"
                                      type="checkbox"
                                      checked={isMultiComment}
                                      onChange={(e) => setIsMultiComment(e.target.checked)}
                                    />
                                  </div>
                                </td>
                              )}
                              <td
                                colSpan={
                                  (commentsForRow?.length > 0
                                    ? isPreviousResultAvailable ? 14 : 13
                                    : isPreviousResultAvailable ? 16 : 15) - (ResultData[0]?.CentreID == 8 && CompanyID == 1002 ? 2 : 0)
                                }
                                style={{ padding: "0 15px" }}
                              >
                                <div
                                  contentEditable
                                  suppressContentEditableWarning={true}
                                  style={{
                                    width: "100%",
                                    minHeight: "25px",
                                    outline: "none",
                                    whiteSpace: "pre-wrap",
                                    wordBreak: "break-word",
                                    backgroundColor: "#f5f5f5",
                                  }}
                                  ref={(el) => {
                                    if (el) {
                                      commentRefs.current[Hindex] = el;
                                      const commentContent = coerceToString(Hdata?.COMMENT);
                                      if (el.innerHTML !== commentContent) {
                                        el.innerHTML = commentContent;
                                      }
                                      el.style.height = "auto";
                                      el.style.height = el.scrollHeight + "px";
                                    }
                                  }}
                                  onInput={(e) => {
                                    const html = e.currentTarget.innerHTML;
                                    setResultTestData((prev) => {
                                      const updatedTestData = [...prev];
                                      updatedTestData[Hindex] = {
                                        ...updatedTestData[Hindex],
                                        COMMENT: coerceToString(html),
                                        PLAIN_COMMENT: formatHtmlToText(html),
                                      };
                                      return updatedTestData;
                                    });
                                    e.currentTarget.style.height = "auto";
                                    e.currentTarget.style.height = e.currentTarget.scrollHeight + "px";
                                  }}

                                />
                              </td>
                            </tr>
                          )}
                        </>
                      );
                    })}
                  </tbody>
                </ResultEntryTableCustom>
              </div>
              <div className="m-0 p-0 pb-2" style={{ zIndex: 0 }}>

                <div
                  className="row mt-3 mr-1 d-flex flex-wrap re-action-row"
                  style={{ textWrap: "avoid" }}
                >
                  {loading ? (
                    <div className="mx-3">
                      <Loading />
                    </div>
                  ) : (
                    controllerButtonDynamicList?.map((item, index) =>
                      renderDynamicButton(item, index)
                    )
                  )}
                </div>
              </div>
            </div>
          </>
        );
        if (eyeModalConfig.isModal) {
          return (
            <Dialog
              header={`Result Entry — ${eyeModalConfig?.data?.PatientName || ""} | Visit: ${eyeModalConfig?.data?.VisitNo || ""}`}
              visible={eyeModalConfig.show}
              style={{ width: "95vw", maxWidth: "1420px" }}
              onHide={() => {
                setEyeModalConfig({ show: false, data: null, index: null });
                setResultData([]);
                setResultTestData([]);
                setCopyPayload({});
                setAllComments({});
              }}
              maximizable
              className={theme}
              closeOnEscape={true}
              closable={true}
            >
              {content}
            </Dialog>
          );
        }
        return expansionAnchor ? ReactDOM.createPortal(content, expansionAnchor) : null;
      })()}
      <OldReportModal
        show={showOldReportModal.show}
        value={showOldReportModal.data}
        handleClose={() => {
          setShowOldReportModal({ show: false, data: "" });
        }}
      />
    </>
  );
};

export default ResultEntry;
