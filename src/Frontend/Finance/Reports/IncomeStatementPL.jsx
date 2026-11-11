import React, { useEffect, useRef, useState } from "react";
import Heading from "../../../components/UI/Heading";
import MultiSelectComp from "../../../components/formComponent/MultiSelectComp";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import {
  BindReportControlsAPI,
  GetBalanceSheetReport,
  GetISReportAPI,
} from "../../../NetworkServices/finance.js";
import ReactSelect from "../../../components/formComponent/ReactSelect";
import { filterByTypes, notify } from "../../utils/Utils";
import { useLocalStorage } from "../../../utils/hooks/useLocalStorage";
import TreeViewTable from "../../../components/UI/customTable/TreeViewTable";
import {
  buildHierarchyTree,
  buildHierarchyTreeForPNLFinaceReport,
  formatAmount,
} from "../../../utils/ustil2";
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
import IncomeStatementPLTable from "./IncomeStatementPLTable";
export default function IncomeStatementPL({ dropDownlist, values }) {
  
  const userData = useLocalStorage("userData", "get");
  const [t] = useTranslation();
  const [payloadData, setPayloadData] = useState({
    BranchCentre: [],
    keyList: [],
  });

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
  function processData(data, splitFromKeyterKey) {
    let result = [];
    let parent = {};
    let CurrentYeartotalAmt = 0;
    let LastYeartotalAmt = 0;
    let totalCurrentYearEquityLibilitiesAmt = 0;
    let totalLastYearEquityLibilitiesAmt = 0;
    data.forEach((item, index) => {
      if (index === data?.length - 1) {
        let total = {
          GroupName: `CHECK/VARIANCE: `,
          GroupCode: eval(item?.GroupCode),
          GroupCodeDisplay: eval(item?.GroupCode),
          LastYearValue: LastYeartotalAmt,
          isHideId: true,
          isTotal: true,
          IsLast: 1,
          CurrentYearValue: CurrentYeartotalAmt,
        };
        let totalEquityLibilities = {
          GroupName: `TOTAL EQUITY & LIABILITIES: `,
          GroupCode: eval(item?.GroupCode + 1),
          GroupCodeDisplay: eval(item?.GroupCode + 1),
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
          GroupName: `Total1 ${item?.GroupName} :`,
          isTotal: true,
          IsLast: 1,
          GroupCode: eval(item?.GroupCode + 1),
          GroupCodeDisplay: eval(item?.GroupCode + 1),
          LastYearValue: 0,
          isHideId: true,
          CurrentYearValue: 0,
        };
      }

      if (
        item?.IsLast === 1 &&
        item?.GroupCode?.slice(0, -3) !==
          data[index + 1]?.GroupCode?.slice(0, -3) &&
        !data[index + 1]?.DepartmentCode
      ) {
        let findData = data?.find(
          (val) => val?.GroupCode === item?.GroupCode.slice(0, -3)
        );
        let newResData = {};
        splitFromKeyterKey?.map((item) => {
          debugger;
          newResData[item] = handleSumCurrentYear(
            data?.filter((val) =>
              val?.GroupCode?.toLowerCase().startsWith(findData?.GroupCode)
            ),
            findData?.GroupCode,
            item
          );
        });

        let obj = {
          GroupName: `Total2 ${findData?.GroupName} :`,
          isTotal: true,
          IsLast: 1,
          GroupCode: String(Number(item?.GroupCode) + 1),
          GroupCodeDisplay: String(Number(item?.GroupCode) + 1),
          ...newResData,
          // LastYearValue: handleSumCurrentYear(
          //   data,
          //   findData?.GroupCode,
          //   "LastYearValue"
          // ),
          // CurrentYearValue: handleSumCurrentYear(
          //   data,
          //   findData?.GroupCode,
          //   "CurrentYearValue"
          // ),
          isHideId: true,
        };
        result.push(item);
        result.push(obj);
      } else {
        result.push(item);
      }
    });
    return result;
  }
  const splitFromKey = (array, key) => {
    const index = array.indexOf(key);
    return {
      before: index !== -1 ? array.slice(0, index + 1) : array,
      after: index !== -1 ? array.slice(index + 1) : [],
    };
  };
  const updateIdWithTotalFY = (data) => {
    return data?.map((item) => {
      const totalFY = item?.groupName?.data?.DepartmentCode ?? 0;
      // debugger

      return {
        ...item,
        id: `${item?.id}_${totalFY}`,
        children: Array.isArray(item?.children)
          ? updateIdWithTotalFY(item?.children)
          : [],
      };
    });
  };

  const handleSearch = async (IsCOAWise, GroupCode = "", DeptCode = "") => {
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
    let FilterType = payloadData?.FilterType?.map((val) => val?.code).join(",");
    let month = payloadData?.Month?.map((val) => val?.code).join(",");
    let Dept = payloadData?.Department?.map((val) => String(val?.code));
    if (payloadData?.FilterType?.find((val) => val?.code === "2") && !month) {
      notify("Please select month", "error");
      return;
    }

    const payload = {
      CentreID: centreID,
      BranchCentreID: BranchCentre,
      FYID: Number(
        payloadData?.FinancialYear?.value
          ? payloadData?.FinancialYear?.value
          : 0
      ),
      FYText: payloadData?.FinancialYear?.label
        ? payloadData?.FinancialYear?.label
        : "",
      FYStartEndDate: payloadData?.FinancialYear?.TypeCode || "",
      ReportType: 1,
      ReportName: "Income Statement",
      FilterType: FilterType || "",
      MonthValue: month || "",
      Type: Number(values?.Type?.value || 0),
      DepartmentValue: Dept || [],
      IsCOAWise: IsCOAWise,
      GroupCode: GroupCode,
      DeptCode: DeptCode,
    };
    let apiResp = await GetISReportAPI(payload);
    // debugger
    if (apiResp?.success) {
      if (IsCOAWise === 1) {
        return apiResp?.data;
      } else {
        setTbodyData(apiResp?.data);
      }
      return;

      const splitFromKeyterKey = splitFromKey(
        Object.keys(apiResp?.data[0]),
        "IsLast"
      )?.after;
      let newData = processData(apiResp?.data, splitFromKeyterKey);
      let date = {};
      const newResp = newData?.map((val, index) => {
        console.log("valvalvalval", val);

        let newResData = {};
        splitFromKeyterKey?.map((item) => {
          newResData[item] = val[item] ? val[item] : "";
        });

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
            rowType: val?.isTotal ? "Total" : "",
          },
          ...newResData,
          // "Total FY : 25-26": "asasas",
          // CurrentYearValue: (
          //   <p
          //     style={{ margin: 1, textAlign: "right" }}
          //     // className={`${handleColorUsingLength(String(val?.GroupCode)?.length)} `}
          //     className={`${handleColorUsingLength(val?.isTotal && String(val?.GroupCode)?.length - 3 > 0 ? String(val?.GroupCode)?.length - 3 : String(val?.GroupCode)?.length)} `}
          //   >
          //     {val?.CurrentYearValue
          //       ? formatAmount(val?.CurrentYearValue)
          //       : val?.IsLast === 1
          //         ? "0.00"
          //         : ""}
          //   </p>
          // ),
        };
      });
      setPayloadData((val) => ({
        ...val,
        ...date,
        ReportData: newData,
        keyList: Object.keys(apiResp?.data[0]),
      }));
      let data = buildHierarchyTreeForPNLFinaceReport(
        newResp,
        splitFromKeyterKey || [],
        "DepartmentCode"
      );
      // let newUpdatedData = updateIdWithTotalFY(data);
      console.log("sssssssssssssssssss", data);
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
    setPayloadData({
      ...payloadData,
      [name]: selectedOptions,
    });
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
    exportHtmlToPDFNoPrintFinance(
      "printSectionpdf",
      values?.reportType?.label,
      "landscape"
    );
  };

  useEffect(() => {
    if (payloadData?.FilterType?.find((val) => val?.value == 3)) {
      handleSearch(0);
    }
  }, [payloadData?.FilterType]);

  const handleClick = (item, type, index) => {
    // type===close
    console.log("asdasdasd", item, type, index);
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

      <MultiSelectComp
        className="col-xl-2 col-md-4 col-sm-6 col-12"
        name="FilterType"
        id="FilterType"
        placeholder={t("Filter Type")}
        options={[
          { label: "Compare Last Year", value: "1" },
          { label: "Month Wise", value: "2" },
          { label: "Department Wise", value: "3" },
        ]}
        onChange={handleMultiSelectChange}
        value={payloadData?.FilterType}
        // requiredClassName={`required-fields`}
      />
      {payloadData?.FilterType?.find((val) => val === "2") && (
        <MultiSelectComp
          className="col-xl-2 col-md-4 col-sm-6 col-12"
          name="Month"
          id="Month"
          placeholder={t("Month")}
          options={Array.from({ length: 12 }, (_, index) => ({
            value:
              String(index + 1)?.length === 1
                ? `0${index + 1}`
                : `${index + 1}`,
            label: new Date(0, index).toLocaleString("default", {
              month: "long",
            }),
          }))}
          onChange={handleMultiSelectChange}
          value={payloadData?.Month}
          requiredClassName={`required-fields`}
        />
      )}
      {payloadData?.FilterType?.find((val) => val === "3") && (
        <MultiSelectComp
          className="col-xl-2 col-md-4 col-sm-6 col-12"
          name="Department"
          id="Department"
          placeholder={t("Department")}
          options={dropDownlist?.DepartmentList.map((val) => ({
            label: val?.name,
            value: val?.code,
          }))}
          onChange={handleMultiSelectChange}
          value={payloadData?.Department}
          // requiredClassName={`required-fields`}
        />
      )}

      <div className="col-xl-12 d-flex justify-content-end mb-2">
        <button
          className="btn btn-sm btn-primary px-3"
          type="button"
          onClick={() => {
            handleSearch(0);
          }}
        >
          {t("Search")}
        </button>
      </div>
      {/* </div> */}
      {tbodyData?.length > 0 && (
        <div id="printSectionpdf" className="w-100">
      
      <Heading 
      isBreadcrumb={false}
      title={`${t("Centre")}: ${values?.Centre?.map((val) => val?.name).join(", ")}`}
      />
      <Heading 
      isBreadcrumb={false}
      title={`${t("For the")}: ${payloadData?.FinancialYear?.label}`}
      />

          <IncomeStatementPLTable
            data={tbodyData}
            fetchLazyChildren={async (row) => {
              let apiResp = await handleSearch(
                1,
                row.GroupCode,
                row.DepartmentCode
              );
              // API call here
              // debugger;
              return apiResp?.map((val) => ({
                ...val,
                isRemoveArrow: true,
              }));
            }}
            values={values}
          />

          {/*        
          <TreeViewTable
            thead={[
              { name: t("COG Code"), width: "10%" },
              t("COG Name"),
              ...splitFromKey(payloadData?.keyList, "IsLast")?.after,
            ]}
          
            tbody={[...tbodyData]}
            isSNo={false}
            isTreeOpen={true}
            isRemoveArrow={false}
            isShowBorder={true}
            isShowLastNode={true}
            handleClick={handleClick}
          /> */}
        </div>
      )}
      {/* </div>
            </div> */}
    </>
  );
}
