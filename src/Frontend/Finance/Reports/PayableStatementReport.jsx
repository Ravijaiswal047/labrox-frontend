import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
  BindReportControlsAPI,
  BindSettlementDetails,
  GetStatementReport,
} from "../../../NetworkServices/finance.js";
import { useSelector } from "react-redux";
import Heading from "../../../components/UI/Heading";
import MultiSelectComp from "../../../components/formComponent/MultiSelectComp";
import ReactSelect from "../../../components/formComponent/ReactSelect";
import { filterByTypes, notify } from "../../utils/Utils";
import DatePicker from "../../../components/formComponent/DatePickerHis";
import moment from "moment";
import { AutoComplete } from "primereact/autocomplete";
import {
  exportHtmlToExcel,
  exportHtmlToPDFNoPrint,
  exportHtmlToPDFNoPrintFinance,
  exportToExcel,
} from "../../../utils/exportLibrary";
import { ExcelIconSVG, PDFIconSVG } from "../../../components/SvgIcons";
import Tables from "../../../components/UI/customTable";
import { useLocalStorage } from "../../../utils/hooks/useLocalStorage";
import ChartOfAccount from "./ChartOfAccount";
import { formatAmount, handleTotalTable } from "../../../utils/ustil2";
import {
  matchBaseCentreWithCentre,
  SelectedBranchCentre,
} from "../../../utils/constant";
import AlignTableText from "../../../components/commonComponents/AlignTableText";
import FinanceModal from "../../../components/ModalComponent/FinanceModal";
import HisTable from "../../../components/UI/customTable/HisTable.jsx";



