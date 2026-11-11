import React, { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import Input from "../../components/formComponent/Input";
import ReactSelect from "../../components/formComponent/ReactSelect";
import { SaveButton, EditButton, CancelButton, CustomButton } from "../../components/UI/CustomButton";
import Loading from "../../components/loader/Loading";
import Tables from "../../components/UI/customTable";
import ColorCodingSearch from "../../components/ModalComponent/ColorCodingSearch";
import Modal from "../../components/ModalComponent/Modal";
import "./MachineSlotMaster.css";
import {
  bindCentresForRadiology,
  getCentreDepartmentMapping,
  getMachinesByDepartment,
  saveMachine,
  updateMachine,
  getSlotMaster,
  saveSlotMaster,
} from "./api";

const EMPTY_MACHINE_FORM = {
  machineId:   0,
  machineName: "",
  roomNo:      "",
  isActive:    true,
  // Recurring daily lunch window — set once here, applies every day until
  // edited (unlike Block Slot Master, which blocks specific dates). Empty
  // means no lunch break configured for this machine.
  lunchStartTime: "",
  lunchEndTime:   "",
};

const EMPTY_SLOT_DRAFT = { avgTime: 15, slots: [], hasExisting: false };

const colorCodingData = [
  { color: "#FFFFFF", id: "1", labelKey: "Active",    status: true  },
  { color: "#f5c6cb", id: "2", labelKey: "In Active", status: false },
];

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

const defaultSlots = () =>
  DAYS.map((day) => ({
    day,
    startTime: "09:00",
    endTime:   "17:00",
    isActive:  day !== "Sunday",
  }));

// calculates number of slots from startTime → endTime with avgTime interval
function calcSlotCount({ startTime, endTime }, avgTime) {
  if (!startTime || !endTime || !avgTime || avgTime < 1) return 0;
  const [sh, sm] = startTime.split(":").map(Number);
  const [eh, em] = endTime.split(":").map(Number);
  const totalMin = (eh * 60 + em) - (sh * 60 + sm);
  if (totalMin <= 0) return 0;
  return Math.floor(totalMin / Number(avgTime));
}

// ── Book Slot modal content: weekly schedule editor for the machine
// currently loaded in the form above (new draft or one being edited) ────────
const SlotBookingModal = ({ slotDraft, setSlotDraft, onClose }) => {
  const { avgTime, slots, hasExisting } = slotDraft;

  const updateSlot = (dayIndex, field, value) =>
    setSlotDraft((prev) => ({
      ...prev,
      slots: prev.slots.map((s, i) => (i === dayIndex ? { ...s, [field]: value } : s)),
    }));

  const setAvgTime = (value) => setSlotDraft((prev) => ({ ...prev, avgTime: value }));

  const activeCount   = slots.filter((s) => s.isActive).length;
  const inactiveCount = slots.length - activeCount;

  if (slots.length === 0) {
    return (
      <div
        className="text-center py-5"
        style={{ background: "#f0f9ff", border: "1px solid #bae6fd", borderRadius: 8, color: "#0c4a6e" }}
      >
        <div style={{ fontSize: 32, marginBottom: 8 }}>📋</div>
        <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 6 }}>No slot configuration yet</div>
        <div style={{ fontSize: 12, color: "#0369a1", marginBottom: 16 }}>
          Set up the weekly schedule for this machine. Click below to start with the default 7-day template.
        </div>
        <button
          type="button"
          className="btn btn-sm btn-primary"
          onClick={() => setSlotDraft((prev) => ({ ...prev, slots: defaultSlots() }))}
        >
          + Add Slot Configuration
        </button>
      </div>
    );
  }

  return (
    <div>
      <div
        className="d-flex align-items-center gap-2 mb-2 px-3 py-2 rounded"
        style={{
          background: hasExisting ? "#dcfce7" : "#fef9c3",
          border:     `1px solid ${hasExisting ? "#86efac" : "#fde047"}`,
          color:      hasExisting ? "#15803d" : "#854d0e",
          fontSize:   12,
        }}
      >
        <span>
          {hasExisting
            ? "✓ Loaded from saved configuration — editing existing slots."
            : "⚠ New configuration — click Save on the main form to persist these slots."}
        </span>
      </div>

      <div className="d-flex align-items-center gap-3 mb-2" style={{ fontSize: 12 }}>
        <span className="d-flex align-items-center gap-1">
          <span style={{ width: 12, height: 12, borderRadius: 2, background: "#dcfce7", border: "1px solid #86efac", display: "inline-block" }} />
          Active ({activeCount})
        </span>
        <span className="d-flex align-items-center gap-1">
          <span style={{ width: 12, height: 12, borderRadius: 2, background: "#fee2e2", border: "1px solid #fca5a5", display: "inline-block" }} />
          Inactive ({inactiveCount})
        </span>
        <span className="d-flex align-items-center gap-2">
          <strong>Avg Time per Slot (min) *</strong>
          <input
            type="number"
            className="form-control form-control-sm"
            value={avgTime}
            min={1}
            max={120}
            onChange={(e) => setAvgTime(e.target.value)}
            style={{ width: 90 }}
          />
        </span>
      </div>

      <div style={{ border: "1px solid #e2e8f0", borderRadius: 8, overflow: "hidden" }}>
        <table className="table table-sm mb-0" style={{ fontSize: "13px" }}>
          <thead className="cf">
            <tr>
              <th style={{ width: "120px" }}>Day</th>
              <th style={{ width: "130px" }}>Start Time</th>
              <th style={{ width: "130px" }}>End Time</th>
              <th style={{ width: "80px", textAlign: "center" }}>Active</th>
              <th style={{ color: "#64748b", fontWeight: 400 }}>Preview slots</th>
            </tr>
          </thead>
          <tbody>
            {slots.map((slot, i) => {
              const previewCount = calcSlotCount(slot, avgTime);
              return (
                <tr
                  key={slot.day}
                  style={{
                    background: slot.isActive ? "#f0fdf4" : "#fef2f2",
                    opacity: slot.isActive ? 1 : 0.7,
                  }}
                >
                  <td style={{ fontWeight: 600, color: "#1e293b", paddingLeft: 12 }}>
                    {slot.day}
                  </td>
                  <td>
                    <input
                      type="time"
                      className="form-control form-control-sm"
                      value={slot.startTime}
                      disabled={!slot.isActive}
                      onChange={(e) => updateSlot(i, "startTime", e.target.value)}
                      style={{ width: 110 }}
                    />
                  </td>
                  <td>
                    <input
                      type="time"
                      className="form-control form-control-sm"
                      value={slot.endTime}
                      disabled={!slot.isActive}
                      onChange={(e) => updateSlot(i, "endTime", e.target.value)}
                      style={{ width: 110 }}
                    />
                  </td>
                  <td style={{ textAlign: "center" }}>
                    <label className="switch">
                      <input
                        type="checkbox"
                        checked={slot.isActive}
                        onChange={(e) => updateSlot(i, "isActive", e.target.checked)}
                      />
                      <span className="slider"></span>
                    </label>
                  </td>
                  <td style={{ color: "#64748b", fontSize: "12px" }}>
                    {slot.isActive && previewCount > 0
                      ? `${slot.startTime} → ${slot.endTime} · ${previewCount} slot(s) × ${avgTime} min`
                      : slot.isActive
                      ? "—"
                      : "Day off"}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="d-flex justify-content-end mt-3">
        <button type="button" className="btn btn-sm btn-primary" onClick={onClose}>
          Done
        </button>
      </div>
    </div>
  );
};

const MachineSlotMaster = () => {
  // ── Centre / Department ─────────────────────────────────────────────────
  const [centres,     setCentres]     = useState([]);
  const [centreId,    setCentreId]    = useState("");
  const [centreName,  setCentreName]  = useState("");
  const [departments, setDepartments] = useState([]);
  const [deptId,      setDeptId]      = useState("");
  const [deptName,    setDeptName]    = useState("");

  // ── Machines (fetched once per department) ──────────────────────────────
  const [machines,        setMachines]        = useState([]);
  const [machinesLoading, setMachinesLoading] = useState(false);

  // ── Machine add/edit form + its slot draft (booked via modal, both are
  // saved together in one action from the Save/Update button) ────────────
  const [machineForm,       setMachineForm]       = useState(EMPTY_MACHINE_FORM);
  const [machineEditId,     setMachineEditId]     = useState(null);
  const [machineSaving,     setMachineSaving]     = useState(false);
  const [machineSearchText, setMachineSearchText] = useState("");

  const [slotDraft,        setSlotDraft]        = useState(EMPTY_SLOT_DRAFT);
  const [slotModalOpen,    setSlotModalOpen]    = useState(false);
  const [slotDraftLoading, setSlotDraftLoading] = useState(false);

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

  const resetMachineForm = () => {
    setMachineForm(EMPTY_MACHINE_FORM);
    setMachineEditId(null);
    setSlotDraft(EMPTY_SLOT_DRAFT);
  };

  const resetDeptDownstream = () => {
    setMachines([]);
    setMachineSearchText("");
    resetMachineForm();
  };

  const handleCentreChange = async (name, option) => {
    const newCentreId = option?.value || "";
    setCentreId(newCentreId);
    setCentreName(option?.label || "");
    setDeptId("");
    setDeptName("");
    resetDeptDownstream();
    if (!newCentreId) { setDepartments([]); return; }
    try {
      const res = await getCentreDepartmentMapping(newCentreId);
      setDepartments(
        (res?.data?.message || [])
          .filter((d) => d.IsActive)
          .map((d) => ({
            value: d.DepartmentId,
            label: d.DepartmentName,
          }))
      );
    } catch {
      toast.error("Failed to load departments for this centre.");
      setDepartments([]);
    }
  };

  const handleDeptChange = async (name, option) => {
    const newDeptId = option?.value || "";
    setDeptId(newDeptId);
    setDeptName(option?.label || "");
    resetDeptDownstream();
    if (newDeptId) loadMachines(newDeptId);
  };

  // GetMachinesByDepartment returns camelCase fields (machineId, machineName,
  // roomNo, isActive, departmentName, centreName, createdInfo, updatedInfo)
  // — normalize to PascalCase so the rest of this component can stay as-is.
  const normalizeMachine = (m) => ({
    ...m,
    MachineId:       m.machineId ?? m.MachineId,
    MachineName:     m.machineName ?? m.MachineName,
    RoomNo:          m.roomNo ?? m.RoomNo,
    IsActive:        m.isActive ?? m.IsActive,
    DepartmentName:  m.departmentName ?? m.DepartmentName,
    CentreName:      m.centreName ?? m.CentreName,
    CreatedInfo:     m.createdInfo ?? m.CreatedInfo,
    UpdatedInfo:     m.updatedInfo ?? m.UpdatedInfo,
    LunchStartTime:  m.lunchStartTime ?? m.LunchStartTime ?? "",
    LunchEndTime:    m.lunchEndTime   ?? m.LunchEndTime   ?? "",
  });

  const loadMachines = async (departmentId) => {
    setMachinesLoading(true);
    try {
      const res  = await getMachinesByDepartment({ DepartmentId: departmentId, CentreId: centreId });
      const data = res?.data?.message ?? res?.data;
      const list = (Array.isArray(data) ? data : data ? [data] : []).map(normalizeMachine);
      setMachines(list);
      return list;
    } catch {
      toast.error("Failed to load machines.");
      setMachines([]);
      return [];
    } finally {
      setMachinesLoading(false);
    }
  };

  // ── Slot draft: fetch existing saved schedule for a given machine so the
  // Book Slot modal opens pre-filled when editing ────────────────────────
  const fetchSlotsForMachine = async (machineId) => {
    setSlotDraftLoading(true);
    try {
      const res  = await getSlotMaster({ CentreId: centreId, DepartmentId: deptId, MachineId: machineId });
      const data = res?.data?.message;
      if (Array.isArray(data) && data.length > 0) {
        const merged = defaultSlots().map((def) => {
          const found = data.find((s) => (s.Day ?? s.day) === def.day);
          if (!found) return { ...def, isActive: false };
          // API returns "09:00:00" — trim to "09:00" for <input type="time">
          const trimTime = (t) => (t ? String(t).substring(0, 5) : "");
          return {
            day:       found.Day       ?? found.day,
            startTime: trimTime(found.StartTime ?? found.startTime) || def.startTime,
            endTime:   trimTime(found.EndTime   ?? found.endTime)   || def.endTime,
            isActive:  (found.IsActive ?? found.isActive) === 1 || (found.IsActive ?? found.isActive) === true,
          };
        });
        const firstAvgTime = data.find((s) => (s.AvgTime ?? s.avgTime))?.AvgTime ?? data[0]?.AvgTime ?? data[0]?.avgTime;
        setSlotDraft({ avgTime: firstAvgTime ?? 15, slots: merged, hasExisting: true });
      } else {
        setSlotDraft({ avgTime: 15, slots: [], hasExisting: false });
      }
    } catch {
      toast.error("Failed to load slot data.");
      setSlotDraft({ avgTime: 15, slots: [], hasExisting: false });
    } finally {
      setSlotDraftLoading(false);
    }
  };

  // ── Machine + Slot combined save ────────────────────────────────────────
  const handleMachineSave = async () => {
    if (!centreId)                        { toast.warn("Please select a centre.");      return; }
    if (!deptId)                           { toast.warn("Please select a department."); return; }
    if (!machineForm.machineName.trim())   { toast.warn("Machine name is required.");    return; }
    if (!!machineForm.lunchStartTime !== !!machineForm.lunchEndTime) {
      toast.warn("Set both Lunch Start and Lunch End (or leave both empty).");
      return;
    }
    if (machineForm.lunchStartTime && machineForm.lunchStartTime >= machineForm.lunchEndTime) {
      toast.warn("Lunch End must be after Lunch Start.");
      return;
    }

    const slotsConfigured = slotDraft.slots.length > 0;
    if (slotsConfigured) {
      if (!slotDraft.avgTime || slotDraft.avgTime < 1) {
        toast.warn("Avg time (interval) must be at least 1 min.");
        return;
      }
      for (const s of slotDraft.slots) {
        if (s.isActive) {
          if (!s.startTime) { toast.warn(`Start time required for ${s.day}.`); return; }
          if (!s.endTime)   { toast.warn(`End time required for ${s.day}.`);   return; }
          if (s.startTime >= s.endTime) {
            toast.warn(`End time must be after start time for ${s.day}.`); return;
          }
        }
      }
    }

    setMachineSaving(true);
    try {
      const payload = {
        machineId:    machineForm.machineId,
        machineName:  machineForm.machineName.trim(),
        departmentId: deptId,
        centreId,
        centreName,
        roomNo:       machineForm.roomNo.trim(),
        isActive:     machineForm.isActive,
        lunchStartTime: machineForm.lunchStartTime || null,
        lunchEndTime:   machineForm.lunchEndTime   || null,
      };
      const isEdit = !!machineForm.machineId;
      const res    = isEdit ? await updateMachine(payload) : await saveMachine(payload);
      if (res?.data?.success !== true) {
        toast.error(res?.data?.message || "Failed to save machine.");
        return;
      }

      let machineId = machineForm.machineId;
      if (!isEdit) {
        const msg = res?.data?.message;
        if (typeof msg === "number") machineId = msg;
        else if (msg && typeof msg === "object") machineId = msg.MachineId ?? msg.machineId ?? machineId;
      }

      const freshList = await loadMachines(deptId);
      if (!machineId) {
        const match = [...freshList].reverse().find(
          (m) => m.MachineName?.toLowerCase() === payload.machineName.toLowerCase()
        );
        machineId = match?.MachineId;
      }

      if (slotsConfigured && machineId) {
        const slotPayload = {
          centreId,
          departmentId:   deptId,
          departmentName: deptName,
          machineId,
          slots: slotDraft.slots.map((s) => ({
            day:       s.day,
            startTime: s.startTime,
            endTime:   s.endTime,
            avgTime:   Number(slotDraft.avgTime),
            isActive:  s.isActive,
          })),
        };
        const slotRes = await saveSlotMaster(slotPayload);
        if (slotRes?.data?.success === true) {
          toast.success("Machine and slots saved successfully.");
        } else {
          toast.error(slotRes?.data?.message || "Machine saved, but slots failed to save.");
        }
      } else if (slotsConfigured && !machineId) {
        toast.warn("Machine saved, but couldn't resolve its ID to save slots. Edit it again to add slots.");
      } else {
        toast.success(res.data.message || (isEdit ? "Machine updated." : "Machine added."));
      }

      resetMachineForm();
    } catch {
      toast.error("Something went wrong.");
    } finally {
      setMachineSaving(false);
    }
  };

  const handleMachineEdit = (machine) => {
    setMachineForm({
      machineId:   machine.MachineId,
      machineName: machine.MachineName,
      roomNo:      machine.RoomNo ?? "",
      isActive:    machine.IsActive ?? true,
      lunchStartTime: machine.LunchStartTime ?? "",
      lunchEndTime:   machine.LunchEndTime   ?? "",
    });
    setMachineEditId(machine.MachineId);
    fetchSlotsForMachine(machine.MachineId);
  };

  const filteredMachines = useMemo(() => {
    const data = Array.isArray(machines) ? machines : [];
    if (!machineSearchText) return data;
    const s = machineSearchText.toLowerCase();
    return data.filter(
      (m) =>
        m?.MachineName?.toLowerCase().includes(s) ||
        m?.RoomNo?.toLowerCase().includes(s)
    );
  }, [machines, machineSearchText]);

  const activeMachineCount   = filteredMachines.filter((m) => (m?.IsActive ?? true) === true).length;
  const inactiveMachineCount = filteredMachines.filter((m) => (m?.IsActive ?? true) === false).length;

  const deptReady         = !!centreId && !!deptId;
  const bookedActiveCount = slotDraft.slots.filter((s) => s.isActive).length;

  return (
    <div className="card patient_registration_card open">
      <div className="card-header mb-1">
        <h4 className="card-title w-100 d-flex align-items-center justify-content-between mb-0">
          <label className="text-nowrap m-0">Radiology Machine &amp; Slot Master</label>
        </h4>
      </div>

      <div className="row pt-2 pl-2 pr-2">
        <div className="col-sm-2">
          <ReactSelect
            id="MSCentre"
            name="centreId"
            placeholderName="Centre *"
            dynamicOptions={centres}
            value={centreId}
            onChange={handleCentreChange}
          />
        </div>
        <div className="col-sm-2">
          <ReactSelect
            id="MSDept"
            name="deptId"
            placeholderName="Department *"
            dynamicOptions={departments}
            value={deptId}
            onChange={handleDeptChange}
          />
        </div>
        <div className="msm-toolbar pl-2 pr-2 mb-1">
            <div className="msm-field msm-machine-name">
              <Input
                id="MSMachineName"
                name="machineName"
                lable="Machine Name *"
                value={machineForm.machineName}
                onChange={(e) => setMachineForm((p) => ({ ...p, machineName: e.target.value }))}
              />
            </div>
            <div className="msm-field msm-room-no">
              <Input
                id="MSMachineRoomNo"
                name="roomNo"
                lable="Room No"
                placeholder=" "
                value={machineForm.roomNo}
                onChange={(e) => setMachineForm((p) => ({ ...p, roomNo: e.target.value }))}
              />
            </div>
            {/* Floating label matching Machine Name/Room No's look, but as
                its own self-contained CSS (not the shared .lable/.truncate
                classes <Input> uses) — those overlap the label onto the
                input's top border in a way that clips against native
                type="time" inputs (their browser chrome renders taller/
                differently than a text input), cutting the label text in
                half. Same visual, without inheriting that bug. */}
            <div className="msm-field msm-lunch-time" style={{ position: "relative" }}>
              <input
                id="MSMachineLunchStart"
                name="lunchStartTime"
                type="time"
                className="form-control form-control-sm"
                value={machineForm.lunchStartTime}
                onChange={(e) => setMachineForm((p) => ({ ...p, lunchStartTime: e.target.value }))}
              />
              <label htmlFor="MSMachineLunchStart" className="msm-floating-label">
                Lunch Start
              </label>
            </div>
            <div className="msm-field msm-lunch-time" style={{ position: "relative" }}>
              <input
                id="MSMachineLunchEnd"
                name="lunchEndTime"
                type="time"
                className="form-control form-control-sm"
                value={machineForm.lunchEndTime}
                onChange={(e) => setMachineForm((p) => ({ ...p, lunchEndTime: e.target.value }))}
              />
              <label htmlFor="MSMachineLunchEnd" className="msm-floating-label">
                Lunch End
              </label>
            </div>
            <div className="msm-field mb-2">
              <CustomButton
                text={`Book Slot${bookedActiveCount > 0 ? ` (${bookedActiveCount})` : ""}`}
                icon="clock"
                variant="info"
                onClick={() => setSlotModalOpen(true)}
                disabled={machineSaving || slotDraftLoading}
              />
            </div>
            <div className="msm-field d-flex align-items-center mb-2 text-nowrap">
              <label className="switch">
                <input
                  type="checkbox"
                  checked={machineForm.isActive}
                  onChange={(e) => setMachineForm((p) => ({ ...p, isActive: e.target.checked }))}
                />
                <span className="slider"></span>
              </label>
              <strong className="ml-2 mb-1">IsActive</strong>
            </div>
            <div className="msm-field d-flex align-items-center mb-2" style={{ gap: 8 }}>
              <SaveButton
                text={machineEditId ? "Update" : "Save"}
                onClick={handleMachineSave}
                disabled={machineSaving}
                loading={machineSaving}
              />
              {machineEditId && (
                <CancelButton text="Cancel" onClick={resetMachineForm} disabled={machineSaving} />
              )}
            </div>
            {/* <div className="msm-field msm-search mb-2">
              <Input
                type="text"
                placeholder="Search Machine..."
                value={machineSearchText}
                onChange={(e) => setMachineSearchText(e.target.value)}
              />
            </div> */}
          </div>
      </div>

      {deptReady && (
        <>
          

          {/* Machine + slot booking, all on one line: name, room, book slot, active toggle, save, search */}
          

          <div className="d-flex align-items-center pl-2 pr-2 mb-2" style={{ gap: "5px", flexWrap: "wrap" }}>
            {colorCodingData.map(({ color, labelKey, id, status }) => (
              <ColorCodingSearch
                key={id}
                color={color}
                label={`${labelKey} (${status ? activeMachineCount : inactiveMachineCount})`}
              />
            ))}
          </div>

          {machinesLoading ? (
            <Loading />
          ) : (
            <Tables>
              <thead className="cf">
                <tr>
                  <th>S.No</th>
                  <th>Machine Name</th>
                  <th>Department</th>
                  <th>Room No</th>
                  <th>Lunch</th>
                  <th>Centre</th>
                  <th>Created Info</th>
                  <th>Updated Info</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredMachines.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="text-center text-muted py-3">
                      {machines.length === 0
                        ? "No machines added for this department yet."
                        : "No machines match the search."}
                    </td>
                  </tr>
                ) : (
                  filteredMachines.map((machine, idx) => (
                    <tr
                      key={machine.MachineId}
                      style={{
                        backgroundColor: !(machine.IsActive ?? true)
                          ? colorCodingData.find((i) => i.status === false)?.color
                          : "",
                      }}
                    >
                      <td>{idx + 1}</td>
                      <td>{machine.MachineName}</td>
                      <td>{machine.DepartmentName || deptName || "-"}</td>
                      <td>{machine.RoomNo || "-"}</td>
                      <td>
                        {machine.LunchStartTime && machine.LunchEndTime
                          ? `${machine.LunchStartTime} – ${machine.LunchEndTime}`
                          : "-"}
                      </td>
                      <td>{machine.CentreName || centreName || "-"}</td>
                      <td>{machine.CreatedInfo || "-"}</td>
                      <td>{machine.UpdatedInfo || "-"}</td>
                      <td>
                        <EditButton onClick={() => handleMachineEdit(machine)} disabled={machineSaving} />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </Tables>
          )}
        </>
      )}

      <Modal
        Header={`Book Slot${machineForm.machineName ? ` — ${machineForm.machineName}` : ""}`}
        visible={slotModalOpen}
        setVisible={setSlotModalOpen}
        modalWidth="70%"
        children={
          slotDraftLoading ? (
            <Loading />
          ) : (
            <SlotBookingModal
              slotDraft={slotDraft}
              setSlotDraft={setSlotDraft}
              onClose={() => setSlotModalOpen(false)}
            />
          )
        }
      />
    </div>
  );
};

export default MachineSlotMaster;
