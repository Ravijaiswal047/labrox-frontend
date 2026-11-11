import React from "react";
import { useTranslation } from "react-i18next";
import Modal from "@app/components/formComponent/Modal";
import QrImage from "./shared/QrImage";

const EquipmentQrModal = ({ visible, setVisible, item }) => {
  const { t } = useTranslation();

  if (!item) return null;

  const row = item.row || {};
  const hash = row?.EquipmentIDHash;
  const qrUrl = hash
    ? `${window.location.origin}/eq/${hash}`
    : null;

  const summaryLine = [
    item.code,
    item.serial ? `SN ${item.serial}` : null,
    item.centre || null,
  ]
    .filter(Boolean)
    .join(" · ");

  const handlePrint = () => window.print();

  return (
    <Modal
      visible={visible}
      setVisible={setVisible}
      Header={`QR — ${item.code}`}
      modalWidth="480px"
      buttons={
        <button
          type="button"
          className="btn btn-secondary btn-sm"
          onClick={handlePrint}
        >
          <i className="fa fa-print me-1" />
          {t("Print")}
        </button>
      }
    >
      <div className="d-flex flex-column align-items-center py-3 gap-3">
        {qrUrl ? (
          <QrImage value={qrUrl} size={200} alt={`QR for ${item.code}`} />
        ) : (
          <div
            className="d-flex align-items-center justify-content-center text-muted"
            style={{ width: 200, height: 200, border: "1px dashed #ccc", borderRadius: 8 }}
          >
            {t("QR not available — save equipment first")}
          </div>
        )}

        <div className="text-center">
          <div style={{ fontWeight: 600, fontSize: 15 }}>{item.name}</div>
          <div className="text-muted" style={{ fontSize: 12, marginTop: 2 }}>
            {summaryLine}
          </div>
          {row?.WarrantyExpiry && (
            <div className="text-muted" style={{ fontSize: 12 }}>
              {t("Warranty")}:{" "}
              {new Date(row.WarrantyExpiry).toLocaleDateString("en-GB", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              })}
            </div>
          )}
        </div>

        {/* {qrUrl && (
          <div
            className="text-muted text-center"
            style={{ fontSize: 10, wordBreak: "break-all", maxWidth: 360 }}
          >
            {qrUrl}
          </div>
        )} */}
      </div>
    </Modal>
  );
};

export default EquipmentQrModal;
