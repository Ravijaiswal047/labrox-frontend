import React, { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import DatePicker from "../../components/formComponent/DatePicker";
import Loading from "../../components/loader/Loading";
import Accordion from "@app/components/UI/Accordion";
import { useTranslation } from "react-i18next";
import { axiosReport } from "../../utils/axiosInstance";
import {
    getAccessCentresReports,
    getAccessDataRateReport,
} from "../../utils/NetworkApi/commonApi";
import MultiSelectComp from "../../components/formComponent/MultiSelectComp";
import { CustomButton } from "../../components/UI/CustomButton";
import Tables from "../../components/UI/customTable";
import { FaUsers, FaIdCard, FaTag, FaUserEdit, FaFlask } from "react-icons/fa";
import { downloadExcelBlob, formatStandardDate, openPdfBlob } from "../../utils/helpers";

const defaultFormData = {
    Centre: [],
    FromDate: new Date(),
    ToDate: new Date(),
    MultipleRateType: [],
    DiscountType: [],
};

const discountTypeOptions = [
    { label: "Manual Discount", value: "Manual Discount" },
    { label: "Coupon Discount", value: "Coupon Discount" },
    { label: "Policy Discount", value: "Policy Discount" },
    { label: "Membership Discount", value: "Membership Discount" },
    { label: "Test Wise Discount", value: "Test Wise Discount" },
];

const TYPE_META = {
    "Manual Discount": { icon: FaUserEdit, color: "#d97706", bg: "#fffbeb" },
    "Coupon Discount": { icon: FaTag, color: "#059669", bg: "#ecfdf5" },
    "Policy Discount": { icon: FaUsers, color: "#326fd1", bg: "#e8f0fb" },
    "Membership Discount": { icon: FaIdCard, color: "#7c3aed", bg: "#f3f0ff" },
    "Test Wise Discount": { icon: FaFlask, color: "#0891b2", bg: "#ecfeff" },
};
const DEFAULT_META = { icon: FaTag, color: "#6b7280", bg: "#f3f4f6" };

const inr = (n) => "₹" + (n || 0).toLocaleString("en-IN");

const REPORT_TYPE = {
    SEARCH: 0,
    PDF: 1,
    EXCEL: 2,
};

function DiscountReport(props) {
    const { t } = useTranslation();
    const [loadingSearch, setLoadingSearch] = useState(false);
    const [loadingPdf, setLoadingPdf] = useState(false);
    const [loadingExcel, setLoadingExcel] = useState(false);
    const [CentreData, setCentreData] = useState([]);
    const [rateType, setRateType] = useState([]);
    const [formData, setFormData] = useState(defaultFormData);
    const [rows, setRows] = useState([]);
    const [searched, setSearched] = useState(false);
    const [openSections, setOpenSections] = useState({});

    const dateSelect = (date, name) => {
        setFormData((prev) => ({ ...prev, [name]: date }));
    };

    const handleSelectMultiChange = (name, value) => {
        if (name === "Centre") {
            setFormData((prev) => ({
                ...prev,
                Centre: value,
                RateType: "",
                MultipleRateType: [],
            }));
            getAccessDataRateReport(setRateType, Array.isArray(value) ? value : []);
        } else {
            setFormData((prev) => ({ ...prev, [name]: value }));
        }
    };

    const buildPayload = (reportType) => ({
        fromDate: formatStandardDate(formData?.FromDate, "YYYY-MM-DD"),
        toDate: formatStandardDate(formData?.ToDate, "YYYY-MM-DD"),
        centreIds: formData.Centre.length > 0 ? formData.Centre : [],
        rateTypeIds: formData.MultipleRateType.length > 0 ? formData.MultipleRateType : [],
        createdByIds: [],
        approvedByIds: [],
        discountTypes: formData.DiscountType.length > 0 ? formData.DiscountType : [],
        searchValue: "",
        searchType: 0,
        reportType,
        isTestNameRequired: 0,
    });

    const toggle = (type) =>
        setOpenSections((prev) => ({ ...prev, [type]: !prev[type] }));

    const handleSearch = async () => {
        setLoadingSearch(true);
        await axiosReport
            .post("NPLReport/UserDiscountReport", buildPayload(REPORT_TYPE.SEARCH))
            .then((res) => {
                const data = res?.data?.message || [];
                setRows(data);
                setSearched(true);
                if (data.length > 0) {
                    setOpenSections({ [data[0].discountType]: true });
                } else {
                    toast.error(res?.data?.message || "No Report Found");
                }
            })
            .catch((err) => {
                toast.error(err?.response?.data?.message || "Search failed! Please try again.");
                setRows([]);
            })
            .finally(() => {
                setLoadingSearch(false);
            });
    };

    // Blob response can still secretly be a JSON error/empty payload instead of a file.
    const handleBlobError = async (err) => {
        if (err?.response?.data instanceof Blob) {
            try {
                const text = await err.response.data.text();
                const json = JSON.parse(text);
                toast.error(json?.message || "Error while fetching report.");
            } catch {
                toast.error("Error while fetching report.");
            }
            return;
        }
        toast.error(err?.response?.data?.message || "Error while fetching report.");
    };

    const handleDisocuntReport = async () => {
        setLoadingPdf(true);
        try {
            const res = await axiosReport.post(
                "NPLReport/UserDiscountReport",
                buildPayload(REPORT_TYPE.PDF),
                { responseType: "blob" }
            );

            const contentType = res.headers?.["content-type"] || "";
            if (contentType.includes("application/json")) {
                const text = await res.data.text();
                const json = JSON.parse(text);
                if (json?.success && json?.url) {
                    window.open(json.url, "_blank");
                } else {
                    toast.error(json?.message || "No records found.");
                }
                return;
            }

            if (!res.data || res.data.size === 0) {
                toast.error("No data available to export.");
                return;
            }

            openPdfBlob(res.data);
        } catch (err) {
            await handleBlobError(err);
        } finally {
            setLoadingPdf(false);
        }
    };

    const handleExcelReport = async () => {
        setLoadingExcel(true);
        try {
            const res = await axiosReport.post(
                "NPLReport/UserDiscountReport",
                buildPayload(REPORT_TYPE.EXCEL),
                { responseType: "blob" }
            );

            const contentType = res.headers?.["content-type"] || "";
            if (contentType.includes("application/json")) {
                const text = await res.data.text();
                const json = JSON.parse(text);
                toast.error(json?.message || "No records found.");
                return;
            }

            if (!res.data || res.data.size === 0) {
                toast.error("No data available to export.");
                return;
            }

            downloadExcelBlob(res.data, "Discount_Report");
            toast.success("Excel File Downloaded");
        } catch (err) {
            await handleBlobError(err);
        } finally {
            setLoadingExcel(false);
        }
    };

    const groupedByType = useMemo(() => {
        const groups = {};
        rows.forEach((row) => {
            const type = row.discountType || "Others";
            if (!groups[type]) groups[type] = [];
            groups[type].push(row);
        });

        return Object.keys(groups).map((type) => {
            const list = groups[type];
            const grossAmount = list.reduce((s, r) => s + (r.grossAmount || 0), 0);
            const discountAmount = list.reduce((s, r) => s + (r.discountOnTotal || 0), 0);
            const netAmount = list.reduce((s, r) => s + (r.netAmount || 0), 0);
            const discountPercent = grossAmount ? ((discountAmount / grossAmount) * 100).toFixed(1) : "0.0";

            const panelGroups = {};
            list.forEach((row) => {
                const panel = row.panel || "Unknown";
                if (!panelGroups[panel]) panelGroups[panel] = [];
                panelGroups[panel].push(row);
            });
            const panels = Object.keys(panelGroups).map((panel) => {
                const pList = panelGroups[panel];
                const pGross = pList.reduce((s, r) => s + (r.grossAmount || 0), 0);
                const pDiscount = pList.reduce((s, r) => s + (r.discountOnTotal || 0), 0);
                const pNet = pList.reduce((s, r) => s + (r.netAmount || 0), 0);
                const pPct = pGross ? ((pDiscount / pGross) * 100).toFixed(1) : "0.0";
                return { panel, bills: pList.length, gross: pGross, discount: pDiscount, net: pNet, pct: pPct };
            });

            return {
                type,
                code: type,
                meta: TYPE_META[type] || DEFAULT_META,
                totalBills: list.length,
                grossAmount,
                discountAmount,
                netAmount,
                discountPercent,
                panels,
            };
        });
    }, [rows]);

    const totalBills = rows.length;
    const totalGross = rows.reduce((s, r) => s + (r.grossAmount || 0), 0);
    const totalDiscount = rows.reduce((s, r) => s + (r.discountOnTotal || 0), 0);
    const totalNet = rows.reduce((s, r) => s + (r.netAmount || 0), 0);
    const avgDiscount = totalGross ? ((totalDiscount / totalGross) * 100).toFixed(1) : "0.0";

    const kpiCards = [
        { label: "Total Bills Discounted", value: totalBills.toLocaleString("en-IN"), color: "#326fd1", bg: "#e8f0fb", icon: "pi pi-file-edit" },
        { label: "Gross Collection", value: inr(totalGross), color: "#059669", bg: "#ecfdf5", icon: "pi pi-indian-rupee" },
        { label: "Total Discount Given", value: inr(totalDiscount), color: "#d97706", bg: "#fffbeb", icon: "pi pi-percentage" },
        { label: "Avg Discount %", value: avgDiscount + "%", color: "#7c3aed", bg: "#f3f0ff", icon: "pi pi-chart-bar" },
    ];

    useEffect(() => {
        if (CentreData?.length === 1) {
            const singleCentre = [CentreData[0].value];
            setFormData((prev) => ({ ...prev, Centre: singleCentre }));
            getAccessDataRateReport(setRateType, singleCentre);
        }
    }, [CentreData]);

    useEffect(() => {
        getAccessCentresReports(setCentreData);
    }, []);

    return (
        <>
            <Accordion
                name={t("Discount Report")}
                defaultValue={true}
                isBreadcrumb={true}
            >
                <div className="row px-2 mt-2 p-1">

                    <div className="col-12 col-sm-6 col-md-2 my-1">
                        <MultiSelectComp
                            label="All Centre"
                            options={CentreData}
                            value={formData?.Centre}
                            name="Centre"
                            onChange={handleSelectMultiChange}
                            lable={t("Select Centre")}
                        />
                    </div>

                    <div className="col-12 col-sm-6 col-md-2 my-1">
                        <MultiSelectComp
                            label="All RateType"
                            options={rateType}
                            value={formData?.MultipleRateType}
                            name="MultipleRateType"
                            onChange={handleSelectMultiChange}
                            lable={t("Select RateType")}
                        />
                    </div>

                    <div className="col-12 col-sm-6 col-md-2 my-1">
                        <DatePicker
                            className="custom-calendar"
                            name="FromDate"
                            value={formData?.FromDate}
                            onChange={dateSelect}
                            maxDate={new Date()}
                            lable={t("FromDate")}
                        />
                    </div>

                    <div className="col-12 col-sm-6 col-md-2 my-1">
                        <DatePicker
                            className="custom-calendar"
                            name="ToDate"
                            value={formData?.ToDate}
                            onChange={dateSelect}
                            maxDate={new Date()}
                            minDate={new Date(formData.FromDate)}
                            lable={t("ToDate")}
                        />
                    </div>

                    <div className="col-12 col-sm-6 col-md-2 my-1">
                        <MultiSelectComp
                            label="Discount Type"
                            options={discountTypeOptions}
                            value={formData?.DiscountType}
                            name="DiscountType"
                            onChange={handleSelectMultiChange}
                            lable={t("Discount Type")}
                        />
                    </div>

                    <div className="row px-2 mb-2">
                        <div className="col-12 col-sm-6 col-md-4 my-1 d-flex align-items-center" style={{ gap: "10px" }}>
                            {loadingSearch ? (
                                <Loading />
                            ) : (
                                <CustomButton
                                    text={"Search"}
                                    icon={"search"}
                                    onClick={handleSearch}
                                    className="mr-2"
                                />
                            )}
                            {loadingPdf ? (
                                <Loading />
                            ) : (
                                <CustomButton
                                    text={"PDF"}
                                    icon={"pdf"}
                                    onClick={handleDisocuntReport}
                                    className="mr-2"
                                />
                            )}
                            {loadingExcel ? (
                                <Loading />
                            ) : (
                                <CustomButton
                                    text={"Excel"}
                                    icon={"excel"}
                                    onClick={handleExcelReport}
                                />
                            )}
                        </div>
                    </div>
                </div>
            </Accordion>

            {searched && (
                rows.length === 0 ? (
                    <div className="text-center py-4" style={{ color: "#9ca3af", fontSize: 13 }}>
                        No records found.
                    </div>
                ) : (
                    <>
                        {/* ── KPI Cards ── */}
                        <div className="row g-2 px-1 mt-1 mb-2 py-3">
                            {kpiCards.map((k, i) => (
                                <div className="col-md-3 col-sm-6" key={i}>
                                    <div
                                        className="rounded p-3 d-flex align-items-center justify-content-between"
                                        style={{
                                            background: k.bg,
                                            border: `1px solid ${k.color}30`,
                                            minHeight: 72,
                                        }}
                                    >
                                        <div>
                                            <div style={{ fontSize: 11, color: "#6b7280", fontWeight: 500, marginBottom: 3 }}>
                                                {k.label}
                                            </div>
                                            <div style={{ fontSize: 20, fontWeight: 700, color: k.color, lineHeight: 1 }}>
                                                {k.value}
                                            </div>
                                        </div>
                                        <div
                                            className="rounded-circle d-flex align-items-center justify-content-center"
                                            style={{ width: 42, height: 42, background: k.color + "20", flexShrink: 0 }}
                                        >
                                            <i className={k.icon} style={{ color: k.color, fontSize: 17 }} />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* ── Per-discount-type sections ── */}
                        {groupedByType.map((d) => {
                            const Icon = d.meta.icon;
                            const isOpen = !!openSections[d.code];
                            const chevron = isOpen ? "pi-chevron-up" : "pi-chevron-down";

                            return (
                                <div
                                    key={d.code}
                                    className="mb-2 rounded"
                                    style={{ border: `1px solid ${d.meta.color}30`, overflow: "hidden" }}
                                >
                                    {/* Header row */}
                                    <div
                                        className="d-flex flex-wrap align-items-center justify-content-between px-3 py-2"
                                        style={{
                                            background: d.meta.bg,
                                            cursor: "pointer",
                                            userSelect: "none",
                                            minHeight: 44,
                                            gap: 8,
                                        }}
                                        onClick={() => toggle(d.code)}
                                    >
                                        {/* Left – icon + label + pill */}
                                        <div className="d-flex align-items-center" style={{ gap: 8 }}>
                                            <span
                                                className="rounded d-flex align-items-center justify-content-center"
                                                style={{ width: 28, height: 28, background: d.meta.color, color: "#fff", flexShrink: 0 }}
                                            >
                                                <Icon size={13} />
                                            </span>
                                            <span style={{ fontWeight: 600, fontSize: 13, color: d.meta.color }}>
                                                {d.type}
                                            </span>
                                            <span
                                                className="rounded-pill px-2"
                                                style={{ fontSize: 10, background: d.meta.color, color: "#fff", fontWeight: 600 }}
                                            >
                                                {d.totalBills} bills
                                            </span>
                                        </div>

                                        {/* Right – stats + chevron */}
                                        <div className="d-flex align-items-center" style={{ gap: 20 }}>
                                            <div style={{ textAlign: "right", minWidth: 80 }} className="d-none d-md-block">
                                                <div style={{ fontSize: 10, color: "#9ca3af", fontWeight: 500 }}>Gross</div>
                                                <div style={{ fontSize: 12, fontWeight: 600, color: "#374151" }}>{inr(d.grossAmount)}</div>
                                            </div>
                                            <div style={{ textAlign: "right", minWidth: 80 }} className="d-none d-md-block">
                                                <div style={{ fontSize: 10, color: "#9ca3af", fontWeight: 500 }}>Discount</div>
                                                <div style={{ fontSize: 12, fontWeight: 700, color: d.meta.color }}>{inr(d.discountAmount)}</div>
                                            </div>
                                            <div style={{ textAlign: "right", minWidth: 80 }} className="d-none d-md-block">
                                                <div style={{ fontSize: 10, color: "#9ca3af", fontWeight: 500 }}>Net Amt</div>
                                                <div style={{ fontSize: 12, fontWeight: 600, color: "#374151" }}>{inr(d.netAmount)}</div>
                                            </div>
                                            <div style={{ textAlign: "right", minWidth: 52 }}>
                                                <div style={{ fontSize: 10, color: "#9ca3af", fontWeight: 500 }}>Avg %</div>
                                                <div style={{ fontSize: 13, fontWeight: 700, color: d.meta.color }}>{d.discountPercent}%</div>
                                            </div>
                                            <i className={`pi ${chevron}`} style={{ fontSize: 11, color: d.meta.color }} />
                                        </div>
                                    </div>

                                    {/* Collapsible table */}
                                    {isOpen && (
                                        <Tables removeScrollOverFlow={false} style={{ maxHeight: 280 }}>
                                            <thead style={{ position: "sticky", top: 0, zIndex: 1 }}>
                                                <tr style={{ background: d.meta.color }}>
                                                    {["#", "Centre / Panel", "Bills", "Gross Amt (₹)", "Discount Amt (₹)", "Net Amt (₹)", "Disc %"].map(
                                                        (col, i) => (
                                                            <th
                                                                key={i}
                                                                className={i >= 2 ? "text-end" : ""}
                                                                style={{ fontWeight: 600, fontSize: 11, whiteSpace: "nowrap", padding: "6px 10px" }}
                                                            >
                                                                {col}
                                                            </th>
                                                        )
                                                    )}
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {d.panels.map((c, i) => (
                                                    <tr key={i} style={{ background: i % 2 === 0 ? "#fff" : d.meta.bg }}>
                                                        <td style={{ padding: "5px 10px", color: "#9ca3af", fontSize: 12 }}>{i + 1}</td>
                                                        <td style={{ padding: "5px 10px", fontWeight: 500, fontSize: 12, whiteSpace: "normal" }}>{c.panel}</td>
                                                        <td className="text-end" style={{ padding: "5px 10px", fontSize: 12 }}>{c.bills}</td>
                                                        <td className="text-end" style={{ padding: "5px 10px", fontSize: 12 }}>{c.gross.toLocaleString("en-IN")}</td>
                                                        <td className="text-end" style={{ padding: "5px 10px", fontSize: 12, color: d.meta.color, fontWeight: 600 }}>
                                                            {c.discount.toLocaleString("en-IN")}
                                                        </td>
                                                        <td className="text-end" style={{ padding: "5px 10px", fontSize: 12 }}>{c.net.toLocaleString("en-IN")}</td>
                                                        <td className="text-end" style={{ padding: "5px 10px" }}>
                                                            <span
                                                                className="rounded-pill px-2"
                                                                style={{ fontSize: 11, background: d.meta.bg, color: d.meta.color, fontWeight: 600, border: `1px solid ${d.meta.color}40` }}
                                                            >
                                                                {c.pct}%
                                                            </span>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                            <tfoot>
                                                <tr style={{ background: d.meta.color + "18" }}>
                                                    <td colSpan={2} style={{ padding: "6px 10px", fontWeight: 700, color: d.meta.color, fontSize: 12 }}>
                                                        Sub Total
                                                    </td>
                                                    <td className="text-end" style={{ padding: "6px 10px", fontWeight: 700, color: d.meta.color, fontSize: 12 }}>
                                                        {d.totalBills}
                                                    </td>
                                                    <td className="text-end" style={{ padding: "6px 10px", fontWeight: 700, color: d.meta.color, fontSize: 12 }}>
                                                        {d.grossAmount.toLocaleString("en-IN")}
                                                    </td>
                                                    <td className="text-end" style={{ padding: "6px 10px", fontWeight: 700, color: d.meta.color, fontSize: 12 }}>
                                                        {d.discountAmount.toLocaleString("en-IN")}
                                                    </td>
                                                    <td className="text-end" style={{ padding: "6px 10px", fontWeight: 700, color: d.meta.color, fontSize: 12 }}>
                                                        {d.netAmount.toLocaleString("en-IN")}
                                                    </td>
                                                    <td className="text-end" style={{ padding: "6px 10px", fontWeight: 700, color: d.meta.color, fontSize: 12 }}>
                                                        {d.discountPercent}%
                                                    </td>
                                                </tr>
                                            </tfoot>
                                        </Tables>
                                    )}
                                </div>
                            );
                        })}

                        {/* ── Grand Total ── */}
                        <div
                            className="d-flex flex-wrap align-items-center justify-content-between px-3 py-2 rounded mt-1"
                            style={{ background: "#1e3a5f", color: "#fff", gap: 12 }}
                        >
                            <span style={{ fontWeight: 700, fontSize: 13 }}>Grand Total</span>
                            <div className="d-flex flex-wrap" style={{ gap: 24 }}>
                                {[
                                    { label: "Bills", value: totalBills.toLocaleString("en-IN") },
                                    { label: "Gross", value: inr(totalGross) },
                                    { label: "Discount", value: inr(totalDiscount), highlight: true },
                                    { label: "Net", value: inr(totalNet) },
                                    { label: "Avg Disc%", value: avgDiscount + "%", highlight: true },
                                ].map((item, i) => (
                                    <div key={i} style={{ textAlign: "right" }}>
                                        <div style={{ fontSize: 10, opacity: 0.65, fontWeight: 500 }}>{item.label}</div>
                                        <div style={{ fontSize: 13, fontWeight: 700, color: item.highlight ? "#fbbf24" : "#fff" }}>
                                            {item.value}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </>
                )
            )}
        </>
    );
}

export default DiscountReport;
