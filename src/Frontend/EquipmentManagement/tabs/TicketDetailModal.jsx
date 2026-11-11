import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import Modal from "@app/components/formComponent/Modal";
import Input from "@app/components/formComponent/Input";
import TextAreaInput from "@app/components/formComponent/TextAreaInput";
import { CustomButton, CancelButton } from "@app/components/UI/CustomButton";
import { formatCurrency, findEquipment } from "../equipmentConstants";
import {
  TICKET_FLOW,
  VERIFIED_PASS,
  downtimeLabel,
} from "../maintenanceConstants";

const Field = ({ label, children }) => (
  <div className="em-detail-field">
    <div className="em-detail-label">{label}</div>
    <div className="em-detail-value">{children || "—"}</div>
  </div>
);

const TicketDetailModal = ({
  visible,
  setVisible,
  ticket,
  onAdvance,
  onVerify,
  onUpdate,
  isSaving = false,
}) => {
  const { t } = useTranslation();

  const [formData, setFormData] = useState({
    Engineer: "",
    Parts: "",
    Cost: "",
    Impact: "",
    Remarks: "",
  });

  useEffect(() => {
    if (ticket) {
      setFormData({
        Engineer: ticket.Engineer || "",
        Parts: ticket.Parts || "",
        Cost:
          ticket.Cost !== null && ticket.Cost !== undefined
            ? String(ticket.Cost)
            : "",
        Impact: ticket.Impact || "",
        Remarks: ticket.Remarks || "",
      });
    }
  }, [ticket]);

  if (!ticket) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const equipment = findEquipment(ticket.EquipmentCode);
  const eqName = ticket.EquipmentName || equipment.Name || ticket.EquipmentCode;
  const stageIndex = TICKET_FLOW.indexOf(ticket.Status);
  const nextStage = TICKET_FLOW[stageIndex + 1];
  const verified = ticket.Verified === VERIFIED_PASS;
  const canVerify = ["Resolved", "Closed"].includes(ticket.Status) && !verified;
  const isClosed = ticket.Status === "Closed";

  return (
    <Modal
      visible={visible}
      setVisible={setVisible}
      Header={`${ticket.TicketNo} — ${eqName}`}
      modalWidth="840px"
      buttons={
        <>
          {canVerify && (
            <CustomButton
              text={t("Verify return-to-service (QC)")}
              icon="check"
              variant="secondary"
              disabled={isSaving}
              onClick={() => onVerify(ticket)}
            />
          )}
          {!isClosed && onUpdate && (
            <CustomButton
              text={t("Save Details")}
              icon="save"
              variant="success"
              disabled={isSaving}
              onClick={() => onUpdate(ticket.TicketID, formData)}
            />
          )}
          {nextStage ? (
            <CustomButton
              text={`${t("Move to")} ${t(nextStage)}`}
              icon="forword"
              variant="primary"
              disabled={isSaving}
              onClick={() => onAdvance(ticket, formData)}
            />
          ) : (
            <span className="em-badge em-badge-active">{t("Ticket closed")}</span>
          )}
          <CancelButton text={t("Close")} onClick={() => setVisible(false)} />
        </>
      }
    >
      {/* Pipeline — stages up to the current one read as done */}
      <div className="em-pipe">
        {TICKET_FLOW.map((stage, index) => (
          <span key={stage} className={index <= stageIndex ? "on" : ""}>
            {t(stage)}
          </span>
        ))}
      </div>

      <div className="em-detail-grid mb-2">
        <Field label={t("Reported By")}>{ticket.ReportedBy}</Field>
        <Field label={t("Priority")}>{ticket.Priority}</Field>
        <Field label={t("Reported At")}>{ticket.ReportedAt}</Field>
        <Field label={t("Resolved At")}>{ticket.ResolvedAt}</Field>
        <Field label={t("Downtime")}>{downtimeLabel(ticket)}</Field>
        <Field label={t("Adverse Incident (ISO 6.4.6)")}>
          {ticket.Adverse ? (
            <span className="em-cal-overdue">{t("Yes — reportable")}</span>
          ) : (
            t("No")
          )}
        </Field>
        <Field label={t("Return-to-Service Verification")}>
          {verified ? (
            <span className="em-cal-done">{ticket.Verified}</span>
          ) : (
            <span className="em-cal-due">{t("Pending")}</span>
          )}
        </Field>
      </div>

      <div className="em-detail-block mb-3">
        <div className="em-detail-label">{t("Issue")}</div>
        <div className="em-detail-value">{ticket.Description}</div>
      </div>

      <div className="row">
        <Input
          type="text"
          name="Engineer"
          id="detailEngineer"
          lable="Assigned Engineer"
          value={formData.Engineer}
          onChange={handleChange}
          disabled={isClosed}
          respclass="col-md-6 col-12"
          // placeholder="e.g. Rajeev Malhotra, Abbott FSE..."
        />
        <Input
          type="number"
          name="Cost"
          id="detailCost"
          lable="Repair Cost (₹)"
          value={formData.Cost}
          onChange={handleChange}
          disabled={isClosed}
          respclass="col-md-6 col-12"
          placeholder="0"
        />
      </div>

      <div className="row">
        <Input
          type="text"
          name="Parts"
          id="detailParts"
          lable="Spare Parts Used"
          value={formData.Parts}
          onChange={handleChange}
          disabled={isClosed}
          respclass="col-md-6 col-12"
          // placeholder="e.g. Flow cell, Tubing..."
        />
        <Input
          type="text"
          name="Impact"
          id="detailImpact"
          lable="Impact on Previous Results (6.4.5)"
          value={formData.Impact}
          onChange={handleChange}
          disabled={isClosed}
          respclass="col-md-6 col-12"
          // placeholder="e.g. Previous 2h results reviewed — no impact"
        />
      </div>

      <div className="row">
        <TextAreaInput
          name="Remarks"
          id="detailRemarks"
          lable="Engineer Remarks"
          value={formData.Remarks}
          onChange={handleChange}
          disabled={isClosed}
          rows={2}
          respclass="col-12"
          placeholder="Add technician or engineer remarks..."
        />
      </div>
    </Modal>
  );
};

export default TicketDetailModal;
