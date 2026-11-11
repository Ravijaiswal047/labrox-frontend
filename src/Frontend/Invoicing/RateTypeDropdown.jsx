import React, { useState, useRef, useEffect } from "react";

const RateTypeDropdown = ({ data = [] }) => {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef();

  // Close dropdown if clicked outside
  console.log("data", data);
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (value) => {
    console.log("Selected:", value);
    setOpen(false); // close after selection
  };

  return (
    <td data-title="RateType Name" style={{ position: "relative" }}>
      <i
        className="bi bi-printer-fill"
        style={{ cursor: "pointer" }}
        onClick={() => setOpen(!open)}
      ></i>

      {open && (
        <div
          ref={dropdownRef}
          style={{
            position: "absolute",
            top: "100%",
            left: 0,
            background: "white",
            border: "1px solid #ccc",
            borderRadius: "4px",
            zIndex: 10,
            width: "100px",
          }}
        >
          <div
            style={{ padding: "5px 10px", cursor: "pointer" }}
            onClick={() => handleSelect("Active")}
          >
            Active
          </div>
          <div
            style={{ padding: "5px 10px", cursor: "pointer" }}
            onClick={() => handleSelect("InActive")}
          >
            InActive
          </div>
        </div>
      )}
    </td>
  );
};

export default RateTypeDropdown;
