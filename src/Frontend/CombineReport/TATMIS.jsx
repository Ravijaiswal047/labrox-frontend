import React, { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { getAccessCentresReports, } from "../../utils/NetworkApi/commonApi";
import Accordion from "../../components/UI/Accordion";
import MultiSelectComp from "../../components/formComponent/MultiSelectComp";
import Input from "../../components/formComponent/Input";
import { SelectBox } from "../../components/formComponent/SelectBox";
import DatePicker from "../../components/formComponent/DatePicker";
import { CustomButton } from "../../components/UI/CustomButton";
import { toast } from "react-toastify";
import Tables from "../../components/UI/customTable";
import NoRecordFound from "../../components/formComponent/NoRecordFound";
import { Dialog } from "primereact/dialog";
import { useLocalStorage } from "../../utils/hooks/useLocalStorage";
import * as XLSX from "xlsx";
import { SearchBy } from "../../utils/Constants";
import { axiosInstance, axiosReport } from "../../utils/axiosInstance";
import Pagination from "../../Pagination/Pagination";
import ReactSelect from "../../components/formComponent/ReactSelect";
import "./TATMIS.css";

const DEFAULT_PAGE_SIZE = 50;

const TATMIS = () => {
    const { t } = useTranslation();
    const theme = useLocalStorage("theme", "get");

    const [CentreData, setCentreData] = useState([]);
      const [RateTypeData, setRateTypeData] = useState([]);
      const [rateTypeLoading, setRateTypeLoading] = useState(false);
    const [tableData, setTableData] = useState([]);
    const [tableSearchText, setTableSearchText] = useState("");
    const [loadingSearch, setLoadingSearch] = useState(false);
    const [excelLoading, setExcelLoading] = useState(false);
    const [saveLoading, setSaveLoading] = useState(false);
    const [detailsExcelLoading, setDetailsExcelLoading] = useState(false);
    const [detailsPdfLoading, setDetailsPdfLoading] = useState(false);

    // ── Pagination State ──
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);

    // Centre Summary Dialog
    const [showCentreSummary, setShowCentreSummary] = useState(false);
    const [centreSummaryData, setCentreSummaryData] = useState([]);
    const [centreSummaryLoading, setCentreSummaryLoading] = useState(false);
    const [centreSummaryButtonLoading, setCentreSummaryButtonLoading] =
        useState(false);
    const [centreSummaryExcelLoading, setCentreSummaryExcelLoading] =
        useState(false);

    // Department Summary Dialog
    const [showDeptSummary, setShowDeptSummary] = useState(false);
    const [deptSummaryData, setDeptSummaryData] = useState([]);
    const [deptSummaryLoading, setDeptSummaryLoading] = useState(false);
    const [deptSummaryButtonLoading, setDeptSummaryButtonLoading] =
        useState(false);
    const [deptSummaryExcelLoading, setDeptSummaryExcelLoading] = useState(false);


    
        const [moreFilter] = useState([
            { label: "Deartment Received", value: "DeartmentReceived" },
            { label: "Approved Sample", value: "ApprovedSample" },
        ]);









    const [formData, setFormData] = useState({
        Centre: [],
        SelectType: "BarcodeNo",
        ItemValue: "",
        ReportFormat: "ALL",
        FromDate: new Date(),
        ToDate: new Date(),
        moreFilter: []


    });
     const fetchRateTypes = async (id, showLoader = false) => {
    if (showLoader) setRateTypeLoading(true);
    try {
      const res = await axiosInstance.post("Centre/BindRateTypeDropdown", {
        centreID: id.toString() || 0,
        rateTypeID: 0,
        AllowEstimate: 0,
        CentreType: "",
        AllowHomeCollection: 0,
        AllowMembershipCard: 0,
        PageName: "YES",
      });
      const list = res?.data?.message.map((item) => ({
        label: item?.RateTypeName.replace(/\r?\n/g, " ").trim(),
        value: item?.RateTypeID,
      }));
      setRateTypeData([ ...list]);
      if (list?.length === 1) {
        setFormData((prev) => ({ ...prev, RateTypeID: list?.[0]?.value }));
      }
    } catch (err) {
      console.log(err);
      if (showLoader) setRateTypeLoading(false);
    } finally {
      if (showLoader) setRateTypeLoading(false);
    }
  };

    useEffect(() => {
        getAccessCentresReports(setCentreData);

    }, []);

    useEffect(() => {
        const centreId = formData.Centre?.map((c) => c.value ?? c).join(",") || 0;
        fetchRateTypes(centreId);
    }, [formData.Centre]);


    const handleSelectMultiChange = (name, value) => {
        setFormData({ ...formData, [name]: value });
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const dateSelect = (date, name) => {
        setFormData({ ...formData, [name]: date });
    };

    const buildPayload = () => ({
        barcodeNo: formData.SelectType === "BarcodeNo" ? formData.ItemValue : "",
        centreId: formData.Centre?.map((c) => c.value ?? c).join(",") ?? "",
        fromDate: formatDate(formData.FromDate),
        toDate: formatDate(formData.ToDate),
        reportFormat: formData.ReportFormat || "",
        moreFilter: formData.moreFilter?.map((c) => c.value ?? c) || [],
        RateTypeId: "",
        reportTypeId: "",
    });

    const buildSummaryPayload = () => ({
        barcodeNo: formData.SelectType === "BarcodeNo" ? formData.ItemValue : "",
        centreId:
            formData.Centre?.length > 0
                ? formData.Centre.map((c) => Number(c.value ?? c))
                : [],
        fromdate: formatDate(formData.FromDate),
        todate: formatDate(formData.ToDate),
        moreFilter: formData.moreFilter?.map((c) => c.value ?? c) || [],
        rateTypeIds: formData.RateType?.map((c) => c.value ?? c) || [],
    });

    const formatDate = (date) => {
        if (!date) return "";
        const d = new Date(date);
        const day = String(d.getDate()).padStart(2, "0");
        const month = String(d.getMonth() + 1).padStart(2, "0");
        const year = d.getFullYear();
        return `${year}-${month}-${day}`;
    };

    const handleSearch = () => {
        setLoadingSearch(true);
        setCurrentPage(1);
        axiosInstance
            .post("TATMIS/TATDelayDetails", buildPayload())
            .then((res) => {
                if (res?.data?.success) {
                    const data = res?.data?.message || [];
                    if (data.length === 0) {
                        setTableData([]);
                        toast.warning(t("No records found"));
                    } else {
                        setTableData(data);
                        toast.success(t("Data fetched successfully"));
                    }
                } else {
                    setTableData([]);
                    toast.error(res?.data?.message || t("No data found"));
                }
            })
            .catch(() => toast.error(t("Error fetching data")))
            .finally(() => setLoadingSearch(false));
    };

    const handleCentreSummary = () => {
        setCentreSummaryButtonLoading(true);
        setCentreSummaryLoading(true);
        setShowCentreSummary(true);
        axiosReport
            .post("TATMIS/GetSummary", buildSummaryPayload())
            .then((res) => {
                if (res?.data?.success) {
                    const data = res?.data?.message || [];
                    if (data.length === 0) {
                        setCentreSummaryData([]);
                        toast.warning(t("No records found"));
                    } else {
                        setCentreSummaryData(data);
                    }
                } else {
                    setCentreSummaryData([]);
                    toast.error(res?.data?.message || t("No data found"));
                }
            })
            .catch(() => toast.error(t("Error fetching centre summary")))
            .finally(() => {
                setCentreSummaryLoading(false);
                setCentreSummaryButtonLoading(false);
            });
    };

    const handleDeptSummary = () => {
        setDeptSummaryButtonLoading(true);
        setDeptSummaryLoading(true);
        setShowDeptSummary(true);
        axiosReport
            .post("TATMIS/GetDepartmentSummary", buildSummaryPayload())
            .then((res) => {
                if (res?.data?.success) {
                    const data = res?.data?.message || [];
                    if (data.length === 0) {
                        setDeptSummaryData([]);
                        toast.warning(t("No records found"));
                    } else {
                        setDeptSummaryData(data);
                    }
                } else {
                    setDeptSummaryData([]);
                    toast.error(res?.data?.message || t("No data found"));
                }
            })
            .catch(() => toast.error(t("Error fetching department summary")))
            .finally(() => {
                setDeptSummaryLoading(false);
                setDeptSummaryButtonLoading(false);
            });
    };

    const writeExcelWithMeta = (exportData, sheetName, fileName) => {
        const user = useLocalStorage("userData", "get") || {};
        const exportedBy = user?.Username || user?.FirstName || "";
        const exportedDateTime = new Date().toLocaleString("en-GB");
        const exportedFromCentre = user?.CenterName || "";
        const headers = Object.keys(exportData[0] || {});
        const aoa = [
            [`Exported By: ${exportedBy}    |    Exported DateTime: ${exportedDateTime}    |    Exported From Centre: ${exportedFromCentre}`],
            headers,
            ...exportData.map((row) => headers.map((h) => row[h])),
        ];
        const ws = XLSX.utils.aoa_to_sheet(aoa);
        if (headers.length > 1) {
            ws["!merges"] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: headers.length - 1 } }];
        }
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, sheetName);
        XLSX.writeFile(wb, fileName);
    };

    const handleExcel = () => {
        if (!tableData.length) {
            toast.warning(t("No data to export"));
            return;
        }
        setExcelLoading(true);
        try {
            const exportData = tableData.map((item, index) => {
                if (item?.isSummaryRow) {
                    return {
                        "S.No": "",
                        PatientName: "-",
                        CentreName: "-",
                        LabNo: "-",
                        TestName: "-",
                        TestCode: "-",
                        DepartmentName: "-",
                        SampleCollectionDate: "-",
                        SampleReceiveDate: "-",
                        Age: "-",
                        RegistrationTime: item?.registrationTime || "-",
                        ExpectedDeliveryDateProcessing: "-",
                        ActualTAT: item?.actualTAT || "-",
                        DelayedTAT: item?.delayedTAT || "-",
                    };
                }
                return {
                    "S.No": index + 1,
                    PatientName: item?.PatientName || "-",
                    CentreName: item?.CentreName || "-",
                    LabNo: item?.LedgerTransactionNo || "-",
                    TestName: item?.TestName || "-",
                    TestCode: item?.TestCode || "-",
                    DepartmentName: item?.DepartmentName || "-",
                    SampleCollectionDate: item?.SampleCollectionDate || "-",
                    SampleReceiveDate: item?.SampleReceiveDate || "-",
                    Age: item?.Age || "-",
                    RegistrationTime: item?.RegistrationTime || "-",
                    ExpectedDeliveryDateProcessing: item?.ExpectedDeliveryDateProcessing || "-",
                    ActualTAT: item?.ActualTAT || "-",
                    DelayedTAT: item?.DelayedTAT || "-",
                };
            });
            writeExcelWithMeta(
                exportData,
                "TAT MIS",
                `TATMIS_${new Date().toISOString().slice(0, 10)}.xlsx`,
            );
            toast.success(t("Excel downloaded successfully"));
        } catch (error) {
            toast.error(t("Error exporting excel"));
        } finally {
            setExcelLoading(false);
        }
    };

    const handleCentreSummaryExcel = () => {
        if (!centreSummaryData.length) {
            toast.warning(t("No data to export"));
            return;
        }
        setCentreSummaryExcelLoading(true);
        try {
            const exportData = centreSummaryData.map((item, index) => ({
                "Sr No.": index + 1,
                "Center Name": item?.centreName || "-",
                "Total Count": item?.totalCount ?? 0,
                "Total Delayed": item?.totalDelayed ?? 0,
                "Delay Per (%)": item?.delayPer ?? 0,
                "Total Pending": item?.totalPending ?? 0,
                "Pending Per (%)": item?.pendingPer ?? 0,
            }));
            writeExcelWithMeta(
                exportData,
                "Centre Summary",
                `TAT_CentreSummary_${new Date().getTime()}.xlsx`,
            );
            toast.success(t("Excel downloaded successfully"));
        } catch (error) {
            toast.error(t("Error exporting excel"));
        } finally {
            setCentreSummaryExcelLoading(false);
        }
    };

    const handleDeptSummaryExcel = () => {
        if (!deptSummaryData.length) {
            toast.warning(t("No data to export"));
            return;
        }
        setDeptSummaryExcelLoading(true);
        try {
            const exportData = deptSummaryData.map((item, index) => ({
                "Sr No.": index + 1,
                Department: item?.department || "-",
                "Total Count": item?.totalCount ?? 0,
                "Total Delayed": item?.totalDelayed ?? 0,
                "Delay Per (%)": item?.delayPer ?? 0,
                "Total Pending": item?.totalPending ?? 0,
                "Pending Per (%)": item?.pendingPer ?? 0,
            }));
            writeExcelWithMeta(
                exportData,
                "Dept Summary",
                `TAT_DeptSummary_${new Date().getTime()}.xlsx`,
            );
            toast.success(t("Excel downloaded successfully"));
        } catch (error) {
            toast.error(t("Error exporting excel"));
        } finally {
            setDeptSummaryExcelLoading(false);
        }
    };

    const downloadBlob = (blob, fileName) => {
        const fileUrl = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = fileUrl;
        link.setAttribute("download", fileName);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(fileUrl);
    };

    const handleDetailsExcel = async () => {
        setDetailsExcelLoading(true);
        try {
            const res = await axiosReport.post(
                "TATMIS/TAT_ExportTatReportToExcel",
                buildSummaryPayload(),
                { responseType: "blob" }
            );

            const contentType = res.headers["content-type"] || "";

            if (
                contentType.includes("application/json") ||
                contentType.includes("text/html") ||
                contentType.includes("text/plain")
            ) {
                toast.info(t("No Record Found"));
                return;
            }

            downloadBlob(new Blob([res.data]), `TATMIS_Details_${new Date().getTime()}.xlsx`);
            toast.success(t("Report generated successfully"));
        } catch (err) {
            if (err?.response?.data instanceof Blob) {
                try {
                    const text = await err.response.data.text();
                    const json = JSON.parse(text);
                    toast.error(json?.message || t("Error processing request"));
                } catch {
                    toast.error(t("Error processing request"));
                }
            } else {
                toast.error(err?.response?.data?.message || err?.message || t("Error processing request"));
            }
        } finally {
            setDetailsExcelLoading(false);
        }
    };

    const handleDetailsPdf = async () => {
        setDetailsPdfLoading(true);
        try {
            const res = await axiosReport.post(
                "TATMIS/TAT_ExportTatReportToPdf",
                buildSummaryPayload(),
                { responseType: "blob" }
            );

            const contentType = res.headers["content-type"] || "";

            if (
                contentType.includes("application/json") ||
                contentType.includes("text/html") ||
                contentType.includes("text/plain")
            ) {
                toast.info(t("No Record Found"));
                return;
            }

            downloadBlob(new Blob([res.data], { type: "application/pdf" }), `TATMIS_Details_${new Date().getTime()}.pdf`);
            toast.success(t("Report generated successfully"));
        } catch (err) {
            if (err?.response?.data instanceof Blob) {
                try {
                    const text = await err.response.data.text();
                    const json = JSON.parse(text);
                    toast.error(json?.message || t("Error processing request"));
                } catch {
                    toast.error(t("Error processing request"));
                }
            } else {
                toast.error(err?.response?.data?.message || err?.message || t("Error processing request"));
            }
        } finally {
            setDetailsPdfLoading(false);
        }
    };

    const handleSave = () => {
        const excludedRows = tableData.filter((item) => item?._excluded === true);
        if (!excludedRows.length) {
            toast.warning(t("No rows selected for exclusion"));
            return;
        }
        setSaveLoading(true);
        const testIds = excludedRows.map((item) => item?.TestID).filter(Boolean);
        axiosReport
            .post("TATMIS/SaveExclude", { testIds })
            .then((res) => {
                if (res?.data?.success) {
                    toast.success(res?.data?.message || t("Saved successfully"));
                    handleSearch();
                } else {
                    toast.error(res?.data?.message || t("Save failed"));
                }
            })
            .catch(() => toast.error(t("Error saving")))
            .finally(() => setSaveLoading(false));
    };

    const toggleExclude = (index) => {
        const updated = [...tableData];
        updated[index] = {
            ...updated[index],
            _excluded: !updated[index]._excluded,
        };
        setTableData(updated);
    };

    // ── Filtered data ──
    const filteredTableData = useMemo(() => {
        if (!tableSearchText) return tableData;
        const search = tableSearchText.toLowerCase();
        return tableData.filter(
            (item) =>
                item?.PName?.toLowerCase().includes(search) ||
                item?.LedgerTransactionNo?.toLowerCase().includes(search) ||
                item?.TestName?.toLowerCase().includes(search) ||
                item?.DispatchLab?.toLowerCase().includes(search) ||
                item?.CentreName?.toLowerCase().includes(search) ||
                item?.SampleTime?.toLowerCase().includes(search) ||
                item?.RegistrationTime?.toLowerCase().includes(search) ||
                item?.TestedDate?.toLowerCase().includes(search) ||
                item?.ApprovedDate?.toLowerCase().includes(search),
        );
    }, [tableData, tableSearchText]);

    // ── Stats on full filtered data ──
    const stats = useMemo(() => {
        const total = filteredTableData.length;
        const delayed = filteredTableData.filter(
            (item) => item?.DelayedTAT && item?.DelayedTAT !== "00:00",
        ).length;
        const percent = total > 0 ? ((delayed / total) * 100).toFixed(2) : "0.00";
        return { total, delayed, percent };
    }, [filteredTableData]);

    // ── Group by CentreName ──
    const groupedRows = useMemo(() => {
        const result = [];
        const seen = {};
        filteredTableData.forEach((item, originalIndex) => {
            const centre = item?.CentreName || "";
            if (centre && !seen[centre]) {
                seen[centre] = true;
                result.push({ type: "centre", name: centre });
            }
            result.push({ type: "row", data: item, originalIndex });
        });
        return result;
    }, [filteredTableData]);

    // ── Pagination ──
    const totalGroupedCount = groupedRows.length;

    const paginatedRows = useMemo(() => {
        const start = (currentPage - 1) * pageSize;
        return groupedRows.slice(start, start + pageSize);
    }, [groupedRows, currentPage, pageSize]);

    return (
        <>
            {/* ── Filter Accordion ── */}
            <Accordion
                title={t("TAT MIS")}
                defaultValue={true}
                className="tatmis-main-accordion"
                seconTitle={
                    <i
                        class="bi bi-file-earmark-excel-fill"
                        style={{
                            color: "green",
                            fontSize: "18px",
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                        }}
                        text={t("Excel")}
                        onClick={handleExcel}
                        loading={excelLoading}
                    ></i>
                }
            >
                <div className="row px-2 mt-2 p-1">
                    <div className="col-12 col-sm-6 col-md-2 my-1">
                        <div className="d-flex" style={{ gap: "2px" }}>
                            <div style={{ width: "40%" }}>
                                <SelectBox
                                    options={SearchBy}
                                    name="SelectType"
                                    selectedValue={formData.SelectType}
                                    onChange={handleInputChange}
                                    lable={t("Search By")}
                                />
                            </div>
                            <div style={{ width: "65%" }}>
                                <Input
                                    type="text"
                                    name="ItemValue"
                                    value={formData.ItemValue}
                                    onChange={handleInputChange}
                                    placeholder={t("Search Value")}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="col-12 col-sm-6 col-md-2 my-1">
                        <MultiSelectComp
                         
                            options={CentreData}
                            value={formData.Centre}
                            name="Centre"
                            onChange={handleSelectMultiChange}
                            label={t("Centre")}
                        />
                    </div>

                    <div className="col-12 col-sm-6 col-md-2 my-1">
                        <SelectBox
                            name="ReportFormat"
                            value={formData.ReportFormat}
                            onChange={handleInputChange}
                            lable={t("Report Type")}
                            options={[
                                { label: "ALL", value: "1" },
                                { label: "Summary", value: "3" },
                                { label: "Detailed", value: "2" },
                            ]}
                        />
                    </div>

                     <div className="col-12 col-sm-6 col-md-2 my-1">
                                            <MultiSelectComp
                                                name="moreFilter"
                                               label={t("More Filter")}
                                                options={moreFilter}
                                                value={formData.moreFilter}
                                                onChange={handleSelectMultiChange}
                                              
                                            />
                                        </div>
                                           <div className="col-12 col-sm-6 col-md-2 my-1">
                                            <MultiSelectComp
                                                name="RateType"
                                                label={t("Rate Type")}
                                                options={RateTypeData}
                                                value={formData.RateType}
                                                onChange={handleSelectMultiChange}
                                                
                                            />
                                        </div>

                    <div className="col-12 col-sm-6 col-md-2 my-1">
                        <DatePicker
                            name="FromDate"
                            value={formData.FromDate}
                            onChange={dateSelect}
                            maxDate={new Date()}
                            lable={t("From Date")}
                            className="custom-calendar"
                        />
                    </div>
                    <div className="col-12 col-sm-6 col-md-2 my-1">
                        <DatePicker
                            name="ToDate"
                            value={formData.ToDate}
                            onChange={dateSelect}
                            maxDate={new Date()}
                            minDate={formData.FromDate}
                            lable={t("To Date")}
                            className="custom-calendar"
                        />
                    </div>

                    <div className="col-12 col-sm-auto mb-4 d-flex align-items-end flex-wrap my-1" style={{ gap: "10px" }}>
                        <CustomButton
                            text={t("Centre Summary")}
                            onClick={handleCentreSummary}
                            loading={centreSummaryButtonLoading}
                        />
                          <CustomButton
                            text={t("Department Summary")}
                            onClick={handleDeptSummary}
                            loading={deptSummaryButtonLoading}
                        />
                        <CustomButton
                            text={t("Search")}
                            onClick={handleSearch}
                            loading={loadingSearch}
                            icon="search"
                        />
                        <CustomButton
                            text={t("Save Exclude")}
                            onClick={handleSave}
                            loading={saveLoading}
                            icon="save"
                        />
                         <CustomButton
                            text={t("Details Excel")}
                            onClick={handleDetailsExcel}
                            loading={detailsExcelLoading}
                            icon="excel"
                        />
                         <CustomButton
                            text={t("Details PDF")}
                            onClick={handleDetailsPdf}
                            loading={detailsPdfLoading}
                            icon="pdf"
                        />
                    </div>
                </div>
            </Accordion>

            {/* ── Search Data Accordion ── */}
            <Accordion
                title={t("Search Data")}
                defaultValue={true}
                notOpen={true}
                className="tatmis-search-accordion"
                linkTo="#"
                linkTitle={
                    <div
                        className="d-md-none"
                        onClick={(e) => e.stopPropagation()}
                        style={{ minWidth: "150px" }}
                    >
                        <Input
                            type="text"
                            placeholder={t("Search table...")}
                            value={tableSearchText}
                            onChange={(e) => {
                                setTableSearchText(e.target.value);
                                setCurrentPage(1);
                            }}
                        />
                    </div>
                }
                seconTitle={
                    <div
                        className="col-12 tatmis-sec-title"
                        style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            flexWrap: "wrap",
                            gap: "8px",
                            marginBottom: "10px",
                            marginTop: "6px",
                        }}
                    >
                        {/* Left: Abbreviation legend + Colour indicators */}
                        <div
                            style={{
                                display: "flex",
                                gap: "8px",
                                flexWrap: "wrap",
                                alignItems: "center",
                            }}
                        >
                            {/* Abbreviation legend */}
                            <div
                                className="tatmis-legend-text"
                                style={{
                                    fontSize: "10px",
                                    borderRadius: "5px",
                                    padding: "4px 10px",
                                    color: "#555",
                                    whiteSpace: "nowrap",
                                }}
                            >
                                <strong>STR</strong>: Sample Drawn to Reg time &nbsp;| &nbsp;
                                <strong>RTT</strong>: Reg to Tested time &nbsp;| &nbsp;
                                <strong>TTA</strong>: Tested to Approval time &nbsp;| &nbsp;
                                <strong>TAT</strong>: Reg to Approval time
                            </div>

                            {/* Colour indicators */}
                            <div
                                style={{
                                    display: "flex",
                                    gap: "10px",
                                    alignItems: "center",
                                    fontSize: "11px",
                                    color: "#555",
                                }}
                            >
                                <span
                                    style={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: "4px",
                                    }}
                                >
                                    <span
                                        style={{
                                            display: "inline-block",
                                            width: 13,
                                            height: 13,
                                            borderRadius: 3,
                                            background: "#fde8ea",
                                            border: "1px solid #f5c6cb",
                                        }}
                                    />
                                    {t("Delayed Row")}
                                </span>
                                <span
                                    style={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: "4px",
                                    }}
                                >
                                    <span
                                        style={{
                                            display: "inline-block",
                                            width: 13,
                                            height: 13,
                                            borderRadius: 3,
                                            background: "#dc3545",
                                        }}
                                    />
                                    {t("Delayed TAT Cell")}
                                </span>
                                <span
                                    style={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: "4px",
                                    }}
                                >
                                    <span
                                        style={{
                                            display: "inline-block",
                                            width: 13,
                                            height: 13,
                                            borderRadius: 3,
                                            background: "#fff3cd",
                                            border: "1px solid #ffc107",
                                        }}
                                    />
                                    {t("Centre Group")}
                                </span>
                            </div>
                        </div>

                        {/* Right: Stats pill + Search box */}
                        <div
                            style={{
                                display: "flex",
                                gap: "8px",
                                alignItems: "center",
                                flexWrap: "wrap",
                            }}
                        >
                            <div
                                style={{
                                    display: "flex",
                                    gap: "4px",
                                    alignItems: "center",
                                    padding: "4px 4px",
                                    fontSize: "12px",
                                    whiteSpace: "nowrap",
                                }}
                            >
                                <span>
                                    {t("Total")}:&nbsp;
                                    <strong style={{ color: "#0d6efd" }}>{stats.total}</strong>
                                </span>
                                <span style={{ color: "#ccc" }}>|</span>
                                <span>
                                    {t("Delayed")}:&nbsp;
                                    <strong
                                        style={{
                                            color: stats.delayed > 0 ? "#dc3545" : "#198754",
                                        }}
                                    >
                                        {stats.delayed}
                                    </strong>
                                </span>
                                <span style={{ color: "#ccc" }}>|</span>
                                <span
                                    style={{
                                        color: stats.delayed > 0 ? "#dc3545" : "#198754",
                                        fontWeight: "600",
                                    }}
                                >
                                    {stats.percent}%
                                </span>
                            </div>

                            <div className="d-none d-md-block" style={{ minWidth: "180px" }}>
                                <Input
                                    type="text"
                                    placeholder={t("Search table...")}
                                    value={tableSearchText}
                                    onChange={(e) => {
                                        setTableSearchText(e.target.value);
                                        setCurrentPage(1);
                                    }}
                                />
                            </div>
                        </div>
                    </div>
                }
            >
                {tableData.length > 0 ? (
                    <div className="row px-1">
                        {/* ── Table ── */}
                        <div className="col-12" style={{ overflowX: "auto" }}>
                            <Tables style={{ tableLayout: "fixed", width: "100%" }}>
                                <colgroup>
                                    <col style={{ width: "45px" }} />
                                    <col style={{ width: "150px" }} />
                                    <col style={{ width: "130px" }} />
                                    <col style={{ width: "150px" }} />
                                    <col style={{ width: "140px" }} />
                                    <col style={{ width: "55px" }} />
                                    <col style={{ width: "155px" }} />
                                    <col style={{ width: "55px" }} />
                                    <col style={{ width: "140px" }} />
                                    <col style={{ width: "55px" }} />
                                    <col style={{ width: "140px" }} />
                                    <col style={{ width: "75px" }} />
                                    <col style={{ width: "140px" }} />
                                    <col style={{ width: "75px" }} />
                                    <col style={{ width: "45px" }} />
                                </colgroup>
                                <thead>
                                    <tr>
                                        <th
                                            style={{ wordBreak: "break-word", whiteSpace: "normal" }}
                                        >
                                            {t("S.No")}
                                        </th>
                                        <th
                                            style={{ wordBreak: "break-word", whiteSpace: "normal" }}
                                        >
                                            {t("Patient/Test Name")}
                                        </th>
                                        <th
                                            style={{ wordBreak: "break-word", whiteSpace: "normal" }}
                                        >
                                            {t("Visit No")}
                                        </th>
                                        <th
                                            style={{ wordBreak: "break-word", whiteSpace: "normal" }}
                                        >
                                            {t("Dispatch Lab")}
                                        </th>
                                        <th
                                            style={{ wordBreak: "break-word", whiteSpace: "normal" }}
                                        >
                                            {t("Sample Drawn Date")}
                                        </th>
                                        <th
                                            style={{ wordBreak: "break-word", whiteSpace: "normal" }}
                                        >
                                            {t("STR")}
                                        </th>
                                        <th
                                            style={{ wordBreak: "break-word", whiteSpace: "normal" }}
                                        >
                                            {t("Registration Date")}
                                        </th>
                                        <th
                                            style={{ wordBreak: "break-word", whiteSpace: "normal" }}
                                        >
                                            {t("RTT")}
                                        </th>
                                        <th
                                            style={{ wordBreak: "break-word", whiteSpace: "normal" }}
                                        >
                                            {t("Tested Date")}
                                        </th>
                                        <th
                                            style={{ wordBreak: "break-word", whiteSpace: "normal" }}
                                        >
                                            {t("TTA")}
                                        </th>
                                        <th
                                            style={{ wordBreak: "break-word", whiteSpace: "normal" }}
                                        >
                                            {t("Approved Date")}
                                        </th>
                                        <th
                                            style={{ wordBreak: "break-word", whiteSpace: "normal" }}
                                        >
                                            {t("Actual TAT")}
                                        </th>
                                        <th
                                            style={{ wordBreak: "break-word", whiteSpace: "normal" }}
                                        >
                                            {t("Expected Delivery Date")}
                                        </th>
                                        <th
                                            style={{ wordBreak: "break-word", whiteSpace: "normal" }}
                                        >
                                            {t("Delayed TAT")}
                                        </th>
                                        <th
                                            style={{ wordBreak: "break-word", whiteSpace: "normal" }}
                                        >
                                            {t("Exclude")}
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {paginatedRows.length === 0 ? (
                                        <tr>
                                            <td colSpan="15" className="text-center text-danger">
                                                {t("No data found")}
                                            </td>
                                        </tr>
                                    ) : (
                                        paginatedRows.map((entry, idx) => {
                                            if (entry.type === "centre") {
                                                return (
                                                    <tr key={`centre-${idx}`}>
                                                        <td
                                                            colSpan="15"
                                                            style={{
                                                                backgroundColor: "#fff3cd",
                                                                color: "#856404",
                                                                fontWeight: "700",
                                                                fontSize: "13px",
                                                                padding: "6px 10px",
                                                                borderLeft: "4px solid #ffc107",
                                                                letterSpacing: "0.3px",
                                                            }}
                                                        >
                                                            🏥 {entry.name}
                                                        </td>
                                                    </tr>
                                                );
                                            }

                                            // ── Normal data row ──
                                            const item = entry.data;
                                            const rowIdx = entry.originalIndex;
                                            const isDelayed =
                                                item?.DelayedTAT && item?.DelayedTAT !== "00:00";

                                            return (
                                                <tr
                                                    key={`row-${idx}`}
                                                    style={{
                                                        backgroundColor: isDelayed ? "#fde8ea" : "inherit",
                                                    }}
                                                >
                                                    <td data-label={t("S.No")} data-title="S.No">{rowIdx + 1}</td>
                                                    <td
                                                        data-label={t("Patient Name")} 
                                                        data-title="Patient Name"
                                                        style={{
                                                            wordBreak: "break-word",
                                                            whiteSpace: "normal",
                                                        }}
                                                    >
                                                        <span className="fw-bold text-dark">
                                                            {item?.PName || "-"}
                                                        </span>
                                                        <br />
                                                        <span style={{ fontSize: "12px", color: "#555" }}>
                                                            {item?.TestName || "-"}
                                                        </span>
                                                    </td>
                                                    <td data-label={t("Visit No")} data-title="Visit No">
                                                        {item?.LedgerTransactionNo || "-"}
                                                    </td>
                                                    <td data-label={t("Dispatch Lab")} data-title="Dispatch Lab">
                                                        {item?.DispatchLab || "-"}
                                                    </td>
                                                    <td
                                                        data-label={t("Sample Drawn Date")}
                                                        data-title="Sample Drawn Date"
                                                        style={{
                                                            wordBreak: "break-word",
                                                            whiteSpace: "normal",
                                                        }}
                                                    >
                                                        {item?.SampleTime || "-"}
                                                    </td>
                                                    <td
                                                        data-label={t("STR")}
                                                        data-title="Sample Drawn to Reg time"
                                                    >
                                                        {item?.STR || "-"}
                                                    </td>
                                                    <td
                                                        data-label={t("Registration Date")}
                                                        data-title="Registration Date"
                                                        style={{
                                                            wordBreak: "break-word",
                                                            whiteSpace: "normal",
                                                        }}
                                                    >
                                                        {item?.RegistrationTime || "-"}
                                                    </td>
                                                    <td data-label={t("RTT")} data-title="Reg to Tested time">
                                                        {item?.RTT || "-"}
                                                    </td>
                                                    <td
                                                        data-label={t("Tested Date")}
                                                        data-title="Tested Date"
                                                        style={{
                                                            wordBreak: "break-word",
                                                            whiteSpace: "normal",
                                                        }}
                                                    >
                                                        {item?.TestedDate || "-"}
                                                    </td>
                                                    <td
                                                        data-label={t("TTA")}
                                                        data-title="Tested to Approval time"
                                                    >
                                                        {item?.TTA || "-"}
                                                    </td>
                                                    <td
                                                        data-label={t("Approved Date")}
                                                        data-title="Approved Date"
                                                        style={{
                                                            wordBreak: "break-word",
                                                            whiteSpace: "normal",
                                                        }}
                                                    >
                                                        {item?.ApprovedDate || "-"}
                                                    </td>
                                                    <td
                                                        data-label={t("Actual TAT")}
                                                        data-title="Reg to Approval Time"
                                                    >
                                                        {item?.ActualTAT || "-"}
                                                    </td>
                                                    <td
                                                        data-label={t("Expected Delivery Date")}
                                                        data-title="Expected Delivery Date"
                                                        style={{
                                                            wordBreak: "break-word",
                                                            whiteSpace: "normal",
                                                        }}
                                                    >
                                                        {item?.ExpectedDeliveryDateProcessing || "-"}
                                                    </td>
                                                    <td
                                                        data-label={t("Delayed TAT")}
                                                        data-title="Delayed TAT"
                                                        style={{
                                                            backgroundColor: isDelayed
                                                                ? "#dc3545"
                                                                : "inherit",
                                                            color: isDelayed ? "#fff" : "inherit",
                                                            fontWeight: "bold",
                                                        }}
                                                    >
                                                        {item?.DelayedTAT || "-"}
                                                    </td>
                                                    <td data-label={t("Exclude")} data-title="Exclude" className="text-center">
                                                        <input
                                                            type="checkbox"
                                                            checked={!!item?._excluded}
                                                            onChange={() => toggleExclude(rowIdx)}
                                                        />
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    )}
                                </tbody>
                            </Tables>
                        </div>

                        {/* ── Pagination — bilkul SampleCollection jaisi ── */}
                        {totalGroupedCount > 25 && (
                            <div className="d-flex flex-wrap justify-content-end align-items-end gap-2 mt-2">
                                <div style={{ minWidth: "150px" }}>
                                    <ReactSelect
                                        value={pageSize}
                                        dynamicOptions={[
                                            { label: "25", value: 25 },
                                            { label: "50", value: 50 },
                                            { label: "100", value: 100 },
                                            { label: "150", value: 150 },
                                        ]}
                                        name="pageSize"
                                        label={t("pageSize")}
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
                                    totalCount={totalGroupedCount}
                                    pageSize={pageSize}
                                    onPageChange={(page) => {
                                        setCurrentPage(page);
                                    }}
                                />
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="row px-1">
                        <div className="col-12">
                            <NoRecordFound />
                        </div>
                    </div>
                )}
            </Accordion>

            {/* ══════════════════════════════════════════
                CENTRE SUMMARY DIALOG
            ══════════════════════════════════════════ */}
            {showCentreSummary && (
                <Dialog
                    header={t("TAT Delay Centre Summary")}
                    visible={showCentreSummary}
                    onHide={() => setShowCentreSummary(false)}
                    style={{ width: "70vw" }}
                    className={theme}
                >
                    <div className="card">
                        <div
                            className="card-body p-0"
                            style={{ maxHeight: "60vh", overflowY: "auto" }}
                        >
                            {centreSummaryLoading ? (
                                <div className="text-center p-3">{t("Loading...")}</div>
                            ) : (
                                <Tables>
                                    <thead>
                                        <tr>
                                            <th>{t("Sr No.")}</th>
                                            <th>{t("Center Name")}</th>
                                            <th>{t("Total Count")}</th>
                                            <th>{t("Total Delayed")}</th>
                                            <th>{t("Delay Per (%)")}</th>
                                            <th>{t("Total Pending")}</th>
                                            <th>{t("Pending Per (%)")}</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {centreSummaryData.length > 0 ? (
                                            centreSummaryData.map((item, index) => (
                                                <tr key={index}>
                                                    <td data-title={t("Sr No.")}>{index + 1}</td>
                                                    <td data-title={t("Center Name")}>
                                                        <span
                                                            style={{
                                                                color: "#0d6efd",
                                                                cursor: "pointer",
                                                                textDecoration: "underline",
                                                            }}
                                                            onClick={() => {
                                                                setShowCentreSummary(false);
                                                                toast.info(
                                                                    `${t("Showing data for")} ${item?.centreName}`,
                                                                );
                                                            }}
                                                        >
                                                            {item?.centreName || "-"}
                                                        </span>
                                                    </td>
                                                    <td data-title={t("Total Count")}>
                                                        {item?.totalCount ?? 0}
                                                    </td>
                                                    <td data-title={t("Total Delayed")}>
                                                        {item?.totalDelayed ?? 0}
                                                    </td>
                                                    <td data-title={t("Delay Per (%)")}>
                                                        {item?.delayPer ?? "0.00"}
                                                    </td>
                                                    <td data-title={t("Total Pending")}>
                                                        {item?.totalPending ?? 0}
                                                    </td>
                                                    <td data-title={t("Pending Per (%)")}>
                                                        {item?.pendingPer ?? "0.00"}
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan="7" className="text-center">
                                                    {t("No Records Found")}
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </Tables>
                            )}
                        </div>
                        <div className="modal-footer d-flex justify-content-center gap-2">
                            <CustomButton
                                text={t("Excel")}
                                onClick={handleCentreSummaryExcel}
                                loading={centreSummaryExcelLoading}
                                icon="excel"
                            />
                            <CustomButton
                                text={t("Close")}
                                variant="secondary"
                                onClick={() => setShowCentreSummary(false)}
                            />
                        </div>
                    </div>
                </Dialog>
            )}

            {/* ══════════════════════════════════════════
                DEPARTMENT SUMMARY DIALOG
            ══════════════════════════════════════════ */}
            {showDeptSummary && (
                <Dialog
                    header={t("TAT Delay Department Summary")}
                    visible={showDeptSummary}
                    onHide={() => setShowDeptSummary(false)}
                    style={{ width: "70vw" }}
                    className={theme}
                >
                    <div className="card">
                        <div
                            className="card-body p-0"
                            style={{ maxHeight: "60vh", overflowY: "auto" }}
                        >
                            {deptSummaryLoading ? (
                                <div className="text-center p-3">{t("Loading...")}</div>
                            ) : (
                                <Tables>
                                    <thead>
                                        <tr>
                                            <th>{t("Sr No.")}</th>
                                            <th>{t("Department")}</th>
                                            <th>{t("Total Count")}</th>
                                            <th>{t("Total Delayed")}</th>
                                            <th>{t("Delay Per (%)")}</th>
                                            <th>{t("Total Pending")}</th>
                                            <th>{t("Pending Per (%)")}</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {deptSummaryData.length > 0 ? (
                                            deptSummaryData.map((item, index) => (
                                                <tr key={index}>
                                                    <td data-title={t("Sr No.")}>{index + 1}</td>
                                                    <td data-title={t("Department")}>
                                                        {item?.department || "-"}
                                                    </td>
                                                    <td data-title={t("Total Count")}>
                                                        {item?.totalCount ?? 0}
                                                    </td>
                                                    <td data-title={t("Total Delayed")}>
                                                        {item?.totalDelayed ?? 0}
                                                    </td>
                                                    <td data-title={t("Delay Per (%)")}>
                                                        {item?.delayPer ?? "0.00"}
                                                    </td>
                                                    <td data-title={t("Total Pending")}>
                                                        {item?.totalPending ?? 0}
                                                    </td>
                                                    <td data-title={t("Pending Per (%)")}>
                                                        {item?.pendingPer ?? "0.00"}
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan="7" className="text-center">
                                                    {t("No Records Found")}
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </Tables>
                            )}
                        </div>
                        <div className="modal-footer d-flex justify-content-center gap-2">
                            <CustomButton
                                text={t("Excel")}
                                onClick={handleDeptSummaryExcel}
                                loading={deptSummaryExcelLoading}
                                icon="excel"
                            />
                            <CustomButton
                                text={t("Close")}
                                variant="secondary"
                                onClick={() => setShowDeptSummary(false)}
                            />
                        </div>
                    </div>
                </Dialog>
            )}
        </>
    );
};

export default TATMIS;
