import React, { useEffect, useRef, useState } from "react";
import moment from "moment";
import { toast } from "react-toastify";
import { Dialog } from "primereact/dialog";
import { FaTools } from "react-icons/fa";
import DatePicker from "../../components/formComponent/DatePicker";
import Loading from "../../components/loader/Loading";
import { useLocalStorage } from "../../utils/hooks/useLocalStorage";
import { getMacRadiologyAppointment, getTestSlotDurations } from "../RadiologyAppointment/api";

// Targets the new Machine/Department radiology system (MacRadiology/*)
// instead of the legacy Modality+Shift slot-hold flow. Selecting an empty
// cell does NOT call SaveMacRadiologyAppointment here — there is no "hold"
// endpoint, so the actual booking is deferred to the registration's final
// Save (see PatientRegistration.jsx's bookPendingRadiologySlots). Picking a
// cell just reports the choice back through the same handleSelectSlot(data,
// slotData, testData) contract the parent pages already use, carrying a
// PendingRadiologyBooking payload on `data` for Save to act on later, so the
// investigation row in tableData shows the picked slot right away.
const SlotBookModal = ({
  show,
  slotOpen,
  setSlotOpen,
  handleSelectSlot,
  LTData,
  tableData,
  patientState,
  centreName,
}) => {
  const theme = useLocalStorage("theme", "get");
  const testData = slotOpen?.data;

  // "Jump to time" — with this many slots the grid scrolls quite far
  // horizontally, so typing a time here scrolls straight to it instead of
  // hunting for it by hand.
  const gridScrollRef = useRef(null);
  const [jumpTime, setJumpTime] = useState("");

  const [date, setDate] = useState(
    testData?.InvestigationDate ? new Date(testData.InvestigationDate) : new Date()
  );
  const [loading, setLoading] = useState(false);
  const [machines, setMachines] = useState([]);
  const [timeSlots, setTimeSlots] = useState([]);
  const [appointments, setAppointments] = useState({});
  const [blocked, setBlocked] = useState({});
  const [bookingKey, setBookingKey] = useState(null); // "<machineId>_<slot>" currently being saved
  // Per-machine real slot times (a machine on a coarser interval than the
  // union grid) — same field RadiologyAppointment.jsx's grid already reads
  // from this same API, just unused here until now.
  const [machineSlotsMap, setMachineSlotsMap] = useState({});
  // Configured scan duration for the test being booked (minutes) — null
  // means "not configured for this test", which falls back to booking a
  // single slot exactly like before this feature existed. See
  // backend-docs/backend-radiology-test-slot-duration.md.
  const [testDurationMinutes, setTestDurationMinutes] = useState(null);

  useEffect(() => {
    if (show) loadGrid(date);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [show, date, LTData?.CentreID, testData?.DepartmentID]);

  // Today's date only: a slot earlier than right now can't be booked —
  // mirrors isSlotInPast() in RadiologyAppointment.jsx. Uses a fresh
  // moment() per call rather than a ticking state value, since this modal
  // only needs the answer at grid-load/pick time, not a live-updating UI.
  const isSlotInPast = (slot, forDate) => {
    if (!moment(forDate).isSame(moment(), "day")) return false;
    return moment(`${moment(forDate).format("YYYY-MM-DD")} ${slot}`, "YYYY-MM-DD HH:mm").isBefore(moment());
  };

  // A machine's real bookable times — falls back to the union grid when the
  // backend hasn't sent per-machine slots (same fallback RadiologyAppointment.jsx
  // uses), so a machine with no configured interval of its own just behaves
  // as it always did.
  const getMachineOwnSlots = (machineId, unionSlots, machineSlotsData) => {
    const own = machineSlotsData?.[String(machineId)];
    return Array.isArray(own) && own.length > 0 ? own : unionSlots;
  };

  // Minutes between this machine's own consecutive slots — derived from the
  // list itself rather than hardcoded, since different machines/departments
  // can run different granularities. Falls back to 15 (the common default)
  // when there's only one slot to compare against.
  const getIntervalMinutes = (ownSlots) => {
    if (ownSlots.length < 2) return 15;
    const toMinutes = (s) => {
      const [h, m] = s.split(":").map(Number);
      return h * 60 + m;
    };
    return toMinutes(ownSlots[1]) - toMinutes(ownSlots[0]) || 15;
  };

  // How many of this machine's own slots the test being booked needs.
  // durationOverride lets loadGrid() pass a just-fetched value straight
  // through (its own setTestDurationMinutes() call wouldn't be visible yet
  // within the same synchronous call) — everywhere else just reads state.
  const getRequiredSlotCount = (ownSlots, durationOverride) => {
    const duration = durationOverride !== undefined ? durationOverride : testDurationMinutes;
    if (!duration) return 1;
    return Math.max(1, Math.ceil(duration / getIntervalMinutes(ownSlots)));
  };

  // Slots other rows in this same registration have already picked but not
  // yet actually booked (see handleBookSlot below — booking itself is now
  // deferred to final Save, so the backend's `appointments` map alone
  // doesn't know about them yet). Excludes the row currently being
  // (re)booked itself, identified by InvestigationID, so reopening the
  // picker for that same test doesn't treat its own held slot as taken.
  const getPendingSlotsForMachine = (machineId, forDate) => {
    const taken = new Set();
    (tableData || []).forEach((row) => {
      if (!(row?.Radiology == 1) || row?.RadiologyAppointmentId) return;
      if (testData?.InvestigationID && row?.InvestigationID === testData.InvestigationID) return;
      if (String(row?.ModalityId) !== String(machineId)) return;
      if (!row?.InvestigationDate || !moment(row.InvestigationDate).isSame(moment(forDate), "day")) return;
      const slots = row?.PendingRadiologyBooking?.slotList?.length
        ? row.PendingRadiologyBooking.slotList
        : (row?.SelectedTimeSlot ? [row.SelectedTimeSlot] : []);
      slots.forEach((s) => taken.add(s));
    });
    return taken;
  };

  // Recurring daily lunch window ("HH:mm" start/end, set once per machine in
  // Machine & Slot Master) — no date attached, applies every day until
  // edited. Missing either field → never lunch.
  const isLunchAtSlot = (machine, slot) => {
    if (!machine?.LunchStartTime || !machine?.LunchEndTime) return false;
    return slot >= machine.LunchStartTime && slot < machine.LunchEndTime;
  };

  // A slot counts as down if it falls inside any of the machine's breakdown
  // windows for the date being viewed — same logic as
  // RadiologyAppointment.jsx's isMachineDownAtSlot(). EndTime === null means
  // still broken as of this date (open-ended).
  const isMachineDownAtSlot = (machine, slot) => {
    if (machine.BreakdownPeriods?.length > 0) {
      return machine.BreakdownPeriods.some((p) => {
        if (!p.StartTime) return false;
        if (slot < p.StartTime) return false;
        if (p.EndTime && slot >= p.EndTime) return false;
        return true;
      });
    }
    // no windowed data from the backend yet — fall back to the whole-day flag
    return !!machine.IsBreakdown;
  };

  const isGroupFree = (machine, group, apptsMap, blockedMap, forDate, pendingSet) =>
    group.every((s) => {
      if (isSlotInPast(s, forDate)) return false;
      if ((blockedMap[String(machine.MachineId)] || []).includes(s)) return false;
      if (pendingSet?.has(s)) return false;
      if (isLunchAtSlot(machine, s)) return false;
      if (isMachineDownAtSlot(machine, s)) return false;
      return (apptsMap[`${machine.MachineId}_${s}`] || []).length === 0;
    });

  // Earliest machine/consecutive-group in this department that can fit the
  // test's full duration — not blocked, not occupied, not in the past, for
  // every slot in the group. Checks each machine's own earliest valid group
  // first, then picks whichever machine's group starts soonest overall.
  const findNextAvailableSlot = (machineList, unionSlots, apptsMap, blockedMap, forDate, machineSlotsData, durationOverride) => {
    let best = null;
    for (const m of machineList) {
      const ownSlots = getMachineOwnSlots(m.MachineId, unionSlots, machineSlotsData);
      const needed = getRequiredSlotCount(ownSlots, durationOverride);
      const pendingSet = getPendingSlotsForMachine(m.MachineId, forDate);
      for (let i = 0; i + needed <= ownSlots.length; i++) {
        const group = ownSlots.slice(i, i + needed);
        if (isGroupFree(m, group, apptsMap, blockedMap, forDate, pendingSet)) {
          if (!best || group[0] < best.slots[0]) best = { machine: m, slots: group };
          break; // earliest valid group for this machine — try the next machine
        }
      }
    }
    return best;
  };

  const loadGrid = async (forDate) => {
    if (!LTData?.CentreID || !testData?.DepartmentID) return;
    setLoading(true);
    try {
      const [gridRes, durationRes] = await Promise.all([
        getMacRadiologyAppointment({
          date: moment(forDate).format("DD/MMM/YYYY"),
          centreId: LTData.CentreID,
        }),
        // Not configured for this test (or the lookup fails) → duration
        // stays null, which getRequiredSlotCount() treats as "1 slot",
        // i.e. exactly the old behaviour before this feature existed.
        testData?.InvestigationID ? getTestSlotDurations().catch(() => null) : Promise.resolve(null),
      ]);

      const data = gridRes?.data?.message;
      const allMachines = Array.isArray(data?.machines) ? data.machines : [];
      const deptMachines = allMachines
        .map((m) => ({
          // backend has moved to camelCase (machineId/machineName/departmentId) —
          // keep the old PascalCase variants as fallback in case an older
          // response shape shows up somewhere (same fix as RadiologyAppointment.jsx)
          MachineId: m.machineId ?? m.MachineKey ?? m.GlobalMachineID ?? m.MachineId,
          MachineName: m.machineName ?? m.GlobalMachineName ?? m.MachineName ?? m.MachineID,
          DepartmentId: m.departmentId ?? m.DepartmentId ?? m.DepartmentID ?? null,
          LunchStartTime: m.lunchStartTime ?? m.LunchStartTime ?? null,
          LunchEndTime: m.lunchEndTime ?? m.LunchEndTime ?? null,
          // Breakdown fields — same normalization as RadiologyAppointment.jsx
          // (this endpoint already sends them, this modal just never read
          // them before, so a broken machine was silently bookable here).
          IsBreakdown: m.isBreakdown ?? m.IsBreakdown ?? false,
          BreakdownReason: m.breakdownReason ?? m.BreakdownReason ?? "",
          BreakdownDate: (() => {
            const d = m.breakdownDate ?? m.BreakdownDate;
            if (!d) return null;
            return typeof d === "object" ? (d.isNull ? null : d.value) : d;
          })(),
          BreakdownPeriods: (m.breakdownPeriods ?? m.BreakdownPeriods ?? []).map((p) => ({
            Reason: p.reason ?? p.Reason ?? "",
            StartTime: p.startTime ?? p.StartTime ?? null,
            EndTime: p.endTime ?? p.EndTime ?? null,
          })),
        }))
        .filter((m) => String(m.DepartmentId) === String(testData.DepartmentID));
      const slots = Array.isArray(data?.timeSlots) ? data.timeSlots : [];
      const apptsMap = data?.appointments || {};
      const blockedMap = data?.blocked || {};
      const machineSlotsData = data?.machineSlots || {};

      let duration = null;
      const durationList = durationRes?.data?.message;
      if (Array.isArray(durationList) && testData?.InvestigationID) {
        const match = durationList.find(
          (d) => String(d.investigationId ?? d.InvestigationId) === String(testData.InvestigationID)
        );
        duration = match ? Number(match.durationMinutes ?? match.DurationMinutes) || null : null;
      }

      setMachines(deptMachines);
      setTimeSlots(slots);
      setAppointments(apptsMap);
      setBlocked(blockedMap);
      setMachineSlotsMap(machineSlotsData);
      setTestDurationMinutes(duration);

      // mode: "auto" — triggered right when a radiology investigation is
      // added (PatientRegistration.jsx), not from the manual gear-icon click
      // — silently book the next available slot(s) instead of showing the
      // picker. Passes `duration` explicitly rather than relying on the
      // setTestDurationMinutes() call above, since that state update isn't
      // visible yet within this same synchronous run.
      if (slotOpen?.mode === "auto") {
        const picked = findNextAvailableSlot(deptMachines, slots, apptsMap, blockedMap, forDate, machineSlotsData, duration);
        if (picked) {
          handleBookSlot(picked.machine, picked.slots);
        } else {
          toast.warn(
            `No available radiology slot found for "${testData?.TestName || "this test"}" on ${moment(forDate).format("DD MMM YYYY")} — use the slot icon to book manually.`
          );
          setSlotOpen({ data: "", show: false });
        }
      }
    } catch {
      toast.error("Failed to load radiology slots.");
      setMachines([]);
      setTimeSlots([]);
      setAppointments({});
      setBlocked({});
      setMachineSlotsMap({});
      setTestDurationMinutes(null);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => setSlotOpen({ data: "", show: false });

  // Scrolls the grid so the first slot at-or-after `value` ("HH:mm") lands
  // near the left edge, falling back to the last slot if `value` is later
  // than everything on the grid. COL_STRIDE/LABEL_WIDTH mirror the cell grid
  // sizing below (44px cell + 6px gap, 84px machine-name column).
  const scrollToTime = (value) => {
    if (!value || timeSlots.length === 0 || !gridScrollRef.current) return;
    let idx = timeSlots.findIndex((s) => s >= value);
    if (idx === -1) idx = timeSlots.length - 1;
    const COL_STRIDE = 50;
    const LABEL_WIDTH = 84;
    const targetLeft = Math.max(0, LABEL_WIDTH + idx * COL_STRIDE - 40);
    gridScrollRef.current.scrollTo({ left: targetLeft, behavior: "smooth" });
  };

  const isBlocked = (machineId, slot) => (blocked[String(machineId)] || []).includes(slot);
  const cellAppts = (machineId, slot) => appointments[`${machineId}_${slot}`] || [];
  // A registered appointment is a real, confirmed occupant of the slot — it
  // can't be booked over. An unregistered one is just a placeholder booking
  // (e.g. created without completing registration), so it stays clickable
  // like an empty slot, letting staff book/complete it from here.
  const isCellRegistered = (machineId, slot) =>
    cellAppts(machineId, slot).some((a) => !!(a.isRegistered ?? a.IsRegistered));

  // Counts only each machine's own real slot times — timeSlots is the union
  // across every machine (finest interval any of them uses), so counting it
  // as-is for a coarser machine (e.g. MRI on 30-min steps) inflates
  // "Available" with union times that machine doesn't actually have.
  const slotCounts = { available: 0, registered: 0, unregistered: 0, blocked: 0, lunch: 0, down: 0 };
  machines.forEach((m) => {
    const ownSlots = getMachineOwnSlots(m.MachineId, timeSlots, machineSlotsMap);
    ownSlots.forEach((slot) => {
      if (isBlocked(m.MachineId, slot)) { slotCounts.blocked += 1; return; }
      const appts = cellAppts(m.MachineId, slot);
      if (appts.length === 0 && isLunchAtSlot(m, slot)) { slotCounts.lunch += 1; return; }
      if (appts.length === 0 && isMachineDownAtSlot(m, slot)) { slotCounts.down += 1; return; }
      if (appts.length === 0) { slotCounts.available += 1; return; }
      if (isCellRegistered(m.MachineId, slot)) slotCounts.registered += 1;
      else slotCounts.unregistered += 1;
    });
  });

  // `slots` is an array (the machine's own consecutive times covering the
  // test's full duration) — kept accepting a bare string too so nothing
  // else calling this with a single slot breaks.
  //
  // Booking itself (SaveMacRadiologyAppointment) is deferred to the actual
  // registration Save (PatientRegistration.jsx's bookPendingRadiologySlots,
  // called from handleSaveSmsEmailSave) instead of firing here — there is
  // no "hold" endpoint, so picking a slot only reserves it locally in
  // tableData (see PendingRadiologyBooking below and
  // getPendingSlotsForMachine above, which keeps two tests added in the
  // same registration from silently picking the same still-unbooked slot).
  // A slot picked this way can still be taken by someone else before Save —
  // that Save call surfaces a clear error in that case.
  const handleBookSlot = (machine, slots) => {
    const slotList = Array.isArray(slots) ? slots : [slots];
    if (!patientState?.Mobile || !patientState?.FirstName) {
      toast.warn("Please fill in Patient Name and Mobile No before booking a radiology slot.");
      return;
    }
    if (!LTData?.CentreID) {
      toast.error("Centre not selected.");
      return;
    }

    const appointmentDate = moment(date).format("DD/MMM/YYYY");

    handleSelectSlot(
      {
        InvestigationDate: appointmentDate,
        ModalityId: machine.MachineId,
        ModalityName: machine.MachineName,
        SelectedTimeSlot: slotList[0],
        ShiftName: "",
        RadiologyAppointmentId: 0,
        // Everything bookPendingRadiologySlots() needs to actually call
        // SaveMacRadiologyAppointment at Save time — patient details
        // aren't included here since those are read fresh from
        // PatientRegistration.jsx's own state at that point, in case
        // they changed after this slot was picked.
        PendingRadiologyBooking: {
          machineId: machine.MachineId,
          machineName: machine.MachineName,
          departmentId: testData?.DepartmentID || 0,
          departmentName: testData?.DepartmentName || "",
          centreId: LTData.CentreID,
          appointmentDate,
          slotList,
          investigationId: testData?.InvestigationID || 0,
          investigationName: testData?.TestName || "",
          rate: testData?.Rate || 0,
        },
      },
      {
        StartTime: slotList[0],
        EndTime: slotList.length > 1 ? slotList[slotList.length - 1] : "",
        StartEndTimeSlot:
          slotList.length > 1 ? `${slotList[0]} - ${slotList[slotList.length - 1]}` : slotList[0],
        status: "1",
        color: "#e0ba5e",
        isSelected: 1,
      },
      testData
    );
    handleClose();
  };

  // Manual grid click — clicking a cell starts the reserved block AT that
  // exact slot (not centered/nearest), walking forward through the
  // machine's own slot list for however many it needs to cover the test's
  // duration. Rejects the click outright (no partial booking) if the day
  // runs out of room or any slot in that span isn't actually free, rather
  // than silently booking fewer slots than the test needs.
  const handleCellClick = (machine, slot) => {
    const ownSlots = getMachineOwnSlots(machine.MachineId, timeSlots, machineSlotsMap);
    const startIdx = ownSlots.indexOf(slot);
    if (startIdx === -1) {
      toast.warn(`${machine.MachineName} doesn't run a slot at ${slot}.`);
      return;
    }
    if (isLunchAtSlot(machine, slot)) {
      toast.warn(`${machine.MachineName} is on lunch break at ${slot} (${machine.LunchStartTime}–${machine.LunchEndTime}) — pick a slot outside lunch.`);
      return;
    }
    if (isMachineDownAtSlot(machine, slot)) {
      toast.warn(`${machine.MachineName} is under breakdown at ${slot}${machine.BreakdownReason ? ` (${machine.BreakdownReason})` : ""} — booking is disabled for this slot until it's marked fixed.`);
      return;
    }
    const needed = getRequiredSlotCount(ownSlots);
    const group = ownSlots.slice(startIdx, startIdx + needed);
    if (group.length < needed) {
      toast.warn(
        `This test needs ${needed} consecutive slot${needed > 1 ? "s" : ""} (~${testDurationMinutes} min) from ${slot}, but only ${group.length} remain today on ${machine.MachineName}.`
      );
      return;
    }
    if (!isGroupFree(machine, group, appointments, blocked, date, getPendingSlotsForMachine(machine.MachineId, date))) {
      toast.warn(
        `Not enough free consecutive slots from ${slot} on ${machine.MachineName} for this test's ${testDurationMinutes}-minute duration — try a different time.`
      );
      return;
    }
    handleBookSlot(machine, group);
  };

  // Auto mode books silently in the background (see loadGrid) — no picker
  // UI to show. The manual gear-icon path (RegisterationTable.jsx) never
  // sets mode, so it still gets the full visible dialog below.
  if (slotOpen?.mode === "auto") return null;

  return (
    <Dialog
      header={`Book Radiology Slot${testData?.TestName ? ` — ${testData.TestName}` : ""}`}
      visible={show}
      onHide={handleClose}
      className={theme}
      draggable={false}
      style={{ width: "75vw", maxWidth: 900 }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 14, flexWrap: "wrap" }}>
        <div style={{ minWidth: 160 }}>
          <DatePicker
            name="InvestigationDate"
            minDate={new Date()}
            placeholder=" "
            id="InvestigationDate"
            lable="Date"
            onChange={(val) => setDate(val)}
            value={date}
          />
        </div>
        <div style={{ fontSize: 13, color: "#475569", fontWeight: 500 }}>
          {[
            centreName || LTData?.Centre || LTData?.CentreName,
            patientState?.RateTypeName,
            testData?.DepartmentName,
          ]
            .filter(Boolean)
            .map((part, i, arr) => (
              <React.Fragment key={i}>
                {part}
                {i < arr.length - 1 && <span style={{ margin: "0 6px", color: "#cbd5e1" }}>•</span>}
              </React.Fragment>
            ))}
        </div>
        {timeSlots.length > 0 && (
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <label htmlFor="SlotBookJumpTime" style={{ fontSize: 12, fontWeight: 600, color: "#475569" }}>
              Jump to
            </label>
            <input
              id="SlotBookJumpTime"
              type="time"
              value={jumpTime}
              onChange={(e) => { setJumpTime(e.target.value); scrollToTime(e.target.value); }}
              className="form-control form-control-sm"
              style={{ width: 110, fontSize: 12 }}
            />
          </div>
        )}
        {testDurationMinutes ? (
          <span
            title="Clicking a slot will reserve this many consecutive slots for this test"
            style={{
              fontSize: 12, fontWeight: 600, color: "#0f766e",
              background: "#f0fdfa", border: "1px solid #99f6e4",
              borderRadius: 999, padding: "3px 10px",
            }}
          >
            Duration: {testDurationMinutes} min
          </span>
        ) : (
          <span style={{ fontSize: 11.5, color: "#94a3b8" }}>
            No duration configured for this test — booking a single slot.
          </span>
        )}
      </div>

      {loading ? (
        <Loading />
      ) : machines.length === 0 ? (
        <div style={{ textAlign: "center", fontSize: 15, padding: "20px 0" }}>
          <label style={{ fontWeight: "bold", color: "#b24040" }}>
            No machines configured for this department at this centre.
          </label>
        </div>
      ) : timeSlots.length === 0 ? (
        <div style={{ textAlign: "center", fontSize: 15, padding: "20px 0" }}>
          <label style={{ fontWeight: "bold", color: "#b24040" }}>No time slots configured.</label>
        </div>
      ) : (
        <>
          {/* ── Machine (rows) × Time (columns) picker, seat-map style ─────── */}
          <div ref={gridScrollRef} style={{ overflowX: "auto", paddingBottom: 4 }}>
            {/* time axis on top */}
            <div style={{ display: "flex", marginBottom: 8 }}>
              <div style={{ flex: "0 0 84px" }} />
              <div style={{ display: "flex", gap: 6 }}>
                {timeSlots.map((slot) => (
                  <div
                    key={slot}
                    style={{
                      flex: "0 0 auto",
                      width: 44,
                      textAlign: "center",
                      fontSize: 9,
                      fontWeight: 600,
                      color: "#64748b",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {slot}
                  </div>
                ))}
              </div>
            </div>

            {machines.map((m) => (
              <div key={m.MachineId} style={{ display: "flex", alignItems: "center", marginBottom: 10 }}>
                <div
                  style={{
                    flex: "0 0 84px",
                    paddingRight: 8,
                  }}
                >
                  <div
                    style={{
                      fontSize: 12,
                      fontWeight: 700,
                      color: "#1e293b",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                    title={m.MachineName}
                  >
                    {m.MachineName}
                  </div>
                  {m.IsBreakdown && (
                    <div
                      title={`Breakdown${m.BreakdownReason ? ` — ${m.BreakdownReason}` : ""}${m.BreakdownDate ? ` (since ${moment(m.BreakdownDate).format("DD-MMM-YYYY hh:mm A")})` : ""}`}
                      style={{
                        marginTop: 2,
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 3,
                        padding: "1px 6px",
                        borderRadius: 999,
                        fontSize: 8,
                        fontWeight: 700,
                        letterSpacing: "0.03em",
                        background: "#fef2f2",
                        color: "#b91c1c",
                        border: "1px solid #fecaca",
                      }}
                    >
                      <FaTools size={7} /> DOWN
                    </div>
                  )}
                </div>
                <div style={{ display: "flex", gap: 6 }}>
                  {(() => {
                    // timeSlots is the union of every machine's slot times
                    // (the finest interval any machine uses) — a machine on
                    // a coarser interval (e.g. MRI every 30 min) doesn't
                    // actually have a slot at every union time. Rendering a
                    // clickable "available" cell there was misleading (and
                    // handleCellClick would reject it anyway) — render those
                    // as a plain, non-interactive filler instead so the row
                    // only shows this machine's real bookable times.
                    const ownSlots = getMachineOwnSlots(m.MachineId, timeSlots, machineSlotsMap);
                    // How many of this machine's own slots the test's
                    // configured duration needs (e.g. 60 min ÷ 30-min
                    // interval = 2) — a single free cell isn't actually
                    // bookable on its own unless enough consecutive slots
                    // after it are free too.
                    const needed = getRequiredSlotCount(ownSlots);
                    const pendingSet = getPendingSlotsForMachine(m.MachineId, date);
                    return timeSlots.map((slot) => {
                      if (!ownSlots.includes(slot)) {
                        return (
                          <div
                            key={slot}
                            title={`${m.MachineName} doesn't run a slot at ${slot}`}
                            style={{
                              flex: "0 0 auto",
                              width: 44,
                              height: 30,
                              borderRadius: 6,
                              background: "transparent",
                              border: "1px dashed #f1f5f9",
                            }}
                          />
                        );
                      }

                      const key = `${m.MachineId}_${slot}`;
                      const blockedCell = isBlocked(m.MachineId, slot);
                      const appts = cellAppts(m.MachineId, slot);
                      const taken = appts.length > 0;
                      const registeredTaken = taken && isCellRegistered(m.MachineId, slot);
                      const busy = bookingKey === key;
                      const pastSlot = isSlotInPast(slot, date);
                      // This cell itself is free, but does it have enough
                      // consecutive free room after it for the test's full
                      // duration? A 60-min test on a 30-min machine needs
                      // this slot AND the next one — showing this as a plain
                      // green "available" cell when the next slot is taken
                      // (or the day just runs out) was misleading, since
                      // clicking it would only get rejected.
                      // Recurring daily lunch break — checked before the
                      // generic "insufficient room" case so the cell/tooltip
                      // says why in plain terms instead of a generic
                      // duration-shortfall message.
                      const duringLunch = !blockedCell && !registeredTaken && !pastSlot && !taken && isLunchAtSlot(m, slot);
                      // Checked before the generic "insufficient room" case,
                      // same reasoning as lunch above — a broken machine gets
                      // its own clear tooltip/color instead of a vague
                      // duration-shortfall message.
                      const down = !blockedCell && !registeredTaken && !pastSlot && !taken && !duringLunch && isMachineDownAtSlot(m, slot);
                      const ownIdx = ownSlots.indexOf(slot);
                      const group = ownSlots.slice(ownIdx, ownIdx + needed);
                      const insufficientRoom =
                        !blockedCell && !registeredTaken && !pastSlot && !taken && !duringLunch && !down &&
                        (group.length < needed || !isGroupFree(m, group, appointments, blocked, date, pendingSet));
                      // Registered = actually occupied, can't book over it.
                      // Unregistered = still open — clickable like an empty slot.
                      // Past = today's date, but this time has already gone by.
                      const isDisabled = blockedCell || registeredTaken || busy || pastSlot || insufficientRoom || duringLunch || down;

                      let bg = "#dcfce7", border = "1px solid #86efac"; // available
                      if (busy) { bg = "#93c5fd"; border = "1px solid #60a5fa"; }
                      else if (registeredTaken) { bg = "#fecaca"; border = "1px solid #fca5a5"; }
                      else if (taken) { bg = "#fef08a"; border = "1px solid #fde047"; }
                      else if (blockedCell) { bg = "#e2e8f0"; border = "1px solid #cbd5e1"; }
                      else if (pastSlot) { bg = "#f1f5f9"; border = "1px solid #e2e8f0"; }
                      else if (duringLunch) { bg = "#fef9e7"; border = "1px dashed #fcd34d"; }
                      else if (down) { bg = "#fef2f2"; border = "1px dashed #fca5a5"; }
                      else if (insufficientRoom) { bg = "#f8fafc"; border = "1px dashed #cbd5e1"; }

                      return (
                        <div
                          key={slot}
                          title={`${slot}${taken ? (registeredTaken ? " — Registered" : " — Booked (not registered)") : blockedCell ? " — Blocked" : pastSlot ? " — Past" : duringLunch ? ` — Lunch break (${m.LunchStartTime}–${m.LunchEndTime})` : down ? ` — Breakdown${m.BreakdownReason ? ` (${m.BreakdownReason})` : ""}` : insufficientRoom ? ` — Not enough consecutive slots for this test's ${testDurationMinutes}-min duration` : ""}`}
                          onClick={() => !isDisabled && handleCellClick(m, slot)}
                          style={{
                            flex: "0 0 auto",
                            width: 44,
                            height: 30,
                            borderRadius: 6,
                            background: bg,
                            border,
                            cursor: isDisabled ? (busy ? "wait" : "not-allowed") : "pointer",
                            transition: "transform 0.1s, box-shadow 0.1s",
                          }}
                          onMouseEnter={(e) => {
                            if (!isDisabled) e.currentTarget.style.boxShadow = "0 0 0 2px #16a34a55";
                          }}
                          onMouseLeave={(e) => { e.currentTarget.style.boxShadow = "none"; }}
                        />
                      );
                    });
                  })()}
                </div>
              </div>
            ))}
          </div>

          {/* ── Legend ───────────────────────────────────────────────────── */}
          <div style={{ display: "flex", gap: 18, marginTop: 16, paddingTop: 12, borderTop: "1px solid #f1f5f9", flexWrap: "wrap" }}>
            {[
              { label: "Available", count: slotCounts.available, bg: "#dcfce7", border: "#86efac" },
              { label: "Registered", count: slotCounts.registered, bg: "#fecaca", border: "#fca5a5" },
              { label: "Booked (not registered)", count: slotCounts.unregistered, bg: "#fef08a", border: "#fde047" },
              { label: "Blocked", count: slotCounts.blocked, bg: "#e2e8f0", border: "#cbd5e1" },
              { label: "Lunch Break", count: slotCounts.lunch, bg: "#fef9e7", border: "#fcd34d" },
              { label: "Breakdown", count: slotCounts.down, bg: "#fef2f2", border: "#fca5a5" },
              { label: "Booking…", count: null, bg: "#93c5fd", border: "#60a5fa" },
            ].map((s) => (
              <div key={s.label} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "#475569" }}>
                <span style={{ width: 16, height: 16, borderRadius: 4, background: s.bg, border: `1px solid ${s.border}`, display: "inline-block" }} />
                {s.label}
                {s.count !== null && <span style={{ color: "#94a3b8" }}>({s.count})</span>}
              </div>
            ))}
          </div>
        </>
      )}
    </Dialog>
  );
};

export default SlotBookModal;
