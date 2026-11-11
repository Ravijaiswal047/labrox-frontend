// 1. React and hooks
import React, { useEffect, useState } from "react";

// 2. External libraries
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";
import moment from "moment";

// 3. Shared components
import Accordion from "@components/UI/Accordion";
import Tables from "@components/UI/customTable";
import CustomTabs from "@components/UI/CustomTabs";
import DatePicker from "@components/formComponent/DatePicker";
import ReactSelect from "@components/formComponent/ReactSelect";
import { SearchButton, CancelButton, CustomButton } from "@components/UI/CustomButton";

// 4. Utils
import { axiosInstance } from "@app/utils/axiosInstance";
import { useLocalStorage } from "@app/utils/hooks/useLocalStorage";

// 5. Local constants
import { STATUS_BADGE_MAP, PRIORITY_BADGE_MAP, getSlaStatus } from "../ticketConstants";

const ALL_CENTRES_OPTION = { label: "All Centres", value: 0 };
const INITIAL_FILTER = { FromDate: new Date(), ToDate: new Date(), CentreID: 0 };

const MISReport = () => {
  const [t] = useTranslation();
  const theme = useLocalStorage("theme", "get");

  const [filter, setFilter] = useState(INITIAL_FILTER);
  const [misTab, setMisTab] = useState("summary");
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const [centreOptions, setCentreOptions] = useState([ALL_CENTRES_OPTION]);
  const [summaryData, setSummaryData] = useState([]);
  const [slaData, setSlaData] = useState([]);
  const [escalationData, setEscalationData] = useState([]);
  const [userPerfData, setUserPerfData] = useState([]);
  const [userNameMap, setUserNameMap] = useState({});

  useEffect(() => {
    axiosInstance
      .post("Ticketing/GetAssignableUsers", { CategoryID: 0, CentreID: 0 })
      .then((res) => {
        const users = res?.data?.message || [];
        setUserNameMap(Object.fromEntries(users.map((u) => [u.value, u.label])));
      })
      .catch(() => {});
    axiosInstance
      .get("Centre/getAccessCentres")
      .then((res) => {
        const list = (res?.data?.message || []).map((c) => ({
          label: c.Centre,
          value: c.CentreID,
        }));
        setCentreOptions([ALL_CENTRES_OPTION, ...list]);
      })
      .catch(() => {});
  }, []);

  const handleFilterDate = (value, name) => setFilter((p) => ({ ...p, [name]: value }));
  const handleFilterSelect = (name, option) =>
    setFilter((p) => ({ ...p, [name]: option?.value ?? 0 }));

  const handleGenerateReport = () => {
    const payload = {
      FromDate: filter.FromDate ? moment(filter.FromDate).format("YYYY-MM-DD") : "",
      ToDate: filter.ToDate ? moment(filter.ToDate).format("YYYY-MM-DD") : "",
      CentreID: filter.CentreID || 0,
    };
    setIsLoading(true);
    Promise.all([
      axiosInstance.post("Ticketing/GetMISSummary", payload),
      axiosInstance.post("Ticketing/GetMISSLAReport", payload),
      axiosInstance.post("Ticketing/GetMISEscalationReport", payload),
      axiosInstance.post("Ticketing/GetMISUserPerformance", payload),
    ])
      .then(([sumRes, slaRes, escRes, perfRes]) => {
        const toArr = (v) => (Array.isArray(v) ? v : []);
        setSummaryData(toArr(sumRes?.data?.message));
        setSlaData(toArr(slaRes?.data?.message));
        setEscalationData(toArr(escRes?.data?.message));
        setUserPerfData(toArr(perfRes?.data?.message));
        setHasSearched(true);
      })
      .catch((err) => {
        toast.error(err?.response?.data?.message || t("Failed to generate report"));
      })
      .finally(() => setIsLoading(false));
  };

  const handleClearFilter = () => {
    setFilter(INITIAL_FILTER);
    setSummaryData([]);
    setSlaData([]);
    setEscalationData([]);
    setUserPerfData([]);
    setHasSearched(false);
  };

  const emptyRow = (cols, msg) => (
    <tr>
      <td colSpan={cols} className="text-center text-muted py-3" style={{ fontSize: 13 }}>
        {hasSearched ? t(msg || "No data") : t("Click Generate Report to load data")}
      </td>
    </tr>
  );

  // ─── Tab content ─────────────────────────────────────────────────
  const SummaryTab = () => (
    <div className="p-2">
      {/* <div className="d-flex justify-content-between align-items-center mb-2">
        <span className="tk-metric-chip tk-metric-chip-blue">
          <i className="bi bi-ticket-perforated" style={{ fontSize: 13 }} />
          <strong>{summaryData.length}</strong> {t("tickets total")}
        </span>
        <CustomButton text={t("Export")} icon="excel" variant="success" />
      </div> */}
      <Tables>
        <thead>
          <tr>
            <th>{t("Ticket ID")}</th>
            <th>{t("Category")}</th>
            <th>{t("Subcategory")}</th>
            <th>{t("Patient")}</th>
            <th>{t("Priority")}</th>
            <th>{t("Status")}</th>
            <th>{t("TAT (min)")}</th>
            <th>{t("Elapsed (min)")}</th>
            <th>{t("Created")}</th>
            <th>{t("Resolved")}</th>
          </tr>
        </thead>
        <tbody>
          {summaryData.length > 0 ? summaryData.map((tkt, i) => (
            <tr key={i}>
              <td>
                <span className="tk-ticket-id">
                  <i className="bi bi-ticket-perforated" style={{ fontSize: 11 }} />
                  {tkt.TicketNo}
                </span>
              </td>
              <td>{tkt.CategoryName}</td>
              <td>{tkt.SubcategoryName || "—"}</td>
              <td>{tkt.PatientName}</td>
              <td><span className={PRIORITY_BADGE_MAP[tkt.Priority]}>{t(tkt.Priority)}</span></td>
              <td><span className={STATUS_BADGE_MAP[tkt.Status]}>{t(tkt.Status)}</span></td>
              <td>{tkt.TAT_Minutes}</td>
              <td>{tkt.ElapsedMinutes}</td>
              <td style={{ fontSize: 11 }}>
                {tkt.CreatedDate ? moment(tkt.CreatedDate?.value ?? tkt.CreatedDate).format("DD-MMM-YY HH:mm") : "—"}
              </td>
              <td style={{ fontSize: 11 }}>
                {tkt.ResolvedDate ? moment(tkt.ResolvedDate?.value ?? tkt.ResolvedDate).format("DD-MMM-YY HH:mm") : "—"}
              </td>
            </tr>
          )) : emptyRow(10)}
        </tbody>
      </Tables>
    </div>
  );

  const SlaTab = () => {
    const breached = slaData.filter((d) => d.SLA_Status === "Breached").length;
    return (
      <div className="p-2">
        <div className="d-flex justify-content-between align-items-center mb-2">
          <span className="tk-metric-chip tk-metric-chip-red">
            <i className="bi bi-clock-history" style={{ fontSize: 13 }} />
            <strong>{breached}</strong> {t("SLA Breached")}
          </span>
          <CustomButton text={t("Export")} icon="excel" variant="success" />
        </div>
        <Tables>
          <thead>
            <tr>
              <th>{t("Ticket ID")}</th>
              <th>{t("Category")}</th>
              <th>{t("Priority")}</th>
              <th>{t("Status")}</th>
              <th>{t("TAT (min)")}</th>
              <th>{t("Elapsed (min)")}</th>
              <th>{t("SLA %")}</th>
              <th>{t("SLA Status")}</th>
            </tr>
          </thead>
          <tbody>
            {slaData.length > 0 ? [...slaData]
              .sort((a, b) => (b.SLA_Pct || 0) - (a.SLA_Pct || 0))
              .map((tkt, i) => {
                const sla = getSlaStatus(tkt.ElapsedMinutes, tkt.TAT_Minutes);
                const pct = tkt.SLA_Pct ?? Math.min(100, Math.round((tkt.ElapsedMinutes / tkt.TAT_Minutes) * 100));
                return (
                  <tr key={i}>
                    <td>
                      <span className="tk-ticket-id">
                        <i className="bi bi-ticket-perforated" style={{ fontSize: 11 }} />
                        {tkt.TicketNo}
                      </span>
                    </td>
                    <td>{tkt.CategoryName}</td>
                    <td><span className={PRIORITY_BADGE_MAP[tkt.Priority]}>{t(tkt.Priority)}</span></td>
                    <td><span className={STATUS_BADGE_MAP[tkt.Status]}>{t(tkt.Status)}</span></td>
                    <td>{tkt.TAT_Minutes}</td>
                    <td>{tkt.ElapsedMinutes}</td>
                    <td style={{ minWidth: 90 }}>
                      <div className="tk-sla-bar">
                        <div className="tk-sla-bar-fill" style={{ width: `${pct}%`, background: sla.barColor }} />
                      </div>
                      <span style={{ fontSize: 10 }}>{pct}%</span>
                    </td>
                    <td><span className={sla.cls}>{t(tkt.SLA_Status || sla.label)}</span></td>
                  </tr>
                );
              }) : emptyRow(8)}
          </tbody>
        </Tables>
      </div>
    );
  };

  const EscalationTab = () => (
    <div className="p-2">
      <div className="d-flex justify-content-between align-items-center mb-2">
        <span className="tk-metric-chip tk-metric-chip-red">
          <i className="bi bi-exclamation-triangle-fill" style={{ fontSize: 13 }} />
          <strong>{escalationData.length}</strong> {t("Escalated Tickets")}
        </span>
        <CustomButton text={t("Export")} icon="excel" variant="success" />
      </div>
      {escalationData.length === 0 ? (
        <div className="text-center text-muted py-3" style={{ fontSize: 13 }}>
          {hasSearched ? t("No escalated tickets") : t("Click Generate Report to load data")}
        </div>
      ) : (
        <Tables>
          <thead>
            <tr>
              <th>{t("Ticket ID")}</th>
              <th>{t("Category")}</th>
              <th>{t("Priority")}</th>
              <th>{t("Current Level")}</th>
              <th>{t("Escalation Level")}</th>
              <th>{t("Escalated Date")}</th>
            </tr>
          </thead>
          <tbody>
            {escalationData.map((tkt, i) => (
              <tr key={i}>
                <td>
                  <span className="tk-ticket-id">
                    <i className="bi bi-ticket-perforated" style={{ fontSize: 11 }} />
                    {tkt.TicketNo}
                  </span>
                </td>
                <td>{tkt.CategoryName}</td>
                <td><span className={PRIORITY_BADGE_MAP[tkt.Priority]}>{t(tkt.Priority)}</span></td>
                <td><span className="tk-badge tk-status-escalated">{tkt.CurrentEscalationLevel || "—"}</span></td>
                <td><span className="tk-badge tk-status-escalated">{tkt.EscalationLevel}</span></td>
                <td style={{ fontSize: 11 }}>
                  {tkt.EscalatedDate ? moment(tkt.EscalatedDate).format("DD-MMM-YY HH:mm") : "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </Tables>
      )}
    </div>
  );

  const UserPerfTab = () => (
    <div className="p-2">
      <div className="d-flex justify-content-between align-items-center mb-2">
        <span className="tk-metric-chip tk-metric-chip-muted">
          <i className="bi bi-people-fill" style={{ fontSize: 13 }} />
          <strong>{userPerfData.length}</strong> {t("users")}
        </span>
        <CustomButton text={t("Export")} icon="excel" variant="success" />
      </div>
      <Tables>
        <thead>
          <tr>
            <th>{t("User")}</th>
            <th>{t("Total Assigned")}</th>
            <th>{t("Resolved")}</th>
            <th>{t("Escalated")}</th>
            <th>{t("Avg Elapsed (min)")}</th>
            <th>{t("Resolution Rate")}</th>
          </tr>
        </thead>
        <tbody>
          {userPerfData.length > 0 ? userPerfData.map((row, i) => {
            const rate = row.ResolutionRate_Pct ?? 0;
            const barColor = rate >= 80 ? "#22c55e" : rate >= 50 ? "#f59e0b" : "#ef4444";
            return (
              <tr key={i}>
                <td style={{ fontWeight: 700 }}>{userNameMap[row.UserID] || `User ${row.UserID}`}</td>
                <td>{row.TotalAssigned}</td>
                <td>{row.Resolved}</td>
                <td>{row.Escalated}</td>
                <td>{row.AvgElapsedMinutes}m</td>
                <td style={{ minWidth: 100 }}>
                  <div className="tk-sla-bar" style={{ height: 8 }}>
                    <div className="tk-sla-bar-fill" style={{ width: `${rate}%`, background: barColor }} />
                  </div>
                  <span style={{ fontSize: 11, fontWeight: 700, color: barColor }}>{rate}%</span>
                </td>
              </tr>
            );
          }) : emptyRow(6)}
        </tbody>
      </Tables>
    </div>
  );

  const misTabs = [
    { id: "summary",    label: t("Summary"),          content: <SummaryTab /> },
    { id: "sla",        label: t("SLA Report"),        content: <SlaTab /> },
    { id: "escalation", label: t("Escalation"),        content: <EscalationTab /> },
    { id: "user_perf",  label: t("User Performance"),  content: <UserPerfTab /> },
  ];

  return (
    <div className={`${theme}`}>
      {/* Filter */}
      <Accordion title="Report Filter" defaultValue={true}>
        <div className="card-body" style={{ paddingTop: 10, paddingBottom: 10 }}>
          <div className="row align-items-end">
            <div className="col-12 col-sm-6 col-md-2 my-1">
            <DatePicker
              id="fromDate" name="FromDate" lable="From Date"
              className="custom-calendar"
              value={filter.FromDate} onChange={handleFilterDate}
             
            />
            </div>  
            <div className="col-12 col-sm-6 col-md-2 my-1 ">
            <DatePicker
              id="toDate" name="ToDate" lable="To Date"
              className="custom-calendar"
              value={filter.ToDate} onChange={handleFilterDate}
            
            />
            </div>
            <div className="col-12 col-sm-6 col-md-2 my-1">
            <ReactSelect
              id="centreId" name="CentreID" placeholderName="Centre"
              value={filter.CentreID} dynamicOptions={centreOptions}
              onChange={handleFilterSelect} 
            />
            </div>
            <div className="col-12 col-sm-6 col-md-2 my-1 d-flex gap-1 align-items-end pb-1">
              <SearchButton
                text={isLoading ? t("Loading...") : t("Generate Report")}
                onClick={handleGenerateReport}
                disabled={isLoading}
              />
              <CancelButton text={t("Clear")} onClick={handleClearFilter} className="ml-2" />
            </div>
          </div>
        </div>
      </Accordion>

      {/* MIS Tabs — flush, no card-body padding */}
      <Accordion title="MIS Reports" defaultValue={true}>
        <div style={{ padding: 0 }}>
          {isLoading ? (
            <div className="text-center py-4">
              <span className="spinner-border spinner-border-sm me-2" />
              {t("Generating report...")}
            </div>
          ) : (
            <CustomTabs tabs={misTabs} activeTab={misTab} onSelect={setMisTab} />
          )}
        </div>
      </Accordion>
    </div>
  );
};

export default MISReport;
