import React, { useEffect, useState } from "react";
import { SelectBoxWithCheckbox } from "../../components/formComponent/MultiSelectBox";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import {
  autocompleteOnBlur,
  downloadExcelBlob,
  ExportToExcel,
  number,
  shouldIncludeAIIMSID,
  statusConfig,
  statusOptions,
} from "../../utils/helpers";
import Accordion from "@app/components/UI/Accordion";
import { GetRateTypeByGlobalCentre } from "../../utils/NetworkApi/commonApi";
import Loading from "../../components/loader/Loading";
import { axiosInstance, axiosReport } from "../../utils/axiosInstance";
import NoRecordFound from "../../components/formComponent/NoRecordFound";
import Tables from "../../components/UI/customTable";

import { useTranslation } from "react-i18next";
import MultiSelectComp from "../../components/formComponent/MultiSelectComp";
import Input from "../../components/formComponent/Input";
import {
  defaultSearchTypes,
  Record,
  SampleStatus,
  SearchBy,
} from "../../utils/Constants";
import { SelectBox } from "../../components/formComponent/SelectBox";
import Heading from "../../components/UI/Heading";
import TableFilterDot from "../../components/FilterTableDot/TableFilterDot";
import CustomTable from "../../components/Table/CustomTable";
import { apiUrls } from "../../utils/apiUrls";
import ReceiptReprintFilter from "../Laboratory/ReceiptReprintFilter";
import { useLocalStorage } from "../../utils/hooks/useLocalStorage";
import DatePicker from "../../components/formComponent/DatePicker";
import ReactSelect from "../../components/formComponent/ReactSelect";
import { useMemo } from "react";
import Pagination from "../../Pagination/Pagination";
import {
  CustomButton,
  SaveButton,
  SearchButton,
} from "../../components/UI/CustomButton";
import moment from "moment";
import { Dialog } from "primereact/dialog";
import TextAreaInput from "../../components/formComponent/TextAreaInput";
import { FaEye, FaUser } from "react-icons/fa";
import { MdPrint } from "react-icons/md";
import { FiFileText } from "react-icons/fi";

