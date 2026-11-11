import React from "react";

const TableFilterDot = ({ color, bgColor, onClick, title, className }) => {
  return (
    <>
      <div
        onClick={onClick}
        style={{ gap: "0px" }}
        className={`${className} d-flex rounded justify-content-end pointer-cursor`}
      >
        <div
          style={{ backgroundColor: bgColor, gap: "2px" }}
          className="d-flex align-items-center rounded px-1"
        >
          <div
            style={{
              backgroundColor: color || "#ebebebbf",
              width: "12px",
              height: "12px",
              borderRadius: "50%",
              border: "none", // <-- Explicitly remove any border
            }}
          />
          <span>{title}</span>
        </div>
      </div>
    </>
  );
};
export default TableFilterDot;
