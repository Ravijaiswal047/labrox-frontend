import React from "react";
import { Table, OverlayTrigger, Tooltip } from "react-bootstrap";
import "./Table.css";

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
  theadStyle = {},
  hideNoRecord = false,
  disableTooltip = false,
}) => {
  const container = typeof document !== "undefined" ? document.body : undefined;

  //Helper: wrap cell with tooltip
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
      <Table className="mainTable pt-2 pl-2 pr-2 table_Items">
        <thead style={theadStyle} className="table-dark">
          <tr>
            {columns.map((col, idx) => (
              <th
                style={{
                  width: col?.width || "auto",
                  maxWidth: col?.maxWidth || "auto",
                  minWidth: col?.minWidth || "auto",
                }}
                key={idx}
              >
                <span className="d-inline-block px-2">{col.header}</span>
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {data?.length > 0 ? (
            data.map((row, rowIndex) => (
              <tr
                style={{
                  background: `${row?.rowColor}`,
                  maxWidth: row?.maxWidth || "auto",
                  cursor: onRowClick ? "pointer" : "default",
                }}
                className={
                  typeof rowClassName === "function"
                    ? rowClassName(row, rowIndex)
                    : rowClassName || ""
                }
                key={rowIndex}
                onClick={() => onRowClick && onRowClick(row, rowIndex)}
              >
                {columns?.map((col, colIndex) => {
                  // const cellValue = row[col.field];

                  const cellValue =
                    row[col.field] === null ||
                      row[col.field] === undefined ||
                      row[col.field] === ""
                      ? "\u00A0"   
                      : row[col.field];

                  return (
                    <td
                      onClick={() =>
                        onCellClick &&
                        onCellClick(row, row[col.field], rowIndex)
                      }
                      // data-title={col.header}
                      data-title={
                        typeof col.header === "string"
                          ? col.header
                          : col.mobileLabel || ""
                      }
                      key={colIndex}
                      className="px-2 py-1"
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
                            style={{ cursor: "pointer", color: "#21218b" }}
                          />
                        </div>
                      ) : typeof cellValue === "string" ? (
                        // If string, add tooltip if too long
                        cellValue.length > 40 && !col.wrapText && !disableTooltip ? (
                          renderWithTooltip(
                            cellValue.slice(0, 40) + "...",
                            cellValue,
                            rowIndex,
                            colIndex,
                          )
                        ) : col.wrapText ? (
                          <div style={{ whiteSpace: "normal", wordBreak: "break-word", minWidth: col?.minWidth || "250px", maxWidth: col?.maxWidth || "none" }}>
                            {cellValue}
                          </div>
                        ) : (
                          cellValue
                        )
                      ) : React.isValidElement(cellValue) ? (
                        // If JSX element, wrap with tooltip if tooltip text is available in props
                        disableTooltip ? (
                          cellValue
                        ) : (
                          renderWithTooltip(
                            cellValue,
                            cellValue.props?.title || "Details",
                            rowIndex,
                            colIndex,
                          )
                        )
                      ) : (
                        cellValue
                      )}
                    </td>
                  );
                })}
              </tr>
            ))
          ) : hideNoRecord ? null : (
            <tr>
              <td colSpan={columns.length} className="text-center ">
                No records found.
              </td>
            </tr>
          )}
        </tbody>
      </Table>
    </div>
  );
};

export default CustomTable;
