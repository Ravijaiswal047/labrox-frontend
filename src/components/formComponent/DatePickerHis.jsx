import React from "react";
import { Calendar } from "primereact/calendar";
import moment from "moment";

function DatePickerHis({
  name,
  className,
  respclass,
  id,
  placeholder,
  lable,
  value,
  handleChange,
  tabIndex,
  inputClassName,
  removeFormGroupClass,
  maxDate,
  minDate,
  disable,
  viewDate,
  handleSelect,
  isRange = false,
  showIcon = true,

  showTime = false,
  timeOnly = false,
  hourFormat = "12",
  showSeconds = false
}) {
  // PrimeReact expects this format for display
  const primeDateFormat = "dd/M/yy";

  // Use moment for parsing typed input
  const handleManualInput = (e) => {
    const manualInput = e.target.value;

    // Match the format you expect users to type: "DD/MM/YYYY"
    const parsed = moment(manualInput, "DD/MM/YYYY", true); // true = strict parsing

    if (parsed.isValid()) {
      // Return value as a native Date object (same as calendar pick)
      handleChange({ target: { name, value: parsed.toDate() } });
    } else {
      console.warn("Invalid date format entered:", manualInput);
      // Optional: add custom invalid-date handling here
    }
  };

  return (
    <div className={respclass} style={{ position: "relative" }}>
      <div className={removeFormGroupClass ? "" : "form-group"}>
        <Calendar
          inputId={id}
          showIcon={showIcon}
          placeholder={placeholder || "DD/MM/YYYY"}
          className={className}
          dateFormat={primeDateFormat} // PrimeReact format (not moment)
          view={viewDate || "date"}
          value={value && String(value) !== "Invalid Date" ? value : null}
          name={name}
          maxDate={maxDate}
          onInput={isRange ? undefined : handleManualInput}
          minDate={minDate}
          disabled={disable}
          selectionMode={isRange ? "range" : "single"}
          onChange={handleChange}
          onSelect={handleSelect}
          inputClassName={`${inputClassName} custom-date-input`} // Apply custom class to the input elementinputClassName}
          tabIndex={tabIndex || "-1"}
          // showTime={showTime}
          hourFormat={hourFormat}
          // inputClassName="custom-date-input"
        />

        {lable && (
          <label
            htmlFor={id}
            className="labelPicker lable truncate his-datepicker_label"
            style={{ fontSize: "5px !important" }}
          >
            {lable}
          </label>
        )}
      </div>
    </div>
  );
}

export default DatePickerHis;