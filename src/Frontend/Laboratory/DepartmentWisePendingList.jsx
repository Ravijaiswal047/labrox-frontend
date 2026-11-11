import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import { DepartmentWiseItemList, getDoctorSuggestion } from "../../utils/NetworkApi/commonApi";
import { axiosInstance } from "../../utils/axiosInstance";
import {
  AddBlankData,
  autocompleteOnBlur,
  formatStandardDate,
  number,
  shouldIncludeAIIMSID,
} from "../../utils/helpers";
import Input from "../../components/formComponent/Input";
import Loading from "../../components/loader/Loading";
import Accordion from "@app/components/UI/Accordion";
import ReactSelect from "../../components/formComponent/ReactSelect";
import { FaFileExcel, FaFilePdf } from "react-icons/fa";
import DatePicker from "../../components/formComponent/DatePicker";
import {
  defaultSearchTypes,
  SampleStatus,
  SearchBy,
} from "../../utils/Constants";
import { SelectBox } from "../../components/formComponent/SelectBox";
import AutoComplete from "../../components/formComponent/AutoComplete";
import CustomTable from "../../components/Table/CustomTable";
import * as XLSX from "xlsx";
import AddRemark from "../utils/AddRemark";
import { FaPlus } from "react-icons/fa";
import CustomModal from "../utils/CustomModal";
import { CustomButton, SearchButton } from "../../components/UI/CustomButton";

const DATE_TYPE_OPTIONS = [
  { label: "SRA Date", value: "SRA Date" },
  { label: "Department Received", value: "Department Receive" },
];

