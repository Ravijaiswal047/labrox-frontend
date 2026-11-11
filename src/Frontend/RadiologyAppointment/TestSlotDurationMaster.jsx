import React, { useEffect, useRef, useState } from "react";
import * as XLSX from "xlsx";
import { toast } from "react-toastify";
import { Dialog } from "primereact/dialog";
import Loading from "../../components/loader/Loading";
import Input from "../../components/formComponent/Input";
import ReactSelect from "../../components/formComponent/ReactSelect";
import Tables from "../../components/UI/customTable";
import { SaveButton, CustomButton } from "../../components/UI/CustomButton";
import { axiosInstance } from "../../utils/axiosInstance";
import { useLocalStorage } from "../../utils/hooks/useLocalStorage";
import MultiSelectComp from "../../components/formComponent/MultiSelectComp";
import {
  getRadiologyDepartments,
  getTestSlotDurations,
  getTestSlotDurationTemplate,
  saveTestSlotDuration,
  removeTestSlotDuration,
  importTestSlotDurations,
  getMachinesByDepartment,
  getSlotMaster,
} from "./api";

// How many multiples of the resolved machine slot-gap to offer, e.g. a
// 30-min gap → 30, 60, 90 ... up to this many steps.
const MAX_SLOT_MULTIPLES = 8;

// Per-test scan duration, independent of a machine's own base slot interval
// (Machine & Slot Master tab) — e.g. an MRI machine runs a 15-min grid, but
// "MRI BRAIN" specifically needs 60 min (4 slots), while "MRI SPINE" only
// needs 30 (2 slots). See backend-docs/backend-radiology-test-slot-duration.md
// for the full contract and the open question on whether duration should be
// scoped per (machine, test) instead of globally per test — this ships
// against the simpler global-per-test version described in that doc.
const EMPTY_FORM = { investigationId: 0, testCode: "", testName: "", durationMinutes: "" };

