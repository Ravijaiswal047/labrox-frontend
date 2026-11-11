import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import moment from "moment";
import { FaTools, FaCheckCircle } from "react-icons/fa";
import Input from "../../components/formComponent/Input";
import ReactSelect from "../../components/formComponent/ReactSelect";
import { CustomButton } from "../../components/UI/CustomButton";
import Loading from "../../components/loader/Loading";
import Tables from "../../components/UI/customTable";
import ColorCodingSearch from "../../components/ModalComponent/ColorCodingSearch";
import Modal from "../../components/ModalComponent/Modal";
import {
  bindCentresForRadiology,
  getCentreDepartmentMapping,
  getMachinesByDepartment,
  saveMachineBreakdown,
  getMachineBreakdownHistory,
} from "./api";

const colorCodingData = [
  { color: "#dcfce7", id: "1", labelKey: "Working",   status: true  },
  { color: "#fee2e2", id: "2", labelKey: "Breakdown", status: false },
];

const MachineBreakdown = () => {
  // ── Centre / Department ─────────────────────────────────────────────────
  const [centres,     setCentres]     = useState([]);
  const [centreId,    setCentreId]    = useState("");
  const [departments, setDepartments] = useState([]);
  const [deptId,      setDeptId]      = useState("");

  // ── Machines ─────────────────────────────────────────────────────────────
  const [machines,        setMachines]        = useState([]);
  const [machinesLoading, setMachinesLoading] = useState(false);
  const [searchText,      setSearchText]      = useState("");
  const [saving,          setSaving]          = useState(null); // machineId being toggled

  // ── Mark-breakdown modal (reason entry) ─────────────────────────────────
  const [breakdownModal, setBreakdownModal] = useState({ visible: false, machine: null, reason: "" });

  // ── History modal ────────────────────────────────────────────────────────
  const [historyModal, setHistoryModal] = useState({ visible: false, machine: null, rows: [], loading: false });

  useEffect(() => { loadCentres(); }, []);

  const loadCentres = async () => {
    try {
      const res = await bindCentresForRadiology();
      setCentres(
        (res?.data?.message || []).map((c) => ({
          value: c.CentreId ?? c.CentreID,
          label: c.Centre ?? c.CentreName,
        }))
      );
    } catch {
      toast.error("Failed to load centres.");
    }
  };

  const handleCentreChange = async (name, option) => {
    const newCentreId = option?.value || "";
    setCentreId(newCentreId);
    setDeptId("");
    setMachines([]);
    setSearchText("");
    if (!newCentreId) { setDepartments([]); return; }
    try {
      const res = await getCentreDepartmentMapping(newCentreId);
      setDepartments(
        (res?.data?.message || [])
          .filter((d) => d.IsActive)
          .map((d) => ({ value: d.DepartmentId, label: d.DepartmentName }))
      );
    } catch {
      toast.error("Failed to load departments for this centre.");
      setDepartments([]);
    }
  };

  const handleDeptChange = async (name, option) => {
    const newDeptId = option?.value || "";
    setDeptId(newDeptId);
    setMachines([]);
    setSearchText("");
    if (newDeptId) loadMachines(newDeptId);
  };

  // GetMachinesByDepartment returns camelCase fields (machineId, machineName,
  // isBreakdown, ...) — normalize to PascalCase here so the rest of the
  // component (and Machine & Slot Master's own shape) can stay consistent.
  const normalizeMachine = (m) => ({
    ...m,
    MachineId:        m.machineId ?? m.MachineId,
    MachineName:      m.machineName ?? m.MachineName,
    RoomNo:           m.roomNo ?? m.RoomNo,
    IsActive:         m.isActive ?? m.IsActive,
    IsBreakdown:      m.isBreakdown ?? m.IsBreakdown,
    BreakdownReason:  m.breakdownReason ?? m.BreakdownReason,
    BreakdownDate:    m.breakdownDate ?? m.BreakdownDate ?? m.breakdownSince ?? m.BreakdownSince,
  });

  const loadMachines = async (departmentId) => {
    setMachinesLoading(true);
    try {
      const res  = await getMachinesByDepartment({ DepartmentId: departmentId, CentreId: centreId });
      const data = res?.data?.message ?? res?.data;
      const list = Array.isArray(data) ? data : data ? [data] : [];
      setMachines(list.map(normalizeMachine));
    } catch {
      toast.error("Failed to load machines.");
      setMachines([]);
    } finally {
      setMachinesLoading(false);
    }
  };

  const isBrokenDown = (m) => m?.IsBreakdown === true || m?.IsBreakdown === 1;

  // ── mark a working machine as broken down (needs a reason) ────────────────
  const openBreakdownModal = (machine) =>
    setBreakdownModal({ visible: true, machine, reason: "" });

  const confirmBreakdown = async () => {
    const { machine, reason } = breakdownModal;
    if (!reason.trim()) { toast.warn("Please enter a reason for the breakdown."); return; }
    await toggleBreakdown(machine, true, reason.trim());
    setBreakdownModal({ visible: false, machine: null, reason: "" });
  };

  // ── mark a broken-down machine as fixed / back in service ─────────────────
  const markFixed = (machine) => toggleBreakdown(machine, false, "");

  const toggleBreakdown = async (machine, isBreakdown, reason) => {
    setSaving(machine.MachineId);
    try {
      const res = await saveMachineBreakdown({
        machineId:   machine.MachineId,
        centreId,
        departmentId: deptId,
        isBreakdown,
        reason,
      });
      if (res?.data?.success) {
        toast.success(isBreakdown ? "Machine marked as breakdown." : "Machine marked as working again.");
        loadMachines(deptId);
      } else {
        toast.error(res?.data?.message || "Failed to update machine status.");
      }
    } catch {
      toast.error("Something went wrong.");
    } finally {
      setSaving(null);
    }
  };

  const normalizeHistoryRow = (r) => ({
    Id:             r.id ?? r.Id,
    Reason:         r.reason ?? r.Reason,
    BreakdownDate:  r.breakdownDate ?? r.BreakdownDate,
    FixedDate:      r.fixedDate ?? r.FixedDate,
    MarkedBy:       r.markedBy ?? r.MarkedBy,
  });

  const openHistory = async (machine) => {
    setHistoryModal({ visible: true, machine, rows: [], loading: true });
    try {
      const res = await getMachineBreakdownHistory({ MachineId: machine.MachineId, CentreId: centreId, DepartmentId: deptId });
      const rows = (res?.data?.message || []).map(normalizeHistoryRow);
      setHistoryModal({ visible: true, machine, rows, loading: false });
    } catch {
      toast.error("Failed to load breakdown history.");
      setHistoryModal({ visible: true, machine, rows: [], loading: false });
    }
  };

  const filteredMachines = machines.filter((m) =>
    !searchText || m?.MachineName?.toLowerCase().includes(searchText.toLowerCase())
  );
  const workingCount   = filteredMachines.filter((m) => !isBrokenDown(m)).length;
  const breakdownCount = filteredMachines.filter((m) => isBrokenDown(m)).length;
  const deptReady = !!centreId && !!deptId;

  return (
    <div className="card patient_registration_card open">
      <div className="card-header mb-1">
        <h4 className="card-title w-100 d-flex align-items-center justify-content-between mb-0">
          <label className="text-nowrap m-0">Machine Breakdown</label>
        </h4>
      </div>

      <div className="row pt-2 pl-2 pr-2 align-items-end">
        <div className="col-sm-2">
          <ReactSelect
            id="MBCentre" name="centreId" placeholderName="Centre *"
            dynamicOptions={centres} value={centreId} onChange={handleCentreChange}
          />
        </div>
        <div className="col-sm-2">
          <ReactSelect
            id="MBDept" name="deptId" placeholderName="Department *"
            dynamicOptions={departments} value={deptId} onChange={handleDeptChange}
          />
        </div>
        {deptReady && (
          <div className="col-sm-3">
            <Input
              type="text" id="MBSearch" lable="Search Machine"
              value={searchText} onChange={(e) => setSearchText(e.target.value)}
            />
          </div>
        )}
      </div>

      {deptReady && (
        <>
          <div className="d-flex align-items-center pl-2 pr-2 mt-2 mb-2" style={{ gap: "5px", flexWrap: "wrap" }}>
            {colorCodingData.map(({ color, labelKey, id, status }) => (
              <ColorCodingSearch
                key={id}
                color={color}
                label={`${labelKey} (${status ? workingCount : breakdownCount})`}
              />
            ))}
          </div>

          {machinesLoading ? (
            <Loading />
          ) : (
            <div className="pl-2 pr-2" style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
                <thead>
                  <tr style={{ background: "#eff6ff", textAlign: "left" }}>
                    {["S.No", "Machine Name", "Room No", "Status", "Breakdown Reason", "Breakdown Since", "Actions"].map((h) => (
                      <th key={h} style={{ padding: "8px 10px", fontWeight: 700, color: "#1e293b", borderBottom: "2px solid #dbeafe" }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredMachines.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center text-muted py-3">
                        {machines.length === 0
                          ? "No machines found for this department."
                          : "No machines match the search."}
                      </td>
                    </tr>
                  ) : (
                    filteredMachines.map((machine, idx) => {
                      const broken = isBrokenDown(machine);
                      return (
                        <tr
                          key={machine.MachineId}
                          style={{ background: broken ? "#fef2f2" : (idx % 2 === 0 ? "#fff" : "#fafbfc"), borderBottom: "1px solid #f1f5f9" }}
                        >
                          <td style={{ padding: "8px 10px" }}>{idx + 1}</td>
                          <td style={{ padding: "8px 10px", fontWeight: 600 }}>{machine.MachineName}</td>
                          <td style={{ padding: "8px 10px" }}>{machine.RoomNo || "-"}</td>
                          <td style={{ padding: "8px 10px" }}>
                            <span
                              style={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "5px",
                                padding: "4px 12px",
                                borderRadius: "999px",
                                fontSize: "11px",
                                fontWeight: 700,
                                letterSpacing: "0.02em",
                                background: broken ? "#fef2f2" : "#f0fdf4",
                                color: broken ? "#b91c1c" : "#15803d",
                                border: `1px solid ${broken ? "#fecaca" : "#bbf7d0"}`,
                              }}
                            >
                              {broken ? <FaTools size={10} /> : <FaCheckCircle size={10} />}
                              {broken ? "Breakdown" : "Working"}
                            </span>
                          </td>
                          <td style={{ padding: "8px 10px" }}>{broken ? (machine.BreakdownReason || "-") : "-"}</td>
                          <td style={{ padding: "8px 10px" }}>
                            {broken && (machine.BreakdownDate || machine.BreakdownSince)
                              ? moment(machine.BreakdownDate || machine.BreakdownSince).format("DD-MMM-YYYY hh:mm A")
                              : "-"}
                          </td>
                          <td style={{ padding: "8px 10px" }}>
                            <div className="d-flex gap-2">
                              {broken ? (
                                <CustomButton
                                  text="Mark Fixed"
                                  variant="success"
                                  onClick={() => markFixed(machine)}
                                  disabled={saving === machine.MachineId}
                                />
                              ) : (
                                <CustomButton
                                  text="Mark Breakdown"
                                  variant="danger"
                                  onClick={() => openBreakdownModal(machine)}
                                  disabled={saving === machine.MachineId}
                                />
                              )}
                              <CustomButton
                                text="History"
                                variant="info"
                                onClick={() => openHistory(machine)}
                                className="ml-2"
                              />
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {/* ── Mark breakdown — reason entry ────────────────────────────────── */}
      <Modal
        Header={`Mark Breakdown${breakdownModal.machine ? ` — ${breakdownModal.machine.MachineName}` : ""}`}
        visible={breakdownModal.visible}
        setVisible={(v) => setBreakdownModal((p) => ({ ...p, visible: v }))}
        modalWidth="40%"
        children={
          <div>
            <Input
              type="text"
              id="MBReason"
              lable="Reason for breakdown *"
              value={breakdownModal.reason}
              onChange={(e) => setBreakdownModal((p) => ({ ...p, reason: e.target.value }))}
            />
            <div className="d-flex justify-content-end mt-3">
              <CustomButton
                text="Confirm Breakdown"
                variant="danger"
                onClick={confirmBreakdown}
                disabled={saving === breakdownModal.machine?.MachineId}
              />
            </div>
          </div>
        }
      />

      {/* ── Breakdown history ────────────────────────────────────────────── */}
      <Modal
        Header={`Breakdown History${historyModal.machine ? ` — ${historyModal.machine.MachineName}` : ""}`}
        visible={historyModal.visible}
        setVisible={(v) => setHistoryModal((p) => ({ ...p, visible: v }))}
        modalWidth="60%"
        children={
          historyModal.loading ? (
            <Loading />
          ) : historyModal.rows.length === 0 ? (
            <div className="text-center text-muted py-3">No breakdown history for this machine.</div>
          ) : (
            <Tables>
              <thead className="cf">
                <tr>
                  <th>S.No</th>
                  <th>Reason</th>
                  <th>Broke Down At</th>
                  <th>Fixed At</th>
                  <th>Marked By</th>
                </tr>
              </thead>
              <tbody>
                {historyModal.rows.map((r, idx) => (
                  <tr key={r.Id ?? idx}>
                    <td>{idx + 1}</td>
                    <td>{r.Reason || "-"}</td>
                    <td>{r.BreakdownDate ? moment(r.BreakdownDate).format("DD-MMM-YYYY hh:mm A") : "-"}</td>
                    <td>{r.FixedDate ? moment(r.FixedDate).format("DD-MMM-YYYY hh:mm A") : "Still down"}</td>
                    <td>{r.MarkedBy || "-"}</td>
                  </tr>
                ))}
              </tbody>
            </Tables>
          )
        }
      />
    </div>
  );
};

export default MachineBreakdown;
