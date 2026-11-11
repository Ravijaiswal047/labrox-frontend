import moment from "moment";
import { axiosInstance, axiosReport } from "../../utils/axiosInstance";

// ── Existing APIs (already available in the backend) ──────────────────────────

export const bindDepartments = () =>
  axiosInstance.get("ModalityMaster/BindDepartment");

export const bindModalityByDept = (DepartmentId) =>
  axiosInstance.post("ModalityMaster/BindModality", { DepartmentId });

export const bindShifts = () =>
  axiosInstance.get("ModalityMaster/BindShift");

export const bindCentresForRadiology = () =>
  axiosInstance.get("ModalityMaster/BindCentre");

export const getAccessCentres = () =>
  axiosInstance.get("Centre/getAccessCentres");

export const bindPatientTypes = () =>
  axiosInstance.get("MRD/BindPatientType");

export const bindAllPanels = () =>
  axiosInstance.get("CommonAPI/GetAllPanel");

export const bindRadiologyDoctors = () =>
  axiosInstance.get("Radiology/GetRadiologyDoctor");

export const getInvestigationTimeSlot = (payload) =>
  axiosInstance.post("ModalityMaster/GetInvestigationTimeSlot", payload);

// ── New APIs (MacRadiology controller – to be implemented on backend) ─────────

export const getMacRadiologyAppointment = (payload) =>
  axiosInstance.post("MacRadiology/GetMacRadiologyAppointment", payload);

export const saveMacRadiologyAppointment = (payload) =>
  axiosInstance.post("MacRadiology/SaveMacRadiologyAppointment", payload);

export const cancelMacRadiologyAppointment = (payload) =>
  axiosInstance.post("MacRadiology/CancelMacRadiologyAppointment", payload);

export const rescheduleMacRadiologyAppointment = (payload) =>
  axiosInstance.post("MacRadiology/RescheduleMacRadiologyAppointment", payload);

export const confirmMacRadiologyAppointment = (payload) =>
  axiosInstance.post("MacRadiology/ConfirmMacRadiologyAppointment", payload);

export const linkAppointmentRegistration = (payload) =>
  axiosInstance.post("MacRadiology/LinkAppointmentRegistration", payload);

export const getBlockSlotMaster = (payload) =>
  axiosInstance.post("MacRadiology/GetBlockSlotMaster", payload);

export const saveBlockSlot = (payload) =>
  axiosInstance.post("MacRadiology/SaveBlockSlot", payload);

// Reverses SaveBlockSlot for the given slots — see
// backend-docs/backend-radiology-block-slot-enhancements.md (doesn't exist
// on the backend yet).
export const unblockSlot = (payload) =>
  axiosInstance.post("MacRadiology/UnblockSlot", payload);

export const getBlockSlotReport = (payload) =>
  axiosInstance.post("MacRadiology/GetBlockSlotReport", payload);

export const searchPatientForRadiology = (payload) =>
  axiosInstance.post("MacRadiology/SearchPatient", payload);

export const searchStateData = (stateName, countryId = 1) =>
  axiosInstance.post("CommonHC/SearchStateData", { countryId, stateName });

export const bindTitles = () =>
  axiosInstance.post("Global/getGlobalData", { Type: "Title" });

export const getCentreDepartmentMapping = (centreId) =>
  axiosInstance.get(
    `MacRadiology/GetCentreDepartmentMapping?CentreId=${centreId}`
  );

export const saveCentreDepartmentMapping = (payload) =>
  axiosInstance.post("MacRadiology/SaveCentreDepartmentMapping", payload);

// The registration billing receipt (same "/reports/v1/getReceipt" endpoint
// used across Registration/Settlement/ReceiptReprint) — only valid once the
// appointment has actually been linked to a registration/ledger entry.
const getRegistrationReceipt = async (ledgerTransactionIDHash) => {
  const res = await axiosReport.post(
    "getReceipt",
    { LedgerTransactionIDHash: ledgerTransactionIDHash, PHead: 0 },
    { responseType: "blob" }
  );
  if (res.data && res.data.size > 0) {
    const pdfUrl = window.URL.createObjectURL(res.data);
    window.open(pdfUrl, "_blank");
  }
};

