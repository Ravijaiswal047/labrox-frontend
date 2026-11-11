import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";
import Heading from "../../components/UI/Heading";
import CustomTabs from "../../components/UI/CustomTabs";
import Loading from "../../components/loader/Loading";
import CollectionRefundReport from "./CollectionRefundReport";
import ModeWiseCollectionReport from "./ModeWiseCollectionReport";
import CollectionWiseReportUserNew from "./CollectionWiseReportUserNew";
import DateWiseCollectionReport from "./DateWiseCollectionReport";
import ReceiptCancelCollectionReport from "./ReceiptCancelCollectionReport";
import SettelementReport from "./SettelementReport";
import OustandingReport from "./OustandingReport";
import MobileWalletReport from "./MobileWalletReport";
import DepartmentDetailReport from "./DepartmentDetailReport";
import { useLocalStorage } from "../../utils/hooks/useLocalStorage";
import { axiosInstance } from "../../utils/axiosInstance";

export default function CombineCollectionReport() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [allowedReportIds, setAllowedReportIds] = useState([]);
  const [accessLoading, setAccessLoading] = useState(true);

  const userData = useLocalStorage("userData", "get");
  const designationId = userData?.DesignationId || 0;

  const COMBINE_REPORT_ID = 3; // Combine Collection Report

  const tabs = [
    { id: "ModeWiseCollectionReport",      label: t("Mode"),              reportId: 28, content: <ModeWiseCollectionReport /> },
    { id: "CollectionRefundReport",        label: t("Refund"),            reportId: 29, content: <CollectionRefundReport /> },
    { id: "CollectionWiseReportUserNew",   label: t("User Wise"),         reportId: 30, content: <CollectionWiseReportUserNew /> },
    { id: "DateWiseCollectionReport",      label: t("Date Wise"),         reportId: 31, content: <DateWiseCollectionReport /> },
    { id: "ReceiptCancelCollectionReport", label: t("Receipt Cancel"),    reportId: 32, content: <ReceiptCancelCollectionReport /> },
    { id: "SettelementReport",             label: t("Settelement"),       reportId: 33, content: <SettelementReport /> },
    { id: "OustandingReport",              label: t("Oustanding"),        reportId: 34, content: <OustandingReport /> },
    { id: "MobileWalletReport",            label: t("Mobile Wallet"),     reportId: 35, content: <MobileWalletReport /> },
    { id: "DepartmentDetailReport",        label: t("Department Detail"), reportId: 36, content: <DepartmentDetailReport /> },
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
    <div className="card shadow mb-4 p-2">
      <Heading
        isBreadcrumb={true}
        name={t("Combine Collection Report")}
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