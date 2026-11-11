import React, { useEffect, useState } from "react";
import moment from "moment";
import { toast } from "react-toastify";
import { FaLock, FaExclamationTriangle, FaCog, FaCalendarAlt, FaRedo, FaTimes, FaPrint, FaPlus, FaTools, FaSignInAlt, FaSignOutAlt } from "react-icons/fa";
import Accordion from "../../components/UI/Accordion";
import DatePicker from "../../components/formComponent/DatePicker";
import ReactSelect from "../../components/formComponent/ReactSelect";
import Loading from "../../components/loader/Loading";
import BookSlotModal from "./BookSlotModal";
import RescheduleModal from "./RescheduleModal";
import CancelModal from "./CancelModal";
import {
  bindCentresForRadiology,
  getMacRadiologyAppointment,
  printAppointmentReceipt,
} from "./api";
import { CustomButton } from "../../components/UI/CustomButton";
import { useLocalStorage } from "../../utils/hooks/useLocalStorage";


// ── Status colour map — matches legend in RadiologyAppointment UI ─────────────
// Modern flat accent colours; each status renders as a tinted card with a
// coloured left-border accent rather than a solid block.
const STATUS = {
  // ── New ──────────────────────────────────────────────────────────────────────
  new_normal:      { accent: "#f59e0b", label: "New Normal"        },
  new_vip:         { accent: "#10b981", label: "New VIP"           },
  new_vvip:        { accent: "#ec4899", label: "New VVIP"          },
  new_urgent:      { accent: "#ef4444", label: "New Urgent"        },
  // ── Booked ───────────────────────────────────────────────────────────────────
  booked_normal:   { accent: "#fb7185", label: "Booked Normal"     },
  booked_vip:      { accent: "#06b6d4", label: "Booked VIP"        },
  booked_vvip:     { accent: "#22c55e", label: "Booked VVIP"       },
  booked_urgent:   { accent: "#b91c1c", label: "Booked Urgent"     },
  // ── Confirm ──────────────────────────────────────────────────────────────────
  confirm_normal:  { accent: "#f97316", label: "Confirm Normal"    },
  confirm_vip:     { accent: "#eab308", label: "Confirm VIP"       },
  confirm_vvip:    { accent: "#dc2626", label: "Confirm VVIP"      },
  confirm_urgent:  { accent: "#7f1d1d", label: "Confirm Urgent"    },
  // ── Cancel ───────────────────────────────────────────────────────────────────
  cancelled:           { accent: "#94a3b8", label: "Appointment Cancel", muted: true },
  appointment_cancel:  { accent: "#94a3b8", label: "Appointment Cancel", muted: true },
};

const getStyle = (status) =>
  STATUS[(status || "").toLowerCase().replace(/\s+/g, "_")] || STATUS.new_normal;

// isRegistered is a separate signal from status (a VIP/Normal/etc. booking
// can be registered or not), so it gets its own colour/badge layered on top
// of the status accent rather than living inside the STATUS map.
const REGISTERED_COLOR = "#059669";

// Patient-flow signal (arrived at the machine / left) — also independent of
// status, so it gets its own small badge rather than folding into STATUS.
// isPatientOut implies isPatientIn already happened, so it takes priority;
// neither flag set means "not arrived yet" and gets no badge at all, to
// keep untouched cards visually quiet.
const getPatientFlowInfo = (appt) => {
  const isIn  = !!(appt.isPatientIn  ?? appt.IsPatientIn);
  const isOut = !!(appt.isPatientOut ?? appt.IsPatientOut);
  if (isOut) {
    return { label: "Out", icon: FaSignOutAlt, color: "#334155", bg: "#e2e8f0", time: appt.patientOutTime ?? appt.PatientOutTime };
  }
  if (isIn) {
    return { label: "In", icon: FaSignInAlt, color: "#065f46", bg: "#d1fae5", time: appt.patientInTime ?? appt.PatientInTime };
  }
  return null;
};

// ── Filter pills — dedupe STATUS entries that share a label (e.g. "cancelled"
// and "appointment_cancel" both render as "Appointment Cancel"), grouping their
// keys together so one pill can match multiple raw status values.
const FILTER_PILLS = Object.entries(STATUS).reduce((acc, [key, s]) => {
  const existing = acc.find((p) => p.label === s.label);
  if (existing) existing.keys.push(key);
  else acc.push({ keys: [key], label: s.label, accent: s.accent });
  return acc;
}, []);

