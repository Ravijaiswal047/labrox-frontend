import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
  BindReportControlsAPI,
  GetWithHoldingTaxReportAPI,
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
import { formatAmount } from "../../../utils/ustil2";
import AlignTableText from "../../../components/commonComponents/AlignTableText";
import HisTable from "../../../components/UI/customTable/HisTable.jsx";

const WithHoldingTaxReport = ({ dropDownlist, values }) => {
  const userData = useLocalStorage("userData", "get");

  const [t] = useTranslation();
  const [payloadData, setPayloadData] = useState({
    BranchCentre: [],

    Currency: {
      label: userData?.centreCurrency,
      value: userData?.centreCurrency,
    },
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
      notify("Please select centre", "error");
      return;
    }
    if (!BranchCentre) {
      notify("Please select branch centre", "error");
      return;
    }

    const payload = {
      Type: Number(values?.Type?.value || 0),
      CentreID: centreID ? centreID : "",
      BranchCentreID: BranchCentre ? BranchCentre : "",
      fromDate: moment(payloadData?.fromDate).format("YYYY-MM-DD") || "",
      toDate: moment(payloadData?.toDate).format("YYYY-MM-DD") || "",
      SupplierCOAID: Number(payloadData?.coa_cog_wise?.ValueField || 0),
    };

    const apiResp = await GetWithHoldingTaxReportAPI(payload);
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

    { width: "2%", name: t("COA") },
    { width: "2%", name: t("COA Name") },
    { width: "2%", name: t("Currency") },
    { width: "2%", name: t("Type") },
    { width: "2%", name: t("Inv/Bill No") },
    { width: "2%", name: t("Inv/Bill Date") },
    { width: "2%", name: t("Bill/Inv Amt") },
    { width: "2%", name: t("Paid Amount") },
    { width: "2%", name: t("Pending Amount") },
    { width: "2%", name: t("Ex@Rate") },
  ];

  const keys =
    tableData?.length > 0
      ? Object.keys(tableData[0]).filter((key) => key !== "SupplierCOAID")
      : [];

  let totalRow = keys.reduce((acc, key) => {
    // 👉 srNumber ke liye hardcoded value
    if (key === "InvoiceNo") {
      acc[key] = <AlignTableText value={"Total"} side="center" isbold={true} />;
      return acc;
    }
    if (key === "S_No.") {
      acc[key] = "";
      return acc;
    }

    const total = tableData.reduce((sum, row) => {
      const val = row[key];
      return !isNaN(val) && val !== "" && val !== null
        ? sum + Number(val)
        : sum;
    }, 0);

    acc[key] = (
      <AlignTableText
        value={!isNaN(total) && total !== 0 ? total : ""}
        side="center"
        isbold={true}
      />
    );
    return acc;
  }, {});

  const handleExportPDF = () => {
    exportHtmlToPDFNoPrintFinance(
      "printSectionpdf",
      values?.reportType?.label,
      "landscape"
    );
  };

  const exportToExcelReport = (data) => {
    const keys =
      tableData?.length > 0
        ? Object.keys(tableData[0]).filter((key) => key !== "SupplierCOAID")
        : [];

    let totalRow = keys.reduce((acc, key) => {
      // 👉 srNumber ke liye hardcoded value
      if (key === "InvoiceNo") {
        acc[key] = "Total";
        return acc;
      }
      if (key === "S_No.") {
        acc[key] = "";
        return acc;
      }

      const total = tableData.reduce((sum, row) => {
        const val = row[key];
        return !isNaN(val) && val !== "" && val !== null
          ? sum + Number(val)
          : sum;
      }, 0);

      acc[key] = !isNaN(total) && total !== 0 ? total : "";
      return acc;
    }, {});
    exportToExcel(
      [...data, { Space1: "", ...totalRow }],
      values?.reportType?.label
    );
  };

  const getRowClass = (val, index) => {
    if (tableData?.length === index) {
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
        value={payloadData?.toDate}
        showTime
        hourFormat="12"
        handleChange={(date) => handleChange(date, "toDate")}
      />

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
              onClick={() => exportHtmlToExcel(
                  "printSectionpdf",
                  t(values?.reportType?.label)
                )}
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
          {/* <Heading title={tableData[0]?.Period} />x */}

          {tableData?.length > 0 && (
            <HisTable
              thead={
                tableData?.length > 0
                  ? Object.keys(tableData[0])
                      ?.filter((key) => key !== "SupplierCOAID")
                      ?.map((val) => {
                        return {
                          name: val,
                          textAlign: "center",
                          width: val === "S_No." ? "1%" : "10%",
                        };
                      })
                  : []
              }
              tbody={[
                ...tableData?.map((item, index) => {
                  let obj = {};
                  Object.keys(tableData[0])
                    ?.filter((key) => key !== "SupplierCOAID")
                    ?.forEach((key) => {
                      obj[key] = (
                        <AlignTableText value={item[key]} side="center" />
                      );
                    });
                  return obj;
                }),
                totalRow,
              ]}
              getRowClass={getRowClass}
            />
          )}
        </div>
      )}
    </>
  );
};

export default WithHoldingTaxReport;
