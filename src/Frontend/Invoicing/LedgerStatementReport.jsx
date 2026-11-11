import React, { useMemo, useState, useEffect } from "react";
import DatePicker from "../../components/formComponent/DatePicker";
import { useTranslation } from "react-i18next";
import { autocompleteOnBlur, ExportToExcel } from "../../utils/helpers";
import Accordion from "@app/components/UI/Accordion";
import { GetRateTypeByGlobalCentre } from "../../utils/NetworkApi/commonApi";
import { axiosInstance } from "../../utils/axiosInstance";
import { apiUrls } from "../../utils/apiUrls";
import MultiSelectComp from "../../components/formComponent/MultiSelectComp";
import ReactSelect from "../../components/formComponent/ReactSelect";
import AutoComplete from "../../components/formComponent/AutoComplete";
import Input from "../../components/formComponent/Input";
import Tables from "../../components/UI/customTable";
import NoRecordFound from "../../components/formComponent/NoRecordFound";
import { toast } from "react-toastify";
import { CustomButton, SearchButton } from "../../components/UI/CustomButton";
import { getSearchController } from "../../utils/NetworkApi/commonApi";
import Pagination from "../../Pagination/Pagination";
import PageControlGear from "../../components/PageGearModel/PageControlGear";
import './LedgerStatementReport.css';
const LedgerStatementReport = () => {
  const { t } = useTranslation();
  const PAGE_ID = "790";
  const [searchData, setSearchData] = useState({
    BusinessUnitId: [],
    RateTypeID: 0,
    RateTypeLabel: "",
    LedgerMode: "Both",
    DateType: "0",
    FromDate: new Date(),
    ToDate: new Date(),
    ReportType: "1",
  });

  // ── Dropdown Data ───────────────────────────────────────────────────────
  const [businessUnits, setBusinessUnits] = useState([]);
  const [client, setClient] = useState([]);
  const [rateTypeSuggestions, setRateTypeSuggestions] = useState([]);
  const [rateTypeIndex, setRateTypeIndex] = useState(0);
  const [selectRateType, setSelectRateType] = useState(false);

  // ── Dynamic Controller ──────────────────────────────────────────────────
  const [controllerDynamicList, setControllerDynamicList] = useState([]);
  const [filterColumns, setFilterColumns] = useState([]);
  const [headWithApiFields, setHeadWithApiFields] = useState({
    "#": "srNo",
    "Business Unit": "BusinessUnit",
    "Sales Manager": "SalesManager",
    "Collection Boy Name": "FeildBoy",
    "Rate Type Code": "RateTypeCode",
    "Rate Type Name": "RateTypeName",
    "Opening Amount": "OpeningAmount",
    "Current Billing": "CurrentBillingAmount",
    "Current Received Amount": "CurrentReceivedAmount",
    "Closing Balance": "ClosingBalance",
    "Credit Limit": "CreditLimit",
  });

  // ── Table / UI State ────────────────────────────────────────────────────
  const [report, setReport] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);

  // ── Active filter: null = all, "overdue" = overdue only ─────────────────
  const [activeFilter, setActiveFilter] = useState(null);
 
  console.log("searchData", filteredData);

  const dateTypeOptions = [
    { label: "Range", value: "0" },
    { label: "On Date", value: "1" },
  ];

  // ── Pagination ──────────────────────────────────────────────────────────
  const currentTableData = useMemo(() => {
    const first = (currentPage - 1) * pageSize;
    return filteredData.slice(first, first + pageSize);
  }, [currentPage, pageSize, filteredData]);

  // ── Totals (always from full report) ───────────────────────────────────
  const totals = useMemo(() => {
    const initial = {
      opening: 0,
      currentBilling: 0,
      currentReceived: 0,
      closing: 0,
      creditLimit: 0,
    };
    if (!Array.isArray(report) || report.length === 0) return initial;
    return report.reduce(
      (acc, r) => {
        acc.opening += Number(r?.OpeningAmount ?? 0);
        acc.currentBilling += Number(r?.CurrentBillingAmount ?? 0);
        acc.currentReceived += Number(r?.CurrentReceivedAmount ?? 0);
        acc.closing += Number(r?.ClosingBalance ?? 0);
        acc.creditLimit += Number(r?.CreditLimit ?? 0);
        return acc;
      },
      { ...initial },
    );
  }, [report]);

  const overdueCount = useMemo(
    () =>
      report.filter(
        (r) => Number(r?.ClosingBalance ?? 0) - Number(r?.CreditLimit ?? 0) > 0,
      ).length,
    [report],
  );

  const visibleTableColumns = useMemo(() => {
    const dynamicColumns = filterColumns?.filter(
      (item) => item?.IsShow == 1 && item?.TypeId == 2,
    );
    if (Array.isArray(dynamicColumns) && dynamicColumns.length > 0) {
      return dynamicColumns;
    }
    return [
      { ControlDisplayID: "S.No", ControlDisplayName: "S.No" },
      { ControlDisplayID: "Business Unit", ControlDisplayName: "Business Unit" },
      { ControlDisplayID: "Sales Manager", ControlDisplayName: "Sales Manager" },
      {
        ControlDisplayID: "Collection Boy Name",
        ControlDisplayName: "Collection Boy Name",
      },
      { ControlDisplayID: "Rate Type Code", ControlDisplayName: "Rate Type Code" },
      { ControlDisplayID: "Rate Type Name", ControlDisplayName: "Rate Type Name" },
      { ControlDisplayID: "Opening Amount", ControlDisplayName: "Opening Amount" },
      { ControlDisplayID: "Current Billing", ControlDisplayName: "Current Billing" },
      {
        ControlDisplayID: "Current Received Amount",
        ControlDisplayName: "Current Received Amount",
      },
      { ControlDisplayID: "Closing Balance", ControlDisplayName: "Closing Balance" },
      { ControlDisplayID: "Credit Limit", ControlDisplayName: "Credit Limit" },
    ];
  }, [filterColumns]);

  // ── Filter helper ───────────────────────────────────────────────────────
  const applySearchFilter = (text, source) => {
    if (!text.trim()) {
      setFilteredData(source);
      return;
    }
    const val = text.toLowerCase();
    setFilteredData(
      source.filter((item) =>
        [
          "BusinessUnit",
          "SalesManager",
          "FeildBoy",
          "RateTypeCode",
          "RateTypeName",
          "OpeningAmount",
          "CurrentBillingAmount",
          "CurrentReceivedAmount",
          "ClosingBalance",
          "CreditLimit",
        ].some((k) =>
          String(item[k] || "")
            .toLowerCase()
            .includes(val),
        ),
      ),
    );
  };

  const handleChangeSearch = (e) => {
    const val = e.target.value;
    setSearchText(val);
    const base =
      activeFilter === "overdue"
        ? report.filter(
            (r) =>
              Number(r?.ClosingBalance ?? 0) - Number(r?.CreditLimit ?? 0) > 0,
          )
        : report;
    applySearchFilter(val, base);
    setCurrentPage(1);
  };

  const filterOverdue = () => {
    if (activeFilter === "overdue") {
      setActiveFilter(null);
      applySearchFilter(searchText, report);
    } else {
      setActiveFilter("overdue");
      const base = report.filter(
        (r) => Number(r?.ClosingBalance ?? 0) - Number(r?.CreditLimit ?? 0) > 0,
      );
      applySearchFilter(searchText, base);
    }
    setCurrentPage(1);
  };

  // ── Dynamic Controller ──────────────────────────────────────────────────
  const controllerDynamic = async () => {
    try {
      const { controllersData } = await getSearchController(PAGE_ID);
      setControllerDynamicList(controllersData);
      if (Array.isArray(controllersData)) {
        setFilterColumns(controllersData);
        const dynamicMappings = { ...headWithApiFields };
        controllersData.forEach((col) => {
          if (!dynamicMappings[col.ControlDisplayID]) {
            dynamicMappings[col.ControlDisplayID] =
              col.ApiFieldName || col.ControlDisplayID;
          }
        });
        setHeadWithApiFields(dynamicMappings);
      }
    } catch (err) {
      console.error("controllerDynamic error:", err);
    }
  };

  const isHideController = (cntrId = "") => {
    if (!controllerDynamicList?.length) return true;
    const found = controllerDynamicList?.find(
      (x) => x?.ControlDisplayID === cntrId,
    );
    if (found?.ControlDisplayID) return !!found?.IsShow;
    return true;
  };

  // ── Fetch dropdowns ─────────────────────────────────────────────────────
  useEffect(() => {
    const fetchBusinessUnits = async () => {
      try {
        const res = await axiosInstance.get(apiUrls.getGlobalCentres);
        const mapped = (res?.data?.message || []).map((r) => ({
          value: String(r?.CentreID),
          label: r?.Centre,
        }));
        if (mapped?.length === 1)
          setSearchData((prev) => ({
            ...prev,
            BusinessUnitId: [mapped[0]?.value],
          }));
        setBusinessUnits(mapped);
      } catch (err) {
        console.error("Failed to load centers", err);
      }
    };
    fetchBusinessUnits();
    GetRateTypeByGlobalCentre(setClient);
    controllerDynamic();
  }, []);

  // ── Date handlers ───────────────────────────────────────────────────────
  const dateSelect = (value, name) => {
    if (name === "FromDate") {
      const updateDate =
        new Date(searchData?.ToDate) - value < 0 ? value : searchData.ToDate;
      setSearchData((prev) => ({ ...prev, [name]: value, ToDate: updateDate }));
    } else {
      setSearchData((prev) => ({ ...prev, [name]: value }));
    }
  };

  // ── Form handlers ───────────────────────────────────────────────────────
  const handleSelectMultiChange = (name, value) => {
    setSearchData((prev) => ({ ...prev, [name]: value }));
  };

  const handleReactSelect = (name, value) => {
    setSearchData((prev) => ({ ...prev, [name]: value?.value }));
  };

  const handleRateTypeChange = (e) => {
    const value = e.target.value;
    setSearchData((prev) => ({ ...prev, RateTypeLabel: value }));
    if (value.trim() === "") {
      setSelectRateType(false);
      setRateTypeSuggestions([]);
      setSearchData((prev) => ({ ...prev, RateTypeID: 0, RateTypeLabel: "" }));
    } else {
      const filtered = client.filter((item) =>
        item.label.toLowerCase().includes(value.toLowerCase()),
      );
      setRateTypeSuggestions(filtered);
      setSelectRateType(true);
    }
  };

  const handleRateTypeKeyDown = (e) => {
    if (rateTypeSuggestions.length === 0) return;
    if (e.which === 38)
      setRateTypeIndex((prev) =>
        prev > 0 ? prev - 1 : rateTypeSuggestions.length - 1,
      );
    else if (e.which === 40)
      setRateTypeIndex((prev) =>
        prev === rateTypeSuggestions.length - 1 ? 0 : prev + 1,
      );
    else if (e.which === 13) {
      handleRateTypeSelect(rateTypeSuggestions[rateTypeIndex]);
      setRateTypeIndex(0);
    }
  };

  console.log({filteredData})

  const handleRateTypeSelect = (data) => {
    setSearchData((prev) => ({
      ...prev,
      RateTypeLabel: data?.label,
      RateTypeID: data?.value,
    }));
    setSelectRateType(false);
    setRateTypeSuggestions([]);
  };

  // ── Search ──────────────────────────────────────────────────────────────
  const handleReport = async () => {
    setLoading(true);
    setActiveFilter(null);
    setSearchText("");
    try {
      const res = await axiosInstance.post(apiUrls.LedgerStatementReport, {
        BusinessUnitIds: searchData.BusinessUnitId,
        RateTypeID: searchData.RateTypeID,
        LedgerMode: searchData.LedgerMode,
        DateType: searchData.DateType,
        FromDate: searchData.FromDate,
        ToDate: searchData.ToDate,
        ReportType: searchData.ReportType,
      });
      if (res?.data?.success) {
        setReport(res.data.message);
        setFilteredData(res.data.message);
        setCurrentPage(1);
      } else {
        setReport([]);
        setFilteredData([]);
        toast.error("No records found.");
      }
    } catch (err) {
      console.error("Search failed", err);
      setReport([]);
      setFilteredData([]);
    } finally {
      setLoading(false);
    }
  };

  // ── Export ──────────────────────────────────────────────────────────────
  const handleExportReport = () => {
    if (!report?.length) return;
    const formattedDate = new Date(searchData.ToDate)
      .toISOString()
      .split("T")[0];
    ExportToExcel(
      report,
      `LedgerStatement${
        searchData.ReportType === "0" ? "Summary" : "Detail"
      }Report-${formattedDate}.xlsx`,
    );
    toast.success("Report downloaded.");
  };

  // ── Render ──────────────────────────────────────────────────────────────
  return (
    <>
      {/* ── Search Filters Accordion ── */}
      <Accordion
        name={t("Ledger Statement Report")}
        isBreadcrumb={true}
        defaultValue={true}
        linkTo="/ledger-statement-report"
        linkTitle={
          <div className="link-title-container mt-2 d-none d-md-flex">
            <label>
              {t("Total Count")} :
              <span className="text-danger">{report?.length ?? 0}</span>
            </label>

            <span className="separator">|</span>

            <label>
              {t("Opening Amount")} :
              <span className="text-danger">{totals.opening}</span>
            </label>

            <span className="separator">|</span>

            <label>
              {t("Current Billing")} :
              <span className="text-danger">{totals.currentBilling}</span>
            </label>

            <span className="separator">|</span>

            <label>
              {t("Current Received Amount")} :
              <span className="text-danger">{totals.currentReceived}</span>
            </label>

            <span className="separator">|</span>

            <label>
              {t("Closing Balance")} :
              <span className="text-danger">{totals.closing}</span>
            </label>
          </div>
        }
        seconTitle={
          <div style={{ marginLeft: "auto" }}>
            <PageControlGear pageId={PAGE_ID} />
          </div>
        }
      >
        <div className="row px-2 mt-2 mb-1">
          {/* Dynamic inputs from page master */}
          {controllerDynamicList
            ?.filter((item) => item?.TypeId === 1 && item?.IsShow === 1)
            ?.map((item, index) => {
              if (
                item?.ControlDisplayID === "BusinessUnitId" &&
                isHideController("BusinessUnitId")
              ) {
                return (
                  <MultiSelectComp
                    key={index}
                    className="col-sm-2 required-fields"
                    options={businessUnits}
                    name="BusinessUnitId"
                    placeholder=" "
                    label="Business Unit"
                    id="BusinessUnitId"
                    value={searchData?.BusinessUnitId}
                    onChange={handleSelectMultiChange}
                  />
                );
              }

              if (
                item?.ControlDisplayID === "RateTypeID" &&
                isHideController("RateTypeID")
              ) {
                return (
                  <div className="col-sm-2" key={index}>
                    <Input
                      type="text"
                      name="RateTypeID"
                      lable="Rate Type"
                      value={searchData.RateTypeLabel || ""}
                      placeholder=" "
                      onChange={handleRateTypeChange}
                      onKeyDown={handleRateTypeKeyDown}
                      onBlur={(e) => {
                        const snapshot = [...rateTypeSuggestions];
                        autocompleteOnBlur(setRateTypeSuggestions);
                        setTimeout(() => {
                          setSearchData((prev) => {
                            const typed = (e.target.value || "").trim();
                            if (!typed)
                              return {
                                ...prev,
                                RateTypeID: 0,
                                RateTypeLabel: "",
                              };
                            if (
                              prev.RateTypeID &&
                              prev.RateTypeLabel &&
                              prev.RateTypeLabel.toLowerCase() ===
                                typed.toLowerCase()
                            )
                              return prev;
                            const match = snapshot.find(
                              (ele) =>
                                ele.label.toLowerCase() === typed.toLowerCase(),
                            );
                            if (match)
                              return {
                                ...prev,
                                RateTypeLabel: match.label,
                                RateTypeID: Number(match.value),
                              };
                            const clientMatch = client.find(
                              (ele) =>
                                ele.label.toLowerCase() === typed.toLowerCase(),
                            );
                            if (clientMatch)
                              return {
                                ...prev,
                                RateTypeLabel: clientMatch.label,
                                RateTypeID: Number(clientMatch.value),
                              };
                            return { ...prev, RateTypeID: 0 };
                          });
                        }, 200);
                      }}
                    />
                    {selectRateType && rateTypeSuggestions.length > 0 && (
                      <AutoComplete
                        selects={selectRateType}
                        test={rateTypeSuggestions.map((item) => ({
                          TestName: item.label,
                        }))}
                        handleListSearch={(selected) =>
                          handleRateTypeSelect(
                            rateTypeSuggestions.find(
                              (item) => item.label === selected.TestName,
                            ),
                          )
                        }
                        indexMatch={rateTypeIndex}
                      />
                    )}
                  </div>
                );
              }

              if (
                item?.ControlDisplayID === "DateType" &&
                isHideController("DateType")
              ) {
                return (
                  <div className="col-sm-2" key={index}>
                    <ReactSelect
                      dynamicOptions={dateTypeOptions}
                      name="DateType"
                      lable={t("Date Type")}
                      id="DateType"
                      removeIsClearable={true}
                      placeholderName={t("Date Type")}
                      value={searchData.DateType}
                      onChange={handleReactSelect}
                      isDisabled={loading || dateTypeOptions.length === 0}
                    />
                  </div>
                );
              }

              if (
                item?.ControlDisplayID === "FromDate" &&
                isHideController("FromDate") &&
                searchData.DateType === "0"
              ) {
                return (
                  <div className="col-sm-2" key={index}>
                    <DatePicker
                      className="custom-calendar"
                      placeholder=" "
                      id="FromDate"
                      lable="FromDate"
                      name="FromDate"
                      value={
                        searchData.FromDate
                          ? new Date(searchData.FromDate)
                          : null
                      }
                      maxDate={new Date()}
                      onChange={dateSelect}
                    />
                  </div>
                );
              }

              if (
                item?.ControlDisplayID === "ToDate" &&
                isHideController("ToDate")
              ) {
                return (
                  <div className="col-sm-2" key={index}>
                    <DatePicker
                      className="custom-calendar"
                      placeholder=" "
                      id="ToDate"
                      lable={
                        searchData.DateType === "1"
                          ? t("On Date")
                          : t("To Date")
                      }
                      name="ToDate"
                      value={
                        searchData.ToDate ? new Date(searchData.ToDate) : null
                      }
                      minDate={
                        searchData.DateType === "0"
                          ? new Date(searchData.FromDate)
                          : null
                      }
                      maxDate={new Date()}
                      onChange={dateSelect}
                    />
                  </div>
                );
              }

              return null;
            })}

          {/* Buttons */}
          <div
            className="col-sm-2 d-flex align-items-center"
            style={{ gap: "8px ", marginBottom: "10px" }}
          >
            <SearchButton
              text={"Search"}
              onClick={handleReport}
              disabled={loading}
            />
            {report?.length > 0 && (
              <CustomButton
                icon={"excel"}
                text={"Export"}
                onClick={handleExportReport}
              />
            )}
          </div>
        </div>
      </Accordion>

      {/* ── Search Data Accordion ── */}
      <Accordion
        title={t("Search Data")}
        defaultValue={true}
        notOpen={true}
        linkTo="#"
        linkTitle={
          <div
            className="link-title-container d-none d-md-flex align-items-center flex-wrap"
            style={{ gap: "8px" }}
          >
            {/* Overdue Indicator inside heading */}
            <span
              onClick={(e) => {
                e.stopPropagation();
                filterOverdue();
              }}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "4px",
                cursor: "pointer",
                padding: "2px 8px",
                borderRadius: "4px",
                backgroundColor:
                  activeFilter === "overdue" ? "#f1a098" : "#d7d4d4",
                fontSize: "12px",
              }}
            >
              <span
                style={{
                  width: "10px",
                  height: "10px",
                  borderRadius: "50%",
                  backgroundColor: "#f1a098",
                  display: "inline-block",
                }}
              />
              {t("Over Due")} ({overdueCount})
            </span>

            {/* Search Text Box */}
            <Input
              type="text"
              placeholder="Search Ledger Statement Details..."
              value={searchText}
              onClick={(e) => e.stopPropagation()}
              onChange={handleChangeSearch}
              className="mt-2"
            />
          </div>
        }
      >
        {loading ? (
          <div className="text-center py-4">
            <div className="text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        ) : filteredData?.length > 0 ? (
          <>
            <Tables className="table table-sm mb-0 p-2">
              <thead>
                <tr>
                  {visibleTableColumns.map((header, idx) => (
                    <th key={idx}>
                      {t(header.ControlDisplayName || header.ControlDisplayID)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {currentTableData?.map((r, index) => {
                  const actualIndex = (currentPage - 1) * pageSize + index;
                  const closing = Number(r?.ClosingBalance ?? 0);
                  const credit = Number(r?.CreditLimit ?? 0);
                  const overLimit = closing - credit > 0;

                  return (
                    <tr
                      key={actualIndex}
                      style={{
                        backgroundColor: overLimit ? "#f1a098" : null,
                      }}
                    >
                      {visibleTableColumns.map((col, colIndex) => {
                        if (col.ControlDisplayID === "S.No") {
                          return (
                            <td key={colIndex} data-title="S.No">
                              {actualIndex + 1}
                            </td>
                          );
                        }

                        const apiField =
                          headWithApiFields[col.ControlDisplayID] ||
                          col.ApiFieldName ||
                          col.ControlDisplayID;

                        return (
                          <td
                            key={colIndex}
                            data-title={t(col.ControlDisplayName || col.ControlDisplayID)}
                          >
                            {r?.[apiField] ?? ""}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </Tables>

            {/* ── Pagination ── */}
            {filteredData.length > 25 && (
              <div className="d-flex flex-wrap justify-content-end align-items-end gap-2 mt-3">
                <div style={{ minWidth: "150px" }}>
                  <ReactSelect
                    value={pageSize}
                    dynamicOptions={[
                      { label: "25", value: 25 },
                      { label: "50", value: 50 },
                      { label: "75", value: 75 },
                      { label: "100", value: 100 },
                    ]}
                    name={"pageSize"}
                    removeIsClearable={true}
                    onChange={(name, value) => {
                      setPageSize(value?.value);
                      setCurrentPage(1);
                    }}
                  />
                </div>
                <Pagination
                  className="pagination-bar"
                  currentPage={currentPage}
                  totalCount={filteredData.length}
                  pageSize={pageSize}
                  onPageChange={(page) => setCurrentPage(page)}
                />
              </div>
            )}
          </>
        ) : (
          <NoRecordFound />
        )}
      </Accordion>
    </>
  );
};

export default LedgerStatementReport;
