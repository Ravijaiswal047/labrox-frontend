import React, { useEffect, useState } from "react";
import ReactSelect from "../../../components/formComponent/ReactSelect";
import { filterByTypes } from "../../utils/Utils";
import { useTranslation } from "react-i18next";
import { bindVoucherBillingScreenControls } from "../../../NetworkServices/Pettycash";
import DatePicker from "../../../components/formComponent/DatePickerHis";
import {
  ChequePrint,
  FinancePaymentRemittanceAdvicePrint,
  FinanceSupplierAdvanceMappingBindBackendData,
  FinanceVoucherPrint,
  LoadCentreChartOfAccountAPI,
} from "../../../NetworkServices/finance.js";
import Heading from "../../../components/UI/Heading";
import Tables from "../../../components/UI/customTable";
import { RedirectURL } from "../../../NetworkServices/PDFURL";
import Input from "../../../components/formComponent/Input";
import moment from "moment";
import { notify } from "../../../utils/ustil2";
import CustomSelect from "../../../components/formComponent/CustomSelect";
import { AutoComplete } from "primereact/autocomplete";
import PrintMenu from "../../../components/commonComponents/PrintMenu";
import CommonSeeMoreList from "../../../components/commonComponents/CommonSeeMoreList";
import CustomTooltip from "../../../components/formComponent/CustomTooltip";
import AlignTableText from "../../../components/commonComponents/AlignTableText";
import { number } from "yup";
import HisTable from "../../../components/UI/customTable/HisTable";
import { axiosReport } from "../../../utils/axiosInstance.jsx";
import CustomTooltipHis from "../../../components/formComponent/CustomTooltipHis.jsx";

