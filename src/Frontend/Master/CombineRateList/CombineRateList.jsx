import React, { useEffect, useState } from "react";
import moment from "moment";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";
import Heading from "../../../components/UI/Heading";
import CustomTabs from "../../../components/UI/CustomTabs";
import RateList from "../RateList";
import RateTypeShareMaster from "../RateTypeShareMaster";
import ScheduleRate from "./ScheduleRate";



export default function CombineRateList() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState("RateList");
  const [searchQuery, setSearchQuery] = useState("");

  const tabs = [
    { id: "RateList", label: t("Rate List"), content: <RateList/> },
    { id: "ShareMaster", label: t("Share Master"), content: <RateTypeShareMaster/> },
    { id: "ScheduleRate", label: t("Schedule Rate"), content: <ScheduleRate/> },
  

  ];

  const filteredTabs = tabs.filter(tab =>
    tab.label.toLowerCase().includes(searchQuery.toLowerCase())
  );

  useEffect(() => {
    if (!filteredTabs.find(tab => tab.id === activeTab)) {
      setActiveTab(filteredTabs[0]?.id || "");
    }
  }, [filteredTabs, activeTab]);

  return (
    <div className="card ">
     
      <Heading isBreadcrumb={true} name={t("Combine Rate List")}
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
        tabs={filteredTabs}
        activeTab={activeTab}
        onSelect={(k) => setActiveTab(k)}
      />
    </div>
  );
}
