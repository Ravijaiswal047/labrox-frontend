import { useFormik } from "formik";
import React, { useEffect, useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  GetAccessRightApproval,
  GetAccessRightMaster,
  getDepartment,
  getDesignationData,
  getEmployeeCenter,
  GetAccessRightMasterHead,
  getSearchController,
} from "../../utils/NetworkApi/commonApi";
import NoRecordFound from "../../components/formComponent/NoRecordFound";
import { guidNumber } from "../util/Commonservices";
import { EmployeeMasterSchema, EmployeeValidation } from "../../utils/Schema";
import { axiosInstance } from "../../utils/axiosInstance";
import { toast } from "react-toastify";
import { CgTapDouble } from "react-icons/cg";
import {
  autocompleteOnBlur,
  getTrimmedData,
  number,
} from "../../utils/helpers";
import UploadFile from "../utils/UploadFileModal/UploadFile";
import CameraModal from "../utils/CameraModal";
import Accordion from "@app/components/UI/Accordion";
import { SelectBox } from "../../components/formComponent/SelectBox";
import Input from "../../components/formComponent/Input";
import { SelectBoxWithCheckbox } from "../../components/formComponent/MultiSelectBox";
import { languages, searchType, Theme } from "../../utils/Constants";
import Heading from "../../components/UI/Heading";
import Loading from "../../components/loader/Loading";
import { useLocalStorage } from "../../utils/hooks/useLocalStorage";
import DatePicker from "../../components/formComponent/DatePicker";
import moment from "moment/moment";
import AutoComplete from "../../components/formComponent/AutoComplete";
import { Form, Modal } from "react-bootstrap";
import { FaPlus, FaRedo, FaTrash } from "react-icons/fa";
import { CustomButton, SaveButton } from "../../components/UI/CustomButton";
import AccessHeadModal from "./CreateEmployeeMasterModal";
import ReactSelect from "../../components/formComponent/ReactSelect";
import { Dialog } from "primereact/dialog";
import { Tooltip } from "primereact/tooltip";
import Tables from "../../components/UI/customTable";
import AddFamilyMemberModal from "../utils/AddFamilyMemberModal";
import PageControlGear from "../../components/PageGearModel/PageControlGear";
import UltraFastSelect from "../../components/UltraFastSelect/UltraFastSelect";
import Pagination from "../../Pagination/Pagination";
import MultiSelectComp from "../../components/formComponent/MultiSelectComp";

