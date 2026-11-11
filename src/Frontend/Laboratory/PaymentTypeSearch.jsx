import React, { useEffect, useState, useMemo } from "react";
import { Dialog } from "primereact/dialog";
import { useLocalStorage } from "../../utils/hooks/useLocalStorage";
import { useTranslation } from "react-i18next";
import {
  getPaymentModes,
  getSearchController,
} from "../../utils/NetworkApi/commonApi";
import { axiosInstance, axiosReport } from "../../utils/axiosInstance";
import {
  autocompleteOnBlur,
  downloadExcelBlob,
  getTrimmedData,
  shouldIncludeAIIMSID,
} from "../../utils/helpers";
import Input from "../../components/formComponent/Input";
import Loading from "../../components/loader/Loading";
import Accordion from "@app/components/UI/Accordion";
import DatePicker from "../../components/formComponent/DatePicker";
import { DateTypeSearch3 } from "../../utils/Constants";
import { SelectBox } from "../../components/formComponent/SelectBox";
import AutoComplete from "../../components/formComponent/AutoComplete";
import MultiSelectComp from "../../components/formComponent/MultiSelectComp";
import Tables from "../../components/UI/customTable";
import {
  BindEmployeeReports,
  getCollectionBoy,
} from "../../utils/NetworkApi/commonApi";
import ReactSelect from "../../components/formComponent/ReactSelect";
import { FaPrint } from "react-icons/fa";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { toast } from "react-toastify";
import { CustomButton, SearchButton } from "../../components/UI/CustomButton";
import Pagination from "../../Pagination/Pagination";
import "./PaymentTypeSearch.css";
import PageControlGear from "../../components/PageGearModel/PageControlGear";

