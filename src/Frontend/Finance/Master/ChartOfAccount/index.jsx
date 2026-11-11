import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import Heading from "../../../../components/UI/Heading";
import ReactSelect from "../../../../components/formComponent/ReactSelect";
import {
  // filterByTypes,
  // handleReactSelectDropDownOptions,
  notify,
} from "../../../../utils/utils";
// import AccountTypeModel from "../../../../components/modalComponent/Utils/AccountTypeModel";
import { useLocalStorage } from "../../../../utils/hooks/useLocalStorage";
import Input from "../../../../components/formComponent/Input";
import {
  BindVoucherBillingScreenControls,
  BindCOGBankDetails,
  bindCOGGroupsBackendData,
  ActionChartOfAccount,
  SaveNewAccountType,
  SaveChartOfAccount,
  handlbindCOGGroupsBackendData,
  Bindglobalresources,
  GetConfigurationFinance,
} from "../../../../NetworkServices/finance.js";
import { FaTrash } from "react-icons/fa";
import Tables from "../../../../components/UI/customTable/HisTable";
import CustomSelect from "../../../../components/formComponent/CustomSelect";
import { Tooltip } from "primereact/tooltip";
import AccountTypeModel from "../../../../components/ModalComponent/Utils/AccountTypeModel";
import { filterByTypes, handleReactSelectDropDownOptions } from "../../../utils/Utils";
import FinanceModal from "../../../../components/ModalComponent/FinanceModal";
import HisTable from "../../../../components/UI/customTable/HisTable";

