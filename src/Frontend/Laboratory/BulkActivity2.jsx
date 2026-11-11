import React, { useEffect, useRef, useState } from "react";
import Input from "../../components/formComponent/Input";
import { SelectBox } from "../../components/formComponent/SelectBox";
import DatePicker from "../../components/formComponent/DatePicker";
import CustomTimePicker from "../../components/formComponent/TimePicker";
import { SelectBoxWithCheckbox } from "../../components/formComponent/MultiSelectBox";
import Loading from "../../components/loader/Loading";
import { useTranslation } from "react-i18next";
import { SampleStatus, SearchBy } from "../../utils/Constants";
import { toast } from "react-toastify";
import moment from "moment";
import { axiosInstance, axiosReport } from "../../utils/axiosInstance";
import Accordion from "@app/components/UI/Accordion";
import "./BulkActivity.css";
import downloadPdfFromUrl, {
  AddBlankData,
  AllDataDropDownPayload,
  Time,
  autocompleteOnBlur,
  isChecked,
  IndexHandle,
  number,
  shouldIncludeAIIMSID,
  CheckDevice,
  downloadPdf,
  parseRemarks,
  parseAwsKeys,
} from "../../utils/helpers";
import Tables from "../../components/UI/customTable";
import CustomModal from "../utils/CustomModal";
import CustomDateModal from "../utils/CustomDateModal";
import BulkDownloadType from "../utils/BulkDownloadType";
import Pagination from "../../Pagination/Pagination";
import NoRecordFound from "../../components/formComponent/NoRecordFound";
import SpinnerLoad from "../../components/loader/SpinnerLoad";
import BulkEmailModal from "./BulkEmailModal";
import ResultModal from "../utils/ResultModal";
import MultiSelectComp from "../../components/formComponent/MultiSelectComp";
import ReactSelect from "../../components/formComponent/ReactSelect";
import {
  getCollectionBoy,
  getSearchController,
} from "../../utils/NetworkApi/commonApi";
import { FaPlus } from "react-icons/fa";
import AddRemark from "../utils/AddRemark";
import { CustomButton, SearchButton } from "../../components/UI/CustomButton";
import { RemarkTooltip } from "../utils/RemarkTooltip";
import { Tooltip as ReactTooltip } from "react-tooltip";
import AutoComplete from "../../components/formComponent/AutoComplete";
import { useLocalStorage } from "../../utils/hooks/useLocalStorage";
// import { Tooltip } from "primereact/tooltip";
import Tooltip from "../../components/formComponent/Tooltip";
import Urgent from ".././Images/urgent.gif";
import PdfPreviewModal from "../utils/PdfPreviewModal";
import TableFilterDot from "../../components/TableFilter/TableFilterDot";
import PageControlGear from '../../components/PageGearModel/PageControlGear'
import LastRemarkCell from "./LastRemarkCell";
const STATUS_COLOR_MAP = {
  "": "#6c757d",
  1: "#17a2b8",
  2: "#fd7e14",
  3: "#f39c12",
  4: "#dc3545",
  5: "#28a745",
  6: "#007bff",
  7: "#6610f2",
  10: "#20c997",
  11: "#e83e8c",
  13: "#795548",
  14: "#607d8b",
  20: "#ff5722",
  25: "#9c27b0",
};

const getStatusColorLocal = (value) =>
  STATUS_COLOR_MAP[String(value)] ?? "#adb5bd";

const groupByPatient = (data) => {
  const map = new Map();
  data.forEach((row) => {
    const key = row.LedgerTransactionNo;
    if (!map.has(key)) {
      map.set(key, { headerRow: row, testRows: [] });
    }
    map.get(key).testRows.push(row);
  });
  return Array.from(map.values());
};

const FIRST_ROW_ONLY_COLUMNS = [
  "PatientName",
  "Age/Gender",
  "Ref.By",
  "RateTypeName",
  "LedgerTransactionNo",
  "LabNo",
  "Reg.Date",
  "SinNo",
];

