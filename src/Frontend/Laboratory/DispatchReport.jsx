import React, { useEffect, useMemo, useState, useRef } from "react";
import moment from "moment";
import { useLocation, useNavigate } from "react-router-dom";
import {
  BindEmployeeReports,
  DepartmentWiseItemList,
  getCollectionBoy,
  getDoctorSuggestion,
  getPaymentModes,
  getSearchController,
} from "../../utils/NetworkApi/commonApi";
import { axiosInstance } from "../../utils/axiosInstance";
import {
  AddBlankData,
  AllDataDropDownPayload,
  Time,
  autocompleteOnBlur,
  getTrimmedData,
  number,
  shouldIncludeAIIMSID,
  ExportToExcel,
} from "../../utils/helpers";
import Accordion from "@app/components/UI/Accordion";

import { useTranslation } from "react-i18next";
import { SelectBox } from "../../components/formComponent/SelectBox";
import Input from "../../components/formComponent/Input";
import DispatchReportTable from "../Table/DispatchReportTable";
import {
  DateTypeSearch2,
  defaultSearchTypes,
  getStatusColor,
  SampleStatus,
  SearchBy,
  getAccurateAge,
} from "../../utils/Constants";
import DatePicker from "../../components/formComponent/DatePicker";
import CustomTimePicker from "../../components/formComponent/TimePicker";
import Loading from "../../components/loader/Loading";
import MedicialModal from "../utils/MedicialModal";
import Heading from "../../components/UI/Heading";
import UploadFile from "../utils/UploadFileModal/UploadFile";
import AutoComplete from "../../components/formComponent/AutoComplete";
import ReceiptReprintFilter from "./ReceiptReprintFilter";
import { useLocalStorage } from "../../utils/hooks/useLocalStorage";
import { Tooltip } from "primereact/tooltip";
import DispatchMoreFilter from "./DispatchMoreFilter";
import ReactSelect from "../../components/formComponent/ReactSelect";
import MultiBackGroundReactSelect from "./MultiBackGroundReactSelect";
import BulkEmailModal from "./BulkEmailModal";
import { Form } from "react-bootstrap";
import TableFilterDot from "../../components/TableFilter/TableFilterDot";
import Pagination from "../../Pagination/Pagination";
import { CustomButton, SearchButton } from "../../components/UI/CustomButton";
import { apiUrls } from "../../utils/apiUrls";
import Urgent from ".././Images/urgent.gif";
import PageControlGear from "../../components/PageGearModel/PageControlGear";
import { FaDownload } from "react-icons/fa";
import DispatchTableNew from "./DispatchReportTableNew";
import "../Table/ReceiptReprintTable.css";
const DispatchReport = () => {
  const tableRef = useRef();
  const [t] = useTranslation();
  const [pageSize, setPageSize] = useState(100);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [currentStatus, setCurrentStatus] = useState("All");
  const [selectedRowsCount, setSelectedRowsCount] = useState(0);
  const [globalData, setGlobalData] = useState({
    patientcount: 0,
  });
  const [selectedStatus, setSelectedStatus] = useState("");
  const {
    ShowAllCheckBarcodeOption,
    ShowDefaultLoginCentre,
    SessionRateTypeID,
    HideMacStatusFromDispatch,
    HideResultDoneStatusFromDispatch,
    DefaultDateTypeDispatchLabReport,
    DefaultCurrencyName,
    HideOutSourceColor,
    IsPaginationOnTop,
    DefaultSearchTypeValue
  } = useLocalStorage("userData", "get");
  console.log({DefaultSearchTypeValue})
  const DefaultCentre = useLocalStorage("DefaultCentre", "get");
  const userData = useLocalStorage("userData", "get");
  const DispatchScreenTableUI = userData?.DispatchScreenTableUI
  console.log("DispatchScreenTableUI", DispatchScreenTableUI);  
console.log("IsPaginationOnTop", IsPaginationOnTop);
  const [WardNoOptions, setWardNoOptions] = useState([]);
  const [CentreData, setCentreData] = useState([]);
  const [RateTypes, setRateTypes] = useState([]);
  const [DepartmentData, setDepartmentData] = useState([]);
  const [toggleDate, setToggleDate] = useState({
    FromDate: false,
    ToDate: false,
  });
  const [user, SetUser] = useState([]);
  const [TestSuggestion, setTestSuggestion] = useState([]);
  const [PackageSuggestion, setPackageSuggestion] = useState([]);
  const [dispatchData, setDispatchData] = useState([]);
  const [doctorSuggestion, setDoctorSuggestion] = useState([]);
  const [indexMatch, setIndexMatch] = useState(0);
  const [doctorIndexMatch, setDoctorIndexMatch] = useState(0);
  const [packageIndexMatch, setPackageIndexMatch] = useState(0);
  const [dropFalse, setDropFalse] = useState(true);
  const [allLabData, setAllLabData] = useState([]);
  const [originalTableData, setOriginalTableData] = useState([]);
  const [refLabList, setRefLabList] = useState([]);
  const PAGE_ID = "6";
  const [show, setShow] = useState({
    modal: false,
    data: "",
    index: -1,
  });
  const [showColumnModal, setShowColumnModal] = useState(false);
  // Below 767px the table/card toggle is hidden and card view is forced
  // (table columns don't fit a phone screen, and the toggle itself just
  // adds clutter) — see the .rr-view-toggle mobile rule in
  // ReceiptReprintTable.css.
  const [isMobileView, setIsMobileView] = useState(
    typeof window !== "undefined" ? window.innerWidth <= 767 : false,
  );
  const [viewMode, setViewMode] = useState(isMobileView ? "card" : "table");
  useEffect(() => {
    const handleResize = () => setIsMobileView(window.innerWidth <= 767);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);
  const effectiveViewMode = isMobileView ? "card" : viewMode;

  const [selects, setSelects] = useState(false);
  const [packageSelects, setPackageSelects] = useState(false);
  const [testCount, setTestCount] = useState(0);
  const [Identity, setIdentity] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const today = new Date();
  const [collectionBoy, setCollectionBoy] = useState();
  const [collectionBoyList, setCollectionBoyList] = useState([]);
  let isTrueCheckBarcodeOption =
    ShowAllCheckBarcodeOption == 1 && defaultSearchTypes == "BarcodeNo";
  const [checkBarcodeOption, setCheckBarcodeOption] = useState(
    isTrueCheckBarcodeOption,
  );
  const [defaultCentrePrefix, setDefaultCentrePrefix] = useState("");
  const [controllerDynamicList, setControllerDynamicList] = useState([]);
  const [filterData, setFilterData] = useState([]);
  const [tabbingOrder, setTabbingOrder] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [rateTypeLoading, setRateTypeLoading] = useState(false);

  const [showNewTable, setShowNewTable] = useState(DispatchScreenTableUI == "1" ? true : false);

  const [formData, setFormData] = useState({
    FromDate: new Date(),
    ToDate: new Date(),
    CentreID: "",
    ItemValue: "",
    RateID: "",
    SelectTypes: defaultSearchTypes || "",
    RefundFilter: null,
    FromTime: "00:00:00",
    ToTime: "23:59:59",
    DoctorReferal: "",
    DepartmentID: "",
    DoctorName: "",
    ReferLabId: 0,
    TestName: "",
    PackageName: "",
    InvestigationID: "",
    PackageItemID: "",
    DateTypeSearch: DefaultDateTypeDispatchLabReport || "Date",
    User: "",
    IsUrgent: "",
    WithoutnablLogo: "",
    SampleStatus: "",
    IsCourier: "",
    WardNo: "",
    ShowOnlyRemarks:0,
    HLMPatientType: "ALL",
  });
  const CompanyID = useLocalStorage("userData", "get")?.CompanyID;
  const ReferedByDoctorDesignationID = useLocalStorage(
    "userData",
    "get",
  )?.ReferedByDoctorDesignationID;
  const DesignationId = useLocalStorage("userData", "get")?.DesignationId;
  const [columnConfig, setColumnConfig] = useState([]);
  const [proEmployee, setProEmployee] = useState([]);
  const [state, setState] = useState({
    ProEmployee: "",
  });
  const [showRequiredError, setShowRequiredError] = useState(false);
  const filteredSampleStatus = SampleStatus?.filter((item) => {
    if (Number(HideMacStatusFromDispatch) && item.value === "13") return false; // Mac Data
    if (Number(HideResultDoneStatusFromDispatch) && item.value === "10")
      return false; // Result Done
    if (Number(HideOutSourceColor) && item.value === "25")
      return false;
    return true;
  });

  const handleToggleSetMaster = (e) => {
    const { name, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: checked ? 1 : 0,
    }));
  };

  const handleIndex = (e, name) => {
    switch (name) {
      case "DoctorName":
        switch (e.which) {
          case 38:
            if (doctorSuggestion.length > 0) {
              if (doctorIndexMatch !== 0) {
                setDoctorIndexMatch(doctorIndexMatch - 1);
              } else {
                setDoctorIndexMatch(doctorSuggestion.length - 1);
              }
              setTimeout(() => {
                const el = document.querySelector(".matchIndex");
                if (el) el.scrollIntoView({ block: "nearest" });
              }, 0);
            }
            break;
          case 40:
            if (doctorSuggestion.length > 0) {
              if (doctorSuggestion.length - 1 === doctorIndexMatch) {
                setDoctorIndexMatch(0);
              } else {
                setDoctorIndexMatch(doctorIndexMatch + 1);
              }
              setTimeout(() => {
                const el = document.querySelector(".matchIndex");
                if (el) el.scrollIntoView({ block: "nearest" });
              }, 0);
            }
            break;
          case 13:
            if (
              doctorSuggestion.length > 0 &&
              doctorSuggestion[doctorIndexMatch]
            ) {
              handleListSearch(doctorSuggestion[doctorIndexMatch], name);
            }
            setDoctorIndexMatch(-1);
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
              handleListSearch(TestSuggestion[indexMatch], name);
            }
            setIndexMatch(-1);
            break;
          default:
            break;
        }
        break;
      case "PackageName":
        switch (e.which) {
          case 38:
            if (PackageSuggestion.length > 0) {
              if (packageIndexMatch !== 0) {
                setPackageIndexMatch(packageIndexMatch - 1);
              } else {
                setPackageIndexMatch(PackageSuggestion.length - 1);
              }
              setTimeout(() => {
                const el = document.querySelector(".packageMatchIndex");
                if (el) el.scrollIntoView({ block: "nearest" });
              }, 0);
            }
            break;
          case 40:
            if (PackageSuggestion.length > 0) {
              if (PackageSuggestion.length - 1 === packageIndexMatch) {
                setPackageIndexMatch(0);
              } else {
                setPackageIndexMatch(packageIndexMatch + 1);
              }
              setTimeout(() => {
                const el = document.querySelector(".packageMatchIndex");
                if (el) el.scrollIntoView({ block: "nearest" });
              }, 0);
            }
            break;
          case 13:
            if (
              PackageSuggestion.length > 0 &&
              PackageSuggestion[packageIndexMatch]
            ) {
              handleListSearch(PackageSuggestion[packageIndexMatch], name);
            }
            setPackageIndexMatch(-1);
            break;
          default:
            break;
        }
        break;
      default:
        break;
    }
  };
  const navigate = useNavigate();
  const location = useLocation();
  const [show4, setShow4] = useState({
    modal: false,
    data: "",
    index: -1,
    ID: 0,
  });

  /////hide field according to designation//////

  const handleListSearch = (data, name) => {
    switch (name) {
      case "DoctorName":
        setFormData({
          ...formData,
          [name]: data.Name,
          DoctorReferal: data.Name ? data.DoctorReferalID : "",
        });
        setDoctorIndexMatch(0);
        setDoctorSuggestion([]);
        setDropFalse(false);
        break;

      case "TestName":
        setFormData({
          ...formData,
          [name]: data?.TestName,
          InvestigationID: data?.InvestigationID || "",
        });
        setIndexMatch(0);
        setSelects(false);
        setTestSuggestion([]);
        break;
      case "PackageName":
        setFormData({
          ...formData,
          [name]: data?.TestName,
          PackageItemID: data?.InvestigationID || "",
        });
        setPackageIndexMatch(0);
        setPackageSelects(false);
        setPackageSuggestion([]);
        break;
      default:
        break;
    }
  };

  const handleUploadCount = (name, value, secondName) => {
    let data = [...dispatchData];
    if (name === "UploadDocumentCount") {
      data[show?.index][name] = value;
      data[show?.index][secondName] = value === 0 ? 0 : 1;
      setDispatchData(data);
    } else {
      data[show4?.index][name] = value;
      data[show4?.index][secondName] = value === 0 ? 0 : 1;
      setDispatchData(data);
    }
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
    getDoctorSuggestion(formData, setDoctorSuggestion, setFormData);
    getRefLabList();
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

  const dateSelect = (value, name) => {
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleKeyDown = (e) => {
    if (e?.key === "Enter") {
      TableData("");
      setCurrentStatus("");
    }
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

  const handleSearchSelectChange = (label, value) => {
    if (label === "CentreID") {
      setFormData({ ...formData, [label]: value?.value, RateTypeID: "" });

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

  ////////getproemployee///
  const handleProEmployeeChange = (name, e) => {
    setState((prev) => ({ ...prev, [name]: e?.value }));
  };
  const handleReactSelectChange = (name, e) => {
    if (name == "DateTypeSearch") {
      setFormData((prev) => ({ ...prev, [name]: e?.value }));
      return;
    }
    setCollectionBoy(e?.value);
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
    axiosInstance
      .get("Centre/getGlobalCentres")
      .then((res) => {
        const centres = res?.data?.message || [];
        // use whichever centre is currently selected globally (top-nav
        // centre switcher), not a centre flagged as the org-wide default
        const centreForPrefix = centres.find(
          (c) => String(c?.CentreID) === String(DefaultCentre),
        );
        setDefaultCentrePrefix(centreForPrefix?.Prefix || "");
      })
      .catch((err) => console.log(err));
  }, [DefaultCentre]);

  useEffect(() => {
    getProEmployee();
    getCollectionBoy(setCollectionBoyList, true);
  }, []);

  const handleSelectChange = (event) => {
    const { name, value, checked, type } = event?.target;
    if (name === "IsUrgent") {
      setFormData({
        ...formData,
        [name]: type === "checkbox" ? checked : value,
      });
    } else if (name === "WithoutnablLogo") {
      setFormData({
        ...formData,
        [name]: type === "checkbox" ? checked : value,
      });
    } else if (name === "IsCourier") {
      setFormData({
        ...formData,
        [name]: type === "checkbox" ? checked : value,
      });
    } else if (name === "ShowOnlyRemarks") {
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
    }
    else {
      setFormData({ ...formData, [name]: value });
    }
    if (
      CompanyID == 369 &&
      name === "SelectTypes" &&
      value &&
      formData.ItemValue?.toString().trim()
    ) {
      setShowRequiredError(false);
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

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name == "TestName") {
      if (value == "") {
        setSelects(false);
        setTestSuggestion([]);
      } else {
        setSelects(true);
        setTestSuggestion((prev) =>
          prev.filter((ele) => {
            return ele.TestName?.toLowerCase().includes(value.toLowerCase());
          }),
        );
      }
      setFormData({ ...formData, [name]: value, InvestigationID: "" });
    } else if (name == "PackageName") {
      if (value == "") {
        setPackageSelects(false);
        setPackageSuggestion([]);
      } else {
        setPackageSelects(true);
        setPackageSuggestion((prev) =>
          prev.filter((ele) => {
            return ele.TestName?.toLowerCase().includes(value.toLowerCase());
          }),
        );
      }
      setFormData({ ...formData, [name]: value, PackageItemID: "" });
    } else if (name == "DoctorName") {
      if (value == "") {
        setDoctorSuggestion([]);
      } else {
        setDoctorSuggestion((prev) =>
          prev.filter((ele) =>
            ele.Name?.toLowerCase().includes(value.toLowerCase()),
          ),
        );
      }
      setFormData({ ...formData, [name]: value });
    } else {
      setFormData({ ...formData, [name]: value });
    }
    if (
      CompanyID == 369 &&
      name === "ItemValue" &&
      value.toString().trim() !== "" &&
      formData.SelectTypes
    ) {
      setShowRequiredError(false);
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
          const selectedCentre = DefaultCentre || data?.[0]?.DefaultCentreId;
          setFormData((prev) => ({
            ...prev,
            CentreID: selectedCentre || "",
          }));
          fetchRateTypes(selectedCentre ? [selectedCentre] : allValues, true);
        } else {
          fetchRateTypes(allValues, true);
        }
        if (CentreDataValue?.length == 1) {
          setFormData((prev) => ({
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
  const User = localStorage.getItem("User") ? true : false;
  const API_DATA = (() => { try { const r = localStorage.getItem("data"); return r && r !== "undefined" ? JSON.parse(r) : null; } catch { return null; } })();
  const paginationShow = useMemo(() => {
    return totalCount > 0 ? true : false;
  }, [dispatchData]);

  const TableData = (
    status,
    dateTypeSearch,
    urgent,
    page = "",
    size = pageSize,
    useNewTable = showNewTable,
    ShowOnlyRemarks = "",
  ) => {
    if (
      CompanyID == 369 &&
      (!formData.SelectTypes || !formData.ItemValue?.toString().trim())
    ) {
      setShowRequiredError(true);
      return;
    }
    setShowRequiredError(false);
    setLoading(true);
    const rateTypes = RateTypes.map((item) => {
      return item?.value;
    });
    if (User == "1") {
      const useNewEndpointPortal = useNewTable && !!API_DATA?.visitNo;
      axiosInstance
        .post(
          useNewEndpointPortal
            ? "Dispatch/PatientLabSearchPagingData"
            : "Dispatch/PatientLabSearchPaging",
          getTrimmedData({
            CentreID: [parseInt(API_DATA?.defaultCentreID)],
            CollectionBoyID: Number(collectionBoy || 0), SelectTypes: "VisitNo", ItemValue: API_DATA?.visitNo,
            RateTypeID: [parseInt(API_DATA?.rateTypeId)],
            DoctorReferal: formData.DoctorReferal,
            ReferLabId: Number(formData?.ReferLabId),
            FromDate: moment(API_DATA?.bookingDate).format("DD/MMM/YYYY"),
            ToDate: moment(API_DATA?.bookingDate).format("DD/MMM/YYYY"),
            FromTime: formData.FromTime,
            ToTime: formData.ToTime,
           DepartmentID: [parseInt(API_DATA?.departmentId) || 0] ,
            SampleStatus: status,
            TestName: String(formData?.InvestigationID),
            PackageItemID: Number(formData?.PackageItemID || 0),
            DateTypeSearch: dateTypeSearch ? dateTypeSearch : formData?.DateTypeSearch,
            User: formData?.User,
            IsUrgent: urgent ? urgent : formData?.IsUrgent ? 1 : 0,
            ShowOnlyRemarks: ShowOnlyRemarks ? ShowOnlyRemarks : formData?.ShowOnlyRemarks ? 1 : 0,
            WithoutnablLogo: formData?.WithoutnablLogo ? -1 : 0,
            IsCourier: formData?.IsCourier ? 1 : 0,
            WardNo: formData?.WardNo,
            ProEmployeeID: Number(state?.ProEmployee || 0),
            pageNumber: page || 1,
            pageSize: Number(size),
            HLMPatientType: formData?.HLMPatientType || "ALL",
          }),
        )
        .then((res) => {
          setCurrentStatus(status);
          console.log("res?.data?.message", res);
          console.log("length", res?.data?.data?.rows);
          if (Array.isArray(res?.data?.data?.rows)) {
            const data = modifyArray(res?.data?.data?.rows);
            console.log("modifiedArray", data);
            setOriginalTableData(res?.data?.data?.rows);
            setAllLabData(res?.data?.data?.rows);
            setTestCount(res?.data?.data?.testCount || 0);
            setDispatchData(data);
            // setLoad(true);
            setTotalCount(res?.data?.data?.totalRecords || 0);
          } else {
            setOriginalTableData([]);
            setAllLabData([]);
            setTestCount(0);
            setDispatchData([]);
            setTotalCount(0);
          }
          setLoading(false);
        })
        .catch((err) => setLoading(false))
        .finally(() => {
          setLoading(false);
        });
    } else {
      if (page === 1) {
        Object.keys(window.sessionStorage).forEach((key) => {
          if (key.startsWith("prevPZ-")) {
            window.sessionStorage.removeItem(key);
          }
        });
      }
      // UHID search auto-fills ItemValue with just the centre's prefix (e.g. "APC") so
      // the user can type the rest of the code. If they search without typing anything
      // past that prefix, don't send it as a filter — it isn't a real UHID.
      const isUhidPrefixOnly =
        formData?.SelectTypes === "PatientCode" &&
        formData?.ItemValue?.trim() === defaultCentrePrefix?.trim();
      const effectiveItemValue = isUhidPrefixOnly ? "" : formData.ItemValue.trim();
      const useNewEndpoint = useNewTable && !!effectiveItemValue;
      axiosInstance
        .post(
          useNewEndpoint
            ? "Dispatch/PatientLabSearchPagingData"
            : "Dispatch/PatientLabSearchPaging",
          getTrimmedData({
            CentreID: formData.CentreID ? [formData.CentreID] : [],
            ShowAllCheckBarcodeOption: checkBarcodeOption ? 1 : 0,
            CollectionBoyID: Number(collectionBoy || 0),
            SelectTypes: isUhidPrefixOnly ? "" : formData.SelectTypes, ItemValue: effectiveItemValue,
            RateTypeID: formData?.RateTypeID ? [formData?.RateTypeID] : [],
            DoctorReferal: formData.DoctorReferal,
            ReferLabId: Number(formData?.ReferLabId),
            FromDate: moment(formData.FromDate).format("DD/MMM/YYYY"),
            ToDate: moment(formData.ToDate).format("DD/MMM/YYYY"),
            FromTime: formData.FromTime,
            ToTime: formData.ToTime,
             DepartmentID: formData.DepartmentID ? [Number(formData.DepartmentID)] : [],
            SampleStatus: status || "",
            TestName: String(formData?.InvestigationID),
            PackageItemID: Number(formData?.PackageItemID || 0),
            DateTypeSearch: dateTypeSearch ? String(dateTypeSearch) : String(formData?.DateTypeSearch),
            User: formData?.User,
            IsUrgent: urgent ? urgent : formData?.IsUrgent ? 1 : 0,
            ShowOnlyRemarks: ShowOnlyRemarks ? ShowOnlyRemarks : formData?.ShowOnlyRemarks ? 1 : 0,
            WithoutnablLogo: formData?.WithoutnablLogo ? -1 : 0,
            IsCourier: formData?.IsCourier ? 1 : 0,
            WardNo: formData?.WardNo,
            ProEmployeeID: Number(state?.ProEmployee || 0),
            pageNumber: page || 1,
            pageSize: Number(size),
            HLMPatientType: formData?.HLMPatientType || "ALL",
          }),
        )
        .then((res) => {
          if (Array.isArray(res?.data?.data?.rows)) {
            const data = modifyArray(res?.data?.data?.rows);
            setGlobalData(res?.data?.data);
            setTotalCount(res?.data?.data?.totalRecords || 0);
            setAllLabData(res?.data?.data?.rows);
            setTestCount(res?.data?.data?.testCount || 0);
            setOriginalTableData(res?.data?.data?.rows);
            prevPageManage(page || 1, size, res?.data?.data?.rows);
            setDispatchData(data);
            // setLoad(true);
            setLoading(false);
            setOriginalTableData(res?.data?.data?.rows);
          } else {
            setOriginalTableData([]);
            setAllLabData([]);
            setTestCount(0);
            setDispatchData([]);
          }
        })
        .catch((err) => {
          setLoading(false);
        })
        .finally(() => {
          setLoading(false);
        });
    }
  };

  const handleInnerChecked = (e, newIndex, index) => {
    const { name, checked } = e.target;
    const val = [...dispatchData];
    val[index]["TestDetail"][newIndex][name] = checked;
    setDispatchData(val);
  };

  function createCheckbox(item) {
    console.log(item);
    if (
      (item.Status == 5 ||
        item?.Status == 5 ||
        item.status == 6 ||
        item?.Status == 6) &&
      item.IsApproved == 1
    ) {
      return `<input type=\"checkbox\" onchange={handleCheck}  value=\"${item.TestIdHash}\" id=\"${item.LedgerTransactionID}\" class=${item.LedgerTransactionID} />`;
    } else {
      return "";
    }
  }

  // comment below function - right function - PatientLabSearchPaging

  function modifyArray(dataArray) {
    let modifiedArray = [];
    const MAC_STATUS = "13";
    const RESULT_DONE_STATUS = "10";

    dataArray?.forEach((visit) => {
      const pliList = visit.PliDataList ? JSON.parse(visit?.PliDataList) : [];
      const remarksList = visit.RemarksList
        ? JSON.parse(visit.RemarksList)
        : [];

      let isCulture = "";
      let isApproved = "";
      let barcodeArr = [];
      let isUrgent = 0;

      // -------------------------------
      // 1. Group tests by PackageName (from PliDataList)
      // -------------------------------
      const packageMap = {};

      pliList?.forEach((test) => {
        // Use test.PackageName if exists, otherwise "-"
        const pkgName =
          test?.PackageName && test?.PackageName.trim()
            ? test.PackageName.trim()
            : "";

        if (!packageMap[pkgName]) {
          packageMap[pkgName] = [];
        }
        packageMap[pkgName].push(test);

        isApproved += `${test?.IsApproved || 0}#`;

        // culture
        isCulture += `${test?.IsCulture || 0}#`;

        if (test?.isUrgent == 1) {
          isUrgent = 1;
        }

        // barcode
        if (test?.SinNo) {
          const existing = barcodeArr.find((b) => b.code === test.SinNo);
          if (!existing) {
            barcodeArr.push({
              sampleType: test?.sampletypename || "",
              code: test.SinNo,
            });
          }
        }
      });

      let testHTML = "";

      Object.keys(packageMap).forEach((pkg) => {
        if (pkg) {
          testHTML += `<div class="mt-1" style="font-weight:600;">${pkg}</div>`;
        }

        packageMap[pkg].forEach((test) => {
          console.log("test", test);
          let showStatusColor = true;

          if (test?.Status == MAC_STATUS && HideMacStatusFromDispatch === "1") {
            showStatusColor = false;
          }

          if (
            test?.Status == RESULT_DONE_STATUS &&
            HideResultDoneStatusFromDispatch === "1"
          ) {
            showStatusColor = false;
          }

          testHTML += `
          <p 
            style="gap:4px; margin-left:${pkg ? "20px" : "0px"}"
            data-approved="${test?.IsApproved}"
            class="rounded d-flex align-items-center round
             ${showStatusColor
              ? `PrintOrderStatus-${test?.PrintOrderStatus == 99 ? 99 : "00"} Status-${test?.Status}`
              : `PrintOrderStatus-${test?.PrintOrderStatus == 99 ? 99 : "00"}`
            }">
            ${createCheckbox({
              Status: test?.Status,
              TestIdHash: test?.TestIdHash,
              LedgerTransactionID: visit?.LedgerTransactionID,
              IsApproved: test?.IsApproved,
            })}
            ${test?.TestName || test?.ItemName || test?.Test || "Complete Blood Count (CBC)"}
          </p>
        `;
        });
      });

      modifiedArray.push({
        ...visit,
        Test: testHTML,
        IsCulture: isCulture,
        barcodeArr,
        RemarksList: remarksList,
        IsUrgent: isUrgent,
        IsApproved: isApproved,
      });
    });

    return modifiedArray;
  }

  const handleTime = (time, name) => {
    setFormData({ ...formData, [name]: time });
  };

  useEffect(() => {
    getAccessCentres();
    getDepartment();
    getWardNo();
    BindEmployeeReports(SetUser);
    getPaymentModes("Identity", setIdentity);
    controllerDynamic();
  }, []);

  const handleSelectChange1 = (name, event) => {
    // const { name, value } = event.target;
    setFormData({ ...formData, [name]: event?.value });
    event?.value != -1 && TableData(event?.value);
    if (name == "SampleStatus") {
      setCurrentStatus(event?.value);
      setCurrentPage(1);
    }
  };
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
      setRateTypes([{ label: "All RateType", value: "" }, ...list]);
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

  useEffect(() => {
    if (formData?.TestName.length > 2) {
      DepartmentWiseItemList(
        formData.DepartmentID,
        formData?.TestName,
        setTestSuggestion,
        false,
        "Investigation",
      );
    }
  }, [formData?.TestName]);

  useEffect(() => {
    if (formData?.PackageName.length > 2) {
      DepartmentWiseItemList(
        formData.DepartmentID,
        formData?.PackageName,
        setPackageSuggestion,
        false,
        "Package",
      );
    }
  }, [formData?.PackageName]);
  const EmployeeID = useLocalStorage("userData", "get")?.EmployeeID;
  const getFilterResultOption = () => {
    axiosInstance
      .post("Lab/getFilterTableReprintData", {
        PageName: "DispatchReport",
        EmployeeId: EmployeeID?.toString(),
      })
      .then((res) => {
        let data = res?.data?.message;

        setColumnConfig(data);
      })
      .catch((err) => setColumnConfig([]));
  };

  const handleLogout = () => {
    window.sessionStorage.clear();
    window.localStorage.clear();
    navigate("/PatientPortalLogin");
  };

  useEffect(() => {
    getFilterResultOption();
    TableData("");
  }, []);
  const items = [
    {
      label: "Status",
      icon: "pi pi-fw pi-cog",
      items: [
        {
          label: "Not Collected",
          value: "1",
          status: true,
          command: () => TableData("1"),
          icon: "circle-icon Status-1",
        },
        {
          label: "Collected",
          value: "2",
          status: true,
          icon: "circle-icon Status-2",
          command: () => TableData("2"),
        },
        {
          label: "Receive",
          value: "3",
          icon: "circle-icon Status-3",
          status: true,
          command: () => TableData("3"),
        },
        {
          label: "Rejected",
          value: "4",
          icon: "circle-icon Status-4",
          status: true,
          command: () => TableData("4"),
        },
        {
          label: "Result Done",
          value: "10",
          icon: "circle-icon Status-10",
          status: true,
          command: () => TableData("10"),
        },
        {
          label: "Approved",
          value: "5",
          icon: "circle-icon Status-5",
          status: true,
          command: () => TableData("5"),
        },
        {
          label: "Hold",
          icon: "circle-icon Status-11",
          value: "11",
          status: true,
          command: () => TableData("11"),
        },
        {
          label: "Re-Run",
          value: "14",
          icon: "circle-icon Status-14",
          status: true,
          command: () => TableData("14"),
        },
        {
          label: "Mac Data",
          value: "13",
          icon: "circle-icon Status-13",
          status: true,
          command: () => TableData("13"),
        },
        {
          label: "Dispatched",
          value: "15",
          icon: "circle-icon Status-15",
          status: true,
          command: () => TableData("15"),
        },
        {
          label: "Printed",
          value: "6",
          icon: "circle-icon Status-6",
          status: true,
          command: () => TableData("6"),
        },
        {
          label: "OutSource",
          value: "18",
          icon: "circle-icon Status-18",
          status: true,
          command: () => TableData("18"),
        },
        {
          label: "All",
          icon: "circle-icon Status-all",
          value: "",
          status: true,
          command: () => TableData(""),
        },
      ],
    },
    {
      label: "Date Type Search",
      icon: "pi pi-fw pi-search",
      items: [
        {
          label: "Registration Date",
          value: "1",
          status: true,
          command: () => TableData(formData.SampleStatus, "ivac.dtEntry"),
          icon: "pi pi-calendar iconField",
        },
        {
          label: "Received Date",
          value: "2",
          status: true,
          icon: "pi pi-user-edit iconField",
          command: () => TableData(formData.SampleStatus, "ivac.ReceiveDate"),
        },
      ],
    },
    {
      label: "Urgent Case",
      icon: "pi pi-hourglass",
      command: () =>
        TableData(
          document.getElementById("SampleStatus").value,
          formData.DateTypeSearch,
          1,
        ),
    },
  ];
  const totalPatient = () => {
    const visitNos = dispatchData.map((item) => item.VisitNo);
    const uniqueVisitNos = new Set(visitNos);
    return uniqueVisitNos.size;
  };

  const handleToggleChange = (e) => {
    const { checked } = e.target;
    setCheckBarcodeOption(checked);
  };

  //  const statusCount = (key) => {
  //     if(key==''){
  //       return [...originalTableData]?.length;
  //     }
  //     return [...originalTableData]?.filter((item) => item?.Status == key)?.length;
  //   };

  const statusCount = (key) => {
    if (key === "" || key === selectedStatus) {
      return testCount;
    }
    return 0;
  };

  const filterStatusWise = (sampStatus) => {
    setFormData((prev) => ({ ...prev, ["SampleStatus"]: sampStatus }));
    TableData(sampStatus);
    setCurrentPage(1);
    setSelectedStatus(sampStatus);
  };

  const prevPageManage = (page, size, data) => {
    const prevSum = page > 1 ? Number(window.sessionStorage.getItem(`prevPZ-${page - 1}`)) || 0 : 0;
    const patientCount = new Set(data?.map((item) => item.VisitNo)).size;
    window.sessionStorage.setItem(`prevPZ-${page}`, prevSum + patientCount);
  };

  const hideForRateType = () => {
    if (SessionRateTypeID > 0) {
      return false;
    }
    return true;
  };
  console.log("SessionRateTypeID", SessionRateTypeID)

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
    setSearchTerm(e.target.value);
  };

  const handleExcelDownload = () => {
    if (!originalTableData || originalTableData.length === 0) return;

    const ICON_COLS = new Set([
      "Uploaded Document", "Medical History", "Search", "Print", "Dispatch", "Select","LastRemark","Remarks","View","Edit"
    ]);

    const tableCols = filterData
      .filter((item) => item.TypeId === 2 && item.IsShow === 1 && !ICON_COLS.has(item.ControlDisplayID))
      .sort((a, b) => {
        const orderA = (a.DisplayOrder !== "" && a.DisplayOrder !== null && a.DisplayOrder !== undefined) ? Number(a.DisplayOrder) : (a.SortOrder !== "" && a.SortOrder !== null && a.SortOrder !== undefined) ? Number(a.SortOrder) : Number(a.ID) + 1000;
        const orderB = (b.DisplayOrder !== "" && b.DisplayOrder !== null && b.DisplayOrder !== undefined) ? Number(b.DisplayOrder) : (b.SortOrder !== "" && b.SortOrder !== null && b.SortOrder !== undefined) ? Number(b.SortOrder) : Number(b.ID) + 1000;
        return orderA - orderB;
      });

    const visibleCols = tableCols.filter((col) => {
      if (!columnConfig || columnConfig.length === 0) return true;
      const configItem = columnConfig.find(
        (c) => c.header?.toLowerCase() === col.ControlDisplayID?.toLowerCase()
      );
      if (configItem) {
        return configItem.visible == 1 || configItem.visible === true;
      }
      return true;
    });

    const getCellValue = (header, item, index) => {
      switch (header) {
        case "S.No":
          return index + 1;
        case "S.CollectionDate":
          return item?.SampleCollectionDate || "";
        case "Reg Date":
          return item?.Date ? moment(item.Date).format("DD/MMM/YYYY hh:mm A") : "";
        case "Visit No":
          return item?.VisitNo || "";
        case "Barcode No": {
          return (item?.barcodeArr || []).map(b => b.code).filter(Boolean).join(", ");
        }
        case "Name":
          return item?.PatientName || "";
        case "Doctor":
          return item?.DoctorName || "";
        case "Refer Lab":
          return item?.ReferLabName || "";
        case "Mobile":
          return item?.Mobile || "";
        case "Age/Gender":
          return `${getAccurateAge(item?.Age)}/${item?.Gender == "Female" ? "F" : "M"}`;
        case "Test": {
          const pliList = item?.PliDataList ? JSON.parse(item.PliDataList) : [];
          return pliList.map(t => t.Test || t.TestName).filter(Boolean).join(", ");
        }
        case "UHID":
          return item?.PatientCode || "";
        case "Dept.Category":
          return item?.Category || "";
        case "HNo":
          return item?.HNo || "";
        case "VisitType":
          return item?.VisitType || "";
        case "Centre":
          return item?.Centre || "";
        case "RateType":
          return item?.RateTypeName || "";
        case "RateTypeCode":
          return item?.RateTypeCode || "";
        case "S.ReceiveDate":
          return item?.SampleReceiveDate || "";
        // case "LastRemark": {
        //   const remarksList = Array.isArray(item?.RemarksList)
        //     ? item?.RemarksList
        //     : item?.RemarksList
        //       ? JSON.parse(item?.RemarksList)
        //       : [];
        //   if (!remarksList || remarksList.length === 0) return "";
        //   const sorted = [...remarksList].sort((a, b) =>
        //     moment(b.RemarkDate, "DD-MMM-YYYY hh:mm A") - moment(a.RemarkDate, "DD-MMM-YYYY hh:mm A")
        //   );
        //   return sorted[0]?.LabRemarks || "";
        // }
        default:
          return item[header] || "";
      }
    };

    const searchableKeys = [
      "PatientName",
      "PatientCode",
      "Mobile",
      "VisitNo",
      "DoctorName",
      "ReferLabName",
      "Centre",
      "RateTypeName",
      "Test",
      "HLMOPDIPDNo",
      "HLMPatientType",
    ];

    const filteredData = searchTerm?.trim()
      ? dispatchData.filter((row) =>
          searchableKeys.some((key) =>
            String(row[key] || "")
              .toLowerCase()
              .includes(searchTerm.toLowerCase()),
          ),
        )
      : dispatchData;

    const excelData = filteredData.map((item, index) => {
      const row = {
        "S.No": index + 1
      };
      visibleCols.forEach((col) => {
        row[col.ControlDisplayID] = getCellValue(col.ControlDisplayID, item, index);
      });
      return row;
    });

    ExportToExcel(excelData, "DispatchReport.xlsx");
  };

  return (
    <>
      {User ? (
        <>
          <Accordion
            isBreadcrumb={true}
            name={t("Dispatch Report")}
            logout={true}
            handleLogout={handleLogout}
            seconTitle={
              <div style={{ marginLeft: "auto" }}>
                <PageControlGear pageId={PAGE_ID} />
              </div>
            }
          />
        </>
      ) : (
        <Accordion
          name={t("Dispatch Report")}
          defaultValue={true}
          linkTo="/dispatchreport"
          isBreadcrumb={true}
          seconTitle={
            <div
              className="link-title-container"
              id="pr_id_11"
              style={{ marginLeft: "auto", justifyContent: "flex-end" }}
            >
              <div className="link-title-item">
                {t("Total Patient") + " : " + globalData?.patientcount}
              </div>
              <div className="link-title-item">
                {/* {t("Total Test Count") + " : " + totalCount || testCount} */}
                {t("Total Test Count") + " : " + testCount}
              </div>
              <div className="mt-1">
                <PageControlGear pageId={PAGE_ID} />
              </div>
            </div>
          }
        />
      )}
      <Accordion
        className={"remove_bgShadow"}
        title={t("Dispatch Report Details")}
        defaultValue={"true"}
      >
        <div className="row pt-2 pl-2 pr-2">
          {controllerDynamicList
            ?.filter((item) => item?.TypeId === 1 && item?.IsShow === 1)
            ?.map((item, index) => {
              if (
                item?.ControlDisplayID === "SelectTypes" &&
                isHideController("SelectTypes")
              ) {
                return (
                  <div className="col-12 col-sm-2" key={index}>
                    <div className="d-flex">
                      <div style={{ width: "40%" }}>
                        <SelectBox
                          options={[
                            ...SearchBy,
                            DefaultCurrencyName == "KES"
                              ? { label: "HNo", value: 'HNo' }
                              : "",
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
                          isDisabled={User}
                          className={`${CompanyID == 369 ? "required-fields" : ""}`}
                        />
                      </div>

                      {ShowAllCheckBarcodeOption == 1 &&
                        formData.SelectTypes === "BarcodeNo" && (
                          <>
                            <Tooltip
                              target="#ShowAllCheckBarcodeOption"
                              content={t("ShowAllCheckBarcodeOption")}
                              position="top"
                            />
                            <Form.Check
                              type="checkbox"
                              id="ShowAllCheckBarcodeOption"
                              checked={!!checkBarcodeOption}
                              onChange={handleToggleChange}
                              className="cursor-pointer"
                            />
                          </>
                        )}

                      <div style={{ width: "60%" }}>
                        <Input
                          type={
                            formData?.SelectTypes === "Mobile"
                              ? "number"
                              : "text"
                          }
                          name="ItemValue"
                          max={formData?.SelectTypes === "Mobile" ? 10 : 20}
                          value={formData.ItemValue}
                          onKeyDown={handleKeyDown}
                          onChange={handleChange}
                          onInput={
                            formData?.SelectTypes === "Mobile"
                              ? (e) => number(e, DefaultCurrencyName == "KES" ? 14 : 10)
                              : undefined
                          }
                          disabled={User}
                          autoComplete="off"
                          className={`${CompanyID == 369 ? "required-fields" : ""}`}
                        />
                        {errors?.ItemValue && (
                          <div className="error-message">
                            {errors?.ItemValue}
                          </div>
                        )}
                      </div>
                    </div>

                    {showRequiredError && (
                      <div
                        style={{
                          color: "red",
                          fontSize: "12px",
                          marginTop: "4px",
                        }}
                      >
                        * Select Types and Item Value are required
                      </div>
                    )}
                  </div>
                );
              }

              if (
                item?.ControlDisplayID === "CentreID" &&
                isHideController("CentreID") &&
                ReferedByDoctorDesignationID != DesignationId &&
                hideForRateType()
              ) {
                return (
                  <div className="col-4 col-sm-2" key={index}>
                    <ReactSelect
                      dynamicOptions={AddBlankData(CentreData, "All Centre")}
                      name="CentreID"
                      lable={t("Centre")}
                      id="Centre"
                      removeIsClearable={true}
                      placeholderName={t("Centre")}
                      value={formData?.CentreID}
                      onChange={handleSearchSelectChange}
                      isDisabled={User}
                    />
                  </div>
                );
              }

              if (
                item?.ControlDisplayID === "RateTypeID" &&
                isHideController("RateTypeID") &&
                ReferedByDoctorDesignationID != DesignationId &&
                hideForRateType()
              ) {
                return (
                  <div className="col-6 col-sm-2 ">
                    <ReactSelect
                      dynamicOptions={[...RateTypes]}
                      name="RateTypeID"
                      lable={t("RateType")}
                      id="RateType"
                      removeIsClearable={true}
                      placeholderName={t("RateType")}
                      value={formData?.RateTypeID}
                      onChange={handleSearchSelectChange}
                      isDisabled={User}
                      isLoading={rateTypeLoading}
                    />
                  </div>
                );
              }

              if (
                item?.ControlDisplayID === "DepartmentID" &&
                isHideController("DepartmentID")
                //  &&
                // hideForRateType()
              ) {
                return (
                  <div className="col-6 col-sm-2">
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
                      isDisabled={User}
                    />
                  </div>
                );
              }
              if (
                item?.ControlDisplayID === "WardNo" &&
                isHideController("WardNo") &&
                shouldIncludeAIIMSID()
              ) {
                return (
                  <div className="col-6 col-sm-2">
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
                );
              }

              if (
                item?.ControlDisplayID === "DoctorName" &&
                isHideController("DoctorName") &&
                ReferedByDoctorDesignationID != DesignationId &&
                hideForRateType()
              ) {
                return (
                  <div className="col-6 col-sm-2">
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
                        setTimeout(() => {
                          const data = doctorSuggestion.filter(
                            (ele) => ele?.Name === e.target.value,
                          );
                          if (data.length === 0) {
                            setFormData({ ...formData, DoctorName: "" });
                          }
                        }, 500);
                      }}
                      autoComplete="off"
                      disabled={User}
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
                              className={`${index === doctorIndexMatch && "matchIndex"}`}
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
                item?.ControlDisplayID === "ReferLabId" &&
                isHideController("ReferLabId") &&
                hideForRateType()
              ) {
                return (
                  <div className="col-6 col-sm-2">
                    <ReactSelect
                      dynamicOptions={refLabList}
                      name="ReferLabId"
                      lable={t("Ref Lab")}
                      id="ReferLabId"
                      removeIsClearable={true}
                      placeholderName={t("Ref Lab")}
                      value={formData?.ReferLabId}
                      onChange={handleSearchSelectChange}
                      isDisabled={User}
                    />
                  </div>
                );
              }

              if (
                item?.ControlDisplayID === "TestName" &&
                isHideController("TestName")
              ) {
                return (
                  <div className="col-6 col-sm-2">
                    <Input
                      type="text"
                      name="TestName"
                      lable="Search By Test Name"
                      id="TestName"
                      value={formData.TestName}
                      placeholder=" "
                      onChange={handleChange}
                      onKeyDown={(e) => handleIndex(e, "TestName")}
                      disabled={User}
                      autocomplete="off"
                      onBlur={(e) => {
                        autocompleteOnBlur(setTestSuggestion);
                      }}
                    />
                    {TestSuggestion.length > 0 && (
                      <AutoComplete
                        selects={selects}
                        test={TestSuggestion}
                        handleListSearch={handleListSearch}
                        indexMatch={indexMatch}
                      />
                    )}
                  </div>
                );
              }
              if (
                item?.ControlDisplayID === "PackageName" &&
                isHideController("PackageName")
              ) {
                return (
                  <div className="col-6 col-sm-2">
                    <Input
                      type="text"
                      name="PackageName"
                      lable="Search By Package Name"
                      id="PackageName"
                      value={formData.PackageName}
                      placeholder=" "
                      onChange={handleChange}
                      onKeyDown={(e) => handleIndex(e, "PackageName")}
                      disabled={User}
                      autocomplete="off"
                      onBlur={(e) => {
                        autocompleteOnBlur(setPackageSuggestion);
                      }}
                    />
                    {PackageSuggestion.length > 0 && (
                      <AutoComplete
                        selects={packageSelects}
                        test={PackageSuggestion}
                        handleListSearch={(data) =>
                          handleListSearch(data, "PackageName")
                        }
                        indexMatch={packageIndexMatch}
                        className="packageMatchIndex"
                      />
                    )}
                  </div>
                );
              }
              if (
                item?.ControlDisplayID === "User" &&
                isHideController("User") &&
                ReferedByDoctorDesignationID != DesignationId &&
                hideForRateType()
              ) {
                return (
                  <div className="col-6 col-sm-2">
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
                      isDisabled={User}
                    />
                  </div>
                );
              }
              if (
                item?.ControlDisplayID === "DateTypeSearch" &&
                isHideController("DateTypeSearch")
              ) {
                return (
                  <div className="col-6 col-sm-2">
                    <ReactSelect
                      dynamicOptions={DateTypeSearch2}
                      label={"DateTypeSearch"}
                      name={"DateTypeSearch"}
                      id={"DateTypeSearch"}
                      value={formData?.DateTypeSearch}
                      onChange={handleReactSelectChange}
                      removeIsClearable={true}
                      isDisabled={User}
                    />
                    {/* <SelectBox
              options={DateTypeSearch2}
              formdata={formData?.DateTypeSearch}
              name="DateTypeSearch"
              lable="DateTypeSearch"
              id="DateTypeSearch"
              onChange={handleSelectChange}
              isDisabled={User}
            /> */}
                  </div>
                );
              }

              if (
                item?.ControlDisplayID === "FromDate" &&
                isHideController("FromDate")
              ) {
                return (
                  <div className="col-4 col-sm-2">
                    <DatePicker
                      className="custom-calendar"
                      name="FromDate"
                      value={formData?.FromDate}
                      onChange={dateSelect}
                      placeholder=" "
                      id="FromDate"
                      lable="FromDate"
                      maxDate={new Date(formData?.ToDate)}
                      disabled={User}
                    />
                  </div>
                );
              }

              if (
                item?.ControlDisplayID === "FromTime" &&
                isHideController("FromTime") &&
                hideForRateType()
              ) {
                return (
                  <div className="col-6 col-sm-1 ">
                    <CustomTimePicker
                      name="FromTime"
                      placeholder="FromTime"
                      value={formData?.FromTime}
                      id="FromTime"
                      lable="FromTime"
                      onChange={handleTime}
                      disabled={User}
                    />
                  </div>
                );
              }
              if (
                item?.ControlDisplayID === "ToDate" &&
                isHideController("ToDate")
              ) {
                return (
                  <div className="col-4 col-sm-2">
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
                      disabled={User}
                    />
                  </div>
                );
              }
              if (
                item?.ControlDisplayID === "ToTime" &&
                isHideController("ToTime") &&
                hideForRateType()
              ) {
                return (
                  <div className="col-6 col-sm-1">
                    <CustomTimePicker
                      name="ToTime"
                      placeholder="ToTime"
                      value={formData?.ToTime}
                      id="ToTime"
                      lable="ToTime"
                      onChange={handleTime}
                      disabled={User}
                    />
                  </div>
                  /* <div className="col-sm-2">
            <SelectBox
              options={[...SampleStatus]}
              onChange={handleSelectChange1}
              name="SampleStatus"
              lable="SampleStatus"
              id="SampleStatus"
              selectedValue={formData.SampleStatus}
              isDisabled={User}
            />
          </div> */
                );
              }
              if (
                item?.ControlDisplayID === "SampleStatus" &&
                isHideController("SampleStatus") &&
                hideForRateType()
              ) {
                return (
                  <div className="col-6 col-sm-2 ">
                    <MultiBackGroundReactSelect
                      placeholderName={t("Sample Status")}
                      dynamicOptions={filteredSampleStatus}
                      value={formData.SampleStatus}
                      onChange={handleSelectChange1}
                      name="SampleStatus"
                      id="SampleStatus"
                      isDisabled={User}
                      bgColor={true} // enable colored background
                    />
                  </div>
                );
              }
              if (
                item?.ControlDisplayID === "collectionBoy" &&
                isHideController("collectionBoy") &&
                ReferedByDoctorDesignationID != DesignationId &&
                hideForRateType()
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
                item?.ControlDisplayID === "ProEmployee" &&
                isHideController("ProEmployee") &&
                ReferedByDoctorDesignationID != DesignationId &&
                hideForRateType()
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
                item?.ControlDisplayID === "IsUrgent" &&
                isHideController("IsUrgent") &&
                hideForRateType()
              ) {
                return (
                  <div className="col-6 col-sm-auto d-flex align-items-center">
                    <label className="switch">
                      <input
                        type="checkbox"
                        name="IsUrgent"
                        checked={formData?.IsUrgent}
                        onChange={handleToggleSetMaster}
                      />
                      <span className="slider"></span>
                    </label>
                    <strong className="ml-2 mb-1">{t("IsUrgent")}</strong>
                  </div>
                );
              }
               if (
                item?.ControlDisplayID === "ShowOnlyRemarks" &&
                isHideController("ShowOnlyRemarks") &&
                hideForRateType()
              ) {
                return (
                  <div className="col-6 col-sm-auto d-flex align-items-center mb-2">
                    <label className="switch">
                      <input
                        type="checkbox"
                        name="ShowOnlyRemarks"
                        checked={formData?.ShowOnlyRemarks}
                        onChange={handleToggleSetMaster}
                      />
                      <span className="slider"></span>
                    </label>
                    <strong className="ml-2 mb-1">{t("ShowOnlyRemarks")}</strong>
                  </div>
                );
              }
              if (
                item?.ControlDisplayID === "withoutNablLogo" &&
                isHideController("withoutNablLogo")
              ) {
                return (
                  <div className="col-6 col-sm-auto d-flex align-items-center mb-2">
                    <label className="switch">
                      <input
                        type="checkbox"
                        name="WithoutnablLogo"
                        checked={formData?.WithoutnablLogo}
                        onChange={handleToggleSetMaster}
                      />
                      <span className="slider"></span>
                    </label>
                    <strong className="ml-2 mb-2">
                      {t("Without NABL Logo")}
                    </strong>
                  </div>
                );
              }

              if (
                item?.ControlDisplayID === "IsCourier" &&
                isHideController("IsCourier")
              ) {
                return (
                  <div className="col-6 col-sm-auto d-flex mb-2">
                    <input
                      type="checkbox"
                      name="IsCourier"
                      id="IsCourier"
                      checked={formData?.IsCourier}
                      onChange={handleSelectChange}
                      disabled={User}
                    />
                    <label htmlFor="IsCourier" className="ml-2">
                      IsCourier
                    </label>
                  </div>
                );
              }
              if (
                item?.ControlDisplayID === "HLMPatientType" &&
                isHideController("HLMPatientType")
              ) {
                return (
                  <div className="col-6 col-sm-2 mb-2">
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
              return null;
            })}
          
          <div className="col-4 col-sm-1 mb-2">
            <SearchButton
              text={"Search"}
              onClick={() => {
                TableData(formData?.SampleStatus);
                setCurrentStatus(formData?.SampleStatus);
                setCurrentPage(1);
              }}
              className="btn-block"
              disabled={User}
            />
          </div>
          {originalTableData?.length > 0 && CompanyID !== 1003 && (
            <div className="col-4 col-sm-1 mb-2">
              <CustomButton
                text={"Excel"}
                icon={"excel"}
                onClick={handleExcelDownload}
                className="btn-block"
              />
            </div>
          )}

          {/* <div
            className={
              shouldIncludeAIIMSID() ? "col-sm-7 col-4" : "col-sm-9 col-4"
            }
          ></div>
          {/* <div className="col-sm-3 col-1" style={{ textAlign: "end" }}>
            <DispatchMoreFilter items={items} />
          </div> */}
        </div>
      </Accordion>
      <div
        style={{ gap: "6px" }}
        className="mt-2 mb-3 px-2 py-1 bg-white d-flex align-items-center sampleStatusClass"
      >
        <strong style={{ minWidth: "100px", flexShrink: 0, }}>Sample Status : </strong>
        <div
          className="sampleStatusList"
          style={{ display: "flex", gap: "6px", overflowX: "auto", flexWrap: "nowrap", WebkitOverflowScrolling: "touch" }}
        >
          {filteredSampleStatus?.map((sItem, idx) => (
            <TableFilterDot
              key={idx}
              color={`${getStatusColor(sItem?.value)}`}
              title={`${sItem?.label}`}
              onClick={() => filterStatusWise(sItem?.value)}
              bgColor={`#e9e2e1`}
            />
          ))}
        </div>
      </div>
      {show4?.modal && (
        <MedicialModal
          show={show4.modal}
          handleClose={() => {
            setShow4({
              modal: false,
              data: "",
              index: -1,
              ID: 0,
            });
          }}
          MedicalId={show4?.data}
          ID={show4?.ID}
          handleUploadCount={handleUploadCount}
        />
      )}

      {show?.modal && (
        <UploadFile
          show={show?.modal}
          handleClose={() => {
            setShow({ modal: false, data: "", index: -1 });
          }}
          options={Identity}
          documentId={show?.data}
          pageName="Patient Registration"
          handleUploadCount={handleUploadCount}
          LedgerTransactionIDHash={show?.LedgertransactionIDHash}
        />
      )}

      <div className="mt-2">
        {loading ? (
          <Loading />
        ) : (
          <>
            <Accordion
              className="rr-results-accordion"
              notOpen={true}
              title={
                <>
                  {dispatchData?.length == 0 ? (
                    t("Search Result")
                  ) : (
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
                  )}
                </>
              }
              defaultValue={true}
              seconTitle={
                <div className="ml-auto d-flex align-items-center mt-1 px-2">
                  <div
                    className="rr-legend d-flex align-items-center mr-2"
                    style={{ gap: "10px", fontSize: "12px" }}
                  >
                    <div
                      className="d-flex align-items-center"
                      style={{ gap: "4px" }}
                    >
                      <i
                        className="fa bi-file-earmark-pdf text-primary"
                        style={{ fontSize: "14px" }}
                        title={t("View Attachments")}
                      />
                      <span className="rr-legend-text">View Attachments</span>
                    </div>

                    <div
                      className="d-flex align-items-center"
                      style={{ gap: "4px" }}
                    >
                      <img src={Urgent} className="sizeicon" title={t("Urgent")} />
                      <span className="rr-legend-text">Urgent</span>
                    </div>
                    <div
                      className="d-flex align-items-center"
                      style={{ gap: "4px" }}
                    >
                      <i
                        className="bi bi-shield-fill-check vip-font-size mb-0"
                        style={{ color: "#FFC107" }}
                        title={t("VIP Patient")}
                      />
                      <span className="rr-legend-text">VIP Patient</span>
                    </div>
                  </div>



                  <Input
                    type="text"
                    name="search"
                    id="search"
                    placeholder="Search Dispatch Report Details..."
                    value={searchTerm}
                    onChange={handleChangeSearch}
                  />
                  {!isMobileView ? (
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
                  ) : null}
                </div>
              }
            >
              {(() => {
                const paginationBlock = (
                  <div className="d-flex flex-wrap justify-content-end align-items-end">
                    <ReactSelect
                      value={pageSize}
                      dynamicOptions={[
                        { label: "25", value: 25 },
                        { label: "50", value: 50 },
                        { label: "100", value: 100 },
                        { label: "150", value: 150 },
                      ]}
                      name={"pageSize"}
                      label={t("pageSize")}
                      removeIsClearable={true}
                      onChange={(name, value) => {
                        setPageSize(value?.value);
                        TableData(currentStatus, "", "", 1, value?.value);
                        setCurrentPage(1);
                      }}
                      respclass={"col-1 d-none"}
                    />
                    <Pagination
                      className="pagination-bar"
                      currentPage={currentPage}
                      totalCount={totalCount}
                      pageSize={pageSize}
                      onPageChange={(page) => {
                        setCurrentPage(page);
                        TableData(currentStatus, "", "", page, pageSize);
                      }}
                    />{" "}
                  </div>
                );
                return (
                  <>
                    {(IsPaginationOnTop == "1" || CompanyID == "1003") && paginationBlock}
                    {showNewTable ? (
                      <DispatchTableNew
                        ref={tableRef}
                        viewMode={effectiveViewMode}
                        dispatchData={dispatchData}
                        show={setShow4}
                        show2={setShow}
                        handleInnerChecked={handleInnerChecked}
                        columnConfig={columnConfig}
                        getFilterResultOption={getFilterResultOption}
                        TableData={TableData}
                        Status={formData?.SampleStatus}
                        patientLabResponse={allLabData || []}
                        originalTableData={originalTableData}
                        currentPage={currentPage}
                        pageSize={pageSize}
                        filterData={filterData}
                        searchTerm={searchTerm}
                        isNABL={formData.WithoutnablLogo}
                        onSelectionChange={setSelectedRowsCount}
                        showColumnModal={showColumnModal}
                        setShowColumnModal={setShowColumnModal}
                      />
                    ) : (
                      <DispatchReportTable
                        viewMode={effectiveViewMode}
                        dispatchData={dispatchData}
                        show={setShow4}
                        show2={setShow}
                        handleInnerChecked={handleInnerChecked}
                        columnConfig={columnConfig}
                        getFilterResultOption={getFilterResultOption}
                        TableData={TableData}
                        Status={formData?.SampleStatus}
                        patientLabResponse={allLabData || []}
                        originalTableData={originalTableData}
                        currentPage={currentPage}
                        pageSize={pageSize}
                        filterData={filterData}
                        searchTerm={searchTerm}
                        isNABL={formData.WithoutnablLogo}
                        showColumnModal={showColumnModal}
                        setShowColumnModal={setShowColumnModal}
                      />
                    )}
                    {CompanyID != "1003" && paginationBlock}
                  </>
                );
              })()}
            </Accordion>
          </>
        )}
      </div>
    </>
  );
};
//changes

export default DispatchReport;