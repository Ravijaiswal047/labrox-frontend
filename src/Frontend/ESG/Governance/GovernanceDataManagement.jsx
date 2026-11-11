import { useState } from "react";
import { useTranslation } from "react-i18next";
import Heading from "../../../components/UI/Heading";
import { CustomButton } from "../../../components/UI/CustomButton";

import Audit from "./Audit";
import AuditSearch from "./AuditSearch";
import LegalRegister from "./LegalRegister";
import LegalRegisterSearch from "./LegalRegisterSearch";
import KPI from "./KPI";
import KPISearch from "./KPISearch";
import VendorAssessment from "./VendorAssessment";
import VendorAssessmentSearch from "./VendorAssessmentSearch";

const GovernanceDataManagement = () => {
    const [t] = useTranslation();

    const [activeTab, setActiveTab] = useState("Audit");
    const [viewMode, setViewMode] = useState("ENTRY");
    const [editData, setEditData] = useState(null);

    const handleEdit = (rowData) => {
        setEditData(rowData);
        setViewMode("ENTRY");

        window.scrollTo({
            top: 0,
            behavior: "smooth",
        });
    };

    const handleTabChange = (tabId) => {
        setActiveTab(tabId);
        setEditData(null);
        setViewMode("ENTRY");
    };

    const handleViewToggle = (view) => {
        setViewMode(view);

        if (view === "ENTRY") {
            setEditData(null);
        }
    };

    const tabs = [
        { id: "Audit", label: t("Audit") },
        { id: "LegalRegister", label: t("Legal Register") },
        { id: "KPI", label: t("KPI") },
        // { id: "VendorAssessment", label: t("Vendor Assessment") },
    ];

    const renderContent = () => {
        switch (activeTab) {
            case "Audit":
                return viewMode === "ENTRY" ? (
                    <Audit
                        editData={editData}
                        setEditData={setEditData}
                    />
                ) : (
                    <AuditSearch onEdit={handleEdit} />
                );

            case "LegalRegister":
                return viewMode === "ENTRY" ? (
                    <LegalRegister
                        editData={editData}
                        setEditData={setEditData}
                    />
                ) : (
                    <LegalRegisterSearch onEdit={handleEdit} />
                );

            case "KPI":
                return viewMode === "ENTRY" ? (
                    <KPI
                        editData={editData}
                        setEditData={setEditData}
                    />
                ) : (
                    <KPISearch onEdit={handleEdit} />
                );

            // case "VendorAssessment":
            //     return viewMode === "ENTRY" ? (
            //         <VendorAssessment
            //             editData={editData}
            //             setEditData={setEditData}
            //         />
            //     ) : (
            //         <VendorAssessmentSearch onEdit={handleEdit} />
            //     );

            default:
                return null;
        }
    };

    return (
        <>
            <Heading
                title={t("")}
                secondTitle={
                    <div
                        className="d-flex align-items-center justify-content-between w-100"
                        style={{ gap: "8px" }}
                    >
                        {/* Left Side Tabs */}
                        <div
                            className="d-flex flex-wrap"
                            style={{ gap: "5px" }}
                        >
                            {tabs.map((tab) => (
                                <CustomButton
                                    key={tab.id}
                                    text={tab.label}
                                    onClick={() =>
                                        handleTabChange(tab.id)
                                    }
                                    disabled={activeTab === tab.id}
                                />
                            ))}
                        </div>

                        {/* Right Side Entry / Records */}
                        <div
                            className="d-flex flex-nowrap"
                            style={{ gap: "5px" }}
                        >
                            <CustomButton
                                text={t("Entry")}
                                icon="save"
                                onClick={() =>
                                    handleViewToggle("ENTRY")
                                }
                                disabled={viewMode === "ENTRY"}
                            />

                            <CustomButton
                                text={t("Records")}
                                icon="back"
                                onClick={() =>
                                    handleViewToggle("RECORDS")
                                }
                                disabled={viewMode === "RECORDS"}
                            />
                        </div>
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

export default GovernanceDataManagement;