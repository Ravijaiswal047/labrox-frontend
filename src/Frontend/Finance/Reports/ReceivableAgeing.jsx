import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import Heading from "../../../components/UI/Heading";
import MultiSelectComp from "../../../components/formComponent/MultiSelectComp";
import ReactSelect from "../../../components/formComponent/ReactSelect";
import { notify } from "../../../utils/utils";
import DatePicker from "../../../components/formComponent/DatePickerHis";
import moment from "moment";
import { formatAmount, handleTotalTable } from "../../../utils/ustil2";
import {
  BindReportControlsAPI,
  FinanceReceibleAgingSummary,
} from "../../../NetworkServices/finance.js";
import Tables from "../../../components/UI/customTable";
import { useLocalStorage } from "../../../utils/hooks/useLocalStorage";
import ChartOfAccount from "./ChartOfAccount";
import {
  matchBaseCentreWithCentre,
  SelectedBranchCentre,
} from "../../../utils/constant";
import AlignTableText from "../../../components/commonComponents/AlignTableText";
import {
  exportHtmlToExcel,
  exportHtmlToPDFNoPrintFinance,
  exportToExcel,
} from "../../../utils/exportLibrary";
import { ExcelIconSVG, PDFIconSVG } from "../../../components/SvgIcons";
import HisTable from "../../../components/UI/customTable/HisTable.jsx";

