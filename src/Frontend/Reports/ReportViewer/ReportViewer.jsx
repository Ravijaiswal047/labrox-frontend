import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import moment from "moment";
import { toast } from "react-toastify";
import { CustomButton } from "../../../components/UI/CustomButton";
import ReportExplorer from "../ReportBuilder/components/ReportExplorer";
import ReportOutputPanel from "../ReportBuilder/components/ReportOutputPanel";
import ReportFilterBar from "./components/ReportFilterBar";
import reportBuilderApi, { mapReportTree, mapColumns, mapPrintSetup } from "../ReportBuilder/reportBuilderApi";
import { initialFilterRows, initialColumnRows } from "../ReportBuilder/reportBuilderData";
import { getReportBuilderThemeStyle } from "../ReportBuilder/reportBuilderTheme";
import "../ReportBuilder/ReportBuilder.css";

const findFirstLiveLeaf = (tree) => {
  for (const group of tree) {
    const live = group.items.find((it) => it.status === "LIVE");
    if (live) return live;
  }
  return null;
};

const defaultValueFor = (row) => {
  if (row.controlType === "Date" || row.controlType === "Date Range") return new Date();
  if (row.controlType === "Multi Select") return [];
  return "";
};

const buildDefaultValues = (filterRows) =>
  filterRows.reduce((acc, row) => ({ ...acc, [row.id]: defaultValueFor(row) }), {});

// User Mode: browse published reports and populate them with data. This screen
// intentionally has none of the Developer Mode configuration tabs (Data Source,
// Columns, Security, etc.) — end users only pick a report, fill filters, and view
// whatever columns/filters that report was designed with in Developer Mode.
const ReportViewer = () => {
  const navigate = useNavigate();
  const currentTheme = useSelector((state) => state.loadingSlice.currentTheme);
  const themeStyle = useMemo(() => getReportBuilderThemeStyle(currentTheme), [currentTheme]);
  const [treeData, setTreeData] = useState([]);
  const [selectedLeaf, setSelectedLeaf] = useState(null);
  const [liveFilterRows, setLiveFilterRows] = useState([]);
  const [liveColumns, setLiveColumns] = useState([]);
  const [printMeta, setPrintMeta] = useState(() => mapPrintSetup());
  const [filterValues, setFilterValues] = useState({});
  const [runRecords, setRunRecords] = useState([]);
  const [hasRun, setHasRun] = useState(false);
  const [running, setRunning] = useState(false);

  const setFilterField = (id, value) => setFilterValues((prev) => ({ ...prev, [id]: value }));

  const handleSelectLeaf = async (leaf) => {
    setSelectedLeaf(leaf);
    setHasRun(false);
    setRunRecords([]);

    const res = await reportBuilderApi.getReportDetail(leaf.id);
    if (!res.success || !res.data) {
      // No backend wired up yet — fall back to demo shape so the screen isn't blank.
      toast.info("Showing demo data — connect a live backend for real reports.");
      setLiveFilterRows(initialFilterRows);
      setLiveColumns(initialColumnRows);
      setFilterValues(buildDefaultValues(initialFilterRows));
      setPrintMeta(mapPrintSetup());
      return;
    }

    const filters = (res.data.filters || []).map((f, idx) => ({
      id: f.filterID ?? idx,
      seq: f.seq ?? idx + 1,
      name: f.filterName,
      controlType: f.controlType || "Textbox",
      width: f.width,
      validation: f.validation || "Optional",
    }));
    const cols = mapColumns(res.data.columns);
    const ps = res.data.printSetup;

    setLiveFilterRows(filters);
    setLiveColumns(cols);
    setFilterValues(buildDefaultValues(filters));
    setPrintMeta(mapPrintSetup(ps));
  };

  const handleViewReport = async () => {
    if (!selectedLeaf) return;
    setRunning(true);
    try {
      const filterValuesByName = {};
      liveFilterRows.forEach((row) => {
        const v = filterValues[row.id];
        filterValuesByName[row.name] = v instanceof Date ? moment(v).format("YYYY-MM-DD") : v;
      });

      const res = await reportBuilderApi.runReport(selectedLeaf.id, filterValuesByName);
      setRunRecords(res.success ? res.data || [] : []);
      setHasRun(true);
      toast[res.success ? "success" : "error"](res.success ? "Report generated" : res.message || "Failed to run report");
    } finally {
      setRunning(false);
    }
  };

  useEffect(() => {
    (async () => {
      const treeRes = await reportBuilderApi.getReportTree();
      if (!treeRes.success) {
        toast.error(treeRes.message || "Failed to load report list");
        return;
      }
      const mappedTree = mapReportTree(treeRes.data);
      setTreeData(mappedTree);
      const firstLive = findFirstLiveLeaf(mappedTree);
      if (firstLive) handleSelectLeaf(firstLive);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const liveCount = useMemo(
    () => treeData.reduce((n, g) => n + g.items.filter((it) => it.status === "LIVE").length, 0),
    [treeData]
  );

  return (
    <div className="rb-scope" style={themeStyle}>
      <div className="rb-wrap">
        <ReportExplorer
          treeData={treeData}
          setTreeData={setTreeData}
          selectedId={selectedLeaf?.id}
          onSelectLeaf={handleSelectLeaf}
          title="AVAILABLE REPORTS"
          allowedStatuses={["LIVE"]}
        />

        <div className="rb-main">
          <div className="rb-strip">
            <h2>{selectedLeaf ? selectedLeaf.name : "No report selected"}</h2>
            {selectedLeaf && <span className="rb-code">{selectedLeaf.code}</span>}
            <span className="rb-mode-badge user">👤 User Mode</span>
            <div className="rb-acts">
              <CustomButton text="Developer Mode" icon="edit" variant="secondary" className="rb-navy" onClick={() => navigate("/ReportBuilder")} />
            </div>
          </div>

          <div className="rb-body">
            {!selectedLeaf ? (
              <div className="rb-panel">
                <div className="rb-panel-body">
                  No published reports are available yet ({liveCount} live). Ask a developer to publish one from Developer Mode.
                </div>
              </div>
            ) : (
              <div className="rb-panel">
                <div className="rb-panel-hd"><span className="rb-dot" />Report Output — {selectedLeaf.name}</div>
                <div className="rb-panel-body">
                  <ReportFilterBar
                    reportId={selectedLeaf.id}
                    filterRows={liveFilterRows}
                    values={filterValues}
                    onChange={setFilterField}
                    onSubmit={handleViewReport}
                    submitLabel={running ? "Loading…" : "🔍 View Report"}
                  />
                  <div style={{ marginTop: 12 }}>
                    {hasRun ? (
                      <ReportOutputPanel
                        columns={liveColumns}
                        records={runRecords}
                        currencySymbol={printMeta.currencySymbol}
                        allowedFormats={printMeta.allowedFormats}
                        reportName={selectedLeaf.name}
                        printSetup={printMeta}
                      />
                    ) : (
                      <div className="rb-hint">Set your filters above and click "View Report".</div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="rb-footbar">
            <span>{liveCount} published report{liveCount === 1 ? "" : "s"} available</span>
            <span className="rb-right">LabRox LIMS 9.0 · Powered By LabRox</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportViewer;
