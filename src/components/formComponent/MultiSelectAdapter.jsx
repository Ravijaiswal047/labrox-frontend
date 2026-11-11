// Adapter Component
import React from "react";
import MultiSelectComp from "./MultiSelectComp";

const MultiSelectAdapter = ({
  options,
  value,
  onChange,
  name,
  lable, // just to keep API same
  id,
  placeholder,
  className,
  isDisabled,
}) => {
  return (
    <MultiSelectComp
      dynamicOptions={options} // map SelectBoxWithCheckbox `options`
      value={value} // same
      handleChange={(field, val) => onChange(val, name)}
      name={name}
      placeholderName={placeholder || lable}
      respclass={className}
      requiredClassName={isDisabled ? "disabled" : ""}
    />
  );
};

export default MultiSelectAdapter;
