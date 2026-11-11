import React, { useState } from "react";
import { Dialog } from "primereact/dialog";
import { toast } from "react-toastify";
import { useLocalStorage } from "../../utils/hooks/useLocalStorage";
import ReactSelect from "../../components/formComponent/ReactSelect";
import { SaveButton } from "../../components/UI/CustomButton";
import { cancelMacRadiologyAppointment } from "./api";

const CANCEL_REASONS = [
  { value: "Patient Request", label: "Patient Request" },
  { value: "Doctor Unavailable", label: "Doctor Unavailable" },
  { value: "Machine Under Maintenance", label: "Machine Under Maintenance" },
  { value: "Emergency", label: "Emergency" },
  { value: "Others", label: "Others" },
];

const CancelModal = ({ visible, appointment, onClose, onSuccess }) => {
  const theme = useLocalStorage("theme", "get");
  const [reason, setReason] = useState("");
  const [remarks, setRemarks] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!reason) {
      toast.warn("Please select a cancel reason.");
      return;
    }
    // a merged multi-slot booking hands us every underlying appointmentId so
    // "cancel" removes the whole block, not just its first slot
    const ids = appointment?.groupAppointmentIds?.length
      ? appointment.groupAppointmentIds
      : [appointment?.AppointmentId ?? appointment?.appointmentId];

    setSaving(true);
    try {
      let successCount = 0;
      for (const id of ids) {
        const res = await cancelMacRadiologyAppointment({
          appointmentId: id,
          cancelReason:  reason,
          remarks:       remarks,
        });
        if (res?.data?.success) successCount += 1;
      }

      if (successCount === ids.length) {
        toast.success(ids.length > 1 ? `${successCount} slots cancelled successfully.` : "Appointment cancelled successfully.");
        onSuccess?.();
        handleClose();
      } else if (successCount > 0) {
        toast.warn(`${successCount} of ${ids.length} slots cancelled; some failed.`);
        onSuccess?.();
        handleClose();
      } else {
        toast.error("Failed to cancel appointment(s).");
      }
    } catch {
      toast.error("Something went wrong.");
    } finally {
      setSaving(false);
    }
  };

  const handleClose = () => {
    setReason("");
    setRemarks("");
    onClose?.();
  };

  return (
    <Dialog
      header="Cancel Appointment"
      visible={visible}
      onHide={handleClose}
      className={theme}
      draggable={false}
      style={{ width: "420px" }}
    >
      <div className="row">
        {appointment && (
          <div className="col-12 mb-3">
            <div
              className="p-2 rounded"
              style={{
                background: "linear-gradient(135deg, #fff5f5 0%, #ffe0e0 100%)",
                border: "1px solid #fca5a5",
              }}
            >
              <p className="mb-1" style={{ fontSize: "13px", color: "#374151" }}>
                <strong>Patient:</strong> {appointment.PatientName}
              </p>
              <p className="mb-1" style={{ fontSize: "13px", color: "#374151" }}>
                <strong>Test:</strong> {appointment.TestName}
              </p>
              <p className="mb-0" style={{ fontSize: "13px", color: "#374151" }}>
                <strong>Time:</strong> {appointment.TimeSlot}
              </p>
            </div>
          </div>
        )}

        <div className="col-12 mb-3">
          <ReactSelect
            id="CancelReason"
            name="CancelReason"
            placeholderName="Cancel Reason *"
            dynamicOptions={CANCEL_REASONS}
            value={reason}
            removeIsClearable
            onChange={(name, option) => setReason(option?.value || "")}
          />
        </div>

        <div className="col-12 mb-3">
          <label className="form-label fw-semibold" style={{ fontSize: "13px" }}>
            Remarks
          </label>
          <textarea
            className="form-control custominputbox"
            rows={3}
            placeholder="Additional remarks (optional)"
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
            style={{ fontSize: "13px", resize: "none" }}
          />
        </div>

        <div className="col-12 d-flex justify-content-end gap-2">
          <button
            className="btn btn-sm btn-outline-secondary"
            onClick={handleClose}
            disabled={saving}
          >
            Close
          </button>
          <SaveButton
            onClick={handleSave}
            disabled={saving}
            label={saving ? "Saving..." : "Save"}
          />
        </div>
      </div>
    </Dialog>
  );
};

export default CancelModal;
