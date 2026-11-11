import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
  BindReportControlsAPI,
  GetPayableBankWiseReport,
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

const PayableBankWise = ({ dropDownlist, values }) => {
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
  });
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
    setPayloadData((val) => ({
      ...val,
      BranchCentre: [userData.MainCentreID],
    }));
  }, [values?.Centre?.length]);

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
    if (values?.Centre?.length == 0) {
      notify("Please select centre", "error");
      return;
    } else if (payloadData?.BranchCentre?.length === 0) {
      notify("Please select branch centre", "error");
      return;
    } else if (!payloadData?.coa_cog_wise?.ValueField) {
      notify("Please select chart of account", "error");
      return;
    }
    let BranchCentre = payloadData?.BranchCentre?.map((val) => val).join(
      ","
    );
    let centreID = values?.Centre?.map((val) => val).join(",");
    let data = {
      type: Number(values?.Type?.value || 0),
      centreID: centreID || "",
      branchCentreID: BranchCentre || "",
      accoaid: Number(payloadData?.coa_cog_wise?.ValueField || ""),
      fromDate: moment(payloadData?.fromDate).format("YYYY-MMM-DD") || "",
      toDate: moment(payloadData?.toDate).format("YYYY-MMM-DD") || "",
    };
    const apiResp = await GetPayableBankWiseReport(data);
    if (apiResp?.success) {
      setTableData(apiResp.data);
    } else {
      setTableData([]);
      notify(apiResp.message, "error");
    }
  };

  const thead = [
    { name: t("S.No.") },
    { name: t("From Account") },
    { name: t("Branch Bic") },
    { name: t("Beneficiary Name") },
    { name: t("Bank") },
    { name: t("Branch") },
    { name: t("Bic Code") },
    { name: t("Account No.") },
    { name: t("My Reference") },
    { name: t("Beneficiary Ref.") },
    { name: t("Net Pay"), textAlign: "right" },
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

          Space11: "Total",
          NetPay: handleTotalTable(data, "NetPay"),
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

      <ChartOfAccount
        label={"Chart Of Account"}
        dropDownlist={dropDownlist}
        VoucherType={"B"}
        setOldPayloadData={setPayloadData}
        Currency={payloadData?.Currency?.value}
        required={true}
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
          <Heading title={tableData[0]?.BankName} />
          <Heading title={tableData[0]?.Period} />
          <HisTable
            thead={thead}
            getRowClass={getRowClass}
            removeShorting={true}
            tbody={[
              ...tableData?.map((val, index) => {
                return {
                  "S.No": index + 1,
                  FromAccount: val?.FromAccount,
                  BranchBic: val?.BranchBic,
                  BenificiaryName: val?.BenificiaryName,
                  Bank: val?.Bank,
                  Branch: val?.Branch,
                  BicCode: val?.BicCode,
                  AccountNo: val?.AccountNo,
                  MyReference: val?.MyReference,
                  BenificiaryRef: val?.BenificiaryRef,
                  NetPay: (
                    <AlignTableText value={val?.NetPay} isAmount={true} />
                  ),
                };
              }),
              {
                Sr: "",
                FromAccount: "",
                BranchBic: "",
                BenificiaryName: "",
                Bank: "",
                Branch: "",
                BicCode: "",
                AccountNo: "",
                MyReference: "",
                BenificiaryRef: (
                  <AlignTableText value={t("Total") + " : "} isbold={true} />
                ),
                NetPay: (
                  <AlignTableText
                    value={handleTotalTable(tableData, "NetPay")}
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

export default PayableBankWise;
