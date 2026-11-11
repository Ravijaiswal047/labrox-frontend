import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";
import moment from "moment";

import Accordion from "@components/UI/Accordion";
import Tables from "@components/UI/customTable";
import Input from "@components/formComponent/Input";
import ReactSelect from "@components/formComponent/ReactSelect";
import DatePicker from "@components/formComponent/DatePicker";
import Modal from "@components/formComponent/Modal";
import { SearchButton, SaveButton, CancelButton } from "@components/UI/CustomButton";

import { axiosInstance } from "@app/utils/axiosInstance";
import { useLocalStorage } from "@app/utils/hooks/useLocalStorage";
import { TICKET_STATUSES, TICKET_PRIORITIES, getSlaStatus } from "../ticketConstants";

// ── Inline style constants (immune to global CSS) ──────────────────────────
const PRIORITY_STYLE = {
  Critical: { background: "#fef2f2", color: "#b91c1c", border: "1px solid #fca5a5" },
  High: { background: "#fff7ed", color: "#c2410c", border: "1px solid #fed7aa" },
  Medium: { background: "#eff6ff", color: "#1d4ed8", border: "1px solid #bfdbfe" },
  Low: { background: "#f0fdf4", color: "#15803d", border: "1px solid #bbf7d0" },
};
const STATUS_STYLE = {
  "Open": { background: "#dbeafe", color: "#1d4ed8" },
  "In Progress": { background: "#dcfce7", color: "#166534" },
  "Hold": { background: "#fef9c3", color: "#854d0e" },
  "Escalated": { background: "#fee2e2", color: "#991b1b" },
  "Resolved": { background: "#e0f2fe", color: "#0369a1" },
  "Closed": { background: "#f1f5f9", color: "#475569", border: "1px solid #e2e8f0" },
};
const badgeBase = {
  display: "inline-flex", alignItems: "center",
  padding: "3px 10px", borderRadius: 999,
  fontSize: 11, fontWeight: 600, whiteSpace: "nowrap", lineHeight: 1.4,
};
const ticketIdStyle = {
  display: "inline-flex", alignItems: "center", gap: 5,
  background: "#f0f5fb", border: "1px solid #c8d6e8",
  borderRadius: 6, padding: "3px 9px",
  fontWeight: 700, fontSize: 12, color: "#3d5a8a", whiteSpace: "nowrap",
};
const actionBtn = (color, bg) => ({
  display: "inline-flex", alignItems: "center", gap: 3,
  padding: "2px 8px", borderRadius: 4, fontSize: 11, fontWeight: 600,
  cursor: "pointer", border: "none",
  background: bg, color, whiteSpace: "nowrap", flexShrink: 0,
  transition: "opacity 0.15s",
});

// ── Which actions are available per status ─────────────────────────────────
const ACTIONS_BY_STATUS = {
  "Open": ["edit", "resolve", "hold", "escalate"],
  "In Progress": ["edit", "resolve", "hold", "escalate"],
  "Hold": ["edit", "resolve", "escalate"],
  "Escalated": ["edit", "resolve"],
  "Resolved": ["close", "reopen"],
  "Closed": ["reopen"],
};

const ACTION_META = {
  edit: { label: "Edit", color: "#3d5a8a", bg: "#e8f0fb" },
  resolve: { label: "Resolve", color: "#166534", bg: "#dcfce7" },
  hold: { label: "Hold", color: "#854d0e", bg: "#fef9c3" },
  escalate: { label: "Escalate", color: "#991b1b", bg: "#fee2e2" },
  close: { label: "Close", color: "#475569", bg: "#f1f5f9" },
  reopen: { label: "Reopen", color: "#1d4ed8", bg: "#dbeafe" },
};

const ACTION_TITLES = {
  hold: "Hold Ticket",
  close: "Close Ticket",
  reopen: "Reopen Ticket",
  escalate: "Escalate Ticket",
};

const ESC_LEVEL_OPTIONS = [
  { label: "L1", value: "L1" },
  { label: "L2", value: "L2" },
  { label: "L3", value: "L3" },
];

const INITIAL_FILTER = {
  FromDate: new Date(), ToDate: new Date(),
  Status: "", Priority: "", CategoryID: "", SearchText: "",
};

