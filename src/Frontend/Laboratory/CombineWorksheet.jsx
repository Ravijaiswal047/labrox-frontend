import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import Heading from "../../components/UI/Heading";
import CustomTabs from "../../components/UI/CustomTabs";
import LabWorksheetReport from "./LabWorksheetReport";
import HistoWorksheet from "./HistoWorkSheet";
import DepartmentWisePendingList from "./DepartmentWisePendingList";

export default function CombineWorksheet() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState("LabWorksheet");

  const tabs = [
    {
      id: "LabWorksheet",
      label: t("Lab Worksheet"),
      content: <LabWorksheetReport />,
    },
    {
      id: "HistoWorksheet",
      label: t("Histo Worksheet"),
      content: <HistoWorksheet />,
    },
    {
      id: "DepartmentWiseItemList",
      label: t("Technician Pending List"),
      content: <DepartmentWisePendingList />,
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
    <div className="card shadow mb-4 cw-wrapper">
      <Heading
        isBreadcrumb={true}
        name={t("Combine Worksheet")}
        secondTitle={
          <>
            <div className="search-container ms-auto">
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
