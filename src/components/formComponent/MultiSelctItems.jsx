import React, { useCallback } from "react";
// import MultiSelectComp from "../formComponent/MultiSelectComp";
import MultiSelectCompforStore from "./MultiSelectCompforStore";

const MultiSelctItems = ({
  name,
  placeholderName,
  respclass,
  values,
  setValues,
  dynamicOptions,
  labelKey,
  valueKey,
  requiredClassName,
  disabled,
  handleChange,
}) => {
  const handleOptionsMulti = useCallback(
    (options, name, code) => {
      return options?.map((item) => ({
        name: item[name],
        code: item[code],
      }));
    },
    [dynamicOptions],
  );

  const handleMultiSelectChange = (name, e) => {
    setValues({ ...values, [name]: e });
  };
  return (
    <MultiSelectCompforStore
      respclass={respclass}
      name={name}
      placeholderName={placeholderName}
      dynamicOptions={handleOptionsMulti(dynamicOptions, labelKey, valueKey)}
      handleChange={handleChange ? handleChange : handleMultiSelectChange}
      value={values[name]}
      requiredClassName={requiredClassName}
      disabled={disabled}
    />
  );
};

export default MultiSelctItems;
// import React, { useCallback } from "react";
// import MultiSelectComp from "../formComponent/MultiSelectComp";

// const MultiSelctItems = ({
//   name,
//   placeholderName,
//   respclass,
//   values,
//   setValues,
//   dynamicOptions,
//   labelKey,
//   valueKey,
//   requiredClassName,
//   disabled,
//   handleChange,
// }) => {
//   const handleOptionsMulti = useCallback(
//     (options, name, code) => {
//       if (!Array.isArray(options)) return []; // FIX: undefined hone par [] return karo
//       return options.map((item) => ({
//         name: item[name],
//         code: item[code],
//       }));
//     },
//     [dynamicOptions],
//   );

//   const handleMultiSelectChange = (name, e) => {
//     setValues({ ...values, [name]: e });
//   };

//   return (
//     <MultiSelectComp
//       respclass={respclass}
//       name={name}
//       placeholderName={placeholderName}
//       dynamicOptions={handleOptionsMulti(dynamicOptions, labelKey, valueKey)}
//       handleChange={handleChange ? handleChange : handleMultiSelectChange}
//       value={values[name]}
//       requiredClassName={requiredClassName}
//       disabled={disabled}
//     />
//   );
// };

// export default MultiSelctItems;