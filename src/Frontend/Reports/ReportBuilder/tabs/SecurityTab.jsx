import React from "react";
import ReactSelect from "../../../../components/formComponent/ReactSelect";
import Input from "../../../../components/formComponent/Input";
import Checkbox from "../../../../components/formComponent/Checkbox";
import { securityScopes, frequencyOptions, scheduleFormatOptions } from "../reportBuilderData";

const roleCols = [
  { key: "view", label: "View" },
  { key: "export", label: "Export" },
  { key: "schedule", label: "Schedule" },
  { key: "drillDown", label: "Drill Down" },
];

const SecurityTab = ({
  securityRoles,
  onToggleRoleField,
  activeScope,
  setActiveScope,
  schedule,
  setScheduleField,
}) => {
  const currentScope = securityScopes.find((s) => s.id === activeScope);

  return (
    <>
      <div className="rb-panel">
        <div className="rb-panel-hd"><span className="rb-dot" />Report Permission</div>
        <div className="rb-panel-body">
          <div className="rb-sec-grid">
            <div className="rb-sec-list">
              {securityScopes.map((s) => (
                <div
                  key={s.id}
                  className={`rb-it${activeScope === s.id ? " on" : ""}`}
                  onClick={() => setActiveScope(s.id)}
                >
                  {s.label} <span className="rb-cnt">{s.count}</span>
                </div>
              ))}
            </div>
            <div>
              {activeScope === "role" ? (
                <div className="rb-grid-wrap">
                  <table className="rb-grid">
                    <thead>
                      <tr>
                        <th className="ctr" style={{ width: 60 }}>Allow</th>
                        <th>Role</th>
                        {roleCols.map((c) => (
                          <th key={c.key} className="ctr">{c.label}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {securityRoles.map((row) => (
                        <tr key={row.id}>
                          <td className="ctr">
                            <input
                              type="checkbox"
                              className="table-checkbox"
                              checked={row.allow}
                              onChange={() => onToggleRoleField(row.id, "allow")}
                            />
                          </td>
                          <td>{row.role}</td>
                          {roleCols.map((c) => (
                            <td key={c.key} className="ctr">
                              <input
                                type="checkbox"
                                className="table-checkbox"
                                checked={row[c.key]}
                                disabled={!row.allow}
                                onChange={() => onToggleRoleField(row.id, c.key)}
                              />
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="rb-warn">
                  {currentScope?.label} scope has {currentScope?.count} mapping(s) configured. Switch to "By Role" to edit permissions in this demo.
                </div>
              )}
              <div className="rb-warn">
                ⚠ User should only see authorized reports in the MIS menu.
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="rb-panel">
        <div className="rb-panel-hd"><span className="rb-dot" />Schedule (Auto Email)</div>
        <div className="rb-panel-body">
          <div className="rb-frm">
            <div className="rb-fg">
              <label>Enable Schedule</label>
              <div className="rb-inline-checks">
                <Checkbox
                  id="rbScheduleEnabled"
                  name="enabled"
                  label="Yes"
                  checked={schedule.enabled}
                  onChange={(name, checked) => setScheduleField(name, checked)}
                  removeSpacing
                />
              </div>
            </div>
            <div className="rb-fg">
              <label>Frequency</label>
              <ReactSelect
                id="rbScheduleFrequency"
                name="frequency"
                placeholderName="Select"
                dynamicOptions={frequencyOptions}
                value={schedule.frequency}
                onChange={(name, opt) => setScheduleField(name, opt?.value ?? "")}
                removeIsClearable
              />
            </div>
            <div className="rb-fg">
              <label>Time</label>
              <Input
                id="rbScheduleTime"
                name="time"
                type="text"
                value={schedule.time}
                onChange={(e) => setScheduleField("time", e.target.value)}
                removeFormGroupClass
              />
            </div>
            <div className="rb-fg">
              <label>Format</label>
              <ReactSelect
                id="rbScheduleFormat"
                name="format"
                placeholderName="Select"
                dynamicOptions={scheduleFormatOptions}
                value={schedule.format}
                onChange={(name, opt) => setScheduleField(name, opt?.value ?? "")}
                removeIsClearable
              />
            </div>
            <div className="rb-fg c2">
              <label>Recipients</label>
              <Input
                id="rbScheduleRecipients"
                name="recipients"
                type="text"
                value={schedule.recipients}
                onChange={(e) => setScheduleField("recipients", e.target.value)}
                removeFormGroupClass
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default SecurityTab;
