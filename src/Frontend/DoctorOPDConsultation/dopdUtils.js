export const DOPD_WEEK_DAYS = [
  { value: 0, label: "Sunday" },
  { value: 1, label: "Monday" },
  { value: 2, label: "Tuesday" },
  { value: 3, label: "Wednesday" },
  { value: 4, label: "Thursday" },
  { value: 5, label: "Friday" },
  { value: 6, label: "Saturday" },
];

export const emptyScheduleRow = (weekDay) => ({
  ScheduleID: 0,
  WeekDay: weekDay,
  StartTime: "09:00",
  EndTime: "17:00",
  DurationMinutes: 15,
  RoomNo: "",
  MaxPatients: 40,
  InvestigationID: 0,
  InvestigationName: "",
  IsActive: 0,
});

export const paymentClass = (status) => {
  if (status === "Full Paid") return "dopd-badge dopd-badge-paid";
  if (status === "Partial Paid") return "dopd-badge dopd-badge-partial";
  return "dopd-badge dopd-badge-unpaid";
};

export const queueStatus = (row) => {
  if (row?.AppStatus === "Cancelled") return "Cancelled";
  if (row?.ConsultStatus === "Done") return "Completed";
  if (row?.IsAbsent == 1) return "Absent";
  if (row?.IsCurrent == 1) return "Current";
  if (row?.AppStatus === "Confirmed" || row?.AppStatus === "Booked" || row?.AppStatus === "Rescheduled") return "Waiting";
  return row?.AppStatus || "Waiting";
};

export const statusBadgeClass = (status) => {
  const key = String(status || "").toLowerCase();
  if (key === "current") return "dopd-badge dopd-badge-current";
  if (key === "waiting" || key === "booked" || key === "confirmed") return "dopd-badge dopd-badge-waiting";
  if (key === "absent") return "dopd-badge dopd-badge-absent";
  if (key === "completed" || key === "done") return "dopd-badge dopd-badge-done";
  if (key === "cancelled") return "dopd-badge dopd-badge-cancel";
  if (key === "rescheduled") return "dopd-badge dopd-badge-reschedule";
  return "dopd-badge";
};

export const apiError = (err, fallback = "Unable to complete the request. Please try again.") =>
  err?.response?.data?.message || err?.response?.data?.title || fallback;

export const formatApiDate = (value) => {
  if (!value) return "";
  const d = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};
