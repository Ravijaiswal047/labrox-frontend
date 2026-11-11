import React from "react";

const RadioInput = ({
  label,
  className,
  type = "radio",
  checked,
  id='',
  onChange,
  name,
}) => {
  return (
    <div className={className}>
      <input
        type={type}
        checked={checked}
        onChange={onChange}
        className="mt-1"
        name={name}
        id={id}
      />
      <label htmlFor={id} className="m-0 mx-2">{label}</label>
    </div>
  );
};

export default RadioInput;
