import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import Heading from "../../components/UI/Heading";
import CustomTabs from "../../components/UI/CustomTabs";
import DepartmentModalityMIS from "./DepartmentModalityMIS";

// Its own standalone tabbed page (separate from CombineRadiologyMaster.jsx),
// so MIS/reporting tabs live here rather than mixed in with the master-data
// tabs on the other page. Add further MIS report tabs to this `tabs` array
// the same way departmentModalityMIS is wired in below.
export default function ModalityMasterMIS() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState("departmentModalityMIS");
  const [searchQuery, setSearchQuery] = useState("");

  const tabs = [
    { id: "departmentModalityMIS", label: t("Department Modality MIS"), content: <DepartmentModalityMIS /> },
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
        name={t("Modality Master MIS")}
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
