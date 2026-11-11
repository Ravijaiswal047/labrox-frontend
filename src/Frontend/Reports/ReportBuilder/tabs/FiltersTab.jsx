import React, { useState } from "react";
import ReactSelect from "../../../../components/formComponent/ReactSelect";
import TextAreaInput from "../../../../components/formComponent/TextAreaInput";
import Input from "../../../../components/formComponent/Input";
import RadioInput from "../../../../components/formComponent/RadioInput";
import FilterField from "../components/FilterField";
import {
  controlTypeOptions,
  validationOptions,
  defaultSelectionOptions,
  dropdownSourceTypeOptions,
} from "../reportBuilderData";

// What the single "source value" box means/looks like changes per source type —
// SQL/SP need a multi-line box to write a query/name in, Static Values and API
// are one-liners (a comma list, or an endpoint path).
const sourceValueConfig = {
  "SQL Query": { label: "SQL", placeholder: "SELECT CentreID, CentreName FROM Centre_Master", multiline: true },
  "Stored Procedure": { label: "Stored Procedure Name", placeholder: "sp_GetCentreList", multiline: true },
  "Static Values": { label: "Values (comma-separated)", placeholder: "Noida HO,Sec-18,Ghaziabad", multiline: false },
  API: { label: "API Endpoint", placeholder: "e.g. CentreMaster/GetAllCentres (an existing endpoint in this app)", multiline: false },
};

