import React, { useEffect, useState } from "react";

import { useTranslation } from "react-i18next";
import Accordion from "../../../components/UI/Accordion";
import ReactSelect from "../../../components/formComponent/ReactSelect";
import { axiosInstance } from "../../../utils/axiosInstance";
import Input from "../../../components/formComponent/Input";
import DatePicker from "../../../components/formComponent/DatePicker";
import { FaMinus, FaPlus } from "react-icons/fa";
import { MdDelete, MdDeleteOutline } from "react-icons/md";
import CustomTable from "../../../components/Table/CustomTable";
import Heading from "../../../components/UI/Heading";

import "../Equipmentmaster.css";
import "../../Laboratory/patientRegistrationRequiredClass.css";
import EquipmentMasterModal from "./EquipmentMasterModal";
import SubCategoryModal from "./SubCategoryModal";
import CategoryModal from "./CategoryModal";
import FileUpload from "../../ManageQuery/FileUpload";
import { toast } from "react-toastify";
import Tooltip from "../../../components/formComponent/Tooltip";
import FilterInput from "../../../components/Filter/FilterInput";
import { CiEdit } from "react-icons/ci";
import { autocompleteOnBlur, ExportToExcel } from "../../../utils/helpers";
import EquipmentDashboard from "../equipmentDashboard/EquipmentDashboard";
import EquipmentTransfer from "../equipmentTransfer/EquipmentTransfer";
import { useNavigate } from "react-router-dom";
import SeeMore from "../../SampleStorage/frameMenu/SeeMore";
import { ViewMenu } from "../../../components/SvgIcons";
import EquipementMaintenance from "../equipmentMaintenanace/EquipementMaintenance";
import VirtualDepartment from "../virtualDepartment/VirtualDepartment";
import TableFilterDot from "../../Components/TableFilterDot";
import BreakdownSummary from "../equipmentMaintenanace/BreakdownSummary";
import Modal from "../../../components/ModalComponent/Modal";
import ColorCodingSearch from "../../../components/ModalComponent/ColorCodingSearch";
import {
  GetBindcattype,
  getBindCentreType,
  GetBindSubcattype,
  GetMachine,
  getManufacture,
} from "../../../utils/NetworkApi/commonApi";
import MultiSelectComp from "../../../components/formComponent/MultiSelectComp";
import { apiUrls } from "../../../utils/apiUrls";
import { useLocalStorage } from "../../../utils/hooks/useLocalStorage";
import { CustomButton } from "../../../components/UI/CustomButton";
import AutoComplete from "../../../components/formComponent/AutoComplete";
import { notify } from "../../../utils/utils";

