import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { PaybleAgingSummary } from "../../../NetworkServices/finance.js";
import { useSelector } from "react-redux";
import Heading from "../../../components/UI/Heading";
import MultiSelectComp from "../../../components/formComponent/MultiSelectComp";
import ReactSelect from "../../../components/formComponent/ReactSelect";
import {
  filterByTypes,
  handleReactSelectDropDownOptions,
  notify,
} from "../../utils/Utils";
import DatePicker from "../../../components/formComponent/DatePickerHis";
import moment from "moment";

import {
  BindPayableGroup,
  BindReportControlsAPI,
  GetGLReport,
} from "../../../NetworkServices/finance.js";
import Tables from "../../../components/UI/customTable";
import { ExcelIconSVG, PDFIconSVG } from "../../../components/SvgIcons";

import {
  exportHtmlToExcel,
  exportHtmlToPDFNoPrint,
  exportHtmlToPDFNoPrintFinance,
  exportToExcel,
} from "../../../utils/exportLibrary";
import { transformDataInTranslate } from "../../../components/WrapTranslate";
import PayableTablePDF from "./PayableTablePDF";
import { AutoComplete } from "primereact/autocomplete";
import { useLocalStorage } from "../../../utils/hooks/useLocalStorage";
import ChartOfAccount from "./ChartOfAccount";
import { formatAmount, handleTotalTable } from "../../../utils/ustil2";
import {
  matchBaseCentreWithCentre,
  SelectedBranchCentre,
} from "../../../utils/constant";
import AlignTableText from "../../../components/commonComponents/AlignTableText";
import HisTable from "../../../components/UI/customTable/HisTable.jsx";

