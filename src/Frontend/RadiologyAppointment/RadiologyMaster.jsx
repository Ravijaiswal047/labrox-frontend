import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import Heading from "../../components/UI/Heading";
import CustomTabs from "../../components/UI/CustomTabs";
import SlotBifurcation from "./SlotBifurcation";
import CoordinatorDashboard from "./CoordinatorDashboard";
import CoordinatorReport from "./CoordinatorReport";

// Split out of CombineRadiologyMaster.jsx — these three tabs (Slot
// Bifurcation, Coordinator Dashboard, Coordinator Report) moved here so
// they're a page of their own instead of living alongside the machine/slot
// config tabs. Same CustomTabs + searchable-tabs pattern as
// CombineRadiologyMaster.jsx, just a different tab set.
export default function RadiologyMaster() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState("SlotBifurcation");
  const [searchQuery, setSearchQuery] = useState("");

  const tabs = [
    { id: "SlotBifurcation",      label: t("Slot Bifurcation"),      content: <SlotBifurcation /> },
    { id: "CoordinatorDashboard", label: t("Coordinator Dashboard"), content: <CoordinatorDashboard /> },
    { id: "CoordinatorReport",    label: t("Coordinator Report"),    content: <CoordinatorReport /> },
  ];

  const filteredTabs = tabs.filter((tab) =>
    tab.label.toLowerCase().includes(searchQuery.toLowerCase())
  );

  useEffect(() => {
    if (!filteredTabs.find((tab) => tab.id === activeTab)) {
      setActiveTab(filteredTabs[0]?.id || "");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filteredTabs, activeTab]);

  return (
    <div className="card">
      <Heading
        isBreadcrumb={true}
        name={t("Radiology Master")}
        secondTitle={
          <div className="search-container">
            <input
              className="search-menu-container"
              type="text"
              placeholder={t("Search Tabs")}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <i className="fa fa-search"></i>
          </div>
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
