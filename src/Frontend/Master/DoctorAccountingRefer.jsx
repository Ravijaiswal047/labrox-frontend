import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import Heading from "../../components/UI/Heading";
import CustomTabs from "../../components/UI/CustomTabs";
import DoctorShareMaster from "./DoctorShareMaster";
import DoctorMisReportPage from "./DoctorMisReportPage";
import ReferalDoctorShareUpdate from "../InHouseDoctor/ReferalDoctorShareUpdate";

export default function DoctorAccountingRefer() {
    const { t } = useTranslation();
    const [activeTab, setActiveTab] = useState("DoctorShareMaster");

    const tabs = [
        { id: "DoctorShareMaster", label: t("Share Master"), content: <DoctorShareMaster /> },
        { id: "ReferalDoctorShareUpdate", label: t("Update Share"), content: <ReferalDoctorShareUpdate /> },
        { id: "DoctorMisReportPage", label: t("Calculate Share"), content: <DoctorMisReportPage /> },
    ];

    const [searchQuery, setSearchQuery] = useState("");
    const filteredTabs = tabs.filter((tab) =>
        tab.label.toLowerCase().includes(searchQuery.toLowerCase()),
    );

    useEffect(() => {
        if (!filteredTabs.find((tab) => tab.id === activeTab)) {
            setActiveTab(filteredTabs[0]?.id || "");
        }
    }, [filteredTabs, activeTab]);

    return (
        // <div className="card shadow mb-4 p-2">
        //   <Heading isBreadcrumb={true} name={t("Combine Lab Report")} />
        <div className="card shadow mb-4 p-2">
            <Heading
                isBreadcrumb={true}
                name={t("Doctor Accounting Refer")}
                secondTitle={
                    <>
                        <div className="search-container ">
                            <input
                                className="search-menu-container"
                                type="text"
                                placeholder={t("Search Tabs")}
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                            <i className="fa fa-search"></i>
                        </div>
                    </>
                }
            />

            <CustomTabs
                // tabs={tabs}
                tabs={filteredTabs}
                activeTab={activeTab}
                onSelect={(k) => setActiveTab(k)}
            />
        </div>
    );
}
