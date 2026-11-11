import React, { useEffect, useMemo, useState } from "react";
import moment from "moment";
import Heading from "../../components/UI/Heading";
import { useTranslation } from "react-i18next";
import ReactSelect from "../../components/formComponent/ReactSelect";
import DatePicker from "../../components/formComponent/DatePicker";
import { axiosInstance, axiosReport } from "../../utils/axiosInstance";
import { apiUrls } from "../../utils/apiUrls";
import { useLocalStorage } from "../../utils/hooks/useLocalStorage";
import { useDispatch } from "react-redux";
import { setLoading } from "../../store/reducers/loadingSlice/loadingSlice";
import excelIcon from "../../assets/image/excelIcon.png";
import { getAccessCentres } from "../../utils/NetworkApi/commonApi";
import MultiSelectComp from "../../components/formComponent/MultiSelectComp";
import Tables from "../../components/UI/customTable";
import Accordion from "../../components/UI/Accordion";
import { toast } from "react-toastify";
import { FaArrowTrendDown, FaArrowTrendUp, FaSort, FaSortUp, FaSortDown } from "react-icons/fa6";
import NoRecordFound from "../../components/formComponent/NoRecordFound";
import { CustomButton, SearchButton } from "../../components/UI/CustomButton";
import { ExportToExcel, formatStandardDate } from "../../utils/helpers";
import Pagination from "../../Pagination/Pagination";
import Input from "../../components/formComponent/Input";
import gmail from "../../../src/assets/image/gmail.png"
import Tooltip from "../../components/formComponent/Tooltip";
import { Form } from "react-bootstrap";

