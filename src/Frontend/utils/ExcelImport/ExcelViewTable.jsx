import React, { useRef, useState } from "react";
import Table from "react-bootstrap/Table";
import "../../../assets/css/theme.css";

function ExcelViewTable({
  thead = [],
  tbody = [],
  fs,
  getRowClass,
  style,
  tableHeight,
  scrollView,
  getRowClick,
  WWW,
  handleClassOnRow,
  handleDoubleClick,
  tableClass = "",
}) {
  const isMobile = window.innerWidth <= 768;
  const activeRowRef = useRef(null);

  const handleRowClick = (rowRef, ele, index) => {
    if (getRowClick) getRowClick(ele, index);

    if (activeRowRef.current) {
      const originalColor = activeRowRef.current.getAttribute(
        "data-original-color",
      );
      activeRowRef.current.style.backgroundColor = originalColor;
    }

    if (rowRef) {
      rowRef.setAttribute("data-original-color", rowRef.style.backgroundColor);
      rowRef.style.backgroundColor = "lightblue";
      activeRowRef.current = rowRef;
    }
  };

  if (!tbody.length) return null;

  return (
    <div
      id="no-more-tables"
      style={style}
      className={`${tableHeight} ${tableClass} ${scrollView} TabScroll mx-2`}
    >
      <div className="row">
        <div className="col-12 px-0 table_over_flow">
          <Table className="mainTable pt-2 pl-2 pr-2" bordered>
            <thead style={{ zIndex: 1 }}>
              <tr className="">
                {thead.map((headData, index) => (
                  <th
                    key={index}
                    style={{
                      width: headData?.width || "",
                      textAlign: headData?.textAlign || "",
                    }}
                    className={headData?.className || ""}
                  >
                    <span className="p-1 px-2 py-2 d-inline-block">
                      {headData?.name || headData}
                    </span>
                    &nbsp;
                  </th>
                ))}
              </tr>
            </thead>

            <tbody style={{ backgroundColor: "white" }}>
              {tbody.map((rowData, rowIndex) => {
                const keys = Object.keys(rowData).filter(
                  (key) => key !== "colorcode",
                );

                return (
                  <tr
                    key={rowIndex}
                    className={
                      getRowClass ? getRowClass(rowData, rowIndex) : ""
                    }
                    style={{ backgroundColor: rowData.colorcode || "" }}
                    onClick={(e) =>
                      handleRowClick(e.currentTarget, rowData, rowIndex)
                    }
                    onDoubleClick={() => handleDoubleClick?.(rowData, rowIndex)}
                  >
                    {keys.map((key, colIndex) => {
                      const header = thead[colIndex];
                      const headerName =
                        header?.resName || header?.name || header;
                      const cellValue =
                        rowData[key]?.label || rowData[key] || "\u00A0"; // &nbsp;

                      return (
                        <td
                          key={colIndex}
                          data-title={headerName}
                          style={{ width: WWW }}
                          className={`backcolornone ${
                            handleClassOnRow
                              ? handleClassOnRow(
                                  rowData,
                                  header?.name || header,
                                )
                              : "p-1"
                          }`}
                        >
                          {cellValue}
                          {isMobile && <>&nbsp;</>}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </Table>
        </div>
      </div>
    </div>
  );
}

export default ExcelViewTable;
