import React, { useEffect, useState } from "react";
import moment from "moment";
import { toast } from "react-toastify";
import Accordion from "../../components/UI/Accordion";
import DatePicker from "../../components/formComponent/DatePicker";
import ReactSelect from "../../components/formComponent/ReactSelect";
import { SearchButton, SaveButton } from "../../components/UI/CustomButton";
import Loading from "../../components/loader/Loading";
import {
  bindCentresForRadiology,
  getBlockSlotMaster,
  saveBlockSlot,
  unblockSlot,
  getMacRadiologyAppointment,
} from "./api";

const BLOCK_REASONS = [
  { value: "Doctor Not Available", label: "Doctor Not Available" },
  { value: "Machine Under Maintenance", label: "Machine Under Maintenance" },
  { value: "Holiday", label: "Holiday" },
  { value: "Others", label: "Others" },
];

const BlockSlotMaster = () => {
  const [centres, setCentres] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showReasonModal, setShowReasonModal] = useState(false);

  const [form, setForm] = useState({
    CentreId: "",
    Date: new Date(),
  });

  const [gridData, setGridData] = useState({
    machines: [],
    timeSlots: [],
    blocked: {},
    appointments: {},
    machineSlots: {},
  });

  const [selectedCells, setSelectedCells] = useState({});
  // Blocked cells picked for unblocking — kept separate from selectedCells
  // (which is "available cells picked to block") so the two actions never
  // mix in one submit.
  const [selectedBlockedCells, setSelectedBlockedCells] = useState({});
  const [unblocking, setUnblocking] = useState(false);
  const [reason, setReason] = useState("");
  const [reasonText, setReasonText] = useState("");

  // "now" only changes on state updates — without this tick, isSlotInPast()
  // would freeze at whatever time the page last rendered (same fix as
  // RadiologyAppointment.jsx) instead of catching up as the clock moves.
  const [now, setNow] = useState(() => moment());
  useEffect(() => {
    const timer = setInterval(() => setNow(moment()), 60000);
    return () => clearInterval(timer);
  }, []);

  // today's date only — can't block a slot that's already passed
  const isSlotInPast = (slot) => {
    if (!form.Date) return false;
    if (!moment(form.Date).isSame(now, "day")) return false;
    return moment(`${moment(form.Date).format("YYYY-MM-DD")} ${slot}`, "YYYY-MM-DD HH:mm").isBefore(now);
  };

  useEffect(() => {
    loadCentres();
  }, []);

  const loadCentres = async () => {
    try {
      const res = await bindCentresForRadiology();
      const data = (res?.data?.message || []).map((c) => ({
        value: c.CentreId ?? c.CentreID,
        label: c.Centre ?? c.CentreName,
      }));
      setCentres(data);
      if (data.length > 0) setForm((prev) => ({ ...prev, CentreId: data[0].value }));
    } catch {
      toast.error("Failed to load centres.");
    }
  };

  const handleSearch = async () => {
    if (!form.CentreId) { toast.warn("Please select a centre."); return; }
    setLoading(true);
    setSelectedCells({});
    setSelectedBlockedCells({});
    try {
      const dateParam = moment(form.Date).format("DD/MMM/YYYY");
      // GetBlockSlotMaster doesn't return each machine's real slot times
      // (no machineSlots field — confirmed from a live response), so every
      // machine fell back to the full union timeSlots list instead of its
      // own interval, same bug the main Radiology Appointment grid had
      // before machineSlots existed there. GetMacRadiologyAppointment (the
      // main grid's own endpoint) already has that data for the same
      // centre/date, so fetch both in parallel and borrow it from there
      // rather than waiting on a backend change to this endpoint too.
      const [blockRes, apptRes] = await Promise.all([
        getBlockSlotMaster({ centreId: form.CentreId, date: dateParam }),
        getMacRadiologyAppointment({ centreId: form.CentreId, date: dateParam }).catch(() => null),
      ]);

      const data = blockRes?.data?.message;
      if (data) {
        const machines = (data.machines || [])
          .filter((m) => m.IsActive == null || m.IsActive === 1)
          .map((m) => ({
            ...m,
            MachineId:   m.MachineKey      ?? m.GlobalMachineID ?? m.MachineId,
            MachineName: m.GlobalMachineName ?? m.MachineName   ?? m.MachineID,
            // Recurring daily lunch window, configured once per machine in
            // Machine & Slot Master — see backend-radiology-machine-lunch-time.md.
            LunchStartTime: m.lunchStartTime ?? m.LunchStartTime ?? null,
            LunchEndTime:   m.lunchEndTime   ?? m.LunchEndTime   ?? null,
          }));

        const apptData = apptRes?.data?.message;
        const machineSlots = apptData?.machineSlots
          ? Object.fromEntries(
              Object.entries(apptData.machineSlots).map(([mid, slots]) => [String(mid), slots]),
            )
          : (data.machineSlots || {});

        setGridData({
          machines,
          timeSlots:    data.timeSlots    || [],
          blocked:      data.blocked      || {},
          appointments: data.appointments || {},
          machineSlots,
        });
      } else {
        setGridData({ machines: [], timeSlots: [], blocked: {}, appointments: {}, machineSlots: {} });
        toast.info("No slot data found.");
      }
    } catch {
      toast.error("Failed to load block slot data.");
    } finally {
      setLoading(false);
    }
  };

  const cellAppts = (machineId, slot) => gridData.appointments[`${machineId}_${slot}`] || [];
  const isCellBooked = (machineId, slot) => cellAppts(machineId, slot).length > 0;
  const isCellRegistered = (machineId, slot) =>
    cellAppts(machineId, slot).some((a) => !!(a.isRegistered ?? a.IsRegistered));

  const isCellBlocked = (machineId, slot) =>
    !!(gridData.blocked[machineId] || []).includes(slot);

  // Recurring daily lunch window ("HH:mm" start/end, set once per machine in
  // Machine & Slot Master) — no date attached, applies every day until
  // edited. Missing either field → never lunch.
  const isLunchAtSlot = (machine, slot) => {
    if (!machine?.LunchStartTime || !machine?.LunchEndTime) return false;
    return slot >= machine.LunchStartTime && slot < machine.LunchEndTime;
  };

  // Available cell → toggle into the "block" selection. Already-blocked
  // cell → toggle into the separate "unblock" selection. Booked/lunch/past
  // cells aren't selectable either way.
  const toggleCell = (machine, slot) => {
    if (isSlotInPast(slot)) return;
    const machineId = machine.MachineId;
    const key = `${machineId}_${slot}`;
    if (isCellBlocked(machineId, slot)) {
      setSelectedBlockedCells((prev) => ({ ...prev, [key]: !prev[key] }));
      return;
    }
    if (isCellBooked(machineId, slot)) {
      toast.warn(`This slot already has a booking — it can't be blocked.`);
      return;
    }
    if (isLunchAtSlot(machine, slot)) {
      toast.warn(`This is ${machine.MachineName}'s lunch break — it's already unavailable, no need to block it.`);
      return;
    }
    setSelectedCells((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const isCellSelected = (machineId, slot) =>
    !!selectedCells[`${machineId}_${slot}`];

  const isCellSelectedForUnblock = (machineId, slot) =>
    !!selectedBlockedCells[`${machineId}_${slot}`];

  // A machine's real bookable times — timeSlots is the union across every
  // machine (finest interval any of them uses), so a machine on a coarser
  // interval (e.g. 30-min) doesn't actually have a slot at every union time.
  // Falls back to the union list when the backend hasn't sent per-machine
  // slots, so a machine with no configured interval of its own behaves as
  // it always did. Same fix as SlotBookModal.jsx / RadiologyAppointment.jsx.
  const getMachineOwnSlots = (machineId) => {
    const own = gridData.machineSlots[String(machineId)];
    return Array.isArray(own) && own.length > 0 ? own : gridData.timeSlots;
  };

  const selectedCount = Object.values(selectedCells).filter(Boolean).length;

  const handleSaveBlock = async () => {
    if (!reason) { toast.warn("Please select a reason."); return; }
    setSaving(true);
    const slots = Object.entries(selectedCells)
      .filter(([, v]) => v)
      .map(([key]) => {
        const [machineId, ...slotParts] = key.split("_");
        return { machineId: Number(machineId), timeSlot: slotParts.join("_") };
      });
    try {
      const res = await saveBlockSlot({
        centreId: form.CentreId,
        date:     moment(form.Date).format("DD/MMM/YYYY"),
        reason:   reason === "Others" ? reasonText || "Others" : reason,
        slots,
      });
      if (res?.data?.success) {
        toast.success(`${slots.length} slot(s) blocked successfully.`);
        setSelectedCells({});
        setShowReasonModal(false);
        setReason("");
        setReasonText("");
        handleSearch();
      } else {
        toast.error(res?.data?.message || "Failed to block slots.");
      }
    } catch {
      toast.error("Something went wrong.");
    } finally {
      setSaving(false);
    }
  };

  const selectedBlockedCount = Object.values(selectedBlockedCells).filter(Boolean).length;

  const handleUnblockSlots = async () => {
    setUnblocking(true);
    const slots = Object.entries(selectedBlockedCells)
      .filter(([, v]) => v)
      .map(([key]) => {
        const [machineId, ...slotParts] = key.split("_");
        return { machineId: Number(machineId), timeSlot: slotParts.join("_") };
      });
    try {
      const res = await unblockSlot({
        centreId: form.CentreId,
        date:     moment(form.Date).format("DD/MMM/YYYY"),
        slots,
      });
      if (res?.data?.success) {
        toast.success(`${slots.length} slot(s) unblocked successfully.`);
        setSelectedBlockedCells({});
        handleSearch();
      } else {
        toast.error(res?.data?.message || "Failed to unblock slots.");
      }
    } catch {
      toast.error("Something went wrong.");
    } finally {
      setUnblocking(false);
    }
  };

  return (
    <Accordion title="Radiology Block Slot Master" defaultValue={true}>
      {/* Filters */}
      <div className="row g-2 mb-3 align-items-end">
        <div className="col-md-2">
          <ReactSelect
            id="BSM_Centre"
            name="CentreId"
            placeholderName="Centre"
            dynamicOptions={centres}
            value={form.CentreId}
            removeIsClearable
            onChange={(name, option) =>
              setForm((prev) => ({ ...prev, CentreId: option?.value || "" }))
            }
          />
        </div>
        <div className="col-md-2">
          <DatePicker
            name="Date" id="BSM_Date" lable="Date"
            value={form.Date}
            onChange={(v) => setForm((prev) => ({ ...prev, Date: v }))}
          />
        </div>
        <div className="col-md-3 mb-2 d-flex flex-wrap gap-2">
          <SearchButton onClick={handleSearch} text="Search" />
          {selectedCount > 0 && (
            <button
              className="btn btn-sm btn-warning fw-semibold"
              onClick={() => setShowReasonModal(true)}
            >
              Block ({selectedCount})
            </button>
          )}
          {selectedBlockedCount > 0 && (
            <button
              className="btn btn-sm btn-primary fw-semibold"
              onClick={handleUnblockSlots}
              disabled={unblocking}
            >
              {unblocking ? "Unblocking..." : `Unblock (${selectedBlockedCount})`}
            </button>
          )}
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <Loading />
      ) : gridData.machines.length > 0 && gridData.timeSlots.length > 0 ? (
        <div
          style={{
            overflowX: "auto", overflowY: "auto", maxHeight: "520px",
            borderRadius: "8px", border: "1px solid #e2e8f0",
          }}
        >
          <table
            className="table table-bordered mb-0"
            style={{ minWidth: "900px", fontSize: "12px" }}
          >
            <thead
              style={{
                position: "sticky", top: 0, zIndex: 10,
                background: "#1e3a5f", color: "#fff",
              }}
            >
              <tr>
                <th
                  style={{
                    width: "130px", minWidth: "130px", position: "sticky",
                    left: 0, background: "#1e3a5f", zIndex: 11, padding: "8px 10px",
                  }}
                >
                  Machine ↓ / Time →
                </th>
                {gridData.timeSlots.map((slot) => (
                  <th
                    key={slot}
                    style={{ textAlign: "center", padding: "6px 4px", minWidth: "70px" }}
                  >
                    {slot}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {gridData.machines.map((machine) => (
                <tr key={machine.MachineId}>
                  <td
                    style={{
                      position: "sticky", left: 0, background: "#f8fafc",
                      fontWeight: "600", fontSize: "12px", color: "#1e3a5f",
                      padding: "6px 10px", borderRight: "2px solid #cbd5e1",
                      zIndex: 5, whiteSpace: "nowrap",
                    }}
                  >
                    {machine.MachineName}
                  </td>
                  {(() => {
                    const ownSlots = getMachineOwnSlots(machine.MachineId);
                    return gridData.timeSlots.map((slot) => {
                      // timeSlots is the union of every machine's slot times —
                      // a machine on a coarser interval doesn't actually have
                      // a slot at every union time. Render those as a plain,
                      // non-interactive filler instead of a fake "available" cell.
                      if (!ownSlots.includes(slot)) {
                        return (
                          <td key={slot} style={{ textAlign: "center", padding: "4px" }}>
                            <div
                              title={`${machine.MachineName} doesn't run a slot at ${slot}`}
                              style={{
                                width: "26px", height: "22px", margin: "0 auto",
                                borderRadius: "5px", background: "transparent",
                                border: "1px dashed #f1f5f9",
                              }}
                            />
                          </td>
                        );
                      }

                      const blocked = isCellBlocked(machine.MachineId, slot);
                      const selectedUnblock = blocked && isCellSelectedForUnblock(machine.MachineId, slot);
                      const registeredBooked = !blocked && isCellRegistered(machine.MachineId, slot);
                      const unregisteredBooked = !blocked && !registeredBooked && isCellBooked(machine.MachineId, slot);
                      const lunch = !blocked && !registeredBooked && !unregisteredBooked && isLunchAtSlot(machine, slot);
                      const selected = isCellSelected(machine.MachineId, slot);
                      const past = !blocked && !registeredBooked && !unregisteredBooked && !lunch && isSlotInPast(slot);
                      // toggleCell() itself decides what a click on this
                      // exact cell does (select to block, select to
                      // unblock, or a warning toast) based on its state —
                      // only "already past" is truly inert here.
                      const clickable = !past;

                      let bg = "#f0fdf4", border = "#bbf7d0", color = "#16a34a", mark = ""; // available
                      if (blocked && selectedUnblock)      { bg = "#dbeafe"; border = "#93c5fd"; color = "#1e40af"; mark = "↺"; }
                      else if (blocked)                    { bg = "#fee2e2"; border = "#fca5a5"; color = "#b91c1c"; mark = "✕"; }
                      else if (registeredBooked)            { bg = "#fecaca"; border = "#f87171"; color = "#991b1b"; mark = "R"; }
                      else if (unregisteredBooked)          { bg = "#fef3c7"; border = "#fcd34d"; color = "#92400e"; mark = "●"; }
                      else if (lunch)                       { bg = "#fef9e7"; border = "#fcd34d"; color = "#92400e"; mark = "🍽"; }
                      else if (past)                        { bg = "#f1f5f9"; border = "#e2e8f0"; color = "#94a3b8"; mark = "·"; }
                      else if (selected)                    { bg = "#ffedd5"; border = "#fb923c"; color = "#c2410c"; mark = "✓"; }

                      return (
                        <td key={slot} style={{ textAlign: "center", padding: "4px" }}>
                          <div
                            onClick={clickable ? () => toggleCell(machine, slot) : undefined}
                            title={
                              blocked ? (selectedUnblock ? "Selected — click to unselect from unblocking" : "Already Blocked — click to select for unblocking")
                                : registeredBooked ? "Registered patient booking — can't be blocked"
                                : unregisteredBooked ? "Booked (not registered) — can't be blocked"
                                : lunch ? `Lunch break (${machine.LunchStartTime}–${machine.LunchEndTime}) — already unavailable`
                                : past ? "Time has already passed"
                                : selected ? "Selected — click to unselect"
                                : "Click to select for blocking"
                            }
                            style={{
                              width: "26px", height: "22px", margin: "0 auto",
                              display: "flex", alignItems: "center", justifyContent: "center",
                              borderRadius: "5px", fontSize: "11px", fontWeight: 700,
                              transition: "background 0.1s, border-color 0.1s",
                              cursor: clickable ? "pointer" : "not-allowed",
                              background: bg,
                              border: `1px ${lunch ? "dashed" : "solid"} ${border}`,
                              color,
                              opacity: past ? 0.7 : 1,
                            }}
                          >
                            {mark}
                          </div>
                        </td>
                      );
                    });
                  })()}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        !loading && (
          <div className="text-center text-muted py-4" style={{ fontSize: "13px" }}>
            Select a centre and date then click Search to view slots.
          </div>
        )
      )}

      {/* Legend */}
      {gridData.machines.length > 0 && (
        <div className="d-flex flex-wrap gap-3 mt-3" style={{ fontSize: "12px" }}>
          {[
            { label: "Available", bg: "#f0fdf4", border: "#bbf7d0", color: "#16a34a", mark: "" },
            { label: "Selected to Block", bg: "#ffedd5", border: "#fb923c", color: "#c2410c", mark: "✓" },
            { label: "Registered", bg: "#fecaca", border: "#f87171", color: "#991b1b", mark: "R" },
            { label: "Booked (not registered)", bg: "#fef3c7", border: "#fcd34d", color: "#92400e", mark: "●" },
            { label: "Lunch Break", bg: "#fef9e7", border: "#fcd34d", color: "#92400e", mark: "🍽" },
            { label: "Already Blocked", bg: "#fee2e2", border: "#fca5a5", color: "#b91c1c", mark: "✕" },
            { label: "Selected to Unblock", bg: "#dbeafe", border: "#93c5fd", color: "#1e40af", mark: "↺" },
            { label: "Past (today)", bg: "#f1f5f9", border: "#e2e8f0", color: "#94a3b8", mark: "·" },
          ].map((s) => (
            <span key={s.label} className="d-flex align-items-center gap-2">
              <span
                style={{
                  display: "flex", alignItems: "center", justifyContent: "center",
                  width: "20px", height: "18px", borderRadius: "4px", fontSize: "10px", fontWeight: 700,
                  background: s.bg, border: `1px solid ${s.border}`, color: s.color,
                }}
              >
                {s.mark}
              </span>
              <span style={{ color: "#475569" }}>{s.label}</span>
            </span>
          ))}
        </div>
      )}

      {/* Reason overlay */}
      {showReasonModal && (
        <div
          style={{
            position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)",
            zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center",
          }}
        >
          <div
            style={{
              background: "#fff", borderRadius: "10px", padding: "24px",
              width: "380px", boxShadow: "0 20px 60px rgba(0,0,0,0.2)",
            }}
          >
            <h6 className="fw-bold mb-3" style={{ color: "#1e3a5f" }}>
              Block {selectedCount} Slot(s) — Add Reason
            </h6>
            <div className="mb-3">
              <ReactSelect
                id="BlockReason"
                name="BlockReason"
                placeholderName="Reason"
                dynamicOptions={BLOCK_REASONS}
                value={reason}
                removeIsClearable
                onChange={(name, option) => setReason(option?.value || "")}
              />
            </div>
            {reason === "Others" && (
              <div className="mb-3">
                <textarea
                  className="form-control custominputbox"
                  rows={2}
                  placeholder="Specify reason"
                  value={reasonText}
                  onChange={(e) => setReasonText(e.target.value)}
                  style={{ fontSize: "13px", resize: "none" }}
                />
              </div>
            )}
            <div className="d-flex justify-content-end gap-2">
              <button
                className="btn btn-sm btn-outline-secondary"
                onClick={() => { setShowReasonModal(false); setReason(""); setReasonText(""); }}
                disabled={saving}
              >
                Cancel
              </button>
              <SaveButton
                onClick={handleSaveBlock}
                disabled={saving}
                label={saving ? "Saving..." : "Submit"}
              />
            </div>
          </div>
        </div>
      )}
    </Accordion>
  );
};

export default BlockSlotMaster;