const hexToRgba = (hex, alpha) => {
  const h = hex.replace("#", "");
  const r = parseInt(h.substring(0, 2), 16);
  const g = parseInt(h.substring(2, 4), 16);
  const b = parseInt(h.substring(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

// ── Helper: colour dot for legend ─────────────────────────────────────────────
const Dot = ({ color }) => (
  <span
    style={{
      display: "inline-block",
      width: "8px", height: "8px",
      borderRadius: "50%",
      background: color,
      flexShrink: 0,
    }}
  />
);

// Generate 15-min time slots from 07:00 to 20:45

const RadiologyAppointment = () => {
  const theme = useLocalStorage("theme", "get") || "sky_blue_theme";
  const hdr   = getHdr(theme);

  const [centres, setCentres] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState({ Date: new Date(), CentreId: "" });
  const [gridData, setGridData] = useState({ machines: [], timeSlots: [], appointments: {}, blocked: {}, machineSlots: {} });
  const [statusFilter, setStatusFilter] = useState(""); // "" = all statuses

  // With 10+ narrow (~120px) machine columns side by side, it's easy to
  // misjudge which column the cursor is over — especially once a neighbouring
  // column's box visually reaches into the next row (a coarser/irregular
  // machine's own slots spanning multiple shared grid rows). Highlighting the
  // whole hovered column (header included) gives an unambiguous "this is the
  // machine you're about to click" signal before the click actually happens.
  const [hoveredColKey, setHoveredColKey] = useState(null);

  const [bookModal,       setBookModal]       = useState({ visible: false, slotInfo: null });
  const [rescheduleModal, setRescheduleModal] = useState({ visible: false, appointment: null });
  const [cancelModal,     setCancelModal]     = useState({ visible: false, appointment: null });

  // "now" only changes on state updates — without this tick, isSlotInPast()
  // would freeze at whatever time the page last rendered and never catch up
  // as the clock moves forward while the grid just sits there.
  const [now, setNow] = useState(() => moment());
  useEffect(() => {
    const timer = setInterval(() => setNow(moment()), 60000);
    return () => clearInterval(timer);
  }, []);

  const didInit = React.useRef(false);
  useEffect(() => {
    if (didInit.current) return;
    didInit.current = true;
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
      if (data.length > 0) {
        setFilter((prev) =>
          prev.CentreId ? prev : { ...prev, CentreId: data[0].value }
        );
      }
    } catch {
      toast.error("Failed to load centres.");
    }
  };

  const fetchGrid = async (params) => {
    setLoading(true);
    setGridData({ machines: [], timeSlots: [], appointments: {}, blocked: {}, machineSlots: {} });

    let machines     = [];
    let timeSlots    = [];
    let appointments = {};
    let blocked      = {};
    let machineSlots = {};

    // ── Step 1: call main API (may 404 or return empty machines) ─────────────
    try {
      const res  = await getMacRadiologyAppointment({
        date:     moment(params.Date).format("DD/MMM/YYYY"),
        centreId: params.CentreId,
      });
      const data = res?.data?.message;

      if (data && !Array.isArray(data)) {
        if (data.machines?.length > 0) {
          // MachineKey matches the machineId used in appointment keys ("64_09:15")
          // GlobalMachineName is the readable name ("Architect", not "3")
          // Filter out inactive machines (IsActive: 0 or null)
          machines = data.machines
            .filter((m) => (m.IsActive ?? m.isActive) == null || (m.IsActive ?? m.isActive) === 1 || (m.IsActive ?? m.isActive) === true)  // keep if no IsActive field or explicitly active
            .map((m) => ({
              ...m,
              // backend has moved to camelCase (machineId/machineName/...) —
              // keep the old PascalCase variants as fallback in case an older
              // response shape shows up somewhere
              MachineId:      m.machineId ?? m.MachineKey ?? m.GlobalMachineID ?? m.MachineId,
              MachineName:    m.machineName ?? m.GlobalMachineName ?? m.MachineName ?? m.MachineID,
              DepartmentId:   m.departmentId ?? m.DepartmentId ?? m.DepartmentID ?? null,
              DepartmentName: m.departmentName ?? m.DepartmentName ?? m.Department ?? "",
              IsBreakdown:     m.isBreakdown ?? m.IsBreakdown ?? false,
              BreakdownReason: m.breakdownReason ?? m.BreakdownReason ?? "",
              // breakdownDate can arrive as a plain ISO string or as a
              // {value, isNull, ...} DateTime-wrapper object depending on
              // the endpoint's serializer — normalize to a plain string
              BreakdownDate: (() => {
                const d = m.breakdownDate ?? m.BreakdownDate;
                if (!d) return null;
                return typeof d === "object" ? (d.isNull ? null : d.value) : d;
              })(),
              // per-date windows ("HH:mm" start/end, end=null means still
              // down as of this date) — see backend-radiology-machine-breakdown-windows.md.
              // Falls back to [] on older backend responses that don't send
              // this yet, in which case isMachineDownAtSlot() below falls
              // back to the old whole-day IsBreakdown flag.
              BreakdownPeriods: (m.breakdownPeriods ?? m.BreakdownPeriods ?? []).map((p) => ({
                Reason:    p.reason ?? p.Reason ?? "",
                StartTime: p.startTime ?? p.StartTime ?? null,
                EndTime:   p.endTime ?? p.EndTime ?? null,
              })),
              // Recurring daily lunch window ("HH:mm" start/end), configured
              // once per machine in Machine & Slot Master — unlike breakdown
              // windows this has no date, it just applies every day until
              // edited. Null when not configured, which isLunchAtSlot()
              // below treats as "no lunch break for this machine".
              LunchStartTime: m.lunchStartTime ?? m.LunchStartTime ?? null,
              LunchEndTime:   m.lunchEndTime   ?? m.LunchEndTime   ?? null,
            }));
        }
        if (data.timeSlots?.length > 0)  timeSlots    = data.timeSlots;
        if (data.appointments)           appointments = data.appointments;
        if (data.blocked)                blocked      = data.blocked;
        // per-machine actual slot times (a machine on a 30-min interval only
        // has half of the 15-min union `timeSlots` above as real slots) —
        // keys normalized to strings so lookups match regardless of whether
        // MachineId ends up numeric or string
        if (data.machineSlots) {
          machineSlots = Object.fromEntries(
            Object.entries(data.machineSlots).map(([mid, slots]) => [String(mid), slots])
          );
        }
      } else if (Array.isArray(data)) {
        data.forEach((appt) => {
          const mid = appt.machineId ?? appt.MachineKey ?? appt.GlobalMachineID ?? appt.MachineId;
          const key = `${mid}_${appt.TimeSlot ?? appt.timeSlot}`;
          if (!appointments[key]) appointments[key] = [];
          appointments[key].push(appt);
        });
      }
    } catch {
      // 404 or network error — fall through to machine fallback
    }

    setGridData({ machines, timeSlots, appointments, blocked, machineSlots });
    setLoading(false);
  };

  const handleSearch = () => {
    if (!filter.CentreId) { toast.warn("Please select a centre."); return; }
    fetchGrid(filter);
  };

  const allAppts = (machineId, slot) =>
    gridData.appointments[`${machineId}_${slot}`] || [];

  // Filtered view used only for rendering the grid — booking logic always uses allAppts.
  const cellAppts = (machineId, slot) => {
    const appts = allAppts(machineId, slot);
    if (!statusFilter) return appts;
    if (statusFilter === "Registered") {
      return appts.filter((a) => !!(a.isRegistered ?? a.IsRegistered));
    }
    const group = FILTER_PILLS.find((p) => p.label === statusFilter);
    return appts.filter((a) => {
      const key = (a.status ?? a.Status ?? "").toLowerCase().replace(/\s+/g, "_");
      return group?.keys.includes(key);
    });
  };

  const isBlocked = (machineId, slot) =>
    (gridData.blocked[String(machineId)] || []).includes(slot);

  // gridData.timeSlots is the UNION of every machine's slot times (15-min
  // granularity if any machine uses that interval). A machine on a coarser
  // interval (e.g. 30-min) doesn't actually have every one of those times —
  // machineSlots[machineId] is that machine's real list. If a machine has no
  // entry there (older backend response, or data gap), treat every slot as
  // valid so nothing regresses — this only ever narrows, never blocks.
  const isValidSlotForMachine = (machineId, slot) => {
    const own = gridData.machineSlots[String(machineId)];
    if (!own || own.length === 0) return true;
    return own.includes(slot);
  };

  // A slot ("HH:mm") counts as down if it falls inside any of the machine's
  // breakdown windows for the date being viewed. "HH:mm" strings compare
  // correctly with plain < / >= since they're fixed-width zero-padded.
  // EndTime === null means still broken as of this date (open-ended).
  const isMachineDownAtSlot = (machine, slot) => {
    if (machine.BreakdownPeriods?.length > 0) {
      return machine.BreakdownPeriods.some((p) => {
        if (!p.StartTime) return false;
        if (slot < p.StartTime) return false;
        if (p.EndTime && slot >= p.EndTime) return false;
        return true;
      });
    }
    // no windowed data from the backend yet — fall back to the old
    // whole-day flag so nothing regresses before that ships
    return !!machine.IsBreakdown;
  };

  // Recurring daily lunch window — same "HH:mm" comparison as breakdown
  // windows above, but with no date attached: configured once per machine
  // (Machine & Slot Master), applies every day until edited. No lunch
  // configured (either field null) → never lunch.
  const isLunchAtSlot = (machine, slot) => {
    if (!machine?.LunchStartTime || !machine?.LunchEndTime) return false;
    return slot >= machine.LunchStartTime && slot < machine.LunchEndTime;
  };

  // Today's date only: block anything earlier than right now so staff can't
  // book a slot that's already passed. Full past dates are still handled by
  // isPastDate below.
  const isSlotInPast = (slot) => {
    if (!filter.Date) return false;
    if (!moment(filter.Date).isSame(now, "day")) return false;
    return moment(`${moment(filter.Date).format("YYYY-MM-DD")} ${slot}`, "YYYY-MM-DD HH:mm").isBefore(now);
  };

  const openBook = (machine, slot) => {
    if (!isValidSlotForMachine(machine.MachineId, slot)) {
      toast.warn(`${machine.MachineName} doesn't have a slot at ${slot} — its schedule runs on a different interval.`);
      return;
    }
    if (isMachineDownAtSlot(machine, slot)) {
      toast.warn(`${machine.MachineName} is under breakdown at ${slot}${machine.BreakdownReason ? ` (${machine.BreakdownReason})` : ""} — booking is disabled for this slot until it's marked fixed.`);
      return;
    }
    if (isLunchAtSlot(machine, slot)) {
      toast.warn(`${machine.MachineName} is on lunch break at ${slot} (${machine.LunchStartTime}–${machine.LunchEndTime}) — pick a slot outside lunch.`);
      return;
    }
    if (isSlotInPast(slot)) {
      toast.warn("That time has already passed today — pick a later slot.");
      return;
    }
    const existing = allAppts(machine.MachineId, slot);

    // Only offer multi-slot booking when starting from an empty slot — find
    // the longest run of consecutive free/unblocked slots from here on.
    // Walk THIS MACHINE'S OWN slot list, not the shared union grid — the
    // union list is 15-min (or finer/odd) granularity shared by every
    // machine, so for a coarser machine (e.g. MRI on a 30-min interval) the
    // very next union step is never one of its own slots, and walking the
    // union list would break after exactly one slot every time regardless
    // of how much real room the machine actually has (this is what made
    // every duration-based multi-slot booking cap at "1 consecutive slot").
    const ownSlotList = machineOwnSlots(machine.MachineId);
    const upcoming = [];
    if (existing.length === 0) {
      const idx = ownSlotList.indexOf(slot);
      for (let i = idx; i >= 0 && i < ownSlotList.length && upcoming.length < 12; i++) {
        const s = ownSlotList[i];
        if (isBlocked(machine.MachineId, s)) break;
        if (isMachineDownAtSlot(machine, s)) break;
        if (isLunchAtSlot(machine, s)) break;
        if (isSlotInPast(s)) break;
        if (i !== idx && allAppts(machine.MachineId, s).length > 0) break;
        upcoming.push(s);
      }
    } else {
      upcoming.push(slot);
    }

    setBookModal({
      visible: true,
      slotInfo: {
        Date:                filter.Date,
        TimeSlot:            slot,
        upcomingSlots:       upcoming,
        allowMultiSlot:      existing.length === 0,
        MachineId:           machine.MachineId,
        MachineName:         machine.MachineName,
        DepartmentId:        machine.DepartmentId,
        DepartmentName:      machine.DepartmentName,
        CentreId:            filter.CentreId,
        initialAppointments: existing,
      },
    });
  };

  // A machine's real bookable times — falls back to the union grid when the
  // backend hasn't sent per-machine slots, so machines on the same interval
  // as everyone else behave exactly as before.
  const machineOwnSlots = (machineId) => {
    const own = gridData.machineSlots[String(machineId)];
    return own && own.length > 0 ? own : gridData.timeSlots;
  };

  // Multiple tests picked together during patient registration land as
  // separate appointments with DIFFERENT bookingIds (the backend assigns
  // one per test, not one per registration) but adjacent time slots on the
  // same machine — grouping strictly by bookingId then splits them into
  // separate boxes instead of the one combined box they belong in. Prefer
  // registrationId when present (same patient/visit) so these still merge;
  // fall back to bookingId for ad-hoc/walk-in bookings with no registration.
  const getMergeKey = (appt) => {
    const regId = appt.registrationId ?? appt.RegistrationId;
    if (regId) return `reg-${regId}`;
    const bId = appt.bookingId ?? appt.BookingId ?? "";
    return bId ? `booking-${bId}` : "";
  };

  // ── Build each machine's grid cells from ITS OWN slot times, not the
  // 15-min union list every column shares — so a 30-min machine's box is
  // sized (rowSpan) to actually cover its real 30 minutes, a multi-slot
  // booking across two of its own slots merges into one box even though an
  // "in-between" union row sits between them, and any leading/trailing rows
  // outside its configured times collapse into one plain filler block.
  // Merges contiguous same-mergeKey slots (one registration/booking = one
  // box) and contiguous empty + down-for-breakdown slots (one clean block
  // instead of repeating a "Down" pill on every remaining slot of the day)
  // exactly as before, just walked over the real slot list.
  const buildMergeMap = (machineId) => {
    const map = {};
    const unionSlots = gridData.timeSlots;
    const ownSlots = machineOwnSlots(machineId);
    const machine = gridData.machines.find((m) => m.MachineId === machineId);

    const unionIdx = ownSlots
      .map((s) => unionSlots.indexOf(s))
      .filter((idx) => idx !== -1);

    if (unionIdx.length === 0) {
      // own-slot data doesn't line up with the union list at all (shouldn't
      // happen) — fall back to one union row per own slot, old behaviour
      unionSlots.forEach((s, ri) => { map[ri] = { span: 1, slot: s }; });
      return map;
    }

    // leading filler — rows before this machine's first real slot
    if (unionIdx[0] > 0) map[0] = { span: unionIdx[0], filler: true };

    const widthAt = (k) =>
      k + 1 < unionIdx.length ? unionIdx[k + 1] - unionIdx[k] : 1;

    let k = 0;
    while (k < unionIdx.length) {
      const slot = ownSlots[k];
      const rowStart = unionIdx[k];

      if (isBlocked(machineId, slot)) {
        map[rowStart] = { span: widthAt(k), slot };
        k += 1;
        continue;
      }

      const appts = cellAppts(machineId, slot);
      const bId   = appts.length === 1 ? getMergeKey(appts[0]) : "";
      if (appts.length === 1 && bId) {
        const group = [appts[0]];
        let span = widthAt(k);
        let endSlot = slot;
        let k2 = k + 1;
        while (k2 < unionIdx.length && !isBlocked(machineId, ownSlots[k2])) {
          const nextAppts = cellAppts(machineId, ownSlots[k2]);
          const nextId = nextAppts.length === 1 ? getMergeKey(nextAppts[0]) : "";
          if (nextAppts.length !== 1 || nextId !== bId) break;
          group.push(nextAppts[0]);
          endSlot = ownSlots[k2];
          span += widthAt(k2);
          k2 += 1;
        }
        map[rowStart] = { span, group, slot, endSlot: endSlot !== slot ? endSlot : undefined };
        k = k2;
        continue;
      }   

      // Recurring daily lunch break — checked before breakdown so a machine
      // that's both on lunch and (separately) down still shows as "Down",
      // but an appointment already sitting in the lunch window (booked
      // before lunch was configured, or overridden) still renders normally
      // above via the appts.length===1 branch, same as breakdown.
      if (appts.length === 0 && machine && isLunchAtSlot(machine, slot)) {
        let span = widthAt(k);
        let endSlot = slot;
        let k2 = k + 1;
        while (
          k2 < unionIdx.length &&
          !isBlocked(machineId, ownSlots[k2]) &&
          cellAppts(machineId, ownSlots[k2]).length === 0 &&
          isLunchAtSlot(machine, ownSlots[k2])
        ) {
          endSlot = ownSlots[k2];
          span += widthAt(k2);
          k2 += 1;
        }
        map[rowStart] = { span, lunch: true, slot, endSlot: endSlot !== slot ? endSlot : undefined };
        k = k2;
        continue;
      }

      if (appts.length === 0 && machine && isMachineDownAtSlot(machine, slot)) {
        let span = widthAt(k);
        let endSlot = slot;
        let k2 = k + 1;
        while (
          k2 < unionIdx.length &&
          !isBlocked(machineId, ownSlots[k2]) &&
          cellAppts(machineId, ownSlots[k2]).length === 0 &&
          isMachineDownAtSlot(machine, ownSlots[k2])
        ) {
          endSlot = ownSlots[k2];
          span += widthAt(k2);
          k2 += 1;
        }
        map[rowStart] = { span, breakdown: true, slot, endSlot: endSlot !== slot ? endSlot : undefined };
        k = k2;
        continue;
      }

      map[rowStart] = { span: widthAt(k), slot };
      k += 1;
    }

    // trailing filler — rows after this machine's last real slot
    const lastRow   = unionIdx[unionIdx.length - 1];
    const lastWidth = map[lastRow]?.span || 1;
    const afterLast = lastRow + lastWidth;
    if (afterLast < unionSlots.length) {
      map[afterLast] = { span: unionSlots.length - afterLast, filler: true };
    }

    return map;
  };

  // machine.MachineId is NOT guaranteed unique — the backend fallback chain
  // (machineId ?? MachineKey ?? GlobalMachineID ?? MachineId) can leave two
  // machines sharing the same value (most often `undefined`, e.g. a machine
  // just added/edited in Machine & Slot Master whose id hasn't round-tripped
  // yet). Using MachineId alone as a React `key` (and as the mergeMaps object
  // key) then makes React reconcile/reuse DOM nodes — and their onClick
  // closures — between two DIFFERENT machines' columns on any re-render,
  // which is exactly the "click machine A, get machine B's modal" bug. Every
  // column's position (`idx`) is always unique and stable for one render, so
  // folding it into the key removes the collision outright regardless of
  // whether the backend ever fixes MachineId itself.
  const colKey = (m, idx) => `${m?.MachineId ?? "nomid"}__${idx}`;

  // One-time console warning so the actual duplicate/missing ids are visible
  // for a backend-side fix too, without blocking on it.
  React.useEffect(() => {
    const seen = new Map();
    gridData.machines.forEach((m) => {
      const id = String(m.MachineId);
      seen.set(id, (seen.get(id) || 0) + 1);
    });
    const dupes = [...seen.entries()].filter(([, count]) => count > 1);
    if (dupes.length > 0) {
      // eslint-disable-next-line no-console
      console.warn(
        "[RadiologyAppointment] Duplicate/undefined MachineId across machines — this is what was causing the wrong modal to open:",
        dupes.map(([id, count]) => `${id} (x${count})`),
        gridData.machines.map((m) => `${m.MachineId}:${m.MachineName}`),
      );
    }
  }, [gridData]);

  const mergeMaps = React.useMemo(() => {
    const maps = {};
    gridData.machines.forEach((m, idx) => { maps[colKey(m, idx)] = buildMergeMap(m.MachineId); });
    return maps;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gridData, statusFilter]);

  const onSuccess = () => fetchGrid(filter);

  const isPastDate = moment(filter.Date).startOf("day").isBefore(moment(now).startOf("day"));

  const hasGrid      = gridData.machines.length > 0 && gridData.timeSlots.length > 0;
  const noMachines   = gridData.machines.length === 0 && gridData.timeSlots.length > 0;
  const noTimeSlots  = gridData.machines.length > 0  && gridData.timeSlots.length === 0;

  return (
    <>
      <Accordion title="Radiology Appointment" defaultValue={true}>

        {/* ── Filter bar ────────────────────────────────────────────────────── */}
        <div
          className="d-flex flex-wrap align-items-end gap-3 mb-3 px-3 py-3"
          style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: "10px" }}
        >
          {/* Centre */}
          <div className="col-sm-2" style={{ minWidth: "200px" }}>
            <ReactSelect
              id="RA_Centre"
              name="CentreId"
              placeholderName="Centre"
              dynamicOptions={centres}
              value={filter.CentreId}
              removeIsClearable
              onChange={(_, opt) =>
                setFilter((prev) => ({ ...prev, CentreId: opt?.value || "" }))
              }
            />
          </div>

          {/* Date */}
          <div style={{ minWidth: "160px", flex: "0 0 160px" }}>
            <DatePicker
              name="Date"
              id="RA_Date"
              lable="Date"
              value={filter.Date}
              onChange={(v) => setFilter((prev) => ({ ...prev, Date: v }))}
            />
          </div>

          {/* Search */}
          <CustomButton
            text=" Search Data"
            onClick={handleSearch}
            icon="search"
            className="mb-2 ml-2"
          />

          {/* Date label right */}
          <div
            className="d-flex align-items-center gap-2 ms-auto"
            style={{
              fontSize: "12.5px",
              fontWeight: "600",
              color: "#475569",
              background: "#f1f5f9",
              padding: "6px 12px",
              borderRadius: "999px",
              whiteSpace: "nowrap",
            }}
          >
            <FaCalendarAlt size={11} style={{ color: hdr.bg }} />
            {moment(filter.Date).format("dddd, DD MMMM YYYY")}
          </div>
        </div>

        {/* ── Status filter pills ───────────────────────────────────────────── */}
        {gridData && gridData.machines.length > 0 && gridData.timeSlots.length > 0 && (
          <div
            className="d-flex align-items-center gap-2 mb-3 px-3 py-3"
            style={{
              background: "#fff", border: "1px solid #e5e7eb", borderRadius: "10px",
              flexWrap: "nowrap", overflowX: "auto", scrollbarWidth: "thin",
            }}
         >
          <span
            style={{
              fontSize: "11.5px", fontWeight: 700, color: "#64748b",
              textTransform: "uppercase", letterSpacing: "0.06em", whiteSpace: "nowrap",
              flexShrink: 0,
            }}
          >
          
          </span>
          {FILTER_PILLS.map((p) => {
            const isActive = statusFilter === p.label;
            return (
              <div
                key={p.label}
                onClick={() => setStatusFilter(isActive ? "" : p.label)}
                className="d-flex align-items-center gap-1 pointer"
                style={{
                  flexShrink: 0,
                  padding: "5px 12px",
                  borderRadius: "999px",
                  border: isActive ? "1px solid #6366f1" : "1px solid #e2e8f0",
                  background: isActive ? "#eef2ff" : "#fff",
                  color: isActive ? "#4f46e5" : "#475569",
                  fontSize: "11px",
                  fontWeight: 600,
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                  boxShadow: isActive ? "0 2px 4px rgba(99,102,241,0.2)" : "0 1px 2px rgba(0,0,0,0.04)",
                  transition: "all 0.15s",
                }}
              >
                <Dot color={p.accent} />
                {p.label}
              </div>
            );
          })}
          <div style={{ width: "1px", alignSelf: "stretch", background: "#e5e7eb", flexShrink: 0 }} />
          {(() => {
            const isActive = statusFilter === "Registered";
            return (
              <div
                onClick={() => setStatusFilter(isActive ? "" : "Registered")}
                className="d-flex align-items-center gap-1 pointer"
                style={{
                  flexShrink: 0,
                  padding: "5px 12px",
                  borderRadius: "999px",
                  border: isActive ? `1px solid ${REGISTERED_COLOR}` : "1px solid #e2e8f0",
                  background: isActive ? "#ecfdf5" : "#fff",
                  color: isActive ? REGISTERED_COLOR : "#475569",
                  fontSize: "11px",
                  fontWeight: 600,
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                  boxShadow: isActive ? "0 2px 4px rgba(5,150,105,0.2)" : "0 1px 2px rgba(0,0,0,0.04)",
                  transition: "all 0.15s",
                }}
              >
                <Dot color={REGISTERED_COLOR} />
                Registered
              </div>
            );
          })()}
          {statusFilter && (
            <button
              type="button"
              onClick={() => setStatusFilter("")}
              className="btn btn-link p-0"
              style={{ fontSize: "11.5px", color: "#dc2626", fontWeight: 600, textDecoration: "none", marginLeft: "4px", flexShrink: 0 }}
            >
              Clear
            </button>
          )}
        </div>)}

        
        {isPastDate && !loading && (
          <div
            className="mb-3 px-3 py-2 d-flex align-items-center gap-2"
            style={{
              background: "#fffbeb",
              borderLeft: "3px solid #f59e0b",
              borderRadius: "6px",
              fontSize: "13px",
              color: "#92400e",
            }}
          >
            <FaExclamationTriangle size={12} />
            <span><strong>View only</strong> — this is a past date. Booking, rescheduling and cancellation are disabled.</span>
          </div>
        )}

        {/* ── Grid ──────────────────────────────────────────────────────────── */}
        {loading ? (
          <div className="py-4"><Loading /></div>
        ) : hasGrid ? (
          <div
            style={{
              overflowX: "auto",
              overflowY: "auto",
              maxHeight: "580px",
              border: "1px solid #e5e7eb",
              borderRadius: "10px",
            }}
          >
            {/*
              CSS Grid instead of an HTML <table> with per-column rowSpan.
              The old table relied on the browser to infer which column a
              <td> belonged to from which *other* columns' cells were
              omitted (covered by an earlier row's rowSpan) — with 11
              machines each on a different (sometimes irregular) interval,
              any single column's span being off by even one row silently
              shifted every other cell in that row sideways into the wrong
              machine's position (e.g. a BMD booking rendering under Xray).
              Every cell below instead declares its own gridColumn/gridRow
              explicitly, independent of every other cell, so one column's
              miscalculation can no longer bleed into a neighbour's.
            */}
            <div
              className="mainGrid"
              style={{
                display: "grid",
                gridTemplateColumns: `56px repeat(${gridData.machines.length}, minmax(130px, 1fr))`,
                fontSize: "11.5px",
                minWidth: `${80 + gridData.machines.length * 120}px`,
              }}
            >
              {/* Corner header cell */}
              <div style={{ ...makeThTimeStyle(hdr), gridColumn: 1, gridRow: 1 }}>Timeslot</div>

              {/* Machine headers */}
              {gridData.machines.map((m, mIdx) => (
                <div
                  key={colKey(m, mIdx)}
                  style={{ ...makeThMachineStyle(hdr, colKey(m, mIdx) === hoveredColKey), gridColumn: mIdx + 2, gridRow: 1 }}
                  onMouseEnter={() => setHoveredColKey(colKey(m, mIdx))}
                  onMouseLeave={() => setHoveredColKey(null)}
                >
                  <div>{m.MachineName}</div>
                  {m.IsBreakdown && (
                    <div
                      title={`Breakdown${m.BreakdownReason ? ` — ${m.BreakdownReason}` : ""}${m.BreakdownDate ? ` (since ${moment(m.BreakdownDate).format("DD-MMM-YYYY hh:mm A")})` : ""}`}
                      style={{
                        marginTop: "3px",
                        display: "flex",
                        width: "fit-content",
                        marginLeft: "auto",
                        marginRight: "auto",
                        alignItems: "center",
                        gap: "4px",
                        padding: "1px 9px",
                        borderRadius: "999px",
                        fontSize: "9px",
                        fontWeight: 700,
                        letterSpacing: "0.04em",
                        background: "#fef2f2",
                        color: "#b91c1c",
                        border: "1px solid #fecaca",
                      }}
                    >
                      <FaTools size={8} /> BREAKDOWN
                    </div>
                  )}
                </div>
              ))}

              {/* Time-axis column */}
              {gridData.timeSlots.map((slot, ri) => (
                <div key={`time_${slot}`} style={{ ...makeTdTimeStyle(hdr, ri), gridColumn: 1, gridRow: ri + 2 }}>
                  {slot}
                </div>
              ))}

              {/* Machine cells — one grid item per merge-map entry (not one
                  per row × column pair), each explicitly positioned. */}
              {gridData.machines.map((machine, mIdx) => {
                const thisColKey = colKey(machine, mIdx);
                const merge = mergeMaps[thisColKey] || {};

                // Same "which column am I actually over" signal as the
                // header — a vivid inset border down both edges of every
                // cell in this machine's column while hovered, so a click
                // can't land in the wrong machine's column without the
                // user noticing first.
                const isHoveredCol = thisColKey === hoveredColKey;
                const hoverColShadow = isHoveredCol ? "inset 3px 0 0 #1e3a8a, inset -3px 0 0 #1e3a8a" : "none";
                const colHoverHandlers = {
                  onMouseEnter: () => setHoveredColKey(thisColKey),
                  onMouseLeave: () => setHoveredColKey(null),
                };

                return Object.entries(merge).map(([rowStartStr, mergeEntry]) => {
                  const ri = Number(rowStartStr);
                  const gridPos = { gridColumn: mIdx + 2, gridRow: `${ri + 2} / span ${mergeEntry.span}` };
                  const entryKey = `${thisColKey}_${ri}`;

                  // ── Filler — rows outside this machine's own slot range
                  // (before its first / after its last real slot today) —
                  // not a status, just "no slot here" ───────────────────
                  if (mergeEntry.filler) {
                    return (
                      <div
                        key={entryKey}
                        {...colHoverHandlers}
                        style={{
                          ...gridPos,
                          padding: "3px 4px",
                          borderRight: "1px solid #f1f5f9",
                          borderBottom: "1px solid #f1f5f9",
                          background: ri % 2 === 0 ? "#ffffff" : "#fafbfc",
                          boxShadow: hoverColShadow,
                        }}
                      >
                        <div
                          title={`${machine.MachineName} has no slot in this window`}
                          className="d-flex align-items-center justify-content-center"
                          style={{ height: "28px", color: "#cbd5e1", fontSize: "12px", cursor: "default" }}
                        >
                          —
                        </div>
                      </div>
                    );
                  }

                  // The real time this cell represents — may differ from
                  // the union row's own `slot` (left-axis time) when this
                  // machine's interval is coarser than the grid's.
                  const ownSlot = mergeEntry.slot;
                  const down = isMachineDownAtSlot(machine, ownSlot);
                  const duringLunch = isLunchAtSlot(machine, ownSlot);
                  const cellStyle = {
                    ...gridPos,
                    padding: "3px 4px",
                    borderRight: "1px solid #f1f5f9",
                    borderBottom: "1px solid #f1f5f9",
                    minHeight: "32px",
                    background: down ? "#fffafa" : duringLunch ? "#fffdf5" : (ri % 2 === 0 ? "#ffffff" : "#fafbfc"),
                    boxShadow: hoverColShadow,
                  };

                  // ── Merged "under breakdown" box — contiguous empty
                  // slots covered by a breakdown window collapse into one
                  // clean block instead of one pill per slot ────────────
                  if (mergeEntry.span > 1 && mergeEntry.breakdown) {
                    return (
                      <div
                        key={entryKey}
                        {...colHoverHandlers}
                        style={{
                          ...gridPos,
                          padding: "3px 4px",
                          borderRight: "1px solid #f1f5f9",
                          borderBottom: "1px solid #f1f5f9",
                          background: "#fff7f7",
                          boxShadow: hoverColShadow,
                        }}
                      >
                        <div
                          title={machine.BreakdownReason || "Under breakdown"}
                          style={{
                            position: "sticky",
                            top: "40px",
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            textAlign: "center",
                            gap: "6px",
                            padding: "16px 10px",
                            borderRadius: "10px",
                            background: "#fef2f2",
                            border: "1px dashed #fca5a5",
                          }}
                        >
                          <FaTools size={16} color="#dc2626" />
                          <div style={{ fontSize: "11.5px", fontWeight: 700, color: "#991b1b" }}>
                            Under Breakdown
                          </div>
                          <div style={{ fontSize: "9.5px", fontWeight: 600, color: "#b91c1c" }}>
                            {mergeEntry.endSlot ? `${mergeEntry.slot} – ${mergeEntry.endSlot}` : mergeEntry.slot}
                          </div>
                          {machine.BreakdownReason && (
                            <div style={{ fontSize: "10.5px", color: "#b91c1c", maxWidth: "110px" }}>
                              {machine.BreakdownReason}
                            </div>
                          )}
                          {machine.BreakdownDate && (
                            <div style={{ fontSize: "9.5px", color: "#c2867f" }}>
                              since {moment(machine.BreakdownDate).format("DD-MMM hh:mm A")}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  }

                  // ── Merged "lunch break" box — contiguous empty slots
                  // covered by the machine's recurring daily lunch window
                  // collapse into one clean block, same idea as breakdown
                  // above ───────────────────────────────────────────────
                  if (mergeEntry.span > 1 && mergeEntry.lunch) {
                    return (
                      <div
                        key={entryKey}
                        {...colHoverHandlers}
                        style={{
                          ...gridPos,
                          padding: "3px 4px",
                          borderRight: "1px solid #f1f5f9",
                          borderBottom: "1px solid #f1f5f9",
                          background: "#fffdf0",
                          boxShadow: hoverColShadow,
                        }}
                      >
                        <div
                          title={`Lunch break ${machine.LunchStartTime}–${machine.LunchEndTime}`}
                          style={{
                            position: "sticky",
                            top: "40px",
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            textAlign: "center",
                            gap: "6px",
                            padding: "16px 10px",
                            borderRadius: "10px",
                            background: "#fef9e7",
                            border: "1px dashed #fcd34d",
                          }}
                        >
                          <span style={{ fontSize: "16px", lineHeight: 1 }}>🍽️</span>
                          <div style={{ fontSize: "11.5px", fontWeight: 700, color: "#92400e" }}>
                            Lunch Break
                          </div>
                          <div style={{ fontSize: "9.5px", fontWeight: 600, color: "#b45309" }}>
                            {mergeEntry.endSlot ? `${mergeEntry.slot} – ${mergeEntry.endSlot}` : mergeEntry.slot}
                          </div>
                        </div>
                      </div>
                    );
                  }

                  // ── Merged multi-slot booking box ──────────────────
                  if (mergeEntry.span > 1 && mergeEntry.group) {
                    const first   = mergeEntry.group[0];
                    const firstId = first.appointmentId ?? first.AppointmentId;
                    const groupIds = mergeEntry.group
                      .map((a) => a.appointmentId ?? a.AppointmentId)
                      .filter(Boolean);
                    const groupTestNames = [
                      ...new Set(
                        mergeEntry.group
                          .map((a) => a.testName ?? a.TestName)
                          .filter((t) => typeof t === "string" && t.trim() !== ""),
                      ),
                    ];
                    return (
                      <div key={entryKey} {...colHoverHandlers} style={{ ...cellStyle, position: "relative" }}>
                        <MergedAppCard
                          group={mergeEntry.group}
                          startSlot={mergeEntry.slot}
                          endSlot={mergeEntry.endSlot}
                          isPastDate={isPastDate}
                          onCancel={() =>
                            setCancelModal({
                              visible: true,
                              appointment: {
                                AppointmentId: firstId,
                                PatientName: first.patientName ?? first.PatientName,
                                TestName:
                                  groupTestNames.length > 1
                                    ? groupTestNames.join(", ")
                                    : `${groupTestNames[0] ?? ""} (${mergeEntry.group.length} slots)`,
                                TimeSlot: `${mergeEntry.slot} → ${mergeEntry.endSlot ?? mergeEntry.slot}`,
                                groupAppointmentIds: groupIds,
                              },
                            })
                          }
                          onPrint={() =>
                            firstId &&
                            // Single appointmentId only — backend looks up
                            // sibling tests (same registration/booking)
                            // itself and combines them into one PDF.
                            printAppointmentReceipt(firstId, {
                              date: filter.Date,
                              centreId: filter.CentreId,
                              departmentId: machine.DepartmentId,
                              isRegistered: !!(first.isRegistered ?? first.IsRegistered),
                              ledgerTransactionIDHash:
                                first.ledgertransactionIDHash ?? first.ledgerTransactionIDHash ?? first.LedgerTransactionIDHash,
                            }).catch(() => toast.error("Failed to print receipt."))
                          }
                          onAdd={() => openBook(machine, mergeEntry.slot)}
                        />
                      </div>
                    );
                  }

                  const appts = cellAppts(machine.MachineId, ownSlot);
                  return (
                    <div key={entryKey} {...colHoverHandlers} style={cellStyle}>
                      {isBlocked(machine.MachineId, ownSlot) ? (
                        /* ── Blocked slot ──────────────────────────── */
                        <div
                          title="Slot Blocked"
                          className="d-flex flex-column align-items-center justify-content-center gap-1"
                          style={{
                            height: "28px", borderRadius: "6px", fontSize: "11px",
                            fontWeight: 600, color: "#64748b",
                            background: "#f1f5f9",
                            cursor: "not-allowed",
                          }}
                        >
                          <span className="d-flex align-items-center gap-1"><FaLock size={9} /> Blocked</span>
                          <span style={{ fontSize: "9px", fontWeight: 500, color: "#94a3b8" }}>{ownSlot}</span>
                        </div>
                      ) : appts.length > 0 ? (
                        <>
                          {appts.map((appt) => {
                            const enriched = {
                              ...appt,
                              AppointmentId:  appt.appointmentId  ?? appt.AppointmentId,
                              PatientName:    appt.patientName    ?? appt.PatientName,
                              TestName:       appt.testName       ?? appt.TestName,
                              Status:         appt.status         ?? appt.Status,
                              TimeSlot:       ownSlot,
                              MachineId:      machine.MachineId,
                              MachineName:    machine.MachineName,
                              DepartmentId:   machine.DepartmentId,
                              DepartmentName: machine.DepartmentName,
                              CentreId:       filter.CentreId,
                            };
                            return (
                              <AppCard
                                key={enriched.AppointmentId}
                                appt={enriched}
                                time={ownSlot}
                                onReschedule={isPastDate ? null : () => setRescheduleModal({ visible: true, appointment: enriched })}
                                onCancel={isPastDate ? null : () => setCancelModal({ visible: true, appointment: enriched })}
                                onPrint={() =>
                                  printAppointmentReceipt(enriched.AppointmentId, {
                                    date: filter.Date,
                                    centreId: enriched.CentreId,
                                    departmentId: enriched.DepartmentId,
                                    isRegistered: !!(enriched.isRegistered ?? enriched.IsRegistered),
                                    ledgerTransactionIDHash:
                                      enriched.ledgertransactionIDHash ?? enriched.ledgerTransactionIDHash ?? enriched.LedgerTransactionIDHash,
                                  }).catch(() => toast.error("Failed to print receipt."))
                                }
                              />
                            );
                          })}
                          {/* ── Add more button on occupied slot ──── */}
                          {!isPastDate && !isSlotInPast(ownSlot) && !down && !duringLunch && (
                            <div
                              onClick={() => openBook(machine, ownSlot)}
                              title="Book another appointment for this slot"
                              style={{
                                display: "flex", alignItems: "center", justifyContent: "center",
                                marginTop: "2px", height: "18px", cursor: "pointer",
                                borderRadius: "4px", fontSize: "10.5px", fontWeight: 600,
                                color: "#64748b", background: "transparent",
                                border: "1px dashed #cbd5e1",
                              }}
                            >
                              + Add
                            </div>
                          )}
                        </>
                      ) : down ? (
                        /* ── Machine down for just this slot's window ─
                           same size/shape as the "Blocked" pill above,
                           its own rose accent + dashed border so it
                           reads as "temporarily down" rather than
                           administratively blocked ─────────────────── */
                        <div
                          title={`Breakdown${machine.BreakdownReason ? ` — ${machine.BreakdownReason}` : ""}`}
                          className="d-flex flex-column align-items-center justify-content-center gap-1"
                          style={{
                            height: "28px", borderRadius: "6px", fontSize: "11px",
                            fontWeight: 600, color: "#b91c1c",
                            background: "#fef2f2",
                            border: "1px dashed #fecaca",
                            cursor: "not-allowed",
                          }}
                        >
                          <span className="d-flex align-items-center gap-1"><FaTools size={9} /> Down</span>
                          <span style={{ fontSize: "9px", fontWeight: 500, color: "#c2867f" }}>{ownSlot}</span>
                        </div>
                      ) : duringLunch ? (
                        /* ── Lunch break for just this slot's window ─
                           same size/shape as "Down"/"Blocked", its own
                           amber accent so it reads as "recurring daily
                           break" rather than an equipment problem ────── */
                        <div
                          title={`Lunch break ${machine.LunchStartTime}–${machine.LunchEndTime}`}
                          className="d-flex flex-column align-items-center justify-content-center gap-1"
                          style={{
                            height: "28px", borderRadius: "6px", fontSize: "11px",
                            fontWeight: 600, color: "#92400e",
                            background: "#fef9e7",
                            border: "1px dashed #fcd34d",
                            cursor: "not-allowed",
                          }}
                        >
                          <span className="d-flex align-items-center gap-1">🍽️ Lunch</span>
                          <span style={{ fontSize: "9px", fontWeight: 500, color: "#b45309" }}>{ownSlot}</span>
                        </div>
                      ) : (
                        /* ── Empty slot ────────────────────────────── */
                        <EmptySlot
                          time={ownSlot}
                          onClick={(isPastDate || isSlotInPast(ownSlot)) ? undefined : () => openBook(machine, ownSlot)}
                          disabled={isPastDate || isSlotInPast(ownSlot)}
                        />
                      )}
                    </div>
                  );
                });
              })}
            </div>
          </div>
        ) : noTimeSlots ? (
          /* ── Machines found but no time slots configured ──────────────────── */
          <div
            className="text-center py-5"
            style={{
              background: "#fff",
              border: "1px solid #e5e7eb",
              borderRadius: "10px",
              color: "#334155",
            }}
          >
            <FaExclamationTriangle size={26} style={{ color: "#ef4444", marginBottom: "10px" }} />
            <div style={{ fontSize: "14px", fontWeight: "600", marginBottom: "4px" }}>
              No time slots available for this centre
            </div>
            <div style={{ fontSize: "12px", color: "#64748b" }}>
              Machines are configured but no time slots were returned by the server.
              Please contact your backend team to configure time slots for this centre.
            </div>
          </div>
        ) : noMachines ? (
          /* ── No machines configured for this centre ───────────────────── */
          <div
            className="text-center py-5"
            style={{
              background: "#fff",
              border: "1px solid #e5e7eb",
              borderRadius: "10px",
              color: "#334155",
            }}
          >
            <FaCog size={26} style={{ color: "#f59e0b", marginBottom: "10px" }} />
            <div style={{ fontSize: "14px", fontWeight: "600", marginBottom: "4px" }}>
              No machines configured for this centre
            </div>
            <div style={{ fontSize: "12px", color: "#64748b" }}>
              Please map departments and machines in{" "}
              <strong>Centre Department Master</strong>, or ask your backend team
              to fix <code>GetMacRadiologyAppointment</code> to return machines
              for this centre.
            </div>
          </div>
        ) : (
          /* ── Initial state — no search done yet ───────────────────────── */
          <div className="text-center py-5" style={{ color: "#94a3b8" }}>
            <FaCalendarAlt size={30} style={{ marginBottom: "10px" }} />
            <div style={{ fontSize: "13px" }}>
              Select a date &amp; centre, then click <strong>Search Data</strong> to view appointments.
            </div>
          </div>
        )}
      </Accordion>

      <BookSlotModal
        visible={bookModal.visible}
        slotInfo={bookModal.slotInfo}
        onClose={() => setBookModal({ visible: false, slotInfo: null })}
        onSuccess={onSuccess}
      />
      <RescheduleModal
        visible={rescheduleModal.visible}
        appointment={rescheduleModal.appointment}
        onClose={() => setRescheduleModal({ visible: false, appointment: null })}
        onSuccess={onSuccess}
      />
      <CancelModal
        visible={cancelModal.visible}
        appointment={cancelModal.appointment}
        onClose={() => setCancelModal({ visible: false, appointment: null })}
        onSuccess={onSuccess}
      />
    </>
  );
};

// ── Theme primary colours (used for grid header bg) ──────────────────────────
const THEME_HDR = {
  sky_blue_theme:              { bg: "#03a0e7", text: "#fff" },
  default_theme:               { bg: "#1aab8b", text: "#fff" },
  peach_theme:                 { bg: "#b17300", text: "#fff" },
  pale_pink_theme:             { bg: "#bc3c8b", text: "#fff" },
  red_theme:                   { bg: "#8b2424", text: "#fff" },
  light_blue_theme:            { bg: "#4a7fd4", text: "#fff" },
  pink_theme:                  { bg: "#c2185b", text: "#fff" },
  purple_theme:                { bg: "#7b1fa2", text: "#fff" },
  gray_theme:                  { bg: "#455a64", text: "#fff" },
  pastel_pink_theme:           { bg: "#d47faa", text: "#fff" },
  light_peach_theme:           { bg: "#c88040", text: "#fff" },
  pale_peach_theme:            { bg: "#c8865a", text: "#fff" },
  pale_yellow_theme:           { bg: "#b8950a", text: "#fff" },
  pale_green_theme:            { bg: "#4caf50", text: "#fff" },
  light_celadon_theme:         { bg: "#4aaa88", text: "#fff" },
  pale_mint_theme:             { bg: "#3aab80", text: "#fff" },
  pale_aqua_theme:             { bg: "#2aa8b0", text: "#fff" },
  pale_lavender_blue_theme:    { bg: "#5c7cd4", text: "#fff" },
  pale_gray_theme:             { bg: "#607d8b", text: "#fff" },
  pale_mauve_theme:            { bg: "#8d6e9e", text: "#fff" },
  lavender_blush_theme:        { bg: "#a06090", text: "#fff" },
  pale_rose_theme:             { bg: "#c06070", text: "#fff" },
  lite_pale_theme:             { bg: "#c07080", text: "#fff" },
  blush_pink_theme:            { bg: "#d05070", text: "#fff" },
  light_pink_theme:            { bg: "#c06080", text: "#fff" },
};
const getHdr = (theme) => THEME_HDR[theme] || { bg: "#2d5a8e", text: "#fff" };

// ── Grid styles ───────────────────────────────────────────────────────────────
const makeThTimeStyle = (hdr) => ({
  width: "56px",
  minWidth: "56px",
  background: hdr.bg,
  color: hdr.text,
  padding: "9px 4px",
  textAlign: "center",
  position: "sticky",
  top: 0,
  left: 0,
  zIndex: 30,
  fontSize: "11px",
  fontWeight: "600",
  borderBottom: "1px solid rgba(0,0,0,0.08)",
});

const makeThMachineStyle = (hdr, isHovered) => ({
  background: isHovered ? "#1d4ed8" : hdr.bg,
  color: isHovered ? "#fff" : hdr.text,
  padding: "9px 8px",
  textAlign: "center",
  position: "sticky",
  top: 0,
  zIndex: 20,
  minWidth: "130px",
  fontSize: "12px",
  fontWeight: "600",
  whiteSpace: "nowrap",
  borderBottom: isHovered ? "2px solid #1e3a8a" : "1px solid rgba(0,0,0,0.08)",
  boxShadow: isHovered ? "inset 3px 0 0 #1e3a8a, inset -3px 0 0 #1e3a8a" : "none",
  transition: "background 0.1s",
});

const makeTdTimeStyle = (hdr, ri) => ({
  padding: "4px 4px",
  textAlign: "center",
  fontWeight: "600",
  fontSize: "11px",
  color: "#475569",
  background: ri % 2 === 0 ? "#f8fafc" : "#f1f5f9",
  position: "sticky",
  left: 0,
  zIndex: 10,
  borderRight: "1px solid #e5e7eb",
  borderBottom: "1px solid #f1f5f9",
  whiteSpace: "nowrap",
  minWidth: "56px",
  width: "56px",
});

// ── Empty slot placeholder ────────────────────────────────────────────────────
const EmptySlot = ({ onClick, disabled, time }) => {
  const [hover, setHover] = React.useState(false);
  return (
    <div
      onClick={disabled ? undefined : onClick}
      onMouseEnter={() => !disabled && setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        minHeight: "30px",
        borderRadius: "6px",
        border: hover ? "1px dashed #3b82f6" : "1px dashed transparent",
        background: hover ? "#eff6ff" : "transparent",
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.4 : 1,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "1px",
        transition: "all 0.15s",
      }}
      title={disabled ? undefined : "Click to book this slot"}
    >
      {time && (
        <span style={{ fontSize: "9.5px", color: hover ? "#2563eb" : "#cbd5e1", fontWeight: 500 }}>
          {time}
        </span>
      )}
      {hover && !disabled && (
        <span style={{ fontSize: "10.5px", color: "#2563eb", fontWeight: "600" }}>
          + Book
        </span>
      )}
    </div>
  );
};

// ── Appointment card ──────────────────────────────────────────────────────────
const AppCard = ({ appt, time, onReschedule, onCancel, onPrint }) => {
  const [hover, setHover] = React.useState(false);
  const s = getStyle(appt.Status);
  const isRegistered = !!(appt.isRegistered ?? appt.IsRegistered);
  const flow = getPatientFlowInfo(appt);
  const isSlotFailed = (appt.slotStatus ?? appt.SlotStatus) === "SlotFailure";

  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        position: "relative",
        background: hexToRgba(s.accent, 0.1),
        color: "#1e293b",
        borderLeft: `3px solid ${s.accent}`,
        // registered appointments get an emerald ring on top of the normal
        // status colouring, so the two signals stay independent of each other
        boxShadow: isRegistered
          ? `inset 0 0 0 1px ${REGISTERED_COLOR}${hover ? ", 0 2px 6px rgba(15,23,42,0.1)" : ""}`
          : (hover ? "0 2px 6px rgba(15,23,42,0.1)" : "none"),
        borderRadius: "5px",
        padding: "4px 6px",
        marginBottom: "3px",
        cursor: "default",
        transition: "box-shadow 0.15s",
        opacity: s.muted ? 0.7 : 1,
      }}
    >
      {isRegistered && (
        <span
          title={appt.registrationNo ? `Registered — ${appt.registrationNo}` : "Registered"}
          style={{
            position: "absolute", top: "-5px", right: "-5px",
            width: "14px", height: "14px", borderRadius: "50%",
            background: REGISTERED_COLOR, color: "#fff",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "9px", fontWeight: 700, boxShadow: "0 0 0 1.5px #fff",
          }}
        >
          ✓
        </span>
      )}
      <div
        style={{
          fontWeight: "600",
          fontSize: "11px",
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
          maxWidth: "112px",
          textDecoration: s.muted ? "line-through" : "none",
        }}
        title={appt.PatientName}
      >
        {appt.PatientName}
      </div>

      {time && (
        <div style={{ fontSize: "9.5px", color: "#94a3b8", fontWeight: 600, marginTop: "1px" }}>
          {time}
        </div>
      )}

      {appt.TestName && (
        <div
          style={{
            fontSize: "10px",
            color: "#64748b",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
            maxWidth: "112px",
          }}
          title={appt.TestName}
        >
          {appt.TestName}
        </div>
      )}

      {isSlotFailed && (
        <span
          title="Slot failed — patient did not attend"
          style={{
            display: "inline-flex", alignItems: "center", gap: "3px",
            marginTop: "3px", marginRight: "3px", padding: "1px 6px", borderRadius: "999px",
            fontSize: "9px", fontWeight: 700,
            color: "#991b1b", background: "#fee2e2",
          }}
        >
          <FaExclamationTriangle size={7} /> Slot Failed
        </span>
      )}

      {flow && (
        <span
          title={flow.time ? `${flow.label === "Out" ? "Left" : "Arrived"} at ${moment(flow.time).format("hh:mm A")}` : flow.label}
          style={{
            display: "inline-flex", alignItems: "center", gap: "3px",
            marginTop: "3px", padding: "1px 6px", borderRadius: "999px",
            fontSize: "9px", fontWeight: 700,
            color: flow.color, background: flow.bg,
          }}
        >
          <flow.icon size={7} /> {flow.label}
        </span>
      )}

      {hover && appt.Status !== "cancelled" && (
        <div
          className="d-flex gap-1 mt-1"
          onClick={(e) => e.stopPropagation()}
        >
          {onReschedule && <CardBtn title="Reschedule" color="#2563eb" onClick={onReschedule} icon={<FaRedo size={9} />} />}
          {onCancel     && <CardBtn title="Cancel"     color="#dc2626" onClick={onCancel}     icon={<FaTimes size={9} />} />}
          <CardBtn title="Print" color="#0f766e" onClick={onPrint} icon={<FaPrint size={9} />} />
        </div>
      )}
    </div>
  );
};

