import React, { useEffect, useState } from "react";
import moment from "moment";
import { toast } from "react-toastify";
import { Dialog } from "primereact/dialog";
import ReactSelect from "../../components/formComponent/ReactSelect";
import DatePicker from "../../components/formComponent/DatePicker";
import Loading from "../../components/loader/Loading";
import Tables from "../../components/UI/customTable";
import { CustomButton, SearchButton } from "../../components/UI/CustomButton";
import { useLocalStorage } from "../../utils/hooks/useLocalStorage";
import {
  bindCentresForRadiology,
  getRateTypesForCentres,
  getMacDepartments,
  getDepartmentModalityMIS,
  getDepartmentModalityMISPatients,
  getDepartmentModalityMISPDF,
} from "./api";

// Columns match the report exactly (see backend-docs/backend-radiology-department-modality-mis.md
// for the field-name contract this expects from the backend, and open
// questions about a couple of these — none of this exists on the backend yet).
const COLUMNS = [
  { key: "machineName", label: "Modality", align: "left" },
  { key: "totalCaseBooked", label: "TOTAL CASE BOOKED" },
  { key: "scanDone", label: "SCAN DONE" },
  { key: "reported", label: "REPORTED" },
  { key: "oldReported", label: "OLD REPORTED" },
  { key: "reportPending", label: "REPORT PENDING" },
  { key: "scanNotDone", label: "SCAN NOT DONE" },
  { key: "cancel", label: "CANCEL" },
  { key: "remarks", label: "REMARKS", align: "left" },
];

const NUMERIC_KEYS = COLUMNS.filter((c) => c.key !== "machineName" && c.key !== "remarks").map((c) => c.key);
const COUNT_KEYS = NUMERIC_KEYS.filter((k) => k !== "machineName");

