import React, { useState, useEffect } from "react";
import Accordion from "../../components/UI/Accordion";
import DatePicker from "../../components/formComponent/DatePicker";
import MultiSelectComp from "../../components/formComponent/MultiSelectComp";
import ReactSelect from "../../components/formComponent/ReactSelect";
import { CustomButton } from "../../components/UI/CustomButton";
import { useTranslation } from "react-i18next";
import Tooltip from "../../components/formComponent/Tooltip";
import Input from "../../components/formComponent/Input";
import { axiosInstance, axiosReport } from "../../utils/axiosInstance";
import { getDoctorSuggestion } from "../../utils/NetworkApi/commonApi";
import { formatStandardDate } from "../../utils/helpers";
import { toast } from "react-toastify";

const item = {
  IsMandatory: 0,
  DropDownPattern: "{Name}",
  ControlDisplayID: "DoctorName",
};

const CallLogReport = () => {
  const { t } = useTranslation();
  const [DepartmentData, setDepartmentData] = useState([]);
  const [ObservationData, setObservationData] = useState([]);
  const [BookingCentreData, setBookingCentreData] = useState([]);

  const [doctorSuggestion, setDoctorSuggestion] = useState([]);
  const [doctorIndexMatch, setDoctorIndexMatch] = useState(-1);
  const [dropFalse, setDropFalse] = useState(false);

  const [loadingSearch, setLoadingSearch] = useState(false);
  const [loadingExcel, setLoadingExcel] = useState(false);
  const [loadingObservations, setLoadingObservations] = useState(false);

  const [formData, setFormData] = useState({
    FromDate: new Date(),
    ToDate: new Date(),
    Department: [],
    BookingCentre: [],
    DoctorName: "",
    DoctorID: "",
    Observations: [],
    dateType: 0,
  });

  const dateTypeOptions = [
    { label: t("Booking Date"), value: 0 },
    { label: t("Approve Date"), value: 1 },
    { label: t("ResultSave Date"), value: 2 },
  ];

  const getDepartmentReports = async () => {
    try {
      const res = await axiosInstance.get("Department/getDepartment");
      const data = res.data.message;
      const mapped = data.map((ele) => ({
        value: ele.DepartmentID,
        label: ele.Department,
      }));
      setDepartmentData(mapped);
    } catch (err) {
      console.error("Error fetching departments", err);
    }
  };

  const getAccessCentres = async () => {
    try {
      const res = await axiosInstance.get("Centre/getAccessCentres");
      const data = res.data.message;
      const mapped = data.map((ele) => ({
        value: ele.CentreID,
        label: ele.Centre,
      }));
      setBookingCentreData(mapped);
    } catch (err) {
      console.error("Error fetching centres", err);
    }
  };

  useEffect(() => {
    getDepartmentReports();
    getAccessCentres();
  }, []);

  useEffect(() => {
    const deptIds = (formData.Department ?? [])
      .filter(Boolean)
      .map((d) => (typeof d === "object" ? d?.value : d))
      .filter((v) => v !== undefined && v !== null);

    if (deptIds.length === 0) {
      setObservationData([]);
      setFormData((prev) => ({ ...prev, Observations: [] }));
      return;
    }

    setLoadingObservations(true);
    axiosReport
      .post("CombineLabReport/GetObservationsByDept/GetObservationsByDept", {
        departmentIds: deptIds,
      })
      .then((res) => {
        const data = res.data?.message ?? res.data ?? [];
        const mapped = Array.isArray(data)
          ? data
              .filter(Boolean)
              .map((ele) => ({
                value:
                  ele.LabObservationID ??
                  ele.ObservationID ??
                  ele.TestID ??
                  ele.InvestigationID ??
                  ele.id ??
                  null,
                label:
                  ele.ObservationName ??
                  ele.TestName ??
                  ele.InvestigationName ??
                  ele.Name ??
                  ele.label ??
                  "",
              }))
              .filter((i) => i.value !== null && i.value !== undefined)
          : [];

        setObservationData(mapped);

        setFormData((prev) => ({
          ...prev,
          Observations: (prev.Observations ?? [])
            .filter(Boolean)
            .filter((o) => {
              const oVal = o?.value ?? o;
              return mapped.some((m) => m.value === oVal);
            }),
        }));
      })
      .catch((err) => {
        console.error("Error fetching observations", err);
        toast.error(t("Failed to fetch tests for selected departments"));
      })
      .finally(() => setLoadingObservations(false));
  }, [formData.Department]);

  useEffect(() => {
    if (formData.DoctorName.length > 0 && dropFalse) {
      getDoctorSuggestion(formData, setDoctorSuggestion, setFormData);
    } else if (formData.DoctorName.length === 0) {
      setDoctorSuggestion([]);
      setFormData((prev) => ({ ...prev, DoctorID: "" }));
    }
  }, [formData.DoctorName, dropFalse]);

  const handleDoctorKeyDown = (e) => {
    if (e.target.name !== "DoctorName") return;
    switch (e.which) {
      case 38:
        setDoctorIndexMatch((prev) =>
          prev > 0 ? prev - 1 : doctorSuggestion.length - 1,
        );
        break;
      case 40:
        setDoctorIndexMatch((prev) =>
          prev < doctorSuggestion.length - 1 ? prev + 1 : 0,
        );
        break;
      case 13:
        if (doctorIndexMatch >= 0 && doctorSuggestion[doctorIndexMatch]) {
          selectDoctor(doctorSuggestion[doctorIndexMatch]);
        }
        break;
      default:
        break;
    }
  };

  const selectDoctor = (data) => {
    setFormData((prev) => ({
      ...prev,
      DoctorName: data?.Name || "",
      DoctorID: data?.DoctorID || data?.DoctorReferalID || "",
    }));
    setDoctorSuggestion([]);
    setDropFalse(false);
    setDoctorIndexMatch(-1);
  };

  const handleMultiSelectChange = (name, value) => {
    const clean = Array.isArray(value) ? value.filter(Boolean) : [];
    setFormData((prev) => ({ ...prev, [name]: clean }));
  };

  const handleReactSelectChange = (name, e) => {
    setFormData((prev) => ({ ...prev, [name]: e?.value ?? null }));
  };

  const dateSelect = (date, name) => {
    setFormData((prev) => ({ ...prev, [name]: date }));
  };

  const SEARCH_TYPE_MAP = {
    0: "BookingDate",
    1: "ApprovedDate",
    2: "ResultSaveDate",
  };

  const buildPayload = (format = "Pdf") => {
    const testIds = (formData.Observations ?? [])
      .filter(Boolean)
      .map((o) => (typeof o === "object" ? o?.value : o))
      .filter((v) => v !== undefined && v !== null);

    const centreIds = (formData.BookingCentre ?? [])
      .filter(Boolean)
      .map((c) => (typeof c === "object" ? c?.value : c))
      .filter((v) => v !== undefined && v !== null);

    const departmentIds = (formData.Department ?? [])
      .filter(Boolean)
      .map((d) => (typeof d === "object" ? d?.value : d))
      .filter((v) => v !== undefined && v !== null);

    return {
      fromDate: formatStandardDate(formData.FromDate, "YYYY-MM-DD"),
      toDate: formatStandardDate(formData.ToDate, "YYYY-MM-DD"),
      searchType: SEARCH_TYPE_MAP[formData.dateType] ?? "BookingDate",
      centreIds: centreIds.length > 0 ? centreIds : [0],
      departmentIds: departmentIds.length > 0 ? departmentIds : [0],
      testIds: testIds.length > 0 ? testIds : [0],
      doctorIds: formData.DoctorID ? [formData.DoctorID] : [0],
      reportType: format === "Pdf" ? "PDF" : "Excel",
    };
  };
 {/* Add API */}
  const handleSearch = (format = "Pdf") => {
    if (formData.DoctorName && !formData.DoctorID) {
      toast.warning(t("Please select a valid doctor from suggestions"));
      return;
    }

    if (format === "Excel") setLoadingExcel(true);
    else setLoadingSearch(true);

    const payload = buildPayload(format);

    axiosReport
      .post("commonReports/CriticalCallLogReport", payload, {
        responseType: "blob",
      })
      .then(async (res) => {
        const blob = new Blob([res.data]);

        const isJsonContent =
          res.headers?.["content-type"]?.includes("application/json") ||
          res.headers?.["content-type"]?.includes("text/plain");

        if (isJsonContent || blob.size < 500) {
          const text = await blob.text();
          try {
            const json = JSON.parse(text);
            if (!json?.success) {
              toast.error(json?.message || t("No data found"));
              return;
            }
          } catch {
            if (blob.size === 0) {
              toast.warning(t("No records found for selected filters"));
              return;
            }
          }
        }

        if (blob.size === 0) {
          toast.warning(t("No records found for selected filters"));
          return;
        }

        const mimeType =
          format === "Pdf"
            ? "application/pdf"
            : "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
        const extension = format === "Pdf" ? "pdf" : "xlsx";

        const typedBlob = new Blob([res.data], { type: mimeType });
        const url = window.URL.createObjectURL(typedBlob);

        if (format === "Pdf") {
          const newTab = window.open(url, "_blank");
          if (!newTab) {
            toast.warning(t("Popup blocked! Please allow popups and try again."));
          } else {
            toast.success(t("PDF opened successfully"));
          }
        } else {
          const link = document.createElement("a");
          link.href = url;
          link.download = `CallLogReport_${Date.now()}.${extension}`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          toast.success(t("Excel downloaded successfully"));
        }

        setTimeout(() => window.URL.revokeObjectURL(url), 5000);
      })
      .catch(async (err) => {
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
      })
      .finally(() => {
        setLoadingSearch(false);
        setLoadingExcel(false);
      });
  };

  return (
    <>
      <Accordion title={"Call Log Report"} defaultValue={true}>
        <div className="row px-2 mt-2 p-1">
          <div className="col-12 col-sm-6 col-md-2 my-1">
            <ReactSelect
              className="required-fields"
              dynamicOptions={dateTypeOptions}
              value={formData.dateType}
              name="dateType"
              onChange={handleReactSelectChange}
              removeIsClearable={true}
              placeholderName={t("Search By")}
            />
          </div>

          <div className="col-12 col-sm-6 col-md-2 my-1">
            <MultiSelectComp
              options={BookingCentreData}
              value={formData.BookingCentre}
              name="BookingCentre"
              onChange={handleMultiSelectChange}
              label={t("Booking Centre")}
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
            <div
              className="p-inputgroup d-flex"
              style={{ position: "relative", gap: "5px" }}
            >
              <div style={{ width: "100%" }}>
                <Input
                  id="DoctorName"
                  name="DoctorName"
                  lable={t("Referred Doctor")}
                  onChange={(e) => {
                    setFormData((prev) => ({
                      ...prev,
                      DoctorName: e.target.value,
                    }));
                    setDropFalse(true);
                  }}
                  onBlur={() => {
                    setDoctorIndexMatch(-1);
                    setDoctorSuggestion([]);
                    setDropFalse(false);
                  }}
                  value={formData.DoctorName}
                  onKeyDown={handleDoctorKeyDown}
                  placeholder={t(" ")}
                  type="text"
                />
                {dropFalse && doctorSuggestion.length > 0 && (
                  <ul
                    className="suggestion-data"
                    style={{
                      zIndex: 9999,
                      width: "100%",
                      position: "absolute",
                      top: "100%",
                      left: 0,
                      background: "white",
                      padding: 0,
                      margin: 0,
                      listStyle: "none",
                      boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
                      border: "1px solid #ddd",
                    }}
                  >
                    {doctorSuggestion.map((data, index) => {
                      const pattern = item?.DropDownPattern || "{Name}";
                      const separatorMatch = pattern.match(/}\s*(.*?)\s*{/);
                      const separator = separatorMatch ? separatorMatch[1] : " ";
                      const keys =
                        pattern
                          .match(/{(.*?)}/g)
                          ?.map((k) => k.replace(/[{}]/g, "").trim()) || [];
                      const dept =
                        data?.Department || data?.DeptName || data?.DepartmentName || "";
                      const spec = data?.Specialization || data?.Speciality || "";
                      const fieldMap = { name: data?.Name, mobile: data?.Mobile, dept, spec };
                      const displayString = keys
                        .map((k) => fieldMap[k.toLowerCase()])
                        .filter((v) => v && String(v).trim() !== "" && v !== 0 && v !== "0")
                        .join(separator);
                      return (
                        <li
                          key={index}
                          onMouseDown={(e) => {
                            e.preventDefault();
                            selectDoctor(data);
                          }}
                          className={index === doctorIndexMatch ? "matchIndex" : ""}
                          style={{
                            padding: "4px",
                            cursor: "pointer",
                            color: index === doctorIndexMatch ? "white" : "black",
                            backgroundColor: index === doctorIndexMatch ? "#4aa0fcff" : "white",
                          }}
                        >
                          {displayString}
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
              {/* <div style={{ width: "10%" }}>
                <Tooltip label={t("Add Referred Doctor")}>
                  <button type="button" className="btn btn-sm btn-primary">
                    <i className="fa fa-plus-circle fa-sm new_record_pluse"></i>
                  </button>
                </Tooltip>
              </div> */}
            </div>
            {formData.DoctorName !== "" && formData.DoctorID === "" && (
              <div className="error-message text-danger small">
                {t("Doctor is required")}
              </div>
            )}
          </div>

          <div className="col-12 col-sm-6 col-md-2 my-1">
            <MultiSelectComp
              placeholder={t("Select Department")}
              options={DepartmentData}
              value={formData.Department}
              name="Department"
              onChange={handleMultiSelectChange}
              lable={t("Department")}
            />
          </div>

          <div className="col-12 col-sm-6 col-md-2 my-1">
            <MultiSelectComp
              placeholder={t("Select Observations Test")}
              options={ObservationData}
              value={formData.Observations}
              name="Observations"
              onChange={handleMultiSelectChange}
              lable={t("Test / Observation")}
              isDisabled={formData.Department.length === 0 || loadingObservations}
            />
          </div>

          <div className="col-12 col-sm-6 col-md-2 my-1">
            <CustomButton
              className="mr-2"
              text={t("Pdf")}
              onClick={() => handleSearch("Pdf")}
              loading={loadingSearch}
              icon={"Pdf"}
            />
            <CustomButton
              className="mr-2"
              text={t("Excel")}
              onClick={() => handleSearch("Excel")}
              loading={loadingExcel}
              icon={"file-excel"}
            />
          </div>
        </div>
      </Accordion>
    </>
  );
};

export default CallLogReport;
