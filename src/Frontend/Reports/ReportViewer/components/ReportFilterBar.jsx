import React from "react";
import FilterField from "../../ReportBuilder/components/FilterField";

// Renders a live filter form from a Filter Builder row definition (the same
// shape configured on the Filters tab in Developer Mode), so the fields an
// end user fills in here always match what the report was configured with —
// including whether a filter is a single Dropdown or a Multi Select.
const ReportFilterBar = ({ reportId, filterRows, values, onChange, onSubmit, submitLabel = "🔍 View Report" }) => {
  return (
    <div className="rb-flt-preview">
      {filterRows.map((row) => {
        const width = row.width ? Math.min(Number(row.width), 260) : undefined;
        return (
          <div className="rb-fg" key={row.id} style={row.controlType === "Checkbox" || row.controlType === "Radio" ? undefined : { width }}>
            <label>
              {row.name} {row.validation === "Mandatory" && <span className="rb-req">*</span>}
            </label>
            <FilterField reportId={reportId} row={row} value={values[row.id]} onChange={onChange} style={width ? { width } : undefined} />
          </div>
        );
      })}
      <button type="button" className="rb-go" onClick={onSubmit}>{submitLabel}</button>
    </div>
  );
};

export default ReportFilterBar;
