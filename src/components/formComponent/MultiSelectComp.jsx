// import React from "react";
// import { MultiSelect } from "primereact/multiselect";

// const MultiSelectComp = (props) => {
//   const {
//     respclass,
//     dynamicOptions,
//     value,
//     handleChange,
//     name,
//     placeholderName,
//     requiredClassName
//   } = props;
//   const isMobile = window.innerWidth <= 768;
//   // Default cities array
//   const cities = [
//     { name: "New York", code: "NY" },
//     { name: "Rome", code: "RM" },
//     { name: "London", code: "LDN" },
//     { name: "Istanbul", code: "IST" },
//     { name: "Paris", code: "PRS" },
//   ];

//   // Map the dynamicOptions to the desired format
//   // const mappedOptions = dynamicOptions ? dynamicOptions.map((item) => ({
//   //     name: item.name,
//   //     code: item.subCategoryID
//   // })) : cities;
//   const truncate = (str, maxLength) => {
//     if (str?.length > maxLength) {
//       return isMobile ? str : str?.substring(0, maxLength) + "...";
//     }
//     return str;
//   };

//   const itemTemplate = (option) => {
//     return <div>{truncate(option.name, 20)}</div>;
//   };

//   return (
//     <div className={respclass}>
//       <div className="form-controls mb-2">
//         <MultiSelect
//           filter
//           value={value}
//           onChange={(e) => handleChange(name, e.value)}
//           // onChange={handleChange}
//           options={dynamicOptions}
//           optionLabel="name"
//           placeholder={placeholderName}
//           maxSelectedLabels={3}
//           className={`multiselect ${requiredClassName ? "required-fields" : ""} `}
//           name={name}
//           closeIcon
//           itemTemplate={itemTemplate}
//         />
//       </div>
//     </div>
//   );
// };

// export default MultiSelectComp;

import React from "react";
import { useSelector } from "react-redux";
import { MultiSelect } from "primereact/multiselect";
import NextGenMultiSelect from "../nextgen/NextGenMultiSelect";
import "./MultiSelectComp.css";

const
MultiSelectComp = (props) => {
  const {
    className,
    options, // expects [{ label, value }]
    value,
    onChange,
    name,
    id,
    label, // keeping same spelling as your other comps
    placeholder,
    requiredClassName,
  } = props;

  const { uiMode } = useSelector((state) => state?.loadingSlice) || {};

  if (uiMode === "nextgen") {
    return (
      <NextGenMultiSelect
        className={className}
        options={options}
        value={value}
        onChange={onChange}
        name={name}
        id={id}
        label={label}
        placeholder={placeholder}
        requiredClassName={requiredClassName}
      />
    );
  }

  const isMobile = window.innerWidth >= 768;
  console.log('isMobile', isMobile);

  const truncate = (str, maxLength) => {
    if (str?.length > maxLength) {
      return isMobile ? str : str.substring(0, maxLength) + "...";
    }
    return str;
  };

  const itemTemplate = (option) => {
    // return <div>{option.label}</div>;
    return <div>{truncate(option.label, 20)}</div>;
  };

  return (
    <div className={className}>
      <div className="form-controls floating-label-container">
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
          className={`multiselect ${requiredClassName ? "required-fields" : ""}`}
          name={name}
          closeIcon
          // itemTemplate={itemTemplate}
          appendTo={document.body}
        />
        <label htmlFor={id} className="floating-labelxx">
          {label}
        </label>
      </div>
    </div>
  );
};

export default MultiSelectComp;

// import React from "react";
// import { MultiSelect } from "primereact/multiselect";
// import "./MultiSelectComp.css";

// const MultiSelectComp = (props) => {
//   const {
//     respclass,
//     dynamicOptions,
//     value,
//     handleChange,
//     name,
//     placeholderName,
//     requiredClassName,
//   } = props;

//   const isMobile = window.innerWidth <= 768;

//   const truncate = (str, maxLength) => {
//     if (str?.length > maxLength) {
//       return isMobile ? str : str?.substring(0, maxLength) + "...";
//     }
//     return str;
//   };

//   const itemTemplate = (option) => {
//     return <div>{truncate(option.name, 20)}</div>;
//   };

//   return (
//     <div className={respclass}>
//       <div className="form-controls mb-2">
//         <MultiSelect
//           filter
//           value={Array.isArray(value) ? value : []}                      
//           onChange={(e) => handleChange(name, e.value ?? [])}             
//           options={Array.isArray(dynamicOptions) ? dynamicOptions : []}  
//           optionLabel="name"
//           placeholder={placeholderName}
//           maxSelectedLabels={3}
//           className={`multiselect ${requiredClassName ? "required-fields" : ""} `}
//           name={name}
//           closeIcon
//           itemTemplate={itemTemplate}
//         />
//       </div>
//     </div>
//   );
// };

// export default MultiSelectComp;