const DepartmentWisePendingList = () => {
  const { t } = useTranslation();
  const [errors, setErrors] = useState({});
  const [selects, setSelects] = useState(false);
  const [indexMatch, setIndexMatch] = useState(0);
  const [DepartmentData, setDepartmentData] = useState([]);
  const [CentreData, setCentreData] = useState([]);
  const [tableData, setTableData] = useState([]);
  const [filteredTableData, setFilteredTableData] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [modal, setModal] = useState(false);
  const [visitID, setVisitID] = useState();
  const [loading, setLoading] = useState(false);
  const [showAddRemark, setShowAddRemark] = useState({
    modal: false,
    rowData: null,
  });
  const [TestSuggestion, setTestSuggestion] = useState([]);
  const [processingCentreOptions, setProcessingCentreOptions] = useState([]);
  const [rateTypeOptions, setRateTypeOptions] = useState([]);
  const [doctorSuggestion, setDoctorSuggestion] = useState([]);
  const [doctorDropFalse, setDoctorDropFalse] = useState(false);
  const [doctorIndexMatch, setDoctorIndexMatch] = useState(0);
  const [payload, setPayload] = useState({
    CentreID: "",
    DepartmentID: "",
    FromDate: new Date(),
    ToDate: new Date(),
    SampleStatus: "",
    SelectTypes: defaultSearchTypes || "",
    ItemValue: "",
    TestName: "",
    DateType: "SRA Date",
    ProcessingCentreID: "",
    DoctorName: "",
    DoctorId: "",
    RateTypeId: "",
  });

  const dateSelect = (value, name) => {
    const d = new Date(value);
    const formattedDate = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    setPayload((prev) => ({
      ...prev,
      [name]: value,
    }));
    return formattedDate;
  };

  const columns = [
    { header: "S.No", field: "sno", width: "4%" }, // small
    { header: "Reg Date / SC Date", field: "RegSCDate", width: "10%" },
    {
      header: "Centre / Rate Type / Doctor",
      field: "CentreRateType",
      width: "15%",
    },
    { header: "Visit ID", field: "VisitNo", width: "8%" },
    { header: "Barcode No.", field: "BarcodeNos", width: "8%" },
    { header: "Patient Info", field: "PatientInfo", width: "10%" },
    { header: "Test Name", field: "InvestigationNames", width: "15%" },
    { header: "Current Status", field: "CurrentStatus", width: "8%" },
    { header: "Remarks", field: "Remark", width: "12%" },
    {
      header: <i className="fa fa-info-circle" title="View Details" />,
      field: "viewDetails",
      width: "5%",
    },
    { header: "Add Remark", field: "addRemark", width: "5%" },
  ];

  let dynamicTab = null;

  const handleEdit = (rowData) => {
    dynamicTab = window.open("/DynamicLabSearch", "_blank");

    // Wait for child to signal that listener is ready
    const handleReady = (event) => {
      if (event.origin !== window.location.origin) return;
      if (event.data.listenerReady) {
        dynamicTab.postMessage(
          { visitNo: rowData.VisitNo },
          window.location.origin,
        );
        window.removeEventListener("message", handleReady);
      }
    };

    window.addEventListener("message", handleReady);
  };

  const formattedTableData = filteredTableData.map((item, index) => ({
    ...item,
    sno: index + 1,
    RegSCDate: (
      <div style={{ display: "flex", flexDirection: "column" }}>
        <span style={{ marginBottom: "4px", fontWeight: 500 }}>
          {item.RegistrationDate || "-"}
        </span>
        <span style={{ color: "#555", fontSize: "12px", marginTop: "4px" }}>
          {item.SampleCollectionDate || "-"}
        </span>
      </div>
    ),
    CentreRateType: (
      <div style={{ display: "flex", flexDirection: "column" }}>
        <span style={{ marginBottom: "2px", fontWeight: 500 }}>
          {item.BookingCentre || "-"}
        </span>
        <span style={{ color: "#555", fontSize: "12px", marginBottom: "2px" }}>
          {item.RateTypeName || "-"}
        </span>
        <span style={{ color: "#555", fontSize: "12px" }}>
          {item.DoctorName || "-"}
        </span>
      </div>
    ),
    PatientInfo: (
      <div style={{ display: "flex", flexDirection: "column" }}>
        <span style={{ marginBottom: "4px", fontWeight: 500 }}>
          {item.PName || "-"}
        </span>
        <span style={{ color: "#555", fontSize: "12px" }}>
          {item.Age || "-"} / {item.Gender || "-"}
        </span>
      </div>
    ),
    VisitNo: (
      <a
        target="_blank"
        style={{ color: "#007bff", textDecoration: "underline" }}
        onClick={() => handleEdit(item)}
      >
        {item.VisitNo || "-"}
      </a>
    ),
    viewDetails: (
      <i
        className="fa fa-search"
        title="View Details"
        onClick={() => {
          setModal(true);
          setVisitID(item?.VisitNo);
        }}
      />
    ),
    addRemark: (
      <div
        onClick={() => setShowAddRemark({ modal: true, rowData: item })}
        style={{
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          gap: "3px",
        }}
        title={
          item.LabRemarkCount > 0
            ? `Lab Remarks: ${item.LabRemarkCount || "-"}`
            : "Add Remark"
        }
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
          }}
        >
          <FaPlus color="white" size={8} /> {/* smaller plus icon */}
        </div>
        {item.LabRemarkCount > 0 && (
          <span style={{ fontSize: "12px", fontWeight: "bold" }}>
            ({item.LabRemarkCount || "-"})
          </span>
        )}
      </div>
    ),
  }));

  const handleKeyDown = (e) => {
    if (e?.key === "Enter") {
      TableData("");
    }
  };

  const flattenJSX = (jsx) => {
    if (typeof jsx === "string" || typeof jsx === "number") return jsx;
    if (Array.isArray(jsx)) return jsx.map(flattenJSX).join(" ");
    if (React.isValidElement(jsx)) return flattenJSX(jsx.props.children);
    return "";
  };

  const exportToExcel = () => {
    if (!tableData || tableData.length === 0) {
      toast.info("No Data Found");
      return;
    }

    const excelData = formattedTableData?.map((row) => {
      const rowData = {};
      columns.forEach((col) => {
        // Exclude "addRemark" and "viewDetails" columns
        if (col.field !== "addRemark" && col.field !== "viewDetails") {
          let value = row[col.field];
          // Convert JSX to plain text
          if (React.isValidElement(value)) {
            value = flattenJSX(value);
          }
          rowData[col.header] = value;
        }
      });
      return rowData;
    });

    const worksheet = XLSX.utils.json_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Payments");
    XLSX.writeFile(workbook, "TechnicianPendingList.xlsx");
  };

  const handleGetReport = () => {
    setLoading(true);
    const apiPayload = {
      dtFrom: formatStandardDate(payload?.FromDate, "FromDate"),
      dtTo: formatStandardDate(payload?.ToDate, "ToDate"),
      timeFrom: "00:00:00",
      timeTo: "23:59:59",
      centreID: payload?.CentreID?.toString() || "",
      deptId: payload?.DepartmentID?.toString() || "",
      itemName: payload?.TestName?.includes(" - ")
        ? payload.TestName.split(" - ").slice(1).join(" - ").trim()
        : payload?.TestName || "",
      selectTypes: payload?.SelectTypes || "",
      reportTypes: "PDF",
      itemValue: payload?.ItemValue || "",
      statusID: payload?.SampleStatus || "",
      dateType: payload?.DateType || "SRA Date",
      doctorId: payload?.DoctorId || 0,
      rateTypeId: payload?.RateTypeId || 0,
      processingCentreId: payload?.ProcessingCentreID || 0,
    };
      axiosInstance.post("Department/GetPendingReportPdf/GetPendingReportPdf", apiPayload,
      { responseType: "blob" }
    ).
      then((res)=>{
        console.log("report res", res);
        const file = new Blob([res.data], { type: "application/pdf" });

        const fileURL = URL.createObjectURL(file);
        // ✅ Open in new tab
        window.open(fileURL);
        setLoading(false);
       
      }).catch((err)=>{
        toast.error("No Report Found");
        console.log("report err",err)
      })
      .finally(()=>{
        setLoading(false);
      });
  
    };

  const getDepartment = async () => {
    axiosInstance
      .get("Department/getDepartment")
      .then((res) => {
        let data = res.data.message;
        if (Array.isArray(data)) {
          const DeptDataValue = data.map((ele) => ({
            value: ele.DepartmentID,
            label: ele.Department,
          }));
          setDepartmentData(DeptDataValue);
        }
      })
      .catch((err) => {
        console.log("department res", err);
      });
  };

  const getPendingList = async () => {
    setTableData([]);
    setFilteredTableData([]);
    setSearchTerm("");
    setLoading(true);
    const apiPayload = {
      dtFrom: dateSelect(payload?.FromDate, "FromDate"),
      dtTo: dateSelect(payload?.ToDate, "ToDate"),
      timeFrom: "00:00:00",
      timeTo: "23:59:59",
      centreID: payload?.CentreID?.toString() || "",
      deptId: payload?.DepartmentID?.toString() || "",
      itemName: payload?.TestName?.includes(" - ")
        ? payload.TestName.split(" - ").slice(1).join(" - ").trim()
        : payload?.TestName || "",
      selectTypes: payload?.SelectTypes || "",
      itemValue: payload?.ItemValue || "",
      statusID: payload?.SampleStatus || "",
      dateType: payload?.DateType || "SRA Date",
      doctorId: payload?.DoctorId || 0,
      rateTypeId: payload?.RateTypeId || 0,
      processingCentreId: payload?.ProcessingCentreID || 0,
    };

    axiosInstance
      .post("Department/GetPendingReport/GetPendingReport", apiPayload)
      .then((res) => {
        let data = res?.data?.message || [];
        if (Array.isArray(data)) {
          setTableData(data);
          setFilteredTableData(data);
          setLoading(false);
        } else {
          console.warn("Unexpected response format:", data);
          setTableData([]);
          setFilteredTableData([]);
          setLoading(false);
          toast.warning("No valid data received from server.");
        }
      })
      .catch((err) => {
        setLoading(false);
        console.log("pendinglist", err);
        toast.error(err?.response?.data?.message);
      });
  };

  const handleChangeSearch = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    if (!value.trim()) {
      setFilteredTableData(tableData);
      return;
    }
    const lower = value.toLowerCase();
    const filtered = tableData.filter((row) =>
      Object.values(row).some((val) =>
        String(val ?? "").toLowerCase().includes(lower)
      )
    );
    setFilteredTableData(filtered);
  };

  const getAccessCentres = () => {
    axiosInstance
      .get("Centre/getAccessCentres")
      .then((res) => {
        let data = res.data.message;
        if (Array.isArray(data)) {
          const CentreDataValue = data.map((ele) => ({
            value: ele.CentreID,
            label: ele.Centre,
          }));
          setCentreData(CentreDataValue);
        }
      })
      .catch((err) => console.log(err));
  };

  const getProcessingCentreData = () => {
    axiosInstance
      .get("Centre/CentreProcessingLab")
      .then((res) => {
        if (!Array.isArray(res.data.message)) return;
        setProcessingCentreOptions([
          { label: "All", value: "" },
          ...res.data.message.map((ele) => ({
            value: ele.ProcessingLabID,
            label: ele.ProcessingLab,
          })),
        ]);
      })
      .catch(() => {});
  };

  const fetchRateTypes = (centreId) => {
    if (!centreId) {
      setRateTypeOptions([]);
      return;
    }
    axiosInstance
      .post("Centre/GetRateType", { CentreID: [centreId] })
      .then((res) => {
        const list = (res.data.message || []).map((item) => ({
          label: item.RateTypeName,
          value: item.RateTypeID,
        }));
        setRateTypeOptions([{ label: "All", value: "" }, ...list]);
      })
      .catch(() => {});
  };

  const handleDoctorChange = (e) => {
    const { value } = e.target;
    setPayload((prev) => ({ ...prev, DoctorName: value, DoctorId: "" }));
    if (!value) {
      setDoctorSuggestion([]);
      setDoctorDropFalse(false);
    } else {
      setDoctorDropFalse(true);
    }
  };

  const handleDoctorSelect = (data) => {
    setPayload((prev) => ({
      ...prev,
      DoctorName: data.Name,
      DoctorId: data.DoctorReferalID,
    }));
    setDoctorSuggestion([]);
    setDoctorDropFalse(false);
    setDoctorIndexMatch(0);
  };

  const handleListSearchNew = (data, name) => {
    switch (name) {
      case "TestName":
        setPayload((prev) => ({
          ...prev,
          [name]: data.TestName,
        }));
        setSelects(false);
        setIndexMatch(0);
        setTestSuggestion([]);
        break;

      default:
        break;
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "TestName") {
      if (value === "") {
        setSelects(false);
        setTestSuggestion([]);
        setPayload((prev) => ({
          ...prev,
          [name]: "",
        }));
      } else {
        setSelects(true);
        setTestSuggestion((prev) =>
          prev.filter((ele) =>
            ele.TestName?.toLowerCase().includes(value.toLowerCase()),
          ),
        );
        setPayload((prev) => ({
          ...prev,
          [name]: value,
        }));
      }
    } else {
      setPayload((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleIndex = (e, index) => {
    const { name } = e.target;
    switch (name) {
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
              setDoctorIndexMatch((prev) => (prev !== 0 ? prev - 1 : doctorSuggestion.length - 1));
            }
            break;
          case 40:
            if (doctorSuggestion.length > 0) {
              setDoctorIndexMatch((prev) => (doctorSuggestion.length - 1 === prev ? 0 : prev + 1));
            }
            break;
          case 13:
            if (doctorSuggestion.length > 0 && doctorSuggestion[doctorIndexMatch]) {
              handleDoctorSelect(doctorSuggestion[doctorIndexMatch]);
            }
            setDoctorIndexMatch(0);
            break;
          default:
            break;
        }
        break;
    }
  };

  const handleSelectChange1 = (event) => {
    const { name, value } = event.target;
    setPayload((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSearchSelectChange = (label, value) => {
    setPayload((prev) => ({
      ...prev,
      [label]: value?.value,
      ...(label === "CentreID" ? { RateTypeId: "" } : {}),
    }));
    if (label === "CentreID") {
      fetchRateTypes(value?.value);
    }
  };

  const handleSelectChange = (event) => {
    const { name, value, checked, type } = event?.target;
    setPayload((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  useEffect(() => {
    getAccessCentres();
    getDepartment();
    getProcessingCentreData();
  }, []);

  useEffect(() => {
    if (payload?.TestName.length > 2) {
      DepartmentWiseItemList("", payload?.TestName, setTestSuggestion, true);
    }
  }, [payload?.TestName]);

  useEffect(() => {
    getDoctorSuggestion({ DoctorName: payload.DoctorName }, setDoctorSuggestion, () => {});
    if (payload.DoctorName === "") {
      setDoctorDropFalse(false);
    }
  }, [payload.DoctorName]);

  return (
    <>
      <Accordion
        name={t("Technician Pending List")}
        isBreadcrumb={true}
        defaultValue={true}
      >
        <Accordion title={t("Add Details")} defaultValue={true}>
          <div className="row px-2 mt-2">
            <div className="col-12 col-sm-6 col-md-2 my-1">
              <div className="d-flex" style={{ display: "flex" }}>
                <div style={{ width: "50%" }}>
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
                    selectedValue={payload.SelectTypes}
                    name="SelectTypes"
                    onChange={handleSelectChange}
                  />
                </div>
                <div style={{ width: "50%" }}>
                  {payload?.SelectTypes === "Mobile" ? (
                    <div style={{ width: "100%" }}>
                      <Input
                        type="number"
                        name="ItemValue"
                        max={10}
                        onKeyDown={handleKeyDown}
                        value={payload.ItemValue}
                        onChange={handleSelectChange}
                        onInput={(e) => number(e, 10)}
                      />
                      {errors?.ItemValue && (
                        <div className="error-message">{errors?.ItemValue}</div>
                      )}
                    </div>
                  ) : (
                    <div style={{ width: "100%" }}>
                      <Input
                        type="text"
                        name="ItemValue"
                        onKeyDown={handleKeyDown}
                        max={20}
                        value={payload.ItemValue}
                        onChange={handleSelectChange}
                      />
                      {errors?.ItemValue && (
                        <div className="error-message">{errors?.ItemValue}</div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="col-12 col-sm-6 col-md-2 my-1">
              <ReactSelect
                dynamicOptions={DATE_TYPE_OPTIONS}
                name="DateType"
                lable={t("Date Type")}
                id="DateType"
                removeIsClearable={true}
                placeholderName={t("Date Type")}
                value={payload?.DateType}
                onChange={handleSearchSelectChange}
              />
            </div>
            <div className="col-12 col-sm-6 col-md-2 my-1">
              <ReactSelect
                dynamicOptions={AddBlankData(CentreData, "All Centre")}
                name="CentreID"
                lable={t("Centre")}
                id="Centre"
                removeIsClearable={true}
                placeholderName={t("Centre")}
                value={payload?.CentreID}
                onChange={handleSearchSelectChange}
              />
            </div>
            <div className="col-12 col-sm-6 col-md-2 my-1">
              <ReactSelect
                dynamicOptions={processingCentreOptions}
                name="ProcessingCentreID"
                lable={t("Processing Centre")}
                id="ProcessingCentreID"
                removeIsClearable={true}
                placeholderName={t("Processing Centre")}
                value={payload?.ProcessingCentreID}
                onChange={handleSearchSelectChange}
              />
            </div>
            <div className="col-12 col-sm-6 col-md-2 my-1">
              <ReactSelect
                dynamicOptions={AddBlankData(DepartmentData, "All Department")}
                name="DepartmentID"
                lable={t("Department")}
                id="Department"
                removeIsClearable={true}
                placeholderName={t("Department")}
                value={payload?.DepartmentID}
                onChange={handleSearchSelectChange}
              />
            </div>
            <div className="col-12 col-sm-6 col-md-2 my-1">
              <DatePicker
                className="custom-calendar"
                name="FromDate"
                value={payload?.FromDate}
                onChange={dateSelect}
                placeholder=" "
                id="FromDate"
                lable="FromDate"
                maxDate={payload?.ToDate}
                // minDate={payload?.ToDate}
              />
            </div>
            <div className="col-12 col-sm-6 col-md-2 my-1">
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
            <div className="col-12 col-sm-6 col-md-2 my-1">
              <SelectBox
                options={[...SampleStatus]}
                onChange={handleSelectChange1}
                name="SampleStatus"
                lable="SampleStatus"
                id="SampleStatus"
                selectedValue={payload.SampleStatus}
              />
            </div>
            <div className="col-12 col-sm-6 col-md-2 my-1">
              <Input
                type="text"
                name="TestName"
                lable="Search By Test Name"
                id="TestName"
                value={payload.TestName}
                placeholder=" "
                onChange={handleChange}
                onKeyDown={(e) => handleIndex(e, "TestName")}
                onBlur={(e) => {
                  autocompleteOnBlur(setTestSuggestion);
                  setTimeout(() => {
                    const match = TestSuggestion.some(
                      (ele) =>
                        ele?.TestName?.toLowerCase() ===
                        e.target.value?.toLowerCase(),
                    );

                    if (!match) {
                      setPayload((prev) => ({
                        ...prev,
                        TestName: "",
                      }));
                    }
                  }, 200);
                }}
              />
              {TestSuggestion.length > 0 && (
                <AutoComplete
                  selects={selects}
                  test={TestSuggestion}
                  handleListSearch={handleListSearchNew}
                  indexMatch={indexMatch}
                />
              )}
            </div>
            <div className="col-12 col-sm-6 col-md-2 my-1">
              <ReactSelect
                dynamicOptions={rateTypeOptions}
                name="RateTypeId"
                lable={t("Rate Type")}
                id="RateTypeId"
                removeIsClearable={true}
                placeholderName={t("Rate Type")}
                value={payload?.RateTypeId}
                onChange={handleSearchSelectChange}
              />
            </div>
            <div className="col-12 col-sm-6 col-md-2 my-1" style={{ position: "relative" }}>
              <Input
                type="text"
                name="DoctorName"
                lable="Refer Doctor"
                id="DoctorName"
                value={payload.DoctorName}
                placeholder=" "
                onChange={handleDoctorChange}
                onKeyDown={(e) => handleIndex(e, "DoctorName")}
                onBlur={() => autocompleteOnBlur(setDoctorSuggestion)}
              />
              {doctorDropFalse && doctorSuggestion.length > 0 && payload.DoctorName && (
                <ul className="suggestion-data">
                  {doctorSuggestion.map((data, idx) => (
                    <li
                      key={idx}
                      onClick={() => handleDoctorSelect(data)}
                      className={`${idx === doctorIndexMatch ? "matchIndex" : ""}`}
                    >
                      {data?.Name}
                    </li>
                  ))}
                </ul>
              )}
            </div>
            {/* <div className="col-auto mt-1 mb-1"> */}
              <SearchButton
                text={"Search"}
                value={"Search"}
                id="btnSearch"
                onClick={getPendingList}
                className="mx-2"
                loading={loading}
                disabled={loading}
              />
            {/* </div> */}
            {/* <div className="col-md-1 col-sm-2"> */}
              <CustomButton
                text={"Excel"}
                icon={"excel"}
                value={"Excel"}
                id="Excel"
                onClick={exportToExcel}
                className="mx-2"
              />
            {/* </div> */}
            {/* <div className="col-md-1 col-sm-2"> */}
              <CustomButton
                text={"PDF"}
                icon={"pdf"}
                value={"PDF"}
                id="PDF"
                className="mx-2"
                onClick={handleGetReport}
              />
            {/* </div> */}
          </div>
        </Accordion>
      </Accordion>
      <Accordion
        title={t("Search Details")}
        defaultValue={true}
        seconTitle={
          <div className="d-flex align-items-center justify-content-end w-100 px-2 mt-1" style={{ gap: "12px" }}>
            <Input
              type="text"
              name="search"
              id="search-dept-pending"
              placeholder="Search Details..."
              value={searchTerm}
              onChange={handleChangeSearch}
            />
          </div>
        }
      >
        {loading ? (
          <Loading />
        ) : (
          <div className="m-0 p-0">
            <CustomTable
              columns={columns}
              data={formattedTableData}
              tableHeight="table-height"
              scrollView="scrollable"
            />
          </div>
        )}
      </Accordion>
      {showAddRemark.modal && (
        <AddRemark
          show={showAddRemark.modal}
          handleShow={() => {
            setShowAddRemark({ modal: false, rowData: null });
            getPendingList();
          }}
          rowData={showAddRemark.rowData}
          TableData={getPendingList}
          bindTestFromRow={false}
          visitKey="VisitNo"
          testIDsKey="TestIDs"
          testNamesKey="InvestigationNames"
          ledgerTransactionIDKey="LedgerTransactionID"
        />
      )}
      {modal && (
        <CustomModal
          show={modal}
          visitID={visitID}
          onHide={() => setModal(false)}
        />
      )}{" "}
    </>
  );
};

export default DepartmentWisePendingList;
