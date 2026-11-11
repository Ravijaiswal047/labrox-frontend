import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
  BindReportControlsAPI,
  GetGLReport,
  GetTrialBalanceReport,
} from "../../../NetworkServices/finance.js";
import { useSelector } from "react-redux";
import Heading from "../../../components/UI/Heading";
import MultiSelectComp from "../../../components/formComponent/MultiSelectComp";
import ReactSelect from "../../../components/formComponent/ReactSelect";
import { filterByTypes, notify } from "../../utils/Utils";
import moment from "moment";
import { AutoComplete } from "primereact/autocomplete";

import { useLocalStorage } from "../../../utils/hooks/useLocalStorage";
import CustomDateRangePicker from "../../../components/commonComponents/DateRangePicker";
import NestedRowTable from "../../../components/UI/customTable/NestedRowTable";
import {
  matchBaseCentreWithCentre,
  SelectedBranchCentre,
} from "../../../utils/constant";
import AlignTableText from "../../../components/commonComponents/AlignTableText";
import LedgerReportTable from "./LedgerReportTable";
import { exportToExcel } from "../../../utils/exportLibrary";
import { transformDataInTranslate } from "../../../components/WrapTranslate";
import FinanceModal from "../../../components/ModalComponent/FinanceModal";
const TrialBalanceReport = ({ dropDownlist, values }) => {
  const userData = useLocalStorage("userData", "get");

  const [t] = useTranslation();
  const [payloadData, setPayloadData] = useState({
    BranchCentre: [],
    Currency: {
      label: userData?.centreCurrency,
      value: userData?.centreCurrency,
    },
    FinancialYear: {},
    fromDate: new Date(),
    toDate: "",
  });

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

  const [reportControlList, setReportControlList] = useState([]);
  const [tableData, setTableData] = useState([]);
  const [ledgerData, setLedgerData] = useState([]);

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

  const handleSearch = async (
    groupBy,
    index,
    item,
    isInLoop = false,
    isExcel = false
  ) => {
    const centreID = values?.Centre?.map((val) => val?.code).join(",");
    const BranchCentre = payloadData?.BranchCentre?.map(
      (val) => val?.code
    ).join(",");
    // item?.GroupCode
    let data = {
      Type: Number(values?.Type?.value || 0),
      CentreID: centreID ? centreID : "",
      BranchCentreID: BranchCentre ? BranchCentre : "",
      ACFilterType: 3,
      acFilterValue: String(
        index !== undefined
          ? item?.GroupCode
          : payloadData?.coa_cog_wise?.ValueField || 0
      ),
      CurrencyCode: payloadData?.Currency?.value || "",
      fyid: Number(payloadData?.FinancialYear?.value || 1),
      fyText: payloadData?.FinancialYear?.label || "",
      fromDate: moment(payloadData?.fromDate).format("YYYY-MM-DD") || "",
      toDate: payloadData?.toDate ? moment(payloadData?.toDate).format("YYYY-MM-DD") : moment(payloadData?.fromDate).format("YYYY-MM-DD"),
      fyStartEndDate: payloadData?.FinancialYear?.TypeCode,
      reportType: 1,
      reportName: "Trial Balance",
      groupBy: groupBy,
    };
    // debugger
    try {
      const apiResp = await GetTrialBalanceReport(
        data,
        isInLoop,
        tableData,
        index
      );
      if (apiResp?.success) {
        if (isExcel) {
          return apiResp.data;
        }
        if (index === undefined) {
          setTableData(apiResp.data);
        } else {
          let updatedTableData = [...tableData];
          updatedTableData[index].subRow = {
            subRowList: apiResp?.data,
            isopen: true,
            secondThead: thead,
          };
          setTableData(updatedTableData);
        }
      } else {
        notify(apiResp.message, "error");
        if (index === undefined) {
          setTableData([]);
        }
      }
    } catch (error) {
      setTableData([]);
    }
  };

  const thead = [
    { name: t("S.No"), width: "1%" },
    { name: t("COGCode") },
    { name: t("Chart Of Group") },
    { name: t("Opening Balance"), textAlign: "right" },
    { name: t("Total Debit"), textAlign: "right" },
    { name: t("Total Credit"), textAlign: "right" },
    { name: t("Closing Balance"), textAlign: "right" },
  ];

  const [items, setItems] = useState([]);

  const search = async (event, name) => {
    if (event?.query?.length > 0) {
      const results = filterByTypes(
        reportControlList,
        [3],
        ["TypeID"],
        "TextField",
        "ValueField"
      );
      if (results && results.length > 0) {
        let filterData = results.filter((val) =>
          val?.label?.toLowerCase().includes(event?.query.toLowerCase())
        );

        setItems(filterData);
      } else {
        setItems([]);
      }
    } else {
      setItems([]);
    }
  };
  const validateInvestigation = async (e, name) => {
    const { value } = e;

    if (name === "COG") {
      value.isAccountType = true;
      setPayloadData((val) => ({ ...val, ["COG"]: value }));
    } else {
      setPayloadData((val) => ({ ...val, [name]: "" }));
    }
  };
  const itemTemplate = (item) => {
    return (
      <div className="p-clearfix">
        <div style={{ float: "left", fontSize: "12px", width: "100%" }}>
          {item?.label}
        </div>
      </div>
    );
  };

  const handleDateRangeChange = (e) => {
    const { startDate, endDate } = e.target.value;
    setPayloadData((val) => ({ ...val, fromDate: startDate, toDate: endDate }));
  };

  const handleOpenLedgerReport = async (item) => {
    if (!payloadData?.FinancialYear?.value) {
      notify("Please Select Financial Year", "error");
      return;
    }

    const centreID = values?.Centre?.map((val) => val?.code).join(",");
    const BranchCentre = values?.BranchCentre?.map((val) => val?.code).join(
      ","
    );
    const payload = {
      CentreID: centreID ? centreID : "",
      BranchCentreID: BranchCentre ? BranchCentre : "",
      CurrencyCode: item?.CurrencyCode || "",
      VoucherType: "0",
      ACFilterType: 4,
      ACFilterValue: String(item?.COAID || ""),
      FromDate: moment(payloadData?.fromDate).format("DD-MMM-YYYY"),
      ToDate: moment(payloadData?.toDate).format("DD-MMM-YYYY"),
      TransactionType: Number(0),
      IsNarration: Number(1),
      IsOppositeAC: Number(0),
      GroupBy: "Date",
      FYID: Number(item?.FYID),
      FYText: String(payloadData?.FinancialYear?.label),
      FYStartEndDate: String(payloadData?.FinancialYear?.TypeCode),
      ReportType: 1,
      ReportName: "General Ledger",
    };
    try {
      // First API call
      const apiResp = await GetGLReport(payload);
      if (apiResp?.success) {
        setLedgerData(apiResp?.data);
      } else {
        setLedgerData([]);
        notify(apiResp?.message, "error");
      }
    } catch (error) {
      console.error("Error in handleSearch:", error);
      setTableData([]);
    }
  };

  const handleOpenExcel = async (item, index) => {
    let data = await handleSearch(4, index, item, false, true);
    const newData = data?.map((val) => {
      val.GroupCode = val?.GroupCodeDisplay;
      delete val?.GroupBy;
      delete val?.FYID;
      delete val?.CentreID;
      delete val?.CentreName;
      delete val?.CurrencyCode;
      delete val?.GroupCodeDisplay;
      return val;
    });
    exportToExcel(transformDataInTranslate(newData, t), "Trial Balance Report");
  };

  const handleSubRow = (subRow, GroupBy) => {
    const tableResponse =
      subRow?.subRowList?.length > 0 &&
      subRow?.subRowList?.map((item, index) => {
        return {
          SNo: index + 1,
          COAID: item?.COAID,
          COAName: (
            <strong
              style={{ color: String(GroupBy) === "4" ? "red" : "" }}
              onDoubleClick={() => {
                String(GroupBy) === "4" && handleOpenLedgerReport(item);
              }}
            >
              {item?.COAName}
            </strong>
          ),
          OpeningBalance: (
            <AlignTableText value={item?.Opening} isAmount={true} />
          ),
          TotalDebit: (
            <AlignTableText value={item?.TotalDebit} isAmount={true} />
          ),
          TotalCredit: (
            <AlignTableText value={item?.TotalCredit} isAmount={true} />
          ),
          Closing: <AlignTableText value={item?.Closing} isAmount={true} />,
        };
      });

    return {
      subRowList: tableResponse,
      isopen: subRow?.isopen,
      secondThead: [
        { name: t("S.No"), width: "3%" },
        { name: t("COGCode") },
        { name: t("Chart Of Group") },
        { name: t("Opening Balance"), textAlign: "right" },
        { name: t("Total Debit"), textAlign: "right" },
        { name: t("Total Credit"), textAlign: "right" },
        { name: t("Closing Balance"), textAlign: "right" },
      ],
    };
  };

  const handleMini = (index) => {
    const table = [...tableData];
    table[index]["subRow"]["isopen"] = false;
    table[index]["subRow"]["subRowList"] = [];
    setTableData(table);
  };
  const handleTableFormat = (tableData) => {
    return tableData?.map((item, index) => {
      return {
        SNo: <strong>{index + 1}</strong>,
        COAID: <strong>{item?.COAID}</strong>,
        COGName: (
          <span style={{ fontWeight: "bold" }}>
            {item?.subRow?.isopen ? (
              <span
                onClick={() => {
                  handleMini(index);
                }}
                className="text-center ml-1 mr-2"
              >
                <i className="fa fa-minus py-1 " aria-hidden="true"></i>
              </span>
            ) : (
              <span
                onClick={() => handleSearch(item?.GroupBy, index, item)}
                className="text-center ml-1 mr-2"
              >
                <i className="fa fa-plus py-1 " aria-hidden="true"></i>
              </span>
            )}
            <span onDoubleClick={() => handleOpenExcel(item, index)}>
              {item?.COAName}
            </span>
          </span>
        ),
        OpeningBalance: (
          <AlignTableText value={item?.Opening} isAmount={true} isbold={true} />
        ),
        TotalDebit: (
          <AlignTableText
            value={item?.TotalDebit}
            isAmount={true}
            isbold={true}
          />
        ),
        TotalCredit: (
          <AlignTableText
            value={item?.TotalCredit}
            isAmount={true}
            isbold={true}
          />
        ),
        Closing: (
          <AlignTableText value={item?.Closing} isAmount={true} isbold={true} />
        ),
        // TotalDebit: item?.TotalDebit || "0.00",
        // TotalCredit: item?.TotalCredit || "0.00",
        // Closing: item?.Closing || "0.00",
        subRow: handleSubRow(item?.subRow, item?.GroupBy),
      };
    });
  };
  const getRowClass = (val, index) => {
    console.log("asdasdasdasdasdasd", val, index);
    if (val?.subRow?.isopen) {
      return "color-indicator-1-bg";
    } else if (val?.Sr === "") {
      return "color-indicator-2-bg";
    } else {
      return "";
    }
  };

  const expandingAll = async () => {
    tableData.forEach((item, index) => {
      setTimeout(() => {
        handleSearch(item?.GroupBy, index, item, true);
      }, [500 * index]);
    });
  };
  return (
    <>
      <MultiSelectComp
        className="col-xl-2 col-md-4 col-sm-6 col-12"
        name="BranchCentre"
        id="BranchCentre"
        placeholder={t("Branch Centre")}
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
        removeIsClearable={true}
        handleChange={(name, value) =>
          setPayloadData((val) => ({ ...val, [name]: value }))
        }
        dynamicOptions={filterByTypes(
          reportControlList,
          [1],
          ["TypeID"],
          "TextField",
          "ValueField"
        )}
        searchable={true}
        respclass="col-xl-2 col-md-4 col-sm-6 col-12"
      /> */}
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
      <CustomDateRangePicker
        name="dateRange"
        id="dateRange"
        labelKey="dateRange"
        label={t("Select Date Range")}
        startDate={payloadData?.fromDate || null}
        endDate={payloadData?.toDate || null}
        onChange={handleDateRangeChange}
        respClass="col-xl-2 col-md-4 col-sm-6 col-12"
      />
      <div className="col-xl-4 col-md-4 col-sm-6 col-12">
        <AutoComplete
          value={
            payloadData?.COG?.label ? payloadData?.COG?.label : payloadData?.COG
          }
          suggestions={items}
          completeMethod={(e) => {
            search(e, "COG");
          }}
          onChange={(e) => setPayloadData({ ...payloadData, COG: e.value })}
          className="w-100"
          onSelect={(e) => validateInvestigation(e, "COG")}
          id="COG"
          itemTemplate={itemTemplate}
        />
        <label
          className="label lable truncate ml-3 p-1"
        // style={{ fontSize: "5px !important" }}
        >
          {t("Chart Of Group")}
        </label>
      </div>

      <div className="col-xl-4 col-md-4 col-sm-6 col-12  mb-2">
        <button
          className="btn btn-sm btn-primary px-3 mr-2"
          onClick={() => {
            handleSearch(3);
          }}
          type="button"
        >
          {t("Search")}
        </button>
      </div>
      {tableData.length > 0 && (
        <div id="printSection" className="w-100">
          <Heading
            title={t("Trial Balance Report")}
            secondTitle={
              <>
                <button
                  className="btn btn-sm btn-primary table-btn px-3"
                  type="button"
                  onClick={expandingAll}
                >
                  {t("Expend All")}
                </button>
                {/* <span onClick={handleExportPDF} className="no-print">
                  <PDFIconSVG />
                </span>

                <span
                  onClick={() => handleExportExcel(exportData)}
                  className="no-print"
                >
                  <ExcelIconSVG />{" "}
                </span> */}
              </>
            }
          />

          <NestedRowTable
            thead={thead}
            tbody={[
              ...handleTableFormat(tableData),
              {
                Sr: "",
                COGCode: "",
                ChartOfGroup: <AlignTableText value={"Total:"} isbold={true} />,
                OpeningBalance: (
                  <AlignTableText
                    value={tableData?.reduce(
                      (a, b) => a + Number(b?.Opening || 0),
                      0
                    )}
                    isAmount={true}
                    isbold={true}
                  />
                ),
                TotalDebit: (
                  <AlignTableText
                    value={tableData?.reduce(
                      (a, b) => a + Number(b?.TotalDebit || 0),
                      0
                    )}
                    isAmount={true}
                    isbold={true}
                  />
                ),
                TotalCredit: (
                  <AlignTableText
                    value={tableData?.reduce(
                      (a, b) => a + Number(b?.TotalCredit || 0),
                      0
                    )}
                    isAmount={true}
                    isbold={true}
                  />
                ),
                Closing: (
                  <AlignTableText
                    value={tableData?.reduce(
                      (a, b) => a + Number(b?.Closing || 0),
                      0
                    )}
                    isAmount={true}
                    isbold={true}
                  />
                ),
              },
            ]}
            isRemoveSecondHeader={true}
            // tableHeight={tableHeight}
            getRowClass={getRowClass}
            removeHeaderSpace={true}
          />
        </div>
      )}
      {ledgerData?.length > 0 && (
        <FinanceModal
          modalWidth="90vw"
          visible={ledgerData.length > 0}
          setVisible={() => {
            setLedgerData([]);
          }}
          Header="Print Label"
          footer={<></>}
        >
          <LedgerReportTable
            bodyData={ledgerData}
            values={values}
            payloadData={payloadData}
          />
        </FinanceModal>
      )}
    </>
  );
};

export default TrialBalanceReport;
