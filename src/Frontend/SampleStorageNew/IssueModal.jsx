import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import Modal from "@components/formComponent/Modal";
import Input from "@components/formComponent/Input";
import { SaveButton, CancelButton } from "@components/UI/CustomButton";


const safeDateStr = (val) => {
  if (!val) return "";
  if (typeof val === "string") return val.split("T")[0];
  if (typeof val === "object" && val?.value) return val.value.split("T")[0];
  return "";
};

const InfoRow = ({ label, value }) =>
  value ? (
    <div style={{ width: "50%", fontSize: 12, marginBottom: 4, paddingRight: 8 }}>
      <span style={{ color: "#6b7280" }}>{label}: </span>
      <strong>{value}</strong>
    </div>
  ) : null;

const IssueModal = ({ visible, setVisible, issueTarget, onSave }) => {
  const { t } = useTranslation();
  const [form, setForm] = useState({ issuedTo: "", issuedBy: "", issuedFor: "", invoiceAgainst: "" });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    if (!form.issuedTo.trim()) { toast.warning(t("Enter Issued To")); return; }
    onSave(form);
    
    setForm({ issuedTo: "", issuedBy: "", issuedFor: "", invoiceAgainst: "" });
  };

  const handleClose = () => {
    setForm({ issuedTo: "", issuedBy: "", issuedFor: "", invoiceAgainst: "" });
    setVisible(false);
  };

  return (
    <Modal
      visible={visible}
      setVisible={setVisible}
      Header={`${t("Issue Sample")} — ${issueTarget?.barcodeNo || ""}`}
      modalWidth="50vw"
      buttons={
        <>
          <CancelButton text={t("Cancel")} onClick={handleClose} />
          <SaveButton text={t("Issue")} onClick={handleSave} />
        </>
      }
    >
      {issueTarget && (
        <div className="row">
          <div className="col-12 mb-2 p-2 rounded" style={{ background: "#f8f9fa", border: "1px solid #e5e7eb" }}>
            <div className="d-flex flex-wrap">
              <InfoRow label="Barcode"   value={issueTarget?.barcodeNo} />
              <InfoRow label="Collected" value={safeDateStr(issueTarget?.collectedOn)} />
              <InfoRow label="Stored On" value={safeDateStr(issueTarget?.storedOn)} />
              <InfoRow label="Stored By" value={issueTarget?.storedBy} />
              <InfoRow label="Days Left" value={issueTarget?.daysLeft != null ? String(issueTarget.daysLeft) : ""} />
              <InfoRow label="Status"    value={issueTarget?.retentionStatus} />
            </div>
            {issueTarget?.location && (
              <div className="mt-1" style={{ fontSize: 11, color: "#6b7280" }}>📍 {issueTarget.location}</div>
            )}
          </div>
          <div className="col-12">
            <Input type="text" name="issuedTo" lable="Issued To" value={form.issuedTo}
              onChange={handleChange} respclass="" required={true} />
          </div>
          <div className="col-12">
            <Input type="text" name="issuedBy" lable="Issued By" value={form.issuedBy}
              onChange={handleChange} respclass="" />
          </div>
          <div className="col-md-6 col-12">
            <Input type="text" name="issuedFor" lable="Purpose" value={form.issuedFor}
              onChange={handleChange} respclass="" />
          </div>
          <div className="col-md-6 col-12">
            <Input type="text" name="invoiceAgainst" lable="Invoice No" value={form.invoiceAgainst}
              onChange={handleChange} respclass="" />
          </div>
        </div>
      )}
    </Modal>
  );
};

export default IssueModal;
