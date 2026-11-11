import React, { useEffect, useRef, useState } from "react";
import Accordion from "../../components/UI/Accordion";
import { useTranslation } from "react-i18next";
import { SelectBox } from "../../components/formComponent/SelectBox";
import Input from "../../components/formComponent/Input";
import ReactSelect from "../../components/formComponent/ReactSelect";
import moment from "moment";
import {
  defaultOption,
  getStatusColor,
  SampleStatus,
  SearchByCulture,
} from "../../utils/Constants";
import DatePicker from "../../components/formComponent/DatePicker";
import CustomTimePicker from "../../components/formComponent/TimePicker";
import { axiosInstance, axiosReport } from "../../utils/axiosInstance";
import {
  CheckDevice,
  dateConfig,
  DyanmicStatusResponseCulture,
  ExportToExcel,
  getMaxToDate,
  getRangeClass,
  number,
  parseAwsKeys,
  parseRemarks,
  Time,
} from "../../utils/helpers";
import {
  parseMappedSignature,
  resolveApprovalDoctor,
  withMappedDoctorOption,
} from "../../utils/dutyRosterApprovalDoctor";
import Loading from "../../components/loader/Loading";
import REAllergyTable from "../Table/REAllergyTable";
import ResultEntryTableCustom from "./ResultEntryTableCustom";
import Tooltip from "../../components/formComponent/Tooltip";
import TemplateMasterModal from "../utils/TemplateMasterModal";
import { Link, useLocation } from "react-router-dom";

import Tables from "../../components/UI/customTable";
import { toast } from "react-toastify";
import PatientDetailModal from "../utils/PatientDetailModal";
import UploadFile from "../utils/UploadFileModal/UploadFile";
import {
  getCollectionBoy,
  getPaymentModes,
  getSearchController,
} from "../../utils/NetworkApi/commonApi";
import "./ResultEntry.css";
import TableFilterDot from "../../components/TableFilter/TableFilterDot";
import { usePageControls } from "../../utils/hooks/usePageControls";
import { CustomButton, SearchButton } from "../../components/UI/CustomButton";
import { AutoComplete } from "primereact/autocomplete";
import { FloatLabel } from "primereact/floatlabel";
import { useLocalStorage } from "../../utils/hooks/useLocalStorage";
import { Dialog } from "primereact/dialog";
import { logoList } from "../../utils/utils";
import ResultEntryEditModal from "../utils/ResultEntryEditModal";
import { CustomSelectBox } from "../../components/formComponent/CustomSelectBox";
import Urgent from ".././Images/urgent.gif";
import PdfPreviewModal from "../utils/PdfPreviewModal";
import PageControlGear from "../../components/PageGearModel/PageControlGear";