const PayableAgingSummary = ({ dropDownlist, values }) => {
  const userData = useLocalStorage("userData", "get");
  const newSession = useLocalStorage("newSession", "get");

  const [t] = useTranslation();
  const [payloadData, setPayloadData] = useState({
    Currency: {
      label: userData?.centreCurrency,
      value: userData?.centreCurrency,
    },
    BranchCentre: [],
    TradeType: {
      label: "All",
      value: "0",
    },
    AgeingType: {
      label: "Day Basis",
      value: "1",
    },
    COG: {
      label: "All",
      value: "0",
    },
    DateType: {
      label: "Voucher Date",
      value: "1",
    },
    AsOnDate: newSession ? new Date(newSession) : new Date(),
  });
  useEffect(() => {
    setPayloadData((val) => ({
      ...val,
      BranchCentre: [userData.MainCentreID],
    }));
  }, [values?.Centre?.length]);
  const thead = [
    { width: "1%", name: t("S.No") },
    { width: "5%", name: t("Trade Type") },
    { width: "5%", name: t("COG") },
    { width: "5%", name: t("A/C Name") },
    { width: "2%", name: t("Total Inv Amt"), textAlign: "right" },
    { width: "2%", name: t("Adjusted Amt"), textAlign: "right" },
    { width: "2%", name: t("Pending Amount"), textAlign: "right" },
    { width: "2%", name: t("Credit Days"), textAlign: "right" },
    {
      width: "2%",
      name:
        payloadData?.AgeingType?.label == "Day Basis" ? t("0-30") : t("1 Year"),
      textAlign: "right",
    },
    {
      width: "2%",
      name:
        payloadData?.AgeingType?.label == "Day Basis"
          ? t("31-60")
          : t("2 Year"),
      textAlign: "right",
    },
    {
      width: "2%",
      name:
        payloadData?.AgeingType?.label == "Day Basis"
          ? t("61-90")
          : t("3 Year"),
      textAlign: "right",
    },
    {
      width: "2%",
      name:
        payloadData?.AgeingType?.label == "Day Basis"
          ? t("91-120")
          : t("4 Year"),
      textAlign: "right",
    },
    {
      width: "2%",
      name:
        payloadData?.AgeingType?.label == "Day Basis"
          ? t("121-180")
          : t("5 Year"),
      textAlign: "right",
    },
    {
      width: "2%",
      name:
        payloadData?.AgeingType?.label == "Day Basis"
          ? t("Above 180")
          : t("5 Year Above"),
      textAlign: "right",
    },
  ];
  const [bindpayble, SetBindPayable] = useState([]);
  const [reportControlList, setReportControlList] = useState([]);
  // const { GetEmployeeWiseCenter } = useSelector((state) => state.CommonSlice);
  const { VITE_DATE_FORMAT } = import.meta.env;
  const [tbodyData, setTbodyData] = useState([]);
  const getBindReportControls = async () => {
    let apiResp = await BindReportControlsAPI();
    if (apiResp?.success) {
      setReportControlList(apiResp?.data);
    } else {
      setReportControlList([]);
    }
  };

  console.log(bindpayble);

  const getBindPayableGroup = async () => {
    const apiResp = await BindPayableGroup();
    if (apiResp?.success) {
      SetBindPayable(apiResp?.data);
    } else {
      SetBindPayable([]);
    }
  };

  useEffect(() => {
    getBindReportControls();
    getBindPayableGroup();
  }, []);
  const handleMultiSelectChange = (name, selectedOptions) => {
    setPayloadData({
      ...payloadData,
      [name]: selectedOptions,
    });
  };
  const handleChange = (e) => {
    setPayloadData((val) => ({ ...val, [e.target.name]: e.target.value }));
  };
  console.log(payloadData);

  const handleSearch = async () => {
    const centreID = values?.Centre?.map((val) => val).join(",");
    const BranchCentre = payloadData?.BranchCentre?.map(
      (val) => val
    ).join(",");
    if (!centreID) {
      notify("Please select Centre", "error");
      return;
    } else if (!BranchCentre) {
      notify("Please select Branch Centre", "error");
      return;
    }
    let data = {
      ACFilterType: 4,
      ACFilterValue: payloadData?.coa_cog_wise?.ValueField || "",
      CentreID: centreID || "",
      BranchCentreID: BranchCentre || "",
      CurrencyCode: payloadData?.Currency?.value || "",
      AsOnDate: moment(payloadData?.AsOnDate).format("DD-MMM-YYYY") || "",
      AgeingType: Number(payloadData?.AgeingType?.value) || 0,
      TradeType: payloadData?.TradeType?.value || 0,
      DateFilterType: payloadData?.DateFilterType?.value || 0,
      COGCode: payloadData?.COG?.value || "",
      ReportName: "Payable Aging Summary",
      type: Number(values?.Type?.value || 0),
    };

    let apiResp = await PaybleAgingSummary(data);
    if (apiResp.success) {
      setTbodyData(apiResp.data);
    } else {
      setTbodyData([]);
      notify(apiResp?.message, "error");
    }
  };

  const handleSelect = (name, value) => {
    setPayloadData((val) => ({ ...val, [name]: value }));
    if (name === "AgeingType") {
      setTbodyData([]);
    }
  };

  const handleExportPDF = () => {
    exportHtmlToPDFNoPrintFinance(
      "printSectionpdf",
      values?.reportType?.label,
      "landscape"
    );
  };

  const exportToExcelReport = (data) => {
    exportToExcel(data, values?.reportType?.label);
  };

  const getRowClass=(val)=>{
    if(val?.Sr===""){
      return "color-indicator-2-bg"
    }else{
      return""
    }

  }
  return (
    <>
      <MultiSelectComp
        className="col-xl-2 col-md-4 col-sm-6 col-12"
        name="BranchCentre"
        id="BranchCentre"
        // placeholderName={t("Branch Centre")}
        label={t("Branch Centre")}
        options={matchBaseCentreWithCentre(
          dropDownlist?.BranchCentre,
          values?.Centre
        )}
        // dynamicOptions={dropDownlist?.BranchCentre}
        onChange={handleMultiSelectChange}
        value={payloadData?.BranchCentre}
        requiredClassName={`required-fields`}
      />

      {/* <ReactSelect
        placeholderName={t("Currency")}
        id="Currency"
        name="Currency"
        requiredClassName={`required-fields`}
        value={payloadData?.Currency?.value}
        removeIsClearable={true}
        handleChange={(name, value) =>
          setPayloadData((val) => ({ ...val, [name]: value }))
        }
        dynamicOptions={dropDownlist?.CurrencyList}
        searchable={true}
        respclass="col-xl-2 col-md-3 col-sm-6 col-12"
      /> */}
      <ReactSelect
        placeholderName={t("Trade Type")}
        id="TradeType"
        name="TradeType"
        value={payloadData?.TradeType?.value}
        removeIsClearable={true}
        onChange={handleSelect}
        dynamicOptions={[
          { label: "All", value: "0" },
          { label: "Trade", value: "1" },
          { label: "Non Trade", value: "2" },
          { label: "Other", value: "3" },
        ]}
        searchable={true}
        respclass="col-xl-2 col-md-3 col-sm-6 col-12"
      />
      <ReactSelect
        placeholderName={t("Date Type")}
        id="DateType"
        name="DateType"
        value={payloadData?.DateType?.value}
        removeIsClearable={true}
        onChange={handleSelect}
        dynamicOptions={[
          { label: "Voucher Date", value: "1" },
          { label: "Bill Date", value: "2" },
        ]}
        searchable={true}
        respclass="col-xl-2 col-md-3 col-sm-6 col-12"
      />

      <ChartOfAccount
        label={"Chart of A/C"}
        dropDownlist={dropDownlist}
        VoucherType={"P"}
        setOldPayloadData={setPayloadData}
        Currency={payloadData?.Currency?.value}
      />

      <ReactSelect
        placeholderName={t("Ageing Type")}
        id="AgeingType"
        name="AgeingType"
        value={payloadData?.AgeingType?.value}
        removeIsClearable={true}
        onChange={handleSelect}
        dynamicOptions={[
          { label: "Day Basis", value: "1" },
          { label: "Yearly Basis", value: "2" },
        ]}
        searchable={true}
        respclass="col-xl-2 col-md-3 col-sm-6 col-12"
      />

      <DatePicker
        requiredClassName={`required-fields`}
        className="custom-calendar"
        placeholder={VITE_DATE_FORMAT}
        lable={t("As On")}
        respclass={"col-xl-2 col-md-3 col-sm-6 col-12"}
        id="AsOnDate"
        name="AsOnDate"
        maxDate={new Date()}
        value={payloadData?.AsOnDate}
        showTime
        hourFormat="12"
        handleChange={(date) => handleChange(date, "toDate")}
      />

      <div className="col-xl-4 col-md-4 col-sm-6 col-12  mb-2">
        <button
          className="btn btn-sm btn-primary  px-3   "
          onClick={handleSearch}
          type="button"
        >
          {t("Search")}
        </button>
      </div>
      {tbodyData?.length > 0 && (
        <div id="printSectionpdf" className="w-100">
          <Heading
            title={t(values?.reportType?.label)}
            secondTitle={
              <>
                <span onClick={handleExportPDF} className="no-print">
                  <PDFIconSVG />
                </span>
   <span
              onClick={() => exportHtmlToExcel(
                  "printSectionpdf",
                  t(values?.reportType?.label)
                )}
              className="no-print"
            >
              <ExcelIconSVG />{" "}
            </span>
                {/* <span
                  onClick={() => exportToExcelReport(tbodyData)}
                  className="no-print"
                >
                  <ExcelIconSVG />{" "}
                </span> */}
              </>
            }
          />
          <Heading title={tbodyData[0]?.Period} />

          <HisTable
            thead={thead}
            getRowClass={getRowClass}
            tbody={[
              ...tbodyData?.map((item, index) => ({
                Sno: index + 1,
                TradeType: item?.TradeType,
                COG: item?.COG,
                AccountName: item?.AccountName,
                BaseAmount: (
                  <AlignTableText value={item?.BaseAmount} isAmount={true} />
                ),
                AdjustmentAmount: (
                  <AlignTableText
                    value={item?.AdjustmentAmount}
                    isAmount={true}
                  />
                ),
                PendingAmount: (
                  <AlignTableText value={item?.PendingAmount} isAmount={true} />
                ),
                CreditDays: (
                  <AlignTableText value={item?.CreditDays} isAmount={true} />
                ),
                Section1: (
                  <AlignTableText value={item?.Section1} isAmount={true} />
                ),
                Section2: (
                  <AlignTableText value={item?.Section2} isAmount={true} />
                ),
                Section3: (
                  <AlignTableText value={item?.Section3} isAmount={true} />
                ),
                Section4: (
                  <AlignTableText value={item?.Section4} isAmount={true} />
                ),
                Section5: (
                  <AlignTableText value={item?.Section5} isAmount={true} />
                ),
                Section6: (
                  <AlignTableText value={item?.Section6} isAmount={true} />
                ),

                
              })),
              {
                Sr: "",
                TradeType: "",
                COG: "",
                AccountName:  <AlignTableText
                    value={t("Total")+" : "}
                    isbold={true}
                  />,
                BaseAmount: (
                  <AlignTableText
                    value={handleTotalTable(tbodyData, "BaseAmount")}
                    isbold={true}
                    isAmount={true}
                  />
                ),
                AdjustmentAmount: (
                  <AlignTableText
                    isbold={true}
                    value={handleTotalTable(tbodyData, "AdjustmentAmount")}
                    isAmount={true}
                  />
                ),
                PendingAmount: (
                  <AlignTableText
                    isbold={true}
                    value={handleTotalTable(tbodyData, "PendingAmount")}
                    isAmount={true}
                  />
                ),
                CreditDays: (
                  <AlignTableText
                    isbold={true}
                    value={handleTotalTable(tbodyData, "CreditDays")}
                    isAmount={true}
                  />
                ),
                Section1: (
                  <AlignTableText
                    isbold={true}
                    value={handleTotalTable(tbodyData, "Section1")}
                    isAmount={true}
                  />
                ),
                Section2: (
                  <AlignTableText
                    isbold={true}
                    value={handleTotalTable(tbodyData, "Section2")}
                    isAmount={true}
                  />
                ),
                Section3: (
                  <AlignTableText
                    isbold={true}
                    value={handleTotalTable(tbodyData, "Section3")}
                    isAmount={true}
                  />
                ),
                Section4: (
                  <AlignTableText
                    isbold={true}
                    value={handleTotalTable(tbodyData, "Section4")}
                    isAmount={true}
                  />
                ),
                Section5: (
                  <AlignTableText
                    isbold={true}
                    value={handleTotalTable(tbodyData, "Section5")}
                    isAmount={true}
                  />
                ),
                Section6: (
                  <AlignTableText
                    isbold={true}
                    value={handleTotalTable(tbodyData, "Section6")}
                    isAmount={true}
                  />
                ),
              },
            ]}
          />
        </div>
      )}
    </>
  );
};

export default PayableAgingSummary;
