import React, { useEffect, useRef, useState } from "react";
import Heading from "../../../components/UI/Heading";
import MultiSelectComp from "../../../components/formComponent/MultiSelectComp";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import {
  BindReportControlsAPI,
  GetBalanceSheetReport,
  searchGetParentsData,
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
  exportHtmlToPDF,
  exportHtmlToPDFNoPrint,
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
          GroupName: `CHECK/VARIANCE`,
          GroupCode: Number(item?.GroupCode),
          GroupCodeDisplay: Number(item?.GroupCode),
          LastYearValue: LastYeartotalAmt,
          isHideId: true,
          isTotal: true,
          IsLast: 1,
          CurrentYearValue: CurrentYeartotalAmt,
        };
        let totalEquityLibilities = {
          GroupName: `TOTAL EQUITY & LIABILITIES`,
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
          GroupName: `Total ${item?.GroupName}`,
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
          GroupName: `Total ${findData?.GroupName}`,
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
    
    let BranchCentre = payloadData?.BranchCentre?.map((val) => val?.code).join(
      ","
    );
    
    if (!BranchCentre) {
      notify("Branch Centre is Required", "error");
      return;
    }
    let payload = {
      BranchCentreID: BranchCentre,
      ParentsID: "0",
    };
    // console.log("payload",payload)
    const apiResp = await searchGetParentsData(payload);
    if (apiResp?.success) {
      let newData = processData(apiResp?.data);
      let date = {};
      const newResp = newData?.map((val, index) => {
        if (index === 0) {
          date.LastYearEndDate = val?.LastYearEndDate;
          date.CurrentEndDate = val?.CurrentEndDate;
        }

        return {
          ...val,
          GroupName: {
            name: (
              <span
                className={`${handleColorUsingLength(val?.isTotal && String(val?.GroupCode)?.length - 3 > 0 ? String(val?.GroupCode)?.length - 3 : String(val?.GroupCode)?.length)} `}
              >
                {val?.GroupName}{" "}
              </span>
            ),
            isHideId: val?.isHideId,
          },
          CurrentYearValue: (
            <span
              // className={`${handleColorUsingLength(String(val?.GroupCode)?.length)} `}
              className={`${handleColorUsingLength(val?.isTotal && String(val?.GroupCode)?.length - 3 > 0 ? String(val?.GroupCode)?.length - 3 : String(val?.GroupCode)?.length)} `}
            >
              {val?.CurrentYearValue
                ? formatAmount(val?.CurrentYearValue)
                : val?.IsLast === 1
                  ? "0.00"
                  : ""}
            </span>
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
    exportHtmlToPDFNoPrint("printSection", "Balance Sheet");
  };

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
        handleChange={handleMultiSelectChange}
        value={payloadData?.BranchCentre}
        requiredClassName={`required-fields`}
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

                <span onClick={handleExportExcel} className="no-print">
                  <ExcelIconSVG />{" "}
                </span>
              </>
            }
          />

          <TreeViewTable
            thead={[
              t("COG Code"),
              t("COG Name"),
              payloadData?.CurrentEndDate,
              // payloadData?.LastYearEndDate,
            ]}
            tbody={[...tbodyData]}
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
