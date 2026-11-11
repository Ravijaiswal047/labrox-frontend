import React, { useCallback } from "react";
import MultiSelectComp from "../formComponent/MultiSelectComp";

const ReportsMultiSelect = ({
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
}) => {
  const handleOptionsMulti = useCallback(
    (options, name, code) => {
      // debugger;
      // return options.map((item) => ({
      //   name: item[name],
      //   code: item[code],
      // }));
      return Array.isArray(options)
        ? options.map((item) => ({
            name: item[name],
            code: item[code],
          }))
        : [];
    },
    [dynamicOptions]
  );

  const handleMultiSelectChange = (name, e) => {
    console.log(e);
    setValues({ ...values, [name]: e });
  };
  return (
    <MultiSelectComp
      respclass={respclass}
      name={name}
      placeholderName={placeholderName}
      dynamicOptions={handleOptionsMulti(dynamicOptions, labelKey, valueKey)}
      handleChange={handleMultiSelectChange}
      value={values[name]}
      requiredClassName={requiredClassName}
      disabled={disabled}
    />
  );
};

export default ReportsMultiSelect;
