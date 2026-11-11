import React, { useEffect, useMemo, useState } from "react";
import moment from "moment";
import { toast } from "react-toastify";
import {
  BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import { FaCheckCircle, FaTimesCircle, FaHourglassHalf, FaUserSlash, FaWalking } from "react-icons/fa";
import ReactSelect from "../../components/formComponent/ReactSelect";
import DatePicker from "../../components/formComponent/DatePicker";
import Loading from "../../components/loader/Loading";
import { getAccessCentres, getRateTypesForCentres } from "./api";
import {
  STAGE_OPTIONS, OUTCOME, OUTCOME_META, classifyFailReason,
  fetchCoordinatorPrepData,
} from "./coordinatorPrep";

// ── Local presentational pieces — same shape as SlotBifurcation.jsx's
// StatTile/ChartCard, kept page-local rather than shared, matching how that
// page already does it ─────────────────────────────────────────────────────
const StatTile = ({ label, value, color, sub, icon }) => (
  <div
    style={{
      flex: 1, minWidth: "130px", background: "#fff", borderRadius: "10px",
      padding: "10px 12px", boxShadow: "0 1px 8px rgba(0,0,0,0.06)",
      borderTop: `3px solid ${color}`,
    }}
  >
    <div style={{ display: "flex", alignItems: "center", gap: "5px", fontSize: "9.5px", fontWeight: 700, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.6px" }}>
      {icon}{label}
    </div>
    <div style={{ fontSize: "22px", fontWeight: 800, color: "#1e293b", lineHeight: 1.3 }}>
      {value}
    </div>
    {sub && <div style={{ fontSize: "10px", color: "#94a3b8" }}>{sub}</div>}
  </div>
);

const ChartCard = ({ title, children, height = 220 }) => (
  <div style={{ flex: 1, minWidth: "320px", background: "#fff", borderRadius: "10px", padding: "12px 14px", boxShadow: "0 1px 8px rgba(0,0,0,0.06)" }}>
    <div style={{ fontSize: "12.5px", fontWeight: 700, color: "#334155", marginBottom: "8px" }}>{title}</div>
    <ResponsiveContainer width="100%" height={height}>
      {children}
    </ResponsiveContainer>
  </div>
);

// Three-segment proportion bar for Passed/Failed/Pending — status colour
// never carries meaning alone, so every segment is paired with an icon +
// label + count in the legend row underneath.
const OutcomeBar = ({ passed, failed, pending }) => {
  const total = passed + failed + pending || 1;
  const seg = (n) => `${(n / total) * 100}%`;
  return (
    <div>
      <div style={{ display: "flex", height: "14px", borderRadius: "7px", overflow: "hidden", background: "#f1f5f9" }}>
        {passed > 0 && <div style={{ width: seg(passed), background: OUTCOME_META.passed.color }} title={`Passed: ${passed}`} />}
        {failed > 0 && <div style={{ width: seg(failed), background: OUTCOME_META.failed.color, marginLeft: passed > 0 ? "2px" : 0 }} title={`Failed: ${failed}`} />}
        {pending > 0 && <div style={{ width: seg(pending), background: OUTCOME_META.pending.color, marginLeft: (passed + failed) > 0 ? "2px" : 0 }} title={`Pending: ${pending}`} />}
      </div>
      <div className="d-flex gap-3 flex-wrap mt-2">
        <span style={{ fontSize: "11px", color: "#334155", display: "flex", alignItems: "center", gap: "4px" }}>
          <FaCheckCircle color={OUTCOME_META.passed.color} size={11} /> Passed <strong>{passed}</strong>
        </span>
        <span style={{ fontSize: "11px", color: "#334155", display: "flex", alignItems: "center", gap: "4px" }}>
          <FaTimesCircle color={OUTCOME_META.failed.color} size={11} /> Failed <strong>{failed}</strong>
        </span>
        <span style={{ fontSize: "11px", color: "#334155", display: "flex", alignItems: "center", gap: "4px" }}>
          <FaHourglassHalf color={OUTCOME_META.pending.color} size={11} /> Pending <strong>{pending}</strong>
        </span>
      </div>
    </div>
  );
};

const CoordinatorDashboard = () => {
  const [centres, setCentres] = useState([]);
  const [rateTypes, setRateTypes] = useState([]);
  const [filter, setFilter] = useState({ CentreId: "", RateTypeID: "", Date: new Date() });
  const [loading, setLoading] = useState(false);
  const [rows, setRows] = useState([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => { loadCentres(); }, []);

  useEffect(() => {
    handleSearch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter.CentreId, filter.RateTypeID, filter.Date]);

  const loadCentres = async () => {
    try {
      const res = await getAccessCentres();
      const data = (res?.data?.message || []).map((c) => ({ value: c.CentreID, label: c.Centre }));
      setCentres(data);
      if (data.length > 0) {
        setFilter((p) => ({ ...p, CentreId: data[0].value }));
        loadRateTypes(data.map((c) => c.value));
      }
    } catch {
      toast.error("Failed to load centres.");
    }
  };

  const loadRateTypes = async (ids) => {
    try {
      const res = await getRateTypesForCentres(ids);
      const list = (res?.data?.message || []).map((r) => ({ label: r.RateTypeName, value: r.RateTypeID }));
      setRateTypes(list);
    } catch {
      // non-fatal — RateType stays optional
    }
  };

  const handleSearch = async () => {
    setLoading(true);
    setLoaded(false);
    try {
      const data = await fetchCoordinatorPrepData({
        CentreId: filter.CentreId,
        RateTypeID: filter.RateTypeID,
        FromDate: filter.Date,
        ToDate: filter.Date,
      });
      setRows(data);
      setLoaded(true);
    } catch {
      toast.error("Failed to load coordinator data.");
      setRows([]);
    } finally {
      setLoading(false);
    }
  };

  const stats = useMemo(() => {
    const passedRows = rows.filter((r) => r.Outcome === OUTCOME.PASSED);
    const failedRows = rows.filter((r) => r.Outcome === OUTCOME.FAILED);
    const pendingRows = rows.filter((r) => r.Outcome === OUTCOME.PENDING);
    const noShowRows = failedRows.filter((r) => classifyFailReason(r) === "No-Show");
    const incompleteRows = failedRows.filter((r) => classifyFailReason(r) !== "No-Show");

    const stageCounts = STAGE_OPTIONS.map((s) => ({
      stage: s.label,
      count: rows.filter((r) => String(r.Status ?? r.status) === s.value).length,
      fill: s.color,
    }));

    return {
      total: rows.length,
      passed: passedRows.length,
      failed: failedRows.length,
      pending: pendingRows.length,
      noShow: noShowRows.length,
      incomplete: incompleteRows.length,
      stageCounts,
      failedRows,
    };
  }, [rows]);

  const hasData = loaded && rows.length > 0;

  return (
    <div className="card patient_registration_card open" style={{ padding: "14px" }}>
      <div className="card-header mb-2" style={{ padding: 0, border: "none" }}>
        <h4 className="card-title w-100 mb-0">
          <label className="text-nowrap m-0">Coordinator Dashboard</label>
        </h4>
      </div>

      {/* Filters */}
      <div className="row g-2 mb-3 align-items-end">
        <div className="col-md-3">
          <ReactSelect
            id="CD_Centre" name="CentreId" placeholderName="Centre"
            dynamicOptions={centres} value={filter.CentreId} removeIsClearable
            onChange={(name, option) => {
              const value = option?.value || "";
              setFilter((p) => ({ ...p, CentreId: value, RateTypeID: "" }));
              loadRateTypes(value ? [value] : centres.map((c) => c.value));
            }}
          />
        </div>
        <div className="col-md-3">
          <ReactSelect
            id="CD_RateType" name="RateTypeID" placeholderName="Rate Type"
            dynamicOptions={rateTypes} value={filter.RateTypeID}
            onChange={(name, option) => setFilter((p) => ({ ...p, RateTypeID: option?.value || "" }))}
          />
        </div>
        <div className="col-md-2">
          <DatePicker
            name="Date" id="CD_Date" lable="Date"
            value={filter.Date}
            maxDate={new Date()}
            onChange={(v) => setFilter((p) => ({ ...p, Date: v }))}
          />
        </div>
      </div>

      {loading ? (
        <Loading />
      ) : !hasData ? (
        <div className="text-center text-muted py-5" style={{ fontSize: "13px" }}>
          {loaded ? "No patient preparation records found for this centre and date." : "Select a centre and date to view the dashboard."}
        </div>
      ) : (
        <>
          {/* Stat tiles */}
          <div className="d-flex gap-2 flex-wrap mb-3">
            <StatTile label="Total Slots" value={stats.total} color="#64748b" sub={moment(filter.Date).format("DD MMM YYYY")} />
            <StatTile label="Passed" value={stats.passed} color={OUTCOME_META.passed.color} icon={<FaCheckCircle size={10} color={OUTCOME_META.passed.color} />} sub={`${stats.total ? Math.round((stats.passed / stats.total) * 100) : 0}% completed`} />
            <StatTile label="Failed" value={stats.failed} color={OUTCOME_META.failed.color} icon={<FaTimesCircle size={10} color={OUTCOME_META.failed.color} />} sub={`${stats.noShow} no-show · ${stats.incomplete} incomplete`} />
            <StatTile label="Pending" value={stats.pending} color={OUTCOME_META.pending.color} icon={<FaHourglassHalf size={10} color={OUTCOME_META.pending.color} />} sub="not yet due" />
            <StatTile label="No-Show" value={stats.noShow} color="#d03b3b" icon={<FaUserSlash size={10} color="#d03b3b" />} sub="never checked in" />
          </div>

          {/* Charts */}
          <div className="d-flex gap-3 flex-wrap mb-3">
            <ChartCard title="Passed / Failed / Pending" height={90}>
              <div style={{ width: "100%", paddingTop: "4px" }}>
                <OutcomeBar passed={stats.passed} failed={stats.failed} pending={stats.pending} />
              </div>
            </ChartCard>

            <ChartCard title="Attendance Funnel — Registered → Prepared → In → Out">
              <BarChart data={stats.stageCounts} margin={{ top: 4, right: 8, left: -20, bottom: 4 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e1e0d9" vertical={false} />
                <XAxis dataKey="stage" tick={{ fontSize: 9.5, fill: "#898781" }} />
                <YAxis tick={{ fontSize: 10, fill: "#898781" }} allowDecimals={false} />
                <Tooltip contentStyle={{ fontSize: "11px", borderRadius: "6px" }} />
                <Bar dataKey="count" radius={[3, 3, 0, 0]}>
                  {stats.stageCounts.map((s, i) => <Cell key={i} fill={s.fill} />)}
                </Bar>
              </BarChart>
            </ChartCard>
          </div>

          {/* Actionable list — who missed today, so the coordinator can follow up */}
          <div style={{ background: "#fff", borderRadius: "10px", padding: "12px 14px", boxShadow: "0 1px 8px rgba(0,0,0,0.06)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12.5px", fontWeight: 700, color: "#334155", marginBottom: "8px" }}>
              <FaWalking color={OUTCOME_META.failed.color} /> Not Attended ({stats.failedRows.length})
            </div>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "12px" }}>
              <thead>
                <tr style={{ textAlign: "left", color: "#64748b", fontSize: "10.5px", textTransform: "uppercase" }}>
                  <th style={{ padding: "4px 8px" }}>Visit No</th>
                  <th style={{ padding: "4px 8px" }}>Patient</th>
                  <th style={{ padding: "4px 8px" }}>Department</th>
                  <th style={{ padding: "4px 8px" }}>Investigation</th>
                  <th style={{ padding: "4px 8px" }}>Mobile</th>
                  <th style={{ padding: "4px 8px" }}>Reg Date/Time</th>
                  <th style={{ padding: "4px 8px" }}>Reason</th>
                </tr>
              </thead>
              <tbody>
                {stats.failedRows.length === 0 ? (
                  <tr><td colSpan={7} className="text-center text-muted py-2">Nobody missed their slot for this date.</td></tr>
                ) : (
                  stats.failedRows.map((r) => (
                    <tr key={r.VisitNo} style={{ borderTop: "1px solid #f1f5f9" }}>
                      <td style={{ padding: "6px 8px", fontWeight: 600 }}>{r.VisitNo}</td>
                      <td style={{ padding: "6px 8px" }}>{r.PName}</td>
                      <td style={{ padding: "6px 8px" }}>{r.DepartmentName}</td>
                      <td style={{ padding: "6px 8px" }}>{r.ItemName}</td>
                      <td style={{ padding: "6px 8px" }}>{r.Mobile}</td>
                      <td style={{ padding: "6px 8px" }}>{r.RegDate}</td>
                      <td style={{ padding: "6px 8px", color: OUTCOME_META.failed.color, fontWeight: 600 }}>{classifyFailReason(r)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
};

export default CoordinatorDashboard;
