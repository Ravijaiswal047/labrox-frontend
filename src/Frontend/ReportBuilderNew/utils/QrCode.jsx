import React, { useEffect, useState } from "react";
import QRCode from "qrcode";

// Same qrcode-package usage pattern as src/Frontend/Laboratory/QRStandee.jsx.
const QrCode = ({ value, style }) => {
  const [dataUrl, setDataUrl] = useState(null);

  useEffect(() => {
    let cancelled = false;
    QRCode.toDataURL(value || "https://example.com", { margin: 0, width: 200 })
      .then((url) => { if (!cancelled) setDataUrl(url); })
      .catch(() => { if (!cancelled) setDataUrl(null); });
    return () => { cancelled = true; };
  }, [value]);

  if (!dataUrl) {
    return <div style={{ ...style, background: "#EDF1F7" }} />;
  }
  return <img src={dataUrl} alt="QR" style={{ width: "100%", height: "100%", ...style }} />;
};

export default QrCode;
