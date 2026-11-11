import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import Accordion from "../../components/UI/Accordion";
import DatePicker from "../../components/formComponent/DatePicker";
import MultiSelectComp from "../../components/formComponent/MultiSelectComp";
import Input from "../../components/formComponent/Input";
import ReactSelect from "../../components/formComponent/ReactSelect";
import { CustomButton } from "../../components/UI/CustomButton";
import Tables from "../../components/UI/customTable";
import Loading from "../../components/loader/Loading";
import { axiosInstance, axiosReport } from "../../utils/axiosInstance";
import { downloadExcelBlob, formatStandardDate } from "../../utils/helpers";

const STATUS_OPTS = [
  { label: "All", value: "All" },
  { label: "Pending", value: "Pending" },
  { label: "FollowUp", value: "FollowUp" },
  { label: "Closed", value: "Closed" },
];

const CriticalCallDetailReport = () => {
  const { t } = useTranslation();
  const [centres, setCentres] = useState([]);
  const [investigations, setInvestigations] = useState([]);
  const [rows, setRows] = useState([]);
  const [loadingFormat, setLoadingFormat] = useState(null);
  const [form, setForm] = useState({
    Centre: [],
    Investigation: [],
    FromDate: new Date(),
    ToDate: new Date(),
    UHID: "",
    VisitNo: "",
    BarcodeNo: "",
    CallStatus: "All",
    ContactPerson: "",
    CallerEmployee: "",
  });

  useEffect(() => {
    axiosInstance.get("Centre/getGlobalCentres").then((res) => {
      setCentres((res?.data?.message || []).map((c) => ({ value: c.CentreID, label: c.Centre })));
    });
    axiosInstance.get("Investigations/BindInvestigationList").then((res) => {
      setInvestigations((res?.data?.message || []).map((e) => ({
        value: e.InvestigationID,
        label: e.TestName,
      })));
    });
  }, []);

  const ids = (list) =>
    (list || []).map((x) => (typeof x === "object" ? x.value : x)).filter(Boolean).map(Number);

  const payload = (format) => ({
    fromDate: formatStandardDate(form.FromDate, "YYYY-MM-DD"),
    toDate: formatStandardDate(form.ToDate, "YYYY-MM-DD"),
    centre: ids(form.Centre),
    testCentre: ids(form.Centre),
    investigationIds: ids(form.Investigation),
    uhid: form.UHID,
    visitNo: form.VisitNo,
    barcodeNo: form.BarcodeNo,
    callStatus: form.CallStatus,
    contactPerson: form.ContactPerson,
    callerEmployee: form.CallerEmployee,
    reportFormat: format,
  });

  const handleReport = async (format) => {
    setLoadingFormat(format);
    try {
      const res = await axiosReport.post(
        "CombineLabReport/GetCriticalCallDetailReport",
        payload(format),
        { responseType: format === "Search" ? "json" : "blob" }
      );
      if (format === "Search") {
        const data = res?.data?.message || res?.data?.Message;
        if (res?.data?.success && Array.isArray(data)) {
          setRows(data);
          if (!data.length) toast.warning(t("No records found"));
        } else {
          setRows([]);
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
        downloadExcelBlob(blob, `CriticalCallDetailReport_${Date.now()}`);
        toast.success(t("Excel downloaded"));
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || t("Error generating report"));
    } finally {
      setLoadingFormat(null);
    }
  };

  return (
    <>
      <Accordion title={t("Critical Call Detail Report")} defaultValue>
        <div className="row px-2 mt-2">
          <div className="col-sm-2">
            <MultiSelectComp options={centres} value={form.Centre} name="Centre"
              onChange={(n, v) => setForm((p) => ({ ...p, [n]: v }))} label={t("Centre")} />
          </div>
          <div className="col-sm-2">
            <MultiSelectComp options={investigations} value={form.Investigation} name="Investigation"
              onChange={(n, v) => setForm((p) => ({ ...p, [n]: v }))} label={t("Investigation")} />
          </div>
          <div className="col-sm-2">
            <DatePicker name="FromDate" value={form.FromDate} lable={t("From Date")} maxDate={new Date()}
              onChange={(d, n) => setForm((p) => ({ ...p, [n]: d }))} />
          </div>
          <div className="col-sm-2">
            <DatePicker name="ToDate" value={form.ToDate} lable={t("To Date")} maxDate={new Date()} minDate={form.FromDate}
              onChange={(d, n) => setForm((p) => ({ ...p, [n]: d }))} />
          </div>
          <div className="col-sm-2">
            <Input lable={t("UHID")} value={form.UHID} onChange={(e) => setForm((p) => ({ ...p, UHID: e.target.value }))} />
          </div>
          <div className="col-sm-2">
            <Input lable={t("Visit No")} value={form.VisitNo} onChange={(e) => setForm((p) => ({ ...p, VisitNo: e.target.value }))} />
          </div>
          <div className="col-sm-2 mt-1">
            <Input lable={t("Barcode No")} value={form.BarcodeNo} onChange={(e) => setForm((p) => ({ ...p, BarcodeNo: e.target.value }))} />
          </div>
          <div className="col-sm-2 mt-1">
            <ReactSelect dynamicOptions={STATUS_OPTS} name="CallStatus" lable={t("Call Status")}
              value={form.CallStatus} removeIsClearable
              onChange={(n, e) => setForm((p) => ({ ...p, CallStatus: e?.value || "All" }))} />
          </div>
          <div className="col-sm-2 mt-1">
            <Input lable={t("Contact Person")} value={form.ContactPerson}
              onChange={(e) => setForm((p) => ({ ...p, ContactPerson: e.target.value }))} />
          </div>
          <div className="col-sm-2 mt-1">
            <Input lable={t("Caller Employee")} value={form.CallerEmployee}
              onChange={(e) => setForm((p) => ({ ...p, CallerEmployee: e.target.value }))} />
          </div>
          <div className="col-sm-4 mt-1 d-flex align-items-center">
            <CustomButton className="mr-2" text={t("Search")} onClick={() => handleReport("Search")} loading={loadingFormat === "Search"} />
            <CustomButton className="mr-2" text={t("PDF")} icon="pdf" onClick={() => handleReport("Pdf")} loading={loadingFormat === "Pdf"} />
            <CustomButton text={t("Excel")} icon="excel" onClick={() => handleReport("Excel")} loading={loadingFormat === "Excel"} />
          </div>
        </div>
      </Accordion>
      {loadingFormat === "Search" ? (
        <Loading />
      ) : (
        <div className="p-2" style={{ maxHeight: "50vh", overflow: "auto" }}>
          <Tables>
            <thead className="cf">
              <tr>
                <th>Case ID</th><th>Visit No</th><th>UHID</th><th>Patient</th>
                <th>Investigation</th><th>Parameter</th><th>Reading</th>
                <th>Contacted</th><th>Caller</th><th>Outcome</th><th>Status</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr><td colSpan={11} className="text-center text-muted">{t("No data")}</td></tr>
              ) : rows.map((r, i) => (
                <tr key={i}>
                  <td>{r.CriticalCallCaseID}</td>
                  <td>{r.VisitNo}</td>
                  <td>{r.UHID}</td>
                  <td>{r.PName || r.PatientName}</td>
                  <td>{r.Investigation}</td>
                  <td>{r.ParameterName}</td>
                  <td>{r.Reading}</td>
                  <td>{r.ContactedPerson}</td>
                  <td>{r.Caller}</td>
                  <td>{r.Outcome}</td>
                  <td>{r.CaseStatus}</td>
                </tr>
              ))}
            </tbody>
          </Tables>
        </div>
      )}
    </>
  );
};

export default CriticalCallDetailReport;