const SalesManagerMis = () => {
  const [t] = useTranslation();
  const dispatch = useDispatch();
  const headerCentreId = useLocalStorage("DefaultCentre", "get");
  const [Centre, setCentre] = useState([]);
  const [Department, setDepartment] = useState([]);
  const [Tests, setTests] = useState([]);
  const [titleName, setTitlename] = useState("");
  const [isSearched, setIsSearched] = useState(false);
  const [isSearchLoading, setIsSearchLoading] = useState(false);
  const [isExportLoading, setIsExportLoading] = useState(false);
  const [isPdfLoading, setIsPdfLoading] = useState(false);
  const [isExcelLoading, setIsExcelLoading] = useState(false);

  const [proEmployee, setProEmployee] = useState([]);
  const [tableData, setTableData] = useState([]);
  const [pageSize, setPageSize] = useState(50);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [showBalanceOnly, setShowBalanceOnly] = useState(false);

  const [dropdownList, setDropdownList] = useState({
    rateTypeList: [],
  });
  const [payload, setPayload] = useState({
    rateType: "",
    ProEmployee: [],
    department: [],
    itemId: "",
    prevFrom: moment().toDate(),
    prevTo: moment().toDate(),
    fromDate: moment().toDate(),
    toDate: moment().toDate(),
    SalesManagerList: "",
    ReportType: 1,
    ItemData: "",
    DateType: "0",
    days: "",
    individual: 0,
  });

  const formatAmount = (val, isCount = false) => {
    const num = Number(val || 0);
    if (num === 0) return "-";
    return num.toLocaleString("en-IN", {
      minimumFractionDigits: isCount ? 0 : 2,
      maximumFractionDigits: isCount ? 0 : 2,
    });
  };

   const handleChanges = (e) => {
      const { name, value, checked, type } = e.target;
      console.log(name, value, checked, type);
  
        setPayload({
          ...payload,
          [name]: type === "checkbox" ? (checked ? 1 : 0) : value,
        });
      
    };



  const ReportTypeOptions = [
    { label: "Date Wise", value: 1 },
    { label: "Single Line", value: 2 },
    { label: "Rate Type", value: 3 },
    { label: "Business < 1000", value: 4 },
    { label: "Business < 1000 , x-days", value: 14 },
    { label: "Daily Status", value: 5 },
    { label: "Growth Report", value: 6 },
    // { label: "Monthly Status", value: 7 },
    { label: "Sales Executive VS Client", value: 8 },
    { label: "Sales Executive VS Client VS Test", value: 9 },
    { label: "Sales Executive VS Department", value: 10 },
    { label: "Outstanding Trend", value: 11 },
    { label: "Ledger Statement Date Range", value: 12 },
    { label: "Ledger Statement On Date", value: 13 },
    { label: "Target Achievement", value: 15 },

  ]

  const handleMultiSelectChange = (name, value) => {
    setPayload({ ...payload, [name]: value });
  };

  const handleReactSelectChange = (name, e) => {
    if (name === "rateType") {
      setPayload((prev) => ({
        ...prev,
        rateType: e?.value ? [Number(e.value)] : [],
      }));
      setTitlename(e?.label || "");
    } else {
      setPayload((prev) => ({ ...prev, [name]: e?.value }));
    }
  };

  const dateSelect = (value, name) => {
    setPayload((prev) => ({ ...prev, [name]: value }));
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

  const getRateType = async () => {
    const rateTypePayload = {
      CentreID: Number(headerCentreId),
    };
    dispatch(setLoading(true));
    await axiosInstance
      .post(apiUrls?.getRateTypeWithCentre, rateTypePayload)
      .then((res) => {
        let resList = res?.data?.message?.map((item) => ({
          ...item,
          label: item?.RateTypeName,
          value: String(item?.RateTypeID),
        }));
        setDropdownList((prev) => ({
          ...prev,
          rateTypeList: [{ label: "All", value: "" }, ...resList],
        }));
      })
      .catch((err) => {
        console.log(err);
      })
      .finally(() => {
        dispatch(setLoading(false));
      });
  };

  const getDepartments = () => {
    axiosInstance
      .get("Department/getDepartment")
      .then((res) => {
        const data = res.data.message;
        const DeptDataValue = data.map((ele) => {
          return {
            value: ele?.DepartmentID,
            label: ele?.Department,
          };
        });
        setDepartment(DeptDataValue);
      })
      .catch((err) => console.log(err));
  };

  const getInvestigationList = () => {
    axiosInstance
      .get("Investigations/BindInvestigationList")
      .then((res) => {
        let data = res.data.message;

        let MapTest = data.map((ele) => {
          return {
            value: ele.InvestigationID,
            label: ele.TestName,
          };
        });

        setTests(MapTest);
      })
      .catch((err) => console.log(err));
  };

  useEffect(() => {
    getDepartments();
    getInvestigationList();
  }, [])

  const handleChange = (eOrName, maybeEvent) => {
    let name, value;

    // case: normal input
    if (eOrName?.target) {
      name = eOrName.target.name;
      value = eOrName.target.value;
    }
    // case: custom input
    else {
      name = eOrName;
      value = maybeEvent?.target?.value ?? maybeEvent?.value ?? "";
    }

    if (name === "days") {
      setPayload((prev) => {
        const daysNumber = Number(value) || 0;

        const today = new Date();
        const newFromDate = new Date();
        newFromDate.setDate(today.getDate() - daysNumber);

        return {
          ...prev,
          days: value,
          fromDate: newFromDate,
        };
      });
    } else {
      setPayload((prev) => ({ ...prev, [name]: value }));
    }
  };



  // const handleChanges = (name, value) => {
  //   setPayload({ ...payload, [name]: value });
  // };

  useEffect(() => {
    getRateType();
    getProEmployee();
    getAccessCentres(setCentre);
  }, []);

  const API_ENDPOINTS = {
    1: "SalesHierarchy/GetSalesManagerMISReport",
    2: "SalesHierarchy/GetSalesManagerMISReport",
    3: "SalesHierarchy/GetSalesManagerMISReport",
    4: "SalesHierarchy/GetBusinesslessthan_1000SReport",
    5: "SalesHierarchy/GetDailyStatusReport",
    6: "SalesHierarchy/GetGrowthReport",
    // 7: "SalesHierarchy/MonthlySales",
    8: "SalesHierarchy/GetSalesPersonClientWiseSaleReport",
    9: "SalesHierarchy/GetClientTestWiseSalesReport",
    10: "SalesHierarchy/GetSalesDepartmentWiseReport",
    11: "SalesHierarchy/BackDateOutstandingExcel",
    12: "Accounts/LedgerStatementReport",
    13: "Accounts/LedgerStatementReport",
    14: "SalesHierarchy/GetBusinesslessthan_1000SReport",
    15: "SalesHierarchy/GetTargetAchievementHierarchyReport",
  };

  const SalesManagerMisSearch = () => {
    if (!payload?.ReportType) {
      toast.error("Please select a Report Type");
      return;
    }
    setIsSearchLoading(true);

    let MisPayload = {
      reportType: payload?.ReportType,
      fromDate: formatStandardDate(payload?.fromDate, "YYYY-MM-DD"),
      toDate: formatStandardDate(payload?.toDate, "YYYY-MM-DD"),
      prevFromDateStart: formatStandardDate(payload?.prevFrom, "YYYY-MM-DD"),
      prevFromDateEnd: formatStandardDate(payload?.prevTo, "YYYY-MM-DD"),
      itemId: [Number(payload?.itemId)],
      centreID: payload?.ItemData || [],
      rateTypeID: payload?.rateType || [],
      department: payload?.department || [],
      SalesManagerID: payload?.ProEmployee || [],
    };

    if (payload.ReportType === 11) {
      MisPayload = {
        dtFrom: payload?.fromDate
          ? formatStandardDate(payload.fromDate, "YYYY-MM-DD")
          : "",
        rateTypeID: Array.isArray(payload?.rateType) ? payload.rateType.map(Number) : [],
        centerId: Array.isArray(payload?.ItemData) ? payload.ItemData.map(Number) : [],
        ProEmployeeID: Array.isArray(payload?.ProEmployee) ? payload.ProEmployee.map(Number) : [],
      };
    }
    if (payload.ReportType === 12 || payload.ReportType === 13) {
      MisPayload = {
        BusinessUnitIds: Array.isArray(payload?.ItemData)
          ? payload?.ItemData.map(String)
          : payload?.ItemData
            ? [String(payload?.ItemData)]
            : [],
        FromDate:
          payload?.ReportType === 13
            ? formatStandardDate(payload?.toDate, "YYYY-MM-DD")
            : formatStandardDate(payload?.fromDate, "YYYY-MM-DD"), // Use toDate for FromDate if ReportType is 13
        LedgerMode: "Both",
        DateType: payload.ReportType === 13 ? "1" : "0",
        RateTypeID: Number(
          Array.isArray(payload?.rateType) && payload?.rateType.length > 0
            ? payload?.rateType[0]
            : 0
        ),
        ReportType: "1",
        ToDate: formatStandardDate(payload?.toDate, "YYYY-MM-DD"),
      };
    }

    if (payload.ReportType === 8) {
      MisPayload = {
        ...MisPayload,
        individual: payload?.individual,
        fromDate: formatStandardDate(payload?.fromDate,"YYYY-MM-DD"),
        toDate: formatStandardDate(payload?.toDate,"YYYY-MM-DD"),
      };
    }

    if (payload.ReportType === 15) {
      MisPayload = {
        reportType: 1,
        fromDate: formatStandardDate(payload?.fromDate, "YYYY-MM-DD"),
        toDate: formatStandardDate(payload?.toDate, "YYYY-MM-DD"),
        prevFromDateStart: formatStandardDate(payload?.prevFrom, "YYYY-MM-DD"),
        prevFromDateEnd: formatStandardDate(payload?.prevTo, "YYYY-MM-DD"),
        itemId: payload?.itemId ? [Number(payload?.itemId)] : [],
        centreID: payload?.ItemData || [],
        rateTypeID: payload?.rateType || [],
        department: payload?.department || [],
        salesManagerID: payload?.ProEmployee || [],
        individual: Number(payload?.individual) || 0,
        reportFormat: "Table",
      };
    }

    const apiEndpoint = API_ENDPOINTS[payload.ReportType];

    axiosInstance
      .post(apiEndpoint, MisPayload)
      .then((res) => {
        let responseData = res?.data?.data || res?.data?.message || (Array.isArray(res?.data) ? res?.data : null);

        if (Array.isArray(responseData)) {
          if (payload.ReportType === 15) {
            const flatData = [];
            responseData.forEach((lab) => {
              if (lab.managers && lab.managers.length > 0) {
                lab.managers.forEach((mgr) => {
                  flatData.push({
                    RegionalLabName: lab.regionalLabName,
                    TotalTarget: lab.totalTarget,
                    TotalAchieved: lab.totalAchieved,
                    TotalGap: lab.totalGap,
                    TotalRecovery: lab.totalRecovery,
                    ProCode: mgr.proCode,
                    ProName: mgr.proName,
                    Target: mgr.target,
                    Achieved: mgr.achieved,
                    Gap: mgr.gap,
                    Recovery: mgr.recovery,
                    Status: mgr.totalStatus,
                  });
                });
              } else {
                flatData.push({
                  RegionalLabName: lab.regionalLabName,
                  TotalTarget: lab.totalTarget,
                  TotalAchieved: lab.totalAchieved,
                  TotalGap: lab.totalGap,
                  TotalRecovery: lab.totalRecovery,
                  ProCode: "-",
                  ProName: "-",
                  Target: 0,
                  Achieved: 0,
                  Gap: 0,
                  Recovery: 0,
                  Status: "-",
                });
              }
            });
            responseData = flatData;
          }

          if (responseData.length > 0) {
            const dataWithSrNo = responseData?.map((item, index) => ({
              SrNo: index + 1,
              ...item,
            }));

            setTableData(dataWithSrNo || []);
            setTotalCount(responseData.length || 0)
            setCurrentPage(1);

            setIsSearched(true);
          } else {
            setTableData([]);
            setTotalCount(0);
            setIsSearched(true);
            toast.info("No records found for this search.");
          }
        } else {
          setTableData([]);
          toast.error("Invalid data format received from server.");
        }
      })
      .catch((err) => {
        console.log("MISsssError:", err);

        setTableData([]);
        setTotalCount(0);
      })
      .finally(() => {
        setIsSearchLoading(false);
      });
  };

  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'ascending' });

  const sortedTableData = useMemo(() => {
    let sortableItems = [...tableData];
    if (sortConfig.key !== null) {
      sortableItems.sort((a, b) => {
        let aValue = a[sortConfig.key];
        let bValue = b[sortConfig.key];


        if (!isNaN(Number(aValue)) && !isNaN(Number(bValue))) {
          aValue = Number(aValue);
          bValue = Number(bValue);
        }


        if (typeof aValue === 'string' && typeof bValue === 'string') {
          aValue = aValue.toLowerCase();
          bValue = bValue.toLowerCase();
        }

        if (aValue < bValue) {
          return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableItems;
  }, [tableData, sortConfig]);

  const requestSort = (key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const paginatedTableData = useMemo(() => {
    const firstPageIndex = (currentPage - 1) * pageSize;
    const lastPageIndex = firstPageIndex + pageSize;

    // Filter by balance amount if checkbox is checked and report type is 11
    let filteredData = sortedTableData;
    if (showBalanceOnly && payload?.ReportType === 11) {
      // Debug: Log first item to see column names
      if (sortedTableData.length > 0) {
        console.log("First item keys:", Object.keys(sortedTableData[0]));
        console.log("First item data:", sortedTableData[0]);
      }

      filteredData = sortedTableData.filter(item => {
        // Check for various possible balance column names
        const balanceAmount = Number(item?.BalanceAmount || item?.Balance || item?.balance || item?.BalanceAmt || 0);
        return balanceAmount > 0;
      });

      console.log("Total records:", sortedTableData.length);
      console.log("Filtered records with balance > 0:", filteredData.length);
    }

    return filteredData.slice(firstPageIndex, lastPageIndex);
  }, [currentPage, pageSize, sortedTableData, showBalanceOnly, payload?.ReportType]);

  // Calculate filtered total count for pagination
  const filteredTotalCount = useMemo(() => {
    if (showBalanceOnly && payload?.ReportType === 11) {
      return sortedTableData.filter(item => {
        // Check for various possible balance column names
        const balanceAmount = Number(item?.BalanceAmount || item?.Balance || item?.balance || item?.BalanceAmt || 0);
        return balanceAmount > 0;
      }).length;
    }
    return totalCount;
  }, [sortedTableData, showBalanceOnly, payload?.ReportType, totalCount]);



  useEffect(() => {
    if (isSearched && payload?.ReportType !== 11) {
      SalesManagerMisSearch();
    }
    if (payload?.ReportType === 8) {
      setPayload((prev) => ({ ...prev, individual: 0 }));
    }
    if (payload?.ReportType === 11) {
      setTableData([]);
    }
    // Reset balance filter when report type changes
    setShowBalanceOnly(false);
  }, [payload.ReportType]);

  const calculateTotals = (data, reportType) => {
    if (!data || data.length === 0) {
      return {
        gross: 0,
        discount: 0,
        net: 0,
        received: 0,
        balance: 0,
        amount: 0,
        averageAmt: 0,
      };
    }

    if (reportType === 1 || reportType === 2 || reportType === 3) {
      return data.reduce(
        (acc, cur) => {
          acc.gross += Number(cur?.GrossAmount || 0);
          acc.discount += Number(cur?.DiscountAmount || 0);
          acc.net += Number(cur?.NetAmount || 0);
          acc.received += Number(cur?.ReceivedAmount || 0);
          acc.balance += Number(cur?.BalanceAmount || 0);
          return acc;
        },
        { gross: 0, discount: 0, net: 0, received: 0, balance: 0 }
      );
    }

    if (reportType === 4) {
      return data.reduce(
        (acc, cur) => {
          acc.amount += Number(cur?.Amount || 0);
          acc.averageAmt += Number(cur?.AverageAmt || 0);
          return acc;
        },
        { amount: 0, averageAmt: 0 }
      );
    }

    if (reportType === 5) {
      return data.reduce(
        (acc, cur) => {
          acc.target += Number(cur?.Target || 0);
          acc.achieved += Number(cur?.Achieved || 0);
          acc.short += Number(cur?.Short || 0);
          return acc;
        },
        {
          target: 0, achieved: 0, short: 0
        }
      );
    }

    if (reportType === 6) {
      return data.reduce(
        (acc, cur) => {
          acc.currSale += Number(cur?.Curr_Sale || 0);
          acc.lastSale += Number(cur?.Last_Sale || 0);
          acc.totalSale += Number(cur?.TotalSale || 0);
          acc.diff += Number(cur?.diff || 0);
          return acc;
        },
        { currSale: 0, lastSale: 0, totalSale: 0, diff: 0 }
      );
    }

    if (reportType === 11) {
      if (!data || data.length === 0) return {};
      const fixedColumns = ["ReportingManager", "SalesManager", "FieldBoy"];
      const excludedColumns = ["SrNo", "CreditDays", ...fixedColumns];
      const sample = data[0];
      const dynamicKeys = Object.keys(sample).filter(k => !excludedColumns.includes(k));

      const result = {};
      dynamicKeys.forEach(key => {
        result[key] = data.reduce((sum, row) => sum + (Number(row[key]) || 0), 0);
      });
      return result;
    }

    if (reportType === 10) {
      return data.reduce(
        (acc, cur) => {
          acc.patientCount += Number(cur?.PatientCount || 0);
          acc.netAmount += Number(cur?.NetAmount || 0);
          return acc;
        },
        { patientCount: 0, netAmount: 0 }
      );
    }

    if (reportType === 12 || reportType === 13) {
      return data.reduce(
        (acc, cur) => {
          acc.opening += Number(cur?.OpeningAmount || 0);
          acc.billing += Number(cur?.CurrentBillingAmount || 0);
          acc.received += Number(cur?.CurrentReceivedAmount || 0);
          acc.balance += Number(cur?.ClosingBalance || 0);
          return acc;
        },
        { opening: 0, billing: 0, received: 0, balance: 0 }
      );
    }

    if (reportType === 15) {
      return {};
    }
  };

  const totals = calculateTotals(tableData, payload?.ReportType);

  const renderTotalsHeader = () => {
    if (tableData.length === 0) return null;

    if (
      payload?.ReportType === 1 ||
      payload?.ReportType === 2 ||
      payload?.ReportType === 3
    ) {
      return (
        <div
          className="d-flex justify-content-between align-items-center pt-1 px-2"
          style={{ gap: "10px" }}
        >
          <div style={{ fontWeight: "bold", display: "flex", gap: "12px" }}>
            <span>
              Gross:{" "}
              <span style={{ color: "#dc3545" }}>
                {formatAmount(totals.gross)}
              </span>
            </span>
            <span>|</span>
            <span>
              Discount:{" "}
              <span style={{ color: "#dc3545" }}>
                {formatAmount(totals.discount)}
              </span>
            </span>
            <span>|</span>
            <span>
              Net:{" "}
              <span style={{ color: "#dc3545" }}>{formatAmount(totals.net)}</span>
            </span>
            <span>|</span>
            <span>
              Received:{" "}
              <span style={{ color: "#dc3545" }}>
                {formatAmount(totals.received)}
              </span>
            </span>
            <span>|</span>
            <span>
              Balance:{" "}
              <span style={{ color: "#dc3545" }}>
                {formatAmount(totals.balance)}
              </span>
            </span>
          </div>
        </div>
      );
    }

    if (payload?.ReportType === 4) {
      return (
        <div
          className="d-flex justify-content-between align-items-center pt-1 px-2"
          style={{ gap: "10px" }}
        >
          <div style={{ fontWeight: "bold", display: "flex", gap: "12px" }}>
            <span>
              Total Records:{" "}
              <span style={{ color: "#dc3545" }}>{tableData.length}</span>
            </span>
          </div>
        </div>
      );
    }

    if (payload?.ReportType === 5) {
      return (
        <div
          className="d-flex justify-content-between align-items-center pt-1 px-2"
          style={{ gap: "10px" }}
        >
          <div style={{ fontWeight: "bold", display: "flex", gap: "12px" }}>
            <span>
              Target:{" "}
              <span style={{ color: "#dc3545" }}>
                {formatAmount(totals?.target)}
              </span>
            </span>
            <span>|</span>
            <span>
              Achieved:{" "}
              <span style={{ color: "#dc3545" }}>
                {formatAmount(totals?.achieved)}
              </span>
            </span>
            <span>|</span>
            <span>
              Short:{" "}
              <span style={{ color: "#dc3545" }}>
                {formatAmount(totals?.short)}
              </span>
            </span>
            <span>|</span>
            <span>
              Total Records:{" "}
              <span style={{ color: "#dc3545" }}>{formatAmount(tableData.length, true)}</span>
            </span>
          </div>
        </div>
      );
    }

    if (payload?.ReportType === 6) {
      return (
        <div
          className="d-flex justify-content-between align-items-center pt-1 px-2"
          style={{ gap: "10px" }}
        >
          <div style={{ fontWeight: "bold", display: "flex", gap: "12px", flexWrap: "wrap" }}>
            <span>
              Curr Sales:{" "}
              <span style={{ color: "#dc3545" }}>
                {totals?.currSale?.toLocaleString()}
              </span>
            </span>
            <span>|</span>
            <span>
              Last Sales:{" "}
              <span style={{ color: "#dc3545" }}>
                {totals?.lastSale?.toLocaleString()}
              </span>
            </span>
            <span>|</span>
            <span>
              Total:{" "}
              <span style={{ color: "#dc3545" }}>
                {formatAmount(totals?.totalSale)}
              </span>
            </span>
            <span>|</span>
            <span>
              Diff:{" "}
              <span style={{ color: totals?.diff >= 0 ? "#28a745" : "#dc3545" }}>
                {formatAmount(totals?.diff)}
              </span>
            </span>
            <span>|</span>
            <span>
              Records: <span style={{ color: "#dc3545" }}>{formatAmount(tableData.length, true)}</span>
            </span>
          </div>
        </div>
      );
    }

    if (payload?.ReportType === 10) {
      return (
        <div
          className="d-flex justify-content-between align-items-center pt-1 px-2"
          style={{ gap: "10px" }}
        >
          <div style={{ fontWeight: "bold", display: "flex", gap: "12px" }}>
            {/* <span>
              Total Patients:{" "}
              <span style={{ color: "#28a745" }}>
                {totals?.patientCount?.toLocaleString()}
              </span>
            </span> */}
            {/* <span>|</span> */}
            <span>
              Grand Total:{" "}
              <span style={{ color: "#007bff" }}>
                {formatAmount(totals?.netAmount)}
              </span>
            </span>
            <span>|</span>
            <span>
              Test Count:{" "}
              <span style={{ color: "#dc3545" }}>{formatAmount(totals?.patientCount, true)}</span>
            </span>
          </div>
        </div>
      );
    }

    if (payload?.ReportType === 15) {
      return null;
    }

    if (payload?.ReportType === 12 || payload?.ReportType === 13) {
      return (
        <div
          className="d-flex justify-content-between align-items-center pt-1 px-2"
          style={{ gap: "10px" }}
        >
          <div style={{ fontWeight: "bold", display: "flex", gap: "12px" }}>
            <span>
              Opening:{" "}
              <span style={{ color: "#dc3545" }}>
                {formatAmount(totals.opening)}
              </span>
            </span>
            <span>|</span>
            <span>
              Billing:{" "}
              <span style={{ color: "#dc3545" }}>
                {formatAmount(totals.billing)}
              </span>
            </span>
            <span>|</span>
            <span>
              Received:{" "}
              <span style={{ color: "#dc3545" }}>
                {formatAmount(totals.received)}
              </span>
            </span>
            <span>|</span>
            <span>
              Closing:{" "}
              <span style={{ color: "#dc3545" }}>
                {formatAmount(totals.balance)}
              </span>
            </span>
          </div>
        </div>
      );
    }

    return null;
  };

  const renderReportTable = () => {
    const type = payload?.ReportType;
    console.log("Report type ", type)

    // 1, 2, 3: Datewise, single line, ratetype
    if ([1, 2, 3].includes(type)) {
      return (
        <Tables>
          <thead>
            <tr>
              <th style={{width:"5%"}}>{t("S.No")}</th>
              <th>{t("Sales Manager")}</th>
              {type === 1 && <th>{t("Bill Date")}</th>}
              {type === 3 && <th>{t("Rate Type")}</th>}
              {type === 3 && <th>{t("Doctor")}</th>}
              <th>{t("Gross Amount")}</th>
              <th>{t("Discount Amount")}</th>
              <th>{t("Net Amount")}</th>
              <th>{t("Received Amount")}</th>
              <th>{t("Balance Amount")}</th>
            </tr>
          </thead>
          <tbody>
            {/* Added table */}
            {paginatedTableData?.map((ele, index) => {
              const showSalesManager = index === 0 || ele?.SalesManager !== tableData[index - 1]?.SalesManager;
              return (
                <tr key={index}>
                  <td>{(currentPage - 1) * pageSize + index + 1}</td>
                  <td>{showSalesManager ? ele?.SalesManager : ""}</td>
                  {type === 1 && <td>{ele?.BillDate}</td>}
                  {type === 3 && (
                    <td>{ele?.SourceType === "Doctor" ? "" : ele?.RateType}</td>
                  )}
                  {type === 3 && (
                    <td>{ele?.SourceType === "Doctor" ? ele?.RateType : ""}</td>
                  )}
                  <td className="text-end">{formatAmount(ele?.GrossAmount)}</td>
                  <td className="text-end">{formatAmount(ele?.DiscountAmount)}</td>
                  <td className="text-end">{formatAmount(ele?.NetAmount)}</td>
                  <td className="text-end">{formatAmount(ele?.ReceivedAmount)}</td>
                  <td className="text-end">{formatAmount(ele?.BalanceAmount)}</td>
                </tr>
              );
            })}
          </tbody>
        </Tables>
      );
    }

    // 4: Business  < 1000
    if (type === 4 || type === 14) {
      return (
        <Tables style={{ height: "400px" }}>
          <thead>
            <tr>
              <th>{t("S.No")}</th>
              <th>{t("Sales Manager")}</th>
              <th>{t("Business Unit")}</th>
              <th>{t("Rate Type")}</th>
              <th>{t("Panel Group")}</th>
              <th >{t("Mobile")}</th>
              <th>{t("Email")}</th>
              <th>{t("Contact Person")}</th>
              <th>{t("Last Working Date")}</th>
              <th>{t("Amount")}</th>
              <th>{t("Average Amount")}</th>
            </tr>
          </thead>
          <tbody>
            {/* Added Table */}
            {paginatedTableData?.map((ele, index) => {

              const prevRow = paginatedTableData[index - 1];

              const showSalesManager =
                index === 0 || ele?.SalesManager !== prevRow?.SalesManager;

              const showBusinessUnit =
                index === 0 ||
                ele?.SalesManager !== prevRow?.SalesManager ||
                ele?.BusinessUnit !== prevRow?.BusinessUnit;

              return (
                <tr key={index}>
                  <td>{(currentPage - 1) * pageSize + index + 1}</td>

                  <td>{showSalesManager ? ele?.SalesManager : <p style={{ color: "red" }}>{'""'}</p>}</td>

                  <td>{showBusinessUnit ? ele?.BusinessUnit : <p style={{ color: "red" }}>{'""'}</p>}</td>

                  <td>{ele?.RateTypeName}</td>
                  
                  <td>{ele?.PanelGroup}</td>
                  <td>
                    {ele?.Mobile ? (
                      <div className="d-flex align-items-center">
                        <a
                          href={`tel:${ele.Mobile}`}
                          rel="noopener noreferrer"
                          className="me-2"
                          onClick={(e) => e.stopPropagation()}
                          title="Click to Call"
                        >
                          <i
                            className="fa-solid fa-mobile-screen"
                            style={{
                              color: "#000",
                              fontSize: "16px",
                              cursor: "pointer"
                            }}
                          ></i>
                        </a>

                        <span>{ele?.Mobile}</span>
                      </div>
                    ) : (
                      " "
                    )}
                  </td>

                  <td>
                    {ele?.Email ? (
                      <div
                        className="d-flex align-items-center"
                        style={{ gap: "5px", width: "fit-content" }}
                      >
                        <a
                          href={`mailto:${ele.Email}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="me-2"
                          onClick={(e) => e.stopPropagation()}
                          title="Send Email"
                        >
                          <img
                            src={gmail}
                            height="14px"
                            alt="gmail"
                            style={{ cursor: "pointer" }}
                          />
                        </a>

                        <Tooltip label={ele?.Email}>
                          <span
                            id={`email-${index}`}
                            style={{
                              cursor: "pointer",
                              maxWidth: "150px",
                              display: "inline-block",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {ele?.Email}
                          </span>
                        </Tooltip>
                      </div>
                      
                    ) : (
                      " "
                    )}
                  </td>


                  <td>{ele?.Contact_Person || "-"}</td>
                  <td>{ele?.LwD || "-"}</td>
                  <td className="text-end">{formatAmount(ele?.Amount)}</td>
                  <td className="text-end">{formatAmount(ele?.AverageAmt)}</td>
                </tr>
              );
            })}

          </tbody>
        </Tables>
      );
    }

    // 5: Daily Status
    if (type === 5) {
      return (
        <Tables>
          <thead>
            <tr>
              <th>{t("S.No")}</th>
              <th>{t("Sales Manager")}</th>
              <th>{t("Date")}</th>
              <th>{t("Target")}</th>
              <th>{t("Achieved")}</th>
              <th>{t("AchievedPer")}</th>
              <th>{t("Short")}</th>
              <th>{t("ShortPer")}</th>
            </tr>
          </thead>
          <tbody>
            {paginatedTableData?.map((ele, index) => {
              const achievedPer = Number(ele?.AchievedPer) || 0;
              const isSuccess = achievedPer >= 100;
              return (
                <tr key={index}>
                  <td>{(currentPage - 1) * pageSize + index + 1}</td>
                  <td>{ele?.ProName}</td>
                  <td>{ele?.MonthYear}</td>
                  <td>{ele?.Target}</td>
                  <td>{ele?.Achieved?.toFixed(2)}</td>
                  <td>
                    <div style={{
                      backgroundColor: isSuccess ? "#b1ffa1ff" : "#ffd9d9ff",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "2px 5px",
                      fontWeight: "600",
                      color: isSuccess ? "#1c9222ff" : "#c53030",
                    }}>
                      {achievedPer.toFixed(2)}%
                      {isSuccess ? <FaArrowTrendUp size={12} /> : <FaArrowTrendDown size={12} />}
                    </div>
                  </td>
                  <td>{ele?.Short?.toFixed(2)}</td>
                  <td>{ele?.ShortPer?.toFixed(2)}%</td>
                </tr>
              );
            })}
          </tbody>
        </Tables>
      );
    }

    // 6: Growth Report
    if (type === 6) {
      return (
        <Tables>
          <thead>
            <tr>
              <th>{t("S No.")}</th>
              <th>{t("Sales Manager")}</th>
              <th>{t("Current Year")}</th>
              <th>{t("Current Sales")}</th>
              <th>{t("Last Year")}</th>
              <th>{t("Last Sales")}</th>
              <th>{t("Total Sale")}</th>
              <th>{t("Diff")}</th>
              <th>{t("Sales Per")}</th>
            </tr>
          </thead>
          <tbody>
            {paginatedTableData?.map((ele, index) => {
              return (
                <tr key={index}>
                  <td data-title={"S No."}>{index + 1}</td>
                  <td data-title={"Sales Manager"}>{ele?.PROName ?? ""}</td>
                  <td data-title={"Current Year"}>{ele?.CurrentYear}</td>
                  <td data-title={"Current Sales"}>{ele?.Curr_Sale}</td>
                  <td data-title={"Last Year"}>{ele?.LastYear || "-"}</td>
                  <td data-title={"Last Sales"}>{ele?.Last_Sale || "-"}</td>
                  <td data-title={"Total Sale"}>{ele?.TotalSale || "-"}</td>
                  <td data-title={"Diff"}>{ele?.diff || "-"}</td>
                  <td data-title={"Sales Per"}>{ele?.SalePer?.toFixed(2)}</td>
                </tr>
              );
            })}
          </tbody>
        </Tables>
      );
    }

    // 8: Sales Executive VS Client
    if (type === 8) {
      const staticKeys = [
        "SalesManager",
        "FieldBoy",
        "ClientName",
        "SrNo",
        "S_No",
        "S.No",
        "S No.",
      ];

      const dynamicKeys = tableData.length > 0
        ? Object.keys(tableData[0]).filter(key => !staticKeys.includes(key))
        : [];

      return (
        <Tables>
          <thead>
            <tr>
              <th>{t("S No.")}</th>
              <th>{t("Sales Manager")}</th>
              <th>{t("Client Name")}</th>
              {dynamicKeys.map((key) => (
                <th key={key}>
                  {key.replace("_", " ")}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paginatedTableData?.map((ele, index) => (
              <tr key={index}>
                <td>{(currentPage - 1) * pageSize + index + 1}</td>
                <td>{ele?.SalesManager || "-"}</td>
                <td>{ele?.ClientName || "-"}</td>
                {dynamicKeys.map((key) => (
                  <td key={key} data-title={key.replace("_", " ")}>
                    {typeof ele[key] === 'number' ? ele[key].toLocaleString() : (ele[key] || "0")}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </Tables>
      );
    }
    //9: 
    if (type === 9) {
      return (
        <div className="table-responsive">
          <Tables>
            <thead>
              <tr>
                <th>{t("S No.")}</th>
                <th>{t("Sales Manager")}</th>
                <th>{t("Rate Type")}</th>
                <th>{t("Client Code")}</th>
                <th>{t("Test Name")}</th>
                <th>{t("Test Count")}</th>
                <th>{t("Net Amount")}</th>
                <th>{t("Month Label")}</th>
              </tr>
            </thead>
            <tbody>
              {paginatedTableData?.map((ele, index) => {
                return (
                  <tr key={index}>
                    <td data-title={t("S No.")}>{index + 1}</td>
                    <td data-title={t("Sales Manager")}>{ele?.SalesManager || "-"}</td>
                    <td data-title={t("Rate Type")}>{ele?.PanelName || "-"}</td>
                    <td data-title={t("Client Code")}>{ele?.Client_Code || "-"}</td>
                    <td data-title={t("Test Name")}>
                      <small>{ele?.TestName}</small>
                    </td>
                    <td data-title={t("Test Count")} className="text-center">
                      {ele?.TestCount}
                    </td>
                    <td data-title={t("Net Amount")} className="text-end fw-bold">
                      {ele?.NetAmount?.toLocaleString()}
                    </td>
                    <td data-title={t("Date")}>
                      <span className="badge bg-light text-dark border">
                        {ele?.DATE?.replace("_Sale", "")}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </Tables>
        </div>
      );
    }
    if (type === 11) {
      const fixedColumns = ["ReportingManager", "SalesManager", "FieldBoy"];
      const excludedColumns = ["SrNo", "CreditDays", "SequenceNo", "RateTypeCode", ...fixedColumns];

      const dynamicKeys =
        tableData.length > 0
          ? Object.keys(tableData[0]).filter((k) => !excludedColumns.includes(k))
          : [];

      const allKeys = [...fixedColumns, ...dynamicKeys];

      const noSortColumns = ["ReportingManager", "SalesManager", "FieldBoy", "RateTypeName"];

      // Columns that need width constraints
      const narrowColumns = ["ReportingManager", "SalesManager", "FieldBoy", "RateTypeName"];

      // Helper function to get column style
      const getColumnStyle = (key, isSortable) => {
        const baseStyle = { cursor: isSortable ? "pointer" : "default", textAlign: "center", verticalAlign: "middle" };
        if (narrowColumns.includes(key)) {
          return {
            ...baseStyle,
            maxWidth: "150px",
            minWidth: "120px",
            whiteSpace: "normal",
            wordWrap: "break-word"
          };
        }
        return baseStyle;
      };

      // Helper function to format cell value (handle semicolon-separated names)
      const formatCellValue = (key, value) => {
        if (["ReportingManager", "SalesManager", "FieldBoy"].includes(key) && value && typeof value === 'string' && value.includes(';')) {
          // Split by semicolon and display each on a new line
          return value.split(';').map((item, idx) => (
            <div key={idx}>{item.trim()}</div>
          ));
        }
        return value;
      };

      return (
        <Tables>
          <thead>
            <tr>
              <th onClick={() => requestSort("SrNo")} style={{ cursor: "pointer", textAlign: "center", verticalAlign: "middle" }}>
                {t("S.No")} {sortConfig.key === "SrNo" && (sortConfig.direction === "ascending" ? <FaSortUp /> : <FaSortDown />)}
              </th>
              {allKeys.map((key) => {
                const isSortable = !noSortColumns.includes(key);
                return (
                  <th
                    key={key}
                    onClick={isSortable ? () => requestSort(key) : undefined}
                    style={getColumnStyle(key, isSortable)}
                  >
                    {key.replace(/([A-Z])/g, ' $1').trim()}
                    {totals[key] > 0 && (
                      <>
                        <br />
                        <span className="text-primary small">
                          {typeof totals[key] === 'number' ? totals[key]?.toLocaleString('en-IN') : totals[key]}
                        </span>
                      </>
                    )}
                    {isSortable && (
                      <span className="ms-1">
                        {sortConfig.key === key ? (
                          sortConfig.direction === "ascending" ? <FaSortUp /> : <FaSortDown />
                        ) : (
                          <FaSort />
                        )}
                      </span>
                    )}
                  </th>
                )
              })}
            </tr>
          </thead>
          <tbody>
            {paginatedTableData?.map((ele, index) => {
              // Check if we should show the value or "" for grouped columns
              const shouldShowValue = (key) => {
                if (!["ReportingManager", "SalesManager", "FieldBoy"].includes(key)) {
                  return true; // Always show non-grouped columns
                }

                // Debug logging for first row when filter is active
                if (showBalanceOnly && payload?.ReportType === 11 && index === 0) {
                  console.log(`Filter active, index 0, key: ${key}, value: ${ele[key]}, showing: true`);
                }

                // If filter is active and we're at the first row of first page, always show
                if (showBalanceOnly && payload?.ReportType === 11 && currentPage === 1 && index === 0) {
                  return true;
                }

                // Always show value at the first row of any page (index 0)
                if (index === 0) {
                  return true;
                }

                // For subsequent rows, show value only if different from previous row
                return paginatedTableData[index - 1]?.[key] !== ele?.[key];
              };

              // Calculate S.No based on whether filter is active
              const serialNumber = showBalanceOnly && payload?.ReportType === 11
                ? index + 1 + (currentPage - 1) * pageSize // Start from 1 for filtered data
                : ele?.SrNo || (currentPage - 1) * pageSize + index + 1;

              return (
                <tr key={index}>
                  <td style={{ textAlign: "center", verticalAlign: "middle" }}>{serialNumber}</td>
                  {allKeys.map((key) => {
                    const shouldShow = shouldShowValue(key);
                    let displayValue = shouldShow ? formatCellValue(key, ele[key]) : '""';

                    // Format numeric values and show '-' for zero
                    if (shouldShow && !["ReportingManager", "SalesManager", "FieldBoy", "RateTypeName"].includes(key)) {
                      const numValue = Number(ele[key]);
                      if (!isNaN(numValue)) {
                        displayValue = numValue === 0 ? '-' : numValue.toLocaleString('en-IN');
                      }
                    }

                    // Debug for name columns at index 0 when filter is active
                    if (showBalanceOnly && payload?.ReportType === 11 && index === 0 &&
                      ["ReportingManager", "SalesManager", "FieldBoy"].includes(key)) {
                      console.log(`Rendering ${key}:`, {
                        index,
                        shouldShow,
                        rawValue: ele[key],
                        displayValue,
                        currentPage
                      });
                    }

                    return (
                      <td
                        key={key}
                        style={narrowColumns.includes(key) ? {
                          maxWidth: "150px",
                          minWidth: "120px",
                          whiteSpace: "normal",
                          wordWrap: "break-word",
                          textAlign: "center",
                          verticalAlign: "middle"
                        } : {
                          textAlign: "center",
                          verticalAlign: "middle"
                        }}
                      >
                        {displayValue}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </Tables>
      );
    }

    if (type === 10) {
      const fixedColumns = ["SrNo", "SalesManager", "DepartmentName", "PatientCount", "NetAmount", "MySQLDate", "MONTH", "Net Amount"];
      const dynamicKeys = tableData.length > 0
        ? Object.keys(tableData[0]).filter((key) => !fixedColumns.includes(key))
        : [];

      // Calculate totals for dynamic columns
      const totals = dynamicKeys.reduce((acc, key) => {
        acc[key] = tableData.reduce((sum, row) => sum + (Number(row[key]) || 0), 0);
        return acc;
      }, {});

      return (
        <div className="table-responsive">
          <Tables>
            <thead>
              <tr className="table-light">
                <th>{t("S No.")}</th>
                <th>{t("Sales Manager")}</th>
                <th>{t("Department")}</th>
                {/* <th className="text-end">{t("Patient Count")}</th> */}
                {/* <th className="text-end">{t("Net Amount")}</th> */}
                {dynamicKeys.map((key) => (
                  <th key={key} className="text-end">
                    {key.replace("_", " ")} <br />
                    <span className="text-primary small">
                      {totals[key]?.toLocaleString('en-IN')}
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paginatedTableData?.map((ele, index) => (
                <tr key={index}>
                  <td>{(currentPage - 1) * pageSize + index + 1}</td>
                  <td>
                    {index === 0 ||
                      paginatedTableData[index - 1]?.SalesManager !== ele?.SalesManager
                      ? ele?.SalesManager || "-"
                      : '""'}
                  </td>
                  <td className="fw-semibold">{ele?.DepartmentName}</td>
                  {/* <td className="text-end">{ele?.PatientCount?.toLocaleString()}</td> */}
                  {/* <td className="text-end">{ele?.NetAmount?.toLocaleString()}</td> */}
                  {dynamicKeys.map((key) => {
                    const value = Number(ele[key]);
                    return (
                      <td key={key} className="text-end">
                        {value === 0 ? "-" : value.toLocaleString()}
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </Tables>
        </div>
      );
    }

    if (type === 12 || type === 13) {
      return (
        <div className="table-responsive">
          <Tables>
            <thead>
              <tr>
                <th scope="col">{t("#")}</th>
                <th scope="col">{t("Business Unit")}</th>
                <th scope="col">{t("Sales Manager")}</th>
                <th scope="col">{t("Collection Boy Name")}</th>
                <th scope="col">{t("Rate Type Code")}</th>
                <th scope="col">{t("Rate Type Name")}</th>
                <th scope="col" className="text-end">{t("Opening Amount")}</th>
                <th scope="col" className="text-end">{t("Current Billing")}</th>
                <th scope="col" className="text-end">{t("Current Received Amount")}</th>
                <th scope="col" className="text-end">{t("Closing Balance")}</th>
                <th scope="col" className="text-end">{t("Credit Limit")}</th>
              </tr>
            </thead>
            <tbody>
              {paginatedTableData?.map((ele, index) => {
                const closing = Number(ele?.ClosingBalance ?? 0);
                const credit = Number(ele?.CreditLimit ?? 0);
                const overLimit = closing - credit > 0;
                return (
                  <tr key={index} style={{ backgroundColor: overLimit ? "#f1a098" : null }}>
                    <td data-title={t("#")}>{(currentPage - 1) * pageSize + index + 1}</td>
                    <td data-title={t("Business Unit")}>{ele?.BusinessUnit || "-"}</td>
                    <td data-title={t("Sales Manager")}>{ele?.SalesManager || "-"}</td>
                    <td data-title={t("Collection Boy Name")}>{ele?.FeildBoy || "-"}</td>
                    <td data-title={t("Rate Type Code")}>{ele?.RateTypeCode || "-"}</td>
                    <td data-title={t("Rate Type Name")}>{ele?.RateTypeName || "-"}</td>
                    <td data-title={t("Opening Amount")} className="text-end">{formatAmount(ele?.OpeningAmount)}</td>
                    <td data-title={t("Current Billing")} className="text-end">{formatAmount(ele?.CurrentBillingAmount)}</td>
                    <td data-title={t("Current Received Amount")} className="text-end">{formatAmount(ele?.CurrentReceivedAmount)}</td>
                    <td data-title={t("Closing Balance")} className="text-end fw-bold">{formatAmount(ele?.ClosingBalance)}</td>
                    <td data-title={t("Credit Limit")} className="text-end">{formatAmount(ele?.CreditLimit)}</td>
                  </tr>
                );
              })}
            </tbody>
          </Tables>
        </div>
      );
    }

    if (type === 15) {
      if (tableData.length === 0) return <NoRecordFound />;

      const excludedKeys = ["SrNo", "S_No", "S.No", "S No.", "SequenceNo", "TotalTarget","TotalGap","TotalAchieved","TotalRecovery"];
      const dynamicKeys = Object.keys(tableData[0]).filter(key => !excludedKeys.includes(key));

      const isNumericColumn = (key) => typeof tableData[0][key] === 'number';

      return (
        <div className="table-responsive">
          <Tables>
            <thead>
              <tr className="table-light">
                <th scope="col" style={{ width: "5%" }}>{t("S.No")}</th>
                {dynamicKeys.map((key) => {
                  let headerName = key.replace(/([A-Z])/g, ' $1').trim();
                  if (key === 'ProCode') headerName = 'Manager Code';
                  if (key === 'ProName') headerName = 'Manager Name';
                  return (
                    <th key={key} scope="col" className={isNumericColumn(key) ? "text-end" : ""}>
                      {t(headerName)}
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {paginatedTableData?.map((ele, index) => (
                <tr key={index} className="align-middle">
                  <td>{(currentPage - 1) * pageSize + index + 1}</td>
                  {dynamicKeys.map((key) => {
                    const value = ele[key];
                    const isNumber = typeof value === 'number';
                    const lowerKey = key.toLowerCase();

                    if (lowerKey === 'status') {
                       const statusVal = value?.toString().toLowerCase() || "";
                       const isAchieved = statusVal.includes('achieved') || statusVal === 'yes';
                       
                       const badgeStyle = isAchieved 
                         ? { backgroundColor: '#d4edda', color: '#155724', fontSize: '13px', padding: '6px 10px', fontWeight: '600' }
                         : { backgroundColor: '#f8d7da', color: '#721c24', fontSize: '13px', padding: '6px 10px', fontWeight: '600' };

                       return (
                         <td key={key}>
                           <span className="badge" style={badgeStyle}>
                             {isAchieved ? "▲ " : "▼ "}
                             {value || "-"}
                           </span>
                         </td>
                       );
                    }

                    let textClass = "";
                    if (isNumber) {
                      textClass = "text-end ";
                      if (lowerKey.includes('gap')) {
                        if (value < 0) textClass += "text-success fw-bold";
                        else if (value > 0) textClass += "text-danger fw-bold";
                      } else if (lowerKey.includes('achieved')) {
                        textClass += "fw-bold text-primary";
                      } else if (lowerKey.includes('recovery')) {
                        textClass += "text-success fw-bold";
                      }
                    }

                    return (
                      <td key={key} className={textClass.trim()}>
                        {isNumber ? `${value.toLocaleString('en-IN', { minimumFractionDigits: lowerKey.includes('recovery') ? 2 : 0 })}${lowerKey.includes('recovery') ? '%' : ''}` : (value ?? "-")}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </Tables>
        </div>
      );
    }

    return <NoRecordFound />;
  };

  const handleExport = () => {
    setIsExportLoading(true);

    const apiPayload = {
      dtFrom: payload?.fromDate
        ? formatStandardDate(payload.fromDate, "YYYY-MM-DD")
        : "",
      rateTypeID: Array.isArray(payload?.rateType) ? payload.rateType.map(Number) : [],
      centerId: Array.isArray(payload?.ItemData) ? payload.ItemData.map(Number) : [],
      ProEmployeeID: Array.isArray(payload?.ProEmployee) ? payload.ProEmployee.map(Number) : [],
      employeeID: "",
    };

    axiosReport
      .post("SalesHierarchy/BackDateOutstandingExcel", apiPayload, { responseType: 'blob' })
      .then((res) => {

        const url = window.URL.createObjectURL(
          new Blob([res.data], {
            type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          })
        );

        // Create temporary link
        const link = document.createElement("a");
        link.href = url;

        // File name
        link.setAttribute("download", "BackDateOutstanding.xlsx");

        // Trigger download
        document.body.appendChild(link);
        link.click();

        // Cleanup
        link.remove();
        window.URL.revokeObjectURL(url);

      })
      .catch((err) => {
        toast.error("Failed to export data");
        console.log("Export error", err);
      })
      .finally(() => {
        setIsExportLoading(false);
      });
  };

  const handleTargetAchievementDownload = (format) => {
    if (format === "Pdf") {
      setIsPdfLoading(true);
    } else {
      setIsExcelLoading(true);
    }

    const apiPayload = {
      reportType: 1,
      fromDate: formatStandardDate(payload?.fromDate, "YYYY-MM-DD"),
      toDate: formatStandardDate(payload?.toDate, "YYYY-MM-DD"),
      prevFromDateStart: formatStandardDate(payload?.prevFrom, "YYYY-MM-DD"),
      prevFromDateEnd: formatStandardDate(payload?.prevTo, "YYYY-MM-DD"),
      itemId: payload?.itemId ? [Number(payload?.itemId)] : [],
      centreID: payload?.ItemData || [],
      rateTypeID: payload?.rateType || [],
      department: payload?.department || [],
      salesManagerID: payload?.ProEmployee || [],
      individual: Number(payload?.individual) || 0,
      reportFormat: format,
    };

    axiosReport
      .post("SalesHierarchy/GetTargetAchievementHierarchyReport", apiPayload, { responseType: 'blob' })
      .then(async (res) => {
        const blob = res?.data;

        if (!blob || blob.size === 0) {
          toast.error("No data found");
          return;
        }

        const contentType = res.headers?.["content-type"] || "";
        if (contentType.includes("application/json")) {
          const text = await blob.text();
          const json = JSON.parse(text);
          toast.error(json?.message || "No data found");
          return;
        }

        if (format === "Pdf") {
          const pdfBlob = new Blob([blob], { type: "application/pdf" });
          const fileUrl = window.URL.createObjectURL(pdfBlob);
          window.open(fileUrl, "_blank");
          setTimeout(() => window.URL.revokeObjectURL(fileUrl), 10000);
        } else {
          const fileName = `TargetAchievementReport_${new Date().getTime()}.xlsx`;
          const fileUrl = window.URL.createObjectURL(blob);
          const link = document.createElement("a");
          link.href = fileUrl;
          link.setAttribute("download", fileName);
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          window.URL.revokeObjectURL(fileUrl);
        }
        toast.success("Report generated successfully");
      })
      .catch((err) => {
        toast.error("Failed to generate report");
        console.log("Download error", err);
      })
      .finally(() => {
        if (format === "Pdf") {
          setIsPdfLoading(false);
        } else {
          setIsExcelLoading(false);
        }
      });
  };
  console.log("pageSize", pageSize, totalCount, currentPage);
  console.log("payload", payload);

  return (
    <>
      <div className="card ledger_rolling">
        <Heading title={t("Sales Manager Mis")} />

        {/* Filters */}
        <div className="row px-2 py-2">
          <div className="col-sm-2 col-6">
            <ReactSelect
              dynamicOptions={ReportTypeOptions}
              name={"ReportType"}
              id={"ReportType"}
              label="ReportType"
              value={payload?.ReportType}
              onChange={handleChange}
              placeholderName={"ReportType"}
              respclass={""}
            />
          </div>
          {payload?.ReportType === 14 && <div className="col-sm-1 col-6">
            <Input
              className="select-input-box form-control input-sm"
              type="text"
              name="days"
              id="days"
              lable={"Days"}
              value={payload?.days}
              onChange={handleChange}
            />

          </div>}
          {payload?.ReportType !== 13 && payload?.ReportType !== 14 && (
            <div className="col-md-2 col-sm-3 col-12">
              <DatePicker
                className="custom-calendar"
                name="fromDate"
                id="fromDate"
                placeholder="From Date"
                lable={t("From Date")}
                type="date"
                value={payload.fromDate}
                onChange={dateSelect}
                maxDate={new Date()}
              />
            </div>
          )}
          {payload?.ReportType !== 11 && payload?.ReportType !== 14 && (
            <div className="col-md-2 col-sm-3 col-12">
              <DatePicker
                className="custom-calendar"
                name="toDate"
                id="toDate"
                placeholder="To Date"
                lable={payload?.ReportType === 13 ? t("On Date") : t("To Date")}
                type="date"
                value={payload.toDate}
                onChange={dateSelect}
                maxDate={new Date()}
              />
            </div>
          )}
          {(payload.ReportType === 6 ) && (
            <div className="col-md-2 col-sm-3 col-12">
              <DatePicker
                className="custom-calendar"
                name="prevFrom"
                id="prevFrom"
                placeholder="Previous From"
                lable={t("Previous From")}
                type="date"
                value={payload.prevFrom}
                onChange={dateSelect}
                maxDate={new Date()}
              />
            </div>
          )}
          {(payload.ReportType === 6 ) && (
            <div className="col-md-2 col-sm-3 col-12">
              <DatePicker
                className="custom-calendar"
                name="prevTo"
                id="prevTo"
                placeholder="Previous To"
                lable={t("Previous To")}
                type="date"
                value={payload.prevTo}
                onChange={dateSelect}
                maxDate={new Date()}
              />
            </div>
          )}
          <div className="col-sm-2">
            <MultiSelectComp
              name="ItemData"
              placeholder=" "
              label="Centre"
              id="Centre"
              options={Centre}
              value={payload?.ItemData}
              onChange={handleMultiSelectChange}
            />
          </div>
          {payload?.ReportType === 9 && (
            <div className="col-sm-2">
              <ReactSelect
                dynamicOptions={Tests}
                name="itemId"
                lable={t("Select Tests")}
                id="itemId"
                removeIsClearable={true}
                placeholderName={t("Select Tests")}
                value={payload?.itemId}
                onChange={handleReactSelectChange}
              />
            </div>
          )}
          <div className="col-md-2 col-sm-3 col-12">
            <ReactSelect
              dynamicOptions={dropdownList?.rateTypeList}
              name="rateType"
              lable={t("Rate Type")}
              id="rateType"
              removeIsClearable={true}
              placeholderName={t("Rate Type")}
              value={payload?.rateType}
              onChange={handleReactSelectChange}
            />
          </div>
          {payload.ReportType === 10 && (
            <div className="col-sm-2">
              <MultiSelectComp
                label="All Department"
                options={Department}
                value={payload?.department}
                name="department"
                id="department"
                onChange={handleMultiSelectChange}
                lable={t("Select Department")}
              />
            </div>
          )}
         
          <div className="col-sm-2 col-6">
            <MultiSelectComp
              label={t("ProEmployee")}
              options={proEmployee}
              value={payload?.ProEmployee}
              name="ProEmployee"
              id="ProEmployee"
              onChange={handleMultiSelectChange}
            />
          </div>

          {/* <div className="col-sm-1"> */}
          {/* <button
              onClick={SalesManagerMisSearch}
              className="btn btn-block btn-info btn-sm"
            >
              {t("Search")}
            </button> */}
          {/* <div
            style={{ minWidth: "fit-content" }}
            className="col-sm-1 mb-1 d-flex align-items-center"
          > */}
          {(payload.ReportType === 8 ) && (
            <Form.Check
              type="switch"
              id="individual"
              name="individual"
              label={t("individual")}
              checked={payload?.individual}
              onChange={(e) => handleChanges(e)}
              className="ml-2 mr-5"
            />
          )}
          {/* </div> */}
          {payload.ReportType !== 11 && (
            <SearchButton text="Search" onClick={SalesManagerMisSearch} loading={isSearchLoading} className="mr-2 ml-2" />
          )}
          
          {payload.ReportType !== 11 && payload.ReportType !== 15 && (
            <CustomButton text="Excel" className="mr-2" icon="excel"
              onClick={() => ExportToExcel(tableData)}
            />
          )}

          {payload.ReportType === 11 && (
            <CustomButton text="Excel Export" className="mr-2" onClick={handleExport} icon="excel" loading={isExportLoading} />
          )}

          {payload.ReportType === 15 && (
            <>
              <CustomButton
                text={t("PDF")}
                onClick={() => handleTargetAchievementDownload("Pdf")}
                loading={isPdfLoading}
                icon="pdf"
                className="mr-2"
              />
              <CustomButton
                text={t("Excel")}
                onClick={() => handleTargetAchievementDownload("Excel")}
                loading={isExcelLoading}
                icon="excel"
                className="mr-2"
              />
            </>
          )}
          {/* </div> */}
        </div>
        <Accordion
          title={t("Search Detail")}
          seconTitle={renderTotalsHeader()}
          defaultValue={true}
          linkTo={"#"}
          linkTitle={
            <>
              {payload?.ReportType === 11 && (
                <div className="d-flex align-items-center" style={{ gap: "8px" }}>
                  <input
                    type="checkbox"
                    id="balanceFilter"
                    checked={showBalanceOnly}
                    onChange={(e) => {
                      e.stopPropagation();
                      setShowBalanceOnly(e.target.checked);
                      setCurrentPage(1); // Reset to first page when filter changes
                    }}
                    onClick={(e) => e.stopPropagation()}
                  />
                  <label
                    htmlFor="balanceFilter"
                    style={{ margin: 0, cursor: "pointer", userSelect: "none" }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    {t("Balance Amount > 0")}
                  </label>
                </div>
              )}
            </>
          }
        >
          <div className="card px-2 py-2">
            {tableData?.length > 0 ? renderReportTable() : <NoRecordFound />}
          </div>

        </Accordion>
        {tableData?.length > 0 && (
          <div className="d-flex flex-wrap justify-content-end">
            <Pagination
              className="pagination-bar mb-2"
              currentPage={currentPage}
              totalCount={filteredTotalCount}
              pageSize={pageSize}
              onPageChange={(page) => {
                setCurrentPage(page)
              }}
            />
          </div>
        )}
        <div>

        </div>
      </div>
    </>
  );
};

export default SalesManagerMis;
