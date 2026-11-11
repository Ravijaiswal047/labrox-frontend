import React, { useEffect, useMemo, useState } from "react";
import moment from "moment";
import { toast } from "react-toastify";
import ReactSelect from "../../components/formComponent/ReactSelect";
import DatePicker from "../../components/formComponent/DatePicker";
import Loading from "../../components/loader/Loading";
import Tables from "../../components/UI/customTable";
import TableFilterDot from "../../components/TableFilter/TableFilterDot";
import { SearchButton, CustomButton } from "../../components/UI/CustomButton";
import { exportToExcel } from "../../utils/exportLibrary";
import { getAccessCentres, getRateTypesForCentres, getPatientPreparationReportPDF } from "./api";
import {
  OUTCOME, OUTCOME_META, getStageLabel, classifyFailReason,
  fetchCoordinatorPrepData, buildPrepFilterPayload,
} from "./coordinatorPrep";

const OUTCOME_FILTERS = [
  { value: OUTCOME.PASSED, label: OUTCOME_META.passed.label, color: OUTCOME_META.passed.color },
  { value: OUTCOME.FAILED, label: OUTCOME_META.failed.label, color: OUTCOME_META.failed.color },
  { value: OUTCOME.PENDING, label: OUTCOME_META.pending.label, color: OUTCOME_META.pending.color },
];

