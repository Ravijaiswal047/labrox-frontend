import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";

import { useSelector } from "react-redux";
import Heading from "../../../components/UI/Heading";
import MultiSelectComp from "../../../components/formComponent/MultiSelectComp";
import ReactSelect from "../../../components/formComponent/ReactSelect";
import { filterByTypes, notify } from "../../../utils/Utils";
import DatePicker from "../../../components/formComponent/DatePickerHis";
import moment from "moment";
import TreeViewTable from "../../../components/UI/customTable/TreeViewTable";
import { buildHierarchyTree } from "../../../utils/ustil2";
import {
  BindReportControlsAPI,
  GetGLReport,
  LoadCentreChartOfAccountAPI,
} from "../../../NetworkServices/finance.js";
import Input from "../../../components/formComponent/Input";
import { AutoComplete } from "primereact/autocomplete";
import Tables from "../../../components/UI/customTable";
import { ExcelIconSVG, PDFIconSVG } from "../../../components/SvgIcons";
import {
  exportHtmlToPDFNoPrint,
  exportToExcel,
} from "../../../utils/exportLibrary";
import { transformDataInTranslate } from "../../../components/WrapTranslate";
import LedgerReportTable from "./LedgerReportTable";
import { useLocalStorage } from "../../../utils/hooks/useLocalStorage";
import {
  matchBaseCentreWithCentre,
  SelectedBranchCentre,
} from "../../../utils/constant";