// ─────────────────────────────────────────────────────────────────────────────
const AllTickets = () => {
  const [t] = useTranslation();
  const theme = useLocalStorage("theme", "get");

  const [filter, setFilter] = useState(INITIAL_FILTER);
  const [tickets, setTickets] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  // Dropdowns
  const [categoryOptions, setCategoryOptions] = useState([]);
  const [assignableUsers, setAssignableUsers] = useState([]);
  const [resolutionOptions, setResolutionOptions] = useState([]);

  // Inline edit row
  const [editTicket, setEditTicket] = useState(null);
  const [editStatus, setEditStatus] = useState("");
  const [editAssignee, setEditAssignee] = useState("");
  const [editRemarks, setEditRemarks] = useState("");

  // Resolve modal
  const [showResolve, setShowResolve] = useState(false);
  const [resolveTicket, setResolveTicket] = useState(null);
  const [resolutionType, setResolutionType] = useState("");
  const [resolutionNote, setResolutionNote] = useState("");

  // Generic action modal (hold / close / reopen / escalate)
  const [actionModal, setActionModal] = useState({ open: false, type: null, ticket: null });
  const [actionRemark, setActionRemark] = useState("");
  const [escLevel, setEscLevel] = useState("L1");
  const [escUser, setEscUser] = useState("");

  const statusOptions = TICKET_STATUSES.map((s) => ({ label: s, value: s }));
  const priorityOptions = TICKET_PRIORITIES.map((p) => ({ label: p, value: p }));
  const userNameMap = Object.fromEntries(assignableUsers.map((u) => [u.value, u.label]));

  useEffect(() => {
    loadDropdowns();
    fetchTickets(INITIAL_FILTER);
  }, []);

  // ── Dropdowns ────────────────────────────────────────────────────────────
  const loadDropdowns = () => {
    Promise.all([
      axiosInstance.get("Ticketing/GetCategoryDropdown"),
      axiosInstance.post("Ticketing/GetAssignableUsers", { CategoryID: 0, CentreID: 0 }),
      axiosInstance.post("Ticketing/GetResolutionTypeDropdown", {}),
    ])
      .then(([catRes, usrRes, resRes]) => {
        setCategoryOptions(catRes?.data?.message || []);
        setAssignableUsers(usrRes?.data?.message || []);
        setResolutionOptions(resRes?.data?.message || []);
      })
      .catch(() => { });
  };

  // ── Fetch tickets ────────────────────────────────────────────────────────
  const fetchTickets = (f) => {
    setIsLoading(true);
    axiosInstance
      .post("Ticketing/GetTickets", {
        FromDate: f.FromDate ? moment(f.FromDate).format("YYYY-MM-DD") : "",
        ToDate: f.ToDate ? moment(f.ToDate).format("YYYY-MM-DD") : "",
        Status: f.Status || "",
        Priority: f.Priority || "",
        CategoryID: f.CategoryID || 0,
        CentreID: 0,
        AssignedToUserID: 0,
        SearchText: f.SearchText || "",
        PageNo: 1, PageSize: 100,
      })
      .then((res) => {
        const d = res?.data?.message || {};
        setTickets(d.Tickets || d.tickets || []);
        setTotalCount(d.TotalCount ?? d.totalCount ?? 0);
      })
      .catch((err) => toast.error(err?.response?.data?.message || t("Failed to load tickets")))
      .finally(() => setIsLoading(false));
  };

  // ── Filter handlers ──────────────────────────────────────────────────────
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilter((p) => ({ ...p, [name]: value }));
  };
  const handleFilterSelect = (name, opt) => setFilter((p) => ({ ...p, [name]: opt?.value ?? "" }));
  const handleFilterDate = (value, name) => setFilter((p) => ({ ...p, [name]: value }));
  const handleSearch = () => fetchTickets(filter);
  const handleClear = () => { setFilter(INITIAL_FILTER); fetchTickets(INITIAL_FILTER); };

  // ── Inline edit ──────────────────────────────────────────────────────────
  const openEdit = (tkt) => {
    setEditTicket(tkt);
    setEditStatus(tkt.Status);
    setEditAssignee(tkt.AssignedToUserID || "");
    setEditRemarks("");
  };
  const cancelEdit = () => setEditTicket(null);

  const handleUpdate = () => {
    setActionLoading(true);
    axiosInstance
      .post("Ticketing/UpdateTicket", {
        TicketID: editTicket.TicketID,
        Status: editStatus,
        AssignedToUserID: editAssignee || null,
        Remarks: editRemarks || "",
      })
      .then(() => {
        toast.success(t("Ticket updated successfully"));
        setEditTicket(null);
        fetchTickets(filter);
      })
      .catch((err) => toast.error(err?.response?.data?.message || t("Update failed")))
      .finally(() => setActionLoading(false));
  };

  // ── Resolve modal ────────────────────────────────────────────────────────
  const openResolve = (tkt) => {
    setResolveTicket(tkt);
    setResolutionType("");
    setResolutionNote("");
    setShowResolve(true);
  };
  const handleConfirmResolve = () => {
    if (!resolutionType) { toast.warning(t("Please select a resolution type")); return; }
    setActionLoading(true);
    axiosInstance
      .post("Ticketing/ResolveTicket", {
        TicketID: resolveTicket.TicketID,
        ResolutionType: resolutionType,
        ResolutionNote: resolutionNote || "",
      })
      .then(() => {
        toast.success(`${resolveTicket.TicketNo} ${t("resolved successfully")}`);
        setShowResolve(false);
        fetchTickets(filter);
      })
      .catch((err) => toast.error(err?.response?.data?.message || t("Resolve failed")))
      .finally(() => setActionLoading(false));
  };

  // ── Generic action modal (hold/close/reopen/escalate) ────────────────────
  const openAction = (type, tkt) => {
    setActionModal({ open: true, type, ticket: tkt });
    setActionRemark("");
    setEscLevel("L1");
    setEscUser("");
  };
  const closeAction = () => setActionModal({ open: false, type: null, ticket: null });

  const handleConfirmAction = () => {
    const { type, ticket } = actionModal;
    if (type === "escalate" && !escUser) {
      toast.warning(t("Please select a user to escalate to"));
      return;
    }
    setActionLoading(true);

    const urlMap = {
      hold: "Ticketing/HoldTicket",
      close: "Ticketing/CloseTicket",
      reopen: "Ticketing/ReopenTicket",
      escalate: "Ticketing/EscalateTicket",
    };
    const payload = type === "escalate"
      ? { TicketID: ticket.TicketID, EscalationLevel: escLevel, EscalatedToUserID: Number(escUser), Remarks: actionRemark }
      : { TicketID: ticket.TicketID, Remarks: actionRemark };

    axiosInstance
      .post(urlMap[type], payload)
      .then((res) => {
        toast.success(res?.data?.message || t("Action completed successfully"));
        closeAction();
        fetchTickets(filter);
      })
      .catch((err) => toast.error(err?.response?.data?.message || t("Action failed")))
      .finally(() => setActionLoading(false));
  };

  // ── Render action buttons per status ─────────────────────────────────────
  const renderActions = (tkt) => {
    const allowed = ACTIONS_BY_STATUS[tkt.Status] || [];
    return (
      <div style={{ display: "flex", gap: 4, flexWrap: "nowrap" }}>
        {allowed.map((act) => {
          const m = ACTION_META[act];
          const onClick =
            act === "edit" ? () => openEdit(tkt) :
              act === "resolve" ? () => openResolve(tkt) :
                () => openAction(act, tkt);
          return (
            <button
              key={act}
              onClick={onClick}
              style={actionBtn(m.color, m.bg)}
              onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.75")}
              onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
            >
              {t(m.label)}
            </button>
          );
        })}
      </div>
    );
  };

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className={`${theme}`}>

      {/* Filter */}
      <Accordion title="Search Tickets" defaultValue={true}>
        <div className="card-body" style={{ paddingTop: 10, paddingBottom: 10 }}>
          <div className="row align-items-end">
            <div className="col-12 col-sm-6 col-md-2 my-1" >
               <DatePicker id="fromDate" name="FromDate" lable="From Date"
              value={filter.FromDate} onChange={handleFilterDate}
              className="custom-calendar"
               dateFormat="dd-M-yy" />
            </div>
           
              <div className="col-12 col-sm-6 col-md-2 my-1" >
            <DatePicker id="toDate" name="ToDate" lable="To Date"
              value={filter.ToDate} onChange={handleFilterDate}
              className="custom-calendar"
               dateFormat="dd-M-yy" />
            </div>
           <div className="col-12 col-sm-6 col-md-2 my-1" >
            <ReactSelect id="status" name="Status" placeholderName="Status"
              value={filter.Status} dynamicOptions={statusOptions}
              onChange={handleFilterSelect}  />
            </div>
             <div className="col-12 col-sm-6 col-md-2 my-1" >
            <ReactSelect id="priority" name="Priority" placeholderName="Priority"
              value={filter.Priority} dynamicOptions={priorityOptions}
              onChange={handleFilterSelect}  />
            </div>
              <div className="col-12 col-sm-6 col-md-2 my-1" >
            <ReactSelect id="categoryID" name="CategoryID" placeholderName="Category"
              value={filter.CategoryID} dynamicOptions={categoryOptions}
              onChange={handleFilterSelect}  />
            </div>
            <div className="col-12 col-sm-6 col-md-2 my-1" >
            <Input type="text" name="SearchText" id="searchText"
              lable="Ticket / Patient / Visit"
              value={filter.SearchText} onChange={handleFilterChange}
               />
            </div>
            <div className="col-12 col-sm-6 col-md-2 my-1 d-flex" >
              <SearchButton text={t("Search")} onClick={handleSearch} />
              <CancelButton text={t("Clear")} onClick={handleClear} className="ml-2" />
            </div>
          </div>
        </div>
      </Accordion>

      {/* Ticket list */}
      <Accordion title={`Ticket List${totalCount ? ` (${totalCount})` : ""}`} defaultValue={true}>
        <Tables>
          <thead>
            <tr>
              <th>{t("#")}</th>
              <th>{t("Ticket ID")}</th>
              <th>{t("Patient")}</th>
              <th>{t("Visit No")}</th>
              <th>{t("Barcode No")}</th>
              <th>{t("Client Code")}</th>
              <th>{t("Test code")}</th>
              <th>{t("Category")}</th>
              <th>{t("Subcategory")}</th>
              <th>{t("Priority")}</th>
              <th>{t("Status")}</th>
              <th>{t("SLA")}</th>
              <th>{t("Assigned To")}</th>
              <th>{t("Created")}</th>
              <th>{t("Actions")}</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan={15} className="text-center py-3">
                <span className="spinner-border spinner-border-sm" />
              </td></tr>
            ) : tickets.length > 0 ? (
              tickets.map((tkt, idx) => {
                const sla = getSlaStatus(tkt.ElapsedMinutes, tkt.TAT_Minutes);
                const slaPct = tkt.TAT_Minutes > 0
                  ? Math.min(100, Math.round((tkt.ElapsedMinutes / tkt.TAT_Minutes) * 100))
                  : 0;
                const isEditing = editTicket?.TicketID === tkt.TicketID;
                const slaColor = sla.barColor;

                return (
                  <tr key={tkt.TicketID} style={isEditing ? { background: "#eff6ff" } : {}}>
                    <td>{idx + 1}</td>

                    <td style={{ whiteSpace: "nowrap" }}>
                      <span style={ticketIdStyle}>
                        <i className="bi bi-ticket-perforated" style={{ fontSize: 11, lineHeight: 1 }} />
                        {tkt.TicketNo}
                      </span>
                      {tkt.CurrentEscalationLevel && (
                        <span style={{ ...badgeBase, background: "#fee2e2", color: "#991b1b", marginLeft: 4, fontSize: 10 }}>
                          {tkt.CurrentEscalationLevel}
                        </span>
                      )}
                    </td>

                    <td>{tkt.PatientName}</td>
                    <td>{tkt.VisitNo || "—"}</td>
                    <td>{tkt.BarcodeNo || "—"}</td>
                    <td>{tkt.Client || "—"}</td>
                    <td>{tkt.InvestigationName || "—"}</td>
                    <td>{tkt.CategoryName}</td>
                    <td>{tkt.SubcategoryName || "—"}</td>

                    <td>
                      <span style={{ ...badgeBase, ...(PRIORITY_STYLE[tkt.Priority] ?? {}) }}>
                        {t(tkt.Priority)}
                      </span>
                    </td>

                    <td style={{ minWidth: 140 }}>
                      {isEditing ? (
                        <ReactSelect id="editStatus" name="editStatus" placeholderName="Status"
                          value={editStatus} dynamicOptions={statusOptions}
                          onChange={(_, opt) => setEditStatus(opt?.value ?? "")} respclass="" />
                      ) : (
                        <span style={{ ...badgeBase, ...(STATUS_STYLE[tkt.Status] ?? {}) }}>
                          {t(tkt.Status)}
                        </span>
                      )}
                    </td>

                    <td style={{ minWidth: 90 }}>
                      <div style={{ height: 6, borderRadius: 999, background: "#e2e8f0", overflow: "hidden", marginBottom: 2 }}>
                        <div style={{ height: "100%", width: `${slaPct}%`, background: slaColor, borderRadius: 999, transition: "width .3s" }} />
                      </div>
                      <span style={{ fontSize: 10, fontWeight: 600, color: slaColor }}>{slaPct}% — {t(sla.label)}</span>
                    </td>

                    <td style={{ minWidth: 160 }}>
                      {isEditing ? (
                        <ReactSelect id="editAssign" name="editAssign" placeholderName="Assign To"
                          value={editAssignee} dynamicOptions={assignableUsers}
                          onChange={(_, opt) => setEditAssignee(opt?.value ?? "")} respclass="" />
                      ) : (
                        <span>{userNameMap[tkt.AssignedToUserID] || "—"}</span>
                      )}
                    </td>

                    <td style={{ whiteSpace: "nowrap" }}>
                      {tkt.CreatedDate
                        ? moment(tkt.CreatedDate?.value ?? tkt.CreatedDate).format("DD-MMM-YY HH:mm")
                        : "—"}
                    </td>

                    <td style={{ minWidth: 200 }}>
                      {isEditing ? (
                        <div className="d-flex gap-1">
                          <button onClick={handleUpdate} disabled={actionLoading}
                            style={actionBtn("#166534", "#dcfce7")}
                            onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.75")}
                            onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}>
                            {t("Save")}
                          </button>
                          <button onClick={cancelEdit}
                            style={actionBtn("#475569", "#f1f5f9")}
                            onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.75")}
                            onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}>
                            {t("Cancel")}
                          </button>
                        </div>
                      ) : (
                        renderActions(tkt)
                      )}
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr><td colSpan={15} className="text-center text-muted py-3">
                {t("No tickets found")}
              </td></tr>
            )}
          </tbody>
        </Tables>
      </Accordion>

      {/* ── Resolve Modal ── */}
      {resolveTicket && (
        <Modal
          visible={showResolve}
          setVisible={setShowResolve}
          Header={`${t("Resolve Ticket")} — ${resolveTicket.TicketNo}`}
          modalWidth="460px"
          buttons={
            <>
              <SaveButton text={t("Confirm Resolve")} onClick={handleConfirmResolve} disabled={actionLoading} />
              <CancelButton text={t("Cancel")} onClick={() => setShowResolve(false)} />
            </>
          }
        >
          <div className="row g-2 mt-1">
            <ReactSelect
              id="resolutionType" name="ResolutionType"
              placeholderName="Resolution Type *"
              value={resolutionType}
              dynamicOptions={resolutionOptions}
              onChange={(_, opt) => setResolutionType(opt?.value ?? "")}
              respclass="col-12"
            />
            <Input type="text" name="resolutionNote" id="resolutionNote"
              lable="Resolution Note (Optional)"
              value={resolutionNote}
              onChange={(e) => setResolutionNote(e.target.value)}
              respclass="col-12"
            />
          </div>
        </Modal>
      )}

      {/* ── Generic Action Modal (Hold / Close / Reopen / Escalate) ── */}
      {actionModal.open && (
        <Modal
          visible={actionModal.open}
          setVisible={closeAction}
          Header={`${t(ACTION_TITLES[actionModal.type])} — ${actionModal.ticket?.TicketNo}`}
          modalWidth="460px"
          buttons={
            <>
              <SaveButton
                text={t(ACTION_META[actionModal.type]?.label)}
                onClick={handleConfirmAction}
                disabled={actionLoading}
              />
              <CancelButton text={t("Cancel")} onClick={closeAction} />
            </>
          }
        >
          <div className="row g-2 mt-1">

            {/* Escalate-only fields */}
            {actionModal.type === "escalate" && (
              <>
                <ReactSelect
                  id="escLevel" name="escLevel"
                  placeholderName="Escalation Level *"
                  value={escLevel}
                  dynamicOptions={ESC_LEVEL_OPTIONS}
                  onChange={(_, opt) => setEscLevel(opt?.value ?? "L1")}
                  respclass="col-12"
                />
                <ReactSelect
                  id="escUser" name="escUser"
                  placeholderName="Escalate To (User) *"
                  value={escUser}
                  dynamicOptions={assignableUsers}
                  onChange={(_, opt) => setEscUser(opt?.value ?? "")}
                  respclass="col-12"
                />
              </>
            )}

            <Input
              type="text"
              name="actionRemark"
              id="actionRemark"
              lable="Remarks"
              value={actionRemark}
              onChange={(e) => setActionRemark(e.target.value)}
              respclass="col-12"
            />
          </div>
        </Modal>
      )}

    </div>
  );
};

export default AllTickets;
