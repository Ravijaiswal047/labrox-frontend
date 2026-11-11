import React, { useState, useMemo, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import Input from "@components/formComponent/Input";
import { Tooltip } from "react-tooltip";
import Tables from "@components/UI/customTable";
import Accordion from "@components/UI/Accordion";
import CustomTabs from "@components/UI/CustomTabs";
import TableFilterDot from "@components/TableFilter/TableFilterDot";
import { SaveButton, CancelButton, DeleteButton, SearchButton, CustomButton } from "@components/UI/CustomButton";
import { useLocalStorage } from "@app/utils/hooks/useLocalStorage";
import { axiosInstance } from "@app/utils/axiosInstance";
import { FaCog, FaBoxOpen, FaChartBar, FaTrash } from "react-icons/fa";
import Modal from "@components/formComponent/Modal";
import { MdOutlineDeviceThermostat } from "react-icons/md";
import IssueModal from "./IssueModal";
import PlaceTrayModal from "./PlaceTrayModal";
import SettingsModal from "./SettingsModal";
import ReportsModal from "./ReportsModal";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const today = new Date();

const getRetentionStatus = (collectedOn, retentionDays) => {
  const expiry = new Date(new Date(collectedOn)?.getTime() + retentionDays * 86400000);
  const daysLeft = Math.floor((expiry - today) / 86400000);
  if (daysLeft < 0) return "expired";
  if (daysLeft <= 3) return "critical";
  if (daysLeft <= 7) return "warning";
  return "ok";
};

const getStatusFromDaysLeft = (daysLeft, retentionDays) => {
  if (daysLeft == null) return "ok";
  if (daysLeft <= 0) return "expired";
  const pct = retentionDays > 0 ? (daysLeft / retentionDays) * 100 : 0;
  if (pct > 50) return "ok";
  if (pct > 25) return "warning";
  return "critical";
};

const SERVER_STATUS_MAP = { safe: "ok", warning: "warning", critical: "critical", expired: "expired" };

const getCellStatus = (cell) =>
  SERVER_STATUS_MAP[cell?.retentionStatus?.toLowerCase()] || getStatusFromDaysLeft(cell?.daysLeft, cell?.retentionDays);

const safeDateStr = (val) => {
  if (!val) return "";
  if (typeof val === "string") return val;
  if (typeof val === "object" && val?.value) return val.value.split("T")[0] ?? "";
  return "";
};

const STATUS_META = {
  ok:       { label: "Safe",     dot: "#22c55e", border: "#22c55e", bg: "#f0fdf4", text: "#15803d" },
  warning:  { label: "Warning",  dot: "#f59e0b", border: "#f59e0b", bg: "#fffbeb", text: "#92400e" },
  critical: { label: "Critical", dot: "#ef4444", border: "#ef4444", bg: "#fef2f2", text: "#b91c1c" },
  expired:  { label: "Expired",  dot: "#9ca3af", border: "#9ca3af", bg: "#f3f4f6", text: "#6b7280" },
  empty:    { label: "Empty",    dot: "#e5e7eb", border: "#e5e7eb", bg: "#ffffff", text: "#d1d5db" },
};

const FILTER_ITEMS = [
  { value: "",         label: "All"      },
  { value: "ok",       label: "Safe"     },
  { value: "warning",  label: "Warning"  },
  { value: "critical", label: "Critical" },
  { value: "expired",  label: "Expired"  },
];

const getPosLabel = (index, cols) =>
  `${String.fromCharCode(65 + Math.floor(index / cols))}${(index % cols) + 1}`;

// ─── Left-panel sub-components ────────────────────────────────────────────────

const CenterSection = ({ label }) => (
  <div className="d-flex align-items-center gap-2 mt-2 mb-2">
    <MdOutlineDeviceThermostat size={13} color="#6c757d" />
    <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1.2, color: "#6c757d", textTransform: "uppercase" }}>
      {label}
    </span>
    <div style={{ flex: 1, height: 1, background: "#e5e7eb" }} />
  </div>
);

const DeviceCard = ({ dev, isActive, totalCapacity, totalStored, safeCount, warningCount, criticalCount, expiredCount, onClick }) => {
  const pct = totalCapacity > 0 ? Math.round((totalStored / totalCapacity) * 100) : 0;
  const freeSlots = totalCapacity - totalStored;
  const barColor = pct >= 90 ? "#ef4444" : pct >= 60 ? "#f59e0b" : "#3b82f6";
  const hasStatus = safeCount > 0 || warningCount > 0 || criticalCount > 0 || expiredCount > 0;
  return (
    <div
      onClick={onClick}
      style={{
        border: `2px solid ${isActive ? "#3b82f6" : "#e5e7eb"}`,
        borderRadius: 8,
        padding: "10px 12px",
        marginBottom: 8,
        cursor: "pointer",
        background: "#fff",
        boxShadow: isActive ? "0 0 0 3px rgba(59,130,246,0.15)" : "none",
        transition: "border-color 0.15s, box-shadow 0.15s",
      }}
    >
      <div style={{ fontWeight: 700, fontSize: 13, color: "#111827", marginBottom: 1 }}>{dev?.DeviceName}</div>
      <div style={{ fontSize: 11, color: "#6b7280" }}>{dev?.DeviceCode}{dev?.Temperature ? ` · ${dev.Temperature}` : ""}</div>
      <div style={{ height: 4, background: "#e5e7eb", borderRadius: 4, margin: "7px 0 3px", overflow: "hidden" }}>
        <div style={{ width: `${pct}%`, height: "100%", background: barColor, borderRadius: 4, transition: "width 0.3s" }} />
      </div>
      <div className="d-flex justify-content-between" style={{ fontSize: 10, color: "#6b7280", marginBottom: hasStatus ? 5 : 0 }}>
        <span>{totalCapacity} slots total &nbsp;·&nbsp; {totalStored} stored &nbsp;·&nbsp; <strong style={{ color: freeSlots > 0 ? "#15803d" : "#b91c1c" }}>{freeSlots} free</strong></span>
        <span>{pct}%</span>
      </div>
      {hasStatus && (
        <div className="d-flex flex-wrap" style={{ gap: 3 }}>
          {safeCount > 0 && <span style={{ fontSize: 9, color: "#15803d", background: "#f0fdf4", padding: "1px 6px", borderRadius: 8, fontWeight: 600 }}>{safeCount} safe</span>}
          {warningCount > 0 && <span style={{ fontSize: 9, color: "#92400e", background: "#fffbeb", padding: "1px 6px", borderRadius: 8, fontWeight: 600 }}>{warningCount} warn</span>}
          {criticalCount > 0 && <span style={{ fontSize: 9, color: "#b91c1c", background: "#fef2f2", padding: "1px 6px", borderRadius: 8, fontWeight: 600 }}>{criticalCount} crit</span>}
          {expiredCount > 0 && <span style={{ fontSize: 9, color: "#6b7280", background: "#f3f4f6", padding: "1px 6px", borderRadius: 8, fontWeight: 600 }}>{expiredCount} exp</span>}
        </div>
      )}
    </div>
  );
};

