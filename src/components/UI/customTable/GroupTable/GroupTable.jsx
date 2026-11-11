import React, { useEffect, useRef, useState } from "react";
import Table from "react-bootstrap/Table";
import { useTranslation } from "react-i18next";
import { Dropdown } from "react-bootstrap";
import { Settings } from "lucide-react";
import {
  SortSVGIcon,
  IncreaseIngSortSVGIcon,
  DecreaseIngSortSVGIcon,
} from "../../../SvgIcons/index.jsx";
import Input from "../../../formComponent/Input.jsx";
import Heading from "../../Heading.jsx";
import Tables from "../index.jsx";
import HisTable from "../HisTable.jsx";
function GroupTable({
  thead,
  groupThead,
  tbody,
  getRowClass,
  style,
  tableHeight,
  scrollView,
  getRowClick,
  // WWW,
  handleClassOnRow,
  handleDoubleClick,
  isSearch,
  notSingleClick = true,
  title,
  specificCellStyle,
  removeHeaderSpace,
  isHeader = false,
  headerTitle = "",
  getSubRowClass,
  isDoubleClick = false,
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
          if (typeof Object?.values(tbody[0])[index] === "object") {
            val.type = "";
          } else {
            val.type = "N";
          }
        } else {
          if (typeof Object?.values(tbody[0])[index] === "object") {
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

  // i18next.on("languageChanged", (lng) => {
  //   console.log("Asdasd",lag)
  //   setHandleLanguageStatus(!handleLanguageStatus)
  // });

  // Handle Sort Functionality

  const handleSortTable = (index, type) => {
    let typeName = Object?.keys(bodyData[0])[index];
    let data = [...bodyData];
    if (type === "DESC") {
      data.sort((a, b) => {
        if (new Date(a[typeName]).toString() === "Invalid Date") {
          return b[typeName]?.localeCompare(a[typeName]);
        } else {
          return new Date(b[typeName]) - new Date(a[typeName]);
        }
      });
    } else {
      data.sort((a, b) => {
        if (new Date(a[typeName]).toString() === "Invalid Date") {
          return a[typeName]?.localeCompare(b[typeName]);
        } else {
          return new Date(a[typeName]) - new Date(b[typeName]);
        }
      });
    }
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

  // handle Search Item
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

  // Function to handle row click
  const handleRowClick = (rowRef, ele, index) => {
    getRowClick && getRowClick(ele, index);

    if (activeRowRef.current) {
      // Reset the previous active row to its original color
      const originalColor = activeRowRef.current.getAttribute(
        "data-original-color"
      );
      activeRowRef.current.style.backgroundColor = originalColor;
    }

    // Set the new active row style
    if (rowRef) {
      // Store the original color of the new active row
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
        return orderedPatient; // Ensure the return value is properly handled.
      });
      setBodyData(bData);
    }
  };

  const [dropdownVisible, setDropdownVisible] = useState(false);

  const dropdownRef = useRef(null);
  const buttonRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      // Check if the click was outside both the dropdown and the button
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target) &&
        buttonRef.current &&
        !buttonRef.current.contains(e.target)
      ) {
        setDropdownVisible(false);
      }
    };

    // Add event listener for clicks outside
    document.addEventListener("mousedown", handleClickOutside);

    // Cleanup the event listener
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

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
                {theadData.map((head, index) => (
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
            // placeholderLabel={<i className="fa fa-search search_icon" aria-hidden="true"></i>}
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
                  {/* GROUP HEADER ROW */}
                  {Array.isArray(groupThead) && (
                    <tr className="group-header">
                      {groupThead.map((grp, idx) => (
                        <th
                          key={idx}
                          colSpan={grp.colSpan}
                          style={{
                            textAlign: "center",
                            fontWeight: "bold",
                            // background: "#DFE4F7",
                            // color: "#fff",
                            border: "1px solid #ccc",
                            // borderRight:"1px solid #ccc",
                            // borderBottom: "1px solid #ccc",
                          }}
                        >
                          {grp.name}
                        </th>
                      ))}
                    </tr>
                  )}

                  {/* NORMAL HEADER ROW */}
                  <tr>
                    {theadData
                      ?.filter((val) => val?.isVisible !== false)
                      ?.map((headData, index) => (
                        <th
                          key={index}
                          style={{
                            width: headData?.width || "",
                            textAlign: headData?.textAlign || "",
                          }}
                        >
                          {headData?.type === "" && headData?.name}

                          {headData?.type === "N" && (
                            <span
                              className="pointer-cursor"
                              onClick={() => handleSortTable(index, "ASC")}
                            >
                              {headData?.name}
                              <SortSVGIcon />
                            </span>
                          )}

                          {headData?.type === "ASC" && (
                            <span
                              className="pointer-cursor"
                              onClick={() => handleSortTable(index, "DESC")}
                            >
                              {headData?.name}
                              <IncreaseIngSortSVGIcon />
                            </span>
                          )}

                          {headData?.type === "DESC" && (
                            <span
                              className="pointer-cursor"
                              onClick={() => handleSortTable(index, "ASC")}
                            >
                              {headData?.name}
                              <DecreaseIngSortSVGIcon />
                            </span>
                          )}
                        </th>
                      ))}
                  </tr>
                </thead>
                {bodyData?.length > 0 ? (
                  <tbody style={{ backgroundColor: "white" }}>
                    {bodyData?.map((ele, index) => {
                      const keys = Object.keys(ele).filter(
                        (key) =>
                          key !== "colorcode" &&
                          key !== "isVisible" &&
                          key !== "_subRow"
                      );

                      // && isVisible
                      const rowColor = ele.colorcode || "";
                      // console.log(rowColor)
                      return (
                        <React.Fragment key={index}>
                          {/* MAIN ROW */}
                          <tr
                            className={
                              getRowClass ? getRowClass(ele, index) : ""
                            }
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
                                className={
                                  handleClassOnRow
                                    ? handleClassOnRow(
                                        ele,
                                        theadData[inx]?.name
                                          ? theadData[inx]?.name
                                          : theadData[inx],
                                        inx,
                                        index
                                      )
                                    : "px-2"
                                }
                              >
                                {ele[bodyData]?.label
                                  ? ele[bodyData]?.label
                                  : ele[bodyData] ?? <>&nbsp;</>}
                                {isMobile && <>&nbsp;</>}
                              </td>
                            ))}
                          </tr>

                          {/* EXPANDABLE SUB ROW */}
                          {ele?._subRow?.isopen && (
                            <tr className="sub-row nestedTable">
                              <td colSpan={keys.length} className="">
                                {isHeader && (
                                  <Heading
                                    title={headerTitle}
                                    isBreadcrumb={false}
                                  />
                                )}
                                <HisTable
                                  thead={ele._subRow.secondThead}
                                  tbody={ele._subRow.subRowList}
                                  removeHeaderSpace
                                  tableHeight={"tableHeight"}
                                  getRowClass={ele?._subRow?.colorCode}
                                />
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      );
                    })}
                  </tbody>
                ) : (
                  <td colSpan="200" className="text-center">
                    {" "}
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

export default GroupTable;
