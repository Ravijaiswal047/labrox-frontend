import { Tooltip } from "primereact/tooltip";

import { useTranslation } from "react-i18next";
export const SelectBox = ({
  isDisabled,
  options,
  id,
  name,
  onChange,
  className,
  selectedValue,
  keyEvent,
  onKeyPress,
  lable,
  onKeyDown,
  isShowBorder = true,
  tabIndex,
}) => {
  const [t] = useTranslation();
  return (
    <>
      {" "}
      <Tooltip target={`#${id}`} position="top" content={t(lable)} />
      <div className="form-group mb-0">
        <select
          className={`form-control  ${className} custominputbox select-focus mb-0`}
          value={
            selectedValue && typeof selectedValue === "object"
              ? selectedValue.value ?? ""
              : selectedValue ?? ""
          }
          disabled={isDisabled}
          name={name}
          id={id}
          tabIndex={tabIndex}
          onChange={onChange}
          onKeyDown={(e) => {
            // Prefer explicit onKeyDown prop if provided (used by parent components
            // to implement custom tab/shift+tab focus handling). Fall back to
            // legacy keyEvent/onKeyPress behavior when onKeyDown isn't passed.
            if (typeof onKeyDown === "function") {
              return onKeyDown(e);
            }
            if (keyEvent && typeof onKeyPress === "function") {
              return onKeyPress(e, name);
            }
          }}
        >
          {options?.map((ele, index) => (
            <option
              key={index}
              value={ele?.value}
              className={`Status-${ele?.status && ele?.value} p-0 m-0 mt-0`}
              style={
                selectedValue == ele?.value
                  ? {
                      background: "lightblue",
                      borderBottom: "1px solid #ddd",
                      padding: "2px 2px",
                    }
                  : {
                      borderBottom: "1px solid #ddd",
                      padding: "3px 2px",
                    }
              }
            >
              {t(ele?.label)}
            </option>
          ))}
        </select>
        {lable && lable !== "" && (
          <label htmlFor={id} className="lable truncate ">
            {t(lable)}
          </label>
        )}
      </div>
    </>
  );
};