const FiltersTab = ({
  reportId,
  filterRows,
  onAddFilter,
  onRemoveFilter,
  onUpdateFilter,
  selectedFilterId,
  onSelectFilterRow,
  onViewReport,
}) => {
  // Purely local — this preview only checks "does the filter render the way I
  // configured it" (e.g. Multi Select really shows a multi-select), it doesn't
  // need to be shared with the rest of the builder.
  const [previewValues, setPreviewValues] = useState({});
  const setPreviewValue = (id, value) => setPreviewValues((prev) => ({ ...prev, [id]: value }));

  const selectedFilter = filterRows.find((f) => f.id === selectedFilterId) || filterRows[0];
  const sourceValue = sourceValueConfig[selectedFilter?.dropdownSourceType] || sourceValueConfig["SQL Query"];

  return (
    <>
      <div className="rb-panel">
        <div className="rb-panel-hd">
          <span className="rb-dot" />Filter Builder
          <span className="rb-hd-act">
            <button type="button" className="rb-mini-btn" onClick={onAddFilter}>＋ Add Filter</button>
          </span>
        </div>
        <div className="rb-panel-body" style={{ padding: 0 }}>
          <div className="rb-grid-wrap">
            <table className="rb-grid">
              <thead>
                <tr>
                  <th style={{ width: 26 }}></th>
                  <th>Seq</th>
                  <th>Filter Name</th>
                  <th>Control Type</th>
                  <th>Dropdown Source</th>
                  <th>Default Selection</th>
                  <th>Validation</th>
                  <th>Width</th>
                  <th style={{ width: 36 }}></th>
                </tr>
              </thead>
              <tbody>
                {filterRows.map((row) => (
                  <tr
                    key={row.id}
                    onClick={() => onSelectFilterRow(row.id)}
                    style={{ cursor: "pointer", outline: selectedFilterId === row.id ? "2px solid var(--rb-orange)" : "none", outlineOffset: -2 }}
                  >
                    <td className="ctr rb-drag">⠿</td>
                    <td>
                      <input
                        type="number"
                        style={{ width: 40 }}
                        value={row.seq}
                        onChange={(e) => onUpdateFilter(row.id, "seq", e.target.value)}
                        onClick={(e) => e.stopPropagation()}
                      />
                    </td>
                    <td>
                      <input
                        type="text"
                        value={row.name}
                        onChange={(e) => onUpdateFilter(row.id, "name", e.target.value)}
                        onClick={(e) => e.stopPropagation()}
                      />
                    </td>
                    <td onClick={(e) => e.stopPropagation()}>
                      <ReactSelect
                        id={`rbControlType-${row.id}`}
                        name="controlType"
                        placeholderName="Select"
                        dynamicOptions={controlTypeOptions}
                        value={row.controlType}
                        onChange={(name, opt) => onUpdateFilter(row.id, name, opt?.value ?? "")}
                        removeIsClearable
                      />
                    </td>
                    <td>
                      <span className={`rb-pill ${row.dropdownSourceType ? "sp" : "txt"}`}>
                        {row.dropdownSourceType ? `${row.dropdownSourceType} ▸ ${row.dropdownSourceValue}` : "N/A"}
                      </span>
                    </td>
                    <td onClick={(e) => e.stopPropagation()}>
                      <ReactSelect
                        id={`rbDefaultSelection-${row.id}`}
                        name="defaultSelection"
                        placeholderName="Select"
                        dynamicOptions={defaultSelectionOptions}
                        value={row.defaultSelection}
                        onChange={(name, opt) => onUpdateFilter(row.id, name, opt?.value ?? "")}
                        removeIsClearable
                      />
                    </td>
                    <td onClick={(e) => e.stopPropagation()}>
                      <ReactSelect
                        id={`rbValidation-${row.id}`}
                        name="validation"
                        placeholderName="Select"
                        dynamicOptions={validationOptions}
                        value={row.validation}
                        onChange={(name, opt) => onUpdateFilter(row.id, name, opt?.value ?? "")}
                        removeIsClearable
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        style={{ width: 60 }}
                        value={row.width}
                        onChange={(e) => onUpdateFilter(row.id, "width", e.target.value)}
                        onClick={(e) => e.stopPropagation()}
                      />
                    </td>
                    <td className="ctr">
                      <button
                        type="button"
                        className="rb-row-del"
                        onClick={(e) => {
                          e.stopPropagation();
                          onRemoveFilter(row.id);
                        }}
                      >
                        ✕
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {selectedFilter && (
        <div className="rb-panel">
          <div className="rb-panel-hd">
            <span className="rb-dot" />Dropdown Source — {selectedFilter.name}
          </div>
          <div className="rb-panel-body">
            <div className="rb-src-row">
              {dropdownSourceTypeOptions.map((opt) => (
                <RadioInput
                  key={opt}
                  id={`rbDds-${opt}`}
                  name="dds"
                  label={opt}
                  checked={selectedFilter.dropdownSourceType === opt}
                  onChange={() => onUpdateFilter(selectedFilter.id, "dropdownSourceType", opt)}
                />
              ))}
            </div>
            <div className="rb-frm">
              <div className="rb-fg c2">
                <label>{sourceValue.label}</label>
                {sourceValue.multiline ? (
                  <TextAreaInput
                    id="rbDdsSql"
                    name="dropdownSourceValue"
                    className="font-monospace"
                    rows={3}
                    placeholder={sourceValue.placeholder}
                    value={selectedFilter.dropdownSourceValue}
                    onChange={(e) => onUpdateFilter(selectedFilter.id, "dropdownSourceValue", e.target.value)}
                    removeFormGroupClass
                  />
                ) : (
                  <Input
                    id="rbDdsSql"
                    name="dropdownSourceValue"
                    type="text"
                    className="font-monospace"
                    placeholder={sourceValue.placeholder}
                    value={selectedFilter.dropdownSourceValue}
                    onChange={(e) => onUpdateFilter(selectedFilter.id, "dropdownSourceValue", e.target.value)}
                    removeFormGroupClass
                  />
                )}
                {selectedFilter.dropdownSourceType === "API" && (
                  <span className="rb-hint">
                    A relative path to an existing API in this app (called server-side when the filter's options are fetched — the frontend never calls it directly).
                  </span>
                )}
              </div>
              {selectedFilter.dropdownSourceType && selectedFilter.dropdownSourceType !== "Static Values" && (
                <>
                  <div className="rb-fg">
                    <label>Value Field</label>
                    <Input
                      id="rbDdsValueField"
                      name="valueField"
                      type="text"
                      placeholder="e.g. CentreID"
                      value={selectedFilter.valueField}
                      onChange={(e) => onUpdateFilter(selectedFilter.id, "valueField", e.target.value)}
                      removeFormGroupClass
                    />
                  </div>
                  <div className="rb-fg">
                    <label>Display Field</label>
                    <Input
                      id="rbDdsDisplayField"
                      name="displayField"
                      type="text"
                      placeholder="e.g. CentreName"
                      value={selectedFilter.displayField}
                      onChange={(e) => onUpdateFilter(selectedFilter.id, "displayField", e.target.value)}
                      removeFormGroupClass
                    />
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="rb-panel">
        <div className="rb-panel-hd">
          <span className="rb-dot" />Live Filter Preview — user ko aisa dikhega
        </div>
        <div className="rb-panel-body">
          {filterRows.length === 0 ? (
            <div className="rb-hint">Add a filter above to preview how it will look to end users.</div>
          ) : (
            <div className="rb-flt-preview">
              {filterRows.map((row) => {
                const width = row.width ? Math.min(Number(row.width), 260) : undefined;
                const unsaved = typeof row.id === "string" && row.id.startsWith("f-new-");
                return (
                  <div className="rb-fg" key={row.id} style={width ? { width } : undefined}>
                    <label>
                      {row.name} {row.validation === "Mandatory" && <span className="rb-req">*</span>}
                    </label>
                    <FilterField reportId={reportId} row={row} value={previewValues[row.id]} onChange={setPreviewValue} style={width ? { width } : undefined} />
                    {unsaved && ["Dropdown", "Multi Select", "Auto Complete"].includes(row.controlType) && (
                      <span className="rb-hint">Save the report to preview live dropdown options.</span>
                    )}
                  </div>
                );
              })}
              <button type="button" className="rb-go" onClick={onViewReport}>🔍 View Report</button>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default FiltersTab;
