import { Tooltip } from "primereact/tooltip";
import React, { useRef } from "react";
import { useTranslation } from "react-i18next";
import Select, { components } from "react-select";
import { useLocalStorage } from "../../utils/hooks/useLocalStorage";

const { ValueContainer, Placeholder } = components;

const CustomValueContainer = ({ children, ...props }) => (
  <ValueContainer {...props}>
    <Placeholder {...props} isFocused={props.isFocused} className="truncate">
      {props.selectProps.placeholder}
    </Placeholder>
    {React.Children.map(children, (child) =>
      child && child.type !== Placeholder ? child : null,
    )}
  </ValueContainer>
);

const MultiBackGroundReactSelect = ({
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
  bgColor = false, // ✅ only this new prop
}) => {
  const [t] = useTranslation();
  const selectRef = useRef(null);
  const theme = useLocalStorage("theme", "get");

  // ✅ color logic for each status value
  const getStatusColor = (val) => {
    switch (String(val)) {
      case "0":
        return "#32cd32"; // lime green
      case "1":
        return "#800080"; // purple
      case "2":
        return "#ffa500"; // orange
      case "3":
        return "#00bfff"; // deep sky blue
      case "4":
        return "#8b0000"; // dark red
      case "5":
        return "#008000"; // green
      case "6":
        return "#005f69"; // dark cyan
      case "7":
        return "#ff0000"; // red
      case "10":
        return "#ffc0cb"; // pink
      case "11":
        return "#FFFF00"; // sandy brown
      case "12":
        return "#ffff00"; // yellow
      case "13":
        return "#ff4500"; // orange red
      case "14":
        return "#adff2f"; // green yellow
      case "15":
        return "#44a3aa"; // teal
      case "16":
        return "#c4953d"; // golden brown
      case "18":
        return "#86e4d4"; // light sky blue
      case "20":
        return "#e30909";
      case "21":
        return "#ffff00"; // yellow
      case "22":
        return "#fc361c"; // red
      case "23":
        return "#fced1c"; // yellow
      case "24":
        return "#d6d4d0"; // light gray
      case "25":
        return "#ebb17d";
      default:
        return "#f8f9fa"; // light gray
    }
  };

  // Styles (copied from your ReactSelect, minimal change in `option`)
  const customStyles = {
    control: (base, state) => ({
      ...base,
      height: 15,
      minHeight: "24px !important",
      width: "100%",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      flexDirection: "row",
      flexWrap: "nowrap",
      boxShadow: state.isFocused ? "0 0 0 1px rgba(13, 13, 14, 0.5)" : "none",
      outline: state.isFocused ? "none" : "initial",
      whiteSpace: "normal",
    }),
    placeholder: (defaultStyles, state) => ({
      ...defaultStyles,
      color: "none",
      position: "absolute",
      top: state.hasValue || state.selectProps.inputValue ? -6 : "",
      backgroundColor:
        state.hasValue || state.selectProps.inputValue
          ? "white"
          : "transparent",
      transition: "top 0.1s, font-size 0.1s",
      fontSize:
        state.hasValue || state.selectProps.inputValue ? "10px" : "10px",
      lineHeight: "14px",
      width: "80%",
      fontWeight: state.hasValue || state.selectProps.isFocused ? "500" : "500",
    }),
    menu: (styles) => ({
      ...styles,
      width: "100%",
      fontSize: 12,
      padding: 0,
    }),
    option: (provided, state) => {
      console.log("xxxx", provided, "-,,,,,-", state);
      return {
        ...provided,
        padding: "5px 7px 5px 7px !important",
        borderBottom: "1px solid #ddd",
        cursor: "pointer",
        backgroundColor: bgColor
          ? getStatusColor(state.data.value)
          : state.isFocused
            ? "#f1f1f1"
            : "#fff",
        color: bgColor ? (state?.value == "" ? "#000" : "#f3eeeeff") : "#000",
      };
    },
    menuList: (styles) => ({
      ...styles,
      width: "100%",
      fontSize: 12,
      padding: 0,
    }),
    container: (provided) => ({
      ...provided,
    }),
    valueContainer: (provided) => ({
      ...provided,
      overflow: "visible",
    }),
    menuPortal: (base) => ({
      ...base,
      zIndex: 9999,
    }),
  };

  const CustomInput = ({ getDynamicClass, ...props }) => (
    <components.Input {...props} inputClassName={getDynamicClass()} />
  );

  const getDynamicClass = () => className;

  const DefaultDropdownIndicator = () => (
    <div className="custom-dropdown-indicator">
      {removeIsClearable && (
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
      )}
    </div>
  );

  const isMobile = window.innerWidth <= 800;
  const CustomComponent = isMobile
    ? {
      ValueContainer: CustomValueContainer,
      DropdownIndicator: DefaultDropdownIndicator,
    }
    : {
      ValueContainer: CustomValueContainer,
      Input: (props) => (
        <CustomInput {...props} getDynamicClass={getDynamicClass} />
      ),
      DropdownIndicator: DefaultDropdownIndicator,
    };

  return (
    <>
      <Tooltip target={`#${id}`} position="top" content={t(placeholderName)} />
      <div className={respclass}>
        <div className="form-group">
          <Select
            options={dynamicOptions || []}
            isSearchable={searchable}
            defaultValue={defaultValue}
            formatOptionLabel={({ label, ...rest }) =>
              handleFormatlabel ? (
                handleFormatlabel(name, label, rest)
              ) : (
                <div>{label}</div>
              )
            }
            components={CustomComponent}
            id={id}
            ref={selectRef}
            inputId={inputId}
            // value={
            //   value
            //     ? dynamicOptions?.find(
            //         (option) => String(option?.value) === String(value),
            //       )
            //     : ""
            // }
            value={
              dynamicOptions?.find(
                (option) => String(option?.value) === String(value)
              ) || null
            }
            styles={customStyles}
            placeholder={t(placeholderName)}
            onChange={onChange ? (e) => onChange(name, e) : () => { }}
            isDisabled={isDisabled}
            className={className}
            menuPortalTarget={document.body}
            classNamePrefix="form-control"
            onKeyDown={onKeyDown}
            isClearable={!removeIsClearable}
            menuPlacement="auto"
          />
        </div>
      </div>
    </>
  );
};

export default MultiBackGroundReactSelect;
