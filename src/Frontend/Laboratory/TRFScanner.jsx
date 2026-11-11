import React, { useState, useEffect, useRef } from "react";
import { X, RefreshCw, FileText, CheckCircle, Grid, Image as ImageIcon, ArrowRight, Camera } from "lucide-react";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import { readGRNInvoiceWithGemini } from "../../utils/NetworkApi/commonApi";
import { mapExtractedDataToFormFields } from "./ExtractedDataMapper";

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || "";
const GEMINI_MODEL = "gemini-3.1-flash-lite";

// onCapture: (files: File[]) => Promise<void> — hands freshly-captured/
// picked TRF photo(s) back to the parent so it can upload them via the same
// "PreRegistration/SaveTrfWithFiles" call WelcomePage's camera/upload flow
// uses (one request, however many files), then append them into the
// `images` array it controls once saved. Camera capture always sends a
// single-file array; the gallery picker can send several at once.
// onRemove: (index: number, image: { id, image }) => void — fired when the
// ✕ on a TRF card is clicked, so the parent can drop it from `images` and
// delete it server-side if it has a real id. See handleRemoveTrfImage in
// PatientRegistration.jsx.
const TRFScanner = ({ onDataExtracted, onClose, images = [], onCapture, onRemove }) => {
  const { t } = useTranslation();
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [processedImages, setProcessedImages] = useState(new Set());
  const [loading, setLoading] = useState(false);
  const [extractedData, setExtractedData] = useState(null);
  const [viewMode, setViewMode] = useState("grid"); // 'grid' or 'detail'

  // ── In-browser camera capture (getUserMedia) — same approach as
  // WelcomePage's "Take Photo", so a TRF can be scanned live from here too,
  // not just pulled in from a prior upload/scan. ──────────────────────────
  const [showCamera, setShowCamera] = useState(false);
  const [cameraStarting, setCameraStarting] = useState(false);
  const [uploadingCapture, setUploadingCapture] = useState(false);
  const videoRef = useRef(null);
  const cameraStreamRef = useRef(null);

  const stopCameraStream = () => {
    cameraStreamRef.current?.getTracks()?.forEach((track) => track.stop());
    cameraStreamRef.current = null;
  };

  const openCamera = async () => {
    if (!navigator.mediaDevices?.getUserMedia) {
      toast.error(t("Camera is not supported on this browser."));
      return;
    }
    setCameraStarting(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
        audio: false,
      });
      cameraStreamRef.current = stream;
      setShowCamera(true);
    } catch (err) {
      console.error(err);
      toast.error(t("Unable to access camera. Please check camera permissions."));
    } finally {
      setCameraStarting(false);
    }
  };

  const closeCamera = () => {
    stopCameraStream();
    setShowCamera(false);
  };

  // Attach the stream once the <video> element is actually mounted (it
  // isn't yet at the moment getUserMedia resolves).
  useEffect(() => {
    if (showCamera && videoRef.current && cameraStreamRef.current) {
      videoRef.current.srcObject = cameraStreamRef.current;
    }
  }, [showCamera]);

  // Stop the camera if the panel unmounts while it's still open.
  useEffect(() => stopCameraStream, []);

  const capturePhoto = () => {
    const video = videoRef.current;
    if (!video || !video.videoWidth) return;
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext("2d").drawImage(video, 0, 0, canvas.width, canvas.height);
    canvas.toBlob(
      async (blob) => {
        closeCamera();
        if (!blob) return;
        const file = new File([blob], `trf-capture-${Date.now()}.jpg`, {
          type: "image/jpeg",
        });
        // New capture lands at the end of `images` — jump straight to grid
        // view so it shows up alongside the others instead of staying on
        // whatever was being viewed before.
        setViewMode("grid");
        setUploadingCapture(true);
        try {
          await onCapture?.([file]);
        } finally {
          setUploadingCapture(false);
        }
      },
      "image/jpeg",
      0.92,
    );
  };

  // ── Gallery upload — same file-input-based flow as WelcomePage's "Upload
  // TRF Images" button, just wired to add straight into this panel's grid
  // instead of sessionStorage. Supports picking multiple images at once.
  const handleGalleryFiles = async (e) => {
    const files = Array.from(e.target.files || []);
    e.target.value = ""; // allow re-selecting the same file(s) later
    if (files.length === 0) return;
    setViewMode("grid");
    setUploadingCapture(true);
    try {
      await onCapture?.(files);
    } finally {
      setUploadingCapture(false);
    }
  };

  useEffect(() => {
    if (images.length > 0 && selectedIndex === null) {
      // Auto-select first image if only one or if coming from welcome
      setSelectedIndex(0);
      setViewMode(images.length > 1 ? "grid" : "detail");
    }
  }, [images]);

  const compressImage = (base64) => {
    return new Promise((resolve) => {
      const img = new Image();
      img.src = base64;
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let width = img.width;
        let height = img.height;
        const max_size = 1200;

        if (width > height) {
          if (width > max_size) {
            height *= max_size / width;
            width = max_size;
          }
        } else {
          if (height > max_size) {
            width *= max_size / height;
            height = max_size;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, width, height);
        canvas.toBlob((blob) => resolve(blob), "image/jpeg", 0.7);
      };
    });
  };

  const processImage = async (index) => {
    setSelectedIndex(index);
    setViewMode("detail");
    setLoading(true);
    setExtractedData(null);
    try {
      const compressedBlob = await compressImage(images[index].image);
      const res = await readGRNInvoiceWithGemini(
        compressedBlob,
        GEMINI_API_KEY,
        GEMINI_MODEL,
      );

      if (res) {
        const mapped = mapExtractedDataToFormFields(res);
        setExtractedData(mapped);
        toast.success(t("Data extracted successfully!"));
      }
    } catch (err) {
      console.error(err);
      toast.error(t("AI extraction failed. Please try again."));
    } finally {
      setLoading(false);
    }
  };

  const handleFillData = () => {
    if (extractedData) {
      onDataExtracted({ ...extractedData, trfId: images[selectedIndex].id });
      // Tracked by the image object itself, not its array index — a newly
      // captured TRF gets prepended to the front of `images` (see
      // PatientRegistration.jsx's handleTrfFilesUpload), which shifts every
      // existing image's index. Marking by index would put the ✓ tick on
      // whatever image happens to have this index *now*, not the one that
      // was actually scanned+filled. The image objects themselves keep
      // their identity across reordering, so a Set of them doesn't drift.
      setProcessedImages((prev) => new Set([...prev, images[selectedIndex]]));
      if (images.length > 1) {
        setViewMode("grid");
      }
    }
  };

  // selectedIndex is still index-based (it has to be, to read images[selectedIndex]),
  // so removing an item still needs to shift/clear it same as before.
  // processedImages no longer needs any adjustment here — it's keyed by
  // the image objects themselves, which don't change identity when the
  // array around them is spliced.
  const handleRemove = (e, idx) => {
    e.stopPropagation(); // don't also trigger the card's onClick (processImage)
    onRemove?.(idx, images[idx]);
    if (selectedIndex === idx) {
      setSelectedIndex(null);
      setViewMode("grid");
    } else if (selectedIndex !== null && selectedIndex > idx) {
      setSelectedIndex((prev) => prev - 1);
    }
  };

  const formatValue = (val) => {
    if (typeof val === "object" && val !== null) {
      return Object.entries(val)
        .filter(([_, v]) => v)
        .map(([k, v]) => `${k}: ${v}`)
        .join(", ");
    }
    return val || "—";
  };

  return (
    <>
    {showCamera && (
      <div
        style={{
          position: "fixed", inset: 0, zIndex: 2000,
          background: "rgba(0,0,0,0.85)",
          display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center", gap: "16px",
        }}
      >
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          style={{ maxWidth: "90vw", maxHeight: "70vh", borderRadius: "8px", background: "#000" }}
        />
        <div style={{ display: "flex", gap: "12px" }}>
          <button className="btn btn-primary" onClick={capturePhoto}>
            <Camera size={16} className="mr-2" />
            {t("Capture")}
          </button>
          <button className="btn btn-secondary" onClick={closeCamera}>
            <X size={16} className="mr-2" />
            {t("Cancel")}
          </button>
        </div>
      </div>
    )}
    <input
      type="file"
      id="trfGalleryUpload"
      multiple
      accept="image/*"
      style={{ display: "none" }}
      onChange={handleGalleryFiles}
    />
    <div className="card shadow-sm border-primary sticky-top" style={{ height: "calc(100vh - 120px)", top: "10px" }}>
      <div className="card-header bg-primary text-white d-flex justify-content-between align-items-center py-2">
        <h6 className="mb-0 d-flex align-items-center gap-2 text-primary fw-bold">
          {viewMode === "grid" ? <Grid size={18} /> : <ImageIcon size={18} />}
          {viewMode === "grid" ? t("Pending TRFs") : t("TRF AI Scanner")}
        </h6>
        <div className="d-flex gap-2">
          {viewMode === "detail" && images.length > 1 && (
            <button className="btn btn-sm btn-light py-0 px-2 small" onClick={() => setViewMode("grid")}>
              {t("Back to Grid")}
            </button>
          )}
          <button
            className="btn btn-sm btn-light p-1 rounded-circle"
            title={t("Upload TRF Images")}
            onClick={() => document.getElementById("trfGalleryUpload").click()}
            disabled={uploadingCapture}
          >
            <ImageIcon size={16} />
          </button>
          <button
            className="btn btn-sm btn-light p-1 rounded-circle"
            title={t("Scan TRF with Camera")}
            onClick={openCamera}
            disabled={cameraStarting || uploadingCapture}
          >
            <Camera size={16} />
          </button>
          <button className="btn btn-sm btn-light p-1 rounded-circle" onClick={onClose}>
            <X size={16} />
          </button>
        </div>
      </div>

      <div className="card-body p-3 d-flex flex-column" style={{ overflowY: "auto" }}>
        {uploadingCapture && (
          <div className="text-center py-2 mb-2 bg-light rounded">
            <div className="spinner-border spinner-border-sm text-primary mr-2" role="status"></div>
            <span className="small text-primary fw-bold">{t("Uploading TRF...")}</span>
          </div>
        )}
        {viewMode === "grid" && images.length === 0 && !uploadingCapture && (
          <div className="text-center py-5 text-muted">
            <Camera size={32} className="mb-2" />
            <p className="mb-3 small">{t("No pending TRFs yet")}</p>
            <div className="d-flex justify-content-center gap-2">
              <button
                className="btn btn-primary"
                onClick={() => document.getElementById("trfGalleryUpload").click()}
                disabled={uploadingCapture}
              >
                <ImageIcon size={16} className="mr-2" />
                {t("Upload TRF Images")}
              </button>
              <button className="btn btn-primary" onClick={openCamera} disabled={cameraStarting || uploadingCapture}>
                <Camera size={16} className="mr-2" />
                {cameraStarting ? t("Starting Camera...") : t("Take Photo")}
              </button>
            </div>
          </div>
        )}
        {viewMode === "grid" ? (
          <div className="row g-2">
            {images.map((img, idx) => (
              <div key={idx} className="col-6">
                <div 
                  className={`card h-100 cursor-pointer border-2 transition-all ${selectedIndex === idx ? "border-primary shadow" : "border-light"}`}
                  onClick={() => processImage(idx)}
                  style={{ cursor: 'pointer' }}
                >
                  <div className="position-relative">
                    <img src={img.image} className="card-img-top" style={{ height: "120px", objectFit: "cover" }} alt={`TRF ${idx + 1}`} />
                    {processedImages.has(img) && (
                      <div
                        title={t("Scanned — filled to form")}
                        className="position-absolute top-0 end-0 d-flex align-items-center gap-1 bg-success text-white rounded-bottom-start"
                        style={{ padding: "2px 6px", fontSize: "10px", fontWeight: 700 }}
                      >
                        <CheckCircle size={13} /> {t("Scanned")}
                      </div>
                    )}
                    <button
                      type="button"
                      title={t("Remove")}
                      className="btn btn-sm btn-danger rounded-circle position-absolute top-0 start-0 m-1 p-0 d-flex align-items-center justify-content-center"
                      style={{ width: "22px", height: "22px" }}
                      onClick={(e) => handleRemove(e, idx)}
                    >
                      <X size={13} />
                    </button>
                  </div>
                  <div className="card-body p-2 text-center">
                    <small className="fw-bold d-block text-truncate">TRF #{idx + 1}</small>
                    <button className="btn btn-xs btn-primary mt-1 w-100 py-1" style={{ fontSize: '10px' }}>
                      {processedImages.has(img) ? t("Re-scan") : t("Scan Now")}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <>
            <div className="position-relative mb-3 text-center bg-light rounded p-2">
              <img
                src={images[selectedIndex].image}
                className="img-fluid rounded border shadow-sm"
                style={{ maxHeight: "200px", objectFit: "contain" }}
                alt="Preview"
              />
              <button
                className="btn btn-sm btn-danger rounded-circle shadow position-absolute top-0 end-0 m-2"
                onClick={() => setViewMode("grid")}
              >
                <RefreshCw size={14} />
              </button>
              <button
                title={t("Remove")}
                className="btn btn-sm btn-danger rounded-circle shadow position-absolute top-0 m-2"
                style={{ left: "8px" }}
                onClick={(e) => handleRemove(e, selectedIndex)}
              >
                <X size={14} />
              </button>
            </div>

            {loading && (
              <div className="text-center py-4">
                <div className="spinner-border text-primary mb-2" role="status"></div>
                <p className="mb-0 text-primary fw-bold animate-pulse">
                  {t("AI Analyzing Document...")}
                </p>
              </div>
            )}

            {extractedData && !loading && (
              <div className="mt-2 flex-grow-1">
                <div className="alert alert-success d-flex align-items-center gap-2 py-2 px-3 mb-3">
                  <CheckCircle size={18} />
                  <span className="small fw-bold">{t("Extraction Complete")}</span>
                </div>

                <div className="table-responsive" style={{ maxHeight: "250px" }}>
                  <table className="table table-sm table-hover border">
                    <thead className="bg-light sticky-top">
                      <tr>
                        <th className="small">{t("Field")}</th>
                        <th className="small">{t("Value")}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Object.entries(extractedData)
                        .filter(([key, val]) => val && key !== "__scannedTests__" && key !== "testNames" && typeof val !== 'function')
                        .map(([key, val]) => (
                          <tr key={key}>
                            <td className="small text-muted py-1">{key.replace(/([A-Z])/g, ' $1').trim()}</td>
                            <td className="small py-1 fw-bold">{formatValue(val)}</td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>

                <button
                  className="btn btn-primary w-100 mt-3 d-flex align-items-center justify-content-center gap-2 py-2 shadow-sm"
                  onClick={handleFillData}
                >
                  <ArrowRight size={18} /> {t("Apply to Form")}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
    </>
  );
};

export default TRFScanner;
