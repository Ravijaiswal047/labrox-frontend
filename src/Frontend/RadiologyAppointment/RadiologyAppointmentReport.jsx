import React, { useEffect, useState } from "react";
import moment from "moment";
import { toast } from "react-toastify";
import Accordion from "../../components/UI/Accordion";
import DatePicker from "../../components/formComponent/DatePicker";
import ReactSelect from "../../components/formComponent/ReactSelect";
import MultiSelectComp from "../../components/formComponent/MultiSelectComp";
import Loading from "../../components/loader/Loading";
import { SearchButton } from "../../components/UI/CustomButton";
import { axiosReport } from "../../utils/axiosInstance";
import { bindCentresForRadiology, getDepartments } from "./api";

const dateTypeOptions = [
  { label: "Appointment Date", value: "a.AppDate" },
  { label: "Entry Date", value: "a.EntryDate" },
];

const panelOptions = [
  { label: "ALL", value: "ALL" },
  { label: "Confirmed", value: "Confirmed" },
  { label: "Cancelled", value: "Cancelled" },
];

const RadiologyAppointmentReport = () => {
  const [centres, setCentres] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    FromDate: new Date(),
    ToDate: new Date(),
    centreID: [],
    dateType: "a.AppDate",
    deptID: null,
    isCancel: false,
    isConfirm: false,
    panel: "ALL",
  });

  useEffect(() => {
    loadCentres();
    loadDepartments();
  }, []);

  const loadCentres = async () => {
    try {
      const res = await bindCentresForRadiology();
      const data = (res?.data?.message || []).map((c) => ({
        value: c.CentreId ?? c.CentreID,
        label: c.Centre ?? c.CentreName,
      }));
      setCentres(data);
    } catch {
      toast.error("Failed to load centres.");
    }
  };

  const loadDepartments = async () => {
    try {
      const res = await getDepartments();
      const data = (res?.data?.message || []).map((d) => ({
        value: d.DepartmentID,
        label: d.Department,
      }));
      setDepartments([{ value: null, label: "All Departments" }, ...data]);
    } catch {
      toast.error("Failed to load departments.");
    }
  };

  const dateSelect = (value, name) => {
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleReactSelect = (name, option) => {
    setForm((prev) => ({ ...prev, [name]: option?.value ?? null }));
  };

  const handleMultiSelect = (name, values) => {
    setForm((prev) => ({ ...prev, [name]: Array.isArray(values) ? values : [] }));
  };

  const handleCheckbox = (e) => {
    const { name, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: checked }));
  };

  const buildPayload = () => ({
    fromDate: moment(form.FromDate).format("YYYY-MM-DD"),
    toDate: moment(form.ToDate).format("YYYY-MM-DD"),
    centreID: form.centreID.length > 0 ? form.centreID : [],
    dateType: form.dateType,
    deptID: form.deptID || null,
    isCancel: form.isCancel,
    isConfirm: form.isConfirm,
    panel: form.panel,
  });

  const handleReport = async () => {
    if (!form.centreID.length) {
      toast.warn("Please select at least one Centre.");
      return;
    }
    setLoading(true);
    try {
      const res = await axiosReport.post(
        "RadiologyAppointmentReport/GetPDFReport/getPDFReport",
        buildPayload(),
        { responseType: "blob" }
      );

      const contentType = res.headers?.["content-type"] || "";
      if (contentType.includes("application/json")) {
        const text = await res.data.text();
        const json = JSON.parse(text);
        toast.warning(json?.message || "No records found.");
        return;
      }

      if (!res.data || res.data.size === 0) {
        toast.warning("No data available for the selected criteria.");
        return;
      }

      const pdfUrl = window.URL.createObjectURL(res.data);
      window.open(pdfUrl, "_blank");
    } catch (err) {
      if (err?.response?.data instanceof Blob) {
        try {
          const text = await err.response.data.text();
          const json = JSON.parse(text);
          toast.error(json?.message || "Something went wrong.");
        } catch {
          toast.error("Something went wrong while fetching the report.");
        }
        return;
      }
      toast.error(err?.response?.data?.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Accordion name="Radiology Appointment Report" defaultValue={true} isBreadcrumb={true}>
      <div className="row pt-2 px-2 mb-2 align-items-end">

        {/* From Date */}
        <div className="col-sm-2 col-md-2">
          <DatePicker
            className="custom-calendar"
            name="FromDate"
            value={form.FromDate}
            onChange={dateSelect}
            placeholder=" "
            id="RAR_FromDate"
            lable="From Date"
            maxDate={new Date()}
          />
        </div>

        {/* To Date */}
        <div className="col-sm-2 col-md-2">
          <DatePicker
            className="custom-calendar"
            name="ToDate"
            value={form.ToDate}
            onChange={dateSelect}
            placeholder=" "
            id="RAR_ToDate"
            lable="To Date"
            maxDate={new Date()}
            minDate={new Date(form.FromDate)}
          />
        </div>

        {/* Centre (multi-select) */}
        <div className="col-sm-2 col-md-2">
          <MultiSelectComp
            options={centres}
            name="centreID"
            id="RAR_Centre"
            placeholder="Select Centre"
            value={form.centreID}
            onChange={handleMultiSelect}
          />
        </div>

        {/* Date Type */}
        <div className="col-sm-2 col-md-2">
          <ReactSelect
            dynamicOptions={dateTypeOptions}
            id="RAR_DateType"
            placeholderName="Date Type"
            name="dateType"
            value={form.dateType}
            onChange={handleReactSelect}
            removeIsClearable={true}
          />
        </div>

        {/* Department */}
        <div className="col-sm-2 col-md-2">
          <ReactSelect
            dynamicOptions={departments}
            id="RAR_Dept"
            placeholderName="Department"
            name="deptID"
            value={form.deptID}
            onChange={handleReactSelect}
            removeIsClearable={true}
          />
        </div>

        {/* Panel */}
        <div className="col-sm-2 col-md-2">
          <ReactSelect
            dynamicOptions={panelOptions}
            id="RAR_Panel"
            placeholderName="Panel"
            name="panel"
            value={form.panel}
            onChange={handleReactSelect}
            removeIsClearable={true}
          />
        </div>

        {/* Checkboxes */}
        <div className="col-sm-2 col-md-2 d-flex align-items-center" style={{ gap: "16px", marginTop: "6px" }}>
          <label className="d-flex align-items-center mb-0" style={{ gap: "4px", cursor: "pointer" }}>
            <input
              type="checkbox"
              name="isCancel"
              checked={form.isCancel}
              onChange={handleCheckbox}
            />
            <span>Cancelled</span>
          </label>
          <label className="d-flex align-items-center mb-0" style={{ gap: "4px", cursor: "pointer" }}>
            <input
              type="checkbox"
              name="isConfirm"
              checked={form.isConfirm}
              onChange={handleCheckbox}
            />
            <span>Confirmed</span>
          </label>
        </div>

        {/* Report Button */}
        <div className="col-sm-1 col-md-1">
          {loading ? (
            <Loading />
          ) : (
            <SearchButton onClick={handleReport} label="Report" />
          )}
        </div>

      </div>
    </Accordion>
  );
};

export default RadiologyAppointmentReport;
