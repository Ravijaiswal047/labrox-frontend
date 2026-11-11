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

export function pickDefaultApprovedBy(doctorAdmin = [], emptyValue = "0") {
  const real = (doctorAdmin || []).filter(
    (d) => !isSystemAdminApprover(d) && String(d?.value) !== "0" && String(d?.value) !== ""
  );
  if (real.length === 0) {
    const anyDoc = (doctorAdmin || []).filter(
      (d) => String(d?.value) !== "0" && String(d?.value) !== ""
    );
    return anyDoc.length ? String(anyDoc[0].value) : emptyValue;
  }
  const def = real.find((d) => Number(d.IsDefault) === 1);
  if (def) return String(def.value);
  return String(real[0].value);
}

export function resolveApprovalDoctor({
  defaultSignatureID,
  currentApprovedBy,
  doctorAdmin = [],
  emptyValue = "0",
} = {}) {
  const list = doctorAdmin || [];
  const mapped = parseMappedSignature(defaultSignatureID);
  if (mapped.id && !isSystemAdminApprover({ label: mapped.name, value: mapped.id })) {
    return {
      approvedBy: mapped.id,
      approvalName: mapped.name,
      locked: true,
      mapped,
    };
  }

  const current =
    currentApprovedBy != null && currentApprovedBy !== ""
      ? String(currentApprovedBy)
      : "";
  if (current && current !== "0") {
    const match = list.find((d) => String(d.value) === current);
    if (!isSystemAdminApprover(match || { label: "", value: current })) {
      return {
        approvedBy: current,
        approvalName: match?.label || "",
        locked: false,
        mapped: { id: "", name: "" },
      };
    }
  }

  const picked = pickDefaultApprovedBy(list, emptyValue);
  if (picked && picked !== emptyValue) {
    const match = list.find((d) => String(d.value) === String(picked));
    return {
      approvedBy: String(picked),
      approvalName: match?.label || "",
      locked: false,
      mapped: { id: "", name: "" },
    };
  }

  return {
    approvedBy: emptyValue,
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

export function stampApprovedBy(item, doctorAdmin, emptyValue = "0") {
  return resolveApprovalDoctor({
    defaultSignatureID: item?.DefaultSignatureID,
    currentApprovedBy: item?.ApprovedBy,
    doctorAdmin,
    emptyValue,
  }).approvedBy;
}
