import React, { useEffect, useState } from "react";
import { Dialog } from "primereact/dialog";
import { useTranslation } from "react-i18next";
import { useLocalStorage } from "../../utils/hooks/useLocalStorage";
import { axiosInstance } from "../../utils/axiosInstance";
import { toast } from "react-toastify";

const PdfPreviewModal = ({ visible, url, onClose, ModalSize }) => {
  const { t } = useTranslation();
  const isMobile = window.innerWidth <= 768;
  const theme = useLocalStorage("theme", "get");

  const [tableData, setTableData] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [zoom, setZoom] = useState(1);

  const MIN_ZOOM = 0.5;
  const MAX_ZOOM = 3;

  const handleZoomIn = () => setZoom((prev) => Math.min(MAX_ZOOM, +(prev + 0.25).toFixed(2)));
  const handleZoomOut = () => setZoom((prev) => Math.max(MIN_ZOOM, +(prev - 0.25).toFixed(2)));
  const handleZoomReset = () => setZoom(1);

  useEffect(() => {
    setZoom(1);
  }, [currentIndex, visible]);

  const getimgurl = async (id) => {
    try {
      const response = await axiosInstance.post("CommonController/GetFileUrl", {
        Key: id,
      });
      return response?.data;
    } catch (err) {
      return null;
    }
  };

  const GetDocument = async () => {
    if (!url) return;

    setLoading(true);
    setTableData([]);
    setCurrentIndex(0);

    try {
      const keys = Array.isArray(url) ? url : [url];

      const documentData = await Promise.all(
        keys.map(async (key) => {
          const imageData = await getimgurl(key);
          return {
            awsKey: key,
            imgUrl : imageData?.message,
            data: imageData?.data
          };
        })
      );

      setTableData(documentData);
    } catch (error) {
      toast.error(t("Error fetching documents"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (visible) GetDocument();
  }, [url, visible]);

  // Navigation Logic
  const handleNext = () => {
    if (currentIndex < tableData.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  const handleDownload = async (e) => {
    e?.preventDefault();
    e?.stopPropagation();

    if (!currentDoc?.imgUrl) {
      toast.warning(t("No document URL available to download."));
      return;
    }

    const url = currentDoc.imgUrl;
    const fileExtension = url.split('?')[0].split('.').pop()?.toLowerCase() || 'file';
    const docType = getDocDetail("documentType") || "document";
    const fileName = `${docType.replace(/\s+/g, "_")}.${fileExtension}`;

    try {
      const response = await fetch(url, { credentials: 'omit' });
      if (!response.ok) throw new Error("Network response was not ok");
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      link.remove();
      setTimeout(() => window.URL.revokeObjectURL(blobUrl), 1000);
    } catch (error) {
      // Cross-origin file URLs make browsers ignore the `download` attribute and
      // navigate the current tab to the file instead, which looks like the app
      // was replaced. Open in a new tab so the LIS app stays open in this tab.
      console.warn("Fetch download failed, opening in a new tab instead", error);
      window.open(url, "_blank", "noopener,noreferrer");
    }
  };

  const currentDoc = tableData[currentIndex];

  const isPdf = (url) => url?.toLowerCase().includes(".pdf") || url?.toLowerCase().includes("pdf");

  const getDocDetail = (field) => {
    if (!currentDoc) return "";

    // Check direct properties
    if (currentDoc[field]) return currentDoc[field];

    // Check inside currentDoc.data
    if (currentDoc.data) {
      if (typeof currentDoc.data === "object") {
        return currentDoc.data[field] || "";
      }
      try {
        const parsed = JSON.parse(currentDoc.data);
        return parsed[field] || "";
      } catch (e) {
        // Not JSON
      }
    }
    return "";
  };

  const documentType = getDocDetail("documentType");
  const uploadedBy = getDocDetail("uploadedBy");
  const uploadedDate = getDocDetail("uploadedDate");

  return (
    <Dialog
      header={
        <div className="d-flex justify-content-between align-items-center w-100 pr-5" style={{ gap: "10px", flexWrap: "wrap" }}>
          <div>
            <span>{t("Document Preview")}</span>
            {tableData.length > 1 && (
              <span className="badge badge-info ml-3">
                {currentIndex + 1} / {tableData.length}
              </span>
            )}
          </div>
          <div className="d-flex align-items-center" style={{ gap: "10px", fontSize: "14px" }}>
            <span>
              {t("Document Type")}
              {documentType && (
                <>
                  : <strong>{t(documentType)}</strong>
                </>
              )}
            </span>
            {uploadedBy && (
              <>
                <span style={{ opacity: 0.6 }}>|</span>
                <span style={{ fontSize: "12px" }}>
                  {t("Uploaded By")}: <strong>{uploadedBy}</strong>
                </span>
              </>
            )}
            {uploadedDate && (
              <>
                <span style={{ opacity: 0.6 }}>|</span>
                <span style={{ fontSize: "12px" }}>
                  {t("Uploaded Date")}: <strong>{uploadedDate}</strong>
                </span>
              </>
            )}
            <i
              className="fa fa-download"
              style={{ cursor: "pointer", fontSize: "16px", marginLeft: "10px" }}
              onClick={(e) => handleDownload(e)}
              title={t("Download")}
            />
          </div>
        </div>
      }
      visible={visible}
      onHide={onClose}
      className={theme}
      style={ModalSize ? ModalSize : { width: isMobile ? "90vw" : "70vw" }}
      maximizable
      draggable={false}
    >
      <div className="position-relative" style={{ height: "100vh", display: "flex", alignItems: "center" }}>

        {/* Left Arrow */}
        {tableData.length > 1 && (
          <button
            className="btn btn-dark position-absolute"
            style={{ left: "10px", zIndex: 10, borderRadius: "50%", opacity: currentIndex === 0 ? 0.3 : 0.8 }}
            onClick={handlePrev}
            disabled={currentIndex === 0}
          >
            <i className="fa fa-chevron-left"></i>
          </button>
        )}

        {/* PDF / Image Viewer */}
        <div className="w-100 h-100" style={{ overflow: "auto" }}>
          {loading ? (
            <div className="d-flex justify-content-center align-items-center h-100">
              <i className="fa fa-spinner fa-spin fa-3x"></i>
            </div>
          ) : currentDoc?.imgUrl ? (
            isPdf(currentDoc.imgUrl) ? (
              <div
                style={{
                  width: "100%",
                  height: "100%",
                  transform: `scale(${zoom})`,
                  transformOrigin: "center top",
                  transition: "transform 0.15s ease",
                }}
              >
                <iframe
                  src={`${currentDoc.imgUrl}#toolbar=0`}
                  width="100%"
                  height="100%"
                  style={{ border: "none" }}
                  title="Viewer"
                />
              </div>
            ) : (
              <div className="d-flex justify-content-center align-items-center h-100">
                <img
                  src={currentDoc.imgUrl}
                  alt="Document"
                  style={{
                    maxWidth: "100%",
                    maxHeight: "100%",
                    objectFit: "contain",
                    transform: `scale(${zoom})`,
                    transformOrigin: "center center",
                    transition: "transform 0.15s ease",
                  }}
                />
              </div>
            )

          ) : (
            <div className="text-center mt-5">{t("No Document Found")}</div>
          )}
        </div>

        {/* Zoom Controls */}
        {!loading && currentDoc?.imgUrl && (
          <div
            className="position-absolute d-flex align-items-center"
            style={{
              bottom: "10px",
              left: "50%",
              transform: "translateX(-50%)",
              zIndex: 11,
              gap: "10px",
              background: "rgba(0,0,0,0.65)",
              padding: "6px 12px",
              borderRadius: "20px",
            }}
          >
            <i
              className="fa fa-search-minus"
              style={{ color: "#fff", cursor: "pointer", opacity: zoom <= MIN_ZOOM ? 0.4 : 1 }}
              onClick={handleZoomOut}
              title={t("Zoom Out")}
            />
            <span style={{ color: "#fff", fontSize: "12px", minWidth: "36px", textAlign: "center" }}>
              {Math.round(zoom * 100)}%
            </span>
            <i
              className="fa fa-search-plus"
              style={{ color: "#fff", cursor: "pointer", opacity: zoom >= MAX_ZOOM ? 0.4 : 1 }}
              onClick={handleZoomIn}
              title={t("Zoom In")}
            />
            <i
              className="fa fa-refresh"
              style={{ color: "#fff", cursor: "pointer" }}
              onClick={handleZoomReset}
              title={t("Reset Zoom")}
            />
          </div>
        )}

        {/* Right Arrow */}
        {tableData.length > 1 && (
          <button
            className="btn btn-dark position-absolute"
            style={{ right: "10px", zIndex: 10, borderRadius: "50%", opacity: currentIndex === tableData.length - 1 ? 0.3 : 0.8 }}
            onClick={handleNext}
            disabled={currentIndex === tableData.length - 1}
          >
            <i className="fa fa-chevron-right"></i>
          </button>
        )}
      </div>
    </Dialog>
  );
};

export default PdfPreviewModal;
