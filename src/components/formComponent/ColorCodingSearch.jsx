import React from "react";

const ColorCodingSearch = ({ color, label, onClick, marginRight, cursor }) => {
  return (
    // <div className="d-flex align-items-center" onClick={onClick}>
    <div
      className="d-flex align-items-center justify-content-start justify-content-md-end py-1"
      onClick={onClick}
    >
      <div
        style={{
          width: "14px",
          height: "14px",
          borderRadius: "50%",
          border: "1px solid #a7a7a7",
          backgroundColor: color,
          marginRight: marginRight,
          cursor: cursor,
        }}
        className={color}
      ></div>
      <label className="m-0 mx-1 text-nowrap">{label}</label>
    </div>
  );
};

export default ColorCodingSearch;
