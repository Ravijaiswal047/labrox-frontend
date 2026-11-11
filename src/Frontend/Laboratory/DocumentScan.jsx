import React, { useState, useRef } from "react";
import Heading from "../../components/UI/Heading.jsx";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { Upload, FileText, Download, RefreshCw, AlertCircle, CheckCircle2, UserPlus } from "lucide-react";
import { readGRNInvoiceWithGemini } from "../../utils/NetworkApi/commonApi.js";
import { mapExtractedDataToFormFields } from "./ExtractedDataMapper.jsx";

// ─── helpers ──────────────────────────────────────────────────────────────────
const compressImage = (file) =>
  new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const MAX_WIDTH = 1024;
        const scale = MAX_WIDTH / img.width;
        canvas.width = MAX_WIDTH;
        canvas.height = img.height * scale;
        canvas.getContext("2d").drawImage(img, 0, 0, canvas.width, canvas.height);
        canvas.toBlob((blob) => resolve(blob), "image/jpeg", 0.8);
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  });

const toBase64 = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result.split(",")[1]);
    reader.onerror = reject;
  });

function flattenData(json, prefix = "") {
  let rows = [];
  for (const [key, value] of Object.entries(json)) {
    const label = prefix ? `${prefix} › ${formatLabel(key)}` : formatLabel(key);

    if (Array.isArray(value)) {
      rows.push({
        field: label,
        value: value.length ? value.join(", ") : "—",
        isNested: !!prefix,
      });
    } else if (value !== null && typeof value === "object") {
      rows = [...rows, ...flattenData(value, label)];
    } else {
      rows.push({
        field: label,
        value: value || "—",
        isNested: !!prefix,
      });
    }
  }
  return rows;
}

function formatLabel(str) {
  return str.replace(/([A-Z])/g, " $1").replace(/_/g, " ").trim().replace(/^\w/, (c) => c.toUpperCase());
}

const GEMINI_MODEL = "gemini-2.5-flash-lite";
const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || "";

// ─────────────────────────────────────────────────────────────────────────────
// MAP AI JSON → Patient Registration formData keys
// ⚠️ Right-hand side keys must match your exact formData field names
// ─────────────────────────────────────────────────────────────────────────────
function mapToPatientForm(json) {
  const nameParts = (fullName = "") => {
    const parts = fullName.trim().split(/\s+/);
    return {
      first: parts[0] || "",
      middle: parts.length === 3 ? parts[1] : "",
      last: parts.length >= 2 ? parts[parts.length - 1] : "",
    };
  };

  const name = nameParts(json.patientName || "");

  const genderMap = { m: "Male", male: "Male", f: "Female", female: "Female" };
  const gender = genderMap[(json.gender || "").toLowerCase().trim()] || json.gender || "";

  const ageStr = (json.age || "").replace(/[^\d]/g, "");

  return {
    // ── Personal ──────────────────────────────────────────────────────────
    FirstName: name.first,
    MiddleName: name.middle,
    LastName: name.last,
    AgeYear: ageStr,
    Gender: gender,
    Mobile: json.mobileNumber || "",

    // ── Doctor / Ref ──────────────────────────────────────────────────────
    // Typeahead fields — stored value triggers suggestion API on mount
    DoctorName: json.referringDoctor || "",
    ReferLabId: json.referringCustomer || "",

    // ── Booking ───────────────────────────────────────────────────────────
    ClientRefNo: json.clientCode || "",
    trfNo: json.orderSlipNumber || "",
    SampleCollectionDate: json.dateOfCollection || "",
    

    
    // ── Ward / Bed ────────────────────────────────────────────────────────
    Ward: json.ward || "",
    BedNo: json.bedOrRoom || "",

    // ── Scanned tests hint (shown as a banner in patient reg form) ────────
    __scannedTests__: (json.testNames || []).join(", "),
    __scannedDOC__: json.dateOfCollection || "",
  };
}

