import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import Heading from "../../components/UI/Heading";
import CustomTabs from "../../components/UI/CustomTabs";
import CentreDepartmentMaster from "./CentreDepartmentMaster";
import MachineSlotMaster from "./MachineSlotMaster";
import TestSlotDurationMaster from "./TestSlotDurationMaster";
import MachineBreakdown from "./MachineBreakdown";
import BlockSlotMaster from "./BlockSlotMaster";

export default function CombineRadiologyMaster() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState("CentreDepartmentMaster");
  const [searchQuery, setSearchQuery] = useState("");

  const tabs = [
    { id: "CentreDepartmentMaster", label: t("Centre Department Master"), content: <CentreDepartmentMaster /> },
    { id: "MachineSlotMaster",      label: t("Machine & Slot Master"),    content: <MachineSlotMaster /> },
    { id: "TestSlotDurationMaster", label: t("Test Slot Duration Master"), content: <TestSlotDurationMaster /> },
    { id: "MachineBreakdown",       label: t("Machine Breakdown"),        content: <MachineBreakdown /> },
    { id: "BlockSlotMaster",        label: t("Block Slot Master"),        content: <BlockSlotMaster /> },
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
