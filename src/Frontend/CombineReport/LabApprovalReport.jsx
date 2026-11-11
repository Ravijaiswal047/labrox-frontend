import React, { useState, useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import Accordion from "../../components/UI/Accordion";
import PatientRegisterModal from "../utils/PatientRegisterModal";
import { setRefDoctorModalData } from "../../store/reducers/loadingSlice/loadingSlice";
import DatePicker from "../../components/formComponent/DatePicker";
import MultiSelectComp from "../../components/formComponent/MultiSelectComp";
import ReactSelect from "../../components/formComponent/ReactSelect";
import { CustomButton } from "../../components/UI/CustomButton";
import { useTranslation } from "react-i18next";
import Tooltip from "../../components/formComponent/Tooltip";
import Input from "../../components/formComponent/Input";
import { axiosInstance, axiosReport } from "../../utils/axiosInstance";
import { getDoctorSuggestion, GetRateTypeByGlobalCentre } from "../../utils/NetworkApi/commonApi";
import { autocompleteOnBlur, formatStandardDate } from "../../utils/helpers";
import { toast } from "react-toastify";
import AutoComplete from "../../components/formComponent/AutoComplete";

const RadioInput = ({ label, name, id, checked, onChange }) => (
  <div className="form-check">
    <input
      className="form-check-input"
      type="radio"
      name={name}
      id={id}
      checked={checked}
      onChange={onChange}
    />
    <label className="form-check-label" htmlFor={id}>
      {label}
    </label>
  </div>
);

const LabApprovalReport = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { refDoctorModalData } = useSelector((data) => data?.loadingSlice);
  const [show, setShow] = useState({ show: false, Type: "" });
  const [centre, setCentre] = useState([]);
  const [EmployeeName, setEmployeeName] = useState([]);
  const [DepartmentData, setDepartmentData] = useState([]);
  const [RateTypeData, setRateTypeData] = useState([]);
  const [showCentreDropdown, setShowCentreDropdown] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [loadingSearch, setLoadingSearch] = useState(false);
  const [loadingExcel, setLoadingExcel] = useState(false);
  const [pageSize] = useState(50);

  const [formData, setFormData] = useState({
    FromDate: new Date(),
    ToDate: new Date(),
    CentreId: [],
    TestCentreIds: [],
    User: [],
    Department: [],
    ReportType: null,
    SecondReportType: null,
    ViewType: "2",
    ReportFormat: null,
    IsActiveCentre: 1,
    IsActiveUser: 1,
    DoctorName: "",
    DoctorID: "",
    RateTypeID: 0,
    RateTypeLabel: "",
    TestName: "",
    Test: [],
  });

  const [doctorSuggestion, setDoctorSuggestion] = useState([]);
  const [indexMatch, setIndexMatch] = useState(-1);
  const [dropFalse, setDropFalse] = useState(false);
  const [moreErrors, setMoreErrors] = useState({});
  const [rateTypeSuggestions, setRateTypeSuggestions] = useState([]);
  const [rateTypeIndex, setRateTypeIndex] = useState(0);
  const [selectRateType, setSelectRateType] = useState(false);
  const [TestSuggestion, setTestSuggestion] = useState([]);
  const [selects, setSelects] = useState(false);
  const [TestData, setTestData] = useState([]);

  const item = {
    IsMandatory: 0,
    DropDownPattern: "{Name}",
    ControlDisplayID: "DoctorName",
  };

  const handleMultiSelectChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === "TestName") {
      setFormData({ ...formData, [name]: value });
      if (value === "") {
        setSelects(false);
        setTestSuggestion([]);
        setIndexMatch(0);
        return;
      }
      const filtered = TestData?.filter((ele) =>
        ele?.label?.toLowerCase().includes(value.toLowerCase())
      );
      setTestSuggestion(filtered);
      setSelects(true);
      setIndexMatch(0);
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleReactSelectChange = (name, e) => {
    setFormData((prev) => ({ ...prev, [name]: e?.value ?? null }));
  };

  const dateSelect = (date, name) => {
    setFormData((prev) => ({ ...prev, [name]: date }));
  };

  const getTabIndex = (name) => { return -1; };

  const handleShow = (type) => setShow({ show: true, Type: type });
  const handleClose = () => setShow({ show: false, Type: "" });

  const handleListSearch = (data, name) => {
    if (name === "DoctorName") {
      setFormData((prev) => ({
        ...prev,
        DoctorName: data?.Name || "",
        DoctorID: data?.DoctorID || data?.DoctorReferalID || "",
      }));
      setDoctorSuggestion([]);
      setDropFalse(false);
      setIndexMatch(-1);
    }
  };

  const handleIndex = (e) => {
    const { name } = e.target;
    if (name === "DoctorName") {
      switch (e.which) {
        case 38:
          if (doctorSuggestion.length > 0) {
            setIndexMatch((prev) => prev > 0 ? prev - 1 : doctorSuggestion.length - 1);
          }
          break;
        case 40:
          if (doctorSuggestion.length > 0) {
            setIndexMatch((prev) => prev < doctorSuggestion.length - 1 ? prev + 1 : 0);
          }
          break;
        case 13:
          if (indexMatch >= 0 && doctorSuggestion[indexMatch]) {
            handleListSearch(doctorSuggestion[indexMatch], name);
          }
          break;
        default:
          break;
      }
    }
  };

  useEffect(() => {
    if (formData.DoctorName.length > 0 && dropFalse) {
      getDoctorSuggestion(formData, setDoctorSuggestion, setFormData);
    } else if (formData.DoctorName.length === 0) {
      setDoctorSuggestion([]);
      setFormData((prev) => ({ ...prev, DoctorID: "" }));
    }
  }, [formData.DoctorName, dropFalse]);

  useEffect(() => {
    if (refDoctorModalData?.doctorId || refDoctorModalData?.DoctorReferalID) {
      setFormData((prev) => ({
        ...prev,
        DoctorName: refDoctorModalData?.Name || refDoctorModalData?.name || "",
        DoctorID:
          refDoctorModalData?.doctorId || refDoctorModalData?.DoctorReferalID,
      }));
      setDropFalse(false);
      dispatch(setRefDoctorModalData(null));
    }
  }, [refDoctorModalData?.doctorId, refDoctorModalData?.DoctorReferalID]);

  const handleRadioChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleRateTypeChange = (e) => {
    const value = e.target.value;
    setFormData((prev) => ({ ...prev, RateTypeLabel: value }));
    if (value.trim() === "") {
      setSelectRateType(false);
      setRateTypeSuggestions([]);
      setFormData((prev) => ({ ...prev, RateTypeID: 0, RateTypeLabel: "" }));
    } else {
      const filtered = RateTypeData.filter((item) =>
        item.label.toLowerCase().includes(value.toLowerCase())
      );
      setRateTypeSuggestions(filtered);
      setSelectRateType(true);
    }
  };

  const handleRateTypeSelect = (selected) => {
    if (selected) {
      setFormData((prev) => ({
        ...prev,
        RateTypeLabel: selected.label,
        RateTypeID: selected.value,
        RateType: [selected.value],
      }));
      setRateTypeSuggestions([]);
      setSelectRateType(false);
    }
  };

  const handleRateTypeKeyDown = (e) => {
    if (rateTypeSuggestions.length === 0) return;
    if (e.which === 38) {
      setRateTypeIndex((prev) => prev > 0 ? prev - 1 : rateTypeSuggestions.length - 1);
    } else if (e.which === 40) {
      setRateTypeIndex((prev) => prev === rateTypeSuggestions.length - 1 ? 0 : prev + 1);
    } else if (e.which === 13) {
      handleRateTypeSelect(rateTypeSuggestions[rateTypeIndex]);
      setRateTypeIndex(0);
    }
  };

  const getAccessCentres = async () => {
    try {
      const res = await axiosInstance.get(`Centre/GetAllAccessCentres?IsActive=${formData.IsActiveCentre}`);
      const data = res.data.message;
      if (res.data?.success && Array.isArray(data)) {
        setCentre(data.map((ele) => ({ value: ele.CentreID, label: ele.Centre })));
        setFormData((prev) => ({ ...prev, CentreId: [] }));
      } else {
        toast.error(res.data?.message || "Failed to fetch centres");
        setCentre([]);
      }
    } catch (error) {
      console.log("Error while fetching centres", error);
    }
  };

  const getEmployees = async () => {
    try {
      const res = await axiosInstance.get(`Camp/GetAllEmployees?IsActive=${formData.IsActiveUser}`);
      const data = res.data.message;
      if (res.data?.success && Array.isArray(data)) {
        setEmployeeName(data.map((ele) => ({ value: ele.EmployeeID, label: ele.NAME })));
        setFormData((prev) => ({ ...prev, User: [] }));
      } else {
        toast.error(res.data?.message || "Failed to fetch employees");
        setEmployeeName([]);
      }
    } catch (error) {
      console.log("Error while fetching employees", error);
    }
  };

  const getDepartmentReports = async () => {
    try {
      const res = await axiosInstance.get("Department/getDepartment");
      setDepartmentData(res.data.message.map((ele) => ({ value: ele.DepartmentID, label: ele.Department })));
    } catch (err) {
      console.log("Error while fetching departments", err);
    }
  };

  const handleIndexNew = (e, name) => {
    switch (name) {
      case "TestName":
        switch (e.which) {
          case 38:
            if (TestSuggestion.length > 0) {
              setIndexMatch((prev) => prev > 0 ? prev - 1 : TestSuggestion.length - 1);
            }
            break;
          case 40:
            if (TestSuggestion.length > 0) {
              setIndexMatch((prev) => prev < TestSuggestion.length - 1 ? prev + 1 : 0);
            }
            break;
          case 13:
            if (TestSuggestion[indexMatch]) {
              handleListSearchNew(TestSuggestion[indexMatch], name);
            }
            break;
          default:
            break;
        }
        break;
      default:
        break;
    }
  };

  const handleListSearchNew = (data, name) => {
    switch (name) {
      case "TestName":
        setFormData({ ...formData, TestName: data?.label, Test: [data] });
        setSelects(false);
        setTestSuggestion([]);
        setIndexMatch(0);
        break;
      default:
        break;
    }
  };

  useEffect(() => { getAccessCentres(); }, [formData.IsActiveCentre]);
  useEffect(() => { getEmployees(); }, [formData.IsActiveUser]);

  const getInvestigationList = () => {
    axiosInstance
      .get("Investigations/BindInvestigationList")
      .then((res) => {
        const MapTest = res.data.message.map((ele) => ({ value: ele.InvestigationID, label: ele.TestName }));
        setTestData(MapTest);
        setTestSuggestion(MapTest);
      })
      .catch((err) => console.log(err));
  };

  useEffect(() => {
    getDepartmentReports();
    GetRateTypeByGlobalCentre(setRateTypeData);
    getInvestigationList();
  }, []);

  // ─── Build Payload ────────────────────────────────────────────────
  const buildPayload = (format, page = 1) => ({
    reportTypeI: formData.ViewType ? String(formData.ViewType) : "",
    reportTypeII: formData.SecondReportType ? String(formData.SecondReportType) : "",
    dateType: formData.ReportType || "",
    fromDate: formatStandardDate(formData.FromDate, "YYYY-MM-DD"),
    toDate: formatStandardDate(formData.ToDate, "YYYY-MM-DD"),
    reportFormat: format,
    centreIds: formData.CentreId?.map((c) => c.value ?? c) ?? [],
    TestCentreIds: formData.TestCentreIds?.map((c) => c.value ?? c) ?? [],
    userIds: formData.User?.map((u) => u.value ?? u) ?? [],
    pannelId: formData.Test?.map((t) => t.value ?? t) ?? [],
    deptIds: formData.Department?.map((d) => d.value ?? d) ?? [],
    doctorId: formData.DoctorID ? [formData.DoctorID] : [],
    rateTypeId: Number(formData.RateTypeID) || 0,
    pageNumber: page,
    pageSize: pageSize,
  });

  // ─── Common blob validator ────────────────────────────────────────
  const validateBlob = async (res) => {
    const blob = new Blob([res.data]);
    const isJson =
      res.headers?.["content-type"]?.includes("application/json") ||
      res.headers?.["content-type"]?.includes("text/plain");

    if (isJson || blob.size < 500) {
      const text = await blob.text();
      try {
        const json = JSON.parse(text);
        if (!json?.success) {
          toast.error(json?.message || t("No data found"));
          return false;
        }
      } catch {
        if (blob.size === 0) {
          toast.warning(t("No records found for selected filters"));
          return false;
        }
      }
    }

    if (blob.size === 0) {
      toast.warning(t("No records found for selected filters"));
      return false;
    }
    return true;
  };

  // ─── Common blob error handler ────────────────────────────────────
  const handleBlobError = async (err) => {
    console.error(err);
    if (err?.response?.data instanceof Blob) {
      try {
        const text = await err.response.data.text();
        const json = JSON.parse(text);
        toast.error(json?.message || t("Error generating report"));
      } catch {
        toast.error(t("Error generating report"));
      }
    } else {
      toast.error(t("Error generating report"));
    }
  };

  // ─── Handle PDF ───────────────────────────────────────────────────
  const handlePdf = () => {
    setLoadingSearch(true);
    const payload = buildPayload("Pdf");

    axiosReport
      .post("TATMIS/LabApprovalReport", payload, { responseType: "blob" })
      .then(async (res) => {
        const isValid = await validateBlob(res);
        if (!isValid) return;

        const typedBlob = new Blob([res.data], { type: "application/pdf" });
        const url = window.URL.createObjectURL(typedBlob);
        const newTab = window.open(url, "_blank");
        if (!newTab) {
          toast.warning(t("Popup blocked! Please allow popups and try again."));
        } else {
          toast.success(t("PDF opened successfully"));
        }
        setTimeout(() => window.URL.revokeObjectURL(url), 5000);
      })
      .catch(handleBlobError)
      .finally(() => setLoadingSearch(false));
  };

  // ─── Handle Excel ─────────────────────────────────────────────────
  const handleExcel = () => {
    setLoadingExcel(true);
    const payload = buildPayload("Excel");

    axiosReport
      .post("TATMIS/LabApprovalReport", payload, { responseType: "blob" })
      .then(async (res) => {
        const isValid = await validateBlob(res);
        if (!isValid) return;

        const mimeType = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
        const typedBlob = new Blob([res.data], { type: mimeType });
        const url = window.URL.createObjectURL(typedBlob);
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", `LabApprovalReport_${new Date().toISOString().slice(0, 10)}.xlsx`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.success(t("Excel downloaded successfully"));
        setTimeout(() => window.URL.revokeObjectURL(url), 5000);
      })
      .catch(handleBlobError)
      .finally(() => setLoadingExcel(false));
  };

  return (
    <>
      {show?.show && (
        <PatientRegisterModal
          show={show?.show}
          handleClose={handleClose}
          Type={show?.Type}
        />
      )}
      <Accordion title={t("Lab Approval Report")} defaultValue={true}>
        <div className="row px-2 mt-2 p-1">
          <div className="col-12 col-sm-6 col-md-2 my-1">
            <ReactSelect
              className="required-fields"
              dynamicOptions={[
                { label: "Registration Date", value: "RegistrationDate" },
                { label: "Approve Date", value: "ApprovedDate" },
              ]}
              value={formData?.ReportType}
              name="ReportType"
              onChange={handleReactSelectChange}
              label={t("Report Type")}
              removeIsClearable={true}
              placeholderName={t("Report Type")}
            />
          </div>
          <div className="col-12 col-sm-6 col-md-2 my-1">
            <DatePicker
              name="FromDate"
              value={formData.FromDate}
              onChange={dateSelect}
              maxDate={new Date()}
              lable={t("From Date")}
              className="custom-calendar"
            />
          </div>
          <div className="col-12 col-sm-6 col-md-2 my-1">
            <DatePicker
              name="ToDate"
              value={formData.ToDate}
              onChange={dateSelect}
              maxDate={new Date()}
              minDate={formData.FromDate}
              lable={t("To Date")}
              className="custom-calendar"
            />
          </div>
          <div className="col-12 col-sm-6 col-md-2 my-1">
            <Input
              type="text"
              name="RateTypeID"
              lable={t("Rate Type")}
              value={formData.RateTypeLabel || ""}
              placeholder=" "
              onChange={handleRateTypeChange}
              onKeyDown={handleRateTypeKeyDown}
              onBlur={(e) => {
                const snapshot = [...rateTypeSuggestions];
                autocompleteOnBlur(setRateTypeSuggestions);
                setTimeout(() => {
                  setFormData((prev) => {
                    const typed = (e.target.value || "").trim();
                    if (!typed) return { ...prev, RateTypeID: 0, RateTypeLabel: "", RateType: [] };
                    if (prev.RateTypeID && prev.RateTypeLabel && prev.RateTypeLabel.toLowerCase() === typed.toLowerCase()) return prev;
                    const match = snapshot.find((ele) => ele.label.toLowerCase() === typed.toLowerCase());
                    if (match) return { ...prev, RateTypeLabel: match.label, RateTypeID: Number(match.value), RateType: [Number(match.value)] };
                    const fullMatch = RateTypeData.find((ele) => ele.label.toLowerCase() === typed.toLowerCase());
                    if (fullMatch) return { ...prev, RateTypeLabel: fullMatch.label, RateTypeID: Number(fullMatch.value), RateType: [Number(fullMatch.value)] };
                    return { ...prev, RateTypeID: 0, RateType: [] };
                  });
                }, 200);
              }}
            />
            {selectRateType && rateTypeSuggestions.length > 0 && (
              <AutoComplete
                selects={selectRateType}
                test={rateTypeSuggestions.map((item) => ({ TestName: item.label }))}
                handleListSearch={(selected) =>
                  handleRateTypeSelect(rateTypeSuggestions.find((item) => item.label === selected.TestName))
                }
                indexMatch={rateTypeIndex}
              />
            )}
          </div>
          <div className="col-12 col-sm-6 col-md-2 my-1">
            <div className="p-inputgroup d-flex" style={{ position: "relative", gap: "5px" }}>
              <div style={{ width: "87%" }}>
                <Input
                  tabIndex={getTabIndex("DoctorName")}
                  className={`required-fields ${!formData?.DoctorName && item?.IsMandatory ? "mandatory_field" : ""}`}
                  id="DoctorName"
                  name="DoctorName"
                  lable={t("Referred Doctor")}
                  onChange={(e) => {
                    setFormData((prev) => ({ ...prev, DoctorName: e.target.value }));
                    setDropFalse(true);
                  }}
                  onBlur={() => {
                    setIndexMatch(-1);
                    setDoctorSuggestion([]);
                    setDropFalse(false);
                  }}
                  value={formData?.DoctorName}
                  onKeyDown={handleIndex}
                  placeholder={t(" ")}
                  type="text"
                />
                {dropFalse && doctorSuggestion.length > 0 && (
                  <ul className="suggestion-data" style={{ zIndex: 9999, width: "100%", position: "absolute", top: "100%", left: 0, background: "white", padding: 0, margin: 0, listStyle: "none", boxShadow: "0 4px 6px rgba(0,0,0,0.1)", border: "1px solid #ddd" }}>
                    {doctorSuggestion.map((data, index) => {
                      const dept = data?.Department || data?.DeptName || data?.DepartmentName || data?.dept || data?.DoctorDepartment || data?.DeptlName || "";
                      const spec = data?.Specialization || data?.Speciality || data?.Speclization || data?.spec || data?.SpecializationName || "";
                      const pattern = item?.DropDownPattern || "{Name}";
                      const separatorMatch = pattern.match(/}\s*(.*?)\s*{/);
                      const separator = separatorMatch ? separatorMatch[1] : " ";
                      const keys = pattern.match(/{(.*?)}/g)?.map((key) => key.replace(/[{}]/g, "").trim()) || [];
                      const fieldMap = { name: data?.Name, mobile: data?.Mobile, dept, spec };
                      const displayString = keys
                        .map((key) => fieldMap[key.toLowerCase()])
                        .filter((value) => value && String(value).trim() !== "" && value !== 0 && value !== "0")
                        .join(separator);
                      return (
                        <li
                          key={index}
                          onMouseDown={(e) => { e.preventDefault(); handleListSearch(data, "DoctorName"); }}
                          className={`${index === indexMatch ? "matchIndex" : ""}`}
                          style={{ padding: "4px", cursor: "pointer", color: index === indexMatch ? "white" : "black", backgroundColor: index === indexMatch ? "#4aa0fcff" : "white" }}
                        >
                          {displayString}
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
              <div style={{ width: "10%" }}>
                <Tooltip label={t("Add Referred Doctor")}>
                  <button type="button" className="btn btn-sm btn-primary" onClick={() => handleShow("Refer")}>
                    <i className="fa fa-plus-circle fa-sm new_record_pluse"></i>
                  </button>
                </Tooltip>
              </div>
            </div>
            {item?.IsMandatory === 1 && moreErrors?.[item.ControlDisplayID] && (
              <div className="error-message text-danger small">{moreErrors[item.ControlDisplayID]}</div>
            )}
            {formData.DoctorName !== "" && formData?.DoctorID === "" && (
              <div className="error-message text-danger small">Doctor is required</div>
            )}
          </div>
          
          <div className="col-12 col-sm-6 col-md-2 my-1">
            <div className="d-flex" style={{ gap: "5px" }}>
              <div style={{ width: "87%" }}>
                <MultiSelectComp label="All Centre" options={centre} value={formData?.CentreId} name="CentreId" id="CentreId" onChange={handleMultiSelectChange} lable={t("Select Centre")} />
              </div>
              <div style={{ width: "10%", position: "relative" }}>
                <Tooltip label={t("Status")} position="top">
                  <button type="button" className="btn btn-sm btn-primary" onClick={() => { setShowCentreDropdown((prev) => !prev); setShowUserDropdown(false); }}>
                    <i className="fa fa-plus-circle fa-sm"></i>
                  </button>
                </Tooltip>
                {showCentreDropdown && (
                  <div className="dropdown-menu show p-2" style={{ position: "absolute", top: "100%", left: "-100px", zIndex: 1000, minWidth: "120px", boxShadow: "0 2px 5px rgba(0,0,0,0.2)", borderRadius: "5px" }}>
                    <RadioInput label={t("Both")} name="IsActiveCentre" id="IsActiveCentreBoth" checked={formData.IsActiveCentre === 2} onChange={() => handleRadioChange("IsActiveCentre", 2)} />
                    <RadioInput label={t("Active")} name="IsActiveCentre" id="IsActiveCentreActive" checked={formData.IsActiveCentre === 1} onChange={() => handleRadioChange("IsActiveCentre", 1)} />
                    <RadioInput label={t("Inactive")} name="IsActiveCentre" id="IsActiveCentreInactive" checked={formData.IsActiveCentre === 0} onChange={() => handleRadioChange("IsActiveCentre", 0)} />
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="col-12 col-sm-6 col-md-2 my-1">
            <MultiSelectComp 
              label="Test Centres" 
              options={centre} 
              value={formData?.TestCentreIds} 
              name="TestCentreIds" 
              id="TestCentreIds" 
              onChange={handleMultiSelectChange} 
              lable={t("Select Test Centre")} />
          </div>
          <div className="col-12 col-sm-6 col-md-2 my-1">
            <div className="d-flex" style={{ gap: "5px" }}>
              <div style={{ width: "87%" }}>
                <MultiSelectComp label="All Employee" options={EmployeeName} value={formData?.User} name="User" id="User" onChange={handleMultiSelectChange} lable={t("Select Employee")} />
              </div>
              <div style={{ width: "10%", position: "relative" }}>
                <Tooltip label={t("Status")} position="top">
                  <button type="button" className="btn btn-sm btn-primary" onClick={() => { setShowUserDropdown((prev) => !prev); setShowCentreDropdown(false); }}>
                    <i className="fa fa-plus-circle fa-sm"></i>
                  </button>
                </Tooltip>
                {showUserDropdown && (
                  <div className="dropdown-menu show p-2" style={{ position: "absolute", top: "100%", left: "0", zIndex: 1000, minWidth: "120px", boxShadow: "0 2px 5px rgba(0,0,0,0.2)", borderRadius: "5px" }}>
                    <RadioInput label={t("Both")} name="IsActiveUser" id="IsActiveUserBoth" checked={formData.IsActiveUser === 2} onChange={() => handleRadioChange("IsActiveUser", 2)} />
                    <RadioInput label={t("Active")} name="IsActiveUser" id="IsActiveUserActive" checked={formData.IsActiveUser === 1} onChange={() => handleRadioChange("IsActiveUser", 1)} />
                    <RadioInput label={t("Inactive")} name="IsActiveUser" id="IsActiveUserInactive" checked={formData.IsActiveUser === 0} onChange={() => handleRadioChange("IsActiveUser", 0)} />
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="col-12 col-sm-6 col-md-2 my-1">
            <MultiSelectComp placeholder={t("Select Department")} options={DepartmentData} value={formData.Department} name="Department" onChange={handleMultiSelectChange} lable={t("Department")} />
          </div>
          <div className="col-12 col-sm-6 col-md-2 my-1">
            <Input
              type="text"
              name="TestName"
              lable={t("Search By Test Name")}
              id="TestName"
              value={formData.TestName || ""}
              placeholder=" "
              onChange={handleInputChange}
              onKeyDown={(e) => handleIndexNew(e, "TestName")}
              onBlur={(e) => { autocompleteOnBlur(setTestSuggestion); }}
            />
            {selects && TestSuggestion.length > 0 && formData.TestName && (
              <ul className="suggestion-data" style={{ zIndex: 99 }}>
                {TestSuggestion.map((data, index) => (
                  <li onClick={() => handleListSearchNew(data, "TestName")} className={`${index === indexMatch && "matchIndex"}`} key={index}>
                    {data?.label}
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div className="col-12 col-sm-6 col-md-2 my-1">
            <ReactSelect
              className="required-fields"
              dynamicOptions={[
                { label: "Doctor Wise & Approved By", value: "2" },
                { label: "Result Entered By", value: "1" },
              ]}
              value={formData?.SecondReportType}
              name="SecondReportType"
              onChange={handleReactSelectChange}
              label={t("Second Report Type")}
              removeIsClearable={true}
              placeholderName={t("Second Report Type")}
            />
          </div>
          <div className="col-12 col-sm-6 col-md-2 my-1">
            <ReactSelect
              className="required-fields"
              dynamicOptions={[
                { label: "Summary", value: "2" },
                { label: "Detail", value: "1" },
              ]}
              value={formData?.ViewType}
              name="ViewType"
              onChange={handleReactSelectChange}
              label={t("View Type")}
              removeIsClearable={true}
              placeholderName={t("View Type")}
            />
          </div>
          <div className="col-12 col-sm-6 col-md-2 my-1">
            <CustomButton
              className="mr-2"
              text={t("Pdf")}
              onClick={handlePdf}
              loading={loadingSearch}
              icon={"pdf"}
            />
            <CustomButton
              text={t("Excel")}
              onClick={handleExcel}
              loading={loadingExcel}
              icon={"excel"}
            />
          </div>
        </div>
      </Accordion>
    </>
  );
};

export default LabApprovalReport;