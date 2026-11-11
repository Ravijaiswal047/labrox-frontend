import { useState } from "react";
import { useTranslation } from "react-i18next";
import Heading from "../../../components/UI/Heading";
import { CustomButton } from "../../../components/UI/CustomButton";

// Imports
import Immunization from "./Immunization";
import ImmunizationSearch from "./ImmunizationSearch";
import HealthSafetyTraining from "./HealthSafetyTraining";
import HealthSafetyTrainingSearch from "./HealthSafetyTrainingSearch";
import Incidents from "./Incidents";
import IncidentSearch from "./IncidentSearch";
import Grievance from "./Grievance";
import GrievanceSearch from "./GrievanceSearch";
import DiversityInclusion from "./DiversityInclusion";
import DiversityInclusionSearch from "./DiversityInclusionSearch";
import CSR from "../Governance/CSR";
import CSRSearch from "../Governance/CSRSearch";
import NeedleStickInjury from "./NeedleStickInjury";
import NeedleStickInjurySearch from "./NeedleStickInjurySearch";

const SocialDataManagement = () => {
    const [t] = useTranslation();
    const [activeTab, setActiveTab] = useState("Immunization");
    const [viewMode, setViewMode] = useState("ENTRY");
    const [editData, setEditData] = useState(null);

    const handleEdit = (rowData) => {
        setEditData(rowData);
        setViewMode("ENTRY");
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const handleTabChange = (tabId) => {
        setActiveTab(tabId);
        setEditData(null);
        setViewMode("ENTRY");
    };

    const handleViewToggle = (v) => {
        setViewMode(v);
        if (v === "ENTRY") {
            setEditData(null);
        }
    };

    const tabs = [
        { id: "Immunization", label: t("Immunization") },
        { id: "HealthSafety", label: t("Training Record") },
        { id: "Incidents",    label: t("Incidents") },
        { id: "NeedleStickInjury", label: t("Needle Stick Injury") },
        { id: "Grievance",    label: t("Grievance") },
        { id: "Diversity",    label: t("Diversity & Inclusion") },
        { id: "CSR",              label: t("CSR") },
        
    ];

    const renderContent = () => {
        switch (activeTab) {
            case "Immunization":
                return viewMode === "ENTRY"
                    ? <Immunization editData={editData} setEditData={setEditData} />
                    : <ImmunizationSearch onEdit={handleEdit} />;
            case "HealthSafety":
                return viewMode === "ENTRY"
                    ? <HealthSafetyTraining editData={editData} setEditData={setEditData} />
                    : <HealthSafetyTrainingSearch onEdit={handleEdit} />;
            case "Incidents":
                return viewMode === "ENTRY"
                    ? <Incidents editData={editData} setEditData={setEditData} />
                    : <IncidentSearch onEdit={handleEdit} />;
            case "NeedleStickInjury":
                return viewMode === "ENTRY"
                    ? <NeedleStickInjury editData={editData} setEditData={setEditData} />
                    : <NeedleStickInjurySearch onEdit={handleEdit} />;
            case "Grievance":
                return viewMode === "ENTRY"
                    ? <Grievance editData={editData} setEditData={setEditData} />
                    : <GrievanceSearch onEdit={handleEdit} />;
            case "Diversity":
                return viewMode === "ENTRY"
                    ? <DiversityInclusion editData={editData} setEditData={setEditData} />
                    : <DiversityInclusionSearch onEdit={handleEdit} />;
            case "CSR":
                return viewMode === "ENTRY"
                    ? <CSR editData={editData} setEditData={setEditData} />
                    : <CSRSearch onEdit={handleEdit} />;
            
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
                        className="d-flex flex-wrap align-items-center justify-content-between w-100"
                        style={{ gap: "8px" }}
                    >
                        {/* Left: module tab buttons */}
                        <div className="d-flex flex-wrap" style={{ gap: "5px" }}>
                            {tabs.map((tab) => (
                                <CustomButton
                                    key={tab.id}
                                    text={tab.label}
                                    onClick={() => handleTabChange(tab.id)}
                                    disabled={activeTab === tab.id}
                                />
                            ))}
                        </div>

                        {/* Right: Entry / Records toggle (mirrors EnvironmentalDataManagement) */}
                        <div className="d-flex flex-nowrap" style={{ gap: "5px" }}>
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
                    </div>
                }
            />

            <div className="row px-0 bg-white m-0">
                <div className="col-12">
                    {renderContent()}
                </div>
            </div>
        </>
    );
};

export default SocialDataManagement;
