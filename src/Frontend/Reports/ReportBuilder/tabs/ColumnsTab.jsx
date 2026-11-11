import React from "react";
import ReactSelect from "../../../../components/formComponent/ReactSelect";
import Input from "../../../../components/formComponent/Input";
import {
  alignOptions,
  columnDataTypeOptions,
  aggregateOptions,
} from "../reportBuilderData";

const boolCols = [
  { key: "visible", label: "Visible" },
  { key: "group", label: "Group" },
  { key: "sort", label: "Sort" },
  { key: "search", label: "Search" },
  { key: "exportable", label: "Export" },
  { key: "freeze", label: "Freeze" },
];

const ColumnsTab = ({
  columnRows,
  onAddFormulaColumn,
  onRemoveColumn,
  onUpdateColumn,
  selectedColumnId,
  onSelectColumnRow,
}) => {
  const formulaColumns = columnRows.filter((c) => c.isFormula);
  const formulaColumn = formulaColumns.find((c) => c.id === selectedColumnId) || formulaColumns[0];

  return (
    <>
      <div className="rb-panel">
        <div className="rb-panel-hd">
          <span className="rb-dot" />Column Configuration — {columnRows.length} columns detected
          <span className="rb-hd-act">
            <button type="button" className="rb-mini-btn" onClick={onAddFormulaColumn}>＋ Formula Column</button>
          </span>
        </div>
        <div className="rb-panel-body" style={{ padding: 0 }}>
          <span className="rb-hint" style={{ display: "block", padding: "8px 12px" }}>
            "Visible" controls the on-screen Report Viewer grid. "Export" controls which columns are included in the PDF/Excel/CSV/Print output — uncheck it to keep a PDF short even when the grid shows every column.
          </span>
          <div className="rb-grid-wrap">
            <table className="rb-grid">
              <thead>
                <tr>
                  <th style={{ width: 26 }}></th>
                  <th>DB Column</th>
                  <th>Alias</th>
                  <th>Display Name</th>
                  {boolCols.slice(0, 1).map((c) => (
                    <th key={c.key} className="ctr">{c.label}</th>
                  ))}
                  <th>Width</th>
                  <th>Align</th>
                  <th>Data Type</th>
                  <th>Dec</th>
                  {boolCols.slice(1).map((c) => (
                    <th key={c.key} className="ctr">{c.label}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {columnRows.map((row) => (
                  <tr
                    key={row.id}
                    onClick={() => row.isFormula && onSelectColumnRow(row.id)}
                    style={
                      row.isFormula
                        ? { background: "var(--rb-orange-soft)", cursor: "pointer", outline: selectedColumnId === row.id ? "2px solid var(--rb-orange)" : "none", outlineOffset: -2 }
                        : undefined
                    }
                  >
                    <td className="ctr rb-drag">⠿</td>
                    <td>
                      {row.isFormula ? (
                        <span className="rb-pill sp">ƒx FORMULA</span>
                      ) : (
                        <input
                          type="text"
                          value={row.dbColumn}
                          onChange={(e) => onUpdateColumn(row.id, "dbColumn", e.target.value)}
                        />
                      )}
                    </td>
                    <td>
                      <input
                        type="text"
                        value={row.alias}
                        onChange={(e) => onUpdateColumn(row.id, "alias", e.target.value)}
                      />
                    </td>
                    <td>
                      <input
                        type="text"
                        value={row.displayName}
                        onChange={(e) => onUpdateColumn(row.id, "displayName", e.target.value)}
                      />
                    </td>
                    <td className="ctr">
                      <input
                        type="checkbox"
                        className="table-checkbox"
                        checked={row.visible}
                        onChange={(e) => onUpdateColumn(row.id, "visible", e.target.checked)}
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        value={row.width}
                        onChange={(e) => onUpdateColumn(row.id, "width", e.target.value)}
                      />
                    </td>
                    <td>
                      <ReactSelect
                        id={`rbAlign-${row.id}`}
                        name="align"
                        placeholderName="Select"
                        dynamicOptions={alignOptions}
                        value={row.align}
                        onChange={(name, opt) => onUpdateColumn(row.id, name, opt?.value ?? "")}
                        removeIsClearable
                      />
                    </td>
                    <td>
                      <ReactSelect
                        id={`rbColDataType-${row.id}`}
                        name="dataType"
                        placeholderName="Select"
                        dynamicOptions={columnDataTypeOptions}
                        value={row.dataType}
                        onChange={(name, opt) => onUpdateColumn(row.id, name, opt?.value ?? "")}
                        removeIsClearable
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        value={row.dec}
                        onChange={(e) => onUpdateColumn(row.id, "dec", e.target.value)}
                      />
                    </td>
                    {boolCols.slice(1).map((c) => (
                      <td key={c.key} className="ctr">
                        <input
                          type="checkbox"
                          className="table-checkbox"
                          checked={row[c.key]}
                          onChange={(e) => onUpdateColumn(row.id, c.key, e.target.checked)}
                        />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {formulaColumn && (
        <div className="rb-panel">
          <div className="rb-panel-hd">
            <span className="rb-dot" />Formula Column — {formulaColumn.alias}
            {formulaColumns.length > 1 && (
              <span className="rb-hint" style={{ marginLeft: 8 }}>
                ({formulaColumns.length} formula columns — click a row above to switch)
              </span>
            )}
          </div>
          <div className="rb-panel-body">
            <div className="rb-frm">
              <div className="rb-fg c2">
                <label>Expression</label>
                <Input
                  id="rbFormulaExpr"
                  name="expression"
                  type="text"
                  className="font-monospace"
                  value={formulaColumn.formulaExpression}
                  onChange={(e) => onUpdateColumn(formulaColumn.id, "formulaExpression", e.target.value)}
                  removeFormGroupClass
                />
                <span className="rb-hint">Reference other columns by alias, e.g. [Gross] - [Disc]</span>
              </div>
              <div className="rb-fg">
                <label>Aggregate (Footer)</label>
                <ReactSelect
                  id="rbFormulaAggregate"
                  name="aggregateType"
                  placeholderName="Select"
                  dynamicOptions={aggregateOptions}
                  value={formulaColumn.aggregateType}
                  onChange={(name, opt) => onUpdateColumn(formulaColumn.id, name, opt?.value ?? "")}
                  removeIsClearable
                />
              </div>
              <div className="rb-fg">
                <label>Conditional Formatting</label>
                <Input
                  id="rbFormulaConditional"
                  name="conditionalFormat"
                  type="text"
                  className="font-monospace"
                  value={formulaColumn.conditionalFormat}
                  onChange={(e) => onUpdateColumn(formulaColumn.id, "conditionalFormat", e.target.value)}
                  removeFormGroupClass
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ColumnsTab;
