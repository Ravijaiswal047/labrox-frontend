import React, { useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import { Calendar } from "primereact/calendar";
import { Tooltip } from "primereact/tooltip";
import { useTranslation } from "react-i18next";
import NextGenDatePicker from "../nextgen/NextGenDatePicker";
import { parseTypedDate } from "../../utils/validations/validationHelpers";

function DatePicker({
  name,
  className,
  respclass,
  id,
  placeholder,
  lable,
  value,
  onChange,
  tabIndex,
  inputClassName,
  removeFormGroupClass,
  maxDate,
  minDate,
  disabled,
  onKeyDown,
  showOnFocus = false,
  view = "date",
  dateFormat = "dd-M-yy",
  invalid = false,
}) {
  const [t] = useTranslation();
  const { uiMode } = useSelector((state) => state?.loadingSlice) || {};
  const calendarWrapperRef = useRef(null);
  const calendarRef = useRef(null);
  const onChangeRef = useRef(onChange);
  const nameRef = useRef(name);
  onChangeRef.current = onChange;
  nameRef.current = name;

  const getCalendarInput = () =>
    calendarWrapperRef.current?.querySelector("input") ||
    (id ? document.getElementById(id) : null);

  const parseDateTime = (text) => {
    const parsed = parseTypedDate(text);
    if (!parsed) {
      throw new Error("Invalid date");
    }
    parsed.setHours(12, 0, 0, 0);
    return parsed;
  };

  const handleDateChange = (e) => {
    const rawValue = e?.target?.value ?? e?.value;
    let nextValue = rawValue;
    if (!(nextValue instanceof Date)) {
      nextValue = parseTypedDate(nextValue) || parseTypedDate(getCalendarInput()?.value);
    }
    if (nextValue instanceof Date && !Number.isNaN(nextValue.getTime())) {
      nextValue.setHours(12, 0, 0, 0);
      onChange(nextValue, name);
      return;
    }
    const typedText = String(getCalendarInput()?.value || rawValue || "").trim();
    if (typedText) {
      return;
    }
    onChange(null, name);
  };

  const emitTypedDate = (rawValue) => {
    const parsed = parseTypedDate(rawValue);
    if (!parsed) {
      return;
    }
    parsed.setHours(12, 0, 0, 0);
    onChangeRef.current(parsed, nameRef.current);
  };

  const handleTypedInput = (e) => {
    emitTypedDate(e?.target?.value);
  };

  useEffect(() => {
    const input =
      calendarWrapperRef.current?.querySelector("input") ||
      (id ? document.getElementById(id) : null);
    if (!input) {
      return;
    }
    const onNativeInput = (e) => emitTypedDate(e?.target?.value);
    input.addEventListener("input", onNativeInput);
    input.addEventListener("change", onNativeInput);
    return () => {
      input.removeEventListener("input", onNativeInput);
      input.removeEventListener("change", onNativeInput);
    };
  }, [id]);

  useEffect(() => {
    const input =
      calendarWrapperRef.current?.querySelector("input") ||
      (id ? document.getElementById(id) : null);
    if (!input) {
      return;
    }
    if (invalid) {
      input.setAttribute("aria-invalid", "true");
      if (id) {
        input.setAttribute("aria-describedby", `${id}-error`);
      }
    } else {
      input.removeAttribute("aria-invalid");
      input.removeAttribute("aria-describedby");
    }
  }, [invalid, id, value]);

  const handleInputClick = (e) => {
    if (calendarRef.current && !calendarRef.current.panel?.offsetParent) {
      calendarRef.current.show();
    }
  };

  const handleMonthChange = () => {
    if (calendarRef.current) {
      calendarRef.current.show();
    }
  };

  const handleYearChange = () => {
    if (calendarRef.current) {
      calendarRef.current.show();
    }
  };

  //   const moveCursorToEnd = (e) => {
  //   const input = e.target;
  //   if (input && input.setSelectionRange) {
  //     const length = input.value.length;
  //     // move caret to end of input
  //     setTimeout(() => {
  //       input.setSelectionRange(length, length);
  //     }, 0);
  //   }
  // };
  const moveCursorToStart = (e) => {
    // const input = e.target;
    // if (input && input.setSelectionRange) {
    //   // Move caret to start (position 0)
    //   setTimeout(() => {
    //     input.setSelectionRange(2, 0);
    //   }, 0);
    // }
    const input = e.target;
    if (input && input.value && input.setSelectionRange) {
      // Find the position of the first separator (e.g., "/", "-", ".")
      const separators = ['/', '-', '.'];
      const firstSeparatorIndex = separators
        .map((sep) => input.value.indexOf(sep))
        .find((idx) => idx > 0);

      const position = firstSeparatorIndex > 0 ? firstSeparatorIndex : 2;

      // Move cursor right after the day segment
      setTimeout(() => {
        input.setSelectionRange(position, position);
      }, 0);
    }
  };

  const toSafeDate = (val) => {
    if (!val) return null;
    if (val instanceof Date) return isNaN(val.getTime()) ? null : val;
    const d = new Date(val);
    return isNaN(d.getTime()) ? null : d;
  };

  const safeValue = toSafeDate(value);
  const safeMinDate = toSafeDate(minDate) || undefined;
  const safeMaxDate = toSafeDate(maxDate) || undefined;

  // After every hook above (not an early return before them), so hook
  // count/order stays identical across renders even if uiMode flips while
  // this component is mounted.
  if (uiMode === "nextgen") {
    return (
      <NextGenDatePicker
        name={name}
        className={className}
        respclass={respclass}
        id={id}
        placeholder={placeholder}
        lable={lable}
        value={safeValue}
        onChange={onChange}
        tabIndex={tabIndex}
        removeFormGroupClass={removeFormGroupClass}
        maxDate={safeMaxDate}
        minDate={safeMinDate}
        disabled={disabled}
        onKeyDown={onKeyDown}
        showOnFocus={showOnFocus}
        view={view}
        dateFormat={dateFormat}
        invalid={invalid}
        inputClassName={inputClassName}
        parseDateTime={parseDateTime}
      />
    );
  }

  return (
    <>
      <Tooltip target={`#${id}`} position="top" content={t(lable)} />
      <div className={respclass} style={{ position: "relative" }}>
        <div
          className={removeFormGroupClass ? "" : "form-group"}
          ref={calendarWrapperRef}
        >
          <Calendar
            ref={calendarRef}
            inputId={id}
            showIcon
            placeholder="DD/MM/YYYY"
            className={className}
            dateFormat={dateFormat}
            value={safeValue}
            name={name}
            maxDate={safeMaxDate}
            minDate={safeMinDate}
            disabled={disabled}
            onChange={handleDateChange}
            onInput={handleTypedInput}
            onBlur={handleTypedInput}
            parseDateTime={parseDateTime}
            keepInvalid
            onMonthChange={handleMonthChange}
            onYearChange={handleYearChange}
            wrapperClassName="datepicker"
            inputClassName={`${inputClassName || ""} form-control select-focus ${invalid ? "error border-danger" : ""}`}
            showOnFocus={showOnFocus}
            tabIndex={tabIndex || "0"}
            onClick={handleInputClick}
            onKeyDown={onKeyDown}
            onFocus={(e) => e.target.select()}
            view={view}
            selectOtherMonths
          />
          {lable && (
            <label
              htmlFor={id}
              className="label lable truncate"
              style={{ fontSize: "5px !important" }}
            >
              {t(lable)}
            </label>
          )}
        </div>
      </div>
    </>
  );
}

export default DatePicker;
