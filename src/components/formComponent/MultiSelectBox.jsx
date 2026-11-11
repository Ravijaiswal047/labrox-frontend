import React, { useState, useEffect, useTransition } from "react";
import { useTranslation } from "react-i18next";
import { MultiSelect } from "react-multi-select-component";

export const SelectBoxWithCheckbox = ({
  isDisabled,
  name,
  options,
  value,
  onChange,
  className,
  depends,
  lable,
  label,
  id,
  autoSelectFirst = false,
}) => {
  const [data, setData] = useState([]);
  const { t } = useTranslation();

  useEffect(() => {
    // 🔹 Case 1: value exists
    if (value !== undefined && value !== null && value.length > 0) {
      let array1 = [];

      if (typeof value === "string") {
        array1 = value.split(",");
      } else {
        array1 = value;
      }

      const result = options.filter((o1) =>
        array1.some((o2) => o1.value == o2)
      );

      setData(result);
      depends?.(result);
      return; // 👈 IMPORTANT
    }

    // 🔹 Case 2: auto select first option
    if (autoSelectFirst && options.length > 0) {
      const firstOption = [options[0]];
      setData(firstOption);
      onChange(firstOption, name);
      depends?.(firstOption);
      return;
    }

    // 🔹 Case 3: nothing selected
    setData([]);
  }, [options, value, autoSelectFirst]);


  return (
    <div className="form-group">
      <MultiSelect
        options={options}
        disabled={isDisabled}
        onChange={(e) => {
          onChange(e, name);
          setData(e);
        }}
        labelledBy="Select"
        value={data}
        className={className}
        overrideStrings={{
          selectSomeItems: label ?? "Select...",
        }}
        style={{
          background: isDisabled ? "gray" : "",
          cursor: isDisabled ? "not-allowed" : "",
        }}
      />
      <label htmlFor={id} className="floating-label">
        {t(lable)}
      </label>
    </div>
  );
};
