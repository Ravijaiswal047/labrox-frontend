import React from "react";

const RadioInput = ({
  label,
  id,
  className,
  onChange,
  value,
  inputType = "radio",
  respclass,
  name,
  color,
  disabled,
  checked,
  onclick,
}) => {
  return (
    <div className={respclass}>
      <div className="fitContent">
        <input
          id={id}
          name={name}
          value={value}
          onChange={onChange}
          checked={checked}
          type={inputType}
          respclass={respclass}
          disabled={disabled}
          onClick={onclick}
          // className="mx-2"
        />
        <label htmlFor={id} className={`${color} mr-2`}>
          {label}
        </label>
      </div>
    </div>
  );
};

export default RadioInput;