// Always a single appointmentId — for a merged multi-test booking box this
// is just the first appointment in the group; the backend resolves its
// sibling tests (same registration/booking) itself and combines them into
// one PDF, so the frontend doesn't need to send every id.
//
// Registration done (isRegistered + a ledgerTransactionIDHash on the
// appointment) → print the actual billing receipt via
// "/reports/v1/getReceipt", same call every other registered-receipt print
// uses. Not registered yet (or the hash hasn't reached the frontend) → fall
// back to the appointment-slip PDF this always called before.
export const printAppointmentReceipt = async (
  appointmentId,
  { date, centreId, departmentId, isRegistered, ledgerTransactionIDHash } = {}
) => {
  if (isRegistered && ledgerTransactionIDHash) {
    return getRegistrationReceipt(ledgerTransactionIDHash);
  }

  const res = await axiosReport.post(
    "RadiologyAppointmentReport/GetPDFReport/getPDFReport",
    {
      appointmentId,
      fromDate: moment(date).format("YYYY-MM-DD"),
      toDate: moment(date).format("YYYY-MM-DD"),
      centreID: centreId ? [centreId] : [],
      dateType: "a.AppDate",
      deptID: departmentId || null,
      isCancel: false,
      isConfirm: false,
      panel: "ALL",
      reportType: "Singleline",
    },
    { responseType: "blob" }
  );
  if (res.data && res.data.size > 0) {
    const pdfUrl = window.URL.createObjectURL(res.data);
    window.open(pdfUrl, "_blank");
  }
};

// ── Department list (shared) ──────────────────────────────────────────────────
export const getDepartments = () =>
  axiosInstance.get("Department/getDepartment");

// ── Department Master ─────────────────────────────────────────────────────────
export const getMacDepartments = () =>
  axiosInstance.get("MacRadiology/GetMacDepartment");

export const saveMacDepartment = (payload) =>
  axiosInstance.post("MacRadiology/SaveMacDepartment", payload);

// ── Slot Master ───────────────────────────────────────────────────────────────
export const getSlotMaster = ({ CentreId, DepartmentId, MachineId }) =>
  axiosInstance.get("MacRadiology/GetSlotMaster", { params: { CentreId, DepartmentId, MachineId } });

export const saveSlotMaster = (payload) =>
  axiosInstance.post("MacRadiology/SaveSlotMaster", payload);

// ── Machine Master ────────────────────────────────────────────────────────────
export const getMachinesByDepartment = ({ DepartmentId, CentreId }) =>
  axiosInstance.get("MacRadiology/GetMachinesByDepartment", {
    params: { DepartmentId, CentreId },
  });

export const saveMachine = (payload) =>
  axiosInstance.post("MacRadiology/SaveMachine", payload);

export const updateMachine = (payload) =>
  axiosInstance.post("MacRadiology/UpdateMachine", payload);

// ── Machine Breakdown ─────────────────────────────────────────────────────────
export const saveMachineBreakdown = (payload) =>
  axiosInstance.post("MacRadiology/SaveMachineBreakdown", payload);

export const getMachineBreakdownHistory = ({ MachineId, CentreId, DepartmentId }) =>
  axiosInstance.get("MacRadiology/GetMachineBreakdownHistory", {
    params: { MachineId, CentreId, DepartmentId },
  });

// ── Coordinator Dashboard / Report — reuses the same endpoint
// PatientPreparation.jsx searches (Radiology/GetPatientPrepration), see
// coordinatorPrep.js for how the four status calls get merged client-side.
export const getRateTypesForCentres = (centreIds) =>
  axiosInstance.post("/Centre/GetRateType", { CentreId: centreIds });

export const getPatientPreparation = (payload) =>
  axiosInstance.post("Radiology/GetPatientPrepration", payload);

// PDF export for the Coordinator Report — same "…/GetPDFReport/getPDFReport"
// shape as printAppointmentReceipt above, so same axiosReport + blob handling.
export const getPatientPreparationReportPDF = (payload) =>
  axiosReport.post(
    "PatientPreparationReport/GetPDFReport/getPDFReport",
    payload,
    { responseType: "blob" }
  );

// ── Department/Modality MIS — see backend-docs/backend-radiology-department-modality-mis.md
// for the full contract this expects (neither endpoint exists yet).
export const getDepartmentModalityMIS = (payload) =>
  axiosInstance.post("Radiology/GetDepartmentModalityMIS", payload);

export const getDepartmentModalityMISPatients = (payload) =>
  axiosInstance.post("Radiology/GetDepartmentModalityMISPatients", payload);

// ── Test-wise Slot Duration Master — see
// backend-docs/backend-radiology-test-slot-duration.md for the full
// contract (none of these three exist on the backend yet).
export const getTestSlotDurations = () =>
  axiosInstance.get("Radiology/GetTestSlotDurationMaster");

export const getRadiologyDepartments = () =>
  axiosInstance.get("Radiology/GetRadiologyDepartments");

export const getTestSlotDurationTemplate = (payload) =>
  axiosInstance.post("Radiology/GetTestSlotDurationTemplate", payload);

export const saveTestSlotDuration = (payload) =>
  axiosInstance.post("Radiology/SaveTestSlotDuration", payload);

export const removeTestSlotDuration = (payload) =>
  axiosInstance.post("Radiology/RemoveTestSlotDuration", payload);

export const importTestSlotDurations = (payload) =>
  axiosInstance.post("Radiology/ImportTestSlotDuration", payload);

export const getDepartmentModalityMISPDF = (payload) =>
  axiosReport.post(
    "DepartmentModalityMISReport/GetPDFReport/getPDFReport",
    payload,
    { responseType: "blob" }
  );
