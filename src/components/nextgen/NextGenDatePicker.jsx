import { useEffect, useRef } from "react";
import { Calendar } from "primereact/calendar";
import { useTranslation } from "react-i18next";
import { useNgModeClass } from "@app/utils/hooks/useNgModeClass";
import { parseTypedDate } from "../../utils/validations/validationHelpers";
import "./NextGenDatePicker.css";

/**
 * NextGen replacement for components/formComponent/DatePicker.jsx.
 * Same onChange(value, name) contract, PrimeReact Calendar under the hood.
 */
export default function NextGenDatePicker({
  name,
  className = "",
  respclass = "",
  id,
  placeholder,
  lable,
  value,
  onChange,
  tabIndex,
  removeFormGroupClass = false,
  maxDate,
  minDate,
  disabled = false,
  onKeyDown,
  showOnFocus = false,
  view = "date",
  dateFormat = "dd-M-yy",
  invalid = false,
  inputClassName = "",
  parseDateTime: parseDateTimeProp,
}) {
  const { t } = useTranslation();
  const calendarRef = useRef(null);
  const ngModeClass = useNgModeClass();
  const onChangeRef = useRef(onChange);
  const nameRef = useRef(name);
  onChangeRef.current = onChange;
  nameRef.current = name;

  const parseDateTime = (text) => {
    if (parseDateTimeProp) {
      return parseDateTimeProp(text);
    }
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
      nextValue = parseTypedDate(nextValue) || parseTypedDate(document.getElementById(id)?.value);
    }
    if (nextValue instanceof Date && !Number.isNaN(nextValue.getTime())) {
      nextValue.setHours(12, 0, 0, 0);
      onChange(nextValue, name);
      return;
    }
    const typedText = String(document.getElementById(id)?.value || rawValue || "").trim();
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
    const input = id ? document.getElementById(id) : null;
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
    const input = id ? document.getElementById(id) : null;
    if (!input) {
      return;
    }
    if (invalid) {
      input.setAttribute("aria-invalid", "true");
      input.setAttribute("aria-describedby", `${id}-error`);
    } else {
      input.removeAttribute("aria-invalid");
      input.removeAttribute("aria-describedby");
    }
  }, [invalid, id, value]);

  const field = (
    <div className="ng-date__field">
      <Calendar
        ref={calendarRef}
        inputId={id}
        showIcon
        placeholder={placeholder || "DD/MM/YYYY"}
        className={`ng-date__control ${className}`}
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
        showOnFocus={showOnFocus}
        tabIndex={tabIndex || "0"}
        onKeyDown={onKeyDown}
        onFocus={(e) => e.target.select()}
        view={view}
        selectOtherMonths
        appendTo={document.body}
        panelClassName={`ng-date__panel ${ngModeClass}`}
        inputClassName={`${inputClassName} ${invalid ? "error border-danger" : ""}`}
      />
      {lable && (
        <label htmlFor={id} className="ng-date__label">
          {t(lable)}
        </label>
      )}
    </div>
  );

  if (removeFormGroupClass) return field;

  return <div className={`ng-date ${respclass}`}>{field}</div>;
}
