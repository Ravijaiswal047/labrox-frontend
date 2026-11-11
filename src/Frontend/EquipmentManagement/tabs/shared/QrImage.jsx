import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import QRCode from "qrcode";

/**
 * Real, scannable QR rendered as an <img>. Same qrcode-package pattern as
 * src/Frontend/ReportBuilderNew/utils/QrCode.jsx and QRStandee.jsx.
 *
 * `alt` describes the encoded equipment, so the label still identifies itself
 * if the image fails to render or is read by a screen reader.
 */
const QrImage = ({ value, size = 132, alt }) => {
  const { t } = useTranslation();
  const [dataUrl, setDataUrl] = useState(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setFailed(false);
    QRCode.toDataURL(value || "", { margin: 1, width: size * 2 })
      .then((url) => {
        if (!cancelled) setDataUrl(url);
      })
      .catch(() => {
        if (!cancelled) setFailed(true);
      });
    return () => {
      cancelled = true;
    };
  }, [value, size]);

  if (failed) {
    return (
      <div className="em-qr-fallback" style={{ width: size, height: size }}>
        {t("QR unavailable")}
      </div>
    );
  }

  if (!dataUrl) {
    // Reserve the exact footprint so the label doesn't jump when it resolves.
    return (
      <div className="em-qr-placeholder" style={{ width: size, height: size }} />
    );
  }

  return (
    <img
      className="em-qr-img"
      src={dataUrl}
      alt={alt || t("QR code")}
      width={size}
      height={size}
    />
  );
};

export default QrImage;
