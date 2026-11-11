import React, { useEffect, useMemo, useState } from "react";
import moment from "moment";
import { toast } from "react-toastify";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from "recharts";
import ReactSelect from "../../components/formComponent/ReactSelect";
import DatePicker from "../../components/formComponent/DatePicker";
import Loading from "../../components/loader/Loading";
import { bindCentresForRadiology, getMacRadiologyAppointment } from "./api";

// Validated categorical palette (dataviz skill, references/palette.md) —
// blue vs red passes every check clean (CVD ΔE 21.6, normal-vision ΔE 32.3,
// contrast all ≥3:1 — see backend-docs validation run). "Empty" is a light
// cool slate (not a hue) so it recedes — nothing to report there — but reads
// cleaner than a flat khaki-grey. "Breakdown" uses the reserved
// status/critical red since that segment IS a status, not an arbitrary
// category. VIP gets its own magenta — only ever shown alone in its own
// table, never adjacent to red, so no pairwise conflict.
const C_BOOKED       = "#2a78d6"; // categorical slot 1 (blue)
const C_EMPTY        = "#e2e8f0"; // light slate — recessive, still crisp
const C_EMPTY_STROKE = "#cbd5e1";
const C_BREAKDOWN    = "#e34948"; // status/critical
const C_VIP          = "#e87ba4"; // categorical slot 5 (magenta)

const isMachineDownAtSlot = (machine, slot) => {
  if (machine.BreakdownPeriods?.length > 0) {
    return machine.BreakdownPeriods.some((p) => {
      if (!p.StartTime) return false;
      if (slot < p.StartTime) return false;
      if (p.EndTime && slot >= p.EndTime) return false;
      return true;
    });
  }
  return !!machine.IsBreakdown;
};

