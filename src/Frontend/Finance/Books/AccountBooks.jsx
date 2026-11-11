import React, { useEffect, useState } from "react";
import {
  GetBankReconciliationExcel,
  SearchAccountBookReport,
} from "../../../NetworkServices/finance.js";
// import { html2pdf } from "html2pdf.js";
import {
  filterByTypes,
  handleReactSelectDropDownOptions,
  notify,
} from "../../utils/Utils";
import {
  BindVoucherBillingScreenControls,
  LoadCentreChartOfAccountAPI,
} from "../../../NetworkServices/finance.js";
import ReactSelect from "../../../components/formComponent/ReactSelect";
import { useTranslation } from "react-i18next";
import Heading from "../../../components/UI/Heading";
import DatePicker from "../../../components/formComponent/DatePickerHis";
import moment from "moment";
import { AutoComplete } from "primereact/autocomplete";
import Input from "../../../components/formComponent/Input";
import { PurchaGetBindAllCenter } from "../../../NetworkServices/Purchase.js";
import Tables from "../../../components/UI/customTable";
import { ExcelIconSVG, PDFIconSVG } from "../../../components/SvgIcons";
import IconsColor from "../../../utils/IconsColor";
import { exportHtmlToPDF, exportToExcel } from "../../../utils/exportLibrary";
import { html2pdf } from "html2pdf.js";
import VoucherTablePDF from "./VoucherTablePDF";
import { transformDataInTranslate } from "../../../components/WrapTranslate";
import LabeledInput from "../../../components/formComponent/LabeledInput";
import CustomDateRangePicker from "../../../components/commonComponents/DateRangePicker";
import HisTable from "../../../components/UI/customTable/HisTable";

