import React from "react";
import { Tooltip } from "primereact/tooltip";
import { useTranslation } from "react-i18next";
import './CustomSelectBox.css';

export const CustomSelectBox = ({
  options = [],
  id,
  name,
  onChange,
  selectedValue,
  label,
  className = "",
  isDisabled = false,
  tabIndex
}) => {
  const { t } = useTranslation();

  return (
    <>
      {label && <Tooltip target={`#${id}`} position="top" content={t(label)} />}

      <div className="form-group mb-0">
        <select
          className={`form-control custominputbox select-focus mb-0 ${className}`}
          id={id}
          name={name}
          value={selectedValue}
          disabled={isDisabled}
          onChange={onChange}
          tabIndex={tabIndex}
        >
          {options?.map((ele, index) => (
            <option
              key={index}
              value={ele?.value}
              style={{
                ...ele?.style,
                borderBottom: "1px solid #ddd",
                padding: "3px 2px",
              }}
            >
              {t(ele?.label)}
            </option>
          ))}
        </select>

        {label && (
          <label htmlFor={id} className="lable truncate">
            {t(label)}
          </label>
        )}
      </div>
    </>
  );
};