const VoucherPrinting = () => {
  const [t] = useTranslation();
  const isMobile = window.innerWidth <= 768;

  const [values, setValues] = useState({
    voucherType: { label: "All", value: "0" },
    voucherCancel: { label: "All", value: "2" },
    fromDate: new Date(),
    toDate: new Date(),
  });
  const [items, setItems] = useState([]);
  console.log("values", values);
  const [allData, setAllData] = useState([]);
  const [tableData, setTableData] = useState([]);
  const [dropDownState, setDropDownState] = useState({
    PrintType: [
      { label: "Print", value: "Print" },
      { label: "Payment Advice", value: "paymentAdvice" },
      { label: "Print & Payment Advice", value: "Print & Payment Advice" },
    ],
  });

  const THEAD = [
    { name: t("S.No."), width: "1%" },
    { name: t("Voucher Type") },
    { name: t("Voucher No.") },
    { name: t("Voucher Date.") },
    { name: t("CR A/C") },
    { name: t("DR A/C") },
    { name: t("Currency") },
    { name: t("Amount"), textAlign: "right" },
    { name: t("Entry By") },
    { name: t("Entry Date") },
    { name: t("Is Cancel") },
    { name: t("Print") },
  ];

  const handlebindVoucherBillingScreenControls = async (data) => {
    try {
      const response = await bindVoucherBillingScreenControls(data);

      // var responseData = PageChache.filter(function (i) { return i.TypeID == 13 && i.TypeCode == 'ET' });
      if (response.success) {
        setAllData(response.data);
      } else {
        console.error(
          "API returned success as false or invalid response:",
          response
        );
        setAllData([]);
      }
    } catch (error) {
      console.error("Error fetching department data:", error);
      setAllData([]);
    }
  };

  useEffect(() => {
    setValues((val) => ({
      ...val,
      branchCenter: filterByTypes(
        allData,
        [14],
        ["TypeID"],
        "TextField",
        "ValueField",
        "STD_CODE"
      )[0],
      Currency: filterByTypes(
        allData,
        [4],
        ["TypeID"],
        "TextField",
        "ValueField",
        "STD_CODE"
      )[0],
    }));
  }, [allData]);

  const handleSelect = async (name, value) => {
    setValues((val) => ({
      ...val,
      [name]: value,
    }));

  //   if (name === "voucherCancel") {
  //   handleSearch();
  // }
  };

  const handleChange = (e) => {
    setValues((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  useEffect(() => {
    handlebindVoucherBillingScreenControls(1);
  }, []);

  const handleSearch = async () => {
    if (!values?.fromDate) {
      notify("Please Select From Date", "error");
      return 0;
    } else if (!values?.toDate) {
      notify("Please Select To Date", "error");
      return 0;
    } else if (!values?.branchCenter?.value) {
      notify("Please Select Branch Center", "error");
      return 0;
    } else if (!values?.Currency?.value) {
      notify("Please Select Currency", "error");
      return 0;
    } else if (!values?.voucherType?.value) {
      notify("Please Select Voucher Type", "error");
      return 0;
    }
    const payload = {
      currency: values?.Currency?.value,
      voucherType: values?.voucherType?.value,
      fromDate: moment(values?.fromDate).format("DD-MMM-YYYY"),
      toDate: moment(values?.toDate).format("DD-MMM-YYYY"),
      accountName: values?.ValueField?.ValueField,
      voucheNo: values?.voucherNo,
      branchCentreID: values?.branchCenter?.value,
    };

    const response =
      await FinanceSupplierAdvanceMappingBindBackendData(payload);
    if (response?.success) {
      let filterData = [];
      let type = values?.voucherCancel?.value;
      if (type !== "2") {
        filterData = response?.data?.filter(
          (val) => val?.IsCancel === Number(type)
        );
        setTableData(filterData);
      } else {
        setTableData(response?.data);
      }

      // notify(response?.message, "success");
    } else {
      notify(response?.message, "error");
      setTableData([]);
    }
  };

  const handlePrint = async (value, index) => {
    const payload = {
      voucherNo: value?.VoucherNo,
    };
    
    const response = await FinanceVoucherPrint(payload);
    // debugger
    // RedirectURL(response?.data?.pdfUrl);
    // if (response?.success) {
    //   notify(response?.message, "success");
    // } else {
    //   notify(response?.message, "error");
    // }
  };


  const handlePaymentAdvicePrint = async (value, index) => {
    const payload = {
      voucherNo: value?.VoucherNo,
    };

    const response = await FinancePaymentRemittanceAdvicePrint(
      payload?.voucherNo
    );
    // if (response?.success) {
    //   RedirectURL(response?.data?.pdfUrl);
    //   notify(response?.message, "success");
    // } else {
    //   notify(response?.message, "error");
    // }
  };
  const handleCheckPrint = async (value, index) => {
    const payload = {
      voucherNo: value?.VoucherNo,
    };

    const response = await ChequePrint(payload?.voucherNo);
    if (response?.success) {
      RedirectURL(response?.data?.pdfUrl);
      notify(response?.message, "success");
    } else {
      notify(response?.message, "error");
    }
  };

  // const handleCheckPrint = (value, index)=>{
  //   axiosReport
  //   post (`FinanceReports/VoucherPrint${value?.VoucherNo}`)
  //   .then((response) => {
  //     if (response?.data?.success) {
  //       RedirectURL(response?.data?.data?.pdfUrl);
  //       notify(response?.data?.message, "success");
  //     } else {
  //       notify(response?.data?.message, "error");
  //     }
  //   })
  //   .catch((error) => {
  //     notify("Something went wrong", "error");
  //   });
    
  // }

  const handleCustomInput = (index, name, value) => {
    const updatedBodyData = [...tableData];
    updatedBodyData[index][name] = value;

    setTableData(updatedBodyData);
  };

  const validateInvestigation = async (e, name) => {};

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
    if (event?.query?.length > 0) {
      const payload = {
        groupCode: String(0),
        accountTypeID: 0,
        currencyCode: String(values?.Currency?.value),
        accountName: String(event?.query),
        voucherType: String(values?.voucherType?.value),
      };
      let results = await LoadCentreChartOfAccountAPI(payload);
      if (results?.success) {
        let filterData = [];
        let type = values?.VoucherType?.extraColomn?.split("#")[0];
        if (name === "AccountType") {
          filterData = results?.data?.filter(
            (val) =>
              val?.balanceType === type &&
              val?.CurrencyCode === values?.Currency?.value
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

  const getRowClass = (val) => {
    if (val?.isCancel === "Yes") {
      return "color-indicator-2-bg";
    }
  };

  return (
    <div className="card mt-2">
      <Heading name={"Voucher Printing"} isBreadcrumb={true} />
      <div className="row p-2">
        <ReactSelect
          className={"required-fields"}
          placeholderName={t("Branch Center")}
          id={"branchCenter"}
          searchable={true}
          removeIsClearable={true}
          respclass="col-xl-2 col-md-4 col-sm-4 col-sm-4 col-12"
          dynamicOptions={[
            ...filterByTypes(
              allData,
              [14],
              ["TypeID"],
              "TextField",
              "ValueField",
              "STD_CODE"
            ),
          ]}
          onChange={handleSelect}
          value={`${values?.branchCenter?.value}`}
          name={"branchCenter"}
        />
        <ReactSelect
          className={"required-fields"}
          placeholderName={t("Currency")}
          id={"Currency"}
          searchable={true}
          removeIsClearable={true}
          respclass="col-xl-2 col-md-4 col-sm-4 col-sm-4 col-12"
          dynamicOptions={[
            ...filterByTypes(
              allData,
              [4],
              ["TypeID"],
              "TextField",
              "ValueField",
              "STD_CODE"
            ),
          ]}
          onChange={handleSelect}
          value={`${values?.Currency?.value}`}
          name={"Currency"}
        />
        <ReactSelect
          className={"required-fields"}
          placeholderName={t("Voucher Type")}
          id={"voucherType"}
          searchable={true}
          removeIsClearable={true}
          respclass="col-xl-2 col-md-4 col-sm-4 col-sm-4 col-12"
          dynamicOptions={[
            { label: "All", value: "0" },
            ...filterByTypes(
              allData,
              [1],
              ["TypeID"],
              "TextField",
              "ValueField",
              "STD_CODE"
            ),
          ]}
          onChange={handleSelect}
          value={`${values?.voucherType?.value}`}
          name={"voucherType"}
        />
        <DatePicker
          id="fromDate"
          className="custom-calendar"
          name="fromDate"
          lable={t("From Date")}
          value={values?.fromDate}
          handleChange={handleChange}
          respclass="col-xl-2 col-md-4 col-sm-6 col-12"
        />

        <DatePicker
          id="toDate"
          className="custom-calendar"
          name="toDate"
          lable={t("To Date")}
          value={values?.toDate}
          handleChange={handleChange}
          respclass="col-xl-2 col-md-4 col-sm-6 col-12"
        />

        <Input
          type="text"
          className="form-control"
          id="voucherNo"
          placeholder=" "
          name="voucherNo"
          value={values?.voucherNo || ""}
          onChange={handleChange}
          lable={t("Voucher No")}
          respclass="col-xl-2 col-md-4 col-sm-6 col-12"
        />
        <ReactSelect
          className={"required-fields"}
          placeholderName={t("Voucher Cancel")}
          id={"voucherCancel"}
          searchable={true}
          removeIsClearable={true}
          respclass="col-xl-2 col-md-4 col-sm-4 col-sm-4 col-12"
          dynamicOptions={[
            { label: "All", value: "2" },
            { label: "Yes", value: "1" },
            { label: "No", value: "0" },
          ]}
          onChange={handleSelect}
          
          value={`${values?.voucherCancel?.value}`}
          name={"voucherCancel"}
        />
        <div className="col-xl-4 col-md-8 col-sm-6 col-12">
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
        <button className="btn btn-sm btn-primary" onClick={handleSearch}>
          {t("Search")}
        </button>
      </div>
      <div>
        <Heading title={"Search Details"} isBreadcrumb={false} />
        <HisTable
          thead={THEAD}
          tbody={tableData?.map((val, index) => {
            const dataDropDown = [
              {
                label: "Print",
                icon: (
                  <span
                    style={{ color: "blue" }}
                    className="fa fa-print"
                  ></span>
                ),
                onClick: () => handlePrint(val),
              },
              val?.IsAdvicePrint === 1 && {
                label: "Payment Advice",
                icon: (
                  <span
                    style={{ color: "blue" }}
                    className="fa fa-print"
                  ></span>
                ),
                onClick: () => handlePaymentAdvicePrint(val),
              },
              val?.IsChequePrint === 1 && {
                label: "Cheque Print",
                icon: (
                  <span
                    style={{ color: "blue" }}
                    className="fa fa-print"
                  ></span>
                ),
                onClick: () => handleCheckPrint(val),
              },
            ];
            return {
              "s.no": index + 1,
              voucherType: val?.VoucherName,
              voucherNo: val?.VoucherNo,
              voucherDate: val?.VoucherDate,
              // crAccount: (val?.CR),
              crAccount: (
                <CustomTooltipHis
                  id={`CR${index}`}
                  content={val?.CR}
                  icon={
                    <i id={`CR${index}`}>
                      {" "}
                      {val?.CR?.length > 30
                        ? val?.CR?.substring(0, 30) + "..."
                        : val?.CR}{" "}
                    </i>
                  }
                />
              ),
              drAccount: (
                <CustomTooltipHis
                  id={`DR${index}`}
                  content={val?.DR}
                  icon={
                    <i id={`DR${index}`}>
                      {" "}
                      {val?.DR?.length > 30
                        ? val?.DR?.substring(0, 30) + "..."
                        : val?.DR}{" "}
                    </i>
                  }
                />
              ),
              Currency: val?.CurrencyCode,
              Amount: (
                <AlignTableText value={val?.AmountDisplay} isAmount={true} />
              ),
              EntryBy: val?.EntryBy,
              EntryDate: val?.EntryDate,
              isCancel: val?.IsCancel === 0 ? "No" : "Yes",
              Print: (
                // <PrintMenu
                //   options={[
                //     {
                //       label: "Print",
                //       onClick: () => handlePrint(val),
                //     },
                //     val?.IsAdvicePrint === 1
                //       ? {
                //           label: "Payment Advice",
                //           onClick: () => handlePaymentAdvicePrint(val),
                //         }
                //       : [],
                //     val?.IsAdvicePrint === 1
                //       ? {
                //           label: "Payment Cheque",
                //           onClick: () => handleCheckPrint(val),
                //         }
                //       : [],
                //   ]}
                // />
                <CommonSeeMoreList
                  name=""
                  icon={<span className="fa fa-print mr-2"></span>}
                  items={dataDropDown}
                />
              ),
              // Print: (
              //   <span
              //     className="fa fa-print"
              //     onClick={() => handlePrint(val)}
              //   ></span>
              // ),
              // PaymentAdvice: (
              //   <span
              //     className="fa fa-print"
              //     onClick={() => handlePaymentAdvice(val)}
              //   ></span>
              // ),
            };
          })}
          style={!isMobile ? { minHeight: "10vh", maxHeight: "50vh" } : {}}
          getRowClass={getRowClass}
        />
      </div>
    </div>
  );
};

export default VoucherPrinting;
