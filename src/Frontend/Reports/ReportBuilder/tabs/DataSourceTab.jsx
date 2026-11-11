import React from "react";
import Input from "../../../../components/formComponent/Input";
import ReactSelect from "../../../../components/formComponent/ReactSelect";
import RadioInput from "../../../../components/formComponent/RadioInput";
import { CustomButton } from "../../../../components/UI/CustomButton";
import {
  dataSourceTypeOptions,
  connectionOptions,
  bindFilterOptions,
  paramDataTypeOptions,
} from "../reportBuilderData";

const DataSourceTab = ({
  dataSource,
  setDataSourceField,
  paramRows,
  onAddParam,
  onRemoveParam,
  onUpdateParam,
  onFetchParams,
  fetchingParams,
}) => {
  return (
    <>
      <div className="rb-panel">
        <div className="rb-panel-hd">
          <span className="rb-dot" />Data Source Type
        </div>
        <div className="rb-panel-body">
          <div className="rb-src-row">
            {dataSourceTypeOptions.map((opt) => (
              <RadioInput
                key={opt}
                id={`rbSrcType-${opt}`}
                name="srcType"
                label={opt}
                checked={dataSource.type === opt}
                onChange={() => setDataSourceField("type", opt)}
              />
            ))}
          </div>
          <div className="rb-frm">
            <div className="rb-fg c2">
              <label>Source Name <span className="rb-req">*</span></label>
              <Input
                id="rbSourceName"
                name="sourceName"
                type="text"
                className="font-monospace"
                value={dataSource.sourceName}
                onChange={(e) => setDataSourceField("sourceName", e.target.value)}
                removeFormGroupClass
              />
            </div>
            <div className="rb-fg">
              <label>Connection</label>
              <ReactSelect
                id="rbConnection"
                name="connection"
                placeholderName="Select"
                dynamicOptions={connectionOptions}
                value={dataSource.connection}
                onChange={(name, opt) => setDataSourceField(name, opt?.value ?? "")}
                searchable
              />
            </div>
            <div className="rb-fg">
              <label>&nbsp;</label>
              <CustomButton
                text="Fetch Parameters & Columns"
                icon="refresh"
                variant="secondary"
                className="rb-navy"
                onClick={onFetchParams}
                loading={fetchingParams}
                disabled={fetchingParams}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="rb-panel">
        <div className="rb-panel-hd">
          <span className="rb-dot" />Parameter Mapping — {dataSource.sourceName}
          <span className="rb-hd-act">
            <button type="button" className="rb-mini-btn" onClick={onAddParam}>＋ Add Parameter</button>
          </span>
        </div>
        <div className="rb-panel-body" style={{ padding: 0 }}>
          <div className="rb-grid-wrap">
            <table className="rb-grid">
              <thead>
                <tr>
                  <th style={{ width: 26 }}></th>
                  <th>SP Parameter</th>
                  <th>Bind To Filter</th>
                  <th>Data Type</th>
                  <th>Default</th>
                  <th style={{ width: 36 }}></th>
                </tr>
              </thead>
              <tbody>
                {paramRows.map((row) => (
                  <tr key={row.id}>
                    <td className="ctr rb-drag">⠿</td>
                    <td>
                      <input
                        type="text"
                        value={row.spParameter}
                        onChange={(e) => onUpdateParam(row.id, "spParameter", e.target.value)}
                      />
                    </td>
                    <td>
                      <ReactSelect
                        id={`rbBindFilter-${row.id}`}
                        name="bindFilter"
                        placeholderName="Select"
                        dynamicOptions={bindFilterOptions}
                        value={row.bindFilter}
                        onChange={(name, opt) => onUpdateParam(row.id, name, opt?.value ?? "")}
                        removeIsClearable
                      />
                    </td>
                    <td>
                      <ReactSelect
                        id={`rbParamDataType-${row.id}`}
                        name="dataType"
                        placeholderName="Select"
                        dynamicOptions={paramDataTypeOptions}
                        value={row.dataType}
                        onChange={(name, opt) => onUpdateParam(row.id, name, opt?.value ?? "")}
                        removeIsClearable
                      />
                    </td>
                    <td>
                      <input
                        type="text"
                        value={row.defaultValue}
                        onChange={(e) => onUpdateParam(row.id, "defaultValue", e.target.value)}
                      />
                    </td>
                    <td className="ctr">
                      <button type="button" className="rb-row-del" onClick={() => onRemoveParam(row.id)}>✕</button>
                    </td>
                  </tr>
                ))}
                {paramRows.length === 0 && (
                  <tr>
                    <td colSpan={6} className="ctr" style={{ padding: 10, color: "var(--rb-muted)" }}>
                      No parameters mapped yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
};

export default DataSourceTab;