const PaymentTypeSearch = () => {
  const { t } = useTranslation();
  const theme = useLocalStorage("theme", "get");
  const [loading, setLoading] = useState(false);
  const [rateTypeSuggestions, setRateTypeSuggestions] = useState([]);
  const [selectRateType, setSelectRateType] = useState(false);
  const [rateTypeIndex, setRateTypeIndex] = useState(0);
  const [allRateTypesFromAPI, setAllRateTypesFromAPI] = useState([]);
  const [proEmployee, setProEmployee] = useState([]);
  const [collectionBoyList, setCollectionBoyList] = useState([]);
  const [tableData, setTableData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [employee, setEmployee] = useState([]);
  const [paymentMode, setPaymentMode] = useState([]);
  const [employeeSuggestions, setEmployeeSuggestions] = useState([]);
  const [selectEmployee, setSelectEmployee] = useState(false);
  const [employeeIndex, setEmployeeIndex] = useState(0);
  const [depositeColors, setDepositeColors] = useState([]);
  const [paymentModeFilter, setPaymentModeFilter] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [pageSize, setPageSize] = useState(50);
  const [currentPage, setCurrentPage] = useState(1);
  const [loadingPrintId, setLoadingPrintId] = useState(null);
  const [loadingPdf, setLoadingPdf] = useState(false)
  const [loadingExcel, setLoadingExcel] = useState(false)
  const PAGE_ID = "787";
  // ── Remarks Modal State ───────────────────────────────────────────────────
  const [remarksModal, setRemarksModal] = useState({ open: false, text: "" });

  console.log({filteredData})

  const openRemarksModal = (e, text) => {
    e.preventDefault();
    e.stopPropagation();
    document.body.style.overflow = "hidden"; // lock background scroll
    setRemarksModal({ open: true, text });
  };

  const closeRemarksModal = () => {
    document.body.style.overflow = ""; // restore scroll
    setRemarksModal({ open: false, text: "" });
  };

  // ── Dynamic Controller State ──────────────────────────────────────────────
  const [controllerDynamicList, setControllerDynamicList] = useState([]);
  const [tabbingOrder, setTabbingOrder] = useState([]);
  const [FilterData, setFilterData] = useState([]);

  const [dropDownList, setDropdownList] = useState({
    businessList: [],
    depositeList: [],
    paymentList: [],
  });

  const paymentModeColors = {
    Cash: "#9370DB",
    "Non-Cash": "#20B2AA",
  };

  const [payload, setPayload] = useState({
    FromDate: new Date(),
    ToDate: new Date(),
    businessID: [],
    depositeID: [],
    paymentID: [],
    Employee: "",
    RateType: "",
    DateTypeSearch: "io.dtEntry",
    collectionBoy: "",
    SalesManager: "",
    paymentValue: [],
  });

  const [headWithApiFields, setHeadWithApiFields] = useState({
    "Sr.No.": "srNo",
    "Business Unit Code": "BusinessUnitCode",
    "Business Unit Name": "BusinessUnitName",
    "Deposite Type": "depositeType",
    "Receipt No": "receiptNo",
    "Rate Type Code": "rateTypeCode",
    "Rate Type": "rateType",
    Amount: "amount",
    RrnNo: "RrnNo",
    "Payment Mode": "paymentMode",
    "Deposite By": "depositeBy",
    "Entry Date": "entryDate",
    "Received Date": "receivedDate",
    "Invoice No": "invoiceNo",
    Remarks: "remarks",
    Print: "print",
  });

  // ── Memoized current page data ────────────────────────────────────────────
  const currentTableData = useMemo(() => {
    const firstPageIndex = (currentPage - 1) * pageSize;
    const lastPageIndex = firstPageIndex + pageSize;
    return filteredData.slice(firstPageIndex, lastPageIndex);
  }, [currentPage, pageSize, filteredData]);

  console.log({tableData})
  const handleChangeSearch = (e) => {
    const value = e.target.value.toLowerCase();
    setSearchTerm(e.target.value);

    if (!value.trim()) {
      setFilteredData(tableData);
      setCurrentPage(1);
      return;
    }

    const searchableKeys = [
      "srNo",
      "BusinessUnitCode",
      "BusinessUnitName",
      "depositeType",
      "receiptNo",
      "rateTypeCode",
      "rateType",
      "amount",
      "RrnNo",
      "paymentMode",
      "depositeBy",
      "entryDate",
      "receivedDate",
      "invoiceNo",
      "remarks",
    ];

    const filtered = tableData?.filter((row) =>
      searchableKeys.some((key) =>
        String(row[key] || "")
          .toLowerCase()
          .includes(value),
      ),
    );

    setFilteredData(filtered);
    setCurrentPage(1);
  };

  // ── Helpers ───────────────────────────────────────────────────────────────
  const dateSelect = (value, name) => {
    const d = new Date(value);
    const formattedDate = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    setPayload((prev) => ({ ...prev, [name]: value }));
    return formattedDate;
  };

  const handlePaymentModeFilter = (mode) => {
    setPaymentModeFilter(mode);
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

        const dynamicMappings = { ...headWithApiFields };
        controllersData.forEach((column) => {
          if (!dynamicMappings[column.ControlDisplayID]) {
            dynamicMappings[column.ControlDisplayID] =
              column.ApiFieldName || column.ControlDisplayID;
          }
        });
        setHeadWithApiFields(dynamicMappings);
      }
    } catch (error) {
      console.error("error in controllerDynamic:", error);
    }
  };

  // ── Rate Type autocomplete ────────────────────────────────────────────────
  const handleRateTypeChange = (e) => {
    const value = e.target.value;
    if (value.trim() === "") {
      setSelectRateType(false);
      setRateTypeSuggestions([]);
      setPayload((prev) => ({ ...prev, RateType: "" }));
    } else {
      const filtered = allRateTypesFromAPI.filter((item) =>
        item.RateTypeName.toLowerCase().includes(value.toLowerCase()),
      );
      setRateTypeSuggestions(filtered);
      setSelectRateType(true);
      setPayload((prev) => ({ ...prev, RateType: value }));
    }
  };

  const handleRateTypeKeyDown = (e) => {
    if (rateTypeSuggestions.length === 0) return;
    if (e.which === 38)
      setRateTypeIndex((prev) =>
        prev > 0 ? prev - 1 : rateTypeSuggestions.length - 1,
      );
    else if (e.which === 40)
      setRateTypeIndex((prev) =>
        prev === rateTypeSuggestions.length - 1 ? 0 : prev + 1,
      );
    else if (e.which === 13) {
      handleRateTypeSelect(rateTypeSuggestions[rateTypeIndex]);
      setRateTypeIndex(0);
    }
  };

  const handleRateTypeSelect = (data) => {
    setPayload((prev) => ({
      ...prev,
      RateType: data.RateTypeName,
      RateTypeID: data.RateTypeID,
      PayMode: data.PayMode,
    }));
    setSelectRateType(false);
    setRateTypeSuggestions([]);
  };

  // ── Employee autocomplete ─────────────────────────────────────────────────
  const handleEmployeeChange = (e) => {
    const value = e.target.value;
    if (value.trim() === "") {
      setSelectEmployee(false);
      setEmployeeSuggestions([]);
      setPayload((prev) => ({ ...prev, Employee: "" }));
    } else {
      const filtered = employee.filter((emp) =>
        emp.label.toLowerCase().includes(value.toLowerCase()),
      );
      setEmployeeSuggestions(filtered);
      setSelectEmployee(true);
      setPayload((prev) => ({ ...prev, Employee: value }));
    }
  };

  const handleEmployeeKeyDown = (e) => {
    if (employeeSuggestions.length === 0) return;
    if (e.which === 38)
      setEmployeeIndex((prev) =>
        prev > 0 ? prev - 1 : employeeSuggestions.length - 1,
      );
    else if (e.which === 40)
      setEmployeeIndex((prev) =>
        prev === employeeSuggestions.length - 1 ? 0 : prev + 1,
      );
    else if (e.which === 13) {
      handleEmployeeSelect(employeeSuggestions[employeeIndex]);
      setEmployeeIndex(0);
    }
  };

  const handleEmployeeSelect = (emp) => {
    setPayload((prev) => ({
      ...prev,
      Employee: emp.label,
      EmployeeID: emp.value,
    }));
    setSelectEmployee(false);
    setEmployeeSuggestions([]);
  };

  // ── Generic select/checkbox handler ──────────────────────────────────────
  const handleSelectChange = (event) => {
    const { name, value, checked, type } = event?.target || {};
    setPayload((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSelectchangeCheck = (name, value) => {
    setPayload((prev) => {
      if (name === "paymentID") {
        const selectedValues = Array.isArray(value) ? value : [];
        const selectedLabels = paymentMode
          .filter((item) => selectedValues.includes(item.value))
          .map((item) => item.label);
        return {
          ...prev,
          paymentID: selectedLabels,
          paymentValue: selectedValues,
        };
      }
      return { ...prev, [name]: value };
    });
  };

  // ── Export helpers ────────────────────────────────────────────────────────
  // const exportToExcel = () => {
  //   if (!tableData || tableData.length === 0) {
  //     toast.info("No Data Found");
  //     return;
  //   }

  //   // Get only the columns that are enabled (IsShow == 1) from dynamic controller
  //   const enabledColumns =
  //     FilterData?.filter((item) => item.IsShow == 1 && item.TypeId == 2) || [];

  //   if (enabledColumns.length === 0) {
  //     toast.info("No columns enabled for export");
  //     return;
  //   }

  //   // Build excel data dynamically based on enabled columns
  //   const excelData = tableData.map((row) => {
  //     const rowData = {};

  //     enabledColumns.forEach((column) => {
  //       switch (column.ControlDisplayID) {
  //         case "Sr.No.":
  //           rowData["Sr.No."] = row.srNo;
  //           break;
  //         case "Business Unit Code":
  //           rowData["Business Unit Code"] = row.BusinessUnitCode;
  //           break;
  //         case "Business Unit Name":
  //           rowData["Business Unit Name"] = row.BusinessUnitName;
  //           break;
  //         case "Deposite Type":
  //           rowData["Deposite Type"] = row.depositeType;
  //           break;
  //         case "Receipt No":
  //           rowData["Receipt No"] = row.receiptNo;
  //           break;
  //         case "Rate Type Code":
  //           rowData["Rate Type Code"] = row.rateTypeCode;
  //           break;
  //         case "Rate Type":
  //           rowData["Rate Type"] = row.rateType;
  //           break;
  //         case "Amount":
  //           rowData["Amount"] = row.amount;
  //           break;
  //         case "Payment Mode":
  //           rowData["Payment Mode"] = row.paymentMode;
  //           break;
  //         case "Deposite By":
  //           rowData["Deposite By"] = row.depositeBy;
  //           break;
  //         case "Entry Date":
  //           rowData["Entry Date"] = row.entryDate;
  //           break;
  //         case "Received Date":
  //           rowData["Received Date"] = row.receivedDate;
  //           break;
  //         case "Invoice No":
  //           rowData["Invoice No"] = row.invoiceNo;
  //           break;
  //         case "Remarks":
  //           rowData["Remarks"] = row.remarks;
  //           break;
  //         case "Created By Name":
  //           rowData["Created By Name"] = row.CreatedByName;
  //           break;
  //         // Add any other columns you might have
  //         default:
  //           // For any dynamic columns not handled above, you might want to add a fallback
  //           // rowData[column.ControlDisplayName || column.ControlDisplayID] = row[column.ApiFieldName] || "";
  //           break;
  //       }
  //     });

  //     return rowData;
  //   });

  //   const worksheet = XLSX.utils.json_to_sheet(excelData);
  //   const workbook = XLSX.utils.book_new();
  //   XLSX.utils.book_append_sheet(workbook, worksheet, "Payments");
  //   XLSX.writeFile(workbook, "PaymentTypeData.xlsx");
  // };

  const exportToExcel = async () => {
    const apiPayload = {
      DateType: payload?.DateTypeSearch || "",
      FromDate: dateSelect(payload?.FromDate, "FromDate"),
      ToDate: dateSelect(payload?.ToDate, "ToDate"),
      BusinessUnitIDs: payload.businessID?.length ? payload.businessID : [],
      RateType: payload?.RateTypeID?.toString() || "",
      DepositTypes: payload?.depositeID?.length ? payload.depositeID.map(String) : [],
      PaymentModes: payload?.paymentID?.length ? payload.paymentID.map(String) : [],
      User: payload?.EmployeeID?.toString() || "",
      StatusCode: "",
      ProEmployeeID: payload?.SalesManager?.value || 0,
      CollectionBoyID: payload?.collectionBoy?.value ? parseInt(payload.collectionBoy.value) : 0,
    };

    try {
      setLoadingExcel(true);
      const res = await axiosReport.post("commonReports/ExportPaymentTypeExcel", apiPayload, {
        responseType: "blob",
      });
const contentType = res.headers?.["content-type"] || "";
            if (contentType.includes("application/json")) {
                const text = await res.data.text();
                const json = JSON.parse(text);
                toast.warning(json?.message || "No records found.");
                return;
            }
 
            if (!res.data || res.data.size === 0) {
                toast.warning("No data available to export.");
                return;
            }
           downloadExcelBlob(res.data, "PaymentTypeData");
           

      // const url = window.URL.createObjectURL(
      //   new Blob([res.data], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" }),
      // );
      // const link = document.createElement("a");
      // link.href = url;
      // link.setAttribute("download", "PaymentTypeData.xlsx");
      // document.body.appendChild(link);
      // link.click();
      // link.remove();
      // window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error while exporting excel", error);
      toast.error("Error exporting Excel");
    } finally {
      setLoadingExcel(false);
    }
  }

  // const exportToPDF = () => {
  //   if (!tableData || tableData.length === 0) {
  //     toast.info("No Data Found");
  //     return;
  //   }

  //   // Get only the enabled columns
  //   const enabledColumns =
  //     FilterData?.filter((item) => item.IsShow == 1 && item.TypeId == 2) || [];

  //   if (enabledColumns.length === 0) {
  //     toast.info("No columns enabled for export");
  //     return;
  //   }

  //   // Create headers array from enabled columns
  //   const headers = enabledColumns.map(
  //     (column) => column.ControlDisplayName || column.ControlDisplayID,
  //   );

  //   // Create rows dynamically based on enabled columns
  //   const rows = tableData.map((row) => {
  //     return enabledColumns.map((column) => {
  //       switch (column.ControlDisplayID) {
  //         case "Sr.No.":
  //           return row.srNo;
  //         case "Business Unit Code":
  //           return row.BusinessUnitCode;
  //         case "Business Unit Name":
  //           return row.BusinessUnitName;
  //         case "Deposite Type":
  //           return row.depositeType;
  //         case "Receipt No":
  //           return row.receiptNo;
  //         case "Rate Type Code":
  //           return row.rateTypeCode;
  //         case "Rate Type":
  //           return row.rateType;
  //         case "Amount":
  //           return row.amount;
  //         case "Payment Mode":
  //           return row.paymentMode;
  //         case "Deposite By":
  //           return row.depositeBy;
  //         case "Entry Date":
  //           return row.entryDate;
  //         case "Received Date":
  //           return row.receivedDate;
  //         case "Invoice No":
  //           return row.invoiceNo;
  //         case "Remarks":
  //           return row.remarks;
  //         case "Created By Name":
  //           return row.CreatedByName;
  //         default:
  //           return "";
  //       }
  //     });
  //   });

  //   const doc = new jsPDF("landscape");
  //   autoTable(doc, {
  //     head: [headers],
  //     body: rows,
  //     startY: 20,
  //     styles: { fontSize: 9, cellPadding: 3 },
  //     headStyles: { fillColor: [63, 81, 181], textColor: 255 },
  //   });
  //   doc.save("PaymentTypeData.pdf");
  // };

  const exportToPDF = async () => {
    // 1. Construct the payload
    const apiPayload = {
      DateType: payload?.DateTypeSearch || "",
      FromDate: dateSelect(payload?.FromDate, "FromDate"),
      ToDate: dateSelect(payload?.ToDate, "ToDate"),
      BusinessUnitIDs: payload.businessID?.length ? payload.businessID : [],
      RateType: payload?.RateTypeID?.toString() || "",
      DepositTypes: payload?.depositeID?.length ? payload.depositeID.map(String) : null,
      PaymentModes: payload?.paymentID?.length ? payload.paymentID.map(String) : [],
      User: payload?.EmployeeID?.toString() || "",
      StatusCode: "",
      ProEmployeeID: payload?.SalesManager?.value || 0,
      CollectionBoyID: payload?.collectionBoy?.value ? parseInt(payload.collectionBoy.value) : 0,
    };

    try {
      setLoadingPdf(true)
      const res = await axiosReport.post("commonReports/PaymentTypeSearchPdf", apiPayload, {
        responseType: "blob"
      });

      if (res.data.type === "application/json") {
        const text = await res.data.text();
        const errorData = JSON.parse(text);
        console.error("Server returned an error:", errorData);
        return;
      }

      const url = window.URL.createObjectURL(
        new Blob([res.data], { type: "application/pdf" }),
      );
      window.open(url, "_blank");
      setLoadingPdf(false)

    } catch (error) {
      console.error("Error while getting pdf", error);
    }
  };

  // ── Print receipt ─────────────────────────────────────────────────────────
  const handlePrintClick = async (receiptNo, rowId) => {
    setLoadingPrintId(rowId);
    axiosReport
      .post(
        "commonReports/GetSingleReceiptData",
        { ReceiptNo: receiptNo },
        { responseType: "arraybuffer" },
      )
      .then((res) => {
        const file = new Blob([res.data], { type: "application/pdf" });
        window.open(URL.createObjectURL(file), "_blank");
      })
      .catch((err) => {
        toast.error(err?.data?.response?.message || "Error Occur");
      })
      .finally(() => {
        setLoadingPrintId(null);
      });
  };

  // ── API calls ─────────────────────────────────────────────────────────────
  const getGlobalCentres = async () => {
    axiosInstance
      .post("Centre/BindCentreWorkOrder", {
        centreID: 0,
        rateTypeID: 0,
      })
      .then((res) => {
        const centreList = res?.data?.message?.map((ele) => ({
          value: String(ele?.value),
          label: ele?.label,
        }));
        setDropdownList((prev) => ({ ...prev, businessList: centreList }));
      })
      .catch(console.log);
  };

  // const getAccessCentres = async () => {
  //   axiosInstance
  //     .post("Centre/BindRateTypeWorkOrder", {
  //       centreID: payload?.businessID?.[0] || 0,
  //       rateTypeID: 0,
  //       AllowEstimate: 0,
  //       CentreType: 0,
  //       AllowHomeCollection: 0,
  //       AllowMembershipCard: 0,
  //     })
  //     .then((res) => setAllRateTypesFromAPI(res.data.message))
  //     .catch(console.log);
  // };
  const getAccessCentres = async (centreID) => {
    axiosInstance
      .post("Centre/BindRateTypeWorkOrderSearch", {
        centreID: centreID.toString() || 0,
        rateTypeID: 0,
        AllowEstimate: 0,
        CentreType: "",
        AllowHomeCollection: 0,
        AllowMembershipCard: 0,
        PageName: "YES",
      })
      .then((res) => {
        const cleanedData = res.data.message.map((item) => ({
          ...item,
          RateTypeName: item.RateTypeName.replace(/\r?\n/g, " ").trim(),
        }));
        setAllRateTypesFromAPI(cleanedData);
      })
      .catch(console.log);
  };

  const getDepositeTypes = async () => {
    axiosInstance
      .get("Accounts/BindDepositeType")
      .then((res) => {
        const formattedDeposites = res?.data?.message?.map((item) => ({
          label: item.DepositeTypeName,
          value: item.DepositeTypeID,
        }));
        setDropdownList((prev) => ({
          ...prev,
          depositeList: formattedDeposites,
        }));
      })
      .catch(console.log);
  };

  const getProEmployee = () => {
    axiosInstance
      .get("Employee/ProEmployee")
      .then((res) => {
        const proData = res?.data?.message?.map((ele) => ({
          value: ele?.EmployeeID,
          label: ele?.EmployeeName,
        }));
        setProEmployee(proData);
      })
      .catch(console.log);
  };

  // ── Main Search API ───────────────────────────────────────────────────────
  const getPaymentBySearch = async () => {
    setTableData([]);
    setFilteredData([]);
    setLoading(true);

    const apiPayload = {
      DateType: payload?.DateTypeSearch || "",
      FromDate: dateSelect(payload?.FromDate, "FromDate"),
      ToDate: dateSelect(payload?.ToDate, "ToDate"),
      BusinessUnitIDs: payload.businessID.length ? payload?.businessID : [],
      RateType: payload?.RateTypeID?.toString() || "",
      DepositTypes: payload?.depositeID?.length
        ? payload?.depositeID?.map(String)
        : null,
      PaymentModes: payload?.paymentID?.length
        ? payload.paymentID?.map(String)
        : [],
      User: payload?.EmployeeID?.toString() || "",
      StatusCode: "",
      ProEmployeeID: payload?.SalesManager?.value || 0,
      CollectionBoyID: payload?.collectionBoy?.value
        ? parseInt(payload?.collectionBoy?.value)
        : 0,
    };

    axiosInstance
      .post("Accounts/PaymentTypeSearch", apiPayload)
      .then((res) => {
        if (Array.isArray(res?.data?.message) && res.data.message.length > 0) {
          // ── Store raw data (no JSX) ──
          const formattedData = res?.data?.message?.map((item, index) => ({
            srNo: index + 1,
            BusinessUnitCode: item.BusinessUnitCode || "",
            BusinessUnitName: item.BusinessUnitName || "",
            depositeType: item.DepositeTypeName || "",
            depositeTypeColor: item.HtmlColorCode || "transparent",
            receiptNo: item.ReceiptNo || "",
            rateTypeCode: item.RateTypeCode || "",
            rateType: item.RateTypeName || "",
            amount: item.ReceivedAmt || 0,
            RrnNo: item?.RrnNo || "",
            paymentMode: item.ReceivedPaymentMode || "",
            ledgerMode: item.LedgerMode || "",
            depositeBy: item.CreatedByName || "",
            entryDate: item.dtEntry || "",
            receivedDate: item.ReceiveDate || "",
            invoiceNo: item.InvoiceNo || "",
            remarks: item.Remarks || "",
            CreatedByName: item.CreatedByName || "",
          }));

          // ── Unique deposite colors for legend ──
          const uniqueDeposites = {};
          res?.data?.message?.forEach((item) => {
            if (item.DepositeTypeName)
              uniqueDeposites[item.DepositeTypeName] =
                item.HtmlColorCode || "#00FA9A";
          });
          setDepositeColors(
            Object.entries(uniqueDeposites).map(([label, color]) => ({
              label,
              color,
            })),
          );

          setTableData(formattedData);
          setFilteredData(formattedData);
          setCurrentPage(1);
          toast.success("Data fetched successfully");
        } else {
          toast.info(res.data.message || "No Data Found");
          setTableData([]);
          setFilteredData([]);
        }
        setLoading(false);
      })
      .catch((err) => {
        toast.error(err?.data?.message || "Error Occur");
        setLoading(false);
      })
      .finally(() => setLoading(false));
  };

  // ── Payment mode filter effects ───────────────────────────────────────────
  const normalize = (v) =>
    String(v || "")
      .trim()
      .toLowerCase();

  useEffect(() => {
    setPaymentModeFilter(null);
  }, [tableData]);

  useEffect(() => {
    if (paymentModeFilter === null) {
      setFilteredData(tableData);
      setCurrentPage(1);
      return;
    }
    const newFilteredData = tableData.filter((row) => {
      const value = normalize(row.paymentMode || "");
      const filter = normalize(paymentModeFilter);
      if (filter === "cash") return value === "cash";
      if (filter === "non-cash") return value !== "cash" && value !== "";
      return value === filter;
    });
    setFilteredData(newFilteredData);
    setCurrentPage(1);
  }, [paymentModeFilter, tableData]);

  // ── Mount ─────────────────────────────────────────────────────────────────
  useEffect(() => {
    getAccessCentres(0);
    getDepositeTypes();
    getGlobalCentres();
    BindEmployeeReports(setEmployee);
    getPaymentModes("PaymentMode", setPaymentMode);
    getProEmployee();
    getCollectionBoy(setCollectionBoyList, true);
    controllerDynamic();
  }, []);

  useEffect(() => {
    if (payload?.businessID?.length > 0) {
      getAccessCentres(payload?.businessID);
    } else {
      getAccessCentres(0);
      setAllRateTypesFromAPI([]);
    }
  }, [payload?.businessID]);

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <>
      {/* ── Search Filters Accordion ── */}
      <Accordion
        name={t("Payment Type Search")}
        isBreadcrumb={true}
        defaultValue={true}
        seconTitle={
          <div style={{ marginLeft: "auto" }}>
            <PageControlGear pageId={PAGE_ID} />
          </div>
        }
      >
        <Accordion title={t("Add Details")} defaultValue={true}>
          <div className="row px-2 mt-2">
            {controllerDynamicList
              ?.filter((item) => item?.TypeId === 1 && item?.IsShow === 1)
              ?.map((item, index) => {
                if (
                  item?.ControlDisplayID === "DateTypeSearch" &&
                  isHideController("DateTypeSearch")
                ) {
                  return (
                    <div className="col-12 col-sm-6 col-md-2 my-1" key={index}>
                      <SelectBox
                        lable="DateTypeSearch"
                        options={DateTypeSearch3}
                        selectedValue={payload?.DateTypeSearch}
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
                    <div className="col-12 col-sm-6 col-md-2 my-1" key={index}>
                      <DatePicker
                        className="custom-calendar"
                        name="FromDate"
                        value={payload?.FromDate}
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
                  item?.ControlDisplayID === "ToDate" &&
                  isHideController("ToDate")
                ) {
                  return (
                    <div className="col-12 col-sm-6 col-md-2 my-1" key={index}>
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
                  item?.ControlDisplayID === "businessID" &&
                  isHideController("businessID")
                ) {
                  return (
                    <div className="col-12 col-sm-6 col-md-2 my-1" key={index}>
                      <MultiSelectComp
                        options={dropDownList?.businessList}
                        name="businessID"
                        id="businessID"
                        placeholder={t("Business Unit")}
                        value={payload?.businessID}
                        onChange={handleSelectchangeCheck}
                      />
                    </div>
                  );
                }

                if (
                  item?.ControlDisplayID === "RateType" &&
                  isHideController("RateType")
                ) {
                  return (
                    <div className="col-12 col-sm-6 col-md-2 my-1" key={index}>
                      <Input
                        type="text"
                        name="RateType"
                        lable="Search By Rate Type"
                        value={payload.RateType || ""}
                        placeholder=" "
                        onChange={handleRateTypeChange}
                        onKeyDown={handleRateTypeKeyDown}
                        onBlur={(e) => {
                          autocompleteOnBlur(setRateTypeSuggestions);
                          setTimeout(() => {
                            const match = rateTypeSuggestions.some(
                              (ele) =>
                                ele.RateTypeName.toLowerCase() ===
                                e.target.value.toLowerCase(),
                            );
                            if (!match)
                              setPayload((prev) => ({ ...prev, RateType: "" }));
                          }, 200);
                        }}
                      />
                      {selectRateType && rateTypeSuggestions.length > 0 && (
                        <AutoComplete
                          selects={selectRateType}
                          test={rateTypeSuggestions.map((item) => ({
                            TestName: item.RateTypeName,
                          }))}
                          handleListSearch={(selected) =>
                            handleRateTypeSelect(
                              rateTypeSuggestions.find(
                                (item) =>
                                  item.RateTypeName === selected.TestName,
                              ),
                            )
                          }
                          indexMatch={rateTypeIndex}
                        />
                      )}
                    </div>
                  );
                }

                if (
                  item?.ControlDisplayID === "depositeID" &&
                  isHideController("depositeID")
                ) {
                  return (
                    <div className="col-12 col-sm-6 col-md-2 my-1" key={index}>
                      <MultiSelectComp
                        options={dropDownList?.depositeList}
                        name="depositeID"
                        id="depositeID"
                        placeholder={t("Deposite Type")}
                        value={payload?.depositeID}
                        onChange={handleSelectchangeCheck}
                      />
                    </div>
                  );
                }

                if (
                  item?.ControlDisplayID === "paymentID" &&
                  isHideController("paymentID")
                ) {
                  return (
                    <div className="col-12 col-sm-6 col-md-2 my-1" key={index}>
                      <MultiSelectComp
                        options={paymentMode || []}
                        name="paymentID"
                        id="paymentID"
                        placeholder={t("Payment Mode")}
                        value={payload?.paymentValue}
                        onChange={handleSelectchangeCheck}
                      />
                    </div>
                  )
                };

                if (
                  item?.ControlDisplayID === "Employee" &&
                  isHideController("Employee")
                ) {
                  return (
                    <div className="col-12 col-sm-6 col-md-2 my-1" key={index}>
                      <Input
                        type="text"
                        name="Employee"
                        lable="Deposite By"
                        value={payload.Employee || ""}
                        placeholder=" "
                        onChange={handleEmployeeChange}
                        onKeyDown={handleEmployeeKeyDown}
                        onBlur={() =>
                          setTimeout(() => setEmployeeSuggestions([]), 200)
                        }
                      />
                      {selectEmployee && employeeSuggestions.length > 0 && (
                        <AutoComplete
                          selects={selectEmployee}
                          test={employeeSuggestions.map((item) => ({
                            TestName: item.label,
                          }))}
                          handleListSearch={(selected) =>
                            handleEmployeeSelect(
                              employeeSuggestions.find(
                                (item) => item.label === selected.TestName,
                              ),
                            )
                          }
                          indexMatch={employeeIndex}
                        />
                      )}
                    </div>
                  );
                }

                if (
                  item?.ControlDisplayID === "SalesManager" &&
                  isHideController("SalesManager")
                ) {
                  return (
                    <div className="col-12 col-sm-6 col-md-2 my-1" key={index}>
                      <ReactSelect
                        dynamicOptions={[
                          { label: "Select", value: "" },
                          ...proEmployee,
                        ]}
                        name="SalesManager"
                        id="SalesManager"
                        label="Sales Manager"
                        value={payload?.SalesManager}
                        onChange={handleSelectchangeCheck}
                        placeholderName="Sales Manager"
                        respclass=""
                      />
                    </div>
                  );
                }

                if (
                  item?.ControlDisplayID === "collectionBoy" &&
                  isHideController("collectionBoy")
                ) {
                  return (
                    <div className="col-12 col-sm-6 col-md-2 my-1" key={index}>
                      <ReactSelect
                        name="collectionBoy"
                        dynamicOptions={[
                          { label: t("Select Collection Boy"), value: "" },
                          ...collectionBoyList,
                        ]}
                        placeholderName={t("Collection Boy")}
                        value={payload?.collectionBoy}
                        onChange={handleSelectchangeCheck}
                      />
                    </div>
                  );
                }

                return null;
              })}

            {/* ── Action Buttons ── */}
            <div className="col-12 col-sm-6 col-md-2 my-1 d-flex" style={{ gap: "0.5rem" }}>
              <SearchButton
                text="Search"
                value="Search"
                id="btnSearch"
                onClick={getPaymentBySearch}
              />
              <CustomButton
                text="Excel"
                icon="excel"
                value="Excel"
                disabled={loadingExcel}
                onClick={exportToExcel}
              />
              <CustomButton
                text="PDF"
                icon="pdf"
                value="PDF"
                disabled={loadingPdf}
                onClick={exportToPDF}
              />
            </div>
          </div>
        </Accordion>
      </Accordion>

      {/* ── Results Accordion ── */}
      <Accordion
        className="pts-results-accordion"
        title={
          <div
          style={{ 
            display: "flex", 
            alignItems: "center", 
            flexWrap: "wrap", 
            padding: "0 0.5rem",
            gap: "6px", 
            marginTop: "0.5rem",
            }}
            >
            <span style={{ fontWeight: "bold", marginRight: "0.5rem" }}>
              {t("Search Result")}
            </span>
            {/* Color Legend — desktop only */}
            <div className="d-none d-md-flex flex-wrap" style={{ gap: "6px" }}>
              {[
                ...depositeColors,
                { color: "#FFA500", label: t("CN") },
                { color: "#1E90FF", label: t("DN") },
                { color: "#FF69B4", label: t("TDS") },
                { color: "#FFD700", label: t("Others") },
                { color: "#9370DB", label: t("Cash") },
                { color: "#20B2AA", label: t("Non-Cash") },
              ].map((item, idx) => (
                <div key={idx} style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                  <button
                    className="statusConfirmed"
                    style={{ backgroundColor: item.color, width: "14px", height: "14px", cursor: "pointer", border: "none", borderRadius: "2px" }}
                    onClick={() => handlePaymentModeFilter(item.label)}
                  />
                  <label style={{ cursor: "pointer", marginBottom: 0, fontSize: "12px" }}>
                    {item.label}
                  </label>
                </div>
              ))}
            </div>
          </div>
        }
        defaultValue={true}
        seconTitle={
          <>
            {/* Desktop: single row — totals + search (original layout) */}
            <div className="d-none d-md-flex align-items-center justify-content-end py-2 pr-2" style={{ gap: "1rem" }}>
              <div style={{ whiteSpace: "nowrap" }}>
                <strong>{t("Total Transaction")}:&nbsp;</strong>
                <span className="text-danger" style={{ fontWeight: "bold" }}>
                  {tableData.length.toLocaleString("en-IN")}
                </span>
              </div>
              <div style={{ whiteSpace: "nowrap" }}>
                <strong>{t("Total Amount")}:&nbsp;</strong>
                <span className="text-danger" style={{ fontWeight: "bold" }}>
                  {tableData.reduce((sum, item) => sum + (item.amount || 0), 0).toLocaleString("en-IN")}
                </span>
              </div>
              <div style={{ minWidth: "150px" }}>
                <Input
                  type="text"
                  name="search"
                  id="search"
                  placeholder="Search..."
                  value={searchTerm}
                  onChange={handleChangeSearch}
                />
              </div>
            </div>
            {/* Mobile only: search bar right-aligned, small */}
            <div className="d-flex d-md-none justify-content-end" style={{ width: "100%" }}>
              <div style={{ width: "120px" }}>
                <Input
                  type="text"
                  name="search"
                  id="search_m"
                  placeholder="Search..."
                  value={searchTerm}
                  onChange={handleChangeSearch}
                />
              </div>
            </div>
          </>
        }
      >
        {/* Mobile only: "Search Detail:" fixed label + scrollable color indicators */}
        <div className="d-flex d-md-none align-items-center px-2 pt-1 pb-1" style={{ overflow: "hidden" }}>
          <span style={{ flexShrink: 0, fontWeight: "600", fontSize: "12px", marginRight: "6px", whiteSpace: "nowrap" }}>
            {t("Search Detail")} :
          </span>
          <div style={{ display: "flex", gap: "8px", overflowX: "auto", flexWrap: "nowrap", paddingBottom: "2px" }}>
            {[
              ...depositeColors,
              { color: "#FFA500", label: t("CN") },
              { color: "#1E90FF", label: t("DN") },
              { color: "#FF69B4", label: t("TDS") },
              { color: "#FFD700", label: t("Others") },
              { color: "#9370DB", label: t("Cash") },
              { color: "#20B2AA", label: t("Non-Cash") },
            ].map((item, idx) => (
              <div key={idx} style={{ display: "flex", alignItems: "center", gap: "4px", flexShrink: 0 }}>
                <button
                  className="statusConfirmed"
                  style={{ backgroundColor: item.color, width: "14px", height: "14px", cursor: "pointer", border: "none", borderRadius: "2px" }}
                  onClick={() => handlePaymentModeFilter(item.label)}
                />
                <label style={{ cursor: "pointer", marginBottom: 0, fontSize: "12px", whiteSpace: "nowrap" }}>{item.label}</label>
              </div>
            ))}
          </div>
        </div>
        <div className="d-flex d-md-none px-2 pb-1" style={{ gap: "1rem", flexWrap: "nowrap" }}>
          <div style={{ whiteSpace: "nowrap" }}>
            <strong>{t("Total Transaction")}:&nbsp;</strong>
            <span className="text-danger" style={{ fontWeight: "bold" }}>
              {tableData.length.toLocaleString("en-IN")}
            </span>
          </div>
          <div style={{ whiteSpace: "nowrap" }}>
            <strong>{t("Total Amount")}:&nbsp;</strong>
            <span className="text-danger" style={{ fontWeight: "bold" }}>
              {tableData.reduce((sum, item) => sum + (item.amount || 0), 0).toLocaleString("en-IN")}
            </span>
          </div>
        </div>

        {/* ── Table Section with Loader ── */}
        <div className="row p-2">
          <div className="col-12">
            {loading ? (
              <Loading />
            ) : (
              <>
                {filteredData?.length > 0 ? (
                  <>
                    <Tables paginate={"true"} data={filteredData}>
                      <thead>
                        <tr>
                          {FilterData?.filter(
                            (item) => item.IsShow == 1 && item.TypeId == 2,
                          )?.map((header, idx) => {
                            if (header.ControlDisplayID === "Sr.No.") {
                              return (
                                <th key={idx} className="px-2">
                                  <span className="px-2">{t("Sr.No.")}</span>
                                </th>
                              );
                            }
                            if (
                              header.ControlDisplayID === "Business Unit Code"
                            ) {
                              return (
                                <th key={idx} className="px-2">
                                  <span className="px-2">
                                    {t("Business Unit Code")}
                                  </span>
                                </th>
                              );
                            }
                            if (
                              header.ControlDisplayID === "Business Unit Name"
                            ) {
                              return (
                                <th key={idx} className="px-2">
                                  <span className="px-2">
                                    {t("Business Unit Name")}
                                  </span>
                                </th>
                              );
                            }
                            if (header.ControlDisplayID === "Deposite Type") {
                              return (
                                <th key={idx} className="px-2">
                                  {t("Deposite Type")}
                                </th>
                              );
                            }
                            if (header.ControlDisplayID === "Receipt No") {
                              return (
                                <th key={idx} className="px-2">
                                  {t("Receipt No")}
                                </th>
                              );
                            }
                            if (header.ControlDisplayID === "Rate Type Code") {
                              return (
                                <th key={idx} className="px-2">
                                  {t("Rate Type Code")}
                                </th>
                              );
                            }
                            if (header.ControlDisplayID === "Rate Type") {
                              return (
                                <th key={idx} className="px-2">
                                  {t("Rate Type")}
                                </th>
                              );
                            }
                            if (header.ControlDisplayID === "Amount") {
                              return (
                                <th key={idx} className="px-2">
                                  {t("Amount")}
                                </th>
                              );
                            }
                            if (header.ControlDisplayID === "RrnNo") {
                              return (
                                <th key={idx} className="px-2">
                                  {t("RrnNo")}
                                </th>
                              );
                            }
                            if (header.ControlDisplayID === "Payment Mode") {
                              return (
                                <th key={idx} className="px-2">
                                  {t("Payment Mode")}
                                </th>
                              );
                            }
                            if (header.ControlDisplayID === "Deposite By") {
                              return (
                                <th key={idx} className="px-2">
                                  {t("Deposite By")}
                                </th>
                              );
                            }
                            if (header.ControlDisplayID === "Entry Date") {
                              return (
                                <th key={idx} className="px-2">
                                  {t("Entry Date")}
                                </th>
                              );
                            }
                            if (header.ControlDisplayID === "Received Date") {
                              return (
                                <th key={idx} className="px-2">
                                  {t("Received Date")}
                                </th>
                              );
                            }
                            if (header.ControlDisplayID === "Invoice No") {
                              return (
                                <th key={idx} className="px-2">
                                  {t("Invoice No")}
                                </th>
                              );
                            }
                            if (header.ControlDisplayID === "Remarks") {
                              return (
                                <th key={idx} className="px-2">
                                  {t("Remarks")}
                                </th>
                              );
                            }
                            if (header.ControlDisplayID === "Created By Name") {
                              return (
                                <th key={idx} className="px-2">
                                  {t("Created By Name")}
                                </th>
                              );
                            }
                            if (header.ControlDisplayID === "Print") {
                              return (
                                <th key={idx} className="px-2">
                                  {t("Print")}
                                </th>
                              );
                            }
                            return (
                              <th key={idx} className="px-2">
                                <span className="px-2">
                                  {t(header.ControlDisplayName)}
                                </span>
                              </th>
                            );
                          })}
                        </tr>
                      </thead>

                      <tbody>
                        {currentTableData.map((data, rowIndex) => {
                          const actualRowIndex =
                            (currentPage - 1) * pageSize + rowIndex;
                          return (
                            <tr key={rowIndex}>
                              {FilterData?.filter(
                                (item) => item.IsShow == 1 && item.TypeId == 2,
                              )?.map((column, colIndex) => {
                                if (column.ControlDisplayID === "Sr.No.") {
                                  return (
                                    <td key={colIndex} data-title={t("Sr.No.")}>
                                      {actualRowIndex + 1}
                                    </td>
                                  );
                                }

                                if (
                                  column.ControlDisplayID ===
                                  "Business Unit Code"
                                ) {
                                  return (
                                    <td key={colIndex} data-title={t("Business Unit Code")}>
                                      {data.BusinessUnitCode || "-"}
                                    </td>
                                  );
                                }

                                if (
                                  column.ControlDisplayID ===
                                  "Business Unit Name"
                                ) {
                                  return (
                                    <td key={colIndex} data-title={t("Business Unit Name")}>
                                      {data.BusinessUnitName || "-"}
                                    </td>
                                  );
                                }

                                if (
                                  column.ControlDisplayID === "Deposite Type"
                                ) {
                                  return (
                                    <td key={colIndex} data-title={t("Deposite Type")}>
                                      {data.depositeType ? (
                                        <div
                                          style={{
                                            backgroundColor:
                                              data.depositeTypeColor,
                                            borderRadius: "4px",
                                            padding: "2px 6px",
                                          }}
                                          title={data.depositeType}
                                        >
                                          {data.depositeType || "-"}
                                        </div>
                                      ) : null}
                                    </td>
                                  );
                                }

                                if (column.ControlDisplayID === "Receipt No") {
                                  return (
                                    <td key={colIndex} data-title={t("Receipt No")}>
                                      {data.receiptNo || "-"}
                                    </td>
                                  );
                                }

                                if (
                                  column.ControlDisplayID === "Rate Type Code"
                                ) {
                                  return (
                                    <td key={colIndex} data-title={t("Rate Type Code")}>
                                      {data.rateTypeCode || "-"}
                                    </td>
                                  );
                                }

                                if (column.ControlDisplayID === "Rate Type") {
                                  return (
                                    <td
                                      key={colIndex}
                                      data-title={t("Rate Type")}
                                    >
                                      {data.rateType || "-"}
                                    </td>
                                  );
                                }

                                if (column.ControlDisplayID === "Amount") {
                                  return (
                                    <td key={colIndex} data-title={t("Amount")}>
                                      {data.amount || "-"}
                                    </td>
                                  );
                                }
                                
                                if (column.ControlDisplayID === "RrnNo") {
                                  return (
                                    <td key={colIndex} data-title={t("RrnNo")}>
                                      {data.RrnNo || "-"}
                                    </td>
                                  );
                                }

                                if (
                                  column.ControlDisplayID === "Payment Mode"
                                ) {
                                  return (
                                    <td key={colIndex} data-title={t("Payment Mode")}>
                                      {data.paymentMode ? (
                                        <div
                                          style={{
                                            backgroundColor:
                                              data.paymentMode.toLowerCase() ===
                                                "cash"
                                                ? paymentModeColors["Cash"]
                                                : paymentModeColors["Non-Cash"],
                                            borderRadius: "4px",
                                            padding: "2px 6px",
                                            textAlign: "center",
                                            color: "#000",
                                          }}
                                          title={data.paymentMode}
                                        >
                                          {data.paymentMode}
                                        </div>
                                      ) : (
                                        "-"
                                      )}
                                    </td>
                                  );
                                }

                                if (column.ControlDisplayID === "Deposite By") {
                                  return (
                                    <td key={colIndex} data-title={t("Deposite By")}>
                                      {data.depositeBy || "-"}
                                    </td>
                                  );
                                }

                                if (column.ControlDisplayID === "Entry Date") {
                                  return (
                                    <td key={colIndex} data-title={t("Entry Date")}>
                                      {data.entryDate || "-"}
                                    </td>
                                  );
                                }

                                if (
                                  column.ControlDisplayID === "Received Date"
                                ) {
                                  return (
                                    <td key={colIndex} data-title={t("Received Date")}>
                                      {data.receivedDate || "-"}
                                    </td>
                                  );
                                }

                                if (column.ControlDisplayID === "Invoice No") {
                                  return (
                                    <td key={colIndex} data-title={t("Invoice No")}>
                                      {data.invoiceNo || "-"}
                                    </td>
                                  );
                                }

                                // ── REMARKS: Truncated + Double Click to open modal ──
                                if (column.ControlDisplayID === "Remarks") {
                                  return (
                                    <td
                                      key={colIndex}
                                      data-title={t("Remarks")}
                                      className="remarks-column"
                                    >
                                      {data.remarks ? (
                                        <span
                                          onDoubleClick={(e) =>
                                            openRemarksModal(e, data.remarks)
                                          }
                                          title="Double click to view full remarks"
                                          style={{
                                            display: "inline-block",
                                            maxWidth: "150px",
                                            whiteSpace: "nowrap",
                                            overflow: "hidden",
                                            textOverflow: "ellipsis",
                                            cursor: "pointer",
                                            verticalAlign: "middle",
                                          }}
                                        >
                                          {data.remarks || "-"}
                                        </span>
                                      ) : (
                                        ""
                                      )}
                                    </td>
                                  );
                                }

                                if (
                                  column.ControlDisplayID === "Created By Name"
                                ) {
                                  return (
                                    <td key={colIndex} data-title={t("Created By Name")}>
                                      {data.CreatedByName || "-"}
                                    </td>
                                  );
                                }

                                if (column.ControlDisplayID === "Print") {
                                  return (
                                    <td key={colIndex} data-title={t("Print")}>
                                      {data.ledgerMode?.toLowerCase() ===
                                        "cash" ? (
                                        <span style={{ color: "#999" }}>
                                          N/A
                                        </span>
                                      ) : data.receiptNo ? (
                                        <span
                                          onClick={(e) =>
                                            loadingPrintId !== data.receiptNo &&
                                            handlePrintClick(
                                              data.receiptNo,
                                              data.receiptNo,
                                            )
                                          }
                                          style={{
                                            cursor:
                                              loadingPrintId === data.receiptNo
                                                ? "not-allowed"
                                                : "pointer",
                                          }}
                                        >
                                          {loadingPrintId === data.receiptNo ? (
                                            <span
                                              className="spinner-border spinner-border-sm text-secondary"
                                              role="status"
                                              style={{
                                                width: "14px",
                                                height: "14px",
                                              }}
                                            />
                                          ) : (
                                            <FaPrint
                                              style={{
                                                color: "#000",
                                                fontWeight: "200",
                                              }}
                                              title={t("Print")}
                                              size={16}
                                            />
                                          )}
                                        </span>
                                      ) : (
                                        <span style={{ color: "#999" }}>
                                          N/A
                                        </span>
                                      )}
                                    </td>
                                  );
                                }

                                return <td key={colIndex}></td>;
                              })}
                            </tr>
                          );
                        })}
                      </tbody>
                    </Tables>

                    {/* Pagination Controls */}
                    {filteredData.length > 0 && (
                      <div className="d-flex flex-wrap justify-content-end align-items-end gap-2 mt-3">
                        <div style={{ minWidth: "150px" }}>
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
                              setCurrentPage(1);
                            }}
                          />
                        </div>

                        <Pagination
                          className="pagination-bar"
                          currentPage={currentPage}
                          totalCount={filteredData.length}
                          pageSize={pageSize}
                          onPageChange={(page) => {
                            setCurrentPage(page);
                          }}
                        />
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-center py-3">
                    <span>{t("No Data Found")}</span>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </Accordion>

      {/* ── Remarks Full View Modal (PrimeReact Dialog) ── */}
      <Dialog
        header={<span>📝 {t("Remark")}</span>}
        visible={remarksModal.open}
        onHide={closeRemarksModal}
        className={theme}
        style={{ width: "500px" }}
        breakpoints={{ "960px": "75vw", "640px": "90vw" }}
        dismissableMask={true}
        draggable={false}
        resizable={false}
        modal
      >
        <p
          style={{
            margin: 0,
            color: "#444",
            fontSize: "14px",
            lineHeight: "1.7",
            wordBreak: "break-word",
            whiteSpace: "pre-wrap",
            maxHeight: "300px",
            overflowY: "auto",
          }}
        >
          {remarksModal.text}
        </p>
      </Dialog>
    </>
  );
};

export default PaymentTypeSearch;
