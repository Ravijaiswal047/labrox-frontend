import { useTranslation } from "react-i18next";
import "./NextGenInput.css";

/**
 * NextGen replacement for components/formComponent/Input.jsx.
 * Keeps the `lable` prop name (not a typo we introduced) so existing call
 * sites can switch from <Input> to <NextGenInput> without a prop rename.
 */
export default function NextGenInput({
  type = "text",
  name,
  className = "",
  respclass = "",
  id,
  placeholder,
  lable,
  value,
  onChange,
  onBlur,
  onFocus,
  onKeyDown,
  onPaste,
  onInput,
  required = false,
  disabled = false,
  readOnly = false,
  inputRef,
  removeFormGroupClass = false,
  max,
  min,
  maxLength,
  tabIndex,
  autocomplete = "off",
  ariaInvalid,
  ariaDescribedBy,
}) {
  const { t } = useTranslation();

  const field = (
    <div className="ng-input__field">
      <input
        ref={inputRef}
        type={type}
        id={id}
        name={name}
        className={`ng-input__control ${className}`}
        placeholder={t(placeholder) || " "}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        onFocus={onFocus}
        onKeyDown={onKeyDown}
        onPaste={onPaste}
        onInput={onInput}
        required={required}
        disabled={disabled}
        readOnly={readOnly}
        max={max}
        min={min}
        maxLength={maxLength}
        tabIndex={tabIndex}
        autoComplete={autocomplete}
        aria-invalid={ariaInvalid ? "true" : undefined}
        aria-required={required ? "true" : undefined}
        aria-describedby={ariaDescribedBy}
      />
      {lable && (
        <label htmlFor={id} className="ng-input__label">
          {t(lable)}
          {required ? (
            <span className="required requiredlabel" aria-hidden="true">
              {" "}
              *
            </span>
          ) : null}
        </label>
      )}
    </div>
  );

  if (removeFormGroupClass) return field;

  return <div className={`ng-input ${respclass}`}>{field}</div>;
}