const GeneralLedger = ({ dropDownlist, VoucherType = "", values }) => {
  const [t] = useTranslation();
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const userData = useLocalStorage("userData", "get");
  const [payloadData, setPayloadData] = useState({
    DisplayNarration: { label: "Yes", value: "1" },
    Currency: {
      label: userData?.centreCurrency,
      value: userData?.centreCurrency,
    },
    VoucherType: { label: "All", value: "0" },
    OnlyTransactionalLedger: { label: "No", value: "0" },
    FinancialYear: {},
    fromDate: new Date(),
    toDate: new Date(),
    TransactionType: { label: "All Transaction", value: "0" },
    GroupBy: {
      label: "Voucher Date",
      value: "Date",
    },
    DisplayOpposite: {
      label: "No",
      value: "0",
    },
    coType: {
      label: "COA Wise",
      value: "4",
    },
    coa_cog_wise: {},
  });
  const [items, setItems] = useState([]);
  const [bodyData, setBodyData] = useState([]);
  const [reportControlList, setReportControlList] = useState([]);
  const { GetEmployeeWiseCenter } = useSelector((state) => state.CommonSlice);
  const { VITE_DATE_FORMAT } = import.meta.env;
  const [tableData, setTableData] = useState([]);

  useEffect(() => {
    setPayloadData((val) => ({
      ...val,
      BranchCentre: SelectedBranchCentre(values?.Centre),
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
    getBindReportControls();
  }, []);

  const handleChange = (e) => {
    setPayloadData((val) => ({ ...val, [e.target.name]: e.target.value }));
  };
  const handleSearch = async () => {
    if (!payloadData?.FinancialYear?.value) {
      notify("Please Select Financial Year", "error");
      return;
    } else if (!payloadData?.coa_cog_wise?.ValueField) {
      notify("Please Select COA/COG", "error");
      return;
    }

    const centreID = values?.Centre?.map((val) => val?.code).join(",");
    const BranchCentre = values?.BranchCentre?.map((val) => val?.code).join(
      ","
    );
    const payload = {
      CentreID: centreID ? centreID : "",
      BranchCentreID: BranchCentre ? BranchCentre : "",
      CurrencyCode: payloadData?.Currency?.value || "",
      VoucherType: payloadData?.VoucherType?.value || "",
      ACFilterType: Number(payloadData?.coType?.value),
      ACFilterValue: String(payloadData?.coa_cog_wise?.ValueField || ""),
      FromDate: moment(payloadData?.fromDate).format("DD-MMM-YYYY"),
      ToDate: moment(payloadData?.toDate).format("DD-MMM-YYYY"),
      TransactionType: Number(payloadData?.TransactionType?.value || 0),
      IsNarration: Number(payloadData?.DisplayNarration?.value || 0),
      IsOppositeAC: Number(payloadData?.DisplayOpposite?.value || 0),
      GroupBy: String(payloadData?.GroupBy?.value),
      FYID: Number(payloadData?.FinancialYear?.value),
      FYText: String(payloadData?.FinancialYear?.label),
      FYStartEndDate: String(payloadData?.FinancialYear?.TypeCode),
      ReportType: 1,
      ReportName: "General Ledger",
    };

    try {
      // First API call
      const apiResp = await GetGLReport(payload);

      if (apiResp?.success) {
        // let newResp = [...apiResp?.data]; // Store initial data

        // // Use Promise.all to handle multiple API calls
        // const additionalData = await Promise.all(
        //     apiResp?.data?.map(async (val) => {
        //         let modifiedData = { ...data, ACFilterValue: val.COGCode, GroupBy: 4 }; // Modify ACFilterValue
        //         const apisubResp = await GetTrialBalanceReport(modifiedData);

        //         return apisubResp?.success ? apisubResp.data : null;
        //     })
        // );

        // // Flatten and filter null values
        // newResp = [...newResp, ...additionalData.flat().filter(Boolean)];

        // let hierarchyData = buildHierarchyTree(newResp, []);

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

  const thead = [
    t("S.No."),
    { name: t("Branch Centre") },
    { name: t("Vch.Date	") },
    { name: t("	 Vch.Type") },
    { name: t("Vch.No.") },
    { name: t("	Bill No.") },
    { name: t("Bill Date") },
    { name: t("Narration") },
    { name: t("	Ref No.") },
    { name: t("	Ref Date") },
    { name: t("Debit ") },
    { name: t("Credit ") },
    { name: t("Running Bal. ") },
    { name: t("Type") },
    // { name: t("Branch") },
  ];

  const search = async (event, name) => {
    if (event?.query?.length > 0) {
      const keyValue = Number(payloadData?.coType?.value || 0); // Ensure a number

      if (payloadData?.coType?.value === "3") {
        if (dropDownlist?.COGlist && dropDownlist?.COGlist?.length > 0) {
          let filterData = dropDownlist?.COGlist.filter((val) =>
            val?.label?.toLowerCase().includes(event?.query.toLowerCase())
          );
          setItems(filterData);
        } else {
          setItems([]);
        }
      } else if (payloadData?.coType?.value === "4") {
        const payload = {
          groupCode: String("0"),
          accountTypeID: 0,
          currencyCode: String(payloadData?.Currency?.value),
          accountName: String(event?.query || ""),
          voucherType: String(VoucherType),
          isTaxDetail: 0,
        };
        let results = await LoadCentreChartOfAccountAPI(payload);
        if (results?.success) {
          setItems(results?.data);
        } else {
          setItems([]);
        }
      }
      // const results = filterByTypes(
      //   reportControlList,
      //   [keyValue],
      //   ["TypeID"],
      //   "TextField",
      //   "ValueField"
      // );

      // if (results && results.length > 0) {
      //   let filterData = results.filter((val) =>
      //     val?.label?.toLowerCase().includes(event?.query.toLowerCase())
      //   );
      //   setItems(filterData);
      // } else {
      //   setItems([]);
      // }
    } else {
      setItems([]);
    }
  };

  const validateInvestigation = async (e, name) => {
    const { value } = e;

    if (name === "coa_cog_wise") {
      value.isAccountType = true;
      setPayloadData((val) => ({ ...val, ["coa_cog_wise"]: value }));
    } else {
      setPayloadData((val) => ({ ...val, [name]: "" }));
    }
    setBodyData((val) => [...val, value]);
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

  const totalDebit = tableData.reduce(
    (sum, val) => sum + (Number(val.Debit) || 0),
    0
  );
  const totalCredit = tableData.reduce(
    (sum, val) => sum + (Number(val.Credit) || 0),
    0
  );
  const totalRunningBal = tableData.reduce(
    (sum, val) =>
      sum + (Number(val.RunningBal.toString().replace(/[^\d.]/g, "")) || 0),
    0
  );

  const updatedData = [
    ...tableData?.map((val, index) => ({
      "S.No": isGeneratingPDF ? (
        index === 0 ? (
          `COG: COA:\n\n${index + 1}`
        ) : (
          `${index + 1}`
        )
      ) : (
        <>
          {index === 0 && (
            <>
              <strong>COG:</strong>
              <br />
              <strong>COA:</strong>
              <br />
            </>
          )}
          <br />
          {index + 1}
        </>
      ),
      BranchCenter: isGeneratingPDF ? (
        index === 0 ? (
          `${val?.COGName}\n${val?.COAName}\n${val.BranchCentre}`
        ) : (
          val.BranchCentre
        )
      ) : (
        <>
          {index === 0 && (
            <div>
              {val?.COGName}
              <br />
              {val?.COAName}
            </div>
          )}
          <br />
          {val.BranchCentre}
        </>
      ),
      "Voucher Date": val.VoucherDate,
      "Voucher type": val.VoucherName,
      "Voucher No.": val.VoucherNo,
      "Bill No.": val.BillNo,
      "Bill Date.": val.BillDate,
      Narration: val.Narations,
      "Ref No.": val.RefNo,
      "Ref Date.": val.RefDate,
      Debit: val.Debit,
      Credit: isGeneratingPDF ? (
        Number(
          val.RunningBal.toString().replace(/[^\d.]/g, "")
        ).toLocaleString()
      ) : (
        <>
          {index === 0
            ? Number(
                val.RunningBal.toString().replace(/[^\d.]/g, "")
              ).toLocaleString()
            : val.Credit}
        </>
      ),
      "Running Bal.": Number(
        val.RunningBal.toString().replace(/[^\d.]/g, "")
      ).toLocaleString(),
      // "Type": val?.RunningBal?.includes("Cr") || val?.Credit?.includes("Cr") ? "Cr" : "",
      Type:
        String(val?.RunningBal).includes("Cr") ||
        String(val?.Credit).includes("Cr")
          ? "Cr"
          : "",
    })),
    {
      "S.No": "",
      BranchCenter: "",
      "Voucher Date": "",
      "Voucher type": "",
      "Voucher No.": "",
      "Bill No.": "",
      "Bill Date.": "",
      Narration: "",
      "Ref No.": "",
      "Ref Date.": "Total",
      Debit: totalDebit.toLocaleString(),
      Credit: totalCredit.toLocaleString(),
      "Running Bal.": totalRunningBal.toLocaleString(),
      Type: "",
      colorcode: "color-indicator-5-bg",
    },
  ];
  const getRowClass = (val, index) => {
    let type = updatedData[index].colorcode;
    if (type) {
      return type;
    } else {
      return;
    }
  };

  const handleExportPDF = (e) => {
    exportHtmlToPDFNoPrint(
      "printSection",
      "General Ledger",
      "1000px",
      "landscape"
    );
  };
  const handleExportExcel = async (tableData) => {
    // let apiResp = await GetBankChargesUploadExcel();
    if (tableData) {
      exportToExcel(
        transformDataInTranslate(tableData, t),
        "General Ledger Report"
      );
    } else {
      notify("no Data Found", "error");
    }
  };
  const groupByOptions = [
    { label: "Voucher Date", value: "Date" },
    { label: "Accountant", value: "Accountant Approved By" },
    { label: "DF - Finance Director", value: "DF Approved By" },
    { label: "ED", value: "ED Approved By" },
    { label: "Finalize", value: "Finalize By" },
    { label: "Month Wise", value: "Month" },
    { label: "Year Wise", value: "Year" },
  ];
  return (
    <>
      <MultiSelectComp
        respclass="col-xl-2 col-md-4 col-sm-6 col-12"
        name="BranchCentre"
        id="BranchCentre"
        placeholderName={t("Branch Centre")}
        dynamicOptions={matchBaseCentreWithCentre(
          dropDownlist?.BranchCentre,
          values?.Centre
        )}
        // dynamicOptions={dropDownlist?.BranchCentre}
        handleChange={(name, value) =>
          setPayloadData((val) => ({ ...val, [name]: value }))
        }
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
        placeholderName={t("Voucher Type")}
        id="VoucherType"
        name="VoucherType"
        value={payloadData?.VoucherType?.value}
        removeIsClearable={true}
        handleChange={(name, value) =>
          setPayloadData((val) => ({ ...val, [name]: value }))
        }
        dynamicOptions={[
          { label: "All", value: "0" },
          ...dropDownlist?.VoucherType,
        ]}
        searchable={true}
        respclass="col-xl-2 col-md-3 col-sm-6 col-12"
      />
      <ReactSelect
        placeholderName={t("Financial Year")}
        id="FinancialYear"
        name="FinancialYear"
        requiredClassName={`required-fields`}
        value={payloadData?.FinancialYear?.value}
        removeIsClearable={true}
        handleChange={(name, value) =>
          setPayloadData((val) => ({ ...val, [name]: value }))
        }
        dynamicOptions={dropDownlist?.FinancialYearList}
        searchable={true}
        respclass="col-xl-2 col-md-3 col-sm-6 col-12"
      />
      <DatePicker
        requiredClassName={`required-fields`}
        className="custom-calendar"
        placeholder={VITE_DATE_FORMAT}
        lable={t("From Date")}
        respclass="col-xl-2 col-md-3 col-sm-6 col-12"
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
        requiredClassName={`required-fields`}
        className="custom-calendar"
        placeholder={VITE_DATE_FORMAT}
        lable={t("To Date")}
        respclass="col-xl-2 col-md-3 col-sm-6 col-12"
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
      {/* <ReactSelect
              placeholderName={t("Transaction Type")}
              id="TransactionType"
              name="TransactionType"
              value={payloadData?.TransactionType?.value}
              removeIsClearable={true}
              handleChange={(name, value) =>
                setPayloadData((val) => ({ ...val, [name]: value }))
              }
              dynamicOptions={[
                {
                  label: "All Transaction",
                  value: "0",
                },
                {
                  label: "Only Verify",
                  value: "1",
                },
                {
                  label: "Only Auth",
                  value: "2",
                },
              ]}
              searchable={true}
              respclass="col-xl-2 col-md-3 col-sm-6 col-12"
            /> */}
      <ReactSelect
        placeholderName={t("Display Narration")}
        id="DisplayNarration"
        name="DisplayNarration"
        value={payloadData?.DisplayNarration?.value}
        removeIsClearable={true}
        handleChange={(name, value) =>
          setPayloadData((val) => ({ ...val, [name]: value }))
        }
        dynamicOptions={[
          {
            label: "Yes",
            value: "1",
          },
          {
            label: "No",
            value: "0",
          },
        ]}
        searchable={true}
        respclass="col-xl-2 col-md-3 col-sm-6 col-12"
      />{" "}
      <ReactSelect
        placeholderName={t("Group By")}
        id="GroupBy"
        name="GroupBy"
        value={payloadData?.GroupBy?.value}
        removeIsClearable={true}
        handleChange={(name, value) =>
          setPayloadData((val) => ({ ...val, [name]: value }))
        }
        dynamicOptions={groupByOptions}
        searchable={true}
        respclass="col-xl-2 col-md-3 col-sm-6 col-12"
      />{" "}
      <ReactSelect
        placeholderName={t("Display Opposite A/C")}
        id="DisplayOpposite"
        name="DisplayOpposite"
        value={payloadData?.DisplayOpposite?.value}
        removeIsClearable={true}
        handleChange={(name, value) =>
          setPayloadData((val) => ({ ...val, [name]: value }))
        }
        dynamicOptions={[
          {
            label: "Yes",
            value: "1",
          },
          {
            label: "No",
            value: "0",
          },
        ]}
        searchable={true}
        respclass="col-xl-2 col-md-3 col-sm-6 col-12"
      />
      <ReactSelect
        placeholderName={t("Only Transactional Ledger")}
        id="OnlyTransactionalLedger"
        name="OnlyTransactionalLedger"
        value={payloadData?.OnlyTransactionalLedger?.value}
        removeIsClearable={true}
        handleChange={(name, value) =>
          setPayloadData((val) => ({ ...val, [name]: value }))
        }
        dynamicOptions={[
          {
            label: "Yes",
            value: "1",
          },
          {
            label: "No",
            value: "0",
          },
        ]}
        searchable={true}
        respclass="col-xl-2 col-md-3 col-sm-6 col-12"
      />
      <ReactSelect
        placeholderName={t("")}
        // id="coType"
        name="coType"
        value={payloadData?.coType?.value}
        removeIsClearable={true}
        handleChange={(name, value) =>
          setPayloadData((val) => ({ ...val, [name]: value }))
        }
        dynamicOptions={[
          {
            label: "COG Wise",
            value: "3",
          },
          {
            label: "COA Wise",
            value: "4",
          },
        ]}
        searchable={true}
        respclass="col-xl-2 col-md-3 col-sm-6 col-12"
      />
      <div className="col-xl-4 col-md-8 col-sm-6 col-12">
        <AutoComplete
          value={
            payloadData?.coa_cog_wise?.TextField
              ? payloadData?.coa_cog_wise?.TextField
              : payloadData?.coa_cog_wise
          }
          //   value={values?.AccountName?.TextField ? values?.AccountName?.TextField : values?.AccountName}
          suggestions={items}
          completeMethod={(e) => {
            search(e, "coa_cog_wise");
          }}
          onChange={(e) =>
            setPayloadData({ ...payloadData, coa_cog_wise: e.value })
          }
          className="w-100 required-fields"
          onSelect={(e) => validateInvestigation(e, "coa_cog_wise")}
          id="coa_cog_wise"
          itemTemplate={itemTemplate}
        />
        <label
          className="label lable truncate ml-3 p-1"
        >
          {t("coa_cog")}
        </label>
      </div>
      <div className="col-xl-1 col-md-1 col-sm-2 col-3  mb-2">
        <button
          className="btn btn-sm btn-primary  w-100   "
          onClick={handleSearch}
          type="button"
        >
          {t("Search")}
        </button>
      </div>
      {/* <div className="col-12" >
        <LedgerReportTable bodyData={tableData}/>
      </div> */}
      {tableData?.length > 0 && (
        <>
          <LedgerReportTable bodyData={tableData} values={values} payloadData={payloadData} />
        </>
      )}
    </>
  );
};

export default GeneralLedger;
