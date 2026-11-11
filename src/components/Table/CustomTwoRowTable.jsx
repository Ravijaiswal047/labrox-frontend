import React from "react";
import "./CustomTwoRowTable.css";

const CustomTwoRowTable = ({
  months,
  data,
  onDataChange,
  editRows,
  onEditRowsChange,
  calculateRowTotal,
  columnTotals,
}) => {
  const masterEdit = Object.values(editRows).every(Boolean);

  const handleCheckboxChange = (centreID) => {
    onEditRowsChange((prev) => ({
      ...prev,
      [centreID]: !prev[centreID],
    }));
  };

  const handleMasterCheckboxChange = () => {
    const newState = !masterEdit;
    const allRows = {};
    data.forEach((row) => {
      allRows[row.centreID] = newState;
    });
    onEditRowsChange(allRows);
  };

  const handleInputChange = (centreID, key, value) => {
    const updatedData = data?.map((row) =>
      row.centreID === centreID ? { ...row, [key]: Number(value) } : row,
    );
    onDataChange(updatedData);
  };

  return (
    <div className="table-responsive">
      <table className="table table-bordered table-striped align-middle text-center custom-two-row-table">
        <thead>
          <tr>
            <th rowSpan="2">S.No</th>
            <th rowSpan="2">Centre</th>
            {months?.map((m) => (
              <th key={m.key} colSpan="2">
                {m.label}
              </th>
            ))}
            {/* Total with two sub-columns */}
            <th colSpan="2">Total</th>
            <th rowSpan="2">
              <input
                type="checkbox"
                checked={masterEdit}
                onChange={handleMasterCheckboxChange}
              />
            </th>
          </tr>
          <tr>
            {months?.map((m) => (
              <React.Fragment key={m.key}>
                <th>Count</th>
                <th>Sale</th>
              </React.Fragment>
            ))}
            {/* Sub-columns for Total */}
            <th>Count</th>
            <th>Sale</th>
          </tr>
        </thead>

        <tbody>
          {data?.length === 0 ? (
            <tr>
              <td
                colSpan={2 + months?.length * 2 + 2 + 1}
                className="text-center"
              >
                No records found
              </td>
            </tr>
          ) : (
            <>
              {data?.map((row, index) => {
                const rowCountTotal = months.reduce(
                  (sum, m) => sum + (row[`${m.key}_PatientCount`] ?? 0),
                  0,
                );
                const rowSaleTotal = months.reduce(
                  (sum, m) => sum + (row[`${m.key}_TargetSale`] ?? 0),
                  0,
                );
                return (
                  <tr key={row.centreID}>
                    <td>{index + 1}</td>
                    <td>{row.centre || `Centre-${row.centreID}`}</td>
                    {months?.map((m) => (
                      <React.Fragment key={m.key}>
                        <td>
                          {editRows[row.centreID] ? (
                            <input
                              type="number"
                              className="form-control form-control-sm table-input"
                              value={row[`${m.key}_PatientCount`] ?? 0}
                              onChange={(e) =>
                                handleInputChange(
                                  row.centreID,
                                  `${m.key}_PatientCount`,
                                  e.target.value,
                                )
                              }
                            />
                          ) : (
                            (row[`${m.key}_PatientCount`] ?? 0)
                          )}
                        </td>
                        <td>
                          {editRows[row.centreID] ? (
                            <input
                              type="number"
                              className="form-control form-control-sm table-input"
                              value={row[`${m.key}_TargetSale`] ?? 0}
                              onChange={(e) =>
                                handleInputChange(
                                  row.centreID,
                                  `${m.key}_TargetSale`,
                                  e.target.value,
                                )
                              }
                            />
                          ) : (
                            (row[`${m.key}_TargetSale`] ?? 0)
                          )}
                        </td>
                      </React.Fragment>
                    ))}
                    {/* Row totals */}
                    <td>{rowCountTotal}</td>
                    <td>{rowSaleTotal}</td>
                    <td>
                      <input
                        type="checkbox"
                        checked={!!editRows[row.centreID]}
                        onChange={() => handleCheckboxChange(row.centreID)}
                      />
                    </td>
                  </tr>
                );
              })}

              {/* Totals Row */}
              <tr className="fw-bold bg-light">
                <td colSpan="2">Total</td>
                {columnTotals?.map((col, idx) => (
                  <React.Fragment key={idx}>
                    <td>{col.patientCount}</td>
                    <td>{col.sale}</td>
                  </React.Fragment>
                ))}
                {/* Grand totals for all rows */}
                <td>
                  {columnTotals.reduce((sum, col) => sum + col.patientCount, 0)}
                </td>
                <td>{columnTotals.reduce((sum, col) => sum + col.sale, 0)}</td>
                <td></td>
              </tr>
            </>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default CustomTwoRowTable;
