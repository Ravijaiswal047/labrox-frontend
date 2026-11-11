import { useState } from "react";
import { useTranslation } from "react-i18next";
import Heading from "../../../components/UI/Heading";
import { CustomButton } from "../../../components/UI/CustomButton";
import "./EnvironmentalDataManagement.css";

import Consumption from "./Consumption";
import ConsumptionSearch from "./ConsumptionSearch";
import WasteManagement from "./WasteManagement";
import WasteManagementSearch from "./WasteManagementSearch";
import Chemical from "./Chemical";
import ChemicalSearch from "./ChemicalSearch";
import ESGScreening from "./ESGScreening";
import ESGScreeningSearch from "./ESGScreeningSearch";

/* ── Breadcrumb ── */
const Breadcrumb = ({ items }) => (
    <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "13px", marginBottom: "12px" }}>
        {items.map((item, idx) => (
            <span key={idx} style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                {idx > 0 && <span style={{ color: "#8E96A3" }}>›</span>}
                {item.onClick ? (
                    <span onClick={item.onClick} style={{ color: "#185FA5", cursor: "pointer", fontWeight: 500 }}>
                        {item.label}
                    </span>
                ) : (
                    <span style={{ color: "#8E96A3" }}>{item.label}</span>
                )}
            </span>
        ))}
    </div>
);

/* ── Disposal context banner ── */
const DisposalBanner = ({ data }) => (
    <div style={{
        background: "#FFF8E6", border: "1px solid #FAC775", borderRadius: "10px",
        padding: "14px 16px", marginBottom: "14px",
        display: "flex", alignItems: "flex-start", gap: "12px",
    }}>
        <div style={{
            width: "34px", height: "34px", background: "#FAEEDA", borderRadius: "50%",
            display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
        }}>
            <i className="fa fa-trash" style={{ color: "#854F0B", fontSize: "14px" }}></i>
        </div>
        <div>
            <div style={{ fontSize: "13px", fontWeight: 600, color: "#633806", marginBottom: "8px" }}>
                Recording disposal for: {data?.CentreName} — {data?.WasteMonth}
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                {[
                    { label: "General",    value: `${data?.GeneralKg} kg`          },
                    { label: "Infectious", value: `${data?.InfectiousKg} kg`       },
                    { label: "Sharps",     value: `${data?.SharpsKg} kg`           },
                    ...(data?.ChemicalWasteLtrs > 0
                        ? [{ label: "Chemical", value: `${data?.ChemicalWasteLtrs} ltrs` }]
                        : []),
                    { label: "Compliance", value: `${data?.CompliancePercent}%`    },
                ].map((stat, i) => (
                    <span key={i} style={{
                        background: "#fff", border: "1px solid #FAC775",
                        borderRadius: "6px", padding: "3px 10px",
                        fontSize: "12px", color: "#633806",
                    }}>
                        {stat.label}: <strong>{stat.value}</strong>
                    </span>
                ))}
            </div>
        </div>
    </div>
);

/* ══════════════════════════════════════════════
   MAIN COMPONENT
══════════════════════════════════════════════ */
const EnvironmentalDataManagement = () => {
    const [t] = useTranslation();
    const [activeTab,    setActiveTab]    = useState("Consumption");
    const [viewMode,     setViewMode]     = useState("ENTRY");
    const [editData,     setEditData]     = useState(null);
    const [disposalMode, setDisposalMode] = useState(false);

    const handleEdit = (rowData) => {
        if (rowData?.isDisposalMode) {
            setDisposalMode(true);
            setEditData(rowData);
            setViewMode("ENTRY");
        } else {
            setDisposalMode(false);
            setEditData(rowData);
            setViewMode("ENTRY");
            window.scrollTo({ top: 0, behavior: "smooth" });
        }
    };

    const handleSetEditData = (data) => {
        setEditData(data);
        if (!data) setDisposalMode(false);
    };

    const handleTabChange = (tabId) => {
        setActiveTab(tabId);
        setEditData(null);
        setDisposalMode(false);
        setViewMode("ENTRY");
    };

    const handleViewToggle = (v) => {
        setViewMode(v);
        if (v === "ENTRY") {
            setDisposalMode(false);
            setEditData(null);
        }
    };

    const handleCancelDisposal = () => {
        setDisposalMode(false);
        setEditData(null);
        setViewMode("RECORDS");
    };

    const tabs = [
        { id: "Consumption",     label: t("Consumption")      },
        { id: "WasteManagement", label: t("Waste Management") },
        { id: "Chemical",        label: t("Chemical")         },
        { id: "ESGScreening",    label: t("ESG Screening")    },
    ];

    const renderContent = () => {
        if (activeTab === "WasteManagement" && disposalMode) {
            return (
                <>
                    <Breadcrumb
                        items={[
                            { label: t("Waste management"), onClick: handleCancelDisposal },
                            { label: t("Record disposal") },
                        ]}
                    />
                    {/* <DisposalBanner data={editData} /> */}
                    <WasteManagement
                        editData={editData}
                        setEditData={(data) => {
                            handleSetEditData(data);
                            if (!data) setViewMode("RECORDS");
                        }}
                    />
                </>
            );
        }

        switch (activeTab) {
            case "Consumption":
                return viewMode === "ENTRY"
                    ? <Consumption editData={editData} setEditData={handleSetEditData} />
                    : <ConsumptionSearch onEdit={handleEdit} />;
            case "WasteManagement":
                return viewMode === "ENTRY"
                    ? <WasteManagement editData={editData} setEditData={handleSetEditData} />
                    : <WasteManagementSearch onEdit={handleEdit} />;
            case "Chemical":
                return viewMode === "ENTRY"
                    ? <Chemical editData={editData} setEditData={handleSetEditData} />
                    : <ChemicalSearch onEdit={handleEdit} />;
            case "ESGScreening":
                return viewMode === "ENTRY"
                    ? <ESGScreening editData={editData} setEditData={handleSetEditData} />
                    : <ESGScreeningSearch onEdit={handleEdit} />;
            default:
                return null;
        }
    };

    /*
     * Heading component structure:
     *   title      → left side  → <label className="text-nowrap m-0">
     *   secondTitle → right side → flex div with w-md-50
     *
     * So we put ALL buttons in secondTitle with justify-content-between
     * so tabs sit on the left end and Entry/Records on the right end —
     * all in one row, no wrapping.
     */
    return (
        <>
            <Heading
                title={t("")}
                secondTitle={
                    <div className="env-header-container">
                        {/* Left: 4 module tab buttons */}
                        <div className="env-header-tabs">
                            {tabs.map((tab) => (
                                <CustomButton
                                    key={tab.id}
                                    text={tab.label}
                                    onClick={() => handleTabChange(tab.id)}
                                    disabled={activeTab === tab.id}
                                />
                            ))}
                        </div>

                        {/* Right: Entry / Records toggle */}
                        {!disposalMode && (
                            <div className="env-header-actions">
                                <CustomButton
                                    text={t("Entry")}
                                    icon="save"
                                    onClick={() => handleViewToggle("ENTRY")}
                                    disabled={viewMode === "ENTRY"}
                                />
                                <CustomButton
                                    text={t("Records")}
                                    icon="back"
                                    onClick={() => handleViewToggle("RECORDS")}
                                    disabled={viewMode === "RECORDS"}
                                />
                            </div>
                        )}
                    </div>
                }
            />

            <div className="row py-2 bg-white m-0">
                <div className="col-12">
                    {renderContent()}
                </div>
            </div>
        </>
    );
};

export default EnvironmentalDataManagement;
