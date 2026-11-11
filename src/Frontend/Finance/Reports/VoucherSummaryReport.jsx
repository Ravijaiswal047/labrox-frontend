import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
  BindReportControlsAPI,
  PurchaseBillDueReport,
  VoucherSummaryReportAPI,
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

import GroupTable from "../../../components/UI/customTable/GroupTable/GroupTable";
import AlignTableText from "../../../components/commonComponents/AlignTableText";
import { handleTotalTable } from "../../../utils/ustil2";

const VoucherSummaryReport = ({ dropDownlist, values }) => {
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
  const [reportControlList, setReportControlList] = useState([]);
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
    let BranchCentre = payloadData?.BranchCentre?.map((val) => val).join(
      ","
    );
    let centreID = values?.Centre?.map((val) => val).join(",");

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
      CentreID: centreID,
      BranchCentreID: BranchCentre,
      fromDate: moment(payloadData?.fromDate).format("YYYY-MM-DD") || "",
      toDate: moment(payloadData?.toDate).format("YYYY-MM-DD") || "",
    };
    const apiResp = await VoucherSummaryReportAPI(payload);

    if (apiResp?.success) {
      setTableData(apiResp.data);
    } else {
      setTableData([]);
      notify(apiResp.message, "error");
    }
  };

  const thead = [
    { name: t("S.No"), width: "1%" },
    { name: t("Voucher Type") },
    { name: t("Created"), textAlign: "right" },
    { name: t("Cancelled"), textAlign: "right" },
    { name: t("Approved By Accountant"), textAlign: "right" },
    { name: t("Approved By DF"), textAlign: "right" },
    { name: t("Approved By ED"), textAlign: "right" },
    { name: t("Finalized"), textAlign: "right" },
  ];
  const GROUP_THEAD = [
    { name: "", colSpan: 2 },
    { name: t("Total Number Of Voucher"), colSpan: 6 },
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
        lable={t("Branch Centre")}
        options={matchBaseCentreWithCentre(
          dropDownlist?.BranchCentre,
          values?.Centre
        )}
        onChange={handleMultiSelectChange}
        value={payloadData?.BranchCentre}
        requiredClassName={`required-fields`}
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
          <GroupTable
            getRowClass={getRowClass}
            thead={thead}
            groupThead={GROUP_THEAD}
            tbody={[
              ...tableData?.map((val, index) => {
                return {
                  "S.No": index + 1,
                  Voucher: val?.Voucher,
                  "Total No of Voucher Created": (
                    <AlignTableText
                      value={val["Total No of Voucher Created"]}
                      isAmount={true}
                      side="right"
                    />
                  ),

                  "Total No of Voucher Cancelled": (
                    <AlignTableText
                      value={val["Total No of Voucher Cancelled"]}
                      isAmount={true}
                      side="right"
                    />
                  ),

                  "Total No of Voucher Approved By Accountant": (
                    <AlignTableText
                      value={val["Total No of Voucher Approved By Accountant"]}
                      isAmount={true}
                      side="right"
                    />
                  ),

                  "Total No of Voucher Approved By DF": (
                    <AlignTableText
                      value={val["Total No of Voucher Approved By DF"]}
                      isAmount={true}
                      side="right"
                    />
                  ),

                  "Total No of Voucher Approved By ED": (
                    <AlignTableText
                      value={val["Total No of Voucher Approved By ED"]}
                      isAmount={true}
                      side="right"
                    />
                  ),

                  "Total No of Voucher Finalized": (
                    <AlignTableText
                      value={val["Total No of Voucher Finalized"]}
                      isAmount={true}
                      side="right"
                    />
                  ),
                };
              }),
              ,
              {
                Sr: "",
                Voucher: (
                  <AlignTableText value={t("Total") + " : "} isbold={true} />
                ),
                "Total No of Voucher Created": (
                  <AlignTableText
                    value={handleTotalTable(
                      tableData,
                      "Total No of Voucher Created"
                    )}
                    isbold={true}
                    isAmount={true}
                    side="right"
                  />
                ),

                "Total No of Voucher Cancelled": (
                  <AlignTableText
                    value={handleTotalTable(
                      tableData,
                      "Total No of Voucher Cancelled"
                    )}
                    isbold={true}
                    isAmount={true}
                    side="right"
                  />
                ),

                "Total No of Voucher Approved By Accountant": (
                  <AlignTableText
                    value={handleTotalTable(
                      tableData,
                      "Total No of Voucher Approved By Accountant"
                    )}
                    isbold={true}
                    isAmount={true}
                    side="right"
                  />
                ),

                "Total No of Voucher Approved By DF": (
                  <AlignTableText
                    value={handleTotalTable(
                      tableData,
                      "Total No of Voucher Approved By DF"
                    )}
                    isbold={true}
                    isAmount={true}
                    side="right"
                  />
                ),

                "Total No of Voucher Approved By ED": (
                  <AlignTableText
                    value={handleTotalTable(
                      tableData,
                      "Total No of Voucher Approved By ED"
                    )}
                    isbold={true}
                    isAmount={true}
                    side="right"
                  />
                ),

                "Total No of Voucher Finalized": (
                  <AlignTableText
                    value={handleTotalTable(
                      tableData,
                      "Total No of Voucher Finalized"
                    )}
                    isbold={true}
                    isAmount={true}
                    side="right"
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

export default VoucherSummaryReport;