const AccountBooks = () => {
  const [t] = useTranslation();
  const { VITE_DATE_FORMAT } = import.meta.env;
  const initialValues = {
    currency: {
      label: "INR",
      value: "INR",
      extraColomn: "INR",
    },
    voucherType: {
      label: "Contra Voucher",
      value: "CV",
      extraColomn: "V",
    },
    entryBy: {
      value: "0",
      label: "ALL",
    },
    verifiedBy: {
      value: "0",
      label: "ALL",
    },
    branchCenter: {
      CentreID: 1,
      CentreName: "MOHANDAI OSWAL HOSPITAL",
      IsDefault: 0,
      label: "MOHANDAI OSWAL HOSPITAL",
      value: 1,
    },
    authBy: {
      value: "0",
      label: "ALL",
    },
    toDate: "",
    fromDate: new Date(),
    advancePayment: 0,
  };
  const [values, setValues] = useState({ ...initialValues });
  console.log("values", values);

  const [bodyData, setBodyData] = useState([]);

  useEffect(() => {
    // console.log("Values", values);
  }, [values]);
  useEffect(() => {
    // console.log("bodyData", bodyData);
  }, [bodyData]);
  const [items, setItems] = useState([]);
  const [list, setList] = useState([]);
  const [tableData, setTableData] = useState([]);
  // console.log("TableDat", tableData);

  const [dropDonwState, setDropDownState] = useState({
    Currency: [],
    BranchName: [],
    VoucherType: [],
    Employees: [],
    GetBindAllCenter: [],
  });

  // console.log("ddropdownstate", dropDonwState);

  const handleReactSelect = (name, value) => {
    setValues((val) => ({ ...val, [name]: value }));
  };

  const handleDateChange = (e) => {
    const { value, name } = e?.target;
    setValues((val) => ({ ...val, [name]: value }));
  };

  const handleCheckBoxChange = (field) => {
    setValues((prevValues) => ({
      ...prevValues,
      [field]: !prevValues[field], // Toggle the boolean value
    }));
  };

  const bindListData = async () => {
    let apiResp = await BindVoucherBillingScreenControls(1);
    // console.log("API RESP  FROM BINDLIST ", apiResp);

    if (apiResp?.success) {
      // debugger
      const currency = filterByTypes(
        apiResp?.data,
        [4],
        ["TypeID"],
        "TextField",
        "ValueField",
        "TypeCode",
      );
      const voucherType = filterByTypes(
        apiResp?.data,
        [1],
        ["TypeID"],
        "TextField",
        "ValueField",
        "TypeCode",
      );
      const employees = filterByTypes(
        apiResp?.data,
        [11],
        ["TypeID"],
        "TextField",
        "ValueField",
        "TypeCode",
      );
      const GetBindAllCenter = filterByTypes(
        apiResp?.data,
        [14],
        ["TypeID"],
        "TextField",
        "ValueField",
        "TypeCode",
      );

      // console.log("Currency in the account book", currency);
      if (currency?.length > 0) {
        setValues((val) => ({
          ...val,
          currency: { value: currency[0]["TypeCode"] },
        }));
        setDropDownState((val) => ({
          ...val,
          Currency: currency,
          VoucherType: voucherType,
          Employees: employees,
          GetBindAllCenter: GetBindAllCenter,
        }));
      }
    }

    setList(apiResp?.data);
  };

  const headData = [
    t("S.No."),
    t("Voucher No."),
    t("Voucher Date"),
    t("A/C Name"),
    t("Debit"),
    t("Credit"),
  ];

  const getPurchaGetBindAllCenterAPI = async () => {
    try {
      const GetBindAllCenter = await PurchaGetBindAllCenter();
      setDropDownState((val) => ({
        ...val,
        GetBindAllCenter: handleReactSelectDropDownOptions(
          GetBindAllCenter?.data,
          "CentreName",
          "CentreID",
        ),
      }));
    } catch (error) {
      console.log(error, "SomeThing Went Wrong");
    }
  };

  useEffect(() => {
    bindListData();
    // getPurchaGetBindAllCenterAPI();
  }, []);

  const validateInvestigation = async (e, name) => {
    // debugger;
    if (!values?.voucherType?.value) {
      notify("Please Select Voucher Type", "error");
      return 0;
    }
    const { value } = e;
    // value.branchCentre = { value: userData?.defaultCentre };
    value.balanceType = { value: value?.balanceType };
    setValues((val) => ({ ...val, [name]: "" }));
    setBodyData((val) => ({ ...val, value }));
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

  const search = async (event, name) => {
    // setValues((val) => ({ ...val, [name]: event?.query }));
    if (event?.query?.length > 2) {
      const payload = {
        groupCode: String("0"),
        accountTypeID: 0,
        currencyCode: String(values?.Currency?.value),
        accountName: String(event?.query || ""),
        voucherType: "",
        isTaxDetail: 0,
      };
      let results = await LoadCentreChartOfAccountAPI(payload);
      if (results?.success) {
        setItems(results?.data);
      } else {
        setItems([]);
        // notify(results?.message,"error")
      }
    } else {
      // setItems([])
    }
  };

  const handleSearch = async () => {
    const payload = {
      accountName:
        String(bodyData?.value?.ValueField) === "undefined"
          ? "0"
          : String(bodyData?.value?.ValueField),
      Advance: String(values?.advancePayment||0),
      authBy: String(0),
      branchCentreID: String(values?.branchCenter?.value||0),
      centreID: String(values?.branchCenter?.value||0),
      Currency: String(values?.currency?.value),
      entryBy: String(0),
      FromDate: moment(values?.fromDate).format("DD-MMMM-YYYY"),
      ToDate: values?.toDate ? moment(values?.toDate).format("DD-MMMM-YYYY") : moment(values?.fromDate).format("DD-MMMM-YYYY"),
      verifiedBy: String(0),
      VoucherType: String(values?.voucherType?.value),
      reportType: 1,
    };

    // console.log("Payload Going", payload);

    const resp = await SearchAccountBookReport(payload);
    if (resp?.success) {
      setTableData(resp?.data);
      // notify("Record Found", "success");
    } else {
      notify("Record Not Found", "error");
    }
  };

  const handleExportExcel = async (tableData) => {
    // debugger;
    // let apiResp = await GetBankChargesUploadExcel();
    if (tableData) {
      exportToExcel(transformDataInTranslate(tableData, t), "Account Book");
    } else {
      notify("no Data Found", "error");
    }
  };

  const totalDebit = tableData
    .reduce((sum, ele) => sum + Number(ele?.AmountDr || 0), 0)
    .toFixed(4);
  const totalCredit = tableData
    .reduce((sum, ele) => sum + Number(ele?.AmountCr || 0), 0)
    .toFixed(4);

  const handleDateRangeChange = (e) => {
    const { startDate, endDate } = e.target.value;
    setValues((val) => ({ ...val, fromDate: startDate, toDate: endDate }));
  };
  return (
    <div className="mt-2 card border">
      <Heading name={t("Account Books")} isBreadcrumb={true} />
      <div className="row p-2">
        <ReactSelect
          placeholderName={t("Branch Center")}
          id="branchCenter"
          name="branchCenter"
          value={values?.branchCenter?.value}
          removeIsClearable={true}
          onChange={(name, e) => handleReactSelect(name, e)}
          dynamicOptions={dropDonwState?.GetBindAllCenter}
          searchable={true}
          className={"required-fields"}
          respclass="col-xl-2 col-md-4 col-sm-6 col-12"
        />
        <ReactSelect
          placeholderName={t("Currency")}
          id="currency"
          name="currency"
          value={values?.currency?.value}
          removeIsClearable={true}
          onChange={(name, e) => handleReactSelect(name, e)}
          dynamicOptions={dropDonwState?.Currency}
          searchable={true}
          className={"required-fields"}
          respclass="col-xl-2 col-md-4 col-sm-6 col-12"
        />
        <ReactSelect
          placeholderName={t("Voucher Type")}
          id="voucherType"
          name="voucherType"
          value={values?.voucherType?.value}
          removeIsClearable={true}
          onChange={(name, e) => handleReactSelect(name, e)}
          dynamicOptions={dropDonwState?.VoucherType}
          searchable={true}
          className={"required-fields"}
          respclass="col-xl-2 col-md-4 col-sm-6 col-12"
        />
        {/* <ReactSelect
          placeholderName={t("Entry By")}
          id="entryBy"
          name="entryBy"
          value={values?.entryBy?.value}
          removeIsClearable={true}
          handleChange={(name, e) => handleReactSelect(name, e)}
          dynamicOptions={[
            { value: "0", label: "ALL" }, // ✅ Add the "ALL" option
            ...(dropDonwState?.Employees || []), // ✅ Include existing dynamic options
          ]}
          searchable={true}
          className={"required-fields"}
          respclass="col-xl-2 col-md-4 col-sm-6 col-12"
        />
        <ReactSelect
          placeholderName={t("Verified By")}
          id="verifiedBy"
          name="verifiedBy"
          value={values?.verifiedBy?.value}
          removeIsClearable={true}
          handleChange={(name, e) => handleReactSelect(name, e)}
          dynamicOptions={[
            { value: "0", label: "ALL" }, // ✅ Add the "ALL" option
            ...(dropDonwState?.Employees || []), // ✅ Include existing dynamic options
          ]}
          searchable={true}
          className={"required-fields"}
          respclass="col-xl-2 col-md-4 col-sm-6 col-12"
        />
        <ReactSelect
          placeholderName={t("Auth By")}
          id="authBy"
          name="authBy"
          value={values?.authBy?.value}
          removeIsClearable={true}
          handleChange={(name, e) => handleReactSelect(name, e)}
          dynamicOptions={[
            { value: "0", label: "ALL" }, // ✅ Add the "ALL" option
            ...(dropDonwState?.Employees || []), // ✅ Include existing dynamic options
          ]}
          searchable={true}
          className={"required-fields"}
          respclass="col-xl-2 col-md-4 col-sm-6 col-12"
        /> */}
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
        {/* <DatePicker
          className="custom-calendar"
          inputClassName={"required-fields"}
          respclass="col-xl-2 col-md-4 col-sm-6 col-12"
          id="fromDate"
          name="fromDate"
          value={
            values.fromDate
              ? moment(values?.fromDate, "YYYY-MM-DD").toDate()
              : null
          }
          handleChange={handleDateChange}
          lable={t("FromDate")}
          placeholder={VITE_DATE_FORMAT}
        />
        <DatePicker
          className="custom-calendar"
          inputClassName={"required-fields"}
          respclass="col-xl-2 col-md-4 col-sm-6 col-12"
          id="toDate"
          name="toDate"
          value={
            values.fromDate
              ? moment(values?.toDate, "YYYY-MM-DD").toDate()
              : null
          }
          handleChange={handleDateChange}
          lable={t("To Date")}
          placeholder={VITE_DATE_FORMAT}
        /> */}
        <div className="col-xl-4 col-md-6 col-sm-6 col-12">
          <AutoComplete
            value={values?.AccountType?.TextField
              ? values?.AccountType?.TextField
              : values?.AccountType}
            suggestions={items}
            completeMethod={(e) => {
              search(e, "AccountName", 5);
            }}
            onChange={(e) => setValues({ ...values, AccountType: e.value })}
            className="w-100"
            onSelect={(e) => validateInvestigation(e, "AccountName")}
            id="AccountName"
            itemTemplate={itemTemplate}
            inputClassName={"required-fields"}
          />
          <label
            className="label lable truncate ml-3 p-1"
            style={{ fontSize: "5px !important" }}
          >
            {t("Account Name")}
          </label>
        </div>
        <div className="form-check d-flex align-items-center ml-3">
          <input
            type="checkbox"
            className="form-check-input me-2"
            name="advancepayment"
            id="advancepayment"
            onChange={() => handleCheckBoxChange("advancePayment")}
            checked={values?.advancePayment}
          />
          <label
            className="form-check-label mx-2"
            style={{ fontWeight: "bold" }}
            htmlFor="advancepayment"
          >
            {t("Advance payment")}
          </label>
        </div>
        <button
          className="btn btn-sm btn-success mx-2 mt-1"
          onClick={handleSearch}
        >
          {t("Search")}
        </button>
        {/* {tableData?.length > 0 && (
          <>
            <div className="p-8">
              <PDFIconSVG tableData={tableData} />
            </div>
            <span onClick={() => handleExportExcel(tableData)}>
              <ExcelIconSVG />{" "}
            </span>
          </>
        )} */}
      </div>
      {tableData.length > 0 && (
        <div className="card">
          {/* <Heading title={t("Balance Transfer")} isBreadcrumb={false} /> */}
          <div>
            <div id="printSectionpdf">
              <HisTable
                style={{ maxHeight: "100vh" }}
                thead={headData}
                isExportExcel={true}
                title={"Account Book"}
                isExportPDf={true}
                tbody={tableData?.map((ele, index) => ({
                  SNo: index + 1,
                  VoucherNo: ele?.VoucherNo,
                  VoucherDate: ele?.VoucherDate,
                  AccountName: ele?.AccountName,
                  AmountDr: ele?.AmountDr === 0 ? "0.0000" : ele?.AmountDr,
                  AmountCr: ele?.AmountCr === 0 ? "0.0000" : ele?.AmountCr,
                }))}
              />
              <div className="row mt-2 mr-2 d-flex justify-content-end">
                <LabeledInput
                  className={"col-xl-2 col-md-3 col-sm-4 col-12 mb-2"}
                  label={t("Debit Total")}
                  value={totalDebit}
                />
                <LabeledInput
                  className={"col-xl-2 col-md-3 col-sm-4 col-12 mb-2"}
                  label={t("Credit Total")}
                  value={totalCredit}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AccountBooks;
