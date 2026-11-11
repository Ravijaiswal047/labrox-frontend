import { useTranslation } from "react-i18next";
import Select from "react-select";
import CreatableSelect from "react-select/creatable";
import "./NextGenSelect.css";

/**
 * NextGen replacement for components/formComponent/ReactSelect.jsx.
 * Same onChange(name, selectedOption) contract and dynamicOptions/value
 * matching behaviour, restyled for the NextGen theme via classNames
 * (react-select v5 `unstyled` mode) instead of the legacy inline `styles` object.
 */
export default function NextGenSelect({
  dynamicOptions = [],
  value,
  onChange,
  name,
  id,
  inputId,
  placeholderName,
  isMulti = false,
  isDisabled = false,
  creatable = false,
  onCreateOption,
  removeIsClearable = false,
  isLoading = false,
  filterOption,
  autoFocus = false,
  className = "",
  tabIndex,
  onKeyDown,
  formatOptionLabel,
}) {
  const { t } = useTranslation();

  const selectedOption = isMulti
    ? Array.isArray(value)
      ? dynamicOptions.filter((option) =>
          value.map(String).includes(String(option.value)),
        )
      : []
    : value === null || value === "" || value === undefined
      ? null
      : dynamicOptions.find((option) => String(option.value) === String(value)) ||
        null;

  const Component = creatable ? CreatableSelect : Select;

  return (
    <div className={`ng-select ${className}`}>
      <Component
        inputId={inputId || id}
        name={name}
        options={dynamicOptions}
        value={selectedOption}
        onChange={(selected) => onChange && onChange(name, selected)}
        onCreateOption={onCreateOption}
        placeholder={t(placeholderName || "")}
        isMulti={isMulti}
        isDisabled={isDisabled}
        isClearable={!removeIsClearable}
        isLoading={isLoading}
        filterOption={filterOption}
        autoFocus={autoFocus}
        tabIndex={tabIndex}
        onKeyDown={onKeyDown}
        formatOptionLabel={formatOptionLabel}
        unstyled
        classNamePrefix="ng-rs"
        menuPortalTarget={document.body}
        styles={{
          // react-select's menuPortal defaults to zIndex: 1, which renders
          // behind the NextGen profile panel's overlay (zIndex 2000) —
          // this was why an opened select's options were invisible.
          menuPortal: (base) => ({ ...base, zIndex: 3000 }),
        }}
        classNames={{
          control: (state) =>
            `ng-rs__control ${state.isFocused ? "is-focused" : ""} ${isDisabled ? "is-disabled" : ""}`,
          valueContainer: () => "ng-rs__value-container",
          placeholder: () => "ng-rs__placeholder",
          input: () => "ng-rs__input",
          indicatorsContainer: () => "ng-rs__indicators",
          dropdownIndicator: () => "ng-rs__dropdown-indicator",
          clearIndicator: () => "ng-rs__clear-indicator",
          menu: () => "ng-rs__menu",
          menuList: () => "ng-rs__menu-list",
          option: (state) =>
            `ng-rs__option ${state.isSelected ? "is-selected" : ""} ${state.isFocused ? "is-focused" : ""}`,
          multiValue: () => "ng-rs__multi-value",
          multiValueLabel: () => "ng-rs__multi-value-label",
          multiValueRemove: () => "ng-rs__multi-value-remove",
        }}
      />
    </div>
  );
}
