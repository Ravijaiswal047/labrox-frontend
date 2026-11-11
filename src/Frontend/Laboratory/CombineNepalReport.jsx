import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";
import Heading from "../../components/UI/Heading";
import CustomTabs from "../../components/UI/CustomTabs";
import Loading from "../../components/loader/Loading";
import AnnualPanelReport from "../Nepal/AnnualPanelReport";
import AnnualSalesReport from "../Nepal/AnnualSalesReport";
import NepaliReport from "../Nepal/NepaliReport";
import CollectionReportUser from "../Nepal/CollectionReportUser";
import CollectionReportPanel from "../Nepal/CollectionReportPanel";
import { useLocalStorage } from "../../utils/hooks/useLocalStorage";
import { axiosInstance } from "../../utils/axiosInstance";
import "./CombineNepalReport.css";

export default function CombineNepalReport() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [allowedReportIds, setAllowedReportIds] = useState([]);
  const [accessLoading, setAccessLoading] = useState(true);

  const userData = useLocalStorage("userData", "get");
  const designationId = userData?.DesignationId || 0;

  const COMBINE_REPORT_ID = 2; // Combine Nepal Report

  const tabs = [
    { id: "NepaliReport", label: t("Nepali Report"), reportId: 27, content: <NepaliReport /> },
    // { id: "AnnualPanelReport",     label: t("Annual Panel Report"),          reportId: null /* TODO: not in report table yet */, content: <AnnualPanelReport /> },
    // { id: "AnnualSalesReport",     label: t("Annual Sales Report"),          reportId: null /* TODO */, content: <AnnualSalesReport /> },
    // { id: "CollectionReportUser",  label: t("User Wise Collection Report"),  reportId: null /* TODO */, content: <CollectionReportUser /> },
    // { id: "CollectionReportPanel", label: t("Panel Wise Collection Report"), reportId: null /* TODO */, content: <CollectionReportPanel /> },
  ];

  useEffect(() => {
    if (!designationId) {
      setAccessLoading(false);
      return;
    }
    setAccessLoading(true);
    axiosInstance
      .get(`Menu/GetAccessDesignationByDesignationId?designationId=${designationId}`)
      .then((res) => {
        const data = res?.data?.message || [];
        const mapped = data
          .filter((item) => item.isMapped === 1 && item.combineReportID === COMBINE_REPORT_ID)
          .map((item) => item.reportID);
        setAllowedReportIds(mapped);
      })
      .catch((err) => {
        toast.error(err?.response?.data?.message || "Failed to load report access");
      })
      .finally(() => setAccessLoading(false));
  }, [designationId]);

  const accessibleTabs = tabs.filter((tab) => allowedReportIds.includes(tab.reportId));

  const filteredTabs = accessibleTabs.filter((tab) =>
    tab.label.toLowerCase().includes(searchQuery.toLowerCase())
  );

  useEffect(() => {
    const exists = filteredTabs.some((tab) => tab.id === activeTab);
    if (!exists) {
      setActiveTab(filteredTabs[0]?.id || "");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allowedReportIds, searchQuery]);

  if (accessLoading) return <Loading />;

  return (
    <div className="card shadow mb-4 cnr-wrapper">
      <Heading
        isBreadcrumb={true}
        name={t("Combine Nepal Report")}
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
      {accessibleTabs.length === 0 ? (
        <div className="text-center text-muted py-4">
          {t("No reports assigned for your access")}
        </div>
      ) : (
        <CustomTabs tabs={filteredTabs} activeTab={activeTab} onSelect={(k) => setActiveTab(k)} />
      )}
    </div>
  );
}