import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
  BindReportControlsAPI,
  PurchaseBillDueReport,
  SaleBillDueReport,
} from "../../../NetworkServices/finance.js";
import { useSelector } from "react-redux";
import Heading from "../../../components/UI/Heading";
import MultiSelectComp from "../../../components/formComponent/MultiSelectComp";
import ReactSelect from "../../../components/formComponent/ReactSelect";
import { notify } from "../../../utils/utils";
import DatePicker from "../../../components/formComponent/DatePickerHis";
import moment from "moment";
import Tables from "../../../components/UI/customTable";
import { ExcelIconSVG, PDFIconSVG } from "../../../components/SvgIcons";
import { transformDataInTranslate } from "../../../components/WrapTranslate";
import PayableTablePDF from "./PayableTablePDF";
import {
  exportHtmlToPDFNoPrint,
  exportHtmlToPDFNoPrintFinance,
  exportToExcel,
} from "../../../utils/exportLibrary";
import { useLocalStorage } from "../../../utils/hooks/useLocalStorage";
import ChartOfAccount from "./ChartOfAccount";
import {
  matchBaseCentreWithCentre,
  SelectedBranchCentre,
} from "../../../utils/constant";
import AlignTableText from "../../../components/commonComponents/AlignTableText";
import { handleTotalTable } from "../../../utils/ustil2";
import HisTable from "../../../components/UI/customTable/HisTable.jsx";

