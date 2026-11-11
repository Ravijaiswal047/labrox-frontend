import React, { useEffect, useState } from "react";
import { SelectBoxWithCheckbox } from "../../components/formComponent/MultiSelectBox";
import LockReportModal from "./LockReportModal";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { autocompleteOnBlur, ExportToExcel, formatCurrency } from "../../utils/helpers";
import Accordion from "@app/components/UI/Accordion";
import { GetRateTypeByGlobalCentre } from "../../utils/NetworkApi/commonApi";
import Loading from "../../components/loader/Loading";
import { axiosInstance, axiosReport } from "../../utils/axiosInstance";
import NoRecordFound from "../../components/formComponent/NoRecordFound";
import Tables from "../../components/UI/customTable";
import { useTranslation } from "react-i18next";
import MultiSelectComp from "../../components/formComponent/MultiSelectComp";
import Input from "../../components/formComponent/Input";
import { defaultSearchTypes } from "../../utils/Constants";
import Heading from "../../components/UI/Heading";
import TableFilterDot from "../../components/FilterTableDot/TableFilterDot";
import CustomTable from "../../components/Table/CustomTable";
import { apiUrls } from "../../utils/apiUrls";
import { useLocalStorage } from "../../utils/hooks/useLocalStorage";
import { CustomButton, SearchButton } from "../../components/UI/CustomButton";
import FilterInput from "../../components/Filter/FilterInput";
import { formatIndianNumber, notify } from "../../utils/utils";
import AutoComplete from "../../components/formComponent/AutoComplete";
const LedgerStatus = () => {
  const navigate = useNavigate();
  const [lockreportshow, setLockReportShow] = useState(false);
  const [selectedData, setSelectedData] = useState([]);
  const [tableData, setTableData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [panelName, setPanelName] = useState([]);
  const [TestSuggestion, setTestSuggestion] = useState([]);
  const [selects, setSelects] = useState(false);
  const [selectRateType, setSelectRateType] = useState(false);
  const [rateTypeIndex, setRateTypeIndex] = useState(0);
  const [payload, setPayload] = useState({
    PanelName: [],
    centreID: [],
  });

  const InitialData = {
        BusinessUnitId: [],
        RateTypeID: 0,
        RateTypeLabel: "",
        LedgerMode: "Cash",
        DateType: '0',
        FromDate: new Date(),
        ToDate: new Date(),
        ReportType: "1"
    };
  const [CentreType, setCentreType] = useState([]);
  const today = new Date();
  const [formData, setFormData] = useState({
    FromDate: new Date(),
    ToDate: new Date(),
    CentreID: "",
    ItemValue: "",
    RateTypeID: "",
    SelectTypes: defaultSearchTypes || "",
    TestName: "",
  });

  const [dropDownList, setDropdownList] = useState({
    centreList: [],
    invoiceBillingCycleList: [],
  });
  const [dropFalse, setDropFalse] = useState(false);
  const [filterInv, setFilterInv] = useState([]);
  const [navData, setNavData] = useState({
    InvName: null,
    InvId: null,
    DataType: null,
  });
  const [showOP, setShowOP] = useState(false);
  const [MapTest, setMapTest] = useState([]);
  const [indexMatch, setIndexMatch] = useState(0);
  const [CentreData, setCentreData] = useState([]);
  const [saved, setSaved] = useState(true);
  const [filterInputValue, setFilterInputValue] = useState("");
  const [originalData, setOriginalData] = useState([]);
  const [filter, setFilter] = useState('')
  const [client, setClient] = useState([]);

   const [rateTypeSuggestions, setRateTypeSuggestions] = useState([]);
   const [searchData, setSearchData] = useState(InitialData);

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
          InvestigationID: "", // Clear InvestigationID until a suggestion is selected
        });
      }
    } else if (name === "DoctorName") {
      if (value === "") {
        setDoctorSuggestion([]);
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
  const handleSelectMultiChange = (name, value) => {
    if (name === "PanelName") {
      setPayload({ ...payload, [name]: value });
    }
  };
  const { t } = useTranslation();

  // const handleSearch = () => {
  //   setLoading(true);
  //   setTableData([]);
  //   if (payload?.PanelName == "" || payload?.PanelName?.length == 0) {
  //     toast.error("Please Select Rate Type.");
  //     setLoading(false);
  //   } else {
  //     axiosInstance
  //       .post("Accounts/LedgerStatusReport", {
  //         rateTypeId: [String(payload?.PanelName)],
  //         CentreId: [],
  //       })
  //       .then((res) => {
  //         if (res?.data?.success) setTableData(res?.data?.message);
  //         else setTableData([]);
  //         setLoading(false);
  //       })
  //       .catch((err) => {
  //         toast.error(
  //           err?.response?.data?.message
  //             ? err?.response?.data?.message
  //             : "Something Went Wrong."
  //         );
  //         setLoading(false);
  //       });
  //   }
  // };

  // const handleSearch = async () => {
  //   setLoading(true);
  //   setTableData([]);
  //   await axiosInstance
  //     .post("Accounts/LedgerStatusReport", {
  //       businessUnitIds: payload?.centreID||[],
  //       rateTypeID: String(navData?.InvId)||"",
  //       paymentModes: [String((payload?.PaymentMode))]||[],
  //       status: Number(payload?.Status)||0,
  //       colorCodeStatus: "",
  //     })
  //     .then((res) => {
  //       if (res?.data?.success) setTableData(res?.data?.message);
  //       else setTableData([]);
  //       setLoading(false);
  //     })
  //     .catch((err) => {
  //       toast.error(
  //         err?.response?.data?.message
  //           ? err?.response?.data?.message
  //           : "Something Went Wrong."
  //       );
  //       setLoading(false);
  //     });
  // };

  const handleSearch = async () => {
    try {
      // Validation (optional, if needed)
      // if (!payload?.PaymentMode || payload?.PaymentMode === "") {
      //   toast.error("Please select a payment mode.");
      //   return;
      // }

      setLoading(true);
      setTableData([]);

      const requestBody = {
        businessUnitIds: (payload?.centreID || []).map(Number),
        rateTypeID: navData?.InvId || 0,
        // paymentModes: payload?.PaymentMode
        //   ? null
        //   : [String(payload?.PaymentMode)],
        // status: Number(payload?.Status || 0),
        // colorCodeStatus: "",
      };

      const res = await axiosInstance.post(
        "Accounts/LedgerStatusReport",
        requestBody,
      );

      if (res?.data?.success) {
        setTableData(res?.data?.message || []);
        setOriginalData(res?.data?.message || []);
        // toast.success("Data fetched successfully!");
        setLoading(false);
      } else {
        setTableData([]);
        toast.warning(res?.data?.message || "No records found.");
        setLoading(false);
      }
    } catch (err) {
      console.error("LedgerStatusReport Error:", err);
      toast.error(
        err?.response?.data?.message ||
        "Something went wrong while fetching data.",
      );
    } finally {
      setLoading(false);
    }
  };
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 15;
  const totalPages = Math.ceil(tableData?.length / rowsPerPage);

  const currentData = tableData?.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage,
  );
  const handlePageChange = (newPage) => {
    if (newPage > 0 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };
  const handleSelectchangeCheck = (name, value) => {
    setPayload((prev) => ({ ...prev, [name]: value }));
  };
  const handlePdf = (id) => {
    axiosReport
      .post("commonReports/BindPUPData", { RateTypeId: id })
      .then((res) => {
        window.open(res?.data?.url, "_blank");
      })
      .catch((err) => {
        toast.error(
          err?.response?.data?.message
            ? err?.response?.data?.message
            : "Something Went Wrong.",
        );
      });
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
      case "RateType":
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

  const handleSelectChange = (event) => {
    const { name, value } = event.target;
    setPayload((prev) => ({
      ...prev,
      [name]: value,
    }));
  };
  const handleFilterInputChange = (status) => {
    setFilterInputValue(status);

    if (!status) {
      setTableData(originalData); // reset full data
      return;
    }

    const filtered = originalData.filter(
      (row) => String(row.CodeOpenStatus) === String(status),
    );

    console.log("filtered",filtered);

    setTableData(filtered);
  };

  

  const statusCount = (sType) => {
    if (!originalData || originalData.length === 0) return 0;
    return originalData.filter((item) => item?.CodeOpenStatus === sType).length;
  };
  const tableHeaders = [
    { header: "Sr No.", field: "srNo" },
    { header: "Client Name", field: "clientName" },
    { header: "Sales Manager", field: "salesManager" },
    { header: "Reporting Manager", field: "reportingManager" },
    { header: "Creation Date", field: "creationDate" },
    { header: "Contact No", field: "contactNo" },
    { header: "Opening", field: "openingBalance" },
    { header: "Curr Billing", field: "currentBilling" },
    { header: "Curr Received", field: "currentReceived" },
    { header: "Closing Balance", field: "closingBalance" },
    { header: "Credit Limit Type", field: "creditLimitType" },
    { header: "Credit Limit", field: "creditLimit" },
    { header: "Credit Days", field: "CreditDays" },
    { header: "Last Paid Date", field: "lastPaidDate" },
    { header: "Open Till", field: "openTill" },
    { header: "Lock Registration", field: "lockRegistration" },
    { header: "Lock Report", field: "lockReport" },
    { header: "Status", field: "status" },
    { header: "Type", field: "type" },
  ];

  const statusColors = {
    "Open By Credit Limit": { bg: "#fff7b2", text: "#b59c00" },
    "Open By MaxExpirey": { bg: "#ffa07a", text: "#a83300" },
    Lock: { bg: "#f08080", text: "#800000" },
    Open: { bg: "#90ee90", text: "#006400" },
    "Open-Report (Master not set)": { bg: "#add8e6", text: "#004080" },
    "Open By Credit Day of Month": { bg: "#e6ccff", text: "#5a0099" },
  };

  const formattedData = currentData.map((row, index) => {
    const colors = statusColors[row?.CodeOpenStatus] || {
      bg: "#ffffff",
      text: "#000000",
    };

    return {
      srNo: (
        <div
          onClick={() => navigate(`/LedgerTransaction/${row?.RateTypeID}`,
            { state: { id: row?.RateTypeID } }
          )}
          style={{
            color: "blue",
            textDecoration: "underline",
            cursor: "pointer",
          }}
        >
          {row?.RateTypeID}
        </div>
        // <Link
        //   to={`/LedgerTransaction/${row?.RateTypeID}`}
        //   style={{
        //     color: "blue",
        //     textDecoration: "underline",
        //     cursor: "pointer",
        //   }}
        // >
        //   {row?.RateTypeID}
        // </Link>
      ),
      rowColor: colors.bg,
      clientName: row?.RateTypeName || "",
      salesManager: row?.SalesManager || "",
      reportingManager: row?.FeildBoy || "",
      creationDate: row?.CreationDate || "",
      contactNo: row?.Mobile?.trim() || "",
      openingBalance: formatCurrency(row?.OpeningAmount || 0),
      currentBilling: formatCurrency(row?.CurrentBillingAmount || 0),
      currentReceived: formatCurrency(row?.CurrentReceivedAmount || 0),
      closingBalance: formatCurrency(row?.ClosingBalance || 0),
      creditLimitType: (
        <span
          onClick={() => {
            if (row?.ClosingBalance >= 0 && row?.LockReport === 1) {
              setLockReportShow(true)
            } else {
              setLockReportShow(false);
              notify("Closing Balance must be greater than zero and Is Lock must be enabled from Rate Type Master ", 'warn');
            }
            setSelectedData(row);
          }}
          style={{
            color: "blue",
            cursor: "pointer",
            textDecoration: "underline",
          }}
        >
          {row?.CodeOpenStatus || ""}
        </span>
      ),
      creditLimit: formatCurrency(row?.CreditLimit || 0),
      CreditDays: row?.CreditDays || 0,
      lastPaidDate: row?.LastPaidDate || "",
      openTill: row?.Upto || "",
      lockRegistration: row?.LockRegistration === 1 ? "Yes" : "No",
      lockReport: row?.LockReport === 1 ? "Yes" : "No",
      status: row?.CodeOpenStatus || "",
      type: row?.BusinessUnit || "",
    };
  });

  const getPatientType = () => {
    axiosInstance
      .get(apiUrls?.getGlobalBusinessUnit, {
        params: {
          Datatype: "BusinessUnit",
          InvoiceBillingCycle: "",
          PaymentMode: "",
          IsActive: 1,
        },
        headers: {
          accept: "*/*",
        },
      })
      .then((res) => {
        let centreList = res?.data?.message?.map((ele) => {
          return {
            value: String(ele?.CentreId),
            label: ele?.Centre,
          };
        });
        setDropdownList((prev) => ({ ...prev, centreList: centreList }));
      })
      .catch((err) => {
        console.log(err);
      });
  };

  // const getAccessCentres = (value, invoiceCycle) => {
  //   axiosInstance
  //     // .post("Accounts/GetRateTypeByGlobalCentreById", {
  //     // TypeId: "",
  //     // CentreID: Number(value || payload?.CentreID),
  //     // invoiceBillingCycle: payload?.invoiceBillingCycle,
  //     .get(apiUrls?.getGlobalBusinessUnit, {
  //       params: {
  //         Datatype: "rateType",
  //         InvoiceBillingCycle: invoiceCycle || payload?.invoiceBillingCycle,
  //         PaymentMode: "Credit",
  //         IsActive: 1,
  //       },
  //       headers: {
  //         accept: "*/*",
  //       },
  //     })
  //     .then((res) => {
  //       let data = [];
  //       if (Array.isArray(res.data.message)) {
  //         data = res?.data?.message;
  //       }
  //       let CentreDataValue = data?.map((ele) => {
  //         return {
  //           value: ele.CentreId,
  //           label: ele.Centre,
  //         };
  //       });

  //       setCentreData(CentreDataValue);
  //     })
  //     .catch((err) => {
  //       setCentreData([]);
  //       console.log(err);
  //     });
  // };


  const getAccessCentres = () => {
      axiosInstance
        .post(
          "Accounts/GetRateTypeByGlobalCentre",
          {
            // GetRateTypeByGlobalCentreById
            TypeId: "",
          },
          { params: { PaymentMode: "Credit" } },
        )
        .then((res) => {
          let data = res?.data?.message;
          let CentreDataValue = data?.map((ele) => {
            return {
              value: ele.RateTypeID,
              label: ele.RateTypeName,
            };
          });
  
          setCentreData(CentreDataValue);
        })
        .catch((err) => console.log(err));
    };
  const handleSearchChangeInv = (e) => {
    const { value } = e?.target;
    setNavData({
      ...navData,
      InvName: value,
    });
    setFilterInv(
      MapTest.filter((item) =>
        item.label.toLowerCase().includes(value.toLowerCase()),
      ),
    );
    setDropFalse(true);
  };

  const handleListSearch = (data) => {
    setNavData((prev) => ({
      ...prev,
      InvName: data?.label || "",
      InvId: data?.value || "",
      DataType: data?.DataType || "",
    }));

    setIndexMatch(0);
    setFilterInv([]);
    setDropFalse(false);
  };

  const GetRateTypeByGlobalCentre = () => {
    axiosInstance
      .post(
        "Accounts/GetRateTypeByGlobalCentre",
        {
          // GetRateTypeByGlobalCentreById
          TypeId: "",
        },
        { params: { PaymentMode: "Credit" } },
      )
      .then((res) => {
        let data = res.data.message;
        setLoading(false);

        let MapTest = data.map((ele) => {
          return {
            value: ele.RateTypeID,
            label: ele.RateTypeName,
          };
        });

        setMapTest(MapTest);
      })
      .catch((err) => console.log(err));
  };

  const isVisible = (header) =>
    dynamicFilter.find((f) => f?.header === header)?.visible;
  const [dynamicFilter, setDynamicFilter] = useState([]);
  const CentreMasterListFilter = () => {
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

  const EmployeeID = useLocalStorage("userData", "get")?.EmployeeID;
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

  const handleSelect = (event) => {
    const { name, value } = event.target;
    setPayload({ ...payload, [name]: value });
  };
  const getCentreData = () => {
    setLoading(true);
    axiosInstance
      .post("Centre/getCentreData", payload)
      .then((res) => {
        if (res.status === 200) {
          setData(res.data.message);
          setLoading(false);
        }
      })
      .catch((err) => console.log(err));
  };

  const dateSelect = (value, name) => {
    setFormData({
      ...formData,
      [name]: value,
    });
  };
  useEffect(() => {
    CentreMasterListFilter();
    getFilterResultOption();
  }, []);

  useEffect(() => {
    getPatientType();
    GetRateTypeByGlobalCentre(setPanelName);
    getAccessCentres();
    GetRateTypeByGlobalCentre();
  }, []);

  const handleFilterChange = (e) => {
    const value = e?.target?.value || "";
    setFilter(value);

    if (!value.trim()) {
      setTableData(originalData);
      return;
    }
    const lower = value.toLowerCase();
    const filtered = originalData.filter(item =>
      Object.values(item).some(field =>
        String(field || "").toLowerCase().includes(lower)
      )
    );
    setTableData(filtered);
  };

  const totalSum = (key = '') => {
    let sumAmount = tableData.reduce(
      (sum, item) => sum + Number(String(item[key] || 0).replace(/[,\s]/g, "")),
      0,
    );

    return formatCurrency(formatIndianNumber(sumAmount));
  };

const handleRateTypeChange = (e) => {
        const value = e.target.value;

        setSearchData((prev) => ({ ...prev, RateTypeLabel: value }));

        if (value.trim() === "") {
            setSelectRateType(false);
            setRateTypeSuggestions([]);
            // setSearchData((prev) => ({ ...prev, RateTypeID: 0, RateTypeLabel: "" }));
            setNavData((prev) => ({ ...prev, InvName: "", InvId : 0 }));
        } else {
            const filtered = CentreData?.filter((item) =>
                item.label.toLowerCase().includes(value.toLowerCase())
            );
            setRateTypeSuggestions(filtered);
            setSelectRateType(true);
            setNavData((prev) => ({ ...prev, InvName: value}));
        }
    };
    const handleRateTypeKeyDown = (e) => {
        if (rateTypeSuggestions.length === 0) return;

        if (e.which === 38) { // Up
            setRateTypeIndex((prev) =>
                prev > 0 ? prev - 1 : rateTypeSuggestions.length - 1
            );
        } else if (e.which === 40) { // Down
            setRateTypeIndex((prev) =>
                prev === rateTypeSuggestions.length - 1 ? 0 : prev + 1
            );
        } else if (e.which === 13) { // Enter
            handleRateTypeSelect(rateTypeSuggestions[rateTypeIndex]);
            setRateTypeIndex(0);
        }
    };

     const handleRateTypeSelect = (data) => {
        setSearchData((prev) => ({
            ...prev,
            RateTypeLabel: data.label,
            RateTypeID: data.value,
        }));
        setNavData((prev)=>({...prev, InvName : data.label, InvId: data.value}))
        setSelectRateType(false);
        setRateTypeSuggestions([]);
    };

    console.log("searchData",searchData);
    console.log("navdata",navData);

  return (
    <div>
      {lockreportshow && (
        <LockReportModal
          selectedData={selectedData}
          lockreportshow={lockreportshow}
          setLockReportShow={setLockReportShow}
          handleSearch={handleSearch}
        />
      )}
      {/* {showOP && (
        <LedgerStatusModal
          show={showOP}
          setShow={setShowOP}
          handleSelctData={handleSelctData}
        />
      )} */}
      <Accordion
        name={t("Ledger Status")}
        isBreadcrumb={true}
        defaultValue={true}
        seconTitle={
          <div
                    style={{
                      fontWeight: "bold",
                      display: "flex",
                      flexWrap: "wrap",
      gap: "4px 10px",
      alignItems: "center",
      justifyContent: "flex-start",
      fontSize: "clamp(10px, 2.5vw, 14px)"
                    }}
                  >
                    <span>
                      {t("CreditLimit")}:{" "}
                      <span style={{ color: "#dc3545" }}>
                        {totalSum('CreditLimit')}
                      </span>
                    </span>
                    <span>|</span>
                    <span>
                      {t("Opening")}:{" "}
                      <span style={{ color: "#dc3545" }}>
                        {totalSum('OpeningAmount')}
                      </span>
                    </span>
                    <span>|</span>
                    <span>
                      {t("Closing")}:{" "}
                      <span style={{ color: "#dc3545" }}>
                        {totalSum('ClosingBalance')}
                      </span>
                    </span>

                    <span>|</span>
                    <span>
                      {t("Received")}:{" "}
                      <span style={{ color: "#dc3545" }}>
                        {totalSum('CurrentReceivedAmount')}
                      </span>
                    </span>
                    <span>|</span>
                    <span>
                      {t("Billing")}:{" "}
                      <span style={{ color: "#dc3545" }}>
                        {totalSum('CurrentBillingAmount')}
                      </span>
                    </span>
                  </div>
                
        }
      >
        <div className="row px-2 mt-2 mb-1">
          <MultiSelectComp
            options={dropDownList?.centreList}
            name="centreID"
            id="centreID"
            label={t("Business Unit")}
            // placeholder={t("Business Unit")}
            value={payload?.centreID}
            className={"col-sm-2 mb-3 mb-sm-0"}
            onChange={handleSelectchangeCheck}
          />
          {/* <div className="col-sm-2">
            <Input
              autoComplete="off"
              placeholder=" "
              lable={t("Rate Type")}
              id="Search Any Test For Update"
              name="InvName"
              type="text"
              value={navData?.InvName}
              onChange={handleSearchChangeInv}
              onKeyDown={handleIndex}
              onBlur={(e) => {
                autocompleteOnBlur(setFilterInv);
                setTimeout(() => {
                  const data = filterInv.filter(
                    (ele) => ele?.label === e.target.value,
                  );
                  if (data.length === 0) {
                    setNavData({
                      ...navData,
                      InvName: "",
                      InvId: "",
                      DataType: "",
                    });
                  }
                }, 500);
              }}
            />
            {dropFalse && filterInv.length > 0 && (
              <ul className="suggestion-data" style={{ zIndex: 99 }}>
                {filterInv.map((data, index) => (
                  <li
                    onClick={() => handleListSearch(data)}
                    className={`${index === indexMatch && "matchIndex"}`}
                    key={index}
                  >
                    {data?.label}
                  </li>
                ))}
              </ul>
            )}
          </div> */}

          <div className="col-sm-2 mb-3 mb-sm-0">

            <Input
              type="text"
              name="RateTypeID"
              lable="Rate Type"
              value={navData?.InvName}
              placeholder=" "
              onChange={handleRateTypeChange}
              onKeyDown={handleRateTypeKeyDown}
              onBlur={(e) => {
                const snapshot = [...rateTypeSuggestions];
                autocompleteOnBlur(setRateTypeSuggestions);

                setTimeout(() => {
                  const typed = (e.target.value || "").trim();
                  if (!typed) {
                    setSearchData((prev) => ({ ...prev, RateTypeID: 0 }));
                    return;
                  }
                  const match = snapshot.find(
                    (ele) => ele.label.toLowerCase() === typed.toLowerCase()
                  );
                  // Fixed: Changed !match to match
                  if (match) {
                    setSearchData((prev) => ({
                      ...prev,
                      RateTypeLabel: match.label,
                      RateTypeID: Number(match.value),
                    }));
                  } else {
                    setSearchData((prev) => ({ ...prev, RateTypeID: 0 }));
                  }
                }, 200);
              }}
              // onBlur={(e) => {
              //                   autocompleteOnBlur(setRateTypeSuggestions);
              //                   setTimeout(() => {
              //                     const match = rateTypeSuggestions?.some(
              //                       (ele) =>
              //                         ele.RateTypeName.toLowerCase() ===
              //                         e.target.value.toLowerCase(),
              //                     );
              //                     if (!match)
              //                       setNavData((prev) => ({ ...prev, InvName: "" }));
              //                   }, 200);
              //                 }}
            />

            {selectRateType && rateTypeSuggestions.length > 0 && (
              <AutoComplete
                selects={selectRateType}
                test={rateTypeSuggestions.map((item) => ({
                  TestName: item.label,
                }))}
                handleListSearch={(selected) =>
                  handleRateTypeSelect(
                    rateTypeSuggestions.find(
                      (item) => item.label === selected.TestName
                    )
                  )
                }
                indexMatch={rateTypeIndex}
              />
            )}
            {/* {selectRateType && rateTypeSuggestions.length > 0 && (
                <ul className="suggestion-data" style={{ zIndex: 99 }}>
                  {rateTypeSuggestions.map((data, index) => (
                    <li
                      onClick={() => handleListSearch(data)}
                      className={`${ index === indexMatch && "matchIndex" }`}
                      key={index}
                    >
                      {data?.label}
                    </li>
                  ))}
                </ul>
              )} */}
          </div>
          {/* <div className="col-sm-2">
            <SelectBox
              lable="Payment Mode"
              options={[
                { label: t("Select Payment Mode"), value: "" },
                { label: t("Cash"), value: "1" },
                { label: t("Credit"), value: "2" },
                { label: t("Rolling Advance"), value: "3" },
              ]}
              selectedValue={payload?.PaymentMode}
              name="PaymentMode"
              onChange={handleSelectChange}
            />
          </div>
          <div className="col-sm-2">
            <SelectBox
              lable="Status"
              options={[
                { label: t("Select Status"), value: "" },
                { label: t("ALL"), value: "-1" },
                { label: t("Active"), value: "1" },
                { label: t("InActive"), value: "0" },
                { label: t("Closed"), value: "2" },
              ]}
              options={[{ label: t("Active"), value: "1" }]}
              selectedValue={payload?.Status}
              name="Status"
              onChange={handleSelectChange}
            />
          </div> */}
          <div className="col-sm-1 col-6">
            {loading ? (
              <Loading />
            ) : (
              <SearchButton
                text={"Search"}
                onClick={handleSearch}
              />
            )}
          </div>
          <div className="col-sm-1 col-6">
            <CustomButton
              text={"Excel"}
              icon={"excel"}
              onClick={() => ExportToExcel(tableData)}
              disabled={tableData?.length === 0}
            />
          </div>
        </div>
      </Accordion>
      <div className="d-flex align-items-center justify-content-end py-1">
        <FilterInput value={filter} onChange={handleFilterChange} />
      </div>
      {/* {tableData?.length === 0 ? (
        ""
      ) : ( */}

        <div className="card mt-2">
          <Heading
            title={t("Data List")}
            secondTitle={
              <div
                className="d-flex justify-content-between align-items-center pt-1 px-2"
                style={{ gap: "10px", flexWrap: "wrap" }}
              >
                {/* Display individual sums and total */}
                <div
                  style={{ fontWeight: "bold", display: "flex", gap: "12px" }}
                >
                  {/* <div
                    style={{
                      fontWeight: "bold",
                      display: "flex",
                      gap: "10px",
                      alignItems: "center",
                    }}
                  >
                    <span>
                      {t("CreditLimit")}:{" "}
                      <span style={{ color: "#dc3545" }}>
                        {totalSum('CreditLimit')}
                      </span>
                    </span>
                    <span>|</span>
                    <span>
                      {t("Opening")}:{" "}
                      <span style={{ color: "#dc3545" }}>
                        {totalSum('OpeningAmount')}
                      </span>
                    </span>
                    <span>|</span>
                    <span>
                      {t("Closing")}:{" "}
                      <span style={{ color: "#dc3545" }}>
                        {totalSum('ClosingBalance')}
                      </span>
                    </span>

                    <span>|</span>
                    <span>
                      {t("Received")}:{" "}
                      <span style={{ color: "#dc3545" }}>
                        {totalSum('CurrentReceivedAmount')}
                      </span>
                    </span>
                    <span>|</span>
                    <span>
                      {t("Billing")}:{" "}
                      <span style={{ color: "#dc3545" }}>
                        {totalSum('CurrentBillingAmount')}
                      </span>
                    </span>
                  </div> */}
                </div>
                {/* Status filter dots */}
                <div style={{
                  gap: "4px", flexWrap: "wrap",
                  // gap: "10px",
                  alignItems: "center",
                  justifyContent: "flex-start"
                }} className="d-flex">
                  {Object.keys(statusColors).map((status) => (
                    <TableFilterDot
                      key={status}
                      onClick={() => handleFilterInputChange(status)}
                      color={statusColors[status].text}
                      bgColor={statusColors[status].bg}
                      title={`${status} (${statusCount(status)})`}
                    />
                  ))}
                </div>
              </div>
            }
          />

          <div className="row">
            <div className="col-sm-12">
              <style>{`
                .ledger-pagination {
                  display: flex;
                  align-items: center;
                  gap: 12px;
                  flex-wrap: wrap;
                }
                .ledger-pagination button {
                  padding: 6px 16px;
                  border-radius: 20px;
                  font-weight: 500;
                  font-size: 14px;
                  cursor: pointer;
                  transition: all 0.2s ease;
                  border: 1px solid #10b981;
                  background-color: transparent;
                  color: #10b981;
                }
                .ledger-pagination button:disabled {
                  border-color: #ccc;
                  background-color: #f3f4f6;
                  color: #9ca3af;
                  cursor: not-allowed;
                }
                .ledger-pagination button:not(:disabled):hover {
                  background-color: #10b981;
                  color: #fff;
                }
                .ledger-pagination button:last-of-type {
                  background-color: #10b981;
                  color: #fff;
                }
                .ledger-pagination button:last-of-type:not(:disabled):hover {
                  background-color: #059669;
                  border-color: #059669;
                }
                .ledger-pagination span {
                  font-weight: 500;
                  font-size: 14px;
                  color: #374151;
                }
                @media (max-width: 768px) {
                  .ledger-status-table #no-more-tables tr {
                    margin-bottom: 8px;
                    border-bottom: 2px solid #c5e3d4;
                    padding-bottom: 5px;
                  }
                  .ledger-pagination-container {
                    justify-content: center !important;
                    margin-top: 10px;
                    margin-bottom: 15px;
                  }
                  .ledger-pagination {
                    justify-content: center;
                    width: 100%;
                    gap: 8px;
                  }
                  .ledger-pagination button {
                    padding: 5px 12px;
                    font-size: 13px;
                  }
                  .ledger-pagination span {
                    font-size: 13px;
                  }
                }
              `}</style>
              <div className="ledger-status-table">
                <CustomTable
                  columns={tableHeaders}
                  data={formattedData}
                  rowStyle={(rowData) => ({
                    backgroundColor: rowData.rowColor,
                    color: statusColors[rowData.status]?.text || "#000000",
                  })}
                />
              </div>
            </div>
            {tableData?.length > 0 && (
              <div className="col-12 d-flex justify-content-end align-items-center ledger-pagination-container">
                <div
                  className="ledger-pagination"
                  style={{ marginBottom: "9px" }}
                >
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                  >
                    Previous
                  </button>
                  <span>
                    Page {currentPage} of {totalPages}
                  </span>
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
            
          </div>
        </div>
      {/* )} */}
    </div>
  );
};

export default LedgerStatus;
