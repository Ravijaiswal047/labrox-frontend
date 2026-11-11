import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import CustomDateRangePicker from "../../../components/commonComponents/DateRangePicker";
import ReactSelect from "../../../components/formComponent/ReactSelect";

import LabeledInput from "../../../components/formComponent/LabeledInput";
import MultiSelectComp from "../../../components/formComponent/MultiSelectComp";
import { AutoComplete } from "primereact/autocomplete";
import {
  GetPendingsettleInvoiceAPI,
  LoadCentreChartOfAccountAPI,
} from "../../../NetworkServices/finance.js";
import { notify } from "../../../utils/ustil2";
import moment from "moment";
import Input from "../../../components/formComponent/Input";
import { useLocalStorage } from "../../../utils/hooks/useLocalStorage";
import Heading from "../../../components/UI/Heading";
import Tables from "../../../components/UI/customTable";
import { handleReactSelectDropDownOptions } from "../../utils/Utils";
import HisTable from "../../../components/UI/customTable/HisTable.jsx";

export default function PendingInvoiceModal({
  list,
  PageValue,
  setOldBodyData,
  bodyData,
  validateInvestigationAdd,
  setModalData,
}) {
  const [t] = useTranslation();
  const [items, setItems] = useState([]);
  const userData = useLocalStorage("userData", "get");
  const [tbody, setTbody] = useState([]);
  const [values, setValues] = useState({
    fromDate: new Date(),
    toDate: "",
    searchType: { value: "V", label: "Voucher Number" },
    VoucherType: [],
    PaymentType: { value: "0", label: "All" },
    VoucherTypeList: [],
  });
  function allCOAIDSame(arr) {
    if (!arr.length) return true; // empty array => true
    const first = arr[0].COAID;
    return arr.every(item => item.COAID === first);
  }
  const handleCheckHead = (e) => {
    if (allCOAIDSame(tbody)) {
      const updatedData = tbody.map((item) => ({ ...item, isChecked: e }));
      setTbody(updatedData);
      setValues((val) => ({ ...val, isAllChecked: e }));
    } else {
      setValues((val) => ({ ...val, isAllChecked: false }));
      notify("All Item should be same COAID", "error");
    }

  };
  const thead = [
    { name: t("S.No."), width: "1%" },
    t("Chart OF Group"),
    t("Account Name"),
    t("Pay Mode"),
    t("Voucher No"),
    t("Voucher Date"),
    t("Invoice No."),
    t("Invoice Date"),
    t("Base Amt."),
    t("Amount"),
    // t("Tax"),
    // t("Holded Tax"),
    t("Pending(Base)"),
    t("Pending Amt."),
    t("Paid Amt."),
    {
      name: (
        <input
          type="checkbox"
          className="table-checkbox"
          checked={values.isAllChecked}
          onChange={(e) => {
            handleCheckHead(e?.target?.checked);
          }}
        />
      ),
      width: "1%",
    },
  ];

  useEffect(() => {
    setValues((val) => ({
      ...val,
      VoucherTypeList: list?.filter(
        (item) =>
          item?.TypeID === 1 &&
          PageValue?.VoucherType?.CurrencyCode?.replace(/'/g, "")
            ?.split(",")
            ?.includes(item?.ValueField)
      ),
    }));
  }, []);
  console.log("tbssssssssody", values.isAllChecked);
  const handleDateRangeChange = (e) => {
    const { startDate, endDate } = e.target.value;
    setValues((val) => ({ ...val, fromDate: startDate, toDate: endDate }));
  };
  const handleReactSelect = (name, value) => {
    if (name === "VoucherType") {
      setValues((val) => ({ ...val, [name]: value }));
    } else {
      setValues((val) => ({ ...val, [name]: value }));
    }
  };

  const search = async (event, name) => {
    if (event?.query?.length > 0) {
      const payload = {
        groupCode: String(PageValue?.ChartOfGroup?.value),
        accountTypeID: 0,
        currencyCode: String(PageValue?.Currency?.value),
        accountName: String(event?.query),
        voucherType: String(PageValue?.VoucherType?.value),
      };
      let results = await LoadCentreChartOfAccountAPI(payload);
      if (results?.success) {
        // console.log("values?.VoucherType?.extraColomn", values?.VoucherType?.extraColomn?.split("#"))
        let filterData = [];
        let type = PageValue?.VoucherType?.extraColomn?.split("#")[0];
        if (name === "AccountType") {
          filterData = results?.data?.filter(
            (val) =>
              val?.balanceType === type &&
              val?.CurrencyCode === PageValue?.Currency?.value
          );
        } else {
          filterData = results?.data?.filter(
            (val) => val?.balanceType !== type
          );
        }
        setItems(filterData);
      } else {
        setItems([]);
      }
    } else {
      setItems([]);
    }
  };

  const itemTemplate = (item) => {
    return (
      <div className="p-clearfix">
        <div style={{ float: "left", fontSize: "12px", width: "100%" }}>
          {item?.TextField}
        </div>
      </div>
    );
  };

  const validateInvestigation = async (e, name) => {
    if (!PageValue?.VoucherType?.value) {
      notify("Please Select Voucher Type", "error");
      return 0;
    }
    const { value } = e;

    if (
      ["BP", "CP", "BR", "CR", "CV", "BT"].includes(
        PageValue?.VoucherType?.value
      )
    ) {
      value.RefDate = new Date();
    } else {
      value.InvoiceDate = new Date();
    }

    value.branchCentre = { value: userData?.defaultCentre };
    value.balanceType = { value: value?.balanceType };
    value.ccList = [];
    value.mapList = [];
    setValues((val) => ({ ...val, [name]: value }));
  };

  const handleSearch = async () => {
    if (!values?.VoucherType?.value) {
      notify("Please Select Voucher Type", "error");
      return;
    }
    // values;
    // PageValue;
    // debugger;
    // return;
    const payload = {
      vouchertype: values?.VoucherType?.value || "",
      fromdate: moment(values?.fromDate).format("YYYY-MM-DD"),
      todate: values?.toDate ? moment(values?.toDate).format("YYYY-MM-DD") : moment(values?.fromDate).format("YYYY-MM-DD"),
      coaid: Number(values?.AccountName?.ValueField || 0),
      searchType: values?.searchType?.value || "",
      searchvalue: values?.searchvalue || "",
      currencyCode: PageValue?.Currency?.value,
      currencyConversion: PageValue?.ConversionFactor,
      paymentType: 0,
    };
    const apiResp = await GetPendingsettleInvoiceAPI(payload);
    if (apiResp?.success) {
      setTbody(apiResp?.data);
    } else {
      notify(apiResp?.message, "error");
      setTbody([]);
    }
  };
  const handleCustomInput = (index, name, value) => {
    const list = [...tbody];
    list[index][name] = value;
    setTbody(list);
  };
  const handleChangeCheckbox = (e, val, index) => {
    const findData = tbody
      ?.filter((item) => item?.isChecked)
      ?.find((item) => item?.COAID === val?.COAID);
    if (
      findData?.COAID !== val?.COAID &&
      tbody?.filter((item) => item?.isChecked)?.length !== 0
    ) {
      notify("Please select same COAID", "error");
      return;
    }
    const updatedData = [...tbody];
    updatedData[index]["isChecked"] = e?.target?.checked;
    setTbody(updatedData);
  };

  const handleProceed = () => {
    tbody?.filter((item) => item?.isChecked).map((val) => {
      validateInvestigationAdd(
        {
          value: {
            ...val,
            // Amount:val?.AdjustmentAmount,
            isPendingInvoice: true,
          },
        },
        "AccountName"
      );
    });

    setModalData((val) => ({
      ...val,
      visible: false,
      disableAccountName: true,
    }));
  };
  return (
    <>
      <div className="row">
        <CustomDateRangePicker
          name="dateRange"
          id="dateRange"
          labelKey="dateRange"
          label={t("Select Date Range")}
          startDate={values?.fromDate || null}
          endDate={values?.toDate || null}
          onChange={handleDateRangeChange}
          respClass="col-xl-2 col-md-4 col-sm-6 col-12"
        />
        {/* <MultiSelectComp
        respclass="col-xl-3 col-md-3 col-sm-6 col-12"
        name="VoucherType"
        id="VoucherType"
        placeholderName={t("Voucher Type")}
        dynamicOptions={values?.VoucherTypeList?.map((item) => ({
          ...item,
          name: item?.TextField,
          code: item?.ValueField,
        }))}
        handleChange={handleReactSelect}
        value={values?.VoucherType}
        requiredClassName={true}
      /> */}

        <ReactSelect
          placeholderName={t("Voucher Type")}
          id="VoucherType"
          className={"required-fields"}
          name="VoucherType"
          value={values?.VoucherType?.value}
          onChange={(name, e) => handleReactSelect(name, e)}
          dynamicOptions={handleReactSelectDropDownOptions(
            values?.VoucherTypeList,
            "TextField",
            "ValueField"
          )}
          searchable={true}
          respclass="col-xl-2 col-md-4 col-sm-6 col-12"
        />

        <div className="col-xl-2 col-md-4 col-sm-6 col-12">
          <LabeledInput
            label={t("Currency")}
            value={PageValue?.Currency?.value}
          />
        </div>

        <ReactSelect
          placeholderName={t("Payment Type")}
          id="PaymentType"
          name="PaymentType"
          value={values?.PaymentType?.value}
          onChange={(name, e) => handleReactSelect(name, e)}
          dynamicOptions={[
            { label: "ALL", value: "0" },
            { label: "UnPaid", value: "1" },
            { label: "Partial Paid", value: "2" },
            { label: "Fully Paid", value: "3" },
          ]}
          searchable={true}
          respclass="col-xl-2 col-md-4 col-sm-6 col-12"
        />
        <ReactSelect
          placeholderName={t("Type")}
          id="searchType"
          name="searchType"
          value={values?.searchType?.value}
          removeIsClearable={true}
          onChange={(name, e) => handleReactSelect(name, e)}
          dynamicOptions={[
            { label: "Voucher Number", value: "V" },
            { label: "Invoice Number", value: "I" },
          ]}
          searchable={true}
          respclass="col-xl-2 col-md-4 col-sm-6 col-12"
        />
        <Input
          type="text"
          className="form-control "
          id="searchvalue"
          name="searchvalue"
          value={values?.searchvalue ? values?.searchvalue : ""}
          onChange={(e) => {
            handleReactSelect("searchvalue", e.target.value);
          }}
          lable={t("Search value")}
          placeholder=" "
          respclass="col-xl-2 col-md-4 col-sm-6 col-12"
        />
        <div className="col-xl-5 col-md-8 col-sm-6 col-12">
          <AutoComplete
            value={
              values?.AccountName?.TextField
                ? values?.AccountName?.TextField
                : values?.AccountName
            }
            suggestions={items}
            completeMethod={(e) => {
              search(e, "AccountName");
            }}
            onChange={(e) => setValues({ ...values, AccountName: e.value })}
            className="w-100"
            onSelect={(e) => validateInvestigation(e, "AccountName")}
            id="AccountName"
            itemTemplate={itemTemplate}
          // onBlur={() => {
          //   setValues((prev) => ({
          //     ...prev,
          //     AccountType: "",
          //     AccountName: "",
          //   }));
          // }}
          />
          <label
            className="label lable truncate ml-3 p-1"
            style={{ fontSize: "5px !important" }}
          >
            {t("Account Name")}
          </label>
        </div>
        <button className="btn btn-sm btn-primary px-4" onClick={handleSearch}>
          {" "}
          {t("Search")}{" "}
        </button>
      </div>
      {tbody?.length > 0 && (
        <div className="">
          <Heading title={t("Pending Invoices Details")} />
          <HisTable
            // scrollView={"scrollView"}
            thead={thead}
            tbody={tbody?.map((val, index) => ({
              sno: index + 1,
              GroupName: val?.GroupName,
              AccountName: val?.AccountName,
              PaymentMode: val?.PaymentMode,
              VoucherNo: val?.VoucherNo,
              VoucherDate: val?.VoucherDate,
              BillNo: val?.BillNo,
              BillDate: val?.BillDate,
              BaseAmount: val?.BaseAmount || "0",
              SpecificAmount: val?.SpecificAmount || "0",
              // TaxAmount: val?.TaxAmount||"0",
              // AdjustTaxAmount: val?.AdjustTaxAmount||"0",
              PendingAmtBase: val?.PendingAmtBase || "0",
              PendingSpecificAmount: val?.PendingSpecificAmount || "0",
              AdjustmentAmount: (
                <Input
                  type="number"
                  className={"table-input text-right"}
                  removeFormGroupClass={true}
                  name="AdjustmentAmount"
                  value={val?.AdjustmentAmount ? val?.AdjustmentAmount : ""}
                  onChange={(e) =>
                    handleCustomInput(
                      index,
                      "AdjustmentAmount",
                      e.target.value,
                      "number"
                    )
                  }
                />
              ),
              checkBox: (
                <input
                  type="checkbox"
                  className="table-checkbox"
                  name="isChecked"
                  checked={val?.isChecked}
                  onChange={(e) => {
                    handleChangeCheckbox(e, val, index);
                  }}
                />
              ),
            }))}
          />
          <div className="d-flex justify-content-end mt-2">
            <button
              className="btn btn-sm btn-primary px-4"
              onClick={handleProceed}
            >
              {" "}
              {t("Proceed")}{" "}
            </button>
          </div>
        </div>
      )}
    </>
  );
}
