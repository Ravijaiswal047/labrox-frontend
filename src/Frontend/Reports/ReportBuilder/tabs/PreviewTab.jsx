import React, { useState } from "react";
import moment from "moment";
import { toast } from "react-toastify";
import FilterField from "../components/FilterField";
import ReportOutputPanel from "../components/ReportOutputPanel";
import reportBuilderApi from "../reportBuilderApi";

// Exercises the report exactly as an end user in Report Viewer would — real
// filters (built from the Filters tab's own filterRows) run against the real
// data source via runReport, rendered through the same generic ReportOutputPanel.
const PreviewTab = ({ reportId, reportName, filterRows, columnRows, printSetup }) => {
  const [values, setValues] = useState({});
  const [records, setRecords] = useState([]);
  const [hasRun, setHasRun] = useState(false);
  const [running, setRunning] = useState(false);
  const setValue = (id, v) => setValues((prev) => ({ ...prev, [id]: v }));

  const handleViewReport = async () => {
    if (!reportId) {
      toast.error("Save the report before previewing.");
      return;
    }
    setRunning(true);
    try {
      const filterValuesByName = {};
      filterRows.forEach((row) => {
        const v = values[row.id];
        filterValuesByName[row.name] = v instanceof Date ? moment(v).format("YYYY-MM-DD") : v;
      });
      const res = await reportBuilderApi.runReport(reportId, filterValuesByName);
      setRecords(res.success ? res.data || [] : []);
      setHasRun(true);
      if (!res.success) toast.error(res.message || "Failed to run report");
    } finally {
      setRunning(false);
    }
  };

  return (
    <div className="rb-panel">
      <div className="rb-panel-hd"><span className="rb-dot" />Report Output</div>
      <div className="rb-panel-body">
        {filterRows.length === 0 ? (
          <div className="rb-hint" style={{ marginBottom: 12 }}>No filters configured — the report will run with no criteria.</div>
        ) : (
          <div className="rb-flt-preview" style={{ marginBottom: 12 }}>
            {filterRows.map((row) => {
              const width = row.width ? Math.min(Number(row.width), 260) : undefined;
              return (
                <div className="rb-fg" key={row.id} style={width ? { width } : undefined}>
                  <label>
                    {row.name} {row.validation === "Mandatory" && <span className="rb-req">*</span>}
                  </label>
                  <FilterField reportId={reportId} row={row} value={values[row.id]} onChange={setValue} style={width ? { width } : undefined} />
                </div>
              );
            })}
            <button type="button" className="rb-go" onClick={handleViewReport} disabled={running}>
              {running ? "Loading…" : "🔍 View Report"}
            </button>
          </div>
        )}

        {hasRun ? (
          <ReportOutputPanel columns={columnRows} records={records} currencySymbol={printSetup.currencySymbol} allowedFormats={printSetup.allowedFormats} reportName={reportName} printSetup={printSetup} />
        ) : (
          <div className="rb-hint">Set your filters above and click "View Report" to preview real output.</div>
        )}
      </div>
    </div>
  );
};

export default PreviewTab;
