import React, { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import Heading from "@app/components/UI/Heading";
import Modal from "@app/components/formComponent/Modal";
import ReactSelect from "@app/components/formComponent/ReactSelect";
import { CustomButton, CancelButton } from "@app/components/UI/CustomButton";
import QrImage from "./shared/QrImage";
import { getCentreDetails } from "@app/utils/NetworkApi/commonApi";
import { axiosInstance } from "../../../utils/axiosInstance";

const ALL_CENTRES_KEY = "__ALL__";

const getVal = (item, ...keys) => {
  if (!item) return "";
  for (const k of keys) {
    if (item[k] !== undefined && item[k] !== null && item[k] !== "") {
      return item[k];
    }
  }
  return "";
};

const QrCodesTab = () => {
  const { t } = useTranslation();
  const [centre, setCentre] = useState(ALL_CENTRES_KEY);
  const [centreList, setCentreList] = useState([]);
  const [qrItems, setQrItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [enlarged, setEnlarged] = useState(null);

  // ─── Load Centre dropdown list ────────────────────────────────────────────
  useEffect(() => {
    getCentreDetails(setCentreList);
  }, []);

  // ─── Load Live Equipment QR Data ──────────────────────────────────────────
  const loadQRCodes = async (selectedCentre) => {
    setLoading(true);
    try {
      const payload = {};
      if (
        selectedCentre &&
        selectedCentre !== ALL_CENTRES_KEY &&
        selectedCentre !== "All Centres"
      ) {
        if (Number(selectedCentre)) {
          payload.CentreID = Number(selectedCentre);
        }
      }
      const response = await axiosInstance.post(
        "EquipmentManagement/GetEquipmentQRCodes",
        payload
      );
      if (response?.data?.success) {
        setQrItems(response.data.message || []);
      } else {
        setQrItems([]);
      }
    } catch (err) {
      console.error("Failed to load QR codes", err);
      setQrItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadQRCodes(centre);
  }, [centre]);

  const centreOptions = useMemo(() => {
    const list = (centreList || []).map((c) => ({
      label: c.label || c.Centre,
      value: c.value || c.CentreID,
    }));
    return [{ label: t("All Centres"), value: ALL_CENTRES_KEY }, ...list];
  }, [centreList, t]);

  const getScanUrl = (item) => {
    const hash = getVal(item, "equipmentIDHash", "EquipmentIDHash");
    if (!hash) return "";
    return `${window.location.origin}/eq/${hash}`;
  };

  const enlargedUrl = enlarged ? getScanUrl(enlarged) : "";
  const enlargedCode = enlarged ? getVal(enlarged, "equipmentCode", "EquipmentCode") : "";
  const enlargedName = enlarged ? getVal(enlarged, "equipmentName", "EquipmentName") : "";
  const enlargedSerial = enlarged ? getVal(enlarged, "serialNumber", "SerialNumber") : "";
  const enlargedCentre = enlarged ? getVal(enlarged, "centreName", "CentreName") : "";
  const enlargedContract = enlarged ? getVal(enlarged, "contractInfo", "ContractInfo") : "";
  const enlargedCal = enlarged ? getVal(enlarged, "calibrationInfo", "CalibrationInfo") : "";

  return (
    <div className="em-master">
      <Heading
        title={t("QR Code Labels")}
        secondTitle={
          <div className="em-filter-bar em-noprint">
            <div className="em-filter-field">
              <ReactSelect
                id="qrCentreFilter"
                name="Centre"
                placeholderName="Centre"
                value={centre}
                dynamicOptions={centreOptions}
                onChange={(name, option) =>
                  setCentre(option?.value ?? ALL_CENTRES_KEY)
                }
                respclass=""
              />
            </div>
            <CustomButton
              text={t("Print Label Sheet")}
              icon="print"
              variant="secondary"
              onClick={() => window.print()}
            />
          </div>
        }
      />

      <div className="em-qr-sheet mt-2">
        {loading ? (
          <div className="text-center py-5 text-muted">
            <i className="fa fa-spinner fa-spin fa-2x mb-2" />
            <div>{t("Loading QR code labels...")}</div>
          </div>
        ) : qrItems.length ? (
          <div className="em-qr-grid">
            {qrItems.map((item, idx) => {
              const code = getVal(item, "equipmentCode", "EquipmentCode");
              const name = getVal(item, "equipmentName", "EquipmentName");
              const serial = getVal(item, "serialNumber", "SerialNumber");
              const centreName = getVal(item, "centreName", "CentreName");
              const contract = getVal(item, "contractInfo", "ContractInfo");
              const calibration = getVal(item, "calibrationInfo", "CalibrationInfo");
              const qrUrl = getScanUrl(item);

              return (
                <div
                  className="em-qr-label"
                  key={getVal(item, "equipmentID", "EquipmentID") || idx}
                >
                  <div className="em-qr-name">{name}</div>

                  {qrUrl ? (
                    <QrImage
                      value={qrUrl}
                      size={150}
                      alt={`QR code for ${name} (${code})`}
                    />
                  ) : (
                    <div
                      className="d-flex align-items-center justify-content-center text-muted mx-auto my-2"
                      style={{
                        width: 150,
                        height: 150,
                        border: "1px dashed #ccc",
                        borderRadius: 6,
                        fontSize: "11px",
                      }}
                    >
                      {t("QR not available")}
                    </div>
                  )}

                  <div className="em-qr-meta">
                    <div className="font-weight-bold text-dark">{code}</div>
                    <div>
                      {t("SN")}: {serial || "—"}
                    </div>
                    <div className="text-truncate" title={centreName}>
                      {centreName || "—"}
                    </div>
                  </div>

                  {(calibration || contract) && (
                    <div className="em-qr-due">
                      {calibration && calibration !== "Not scheduled"
                        ? calibration
                        : contract || ""}
                    </div>
                  )}

                  {/* {qrUrl && (
                    <div
                      className="text-muted text-center mt-1 em-noprint"
                      style={{ fontSize: "9.5px", wordBreak: "break-all" }}
                    >
                      {qrUrl}
                    </div>
                  )} */}

                  <div className="d-flex justify-content-center gap-2 mt-2 em-noprint">
                    <button
                      type="button"
                      className="btn btn-sm btn-outline-secondary em-row-btn py-0 px-3"
                      onClick={() => setEnlarged(item)}
                    >
                      <i className="fa fa-expand me-1" />
                      {t("Enlarge")}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="em-detail-empty">
            {t("No equipment found for QR code generation.")}
          </div>
        )}
      </div>

      {/* Enlarge QR Modal (like in Equipment Master) */}
      <Modal
        visible={Boolean(enlarged)}
        setVisible={(open) => !open && setEnlarged(null)}
        Header={enlarged ? `${t("QR")} — ${enlargedCode}` : ""}
        modalWidth="460px"
        buttons={
          <>
            <CustomButton
              text={t("Print")}
              icon="print"
              variant="secondary"
              onClick={() => window.print()}
            />
            <CancelButton text={t("Close")} onClick={() => setEnlarged(null)} />
          </>
        }
      >
        {enlarged && (
          <div className="d-flex flex-column align-items-center py-3 gap-3 text-center">
            {enlargedUrl ? (
              <QrImage
                value={enlargedUrl}
                size={210}
                alt={`QR for ${enlargedCode}`}
              />
            ) : (
              <div
                className="d-flex align-items-center justify-content-center text-muted"
                style={{
                  width: 210,
                  height: 210,
                  border: "1px dashed #ccc",
                  borderRadius: 8,
                }}
              >
                {t("QR not available")}
              </div>
            )}

            <div>
              <div style={{ fontWeight: 600, fontSize: "16px" }}>
                {enlargedName}
              </div>
              <div className="text-muted mt-1" style={{ fontSize: "12px" }}>
                {[enlargedCode, enlargedSerial ? `SN ${enlargedSerial}` : null, enlargedCentre]
                  .filter(Boolean)
                  .join(" · ")}
              </div>
              {(enlargedContract || enlargedCal) && (
                <div className="text-muted mt-1" style={{ fontSize: "12px" }}>
                  {[enlargedContract, enlargedCal]
                    .filter(Boolean)
                    .join(" · ")}
                </div>
              )}
            </div>

            {/* {enlargedUrl && (
              <div
                className="text-muted text-center"
                style={{ fontSize: "10px", wordBreak: "break-all", maxWidth: 360 }}
              >
                {enlargedUrl}
              </div>
            )} */}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default QrCodesTab;
