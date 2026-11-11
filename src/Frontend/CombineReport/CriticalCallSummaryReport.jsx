import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import Accordion from "../../components/UI/Accordion";
import DatePicker from "../../components/formComponent/DatePicker";
import MultiSelectComp from "../../components/formComponent/MultiSelectComp";
import { CustomButton } from "../../components/UI/CustomButton";
import Tables from "../../components/UI/customTable";
import Loading from "../../components/loader/Loading";
import { axiosInstance, axiosReport } from "../../utils/axiosInstance";
import { downloadExcelBlob, formatStandardDate } from "../../utils/helpers";

const CriticalCallSummaryReport = () => {
  const { t } = useTranslation();
  const [centres, setCentres] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loadingFormat, setLoadingFormat] = useState(null);
  const [form, setForm] = useState({
    Centre: [],
    FromDate: new Date(),
    ToDate: new Date(),
  });

  useEffect(() => {
    axiosInstance.get("Centre/getGlobalCentres").then((res) => {
      setCentres((res?.data?.message || []).map((c) => ({ value: c.CentreID, label: c.Centre })));
    });
  }, []);

  const ids = (list) =>
    (list || []).map((x) => (typeof x === "object" ? x.value : x)).filter(Boolean).map(Number);

  const payload = (format) => ({
    fromDate: formatStandardDate(form.FromDate, "YYYY-MM-DD"),
    toDate: formatStandardDate(form.ToDate, "YYYY-MM-DD"),
    centre: ids(form.Centre),
    testCentre: ids(form.Centre),
    reportFormat: format,
  });

  const handleReport = async (format) => {
    setLoadingFormat(format);
    try {
      const res = await axiosReport.post(
        "CombineLabReport/GetCriticalCallSummaryReport",
        payload(format),
        { responseType: format === "Search" ? "json" : "blob" }
      );
      if (format === "Search") {
        const data = res?.data?.message || res?.data?.Message;
        const row = Array.isArray(data) ? data[0] : data;
        if (res?.data?.success && row) setSummary(row);
        else {
          setSummary(null);
          toast.warning(typeof data === "string" ? data : t("No records found"));
        }
        return;
      }
      const blob = res.data;
      const contentType = res.headers?.["content-type"] || "";
      if (contentType.includes("application/json") || blob.size < 80) {
        const text = await blob.text();
        try {
          const json = JSON.parse(text);
          toast.error(json?.message || json?.Message || t("No records found"));
        } catch {
          toast.error(t("No records found"));
        }
        return;
      }
      if (format === "Pdf") {
        window.open(window.URL.createObjectURL(new Blob([blob], { type: "application/pdf" })), "_blank");
        toast.success(t("PDF opened"));
      } else {
        downloadExcelBlob(blob, `CriticalCallSummaryReport_${Date.now()}`);
        toast.success(t("Excel downloaded"));
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || t("Error generating report"));
    } finally {
      setLoadingFormat(null);
    }
  };

  const items = summary
    ? [
        ["Total Critical Cases", summary.TotalCriticalCases],
        ["Successfully Informed", summary.SuccessfullyInformed],
        ["Pending", summary.Pending],
        ["Follow Up", summary.FollowUp],
        ["Average Minutes to Inform", summary.AvgMinutesToInform],
        ["Cases > 30 Minutes", summary.CasesOver30Minutes],
      ]
    : [];

  return (
    <>
      <Accordion title={t("Critical Call Summary Report")} defaultValue>
        <div className="row px-2 mt-2">
          <div className="col-sm-2">
            <MultiSelectComp options={centres} value={form.Centre} name="Centre"
              onChange={(n, v) => setForm((p) => ({ ...p, [n]: v }))} label={t("Centre")} />
          </div>
          <div className="col-sm-2">
            <DatePicker name="FromDate" value={form.FromDate} lable={t("From Date")} maxDate={new Date()}
              onChange={(d, n) => setForm((p) => ({ ...p, [n]: d }))} />
          </div>
          <div className="col-sm-2">
            <DatePicker name="ToDate" value={form.ToDate} lable={t("To Date")} maxDate={new Date()} minDate={form.FromDate}
              onChange={(d, n) => setForm((p) => ({ ...p, [n]: d }))} />
          </div>
          <div className="col-sm-4 d-flex align-items-center">
            <CustomButton className="mr-2" text={t("Search")} onClick={() => handleReport("Search")} loading={loadingFormat === "Search"} />
            <CustomButton className="mr-2" text={t("PDF")} icon="pdf" onClick={() => handleReport("Pdf")} loading={loadingFormat === "Pdf"} />
            <CustomButton text={t("Excel")} icon="excel" onClick={() => handleReport("Excel")} loading={loadingFormat === "Excel"} />
          </div>
        </div>
      </Accordion>
      {loadingFormat === "Search" ? (
        <Loading />
      ) : (
        <div className="p-2 col-sm-6">
          <Tables>
            <thead className="cf"><tr><th>{t("Metric")}</th><th>{t("Count")}</th></tr></thead>
            <tbody>
              {items.length === 0 ? (
                <tr><td colSpan={2} className="text-center text-muted">{t("No data")}</td></tr>
              ) : items.map(([k, v]) => (
                <tr key={k}><td>{t(k)}</td><td>{v ?? 0}</td></tr>
              ))}
            </tbody>
          </Tables>
        </div>
      )}
    </>
  );
};

export default CriticalCallSummaryReport;