const ReceivableAgeing = ({ dropDownlist, values }) => {
  const [t] = useTranslation();
  const userData = useLocalStorage("userData", "get");
  const newSession = useLocalStorage("newSession", "get");

  const [payloadData, setPayloadData] = useState({
    BranchCentre: [],
    Currency: {
      label: userData?.centreCurrency,
      value: userData?.centreCurrency,
    },
    AgeingType: {
      label: "Day Basis",
      value: "1",
    },
    AsOn: newSession ? new Date(newSession) : new Date(),

    DateType: {
      label: "Voucher Date",
      value: "1",
    },
    coa_wise: {},
  });

  useEffect(() => {
    setPayloadData((val) => ({
      ...val,
      BranchCentre: [userData.MainCentreID],
    }));
  }, [values?.Centre?.length]);
  const { VITE_DATE_FORMAT } = import.meta.env;
  const [tableData, setTableData] = useState([]);

  const getBindReportControls = async () => {
    let apiResp = await BindReportControlsAPI();
    if (apiResp?.success) {
      setReportControlList(apiResp?.data);
    } else {
      setReportControlList([]);
    }
  };

  useEffect(() => {
    getBindReportControls();
  }, []);

  const handleChange = (e) => {
    setPayloadData((val) => ({ ...val, [e.target.name]: e.target.value }));
  };
  const handleSelect = (name, value) => {
    setPayloadData((val) => ({ ...val, [name]: value }));
    if (name === "AgeingType") {
      setTableData([]);
    }
  };

  const handleSearch = async () => {
    const currency = payloadData?.Currency?.value;
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
    //  else if (!payloadData?.coa_cog_wise?.ValueField) {
    //   notify("Please select Chart Of A/C ", "error");
    //   return;
    // }

    const payload = {
      centreID: centreID || "",
      branchCentreID: BranchCentre || "",
      currencyCode: String(currency),
      acFilterType: 4,
      acFilterValue: String(payloadData?.coa_cog_wise?.ValueField),
      reportName: "Receivable Aging Summary",
      dateFilterType: Number(payloadData?.DateType?.value),
      ageingType: Number(payloadData?.AgeingType?.value),
      asOnDate: moment(payloadData?.AsOn).format("DD-MMM-YYYY"),
      type: Number(values?.Type?.value || 0),
    };
    try {
      const apiResp = await FinanceReceibleAgingSummary(payload);

      if (apiResp?.success) {
        setTableData(apiResp?.data);
      } else {
        notify(apiResp?.message, "error");
        setTableData([]);
      }
    } catch (error) {
      console.error("Error in handleSearch:", error);
      setTableData([]);
    }
  };

  const theadDays = [
    { name: t("S/No."), width: "1%" },
    { name: t("COG") },
    { name: t("A/C Name") },
    { name: t("Total Inv Amt"), textAlign: "right" },
    { name: t("Adjusted Amt"), textAlign: "right" },
    { name: t("Pending Amount"), textAlign: "right" },
    { name: t("Credit Days"), textAlign: "right" },
    { name: t("0-30"), textAlign: "right" },
    { name: t("31-60"), textAlign: "right" },
    { name: t("61-90"), textAlign: "right" },
    { name: t("91-120"), textAlign: "right" },
    { name: t("121-180"), textAlign: "right" },
    { name: t("Above 180"), textAlign: "right" },
  ];
  
  const theadYrs = [
    { name: t("S/No."), width: "1%" },
    { name: t("COG") },
    { name: t("A/C Name") },
    { name: t("Total Inv Amt"), textAlign: "right" },
    { name: t("Adjusted Amt"), textAlign: "right" },
    { name: t("Pending Amount"), textAlign: "right" },
    { name: t("Credit Days"), textAlign: "right" },
    { name: t("1 Year"), textAlign: "right" },
    { name: t("2 Year"), textAlign: "right" },
    { name: t("3 Year"), textAlign: "right" },
    { name: t("4 Year"), textAlign: "right" },
    { name: t("5 Year"), textAlign: "right" },
    { name: t("Above 5 Year"), textAlign: "right" },
  ];

  const handleExportPDF = () => {
    exportHtmlToPDFNoPrintFinance(
      "printSectionpdf",
      values?.reportType?.label,
      "landscape"
    );
  };

  const exportToExcelReport = (data) => {
    // exportToExcel(data, "Receivable Ageing Report");
    exportHtmlToExcel("printSectionpdf", values?.reportType?.label);
  };
  const getRowClass = (val) => {
    if (val?.Sr === "") {
      return "color-indicator-2-bg";
    } else {
      return "";
    }
  };
  return (
    <>
      <MultiSelectComp
        className="col-xl-2 col-md-4 col-sm-6 col-12"
        name="BranchCentre"
        id="BranchCentre"
        placeholderName={t("Branch Centre")}
        label={t("Branch Centre")}
        // dynamicOptions={dropDownlist?.BranchCentre}
        options={matchBaseCentreWithCentre(
          dropDownlist?.BranchCentre,
          values?.Centre
        )}
        onChange={handleSelect}
        value={payloadData?.BranchCentre}
        requiredClassName={`required-fields`}
      />

      <ReactSelect
        placeholderName={t("Ageing Type")}
        id="AgeingType"
        name="AgeingType"
        value={payloadData?.AgeingType?.value}
        removeIsClearable={true}
        onChange={handleSelect}
        dynamicOptions={[
          {
            label: "Day Basis",
            value: "1",
          },
          {
            label: "Yearly Basis",
            value: "2",
          },
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
          {
            label: "Voucher Date",
            value: "1",
          },
          {
            label: "Bill Date",
            value: "2",
          },
        ]}
        searchable={true}
        respclass="col-xl-2 col-md-3 col-sm-6 col-12"
      />
      <DatePicker
        requiredClassName={`required-fields`}
        className="custom-calendar"
        placeholder={VITE_DATE_FORMAT}
        lable={t("As On")}
        respclass={"col-xl-2 col-md-4 col-sm-6 col-12"}
        name="AsOn"
        id="AsOn"
        maxDate={new Date()}
        value={payloadData?.AsOn}
        showTime
        hourFormat="12"
        handleChange={handleChange}
      />

      <ChartOfAccount
        label={"Chart Of A/C"}
        dropDownlist={dropDownlist}
        VoucherType={"R"}
        setOldPayloadData={setPayloadData}
        Currency={payloadData?.Currency?.value}
      />

      <div className="col-xl-1 col-md-1 col-sm-2 col-3  mb-2">
        <button
          className="btn btn-sm btn-primary  w-100   "
          onClick={handleSearch}
          type="button"
        >
          {t("Search")}
        </button>
      </div>

      {tableData.length > 0 && (
        <div id="printSectionpdf" className="w-100">
          <Heading
            title={t(values?.reportType?.label)}
            secondTitle={
              <>
                <span onClick={handleExportPDF} className="no-print">
                  <PDFIconSVG />
                </span>

                <span
                  onClick={() =>
                    exportHtmlToExcel(
                      "printSectionpdf",
                      t(values?.reportType?.label)
                    )
                  }
                  className="no-print"
                >
                  <ExcelIconSVG />{" "} 
                </span>
                {/* <span
                  onClick={() => exportToExcelReport(tableData)}
                  className="no-print"
                >
                  <ExcelIconSVG />{" "}
                </span> */}
              </>
            }
          />
          <Heading title={tableData[0]?.Period} />
          <HisTable
            removeShorting={true}
            thead={
              payloadData?.AgeingType?.value === "2" ? theadYrs : theadDays
            }
            tbody={[
              ...tableData?.map((item, index) => ({
                Sno: index + 1,
                COG: item?.COG,
                AccountName: item?.AccountName,
                BaseAmount: (
                  <AlignTableText value={item?.BaseAmount} isAmount={true} />
                ),
                AdjustmentAmount: (
                  <AlignTableText value={item?.Adjustment} isAmount={true} />
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
                COG: "",
                AccountName: (
                  <AlignTableText value={t("Total") + " : "} isbold={true} />
                ),
                BaseAmount: (
                  <AlignTableText
                    value={handleTotalTable(tableData, "BaseAmount")}
                    isbold={true}
                    isAmount={true}
                  />
                ),
                AdjustmentAmount: (
                  <AlignTableText
                    isbold={true}
                    value={handleTotalTable(tableData, "Adjustment")}
                    isAmount={true}
                  />
                ),
                PendingAmount: (
                  <AlignTableText
                    isbold={true}
                    value={handleTotalTable(tableData, "PendingAmount")}
                    isAmount={true}
                  />
                ),
                CreditDays: (
                  <AlignTableText
                    isbold={true}
                    value={handleTotalTable(tableData, "CreditDays")}
                    isAmount={true}
                  />
                ),

                Section1: (
                  <AlignTableText
                    isbold={true}
                    value={handleTotalTable(tableData, "Section1")}
                    isAmount={true}
                  />
                ),
                Section2: (
                  <AlignTableText
                    isbold={true}
                    value={handleTotalTable(tableData, "Section2")}
                    isAmount={true}
                  />
                ),
                Section3: (
                  <AlignTableText
                    isbold={true}
                    value={handleTotalTable(tableData, "Section3")}
                    isAmount={true}
                  />
                ),
                Section4: (
                  <AlignTableText
                    isbold={true}
                    value={handleTotalTable(tableData, "Section4")}
                    isAmount={true}
                  />
                ),
                Section5: (
                  <AlignTableText
                    isbold={true}
                    value={handleTotalTable(tableData, "Section5")}
                    isAmount={true}
                  />
                ),
                Section6: (
                  <AlignTableText
                    isbold={true}
                    value={handleTotalTable(tableData, "Section6")}
                    isAmount={true}
                  />
                ),
              },
            ]}
            getRowClass={getRowClass}
          />
        </div>
      )}
    </>
  );
};

export default ReceivableAgeing;
