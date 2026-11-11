import React, { useEffect, useRef, useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";

// Load worker from unpkg to prevent MIME-type issues on Windows/IIS production servers
pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

const PdfViewer = ({ base64Pdf, pdfUrl }) => {
  const [numPages, setNumPages] = useState(null);
  const [width, setWidth] = useState(350);
  const [errorDetails, setErrorDetails] = useState("");
  const containerRef = useRef(null);

  const onDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages);
    setErrorDetails("");
  };

  useEffect(() => {
    const updateWidth = () => {
      if (containerRef.current) {
        setWidth(containerRef.current.offsetWidth);
      }
    };
    updateWidth();
    window.addEventListener("resize", updateWidth);
    
    const timer = setTimeout(updateWidth, 150);
    
    return () => {
      window.removeEventListener("resize", updateWidth);
      clearTimeout(timer);
    };
  }, []);

  const getFileSource = () => {
    const input = base64Pdf || pdfUrl;
    if (!input) return null;

    // If it's a data URI or a raw base64 string, convert it to a Uint8Array.
    // This is the most reliable way to feed PDFs to react-pdf without URL length limits or CORS issues.
    if (input.startsWith("data:") || !input.includes("/")) {
      try {
        let base64 = input;
        if (base64.startsWith("data:")) {
          const parts = base64.split(",");
          base64 = parts[1];
        }
        const binaryString = atob(base64);
        const len = binaryString.length;
        const bytes = new Uint8Array(len);
        for (let i = 0; i < len; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }
        return { data: bytes };
      } catch (err) {
        console.error("Failed to parse base64 PDF data", err);
        return input;
      }
    }
    
    return input;
  };

  const fileSource = getFileSource();

  return (
    <div
      ref={containerRef}
      style={{
        height: "100%",
        overflowY: "auto",
        width: "100%",
        border: "1px solid #ccc",
        backgroundColor: "#f4f4f4",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: "10px 0"
      }}
    >
      {fileSource ? (
        <Document
          file={fileSource}
          onLoadSuccess={onDocumentLoadSuccess}
          onLoadError={(err) => {
            console.error("PDF load error detail:", err);
            setErrorDetails(err.message || String(err));
          }}
          loading={<div className="text-center p-3">Loading PDF...</div>}
          error={
            <div className="text-center p-3 text-danger" style={{ wordBreak: "break-word", padding: "20px" }}>
              <strong>Failed to load PDF:</strong>
              <div style={{ marginTop: "10px", fontSize: "14px", fontFamily: "monospace" }}>
                {errorDetails || "Please try again."}
              </div>
            </div>
          }
        >
          {Array.from(new Array(numPages), (el, index) => (
            <div
              key={`page_${index + 1}`}
              style={{
                marginBottom: "15px",
                boxShadow: "0 2px 5px rgba(0,0,0,0.15)",
                backgroundColor: "#fff"
              }}
            >
              <Page
                pageNumber={index + 1}
                width={width > 40 ? width - 40 : 320}
                renderTextLayer={false}
                renderAnnotationLayer={false}
              />
            </div>
          ))}
        </Document>
      ) : (
        <p className="text-center p-3">No PDF file provided</p>
      )}
    </div>
  );
};

export default PdfViewer;