const EstimateRatenewList = () => {
  const theme = useLocalStorage("theme", "get");

  const [tableData, setTableData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [TestSuggestion, setTestSuggestion] = useState([]);
  const [showRemarkModal, setShowRemarkModal] = useState(false);

  const [payload, setPayload] = useState({
    PanelName: [],
    centreID: [],
  });
  const [formData, setFormData] = useState({
    FromDate: new Date(),
    ToDate: new Date(),
    ItemValue: "",
    RateTypeID: "",
    statusID: 0,
    estimateNo: "",
    SelectTypes: defaultSearchTypes || "",
    TestName: "",
  });
  const [selectedStatusFilter, setSelectedStatusFilter] = useState(null);
  const [showTestInfoModal, setShowTestInfoModal] = useState(false);
  const [testInfoData, setTestInfoData] = useState([]);
  const [showLogModal, setShowLogModal] = useState(false);
  const [logData, setLogData] = useState([]);
  const [selectedRow, setSelectedRow] = useState(null);
  const [printLoading, setPrintLoading] = useState(false)
  const [reportLoading, setReportLoading] = useState(false)

  const [modalData, setModalData] = useState({
    estimateNo: "",
    estimateNoHash: "",
    ledgerTransactionNo: "",
    statusId: null,
    remark: "",
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
  const [MapTest, setMapTest] = useState([]);
  const [indexMatch, setIndexMatch] = useState(0);
  const [originalData, setOriginalData] = useState([]);

  const [tooltipData, setTooltipData] = useState({
    testNames: [],
    position: null,
  });

  const { t } = useTranslation();
  const navigate = useNavigate();

  console.log("Nav data", navData);

  const handleSearch = async (useFilterStatus = false) => {
    try {
      setLoading(true);
      const invId = String(navData?.InvId || "");

      const requestBody = {
        businessUnitIds: payload?.centreID || [],
        rateTypeIDs: invId ? [invId] : [],
        fromDate: moment(formData?.FromDate).format("YYYY-MM-DD"),
        toDate: moment(formData?.ToDate).format("YYYY-MM-DD"),
        statusID: useFilterStatus ? Number(formData.statusID) : 0,
        estimateNo: formData?.estimateNo,
        selectTypes: formData?.SelectTypes || "",
        itemValue: formData?.ItemValue || "",
      };

      const res = await axiosInstance.post(
        "Estimatebilldetail/EstimateSearchInfo",
        requestBody
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
      console.error("Estimate Error:", err);
      toast.error(
        err?.response?.data?.message ||
        "Something went wrong while fetching data."
      );
    } finally {
      setLoading(false);
    }
  };

  const getExcelFileName = (res) => {
    const disposition = res.headers?.["content-disposition"] || "";
    const serverName = disposition
      .match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/)?.[1]
      ?.replace(/['"]/g, "")
      ?.replace(/\.xlsx$/i, "")
      ?.trim();
    if (serverName) return serverName;

    const d = new Date();
    const pad = (n) => String(n).padStart(2, "0");
    return `EstimateSearch_${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}_${pad(d.getHours())}${pad(d.getMinutes())}${pad(d.getSeconds())}`;
  };

  const handleExportToExcel = async () => {
  try {
    setLoading(true);
    const invId = String(navData?.InvId || "");

    const requestBody = {
      businessUnitIds: payload?.centreID || [],
      rateTypeIDs: invId ? [invId] : [],
      fromDate: moment(formData?.FromDate).format("YYYY-MM-DD"),
      toDate: moment(formData?.ToDate).format("YYYY-MM-DD"),
      statusID: Number(formData.statusID) || 0,
      estimateNo: formData?.estimateNo,
      selectTypes: formData?.SelectTypes || "",
      itemValue: formData?.ItemValue || "",
    };

    const res = await axiosReport.post(
      "Estimatebilldetail/GenerateEstimateSearchInfo",
      requestBody,
      { responseType: "blob" }
    );

    // ✅ Check if response is JSON (error/no-data) instead of a real Excel blob
    const contentType = res.headers?.["content-type"] || "";
    if (contentType.includes("application/json")) {
      // Parse the blob as text to read the JSON message
      const text = await res.data.text();
      const json = JSON.parse(text);
      toast.warning(json?.message || "No records found.");
      return;
    }

    // ✅ Extra guard: check blob has actual content
    if (!res.data || res.data.size === 0) {
      toast.warning("No data available to export.");
      return;
    }

    downloadExcelBlob(res.data, getExcelFileName(res));
    toast.success("Report downloaded successfully!");
  } catch (err) {
    console.error("Estimate Error:", err);

    if (err?.response?.data instanceof Blob) {
      const text = await err.response.data.text();
      try {
        const json = JSON.parse(text);
        toast.error(json?.message || "Something went wrong.");
      } catch {
        toast.error("Something went wrong while fetching data.");
      }
      return;
    }

    toast.error(
      err?.response?.data?.message || "Something went wrong while fetching data."
    );
  } finally {
    setLoading(false);
  }
};

  const handleReport = async () => {
    try {
      setReportLoading(true);
      const invId = String(navData?.InvId || "");
      const requestBody = {
        centreIds: payload?.centreID || [],
        rateTypeIDs: invId ? [invId] : [],
        fromDate: moment(formData?.FromDate).format("YYYY-MM-DD"),
        toDate: moment(formData?.ToDate).format("YYYY-MM-DD"),
        statusID: Number(formData.statusID) || 0,
        estimateNo: formData?.estimateNo || "",
      };
      const res = await axiosReport.post(
        "Estimatebilldetail/GenerateEstimateBillReport",
        requestBody,
        { responseType: "blob" }
      );
      const blob = new Blob([res.data], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      window.open(url, "_blank");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Something went wrong while generating report.");
    } finally {
      setReportLoading(false);
    }
  };

  useEffect(() => {
    if (selectedStatusFilter !== null) {
      handleSearch(true);
    }
  }, [formData.statusID]);

  const handleSelectchangeCheck = (name, value) => {
    setPayload((prev) => ({ ...prev, [name]: value }));
  };

  const handleTestInfoClick = (data) => {
    try {
      const items = JSON.parse(data.ItemArray);
      setTestInfoData(items);
      setSelectedRow(data.EstimateNo);
      setShowTestInfoModal(true);
    } catch (error) {
      console.error("Error parsing ItemArray:", error);
      toast.error("Failed to load test information");
    }
  };

  const handleSelectStatusChange = (name, value, rowData) => {
    console.log("name", name, "value", value, "rowData", rowData);
    // Convert -> open Registration pre-filled with this estimate's patient and tests
    if (value?.value === 2) {
      navigate("/patientregister", {
        state: { fromEstimate: true, estimate: rowData },
      });
      return;
    }
    if (value) {
      setSelectedRow(rowData);
      setModalData({
        estimateNo: rowData?.EstimateNo || "",
        estimateNoHash: rowData?.EstimateNoHash || "",
        ledgerTransactionNo: "",
        statusId: value?.value,
        remark: "",
      });
      setShowRemarkModal(true);
    }
  };

  const handleModalStatusChange = (name, value) => {
    setModalData((prev) => ({ ...prev, statusId: value?.value }));
  };

  const handleModalSubmit = async () => {
    try {
      const res = await axiosInstance.post(
        "Estimatebilldetail/EstimateUpdateStatus",
        { ...modalData }
      );
      const data = res?.data;
      if (data?.success) {
        setShowRemarkModal(false);
        toast.success("Remark added successfully.");
      }
      else {
        toast.error(res?.data?.message || "Error Occured");
      }
    } catch (error) {
      console.error("Estimate Error:", error);
    }
  };

  // log modal data
  const HandleLogDetails = async (data) => {
    setShowLogModal(true);
    setSelectedRow(data);
    try {
      const res = await axiosInstance.post(
        "Estimatebilldetail/EstimateSearchInfoUpdateLog",
        { EstimateNoHash: data?.EstimateNoHash }
      );
      const resData = res?.data;
      if (resData?.success) {
        setLogData(resData?.message);
      }
    } catch (error) {
      console.error("Estimate Error:", error);
      setLogData([]);
    }
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

  const statusCount = (status) => {
    if (!tableData || tableData.length === 0) return 0;
    return tableData.filter((item) => item.Status === status).length;
  };

  const getTotalCount = () => {
    return tableData.length;
  };

  const handleFilterInputChange = (status) => {
    // Toggle: if same status clicked, reset to show all
    if (selectedStatusFilter === status) {
      setSelectedStatusFilter(null);
      setFormData((prev) => ({ ...prev, statusID: 0 }));
    } else {
      setSelectedStatusFilter(status);
      setFormData((prev) => ({ ...prev, statusID: statusConfig[status].id }));
    }
  };

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

  const handleSearchChangeInv = (e) => {
    const { value } = e?.target;
    setNavData({
      ...navData,
      InvName: value,
    });
    setFilterInv(
      MapTest.filter((item) =>
        item.label.toLowerCase().includes(value.toLowerCase())
      )
    );
    setDropFalse(true);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleModalChange = (e) => {
    const { name, value } = e.target;
    setModalData({ ...modalData, [name]: value });
  };

  const handleKeyDown = (e) => {
    if (e?.key === "Enter") {
      //   TableData("1");
      console.log("Clicked hello");
    }
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
      .post("Accounts/GetRateTypeByGlobalCentre", {
        // GetRateTypeByGlobalCentreById
        TypeId: "",
      })
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
    GetRateTypeByGlobalCentre();
    // getAccessCentres();
    GetRateTypeByGlobalCentre();
  }, []);

  const handlePrintReport = async (EstimateNoHash) => {
    try {
      setPrintLoading(EstimateNoHash);
      const res = await axiosReport.post(`GetEstimateReceipt`, {
        EstimateNoHash: EstimateNoHash
      }, 
      { responseType: "blob" }
    );

      if (res?.status === 200) {
        const url = window.URL.createObjectURL(
          new Blob([res.data], { type: "application/pdf" })
        );
        window.open(url, "_blank");
      }
    } catch (error) {
      console.error("Error while downloading pdf", error);
      toast.error("Error while printing report!")
    } finally {
      setPrintLoading(false);
    }
  };

  const getStatusLabel = (statusId, t, statusOptions) => {
    if (statusId === null || statusId === undefined) {
      return "-";
    }

    const option = statusOptions.find((option) => option.value === statusId);

    return option ? t(option.label) : statusId;
  };

  return (
    <>
      <div>
        {/* {lockreportshow && (
        <LockReportModal
          selectedData={selectedData}
          lockreportshow={lockreportshow}
          setLockReportShow={setLockReportShow}
          handleSearch={handleSearch}
        />
      )} */}
        {/* {showOP && (
        <LedgerStatusModal
          show={showOP}
          setShow={setShowOP}
          handleSelctData={handleSelctData}
        />
      )} */}
        <Heading
          name={"Estimate Booking List"}
          isBreadcrumb={"true"}
          secondTitle={
            <>
              <Link
                to="/EstimateRatenew"
                style={{
                  fontSize: "13px",
                  textDecoration: "underline",
                  cursor: "pointer",
                }}
              >
                <CustomButton icon={"back"} text={"Back to Estimate Booking"} />
              </Link>
            </>
          }
        />
        <div className="card">
          <div className="row px-2 mt-2 mb-1 bg-white">
            <div className="col-12 col-sm-2 d-flex" style={{ display: "flex" }}>
              <div style={{ width: "50%" }}>
                <SelectBox
                  options={[
                    ...SearchBy,
                    ...(shouldIncludeAIIMSID()
                      ? [{ label: "AIIMSID", value: "AIIMSID" }]
                      : []),
                  ]}
                  selectedValue={formData?.SelectTypes}
                  name="SelectTypes"
                  id="SelectTypes"
                  lable="SelectTypes"
                  onChange={handleChange}
                />
              </div>
              <div style={{ width: "50%" }}>
                {formData?.SelectTypes === "Mobile" ? (
                  <div style={{ width: "100%" }}>
                    <Input
                      className="select-input-box form-control input-sm"
                      type="number"
                      name="ItemValue"
                      max={10}
                      onKeyDown={handleKeyDown}
                      value={formData?.ItemValue}
                      onChange={handleChange}
                      onInput={(e) => number(e, 10)}
                    />
                    {/* {errors?.ItemValue && (
                                    <div className="error-message">{errors?.ItemValue}</div>
                                  )} */}
                  </div>
                ) : (
                  <div style={{ width: "100%" }}>
                    <Input
                      className="select-input-box form-control input-sm"
                      type="text"
                      name="ItemValue"
                      max={20}
                      onKeyDown={handleKeyDown}
                      value={formData?.ItemValue}
                      onChange={handleChange}
                    />
                    {/* {errors?.ItemValue && (
                                    <div className="error-message">{errors?.ItemValue}</div>
                                  )} */}
                  </div>
                )}
              </div>
            </div>
            <MultiSelectComp
              options={dropDownList?.centreList}
              name="centreID"
              id="centreID"
              label={t("Centre")}
              // placeholder={t("Business Unit")}
              value={payload?.centreID}
              className={"col-sm-2"}
              onChange={handleSelectchangeCheck}
            />
            <div className="col-sm-2">
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
                      (ele) => ele?.label === e.target.value
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
            </div>
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
              />
            </div>
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
                minDate={new Date(formData?.FromDate)}
              />
            </div>
            <div className="col-sm-2">
              <Input
                lable="Estimate No"
                id="estimateNo"
                name="estimateNo"
                placeholder=""
                value={formData.estimateNo}
                onChange={handleChange}
              />
            </div>
            <div className="col-sm-1 col-12">
              {loading ? (
                <Loading />
              ) : (
                <SearchButton
                  text={"Search"}
                  className="btn btn-info btn-block btn-sm"
                  onClick={() => handleSearch(false)}
                />
              )}
            </div>
            <div className="col-sm-1 col-12">
              <CustomButton
                text={"Excel"}
                icon={"excel"}
                className="btn btn-success btn-block btn-sm"
                onClick={handleExportToExcel}
              />
            </div>
            <div className="col-sm-1 col-12">
              <CustomButton
                text={reportLoading ? "..." : "Report"}
                icon={"pdf"}
                className="btn btn-danger btn-block btn-sm"
                onClick={handleReport}
                disabled={reportLoading}
              />
            </div>
          </div>
        </div>
        <div className="card mt-2">
          <Heading
            title={t("Data List")}
            secondTitle={
              <div
                className="d-flex justify-content-between align-items-center pt-1 px-2"
                style={{ gap: "10px" }}
              >
                {/* Display individual sums and total */}
                <div
                  style={{ fontWeight: "bold", display: "flex", gap: "12px" }}
                >
                  <div
                    style={{
                      fontWeight: "bold",
                      display: "flex",
                      gap: "10px",
                      alignItems: "center",
                    }}
                  >
                    {/* <span>
                      {t("Total MRP")}:{" "}
                      <span style={{ color: "#dc3545" }}>
                        {tableData.reduce(
                          (sum, item) => sum + item.GrossAmount,
                          0
                        )}
                      </span>
                    </span> */}
                    <span>
                      {t("Total Amount")}:{" "}
                      <span style={{ color: "#dc3545" }}>
                        {tableData.reduce(
                          (sum, item) => sum + item.NetAmount,
                          0
                        )}
                      </span>
                    </span>
                  </div>
                </div>
                {/* Status filter dots */}
                <div style={{ gap: "4px" }} className="d-flex">
                  {Object.keys(statusConfig).map((status) => (
                    <TableFilterDot
                      key={status}
                      onClick={() => handleFilterInputChange(status)}
                      color={statusConfig[status].text}
                      bgColor={statusConfig[status].bg}
                      title={`${status} ${statusCount(status)}`}
                    />
                  ))}
                </div>
              </div>
            }
          />

          <div className="row px-2 mt-2 mb-2">
            <div className="col-12">
              {loading ? (
                <Loading />
              ) : tableData.length > 0 ? (
                <>
                  <Tables
                    style={{
                      maxHeight: "400px",
                      overflowY: "auto",
                    }}
                  >
                    <thead className="cf">
                      <tr>
                        <th>{t("S.No")}</th>
                        <th>{t("EstimateNo")}</th>
                        <th>{t("Reg Date")}</th>
                        <th>{t("PName | Age | Gender")}</th>
                        <th>{t("Mobile")}</th>
                        <th>{t("Email")}</th>
                        {/* <th>{t("MRP")}</th> */}
                        <th>{t("Amount")}</th>
                        <th>{t("TestInfo")}</th>
                        <th>{t("Print")}</th>
                        <th>{t("Action")}</th>
                        <th></th>
                      </tr>
                    </thead>
                    <tbody>
                      {tableData?.map((data, index) => (
                        <tr key={data?.EstimateNo}>
                          <td data-title={"S No."}>{index + 1}</td>
                          <td data-title={"EstimateNo"}>
                            {data?.EstimateNo}
                          </td>
                          <td data-title={"Reg Date"}>{data?.CreatedDate}</td>
                          <td
                            data-title={"PName | Age | Gender"}
                          >{`${data?.PName} | ${data?.AgeYear}Y ${data?.AgeMonth}M ${data?.AgeDays}D | ${data?.Gender}`}</td>
                          <td data-title={"Mobile"}>{data?.Mobile}</td>
                          <td data-title={"Email"}>{data?.Email}</td>
                          {/* <td data-title={"MRP"}>{data?.mrp || ""}</td> */}
                          <td data-title={"Amount"}>{data?.NetAmount}</td>
                          <td data-title={"TestInfo"}>
                            <div
                              className=""
                              onClick={() => handleTestInfoClick(data)}
                              style={{
                                textDecoration: "none",
                                color: "#007bff",
                              }}
                              title="View Test"
                            >
                              <FaEye size={18} />
                            </div>
                          </td>

                          <td data-title={"Print"}>
                            {printLoading === data?.EstimateNoHash ? (
                              <i className="fa fa-spinner fa-spin me-2 mr-2" />
                            ) : (
                              <span onClick={() => handlePrintReport(data?.EstimateNoHash)}
                              title="Print"
                              >
                                <MdPrint size={18} />
                              </span>
                            )}
                            {data?.StatusID != 1 && (
                              <span
                                onClick={() => HandleLogDetails(data)}
                                title="View Logs"
                                className="mx-3"
                              >
                                {/* <i class="bi bi-database d-inline"></i> */}
                                <FiFileText size={18} style={{ color: "#2783e5" }} />
                              </span>
                            )}
                            {/* {[1].includes(data?.StatusID) && (
                              <Link
                                className="ml-3"
                                to={"/patientregister"}
                                state={data}
                                title="Register Patient"
                              >
                                <FaUser size={16} />
                              </Link>
                            )} */}
                            {/* <i className="bi bi-printer-fill"></i> */}
                          </td>
                          <td
                            data-title={"Action"}
                            style={{ maxWidth: "150px", gap: "5px" }}
                            className="d-flex"
                          >
                            <div style={{ minWidth: "100px", gap: "5px" }}>
                              <ReactSelect
                                dynamicOptions={statusOptions}
                                name="StatusID"
                                lable={t("Status")}
                                id="StatusID"
                                removeIsClearable={true}
                                placeholderName={t("Status")}
                                value={data?.StatusID}
                                onChange={(name, value) =>
                                  handleSelectStatusChange(name, value, data)
                                }
                              />
                            </div>
                            {/* {data?.StatusID != 1 && (
                              <div onClick={() => HandleLogDetails(data)}
                              title="View Logs"
                              >
                                <i class="bi bi-database"></i>
                              </div>
                            )} */}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Tables>
                </>
              ) : (
                <NoRecordFound />
              )}
            </div>
          </div>
          {/* {tooltipData.position && tooltipData.testNames.length > 0 && (
                <CustomTooltip
                  testNames={tooltipData.testNames}
                  position={tooltipData.position}
                  rowIndex={tooltipData.rowIndex}
                  totalRows={receiptData.length}
                />
              )} */}
          {/* {formattedData.length > 0 && (
            <div className="d-flex justify-content-end ">
              <label className="mt-4 mx-2">No Of Record/Page</label>
              <SelectBox
                className="mt-3 p-1 RecordSize mr-2"
                options={[
                  { label: "All", value: tableData?.length },
                  ...Record,
                ]}
                selectedValue={PageSize}
                onChange={(e) => setPageSize(Number(e.target.value))}
              />{" "}
              <Pagination
                className="pagination-bar mb-2"
                currentPage={currentPage}
                totalCount={tableData?.length}
                pageSize={PageSize}
                onPageChange={(page) => setCurrentPage(page)}
              />{" "}
            </div>
          )} */}
        </div>
      </div>

      {/* Test Info Modal */}
      {showTestInfoModal && (
        <Dialog
          header={`Test Information - ${selectedRow}`}
          onHide={() => {
            setShowTestInfoModal(false);
            setTestInfoData([]);
            setSelectedRow(null);
          }}
          className={theme}
          visible={showTestInfoModal}
          style={{ width: "50vw" }}
        >
          <div className="row pt-2 px-2 py-3">
            <div className="col-12">
              {testInfoData.length > 0 ? (
                <Tables
                  style={{
                    maxHeight: "400px",
                    overflowY: "auto",
                  }}
                >
                  <thead className="cf">
                    <tr>
                      <th>{t("S.No")}</th>
                      <th>{t("Department")}</th>
                      <th>{t("Test Name")}</th>
                      <th>{t("Delivery Date")}</th>
                      {/* <th>{t("MRP")}</th> */}
                      <th>{t("Amount")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {testInfoData.map((item, index) => (
                      <tr key={index}>
                        <td data-title={t("S.No")}>{index + 1}</td>
                        <td data-title={t("Department")}>
                          {item.DepartmentName || "-"}
                        </td>
                        <td data-title={t("Test Name")}>{item.ItemName}</td>
                        <td data-title={t("Delivery Date")}>
                          {item.DeliveryDate}
                        </td>
                        {/* <td>{item?.mrp || ""}</td> */}
                        <td data-title={t("Amount")}>
                          {parseFloat(item.Amount).toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  {/* <tfoot>
                    <tr
                      style={{ fontWeight: "bold", backgroundColor: "#f8f9fa" }}
                    >
                      <td colSpan="4" style={{ textAlign: "right" }}>
                        {t("Total Amount")}:
                      </td>
                      <td>
                        {testInfoData
                          .reduce(
                            (sum, item) => sum + parseFloat(item.Amount),
                            0
                          )
                          .toFixed(2)}
                      </td>
                      <td colSpan="2"></td>
                    </tr>
                  </tfoot> */}
                  <tfoot>
                    <tr style={{ fontWeight: "bold", backgroundColor: "#f8f9fa" }}>
                      {/* Empty cells till Delivery Date */}
                      <td colSpan="4" style={{ textAlign: "right" }}>
                        {t("Total")}
                      </td>

                      {/* Total MRP */}
                      {/* <td>
                        {testInfoData
                          .reduce((sum, item) => sum + parseFloat(item.mrp || 0), 0)
                          .toFixed(2)}
                      </td> */}

                      {/* Total Amount */}
                      <td>
                        {testInfoData
                          .reduce((sum, item) => sum + parseFloat(item.Amount || 0), 0)
                          .toFixed(2)}
                      </td>
                    </tr>
                  </tfoot>
                </Tables>
              ) : (
                <div className="text-center py-4">
                  <p>{t("No test information available")}</p>
                </div>
              )}
            </div>
          </div>
        </Dialog>
      )}

      {/* Remark modal */}
      {showRemarkModal && (
        <Dialog
          header={"Add Remark"}
          onHide={() => setShowRemarkModal(false)}
          className={theme}
          visible={showRemarkModal}
          style={{ width: "20vw" }}
        >
          <div className="row pt-2 px-2 py-3 align-items-center justify-content-center">
            <div className="col-12 mb-2">
              <ReactSelect
                dynamicOptions={statusOptions}
                name="StatusID"
                lable={t("Status")}
                id="StatusID"
                removeIsClearable={true}
                placeholderName={t("Status")}
                value={modalData.statusId}
                onChange={handleModalStatusChange}
              />
            </div>

            {console.log("MOdal data", modalData)}

            {modalData.statusId === 2 && (
              <div className="col-12 mb-3">
                <Input
                  className="form-control"
                  type="text"
                  name="ledgerTransactionNo"
                  id="ledgerTransactionNo"
                  placeholder={t("")}
                  lable={t("Visit No")}
                  value={modalData.ledgerTransactionNo}
                  onChange={handleModalChange}
                />
              </div>
            )}

            {(modalData.statusId === 3 || modalData.statusId === 4) && (
              <div className="col-12 mb-3">
                <TextAreaInput
                  className="form-control"
                  name="remark"
                  lable={"Remark"}
                  placeholder={t("")}
                  rows="4"
                  value={modalData.remark}
                  onChange={handleModalChange}
                />
              </div>
            )}

            <div className="col-12 text-end">
              <SaveButton
                text={"Save"}
                onClick={handleModalSubmit}
                disabled={
                  !modalData.statusId ||
                  (modalData.statusId === 2 &&
                    !modalData.ledgerTransactionNo) ||
                  ((modalData.statusId === 3 || modalData.statusId === 4) &&
                    !modalData.remark)
                }
              />
            </div>
          </div>
        </Dialog>
      )}

      {/* Log modal */}
      {showLogModal && (
        <Dialog
          header={`Estimate No - ${selectedRow?.EstimateNo} | Pname - ${selectedRow?.PName}`}
          onHide={() => {
            setShowLogModal(false);
            setLogData([]);
            setSelectedRow(null);
          }}
          className={theme}
          visible={showLogModal}
          style={{ width: "50vw" }}
        >
          <div className="row pt-2 px-2 py-3">
            <div className="col-12">
              {logData.length > 0 ? (
                <Tables
                  style={{
                    maxHeight: "400px",
                    overflowY: "auto",
                  }}
                >
                  <thead className="cf">
                    <tr>
                      <th>{t("S.No")}</th>
                      <th>{t("Status")}</th>
                      <th>{t("Remark")}</th>
                      <th>{t("Username")}</th>
                      <th>{t("Date/Time")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {logData.map((item, index) => {
                      const statusLabel = getStatusLabel(
                        item?.ColorStatus,
                        t,
                        statusOptions
                      );

                      return (
                        <tr key={index}>
                          <td data-title={t("S.No")}>{index + 1}</td>
                          <td data-title={t("Status")}>{statusLabel}</td>
                          <td data-title={t("Remark")}>
                            {item?.Remarks || "-"}
                          </td>
                          <td data-title={t("Username")}>
                            {item?.CreatedByName}
                          </td>
                          <td data-title={t("Date/Time")}>
                            {item?.CreatedDate}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </Tables>
              ) : (
                <div className="text-center py-4">
                  <p>{t("No log information available")}</p>
                </div>
              )}
            </div>
          </div>
        </Dialog>
      )}
    </>
  );
};

export default EstimateRatenewList;
