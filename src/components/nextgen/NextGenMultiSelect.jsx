import { MultiSelect } from "primereact/multiselect";
import { useNgModeClass } from "@app/utils/hooks/useNgModeClass";
import "./NextGenMultiSelect.css";

/**
 * NextGen replacement for components/formComponent/MultiSelectComp.jsx.
 * Same onChange(name, value), options={label,value}, floating-label contract.
 */
export default function NextGenMultiSelect({
  className = "",
  options = [],
  value,
  onChange,
  name,
  id,
  label,
  placeholder,
  requiredClassName = false,
}) {
  const ngModeClass = useNgModeClass();
  return (
    <div className={`ng-multiselect ${className}`}>
      <div className="ng-multiselect__field">
        <MultiSelect
          inputId={id}
          filter
          value={value}
          onChange={(e) => onChange(name, e.value)}
          options={options}
          optionLabel="label"
          optionValue="value"
          placeholder={placeholder || " "}
          maxSelectedLabels={3}
          className={`ng-multiselect__control ${requiredClassName ? "ng-required" : ""}`}
          name={name}
          closeIcon
          appendTo={document.body}
          panelClassName={`ng-multiselect__panel ${ngModeClass}`}
        />
        {label && (
          <label htmlFor={id} className="ng-multiselect__label">
            {label}
          </label>
        )}
      </div>
    </div>
  );
}
