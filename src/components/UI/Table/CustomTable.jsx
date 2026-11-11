import React from "react";
import { Table, OverlayTrigger, Tooltip } from "react-bootstrap";
import "./Table.css";
import NoRecordFound from "../../formComponent/NoRecordFound";

const CustomTable = ({
  columns,
  data,
  onEdit,
  onRowClick,
  scrollView,
  tableHeight,
  rowClassName,
  onCellClick,
  style,
  allowMultilineFields = [],
  isStickyHeader = false,
}) => {
  const container =
    typeof document !== "undefined" ? document.body : undefined;

  // 🔧 Helper: wrap cell with tooltip
  const renderWithTooltip = (content, tooltipText, rowIndex, colIndex) => {
    return (
      <OverlayTrigger
        placement="top"
        container={container}
        overlay={
          <Tooltip id={`tooltip-${rowIndex}-${colIndex}`}>
            {tooltipText}
          </Tooltip>
        }
        delay={{ show: 150, hide: 50 }}
      >
        <span title={tooltipText} style={{ cursor: "pointer" }} tabIndex={0}>
          {content}
        </span>
      </OverlayTrigger>
    );
  };

  return (
    <div
      id="no-more-tables"
      style={{
        ...style,
        overflowX: "auto",
        whiteSpace: "nowrap",
        scrollbarWidth: "thin",
        scrollbarColor: "#a1c6db white",
        borderRadius: "5px",
      }}
      className={`${tableHeight} ${scrollView} custom-scrollbar TabScroll`}
    >
      <Table className="mainTable pt-2 pl-2 pr-2 pb-2 table_Items" >
        <thead className="table-dark" style={{
          position: isStickyHeader ? "sticky" : "",
          top: isStickyHeader ? 0 : "",
          zIndex: isStickyHeader ? 10 : "",
        }}>
          <tr>
            {columns.map((col, idx) => (
              <th
                key={idx}
                style={{
                  width: col?.width || "auto",
                  maxWidth: col?.maxWidth || "auto",
                  // position: isStickyHeader ? "sticky" : "",
                  // top: isStickyHeader ? 0 : "",
                  // zIndex: isStickyHeader ? 10 : "",
                }}
              >
                <span className="d-inline-block px-2 py-1">
                  {col.header}
                </span>
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {data?.length > 0 ? (
            data.map((row, rowIndex) => (
              <tr
                key={rowIndex}
                style={{
                  background: row?.rowColor,
                  maxWidth: row?.maxWidth || "auto",
                  cursor: onRowClick ? "pointer" : "default",
                }}
                className={
                  typeof rowClassName === "function"
                    ? rowClassName(row, rowIndex)
                    : rowClassName || ""
                }
                onClick={() => onRowClick && onRowClick(row, rowIndex)}
              >
                {columns.map((col, colIndex) => {
                  const cellValue = row[col.field];

                  return (
                    <td
                      key={colIndex}
                      className="px-2 py-1"
                      data-title={col.header}
                      onClick={() =>
                        onCellClick &&
                        onCellClick(row, row[col.field], rowIndex)
                      }
                    >
                      {col.field === "edit" ? (
                        <div
                          onClick={(e) => {
                            e.stopPropagation();
                            onEdit && onEdit(row);
                          }}
                        >
                          <i
                            className="fa fa-edit"
                            style={{
                              cursor: "pointer",
                              color: "#21218b",
                            }}
                          />
                        </div>
                      ) : typeof cellValue === "string" ? (
                        allowMultilineFields.includes(col.field) ? (
                          <span
                            style={{
                              whiteSpace: "pre-line",
                              wordBreak: "break-word",
                              lineHeight: "1.4",
                            }}
                          >
                            {cellValue}
                          </span>
                        ) : cellValue.length > 40 ? (
                          renderWithTooltip(
                            `${cellValue.slice(0, 40)}...`,
                            cellValue,
                            rowIndex,
                            colIndex
                          )
                        ) : (
                          cellValue
                        )
                      ) : React.isValidElement(cellValue) ? (
                        renderWithTooltip(
                          cellValue,
                          cellValue.props?.title || "Details",
                          rowIndex,
                          colIndex
                        )
                      ) : (
                        cellValue
                      )}
                    </td>
                  );
                })}
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={columns.length} className="text-center">
                <NoRecordFound />
              </td>
            </tr>
          )}
        </tbody>
      </Table>
    </div>
  );
};

export default CustomTable;