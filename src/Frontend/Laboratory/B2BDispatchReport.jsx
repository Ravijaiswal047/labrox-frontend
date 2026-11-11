import React, { use, useEffect, useMemo, useState } from "react";
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
import { SearchButton } from "../../components/UI/CustomButton";
import { apiUrls } from "../../utils/apiUrls";

const B2BDispatchReport = () => {
  const [t] = useTranslation();
  const [pageSize, setPageSize] = useState(100);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [currentStatus, setCurrentStatus] = useState("All");
  const [globalData, setGlobalData] = useState({
    patientcount: 0,
  });
  const [selectedStatus, setSelectedStatus] = useState("");
  const {
    ShowAllCheckBarcodeOption,
    ShowDefaultLoginCentre,
    DefaultCentre,
    SessionRateTypeID,
    HideMacStatusFromDispatch,
    HideResultDoneStatusFromDispatch,
    DefaultDateTypeDispatchLabReport,
} = useLocalStorage("userData", "get");
  console.log("HideMacStatusFromDispatch", typeof HideMacStatusFromDispatch);
  const userData = useLocalStorage("userData", "get");

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
  const [refLabList, setRefLabList] = useState([])

  const [show, setShow] = useState({
    modal: false,
    data: "",
    index: -1,
  });

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
  const [controllerDynamicList, setControllerDynamicList] = useState([]);
  const [filterData, setFilterData] = useState([]);
  const [tabbingOrder, setTabbingOrder] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

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
    getRefLabList()
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
        fetchRateTypes(CentreData.map((ele) => ele.value));
      } else {
        fetchRateTypes([value?.value]);
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
    } else {
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
  const API_DATA = JSON.parse(localStorage.getItem("data"));
  const paginationShow = useMemo(() => {
    return totalCount > 0 ? true : false;
  }, [dispatchData]);

  const TableData = (
    status,
    dateTypeSearch,
    urgent,
    page = "",
    size = pageSize,
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
      axiosInstance
        .post(
          "AdvanceB2B/PatientLabSearchPaging",
          getTrimmedData({
            CentreID: [parseInt(API_DATA?.defaultCentreID)],
            CollectionBoyID: Number(collectionBoy || 0),
            SelectTypes: "VisitNo",
            ItemValue: API_DATA?.visitNo,
            RateTypeID: [parseInt(API_DATA?.rateTypeId)],
            DoctorReferal: formData.DoctorReferal,
            ReferLabId: Number(formData?.ReferLabId),
            FromDate: moment(API_DATA?.bookingDate).format("DD/MMM/YYYY"),
            ToDate: moment(API_DATA?.bookingDate).format("DD/MMM/YYYY"),
            FromTime: formData.FromTime,
            ToTime: formData.ToTime,
            DepartmentID: [parseInt(API_DATA?.departmentId)],
            SampleStatus: status,
            TestName: String(formData?.InvestigationID),
            PackageItemID: Number(formData?.PackageItemID || 0),
            DateTypeSearch: dateTypeSearch
              ? dateTypeSearch
              : formData?.DateTypeSearch,
            User: formData?.User,
            IsUrgent: urgent ? urgent : formData?.IsUrgent ? 1 : 0,
            WithoutnablLogo: formData?.WithoutnablLogo ? -1 : 0,
            IsCourier: formData?.IsCourier ? 1 : 0,
            WardNo: formData?.WardNo,
            ProEmployeeID: Number(state?.ProEmployee || 0),
            // InvestigationID: formData?.InvestigationID,

            pageNumber: page || 1,
            pageSize: Number(size),
          }),
        )
        .then((res) => {
          setCurrentStatus(status);
          console.log("res?.data?.message", res);
          console.log("length", res?.data?.data?.rows);
          if (Array.isArray(res?.data?.data?.rows)) {
            const data = modifyArray(res?.data?.data?.rows);
            console.log("modified Array", data);
            setOriginalTableData(res?.data?.data?.rows);
            setAllLabData(res?.data?.data?.rows);
            setTestCount(res?.data?.data?.testCount || 0);
            setDispatchData(data);
            // setLoad(true);
            setFormData((prev) => ({
              ...prev,
              TestName: "",
              PackageName: "",
              InvestigationID: "",
              PackageItemID: "",
            }));
            setTestSuggestion([]);
            setPackageSuggestion([]);
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
      axiosInstance
        .post(
          "AdvanceB2B/PatientLabSearchPaging",
          getTrimmedData({
            CentreID: formData.CentreID ? [formData.CentreID] : [],
            ShowAllCheckBarcodeOption: checkBarcodeOption ? 1 : 0,
            CollectionBoyID: Number(collectionBoy || 0),
            SelectTypes: formData.SelectTypes,
            ItemValue: formData.ItemValue.trim(),
            RateTypeID: formData?.RateTypeID ? [formData?.RateTypeID] : [],
            DoctorReferal: formData.DoctorReferal,
            ReferLabId: Number(formData?.ReferLabId),
            FromDate: moment(formData.FromDate).format("DD/MMM/YYYY"),
            ToDate: moment(formData.ToDate).format("DD/MMM/YYYY"),
            FromTime: formData.FromTime,
            ToTime: formData.ToTime,
            DepartmentID: formData.DepartmentID
              ? [Number(formData.DepartmentID)]
              : [],
            SampleStatus: status || "",
            TestName: String(formData?.InvestigationID),
            PackageItemID: Number(formData?.PackageItemID || 0),
            DateTypeSearch: dateTypeSearch
              ? String(dateTypeSearch)
              : String(formData?.DateTypeSearch),
            User: formData?.User,
            IsUrgent: urgent ? urgent : formData?.IsUrgent ? 1 : 0,
            WithoutnablLogo: formData?.WithoutnablLogo ? -1 : 0,
            IsCourier: formData?.IsCourier ? 1 : 0,
            WardNo: formData?.WardNo,
            ProEmployeeID: Number(state?.ProEmployee || 0),

            // --------------
            pageNumber: page || 1,
            pageSize: Number(size),
          }),
        )
        .then((res) => {
          if (Array.isArray(res?.data?.data?.rows)) {
            const data = modifyArray(res?.data?.data?.rows);
            setGlobalData(res?.data?.data);
            setTotalCount(res?.data?.data?.totalRecords || 0);
            setAllLabData(res?.data?.data?.rows);
            setTestCount(res?.data?.data?.testCount || 0);

            setDispatchData(data);
            // setLoad(true);
            setLoading(false);
            setOriginalTableData(res?.data?.data?.rows);
            setFormData((prev) => ({
              ...prev,
              TestName: "",
              PackageName: "",
              InvestigationID: "",
              PackageItemID: "",
            }));
            setTestSuggestion([]);
            setPackageSuggestion([]);
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
      item.Status == 5 ||
      item?.Status == 5 ||
      item.status == 6 ||
      item?.Status == 6
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

        // const tests = packageMap[pkg];

        // tests.forEach((test) => {
        //   testHTML += `
        //     <p style="gap:4px; margin-left:${pkg ? "20px" : "0px"}"
        //        class="rounded d-flex align-items-center
        //        PrintOrderStatus-${test?.PrintOrderStatus == 99 ? 99 : "00"}
        //        round Status-${test?.Status}">
        //       ${createCheckbox({
        //         Status: test?.Status,
        //         TestIdHash: test?.TestIdHash,
        //         LedgerTransactionID: visit?.LedgerTransactionID
        //       })}
        //       ${test?.TestName || test?.ItemName || test?.Test || "Complete Blood Count (CBC)"}
        //     </p>
        //   `;
        // }
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
          console.log("showStatusColor", showStatusColor);

          testHTML += `
          <p style="gap:4px; margin-left:${pkg ? "20px" : "0px"}"
             class="rounded d-flex align-items-center round
             ${showStatusColor
              ? `PrintOrderStatus-${test?.PrintOrderStatus == 99 ? 99 : "00"} Status-${test?.Status}`
              : `PrintOrderStatus-${test?.PrintOrderStatus == 99 ? 99 : "00"}`
            }">
            ${createCheckbox({
              Status: test?.Status,
              TestIdHash: test?.TestIdHash,
              LedgerTransactionID: visit?.LedgerTransactionID,
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
  const fetchRateTypes = async (id) => {
    try {
      const res = await axiosInstance.post("Centre/GetRateType", {
        CentreId: id,
      });
      const list = res?.data?.message.map((item) => ({
        label: item?.RateTypeName,
        value: item?.RateTypeID,
      }));
      setRateTypes([{ label: "All RateType", value: "" }, ...list]);
      if (list?.length === 1) {
        setFormData((prev) => ({ ...prev, RateTypeID: list?.[0]?.value }));
      }
    } catch (err) {
      console.log(err);
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
    if (User == "1") {
      TableData("");
    }
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

  const prevPageManage = () => {
    window.sessionStorage.setItem(
      `prevPZ-${currentPage}`,
      dispatchData?.length,
    );
  };

  const hideForRateType = () => {
    if (SessionRateTypeID > 0) {
      return false;
    }
    return true;
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
      let pageID = "1018";
      const { controllersData, controllerTabbingOrder } =
        await getSearchController(pageID);

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

  return (
    <>
      {User ? (
        <>
          <Heading
            isBreadcrumb={true}
            name={t("Dispatch Report")}
            logout={true}
            handleLogout={handleLogout}
          />
        </>
      ) : (
        <Heading
          name={t("Dispatch Report")}
          defaultValue={true}
          linkTo="/dispatchreport"
          isBreadcrumb={true}
          linkTitle={
            <div className="link-title-container" id="pr_id_11">
              <div className="link-title-item">
                {t("Total Patient") + " : " + globalData?.patientcount}
              </div>
              <div className="link-title-item">
                {/* {t("Total Test Count") + " : " + totalCount || testCount} */}
                {t("Total Test Count") + " : " + testCount}
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
                  <div className="col-sm-2" key={index}>
                    <div className="d-flex">
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

                      <div style={{ width: "50%" }}>
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
                              ? (e) => number(e, 10)
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
                  <div className="col-sm-2 mb-2" key={index}>
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
                  <div className="col-sm-2">
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
                    />
                  </div>
                );
              }

              if (
                item?.ControlDisplayID === "DepartmentID" &&
                isHideController("DepartmentID") &&
                hideForRateType()
              ) {
                return (
                  <div className="col-sm-2">
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
                );
              }

              if (
                item?.ControlDisplayID === "DoctorName" &&
                isHideController("DoctorName") &&
                ReferedByDoctorDesignationID != DesignationId &&
                hideForRateType()
              ) {
                return (
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
                  <div className="col-sm-2">
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
                  <div className="col-sm-2  ">
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
                  <div className="col-sm-2  ">
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
                  <div className="col-sm-2">
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
                  <div className="col-sm-2  ">
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
                  <div className="col-sm-1">
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
                  <div className="col-sm-1">
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
                  <div className="col-sm-2 my-1">
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
                );
              }
              if (
                item?.ControlDisplayID === "ProEmployee" &&
                isHideController("ProEmployee") &&
                ReferedByDoctorDesignationID != DesignationId &&
                hideForRateType()
              ) {
                return (
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
                );
              }
              if (
                item?.ControlDisplayID === "IsUrgent" &&
                isHideController("IsUrgent") &&
                hideForRateType()
              ) {
                return (
                  <div className="col-sm-auto d-flex align-items-center">
                    <label className="switch">
                      <input
                        type="checkbox"
                        name="IsUrgent"
                        checked={formData?.IsUrgent}
                        onChange={handleToggleSetMaster}
                      />
                      <span className="slider"></span>
                    </label>
                    <strong className="ml-2 mb-2">{t("IsUrgent")}</strong>
                  </div>
                );
              }
              if (
                item?.ControlDisplayID === "withoutNablLogo" &&
                isHideController("withoutNablLogo")
              ) {
                return (
                  <div className="col-sm-auto d-flex align-items-center">
                    <label className="switch">
                      <input
                        type="checkbox"
                        name="WithoutnablLogo"
                        checked={formData?.WithoutnablLogo}
                        onChange={handleToggleSetMaster}
                      />
                      <span className="slider"></span>
                    </label>
                    <strong className="ml-2 mb-2">{t("Without NABL Logo")}</strong>
                  </div>
                );
              }

              if (
                item?.ControlDisplayID === "IsCourier" &&
                isHideController("IsCourier")
              ) {
                return (
                  <div className="col-sm-auto d-flex mb-2">
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
              return null;
            })}
          <div className="col-sm-1 col-4">
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
        className="mt-2 mb-3 px-2 py-1 bg-white d-flex sampleStatusClass"
      >
        <strong style={{ minWidth: "100px" }}>Sample Status : </strong>
        {filteredSampleStatus?.map((sItem, idx) => (
          <TableFilterDot
            color={`${getStatusColor(sItem?.value)}`}
            // color={"#f1a098"}
            // title={`${sItem?.label} (${statusCount(sItem?.value)})`}
            title={`${sItem?.label}`}
            onClick={() => filterStatusWise(sItem?.value)}
            bgColor={`#e9e2e1`}
          />
        ))}
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
        />
      )}

      <div className="mt-2">
        {loading ? (
          <Loading />
        ) : (
          <>
            <Accordion
              notOpen={true}
              title={
                <>
                  {dispatchData?.length == 0 ? (
                    t("Search Result")
                  ) : (
                    <div className="d-flex">
                      <span className="mt-1">
                        {" "}
                        {t("Click Icon To Filter Results")}{" "}
                      </span>
                      <span
                        className="header ml-1"
                        style={{ cursor: "pointer" }}
                      >
                        <ReceiptReprintFilter
                          columnConfig={columnConfig}
                          setColumnConfig={setColumnConfig}
                          PageName="DispatchReport"
                        />
                      </span>
                    </div>
                  )}
                </>
              }
              defaultValue={true}
              seconTitle={
                <div className="ml-auto d-flex align-items-center mt-1 px-2">
                  <Input
                    type="text"
                    name="search"
                    id="search"
                    placeholder="Search Dispatch Report Details..."
                    value={searchTerm}
                    onChange={handleChangeSearch}
                  />
                </div>
              }
            >
              <DispatchReportTable
                dispatchData={dispatchData}
                show={setShow4}
                show2={setShow}
                handleInnerChecked={handleInnerChecked}
                columnConfig={columnConfig}
                TableData={TableData}
                Status={formData?.SampleStatus}
                patientLabResponse={allLabData || []}
                originalTableData={originalTableData}
                currentPage={currentPage}
                pageSize={pageSize}
                filterData={filterData}
                searchTerm={searchTerm}
                isNABL={formData.WithoutnablLogo}
              />

              {
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
                      prevPageManage();
                    }}
                  />{" "}
                </div>
              }
            </Accordion>
          </>
        )}
      </div>
    </>
  );
};

export default B2BDispatchReport;
