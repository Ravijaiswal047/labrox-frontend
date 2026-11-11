import React, { useEffect, useState } from "react";
import { Tabfunctionality } from "../../../../utils/helpers";
import Heading from "../../../../components/UI/Heading";
import { useDispatch } from "react-redux";
import { useTranslation } from "react-i18next";
import ReactSelect from "../../../../components/formComponent/ReactSelect";
import Input from "../../../../components/formComponent/Input";
import { useLocalStorage } from "../../../../utils/hooks/useLocalStorage";
import VoucherMasterTable from "./VoucherMasterTable";
import {
  BindUsertypeApprovalMasterAPI,
  FinanceBindVoucherTypeMaster,
  FinanceDeActiveVoucherTypeMaster,
  FinanceSaveVoucherTypeMaster,
} from "../../../../NetworkServices/finance.js";
import { filterByTypes, notify } from "../../../utils/Utils";

const Vouchermaster = () => {
  const [isEdit, setIsEdit] = useState(false);
  const [t] = useTranslation();
  const dispatch = useDispatch();
  const localdata = useLocalStorage("userData", "get");
  const [bindVoucherData, setBindVoucherData] = useState([]);
  const [approvalLevel, setApprovalLevel] = useState([]);
  const [values, setValues] = useState({
    voucherType: "",
    voucherName: "",
    fullName: "",
    MaxApprovalLevel: { label: "", value: "" },
  });

  const handleReactChange = (name, e) => {
    setValues((prevValues) => ({ ...prevValues, [name]: e }));
  };

  const handleInputChange = (name, event) => {
    setValues((prevValues) => ({ ...prevValues, [name]: event.target.value }));
  };

  const bindVoucher = async () => {
    const response = await FinanceBindVoucherTypeMaster();
    if (response?.success) {
      setBindVoucherData(response?.data);
    } else {
      setBindVoucherData([]);
    }
  };
  const BindApprovalLevel = async () => {
    const response = await BindUsertypeApprovalMasterAPI();
    if (response?.success) {
      setApprovalLevel(filterByTypes(response?.data, [1], ["IsApproval"], "TextField", "ValueField"));
    } else {
      setApprovalLevel([]);
    }
  };

  useEffect(() => {
    bindVoucher();
    BindApprovalLevel();
  }, []);

  const handleSaveVoucherType = async () => {
    if (
      !values?.voucherType ||
      !values?.fullName ||
      !values?.voucherName ||
      !values?.MaxApprovalLevel?.value
    ) {
      notify("Please fill all required fields.", "error");
      return;
    }
    const payload = {
      voucherType: values?.voucherType,
      fullName: values?.fullName,
      voucherName: values?.voucherName,
      MaxApprovalLevel: values?.MaxApprovalLevel?.value,
      MaxApprovalLevelName: values?.MaxApprovalLevel?.label,
      isAutoVerifyHISData: "1",
      isAutoAuthByHISData: "1",
      savetype: isEdit ? "Update" : "Save",
      id: isEdit ? values?.ID : "",
    };
    try {
      const response = await FinanceSaveVoucherTypeMaster(payload);
      if (response?.success) {
        notify(response.message, "success");
        bindVoucher();
        setValues((preV) => ({
          ...preV,
          voucherType: "",
          voucherName: "",
          fullName: "",
          ID: "",
          MaxApprovalLevel: { label: "", value: "" },
        }));
        setIsEdit(false);
      } else {
        notify(response.message, "error");
      }
    } catch (error) {
      console.error("Error saving voucher type:", error);
      notify("An error occurred while saving.", "error");
    }
  };

  const handleDeactive = async (val) => {
    console.log("val", val);

    const payload = {
      id: String(val?.VoucherTypeID),
      active: String(val?.IsActive),
    };
    const response = await FinanceDeActiveVoucherTypeMaster(payload);
    if (response?.success) {
      bindVoucher();
      notify(response?.message, "success");
    } else {
      notify(response?.message, "error");
    }
  };

  const handleEdit = (val) => {
    setIsEdit(true);
    setValues((prev) => ({
      ...prev,
      ID: val?.VoucherTypeID,
      voucherType: val?.TransactionType,
      voucherName: val?.VoucherName,
      fullName: val?.VoucherFullName,
      MaxApprovalLevel: {
        label: val?.MaxApprovalLevelName,
        value: val?.MaxApprovalLevel,
      },
    }));
  };
  const handleCencel = () => {
    setIsEdit(false);
    setValues({
      voucherType: "",
      voucherName: "",
      fullName: "",
      MaxApprovalLevel: { label: "", value: "" },
    });
  };

  return (
    <div className="card border pt-2">
      <Heading isBreadcrumb={true} 
        name={t("Voucher Type Master")}
      />
      <div className="row p-2">
        <Input
          type="text"
          maxLength="5"
          className="form-control required-fields"
          lable={t("Voucher Type")}
          placeholder=" "
          id="voucherType"
          name="voucherType"
          value={values?.voucherType}
          onChange={(e) => handleInputChange("voucherType", e)}
          respclass="col-xl-2 col-md-3 col-sm-6 col-12"
          onKeyDown={Tabfunctionality}
        />
        <Input
          type="text"
          className="form-control required-fields"
          lable={t("Voucher Name")}
          placeholder=" "
          id="voucherName"
          name="voucherName"
          value={values?.voucherName}
          onChange={(e) => handleInputChange("voucherName", e)}
          respclass="col-xl-2 col-md-3 col-sm-6 col-12"
          onKeyDown={Tabfunctionality}
        />
        <Input
          type="text"
          className="form-control required-fields"
          lable={t("Full Name")}
          placeholder=" "
          id="fullName"
          name="fullName"
          value={values?.fullName}
          onChange={(e) => handleInputChange("fullName", e)}
          respclass="col-xl-2 col-md-3 col-sm-6 col-12"
          onKeyDown={Tabfunctionality}
        />
        <ReactSelect
          placeholderName={t("Approval Level (Max)")}
          searchable={true}
          id="MaxApprovalLevel"
          respclass="col-xl-2 col-md-3 col-sm-6 col-12"
          dynamicOptions={approvalLevel}
          name="MaxApprovalLevel"
          value={values?.MaxApprovalLevel?.value}
          onChange={(name, e) => handleReactChange(name, e)}
        />

        <div className="col-xl-2 col-md-3 col-sm-6 col-12">
          {isEdit ? (
            <>
              <button
                className="btn btn-sm btn-primary"
                onClick={handleSaveVoucherType}
              >
                {t("Update")}
              </button>
              <button
                className="btn btn-sm btn-primary ml-2"
                onClick={handleCencel}
              >
                {t("Cancel")}
              </button>
            </>
          ) : (
            <button
              className="btn btn-sm btn-primary"
              onClick={handleSaveVoucherType}
            >
              {t("Save")}
            </button>
          )}
        </div>
      </div>
      <Heading title={"Voucher Type Details"} isBreadcrumb={false} />
      <VoucherMasterTable
        bindVoucherData={bindVoucherData}
        onEdit={handleEdit}
        handleDeactive={handleDeactive}
      />
    </div>
  );
};

export default Vouchermaster;
