import { Tooltip } from "primereact/tooltip";
import React, { useState, useRef, useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import Select, { components } from "react-select";
import CreatableSelect from "react-select/creatable";
import { useLocalStorage } from "../../utils/hooks/useLocalStorage";
import NextGenSelect from "../nextgen/NextGenSelect";
const { ValueContainer, Placeholder } = components;

const CustomValueContainer = ({ children, ...props }) => (
  <ValueContainer {...props}>
    <Placeholder {...props} isFocused={props.isFocused} className="truncate">
      {props.selectProps.placeholder}
    </Placeholder>
    {React.Children.map(children, (child) =>
      child && child.type !== Placeholder ? child : null
    )}
  </ValueContainer>
);

const ReactSelect = ({
  placeholderName,
  searchable,
  defaultValue,
  respclass,
  id,
  onChange,
  value,
  className,
  dynamicOptions,
  name,
  inputId,
  isDisabled,
  removeIsClearable,
  ref,
  DropdownIndicator,
  tabIndex,
  onKeyDown,
  handleFormatlabel,
  isShowBorder = true,
  autoFocus = false,
  inputRef,
  label,
  autoComplete = "off",
  autoSelectFirst,
  tabSelectsFirst = false,
  filterOption,
  isLoading = false,
  isMulti = false,
  creatable = false,
  onCreateOption,
}) => {
  const [t] = useTranslation();
  const { uiMode } = useSelector((state) => state?.loadingSlice) || {};
  const selectRef = useRef(null);
  const menuIsOpenRef = useRef(false);
  const focusedOptionRef = useRef(null); // tracks which option react-select currently highlights
  const isMouseDown = useRef(false);

  // useEffect(() => {
  //   if (autoFocus && selectRef.current) {
  //     selectRef.current.focus();
  //   }
  // }, [autoFocus]);

  // const selectedOption = dynamicOptions?.find(
  //   (option) => String(option.value) === String(value)
  // );

  const selectedOption = isMulti
    ? (Array.isArray(value)
      ? dynamicOptions?.filter((option) =>
        value.map(String).includes(String(option.value))
      ) || []
      : [])
    : value === null || value === "" || value === undefined
      ? null
      : dynamicOptions?.find(
        (option) => String(option.value) === String(value)
      ) || null;


  useEffect(() => {
    if (autoFocus && selectRef.current) {
      if (typeof selectRef.current.focus === "function") {
        selectRef.current.focus();
      } else {
        const inputEl = document.querySelector(`#${id} input`);
        inputEl?.focus();
      }
    }
  }, [autoFocus, id]);

  const customStyles = {
    control: (base, state) => ({
      ...base,
      height: isMulti ? "auto" : "24px",
      minHeight: "24px !important",
      width: "100%",
      display: "flex",
      alignItems: "center",
      flexDirection: "row",
      flexWrap: isMulti ? "wrap" : "nowrap",
      boxShadow: state.isFocused ? "0 0 0 1px rgba(13, 13, 14, 0.5)" : "none",
      outline: state.isFocused ? "none" : "initial",
      whiteSpace: isMulti ? "normal" : "nowrap",
    }),
    placeholder: (defaultStyles, state) => {
      const isFloating = state.hasValue || state.selectProps.inputValue;
      return {
        ...defaultStyles,
        color: "none",
        position: "absolute",
        top: isFloating ? -13 : "",
        left: isFloating ? "10px" : defaultStyles.left,
        backgroundColor: isFloating ? "white" : "transparent",
        padding: isFloating ? "0px 2px" : "0",
        transition: "top 0.1s, font-size 0.1s",
        fontSize: isFloating ? "10px" : "12px",
        lineHeight: "18px",
        width: "auto",
        maxWidth: "80%",
        fontWeight: isFloating || state.selectProps.isFocused ? " 600" : "500",
        zIndex: 1,
      };
    },
    menu: (styles) => ({
      ...styles,
      width: "100%",
      fontSize: 12,
      padding: 0,
    }),
    option: (provided) => ({
      ...provided,
      padding: "5px 7px 5px 7px !important",
      borderBottom: "1px solid #ddd",
    }),
    menuList: (styles) => ({
      ...styles,
      width: "100%",
      fontSize: 12,
      padding: 0,
    }),
    container: (provided, state) => ({
      ...provided,
    }),
    valueContainer: (provided, state) => ({
      ...provided,
      overflow: "visible",
      whiteSpace: isMulti ? "normal" : "nowrap",
      display: "flex",
      flexWrap: isMulti ? "wrap" : "nowrap",
      alignItems: "center",
      padding: isMulti ? "3px 35px 3px 8px" : "0 35px 0 8px", // Room on the right for absolute indicators
      maxWidth: "100%",
      clipPath: isMulti ? "none" : "polygon(0% -200%, 100% -200%, 100% 200%, 0% 200%)",
    }),
    indicatorsContainer: (provided) => ({
      ...provided,
      height: "24px",
      position: "absolute",
      right: "0px",
      top: "0px",
      display: "flex",
      alignItems: "center",
      backgroundColor: "", // To ensure icons are readable over clipped text
      borderRadius: "0 4px 4px 0",
    }),
    singleValue: (provided) => ({
      ...provided,
      overflow: "hidden",
      textOverflow: "ellipsis",
      whiteSpace: "nowrap",
      maxWidth: "100%",
      minWidth: "0",
    }),
    input: (provided) => ({
      ...provided,
      margin: "0px",
      padding: "0px",
      maxWidth: "100%",
      minWidth: "0",
      overflow: "hidden",
    }),
    menuPortal: (base) => ({
      ...base,
      zIndex: 9999,
    }),
  };

  const CustomInput = ({ getDynamicClass, ...props }) => (
    <components.Input {...props} inputClassName={getDynamicClass()} autoComplete={autoComplete} />
  );

  const getDynamicClass = () => className;

  const DefaultDropdownIndicator = () => (
    <div className="custom-dropdown-indicator">
      {isLoading ? (
        <div
          className="spinner-border text-secondary"
          style={{ width: "12px", height: "12px", borderWidth: "2px" }}
          role="status"
        />
      ) : (
        removeIsClearable && (
          <svg
            height="20"
            width="20"
            viewBox="0 0 20 20"
            aria-hidden="true"
            focusable="false"
            className="css-tj5bde-Svg"
          >
            <path d="M4.516 7.548c0.436-0.446 1.043-0.481 1.576 0l3.908 3.747 3.908-3.747c0.533-0.481 1.141-0.446 1.574 0 0.436 0.445 0.408 1.197 0 1.615-0.406 0.418-4.695 4.502-4.695 4.502-0.217 0.223-0.502 0.335-0.787 0.335s-0.57-0.112-0.789-0.335c0 0-4.287-4.084-4.695-4.502s-0.436-1.17 0-1.615z"></path>
          </svg>
        )
      )}
    </div>
  );

  //   const handleKeyDown = (e) => {
  //   // Prevent backspace when input is at position 0 (start of input)
  //   if (e.key === "Backspace") {
  //     const inputElement = e.target;
  //     if (inputElement && inputElement.selectionStart === 0 && inputElement.selectionEnd === 0) {
  //       e.preventDefault();
  //       return;
  //     }
  //   }

  //   // Call the parent onKeyDown handler if provided
  //   if (onKeyDown) {
  //     onKeyDown(e);
  //   }
  // };


  const isMobile = window.innerWidth <= 800;
  let CustomComponent;

  // Stable custom Option that writes to focusedOptionRef whenever react-select highlights it
  const FocusTrackingOption = useMemo(() => {
    return ({ children, ...props }) => {
      if (props.isFocused) {
        focusedOptionRef.current = props.data;
      }
      return <components.Option {...props}>{children}</components.Option>;
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  if (isMobile) {
    CustomComponent = {
      ValueContainer: CustomValueContainer,
      DropdownIndicator: DefaultDropdownIndicator,
    };
  } else {
    CustomComponent = {
      ValueContainer: CustomValueContainer,
      Input: (props) => (
        <CustomInput {...props} getDynamicClass={getDynamicClass} />
      ),
      DropdownIndicator: DefaultDropdownIndicator,
    };
  }

  // When tabSelectsFirst, inject the focus-tracking Option
  if (tabSelectsFirst) {
    CustomComponent.Option = FocusTrackingOption;
  }

  // let theme = useLocalStorage("theme", "get");

  const handleKeyDown = (e) => {
    if (e.key === "Backspace" && !isMulti) {
      const inputElement = e.target;

      // Check if there is a value selected AND the cursor is at the start
      // OR if you just want Backspace to always clear the selection when it exists
      if (selectedOption && inputElement.selectionStart === 0) {
        // Prevent default behavior (which might be deleting one char of the search text)
        e.preventDefault();
        e.stopPropagation();

        // Manually trigger clear
        if (onChange) {
          onChange(name, null);
        }

        // Ensure the input stays focused so the user can type immediately
        setTimeout(() => {
          const input =
            selectRef.current?.inputRef ||
            selectRef.current?.select?.inputRef ||
            document.querySelector(`#${id} input`);
          input?.focus();
        }, 0);

        return;
      }
    }

    if (e.key === "Tab") {
      if (tabSelectsFirst && menuIsOpenRef.current) {
        e.preventDefault(); // stop browser's native Tab from also navigating

        // Try to get exactly what react-select has highlighted (internal state if possible)
        const reactSelectInternal = selectRef.current;
        const highlighted = reactSelectInternal?.state?.focusedOption || focusedOptionRef.current || dynamicOptions?.[0] || null;

        if (highlighted && onChange) {
          onChange(name, highlighted);
        }

        // Blur to close menu
        if (selectRef.current?.blur) {
          selectRef.current.blur();
        }

        // Navigate to next field after a delay
        // We use 150ms to ensure it runs AFTER parent's potential refocus-back logic (which is often 100ms)
        if (onKeyDown) {
          setTimeout(() => onKeyDown(e), 150);
        }
        return;
      }
      // Default: close menu and let parent navigate
      if (menuIsOpenRef.current && selectRef.current?.blur) {
        selectRef.current.blur();
      }
      if (onKeyDown) {
        onKeyDown(e);
      }
      return;
    }

    // Call the parent onKeyDown handler if provided
    if (onKeyDown) {
      onKeyDown(e);
    }
  };


  let theme = useLocalStorage("theme", "get");

  useEffect(() => {
    if (
      autoSelectFirst &&
      !value &&
      dynamicOptions &&
      dynamicOptions.length > 0
    ) {
      onChange && onChange(name, dynamicOptions[0]);
    }
  }, [autoSelectFirst, dynamicOptions]);


  const SelectComponent = creatable ? CreatableSelect : Select;

  // Placed after every hook above (not as an early-return before them) so the
  // hook count/order stays identical across renders even if uiMode flips
  // while this component is mounted — conditionally skipping hook calls
  // would violate React's rules of hooks and crash.
  if (uiMode === "nextgen") {
    return (
      <NextGenSelect
        dynamicOptions={dynamicOptions}
        value={value}
        onChange={onChange}
        name={name}
        id={id}
        inputId={inputId}
        placeholderName={placeholderName}
        isMulti={isMulti}
        isDisabled={isDisabled}
        creatable={creatable}
        onCreateOption={onCreateOption}
        removeIsClearable={removeIsClearable}
        isLoading={isLoading}
        filterOption={filterOption}
        autoFocus={autoFocus}
        className={className}
        tabIndex={tabIndex}
        onKeyDown={onKeyDown}
      />
    );
  }

  return (
    <>
      <Tooltip target={`#${id}`} position="top" content={t(placeholderName)} />
      <div className={`${respclass} mb-0`}>
        <div className="form-group"
          onMouseDown={() => {
            isMouseDown.current = true;
            requestAnimationFrame(() => {
              isMouseDown.current = false;
            });
          }}
        >
          <SelectComponent
            {...(creatable ? { onCreateOption: (inputValue) => onCreateOption && onCreateOption(inputValue) } : {})}
            tabIndex={tabIndex}
            options={dynamicOptions ? dynamicOptions : []}
            filterOption={filterOption}
            blurInputOnSelect={false}
            closeMenuOnSelect={!isMulti}
            isMulti={isMulti}
            isSearchable={searchable}
            defaultValue={defaultValue}
            formatOptionLabel={({ label, ...rest }) => {
              if (handleFormatlabel) {
                return handleFormatlabel(name, label, rest);
              }

              return <div>{label}</div>;
            }}
            components={CustomComponent}
            id={id}
            // ref={selectRef}
            ref={(ref) => {
              selectRef.current = ref;
              if (typeof inputRef === "function") inputRef(ref);
            }}
            inputId={inputId}
            onInputChange={(val, meta) => {
              if (meta.action === "input-blur") return val; // stop blur
              return val;
            }}
            value={selectedOption}
            //	            value={
            //          value
            //          ? dynamicOptions?.find(
            //      (option) => String(option?.value) === String(value)
            //      )
            //      : ""
            //    }
            styles={customStyles}
            placeholder={t(placeholderName)}
            onChange={onChange ? (e) => onChange(name, e) : () => { }}
            isDisabled={isDisabled}
            className={className}
            menuPortalTarget={document.body}
            classNamePrefix={"form-control"}
            onKeyDown={handleKeyDown}
            isClearable={!removeIsClearable}
            menuPlacement="auto"
            onFocus={() => {
              if (isMouseDown.current) return; // ← skip on mouse click
              setTimeout(() => {
                const input =
                  selectRef.current?.inputRef ||
                  selectRef.current?.select?.inputRef ||
                  document.querySelector(`#${id} input`);
                input?.focus();
              }, 0);
            }}
            onMenuOpen={() => {
              menuIsOpenRef.current = true;
              focusedOptionRef.current = dynamicOptions?.[0] || null; // default to first
            }}
            onMenuClose={() => { menuIsOpenRef.current = false; }}
          />
        </div>
      </div>
    </>
  );
};

export default ReactSelect;
