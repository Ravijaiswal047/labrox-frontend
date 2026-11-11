import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";
import Loading from "../../components/loader/Loading";
import Heading from "../../components/UI/Heading";
import CustomTabs from "../../components/UI/CustomTabs";
import TATMIS from "./TATMIS";
import SampleRejectionReport from "./SampleRejectionReport";
import HistoryReport from "./HistoryReport";
import HoldReport from "./HoldReport";
import PricksReport from "./PricksReport";
import RemarkReport from "./RemarkReport";
import SNRReport from "./SNRReport";
import SampleTransfer from "./SampleTransfer";
import LabObservationAnalysisReport from "./LabObservationAnalysisReport";
import LabApprovalReport from "./LabApprovalReport";
import ImpressionReport from "./ImpressionReport";
import UnApprovedReport from "./UnApprovedReport";
import CriticalLabReport from "./CriticalLabReport";
import AbnormalLabReport from "./AbnormalLabReport";
import RerunMis from "./RerunMis";
import MicroDataReport from "./MicroDataReport";
import ReportingStatus from "./ReportingStatus";
import OutsourceMIS from "./OutsourceMIS";
import ResultReport from "./ResultReport";
import ResultAmendmentReport from "./ResultAmendmentReport";
import DemographicChangeReport from "./DemographicChangeReport";
import { useLocalStorage } from "../../utils/hooks/useLocalStorage";
import { axiosInstance } from "../../utils/axiosInstance";
import CallLogReport from "./CallLogReport";
import InfectionControlReport from "./InfectionControlReport";
import NumericChangeLogReport from "./NumericChangeLogReport";
import CriticalCallDetailReport from "./CriticalCallDetailReport";
import CriticalCallSummaryReport from "./CriticalCallSummaryReport";
import "./CombineLabReport.css";

export default function CombineLabReport() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [allowedReportIds, setAllowedReportIds] = useState([]);
  const [accessLoading, setAccessLoading] = useState(true);


  const userData = useLocalStorage("userData", "get");
  const designationId = userData?.DesignationId || 0;



  const COMBINE_REPORT_ID = 1;

  const tabs = [
    { id: "SampleRejectionReport", label: t("Sample Rejection Report"), reportId: 6, content: <SampleRejectionReport /> },
    { id: "SNRReport", label: t("SNR Report"), reportId: 7, content: <SNRReport /> },
    { id: "Tatmis", label: t("TAT MIS"), reportId: 8, content: <TATMIS /> },
    { id: "HistoryReport", label: t("History Report"), reportId: 9, content: <HistoryReport /> },
    { id: "HoldReport", label: t("Hold Report"), reportId: 10, content: <HoldReport /> },
    { id: "PricksRemarkReport", label: t("Pricks Remark Report"), reportId: 11, content: <PricksReport /> },
    { id: "UnApprovedReport", label: t("UnApproved Report"), reportId: 12, content: <UnApprovedReport /> },
    { id: "SampleRemarkReport", label: t("Sample Remark Report"), reportId: 13, content: <RemarkReport /> },
    { id: "SampleTransferReport", label: t("Sample Transfer Report"), reportId: 14, content: <SampleTransfer /> },
    { id: "LabObservationAnalysisReport", label: t("Lab Observation Analysis Report"), reportId: 15, content: <LabObservationAnalysisReport /> },
    { id: "LabApprovalReport", label: t("Lab Approval Report"), reportId: 16, content: <LabApprovalReport /> },
    { id: "ImpressionReport", label: t("Impression Report"), reportId: 17, content: <ImpressionReport /> },
    { id: "CriticalLabReport", label: t("Critical Lab Report"), reportId: 18, content: <CriticalLabReport /> },
    { id: "AbnormalLabReport", label: t("Abnormal Lab Report"), reportId: 19, content: <AbnormalLabReport /> },
    { id: "RerunMis", label: t("ReRun MIS"), reportId: 20, content: <RerunMis /> },
    { id: "Reportingstatus", label: t("Reporting Status"), reportId: 21, content: <ReportingStatus /> },
    { id: "MicroDataReport", label: t("Micro Data Report"), reportId: 22, content: <MicroDataReport /> },
    { id: "OutSourceMIS", label: t("Out Source MIS"), reportId: 23, content: <OutsourceMIS /> },
    { id: "ResultReport", label: t("Result Report"), reportId: 24, content: <ResultReport /> },
    // { id: "ResultAmendmentReport", label: t("Result Amendment Report"), reportId: 25, content: <ResultAmendmentReport /> },
    { id: "DemographicChangeReport", label: t("Demographic change Report"), reportId: 26, content: <DemographicChangeReport /> },
    { id: "CallLogReport", label: t("Call Log Report"), reportId: 27, content: <CallLogReport /> },
    { id: "NumericChangeLogReport", label: t("Result Amendment"), reportId: 51, content: <NumericChangeLogReport /> },
    { id: "CriticalCallDetailReport", label: t("Critical Call Detail Report"), reportId: 53, content: <CriticalCallDetailReport /> },
    { id: "CriticalCallSummaryReport", label: t("Critical Call Summary Report"), reportId: 54, content: <CriticalCallSummaryReport /> },
    { id: "InfectionControlReport", label: t("Infection Control Report"), reportId: 28, content: <InfectionControlReport /> },
  ];
// comment 
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
          console.log("Allowed Report IDs:", mapped);
        setAllowedReportIds([...mapped, 27, 28, 51, 53, 54]);
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
    <div className="card shadow mb-4 p-2 clr-wrapper">
      <Heading
        isBreadcrumb={true}
        name={t("Combine Lab Report")}
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