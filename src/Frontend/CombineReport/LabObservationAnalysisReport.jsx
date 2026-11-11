import React, { useState, useEffect, useMemo } from "react";
import Accordion from "../../components/UI/Accordion";
import DatePicker from "../../components/formComponent/DatePicker";
import ReactSelect from "../../components/formComponent/ReactSelect";
import MultiSelectComp from "../../components/formComponent/MultiSelectComp";
import { CustomButton } from "../../components/UI/CustomButton";
import { useTranslation } from "react-i18next";
import { axiosInstance, axiosReport } from "../../utils/axiosInstance";
import { formatStandardDate } from "../../utils/helpers";
import { toast } from "react-toastify";

const LabObservationAnalysisReport = () => {
  const { t } = useTranslation();

  // ─── Dropdown Data ───────────────────────────────────────────────
  const [centreData, setCentreData] = useState([]);
  const [testCentreData, setTestCentreData] = useState([]);
  const [machineData, setMachineData] = useState([]);
  const [parameterData, setParameterData] = useState([]);
  const [parameterSearch, setParameterSearch] = useState("");

  // ─── Loading States ───────────────────────────────────────────────
  const [loadingSearch, setLoadingSearch] = useState(false);
  const [loadingExcel, setLoadingExcel] = useState(false);

  // ─── Form ─────────────────────────────────────────────────────────
  const [formData, setFormData] = useState({
    FromDate: new Date(),
    ToDate: new Date(),
    ReportType: null,
    CentreId: [],
    TestCentreID: [],
    MachineID: [],
    ParameterID: [],
  });

  // ─── Filtered Parameters ──────────────────────────────────────────
  const filteredParameters = useMemo(() => {
    if (!parameterSearch.trim()) return parameterData.slice(0, 50);
    return parameterData
      .filter((p) => p.label.toLowerCase().includes(parameterSearch.toLowerCase()))
      .slice(0, 100);
  }, [parameterData, parameterSearch]);

  // ─── Fetch Centres ────────────────────────────────────────────────
  const getAccessCentres = async () => {
    try {
      const res = await axiosInstance.get("Centre/GetAllAccessCentres?IsActive=1");
      if (res.data?.success && Array.isArray(res.data.message)) {
        setCentreData(res.data.message.map((e) => ({ value: e.CentreID, label: e.Centre })));
      }
    } catch (err) {
      console.error("Error fetching centres", err);
    }
  };

  // ─── Fetch Test Centres ───────────────────────────────────────────
  const getTestCentres = async () => {
    try {
      const res = await axiosInstance.get("CommonController/BindTestCentreList");
      if (res.data?.message) {
        setTestCentreData(res.data.message.map((e) => ({ value: e.CentreID, label: e.Centre })));
      }
    } catch (err) {
      console.error("Error fetching test centres", err);
    }
  };

  // ─── Fetch Machines ───────────────────────────────────────────────
  const getMachines = async () => {
    try {
      const res = await axiosInstance.get("MachineGroup/BindMachineName");
      if (res.data?.message) {
        setMachineData(res.data.message.map((e) => ({ value: e.MachineId, label: e.MachineName })));
      }
    } catch (err) {
      console.error("Error fetching machines", err);
    }
  };

  // ─── Fetch Parameters ─────────────────────────────────────────────
  const getParameters = async () => {
    try {
      const res = await axiosInstance.get("Investigations/BindInvestigationList");
      if (res.data?.message) {
        setParameterData(res.data.message.map((e) => ({ value: e.InvestigationID, label: e.TestName })));
      }
    } catch (err) {
      console.error("Error fetching parameters", err);
    }
  };

  useEffect(() => {
    getAccessCentres();
    getTestCentres();
    getMachines();
    getParameters();
  }, []);

  // ─── Handlers ─────────────────────────────────────────────────────
  const dateSelect = (date, name) => {
    setFormData((prev) => ({ ...prev, [name]: date }));
  };

  const handleReactSelectChange = (name, e) => {
    setFormData((prev) => ({ ...prev, [name]: e?.value ?? null }));
  };

  const handleMultiChange = (name, selected) => {
    setFormData((prev) => ({ ...prev, [name]: selected || [] }));
  };

  // ─── Build Payload ────────────────────────────────────────────────
  const buildPayload = (format) => ({
    fromDate: formatStandardDate(formData.FromDate, "YYYY-MM-DD"),
    toDate: formatStandardDate(formData.ToDate, "YYYY-MM-DD"),
    reportFormat: format,
    reportType: formData.ReportType ? String(formData.ReportType) : "",
    centreId: formData.CentreId.map((c) => c.value ?? c),
    bookingCentreID: formData.TestCentreID.map((tc) => tc.value ?? tc),
    machineName: formData.MachineID.map((m) => m.value ?? m),
    parameterID: formData.ParameterID.map((p) => p.value ?? p),
  });

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

  // ─── Common blob response validator ──────────────────────────────
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

  // ─── Handle PDF ───────────────────────────────────────────────────
  const handlePdf = () => {
    setLoadingSearch(true);
    const payload = buildPayload("Pdf");

    axiosReport
      .post("TATMIS/LabObservationAnalysisReport", payload, { responseType: "blob" })
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

  const handleExcel = () => {
    setLoadingExcel(true);
    const payload = buildPayload("Excel");

    axiosReport
      .post("TATMIS/LabObservationAnalysisReport", payload, { responseType: "blob" })
      .then(async (res) => {
        const isValid = await validateBlob(res);
        if (!isValid) return;

        const mimeType = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
        const typedBlob = new Blob([res.data], { type: mimeType });
        const url = window.URL.createObjectURL(typedBlob);
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", `LabObservationAnalysisReport_${new Date().toISOString().slice(0, 10)}.xlsx`);
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
      <Accordion title={t("Lab Observation Analysis Report")} defaultValue={true}>
        <div className="row px-2 mt-2 p-1">
          <div className="col-12 col-sm-6 col-md-2 my-1">
            <ReactSelect
              className="required-fields"
              dynamicOptions={[
                { label: "Department vs Observation", value: "0" },
                { label: "Centre vs Observation", value: "1" },
                { label: "Machine vs Observation", value: "2" },
              ]}
              value={formData.ReportType}
              name="ReportType"
              onChange={handleReactSelectChange}
              label={t("Report Type")}
              removeIsClearable={true}
              placeholderName={t("Report Type")}
            />
          </div>

          {/* From Date */}
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

          {/* To Date */}
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

          {/* Centre */}
          <div className="col-12 col-sm-6 col-md-2 my-1">
            <MultiSelectComp
              options={centreData}
              value={formData.CentreId}
              name="CentreId"
              onChange={handleMultiChange}
              label={t("Centre")}
            />
          </div>

          {/* Test Centre */}
          <div className="col-12 col-sm-6 col-md-2 my-1">
            <MultiSelectComp
              options={testCentreData}
              value={formData.TestCentreID}
              name="TestCentreID"
              onChange={handleMultiChange}
              label={t("Test Centre")}
            />
          </div>

          {/* Machine */}
          <div className="col-12 col-sm-6 col-md-2 my-1">
            <MultiSelectComp
              options={machineData}
              value={formData.MachineID}
              name="MachineID"
              onChange={handleMultiChange}
              label={t("Machine")}
            />
          </div>

          {/* Parameter */}
          <div className="col-12 col-sm-6 col-md-2 my-1">
            <MultiSelectComp
              options={filteredParameters}
              value={formData.ParameterID}
              name="ParameterID"
              onChange={handleMultiChange}
              label={t("Parameter")}
              onInputChange={(val) => setParameterSearch(val)}
            />
          </div>

          {/* Buttons */}
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

export default LabObservationAnalysisReport;