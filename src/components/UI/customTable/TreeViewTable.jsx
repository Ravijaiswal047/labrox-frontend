import React, { useEffect, useRef, useState } from "react";
import { ArrowDownIconSVG, ArrowRightIconSVG } from "../../SvgIcons";

function TreeViewTable({
  thead,
  tbody,
  isSNo,
  isTreeOpen,
  handleClick,
  handleDoubleClick,
  style,
  scrollView,
  tableHeight,
  isRemoveArrow = true,
  isShowBorder,
  onReorder,
  isShowLastNode=false
}) {

  // in tbody array of object and make sure object must have three key id,groupName and children
  let SNo = 0;

  const [data, setData] = useState(tbody || []);
  const [expanded, setExpanded] = useState({});
  const [dragPath, setDragPath] = useState(null);

  useEffect(() => {
    setData(tbody || []);
  }, [tbody]);

  let obj = {};
  const openTree = (data) => {
    data?.map((val) => {
      if (val?.children?.length > 0) {
        obj[val?.id] = true;
        openTree(val?.children);
      }
      setExpanded(obj);
    });
  };
  useEffect(() => {
    if (data?.length === 0) {
      setExpanded({});
    }
    if (isTreeOpen) {
      openTree(data);
    }
  }, [data, isTreeOpen]);

  const handleDragStart = (item) => {
    setDragPath(item);
  };

  const handleDrop = (e, dropPath, itemID) => {
    e.preventDefault();
    if (!dragPath) return;
    onReorder && onReorder(dragPath, itemID);
    setDragPath(null);
  };

  const toggleExpand = (id) => {
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const renderRows = (items, level = 0, parentPath = []) => {
    return items.map((item, index) => {
      const currentPath = [...parentPath, index]; // ⬅️ path of this node
      const keys = Object.keys(item)?.filter((key) => key !== "children");
      SNo += 1;

      return (
        <React.Fragment key={item?.id}>
          <tr
            className="border-b"
            id={item?.id}
            draggable // ⬅️ make row draggable
            onDragStart={() => handleDragStart(item?.id)}
            onDragOver={(e) => e.preventDefault()} // ⬅️ allow drop
            onDrop={(e) => handleDrop(e, currentPath, item?.id)}
            onDoubleClick={()=>{handleDoubleClick&&handleDoubleClick(item, index)}}
          >
            {keys?.map((bodyData, inx) => {
              if (bodyData !== "groupName") {
                if (isSNo && bodyData === "id") {
                  return (
                    <React.Fragment key={bodyData + inx}>
                      <td className="flex items-center px-2">
                        {item?.id?.length === 1 ? <strong>{SNo}</strong> : SNo}
                      </td>
                      <td
                        className="flex items-center"
                        onClick={
                          handleClick
                            ? () => handleClick(item, bodyData, index)
                            : undefined
                        }
                      >
                        {item?.id?.length === 1 ? (
                          <strong>{item[bodyData]}</strong>
                        ) : (
                          item[bodyData]
                        )}
                      </td>
                    </React.Fragment>
                  );
                } else {
                  return (
                    <td
                      className="flex items-center"
                      key={bodyData + inx}
                      onClick={
                        handleClick
                          ? () => handleClick(item, bodyData, index)
                          : undefined
                      }
                    >
                      {item?.groupName?.isHideId &&
                      bodyData === "id" ? null : item?.id?.length === 1 ? (
                        <strong>{item[bodyData]}</strong>
                      ) : (
                        item[bodyData]
                      )}
                    </td>
                  );
                }
              } else {
                return (
                  <td className="flex items-center" key={bodyData + inx}>
                    <div
                      style={{
                        paddingLeft: `${level * 30}px`,
                        marginBottom: "0px",

                      }}
                    >
                      {isRemoveArrow ? (
                        item[bodyData] &&
                        item?.children?.length > 0 && (
                          <span
                            onClick={() => toggleExpand(item.id)}
                            className="mr-2 pointer-cursor no-print"
                          >
                     
                            
                            {expanded[item?.id] ? (
                              <span
                                onClick={
                                  handleClick
                                    ? () => handleClick(item, "close", index)
                                    : undefined
                                }
                              >
                                <ArrowDownIconSVG />
                              </span>
                            ) : (
                              <span
                                onClick={
                                  handleClick
                                    ? () => handleClick(item, "open", index)
                                    : undefined
                                }
                              >
                                <ArrowRightIconSVG />
                              </span>
                            )}
                          </span>
                        )
                      ) : (
                        <>
                          {(item?.children?.length > 0||(isShowLastNode && item?.groupName?.rowType!=="Total")) && (
                            <span
                            onClick={() => toggleExpand(item.id)}
                            className="mr-2 pointer-cursor no-print"
                            >
                              {expanded[item?.id] ? (
                                <span
                                  onClick={
                                    handleClick
                                      ? () => handleClick(item, "close", index)
                                      : undefined
                                  }
                                >
                                  <ArrowDownIconSVG />
                                </span>
                              ) : (
                                <span
                                  onClick={
                                    handleClick
                                      ? () => handleClick(item, "open", index)
                                      : undefined
                                  }
                                >
                                  <ArrowRightIconSVG />
                                </span>
                              )}
                            </span>
                          )}
                        </>
                      )}
                      <span
                        onClick={
                          handleClick
                            ? () => handleClick(item, bodyData, index)
                            : undefined
                        }
                        className={handleClick ? "pointer-cursor" : ""}
                      >
                        {item?.id?.length === 1 ? (
                          <strong>
                            {item[bodyData]?.name
                              ? item[bodyData]?.name
                              : item[bodyData]}
                          </strong>
                        ) : item[bodyData]?.name ? (
                          item[bodyData]?.name
                        ) : (
                          item[bodyData]
                        )}
                      </span>
                    </div>
                  </td>
                );
              }
            })}
          </tr>

          {item?.children?.length > 0 &&
            expanded[item?.id] &&
            renderRows(item?.children, level + 1, currentPath)}
        </React.Fragment>
      );
    });
  };

  return (
    <>
      {data?.length > 0 && (
        <div
          style={style}
          className={`${tableHeight} ${scrollView} custom-scrollbar TabScroll pb-2`}
        >
          <table
            className={`w-full mainTreeTable mainTable ${isShowBorder ? "mainTreeTableBorder" : ""}`}
            style={{ border: "none" }}
          >
            <thead id="treeviewTable">
              <tr className="bg-gray-200">
                {thead?.map((val) => (
                  <th
                    className="p-2"
                    key={val?.name || val}
                    style={{
                      width: val?.width ? val?.width : "",
                      textAlign: val?.textAlign ? val?.textAlign : "",
                    }}
                  >
                    {val?.name ? val.name : val}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>{renderRows(data)}</tbody>
          </table>
        </div>
      )}
    </>
  );
}

export default TreeViewTable;
