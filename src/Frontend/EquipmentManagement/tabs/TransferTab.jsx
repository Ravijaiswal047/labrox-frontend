import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import moment from "moment";
import Heading from "@app/components/UI/Heading";
import CustomTable from "@app/components/Table/CustomTable";
import { CustomButton } from "@app/components/UI/CustomButton";
import { notify } from "@app/utils/utils";
import { getCentreDetails } from "@app/utils/NetworkApi/commonApi";
import { axiosInstance } from "../../../utils/axiosInstance";
import NewTransferModal from "./NewTransferModal";
import {
  formatApiDate,
  formatDisplayDate,
} from "../equipmentConstants";
import {
  TRANSFER_STATUS,
  transferBadgeClass,
} from "../transferConstants";

const TransferTab = () => {
  const { t } = useTranslation();

  const [transfers, setTransfers] = useState([]);
  const [equipmentList, setEquipmentList] = useState([]);
  const [centreList, setCentreList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showModal, setShowModal] = useState(false);

  // ─── Load Live Transfers ──────────────────────────────────────────────────
  const loadTransfers = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.post(
        "EquipmentManagement/GetEquipmentTransfers",
        {}
      );
      if (response?.data?.success) {
        setTransfers(response.data.message || []);
      } else {
        setTransfers([]);
      }
    } catch (err) {
      console.error("Failed to load transfers", err);
      setTransfers([]);
    } finally {
      setLoading(false);
    }
  };

  // ─── Load Equipment & Centres ─────────────────────────────────────────────
  const loadEquipment = async () => {
    try {
      const response = await axiosInstance.post(
        "EquipmentManagement/GetEquipment",
        {}
      );
      if (response?.data?.success) {
        setEquipmentList(response.data.message || []);
      }
    } catch (err) {
      console.error("Failed to load equipment list", err);
    }
  };

  useEffect(() => {
    loadTransfers();
    loadEquipment();
    getCentreDetails(setCentreList);
  }, []);

  // ─── Update Transfer Status (Approve / Reject / Received) ─────────────────
  const handleStatusChange = async (transferId, status) => {
    try {
      const response = await axiosInstance.post(
        "EquipmentManagement/UpdateTransferStatus",
        {
          TransferID: Number(transferId),
          Status: status,
        }
      );
      if (response?.data?.success) {
        notify(
          response.data.message || `${t("Transfer")} ${t(status)}`,
          "success"
        );
        await loadTransfers();
        if (status === TRANSFER_STATUS.RECEIVED) {
          // Centre has updated in database, refresh equipment list immediately
          loadEquipment();
        }
      } else {
        notify(response?.data?.message || t("Failed to update status"), "error");
      }
    } catch (err) {
      notify(
        err?.response?.data?.message ||
          err?.message ||
          t("Error updating status"),
        "error"
      );
    }
  };

  // ─── Submit New Transfer Request ──────────────────────────────────────────
  const handleSave = async (form) => {
    setIsSaving(true);
    try {
      const payload = {
        EquipmentID: Number(form.EquipmentID),
        ToCentreID: Number(form.ToCentreID),
        ToCentreName: form.ToCentreName,
        TransferDate:
          formatApiDate(form.TransferDate) || moment().format("YYYY-MM-DD"),
        Reason: form.Reason ? form.Reason.trim() : "",
      };

      const response = await axiosInstance.post(
        "EquipmentManagement/CreateEquipmentTransfer",
        payload
      );
      if (response?.data?.success) {
        notify(
          response.data.message || t("Transfer request submitted"),
          "success"
        );
        setShowModal(false);
        await loadTransfers();
      } else {
        notify(
          response?.data?.message || t("Failed to create transfer request"),
          "error"
        );
      }
    } catch (err) {
      notify(
        err?.response?.data?.message ||
          err?.message ||
          t("Error creating transfer request"),
        "error"
      );
    } finally {
      setIsSaving(false);
    }
  };

  // ─── Table Rows ───────────────────────────────────────────────────────────
  const rows = transfers.map((tr) => {
    return {
      id: (
        <span className="em-detail-strong">
          {tr.TransferCode || tr.TransferID}
        </span>
      ),
      equipment: (
        <div>
          <div className="em-eq-name">
            {tr.EquipmentName || tr.EquipmentCode}
          </div>
          <div className="em-eq-sub">{tr.EquipmentCode}</div>
        </div>
      ),
      route: (
        <div>
          <div>{tr.FromCentreName || tr.FromCentre || "—"}</div>
          <div className="em-eq-sub">
            → {tr.ToCentreName || tr.ToCentre || "—"}
          </div>
        </div>
      ),
      requestedBy: tr.RequestedByName || tr.RequestedBy || "—",
      date: formatDisplayDate(tr.TransferDate),
      reason: tr.Reason || "—",
      status: (
        <span className={transferBadgeClass(tr.Status)}>{t(tr.Status)}</span>
      ),
      actions:
        tr.Status === TRANSFER_STATUS.PENDING ? (
          <div className="d-flex" style={{ gap: "6px" }}>
            <button
              type="button"
              className="btn btn-sm btn-outline-success em-row-btn py-0 px-2"
              onClick={() =>
                handleStatusChange(tr.TransferID, TRANSFER_STATUS.APPROVED)
              }
            >
              {t("Approve")}
            </button>
            <button
              type="button"
              className="btn btn-sm btn-outline-danger em-row-btn py-0 px-2"
              onClick={() =>
                handleStatusChange(tr.TransferID, TRANSFER_STATUS.REJECTED)
              }
            >
              {t("Reject")}
            </button>
          </div>
        ) : tr.Status === TRANSFER_STATUS.APPROVED ? (
          <button
            type="button"
            className="btn btn-sm btn-outline-primary em-row-btn py-0 px-2"
            onClick={() =>
              handleStatusChange(tr.TransferID, TRANSFER_STATUS.RECEIVED)
            }
          >
            {t("Confirm Received")}
          </button>
        ) : (
          "—"
        ),
    };
  });

  return (
    <div className="em-master">
      <Heading
        title={t("Equipment Transfer Requests")}
        secondTitle={
          <div className="em-filter-bar">
            <CustomButton
              text={t("New Transfer Request")}
              icon="add"
              variant="success"
              onClick={() => setShowModal(true)}
            />
          </div>
        }
      />
      <div className="mt-1 table_ticket">
        <CustomTable
          disableTooltip={true}
          columns={[
            { header: t("Request"), field: "id", minWidth: "140px" },
            { header: t("Equipment"), field: "equipment", minWidth: "200px" },
            { header: t("From → To"), field: "route", minWidth: "200px" },
            {
              header: t("Requested By"),
              field: "requestedBy",
              minWidth: "170px",
            },
            { header: t("Transfer Date"), field: "date", minWidth: "120px" },
            {
              header: t("Reason"),
              field: "reason",
              minWidth: "220px",
              wrapText: true,
            },
            { header: t("Status"), field: "status", minWidth: "110px" },
            { header: t("Action"), field: "actions", minWidth: "170px" },
          ]}
          data={rows}
        />
      </div>

      <p className="em-detail-empty">
        {t(
          "Admin approves or rejects a pending request. The receiving centre confirms on arrival — the status then becomes Received and updates the equipment location automatically."
        )}
      </p>

      <NewTransferModal
        visible={showModal}
        setVisible={setShowModal}
        onSave={handleSave}
        equipmentList={equipmentList}
        centreList={centreList}
        isSaving={isSaving}
      />
    </div>
  );
};

export default TransferTab;