const CoordinatorReport = () => {
  const [centres, setCentres] = useState([]);
  const [rateTypes, setRateTypes] = useState([]);
  const [filter, setFilter] = useState({
    CentreId: "", RateTypeID: "", FromDate: new Date(), ToDate: new Date(),
  });
  const [loading, setLoading] = useState(false);
  const [rows, setRows] = useState([]);
  const [searched, setSearched] = useState(false);
  const [outcomeFilter, setOutcomeFilter] = useState(null);
  const [pdfLoading, setPdfLoading] = useState(false);

  useEffect(() => { loadCentres(); }, []);

  const loadCentres = async () => {
    try {
      const res = await getAccessCentres();
      const data = (res?.data?.message || []).map((c) => ({ value: c.CentreID, label: c.Centre }));
      setCentres(data);
      loadRateTypes(data.map((c) => c.value));
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
    setSearched(true);
    setOutcomeFilter(null);
    try {
      const data = await fetchCoordinatorPrepData(filter);
      setRows(data);
    } catch {
      toast.error("Failed to load report.");
      setRows([]);
    } finally {
      setLoading(false);
    }
  };

  const outcomeCounts = useMemo(() => ({
    [OUTCOME.PASSED]: rows.filter((r) => r.Outcome === OUTCOME.PASSED).length,
    [OUTCOME.FAILED]: rows.filter((r) => r.Outcome === OUTCOME.FAILED).length,
    [OUTCOME.PENDING]: rows.filter((r) => r.Outcome === OUTCOME.PENDING).length,
  }), [rows]);

  const filteredRows = useMemo(
    () => (outcomeFilter ? rows.filter((r) => r.Outcome === outcomeFilter) : rows),
    [rows, outcomeFilter]
  );

  const handleExport = () => {
    if (filteredRows.length === 0) {
      toast.warn("No data to export.");
      return;
    }
    const exportRows = filteredRows.map((r, idx) => ({
      "S.No": idx + 1,
      Centre: r.BusinessUnit,
      "Reg Date/Time": r.RegDate,
      "Visit No": r.VisitNo,
      Patient: r.PName,
      Age: r.Age,
      Gender: r.Gender,
      Mobile: r.Mobile,
      "Rate Type": r.RateTypeName,
      Doctor: r.DoctorName,
      Department: r.DepartmentName,
      Investigation: r.ItemName,
      Stage: getStageLabel(r.Status),
      Outcome: OUTCOME_META[r.Outcome]?.label || r.Outcome,
      Reason: r.Outcome === OUTCOME.FAILED ? classifyFailReason(r) : "",
    }));
    exportToExcel(exportRows, `CoordinatorReport_${moment(filter.FromDate).format("DD-MMM-YYYY")}_to_${moment(filter.ToDate).format("DD-MMM-YYYY")}`);
  };

  // This report has no single StatusID selector (it always merges all 4
  // stages), so there's never a "status picked" case to send — statusID is
  // always 0, which per the backend means "no filter, send everything".
  const handleDownloadPdf = async () => {
    setPdfLoading(true);
    try {
      const payload = { ...buildPrepFilterPayload(filter), statusID: 0 };
      const res = await getPatientPreparationReportPDF(payload);
      if (res?.data && res.data.size > 0) {
        const pdfUrl = window.URL.createObjectURL(res.data);
        window.open(pdfUrl, "_blank");
      } else {
        toast.warn("No data available for PDF.");
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to generate PDF.");
    } finally {
      setPdfLoading(false);
    }
  };

  return (
    <div className="card patient_registration_card open" style={{ padding: "14px" }}>
      <div className="card-header mb-2" style={{ padding: 0, border: "none" }}>
        <h4 className="card-title w-100 mb-0">
          <label className="text-nowrap m-0">Coordinator Report</label>
        </h4>
      </div>

      {/* Filters */}
      <div className="row g-2 mb-3 align-items-end">
        <div className="col-md-3">
          <ReactSelect
            id="CR_Centre" name="CentreId" placeholderName="Centre"
            dynamicOptions={centres} value={filter.CentreId} removeIsClearable
            onChange={(name, option) => {
              const value = option?.value || "";
              setFilter((p) => ({ ...p, CentreId: value, RateTypeID: "" }));
              loadRateTypes(value ? [value] : centres.map((c) => c.value));
            }}
          />
        </div>
        <div className="col-md-2">
          <ReactSelect
            id="CR_RateType" name="RateTypeID" placeholderName="Rate Type"
            dynamicOptions={rateTypes} value={filter.RateTypeID}
            onChange={(name, option) => setFilter((p) => ({ ...p, RateTypeID: option?.value || "" }))}
          />
        </div>
        <div className="col-md-2">
          <DatePicker
            name="FromDate" id="CR_FromDate" lable="From Date"
            value={filter.FromDate}
            maxDate={new Date(filter.ToDate)}
            onChange={(v) => setFilter((p) => ({ ...p, FromDate: v }))}
          />
        </div>
        <div className="col-md-2">
          <DatePicker
            name="ToDate" id="CR_ToDate" lable="To Date"
            value={filter.ToDate}
            maxDate={new Date()}
            minDate={new Date(filter.FromDate)}
            onChange={(v) => setFilter((p) => ({ ...p, ToDate: v }))}
          />
        </div>
        <div className="col-md-1">
          <SearchButton text={"Search"} onClick={handleSearch} />
        </div>
        <div className="col-md-1">
          <CustomButton text={"Export"} icon="excel" variant="success" onClick={handleExport} />
        </div>
        <div className="col-md-1">
          <CustomButton text={"PDF"} icon="pdf" variant="danger" loading={pdfLoading} onClick={handleDownloadPdf} />
        </div>
      </div>

      {/* Outcome filter pills */}
      {rows.length > 0 && (
        <div className="d-flex align-items-center mb-2" style={{ gap: "6px" }}>
          <strong style={{ fontSize: "12px", color: "#334155" }}>Outcome:</strong>
          <TableFilterDot
            color="#64748b"
            title={`All (${rows.length})`}
            onClick={() => setOutcomeFilter(null)}
            bgColor={outcomeFilter === null ? "#e2e8f0" : "#f8fafc"}
            textColor={"#000000"}
          />
          {OUTCOME_FILTERS.map((o) => (
            <TableFilterDot
              key={o.value}
              color={o.color}
              title={`${o.label} (${outcomeCounts[o.value] || 0})`}
              onClick={() => setOutcomeFilter((prev) => (prev === o.value ? null : o.value))}
              bgColor={outcomeFilter === o.value ? o.color : "#e9e2e1"}
              textColor={"#000000"}
            />
          ))}
        </div>
      )}

      {loading ? (
        <Loading />
      ) : !searched ? (
        <div className="text-center text-muted py-5" style={{ fontSize: "13px" }}>
          Select filters and click Search to build the report.
        </div>
      ) : filteredRows.length === 0 ? (
        <div className="text-center text-muted py-5" style={{ fontSize: "13px" }}>
          No records found.
        </div>
      ) : (
        <Tables style={{ maxHeight: "500px", overflowY: "auto" }}>
          <thead className="cf">
            <tr>
              <th>{"S.No"}</th>
              <th>{"Centre"}</th>
              <th>{"Reg Date/Time"}</th>
              <th>{"VisitNo"}</th>
              <th>{"PName | Age | Gender"}</th>
              <th>{"Mobile No."}</th>
              <th>{"RateType | Doctor"}</th>
              <th>{"Dept."}</th>
              <th>{"Investigation"}</th>
              <th>{"Stage"}</th>
              <th>{"Outcome"}</th>
            </tr>
          </thead>
          <tbody>
            {filteredRows.map((r, index) => {
              const meta = OUTCOME_META[r.Outcome];
              return (
                <tr key={`${r.VisitNo}_${r.Status}_${index}`}>
                  <td data-title={"S No."}>{index + 1}</td>
                  <td data-title={"Centre"}>{r.BusinessUnit}</td>
                  <td data-title={"Reg Date/Time"}>{r.RegDate}</td>
                  <td data-title={"VisitNo"}>{r.VisitNo}</td>
                  <td data-title={"PName | Age | Gender"}>
                    <span>{r.PName}</span> <br />
                    <span>{r.Age}</span> <br />
                    <span>{r.Gender}</span>
                  </td>
                  <td data-title={"Mobile No."}>{r.Mobile}</td>
                  <td data-title={"RateType | Doctor"}>
                    <span>{r.RateTypeName}</span> <br />
                    <span>{r.DoctorName}</span>
                  </td>
                  <td data-title={"Department"}>{r.DepartmentName}</td>
                  <td data-title={"Investigation"}>{r.ItemName}</td>
                  <td data-title={"Stage"}>{getStageLabel(r.Status)}</td>
                  <td data-title={"Outcome"}>
                    <span
                      style={{
                        display: "inline-flex", alignItems: "center", gap: "4px",
                        padding: "2px 8px", borderRadius: "999px",
                        fontSize: "10.5px", fontWeight: 700,
                        color: "#fff", background: meta?.color || "#64748b",
                      }}
                      title={r.Outcome === OUTCOME.FAILED ? classifyFailReason(r) : undefined}
                    >
                      {meta?.label || r.Outcome}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </Tables>
      )}
    </div>
  );
};

export default CoordinatorReport;