const StatTile = ({ label, value, color, sub }) => (
  <div
    style={{
      flex: 1, minWidth: "120px", background: "#fff", borderRadius: "10px",
      padding: "10px 12px", boxShadow: "0 1px 8px rgba(0,0,0,0.06)",
      borderTop: `3px solid ${color}`,
    }}
  >
    <div style={{ fontSize: "9.5px", fontWeight: 700, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.6px" }}>
      {label}
    </div>
    <div style={{ fontSize: "22px", fontWeight: 800, color: "#1e293b", lineHeight: 1.3 }}>
      {value}
    </div>
    {sub && <div style={{ fontSize: "10px", color: "#94a3b8" }}>{sub}</div>}
  </div>
);

const ChartCard = ({ title, children, height = 240 }) => (
  <div style={{ flex: 1, minWidth: "320px", background: "#fff", borderRadius: "10px", padding: "12px 14px", boxShadow: "0 1px 8px rgba(0,0,0,0.06)" }}>
    <div style={{ fontSize: "12.5px", fontWeight: 700, color: "#334155", marginBottom: "8px" }}>{title}</div>
    <ResponsiveContainer width="100%" height={height}>
      {children}
    </ResponsiveContainer>
  </div>
);

const SlotBifurcation = () => {
  const [centres, setCentres] = useState([]);
  const [filter, setFilter] = useState({ CentreId: "", Date: new Date() });
  const [loading, setLoading] = useState(false);
  const [gridData, setGridData] = useState({ machines: [], timeSlots: [], appointments: {}, blocked: {} });
  const [loaded, setLoaded] = useState(false);

  useEffect(() => { loadCentres(); }, []);

  // Auto-load — on first mount (once a default centre is picked), and again
  // whenever the centre or date changes. No manual Search click needed.
  useEffect(() => {
    if (filter.CentreId) handleSearch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter.CentreId, filter.Date]);

  const loadCentres = async () => {
    try {
      const res = await bindCentresForRadiology();
      const data = (res?.data?.message || []).map((c) => ({
        value: c.CentreId ?? c.CentreID,
        label: c.Centre ?? c.CentreName,
      }));
      setCentres(data);
      if (data.length > 0) setFilter((p) => ({ ...p, CentreId: data[0].value }));
    } catch {
      toast.error("Failed to load centres.");
    }
  };

  const handleSearch = async () => {
    if (!filter.CentreId) return;
    setLoading(true);
    setLoaded(false);
    try {
      const res = await getMacRadiologyAppointment({
        date: moment(filter.Date).format("DD/MMM/YYYY"),
        centreId: filter.CentreId,
      });
      const data = res?.data?.message;
      const machines = (data?.machines || [])
        .filter((m) => (m.IsActive ?? m.isActive) == null || (m.IsActive ?? m.isActive) === 1 || (m.IsActive ?? m.isActive) === true)
        .map((m) => ({
          MachineId:      m.machineId ?? m.MachineKey ?? m.GlobalMachineID ?? m.MachineId,
          MachineName:    m.machineName ?? m.GlobalMachineName ?? m.MachineName ?? m.MachineID,
          DepartmentName: m.departmentName ?? m.DepartmentName ?? m.Department ?? "Unknown",
          IsBreakdown:    m.isBreakdown ?? m.IsBreakdown ?? false,
          BreakdownPeriods: (m.breakdownPeriods ?? m.BreakdownPeriods ?? []).map((p) => ({
            StartTime: p.startTime ?? p.StartTime ?? null,
            EndTime:   p.endTime ?? p.EndTime ?? null,
          })),
        }));
      setGridData({
        machines,
        timeSlots:    data?.timeSlots || [],
        appointments: data?.appointments || {},
        blocked:      data?.blocked || {},
      });
      setLoaded(true);
    } catch {
      toast.error("Failed to load slot data.");
      setGridData({ machines: [], timeSlots: [], appointments: {}, blocked: {} });
    } finally {
      setLoading(false);
    }
  };

  // ── all bifurcation numbers derived client-side from the same grid data
  // RadiologyAppointment.jsx already uses — see backend-radiology-slot-bifurcation.md
  // for what a dedicated aggregation endpoint would additionally unlock ──────
  const stats = useMemo(() => {
    const { machines, timeSlots, appointments, blocked } = gridData;
    let bookedSlots = 0, emptySlots = 0, breakdownSlots = 0, blockedSlots = 0;
    let unattended = 0, registered = 0, vipBooked = 0, totalAppts = 0;
    const perMachine = [];
    const perDept = {};
    const perSlot = {};
    timeSlots.forEach((s) => { perSlot[s] = 0; });

    machines.forEach((m) => {
      let mBooked = 0, mEmpty = 0, mBreakdown = 0;
      timeSlots.forEach((slot) => {
        const key = `${m.MachineId}_${slot}`;
        const appts = appointments[key] || [];
        const down = isMachineDownAtSlot(m, slot);
        const isBlockedCell = (blocked[String(m.MachineId)] || []).includes(slot);

        if (down) { breakdownSlots += 1; mBreakdown += 1; return; }
        if (isBlockedCell) { blockedSlots += 1; return; }
        if (appts.length > 0) {
          bookedSlots += 1; mBooked += 1; perSlot[slot] += 1;
          appts.forEach((a) => {
            totalAppts += 1;
            const status = (a.status ?? a.Status ?? "").toLowerCase();
            const isConfirmed = status.startsWith("confirm_");
            const isCancelled = status === "cancelled" || status === "appointment_cancel";
            if (!isConfirmed && !isCancelled) unattended += 1;
            if (a.isRegistered ?? a.IsRegistered) registered += 1;

            const dept = m.DepartmentName || "Unknown";
            perDept[dept] = perDept[dept] || { department: dept, total: 0, vip: 0 };
            perDept[dept].total += 1;
            if (status.includes("vip")) { perDept[dept].vip += 1; vipBooked += 1; }
          });
        } else {
          emptySlots += 1; mEmpty += 1;
        }
      });
      perMachine.push({
        name: m.MachineName, dept: m.DepartmentName,
        Booked: mBooked, Empty: mEmpty, Breakdown: mBreakdown,
        total: mBooked + mEmpty + mBreakdown,
      });
    });

    const totalSlots = machines.length * timeSlots.length;
    return {
      totalSlots, bookedSlots, emptySlots, breakdownSlots, blockedSlots,
      unattended, registered, vipBooked, totalAppts,
      perMachine,
      perDept: Object.values(perDept).sort((a, b) => b.total - a.total),
      perSlot: timeSlots.map((s) => ({ slot: s, Booked: perSlot[s] })),
    };
  }, [gridData]);

  const hasData = loaded && gridData.machines.length > 0;

  return (
    <div className="card patient_registration_card open" style={{ padding: "14px" }}>
      <div className="card-header mb-2" style={{ padding: 0, border: "none" }}>
        <h4 className="card-title w-100 mb-0">
          <label className="text-nowrap m-0">Radiology Slot Bifurcation</label>
        </h4>
      </div>

      {/* Filters */}
      <div className="row g-2 mb-3 align-items-end">
        <div className="col-md-3">
          <ReactSelect
            id="SB_Centre" name="CentreId" placeholderName="Centre *"
            dynamicOptions={centres} value={filter.CentreId} removeIsClearable
            onChange={(name, option) => setFilter((p) => ({ ...p, CentreId: option?.value || "" }))}
          />
        </div>
        <div className="col-md-2">
          <DatePicker
            name="Date" id="SB_Date" lable="Date"
            value={filter.Date}
            onChange={(v) => setFilter((p) => ({ ...p, Date: v }))}
          />
        </div>
      </div>

      {loading ? (
        <Loading />
      ) : !hasData ? (
        <div className="text-center text-muted py-5" style={{ fontSize: "13px" }}>
          {loaded ? "No machines/slots found for this centre and date." : "Select a centre and date to view the bifurcation."}
        </div>
      ) : (
        <>
          {/* Stat tiles */}
          <div className="d-flex gap-2 flex-wrap mb-3">
            <StatTile label="Total Slots" value={stats.totalSlots} color="#64748b" sub={`${gridData.machines.length} machines`} />
            <StatTile label="Booked" value={stats.bookedSlots} color={C_BOOKED} sub={`${stats.totalSlots ? ((stats.bookedSlots / stats.totalSlots) * 100).toFixed(0) : 0}% of total`} />
            <StatTile label="Empty" value={stats.emptySlots} color={C_EMPTY_STROKE} sub={`${stats.totalSlots ? ((stats.emptySlots / stats.totalSlots) * 100).toFixed(0) : 0}% of total`} />
            <StatTile label="Breakdown" value={stats.breakdownSlots} color={C_BREAKDOWN} sub="machine down" />
            <StatTile label="Unattended" value={stats.unattended} color="#d97706" sub="not confirmed yet" />
            <StatTile label="Registered" value={stats.registered} color="#059669" sub={`of ${stats.totalAppts} booked`} />
          </div>

          {/* Charts */}
          <div className="d-flex gap-3 flex-wrap mb-3">
            <ChartCard title="Machine-wise: Booked / Empty / Breakdown">
              <BarChart data={stats.perMachine} margin={{ top: 4, right: 8, left: -20, bottom: 4 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e1e0d9" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: "#898781" }} />
                <YAxis tick={{ fontSize: 10, fill: "#898781" }} allowDecimals={false} />
                <Tooltip contentStyle={{ fontSize: "11px", borderRadius: "6px" }} />
                <Legend wrapperStyle={{ fontSize: "11px" }} />
                <Bar dataKey="Booked" stackId="a" fill={C_BOOKED} radius={[0, 0, 0, 0]} />
                <Bar dataKey="Empty" stackId="a" fill={C_EMPTY} stroke={C_EMPTY_STROKE} strokeWidth={1} radius={[0, 0, 0, 0]} />
                <Bar dataKey="Breakdown" stackId="a" fill={C_BREAKDOWN} radius={[3, 3, 0, 0]} />
              </BarChart>
            </ChartCard>

            <ChartCard title="Timing-wise: Bookings per Slot">
              <BarChart data={stats.perSlot} margin={{ top: 4, right: 8, left: -20, bottom: 4 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e1e0d9" vertical={false} />
                <XAxis dataKey="slot" tick={{ fontSize: 9, fill: "#898781" }} interval={Math.ceil(stats.perSlot.length / 12)} />
                <YAxis tick={{ fontSize: 10, fill: "#898781" }} allowDecimals={false} />
                <Tooltip contentStyle={{ fontSize: "11px", borderRadius: "6px" }} />
                <Bar dataKey="Booked" fill={C_BOOKED} radius={[3, 3, 0, 0]} />
              </BarChart>
            </ChartCard>
          </div>

          {/* Department-wise VIP table */}
          <div style={{ background: "#fff", borderRadius: "10px", padding: "12px 14px", boxShadow: "0 1px 8px rgba(0,0,0,0.06)", marginBottom: "12px" }}>
            <div style={{ fontSize: "12.5px", fontWeight: 700, color: "#334155", marginBottom: "8px" }}>
              Department-wise VIP Booked Slots
            </div>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "12px" }}>
              <thead>
                <tr style={{ textAlign: "left", color: "#64748b", fontSize: "10.5px", textTransform: "uppercase" }}>
                  <th style={{ padding: "4px 8px" }}>Department</th>
                  <th style={{ padding: "4px 8px" }}>Total Booked</th>
                  <th style={{ padding: "4px 8px" }}>VIP Booked</th>
                  <th style={{ padding: "4px 8px", width: "40%" }}>VIP Share</th>
                </tr>
              </thead>
              <tbody>
                {stats.perDept.length === 0 ? (
                  <tr><td colSpan={4} className="text-center text-muted py-2">No bookings for this date.</td></tr>
                ) : (
                  stats.perDept.map((d) => {
                    const pct = d.total ? Math.round((d.vip / d.total) * 100) : 0;
                    return (
                      <tr key={d.department} style={{ borderTop: "1px solid #f1f5f9" }}>
                        <td style={{ padding: "6px 8px", fontWeight: 600 }}>{d.department}</td>
                        <td style={{ padding: "6px 8px" }}>{d.total}</td>
                        <td style={{ padding: "6px 8px", color: C_VIP, fontWeight: 700 }}>{d.vip}</td>
                        <td style={{ padding: "6px 8px" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                            <div style={{ flex: 1, height: "6px", background: "#f1f5f9", borderRadius: "3px", overflow: "hidden" }}>
                              <div style={{ width: `${pct}%`, height: "100%", background: C_VIP, borderRadius: "3px" }} />
                            </div>
                            <span style={{ fontSize: "10.5px", color: "#94a3b8", minWidth: "28px" }}>{pct}%</span>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Machine detail table */}
          <div style={{ background: "#fff", borderRadius: "10px", padding: "12px 14px", boxShadow: "0 1px 8px rgba(0,0,0,0.06)" }}>
            <div style={{ fontSize: "12.5px", fontWeight: 700, color: "#334155", marginBottom: "8px" }}>
              Machine-wise Detail
            </div>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "12px" }}>
              <thead>
                <tr style={{ textAlign: "left", color: "#64748b", fontSize: "10.5px", textTransform: "uppercase" }}>
                  <th style={{ padding: "4px 8px" }}>Machine</th>
                  <th style={{ padding: "4px 8px" }}>Department</th>
                  <th style={{ padding: "4px 8px" }}>Booked</th>
                  <th style={{ padding: "4px 8px" }}>Empty</th>
                  <th style={{ padding: "4px 8px" }}>Breakdown</th>
                  <th style={{ padding: "4px 8px" }}>Utilization</th>
                </tr>
              </thead>
              <tbody>
                {stats.perMachine.map((m) => {
                  const util = m.total ? Math.round((m.Booked / m.total) * 100) : 0;
                  return (
                    <tr key={m.name} style={{ borderTop: "1px solid #f1f5f9" }}>
                      <td style={{ padding: "6px 8px", fontWeight: 600 }}>{m.name}</td>
                      <td style={{ padding: "6px 8px", color: "#64748b" }}>{m.dept}</td>
                      <td style={{ padding: "6px 8px", color: C_BOOKED, fontWeight: 700 }}>{m.Booked}</td>
                      <td style={{ padding: "6px 8px" }}>{m.Empty}</td>
                      <td style={{ padding: "6px 8px", color: m.Breakdown > 0 ? C_BREAKDOWN : "#cbd5e1", fontWeight: m.Breakdown > 0 ? 700 : 400 }}>
                        {m.Breakdown}
                      </td>
                      <td style={{ padding: "6px 8px" }}>{util}%</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
};

export default SlotBifurcation;