function ResultEntryAllergy() {
  const [PrintReportLoading, setPrintReportLoading] = useState(false);
  const [reData, SetReData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [buttonsData, setButtonsData] = useState([]);
  const [bindAllergyType, setBindAllergyType] = useState([]);
  const [showPH, setShowPH] = useState(false);
  const [showColumnModal, setShowColumnModal] = useState(false);
  const [proEmployee, setProEmployee] = useState([]);
  const [originalTableData, setOriginalTableData] = useState([]);
  const [mandatoryIDs, setMandatoryIDs] = useState([]);
  const {
    ShowDefaultLoginCentre,
    MaxDateRangeatResultEntry,
    DefaultAllStatusResultEntry,
    HideResultEntryPreview,
  } = useLocalStorage("userData", "get");
  const maxRange = Number(MaxDateRangeatResultEntry) || 15;
  const DefaultCentre = useLocalStorage("DefaultCentre", "get");

  const [state, setState] = useState({
    ProEmployee: "",
  });
  const [showUD, setShowUD] = useState({
    modal: false,
    data: "",
    index: -1,
  });
  const [Identity, setIdentity] = useState([]);

  const today = new Date();
  const [show5, setShow5] = useState({
    modal: false,
    data: "",
  });
  const myRefs = useRef([]);

  const [show3, setShow3] = useState({
    modal: false,
    data: {},
  });
  const [show2, setShow2] = useState({
    moadal: false,
    data: {},
  });
  const [entryPayload, setEntryPayload] = useState({
    organism: "",
    IncubationDate: new Date(),
    IncubationTime: "00:00:00",
    ApprovedBy: "",
    ApprovalName: "",
  });
  const [rateTypeLoading, setRateTypeLoading] = useState(false);

  const [payload, setPayload] = useState({
    FromDate: new Date(),
    ToDate: new Date(),
    ItemValue: "",
    SelectTypes: defaultOption?.value || "",
    DepartmentID: "",
    TestName: "",
    CentreID: "",
    SampleStatus: DefaultAllStatusResultEntry === "1" ? "" : "3",
    FromTime: "00:00:00",
    ToTime: "23:59:59",
    testCentreID: "0",
    IsTat: 0,
    Remarks: "",
    RemarkID: 0,
  });
  const [CentreData, setCentreData] = useState([]);
  const [RateTypes, setRateTypes] = useState([]);
  const [department, setDepartment] = useState([]);
  const [doctorAdmin, setDoctorAdmin] = useState([]);

  const [value, setValue] = useState("");
  const [items, setItems] = useState([]);

  const [TestSuggestion, setTestSuggestion] = useState([]);
  const [statusValue, setStatusValue] = useState("");
  const [ResultTestData, setResultTestData] = useState([]);
  const [ResultData, setResultData] = useState([]);
  const [entryShow, setEntryShow] = useState(false);
  const [collectionBoy, setCollectionBoy] = useState();
  const [collectionBoyList, setCollectionBoyList] = useState([]);
  const [entry, setEntry] = useState([]);
  const [transferCentres, setTransferCentres] = useState([]);
  const [investigationId, setInvestigationID] = useState(0);
  const [controllerDynamicList, setControllerDynamicList] = useState([]);
  const [filterData, setFilterData] = useState([]); // ✅ NEW: for table column controllers
  const [columnConfig, setColumnConfig] = useState([]);
  const [tabbingOrder, setTabbingOrder] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [remarkOptions, setRemarkOptions] = useState([]);
  const [show, setShow] = useState({
    moadal: false,
    data: {},
  });
  const [previewConfig, setPreviewConfig] = useState({
    visible: false,
    url: null,
  });

  const [showReportModal, setShowReportModal] = useState({
    show: false,
    url: "",
  });

  const accessRightStr = useLocalStorage("accessRight", "get") || "";
  const accessRight = accessRightStr
    ? accessRightStr?.split(",").filter(Boolean)
    : [];

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (showReportModal.show && (e.ctrlKey || e.metaKey) && (e.key === 'p' || e.key === 'P')) {
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

  const { t } = useTranslation();
  const theme = useLocalStorage("theme", "get");
  const localData = useLocalStorage("userData", "get");
  const pathname = useLocation()?.pathname;
  const { isActive } = usePageControls(pathname);
  const PAGE_ID = "774";

  const handleUploadCount = (name, value, secondName) => {
    let data = [...reData];
    if (name === "UploadDocumentCount") {
      data[showUD?.index][name] = value;
      data[showUD?.index][secondName] = value === 0 ? 0 : 1;
      SetReData(data);
    } else {
      SetReData(data);
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

  const getAllergyData = () => {
    if (investigationId === 0) {
      return;
    }
    const payload = {
      investigationId: investigationId || 0,
    };
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

  const totalPatient = () => {
    const visitNos = reData.map((item) => item?.LedgerTransactionNo);
    const uniqueVisitNos = new Set(visitNos);
    return uniqueVisitNos?.size;
  };

  const totalTest = () => {
    const visitNos = reData.map((item) => item?.TestID);
    const uniqueVisitNos = new Set(visitNos);
    return uniqueVisitNos?.size;
  };

  const getFormattedDate = (d) => {
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();
    return `${month}/${day}/${year}`;
  };

  const TableData = (SampleStatus) => {
    setLoading(true);
    const rateTypes = RateTypes.map((item) => {
      return item?.value;
    });

    const CenterDatas = CentreData.map((item) => {
      return item?.value;
    });
    axiosInstance
      .post("ResultentryAllergy/PatientSearchAllergy", {
        FromDate: getFormattedDate(payload.FromDate),
        ToDate: getFormattedDate(payload.ToDate),
        CollectionBoyID: Number(collectionBoy || 0),
        DepartmentId: payload.DepartmentID,
        CentreId: payload?.CentreID ? [String(payload?.CentreID || 0)] : [],
        RateTypeID: payload?.RateTypeID
          ? [String(payload?.RateTypeID || 0)]
          : [],
        InvestigationId: String(payload?.TestName?.value || ""),
        SearchType: payload?.SelectTypes,
        SearchValue: payload?.ItemValue?.trim(),
        SampleStatus: SampleStatus,
        FromTime: payload?.FromTime,
        ToTime: payload?.ToTime,
        ProEmployeeID: Number(state?.ProEmployee || 0),
        testCentreId: payload?.testCentreID ? Number(payload.testCentreID) : 0,
        IsTat: Number(payload?.IsTat) || 0,
        remarks: payload?.Remarks || "",
        RemarkID:
          payload?.RemarkID === "others" ? 0 : Number(payload?.RemarkID) || 0,
      })
      .then((res) => {
        SetReData(res?.data?.message);
        setOriginalTableData(res?.data?.message);
        setLoading(false);
        setStatusValue(
          SampleStatus === "" ? SampleStatus : parseInt(SampleStatus),
        );
      })
      .catch((err) => {
        SetReData([]);
        setLoading(false);
        toast.error(
          err?.response?.data?.message
            ? err?.response?.data?.message
            : "Error Occured",
        );
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    if (name === "DepartmentID") {
      setPayload({ ...payload, [name]: value, TestName: "" });
      DepartmentWiseItemList(value);
    } else setPayload({ ...payload, [name]: value });
  };

  const handleKeyDown = (e) => {
    if (e?.key === "Enter") {
      TableData("");
    }
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

  const handleSearchSelectChange = (label, value) => {
    if (label === "CentreID") {
      setPayload({ ...payload, [label]: value?.value, RateTypeID: "" });
      setRateTypes([]);
      if (value?.value == "") {
        fetchRateTypes(CentreData.map((ele) => ele.value), true);
      } else {
        fetchRateTypes([value?.value], true);
      }
    } else if (label === "DepartmentID") {
      setPayload({ ...payload, [label]: value?.value, TestName: "" });
      DepartmentWiseItemList(value?.value);
    } else if (label === "LabRemarks") {
      if (value?.value === "others") {
        setPayload({ ...payload, Remarks: "", RemarkID: "others" });
      } else {
        setPayload({
          ...payload,
          Remarks: value.value == "" ? "" : value?.label || "",
          RemarkID: value?.value == "" ? 0 : value?.value || 0,
        });
      }
    } else {
      setPayload({ ...payload, [label]: value?.value });
    }
  };

  const handleCheckbox = (e, index, testid) => {
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
          return { ...ele, [name]: checked };
        } else {
          return ele;
        }
      });

      const valTestHeader = dataTestHeader?.map((ele) => {
        if (testid === ele?.TestID) {
          return { ...ele, IsChecked: checked ? 1 : 0 };
        } else {
          return ele;
        }
      });
      setResultTestData(valTestHeader);
      setResultData(val);
    }
  };

  const handleKeyUp = (e, targetElem) => {
    if (e.key === "Enter" && targetElem) {
      targetElem.focus();
    }
  };

  const checkDualAuthentication =
    ResultTestData?.length > 0
      ? ResultTestData?.some((ele) => ele?.DualAuthentication == 1)
      : false;

  const fetchRateTypes = async (id, showLoader = false) => {
    if (showLoader) setRateTypeLoading(true);
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
      if (showLoader) setRateTypeLoading(false);
    } finally {
      if (showLoader) setRateTypeLoading(false);
    }
  };

  const BindApprovalDoctor = () => {
    axiosInstance
      .get("CommonController/BindApprovalDoctor")
      .then((res) => {
        let data = res.data.message;
        let doctorData = data.map((ele) => {
          return {
            value: ele?.employeeid,
            label: ele?.name,
          };
        });
        setDoctorAdmin(doctorData);
      })
      .catch((err) => console.log(err));
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
          setPayload((prev) => ({ ...prev, CentreID: DefaultCentre }));
          fetchRateTypes([DefaultCentre], true);
        } else {
          fetchRateTypes(allValues, true);
        }
      })
      .catch((err) => console.log(err));
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

  const getButtondata = () => {
    axiosInstance
      .get("RE/EmployeeAccessDetails")
      .then((res) => {
        setButtonsData(res.data.message);
      })
      .catch((err) => {
        toast.error(
          err?.response?.data?.message
            ? err?.response?.data?.message
            : t("Something Went Wrong"),
        );
      });
  };

  const getDepartment = () => {
    const searchPayload = {
      reportType: 22,
    };
    axiosInstance
      .post("Department/getDepartmentReportType", searchPayload)
      .then((res) => {
        let data = res.data.message;
        let DeptDataValue = data.map((ele) => {
          return {
            value: ele.DepartmentID,
            label: ele.Department,
          };
        });
        setDepartment(DeptDataValue);
      })
      .catch((err) => console.log(err));
  };

  const search = (event) => {
    DepartmentWiseItemList("", event.query);
  };

  const DepartmentWiseItemList = (id, testName = "") => {
    axiosInstance
      .post("CommonController/DepartmentWiseItemList", {
        DepartmentID: id?.toString() || "",
        testName: testName,
        reportType: 22,
      })
      .then((res) => {
        const data = res?.data?.message;
        if (!Array.isArray(res?.data?.message)) {
          setTestSuggestion([]);
          setItems([]);
          return;
        }
        const val = data?.map((ele) => {
          return {
            label: ele?.TestName,
            value: ele?.InvestigationID,
          };
        });
        setTestSuggestion(val);
        const formatted = data?.map((item) => ({
          label: item.TestName,
          value: item.InvestigationID,
          code: item.TestCode,
          dept: item.DepartmentID,
        }));
        setItems(formatted);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const handleReactSelectChange = (name, option) => {
    setCollectionBoy(option?.value);
  };

  const getFilterResultOption = () => {
    axiosInstance
      .post("Lab/getFilterTableReprintData", {
        PageName: "ResultEntryAllergy",
        pageName: "ResultEntryAllergy",
        EmployeeId: localData?.EmployeeID?.toString() || "",
        employeeId: localData?.EmployeeID?.toString() || "",
        EmployeeID: localData?.EmployeeID?.toString() || "",
      })
      .then((res) => {
        let data = res?.data?.message;
        setColumnConfig(data);
      })
      .catch((err) => setColumnConfig([]));
  };

  useEffect(() => {
    getDepartment();
    getAccessCentres();
    getButtondata();
    BindApprovalDoctor();
    getPaymentModes("Identity", setIdentity);
    getCollectionBoy(setCollectionBoyList, true);
    controllerDynamic();
    getRemarks();
    getFilterResultOption();
  }, []);

  const handleSearchChange = (event) => {
    const { name, value } = event.target;
    setPayload({ ...payload, [name]: value });
    value != -1 && TableData(value);
  };

  const dateSelect = (value, name) => {
    if (name === "FromDate") {
      const newFrom = new Date(value);

      const maxAllowedTo = new Date(newFrom);
      maxAllowedTo.setDate(maxAllowedTo.getDate() + maxRange);

      const today = new Date();
      const finalMaxTo = maxAllowedTo > today ? today : maxAllowedTo;

      let updatedToDate = payload.ToDate;

      // Case 1: ToDate < FromDate
      if (new Date(updatedToDate) < newFrom) {
        updatedToDate = finalMaxTo;
      }

      // Case 2: ToDate > allowed range
      if (new Date(updatedToDate) > finalMaxTo) {
        updatedToDate = finalMaxTo;
      }

      setPayload((prev) => ({
        ...prev,
        FromDate: value,
        ToDate: updatedToDate,
      }));

      return;
    }
    setPayload({
      ...payload,
      [name]: value,
    });
  };

  const handleTime = (time, name) => {
    setPayload({ ...payload, [name]: time });
  };

  const handleDoctorName = (e) => {
    if (entryPayload?.IsDutyRosterLocked) return;
    const { name, value, selectedIndex } = e.target;
    const label = e?.target?.children[selectedIndex].text;
    setEntryPayload({
      ...entryPayload,
      [name]: value,
      ApprovalName: label,
    });
  };

  const handleApproveReport = (Url, headerData) => {
    axiosInstance
      .post("RE/SendReport", {
        LedgerTransactionNo: headerData[0]?.LedgerTransactionNo,
        PatientName: headerData[0]?.PatientName,
        MobileNo: headerData[0]?.Mobile,
        PEmail: headerData[0]?.PEmail,
        URL: Url,
      })
      .then((res) => toast.success(res?.data?.message))
      .catch((err) => {
        console.log(
          err?.response?.data?.message
            ? err?.response?.data?.message
            : "Something Went Wrong",
        );
      });
  };

  const handleReport = (key, headerData) => {
    const data = ResultTestData.filter((ele) => ele?.IsChecked === 1);
    let TestIDHash = data.map((ele) => {
      return ele?.TestIDHash;
    });

    setPrintReportLoading(true);
    axiosReport
      .post(`commonReports/GetLabReport`, {
        ReportNumber: entryPayload?.ReportNumber,
        TestIDHash: TestIDHash,
        PrintColour: "0",
        PHead: 0,
        IsDownload: CheckDevice(),
      })
      .then((res) => {
        if (res?.data?.success) {
          // if (key == "Yes") {
          handleApproveReport(res?.data?.url, headerData);
          setPrintReportLoading(false);
          // } else {
          //   setShowReportModal({ show: true, url: res?.data?.url });
          //   setPrintReportLoading(false);
          // }
        } else {
          setPrintReportLoading(false);
          key == "no" && toast.error(res?.data?.message);
        }
      })
      .catch((err) => {
        setPrintReportLoading(false);
      });
  };

  const handleSelectChange = (event) => {
    const { name, value, checked, type } = event?.target;

    setPayload((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSave = (data, modal) => {
    if (modal === "Edit") {
      if (Number(data?.MinValue) >= Number(data?.MaxValue)) {
        toast.error(t("Please Enter Correct Min and Max Value"));
      } else {
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
      }
    }
    if (modal === "AddComment") {
      if (data?.pageName === "Single") {
        let val = ResultData.map((ele) => {
          if (ele.labObservationID == data?.labObservationID) {
            return { ...ele, COMMENT: data?.COMMENT, SaveRangeStatus: 1 };
          } else {
            return ele;
          }
        });
        setResultData(val);
        setShow3({ modal: false, data: {} });
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
        setShow3({ modal: false, data: {} });
        setShow2({ moadal: false, data: {} });
      }
    }

    if (modal === "TemplateMaster") {
      let val = ResultData.map((ele) => {
        if (ele.labObservationID == data?.labObservationID) {
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
      setShow3({ modal: false, data: {} });
      setShow2({ moadal: false, data: {} });
    }
  };

  const fetchApi = (field, payload, headerData) => {
    const singleArrayOfObjects = entry?.reduce(
      (acc, arr) => acc.concat(arr),
      [],
    );

    const failedGroups = [];
    mandatoryIDs?.forEach((id) => {
      const hasReading = singleArrayOfObjects
        .filter((i) => Number(i.obid) === id)
        .some((i) => String(i.AntibioticInterpreatation || "").trim() !== "");
      if (!hasReading) {
        failedGroups.push(id);
      }
    });

    if (failedGroups.length > 0) {
      toast.error(
        "Please fill at least one Display Reading for all mandatory groups.",
      );
      return;
    }

    setLoading(true);
    const organismData = singleArrayOfObjects?.map((ele) => {
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

    if (field == "Approved") {
      const details = {
        Data: savePayload,
        ResultStatus: field,
        IsCritical: 0,
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
          NotApprovalComment: headerData?.[0]?.NotApproveRemark ?? "",
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

  const handleResultSubmit = (field, headData) => {
    const errorToast = `This Test is ${DyanmicStatusResponseCulture(ResultTestData)}`;
    if (field === "Approved") {
      const data = ResultData?.filter(
        (ele) =>
          (ele?.Status === 3 ||
            ele?.Status === 10 ||
            ele?.Status == 5 ||
            ele?.Status == 6 ||
            ele?.Status == 20) &&
          ele?.IsChecked === 1,
      );
      const val = ResultTestData?.filter(
        (ele) =>
          (ele?.Status === 3 ||
            ele?.Status === 10 ||
            ele?.Status == 5 ||
            ele?.Status == 6 ||
            ele?.Status == 20) &&
          ele?.IsChecked === 1,
      );
      validateData(field, data, errorToast, val);
    } else if (field === "Save") {
      const data = ResultData.filter(
        (ele) =>
          (ele?.Status === 3 ||
            ele?.Status === 10 ||
            ele?.Status == 20 ||
            ele?.Status == 5 ||
            ele?.Status == 6) &&
          ele?.IsChecked === 1,
      );
      const val = ResultTestData.filter(
        (ele) =>
          (ele?.Status === 3 ||
            ele?.Status === 10 ||
            ele?.Status == 20 ||
            ele?.Status == 5 ||
            ele?.Status == 6) &&
          ele?.IsChecked === 1,
      );
      validateData(field, data, errorToast, val);
    } else if (field === "Dual Authentication") {
      const data = ResultData.filter(
        (ele) =>
          (ele?.Status === 3 ||
            ele?.Status === 10 ||
            ele?.Status == 20 ||
            ele?.Status == 5 ||
            ele?.Status == 6) &&
          ele?.IsChecked === 1,
      );
      const val = ResultTestData.filter(
        (ele) =>
          (ele?.Status === 3 ||
            ele?.Status === 10 ||
            ele?.Status == 20 ||
            ele?.Status == 5 ||
            ele?.Status == 6) &&
          ele?.IsChecked === 1,
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
        (ele) => ele.Status !== 5 && ele.IsChecked === 1,
      );
      const val = ResultTestData.filter(
        (ele) => ele.Status !== 5 && ele.IsChecked === 1,
      );
      validateData(field, payload, errorToast, val);
    } else if (field === "Unhold") {
      const data = ResultData.filter((ele) => ele.TestID === headData.TestID);
      const val = ResultTestData.filter(
        (ele) => ele?.TestID === headData.TestID,
      );
      validateData(field, data, t("This Test is not Hold"), val);
    } else {
      const payload = ResultData.filter((ele) => ele.IsChecked === 1);
      validateData(field, payload);
    }
  };

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
        if (checkDual(headerData)) {
          toast.error(checkDual(headerData));
        } else if (
          !entryPayload?.ApprovedBy &&
          !parseMappedSignature(payload?.[0]?.DefaultSignatureID).id
        ) {
          toast.error("Kindly Select Doctor");
        } else {
          fetchApi(field, payload, headerData);
        }
      }
    } else {
      toast.error(message);
    }
  };

  const checkDual = (headerData) => {
    for (let i = 0; i < headerData?.length; i++) {
      if (
        headerData[i]["DualAuthentication"] == 1 &&
        headerData[i]["DualAuthenticatedcount"] != 2
      ) {
        return `Can't Be Approved. For ${headerData[i]?.PackageName} Dual Authentication Is Required`;
      }
    }
    return false;
  };

  const setArrangeMentOfData = (data, subData) => {
    let mainData = [];
    subData.map((ele, _) => {
      data.map((eleInner, _) => {
        if (ele?.TestID === eleInner?.TestID) {
          mainData = [...mainData, eleInner];
        }
      });
    });
    setResultData(mainData);
  };

  const handleNotApproveRemark = (e, data) => {
    const { name, value } = e.target;
    const TestHeader = [...ResultTestData];
    const index = ResultTestData.indexOf(data);
    TestHeader[index][name] = value;
    setResultTestData(TestHeader);
  };

  const getOrganimseName = (data, val, ReportNumber) => {
    setEntryShow(true);
    let id = data.split(",").map(Number);
    let filteredId = bindAllergyType.filter((item) => id.includes(item.value));
    filteredId.forEach((entry) => {
      getEntryData(
        entry.value,
        entry.label,
        val?.TestID,
        val?.BarcodeNo,
        ReportNumber,
        false,
      );
    });
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
        setInvestigationID(
          res?.data?.message?.message[0]?.InvestigationID || 0,
        );
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
            LedgertransactionIDHash: payload?.LedgertransactionIDHash,
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
            : "Error Occured",
        );
        setEntryShow(false);
        setEntry([]);
      });
  };

  const printHeader = (isPrint, guid) => {
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

  const removeArrayAtIndex = (index) => {
    const newData = [...entry];
    newData.splice(index, 1);
    setEntry(newData);
  };

  function setValuesForOuterIndex(outerIndex, name, value) {
    const newEntry = [...entry];
    newEntry[outerIndex] = newEntry[outerIndex].map((item) => {
      return { ...item, [name]: value };
    });
    setEntry(newEntry);
  }

  const getEntryData = (id, name, Testid, BarcodeNo, ReportNumber, key) => {
    if (id) {
      const isPresent = entry?.some((innerArray) =>
        innerArray?.some((obj) => obj?.obid == id),
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
            toast.error(err?.response?.data?.message ?? "Something Went Wrong"),
          );
      } else {
        toast.error("Entry already added");
      }
    }
  };

  const handleFilterOrg = (outerIndex, innerIndex) => {
    const updatedEntry = [...entry];
    updatedEntry[outerIndex] = [...updatedEntry[outerIndex]];
    updatedEntry[outerIndex].splice(innerIndex, 1);
    setEntry(updatedEntry);
  };

  const statusCount = (key) => {
    if (key == "") {
      return originalTableData?.length;
    }
    return originalTableData?.filter((item) => item?.Status == key)?.length;
  };

  const filterStatusWise = (sampStatus) => {
    setPayload({ ...payload, ["SampleStatus"]: sampStatus });
    TableData(sampStatus);
  };

  const handleSensitivity = (value, outerIndex, innerIndex, name) => {
    const newEntry = [...entry];
    newEntry[outerIndex][innerIndex][name] = value;
    setEntry(newEntry);
  };

  const handleProEmployeeChange = (name, e) => {
    setState((prev) => ({ ...prev, [name]: e?.value }));
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

  useEffect(() => {
    getProEmployee();
  }, []);

  useEffect(() => {
    if (bindAllergyType?.length > 0) {
      const mandatoryItems = bindAllergyType.filter(
        (item) => item?.mandatory === 1,
      );
      const ids = mandatoryItems.map((item) => item.value);
      setMandatoryIDs(ids);
      mandatoryItems.forEach((item) => {
        getEntryData(item.value, item.label, "", "", "", true);
      });
      setEntryShow(true);
    }
  }, [bindAllergyType]);

  useEffect(() => {
    if (investigationId) {
      getAllergyData();
    } else {
      return;
    }
  }, [investigationId]);

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
      const { controllersData, controllerTabbingOrder } =
        await getSearchController(PAGE_ID);

      setTabbingOrder(controllerTabbingOrder);
      setControllerDynamicList(controllersData);

      if (Array.isArray(controllersData)) {
        setFilterData(controllersData);
      }
    } catch (error) {
      console.error("error in controllerDynamic:", error);
    }
  };

  const handleChangeSearch = (e) => {
    const value = e.target.value.toLowerCase();
    setSearchTerm(value);

    if (!value.trim()) {
      const withIndex = originalTableData.map((ele, index) => ({
        ...ele,
        index: index,
        currentIndex: index,
      }));
      SetReData(withIndex);
      return;
    }

    const searchableKeys = [
      "PatientName",
      "PName",
      "VisitNo",
      "LedgerTransactionNo",
      "Mobile",
      "PatientCode",
      "BarcodeNo",
      "Test",
      "Doctor",
      "Centre",
    ];

    const filtered = originalTableData?.filter((row) =>
      searchableKeys.some((key) =>
        String(row[key] || "")
          .toLowerCase()
          .includes(value),
      ),
    );

    const withIndex = filtered.map((ele, index) => ({
      ...ele,
      index: index,
      currentIndex: originalTableData.findIndex(
        (orig) =>
          orig.LedgertransactionId === ele.LedgertransactionId &&
          orig.TestID === ele.TestID,
      ),
    }));

    SetReData(withIndex);
  };

  const handleExportExcel = () => {
    const ICON_COLS = new Set([
      "S.No", "Print", "View Doc.", "Customize Date", "Detail", "Remarks",
    ]);
    const tableCols = filterData.filter(
      (col) => col.TypeId == 2 && col.IsShow == 1 && !ICON_COLS.has(col.ControlDisplayID),
    );
    const getCellValue = (col, item) => {
      const colId = col?.ControlDisplayID;
      switch (colId) {
        case "Reg. Date":
          return item?.DATE ?? "";
        case "Visit No.":
          return item?.LedgerTransactionNo ?? "";
        case "Barcode No":
          return item?.BarcodeNo ?? "";
        case "UHID":
          return item?.PatientCode ?? "";
        case "Patient Name":
          return item?.PName ?? "";
        case "Age/Gender":
          return item?.Age_Gender ?? "";
        case "Test":
          return item?.Test ?? "";
        case "Status":
          return item?.SampleStatus ?? "";
        case "Doctor":
          return item?.Doctor ?? "";
        case "Centre":
          return item?.Centre ?? "";
        case "TAT Status":
          if (item?.TATDelay == 1) return "Outside TAT";
          if (item?.TATIntimate == 1) return "Near TAT";
          return "Within TAT";
        case "LastRemark": {
          const remarks = parseRemarks(item?.RemarksList);
          if (!Array.isArray(remarks) || remarks.length === 0) return "";
          const sorted = [...remarks].sort(
            (a, b) =>
              moment(b.RemarkDate, "DD-MMM-YYYY hh:mm A") -
              moment(a.RemarkDate, "DD-MMM-YYYY hh:mm A"),
          );
          return sorted[0]?.LabRemarks ?? "";
        }
        default: {
          const field = item?.[col?.ApiFieldName] ?? item?.[colId];
          if (Array.isArray(field)) return field.join(", ");
          if (typeof field === "object" && field !== null) return JSON.stringify(field);
          return field ?? "";
        }
      }
    };
    const excelData = reData.map((item, index) => {
      const row = { "S.No": index + 1 };
      tableCols.forEach((col) => {
        row[col.ControlDisplayName || col.ControlDisplayID] = getCellValue(
          col,
          item,
        );
      });
      return row;
    });
    ExportToExcel(excelData, "ResultEntryAllergy.xlsx");
  };

  console.log("controllerDynamicList", controllerDynamicList);
  console.log("ResultData", ResultData,ResultTestData);

  return (
    <>
      {ResultData?.length === 0 ? (
        <>
          {showUD?.modal && (
            <UploadFile
              show={showUD?.modal}
              handleClose={() => {
                setShowUD({ modal: false, data: "", index: -1 });
              }}
              options={Identity}
              documentId={showUD?.data}
              pageName="Patient Registration"
              handleUploadCount={handleUploadCount}
              formData={payload}
              LedgerTransactionIDHash={showUD?.LedgertransactionIDHash}
            />
          )}
          <Accordion
            name={t("Result Entry Allergy")}
            defaultValue={true}
            linkTo="/resultallergy"
            isBreadcrumb={true}
            seconTitle={
              <>
                <div className="link-title-container" id="pr_id_11">
                  <div className="link-title-item"></div>
                  <div className="link-title-item"></div>
                </div>
                <div style={{ marginLeft: "auto" }}>
                  <PageControlGear pageId={PAGE_ID} />
                </div>
              </>
            }
          >
            <div className="row px-2 mt-2 mb-1">
              {controllerDynamicList
                ?.sort((a, b) => a.DisplayOrder - b.DisplayOrder)
                .map((item, index) => {
                  if (
                    item?.ControlDisplayID === "LabRemarks" &&
                    isHideController("LabRemarks")
                  ) {
                    return (
                      <>
                        <div className="col-sm-2" key={index}>
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
                            value={payload?.RemarkID}
                            onChange={handleSearchSelectChange}
                          />
                        </div>
                        {payload?.RemarkID === "others" && (
                          <div className="col-sm-2">
                            <Input
                              name="Remarks"
                              label={t("Enter Remark")}
                              value={payload?.Remarks}
                              onChange={handleSelectChange}
                            />
                          </div>
                        )}
                      </>
                    );
                  }
                  if (
                    item?.ControlDisplayID === "SelectTypes" &&
                    isHideController("SelectTypes")
                  ) {
                    return (
                      <div className="col-sm-2" key={index}>
                        <div className="d-flex">
                          <div style={{ width: "60%" }}>
                            <SelectBox
                              options={SearchByCulture}
                              id="SelectTypes"
                              lable="SelectTypes"
                              name="SelectTypes"
                              selectedValue={payload?.SelectTypes}
                              onChange={handleChange}
                            />
                          </div>
                          <div>
                            <div style={{ width: "100%" }}>
                              <Input
                                type="text"
                                name="ItemValue"
                                onKeyDown={handleKeyDown}
                                value={payload?.ItemValue}
                                onChange={handleChange}
                              />
                            </div>
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
                      <div className="col-sm-2" key={index}>
                        <div>
                          <ReactSelect
                            dynamicOptions={[
                              { label: "All Centre", value: "" },
                              ...CentreData,
                            ]}
                            name="CentreID"
                            lable={t("Centre")}
                            id="Centre"
                            removeIsClearable={true}
                            placeholderName={t("Centre")}
                            value={payload?.CentreID}
                            onChange={handleSearchSelectChange}
                          />
                        </div>
                      </div>
                    );
                  }
                  if (
                    item?.ControlDisplayID === "testCentreID" &&
                    isHideController("testCentreID")
                  ) {
                    return (
                      <div className="col-sm-2" key={index}>
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
                          value={payload?.testCentreID}
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
                      <div className="col-sm-2" key={index}>
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
                          value={payload?.RateTypeID}
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
                      <div className="col-sm-2" key={index}>
                        <div>
                          <ReactSelect
                            dynamicOptions={[
                              { label: "Select Department", value: "" },
                              ...department,
                            ]}
                            lable={t("Department")}
                            id="Department"
                            removeIsClearable={true}
                            value={payload?.DepartmentID}
                            placeholderName={t("Department")}
                            name="DepartmentID"
                            onChange={handleSearchSelectChange}
                          />
                        </div>
                      </div>
                    );
                  }
                  if (
                    item?.ControlDisplayID === "TestName" &&
                    isHideController("TestName")
                  ) {
                    return (
                      <div className="col-sm-2" key={index}>
                        <FloatLabel>
                          <div style={{ position: "relative", width: "100%" }}>
                            <AutoComplete
                              id="testName"
                              value={value}
                              suggestions={items}
                              completeMethod={search}
                              field="label"
                              onChange={(e) => {
                                setValue(e.value);
                                setPayload((prev) => ({
                                  ...prev,
                                  TestName: e.value ?? "",
                                }));
                              }}
                              placeholder="Search Test..."
                              className="w-100"
                              inputClassName="w-100 pr-4"
                            />
                            {value && (
                              <span
                                onClick={() => {
                                  setValue("");
                                  setPayload((prev) => ({
                                    ...prev,
                                    TestName: "",
                                  }));
                                  const el =
                                    document.getElementById("testName");
                                  if (el) el.classList.remove("p-filled");
                                }}
                                className="pi pi-times"
                                style={{
                                  position: "absolute",
                                  right: "10px",
                                  top: "50%",
                                  transform: "translateY(-50%)",
                                  cursor: "pointer",
                                  color: "#777",
                                  fontSize: "1rem",
                                  zIndex: 10,
                                  background: "white",
                                  padding: "2px",
                                }}
                              ></span>
                            )}
                          </div>
                          <label htmlFor="testName">Test Name</label>
                        </FloatLabel>
                      </div>
                    );
                  }
                  if (
                    item?.ControlDisplayID === "SampleStatus" &&
                    isHideController("SampleStatus")
                  ) {
                    return (
                      <div className="col-sm-2" key={index}>
                        <SelectBox
                          options={SampleStatus}
                          onChange={handleSearchChange}
                          id="SampleStatus"
                          name="SampleStatus"
                          lable="SampleStatus"
                          selectedValue={payload?.SampleStatus}
                        />
                      </div>
                    );
                  }

                  if (
                    item?.ControlDisplayID === "IsTat" &&
                    isHideController("IsTat")
                  ) {
                    return (
                      <div className="col-sm-2" key={index}>
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
                              style: { backgroundColor: "red", color: "white" },
                            },
                          ]}
                          selectedValue={payload?.IsTat}
                          label="IsTat"
                          id="IsTat"
                          name="IsTat"
                          onChange={handleSelectChange}
                        />
                      </div>
                    );
                  }

                  if (
                    item?.ControlDisplayID === "collectionBoy" &&
                    isHideController("collectionBoy")
                  ) {
                    return (
                      <div className="col-sm-2" key={index}>
                        <ReactSelect
                          name="collectionBoy"
                          dynamicOptions={[
                            { label: t("Select Collection Boy"), value: "" },
                            ...collectionBoyList,
                          ]}
                          placeholderName={t("Collection Boy")}
                          value={collectionBoy}
                          onChange={handleReactSelectChange}
                        />
                      </div>
                    );
                  }
                  if (
                    item?.ControlDisplayID === "ProEmployee" &&
                    isHideController("ProEmployee")
                  ) {
                    return (
                      <div className="col-sm-2 col-6" key={index}>
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
                    );
                  }
                  if (
                    item?.ControlDisplayID === "FromDate" &&
                    isHideController("FromDate")
                  ) {
                    return (
                      <div className="col-sm-2" key={index}>
                        <DatePicker
                          name="FromDate"
                          id="FromDate"
                          className="custom-calendar"
                          lable="FromDate"
                          value={payload?.FromDate}
                          onChange={dateSelect}
                          // maxDate={new Date(payload?.ToDate)}
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
                      <div className="col-sm-1" key={index}>
                        <CustomTimePicker
                          name="FromTime"
                          placeholder="FromTime"
                          value={payload?.FromTime}
                          id="FromTime"
                          lable="FromTime"
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
                      <div className="col-sm-2" key={index}>
                        <div>
                          <DatePicker
                            className="custom-calendar"
                            name="ToDate"
                            value={payload?.ToDate}
                            onChange={dateSelect}
                            placeholder=" "
                            id="ToDate"
                            lable="ToDate"
                            minDate={new Date(payload?.FromDate)}
                            maxDate={getMaxToDate(payload?.FromDate, maxRange)}
                          />
                        </div>
                      </div>
                    );
                  }
                  if (
                    item?.ControlDisplayID === "ToTime" &&
                    isHideController("ToTime")
                  ) {
                    return (
                      <div className="col-sm-1" key={index}>
                        <CustomTimePicker
                          name="ToTime"
                          placeholder="ToTime"
                          value={payload?.ToTime}
                          id="ToTime"
                          lable="ToTime"
                          onChange={handleTime}
                        />
                      </div>
                    );
                  }
                  return null;
                })}
              <div className="col-auto">
                <SearchButton
                  text={"Search"}
                  href="javascript:void(0)"
                  onClick={() => TableData(payload?.SampleStatus)}
                />
              </div>
              {reData?.length > 0 && (
                <div className="col-sm-auto">
                  <CustomButton
                    text={t("Excel")}
                    icon={"excel"}
                    onClick={handleExportExcel}
                  />
                </div>
              )}
            </div>
          </Accordion>

          <div className="mt-2 mb-3 px-2 py-1 bg-white d-flex sampleStatusClass">
            <strong style={{ minWidth: "100px" }}>Sample Status : </strong>
            {SampleStatus?.map((sItem, idx) => (
              <TableFilterDot
                key={idx}
                color={`${getStatusColor(sItem?.value)}`}
                title={`${sItem?.label} (${statusCount(sItem?.value)})`}
                onClick={() => filterStatusWise(sItem?.value)}
                bgColor={`#e9e2e1`}
              />
            ))}
          </div>

          <Accordion
            title={
              <div className="d-flex">
                <span className="mt-1">
                  {t("Search Data")}
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
              </div>
            }
            defaultValue={true}
            seconTitle={
              <div className="ml-auto d-flex align-items-center mt-1">
                <div className="d-flex align-items-center mr-2" style={{ gap: "4px" }}>
                  <i
                    className="fa bi-file-earmark-pdf text-primary"
                    style={{ fontSize: "14px" }}
                  />
                  <span>View Attachments</span>
                </div>

                <div className="d-flex align-items-center mr-2" style={{ gap: "4px" }}>
                  <img src={Urgent} className="sizeicon" />
                  <span>Urgent</span>
                </div>

                <div className="d-flex align-items-center mr-2" style={{ gap: "4px" }}>
                  <i
                    className="bi bi-shield-fill-check vip-font-size mb-0"
                    style={{ color: "#FFC107" }}
                  />
                  <span>VIP Patient</span>
                </div>
                <Input
                  type="text"
                  name="search"
                  id="search"
                  placeholder="Search Result Allergy Entry Details..."
                  value={searchTerm}
                  onChange={handleChangeSearch}
                />
              </div>
            }
          >
            {loading ? (
              <Loading />
            ) : (
              <REAllergyTable
                redata={reData}
                GetResultEntryCulture={GetResultEntryCulture}
                setShowUD={setShowUD}
                TableData={TableData}
                SampleStatus={payload.SampleStatus}
                getAllergyData={getAllergyData}
                setEntryShow={setEntryShow}
                filterData={filterData}
                onPreview={(url) => setShowReportModal({ show: true, url })}
                showColumnModal={showColumnModal}
                setShowColumnModal={setShowColumnModal}
                columnConfig={columnConfig}
                getFilterResultOption={getFilterResultOption}
              />
            )}
          </Accordion>
        </>
      ) : (
        <>
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
              formData={payload}
              isPrintHeader={show5?.Printwithhead}
              blockUpload={show5.blockUpload}
              LedgerTransactionIDHash={
                ResultTestData[0]?.LedgertransactionIDHash
              }
              ResultTestData={ResultTestData?.[0]}
            />
          )}
          {show2.moadal && (
            <TemplateMasterModal
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
          {show.moadal && (
            <ResultEntryEditModal
              show={show}
              handleClose={() => {
                setShow({ moadal: false, data: {} });
              }}
              handleSave={handleSave}
            />
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
          <>
            <>
              <Accordion
                name={t("Patient Allergy Entry")}
                defaultValue={true}
                isBreadcrumb={true}
              >
                <div
                  className={`p-dialog-header custom-box-body mb-1 mt-1`}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignContent: "flex-start",
                    justifyContent: "flex-start",
                  }}
                >
                  <div className="custom-row wrap-fix">
                    <div className="custom-col custom-col-visit">
                      <span className="fa fa-folder custom-text">&nbsp;</span>
                      <span>{ResultData[0]?.LedgerTransactionNo}</span>
                    </div>
                    <div className="custom-col custom-col-visit">
                      <span className="fa fa-user-md custom-text">&nbsp;</span>
                      <span>{ResultData[0]?.PName}</span>
                    </div>
                    <div className="custom-col custom-col-visit">
                      <span className="fa fa-book custom-text">&nbsp;</span>
                      <span>{ResultData[0]?.PatientCode}</span>
                    </div>
                    <div className="custom-col custom-col-visit">
                      <span className="fa fa-calendar custom-text">&nbsp;</span>
                      <span> {ResultData[0]?.Age}</span>
                    </div>
                    <div className="custom-col custom-col-visit">
                      <span className="fa fa-book custom-text">&nbsp;</span>
                      <span> {ResultData[0]?.Gender}</span>
                    </div>
                    <div className="custom-col custom-col-visit">
                      <span className="fa fa-h-square custom-text">&nbsp;</span>
                      <span>{ResultData[0]?.Centre}</span>
                    </div>
                    <div className="custom-col custom-col-visit">
                      <span className="fa fa-user-md custom-text">&nbsp;</span>
                      <span>{ResultData[0]?.ReferDoctor}</span>
                    </div>
                    <div className="custom-col custom-col-visit">
                      <span className="fa fa-calendar custom-text">&nbsp;</span>
                      <span>{dateConfig(ResultData[0]?.RegDate)}</span>
                    </div>
                    <div className="custom-col custom-col-visit">
                      <span className="fa fa-plus-square custom-text">
                        &nbsp;
                      </span>
                      <span>{ResultData[0]?.RateType}</span>
                    </div>
                    {ResultData?.some((item) => item.isUrgent == 1) && (
                      <div
                        className="d-flex align-items-center"
                        style={{ gap: "4px" }}
                      >
                        <img src={Urgent} className="sizeicon" />
                        <span>Urgent</span>
                      </div>
                    )}
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
                              onClick={() =>
                                handleOpenPreview(docItem?.awsKeys)
                              }
                              title="View Attachments"
                            />
                            <span>View Attachments</span>
                          </div>
                        )
                      );
                    })()}
                  </div>
                  <div className="custom-row">
                    <div
                      className="d-flex my"
                      style={{ margin: 0, padding: 0 }}
                    >
                      {ResultTestData?.map((data, index) => (
                        <div
                          key={index}
                          className={`round font-weight-bold mx-2 my-2 px-3 py-2 Status-${data.Status}`}
                        >
                          <span> {data?.PackageName}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="row mb-2">
                  <div className="col-md-5 col-12 mt-4">
                    <div className="p-2">
                      <ResultEntryTableCustom>
                        <thead className="cf">
                          <tr>
                            <th>{t("Test Name")}</th>
                            <th>{t("Value")}</th>
                            <th style={{ width: "60px" }}>{t("Unit")}</th>
                            <th style={{ width: "100px" }}>
                              {t("Reference Range")}{" "}
                            </th>
                            <th>{t("Comment")}</th>
                            <th>{t("Method Name")}</th>
                          </tr>
                        </thead>
                        <tbody>
                          {ResultTestData?.map((Hdata, Hindex) =>{
                            
                          return (
                            <>
                              <tr
                                key={Hindex}
                                style={{ backgroundColor: "lightgrey" }}
                              >
                                <td data-title={t("Test Name")} colSpan={2}>
                                  <span
                                    className="invName"
                                    style={{
                                      wordWrap: "break-word",
                                      whiteSpace: "normal",
                                      fontWeight: "bold",
                                    }}
                                  >
                                    {Hdata?.PackageName}
                                  </span>
                                </td>
                                <td colSpan={2}>
                                  <span className="invName">
                                    <span className="fa fa-barcode">
                                      &nbsp;
                                    </span>
                                    <b>{Hdata?.SINNO}</b>
                                  </span>
                                </td>
                                {/* {Hdata?.Status === 5 || Hdata?.Status === 6 ? (
                                  buttonsData?.map(
                                    (ele, index) =>
                                      (ele?.AccessBy === "Not Approved") && (
                                        <>
                                          <td colSpan={2} key={index}>
                                            <div className=" d-flex">
                                              <div>
                                                <Input
                                                  className="required form-control input-sm mr-3"
                                                  placeholder={
                                                    "Not Approved Remark"
                                                  }
                                                  value={
                                                    Hdata?.NotApproveRemark ??
                                                    ""
                                                  }
                                                  name="NotApproveRemark"
                                                  id="NotApproveRemark"
                                                  onChange={(e) =>
                                                    handleNotApproveRemark(
                                                      e,
                                                      Hdata,
                                                    )
                                                  }
                                                />{" "}
                                              </div>
                                              <div
                                                onClick={() => {
                                                  if (Hdata?.NotApproveRemark) {
                                                    handleResultSubmit(
                                                      ele?.AccessBy,
                                                      Hdata,
                                                    );
                                                  } else {
                                                    toast.error(
                                                      "Not Approve Remark is Required",
                                                    );
                                                  }
                                                }}
                                              >
                                                {" "}
                                                <Tooltip label={"UnApprove"}>
                                                  <i
                                                    className="bi bi-x-octagon text-icon-size m-0 ml-2"
                                                    style={{ color: "#b06605" }}
                                                    key={index}
                                                  ></i>
                                                </Tooltip>
                                              </div>
                                            </div>
                                          </td>
                                        </>
                                      ),
                                  )
                                ) : (
                                  <td colSpan={2}>&nbsp;</td>
                                )} */} 
                                {/* {Hdata?.Status === 5 || Hdata?.Status === 6 ? (
                                  buttonsData?.map((ele, index) => {
                                    const status = Hdata?.Status;
                                    const access = ele?.AccessBy;

                                    const showUnapprove =
                                      (status === 5 && access === "Not Approved") ||
                                      (status === 6 &&
                                        (access === "Not Approved" ||
                                          access === "Not Approved - After Print"));

                                    return (
                                      showUnapprove && (
                                        <td colSpan={2} key={index}>
                                          <div className="d-flex">
                                            <div>
                                              <Input
                                                className="required form-control input-sm mr-3"
                                                placeholder={"Not Approved Remark"}
                                                value={Hdata?.NotApproveRemark ?? ""}
                                                name="NotApproveRemark"
                                                id="NotApproveRemark"
                                                onChange={(e) =>
                                                  handleNotApproveRemark(e, Hdata)
                                                }
                                              />
                                            </div>

                                            <div
                                              onClick={() => {
                                                if (Hdata?.NotApproveRemark) {
                                                  handleResultSubmit("Not Approved", Hdata);
                                                } else {
                                                  toast.error("Not Approve Remark is Required");
                                                }
                                              }}
                                            >
                                              <Tooltip label={"UnApprove"}>
                                                <i
                                                  className="bi bi-x-octagon text-icon-size m-0 ml-2"
                                                  style={{ color: "#b06605" }}
                                                ></i>
                                              </Tooltip>
                                            </div>
                                          </div>
                                        </td>
                                      )
                                    );
                                  })
                                ) : (
                                  <td colSpan={2}>&nbsp;</td>
                                )} */}
                                {Hdata?.Status === 5 || Hdata?.Status === 6 ? (
                                  (() => {
                                    const status = Hdata?.Status;

                                    const showUnapprove =
                                      (status === 5 &&
                                        buttonsData?.some(
                                          ({ AccessBy }) => AccessBy === "Not Approved"
                                        )) ||
                                      (status === 6 &&
                                        buttonsData?.some(
                                          ({ AccessBy }) =>
                                            AccessBy === "Not Approved" ||
                                            AccessBy === "Not Approved - After Print"
                                        ));

                                    return showUnapprove ? (
                                      <td colSpan={2}>
                                        <div className="d-flex">
                                          <div>
                                            <Input
                                              className="required form-control input-sm mr-3"
                                              placeholder={"Not Approved Remark"}
                                              value={Hdata?.NotApproveRemark ?? ""}
                                              name="NotApproveRemark"
                                              id="NotApproveRemark"
                                              onChange={(e) =>
                                                handleNotApproveRemark(e, Hdata)
                                              }
                                            />
                                          </div>

                                          <div
                                            onClick={() => {
                                              if (Hdata?.NotApproveRemark) {
                                                handleResultSubmit("Not Approved", Hdata);
                                              } else {
                                                toast.error("Not Approve Remark is Required");
                                              }
                                            }}
                                          >
                                            <Tooltip label={"UnApprove"}>
                                              <i
                                                className="bi bi-x-octagon text-icon-size m-0 ml-2"
                                                style={{ color: "#b06605" }}
                                              ></i>
                                            </Tooltip>
                                          </div>
                                        </div>
                                      </td>
                                    ) : (
                                      <td colSpan={2}>&nbsp;</td>
                                    );
                                  })()
                                ) : (
                                  <td colSpan={2}>&nbsp;</td>
                                )}
                              </tr>
                              {ResultData?.map((datanew, index) => (
                                <>
                                  {Hdata.TestID === datanew.TestID && (
                                    <tr key={index}>
                                      <td
                                        data-title={t("Test Name")}
                                        style={{
                                          wordWrap: "break-word",
                                          whiteSpace: "normal",
                                        }}
                                      >
                                        <span
                                          style={{ cursor: "pointer" }}
                                          data-toggle="tooltip"
                                          data-placement="top"
                                        >
                                          {datanew?.TestName}
                                        </span>
                                        &nbsp;
                                      </td>
                                      {datanew?.Header === 0 &&
                                        datanew?.TestName?.toLowerCase() !==
                                        "drugs" &&
                                        datanew?.TestName != "Comments" ? (
                                        <>
                                          {["2", "3"].includes(
                                            datanew?.ReportType,
                                          ) ? (
                                            <>
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
                                                <i
                                                  className="fa fa-plus-circle"
                                                  aria-hidden="true"
                                                  style={{ color: "#605ca8" }}
                                                ></i>
                                              </td>
                                            </>
                                          ) : datanew?.dlcCheck === 1 ? (
                                            datanew?.IsHelpMenu === 0 ? (
                                              <>
                                                <td data-title={t("Value")}>
                                                  <input
                                                    type="text"
                                                    className={`form-control input-sm resultInput ${getRangeClass(
                                                      datanew?.Value,
                                                      parseFloat(
                                                        datanew?.MinValue,
                                                      ),
                                                      parseFloat(
                                                        datanew?.MaxValue,
                                                      ),
                                                    )}`}
                                                    name="Value"
                                                    autoComplete="off"
                                                    value={datanew?.Value}
                                                    onChange={(e) =>
                                                      handleCheckbox(
                                                        e,
                                                        index,
                                                        datanew?.TestID,
                                                      )
                                                    }
                                                    onKeyUp={(e) =>
                                                      handleKeyUp(
                                                        e,
                                                        myRefs.current[
                                                        index ===
                                                          ResultData.length - 1
                                                          ? 0
                                                          : index + 1
                                                        ],
                                                        index,
                                                      )
                                                    }
                                                    ref={(el) =>
                                                    (myRefs.current[index] =
                                                      el)
                                                    }
                                                  />
                                                </td>
                                              </>
                                            ) : (
                                              <>
                                                <td data-title={t("Value")}>
                                                  <input
                                                    type="text"
                                                    className={`form-control input-sm resultInput ${(datanew?.MaxValue !=
                                                      "0" ||
                                                      datanew?.MinValue !=
                                                      "0") &&
                                                      parseFloat(
                                                        datanew?.Value,
                                                      ) >
                                                      parseFloat(
                                                        datanew?.MaxValue,
                                                      )
                                                      ? "high"
                                                      : parseFloat(
                                                        datanew?.Value,
                                                      ) <
                                                        parseFloat(
                                                          datanew?.MinValue,
                                                        )
                                                        ? "low"
                                                        : ""
                                                      } `}
                                                    name="Value"
                                                    value={datanew?.Value}
                                                    onChange={(e) =>
                                                      handleCheckbox(
                                                        e,
                                                        index,
                                                        datanew?.TestID,
                                                      )
                                                    }
                                                    onKeyUp={(e) =>
                                                      handleKeyUp(
                                                        e,
                                                        myRefs.current[
                                                        index ===
                                                          ResultData.length - 1
                                                          ? 0
                                                          : index + 1
                                                        ],
                                                        index,
                                                      )
                                                    }
                                                    autoComplete="off"
                                                    ref={(el) =>
                                                    (myRefs.current[index] =
                                                      el)
                                                    }
                                                  />
                                                </td>
                                              </>
                                            )
                                          ) : datanew?.IsHelpMenu === 0 ? (
                                            <>
                                              <td data-title={t("Value")}>
                                                <input
                                                  type="text"
                                                  className={`form-control input-sm resultInput ${(datanew?.MaxValue != "0" ||
                                                    datanew?.MinValue !=
                                                    "0") &&
                                                    parseFloat(datanew?.Value) >
                                                    parseFloat(
                                                      datanew?.MaxValue,
                                                    )
                                                    ? "high"
                                                    : parseFloat(
                                                      datanew?.Value,
                                                    ) <
                                                      parseFloat(
                                                        datanew?.MinValue,
                                                      )
                                                      ? "low"
                                                      : ""
                                                    } `}
                                                  name="Value"
                                                  value={datanew?.Value}
                                                  onChange={(e) =>
                                                    handleCheckbox(
                                                      e,
                                                      index,
                                                      datanew?.TestID,
                                                    )
                                                  }
                                                  onKeyUp={(e) =>
                                                    handleKeyUp(
                                                      e,
                                                      myRefs.current[
                                                      index ===
                                                        ResultData.length - 1
                                                        ? 0
                                                        : index + 1
                                                      ],
                                                      index,
                                                    )
                                                  }
                                                  autoComplete="off"
                                                  ref={(el) =>
                                                    (myRefs.current[index] = el)
                                                  }
                                                />
                                              </td>
                                            </>
                                          ) : (
                                            <>
                                              <td data-title={t("Value")}></td>
                                            </>
                                          )}
                                          <td data-title={t("Unit")}>
                                            <div
                                              style={{
                                                wordWrap: "break-word",
                                                whiteSpace: "normal",
                                              }}
                                            >
                                              {datanew?.ReadingFormat}
                                            </div>{" "}
                                          </td>
                                          {["2", "3"].includes(
                                            datanew?.ReportType,
                                          ) ? (
                                            <td data-title=""> &nbsp;</td>
                                          ) : (
                                            <td data-title="Reference Range">
                                              <div
                                                style={{
                                                  display: "flex",
                                                  justifyContent:
                                                    "space-between",
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
                                                    datanew?.ReportType,
                                                  ) ? (
                                                    <div data-title="">
                                                      {" "}
                                                      &nbsp;
                                                    </div>
                                                  ) : (
                                                    <>
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
                                                    </>
                                                  )}
                                                </div>
                                              </div>{" "}
                                              &nbsp;
                                            </td>
                                          )}
                                          {["2", "3"].includes(
                                            datanew?.ReportType,
                                          ) ? (
                                            <td>&nbsp;</td>
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
                                                  <i
                                                    className="fa fa-plus-circle"
                                                    aria-hidden="true"
                                                    style={{ color: "#605ca8" }}
                                                  ></i>
                                                </div>
                                              </div>
                                            </td>
                                          )}

                                          <td data-title={t("MethodName")}>
                                            <div
                                              style={{
                                                wordWrap: "break-word",
                                                whiteSpace: "normal",
                                              }}
                                            >
                                              {datanew?.MethodName}
                                            </div>{" "}
                                            &nbsp;
                                          </td>
                                        </>
                                      ) : [
                                        "allergen",
                                        "basic allergen",
                                        "drugs",
                                      ]?.includes(
                                        datanew?.TestName?.toLowerCase(),
                                      ) ? (
                                        <>
                                          <td data-title="Drugs">
                                            <Link
                                              to="#"
                                              onClick={(e) => {
                                                e.preventDefault();
                                                window.scroll(0, 0);
                                              }}
                                            >
                                              <i
                                                className="mx-2 fa fa-edit"
                                                style={{
                                                  color: "#605ca8",
                                                  cursor: "pointer",
                                                  fontSize: "17px",
                                                }}
                                                title="Click to add drugs"
                                              ></i>
                                            </Link>
                                          </td>
                                          <td>&nbsp;</td>
                                          <td>&nbsp;</td>
                                          <td>
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
                                                <i
                                                  className="fa fa-plus-circle"
                                                  aria-hidden="true"
                                                  style={{ color: "#605ca8" }}
                                                ></i>
                                              </div>
                                            </div>
                                          </td>
                                        </>
                                      ) : datanew?.TestName == "Comments" ? (
                                        <tr>
                                          <td data-title={t("Comments")}></td>
                                          <td colSpan="1">
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
                                              <i
                                                className="fa fa-plus-circle"
                                                aria-hidden="true"
                                                style={{ color: "#605ca8" }}
                                              ></i>
                                            </div>
                                          </td>
                                        </tr>
                                      ) : (
                                        <tr></tr>
                                      )}
                                    </tr>
                                  )}
                                </>
                              ))}
                            </>
                          )})}
                        </tbody>
                      </ResultEntryTableCustom>
                    </div>
                  </div>

                  {entryShow && (
                    <div className="col-md-7 col-12">
                      {
                        <div className="p-2">
                          <div className="box-header with-border d-flex">
                            <div className="col-sm-8">
                              <label className="box-title">
                                {t("Drug Entry")}
                              </label>
                            </div>
                          </div>

                          <>
                            <div
                              style={{
                                maxHeight: "400px",
                                overflowY: "auto",
                              }}
                            >
                              <Tables>
                                <thead
                                  className="cf"
                                  style={{
                                    position: "sticky",
                                    zIndex: 99,
                                    top: 0,
                                  }}
                                >
                                  <tr>
                                    {["#", "AllergyDrugs", "Result"].map(
                                      (ele, index) => (
                                        <th key={index}>{t(ele)}</th>
                                      ),
                                    )}
                                  </tr>
                                </thead>

                                <tbody>
                                  {
                                    <>
                                      {entry.map((subArray, outerIndex) => {
                                        const isMandatory =
                                          mandatoryIDs?.includes(
                                            Number(subArray[0]?.obid),
                                          );

                                        return (
                                          <>
                                            <tr
                                              style={{
                                                background: "#fafa99",
                                              }}
                                            >
                                              <td colSpan={4}>
                                                <div className="row">
                                                  <label className="col-sm-3">
                                                    {t("Allergy Type Name")} :
                                                  </label>
                                                  <div className="col-sm-6">
                                                    <Input
                                                      className="select-input-box form-input input-sm"
                                                      type="text"
                                                      value={
                                                        subArray[0]?.obname
                                                      }
                                                    />
                                                  </div>
                                                  <div className="col-sm-2">
                                                    {!isMandatory && (
                                                      <button
                                                        className="btn btn-danger btn-sm"
                                                        onClick={() =>
                                                          removeArrayAtIndex(
                                                            outerIndex,
                                                          )
                                                        }
                                                        disabled={
                                                          ResultData[0]
                                                            ?.Status == 5 ||
                                                          ResultData[0]
                                                            ?.Status == 6
                                                        }
                                                      >
                                                        {t("Remove")}
                                                      </button>
                                                    )}
                                                  </div>
                                                </div>
                                                <div className="row">
                                                  <div className="col-sm-3 d-flex">
                                                    <label className="mr-2">
                                                      {t("Min Value")} :
                                                    </label>
                                                    <div
                                                      style={{
                                                        wordWrap: "break-word",
                                                        whiteSpace: "normal",
                                                      }}
                                                    >
                                                      {
                                                        entry[outerIndex][0]
                                                          ?.Minimum
                                                      }
                                                    </div>{" "}
                                                  </div>
                                                  <div className="col-sm-3 d-flex">
                                                    <label className="mr-2">
                                                      {t("Max Value")} :
                                                    </label>
                                                    <div
                                                      style={{
                                                        wordWrap: "break-word",
                                                        whiteSpace: "normal",
                                                      }}
                                                    >
                                                      {
                                                        entry[outerIndex][0]
                                                          ?.Maximum
                                                      }
                                                    </div>{" "}
                                                  </div>
                                                  <div className="col-sm-3 d-flex">
                                                    <label className="mr-2">
                                                      {t("Unit")} :
                                                    </label>
                                                    <div
                                                      style={{
                                                        wordWrap: "break-word",
                                                        whiteSpace: "normal",
                                                      }}
                                                    >
                                                      {
                                                        entry[outerIndex][0]
                                                          ?.Unit
                                                      }
                                                    </div>{" "}
                                                  </div>
                                                  <div className="col-sm-3 d-flex">
                                                    <label className="mr-2">
                                                      {t("DisplayReading")} :
                                                    </label>
                                                    <div
                                                      style={{
                                                        wordWrap: "break-word",
                                                        whiteSpace: "normal",
                                                      }}
                                                    >
                                                      {
                                                        entry[outerIndex][0]
                                                          ?.DisplayReading
                                                      }
                                                    </div>{" "}
                                                  </div>
                                                </div>
                                              </td>
                                            </tr>
                                            {subArray.map(
                                              (item, innerIndex) => (
                                                <>
                                                  <tr key={innerIndex}>
                                                    <td
                                                      className="text-center"
                                                      style={{ width: "30px" }}
                                                      data-title={t("S.NO")}
                                                    >
                                                      {innerIndex + 1}
                                                    </td>
                                                    <td
                                                      style={{
                                                        width: "400px",
                                                        minWidth: "150px",
                                                      }}
                                                      data-title={t(
                                                        "AllergyDrugs",
                                                      )}
                                                    >
                                                      {item?.isInput ? (
                                                        <Input
                                                          className="select-input-box form-control input-sm"
                                                          value={item?.name}
                                                          onChange={(e) =>
                                                            handleSensitivity(
                                                              e?.target?.value,
                                                              outerIndex,
                                                              innerIndex,
                                                              "name",
                                                            )
                                                          }
                                                        />
                                                      ) : (
                                                        `${item?.name} - ${item?.Name_Hindi}`
                                                      )}
                                                    </td>

                                                    <td
                                                      colSpan={2}
                                                      data-title={t("Result")}
                                                    >
                                                      <div className="row">
                                                        <div className="col-lg-5 col-md-7 col-sm-10 col-6">
                                                          <input
                                                            onChange={(e) =>
                                                              handleSensitivity(
                                                                e?.target
                                                                  ?.value,
                                                                outerIndex,
                                                                innerIndex,
                                                                "AntibioticInterpreatation",
                                                              )
                                                            }
                                                            value={
                                                              item?.AntibioticInterpreatation
                                                            }
                                                            className={`select-input-box allergy-input input-sm
                                                            ${getRangeClass(
                                                              item?.AntibioticInterpreatation,
                                                              parseFloat(
                                                                entry?.[
                                                                  outerIndex
                                                                ]?.[0]?.Minimum,
                                                              ),
                                                              parseFloat(
                                                                entry?.[
                                                                  outerIndex
                                                                ]?.[0]?.Maximum,
                                                              ),
                                                            )}
                                                            `}
                                                          />
                                                        </div>
                                                        <div
                                                          className="col-sm-1"
                                                          style={{
                                                            display: "flex",
                                                            justifyContent:
                                                              "center",
                                                            alignItems:
                                                              "center",
                                                          }}
                                                        >
                                                          {item?.DrugImage && (
                                                            <img
                                                              src={`https://elabassets.s3.ap-south-1.amazonaws.com/${item?.DrugImage}`}
                                                              alt="Drug"
                                                              style={{
                                                                width: "35px",
                                                                height: "25px",
                                                              }}
                                                            />
                                                          )}
                                                        </div>
                                                      </div>
                                                    </td>
                                                  </tr>
                                                </>
                                              ),
                                            )}
                                          </>
                                        );
                                      })}
                                    </>
                                  }
                                </tbody>
                              </Tables>
                            </div>
                            <div
                              className="row mt-2"
                              style={{
                                background: "lightblue",
                                border: "1px solid lightblue",
                              }}
                            >
                              <h5
                                style={{ fontWeight: "bold" }}
                                className="col-sm-4"
                              >
                                {t("Select Type")} :
                              </h5>
                              <div
                                className="col-sm-8"
                                style={{
                                  marginTop: "0px",
                                  backgroundColor: "white",
                                }}
                              >
                                <ReactSelect
                                  dynamicOptions={bindAllergyType}
                                  value={null}
                                  placeholderName="Select Type"
                                  menuPosition={"fixed"}
                                  maxMenuHeight={250}
                                  onChange={(_, e) =>
                                    getEntryData(
                                      e.value,
                                      e.label,
                                      "",
                                      "",
                                      "",
                                      true,
                                    )
                                  }
                                />
                              </div>
                            </div>
                          </>
                        </div>
                      }
                    </div>
                  )}
                </div>
                {loading ? (
                  <Loading />
                ) : (
                  <div className="row  px-2 mt-1 mb-1">
                    <div className="col-sm-1">
                      <button
                        className={`next roundarrow  mx-2 my-1 ${ResultData[0]?.currentIndex === 0
                          ? "btn-secondary"
                          : "btn-success"
                          }`}
                        onClick={() => {
                          ResultData?.length > 0 &&
                            GetResultEntryCulture(
                              {
                                LedgerTransactionID:
                                  reData[ResultData[0]?.currentIndex - 1]
                                    ?.LedgertransactionId,
                                TestID:
                                  reData[ResultData[0]?.currentIndex - 1]
                                    ?.TestID,
                                DepartmentID:
                                  reData[ResultData[0]?.currentIndex - 1]
                                    ?.DepartmentId,
                                VisitNo:
                                  reData[ResultData[0]?.currentIndex - 1]
                                    ?.LedgerTransactionNo,
                                BarcodeNo:
                                  reData[ResultData[0]?.currentIndex - 1]
                                    ?.BarcodeNo,
                              },
                              ResultData[0]?.currentIndex - 1,
                              false,
                            );
                        }}
                        disabled={
                          ResultData[0]?.currentIndex === 0 ? true : false
                        }
                      >
                        {t("<")}
                      </button>

                      <button
                        className={`next roundarrow  mx-2 my-1 ${ResultData[0]?.currentIndex === reData?.length - 1
                          ? "btn-secondary"
                          : "btn-success"
                          }`}
                        onClick={() => {
                          ResultData?.length > 0 &&
                            GetResultEntryCulture(
                              {
                                LedgerTransactionID:
                                  reData[ResultData[0]?.currentIndex + 1]
                                    ?.LedgertransactionId,
                                TestID:
                                  reData[ResultData[0]?.currentIndex + 1]
                                    ?.TestID,
                                DepartmentID:
                                  reData[ResultData[0]?.currentIndex + 1]
                                    ?.DepartmentId,
                                VisitNo:
                                  reData[ResultData[0]?.currentIndex + 1]
                                    ?.LedgerTransactionNo,
                                BarcodeNo:
                                  reData[ResultData[0]?.currentIndex + 1]
                                    ?.BarcodeNo,
                              },
                              ResultData[0]?.currentIndex + 1,
                              false,
                            );
                        }}
                        disabled={
                          ResultData[0]?.currentIndex === reData?.length - 1
                            ? true
                            : false
                        }
                      >
                        {t(">")}
                      </button>
                    </div>
                    {["", 3, 10, 11, 13, 14, 15, 20, 5, 6, 18].includes(
                      statusValue,
                    ) && (
                        <div className="col-sm-1 ">
                          <button
                            className="btn btn-primary  btn-block btn-sm"
                            onClick={() => handleResultSubmit("Save")}
                            disabled={
                              ResultData[0]?.Status == 5 ||
                              ResultData[0]?.Status == 6
                            }
                          >
                            {t("Save")}
                          </button>
                        </div>
                      )}
                    {buttonsData?.some(
                      (ele) => ele?.AccessBy === "Dual Authentication",
                    ) &&
                      checkDualAuthentication && (
                        <div className="col-sm-1 mr-3">
                          {buttonsData
                            ?.filter(
                              (ele) => ele?.AccessBy === "Dual Authentication",
                            )
                            .map((ele, index) => (
                              <button
                                key={index}
                                style={{ color: "white" }}
                                className="btn btn-sm"
                                onClick={() =>
                                  handleResultSubmit(ele?.AccessBy)
                                }
                              >
                                {t("Dual Authentication")}
                              </button>
                            ))}
                        </div>
                      )}
                    <div className="col-sm-1 ">
                      <button
                        className="btn btn-primary btn-sm  btn-block"
                        onClick={() => {
                          setResultData([]);
                          setMandatoryIDs([]);
                          setResultTestData([]);
                          setEntryShow(false);
                          setEntry([]);
                          setInvestigationID(0);
                          setEntryPayload({
                            ...entryPayload,
                            organism: "",
                            ApprovedBy: "",
                            ApprovalName: "",
                          });
                        }}
                      >
                        {t("Main List")}
                      </button>{" "}
                    </div>{" "}
                    <div className="col-sm-2">
                      <SelectBox
                        options={[
                          { label: "Select Doctor", value: "" },
                          ...withMappedDoctorOption(
                            doctorAdmin,
                            parseMappedSignature(ResultData[0]?.DefaultSignatureID)
                          ),
                        ]}
                        id="ApprovedBy"
                        name="ApprovedBy"
                        selectedValue={entryPayload?.ApprovedBy}
                        onChange={handleDoctorName}
                        isDisabled={!!entryPayload?.IsDutyRosterLocked}
                      ></SelectBox>
                    </div>
                    {HideResultEntryPreview == 0 && (
                      PrintReportLoading ? (
                        <Loading />
                      ) : (
                        <div className="col-sm-1 ">
                          <button
                            className="btn btn-success btn-sm  btn-block"
                            type="button"
                            id="btnMainList"
                            onClick={() => handleReport("no", "")}
                          >
                            {t("Preview")}
                          </button>{" "}
                        </div>
                      )
                    )}
                    {buttonsData?.map(
                      (ele, index) =>
                        ele?.AccessBy !== "Not Approved" &&
                        ele?.AccessBy !== "Unhold" &&
                        ele?.AccessBy !== "Discount Approval" &&
                        ele?.AccessBy !== "Hold" &&
                        ele?.AccessBy !== "Allow Customize Date" &&
                        ele?.AccessBy !== "Dual Authentication" &&
                        ele?.AccessBy !== "Not Approved - After Print" && (
                          <div className="col-sm-1 " key={index}>
                            <button
                              className="btn btn-success btn-sm  btn-block"
                              type="button"
                              id="btnMainList"
                              onClick={() => handleResultSubmit(ele?.AccessBy)}
                              disabled={
                                ResultData[0]?.Status == 5 ||
                                ResultData[0]?.Status == 6
                              }
                            >
                              {ele?.AccessBy === "Approved"
                                ? t("Approve")
                                : ele?.AccessBy}
                            </button>{" "}
                          </div>
                        ),
                    )}
                        {(
                          (ResultData?.[0]?.Status === 5 &&
                            buttonsData?.some(({ AccessBy }) => AccessBy === "Not Approved")) ||

                          (ResultData?.[0]?.Status === 6 &&
                            buttonsData?.some(({ AccessBy }) =>
                              AccessBy === "Not Approved" ||
                              AccessBy === "Not Approved - After Print"
                            ))
                        ) && (
                            <div className="col-sm-1">
                              <button
                                className="btn btn-success btn-sm btn-block"
                                type="button"
                                onClick={() => {
                                  if (ResultTestData[0]?.NotApproveRemark) {
                                    handleResultSubmit("Not Approved",ResultTestData[0]);
                                  } else {
                                    toast.error("Not Approve Remark is Required");
                                  }
                                }}
                                disabled={
                                  ResultData?.[0]?.Status !== 5 &&
                                  ResultData?.[0]?.Status !== 6
                                }
                              >
                                {t("Unapprove")}
                              </button>
                            </div>
                          )} 
                    
                    <CustomButton
                      className="col-sm-1"
                      text={"Patient Details"}
                      onClick={() => {
                        setShowPH(true);
                      }}
                    />
                  </div>
                )}
              </Accordion>
              <PdfPreviewModal
                visible={previewConfig.visible}
                url={previewConfig.url}
                onClose={handleClosePreview}
              />
            </>
          </>
        </>
      )}
      {showReportModal.show && (
        <Dialog
          header={t("Report Preview")}
          visible={showReportModal.show}
          style={{ height: "95vh", width: "60vw" }}
          onHide={() => setShowReportModal({ show: false, url: "" })}
          className={theme}
        >
          <div
            style={{ position: "relative", width: "100%", height: "85vh" }}
            onKeyDown={(e) => {
              if ((e.ctrlKey || e.metaKey) && (e.key === 'p' || e.key === 'P')) {
                e.preventDefault();
              }
            }}
            onContextMenu={(e) => e.preventDefault()}
            tabIndex="0"
          >
            <iframe
              src={`${showReportModal.url}#toolbar=0`}
              title="Report Preview"
              style={{ width: "100%", height: "100%", border: "none" }}
            ></iframe>
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
                <img
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
                />
              </div>
            </div>
          </div>
        </Dialog>
      )}
    </>
  );
}

export default ResultEntryAllergy;
