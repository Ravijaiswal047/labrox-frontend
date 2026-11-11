import React, { useEffect, useState } from "react";
import moment from "moment";
import { toast } from "react-toastify";
import DatePicker from "../../components/formComponent/DatePicker";
import Input from "../../components/formComponent/Input";
import { SelectBox } from "../../components/formComponent/SelectBox";
import Loading from "../../components/loader/Loading";
import Accordion from "../../components/UI/Accordion";
import { useLocation, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Heading from "../../components/UI/Heading";
import Report from "../Reports/Report";
import CustomTabs from "../../components/UI/CustomTabs";
import CombineLogReport from "./CombineLogReport";
import RejectedDoctorList from "./RejectedDoctorList";
import NumericResultChange from "./NumericResultChange";

export default function CombineLabReport() {
    const { t } = useTranslation();
    const [activeTab, setActiveTab] = useState("LogReport");

    const tabs = [
        {
            id: "CombineLogReport",
            label: t("Log Report"),
            content: <CombineLogReport />,
        },
         {
            id: "RejectedDoctorList",
            label: t("Rejected Doctor List"),
            content: <RejectedDoctorList />,
        },
           {
            id: "NumericResultChange",
            label: t("Numeric Result Change"),
            content: <NumericResultChange />,
        },
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
                name={t("Combine Log Report")}
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
