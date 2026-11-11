import React from "react";
import Select from "react-select";

export function buildOutSourceLabOptions(rows = [], investigationId) {
  const map = new Map();
  (rows || []).forEach((row) => {
    const value = row?.OutSourceLabID ?? row?.value;
    if (value === undefined || value === null || value === "") return;
    const key = String(value);
    const labName = row?.LabName ?? row?.label ?? "";
    const inv = row?.InvestigationID ?? row?.InvestigationId;
    const mrp = Number(row?.MRP ?? 0);
    if (!map.has(key)) {
      map.set(key, { value, labName, mrp: 0 });
    }
    if (investigationId && String(inv) === String(investigationId)) {
      map.set(key, { value, labName, mrp });
    }
  });
  return Array.from(map.values()).map((opt) => ({
    value: opt.value,
    labName: opt.labName,
    mrp: opt.mrp,
    label: `${opt.labName} - ${Number(opt.mrp || 0).toFixed(2)}`,
  }));
}

const selectStyles = {
  control: (base, state) => ({
    ...base,
    minHeight: 28,
    height: 28,
    fontSize: 11,
    fontWeight: 400,
    borderColor: state.isFocused ? "#80bdff" : "#ced4da",
    boxShadow: "none",
    "&:hover": { borderColor: "#80bdff" },
  }),
  valueContainer: (base) => ({
    ...base,
    padding: "0 6px",
    height: 28,
    fontWeight: 400,
  }),
  input: (base) => ({ ...base, margin: 0, padding: 0, fontWeight: 400 }),
  indicatorsContainer: (base) => ({ ...base, height: 28 }),
  dropdownIndicator: (base) => ({ ...base, padding: 4 }),
  clearIndicator: (base) => ({ ...base, padding: 4 }),
  indicatorSeparator: () => ({ display: "none" }),
  menu: (base) => ({ ...base, fontSize: 12, fontWeight: 400, zIndex: 9999 }),
  menuPortal: (base) => ({ ...base, zIndex: 10050 }),
  option: (base) => ({
    ...base,
    fontSize: 12,
    fontWeight: 400,
    padding: "6px 8px",
  }),
  singleValue: (base) => ({ ...base, fontWeight: 400, color: "#212529" }),
  placeholder: (base) => ({ ...base, fontWeight: 400, fontSize: 11 }),
};

function OutSourceLabSelect({
  options = [],
  value,
  onChange,
  placeholder = "Select Lab",
  minWidth = "190px",
  maxWidth = "240px",
}) {
  const selected =
    options.find((opt) => String(opt.value) === String(value)) || null;

  return (
    <div style={{ minWidth, maxWidth }}>
      <Select
        options={options}
        value={selected}
        onChange={(opt) => onChange?.(opt || null)}
        placeholder={placeholder}
        isClearable
        isSearchable
        styles={selectStyles}
        menuPortalTarget={document.body}
        menuPosition="fixed"
        classNamePrefix="outsource-lab-select"
      />
    </div>
  );
}

export default OutSourceLabSelect;