const PayableStatement = ({ dropDownlist, values }) => {
  const userData = useLocalStorage("userData", "get");

  const [t] = useTranslation();
  const [selletmentData, setSelletmentData] = useState([]);
  const [payloadData, setPayloadData] = useState({
    BranchCentre: [],
    PaymentType: [],

    Currency: {
      label: userData?.centreCurrency,
      value: userData?.centreCurrency,
    },
    FinancialYear: {},
    IsOnlyUnpaid: 0,
    fromDate: new Date(),
    toDate: new Date(),
    IsOnlyPaid: 0,
  });
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

  useEffect(() => {
    setPayloadData((val) => ({
      ...val,
      BranchCentre: [userData.MainCentreID],
    }));
  }, [values?.Centre?.length]);

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
      ReportType: 2,
      DateFilterType: 1,
      IsOnlyUnpaid:
        payloadData?.PaymentType?.find((val) => val?.code === "1")?.code === "1"
          ? 1
          : 0,
    };
    const apiResp = await GetStatementReport(data);

    if (apiResp?.success) {
      setTableData(apiResp.data);
    } else {
      setTableData([]);
      notify(apiResp.message, "error");
    }
  };
  const thead = [
    { name: t("S.No.") },
    { name: t("Date") },
    { name: t("Type") },
    { name: t("GRN No.") },
    { name: t("Inv. Date") },
    { name: t("Supplier Inv. No.") },
    { name: t("Voucher No.") },
    { name: t("Settelment Status") },
    { name: t("Cheque No.") },
    { name: t("Debit"), textAlign: "right" },
    { name: t("Credit"), textAlign: "right" },
    { name: t("Balance"), textAlign: "right" },
  ];
  const selletmentDataThead = [
    { name: t("S.No.") },
    { name: t("Payment Voucher No") },
    { name: t("Payment Voucher Date") },
    { name: t("Purchase Voucher No") },
    { name: t("Purchase Voucher Date") },
    { name: t("Invoice No") },
    { name: t("Invoice Date") },
    { name: t("Paid Amount"), textAlign: "right" },
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
          Space9: "",
          Space10: "",
          Space12: "",
          Space13: "",
          Space14: "",
          Space15: "",
          Space16: "",
          Space17: "",
          Space18: "",
          Space19: "",
          "Inv/Bill No": "Total",

          Credit: handleTotalTable(data, "Credit"),
          Debit: handleTotalTable(data, "Debit"),
          Balance: handleTotalTable(data, "Balance"),
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
  const handleOpenSettleStatus = async ({ EntryDetailID }) => {
    let apiResp = await BindSettlementDetails(EntryDetailID);
    if (apiResp?.success) {
      setSelletmentData(apiResp?.data);
    } else {
      notify(apiResp?.message, "error");
      setSelletmentData([]);
    }
  };
  return (
    <>
      {selletmentData?.length > 0 && (
        <FinanceModal
          visible={selletmentData?.length > 0}
          setVisible={() => setSelletmentData([])}
          modalWidth={"90vw"}
          Header={t("Settlement Details")}
          footer={<></>}
        >
          <HisTable
            thead={selletmentDataThead}
            tbody={selletmentData?.map((val, index) => ({
              SNO: index + 1,
              PaymentVoucherNo: val?.PaymentVoucherNo,
              PaymentVoucherDate: val?.PaymentVoucherDate,
              PurchaseVoucherNo: val?.PurchaseVoucherNo,
              PurchaseVoucherDate: val?.PurchaseVoucherDate,
              InvoiceNo: val?.InvoiceNo,
              InvoiceDate: val?.InvoiceDate,
              PaidAmount: (
                <AlignTableText value={val?.PaidAmount} isAmount={true} />
              ),
            }))}
            // getRowClass={getRowClass}
          />
        </FinanceModal>
      )}

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
        onClick={handleMultiSelectChange}
        value={payloadData?.BranchCentre}
        requiredClassName={`required-fields`}
      />

      {/* <ReactSelect
        placeholderName={t("Currency")}
        id="Currency"
        name="Currency"
        value={payloadData?.Currency?.value}
        requiredClassName={`required-fields`}
        removeIsClearable={true}
        handleChange={(name, value) =>
          setPayloadData((val) => ({ ...val, [name]: value }))
        }
        dynamicOptions={dropDownlist?.CurrencyList}
        searchable={true}
        respclass="col-xl-2 col-md-4 col-sm-6 col-12"
      /> */}

      <ChartOfAccount
        label={t("Payble Chart Of A/C")}
        dropDownlist={dropDownlist}
        VoucherType={"P"}
        setOldPayloadData={setPayloadData}
        Currency={payloadData?.Currency?.value}
        required={true}
      />
      <ReactSelect
        placeholderName={t("Financial Year")}
        id="FinancialYear"
        name="FinancialYear"
        value={payloadData?.FinancialYear?.value}
        removeIsClearable={true}
        requiredClassName={`required-fields`}
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
      <MultiSelectComp
        className="col-xl-2 col-md-4 col-sm-6 col-12"
        name="PaymentType"
        id="PaymentType"
        // placeholderName={t("Payment Type")}
        label={t("Payment Type")}
        // dynamicOptions={[]}
        options={[
          { label: "Payment Only", value: "0" },
          { label: "Only un-paid", value: "1" },
        ]}
        onChange={handleMultiSelectChange}
        value={payloadData?.PaymentType}
      />
      {/* <div className="col-xl-2 col-md-4 col-sm-6 col-4  d-flex align-items-center">
        <input
          type="checkbox"
          checked={payloadData.IsOnlyPaid}
          onChange={() =>
            setPayloadData({
              ...payloadData,
              IsOnlyPaid: !payloadData.IsOnlyPaid,
            })
          }
          className="mr-1"
        />
        <span>{t("Payment Only")}</span>
      </div>
      <div className="col-xl-2 col-md-4 col-sm-6 col-4  d-flex align-items-center">
        <input
          type="checkbox"
          checked={payloadData.IsOnlyUnpaid}
          onChange={() =>
            setPayloadData({
              ...payloadData,
              IsOnlyUnpaid: !payloadData.IsOnlyUnpaid,
            })
          }
          className="mr-1"
        />
        <span>{t("Only un-paid")}</span>
      </div> */}

      <div className="col-xl-1 col-md-1 col-sm-2 col-4  mb-2">
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
            thead={thead}
            removeShorting={true}
            getRowClass={getRowClass}
            tbody={[
              ...tableData?.map((item, index) => ({
                "Sr No.": index + 1,
                Date: item?.Date,
                Type: item?.Type,
                GRNNo: item?.GRNNo,
                BillDate: item?.BillDate,
                Supplier_Inv_No: item?.Supplier_Inv_No,
                VoucherNo: item?.VoucherNo,
                SettleStatus:
                  item?.SettleStatus !== "Un-Settled" ? (
                    <strong
                      onClick={() => {
                        handleOpenSettleStatus(item);
                      }}
                      className={
                        item?.SettleStatus === "Settled"
                          ? "text-success"
                          : `text-primary`
                      }
                    >
                      {item?.SettleStatus}
                    </strong>
                  ) : (
                    <strong className="text-danger">
                      {item?.SettleStatus}
                    </strong>
                  ),
                ChequeNo: item?.ChequeNo,
                Debit: <AlignTableText value={item?.Debit} isAmount={true} />,
                Credit: <AlignTableText value={item?.Credit} isAmount={true} />,
                Balance: (
                  <AlignTableText value={item?.Balance} isAmount={true} />
                ),
              })),
              {
                Sr: "",
                GroupName: "",
                COA: "",
                COAName: "",
                Currency: "",
                Type: "",
                "Inv/Bill No": "",
                "Inv/Bill": "",
                "Inv/Bill Date": (
                  <AlignTableText value={t("Total") + " : "} isbold={true} />
                ),
                Debit: (
                  <AlignTableText
                    value={handleTotalTable(tableData, "Debit")}
                    isbold={true}
                    isAmount={true}
                  />
                ),
                Credit: (
                  <AlignTableText
                    value={handleTotalTable(tableData, "Credit")}
                    isbold={true}
                    isAmount={true}
                  />
                ),
                "Paid Amount": (
                  <AlignTableText
                    value={tableData[tableData?.length - 1]?.Balance}
                    isbold={true}
                    isAmount={true}
                  />
                ),
              },
            ]}
            // getRowClass={getRowClass}
          />
        </div>
      )}
    </>
  );
};

export default PayableStatement;