const InvoiceSaleDuereport = ({ dropDownlist, values }) => {
  const userData = useLocalStorage("userData", "get");

  const [t] = useTranslation();
  const [payloadData, setPayloadData] = useState({
    BranchCentre: [],

    Currency: {
      label: userData?.centreCurrency,
      value: userData?.centreCurrency,
    },
    FinancialYear: {},
    ChartOfAC: {
      label: "All",
      value: "0",
    },
  });
  useEffect(() => {
    setPayloadData((val) => ({
      ...val,
      BranchCentre: [userData.MainCentreID],
    }));
  }, [values?.Centre?.length]);

  const { VITE_DATE_FORMAT } = import.meta.env;
  const [tableData, setTableData] = useState([]);
  useEffect(() => {
    setPayloadData((val) => ({
      ...val,
      ["FinancialYear"]:
        dropDownlist?.FinancialYearList?.length > 0
          ? dropDownlist?.FinancialYearList[
              dropDownlist?.FinancialYearList?.length - 1
            ]
          : {},
    }));
  }, [dropDownlist?.FinancialYearList?.length]);

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
  const handleMultiSelectChange = (name, selectedOptions) => {
    setPayloadData({
      ...payloadData,
      [name]: selectedOptions,
    });
  };
  const handleChange = (e) => {
    setPayloadData((val) => ({ ...val, [e.target.name]: e.target.value }));
  };

  const handleSearch = async () => {
    let BranchCentre = payloadData?.BranchCentre?.map((val) => val).join(
      ","
    );
    let centreID = values?.Centre?.map((val) => val).join(",");
    if(!centreID){
      notify("Please select Centre", "error");
      return;
    }else if(!BranchCentre){
      notify("Please select Branch Centre", "error");
      return;
    }
    const data = {
      type: Number(values?.Type?.value || 0),
      centreID: centreID || "",
      branchCentreID: BranchCentre || "",
      currencyCode: payloadData?.Currency?.value || "",
      acFilterType: 0,
      acFilterValue: payloadData?.coa_cog_wise?.ValueField || "",
      fromDate: moment(payloadData?.fromDate).format("YYYY-MMM-DD") || "",
      toDate: moment(payloadData?.toDate).format("YYYY-MMM-DD") || "",
      fyid: Number(
        payloadData?.FinancialYear?.value
          ? payloadData?.FinancialYear?.value
          : 0
      ),
      fyText: payloadData?.FinancialYear?.label
        ? payloadData?.FinancialYear?.label
        : "",
      fyStartEndDate: payloadData?.FinancialYear?.TypeCode,
      reportType: 1,
      reportName: "Invoice Sale Due Report",
    };

    const apiResp = await SaleBillDueReport(data);
    console.log("Initial API Response:", apiResp);

    if (apiResp?.success) {
      setTableData(apiResp.data);
    } else {
      setTableData([]);
      notify(apiResp.message, "error");
    }
  };

  const thead = [
    { width: "1%", name: t("S.No") },
    { width: "1%", name: t("Chart Of Group") },
    { width: "2%", name: t("COA ID") },
    { width: "2%", name: t("COA Name") },
    { width: "2%", name: t("Currency") },
    { width: "2%", name: t("Type") },
    { width: "2%", name: t("Inv/Bill No") },
    { width: "2%", name: t("Inv/Bill Date") },
    { width: "2%", name: t("Bill/Inv Amt"),textAlign:"right" },
    { width: "2%", name: t("Paid Amount") ,textAlign:"right"},
    { width: "2%", name: t("Pending Amount") ,textAlign:"right"},
    { width: "1%", name: t("Ex@Rate") ,textAlign:"right"},
  ];

  const handleExportPDF = () => {
    exportHtmlToPDFNoPrintFinance(
      "printSectionpdf",
      values?.reportType?.label,
      "landscape"
    );
  };

  const exportToExcelReport = (data) => {
        exportToExcel(
          [
            ...data,
            {
              Sr: "",
              COA: "",
              COAName: "",
              Currency: "",
              Type: "",
              "Inv/Bill No": "Total",
              BaseAmount: handleTotalTable(data, "BaseAmount"),
              PendingBaseAmount: handleTotalTable(data, "PendingBaseAmount"),
              AdjustmentBaseAmount: handleTotalTable(data, "AdjustmentBaseAmount"),
              BillNo:""
            },
          ],
          values?.reportType?.label
        );
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
        respclass="col-xl-2 col-md-4 col-sm-6 col-12"
      /> */}

      <ReactSelect
        placeholderName={t("Financial Year")}
        id="FinancialYear"
        name="FinancialYear"
        requiredClassName={`required-fields`}
        value={payloadData?.FinancialYear?.value}
        removeIsClearable={true}
        onChange={(name, value) =>
          setPayloadData((val) => ({ ...val, [name]: value }))
        }
        dynamicOptions={dropDownlist?.FinancialYearList}
        searchable={true}
        respclass="col-xl-2 col-md-4 col-sm-6 col-12"
      />

      <DatePicker
        className="custom-calendar"
        placeholder={VITE_DATE_FORMAT}
        lable={t("From Date")}
        respclass={"col-xl-2 col-md-4 col-sm-6 col-12"}
        name="fromDate"
        id="fromDate"
        maxDate={new Date()}
        value={
          payloadData?.fromDate
            ? moment(payloadData.fromDate).toDate()
            : new Date()
        }
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
        value={
          payloadData?.toDate ? moment(payloadData.toDate).toDate() : new Date()
        }
        showTime
        hourFormat="12"
        handleChange={(date) => handleChange(date, "toDate")}
      />
      <ChartOfAccount
        label={"Chart Of Account"}
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
                  onClick={() => exportToExcelReport(tableData)}
                  className="no-print"
                >
                  <ExcelIconSVG />{" "}
                </span>
              </>
            }
          />
          <Heading title={tableData[0]?.Periods} />
          <HisTable
            thead={thead}
            getRowClass={getRowClass}
            tbody={[
              ...tableData?.map((val, index) => {
                return {
                  "S.No": index + 1,
                  GroupName: val.GroupName,
                  COA: val.COAID,
                  COAName: val.AccountName,
                  Currency: val.CurrencyCode,
                  Type: val.BalanceType,
                  "Inv/Bill No": val.BillNo,
                  "Inv/Bill Date": val.BillDate,
                  "Bill/Inv Amt": <AlignTableText
                    value={val.BaseAmount}
                    isAmount={true}
                  />,
                  "Paid Amount": <AlignTableText
                    value={val.AdjustmentBaseAmount}
                    isAmount={true}
                  />,
                  "Pending Amount":  <AlignTableText
                    value={val.PendingBaseAmount}
                    isAmount={true}
                  />,
                  "Ex@Rate": <AlignTableText
                    value={val.CF}
                    isAmount={false}
                  />,
                };
              }),
              {
                Sr: "",
                GroupName: "",
                COA: "",
                COAName: "",
                Currency: "",
                Type: "",
                "Inv/Bill No": "",
                "Inv/Bill Date": (
                  <AlignTableText value={t("Total") + " : "} isbold={true} />
                ),
                "Bill/Inv Amt": (
                  <AlignTableText
                    value={handleTotalTable(tableData, "BaseAmount")}
                    isbold={true}
                    isAmount={true}
                  />
                ),
                "Paid Amount": (
                  <AlignTableText
                    value={handleTotalTable(
                      tableData,
                      "AdjustmentBaseAmount"
                    )}
                    isbold={true}
                    isAmount={true}
                  />
                ),
                "Pending Amount": (
                  <AlignTableText
                    value={handleTotalTable(
                      tableData,
                      "PendingBaseAmount"
                    )}
                    isbold={true}
                    isAmount={true}
                  />
                ),
                "Ex@Rate": "",
              },
            ]}
          />
        </div>
      )}
    </>
  );
};

export default InvoiceSaleDuereport;
