import React, { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import { Tooltip } from "primereact/tooltip";
import NextGenInput from "@components/nextgen/NextGenInput";
import './Input.css'

function Input({
  type,
  name,
  className,
  respclass,
  id,
  placeholder,
  lable,
  value,
  onKeyDown,
  onPaste,
  required,
  display,
  onChange,
  disabled,
  readOnly,
  defaultValue,
  onBlur,
  onFocus,
  inputRef,
  removeFormGroupClass,
  onInput,
  max,
  min,
  key,
  showTooltipCount,
  maxLength,
  tabIndex,
  placeholderLabel,
  autocomplete = 'off',
  hideTooltip = false,
  ariaInvalid,
  ariaDescribedBy
}) {
  const [t] = useTranslation();
  const { uiMode } = useSelector((state) => state?.loadingSlice) || {};

  if (uiMode === "nextgen") {
    return (
      <NextGenInput
        type={type}
        name={name}
        className={className}
        respclass={respclass}
        id={id}
        placeholder={placeholder}
        lable={lable}
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
        inputRef={inputRef}
        removeFormGroupClass={removeFormGroupClass}
        max={max}
        min={min}
        maxLength={maxLength}
        tabIndex={tabIndex}
        autocomplete={autocomplete}
        ariaInvalid={ariaInvalid}
        ariaDescribedBy={ariaDescribedBy}
      />
    );
  }

  return (
    <>
      {!hideTooltip && (
      <Tooltip
        target={`#${id}`}
        position="top"
        content={
          lable
            ? `${t(lable)} ${
                showTooltipCount
                  ? `Count : ${value ? String(value).length : "0"}`
                  : ""
              }`
            : ""
        }
        event="focus"
        className="ToolTipCustom"
      />
      )}

      <div className={`${respclass} custominputbox mb-0`}>
        {/* <div className={!isFromGroup ? "" : "form-group"}> */}
        <div className={removeFormGroupClass ? "" : "form-group"}>
          <input
            type={type}
            className={`${className}  form-control select-focus`}
            id={id}
            name={name}
            placeholder={t(placeholder)}
            value={value}
            onKeyDown={onKeyDown}
            key={key}
            onPaste={onPaste}
            onChange={onChange}
            autoComplete={autocomplete}
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck={false}
            step={type === "number" ? "0.01" : ""}
            required={required}
            ref={inputRef}
            onBlur={onBlur}
            onFocus={onFocus}
            max={max}
            min={min}
            style={{ textAlign: display ?? "left" }}
            onInput={onInput}
            disabled={disabled ? true : false}
            tabIndex={tabIndex}
            readOnly={readOnly}
            maxLength={maxLength}
            aria-invalid={ariaInvalid ? "true" : undefined}
            aria-required={required ? "true" : undefined}
            aria-describedby={ariaDescribedBy}
            onWheel={(e) => e?.target?.blur()}
          />
          {lable && (
            <label htmlFor={id} className="lable truncate customINputLabel">
              {t(lable)}
              {required ? (
                <span className="required requiredlabel" aria-hidden="true">
                  {" "}
                  *
                </span>
              ) : null}
            </label>
          )}
          <span className="placeholderLabel"> {placeholderLabel} </span>
        </div>
      </div>
    </>
  );
}

export default Input;