const EquipmentMaster = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [centredata, setcentredata] = useState([]);
  const [errors, setErrors] = useState({});
  const [showMore, setShowMore] = useState(false);
  const [equipmentTypeList, setEquipmentTypeList] = useState([]);
  const [tableDataList, setTableDataList] = useState([]);
  const [supplierdata, setsupplierdata] = useState([]);
  const [mancomdata, setmancomdata] = useState([]);
  const [categorydata, setcategorydata] = useState([]);
  const [subcategorydata, setsubcategorydata] = useState([]);
  const [FetchDepartment, setFetchDepartment] = useState([]);
   const [searchEmployeePayload, setSearchEmployeePayload] = useState({
    label: "",
    value: null,
  });
  const [selectSearchEmployee, setSelectSearchEmployee] = useState(false);
  const [employeeList, setEmployeeList] = useState([]);
    const [searchEmployeeSuggestions, setSearchEmployeeSuggestions] = useState(
      [],
    );
 
      const [searchEmployeeIndex, setSearchEmployeeIndex] = useState(0);

  const seeMoreData = [
    {
      name: "Equipment Dashboard",
      component: <EquipmentDashboard setShowMore={setShowMore} />,
      url: "/equipmentmanager/equipment-dashboard",
    },
    {
      name: "Virtual Department Master",
      component: <VirtualDepartment setShowMore={setShowMore} />,
      url: "/equipmentmanager/virtual-department",
    },
    {
      name: "Equipment Master",
      component: <EquipmentMaster setShowMore={setShowMore} />,
      url: "/equipmentmanager/equipment-master",
    },
    {
      name: "Equipment Maintenance",
      component: <EquipementMaintenance setShowMore={setShowMore} />,
      url: "/equipmentmanager/equipment-maintanance",
    },
    {
      name: "Equipment Transfer",
      component: <EquipmentTransfer setShowMore={setShowMore} />,
      url: "/equipmentmanager/equipment-transfer",
    },
    {
      name: "Breakdown Summary",
      component: <BreakdownSummary setShowMore={setShowMore} />,
      url: "/equipmentmanager/breakdown-summary",
    },
    {
      name: "Equipment Management Hub",
      component: null,
      url: "/equipmentmanager/equipment-hub",
    },
  ];

  const userData = useLocalStorage("userData", "get") || "";

  const [dropDownApis, setDropDownApis] = useState({
    categorylist: [],
    subcategorylist: [],
    itemcategorylist: [],
    machinelist: [],
    items: [],
    SupplierName: [],
    Manufacture: [],
    vendor: [],
  });

  const [payload, setPayload] = useState({
    centreId: "",
    equipmentType: "",
    equipmentName: "",
    modelNo: "",
    serialNo: "",
    supplier: "",
    manufactureCompany: "",
    attachment: "",
    serviceType: "",
    startDate: new Date(),
    renewalDate: new Date(),
    installationDate: new Date(),
    remarks: "",
    pmDoneDate: new Date(),
    pmRenewalRequired: "",
    calibrationDoneDate: new Date(),
    calibrationRenewalRequired: "",
    scheduleType: "",
    scheduleCategory: "",
    subCategory: "",
    internalItemCode: "",
    firewall: "",
    lisStatus: "",
    ownershipStatus: "",
    status: "",
    CategoryType: [],
    SubCategoryType: [],
    SupplierName: "",
    Manufacture: "",
    DepartmentName: [],
    Machine: "",
    subcategorydata: "",
    categorydata: "",
    vendor: "",
    Type: "",
    email: "",
    mobile: "",
    designation: "",
    EquipmentID: "",
  });

  // ─── Row state with proper field tracking ────────────────────────────────
  const [rows, setRows] = useState([{ name: "", designation: "", mobile: "", email: "" }]);
  const [supportrows, setsupportRows] = useState([{ name: "", designation: "", mobile: "", email: "" }]);
  const [intdept, setintdept] = useState([{ name: "", designation: "", mobile: "", email: "" }]);
  const [maintanence, setmaintanence] = useState([{ Type: "", categorydata: "", subcategorydata: "" }]);

  // ─── Row field change handlers ────────────────────────────────────────────
  const handleRowChange = (index, field, value) => {
    if (field === "mobile") {
      value = value.replace(/[^0-9]/g, "").slice(0, 10);
    }
    setRows((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const handleSupportRowChange = (index, field, value) => {
    if (field === "mobile") {
      value = value.replace(/[^0-9]/g, "").slice(0, 10);
    }
    setsupportRows((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const handleIntDeptRowChange = (index, field, value) => {
    if (field === "mobile") {
      value = value.replace(/[^0-9]/g, "").slice(0, 10);
    }
    setintdept((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const handleMaintenanceRowChange = (index, field, e) => {
    const val = e?.value;
    setmaintanence((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: val };
      return updated;
    });
    if (index === 0) {
      setPayload((prev) => ({ ...prev, [field]: val }));
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
     // Mobile validation
    if (name === "mobile") {
      const numericValue = value.replace(/[^0-9]/g, "").slice(0, 10);
      setPayload((prev) => ({
        ...prev,
        mobile: numericValue,
      }));
      return;
    }
    setPayload((prev) => ({ ...prev, [name]: value }));
  };

  const GetEquipment = (state, name) => {
    axiosInstance
      .post("Global/GetGlobalData", { Type: name })
      .then((res) => {
        let data = res.data.message;
        let SampleContainer = data.map((ele) => ({
          value: ele.FieldID,
          label: ele.FieldDisplay,
        }));
        return state(SampleContainer);
      })
      .catch((err) => console.log(err));
  };

  useEffect(() => {
    GetEquipment(setcategorydata, "EquipmentCategory");
    GetEquipment(setsubcategorydata, "EquipmentSubCategory");
  }, []);

  // ─── Helper: safely parse a date string/value into a Date object ──────────
  const parseDate = (val) => {
    if (!val) return new Date();
    if (val instanceof Date) return val;
    const d = new Date(val);
    return isNaN(d.getTime()) ? new Date() : d;
  };

  // ─── Helper: find a matching {value, label} option from a list ───────────
  const findOption = (list, val) => {
    if (!val && val !== 0) return "";
    return (
      list?.find(
        (opt) =>
          String(opt.value) === String(val) ||
          String(opt.label) === String(val)
      ) || ""
    );
  };

  // ─── Helper: find option value by matching label (for API data that returns labels instead of IDs)
  const getValueByLabel = (list, label) => {
    if (!label && label !== 0) return "";
    const normalizedLabel = String(label).trim();
    // Try exact match first
    let option = list?.find((opt) => String(opt.label).trim() === normalizedLabel);
    // If no exact match, try case-insensitive
    if (!option) {
      option = list?.find((opt) => String(opt.label).trim().toLowerCase() === normalizedLabel.toLowerCase());
    }
    return option?.value || "";
  };

  // ─── Helper: find option value by matching either value or label
  const getOptionValue = (list, val) => {
    if (!val && val !== 0) return "";
    const normalizedVal = String(val).trim();
    // Try exact match by value first
    let option = list?.find((opt) => String(opt.value).trim() === normalizedVal);
    // Then try exact match by label
    if (!option) {
      option = list?.find((opt) => String(opt.label).trim() === normalizedVal);
    }
    // Finally try case-insensitive label match
    if (!option) {
      option = list?.find((opt) => String(opt.label).trim().toLowerCase() === normalizedVal.toLowerCase());
    }
    return option?.value || "";
  };

  // ─── Build final payload for save/update ─────────────────────────────────
  const buildFinalPayload = (includeId = false) => {
    const fmt = (v) => {
      if (!v) return "";
      try {
        const d = new Date(v);
        return isNaN(d.getTime()) ? String(v).slice(0, 10) : d.toISOString().slice(0, 10);
      } catch (e) {
        return String(v).slice(0, 10);
      }
    };

    const userId = userData?.UserID || userData?.userId || userData?.id || 1;
    const userName = userData?.UserName || userData?.userName || userData?.username || userData?.name || "Admin";

    const base = {
      labMachine: String(payload?.Machine || payload?.equipmentType || ""),
      centre: String(payload?.centreId || ""),
      CentreID: String(payload?.centreId || ""),
      // machineName: use human-readable label if available, fallback to id
      machineName: (findOption(dropDownApis?.machinelist, payload?.Machine)?.label) || String(payload?.Machine || ""),
      eqDisplayName: String(payload?.equipmentName || ""),
      serialNo: String(payload?.serialNo || ""),
      modelNo: String(payload?.modelNo || ""),
      // manufacture: send manufacture name if available
      manufacture: (findOption(dropDownApis?.Manufacture, payload?.Manufacture)?.label) || String(payload?.Manufacture || ""),
      vendor: String(payload?.vendor || ""),
      supplier: String(payload?.SupplierName || payload?.supplier || ""),
      serviceType: String(payload?.serviceType || ""),
      serviceStartDate: fmt(payload?.startDate),
      serviceRenewDate: fmt(payload?.renewalDate),
      installDate: fmt(payload?.installationDate),
      intimationDay: String(payload?.pmRenewalRequired || ""),
      calibrationDay: String(payload?.calibrationRenewalRequired || ""),
      calibrationType: String(payload?.scheduleType || ""),
      type: String(payload?.Type || ""),
      remarks: String(payload?.remarks || ""),

      // Sales Contact
      salesPName1: rows?.[0]?.name || "",
      salesPDesignation1: rows?.[0]?.designation || "",
      salesPMobile1: rows?.[0]?.mobile || "",
      salesPEmail1: rows?.[0]?.email || "",
      salesPName2: rows?.[1]?.name || "",
      salesPDesignation2: rows?.[1]?.designation || "",
      salesPMobile2: rows?.[1]?.mobile || "",
      salesPEmail2: rows?.[1]?.email || "",
      salesPName3: rows?.[2]?.name || "",
      salesPDesignation3: rows?.[2]?.designation || "",
      salesPMobile3: rows?.[2]?.mobile || "",
      salesPEmail3: rows?.[2]?.email || "",

      // Support Contact
      supportPName1: supportrows?.[0]?.name || "",
      supportPDesignation1: supportrows?.[0]?.designation || "",
      supportPMobile1: supportrows?.[0]?.mobile || "",
      supportPEmail1: supportrows?.[0]?.email || "",
      supportPName2: supportrows?.[1]?.name || "",
      supportPDesignation2: supportrows?.[1]?.designation || "",
      supportPMobile2: supportrows?.[1]?.mobile || "",
      supportPEmail2: supportrows?.[1]?.email || "",
      supportPName3: supportrows?.[2]?.name || "",
      supportPDesignation3: supportrows?.[2]?.designation || "",
      supportPMobile3: supportrows?.[2]?.mobile || "",
      supportPEmail3: supportrows?.[2]?.email || "",

      // Internal Dept Contacts
      otherPName1: intdept?.[0]?.name || "",
      otherPDesignation1: intdept?.[0]?.designation || "",
      otherPMobile1: intdept?.[0]?.mobile || "",
      otherPEmail1: intdept?.[0]?.email || "",
      otherPName2: intdept?.[1]?.name || "",
      otherPDesignation2: intdept?.[1]?.designation || "",
      otherPMobile2: intdept?.[1]?.mobile || "",
      otherPEmail2: intdept?.[1]?.email || "",
      otherPName3: intdept?.[2]?.name || "",
      otherPDesignation3: intdept?.[2]?.designation || "",
      otherPMobile3: intdept?.[2]?.mobile || "",
      otherPEmail3: intdept?.[2]?.email || "",

      // eqType: send equipment type name (label) if available
      eqType: (findOption(equipmentTypeList, payload?.equipmentType)?.label) || String(payload?.equipmentType || ""),
      department: includeId
        ? (Array.isArray(payload?.DepartmentName)
            ? payload?.DepartmentName?.map((item) => String(item?.value || item))
                ?.filter((val) => val)
                ?.join(",")
            : "")
        : (Array.isArray(payload?.DepartmentName)
            ? payload?.DepartmentName?.map((item) => parseInt(item?.value || item, 10))
                ?.filter((val) => !isNaN(val))
            : []),

      pmDoneDate: fmt(payload?.pmDoneDate || payload?.pmDoneDate),
      pmDueDate: fmt(payload?.pmDueDate || payload?.pmDueDate || payload?.pmDueDate || ""),
      calDoneDate: fmt(payload?.calibrationDoneDate || ""),
      calDueDate: fmt(payload?.calDueDate || ""),

      internalItemID: String(payload?.internalItemCode || payload?.internalItemID || ""),
      firewall: String(payload?.firewall || ""),
      parameterMapping: String(payload?.parameterMapping || ""),
      lisStatus: String(payload?.lisStatus || ""),
      lisDirectionalStatus: String(payload?.lisDirectionalStatus || ""),
      ownershipStatus: String(payload?.ownershipStatus || ""),

      isActive:
        (typeof payload?.status === "string" && payload?.status?.toLowerCase() === "active") || payload?.status === "1"
          ? "1"
          : "0",

      deleteRemark: String(payload?.deleteRemark || ""),
      dtEntry: new Date().toISOString(),
      createdBy: userId,
      createdByName: userName,

      category: String(payload?.categorydata || payload?.category || ""),
      subCategory: String(payload?.subcategorydata || payload?.subCategory || ""),
      supplier: String(payload?.supplier || payload?.SupplierName || ""),
    };

    if (includeId) {
      base.EquipmentID = String(payload?.EquipmentID || "");
      base.Id = String(payload?.EquipmentID || "");
      // also include lowercase id field expected by update API
      base.id = String(payload?.EquipmentID || "");
      // include centreID in lowercase as expected
      base.centreID = String(payload?.centreId || payload?.CentreID || "");

      // ensure department is a string for update (comma separated)
      if (Array.isArray(base.department)) {
        base.department = base.department.map((d) => String(d)).join(",");
      }
    }

    return base;
  };
  //naame Api
  const handleSearchEmployeeChange = (e) => {
    const value = e.target.value;
    setSearchEmployeePayload({ label: value, value: null });

    if (!value.trim()) {
      // empty — reset list
      setSelectSearchEmployee(false);
      setSearchEmployeeSuggestions([]);
    } else {
      // Call API to fetch employees based on search term
      const apiPayload = {
        employeeID: 0,
        employeeName: value || "",
      };
      axiosInstance
        .post("Employee/getEmployee", apiPayload)
        .then((res) => {
          const data = res?.data?.message || [];
          let employeeListData = data.map((ele) => {
            const fullName = `${ele?.EmployeeName}, EmployeeId :${ele?.EmployeeID}${ele?.EmployeeCode ? `, EmployeeCode :${ele?.EmployeeCode}` : ""}${ele?.Mobile ? `, Mobile :${ele?.Mobile}` : ""}${ele?.Username ? `, Username :${ele?.Username}` : ""}`;
  
            return {
              value: ele.EmployeeID,
              label: ele.EmployeeName || "",
              fullName: fullName,
              Mobile: ele?.Mobile || "",
              Username: ele?.Username || "",
            };
          });
          setEmployeeList(employeeListData);
          setSearchEmployeeSuggestions(employeeListData);
          setSelectSearchEmployee(employeeListData.length > 0);
          setSearchEmployeeIndex(0);
        })
        .catch((err) => {
          console.log(err);
          setSearchEmployeeSuggestions([]);
          setSelectSearchEmployee(false);
        });
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
  const handleSearchEmployeeSelect = (selected) => {
    if (!selected) return;

    // Set selected employee data in the form
    setSearchEmployeePayload({
      label: selected.label,
      value: selected.value,
    });
    
    // Close the autocomplete dropdown
    setSelectSearchEmployee(false);
    setSearchEmployeeSuggestions([]);
  };

  const validateEmails = () => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;

    // Validate Sales contact rows
    for (let i = 0; i < rows.length; i++) {
      if (!rows[i].email || rows[i].email.trim() === "") {
        notify(`Sales Contact ${i + 1} Email is required`, "error");
        return false;
      }
      if (!emailRegex.test(rows[i].email)) {
        notify(`Sales Contact ${i + 1} Email must be a valid gmail address`, "error");
        return false;
      }
    }

    // Validate Support contact rows
    for (let i = 0; i < supportrows.length; i++) {
      if (!supportrows[i].email || supportrows[i].email.trim() === "") {
        notify(`Support Contact ${i + 1} Email is required`, "error");
        return false;
      }
      if (!emailRegex.test(supportrows[i].email)) {
        notify(`Support Contact ${i + 1} Email must be a valid gmail address`, "error");
        return false;
      }
    }

    // Validate Internal Department rows
    for (let i = 0; i < intdept.length; i++) {
      if (!intdept[i].email || intdept[i].email.trim() === "") {
        notify(`Internal Dept Contact ${i + 1} Email is required`, "error");
        return false;
      }
      if (!emailRegex.test(intdept[i].email)) {
        notify(`Internal Dept Contact ${i + 1} Email must be a valid gmail address`, "error");
        return false;
      }
    }

    return true;
  };

  // ─── Save ─────────────────────────────────────────────────────────────────
  const equipmentSave = () => {
    if (!payload?.equipmentType) {
      setErrors((prev) => ({ ...prev, equipmentType: true }));
      notify("Equipment Type is required", "error");
      return;
    }
    if(!payload?.Machine) {
      setErrors((prev) => ({ ...prev, Machine: true }));
      notify("Machine is required", "error");
      return;
    }
    if (!validateEmails()) {
      return;
    }
    const finalPayload = buildFinalPayload(false);
    console.log("Save payload:", finalPayload);

    axiosInstance
      .post("Equipment/save", finalPayload)
      .then((res) => {
        if (res?.data?.success) {
          toast.success(res?.data?.message || "Equipment Saved Successfully");
          resetForm();
          tableApi(userData?.CompanyID);
        } else {
          toast.error(res?.data?.message || "Save Failed");
        }
      })
      .catch((err) => {
        toast.error(err?.response?.data?.message || "Failed To Save");
      });
  };

  // ─── Update ───────────────────────────────────────────────────────────────
  const equipmentUpdate = () => {
    if (!payload?.equipmentType) {
      setErrors((prev) => ({ ...prev, equipmentType: true }));
      notify("Equipment Type is required", "error");
      return;
    }
     if(!payload?.Machine) {
      setErrors((prev) => ({ ...prev, Machine: true }));
      notify("Machine is required", "error");
      return;
    }
    if (!validateEmails()) {
      return;
    }
    const finalPayload = buildFinalPayload(true);
    console.log("Update payload:", finalPayload);

    axiosInstance
      .post("Equipment/UpdateMachineData", finalPayload)
      .then((res) => {
        if (res?.data?.success) {
          toast.success(res?.data?.message || "Equipment Updated Successfully");
          setIsEditMode(false);
          resetForm();
          tableApi(userData?.CompanyID);
        } else {
          toast.error(res?.data?.message || "Update Failed");
        }
      })
      .catch((err) => {
        console.error("Update error:", err);
        toast.error(err?.response?.data?.message || "Failed To Update");
      });
  };

  // ─── Reset form ───────────────────────────────────────────────────────────
  const resetForm = () => {
    setErrors({});
    setPayload({
      centreId: "",
      equipmentType: "",
      equipmentName: "",
      modelNo: "",
      serialNo: "",
      supplier: "",
      manufactureCompany: "",
      attachment: "",
      serviceType: "",
      startDate: new Date(),
      renewalDate: new Date(),
      installationDate: new Date(),
      remarks: "",
      pmDoneDate: new Date(),
      pmRenewalRequired: "",
      calibrationDoneDate: new Date(),
      calibrationRenewalRequired: "",
      scheduleType: "",
      scheduleCategory: "",
      subCategory: "",
      internalItemCode: "",
      firewall: "",
      lisStatus: "",
      ownershipStatus: "",
      status: "",
      CategoryType: [],
      SubCategoryType: [],
      SupplierName: "",
      Manufacture: "",
      DepartmentName: [],
      Machine: "",
      subcategorydata: "",
      categorydata: "",
      vendor: "",
      Type: "",
      email: "",
      mobile: "",
      designation: "",
      EquipmentID: "",
    });
    setRows([{ name: "", designation: "", mobile: "", email: "" }]);
    setsupportRows([{ name: "", designation: "", mobile: "", email: "" }]);
    setintdept([{ name: "", designation: "", mobile: "", email: "" }]);
    setmaintanence([{ Type: "", categorydata: "", subcategorydata: "" }]);
    setDropDownApis((prev) => ({ ...prev, machinelist: [] }));
  };

  // ─── Table API ────────────────────────────────────────────────────────────
  const tableApi = (companyId) => {
    axiosInstance
      .get("Equipment/getdata", { params: { companyId: companyId || 0 } })
      .then((resp) => {
        const list = resp?.data?.message;
        if (Array.isArray(list)) {
          setTableDataList(list);
          setFilterTableData(list);
        } else {
          setTableDataList([]);
          setFilterTableData([]);
        }
      })
      .catch(console.error);
  };

  useEffect(() => {
    tableApi(userData?.CompanyID);
  }, [userData?.CompanyID]);

  // ─── Select change ────────────────────────────────────────────────────────
  const handleSelectChange = (name, e) => {
    if (name === "centreId") {
      getMachineList(e.value);
      setPayload((prev) => ({ ...prev, Machine: "" }));
      setDropDownApis((prev) => ({ ...prev, machinelist: [] }));
    }
    // Store plain value (string/number) for all selects
    setPayload((prev) => ({ ...prev, [name]: e?.value }));
    if (errors[name] || errors?.equipmentType) {
      setErrors((prev) => ({ ...prev, [name]: false }));
    }
    if(errors[name] || errors?.Machine) {
      setErrors((prev) => ({ ...prev, [name]: false }));
    }
    
  };

  const dateSelect = (value, name) => {
    setPayload({ ...payload, [name]: value });
  };

  const handleSelectMultiChange = (name, select) => {
    setPayload((prev) => ({ ...prev, [name]: select }));
  };

  // ─── Dropdown APIs ────────────────────────────────────────────────────────
  const getSupplier = () => {
    axiosInstance
      .get("VendorQuotation/bindsupplier")
      .then((res) => {
        if (res?.data?.message?.length > 0) {
          const response = res?.data?.message;
          setDropDownApis((prev) => ({
            ...prev,
            SupplierName: Array.isArray(response) ? response : [],
          }));
        } else {
          toast?.error("Data not Found");
        }
      })
      .catch((err) => {
        console.error(err?.response?.data?.message || "Error Occurred");
      });
  };

  const getVendor = () => {
    axiosInstance
      .get("Equipment/venderData")
      .then((res) => {
        if (res?.data?.message?.length > 0) {
          const response = res?.data?.message;
          setDropDownApis((prev) => ({
            ...prev,
            vendor: Array.isArray(response) ? response : [],
          }));
        } else {
          toast?.error("Data not Found");
        }
      })
      .catch((err) => {
        console.error(err?.response?.data?.message || "Error Occurred");
      });
  };

  const saveExcel = (companyId) => {
    axiosInstance
      .get("Equipment/export-list", { params: { companyId: companyId || 0 } })
      .then((res) => {
        if (res?.data?.message?.length > 0) {
          ExportToExcel(res?.data?.message, "EquipmentMaster.xls");
        } else {
          toast?.error("Data not Found");
        }
      })
      .catch((err) => {
        console.error(err?.response?.data?.message || "Error Occurred");
      });
  };

  const fetchDepartment = () => {
    axiosInstance
      .get("TestCentreMappingController/BindDepartment")
      .then((res) => {
        const data = res?.data?.message;
        const val = data?.map((ele) => ({
          label: ele?.department || ele?.DepartmentName || ele?.Department || "",
          value: ele?.departmentid || ele?.DepartmentID || ele?.id || "",
        })).filter(item => item.label && item.value && String(item.label).toLowerCase() !== "null" && String(item.label).toLowerCase() !== "undefined");
        val.unshift({ label: "Department", value: "" });
        setFetchDepartment(val);
      })
      .catch((err) => {
        toast.error(
          err?.response?.data?.message
            ? err.response?.data?.message
            : "Something Went Wrong"
        );
      });
  };

  const equipmentAPi = () => {
    axiosInstance
      .get("Equipment/get-all-equipment-type")
      .then((res) => {
        const data = res?.data?.message || [];
        const val = data.map((ele) => ({ value: ele.ID, label: ele.NAME }));
        setEquipmentTypeList(val);
      })
      .catch(console.error);
  };

  const getMachineList = async (centreId) => {
    try {
      const res = await axiosInstance.get("CommonController/GetMachineGroup", { 
        params: { centreId: centreId.toString() } 
      });
      if (res?.data?.success) {
        const resList = res?.data?.message?.machines?.map((item) => ({
          ...item,
          label: item?.MachineName,
          value: item?.MachineID,
        })) || [];
        setDropDownApis((prev) => ({ ...prev, machinelist: resList }));
        return resList;  // Return the list for immediate use
      }
      return [];
    } catch (error) {
      console.error(error);
      return [];
    }
  };

  useEffect(() => {
    fetchDepartment();
    equipmentAPi();
    getVendor();
    getSupplier();
    getManufacture((data) => {
      setDropDownApis((prev) => ({ ...prev, Manufacture: data }));
    });
  }, []);

  const getCentreDetails = (state) => {
    axiosInstance
      .get("Centre/getGlobalCentres")
      .then((res) => {
        let data = res.data.message;
        let value = data.map((ele) => ({
          value: ele.CentreID,
          label: ele.Centre,
          DefaultCentreId: ele.DefaultCentreId,
        }));
        state(value);
      })
      .catch(console.error);
  };

  useEffect(() => {
    getCentreDetails(setcentredata);
  }, []);

  const fetchsupplier = () => {
    axiosInstance
      .get("Equipment/GetAllVendorManufacture", {
        params: { p_type: "Vendor", p_id: 0 },
      })
      .then((res) => {
        const data = res?.data?.message || [];
        const val = data.map((ele) => ({
          value: ele.SupplierID,
          label: ele.SupplierName,
        }));
        setsupplierdata(val);
      })
      .catch(console.error);
  };

  const fetchmancom = () => {
    axiosInstance
      .get("Equipment/GetAllVendorManufacture", {
        params: { p_type: "Manufacture", p_id: 0 },
      })
      .then((res) => {
        const data = res?.data?.message || [];
        const val = data.map((ele) => ({
          value: ele.ManufactureID,
          label: ele.ManufactureName,
        }));
        setmancomdata(val);
      })
      .catch(console.error);
  };

  const fetchcategory = () => {
    axiosInstance
      .get("Equipment/GetAllMaster", {
        params: { p_type: "MaintenanceCategory", p_id: 0 },
      })
      .then((res) => {
        const data = res?.data?.message || [];
        const val = data.map((ele) => ({
          value: ele.CategoryID,
          label: ele.CategoryName,
        }));
        setcategorydata(val);
      })
      .catch(console.error);
  };

  const fetchsubcategory = () => {
    axiosInstance
      .get("Equipment/GetAllMaster", {
        params: { p_type: "MaintenanceSubcategory", p_id: 0 },
      })
      .then((res) => {
        const data = res?.data?.message || [];
        const val = data.map((ele) => ({
          value: ele.SubcategoryID,
          label: ele.SubcategoryName,
        }));
        setsubcategorydata(val);
      })
      .catch(console.error);
  };

  useEffect(() => {
    fetchsupplier();
    fetchmancom();
    fetchcategory();
    fetchsubcategory();
  }, []);

  const handleFileResponse = (file) => {
    if (file) {
      console.log("Uploaded File:", file);
    } else {
      console.log("File cleared");
    }
  };

  // ─── Row add/remove handlers ──────────────────────────────────────────────
  const addRow = () =>
    setRows((prev) => [...prev, { name: "", designation: "", mobile: "", email: "" }]);
  const removeRow = (index) => {
    if (rows.length === 1) return;
    setRows(rows.filter((_, i) => i !== index));
  };

  const addSupportRow = () =>
    setsupportRows((prev) => [...prev, { name: "", designation: "", mobile: "", email: "" }]);
  const removeSupportRow = (index) => {
    if (supportrows.length === 1) return;
    setsupportRows(supportrows.filter((_, i) => i !== index));
  };

  const addindeptRow = () =>
    setintdept((prev) => [...prev, { name: "", designation: "", mobile: "", email: "" }]);
  const removeindeptRow = (index) => {
    if (intdept.length === 1) return;
    setintdept(intdept.filter((_, i) => i !== index));
  };

  const addmaintenanceRow = () => setmaintanence([...maintanence, { Type: "", categorydata: "", subcategorydata: "" }]);
  const removemaintenanceRow = (index) => {
    if (maintanence.length === 1) return;
    setmaintanence(maintanence.filter((_, i) => i !== index));
  };

  // ─── Edit modal open ──────────────────────────────────────────────────────
  const [isEditMode, setIsEditMode] = useState(false);

  const handleEditModalOpen = async (editFlag, trow) => {
    let machineListForMatching = dropDownApis?.machinelist || [];
    let equipmentTypeListForMatching = equipmentTypeList || [];
    
    // Ensure equipment type list is loaded
    if (!equipmentTypeListForMatching || equipmentTypeListForMatching.length === 0) {
      await new Promise((resolve) => {
        axiosInstance
          .get("Equipment/get-all-equipment-type")
          .then((res) => {
            const data = res?.data?.message || [];
            const val = data.map((ele) => ({ value: ele.ID, label: ele.NAME }));
            equipmentTypeListForMatching = val;
            setEquipmentTypeList(val);
            resolve();
          })
          .catch((err) => {
            console.error(err);
            resolve();
          });
      });
    }
    
    // Load machine list and capture returned data for immediate use
    if (trow?.CentreID || trow?.centreId) {
      const loadedMachineList = await getMachineList(trow?.CentreID || trow?.centreId);
      if (loadedMachineList?.length > 0) {
        machineListForMatching = loadedMachineList;
      }
    }

    const builtSalesRows = [
      {
        name: trow?.SalesPersonName1 || trow?.SalesPName1 || "",
        designation: trow?.SalesPersonDesignation1 || trow?.SalesPDesignation1 || "",
        mobile: trow?.SalesPersonMobile1 || trow?.SalesPMobile1 || "",
        email: trow?.SalesPersonEmail1 || trow?.SalesPEmail1 || "",
      },
      {
        name: trow?.SalesPersonName2 || trow?.SalesPName2 || "",
        designation: trow?.SalesPersonDesignation2 || trow?.SalesPDesignation2 || "",
        mobile: trow?.SalesPersonMobile2 || trow?.SalesPMobile2 || "",
        email: trow?.SalesPersonEmail2 || trow?.SalesPEmail2 || "",
      },
      {
        name: trow?.SalesPersonName3 || trow?.SalesPName3 || "",
        designation: trow?.SalesPersonDesignation3 || trow?.SalesPDesignation3 || "",
        mobile: trow?.SalesPersonMobile3 || trow?.SalesPMobile3 || "",
        email: trow?.SalesPersonEmail3 || trow?.SalesPEmail3 || "",
      },
    ].filter((r) => r.name || r.mobile || r.email);

    const builtSupportRows = [
      {
        name: trow?.SupportPersonName1 || trow?.SupportPName1 || "",
        designation: trow?.SupportPersonDesignation1 || trow?.SupportPDesignation1 || "",
        mobile: trow?.SupportPersonMobile1 || trow?.SupportPMobile1 || "",
        email: trow?.SupportPersonEmail1 || trow?.SupportPEmail1 || "",
      },
      {
        name: trow?.SupportPersonName2 || trow?.SupportPName2 || "",
        designation: trow?.SupportPersonDesignation2 || trow?.SupportPDesignation2 || "",
        mobile: trow?.SupportPersonMobile2 || trow?.SupportPMobile2 || "",
        email: trow?.SupportPersonEmail2 || trow?.SupportPEmail2 || "",
      },
      {
        name: trow?.SupportPersonName3 || trow?.SupportPName3 || "",
        designation: trow?.SupportPersonDesignation3 || trow?.SupportPDesignation3 || "",
        mobile: trow?.SupportPersonMobile3 || trow?.SupportPMobile3 || "",
        email: trow?.SupportPersonEmail3 || trow?.SupportPEmail3 || "",
      },
    ].filter((r) => r.name || r.mobile || r.email);

    setRows(
      builtSalesRows.length > 0
        ? builtSalesRows
        : [{ name: "", designation: "", mobile: "", email: "" }]
    );
    setsupportRows(
      builtSupportRows.length > 0
        ? builtSupportRows
        : [{ name: "", designation: "", mobile: "", email: "" }]
    );

    const builtOtherRows = [
      {
        name: trow?.OtherPersonName1 || trow?.OtherPName1 || "",
        designation: trow?.OtherPersonDesignation1 || trow?.OtherPDesignation1 || "",
        mobile: trow?.OtherPersonMobile1 || trow?.OtherPMobile1 || "",
        email: trow?.OtherPersonEmail1 || trow?.OtherPEmail1 || "",
      },
      {
        name: trow?.OtherPersonName2 || trow?.OtherPName2 || "",
        designation: trow?.OtherPersonDesignation2 || trow?.OtherPDesignation2 || "",
        mobile: trow?.OtherPersonMobile2 || trow?.OtherPMobile2 || "",
        email: trow?.OtherPersonEmail2 || trow?.OtherPEmail2 || "",
      },
      {
        name: trow?.OtherPersonName3 || trow?.OtherPName3 || "",
        designation: trow?.OtherPersonDesignation3 || trow?.OtherPDesignation3 || "",
        mobile: trow?.OtherPersonMobile3 || trow?.OtherPMobile3 || "",
        email: trow?.OtherPersonEmail3 || trow?.OtherPEmail3 || "",
      },
    ].filter((r) => r.name || r.mobile || r.email);

    setintdept(builtOtherRows.length > 0 ? builtOtherRows : [{ name: "", designation: "", mobile: "", email: "" }]);

    const isActive = trow?.IsActive === 1 || trow?.IsActive === "1";

    // ─── Map API response fields to form payload
    // API Returns: Type, Category, SubCategory (use these exact field names)
    // Equipment Type: API returns label/name, dropdown has {value: ID, label: NAME}
    // Machine: API returns MACHINEID, dropdown has {value: MachineID, label: MachineName}
    
    // Equipment Type - Try multiple matching strategies with loaded list
    let equipmentTypeValue = "";
    if (trow?.EquipmentType) {
      // First try: match by label (most common case - API returns name)
      equipmentTypeValue = getValueByLabel(equipmentTypeListForMatching, trow?.EquipmentType);
      // Second try: match by value or label (fallback)
      if (!equipmentTypeValue) {
        equipmentTypeValue = getOptionValue(equipmentTypeListForMatching, trow?.EquipmentType);
      }
      // Last resort: if list is empty or no match found, keep the raw value
      // ReactSelect will show it even if not in dropdown options
      if (!equipmentTypeValue) {
        equipmentTypeValue = String(trow?.EquipmentType || "");
      }
    }
    
    const machineValue = getOptionValue(machineListForMatching, trow?.MACHINEID) || 
                         getOptionValue(machineListForMatching, trow?.MACHINENAME) || 
                         String(trow?.MACHINEID || trow?.MACHINENAME || "");

    setPayload({
      equipmentName: trow?.DisplayName || "",
      modelNo: trow?.ModelNo || "",
      serialNo: trow?.SerialNumber || "",
      remarks: trow?.Remarks || "",
      pmRenewalRequired: trow?.PMDueDate || "",
      calibrationRenewalRequired: trow?.CalibrationDueDate || trow?.CalDueDate || "",
      internalItemCode: trow?.InternalItemID || "",
      parameterMapping: trow?.ParameterMapping || "",
      startDate: parseDate(trow?.ServiceStartDate),
      renewalDate: parseDate(trow?.ServiceRenewalDate),
      installationDate: parseDate(trow?.InstallationDate),
      pmDoneDate: parseDate(trow?.PMDoneDate),
      calibrationDoneDate: parseDate(trow?.CalibrationDoneDate),
      centreId: trow?.CentreID ? String(trow?.CentreID) : "",
      Machine: machineValue,
      equipmentType: equipmentTypeValue,
      serviceType: trow?.ServiceType || "",
      firewall: trow?.firewall || "",
      lisStatus: trow?.LisStatus || "",
      lisDirectionalStatus: trow?.LisDirectionalStatus || "",
      ownershipStatus: trow?.OwnershipStatus || "",
      status: isActive ? "Active" : "In-Active",
      SupplierName: trow?.VendorID ? String(trow?.VendorID) : (trow?.Supplier ? String(trow?.Supplier) : ""),
      vendor: trow?.VendorID ? String(trow?.VendorID) : "",
      Manufacture: trow?.ManufactureID ? String(trow?.ManufactureID) : "",
      DepartmentName: (trow?.Department || trow?.department)
        ? (trow?.Department || trow?.department).toString().split(",")
            .map((d) => d.trim())
            .filter((d) => d && String(d).toLowerCase() !== "null" && String(d).toLowerCase() !== "undefined")
            .map((d) => parseInt(d, 10))
            .filter((d) => !isNaN(d))
        : [],
      categorydata: String(trow?.Category || ""),
      subcategorydata: String(trow?.SubCategory || ""),
      Type: String(trow?.Type || ""),
      EquipmentID: trow?.id || trow?.EquipmentID || "",
      // reset unused fields
      supplier: "",
      manufactureCompany: "",
      attachment: "",
      scheduleType: "",
      scheduleCategory: "",
      subCategory: "",
      CategoryType: [],
      SubCategoryType: [],
      email: "",
      mobile: "",
      designation: "",
    });

    setmaintanence([
      {
        Type: String(trow?.Type || ""),
        categorydata: String(trow?.Category || ""),
        subcategorydata: String(trow?.SubCategory || ""),
      }
    ]);

    setIsEditMode(editFlag);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // ─── Static option lists ──────────────────────────────────────────────────
  const colorCodingData = [
    { color: "#fcfdff", id: "1", labelKey: "Active" },
    { color: "#ffc4cc", id: "2", labelKey: "Inactive" },
    { color: "#ADD8E6", id: "3", labelKey: "To be Installed" },
    { color: "#fffc04", id: "4", labelKey: "Standby" },
    // { color: "#FFFFFF", id: "5", labelKey: "Delete" },
  ];

  const tableHeaders = [
    { header: "Sr No", field: "srNo" },
    { header: "Equipment Name", field: "DisplayName" },
    { header: "Centre", field: "Centre" },
    { header: "LabMachine", field: "labmachinename" },
    { header: "EquipmentType", field: "EquipmentType" },
    { header: "Status", field: "IsActive" },
    { header: "PM Done", field: "PMDoneDate" },
    { header: "SerialNumber", field: "SerialNumber" },
    { header: "ServiceType", field: "ServiceType" },
    { header: "ServiceStartDate", field: "ServiceStartDate" },
    { header: "ServiceRenewalDate", field: "ServiceRenewalDate" },
    { header: "InstallationDate", field: "InstallationDate" },
    { header: "Remark", field: "Remarks" },
    { header: "Calib Done", field: "CalibrationDoneDate" },
    { header: "Actions", field: "actions" },
  ];

  const lisstatus = [
    { value: "NA", label: "NA" },
    { value: "UNI", label: "UNI" },
    { value: "BI", label: "BI" },
  ];
  const servicetype = [
    { value: "AMC", label: "AMC" },
    { value: "CMC", label: "CMC" },
    { value: "Warranty", label: "Warranty" },
    { value: "On-call", label: "On-call" },
    { value: "RR", label: "RR" },
  ];
  const Firewall = [
    { value: "NA", label: "NA" },
    { value: "Enabled", label: "Enabled" },
    { value: "Disabled", label: "Disabled" },
  ];
  const ownershipstatus = [
    { value: "Asset", label: "Asset" },
    { value: "RR", label: "RR" },
    { value: "Own", label: "Own" },
  ];
  const status = [
    { value: "Active", label: "Active" },
    { value: "In-Active", label: "In-Active" },
  ];
  const maintenanceschedulelist = [
    { value: "0", label: "Daily" },
    { value: "1", label: "Monthly" },
    { value: "2", label: "Quarterly" },
    { value: "3", label: "Half-yearly" },
    { value: "4", label: "Yearly" },
  ];

  const [showmodal, setshowmodal] = useState(false);
  const [showcategorymodal, setshowcategorymodal] = useState(false);
  const [showsubcategorymodal, setshowsubcategorymodal] = useState(false);
  const [filterInputValue, setFilterInputValue] = useState("");
  const [filterTableData, setFilterTableData] = useState([]);

  const handleFilterInputChange = (e) => {
    const value = e.target.value.toLowerCase();
    setFilterInputValue(value);
    const filtered = tableDataList.filter((row) =>
      Object.keys(row).some((key) =>
        String(row[key]).toLowerCase().includes(value)
      )
    );
    setFilterTableData(filtered);
  };

  const filterOnClick = (type) => {
    if (!type || type.toLowerCase() === "all") {
      setFilterTableData(tableDataList);
      return;
    }
    setFilterTableData(
      tableDataList?.filter((data) => {
        let statusStr = "Inactive";
        if (data?.IsActive === 1 || data?.IsActive === "1") statusStr = "Active";
        else if (data?.IsActive === 0 || data?.IsActive === "0") statusStr = "Inactive";
        else if (data?.IsActive) statusStr = data.IsActive;

        return String(statusStr).toLowerCase() === String(type).toLowerCase();
      })
    );
  };

  return (
    <>
      {showMore && (
        <SeeMore
          seeMore={seeMoreData}
          handleChangeComponent={(item) => {
            setShowMore(false);
            navigate(item?.url);
          }}
          setShowMore={setShowMore}
        />
      )}
      {showcategorymodal && (
        <Modal
          Header={"Category"}
          visible={showcategorymodal}
          setVisible={setshowcategorymodal}
          children={<CategoryModal />}
          modalWidth={"80%"}
        />
      )}
      {showsubcategorymodal && (
        <Modal
          Header={"Sub Category"}
          visible={showsubcategorymodal}
          setVisible={setshowsubcategorymodal}
          children={<SubCategoryModal />}
          modalWidth={"80%"}
        />
      )}
      {showmodal && (
        <Modal
          Header={"Equipment Type"}
          visible={showmodal}
          setVisible={(val) => {
            setshowmodal(val);
            if (!val) {
              equipmentAPi();
            }
          }}
          children={<EquipmentMasterModal onSave={() => equipmentAPi()} />}
          modalWidth={"80%"}
        />
      )}

      <div className="card">
        <Heading
          name={"Equipment Master"}
          isBreadcrumb={true}
          secondTitle={
            <>
              <label onClick={() => setShowMore((prev) => !prev)}>
                <ViewMenu />
              </label>
            </>
          }
        />

        {/* ── Add New Equipment ──────────────────────────────────────────── */}
        <Accordion defaultValue={true} title={t("Add New Equipment")} />
        <div className="row p-2 d-flex align-items-center">
          <ReactSelect
            name="centreId"
            id="centre"
            removeIsClearable={true}
            className={`required-fields ${errors?.centreId ? "required-fields-active" : ""}`}
            isShowBorder={true}
            dynamicOptions={centredata}
            placeholderName="centre"
            value={payload?.centreId}
            onChange={handleSelectChange}
            respclass={"col-xl-2 col-sm-4 col-md-6 col-12"}
          />

          <div className="col-xl-2 col-sm-4 col-md-6 col-12 d-flex align-items-center gap-1">
            <div className="w-100">
              <ReactSelect
                name="equipmentType"
                id="equipmentType"
                className={`required-fields ${errors?.equipmentType ? "required-fields-active" : ""}`}
                dynamicOptions={equipmentTypeList}
                isShowBorder={true}
                removeIsClearable={true}
                placeholderName="Equipment Type"
                value={payload?.equipmentType}
                onChange={handleSelectChange}
              />
            </div>
            <button className="btnAdd" onClick={() => setshowmodal(true)}>
              <FaPlus />
            </button>
          </div>

          <div className="col-xl-2 col-sm-4 col-md-6 col-12 d-flex align-items-center gap-1">
            <div className="w-100">
              <ReactSelect
                name="Machine"
                id="Machine"
                className={`required-fields ${errors?.Machine ? "required-fields-active" : ""}`}
                dynamicOptions={dropDownApis?.machinelist}
                isShowBorder={true}
                removeIsClearable={true}
                placeholderName="Machine"
                value={payload?.Machine}
                onChange={handleSelectChange}
              />
            </div>
          </div>

          <Input
            type="text"
            placeholder=" "
            lable={t("Equipment Name")}
           className={`required-fields ${errors?.equipmentName ? "required-fields-active" : ""}`}
            id="equipmentName"
            name="equipmentName"
            value={payload?.equipmentName}
            onChange={handleChange}
            respclass={"col-xl-2 col-sm-4 col-md-6 col-12"}
          />

          <div className="col-sm-2">
            <MultiSelectComp
              label={t("Department")}
              value={payload?.DepartmentName}
              id="DepartmentName"
              name="DepartmentName"
              options={FetchDepartment}
              onChange={handleSelectMultiChange}
            />
          </div>

          <Input
            type="text"
            placeholder=" "
            lable={t("Model No")}
            id="modelNo"
            name="modelNo"
            value={payload?.modelNo}
            onChange={handleChange}
            respclass={"col-xl-2 col-sm-4 col-md-6 col-12"}
          />
          <Input
            type="text"
            placeholder=" "
            lable={t("Serial No")}
            id="serialNo"
            name="serialNo"
            className={`required-fields ${errors?.serialNo ? "required-fields-active" : ""}`}
            value={payload?.serialNo}
            onChange={handleChange}
            respclass={"col-xl-2 col-sm-4 col-md-6 col-12"}
          />

          <ReactSelect
            name="SupplierName"
            id="SupplierName"
            removeIsClearable={true}
            placeholderName="Supplier"
            value={payload?.SupplierName}
            dynamicOptions={dropDownApis?.SupplierName.map((ele) => ({
              label: ele?.name,
              value: ele?.id,
            }))}
            onChange={handleSelectChange}
            respclass={"col-xl-2 col-sm-4 col-md-6 col-12"}
          />

          <ReactSelect
            name="vendor"
            id="vendor"
            removeIsClearable={true}
            placeholderName="Vendor"
            value={payload?.vendor}
            dynamicOptions={dropDownApis?.vendor.map((ele) => ({
              label: ele?.VendorName,
              value: ele?.VendorId,
            }))}
            onChange={handleSelectChange}
            respclass={"col-xl-2 col-sm-4 col-md-6 col-12"}
          />

          <div className="col-xl-2 col-sm-4 col-md-6 col-12">
            <ReactSelect
              name="Manufacture"
              id="Manufacture"
              removeIsClearable={true}
              placeholderName="Manufacture Company"
              value={payload?.Manufacture}
              dynamicOptions={[
                { label: "Select", value: "" },
                ...dropDownApis?.Manufacture?.map((item) => ({
                  label: item?.name,
                  value: item?.id,
                })),
              ]}
              onChange={handleSelectChange}
            />
          </div>

          {/* <div className="col-xl-2 col-sm-4 col-md-6 col-12 d-flex align-items-center gap-1">
            <FileUpload
              placeholder="Upload Attachment"
              allowedTypes={["image/png", "application/pdf"]}
              respclass={"col-xl-2 col-sm-4 col-md-6 col-12"}
              onFileSelect={handleFileResponse}
            />
          </div> */}
        </div>

        {/* ── Service Information ───────────────────────────────────────── */}
        <Accordion defaultValue={true} title={t("Service Information")} />
        <div className="row p-2 d-flex align-items-center">
          <ReactSelect
            name="serviceType"
            id="serviceType"
            removeIsClearable={true}
            dynamicOptions={servicetype}
            placeholderName="Service Type"
            isShowBorder={true}
            value={payload?.serviceType}
            onChange={handleSelectChange}
            respclass={"col-xl-2 col-sm-4 col-md-6 col-12"}
          />
          <DatePicker
            className="custom-calendar"
            name="startDate"
            placeholder=" "
            id="startDate"
            lable="StartDate"
            respclass={"col-xl-2 col-sm-4 col-md-6 col-12"}
            value={payload?.startDate}
            onChange={dateSelect}
          />
          <DatePicker
            className="custom-calendar"
            name="renewalDate"
            placeholder=" "
            id="renewalDate"
            lable="RenewalDate"
            respclass={"col-xl-2 col-sm-4 col-md-6 col-12"}
            value={payload?.renewalDate}
            onChange={dateSelect}
          />
          <DatePicker
            className="custom-calendar"
            name="installationDate"
            placeholder=" "
            id="installationDate"
            lable="InstallationDate"
            respclass={"col-xl-2 col-sm-4 col-md-6 col-12"}
            value={payload?.installationDate}
            onChange={dateSelect}
          />
          <Input
            type="text"
            placeholder=" "
            lable={t("Remarks")}
            id="remarks"
            name="remarks"
            value={payload?.remarks}
            onChange={handleChange}
            respclass={"col-xl-2 col-sm-4 col-md-6 col-12"}
          />
        </div>

        {/* ── Maintenance & Calibration ─────────────────────────────────── */}
        <Accordion defaultValue={true} title={t("Maintenance & Calibration")} />
        <div className="row p-2 d-flex align-items-center">
          <DatePicker
            className="custom-calendar"
            name="pmDoneDate"
            placeholder=" "
            id="pmDoneDate"
            lable="PMDoneDate"
            respclass={"col-xl-2 col-sm-4 col-md-6 col-12"}
            value={payload?.pmDoneDate}
            onChange={dateSelect}
          />
          <Input
            type="text"
            placeholder=" "
            lable={t("PM Renewal Required")}
            id="pmRenewalRequired"
            name="pmRenewalRequired"
            value={payload?.pmRenewalRequired}
            onChange={handleChange}
            respclass={"col-xl-2 col-sm-4 col-md-6 col-12"}
          />
          <DatePicker
            className="custom-calendar"
            name="calibrationDoneDate"
            placeholder=" "
            id="calibrationDoneDate"
            lable="CalibrationDoneDate"
            respclass={"col-xl-2 col-sm-4 col-md-6 col-12"}
            value={payload?.calibrationDoneDate}
            onChange={dateSelect}
          />
          <Input
            type="text"
            placeholder=" "
            lable={t("Calibration Renewal Required")}
            id="calibrationRenewalRequired"
            name="calibrationRenewalRequired"
            value={payload?.calibrationRenewalRequired}
            onChange={handleChange}
            respclass={"col-xl-2 col-sm-4 col-md-6 col-12"}
          />
        </div>

        {/* ── Maintenance Schedules ──────────────────────────────────────── */}
        <Accordion defaultValue={true} title={t("Maintenance Schedules")} />
        {maintanence.map((_, idx) => (
          <div key={idx} className="row p-2 d-flex align-items-center">
            <ReactSelect
              name="Type"
              id={`Type_${idx}`}
              removeIsClearable={true}
              isShowBorder={true}
              dynamicOptions={maintenanceschedulelist}
              placeholderName="Type"
              value={maintanence[idx]?.Type}
              onChange={(name, e) => handleMaintenanceRowChange(idx, "Type", e)}
              respclass={"col-xl-2 col-sm-4 col-md-6 col-12"}
            />
            <div className="col-xl-2 col-sm-4 col-md-6 col-12 d-flex align-items-center gap-1">
              <div className="w-100">
                <ReactSelect
                  name="categorydata"
                  id={`categorydata_${idx}`}
                  removeIsClearable={true}
                  isShowBorder={true}
                  dynamicOptions={categorydata}
                  placeholderName="Category"
                  value={maintanence[idx]?.categorydata}
                  onChange={(name, e) => handleMaintenanceRowChange(idx, "categorydata", e)}
                />
              </div>
            </div>
            <div className="col-xl-2 col-sm-4 col-md-6 col-12 d-flex align-items-center gap-1">
              <div className="w-100">
                <ReactSelect
                  name="subcategorydata"
                  id={`subcategorydata_${idx}`}
                  removeIsClearable={true}
                  isShowBorder={true}
                  dynamicOptions={subcategorydata}
                  placeholderName="Sub Category"
                  value={maintanence[idx]?.subcategorydata}
                  onChange={(name, e) => handleMaintenanceRowChange(idx, "subcategorydata", e)}
                />
              </div>
            </div>
            <div className="plus mr-2" onClick={addmaintenanceRow}>
              <FaPlus className="plusicon" />
            </div>
            <div
              className="delete"
              onClick={() => removemaintenanceRow(idx)}
              disabled={maintanence.length === 1}
              title={maintanence.length === 1 ? "Cannot remove last row" : "Remove row"}
            >
              <MdDelete className="deleteicon" />
            </div>
          </div>
        ))}

        {/* ── Additional System Info ─────────────────────────────────────── */}
        <Accordion defaultValue={true} title={t("Additional System Info")} />
        <div className="row p-2 d-flex">
          <Input
            type="text"
            placeholder=" "
            lable={t("Internal Item Code")}
            id="internalItemCode"
            name="internalItemCode"
            value={payload?.internalItemCode}
            onChange={handleChange}
            respclass={"col-xl-2 col-sm-4 col-md-6 col-12"}
          />
          <ReactSelect
            name="firewall"
            id="firewall"
            removeIsClearable={true}
            dynamicOptions={Firewall}
            isShowBorder={true}
            placeholderName="Firewall"
            value={payload?.firewall}
            onChange={handleSelectChange}
            respclass={"col-xl-2 col-sm-4 col-md-6 col-12"}
          />
          <ReactSelect
            name="lisStatus"
            id="lisStatus"
            removeIsClearable={true}
            dynamicOptions={lisstatus}
            isShowBorder={true}
            placeholderName="LIS Status"
            value={payload?.lisStatus}
            onChange={handleSelectChange}
            respclass={"col-xl-2 col-sm-4 col-md-6 col-12"}
          />
          <ReactSelect
            name="ownershipStatus"
            id="ownershipStatus"
            removeIsClearable={true}
            dynamicOptions={ownershipstatus}
            isShowBorder={true}
            placeholderName="Ownership Status"
            value={payload?.ownershipStatus}
            onChange={handleSelectChange}
            respclass={"col-xl-2 col-sm-4 col-md-6 col-12"}
          />
          <ReactSelect
            name="status"
            id="status"
            removeIsClearable={true}
            dynamicOptions={status}
            isShowBorder={true}
            placeholderName="Status"
            value={payload?.status}
            onChange={handleSelectChange}
            respclass={"col-xl-2 col-sm-4 col-md-6 col-12"}
          />
        </div>

        {/* ── Sales & Support Contacts ───────────────────────────────────── */}
        <div className="row p-2 d-flex align-items-center">
          {/* Sales */}
          <div className="col-lg-6 col-12">
            <Accordion defaultValue={true} title={t("Sales Department Contact")} />
            {rows.map((row, idx) => (
              <div key={idx} className="row p-2 d-flex align-items-center">
                <Input
                  type="text"
                  placeholder=" "
                  lable={t("Name")}
                  id={`salesName_${idx}`}
                  name="name"
                  value={row.name}
                  onChange={(e) => handleRowChange(idx, "name", e.target.value)}
                  respclass={"col-md-6 col-12"}
                />
                <Input
                  type="text"
                  placeholder=" "
                  lable={t("Designation")}
                  id={`salesDesignation_${idx}`}
                  name="designation"
                  value={row.designation}
                  onChange={(e) => handleRowChange(idx, "designation", e.target.value)}
                  respclass={"col-md-6 col-12"}
                />
                <Input
                  type="text"
                  placeholder=" "
                  lable={t("Mobile")}
                  id={`salesMobile_${idx}`}
                  name="mobile"
                  maxLength={10}
                  value={row.mobile}
                  onChange={(e) => handleRowChange(idx, "mobile", e.target.value)}
                  respclass={"col-md-6 col-12"}
                />
                <Input
                  type="text"
                  placeholder=" "
                  lable={t("Email")}
                  className={`required-fields ${errors?.email ? "required-fields-active" : ""}`}
                  id={`salesEmail_${idx}`}
                  name="email"
                  value={row.email}
                  onChange={(e) => handleRowChange(idx, "email", e.target.value)}
                  respclass={"col-md-6 col-12"}
                />
                <div className="plus mr-2" onClick={addRow}>
                  <FaPlus className="plusicon" />
                </div>
                <div
                  className="delete"
                  onClick={() => removeRow(idx)}
                  disabled={rows.length === 1}
                  title={rows.length === 1 ? "Cannot remove last row" : "Remove row"}
                >
                  <MdDelete className="deleteicon" />
                </div>
              </div>
            ))}
          </div>

          {/* Support */}
          <div className="col-lg-6 col-12">
            <Accordion defaultValue={true} title={t("Support Department Contact")} />
            {supportrows.map((supportRow, idx) => (
              <div key={idx} className="row p-2 d-flex align-items-center">
                <Input
                  type="text"
                  placeholder=" "
                  lable={t("Name")}
                  id={`supportName_${idx}`}
                  name="name"
                  value={supportRow.name}
                  onChange={(e) => handleSupportRowChange(idx, "name", e.target.value)}
                  respclass={"col-md-6 col-12"}
                />
                <Input
                  type="text"
                  placeholder=" "
                  lable={t("Designation")}
                  id={`supportDesignation_${idx}`}
                  name="designation"
                  value={supportRow.designation}
                  onChange={(e) => handleSupportRowChange(idx, "designation", e.target.value)}
                  respclass={"col-md-6 col-12"}
                />
                <Input
                  type="text"
                  placeholder=" "
                  lable={t("Mobile")}
                  id={`supportMobile_${idx}`}
                  name="mobile"
                  maxLength={10}
                  value={supportRow.mobile}
                  onChange={(e) => handleSupportRowChange(idx, "mobile", e.target.value)}
                  respclass={"col-md-6 col-12"}
                />
                <Input
                  type="text"
                  placeholder=" "
                  lable={t("Email")}
                  className={`required-fields ${errors?.email ? "required-fields-active" : ""}`}
                  id={`supportEmail_${idx}`}
                  name="email"
                  value={supportRow.email}
                  onChange={(e) => handleSupportRowChange(idx, "email", e.target.value)}
                  respclass={"col-md-6 col-12"}
                />
                <div className="plus mr-2" onClick={addSupportRow}>
                  <FaPlus className="plusicon" />
                </div>
                <div
                  className="delete"
                  onClick={() => removeSupportRow(idx)}
                  disabled={supportrows.length === 1}
                  title={supportrows.length === 1 ? "Cannot remove last row" : "Remove row"}
                >
                  <MdDelete className="deleteicon" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Internal Department Details ────────────────────────────────── */}
        <Accordion defaultValue={true} title={t("Internal Department Details")} />
        {intdept.map((dept, idx) => (
          <div key={idx} className="row p-2 d-flex align-items-center">
            {/* <ReactSelect
              removeIsClearable={true}
              placeholderName="Name"
              isShowBorder={true}
              respclass={"col-xl-2 col-sm-4 col-md-6 col-12"}
            /> */}
            <div className="col-sm-4">
                          <Input
                            type="text"
                            name="SearchEmployee"
                            lable="Name"
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
            <Input
              type="text"
              placeholder=" "
              lable={t("Designation")}
              id={`intDesignation_${idx}`}
              name="designation"
              value={dept.designation}
              onChange={(e) => handleIntDeptRowChange(idx, "designation", e.target.value)}
              respclass={"col-xl-2 col-sm-4 col-md-6 col-12"}
            />
            <Input
              type="text"
              placeholder=" "
              lable={t("Mobile")}
              id={`intMobile_${idx}`}
              name="mobile"
              value={dept.mobile}
              maxLength={10}
              onChange={(e) => handleIntDeptRowChange(idx, "mobile", e.target.value)}
              respclass={"col-xl-2 col-sm-4 col-md-6 col-12"}
            />
            <Input
              type="text"
              placeholder=" "
              lable={t("Email")}
              className={`required-fields ${errors?.email ? "required-fields-active" : ""}`}
              id={`intEmail_${idx}`}
              name="email"
              value={dept.email}
              onChange={(e) => handleIntDeptRowChange(idx, "email", e.target.value)}
              respclass={"col-xl-2 col-sm-4 col-md-6 col-12"}
            />
            <div className="d-flex">
              <div className="plus mr-2" onClick={addindeptRow}>
                <FaPlus className="plusicon" />
              </div>
              <div
                className="delete"
                onClick={() => removeindeptRow(idx)}
                disabled={intdept.length === 1}
                title={intdept.length === 1 ? "Cannot remove last row" : "Remove row"}
              >
                <MdDelete className="deleteicon" />
              </div>
            </div>
          </div>
        ))}

        {/* ── Save / Update / Excel buttons ─────────────────────────────── */}
        <div className="row">
          <div className="py-2 pl-4">
            <button
              className="btn btn-sm btn-block btn-success w-100 px-5"
              onClick={isEditMode ? equipmentUpdate : equipmentSave}
            >
              {isEditMode ? "Update" : "Save"}
            </button>
          </div>
          {isEditMode && (
            <div className="py-2 pl-4">
              <button
                className="btn btn-sm btn-block btn-secondary w-100 px-5"
                onClick={() => {
                  setIsEditMode(false);
                  resetForm();
                }}
              >
                Cancel
              </button>
            </div>
          )}
          <div className="py-2 pl-4">
            <CustomButton
              text={"Excel"}
              icon={"excel"}
              onClick={() => saveExcel(userData?.CompanyID)}
            />
          </div>
        </div>

        {/* ── Equipment List Table ───────────────────────────────────────── */}
        <Heading
          title={t("Equipment List")}
          secondTitle={
            <>
              {colorCodingData?.map(({ color, labelKey, id }) => (
                <ColorCodingSearch
                  key={id}
                  color={color}
                  label={t(labelKey)}
                  onClick={() => filterOnClick(labelKey)}
                  cursor="pointer"
                  respclass={"col-xl-2 col-sm-4 col-md-6 col-12"}
                />
              ))}
              <FilterInput
                value={filterInputValue}
                onChange={handleFilterInputChange}
                placeholder="Filter Table"
              />
            </>
          }
        />

        <div className="mt-1 table_ticket">
          <CustomTable
            columns={tableHeaders}
            data={filterTableData?.map((tData, index) => {
              let statusStr = "Inactive";
              if (tData?.IsActive === 1 || tData?.IsActive === "1") statusStr = "Active";
              else if (tData?.IsActive === 0 || tData?.IsActive === "0") statusStr = "Inactive";
              else if (tData?.IsActive) statusStr = tData.IsActive;

              const matchedColor = colorCodingData?.find(
                (c) => String(c.labelKey).toLowerCase() === String(statusStr).toLowerCase()
              )?.color;

              return {
                srNo: index + 1,
                ...tData,
                IsActive: statusStr,
                rowColor: matchedColor || tData.bgcolor,
                actions: (
                  <div
                    style={{ gap: "8px" }}
                    className="d-flex class_table gap-2 align-items-center"
                  >
                    <span style={{ fontSize: "24px", color: "#4549af" }}>
                      <i
                        className="fa fa-edit"
                        style={{ cursor: "pointer" }}
                        onClick={() => handleEditModalOpen(true, tData)}
                      ></i>
                    </span>
                  </div>
                ),
              };
            })}
          />
        </div>
      </div>
    </>
  );
};

export default EquipmentMaster;