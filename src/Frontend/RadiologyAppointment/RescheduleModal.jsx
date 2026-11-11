import React, { useEffect, useState } from "react";
import { Dialog } from "primereact/dialog";
import { toast } from "react-toastify";
import moment from "moment";
import { useLocalStorage } from "../../utils/hooks/useLocalStorage";
import DatePicker from "../../components/formComponent/DatePicker";
import ReactSelect from "../../components/formComponent/ReactSelect";
import Input from "../../components/formComponent/Input";
import { rescheduleMacRadiologyAppointment, getMacRadiologyAppointment } from "./api";

const REMARKS_OPTIONS = [
  { value: "Patient Request",           label: "Patient Request"           },
  { value: "Doctor Unavailable",        label: "Doctor Unavailable"        },
  { value: "Machine Under Maintenance", label: "Machine Under Maintenance" },
  { value: "Emergency",                 label: "Emergency"                 },
  { value: "Others",                    label: "Others"                    },
];

const RescheduleModal = ({ visible, appointment, onClose, onSuccess }) => {
  const theme = useLocalStorage("theme", "get");

  const [timeSlots,    setTimeSlots]    = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [saving,       setSaving]       = useState(false);

  const [form, setForm] = useState({
    Date:    new Date(),
    TimeSlot: "",
    Remark:  "",
    Remarks: "",
  });

  useEffect(() => {
    if (visible && appointment) {
      setForm({ Date: new Date(), TimeSlot: "", Remark: "", Remarks: "" });
      loadTimeSlots(new Date());
    }
  }, [visible, appointment]);

  const loadTimeSlots = async (date) => {
    if (!appointment) return;
    setLoadingSlots(true);
    setTimeSlots([]);
    try {
      const res  = await getMacRadiologyAppointment({
        date:     moment(date).format("DD/MMM/YYYY"),
        centreId: appointment.CentreId,
      });
      const data = res?.data?.message;
      let slots  = [];

      if (data && !Array.isArray(data) && data.timeSlots) {
        const machineId = appointment.MachineId ?? appointment.machineId;
        const booked    = new Set(
          Object.entries(data.appointments || {})
            .filter(([key, appts]) => key.startsWith(`${machineId}_`) && appts.length > 0)
            .map(([key]) => key.split("_").pop())   // time slot is always the last segment
        );
        slots = data.timeSlots
          .filter((s) => !booked.has(s))
          .map((s) => ({ value: s, label: s }));
      }

      setTimeSlots(slots);
    } catch {
      setTimeSlots([]);
    } finally {
      setLoadingSlots(false);
    }
  };

  const handleDateChange = (date) => {
    setForm((p) => ({ ...p, Date: date, TimeSlot: "" }));
    loadTimeSlots(date);
  };

  const handleSelect = (name, option) =>
    setForm((p) => ({ ...p, [name]: option?.value || "" }));

  const handleSave = async () => {
    if (!form.Date)     { toast.warn("Please select a date.");      return; }
    if (moment(form.Date).startOf("day").isBefore(moment().startOf("day"))) {
      toast.error("Cannot reschedule to a past date."); return;
    }
    if (!form.TimeSlot) { toast.warn("Please select a time slot."); return; }
    if (!form.Remark)   { toast.warn("Please select a remark.");    return; }
    setSaving(true);
    try {
      const res = await rescheduleMacRadiologyAppointment({
        appointmentId: appointment?.AppointmentId ?? appointment?.appointmentId,
        newDate:       moment(form.Date).format("DD/MMM/YYYY"),
        newTimeSlot:   form.TimeSlot,
        machineId:     appointment?.MachineId ?? appointment?.machineId,
        reason:        form.Remark,
        remarks:       form.Remarks,
      });
      if (res?.data?.success) {
        toast.success("Appointment rescheduled successfully.");
        onSuccess?.();
        handleClose();
      } else {
        toast.error(res?.data?.message || "Failed to reschedule.");
      }
    } catch {
      toast.error("Something went wrong.");
    } finally {
      setSaving(false);
    }
  };

  const handleClose = () => {
    setForm({ Date: new Date(), TimeSlot: "", Remark: "", Remarks: "" });
    setTimeSlots([]);
    onClose?.();
  };

  const dept      = appointment?.DepartmentName ?? appointment?.departmentName ?? "";
  const currSlot  = appointment?.TimeSlot       ?? appointment?.timeSlot       ?? "";

  return (
    <Dialog
      header="Reschedule"
      visible={visible}
      onHide={handleClose}
      className={theme}
      draggable={false}
      style={{ width: "420px", maxWidth: "95vw" }}
    >
      <div style={{ fontSize: "13px" }}>

        {/* ── Current info row ──────────────────────────────────────── */}
        <div
          className="mb-3 p-2 rounded"
          style={{ background: "#e0f2fe", border: "1px solid #7dd3fc", color: "#0c4a6e" }}
        >
          <strong>Current Department:</strong> {dept}&nbsp;&nbsp;
          <strong>Current TimeSlot:</strong> {currSlot}
        </div>

        {/* ── Date + Time ───────────────────────────────────────────── */}
        <div className="row g-2 mb-2">
          <div className="col-6">
            <DatePicker
              name="Date"
              id="ReschedDate"
              lable="Select Date"
              value={form.Date}
              minDate={new Date()}
              onChange={handleDateChange}
            />
          </div>
          <div className="col-6">
            <ReactSelect
              id="ReschedTime"
              name="TimeSlot"
              placeholderName={loadingSlots ? "Loading..." : "Select Time"}
              dynamicOptions={timeSlots}
              value={form.TimeSlot}
              removeIsClearable
              isDisabled={loadingSlots}
              onChange={handleSelect}
            />
          </div>
        </div>

        {/* ── Select Remark ─────────────────────────────────────────── */}
        <div className="mb-2">
          <ReactSelect
            id="ReschedRemark"
            name="Remark"
            placeholderName="Select Remark"
            dynamicOptions={REMARKS_OPTIONS}
            value={form.Remark}
            removeIsClearable
            onChange={handleSelect}
          />
        </div>

        {/* ── Remarks text ──────────────────────────────────────────── */}
        <div className="mb-3">
          <Input
            type="text"
            name="Remarks"
            id="ReschedRemarks"
            lable="Remarks"
            value={form.Remarks}
            onChange={(e) => setForm((p) => ({ ...p, Remarks: e.target.value }))}
          />
        </div>

        {/* ── Action buttons ────────────────────────────────────────── */}
        <div className="d-flex gap-2 justify-content-center">
          <button
            onClick={handleSave}
            disabled={saving}
            style={{
              padding: "5px 22px", fontSize: "13px", fontWeight: 600,
              background: saving ? "#6b7280" : "#16a34a",
              color: "#fff", border: "none", borderRadius: "5px", cursor: saving ? "not-allowed" : "pointer",
            }}
          >
            {saving ? "Saving..." : "Reschedule"}
          </button>
          <button
            onClick={handleClose}
            disabled={saving}
            style={{
              padding: "5px 22px", fontSize: "13px", fontWeight: 600,
              background: "#dc2626", color: "#fff",
              border: "none", borderRadius: "5px", cursor: "pointer",
            }}
          >
            Close
          </button>
        </div>
      </div>
    </Dialog>
  );
};

export default RescheduleModal;