const PROMPT = `Extract handwritten text from this medical form. Return raw JSON (no backticks, no explanation).

Rules:
- Extract ONLY pen-written/handwritten text (not printed labels)
- If a field is unclear or empty, use ""
- Preserve exact spelling and numbers

Output format:
{
  "patientName": "",
  "age": "",
  "gender": "",
  "mobileNumber": "",
  "clientCode": "",
  "clientContactNumber": "",
  "dateOfCollection": "",
  "formDate": "",
  "referringDoctor": "",
  "referringCustomer": "",
  "testNames": [],
  "testCodes": [],
  "clinicalNotes": "",
  "otherNotes": "",
  "specimen_types": {
    "Plain": "",
    "EDTA": "",
    "Sodium Fluoride": "",
    "Sodium Citrate": "",
    "Sodium Heparin": "",
    "Urine": "",
    "Fluids/Others": ""
  },
  "specimenQuantity": "",
  "sampleId": "",
  "orderSlipNumber": "",
  "ward": "",
  "bedOrRoom": "",
  "doctorSignature": "",
  "receivedBy": "",
  "dispatchSealNo": ""
}`;

// ─── COMPONENT ────────────────────────────────────────────────────────────────
function DocumentScan() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [tableRows, setTableRows] = useState(null);
  const [rawJson, setRawJson] = useState(null);
  const [error, setError] = useState(null);
  const [fileName, setFileName] = useState("");
  const [dragOver, setDragOver] = useState(false);

  const processFile = async (file) => {
    if (!file || !file.type.startsWith("image/")) {
      setError("Please upload an image file (JPG, PNG, etc.)");
      return;
    }
    setError(null); setTableRows(null); setRawJson(null);
    setFileName(file.name);
    setImagePreview(URL.createObjectURL(file));
    try {
      const compressed = await compressImage(file);
      await analyzeImage(compressed);
    } catch {
      setError("Failed to process image. Please try again.");
      setLoading(false);
    }
  };

  const handleFile = (e) => processFile(e.target.files[0]);
  const handleDrop = (e) => { e.preventDefault(); setDragOver(false); processFile(e.dataTransfer.files[0]); };

  const analyzeImage = async (file) => {
    setLoading(true);
    try {
      const extracted = await readGRNInvoiceWithGemini(file, GEMINI_API_KEY, GEMINI_MODEL);
      console.log("extractedData", extracted);
      setRawJson(extracted);
      setTableRows(flattenData(extracted));
    } catch (err) {
      console.error("AI error:", err);
      setError("AI extraction failed. Check image quality and try again.");
    } finally {
      setLoading(false);
    }
  };

  // ── Save to sessionStorage → navigate ─────────────────────────────────────
  const handleFillForm = () => {
    if (!rawJson) return;
    // Use shared mapper so PatientRegistration gets Title, DOB, RateID, ReferLabId etc.
    const mapped = mapExtractedDataToFormFields(rawJson);
    sessionStorage.setItem("scannedPatientData", JSON.stringify(mapped));
    navigate("/patientregister");
  };

  const downloadJson = () => {
    if (!rawJson) return;
    const blob = new Blob([JSON.stringify(rawJson, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "extracted_data.json"; a.click();
    URL.revokeObjectURL(url);
  };

  const downloadCsv = () => {
    if (!tableRows) return;
    const csv = ["Field,Value", ...tableRows.map((r) => `"${r.field}","${r.value}"`)].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "extracted_data.csv"; a.click();
    URL.revokeObjectURL(url);
  };

  const handleReset = () => {
    setImagePreview(null); setTableRows(null); setRawJson(null);
    setError(null); setFileName(""); setLoading(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <>
      <Heading name={t("Document Scanner")} defaultValue isBreadcrumb />

      <div className="container-fluid px-3 pb-4">

        {/* ── Action bar ── */}
        <div className="d-flex align-items-center gap-2 mb-3 flex-wrap">
          <button
            className="btn btn-primary d-flex align-items-center gap-2"
            onClick={() => fileInputRef.current?.click()}
            disabled={loading}
          >
            <Upload size={16} /> {t("Upload Document")}
          </button>

          {tableRows && (
            <>
              <button
                className="btn btn-success d-flex align-items-center gap-2 fw-semibold px-3"
                onClick={handleFillForm}
              >
                <UserPlus size={16} />
                {t("Fill Patient Registration Form")}
              </button>
              <button className="btn btn-outline-success d-flex align-items-center gap-2" onClick={downloadCsv}>
                <Download size={16} /> {t("CSV")}
              </button>
              <button className="btn btn-outline-secondary d-flex align-items-center gap-2" onClick={downloadJson}>
                <Download size={16} /> {t("JSON")}
              </button>
              <button className="btn btn-outline-danger d-flex align-items-center gap-2 ms-auto" onClick={handleReset}>
                <RefreshCw size={16} /> {t("Reset")}
              </button>
            </>
          )}

          <input ref={fileInputRef} type="file" accept="image/*" className="d-none" onChange={handleFile} />
        </div>

        {/* ── Drop zone ── */}
        {!imagePreview && !loading && (
          <div
            className="rounded-3 d-flex flex-column align-items-center justify-content-center py-5 mb-3"
            style={{ border: dragOver ? "2px dashed #0d6efd" : "2px dashed #ced4da", background: dragOver ? "#f0f6ff" : "#fafafa", cursor: "pointer", minHeight: "180px", transition: "all 0.2s" }}
            onClick={() => fileInputRef.current?.click()}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
          >
            <FileText size={48} color={dragOver ? "#0d6efd" : "#adb5bd"} strokeWidth={1.2} />
            <p className="mt-3 mb-1 fw-semibold text-secondary">{t("Drag & drop a document image here")}</p>
            <p className="text-muted small">{t("or click to browse — JPG, PNG supported")}</p>
          </div>
        )}

        {error && <div className="alert alert-danger d-flex align-items-center gap-2 py-2"><AlertCircle size={16} />{error}</div>}
        {loading && <div className="alert alert-info d-flex align-items-center gap-2 py-2"><div className="spinner-border spinner-border-sm" role="status" />{t("Extracting data with AI — please wait...")}</div>}

        {/* ── Image + Table ── */}
        {(imagePreview || tableRows) && (
          <div className="row g-3">
            {imagePreview && (
              <div className={tableRows ? "col-md-4" : "col-12 text-center"}>
                <div className="card shadow-sm h-100">
                  <div className="card-header bg-light py-2 d-flex align-items-center gap-2">
                    <FileText size={15} />
                    <small className="fw-semibold text-truncate">{fileName || "Uploaded Document"}</small>
                  </div>
                  <div className="card-body p-2 d-flex align-items-center justify-content-center">
                    <img src={imagePreview} alt="Uploaded document" className="img-fluid rounded" style={{ maxHeight: "420px", objectFit: "contain" }} />
                  </div>
                </div>
              </div>
            )}

            {tableRows && (
              <div className={imagePreview ? "col-md-8" : "col-12"}>
                <div className="card shadow-sm">
                  <div className="card-header bg-light py-2 d-flex align-items-center justify-content-between">
                    <div className="d-flex align-items-center gap-2">
                      <CheckCircle2 size={15} color="#198754" />
                      <small className="fw-semibold">{t("Extracted Data")}</small>
                    </div>
                    <span className="badge bg-secondary">{tableRows.length} {t("fields")}</span>
                  </div>

                  <div className="card-body p-0">
                    <div className="table-responsive" style={{ maxHeight: "420px", overflowY: "auto" }}>
                      <table className="table table-hover table-bordered table-sm mb-0">
                        <thead className="table-dark sticky-top">
                          <tr>
                            <th style={{ width: "38%" }}>{t("Field")}</th>
                            <th>{t("Extracted Value")}</th>
                          </tr>
                        </thead>
                        <tbody>
                          {tableRows.map((row, i) => (
                            <tr key={i}>
                              <td className={`fw-semibold text-nowrap ${row.isNested ? "ps-4 text-muted" : ""}`}>
                                {row.isNested && <span className="me-1" style={{ color: "#adb5bd" }}>└</span>}
                                {row.field}
                              </td>
                              <td className={row.value === "—" ? "text-muted fst-italic" : ""} style={{ wordBreak: "break-word" }}>
                                {row.value}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* ── bottom CTA ── */}
                  <div className="card-footer bg-light d-flex justify-content-end">
                    <button className="btn btn-success d-flex align-items-center gap-2 fw-semibold" onClick={handleFillForm}>
                      <UserPlus size={16} />
                      {t("Fill Patient Registration Form")}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}

export default DocumentScan;
