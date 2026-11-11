import React from "react";

const Checkbox = ({
  id,
  label,
  name,
  checked,
  onChange,
  disabled = false,
  className = "",
  respClass = "",
  removeSpacing = false
}) => {
  return (
    <div className={respClass}>
      <div className={`p-0 px-2 ${removeSpacing ? "" : "mb-"}`} style={{ border: "1px solid #ccc", borderRadius: "5px" }}>
        {/* <div className="form-check">
                <input className="form-check-input" type="checkbox" value="" id="flexCheckDefault" />
                <label className="form-check-label" htmlFor="flexCheckDefault">
                    {field?.lable}
                </label>
            </div> */}
        <input
          id={id}
          type="checkbox"
          className="table-checkbox"
          style={{
            position: "absolute",
            marginTop: ".4rem",
            marginLeft: "0rem"
          }}
          checked={checked}
          disabled={disabled}
          onChange={(e) => onChange(name, e.target.checked)}
        />
        <label
          id={id}
          htmlFor={id}
          className={`flex ml-3 items-center gap-2 cursor-pointer ${disabled ? "opacity-50 cursor-not-allowed" : ""
            } ${className}`}
        >
          <span style={{ fontSize: "1rem", fontWeight: "500", marginLeft: "4px" }}>{label}</span>
        </label>
      </div>
    </div>
  );
};

export default Checkbox;