const t = (k) => k;

const RackRow = ({ rackNum, trays, selectedTrayId, onTraySelect, onAddTray, onDeleteTray }) => {
  const totalCap = trays.reduce((s, tr) => s + (tr?.Rows || 0) * (tr?.Cols || 0), 0);
  const totalFilled = trays.reduce((s, tr) => s + (tr?.SamplesStored || 0), 0);
  return (
    <div style={{ border: "1px solid #e5e7eb", borderRadius: 8, padding: "10px 12px", marginBottom: 8, background: "#fff" }}>
      <div className="d-flex align-items-center gap-2 flex-wrap">
        <span style={{ fontWeight: 700, fontSize: 12, color: "#374151", minWidth: 42, flexShrink: 0 }}>
          R-{String(rackNum).padStart(2, "0")}
        </span>
        <div className="d-flex flex-wrap gap-1 flex-grow-1"
          style={{gap: "5px"}}
        >
          {trays.map((tray) => {
            const filled = tray?.SamplesStored || 0;
            const cap = (tray?.Rows || 0) * (tray?.Cols || 0);
            const isSelected = selectedTrayId === tray?.TrayID;
            return (
              <span
                key={tray?.TrayID}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  border: `1.5px solid ${isSelected ? "#3b82f6" : "#e5e7eb"}`,
                  background: isSelected ? "#eff6ff" : "#f9fafb",
                  borderRadius: 20,
                  marginRight: 4,
                  overflow: "hidden",
                }}
              >
                <button
                  onClick={() => onTraySelect(tray)}
                  style={{
                    border: "none",
                    background: "transparent",
                    color: isSelected ? "#1d4ed8" : "#374151",
                    padding: "3px 6px 3px 10px",
                    fontSize: 11,
                    fontWeight: 600,
                    cursor: "pointer",
                    whiteSpace: "nowrap",
                  }}
                  title={`${tray?.TrayLabel} — ${filled}/${cap}`}
                >
                  {tray?.TrayLabel} ({filled})
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); onDeleteTray(tray); }}
                  style={{
                    border: "none",
                    background: "transparent",
                    cursor: filled ? "not-allowed" : "pointer",
                    padding: "3px 8px 3px 4px",
                    display: "flex",
                    alignItems: "center",
                  }}
                  title={filled ? "Sample present in this tray" : `Delete ${tray?.TrayLabel}`}
                  disabled={filled}
                >
                  <FaTrash size={9} color={filled ? "#9a9a9a" : "#ef4444"} />
                </button>
              </span>
            );
          })}
          <button
            onClick={() => onAddTray(rackNum)}
            style={{
              border: "1.5px dashed #d1d5db",
              background: "transparent",
              color: "#9ca3af",
              borderRadius: 20,
              padding: "3px 8px",
              fontSize: 11,
              cursor: "pointer",
            }}
          >
            + {t("Add")}
          </button>
        </div>
        {totalCap > 0 && (
          <span style={{ fontSize: 11, color: "#9ca3af", flexShrink: 0, marginLeft: "auto" }}>
            {totalFilled}/{totalCap}
          </span>
        )}
      </div>
    </div>
  );
};

// ─── Main component ───────────────────────────────────────────────────────────

