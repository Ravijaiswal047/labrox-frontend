import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import Modal from "@components/formComponent/Modal";
import Tables from "@components/UI/customTable";
import CustomTabs from "@components/UI/CustomTabs";
import { SearchButton, CustomButton } from "@components/UI/CustomButton";
import { axiosInstance, axiosReport } from "@app/utils/axiosInstance";
import DatePicker from "../../components/formComponent/DatePicker";
import DateTimeCell from "../../utils/DateTimeCell";
import { formatStandardDate } from "../../utils/helpers";
import { getReportDownloadName, downloadReportBlob, saveAndPreviewPdf } from "../CombineCollectionReport/reportDownload";

const STATUS_COLORS = {
  Safe:     { bg: "#f0fdf4", color: "#15803d" },
  Warning:  { bg: "#fffbeb", color: "#92400e" },
  Critical: { bg: "#fef2f2", color: "#b91c1c" },
  Expired:  { bg: "#f3f4f6", color: "#6b7280" },
};

const defaultFrom = () => {
  const d = new Date();
  d.setDate(d.getDate() - 30);
  return d.toISOString().split("T")[0];
};

const ReportsModal = ({ visible, setVisible, centreId }) => {
  const { t } = useTranslation();
  const [tab, setTab] = useState("stored");
  const [formData, setFormData] = useState({
    fromDate: new Date(),
    toDate: new Date(),
  });
  const [reportData, setReportData] = useState([]);
  const [loading, setLoading] = useState(false);

  const tabToReportType = { stored: "Stored", issued: "Issued", discarded: "Discarded" };

      const handleDateChange = (value, name) => {
        setFormData({
            ...formData,
            [name]: value
        })
    }


  const fetchReport = (reportTab, from, to) => {
    setLoading(true);
    axiosInstance
      .post("SampleStorageNew/GetStorageReport", {
        ReportType: tabToReportType[reportTab] || "Stored",
        FromDate: from,
        ToDate: to,
        CentreID: centreId,
        DeviceID: 0,
      })
      .then((res) => {
        setReportData(Array.isArray(res?.data?.message) ? res.data.message : []);
      })
      .catch((err) => {
        toast.error(err?.response?.data?.message || t("Failed to load report"));
        setReportData([]);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (visible) fetchReport(tab, formData.fromDate, formData.toDate);
  }, [visible, tab]);

  const handleSearch = () => fetchReport(tab, formData.fromDate, formData.toDate);

  const [exportingFormat, setExportingFormat] = useState(null);

  const exportReport = async (format) => {
    const isPdf = format === "pdf";
    const apiPayload = {
      ReportType: tabToReportType[tab] || "Stored",
      FromDate: formatStandardDate(formData.fromDate, "YYYY-MM-DD"),
      ToDate: formatStandardDate(formData.toDate, "YYYY-MM-DD"),
      CentreID: centreId,
      DeviceID: 0,
      ReportFormat: isPdf ? "PDF" : "Excel",
    };

    setExportingFormat(format);
    try {
      const res = await axiosReport.post(
        "SampleStorageNew/GetStorageReport",
        apiPayload,
        { responseType: "blob" }
      );

      const blob = res.data;

      if (!blob || blob.size === 0) {
        toast.warning(t("No data available to export."));
        return;
      }

      const headerBytes = new Uint8Array(await blob.slice(0, 4).arrayBuffer());
      const signature = Array.from(headerBytes, (b) => String.fromCharCode(b)).join("");
      const isValidFile = isPdf ? signature.startsWith("%PDF") : signature.startsWith("PK");

      if (!isValidFile) {
        const text = await blob.text();
        try {
          const json = JSON.parse(text);
          toast.warning(json?.message || t("No records found."));
        } catch {
          toast.warning(t("No records found."));
        }
        return;
      }

      const reportType = apiPayload.ReportType || "Stored";
      if (isPdf) {
        const fallback = `${reportType}_${new Date().toISOString().replace(/[-:T]/g, "").slice(0, 15)}.pdf`;
        const fileName = getReportDownloadName(res, fallback);
        saveAndPreviewPdf(blob, fileName.toLowerCase().endsWith(".pdf") ? fileName : `${fileName}.pdf`);
      } else {
        const fallback = `${reportType}_${new Date().toISOString().replace(/[-:T]/g, "").slice(0, 15)}.xlsx`;
        const fileName = getReportDownloadName(res, fallback);
        downloadReportBlob(blob, fileName.toLowerCase().endsWith(".xlsx") ? fileName : `${fileName}.xlsx`);
        toast.success(t("Excel File Downloaded"));
      }
    } catch (err) {
      if (err?.response?.data instanceof Blob) {
        const text = await err.response.data.text();
        try {
          const json = JSON.parse(text);
          toast.error(json?.message || t("Error while fetching report."));
        } catch {
          toast.error(t("Error while fetching report."));
        }
        return;
      }
      toast.error(err?.response?.data?.message || t("Error while fetching report."));
    } finally {
      setExportingFormat(null);
    }
  };

  const StatusPill = ({ status }) => {
    const c = STATUS_COLORS[status] || {};
    return (
      <span style={{ fontSize: 10, fontWeight: 600, padding: "2px 8px", borderRadius: 10, background: c.bg, color: c.color }}>
        {status}
      </span>
    );
  };

  const NoData = ({ cols }) => (
    <tr>
      <td colSpan={cols} className="text-center text-muted py-3" style={{ fontSize: 13 }}>
        {loading ? t("Loading...") : t("No records in selected date range")}
      </td>
    </tr>
  );

  const storedContent = (
    <Tables>
      <thead>
        <tr>
          <th>#</th>
          <th>{t("Barcode")}</th>
          <th>{t("Collected On")}</th>
          <th>{t("Stored On")}</th>
          <th>{t("Location")}</th>
          <th>{t("Days Left")}</th>
          <th>{t("Status")}</th>
        </tr>
      </thead>
      <tbody>
        {reportData.length === 0 ? <NoData cols={7} /> : reportData.map((s, i) => (
          <tr key={i}>
            <td>{i + 1}</td>
            <td><strong>{s.barcodeNo}</strong></td>
            <td style={{ fontSize: 12 }}><DateTimeCell dateString={s.collectedOn} /></td>
            <td style={{ fontSize: 12 }}><DateTimeCell dateString={s.storedOn} /></td>
            <td style={{ fontSize: 12 }}>{s.location}</td>
            <td>{s.daysLeft != null ? s.daysLeft : s.DaysLeft != null ? s.DaysLeft : ""}</td>
            <td><StatusPill status={s.retentionStatus || ""} /></td>
          </tr>
        ))}
      </tbody>
    </Tables>
  );

  const issuedContent = (
    <Tables>
      <thead>
        <tr>
          <th>#</th><th>{t("Barcode")}</th>
          <th>{t("Collected On")}</th><th>{t("Issued On")}</th>
          <th>{t("Issued To")}</th><th>{t("Issued By")}</th>
          <th>{t("Purpose")}</th><th>{t("Invoice")}</th>
          <th>{t("Location")}</th>
        </tr>
      </thead>
      <tbody>
        {reportData.length === 0 ? <NoData cols={9} /> : reportData.map((s, i) => (
          <tr key={i}>
            <td>{i + 1}</td>
            <td><strong>{s.BarcodeNo}</strong></td>
            <td style={{ fontSize: 12 }}><DateTimeCell dateString={s.CollectedOn} /></td>
            <td style={{ fontSize: 12 }}><DateTimeCell dateString={s.IssuedOn} /></td>
            <td>{s.IssuedTo}</td>
            <td>{s.IssuedBy}</td>
            <td>{s.IssuedFor}</td>
            <td>{s.InvoiceAgainst}</td>
            <td style={{ fontSize: 12 }}>{s.Location}</td>
          </tr>
        ))}
      </tbody>
    </Tables>
  );

  const discardedContent = (
    <Tables>
      <thead>
        <tr>
          <th>#</th><th>{t("Barcode")}</th>
          <th>{t("CollectedOn")}</th>
          <th>{t("DiscardReason")}</th>
          <th>{t("DiscardedOn")}</th>
          <th>{t("Location")}</th>
          <th>{t("DiscardedBy")}</th>
        </tr>
      </thead>
      <tbody>
        {reportData.length === 0 ? <NoData cols={7} /> : reportData.map((s, i) => (
          <tr key={i}>
            <td>{i + 1}</td>
            <td>{s.BarcodeNo}</td>
            <td>
              <DateTimeCell dateString={s.CollectedOn} />
            </td>
            <td>{s.DiscardReason}</td>
            <td>
               <DateTimeCell dateString={s.DiscardedOn} />
            </td>
            <td style={{ fontSize: 12 }}>{s.Location}</td>
            <td style={{ fontSize: 12 }}>{s.DiscardedBy}
            </td>
          </tr>
        ))}
      </tbody>
    </Tables>
  );

  const tabs = [
    { id: "stored",    label: t("Stored"),    content: storedContent    },
    { id: "issued",    label: t("Issued"),    content: issuedContent    },
    { id: "discarded", label: t("Discarded"), content: discardedContent },
  ];

  return (
    <Modal visible={visible} setVisible={setVisible} Header={t("MIS Reports")} modalWidth="960px">
      <div className="row mb-3 align-items-start mt-2">
        <div className="col-md-2 col-6">
            <DatePicker
              name="fromDate"
              id="fromDate"
              lable={t("FromDate")}
              value={formData.fromDate}
              onChange={handleDateChange}
          />
        </div>
        <div className="col-md-2 col-6">
          <DatePicker
              name="toDate"
              id="toDate"
              lable={t("ToDate")}
              value={formData.toDate}
              onChange={handleDateChange}
          />
        </div>
        <div className="col-auto">
          <SearchButton text="Search" onClick={handleSearch} />
        </div>
        <div className="col-auto">
          <CustomButton
            text="Excel"
            icon="excel"
            loading={exportingFormat === "excel"}
            onClick={() => exportReport("excel")}
          />
        </div>
        <div className="col-auto">
          <CustomButton
            text="PDF"
            icon="pdf"
            loading={exportingFormat === "pdf"}
            onClick={() => exportReport("pdf")}
          />
        </div>
      </div>
      <CustomTabs tabs={tabs} activeTab={tab} onSelect={(k) => { setReportData([]); setTab(k); }} />
    </Modal>
  );
};

export default ReportsModal;
