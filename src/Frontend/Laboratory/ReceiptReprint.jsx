import React, { useEffect, useMemo, useState } from "react";
import moment from "moment";
import { useNavigate, useLocation } from "react-router-dom";
import { Tooltip } from "primereact/tooltip";
import { axiosInstance, axiosReport } from "../../utils/axiosInstance";
import {
  AddBlankData,
  AllDataDropDownPayload,
  Time,
  autocompleteOnBlur,
  formatCurrency,
  getMaxToDate,
  number,
  shouldIncludeAIIMSID,
} from "../../utils/helpers";
import {
  BindEmployeeReports,
  getCollectionBoy,
  getDoctorSuggestion,
  getPaymentModes,
  getSearchController,
} from "../../utils/NetworkApi/commonApi";
import { defaultSearchTypes, Record, SearchBy } from "../../utils/Constants";
import Input from "../../components/formComponent/Input";
import { SelectBox } from "../../components/formComponent/SelectBox";
import DatePicker from "../../components/formComponent/DatePicker";
import CustomTimePicker from "../../components/formComponent/TimePicker";
import Loading from "../../components/loader/Loading";
import Heading from "../../components/UI/Heading";
import Accordion from "@app/components/UI/Accordion";
import MedicialModal from "../utils/MedicialModal";
import UploadFile from "../utils/UploadFileModal/UploadFile";
import { useTranslation } from "react-i18next";
import ReceiptReprintTable from "../Table/ReceiptReprintTable";
import Pagination from "../../Pagination/Pagination";
import ReceiptReprintFilter from "./ReceiptReprintFilter";
import { useLocalStorage } from "../../utils/hooks/useLocalStorage";
import ReactSelect from "../../components/formComponent/ReactSelect";
import { SelectBoxWithCheckbox } from "../../components/formComponent/MultiSelectBox";
import { SearchButton, CustomButton } from "../../components/UI/CustomButton";
import { Form } from "react-bootstrap";
import { current } from "@reduxjs/toolkit";
import ReprintModal from "./ReprintModal";
import Urgent from ".././Images/urgent.gif";
import PageControlGear from "../../components/PageGearModel/PageControlGear";
import { toast } from "react-toastify";
import "../Table/ReceiptReprintTable.css";
const ReceiptReprint = () => {
  const location = useLocation();
  const [columnConfig, setColumnConfig] = useState([]);
  const [RateTypes, setRateTypes] = useState([]);
  const [CentreData, setCentreData] = useState([]);
  const [DepartmentData, setDepartmentData] = useState([]);
  // Options for the new Visit Type filter — same shared helper/endpoint
  // (Centre/visitTypeList) ClientWiseBusinessReport.jsx already uses for its
  // own Visit Type dropdown, not the empty, never-populated local list of
  // the same name in PatientRegistration.jsx.
  const [VisitType, setVisitType] = useState([]);
  const [user, SetUser] = useState([]);
  const [receiptData, setReceiptData] = useState([]);
  const [receiptAmout, setRecieptAmout] = useState(0);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [rateTypeLoading, setRateTypeLoading] = useState(false);
  const {
    EmployeeID,
    ShowRePrintTotal,
    HideRePrintColorCode,
    ShowAllCheckBarcodeOption,
    ShowUserFilterAtReprint,
    MaxDateRangeatResultEntry,
    DefaultCurrencyName,
    AllowExcelonRePrint,
    AllowPDFonReprint
  } = useLocalStorage("userData", "get");
  const maxRange = Number(MaxDateRangeatResultEntry) || 15;
  const hideRate = useLocalStorage("userData", "get")?.HideRate;
  const { RateTypeID, DoctorId } = useLocalStorage("userData", "get");
  const [doctorSuggestion, setDoctorSuggestion] = useState([]);
  const [indexMatch, setIndexMatch] = useState(0);
  const [t] = useTranslation();
  const [Identity, setIdentity] = useState([]);
  const [dropFalse, setDropFalse] = useState(true);
  const [proEmployee, setProEmployee] = useState([]);
  const [collectionBoy, setCollectionBoy] = useState();
  const [collectionBoyList, setCollectionBoyList] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const PAGE_ID = "7";
  let isTrueCheckBarcodeOption =
    ShowAllCheckBarcodeOption == 1 && defaultSearchTypes == "BarcodeNo";
  const [checkBarcodeOption, setCheckBarcodeOption] = useState(
    isTrueCheckBarcodeOption,
  );
  const [currentStatus, setCurrentStatus] = useState("All");
  const [state, setState] = useState({
    ProEmployee: "",
  });
  const [loadingExcel, setLoadingExcel] = useState(false);
  const [loadingPdf, setLoadingPdf] = useState(false);
    const isMobile = window.innerWidth < 768;
  const [viewMode, setViewMode] = useState(isMobile ? "card" : "table");

  const buildExportPayload = () => ({
    ShowAllCheckBarcodeOption: checkBarcodeOption ? 1 : 0,
    CentreID: formData.CentreID
      ? [Number(formData.CentreID)]
      : CentreData.map((ele) => Number(ele.value)),
    CollectionBoyID: Number(collectionBoy || 0),
    SelectTypes: formData.SelectTypes,
    ItemValue: formData.ItemValue.trim(),
    RateTypeID: formData?.RateTypeID ? [Number(formData?.RateTypeID)] : [],
    DoctorReferal: formData.DoctorReferal,
    FromDate: moment(formData.FromDate).format("DD/MMM/YYYY"),
    ToDate: moment(formData.ToDate).format("DD/MMM/YYYY"),
    FromTime: formData.FromTime,
    ToTime: formData.ToTime,
    User: formData?.User,
    Status: currentStatus,
    ProEmployeeID: Number(state?.ProEmployee || 0),
    DepartmentID: formData?.DepartmentID?.length ? formData.DepartmentID : [],
    // NEW — Lab/getReceiptReprint and its Excel/PDF export siblings don't
    // accept/use this filter yet, see
    // backend-docs/backend-reprint-visit-type-filter.md. Must be a string
    // (bare id, "" for no filter) — String() guards against a stray
    // numeric value ever reaching the backend as a raw JSON number.
    VisitType: formData?.VisitType ? String(formData.VisitType) : "",
  });

  const handleExportExcel = () => {
    setLoadingExcel(true);
    axiosReport
      .post("ReceiptReprint/GetReceiptReprintExcel", buildExportPayload(), {
        responseType: "blob",
      })
      .then((res) => {
        if (!res.data || res.data.size === 0) {
          toast.warn("No data available to export");
          return;
        }
        const url = window.URL.createObjectURL(res.data);
        const link = document.createElement("a");
        link.href = url;
        link.download = "ReceiptReprint.xlsx";
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
      })
      .catch(() => toast.error("Failed to generate Excel."))
      .finally(() => setLoadingExcel(false));
  };
  const companyid = useLocalStorage
  ("userData", "get")?.CompanyID;

  const handleExportPDF = () => {
    setLoadingPdf(true);
    axiosReport
      .post("ReceiptReprint/GetReceiptReprintPdf", buildExportPayload(), {
        responseType: "blob",
      })
      .then((res) => {
        if (!res.data || res.data.size === 0) {
          toast.warn("No data available to export");
          return;
        }
        const url = window.URL.createObjectURL(res.data);
        window.open(url, "_blank");
      })
      .catch(() => toast.error("Failed to generate PDF."))
      .finally(() => setLoadingPdf(false));
  };

  // ── Dynamic Controller State ──────────────────────────────────────────────
  const [controllerDynamicList, setControllerDynamicList] = useState([]);
  const [tabbingOrder, setTabbingOrder] = useState([]);
  const [FilterData, setFilterData] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredReceiptData, setFilteredReceiptData] = useState([]);

  const [show4, setShow4] = useState({
    modal: false,
    data: "",
    index: -1,
  });
  const [show5, setShow5] = useState({
    modal: false,
    data: "",
    index: -1,
  });
  const [show6, setShow6] = useState({
    modal: false,
    data: "",
    index: -1,
  });
  const [showColumnModal, setShowColumnModal] = useState(false);
  const navigate = useNavigate();
  const today = new Date();
  const [formData, setFormData] = useState({
    FromDate: new Date(),
    ToDate: new Date(),
    CentreID: "",
    ItemValue: "",
    RateTypeID: "",
    SelectTypes: defaultSearchTypes || "",
    FromTime: "00:00:00",
    ToTime: "23:59:59",
    DoctorReferal: "",
    DoctorName: "",
    User: "",
    Status: "",
    DepartmentID: [],
    VisitType: "",
  });
  const [pageSize, setPageSize] = useState(200);
  const [currentPage, setCurrentPage] = useState(1);
  const [reprintResponse, setReprintResponse] = useState(null);

  const paginationShow = useMemo(() => {
    return totalCount > 0 ? true : false;
  }, [totalCount]);

  const validation = () => {
    let error = "";
    if (
      formData?.SelectTypes.trim() !== "" &&
      formData?.ItemValue.trim() === ""
    ) {
      error = { ...error, ItemValue: "Please Choose Value" };
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

  const handleListSearch = (data, name) => {
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
      default:
        break;
    }
  };

  const handleKeyDown = (e) => {
    if (e?.key === "Enter") {
      setCurrentPage(1);
      setCurrentStatus("All");
      TableData("All", 1);
    }
  };

  const handleToggleChange = (e) => {
    const { checked } = e.target;
    setCheckBarcodeOption(checked);
  };

  const handleSearchSelectChange = (label, value) => {
    if (label === "CentreID") {
      setFormData({ ...formData, [label]: value?.value, RateTypeID: "" });
      setRateTypes([]);
      if (value?.value == "") {
        fetchRateTypes(CentreData.map((ele) => ele.value), true);
      } else {
        fetchRateTypes([value?.value], true);
      }
    } else if (label === "User") {
      setFormData({ ...formData, ["User"]: String(value?.value) });
    } else {
      setFormData({ ...formData, [label]: value?.value });
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (name === "DoctorName") {
      setDropFalse(true);
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

  const TableData = (Status = currentStatus, page = currentPage, customFormData = null, size = pageSize) => {
    setLoading(true);
    const activeFormData = customFormData || formData;
    const rateTypes = RateTypes.map((item) => {
      return item?.value;
    });

    const stateToSave = {
      formData: activeFormData,
      currentPage: page,
      currentStatus: Status,
      pageSize: size,
      collectionBoy,
      state,
    };
    sessionStorage.setItem("receiptReprintSearchState", JSON.stringify(stateToSave));

    axiosInstance
      .post("Lab/getReceiptReprint", {
        ShowAllCheckBarcodeOption: checkBarcodeOption ? 1 : 0,
        CentreID: activeFormData.CentreID ? [Number(activeFormData.CentreID)] : [],
        CollectionBoyID: Number(collectionBoy || 0),
        SelectTypes: activeFormData.SelectTypes,
        ItemValue: activeFormData.ItemValue.trim(),
        RateTypeID: activeFormData?.RateTypeID ? [Number(activeFormData?.RateTypeID)] : [],
        DoctorReferal: activeFormData.DoctorReferal,
        FromDate: moment(activeFormData.FromDate).format("DD/MMM/YYYY"),
        ToDate: moment(activeFormData.ToDate).format("DD/MMM/YYYY"),
        FromTime: activeFormData.FromTime,
        ToTime: activeFormData.ToTime,
        User: activeFormData?.User,
        Status: Status,
        ProEmployeeID: Number(state?.ProEmployee || 0),
        departmentID: activeFormData?.DepartmentID?.length ? activeFormData.DepartmentID : [],
        // NEW — see backend-docs/backend-reprint-visit-type-filter.md.
        // Must be a string (bare id, "" for no filter) — String() guards
        // against a stray numeric value ever reaching the backend as a
        // raw JSON number.
        VisitType: activeFormData?.VisitType ? String(activeFormData.VisitType) : "",
        pageNumber: page || 1,
        pageSize: size,
      })
      .then((res) => {
        const data = res?.data?.message;
        setReceiptData(data);
        setRecieptAmout(res?.data?.data);
        setFilteredReceiptData(data);
        setSearchTerm("");
        setTotalCount(res?.data?.data?.totalRecords || 0);
        setLoading(false);
      })
      .catch((err) => {
        setReceiptData([]);
        setFilteredReceiptData([]);
        setLoading(false);
      });
  };

  useEffect(() => {
    const visitNo = location?.state?.data || location?.state?.VisitNo;
    if (!visitNo) return;
    const next = { ...formData, SelectTypes: "VisitNo", ItemValue: String(visitNo) };
    setFormData(next);
    TableData("All", 1, next);
  }, []);

  const handleReactSelectChange = (name, option) => {
    setCollectionBoy(option?.value);
  };

  const handleIndex = (e) => {
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
      case 40:
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
          handleListSearch(doctorSuggestion[indexMatch], "DoctorName");
        }
        setIndexMatch(0);
        break;
      default:
        break;
    }
  };

const handleUploadCount = (name, value, secondName) => {
    const data = [...receiptData];

    if (name === "UploadDocumentCount") {
      const idx = show5?.index;
      if (idx == null || idx === -1) return;   
      data[idx] = {
        ...data[idx],                         
        [name]: value,
        [secondName]: value === 0 ? 0 : 1,
      };
    } else {
      const idx = show4?.index;
      if (idx == null || idx === -1) return;
      data[idx] = {
        ...data[idx],                       
        [name]: value,
        [secondName]: value === 0 ? 0 : 1,
      };
    }

    setReceiptData(data);
  };

  const handleTime = (time, name) => {
    setFormData({ ...formData, [name]: time });
  };

  const fetchRateTypes = async (id, showLoader = false) => {
    if (showLoader) setRateTypeLoading(true);
    try {
      const res = await axiosInstance.post("Centre/BindRateTypeDropdown", {
        centreID: String(id) || 0,
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
      if (sessionStorage.getItem("receiptReprintSearchState")) {
        return;
      }
      if (list?.length === 1) {
        setFormData((prev) => ({ ...prev, RateTypeID: list?.[0]?.value }));
      }
    } catch (err) {
      console.log(err);
      if (showLoader) setRateTypeLoading(false);
    } finally {
      if (showLoader) setRateTypeLoading(false);
    }
  };

  const handleProEmployeeChange = (name, e) => {
    setState((prev) => ({ ...prev, [name]: e?.value }));
  };

  const handleSelectMultiChange = (select, name) => {
    const val = select?.map((ele) => ele?.value);
    setFormData((prev) => ({ ...prev, [name]: val }));
  };

  const getDepartment = () => {
    axiosInstance
      .get("Department/getDepartment")
      .then((res) => {
        const data = res.data.message;
        const DeptDataValue = data.map((ele) => ({
          value: ele.DepartmentID,
          label: ele.Department,
        }));
        setDepartmentData(DeptDataValue);
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

  // ── isHideController ──────────────────────────────────────────────────────
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

  // ── Dynamic Controller Fetch ──────────────────────────────────────────────
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

  useEffect(() => {
    getProEmployee();
    getCollectionBoy(setCollectionBoyList, true);
    getDepartment();
  }, []);

  const handleChangeSearch = (e) => {
    const value = e.target.value.toLowerCase();
    setSearchTerm(e.target.value);

    if (!value.trim()) {
      setFilteredReceiptData(receiptData);
      return;
    }

    const searchableKeys = [
      "Date",
      "LedgerTransactionNo",
      "PatientCode",
      "FirstName",
      "LastName",
      "Age",
      "RateType",
      "RateTypeCode",
      "RefferLabName",
      "DoctorName",
      "CreatedByName",
      "VisitType",
    ];

    const filtered = receiptData?.filter((row) =>
      searchableKeys.some((key) =>
        String(row[key] || "")
          .toLowerCase()
          .includes(value),
      ),
    );

    setFilteredReceiptData(filtered);
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
        if (sessionStorage.getItem("receiptReprintSearchState")) {
          return;
        }
        fetchRateTypes(allValues);
        if (CentreDataValue?.length == 1) {
          setFormData((prev) => ({
            ...prev,
            CentreID: CentreDataValue?.[0]?.value,
          }));
        }
      })
      .catch((err) => console.log(err));
  };

  // Options for the Visit Type filter. NOT commonApi.js's getVisitType()
  // (Centre/visitTypeList) — that endpoint doesn't return data here.
  // Global/getGlobalData with Type: "VisitType" is the endpoint actually
  // used/working for Visit Type elsewhere in this app (PatientRegistration.jsx,
  // Master/VisitTypeCategory.jsx) — just the options-list part, without
  // PatientRegistration.jsx's extra LTData-default-selection/VisitTypeCategory
  // side effects, which don't apply to a search filter.
  const fetchVisitTypeOptions = () => {
    axiosInstance
      .post("Global/getGlobalData", { Type: "VisitType" })
      .then((res) => {
        const data = res?.data?.message || [];
        setVisitType(
          data.map((ele) => ({
            // Backend expects VisitType as a bare id string (see
            // backend-docs/backend-reprint-visit-type-filter.md) — FieldID
            // comes back numeric from Global/getGlobalData, so stringify it
            // here, otherwise it's sent as a raw JSON number and
            // Lab/getReceiptReprint 400s on System.String conversion.
            value: String(ele.FieldID),
            label: ele.FieldDisplay,
          })),
        );
      })
      .catch((err) => {
        console.log(err);
        setVisitType([]);
      });
  };

  const getFilterResultOption = () => {
    axiosInstance
      .post("Lab/getFilterTableReprintData", {
        PageName: "Reprint",
        pageName: "Reprint",
        EmployeeId: EmployeeID?.toString() || "",
        employeeId: EmployeeID?.toString() || "",
        EmployeeID: EmployeeID?.toString() || "",
      })
      .then((res) => {
        let data = res?.data?.message;
        setColumnConfig(data);
      })
      .catch((err) => setColumnConfig([]));
  };

  useEffect(() => {
    getAccessCentres();
    BindEmployeeReports(SetUser);
    getFilterResultOption();
    getPaymentModes("RequiredAttachment", setIdentity);
    controllerDynamic();
    fetchVisitTypeOptions();

  }, []);

  useEffect(() => {
    getDoctorSuggestion(formData, setDoctorSuggestion, setFormData);
  }, [formData?.DoctorName]);

  const [selectedReceipt, setSelectedReceipt] = useState(null);
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [showSchedule, setShowSchedule] = useState(false);

  // const handleOpenSchedule = (data, index) => {
  //   setSelectedReceipt(data);
  //   setSelectedIndex(index);
  //   setShowSchedule(true);
  // };

  // const getReceipt = (id, index) => {

  //   if (printLoading.index === -1) {
  //     setPrintLoading({
  //       loading: true,
  //       index: index,
  //     });
  //     axiosReport
  //       .post(
  //         "getReceipt",
  //         { LedgerTransactionIDHash: id },
  //         { responseType: "blob" },
  //       )
  //       .then((res) => {
  //         const blob = new Blob([res.data], { type: "application/pdf" });
  //         const url = window.URL.createObjectURL(blob);
  //         window.open(url, "_blank");
  //         setPrintLoading({
  //           loading: false,
  //           index: -1,
  //         });
  //       })
  //       .catch((err) => {
  //         setPrintLoading({
  //           loading: false,
  //           index: -1,
  //         });
  //         toast.error(
  //           err?.data?.response?.message
  //             ? err?.data?.response?.message
  //             : t("Error Occured"),
  //         );
  //       });
  //   } else {
  //     toast.warn("Please wait Generating Receipt");
  //   }
  // };

  const handleOpenSchedule = (data, index, type, phead = 0) => {
    setSelectedReceipt({
      hash: data?.LedgertransactionIDHash || data?.LedgerTransactionIDHash,
      index: index,
      receiptType: type,
      PHead: phead,
    });
    setShowSchedule(true);
  };
  const handleCloseSchedule = () => {
    setShowSchedule(false);
  };

  return (
    <>
      {selectedReceipt && (
        <ReprintModal
          show={showSchedule}
          onHandleShow={handleCloseSchedule}
          id={selectedReceipt}
          onSuccess={(response) => {
            if (response?.success && selectedReceipt) {
              setReprintResponse({
                success: true,
                LedgertransactionIDHash: selectedReceipt.hash,
                index: selectedReceipt.index,
                type: selectedReceipt.receiptType,
                PHead: selectedReceipt.PHead === 1 ? 1 : 0,
              });
            }

            setShowSchedule(false);
          }}
        />
      )}
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
          ID={show4.ID}
          MedicalId={show4?.data}
          handleUploadCount={handleUploadCount}
        />
      )}

      {show5?.modal && (
        <UploadFile
          show={show5?.modal}
          handleClose={() => {
            setShow5({ modal: false, data: "", index: -1 });
          }}
          options={Identity}
          documentId={show5?.data}
          pageName="Patient Registration"
          handleUploadCount={handleUploadCount}
        />
      )}

      <Accordion
        name={t("Receipt Reprint")}
        defaultValue={true}
        isBreadcrumb={true}
        linkTo="/receiptreprint"
        seconTitle={
          <div style={{ marginLeft: "auto" }}>
            <PageControlGear pageId={PAGE_ID} />
          </div>
        }
      >
        <Heading defaultValue={true}
          title={t("Details: ")}
          secondTitle={
            <div
              className="link-title-container receipt-reprint-details-stats mt-2 d-flex align-items-center"
              id="pr_id_11"
              style={{ flexWrap: "wrap", rowGap: "4px", fontSize: "12px" }}
            >
              <label
                style={{
                  whiteSpace: "nowrap",
                  marginBottom: 0,
                }}
              >
                {t("Total Patient")} :
                <span className="text-danger" style={{ marginLeft: "6px" }}>
                  {totalCount}
                </span>
              </label>
              {ShowRePrintTotal == 1 && receiptData?.length > 0 && (
                <>
                  <span style={{ whiteSpace: "nowrap", marginRight: "6px" }}>
                    |
                  </span>
                  <label
                    style={{
                      whiteSpace: "nowrap",
                      marginBottom: 0,
                    }}
                  >
                    {t("Gross Amount")} :
                    <span className="text-danger" style={{ marginLeft: "6px" }}>
                     {hideRate == 0 ? formatCurrency(receiptAmout?.grossAmount) : "0.00"}
                    </span>
                  </label>
                  <span style={{ whiteSpace: "nowrap", marginRight: "6px" }}>
                    |
                  </span>
                  <label
                    style={{
                      whiteSpace: "nowrap",
                      marginBottom: 0,
                    }}
                  >
                    {t("Discount Amount")} :
                    <span className="text-danger" style={{ marginLeft: "6px" }}>
                      {hideRate == 0 ? formatCurrency(receiptAmout?.discountOnTotal) : "0.00"}
                    </span>
                  </label>
                  <span style={{ whiteSpace: "nowrap", marginRight: "6px" }}>
                    |
                  </span>
                  <label
                    style={{
                      whiteSpace: "nowrap",
                      marginBottom: 0,
                    }}
                  >
                    {t("Net Amount")} :
                    <span className="text-danger" style={{ marginLeft: "6px" }}>
                      {hideRate == 0 ? formatCurrency(receiptAmout?.netAmount) : "0.00"}
                    </span>
                  </label>
                  <span style={{ whiteSpace: "nowrap", marginRight: "6px" }}>
                    |
                  </span>
                  <label
                    style={{
                      whiteSpace: "nowrap",
                      marginBottom: 0,
                    }}
                  >
                    {t("Due Amount")} :
                    <span className="text-danger" style={{ marginLeft: "6px" }}>
                      {hideRate == 0 ? formatCurrency(receiptAmout?.dueAmount) : "0.00"}
                    </span>
                  </label>
                  <span style={{ whiteSpace: "nowrap", marginRight: "6px" }}>
                    |
                  </span>
                  <label
                    style={{
                      whiteSpace: "nowrap",
                      marginBottom: 0,
                    }}
                  >
                    {t("Paid Amount")} :
                    <span className="text-danger" style={{ marginLeft: "6px" }}>
                      {hideRate == 0 ? formatCurrency(receiptAmout?.adjustment) : "0.00"}
                    </span>
                  </label>
                  <span style={{ whiteSpace: "nowrap", marginRight: "6px" }}>
                    |
                  </span>
                  <label
                    style={{
                      whiteSpace: "nowrap",
                      marginBottom: 0,
                    }}
                  >
                    {t("Cash")} :
                    <span className="text-danger" style={{ marginLeft: "6px" }}>
                      {hideRate == 0 ? formatCurrency(receiptAmout?.cashAmt) : "0.00"}
                    </span>
                  </label>
                  <span style={{ whiteSpace: "nowrap", marginRight: "6px" }}>
                    |
                  </span>
                  <label
                    style={{
                      whiteSpace: "nowrap",
                      marginBottom: 0,
                    }}
                  >
                    {t("Online Payment")} :
                    <span className="text-danger" style={{ marginLeft: "6px" }}>
                      {hideRate == 0 ? formatCurrency(receiptAmout?.cpAmt) : "0.00"}
                    </span>
                  </label>
                </>
              )}

            </div>
          }

        />
        <div className="row gy-2 px-2 mt-2 mb-1">
          {/* ── Dynamic Controller rendered form fields (TypeId === 1) ── */}
          {controllerDynamicList
            ?.filter((item) => item?.TypeId === 1 && item?.IsShow === 1)
            ?.map((item, index) => {
              if (
                item?.ControlDisplayID === "SelectTypes" &&
                isHideController("SelectTypes")
              ) {
                return (
                  <div className="col-md-2" key={index}>
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
                          onChange={handleChange}
                        />
                      </div>
                      {ShowAllCheckBarcodeOption == 1 &&
                        formData?.SelectTypes == "BarcodeNo" && (
                          <>
                            <Tooltip
                              target="#ShowAllCheckBarcodeOption"
                              content={t("ShowAllCheckBarcodeOption")}
                              position="top"
                            />
                            <Form.Check
                              type="checkbox"
                              label=""
                              id="ShowAllCheckBarcodeOption"
                              checked={!!checkBarcodeOption}
                              onChange={handleToggleChange}
                              className="cursor-pointer"
                            />
                          </>
                        )}
                      <div style={{ width: "50%" }}>
                        {formData?.SelectTypes === "Mobile" ? (
                          <div style={{ width: "100%" }}>
                            <Input
                              type="number"
                              name="ItemValue"
                              max={10}
                              onKeyDown={handleKeyDown}
                              value={formData.ItemValue}
                              onChange={handleChange}
                              onInput={(e) => number(e, DefaultCurrencyName == "KES" ? 14 : 10)}
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
                              max={20}
                              onKeyDown={handleKeyDown}
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
                );
              }

              if (
                item?.ControlDisplayID === "CentreID" &&
                isHideController("CentreID")
              ) {
                return (
                  <div className="col-4 col-md-2 mt-2 mt-sm-0" key={index}>
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
                );
              }

              if (
                item?.ControlDisplayID === "RateTypeID" &&
                isHideController("RateTypeID")
              ) {
                return (
                  <div className="col-6 col-md-2 mt-2 mt-sm-0" key={index}>
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
                item?.ControlDisplayID === "DoctorName" &&
                isHideController("DoctorName")
              ) {
                return (
                  (RateTypeID > 0 || DoctorId > 0) && (
                    <div className="col-6 col-md-2 mt-2 mt-sm-0" key={index}>
                      <Input
                        type="text"
                        lable="Refer Doctor"
                        id="DoctorName"
                        name="DoctorName"
                        value={formData.DoctorName}
                        onChange={handleChange}
                        placeholder=" "
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
                        autoComplete="off"
                      />
                      {dropFalse &&
                        doctorSuggestion.length > 0 &&
                        formData.DoctorName && (
                          <ul className="suggestion-data">
                            {doctorSuggestion.map((data, index) => (
                              <li
                                onClick={() =>
                                  handleListSearch(data, "DoctorName")
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
                  )
                );
              }

              if (
                item?.ControlDisplayID === "User" &&
                isHideController("User")
              ) {
                return Number(ShowUserFilterAtReprint) ? (
                  <div className="col-6 col-md-2 mt-2 mt-sm-0" key={index}>
                    <ReactSelect
                      dynamicOptions={[
                        { label: "Select Employee", value: "" },
                        ...user,
                      ]}
                      name="User"
                      lable={t("Employee")}
                      id="Employee"
                      removeIsClearable={true}
                      placeholderName={t("Employee")}
                      value={formData?.User}
                      onChange={handleSearchSelectChange}
                    />
                  </div>
                ) : null;
              }

              if (
                item?.ControlDisplayID === "ProEmployee" &&
                isHideController("ProEmployee")
              ) {
                return (
                  (RateTypeID > 0 || DoctorId > 0) && (
                    <div className="col-6 col-sm-2 col-6 mt-2 mt-sm-0" key={index}>
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
                  )
                );
              }

              if (
                item?.ControlDisplayID === "CollectionBoy" &&
                isHideController("CollectionBoy")
              ) {
                return (
                  // (RateTypeID > 0 || DoctorId > 0) &&
                  <div className="col-6 col-sm-2 mt-2 mt-sm-0" key={index}>
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
                item?.ControlDisplayID === "FromDate" &&
                isHideController("FromDate")
              ) {
                return (
                  <div className="col-4 col-md-2 mt-2 mt-sm-0" key={index}>
                    <DatePicker
                      className="custom-calendar"
                      name="FromDate"
                      value={formData?.FromDate}
                      onChange={dateSelect}
                      placeholder=" "
                      id="FromDate"
                      lable="FromDate"
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
                  <div className="col-6 col-md-1 mt-2 mt-sm-0" key={index}>
                    <CustomTimePicker
                      name="FromTime"
                      placeholder="FromTime"
                      value={formData?.FromTime}
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
                  <div className="col-4 col-md-2 mt-2 mt-sm-0" key={index}>
                    <DatePicker
                      className="custom-calendar"
                      name="ToDate"
                      value={formData?.ToDate}
                      onChange={dateSelect}
                      placeholder=" "
                      id="ToDate"
                      lable="ToDate"
                      maxDate={getMaxToDate(formData?.FromDate, maxRange)}
                      minDate={new Date(formData?.FromDate)}
                    />
                  </div>
                );
              }

              if (
                item?.ControlDisplayID === "ToTime" &&
                isHideController("ToTime")
              ) {
                return (
                  <div className="col-6 col-md-1 mt-2 mt-sm-0" key={index}>
                    <CustomTimePicker
                      name="ToTime"
                      placeholder="ToTime"
                      value={formData?.ToTime}
                      id="ToTime"
                      lable="ToTime"
                      onChange={handleTime}
                    />
                  </div>
                );
              }

              if (
                item?.ControlDisplayID === "Department" &&
                isHideController("Department")
              ) {
                return (
                  <div className="col-6 col-md-2 mt-2 mt-sm-0" key={index}>
                    <SelectBoxWithCheckbox
                      name="DepartmentID"
                      onChange={handleSelectMultiChange}
                      options={DepartmentData}
                      placeholder={t("Department")}
                      lable={t("Department")}
                      id="Department"
                      value={formData?.DepartmentID}
                    />
                  </div>
                );
              }

              // NEW — only actually renders once the backend's Page
              // Controller config for PAGE_ID "7" has a
              // ControlDisplayID: "VisitType" (TypeId 1) row; see
              // backend-docs/backend-reprint-visit-type-filter.md.
              if (
                item?.ControlDisplayID === "VisitType" &&
                isHideController("VisitType")
              ) {
                return (
                  <div className="col-6 col-md-2 mt-2 mt-sm-0" key={index}>
                    <ReactSelect
                      dynamicOptions={[
                        { label: t("All Visit Type"), value: "" },
                        ...VisitType,
                      ]}
                      name="VisitType"
                      lable={t("Visit Type")}
                      id="VisitType"
                      removeIsClearable={true}
                      placeholderName={t("Visit Type")}
                      value={formData?.VisitType}
                      onChange={handleSearchSelectChange}
                    />
                  </div>
                );
              }

              if (
                item?.ControlDisplayID === "Search" &&
                isHideController("Search")
              ) {
                return (
                  <div className="col-auto col-md-auto mt-2 mt-sm-0" key={index}>
                    <SearchButton
                      text="Search"
                      value={"Search"}
                      id="btnSearch"
                      onClick={() => {
                        setCurrentStatus("All");
                        setCurrentPage(1);
                        TableData("All", 1);
                      }}
                    />
                  </div>
                );
              }

              if (
                item?.ControlDisplayID === "Excel" &&
                isHideController("Excel") &&
                AllowExcelonRePrint == 1
              ) {
                return (
                  <div className="col-auto col-md-auto mt-2 mt-sm-0" key={index}>
                    <CustomButton
                      text="Excel"
                      icon="excel"
                      loading={loadingExcel}
                      onClick={handleExportExcel}
                    />
                  </div>
                );
              }

              if (
                item?.ControlDisplayID === "PDF" &&
                isHideController("PDF") &&
                AllowPDFonReprint == 1
            ) {
                return (
                  <div className="col-auto col-md-auto mt-2 mt-sm-0" key={index}>
                    <CustomButton
                      text="PDF"
                      icon="pdf"
                      loading={loadingPdf}
                      onClick={handleExportPDF}
                    />
                  </div>
                );
              }

              return null;
            })}

          {/* Fallback: render all original fields if no controller data available */}
          {!controllerDynamicList?.length && (
            <>
              <div className="col-md-2">
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
                      onChange={handleChange}
                    />
                  </div>
                  {ShowAllCheckBarcodeOption == 1 &&
                    formData?.SelectTypes == "BarcodeNo" && (
                      <>
                        <Tooltip
                          target="#ShowAllCheckBarcodeOption"
                          content={t("ShowAllCheckBarcodeOption")}
                          position="top"
                        />
                        <Form.Check
                          type="checkbox"
                          label=""
                          id="ShowAllCheckBarcodeOption"
                          checked={!!checkBarcodeOption}
                          onChange={handleToggleChange}
                          className="cursor-pointer"
                        />
                      </>
                    )}
                  <div style={{ width: "50%" }}>
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
                          max={20}
                          onKeyDown={handleKeyDown}
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

              <div className="col-md-2">
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

              <div className="col-md-2">
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

              {RateTypeID > 0 ||
                (DoctorId > 0 && (
                  <div className="col-md-2">
                    <Input
                      type="text"
                      lable="Refer Doctor"
                      id="DoctorName"
                      name="DoctorName"
                      value={formData.DoctorName}
                      onChange={handleChange}
                      placeholder=" "
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
                      autoComplete="off"
                    />
                    {dropFalse &&
                      doctorSuggestion.length > 0 &&
                      formData.DoctorName && (
                        <ul className="suggestion-data">
                          {doctorSuggestion.map((data, index) => (
                            <li
                              onClick={() =>
                                handleListSearch(data, "DoctorName")
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
                ))}
              <div className="col-md-2">
                <SelectBoxWithCheckbox
                  name="DepartmentID"
                  onChange={handleSelectMultiChange}
                  options={DepartmentData}
                  placeholder={t("Department")}
                  lable={t("Department")}
                  id="Department"
                  value={formData?.DepartmentID}
                />
              </div>
              <div className="col-md-2">
                <ReactSelect
                  dynamicOptions={[
                    { label: t("All Visit Type"), value: "" },
                    ...VisitType,
                  ]}
                  name="VisitType"
                  lable={t("Visit Type")}
                  id="VisitType"
                  removeIsClearable={true}
                  placeholderName={t("Visit Type")}
                  value={formData?.VisitType}
                  onChange={handleSearchSelectChange}
                />
              </div>
              {Number(ShowUserFilterAtReprint) && (
                <div className="col-md-2">
                  <ReactSelect
                    dynamicOptions={[
                      { label: "Select Employee", value: "" },
                      ...user,
                    ]}
                    name="User"
                    lable={t("Employee")}
                    id="Employee"
                    removeIsClearable={true}
                    placeholderName={t("Employee")}
                    value={formData?.User}
                    onChange={handleSearchSelectChange}
                  />
                </div>
              )}
              {RateTypeID > 0 ||
                (DoctorId > 0 && (
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
                ))}
              {RateTypeID > 0 ||
                (DoctorId > 0 && (
                  <div className="col-sm-2">
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
                ))}
              <div className="col-md-2">
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
              <div className="col-md-1">
                <CustomTimePicker
                  name="FromTime"
                  placeholder="FromTime"
                  value={formData?.FromTime}
                  id="FromTime"
                  lable="FromTime"
                  onChange={handleTime}
                />
              </div>
              <div className="col-md-2">
                <DatePicker
                  className="custom-calendar"
                  name="ToDate"
                  value={formData?.ToDate}
                  onChange={dateSelect}
                  placeholder=" "
                  id="ToDate"
                  lable="ToDate"
                  maxDate={new Date()}
                  minDate={new Date(formData?.FromDate)}
                />
              </div>
              <div className="col-md-1">
                <CustomTimePicker
                  name="ToTime"
                  placeholder="ToTime"
                  value={formData?.ToTime}
                  id="ToTime"
                  lable="ToTime"
                  onChange={handleTime}
                />
              </div>
              
              <div className="col-md-1">
                <SearchButton
                  text="Search"
                  value={"Search"}
                  id="btnSearch"
                  onClick={() => {
                    setCurrentStatus("All");
                    setCurrentPage(1);
                    TableData("All", 1);
                  }}
                />
              </div>
              {AllowExcelonRePrint == 1 && (
                <div className="col-md-1">
                  <CustomButton
                    text="Excel"
                    icon="excel"
                    loading={loadingExcel}
                    onClick={handleExportExcel}
                  />
                </div>
              )}
              {AllowPDFonReprint == 1 && (
                <div className="col-md-1">
                  <CustomButton
                    text="PDF"
                    icon="pdf"
                    loading={loadingPdf}
                    onClick={handleExportPDF}
                  />
                </div>
              )}
            </>
          )}

          {/* Table / Card view toggle — outside the dynamic-controller-list
              rendering above so it always appears regardless of which
              path (dynamic vs fallback) rendered the search fields. */}
          

          {/* {HideRePrintColorCode != 1 && (
           <>
              <div
                onClick={() => {
                  setCurrentStatus("fullpaid");
                  setCurrentPage(1);
                  TableData("fullpaid", 1);
                }}
                className="col-md-1 d-flex"
              >
                <button
                  className="statusConfirmed"
                  style={{ backgroundColor: "#00FA9A" }}
                ></button>
                <label className="reprintLable" style={{ cursor: "pointer" }}>
                  {t("Full Paid")}
                </label>
              </div>
              <div
                onClick={() => {
                  setCurrentStatus("partialpaid");
                  setCurrentPage(1);
                  TableData("partialpaid", 1);
                }}
                className="col-md-1 d-flex"
              >
                <button
                  className="statusConfirmed"
                  style={{ backgroundColor: "#F6A9D1" }}
                ></button>
                <label className="reprintLable" style={{ cursor: "pointer" }}>
                  {t("Partial Paid")}
                </label>
              </div>
              <div
                onClick={() => {
                  setCurrentStatus("fullyunpaid");
                  setCurrentPage(1);
                  TableData("fullyunpaid", 1);
                }}
                className="col-md-1 d-flex"
              >
                <button
                  className="statusConfirmed"
                  style={{ backgroundColor: "#FF457C" }}
                ></button>
                <label className="reprintLable" style={{ cursor: "pointer" }}>
                  {t("Fully Unpaid")}
                </label>
              </div>
              <div
                onClick={() => {
                  setCurrentStatus("fullrefund");
                  setCurrentPage(1);
                  TableData("fullrefund", 1);
                }}
                className="col-md-1 d-flex"
              >
                <button
                  className="statusConfirmed"
                  style={{ backgroundColor: "#CEE1FF" }}
                ></button>
                <label className="reprintLable" style={{ cursor: "pointer" }}>
                  {t("Full Refund")}
                </label>
              </div>
              <div
                onClick={() => {
                  setCurrentStatus("credit");
                  setCurrentPage(1);
                  TableData("credit", 1); 
                }}
                className="col-md-1 d-flex"
              >
                <button
                  className="statusConfirmed"
                  style={{ backgroundColor: "#b3cdb3" }}
                ></button>
                <label className="reprintLable" style={{ cursor: "pointer" }}>
                  {t("Credit")}
                </label>
              </div>
            </>
          )} */}
          {HideRePrintColorCode != 1 && (
            <div
              className="d-flex flex-wrap align-items-center"
              style={{ gap: "6px 12px", padding: "4px 8px" }}
            >
              <div
                onClick={() => {
                  setCurrentStatus("fullpaid");
                  setCurrentPage(1);
                  TableData("fullpaid", 1);
                }}
                className="d-flex align-items-center"
                style={{
                  cursor: "pointer",
                  flexShrink: 0,
                  whiteSpace: "nowrap",
                }}
              >
                <button
                  className="statusConfirmed"
                  style={{ backgroundColor: "#00FA9A", flexShrink: 0 }}
                ></button>
                <label
                  className="reprintLable"
                  style={{
                    cursor: "pointer",
                    marginBottom: 0,
                    whiteSpace: "nowrap",
                  }}
                >
                  {t(" Paid")}
                </label>
              </div>

              <div
                onClick={() => {
                  setCurrentStatus("partialpaid");
                  setCurrentPage(1);
                  TableData("partialpaid", 1);
                }}
                className="d-flex align-items-center"
                style={{
                  cursor: "pointer",
                  flexShrink: 0,
                  whiteSpace: "nowrap",
                }}
              >
                <button
                  className="statusConfirmed"
                  style={{ backgroundColor: "#F6A9D1", flexShrink: 0 }}
                ></button>
                <label
                  className="reprintLable"
                  style={{
                    cursor: "pointer",
                    marginBottom: 0,
                    whiteSpace: "nowrap",
                  }}
                >
                  {t("Partial Paid")}
                </label>
              </div>

              <div
                onClick={() => {
                  setCurrentStatus("fullyunpaid");
                  setCurrentPage(1);
                  TableData("fullyunpaid", 1);
                }}
                className="d-flex align-items-center"
                style={{
                  cursor: "pointer",
                  flexShrink: 0,
                  whiteSpace: "nowrap",
                }}
              >
                <button
                  className="statusConfirmed"
                  style={{ backgroundColor: "#FF457C", flexShrink: 0 }}
                ></button>
                <label
                  className="reprintLable"
                  style={{
                    cursor: "pointer",
                    marginBottom: 0,
                    whiteSpace: "nowrap",
                  }}
                >
                  {t(" Unpaid")}
                </label>
              </div>

              <div
                onClick={() => {
                  setCurrentStatus("fullrefund");
                  setCurrentPage(1);
                  TableData("fullrefund", 1);
                }}
                className="d-flex align-items-center"
                style={{
                  cursor: "pointer",
                  flexShrink: 0,
                  whiteSpace: "nowrap",
                }}
              >
                <button
                  className="statusConfirmed"
                  style={{ backgroundColor: "#CEE1FF", flexShrink: 0 }}
                ></button>
                <label
                  className="reprintLable"
                  style={{
                    cursor: "pointer",
                    marginBottom: 0,
                    whiteSpace: "nowrap",
                  }}
                >
                  {t("Refund")}
                </label>
              </div>

              <div
                onClick={() => {
                  setCurrentStatus("credit");
                  setCurrentPage(1);
                  TableData("credit", 1);
                }}
                className="d-flex align-items-center"
                style={{
                  cursor: "pointer",
                  flexShrink: 0,
                  whiteSpace: "nowrap",
                }}
              >
                <button
                  className="statusConfirmed"
                  style={{ backgroundColor: "#b3cdb3", flexShrink: 0 }}
                ></button>
                <label
                  className="reprintLable"
                  style={{
                    cursor: "pointer",
                    marginBottom: 0,
                    whiteSpace: "nowrap",
                  }}
                >
                  {t("Credit")}
                </label>
              </div>
            </div>
          )}
        </div>
        <div
          className={`px-2 mt-1 mb-1 ${RateTypeID > 0 || DoctorId > 0 ? "flex-grow-1" : "row"}`}
        ></div>
      </Accordion>

      <Accordion
        className="rr-results-accordion receipt-reprint-results"
        title={
          <div className="d-flex align-items-center w-100">
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
          </div>
        }
        notOpen={true}
        defaultValue={true}
        // linkTo="#"
        // linkTitle={

        // }
        seconTitle={
          <div className="ml-auto d-flex align-items-center justify-content-between px-2">
            {!isMobile && (
            <div className="rr-legend d-flex align-items-center mr-2" style={{ gap: "10px", fontSize: "12px" }}>

              <div className="d-flex align-items-center" style={{ gap: "4px" }}>
                <i
                  className="fa bi-file-earmark-pdf text-primary"
                  style={{ fontSize: "14px" }}
                  title={t("View Attachments")}
                />
                <span className="rr-legend-text">View Attachments</span>
              </div>

              <div className="d-flex align-items-center" style={{ gap: "4px" }}>
                <img src={Urgent} className="sizeicon" title={t("Urgent")} />
                <span className="rr-legend-text">Urgent</span>
              </div>

              <div className="d-flex align-items-center" style={{ gap: "4px" }}>
                <i
                  className="bi bi-shield-fill-check vip-font-size mb-0"
                  style={{ color: "#FFC107" }}
                  title={t("VIP Patient")}
                />
                <span className="rr-legend-text">VIP Patient</span>
              </div>

            </div>
            )}
            <Input
              type="text"
              name="search"
              id="search"
              placeholder="Search..."
              value={searchTerm}
              onChange={handleChangeSearch}
            />
            {!isMobile && (
            <div className="col-md-auto mt-2 mt-sm-0 d-flex align-items-end">
            <div className="rr-view-toggle">
              <button
                type="button"
                className={`rr-view-toggle__btn ${viewMode === "table" ? "is-active" : ""}`}
                onClick={() => setViewMode("table")}
                title={t("Table View")}
              >
                <i className="fa fa-table" /> <span className="rr-toggle-text">{t("Table")}</span>
              </button>
              <button
                type="button"
                className={`rr-view-toggle__btn ${viewMode === "card" ? "is-active" : ""}`}
                onClick={() => setViewMode("card")}
                title={t("Card View")}
              >
                <i className="fa fa-th-large" /> <span className="rr-toggle-text">{t("Card")}</span>
              </button>
            </div>
          </div>
            )}
          </div>
        }
      >
        <div className="">
          {loading ? (
            <Loading />
          ) : (
            <>
              <ReceiptReprintTable
                viewMode={viewMode}
                Status={formData?.Status}
                handleOpenSchedule={handleOpenSchedule}
                TableData={TableData}
                show={setShow4}
                show2={setShow5}
                setReceiptData={setReceiptData}
                setRecieptAmout={setRecieptAmout}
                receiptAmout={receiptAmout}
                receiptData={searchTerm ? filteredReceiptData : receiptData}
                currentPage={currentPage}
                pageSize={pageSize}
                columnConfig={columnConfig}
                reprintResponse={reprintResponse}
                filterData={FilterData}
                showColumnModal={showColumnModal}
                setShowColumnModal={setShowColumnModal}
                getFilterResultOption={getFilterResultOption}
              />
              {paginationShow && receiptData?.length > 0 && (
                <div className="d-flex flex-wrap justify-content-end align-items-end gap-2">
                  <div style={{ minWidth: "110px" }}>
                    <ReactSelect
                      value={pageSize}
                      dynamicOptions={[
                        { label: "25", value: 25 },
                        { label: "50", value: 50 },
                        { label: "100", value: 100 },
                        { label: "150", value: 150 },
                        {label: "200", value: 200},
                      ]}
                      name="pageSize"
                      lable={t("Page Size")}
                      removeIsClearable={true}
                      onChange={(name, option) => {
                        const size = option?.value;
                        setPageSize(size);
                        setCurrentPage(1);
                        TableData(currentStatus, 1, null, size);
                      }}
                    />
                  </div>
                  <Pagination
                    className="pagination-bar mb-2"
                    currentPage={currentPage}
                    totalCount={totalCount}
                    pageSize={pageSize}
                    onPageChange={(page) => {
                      setCurrentPage(page);
                      TableData(currentStatus, page);
                    }}
                  />{" "}
                </div>
              )}
            </>
          )}
        </div>{" "}
      </Accordion>
    </>
  );
};

export default ReceiptReprint;
