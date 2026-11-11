import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";
import Accordion from "../../components/UI/Accordion";
import DatePicker from "../../components/formComponent/DatePicker";
import ReactSelect from "../../components/formComponent/ReactSelect";
import MultiSelectComp from "../../components/formComponent/MultiSelectComp";
import { SearchButton } from "../../components/UI/CustomButton";
import { axiosInstance, axiosReport } from "../../utils/axiosInstance";
import moment from "moment";

const REPORT_TYPES = [
  { label: "Patientwise", value: "PatientWise" },
  { label: "Item Wise", value: "ItemWise" },
  { label: "Single Line Summary", value: "Summary" },
];

const REPORT_FORMATS = [
  { label: "PDF", value: "pdf" },
  { label: "Excel", value: "excel" },
];

const INITIAL_FORM = {
  FromDate: new Date(),
  ToDate: new Date(),
  BookingCentreID: [],
  TestCentreID: [],
  ReportType: "PatientWise",
  ReportFormat: "pdf",
};

const CentreShareReport = () => {
  const { t } = useTranslation();

  const [form, setForm] = useState(INITIAL_FORM);
  const [centreOptions, setCentreOptions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    axiosInstance
      .get("Centre/getAccessCentres")
      .then((res) => {
        const list = (res?.data?.message || []).map((c) => ({
          label: c.Centre,
          value: String(c.CentreID),
        }));
        setCentreOptions(list);
      })
      .catch(() => {});
  }, []);

  const handleDate = (value, name) => setForm((prev) => ({ ...prev, [name]: value }));

  const handleSelect = (name, option) =>
    setForm((prev) => ({ ...prev, [name]: option?.value ?? "" }));

  // Either Booking Centre or Test Centre can have multiple selections, not both at once.
  const handleCentreMultiSelect = (name, values) => {
    const otherName = name === "BookingCentreID" ? "TestCentreID" : "BookingCentreID";
    setForm((prev) => {
      if ((values?.length || 0) > 1 && (prev[otherName]?.length || 0) > 1) {
        toast.warn(t("Only one of Booking Centre or Test Centre can have multiple selections"));
        return prev;
      }
      return { ...prev, [name]: values || [] };
    });
  };

  const toNumberArray = (value) =>
    (Array.isArray(value) ? value : value ? [value] : []).map(Number);

  const handleGenerate = () => {
    const bookingCentreIDs = toNumberArray(form.BookingCentreID);
    const testCentreIDs = toNumberArray(form.TestCentreID);

    if (!bookingCentreIDs.length) { toast.warn(t("Select Booking Centre")); return; }
    if (!testCentreIDs.length) { toast.warn(t("Select Test Centre")); return; }

    setIsLoading(true);
    const payload = {
      fromDate: moment(form.FromDate).format("YYYY-MM-DD"),
      toDate: moment(form.ToDate).format("YYYY-MM-DD"),
      bookingCentreIDs,
      testCentreIDs,
      reportType: form.ReportType,
      reportFormat: form.ReportFormat,
    };

    axiosReport
      .post("CentreShareReport/GetReport/GetReport", payload, { responseType: "blob" })
      .then((res) => {
        const fileType = res.headers["content-type"] || "";
        const blob = new Blob([res.data], { type: fileType });
        const url = window.URL.createObjectURL(blob);
        if (form.ReportFormat === "pdf") {
          window.open(url, "_blank");
        } else {
          const link = document.createElement("a");
          link.href = url;
          link.setAttribute("download", `CentreShareReport_${form.ReportType}.xlsx`);
          document.body.appendChild(link);
          link.click();
          link.remove();
        }
        toast.success(t("Report generated successfully"));
      })
      .catch((err) =>
        toast.error(err?.response?.data?.message || t("Failed to generate report"))
      )
      .finally(() => setIsLoading(false));
  };

  return (
    <>
      <Accordion title={t("Centre Share Report")} defaultValue={true}>
        <div className="row pt-2 pl-2 pr-2">
          <div className="col-sm-2">
            <DatePicker
              id="fromDate"
              name="FromDate"
              lable={t("From Date")}
              value={form.FromDate}
              onChange={handleDate}
              dateFormat="dd-M-yy"
            />
          </div>
          <div className="col-sm-2">
            <DatePicker
              id="toDate"
              name="ToDate"
              lable={t("To Date")}
              value={form.ToDate}
              onChange={handleDate}
              dateFormat="dd-M-yy"
            />
          </div>
          <div className="col-sm-2">
            <MultiSelectComp
              id="bookingCentre"
              name="BookingCentreID"
              placeholder={t("Booking Centre *")}
              value={form.BookingCentreID}
              options={centreOptions}
              onChange={handleCentreMultiSelect}
            />
          </div>
          <div className="col-sm-2">
            <MultiSelectComp
              id="testCentre"
              name="TestCentreID"
              placeholder={t("Test Centre *")}
              value={form.TestCentreID}
              options={centreOptions}
              onChange={handleCentreMultiSelect}
            />
          </div>
          <div className="col-sm-2">
            <ReactSelect
              id="reportType"
              name="ReportType"
              placeholderName={t("Report Type")}
              value={form.ReportType}
              dynamicOptions={REPORT_TYPES}
              onChange={handleSelect}
              removeIsClearable={true}
            />
          </div>
          <div className="col-sm-2">
            <ReactSelect
              id="reportFormat"
              name="ReportFormat"
              placeholderName={t("Report Format")}
              value={form.ReportFormat}
              dynamicOptions={REPORT_FORMATS}
              onChange={handleSelect}
              removeIsClearable={true}
            />
          </div>
          <div className="col-sm-auto d-flex gap-2 mb-2">
            <SearchButton
              text={isLoading ? t("Generating...") : t("Generate")}
              onClick={handleGenerate}
              disabled={isLoading}
            />
          </div>
        </div>
      </Accordion>
    </>
  );
};

export default CentreShareReport;
