import moment from "moment";
import { getPatientPreparation } from "./api";

// ── Shared between CoordinatorDashboard.jsx and CoordinatorReport.jsx ────────
//
// Radiology/GetPatientPrepration (same endpoint PatientPreparation.jsx uses)
// filters server-side to exactly ONE statusID per call — there's no "give me
// every status" option. To build a coordinator-level view across the whole
// Registered → Prepared → In → Out flow, we fire one call per stage and
// merge the results client-side, the same "compute from existing endpoints"
// approach SlotBifurcation.jsx already uses for its own numbers. See
// backend-docs/backend-radiology-coordinator-dashboard.md for what a single
// aggregation endpoint would additionally unlock.

export const SAMPLE_STATUS = {
  REGISTERED: "1",
  PREPARED: "21",
  PATIENT_IN: "22",
  PATIENT_OUT: "23",
};

// Ordinal sequential ramp (dataviz skill, references/palette.md) — one hue,
// light→dark, steps 250→400 (the pre-validated ordinal-safe range: the step
// nearest the surface must clear 2:1, and 250 is the lightest step that
// still does on a light card). Reads as "further along the flow", not four
// unrelated categories.
export const STAGE_OPTIONS = [
  { label: "Registered", value: SAMPLE_STATUS.REGISTERED, color: "#86b6ef" },
  { label: "Patient Prepared", value: SAMPLE_STATUS.PREPARED, color: "#6da7ec" },
  { label: "Patient In", value: SAMPLE_STATUS.PATIENT_IN, color: "#5598e7" },
  { label: "Patient Out", value: SAMPLE_STATUS.PATIENT_OUT, color: "#3987e5" },
];

export const getStageLabel = (statusId) =>
  STAGE_OPTIONS.find((s) => s.value === String(statusId))?.label || "-";

// Fixed status palette (dataviz skill — never themed, never reused for
// series identity). Passed/Failed/Pending are a genuine state, not a
// category, so this is the correct slot for them.
export const OUTCOME = {
  PASSED: "passed",
  FAILED: "failed",
  PENDING: "pending",
};

export const OUTCOME_META = {
  passed: { label: "Passed", color: "#0ca30c" },
  failed: { label: "Failed", color: "#d03b3b" },
  pending: { label: "Pending", color: "#fab219" },
};

// RegDate's exact wire format hasn't been confirmed against a live response
// (PatientPreparation.jsx only ever displays it as-is, never parses it) — this
// tries the formats already seen elsewhere in this API family and falls back
// to a lenient parse. See the backend-docs note for what to verify.
const parseRegDate = (value) => {
  if (!value) return null;
  const d = moment(
    value,
    ["DD-MMM-YYYY hh:mm A", "DD/MMM/YYYY hh:mm A", "DD-MM-YYYY HH:mm:ss", "YYYY-MM-DD HH:mm:ss", moment.ISO_8601],
    true
  );
  if (d.isValid()) return d;
  const loose = moment(value);
  return loose.isValid() ? loose : null;
};

// Passed  = reached Patient Out — the visit completed, regardless of when.
// Failed  = RegDate is already in the past (full timestamp, not just
//           calendar day — so a 9 AM slot that's still not Out by 2 PM
//           today reads as Failed right now, not tomorrow) and it never
//           reached Patient Out — a definitive miss (no-show or
//           started-but-not-out).
// Pending = RegDate hasn't happened yet (later today, or a future date) —
//           not a miss, just not due yet.
export const classifyOutcome = (row, now = moment()) => {
  const status = String(row.Status ?? row.status ?? "");
  if (status === SAMPLE_STATUS.PATIENT_OUT) return OUTCOME.PASSED;

  const rowDate = parseRegDate(row.RegDate ?? row.regDate);
  const isPast = rowDate ? rowDate.isBefore(now) : false;
  return isPast ? OUTCOME.FAILED : OUTCOME.PENDING;
};

// Sub-reason for a Failed row — only meaningful when classifyOutcome() has
// already returned "failed".
export const classifyFailReason = (row) => {
  const status = String(row.Status ?? row.status ?? "");
  return status === SAMPLE_STATUS.REGISTERED ? "No-Show" : "Incomplete";
};

// Shared with the PDF export — same filter shape Radiology/GetPatientPrepration
// (and, per the backend, PatientPreparationReport/GetPDFReport) both expect.
// statusID is deliberately left out here: callers add their own (one of the
// 4 stage values below, or 0 for "no single status picked — send everything").
export const buildPrepFilterPayload = (filters) => ({
  businessUnitIds: filters.CentreId ? [String(filters.CentreId)] : [],
  rateTypeIDs: filters.RateTypeID ? [String(filters.RateTypeID)] : [],
  fromDate: moment(filters.FromDate).format("YYYY-MM-DD"),
  toDate: moment(filters.ToDate).format("YYYY-MM-DD"),
  selectTypes: "",
  itemValue: "",
});

// Fires the 4 per-stage calls in parallel and merges into one flat list,
// each row tagged with its outcome. A failed individual stage call doesn't
// blank the whole dashboard — it just contributes 0 rows for that stage.
export const fetchCoordinatorPrepData = async (filters) => {
  const base = buildPrepFilterPayload(filters);

  const results = await Promise.allSettled(
    STAGE_OPTIONS.map((stage) =>
      getPatientPreparation({ ...base, statusID: Number(stage.value) })
    )
  );

  const now = moment();
  const rows = [];
  results.forEach((r) => {
    if (r.status === "fulfilled" && r.value?.data?.success) {
      const msg = r.value.data.message;
      const list = Array.isArray(msg) ? msg : Array.isArray(msg?.data) ? msg.data : [];
      list.forEach((row) => {
        rows.push({ ...row, Outcome: classifyOutcome(row, now) });
      });
    }
  });
  return rows;
};
