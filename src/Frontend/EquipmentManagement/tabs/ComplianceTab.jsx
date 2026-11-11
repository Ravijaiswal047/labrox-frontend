import React, { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { FaPencilAlt } from "react-icons/fa";
import moment from "moment";
import Heading from "@app/components/UI/Heading";
import ReactSelect from "@app/components/formComponent/ReactSelect";
import DatePicker from "@app/components/formComponent/DatePicker";
import Input from "@app/components/formComponent/Input";
import CustomTable from "@app/components/Table/CustomTable";
import { CustomButton } from "@app/components/UI/CustomButton";
import { notify } from "@app/utils/utils";
import KpiCard from "./shared/KpiCard";
import Donut from "./shared/Donut";
import RaiseNcModal from "./RaiseNcModal";
import { axiosInstance } from "../../../utils/axiosInstance";
import { formatApiDate, formatDisplayDate } from "../equipmentConstants";
import {
  COMPLIANCE_STANDARD_OPTIONS,
  SESSION_OPTIONS,
  ncStatusBadgeClass,
  reqStatusBadgeClass,
} from "../complianceConstants";

const ComplianceTab = () => {
  const { t } = useTranslation();

  const [loading, setLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Compliance Overview State
  const [kpis, setKpis] = useState({
    readinessScore: 0,
    compliantCount: 0,
    partialCount: 0,
    gapCount: 0,
    openNcCount: 0,
  });
  const [standardStats, setStandardStats] = useState(null);
  const [requirements, setRequirements] = useState([]);
  const [nonConformities, setNonConformities] = useState([]);
  const [tempEquipmentList, setTempEquipmentList] = useState([]);
  const [selectedTempEqId, setSelectedTempEqId] = useState("");
  const [selectedTempEq, setSelectedTempEq] = useState(null);
  const [temperatureLogs, setTemperatureLogs] = useState([]);

  // Filters
  const [standardFilter, setStandardFilter] = useState("__ALL__");

  // Accordion Sections
  const [openSections, setOpenSections] = useState({
    standards: true,
    temp: true,
    checklist: true,
    nc: true,
  });

  const toggleSection = (key) => {
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  // Inline Temperature Log Form
  const [tempForm, setTempForm] = useState({
    LogDate: new Date(),
    Session: "Morning",
    Reading: "",
    RecordedBy:
      window.sessionStorage?.getItem("EmployeeName") ||
      window.sessionStorage?.getItem("UserName") ||
      "",
    Remarks: "",
  });

  // NC Modal
  const [showNcModal, setShowNcModal] = useState(false);
  const [editNc, setEditNc] = useState(null);

  // Canvas Ref for Temperature Chart
  const canvasRef = useRef(null);

  // ─── Load Compliance Overview ──────────────────────────────────────────────
  const loadComplianceData = async (tempEqId = selectedTempEqId, std = standardFilter) => {
    setLoading(true);
    try {
      const payload = {};
      if (tempEqId) payload.TempEquipmentID = Number(tempEqId);
      if (std && std !== "__ALL__") payload.Standard = std;

      const response = await axiosInstance.post("EquipmentManagement/GetComplianceOverview", payload);
      if (response?.data?.success) {
        const data = response.data.message || {};
        setKpis(data.kpis || {});
        setStandardStats(data.standardStats || null);
        setRequirements(data.requirements || []);
        setNonConformities(data.nonConformities || []);
        setTempEquipmentList(data.tempEquipmentList || []);
        setSelectedTempEq(data.selectedTempEquipment || null);
        setTemperatureLogs(data.temperatureLogs || []);

        if (data.selectedTempEquipment && !tempEqId) {
          setSelectedTempEqId(String(data.selectedTempEquipment.EquipmentID));
        }
      } else {
        notify(response?.data?.message || t("Failed to load compliance overview"), "error");
      }
    } catch (err) {
      console.error("Failed to load compliance overview", err);
      notify(err?.response?.data?.message || t("Failed to load compliance overview"), "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadComplianceData();
  }, []);

  // ─── Handle Equipment Selection Change ───────────────────────────────────
  const handleTempEqChange = (opt) => {
    const newEqId = opt?.value ?? "";
    setSelectedTempEqId(newEqId);
    loadComplianceData(newEqId, standardFilter);
  };

  // ─── Handle Standard Filter Change ───────────────────────────────────────
  const handleStandardFilterChange = (opt) => {
    const newStd = opt?.value ?? "__ALL__";
    setStandardFilter(newStd);
    loadComplianceData(selectedTempEqId, newStd);
  };

  // ─── Draw Temperature Trend Chart ─────────────────────────────────────────
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !selectedTempEq) return;

    const ctx = canvas.getContext("2d");
    const container = canvas.parentElement;
    const W = Math.max(320, container.clientWidth - 20);
    const H = 160;
    canvas.width = W;
    canvas.height = H;

    ctx.clearRect(0, 0, W, H);

    const minT = Number(selectedTempEq.MinTemp ?? 2);
    const maxT = Number(selectedTempEq.MaxTemp ?? 8);
    const unit = selectedTempEq.Unit || "°C";

    const recs = temperatureLogs.slice(-14);
    if (recs.length === 0) {
      ctx.fillStyle = "#5B7078";
      ctx.font = "12px Segoe UI";
      ctx.textAlign = "center";
      ctx.fillText(t("No temperature records logged yet for this equipment"), W / 2, H / 2);
      return;
    }

    const padLeft = 45;
    const padRight = 20;
    const padTop = 20;
    const padBottom = 26;

    const chartLo = Math.min(minT - 2, ...recs.map((r) => Number(r.Reading) - 1));
    const chartHi = Math.max(maxT + 2, ...recs.map((r) => Number(r.Reading) + 1));

    const getY = (val) => {
      const ratio = (val - chartLo) / (chartHi - chartLo || 1);
      return H - padBottom - ratio * (H - padTop - padBottom);
    };

    const getX = (idx) => {
      if (recs.length <= 1) return padLeft + (W - padLeft - padRight) / 2;
      return padLeft + (idx * (W - padLeft - padRight)) / (recs.length - 1);
    };

    // Shaded acceptable band
    const yMaxBand = getY(maxT);
    const yMinBand = getY(minT);
    ctx.fillStyle = "#E3EFF1";
    ctx.fillRect(padLeft, yMaxBand, W - padLeft - padRight, yMinBand - yMaxBand);

    // Dashed threshold lines
    ctx.strokeStyle = "#0E5E6F";
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 3]);

    ctx.beginPath();
    ctx.moveTo(padLeft, yMaxBand);
    ctx.lineTo(W - padRight, yMaxBand);
    ctx.moveTo(padLeft, yMinBand);
    ctx.lineTo(W - padRight, yMinBand);
    ctx.stroke();
    ctx.setLineDash([]);

    // Axis limit labels
    ctx.fillStyle = "#5B7078";
    ctx.font = "10.5px Segoe UI";
    ctx.textAlign = "right";
    ctx.fillText(`${maxT}${unit}`, padLeft - 6, yMaxBand + 3);
    ctx.fillText(`${minT}${unit}`, padLeft - 6, yMinBand + 3);

    // Draw connecting line
    ctx.strokeStyle = "#10333C";
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    recs.forEach((r, i) => {
      const x = getX(i);
      const y = getY(Number(r.Reading));
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.stroke();

    // Draw data points & excursion labels
    recs.forEach((r, i) => {
      const x = getX(i);
      const val = Number(r.Reading);
      const y = getY(val);
      const isExcursion = val < minT || val > maxT;

      ctx.fillStyle = isExcursion ? "#B3261E" : "#1B7F4D";
      ctx.beginPath();
      ctx.arc(x, y, isExcursion ? 5 : 3.5, 0, Math.PI * 2);
      ctx.fill();

      // Date label
      const dStr = r.LogDate ? moment(r.LogDate).format("DD/MM") : "";
      ctx.fillStyle = "#5B7078";
      ctx.font = "9.5px Segoe UI";
      ctx.textAlign = "center";
      ctx.fillText(dStr, x, H - 8);

      // Excursion value callout
      if (isExcursion) {
        ctx.fillStyle = "#B3261E";
        ctx.font = "bold 10px Segoe UI";
        ctx.fillText(`${val}${unit}`, x, y - 8);
      }
    });
  }, [temperatureLogs, selectedTempEq, t]);

  // ─── Save Temperature Log ───────────────────────────────────────────────────
  const handleLogTemperature = async () => {
    if (!selectedTempEqId) {
      notify(t("Please select equipment"), "error");
      return;
    }
    const val = parseFloat(tempForm.Reading);
    if (isNaN(val)) {
      notify(t("Please enter a valid temperature reading"), "error");
      return;
    }

    const minT = Number(selectedTempEq?.MinTemp ?? 2);
    const maxT = Number(selectedTempEq?.MaxTemp ?? 8);
    const isExcursion = val < minT || val > maxT;

    if (isExcursion && !tempForm.Remarks?.trim()) {
      notify(
        t("Reading is outside acceptable range. Corrective action remark is mandatory."),
        "error"
      );
      return;
    }

    setIsSaving(true);
    try {
      const payload = {
        EquipmentID: Number(selectedTempEqId),
        LogDate: formatApiDate(tempForm.LogDate),
        Session: tempForm.Session,
        Reading: val,
        Unit: selectedTempEq?.Unit || "°C",
        MinTemp: minT,
        MaxTemp: maxT,
        RecordedBy:
          tempForm.RecordedBy?.trim() ||
          window.sessionStorage?.getItem("EmployeeName") ||
          window.sessionStorage?.getItem("UserName") ||
          "Biomedical Team",
        Remarks: tempForm.Remarks?.trim() || null,
      };

      const response = await axiosInstance.post("EquipmentManagement/SaveTemperatureLog", payload);
      if (response?.data?.success) {
        notify(
          response.data.message || t("Temperature reading logged successfully"),
          isExcursion ? "warning" : "success"
        );
        setTempForm((prev) => ({
          ...prev,
          Reading: "",
          Remarks: "",
        }));
        await loadComplianceData(selectedTempEqId, standardFilter);
      } else {
        notify(response?.data?.message || t("Failed to log temperature"), "error");
      }
    } catch (err) {
      notify(err?.response?.data?.message || t("Failed to log temperature"), "error");
    } finally {
      setIsSaving(false);
    }
  };

  // ─── Save Non-Conformity ────────────────────────────────────────────────────
  const handleSaveNc = async (formData) => {
    setIsSaving(true);
    try {
      const payload = {
        Source: formData.Source,
        ClauseRef: formData.ClauseRef?.trim() || null,
        Description: formData.Description?.trim(),
        Capa: formData.Capa?.trim() || null,
        TargetDate: formatApiDate(formData.TargetDate),
      };
      if (formData.NCID) {
        payload.NCID = Number(formData.NCID);
        payload.Status = formData.Status;
      }

      const response = await axiosInstance.post("EquipmentManagement/SaveNonConformity", payload);
      if (response?.data?.success) {
        notify(
          response.data.message ||
            (formData.NCID ? t("NC updated successfully") : t("NC raised successfully")),
          "success"
        );
        setShowNcModal(false);
        setEditNc(null);
        await loadComplianceData(selectedTempEqId, standardFilter);
      } else {
        notify(response?.data?.message || t("Failed to save Non-Conformity"), "error");
      }
    } catch (err) {
      notify(err?.response?.data?.message || t("Failed to save Non-Conformity"), "error");
    } finally {
      setIsSaving(false);
    }
  };

  // ─── Advance NC Status ─────────────────────────────────────────────────────
  const handleAdvanceNc = async (nc) => {
    try {
      const targetStatus = nc.Status === "Open" ? "In Progress" : "Closed";
      const payload = {
        NCID: Number(nc.NCID),
        TargetStatus: targetStatus,
      };
      const response = await axiosInstance.post("EquipmentManagement/AdvanceNonConformityStatus", payload);
      if (response?.data?.success) {
        notify(response.data.message || t("NC status advanced"), "success");
        await loadComplianceData(selectedTempEqId, standardFilter);
      } else {
        notify(response?.data?.message || t("Failed to advance NC status"), "error");
      }
    } catch (err) {
      notify(err?.response?.data?.message || t("Failed to advance NC status"), "error");
    }
  };

  // ─── Update Requirement Status ─────────────────────────────────────────────
  const handleUpdateReqStatus = async (reqId, newStatus) => {
    try {
      const payload = {
        ReqID: Number(reqId),
        Status: newStatus,
      };
      const response = await axiosInstance.post("EquipmentManagement/UpdateRequirementStatus", payload);
      if (response?.data?.success) {
        notify(response.data.message || t("Requirement status updated"), "success");
        await loadComplianceData(selectedTempEqId, standardFilter);
      } else {
        notify(response?.data?.message || t("Failed to update status"), "error");
      }
    } catch (err) {
      notify(err?.response?.data?.message || t("Failed to update status"), "error");
    }
  };

  // ─── Dropdown Options ───────────────────────────────────────────────────────
  const tempEquipmentOptions = useMemo(() => {
    return tempEquipmentList.map((eq) => ({
      value: String(eq.EquipmentID),
      label: `${eq.EquipmentName} (${eq.MinTemp}–${eq.MaxTemp}${eq.Unit}) · ${eq.EquipmentCode}`,
    }));
  }, [tempEquipmentList]);

  // ─── Donut Segments for Standards ──────────────────────────────────────────
  const isoSegments = useMemo(() => {
    const s = standardStats?.iso || {};
    return [
      { label: t("Compliant"), value: Number(s.compliant || 0), color: "#1B7F4D" },
      { label: t("Partial"), value: Number(s.partial || 0), color: "#B45D00" },
      { label: t("Gap"), value: Number(s.gap || 0), color: "#B3261E" },
    ];
  }, [standardStats, t]);

  const nablSegments = useMemo(() => {
    const s = standardStats?.nabl || {};
    return [
      { label: t("Compliant"), value: Number(s.compliant || 0), color: "#1B7F4D" },
      { label: t("Partial"), value: Number(s.partial || 0), color: "#B45D00" },
      { label: t("Gap"), value: Number(s.gap || 0), color: "#B3261E" },
    ];
  }, [standardStats, t]);

  const nabhSegments = useMemo(() => {
    const s = standardStats?.nabh || {};
    return [
      { label: t("Compliant"), value: Number(s.compliant || 0), color: "#1B7F4D" },
      { label: t("Partial"), value: Number(s.partial || 0), color: "#B45D00" },
      { label: t("Gap"), value: Number(s.gap || 0), color: "#B3261E" },
    ];
  }, [standardStats, t]);

  // ─── Table Data Rows ───────────────────────────────────────────────────────
  const tempRows = useMemo(() => {
    return [...temperatureLogs].reverse().map((log) => {
      const isExcursion = Boolean(log.IsExcursion);
      return {
        rowColor: isExcursion ? "#fef2f2" : undefined,
        date: formatDisplayDate(log.LogDate),
        session: log.Session,
        reading: <b>{`${log.Reading}${log.Unit || "°C"}`}</b>,
        recordedBy: log.RecordedBy || "—",
        status: (
          <span className={isExcursion ? "em-badge em-badge-outofservice" : "em-badge em-badge-active"}>
            {isExcursion ? t("Excursion") : t("Within range")}
          </span>
        ),
        remarks: log.Remarks || "—",
      };
    });
  }, [temperatureLogs, t]);

  const reqRows = useMemo(() => {
    return requirements.map((r) => ({
      rowColor: r.Status === "Gap" ? "#fef2f2" : undefined,
      clauseRef: <b>{r.ClauseRef}</b>,
      standard: (
        <span
          className={
            r.Standard === "ISO 15189"
              ? "em-badge em-badge-active"
              : r.Standard === "NABL 112A"
              ? "em-badge em-badge-supplier"
              : "em-badge em-badge-condemned"
          }
        >
          {r.Standard}
        </span>
      ),
      requirement: r.Requirement,
      evidence: <span className="small text-muted">{r.ModuleEvidence}</span>,
      status: (
        <select
          className="form-control form-control-sm py-0 px-2"
          style={{
            fontSize: "11px",
            fontWeight: "600",
            height: "26px",
            width: "115px",
            color:
              r.Status === "Compliant"
                ? "#15803d"
                : r.Status === "Partial"
                ? "#b45309"
                : "#b91c1c",
            backgroundColor:
              r.Status === "Compliant"
                ? "#dcfce7"
                : r.Status === "Partial"
                ? "#fef3c7"
                : "#fee2e2",
            borderColor:
              r.Status === "Compliant"
                ? "#86efac"
                : r.Status === "Partial"
                ? "#fde68a"
                : "#fca5a5",
            borderRadius: "12px",
            cursor: "pointer",
          }}
          value={r.Status}
          onChange={(e) => handleUpdateReqStatus(r.ReqID, e.target.value)}
        >
          <option value="Compliant">{t("Compliant")}</option>
          <option value="Partial">{t("Partial")}</option>
          <option value="Gap">{t("Gap")}</option>
        </select>
      ),
    }));
  }, [requirements, t]);

  const ncRows = useMemo(() => {
    return nonConformities.map((nc) => {
      const isOverdue = nc.Status === "Open" && nc.DaysLeft !== null && nc.DaysLeft < 0;
      return {
        rowColor: isOverdue ? "#fef2f2" : undefined,
        ncNumber: <b>{nc.NCNumber}</b>,
        source: nc.Source,
        clause: <span className="small">{nc.ClauseRef || "—"}</span>,
        description: <span className="small">{nc.Description}</span>,
        capa: <span className="small">{nc.Capa || "—"}</span>,
        targetDate: formatDisplayDate(nc.TargetDate),
        status: <span className={ncStatusBadgeClass(nc.Status)}>{nc.Status}</span>,
        actions: (
          <div className="em-actions">
            <button
              type="button"
              title={t("Edit")}
              className="em-icon-btn em-icon-edit"
              onClick={() => {
                setEditNc(nc);
                setShowNcModal(true);
              }}
            >
              <FaPencilAlt />
            </button>
            {nc.Status !== "Closed" ? (
              <button
                type="button"
                className="btn btn-sm btn-outline-primary em-row-btn py-0 px-2"
                style={{ fontSize: "11px", height: "24px" }}
                onClick={() => handleAdvanceNc(nc)}
              >
                {nc.Status === "Open" ? t("Start CAPA") : t("Close NC")}
              </button>
            ) : (
              <span className="text-success" style={{ fontSize: "12px", fontWeight: "600" }}>
                ✓ {t("Closed")}
              </span>
            )}
          </div>
        ),
      };
    });
  }, [nonConformities, t]);

  const isCurrentReadingExcursion = useMemo(() => {
    const v = parseFloat(tempForm.Reading);
    if (isNaN(v) || !selectedTempEq) return false;
    const minT = Number(selectedTempEq.MinTemp ?? 2);
    const maxT = Number(selectedTempEq.MaxTemp ?? 8);
    return v < minT || v > maxT;
  }, [tempForm.Reading, selectedTempEq]);

  return (
    <div className="em-page">
      {/* ─── Top KPI Summary Cards ─────────────────────────────────────────── */}
      <div className="em-kpi-row em-kpi-row-5 mb-3">
        <KpiCard
          tone={kpis.readinessScore >= 85 ? "good" : kpis.readinessScore >= 65 ? "warning" : "critical"}
          value={`${kpis.readinessScore || 0}%`}
          label={t("Audit Readiness Score")}
        />
        <KpiCard
          tone="good"
          value={kpis.compliantCount || 0}
          label={t("Compliant Requirements")}
        />
        <KpiCard
          tone="warning"
          value={kpis.partialCount || 0}
          label={t("Partial")}
        />
        <KpiCard
          tone="critical"
          value={kpis.gapCount || 0}
          label={t("Gaps")}
        />
        <KpiCard
          tone={kpis.openNcCount > 0 ? "critical" : "good"}
          value={kpis.openNcCount || 0}
          label={t("Open NC / CAPA")}
        />
      </div>

      {/* ─── 1. Standard-wise Compliance Donut Charts ─────────────────────── */}
      <div className="mb-3">
        <Heading
          title={t("Standard-wise Compliance")}
          onClick={() => toggleSection("standards")}
          // secondTitle={
          //   <span className="small text-white" style={{ fontSize: "12px" }}>
          //     ISO 15189:2022 · NABL 112A · NABH (FMS)
          //   </span>
          // }
        />
        {openSections.standards && (
          <div className="em-analytics mt-2">
            <div className="em-split-3">
              <div className="mainDashboardwrp em-panel">
                <div className="mainBox1">
                  <div className="d-flex flex-wrap mainHeader">
                    <h4>{t("ISO 15189:2022 / ISO 9001")}</h4>
                  </div>
                  <Donut segments={isoSegments} caption={t("reqs")} />
                </div>
              </div>

              <div className="mainDashboardwrp em-panel">
                <div className="mainBox1">
                  <div className="d-flex flex-wrap mainHeader">
                    <h4>{t("NABL 112A")}</h4>
                  </div>
                  <Donut segments={nablSegments} caption={t("reqs")} />
                </div>
              </div>

              <div className="mainDashboardwrp em-panel">
                <div className="mainBox1">
                  <div className="d-flex flex-wrap mainHeader">
                    <h4>{t("NABH — FMS")}</h4>
                  </div>
                  <Donut segments={nabhSegments} caption={t("reqs")} />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ─── 2. Daily Temperature Monitoring ───────────────────────────────── */}
      <div className="mb-3">
        <Heading
          title={t("Daily Temperature Monitoring (NABL 112A — refrigerators / incubators / water baths)")}
          onClick={() => toggleSection("temp")}
          secondTitle={
            <div
              className="em-filter-bar d-flex align-items-center"
              onClick={(e) => e.stopPropagation()}
            >
              <div style={{ minWidth: "260px" }}>
                <ReactSelect
                  id="tempEqSelect"
                  name="tempEq"
                  placeholderName="Select Instrument"
                  value={selectedTempEqId}
                  dynamicOptions={tempEquipmentOptions}
                  onChange={handleTempEqChange}
                  respclass="col-12 m-0 p-0"
                />
              </div>
              <CustomButton
                title={t("Print Register")}
                icon="print"
                variant="outline"
                className="ms-2"
                onClick={() => window.print()}
                style={{color: "white"}}
              />
            </div>
          }
        />
        {openSections.temp && (
          <div className="mt-2">
            {/* Inline Reading Entry Box */}
            <div
              className="p-3 mb-3"
              style={{
                background: "#f0fdf4",
                border: "1px solid #bbf7d0",
                borderRadius: "8px",
              }}
            >
              <div className="d-flex justify-content-between align-items-center mb-2">
                <h5 className="m-0 text-success" style={{ fontSize: "13px", fontWeight: "700" }}>
                  {t("＋ Log Temperature Reading")} —{" "}
                  {selectedTempEq
                    ? `${selectedTempEq.EquipmentName} (Acceptable range: ${selectedTempEq.MinTemp}–${selectedTempEq.MaxTemp}${selectedTempEq.Unit})`
                    : ""}
                </h5>
                {isCurrentReadingExcursion && (
                  <span className="badge bg-danger">
                    ⚠ {t("Excursion Detected: Corrective Action Remark Mandatory")}
                  </span>
                )}
              </div>

              <div className="row align-items-end">
                <DatePicker
                  id="logDate"
                  name="LogDate"
                  className="custom-calendar"
                  lable="Date"
                  value={tempForm.LogDate}
                  onChange={(val) => setTempForm((p) => ({ ...p, LogDate: val }))}
                  respclass="col-md-2 col-6"
                  tabIndex={1}
                />
                <ReactSelect
                  id="logSession"
                  name="Session"
                  placeholderName="Session"
                  value={tempForm.Session}
                  dynamicOptions={SESSION_OPTIONS}
                  onChange={(name, opt) => setTempForm((p) => ({ ...p, Session: opt?.value ?? "Morning" }))}
                  respclass="col-md-2 col-6"
                  tabIndex={2}
                />
                <Input
                  type="number"
                  step="0.1"
                  name="Reading"
                  id="logReading"
                  lable={`Reading (${selectedTempEq?.Unit || "°C"})`}
                  // placeholder="e.g. 4.6"
                  value={tempForm.Reading}
                  onChange={(e) => setTempForm((p) => ({ ...p, Reading: e.target.value }))}
                  respclass="col-md-2 col-6"
                  tabIndex={3}
                />
                <Input
                  type="text"
                  name="RecordedBy"
                  id="logRecordedBy"
                  lable="Recorded By"
                  value={tempForm.RecordedBy}
                  onChange={(e) => setTempForm((p) => ({ ...p, RecordedBy: e.target.value }))}
                  respclass="col-md-2 col-6"
                  tabIndex={4}
                />
                <Input
                  type="text"
                  name="Remarks"
                  id="logRemarks"
                  lable="Corrective Action / Remarks"
                  // placeholder={isCurrentReadingExcursion ? t("Mandatory for excursion") : t("Optional")}
                  value={tempForm.Remarks}
                  onChange={(e) => setTempForm((p) => ({ ...p, Remarks: e.target.value }))}
                  respclass="col-md-3 col-12"
                  tabIndex={5}
                />
                <div className="col-md-1 col-12 mt-2 mt-md-0">
                  <CustomButton
                    text={t("Save")}
                    icon="save"
                    variant="success"
                    onClick={handleLogTemperature}
                    disabled={isSaving}
                  />
                </div>
              </div>
            </div>

            {/* Temperature Trend Canvas Chart */}
            <div className="mainDashboardwrp em-panel p-3 mb-3">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <h5 className="m-0" style={{ fontSize: "13px", fontWeight: "600" }}>
                  {t("Temperature Trend (Recent 14 Days)")}
                </h5>
                <div className="d-flex gap-3" style={{ fontSize: "11px", color: "#5B7078" }}>
                  <span>
                    <i
                      style={{
                        display: "inline-block",
                        width: "10px",
                        height: "10px",
                        borderRadius: "50%",
                        background: "#1B7F4D",
                        marginRight: "4px",
                      }}
                    />
                    {t("Within range")}
                  </span>
                  <span>
                    <i
                      style={{
                        display: "inline-block",
                        width: "10px",
                        height: "10px",
                        borderRadius: "50%",
                        background: "#B3261E",
                        marginRight: "4px",
                      }}
                    />
                    {t("Excursion (CAPA required)")}
                  </span>
                  <span>
                    <i
                      style={{
                        display: "inline-block",
                        width: "12px",
                        height: "8px",
                        background: "#E3EFF1",
                        border: "1px dashed #0E5E6F",
                        marginRight: "4px",
                      }}
                    />
                    {t("Acceptable band")}
                  </span>
                </div>
              </div>
              <div style={{ width: "100%", overflowX: "auto" }}>
                <canvas ref={canvasRef} style={{ width: "100%", height: "160px" }} />
              </div>
            </div>

            {/* Temperature Register Grid */}
            <div className="table_ticket">
              <CustomTable
                disableTooltip={true}
                columns={[
                  { header: t("Date"), field: "date", minWidth: "110px" },
                  { header: t("Session"), field: "session", minWidth: "90px" },
                  { header: t("Reading"), field: "reading", minWidth: "90px" },
                  { header: t("Recorded By"), field: "recordedBy", minWidth: "140px" },
                  { header: t("Status"), field: "status", minWidth: "120px" },
                  { header: t("Corrective Action / Remarks"), field: "remarks", minWidth: "250px", wrapText: true },
                ]}
                data={tempRows}
                loading={loading}
              />
            </div>
          </div>
        )}
      </div>

      {/* ─── 3. Guideline Requirement Checklist ───────────────────────────── */}
      <div className="mb-3">
        <Heading
          title={t("Guideline Requirement Checklist")}
          onClick={() => toggleSection("checklist")}
          secondTitle={
            <div
              className="em-filter-bar d-flex align-items-center"
              onClick={(e) => e.stopPropagation()}
            >
              <div style={{ minWidth: "160px" }}>
                <ReactSelect
                  id="compStandardSelect"
                  name="compStandard"
                  placeholderName="Filter Standard"
                  value={standardFilter}
                  dynamicOptions={COMPLIANCE_STANDARD_OPTIONS}
                  onChange={handleStandardFilterChange}
                  respclass="col-12 m-0 p-0"
                />
              </div>
            </div>
          }
        />
        {openSections.checklist && (
          <div className="mt-1 table_ticket">
            <CustomTable
              disableTooltip={true}
              columns={[
                { header: t("Clause / Ref"), field: "clauseRef", minWidth: "110px" },
                { header: t("Standard"), field: "standard", minWidth: "110px" },
                { header: t("Requirement"), field: "requirement", minWidth: "300px", wrapText: true },
                { header: t("Prototype Module / Evidence"), field: "evidence", minWidth: "220px", wrapText: true },
                { header: t("Status"), field: "status", minWidth: "110px" },
              ]}
              data={reqRows}
              loading={loading}
            />
          </div>
        )}
      </div>

      {/* ─── 4. Non-Conformities & CAPA Tracker ────────────────────────────── */}
      <div className="mb-3">
        <Heading
          title={t("Non-Conformities & CAPA Tracker")}
          onClick={() => toggleSection("nc")}
          secondTitle={
            <div
              className="em-filter-bar d-flex align-items-center"
              onClick={(e) => e.stopPropagation()}
            >
              <CustomButton
                text={t("Raise NC")}
                icon="add"
                variant="success"
                onClick={() => {
                  setEditNc(null);
                  setShowNcModal(true);
                }}
              />
            </div>
          }
        />
        {openSections.nc && (
          <div className="mt-1 table_ticket">
            <CustomTable
              disableTooltip={true}
              columns={[
                { header: t("NC No."), field: "ncNumber", minWidth: "110px" },
                { header: t("Source"), field: "source", minWidth: "130px" },
                { header: t("Clause"), field: "clause", minWidth: "120px" },
                { header: t("Non-Conformity"), field: "description", minWidth: "240px", wrapText: true },
                { header: t("CAPA"), field: "capa", minWidth: "240px", wrapText: true },
                { header: t("Target Date"), field: "targetDate", minWidth: "110px" },
                { header: t("Status"), field: "status", minWidth: "110px" },
                { header: t("Action"), field: "actions", minWidth: "130px" },
              ]}
              data={ncRows}
              loading={loading}
            />
          </div>
        )}
      </div>

      {/* ─── Raise / Edit NC Modal ─────────────────────────────────────────── */}
      <RaiseNcModal
        visible={showNcModal}
        setVisible={(v) => {
          setShowNcModal(v);
          if (!v) setEditNc(null);
        }}
        onSave={handleSaveNc}
        editData={editNc}
        isSaving={isSaving}
      />
    </div>
  );
};

export default ComplianceTab;
