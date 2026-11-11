import React, { useEffect, useState } from "react";
import ReactSelect from "../../../../components/formComponent/ReactSelect";
import DatePicker from "../../../../components/formComponent/DatePickerHis";
import moment from "moment";
import Heading from "../../../../components/UI/Heading";
import { useTranslation } from "react-i18next";
// import { BreadCrumb } from "primereact/breadcrumb";
import Input from "../../../../components/formComponent/Input";
import { Tabfunctionality } from "../../../../utils/helpers";
import { MOBILE_NUMBER_VALIDATION_REGX } from "../../../../utils/constant";
import CustomDateRangePicker from "../../../../components/commonComponents/DateRangePicker";

import {
  // filterByTypes,
  // inputBoxValidation,
  notify,
} from "../../../../utils/utils";
import ViewVoucher from "./ViewVoucher";

import {
  BindVoucherBillingScreenControls,
  SearchForBoucherPostingBatch,
} from "../../../../NetworkServices/finance.js";
// import { AutoComplete } from "primereact/autocomplete";
import ColorCodingSearch from "../../../../components/commonComponents/ColorCodingSearch";
import { filterByTypes } from "../../../utils/Utils";

const VoucherBatch = () => {
  const { VITE_DATE_FORMAT } = import.meta.env;

  const [t] = useTranslation();
  const [tableData, setTableData] = useState([]);
  const [reload, setReload] = useState(false);

  const [values, setValues] = useState({
    fromDate: new Date(),
    toDate: new Date(),
    currency: "",
    department: { label: "All", value: "0" },
    projectName: { label: "All", value: "0" },
    voucherType: { label: "All", value: "0" },
    accountName: { label: "All", value: "0" },
    entryBy: { label: "All", value: "0" },
    amount: "",
    verifiedBy: { label: "All", value: "0" },
    status: {
      value: "0",
      label: "NO",
    },
    invoiceNo: "",
    symbol: {
      value: 1,
      label: ">=",
    },
    type: {
      value: "1",
      label: "Accountant",
    },
    voucherNo: "",
  });

  const [DropDownState, setDropDownState] = useState({
    country: [],
    project: [],
    department: [],
    employee: [],
    accountName: [],
    projectName: [],
    VoucherType: [],
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setValues({
      ...values,
      [name]: value,
    });
  };
  const searchHandleChange = (e) => {
    const { name, value } = e.target;
    setValues((prevState) => ({
      ...prevState,
      [name]: moment(value).format("YYYY-MM-DD"),
    }));
  };

  const handleSearch = async (isShowTost = true) => {
    console.log("values", values?.currency?.value);
    const payload = {
      currency: String(values?.currency?.value),
      fromDate: moment(values?.fromDate).format("YYYY-MM-DD"),
      toDate: values?.toDate ? moment(values?.toDate).format("YYYY-MM-DD") : moment(values?.fromDate).format("YYYY-MM-DD"),
      department: String(values?.department?.value || values?.department),
      project: String(values?.projectName?.value || values?.projectName),
      voucherType: String(values?.voucherType?.value || values?.voucherType),
      entryBy: String(values?.entryBy?.value || values?.entryBy),
      verifiedBy: String(values?.verifiedBy?.value || values?.verifiedBy),
      accountName: String(values?.accountName?.value || values?.accountName),
      amount: String(values?.amount || "0"),
      amountSearchType: String(values?.symbol?.value || "1"),
      type: String(values?.type?.value || ""),
      status: String(values?.status?.value || ""),
      billNo: String(values?.invoiceNo || ""),
      voucherNo: String(values?.voucherNo || ""),
    };
    try {
      const response = await SearchForBoucherPostingBatch(payload);
      if (response?.success) {
        setTableData(response?.data);
      } else {
        setTableData([]);
        isShowTost && notify(response?.message, "error");
      }
    } catch (error) {
      console.log("error", error);
    }
  };

  const handleReactChange = (name, e) => {
    setValues((val) => ({ ...val, [name]: e }));
  };

  useEffect(() => {
    if (values?.type?.value && values?.status?.value) handleSearch(false);
  }, [values?.type, values?.status, reload]);

  const bindListData = async () => {
    let apiResp = await BindVoucherBillingScreenControls(1);
    if (apiResp?.success) {
      const department = filterByTypes(
        apiResp?.data,
        [2],
        ["TypeID"],
        "TextField",
        "ValueField",
        "TypeCode"
      );
      const country = filterByTypes(
        apiResp?.data,
        [4],
        ["TypeID"],
        "TextField",
        "ValueField",
        "TypeCode"
      );
      const project = filterByTypes(
        apiResp?.data,
        [3],
        ["TypeID"],
        "TextField",
        "ValueField",
        "TypeCode"
      );
      const employee = filterByTypes(
        apiResp?.data,
        [11],
        ["TypeID"],
        "TextField",
        "ValueField",
        "Type"
      );

      const AccountName = filterByTypes(
        apiResp?.data,
        [5],
        ["TypeID"],
        "TextField",
        "ValueField",
        "Type"
      );
      const VoucherType = filterByTypes(
        apiResp?.data,
        [1],
        ["TypeID"],
        "TextField",
        "ValueField",
        "Type"
      );

      if (project?.length === 1) {
        setValues((val) => ({
          ...val,
          ProjectName: { value: project[0]["value"] },
        }));
      }
      if (country?.length > 0) {
        setValues((val) => ({
          ...val,
          currency: { value: country[0]["extraColomn"] },
        }));
      }
      setDropDownState((val) => ({
        ...val,
        currency: country,

        employee: employee,
        accountName: AccountName,
        department: department,
        projectName: project,
        VoucherType: VoucherType,
      }));
    }
  };

  useEffect(() => {
    bindListData();
  }, []);

  const handleDateRangeChange = (e) => {
    const { startDate, endDate } = e.target.value;
    setValues((val) => ({
      ...val,
      fromDate: startDate,
      toDate: endDate,
    }));
  };

  return (
    <>
      <div className="card border">
        <Heading name={"Voucher Posting Batch"} isBreadcrumb={true} />
        <div className="row p-2">
          <ReactSelect
            placeholderName={t("Currency")}
            id={"currency"}
            searchable={true}
            name={"currency"}
            respclass="col-xl-2 col-md-4 col-sm-6 col-12"
            dynamicOptions={DropDownState?.currency}
            onChange={(val, e) => handleReactChange(val, e)}
            value={values?.currency?.value}
            removeIsClearable={false}
            className="required-fields"
          />

          <CustomDateRangePicker
            name="dateRange"
            id="dateRange"
            labelKey="dateRange"
            label={t("Select Date Range")}
            startDate={values.fromDate || null}
            endDate={values.toDate || null}
            onChange={handleDateRangeChange}
            respClass="col-xl-2 col-md-4 col-sm-4 col-12"
          />

          {/* <DatePicker
            className="custom-calendar"
            id="From Data"
            name="fromDate"
            lable={t("From Date")}
            placeholder={VITE_DATE_FORMAT}
            respclass="col-xl-2 col-md-4 col-sm-6 col-12"
            value={
              values.fromDate
                ? moment(values.fromDate, "YYYY-MM-DD").toDate()
                : null
            }
            maxDate={new Date()}
            handleChange={searchHandleChange}
          />
          <DatePicker
            className="custom-calendar"
            id="toDate"
            name="toDate"
            lable={t("To Date")}
            value={
              values.toDate
                ? moment(values.toDate, "YYYY-MM-DD").toDate()
                : null
            }
            maxDate={new Date()}
            handleChange={searchHandleChange}
            placeholder={VITE_DATE_FORMAT}
            respclass="col-xl-2 col-md-4 col-sm-6 col-12"
          /> */}
          <ReactSelect
            placeholderName={t("Department")}
            id={"department"}
            searchable={true}
            name="department"
            respclass="col-xl-2 col-md-4 col-sm-6 col-12"
            dynamicOptions={[
              { label: "All", value: "0" },
              ...DropDownState?.department,
            ]}
            className="required-fields"
            onChange={(name, e) => handleReactChange(name, e)}
            value={values?.department?.value}
          />
          <ReactSelect
            placeholderName={t("Project Name")}
            id={"ProjectName"}
            searchable={true}
            respclass="col-xl-2 col-md-4 col-sm-6 col-12"
            dynamicOptions={[
              { label: "All", value: "0" },
              ...DropDownState?.projectName,
            ]}
            name="projectName"
            onChange={(name, e) => handleReactChange(name, e)}
            value={values?.projectName?.value}
            className="required-fields"
          />
          <ReactSelect
            placeholderName={t("Voucher Type")}
            id={"voucherType"}
            searchable={true}
            respclass="col-xl-2 col-md-4 col-sm-6 col-12"
            dynamicOptions={[
              { label: "All", value: "0" },
              ...DropDownState?.VoucherType,
            ]}
            className="required-fields"
            name="voucherType"
            onChange={(name, e) => handleReactChange(name, e)}
            value={values?.voucherType?.value}
          />

          <ReactSelect
            placeholderName={t("Account Name")}
            id={"accountName"}
            searchable={true}
            respclass="col-xl-2 col-md-4 col-sm-6 col-12"
            className="required-fields"
            dynamicOptions={[
              { label: "All", value: "0" },
              ...DropDownState?.accountName,
            ]}
            name="accountName"
            onChange={(name, e) => handleReactChange(name, e)}
            value={values?.accountName?.value}
          />
          <ReactSelect
            placeholderName={t("Entry By")}
            id={"entryBy"}
            searchable={true}
            respclass="col-xl-2 col-md-4 col-sm-6 col-12"
            className="required-fields"
            dynamicOptions={[
              { label: "All", value: "0" },
              ...DropDownState?.employee,
            ]}
            name="entryBy"
            onChange={(name, e) => handleReactChange(name, e)}
            value={values?.entryBy?.value}
          />
          <ReactSelect
            placeholderName={t("Verified By")}
            id={"verifiedBy"}
            searchable={true}
            respclass="col-xl-2 col-md-4 col-sm-6 col-12"
            className="required-fields"
            dynamicOptions={[
              { label: "All", value: "0" },
              ...DropDownState?.employee,
            ]}
            name="verifiedBy"
            onChange={(name, e) => handleReactChange(name, e)}
            value={values?.verifiedBy?.value}
          />

          <Input
            type="text"
            className="form-control required-fields"
            lable={t("Amount")}
            placeholder=" "
            id="amount"
            name="amount"
            value={values?.amount}
            onChange={handleChange}
            respclass="col-xl-2 col-md-4 col-sm-6 col-12"
            onKeyDown={Tabfunctionality}
          />
          <ReactSelect
            placeholderName={t("Select")}
            id={"symbol"}
            searchable={true}
            respclass="col-xl-2 col-md-4 col-sm-6 col-12"
            //   dynamicOptions={DropDownState?.binddepartment}
            dynamicOptions={[
              {
                value: 1,
                label: ">=",
              },
              {
                value: 2,
                label: "<=",
              },
              {
                value: 3,
                label: "=",
              },
            ]}
            name="symbol"
            onChange={(name, e) => handleReactChange(name, e)}
            value={values?.symbol?.value || "1"}
          />
          <ReactSelect
            placeholderName={t("Type")}
            id={"type"}
            searchable={true}
            respclass="col-xl-2 col-md-4 col-sm-6 col-12"
            //   dynamicOptions={DropDownState?.binddepartment}
            dynamicOptions={[
              { label: "2.Verify", value: "1" },
              { label: "3.Authorize", value: "4" },
              { label: "4.Review", value: "2" },
              { label: "Finalize", value: "5" },
            ]}
            name="type"
            onChange={(name, e) => handleReactChange(name, e)}
            value={values?.type?.value}
          />
          <ReactSelect
            placeholderName={t("Status")}
            id={"status"}
            searchable={true}
            respclass="col-xl-2 col-md-4 col-sm-6 col-12"
            //   dynamicOptions={DropDownState?.binddepartment}
            dynamicOptions={[
              {
                value: "1",
                label: "YES",
              },
              {
                value: "0",
                label: "NO",
              },
            ]}
            removeIsClearable={true}
            name="status"
            onChange={(name, e) => handleReactChange(name, e)}
            value={values?.status?.value}
          />
          <Input
            type="text"
            className="form-control required-fields"
            lable={t("Invoice No.")}
            placeholder=" "
            id="invoiceNo"
            name="invoiceNo"
            value={values?.invoiceNo}
            onChange={handleChange}
            respclass="col-xl-2 col-md-4 col-sm-6 col-12"
            // respclass="col-xl-2 col-md-4 col-sm-6 col-12"
            onKeyDown={Tabfunctionality}
          />
          <Input
            type="text"
            className="form-control required-fields"
            lable={t("Voucher No.")}
            placeholder=" "
            id="voucherNo"
            name="voucherNo"
            value={values?.voucherNo}
            onChange={handleChange}
            respclass="col-xl-2 col-md-4 col-sm-6 col-12"
            onKeyDown={Tabfunctionality}
          />
          <button
            className="btn btn-sm btn-success mx-1"
            onClick={handleSearch}
          >
            {t("Search")}
          </button>
        </div>
      </div>

      {tableData?.length > 0 && (
        <div className="mt-2 spatient_registration_card">
          <div className="patient_registration card">
            <Heading
              isBreadcrumb={false}
              title={t("BillDetails")}
              secondTitle={
                <>
                  <span className="pointer-cursor">
                    <ColorCodingSearch
                      color={"color-indicator-1-bg"}
                      label={t("Pending Verify")}
                    // onClick={() => {
                    //   handleCallViewMedReq("Pending Verify");
                    // }}
                    />
                  </span>
                  <span className="pointer-cursor">
                    <ColorCodingSearch
                      color={"color-indicator-2-bg"}
                      label={t("Verify Approval Done")}
                    // onClick={() => {
                    //   handleCallViewMedReq("Pending Verify");
                    // }}
                    />
                  </span>
                  <span className="pointer-cursor">
                    <ColorCodingSearch
                      color={"color-indicator-3-bg"}
                      label={t("Authorize - Finance Director Approval Done")}
                    // onClick={() => {
                    //   handleCallViewMedReq("Pending Verify");
                    // }}
                    />
                  </span>
                  <span className="pointer-cursor">
                    <ColorCodingSearch
                      color={"color-indicator-4-bg"}
                      label={t("Review Approval Done")}
                    // onClick={() => {
                    //   handleCallViewMedReq("Pending Verify");
                    // }}
                    />
                  </span>
                  <span className="pointer-cursor">
                    <ColorCodingSearch
                      color={"color-indicator-14-bg"}
                      label={t("Finalize")}
                    // onClick={() => {
                    //   handleCallViewMedReq("Pending Verify");
                    // }}
                    />
                  </span>
                  <span className="pointer-cursor">
                    <ColorCodingSearch
                      color={"color-indicator-12-bg"}
                      label={t("Audit Done")}
                    // onClick={() => {
                    //   handleCallViewMedReq("Pending Verify");
                    // }}
                    />
                  </span>
                  <span className="pointer-cursor">
                    <ColorCodingSearch
                      color={"color-indicator-6-bg"}
                      label={t("Revert for review")}
                    // onClick={() => {
                    //   handleCallViewMedReq("Pending Verify");
                    // }}
                    />
                  </span>
                </>
              }
            />
            {/* {

            console.log("values values",values)
          } */}
            <ViewVoucher
              data={tableData}
              values={values}
              setReload={setReload}
              handleSearch={handleSearch}
            />
          </div>
        </div>
      )}
    </>
  );
};

export default VoucherBatch;