const BulkActivity = () => {
  const PAGE_ID = "742";
  const { t } = useTranslation();
  const [CentreData, setCentreData] = useState([]);
  const [DepartmentData, setDepartmentData] = useState([]);
  const [machineId, setMachineId] = useState([]);
  const [indexMatch, setIndexMatch] = useState(0);
  const [errors, setErrors] = useState({});
  const [tableData, setTableData] = useState([]);
  const [originalTableData, setOriginalTableData] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [doctorAdmin, setDoctorAdmin] = useState([]);
  const [load, setLoad] = useState(false);
  const [TestSuggestion, setTestSuggestion] = useState([]);
  const [allTests, setAllTests] = useState([]);
  const [selects, setSelects] = useState(false);
  const [doctorSuggestion, setDoctorSuggestion] = useState([]);
  const [observationData, setObservationData] = useState([]);
  const [ApprovedBy, setApprovedBy] = useState("");
  const [modal, setModal] = useState(false);
  const [visitID, setVisitID] = useState();
  const [dropFalse, setDropFalse] = useState(true);
  const [resdata, setresdata] = useState([]);
  const [collectionBoy, setCollectionBoy] = useState();
  const [collectionBoyList, setCollectionBoyList] = useState([]);
  const [rateType, setRateType] = useState("");
  const [rateTypeList, setRateTypeList] = useState([]);
  const [actionLoading, setActionLoading] = useState({
    type: "",
    load: false,
    index: -1,
  });
  const [bulkDownloadtypeState, setBulkDownloadtypeState] = useState(false);
  const [customizeDateModal, setCustomizeDateModal] = useState({
    show: false,
    TestId: "",
  });
  const [showAddRemark, setShowAddRemark] = useState({
    modal: false,
    rowData: null,
  });
  const rowRefs = useRef([]);
  const [downloadLoading, setDownloadLoading] = useState({});
  const [BulkEmailModalState, setBulkEmailModalState] = useState({
    modal: false,
    data: [],
    type: "",
  });
  const [controllerDynamicList, setControllerDynamicList] = useState([]);
  const [filterData, setFilterData] = useState([]);
  const [tabbingOrder, setTabbingOrder] = useState([]);

  // ─── Mobile / View Mode ───────────────────────────────────────────
  const [isMobile, setIsMobile] = useState(
    typeof window !== "undefined" ? window.innerWidth <= 768 : false,
  );
  const [viewMode, setViewMode] = useState("table"); // "table" | "responsive"

  useEffect(() => {
    const onResize = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
      if (!mobile) setViewMode("table");
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const isResponsiveMode = isMobile && viewMode === "responsive";
  // ─────────────────────────────────────────────────────────────────

  let PageSize = 50;
  const [currentPage, setCurrentPage] = useState(1);
  const [currentTableTestData, setCurrentTableTestData] = useState([]);
  const { ShowDefaultLoginCentre, DefaultCentre } = useLocalStorage(
    "userData",
    "get",
  );
  const [previewConfig, setPreviewConfig] = useState({
    visible: false,
    url: null,
  });
  useEffect(() => {
    const firstPageIndex = (currentPage - 1) * PageSize;
    const lastPageIndex = firstPageIndex + PageSize;
    const data = tableData?.map((ele) => ({ ...ele, isChecked: false }));
    setCurrentTableTestData(data.slice(firstPageIndex, lastPageIndex));
  }, [currentPage, tableData]);

  const today = new Date();
  const [rateTypeLoading, setRateTypeLoading] = useState(false);

  const [payload, setPayload] = useState({
    ItemValue: "",
    SelectTypes: "",
    CentreID: "",
    DepartmentID: "",
    TestId: "",
    FromDate: new Date(),
    ToDate: new Date(),
    TestName: "",
    VIP: "",
    Urgent: "",
    DoctorName: "",
    InvestigationId: 0,
    // FromTime: new Date(today.setHours(0, 0, 0, 0)),
    // ToTime: new Date(today.setHours(23, 59, 59, 999)),
    FromTime: "00:00:00",
    ToTime: "23:59:59",
    MachineID: "ALL",
    SampleStatus: "5",
    IsCulture: 0,
  });
  const [downloadLoad, setDownloadLoad] = useState(false);
  const [show, setshow] = useState(false);

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
      if (Array.isArray(controllersData)) setFilterData(controllersData);
    } catch (error) {
      console.error("error in controllerDynamic:", error);
    }
  };

  const visibleColumns = filterData?.filter(
    (item) =>
      item?.IsShow == 1 &&
      item?.TypeId == 2 &&
      item?.ControlDisplayID !== "Details" &&
      item?.ControlDisplayID !== "Remarks",
  );

  const statusCount = (value) => {
    if (value === "") return originalTableData.length;
    return originalTableData.filter((d) => String(d.Status) === String(value))
      .length;
  };

  const sampleStatusOptions = () => [
    { label: t("All"), value: "" },
    ...SampleStatus.filter((s) =>
      [
        "1",
        "2",
        "4",
        "13",
        "14",
        "10",
        "5",
        "6",
        "11",
        "3",
        "7",
        "20",
        "25",
      ].includes(s?.value),
    ),
  ];

  const handleChangeSearch = (e) => {
    const value = e.target.value.toLowerCase();
    setSearchTerm(value);
    if (!value.trim()) {
      setTableData(originalTableData);
      return;
    }
    const searchableKeys = [
      "PatientName",
      "LedgerTransactionNo",
      "BarcodeNo",
      "InvestigationName",
      "RefBy",
      "AgeGender",
      "RateTypeName",
    ];
    const filtered = originalTableData.filter((row) =>
      searchableKeys.some((key) =>
        String(row[key] || "")
          .toLowerCase()
          .includes(value),
      ),
    );
    setTableData(filtered);
  };

  const filterStatusWise = (sampStatus) => {
    setPayload((prev) => ({ ...prev, SampleStatus: sampStatus }));
    if (sampStatus === "" || sampStatus === undefined) {
      setTableData(originalTableData);
    } else {
      setTableData(
        originalTableData.filter(
          (d) => String(d.Status) === String(sampStatus),
        ),
      );
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
        let CentreDataValue = data.map((ele) => ({
          value: ele.value,
          label: ele.label,
        }));
        setCentreData(CentreDataValue);
        const allValues = CentreDataValue.map((ele) => ele.value);
        if (ShowDefaultLoginCentre === "1") {
          setPayload((prev) => ({ ...prev, CentreID: DefaultCentre }));
          fetchRateTypes(DefaultCentre,true);
        } else {
          fetchRateTypes(allValues,true);
        }
        if (CentreDataValue?.length == 1) {
          fetchRateTypes(CentreDataValue?.[0]?.value,true);
          setPayload((prev) => ({
            ...prev,
            CentreID: CentreDataValue?.[0]?.value,
          }));
        }
      })
      .catch((err) => console.log(err));
  };

  const getDepartment = () => {
    axiosInstance
      .get("Department/getDepartment")
      .then((res) => {
        let data = res.data.message;
        setDepartmentData(
          data.map((ele) => ({
            value: ele.DepartmentID,
            label: ele.Department,
          })),
        );
      })
      .catch((err) => console.log(err));
  };

  const BindMachineName = () => {
    axiosInstance
      .get("MachineGroup/BindMachineName")
      .then((res) => {
        setMachineId(
          res?.data?.message?.map((ele) => ({
            value: ele?.MachineId,
            label: ele?.MachineName,
          })),
        );
      })
      .catch((err) => {
        toast.error(err?.response?.data?.message || "Error Occur");
      });
  };

  const BindApprovalDoctor = () => {
    axiosInstance
      .get("CommonController/BindApprovalDoctor")
      .then((res) => {
        setDoctorAdmin(
          res.data.message.map((ele) => ({
            value: ele?.employeeid,
            label: ele?.name,
          })),
        );
      })
      .catch((err) => console.log(err));
  };

  const handleChange = (event) => {
    const { name, value, checked, type } = event?.target;
    if (name === "CentreID") fetchRateTypes(value,true);
    if (name == "SampleStatus") {
      setPayload({ ...payload, [name]: value });
      TableData(value);
    }
    if (name === "TestName") {
      setPayload({
        ...payload,
        [name]: value,
      });

      if (value === "") {
        console.log("entered", value + "x");
        setSelects(false);
        setTestSuggestion([]);
        setIndexMatch(0);
        // setPayload((prev) => ({...prev, InvestigationId : 0 }))
        return;
      }

      const filtered = allTests?.filter((ele) =>
        ele?.label?.toLowerCase().includes(value.toLowerCase()),
      );

      setTestSuggestion(filtered);
      setSelects(true);
      setIndexMatch(0);
    } else {
      setPayload({
        ...payload,
        [name]: type == "checkbox" ? checked : value,
      });
    }
  };

  const dateSelect = (value, name) => setPayload({ ...payload, [name]: value });
  const handleTime = (time, name) => setPayload({ ...payload, [name]: time });

  const handleToggle = (field) => {
    setPayload((prev) => ({
      ...prev,
      [field]: prev[field] === 1 ? 0 : 1,
    }));
  };

  const handleIndexNew = (e, name) => {
    switch (name) {
      case "DoctorName":
        switch (e.which) {
          case 38:
            if (indexMatch !== 0) setIndexMatch(indexMatch - 1);
            else setIndexMatch(doctorSuggestion.length - 1);
            break;
          case 40:
            if (doctorSuggestion.length - 1 === indexMatch) setIndexMatch(0);
            else setIndexMatch(indexMatch + 1);
            break;
          case 13:
            handleListSearchNew(doctorSuggestion[indexMatch], name);
            setIndexMatch(0);
            break;
          default:
            break;
        }

      case "TestName":
        switch (e.which) {
          case 38:
            if (TestSuggestion.length > 0) {
              setIndexMatch((prev) =>
                prev > 0 ? prev - 1 : TestSuggestion.length - 1,
              );
            }
            break;
          case 40:
            if (TestSuggestion.length > 0) {
              setIndexMatch((prev) =>
                prev < TestSuggestion.length - 1 ? prev + 1 : 0,
              );
            }
            break;
          case 13:
            if (TestSuggestion[indexMatch]) {
              handleListSearchNew(TestSuggestion[indexMatch], name);
            }
            break;

          default:
            break;
        }
      default:
        break;
    }
  };

  const handleSelectMultiChange = (name, value) =>
    setPayload({ ...payload, [name]: value });

  const handleListSearchNew = (data, name) => {
    switch (name) {
      case "DoctorName":
        setPayload({
          ...payload,
          [name]: data.Name,
          DoctorReferal: data.Name ? data.DoctorReferalID : "",
        });
        setIndexMatch(0);
        setDoctorSuggestion([]);
        setDropFalse(false);
        break;
      case "TestName":
        setPayload({
          ...payload,
          TestName: data?.label,
          InvestigationId: data?.value,
        });
        setSelects(false);
        setTestSuggestion([]);
        setIndexMatch(0);
        break;
    }
  };

  const handleCheck = (e, index) => {
    const { checked, name } = e.target;
    if (index >= 0) {
      const data = [...currentTableTestData];
      data[index][name] = checked;
      setCurrentTableTestData(data);
    } else {
      setCurrentTableTestData(
        currentTableTestData?.map((ele) => ({ ...ele, [name]: checked })),
      );
    }
  };

  const getInvestigationList = () => {
    axiosInstance
      .get("Investigations/BindInvestigationList")
      .then((res) => {
        const MapTest = res.data.message.map((ele) => ({
          value: ele.InvestigationID,
          label: ele.TestName,
        }));
        setAllTests(MapTest);
        setTestSuggestion(MapTest);
      })
      .catch((err) => console.log(err));
  };

  useEffect(() => {
    getInvestigationList();
    getCollectionBoy(setCollectionBoyList, true);
    controllerDynamic();
  }, []);

  const validation = () => {
    let error = "";
    if (payload?.SelectTypes !== "" && payload?.ItemValue === "")
      error = { ...error, ItemValue: t("Please Choose Value") };
    if (payload.SelectTypes === "Mobile") {
      if (payload?.SelectTypes !== "" && payload?.ItemValue === "")
        error = { ...error, ItemValue: t("This Field is Required") };
      else if (payload.ItemValue.length !== 10)
        error = { ...error, ItemValue: t("Invalid Mobile Number") };
    }
    if (payload.FromDate === moment(new Date()).format("DD/MMM/YYYY")) {
      if (payload.FromTime > moment(new Date()).format("hh:mm:ss "))
        error = { ...error, FromTime: t("Time is Invalid") };
    }
    if (payload.ToDate === moment(new Date()).format("DD/MMM/YYYY")) {
      if (payload.ToTime < payload.FromTime)
        error = { ...error, ToTime: t("Time Must be Less than From Time") };
    }
    return error;
  };

  const TableData = (SampleStatus) => {
    setDownloadLoading({});
    const generatedError = validation();
    if (generatedError === "") {
      setLoad(true);
      axiosInstance
        .post("RE/PatientSearch", {
          CollectionBoyID: Number(collectionBoy || 0),
          RateTypeID: rateType ? [rateType] : [],
          SelectTypes: payload?.SelectTypes,
          ItemValue: payload?.ItemValue,
          FromDate: moment(payload.FromDate).format("DD/MMM/YYYY"),
          ToDate: moment(payload.ToDate).format("DD/MMM/YYYY"),
          CentreID: payload?.CentreID ? [Number(payload?.CentreID)] : [],
          SampleStatus: SampleStatus,
          DepartmentID: payload?.DepartmentID
            ? [Number(payload?.DepartmentID)]
            : [],
          MachineID: payload?.MachineID,
          FromTime: payload.FromTime,
          ToTime: payload.ToTime,
          isUrgent: payload?.Urgent ? 1 : 0,
          IsCulture: payload?.IsCulture ? 1 : 0,
          VIP: payload?.VIP ? 1 : 0,
          TestName: payload?.TestName ? [payload?.InvestigationId] : [],
        })
        .then((res) => {
          if (res?.data?.message.length > 0) {
            const data = res?.data?.message.map((ele) => ({
              ...ele,
              isChecked: false,
            }));
            setTableData(data);
            setOriginalTableData(data);
          } else {
            toast.error("No records for selected status");
            setTableData([]);
          }
          setLoad(false);
        })
        .catch((err) => {
          toast.error(err?.response?.data?.message || "Something went wrong.");
          setLoad(false);
          setErrors(generatedError);
        });
    } else {
      setErrors(generatedError);
    }
  };

  const showResult = (InvestigationID, PatientCode, index, TestID) => {
    setActionLoading({ type: "showResult", load: true, index: index });
    axiosInstance
      .post("RE/PatientObservationDetails", {
        InvestigationID,
        PatientCode,
        TestID,
      })
      .then((res) => {
        if (res?.data?.success) {
          setresdata(res?.data?.message);
          setActionLoading({ type: "", load: false, index: -1 });
        } else {
          toast?.error("No Record Found");
          setActionLoading({ type: "", load: false, index: -1 });
        }
      })
      .catch((err) => {
        setActionLoading({ type: "", load: false, index: -1 });
        toast.error(err);
      });
  };

  const filterOutChecked = (data, type) =>
    data.reduce((acc, current) => {
      if (current.isChecked) acc.push(current[type]);
      return acc;
    }, []);

  const ApproveAllTest = async () => {
    const approvePayload = filterOutChecked(currentTableTestData, "TestID");
    if (approvePayload.length > 0 && ApprovedBy) {
      setLoad(true);
      axiosInstance
        .post("RE/ApproveAllTest", {
          TestID: approvePayload,
          IsCulture: 0,
          ApprovedBy: ApprovedBy,
        })
        .then((res) => {
          setLoad(false);
          toast.success(res?.data?.message);
          TableData(payload?.SampleStatus);
        })
        .catch((err) => {
          setLoad(false);
          toast.error(err?.response?.data?.message);
        });
    } else {
      toast.error("Please choose Test ToApprove or Doctor");
    }
  };

  const handleReport = (TestIDHash, PHead, type, index) => {
    if (actionLoading.index === -1) {
      setActionLoading({ load: true, type: type, index: index });
      axiosReport
        .post(
          `commonReports/GetLabReport`,
          {
            TestIDHash: Array?.isArray(TestIDHash) ? TestIDHash : [TestIDHash],
            PHead: PHead,
            IsDownload: 1,
            PrintColour: "1",
          },
          { responseType: "blob" },
        )
        .then((res) => {
          const blob = new Blob([res.data], { type: "application/pdf" });
          const url = window.URL.createObjectURL(blob);
          window.open(url, "_blank");
          if (window.innerWidth <= 765) downloadPdf(res.data);
          setActionLoading({ load: false, type: "", index: -1 });
        })
        .catch((err) => {
          toast.error(err?.response?.data?.message || err?.data?.message);
          setActionLoading({ load: false, type: "", index: -1 });
        });
    } else {
      toast.warn("Please wait Generating Report");
    }
  };

  const getPatientInfoReport = () => {
    axiosReport
      .post(`commonReports/LabWorksheet`, {
        FromDate: moment(payload.FromDate).format("DD/MMM/YYYY"),
        ToDate: moment(payload.ToDate).format("DD/MMM/YYYY"),
        CentreID: AllDataDropDownPayload(
          payload?.CentreID,
          CentreData,
          "value",
        ),
        DepartmentID: AllDataDropDownPayload(
          payload?.DepartmentID,
          DepartmentData,
          "value",
        ),
        FromTime: new Date(today.setHours(0, 0, 0, 0)),
        ToTime: new Date(today.setHours(23, 59, 59, 999)),
        ReportType: Number(2),
        ledgertransactionid: filterOutChecked(
          currentTableTestData,
          "ledgertransactionid",
        ).toString(),
      })
      .then((res) => window.open(res?.data?.url, "_blank"))
      .catch((err) => {
        toast.error(err?.response?.data?.message || err?.data?.message);
      });
  };

  let statusOfDownload = {};

  const downloadFile = async (
    TestIDHash,
    PHead,
    signature,
    dlPayload,
    BulkUrl,
  ) => {
    for (let i = 0; i <= TestIDHash.length; i++) {
      statusOfDownload = {
        ...statusOfDownload,
        [TestIDHash[i]]: {
          TestIDHash: TestIDHash[i],
          display: "Downloading...",
          className: "text-warning",
          icons: <SpinnerLoad />,
          backgroundColor: "",
        },
      };
    }
    setDownloadLoading({ ...statusOfDownload });
    await axiosReport
      .post(`commonReports/GetLabReport`, {
        TestIDHash,
        PHead,
        signature,
        IsDownload: 0,
        PrintColour: "1",
      })
      .then((res) => {
        if (res?.data?.success) {
          for (let i = 0; i <= TestIDHash.length; i++) {
            statusOfDownload = {
              ...statusOfDownload,
              [TestIDHash[i]]: {
                TestIDHash: TestIDHash[i],
                display: "",
                className: "text-success",
                icons: (
                  <i
                    className="fa fa-check"
                    aria-hidden="true"
                    style={{
                      padding: "2px",
                      backgroundColor: "green",
                      borderRadius: "25px",
                      color: "white",
                      fontSize: "10px",
                    }}
                  ></i>
                ),
              },
            };
          }
          setDownloadLoading({ ...statusOfDownload });
          dlPayload.status = 1;
          BulkUrl.push(res?.data?.url?.split("?")[0]);
        } else {
          for (let i = 0; i <= TestIDHash.length; i++) {
            statusOfDownload = {
              ...statusOfDownload,
              [TestIDHash[i]]: {
                TestIDHash: TestIDHash[i],
                display: res?.data?.message,
                className: "text-danger",
                icons: <i className="fa fa-times" aria-hidden="true"></i>,
                backgroundColor: "#ffd6d6",
              },
            };
          }
          setDownloadLoading({ ...statusOfDownload });
          dlPayload.status = 0;
        }
      })
      .catch((err) => {
        for (let i = 0; i <= TestIDHash.length; i++) {
          statusOfDownload = {
            ...statusOfDownload,
            [TestIDHash[i]]: {
              TestIDHash: TestIDHash[i],
              display: "Failed...",
              className: "text-danger",
              icons: <i className="fa fa-times" aria-hidden="true"></i>,
              backgroundColor: "#ffd6d6",
            },
          };
        }
        setDownloadLoading({ ...statusOfDownload });
        dlPayload.status = 0;
      });
  };

  const handleBulkDownload = async (reportType) => {
    const { letterHead, Signature } = reportType;
    setBulkDownloadtypeState(false);
    setDownloadLoad(true);
    let dlPayloadArr = currentTableTestData?.reduce((acc, current) => {
      const index = acc.findIndex(
        (ele) => ele.ledgertransactionid === current?.ledgertransactionid,
      );
      if (current.isChecked) {
        if (index >= 0)
          acc[index].TestIDHash = [
            ...acc[index].TestIDHash,
            current?.TestIDHash,
          ];
        else
          acc.push({
            ledgertransactionid: current?.ledgertransactionid,
            LedgerTransactionNo: current?.LedgerTransactionNo,
            TestIDHash: [current?.TestIDHash],
            status: 1,
          });
      }
      return acc;
    }, []);
    let BulkUrl = [];
    for (let i = 0; i < dlPayloadArr.length; i++) {
      await downloadFile(
        dlPayloadArr[i].TestIDHash,
        letterHead,
        Signature,
        dlPayloadArr[i],
        BulkUrl,
      );
    }
    axiosReport
      .post("commonReports/BulkDownload", { pdfUrls: BulkUrl })
      .then(async (res) => {
        setDownloadLoad(false);
        const s3Url = res?.data?.url;

        window.open(encodeURI(s3Url), "_blank");

        // window.open(encodeURI(res?.data?.url), "_blank");
        // await downloadPdfFromUrl(res?.data?.url);
      })
      .catch((err) => {
        setDownloadLoad(false);
        toast.error(err?.response?.data?.message || err?.data?.message);
      });
  };

  const handleReactSelectChange = (name, option) => {
    if (name === "rateType") {
      setRateType(option?.value);
      return;
    }
    setCollectionBoy(option?.value);
  };

  const handleSelectChange = (name, value) => {
    if (name === "CentreID") {
      fetchRateTypes(value?.value,true);

      setPayload((prev) => ({
        ...prev,
        [name]: value?.value,
      }));
    }
    setPayload((prev) => ({ ...prev, [name]: value?.value }));
  };

  const handleDoctorName = (e) => setApprovedBy(e.target.value);

  const fetchRateTypes = async (id, showLoader = false) => {
    if (showLoader) setRateTypeLoading(true);
    try {
      const res = await axiosInstance.post("Centre/BindRateTypeWorkOrderSearch", {
        centreID: id?.toString() || 0,
        rateTypeID: 0,
        AllowEstimate: 0,
        CentreType: "",
        AllowHomeCollection: 0,
        AllowMembershipCard: 0,
        PageName: "YES",
      });
      const list = res?.data?.message.map((item) => ({
        label: item?.RateTypeName
          ?.replace(/\r?\n/g, " ")
          .trim(),
        value: item?.RateTypeID,
      }));
      setRateTypeList(list);
      if (list?.length == 1) {
        setRateType(list?.[0]?.value);
      }
      else {
        setRateType("");
      }
    } catch (err) {
      console.log(err);
      if (showLoader) setRateTypeLoading(false);
    } finally {
      if (showLoader) setRateTypeLoading(false);
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

  useEffect(() => {
    getAccessCentres();
    getDepartment();
    BindMachineName();
    BindApprovalDoctor();
  }, []);

  useEffect(() => {
    if (payload?.TestName === "")
      setPayload((prev) => ({ ...prev, InvestigationId: 0 }));
  }, [payload?.TestName]);

  const getFlatIndex = (testRow) =>
    currentTableTestData.findIndex(
      (r) =>
        r.TestID === testRow.TestID &&
        r.LedgerTransactionNo === testRow.LedgerTransactionNo,
    );

  const renderColumnHeader = (column, idx) => {
    const colId = column?.ControlDisplayID;
    if (colId === "Select") {
      return (
        <th key={idx}>
          <input
            type="checkbox"
            name="isChecked"
            onChange={(e) => handleCheck(e)}
            checked={
              currentTableTestData.length > 0
                ? !isChecked("isChecked", currentTableTestData, true).includes(
                  false,
                )
                : false
            }
          />
        </th>
      );
    }
    return (
      <th key={idx}>
        {t(column?.ControlDisplayName || column?.ControlDisplayID)}
      </th>
    );
  };

  const renderSNoCell = (ele, flatIndex, rowNum) => (
    <td key="S.No" data-title="S.No">
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "6px",
          flexWrap: "nowrap",
        }}
      >
        <span style={{ minWidth: "16px", flexShrink: 0 }}>
          {rowNum + 1 + IndexHandle(currentPage, PageSize)}
        </span>
        <div
          data-tooltip-id={`remark-tooltip-${flatIndex}`}
          onClick={() => setShowAddRemark({ modal: true, rowData: { ...ele } })}
          style={{
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "2px",
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
              flexShrink: 0,
            }}
          >
            <FaPlus color="white" size={8} />
          </div>
          {ele?.LabRemarkCount > 0 && (
            <span
              style={{ fontSize: "11px", fontWeight: "bold", color: "#333" }}
            >
              ({ele.LabRemarkCount})
            </span>
          )}
        </div>
        {Array.isArray(parseRemarks(ele?.RemarksList)) &&
          parseRemarks(ele?.RemarksList)?.length > 0 && (
            <ReactTooltip
              id={`remark-tooltip-${flatIndex}`}
              place="top"
              style={{ zIndex: 9999 }}
              clickable
              content={
                <RemarkTooltip remarks={parseRemarks(ele.RemarksList)} />
              }
            />
          )}
        <i
          className="fa fa-search"
          data-tooltip-id={`details-tooltip-${flatIndex}`}
          onClick={() => {
            setModal(true);
            setVisitID(ele?.LedgerTransactionNo);
          }}
          style={{
            cursor: "pointer",
            fontSize: "13px",
            color: "#007bff",
            flexShrink: 0,
          }}
        />
        {ele?.IsPatientDocAvail > 0 && (
          <div>
            <i
              className="fa bi-file-earmark-pdf text-primary cursor-pointer"
              style={{ fontSize: "16px" }}
              onClick={() => handleOpenPreview(ele?.awsKeys)}
              title="View Attachments"
            />
          </div>
        )}
        {/* &nbsp;&nbsp; */}
        {ele?.isUrgent == 1 && (
          <div>
            <img src={Urgent} className="sizeicon" title="Urgent" />
          </div>
        )}
        {ele?.IsVip === 1 && (
          <div>
            <i
              className="bi bi-shield-fill-check mr-1 vip-font-size"
              style={{ color: "#FFC107", display: "inline", width: "5%" }}
              title="VIP Patient"
            />
          </div>
        )}
        <ReactTooltip
          id={`details-tooltip-${flatIndex}`}
          place="top"
          style={{ zIndex: 9999 }}
          content="View Details"
        />
      </div>
    </td>
  );

  const renderCell = (column, ele, flatIndex, rowNum, isFirstRow) => {
    const colId = column?.ControlDisplayID;
    const colLabel = column?.ControlDisplayName || colId;

    if (colId === "S.No") return renderSNoCell(ele, flatIndex, rowNum);

    if (colId === "Details" || colId === "Remarks") {
      return (
        <td key={colId} data-title={colLabel}>
          &nbsp;
        </td>
      );
    }

    if (FIRST_ROW_ONLY_COLUMNS.includes(colId) && !isFirstRow) {
      return (
        <td key={colId} data-title={colLabel}>
          &nbsp;
        </td>
      );
    }

    if (colId === "LastRemark") {
      return (
        <td key={colId} data-title="LastRemark">
          <LastRemarkCell remarks={ele?.RemarksList} />
        </td>
      );
    }

    if (colId === "Select") {
      return (
        <td key={colId} data-title="Select">
          <input
            type="checkbox"
            name="isChecked"
            onChange={(e) => handleCheck(e, flatIndex)}
            checked={ele?.isChecked}
          />
          &nbsp;
        </td>
      );
    }

    if (colId === "BarcodeNo" || colId === "SinNo") {
      return (
        <td
          key={colId}
          data-title={colLabel}
          ref={(el) => {
            if (
              el &&
              downloadLoading?.[ele?.TestIDHash]?.icons &&
              downloadLoading?.[ele?.TestIDHash]?.TestIDHash === ele?.TestIDHash
            ) {
              el.scrollIntoView({ behavior: "smooth", block: "nearest" });
            }
          }}
        >
          {ele?.BarcodeNo}&nbsp;
          {downloadLoading?.[ele?.TestIDHash]?.TestIDHash ===
            ele?.TestIDHash && (
              <div
                className="box-title"
                style={{
                  padding: "1px",
                  borderRadius: "3px",
                  backgroundColor:
                    downloadLoading?.[ele?.TestIDHash]?.backgroundColor,
                }}
              >
                <strong className={downloadLoading?.[ele?.TestIDHash]?.className}>
                  {t(downloadLoading?.[ele?.TestIDHash]?.display)}
                  {downloadLoading?.[ele?.TestIDHash]?.icons}
                </strong>
              </div>
            )}
        </td>
      );
    }

    if (colId === "InvestigationName") {
      const bgColor = getStatusColorLocal(ele?.Status);
      return (
        <td key={colId} data-title="Investigation">
          <p
            title={ele?.InvestigationName}
            className="mb-0"
            style={{ backgroundColor: bgColor, padding: "2px" }}
          >
            {ele?.InvestigationName?.length > 30
              ? ele?.InvestigationName?.slice(0, 30) + "..."
              : ele?.InvestigationName}
          </p>
          &nbsp;
        </td>
      );
    }

    if (colId === "LedgerTransactionNo" || colId === "LabNo") {
      return (
        <td key={colId} data-title="Lab Ref No.">
          {ele?.LedgerTransactionNo}&nbsp;
        </td>
      );
    }
    if (colId === "PatientName") {
      return (
        <td key={colId} data-title="Patient Name">
          {ele?.PatientName}&nbsp;
        </td>
      );
    }
    if (colId === "Age/Gender") {
      return (
        <td key={colId} data-title="Age/Gender">
          {ele?.AgeGender}&nbsp;
        </td>
      );
    }
    if (colId === "Reg.Date") {
      return (
        <td key={colId} data-title="Reg. Date">
          {ele?.RegDate}&nbsp;
        </td>
      );
    }
    if (colId === "Ref.By") {
      return (
        <td key={colId} data-title="Ref. By">
          {ele?.RefBy}&nbsp;
        </td>
      );
    }
    if (colId === "RateTypeName") {
      return (
        <td key={colId} data-title="Rate Type">
          {ele?.RateTypeName}&nbsp;
        </td>
      );
    }
    if (colId === "Delay") {
      return (
        <td key={colId} data-title="Delay">
          &nbsp;
        </td>
      );
    }

    if (colId === "Print") {
      return (
        <td key={colId} data-title="Print">
          {[6, 5].includes(ele?.Status) ? (
            <>
              {actionLoading?.load &&
                actionLoading?.type === "Printwithoutheader" &&
                actionLoading?.index === flatIndex ? (
                <Loading />
              ) : (
                <i
                  className="fa fa-print"
                  style={{ cursor: "pointer", textAlign: "center" }}
                  onClick={() =>
                    handleReport(
                      ele?.TestIDHash,
                      0,
                      "Printwithoutheader",
                      flatIndex,
                    )
                  }
                  title="Print without header"
                ></i>
              )}
              &nbsp;
              {actionLoading?.load &&
                actionLoading?.type === "Printwithheader" &&
                actionLoading?.index === flatIndex ? (
                <Loading />
              ) : (
                <i
                  className="fa fa-print"
                  style={{
                    color: "red",
                    cursor: "pointer",
                    textAlign: "center",
                  }}
                  onClick={() =>
                    handleReport(
                      ele?.TestIDHash,
                      1,
                      "Printwithheader",
                      flatIndex,
                    )
                  }
                  title="Print with header"
                ></i>
              )}
            </>
          ) : null}
        </td>
      );
    }
  };

  const renderGroupedRows = (groups) => {
    let globalRowNum = 0;
    return groups.map(({ headerRow, testRows }, groupIdx) => {
      const fragment = (
        <React.Fragment key={groupIdx}>
          {testRows.map((ele, testIdx) => {
            const flatIndex = getFlatIndex(ele);
            const rowNum = globalRowNum + testIdx;
            const isFirstRow = testIdx === 0;
            return (
              <tr
                key={`${groupIdx}-${testIdx}`}
                style={{
                  backgroundColor: ele?.Isculture ? "#e8fdb4" : undefined,
                }}
              >
                {visibleColumns.map((column) =>
                  renderCell(column, ele, flatIndex, rowNum, isFirstRow),
                )}
              </tr>
            );
          })}
        </React.Fragment>
      );
      globalRowNum += testRows.length;
      return fragment;
    });
  };

  const renderDynamicThead = () => (
    <thead
      className="cf awpoqw"
      style={
        isResponsiveMode
          ? {}
          : { position: "sticky", top: 0, zIndex: 2, backgroundColor: "#fff" }
      }
    >
      <tr>
        {visibleColumns.map((column, idx) => renderColumnHeader(column, idx))}
      </tr>
    </thead>
  );

  const viewToggle = isMobile ? (
    <div
      className="d-flex align-items-center"
      style={{ gap: "6px", marginLeft: "12px" }}
      onClick={(e) => e.stopPropagation()}
    >
      <label className="switch mb-0">
        <input
          type="checkbox"
          checked={viewMode === "responsive"}
          onChange={() =>
            setViewMode((prev) =>
              prev === "responsive" ? "table" : "responsive",
            )
          }
        />
        <span className="slider"></span>
      </label>
      <strong style={{ fontSize: "12px", whiteSpace: "nowrap" }}>
        {viewMode === "responsive" ? t("Mobile View") : t("Table View")}
      </strong>
    </div>
  ) : null;

  return (
    <div
      className={`bulk-activity-wrapper ${isResponsiveMode ? "responsive-mode-active" : ""}`}
      style={{ position: "relative", zIndex: 1 }}
    >
      {showAddRemark?.modal && (
        <AddRemark
          show={showAddRemark.modal}
          handleShow={() => {
            setShowAddRemark({ modal: false, rowData: null });
            TableData(payload?.SampleStatus);
          }}
          rowData={showAddRemark.rowData}
          bindTestFromRow={false}
          visitKey="LedgerTransactionNo"
          testIDsKey="TestID"
          testNamesKey="InvestigationName"
          ledgerTransactionIDKey="ledgertransactionid"
          patientNameKey="PatientName"
          ageGenderKey="AgeGender"
        />
      )}
      <PdfPreviewModal
        visible={previewConfig.visible}
        url={previewConfig.url}
        onClose={handleClosePreview}
      />
      <Accordion
        name={
          <div className="d-flex align-items-center">
            {t("Bulk Activity")}
            {viewToggle}
          </div>
        }
        isBreadcrumb={true}
        defaultValue={true}
        seconTitle={
          <div style={{ marginLeft: "auto" }}>
            <PageControlGear pageId={PAGE_ID} />
          </div>
        }
      >
        <div className="row px-2 mt-2">
          {controllerDynamicList
            ?.filter((item) => item?.TypeId === 1 && item?.IsShow === 1)
            ?.map((item, index) => {
              if (
                item?.ControlDisplayID === "SelectTypes" &&
                isHideController("SelectTypes")
              ) {
                return (
                  <div className="col-sm-2" key={index}>
                    <div className="d-flex">
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
                          selectedValue={payload?.SelectTypes}
                          name="SelectTypes"
                          onChange={handleChange}
                        />
                      </div>
                      <div style={{ width: "60%" }}>
                        {payload?.SelectTypes === "Mobile" ? (
                          <Input
                            type="number"
                            name="ItemValue"
                            max={10}
                            value={payload?.ItemValue}
                            onInput={(e) => number(e, 10)}
                            onChange={handleChange}
                          />
                        ) : (
                          <Input
                            type="text"
                            name="ItemValue"
                            max={20}
                            value={payload?.ItemValue}
                            onChange={handleChange}
                          />
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
                  <div className="col-sm-2" key={index}>
                    <ReactSelect
                      dynamicOptions={[
                        { label: "Select Centre", value: "" },
                        ...CentreData,
                      ]}
                      name="CentreID"
                      lable={t("Centre")}
                      id="CentreID"
                      removeIsClearable={true}
                      placeholderName={t("Centre")}
                      value={payload.CentreID}
                      onChange={handleSelectChange}
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
                    <ReactSelect
                      dynamicOptions={[
                        { label: "All Department", value: "" },
                        ...DepartmentData,
                      ]}
                      name="DepartmentID"
                      lable={t("Department")}
                      id="DepartmentID"
                      removeIsClearable={true}
                      placeholderName={t("Department")}
                      value={payload.DepartmentID}
                      onChange={handleSelectChange}
                    />
                  </div>
                );
              }
              if (
                item?.ControlDisplayID === "rateType" &&
                isHideController("rateType")
              ) {
                return (
                  <div className="col-sm-2" key={index}>
                    <ReactSelect
                      dynamicOptions={[
                        { label: "All RateType", value: "" },
                        ...rateTypeList,
                      ]}
                      name="rateType"
                      lable={t("rateType")}
                      id="rateType"
                      removeIsClearable={true}
                      placeholderName={t("RateType")}
                      value={rateType}
                      onChange={handleReactSelectChange}
                      isLoading={rateTypeLoading}
                    />
                  </div>
                );
              }
              if (
                item?.ControlDisplayID === "collectionBoy" &&
                isHideController("collectionBoy")
              ) {
                return (
                  <div className="col-sm-2 mb-1" key={index}>
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
                item?.ControlDisplayID === "DoctorName" &&
                isHideController("DoctorName")
              ) {
                return (
                  <div className="col-sm-2" key={index}>
                    <Input
                      type="text"
                      placeholder=" "
                      lable="Refer Doctor"
                      id="DoctorName"
                      name="DoctorName"
                      value={payload?.DoctorName}
                      onKeyDown={(e) => handleIndexNew(e, "DoctorName")}
                      onBlur={(e) => {
                        autocompleteOnBlur(setDoctorSuggestion);
                        setTimeout(() => {
                          const data = doctorSuggestion?.filter(
                            (ele) => ele?.Name === e.target.value,
                          );
                          if (data?.length === 0)
                            setPayload({ ...payload, DoctorName: "" });
                        }, 500);
                      }}
                      autoComplete="off"
                      onChange={handleChange}
                    />
                    {dropFalse && doctorSuggestion?.length > 0 && (
                      <ul
                        className="suggestion-data"
                        style={{ top: "26px", right: "0px" }}
                      >
                        {doctorSuggestion?.map((data, index) => (
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
                );
              }
              if (
                item?.ControlDisplayID === "TestName" &&
                isHideController("TestName")
              ) {
                return (
                  <div className="col-sm-2" key={index}>
                    <Input
                      type="text"
                      name="TestName"
                      lable="Search By Test Name"
                      id="TestName"
                      value={payload?.TestName}
                      placeholder=" "
                      onChange={handleChange}
                      onKeyDown={(e) => handleIndexNew(e, "TestName")}
                      onBlur={() => autocompleteOnBlur(setTestSuggestion)}
                    />
                    {selects &&
                      TestSuggestion.length > 0 &&
                      payload?.TestName && (
                        <ul className="suggestion-data">
                          {TestSuggestion.map((data, index) => (
                            <li
                              onClick={() =>
                                handleListSearchNew(data, "TestName")
                              }
                              className={`${index === indexMatch && "matchIndex"}`}
                              key={index}
                            >
                              {data?.label}
                            </li>
                          ))}
                        </ul>
                      )}
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
                      className="custom-calendar"
                      id="FromDate"
                      lable="FromDate"
                      value={payload?.FromDate}
                      onChange={dateSelect}
                      maxDate={new Date(payload?.ToDate)}
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
                    <DatePicker
                      className="custom-calendar"
                      name="ToDate"
                      value={payload?.ToDate}
                      onChange={dateSelect}
                      placeholder=" "
                      id="ToDate"
                      lable="ToDate"
                      maxDate={new Date()}
                      minDate={new Date(payload?.FromDate)}
                    />
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
              if (
                item?.ControlDisplayID === "SampleStatus" &&
                isHideController("SampleStatus")
              ) {
                return (
                  <div className="col-sm-2" key={index}>
                    <SelectBox
                      options={sampleStatusOptions()}
                      onChange={handleChange}
                      id="SampleStatus"
                      lable="SampleStatus"
                      name="SampleStatus"
                      selectedValue={payload?.SampleStatus}
                    />
                  </div>
                );
              }
              if (
                item?.ControlDisplayID === "Urgent" &&
                isHideController("Urgent")
              ) {
                return (
                  <div
                    className="col-auto d-flex align-items-center justify-content-center p-2"
                    style={{ gap: "5px" }}
                    key={index}
                  >
                    <label className="switch mb-0">
                      <input
                        type="checkbox"
                        checked={payload.Urgent === 1}
                        onChange={() => handleToggle("Urgent")}
                      />
                      <span className="slider"></span>
                    </label>
                    <strong>
                      <span>{t("IsUrgent")}</span>
                    </strong>
                  </div>
                );
              }
              return null;
            })}
          <div className="col-sm-1">
            <SearchButton
              text={"Search"}
              onClick={() => TableData(payload?.SampleStatus)}
            />
          </div>
        </div>
      </Accordion>

      {originalTableData?.length > 0 && (
        <div
          className="d-flex align-items-center flex-wrap px-3 py-2"
          style={{
            gap: "8px",
            background: "#f8f9fa",
            borderRadius: "6px",
            marginBottom: "4px",
            border: "1px solid #e2e6ea",
          }}
        >
          <strong style={{ fontSize: "12px", marginRight: "4px" }}>
            {t("Sample Status")}:
          </strong>
          {sampleStatusOptions().map((sItem, idx) => (
            <TableFilterDot
              key={idx}
              color={getStatusColorLocal(sItem?.value)}
              title={`${sItem?.label} (${statusCount(sItem?.value)})`}
              onClick={() => filterStatusWise(sItem?.value)}
              bgColor="#e9e2e1"
            />
          ))}
        </div>
      )}

      <Accordion
        title={t("Search Data")}
        defaultValue={true}
        seconTitle={
          <div className="ml-auto d-flex align-items-center px-2 mt-1">
            <div className="d-flex align-items-center mr-2" style={{ gap: "10px", fontSize: "12px" }}>

              <div className="d-flex align-items-center" style={{ gap: "4px" }}>
                <i
                  className="fa bi-file-earmark-pdf text-primary"
                  style={{ fontSize: "14px" }}
                />
                <span>View Attachments</span>
              </div>

              <div className="d-flex align-items-center" style={{ gap: "4px" }}>
                <img src={Urgent} className="sizeicon" />
                <span>Urgent</span>
              </div>

              <div className="d-flex align-items-center" style={{ gap: "4px" }}>
                <i
                  className="bi bi-shield-fill-check vip-font-size mb-0"
                  style={{ color: "#FFC107" }}
                />
                <span>VIP Patient</span>
              </div>

            </div>
            <Input
              type="text"
              name="searchTerm"
              id="searchTerm"
              placeholder="Search..."
              value={searchTerm}
              onChange={handleChangeSearch}
            />
          </div>
        }
      >
        {load ? (
          <Loading />
        ) : (
          <>
            {currentTableTestData?.length > 0 ? (
              <div>
                <div className="row p-2">
                  <div className="col-12">
                    <Tables removeScrollOverFlow={isResponsiveMode}>
                      {renderDynamicThead()}
                      <tbody className="skweoi">
                        {renderGroupedRows(
                          groupByPatient(currentTableTestData),
                        )}
                      </tbody>
                    </Tables>
                  </div>
                </div>

                <div className="row justify-content-between px-3">
                  <>
                    {[3, 10].includes(parseInt(payload?.SampleStatus)) && (
                      <>
                        <div className="col-sm-2">
                          <SelectBox
                            selectedValue={ApprovedBy}
                            id="ApprovedBy"
                            lable="ApprovedBy"
                            options={doctorAdmin}
                            name="ApprovedBy"
                            onChange={handleDoctorName}
                          />
                        </div>
                        <div className="col-sm-2">
                          <CustomButton
                            text={"Approve"}
                            onClick={ApproveAllTest}
                            className="btn-success"
                          />
                        </div>
                      </>
                    )}
                    {[5, 6].includes(parseInt(payload?.SampleStatus)) && (
                      <div
                        className="d-flex"
                        style={{
                          gap: "5px",
                        }}
                      >
                        <CustomButton
                          text={"Bulk Download (Without LetterHead)"}
                          icon={"download"}
                          className="btn-success"
                          disabled={
                            filterOutChecked(currentTableTestData, "TestID")
                              .length > 0
                              ? false
                              : true
                          }
                          onClick={() => {
                            if (downloadLoad)
                              toast.warn("Please wait Generating Report");
                            else
                              handleBulkDownload({
                                letterHead: 0,
                                Signature: 0,
                              });
                          }}
                        />
                        <CustomButton
                          text={"Bulk Download (LetterHead)"}
                          icon={"download"}
                          className="btn-success"
                          disabled={
                            filterOutChecked(currentTableTestData, "TestID")
                              .length > 0
                              ? false
                              : true
                          }
                          onClick={() => {
                            if (downloadLoad)
                              toast.warn("Please wait Generating Report");
                            else
                              handleBulkDownload({
                                letterHead: 1,
                                Signature: 0,
                              });
                          }}
                        />
                        <CustomButton
                          text={"Bulk Email"}
                          icon={"mail"}
                          disabled={
                            filterOutChecked(currentTableTestData, "TestID")
                              .length > 0
                              ? false
                              : true
                          }
                          onClick={() =>
                            setBulkEmailModalState({
                              modal: true,
                              data: currentTableTestData,
                              type: "EmailSend",
                            })
                          }
                        />
                      </div>
                    )}
                    <div className="col-sm-6 mb-1" style={{ textAlign: "end" }}>
                      <Pagination
                        className="pagination-bar"
                        currentPage={currentPage}
                        totalCount={tableData?.length}
                        pageSize={PageSize}
                        onPageChange={(page) => setCurrentPage(page)}
                      />
                    </div>
                  </>
                </div>
              </div>
            ) : (
              <NoRecordFound />
            )}
          </>
        )}
      </Accordion>

      {modal && (
        <CustomModal
          show={modal}
          visitID={visitID}
          onHide={() => setModal(false)}
        />
      )}
      {customizeDateModal?.show && (
        <CustomDateModal
          show={customizeDateModal?.show}
          data={customizeDateModal?.TestId}
          onHide={() => setCustomizeDateModal({ show: false, TestId: "" })}
        />
      )}
      {bulkDownloadtypeState && (
        <BulkDownloadType
          show={bulkDownloadtypeState}
          onHide={() => setBulkDownloadtypeState(false)}
          onSubmit={handleBulkDownload}
        />
      )}
      {BulkEmailModalState?.modal && (
        <BulkEmailModal
          data={BulkEmailModalState}
          onHide={() =>
            setBulkEmailModalState({ modal: false, data: [], type: "" })
          }
        />
      )}
      {show && (
        <ResultModal show={show} setshow={setshow} observationData={resdata} />
      )}
    </div>
  );
};

export default BulkActivity;
