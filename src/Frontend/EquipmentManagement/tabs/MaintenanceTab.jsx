import React, { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { FaPencilAlt } from "react-icons/fa";
import moment from "moment";
import Heading from "@app/components/UI/Heading";
import CustomTable from "@app/components/Table/CustomTable";
import { CustomButton } from "@app/components/UI/CustomButton";
import { notify } from "@app/utils/utils";
import KpiCard from "./shared/KpiCard";
import BarList from "./shared/BarList";
import Donut from "./shared/Donut";
import SchedulePmModal from "./SchedulePmModal";
import ReportBreakdownModal from "./ReportBreakdownModal";
import TicketDetailModal from "./TicketDetailModal";
import { axiosInstance } from "../../../utils/axiosInstance";
import {
  findEquipment,
  formatApiDate,
  formatDisplayDate,
} from "../equipmentConstants";
import {
  PRIORITY_OPTIONS,
  REPAIR_COST_TREND,
  TICKET_FLOW,
  TICKET_STATUS_COLORS,
  VERIFIED_PASS,
  downtimeHours,
  downtimeLabel,
  pmDaysLeft,
  pmStatus,
  priorityClass,
  ticketBadgeClass,
} from "../maintenanceConstants";

const MaintenanceTab = () => {
  const { t } = useTranslation();

  const [pms, setPms] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [equipmentList, setEquipmentList] = useState([]);

  const [openSections, setOpenSections] = useState({
    pm: true,
    breakdown: true,
    analytics: true,
  });

  const toggleSection = (key) => {
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const [showPmModal, setShowPmModal] = useState(false);
  const [showBdModal, setShowBdModal] = useState(false);
  const [editPm, setEditPm] = useState(null);
  const [openTicketNo, setOpenTicketNo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const kpis = useMemo(() => {
    const totalPm = pms.length;
    const overduePm = pms.filter((p) => pmDaysLeft(p.NextPM) < 0).length;
    const dueSoonPm = pms.filter((p) => {
      const d = pmDaysLeft(p.NextPM);
      return d >= 0 && d <= 7;
    }).length;
    const openTickets = tickets.filter(
      (t) => !["Closed", "Resolved"].includes(t.Status)
    ).length;
    const criticalTickets = tickets.filter(
      (t) => t.Priority === "Critical" && !["Closed", "Resolved"].includes(t.Status)
    ).length;
    return { totalPm, overduePm, dueSoonPm, openTickets, criticalTickets };
  }, [pms, tickets]);

  // ─── Load equipment list ──────────────────────────────────────────────────
  const loadEquipment = async () => {
    try {
      const response = await axiosInstance.post("EquipmentManagement/GetEquipment", {});
      if (response?.data?.success) {
        setEquipmentList(response.data.message || []);
      } else {
        setEquipmentList([]);
      }
    } catch (err) {
      console.error("Failed to load equipment list", err);
      setEquipmentList([]);
    }
  };

  // ─── Load maintenance overview (PMs, Tickets, Analytics) ──────────────────
  const loadMaintenanceData = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.post("EquipmentManagement/GetMaintenanceOverview", {});
      if (response?.data?.success) {
        const data = response.data.message || {};
        const pmList = data.PmSchedules || data.pmSchedules || [];
        const ticketList = data.Tickets || data.tickets || [];
        const analyticsData = data.Analytics || data.analytics || null;

        setPms(pmList);
        setTickets(ticketList);
        setAnalytics(analyticsData);
      } else {
        setPms([]);
        setTickets([]);
        notify(response?.data?.message || t("Failed to load maintenance data"), "error");
      }
    } catch (err) {
      console.error("Failed to load maintenance overview", err);
      setPms([]);
      setTickets([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEquipment();
    loadMaintenanceData();
  }, []);

  const equipmentOptions = useMemo(
    () =>
      equipmentList.map((eq) => ({
        value: eq.EquipmentID,
        label: `${eq.EquipmentCode} — ${eq.EquipmentName}`,
        code: eq.EquipmentCode,
        name: eq.EquipmentName,
      })),
    [equipmentList]
  );

  const openTicket =
    tickets.find(
      (x) =>
        (x.TicketNo && x.TicketNo === openTicketNo) ||
        (x.TicketID && String(x.TicketID) === String(openTicketNo))
    ) || null;

  // ─── PM: Schedule & Complete ──────────────────────────────────────────────
  const handleSavePm = async (form) => {
    setIsSaving(true);
    try {
      const payload = {
        EquipmentID: Number(form.EquipmentID),
        Frequency: form.Frequency,
        NextPM: formatApiDate(form.NextPM),
        LastDone: form.LastDone ? formatApiDate(form.LastDone) : null,
        Engineer: form.Engineer?.trim() || null,
        Checklist: form.Checklist?.trim() || null,
      };
      if (form.PMID) {
        payload.PMID = Number(form.PMID);
      }
      const response = await axiosInstance.post("EquipmentManagement/SavePmSchedule", payload);
      if (response?.data?.success) {
        notify(
          response.data.message ||
            (form.PMID ? t("PM schedule updated successfully") : t("PM scheduled successfully")),
          "success"
        );
        setShowPmModal(false);
        setEditPm(null);
        await loadMaintenanceData();
      } else {
        notify(response?.data?.message || t("Failed to save PM schedule"), "error");
      }
    } catch (err) {
      notify(err?.response?.data?.message || t("Failed to save PM schedule"), "error");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCompletePm = async (pm) => {
    if (!pm?.PMID) {
      notify(t("PM record ID is required"), "error");
      return;
    }

    try {
      const payload = {
        PMID: Number(pm.PMID),
        CompletionDate: moment().format("YYYY-MM-DD"),
        Engineer: pm.Engineer || null,
      };
      const response = await axiosInstance.post("EquipmentManagement/CompletePm", payload);
      if (response?.data?.success) {
        notify(response.data.message || t("PM marked as completed"), "success");
        await loadMaintenanceData();
      } else {
        notify(response?.data?.message || t("Failed to complete PM"), "error");
      }
    } catch (err) {
      notify(err?.response?.data?.message || t("Failed to complete PM"), "error");
    }
  };

  const pmRows = [...pms]
    .sort((a, b) => pmDaysLeft(a.NextPM) - pmDaysLeft(b.NextPM))
    .map((p) => {
      const status = p.Status || pmStatus(p.NextPM);
      const days = p.DaysLeft !== undefined ? p.DaysLeft : pmDaysLeft(p.NextPM);
      const eqName = p.EquipmentName || findEquipment(p.EquipmentCode).Name || p.EquipmentCode;

      return {
        rowColor:
          status === "Overdue" ? "#fef2f2" : status === "Due" ? "#fffbeb" : undefined,
        equipment: (
          <div>
            <div className="em-eq-name">{eqName}</div>
            <div className="em-eq-sub">
              {p.EquipmentCode}
              {p.CentreName ? ` · ${p.CentreName}` : ""}
            </div>
          </div>
        ),
        frequency: p.Frequency,
        lastDone: formatDisplayDate(p.LastDone) || "—",
        nextPm: formatDisplayDate(p.NextPM),
        engineer: p.Engineer || "—",
        checklist: p.Checklist || "—",
        status: (
          <span
            className={
              status === "Overdue"
                ? "em-badge em-badge-outofservice"
                : status === "Due"
                ? "em-badge em-badge-maintenance"
                : "em-badge em-badge-active"
            }
          >
            {status === "Overdue"
              ? `${t("Overdue")} ${Math.abs(days)}d`
              : status === "Due"
              ? `${t("Due in")} ${days}d`
              : t("Scheduled")}
          </span>
        ),
        actions: (
          <div className="em-actions">
            <button
              type="button"
              title={t("Edit")}
              className="em-icon-btn em-icon-edit"
              onClick={() => {
                setEditPm(p);
                setShowPmModal(true);
              }}
            >
              <FaPencilAlt />
            </button>
            {/* <button
              type="button"
              className="btn btn-sm btn-outline-success em-row-btn py-0 px-2"
              style={{ fontSize: "11px", height: "24px" }}
              title={t("Complete PM and schedule next cycle")}
              onClick={() => handleCompletePm(p)}
            >
              {t("Complete")}
            </button> */}
          </div>
        ),
      };
    });



  // ─── Breakdown: Create, Advance & Verify ───────────────────────────────────
  const handleSaveBreakdown = async (form) => {
    setIsSaving(true);
    try {
      const payload = {
        EquipmentID: Number(form.EquipmentID),
        ReportedBy: form.ReportedBy?.trim(),
        Priority: form.Priority,
        Description: form.Description?.trim(),
      };
      const response = await axiosInstance.post(
        "EquipmentManagement/CreateBreakdownTicket",
        payload
      );
      if (response?.data?.success) {
        notify(response.data.message || t("Breakdown ticket created"), "success");
        setShowBdModal(false);
        await loadMaintenanceData();
        if (form.Priority === "Critical") {
          loadEquipment();
        }
      } else {
        notify(response?.data?.message || t("Failed to create breakdown ticket"), "error");
      }
    } catch (err) {
      notify(err?.response?.data?.message || t("Failed to create breakdown ticket"), "error");
    } finally {
      setIsSaving(false);
    }
  };

  const handleAdvance = async (ticket, formData = {}) => {
    const stageIndex = TICKET_FLOW.indexOf(ticket.Status);
    const nextStage = TICKET_FLOW[stageIndex + 1];
    if (!nextStage) return;

    if (nextStage === "Closed" && ticket.Verified !== VERIFIED_PASS) {
      notify(
        t("Return-to-service verification is pending — verify QC before closing (ISO 15189 6.4.5)"),
        "error"
      );
      return;
    }

    if (!ticket?.TicketID) {
      notify(t("Ticket ID is required"), "error");
      return;
    }

    setIsSaving(true);
    try {
      const payload = {
        TicketID: Number(ticket.TicketID),
        NextStatus: nextStage,
        Engineer:
          formData.Engineer !== undefined
            ? formData.Engineer?.trim() || null
            : ticket.Engineer || null,
        Remarks:
          formData.Remarks !== undefined
            ? formData.Remarks?.trim() || null
            : ticket.Remarks || null,
      };
      const response = await axiosInstance.post("EquipmentManagement/AdvanceTicketStage", payload);
      if (response?.data?.success) {
        notify(response.data.message || `${t("Ticket moved to")} ${t(nextStage)}`, "success");
        await loadMaintenanceData();
        if (nextStage === "Closed") {
          loadEquipment();
        }
      } else {
        notify(response?.data?.message || t("Failed to advance ticket"), "error");
      }
    } catch (err) {
      notify(err?.response?.data?.message || t("Failed to advance ticket"), "error");
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdateTicket = async (ticketId, updateData) => {
    if (!ticketId) return;
    setIsSaving(true);
    try {
      const payload = {
        TicketID: Number(ticketId),
        Engineer: updateData.Engineer?.trim() || null,
        Parts: updateData.Parts?.trim() || null,
        Cost:
          updateData.Cost !== "" && updateData.Cost !== null && updateData.Cost !== undefined
            ? Number(updateData.Cost)
            : null,
        Impact: updateData.Impact?.trim() || null,
        Remarks: updateData.Remarks?.trim() || null,
      };
      const response = await axiosInstance.post("EquipmentManagement/UpdateBreakdownTicket", payload);
      if (response?.data?.success) {
        notify(response.data.message || t("Ticket details saved"), "success");
        await loadMaintenanceData();
      } else {
        notify(response?.data?.message || t("Failed to update ticket"), "error");
      }
    } catch (err) {
      notify(err?.response?.data?.message || t("Failed to update ticket"), "error");
    } finally {
      setIsSaving(false);
    }
  };

  const handleVerify = async (ticket) => {
    if (!ticket?.TicketID) {
      notify(t("Ticket ID is required"), "error");
      return;
    }

    setIsSaving(true);
    try {
      const payload = {
        TicketID: Number(ticket.TicketID),
      };
      const response = await axiosInstance.post("EquipmentManagement/VerifyTicketQc", payload);
      if (response?.data?.success) {
        notify(response.data.message || t("Return-to-service verified"), "success");
        await loadMaintenanceData();
      } else {
        notify(response?.data?.message || t("Failed to verify return-to-service"), "error");
      }
    } catch (err) {
      notify(err?.response?.data?.message || t("Failed to verify return-to-service"), "error");
    } finally {
      setIsSaving(false);
    }
  };

  const ticketRows = tickets.map((tk) => {
    const eqName = tk.EquipmentName || findEquipment(tk.EquipmentCode).Name || tk.EquipmentCode;
    const critical = tk.Priority === "Critical" && !["Closed", "Resolved"].includes(tk.Status);

    return {
      rowColor: critical ? "#fef2f2" : undefined,
      no: <span className="em-detail-strong">{tk.TicketNo}</span>,
      equipment: (
        <div>
          <div className="em-eq-name">{eqName}</div>
          <div className="em-eq-sub">
            {tk.EquipmentCode}
            {tk.CentreName ? ` · ${tk.CentreName}` : ""}
          </div>
        </div>
      ),
      issue: tk.Description,
      priority: <span className={priorityClass(tk.Priority)}>{tk.Priority}</span>,
      reported: tk.ReportedAt,
      downtime: tk.DowntimeHours !== undefined ? `${tk.DowntimeHours}h` : downtimeLabel(tk),
      status: <span className={ticketBadgeClass(tk.Status)}>{t(tk.Status)}</span>,
      actions: (
        <button
          type="button"
          className="btn btn-sm btn-outline-primary em-row-btn py-0 px-2"
          onClick={() => setOpenTicketNo(tk.TicketNo || tk.TicketID)}
        >
          {t("Open")}
        </button>
      ),
    };
  });



  // ─── Analytics ────────────────────────────────────────────────────────────
  const statusSegments = useMemo(() => {
    const sc = analytics?.StatusCounts || analytics?.statusCounts;
    if (sc) {
      return [
        { label: t("Reported"), value: Number(sc.Reported ?? sc.reported ?? 0), color: TICKET_STATUS_COLORS["Reported"] },
        { label: t("Assigned"), value: Number(sc.Assigned ?? sc.assigned ?? 0), color: TICKET_STATUS_COLORS["Assigned"] },
        { label: t("In Progress"), value: Number(sc.InProgress ?? sc.inProgress ?? 0), color: TICKET_STATUS_COLORS["In Progress"] },
        { label: t("Resolved"), value: Number(sc.Resolved ?? sc.resolved ?? 0), color: TICKET_STATUS_COLORS["Resolved"] },
        { label: t("Closed"), value: Number(sc.Closed ?? sc.closed ?? 0), color: TICKET_STATUS_COLORS["Closed"] },
      ];
    }
    return TICKET_FLOW.map((stage) => ({
      label: t(stage),
      value: tickets.filter((x) => x.Status === stage).length,
      color: TICKET_STATUS_COLORS[stage],
    }));
  }, [analytics, tickets, t]);

  const priorityRows = useMemo(() => {
    const pc = analytics?.PriorityCounts || analytics?.priorityCounts;
    if (pc) {
      return [
        { label: "Critical", value: Number(pc.Critical ?? pc.critical ?? 0) },
        { label: "High", value: Number(pc.High ?? pc.high ?? 0) },
        { label: "Medium", value: Number(pc.Medium ?? pc.medium ?? 0) },
        { label: "Low", value: Number(pc.Low ?? pc.low ?? 0) },
      ];
    }
    return PRIORITY_OPTIONS.map((p) => ({
      label: p.label,
      value: tickets.filter((x) => x.Priority === p.value).length,
    }));
  }, [analytics, tickets]);

  const costTrendRows = useMemo(() => {
    const rawCostTrend = analytics?.CostTrend || analytics?.costTrend || [];
    const costMap = new Map();
    rawCostTrend.forEach((item) => {
      const ym = item.YearMonth || item.yearMonth;
      const val = Number(item.CostK ?? item.costK ?? 0);
      if (ym) costMap.set(ym, val);
    });

    const months = [];
    for (let i = 5; i >= 0; i--) {
      const m = moment().subtract(i, "months");
      const ym = m.format("YYYY-MM");
      const label = m.format("MMM");
      const value = costMap.get(ym) || 0;
      months.push({
        label,
        value,
        display: `${value}k`,
      });
    }
    return months;
  }, [analytics]);

  const cumulativeDowntimeRows = useMemo(() => {
    const list = analytics?.CumulativeDowntime || analytics?.cumulativeDowntime;
    if (list && list.length > 0) {
      return list.map((item) => {
        const hours = Number(item.TotalHours ?? item.totalHours ?? 0);
        return {
          label: item.EquipmentName || item.equipmentName || item.EquipmentCode || "Instrument",
          value: Math.round(hours),
          display: `${Math.round(hours)}h`,
          danger: hours > 24,
        };
      });
    }

    const byEquipment = new Map();
    tickets.forEach((tk) => {
      const hours =
        tk.DowntimeHours !== undefined ? Number(tk.DowntimeHours) : downtimeHours(tk);
      const code = tk.EquipmentCode || "EQ";
      const name = tk.EquipmentName || findEquipment(code).Name || code;
      byEquipment.set(name, (byEquipment.get(name) || 0) + hours);
    });
    return [...byEquipment.entries()]
      .map(([name, hours]) => ({
        label: name,
        value: Math.round(hours),
        display: `${Math.round(hours)}h`,
        danger: hours > 24,
      }))
      .sort((a, b) => b.value - a.value);
  }, [analytics, tickets]);

  return (
    <div className="em-master">
      {/* ── Top KPI summary cards ────────────────────────────────────── */}
      <div className="em-kpi-row mt-2 mb-3">
        <KpiCard
          tone="neutral"
          value={kpis.totalPm}
          label={t("Total PM Schedules")}
        />
        <KpiCard
          tone="warning"
          value={kpis.dueSoonPm}
          label={t("PM Due ≤7d")}
        />
        <KpiCard
          tone="critical"
          value={kpis.overduePm}
          label={t("PM Overdue")}
        />
        <KpiCard
          tone="neutral"
          value={kpis.openTickets}
          label={t("Open Breakdowns")}
        />
        <KpiCard
          tone="critical"
          value={kpis.criticalTickets}
          label={t("Critical Tickets")}
        />
      </div>

      {/* ── 1. Preventive (PM Schedule) ─────────────────────────────── */}
      <div className="mb-3">
        <Heading
          title={t("Preventive Maintenance")}
          onClick={() => toggleSection("pm")}
          secondTitle={
            <div
              className="em-filter-bar d-flex align-items-center"
              onClick={(e) => e.stopPropagation()}
            >
              <CustomButton
                title={t("Schedule PM")}
                icon="add"
                variant="success"
                onClick={() => {
                  setEditPm(null);
                  setShowPmModal(true);
                }}
              />
            </div>
          }
        />
        {openSections.pm && (
          <div className="mt-1 table_ticket">
            <CustomTable
              disableTooltip={true}
              columns={[
                { header: t("Equipment"), field: "equipment", minWidth: "200px" },
                { header: t("Frequency"), field: "frequency", minWidth: "90px" },
                { header: t("Last Done"), field: "lastDone", minWidth: "110px" },
                { header: t("Next PM"), field: "nextPm", minWidth: "110px" },
                { header: t("Engineer"), field: "engineer", minWidth: "140px" },
                {
                  header: t("Checklist"),
                  field: "checklist",
                  minWidth: "240px",
                  wrapText: true,
                },
                { header: t("Status"), field: "status", minWidth: "120px" },
                { header: t("Action"), field: "actions", minWidth: "130px" },
              ]}
              data={pmRows}
              loading={loading}
            />
          </div>
        )}
      </div>

      {/* ── 2. Breakdown Tickets / Complaints ────────────────────────── */}
      <div className="mb-3">
        <Heading
          title={t("Breakdown Complaints")}
          onClick={() => toggleSection("breakdown")}
          secondTitle={
            <div
              className="em-filter-bar d-flex align-items-center"
              onClick={(e) => e.stopPropagation()}
            >
              <CustomButton
                title={t("Report Breakdown")}
                icon="add"
                variant="success"
                onClick={() => setShowBdModal(true)}
              />
              {/* <span
                className="ms-2 cursor-pointer text-white"
                style={{ fontSize: "14px", marginLeft: "10px", padding: "4px" }}
                title={openSections.breakdown ? t("Collapse") : t("Expand")}
                onClick={(e) => {
                  e.stopPropagation();
                  toggleSection("breakdown");
                }}
              >
                <i
                  className={`fa ${
                    openSections.breakdown ? "fa-chevron-up" : "fa-chevron-down"
                  }`}
                />
              </span> */}
            </div>
          }
        />
        {openSections.breakdown && (
          <div className="mt-1 table_ticket">
            <CustomTable
              disableTooltip={true}
              columns={[
                { header: t("Complaint No."), field: "no", minWidth: "140px" },
                { header: t("Equipment"), field: "equipment", minWidth: "190px" },
                {
                  header: t("Issue"),
                  field: "issue",
                  minWidth: "260px",
                  wrapText: true,
                },
                { header: t("Priority"), field: "priority", minWidth: "90px" },
                { header: t("Reported"), field: "reported", minWidth: "135px" },
                { header: t("Downtime"), field: "downtime", minWidth: "90px" },
                { header: t("Status"), field: "status", minWidth: "110px" },
                { header: "", field: "actions", minWidth: "80px" },
              ]}
              data={ticketRows}
              loading={loading}
            />
          </div>
        )}
      </div>

      {/* ── 3. Maintenance Analytics & Downtime ──────────────────────── */}
      <div className="mb-3">
        <Heading
          title={t("Maintenance Analytics & Downtime")}
          onClick={() => toggleSection("analytics")}
          secondTitle={
            <div
              className="em-filter-bar d-flex align-items-center"
              onClick={(e) => e.stopPropagation()}
            >
              {/* <span
                className="ms-2 cursor-pointer text-white"
                style={{ fontSize: "14px", marginLeft: "10px", padding: "4px" }}
                title={openSections.analytics ? t("Collapse") : t("Expand")}
                onClick={(e) => {
                  e.stopPropagation();
                  toggleSection("analytics");
                }}
              >
                <i
                  className={`fa ${
                    openSections.analytics ? "fa-chevron-up" : "fa-chevron-down"
                  }`}
                />
              </span> */}
            </div>
          }
        />
        {openSections.analytics && (
          <div className="em-analytics mt-2">
            <div className="em-split-3">
              <div className="mainDashboardwrp em-panel">
                <div className="mainBox1">
                  <div className="d-flex flex-wrap mainHeader">
                    <h4>{t("Tickets by Status")}</h4>
                  </div>
                  <Donut segments={statusSegments} caption={t("tickets")} />
                </div>
              </div>

              <div className="mainDashboardwrp em-panel">
                <div className="mainBox1">
                  <div className="d-flex flex-wrap mainHeader">
                    <h4>{t("Tickets by Priority")}</h4>
                  </div>
                  <BarList rows={priorityRows} labelWidth={80} />
                </div>
              </div>

              <div className="mainDashboardwrp em-panel">
                <div className="mainBox1">
                  <div className="d-flex flex-wrap mainHeader">
                    <h4>{t("Repair Cost Trend (₹ ,000)")}</h4>
                  </div>
                  <BarList rows={costTrendRows} labelWidth={54} />
                </div>
              </div>
            </div>

            <div className="mainDashboardwrp em-panel mt-2">
              <div className="mainBox1">
                <div className="d-flex flex-wrap mainHeader">
                  <h4>{t("Cumulative Downtime")}</h4>
                </div>
                <p className="em-detail-empty">
                  {t("Hours per instrument — open tickets counted up to today.")}
                </p>
                <BarList rows={cumulativeDowntimeRows} labelWidth={190} />
              </div>
            </div>
          </div>
        )}
      </div>

      <SchedulePmModal
        visible={showPmModal}
        setVisible={(v) => {
          setShowPmModal(v);
          if (!v) setEditPm(null);
        }}
        onSave={handleSavePm}
        equipmentOptions={equipmentOptions}
        editData={editPm}
        isSaving={isSaving}
      />

      <ReportBreakdownModal
        visible={showBdModal}
        setVisible={setShowBdModal}
        onSave={handleSaveBreakdown}
        equipmentOptions={equipmentOptions}
        isSaving={isSaving}
      />

      <TicketDetailModal
        visible={Boolean(openTicketNo)}
        setVisible={(open) => !open && setOpenTicketNo(null)}
        ticket={openTicket}
        onAdvance={handleAdvance}
        onVerify={handleVerify}
        onUpdate={handleUpdateTicket}
        isSaving={isSaving}
      />
    </div>
  );
};

export default MaintenanceTab;
