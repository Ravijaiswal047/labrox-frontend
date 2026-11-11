export function parseMappedSignature(defaultSignatureID) {
  if (!defaultSignatureID || typeof defaultSignatureID !== "string") {
    return { id: "", name: "" };
  }
  const [id, name] = defaultSignatureID.split("#");
  if (!id || id === "0") return { id: "", name: "" };
  return { id: String(id), name: (name || "").trim() };
}

export function isSystemAdminApprover(doctor) {
  const label = String(doctor?.label || doctor?.name || "").trim().toLowerCase();
  return label === "admin";
}

export function pickDefaultApprovedBy(doctorAdmin = [], emptyValue = "") {
  // Production Rule (D2.1 / D2.3): Doctor selection MUST BE EMPTY by default.
  // Never auto-select the first doctor, admin, or roster doctor.
  return "";
}

export function resolveApprovalDoctor({
  defaultSignatureID,
  currentApprovedBy,
  doctorAdmin = [],
  emptyValue = "",
} = {}) {
  const list = doctorAdmin || [];
  const current =
    currentApprovedBy != null && currentApprovedBy !== "" && currentApprovedBy !== "0"
      ? String(currentApprovedBy)
      : "";

  if (current) {
    const match = list.find((d) => String(d.value) === current);
    return {
      approvedBy: current,
      approvalName: match?.label || "",
      locked: false,
      mapped: { id: "", name: "" },
    };
  }

  // Doctor selection is EMPTY by default until user explicitly selects
  return {
    approvedBy: "",
    approvalName: "",
    locked: false,
    mapped: { id: "", name: "" },
  };
}

export function withMappedDoctorOption(doctorAdmin, mapped) {
  const list = doctorAdmin || [];
  if (!mapped?.id) return list;
  const exists = list.some((d) => String(d.value) === String(mapped.id));
  if (exists) return list;
  return [
    { value: mapped.id, label: mapped.name || mapped.id, IsDefault: 0 },
    ...list,
  ];
}

export function stampApprovedBy(item, doctorAdmin, emptyValue = "") {
  const val = item?.ApprovedBy != null && String(item?.ApprovedBy).trim() !== "0"
    ? String(item?.ApprovedBy).trim()
    : "";
  return val;
}
