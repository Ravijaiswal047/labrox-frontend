import React, { useRef } from "react";
import defaultFilterIcon from "../../assets/image/filterIcon.png";
import "./FilterInput.css";

const FilterInput = ({
  placeholder = "Search...",
  value,
  onChange,
  width = "200px",
  icon = defaultFilterIcon,
  className = "",
  inputClass="",
}) => {
  const inputRef = useRef(null);

  const handleFocus = () => {
    inputRef.current?.focus();
  };

  return (
    <div
      className={`filter-input-wrapper ${className}`}
      onClick={handleFocus}
      style={{ width }}
    >
      {icon && <img src={icon} alt="filterIcon" />}
      <input
        ref={inputRef}
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className={`${inputClass}`}
      />
    </div>
  );
};

export default FilterInput;
