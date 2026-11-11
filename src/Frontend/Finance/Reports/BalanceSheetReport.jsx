import React, { useEffect, useRef, useState } from "react";
import Heading from "../../../components/UI/Heading";
import MultiSelectComp from "../../../components/formComponent/MultiSelectComp";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import {
  BindReportControlsAPI,
  GetBalanceSheetReport,
  GetBSDetailReportAPI,
} from "../../../NetworkServices/finance.js";
import ReactSelect from "../../../components/formComponent/ReactSelect";
import { filterByTypes, notify } from "../../utils/Utils";
import { useLocalStorage } from "../../../utils/hooks/useLocalStorage";
import TreeViewTable from "../../../components/UI/customTable/TreeViewTable";
import { buildHierarchyTree, formatAmount } from "../../../utils/ustil2";
import { ExcelIconSVG, PDFIconSVG } from "../../../components/SvgIcons";
import IconsColor from "../../../utils/IconsColor";
import { transformDataInTranslate } from "../../../components/WrapTranslate";
import {
  exportHtmlToExcel,
  exportHtmlToPDF,
  exportHtmlToPDFNoPrint,
  exportHtmlToPDFNoPrintFinance,
  exportToExcel,
} from "../../../utils/exportLibrary";
import html2pdf from "html2pdf.js";
import DatePicker from "../../../components/formComponent/DatePickerHis";
import {
  matchBaseCentreWithCentre,
  SelectedBranchCentre,
} from "../../../utils/constant";
export default function Index({ dropDownlist, values }) {
  const userData = useLocalStorage("userData", "get");
  const [t] = useTranslation();
  const [payloadData, setPayloadData] = useState({});
  const [centres, setCentres] = useState([]);
console.log("CentreCentre",values)
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
      ["AsOnMonth"]: filterByTypes(
        dropDownlist?.AsOnMonthList,
        [
          dropDownlist?.FinancialYearList[
            dropDownlist?.FinancialYearList?.length - 1
          ]?.value || "0",
        ],
        ["TypeCode"],
        "TextField",
        "ValueField"
      )?.find(
        (val) =>
          val?.label?.split("-")[0]?.trim() ===
          new Date().toLocaleString("en-US", { month: "short" })
      ),
    }));
  }, [dropDownlist?.FinancialYearList?.length]);

  const [reportControlList, setReportControlList] = useState([]);
  const [tbodyData, setTbodyData] = useState([]);
  // const { GetEmployeeWiseCenter } = useSelector((state) => state.CommonSlice);
  const getBindReportControls = async () => {
    let apiResp = await BindReportControlsAPI();
    if (apiResp?.success) {
      setReportControlList(apiResp?.data);
    } else {
      setReportControlList([]);
    }
  };

  const handleSumCurrentYear = (data, GroupCode, type) => {
    let amount = data?.reduce((initial, item) => {
      if (
        item?.GroupCode?.slice(0, -3) === GroupCode ||
        item?.GroupCode?.slice(0, -6) === GroupCode
      ) {
        initial += Number(item[type] ? item[type] : 0);
      }
      return initial;
    }, 0);
    return amount;
  };

  function processData(data) {
    let result = [];
    let parent = {};
    let CurrentYeartotalAmt = 0;
    let LastYeartotalAmt = 0;
    let totalCurrentYearEquityLibilitiesAmt = 0;
    let totalLastYearEquityLibilitiesAmt = 0;
    data.forEach((item, index) => {
      if (!item?.isHideId) {
        CurrentYeartotalAmt += item?.CurrentYearValue;
        LastYeartotalAmt += item?.LastYearValue;
      }
      if (
        (!item?.isHideId && item?.GroupCode[0] === "5") ||
        item?.GroupCode[0] === "2"
      ) {
        totalCurrentYearEquityLibilitiesAmt += item?.CurrentYearValue;
        totalLastYearEquityLibilitiesAmt += item?.LastYearValue;
      }

      if (index === data?.length - 1) {
        let total = {
          GroupName: `CHECK/VARIANCE: `,
          GroupCode: Number(item?.GroupCode),
          GroupCodeDisplay: Number(item?.GroupCode),
          LastYearValue: LastYeartotalAmt,
          isHideId: true,
          isTotal: true,
          IsLast: 1,
          CurrentYearValue: CurrentYeartotalAmt,
        };
        let totalEquityLibilities = {
          GroupName: `TOTAL EQUITY & LIABILITIES: `,
          GroupCode: Number(item?.GroupCode + 1),
          GroupCodeDisplay: Number(item?.GroupCode + 1),
          LastYearValue: totalLastYearEquityLibilitiesAmt,
          isHideId: true,
          isTotal: true,
          IsLast: 1,
          CurrentYearValue: totalCurrentYearEquityLibilitiesAmt,
        };
        result.push(totalEquityLibilities, total);
      }

      if (item?.GroupCode?.length === 1) {
        if (
          parent?.GroupCode !== undefined &&
          item?.GroupCode !== parent?.parent
        ) {
          result.push(parent);
        }
        parent = {
          GroupName: `Total ${item?.GroupName} :`,
          isTotal: true,
          IsLast: 1,
          GroupCode: Number(item?.GroupCode + 1),
          GroupCodeDisplay: Number(item?.GroupCode + 1),
          LastYearValue: 0,
          isHideId: true,
          CurrentYearValue: 0,
        };
      }
      parent.CurrentYearValue += item?.CurrentYearValue;
      parent.LastYearValue += item?.LastYearValue;

      if (
        item?.IsLast === 1 &&
        item?.GroupCode?.slice(0, -3) !==
          data[index + 1]?.GroupCode?.slice(0, -3)
      ) {
        let findData = data?.find(
          (val) => val?.GroupCode === item?.GroupCode.slice(0, -3)
        );
        let obj = {
          GroupName: `Total ${findData?.GroupName} :`,
          isTotal: true,
          IsLast: 1,
          GroupCode: String(Number(item?.GroupCode) + 1),
          GroupCodeDisplay: String(Number(item?.GroupCode) + 1),
          LastYearValue: handleSumCurrentYear(
            data,
            findData?.GroupCode,
            "LastYearValue"
          ),
          isHideId: true,
          CurrentYearValue: handleSumCurrentYear(
            data,
            findData?.GroupCode,
            "CurrentYearValue"
          ),
        };
        result.push(item);
        result.push(obj);
      } else {
        result.push(item);
      }
    });
    return result;
  }

  const handleColorUsingLength = (code) => {
    if (code === 1) {
      return "colorlength1";
    } else if (code === 2) {
      return "colorlength1";
    } else if (code === 4 || code === 5) {
      return "colorlength4";
    } else if (code === 7) {
      return "colorlength7";
    } else if (code === 10) {
      return "colorlength10";
    }
  };
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
    let payload = {
      type: Number(values?.Type?.value || 0),
      centreID: centreID || "",
      BranchCentreID: BranchCentre || "",
      fyid: Number(
        payloadData?.FinancialYear?.value
          ? payloadData?.FinancialYear?.value
          : 0
      ),
      fyText: payloadData?.FinancialYear?.label
        ? payloadData?.FinancialYear?.label
        : "",
      fyStartEndDate: payloadData?.AsOnMonth?.value,
      reportType: 1,
      reportName: "Balance Sheet",
    };
    // debugger
    let apiResp = await GetBalanceSheetReport(payload);
    if (apiResp?.success) {
      let newData = processData(apiResp?.data);
      let date = {};
      const newResp = newData?.map((val, index) => {
        if (index === 0) {
          date.LastYearEndDate = val?.LastYearEndDate;
          date.CurrentEndDate = val?.CurrentEndDate;
        }
        // console.log("val", val);
        return {
          ...val,
          GroupName: {
            name: (
              <>
                {val?.isTotal ? (
                  <p
                    style={{
                      marginLeft: "5px",
                      marginBottom: 0,
                      textAlign: "right",
                    }}
                    className={`${handleColorUsingLength(val?.isTotal && String(val?.GroupCode)?.length - 3 > 0 ? String(val?.GroupCode)?.length - 3 : String(val?.GroupCode)?.length)} `}
                  >
                    {val?.GroupName}{" "}
                  </p>
                ) : (
                  <span
                    className={`${handleColorUsingLength(val?.isTotal && String(val?.GroupCode)?.length - 3 > 0 ? String(val?.GroupCode)?.length - 3 : String(val?.GroupCode)?.length)} `}
                  >
                    {val?.GroupName}{" "}
                  </span>
                )}
              </>
            ),
            isHideId: val?.isHideId,
            data: val,
          },
          CurrentYearValue: (
            <p
              style={{ margin: 1, textAlign: "right" }}
              // className={`${handleColorUsingLength(String(val?.GroupCode)?.length)} `}
              className={`${handleColorUsingLength(val?.isTotal && String(val?.GroupCode)?.length - 3 > 0 ? String(val?.GroupCode)?.length - 3 : String(val?.GroupCode)?.length)} `}
            >
              {val?.CurrentYearValue
                ? formatAmount(val?.CurrentYearValue)
                : val?.IsLast === 1
                  ? "0.00"
                  : ""}
            </p>
          ),
        };
      });
      setPayloadData((val) => ({ ...val, ...date, ReportData: newData }));
      let data = buildHierarchyTree(newResp, [
        "CurrentYearValue",
        // "LastYearValue",
      ]);
      setTbodyData(data);
    } else {
      setTbodyData([]);
      notify(apiResp?.message, "error");
    }
  };
  useEffect(() => {
    getBindReportControls();
  }, []);

  const handleMultiSelectChange = (name, selectedOptions) => {
    setPayloadData((val) => ({ ...val, [name]: selectedOptions }));
    // setPayloadData({
    //   ...payloadData,
    //   [name]: selectedOptions,
    // });
  };
  const handleExportExcel = () => {
    let reprortData = payloadData?.ReportData?.map((val) => {
      return {
        "COG Code": !val?.isHideId ? val?.GroupCode : "",
        "COG Name": val?.GroupName,
        [payloadData?.CurrentEndDate]: val?.CurrentYearValue,
        [payloadData?.LastYearEndDate]: val?.LastYearValue,
      };
    });
    exportToExcel(
      transformDataInTranslate(reprortData, t),
      t("Statement of Financial Position (Balance Sheet)")
    );
  };

  const handleExportPDF = () => {
    exportHtmlToPDFNoPrintFinance("printSection", "Balance Sheet");
  };

  const handleDoubleClick = async (item) => {
    console.log("asdasd", item?.groupName?.data?.GroupCode);
    if (item?.groupName?.data?.isTotal) {
      return;
    }
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
    let payload = {
      type: Number(values?.Type?.value || 0),
      centreID: centreID || "",
      BranchCentreID: BranchCentre || "",
      fyid: Number(
        payloadData?.FinancialYear?.value
          ? payloadData?.FinancialYear?.value
          : 0
      ),
      fyText: payloadData?.FinancialYear?.label
        ? payloadData?.FinancialYear?.label
        : "",
      fyStartEndDate: payloadData?.AsOnMonth?.value,
      reportType: 1,
      reportName: "Balance Sheet",
      CogCode: item?.groupName?.data?.GroupCode,
    };
    let apiResp = await GetBSDetailReportAPI(payload);
    if (apiResp?.success) {
      exportToExcel(
        [
          ...apiResp?.data,
          {
            groupName: null,
            accountName: null,
            groupCode: "Total : ",
            "31-Jan-2026": apiResp?.data?.reduce(
              (acc, curr) => acc + Number(curr?.["31-Jan-2026"] || 0),
              0
            ),
          },
        ],
        t("Balance Sheet Detail Report")
      );
    } else {
      notify(apiResp?.message, "error");
    }
  };

  return (
    <>
      <MultiSelectComp
        className="col-xl-2 col-md-4 col-sm-6 col-12"
        name="BranchCentre"
        id="BranchCentre"
        // placeholder={t("Branch Centre")}
        label={t("Branch Centre")}
        options={matchBaseCentreWithCentre(
          dropDownlist?.BranchCentre,
          values?.Centre
        )}
        onChange={handleMultiSelectChange}
        value={payloadData?.BranchCentre}
        requiredClassName={`required-fields`}
      />
      <ReactSelect
        placeholderName={t("Financial Year")}
        id="FinancialYear"
        name="FinancialYear"
        value={payloadData?.FinancialYear?.value}
        removeIsClearable={true}
        onChange={(name, value) =>
          setPayloadData((val) => ({ ...val, [name]: value }))
        }
        dynamicOptions={dropDownlist?.FinancialYearList}
        searchable={true}
        respclass="col-xl-2 col-md-4 col-sm-6 col-12"
      />

      <ReactSelect
        placeholderName={t("As On Month")}
        id="AsOnMonth"
        name="AsOnMonth"
        value={payloadData?.AsOnMonth?.value}
        removeIsClearable={true}
        onChange={(name, value) =>
          setPayloadData((val) => ({ ...val, [name]: value }))
        }
        dynamicOptions={filterByTypes(
          dropDownlist?.AsOnMonthList,
          [payloadData?.FinancialYear?.value || "0"],
          ["TypeCode"],
          "TextField",
          "ValueField"
        )}
        searchable={true}
        respclass="col-xl-2 col-md-4 col-sm-6 col-12"
      />
      <div className="col-12 d-flex justify-content-end mb-2">
        <button
          className="btn btn-sm btn-primary px-3"
          type="button"
          onClick={handleSearch}
        >
          {t("Search")}
        </button>
      </div>
      {/* </div> */}
      {tbodyData?.length > 0 && (
        <div id="printSection" className="w-100">
          <Heading
            isBreadcrumb={false}
            title={t("Statement of Financial Position (Balance Sheet)")}
            secondTitle={
              <>
                <span onClick={handleExportPDF} className="no-print">
                  <PDFIconSVG />
                </span>

                <span onClick={()=>{exportHtmlToExcel(
                  "printSection",
                  t(values?.reportType?.label)
                )}} className="no-print">
                  <ExcelIconSVG />{" "}
                </span>
              </>
            }
          />

          <TreeViewTable
            thead={[
              { name: t("COG Code"), width: "10%" },
              t("COG Name"),
              {
                name: payloadData?.CurrentEndDate,
                textAlign: "right",
                width: "10%",
              },
              // payloadData?.LastYearEndDate,
            ]}
            tbody={[...tbodyData]}
            handleDoubleClick={handleDoubleClick}
            isSNo={false}
            isTreeOpen={true}
            isRemoveArrow={false}
            isShowBorder={true}
          />
        </div>
      )}
      {/* </div>
            </div> */}
    </>
  );
}