const SampleStorageNew = () => {
  const { t } = useTranslation();
  const theme = useLocalStorage("theme", "get");
  const userData = useLocalStorage("userData", "get");
  const centreId = useLocalStorage("DefaultCentre", "get");

  // data
  const [devices, setDevices] = useState([]);
  const [trayTemplates, setTrayTemplates] = useState([]);
  const [deviceSummary, setDeviceSummary] = useState({});
  const [isTrayLoading, setIsTrayLoading] = useState(false);
  const [trays, setTrays] = useState([]);
  const [trayGridCells, setTrayGridCells] = useState({});
  const [issuedList, setIssuedList] = useState([]);

  // selection
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [selectedTray, setSelectedTray] = useState(null);
  const [statusFilter, setStatusFilter] = useState("");
  const [activeTab, setActiveTab] = useState("store");

  // store tab staging
  const [sinInput, setSinInput] = useState("");
  const [stagedSamples, setStagedSamples] = useState({});

  // discard tab
  const [discardSelection, setDiscardSelection] = useState([]);
  const [discardReason, setDiscardReason] = useState("");

  // global search
  const [globalSearch, setGlobalSearch] = useState("");
  const [globalResults, setGlobalResults] = useState([]);

  // modals
  const [showIssueModal, setShowIssueModal] = useState(false);
  const [issueTarget, setIssueTarget] = useState(null);
  const [showPlaceTrayModal, setShowPlaceTrayModal] = useState(false);
  const [placeTrayTarget, setPlaceTrayTarget] = useState({ DeviceID: "", RackNumber: "" });
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showReportsModal, setShowReportsModal] = useState(false);
  const [deleteTrayConfirm, setDeleteTrayConfirm] = useState(null);

  // ─── Boot ───────────────────────────────────────────────────────────────────

  useEffect(() => {
    loadDevices();
    loadTrayTemplates();
  }, []);

  useEffect(() => {
    if (activeTab === "issued") loadIssuedList();
  }, [activeTab]);

  const loadDevices = () => {
    axiosInstance
      .post("SampleStorageNew/GetDeviceList", { CentreID: centreId })
      .then((res) => {
        if (res?.data?.success) {
          setDevices(Array.isArray(res?.data?.message) ? res.data.message : []);
        } else {
          toast.error(res?.data?.message || t("Failed to load devices"));
        }
      })
      .catch((err) => toast.error(err?.response?.data?.message || t("Failed to load devices")));

    axiosInstance
      .post("SampleStorageNew/GetDeviceSummary", { CentreID: centreId })
      .then((res) => {
        if (res?.data?.success) {
          const map = {};
          (Array.isArray(res?.data?.message) ? res.data.message : []).forEach(
            (s) => { if (s?.DeviceID) map[s.DeviceID] = s; }
          );
          setDeviceSummary(map);
        } else {
          toast.error(res?.data?.message || t("Failed to load device summary"));
        }
      })
      .catch(() => {});
  };

  const loadTrayTemplates = () => {
    axiosInstance
      .post("SampleStorageNew/GetTrayTemplateList", {CentreID: centreId})
      .then((res) => {
        if (res?.data?.success) {
          setTrayTemplates(Array.isArray(res?.data?.message) ? res.data.message : []);
        } else {
          toast.error(res?.data?.message || t("Failed to load tray templates"));
        }
      })
      .catch((err) => toast.error(err?.response?.data?.message || t("Failed to load templates")));
  };

  const loadTraysForDevice = (deviceId) => {
    axiosInstance
      .post("SampleStorageNew/GetTrayList", { DeviceID: deviceId })
      .then((res) => {
        if (res?.data?.success && Array.isArray(res?.data?.message)) {
          const data = res?.data?.message;
          const activeList = data.filter((d) => d?.IsDeleted == 0);
          setTrays(activeList);
        } else {
          setTrays([]);
        }
      })
      .catch((err) => {
        setTrays([]);
        toast.error(err?.response?.data?.message || t("Failed to load trays"));
      });
  };

  const loadTrayGrid = (trayId) => {
    setIsTrayLoading(true);
    axiosInstance
      .post("SampleStorageNew/GetTrayGrid", { TrayID: trayId })
      .then((res) => {
        if(res?.data?.success){
          const msg = res?.data?.message;
          const cellList = Array.isArray(msg?.cells) ? msg.cells : [];
          const cells = {};
          cellList
          .filter((c) => c.isOccupied)
          .forEach((c) => { cells[c.positionIndex] = c; });
          setTrayGridCells(cells);
        } else {
          toast.error(res?.data?.message || t("Failed to load tray grid"));
        }
      })
      .catch((err) => toast.error(err?.response?.data?.message || t("Failed to load tray grid")))
      .finally(() => setIsTrayLoading(false));
  };

  const loadDeviceSummary = () => {
    axiosInstance
      .post("SampleStorageNew/GetDeviceSummary", { CentreID: centreId })
      .then((res) => {
        if(res?.data?.success){
          const map = {};
          (Array.isArray(res?.data?.message) ? res.data.message : []).forEach(
            (s) => { if (s?.DeviceID) map[s.DeviceID] = s; }
          );
          setDeviceSummary(map);
        } else {
          toast.error(res?.data?.message || t("Failed to load device summary"));
        }
      })
      .catch(() => {});
  };

  const loadIssuedList = () => {
    axiosInstance
      .post("SampleStorageNew/GetStorageReport", {
        ReportType: "Issued",
        FromDate: "",
        ToDate: "",
        CentreID: centreId,
        DeviceID: 0,
      })
      .then((res) => {
        setIssuedList(Array.isArray(res?.data?.message) ? res.data.message : []);
      })
      .catch(() => setIssuedList([]));
  };

  // ─── Derived ────────────────────────────────────────────────────────────────

  const racksForDevice = useMemo(
    () =>
      selectedDevice
        ? Array.from({ length: selectedDevice?.NumRacks ?? 0 }, (_, i) => i + 1)
        : [],
    [selectedDevice]
  );

  const traysForRack = (rackNum) => trays.filter((tr) => tr?.RackNumber === rackNum);

  const selectedTpl = selectedTray
    ? { rows: selectedTray?.Rows, cols: selectedTray?.Cols }
    : null;

  const trayGrid = useMemo(() => {
    if (!selectedTray || !selectedTpl) return [];
    return Array.from({ length: selectedTpl.rows * selectedTpl.cols }, (_, i) => {
      const cell = trayGridCells[i];
      const status = cell ? getCellStatus(cell) : "empty";
      return { index: i, cell, status };
    });
  }, [selectedTray, selectedTpl, trayGridCells]);

  const trayTemplateOptions = useMemo(
    () => trayTemplates.map((tp) => ({ label: `${tp?.TemplateName} - ${tp?.Rows}x${tp?.Cols}`, value: tp?.TemplateID })),
    [trayTemplates]
  );

  const defaultTemplateId = useMemo(
    () => trayTemplates.find((tp) => tp.IsDefault)?.TemplateID || "",
    [trayTemplates]
  );

  const statusCountFor = (val) => {
    const getFromSummary = (s) => {
      if (!val) return s.TotalStored || 0;
      if (val === "ok") return s.SafeCount || 0;
      if (val === "warning") return s.WarningCount || 0;
      if (val === "critical") return s.CriticalCount || 0;
      if (val === "expired") return s.ExpiredCount || 0;
      return 0;
    };

    if (selectedTray) {
      if (!val) return Object.keys(trayGridCells).length;
      const serverStatus = { safe: "ok", warning: "warning", critical: "critical", expired: "expired" };
      return Object.values(trayGridCells).filter(
        (c) => (serverStatus[c.retentionStatus?.toLowerCase()] || getStatusFromDaysLeft(c.daysLeft, c.retentionDays)) === val
      ).length;
    }
    if (selectedDevice) return getFromSummary(deviceSummary[selectedDevice.DeviceID] || {});
    return Object.values(deviceSummary).reduce((acc, s) => acc + getFromSummary(s), 0);
  };

  // ─── Handlers ───────────────────────────────────────────────────────────────

  const handleDeviceSelect = (dev) => {
    setSelectedDevice(dev);
    setSelectedTray(null);
    setTrays([]);
    setTrayGridCells({});
    setStagedSamples({});
    setDiscardSelection([]);
    if (dev?.DeviceID) loadTraysForDevice(dev.DeviceID);
  };

  const handleTraySelect = (tray) => {
    setSelectedTray(tray);
    setTrayGridCells({});
    setStagedSamples({});
    setDiscardSelection([]);
    if (tray?.TrayID) loadTrayGrid(tray.TrayID);
  };

  const handleScanSIN = () => {
    if (!sinInput.trim()) { toast.warning(t("Enter barcode number")); return; }
    if (!selectedTray) { toast.warning(t("Select a tray first")); return; }

    const trimmedSIN = sinInput.trim();

    const alreadyStaged = Object.values(stagedSamples).some(
      (s) => (s?.barcodeNo || s?.BarcodeNo || "").toLowerCase() === trimmedSIN.toLowerCase()
    );
    if (alreadyStaged) { toast.error(t("This barcode is already staged in the tray")); return; }

    const alreadyInTray = Object.values(trayGridCells).some(
      (c) => (c?.barcodeNo || c?.BarcodeNo || "").toLowerCase() === trimmedSIN.toLowerCase()
    );
    if (alreadyInTray) { toast.error(t("This barcode is already stored in this tray")); return; }

    axiosInstance
      .post("SampleStorageNew/ValidateSIN", { SIN: trimmedSIN })
      .then((res) => {
        if(res?.data?.success){
          const data = res?.data?.message;
          let nextPos = -1;
          for (let i = 0; i < (selectedTpl?.rows ?? 0) * (selectedTpl?.cols ?? 0); i++) {
            if (!trayGridCells[i] && !stagedSamples[i]) { nextPos = i; break; }
          }
          if (nextPos === -1) { toast.error(t("Tray is full")); return; }
          
          setStagedSamples((prev) => ({
            ...prev,
            [nextPos]: {
              barcodeNo: trimmedSIN,
              patientName: data?.PatientName || data?.patientName || "Unknown",
              sampleName: data?.SampleName || data?.sampleName || "",
              collectedOn: data?.CollectedOn || data?.collectedOn || new Date().toISOString().split("T")[0],
              retentionDays: data?.RetentionDays || data?.retentionDays || 30,
              daysLeft: data?.RetentionDays || data?.retentionDays || 30,
              _staged: true,
            },
          }));
          setSinInput("");
          toast.success(`${trimmedSIN} ${t("staged at")} ${getPosLabel(nextPos, selectedTpl?.cols ?? 1)}`);
        } else {
          toast.error(res?.data?.message?.message || t("Invalid barcode"));
        }
      })
      .catch((err) => {
        toast.error(err?.response?.data?.message || t("Validation failed"));
      });
  };

  const handleSaveStagedSamples = () => {
    if (Object.keys(stagedSamples).length === 0) { toast.warning(t("No staged samples")); return; }

    const samples = Object.entries(stagedSamples).map(([posIdx, s]) => ({
      BarcodeNo: s?.barcodeNo || s?.BarcodeNo,
      TrayID: selectedTray?.TrayID,
      PositionIndex: Number(posIdx),
      RetentionDays: s?.retentionDays || s?.RetentionDays,
      CollectedOn: s?.collectedOn || s?.CollectedOn,
    }));

    axiosInstance
      .post("SampleStorageNew/StoreBatch", { CentreID: centreId, Samples: samples })
      .then((res) => {
        if (res?.data?.success) {
        toast.success(res?.data?.message || t("Samples stored successfully"));
        setStagedSamples({});
        if (selectedTray?.TrayID) loadTrayGrid(selectedTray.TrayID);
        loadDeviceSummary();
        if (selectedDevice?.DeviceID) loadTraysForDevice(selectedDevice.DeviceID);
        } else {
          toast.error(res?.data?.message[0] || t("Failed to store samples"));
        }
      })
      .catch((err) => {
        toast.error(err?.response?.data?.message || t("Failed to store samples"));
      });
  };

  const handleCellClick = (gridCell) => {
    if (activeTab === "store") {
      if (stagedSamples[gridCell.index]) {
        setStagedSamples((prev) => { const n = { ...prev }; delete n[gridCell.index]; return n; });
        return;
      }
      if (gridCell?.cell) {
        const cell = gridCell.cell;
        const location = `${selectedDevice?.DeviceCode ?? ""} / R-${String(selectedTray?.RackNumber ?? "").padStart(2, "0")} / ${selectedTray?.TrayLabel ?? ""}`;
        const barcodeNo = cell.barcodeNo || cell.BarcodeNo || "";
        axiosInstance
          .post("SampleStorageNew/FindSample", { SearchText: barcodeNo, CentreID: centreId })
          .then((res) => {
            const found = Array.isArray(res?.data?.message) ? res.data.message[0] : null;
            setIssueTarget({
              ...cell,
              location,
              storageID: found?.StorageID ?? found?.storageID ?? null,
            });
          })
          .catch(() => setIssueTarget({ ...cell, location }))
          .finally(() => setShowIssueModal(true));
      }
    } else if (activeTab === "discard") {
      if (gridCell.cell) {
        const sid = gridCell.cell.storageID ?? gridCell.cell.StorageID ?? gridCell.cell.positionIndex;
        const alreadySelected = discardSelection.includes(sid);
        if (!alreadySelected && gridCell.status !== "expired") {
          toast.warning(t("Only expired samples can be selected for discard"));
          return;
        }
        setDiscardSelection((prev) =>
          prev.includes(sid) ? prev.filter((s) => s !== sid) : [...prev, sid]
        );
      }
    }
  };

  const handleSelectAllExpired = () => {
    if (!selectedTray) return;
    const expiredIds = Object.values(trayGridCells)
      .filter((c) => getCellStatus(c) === "expired")
      .map((c) => c.storageID ?? c.StorageID ?? c.positionIndex);
    setDiscardSelection(expiredIds);
    toast.info(`${expiredIds.length} ${t("expired samples selected")}`);
  };

  const handleDiscardSelected = () => {
    if (!discardReason.trim()) { toast.warning(t("Enter discard reason")); return; }
    if (discardSelection.length === 0) { toast.warning(t("Select samples to discard")); return; }

    axiosInstance
      .post("SampleStorageNew/DiscardSamples", {
        PositionIndex: discardSelection,
        TrayID: [selectedTray?.TrayID],
        DiscardReason: discardReason,
        CentreID: centreId,
      })
      .then((res) => {
        if (res?.data?.success) {
        toast.success(res?.data?.message || t("Samples discarded"));
        setDiscardSelection([]);
        setDiscardReason("");
        if (selectedTray?.TrayID) loadTrayGrid(selectedTray.TrayID);
        loadDeviceSummary();
        if (selectedDevice?.DeviceID) loadTraysForDevice(selectedDevice.DeviceID);
        } else {
          toast.error(res?.data?.message || t("Failed to discard samples"));
        }
      })
      .catch((err) => {
        toast.error(err?.response?.data?.message || t("Failed to discard"));
      });
  };

  const handleDiscardEntireTray = () => {
    if (!selectedTray) return;
    if (!discardReason.trim()) { toast.warning(t("Enter discard reason")); return; }

    const hasNonExpired = Object.values(trayGridCells).some((c) => getCellStatus(c) !== "expired");
    if (hasNonExpired) {
      toast.warning(t("This tray has non-expired samples. Discard the expired samples individually, or wait until all samples expire."));
      return;
    }

    axiosInstance
      .post("SampleStorageNew/DiscardEntireTray", {
        TrayID: selectedTray?.TrayID,
        DiscardReason: discardReason,
        CentreID: centreId,
      })
      .then((res) => {
        if(res?.data?.success){
        toast.success(res?.data?.message || t("Tray discarded"));
        setDiscardSelection([]);
        setDiscardReason("");
        setTrayGridCells({});
        if (selectedTray?.TrayID) loadTrayGrid(selectedTray.TrayID);
        loadDeviceSummary();
        if (selectedDevice?.DeviceID) loadTraysForDevice(selectedDevice.DeviceID);
        } else {
          toast.error(res?.data?.message || t("Failed to discard tray"));
        }
      })
      .catch((err) => {
        toast.error(err?.response?.data?.message || t("Failed to discard tray"));
      });
  };

  const handleIssueSave = (form) => {
    axiosInstance
      .post("SampleStorageNew/IssueSample", {
        StorageID: issueTarget.storageID ?? issueTarget.StorageID,
        BarcodeNo: issueTarget.barcodeNo || issueTarget.BarcodeNo,
        IssuedTo: form.issuedTo,
        IssuedBy: form.issuedBy,
        IssuedFor: form.issuedFor,
        InvoiceAgainst: form.invoiceAgainst,
        CentreID: centreId,
      })
      .then((res) => {
        if(res?.data?.success){
          toast.success(res?.data?.message || t("Sample issued successfully"));
          setShowIssueModal(false);
          setIssueTarget(null);
          if (selectedTray?.TrayID) loadTrayGrid(selectedTray.TrayID);
          loadDeviceSummary();
          if (selectedDevice?.DeviceID) loadTraysForDevice(selectedDevice.DeviceID);
        } else {
          toast.error(res?.data?.message || t("Failed to issue sample"));
        }
      })
      .catch((err) => {
        toast.error(err?.response?.data?.message || t("Failed to issue sample"));
      });
  };

  const handlePlaceTray = (form) => {
    axiosInstance
      .post("SampleStorageNew/PlaceTray", {
        DeviceID: placeTrayTarget.DeviceID,
        RackNumber: placeTrayTarget.RackNumber,
        TrayLabel: form.label,
        TemplateID: Number(form.templateName),
      })
      .then((res) => {
        if(res?.data?.success){
          toast.success(res?.data?.message || t("Tray placed successfully"));
          setShowPlaceTrayModal(false);
          if (selectedDevice?.DeviceID) loadTraysForDevice(selectedDevice.DeviceID);
        } else {
          toast.error(res?.data?.message || t("Failed to place tray"));
        }
      })
      .catch((err) => {
        toast.error(err?.response?.data?.message || t("Failed to place tray"));
      });
  };

  const openPlaceTray = (rackNum) => {
    if (!selectedDevice) return;
    setPlaceTrayTarget({ DeviceID: selectedDevice.DeviceID, RackNumber: rackNum });
    setShowPlaceTrayModal(true);
  };

  const handleDeleteTrayConfirm = () => {
    if (!deleteTrayConfirm) return;
    axiosInstance
      .post("SampleStorageNew/DiscardEntireTray", {
        TrayID: deleteTrayConfirm?.TrayID,
        DiscardReason: "Deleted from tray panel",
        CentreID: centreId,
      })
      .then((res) => {
        if (res?.data?.success) {
          toast.success(res?.data?.message || t("Tray deleted successfully"));
          setDeleteTrayConfirm(null);
          if (selectedTray?.TrayID === deleteTrayConfirm?.TrayID) {
            setSelectedTray(null);
            setTrayGridCells({});
            setStagedSamples({});
          }
          if (selectedDevice?.DeviceID) loadTraysForDevice(selectedDevice.DeviceID);
          loadDeviceSummary();
        } else {
          toast.error(res?.data?.message || t("Failed to delete tray"));
        }
      })
      .catch((err) => {
        toast.error(err?.response?.data?.message || t("Failed to delete tray"));
      });
  };

  const handleFindSample = () => {
    if (!globalSearch.trim()) { setGlobalResults([]); return; }
    axiosInstance
      .post("SampleStorageNew/FindSample", {
        SearchText: globalSearch.trim(),
        CentreID: centreId,
      })
      .then((res) => {
        if(res?.data?.success){
          const list = Array.isArray(res?.data?.message) ? res.data.message : [];
          if (list.length === 0) toast.info(t("No samples found"));
          setGlobalResults(list);
        } else {
          toast.error(res?.data?.message || t("Search failed"));
          setGlobalResults([]);
        }
      })
      .catch((err) => {
        toast.error(err?.response?.data?.message || t("Search failed"));
        setGlobalResults([]);
      });
  };

  // ─── Shared tray grid renderer ───────────────────────────────────────────────

  
  // ─── secondTitle elements ────────────────────────────────────────────────────

  const filterSecondTitle = (
    <TableFilterDot
      items={FILTER_ITEMS}
      getColor={(v) => (v ? STATUS_META[v]?.dot : "#6c757d")}
      onSelect={(v) => setStatusFilter((prev) => (prev === v ? "" : v))}
      statusCount={statusCountFor}
      bgColor="transparent"
      label={""}
      className="px-1"
    />
  );

  const renderTrayGrid = () => {
    if (!selectedTray || !selectedTpl) {
      if (!selectedDevice)
        return (
          <p className="text-muted text-center py-5" style={{ fontSize: 13 }}>
            <FaBoxOpen size={28} className="d-block mx-auto mb-2" style={{ opacity: 0.3 }} />
            {t("Select a device from the left panel to begin")}
          </p>
        );
      return (
        <p className="text-muted text-center py-5" style={{ fontSize: 13 }}>
          {t("Select a tray from the rack panel on the left")}
        </p>
      );
    }

    if (isTrayLoading) {
      const skeletonCount = (selectedTpl?.rows ?? 5) * (selectedTpl?.cols ?? 10);
      return (
        <>
          <style>{`@keyframes shimmer{0%{background-position:-400px 0}100%{background-position:400px 0}}.sk{background:linear-gradient(90deg,#f0f0f0 25%,#e0e0e0 50%,#f0f0f0 75%);background-size:800px 100%;animation:shimmer 1.4s infinite linear;}`}</style>
          <div style={{ display: "grid", gridTemplateColumns: `16px repeat(${selectedTpl?.cols ?? 10}, 1fr)`, gap: 4 }}>
            <div />
            {Array.from({ length: selectedTpl?.cols ?? 10 }, (_, i) => (
              <div key={`sh-${i}`} style={{ fontSize: 8, color: "#b0b7c3", textAlign: "center", fontWeight: 700, paddingBottom: 2 }}>{i + 1}</div>
            ))}
            {Array.from({ length: selectedTpl?.rows ?? 5 }).flatMap((_, row) => [
              <div key={`rl-${row}`} style={{ fontSize: 8, color: "#b0b7c3", textAlign: "center", fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center" }}>
                {String.fromCharCode(65 + row)}
              </div>,
              ...Array.from({ length: selectedTpl?.cols ?? 10 }, (_, col) => (
                <div key={`sk-${row}-${col}`} className="sk" style={{ minHeight: 48, borderRadius: 6 }} />
              )),
            ])}
          </div>
        </>
      );
    }

    const sc = { ok: 0, warning: 0, critical: 0, expired: 0 };
    trayGrid.forEach((c) => { if (c.cell) sc[c.status]++; });
    const provCount = Object.keys(stagedSamples).length;
    const freeCells = trayGrid.filter((c) => !c.cell && !stagedSamples[c.index]).length;

    return (
      <>
        <style>{`.tray-cell:hover{transform:scale(1.07);z-index:3;box-shadow:0 4px 14px rgba(0,0,0,0.2)!important;border-color:#3b82f6!important;}`}</style>

        {/* Breadcrumb + mini stats */}
        <div className="d-flex flex-wrap align-items-center justify-content-between mb-2 gap-2">
          <div className="d-flex align-items-center gap-1" style={{ fontSize: 13 }}>
            <span
              style={{ color: "#3b82f6", fontWeight: 600, cursor: "pointer" }}
              title={t("Click to deselect tray")}
              onClick={() => { setSelectedTray(null); setTrayGridCells({}); setStagedSamples({}); }}
            >
              {selectedDevice?.DeviceCode}
            </span>
            <span style={{ color: "#d1d5db", margin: "0 2px" }}>›</span>
            <span style={{ color: "#6b7280", fontWeight: 500 }}>R-{String(selectedTray?.RackNumber ?? "").padStart(2, "0")}</span>
            <span style={{ color: "#d1d5db", margin: "0 2px" }}>›</span>
            <span style={{ fontWeight: 700, color: "#111827" }}>{selectedTray?.TrayLabel}</span>
            <span style={{ marginLeft: 6, fontSize: 10, color: "#9ca3af", background: "#f3f4f6", padding: "1px 6px", borderRadius: 8 }}>
              {selectedTpl?.rows}×{selectedTpl?.cols}
            </span>
          </div>
          <div className="d-flex flex-column align-items-end gap-1">
            <div className="d-flex align-items-center gap-1 flex-wrap justify-content-end">
              {provCount > 0 && (
                <span style={{ fontSize: 10, color: "#1d4ed8", background: "#dbeafe", padding: "2px 7px", borderRadius: 10, fontWeight: 600 }}>
                  {provCount} staged
                </span>
              )}
              <span style={{ fontSize: 10, color: "#6b7280", background: "#f3f4f6", padding: "2px 7px", borderRadius: 10 }}>{freeCells} free</span>
            <div>
              {filterSecondTitle}
            </div>
            </div>
          </div>
        </div>

        {/* Grid with axis labels */}
        <div style={{ display: "grid", gridTemplateColumns: `16px repeat(${selectedTpl.cols}, 1fr)`, gap: 4 }}>
          {/* top-left corner */}
          <div />
          {/* column numbers */}
          {Array.from({ length: selectedTpl.cols }, (_, i) => (
            <div key={`ch-${i}`} style={{ fontSize: 8, color: "#b0b7c3", textAlign: "center", fontWeight: 700, paddingBottom: 2 }}>
              {i + 1}
            </div>
          ))}
          {/* rows */}
          {Array.from({ length: selectedTpl.rows }).flatMap((_, row) => {
            const rowLabel = String.fromCharCode(65 + row);
            return [
              <div key={`rl-${row}`} style={{ fontSize: 8, color: "#b0b7c3", textAlign: "center", fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center" }}>
                {rowLabel}
              </div>,
              ...trayGrid.slice(row * selectedTpl.cols, (row + 1) * selectedTpl.cols).map((gridCell) => {
                const isProvisional = !!stagedSamples[gridCell?.index];
                const isForDiscard = gridCell?.cell && discardSelection.includes(gridCell.cell.storageID ?? gridCell.cell.StorageID ?? gridCell.cell.positionIndex);
                const sampleToRender = gridCell?.cell || stagedSamples[gridCell?.index];
                const isDimmed = statusFilter && gridCell?.cell && gridCell.status !== statusFilter;
                const posLabel = getPosLabel(gridCell?.index, selectedTpl?.cols);
                const meta = STATUS_META[gridCell?.cell ? gridCell.status : "empty"];

                const barcodeNo = sampleToRender?.barcodeNo || sampleToRender?.BarcodeNo || "";
                const retentionDays = sampleToRender?.retentionDays || sampleToRender?.RetentionDays || 30;
                const collectedOn = safeDateStr(sampleToRender?.collectedOn || sampleToRender?.CollectedOn);
                const daysLeft = sampleToRender?.daysLeft;

                let barColor = "#22c55e", retPct = 0;
                if (sampleToRender) {
                  if (daysLeft != null) {
                    const pct = retentionDays > 0 ? (daysLeft / retentionDays) * 100 : 0;
                    if (daysLeft <= 0) barColor = "#9ca3af";
                    else if (pct <= 25) barColor = "#ef4444";
                    else if (pct <= 50) barColor = "#f59e0b";
                    else barColor = "#22c55e";
                  } else {
                    const retMs = retentionDays * 86400000;
                    retPct = Math.min((Date.now() - new Date(collectedOn)?.getTime()) / retMs, 1);
                    const pct = (1 - retPct) * 100;
                    if (retPct >= 1) barColor = "#9ca3af";
                    else if (pct <= 25) barColor = "#ef4444";
                    else if (pct <= 50) barColor = "#f59e0b";
                  }
                }

                const fillPct = daysLeft != null
                  ? Math.max(0, Math.min(100, (daysLeft / retentionDays) * 100))
                  : Math.max(0, (1 - retPct) * 100);

                return (
                  <div
                    key={gridCell?.index}
                    className="tray-cell"
                    data-tooltip-id={sampleToRender ? "tray-cell-tip" : undefined}
                    data-cell-index={sampleToRender ? String(gridCell?.index) : undefined}
                    onClick={() => handleCellClick(gridCell)}
                    style={{
                      minHeight: 48,
                      border: `1.5px ${isProvisional ? "dashed" : "solid"} ${
                        isForDiscard ? "#ef4444" : (sampleToRender ? meta.border + "88" : "#e9ecef")
                      }`,
                      borderRadius: 6,
                      background: isForDiscard ? "#fef2f2" : (sampleToRender ? meta.bg : "#fafafa"),
                      cursor: sampleToRender || activeTab === "discard" ? "pointer" : "default",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      padding: "5px 3px 9px",
                      position: "relative",
                      overflow: "hidden",
                      opacity: isDimmed ? 0.2 : (isProvisional ? 0.75 : 1),
                      boxShadow: isForDiscard ? "inset 0 0 0 2px #ef4444" : "none",
                      transition: "transform 0.1s, box-shadow 0.15s, opacity 0.2s",
                    }}
                  >
                    <div style={{ fontSize: 9, fontWeight: 700, color: isProvisional ? "#1d4ed8" : "#111827", textAlign: "center", lineHeight: 1.2, wordBreak: "break-all", width: "100%", padding: "0 2px" }}>
                      {sampleToRender ? barcodeNo : ""}
                    </div>
                    <div style={{ fontSize: 8, color: sampleToRender ? meta.text : "#d1d5db", marginTop: 2 }}>
                      {posLabel}
                    </div>
                    {sampleToRender && (
                      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 3, background: "rgba(0,0,0,0.07)", borderRadius: "0 0 4px 4px" }}>
                        <div style={{ position: "absolute", top: 0, bottom: 0, left: 0, width: `${fillPct}%`, background: barColor, borderRadius: fillPct >= 99 ? "0 0 4px 4px" : "0 0 0 4px", transition: "width 0.4s ease" }} />
                      </div>
                    )}
                  </div>
                );
              }),
            ];
          })}
        </div>

        <Tooltip
          id="tray-cell-tip"
          place="top"
          style={{ backgroundColor: "#1e293b", color: "#f1f5f9", borderRadius: 10, padding: "10px 13px", maxWidth: 250, fontSize: 12, lineHeight: 1.65, zIndex: 99999 }}
          render={({ activeAnchor }) => {
            const idx = Number(activeAnchor?.getAttribute("data-cell-index"));
            const cell = trayGridCells[idx] || stagedSamples[idx];
            if (!cell) return null;
            const bc = cell?.barcodeNo || cell?.BarcodeNo || "";
            const pName = cell?.patientName || cell?.PatientName || "";
            const sName = cell?.sampleName || cell?.SampleName || "";
            const co = safeDateStr(cell?.collectedOn || cell?.CollectedOn);
            const so = safeDateStr(cell?.storedOn);
            const sb = cell?.storedBy || "";
            const eo = cell?.expiryOn || "";
            const dl = cell?.daysLeft;
            const rd = cell?.retentionDays || cell?.RetentionDays || 30;
            const fp = dl != null ? Math.max(0, Math.min(100, (dl / rd) * 100)) : 0;
            const dc = dl != null && dl <= 0 ? "#9ca3af" : fp <= 25 ? "#ef4444" : fp <= 50 ? "#f59e0b" : "#22c55e";
            const dlabel = dl != null ? (dl <= 0 ? "⛔ Expired" : `${dl}d left`) : `${rd}d retention`;
            return (
              <div style={{ minWidth: 190 }}>
                <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 5 }}>🧪 {bc}</div>
                {pName && <div>👤 {pName}</div>}
                {sName && <div>🔬 {sName}</div>}
                {(pName || sName) && <div style={{ margin: "5px 0", height: 1, background: "rgba(255,255,255,0.15)" }} />}
                {co && <div>📅 Collected: {co}</div>}
                {so && <div>📦 Stored: {so}</div>}
                {eo && <div>⏳ Expiry: {eo}</div>}
                {sb && <div>🏥 {sb}</div>}
                <div style={{ marginTop: 7, display: "flex", alignItems: "center", gap: 7 }}>
                  <div style={{ flex: 1, height: 4, background: "rgba(255,255,255,0.15)", borderRadius: 3, overflow: "hidden" }}>
                    <div style={{ width: `${fp}%`, height: "100%", background: dc, borderRadius: 3 }} />
                  </div>
                  <span style={{ fontWeight: 700, fontSize: 11, color: dc }}>{dlabel}</span>
                </div>
              </div>
            );
          }}
        />

        {activeTab === "discard" && discardSelection.length > 0 && (
          <p className="text-muted mt-2 mb-0" style={{ fontSize: 11 }}>
            {discardSelection.length} {t("cells selected")} · {t("click selected cell to deselect")}
          </p>
        )}
      </>
    );
  };

  // ─── Tab contents ────────────────────────────────────────────────────────────

  const provCount = Object.keys(stagedSamples).length;

  const storeTabContent = (
    <div className="p-3">
      <div className="row g-2 mb-3 align-items-start">
        <div className="col-12 col-md-5">
          <Input
            type="text" name="sinInput" lable="Scan / Enter Barcode"
            value={sinInput}
            onChange={(e) => setSinInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") handleScanSIN(); }}
            respclass=""
          />
        </div>
        <div className="col-auto"><SearchButton text="Scan" onClick={handleScanSIN} /></div>
        {provCount > 0 && (
          <>
            <div className="col-auto">
              <SaveButton text={`Save ${provCount} Staged`} onClick={handleSaveStagedSamples} />
            </div>
            <div className="col-auto">
              <CancelButton text="Clear Staged" onClick={() => setStagedSamples({})} />
            </div>
          </>
        )}
      </div>
      {provCount > 0 && (
        <div className="alert alert-info py-2 px-3 mb-3" style={{ fontSize: 12 }}>
          <strong>{provCount}</strong> {t("sample(s) staged (dashed border) — click a staged cell to remove it, or Save All to confirm storage.")}
        </div>
      )}
      {renderTrayGrid()}
    </div>
  );

  const discardTabContent = (
    <div className="p-3">
      <div className="row g-2 mb-3 align-items-start flex-wrap">
        <div className="col-12 col-md-4">
          <Input
            type="text" name="discardReason" lable="Discard Reason"
            value={discardReason}
            onChange={(e) => setDiscardReason(e.target.value)}
            respclass="" required={true}
          />
        </div>
        <div className="col-auto">
          <CustomButton text="Select All Expired" icon="filter" onClick={handleSelectAllExpired} />
        </div>
        {discardSelection.length > 0 && (
          <>
            <div className="col-auto">
              <CancelButton text="Clear Selection" onClick={() => setDiscardSelection([])} />
            </div>
            <div className="col-auto">
              <DeleteButton text={`Discard ${discardSelection.length} Selected`} onClick={handleDiscardSelected} />
            </div>
          </>
        )}
        {selectedTray && (
          <div className="col-auto">
            <DeleteButton text="Discard Entire Tray" onClick={handleDiscardEntireTray} />
          </div>
        )}
      </div>
      {renderTrayGrid()}
    </div>
  );

  const issuedTabContent = (
    <div className="p-3">
      {issuedList.length === 0 ? (
        <p className="text-muted text-center py-4" style={{ fontSize: 13 }}>{t("No samples issued yet")}</p>
      ) : (
        <Tables>
          <thead>
            <tr>
              <th>#</th>
              <th>{t("Barcode")}</th>
              <th>{t("Collected On")}</th>
              <th>{t("Issued On")}</th>
              <th>{t("Issued To")}</th>
              <th>{t("Issued By")}</th>
              <th>{t("Purpose")}</th>
              <th>{t("Invoice")}</th>
              <th>{t("Location")}</th>
            </tr>
          </thead>
          <tbody>
            {issuedList.map((s, i) => (
              <tr key={i}>
                <td>{i + 1}</td>
                <td><strong>{s?.BarcodeNo}</strong></td>
                <td style={{ fontSize: 12 }}>{s?.CollectedOn}</td>
                <td style={{ fontSize: 12 }}>{s?.IssuedOn}</td>
                <td>{s?.IssuedTo}</td>
                <td>{s?.IssuedBy}</td>
                <td>{s?.IssuedFor}</td>
                <td>{s?.InvoiceAgainst}</td>
                <td style={{ fontSize: 12 }}>{s?.Location}</td>
              </tr>
            ))}
          </tbody>
        </Tables>
      )}
    </div>
  );

  const tabs = [
    { id: "store",   label: t("Store"),      content: storeTabContent  },
    { id: "discard", label: t("Discard"),     content: discardTabContent },
    { id: "issued",  label: t("Issued Log"),  content: issuedTabContent  },
  ];


  const searchSecondTitle = (
    <div className="d-flex align-items-center" style={{ gap: 6 }}>
      <button
        onClick={(e) => { e.stopPropagation(); setShowReportsModal(true); }}
        className="btn btn-sm btn-secondary d-flex align-items-center gap-1"
        style={{ fontSize: 12 }}
        title={t("Reports")}
      >
        <FaChartBar size={11} />
      </button>
      <button
        onClick={(e) => { e.stopPropagation(); setShowSettingsModal(true); }}
        className="btn btn-sm btn-secondary d-flex align-items-center gap-1"
        style={{ fontSize: 12 }}
        title={t("Settings")}
      >
        <FaCog size={12} />
      </button>
    </div>
  );

  // ─── Render ──────────────────────────────────────────────────────────────────

  return (
    <div className={`container-fluid ${theme || ""}`}>

      {/* Accordion 1 — Search + Filter */}
      <Accordion
        name="Sample Storage"
        isBreadcrumb={true}
        defaultValue={true}
        seconTitle={searchSecondTitle}
      >
        <div className="card-body">
          <div className="row g-2 align-items-start">
            <div className="col-md-3 col-6">
              <Input
                type="text" name="globalSearch" lable="Find Sample — Barcode / Patient"
                value={globalSearch}
                onChange={(e) => setGlobalSearch(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") handleFindSample(); }}
                respclass=""
              />
            </div>
            <div className="col-auto">
              <SearchButton text="Search" onClick={handleFindSample} />
            </div>
            {globalSearch.trim() && (
              <div className="col-auto">
                <CancelButton text="Clear" onClick={() => { setGlobalSearch(""); setGlobalResults([]); }} />
              </div>
            )}
          </div>

          {globalResults.length > 0 && (
            <div className="mt-3">
              <Tables>
                <thead>
                  <tr>
                    <th>#</th>
                    <th>{t("Barcode")}</th>
                    <th>{t("Collected On")}</th>
                    <th>{t("Stored On")}</th>
                    <th>{t("Device")}</th>
                    <th>{t("Rack")}</th>
                    <th>{t("Tray")}</th>
                    <th>{t("Position")}</th>
                    <th>{t("Location")}</th>
                    <th>{t("Status")}</th>
                    <th>{t("Action")}</th>
                  </tr>
                </thead>
                <tbody>
                  {globalResults?.map((s, i) => {
                    const status = getRetentionStatus(s?.CollectedOn, s?.RetentionDays);
                    return (
                      <tr key={i}>
                        <td>{i + 1}</td>
                        <td><strong>{s?.BarcodeNo}</strong></td>
                        <td style={{ fontSize: 12 }}>{s?.CollectedOn}</td>
                        <td style={{ fontSize: 12 }}>{s?.StoredOn}</td>
                        <td>{s?.DeviceCode}</td>
                        <td>{s?.RackNumber}</td>
                        <td>{s?.TrayLabel}</td>
                        <td>{s?.PositionLabel}</td>
                        <td style={{ fontSize: 12 }}>{s?.Location}</td>
                        <td>
                          <span style={{ padding: "2px 8px", borderRadius: 10, fontSize: 11, fontWeight: 600, background: STATUS_META[status]?.bg, color: STATUS_META[status]?.text }}>
                            {STATUS_META[status]?.label}
                          </span>
                        </td>
                        <td>
                          <CustomButton text="Issue" icon="forword" onClick={() => {
                            setIssueTarget({
                              barcodeNo: s.BarcodeNo,
                              collectedOn: s.CollectedOn,
                              storedOn: s.StoredOn,
                              location: s.Location,
                              StorageID: s.StorageID,
                              storageID: s.StorageID,
                              BarcodeNo: s.BarcodeNo,
                            });
                            setShowIssueModal(true);
                          }} />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </Tables>
            </div>
          )}
        </div>
      </Accordion>

      {/* Accordion 2 — Storage View */}
      <Accordion
        title="Storage View"
        defaultValue={true}
      >
        <div className="mx-2">
          <div className="d-flex flex-column flex-md-row gap-3">

            {/* ── Left panel (35%) ── */}
            <div style={{ width: "100%", flexShrink: 0 }} id="storage-left-panel">
              <style>{`@media (min-width: 768px) { #storage-left-panel { width: 35% !important; } }`}</style>
              <div style={{ maxHeight: 680, overflowY: "auto", overflowX: "hidden", paddingRight: 4, scrollbarWidth: "thin" }}>

                {devices.length === 0 ? (
                  <p className="text-muted" style={{ fontSize: 13 }}>{t("No devices")}</p>
                ) : (
                  <div>
                    <CenterSection label={t("Devices")} />
                    {devices.map((dev) => {
                      const summary = deviceSummary[dev.DeviceID] || {};
                      return (
                        <React.Fragment key={dev.DeviceID}>
                          <DeviceCard
                            dev={dev}
                            isActive={selectedDevice?.DeviceID === dev.DeviceID}
                            totalCapacity={summary.TotalCapacity || 0}
                            totalStored={summary.TotalStored || 0}
                            safeCount={summary.SafeCount || 0}
                            warningCount={summary.WarningCount || 0}
                            criticalCount={summary.CriticalCount || 0}
                            expiredCount={summary.ExpiredCount || 0}
                            onClick={() => handleDeviceSelect(dev)}
                          />
                          {selectedDevice?.DeviceID === dev.DeviceID && (
                            <div className="mt-2 mb-1">
                              <CenterSection label={`Racks & Trays — ${dev?.DeviceCode ?? ""}`} />
                              {racksForDevice.map((r) => (
                                <RackRow
                                  key={r}
                                  rackNum={r}
                                  trays={traysForRack(r)}
                                  selectedTrayId={selectedTray?.TrayID}
                                  onTraySelect={handleTraySelect}
                                  onAddTray={openPlaceTray}
                                  onDeleteTray={(tray) => setDeleteTrayConfirm(tray)}
                                />
                              ))}
                            </div>
                          )}
                        </React.Fragment>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* ── Right panel (65%) ── */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <CustomTabs tabs={tabs} activeTab={activeTab} onSelect={(k) => { setActiveTab(k); setDiscardSelection([]); }} />
            </div>

          </div>
        </div>
      </Accordion>

      {/* Modals */}
      <Modal
        visible={!!deleteTrayConfirm}
        setVisible={() => setDeleteTrayConfirm(null)}
        Header={`Delete Tray — ${deleteTrayConfirm?.TrayLabel || ""}`}
        modalWidth="35vw"
        buttons={
          <>
            <CancelButton text="No" onClick={() => setDeleteTrayConfirm(null)} />
            <DeleteButton text="Yes, Delete" onClick={handleDeleteTrayConfirm} />
          </>
        }
      >
        <p style={{ fontSize: 13, marginBottom: 4 }}>
          Are you sure you want to delete tray <strong>{deleteTrayConfirm?.TrayLabel}</strong>?
        </p>
        <p className="text-danger mb-0" style={{ fontSize: 12 }}>
          All samples in this tray will be discarded.
        </p>
      </Modal>

      <IssueModal
        visible={showIssueModal}
        setVisible={setShowIssueModal}
        issueTarget={issueTarget}
        onSave={handleIssueSave}
      />
      <PlaceTrayModal
        visible={showPlaceTrayModal}
        setVisible={setShowPlaceTrayModal}
        trayTemplateOptions={trayTemplateOptions}
        defaultTemplateId={defaultTemplateId}
        onSave={handlePlaceTray}
      />
      <SettingsModal
        visible={showSettingsModal}
        setVisible={setShowSettingsModal}
        devices={devices}
        trayTemplates={trayTemplates}
        centreId={centreId}
        selectedDevice={selectedDevice}
        setSelectedDevice={setSelectedDevice}
        setSelectedTray={setSelectedTray}
        onRefresh={() => { loadDevices(); loadTrayTemplates(); }}
      />
      <ReportsModal
        visible={showReportsModal}
        setVisible={setShowReportsModal}
        centreId={centreId}
      />

    </div>
  );
};

export default SampleStorageNew;