// ── Merged multi-slot appointment box — spans several time-slot rows via
// rowSpan when consecutive slots share the same registration/bookingId
// (see getMergeKey above) ─────────────────────────────────────────────────
const MergedAppCard = ({ group, startSlot, endSlot, isPastDate, onCancel, onPrint, onAdd }) => {
  const [hover, setHover] = React.useState(false);
  const first = group[0];
  const status = first.status ?? first.Status;
  const s = getStyle(status);
  const name = first.patientName ?? first.PatientName;
  // Distinct test names across the group, in order — usually just one name
  // repeated (a single test truly spanning multiple consecutive slots), but
  // for a multi-test registration booking this lists every test, one below
  // another, instead of only the first slot's test.
  const testNames = [
    ...new Set(
      group
        .map((a) => a.testName ?? a.TestName)
        .filter((t) => typeof t === "string" && t.trim() !== ""),
    ),
  ];
  const isSingleTestMultiSlot = testNames.length <= 1;
  // registration is created once per booking, covering the whole group, so
  // every slot in the merged block shares the same registered state
  const isRegistered = !!(first.isRegistered ?? first.IsRegistered);
  const flow = getPatientFlowInfo(first);
  const isSlotFailed = (first.slotStatus ?? first.SlotStatus) === "SlotFailure";

  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        background: hexToRgba(s.accent, 0.12),
        color: "#1e293b",
        borderLeft: `3px solid ${s.accent}`,
        boxShadow: isRegistered
          ? `inset 0 0 0 1px ${REGISTERED_COLOR}${hover ? ", 0 2px 6px rgba(15,23,42,0.12)" : ""}`
          : (hover ? "0 2px 6px rgba(15,23,42,0.12)" : "none"),
        borderRadius: "5px",
        padding: "6px 6px",
        position: "absolute",
        inset: "3px 4px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        cursor: "default",
        transition: "box-shadow 0.15s",
        opacity: s.muted ? 0.7 : 1,
      }}
    >
      {isRegistered && (
        <span
          title={first.registrationNo ? `Registered — ${first.registrationNo}` : "Registered"}
          style={{
            position: "absolute", top: "2px", right: "2px",
            width: "14px", height: "14px", borderRadius: "50%",
            background: REGISTERED_COLOR, color: "#fff",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "9px", fontWeight: 700, boxShadow: "0 0 0 1.5px #fff",
          }}
        >
          ✓
        </span>
      )}
      <div
        style={{
          fontWeight: "700",
          fontSize: "11px",
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
          maxWidth: "112px",
          textDecoration: s.muted ? "line-through" : "none",
        }}
        title={name}
      >
        {name}
      </div>

      {startSlot && (
        <div style={{ fontSize: "9.5px", color: "#94a3b8", fontWeight: 600, marginTop: "1px" }}>
          {endSlot ? `${startSlot} – ${endSlot}` : startSlot}
        </div>
      )}

      {testNames.map((t, i) => (
        <div
          key={i}
          style={{
            fontSize: "10px",
            color: "#64748b",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
            maxWidth: "112px",
          }}
          title={t}
        >
          {t}
        </div>
      ))}

      <div style={{ fontSize: "9.5px", color: "#0f766e", fontWeight: 700, marginTop: 2 }}>
        {isSingleTestMultiSlot
          ? `${group.length} consecutive slots`
          : `${testNames.length} tests`}
      </div>

      {isSlotFailed && (
        <span
          title="Slot failed — patient did not attend"
          style={{
            display: "inline-flex", alignItems: "center", gap: "3px",
            marginTop: "3px", padding: "1px 6px", borderRadius: "999px",
            fontSize: "9px", fontWeight: 700,
            color: "#991b1b", background: "#fee2e2",
            alignSelf: "flex-start",
          }}
        >
          <FaExclamationTriangle size={7} /> Slot Failed
        </span>
      )}

      {flow && (
        <span
          title={flow.time ? `${flow.label === "Out" ? "Left" : "Arrived"} at ${moment(flow.time).format("hh:mm A")}` : flow.label}
          style={{
            display: "inline-flex", alignItems: "center", gap: "3px",
            marginTop: "3px", padding: "1px 6px", borderRadius: "999px",
            fontSize: "9px", fontWeight: 700,
            color: flow.color, background: flow.bg,
            alignSelf: "flex-start",
          }}
        >
          <flow.icon size={7} /> {flow.label}
        </span>
      )}

      {hover && !s.muted && (
        <div className="d-flex gap-1 mt-1" onClick={(e) => e.stopPropagation()}>
          {!isPastDate && (
            <CardBtn title="Book another appointment for this slot" color="#2563eb" onClick={onAdd} icon={<FaPlus size={9} />} />
          )}
          {!isPastDate && (
            <CardBtn title="Cancel all slots" color="#dc2626" onClick={onCancel} icon={<FaTimes size={9} />} />
          )}
          <CardBtn title="Print" color="#0f766e" onClick={onPrint} icon={<FaPrint size={9} />} />
        </div>
      )}
    </div>
  );
};

const CardBtn = ({ title, color, onClick, icon }) => (
  <button
    title={title}
    onClick={onClick}
    className="d-flex align-items-center justify-content-center"
    style={{
      width: "18px",
      height: "18px",
      padding: 0,
      background: "#fff",
      color: color,
      border: `1px solid ${color}`,
      borderRadius: "4px",
      cursor: "pointer",
    }}
  >
    {icon}
  </button>
);

export default RadiologyAppointment;
