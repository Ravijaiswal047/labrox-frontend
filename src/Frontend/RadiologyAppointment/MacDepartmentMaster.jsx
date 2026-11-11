import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import Accordion from "../../components/UI/Accordion";
import Input from "../../components/formComponent/Input";
import { SaveButton, CustomButton } from "../../components/UI/CustomButton";
import Loading from "../../components/loader/Loading";
import { getMacDepartments, saveMacDepartment } from "./api";

const EMPTY_FORM = { departmentId: 0, departmentName: "", isActive: true };

const MacDepartmentMaster = () => {
  const [departments, setDepartments] = useState([]);
  const [form, setForm]               = useState(EMPTY_FORM);
  const [loading, setLoading]         = useState(false);
  const [saving, setSaving]           = useState(false);
  const [editId, setEditId]           = useState(null);

  useEffect(() => { loadDepartments(); }, []);

  const loadDepartments = async () => {
    setLoading(true);
    try {
      const res = await getMacDepartments();
      setDepartments(res?.data?.message || []);
    } catch {
      toast.error("Failed to load departments.");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!form.departmentName.trim()) {
      toast.warn("Department name is required.");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        departmentId:   form.departmentId,
        departmentName: form.departmentName.trim(),
        isActive:       form.isActive,
        action:         form.departmentId ? "update" : "add",
      };
      const res = await saveMacDepartment(payload);
      if (res?.data?.success) {
        toast.success(form.departmentId ? "Department updated." : "Department added.");
        resetForm();
        loadDepartments();
      } else {
        toast.error(res?.data?.message || "Failed to save department.");
      }
    } catch {
      toast.error("Something went wrong.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (dept) => {
    if (!window.confirm(`Delete "${dept.departmentName}"?`)) return;
    setSaving(true);
    try {
      const res = await saveMacDepartment({
        departmentId: dept.departmentId,
        action:       "delete",
      });
      if (res?.data?.success) {
        toast.success("Department deleted.");
        loadDepartments();
      } else {
        toast.error(res?.data?.message || "Failed to delete.");
      }
    } catch {
      toast.error("Something went wrong.");
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (dept) => {
    setForm({
      departmentId:   dept.departmentId,
      departmentName: dept.departmentName,
      isActive:       dept.isActive ?? true,
    });
    setEditId(dept.departmentId);
  };

  const resetForm = () => {
    setForm(EMPTY_FORM);
    setEditId(null);
  };

  return (
    <Accordion title="Mac Department Master" defaultValue={true}>
      {/* ── Form ─────────────────────────────────────────────────────────── */}
      <div
        className="p-3 mb-3 rounded"
        style={{ background: "#f0f7ff", border: "1px solid #bfdbfe" }}
      >
        <div className="row g-2 align-items-end">
          <div className="col-md-5">
            <Input
              id="MacDeptName"
              name="departmentName"
              lable="Department Name *"
              value={form.departmentName}
              onChange={(e) =>
                setForm((p) => ({ ...p, departmentName: e.target.value }))
              }
            />
          </div>

          <div className="col-md-2 d-flex align-items-center gap-2 pt-3">
            <input
              type="checkbox"
              id="MacDeptActive"
              checked={form.isActive}
              onChange={(e) =>
                setForm((p) => ({ ...p, isActive: e.target.checked }))
              }
              style={{ width: "16px", height: "16px", cursor: "pointer", accentColor: "#1e3a5f" }}
            />
            <label htmlFor="MacDeptActive" style={{ fontSize: "13px", margin: 0, cursor: "pointer" }}>
              Is Active
            </label>
          </div>

          <div className="col-md-auto d-flex gap-2">
            <SaveButton
              onClick={handleSave}
              disabled={saving}
              label={saving ? "Saving..." : editId ? "Update" : "Save"}
            />
            {editId && (
              <CustomButton
                text="Cancel"
                icon="cancel"
                variant="secondary"
                onClick={resetForm}
                disabled={saving}
              />
            )}
          </div>
        </div>
      </div>

      {/* ── Table ────────────────────────────────────────────────────────── */}
      {loading ? (
        <Loading />
      ) : (
        <div style={{ border: "1px solid #e2e8f0", borderRadius: "8px", overflow: "hidden" }}>
          <table className="table table-sm table-hover mb-0" style={{ fontSize: "13px" }}>
            <thead style={{ background: "linear-gradient(180deg,#1e3a5f,#2d5a8e)", color: "#fff" }}>
              <tr>
                <th style={{ padding: "8px 12px", width: "50px" }}>#</th>
                <th style={{ padding: "8px 12px" }}>Department Name</th>
                <th style={{ padding: "8px 12px", width: "90px", textAlign: "center" }}>Active</th>
                <th style={{ padding: "8px 12px", width: "120px", textAlign: "center" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {departments.length === 0 ? (
                <tr>
                  <td colSpan={4} className="text-center text-muted py-4" style={{ fontSize: "13px" }}>
                    No departments found. Add one above.
                  </td>
                </tr>
              ) : (
                departments.map((dept, idx) => (
                  <tr
                    key={dept.departmentId}
                    style={{
                      background: editId === dept.departmentId ? "#eff6ff" : idx % 2 === 0 ? "#fff" : "#f9fafb",
                    }}
                  >
                    <td style={{ padding: "7px 12px", color: "#64748b" }}>{idx + 1}</td>
                    <td style={{ padding: "7px 12px", fontWeight: "500", color: "#1e293b" }}>
                      {dept.departmentName}
                    </td>
                    <td style={{ padding: "7px 12px", textAlign: "center" }}>
                      <span
                        style={{
                          padding: "2px 8px",
                          borderRadius: "12px",
                          fontSize: "11px",
                          fontWeight: "600",
                          background: dept.isActive ? "#dcfce7" : "#fee2e2",
                          color:      dept.isActive ? "#15803d" : "#dc2626",
                        }}
                      >
                        {dept.isActive ? "Yes" : "No"}
                      </span>
                    </td>
                    <td style={{ padding: "7px 12px", textAlign: "center" }}>
                      <div className="d-flex gap-1 justify-content-center">
                        <button
                          onClick={() => handleEdit(dept)}
                          disabled={saving}
                          style={actionBtn("#dbeafe", "#1e40af")}
                          title="Edit"
                        >
                          ✎ Edit
                        </button>
                        <button
                          onClick={() => handleDelete(dept)}
                          disabled={saving}
                          style={actionBtn("#fee2e2", "#dc2626")}
                          title="Delete"
                        >
                          ✕
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </Accordion>
  );
};

const actionBtn = (bg, color) => ({
  padding: "2px 8px",
  fontSize: "11px",
  background: bg,
  color,
  border: `1px solid ${color}`,
  borderRadius: "4px",
  cursor: "pointer",
  fontWeight: "600",
  lineHeight: "1.6",
});

export default MacDepartmentMaster;
