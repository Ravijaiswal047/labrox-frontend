import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
  BindReportControlsAPI,
  GetStatementReport,
  PurchaseBillDueReport,
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
  exportHtmlToExcel,
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

const CustomerStatementReport = ({ dropDownlist, values }) => {
  const userData = useLocalStorage("userData", "get");

  const [t] = useTranslation();
  const [payloadData, setPayloadData] = useState({
    BranchCentre: [],
    FinancialYear: {},
    ChartOfAC: {
      label: "All",
      value: "0",
    },
    fromDate: new Date(),
    toDate: new Date(),
  });
  const [reportControlList, setReportControlList] = useState([]);
  // const { GetEmployeeWiseCenter } = useSelector((state) => state.CommonSlice);
  const { VITE_DATE_FORMAT } = import.meta.env;
  const [tableData, setTableData] = useState([]);

  useEffect(() => {
    setPayloadData((val) => ({
      ...val,
      BranchCentre: [userData.MainCentreID],
    }));
  }, [values?.Centre?.length]);

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
    } else if (!payloadData?.coa_cog_wise?.ValueField) {
      notify("Please select Chart Of A/C ", "error");
      return;
    }
    let data = {
      type: Number(values?.Type?.value || 0),
      CentreID: centreID || "",
      BranchCentreID: BranchCentre || "",
      CurrencyCode: userData?.centreCurrency || "",
      ACCType: 4,
      ACCOAID: Number(payloadData?.coa_cog_wise?.ValueField || 0),
      FromDate: moment(payloadData?.fromDate).format("YYYY-MMM-DD") || "",
      ToDate: moment(payloadData?.toDate).format("YYYY-MMM-DD") || "",
      FYID: Number(
        payloadData?.FinancialYear?.value
          ? payloadData?.FinancialYear?.value
          : 0
      ),
      FYText: payloadData?.FinancialYear?.label
        ? payloadData?.FinancialYear?.label
        : "",
      FYStartEndDate: payloadData?.FinancialYear?.TypeCode,
      ReportType: 1,
      DateFilterType: 1,
      IsOnlyUnpaid: 0,
    };
    const apiResp = await GetStatementReport(data);
    console.log("Initial API Response:", apiResp);

    if (apiResp?.success) {
      setTableData(apiResp.data);
    } else {
      setTableData([]);
      notify(apiResp.message, "error");
    }
  };

  const thead = [
    { name: t("Invoice Date") },
    { name: t("Contra A/C") },
    { name: t("Centre") },
    { name: t("Transaction Type") },
    { name: t("Receipt / Invoice No.") },
    { name: t("Scheme Name") },
    { name: t("Inv / Rec Amount"), textAlign: "right" },
    { name: t("Transaction / Receipt Remaining Amount"), textAlign: "right" },
    { name: t("Running Balance"), textAlign: "right" },
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
          Space1: "",
          Space2: "",
          Space3: "",
          Space4: "",
          Space5: "",
          Space6: "",
          Space7: "",
          Space8: "",
          "Inv/Bill No": "Total",
          Invoice_Receipt_Amount: handleTotalTable(
            data,
            "Invoice_Receipt_Amount"
          ),
          AdjustmentAmt: handleTotalTable(data, "AdjustmentAmt"),
          Remaining_Amount: handleTotalTable(data, "Remaining_Amount"),
          AdjustmentBaseAmount: handleTotalTable(data, "RunningBal"),
          BillNo: "",
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
        value={payloadData?.fromDate}
        showTime
        hourFormat="12"
        onChange={(date) => handleChange(date, "fromDate")}
      />
      <DatePicker
        className="custom-calendar"
        placeholder={VITE_DATE_FORMAT}
        lable={t("To Date")}
        respclass={"col-xl-2 col-md-4 col-sm-6 col-12"}
        name="toDate"
        id="toDate"
        maxDate={new Date()}
        value={payloadData?.toDate}
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
        required={true}
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
          <Heading title={tableData[0]?.InsuranceName} />
          <HisTable
            thead={thead}
            removeShorting={true}
            getRowClass={getRowClass}
            tbody={[
              ...tableData?.map((val, index) => ({
                InvoiceDate: val?.InvoiceDate,
                PatientName: val?.ContraAccount,
                CentreName: val?.CentreName,
                // SchemeMode: val?.SchemeMode,
                TnxType: val?.TnxType,
                Receipt_InvoiceNo: val?.Receipt_InvoiceNo,
                SchemeName: val?.SchemeName,
                Invoice_Receipt_Amount: (
                  <AlignTableText
                    value={val?.Invoice_Receipt_Amount}
                    isAmount={true}
                  />
                ),
                Remaining_Amount: (
                  <AlignTableText
                    value={val?.Remaining_Amount}
                    isAmount={true}
                  />
                ),
                RunningBal: (
                  <AlignTableText value={val?.RunningBal} isAmount={true} />
                ),
              })),
              {
                Sr: "",
                PatientName: "",
                CentreName: "",
                // SchemeMode: val?.SchemeMode,
                TnxType: "",
                Receipt_InvoiceNo: "",
                SchemeName: (
                  <AlignTableText value={t("Total") + " : "} isbold={true} />
                ),
                Invoice_Receipt_Amount: (
                  <AlignTableText
                    value={handleTotalTable(
                      tableData,
                      "Invoice_Receipt_Amount"
                    )}
                    isbold={true}
                    isAmount={true}
                  />
                ),
                Remaining_Amount: (
                  <AlignTableText
                    value={handleTotalTable(tableData, "Remaining_Amount")}
                    isbold={true}
                    isAmount={true}
                  />
                ),
                RunningBal: (
                  <AlignTableText
                    value={tableData[tableData.length - 1]?.RunningBal}
                    isbold={true}
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

export default CustomerStatementReport;
