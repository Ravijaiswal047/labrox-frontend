import React, { useCallback, useEffect, useRef, useState } from "react";
import Heading from "../../../components/UI/Heading";
import MultiSelectComp from "../../../components/formComponent/MultiSelectComp";
import { useTranslation } from "react-i18next";
import BalanceSheetReport from "./BalanceSheetReport";
import ReactSelect from "../../../components/formComponent/ReactSelect";
import Demo from "./Demo";
import TrialBalanceReport from "./TrialBalanceReport";
import ChartOfGroupReport from "./ChartOfGroupReport";
import GeneralLedger from "./GeneralLedger";
import CustomerStatementReport from "./CustomerStatementReport";
// import ReceivableLedger from "./ReceivableLedger";
import ReceivableAgeing from "./ReceivableAgeing";
import InvoiceSaleDuereport from "./InvoiceSaleDuereport";
// import PayableLedgerReport from "./PayableLedgerReport";
import PayableAgingSummary from "./PayableAgingSummary";
import PurchaseBillDueReport from "./PurchaseBillDueReport";
import BankReconciliationReport from "./BankReconciliationReport";
import PayableStatement from "./PayableStatementReport";
import SicReport from "./SicReport";
import { BindCentreWorkOrder, BindReportControlsAPI } from "../../../NetworkServices/finance.js";
import { filterByTypes, MultselectfilterByTypes } from "../../utils/Utils";
import { useLocalStorage } from "../../../utils/hooks/useLocalStorage";
import IncomeStatementPL from "./IncomeStatementPL";
import PayableBankWise from "./PayableBankWise";
import WithHoldingTaxReport from "./WithHoldingTaxReport";
import VoucherSummaryReport from "./VoucherSummaryReport";
export default function Index() {
  const userData = useLocalStorage("userData", "get");
  const [values, setValues] = useState({
    reportType: { value: "balance_sheet", label: "Balance Sheet" },
    Type: { value: "0", label: "All" },
    Centre: [userData.MainCentreID||0],
  });
console.log("userDatauserData",userData)
console.log("valuesvalues",values)
  const [dropDownlist, setDropdownList] = useState({
    CentreList: [],
    reportTypeList: [],
    CurrencyList: [],
    VoucherType: [],
    FinancialYearList: [],
    AsOnMonthList: [],
    COGlist: [],
    allList: [],
  });
  console.log("BranchCentre",dropDownlist)
  const bindListData = async () => {
    const [apiRsp,centre] = await Promise.all([BindReportControlsAPI(),BindCentreWorkOrder({centreID:"0",rateTypeID:"0"})]);

    // console.log("centre", centre?.message);
    if (apiRsp?.success) {
      setDropdownList((val) => ({
        allList: apiRsp?.data,

        CurrencyList: filterByTypes(
          apiRsp?.data,
          [1],
          ["TypeID"],
          "TextField",
          "ValueField"
        ),
        VoucherType: filterByTypes(
          apiRsp?.data,
          [2],
          ["TypeID"],
          "TextField",
          "ValueField"
        ),
        COGlist: filterByTypes(
          apiRsp?.data,
          [3],
          ["TypeID"],
          "TextField",
          "ValueField"
        ),
        FinancialYearList: filterByTypes(
          apiRsp?.data,
          [4],
          ["TypeID"],
          "TextField",
          "ValueField"
        ),
        DepartmentList: MultselectfilterByTypes(
          apiRsp?.data,
          [5],
          ["TypeID"],
          "TextField",
          "ValueField"
        ),
        CentreList: filterByTypes(
          apiRsp?.data,
          [6],
          ["TypeID"],
          "TextField",
          "ValueField"
        ),
        BranchCentre: filterByTypes(
          apiRsp?.data,
          [7],
          ["TypeID"],
          "TextField",
          "ValueField"
        ),
        AsOnMonthList: filterByTypes(
          apiRsp?.data,
          [8],
          ["TypeID"],
          "TextField",
          "ValueField"
        ),
        reportTypeList: filterByTypes(
          apiRsp?.data,
          [9],
          ["TypeID"],
          "TextField",
          "ValueField"
        )?.sort((a, b) =>
          Number(a?.PrintOrder) > Number(b?.PrintOrder) ? 1 : -1
        ),
      }));
    }
  };
  useEffect(() => {
    bindListData();
  }, []);

  const handleReactSelect = (name, value) => {
    setValues((val) => ({ ...val, [name]: value }));
  };

  const RenderReportType=(ReportType)=>{
    if (ReportType === "balance_sheet") {
      return <BalanceSheetReport dropDownlist={dropDownlist} values={values} />;
    } else if (ReportType === "income_statement_pnl") {
      return <IncomeStatementPL dropDownlist={dropDownlist} values={values} />;
    } else if (ReportType === "trial_balance") {
      return <TrialBalanceReport dropDownlist={dropDownlist} values={values} />;
    } else if (ReportType === "chart_of_group_report") {
      return <ChartOfGroupReport dropDownlist={dropDownlist} values={values} />;
    } else if (ReportType === "general_ledger") {
      return <GeneralLedger dropDownlist={dropDownlist} values={values} />;
    } else if (ReportType === "receivable_ledger") {
      return (
        <GeneralLedger
          dropDownlist={dropDownlist}
          values={values}
          VoucherType={"R"}
        />
      );
    } else if (ReportType === "payable_ledger") {
      return (
        <GeneralLedger
          dropDownlist={dropDownlist}
          values={values}
          VoucherType={"P"}
        />
      );
    } else if (ReportType === "customer_statement") {
      return (
        <CustomerStatementReport dropDownlist={dropDownlist} values={values} />
      );
    } else if (ReportType === "receivable_ageing_summary") {
      return <ReceivableAgeing dropDownlist={dropDownlist} values={values} />;
    } else if (ReportType === "invoice/sale_due_report") {
      return (
        <InvoiceSaleDuereport dropDownlist={dropDownlist} values={values} />
      );
    } else if (ReportType === "customer_statement") {
      return <Demo dropDownlist={dropDownlist} values={values} />;
    } else if (ReportType === "payable_bank_wise") {
      return <PayableBankWise dropDownlist={dropDownlist} values={values} />;
    } else if (ReportType === "payable_ageing_summary") {
      return (
        <PayableAgingSummary dropDownlist={dropDownlist} values={values} />
      );
    } else if (ReportType === "purchase_bill_due_report") {
      return (
        <PurchaseBillDueReport dropDownlist={dropDownlist} values={values} />
      );
    } else if (ReportType === "supplier_statement") {
      return <PayableStatement dropDownlist={dropDownlist} values={values} />;
    } else if (ReportType === "bank_reconciliation_report") {
      return (
        <BankReconciliationReport dropDownlist={dropDownlist} values={values} />
      );
    } else if (ReportType === "payable_bank_wise") {
      return <Demo dropDownlist={dropDownlist} values={values} />;
    } else if (ReportType === "sic_report") {
      return <SicReport dropDownlist={dropDownlist} values={values} />;
    } else if (ReportType === "withholding_tax_report") {
      return (
        <WithHoldingTaxReport dropDownlist={dropDownlist} values={values} />
      );
    } else if (ReportType === "voucher_status_summary") {
      return (
        <VoucherSummaryReport dropDownlist={dropDownlist} values={values} />
      );
    }
    }
  // },[values?.Centre,values?.reportType?.value]) 
  const [t] = useTranslation();
  return (
    <>
      {/* <div className="mt-2 "> */}
      <div className="mt-2 card">
        <Heading isBreadcrumb={true}
          name={t("Finance Reports")}
        />
      
        <div className="card">
          <Heading title={t("Searching Criteria")} />
          <div className="row mt-2 mx-1 ">
            <ReactSelect
              id="reportType"
              placeholderName={t("Report Type")}
              searchable={true}
              respclass="col-xl-2 col-md-4 col-sm-6 col-12"
              name="reportType"
              value={values?.reportType?.value}
              onChange={(name, e) => handleReactSelect(name, e)}
              dynamicOptions={dropDownlist?.reportTypeList}
              requiredClassName={`required-fields`}
              removeIsClearable={true}
            />

            <ReactSelect
              placeholderName={t("Type")}
              id="Type"
              name="Type"
              value={values?.Type?.value}
              removeIsClearable={true}
              onChange={handleReactSelect}
              dynamicOptions={[
                { label: "All", value: "0" },
                { label: "LIMS", value: "1" },
                { label: "Finance", value: "2" },
              ]}
              searchable={true}
              respclass="col-xl-2 col-md-4 col-sm-6 col-12"
            />
            <MultiSelectComp
              className="col-xl-2 col-md-4 col-sm-6 col-12"
              name="Centre"
              id="Centre"
              placeholder={t("Centre")}
              label={t("Centre")}
              options={dropDownlist?.CentreList}
              onChange={handleReactSelect}
              value={values?.Centre}
              requiredClassName={`required-fields`}
            />

            {RenderReportType(values?.reportType?.value)}
            {console.log("Centressssss", dropDownlist?.CentreList)}
          </div>
        </div>
        {/* </div> */}
      </div>
    </>
  );
}
