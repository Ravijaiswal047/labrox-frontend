export const getReportDownloadName = (res, fallback) => {
  const disposition = res?.headers?.["content-disposition"] || "";
  const utfMatch = disposition.match(/filename\*=UTF-8''([^;]+)/i);
  if (utfMatch?.[1]) {
    try {
      return decodeURIComponent(utfMatch[1]);
    } catch {
      return utfMatch[1];
    }
  }
  const match = disposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
  const name = match?.[1]?.replace(/['"]/g, "").trim();
  return name || fallback;
};

export const downloadReportBlob = (blob, fileName) => {
  const fileUrl = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = fileUrl;
  link.setAttribute("download", fileName);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(fileUrl);
};

export const openPdfPreview = (blob) => {
  const pdfBlob =
    blob instanceof Blob && blob.type === "application/pdf"
      ? blob
      : new Blob([blob], { type: "application/pdf" });
  const fileUrl = window.URL.createObjectURL(pdfBlob);
  window.open(fileUrl, "_blank");
  setTimeout(() => window.URL.revokeObjectURL(fileUrl), 10000);
};

export const saveAndPreviewPdf = (blob, fileName) => {
  const pdfBlob = new Blob([blob], { type: "application/pdf" });
  downloadReportBlob(pdfBlob, fileName);
  openPdfPreview(pdfBlob);
};