const CreateEmployeeMaster = () => {
  const location = useLocation();
  const { state } = location;
  const navigation = useNavigate();
  const [Title, setTitle] = useState([]);
  const [show, setShow] = useState(false);
  const [uploadImage, setUploadImage] = useState({ show: false, data: "" });
  const [centreId, setCentreId] = useState([]);
  const [error, setError] = useState({});
  const [EmployeeCenter, setEmployeeCenter] = useState([]);
  const [Department, setDepartment] = useState([]);
  const [Designation, setDesigation] = useState([]);
  const [AccessDesignation, setAccessDesigation] = useState([]);
  const [AccessRight, setAccessRight] = useState([]);
  const [AccessHead, setAccessHead] = useState([]);
  const [showAccessHead, setShowAccessHead] = useState(false);
  const PAGE_ID = "26";
  const defaultTheme = useLocalStorage("theme", "get");
  const isMobile = window.innerWidth <= 768;

  const [ApprovalRight, setApprovalRight] = useState([]);
  const [EditData, setEditData] = useState(false);
  const [load, setLoad] = useState(false);
  const [employeeDetails, setEmployeeDetails] = useState({});
  const [salesDesignationList, setSalesDesignationList] = useState([]);
  const [accessDashboards, setAccessDashboards] = useState([]);
  const [reportingManagerList, setReportingManagerList] = useState([]);
  const [employeeDesignationList, setEmployeeDesignationList] = useState([]);
  const [tabbingOrder, setTabbingOrder] = useState([]);
  const [controllerDynamicList, setControllerDynamicList] = useState([]);
  const [StoreLocation, setStoreLocation] = useState([]);
  const [EmployeeMaster, setEmployeeMaster] = useState({
    AccessRight: "",
    AccessHead: "",
    ShowDashboard: 0,
    ApprovalRight: "",
    ApprovalRightID: "",
    Centre: "",
    CentreID: "",
    City: "",
    Department: "",
    Designation: "",
    DesignationID: "",
    AccessDesignation: "",
    AccessDashboard: "",
    DOB: "01-01-2000",
    Email: "",
    HouseNo: "",
    Locality: "",
    Mobile: "",
    Name: "",
    PCity: "",
    PHouseNo: "",
    PLocality: "",
    PPincode: "",
    PStreetName: "",
    Pincode: "",
    StreetName: "",
    Title: "",
    isActive: 1,
    isLoginApprovel: 0,
    isPasswordChanged: 0,
    DefaultCentre: "",
    EmployeeIDHash: guidNumber(),
    canRefund: 0,
    canSettlement: 0,
    canDiscountAfterBill: 0,
    HideRate: 0,
    FirstName: "",
    Password: "",
    Username: "",
    EmpCode: "",
    AMRAccess: "",
    SaveAmendment: "",
    isPassword: true,
    AllowDiscount: 0,
    UnMasking: "",
    IsDoctorPro: "",
    IsOpdConsultant: 0,
    ProEmployee: "",
    Theme: "Default",
    EmpLanguageCode: "en",
    EmpLanguage: "English",
    PolicyId: 0,
    DownTimePointsReviewRight: 0,
    DownTimePointsApprovalRight: 0,
    SuperAdmin: 0,
    OnAppGoToMainList: 0,
    IsInvoicePaymentValidate: 0,
    SkipAutoValidate: 0,
    SalesDesignationName: "",
    SalesDesignationID: 0,
    EmployeeCode: "",
    IsFieldBoy: 0,
    IsOTPLogin: 0,
    LastWorkDayFlag: 0,
    isAllowFamilyMemberPolicy: 0,
    AccessStoreLocation: "",
    LastWorkDay: new Date(new Date().setFullYear(new Date().getFullYear() + 10)),
    AllowLimitDiscountMonthWise: 0,
    LimitDiscountMonthWise: 0,
    AllowLimitDiscountPerLabNo: 0,
    LimitDiscountPerLabNo: 0,
    DefaultDoctorApprovalID: null,
    SalesForce: "",
    AllowSharing: 0,
    ReferShareID: 0,
    IsStoreDashboard: 0,
    BlockExcelPrintout: 0,
    BlockLabReportPrintout: 0,
  });
  console.log(EmployeeMaster, "EmployeeMaster")
  const [employeeList, setEmployeeList] = useState([]);
  const [searchEmployeeSuggestions, setSearchEmployeeSuggestions] = useState(
    [],
  );
  const [doctorAdmin, setDoctorAdmin] = useState([]);
  const [selectSearchEmployee, setSelectSearchEmployee] = useState(false);
  const [searchEmployeeIndex, setSearchEmployeeIndex] = useState(0);
  const [searchEmployeePayload, setSearchEmployeePayload] = useState({
    label: "",
    value: null,
  });

  const [ipPayload, setIpPayload] = useState({
    fromIP: "",
    toIP: "",
  });
  const [ipTable, setIpTable] = useState([]);
  const [ipAccessDetails, setIpAccessDetails] = useState([]);
  const [modal, setModal] = useState(false);
  const [familyMemberModal, setFamilyMemberModal] = useState(false);
  const [stateButton, setStateButton] = useState({
    button: location.state?.button || "Submit",
  });
  const [policyOptions, setPolicyOptions] = useState([]);
  const [rateModal, setRateModal] = useState(false);
  const [rateTypeData, setRateTypeData] = useState([]);
  const [mappedRateData, setMappedRateData] = useState([]);
  const [selectedRowIds, setSelectedRowIds] = useState([]);
  const [selectedRates, setSelectedRates] = useState([]);

  const handleSelectAllChange = (e) => {
    const checked = e.target.checked;
    if (checked) {
      const allIds = mappedRateData.map((item) => item.ID);
      setSelectedRowIds(allIds);
    } else {
      setSelectedRowIds([]);
    }
  };

  const handleRowSelectChange = (e, id) => {
    const checked = e.target.checked;
    setSelectedRowIds((prev) =>
      checked ? [...prev, id] : prev.filter((itemId) => itemId !== id)
    );
  };

  const handleRemoveSelected = () => {
    if (selectedRowIds.length === 0) return;
    axiosInstance
      .post("Employee/DeleteRateTypeMappingOnEmployeeMaster", {
        employeeID: state?.id,
        id: selectedRowIds,
      })
      .then((res) => {
        if (res.data.success) {
          toast.success(res.data.message || "Removed successfully");
          setSelectedRowIds([]);
          getEmployeeRateTypeMapping();
        } else {
          toast.error(res.data.message);
        }
      })
      .catch((err) => {
        toast.error(err?.response?.data?.message || "Error removing");
      });
  };
  const [rateSearchTerm, setRateSearchTerm] = useState("");
  const [logModal, setLogModal] = useState(false);
  const [logDetails, setLogDetails] = useState([]);
  const [logLoading, setLogLoading] = useState(false);
  const userData = useLocalStorage("userData", "get");
  const DefaultCurrencyName = userData?.DefaultCurrencyName;

  //dialog modal
  const [salesManager, setSalesManager] = useState([]);
  const [payload, setPayload] = useState({
    designationID: "",
    name: "",
    employeeID: 0,
    centreID: "0",
    approvalRightID: "",
    accessRightID: "",
    departmentID: "",
    SearchType: "employeeCode",
    ItemValue: "",
    phoneNumber: "",
    email: "",
    employeeCode: "",
    userName: "",
    houseNo: 0,
    SalesForce: ""
  });
  //ratetype 

  const [searchText, setSearchText] = useState("");
  const [tableData, setTableData] = useState([]);
  const [showEmployeeDialog, setShowEmployeeDialog] = useState(false);
  //pagination
  //pagination

  const handleSelectMultiChange = (name, select) => {
    setSelectedRates(Array.isArray(select) ? select : []);
  };
  const filteredTableData = useMemo(() => {
    if (!searchText.trim()) {
      return tableData;
    }

    const searchLower = searchText.toLowerCase().trim();

    return tableData.filter((item) => {

      return (
        item?.Name?.toLowerCase().includes(searchLower) ||
        item?.HouseNo?.toLowerCase().includes(searchLower) ||
        item?.StreetName?.toLowerCase().includes(searchLower) ||
        item?.Locality?.toLowerCase().includes(searchLower) ||
        item?.City?.toLowerCase().includes(searchLower) ||
        item?.Pincode?.toLowerCase().includes(searchLower) ||
        item?.PHouseNo?.toLowerCase().includes(searchLower) ||
        item?.PStreetName?.toLowerCase().includes(searchLower) ||
        item?.PLocality?.toLowerCase().includes(searchLower) ||
        item?.PCity?.toLowerCase().includes(searchLower) ||
        item?.PPincode?.toLowerCase().includes(searchLower) ||
        item?.Mobile?.toLowerCase().includes(searchLower) ||
        item?.Email?.toLowerCase().includes(searchLower)
      );
    });
  }, [tableData, searchText]);
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 50;
  const indexOfLastRow = currentPage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;
  const paginatedTableData = filteredTableData.slice(indexOfFirstRow, indexOfLastRow);

  useEffect(() => {
    setCurrentPage(1);
  }, [filteredTableData]);

  const ColorCodingSearch = ({ color, label }) => (
    <div className="d-flex align-items-center" style={{ gap: "5px" }}>
      <div
        style={{
          width: "20px",
          height: "20px",
          backgroundColor: color,
          border: "1px solid #ccc",
          borderRadius: "10px",
        }}
      />
      <span style={{ fontSize: "12px" }}>{label}</span>
    </div>
  );
  const colorCodingData = [
    { color: "#FFFFFF", id: "1", labelKey: "Active" },
    { color: "#f5c6cb", id: "2", labelKey: "In Active" },
  ];

  const handleSelectBoxChange = (event) => {
    const { name, value, checked, type } = event?.target;
    if (name === "SearchType") {
      setPayload((prev) => ({
        ...prev,
        [name]: value,
        ItemValue: "",
        phoneNumber: "",
        email: "",
        employeeCode: "",
        userName: "",
        houseNo: 0,
        name: "",
        employeeID: 0,
      }));
    }
    else if (name === "ItemValue") {
      if (payload.SearchType === "mobileNumber") {
        setPayload((prev) => ({ ...prev, phoneNumber: value, [name]: value }));
      }
      else if (payload.SearchType === "email") {
        setPayload((prev) => ({ ...prev, email: value, [name]: value }));
      }
      else if (payload.SearchType === "employeeCode") {
        setPayload((prev) => ({ ...prev, employeeCode: value, [name]: value }));
      }
      else if (payload.SearchType === "employeeName") {
        setPayload((prev) => ({ ...prev, name: value, [name]: value }));
      }
      else if (payload.SearchType === "employeeId") {
        setPayload((prev) => ({ ...prev, employeeID: value, [name]: value }));
      }
      else if (payload.SearchType === "userName") {
        setPayload((prev) => ({ ...prev, userName: value, [name]: value }));
      }
      else if (payload.SearchType === "houseNo") {
        setPayload((prev) => ({ ...prev, houseNo: value, [name]: value }));
      }
    }
  }


  const handleSearch = () => {
    setLoad(true);
    const finalPayload = {
      designationID: String(payload.designationID || "").replace(/^,/, ""),
      name: payload.name || "",
      employeeID: payload.employeeID || 0,
      centreID: String(payload.centreID) || "",
      approvalRightID: String(payload.approvalRightID || "").replace(/^,/, ""),
      accessRightID: String(payload.accessRightID || "").replace(/^,/, ""),
      departmentID: String(payload.departmentID || "").replace(/^,/, ""),
      phoneNumber: payload?.phoneNumber || "",
      email: payload?.email || "",
      employeeCode: payload?.employeeCode || "",
      userName: payload?.userName || "",
      houseNo: payload?.houseNo || "",
    };

    axiosInstance
      .post("Employee/GetEmployeeDetailsSearch", finalPayload)
      .then((res) => {
        if (res.data.success && Array.isArray(res.data.message)) {
          setTableData(res.data.message);
          setLoad(false);
        } else {
          toast.error("No Data Found");
          setLoad(false);
        }
      })
      .catch(() => {
        setTableData([]);
        toast.error("No Data Found");
        setLoad(false);
      });
  };

  const getSalesManager = () => {
    axiosInstance
      .get("Employee/ProEmployee")
      .then((res) => {
        const data = res?.data?.message;

        const Type = data?.map((ele) => ({
          value: ele?.EmployeeID,
          label: ele?.EmployeeName,
        }));

        setSalesManager(Type);
      })
      .catch((err) => {
        toast.error(
          err?.response?.data?.message || "Something Went Wrong"
        );
      });
  };

  const BindApprovalDoctor = async () => {
    try {
      setLoad(true);
      const [doctorRes] = await Promise.all([
        axiosInstance.post("CommonController/Fetchprocedure", {
          typeName: "inHouse_Doctorsanddepartment",
          params: ["Doctor", "0"],
        }),
      ]);

      const doctorListRes =
        doctorRes?.data?.data?.map((item) => ({
          label: item?.EmployeeName,
          value: item?.EmployeeID,
        })) || [];
      setDoctorAdmin(doctorListRes);
    } catch (error) {
      setLoad(false);
      console.error("Error fetching doctors/departments:", error);
    } finally {
      setLoad(false);
    }
  };

  useEffect(() => {
    getSalesManager();
    BindApprovalDoctor()
  }, []);

  //new added checkbox for block printout
  const handleToggleChange = (e) => {
    const { name, checked } = e.target;
    console.log("Amit", name, checked);

    setEmployeeMaster(prev => ({
      ...prev,
      [name]: checked ? 1 : 0
    }));
  };


  //dailog modal end

  const handleIpChange = (e) => {
    const { name, value } = e.target;
    setIpPayload((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const dateSelect = (value, name) => {
    setEmployeeMaster({
      ...EmployeeMaster,
      [name]: value,
    });
  };
  const CompanyCode = useLocalStorage("userData", "get")?.CompanyCode;
  const { t } = useTranslation();
  const handleChange = (e) => {
    const { name, value } = e.target;
    setEmployeeMaster({ ...EmployeeMaster, [name]: value });
  };
  const user = useLocalStorage("userData", "get").AllowDoctorTempCreation
  console.log("user", user)
  const GetActiveSalesDesignation = async () => {
    await axiosInstance
      .get("Employee/GetActiveSalesDesignation")
      .then((res) => {
        const desList = res.data?.message?.map((ele) => ({
          label: ele.DesignationName,
          value: ele.DesignationID,
        }));
        setSalesDesignationList(desList);
      })
      .catch((err) => { })
      .finally(() => { });
  };
  const GetActiveDashboard = async () => {
    await axiosInstance
      .post("ESG/GetDashboards", {
        dashboardName: "",
        isActive: 0,
        moduleID: 0,
      })
      .then((res) => {
        const desList = res.data?.message?.map((ele) => ({
          label: ele.DashboardName,
          value: ele.DashboardID,
        }));
        setAccessDashboards(desList);
      })
      .catch((err) => { })
      .finally(() => { });
  };

  useEffect(() => {
    const GetReportingManager = async () => {
      await axiosInstance
        .post("Employee/GetSalesEmployeeDesingationID", {
          salesDesignationID: Number(EmployeeMaster?.SalesDesignationName),
        })
        .then((res) => {
          const desList = res.data?.message?.map((ele) => ({
            label: ele?.EmployeeName,
            value: ele?.EmployeeID,
          }));
          setReportingManagerList(desList);
        })
        .catch((err) => { })
        .finally(() => { });
    };

    GetReportingManager();
  }, [EmployeeMaster?.SalesDesignationName]);

  const GetSalesEmployeeDesingationID = async (designationName) => {
    await axiosInstance
      .post("Employee/GetSalesEmployeeDesingationID", {
        DesignationName: designationName,
      })
      .then((res) => {
        const empList = res.data?.message?.map((ele) => ({
          label: ele?.EmployeeName,
          value: ele?.EmployeeID,
        }));
        setReportingManagerList(empList);
      })
      .catch((err) => { })
      .finally(() => { });
  };

  const getAccessStoreLocation = async () => {
    try {
      const res = await axiosInstance
        .post("Employee/BindStoreAccessLocation")
        .then((res) => {
          const data = res.data?.message?.map((ele) => ({
            label: ele?.Location,
            value: ele?.LocationID,
          }));
          setStoreLocation(data);
        });
    } catch (error) {
      toast.error(error?.response?.data?.message);
      console.error("Error fetching store access locations:", error);
    }
  };

  const getPolicyOptions = async () => {
    try {
      const res = await axiosInstance.post("Employee/GetFamilyPolicies", {
        policyId: 0,
        isActive: 1,
      });
      if (res.data?.success && Array.isArray(res.data?.message)) {
        setPolicyOptions(
          res.data?.message?.map((item) => ({
            value: item?.PolicyID,
            label: item?.PolicyName,
          })),
        );
      } else {
        console.log(res?.data?.message);
      }
    } catch (error) {
      console.log("Error while saving policy", error);
    }
  };

  useEffect(() => {
    GetActiveSalesDesignation();
    GetActiveDashboard();
    getPolicyOptions();
    getAccessStoreLocation();
    getRateTypeList();
    // GetSalesEmployeeDesingationID()
  }, []);

  const selectSalesDesignation = salesDesignationList?.find(
    (item) => item?.value == EmployeeMaster?.SalesDesignationID,
  );

  const accessDesignationList = useMemo(() => {
    const accessValue = EmployeeMaster?.AccessDesignation;
    const accessIds = Array.isArray(accessValue)
      ? accessValue
      : accessValue
        ? String(accessValue).split(",")
        : [];
    if (accessIds.length === 0) return [];
    return Designation?.filter((ele) =>
      accessIds.some((id) => String(id) === String(ele?.value)),
    );
  }, [Designation, EmployeeMaster?.AccessDesignation]);

  useEffect(() => {
    // Wait until the full designation list has loaded so this doesn't
    // wrongly clear a valid selection while data is still arriving.
    if (!Designation || Designation.length === 0) return;
    if (!EmployeeMaster?.DesignationID) return;
    const stillAllowed = accessDesignationList?.some(
      (ele) => String(ele?.value) === String(EmployeeMaster?.DesignationID),
    );
    if (!stillAllowed) {
      setEmployeeMaster((prev) => ({
        ...prev,
        Designation: "",
        DesignationID: "",
      }));
    }
  }, [accessDesignationList, Designation]);

  const handleSubmit = (e) => {
    console.log("finalPayload", EmployeeMaster);

    e.preventDefault();
    const err = EmployeeValidation(EmployeeMaster);
    const access = EmployeeMaster?.AccessRight;
    const hasAccess =
      Array.isArray(access)
        ? access.includes(1)
        : String(access).split(",").includes("1");

    if (EmployeeMaster?.AllowSharing == 1 && !hasAccess) {
      toast.error("Please also select Approval Right for this Employee");
      return;
    }
    if (Object?.keys(err)?.length == 0) {
      setLoad(true);
      axiosInstance
        .post(
          "Employee/checkDublicateUserName",
          state
            ? {
              UserName: EmployeeMaster?.Username,
              EmployeeID: state?.id,
            }
            : {
              UserName: EmployeeMaster?.Username,
              EmployeeID: "",
            },
        )
        .then((res) => {
          if (res?.data?.success) {
            setLoad(true);
            axiosInstance
              .post(state?.url2 ? state?.url2 : "Employee/SaveNewEmployee", {
                EmployeeMaster: [
                  {
                    ReportingEmployeeID: Number(
                      EmployeeMaster?.ReportingEmployeeID || 0,
                    ),
                    SalesDesignationName: selectSalesDesignation?.label || "",
                    SalesDesignationID: EmployeeMaster?.SalesDesignationID || 0,
                    EmployeeCode: EmployeeMaster?.EmployeeCode,
                    EmployeeID: state?.id,
                    AccessRight: Array?.isArray(EmployeeMaster?.AccessRight)
                      ? EmployeeMaster?.AccessRight?.join(",")
                      : EmployeeMaster?.AccessRight,
                    AccessDashboard: Array?.isArray(
                      EmployeeMaster?.AccessDashboard,
                    )
                      ? EmployeeMaster?.AccessDashboard?.join(",")
                      : EmployeeMaster?.AccessDashboard,
                    AccessDesignation: Array?.isArray(
                      EmployeeMaster?.AccessDesignation,
                    )
                      ? EmployeeMaster?.AccessDesignation?.join(",")
                      : EmployeeMaster?.AccessDesignation,
                    ApprovalRight: Array?.isArray(EmployeeMaster?.ApprovalRight)
                      ? EmployeeMaster?.ApprovalRight?.join(",")
                      : EmployeeMaster?.ApprovalRight,
                    Centre: Array?.isArray(EmployeeMaster?.Centre)
                      ? EmployeeMaster?.Centre?.join(",")
                      : EmployeeMaster?.Centre,
                    AccessStoreLocation: Array?.isArray(
                      EmployeeMaster?.AccessStoreLocation,
                    )
                      ? EmployeeMaster?.AccessStoreLocation?.join(",")
                      : EmployeeMaster?.AccessStoreLocation,
                    CentreID: EmployeeMaster?.CentreID,
                    City: EmployeeMaster?.City,
                    Department: Array?.isArray(EmployeeMaster?.Department)
                      ? EmployeeMaster?.Department?.join(",")
                      : EmployeeMaster?.Department,
                    Designation: EmployeeMaster?.Designation,
                    DesignationID: EmployeeMaster?.DesignationID,
                    Email: EmployeeMaster?.Email,
                    HouseNo: EmployeeMaster?.HouseNo,
                    Locality: EmployeeMaster?.Locality,
                    Mobile: (EmployeeMaster?.Mobile).toString(),
                    Name: EmployeeMaster?.Name,
                    PCity: EmployeeMaster?.PCity,
                    PHouseNo: EmployeeMaster?.PHouseNo,
                    DOB: moment(EmployeeMaster?.DOB).format("YYYY-MM-DD"),
                    PLocality: EmployeeMaster?.PLocality,
                    PPincode: EmployeeMaster?.PPincode,
                    PStreetName: EmployeeMaster?.PStreetName,
                    Pincode: EmployeeMaster?.Pincode,
                    StreetName: EmployeeMaster?.StreetName,
                    Title: EmployeeMaster?.Title,
                    isActive: EmployeeMaster?.isActive,
                    isLoginApprovel: EmployeeMaster?.isLoginApprovel,
                    isPasswordChanged: EmployeeMaster?.isPasswordChanged,
                    EmployeeIDHash: EmployeeMaster?.EmployeeIDHash,
                    DefaultCentre: EmployeeMaster?.DefaultCentre,
                    canRefund: EmployeeMaster?.canRefund,
                    canSettlement: EmployeeMaster?.canSettlement,
                    canDiscountAfterBill: EmployeeMaster?.canDiscountAfterBill,
                    HideRate: EmployeeMaster?.HideRate,
                    AMRAccess: EmployeeMaster?.AMRAccess,
                    SaveAmendment: EmployeeMaster?.SaveAmendment,
                    AllowDiscount: EmployeeMaster?.AllowDiscount,
                    UnMasking: EmployeeMaster?.UnMasking,
                    ShowDashboard: EmployeeMaster?.ShowDashboard,
                    ImageGuid: uploadImage.data,
                    IsDoctorPro: EmployeeMaster?.IsDoctorPro,
                    IsOpdConsultant: Number(EmployeeMaster?.IsOpdConsultant || 0),
                    ProEmployee: EmployeeMaster?.ProEmployee,
                    Theme: EmployeeMaster?.Theme,
                    EmpLanguageCode: EmployeeMaster?.EmpLanguageCode,
                    EmpLanguage: EmployeeMaster?.EmpLanguage,
                    PolicyId: EmployeeMaster?.PolicyId ?? 0,
                    DownTimePointsReviewRight:
                      EmployeeMaster?.DownTimePointsReviewRight,
                    DownTimePointsApprovalRight:
                      EmployeeMaster?.DownTimePointsApprovalRight,

                    SuperAdmin: EmployeeMaster?.SuperAdmin,
                    OnAppGoToMainList: EmployeeMaster?.OnAppGoToMainList,
                    IsInvoicePaymentValidate:
                      EmployeeMaster?.IsInvoicePaymentValidate,
                    SkipAutoValidate: EmployeeMaster?.SkipAutoValidate,
                    IsOTPLogin: Number(EmployeeMaster?.IsOTPLogin || 0),
                    IsStoreDashboard: Number(EmployeeMaster?.IsStoreDashboard || 0),
                    LastWorkDayFlag: EmployeeMaster?.LastWorkDayFlag,
                    isAllowFamilyMemberPolicy: EmployeeMaster?.isAllowFamilyMemberPolicy,
                    LastWorkDay: EmployeeMaster?.LastWorkDay
                      || new Date(new Date().setFullYear(new Date().getFullYear() + 10)),
                    AllowLimitDiscountMonthWise: EmployeeMaster?.AllowLimitDiscountMonthWise,
                    LimitDiscountMonthWise: Number(EmployeeMaster?.LimitDiscountMonthWise),
                    AllowLimitDiscountPerLabNo: EmployeeMaster?.AllowLimitDiscountPerLabNo,
                    LimitDiscountPerLabNo: Number(EmployeeMaster?.LimitDiscountPerLabNo),
                    DefaultDoctorApprovalID: EmployeeMaster?.DefaultDoctorApprovalID || null,
                    IsFieldBoy: EmployeeMaster?.IsFieldBoy || 0,
                    AllowSharing: Number(EmployeeMaster?.AllowSharing) || 0,
                    ReferShareID: EmployeeMaster?.AllowSharing == 1 ? Number(EmployeeMaster?.ReferShareID) : 0,
                    BlockExcelPrintout: Number(EmployeeMaster?.BlockExcelPrintout || 0),
                    BlockLabReportPrintout: Number(EmployeeMaster?.BlockLabReportPrintout || 0),
                  },
                ],
                userData: [
                  getTrimmedData({
                    DesignationId: Number(EmployeeMaster?.DesignationID),
                    FirstName: EmployeeMaster?.Name,
                    Password: EmployeeMaster?.Password,
                    Username: EmployeeMaster?.Username,
                  }),
                ],
                isAllowFamilyMemberPolicy:
                  EmployeeMaster?.isAllowFamilyMemberPolicy,
              })
              .then((res) => {
                toast.success(res?.data?.message);
                setLoad(false);
                handleReset();
                // navigation("/CreateEmployeeMaster");
              })
              .catch((err) => {
                console.log("insert err", err);
                toast.error(
                  err.response?.data?.message
                    ? err.response?.data?.message
                    : err.response?.data,
                );
                setLoad(false);
              });
          } else {
            setLoad(false);
            toast.error("Duplicate Username");
          }
        })
        .catch((err) => {
          setLoad(false);
          toast.error(err?.response?.data?.message);
          setEmployeeMaster({
            ...EmployeeMaster,
            Username: "",
          });
        });
    } else {
      setLoad(false);
      console.log(err);
      setError(err);
    }
  };

  const handleChanges = (select, name) => {

    const val = select?.map((ele) => ele?.value);
    setEmployeeMaster({ ...EmployeeMaster, [name]: val });
  };

  // console.log("EmployeeCenter", EmployeeCenter);

  const handleMultiSelect = (select, name) => {
    setCentreId(select);
    const val = select?.map((ele) => ele?.value);
    setEmployeeMaster((prev) => ({
      ...prev,
      [name]: val,
      ...(DefaultCurrencyName !== "KES" && {
        CentreID: select?.[0]?.value,
      }),
    }));
  };

  const handleReactSelectChange = (name, selectedOption) => {
    setEmployeeMaster((prev) => ({
      ...prev,
      [name]: selectedOption?.label,
      DesignationID: selectedOption?.value,
      Designation: selectedOption?.label,
    }));
  };

  const handleSelectChange = (event) => {
    const { name, value, selectedIndex } = event?.target;
    const label = event?.target?.children[selectedIndex].text;
    if (name === "Designation") {
      setEmployeeMaster({
        ...EmployeeMaster,
        [name]: label,
        DesignationID: value,
      });
    } else if (name === "EmpLanguageCode") {
      setEmployeeMaster({
        ...EmployeeMaster,
        [name]: value,
        EmpLanguage: label,
      });
    } else {
      setEmployeeMaster({ ...EmployeeMaster, [name]: value });
    }
    if (name === "SalesDesignationName") {
      GetSalesEmployeeDesingationID(value);
    }
  };

  const handleReactSelect = (name, value) => {
    if (name === "SalesDesignationName") {
      GetSalesEmployeeDesingationID(value?.value);

      // setEmployeeMaster((prev) => ({
      //   ...prev,
      //   [name]: value?.value
      // }))
    }
    if (name === "SalesForce") {                          // ✅ trigger API on SalesForce change
      setSelectedRates([]);
      getRateTypeList(value?.value ? [value.value] : []);
    }
    setEmployeeMaster((prev) => ({
      ...prev,
      [name]: value?.value,
    }));
  };

  const getGenderDropdown = (name) => {
    axiosInstance.post("Global/getGlobalData", { Type: name }).then((res) => {
      let data = res.data.message;
      let value = data.map((ele) => {
        return {
          value: ele.FieldDisplay,
          label: ele.FieldDisplay,
        };
      });
      setTitle(value);
    });
  };

  const getDesignID = (checked) => {
    const design = Designation?.filter((ele) => {
      return ele?.label == "Sales Person";
    });
    if (checked && design?.length > 0) {
      return design[0]?.value;
    } else {
      return Designation[0]?.value;
    }
  };
  const getLabel = (value) => {
    const design = Designation?.filter((ele) => {
      return ele?.value == value;
    });
    return design[0]?.label;
  };
const handleInputChange = (e) => {
  // Guard against undefined event or target (e.g., custom component)
  const target = e?.target || e;
  if (!target) {
    console.warn('handleInputChange called without a target');
    return;
  }
  const { name, value, type, checked } = target;
  // Guard against missing name which caused the original error
  if (!name) {
    console.warn('handleInputChange: missing name attribute', target);
    return;
  }
  const newValue = type === "checkbox" ? (checked ? 1 : 0) : value;
  if (name === "IsOpdConsultant" && type === "checkbox" && !checked && Number(EmployeeMaster?.IsOpdConsultant || 0) === 1) {
    if (!window.confirm("Disabling OPD Consultant will hide this doctor from OPD booking and schedules. Continue?")) {
      return;
    }
  }
  if (name === "ProEmployee") {
    setEmployeeMaster({
      ...EmployeeMaster,
      [name]: newValue,
      //DesignationID: getDesignID(checked),
      ShowDashboard: 0,
      Designation: getLabel(getDesignID(checked)),
    });
  } else {
    setEmployeeMaster({
      ...EmployeeMaster,
      [name]: newValue,
    });
  }
};

  const getEditDefaultDropDown = (data) => {
    const val = data.split(",");
    const newData = EmployeeCenter.map((ele) => {
      return val.includes(String(ele?.value)) && ele;
    });
    return newData;
  };

  const passwordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{8,})/;
  const fetch = () => {
    setEditData(true);
    axiosInstance
      .post(state?.url1, {
        EmployeeID: state?.id,
      })
      .then((res) => {
        const responseData = res.data.message[0];
        setEmployeeDetails({
          ...responseData,
          LastWorkDay: new Date(responseData.LastWorkDay),
        });
        // const Username = responseData?.Username.split("-")[1];
        //fix username
        const Username = responseData?.Username?.includes("-")
          ? responseData?.Username?.split("-").slice(1).join("-")
          : responseData?.Username;
        //access designation
        const accessDesignationArray = responseData?.DesignationAccessId
          ? responseData.DesignationAccessId.split(",")
            .map((item) => Number(item))
            .filter(Boolean)
          : [];
        //accessDashboard
        const accessDashboardArray = responseData?.DashboardAccessId
          ? responseData.DashboardAccessId.split(",")
            .map((item) => Number(item))
            .filter(Boolean)
          : [];

        const data = {
          ...responseData,

          DOB:
            responseData?.DOB == "00-00-0000"
              ? "01-01-2000"
              : responseData?.DOB,
          DesignationID: responseData?.DesignationID,
          Username: Username,
          User: responseData?.Username,
          isPassword: false,
          SuperAdmin: responseData?.SuperAdmin,
          AccessDashboard: accessDashboardArray,
          AccessDesignation: accessDesignationArray,
          SalesDesignationName: responseData?.SalesDesignationName,
          SalesDesignationID: responseData?.SalesDesignationID,
          PolicyId: responseData?.PolicyId,
          DefaultDoctorApprovalID: responseData?.DefaultDoctorApprovalID,
          isAllowFamilyMemberPolicy: responseData?.IsAllowFamilyMemberPolicy,
          LastWorkDay: responseData?.LastWorkDay ? new Date(responseData.LastWorkDay) : null,
        };
        setUploadImage({
          show: false,
          data: data?.ImageGuid ? data?.ImageGuid : "",
        });
        setEmployeeMaster({ ...EmployeeMaster, ...data });
        fetchDepartments(data);
        const dropdown = getEditDefaultDropDown(data?.CentreList);
        setCentreId(dropdown);
      })
      .catch((err) => {
        setEditData(false);
        toast.error(
          err?.response?.data?.message
            ? err?.response?.data?.message
            : "Error Occured",
        );
      });
  };

  const [CopyRightEmployeeID, SetCopyRightEmployeeID] = useState("");
  console.log("CopyRightEmployeeID", CopyRightEmployeeID);

  const copyEmployeeDataID = async (id) => {
    try {
      const res = await axiosInstance.post("Employee/getEmployeeDetailsByID", {
        EmployeeID: id,
      });
      const apiData = res?.data;
      if (apiData?.success) {
        const responseData = apiData.message[0];

        const accessDesignationArray = responseData?.DesignationAccessId
          ? responseData.DesignationAccessId.split(",")
            .map((item) => Number(item))
            .filter(Boolean)
          : [];
        //accessDashboard
        const accessDashboardArray = responseData?.DashboardAccessId
          ? responseData.DashboardAccessId.split(",")
            .map((item) => Number(item))
            .filter(Boolean)
          : [];
        const centreArray = responseData?.CentreList
          ? responseData.CentreList.split(",")
            .map((item) => Number(item))
            .filter(Boolean)
          : [];

        // Fetch Department
        let departmentVal = "";
        try {
          const deptRes = await axiosInstance.post(
            "Employee/getAccessDepartment",
            {
              EmployeeID: id,
            },
          );
          if (deptRes?.data?.success) {
            for (let i = 0; i < deptRes.data.message.length; i++) {
              departmentVal =
                departmentVal === ""
                  ? `${deptRes.data.message[i].DepartmentID}`
                  : `${departmentVal},${deptRes.data.message[i].DepartmentID}`;
            }
          }
        } catch (err) {
          console.log("Error fetching departments:", err);
        }

        // Fetch AccessRight
        let accessRightVal = "";
        try {
          const accessRes = await axiosInstance.post(
            "Employee/SearchAccessRight",
            {
              EmployeeID: id,
            },
          );
          if (accessRes?.data?.success) {
            for (let i = 0; i < accessRes.data.message.length; i++) {
              accessRightVal =
                accessRightVal === ""
                  ? `${accessRes.data.message[i].AccessRightID}`
                  : `${accessRightVal},${accessRes.data.message[i].AccessRightID}`;
            }
          }
        } catch (err) {
          console.log("Error fetching access rights:", err);
        }

        let approvalRightVal = "";
        try {
          const approvalRes = await axiosInstance.post(
            "Employee/SearchApprovalRight",
            {
              EmployeeID: id,
            },
          );
          if (approvalRes?.data?.success) {
            for (let i = 0; i < approvalRes.data.message.length; i++) {
              approvalRightVal =
                approvalRightVal === ""
                  ? `${approvalRes.data.message[i].ApprovalRightID}`
                  : `${approvalRightVal},${approvalRes.data.message[i].ApprovalRightID}`;
            }
          }
        } catch (err) {
          console.log("Error fetching approval rights:", err);
        }

        const data = {
          AccessDashboard: accessDashboardArray,
          AccessDesignation: accessDesignationArray,
        };

        setEmployeeMaster({
          ...EmployeeMaster,
          DesignationID: responseData?.DesignationID,
          EmpLanguage: responseData?.EmpLanguage,
          EmpLanguageCode: responseData?.EmpLanguageCode,
          Theme: responseData?.Theme,
          AccessDashboard: accessDashboardArray,
          AccessDesignation: accessDesignationArray,
          Centre: centreArray,
          ApprovalRight: approvalRightVal,
          DefaultDoctorApprovalID: responseData?.DefaultDoctorApprovalID,
          isAllowFamilyMemberPolicy: responseData?.isAllowFamilyMemberPolicy,
        });
      }
    } catch (error) {
      console.log("Error", error);
    }
  };

  const CopyRightChange = (name, value) => {
    SetCopyRightEmployeeID(value?.value);
    copyEmployeeDataID(value?.value);
  };

  const rateTypeMapChange = (name, value) => {
    setSelectedRates(value?.value)
  }

  const fetchDepartments = (data) => {
    axiosInstance
      .post("Employee/getAccessDepartment", {
        EmployeeID: state?.id,
      })
      .then((res) => {
        if (res?.data?.success) {
          let val = "";
          for (let i = 0; i < res.data.message.length; i++) {
            val =
              val === ""
                ? `${res.data.message[i].DepartmentID}`
                : `${val},${res.data.message[i].DepartmentID}`;
          }
          const data1 = { ...data, Department: val };
          fetchAccessCenter(data1);
        } else {
          const data1 = { ...data, Department: [] };
          fetchAccessCenter(data1);
        }
      })
      .catch((err) => {
        setEditData(false);
        toast.error(
          err?.response?.data?.message
            ? err?.response?.data?.message
            : "Error Occured",
        );
      });
  };

  const handleSearchEmployeeChange = (e) => {
    const value = e.target.value;
    setSearchEmployeePayload({ label: value, value: null });

    if (!value.trim()) {
      // empty — reset list
      setSelectSearchEmployee(false);
      setSearchEmployeeSuggestions(employeeList);
    } else {
      // filter employees
      // const filtered = employeeList.filter((emp) =>
      //   emp.label.toLowerCase().includes(value.toLowerCase()),
      // );
      const lowerValue = value.toLowerCase();
      const filtered = employeeList.filter(
        (c) =>
          c.label?.toLowerCase().includes(lowerValue) ||
          c.fullName?.toLowerCase().includes(lowerValue) ||
          c.value?.toString().includes(lowerValue) ||
          c.Mobile?.toLowerCase().includes(lowerValue) ||
          c.Username?.toLowerCase().includes(lowerValue),
      );
      setSearchEmployeeSuggestions(filtered);
      setSelectSearchEmployee(true);
      setSearchEmployeeIndex(0);
    }
  };

  const handleSearchEmployeeKeyDown = (e) => {
    if (!selectSearchEmployee || searchEmployeeSuggestions.length === 0) return;

    if (e.key === "ArrowUp") {
      setSearchEmployeeIndex((prev) =>
        prev > 0 ? prev - 1 : searchEmployeeSuggestions.length - 1,
      );
    } else if (e.key === "ArrowDown") {
      setSearchEmployeeIndex((prev) =>
        prev === searchEmployeeSuggestions.length - 1 ? 0 : prev + 1,
      );
    } else if (e.key === "Enter") {
      handleSearchEmployeeSelect(
        searchEmployeeSuggestions[searchEmployeeIndex],
      );
      setSearchEmployeeIndex(0);
    }
    // switch (e.which) {
    //   case 38:
    //     if (searchEmployeeIndex !== 0) {
    //       setSearchEmployeeIndex(searchEmployeeIndex - 1);
    //     } else {
    //       setSearchEmployeeIndex(searchEmployeeSuggestions.length - 1);
    //     }
    //     break;
    //   case 40:
    //     if (searchEmployeeSuggestions.length - 1 === searchEmployeeIndex) {
    //       setSearchEmployeeIndex(0);
    //     } else {
    //       setSearchEmployeeIndex(searchEmployeeIndex + 1);
    //     }
    //     break;
    //   case 13:
    //     handleSearchEmployeeSelect(searchEmployeeSuggestions[searchEmployeeIndex]);
    //     setSearchEmployeeIndex(0);
    //     break;
    //   default:
    //     break;
    // }
  };

  const handleSearchEmployeeSelect = (selected) => {
    navigation("/CreateEmployeeMaster", {
      state: {
        url1: "Employee/getEmployeeDetailsByID",
        url2: "Employee/UpdateEmployee",
        id: selected?.value,
        button: "Update",
      },
    });
    if (!selected) return;

    setStateButton({ button: "Update" });

    setSearchEmployeePayload(selected);
    setSelectSearchEmployee(false);
  };

  const fetchAccessCenter = (data) => {
    axiosInstance
      .post("Employee/SearchAccessCentre", {
        EmployeeID: state?.id,
      })
      .then((res) => {
        let val = "";
        for (let i = 0; i < res.data.message.length; i++) {
          val =
            val === ""
              ? `${res.data.message[i].CentreID}`
              : `${val},${res.data.message[i].CentreID}`;
        }
        const data1 = { ...data, Centre: val };
        fetchAccessRight(data1);
      })
      .catch((err) => {
        const data1 = { ...data, Centre: [] };
        fetchAccessRight(data1);
        setEditData(false);
        toast.error(
          err?.response?.data?.message
            ? err?.response?.data?.message
            : "Error Occured",
        );
      });
  };

  const fetchAccessRight = (data) => {
    axiosInstance
      .post("Employee/SearchAccessRight", {
        EmployeeID: state?.id,
      })
      .then((res) => {
        let val = "";
        for (let i = 0; i < res.data.message.length; i++) {
          val =
            val === ""
              ? `${res.data.message[i].AccessRightID}`
              : `${val},${res.data.message[i].AccessRightID}`;
        }
        const data1 = { ...data, AccessRight: val };
        fetchAccessApproval(data1);
      })
      .catch((err) => {
        const data1 = { ...data, AccessRight: [] };
        fetchAccessApproval(data1);
        setEditData(false);
      });
  };

  const fetchAccessApproval = (data) => {
    axiosInstance
      .post("Employee/SearchApprovalRight", {
        EmployeeID: state?.id,
      })
      .then((res) => {
        if (res?.data?.success) {
          let val = "";
          for (let i = 0; i < res.data.message.length; i++) {
            val =
              val === ""
                ? `${res.data.message[i].ApprovalRightID}`
                : `${val},${res.data.message[i].ApprovalRightID}`;
          }
          setEmployeeMaster({ ...data, ApprovalRight: val });
        } else {
          setEmployeeMaster({ ...data, ApprovalRight: [] });
        }

        setEditData(false);
      })
      .catch((err) => {
        setEmployeeMaster({ ...data, ApprovalRight: [] });
        setEditData(false);
        toast.error(
          err?.response?.data?.message
            ? err?.response?.data?.message
            : "Error Occured",
        );
      });
  };

  const getEmployeeDetails = () => {
    const apiPayload = {
      employeeID: 0,
      employeeName: searchEmployeePayload.label || "",
    };
    axiosInstance
      .post("Employee/getEmployee", apiPayload)
      .then((res) => {
        const data = res?.data?.message || [];
        let employeeList = data.map((ele) => {
          const fullName = `${ele?.EmployeeName}, EmployeeId :${ele?.EmployeeID}${ele?.EmployeeCode ? `, EmployeeCode :${ele?.EmployeeCode}` : ""}${ele?.Mobile ? `, Mobile :${ele?.Mobile}` : ""}${ele?.Username ? `, Username :${ele?.Username}` : ""}`;

          return {
            value: ele.EmployeeID,
            label: ele.EmployeeName || "",
            fullName: fullName,
            Mobile: ele?.Mobile || "",
            Username: ele?.Username || "",
          };
        });
        setEmployeeList(employeeList);
        setSearchEmployeeSuggestions(employeeList);
      })
      .catch((err) => console.log(err));
  };

  const getEmployeeIPaccesssDetails = () => {
    axiosInstance
      .get(`Employee/getEmployeeIPaccesssDetails?EmployeeID=${state.id}`)
      .then((res) => {
        console.log("API Response:", res.data);

        const list = res.data?.message;

        if (!Array.isArray(list)) {
          setIpAccessDetails([]);
          return;
        }
        setIpAccessDetails(list);
      })
      .catch((err) => {
        console.error("API Error:", err);
        setIpAccessDetails([]);
      });
  };

  const saveIp = async () => {
    const IPPayload = {
      fromIP: ipPayload.fromIP,
      toIP: ipPayload.toIP,
      EmployeeID: state?.id,
    };

    try {
      const res = await axiosInstance.post(
        "Employee/SaveEmployeeAccessIP",
        IPPayload,
      );

      const msg = res?.data?.message || "";
      const success = res?.data?.success;

      if (success) {
        toast.success(msg);
        setIpTable((prev) => [
          ...prev,
          {
            id: prev.length + 1,
            fromIP: ipPayload.fromIP,
            toIP: ipPayload.toIP,
          },
        ]);
        setIpPayload({ fromIP: "", toIP: "" });

        getEmployeeIPaccesssDetails();
      } else {
        toast.error(msg);
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || "Error saving IP");
    }
  };

  const deleteEmployeeIPacessDetails = (id) => {
    axiosInstance
      .post("Employee/DeleteEmployeeIPAccess", { id })
      .then((res) => {
        toast.success(res?.data?.message || "Deleted successfully");

        setIpAccessDetails((prev) => prev.filter((item) => item.id !== id));
      })
      .catch((err) => {
        toast.error(err?.response?.data?.message || "Error deleting");
      });
  };

  // const getRateTypeList = () => {
  //   axiosInstance
  //     .get("RateType/getAccessRateType")
  //     .then((res) => {
  //       const data = res.data.message;
  //       const val = data.map((ele) => ({
  //         value: ele.RateTypeID,
  //         label: ele.Rate,
  //       }));
  //       setRateTypeData(val);
  //     })
  //     .catch((err) => {
  //       console.log(err);
  //     });
  // };
  //ratetypedrodwon
  const getRateTypeList = (salesManagerId = []) => {
    axiosInstance
      .post("Centre/GetRateTypeWithSales", {
        centreId: centreId?.map((ele) => String(ele?.value)) || [],
        isEstimate: 0,
        salesManagerId: salesManagerId?.length > 0
          ? salesManagerId.map(String)
          : [],
      })
      .then((res) => {
        const data = res.data.message;
        const val = data.map((ele) => ({
          value: ele.RateTypeID,
          label: ele.RateTypeName,
        }));
        setRateTypeData(val);
      })
      .catch((err) => {
        console.log(err);
      });
  };


  const getEmployeeLog = () => {
    setLogLoading(true);
    axiosInstance
      .get(`Employee/GetEmployeeLogs?masterId=${state?.id || 0}`)
      .then((res) => {
        if (res.data.success) {
          setLogDetails(res?.data?.message || []);
        } else {
          setLogDetails([]);
          toast.error(res?.data?.message || t("No Log Found"));
        }
        setLogLoading(false);
        setLogModal(true);
      })
      .catch(() => {
        toast.error(t("Error fetching logs"));
        setLogLoading(false);
      });
  };

  const getEmployeeRateTypeMapping = () => {
    axiosInstance
      .post(`/Employee/GetRateTypeMappingByEmployee`, {
        employeeID: state?.id,
      })
      .then((res) => {
        const activeMappings = (res.data?.message || []).filter(
          (item) => item.IsActive !== 0
        );
        setMappedRateData(activeMappings);
      })
      .catch((err) => {
        console.error(err);
        setMappedRateData([]);
      });
  };

  const saveEmployeeRateTypeMapping = () => {
    const rates = Array.isArray(selectedRates) ? selectedRates : (selectedRates ? [selectedRates] : []);

    if (rates.length === 0) {
      toast.error("Please select at least one Rate Type");
      return;
    }
    if (selectedRates == 0) {
      toast.error("Please select at least one Rate Type");
      return;
    }

    const payload = {
      employeeID: state?.id,
      // rateTypeID: selectedRates.map((id) => ({
      //   rateTypeID: id,
      // })),
      rateTypeID: rates.map((id) => ({ rateTypeID: id })),
      // rateTypeID: [
      //   {
      //     "rateTypeID": selectedRates || 0,
      //   }
      // ],
    };

    axiosInstance
      .post("Employee/RateTypeMappingOnEmployeeMaster", payload)
      .then((res) => {
        if (res.data.success) {
          toast.success(res.data.message);
          setSelectedRates(0);
          getEmployeeRateTypeMapping();
        } else {
          toast.error(res.data.message);
        }
      })
      .catch((err) => {
        toast.error(err?.response?.data?.message || "Error saving mapping");
      });
  };

  const deleteEmployeeRateTypeMapping = (id) => {
    const payload = {
      employeeID: state?.id,
      id: [id],
    };

    axiosInstance
      .post("Employee/DeleteRateTypeMappingOnEmployeeMaster", payload)
      .then((res) => {
        if (res.data.success) {
          toast.success(res.data.message || "Removed successfully");
          getEmployeeRateTypeMapping();
        } else {
          toast.error(res.data.message);
        }
      })
      .catch((err) => {
        toast.error(err?.response?.data?.message || "Error removing");
      });
  };

  const handleReset = () => {
    // event.stopPropagation();
    setSearchEmployeePayload({
      label: "",
      value: null,
    });

    setEmployeeMaster({
      AccessRight: "",
      ShowDashboard: 0,
      ApprovalRight: "",
      ApprovalRightID: "",
      Centre: "",
      CentreID: "",
      City: "",
      Department: "",
      Designation: "",
      DesignationID: "",
      DOB: "01-01-2000",
      Email: "",
      HouseNo: "",
      Locality: "",
      Mobile: "",
      Name: "",
      PCity: "",
      PHouseNo: "",
      PLocality: "",
      PPincode: "",
      PStreetName: "",
      Pincode: "",
      StreetName: "",
      Title: "",
      isActive: 1,
      isLoginApprovel: 0,
      isPasswordChanged: 0,
      DefaultCentre: "",
      EmployeeIDHash: guidNumber(),
      canRefund: 0,
      canSettlement: 0,
      canDiscountAfterBill: 0,
      HideRate: 0,
      FirstName: "",
      Password: "",
      Username: "",
      EmpCode: "",
      AMRAccess: "",
      SaveAmendment: "",
      isPassword: true,
      AllowDiscount: 0,
      UnMasking: "",
      IsDoctorPro: "",
      IsOpdConsultant: 0,
      ProEmployee: "",
      Theme: "Default",
      EmpLanguageCode: "en",
      EmpLanguage: "English",
      DownTimePointsReviewRight: 0,
      DownTimePointsApprovalRight: 0,
      SuperAdmin: 0,
      OnAppGoToMainList: 0,
      IsInvoicePaymentValidate: 0,
      SkipAutoValidate: 0,
      SalesDesignationName: "",
      EmployeeCode: "",
      IsFieldBoy: 0,
      IsOTPLogin: 0,
      ReportingEmployeeID: "",
      LastWorkDayFlag: 0,
      isAllowFamilyMemberPolicy: 0,
      LastWorkDay: new Date(new Date().setFullYear(new Date().getFullYear() + 10)),
      AllowLimitDiscountMonthWise: 0,
      LimitDiscountMonthWise: 0,
      AllowLimitDiscountPerLabNo: 0,
      LimitDiscountPerLabNo: 0,
      DefaultDoctorApprovalID: null,
      AllowSharing: 0,
      ReferShareID: 0,
      IsStoreDashboard: 0
    });
    setEmployeeDetails({});
    setCentreId([]);
    setUploadImage({ show: false, data: "" });
    setEditData(false);
    setStateButton({ button: "Submit" });
    navigation("/CreateEmployeeMaster", { state: "" });
  };

  useEffect(() => {
    getGenderDropdown("Title");
    getDepartment(setDepartment, "getDepartmentEmployeeMaster");
    getDesignationData(setDesigation, true);
    GetAccessRightMaster(setAccessRight);
    GetAccessRightMasterHead(setAccessHead);
    GetAccessRightApproval(setApprovalRight);
    getEmployeeDetails();
    getRateTypeList();
  }, []);

  useEffect(() => {
    if (!state) {
      setEmployeeMaster({
        ...EmployeeMaster,
        Title: EmployeeMaster?.Title ? EmployeeMaster?.Title : Title[0]?.value,
        Designation: EmployeeMaster?.Designation
          ? EmployeeMaster?.Designation
          : Designation[0]?.label,
        DesignationID: EmployeeMaster?.DesignationID
          ? EmployeeMaster?.DesignationID
          : Designation[0]?.value,
      });
    }
  }, [Title, Designation]);

  useEffect(() => {
    if (state) {
      fetch();
    }
  }, [state]);

  const DuplicateUsername = (url) => {
    return new Promise((resolve, reject) => {
      axiosInstance
        .post(
          url,
          state
            ? {
              UserName: EmployeeMaster?.Username,
              EmployeeID: state?.id,
            }
            : {
              UserName: EmployeeMaster?.Username,
              EmployeeID: "",
            },
        )
        .then((res) => console.log(res))
        .catch((err) => {
          toast.error(err?.response?.data?.message);
          setEmployeeMaster({
            ...EmployeeMaster,
            Username: "",
          });
        });
    });
  };

  useEffect(() => {
    if (!state && DefaultCurrencyName !== "KES") {
      setEmployeeMaster((prev) => ({
        ...prev,
        CentreID: centreId?.[0]?.value ?? "",
      }));
    }
  }, [centreId]);

  useEffect(() => {
    getEmployeeCenter(setEmployeeCenter);
    guidNumber();
  }, []);

  console.log("MOdal ip", modal);

  // Dynamic Page Controller List
  const controllerDynamic = async () => {
    const { controllersData, controllerTabbingOrder } =
      await getSearchController(PAGE_ID);
    setTabbingOrder(controllerTabbingOrder);
    setControllerDynamicList(controllersData);
  };

  // HideController
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

  // controller must be show
  const showAlways = (controlId) => {
    const showAlwaysList = [
      // "Centre Type",
    ];
    return showAlwaysList.includes(controlId);
  };

  useEffect(() => {
    controllerDynamic();
  }, []);

  console.log("isFieldBoy", EmployeeMaster);

  return (
    <>
      <>
        {show && (
          <UploadFile
            show={show}
            handleClose={() => setShow(false)}
            documentId={EmployeeMaster?.EmployeeIDHash}
            pageName="EmployeMaster"
          />
        )}
        {uploadImage.show && (
          <CameraModal
            visible={uploadImage.show}
            guid={uploadImage.data}
            pageName={"Employee Image"}
            handleClose={(guidNo) =>
              setUploadImage({
                show: false,
                data: guidNo && guidNo !== "" ? guidNo : uploadImage.data,
              })
            }
          />
        )}
        {/* <Heading name={t("Create Employee")} isBreadcrumb={true}
          secondTitle={
            <>
            <div>
               <i
                    className="bi bi-eye-fill mb-0"
                    style={{ cursor: "pointer", color: "#080b0e",marginLeft:"auto" }}
                    // onClick={() => handleViewFlag(item)}
                  ></i>
              </div>
             <div style={{ marginLeft: "auto" }}>
              <PageControlGear pageId={PAGE_ID} />
              <Link to={`/EmployeeMaster`} style={{ fontSize: "13px" }}>
                <CustomButton
                  text={t("Back to list")}
                  icon={"back"}

                />
              </Link>
            </div>
            </>
          }
         /> */}

        <Heading name={t("Create Employee")} isBreadcrumb={true}
          secondTitle={
            <>
              <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: "8px" }}>
                <PageControlGear pageId={PAGE_ID} />
                <i
                  className="fa fa-search mb-0"
                  style={{ cursor: "pointer", color: "#080b0e" }}
                  onClick={() => setShowEmployeeDialog(true)}
                ></i>
                <Link to={`/EmployeeMaster`} style={{ fontSize: "13px" }}>
                  <CustomButton
                    text={t("Back to list")}
                    icon={"back"}
                  />
                </Link>
              </div>
            </>
          }
        />
        <Accordion
          title={t("Employee Details")}
          defaultValue={true}
          // isBreadcrumb={true}
          linkTo="/#"
          seconTitle={
            <>
              <div>
                <PageControlGear pageId={PAGE_ID} />
              </div>
              {employeeDetails?.EmployeeID && (
                <div
                  style={{ marginRight: "auto" }}
                  id="pr_id_11"
                  className="link-title-container d-none d-md-flex mx-3"
                >
                  <p className="mb-0">
                    <strong>Name</strong>: {employeeDetails?.Title}{" "}
                    {employeeDetails?.Name}
                  </p>{" "}
                  |
                  <p className="mb-0">
                    <strong>EmployeeCode</strong> :{" "}
                    {employeeDetails?.EmployeeCode}
                  </p>{" "}
                  |
                  <p className="mb-0">
                    <strong>EmployeeID</strong> : {employeeDetails?.EmployeeID}
                  </p>{" "}
                  |
                  <p className="mb-0">
                    <strong>Designation</strong> :{" "}
                    {employeeDetails?.Designation}
                  </p>{" "}
                  |
                  <p className="mb-0">
                    <strong>Created By</strong> :{" "}
                    {employeeDetails?.CreatedByName}
                  </p>{" "}
                  |
                  <p className="mb-0">
                    <strong>Created On</strong> : {employeeDetails?.dtEntry}
                  </p>
                </div>
              )}
            </>
          }
        //    seconTitle={
        //   <div style={{ marginLeft: "auto" }}>

        //   </div>
        // }
        >
          <div className="row px-2 pt-2">
            <div className="col-sm-8">
              <Input
                type="text"
                name="SearchEmployee"
                lable="Search Any Employee For Update"
                value={searchEmployeePayload.label || ""}
                placeholder=" "
                onChange={handleSearchEmployeeChange}
                onKeyDown={handleSearchEmployeeKeyDown}
                onBlur={() => {
                  autocompleteOnBlur(setSearchEmployeeSuggestions);
                  // setTimeout(() => setSelectSearchEmployee(false), 200)
                }}
              />

              {selectSearchEmployee && searchEmployeeSuggestions.length > 0 && (
                <AutoComplete
                  selects={selectSearchEmployee}
                  test={searchEmployeeSuggestions.map((item) => ({
                    TestName: item.fullName,
                  }))}
                  handleListSearch={(selected) =>
                    handleSearchEmployeeSelect(
                      searchEmployeeSuggestions.find(
                        (item) => item.fullName === selected.TestName,
                      ),
                    )
                  }
                  indexMatch={searchEmployeeIndex}
                />
              )}
            </div>
          </div>
          {console.log("controllerDynamicList", controllerDynamicList)}
          <div className="row pt-2 pl-2 pr-2">
            {controllerDynamicList
              ?.sort((a, b) => a.DisplayOrder - b.DisplayOrder)
              .map((item) => {
                if (
                  item?.ControlDisplayID === "Title" &&
                  isHideController("Title")
                ) {
                  return (
                    <div className="col-sm-2 mb-2">
                      <SelectBox
                        lable="Title"
                        id="Title"
                        options={Title}
                        selectedValue={EmployeeMaster?.Title}
                        onChange={(e) => handleSelectChange(e, EmployeeMaster)}
                        name="Title"
                      />
                    </div>
                  );
                }
                if (
                  item?.ControlDisplayID === "Name" &&
                  isHideController("Name")
                ) {
                  return (
                    <div className="col-sm-2 mb-2">
                      <Input
                        lable="Name"
                        id="Name"
                        placeholder=" "
                        name="Name"
                        className="required-fields"
                        type="text"
                        max={50}
                        value={EmployeeMaster?.Name}
                        onChange={handleChange}
                      />
                      {!EmployeeMaster?.Name && (
                        <span className="error-message">{error?.Name}</span>
                      )}
                    </div>
                  );
                }
                if (
                  item?.ControlDisplayID === "DOB" &&
                  isHideController("DOB")
                ) {
                  return (
                    <div className="col-sm-2 mb-2">
                      <div>
                        <DatePicker
                          value={
                            EmployeeMaster?.DOB
                              ? moment(
                                EmployeeMaster?.DOB,
                                "DD-MM-YYYY",
                              ).toDate()
                              : null
                          }
                          className="custom-calendar"
                          name="DOB"
                          placeholder=" "
                          id="DOB"
                          lable="DOB"
                          maxDate={new Date()}
                          onChange={dateSelect}
                        />
                      </div>
                    </div>
                  );
                }
                if (
                  item?.ControlDisplayID === "HouseNo" &&
                  isHideController("HouseNo")
                ) {
                  return (
                    <div className="col-sm-2 mb-2">
                      <div>
                        <Input
                          lable="House No"
                          id="HouseNo"
                          placeholder=" "
                          name="HouseNo"
                          type="text"
                          max={50}
                          value={EmployeeMaster?.HouseNo}
                          onChange={handleChange}
                        />
                      </div>
                    </div>
                  );
                }
                if (
                  item?.ControlDisplayID === "StreetName" &&
                  isHideController("StreetName")
                ) {
                  return (
                    <div className="col-sm-2 mb-2">
                      <Input
                        lable="Street Name"
                        id="StreetName"
                        placeholder=" "
                        name="StreetName"
                        max={50}
                        type="text"
                        value={EmployeeMaster?.StreetName}
                        onChange={handleChange}
                      />
                    </div>
                  );
                }
                if (
                  item?.ControlDisplayID === "Locality" &&
                  isHideController("Locality")
                ) {
                  return (
                    <div className="col-sm-2 mb-2">
                      <Input
                        name="Locality"
                        type="text"
                        max={50}
                        value={EmployeeMaster?.Locality}
                        onChange={handleChange}
                        lable="Locality"
                        id="Locality"
                        placeholder=" "
                      />
                    </div>
                  );
                }
                if (
                  item?.ControlDisplayID === "Pincode" &&
                  isHideController("Pincode")
                ) {
                  return (
                    <div className="col-sm-2 mb-2">
                      <Input
                        name="Pincode"
                        type="number"
                        value={EmployeeMaster?.Pincode}
                        onChange={handleChange}
                        onInput={(e) => number(e, 6)}
                        lable="Pincode"
                        id="Pincode"
                        placeholder=" "
                      />
                    </div>
                  );
                }
                if (
                  item?.ControlDisplayID === "City" &&
                  isHideController("City")
                ) {
                  return (
                    <div className="col-sm-2 mb-2">
                      <Input
                        name="City"
                        type="text"
                        max={50}
                        value={EmployeeMaster?.City}
                        onChange={handleChange}
                        lable="City"
                        id="City"
                        placeholder=" "
                      />
                    </div>
                  );
                }
                if (
                  item?.ControlDisplayID === "Mobile" &&
                  isHideController("Mobile")
                ) {
                  return (
                    <div className="col-sm-2 mb-2">
                      <Input
                        name="Mobile"
                        type="text"
                        className="required-fields"
                        onInput={(e) => number(e, 10)}
                        value={EmployeeMaster?.Mobile}
                        onChange={handleChange}
                        lable="Mobile"
                        id="Mobile"
                        placeholder=" "
                      />
                      {!EmployeeMaster?.Mobile && (
                        <span className="error-message">{error?.Mobile}</span>
                      )}
                      {EmployeeMaster?.Mobile?.length > 0 &&
                        EmployeeMaster?.Mobile?.length < 10 && (
                          <span className="error-message">
                            {error?.Mobile2}
                          </span>
                        )}
                    </div>
                  )
                }
                if (item?.ControlDisplayID === "DOB" && isHideController("DOB")) {
                  return (
                    <div className="col-sm-2 mb-2">
                      <div>
                        <DatePicker
                          value={
                            EmployeeMaster?.DOB
                              ? moment(EmployeeMaster?.DOB, "DD-MM-YYYY").toDate()
                              : null
                          }
                          className="custom-calendar"
                          name="DOB"
                          placeholder=" " controllerDynamicList
                          id="DOB"
                          lable="DOB"
                          maxDate={new Date()}
                          onChange={dateSelect}
                        />
                      </div>
                    </div>
                  )
                }
                if (item?.ControlDisplayID === "HouseNo" && isHideController("HouseNo")) {
                  return (
                    <div className="col-sm-2 mb-2">
                      <div>
                        <Input
                          lable="House No"
                          id="HouseNo"
                          placeholder=" "
                          name="HouseNo"
                          type="text"
                          max={50}
                          value={EmployeeMaster?.HouseNo}
                          onChange={handleChange}
                        />
                      </div>
                    </div>
                  )
                }
                if (item?.ControlDisplayID === "StreetName" && isHideController("StreetName")) {
                  return (
                    <div className="col-sm-2 mb-2">
                      <Input
                        lable="Street Name"
                        id="StreetName"
                        placeholder=" "
                        name="StreetName"
                        max={50}
                        type="text"
                        value={EmployeeMaster?.StreetName}
                        onChange={handleChange}
                      />
                    </div>
                  )
                }
                if (item?.ControlDisplayID === "Locality" && isHideController("Locality")) {
                  return (
                    <div className="col-sm-2 mb-2">
                      <Input
                        name="Locality"
                        type="text"
                        max={50}
                        value={EmployeeMaster?.Locality}
                        onChange={handleChange}
                        lable="Locality"
                        id="Locality"
                        placeholder=" "
                      />
                    </div>
                  )
                }
                if (item?.ControlDisplayID === "Pincode" && isHideController("Pincode")) {
                  return (
                    <div className="col-sm-2 mb-2">
                      <Input
                        name="Pincode"
                        type="number"
                        value={EmployeeMaster?.Pincode}
                        onChange={handleChange}
                        onInput={(e) => number(e, 6)}
                        lable="Pincode"
                        id="Pincode"
                        placeholder=" "
                      />
                    </div>
                  )
                }
                if (item?.ControlDisplayID === "City" && isHideController("City")) {
                  return (
                    <div className="col-sm-2 mb-2">
                      <Input
                        name="City"
                        type="text"
                        max={50}
                        value={EmployeeMaster?.City}
                        onChange={handleChange}
                        lable="City"
                        id="City"
                        placeholder=" "
                      />
                    </div>
                  )
                }
                if (item?.ControlDisplayID === "Mobile" && isHideController("Mobile")) {
                  return (
                    <div className="col-sm-2 mb-2">
                      <Input
                        name="Mobile"
                        type="text"
                        className="required-fields"
                        onInput={(e) => number(e, 10)}
                        value={EmployeeMaster?.Mobile}
                        onChange={handleChange}
                        lable="Mobile"
                        id="Mobile"
                        placeholder=" "
                      />
                      {!EmployeeMaster?.Mobile && (
                        <span className="error-message">{error?.Mobile}</span>
                      )}
                      {EmployeeMaster?.Mobile?.length > 0 &&
                        EmployeeMaster?.Mobile?.length < 10 && (
                          <span className="error-message">{error?.Mobile2}</span>
                        )}
                    </div>
                  )
                }
                if (item?.ControlDisplayID === "Email" && isHideController("Email")) {
                  return (
                    <div className="col-sm-2 mb-2">
                      <Input
                        name="Email"
                        value={EmployeeMaster?.Email}
                        onChange={handleChange}
                        max={50}
                        lable="Email"
                        id="Email"
                        placeholder=" "
                        type="email"
                      />
                      {error?.Email && (
                        <span className="error-message">{error?.Email}</span>
                      )}
                    </div>
                  )
                }
                if (item?.ControlDisplayID === "CompanyCode" && isHideController("CompanyCode")) {
                  return (
                    <div className="col-sm-2 mb-2">
                      <Input
                        value={useLocalStorage("userData", "get").CompanyCode}
                        readOnly={true}
                        lable="Company Code"
                        id="CompanyCode"
                        name={"CompanyCode"}
                        placeholder=" "
                      />
                    </div>
                  )
                }
                if (item?.ControlDisplayID === "Username" && isHideController("Username")) {
                  return (
                    <div className="col-sm-2 mb-2">
                      <Input
                        name="Username"
                        value={EmployeeMaster?.Username}
                        onChange={handleChange}
                        max={50}
                        className="required-fields"
                        type="text"
                        autoComplete={"off"}
                        lable="User Name"
                        id="Username"
                        placeholder=" "
                      />
                      {!EmployeeMaster?.Username && (
                        <span className="error-message">{error?.Username}</span>
                      )}
                    </div>
                  )
                }
                if (item?.ControlDisplayID === "Password" && isHideController("Password")) {
                  return (
                    <>
                      {!state?.id && (
                        <>
                          <div className="col-sm-2 mb-2">
                            <Input
                              name="Password"
                              className="required-fields"
                              type="password"
                              max={50}
                              value={EmployeeMaster?.Password}
                              onChange={handleChange}
                              lable="Password"
                              id="Password"
                              placeholder=" "
                            />
                            {!passwordRegex.test(EmployeeMaster?.Password) && (
                              <span className="error-message">{error?.Password}</span>
                            )}
                          </div>
                        </>
                      )}
                    </>
                  )
                }
                if (item?.ControlDisplayID === "EmpCode" && isHideController("EmpCode")) {
                  return (
                    <>
                      {state?.id && (
                        <>
                          <div className="col-sm-2 mb-2">
                            <Input
                              lable="Employee Code"
                              id="Employee Code"
                              placeholder=" "
                              name="EmpCode"
                              type="text"
                              max={50}
                              value={EmployeeMaster?.EmpCode}
                              onChange={handleChange}
                              disabled={true}
                            />
                          </div>
                        </>
                      )}
                    </>
                  )
                }
                if (item?.ControlDisplayID === "isLoginApprovel" && isHideController("isLoginApprovel")) {
                  return (
                    <div className="col-sm-1 mt-1 d-flex mb-2">
                      <Form.Check
                        id="isLoginApprovel"
                        name="isLoginApprovel"
                        type="switch"
                        checked={EmployeeMaster?.isLoginApprovel}
                        onChange={handleInputChange}
                        label={t("LoginApproval")}
                      />
                    </div>
                  )
                }
                if (item?.ControlDisplayID === "isPasswordChanged" && isHideController("isPasswordChanged")) {
                  return (
                    <div className="col-sm-2 mt-1 d-flex mb-2">
                      <Form.Check
                        type="switch"
                        id="isPasswordChanged"
                        name="isPasswordChanged"
                        checked={EmployeeMaster?.isPasswordChanged}
                        onChange={handleInputChange}
                        label={t("Can Change Password")}
                        className="fw-bold"
                      />
                    </div>
                  )
                }
                if (item?.ControlDisplayID === "canRefund" && isHideController("canRefund")) {
                  return (
                    <div className="col-sm-1 mb-2 d-flex">
                      <Form.Check
                        type="switch"
                        id="canRefund"
                        name="canRefund"
                        checked={EmployeeMaster?.canRefund}
                        onChange={handleInputChange}
                        label={t("CanRefund")}
                        className="fw-bold"
                      />
                    </div>
                  )
                }
                if (item?.ControlDisplayID === "canDiscountAfterBill" && isHideController("canDiscountAfterBill")) {
                  return (
                    <div className="col-sm-2 mb-2 d-flex">
                      <Form.Check
                        type="switch"
                        id="canDiscountAfterBill"
                        name="canDiscountAfterBill"
                        checked={EmployeeMaster?.canDiscountAfterBill}
                        onChange={handleInputChange}
                        label={t("Can Discount After Bill")}
                        className="fw-bold"
                      />
                    </div>
                  )
                }
                if (item?.ControlDisplayID === "canSettlement" && isHideController("canSettlement")) {
                  return (
                    <div className="col-sm-1 mb-1 d-flex">
                      <Form.Check
                        type="switch"
                        id="canSettlement"
                        name="canSettlement"
                        checked={EmployeeMaster?.canSettlement}
                        onChange={handleInputChange}
                        label={t("CanSettlement")}
                        className="fw-bold"
                      />
                    </div>
                  )
                }
                if (item?.ControlDisplayID === "HideRate" && isHideController("HideRate")) {
                  return (
                    <div className="col-sm-1 mb-1 d-flex">
                      <Form.Check
                        type="switch"
                        id="HideRate"
                        name="HideRate"
                        checked={EmployeeMaster?.HideRate}
                        onChange={handleInputChange}
                        label={t("HideRate")}
                        className="fw-bold"
                      />
                    </div>
                  )
                }
                if (item?.ControlDisplayID === "ProEmployee" && isHideController("ProEmployee")) {
                  return (
                    <div className="col-sm-2 mb-1 d-none">
                      <Form.Check
                        type="switch"
                        id="ProEmployee"
                        name="ProEmployee"
                        checked={EmployeeMaster?.ProEmployee}
                        onChange={handleInputChange}
                        label={t("ProEmployee")}
                        className="fw-bold"
                      />
                    </div>
                  )
                }
                if (item?.ControlDisplayID === "AllowDiscount" && isHideController("AllowDiscount")) {
                  return (
                    <div className="col-sm-1 mb-1 d-flex">
                      <Form.Check
                        type="switch"
                        id="AllowDiscount"
                        name="AllowDiscount"
                        checked={EmployeeMaster?.AllowDiscount}
                        onChange={handleInputChange}
                        label={t("AllowDiscount")}
                        className="fw-bold"
                      />
                    </div>
                  )
                }
                if (item?.ControlDisplayID === "AMRAccess" && isHideController("AMRAccess")) {
                  return (
                    <div className="col-sm-1 mb-1 d-flex">
                      <Form.Check
                        type="switch"
                        id="AMRAccess"
                        name="AMRAccess"
                        checked={EmployeeMaster?.AMRAccess}
                        onChange={handleInputChange}
                        label={t("AMRAccess")}
                        className="fw-bold"
                      />
                    </div>
                  )
                }
                if (item?.ControlDisplayID === "UnMasking" && isHideController("UnMasking")) {
                  return (
                    <div className="col-sm-1 mb-1 d-flex">
                      <Form.Check
                        type="switch"
                        id="UnMasking"
                        name="UnMasking"
                        checked={EmployeeMaster?.UnMasking}
                        onChange={handleInputChange}
                        label={t("UnMasking")}
                        className="fw-bold"
                      />
                    </div>
                  )
                }
                if (item?.ControlDisplayID === "SaveAmendment" && isHideController("SaveAmendment")) {
                  return (
                    <div className="col-sm-2 mb-1 d-flex">
                      <Form.Check
                        type="switch"
                        id="SaveAmendment"
                        name="SaveAmendment"
                        checked={EmployeeMaster?.SaveAmendment}
                        onChange={handleInputChange}
                        label={t("Save/Approve amendment")}
                        className="fw-bold"
                      />
                    </div>
                  )
                }
                if (item?.ControlDisplayID === "ShowDashboard" && isHideController("ShowDashboard")) {
                  return (
                    <div className="col-sm-2 mb-1 d-flex">
                      <Form.Check
                        type="switch"
                        id="ShowDashboard"
                        name="ShowDashboard"
                        disabled={EmployeeMaster?.ProEmployee == 1 ? true : false}
                        checked={EmployeeMaster?.ShowDashboard}
                        onChange={handleInputChange}
                        label={t("Access Dashboard")}
                        className="fw-bold"
                      />
                    </div>
                  )
                }
                if (item?.ControlDisplayID === "DownTimePointsReviewRight" && isHideController("DownTimePointsReviewRight")) {
                  return (
                    <>
                      {CompanyCode?.toLowerCase() == "itd" && (
                        <>
                          {" "}
                          <div className="col-sm-2 mb-1 ml-2 d-flex">
                            <Form.Check
                              type="switch"
                              id="DownTimePointsReviewRight"
                              name="DownTimePointsReviewRight"
                              checked={EmployeeMaster?.DownTimePointsReviewRight}
                              onChange={handleInputChange}
                              label={t("DownTimePointsReviewRight")}
                              className="fw-bold"
                            />
                          </div>
                        </>
                      )}
                    </>
                  )
                }
                if (item?.ControlDisplayID === "DownTimePointsApprovalRight" && isHideController("DownTimePointsApprovalRight")) {
                  return (
                    <>
                      {CompanyCode?.toLowerCase() == "itd" &&
                        <div className="col-sm-2 mb-1 d-flex">
                          <Form.Check
                            type="switch"
                            id="DownTimePointsReviewRight"
                            name="DownTimePointsReviewRight"
                            checked={
                              EmployeeMaster?.DownTimePointsReviewRight
                            }
                            onChange={handleInputChange}
                            label={t("DownTimePointsReviewRight")}
                            className="fw-bold"
                          />
                        </div>
                      }
                    </>
                  )
                }
                if (item?.ControlDisplayID === "OnAppGoToMainList" && isHideController("OnAppGoToMainList")) {
                  return (
                    <div className="col-sm-2 mb-1 d-flex">
                      <Form.Check
                        type="switch"
                        id="OnAppGoToMainList"
                        name="OnAppGoToMainList"
                        checked={EmployeeMaster?.OnAppGoToMainList}
                        onChange={handleInputChange}
                        label={t("OnApproveGoToMainList")}
                        className="fw-bold"
                      />
                    </div>
                  )
                }
                if (item?.ControlDisplayID === "InvoicePaymentValidate" && isHideController("InvoicePaymentValidate")) {
                  return (
                    <div className="col-sm-auto mb-1 d-flex">
                      <Form.Check
                        type="switch"
                        id="InvoicePaymentValidate"
                        name="IsInvoicePaymentValidate"
                        checked={EmployeeMaster?.IsInvoicePaymentValidate}
                        onChange={handleInputChange}
                        label={t("InvoicePaymentValidate")}
                        className="fw-bold"
                      />
                    </div>
                  )
                }
                if (item?.ControlDisplayID === "SkipAutoValidate" && isHideController("SkipAutoValidate")) {
                  return (
                    <div className="col-sm-2 mb-1 d-flex">
                      <Form.Check
                        type="switch"
                        id="SkipAutoValidate"
                        name="SkipAutoValidate"
                        checked={EmployeeMaster?.SkipAutoValidate}
                        onChange={handleInputChange}
                        label={t("SkipAutoValidate")}
                        className="fw-bold"
                      />
                    </div>
                  )
                }
                if (item?.ControlDisplayID === "IsOTPLogin" && isHideController("IsOTPLogin")) {
                  return (
                    <div className="col-sm-2 mb-1 d-flex">
                      <Form.Check
                        type="switch"
                        id="IsOTPLogin"
                        name="IsOTPLogin"
                        checked={EmployeeMaster?.IsOTPLogin}
                        onChange={handleInputChange}
                        label={t("IsOTPLogin")}
                        className="fw-bold"
                      />
                    </div>
                  )
                }
                if (item?.ControlDisplayID === "IsStoreDashboard" && isHideController("IsStoreDashboard")) {
                  return (
                    <div className="col-sm-2 mb-1 d-flex">
                      <Form.Check
                        type="switch"
                        id="IsStoreDashboard"
                        name="IsStoreDashboard"
                        checked={EmployeeMaster?.IsStoreDashboard}
                        onChange={handleInputChange}
                        label={t("IsStoreDashboard")}
                        className="fw-bold"
                      />
                    </div>
                  )
                }
                if (item?.ControlDisplayID === "AllowSharing" && isHideController("AllowSharing")) {
                  return (
                    <div className="col-sm-2 mb-1 d-flex">
                      <Form.Check
                        type="switch"
                        id="AllowSharing"
                        name="AllowSharing"
                        checked={EmployeeMaster?.AllowSharing}
                        onChange={handleInputChange}
                        label={t("AllowSharing")}
                        className="fw-bold"
                      />
                    </div>
                  )
                }
                // if (
                //   item?.ControlDisplayID === "AllowSharing" &&
                //   isHideController("AllowSharing") &&
                //   EmployeeMaster?.AllowSharing == 1
                // ) {
                //   return (
                <div className="col-sm-2 mb-1">
                  <ReactSelect
                    dynamicOptions={doctorAdmin}
                    name="ReferShareID"
                    lable={t("Refer Doctor")}
                    id="ReferShareID"
                    removeIsClearable={true}
                    placeholderName={t("Refer Doctor")}
                    value={EmployeeMaster?.ReferShareID}
                    onChange={handleReactSelect}
                  />
                </div>
                // )
                // }

                if (item?.ControlDisplayID === "isLastWorkingDay" && isHideController("isLastWorkingDay")) {
                  return (
                    <div className="col-sm-2 mb-1 d-flex">
                      <Form.Check
                        type="switch"
                        id="LastWorkDayFlag"
                        name="LastWorkDayFlag"
                        checked={EmployeeMaster?.LastWorkDayFlag}
                        onChange={handleInputChange}
                        label={t("Resign")}
                        className="fw-bold"
                      />
                    </div>
                  )
                }
                // Only show DatePicker when LastWorkDayFlag is 1
                if (
                  item?.ControlDisplayID === "LastWorkingDay" &&
                  isHideController("LastWorkingDay") &&
                  EmployeeMaster?.LastWorkDayFlag === 1
                ) {
                  return (
                    <div className="col-sm-2 mb-2">
                      <div>
                        <DatePicker
                          value={
                            EmployeeMaster?.LastWorkDay
                              ? moment(EmployeeMaster?.LastWorkDay, "DD-MM-YYYY").toDate()
                              : null
                          }
                          onChange={dateSelect}
                          name="LastWorkDay"
                          id="LastWorkDay"
                          lable="LastWorkDay"
                          label={t("DownTimePointsApprovalRight")}
                          className="fw-bold"
                        />
                      </div>
                    </div>
                  )
                }
                if (
                  item?.ControlDisplayID === "OnAppGoToMainList" &&
                  isHideController("OnAppGoToMainList")
                ) {
                  return (
                    <div className="col-sm-2 mb-1 d-flex">
                      <Form.Check
                        type="switch"
                        id="OnAppGoToMainList"
                        name="OnAppGoToMainList"
                        checked={EmployeeMaster?.OnAppGoToMainList}
                        onChange={handleInputChange}
                        label={t("OnApproveGoToMainList")}
                        className="fw-bold"
                      />
                    </div>
                  );
                }
                if (
                  item?.ControlDisplayID === "InvoicePaymentValidate" &&
                  isHideController("InvoicePaymentValidate")
                ) {
                  return (
                    <div className="col-sm-2 mb-1 d-flex">
                      <Form.Check
                        type="switch"
                        id="InvoicePaymentValidate"
                        name="IsInvoicePaymentValidate"
                        checked={EmployeeMaster?.IsInvoicePaymentValidate}
                        onChange={handleInputChange}
                        label={t("InvoicePaymentValidate")}
                        className="fw-bold"
                      />
                    </div>
                  );
                }
                if (
                  item?.ControlDisplayID === "SkipAutoValidate" &&
                  isHideController("SkipAutoValidate")
                ) {
                  return (
                    <div className="col-sm-2 mb-1 d-flex">
                      <Form.Check
                        type="switch"
                        id="SkipAutoValidate"
                        name="SkipAutoValidate"
                        checked={EmployeeMaster?.SkipAutoValidate}
                        onChange={handleInputChange}
                        label={t("SkipAutoValidate")}
                        className="fw-bold"
                      />
                    </div>
                  );
                }
                if (
                  item?.ControlDisplayID === "IsOTPLogin" &&
                  isHideController("IsOTPLogin")
                ) {
                  return (
                    <div className="col-sm-2 mb-1 d-flex">
                      <Form.Check
                        type="switch"
                        id="IsOTPLogin"
                        name="IsOTPLogin"
                        checked={EmployeeMaster?.IsOTPLogin}
                        onChange={handleInputChange}
                        label={t("IsOTPLogin")}
                        className="fw-bold"
                      />
                    </div>
                  );
                }
                if (
                  item?.ControlDisplayID === "isLastWorkingDay" &&
                  isHideController("isLastWorkingDay")
                ) {
                  return (
                    <div className="col-sm-2 mb-1 d-flex">
                      <Form.Check
                        type="switch"
                        id="LastWorkDayFlag"
                        name="LastWorkDayFlag"
                        checked={EmployeeMaster?.LastWorkDayFlag}
                        onChange={handleInputChange}
                        label={t("Resign")}
                        className="fw-bold"
                      />
                    </div>
                  );
                }
                if (
                  item?.ControlDisplayID === "isAllowFamilyMemberPolicy" &&
                  isHideController("isAllowFamilyMemberPolicy")
                ) {
                  return (
                    <div className="col-sm-2 mb-1 d-flex">
                      <Form.Check
                        type="switch"
                        id="isAllowFamilyMemberPolicy"
                        name="isAllowFamilyMemberPolicy"
                        checked={EmployeeMaster?.isAllowFamilyMemberPolicy}
                        onChange={handleInputChange}
                        label={t("Allow Family Member Policy")}
                        className="fw-bold"
                      />
                    </div>
                  );
                }
                // Only show DatePicker when LastWorkDayFlag is 1
                if (
                  item?.ControlDisplayID === "LastWorkingDay" &&
                  isHideController("LastWorkingDay") &&
                  EmployeeMaster?.LastWorkDayFlag === 1
                ) {
                  return (
                    <div className="col-sm-2 mb-2">
                      <div>
                        <DatePicker
                          value={
                            EmployeeMaster?.LastWorkDay
                              ? moment(
                                EmployeeMaster?.LastWorkDay,
                                "DD-MM-YYYY",
                              ).toDate()
                              : null
                          }
                          className="custom-calendar"
                          name="LastWorkDay"
                          placeholder="Last Working Day"
                          id="LastWorkDay"
                          lable="LastWorkDay"
                          // minDat={new Date()}
                          onChange={dateSelect}
                        />
                      </div>
                    </div>
                  );
                }
              })}
            {EmployeeMaster?.AllowSharing == 1 && (
              <div className="col-sm-2 mb-1">
                <ReactSelect
                  dynamicOptions={state?.button === "Update" ? doctorAdmin : [
                    { label: "Self Sharing", value: "-1" },
                    ...doctorAdmin,
                  ]}
                  name="ReferShareID"
                  lable={t("Refer Doctor")}
                  id="ReferShareID"
                  removeIsClearable={true}
                  placeholderName={t("Refer Doctor")}
                  value={EmployeeMaster?.ReferShareID}
                  onChange={handleReactSelect}
                />
              </div>
            )}




            <div className="col-sm-2 mb-1 d-flex">
              <Form.Check
                type="switch"
                id="IsOpdConsultant"
                name="IsOpdConsultant"
                checked={!!EmployeeMaster?.IsOpdConsultant}
                onChange={handleInputChange}
                label={t("Is OPD Consultant")}
                className="fw-bold"
              />
            </div>

            <div className="col-sm-2 mb-1 d-flex">
              <Form.Check
                type="switch"
                id="BlockExcelPrintout"
                name="BlockExcelPrintout"
                checked={EmployeeMaster?.BlockExcelPrintout === 1}
                onChange={handleToggleChange}
                label={t("Block- Excel Printout")}
                className="fw-bold"
              />
            </div>

            <div className="col-sm-2 mb-1 d-flex">
              <Form.Check
                type="switch"
                id="BlockLabReportPrintout"
                name="BlockLabReportPrintout"
                checked={EmployeeMaster?.BlockLabReportPrintout === 1}
                onChange={handleToggleChange}
                label={t("Block -LabReport Printout")}
                className="fw-bold"
              />
            </div>

          </div>
        </Accordion>
        <Heading
          title={t("Access Details")}
          secondTitle={
            <div className="d-flex align-items-center mt-1">
              <div style={{ width: "150px" }}>
                <ReactSelect
                  label="Copy Right From"
                  className="required-fields"
                  id="CopyRightEmployeeID"
                  placeholderName="Copy Right From"
                  name="CopyRightEmployeeID"
                  removeIsClearable={true}
                  dynamicOptions={employeeList}
                  value={CopyRightEmployeeID}
                  onChange={CopyRightChange}
                />
              </div>
            </div>
          }
        />
        <div className="row pt-2 pl-2 pr-2">
          <div className="col-sm-2">
            <SelectBoxWithCheckbox
              lable="Department"
              className="required-fields"
              id="Department"
              placeholder=" "
              name="Department"
              options={Department}
              value={EmployeeMaster?.Department}
              onChange={handleChanges}
            />
            {(!EmployeeMaster?.Department ||
              EmployeeMaster?.Department?.length == 0) && (
                <span className="error-message">{error?.Department}</span>
              )}
          </div>
          <div className="col-sm-2">
            <SelectBoxWithCheckbox
              lable="Centre"
              id="Centre"
              className="required-fields"
              placeholder=" "
              name="Centre"
              options={EmployeeCenter}
              value={EmployeeMaster?.Centre}
              onChange={handleMultiSelect}
              depends={setCentreId}
            />
            {(!EmployeeMaster?.Centre ||
              EmployeeMaster?.Centre?.length == 0) && (
                <span className="error-message">{error?.Centre}</span>
              )}
          </div>
          {/* <div className="col-sm-2">
              <SelectBoxWithCheckbox
                lable="Department"
                className="required-fields"
                id="Department"
                placeholder=" "
                name="Department"
                options={Department}
                value={EmployeeMaster?.Department}
                onChange={handleChanges}
              />
              {(!EmployeeMaster?.Department ||
                EmployeeMaster?.Department?.length == 0) && (
                  <span className="error-message">{error?.Department}</span>
                )}
            </div> */}
          {/* <CustomButton
              text="Access Head"
              onClick={() => setShowAccessHead(true)}
            /> */}

          <div className="col-sm-2">
            <SelectBoxWithCheckbox
              lable="AccessDesignation"
              className="required-fields"
              id="AccessDesignation"
              placeholder=" "
              name="AccessDesignation"
              options={Designation}
              value={EmployeeMaster?.AccessDesignation}
              onChange={handleChanges}
            />
            {(!EmployeeMaster?.AccessDesignation ||
              EmployeeMaster?.AccessDesignation?.length == 0) && (
                <span className="error-message">{error?.AccessDesignation}</span>
              )}
          </div>
          <div className="col-sm-2">
            <SelectBoxWithCheckbox
              lable="AccessDashboard"
              className="required-fields"
              id="AccessDashboard"
              placeholder=" "
              name="AccessDashboard"
              options={accessDashboards}
              value={EmployeeMaster?.AccessDashboard}
              onChange={handleChanges}
            />
            {(!EmployeeMaster?.AccessDashboard ||
              EmployeeMaster?.AccessDashboard?.length == 0) && (
                <span className="error-message">{error?.AccessDashboard}</span>
              )}
          </div>
          <div className="col-sm-2">
            <SelectBoxWithCheckbox
              // className="required-fields"
              lable="ApprovalRight"
              id="ApprovalRight"
              placeholder=" "
              name="ApprovalRight"
              options={ApprovalRight}
              value={EmployeeMaster?.ApprovalRight}
              onChange={handleChanges}
            />
            {/* {(!EmployeeMaster?.ApprovalRight ||
                  EmployeeMaster?.ApprovalRight?.length == 0) && (
                  <span className="error-message">{error?.ApprovalRight}</span>
                )} */}
          </div>
          {console.log(EmployeeMaster?.ApprovalRight, "EmployeeMaster?.ApprovalRight")}
          <div className="col-sm-2 row d-flex mb-1">
            <div className="col-sm-11 flex-grow-1">
              <SelectBoxWithCheckbox
                lable="AccessRight"
                className="required-fields"
                id="AccessRight"
                placeholder=" "
                name="AccessRight"
                options={AccessRight}
                value={EmployeeMaster?.AccessRight}
                onChange={handleChanges}
              />
            </div>
            <div
              className=""
              style={{
                width: "fit-content",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                paddingBottom: "6px",
              }}
              onClick={() => setShowAccessHead(true)}
            >
              <i className="fa fa-eye"></i>
            </div>
          </div>

          <div className="col-sm-2 mb-1">
            <ReactSelect
              dynamicOptions={[
                { label: t("Select default doctor"), value: "" },
                ...(ApprovalRight?.filter((item) =>
                  (Array.isArray(EmployeeMaster?.ApprovalRight)
                    ? EmployeeMaster?.ApprovalRight?.map(String)
                    : String(EmployeeMaster?.ApprovalRight)?.split(","))
                    .includes(String(item?.value))
                ) || []),
              ]}
              name="DefaultDoctorApprovalID"
              lable={t("Default Doctor Approval right")}
              id="DefaultDoctorApprovalID"
              removeIsClearable={true}
              placeholderName={t("Default Doctor Approval right")}
              value={EmployeeMaster?.DefaultDoctorApprovalID}
              onChange={handleReactSelect}
            />
          </div>

          <div className="col-sm-2 mb-1">
            {/* <SelectBox
                lable="Theme"
                id="Theme"
                name="Theme"
                className="required"
                options={Theme}
                selectedValue={EmployeeMaster?.Theme}
                onChange={handleSelectChange}
              /> */}

            <ReactSelect
              dynamicOptions={Theme}
              name="Theme"
              lable={t("Theme")}
              id="Theme"
              removeIsClearable={true}
              placeholderName={t("Theme")}
              value={EmployeeMaster?.Theme}
              onChange={handleReactSelect}
            />
          </div>
          <div className="col-sm-2 mb-1">
            {/* <SelectBox
                lable="Language"
                id="EmpLanguageCode"
                name="EmpLanguageCode"
                className="required"
                options={languages}
                selectedValue={EmployeeMaster?.EmpLanguageCode}
                onChange={handleSelectChange}
              /> */}

            <ReactSelect
              dynamicOptions={languages}
              name="EmpLanguageCode"
              lable={t("Language")}
              id="EmpLanguageCode"
              removeIsClearable={true}
              placeholderName={t("Language")}
              value={EmployeeMaster?.EmpLanguageCode}
              onChange={handleReactSelect}
            />
          </div>
          <div className="col-sm-2 mb-1">
            <ReactSelect
              dynamicOptions={[{ label: "Select", value: 0 }, ...policyOptions]}
              name="PolicyId"
              lable={t("Discount Policy")}
              id="PolicyId"
              removeIsClearable={true}
              placeholderName={t("Discount Policy")}
              value={EmployeeMaster?.PolicyId}
              onChange={handleReactSelect}
            />
          </div>
          <div className="col-sm-2">
            <SelectBoxWithCheckbox
              // className="required-fields"
              lable="AccessStoreLocation"
              id="AccessStoreLocation"
              placeholder=" "
              name="AccessStoreLocation"
              options={StoreLocation}
              value={EmployeeMaster?.AccessStoreLocation}
              onChange={handleChanges}
            />
          </div>

        </div>
        <Accordion
          title={t("Market Details")}
          defaultValue={
            EmployeeMaster?.ProEmployee || EmployeeMaster?.IsFieldBoy
          }
          notOpen={false}
          linkTo={"#"}
          linkTitle={
            <div
              style={{ marginRight: "auto", marginLeft: "1rem" }}
              className="link-title-container row d-none d-md-flex"
              id="pr_id_11"
            >
              <div
                className=" mt-1 d-flex"
                onClick={(e) => e.stopPropagation()}
              >
                <Form.Check
                  type="switch"
                  id="IsFieldBoy"
                  name="IsFieldBoy"
                  checked={EmployeeMaster?.IsFieldBoy}
                  onChange={handleInputChange}
                  label={t("IsFieldBoy")}
                  className="fw-bold"
                />
              </div>
              <div
                className=" mt-1 d-flex"
                onClick={(e) => e.stopPropagation()}
              >
                <Form.Check
                  type="switch"
                  id="ProEmployee"
                  name="ProEmployee"
                  checked={EmployeeMaster?.ProEmployee}
                  onChange={handleInputChange}
                  label={t("ProEmployee")}
                  className="fw-bold"
                />
              </div>
            </div>
          }
        >
          <div className="row pt-2 pl-2 pr-2">
            {controllerDynamicList
              ?.sort((a, b) => a.DisplayOrder - b.DisplayOrder)
              .map((item) => {
                const isMarketEmployee =
                  !!EmployeeMaster?.ProEmployee || !!EmployeeMaster?.IsFieldBoy;
                if (
                  item?.ControlDisplayID === "SalesDesignationName" &&
                  isMarketEmployee &&
                  isHideController("SalesDesignationName")
                ) {
                  return (
                    <div className="col-sm-2">
                      {/* <SelectBox
                          lable={t("Sales Desingation")}
                          id="SalesDesignationName"
                          name="SalesDesignationName"
                          options={[...salesDesignationList]}
                          selectedValue={EmployeeMaster?.SalesDesignationName}
                          onChange={handleSelectChange}
                        /> */}

                      <ReactSelect
                        dynamicOptions={salesDesignationList}
                        name="SalesDesignationID"
                        lable={t("Sales Desingation")}
                        id="SalesDesignationID"
                        removeIsClearable={true}
                        placeholderName={t("Sales Desingation")}
                        value={EmployeeMaster?.SalesDesignationID}
                        onChange={handleReactSelect}
                      />
                    </div>
                  );
                }
                if (
                  item?.ControlDisplayID === "ReportingEmployeeID" &&
                  isMarketEmployee
                ) {
                  return (
                    <div className="col-sm-2">
                      {/* <SelectBox
                          lable={t("Reporting Manager")}
                          id="ReportingEmployeeID"
                          name="ReportingEmployeeID"
                          options={[{ label: 'Select', value: '' }, ...reportingManagerList]}
                          selectedValue={EmployeeMaster?.ReportingEmployeeID}
                          onChange={handleSelectChange}
                        /> */}

                      <ReactSelect
                        dynamicOptions={[
                          { label: "Select", value: "" },
                          ...reportingManagerList,
                        ]}
                        name="ReportingEmployeeID"
                        lable={t("Reporting Manager")}
                        id="ReportingEmployeeID"
                        removeIsClearable={true}
                        placeholderName={t("Reporting Manager")}
                        value={EmployeeMaster?.ReportingEmployeeID}
                        onChange={handleReactSelect}
                      />
                    </div>
                  );
                }
              })}
          </div>
        </Accordion>
        <Accordion title={t("Professional Details")} defaultValue={true}>
          <div className="row pt-2 pl-2 pr-2">
            {controllerDynamicList
              ?.sort((a, b) => a.DisplayOrder - b.DisplayOrder)
              .map((item) => {
                if (item?.ControlDisplayID === "CentreID") {
                  return (
                    <div className="col-sm-2">
                      {/* <SelectBox
                          lable="Centre"
                          id="CentreID"
                          name="CentreID"
                          className="required-fields"
                          options={EmployeeCenter}
                          selectedValue={EmployeeMaster?.CentreID}
                          onChange={handleSelectChange}
                        /> */}

                      <ReactSelect
                        dynamicOptions={EmployeeCenter}
                        name="CentreID"
                        lable={t("Centre")}
                        id="CentreID"
                        removeIsClearable={true}
                        placeholderName={t("Centre")}
                        value={EmployeeMaster?.CentreID}
                        onChange={handleReactSelect}
                      />
                      {!EmployeeMaster?.CentreID && (
                        <span className="error-message">{error?.CentreID}</span>
                      )}
                    </div>
                  );
                }
                if (item?.ControlDisplayID === "DesignationID") {
                  return (
                    <div className="col-sm-2 position-relative">
                      {/* <SelectBox
                          lable="Designation"
                          id="Designation"
                          name="Designation"
                          className="required"
                          options={Designation}
                          selectedValue={EmployeeMaster?.DesignationID}
                          onChange={handleSelectChange}
                          isDisabled={EmployeeMaster?.ProEmployee == 1 ? true : false}
                        /> */}
                      {/* ---- */}
                      <Tooltip
                        target="#designationAccessInfoIcon"
                        content={t(
                          "Only designations selected in Access Designation are available here",
                        )}
                        position="top"
                      />
                      <i
                        id="designationAccessInfoIcon"
                        className="fa fa-info-circle"
                        style={{
                          position: "absolute",
                          top: "6px",
                          right: "10px",
                          zIndex: 2,
                          color: "#6c757d",
                          cursor: "pointer",
                        }}
                      ></i>
                      <ReactSelect
                        dynamicOptions={accessDesignationList}
                        name="Designation"
                        label={t("Designation")}
                        id="Designation"
                        removeIsClearable
                        placeholderName={t("Designation")}
                        className="required"
                        value={EmployeeMaster?.DesignationID}
                        onChange={handleReactSelectChange}
                      // isDisabled={EmployeeMaster?.ProEmployee == 1 ? true : false}
                      />
                    </div>
                  );
                }
              })}
          </div>
        </Accordion>

        <Accordion title={t("Permanent Details")} defaultValue={true}>
          <div className="row pt-2 pl-2 pr-2">
            {controllerDynamicList
              ?.sort((a, b) => a.DisplayOrder - b.DisplayOrder)
              .map((item) => {
                if (item?.ControlDisplayID === "PHouseNo") {
                  return (
                    <div className="col-sm-2">
                      <div>
                        <Input
                          name="PHouseNo"
                          type="text"
                          max={50}
                          lable="Permanent HouseNo"
                          id="PHouseNo"
                          placeholder=" "
                          value={EmployeeMaster?.PHouseNo}
                          onChange={handleChange}
                        />
                      </div>
                    </div>
                  );
                }
                if (item?.ControlDisplayID === "PStreetName") {
                  return (
                    <div className="col-sm-2">
                      <Input
                        name="PStreetName"
                        value={EmployeeMaster?.PStreetName}
                        type="text"
                        max={50}
                        lable="Permanent StreetName"
                        id="PStreetName"
                        placeholder=" "
                        onChange={handleChange}
                      />
                    </div>
                  );
                }
                if (item?.ControlDisplayID === "PLocality") {
                  return (
                    <div className="col-sm-2">
                      <Input
                        name="PLocality"
                        value={EmployeeMaster?.PLocality}
                        type="text"
                        max={50}
                        lable="Permanent Locality"
                        id="PLocality"
                        placeholder=" "
                        onChange={handleChange}
                      />
                    </div>
                  );
                }
                if (item?.ControlDisplayID === "PPincode") {
                  return (
                    <div className="col-sm-2">
                      <div>
                        <Input
                          name="PPincode"
                          value={EmployeeMaster?.PPincode}
                          type="number"
                          lable="Permanent Pincode"
                          id="Pincode"
                          placeholder=" "
                          onChange={handleChange}
                          onInput={(e) => number(e, 6)}
                        />
                      </div>
                    </div>
                  );
                }
                if (item?.ControlDisplayID === "PCity") {
                  return (
                    <div className="col-sm-2">
                      <div>
                        <Input
                          name="PCity"
                          value={EmployeeMaster?.PCity}
                          type="text"
                          max={50}
                          lable="Permanent City"
                          id="PCity"
                          placeholder=" "
                          onChange={handleChange}
                        />
                      </div>
                    </div>
                  );
                }
                if (item?.ControlDisplayID === "isActive") {
                  return (
                    <div className="col-sm-1  mt-1 d-flex">
                      <div className="mt-1">
                        <Form.Check
                          name="isActive"
                          id="isActive"
                          type="switch"
                          checked={EmployeeMaster?.isActive}
                          onChange={handleInputChange}
                          label={t("Active")}
                          style={{
                            color: EmployeeMaster?.isActive ? "" : "red",
                          }}
                        />
                      </div>
                    </div>
                  );
                }
              })}
          </div>
          <div className="row pt-2 pl-2 pr-2 pb-2">
            <div className="col-sm-2">
              <CustomButton
                text={"Attach Signature"}
                className="btn-block"
                id="AttachSignature"
                onClick={() => {
                  setShow(true);
                }}
              />
            </div>
            <div className="col-sm-2">
              <CustomButton
                text={"Upload Employee Image"}
                className="btn-block"
                id="UploadEmployeeImage"
                onClick={() => {
                  setUploadImage({ ...uploadImage, show: true });
                }}
              />
            </div>
            <div className="col-sm-2">
              {EditData || load ? (
                <Loading />
              ) : (
                <SaveButton
                  text={state?.button ? state?.button : "Submit"}
                  onClick={handleSubmit}
                  className="btn-block"
                  type="submit"
                />
              )}
            </div>
            {stateButton.button === "Update" && (
              <div className="col-auto">
                <CustomButton
                  text={"IP Mapping"}
                  icon={"ip"}
                  onClick={() => {
                    setModal(true);
                    getEmployeeIPaccesssDetails();
                  }}
                />
              </div>
            )}
            {stateButton.button === "Update" && (
              <div className="col-auto">
                <CustomButton
                  text={"RateType Mapping"}
                  icon={"rate"}
                  onClick={() => {
                    setSelectedRates([]);
                    setRateSearchTerm("");
                    setEmployeeMaster((prev) => ({ ...prev, SalesForce: "" }));
                    getRateTypeList();
                    getEmployeeRateTypeMapping();
                    setRateModal(true);
                  }}
                />
              </div>
            )}
            {stateButton.button === "Update" && (
              <div className="col-auto">
                <CustomButton
                  text={"Add Family Member"}
                  icon={"add"}
                  onClick={() => setFamilyMemberModal(true)}
                />
              </div>
            )}
            <div>
              <button
                type="button"
                className="btn btn-success mr-2"
                title="Refresh"
                onClick={handleReset}
              >
                <FaRedo />
              </button>
            </div>
            {stateButton.button === "Update" && (
              <div className="col-auto">
                <CustomButton
                  text={"Log"}
                  icon={"log"}
                  disabled={logLoading}
                  onClick={getEmployeeLog}
                />
              </div>
            )}
            {/* <div className="col-sm-1">
              <Link to="/EmployeeMaster">{t("Back to List")}</Link>
            </div> */}
          </div>
        </Accordion>
      </>
      <AccessHeadModal
        show={showAccessHead}
        onClose={() => setShowAccessHead(false)}
        selectedRights={EmployeeMaster.AccessRight || []}
        onSave={(selectedRights) =>
          setEmployeeMaster((prev) => ({
            ...prev,
            AccessRight: selectedRights,
          }))
        }
      />

      {familyMemberModal && (
        <AddFamilyMemberModal
          visible={familyMemberModal}
          onHide={() => setFamilyMemberModal(false)}
          employeeData={employeeDetails}
        />
      )}

      <Dialog
        visible={modal}
        className={defaultTheme}
        header={t("Enter Detail")}
        onHide={() => {
          setModal(false);
        }}
        style={{
          width: isMobile ? "80vw" : "70vw",
        }}
      >
        <>
          <div className="row pt-2 pl-2 pr-2">
            <div className="col-sm-6">
              <Input
                lable="From IP"
                id="fromIP"
                placeholder=" "
                name="fromIP"
                type="text"
                className="required-fields"
                value={ipPayload.fromIP}
                onChange={handleIpChange}
              />
            </div>

            <div className="col-sm-6">
              <Input
                lable="To IP"
                id="toIP"
                placeholder=" "
                name="toIP"
                type="text"
                className="required-fields"
                value={ipPayload.toIP}
                onChange={handleIpChange}
              />
            </div>

            <div className="col-sm-2 mb-4 mt-2">
              <button
                className="btn btn-block btn-info btn-sm"
                type="button"
                onClick={saveIp}
              >
                {t("Save ")}
              </button>
            </div>
          </div>
          <Accordion title={t("Search Detail")} defaultValue={true}>
            {ipAccessDetails?.length > 0 ? (
              <>
                <Tables>
                  <thead className="cf">
                    <tr>
                      {[
                        t("S.No"),
                        t("From_IP"),
                        t("To_IP"),
                        t("CreatedByName"),
                        t("dtEntry"),
                        t("Action"),
                      ].map((ele, index) => (
                        <th key={index}>{ele}</th>
                      ))}
                    </tr>
                  </thead>

                  <tbody>
                    {ipAccessDetails?.map((ele, index) => (
                      <tr key={ele.id}>
                        <td>{index + 1}</td>
                        <td>{ele.From_IP}</td>
                        <td>{ele.To_IP}</td>
                        <td>{ele.CreatedByName}</td>
                        <td>{ele.dtEntry}</td>
                        <FaTrash
                          onClick={() => deleteEmployeeIPacessDetails(ele?.id)}
                          style={{
                            cursor: "pointer",
                            color: "#dc3545",
                            fontSize: "18px",
                          }}
                          title="Delete"
                        />
                      </tr>
                    ))}
                  </tbody>
                </Tables>
              </>
            ) : (
              <NoRecordFound />
            )}
          </Accordion>
        </>
      </Dialog>

      <Dialog
        visible={rateModal}
        className={defaultTheme}
        header={t("RateType Mapping")}
        onHide={() => {
          setRateModal(false);
          setSelectedRates([]);
          setRateSearchTerm("");
          setEmployeeMaster((prev) => ({ ...prev, SalesForce: "" }));
          getRateTypeList();
        }}
        style={{
          width: isMobile ? "90vw" : "70vw",
          height: "auto",
        }}
        contentStyle={{ overflow: "visible" }}
      >
        <div className="row pt-2 pl-2 pr-2 mb-3 align-items-end">
          <div className="col-sm-8">
            {/* <SelectBoxWithCheckbox
              lable="Rate Type"
              id="RateType"
              placeholder=" "
              name="RateType"
              options={rateTypeData}
              value={selectedRates}
              onChange={(select) => {
                const val = select?.map((ele) => ele?.value);
                setSelectedRates(val);
              }}
            /> */}
            {/* <div className="row px-2">
              <div className="col-xl-3 col-sm-4 col-md-6 co-12">
                <div>
                  <ReactSelect
                    name="SalesForce"
                    id="SalesForce"
                    removeIsClearable={true}
                    placeholderName="SalesForce"
                    value={EmployeeMaster?.SalesForce}
                    dynamicOptions={salesManager}
                    onChange={handleSelectChange}

                  />
                </div>

              </div>
              <div className="col-sm-3">
                <MultiSelectComp
                  label={t("RateType")}
                // options={dropDownApis.machinelist.map((i) => ({
                //     label: i.name,
                //     value: i.id,
                // }))}
                // value={payload.Machine}
                // name="Machine"
                // id="Machine"
                // onChange={handleSelectMultiChange}
                />
              </div>
              <UltraFastSelect
                options={rateTypeData}
                value={selectedRates}
                onChange={rateTypeMapChange}
                searchable={true}
                isClearable={true}
                name="RateType"
                label={t("Rate Type")}
                placeholderName="Rate Type"
                id="RateType"
              />
            </div> */}
            {/* <div className="row px-2 align-items-end">
              <div className="col-sm-4">
                <ReactSelect
                  name="SalesForce"
                  id="SalesForce"
                  removeIsClearable={true}
                  placeholderName="SalesForce"
                  lable={t("SalesForce")}
                  value={EmployeeMaster?.SalesForce}
                  dynamicOptions={salesManager}
                  onChange={handleReactSelect}
                />
              </div>

              {EmployeeMaster?.SalesForce && (
                <div className="col-sm-4">
                  <MultiSelectComp
                    label={t("RateType")}
                  />
                </div>
              )}

              {!EmployeeMaster?.SalesForce && (
                <div className="col-sm-4 mb-2">
                  <UltraFastSelect
                    options={rateTypeData}
                    value={selectedRates}
                    onChange={rateTypeMapChange}
                    searchable={true}
                    isClearable={true}
                    name="RateType"
                    label={t("Rate Type")}
                    placeholderName="Rate Type"
                    id="RateType"
                  />
                </div>
              )}
            </div> */}
            <div className="row px-2 align-items-end">
              <div className="col-sm-4">
                <ReactSelect
                  name="SalesForce"
                  id="SalesForce"
                  removeIsClearable={true}
                  placeholderName="SalesManager"
                  lable={t("SalesManager")}
                  value={EmployeeMaster?.SalesForce}
                  dynamicOptions={salesManager}
                  onChange={handleReactSelect}
                />
              </div>

              {EmployeeMaster?.SalesForce && (
                <div className="col-sm-4">
                  <MultiSelectComp
                    label={t("RateType")}
                    options={rateTypeData}
                    value={selectedRates}
                    placeholder=""
                    name="RateType"
                    id="RateType"
                    onChange={handleSelectMultiChange}
                  />
                </div>
              )}

              {!EmployeeMaster?.SalesForce && (
                <div className="col-sm-4 mb-2">
                  <UltraFastSelect
                    options={rateTypeData}
                    value={selectedRates}
                    onChange={rateTypeMapChange}
                    searchable={true}
                    isClearable={true}
                    name="RateType"
                    label={t("Rate Type")}
                    placeholderName="Rate Type"
                    id="RateType"
                  />
                </div>
              )}
            </div>

          </div>
          <div className="col-sm-4 d-flex" style={{ gap: "10px" }}>
            <CustomButton
              text={t("Add")}
              icon={'add'}
              type="button"
              onClick={saveEmployeeRateTypeMapping}
            />
            {selectedRowIds.length > 0 && (
              <CustomButton
                text={t("Remove Selected")}
                icon={'delete'}
                type="button"
                onClick={handleRemoveSelected}
              />
            )}
          </div>
        </div>

        <Heading
          title={`EmployeeID: ${employeeDetails?.EmployeeID || ""} | Name: ${employeeDetails?.Name || ""} | Code: ${employeeDetails?.EmployeeCode || ""}`}
          secondTitle={
            <>
              {mappedRateData?.length > 0 && <div style={{ width: "200px" }}>
                <Input
                  type="text"
                  placeholder={t("Search Rate Type...")}
                  value={rateSearchTerm}
                  onChange={(e) => setRateSearchTerm(e.target.value)}
                />
              </div>}
            </>
          }
        />

        <div className="mt-3">
          {mappedRateData?.filter((item) => Object.values(item).some((val) =>
            String(val).toLowerCase().includes(rateSearchTerm.toLowerCase())
          )
          )?.length > 0 ? (
            <Tables
              style={{
                height: "60vh"
              }}>
              <thead>
                <tr>
                  <th>{t("SrNo")}</th>
                  {/* <th>{t("RateTypeID")}</th> */}
                  <th>{t("CodeName")}</th>
                  <th>{t("CreatedBy")}</th>
                  <th>{t("CreatedDate")}</th>
                  {/* <th>{t("Remove")}</th> */}
                  <th>

                    <input

                      type="checkbox"
                      style={{ marginLeft: "6px", cursor: "pointer" }}
                      checked={selectedRowIds.length === (mappedRateData?.length || 0) && (mappedRateData?.length ?? 0) > 0}
                      onChange={handleSelectAllChange}
                    />
                    {t("Remove")}
                  </th>
                </tr>
              </thead>
              <tbody>
                {mappedRateData
                  ?.filter((item) =>
                    Object.values(item).some((val) =>
                      String(val).toLowerCase().includes(rateSearchTerm.toLowerCase())
                    )
                  )
                  .map((item, index) => (
                    <tr key={index}>
                      <td>{index + 1}</td>

                      <td>{item.RateTypeName || item.CodeName}</td>
                      <td>{item.CreatedByName || item.CreatedBy}</td>
                      <td>{item.dtEntry || item.CreatedDate}</td>
                      {/* <td>
                        <FaTrash
                          onClick={() => deleteEmployeeRateTypeMapping(item.ID)}
                          style={{
                            cursor: "pointer",
                            color: "#dc3545",
                            fontSize: "18px",
                          }}
                          title="Remove"
                        />
                      </td> */}
                      <td>
                        <input
                          type="checkbox"
                          name={String(index)}
                          checked={selectedRowIds.includes(item.ID)}
                          onChange={(e) => handleRowSelectChange(e, item.ID)}
                        />
                      </td>
                    </tr>
                  ))}
              </tbody>
            </Tables>
          ) : (
            <NoRecordFound />
          )}
        </div>
      </Dialog>

      {/* {dialog box eyes icon data} */}
      {/* DIALOG 1 - View Translations */}
      {/* <Dialog
        header="Employee"
        className={defaultTheme}
        visible={showEmployeeDialog}
        style={{ width: "90vw" }}
        onHide={() => setShowEmployeeDialog(false)}
        modal
      > */}
      <Dialog
        header="Employee"
        className={defaultTheme}
        visible={showEmployeeDialog}
        style={{ width: "90vw" }}
        onHide={() => {
          setShowEmployeeDialog(false);
          setTableData([]);
          setSearchText("");
          setPayload((prev) => ({
            ...prev,
            SearchType: "employeeCode",
            ItemValue: "",
            phoneNumber: "",
            email: "",
            employeeCode: "",
            userName: "",
            houseNo: 0,
          }));
          setCurrentPage(1);
        }}
        modal
      >
        {/* <div>
          <Heading name={t("Employee Master")} isBreadcrumb={true}
          
          ></Heading>
              <div className="col-sm-3">
                <div className="d-flex" style={{ display: "flex" }}>
                  <div style={{ width: "40%" }}>
                    <SelectBox
                      options={searchType}
                      id="SearchType"
                      lable="SearchType"
                      selectedValue={payload.SearchType}
                      name="SearchType"
                      onChange={handleSelectBoxChange}
                    />
                  </div>
                  <div
                    className="flex-grow-1"
                    style={{ width: "50%" }}
                  >
                    {payload?.SearchType === "mobileNumber" ? (
                      <Input
                        type="number"
                        name="ItemValue"
                        max={10}
                        // onKeyDown={handleKeyDown}
                        value={payload.ItemValue}
                        onChange={handleSelectBoxChange}
                        onInput={(e) => number(e, 10)}
                      />
                    ) : (
                      <Input
                        type="text"
                        name="ItemValue"
                        // onKeyDown={handleKeyDown}
                        max={20}
                        value={payload.ItemValue}
                        onChange={handleSelectBoxChange}
                      />
                    )}
                  </div>

                  
                </div>
                
                           
                              <CustomButton
                                text={"Search"}
                                icon={"search"}
                                className="btn btn-block btn-info btn-sm"
                                onClick={handleSearch}
                              />
                
                          
                            
              </div>

            </div> */}
        <div className="d-flex align-items-center mb-2" style={{ gap: "5px", flexWrap: "wrap" }}>
          <div style={{ width: "160px", marginTop: "8px" }}>
            <SelectBox
              options={searchType}
              id="SearchType"
              lable="SearchType"
              selectedValue={payload.SearchType}
              name="SearchType"
              onChange={handleSelectBoxChange}
            />
          </div>

          <div style={{ width: "220px", marginTop: "8px", paddingTop: "1px" }}>
            {payload?.SearchType === "mobileNumber" ? (
              <Input
                type="number"
                name="ItemValue"
                max={10}
                value={payload.ItemValue}
                onChange={handleSelectBoxChange}
                onInput={(e) => number(e, 10)}
              />
            ) : (
              <Input
                type="text"
                name="ItemValue"
                max={20}
                value={payload.ItemValue}
                onChange={handleSelectBoxChange}
              />
            )}
          </div>

          <div style={{ marginTop: "8px", marginLeft: "8px" }}>
            <CustomButton
              text={"Search"}
              icon={"search"}
              className="btn btn-info btn-sm mb-2"
              onClick={handleSearch}
            />
          </div>
        </div>
        <div>
          <Accordion
            title={t("Search Data")}
            defaultValue={true}
            notOpen={true}
            linkTo="#"
            linkTitle={
              <div className="d-flex align-items-center" style={{ gap: "15px" }}>
                {colorCodingData.map(({ color, labelKey, id }) => (
                  <ColorCodingSearch key={id} color={color} label={t(labelKey)} />
                ))}
                <div>
                  <Input
                    type="text"
                    placeholder="Search in table..."
                    value={searchText}
                    onClick={(e) => e.stopPropagation()}
                    onChange={(e) => setSearchText(e.target.value)}
                    style={{ minWidth: "200px" }}
                    className="my-4"
                  />
                </div>
              </div>
            }
          >

            {filteredTableData.length > 0 ? (
              <>
                {/* <div className="mb-2 text-muted">
              <small>
                Showing {filteredTableData.length} of {tableData.length} records
                {searchText && ` (filtered by "${searchText}")`}
              </small>
            </div> */}
                <Tables>
                  <thead className="cf">
                    <tr>
                      <th>{t("S.No")}</th>
                      <th>{t("Edit")}</th>
                      <th>{t("Name")}</th>
                      <th>{t("HouseNo")}</th>
                      <th>{t("StreetName")}</th>
                      <th>{t("Locality")}</th>
                      <th>{t("City")}</th>
                      <th>{t("Pincode")}</th>
                      <th>{t("PHouseNo")}</th>
                      <th>{t("PStreetName")}</th>
                      <th>{t("PLocality")}</th>
                      <th>{t("PCity")}</th>
                      <th>{t("PPincode")}</th>
                      <th>{t("Mobile")}</th>
                      <th>{t("Email")}</th>

                    </tr>
                  </thead>
                  <tbody>
                    {paginatedTableData?.map((data, index) => (
                      <tr
                        key={index}
                        style={{
                          backgroundColor:
                            data?.isActive === 1 ? "#FFFFFF" : "#f5c6cb",
                        }}
                      >
                        {/* <td data-title={t("S.No")}>{index + 1}&nbsp;</td> */}
                        <td data-title={t("S.No")}>{indexOfFirstRow + index + 1}&nbsp;</td>
                        {/* <td data-title={t("Action")} className="text-center">
                          <Link
                            to="/CreateEmployeeMaster"
                            state={{
                              button: "Update",
                              url1: "Employee/getEmployeeDetailsByID",
                              url2: "Employee/UpdateEmployee",
                              id: data?.EmployeeID,
                            }}
                          >
                            <i
                              className="fa fa-edit"
                              style={{ color: "#605ca8", cursor: "pointer" }}
                            ></i>
                          </Link>
                        </td> */}
                        <td data-title={t("Action")} className="text-center">
                          <Link
                            to="/CreateEmployeeMaster"
                            state={{
                              button: "Update",
                              url1: "Employee/getEmployeeDetailsByID",
                              url2: "Employee/UpdateEmployee",
                              id: data?.EmployeeID,
                            }}
                            onClick={() => {
                              setShowEmployeeDialog(false);
                              setTableData([]);
                              setSearchText("");
                              setCurrentPage(1);
                            }}
                          >
                            <i
                              className="fa fa-edit"
                              style={{ color: "#605ca8", cursor: "pointer" }}
                            ></i>
                          </Link>
                        </td>
                        <td data-title={t("Name")}>{data?.Name}&nbsp;</td>
                        <td data-title={t("HouseNo")}>{data?.HouseNo}&nbsp;</td>
                        <td data-title={t("StreetName")}>
                          {data?.StreetName}&nbsp;
                        </td>
                        <td data-title={t("Locality")}>{data?.Locality}&nbsp;</td>
                        <td data-title={t("City")}>{data?.City}&nbsp;</td>
                        <td data-title={t("Pincode")}>{data?.Pincode}&nbsp;</td>
                        <td data-title={t("PHouseNo")}>{data?.PHouseNo}&nbsp;</td>
                        <td data-title={t("PStreetName")}>
                          {data?.PStreetName}&nbsp;
                        </td>
                        <td data-title={t("PLocality")}>
                          {data?.PLocality}&nbsp;
                        </td>
                        <td data-title={t("PCity")}>{data?.PCity}&nbsp;</td>
                        <td data-title={t("PPincode")}>{data?.PPincode}&nbsp;</td>
                        <td data-title={t("Mobile")}>{data?.Mobile}&nbsp;</td>
                        <td data-title={t("Email")}>{data?.Email}&nbsp;</td>

                      </tr>
                    ))}
                  </tbody>
                </Tables>
                {/* PAGINATION */}
                <div className="d-flex justify-content-end align-items-center mt-2">
                  <Pagination
                    className="pagination-bar"
                    currentPage={currentPage}
                    totalCount={filteredTableData.length}
                    pageSize={rowsPerPage}
                    onPageChange={(page) => setCurrentPage(page)}
                  />
                </div>
              </>
            ) : (
              <NoRecordFound />
            )}
          </Accordion>
        </div>

      </Dialog>


      {logModal && (
        <Dialog
          visible={logModal}
          className={defaultTheme}
          header={
            <span>
              {/* {t("Employee Master Log")} */}
              <span className="ml-4" style={{ fontSize: "14px" }}>
                {t("Employee ID")} - {state?.id} |{" "}
                {t("Code")} - {EmployeeMaster?.EmployeeCode} |{" "}
                {t("Name")} - {EmployeeMaster?.Name}
              </span>
            </span>
          }
          onHide={() => setLogModal(false)}
          style={{ width: isMobile ? "90vw" : "80vw" }}
        >
          <div className="card">
            <div className="card-body p-0" style={{ maxHeight: "60vh", overflowY: "auto" }}>
              {logLoading ? (
                <Loading />
              ) : (
                <Tables>
                  <thead className="cf">
                    <tr>
                      <th>{t("Sr.No")}</th>
                      <th>{t("Status")}</th>
                      <th>{t("Old Value")}</th>
                      <th>{t("New Value")}</th>
                      <th>{t("ChangeBy")}</th>
                      <th>{t("ChangeBy Date")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {logDetails?.length > 0 ? (
                      logDetails.map((ele, index) => (
                        <tr key={index}>
                          <td>{index + 1}</td>
                          <td>{ele.columnName || "-"}</td>
                          <td>{ele.oldValue || '-'}</td>
                          <td>{ele.newValue || "-"}</td>
                          <td>{ele.createdByName || ele.ChangeByName || "-"}</td>
                          <td>
                            {(ele.UpdatedDate || ele.dtEntry)
                              ? moment(ele.UpdatedDate || ele.dtEntry).format("DD/MM/YYYY")
                              : "-"}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={6}><NoRecordFound /></td>
                      </tr>
                    )}
                  </tbody>
                </Tables>
              )}
            </div>
          </div>
        </Dialog>
      )}
    </>
  );
};

export default CreateEmployeeMaster;
