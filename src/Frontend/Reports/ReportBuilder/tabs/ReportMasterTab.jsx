import React from "react";
import { Form } from "react-bootstrap";
import Input from "../../../../components/formComponent/Input";
import ReactSelect from "../../../../components/formComponent/ReactSelect";
import MultiSelectComp from "../../../../components/formComponent/MultiSelectComp";
import { iconOptions } from "../reportBuilderData";

const ReportMasterTab = ({
  master,
  setField,
  reportHeadOptions,
  reportTypeOptions,
  onReportHeadChange,
  onAddReportHead,
  onEditReportHead,
  onAddReportType,
  onEditReportType,
}) => {
  const reportHeadLabel = reportHeadOptions.find((o) => o.value === master.reportHeadId)?.label || "—";
  const singleSelectedType = master.reportType.length === 1 ? master.reportType[0] : null;
  const selectedTypeLabel = reportTypeOptions.find((o) => o.value === singleSelectedType)?.label || "—";
  return (
    <>
      <div className="rb-panel">
        <div className="rb-panel-hd">
          <span className="rb-dot" />Basic Information
        </div>
        <div className="rb-panel-body">
          <div className="row">
            <div className="col-sm-2 rb-fg">
              <label>Report Name <span className="rb-req">*</span></label>
              <Input
                id="rbReportName"
                name="reportName"
                placeholder="Report Name"
                type="text"
                value={master.reportName ?? ""}
                onChange={(e) => setField("reportName", e.target.value ?? "")}
                removeFormGroupClass
              />
            </div>
            <div className="col-sm-2 rb-fg">
              <label>Report Code <span className="rb-req">*</span></label>
              <Input
                id="rbReportCode"
                name="reportCode"
                type="text"
                className="font-monospace"
                value={master.reportCode}
                onChange={(e) => setField("reportCode", e.target.value)}
                removeFormGroupClass
              />
            </div>
            <div className="col-sm-2 rb-fg">
              <label>Report Head <span className="rb-req">*</span></label>
              <div className="rb-with-btns">
                <ReactSelect
                  id="rbReportHead"
                  name="reportHeadId"
                  placeholderName="Select"
                  dynamicOptions={reportHeadOptions}
                  value={master.reportHeadId}
                  onChange={(name, opt) => onReportHeadChange(opt?.value ?? null)}
                  searchable
                />
                <button
                  type="button"
                  className="rb-mini-icon-btn"
                  title="Edit selected Report Head"
                  disabled={!master.reportHeadId}
                  onClick={() => onEditReportHead(master.reportHeadId, reportHeadLabel)}
                >
                  ✎
                </button>
                <button
                  type="button"
                  className="rb-mini-icon-btn rb-orange"
                  title="Create new Report Head"
                  onClick={onAddReportHead}
                >
                  ＋
                </button>
              </div>
            </div>
            <div className="col-sm-3 rb-fg">
              <label>Report Type <span className="rb-req">*</span></label>
              <div className="rb-with-btns">
                <MultiSelectComp
                  id="rbReportType"
                  name="reportType"
                  options={reportTypeOptions}
                  value={master.reportType}
                  onChange={(name, v) => setField(name, v || [])}
                  placeholder="Select one or more…"
                />
                <button
                  type="button"
                  className="rb-mini-icon-btn"
                  title="Edit selected Report Type (select exactly one)"
                  disabled={!singleSelectedType}
                  onClick={() => onEditReportType(singleSelectedType, selectedTypeLabel)}
                >
                  ✎
                </button>
                <button
                  type="button"
                  className="rb-mini-icon-btn rb-orange"
                  title="Create new Report Type"
                  onClick={onAddReportType}
                >
                  ＋
                </button>
              </div>
              {/* <span className="rb-hint">e.g. Summary, Detail, Detail Patient Wise — each one becomes a sub-report under this report. Use ＋ to create a new one.</span> */}
            </div>
            <div className="col-sm-2 rb-fg">
              <label>Display Sequence</label>
              <Input
                id="rbDisplaySequence"
                name="displaySequence"
                type="number"
                value={master.displaySequence}
                onChange={(e) => setField("displaySequence", e.target.value)}
                removeFormGroupClass
              />
              {/* <span className="rb-hint">Auto-suggested for new reports under this Report Head</span> */}
            </div>
            <div className="col-sm-2 rb-fg">
              <label>Report Description</label>
              <Input
                id="rbDescription"
                name="description"
                type="text"
                value={master.description}
                onChange={(e) => setField("description", e.target.value)}
                removeFormGroupClass
              />
            </div>
            <div className="col-sm-2 rb-fg">
              <label>Icon</label>
              <ReactSelect
                id="rbIcon"
                name="icon"
                placeholderName="Select"
                dynamicOptions={iconOptions}
                value={master.icon}
                onChange={(name, opt) => setField(name, opt?.value ?? "")}
                searchable
              />
            </div>
            <div className="col-sm-2 rb-fg">
              <label>Status</label>
              <div className="rb-inline-checks">
                <div className="form-check form-switch ms-1">
                  <Form.Check
                    type="switch"
                    id="rbActive"
                    label="Active"
                    checked={master.active}
                    onChange={(e) => setField("active", e.target.checked)}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="rb-panel">
        <div className="rb-panel-hd">
          <span className="rb-dot" />Menu Mapping Preview
        </div>
        <div className="rb-panel-body rb-menu-preview">
          <span style={{ background: "#eef1f8", border: "1px solid var(--rb-line)", borderRadius: 4, padding: "3px 12px", fontWeight: 600, color: "var(--rb-top)" }}>
            MIS
          </span>
          <span style={{ color: "var(--rb-orange)", fontWeight: 700, margin: "0 8px" }}>→</span>
          <span style={{ background: "#eef1f8", border: "1px solid var(--rb-line)", borderRadius: 4, padding: "3px 12px", fontWeight: 600, color: "var(--rb-top)" }}>
            {reportHeadLabel}
          </span>
          <span style={{ color: "var(--rb-orange)", fontWeight: 700, margin: "0 8px" }}>→</span>
          <span style={{ background: "var(--rb-orange-soft)", border: "1px solid #f7c9a6", borderRadius: 4, padding: "3px 12px", fontWeight: 700, color: "#b24a08" }}>
            {master.reportName || "Untitled Report"}
          </span>
        </div>
      </div>
    </>
  );
};

export default ReportMasterTab;
