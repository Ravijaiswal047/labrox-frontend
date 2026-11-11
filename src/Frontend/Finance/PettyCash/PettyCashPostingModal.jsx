import React, { useEffect, useState } from "react";
import LabeledInput from "../../../components/formComponent/LabeledInput";
import ReactSelect from "../../../components/formComponent/ReactSelect";
import {
  filterByTypes,
  handleReactSelectDropDownOptions,
} from "../../utils/Utils";
import Input from "../../../components/formComponent/Input";
import Tables from "../../../components/UI/customTable";
import { useTranslation } from "react-i18next";
import { notify } from "../../../utils/ustil2";

const PettyCashPostingModal = ({
  setModalData,
  inputs,
  setOldBodyData,
  tbody,
  list,
}) => {
  const [t] = useTranslation();
  const [values, setValues] = useState({});
  console.log("values", values);
  const THEAD = [
    { name: "S.No.", width: "1%" },
    { name: "Department", width: "5%" },
    { name: "Cost Center" },
    { name: "Amount" },
    { name: "Delete" },
  ];
  const [bodyData, setBodyData] = useState(inputs?.ccList);

  const handleSelect = async (name, value) => {
    setValues((val) => ({
      ...val,
      [name]: value,
    }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setValues((val) => ({ ...val, [name]: value }));
  };

  const hanldeDelete = (val, index) => {
    let remainingAmt =
      Number(values?.RemAmt ? values?.RemAmt : 0) +
      Number(val?.amount ? Number(val?.amount) : 0);
    setValues((val) => ({ ...val, RemAmt: remainingAmt }));
    setModalData((val) => ({
      ...val,
      modalData: { ...inputs, RemAmt: remainingAmt },
    }));
    let data = bodyData?.filter((item, ind) => ind !== index);
    setBodyData(data);
  };

  const handleAdd = () => {
    if (!values?.dept?.value) {
      notify("Please Select the Department", "error");
      return;
    } else if (!values?.costCenter?.value) {
      notify("Please Select the Cost Center", "error");
      return;
    } else if (!values?.amount) {
      notify("Please Select the Amount", "error");
      return;
    }
    let remainingAmount = values?.RemAmt - values?.amount;
    if (remainingAmount < 0) {
      notify("You Can't Add More Than Cost Centre Amount", "error");
      return 0;
    }
    const isDuplicate = bodyData?.find(
      (val) =>
        val?.dept?.value === values?.dept?.value &&
        val?.costCenter?.value === values?.costCenter?.value
    );
    if (isDuplicate) {
      notify("You Can't Add Duplicate Item", "error");
      return 0;
    }
    setBodyData((val) => [...val, values]);
    setValues({
      ...inputs,
      dept: { label: "", value: "" },
      costCenter: { label: "", value: "" },
      RemAmt: remainingAmount,
      amount: "",
    });
    setModalData((val) => ({
      ...val,
      modalData: { ...inputs, RemAmt: remainingAmount },
    }));
  };

  useEffect(() => {
    let ccAmount = inputs?.ccList?.reduce((intial, value) => {
      return intial + Number(value?.amount);
    }, 0);
    setValues({
      ...inputs,
      RemAmt: inputs?.ApprovedAmount - ccAmount,
      totalAmt: ccAmount,
    });
    setModalData((val) => ({
      ...val,
      modalData: { ...inputs, RemAmt: inputs?.ApprovedAmount - ccAmount },
    }));
  }, []);

  useEffect(() => {
    const newData = JSON.parse(JSON.stringify(tbody));
    newData[inputs.index]["ccList"] = bodyData;
    setOldBodyData(newData);
    const totalAmt =
      bodyData?.length > 0
        ? bodyData?.reduce((initial, value) => {
            return initial + Number(value?.amount);
          }, 0)
        : 0;
    setValues((val) => ({
      ...val,
      totalAmt: totalAmt,
    }));
  }, [bodyData?.length]);

  return (
    <div className="p-2">
      <div className="row">
        <LabeledInput
          className={"col-xl-3 col-md-4 col-sm-6 col-12"}
          label={t("A/C Name")}
          value={tbody[0]?.AccountName}
        />
        <LabeledInput
          className={"col-xl-3 col-md-4 col-sm-6 col-12"}
          label={t("Cost Center Amt")}
          value={inputs.ApprovedAmount}
        />
        <LabeledInput
          className={"col-xl-3 col-md-4 col-sm-6 col-12"}
          label={t("Balance Amt")}
          value={values?.RemAmt}
        />
      </div>
      <div className="row mt-2">
        <ReactSelect
          placeholderName={t("Department")}
          id={"dept"}
          className={"required-fields"}
          searchable={true}
          removeIsClearable={true}
          respclass="col-xl-3 col-md-4 col-sm-6 col-12"
          dynamicOptions={list
            ?.filter((val) => val?.TypeID === 2)
            ?.map((val) => ({
              label: val?.TextField,
              value: val?.ValueField,
            }))}
          onChange={(name, e) => handleSelect(name, e)}
          value={`${values?.dept?.value}`}
          name={"dept"}
        />
        <ReactSelect
          placeholderName={t("Cost Center")}
          id={"costCenter"}
          className={"required-fields"}
          searchable={true}
          removeIsClearable={true}
          respclass="col-xl-3 col-md-4 col-sm-6 col-12"
          dynamicOptions={list
            ?.filter((val) => val?.TypeID === 7)
            ?.map((val) => ({
              label: val?.TextField,
              value: val?.ValueField,
            }))}
          onChange={handleSelect}
          value={`${values?.costCenter?.value}`}
          name={"costCenter"}
        />
        <Input
          type="text"
          className="form-control"
          id="amount"
          placeholder=" "
          name="amount"
          value={values?.amount}
          required={true} 
          onChange={handleChange}
          lable={t("Amount")}
          respclass="col-xl-3 col-md-4 col-sm-6 col-12"
        />
        <button className="btn btn-success" onClick={handleAdd}>
          {t("Add")}
        </button>
      </div>
      {bodyData?.length > 0 && (
        <div>
          <Tables
            thead={THEAD}
            tbody={bodyData?.map((val, index) => ({
              "S.No.": index + 1,
              Department: val?.dept?.label,
              "Cost Center": val?.costCenter,
              Amount: val?.amount,
              Del: (
                <span
                  className="fa fa-trash"
                  onClick={() => hanldeDelete(val, index)}
                ></span>
              ),
            }))}
          />
          <LabeledInput
            className={"col-xl-3 col-md-4 col-sm-6 col-12 mt-2"}
            label={t("Total")}
            value={values?.totalAmt}
          />
        </div>
      )}
    </div>
  );
};

export default PettyCashPostingModal;
