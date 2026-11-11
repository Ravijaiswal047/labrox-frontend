import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";
import Heading from "../../components/UI/Heading";
import CustomTabs from "../../components/UI/CustomTabs";
import Loading from "../../components/loader/Loading";
import PatientInformationReport from "./PatientInformationReport";
import CustomReport from "./CustomReport";
import ClientWiseBusinessReport from "./ClientWiseBusinessReport";
import DailyOsReport from "./DailyOsReport";
import AgingReport from "./AgingReport";
import DiscountReport from "./DiscountReport";
import LabInvestigationReport from "./LabInvestigationReport";
import CombineSampleTransferReport from "./CombineSampleTransferReport";
import DoctorWiseListReport from "./DoctorWiseListReport";
import DepartmentWiseBussinessReport from "./DepartmentWiseBussinessReport";
import { useLocalStorage } from "../../utils/hooks/useLocalStorage";
import { axiosInstance } from "../../utils/axiosInstance";
import IdealClientReport from "./IdealClientReport";
import GrowthReport from "./GrowthReport";
import B2BClientwiseBusinessReport from "../Reports/B2BClientwiseBusinessReport";
import CombineCompleteMappingReport from "./CombineCompleteMappingReport";

export default function CombineBusinessReport() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [allowedReportIds, setAllowedReportIds] = useState([]);
  const [accessLoading, setAccessLoading] = useState(true); // TEMP: was true

  const userData = useLocalStorage("userData", "get");
  const designationId = userData?.DesignationId || 0;

  const COMBINE_REPORT_ID = 4; // Combine Business Report

  const tabs = [
    { id: "PatientInfoReport",             label: t("Patient Information Report"),        reportId: 37, content: <PatientInformationReport /> },
    { id: "CustomReport",                  label: t("Patient Custom Report"),             reportId: 38, content: <CustomReport /> },
    { id: "ClientWiseBusinessReport",      label: t("Client Wise Business Report"),       reportId: 39, content: <ClientWiseBusinessReport id="clientwisebusinessreport" /> },
    { id: "DailyOsReport",                 label: t("Daily Os Report"),                   reportId: 40, content: <DailyOsReport /> },
    { id: "AgingReport",                   label: t("Cash Aging Report"),                 reportId: 41, content: <AgingReport /> },
    { id: "DiscountReport",                label: t("Discount Report"),                   reportId: 42, content: <DiscountReport /> },
    { id: "LabInvestigationReport",        label: t("Lab Investigation Report"),          reportId: 43, content: <LabInvestigationReport /> },
    { id: "SampleTransferReport",          label: t("Sample Transfer Report (Accounts)"), reportId: 44, content: <CombineSampleTransferReport /> },
    { id: "DoctorWiseListReport",          label: t("Doctor Wise List Report"),           reportId: 45, content: <DoctorWiseListReport /> },
    { id: "DepartmentWiseBussinessReport", label: t("Department Wise Business Report"),   reportId: 46, content: <DepartmentWiseBussinessReport /> },
    { id: "IdealClientReport",            label: t(" Ideal Client Report"),               reportId: 47, content: <IdealClientReport /> },
     { id: "GrowthReport",                 label: t(" Growth Report"),                    reportId: 48, content: <GrowthReport /> },
     { id: "B2bClientWiseBusinessReport",  label: t("B2B Client wise Business Report"),       reportId: 49,   content: <B2BClientwiseBusinessReport /> },
     { id: "CompleteMappingReport",        label: t("Complete Mapping Report"),               reportId: 50,   content: <CombineCompleteMappingReport /> },

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
  // const accessibleTabs = tabs;

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
    <div className="card shadow mb-4">
      <Heading
        isBreadcrumb={true}
        name={t("Combine Business Report")}
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