import React from "react";

const TableFilterDot = ({color, bgColor, onClick, title, className}) => {
  return (
    <>
      <div
        onClick={onClick}
        style={{ gap: "4px" }}
        className={`${className} d-flex justify-content-end pb-1 pointer-cursor`}
      >
        <div style={{backgroundColor: bgColor, gap:'4px'}} className="dot_filter p-1 d-flex align-items-center px-1">
          <div className="border" style={{backgroundColor: color, width:'15px', height:'15px', borderRadius:'50%'}} />
          <span>{title}</span>
        </div>
      </div>
    </>
  );
};
export default TableFilterDot;
