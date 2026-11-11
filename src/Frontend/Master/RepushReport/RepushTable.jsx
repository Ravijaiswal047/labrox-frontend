import NoRecordFound from "../../../components/formComponent/NoRecordFound";

const DataTable = ({
  columns,
  data,
  selectedRows,
  setSelectedRows,
  checkboxKey,
  first,
}) => {
  const isSelected = (id) => selectedRows.some((row) => row.id === id);

  const toggleRow = (row) => {
    if (isSelected(row.id)) {
      setSelectedRows(selectedRows.filter((r) => r.id !== row.id));
    } else {
      setSelectedRows([...selectedRows, row]);
    }
  };

  const toggleAll = () => {
    if (selectedRows.length === data.length) {
      setSelectedRows([]);
    } else {
      setSelectedRows(data);
    }
  };

  return (
    <div
      style={{
        maxHeight: "400px",
        overflowY: "auto",
      }}
    >
      <table className="col-12 mainTable pt-2 pl-2 pr-2 pb-2" bordered>
        <thead>
          <tr>
            {columns.map((col) => (
              <th key={col.key}>{col.label}</th>
            ))}
            <th>
              <div className="d-flex flex-column align-items-start">
                <span className="mb-1m">Select All</span>
                <input
                  type="checkbox"
                  checked={
                    selectedRows.length === data.length && data.length > 0
                  }
                  onChange={toggleAll}
                />
              </div>
            </th>
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td colSpan={columns.length + 1} className="text-center">
                <NoRecordFound />
              </td>
            </tr>
          ) : (
            data.map((row) => (
              <tr key={row.id}>
                {columns.map((col) => (
                  <td key={col.key}>{row[col.key]}</td>
                ))}
                <td>
                  <input
                    type="checkbox"
                    checked={isSelected(row.id)}
                    onChange={() => toggleRow(row)}
                  />
                </td>
              </tr>
            ))
          )}
        </tbody>
        {/* <tbody>
          {data.length === 0 ? (
            <tr>
              <td colSpan={columns.length + 1} className="text-center">
                No Data Available
              </td>
            </tr>
          ) : (
            data.map((row, index) => (
              <tr key={row.id}>
                {columns.map((col) =>
                  col.key === "sr" ? (
                    <td key={col.key}>{first + index + 1}</td>
                    // <td key={col.key}>{index + 1 + IndexHandle(currentPage, pageSize)}</td>
                  ) : (
                    <td key={col.key}>{row[col.key]}</td>
                  )
                )}
                <td>
                  <input
                    type="checkbox"
                    checked={isSelected(row.id)}
                    onChange={() => toggleRow(row)}
                  />
                </td>
              </tr>
            ))
          )}
        </tbody> */}
      </table>
    </div>
  );
};

export default DataTable;
