import React, { useState } from "react";
import ReactSelect from "../../../../components/formComponent/ReactSelect";
import { useTranslation } from "react-i18next";
import { useLocalStorage } from "../../../../utils/hooks/useLocalStorage";
import MultiSelectComp from "../../../../components/formComponent/MultiSelectComp";
import { FinanceCopyCentreListHISConsumeDeptMapping, FinanceCopyStockAdjProcessMapping } from "../../../../NetworkServices/finance.js";
import { notify } from "../../../../utils/ustil2";

const CopyModalAdjuProcess = ({ handleClose, centerData }) => {
  const [t] = useTranslation();
  const userData = useLocalStorage("userData", "get");

  const [values, setValues] = useState({
    center: { value: Number(userData?.MainCentreID) },
  });

  const [dropDownState, setDropDownState] = useState({
    GetBindAllCenter: [],
  });

  const handleReactChange = (name, value) => {
    setValues((val) => ({
      ...val,
      [name]: value,
      toCentre: [],
    }));
  };

  const handleMultiSelectChange = (name, selectedOptions) => {
    setValues({ ...values, [name]: selectedOptions });
  };

  const handleSave = async () => {
    const payload = {
      items: values?.toCentre?.map((val) => ({
        FromCentreID: values?.fromCenter?.value,
        ToCentreID: val?.code,
      })),
    };

    const response = await FinanceCopyStockAdjProcessMapping(payload);
    if (response?.success) {
      notify(response?.message, "success");
      handleClose();
    } else {
      notify(response?.message, "error");
    }
  };

  return (
    <div className="row">
      <ReactSelect
        requiredClassName={"required-fields"}
        placeholderName={t("From Center")}
        searchable={true}
        respclass="col-xl-4 col-md-4 col-sm-4 col-12"
        id={"fromCenter"}
        name={"fromCenter"}
        removeIsClearable={true}
        handleChange={handleReactChange}
        dynamicOptions={centerData?.map((val) => ({
          label: val?.CentreName,
          value: val?.MainCentreID,
        }))}
        value={values?.fromCenter?.value}
      />
      {console.log(
        "first",
        centerData?.filter(
          (val) => val?.MainCentreID !== values?.fromCenter?.value
        ),
        "values",
        values
      )}

      <MultiSelectComp
        placeholderName={t("To Center")}
        id={"toCentre"}
        name="toCentre"
        value={values?.toCentre}
        handleChange={handleMultiSelectChange}
        dynamicOptions={centerData
          ?.filter((val) => val?.MainCentreID !== values?.fromCenter?.value)
          ?.map((val) => ({
            name: val?.CentreName,
            code: val?.MainCentreID,
          }))}
        searchable={true}
        respclass="col-xl-4 col-md-4 col-sm-4 col-12"
        requiredClassName="required-fields"
      />
      <button className="btn btn-success mt-1" onClick={handleSave}>
        {t("Save")}
      </button>
      <button className="btn btn-success mt-1 ml-2" onClick={handleClose}>
        {t("Cancel")}
      </button>
    </div>
  );
};

export default CopyModalAdjuProcess;