const TestSlotDurationMaster = () => {
  const theme = useLocalStorage("theme", "get");
  const [departments, setDepartments] = useState([]);
  const [selectedDepartmentIds, setSelectedDepartmentIds] = useState([]);
  const [exportingTemplate, setExportingTemplate] = useState(false);
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [removingId, setRemovingId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [testSearchText, setTestSearchText] = useState("");
  const [testSuggestions, setTestSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchDebounce = useRef(null);

  // Resolved from whichever test is currently picked (see resolveSlotGap) —
  // null until known, which falls back to a plain number input so entry
  // isn't blocked for a test whose department/machine isn't set up yet.
  const [slotGapMinutes, setSlotGapMinutes] = useState(null);
  const [resolvingGap, setResolvingGap] = useState(false);

  // Bulk import modal
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [importFileName, setImportFileName] = useState("");
  const [importRows, setImportRows] = useState([]);
  const [importSaving, setImportSaving] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    loadDepartments();
    loadDurations();
  }, []);

  const normalizeIds = (list) =>
    (list || [])
      .map((item) => (typeof item === "object" ? item.value : item))
      .filter((id) => id !== "" && id !== null && id !== undefined)
      .map((id) => Number(id));

  const loadDepartments = async () => {
    try {
      const res = await getRadiologyDepartments();
      const list = (res?.data?.message || []).map((d) => ({
        label: d.Department ?? d.department ?? d.DepartmentName,
        value: d.DepartmentID ?? d.departmentID ?? d.DepartmentId,
      }));
      setDepartments(list);
    } catch {
      toast.error("Failed to load Radiology departments.");
    }
  };

  const loadDurations = async () => {
    setLoading(true);
    try {
      const res = await getTestSlotDurations();
      setRows(res?.data?.message || []);
    } catch {
      toast.error("Failed to load test slot durations.");
      setRows([]);
    } finally {
      setLoading(false);
    }
  };

  // Same DepartmentWiseItemList search Welcome.jsx / ResultEntryRadiology.jsx
  // already use for a plain investigation-name search — no rate/centre
  // context needed here since duration is a pure master value.
  const searchTests = (val) => {
    setTestSearchText(val);
    setForm((p) => ({ ...p, investigationId: 0, testName: val }));
    clearTimeout(searchDebounce.current);
    if (val.trim().length < 2) {
      setTestSuggestions([]);
      setShowSuggestions(false);
      return;
    }
    searchDebounce.current = setTimeout(() => {
      axiosInstance
        .post("CommonController/DepartmentWiseItemList", {
          DepartmentID: "",
          DepartmentIDs: normalizeIds(
            selectedDepartmentIds.length ? selectedDepartmentIds : departments.map((d) => d.value)
          ),
          TestName: val,
        })
        .then((res) => {
          const list = Array.isArray(res?.data?.message) ? res.data.message : [];
          setTestSuggestions(list);
          setShowSuggestions(true);
        })
        .catch(() => setTestSuggestions([]));
    }, 300);
  };

  // The department's own machine(s) are Centre+Department scoped (Machine &
  // Slot Master), but this screen has no Centre selector — the logged-in
  // user's default centre is used to resolve them, same as other masters
  // default to it rather than asking again. Uses the first active machine
  // when a department has more than one.
  const resolveSlotGapForDept = async (deptId) => {
    if (!deptId) { setSlotGapMinutes(null); return; }
    setResolvingGap(true);
    try {
      const centreId = useLocalStorage("userData", "get")?.DefaultCentre;
      const machinesRes = await getMachinesByDepartment({ DepartmentId: deptId, CentreId: centreId });
      const machinesData = machinesRes?.data?.message ?? machinesRes?.data;
      const machines = (Array.isArray(machinesData) ? machinesData : machinesData ? [machinesData] : [])
        .filter((m) => (m.isActive ?? m.IsActive) !== false);
      const machineId = machines[0]?.machineId ?? machines[0]?.MachineId;
      if (!machineId) { setSlotGapMinutes(null); return; }

      const slotRes = await getSlotMaster({ CentreId: centreId, DepartmentId: deptId, MachineId: machineId });
      const slotRows = slotRes?.data?.message;
      const avg = Array.isArray(slotRows) && slotRows.length > 0
        ? Number(slotRows.find((s) => s.AvgTime ?? s.avgTime)?.AvgTime ?? slotRows[0]?.AvgTime ?? slotRows[0]?.avgTime)
        : null;
      setSlotGapMinutes(avg > 0 ? avg : null);
    } catch {
      setSlotGapMinutes(null);
    } finally {
      setResolvingGap(false);
    }
  };

  // Investigation search results don't reliably carry a department field
  // across every caller of DepartmentWiseItemList in this codebase — try the
  // common variants first, and if none are present (editing a row, which
  // only ever has investigationId/testName — see GetTestSlotDurationMaster),
  // fall back to searching for this exact test by name to recover it.
  const resolveDeptForTest = async (investigationId, testName, item) => {
    const directDeptId =
      item?.DepartmentID ?? item?.DepartmentId ?? item?.departmentId ?? item?.departmentID;
    if (directDeptId) {
      resolveSlotGapForDept(directDeptId);
      return;
    }
    if (!testName) { setSlotGapMinutes(null); return; }
    try {
      const res = await axiosInstance.post("CommonController/DepartmentWiseItemList", {
        DepartmentID: "",
        TestName: testName,
      });
      const list = Array.isArray(res?.data?.message) ? res.data.message : [];
      const match = list.find(
        (t) => String(t.InvestigationID ?? t.investigationId) === String(investigationId),
      ) || list[0];
      const deptId = match?.DepartmentID ?? match?.DepartmentId ?? match?.departmentId ?? match?.departmentID;
      resolveSlotGapForDept(deptId);
    } catch {
      setSlotGapMinutes(null);
    }
  };

  const pickTest = (item) => {
    const investigationId = item.InvestigationID ?? item.investigationId;
    setForm((p) => ({
      ...p,
      investigationId,
      testName: item.TestName ?? item.testName,
      testCode: item.TestCode ?? item.testCode ?? p.testCode,
      durationMinutes: "",
    }));
    setTestSearchText(item.TestName ?? item.testName ?? "");
    setShowSuggestions(false);
    resolveDeptForTest(investigationId, item.TestName ?? item.testName, item);
  };

  const resetForm = () => {
    setForm(EMPTY_FORM);
    setTestSearchText("");
    setTestSuggestions([]);
    setShowSuggestions(false);
    setSlotGapMinutes(null);
  };

  const handleEdit = (row) => {
    const investigationId = row.investigationId ?? row.InvestigationId;
    const testName = row.testName ?? row.TestName ?? "";
    setForm({
      investigationId,
      testCode: row.testCode ?? row.TestCode ?? "",
      testName,
      durationMinutes: row.durationMinutes ?? row.DurationMinutes ?? "",
    });
    setTestSearchText(testName);
    setSlotGapMinutes(null);
    resolveDeptForTest(investigationId, testName, row);
  };

  const handleRemove = async (row) => {
    const investigationId = row.investigationId ?? row.InvestigationId;
    const testName = row.testName ?? row.TestName ?? "this test";
    if (!investigationId) return;
    if (!window.confirm(`Remove duration for "${testName}"?`)) return;
    setRemovingId(investigationId);
    try {
      const res = await removeTestSlotDuration({ investigationId });
      if (res?.data?.success !== false) {
        toast.success(res?.data?.message || "Removed.");
        if ((form.investigationId || 0) === investigationId) resetForm();
        loadDurations();
      } else {
        toast.error(res?.data?.message || "Remove failed.");
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || "Remove failed.");
    } finally {
      setRemovingId(null);
    }
  };

  const handleExportTemplate = async () => {
    const departmentIds = normalizeIds(selectedDepartmentIds);
    if (departmentIds.length === 0) {
      toast.warn("Select one or more Radiology departments to export the template.");
      return;
    }
    setExportingTemplate(true);
    try {
      const res = await getTestSlotDurationTemplate({ departmentIds });
      const data = res?.data?.message;
      if (res?.data?.success === false || !Array.isArray(data) || data.length === 0) {
        toast.error(typeof data === "string" ? data : res?.data?.message || "No investigations found.");
        return;
      }
      const excelRows = data.map((row) => ({
        Department: row.department ?? row.Department ?? "",
        InvestigationId: row.investigationId ?? row.InvestigationId ?? "",
        TestCode: row.testCode ?? row.TestCode ?? "",
        TestName: row.testName ?? row.TestName ?? "",
        "Duration(Mins)": (row.durationMinutes ?? row.DurationMinutes) || "",
      }));
      const worksheet = XLSX.utils.json_to_sheet(excelRows, {
        header: ["Department", "InvestigationId", "TestCode", "TestName", "Duration(Mins)"],
      });
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "TestSlotDuration");
      XLSX.writeFile(workbook, `TestSlotDurationTemplate_${Date.now()}.xlsx`);
      toast.success("Template exported.");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to export template.");
    } finally {
      setExportingTemplate(false);
    }
  };

  const handleSave = async () => {
    if (!form.investigationId) {
      toast.warn("Search and pick a test first.");
      return;
    }
    const duration = Number(form.durationMinutes);
    if (!duration || duration <= 0) {
      toast.warn("Enter a valid duration in minutes.");
      return;
    }
    setSaving(true);
    try {
      const res = await saveTestSlotDuration({
        investigationId: form.investigationId,
        testCode: form.testCode || "",
        testName: form.testName,
        durationMinutes: duration,
      });
      if (res?.data?.success !== false) {
        toast.success(res?.data?.message || "Saved.");
        resetForm();
        loadDurations();
      } else {
        toast.error(res?.data?.message || "Save failed.");
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || "Save failed.");
    } finally {
      setSaving(false);
    }
  };

  // ── Bulk import — same client-parse-then-preview-then-save shape used for
  // Investigations.jsx's Sample Type import, minus the file-vs-JSON question
  // that one ran into: this posts a plain JSON array of
  // { testCode, testName, durationMinutes } until told otherwise. See the
  // backend-docs note on this.
  const handleImportFile = (e) => {
    const file = e?.target?.files?.[0];
    if (!file) return;
    setImportFileName(file.name);

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const data = new Uint8Array(evt.target.result);
        const workbook = XLSX.read(data, { type: "array" });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(sheet, { defval: "" });

        const parsed = jsonData
          .map((row) => ({
            investigationId: Number(
              row.InvestigationId ?? row.investigationId ?? row.InvestigationID ?? 0
            ),
            department: (row.Department ?? row.department ?? "").toString().trim(),
            testCode: (row.TestCode ?? row.testCode ?? "").toString().trim(),
            testName: (row.TestName ?? row.testName ?? "").toString().trim(),
            durationMinutes: Number(
              row["Duration(Mins)"] ??
                row["Duration (Mins)"] ??
                row.durationMinutes ??
                row.DurationMinutes ??
                row.timing ??
                row.Timing ??
                0
            ),
          }))
          .filter((row) =>
            row.durationMinutes > 0 &&
            (row.investigationId > 0 || row.testCode || row.testName)
          );

        if (parsed.length === 0) {
          toast.error("No valid rows found — need InvestigationId/TestCode/TestName and a positive Duration(Mins).");
          if (fileInputRef.current) fileInputRef.current.value = null;
          setImportFileName("");
          return;
        }
        setImportRows(parsed);
      } catch {
        toast.error("Failed to parse Excel file.");
        if (fileInputRef.current) fileInputRef.current.value = null;
        setImportFileName("");
      }
    };
    reader.onerror = () => toast.error("Unable to read file");
    reader.readAsArrayBuffer(file);
  };

  const handleImportSave = async () => {
    setImportSaving(true);
    try {
      const res = await importTestSlotDurations(importRows);
      const msg = res?.data?.message;
      toast.success(
        typeof msg === "string"
          ? msg
          : `Imported ${msg?.imported ?? importRows.length} row(s)${msg?.skipped ? `, skipped ${msg.skipped}` : ""}.`
      );
      closeImportDialog();
      loadDurations();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Import failed.");
    } finally {
      setImportSaving(false);
    }
  };

  const closeImportDialog = () => {
    setShowImportDialog(false);
    setImportRows([]);
    setImportFileName("");
    if (fileInputRef.current) fileInputRef.current.value = null;
  };

  return (
    <div className="card patient_registration_card open" style={{ padding: "14px" }}>
      <div className="card-header mb-2 d-flex justify-content-between align-items-center" style={{ padding: 0, border: "none" }}>
        <h4 className="card-title w-100 mb-0">
          <label className="text-nowrap m-0">Test Slot Duration Master</label>
        </h4>
        <div className="d-flex gap-2">
          <CustomButton
            text={"Export Template"}
            icon="excel"
            onClick={handleExportTemplate}
            loading={exportingTemplate}
            className="mr-2"
          />
          <CustomButton text={"Bulk Upload"} icon="upload" onClick={() => setShowImportDialog(true)} />
        </div>
      </div>

      {/* Add / edit form */}
      <div className="row g-2 mb-3 align-items-end" style={{ position: "relative" }}>
        <div className="col-md-3">
          <MultiSelectComp
            id="TSD_Department"
            name="departmentIds"
            label="Department"
            options={departments}
            value={selectedDepartmentIds}
            onChange={(name, value) => setSelectedDepartmentIds(value || [])}
          />
        </div>
        <div className="col-md-3" style={{ position: "relative" }}>
          <Input
            type="text"
            name="testSearch"
            lable="Test Name"
            placeholder=" "
            value={testSearchText}
            onChange={(e) => searchTests(e.target.value)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
          />
          {showSuggestions && testSuggestions.length > 0 && (
            <ul className="suggestion-data" style={{ zIndex: 99 }}>
              {testSuggestions.map((item, idx) => (
                <li key={idx} onClick={() => pickTest(item)}>
                  {(item.TestCode ?? item.testCode)
                    ? `${item.TestCode ?? item.testCode} - ${item.TestName ?? item.testName}`
                    : (item.TestName ?? item.testName)}
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="col-md-2">
          <Input
            type="text"
            name="testCode"
            lable="Test Code"
            placeholder=" "
            value={form.testCode}
            onChange={(e) => setForm((p) => ({ ...p, testCode: e.target.value }))}
          />
        </div>
        <div className="col-md-2">
          {slotGapMinutes > 0 ? (
            <>
              <ReactSelect
                id="TSD_Duration"
                name="durationMinutes"
                placeholderName="Duration (minutes)"
                removeIsClearable
                dynamicOptions={(() => {
                  const options = Array.from({ length: MAX_SLOT_MULTIPLES }, (_, i) => {
                    const v = slotGapMinutes * (i + 1);
                    return { value: v, label: `${v} min` };
                  });
                  const current = Number(form.durationMinutes);
                  if (current > 0 && !options.some((o) => o.value === current)) {
                    options.push({ value: current, label: `${current} min` });
                    options.sort((a, b) => a.value - b.value);
                  }
                  return options;
                })()}
                value={form.durationMinutes}
                onChange={(name, option) =>
                  setForm((p) => ({ ...p, durationMinutes: option?.value || "" }))
                }
              />
              <div style={{ fontSize: "11px", color: "#64748b", marginTop: "2px" }}>
                Multiples of this machine's {slotGapMinutes}-min slot gap
              </div>
            </>
          ) : (
            <>
              <Input
                type="number"
                name="durationMinutes"
                lable="Duration (minutes)"
                placeholder={resolvingGap ? "Checking machine slot gap..." : " "}
                value={form.durationMinutes}
                onChange={(e) => setForm((p) => ({ ...p, durationMinutes: e.target.value }))}
                disabled={resolvingGap}
              />
              {!resolvingGap && form.investigationId > 0 && (
                <div style={{ fontSize: "11px", color: "#94a3b8", marginTop: "2px" }}>
                  Couldn't find this test's department/machine — enter manually.
                </div>
              )}
            </>
          )}
        </div>
        <div className="col-md-2 d-flex gap-2">
          <SaveButton text={"Save"} onClick={handleSave} loading={saving} disabled={saving} />
          <CustomButton text={"Clear"} variant="secondary" onClick={resetForm} className="ml-2" />
        </div>
      </div>

      {/* List */}
      {loading ? (
        <Loading />
      ) : rows.length === 0 ? (
        <div className="text-center text-muted py-5" style={{ fontSize: "13px" }}>
          No test slot durations configured yet.
        </div>
      ) : (
        <Tables>
          <thead>
            <tr>
              <th>Department</th>
              <th>InvestigationId</th>
              <th>TestCode</th>
              <th>TestName</th>
              <th>Duration(Mins)</th>
              <th>AddedBy</th>
              <th>AddedDate</th>
              <th>Remove</th>
              <th>Edit</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, idx) => {
              const investigationId = row.investigationId ?? row.InvestigationId;
              return (
                <tr key={investigationId ?? idx}>
                  <td>{row.department ?? row.Department}</td>
                  <td>{investigationId}</td>
                  <td>{row.testCode ?? row.TestCode}</td>
                  <td>{row.testName ?? row.TestName}</td>
                  <td>{row.durationMinutes ?? row.DurationMinutes}</td>
                  <td>{row.addedBy ?? row.AddedBy}</td>
                  <td>{row.addedDate ?? row.AddedDate}</td>
                  <td>
                    <CustomButton
                      text={"Remove"}
                      icon="delete"
                      size="sm"
                      onClick={() => handleRemove(row)}
                      loading={removingId === investigationId}
                      disabled={removingId === investigationId}
                    />
                  </td>
                  <td>
                    <CustomButton text={"Edit"} icon="edit" size="sm" onClick={() => handleEdit(row)} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </Tables>
      )}

      {/* Bulk import dialog */}
      <Dialog
        header={"Bulk Upload Test Slot Durations"}
        visible={showImportDialog}
        onHide={closeImportDialog}
        style={{ width: "60vw" }}
        className={theme}
        modal
      >
        <div className="row align-items-center">
          <div className="col-auto my-1">
            <CustomButton
              text={"Choose Excel File"}
              icon="upload"
              onClick={() => fileInputRef.current?.click()}
            />
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx, .xls"
              style={{ display: "none" }}
              onChange={handleImportFile}
            />
            {importFileName && <span className="ms-2">{importFileName}</span>}
          </div>
          <div className="col-auto my-1 text-muted" style={{ fontSize: "12px" }}>
            Columns: Department, InvestigationId, TestCode, TestName, Duration(Mins)
          </div>
        </div>

        {importRows.length > 0 && (
          <div className="row p-2">
            <div className="col-12">
              <div style={{ fontWeight: 700, marginBottom: "8px" }}>
                Total Records: {importRows.length}
              </div>
              <Tables>
                <thead>
                  <tr>
                    <th>Department</th>
                    <th>InvestigationId</th>
                    <th>TestCode</th>
                    <th>TestName</th>
                    <th>Duration(Mins)</th>
                  </tr>
                </thead>
                <tbody>
                  {importRows.map((row, idx) => (
                    <tr key={idx}>
                      <td>{row.department}</td>
                      <td>{row.investigationId || ""}</td>
                      <td>{row.testCode}</td>
                      <td>{row.testName}</td>
                      <td>{row.durationMinutes}</td>
                    </tr>
                  ))}
                </tbody>
              </Tables>
            </div>
            <div className="col-12 mt-2 d-flex justify-content-end">
              <SaveButton
                text={"Save Data"}
                onClick={handleImportSave}
                loading={importSaving}
                disabled={importSaving}
              />
            </div>
          </div>
        )}
      </Dialog>
    </div>
  );
};

export default TestSlotDurationMaster;