const DepartmentModalityMIS = () => {
  const theme = useLocalStorage("theme", "get");
  const [centres, setCentres] = useState([]);
  const [rateTypes, setRateTypes] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [filter, setFilter] = useState({
    CentreId: "", RateTypeID: "", DepartmentId: "",
    FromDate: new Date(), ToDate: new Date(),
  });
  const [loading, setLoading] = useState(false);
  const [rows, setRows] = useState([]);
  const [searched, setSearched] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [showPatients, setShowPatients] = useState(false);
  const [patientLoading, setPatientLoading] = useState(false);
  const [patients, setPatients] = useState([]);
  const [patientTitle, setPatientTitle] = useState("Patient List");

  useEffect(() => {
    loadCentres();
    loadDepartments();
  }, []);

  const loadCentres = async () => {
    try {
      const res = await bindCentresForRadiology();
      const data = (res?.data?.message || []).map((c) => ({
        value: c.CentreId ?? c.CentreID,
        label: c.Centre ?? c.CentreName,
      }));
      // "" is the same falsy sentinel buildPayload() and the Centre
      // onChange handler already treat as "no centre filter" (sends an
      // empty centreId array) — this just gives the user an explicit way
      // to pick that state instead of only reaching it by clearing.
      setCentres([{ label: "All Centre", value: "" }, ...data]);
      if (data.length > 0) {
        setFilter((p) => ({ ...p, CentreId: data[0].value }));
        loadRateTypes([data[0].value]);
      }
    } catch {
      toast.error("Failed to load centres.");
    }
  };

  const loadRateTypes = async (centreIds) => {
    try {
      const res = await getRateTypesForCentres(centreIds);
      const list = (res?.data?.message || []).map((r) => ({ label: r.RateTypeName, value: r.RateTypeID }));
      setRateTypes(list);
    } catch {
      // non-fatal — RateType stays optional
    }
  };

  const loadDepartments = async () => {
    try {
      const res = await getMacDepartments();
      const list = (res?.data?.message || []).map((d) => ({
        label: d.departmentName ?? d.DepartmentName,
        value: d.departmentId ?? d.DepartmentID,
      }));
      setDepartments(list);
    } catch {
      toast.error("Failed to load departments.");
    }
  };

  const buildPayload = () => ({
    centreId: filter.CentreId ? [filter.CentreId] : [],
    rateTypeId: filter.RateTypeID ? [filter.RateTypeID] : [],
    departmentId: filter.DepartmentId ? [filter.DepartmentId] : [],
    fromDate: moment(filter.FromDate).format("YYYY-MM-DD"),
    toDate: moment(filter.ToDate).format("YYYY-MM-DD"),
  });

  const handleSearch = async () => {
    setLoading(true);
    setSearched(true);
    try {
      const res = await getDepartmentModalityMIS(buildPayload());
      if (res?.data?.success && Array.isArray(res?.data?.message)) {
        setRows(res.data.message);
      } else {
        setRows([]);
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to load report.");
      setRows([]);
    } finally {
      setLoading(false);
    }
  };

  // TOTAL row computed client-side from whatever rows come back, rather than
  // trusting the backend to also include one — keeps the footer correct even
  // if the backend only ever sends per-department rows.
  const totals = NUMERIC_KEYS.reduce((acc, key) => {
    acc[key] = rows.reduce((sum, r) => sum + (Number(r?.[key]) || 0), 0);
    return acc;
  }, {});

  const handleCountClick = async (row, countKey, isTotal = false) => {
    const count = Number(isTotal ? totals[countKey] : row?.[countKey]) || 0;
    if (count <= 0) return;

    const colLabel = COLUMNS.find((c) => c.key === countKey)?.label || countKey;
    const machineName = isTotal
      ? "All Modalities"
      : (row?.machineName ?? row?.MachineName ?? "Unassigned");
    setPatientTitle(`${colLabel} — ${machineName}`);
    setShowPatients(true);
    setPatientLoading(true);
    setPatients([]);

    const machineId = row?.machineId ?? row?.MachineId;
    try {
      const res = await getDepartmentModalityMISPatients({
        ...buildPayload(),
        machineId: isTotal ? null : machineId,
        unassigned: !isTotal && !machineId,
        allMachines: isTotal,
        countType: countKey,
      });
      const data = res?.data?.message;
      if (res?.data?.success && Array.isArray(data)) {
        setPatients(data);
        if (data.length === 0) toast.info("No patients found for this count.");
      } else {
        setPatients([]);
        toast.warn(typeof data === "string" ? data : "No patients found.");
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to load patient list.");
      setPatients([]);
    } finally {
      setPatientLoading(false);
    }
  };

  const renderCountCell = (value, onClick) => {
    const count = Number(value) || 0;
    if (count <= 0) return count;
    return (
      <span
        onClick={onClick}
        style={{ color: "#1d4ed8", cursor: "pointer", textDecoration: "underline", fontWeight: 600 }}
        title="Click to view patient list"
      >
        {count}
      </span>
    );
  };

  const handleDownloadPdf = async () => {
    setPdfLoading(true);
    try {
      const res = await getDepartmentModalityMISPDF(buildPayload());
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
          <label className="text-nowrap m-0">Department / Modality MIS</label>
        </h4>
      </div>

      {/* Filters */}
      <div className="row g-2 mb-3 align-items-end">
        <div className="col-md-2">
          <ReactSelect
            id="DM_Centre" name="CentreId" placeholderName="Centre"
            dynamicOptions={centres} value={filter.CentreId} removeIsClearable
            onChange={(name, option) => {
              const value = option?.value || "";
              setFilter((p) => ({ ...p, CentreId: value, RateTypeID: "" }));
              // exclude the "All Centre" sentinel (value "") itself from
              // the "load rate types for every centre" fallback list
              loadRateTypes(value ? [value] : centres.map((c) => c.value).filter(Boolean));
            }}
          />
        </div>
        <div className="col-md-2">
          <ReactSelect
            id="DM_RateType" name="RateTypeID" placeholderName="Rate Type"
            dynamicOptions={rateTypes} value={filter.RateTypeID}
            onChange={(name, option) => setFilter((p) => ({ ...p, RateTypeID: option?.value || "" }))}
          />
        </div>
        {/* <div className="col-md-2">
          <ReactSelect
            id="DM_Department" name="DepartmentId" placeholderName="Department"
            dynamicOptions={departments} value={filter.DepartmentId}
            onChange={(name, option) => setFilter((p) => ({ ...p, DepartmentId: option?.value || "" }))}
          />
        </div> */}
        <div className="col-md-2">
          <DatePicker
            name="FromDate" id="DM_FromDate" lable="From Date"
            value={filter.FromDate}
            maxDate={new Date(filter.ToDate)}
            onChange={(v) => setFilter((p) => ({ ...p, FromDate: v }))}
          />
        </div>
        <div className="col-md-2">
          <DatePicker
            name="ToDate" id="DM_ToDate" lable="To Date"
            value={filter.ToDate}
            maxDate={new Date()}
            minDate={new Date(filter.FromDate)}
            onChange={(v) => setFilter((p) => ({ ...p, ToDate: v }))}
          />
        </div>
        <div className="col-md-auto" style={{ display: "flex", justifyContent: "space-between" }}>
          <SearchButton text={"Search"} onClick={handleSearch} />
            <CustomButton text={"PDF"} icon="pdf" className="ml-2" variant="danger" loading={pdfLoading} onClick={handleDownloadPdf} />
        </div>
      </div>

      <div className="d-flex justify-content-end mb-2">
      
      </div>

      {loading ? (
        <Loading />
      ) : !searched ? (
        <div className="text-center text-muted py-5" style={{ fontSize: "13px" }}>
          Select filters and click Search to build the report.
        </div>
      ) : rows.length === 0 ? (
        <div className="text-center text-muted py-5" style={{ fontSize: "13px" }}>
          No records found.
        </div>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "12.5px" }}>
            <thead>
              <tr style={{ background: "#f1f5f9" }}>
                {COLUMNS.map((col) => (
                  <th
                    key={col.key}
                    style={{
                      padding: "8px 10px", border: "1px solid #cbd5e1",
                      textAlign: col.align || "center", fontWeight: 700, color: "#1e293b",
                    }}
                  >
                    {col.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, idx) => (
                <tr key={row?.departmentId ?? idx} style={{ background: idx % 2 === 0 ? "#fff" : "#fafbfc" }}>
                  {COLUMNS.map((col) => (
                    <td
                      key={col.key}
                      style={{
                        padding: "6px 10px", border: "1px solid #e2e8f0",
                        textAlign: col.align || "center",
                        color: col.key === "cancel" && Number(row?.[col.key]) > 0 ? "#b91c1c" : "#1e293b",
                        fontWeight: col.key === "departmentName" ? 600 : 400,
                      }}
                    >
                      {COUNT_KEYS.includes(col.key)
                        ? renderCountCell(row?.[col.key], () => handleCountClick(row, col.key))
                        : (row?.[col.key] ?? (col.key === "remarks" || col.key === "machineName" ? "" : 0))}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr style={{ background: "#f1f5f9", fontWeight: 700 }}>
                {COLUMNS.map((col) => (
                  <td
                    key={col.key}
                    style={{ padding: "8px 10px", border: "1px solid #cbd5e1", textAlign: col.align || "center" }}
                  >
                    {col.key === "machineName"
                      ? "TOTAL"
                      : col.key === "remarks"
                        ? ""
                        : renderCountCell(totals[col.key], () => handleCountClick(null, col.key, true))}
                  </td>
                ))}
              </tr>
            </tfoot>
          </table>
        </div>
      )}

      <Dialog
        header={patientTitle}
        visible={showPatients}
        onHide={() => setShowPatients(false)}
        style={{ width: "70vw" }}
        className={theme}
        modal
      >
        {patientLoading ? (
          <Loading />
        ) : patients.length === 0 ? (
          <div className="text-center text-muted py-4">No patients found.</div>
        ) : (
          <div style={{ maxHeight: "60vh", overflow: "auto" }}>
            <Tables>
              <thead className="cf">
                <tr>
                  <th>VisitDate</th>
                  <th>VisitNo</th>
                  <th>PName</th>
                  <th>Age</th>
                  <th>Gender</th>
                  <th>Due Amount</th>
                </tr>
              </thead>
              <tbody>
                {patients.map((p, idx) => (
                  <tr key={`${p.visitNo ?? p.VisitNo ?? idx}-${idx}`}>
                    <td>{p.visitDate ?? p.VisitDate}</td>
                    <td>{p.visitNo ?? p.VisitNo}</td>
                    <td>{p.pName ?? p.PName}</td>
                    <td>{p.age ?? p.Age}</td>
                    <td>{p.gender ?? p.Gender}</td>
                    <td>{p.dueAmount ?? p.DueAmount ?? 0}</td>
                  </tr>
                ))}
              </tbody>
            </Tables>
          </div>
        )}
      </Dialog>
    </div>
  );
};

export default DepartmentModalityMIS;
