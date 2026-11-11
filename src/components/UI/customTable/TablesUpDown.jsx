import React, { useEffect, useRef, useState } from "react";
// import Table from "react-bootstrap/Table";
// import Input from "../../formComponent/Input.jsx";
import { useTranslation } from "react-i18next";
// import Heading from "../Heading.jsx";
import { Dropdown } from "react-bootstrap";
import { Settings } from "lucide-react";

import { DecreaseIngSortSVGIcon, IncreaseIngSortSVGIcon, SortSVGIcon } from "../../SvgIcons/index.jsx";
import { Table } from "react-bootstrap";
import Input from "../../formComponent/Input.jsx";
import Heading from "../Heading.jsx";
import { CiSettings } from "react-icons/ci";


function TablesUpDown({
  thead,
  tbody,
  getRowClass,
  style,
  tableHeight,
  scrollView,
  getRowClick,
  handleClassOnRow,
  handleDoubleClick,
  isSearch,
  notSingleClick = true,
  title,
  specificCellStyle,
  removeHeaderSpace,
  secondHead, // Added secondHead prop
}) {
  const [t] = useTranslation();
  const [bodyData, setBodyData] = useState([]);
  const [handleLanguageStatus, setHandleLanguageStatus] = useState(true);
  const [search, setSearch] = useState("");
  const [theadData, setTheadData] = useState([]);

  const isMobile = window.innerWidth <= 768;
  const activeRowRef = useRef(null);

  useEffect(() => {
    setBodyData(
      tbody?.map((val) => {
        return { ...val, isVisible: true };
      })
    );
  }, [tbody]);

  useEffect(() => {
    if (tbody?.length > 0) {
      let data = thead?.map((val, index) => {
        if (typeof val === "object") {
          // Check if the cell data is an object and if it has a 'value' property
          const cellData = Object.values(tbody[0])[index];
          if (
            typeof cellData === "object" &&
            cellData !== null &&
            !cellData.hasOwnProperty("value")
          ) {
            val.type = "";
          } else {
            val.type = "N";
          }
        } else {
          const cellData = Object.values(tbody[0])[index];
          if (
            typeof cellData === "object" &&
            cellData !== null &&
            !cellData.hasOwnProperty("value")
          ) {
            val = { name: val, type: "" };
          } else {
            val = { name: val, type: "N" };
          }
        }
        return { ...val, isVisible: true };
      });
      setTheadData(data);
    }
  }, [tbody, handleLanguageStatus]);

  const handleSortTable = (index, type, baseKey) => {
    let data = [...bodyData];
    const sortFunc = (a, b) => {
      let aVal = a[baseKey];
      let bVal = b[baseKey];

      // Extract value if it's an object with value/label
      if (typeof aVal === "object" && aVal !== null && aVal.hasOwnProperty("value")) {
        aVal = aVal.value;
      }
      if (typeof bVal === "object" && bVal !== null && bVal.hasOwnProperty("value")) {
        bVal = bVal.value;
      }

      // Helper to parse numbers, including formatted strings
      const parseNum = (val) => {
        if (typeof val === "number") return val;
        if (typeof val === "string") {
          const num = parseFloat(val.replace(/,/g, ""));
          if (!isNaN(num)) return num;
        }
        return null;
      };

      const aNum = parseNum(aVal);
      const bNum = parseNum(bVal);
      if (aNum !== null && bNum !== null) {
        return type === "DESC" ? bNum - aNum : aNum - bNum;
      }

      // Check if both are valid dates
      const aDate = new Date(aVal);
      const bDate = new Date(bVal);
      if (
        !isNaN(aDate.getTime()) &&
        !isNaN(bDate.getTime()) &&
        typeof aVal !== "number" && // Ensure it's not a number treated as date
        typeof bVal !== "number"
      ) {
        return type === "DESC" ? bDate - aDate : aDate - bDate;
      }

      // Default to string comparison
      const aStr = String(aVal || "");
      const bStr = String(bVal || "");
      return type === "DESC"
        ? bStr.localeCompare(aStr)
        : aStr.localeCompare(bStr);
    };
    data.sort(sortFunc);
    // Perform the sort check two times for verification
    data.sort(sortFunc);
    setBodyData(data);

    if (typeof theadData[index] === "object") {
      let updatedHead = [...theadData]?.map((val, i) => {
        if (index === i) {
          val.type = type;
        } else {
          val.type = val.type === "" ? val.type : "N";
        }
        return val;
      });
      setTheadData(updatedHead);
    }
  };

  const handleItemSearch = (e) => {
    setSearch(e?.target?.value);
    const results = tbody?.filter((obj) =>
      Object.values(obj)?.some(
        (value) =>
          typeof value === "string" &&
          value?.toLowerCase().includes(e?.target?.value.toLowerCase())
      )
    );
    setBodyData(results);
  };

  const handleRowClick = (rowRef, ele, index) => {
    getRowClick && getRowClick(ele, index);

    if (activeRowRef.current) {
      const originalColor = activeRowRef.current.getAttribute(
        "data-original-color"
      );
      activeRowRef.current.style.backgroundColor = originalColor;
    }

    if (rowRef) {
      rowRef.setAttribute("data-original-color", rowRef.style.backgroundColor);
      rowRef.style.backgroundColor = "lightblue";
      activeRowRef.current = rowRef;
    }
  };

  const toggleColumn = (e, index, headName) => {
    let keyName = Object.keys(tbody[0])[index];
    let prevKeyName = Object.keys(tbody[0])[index - 1];
    const hData = [...theadData];
    hData[index].isVisible = e.target.checked;

    setTheadData(hData);
    if (!e.target.checked) {
      const bData = bodyData.map((item) => {
        delete item[keyName];
        return item;
      });
      setBodyData(bData);
    } else if (tbody && Array.isArray(tbody)) {
      const bData = bodyData?.map((val, ind) => {
        const orderedPatient = Object.fromEntries(
          Object.entries(val).reduce((acc, [key, value]) => {
            acc.push([key, value]);
            if (key === prevKeyName) {
              acc.push([keyName, tbody[ind][keyName]]);
            } else if (prevKeyName === undefined) {
              acc.unshift([keyName, tbody[ind][keyName]]);
            }
            return acc;
          }, [])
        );
        return orderedPatient;
      });
      setBodyData(bData);
    }
  };

  const [dropdownVisible, setDropdownVisible] = useState(false);

  const dropdownRef = useRef(null);
  const buttonRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target) &&
        buttonRef.current &&
        !buttonRef.current.contains(e.target)
      ) {
        setDropdownVisible(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Check if secondHead exists and has data
  const hasSecondHead = secondHead && secondHead?.length > 0;
  // Get visible columns count for colspan calculation
  const visibleColumnsCount = theadData?.filter(
    (val) => val?.isVisible !== false
  ).length;

  return (
    <>
      {title && (
        <Heading
          title={title}
          isBreadcrumb={false}
          secondTitle={
            <Dropdown show={dropdownVisible} ref={buttonRef}>
              <Dropdown.Toggle
                id="dropdown-basic"
                bsPrefix="custom-toggle"
                className="p-0 mx-1 theme-class"
              >
                <Settings
                  size={18}
                  onClick={() => {
                    setDropdownVisible(!dropdownVisible);
                  }}
                  style={{ color: "#000" }}
                />
              </Dropdown.Toggle>

              <Dropdown.Menu
                style={{
                  position: "absolute",
                  zIndex: "999 !important",
                  minHeight: "150px",
                  maxHeight: "200px",
                  overflowY: "auto",
                }}
                popperConfig={{ strategy: "fixed" }}
              >
                {theadData?.map((head, index) => (
                  <Dropdown.Item
                    key={index}
                    as="div"
                    ref={dropdownRef}
                    style={{ position: "relative" }}
                    onClick={(e) => e.stopPropagation()} // prevent auto-close
                  >
                    <input
                      type="checkbox"
                      checked={head?.isVisible}
                      onChange={(e) => toggleColumn(e, index, head)}
                      className="table-checkbox"
                    />{" "}
                    {head?.name || head}
                  </Dropdown.Item>
                ))}
              </Dropdown.Menu>
            </Dropdown>
          }
        />
      )}
      {tbody?.length > 0 && isSearch && (
        <div
          style={{
            display: "flex",
            justifyContent: "flex-start",
            marginLeft: "2px",
          }}
        >
          <Input
            type="text"
            className="table-input my-1 ml-3"
            respclass={"width-250"}
            removeFormGroupClass={true}
            placeholder={t("Search")}
            onChange={handleItemSearch}
          />
        </div>
      )}
      {(bodyData?.length > 0 || search) && (
        <div
          id="no-more-tables"
          style={style}
          className={`${tableHeight} ${scrollView} custom-scrollbar TabScroll`}
        >
          <div className="row">
            <div className="col-12">
              <Table className="mainTable pt-2" bordered>
                <thead style={{ zIndex: 1 }}>
                  {/* Render secondHead if it exists */}
                  {hasSecondHead && (
                    <tr>
                      {secondHead?.map((headData, index) => (
                        <th
                          key={`second-${index}`}
                          style={{
                            width: headData?.width ? headData?.width : "",
                            // Add bottom border for second header
                            borderBottom: "0px solid #dee2e6",
                            // Optional: Add background color to distinguish
                            backgroundColor: "#f8f9fa",
                            fontWeight: "bold",
                            fontSize: "0.95rem",
                          }}
                          colSpan={headData?.colSpan || 1}
                          rowSpan={headData?.rowSpan || 1}
                        >
                          {headData?.name ? headData.name : headData} &nbsp;
                        </th>
                      ))}
                    </tr>
                  )}

                  {/* Render main header (thead) */}

                  <tr>
                    {theadData
                      ?.filter((val) => val?.isVisible !== false)
                      ?.map((headData, index) => (
                        <th
                          key={index}
                          style={{
                            width: headData?.width ? headData?.width : "",
                            textAlign: headData?.textAlign
                              ? headData?.textAlign
                              : "",
                            marginLeft: "3px",
                            // Add top border for main header when second header exists
                            borderTop: hasSecondHead ? "1px solid #dee2e6" : "",
                            // Ensure proper border display
                            borderBottom: "0px solid #dee2e6",
                            fontWeight: hasSecondHead ? "600" : "bold",
                            fontSize: "0.9rem",
                            // Remove padding to reduce gap
                            paddingTop: hasSecondHead ? "4px" : "",
                            paddingBottom: "8px",
                          }}
                          className={`${headData?.className ? headData?.className : ""}`}
                          colSpan={headData?.colSpan || 1}
                          rowSpan={headData?.rowSpan || 1}
                        >
                          {headData?.type === "" && (
                            <> {headData?.name ? headData.name : headData}</>
                          )}
                          {headData?.type === "N" && (
                            <span
                              className="pointer-cursor"
                              onClick={() => {
                                handleSortTable(index, "ASC", headData.name);
                              }}
                            >
                              {headData?.name ? headData.name : headData}
                              <SortSVGIcon />
                            </span>
                          )}
                          {headData?.type === "ASC" && (
                            <span
                              className="pointer-cursor"
                              onClick={() => {
                                handleSortTable(index, "DESC", headData?.name);
                              }}
                            >
                              {" "}
                              {headData?.name ? headData.name : headData}
                              <IncreaseIngSortSVGIcon />
                            </span>
                          )}
                          {headData?.type === "DESC" && (
                            <span
                              className="pointer-cursor"
                              onClick={() => {
                                handleSortTable(index, "ASC", headData?.name);
                              }}
                            >
                              {" "}
                              {headData?.name ? headData.name : headData}
                              <DecreaseIngSortSVGIcon />
                            </span>
                          )}
                          {removeHeaderSpace ? "" : <>&nbsp;</>}
                        </th>
                      ))}
                  </tr>
                </thead>
                {bodyData?.length > 0 ? (
                  <tbody style={{ backgroundColor: "white" }}>
                    {bodyData?.map((ele, index) => {
                      const keys = Object.keys(ele).filter(
                        (key) => key !== "colorcode" && key !== "isVisible"
                      );
                      const rowColor = ele.colorcode || "";
                      return (
                        <tr
                          key={index}
                          className={getRowClass ? getRowClass(ele, index) : ""}
                          style={{ backgroundColor: rowColor }}
                          onClick={(e) =>
                            notSingleClick
                              ? handleRowClick(e.currentTarget, ele, index)
                              : undefined
                          }
                          onDoubleClick={(e) =>
                            handleDoubleClick && handleDoubleClick(ele, index)
                          }
                        >
                          {keys?.map((bodyData, inx) => (
                            <td
                              key={inx}
                              data-title={
                                theadData[inx]?.name
                                  ? theadData[inx]?.name
                                  : theadData[inx]
                              }
                              style={
                                specificCellStyle &&
                                specificCellStyle(
                                  ele,
                                  theadData[inx]?.name
                                    ? theadData[inx]?.name
                                    : theadData[inx],
                                  inx
                                )
                              }
                              className={`
                            ${handleClassOnRow
                                  ? handleClassOnRow(
                                    ele,
                                    theadData[inx]?.name
                                      ? theadData[inx]?.name
                                      : theadData[inx],
                                    inx,
                                    index
                                  )
                                  : "px-2"
                                }`}
                            >
                              {ele[bodyData]?.label ? (
                                ele[bodyData]?.label
                              ) : ele[bodyData] ? (
                                ele[bodyData]
                              ) : (
                                <>&nbsp;</>
                              )}
                              {isMobile && <>&nbsp;</>}
                            </td>
                          ))}
                        </tr>
                      );
                    })}
                  </tbody>
                ) : (
                  <td colSpan={visibleColumnsCount} className="text-center">
                    {t("No data found")}
                  </td>
                )}
              </Table>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default TablesUpDown;
