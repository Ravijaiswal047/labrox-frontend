import React, { useEffect, useRef, useState } from "react";

import { useTranslation } from "react-i18next";
import {
  // filterByTypes,
  // handleReactSelectDropDownOptions,
  notify,
} from "../../../../utils/utils";
import ReactSelect from "../../../../components/formComponent/ReactSelect";
import {
  PurchaGetBindAllCenter,
} from "../../../../NetworkServices/Purchase.js";

import { useLocalStorage } from "../../../../utils/hooks/useLocalStorage";
import Heading from "../../../../components/UI/Heading";
import Tables from "../../../../components/UI/customTable";
import Input from "../../../../components/formComponent/Input";
import { BindVoucherBillingScreenControls, SupplierBindBackendData, SaveMapAdvanceWithPurchase } from "../../../../NetworkServices/finance.js";
import DatePicker from "../../../../components/formComponent/DatePickerHis";
import moment from "moment";
import LabeledInput from "../../../../components/formComponent/LabeledInput";
import ChartOfAccount from "../../Reports/ChartOfAccount";
import { Tooltip } from "primereact/tooltip";
import { filterByTypes, handleReactSelectDropDownOptions } from "../../../utils/Utils";
import HisTable from "../../../../components/UI/customTable/HisTable";
const SupplierAdvance = () => {
  const [t] = useTranslation();
  const { VITE_DATE_FORMAT } = import.meta.env;
  const isMobile = window.innerWidth <= 800;
  const [advanceVoucherData, setAdvanceVoucherData] = useState([]);
  const [voucherDetail, setVoucherDetails] = useState([])
  const [totalAdjustment, setTotalAdjustment] = useState(0);
  const [pendingAdvance, setPendingAdvance] = useState(0);
  const [values, setValues] = useState({
    allCenter: {
      CentreID: 1,
      CentreName: "MOHANDAI OSWAL HOSPITAL",
      IsDefault: 0,
      label: "MOHANDAI OSWAL HOSPITAL",
      value: 1,
    },
    currency: "",
    chartOfAC: "",
    fromDate: new Date(),
    toDate: new Date(),
    userType: { label: 'Voucher No.', value: '1' },
    conversionFactor: "",
    advanceVoucher: {
      value: "",
    }
  });
  const VDTHead = [
    { width: "1%", name: t("SNo") },
    { width: "5%", name: t("Branch Center") },
    { width: "5%", name: t("Account(Dept.)") },
    { width: "5%", name: t("Amount") },
    { width: "5%", name: t("Amount(L)") },
    { width: "5%", name: t("Type") },
    { width: "5%", name: t("Currency") },
    { width: "5%", name: t("C.F.") },
    { width: "5%", name: t("Narration") },

  ]

  const [dropDownState, setDropDownState] = useState({
    GetBindAllCenter: [],
    BindVoucherListData: [],
    Currency: [],
    chartOfAC: []
  });


  const handleSelectAll = (e) => {
    setAdvanceVoucherData(advanceVoucherData?.map((val) => ({
      ...val,
      isChecked: e.target.checked,
      AdjustmentAmount: e.target.checked ? val?.BalanceAmount : 0,
    })))
    setTotalAdjustment(e.target.checked ? totalAdjustment : 0)
  };

  const THEAD = [
    { width: "1%", name: t("SNo") },
    {
      name: isMobile ? (
        t("check")
      ) : (
        <input
          type="checkbox"
          className="table-checkbox"
          style={{ marginRight: "20px" }}
          checked={advanceVoucherData?.every((val) => val?.isChecked === true)}
          onChange={handleSelectAll}
        />
      ),
      width: "1%",
    },
    { width: "5%", name: t("Voucher No") },
    { width: "5%", name: t("Voucher Date") },
    { width: "5%", name: t("GRN No") },
    { width: "5%", name: t("Account") },
    { width: "5%", name: t("Pending") },
    { width: "5%", name: t("Adjustment") },
    { width: "1%", name: t("View Details") },
  ];

  const getPurchaGetBindAllCenterAPI = async () => {
    try {
      const GetBindAllCenter = await PurchaGetBindAllCenter();
      setDropDownState((val) => ({
        ...val,
        GetBindAllCenter: handleReactSelectDropDownOptions(
          GetBindAllCenter?.data,
          "CentreName",
          "CentreID"
        ),
      }));
    } catch (error) {
      console.log(error, "SomeThing Went Wrong");
    }
  };

  const bindListData = async () => {
    let apiResp = await BindVoucherBillingScreenControls(1);
    if (apiResp?.success) {
      const BindEmplyee = filterByTypes(
        apiResp?.data,
        [11],
        ["TypeID"],
        "TextField",
        "ValueField"
      );
      const country = filterByTypes(
        apiResp?.data,
        [4],
        ["TypeID"],
        "TextField",
        "ValueField",
        "TypeCode"
      );
      const BindAccount = filterByTypes(
        apiResp?.data,
        [5],
        ["TypeID"],
        "TextField",
        "ValueField"
      );
      const GetBindAllCenter = filterByTypes(
        apiResp?.data,
        [14],
        ["TypeID"],
        "TextField",
        "ValueField"
      );
      const filteredAcName = await BindAccount
        .filter(item => item.label.toLowerCase().includes("suppliers"));
      if (country?.length > 0) {
        setValues((val) => ({
          ...val,
          currency: {
            value: country[0]["TypeCode"],
            isDisabled:
              country[0]["TypeCode"] === country[0]["ValueField"]
                ? true
                : false,
          },
        }));
      }
      const currencyDetails = filterByTypes(
        apiResp?.data,
        [4],
        ["TypeID"],
        "TextField",
        "ValueField"
      );
      setDropDownState((val) => ({
        ...val,
        // BindEmplyee: BindEmplyee,
        Currency: currencyDetails,
        chartOfAC: filteredAcName,
        GetBindAllCenter: GetBindAllCenter,
      }));
    } else {
      // setList([])
    }
  };



  const handleReactChange = (name, e, key) => {
    if (name === "userType") {
      setValues((val) => ({
        ...val,
        voucherGrnData: ""
      }))
    }
    setValues((val) => ({ ...val, [name]: e }));
  };

  const handleChange = (e) => {
    setValues((val) => ({ ...val, [e.target.name]: e.target.value }))
  }

  const handleSearch = async (type, vNO = "") => {
    if (!values?.allCenter) {
      notify("Please Select the Main Center", "error");
      return;
    } else if (!values?.currency) {
      notify("Please Select Currency", "error")
      return;
    } else if (!values?.coa_cog_wise) {
      notify("Please Select Chart of A/C", "error")
      return;
    }

    let payload = {
      type: type,
      centreID: values?.allCenter?.CentreID || 0,
      voucherNo: vNO,
      currencyCode: values?.currency?.value || null,
      filterType: values?.userType?.value || 0,
      filterValue: type == 2 || type == 4 ? values?.voucherGrnData : "",
      fromDate: moment(values?.fromDate).format("DD-MMM-YYYY") || "",
      toDate: moment(values?.toDate).format("DD-MMM-YYYY") || "",
      coaid: values?.coa_cog_wise?.ValueField || 0,
      EntryDetailID: "",
    }
    let apiRes = await SupplierBindBackendData(payload);
    // debugger
    if (apiRes?.success) {
      if (type === 2) {
        setAdvanceVoucherData(apiRes?.data?.map((val) => ({
          ...val,
          "AdjustmentAmount": 0,
          "isChecked": false,
        })))
        setVoucherDetails([])
        handleSearch(4);
        setValues((val) => ({
          ...val,
          advanceVoucher: {
            Balance: 0,
            VoucherNo: "",
            VoucherDate: "",
            CurrencyCode: "",
            VoucherID: 0,
          },
        }))
      } else if (type === 4) {
        setDropDownState((val) => ({
          ...val,
          BindVoucherListData: apiRes?.data
        }))
      } else if (type === 3) {
        setVoucherDetails(apiRes?.data)
      }
    } else {
      type == 4 && setVoucherDetails([])
      type == 2 && setAdvanceVoucherData([]);
      notify(apiRes.message, "error")
    }
  }


  const handleRowSelect = (e, row, index) => {
    const { checked } = e.target

    const updatedData = [...advanceVoucherData]
    updatedData[index]["AdjustmentAmount"] = checked ? row?.BalanceAmount : 0
    updatedData[index]["isChecked"] = checked
    setAdvanceVoucherData(updatedData)
  };

  const handleAdjustmentChange = (index, value) => {
    debugger
    let inputValue = value.trim();
    let newValue = inputValue === "" ? 0 : Number(inputValue);
    if (isNaN(newValue) || newValue < 0) {
      newValue = 0;
    }

    const updatedData = [...advanceVoucherData]
    updatedData[index].AdjustmentAmount = Number(newValue);
    // updatedData.Amount = Number(value);
    setAdvanceVoucherData(updatedData)
  };

  console.log("values", values)

  const handleSave = async (e) => {
    e.preventDefault()
    const filteredData = advanceVoucherData?.filter((val) => val?.isChecked === true);
    if (filteredData?.length === 0) {
      notify("Please Select a Un-adjusted Voucher", "error");
      return
    }
    if (!values?.advanceVoucher) {
      notify("Please select an Advanced Voucher", "error");
      return;
    }

    const advanceVoucherPayload = {
      entryDetailID: values.advanceVoucher.EntryDetailID,
      adjustmentAmount: totalAdjustment,
      PayVoucherEntryDetailID: values.advanceVoucher.EntryDetailID,
    };
    const selectedRowsList = filteredData?.map((row) => ({
      entryDetailID: row?.EntryDetailID,
      adjustmentAmount: row?.AdjustmentAmount,
      PayVoucherEntryDetailID: values.advanceVoucher.EntryDetailID,
    }));

    selectedRowsList.push(advanceVoucherPayload);

    let apiRes = await SaveMapAdvanceWithPurchase(selectedRowsList);
    if (apiRes.success) {
      notify(apiRes.message, "success")
      handleSearch(2)
    } else {
      notify(apiRes?.message, "error")
    }
  }

  useEffect(() => {
    bindListData();
  }, []);

  useEffect(() => {
    // getPurchaGetBindAllCenterAPI();
  }, []);

  useEffect(() => {
    const filteredData = advanceVoucherData?.filter((val) => val?.isChecked);
    const calculatedTotalAdjustment = filteredData?.reduce(
      (total, val) => total + Number(val?.AdjustmentAmount || 0),
      0
    );
    setTotalAdjustment(calculatedTotalAdjustment);
    if (values?.advanceVoucher) {
      setPendingAdvance(
        values.advanceVoucher.Balance - calculatedTotalAdjustment
      );
    } else {
      setPendingAdvance(0 - calculatedTotalAdjustment);
    }

  }, [advanceVoucherData, values?.advanceVoucher]);



  return (
    <div className="mt-2 spatient_registration_card">
      <div className="patient_registration card">
        <Heading
          name={t("Supplier Advance Mapping")}
          isBreadcrumb={true}
        />
        <div className="row p-2">
          <ReactSelect
            placeholderName={t("Center")}
            className={"required-fields"}
            searchable={true}
            respclass="col-xl-2 col-md-4 col-sm-6 col-12"
            id={"allCenter"}
            name={"allCenter"}
            removeIsClearable={true}
            onChange={(name, e) => handleReactChange(name, e)}
            dynamicOptions={dropDownState?.GetBindAllCenter}
            value={values?.allCenter?.value}
            isDisabled={true}
          />
          <ReactSelect
            placeholderName={t("Currency")}
            searchable={true}
            className={"required-fields"}
            respclass="col-xl-2 col-md-4 col-sm-6 col-12"
            id={"currency"}
            name={"currency"}
            removeIsClearable={true}
            onChange={(name, e) => handleReactChange(name, e)}
            dynamicOptions={dropDownState?.Currency}
            value={values?.currency?.value}
          />
          <ReactSelect
            placeholderName={t("")}
            searchable={true}
            respclass="col-xl-2 col-md-4 col-sm-6 col-12"
            id={"userType"}
            name={"userType"}
            removeIsClearable={true}
            onChange={(name, e) => handleReactChange(name, e)}
            dynamicOptions={[
              { label: "Voucher No.", value: "1" },
              { label: "GRN No.", value: "3" },
            ]}
            value={values?.userType?.value}
          />
          <Input
            type="text"
            className="form-control "
            id="voucherGrnData"
            name="voucherGrnData"
            value={values?.voucherGrnData}
            onChange={handleChange}
            lable={t(values?.userType?.label)}
            placeholder=" "
            respclass="col-xl-2 col-md-4 col-sm-6 col-12"
          />
          <ChartOfAccount
            label={"Chart Of A/C"}
            dropDownlist={dropDownState?.chartOfAC}
            VoucherType={"P"}
            setOldPayloadData={setValues}
            Currency={values?.currency?.value}
            required={true}
          />

          <DatePicker
            className="custom-calendar"
            placeholder={VITE_DATE_FORMAT}
            lable={t("From Date")}
            respclass={"col-xl-2 col-md-4 col-sm-6 col-12"}
            name="fromDate"
            id="fromDate"
            maxDate={new Date()}
            value={values?.fromDate ? moment(values.fromDate).toDate() : new Date}
            showTime
            hourFormat="12"
            handleChange={(date) => handleChange(date, "fromDate")}
          />
          <DatePicker
            className="custom-calendar"
            placeholder={VITE_DATE_FORMAT}
            lable={t("To Date")}
            respclass={"col-xl-2 col-md-4 col-sm-6 col-12"}
            name="toDate"
            id="toDate"
            maxDate={new Date()}
            value={values?.toDate ? moment(values.toDate).toDate() : new Date}
            showTime
            hourFormat="12"
            handleChange={(date) => handleChange(date, "toDate")}
          />
          <div className="px-xl-0 px-2 text-right">
            <button
              className="btn btn-sm btn-primary mr-1 "
              onClick={() => { handleSearch(2) }}
            >
              {t("Search")}
            </button>
          </div>
        </div>
      </div>
      {advanceVoucherData.length > 0 && advanceVoucherData.length > 0 &&
        <div className="card">
          <div className=" mt-2 spatient_registration_card">
            <Heading title={t("Un-Adjusted Voucher List")} secondTitle={<>Total Voucher's: {advanceVoucherData?.length}</>} isBreadcrumb={false} />
            <HisTable
              thead={THEAD}
              tbody={advanceVoucherData?.map((val, index) => {
                return {
                  sno: index + 1,
                  "checkbox": (
                    <input
                      type='checkbox'
                      className="table-checkbox"
                      style={{ marginRight: "20px" }}
                      checked={val?.isChecked}
                      onChange={(e) => handleRowSelect(e, val, index)}
                    />
                  ),
                  "Voucher No": val.VoucherNo,
                  "Voucher Date": val.VoucherDate,
                  "GRN No": "",
                  "Amount": val.Amount,
                  "Pendeing": val.BalanceAmount,
                  "Adjustment": (
                    <Input
                      className="table-input"
                      name="AdjustmentAmount"
                      removeFormGroupClass={true}
                      type="text"
                      disabled={!val?.isChecked}
                      onChange={(e) => handleAdjustmentChange(index, e.target.value)}
                      value={val?.AdjustmentAmount}

                    // onChange={(e) => handleAdjustmentChange(index, e.target.value)}
                    // value={isSelected ? adjustmentValues[index] || val.Amount : 0}
                    />
                  ),
                  "View Details": (
                    <span className="fa fa-search" onClick={() => handleSearch(3, val?.VoucherNo)} />
                  ),
                }
              })}
              style={{ maxHeight: "23vh" }}
            />
          </div>

          <div className="mt-2 spatient_registration_card d-sm-flex flex-wrap align-items-center">
            <ReactSelect
              placeholderName={t("Advance Voucher")}
              searchable={true}
              className={"required-fields"}
              respclass="col-xl-2 col-md-2 col-sm-6 col-12"
              id={"advanceVoucher"}
              name={"advanceVoucher"}
              removeIsClearable={true}
              onChange={(name, e) => handleReactChange(name, e)}
              dynamicOptions={dropDownState?.BindVoucherListData?.map((val) => ({
                ...val,
                label: val?.TextField,
                value: val?.EntryDetailID,

              }))}
              value={values?.advanceVoucher?.value}
            />
            <Tooltip
              target={`#find`}
              position="top"
              content={t("Search")}
              event="hover"
              className="ToolTipCustom"
            />

            <button
              id="find"
              className=" btn btn-success mr-1"
              onClick={() => { handleSearch(3, values?.advanceVoucher?.VoucherNo) }}
            >
              <span className="fa fa-search" />
            </button>
            <LabeledInput className={"col-xl-1 col-md-2 col-sm-6 col-12 p-2"} label={t("Payment Mode")} value={values?.advanceVoucher?.PaymentMode} />
            <LabeledInput className={"col-xl-1 col-md-2 col-sm-6 col-12 p-2"} label={t("Amount")} value={values?.advanceVoucher ? `${values?.advanceVoucher?.Balance} ${values?.advanceVoucher?.CurrencyCode}` : ''} />
            <LabeledInput className={"col-xl-2 col-md-2 col-sm-6 col-12 p-2"} label={t("Ref No")} value={values?.advanceVoucher?.RefNo} />
            <LabeledInput className={"col-xl-2 col-md-2 col-sm-6 col-12 p-2"} label={t("Total Adjustment")}
              value={
                totalAdjustment
              }
            />


            <LabeledInput className={"col-xl-2 col-md-2 col-sm-6 col-12  p-2 text-red"} label={t("Pending Advance")}
              value={pendingAdvance}
            />

            <button
              className="btn btn-sm btn-primary mb-2"
              disabled={pendingAdvance < 0 || !values?.advanceVoucher?.value}
              onClick={(e) => { handleSave(e) }}
            >
              {t("Save")}
            </button>

          </div>
          {voucherDetail.length > 0 &&
            <>
              <Heading title={t("Voucher Detail's")} isBreadcrumb={false} />
              <Tables
                thead={VDTHead}
                tbody={voucherDetail?.map((val, index) => {
                  return {
                    sno: index + 1,
                    "Branch Center": val?.BranchCentre,
                    "Account(Dept.)": val?.AccountName,
                    "Amount": val?.AmountBase,
                    "Amount(L)": val?.AmountSpecific,
                    "Type": val?.BalType,
                    "Currency": val?.CurrencyCode,
                    "C.F": val?.TransCurrFactor,
                    "Narration": val?.Remarks,

                  }
                })}
              />

              <div style={{ display: "flex", justifyContent: "end" }}>
                <LabeledInput label={t("Voucher Amount")} className={"col-xl-2 col-md-2 col-sm-6 col-12 p-2 mt-2"} value={voucherDetail?.length > 0 ? `${voucherDetail[0].AmountBase}` : ''} />

              </div>
            </>
          }
        </div>
      }
    </div >
  );
};

export default SupplierAdvance;