const index = () => {
  const [t] = useTranslation();
  const userData = useLocalStorage("userData", "get");
  const [tableFilterData, setTableFilterData] = useState([]);
  const [allTableData, setAllTableData] = useState([]);
  const [updateData, setUpdateData] = useState([]);
  const [bankAPIdata, setBankApiData] = useState([]);
  const [storeCoid, setStoreCoid] = useState("");
  const [globalResources, setGlopbalResources] = useState([]);

  const [values, setValues] = useState({
    acType: { label: "", value: "" },
    cogName: { label: "", value: "" },
    IsPreferredForPayment: { label: "No", value: "0" },
    IsBank: { label: "No", value: "0" },
    IsWithholdingTax: { label: "No", value: "0" },
    WithholdingTaxPer: "",
    acountName: "",
    isBank: false,
    currency: { label: "", value: "" },
    tradeType: { label: "", value: "" },
    acountNumber: "",
    bank: { label: "", value: "" },
    branch: { label: "", value: "" },
    bankAddress: "",
    branchCode: "",
    swiftBranchCode: "",
    filter: "",
    creditDays: "",
    perfferedBank: "",
    // IsBank: 0,
  });

  const TradeType = [
    { value: "0", label: "Select" },
    { value: "1", label: "Trade" },
    { value: "2", label: "Non Trade" },
    { value: "3", label: "Other" },
  ];

  const ActionType = [
    { label: "Yes", value: "1" },
    { label: "No", value: "0" },
  ];

  const [AddBankData, setAddBankData] = useState([]);
  const [handleModelData, setHandleModelData] = useState({});
  const [modalData, setModalData] = useState({});

  const handleModel = (
    label,
    width,
    type,
    isOpen,
    Component,
    handleInsertAPI,
    footer,
  ) => {
    setHandleModelData({
      label: label,
      width: width,
      type: type,
      isOpen: isOpen,
      Component: Component,
      handleInsertAPI,
      footer: footer,
    });
  };
 
  const handleChange = (e) => {
    const { name, value } = e.target;
    setValues((val) => ({ ...val, [name]: value }));
  };
  const handleChangeModel = (data) => {
    setModalData(data);
  };

  const [dropDownState, setDropDownState] = useState({
    BindBank: [],
    BindBranch: [],
  });

  const handleDeleteBank = (index) => {
    setAddBankData(AddBankData.filter((_, i) => i !== index));
  };

  const theadFilterTable = [
    { width: "1%", name: t("S.No.") },
    { width: "5%", name: t("A/c Type") },

    // { width: "5%", name: t("COG Code") },
    { width: "5%", name: t("COG Name") },
    { width: "5%", name: t("Account Name") },
    { width: "5%", name: t("Currency") },
    { width: "5%", name: t("Pre.For Pay") },

    { width: "5%", name: t("IsBank") },
    { width: "1%", name: t("CR. Days") },
    { width: "1%", name: t("WH. Tax") },

    { width: "5%", name: t("Trade Type") },
    { width: "5%", name: t(" Entry By") },

    { width: "5%", name: t("Entry Date Time") },
    { width: "5%", name: t("Bank A/C") },

    { width: "1%", name: t("Active") },
    { width: "1%", name: t("Action") },
  ];

  const theadAddBank = [
    { width: "5%", name: t("Bank Account") },
    { width: "5%", name: t("Bank Name") },
    { width: "5%", name: t("Branch Name") },
    { width: "5%", name: t("Bank Address") },
    { width: "5%", name: t("Branch Code") },
    { width: "5%", name: t("Swift Code") },
    { width: "5%", name: t("Delete") },
  ];

  const handleBindFilterData = async (filterValue) => {
    let apiResp = await bindCOGGroupsBackendData();

    if (apiResp?.success) {
      setAllTableData(apiResp?.data);
      const filteredData = apiResp?.data?.filter(
        (val) =>
          val?.AccountTypeID === Number(filterValue || values?.filter?.value),
      );
      setTableFilterData(filteredData);
    } else {
      console.log("Some error occurred");
    }
  };

  const bindCOGBankData = async () => {
    let apiResp = await BindCOGBankDetails();
    if (apiResp.success) {
      const BindCOGName = filterByTypes(
        apiResp?.data,
        [1],
        ["TypeID"],
        "TextField",
        "ValueField",
      );
      const BindAcountType = filterByTypes(
        apiResp?.data,
        [2],
        ["TypeID"],
        "TextField",
        "ValueField",
        "IsDisabled",
      ).map((item) => ({
        ...item,
        isDisabled: item.IsDisabled === 1,
      }));
      const BindCurrency = filterByTypes(
        apiResp?.data,
        [3],
        ["TypeID"],
        "TextField",
        "ValueField",
      );
      const BindBank = filterByTypes(
        apiResp?.data,
        [4],
        ["TypeID"],
        "TextField",
        "ValueField",
      );
      const BindBranch = filterByTypes(
        apiResp?.data,
        [5],
        ["TypeID"],
        "TextField",
        "ValueField",
        "TypeCode",
      );
      setDropDownState((val) => ({
        ...val,
        BindAcountType: BindAcountType,
        BindCOGName: BindCOGName,
        BindCurrency: BindCurrency,
        BindBank: BindBank,
        BindBranch: BindBranch,
      }));

      // Set default filter value to "Other" (value = "3")
      const otherOption = BindAcountType.find((item) => item.value === "7");
      if (otherOption && !values?.filter?.value) {
        setValues((val) => ({
          ...val,
          filter: otherOption,
        }));
      }
    }
  };

  const handleAddBank = (e) => {
    e.preventDefault();
    if (
      !values.acountNumber ||
      !values.bank ||
      !values.branch ||
      !values?.bankAddress ||
      !values?.swiftBranchCode
    ) {
      notify("Please fill in required fields", "error");
      return;
    }

    setAddBankData((prevData) => [
      ...prevData,
      {
        BankAccount: values.acountNumber,
        BankName: values?.bank,
        BranchName: values?.branch,
        BankAddress: values.bankAddress,
        BranchCode: values.branchCode,
        SwiftCode: values.swiftBranchCode,
      },
    ]);
  };

  const combinedBankData = [...bankAPIdata, ...AddBankData];

  const handleSaveNewAccountType = async (data) => {
    let payload = {
      accountType: data?.AccountOfReference,
    };
    let apiResp = await SaveNewAccountType(payload);

    if (apiResp?.success) {
      notify(`${apiResp?.message}`, "success");
      setHandleModelData((val) => ({ ...val, isOpen: false }));
      bindCOGBankData();
    } else {
      console.log("Some error occurred");
      notify(`${apiResp?.message}`, "error");
    }
  };

  const handleBindglobalresources = async () => {
    let apiResp = await Bindglobalresources();
    if (apiResp?.success) {
      const data = apiResp?.data?.map((val) => {
        return val?.Value;
      });
      setGlopbalResources(data);
    } else {
      console.log("Some error occurred");
      notify(`${apiResp?.message}`, "error");
    }
  };

  const handleShowTable = async (CoaId) => {
    let payloaddata = {
      filterType: "3",
      coaID: CoaId,
      // coaName: coaName,
    };
    let apiResp = await handlbindCOGGroupsBackendData(payloaddata);
    if (apiResp?.success) {
      setBankApiData(apiResp?.data);
    } else {
      console.log("Some error occurred");
    }
  };

const handleUpdateData = async (filterType, CoaId, coaName, id) => {
  const fetchOneData = tableFilterData[id];
  let payload = {
    filterType: filterType,
    coaID: CoaId,
    coaName: coaName,
  };
  setStoreCoid(CoaId);
  handleShowTable(CoaId);

  let apiResp = await bindCOGGroupsBackendData(payload);

  if (apiResp?.success) {
    const filteredData = apiResp?.data?.filter(
      (val) => val?.AccountTypeID === Number(values?.filter?.value),
    );

    const selectedCogName = dropDownState?.BindCOGName?.find(
      cog => cog.value === String(filteredData[id]?.GroupCode)
    );
    
    const isBankAccount = selectedCogName?.PrintOrder?.startsWith(
      dropDownState?.bankAccountList?.[0]?.GroupCodeDisplay
    );
    
    setValues((val) => ({
      ...val,
      TypeOfReference: { value: String(filteredData[id]?.AccountTypeID) },
      cogName: selectedCogName || { value: String(filteredData[id]?.GroupCode) },
      acountName: fetchOneData?.AccountName,
      currency: { value: String(filteredData[id]?.CurrencyCode) },
      tradeType: { value: String(filteredData[id]?.TradeTypeID) },
      isBank: isBankAccount || false, // Ye add karo
    }));
    setUpdateData(filteredData);
  } else {
    console.log("Some error occurred");
  }
};

useEffect(() => {
  async function fetchData() {
    let apiResp = await GetConfigurationFinance();
    if (apiResp?.success) {
      const bankAccountList = filterByTypes(
        apiResp?.data,
        [1],
        ["TypeID"],
        "TextField",
        "ValueField",
      );
      console.log()
      setDropDownState((val) => ({
        ...val,
        bankAccountList: bankAccountList,
      }));
    }
  }
  fetchData();
  bindCOGBankData();
  handleBindglobalresources();
}, []);


useEffect(() => {
  if (values?.cogName?.PrintOrder && dropDownState?.bankAccountList?.[0]?.GroupCodeDisplay) {
    const isBankAccount = values.cogName.PrintOrder.startsWith(
      dropDownState.bankAccountList[0].GroupCodeDisplay
    );
    
    setValues((val) => ({
      ...val,
      isBank: isBankAccount,
    }));
  }
}, [values?.cogName?.value, dropDownState?.bankAccountList]);


const handleReactChange = (name, e) => {
  if (name === "cogName") {
    const isBankAccount = e?.PrintOrder?.startsWith(
      dropDownState?.bankAccountList?.[0]?.GroupCodeDisplay,
    );
    
    setValues((val) => ({
      ...val,
      [name]: e,
      isBank: isBankAccount || false,
    }));
  } else {
    setValues((val) => ({ ...val, [name]: e }));
  }
};

  useEffect(() => {
    if (values?.filter?.value) {
      handleBindFilterData(values?.filter?.value);
    }
  }, [values?.filter?.value]);

  const setIsOpen = () => {
    setHandleModelData((val) => ({ ...val, isOpen: false }));
  };

  const handleActionChartOfAccount = async (coaid, isAvtive) => {
    let payload = {
      coaid: coaid,
      isActive: isAvtive,
    };
    let apiResp = await ActionChartOfAccount(payload);
    if (apiResp?.success) {
      notify(apiResp?.message, "success");
      handleBindFilterData(values?.filter?.value);
    } else {
      notify(apiResp?.message, "error");
    }
  };

  const handleSaveChartOfAccount = async (isUpdate, coaID) => {
    let payload = {
      accountTypeID: values?.TypeOfReference?.value || "",
      accountName: values?.acountName || "",
      groupCode: values?.cogName?.value || "",
      currencyCode: values?.currency?.value || "",
      isPreferredForPayment: Number(values?.IsPreferredForPayment?.value || 0),
      isBank: Number(values?.IsBank?.value || 0),
      tradeTypeID: Number(values?.tradeType?.value || 0),
      tradeType: values?.tradeType?.label || "",
      isUpdate: isUpdate,
      isWithholdingTax: Number(values?.IsWithholdingTax?.value || 0),
      withholdingTaxPer: Number(values?.WithholdingTaxPer || 0),
      creditDays: Number(values?.creditDays || 0),
      coaid: storeCoid || 0,

      bankData: combinedBankData.map((bank) => ({
        bankAccount: bank.BankAccount || "",
        bankCode: bank?.BankName?.value || "",
        branchCode: bank?.BranchName?.value || "",
        bankAddress: bank.BankAddress || "",
        bankBranchCode: bank.BankBranchCode || "",
        swiftCode: bank.SwiftCode || "",
      })),
    };
   
    try {
      const apiResp = await SaveChartOfAccount(payload);
      if (apiResp.success) {
        notify(apiResp?.message, "success");
        bindCOGBankData();
        handleBindFilterData(values?.filter?.value);
        setValues({});
        setAddBankData([]);
      } else {
        notify(apiResp?.message, "error");
      }
    } catch (error) {
      notify("An error occurred while fetching data", "error");
    }
  };

  const bankAccDetals = async (COAID) => {
    let payloaddata = {
      filterType: "3",
      coaID: COAID,
    };
    let apiResp = await handlbindCOGGroupsBackendData(payloaddata);
    if (apiResp?.success) {
      handleModel(
        t("Bank Account Details"),
        "60vw",
        "",
        true,
        <Tables
          thead={theadAddBank.slice(0, -1)}
          tbody={apiResp?.data?.map((val, index) => ({
            BankAccount: val.BankAccount,
            BankName: val.BankName,
            BranchName: val.BranchName,
            BankAddress: val.BankAddress,
            BranchCode: val.BranchCode,
            SwiftCode: val.SwiftCode,
          }))}
          // tableHeight={"scrollView"}
          style={{ padding: "2px" }}
        />,
        () => {},
        <></>,
      );
    } else {
      notify(apiResp?.message, "error");
    }
  };
  const handleFormatlabel = (name, label, rest) => (
    <div style={{ color: rest?.IsDisabled == 1 ? "red" : "" }}>{label}</div>
  );

  return (
    <>
      <div className="mt-2 spatient_registration_card">
        <div className="card">
          <div className="patient_registration ">
            <Heading
              name={t("Chart of Account")}
              isBreadcrumb={true}
            />
            <div className="row p-2">
              <div className="col-xl-2 col-md-3 col-sm-4 col-12">
                <div className="d-flex">
                  <ReactSelect
                    placeholderName={t("Account Type")}
                    id="ReferenceType"
                    searchable={true}
                    respclass="w-100 pr-2"
                    name="TypeOfReference"
                    value={values?.TypeOfReference?.value}
                    onChange={(name, e) => handleReactChange(name, e)}
                    dynamicOptions={dropDownState?.BindAcountType}
                    className={`required-fields`}
                    handleFormatlabel={handleFormatlabel}
                  />

                  <div>
                    <button
                      className="btn btn-sm btn-primary"
                      onClick={() =>
                        handleModel(
                          t("Add Account Type"),
                          "20vw",
                          "AccountType",
                          true,
                          <AccountTypeModel
                            handleChangeModel={handleChangeModel}
                            inputData={{
                              userID: userData?.employeeID,
                            }}
                          />,
                          handleSaveNewAccountType,
                        )
                      }
                      type="button"
                    >
                      <i className="fa fa-plus-circle fa-sm new_record_pluse"></i>
                    </button>
                  </div>
                </div>
              </div>
              <ReactSelect
                placeholderName={t("COG Name")}
                searchable={true}
                respclass="col-xl-2 col-md-3 col-sm-4 col-12"
                id={"cogName"}
                name={"cogName"}
                removeIsClearable={true}
                onChange={(name, e) => handleReactChange(name, e)}
                dynamicOptions={dropDownState?.BindCOGName}
                value={values?.cogName?.value}
                className={`required-fields`}
              />
              <Input
                type="text"
                className="form-control required-fields"
                id="AC_Name"
                name="acountName"
                value={values?.acountName ? values?.acountName : ""}
                onChange={handleChange}
                lable={t("Account Name")}
                placeholder=" "
                respclass="col-xl-2 col-md-3 col-sm-4 col-12"
              />
              <ReactSelect
                placeholderName={t("Currency")}
                searchable={true}
                respclass="col-xl-2 col-md-3 col-sm-4 col-12"
                id={"currency"}
                name={"currency"}
                removeIsClearable={true}
                onChange={(name, e) => handleReactChange(name, e)}
                dynamicOptions={dropDownState?.BindCurrency}
                value={values?.currency?.value}
                className={`required-fields`}
              />
              <ReactSelect
                placeholderName={t("Trade Type")}
                searchable={true}
                respclass="col-xl-2 col-md-3 col-sm-4 col-12"
                id={"tradeType"}
                name={"tradeType"}
                removeIsClearable={true}
                onChange={(name, e) => handleReactChange(name, e)}
                dynamicOptions={TradeType}
                value={values?.tradeType?.value}
                className={`required-fields`}
              />
              <Input
                type="number"
                className="form-control"
                id="creditDays"
                name="creditDays"
                value={values?.creditDays ? values?.creditDays : ""}
                onChange={handleChange}
                lable={t("Credit Days")}
                placeholder=" "
                respclass="col-xl-2 col-md-3 col-sm-4 col-12"
              />
              <ReactSelect
                placeholderName={t("Is Withholding Tax")}
                searchable={true}
                respclass="col-xl-2 col-md-3 col-sm-4 col-12"
                id={"IsWithholdingTax"}
                name={"IsWithholdingTax"}
                removeIsClearable={true}
                onChange={(name, e) => handleReactChange(name, e)}
                dynamicOptions={ActionType}
                value={values?.IsWithholdingTax?.value}
              />
              {values?.IsWithholdingTax?.value === "1" && (
                <Input
                  type="number"
                  className="form-control"
                  id="WithholdingTaxPer"
                  name="WithholdingTaxPer"
                  value={
                    values?.WithholdingTaxPer ? values?.WithholdingTaxPer : ""
                  }
                  onChange={handleChange}
                  lable={t("Withholding Tax(%)")}
                  placeholder=" "
                  respclass="col-xl-2 col-md-3 col-sm-4 col-12"
                />
              )}
              {/* {values?.isBank && (
                <>
                  <ReactSelect
                    placeholderName={t("Preferred For Payment")}
                    searchable={true}
                    respclass="col-xl-2 col-md-3 col-sm-4 col-12"
                    id={"IsPreferredForPayment"}
                    name={"IsPreferredForPayment"}
                    removeIsClearable={true}
                    handleChange={(name, e) => handleReactChange(name, e)}
                    dynamicOptions={ActionType}
                    value={values?.IsPreferredForPayment?.value}
                  />
                  <ReactSelect
                    placeholderName={t("Is Bank")}
                    searchable={true}
                    respclass="col-xl-2 col-md-3 col-sm-4 col-12"
                    id={"IsBank"}
                    name={"IsBank"}
                    removeIsClearable={true}
                    handleChange={(name, e) => handleReactChange(name, e)}
                    dynamicOptions={ActionType}
                    value={values?.IsBank?.value}
                  />
                </>
              )} */}
              {values?.isBank === true && (
                <>
                  <ReactSelect
                    placeholderName={t("Preferred For Payment")}
                    searchable={true}
                    respclass="col-xl-2 col-md-3 col-sm-4 col-12"
                    id={"IsPreferredForPayment"}
                    name={"IsPreferredForPayment"}
                    removeIsClearable={true}
                    onChange={(name, e) => handleReactChange(name, e)}
                    dynamicOptions={ActionType}
                    value={values?.IsPreferredForPayment?.value}
                  />
                  <ReactSelect
                    placeholderName={t("Is Bank")}
                    searchable={true}
                    respclass="col-xl-2 col-md-3 col-sm-4 col-12"
                    id={"IsBank"}
                    name={"IsBank"}
                    removeIsClearable={true}
                    onChange={(name, e) => handleReactChange(name, e)}
                    dynamicOptions={ActionType}
                    value={values?.IsBank?.value}
                  />
                </>
              )}
            </div>
          </div>
          <div className="patient_registration ">
            <Heading title={t("Bank Detail")} />
            <div className="row p-2">
              <Input
                type="text"
                className="form-control required-fields"
                id="AC_Number"
                name="acountNumber"
                value={values?.acountNumber ? values?.acountNumber : ""}
                onChange={handleChange}
                lable={t("Bank A/C")}
                placeholder=""
                respclass="col-xl-2 col-md-3 col-sm-4 col-12"
              />

              <ReactSelect
                placeholderName={t("Bank")}
                searchable={true}
                respclass="col-xl-2 col-md-3 col-sm-4 col-12"
                className="required-fields"
                id={"bank"}
                name={"bank"}
                removeIsClearable={true}
                onChange={(name, e) => handleReactChange(name, e)}
                dynamicOptions={[
                  { value: "0", label: "Select" },
                  ...handleReactSelectDropDownOptions(
                    dropDownState?.BindBank,
                    "label",
                    "value",
                  ),
                ]}
                value={values?.bank?.value}
              />

              <ReactSelect
                placeholderName={t("Branch")}
                searchable={true}
                respclass="col-xl-2 col-md-3 col-sm-4 col-12"
                id={"branch"}
                name={"branch"}
                removeIsClearable={true}
                onChange={(name, e) => handleReactChange(name, e)}
                dynamicOptions={[
                  { value: "0", label: "Select" },
                  ...handleReactSelectDropDownOptions(
                    dropDownState?.BindBranch,
                    "label",
                    "value",
                  ),
                ]}
                className="required-fields"
                value={values?.branch?.value}
              />
              <Input
                type="text"
                className="form-control required-fields"
                id="BankAddress"
                name="bankAddress"
                value={values?.bankAddress ? values?.bankAddress : ""}
                onChange={handleChange}
                lable={t("Bank Address")}
                placeholder=""
                respclass="col-xl-2 col-md-3 col-sm-4 col-12"
              />
              <Input
                type="text"
                className="form-control required-fields"
                id="BranchCode"
                name="branchCode"
                value={values?.branchCode ? values?.branchCode : ""}
                onChange={handleChange}
                lable={t("Branch Code")}
                placeholder=""
                respclass="col-xl-1 col-md-3 col-sm-4 col-12"
              />
              <Input
                type="text"
                className="form-control required-fields"
                id="SwiftBranchCode"
                name="swiftBranchCode"
                value={values?.swiftBranchCode ? values?.swiftBranchCode : ""}
                onChange={handleChange}
                lable={t("Swift Code/Branch BIC")}
                placeholder=""
                respclass="col-xl-2 col-md-3 col-sm-4 col-12"
              />
              <button className="btn btn-primary" onClick={handleAddBank}>
                {t("Add")}
              </button>
            </div>
{console.log("combinedBankData",combinedBankData)}
            {combinedBankData.length > 0 && (
              <div className="">
                <HisTable
                  thead={theadAddBank}
                  tbody={combinedBankData?.map((val, index) => ({
                    BankAccount: val.BankAccount,
                    BankName: val.BankName,
                    BranchName: val.BranchName,
                    BankAddress: val.BankAddress,
                    BranchCode: val.BranchCode,
                    SwiftCode: val.SwiftCode,
                    Delete: (
                      <span
                        onClick={() => handleDeleteBank(index)}
                        style={{ color: "red", fontSize: "12px" }}
                      >
                        <FaTrash />
                      </span>
                    ),
                  }))}
                  tableHeight={"scrollView"}
                  style={{ padding: "2px" }}
                />
              </div>
            )}
          </div>
        </div>
        <div className="mt-2 mb-2 d-flex justify-content-end">
          {updateData?.length > 0 ? (
            <button
              className="btn btn-primary mr-1"
              onClick={() => handleSaveChartOfAccount(1)}
            >
              {t("Update")}
            </button>
          ) : (
            <button
              onClick={() => handleSaveChartOfAccount(0)}
              className="btn  px-5 btn-primary mr-1"
            >
              {t("Save")}
            </button>
          )}
        </div>

        <div className="mt-2 patient_registration card">
          <Heading
            title={t("Chart Of Account List")}
            secondTitle={
              <div className="row" style={{ width: "20%", marginRight: "2px" }}>
                <CustomSelect
                  id="filter"
                  placeHolder={t("Filter")}
                  searchable={true}
                  name="filter"
                  value={values?.filter?.value}
                  onChange={(name, e) => handleReactChange(name, e)}
                  option={dropDownState?.BindAcountType?.filter(
                    (val, ind) => val?.value !== "1",
                  )}
                />
              </div>
            }
          />

          {tableFilterData.length > 0 && (
            <div className="">
              <HisTable
                thead={theadFilterTable}
                tbody={tableFilterData?.map((val, index) => ({
                  sno: index + 1,
                  AcType: val?.AccountTypeName,
                  GogName: val?.GroupCodeDisplay + "-" + val?.GroupName,
                  Accountname: (
                    <>
                      <Tooltip
                        target={`#Accountname${index}`}
                        position="top"
                        content={t("Edit Chart of Account Details")}
                        event="hover"
                        className="ToolTipCustom"
                      />
                      <span
                        onDoubleClick={() => {
                          handleUpdateData("3", val?.COAID, "", index);
                        }}
                        id={`Accountname${index}`}
                        style={{ color: "red", fontWeight: "bold" }}
                      >
                        {val?.AccountName}
                      </span>
                    </>
                  ),
                  Currency: val?.CurrencyCode,
                  PrePay: val?.IsPreferredForPayment == 1 ? "Yes" : "No",
                  IsBank: val?.IsBank == 1 ? "Yes" : "No",
                  CreditDays: val?.CreditDays,
                  WithholdingTax:
                    val?.IsWithholdingTax == 1
                      ? "Yes"
                      : "No" + "(" + val?.WithHoldingTaxPer + ")",
                  TradeType: val?.TradeType,
                  EntryBy: val?.EntryBy,
                  EntryDate: val?.EntryDate,
                  bankAccDetals: val?.TotalBankAccounts > 0 && (
                    <i
                      className="fa fa-eye"
                      onClick={() => bankAccDetals(val?.COAID)}
                    ></i>
                  ),
                  Active: val?.IsActive == 1 ? "Yes" : "No",
                  //     Action:
                  //       val?.IsActive == 1 && val?.AccountTypeID > Number(6) ? (
                  //         <span
                  //           onClick={() =>
                  //             handleActionChartOfAccount(val?.COAID, "0")
                  //           }
                  //           style={{ color:
                  //           {handleModelData?.isOpen && (
                  //              style={{ color: "red", fontWeight: "bold" }}
                  //         >
                  //           {t("Active")}
                  //         </span>
                  //       ),
                  //   }))}
                  //   scrollView={"scrollView"}
                  //   isSearch={true}
                  //   style={{ maxHeight: "35vh" }}
                  // />
                  Action:
                    val?.IsActive == 1 && val?.AccountTypeID > Number(6) ? (
                      <span
                        onClick={() =>
                          handleActionChartOfAccount(val?.COAID, "0")
                        }
                        style={{ color: "red", fontWeight: "bold" }}
                      >
                        De-Active
                      </span>
                    ) : (
                      <span
                        onClick={() =>
                          handleActionChartOfAccount(val?.COAID, "1")
                        }
                        style={{ color: "red", fontWeight: "bold" }}
                      >
                        {t("Active")}
                      </span>
                    ),
                }))}
                scrollView={"scrollView"}
                isSearch={true}
                style={{ maxHeight: "35vh" }}
              />
            </div>
          )}
        </div>
      </div>
      <FinanceModal
        visible={handleModelData?.isOpen}
        setVisible={setIsOpen}
        modalWidth={handleModelData?.width}
        Header={t(handleModelData?.label)}
        handleAPI={handleModelData?.handleInsertAPI}
        setModalData={setModalData}
        modalData={modalData}
        footer={handleModelData?.footer}
      >
        {handleModelData?.Component}
      </FinanceModal>
      {/* )} */}
    </>
  );
};

export default index;
